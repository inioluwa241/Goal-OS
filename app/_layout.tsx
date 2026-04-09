import { initialisedDb } from "@/db/initialisedDataBase";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    initialisedDb();
  }, []);

  useEffect(() => {
    // ✅ when user taps the notification, navigate to morning brief
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const title = response.notification.request.content.title;
        if (title === "☀️ Good Morning!") {
          router.push("/(tabs)"); // your route
        }
      },
    );

    return () => sub.remove();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="notes/[id]/index" options={{ headerShown: true }} />
      <Stack.Screen name="notes/[id]/edit" options={{ headerShown: true }} />
    </Stack>
  );
}
