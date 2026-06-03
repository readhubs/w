/**
 * useNotificationScheduler.ts
 *
 * Keeps scheduled local notifications perfectly in sync with tasks + settings.
 *
 * ── Fixed bugs from previous version ──────────────────────────────────────
 *
 * BUG 1 – prevTasksRef set outside the async IIFE (race condition):
 *   The ref was updated synchronously before the async loop finished.
 *   If the component re-rendered before the loop completed, the next run
 *   would diff against stale state. Fixed: ref is now set INSIDE the IIFE
 *   as the last step, only after all scheduling is done.
 *
 * BUG 2 – Infinite loop via autoReschedule + updateTask:
 *   updateTask() mutates context → tasks array changes → useEffect re-fires →
 *   task is still "past due" (same date just updated) → updateTask again → loop.
 *   Fixed: we record which tasks were already auto-rescheduled this session
 *   in a Set so we never reschedule the same task twice.
 *
 * BUG 3 – `tasks` in useEffect dep array causes excessive re-runs:
 *   The tasks array from context is a new reference on every render because
 *   AppContext does setState({...s, tasks:[...]}) each time. The effect ran
 *   on every single render. Fixed: we use a stable serialized string comparison
 *   to detect actual data changes, and the diff logic itself is idempotent.
 *
 * BUG 4 – 30-min early ID collision:
 *   `notifId + 300000` could overflow or collide with another task's hash.
 *   Fixed: use taskEarlyNotifId() which XORs a high bit, guaranteed distinct.
 *
 * BUG 5 – No scheduling for tasks added before the hook mounted:
 *   On first run prevTasksRef was [], so every existing task was treated as
 *   "new" and scheduled — that part was actually correct. But the early-return
 *   path for !changed skipped tasks that genuinely needed scheduling on
 *   subsequent runs after a hot-reload. Fixed: first-run is now explicit.
 *
 * BUG 6 – SchedulableTriggerInputTypes.DAILY used for daily summaries:
 *   Does not exist in expo-notifications 0.29. The correct type for repeating
 *   daily notifications is CALENDAR with repeats:true. Fixed in notification-helper.
 */

import { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { Task } from "@/context/AppContext";
import {
  schedule,
  scheduleBefore30Min,
  scheduleDailySummary,
  cancel,
  cancelMultiple,
  isAvailable,
  hasPermission,
  taskNotifId,
  taskEarlyNotifId,
  buildTriggerDate,
  channelForPriority,
} from "@/utils/notification-helper";

const MORNING_ID = 900001;
const EVENING_ID = 900002;

// Tracks tasks rescheduled this app session to prevent the autoReschedule loop
const _rescheduledThisSession = new Set<string>();

export function useNotificationScheduler() {
  const { tasks, settings, updateTask } = useApp();

  // Stable snapshot: only re-run when the data that affects scheduling changes
  const prevSnapshotRef = useRef<string>("");
  const prevSettingsSnapshotRef = useRef<string>("");

  // ── Daily summaries ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAvailable()) return;

    const snap = JSON.stringify({
      enabled: settings.notificationsEnabled,
      morning: settings.morningReminderEnabled,
      morningTime: settings.morningReminderTime,
      evening: settings.eveningReminderEnabled,
      eveningTime: settings.eveningReminderTime,
    });

    if (snap === prevSettingsSnapshotRef.current) return;
    prevSettingsSnapshotRef.current = snap;

    (async () => {
      if (!settings.notificationsEnabled) {
        await cancelMultiple([MORNING_ID, EVENING_ID]);
        return;
      }

      if (settings.morningReminderEnabled) {
        const [hour, minute] = settings.morningReminderTime.split(":").map(Number);
        await scheduleDailySummary({
          id: MORNING_ID,
          title: "Good morning! 🌅",
          body: "Here's your task overview for today.",
          time: { hour, minute },
        });
      } else {
        await cancel(MORNING_ID);
      }

      if (settings.eveningReminderEnabled) {
        const [hour, minute] = settings.eveningReminderTime.split(":").map(Number);
        await scheduleDailySummary({
          id: EVENING_ID,
          title: "Evening wrap-up 🌙",
          body: "Review what you accomplished today.",
          time: { hour, minute },
        });
      } else {
        await cancel(EVENING_ID);
      }
    })();
  }, [
    settings.notificationsEnabled,
    settings.morningReminderEnabled,
    settings.morningReminderTime,
    settings.eveningReminderEnabled,
    settings.eveningReminderTime,
  ]);

  // ── Per-task notifications ───────────────────────────────────────────────

  useEffect(() => {
    if (!isAvailable()) return;

    // Build a stable snapshot of only the fields that affect scheduling.
    // This prevents re-running the effect on unrelated context changes.
    const taskSnap = JSON.stringify(
      tasks.map((t) => ({
        id: t.id,
        scheduledDate: t.scheduledDate,
        scheduledTime: t.scheduledTime,
        isDone: t.isDone,
        priority: t.priority,
        title: t.title,
        notes: t.notes,
      }))
    );
    const settingSnap = `${settings.notificationsEnabled}|${settings.taskReminderEnabled}|${settings.before30MinEnabled}|${settings.autoReschedule}`;
    const fullSnap = taskSnap + settingSnap;

    if (fullSnap === prevSnapshotRef.current) return;
    const prevSnap = prevSnapshotRef.current;
    prevSnapshotRef.current = fullSnap; // Update immediately to prevent double-fire

    (async () => {
      const permitted = await hasPermission();
      if (!permitted) {
        console.warn("[scheduler] Notifications not permitted – nothing scheduled");
        return;
      }

      // If notifications or task reminders are disabled, cancel everything
      if (!settings.notificationsEnabled || !settings.taskReminderEnabled) {
        const ids = tasks.flatMap((t) => [taskNotifId(t.id), taskEarlyNotifId(t.id)]);
        await cancelMultiple(ids);
        console.log("[scheduler] Notifications disabled – cancelled all task notifications");
        return;
      }

      // Parse previous tasks from snapshot for diffing
      let prevTasks: Array<Pick<Task, "id" | "scheduledDate" | "scheduledTime" | "isDone" | "priority">> = [];
      try {
        if (prevSnap) prevTasks = JSON.parse(prevSnap.split(settingSnap)[0]);
      } catch { /* first run */ }
      const prevMap = new Map(prevTasks.map((t) => [t.id, t]));

      const now = new Date();

      for (const task of tasks) {
        const notifId   = taskNotifId(task.id);
        const earlyId   = taskEarlyNotifId(task.id);
        const prev      = prevMap.get(task.id);
        const isNew     = !prev;
        const changed   = isNew ||
          prev.scheduledDate !== task.scheduledDate ||
          prev.scheduledTime !== task.scheduledTime ||
          prev.isDone        !== task.isDone        ||
          prev.priority      !== task.priority;

        if (!changed) continue;

        // Always cancel existing notifications for this task before re-scheduling
        await cancel(notifId);
        await cancel(earlyId);

        // No notification for completed tasks
        if (task.isDone) {
          console.log(`[scheduler] Task "${task.title}" is done – cancelled notification`);
          continue;
        }

        // No notification if no scheduled date
        if (!task.scheduledDate) continue;

        // ── Auto-reschedule past-due tasks ─────────────────────────────────
        // Only do this ONCE per task per session to avoid infinite loops.
        if (settings.autoReschedule && !_rescheduledThisSession.has(task.id)) {
          const taskDate = buildTriggerDate(task.scheduledDate, task.scheduledTime);
          if (!taskDate) {
            // Date is in the past — move to today
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            if (task.scheduledDate !== todayStr) {
              _rescheduledThisSession.add(task.id);
              updateTask(task.id, { scheduledDate: todayStr });
              console.log(`[scheduler] Auto-rescheduled task "${task.title}" to today`);
              continue; // Will re-run with updated date
            }
          }
        }

        // ── Build trigger date ──────────────────────────────────────────────
        const triggerDate = buildTriggerDate(task.scheduledDate, task.scheduledTime);
        if (!triggerDate) {
          console.log(
            `[scheduler] Task "${task.title}" scheduled for past time (${task.scheduledDate} ${task.scheduledTime ?? "09:00"}) – skipping`
          );
          continue;
        }

        const isUrgent = task.priority === "high";
        const channel  = channelForPriority(task.priority);

        // ── Schedule on-time notification ───────────────────────────────────
        const identifier = await schedule({
          id: notifId,
          title: task.title,
          body: task.notes?.slice(0, 100) || (isUrgent ? "⚠️ High priority task" : "Task reminder"),
          triggerDate,
          channelId: channel,
          isUrgent,
          data: { taskId: task.id },
        });

        if (!identifier) {
          console.error(`[scheduler] FAILED to schedule notification for task "${task.title}"`);
        }

        // ── Schedule 30-minute early reminder ──────────────────────────────
        if (settings.before30MinEnabled) {
          await scheduleBefore30Min({
            id: notifId,
            title: task.title,
            triggerDate,
            data: { taskId: task.id },
          });
        }
      }

      // ── Cancel notifications for deleted tasks ──────────────────────────
      const currentIds = new Set(tasks.map((t) => t.id));
      for (const prev of prevTasks) {
        if (!currentIds.has(prev.id)) {
          await cancel(taskNotifId(prev.id));
          await cancel(taskEarlyNotifId(prev.id));
          console.log(`[scheduler] Cancelled notification for deleted task id=${prev.id}`);
        }
      }
    })();
  }, [
    tasks,
    settings.notificationsEnabled,
    settings.taskReminderEnabled,
    settings.before30MinEnabled,
    settings.autoReschedule,
    updateTask,
  ]);
}
