import { AudioConfig } from "../../config/audioConfig.js";

function findPeaksWithBands(spectrogram) {
  const peaks = [];

  for (let t = 0; t < spectrogram.length; t++) {
    let magnitudes = spectrogram[t];

    for (let band of AudioConfig.frequencyBands) {
      let maxMag = 0;
      let maxFreq = -1;

      for (let f = band.low; f < band.high; f++) {
        if (magnitudes[f] > maxMag) {
          maxMag = magnitudes[f];
          maxFreq = f;
        }
      }
      if (maxFreq != -1) {
        peaks.push({
          time: t,
          frequency: maxFreq,
          magnitude: maxMag,
          band: band.name,
        });
      }
    }
  }

  return peaks;
}

function applyDynamicThreshold(peaks) {
  const peaksPerTime = {};

  for (let peak of peaks) {
    if (!peaksPerTime[peak.time]) {
      peaksPerTime[peak.time] = [];
    }
    peaksPerTime[peak.time].push(peak);
  }

  const filteredPeaks = [];

  for (let timeFrame in peaksPerTime) {
    const timePeaks = peaksPerTime[timeFrame];

    const avgMagnitude =
      timePeaks.reduce((sum, p) => sum + p.magnitude, 0) / timePeaks.length;

    const relativeThreshold = avgMagnitude * AudioConfig.peakDetection.alpha;

    const threshold = Math.max(
      relativeThreshold,
      AudioConfig.peakDetection.minThreshold
    );

    for (let peak of timePeaks) {
      if (peak.magnitude >= threshold) {
        filteredPeaks.push(peak);
      }
    }
  }

  return filteredPeaks;
}

export default function detectPeaks(spectrogram) {
  const peaks = findPeaksWithBands(spectrogram);
  const filteredPeaks = applyDynamicThreshold(peaks);

  return filteredPeaks;
}
