import db from "../db/db.js";
import AppError from "../utils/app.error.js";

const insertFingerPrint = db.prepare(`
    INSERT INTO fingerprints (hash, anchor_time, song_id)
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
