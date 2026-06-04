import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { MoneyRow } from "@/context/AppContext";

export default function MoneyTableScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { moneyRows, moneyCategories, updateMoneyRow, deleteMoneyRow } = useApp();
  const activeCategories = moneyCategories.filter((c) => c.isActive);

  const allColumns = ["Date", "Day", ...activeCategories.map((c) => c.nameAr), "Total", ""];

  // Edit state
  const [editRow, setEditRow] = useState<MoneyRow | null>(null);
  const [editAmounts, setEditAmounts] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function openEdit(row: MoneyRow) {
    setEditRow(row);
    const amtStrs: Record<string, string> = {};
    activeCategories.forEach((cat) => {
      const v = row.amounts[cat.nameAr];
      if (v !== undefined) amtStrs[cat.nameAr] = String(v);
    });
    setEditAmounts(amtStrs);
  }

  function handleSave() {
    if (!editRow) return;
    const newAmounts: Record<string, number> = {};
    activeCategories.forEach((cat) => {
      const v = parseFloat(editAmounts[cat.nameAr] ?? "0") || 0;
      if (v) newAmounts[cat.nameAr] = v;
    });
    updateMoneyRow(editRow.id, { amounts: newAmounts });
    setEditRow(null);
  }

  function handleDelete() {
    if (!editRow) return;
    deleteMoneyRow(editRow.id);
    setEditRow(null);
    setShowDeleteConfirm(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={[styles.headerRow, { backgroundColor: colors.primary }]}>
            {allColumns.map((col, i) => (
              <View key={`${col}-${i}`} style={[styles.cell, col === "" ? styles.actionCell : {}]}>
                <Text style={[styles.headerText, { color: colors.primaryForeground }]} numberOfLines={1}>
                  {col}
                </Text>
              </View>
            ))}
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {moneyRows.length === 0 && (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No data yet. Add an entry first.
                </Text>
              </View>
            )}
            {moneyRows.map((row, idx) => (
              <TouchableOpacity
                key={row.id}
                style={[styles.dataRow, { backgroundColor: idx % 2 === 0 ? colors.card : colors.secondary }]}
                onPress={() => openEdit(row)}
                activeOpacity={0.7}
              >
                <View style={styles.cell}>
                  <Text style={[styles.cellText, { color: colors.foreground }]}>{row.date}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={[styles.cellText, { color: colors.mutedForeground }]}>{row.day}</Text>
                </View>
                {activeCategories.map((cat) => (
                  <View key={cat.id} style={styles.cell}>
                    <Text style={[styles.cellText, { color: colors.foreground }]}>
                      {(row.amounts[cat.nameAr] ?? 0).toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View style={styles.cell}>
                  <Text style={[styles.cellText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {row.totalSum.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.actionCell}>
                  <Ionicons name="pencil-outline" size={14} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal transparent animationType="slide" visible={!!editRow} onRequestClose={() => setEditRow(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: "80%",
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Edit Entry — {editRow?.date}
              </Text>
              <TouchableOpacity onPress={() => setEditRow(null)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {activeCategories.map((cat) => (
                <View key={cat.id} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.catLabel, { color: colors.foreground }]}>{cat.nameAr}</Text>
                  <TextInput
                    style={[
                      styles.amtInput,
                      { backgroundColor: colors.secondary, color: colors.foreground, borderRadius: colors.radius },
                    ]}
                    value={editAmounts[cat.nameAr] ?? ""}
                    onChangeText={(v) => setEditAmounts((prev) => ({ ...prev, [cat.nameAr]: v }))}
                    placeholder="0"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                  />
                </View>
              ))}

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, flex: 1 }]}
                  onPress={handleSave}
                >
                  <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.destructive, borderRadius: colors.radius }]}
                  onPress={() => setShowDeleteConfirm(true)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete confirm inside edit modal */}
      <Modal transparent visible={showDeleteConfirm} onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmBox, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Delete Entry?</Text>
            <Text style={[styles.confirmMsg, { color: colors.mutedForeground }]}>
              This money entry will be permanently deleted.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.confirmBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.destructive, borderRadius: colors.radius }]}
                onPress={handleDelete}
              >
                <Text style={[styles.confirmBtnText, { color: "#fff" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row" },
  dataRow: { flexDirection: "row" },
  cell: {
    width: 110,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
  },
  actionCell: {
    width: 40,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  cellText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: {},
  handle: { width: 40, height: 4, backgroundColor: "#444", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  modalScroll: { paddingHorizontal: 20 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  amtInput: { width: 120, height: 40, paddingHorizontal: 12, fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "right" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 8 },
  saveBtn: { height: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  confirmOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", padding: 24 },
  confirmBox: { width: "100%", padding: 24, gap: 12 },
  confirmTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  confirmMsg: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  confirmBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  confirmBtn: { flex: 1, height: 44, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
