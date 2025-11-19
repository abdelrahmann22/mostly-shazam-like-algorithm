import asyncHandler from "express-async-handler";
import { decodeAudioBuffer } from "../utils/audioDecoder.js";
import spectrogram from "../algorithms/dsp/spectrogram.js";
import detectPeaks from "../algorithms/fingerprint/peakDetection.js";
import fingerprinting from "../algorithms/fingerprint/fingerPrinting.js";
import { createSong, getMatchSong } from "../services/songService.js";
import {
  getFingerPrintsByHashes,
  saveFingerPrints,
} from "../services/fingerprintService.js";
import {
  findBestMatch,
  prepareQueryData,
  scoreMatches,
} from "../algorithms/matching/match.js";

export const uploadSongController = asyncHandler(async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });
    if (!req.body.title || !req.body.artist)
      return res.status(400).json({ error: "Missing required fields" });

    let audioBuffer = req.file.buffer;
    let { title, artist } = req.body;
    const source_url = req.body.source_url || req.body.sourceUrl || null;

    const { samples, sampleRate } = await decodeAudioBuffer(audioBuffer);
    const duration_ms = Math.round((samples.length / sampleRate) * 1000);

    const spec = spectrogram(samples);

    const peaks = detectPeaks(spec);

    const songId = createSong({
      title,
      artist,
      duration_ms,
      source_url,
    });

    const fingerprints = fingerprinting(peaks, songId);

    const count = saveFingerPrints(fingerprints);

    console.log(`Saved ${count} fingerprints for song ${songId}`);

    res.status(201).json({
      message: "Song created and fingerprinted successfully",
      songId,
      title,
      artist,
      duration_ms,
      source_url,
      fingerprintCount: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const matchingSongController = asyncHandler(async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const audioBuffer = req.file.buffer;

    const { samples, sampleRate } = await decodeAudioBuffer(audioBuffer);

    const spec = spectrogram(samples);

    const peaks = detectPeaks(spec);

    const queryFingerprints = fingerprinting(peaks, null);

    const { uniqueHashes, hashIndex } = prepareQueryData(queryFingerprints);

    const dbResult = getFingerPrintsByHashes(uniqueHashes);

    const scores = scoreMatches(dbResult, hashIndex);

    const candidate = findBestMatch(scores, queryFingerprints.length);

    if (!candidate || candidate.confidence < 0) {
      return res.status(404).json({
        message: "No match found",
        confidence: candidate?.confidence || 0,
      });
    }

    const song = getMatchSong(candidate.song_id);

    res.status(201).json({
      success: true,
      match: {
        song_id: candidate.song_id,
        title: song.title,
        artist: song.artist,
        source_url: song.source_url,
        confidence: Math.round(candidate.confidence * 10) / 10,
        matches: candidate.matches,
        matchedAt: `${Math.floor(candidate.offset / 1000)}s`,
        message:
          candidate.confidence > 30 ? "High confidence" : "Low confidence",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
