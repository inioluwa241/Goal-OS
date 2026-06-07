import { scheduleStreakWarningNotification } from "@/constants/notifications";
import { getAllForStreak } from "@/db/crudOperations";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

export const STREAK_CHECK_TASK = "STREAK_CHECK_TASK";

TaskManager.defineTask(STREAK_CHECK_TASK, async () => {
  try {
    const streakGoals = await getAllForStreak();
    if (streakGoals.some((goal) => goal.streak > 0)) {
      await scheduleStreakWarningNotification();
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Error running streak check task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerStreakCheckTask() {
  try {
    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(STREAK_CHECK_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(STREAK_CHECK_TASK, {
        minimumInterval: 60 * 60 * 8,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (error) {
    console.error("Failed to register streak check task:", error);
  }
}
