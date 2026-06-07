import * as Crypto from "expo-crypto";
import db from "./localDataBase";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  type: string;
  parent_id: string | null;
  reason: string | null;
  due_date: string | null;
  enable_reminder: number;
  status: string;
  progress_value: number;
  streak: number;
  last_checked_in: string | null;
  created_at: string;
  updated_at: string;
}

// 1. Define an Interface for your user (Best practice)
interface newGoal {
  title: string;
  description: string;
  type: number;
  parentID: string | null;
  reason: string;
  dueDate: string | null;
  enableReminder: number;
}

// UPDATE ALL GOAL STATUS
export function updateAllGoalsOnStatus() {
  const allGoals = db.getAllSync("SELECT * FROM goals") as Goal[];
  const presentDate = new Date();

  for (const goal of allGoals) {
    const goalDate = new Date(goal.due_date ?? new Date().toISOString());
    if (goalDate <= presentDate && goal.status !== "completed") {
      db.runSync("UPDATE goals SET status = ? WHERE id = ?", [
        "failed",
        goal.id,
      ]);
    }
  }
}

// GET setting by key
export function getSetting(key: string): string | null {
  const result = db.getFirstSync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ?",
    [key],
  );
  return result ? result.value : null;
}

// UPSERT setting by key
export function saveSetting(key: string, value: string) {
  db.runSync("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", [
    key,
    value,
  ]);
}

export function titleExists(title: string): boolean {
  // We count how many goals have this title
  const result = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM goals WHERE title = ? COLLATE NOCASE",
    [title],
  );

  // If count is more than 0, it exists
  return (result?.count ?? 0) > 0;
}

export function addGoal(goals: newGoal): string | null {
  try {
    const id = Crypto.randomUUID();
    const userId = getSetting("user_id"); // grab from app_settings

    db.runSync(
      "INSERT INTO goals (id, user_id, title, description, type, parent_id, reason, due_date, enable_reminder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        userId,
        goals.title,
        goals.description,
        goals.type,
        goals.parentID,
        goals.reason,
        goals.dueDate,
        goals.enableReminder,
      ],
    );

    console.log("Inserted ID:", id);
    return id;
  } catch (error) {
    console.error("Failed to add goal:", error);
    return null;
  }
}

// Seed a demo goal tree (yearly -> monthly -> weekly -> daily) once per install
export function seedDemoGoals(userId: string) {
  try {
    const already = getSetting("has_seeded_demo");
    if (already === "true") return;

    // ensure user_id is set locally so inserted rows get attributed
    if (userId) saveSetting("user_id", userId);

    const addDays = (days: number) =>
      new Date(Date.now() + days * 86400000).toISOString();

    const yearlyId = addGoal({
      title: "Yearly: Build a healthier routine",
      description: "A top-level goal to improve wellbeing over the year.",
      type: 4,
      parentID: null,
      reason: "Demo goal",
      dueDate: addDays(365),
      enableReminder: 0,
    });

    const monthlyId = addGoal({
      title: "Monthly: Exercise 3x per week",
      description: "Smaller milestone that contributes to the yearly goal.",
      type: 3,
      parentID: yearlyId,
      reason: "Demo goal",
      dueDate: addDays(30),
      enableReminder: 0,
    });

    const weeklyId = addGoal({
      title: "Weekly: Go to the gym twice",
      description: "Weekly habit to support the monthly milestone.",
      type: 2,
      parentID: monthlyId,
      reason: "Demo goal",
      dueDate: addDays(7),
      enableReminder: 0,
    });

    const dailyId = addGoal({
      title: "Daily: 10 minute morning stretch",
      description: "Small daily action to keep momentum.",
      type: 1,
      parentID: weeklyId,
      reason: "Demo goal",
      dueDate: addDays(1),
      enableReminder: 0,
    });

    // mark seeded so this doesn't run again
    saveSetting("has_seeded_demo", "true");

    console.log("Seeded demo goals:", {
      yearlyId,
      monthlyId,
      weeklyId,
      dailyId,
    });
  } catch (error) {
    console.error("Failed to seed demo goals:", error);
  }
}

// SELECT ALL
export function getGoals() {
  return db.getAllSync("SELECT * FROM goals");
}

// SELECT ONE
export function getUserById(id: string) {
  return db.getFirstSync("SELECT * FROM goals WHERE id = ?", [id]);
}
// SELECT TITLE
export function getGoalTitleById(id: string): string | null {
  const result = db.getFirstSync<{ title: string }>(
    "SELECT title FROM goals WHERE id = ?",
    [id],
  );

  return result ? result.title : null;
}

export function getGoalsByType(type: string): Goal[] {
  // Use .toLowerCase() to ensure it matches your DB 'daily', 'weekly', etc.
  const results = db.getAllSync<Goal>(
    "SELECT * FROM goals WHERE type = ? COLLATE NOCASE",
    [type.toLowerCase()],
  );

  return results;
}

// Return incomplete daily goals (type = 1)
export function getIncompleteDailyGoals(): { id: string; title: string }[] {
  return db.getAllSync<{ id: string; title: string }>(
    "SELECT id, title FROM goals WHERE type = 1 AND status != 'completed' ORDER BY created_at ASC",
  );
}

// Return the best streak value across all goals
export function getBestStreak(): number {
  const result = db.getFirstSync<{ best: number }>(
    "SELECT MAX(streak) as best FROM goals",
  );
  return result?.best ?? 0;
}

export async function hasAnyGoals(): Promise<boolean> {
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM goals",
  );
  return (result?.count ?? 0) > 0;
}

// 1. Define exactly what "some data" looks like
interface GoalPreview {
  id: string;
  title: string;
  type: number;
}

export async function getAllGoalPreviews(): Promise<GoalPreview[]> {
  // 2. Select only the columns and JSON keys you actually need
  const results = await db.getAllAsync<GoalPreview>(
    "SELECT id, title, type FROM goals",
  );

  // 3. 'results' is already an array of objects [ {id, title, category}, ... ]
  return results;
}

interface GoalPreviewForStreak {
  id: string;
  title: string;
  streak: number;
}

export async function getAllForStreak(): Promise<GoalPreviewForStreak[]> {
  // 2. Select only the columns and JSON keys you actually need
  const results = await db.getAllAsync<GoalPreviewForStreak>(
    "SELECT id, title, streak FROM goals",
  );

  // 3. 'results' is already an array of objects [ {id, title, category}, ... ]
  return results;
}

interface GoalPreviewForTitles {
  id: string;
  title: string;
  type: number;
}

export async function getAllForDailyTitle(): Promise<GoalPreviewForTitles[]> {
  // 2. Select only the columns and JSON keys you actually need
  const results = await db.getAllAsync<GoalPreviewForTitles>(
    "SELECT id, title, type FROM goals WHERE type = 1",
  );

  // 3. 'results' is already an array of objects [ {id, title, category}, ... ]
  return results;
}

interface GoalPreviewForTodayGoal {
  id: string;
  title: string;
  progress_value: number;
  due_date: string;
}

export async function getAllForTodayGoal(): Promise<GoalPreviewForTodayGoal[]> {
  // 2. Select only the columns and JSON keys you actually need
  const results = await db.getAllAsync<GoalPreviewForTodayGoal>(
    "SELECT id, title, progress_value,due_date FROM goals",
  );

  // 3. 'results' is already an array of objects [ {id, title, category}, ... ]
  return results;
}

// UPDATE
export function updateGoal(id: string, goal: newGoal) {
  db.runSync(
    `UPDATE goals 
     SET title = ?, description = ?, type = ?, parent_id = ?, reason = ?, due_date = ?, enable_reminder = ? 
     WHERE id = ?`,
    [
      goal.title,
      goal.description,
      goal.type,
      goal.parentID,
      goal.reason,
      goal.dueDate,
      goal.enableReminder ? 1 : 0,
      id,
    ],
  );
}

// for non daily
export const updateGoalProgress = (id: string, progress: number) => {
  const now = new Date().toISOString();
  const isComplete = progress === 100;

  db.runSync(
    `UPDATE goals 
     SET progress_value = ?,
         is_complete = ?,
         completed_at = ?,
         status = ?,
         last_checked_in = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      progress,
      isComplete ? 1 : 0,
      isComplete ? now : null,
      isComplete ? "completed" : "active",
      now,
      now,
      id,
    ],
  );
};

// for daily goalss
export const markDailyGoalDone = (id: string) => {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  // Get current streak and last check-in to decide if streak continues or resets
  const goal = db.getFirstSync(
    `SELECT streak, last_checked_in FROM goals WHERE id = ?`,
    [id],
  ) as { streak: number; last_checked_in: string | null };

  const lastDate = goal.last_checked_in?.split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Streak continues if last check-in was yesterday, otherwise reset to 1
  const newStreak =
    lastDate === today
      ? goal.streak // already done today, don't increment
      : lastDate === yesterday
        ? goal.streak + 1 // continuing the streak
        : 1;
  db.runSync(
    `UPDATE goals
     SET is_complete = 1,
         completed_at = ?,
         status = 'completed',
         progress_value = 100,
         streak = ?,
         last_checked_in = ?,
         updated_at = ?
     WHERE id = ?`,
    [now, newStreak, now, now, id],
  );
};

// DELETE
// DELETE A SINGLE GOAL AND ITS RELATED DATA
export function deleteGoal(id: string): boolean {
  try {
    console.log("Deleting goal with ID:", id);
    db.withTransactionSync(() => {
      // Delete related reflections
      db.runSync("DELETE FROM goal_reflections WHERE goal_id = ?", [id]);

      // Delete the goal itself
      db.runSync("DELETE FROM goals WHERE id = ?", [id]);
    });
    console.log("Goal deleted:", id);
    return true;
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return false;
  }
}

// DELETE ALL DATA
export function clearAllData() {
  db.withTransactionSync(() => {
    db.execSync(`
      DELETE FROM vision_board_images;
      DELETE FROM progress_logs;
      DELETE FROM milestones;
      DELETE FROM goal_reflections;
      DELETE FROM reminders;
      DELETE FROM weekly_reviews;
      DELETE FROM affirmations;
      DELETE FROM quotes;
      DELETE FROM notes;
      DELETE FROM goals;
    `);

    // Reset all auto-increment counters
    db.execSync(`DELETE FROM sqlite_sequence`);
  });
}

// SAVE REFLECTIONS
export function addReflection(goalId: string, content: string) {
  const id = Crypto.randomUUID();
  const userId = getSetting("user_id");

  db.runSync(
    "INSERT INTO goal_reflections (id, user_id, goal_id, content) VALUES (?, ?, ?, ?)",
    [id, userId, goalId, content],
  );
}

export function getReflectionsForGoal(goalId: string) {
  return db.getAllSync(
    "SELECT * FROM goal_reflections WHERE goal_id = ? ORDER BY created_at DESC",
    [goalId],
  );
}

interface newNote {
  title: string;
  category: string;
  content: string;
}

export function addNote(note: newNote) {
  try {
    const id = Crypto.randomUUID();
    const userId = getSetting("user_id");

    const result = db.runSync(
      "INSERT INTO notes (id, user_id, title, category, content) VALUES (?, ?, ?, ?, ?)",
      [id, userId, note.title, note.category, note.content],
    );

    console.log("Inserted ID:", id);
  } catch (error) {
    console.error("Failed to add note:", error);
  }
}

export function getNotes() {
  return db.getAllSync("SELECT * FROM notes");
}

// ── Vision Board Images ────────────────────────────────────────────────────────
export interface VisionImage {
  id: string;
  local_uri: string;
  label: string | null;
  position: number;
}

export function getVisionImages(): VisionImage[] {
  return db.getAllSync<VisionImage>(
    "SELECT id, local_uri, label, position FROM vision_board_images ORDER BY position ASC",
  );
}

export function addVisionImage(uri: string, label?: string): void {
  const id = Crypto.randomUUID();
  const userId = getSetting("user_id");
  const position = getVisionImages().length;

  db.runSync(
    "INSERT INTO vision_board_images (id, user_id, local_uri, label, position) VALUES (?, ?, ?, ?, ?)",
    [id, userId, uri, label ?? null, position],
  );
}

export function deleteVisionImage(id: string): void {
  db.runSync("DELETE FROM vision_board_images WHERE id = ?", [id]);
}

// ── Reminders ────────────────────────────────────────────────────────────────

interface NewReminder {
  title: string;
  hour: number;
  minute: number;
  time: string;
  notifIds: string[];
}

export function addReminder(reminder: NewReminder): string {
  const id = Crypto.randomUUID();
  const userId = getSetting("user_id");

  db.runSync(
    "INSERT INTO reminders (id, user_id, title, due_time, status) VALUES (?, ?, ?, ?, ?)",
    [id, userId, reminder.title, reminder.time, "upcoming"],
  );

  // store notifIds and hour/minute in app_settings keyed by reminder id
  db.runSync("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", [
    `reminder_meta_${id}`,
    JSON.stringify({
      hour: reminder.hour,
      minute: reminder.minute,
      notifIds: reminder.notifIds,
    }),
  ]);

  console.log("Inserted reminder:", id);
  return id;
}

export function getReminders() {
  const rows = db.getAllSync<{
    id: string;
    title: string;
    due_time: string;
    status: string;
  }>(
    "SELECT id, title, due_time, status FROM reminders ORDER BY created_at DESC",
  );

  return rows.map((r) => {
    const meta = getSetting(`reminder_meta_${r.id}`);
    const {
      hour = 0,
      minute = 0,
      notifIds = [],
    } = meta ? JSON.parse(meta) : {};
    return {
      id: r.id,
      title: r.title,
      time: r.due_time,
      hour,
      minute,
      status: r.status as "upcoming" | "completed" | "missed",
      goal: "Linked goal",
      notifIds,
    };
  });
}

export interface ProgressLog {
  id: string;
  goal_id: string;
  user_id: string;
  note: string | null;
  progress_value: number;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export function addProgressLog(
  goalId: string,
  note: string | null,
  progressValue: number,
): string {
  const id = Crypto.randomUUID();
  const userId = getSetting("user_id");
  const timestamp = new Date().toISOString();

  db.runSync(
    "INSERT INTO progress_logs (id, goal_id, user_id, note, progress_value, logged_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, goalId, userId, note, progressValue, timestamp, timestamp, timestamp],
  );

  return id;
}

export function getProgressLogs(goalId: string): ProgressLog[] {
  return db.getAllSync<ProgressLog>(
    "SELECT * FROM progress_logs WHERE goal_id = ? ORDER BY logged_at DESC",
    [goalId],
  );
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  mood: number;
  wins: string;
  challenges: string;
  reflection: string;
  week_start: string;
  created_at: string;
  updated_at: string;
}

function getCurrentIsoWeekStart(): string {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStartDate = new Date(today);
  weekStartDate.setDate(today.getDate() + diffToMonday);
  return weekStartDate.toISOString().split("T")[0];
}

export function addWeeklyReview(data: {
  mood: number;
  wins: string;
  challenges: string;
  reflection: string;
}): string {
  const id = Crypto.randomUUID();
  const userId = getSetting("user_id");
  const timestamp = new Date().toISOString();
  const weekStart = getCurrentIsoWeekStart();

  db.runSync(
    "INSERT INTO weekly_reviews (id, user_id, mood, wins, challenges, reflection, week_start, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      userId,
      data.mood,
      data.wins,
      data.challenges,
      data.reflection,
      weekStart,
      timestamp,
      timestamp,
    ],
  );

  return id;
}

export function getWeeklyReviews(): WeeklyReview[] {
  return db.getAllSync<WeeklyReview>(
    "SELECT * FROM weekly_reviews ORDER BY week_start DESC",
  );
}

export function updateReminderStatus(
  id: string,
  status: "upcoming" | "completed" | "missed",
) {
  db.runSync(
    "UPDATE reminders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id],
  );
}

export function deleteReminder(id: string) {
  db.runSync("DELETE FROM reminders WHERE id = ?", [id]);
  db.runSync("DELETE FROM app_settings WHERE key = ?", [`reminder_meta_${id}`]);
}

// Recalculates and resets streaks for goals not checked in yesterday
export function recalculateStreaks(): void {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Any daily goal whose last_checked_in is older than yesterday gets streak reset
  db.runSync(
    `UPDATE goals
     SET streak = 0
     WHERE type = 1
       AND status != 'completed'
       AND (last_checked_in IS NULL OR DATE(last_checked_in) < ?)`,
    [yesterday],
  );
}

// Weighted health score across all active goals
export function computeHealthScore(): number {
  const goals = db.getAllSync<{
    type: number;
    progress_value: number;
    created_at: string;
    due_date: string | null;
  }>(
    `SELECT type, progress_value, created_at, due_date
     FROM goals
     WHERE status = 'active' AND is_complete = 0`,
  );

  if (goals.length === 0) return 0;

  const weights: Record<number, number> = { 4: 4, 3: 3, 2: 2, 1: 1 };
  // type 4 = yearly, 3 = monthly, 2 = weekly, 1 = daily

  let weightedSum = 0;
  let totalWeight = 0;

  const today = Date.now();

  for (const goal of goals) {
    const w = weights[goal.type] ?? 1;
    let contribution = goal.progress_value; // 0–100

    // On-track penalty: if more time has passed than progress suggests, penalise
    if (goal.due_date) {
      const start = new Date(goal.created_at).getTime();
      const end = new Date(goal.due_date).getTime();
      const elapsed = (today - start) / (end - start); // 0.0 → 1.0
      const expectedProgress = Math.min(elapsed * 100, 100);

      if (contribution < expectedProgress) {
        // Behind schedule — apply a 0.5 penalty factor
        contribution = contribution * 0.5;
      }
    }

    weightedSum += contribution * w;
    totalWeight += w;
  }

  return Math.round(weightedSum / totalWeight);
}
