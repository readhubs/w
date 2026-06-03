import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  Layout,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp, type Task } from "@/context/AppContext";
import TaskCard from "@/components/TaskCard";
import FloatingButton from "@/components/FloatingButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskFormSheet from "@/components/TaskFormSheet";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDays() {
  const today = new Date();
  const days = [];
  for (let i = -2; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, toggleTaskDone, deleteTask, addTask, settings } = useApp();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  const weekDays = getWeekDays();

  const displayedTasks = useMemo(() => {
    let filtered = tasks;

    if (selectedDate) {
      filtered = filtered.filter((t) => {
        if (!t.scheduledDate) return selectedDate === toDateStr(today);
        return t.scheduledDate === selectedDate || (t.isRepeating && t.scheduledDate <= selectedDate);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    const done = filtered.filter((t) => t.isDone);
    const notDone = filtered.filter((t) => !t.isDone);
    return [...notDone, ...done];
  }, [tasks, selectedDate, searchQuery]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Micky</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setSearchVisible((v) => !v)} hitSlop={8}>
            <Ionicons
              name={searchVisible ? "close" : "search"}
              size={22}
              color={colors.foreground}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/settings")} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
          <Text
            style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}
            onPress={() => {}}
          >
            Search tasks...
          </Text>
        </Animated.View>
      )}

      <View style={styles.calendarRow}>
        <FlatList
          data={weekDays}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(d) => d.toISOString()}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item: day }) => {
            const ds = toDateStr(day);
            const isSelected = ds === selectedDate;
            const isToday = ds === toDateStr(today);
            const dayTasks = tasks.filter((t) => t.scheduledDate === ds);
            const hasDots = dayTasks.length > 0;
            return (
              <TouchableOpacity
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderRadius: colors.radius,
                    borderWidth: isToday && !isSelected ? 1 : 0,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedDate(ds)}
              >
                <Text
                  style={[
                    styles.dayName,
                    { color: isSelected ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {DAYS[day.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    { color: isSelected ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {day.getDate()}
                </Text>
                {hasDots && (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isSelected ? colors.primaryForeground : colors.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {selectedDate === toDateStr(today) ? "Today" : selectedDate}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
          {displayedTasks.filter((t) => !t.isDone).length} remaining
        </Text>
      </View>

      <FlatList
        data={displayedTasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 30).duration(300)}
            layout={Layout.springify()}
          >
            <TaskCard
              task={item}
              onToggle={() => toggleTaskDone(item.id)}
              onPress={() => router.push({ pathname: "/task/[id]", params: { id: item.id } })}
              onDelete={() => setDeleteId(item.id)}
              priorityHighColor={settings.priorityHighColor}
              priorityMedColor={settings.priorityMedColor}
              priorityLowColor={settings.priorityLowColor}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkbox-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No tasks for this day
            </Text>
            <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>
              Tap + to add your first task
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 34 + 90 : insets.bottom + 140,
        }}
        showsVerticalScrollIndicator={false}
      />

      <FloatingButton onPress={() => setShowAdd(true)} />

      <TaskFormSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(task) => addTask({ ...task, isDone: false })}
      />

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Task"
        message="This task will be permanently deleted. Are you sure?"
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
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  headerRight: { flexDirection: "row", gap: 16, alignItems: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
  },
  searchPlaceholder: { fontSize: 14, fontFamily: "Inter_400Regular" },
  calendarRow: { paddingVertical: 12 },
  dayCell: {
    width: 48,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
  },
  dayName: { fontSize: 11, fontFamily: "Inter_500Medium" },
  dayNum: { fontSize: 17, fontFamily: "Inter_700Bold" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  emptySubText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
