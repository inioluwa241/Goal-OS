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

export async function syncLocalDataToSupabase(userId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    console.log("No active session, skipping sync");
    return;
  }

  claimLocalData(userId);
  for (const table of TABLES) {
    await syncTable(table, userId);
  }
}

async function syncTable(table: string, userId: string) {
  const rows = db.getAllSync(`SELECT * FROM ${table} WHERE user_id = ?`, [
    userId,
  ]) as any[];

  if (!rows.length) return;

  const now = new Date().toISOString();

  const payload = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      synced_at: now,
    })),
  );

  const { error } = await supabase.from(table).upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    console.error(`Failed to sync table "${table}":`, error.message);
    throw error;
  }
  // After upserting local rows, remove remote rows that no longer exist locally.
  try {
    const { data: remoteRows, error: fetchErr } = await supabase
      .from(table)
      .select("id")
      .eq("user_id", userId);

    if (fetchErr) {
      console.warn(
        `Could not fetch remote ids for table "${table}":`,
        fetchErr.message,
      );
    } else if (Array.isArray(remoteRows)) {
      const remoteIds = remoteRows.map((r: any) => String(r.id));
      const localIds = rows.map((r: any) => String(r.id));
      const idsToDelete = remoteIds.filter(
        (id: string) => !localIds.includes(id),
      );

      if (idsToDelete.length) {
        // delete in chunks to avoid very large queries
        const chunkSize = 200;
        for (let i = 0; i < idsToDelete.length; i += chunkSize) {
          const chunk = idsToDelete.slice(i, i + chunkSize);
          const { error: delErr } = await supabase
            .from(table)
            .delete()
            .in("id", chunk)
            .eq("user_id", userId);

          if (delErr) {
            console.error(
              `Failed to delete remote rows for table "${table}":`,
              delErr.message,
            );
          } else {
            console.log(`Deleted ${chunk.length} remote rows from ${table}`);
          }
        }
      }
    }
  } catch (e) {
    console.error(
      `Error while cleaning remote deletions for table "${table}":`,
      e,
    );
  }
}

export async function pullFromSupabase(userId: string) {
  // Step 1: fetch everything from Supabase first
  const tableData: Record<string, any[]> = {};

  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error(`Failed to pull table "${table}":`, error.message);
      continue;
    }

    tableData[table] = data ?? [];
  }
  console.log("notes from Supabase:", tableData["notes"]);
  console.log("Pulling for userId:", userId);
  console.log("notes from Supabase:", tableData["notes"]);

  // Step 2: sort goals so parents come before children
  if (tableData["goals"]) {
    const goals = tableData["goals"];
    const map = new Map(goals.map((g) => [g.id, g]));
    const sorted: any[] = [];
    const visited = new Set<string>();

    function visit(goal: any) {
      if (visited.has(goal.id)) return;
      if (goal.parent_id && map.has(goal.parent_id)) {
        visit(map.get(goal.parent_id));
      }
      visited.add(goal.id);
      sorted.push(goal);
    }

    goals.forEach(visit);
    tableData["goals"] = sorted;
  }

  // Step 3: insert everything with FK checks temporarily off
  db.execSync(`PRAGMA foreign_keys = OFF`);

  try {
    for (const table of TABLES) {
      const rows = tableData[table];
      if (!rows || !rows.length) continue;

      for (const row of rows) {
        const columns = Object.keys(row).join(", ");
        const placeholders = Object.keys(row)
          .map(() => "?")
          .join(", ");
        const values = Object.values(row).map((v) =>
          v === null || v === undefined
            ? null
            : typeof v === "object"
              ? JSON.stringify(v)
              : (v as string | number | boolean),
        );

        db.runSync(
          `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`,
          values,
        );
      }
    }
  } finally {
    db.execSync(`PRAGMA foreign_keys = ON`);
  }
}
