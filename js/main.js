/* ===========================================================
   K L U G O N A U T  –  M A I N
   =========================================================== */

import { CONFIG, apiFetch } from "./config.js";
import { updateRocketProgress, celebrateLevelUp } from "./rocket.js";
import { CHAPTERS } from "../data/chapters.js";

let currentSet = "A";
let currentGame = null;
window.currentTopic = null;
let points = 0;

// Panels
const rightPanel = document.getElementById("right-panel");
window.gameArea = document.getElementById("game-area");
const rocketFuel = document.getElementById("fuel");
const rocketImg = document.getElementById("rocket");

window.addEventListener("DOMContentLoaded", () => {
  loadMenu(currentSet);
  setupGameButtons();
  setupPartSwitch();
});

async function loadMenu(set) {
  rightPanel.innerHTML = `<h2>📘 Themen (${set} Teil)</h2><p>Lade Daten...</p>`;
  window.currentTopic = null;

  let data = await apiFetch(`/chapters?part=${set}`);
  let usedFallback = false;

  if (!data || !Object.keys(data).length) {
    data = CHAPTERS[set] || {};
    usedFallback = true;
    if (CONFIG.debug) {
      console.warn("Kapitel werden aus dem lokalen Dummy geladen, da die API nicht erreichbar ist.");
    }
  }

  rightPanel.innerHTML = `<h2>📘 Themen (${set} Teil)</h2>`;

  if (usedFallback) {
    rightPanel.innerHTML += `<p class="fallback-hint">⚠️ Offline-Modus: Lokale Themen aktiv.</p>`;
  }

  if (!Object.keys(data).length) {
    rightPanel.innerHTML += `<p>❌ Keine Themen verfügbar.</p>`;
    return;
  }

  for (const [chapter, subtopics] of Object.entries(data)) {
    const div = document.createElement("div");
    div.className = "chapter";

    const h = document.createElement("h3");
    h.textContent = chapter;
    h.onclick = () => toggleAccordion(div);
    div.appendChild(h);

    const sub = document.createElement("div");
    sub.className = "subtopics";
    (subtopics || []).forEach(topic => {
      const b = document.createElement("button");
      b.textContent = topic;
      b.onclick = () => selectTopic(`${chapter} – ${topic}`);
      sub.appendChild(b);
    });

    div.appendChild(sub);
    rightPanel.appendChild(div);
  }

  showSelectTopicMessage();
}

function toggleAccordion(div) {
  const all = document.querySelectorAll(".subtopics");
  all.forEach(s => {
    if (s !== div.querySelector(".subtopics")) s.classList.remove("open");
  });
  div.querySelector(".subtopics").classList.toggle("open");
}

function setupGameButtons() {
  document.querySelectorAll("#left-panel button[data-game]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentGame = btn.getAttribute("data-game");
      tryGenerate();
    });
  });
}

function selectTopic(topic) {
  window.currentTopic = topic;
  tryGenerate();
}

function tryGenerate() {
  if (!currentGame || !window.currentTopic) return;
  gameArea.innerHTML = `<h3>${window.currentTopic}</h3><p>Lädt ${currentGame}...</p>`;

  switch (currentGame) {
    case "millionenshow":
      import("./millionenshow.js").then(m => m.loadMillionenshow());
      break;
    case "memory":
      import("./memory.js").then(m => m.loadMemory());
      break;
    case "werbinich":
      import("./werbinich.js").then(m => m.loadWerBinIch());
      break;
    case "kettenreaktion":
      import("./kettenreaktion.js").then(m => m.loadKettenreaktion());
      break;
    case "waspassiertwenn":
      import("./waspassiertwenn.js").then(m => m.loadWasPassiertWenn());
      break;
    case "begriffeverbinden":
      import("./begriffeverbinden.js").then(m => m.loadBegriffeVerbinden());
      break;
    case "arbeitsblatt":
      import("./arbeitsblatt.js").then(m => m.loadArbeitsblatt());
      break;
    default:
      gameArea.innerHTML = `<p>❌ Unbekanntes Modul: ${currentGame}</p>`;
  }
}

function setupPartSwitch() {
  document.getElementById("to-b").onclick = () => {
    currentSet = "B";
    loadMenu("B");
  };
  document.getElementById("to-c").onclick = () => {
    currentSet = "C";
    loadMenu("C");
  };
}

function showSelectTopicMessage() {
  if (!gameArea) return;
  gameArea.innerHTML = `
    <h2>👨‍🚀 Wähle ein Thema!</h2>
    <p>Suche dir rechts ein Thema aus, um mit deinem Spiel fortzufahren.</p>
  `;
}

export function addPoint() {
  points++;
  const percent = Math.min((points / 10) * 100, 100);
  rocketFuel.style.width = percent + "%";
  rocketImg.style.left = percent + "%";
  updateRocketProgress(points);
  celebrateLevelUp(points);
  if (CONFIG.debug) console.log(`+1 Punkt (${points}/10)`);
}

export function playSound(type) {
  let src = "";
  if (type === "right") src = "assets/sounds/right.mp3";
  else if (type === "wrong") src = "assets/sounds/wrong.mp3";
  else if (type === "tip") src = "assets/sounds/tip.mp3";
  if (!src) return;

  const a = new Audio(src);
  a.volume = 0.5;
  a.play();
}
