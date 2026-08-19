const preloader = document.querySelector(".preloader");
const progress = document.querySelector(".preloader__progress");

let value = 0;

const timer = setInterval(() => {
  value = Math.min(value + Math.random() * 12 + 4, 92);
  progress.style.width = `${value}%`;
}, 120);

window.addEventListener("load", () => {
  clearInterval(timer);
  progress.style.width = "100%";

  setTimeout(() => {
    preloader.classList.add("is-hidden");
  }, 250);
});
