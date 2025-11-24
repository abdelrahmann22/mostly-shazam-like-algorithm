import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR = path.resolve(process.cwd(), "data");

const DB_FILE = path.join(DB_DIR, "shazam.db");

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_FILE);

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

export default db;
