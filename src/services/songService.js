import db from "../db/db.js";

const insertSong = db.prepare(`
  INSERT INTO songs (title, artist, duration_ms, file_path)
  VALUES (@title, @artist, @duration_ms, @file_path)
`);

export function createSong({ title, artist, duration_ms, file_path }) {
  const info = insertSong.run({
    title,
    artist,
    duration_ms,
    file_path,
  });
  return Number(info.lastInsertRowid);
}
