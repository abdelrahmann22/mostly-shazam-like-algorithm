import { AudioConfig } from "../../config/audioConfig.js";

function hashing(anchorFreq, target, deltaTime) {
  const f1 = Math.floor(anchorFreq);
  const f2 = Math.floor(target);
  const dt = Math.floor(deltaTime);

  const hash = (f1 << 23) | (f2 << 14) | dt;

  return hash;
}

export function indexFingerPrintsByHash(fingerPrints) {
  const fingerPrintMap = {};
  fingerPrints.forEach((fp) => {
    if (!fingerPrintMap[fp.hash]) {
      fingerPrintMap[fp.hash] = [];
    }
    fingerPrintMap[fp.hash].push({
      song_id: fp.song_id,
      anchor_time: fp.anchor_time,
    });
  });

  return fingerPrintMap;
}

function fingerPrint(filteredPeaks, song_id) {
  const msPerFrame = (AudioConfig.hopSize / AudioConfig.sampleRate) * 1000;
  let fingerprints = [];
  for (let i = 0; i < filteredPeaks.length; i++) {
    let anchor = filteredPeaks[i];
    let targetFound = 0;

    for (let j = i + 1; j < filteredPeaks.length; j++) {
      let target = filteredPeaks[j];
      let deltaTime = (target.time - anchor.time) * msPerFrame;

      if (deltaTime < AudioConfig.fingerprinting.minTimeDelta) continue;

      if (deltaTime > AudioConfig.fingerprinting.maxTimeDelta) break;

      let hash = hashing(anchor.frequency, target.frequency, deltaTime);
      fingerprints.push({
        hash,
        anchor_time: anchor.time * msPerFrame,
        song_id,
      });

      targetFound++;

      if (targetFound >= AudioConfig.fingerprinting.maxTargetsPerAnchor) break;
    }
  }
  return fingerprints;
}

export default fingerPrint;
