/* ===========================================================
   K L U G O N A U T  –  W A S   P A S S I E R T   W E N N ...
   =========================================================== */

import { playSound, addPoint } from "./main.js";
import { getTopicData } from "./topic-data.js";

export async function loadWasPassiertWenn() {
  const topic = window.currentTopic || "Allgemeines Wissen";
  gameArea.innerHTML = `
    <div id="waspassiertwenn-game">
      <h2>💬 Was passiert, wenn ...?</h2>
      <p class="topic-hint">Thema: ${topic}</p>
      <p>Wähle die richtige Folge!</p>
      <div id="question-area"></div>
      <div id="answers-area" class="answers"></div>
      <div id="feedback"></div>
    </div>
  `;

  const topicData = await getTopicData(topic);
  const scenarios = (topicData?.scenarios?.length ? topicData.scenarios : getFallbackScenarios()).map(s => ({
    ...s,
    question: s.question || s.q,
    answers: s.answers || s.options
  }));

  let current = 0;
  showScenario(current);

  function showScenario(i) {
    const s = scenarios[i];
    document.getElementById("question-area").textContent = s.question;
    const answersDiv = document.getElementById("answers-area");
    const feedback = document.getElementById("feedback");
    feedback.textContent = "";

    answersDiv.innerHTML = "";
    s.answers.forEach((a, idx) => {
      const btn = document.createElement("div");
      btn.className = "answer";
      btn.textContent = a;
      btn.onclick = () => checkAnswer(idx, s.correct, s.explanation);
      answersDiv.appendChild(btn);
    });
  }

  function checkAnswer(selected, correct, explanation) {
    const answers = document.querySelectorAll(".answer");
    const fb = document.getElementById("feedback");

    answers.forEach(btn => (btn.style.pointerEvents = "none"));

    if (selected === correct) {
      answers[selected].classList.add("correct");
      fb.textContent = "✅ Richtig! " + explanation;
      fb.style.color = "#3cff79";
      playSound("right");
      addPoint();
    } else {
      answers[selected].classList.add("wrong");
      fb.textContent = "❌ Falsch! " + explanation;
      fb.style.color = "#ff3355";
      playSound("wrong");
    }

    setTimeout(() => {
      current++;
      if (current < scenarios.length) {
        showScenario(current);
      } else {
        fb.textContent = "🎉 Alle Situationen gemeistert!";
        fb.style.color = "#00eaff";
      }
    }, 2500);
  }
}

function getFallbackScenarios() {
  return [
    {
      question: "Was passiert, wenn Pflanzen kein Licht bekommen?",
      answers: [
        "Sie wachsen schneller.",
        "Sie werden gelb und sterben.",
        "Sie bekommen mehr Blätter.",
        "Sie blühen stärker."
      ],
      correct: 1,
      explanation: "Ohne Licht können Pflanzen keine Fotosynthese betreiben und werden schwach oder sterben."
    },
    {
      question: "Was passiert, wenn du Metall in die Steckdose steckst?",
      answers: [
        "Nichts passiert.",
        "Es leuchtet.",
        "Es kann ein Stromschlag entstehen.",
        "Es macht Musik."
      ],
      correct: 2,
      explanation: "Metall leitet Strom – das ist sehr gefährlich! Daher nie Metall in eine Steckdose stecken."
    },
    {
      question: "Was passiert, wenn Wasser gefriert?",
      answers: [
        "Es wird zu Dampf.",
        "Es wird zu Eis.",
        "Es verschwindet.",
        "Es wird heiß."
      ],
      correct: 1,
      explanation: "Wenn Wasser gefriert, verwandelt es sich in Eis, weil die Teilchen sich langsamer bewegen."
    }
  ];
}
