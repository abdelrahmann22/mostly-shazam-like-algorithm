import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";
import { AudioConfig } from "../config/audioConfig.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const decodeAudioBuffer = (audioBuffer) => {
  return new Promise((resolve, reject) => {
    const bufferStream = Readable.from(audioBuffer);

    const chunks = [];

    ffmpeg(bufferStream)
      .audioFrequency(AudioConfig.sampleRate)
      .audioChannels(AudioConfig.audioChannels)
      .audioCodec("pcm_s16le")
      .format("s16le")
      .on("error", (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .on("end", () => {
        const pcmBuffer = Buffer.concat(chunks);

        const samples = new Float32Array(pcmBuffer.length / 2);

        for (let i = 0; i < samples.length; i++) {
          samples[i] = pcmBuffer.readInt16LE(i * 2) / 32768.0;
        }

        resolve({ samples, sampleRate: AudioConfig.sampleRate });
      })
      .pipe()
      .on("data", (chunk) => {
        chunks.push(chunk);
      });
  });
};
