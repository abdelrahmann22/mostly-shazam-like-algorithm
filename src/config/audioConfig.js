export const AudioConfig = {
  // Audio Processing
  sampleRate: 11025,
  audioChannels: 1,

  // FFT & Spectrogram
  windowSize: 2048,
  hopSize: 1024,

  // Frequency Analysis
  frequencyBands: [
    { low: 0, high: 10, name: "very low" },
    { low: 10, high: 20, name: "low" },
    { low: 20, high: 40, name: "low-mid" },
    { low: 40, high: 80, name: "mid" },
    { low: 80, high: 160, name: "mid-high" },
    { low: 160, high: 511, name: "high" },
  ],

  peakDetection: {
    alpha: 0.6,
    minThreshold: 0.1,
  },

  fingerprinting: {
    minTimeDelta: 100, // 100 milliseconds
    maxTimeDelta: 500, // 500 milliseconds
    maxTargetsPerAnchor: 10,
  },

  matching: {
    binSize: 100,
  },
};
