import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAG_DIR = __dirname;
const PAGE_CACHE = new Map();
const MAX_PAGE_ENTRIES = 10;
const MAX_CONTEXT_LENGTH = 6000;

export async function loadRagContext(pages = []) {
  if (!Array.isArray(pages) || pages.length === 0) {
    return "";
  }

  const contexts = [];

  for (const page of pages) {
    if (!Number.isFinite(page)) continue;
    const key = String(page);
    if (!PAGE_CACHE.has(key)) {
      PAGE_CACHE.set(key, readPageContext(page));
    }
    try {
      const context = await PAGE_CACHE.get(key);
      if (context) {
        contexts.push(context);
      }
    } catch (error) {
      console.warn(`⚠️ Konnte RAG-Seite ${page} nicht laden:`, error?.message || error);
    }
  }

  const combined = contexts.filter(Boolean).join("\n\n");
  return combined.length > MAX_CONTEXT_LENGTH
    ? `${combined.slice(0, MAX_CONTEXT_LENGTH)}\n…`
    : combined;
}

async function readPageContext(page) {
  const baseName = `Sachunterricht_S${page}_RAG`;
  const jsonlPath = path.join(RAG_DIR, `${baseName}.jsonl`);
  const txtPath = path.join(RAG_DIR, `${baseName}.txt`);

  const entries = await readJsonlEntries(jsonlPath);
  if (entries.length) {
    return formatEntries(page, entries);
  }

  const fallbackText = await readTextFile(txtPath);
  return fallbackText ? formatText(page, fallbackText) : "";
}

async function readJsonlEntries(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .filter(entry => typeof entry?.content === "string" && entry.content.trim().length > 0);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`⚠️ Fehler beim Lesen von ${filePath}:`, error?.message || error);
    }
    return [];
  }
}

async function readTextFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`⚠️ Fehler beim Lesen von ${filePath}:`, error?.message || error);
    }
    return "";
  }
}

function formatEntries(page, entries) {
  const limited = entries.slice(0, MAX_PAGE_ENTRIES);
  const topic = limited.find(entry => typeof entry.topic === "string")?.topic;

  const lines = limited.map(entry => {
    const title = entry.title || entry.type || "Abschnitt";
    const content = entry.content.replace(/\s+/g, " ").trim();
    return `- ${title}: ${content}`;
  });

  const header = buildHeader(page, topic);
  return [header, ...lines].join("\n");
}

function formatText(page, text) {
  const header = buildHeader(page);
  return `${header}\n${text.trim()}`;
}

function buildHeader(page, topic) {
  const topicLabel = topic ? ` – ${topic}` : "";
  return `Seite ${page}${topicLabel}`;
}
