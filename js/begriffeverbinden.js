/* ===========================================================
   K L U G O N A U T  –  B E G R I F F E   V E R B I N D E N
   =========================================================== */

import { playSound, addPoint } from "./main.js";
import { getTopicData } from "./topic-data.js";

export async function loadBegriffeVerbinden() {
  const topic = window.currentTopic || "Allgemeines Wissen";
  gameArea.innerHTML = `
    <div id="connect-game">
      <h2>🔗 Begriffe verbinden</h2>
      <p class="topic-hint">Thema: ${topic}</p>
      <p>Ziehe die passenden Paare zusammen!</p>
      <div id="connect-container">
        <div id="left-side"></div>
        <div id="right-side"></div>
      </div>
      <p id="connect-result"></p>
    </div>
  `;

  const topicData = await getTopicData(topic);
  const pairs = topicData?.connections?.length ? topicData.connections : getFallbackPairs();

  const leftSide = document.getElementById("left-side");
  const rightSide = document.getElementById("right-side");
  const result = document.getElementById("connect-result");

  const leftItems = [...pairs].sort(() => Math.random() - 0.5);
  const rightItems = [...pairs].sort(() => Math.random() - 0.5);

  leftItems.forEach(p => {
    const div = document.createElement("div");
    div.className = "connect-item left";
    div.textContent = p.left;
    div.dataset.word = p.left;
    div.draggable = true;
    leftSide.appendChild(div);
  });

  rightItems.forEach(p => {
    const div = document.createElement("div");
    div.className = "connect-item right";
    div.textContent = p.right;
    div.dataset.match = p.left;
    rightSide.appendChild(div);
  });

  enableConnectDrag();
}

function enableConnectDrag() {
  const leftItems = document.querySelectorAll(".connect-item.left");
  const rightItems = document.querySelectorAll(".connect-item.right");
  const result = document.getElementById("connect-result");

  leftItems.forEach(left => {
    left.addEventListener("dragstart", e => {
      e.dataTransfer.setData("word", left.dataset.word);
      playSound("tip");
    });
  });

  rightItems.forEach(right => {
    right.addEventListener("dragover", e => e.preventDefault());
    right.addEventListener("drop", e => {
      const word = e.dataTransfer.getData("word");
      const match = right.dataset.match;
      if (word === match) {
        right.classList.add("matched");
        playSound("right");
        addPoint();
        result.textContent = "✅ Richtig verbunden!";
        result.style.color = "#3cff79";
      } else {
        right.classList.add("wrong");
        playSound("wrong");
        result.textContent = "❌ Das passt nicht zusammen!";
        result.style.color = "#ff3355";
      }
      setTimeout(() => {
        right.classList.remove("wrong");
        result.textContent = "";
      }, 1500);
    });
  });
}

function getFallbackPairs() {
  return [
    { left: "Wolke", right: "besteht aus Wassertröpfchen" },
    { left: "Kompass", right: "zeigt den Norden" },
    { left: "Sonne", right: "liefert Licht und Wärme" },
    { left: "Frosch", right: "lebt im Wasser und an Land" },
    { left: "Baum", right: "macht Sauerstoff" }
  ];
}
