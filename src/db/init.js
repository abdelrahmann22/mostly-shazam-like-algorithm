import db from "./db.js";

const createBaseSchema = `
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT,
    duration_ms INTEGER,
    source_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fingerprints (
    hash INTEGER NOT NULL,
    anchor_time INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
  );
`;

const ensureFingerprintIndexes = () => {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_fps_hash ON fingerprints(hash);
    CREATE INDEX IF NOT EXISTS idx_fps_song ON fingerprints(song_id);
  `);
};

db.exec(createBaseSchema);
ensureFingerprintIndexes();

const songColumns = db.prepare("PRAGMA table_info(songs)").all();
const hasSourceUrlColumn = songColumns.some(
  (column) => column.name === "source_url"
);
const hasFilePathColumn = songColumns.some(
  (column) => column.name === "file_path"
);

if (hasFilePathColumn) {
  const sourceUrlSelect = hasSourceUrlColumn
    ? "source_url"
    : "NULL AS source_url";

  db.exec(`
    BEGIN TRANSACTION;

    CREATE TABLE songs_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      duration_ms INTEGER,
      source_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    INSERT INTO songs_new (id, title, artist, duration_ms, source_url, created_at)
    SELECT id, title, artist, duration_ms, ${sourceUrlSelect}, created_at
    FROM songs;

    DROP TABLE songs;
    ALTER TABLE songs_new RENAME TO songs;

    COMMIT;
  `);

  ensureFingerprintIndexes();
  console.log("Removed legacy file_path column from songs table");
} else if (!hasSourceUrlColumn) {
  db.exec("ALTER TABLE songs ADD COLUMN source_url TEXT;");
  console.log("Added source_url column to songs table");
}

console.log("Database initialized");
