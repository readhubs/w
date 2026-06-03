import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskFormSheet from "@/components/TaskFormSheet";
import type { Task } from "@/context/AppContext";

export default function TaskDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, deleteTask, toggleTaskDone } = useApp();

  const task = tasks.find((t) => t.id === id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Task not found</Text>
      </View>
    );
  }

  const priorityColors: Record<string, string> = {
    high: colors.priorityHigh,
    medium: colors.priorityMed,
    low: colors.priorityLow,
    none: colors.border,
  };
  const pColor = priorityColors[task.priority] ?? colors.border;

  function handleDelete() {
    deleteTask(task!.id);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.titleRow,
            { borderLeftColor: pColor, borderLeftWidth: task.priority !== "none" ? 4 : 0 },
          ]}
        >
          <Text style={[styles.taskTitle, { color: colors.foreground }]}>{task.title}</Text>
          {task.isDone && (
            <View style={[styles.doneBadge, { backgroundColor: colors.success + "33" }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.doneBadgeText, { color: colors.success }]}>Done</Text>
            </View>
          )}
        </View>

        {task.notes && (
          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NOTES</Text>
            <Text style={[styles.sectionValue, { color: colors.foreground }]}>{task.notes}</Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={styles.metaRow}>
            <Ionicons name="flag" size={16} color={pColor} />
            <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Priority</Text>
            <Text style={[styles.metaValue, { color: pColor }]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>
          {task.scheduledDate && (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Scheduled</Text>
              <Text style={[styles.metaValue, { color: colors.foreground }]}>
                {task.scheduledDate} {task.scheduledTime ?? ""}
              </Text>
            </View>
          )}
          {task.isRepeating && (
            <View style={styles.metaRow}>
              <Ionicons name="repeat" size={16} color={colors.primary} />
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Repeats</Text>
              <Text style={[styles.metaValue, { color: colors.primary }]}>
                {task.repeatType ?? ""}
              </Text>
            </View>
          )}
          {task.hasDeadline && task.deadlineStart && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color={colors.warning} />
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Deadline</Text>
              <Text style={[styles.metaValue, { color: colors.warning }]}>
                {task.deadlineStart} → {task.deadlineEnd ?? ""}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Ionicons name="create-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Created</Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {task.tags.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TAGS</Text>
            <View style={styles.tagsRow}>
              {task.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + "22" }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={[styles.metaRow, { justifyContent: "space-between" }]}>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>Mark as done</Text>
            <Switch
              value={task.isDone}
              onValueChange={() => toggleTaskDone(task.id)}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
          onPress={() => setShowEdit(true)}
        >
          <Ionicons name="pencil" size={18} color={colors.foreground} />
          <Text style={[styles.actionText, { color: colors.foreground }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.destructive, borderRadius: colors.radius }]}
          onPress={() => setShowDelete(true)}
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={[styles.actionText, { color: "#fff" }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <TaskFormSheet
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Task"
        initialValues={task}
        onSave={(updates) => {
          updateTask(task.id, updates);
          setShowEdit(false);
        }}
      />

      <ConfirmDialog
        visible={showDelete}
        title="Delete Task"
        message="This task will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 12 },
  notFound: { fontSize: 16, textAlign: "center", marginTop: 40, fontFamily: "Inter_400Regular" },
  titleRow: { marginBottom: 8, paddingLeft: 12 },
  taskTitle: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 32 },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginTop: 8 },
  doneBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  section: { padding: 16, gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  sectionValue: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  metaValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  actions: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48 },
  actionText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
