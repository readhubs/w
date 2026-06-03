import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmDialogProps) {
  const colors = useColors();

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onCancel}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay]}
      >
        <Animated.View
          entering={ZoomIn.duration(250).springify()}
          exiting={ZoomOut.duration(200)}
          style={[
            styles.dialog,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius * 1.5 },
          ]}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: destructive ? colors.destructive : colors.primary,
                  borderRadius: colors.radius,
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: destructive ? colors.destructiveForeground : colors.primaryForeground },
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    padding: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
