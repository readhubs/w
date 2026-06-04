import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useApp } from "@/context/AppContext";
import type { Task, ProjectTask, Settings } from "@/context/AppContext";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function scheduleAll(
  tasks: Task[],
  projectTasks: ProjectTask[],
  settings: Settings
) {
  if (Platform.OS === "web") return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.notificationsEnabled) return;

    const now = new Date();
    const todayStr = toDateStr(now);

    // a. Task at scheduled time & b. 30-min before task
    if (settings.taskReminderEnabled || settings.before30MinEnabled) {
      const allItems = [
        ...tasks.filter((t) => !t.isDone && t.scheduledDate && t.scheduledTime),
        ...projectTasks.filter((pt) => !pt.isDone && pt.scheduledDate && pt.scheduledTime),
      ];

      for (const item of allItems) {
        const dateStr = item.scheduledDate!;
        const timeStr = item.scheduledTime!;
        const taskTime = new Date(`${dateStr}T${timeStr}:00`);
        if (isNaN(taskTime.getTime())) continue;

        // a. At scheduled time
        if (settings.taskReminderEnabled && taskTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Task Reminder",
              body: item.title,
              sound: settings.soundEnabled ? "default" : undefined,
            },
            trigger: { date: taskTime, channelId: "reminders" } as any,
          }).catch(() => {});
        }

        // b. 30 minutes before task
        if (settings.before30MinEnabled) {
          const earlyTime = new Date(taskTime.getTime() - 30 * 60 * 1000);
          if (earlyTime > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Upcoming Task",
                body: `In 30 minutes: ${item.title}`,
                sound: settings.soundEnabled ? "default" : undefined,
              },
              trigger: { date: earlyTime, channelId: "reminders" } as any,
            }).catch(() => {});
          }
        }
      }
    }

    // c. Morning 7:00 AM daily summary
    if (settings.morningReminderEnabled) {
      const todayTasks = tasks.filter(
        (t) => !t.isDone && (t.scheduledDate === todayStr || !t.scheduledDate)
      );
      const count = todayTasks.length;
      const preview =
        count > 0
          ? todayTasks
              .slice(0, 3)
              .map((t) => t.title)
              .join(", ") + (count > 3 ? "..." : "")
          : "No tasks today. Enjoy your day!";

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Good Morning!",
          body: count > 0 ? `${count} task${count > 1 ? "s" : ""} today: ${preview}` : preview,
          sound: settings.soundEnabled ? "default" : undefined,
        },
        trigger: {
          hour: 7,
          minute: 0,
          repeats: true,
          channelId: "reminders",
        } as any,
      }).catch(() => {});
    }

    // d. Evening 10:00 PM summary + note about auto-reschedule
    if (settings.eveningReminderEnabled) {
      const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr);
      const done = todayTasks.filter((t) => t.isDone).length;
      const undone = todayTasks.filter((t) => !t.isDone).length;

      let body = "";
      if (todayTasks.length === 0) {
        body = "No tasks were scheduled today.";
      } else if (undone === 0) {
        body = `All ${done} task${done > 1 ? "s" : ""} completed! Great job!`;
      } else {
        body = `Done: ${done}. Pending: ${undone} task${undone > 1 ? "s" : ""}${
          settings.autoReschedule ? " — will be rescheduled to tomorrow." : "."
        }`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evening Summary",
          body,
          sound: settings.soundEnabled ? "default" : undefined,
        },
        trigger: {
          hour: 22,
          minute: 0,
          repeats: true,
          channelId: "reminders",
        } as any,
      }).catch(() => {});
    }
  } catch {
    // Silently fail — notifications are not critical
  }
}

export function useNotificationScheduler() {
  const { tasks, projectTasks, settings } = useApp();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    // Debounce reschedule to avoid firing on every keystroke
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      scheduleAll(tasks, projectTasks, settings);
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tasks, projectTasks, settings]);
}

export async function sendTodayTasksNotification(tasks: Task[], settings: Settings) {
  if (Platform.OS === "web") return;
  try {
    const today = toDateStr(new Date());
    const todayTasks = tasks.filter(
      (t) => !t.isDone && (t.scheduledDate === today || !t.scheduledDate)
    );

    const body =
      todayTasks.length === 0
        ? "You have no pending tasks for today!"
        : todayTasks.map((t) => `• ${t.title}`).join("\n");

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Today's Tasks",
        body,
        sound: settings.soundEnabled ? "default" : undefined,
      },
      trigger: null,
    });
  } catch {
    // Silent fail
  }
}
