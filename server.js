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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/chapters", (req, res) => {
  const part = req.query.part || "A";
  res.json(CHAPTERS[part] || {});
});

app.post("/api/generateSheet", async (req, res) => {
  const topic = req.body?.topic || "Allgemeines Wissen";

  try {
    const sheet = await generateWorksheetWithGemini(topic);
    if (isValidWorksheet(sheet)) {
      res.json(sheet);
      return;
    }
    throw new Error("Ungültige Antwort der Gemini API");
  } catch (error) {
    logGeminiError("/api/generateSheet", error);
    res.json(buildFallbackWorksheet(topic));
  }
});

app.post("/api/topicData", async (req, res) => {
  const topic = req.body?.topic || "Allgemeines Wissen";

  try {
    const data = await generateTopicDataWithGemini(topic);
    if (isValidTopicData(data)) {
      res.json(data);
      return;
    }
    throw new Error("Ungültige Antwort der Gemini API");
  } catch (error) {
    logGeminiError("/api/topicData", error);
    res.json(generateTopicData(topic));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Klugonaut Backend läuft auf http://localhost:${PORT}`);
  console.log("🌐 API-Endpunkte:");
  console.log("   → GET  /api/chapters?part=A|B|C");
  console.log("   → POST /api/generateSheet");
  console.log("   → POST /api/topicData");
});

function buildFallbackWorksheet(topic) {
  return {
    title: `Arbeitsblatt: ${topic}`,
    subtitle: "Wissen vertiefen mit dem Klugonaut 🚀",
    questions: [
      `1️⃣ Erkläre das Thema "${topic}" in eigenen Worten.`,
      "2️⃣ Zeichne oder beschreibe etwas, das dazu passt.",
      "3️⃣ Ergänze: Das Wichtigste daran ist _______.",
      "4️⃣ Was passiert, wenn du dieses Wissen anwendest?",
      "5️⃣ Fasse in einem Satz zusammen, warum dieses Thema wichtig ist."
    ]
  };
}

async function generateWorksheetWithGemini(topic) {
  const systemPrompt = [
    "Du bist der Klugonaut, ein lernfreundlicher Assistent für Kinder.",
    "Erstelle ein strukturiertes Arbeitsblatt als JSON.",
    "Das JSON muss folgende Struktur besitzen:",
    '{"title": string, "subtitle": string, "questions": string[5], "tips"?: string[] }',
    "Nutze eine motivierende, leicht verständliche Sprache auf Deutsch.",
    "Alle Fragen sollen auf das Thema eingehen und aktiv zum Nachdenken anregen.",
    "Antworte ausschließlich mit gültigem JSON ohne zusätzliche Erklärungen."
  ].join("\n");

  const userPrompt = `Thema: ${topic}. Erstelle ein vollständiges Arbeitsblatt.`;

  return await callGeminiJson(systemPrompt, userPrompt, { temperature: 0.65 });
}

async function generateTopicDataWithGemini(topic) {
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

  const userPrompt = `Erstelle Lernmaterialien zum Thema: ${topic}.`;

  return await callGeminiJson(systemPrompt, userPrompt, { temperature: 0.6 });
}

async function callGeminiJson(systemPrompt, userPrompt, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key fehlt");
  }

  const model = options.model || GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

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

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText || "Unbekannter Fehler";
    throw new Error(message);
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(part => part.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini API lieferte keinen Text");
  }

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

function logGeminiError(scope, error) {
  console.error(`❌ Gemini Fehler bei ${scope}:`, error?.message || error);
}
