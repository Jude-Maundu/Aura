// utils/aiClient.js
import { HfInference } from "@huggingface/inference";
import NodeCache from "node-cache";
import dotenv from "dotenv";
dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN || undefined);

// simple in-process cache to avoid repeated identical calls
const cacheTTL = parseInt(process.env.CACHE_TTL_SECONDS || "3600", 10);
const cache = new NodeCache({ stdTTL: cacheTTL, useClones: false });

function cacheKey(prefix, payload) {
  const p = typeof payload === "string" ? payload : JSON.stringify(payload);
  return `${prefix}:${Buffer.from(p).toString("base64").slice(0,80)}`;
}

export async function textClassification(model, text) {
  const key = cacheKey("textClass", { model, text });
  const cached = cache.get(key);
  if (cached) return cached;
  const r = await hf.textClassification({ model, inputs: text });
  cache.set(key, r);
  return r;
}

export async function zeroShot(model, text, candidate_labels) {
  const key = cacheKey("zeroShot", { model, text, candidate_labels });
  const cached = cache.get(key);
  if (cached) return cached;
  const r = await hf.zeroShotClassification({
    model,
    inputs: text,
    parameters: { candidate_labels }
  });
  cache.set(key, r);
  return r;
}

export async function embeddings(model, text) {
  const key = cacheKey("embed", { model, text });
  const cached = cache.get(key);
  if (cached) return cached;
  const r = await hf.features({
    model,
    inputs: text,
    // features returns embedding vectors for many models
  });
  cache.set(key, r);
  return r;
}

// text generation (for supportive responses)
export async function textGeneration(model, prompt, parameters = {}) {
  const key = cacheKey("gen", { model, prompt, parameters });
  const cached = cache.get(key);
  if (cached) return cached;
  const r = await hf.textGeneration({ model, inputs: prompt, parameters });
  cache.set(key, r);
  return r;
}

export default {
  textClassification,
  zeroShot,
  embeddings,
  textGeneration,
  _internalCache: cache
};
