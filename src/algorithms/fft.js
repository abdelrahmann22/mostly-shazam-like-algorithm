function complexMultiply(twiddleFactor, odd) {
  return {
    re: twiddleFactor.re * odd.re - twiddleFactor.im * odd.im,
    im: twiddleFactor.re * odd.im + twiddleFactor.im * odd.re,
  };
}

function complexAdd(even, twiddledOdd) {
  return {
    re: even.re + twiddledOdd.re,
    im: even.im + twiddledOdd.im,
  };
}

function complexSubtract(even, twiddledOdd) {
  return {
    re: even.re - twiddledOdd.re,
    im: even.im - twiddledOdd.im,
  };
}

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

function recursiveFFT(samples) {
  let N = samples.length;

  if (N === 1) return samples;

  const M = N / 2;

  let even = new Array(M);
  let odd = new Array(M);

  for (let i = 0; i < M; i++) {
    even[i] = samples[2 * i];
    odd[i] = samples[2 * i + 1];
  }

  even = recursiveFFT(even);
  odd = recursiveFFT(odd);

  const output = new Array(N);

  for (let i = 0; i < M; i++) {
    const twiddleFactor = {
      re: Math.cos((2 * Math.pi * i) / N),
      im: -Math.sin((2 * Math.pi * i) / N),
    };

    const twiddledOdd = complexMultiply(twiddleFactor, odd[i]);

    output[i] = complexAdd(even[i], twiddledOdd);
    output[i + M] = complexSubtract(even[i], twiddledOdd);
  }

  return output;
}

function fft(samples) {
  if (!Array.isArray(samples)) throw new Error("Input must be an array");

  const N = samples.length;

  if (N > 1 && !isPowerOfTwo(N)) throw new Error("Length must be power of 2");

  const complexSamples = samples.map((value) => ({
    re: value,
    im: 0,
  }));

  return recursiveFFT(complexSamples);
}

export default fft;
