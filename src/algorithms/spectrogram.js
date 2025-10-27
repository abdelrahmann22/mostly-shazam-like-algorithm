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
  let complexSamples = [];
  let spectrogram_list = [];
  for (let i of samplesWindows) {
    complexSamples.push(fft(i));
  }

  for (let i = 0; i < complexSamples.length; i++) {
    let temp = [];
    for (let j = 0; j < complexSamples[i].length / 2; j++) {
      temp.push(getMagnitude(complexSamples[i][j]));
    }
    spectrogram_list.push(temp);
  }
  console.log(spectrogram_list);
  return spectrogram_list;
}

export default spectrogram;
