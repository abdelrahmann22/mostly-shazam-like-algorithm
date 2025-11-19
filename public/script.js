const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("statusText");
const resultContainer = document.getElementById("resultContainer");
const matchResult = document.getElementById("matchResult");
const loader = document.getElementById("loader");
const systemAudioToggle = document.getElementById("systemAudioToggle");

const systemAudioHelp = document.getElementById("systemAudioHelp");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

systemAudioToggle.addEventListener("change", () => {
  if (systemAudioToggle.checked) {
    systemAudioHelp.classList.remove("hidden");
  } else {
    systemAudioHelp.classList.add("hidden");
  }
});

recordBtn.addEventListener("click", toggleRecording);

async function toggleRecording() {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

async function startRecording() {
  try {
    let stream;

    if (systemAudioToggle.checked) {
      // Request system audio (requires user to select a tab/window/screen)
      // Note: video: true is required to get display media, but we only need the audio track
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    } else {
      // Request microphone
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    // Verify we actually got an audio track
    if (stream.getAudioTracks().length === 0) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error(
        'No audio track found. Important: When selecting a screen/tab, you MUST check "Share Audio" (bottom left) or select a specific Tab.'
      );
    }

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      await sendAudioToApi(audioBlob);

      // Stop all tracks (video and audio)
      stream.getTracks().forEach((track) => track.stop());
    });

    // If user stops sharing the screen/tab via the browser UI, we should stop recording
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        if (isRecording) {
          stopRecording();
        }
      };
    });

    mediaRecorder.start();
    isRecording = true;
    recordBtn.classList.add("recording");
    statusText.textContent = systemAudioToggle.checked
      ? "Recording System Audio..."
      : "Listening...";
    resultContainer.classList.add("hidden");
    matchResult.innerHTML = "";

    // If using system audio, disabling the toggle during recording is good practice
    systemAudioToggle.disabled = true;
  } catch (err) {
    console.error("Error accessing audio source:", err);
    if (err.name === "NotAllowedError") {
      alert("Permission denied. Please grant access to record audio.");
    } else {
      alert(err.message || "Could not start recording.");
    }
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.classList.remove("recording");
    statusText.textContent = "Processing...";
    resultContainer.classList.remove("hidden");
    loader.classList.remove("hidden");
    systemAudioToggle.disabled = false;
  }
}

async function sendAudioToApi(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  try {
    const response = await fetch("/api/song/match", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    loader.classList.add("hidden");

    if (response.ok && data.success) {
      displayMatch(data.match);
      statusText.textContent = "Match found!";
    } else {
      displayError(data.message || "No match found");
      statusText.textContent = "Tap to try again";
    }
  } catch (error) {
    console.error("API Error:", error);
    loader.classList.add("hidden");
    displayError("Network error occurred");
    statusText.textContent = "Error occurred";
  }
}

function displayMatch(match) {
  const youtubeEmbed = match.source_url
    ? createYoutubeEmbed(match.source_url)
    : "";

  const html = `
        <div class="song-info">
            <div class="song-title">${match.title}</div>
            <div class="song-artist">${match.artist}</div>
            <div class="confidence">
                Confidence: ${match.confidence}%<br>
                Matched at: ${match.matchedAt}
            </div>
            ${youtubeEmbed}
        </div>
    `;
  matchResult.innerHTML = html;
}

function createYoutubeEmbed(url) {
  try {
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) return "";
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return `
      <div class="youtube-frame">
        <iframe
          width="100%"
          height="215"
          src="${embedUrl}"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    `;
  } catch (error) {
    console.error("Failed to create YouTube embed:", error);
    return "";
  }
}

function extractYoutubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2];
    }
    return null;
  } catch (error) {
    return null;
  }
}

function displayError(message) {
  matchResult.innerHTML = `<div class="error">${message}</div>`;
}
