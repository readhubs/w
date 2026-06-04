import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import ProjectCard from "@/components/ProjectCard";
import FloatingButton from "@/components/FloatingButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import { DatePicker } from "@/components/DateTimePicker";

const PROJECT_COLORS = [
  "#FFC000", "#3b82f6", "#8b5cf6", "#22c55e",
  "#ef4444", "#f59e0b", "#ec4899", "#14b8a6",
];

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, projectTasks, addProject, deleteProject } = useApp();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const displayed = projects.filter((p) =>
    searchQuery.trim()
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  function handleCreate() {
    if (!name.trim()) return;
    const proj = addProject({
      name: name.trim(),
      startDate: startDate || new Date().toISOString().split("T")[0],
      color: selectedColor,
    });
    setName("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setSelectedColor(PROJECT_COLORS[0]);
    setShowAdd(false);
    router.push({ pathname: "/project/[id]", params: { id: proj.id } });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Projects</Text>
        <TouchableOpacity onPress={() => setSearchVisible((v) => !v)} hitSlop={8}>
          <Ionicons name={searchVisible ? "close" : "search"} size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {searchVisible && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={[styles.searchBar, { backgroundColor: colors.secondary }]}
        >
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search projects..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </Animated.View>
      )}

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{projects.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.statNum, { color: colors.success }]}>
            {projects.filter((p) => p.isDone).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Done</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.statNum, { color: colors.warning }]}>
            {projects.filter((p) => !p.isDone).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Active</Text>
        </View>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(p) => p.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 40).duration(350)}
            layout={Layout.springify()}
          >
            <ProjectCard
              project={item}
              tasks={projectTasks.filter((pt) => pt.projectId === item.id)}
              onPress={() => router.push({ pathname: "/project/[id]", params: { id: item.id } })}
              onDelete={() => setDeleteId(item.id)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No projects yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Tap + to create your first project</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 90 : insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      />

      <FloatingButton onPress={() => setShowAdd(true)} icon="folder-open" />

      <Modal transparent animationType="slide" visible={showAdd} onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 16,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Project</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Project Name *</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
                ]}
                placeholder="Project name..."
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                autoFocus
              />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Start Date</Text>
              <DatePicker value={startDate} onChange={setStartDate} placeholder="Select start date" />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Color</Text>
              <View style={styles.colorRow}>
                {PROJECT_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c, borderWidth: selectedColor === c ? 3 : 0, borderColor: colors.foreground },
                    ]}
                    onPress={() => setSelectedColor(c)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  { backgroundColor: name.trim() ? colors.primary : colors.border, borderRadius: colors.radius, marginTop: 24 },
                ]}
                onPress={handleCreate}
                disabled={!name.trim()}
              >
                <Text style={[styles.createBtnText, { color: colors.primaryForeground }]}>Create Project</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Project"
        message="This will permanently delete the project and all its tasks. Are you sure?"
        onConfirm={() => {
          if (deleteId) deleteProject(deleteId);
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  statCard: { flex: 1, padding: 12, alignItems: "center", elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  statNum: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { maxHeight: "80%" },
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 12 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalScroll: { paddingHorizontal: 20 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: { height: 44, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 4 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  createBtn: { height: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  createBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
