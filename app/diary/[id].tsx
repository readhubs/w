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

export default function DiaryDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { diaryEntries, updateDiaryEntry, deleteDiaryEntry } = useApp();

  const entry = diaryEntries.find((e) => e.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [showDelete, setShowDelete] = useState(false);

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40, fontFamily: "Inter_400Regular" }}>
          Entry not found
        </Text>
      </View>
    );
  }

  function handleSave() {
    updateDiaryEntry(id, { title, content });
    setIsEditing(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <>
            <TextInput
              style={[styles.titleEdit, { color: colors.foreground }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title..."
              placeholderTextColor={colors.mutedForeground}
              fontSize={22}
            />
            <TextInput
              style={[styles.contentEdit, { color: colors.foreground }]}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              autoFocus
            />
          </>
        ) : (
          <>
            {entry.title ? (
              <Text style={[styles.title, { color: colors.foreground }]}>{entry.title}</Text>
            ) : null}
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {new Date(entry.createdAt).toLocaleString()}
            </Text>
            <Text style={[styles.content, { color: colors.foreground }]}>{entry.content}</Text>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        {isEditing ? (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleSave}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius, flex: 1 }]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={18} color={colors.foreground} />
              <Text style={[styles.btnText, { color: colors.foreground }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.destructive, borderRadius: colors.radius, flex: 1 }]}
              onPress={() => setShowDelete(true)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={[styles.btnText, { color: "#fff" }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ConfirmDialog
        visible={showDelete}
        title="Delete Entry"
        message="This diary entry will be permanently deleted."
        onConfirm={() => {
          deleteDiaryEntry(id);
          router.back();
        }}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 8 },
  titleEdit: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 12 },
  date: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 16 },
  content: { fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 26 },
  contentEdit: { fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 26, minHeight: 300 },
  footer: { padding: 16, borderTopWidth: 1 },
  footerRow: { flexDirection: "row", gap: 12 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, paddingHorizontal: 16 },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
