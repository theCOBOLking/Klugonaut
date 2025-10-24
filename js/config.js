/* ===========================================================
   K L U G O N A U T  –  C O N F I G
   =========================================================== */

function detectApiBase() {
  if (typeof window === "undefined") return "http://localhost:5000/api";
  if (window.location.protocol.startsWith("http")) {
    const origin = window.location.origin.replace(/\/$/, "");
    return `${origin}/api`;
  }
  return "http://localhost:5000/api";
}

export const CONFIG = {
  apiBase: detectApiBase(),
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
