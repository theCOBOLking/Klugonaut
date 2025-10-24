/* ===========================================================
   K L U G O N A U T  –  F O R S C H E R M E M O R Y
   =========================================================== */

import { playSound, addPoint } from "./main.js";
import { getTopicData } from "./topic-data.js";

export async function loadMemory() {
  const topic = window.currentTopic || "Allgemeines Wissen";
  gameArea.innerHTML = `
    <div id="memory-game">
      <h2>🧠 Forschermemory</h2>
      <p class="topic-hint">Thema: ${topic}</p>
      <p>Finde die passenden Paare!</p>
      <div id="memory-grid"></div>
      <p id="memory-feedback"></p>
    </div>
  `;

  const topicData = await getTopicData(topic);
  const keywords = topicData?.keywords?.length ? topicData.keywords : [];
  const icons = (keywords.length >= 6 ? keywords.slice(0, 6) : [
    "🌍",
    "🪐",
    "🌕",
    "☀️",
    "⭐",
    "💧"
  ]).map(String);
  const pairs = [...icons, ...icons].sort(() => Math.random() - 0.5);
  const grid = document.getElementById("memory-grid");

  let first = null;
  let second = null;
  let locked = false;
  let matches = 0;

  pairs.forEach(icon => {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.icon = icon;
    card.innerHTML = `<span class="front">?</span><span class="back">${icon}</span>`;
    grid.appendChild(card);
    card.addEventListener("click", () => flipCard(card));
  });

  function flipCard(card) {
    if (locked || card.classList.contains("matched")) return;

    card.classList.add("flipped");
    playSound("tip");

    if (!first) {
      first = card;
      return;
    }
    second = card;
    locked = true;

    if (first.dataset.icon === second.dataset.icon) {
      matchFound();
    } else {
      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        first = null;
        second = null;
        locked = false;
      }, 1000);
    }
  }

  function matchFound() {
    playSound("right");
    addPoint();
    first.classList.add("matched");
    second.classList.add("matched");
    first = null;
    second = null;
    locked = false;
    matches++;

    if (matches === icons.length) {
      document.getElementById("memory-feedback").innerHTML =
        "🎉 Super! Alle Paare gefunden!";
    }
  }
}
