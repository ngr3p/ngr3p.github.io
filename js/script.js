const background = document.querySelector(".background");

const triggerGlitch = () => {
  background.classList.add("glitch");

  setTimeout(() => {
    background.classList.remove("glitch");
  }, 100 + Math.random() * 70);
};

const scheduleGlitch = () => {
  const delay = 8000 + Math.random() * 14000;

  setTimeout(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      triggerGlitch();
    }

    scheduleGlitch();
  }, delay);
};

scheduleGlitch();
