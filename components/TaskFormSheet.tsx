import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { Task } from "@/context/AppContext";
import { DatePicker, TimePicker } from "@/components/DateTimePicker";

type Priority = Task["priority"];
type RepeatType = Task["repeatType"];

interface TaskFormSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  initialValues?: Partial<Task>;
  onSave: (values: Omit<Task, "id" | "createdAt">) => void;
}

const PRIORITIES: Priority[] = ["none", "low", "medium", "high"];
const REPEAT_TYPES: RepeatType[] = ["daily", "weekly", "monthly"];

export default function TaskFormSheet({
  visible,
  onClose,
  title,
  initialValues,
  onSave,
}: TaskFormSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects } = useApp();

  const [taskTitle, setTaskTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [priority, setPriority] = useState<Priority>("none");
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>("daily");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineStart, setDeadlineStart] = useState("");
  const [deadlineEnd, setDeadlineEnd] = useState("");
  const [tags, setTags] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setTaskTitle(initialValues?.title ?? "");
      setNotes(initialValues?.notes ?? "");
      setScheduledDate(initialValues?.scheduledDate ?? "");
      setScheduledTime(initialValues?.scheduledTime ?? "");
      setPriority(initialValues?.priority ?? "none");
      setIsRepeating(initialValues?.isRepeating ?? false);
      setRepeatType(initialValues?.repeatType ?? "daily");
      setHasDeadline(initialValues?.hasDeadline ?? false);
      setDeadlineStart(initialValues?.deadlineStart ?? "");
      setDeadlineEnd(initialValues?.deadlineEnd ?? "");
      setTags(initialValues?.tags?.join(", ") ?? "");
      setProjectId(initialValues?.projectId ?? undefined);
    }
  }, [visible, initialValues]);

  const priorityColors: Record<Priority, string> = {
    none: colors.border,
    low: colors.priorityLow,
    medium: colors.priorityMed,
    high: colors.priorityHigh,
  };

  const linkedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  function handleSave() {
    if (!taskTitle.trim()) return;
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: taskTitle.trim(),
      notes,
      scheduledDate: scheduledDate || undefined,
      scheduledTime: scheduledTime || undefined,
      priority,
      isRepeating,
      repeatType: isRepeating ? repeatType : undefined,
      repeatDays: initialValues?.repeatDays,
      hasDeadline,
      deadlineStart: hasDeadline ? deadlineStart : undefined,
      deadlineEnd: hasDeadline ? deadlineEnd : undefined,
      tags: parsedTags,
      projectId,
      categoryId: initialValues?.categoryId,
      isDone: initialValues?.isDone ?? false,
      doneAt: initialValues?.doneAt,
      order: initialValues?.order,
    });
  }

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
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
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius }]}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Task title..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />

            {/* Notes */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.notesInput,
                { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />

            {/* Date & Time */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Date & Time</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <DatePicker value={scheduledDate} onChange={setScheduledDate} placeholder="Date" />
              </View>
              <View style={{ flex: 1 }}>
                <TimePicker
                  value={scheduledTime}
                  onChange={setScheduledTime}
                  placeholder="Time"
                  dateContext={scheduledDate}
                />
              </View>
            </View>

            {/* Priority */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor:
                        priority === p ? priorityColors[p] : colors.secondary,
                      borderRadius: colors.radius,
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      { color: priority === p ? "#fff" : colors.mutedForeground },
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Project Link (Fix 5) */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Link to Project</Text>
            <TouchableOpacity
              style={[
                styles.projectPickerBtn,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  borderWidth: projectId ? 1 : 0,
                  borderColor: linkedProject?.color ?? colors.primary,
                },
              ]}
              onPress={() => setShowProjectPicker(true)}
            >
              {linkedProject ? (
                <View style={styles.projectPickerContent}>
                  <View style={[styles.projectDot, { backgroundColor: linkedProject.color ?? colors.primary }]} />
                  <Text style={[styles.projectPickerText, { color: linkedProject.color ?? colors.primary }]}>
                    {linkedProject.name}
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setProjectId(undefined);
                    }}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.projectPickerContent}>
                  <Ionicons name="folder-outline" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.projectPickerText, { color: colors.mutedForeground }]}>
                    No project linked
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                </View>
              )}
            </TouchableOpacity>

            {/* Tags */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Tags (comma separated)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius }]}
              value={tags}
              onChangeText={setTags}
              placeholder="work, urgent, idea..."
              placeholderTextColor={colors.mutedForeground}
            />

            {/* Repeat */}
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>Repeating Task</Text>
              <Switch
                value={isRepeating}
                onValueChange={setIsRepeating}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            {isRepeating && (
              <View style={styles.repeatRow}>
                {REPEAT_TYPES.map((rt) => (
                  <TouchableOpacity
                    key={rt}
                    style={[
                      styles.priorityChip,
                      {
                        backgroundColor: repeatType === rt ? colors.primary : colors.secondary,
                        borderRadius: colors.radius,
                      },
                    ]}
                    onPress={() => setRepeatType(rt)}
                  >
                    <Text
                      style={[
                        styles.priorityChipText,
                        { color: repeatType === rt ? colors.primaryForeground : colors.mutedForeground },
                      ]}
                    >
                      {rt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Deadline */}
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.foreground }]}>Has Deadline</Text>
              <Switch
                value={hasDeadline}
                onValueChange={setHasDeadline}
                trackColor={{ false: colors.border, true: colors.warning }}
                thumbColor="#fff"
              />
            </View>
            {hasDeadline && (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <DatePicker value={deadlineStart} onChange={setDeadlineStart} placeholder="Start" />
                </View>
                <View style={{ flex: 1 }}>
                  <DatePicker value={deadlineEnd} onChange={setDeadlineEnd} placeholder="End" />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: taskTitle.trim() ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                  marginTop: 20,
                  marginBottom: 8,
                },
              ]}
              onPress={handleSave}
              disabled={!taskTitle.trim()}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
                {initialValues ? "Save Changes" : "Create Task"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Project Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showProjectPicker}
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 16,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: "60%",
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Select Project</Text>
              <TouchableOpacity onPress={() => setShowProjectPicker(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                style={[
                  styles.projectOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setProjectId(undefined);
                  setShowProjectPicker(false);
                }}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.mutedForeground} />
                <Text style={[styles.projectOptionText, { color: colors.mutedForeground }]}>
                  No project
                </Text>
              </TouchableOpacity>
              {projects.filter((p) => !p.isDone).map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.projectOption, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setProjectId(project.id);
                    setShowProjectPicker(false);
                  }}
                >
                  <View style={[styles.projectDot, { backgroundColor: project.color ?? colors.primary, width: 14, height: 14, borderRadius: 7 }]} />
                  <Text style={[styles.projectOptionText, { color: colors.foreground }]}>{project.name}</Text>
                  {projectId === project.id && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {projects.filter((p) => !p.isDone).length === 0 && (
                <Text style={[styles.projectOptionText, { color: colors.mutedForeground, textAlign: "center", paddingVertical: 20 }]}>
                  No active projects
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { maxHeight: "90%" },
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 20 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, marginBottom: 6, marginTop: 14, textTransform: "uppercase" },
  input: { height: 44, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  notesInput: { height: 80 },
  row: { flexDirection: "row", gap: 8 },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityChip: { flex: 1, height: 36, alignItems: "center", justifyContent: "center" },
  priorityChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  repeatRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 6 },
  switchLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  saveBtn: { height: 50, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  projectPickerBtn: { height: 44, paddingHorizontal: 14, justifyContent: "center" },
  projectPickerContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  projectPickerText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  projectDot: { width: 10, height: 10, borderRadius: 5 },
  projectOption: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  projectOptionText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
});
