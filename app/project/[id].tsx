import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import ProjectTaskTimeline from "@/components/ProjectTaskTimeline";
import FloatingButton from "@/components/FloatingButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import { DatePicker, TimePicker } from "@/components/DateTimePicker";

export default function ProjectDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    projects,
    projectTasks,
    addProjectTask,
    toggleProjectTaskDone,
    deleteProjectTask,
    markProjectDone,
  } = useApp();

  const project = projects.find((p) => p.id === id);
  const tasks = projectTasks
    .filter((pt) => pt.projectId === id)
    .sort((a, b) => {
      if (a.isFinal) return 1;
      if (b.isFinal) return -1;
      return (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? "");
    });

  const [showAdd, setShowAdd] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [showMarkDone, setShowMarkDone] = useState(false);

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40, fontFamily: "Inter_400Regular" }}>
          Project not found
        </Text>
      </View>
    );
  }

  const doneTasks = tasks.filter((t) => t.isDone).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;
  const accentColor = project.isDone ? colors.success : project.color ?? colors.primary;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleAddTask() {
    if (!taskTitle.trim()) return;
    const existingTasks = projectTasks.filter((pt) => pt.projectId === id);
    addProjectTask({
      projectId: id,
      title: taskTitle.trim(),
      scheduledDate: taskDate || undefined,
      scheduledTime: taskTime || undefined,
      isDone: false,
      order: existingTasks.length,
      isFinal: false,
    });
    setTaskTitle("");
    setTaskDate("");
    setTaskTime("");
    setShowAdd(false);
  }

  function ensureProjectDoneTask() {
    const hasFinal = tasks.some((t) => t.isFinal);
    if (!hasFinal) {
      addProjectTask({
        projectId: id,
        title: "Project Done",
        isDone: false,
        order: 9999,
        isFinal: true,
      });
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: project.isDone ? accentColor + "18" : colors.background,
            borderBottomColor: accentColor + "44",
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.projectName, { color: accentColor }]} numberOfLines={1}>
          {project.name}
        </Text>
        {!project.isDone && (
          <TouchableOpacity
            onPress={() => {
              ensureProjectDoneTask();
              setShowMarkDone(true);
            }}
            hitSlop={8}
          >
            <Ionicons name="checkmark-done-circle-outline" size={24} color={colors.success} />
          </TouchableOpacity>
        )}
        {project.isDone && (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressMeta}>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {doneTasks} of {totalTasks} tasks done
          </Text>
          <Text style={[styles.progressPct, { color: accentColor }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: accentColor, width: `${progress * 100}%` as any },
            ]}
          />
        </View>
        <View style={styles.dateMeta}>
          <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            Started {project.startDate}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProjectTaskTimeline
          tasks={tasks}
          onToggle={(tid) => toggleProjectTaskDone(tid)}
          onDelete={(tid) => setDeleteTaskId(tid)}
        />
      </ScrollView>

      {!project.isDone && (
        <FloatingButton onPress={() => setShowAdd(true)} bottom={0} />
      )}

      <Modal
        transparent
        animationType="slide"
        visible={showAdd}
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Task</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
                ]}
                placeholder="Task name..."
                placeholderTextColor={colors.mutedForeground}
                value={taskTitle}
                onChangeText={setTaskTitle}
                autoFocus
                returnKeyType="next"
              />
              <View style={styles.pickerRow}>
                <View style={{ flex: 1 }}>
                  <DatePicker
                    value={taskDate}
                    onChange={setTaskDate}
                    placeholder="Pick date"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TimePicker
                    value={taskTime}
                    onChange={setTaskTime}
                    placeholder="Pick time"
                    dateContext={taskDate}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: taskTitle.trim() ? accentColor : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={handleAddTask}
                disabled={!taskTitle.trim()}
              >
                <Text style={[styles.saveBtnText, { color: project.isDone ? "#fff" : colors.primaryForeground }]}>
                  Add Task
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deleteTaskId}
        title="Delete Task"
        message="This project task will be permanently deleted."
        onConfirm={() => {
          if (deleteTaskId) deleteProjectTask(deleteTaskId);
          setDeleteTaskId(null);
        }}
        onCancel={() => setDeleteTaskId(null)}
      />

      <ConfirmDialog
        visible={showMarkDone}
        title="Mark Project Done"
        message="This will mark all tasks and the project as complete."
        confirmText="Mark Done"
        destructive={false}
        onConfirm={() => {
          markProjectDone(id);
          setShowMarkDone(false);
        }}
        onCancel={() => setShowMarkDone(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  projectName: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  progressSection: { paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressPct: { fontSize: 13, fontFamily: "Inter_700Bold" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  dateMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dateText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: {},
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalBody: { paddingHorizontal: 20, gap: 10 },
  input: { height: 44, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  pickerRow: { flexDirection: "row", gap: 8 },
  saveBtn: { height: 48, alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 4 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
