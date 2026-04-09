import db from "./../db/localDataBase";
import { supabase } from "./supabase";

const TABLES = [
  "goals",
  "goal_reflections",
  "notes",
  "reminders",
  "milestones",
  "progress_logs",
  "weekly_reviews",
  "affirmations",
  "quotes",
  "vision_board_images",
] as const;

function claimLocalData(userId: string) {
  for (const table of TABLES) {
    db.runSync(
      `UPDATE ${table} SET user_id = ? WHERE user_id IS NULL OR user_id = 'null'`,
      [userId],
    );
  }
}

// async function syncTable(table: string, userId: string) {
//   const rows = db.getAllSync(`SELECT * FROM ${table} WHERE user_id = ?`, [
//     userId,
//   ]) as any[];

//   console.log(`[sync] ${table}: found ${rows.length} rows locally`);

//   if (!rows.length) return;

//   const now = new Date().toISOString();

//   // Generate a UUID for any row whose id is not already a UUID
//   const uuidRegex =
//     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

//   const payload = await Promise.all(
//     rows.map(async (row) => {
//       const id =
//         !row.id || !uuidRegex.test(String(row.id))
//           ? Crypto.randomUUID()
//           : row.id;
//       return { ...row, id, synced_at: now };
//     }),
//   );

//   const { error } = await supabase.from(table).upsert(payload, {
//     onConflict: "id",
//   });

//   if (error) {
//     console.error(`Failed to sync table "${table}":`, error.message);
//     throw error;
//   }

//   db.runSync(`UPDATE ${table} SET synced_at = ? WHERE user_id = ?`, [
//     now,
//     userId,
//   ]);
// }

export async function syncLocalDataToSupabase(userId: string) {
  claimLocalData(userId);
  // const goals = db.getAllSync("SELECT id, user_id, title FROM goals");
  // console.log("[sync] goals after claiming:", JSON.stringify(goals));
  for (const table of TABLES) {
    await syncTable(table, userId);
  }
}

async function syncTable(table: string, userId: string) {
  const rows = db.getAllSync(`SELECT * FROM ${table} WHERE user_id = ?`, [
    userId,
  ]) as any[];

  // console.log(`[sync] ${table}: found ${rows.length} rows`);

  if (!rows.length) return;

  const now = new Date().toISOString();

  const payload = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      synced_at: now,
    })),
  );

  // console.log(`[sync] ${table} payload:`, JSON.stringify(payload)); // add this

  const { error, data } = await supabase.from(table).upsert(payload, {
    onConflict: "id",
  });

  // console.log(`[sync] ${table} result:`, error ? error.message : "success"); // add this

  if (error) {
    console.error(`Failed to sync table "${table}":`, error.message);
    throw error;
  }
  // ...
}
