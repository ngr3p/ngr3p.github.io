const container = document.querySelector(".server-lights");
const background = document.querySelector(".background");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const lights = [
  [6.5, 45], [8.2, 54], [10.1, 62],
  [17.2, 34], [18.1, 44], [18.8, 53], [18.0, 62],
  [29.0, 43], [30.3, 52], [29.6, 61],
  [70.4, 43], [69.7, 52], [71.0, 61],
  [82.0, 34], [81.2, 44], [82.0, 53], [81.4, 62],
  [89.8, 45], [91.7, 54], [93.4, 62]
];

const random = (min, max) => Math.random() * (max - min) + min;

const createLight = ([x, y]) => {
  const light = document.createElement("span");
  light.className = "server-light";
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

  lights.forEach((position) => {
    fragment.appendChild(createLight(position));
  });

  container.appendChild(fragment);
  scheduleGlitch();
}
