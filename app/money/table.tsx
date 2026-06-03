import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function MoneyTableScreen() {
  const colors = useColors();
  const { moneyRows, moneyCategories } = useApp();
  const activeCategories = moneyCategories.filter((c) => c.isActive);

  const allColumns = ["Date", "Day", ...activeCategories.map((c) => c.nameAr), "Total"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          <View style={[styles.headerRow, { backgroundColor: colors.primary }]}>
            {allColumns.map((col) => (
              <View key={col} style={styles.cell}>
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
              <View
                key={row.id}
                style={[
                  styles.dataRow,
                  { backgroundColor: idx % 2 === 0 ? colors.card : colors.secondary },
                ]}
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
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
  headerText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  cellText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
