const container = document.querySelector(".server-lights");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const zones = [
  { minX: 8, maxX: 22, minY: 30, maxY: 70 },
  { minX: 24, maxX: 38, minY: 34, maxY: 72 },
  { minX: 40, maxX: 47, minY: 36, maxY: 69 },
  { minX: 48, maxX: 52, minY: 25, maxY: 66 },
  { minX: 53, maxX: 60, minY: 36, maxY: 69 },
  { minX: 62, maxX: 76, minY: 34, maxY: 72 },
  { minX: 78, maxX: 92, minY: 30, maxY: 70 }
];

const random = (min, max) => Math.random() * (max - min) + min;

const createLight = (zone, index) => {
  const light = document.createElement("span");
  light.className = "server-light";
  light.style.left = `${random(zone.minX, zone.maxX)}%`;
  light.style.top = `${random(zone.minY, zone.maxY)}%`;
  light.style.setProperty("--size", `${random(1.2, 3.2).toFixed(2)}px`);
  light.style.setProperty("--duration", `${random(1.2, 4.8).toFixed(2)}s`);
  light.style.setProperty("--delay", `${(-random(0, 5)).toFixed(2)}s`);
  light.dataset.index = index;
  return light;
};

if (!reducedMotion) {
  const fragment = document.createDocumentFragment();
  let index = 0;

  zones.forEach((zone, zoneIndex) => {
    const amount = zoneIndex === 3 ? 24 : 16;

    for (let i = 0; i < amount; i += 1) {
      fragment.appendChild(createLight(zone, index));
      index += 1;
    }
  });

  container.appendChild(fragment);
}
