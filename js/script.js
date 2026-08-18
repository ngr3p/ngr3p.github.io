const background = document.querySelector(".background");

const triggerGlitch = () => {
  const x = `${(Math.random() * 4 - 2).toFixed(2)}px`;
  const y = `${(Math.random() * 3 - 1.5).toFixed(2)}px`;

  background.style.setProperty("--glitch-x", x);
  background.style.setProperty("--glitch-y", y);
  background.classList.add("glitch");

  setTimeout(() => {
    background.classList.remove("glitch");
  }, 90 + Math.random() * 80);
};

const scheduleGlitch = () => {
  const delay = 7000 + Math.random() * 12000;

  setTimeout(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      triggerGlitch();
    }

    scheduleGlitch();
  }, delay);
};

scheduleGlitch();
