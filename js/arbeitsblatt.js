/* ===========================================================
   K L U G O N A U T  –  A R B E I T S B L A T T   G E N E R A T O R
   =========================================================== */

import { CONFIG, apiFetch } from "./config.js";
import { playSound } from "./main.js";

export function loadArbeitsblatt() {
  gameArea.innerHTML = `
    <div id="worksheet-module">
      <h2>📄 Klugonaut – Arbeitsblatt-Generator</h2>
      <p>Wähle rechts ein Thema. Der Klugonaut erstellt daraus ein Arbeitsblatt zum Ausdrucken.</p>
      <button id="generateSheet" class="glow-btn">🪐 Arbeitsblatt erstellen</button>
      <div id="sheetPreview"></div>
    </div>
  `;

  document.getElementById("generateSheet").onclick = async () => {
    const topic = window.currentTopic || "Allgemeines Wissen";
    const preview = document.getElementById("sheetPreview");
    preview.innerHTML = `<div class="loader"></div><p>Arbeitsblatt wird erstellt...</p>`;
    playSound("tip");

    let data = await apiFetch(CONFIG.ai.worksheet, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    if (!data || !data.questions) {
      data = {
        title: `Arbeitsblatt: ${topic}`,
        subtitle: "Wissen vertiefen mit dem Klugonaut 🚀",
        questions: [
          "1️⃣ Erkläre, warum Pflanzen Wasser brauchen.",
          "2️⃣ Zeichne den Weg des Stroms vom Kraftwerk zur Steckdose.",
          "3️⃣ Ergänze: Die Sonne ist wichtig, weil sie _______.",
          "4️⃣ Beschreibe, was passiert, wenn Schnee schmilzt.",
          "5️⃣ Male dein Lieblingstier im Jahreskreis."
        ]
      };
    }

    renderWorksheetPreview(data);
  };
}

function renderWorksheetPreview(data) {
  const preview = document.getElementById("sheetPreview");
  preview.innerHTML = `
    <div class="worksheet-preview">
      <h2>${data.title}</h2>
      <h4>${data.subtitle}</h4>
      <hr/>
      <ol>${data.questions.map(q => `<li>${q}</li>`).join("")}</ol>
      <button id="pdfBtn" class="glow-btn">📘 Als PDF drucken</button>
    </div>
  `;
  document.getElementById("pdfBtn").onclick = () => downloadPDF(data);
}

function downloadPDF(data) {
  playSound("tip");
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head>
      <title>${data.title}</title>
      <style>
        @page { margin: 18mm; }
        body {
          font-family: 'Poppins', sans-serif;
          background: #fff;
          color: #222;
          line-height: 1.6;
        }
        header {
          display:flex;
          justify-content: space-between;
          align-items:center;
          margin-bottom:20px;
        }
        header h1 {
          font-size: 22px;
          color: #005a8d;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: url('assets/klugonaut.png') center/contain no-repeat;
        }
        hr { border: 1px solid #005a8d; margin: 10px 0; }
        ol { padding-left: 25px; }
        li { margin-bottom: 10px; font-size: 15px; }
        footer {
          position: fixed;
          bottom: 10mm;
          right: 0;
          font-size: 10px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="logo"></div>
        <h1>${data.title}</h1>
      </header>
      <h3>${data.subtitle}</h3>
      <hr/>
      <ol>${data.questions.map(q => `<li>${q}</li>`).join("")}</ol>
      <footer>Erstellt mit dem Klugonaut – Alpinum Labs ${new Date().getFullYear()}</footer>
    </body></html>
  `);
  win.document.close();
  win.print();
}
