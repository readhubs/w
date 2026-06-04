import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Project, ProjectTask } from "@/context/AppContext";

interface ProjectCardProps {
  project: Project;
  tasks: ProjectTask[];
  onPress: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, tasks, onPress, onDelete }: ProjectCardProps) {
  const colors = useColors();
  const done = tasks.filter((t) => t.isDone).length;
  const total = tasks.length;
  const progress = total > 0 ? done / total : 0;
  const accentColor = project.isDone ? colors.success : project.color ?? colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {project.isDone && (
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.name, { color: accentColor }]} numberOfLines={1}>
            {project.name}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={15} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <Ionicons name="calendar-outline" size={11} color={colors.mutedForeground} />
        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Started {project.startDate}</Text>
        <View style={styles.spacer} />
        <Text style={[styles.taskCount, { color: colors.mutedForeground }]}>
          {done}/{total} tasks
        </Text>
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: accentColor, width: `${progress * 100}%` as any },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  name: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  spacer: { flex: 1 },
  taskCount: { fontSize: 12, fontFamily: "Inter_500Medium" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
});
