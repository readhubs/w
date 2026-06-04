import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import ConfirmDialog from "@/components/ConfirmDialog";

const MOODS = ["😊", "😐", "😔", "😤", "😴", "🤩"];

export default function DiaryEntryScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { diaryEntries, updateDiaryEntry, deleteDiaryEntry } = useApp();

  const entry = diaryEntries.find((e) => e.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [mood, setMood] = useState(entry?.mood);
  const [showDelete, setShowDelete] = useState(false);

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Entry not found</Text>
      </View>
    );
  }

  function handleSave() {
    updateDiaryEntry(entry!.id, { title, content, mood });
    setIsEditing(false);
  }

  function handleDelete() {
    deleteDiaryEntry(entry!.id);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <>
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.moodBtn,
                    {
                      backgroundColor: mood === m ? colors.primary + "33" : colors.secondary,
                      borderRadius: 12,
                      borderWidth: mood === m ? 2 : 0,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setMood(mood === m ? undefined : m)}
                >
                  <Text style={styles.moodEmoji}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[
                styles.contentInput,
                { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
              ]}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              placeholder="Write your thoughts..."
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.editBtns}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
                onPress={() => {
                  setTitle(entry.title);
                  setContent(entry.content);
                  setMood(entry.mood);
                  setIsEditing(false);
                }}
              >
                <Text style={[styles.btnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius, flex: 1 }]}
                onPress={handleSave}
              >
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {entry.mood && <Text style={styles.moodDisplay}>{entry.mood}</Text>}
            <Text style={[styles.entryTitle, { color: colors.foreground }]}>{entry.title || "Untitled"}</Text>
            <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>
              {new Date(entry.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={[styles.entryContent, { color: colors.foreground }]}>{entry.content}</Text>
          </>
        )}
      </ScrollView>

      {!isEditing && (
        <View style={[styles.actions, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
            onPress={() => setIsEditing(true)}
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
      )}

      <ConfirmDialog
        visible={showDelete}
        title="Delete Entry"
        message="This diary entry will be permanently deleted."
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
  moodDisplay: { fontSize: 40, textAlign: "center", marginBottom: 8 },
  entryTitle: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 32 },
  entryDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  entryContent: { fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 26, marginTop: 8 },
  titleInput: { height: 44, paddingHorizontal: 14, fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  moodRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 12 },
  moodBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  moodEmoji: { fontSize: 24 },
  contentInput: { minHeight: 200, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  editBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: { height: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  actions: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48 },
  actionText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
