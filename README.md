# Mostly Shazam-like Algorithm

![Node.js 22+](https://img.shields.io/badge/node-%E2%89%A522-brightgreen) ![Database: SQLite](https://img.shields.io/badge/database-SQLite-blue) ![License: ISC](https://img.shields.io/badge/license-ISC-informational)

## What the project does

A minimal end-to-end clone of Shazam's core workflow that you can run locally. The Express API (`src/server.js`) accepts raw audio, fingerprints it with the custom DSP pipeline in `src/algorithms`, stores time-frequency hashes in SQLite, and compares future snippets against the catalog. The static UI in `public/` lets you record microphone or system audio straight from the browser and submit it to the matcher.

## Why the project is useful

- **Deterministic audio fingerprinting** – FFT-based spectrograms, adaptive peak picking, and robust hash tuples (`src/algorithms/fingerprint`) make lookups resilient to noise.
- **Simple operational model** – Uses the embedded SQLite database (`src/db/`) so you can ship, backup, or share fingerprints as a single file.
- **Browser-first experience** – `public/script.js` records mic or desktop audio with MediaRecorder and handles upload, loaders, and match feedback.
- **Extensible configuration** – `src/config/audioConfig.js` centralizes sample rate, window sizes, target zones, and matching bin sizes for experimentation.

## Getting started

### Prerequisites

- Node.js 22+ (global `fetch` is required by the import scripts)
- FFmpeg binary available on your PATH

### Installation

```bash
git clone https://github.com/abdelrahmann22/mostly-shazam--like-algorithm.git
cd mostly-shazam--like-algorithm
npm install
```

### Configuration

Create a `.env` file (see `.env` for defaults):

| Variable   | Description                                                                       | Default            |
| ---------- | --------------------------------------------------------------------------------- | ------------------ |
| `PORT`     | HTTP port for the API and static UI                                               | `3000`             |
| `DB_PATH`  | Absolute path to the SQLite database. Can live on a mounted volume in production. | `./data/shazam.db` |
| `NODE_ENV` | Enables production-specific DB defaults                                           | `development`      |

The database file is created automatically; ensure the parent directory is writable.

### Run the API + UI

```bash
# Watches for changes
npm run dev

# Production-style start
npm start
```

Visit `http://localhost:3000` to open the recorder UI.

### REST API

Upload songs you want in the catalog, then match arbitrary clips. Audio is expected under the `audio` multipart field.

```bash
# 1. Catalog a reference track
curl -X POST http://localhost:3000/api/song/upload \
  -F "title=Sky" \
  -F "artist=Playboi Carti" \
  -F "source_url=https://www.youtube.com/watch?v=GYE9H4SMq5E" \
  -F "audio=@/path/to/sky.mp3"

# 2. Try to identify an unknown clip
curl -X POST http://localhost:3000/api/song/match \
  -F "audio=@/path/to/recording.webm"
```

The matcher response includes the best candidate, confidence score, and the approximate offset where the match occurred (`matchedAt`).

### Web client workflow

1. Run the server.
2. Open the landing page and choose whether to capture the microphone or system audio (share-tab mode).
3. Tap the record button, wait for the loader, and review the match card (YouTube embeds appear automatically when `source_url` is stored).

### Project layout

```
src/
  server.js               Express API bootstrap
  db/                     SQLite connection + schema migrations
  algorithms/dsp/         FFT, windowing, and spectrogram helpers
  algorithms/fingerprint/ Peak detection + hash generation
  algorithms/matching/    Scoring functions for candidate songs
  services/               Thin database abstraction layers
  utils/audioDecoder.js   FFmpeg-based PCM decoder
public/                    Static UI served by Express
```

## Where to get help

- Review the inline comments in `src/algorithms/` for implementation details.
- Open a discussion or issue on GitHub if you hit edge cases with FFmpeg, or fingerprint storage.
- For environment-specific troubles (permissions, DB locations), inspect the logs emitted by `src/db/db.js` when the server boots.

## Maintainers & contributions

Maintained by [@abdelrahmann22](https://github.com/abdelrahmann22). Contributions are welcome:

- Fork the repository and create feature branches off `main`.
- Add or update tests/scripts when changing DSP logic or import flows.
- Open a pull request describing the change and the matching strategy.

For new feature ideas or bug reports, please open an issue so the work can be discussed before implementation.
