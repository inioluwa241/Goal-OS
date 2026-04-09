import db from "./localDataBase";

export function initialisedDb() {
  db.withTransactionSync(() => {
    //   db.execSync(`
    //   DROP TABLE IF EXISTS goals;
    //   DROP TABLE IF EXISTS goal_reflections;
    //   DROP TABLE IF EXISTS notes;
    //   DROP TABLE IF EXISTS reminders;
    //   DROP TABLE IF EXISTS milestones;
    //   DROP TABLE IF EXISTS progress_logs;
    //   DROP TABLE IF EXISTS weekly_reviews;
    //   DROP TABLE IF EXISTS affirmations;
    //   DROP TABLE IF EXISTS quotes;
    //   DROP TABLE IF EXISTS vision_board_images;
    //   DROP TABLE IF EXISTS app_settings;
    // `);

    db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      type INTEGER NOT NULL CHECK(type IN (1, 2, 3, 4)),
      parent_id TEXT REFERENCES goals(id) ON DELETE CASCADE,
      reason TEXT,
      due_date DATE,
      enable_reminder BOOLEAN NOT NULL CHECK (enable_reminder IN (0, 1)),
      is_complete BOOLEAN CHECK (is_complete IN (0, 1)),
      completed_at DATE,
      status TEXT DEFAULT 'active',
      progress_type TEXT DEFAULT 'percentage',
      progress_value REAL DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_checked_in DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS goal_reflections (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
      due_time DATE,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      position INTEGER DEFAULT 0,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS progress_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      note TEXT,
      progress_snapshot REAL,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      week_start DATE NOT NULL,
      summary TEXT,
      carried_forward TEXT,
      reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS affirmations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      text TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      text TEXT NOT NULL,
      author TEXT,
      is_active INTEGER DEFAULT 1,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS vision_board_images (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      local_uri TEXT NOT NULL,
      goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
      label TEXT,
      position INTEGER DEFAULT 0,
      synced_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

    // Seed default settings
    db.execSync(`
    INSERT OR IGNORE INTO app_settings (key, value) VALUES
      ('onboarding_complete', 'false'),
      ('morning_brief_time', '"07:00"'),
      ('wallpaper_mode', '"vision_board"'),
      ('user_id', 'null'),
      ('last_pull_timestamp', '0');
  `);

    // Migration block — safely adds new columns to existing installs
    // If the column already exists, the error is caught and ignored
    const migrations = [
      `ALTER TABLE goals ADD COLUMN user_id TEXT`,
      `ALTER TABLE goals ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE goal_reflections ADD COLUMN user_id TEXT`,
      `ALTER TABLE goal_reflections ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE notes ADD COLUMN user_id TEXT`,
      `ALTER TABLE notes ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE reminders ADD COLUMN user_id TEXT`,
      `ALTER TABLE reminders ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE milestones ADD COLUMN user_id TEXT`,
      `ALTER TABLE milestones ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE progress_logs ADD COLUMN user_id TEXT`,
      `ALTER TABLE progress_logs ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE weekly_reviews ADD COLUMN user_id TEXT`,
      `ALTER TABLE weekly_reviews ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE affirmations ADD COLUMN user_id TEXT`,
      `ALTER TABLE affirmations ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE quotes ADD COLUMN user_id TEXT`,
      `ALTER TABLE quotes ADD COLUMN synced_at DATETIME`,
      `ALTER TABLE vision_board_images ADD COLUMN user_id TEXT`,
      `ALTER TABLE vision_board_images ADD COLUMN synced_at DATETIME`,
    ];

    for (const migration of migrations) {
      try {
        db.execSync(migration);
      } catch {
        // Column already exists, safe to ignore
      }
    }
  });
}
