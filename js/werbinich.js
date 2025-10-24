/* ===========================================================
   K L U G O N A U T  –  W E R   B I N   I C H ?
   =========================================================== */

import { playSound, addPoint } from "./main.js";

export function loadWerBinIch() {
  gameArea.innerHTML = `
    <div id="werbinich-game">
      <h2>🐾 Wer bin ich?</h2>
      <p id="hint">Hier kommen deine Hinweise...</p>
      <input id="guessInput" type="text" placeholder="Deine Antwort" autocomplete="off"/>
      <button id="checkBtn" class="glow-btn">Antwort prüfen</button>
      <p id="result"></p>
    </div>
  `;

  const riddles = [
    {
      hints: [
        "Ich bin grün und lebe am Wasser.",
        "Ich springe weit und esse Fliegen.",
        "Meine Haut ist glatt und ich quacke gern."
      ],
      answer: "frosch"
    },
    {
      hints: [
        "Ich habe Flügel und kann fliegen.",
        "Ich baue Nester.",
        "Ich kann singen und piepsen."
      ],
      answer: "vogel"
    },
    {
      hints: [
        "Ich bin aus Metall und fahre auf der Straße.",
        "Ich brauche Benzin oder Strom.",
        "Ich habe Räder und bringe dich ans Ziel."
      ],
      answer: "auto"
    }
  ];

  let current = 0;
  let hintIndex = 0;

  const hintEl = document.getElementById("hint");
  const resultEl = document.getElementById("result");
  const checkBtn = document.getElementById("checkBtn");
  const input = document.getElementById("guessInput");

  showHint();

  function showHint() {
    const r = riddles[current];
    hintEl.textContent = r.hints[hintIndex];
  }

  checkBtn.onclick = () => {
    const val = input.value.trim().toLowerCase();
    const r = riddles[current];
    if (!val) return;

    if (val === r.answer) {
      resultEl.textContent = "✅ Richtig! Du hast mich erkannt!";
      resultEl.style.color = "#3cff79";
      playSound("right");
      addPoint();
      setTimeout(nextRiddle, 2000);
    } else {
      resultEl.textContent = "❌ Noch nicht! Versuche es nochmal.";
      resultEl.style.color = "#ff3355";
      playSound("wrong");
      hintIndex++;
      if (hintIndex < r.hints.length) {
        setTimeout(showHint, 1500);
      } else {
        resultEl.textContent = `💡 Die richtige Antwort war: ${r.answer.toUpperCase()}`;
        setTimeout(nextRiddle, 2500);
      }
    }
  };

  function nextRiddle() {
    current++;
    hintIndex = 0;
    input.value = "";
    resultEl.textContent = "";
    if (current >= riddles.length) {
      hintEl.textContent = "🎉 Du hast alle Rätsel gemeistert!";
      input.style.display = "none";
      checkBtn.style.display = "none";
    } else {
      showHint();
    }
  }
}
