/* ===========================================================
   K L U G O N A U T  –  K E T T E N R E A K T I O N
   =========================================================== */

import { playSound, addPoint } from "./main.js";
import { getTopicData } from "./topic-data.js";

export async function loadKettenreaktion() {
  const topic = window.currentTopic || "Allgemeines Wissen";
  gameArea.innerHTML = `
    <div id="chain-game">
      <h2>⚙️ Kettenreaktion</h2>
      <p class="topic-hint">Thema: ${topic}</p>
      <p>Bringe die Schritte in die richtige Reihenfolge!</p>
      <ul id="chain-list"></ul>
      <button id="checkOrder" class="glow-btn">✅ Prüfen</button>
      <p id="chain-result"></p>
    </div>
  `;

  const topicData = await getTopicData(topic);
  const chains = (topicData?.chains?.length ? topicData.chains : getFallbackChains());

  let current = chains[Math.floor(Math.random() * chains.length)];
  let scrambled = [...current.steps].sort(() => Math.random() - 0.5);

  const list = document.getElementById("chain-list");
  scrambled.forEach(step => {
    const li = document.createElement("li");
    li.className = "chain-item";
    li.draggable = true;
    li.textContent = step;
    list.appendChild(li);
  });

  enableDragSort(list);

  document.getElementById("checkOrder").onclick = () => {
    const items = [...list.children].map(li => li.textContent);
    const result = document.getElementById("chain-result");

    if (JSON.stringify(items) === JSON.stringify(current.steps)) {
      result.textContent = "✅ Perfekt! Du hast die Kettenreaktion verstanden!";
      result.style.color = "#3cff79";
      playSound("right");
      addPoint();
    } else {
      result.textContent = "❌ Noch nicht ganz richtig. Versuch’s nochmal!";
      result.style.color = "#ff3355";
      playSound("wrong");
    }
  };
}

function enableDragSort(list) {
  let dragging = null;

  list.querySelectorAll(".chain-item").forEach(item => {
    item.addEventListener("dragstart", e => {
      dragging = item;
      item.style.opacity = "0.5";
    });
    item.addEventListener("dragend", e => {
      item.style.opacity = "1";
      dragging = null;
    });
    item.addEventListener("dragover", e => e.preventDefault());
    item.addEventListener("drop", e => {
      e.preventDefault();
      if (dragging && dragging !== item) {
        const all = [...list.children];
        const from = all.indexOf(dragging);
        const to = all.indexOf(item);
        if (from < to) item.after(dragging);
        else item.before(dragging);
      }
    });
  });
}

function getFallbackChains() {
  return [
    {
      title: "Wasserkreislauf",
      steps: [
        "Die Sonne erwärmt das Wasser.",
        "Das Wasser verdunstet.",
        "Die Wolken bilden sich.",
        "Es regnet.",
        "Das Wasser fließt in Flüsse und Meere zurück."
      ]
    },
    {
      title: "Pflanzenwachstum",
      steps: [
        "Ein Samenkorn fällt in die Erde.",
        "Es keimt und wächst.",
        "Es bildet Blätter.",
        "Es blüht.",
        "Neue Samen entstehen."
      ]
    }
  ];
}
