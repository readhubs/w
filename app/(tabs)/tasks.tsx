import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { sendTodayTasksNotification } from "@/hooks/useNotificationScheduler";
import TaskCard from "@/components/TaskCard";
import TaskFormSheet from "@/components/TaskFormSheet";
import FloatingButton from "@/components/FloatingButton";
import ConfirmDialog from "@/components/ConfirmDialog";

type FilterType = "all" | "today" | "pending" | "done";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, addTask, updateTask, deleteTask, toggleTaskDone, projects, settings } = useApp();

  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<FilterType>("today");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const today = toDateStr(new Date());

  const filtered = tasks.filter((t) => {
    if (!settings.showDoneTasks && t.isDone) return false;
    if (filter === "today") return !t.scheduledDate || t.scheduledDate === today;
    if (filter === "pending") return !t.isDone;
    if (filter === "done") return t.isDone;
    return true;
  });

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "pending", label: "Pending" },
    { key: "done", label: "Done" },
    { key: "all", label: "All" },
  ];

  async function handlePushTodayTasks() {
    await sendTodayTasksNotification(tasks, settings);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handlePushTodayTasks}
            hitSlop={10}
            style={styles.headerBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            hitSlop={10}
            style={styles.headerBtn}
          >
            <Ionicons name="settings-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.secondary,
                borderRadius: colors.radius,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.key ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 30).duration(300)}
            layout={Layout.springify()}
          >
            <TaskCard
              task={item}
              project={projects.find((p) => p.id === item.projectId)}
              priorityHighColor={colors.priorityHigh}
              priorityMedColor={colors.priorityMed}
              priorityLowColor={colors.priorityLow}
              onPress={() =>
                router.push({ pathname: "/task/[id]", params: { id: item.id } })
              }
              onToggleDone={() => toggleTaskDone(item.id)}
              onDelete={() => setDeleteId(item.id)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No tasks here
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Tap + to add a task
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === "web" ? 34 + 90 : insets.bottom + 140,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      />

      <FloatingButton onPress={() => setShowAdd(true)} />

      <TaskFormSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Task"
        onSave={(values) => {
          addTask({
            ...values,
            tags: values.tags ?? [],
            priority: values.priority ?? "none",
            isDone: false,
            isRepeating: values.isRepeating ?? false,
            hasDeadline: values.hasDeadline ?? false,
          });
          setShowAdd(false);
        }}
      />

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Task"
        message="This task will be permanently deleted."
        onConfirm={() => {
          if (deleteId) deleteTask(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: { padding: 4 },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
