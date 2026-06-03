/**
 * useNotificationScheduler
 *
 * Reacts to task/settings changes and keeps scheduled local notifications
 * in sync using notification-helper.js (Capacitor LocalNotifications abstraction).
 *
 * Features:
 *  - Schedules notifications for tasks with scheduledDate/scheduledTime
 *  - Respects settings (notificationsEnabled, taskReminderEnabled,
 *    morningReminderEnabled, eveningReminderEnabled, before30MinEnabled,
 *    soundEnabled, vibrationEnabled, autoReschedule)
 *  - Routes high-priority tasks to the 'urgent_tasks' channel
 *  - Routes daily summaries to the 'daily_summary' channel
 *  - Cancels notifications for deleted/completed tasks
 *  - Auto-reschedules past-due tasks when autoReschedule is enabled
 */

import { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { Task } from "@/context/AppContext";
import {
  schedule,
  scheduleBefore30Min,
  scheduleDailySummary,
  cancel,
  cancelAll,
  isAvailable,
  hasPermission,
  taskNotifId,
  buildTriggerDate,
  channelForPriority,
  CHANNELS,
} from "@/utils/notification-helper";

const MORNING_NOTIF_ID = 900001;
const EVENING_NOTIF_ID = 900002;

export function useNotificationScheduler() {
  const { tasks, settings, updateTask } = useApp();
  const prevTasksRef = useRef<Task[]>([]);

  // --------------------------------------------------------------------------
  // Daily summaries (morning + evening)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isAvailable()) return;

    (async () => {
      if (!settings.notificationsEnabled) {
        await cancelAll([MORNING_NOTIF_ID, EVENING_NOTIF_ID]);
        return;
      }

      if (settings.morningReminderEnabled) {
        const [hour, minute] = settings.morningReminderTime.split(":").map(Number);
        await scheduleDailySummary({
          id: MORNING_NOTIF_ID,
          title: "Good morning! 🌅",
          body: "Here's your task overview for today.",
          time: { hour, minute },
        });
      } else {
        await cancel(MORNING_NOTIF_ID);
      }

      if (settings.eveningReminderEnabled) {
        const [hour, minute] = settings.eveningReminderTime.split(":").map(Number);
        await scheduleDailySummary({
          id: EVENING_NOTIF_ID,
          title: "Evening wrap-up 🌙",
          body: "Review what you accomplished today.",
          time: { hour, minute },
        });
      } else {
        await cancel(EVENING_NOTIF_ID);
      }
    })();
  }, [
    settings.notificationsEnabled,
    settings.morningReminderEnabled,
    settings.morningReminderTime,
    settings.eveningReminderEnabled,
    settings.eveningReminderTime,
  ]);

  // --------------------------------------------------------------------------
  // Per-task notifications
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isAvailable()) return;
    if (!settings.notificationsEnabled || !settings.taskReminderEnabled) {
      // Cancel all task notifications when disabled
      const ids = tasks.flatMap((t) => [taskNotifId(t.id), taskNotifId(t.id) + 300000]);
      cancelAll(ids);
      prevTasksRef.current = tasks;
      return;
    }

    (async () => {
      const permitted = await hasPermission();
      if (!permitted) return;

      const prev = prevTasksRef.current;
      const prevMap = new Map(prev.map((t) => [t.id, t]));
      const now = new Date();

      for (const task of tasks) {
        const notifId = taskNotifId(task.id);
        const prevTask = prevMap.get(task.id);
        const changed =
          !prevTask ||
          prevTask.scheduledDate !== task.scheduledDate ||
          prevTask.scheduledTime !== task.scheduledTime ||
          prevTask.isDone !== task.isDone ||
          prevTask.priority !== task.priority;

        if (!changed) continue;

        // Cancel existing notification for this task
        await cancel(notifId);
        await cancel(notifId + 300000); // 30-min early

        if (task.isDone) continue; // No notification for done tasks

        // Auto-reschedule: if the task is past-due and setting is on, move it
        if (settings.autoReschedule && task.scheduledDate) {
          const taskDate = new Date(`${task.scheduledDate}T${task.scheduledTime ?? "09:00"}:00`);
          if (taskDate < now && !task.isDone) {
            const todayStr = now.toISOString().split("T")[0];
            updateTask(task.id, { scheduledDate: todayStr });
            continue; // Will re-fire on next render with updated date
          }
        }

        const triggerDate = buildTriggerDate(task.scheduledDate, task.scheduledTime);
        if (!triggerDate) continue;

        const channel = channelForPriority(task.priority);
        const isUrgent = task.priority === "high";

        await schedule({
          id: notifId,
          title: task.title,
          body: task.notes
            ? task.notes.slice(0, 80)
            : isUrgent
            ? "⚠️ High priority task due now"
            : "Task reminder",
          triggerDate,
          channel,
          isUrgent,
          data: { taskId: task.id },
        });

        if (settings.before30MinEnabled) {
          await scheduleBefore30Min({
            id: notifId,
            title: task.title,
            triggerDate,
            data: { taskId: task.id },
          });
        }
      }

      // Cancel notifications for tasks that were removed
      for (const prev of prevTasksRef.current) {
        if (!tasks.find((t) => t.id === prev.id)) {
          await cancel(taskNotifId(prev.id));
          await cancel(taskNotifId(prev.id) + 300000);
        }
      }

      prevTasksRef.current = tasks;
    })();
  }, [
    tasks,
    settings.notificationsEnabled,
    settings.taskReminderEnabled,
    settings.before30MinEnabled,
    settings.autoReschedule,
  ]);
}
