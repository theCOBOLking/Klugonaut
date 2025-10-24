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

## 🤖 Google-AI-Konfiguration (Gemma/Gemini)
- Kopiere `.env.example` zu `.env` und trage deinen Schlüssel bei `GEMINI_API_KEY` ein (oder nutze `GOOGLE_GEMINI_API_KEY` / `GOOGLE_API_KEY`).
- Optional: `GEMINI_MODEL` oder `GOOGLE_MODEL` (Standard: `gemma-7b-it`).
- Hinweis: Gemma-Modelle unterstützen keine separaten Entwickleranweisungen. Der Server kombiniert daher automatisch System- und Nutzerprompt.
- Optional: `DEBUG_GEMINI` oder `DEBUG_GOOGLE_MODEL` (auf `true` setzen, um ausführliche Debug-Ausgaben im Server-Log zu aktivieren).
- Wenn kein Schlüssel verfügbar ist oder die API einen Fehler liefert, nutzt der Server automatisch die lokalen Fallback-Daten.
