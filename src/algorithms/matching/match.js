import { AudioConfig } from "../../config/audioConfig.js";
export function prepareQueryData(queryFingerprints) {
  const uniqueHashes = new Set();
  const hashIndex = new Map();

  for (let fp of queryFingerprints) {
    let hash = fp.hash;
    let anchor_time = fp.anchor_time;

    uniqueHashes.add(hash);

    if (!hashIndex.has(hash)) hashIndex.set(hash, []);
    hashIndex.get(hash).push({ anchor_time });
  }

  return { uniqueHashes: Array.from(uniqueHashes), hashIndex };
}

export function scoreMatches(dbResult, hashIndex) {
  const binSize = AudioConfig.matching.binSize;
  const scores = new Map();

  for (let fp of dbResult) {
    let { hash, song_id, anchor_time } = fp;

    let queryFps = hashIndex.get(hash);

    for (let qfp of queryFps) {
      let offset = anchor_time - qfp.anchor_time;
      let offsetBin = Math.round(offset / binSize) * binSize;

      if (!scores.has(song_id)) scores.set(song_id, new Map());

      if (!scores.get(song_id).has(offsetBin))
        scores.get(song_id).set(offsetBin, 0);

      let currentCount = scores.get(song_id).get(offsetBin);
      scores.get(song_id).set(offsetBin, currentCount + 1);
    }
  }

  return scores;
}

export function findBestMatch(scores, totalQueryFingerprints) {
  if (!scores || scores.size === 0) return null;

  const candidates = [];

  for (const [song_id, offsetsMap] of scores) {
    let bestOffset = null;
    let bestCount = 0;

    for (const [offset, count] of offsetsMap) {
      if (count > bestCount) {
        bestCount = count;
        bestOffset = offset;
      }
    }

    candidates.push({
      song_id,
      offset: bestOffset,
      matches: bestCount,
      confidence: totalQueryFingerprints
        ? (bestCount / totalQueryFingerprints) * 100
        : null,
    });
  }

  candidates.sort((a, b) => b.matches - a.matches);

  return candidates[0];
}
