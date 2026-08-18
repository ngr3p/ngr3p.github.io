const container = document.querySelector(".server-lights");
const background = document.querySelector(".background");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const lights = [
  [6.5, 45], [8.2, 54], [10.1, 62],
  [17.2, 34], [18.1, 44], [18.8, 53], [18.0, 62],
  [29.0, 43], [30.3, 52], [29.6, 61],
  [38.4, 46], [39.2, 56],
  [48.6, 31], [49.4, 39], [50.2, 46], [49.0, 52], [50.6, 57], [49.7, 62], [51.0, 67],
  [60.8, 46], [61.6, 56],
  [70.4, 43], [69.7, 52], [71.0, 61],
  [82.0, 34], [81.2, 44], [82.0, 53], [81.4, 62],
  [89.8, 45], [91.7, 54], [93.4, 62]
];

const random = (min, max) => Math.random() * (max - min) + min;

const createLight = ([x, y], index) => {
  const light = document.createElement("span");
  light.className = `server-light${index >= 12 && index <= 18 ? " server-light--core" : ""}`;
  light.style.left = `${x}%`;
  light.style.top = `${y}%`;
  light.style.setProperty("--size", `${random(1.4, 2.8).toFixed(2)}px`);
  light.style.setProperty("--duration", `${random(1.5, 4.5).toFixed(2)}s`);
  light.style.setProperty("--delay", `${(-random(0, 5)).toFixed(2)}s`);
  return light;
};

const triggerGlitch = () => {
  background.classList.add("glitch");

  setTimeout(() => {
    background.classList.remove("glitch");
  }, 90 + Math.random() * 90);
};

const scheduleGlitch = () => {
  setTimeout(() => {
    if (!reducedMotion) {
      triggerGlitch();
      scheduleGlitch();
    }
  }, 6500 + Math.random() * 10000);
};

if (!reducedMotion) {
  const fragment = document.createDocumentFragment();

  lights.forEach((position, index) => {
    fragment.appendChild(createLight(position, index));
  });

  container.appendChild(fragment);
  scheduleGlitch();
}
