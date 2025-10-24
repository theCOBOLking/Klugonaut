/* ===========================================================
   K L U G O N A U T  –  R A K E T E N  A N I M A T I O N
   =========================================================== */

import { CONFIG } from "./config.js";

let rocket = null;
let fuelBar = null;

window.addEventListener("DOMContentLoaded", () => {
  rocket = document.getElementById("rocket");
  fuelBar = document.getElementById("fuel");
});

export function updateRocketProgress(points) {
  if (!fuelBar || !rocket) return;
  const percent = Math.min(points * 10, 100);
  fuelBar.style.width = percent + "%";
  rocket.style.left = percent + "%";
}

export function celebrateLevelUp(points) {
  if (points === 10) {
    showFloatingText("🚀 Mission 1: Zum Mond abgeschlossen!");
  } else if (points === 20) {
    showFloatingText("🪐 Mission 2: Mars erreicht!");
  } else if (points === 30) {
    showFloatingText("☀️ Mission 3: Sonnenforscher ausgezeichnet!");
  }
}

function showFloatingText(msg) {
  const div = document.createElement("div");
  div.className = "floating-msg";
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}
