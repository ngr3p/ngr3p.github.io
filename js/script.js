const container = document.querySelector(".server-lights");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const imageWidth = 1536;
const imageHeight = 1024;

const lights = [
  [6.5, 45], [8.2, 54], [10.1, 62],
  [17.2, 34], [18.1, 44], [18.8, 53], [18.0, 62],
  [29.0, 43], [30.3, 52], [29.6, 61],
  [49.2, 49], [50.4, 54], [49.6, 59], [50.8, 64],
  [70.4, 43], [69.7, 52], [71.0, 61],
  [82.0, 34], [81.2, 44], [82.0, 53], [81.4, 62],
  [89.8, 45], [91.7, 54], [93.4, 62]
];

const random = (min, max) => Math.random() * (max - min) + min;

const getCoverGeometry = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scale = Math.max(viewportWidth / imageWidth, viewportHeight / imageHeight);
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;
  const offsetX = (viewportWidth - renderedWidth) / 2;
  const offsetY = (viewportHeight - renderedHeight) / 2;

  return { renderedWidth, renderedHeight, offsetX, offsetY };
};

const positionLight = (light) => {
  const { renderedWidth, renderedHeight, offsetX, offsetY } = getCoverGeometry();
  const x = Number(light.dataset.x);
  const y = Number(light.dataset.y);

  light.style.left = `${offsetX + renderedWidth * (x / 100)}px`;
  light.style.top = `${offsetY + renderedHeight * (y / 100)}px`;
};

const positionLights = () => {
  container.querySelectorAll(".server-light").forEach(positionLight);
};

const createLight = ([x, y]) => {
  const light = document.createElement("span");
  light.className = "server-light";
  light.dataset.x = x;
  light.dataset.y = y;
  light.style.setProperty("--size", `${random(1.4, 2.6).toFixed(2)}px`);
  light.style.setProperty("--duration", `${random(1.8, 4.8).toFixed(2)}s`);
  light.style.setProperty("--delay", `${(-random(0, 5)).toFixed(2)}s`);
  return light;
};

if (!reducedMotion) {
  const fragment = document.createDocumentFragment();

  lights.forEach((position) => {
    fragment.appendChild(createLight(position));
  });

  container.appendChild(fragment);
  positionLights();
  window.addEventListener("resize", positionLights, { passive: true });
  window.addEventListener("orientationchange", positionLights, { passive: true });
}
