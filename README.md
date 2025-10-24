# 🚀 Klugonaut v1.2 – Backend Ready Edition
**Ein interaktives Lernsystem für den Sachunterricht der Volksschule**

Der **Klugonaut** ist ein vollständig interaktives Lernsystem, das Kinder auf eine
spielerische Weltraummission schickt. Durch Mini-Spiele, Arbeitsblätter und dynamisch generierte Aufgaben erleben sie
Sachunterricht motivierend und modern.

## 🌍 Features
- Backend-fähige Kapitelverwaltung (/api/chapters)
- Interaktive Spiele (Millionenshow, Memory, Wer bin ich, Kettenreaktion, Was passiert wenn, Begriffe verbinden)
- 📄 Arbeitsblatt-Generator (PDF-Druck, Weltraum-Design)
- 🚀 Lernstandsanzeige (Rakete & Treibstoff)
- AI-Ready (Platzhalterrouten in config.js)

## 🗂️ Struktur
Siehe Ordnerhierarchie im Projekt.

## ⚙️ Start
```bash
npm install
npm start
```
Dann im Browser öffnen: http://localhost:5000

> 💡 **Hinweis:** Die Spiele funktionieren auch ohne laufendes Backend.
> In diesem Fall werden automatisch lokale Dummy-Themen und
> Beispiel-Arbeitsblätter angezeigt.

## 🔌 API
- GET /api/chapters?part=A|B|C
- POST /api/generateSheet  (Body: { "topic": "..." })
- POST /api/topicData      (Body: { "topic": "..." })

## 🤖 Gemini-Konfiguration
- Lege den API-Schlüssel als Umgebungsvariable `GEMINI_API_KEY` oder `GOOGLE_GEMINI_API_KEY` an.
- Optional: `GEMINI_MODEL` (Standard: `gemini-1.5-flash`).
- Wenn kein Schlüssel verfügbar ist oder die API einen Fehler liefert, nutzt der Server automatisch die lokalen Fallback-Daten.
