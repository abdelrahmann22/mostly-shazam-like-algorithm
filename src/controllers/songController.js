import asyncHandler from "express-async-handler";

import { decodeAudioBuffer } from "../utils/audioDecoder.js";
import spectrogram from "../algorithms/dsp/spectrogram.js";
import detectPeaks from "../algorithms/fingerprinting/peakDetection.js";

export const uploadSongController = asyncHandler(async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const audioBuffer = req.file.buffer;

    const { samples, sampleRate } = await decodeAudioBuffer(audioBuffer);

    const spec = spectrogram(samples);

    const peaks = detectPeaks(spec);

    res.status(200).json({
      message: "Audio decoded successfully",
      sampleCount: samples.length,
      duration: samples.length / sampleRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
