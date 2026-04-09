import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ✅ controls how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // ✅ add this
    shouldShowList: true, // ✅ add this
  }),
});

// ✅ request permissions (Android 13+ needs explicit permission)
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: true,
        allowCriticalAlerts: true, // ← this is the closest iOS gets to DND bypass
      },
    });
    finalStatus = status;
  }

  return finalStatus === "granted";
}

// ✅ schedule the morning brief alarm
export async function scheduleMorningAlarm(
  time: string,
): Promise<string | null> {
  // cancel any existing morning alarm first
  await cancelMorningAlarm();

  const granted = await requestNotificationPermissions();
  if (!granted) {
    console.warn("Notification permission not granted");
    return null;
  }

  // parse "HH:MM" string
  const [hours, minutes] = time.split(":").map(Number);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "☀️ Good Morning!",
      body: "Your morning brief is ready. Let's crush today's goals.",
      sound: "alarm.wav", // must be in assets and registered in app.json
      priority: Notifications.AndroidNotificationPriority.MAX,
      // Android DND bypass
      ...(Platform.OS === "android" && {
        categoryIdentifier: "alarm",
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });

  console.log("Morning alarm scheduled with id:", id);
  return id;
}

// ✅ cancel the morning alarm
export async function cancelMorningAlarm() {
  // we tag it so we can cancel specifically this one
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const morningAlarm = scheduled.find(
    (n) => n.content.title === "☀️ Good Morning!",
  );
  if (morningAlarm) {
    await Notifications.cancelScheduledNotificationAsync(
      morningAlarm.identifier,
    );
    console.log("Morning alarm cancelled");
  }
}
