/* ===========================================================
   K L U G O N A U T  –  M I L L I O N E N S H O W
   =========================================================== */

import { playSound, addPoint } from "./main.js";
import { getTopicData } from "./topic-data.js";

export async function loadMillionenshow() {
  const topic = window.currentTopic || "Allgemeines Wissen";
  gameArea.innerHTML = `
    <div id="quiz-stage">
      <h2>🎬 Klugonauten-Mission: Millionenshow</h2>
      <p class="topic-hint">Thema: ${topic}</p>
      <p id="question"></p>
      <div class="answers"></div>
      <div id="feedback"></div>
      <button id="joker" class="glow-btn">🧠 Frage den Klugonauten</button>
    </div>
  `;

  const topicData = await getTopicData(topic);
  const questions = (topicData?.quiz?.length ? topicData.quiz : getFallbackQuestions()).map(q => ({
    ...q,
    q: q.q || q.question,
    a: q.a || q.answers
  }));

  if (!questions.length) {
    document.getElementById("question").textContent = "❌ Keine Fragen vorhanden.";
    document.querySelector(".answers").innerHTML = "";
    return;
  }

  let current = 0;
  showQuestion(current);

  document.getElementById("joker").onclick = () => {
    const q = questions[current];
    const fb = document.getElementById("feedback");
    fb.innerHTML = `🧠 <strong>Klugonaut:</strong> ${q.hint}`;
    fb.style.color = "#00eaff";
    playSound("tip");
  };

  function showQuestion(i) {
    const q = questions[i];
    document.getElementById("question").textContent = q.q;

    const answersDiv = document.querySelector(".answers");
    answersDiv.innerHTML = "";

    q.a.forEach((ans, idx) => {
      const btn = document.createElement("div");
      btn.className = "answer";
      btn.textContent = ans;
      btn.onclick = () => checkAnswer(idx, q.correct);
      answersDiv.appendChild(btn);
    });

    document.getElementById("feedback").textContent = "";
  }

  function checkAnswer(index, correct) {
    const feedback = document.getElementById("feedback");
    const answers = document.querySelectorAll(".answer");

    answers.forEach(btn => btn.style.pointerEvents = "none");

    if (index === correct) {
      answers[index].classList.add("correct");
      feedback.textContent = "✅ Richtig!";
      feedback.style.color = "#3cff79";
      addPoint();
      playSound("right");
    } else {
      answers[index].classList.add("wrong");
      feedback.textContent = "❌ Falsch!";
      feedback.style.color = "#ff3355";
      playSound("wrong");
    }

    setTimeout(() => {
      current++;
      if (current < questions.length) {
        showQuestion(current);
      } else {
        feedback.textContent = "🎉 Mission erfüllt! Du hast alle Fragen gemeistert!";
        feedback.style.color = "#00eaff";
      }
    }, 2000);
  }
}

function getFallbackQuestions() {
  return [
    {
      q: "Welches Tier kann sowohl an Land als auch im Wasser leben?",
      a: ["Frosch", "Vogel", "Katze", "Eichhörnchen"],
      correct: 0,
      hint: "Denke an Tiere, die Eier im Wasser legen und Kiemen haben, wenn sie jung sind."
    },
    {
      q: "Was zeigt ein Kompass an?",
      a: ["Den Norden", "Die Temperatur", "Die Höhe", "Die Zeit"],
      correct: 0,
      hint: "Er zeigt eine Himmelsrichtung an, die dir beim Orientieren hilft."
    },
    {
      q: "Woraus besteht der größte Teil der Erde?",
      a: ["Wasser", "Land", "Eis", "Lava"],
      correct: 0,
      hint: "Schau auf den Globus – die blaue Fläche ist der größte Anteil."
    }
  ];
}
