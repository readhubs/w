import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

// Native date/time picker (iOS/Android) — use a simple text-based picker on web
let RNDateTimePicker: any = null;
if (Platform.OS !== "web") {
  try {
    RNDateTimePicker = require("@react-native-community/datetimepicker").default;
  } catch {}
}

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  dateContext?: string;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

function parseDate(str: string): Date {
  if (!str) return new Date();
  const d = new Date(str + "T12:00:00");
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseTime(str: string, dateStr?: string): Date {
  const base = dateStr ? new Date(dateStr + "T12:00:00") : new Date();
  if (!str) return base;
  const [h, m] = str.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export function DatePicker({ value, onChange, placeholder = "Pick date" }: DatePickerProps) {
  const colors = useColors();
  const [show, setShow] = useState(false);

  if (Platform.OS === "web" || !RNDateTimePicker) {
    return (
      <View style={[styles.webInput, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
        <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            color: colors.foreground,
            fontSize: 15,
            fontFamily: "Inter_400Regular",
            outline: "none",
            padding: "0 4px",
          }}
        />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
        onPress={() => setShow(true)}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
        <Text style={[styles.pickerText, { color: value ? colors.foreground : colors.mutedForeground }]}>
          {value || placeholder}
        </Text>
        {value ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onChange("");
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      {show && (
        <RNDateTimePicker
          value={parseDate(value)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_: any, selectedDate?: Date) => {
            setShow(Platform.OS === "ios");
            if (selectedDate) onChange(formatDate(selectedDate));
            else setShow(false);
          }}
        />
      )}
    </>
  );
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick time",
  dateContext,
}: TimePickerProps) {
  const colors = useColors();
  const [show, setShow] = useState(false);

  if (Platform.OS === "web" || !RNDateTimePicker) {
    return (
      <View style={[styles.webInput, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
        <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            color: colors.foreground,
            fontSize: 15,
            fontFamily: "Inter_400Regular",
            outline: "none",
            padding: "0 4px",
          }}
        />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
        onPress={() => setShow(true)}
      >
        <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
        <Text style={[styles.pickerText, { color: value ? colors.foreground : colors.mutedForeground }]}>
          {value || placeholder}
        </Text>
        {value ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onChange("");
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      {show && (
        <RNDateTimePicker
          value={parseTime(value, dateContext)}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_: any, selectedDate?: Date) => {
            setShow(Platform.OS === "ios");
            if (selectedDate) onChange(formatTime(selectedDate));
            else setShow(false);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  pickerText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  webInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
  },
});
