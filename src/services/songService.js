import db from "../db/db.js";

const insertSong = db.prepare(`
  INSERT INTO songs (title, artist, duration_ms, file_path)
  VALUES (@title, @artist, @duration_ms, @file_path)
`);

const getSong = db.prepare(`
    SELECT id, title, artist, duration_ms, file_path
    FROM songs
    WHERE id=@song_id
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

export function getMatchSong(song_id) {
  const song = getSong.get({ song_id });

  return song;
}
