import db from "../db/db.js";

const insertSong = db.prepare(`
  INSERT INTO songs (title, artist, duration_ms, source_url)
  VALUES (@title, @artist, @duration_ms, @source_url)
`);

const getSong = db.prepare(`
    SELECT id, title, artist, duration_ms, source_url
    FROM songs
    WHERE id=@song_id
  `);

export function createSong({ title, artist, duration_ms, source_url = null }) {
  const info = insertSong.run({
    title,
    artist,
    duration_ms,
    source_url,
  });
  return Number(info.lastInsertRowid);
}

export function getMatchSong(song_id) {
  const song = getSong.get({ song_id });

  return song;
}
