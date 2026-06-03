/**
 * notification-helper.js
 *
 * Abstraction layer for the Capacitor LocalNotifications plugin,
 * mirroring its API surface: schedule(), cancel(), requestPermissions(),
 * getPermissions(), channel management, badge count, wake lock, and
 * event listeners.
 *
 * Includes availability guards so the module is safe to import in
 * web/browser environments where the plugin is not present.
 */

import * as Notifications from "expo-notifications";
import { Platform, AppState } from "react-native";

// ---------------------------------------------------------------------------
// Android Notification Channels
// ---------------------------------------------------------------------------

/**
 * The three channels defined for this app:
 *
 *  task_reminders  – High importance (4)  – sound + vibration + lights
 *  urgent_tasks    – Urgent importance (5) – sound + vibration + lights
 *  daily_summary   – Default importance (3) – sound only (no vibration/lights)
 */
export const CHANNELS = {
  TASK_REMINDERS: "task_reminders",
  URGENT_TASKS: "urgent_tasks",
  DAILY_SUMMARY: "daily_summary",
};

// Importance values as defined by the Capacitor LocalNotifications plugin
const IMPORTANCE = {
  DEFAULT: 3, // AndroidImportance.DEFAULT
  HIGH: 4,    // AndroidImportance.HIGH
  URGENT: 5,  // AndroidImportance.MAX
};

// ---------------------------------------------------------------------------
// Availability check
// ---------------------------------------------------------------------------

/**
 * Returns true when the LocalNotifications plugin (expo-notifications) is
 * available in the current environment. On web the Notifications API has
 * limited support; we gate native-only calls behind this check.
 */
export function isAvailable() {
  if (Platform.OS === "web") {
    // expo-notifications has partial web support; treat as unavailable for
    // native-specific features (channels, badge, wake lock).
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Initialization – call once at app startup
// ---------------------------------------------------------------------------

let _appStateSubscription = null;
let _notificationResponseSubscription = null;
let _notificationReceivedSubscription = null;

/**
 * Initialize the notification system:
 *  1. Set foreground notification handler
 *  2. Create Android channels
 *  3. Request permissions
 *  4. Register event listeners
 *
 * @param {object} options
 * @param {function} [options.onNotificationReceived]   – called when a notification arrives in foreground
 * @param {function} [options.onNotificationResponse]   – called when user taps a notification
 * @param {function} [options.onAppStateChange]         – called on app state change (for reschedule logic)
 * @returns {Promise<void>}
 */
export async function initialize({ onNotificationReceived, onNotificationResponse, onAppStateChange } = {}) {
  if (!isAvailable()) return;

  // 1. Foreground handler
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

  // 4. Event listeners
  _setupListeners({ onNotificationReceived, onNotificationResponse, onAppStateChange });
}

// ---------------------------------------------------------------------------
// Android channel management
// ---------------------------------------------------------------------------

/**
 * Create all three notification channels for Android.
 * Safe to call multiple times – the OS is idempotent for existing channels.
 */
export async function createAndroidChannels() {
  if (!isAvailable() || Platform.OS !== "android") return;

  // task_reminders – High importance (4)
  await Notifications.setNotificationChannelAsync(CHANNELS.TASK_REMINDERS, {
    name: "Task Reminders",
    importance: Notifications.AndroidImportance.HIGH, // 4
    sound: "default",
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6366f1",
    showBadge: true,
    description: "Notifications for scheduled task reminders",
  });

  // urgent_tasks – Urgent importance (5)
  await Notifications.setNotificationChannelAsync(CHANNELS.URGENT_TASKS, {
    name: "Urgent Tasks",
    importance: Notifications.AndroidImportance.MAX, // 5
    sound: "default",
    enableVibrate: true,
    vibrationPattern: [0, 100, 100, 300],
    lightColor: "#ef4444",
    showBadge: true,
    description: "High-priority task alerts requiring immediate attention",
  });

  // daily_summary – Default importance (3)
  await Notifications.setNotificationChannelAsync(CHANNELS.DAILY_SUMMARY, {
    name: "Daily Summary",
    importance: Notifications.AndroidImportance.DEFAULT, // 3
    sound: "default",
    enableVibrate: false,
    lightColor: "#6366f1",
    showBadge: false,
    description: "Morning and evening daily task summaries",
  });
}

/**
 * Delete all app-specific notification channels (e.g. on sign-out).
 */
export async function deleteAndroidChannels() {
  if (!isAvailable() || Platform.OS !== "android") return;
  for (const id of Object.values(CHANNELS)) {
    await Notifications.deleteNotificationChannelAsync(id).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Permission handling
// ---------------------------------------------------------------------------

/**
 * Request notification permissions from the user.
 * Maps to Capacitor's LocalNotifications.requestPermissions().
 * @returns {Promise<'granted'|'denied'|'undetermined'>}
 */
export async function requestPermissions() {
  if (!isAvailable()) return "denied";

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return "granted";

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
  return status;
}

/**
 * Check the current permission status without prompting.
 * Maps to Capacitor's LocalNotifications.getPermissions().
 * @returns {Promise<'granted'|'denied'|'undetermined'>}
 */
export async function getPermissions() {
  if (!isAvailable()) return "denied";
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Returns true if notifications are currently permitted.
 */
export async function hasPermission() {
  const status = await getPermissions();
  return status === "granted";
}

// ---------------------------------------------------------------------------
// Schedule / Cancel
// ---------------------------------------------------------------------------

/**
 * Schedule a local notification.
 * Maps to Capacitor's LocalNotifications.schedule().
 *
 * @param {object} opts
 * @param {number}  opts.id          – numeric notification id
 * @param {string}  opts.title
 * @param {string}  opts.body
 * @param {Date}    opts.triggerDate – when to fire
 * @param {string}  [opts.channel]   – one of CHANNELS.*; defaults to task_reminders
 * @param {object}  [opts.data]      – extra payload
 * @param {boolean} [opts.isUrgent]  – if true, uses urgent_tasks channel
 * @returns {Promise<string|null>}   – the notification identifier, or null on failure
 */
export async function schedule({ id, title, body, triggerDate, channel, data = {}, isUrgent = false }) {
  if (!isAvailable()) return null;

  const permitted = await hasPermission();
  if (!permitted) return null;

  // Pick the right channel
  const androidChannelId =
    channel ??
    (isUrgent ? CHANNELS.URGENT_TASKS : CHANNELS.TASK_REMINDERS);

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: String(id),
      content: {
        title,
        body,
        sound: "default",
        data: { ...data, notificationId: id },
        badge: 1,
        ...(Platform.OS === "android" && { channelId: androidChannelId }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return identifier;
  } catch (error) {
    console.warn("[notification-helper] schedule() failed:", error);
    return null;
  }
}

/**
 * Schedule the 30-minutes-early reminder for a task.
 * Uses the task_reminders channel.
 */
export async function scheduleBefore30Min({ id, title, triggerDate, data = {} }) {
  const thirtyMinBefore = new Date(triggerDate.getTime() - 30 * 60 * 1000);
  if (thirtyMinBefore <= new Date()) return null; // already passed
  return schedule({
    id: id + 300000, // offset id to avoid collision with on-time notification
    title: "⏰ Coming up: " + title,
    body: "This task starts in 30 minutes",
    triggerDate: thirtyMinBefore,
    channel: CHANNELS.TASK_REMINDERS,
    data,
  });
}

/**
 * Schedule the daily summary notification.
 * Uses the daily_summary channel.
 *
 * @param {object} opts
 * @param {number}  opts.id
 * @param {string}  opts.title
 * @param {string}  opts.body
 * @param {object}  opts.time   – { hour: number, minute: number }
 */
export async function scheduleDailySummary({ id, title, body, time }) {
  if (!isAvailable()) return null;
  const permitted = await hasPermission();
  if (!permitted) return null;

  try {
    // Cancel any existing one with this id first
    await cancel(id);

    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: String(id),
      content: {
        title,
        body,
        sound: "default",
        ...(Platform.OS === "android" && { channelId: CHANNELS.DAILY_SUMMARY }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
    return identifier;
  } catch (error) {
    console.warn("[notification-helper] scheduleDailySummary() failed:", error);
    return null;
  }
}

/**
 * Cancel a scheduled notification by its id.
 * Maps to Capacitor's LocalNotifications.cancel().
 */
export async function cancel(id) {
  if (!isAvailable()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(String(id));
  } catch {
    // Notification may not exist – ignore
  }
}

/**
 * Cancel multiple notifications by an array of ids.
 */
export async function cancelAll(ids = []) {
  if (!isAvailable()) return;
  await Promise.all(ids.map((id) => cancel(id)));
}

/**
 * Cancel ALL scheduled notifications for the app.
 */
export async function cancelAllScheduled() {
  if (!isAvailable()) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ---------------------------------------------------------------------------
// Badge count
// ---------------------------------------------------------------------------

/**
 * Set the app icon badge count.
 * @param {number} count
 */
export async function setBadgeCount(count) {
  if (!isAvailable()) return;
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch {
    // Badge not supported on all platforms
  }
}

/**
 * Clear the app icon badge.
 */
export async function clearBadge() {
  await setBadgeCount(0);
}

// ---------------------------------------------------------------------------
// Wake lock helpers
// ---------------------------------------------------------------------------
// React Native / Expo does not expose a direct wake lock API; the closest
// approximation is keeping the notification system active via AppState
// monitoring. These stubs match the Capacitor plugin's wake lock interface
// for API consistency.

let _wakeLockActive = false;

/**
 * Acquire a logical wake lock to ensure pending notifications are delivered
 * when the device would otherwise be idle.
 */
export function acquireWakeLock() {
  _wakeLockActive = true;
  // In RN, background delivery is handled by the OS notification system.
  // This flag is used internally to gate reschedule logic.
}

/**
 * Release the wake lock.
 */
export function releaseWakeLock() {
  _wakeLockActive = false;
}

export function isWakeLockActive() {
  return _wakeLockActive;
}

// ---------------------------------------------------------------------------
// Event listeners (lifecycle integration)
// ---------------------------------------------------------------------------

function _setupListeners({ onNotificationReceived, onNotificationResponse, onAppStateChange }) {
  // Clean up any prior subscriptions
  _notificationReceivedSubscription?.remove();
  _notificationResponseSubscription?.remove();
  _appStateSubscription?.remove();

  // Fired when a notification is delivered while the app is in the foreground
  if (onNotificationReceived) {
    _notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );
  }

  // Fired when the user taps a notification (foreground or background)
  if (onNotificationResponse) {
    _notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );
  }

  // AppState listener – used to reschedule notifications when the app comes
  // back to the foreground (e.g. after device restart or missed alerts)
  if (onAppStateChange) {
    _appStateSubscription = AppState.addEventListener("change", (nextState) => {
      onAppStateChange(nextState);
    });
  }
}

/**
 * Remove all event listeners registered by initialize().
 * Call this in component cleanup / app teardown.
 */
export function removeAllListeners() {
  _notificationReceivedSubscription?.remove();
  _notificationResponseSubscription?.remove();
  _appStateSubscription?.remove();
  _notificationReceivedSubscription = null;
  _notificationResponseSubscription = null;
  _appStateSubscription = null;
}

// ---------------------------------------------------------------------------
// Utility helpers used by the scheduler
// ---------------------------------------------------------------------------

/**
 * Build a numeric notification ID from a task ID string.
 * Capacitor LocalNotifications requires integer IDs.
 */
export function taskNotifId(taskId) {
  // Deterministic hash → positive 32-bit integer
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    hash = (Math.imul(31, hash) + taskId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Build a Date from scheduledDate ("YYYY-MM-DD") and scheduledTime ("HH:MM").
 * Returns null if the date is in the past.
 */
export function buildTriggerDate(scheduledDate, scheduledTime) {
  if (!scheduledDate) return null;
  const timeStr = scheduledTime ?? "09:00";
  const dt = new Date(`${scheduledDate}T${timeStr}:00`);
  if (isNaN(dt.getTime()) || dt <= new Date()) return null;
  return dt;
}

/**
 * Determine the correct channel for a task based on its priority.
 */
export function channelForPriority(priority) {
  if (priority === "high") return CHANNELS.URGENT_TASKS;
  return CHANNELS.TASK_REMINDERS;
}
