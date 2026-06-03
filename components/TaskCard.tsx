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
import type { Task } from "@/context/AppContext";

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
  priorityHighColor?: string;
  priorityMedColor?: string;
  priorityLowColor?: string;
}

function getPriorityColor(
  priority: Task["priority"],
  high: string,
  med: string,
  low: string
) {
  if (priority === "high") return high;
  if (priority === "medium") return med;
  if (priority === "low") return low;
  return "transparent";
}

export default function TaskCard({
  task,
  onToggle,
  onPress,
  onDelete,
  priorityHighColor = "#ef4444",
  priorityMedColor = "#f59e0b",
  priorityLowColor = "#22c55e",
}: TaskCardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(task.isDone ? 1 : 0)).current;

  const priorityColor = getPriorityColor(
    task.priority,
    priorityHighColor,
    priorityMedColor,
    priorityLowColor
  );

  function handleToggle() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    Animated.spring(checkScale, {
      toValue: task.isDone ? 0 : 1,
      useNativeDriver: true,
    }).start();
    onToggle();
  }

  const scheduled =
    task.scheduledDate
      ? `${task.scheduledDate}${task.scheduledTime ? " " + task.scheduledTime : ""}`
      : null;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderLeftWidth: task.priority !== "none" ? 4 : 0,
            borderLeftColor: priorityColor,
            opacity: task.isDone ? 0.65 : 1,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            {
              borderColor: task.isDone ? colors.success : colors.border,
              backgroundColor: task.isDone ? colors.success : "transparent",
              borderRadius: 20,
            },
          ]}
          onPress={handleToggle}
        >
          {task.isDone && (
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </Animated.View>
          )}
        </TouchableOpacity>

        <View style={styles.content}>
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
          {task.notes ? (
            <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={1}>
              {task.notes}
            </Text>
          ) : null}
          <View style={styles.meta}>
            {scheduled && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={11} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{scheduled}</Text>
              </View>
            )}
            {task.isRepeating && (
              <View style={styles.metaItem}>
                <Ionicons name="repeat" size={11} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.primary }]}>
                  {task.repeatType ?? "repeat"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  notes: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
