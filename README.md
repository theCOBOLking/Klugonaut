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
npm init -y
npm install express cors
node server.js
```
Dann im Browser öffnen: http://localhost:5000

## 🔌 API
- GET /api/chapters?part=A|B|C
- POST /api/generateSheet  (Body: { "topic": "..." })
