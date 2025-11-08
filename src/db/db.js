import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_FILE = path.resolve(process.cwd(), "data", "shazam.db");

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new Database(DB_FILE);

db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");

export default db;
