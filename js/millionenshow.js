/* ===========================================================
   K L U G O N A U T  –  M I L L I O N E N S H O W
   =========================================================== */

import { playSound, addPoint } from "./main.js";
import { CONFIG, apiFetch } from "./config.js";

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

  const loadingMessage = document.getElementById("question");
  if (loadingMessage) {
    loadingMessage.textContent = "⏳ Fragen werden geladen...";
  }

  const questions = await loadQuestions(topic);

  if (!questions.length) {
    const questionEl = document.getElementById("question");
    if (questionEl) {
      questionEl.textContent = "❌ Keine Fragen vorhanden.";
    }
    const answersEl = document.querySelector(".answers");
    if (answersEl) {
      answersEl.innerHTML = "";
    }
    return;
  }

  let current = 0;
  showQuestion(current);

  document.getElementById("joker").onclick = () => {
    const q = questions[current];
    const fb = document.getElementById("feedback");
    const hint = q.hint && q.hint.trim() ? q.hint : "Ich drücke dir die Daumen! Du schaffst das!";
    fb.innerHTML = `🧠 <strong>Klugonaut:</strong> ${hint}`;
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

async function loadQuestions(topic) {
  const payload = await apiFetch(CONFIG.ai.questions, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic })
  });

  const fromApi = Array.isArray(payload?.questions)
    ? payload.questions.map(normalizeQuestion).filter(Boolean)
    : [];

  if (fromApi.length) {
    return fromApi;
  }

  return getFallbackQuestions(topic);
}

function normalizeQuestion(raw) {
  if (!raw) return null;

  const question = String(raw.q || raw.question || "").trim();
  const answers = Array.isArray(raw.a)
    ? raw.a
    : Array.isArray(raw.answers)
      ? raw.answers
      : [];

  const normalizedAnswers = answers
    .map(ans => (typeof ans === "string" ? ans.trim() : ""))
    .filter(ans => ans.length > 0);

  const indexCandidate = raw.correct ?? raw.correctIndex;
  const correctIndex = Number.isInteger(indexCandidate)
    ? indexCandidate
    : typeof indexCandidate === "string" && indexCandidate.trim() !== ""
      ? Number.parseInt(indexCandidate, 10)
      : -1;

  if (
    !question ||
    normalizedAnswers.length < 2 ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= normalizedAnswers.length
  ) {
    return null;
  }

  return {
    q: question,
    a: normalizedAnswers,
    correct: correctIndex,
    hint: typeof raw.hint === "string" ? raw.hint.trim() : ""
  };
}

function getFallbackQuestions(topic = "Allgemeines Wissen") {
  const topicLabel = typeof topic === "string" && topic.trim().length ? topic.trim() : "Allgemeines Wissen";
  return [
    {
      q: `Was beschreibt am besten das Thema "${topicLabel}"?`,
      a: [
        "Eine kurze Erklärung in eigenen Worten",
        "Eine Zeichnung ohne Bezug",
        "Ein komplett anderes Thema",
        "Nur eine Zahl"
      ],
      correct: 0,
      hint: "Überlege, wie du das Thema jemandem erklären würdest."
    },
    {
      q: `Welche Aussage passt zu "${topicLabel}"?`,
      a: [
        "Sie hilft uns, den Alltag besser zu verstehen.",
        "Sie hat gar nichts mit unserem Leben zu tun.",
        "Sie erklärt nur komplizierte Maschinen.",
        "Sie handelt ausschließlich von Märchen."
      ],
      correct: 0,
      hint: "Denke daran, warum wir das Thema im Unterricht lernen."
    },
    {
      q: `Welcher Begriff gehört zu "${topicLabel}"?`,
      a: [
        "Ein wichtiges Stichwort aus dem Thema",
        "Der Name deiner Lieblingsserie",
        "Ein zufälliger Fantasiebegriff",
        "Eine Hausnummer"
      ],
      correct: 0,
      hint: "Welche Wörter fallen dir beim Thema als erstes ein?"
    },
    {
      q: `Was könntest du zu "${topicLabel}" beobachten oder messen?`,
      a: [
        "Etwas, das direkt mit dem Thema zusammenhängt",
        "Nur das Wetter des Tages",
        "Dein Lieblingsessen",
        "Eine beliebige Fernsehsendung"
      ],
      correct: 0,
      hint: "Überlege, welche Dinge man wirklich untersuchen kann."
    },
    {
      q: `Wozu hilft das Wissen über "${topicLabel}"?`,
      a: [
        "Es macht dich sicherer und schlauer im Alltag.",
        "Es bringt nur beim Computerspielen etwas.",
        "Es verändert gar nichts.",
        "Es ist nur zum Angeben da."
      ],
      correct: 0,
      hint: "Wissen hilft uns, gute Entscheidungen zu treffen."
    },
    {
      q: `Was wäre ein gutes Beispiel für "${topicLabel}"?`,
      a: [
        "Eine Situation, die wirklich dazu passt",
        "Ein lustiger Witz",
        "Ein komplett anderes Fach",
        "Nur ein Emoji"
      ],
      correct: 0,
      hint: "Stell dir eine Szene vor, in der das Thema wichtig ist."
    },
    {
      q: `Welche Frage könntest du zu "${topicLabel}" stellen?`,
      a: [
        "Eine neugierige Frage, die weiterhilft",
        "Eine Frage nach dem Lieblingssong",
        "Eine Frage nach der Uhrzeit",
        "Gar keine Frage"
      ],
      correct: 0,
      hint: "Gute Fragen bringen dich beim Lernen weiter."
    },
    {
      q: `Wie könntest du "${topicLabel}" anderen erklären?`,
      a: [
        "Mit einfachen Worten und Beispielen",
        "Nur mit Zahlen",
        "Mit einem geheimen Code",
        "Gar nicht"
      ],
      correct: 0,
      hint: "Je einfacher du es erklärst, desto besser."
    },
    {
      q: `Was solltest du bei "${topicLabel}" auf keinen Fall vergessen?`,
      a: [
        "Den wichtigsten Kern des Themas",
        "Nur die Randnotizen",
        "Die Lieblingsfarbe deines Haustiers",
        "Eine zufällige Telefonnummer"
      ],
      correct: 0,
      hint: "Jedes Thema hat einen Hauptgedanken."
    },
    {
      q: `Was kannst du nach dem Lernen über "${topicLabel}" besser?`,
      a: [
        "Dinge verstehen oder anwenden, die dazu gehören",
        "Nur schneller laufen",
        "Deine Handschrift ändern",
        "Nichts Neues"
      ],
      correct: 0,
      hint: "Denke daran, wozu neues Wissen gut ist."
    }
  ];
}
