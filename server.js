// ===========================================================
// K L U G O N A U T   –   B A C K E N D   (Express)
// ===========================================================

import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { CHAPTERS } from "./data/chapters.js";
import { generateTopicData } from "./data/topicGenerator.js";
import { parseTopicDescriptor } from "./data/topicUtils.js";
import { loadRagContext } from "./rag/ragLoader.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";
const DEBUG_GEMINI = String(process.env.DEBUG_GEMINI || "").toLowerCase() === "true";

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/chapters", (req, res) => {
  const part = req.query.part || "A";
  res.json(CHAPTERS[part] || {});
});

app.post("/api/generateSheet", async (req, res) => {
  const rawTopic = req.body?.topic || "Allgemeines Wissen";
  const descriptor = parseTopicDescriptor(rawTopic);
  const ragContext = await loadRagContext(descriptor.pages);

  try {
    const sheet = await generateWorksheetWithGemini(descriptor, ragContext);
    if (isValidWorksheet(sheet)) {
      res.json(sheet);
      return;
    }
    throw new Error("Ungültige Antwort der Gemini API");
  } catch (error) {
    logGeminiError("/api/generateSheet", error);
    res.json(buildFallbackWorksheet(descriptor));
  }
});

app.post("/api/topicData", async (req, res) => {
  const rawTopic = req.body?.topic || "Allgemeines Wissen";
  const descriptor = parseTopicDescriptor(rawTopic);
  const ragContext = await loadRagContext(descriptor.pages);

  try {
    const data = await generateTopicDataWithGemini(descriptor, ragContext);
    if (isValidTopicData(data)) {
      res.json(data);
      return;
    }
    throw new Error("Ungültige Antwort der Gemini API");
  } catch (error) {
    logGeminiError("/api/topicData", error);
    res.json(generateTopicData(descriptor.fullTitle));
  }
});

app.post("/api/generateQuestions", async (req, res) => {
  const rawTopic = req.body?.topic || "Allgemeines Wissen";
  const descriptor = parseTopicDescriptor(rawTopic);
  const ragContext = await loadRagContext(descriptor.pages);

  try {
    const questions = await generateMillionenshowQuestions(descriptor, ragContext);
    if (isValidMillionenshowQuestions(questions)) {
      res.json(questions);
      return;
    }
    throw new Error("Ungültige Antwort der Gemini API");
  } catch (error) {
    logGeminiError("/api/generateQuestions", error);
    res.json(buildFallbackMillionenshowQuestions(descriptor));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Klugonaut Backend läuft auf http://localhost:${PORT}`);
  console.log("🌐 API-Endpunkte:");
  console.log("   → GET  /api/chapters?part=A|B|C");
  console.log("   → POST /api/generateSheet");
  console.log("   → POST /api/topicData");
  console.log("   → POST /api/generateQuestions");
});

function buildFallbackWorksheet(descriptor) {
  const topicLabel = getTopicLabel(descriptor);
  return {
    title: `Arbeitsblatt: ${topicLabel}`,
    subtitle: "Wissen vertiefen mit dem Klugonaut 🚀",
    questions: [
      `1️⃣ Erkläre das Thema "${topicLabel}" in eigenen Worten.`,
      "2️⃣ Zeichne oder beschreibe etwas, das dazu passt.",
      "3️⃣ Ergänze: Das Wichtigste daran ist _______.",
      "4️⃣ Was passiert, wenn du dieses Wissen anwendest?",
      "5️⃣ Fasse in einem Satz zusammen, warum dieses Thema wichtig ist."
    ]
  };
}

function buildFallbackMillionenshowQuestions(descriptor) {
  const topicLabel = getTopicLabel(descriptor);
  const templates = [
    {
      question: `Was beschreibt am besten das Thema "${topicLabel}"?`,
      answers: [
        "Eine kindgerechte Erklärung in eigenen Worten",
        "Ein zufälliges Fantasiewort",
        "Eine Zahl ohne Bezug",
        "Ein Emoji"
      ],
      hint: "Stell dir vor, du erklärst das Thema einem Freund oder einer Freundin."
    },
    {
      question: `Welche Aussage passt besonders gut zu "${topicLabel}"?`,
      answers: [
        "Sie hilft uns, den Alltag besser zu verstehen.",
        "Sie hat nichts mit unserem Leben zu tun.",
        "Sie beschreibt nur Märchen.",
        "Sie besteht nur aus Zahlen."
      ],
      hint: "Warum lernt ihr dieses Thema in der Schule?"
    },
    {
      question: `Welcher Begriff gehört direkt zu "${topicLabel}"?`,
      answers: [
        "Ein wichtiges Stichwort aus dem Thema",
        "Der Name eines Haustiers",
        "Ein Computerspiel",
        "Eine Hausnummer"
      ],
      hint: "Welche Wörter fallen dir beim Thema als erstes ein?"
    },
    {
      question: `Was könntest du zu "${topicLabel}" beobachten oder untersuchen?`,
      answers: [
        "Etwas, das genau damit zu tun hat",
        "Nur die Wettervorhersage",
        "Deine Lieblingsfarbe",
        "Ein zufälliges Geräusch"
      ],
      hint: "Gute Beobachtungen helfen dir, das Thema zu verstehen."
    },
    {
      question: `Wobei hilft dir Wissen über "${topicLabel}"?`,
      answers: [
        "Beim Lösen von Aufgaben rund um das Thema",
        "Nur beim Computerspielen",
        "Es bringt überhaupt nichts",
        "Es dient nur zum Angeben"
      ],
      hint: "Denke daran, wie du das Thema im Alltag nutzen kannst."
    },
    {
      question: `Welches Beispiel passt am besten zu "${topicLabel}"?`,
      answers: [
        "Eine Szene, in der das Thema wichtig ist",
        "Ein lustiger Witz",
        "Ein völlig anderes Schulfach",
        "Ein Fantasiename"
      ],
      hint: "Stell dir vor, du erzählst eine Geschichte zu dem Thema."
    },
    {
      question: `Welche Frage könntest du anderen zu "${topicLabel}" stellen?`,
      answers: [
        "Eine neugierige Frage, die mehr erklärt",
        "Was ist dein Lieblingslied?",
        "Wie spät ist es?",
        "Keine Frage"
      ],
      hint: "Mit guten Fragen findest du mehr heraus."
    },
    {
      question: `Wie würdest du "${topicLabel}" kurz erklären?`,
      answers: [
        "Mit einfachen Worten und Beispielen",
        "Nur mit Zahlen",
        "Mit einer Geheimschrift",
        "Gar nicht"
      ],
      hint: "Je einfacher die Erklärung, desto besser kann man sie verstehen."
    },
    {
      question: `Was darfst du bei "${topicLabel}" nicht vergessen?`,
      answers: [
        "Den wichtigsten Gedanken des Themas",
        "Eine zufällige Telefonnummer",
        "Nur Nebensachen",
        "Den Namen deines Haustiers"
      ],
      hint: "Jedes Thema hat eine Kernidee."
    },
    {
      question: `Was kannst du nach dem Lernen über "${topicLabel}" besser?`,
      answers: [
        "Dinge erkennen oder anwenden, die dazu gehören",
        "Nur schneller laufen",
        "Besser zeichnen",
        "Gar nichts Neues"
      ],
      hint: "Neues Wissen hilft dir immer weiter."
    }
  ];

  return {
    questions: templates.map(entry => ({
      q: entry.question,
      a: entry.answers,
      correct: 0,
      hint: entry.hint
    }))
  };
}

async function generateWorksheetWithGemini(descriptor, ragContext) {
  const topicLabel = getTopicLabel(descriptor);
  const chapterLabel = descriptor.chapter || "Sachunterricht";
  const pageHint = descriptor.pages.length ? `Seiten ${descriptor.pages.join(", ")}` : "";
  const sanitizedContext = ragContext?.trim();

  const systemPrompt = [
    "Du bist der Klugonaut, ein lernfreundlicher Assistent für Kinder.",
    "Erstelle ein strukturiertes Arbeitsblatt als JSON.",
    "Das JSON muss folgende Struktur besitzen:",
    '{"title": string, "subtitle": string, "questions": string[5], "tips"?: string[] }',
    "Nutze eine motivierende, leicht verständliche Sprache auf Deutsch.",
    "Alle Fragen sollen auf das Thema eingehen und aktiv zum Nachdenken anregen.",
    "Antworte ausschließlich mit gültigem JSON ohne zusätzliche Erklärungen."
  ].join("\n");

  const promptParts = [];

  if (sanitizedContext) {
    const hint = pageHint ? ` (${pageHint})` : "";
    promptParts.push(
      `Nutze ausschließlich die folgenden Unterrichtsauszüge${hint} als Wissensbasis.\n"""\n${sanitizedContext}\n"""`
    );
  } else {
    promptParts.push("Es liegt kein zusätzliches Material vor. Nutze dein Grundschulwissen und bleibe sachlich korrekt.");
  }

  promptParts.push(
    `Thema: "${topicLabel}" im Kapitel "${chapterLabel}". Erstelle ein vollständiges Arbeitsblatt.`
  );

  const userPrompt = promptParts.join("\n\n");

  return await callGeminiJson(systemPrompt, userPrompt, { temperature: 0.65 });
}

async function generateTopicDataWithGemini(descriptor, ragContext) {
  const topicLabel = getTopicLabel(descriptor);
  const chapterLabel = descriptor.chapter || "Sachunterricht";
  const pageHint = descriptor.pages.length ? `Seiten ${descriptor.pages.join(", ")}` : "";
  const sanitizedContext = ragContext?.trim();

  const systemPrompt = [
    "Du unterstützt Grundschulkinder beim Entdecken neuer Themen.",
    "Antworte ausschließlich mit JSON, ohne erläuternden Text.",
    "Schema:",
    '{',
    '  "chapter": string,',
    '  "topic": string,',
    '  "keywords": string[6],',
    '  "quiz": [{"q": string, "a": string[4], "correct": number, "hint": string}],',
    '  "riddles": [{"hints": string[3], "answer": string}],',
    '  "scenarios": [{"question": string, "answers": string[4], "correct": number, "explanation": string}],',
    '  "connections": [{"left": string, "right": string}],',
    '  "chains": [{"title": string, "steps": string[4]}]',
    '}',
    "Beachte: Antworten sollen kindgerecht, präzise und themenbezogen sein.",
    "Nutze Deutsch und vermeide Wiederholungen.",
    "Alle Arrays müssen vollständig gefüllt sein."
  ].join("\n");

  const promptParts = [];

  if (sanitizedContext) {
    const hint = pageHint ? ` (${pageHint})` : "";
    promptParts.push(
      `Analysiere die folgenden Schulbuchauszüge${hint} und nutze sie als alleinige Wissensquelle.\n"""\n${sanitizedContext}\n"""`
    );
  } else {
    promptParts.push("Es liegt kein zusätzliches Material vor. Verwende grundlegendes Wissen für Grundschulkinder.");
  }

  promptParts.push(
    `Erstelle Lernmaterialien zum Thema "${topicLabel}" für das Kapitel "${chapterLabel}".`
  );

  const userPrompt = promptParts.join("\n\n");

  return await callGeminiJson(systemPrompt, userPrompt, { temperature: 0.6 });
}

async function generateMillionenshowQuestions(descriptor, ragContext) {
  const topicLabel = getTopicLabel(descriptor);
  const chapterLabel = descriptor.chapter || "Sachunterricht";
  const pageHint = descriptor.pages.length ? `Seiten ${descriptor.pages.join(", ")}` : "";
  const sanitizedContext = ragContext?.trim();

  const systemPrompt = [
    "Du bist der Klugonaut, ein freundlicher Quizmaster für Grundschulkinder.",
    "Erstelle genau 10 Multiple-Choice-Fragen im JSON-Format.",
    '{',
    '  "questions": [',
    '    {',
    '      "q": string,',
    '      "a": string[4],',
    '      "correct": number,',
    '      "hint": string',
    '    }',
    '  ]',
    '}',
    "Nutze eine kindgerechte Sprache auf Deutsch.",
    "Jede Frage benötigt vier eindeutige Antwortmöglichkeiten und genau einen korrekten Index (0-3).",
    "Die Hinweise sollen hilfreiche Tipps zur richtigen Antwort geben.",
    "Antworte ausschließlich mit gültigem JSON ohne erläuternden Text."
  ].join("\n");

  const promptParts = [];

  if (sanitizedContext) {
    const hint = pageHint ? ` (${pageHint})` : "";
    promptParts.push(
      `Nutze ausschließlich die folgenden Unterrichtsauszüge${hint} als Wissensquelle.\n"""\n${sanitizedContext}\n"""`
    );
  } else {
    promptParts.push("Es liegt kein zusätzliches Material vor. Verwende altersgerechtes Sachwissen.");
  }

  promptParts.push(
    `Kapitel: "${chapterLabel}" – Thema: "${topicLabel}". Erstelle ein spannendes Quiz mit 10 Fragen.`
  );

  const userPrompt = promptParts.join("\n\n");

  const raw = await callGeminiJson(systemPrompt, userPrompt, { temperature: 0.55 });

  if (Array.isArray(raw)) {
    return { questions: raw };
  }

  if (Array.isArray(raw?.questions)) {
    return { questions: raw.questions };
  }

  if (Array.isArray(raw?.quiz)) {
    return { questions: raw.quiz };
  }

  return raw;
}

async function callGeminiJson(systemPrompt, userPrompt, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key fehlt");
  }

  const model = options.model || GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  logGeminiDebug("Sende Anfrage an Gemini", {
    model,
    temperature: options.temperature ?? 0.7,
    topK: options.topK ?? 40,
    topP: options.topP ?? 0.95,
    systemPromptPreview: systemPrompt.slice(0, 200),
    userPromptPreview: userPrompt.slice(0, 200)
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        topK: options.topK ?? 40,
        topP: options.topP ?? 0.95,
        responseMimeType: "application/json"
      }
    })
  });

  const payload = await response.json();

  logGeminiDebug("Antwort von Gemini erhalten", {
    status: response.status,
    ok: response.ok,
    payloadPreview: JSON.stringify(payload).slice(0, 500)
  });

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText || "Unbekannter Fehler";
    throw new Error(message);
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(part => part.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini API lieferte keinen Text");
  }

  logGeminiDebug("Gemini Textantwort", text.slice(0, 500));

  return parseGeminiJson(text);
}

function parseGeminiJson(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`JSON konnte nicht geparst werden: ${error.message}`);
  }
}

function isValidWorksheet(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.title !== "string" || typeof data.subtitle !== "string") return false;
  if (!Array.isArray(data.questions) || data.questions.length === 0) return false;
  return data.questions.every(q => typeof q === "string" && q.trim().length > 0);
}

function isValidTopicData(data) {
  if (!data || typeof data !== "object") return false;
  const requiredArrays = {
    keywords: 6,
    quiz: 1,
    riddles: 1,
    scenarios: 1,
    connections: 1,
    chains: 1
  };

  if (typeof data.chapter !== "string" || typeof data.topic !== "string") {
    return false;
  }

  for (const [key, minLength] of Object.entries(requiredArrays)) {
    if (!Array.isArray(data[key]) || data[key].length < minLength) {
      return false;
    }
  }

  return true;
}

function isValidMillionenshowQuestions(data) {
  if (!data || typeof data !== "object") {
    return false;
  }

  if (!Array.isArray(data.questions) || data.questions.length < 5) {
    return false;
  }

  return data.questions.every(entry => {
    if (!entry || typeof entry !== "object") return false;
    if (typeof entry.q !== "string" || !entry.q.trim()) return false;
    if (!Array.isArray(entry.a) || entry.a.length !== 4) return false;
    if (!entry.a.every(ans => typeof ans === "string" && ans.trim().length > 0)) return false;
    if (!Number.isInteger(entry.correct) || entry.correct < 0 || entry.correct > 3) return false;
    if (typeof entry.hint !== "string") return false;
    return true;
  });
}

function logGeminiError(scope, error) {
  console.error(`❌ Gemini Fehler bei ${scope}:`, error?.message || error);
}

function logGeminiDebug(message, details) {
  if (!DEBUG_GEMINI) {
    return;
  }

  if (details !== undefined) {
    console.log(`🐞 Gemini Debug: ${message}`, details);
    return;
  }

  console.log(`🐞 Gemini Debug: ${message}`);
}

function getTopicLabel(descriptor) {
  if (!descriptor) {
    return "Allgemeines Wissen";
  }

  if (descriptor.topic && descriptor.chapter && descriptor.topic !== descriptor.chapter) {
    return descriptor.topic;
  }

  return descriptor.topic || descriptor.fullTitle || descriptor.chapter || "Allgemeines Wissen";
}
