/**
 * notification-helper.js
 *
 * Reliable abstraction over expo-notifications (SDK 54 / expo-notifications 0.29.x).
 *
 * All methods are safe to call from web (they no-op via isAvailable()).
 * All scheduling uses the proven trigger format for this SDK version.
 */

import * as Notifications from "expo-notifications";
import { Platform, AppState } from "react-native";

// ─── Channels ───────────────────────────────────────────────────────────────

export const CHANNELS = {
  TASK_REMINDERS: "task_reminders",   // High importance (4)
  URGENT_TASKS:   "urgent_tasks",     // Urgent/MAX importance (5)
  DAILY_SUMMARY:  "daily_summary",    // Default importance (3)
};

// ─── Availability ────────────────────────────────────────────────────────────

export function isAvailable() {
  return Platform.OS !== "web";
}

// ─── Module-level listener handles ──────────────────────────────────────────

let _receivedSub  = null;
let _responseSub  = null;
let _appStateSub  = null;

// ─── Initialization ──────────────────────────────────────────────────────────

/**
 * Call ONCE at app startup (in _layout.tsx useEffect).
 *
 * Sets the foreground handler, creates Android channels, requests permissions,
 * and registers event listeners.
 */
export async function initialize({
  onNotificationReceived,
  onNotificationResponse,
  onAppStateChange,
} = {}) {
  if (!isAvailable()) return;

  // 1. Foreground display behaviour
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // 2. Android channels
  await createAndroidChannels();

  // 3. Permissions
  await requestPermissions();

  // 4. Listeners
  _removeListeners();
  if (onNotificationReceived) {
    _receivedSub = Notifications.addNotificationReceivedListener(onNotificationReceived);
  }
  if (onNotificationResponse) {
    _responseSub = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  }
  if (onAppStateChange) {
    _appStateSub = AppState.addEventListener("change", onAppStateChange);
  }
}

// ─── Android channel management ──────────────────────────────────────────────

export async function createAndroidChannels() {
  if (!isAvailable() || Platform.OS !== "android") return;

  // task_reminders – High (4)
  await Notifications.setNotificationChannelAsync(CHANNELS.TASK_REMINDERS, {
    name: "Task Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6366f1",
    showBadge: true,
  });

  // urgent_tasks – Urgent/MAX (5)
  await Notifications.setNotificationChannelAsync(CHANNELS.URGENT_TASKS, {
    name: "Urgent Tasks",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    enableVibrate: true,
    vibrationPattern: [0, 100, 100, 300],
    lightColor: "#ef4444",
    showBadge: true,
  });

  // daily_summary – Default (3)
  await Notifications.setNotificationChannelAsync(CHANNELS.DAILY_SUMMARY, {
    name: "Daily Summary",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    enableVibrate: false,
    showBadge: false,
  });
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function requestPermissions() {
  if (!isAvailable()) return "denied";
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return "granted";
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status;
}

export async function getPermissions() {
  if (!isAvailable()) return "denied";
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function hasPermission() {
  return (await getPermissions()) === "granted";
}

// ─── Schedule a one-time notification ────────────────────────────────────────

/**
 * Schedule a notification at an exact Date.
 *
 * Uses the PROVEN trigger format for expo-notifications 0.28 / 0.29:
 *   { type: Notifications.SchedulableTriggerInputTypes.DATE, date: <Date> }
 *
 * Falls back to { seconds: N } if SchedulableTriggerInputTypes is unavailable
 * (older SDK). Both are valid for one-shot future notifications.
 *
 * @returns {Promise<string|null>} notification identifier, or null on failure
 */
export async function schedule({
  id,
  title,
  body,
  triggerDate,
  channelId,
  data = {},
  isUrgent = false,
}) {
  if (!isAvailable()) return null;
  if (!(await hasPermission())) {
    console.warn("[notifications] Permission not granted – skipping schedule");
    return null;
  }

  const resolvedChannel =
    channelId ?? (isUrgent ? CHANNELS.URGENT_TASKS : CHANNELS.TASK_REMINDERS);

  // Build trigger — works in expo-notifications 0.28+ (SchedulableTriggerInputTypes)
  // and also works as a pure { seconds } fallback for robustness.
  let trigger;
  const secondsUntil = Math.floor((triggerDate.getTime() - Date.now()) / 1000);
  if (secondsUntil <= 0) {
    console.warn(
      `[notifications] Trigger date is in the past for id=${id}, skipping`
    );
    return null;
  }

  try {
    // Preferred: DATE trigger (exact calendar time, survives midnight rollover)
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    };
  } catch {
    // Fallback: seconds-based trigger (always works)
    trigger = { seconds: secondsUntil };
  }

  const content = {
    title,
    body,
    sound: "default",
    data: { ...data, _notifId: id },
    badge: 1,
  };

  // channelId is Android-only – adding it on iOS causes no harm but be explicit
  if (Platform.OS === "android") {
    content.channelId = resolvedChannel;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: String(id),
      content,
      trigger,
    });
    console.log(
      `[notifications] Scheduled id=${id} title="${title}" at ${triggerDate.toISOString()} (in ${secondsUntil}s)`
    );
    return identifier;
  } catch (err) {
    console.error("[notifications] scheduleNotificationAsync failed:", err);
    return null;
  }
}

// ─── Schedule 30-minute early reminder ───────────────────────────────────────

export async function scheduleBefore30Min({ id, title, triggerDate, data = {} }) {
  const earlyDate = new Date(triggerDate.getTime() - 30 * 60 * 1000);
  if (earlyDate <= new Date()) return null;
  // Use a distinct id: original id XOR a constant to avoid collision
  const earlyId = (id ^ 0xABCDEF) >>> 0; // unsigned 32-bit, guaranteed distinct
  return schedule({
    id: earlyId,
    title: "⏰ Coming up: " + title,
    body: "This task starts in 30 minutes",
    triggerDate: earlyDate,
    channelId: CHANNELS.TASK_REMINDERS,
    data,
  });
}

// ─── Schedule daily repeating notification ───────────────────────────────────

/**
 * Schedule a daily repeating notification.
 * Uses CalendarTriggerInput (hour+minute repeat) which is the correct
 * expo-notifications 0.29 API for daily repeats.
 */
export async function scheduleDailySummary({ id, title, body, time }) {
  if (!isAvailable()) return null;
  if (!(await hasPermission())) return null;

  await cancel(id); // always cancel before re-scheduling

  const content = {
    title,
    body,
    sound: "default",
  };
  if (Platform.OS === "android") {
    content.channelId = CHANNELS.DAILY_SUMMARY;
  }

  try {
    // CalendarTriggerInput with repeats:true fires daily at hour:minute
    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: String(id),
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        hour: time.hour,
        minute: time.minute,
      },
    });
    console.log(
      `[notifications] Daily summary id=${id} scheduled at ${time.hour}:${String(time.minute).padStart(2,"0")}`
    );
    return identifier;
  } catch (err) {
    console.error("[notifications] scheduleDailySummary failed:", err);
    return null;
  }
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

export async function cancel(id) {
  if (!isAvailable()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(String(id));
  } catch {
    /* not found – fine */
  }
}

export async function cancelMultiple(ids = []) {
  await Promise.all(ids.map(cancel));
}

export async function cancelAllScheduled() {
  if (!isAvailable()) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Badge ───────────────────────────────────────────────────────────────────

export async function setBadgeCount(count) {
  if (!isAvailable()) return;
  try { await Notifications.setBadgeCountAsync(count); } catch { /* ignore */ }
}

export async function clearBadge() {
  await setBadgeCount(0);
}

// ─── Wake lock (logical stub – OS delivers notifications natively) ────────────

let _wakeLockActive = false;
export function acquireWakeLock()  { _wakeLockActive = true; }
export function releaseWakeLock()  { _wakeLockActive = false; }
export function isWakeLockActive() { return _wakeLockActive; }

// ─── Listeners ───────────────────────────────────────────────────────────────

export function removeAllListeners() {
  _removeListeners();
}

function _removeListeners() {
  _receivedSub?.remove();
  _responseSub?.remove();
  _appStateSub?.remove();
  _receivedSub = _responseSub = _appStateSub = null;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Deterministic numeric ID from a task string ID.
 * Result is a positive 31-bit integer (stays well within Android int range).
 */
export function taskNotifId(taskId) {
  let h = 0x811c9dc5; // FNV-1a offset basis
  for (let i = 0; i < taskId.length; i++) {
    h ^= taskId.charCodeAt(i);
    h = (Math.imul(h, 0x01000193)) >>> 0; // unsigned 32-bit
  }
  return h & 0x7fffffff; // keep positive, 31-bit
}

/**
 * Get the "early reminder" notification ID for a task.
 * Guaranteed to be different from taskNotifId(taskId).
 */
export function taskEarlyNotifId(taskId) {
  return (taskNotifId(taskId) ^ 0x40000000) & 0x7fffffff;
}

/**
 * Build a JS Date from "YYYY-MM-DD" + "HH:MM" in LOCAL time.
 *
 * CRITICAL: We must NOT use `new Date("YYYY-MM-DDThh:mm:ss")` directly —
 * that string WITHOUT a timezone suffix is parsed as LOCAL time on V8/Android,
 * but the spec says it should be UTC for date-only strings. To be safe we
 * always split and construct with explicit local components.
 *
 * Returns null if the resulting time is in the past or input is invalid.
 */
export function buildTriggerDate(scheduledDate, scheduledTime) {
  if (!scheduledDate) return null;

  const [year, month, day] = scheduledDate.split("-").map(Number);
  const [hour, minute] = (scheduledTime ?? "09:00").split(":").map(Number);

  if (!year || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) return null;

  // Construct in local time explicitly — no timezone ambiguity
  const dt = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (isNaN(dt.getTime())) return null;
  if (dt <= new Date()) return null; // already passed

  return dt;
}

/**
 * Channel selection based on task priority.
 */
export function channelForPriority(priority) {
  return priority === "high" ? CHANNELS.URGENT_TASKS : CHANNELS.TASK_REMINDERS;
}
