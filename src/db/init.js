import db from "./db.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT,
    duration_ms INTEGER,
    file_path TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fingerprints (
    hash INTEGER NOT NULL,
    anchor_time INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_fps_hash ON fingerprints(hash);
  CREATE INDEX IF NOT EXISTS idx_fps_song ON fingerprints(song_id);
`);

console.log("Database initialized");
