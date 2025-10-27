import asyncHandler from "express-async-handler";
import { decodeAudioBuffer } from "../utils/audioDecoder.js";
import spectrogram from "../algorithms/spectrogram.js";
export const uploadSongController = asyncHandler(async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const audioBuffer = req.file.buffer;

    const { samples, sampleRate } = await decodeAudioBuffer(audioBuffer);

    const spec = spectrogram(samples);

    console.log("✅ Spectrogram shape:", spec.length, "x", spec[0].length);
    console.log("✅ Sample magnitude:", spec[100][500]);
    console.log("✅ Type:", typeof spec[100][500]);
    console.log("✅ Is it a number?", !Number.isNaN(spec[100][500]));

    res.status(200).json({
      message: "Audio decoded successfully",
      sampleCount: samples.length,
      duration: samples.length / sampleRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
