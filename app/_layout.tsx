// app/_layout.tsx
import {
  scheduleVisionRotation,
  setupNotificationChannels,
  setupWallpaperOnNotification,
} from "@/constants/notifications";
import { getSetting } from "@/db/crudOperations";
import { initialisedDb } from "@/db/initialisedDataBase";
import { supabase } from "@/services/supabase";
import { syncLocalDataToSupabase } from "@/services/sync";
import { Session } from "@supabase/supabase-js";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  NativeModules,
  TurboModuleRegistry,
  View,
} from "react-native";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  // add this inside any useEffect that runs on mount
  useEffect(() => {
    console.log("All native modules:", Object.keys(NativeModules));
    console.log("NativeModules keys:", Object.keys(NativeModules));
    console.log(
      "Turbo WallpaperModule:",
      TurboModuleRegistry.get("WallpaperModule"),
    );
  }, []);

  useEffect(() => {
    setupWallpaperOnNotification();
    scheduleVisionRotation();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const userId = getSetting("user_id");
        if (userId && userId !== "null") {
          await syncLocalDataToSupabase(userId);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    initialisedDb();
    setupNotificationChannels();

    const resetChannels = async () => {
      await Notifications.deleteNotificationChannelAsync("goalos_alarms");
      await Notifications.deleteNotificationChannelAsync("goalos_reminders");
      await Notifications.deleteNotificationChannelAsync("reminders");
      await setupNotificationChannels();
    };
    resetChannels();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        setSession(session);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const title = response.notification.request.content.title;
        if (title === "☀️ Good Morning!") {
          router.push("/(tabs)");
        }
      },
    );
    return () => sub.remove();
  }, []);

  // Still resolving auth — show spinner over nothing
  if (session === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Stack always renders — redirect happens as a child screen
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="notes/[id]/index" options={{ headerShown: true }} />
      <Stack.Screen name="notes/[id]/edit" options={{ headerShown: true }} />
      {/* Redirect based on session, rendered as part of the stack */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
