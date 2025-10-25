import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const decodeAudioBuffer = (audioBuffer) => {
  return new Promise((resolve, reject) => {
    const bufferStream = Readable.from(audioBuffer);

    const chunks = [];
    const sampleRate = 11025;

    ffmpeg(bufferStream)
      .audioFrequency(sampleRate)
      .audioChannels(1)
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

        resolve({ samples, sampleRate });
      })
      .pipe()
      .on("data", (chunk) => {
        chunks.push(chunk);
      });
  });
};
