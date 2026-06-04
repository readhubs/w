import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const MOODS = ["😊", "😐", "😔", "😤", "😴", "🤩"];

export default function NewDiaryScreen() {
  const colors = useColors();
  const { addDiaryEntry } = useApp();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | undefined>(undefined);

  function handleSave() {
    if (!content.trim() && !title.trim()) return;
    addDiaryEntry({ title: title.trim(), content: content.trim(), photos: [], mood });
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Title</Text>
        <TextInput
          style={[styles.titleInput, { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius }]}
          placeholder="Entry title (optional)"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Mood</Text>
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

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Content</Text>
        <TextInput
          style={[
            styles.contentInput,
            { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
          ]}
          placeholder="Write your thoughts..."
          placeholderTextColor={colors.mutedForeground}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: content.trim() || title.trim() ? colors.primary : colors.border,
              borderRadius: colors.radius,
              marginTop: 24,
            },
          ]}
          onPress={handleSave}
          disabled={!content.trim() && !title.trim()}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  titleInput: { height: 44, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  moodRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  moodBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  moodEmoji: { fontSize: 24 },
  contentInput: { minHeight: 200, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  saveBtn: { height: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
