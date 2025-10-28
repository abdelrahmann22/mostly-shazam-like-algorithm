import fft from "./fft.js";

function slidingWindow(samples) {
  let window_size = 2048;
  let hop_size = window_size / 2;
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

function getMagnitude({ re, im }) {
  return Math.sqrt(re ** 2 + im ** 2);
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

function spectrogram(samples) {
  let samplesWindows = slidingWindow(samples);

  let spectrogram_list = [];
  for (let window of samplesWindows) {
    window = applyingHamming(window);
    const spectrum = fft(window);

    const magnitudes = [];
    for (let j = 0; j < spectrum.length / 2; j++) {
      magnitudes.push(getMagnitude(spectrum[j]));
    }

    spectrogram_list.push(magnitudes);
  }

  return spectrogram_list;
}

export default spectrogram;
