// ===========================================================
// K L U G O N A U T   –   B A C K E N D   (Express)
// ===========================================================

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const chapters = {
  A: {
    "Ich und du": ["Freundschaft", "Zusammenhalt", "Gefühle"],
    "Da und dort": [
      "Von der Wirklichkeit zum Grundriss",
      "Von der Wirklichkeit zum Plan",
      "Die vier Himmelsrichtungen",
      "Magnetismus",
      "Kompass"
    ],
    "Immer wieder": [
      "Im Jahreskreis",
      "Blumen im Jahreskreis",
      "Ein Tier im Jahreskreis",
      "Der Schmetterling",
      "Der Frosch",
      "Ein Baum im Jahreskreis",
      "Kastanienbaum",
      "Laubbäume im Jahreskreis",
      "Thermometer"
    ],
    "Kleine und große Welt": [
      "Wo und wie wir wohnen",
      "Stadtleben und Landleben 1",
      "Stadtleben und Landleben 2",
      "Mein Wohnort",
      "Wie es bei uns früher war",
      "Wohnen im Wandel der Zeit",
      "Unsere Schule im Wandel der Zeit"
    ],
    "Gesund und munter": [
      "Was braucht ein gesunder Körper",
      "Wie bleibt man gesund",
      "Gesunde Ernährung",
      "Die Verdauung",
      "Die inneren Organe",
      "Meine Atmung",
      "Mein Herz schlägt"
    ],
    "Warum und wieso": [
      "Der schmelzende Schneemann",
      "Hält Kleidung warm?",
      "Wie löst sich Zucker auf?",
      "Warum schwimmt ein Schiff?",
      "Strom in unserem Leben",
      "Strom ist nützlich aber auch gefährlich",
      "Wir bringen das Lämpchen zum Leuchten"
    ],
    "Leben und helfen": [
      "Was ist hier passiert?",
      "Berufe, in denen Menschen helfen",
      "Die Feuerwehr",
      "Die Polizei",
      "Die Rettung",
      "Unfälle in der Schule und dem Schulweg vermeiden",
      "Erste Hilfe in der Klasse"
    ]
  },
  B: {
    "Natur und Umwelt": [
      "Klimazonen",
      "Tierwanderungen",
      "Lebenszyklen",
      "Umweltschutz",
      "Erneuerbare Energien"
    ],
    "Gesundheit": ["Immunsystem", "Blutkreislauf", "Nährstoffe"],
    "Technik und Strom": ["Stromkreise", "Magnete", "Erfindungen"]
  },
  C: {
    "Steiermark": [
      "Politik",
      "Bezirke",
      "Flüsse",
      "Berge",
      "Pässe",
      "Wirtschaft",
      "Tourismus"
    ],
    "Salzburg": [
      "Politik",
      "Bezirke",
      "Flüsse",
      "Berge",
      "Pässe",
      "Wirtschaft",
      "Tourismus"
    ],
    "Wien": [
      "Politik",
      "Bezirke",
      "Wirtschaft",
      "Tourismus",
      "Bedeutende Gebäude"
    ]
  }
};

app.get("/api/chapters", (req, res) => {
  const part = req.query.part || "A";
  res.json(chapters[part] || {});
});

app.post("/api/generateSheet", (req, res) => {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      const topic = parsed.topic || "Allgemeines Wissen";
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
    } catch(e) {
      res.status(400).json({error:"Bad JSON"});
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Klugonaut Backend läuft auf http://localhost:${PORT}`);
  console.log("🌐 API-Endpunkte:");
  console.log("   → GET  /api/chapters?part=A|B|C");
  console.log("   → POST /api/generateSheet");
});
