import { useColorScheme } from "react-native";
import { useContext } from "react";
import colors from "@/constants/colors";
import { AppContext } from "@/context/AppContext";

export function useColors() {
  const systemScheme = useColorScheme();
  const ctx = useContext(AppContext);

  // Use settings.darkMode when inside AppProvider, otherwise fall back to system scheme
  const isDark = ctx != null ? ctx.settings.darkMode : systemScheme === "dark";

  const palette =
    isDark && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;

  return { ...palette, radius: colors.radius };
}
