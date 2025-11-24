// services/nlpService.js
import ai from "../utils/aiClient.js";

/**
 * analyzeText: returns { label, score, emotions?, embedding }
 * Uses: distilbert sentiment for label+score, and embeddings for semantic similarity
 */
export async function analyzeText(text) {
  // sentiment
  const sentimentRes = await ai.textClassification(
    "distilbert-base-uncased-finetuned-sst-2-english",
    text
  );
  // embeddings: use sentence-transformers on HF; "sentence-transformers/all-MiniLM-L6-v2"
  const embedRes = await ai.embeddings("sentence-transformers/all-MiniLM-L6-v2", text);

  // structure a normalized score (-1..1)
  const top = sentimentRes?.[0];
  let score = 0;
  if (top) {
    // HF returns POSITIVE/NEGATIVE with score 0..1
    score = top.label === "POSITIVE" ? top.score : -top.score;
  }

  return {
    provider: "hf",
    label: top?.label ?? "NEUTRAL",
    score,
    confidence: top?.score ?? 0,
    embedding: embedRes?.[0]?.embedding ?? embedRes, // adapt to response shape
    raw: { sentimentRes, embedRes }
  };
}

export async function classifyTopics(text, candidates) {
  const res = await ai.zeroShot("facebook/bart-large-mnli", text, candidates);
  return {
    label: res.labels?.[0],
    confidence: res.scores?.[0],
    raw: res
  };
}
