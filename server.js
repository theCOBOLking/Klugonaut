// ===========================================================
// K L U G O N A U T   –   B A C K E N D   (Express)
// ===========================================================

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { CHAPTERS } from "./data/chapters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/chapters", (req, res) => {
  const part = req.query.part || "A";
  res.json(CHAPTERS[part] || {});
});

app.post("/api/generateSheet", (req, res) => {
  const topic = req.body?.topic || "Allgemeines Wissen";
  const sheet = {
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
  res.json(sheet);
});

app.listen(PORT, () => {
  console.log(`🚀 Klugonaut Backend läuft auf http://localhost:${PORT}`);
  console.log("🌐 API-Endpunkte:");
  console.log("   → GET  /api/chapters?part=A|B|C");
  console.log("   → POST /api/generateSheet");
});
