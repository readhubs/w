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
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function NewDiaryScreen() {
  const colors = useColors();
  const { addDiaryEntry, categories } = useApp();
  const diaryCategories = categories.filter((c) => c.type === "diary");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();

  function handleSave() {
    if (!content.trim()) return;
    addDiaryEntry({ title, content, photos: [], categoryId });
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput
          style={[styles.titleInput, { color: colors.foreground }]}
          placeholder="Title..."
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          fontSize={24}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: !categoryId ? colors.primary : colors.secondary, borderRadius: 20 },
              ]}
              onPress={() => setCategoryId(undefined)}
            >
              <Text style={{ color: !categoryId ? colors.primaryForeground : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
                None
              </Text>
            </TouchableOpacity>
            {diaryCategories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: categoryId === c.id ? c.color : colors.secondary,
                    borderRadius: 20,
                  },
                ]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text style={{ color: categoryId === c.id ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TextInput
          style={[styles.contentInput, { color: colors.foreground }]}
          placeholder="Write your thoughts..."
          placeholderTextColor={colors.mutedForeground}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: content.trim() ? colors.primary : colors.border, borderRadius: colors.radius }]}
          onPress={handleSave}
          disabled={!content.trim()}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  titleInput: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 20 },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.5, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6 },
  contentInput: { fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 26, minHeight: 300 },
  footer: { padding: 16, borderTopWidth: 1 },
  saveBtn: { height: 48, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
