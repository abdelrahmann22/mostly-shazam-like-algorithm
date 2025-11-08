import asyncHandler from "express-async-handler";
import { promises as fs } from "fs";
import path from "path";
import { decodeAudioBuffer } from "../utils/audioDecoder.js";
import spectrogram from "../algorithms/dsp/spectrogram.js";
import detectPeaks from "../algorithms/fingerprint/peakDetection.js";
import fingerprinting from "../algorithms/fingerprint/fingerPrinting.js";
import { createSong } from "../services/songService.js";
import { saveFingerPrints } from "../services/fingerprintService.js";

export const uploadSongController = asyncHandler(async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const audioBuffer = req.file.buffer;

    const { samples, sampleRate } = await decodeAudioBuffer(audioBuffer);

    const spec = spectrogram(samples);

    const peaks = detectPeaks(spec);
    const fingerprint = fingerprinting(peaks, 1);
    res.status(200).json({
      message: "Audio decoded successfully",
      sampleCount: samples.length,
      duration: samples.length / sampleRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const createSongController = asyncHandler(async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });
    if (!req.body.title || !req.body.artist)
      return res.status(400).json({ error: "Missing required fields" });

    let audioBuffer = req.file.buffer;
    let { title, artist } = req.body;

    const { samples, sampleRate } = await decodeAudioBuffer(audioBuffer);
    const duration_ms = Math.round((samples.length / sampleRate) * 1000);

    const spec = spectrogram(samples);

    const peaks = detectPeaks(spec);

    const songsDir = path.resolve(process.cwd(), "data", "songs");

    await fs.mkdir(songsDir, { recursive: true });

    const timestamp = Date.now();
    const originalExt = path.extname(req.file.originalname);
    const fileName = `${title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_${timestamp}${originalExt}`;
    const filePath = path.join(songsDir, fileName);

    await fs.writeFile(filePath, audioBuffer);

    const relativeFilePath = path.join("data", "songs", fileName);

    const songId = createSong({
      title,
      artist,
      duration_ms,
      file_path: relativeFilePath,
    });

    const fingerprint = fingerprinting(peaks, songId);

    const count = saveFingerPrints(fingerprint);

    console.log(`Saved ${count} fingerprints for song ${songId}`);

    res.status(201).json({
      message: "Song created and fingerprinted successfully",
      songId,
      title,
      artist,
      duration_ms,
      file_path: relativeFilePath,
      fingerprintCount: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
