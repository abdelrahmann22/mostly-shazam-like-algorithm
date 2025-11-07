import { AudioConfig } from "../../config/audioConfig.js";

function hashing(anchorFreq, target, deltaTime) {
  const f1 = Math.floor(anchorFreq);
  const f2 = Math.floor(target);
  const dt = Math.floor(deltaTime);

  const hash = (f1 << 23) | (f2 << 14) | dt;

  return hash;
}

function indexFingerPrintsByHash(fingerPrints) {
  const fingerPrintMap = {};
  fingerPrints.forEach(fp => {
    if (!fingerPrintMap[fp.hash]) {
      fingerPrintMap[fp.hash] = [];
    }
    fingerPrintMap[fp.hash].push({
      songId: fp.songId,
      anchorTime: fp.anchorTime,
    })

  })

  return fingerPrintMap;
}

function fingerPrint(filteredPeaks, songId) {
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

      let hash = hashing(
        anchor.frequency,
        target.frequency,
        deltaTime
      );
      fingerprints.push({
        hash,
        anchorTime: anchor.time * msPerFrame,
        songId,
      })

      targetFound++;

      if (targetFound >= AudioConfig.fingerprinting.maxTargetsPerAnchor) break;
    }

  }
  return indexFingerPrintsByHash(fingerprints);
}

export default fingerPrint;
