import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { Project, ProjectTask } from "@/context/AppContext";

interface ProjectCardProps {
  project: Project;
  tasks: ProjectTask[];
  onPress: () => void;
  onDelete: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProjectCard({ project, tasks, onPress, onDelete }: ProjectCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const doneTasks = tasks.filter((t) => t.isDone).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSpring(0.97, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const cardBg = project.isDone ? colors.success + "22" : colors.card;
  const accentColor = project.isDone ? colors.success : project.color ?? colors.primary;

  return (
    <AnimatedTouchable
      style={[
        styles.card,
        animStyle,
        {
          backgroundColor: cardBg,
          borderRadius: colors.radius * 1.5,
          borderWidth: 1,
          borderColor: project.isDone ? colors.success + "55" : colors.border,
        },
      ]}
      onPress={handlePress}
      activeOpacity={1}
    >
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <Text
          style={[
            styles.name,
            {
              color: project.isDone ? colors.success : colors.foreground,
              flex: 1,
            },
          ]}
          numberOfLines={1}
        >
          {project.name}
        </Text>
        {project.isDone && (
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        )}
        <TouchableOpacity onPress={onDelete} hitSlop={8} style={{ marginLeft: 8 }}>
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {project.startDate}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="list-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {doneTasks}/{totalTasks} tasks
          </Text>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: accentColor,
              width: `${progress * 100}%` as any,
              borderRadius: 4,
            },
          ]}
        />
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 7,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  meta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
  },
});
