import { AudioConfig } from "../../config/audioConfig.js";

function slidingWindow(samples) {
  let window_size = AudioConfig.windowSize;
  let hop_size = AudioConfig.hopSize;
  let slides = [];

  let l = 0;
  let r = window_size;

  while (r <= samples.length) {
    slides.push(samples.slice(l, r));
    l += hop_size;
    r += hop_size;
  }

  return slides;
}

function applyingHamming(samples) {
  const N = samples.length;
  const windowed = new Float32Array(N);

  for (let n = 0; n < N; n++) {
    const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
    windowed[n] = samples[n] * w;
  }

  return windowed;
}

export { slidingWindow, applyingHamming };
