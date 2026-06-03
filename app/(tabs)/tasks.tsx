import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import TaskCard from "@/components/TaskCard";
import FloatingButton from "@/components/FloatingButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskFormSheet from "@/components/TaskFormSheet";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getWeekDays(centerDate: Date) {
  const days = [];
  for (let i = -2; i <= 6; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string, todayStr: string) {
  if (dateStr === todayStr) return "Today";
  const d = new Date(dateStr + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, toggleTaskDone, deleteTask, addTask, settings } = useApp();

  const today = new Date();
  const todayStr = toDateStr(today);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [calendarCenter, setCalendarCenter] = useState(today);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  const weekDays = getWeekDays(calendarCenter);

  function handleCalendarPickerChange(_: any, date?: Date) {
    if (Platform.OS === "android") setShowCalendarPicker(false);
    if (date) {
      setSelectedDate(toDateStr(date));
      setCalendarCenter(date);
    }
  }

  function handleDayPress(ds: string, day: Date) {
    setSelectedDate(ds);
    setCalendarCenter(day);
  }

  const displayedTasks = useMemo(() => {
    let filtered = tasks;
    if (selectedDate) {
      filtered = filtered.filter((t) => {
        if (!t.scheduledDate) return selectedDate === todayStr;
        return t.scheduledDate === selectedDate || (t.isRepeating && t.scheduledDate <= selectedDate);
      });
    }
    if (!settings.showDoneTasks) {
      filtered = filtered.filter((t) => !t.isDone);
    }
    const done = filtered.filter((t) => t.isDone);
    const notDone = filtered.filter((t) => !t.isDone);
    return [...notDone, ...done];
  }, [tasks, selectedDate, settings.showDoneTasks]);

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
          <TouchableOpacity onPress={() => router.push("/settings")} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarRow}>
        <FlatList
          data={weekDays}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(d) => d.toISOString()}
          contentContainerStyle={{ paddingLeft: 12, paddingRight: 4, gap: 8 }}
          style={{ flex: 1 }}
          renderItem={({ item: day }) => {
            const ds = toDateStr(day);
            const isSelected = ds === selectedDate;
            const isToday = ds === todayStr;
            const hasDots = tasks.some((t) => t.scheduledDate === ds);
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
                onPress={() => handleDayPress(ds, day)}
              >
                <Text style={[styles.dayName, { color: isSelected ? colors.primaryForeground : colors.mutedForeground }]}>
                  {DAYS[day.getDay()]}
                </Text>
                <Text style={[styles.dayNum, { color: isSelected ? colors.primaryForeground : colors.foreground }]}>
                  {day.getDate()}
                </Text>
                {hasDots && (
                  <View style={[styles.dot, { backgroundColor: isSelected ? colors.primaryForeground : colors.primary }]} />
                )}
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity
          onPress={() => setShowCalendarPicker(true)}
          style={[styles.calendarBtn, { backgroundColor: colors.card, borderRadius: colors.radius }]}
          hitSlop={4}
        >
          <Ionicons name="calendar" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {formatDisplayDate(selectedDate, todayStr)}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
          {displayedTasks.filter((t) => !t.isDone).length} remaining
        </Text>
      </View>

      <FlatList
        data={displayedTasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30).duration(300)} layout={Layout.springify()}>
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
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tasks for this day</Text>
            <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>Tap + to add your first task</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 90 : insets.bottom + 140 }}
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
        onConfirm={() => { if (deleteId) deleteTask(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />

      {showCalendarPicker && Platform.OS === "ios" && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowCalendarPicker(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCalendarPicker(false)}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
              <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Pick a Date</Text>
              <DateTimePicker
                value={new Date(selectedDate + "T00:00:00")}
                mode="date"
                display="inline"
                onChange={handleCalendarPickerChange}
              />
              <TouchableOpacity style={[styles.pickerDone, { backgroundColor: colors.primary }]} onPress={() => setShowCalendarPicker(false)}>
                <Text style={[styles.pickerDoneText, { color: colors.primaryForeground }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {showCalendarPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={new Date(selectedDate + "T00:00:00")}
          mode="date"
          display="calendar"
          onChange={handleCalendarPickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  headerRight: { flexDirection: "row", gap: 16, alignItems: "center" },
  calendarRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  dayCell: { width: 48, paddingVertical: 10, alignItems: "center", gap: 4 },
  dayName: { fontSize: 11, fontFamily: "Inter_500Medium" },
  dayNum: { fontSize: 17, fontFamily: "Inter_700Bold" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  calendarBtn: { width: 40, height: 60, alignItems: "center", justifyContent: "center", marginRight: 8, marginLeft: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 8 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  emptySubText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  pickerContainer: { borderRadius: 16, padding: 16, width: "100%", maxWidth: 360 },
  pickerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  pickerDone: { marginTop: 12, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  pickerDoneText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
