import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeStr(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseDate(s: string): Date {
  const d = new Date(s + "T12:00:00");
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const base = dateStr ? parseDate(dateStr) : new Date();
  if (timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    base.setHours(h ?? 0, m ?? 0, 0, 0);
  }
  return base;
}

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  minimumDate?: Date;
}

export function DatePicker({ value, onChange, placeholder = "Select date", label, minimumDate }: DatePickerProps) {
  const colors = useColors();
  const [show, setShow] = useState(false);

  const displayDate = value
    ? new Date(value + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrapper}>
        {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            height: 44,
            paddingLeft: 14,
            paddingRight: 14,
            fontSize: 15,
            fontFamily: "Inter_400Regular",
            backgroundColor: colors.secondary,
            color: colors.foreground,
            border: "none",
            borderRadius: colors.radius,
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </View>
    );
  }

  if (Platform.OS === "android") {
    return (
      <View style={styles.wrapper}>
        {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
          onPress={() => setShow(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={[styles.btnText, { color: displayDate ? colors.foreground : colors.mutedForeground }]}>
            {displayDate ?? placeholder}
          </Text>
          {value ? (
            <TouchableOpacity onPress={() => onChange("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
        {show && (
          <RNDateTimePicker
            mode="date"
            value={value ? parseDate(value) : new Date()}
            minimumDate={minimumDate}
            onChange={(_, d) => {
              setShow(false);
              if (d) onChange(toDateStr(d));
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        <Text style={[styles.btnText, { color: displayDate ? colors.foreground : colors.mutedForeground }]}>
          {displayDate ?? placeholder}
        </Text>
        {value ? (
          <TouchableOpacity onPress={() => onChange("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      <Modal transparent visible={show} animationType="fade" onRequestClose={() => setShow(false)}>
        <View style={styles.iosOverlay}>
          <View style={[styles.iosSheet, { backgroundColor: colors.card }]}>
            <View style={styles.iosHeader}>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={[styles.iosDone, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={[styles.iosDone, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <RNDateTimePicker
              mode="date"
              display="spinner"
              value={value ? parseDate(value) : new Date()}
              minimumDate={minimumDate}
              onChange={(_, d) => {
                if (d) onChange(toDateStr(d));
              }}
              style={{ width: "100%" }}
              themeVariant="dark"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface TimePickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  dateContext?: string;
}

export function TimePicker({ value, onChange, placeholder = "Select time", label, dateContext }: TimePickerProps) {
  const colors = useColors();
  const [show, setShow] = useState(false);

  const displayTime = value
    ? (() => {
        const [h, m] = value.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      })()
    : null;

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrapper}>
        {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            height: 44,
            paddingLeft: 14,
            paddingRight: 14,
            fontSize: 15,
            fontFamily: "Inter_400Regular",
            backgroundColor: colors.secondary,
            color: colors.foreground,
            border: "none",
            borderRadius: colors.radius,
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </View>
    );
  }

  if (Platform.OS === "android") {
    return (
      <View style={styles.wrapper}>
        {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
          onPress={() => setShow(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={[styles.btnText, { color: displayTime ? colors.foreground : colors.mutedForeground }]}>
            {displayTime ?? placeholder}
          </Text>
          {value ? (
            <TouchableOpacity onPress={() => onChange("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
        {show && (
          <RNDateTimePicker
            mode="time"
            is24Hour={false}
            value={parseDateTime(dateContext ?? "", value)}
            onChange={(_, d) => {
              setShow(false);
              if (d) onChange(toTimeStr(d));
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="time-outline" size={18} color={colors.primary} />
        <Text style={[styles.btnText, { color: displayTime ? colors.foreground : colors.mutedForeground }]}>
          {displayTime ?? placeholder}
        </Text>
        {value ? (
          <TouchableOpacity onPress={() => onChange("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      <Modal transparent visible={show} animationType="fade" onRequestClose={() => setShow(false)}>
        <View style={styles.iosOverlay}>
          <View style={[styles.iosSheet, { backgroundColor: colors.card }]}>
            <View style={styles.iosHeader}>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={[styles.iosDone, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={[styles.iosDone, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <RNDateTimePicker
              mode="time"
              display="spinner"
              is24Hour={false}
              value={parseDateTime(dateContext ?? "", value)}
              onChange={(_, d) => {
                if (d) onChange(toTimeStr(d));
              }}
              style={{ width: "100%" }}
              themeVariant="dark"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  btn: {
    height: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  iosOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  iosSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  iosHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  iosDone: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
