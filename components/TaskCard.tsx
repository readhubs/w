import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Task, Project } from "@/context/AppContext";

interface TaskCardProps {
  task: Task;
  project?: Project;
  priorityHighColor: string;
  priorityMedColor: string;
  priorityLowColor: string;
  onPress: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
}

export default function TaskCard({
  task,
  project,
  priorityHighColor,
  priorityMedColor,
  priorityLowColor,
  onPress,
  onToggleDone,
  onDelete,
}: TaskCardProps) {
  const colors = useColors();

  const priorityColor =
    task.priority === "high"
      ? priorityHighColor
      : task.priority === "medium"
      ? priorityMedColor
      : task.priority === "low"
      ? priorityLowColor
      : colors.border;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderLeftWidth: task.priority !== "none" ? 4 : 0,
          borderLeftColor: priorityColor,
          opacity: task.isDone ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.top}>
        <TouchableOpacity onPress={onToggleDone} hitSlop={8} style={styles.checkbox}>
          <Ionicons
            name={task.isDone ? "checkmark-circle" : "ellipse-outline"}
            size={22}
            color={task.isDone ? colors.success : colors.mutedForeground}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.title,
            {
              color: task.isDone ? colors.mutedForeground : colors.foreground,
              textDecorationLine: task.isDone ? "line-through" : "none",
            },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        {task.scheduledDate && (
          <View style={styles.chip}>
            <Ionicons name="calendar-outline" size={11} color={colors.mutedForeground} />
            <Text style={[styles.chipText, { color: colors.mutedForeground }]}>
              {task.scheduledDate}
              {task.scheduledTime ? ` ${task.scheduledTime}` : ""}
            </Text>
          </View>
        )}
        {project && (
          <View style={[styles.chip, { backgroundColor: (project.color ?? colors.primary) + "22" }]}>
            <Ionicons name="folder-outline" size={11} color={project.color ?? colors.primary} />
            <Text style={[styles.chipText, { color: project.color ?? colors.primary }]} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
        )}
        {task.isRepeating && (
          <View style={styles.chip}>
            <Ionicons name="repeat-outline" size={11} color={colors.primary} />
            <Text style={[styles.chipText, { color: colors.primary }]}>{task.repeatType}</Text>
          </View>
        )}
        {task.tags.slice(0, 2).map((tag) => (
          <View key={tag} style={[styles.chip, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.chipText, { color: colors.primary }]}>#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { flexShrink: 0 },
  title: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, paddingLeft: 32 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "rgba(128,128,128,0.12)",
  },
  chipText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
