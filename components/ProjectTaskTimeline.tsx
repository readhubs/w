import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { ProjectTask } from "@/context/AppContext";

interface ProjectTaskTimelineProps {
  tasks: ProjectTask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TimelineItem({
  task,
  isLast,
  onToggle,
  onDelete,
}: {
  task: ProjectTask;
  isLast: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  function handleToggle() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onToggle();
  }

  const nodeColor = task.isDone
    ? colors.success
    : task.isFinal
    ? colors.primary
    : colors.border;

  return (
    <Animated.View style={[styles.item, { transform: [{ scale }] }]}>
      <View style={styles.left}>
        <TouchableOpacity
          onPress={handleToggle}
          style={[
            styles.node,
            { backgroundColor: nodeColor, borderColor: nodeColor },
          ]}
        >
          {task.isDone && <Ionicons name="checkmark" size={12} color="#fff" />}
          {!task.isDone && task.isFinal && (
            <Ionicons name="flag" size={10} color={colors.primaryForeground} />
          )}
        </TouchableOpacity>
        {!isLast && (
          <View
            style={[
              styles.line,
              { backgroundColor: task.isDone ? colors.success + "60" : colors.border },
            ]}
          />
        )}
      </View>
      <View
        style={[
          styles.content,
          {
            backgroundColor: task.isDone
              ? colors.success + "15"
              : task.isFinal
              ? colors.primary + "15"
              : colors.card,
            borderRadius: colors.radius,
            borderWidth: 1,
            borderColor: task.isDone
              ? colors.success + "40"
              : task.isFinal
              ? colors.primary + "40"
              : colors.border,
            marginBottom: isLast ? 0 : 12,
          },
        ]}
      >
        <View style={styles.row}>
          <Text
            style={[
              styles.taskTitle,
              {
                color: task.isDone ? colors.success : colors.foreground,
                textDecorationLine: task.isDone ? "line-through" : "none",
                flex: 1,
              },
            ]}
          >
            {task.title}
          </Text>
          <TouchableOpacity onPress={onDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={15} color={colors.destructive} />
          </TouchableOpacity>
        </View>
        {(task.scheduledDate || task.scheduledTime) && (
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {task.scheduledDate} {task.scheduledTime}
            </Text>
          </View>
        )}
        {task.isDone && task.doneAt && (
          <Text style={[styles.meta, { color: colors.success, marginTop: 2 }]}>
            Done {new Date(task.doneAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function ProjectTaskTimeline({
  tasks,
  onToggle,
  onDelete,
}: ProjectTaskTimelineProps) {
  const colors = useColors();

  const sorted = [...tasks].sort((a, b) => {
    if (a.isFinal) return 1;
    if (b.isFinal) return -1;
    if (a.scheduledDate && b.scheduledDate) {
      return a.scheduledDate.localeCompare(b.scheduledDate);
    }
    if (a.scheduledDate) return -1;
    if (b.scheduledDate) return 1;
    return a.order - b.order;
  });

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="list-outline" size={32} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No tasks yet. Add one below.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sorted.map((task, idx) => (
        <TimelineItem
          key={task.id}
          task={task}
          isLast={idx === sorted.length - 1}
          onToggle={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  item: {
    flexDirection: "row",
    gap: 12,
  },
  left: {
    alignItems: "center",
    width: 24,
  },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 2,
    marginBottom: -4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  meta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
