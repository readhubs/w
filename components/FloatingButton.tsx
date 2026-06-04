import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface FloatingButtonProps {
  onPress: () => void;
  icon?: string;
  bottom?: number;
}

export default function FloatingButton({ onPress, icon = "add", bottom }: FloatingButtonProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: colors.primary,
          bottom: (bottom !== undefined ? bottom : 0) + insets.bottom + 90,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon as any} size={28} color={colors.primaryForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
