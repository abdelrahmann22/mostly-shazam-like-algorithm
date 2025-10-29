import fft from "./fft.js";
import { slidingWindow, applyingHamming } from "./windowing.js";
function getMagnitude({ re, im }) {
  return Math.sqrt(re ** 2 + im ** 2);
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
