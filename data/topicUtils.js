export function parseTopicDescriptor(rawTopic = "Allgemeines Wissen") {
  const defaultChapter = "Sachunterricht";

  if (!rawTopic || typeof rawTopic !== "string") {
    return {
      raw: rawTopic ?? "",
      chapter: defaultChapter,
      topic: "Allgemeines Wissen",
      pages: [],
      fullTitle: `${defaultChapter} – Allgemeines Wissen`
    };
  }

  const parts = rawTopic
    .split("–")
    .map(part => part.trim())
    .filter(Boolean);

  const chapter = parts.shift() || defaultChapter;
  if (!parts.length) {
    return {
      raw: rawTopic,
      chapter,
      topic: chapter,
      pages: [],
      fullTitle: chapter
    };
  }

  const pages = [];
  const lastPart = parts[parts.length - 1];
  if (/^\d+$/.test(lastPart)) {
    pages.push(Number(lastPart));
    parts.pop();
  }

  const topic = parts.length ? parts.join(" – ") : chapter;
  const fullTitle = [chapter, parts.length ? topic : null].filter(Boolean).join(" – ") || chapter;

  return {
    raw: rawTopic,
    chapter,
    topic,
    pages,
    fullTitle
  };
}
