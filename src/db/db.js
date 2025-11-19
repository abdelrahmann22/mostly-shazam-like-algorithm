import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH =
  process.env.DB_PATH ||
  (process.env.NODE_ENV === "production"
    ? "/mnt/shazamdata/shazam.db"
    : path.resolve(process.cwd(), "data", "shazam.db"));

const DB_DIR = path.dirname(DB_PATH);

try {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log(`Database directory ensured: ${DB_DIR}`);
} catch (error) {
  console.log(`Directory already exists or is mounted: ${DB_DIR}`);
}

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

export default db;
