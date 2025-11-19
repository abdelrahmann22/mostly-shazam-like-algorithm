import { AudioConfig } from "../../config/audioConfig.js";

function hashing(anchorFreq, target, deltaTime) {
  const f1 = Math.max(0, Math.floor(anchorFreq)) & 0x1ff; // 9 bits
  const f2 = Math.max(0, Math.floor(target)) & 0x1ff;
  const dt = Math.max(0, Math.floor(deltaTime)) & 0x3fff; // 14 bits

  const hash = (f1 << 23) | (f2 << 14) | dt;

  return hash >>> 0;
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
  const minFrameDelta =
    AudioConfig.fingerprinting.minTimeDelta / msPerFrame || 0;
  const maxFrameDelta =
    AudioConfig.fingerprinting.maxTimeDelta / msPerFrame || Infinity;

  let fingerprints = [];
  for (let i = 0; i < filteredPeaks.length; i++) {
    let anchor = filteredPeaks[i];
    let targetFound = 0;

    for (let j = i + 1; j < filteredPeaks.length; j++) {
      let target = filteredPeaks[j];
      let frameDelta = target.time - anchor.time;

      if (frameDelta < minFrameDelta) continue;
      if (frameDelta > maxFrameDelta) break;

      let deltaTime = frameDelta * msPerFrame;

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
