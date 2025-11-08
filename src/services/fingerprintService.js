import db from "../db/db.js";
import AppError from "../utils/app.error.js";

const insertFingerPrint = db.prepare(`
    INSERT OR IGNORE INTO fingerprints (hash, anchor_time, song_id)
    VALUES (@hash, @anchor_time, @song_id)
  `);

const insertManyTransaction = db.transaction((fingerprints) => {
  for (const fp of fingerprints) {
    insertFingerPrint.run(fp);
  }
});

export function saveFingerPrints(fingerprints) {
  if (!fingerprints)
    throw new AppError(400, "Fingerprints parameter is required");
  if (!Array.isArray(fingerprints))
    throw new AppError(400, "Fingerprints must be an array");

  if (fingerprints.length === 0) return 0;

  try {
    insertManyTransaction(fingerprints);
    return fingerprints.length;
  } catch (error) {
    throw new AppError(500, error.message);
  }
}

export function getFingerPrintsByHashes(hashes) {
  if (!hashes || !Array.isArray(hashes))
    throw new AppError(400, "Hashes must be an array");

  if (hashes.length === 0) {
    return [];
  }

  const BATCH_SIZE = 500;
  const allResults = [];

  for (let i = 0; i < hashes.length; i += BATCH_SIZE) {
    const batch = hashes.slice(i, i + BATCH_SIZE);
    const placeholders = Array(batch.length).fill("?").join(",");

    const stmt = db.prepare(`
      SELECT hash, song_id, anchor_time
      FROM fingerprints
      WHERE hash IN (${placeholders})
    `);

    const results = stmt.all(...batch);
    allResults.push(...results);
  }
  return allResults;
}
