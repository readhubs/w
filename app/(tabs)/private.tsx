import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const PASSCODE = "2452";
const DOTS = [1, 2, 3, 4];
const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
];

function Keypad({ onInput }: { onInput: (k: string) => void }) {
  const colors = useColors();
  return (
    <View style={styles.keypad}>
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.keyRow}>
          {row.map((k, ki) => {
            if (!k) return <View key={ki} style={styles.keyPlaceholder} />;
            return (
              <TouchableOpacity
                key={ki}
                style={[styles.key, { backgroundColor: colors.secondary, borderRadius: 40 }]}
                onPress={() => onInput(k)}
                activeOpacity={0.7}
              >
                {k === "del" ? (
                  <Ionicons name="backspace-outline" size={22} color={colors.foreground} />
                ) : (
                  <Text style={[styles.keyText, { color: colors.foreground }]}>{k}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const insets = useSafeAreaInsets();

  function handleKey(k: string) {
    if (k === "del") {
      setInput((v) => v.slice(0, -1));
      setError(false);
      return;
    }
    if (input.length >= 4) return;
    const next = input + k;
    setInput(next);
    if (next.length === 4) {
      if (next === PASSCODE) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setInput("");
          setError(false);
        }, 700);
      }
    }
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.lockContainer,
        { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <Ionicons name="lock-closed" size={48} color={colors.primary} />
      <Text style={[styles.lockTitle, { color: colors.foreground }]}>Private</Text>
      <Text style={[styles.lockSub, { color: colors.mutedForeground }]}>
        Enter your 4-digit passcode
      </Text>

      <View style={styles.dotsRow}>
        {DOTS.map((d) => (
          <Animated.View
            key={d}
            style={[
              styles.dot,
              {
                backgroundColor:
                  input.length >= d
                    ? error
                      ? colors.destructive
                      : colors.primary
                    : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {error && (
        <Animated.Text
          entering={FadeInDown.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.errorText, { color: colors.destructive }]}
        >
          Incorrect passcode
        </Animated.Text>
      )}

      <Keypad onInput={handleKey} />
    </Animated.View>
  );
}

function PrivateContent() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { diaryEntries, moneyRows, moneyCategories } = useApp();
  const [tab, setTab] = useState<"diary" | "money">("diary");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalMoney = moneyRows.length > 0
    ? Object.values(moneyRows[moneyRows.length - 1].amounts).reduce((a, b) => a + b, 0)
    : 0;

  const delta =
    moneyRows.length >= 2
      ? moneyRows[moneyRows.length - 1].totalSum -
        moneyRows[moneyRows.length - 2].totalSum
      : 0;

  const activeCategories = moneyCategories.filter((c) => c.isActive);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Private</Text>
        <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            {
              backgroundColor: tab === "diary" ? colors.primary : colors.secondary,
              borderRadius: colors.radius,
            },
          ]}
          onPress={() => setTab("diary")}
        >
          <Ionicons
            name="book-outline"
            size={16}
            color={tab === "diary" ? colors.primaryForeground : colors.mutedForeground}
          />
          <Text
            style={[
              styles.tabText,
              { color: tab === "diary" ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            Diary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            {
              backgroundColor: tab === "money" ? colors.primary : colors.secondary,
              borderRadius: colors.radius,
            },
          ]}
          onPress={() => setTab("money")}
        >
          <Ionicons
            name="cash-outline"
            size={16}
            color={tab === "money" ? colors.primaryForeground : colors.mutedForeground}
          />
          <Text
            style={[
              styles.tabText,
              { color: tab === "money" ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            Money
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "diary" && (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[
              styles.addDiaryBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
            onPress={() => router.push("/diary/new")}
          >
            <Ionicons name="add" size={20} color={colors.primaryForeground} />
            <Text style={[styles.addDiaryText, { color: colors.primaryForeground }]}>
              New Diary Entry
            </Text>
          </TouchableOpacity>

          {diaryEntries.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No diary entries yet
              </Text>
            </View>
          )}

          {diaryEntries.map((entry, idx) => (
            <Animated.View
              key={entry.id}
              entering={FadeInDown.delay(idx * 30).duration(300)}
            >
              <TouchableOpacity
                style={[
                  styles.diaryCard,
                  { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border },
                ]}
                onPress={() => router.push({ pathname: "/diary/[id]", params: { id: entry.id } })}
              >
                <Text style={[styles.diaryTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {entry.title || "Untitled"}
                </Text>
                <Text style={[styles.diaryPreview, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {entry.content}
                </Text>
                <Text style={[styles.diaryDate, { color: colors.mutedForeground }]}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {tab === "money" && (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.moneyCards}>
            <View
              style={[
                styles.totalCard,
                { backgroundColor: "#f59e0b22", borderRadius: colors.radius * 1.5, borderColor: "#f59e0b44" },
              ]}
            >
              <Text style={[styles.totalLabel, { color: "#f59e0b" }]}>Total Money</Text>
              <Text style={[styles.totalAmount, { color: "#f59e0b" }]}>
                {totalMoney.toLocaleString()} EGP
              </Text>
            </View>
            <View
              style={[
                styles.deltaCard,
                {
                  backgroundColor: (delta >= 0 ? colors.success : colors.destructive) + "22",
                  borderRadius: colors.radius * 1.5,
                  borderColor: (delta >= 0 ? colors.success : colors.destructive) + "44",
                },
              ]}
            >
              <Text
                style={[
                  styles.totalLabel,
                  { color: delta >= 0 ? colors.success : colors.destructive },
                ]}
              >
                {delta >= 0 ? "Change +" : "Change "}{delta.toLocaleString()} EGP
              </Text>
              <Ionicons
                name={delta >= 0 ? "trending-up" : "trending-down"}
                size={28}
                color={delta >= 0 ? colors.success : colors.destructive}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addDiaryBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius, marginBottom: 12 },
            ]}
            onPress={() => router.push("/money/add")}
          >
            <Ionicons name="add" size={20} color={colors.primaryForeground} />
            <Text style={[styles.addDiaryText, { color: colors.primaryForeground }]}>
              Add Money Entry
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addDiaryBtn,
              { backgroundColor: colors.secondary, borderRadius: colors.radius, marginBottom: 16 },
            ]}
            onPress={() => router.push("/money/table")}
          >
            <Ionicons name="grid-outline" size={20} color={colors.foreground} />
            <Text style={[styles.addDiaryText, { color: colors.foreground }]}>
              View Table
            </Text>
          </TouchableOpacity>

          {moneyRows.slice().reverse().map((row, idx) => (
            <Animated.View key={row.id} entering={FadeInDown.delay(idx * 30).duration(300)}>
              <View
                style={[
                  styles.moneyRow,
                  { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border },
                ]}
              >
                <View style={styles.moneyRowHeader}>
                  <Text style={[styles.moneyDate, { color: colors.foreground }]}>
                    {row.day} {row.date}
                  </Text>
                  <Text style={[styles.moneyTotal, { color: colors.primary }]}>
                    {row.totalSum.toLocaleString()} EGP
                  </Text>
                </View>
                {activeCategories.map((cat) => {
                  const val = row.amounts[cat.nameAr] ?? 0;
                  if (!val) return null;
                  return (
                    <View key={cat.id} style={styles.catRow}>
                      <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.catName, { color: colors.mutedForeground }]}>
                        {cat.nameAr}
                      </Text>
                      <Text style={[styles.catAmt, { color: colors.foreground }]}>
                        {val.toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          ))}

          {moneyRows.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="cash-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No money entries yet
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

export default function PrivateScreen() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }
  return <PrivateContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lockContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  lockTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 16 },
  lockSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  dotsRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  keypad: { width: "100%", gap: 12, marginTop: 16 },
  keyRow: { flexDirection: "row", justifyContent: "center", gap: 20 },
  key: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  keyPlaceholder: { width: 72, height: 72 },
  keyText: { fontSize: 24, fontFamily: "Inter_400Regular" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", gap: 8, padding: 12 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  addDiaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, marginBottom: 12 },
  addDiaryText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  diaryCard: { padding: 14, marginBottom: 10, borderWidth: 1 },
  diaryTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  diaryPreview: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 6 },
  diaryDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  moneyCards: { flexDirection: "row", gap: 10, marginBottom: 16 },
  totalCard: { flex: 1, padding: 16, borderWidth: 1, alignItems: "center" },
  deltaCard: { flex: 1, padding: 16, borderWidth: 1, alignItems: "center", gap: 4 },
  totalLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  totalAmount: { fontSize: 20, fontFamily: "Inter_700Bold" },
  moneyRow: { padding: 14, marginBottom: 10, borderWidth: 1 },
  moneyRowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  moneyDate: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  moneyTotal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  catRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 3 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  catAmt: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
