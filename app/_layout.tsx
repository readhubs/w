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
import { AppState, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
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

// ---------------------------------------------------------------------------
// Inner layout — needs access to AppContext for settings-aware scheduling
// ---------------------------------------------------------------------------

function RootLayoutNav() {
  const colors = useColors();
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    // Initialize the Capacitor LocalNotifications plugin abstraction.
    // This sets up foreground handler, creates Android channels, requests
    // permissions, and registers event listeners.
    initNotifications({
      onNotificationReceived: (notification) => {
        // Notification arrived while app is foregrounded — clear badge when
        // the user is actively looking at the app.
        clearBadge();
      },
      onNotificationResponse: (response) => {
        // User tapped a notification — could navigate to the relevant task.
        const data = response.notification.request.content.data;
        if (data?.taskId) {
          // Navigation is handled at screen level via deep links; we acquire a
          // wake lock here to ensure any follow-up scheduling completes.
          acquireWakeLock();
          setTimeout(() => releaseWakeLock(), 3000);
        }
      },
      onAppStateChange: (nextState) => {
        const prev = appStateRef.current;
        appStateRef.current = nextState;

        if (prev.match(/inactive|background/) && nextState === "active") {
          // App came to foreground — clear badge count
          if (notificationsAvailable()) {
            clearBadge();
          }
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task/[id]" options={{ title: "Task Details", headerShown: true }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="diary/new" options={{ title: "New Entry", headerShown: true }} />
      <Stack.Screen name="diary/[id]" options={{ title: "Diary Entry", headerShown: true }} />
      <Stack.Screen name="money/add" options={{ title: "Add Money Entry", headerShown: true }} />
      <Stack.Screen name="money/table" options={{ title: "Money Table", headerShown: true }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerShown: true }} />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
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
