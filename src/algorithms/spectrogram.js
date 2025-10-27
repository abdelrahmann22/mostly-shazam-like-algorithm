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

function spectrogram(samples) {
  let samplesWindows = slidingWindow(samples);

  let spectrogram_list = [];
  for (let window of samplesWindows) {
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
