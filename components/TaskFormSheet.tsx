import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { Priority, RepeatType, Task } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import { DatePicker, TimePicker } from "@/components/DateTimePicker";

interface TaskFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt">) => void;
  initialValues?: Partial<Task>;
  title?: string;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "#ef4444" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "low", label: "Low", color: "#22c55e" },
  { value: "none", label: "None", color: "#6b7280" },
];

const REPEAT_TYPES: { value: RepeatType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export default function TaskFormSheet({
  visible,
  onClose,
  onSave,
  initialValues,
  title = "New Task",
}: TaskFormSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories } = useApp();
  const taskCategories = categories.filter((c) => c.type === "task");

  const [taskTitle, setTaskTitle] = useState(initialValues?.title ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? "none");
  const [isRepeating, setIsRepeating] = useState(initialValues?.isRepeating ?? false);
  const [repeatType, setRepeatType] = useState<RepeatType>(initialValues?.repeatType ?? "daily");
  const [hasDeadline, setHasDeadline] = useState(initialValues?.hasDeadline ?? false);
  const [deadlineStart, setDeadlineStart] = useState(initialValues?.deadlineStart ?? "");
  const [deadlineEnd, setDeadlineEnd] = useState(initialValues?.deadlineEnd ?? "");
  const [scheduledDate, setScheduledDate] = useState(initialValues?.scheduledDate ?? "");
  const [scheduledTime, setScheduledTime] = useState(initialValues?.scheduledTime ?? "");
  const [categoryId, setCategoryId] = useState<string | undefined>(initialValues?.categoryId);
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  function handleSave() {
    if (!taskTitle.trim()) return;
    onSave({
      title: taskTitle.trim(),
      notes,
      priority,
      isRepeating,
      repeatType: isRepeating ? repeatType : undefined,
      hasDeadline,
      deadlineStart: hasDeadline ? deadlineStart : undefined,
      deadlineEnd: hasDeadline ? deadlineEnd : undefined,
      scheduledDate: scheduledDate || undefined,
      scheduledTime: scheduledTime || undefined,
      categoryId,
      tags,
      isDone: false,
    });
    resetForm();
    onClose();
  }

  function resetForm() {
    setTaskTitle("");
    setNotes("");
    setPriority("none");
    setIsRepeating(false);
    setRepeatType("daily");
    setHasDeadline(false);
    setDeadlineStart("");
    setDeadlineEnd("");
    setScheduledDate("");
    setScheduledTime("");
    setCategoryId(undefined);
    setTags([]);
    setTagInput("");
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInDown.duration(300).springify()}
          exiting={FadeOutDown.duration(200)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Task Name *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
              ]}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.mutedForeground}
              value={taskTitle}
              onChangeText={setTaskTitle}
              returnKeyType="next"
              autoFocus
            />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.notesInput,
                { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
              ]}
              placeholder="Additional notes..."
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Priority</Text>
            <View style={styles.row}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityBtn,
                    {
                      backgroundColor: priority === p.value ? p.color : colors.secondary,
                      borderRadius: colors.radius,
                      borderWidth: 1,
                      borderColor: priority === p.value ? p.color : colors.border,
                    },
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <Text
                    style={{
                      color: priority === p.value ? "#fff" : colors.foreground,
                      fontSize: 12,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Schedule</Text>
            <View style={styles.pickerRow}>
              <View style={{ flex: 1 }}>
                <DatePicker
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  placeholder="Pick date"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TimePicker
                  value={scheduledTime}
                  onChange={setScheduledTime}
                  placeholder="Pick time"
                  dateContext={scheduledDate}
                />
              </View>
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Repeating</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                  Repeats across days
                </Text>
              </View>
              <Switch
                value={isRepeating}
                onValueChange={setIsRepeating}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            {isRepeating && (
              <View style={styles.row}>
                {REPEAT_TYPES.map((rt) => (
                  <TouchableOpacity
                    key={rt.value}
                    style={[
                      styles.chipBtn,
                      {
                        backgroundColor: repeatType === rt.value ? colors.primary : colors.secondary,
                        borderRadius: colors.radius,
                      },
                    ]}
                    onPress={() => setRepeatType(rt.value)}
                  >
                    <Text
                      style={{
                        color: repeatType === rt.value ? colors.primaryForeground : colors.foreground,
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Deadline</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                  Set start & end date
                </Text>
              </View>
              <Switch
                value={hasDeadline}
                onValueChange={setHasDeadline}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            {hasDeadline && (
              <View style={styles.pickerRow}>
                <View style={{ flex: 1 }}>
                  <DatePicker
                    value={deadlineStart}
                    onChange={setDeadlineStart}
                    placeholder="Start date"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <DatePicker
                    value={deadlineEnd}
                    onChange={setDeadlineEnd}
                    placeholder="End date"
                    minimumDate={deadlineStart ? new Date(deadlineStart + "T12:00:00") : undefined}
                  />
                </View>
              </View>
            )}

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: !categoryId ? colors.primary : colors.secondary,
                      borderRadius: colors.radius,
                    },
                  ]}
                  onPress={() => setCategoryId(undefined)}
                >
                  <Text style={{ color: !categoryId ? colors.primaryForeground : colors.foreground, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                    None
                  </Text>
                </TouchableOpacity>
                {taskCategories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chipBtn,
                      {
                        backgroundColor: categoryId === c.id ? c.color : colors.secondary,
                        borderRadius: colors.radius,
                      },
                    ]}
                    onPress={() => setCategoryId(c.id)}
                  >
                    <Text style={{ color: categoryId === c.id ? "#fff" : colors.foreground, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
                ]}
                placeholder="Add tag..."
                placeholderTextColor={colors.mutedForeground}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addTagBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                onPress={addTag}
              >
                <Ionicons name="add" size={20} color={colors.primaryForeground} />
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsRow}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, { backgroundColor: colors.primary + "33", borderRadius: 20 }]}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "Inter_500Medium" }}>
                      #{tag}
                    </Text>
                    <Ionicons name="close-circle" size={14} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: taskTitle.trim() ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                  marginTop: 20,
                },
              ]}
              onPress={handleSave}
              disabled={!taskTitle.trim()}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                Save Task
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { maxHeight: "92%", paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 20 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { height: 44, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 4 },
  notesInput: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  pickerRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  priorityBtn: { flex: 1, height: 36, alignItems: "center", justifyContent: "center", minWidth: 60 },
  chipBtn: { paddingHorizontal: 14, height: 34, alignItems: "center", justifyContent: "center" },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  toggleLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tagInputRow: { flexDirection: "row", gap: 8 },
  addTagBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5 },
  saveBtn: { height: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
