const preloader = document.querySelector(".preloader");
const progress = document.querySelector(".preloader__progress");
const audio = document.querySelector(".background-audio");
const audioToggle = document.querySelector(".audio-toggle");

let value = 0;

const setAudioState = (playing) => {
  audioToggle.classList.toggle("is-playing", playing);
  audioToggle.setAttribute("aria-pressed", String(playing));
  audioToggle.setAttribute("aria-label", playing ? "Mutar áudio" : "Ativar áudio");
};

const startAudio = async () => {
  try {
    audio.volume = 0.45;
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
  async () => {
    if (audio.paused && !audioToggle.classList.contains("is-playing")) {
      await startAudio();
    }
  },
  { once: true }
);
