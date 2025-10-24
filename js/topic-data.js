import { CONFIG, apiFetch } from "./config.js";
import { generateTopicData } from "../data/topicGenerator.js";

const cache = new Map();

export async function getTopicData(rawTopic = "Allgemeines Wissen") {
  const topic = rawTopic || "Allgemeines Wissen";
  if (cache.has(topic)) {
    return cache.get(topic);
  }

  let data = await apiFetch(CONFIG.ai.topicData, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic })
  });

  if (!isValidData(data)) {
    data = generateTopicData(topic);
  }

  cache.set(topic, data);
  return data;
}

function isValidData(data) {
  if (!data) return false;
  const requiredArrays = ["keywords", "quiz", "riddles", "scenarios", "connections", "chains"];
  return requiredArrays.every(key => Array.isArray(data[key]) && data[key].length > 0);
}
