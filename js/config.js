/* ===========================================================
   K L U G O N A U T  –  C O N F I G
   =========================================================== */

export const CONFIG = {
  apiBase: "http://localhost:5000/api",
  debug: true,
  ai: {
    worksheet: "/generateSheet",
    questions: "/generateQuestions",
    hints: "/generateHints"
  },
  ui: {
    rocketSpeed: 1000,
    theme: "dark"
  }
};

export async function apiFetch(endpoint, params = {}) {
  try {
    const res = await fetch(`${CONFIG.apiBase}${endpoint}`, params);
    if (!res.ok) throw new Error(`Serverfehler (${res.status})`);
    return await res.json();
  } catch (err) {
    if (CONFIG.debug) console.error("API-Fehler:", err);
    return null;
  }
}
