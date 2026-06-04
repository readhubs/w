import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const PRIORITY_OPTIONS = [
  { key: "priorityHighColor" as const, label: "High Priority", colors: ["#ef4444", "#dc2626", "#f87171"] },
  { key: "priorityMedColor" as const, label: "Medium Priority", colors: ["#f59e0b", "#d97706", "#fbbf24"] },
  { key: "priorityLowColor" as const, label: "Low Priority", colors: ["#22c55e", "#16a34a", "#4ade80"] },
];

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>;
}

function SettingRow({
  icon,
  label,
  sub,
  value,
  onToggle,
}: {
  icon: string;
  label: string;
  sub?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon as any} size={20} color={colors.primary} style={styles.rowIcon} />
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {sub && <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="APPEARANCE" />
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="moon-outline"
            label="Dark Mode"
            sub="Use dark theme"
            value={settings.darkMode}
            onToggle={(v) => updateSettings({ darkMode: v })}
          />
        </View>

        <SectionHeader title="NOTIFICATIONS" />
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="notifications-outline"
            label="Enable Notifications"
            value={settings.notificationsEnabled}
            onToggle={(v) => updateSettings({ notificationsEnabled: v })}
          />
          <SettingRow
            icon="alarm-outline"
            label="Task Reminder"
            sub="Notify at scheduled time"
            value={settings.taskReminderEnabled}
            onToggle={(v) => updateSettings({ taskReminderEnabled: v })}
          />
          <SettingRow
            icon="sunny-outline"
            label="Morning Reminder"
            sub="Daily summary at 7:00 AM"
            value={settings.morningReminderEnabled}
            onToggle={(v) => updateSettings({ morningReminderEnabled: v })}
          />
          <SettingRow
            icon="moon-outline"
            label="Evening Summary"
            sub="Done tasks summary at 10:00 PM"
            value={settings.eveningReminderEnabled}
            onToggle={(v) => updateSettings({ eveningReminderEnabled: v })}
          />
          <SettingRow
            icon="time-outline"
            label="30-Min Early Reminder"
            sub="Remind 30 min before task"
            value={settings.before30MinEnabled}
            onToggle={(v) => updateSettings({ before30MinEnabled: v })}
          />
          <SettingRow
            icon="volume-high-outline"
            label="Sound"
            value={settings.soundEnabled}
            onToggle={(v) => updateSettings({ soundEnabled: v })}
          />
          <SettingRow
            icon="phone-portrait-outline"
            label="Vibration"
            value={settings.vibrationEnabled}
            onToggle={(v) => updateSettings({ vibrationEnabled: v })}
          />
        </View>

        <SectionHeader title="TASKS" />
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="repeat-outline"
            label="Show Repeated Tasks"
            sub="List all repeating tasks"
            value={settings.repeatTasksVisible}
            onToggle={(v) => updateSettings({ repeatTasksVisible: v })}
          />
          <SettingRow
            icon="calendar-outline"
            label="Auto-Reschedule"
            sub="Move undone tasks to next day"
            value={settings.autoReschedule}
            onToggle={(v) => updateSettings({ autoReschedule: v })}
          />
          <SettingRow
            icon="checkmark-done-outline"
            label="Show Done Tasks"
            value={settings.showDoneTasks}
            onToggle={(v) => updateSettings({ showDoneTasks: v })}
          />
        </View>

        <SectionHeader title="PRIORITY COLORS" />
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {PRIORITY_OPTIONS.map((opt) => (
            <View key={opt.key} style={[styles.colorRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowLabel, { color: colors.foreground, flex: 1 }]}>{opt.label}</Text>
              <View style={styles.colorPicker}>
                {opt.colors.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c, borderWidth: settings[opt.key] === c ? 3 : 0, borderColor: colors.foreground },
                    ]}
                    onPress={() => updateSettings({ [opt.key]: c })}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        <SectionHeader title="DATA" />
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <Ionicons name="download-outline" size={20} color={colors.primary} style={styles.rowIcon} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Backup & Export</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Export all data as Excel file</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.version}>
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>Micky v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  sectionHeader: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6 },
  section: { marginHorizontal: 16, borderRadius: 12, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  rowIcon: { marginRight: 12 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  colorRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  colorPicker: { flexDirection: "row", gap: 8 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  version: { alignItems: "center", marginTop: 32, marginBottom: 8 },
  versionText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
