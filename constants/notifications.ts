import * as Notifications from "expo-notifications";
import { NativeModules, Platform } from "react-native";

// ── Notification handler ───────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ── Channel IDs ────────────────────────────────────────────────────────────────
const ALARM_CHANNEL_ID = "goalos_alarms";
const REMINDER_CHANNEL_ID = "goalos_reminders";

const WallpaperModule = NativeModules.WallpaperModule ?? null;
const AlarmChannel = NativeModules.AlarmChannel ?? null;

// Track which vision view to show next (cycles 0→1→2→0)
let visionCycle = 0;

function setNextVisionWallpaper() {
  if (Platform.OS !== "android" || !WallpaperModule) return;
  if (visionCycle === 0) WallpaperModule.setVisionImagesWallpaper();
  else if (visionCycle === 1) WallpaperModule.setVisionTextWallpaper("[]");
  else WallpaperModule.setVisionGridWallpaper();
  visionCycle = (visionCycle + 1) % 3;
}

// ── Setup channels ─────────────────────────────────────────────────────────────
export async function setupNotificationChannels() {
  if (Platform.OS !== "android") return;

  if (!AlarmChannel) {
    console.warn("AlarmChannel native module not available, skipping...");
  } else {
    AlarmChannel.createAlarmChannel();

    const hasAccess: boolean = await AlarmChannel.isDndAccessGranted();
    if (!hasAccess) {
      console.log("DND access not granted — opening system settings...");
      await AlarmChannel.requestDndAccess();
    }
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    bypassDnd: false,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
  });
}

// ── Request permissions ────────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: true,
      allowCriticalAlerts: true,
    },
  });

  return status === "granted";
}

// ── Schedule morning alarm — fires once daily at set time ──────────────────────
export async function scheduleMorningAlarm(
  time: string,
): Promise<string | null> {
  await cancelMorningAlarm();

  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (Platform.OS === "android" && WallpaperModule) {
    WallpaperModule.setMorningWallpaper();
  }

  // 9am revert to vision board — fixed: added data so listener handles it
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Goal OS",
      body: "Vision board activated",
      data: { type: "vision_rotation", action: "grid" }, // ← fix 1
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "☀️ Good Morning!",
      body: "Your morning brief is ready. Let's crush today's goals.",
      sound: "alarm.wav",
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
      channelId: ALARM_CHANNEL_ID,
    },
  });

  return id;
}

// ── Schedule reminder — fires at set time then every 4 hours ───────────────────
export async function scheduleReminder(
  title: string,
  newTime: Date,
  hour: number,
  minute: number,
  goalData?: {
    title: string;
    progress: number;
    deadline: string;
    quote: string;
  },
): Promise<string[]> {
  const granted = await requestNotificationPermissions();
  if (!granted) return [];

  const ids: string[] = [];

  const getDiff = () => {
    const diffMs = newTime.getTime() - new Date().getTime();
    const diffInDay = diffMs / (1000 * 60 * 60 * 24);
    const diffInHours = diffMs / (1000 * 60 * 60);
    return [diffInDay, diffInHours];
  };

  let lastPhase = "";
  let lastFired: number | null = null;

  function getCheckInterval(diffDay: number) {
    if (diffDay > 30) return 24 * 60 * 60 * 1000; // check once a day
    if (diffDay > 7) return 8 * 60 * 60 * 1000; // check after 8 hours
    if (diffDay > 1) return 60 * 60 * 1000; // check every 10 mins
    return 60 * 1000; // check every 1 min
  }

  const ringNotification = async (triggerHour: number) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Goal OS Reminder",
        body: goalData?.title ?? title,
        sound: "alarm.wav",
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: goalData ?? {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerHour,
        minute,
        channelId: ALARM_CHANNEL_ID,
      },
    });

    ids.push(id);
  };

  const shouldFire = (intervalDays: number) => {
    if (!lastFired) return true;
    const sinceLast = Date.now() - lastFired;
    return sinceLast >= intervalDays * 24 * 60 * 60 * 1000;
  };

  const evaluate = async function () {
    const [diffInDay, diffInHours] = getDiff();
    let currentPhase = "";
    const now = new Date();

    if (diffInDay > 8) currentPhase = "early";
    else if (diffInDay <= 8 && diffInDay > 1) currentPhase = "mid";
    else currentPhase = "final";

    if (currentPhase === "early" && shouldFire(3)) {
      // ring every 3 days, at current hour
      await ringNotification(now.getHours());
      lastFired = Date.now();
    } else if (currentPhase === "mid" && shouldFire(1)) {
      // ring every day, at current hour
      await ringNotification(now.getHours());
      lastFired = Date.now();
    } else if (currentPhase === "final") {
      // schedule pinned at 3hrs before and 12hrs before newTime
      const minus3hr = new Date(newTime.getTime() - 3 * 60 * 60 * 1000);
      const minus12hr = new Date(newTime.getTime() - 12 * 60 * 60 * 1000);

      if (diffInHours <= 12 && diffInHours > 3 && shouldFire(0.375)) {
        // 12hr window — fire if not fired in last 9hrs
        await ringNotification(minus12hr.getHours());
        lastFired = Date.now();
      }

      if (diffInHours <= 3 && shouldFire(0.125)) {
        // 3hr window — fire if not fired in last 3hrs
        await ringNotification(minus3hr.getHours());
        lastFired = Date.now();
      }
    }

    if (diffInHours > 0) {
      setTimeout(() => {
        evaluate();
      }, getCheckInterval(diffInDay));
    }
  };

  await evaluate();

  // for (let i = 0; i < 3; i++) {
  //   const triggerHour = (hour + i * 8) % 24;

  //   const id = await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "⏰ Goal OS Reminder",
  //       body: goalData?.title ?? title,
  //       sound: "alarm.wav",
  //       priority: Notifications.AndroidNotificationPriority.MAX,
  //       data: goalData ?? {},
  //     },
  //     trigger: {
  //       type: Notifications.SchedulableTriggerInputTypes.DAILY,
  //       hour: triggerHour,
  //       minute,
  //       channelId: ALARM_CHANNEL_ID,
  //     },
  //   });

  //   ids.push(id);
  // }

  return ids;
}

// ── Cancel morning alarm ───────────────────────────────────────────────────────
export async function cancelMorningAlarm() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const alarm = scheduled.find((n) => n.content.title === "☀️ Good Morning!");
  if (alarm) {
    await Notifications.cancelScheduledNotificationAsync(alarm.identifier);
    console.log("Morning alarm cancelled");
  }
}

// ── Cancel one notification by id ─────────────────────────────────────────────
export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

// ── Cancel all notifications for a reminder (array of ids) ────────────────────
export async function cancelReminderNotifications(ids: string[]) {
  await Promise.all(ids.map(cancelNotification));
}

export function setupWallpaperOnNotification() {
  Notifications.addNotificationReceivedListener((notification) => {
    if (Platform.OS !== "android" || !WallpaperModule) return;

    const title = notification.request.content.title;
    const data = notification.request.content.data as any;

    // app is foregrounded — call module directly, this is fine
    if (title === "☀️ Good Morning!") {
      WallpaperModule.setMorningWallpaper();
    } else if (data?.type === "vision_rotation") {
      if (data.action === "grid") WallpaperModule.setVisionGridWallpaper();
      else if (data.action === "images")
        WallpaperModule.setVisionImagesWallpaper();
    } else if (title === "⏰ Goal OS Reminder" && data?.title) {
      WallpaperModule.setGoalWallpaper(
        data.title,
        data.progress ?? 0,
        data.deadline ?? "No deadline",
        data.quote ?? "You have the power to make today extraordinary.",
      );
      setTimeout(() => WallpaperModule.revertWallpaper(), 30 * 60 * 1000);
    }
  });
}
// ── Schedule evening grid + 1am revert ────────────────────────────────────────
export async function scheduleVisionRotation() {
  // fix 2: removed shadowed `const { WallpaperModule } = NativeModules` that was here

  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.content.data?.type === "vision_rotation") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // 7pm — switch to grid
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Goal OS",
      body: "",
      data: { type: "vision_rotation", action: "grid" },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  // 1am — revert to vision images
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Goal OS",
      body: "",
      data: { type: "vision_rotation", action: "images" },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 1,
      minute: 0,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}
