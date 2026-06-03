import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface FloatingButtonProps {
  onPress: () => void;
  icon?: string;
  bottom?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FloatingButton({
  onPress,
  icon = "add",
  bottom,
}: FloatingButtonProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <AnimatedTouchable
      style={[
        styles.fab,
        animStyle,
        {
          backgroundColor: colors.primary,
          bottom: (bottom ?? 0) + insets.bottom + 88,
          borderRadius: 28,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={28} color={colors.primaryForeground} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#FFC000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 100,
  },
});
