import React, { useMemo, useState } from "react";
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
import { DatePicker } from "@/components/DateTimePicker";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AddMoneyScreen() {
  const colors = useColors();
  const { moneyCategories, addMoneyRow, addQuickInput, moneyRows } = useApp();
  const activeCategories = moneyCategories.filter((c) => c.isActive);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [isQuick, setIsQuick] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickAmount, setQuickAmount] = useState("");

  const day = DAYS_OF_WEEK[new Date(date + "T12:00:00").getDay()];

  // Fix 7: get last entered values from the most recent moneyRow
  const lastRow = useMemo(() => {
    if (moneyRows.length === 0) return null;
    return moneyRows[moneyRows.length - 1];
  }, [moneyRows]);

  function handleSave() {
    if (isQuick) {
      if (!quickName.trim() || !quickAmount.trim()) return;
      addQuickInput({ rowId: "", name: quickName, amount: Number(quickAmount), date });
      router.back();
      return;
    }
    const amountMap: Record<string, number> = {};
    activeCategories.forEach((cat) => {
      const v = parseFloat(amounts[cat.nameAr] ?? "0") || 0;
      if (v) amountMap[cat.nameAr] = v;
    });
    addMoneyRow({ date, day, amounts: amountMap, notes: "" });
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              { backgroundColor: !isQuick ? colors.primary : colors.secondary, borderRadius: colors.radius },
            ]}
            onPress={() => setIsQuick(false)}
          >
            <Text style={{ color: !isQuick ? colors.primaryForeground : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              Full Entry
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              { backgroundColor: isQuick ? colors.primary : colors.secondary, borderRadius: colors.radius },
            ]}
            onPress={() => setIsQuick(true)}
          >
            <Text style={{ color: isQuick ? colors.primaryForeground : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              Quick Add
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Date</Text>
        <DatePicker value={date} onChange={setDate} placeholder="Select date" />
        {date ? <Text style={[styles.dayLabel, { color: colors.primary }]}>{day}</Text> : null}

        {isQuick ? (
          <>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Category Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius }]}
              value={quickName}
              onChangeText={setQuickName}
              placeholder="e.g. دولاب"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Amount (EGP)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius }]}
              value={quickAmount}
              onChangeText={setQuickAmount}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
            />
            {moneyRows.length === 0 && (
              <Text style={[styles.hint, { color: colors.destructive }]}>
                No existing entry to add to. Please use Full Entry first.
              </Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Amounts by Category</Text>
              {lastRow && (
                <Text style={[styles.lastValuesHint, { color: colors.mutedForeground }]}>
                  Hint: last entry values shown
                </Text>
              )}
            </View>
            {activeCategories.map((cat) => {
              const lastVal = lastRow?.amounts[cat.nameAr];
              return (
                <View key={cat.id} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.catLabel, { color: colors.foreground }]}>{cat.nameAr}</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[
                        styles.amtInput,
                        { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
                      ]}
                      value={amounts[cat.nameAr] ?? ""}
                      onChangeText={(v) => setAmounts((prev) => ({ ...prev, [cat.nameAr]: v }))}
                      placeholder={lastVal !== undefined ? String(lastVal) : "0"}
                      placeholderTextColor={lastVal !== undefined ? colors.primary + "aa" : colors.mutedForeground}
                      keyboardType="numeric"
                    />
                    {lastVal !== undefined && !amounts[cat.nameAr] && (
                      <TouchableOpacity
                        style={styles.useLast}
                        onPress={() =>
                          setAmounts((prev) => ({ ...prev, [cat.nameAr]: String(lastVal) }))
                        }
                      >
                        <Text style={[styles.useLastText, { color: colors.primary }]}>Use</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, marginTop: 24 }]}
          onPress={handleSave}
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
  modeRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  modeBtn: { flex: 1, height: 40, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { height: 44, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  dayLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 6 },
  hint: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 8 },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  lastValuesHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  catRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  amtInput: { width: 100, height: 40, paddingHorizontal: 12, fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "right" },
  useLast: { paddingHorizontal: 8, paddingVertical: 4 },
  useLastText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  saveBtn: { height: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
