const preloader = document.querySelector(".preloader");
const progress = document.querySelector(".preloader__progress");
const audio = document.querySelector(".background-audio");
const audioToggle = document.querySelector(".audio-toggle");

const maxVolume = 0.45;
const fadeDuration = 3;

let value = 0;

const setAudioState = (playing) => {
  audioToggle.classList.toggle("is-playing", playing);
  audioToggle.setAttribute("aria-pressed", String(playing));
  audioToggle.setAttribute("aria-label", playing ? "Mutar áudio" : "Ativar áudio");
};

const updateLoopVolume = () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= fadeDuration * 2) {
    audio.volume = maxVolume;
    return;
  }

  const fadeIn = Math.min(audio.currentTime / fadeDuration, 1);
  const timeRemaining = audio.duration - audio.currentTime;
  const fadeOut = Math.min(timeRemaining / fadeDuration, 1);
  const level = Math.max(0, Math.min(fadeIn, fadeOut));

  audio.volume = maxVolume * level;
};

const startAudio = async () => {
  try {
    updateLoopVolume();
    await audio.play();
    setAudioState(true);
    return true;
  } catch {
    setAudioState(false);
    return false;
  }
};

const timer = setInterval(() => {
  value = Math.min(value + Math.random() * 12 + 4, 92);
  progress.style.width = `${value}%`;
}, 120);

window.addEventListener("load", async () => {
  clearInterval(timer);
  progress.style.width = "100%";

  setTimeout(() => {
    preloader.classList.add("is-hidden");
  }, 250);

  await startAudio();
});

audio.addEventListener("timeupdate", updateLoopVolume);
audio.addEventListener("loadedmetadata", updateLoopVolume);
audio.addEventListener("play", updateLoopVolume);

audioToggle.addEventListener("click", async () => {
  if (audio.paused) {
    await startAudio();
    return;
  }

  audio.pause();
  setAudioState(false);
});

document.addEventListener(
  "pointerdown",
  async (event) => {
    if (event.target.closest(".audio-toggle")) {
      return;
    }

    if (audio.paused) {
      await startAudio();
    }
  },
  { once: true }
);
