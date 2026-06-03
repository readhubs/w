import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  initialize as initNotifications,
  removeAllListeners,
  clearBadge,
  acquireWakeLock,
  releaseWakeLock,
  isAvailable as notificationsAvailable,
} from "@/utils/notification-helper";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    // Initialize Capacitor LocalNotifications abstraction:
    // - sets foreground handler
    // - creates Android channels (task_reminders, urgent_tasks, daily_summary)
    // - requests permissions
    // - registers event listeners
    initNotifications({
      onNotificationReceived: (_notification) => {
        // App is in foreground — clear badge immediately
        clearBadge();
      },
      onNotificationResponse: (response) => {
        // User tapped notification (from background/killed state)
        const data = response.notification.request.content.data;
        if (data?.taskId) {
          acquireWakeLock();
          setTimeout(releaseWakeLock, 3000);
        }
      },
      onAppStateChange: (nextState) => {
        const prev = appStateRef.current;
        appStateRef.current = nextState;
        if (prev.match(/inactive|background/) && nextState === "active") {
          if (notificationsAvailable()) clearBadge();
        }
      },
    });

    return () => {
      removeAllListeners();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 18 },
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)"       options={{ headerShown: false }} />
      <Stack.Screen name="task/[id]"    options={{ title: "Task Details", headerShown: true }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="diary/new"    options={{ title: "New Entry", headerShown: true }} />
      <Stack.Screen name="diary/[id]"   options={{ title: "Diary Entry", headerShown: true }} />
      <Stack.Screen name="money/add"    options={{ title: "Add Money Entry", headerShown: true }} />
      <Stack.Screen name="money/table"  options={{ title: "Money Table", headerShown: true }} />
      <Stack.Screen name="settings"     options={{ title: "Settings", headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
