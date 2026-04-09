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
  dueDate: string;
  enableReminder: number;
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

export function addGoal(goals: newGoal) {
  try {
    const id = Crypto.randomUUID();
    const userId = getSetting("user_id"); // grab from app_settings

    const result = db.runSync(
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
  } catch (error) {
    console.error("Failed to add goal:", error);
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
    lastDate === yesterday || lastDate === today ? goal.streak + 1 : 1;

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
// export function deleteUser(id) {
//   db.runSync('DELETE FROM users WHERE id = ?', [id]);
// }

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
