// services/supportService.js
import ai from "../utils/aiClient.js";
import MoodEntry from "../models/MoodEntry.js";

/**
 * generateSupportResponse(userId, prompt)
 * - builds a short context from the last 6 MoodEntries (text summaries)
 * - calls a HF instruction-tuned model (flan-t5-large or mosaicml models)
 */
export async function generateSupportResponse(userId, prompt) {
  // fetch last few entries to provide context
  const lastEntries = await MoodEntry.find({ userId }).sort({ createdAt: -1 }).limit(6);
  const contextLines = lastEntries.map(e => {
    if (e.source === "text") return `User said: "${(e.raw?.text || "").slice(0,200)}"`;
    if (e.source === "music") return `Listened to: ${JSON.stringify(e.raw).slice(0,200)}`;
    return `${e.source}: ${JSON.stringify(e.raw).slice(0,200)}`;
  }).join("\n");

  // safety rules: limit suicidal instructions, encourage seeking help
  const systemPrompt =
`You are a compassionate emotional support assistant. Follow these rules:
- Provide empathetic, non-judgmental responses.
- Do NOT provide medical or diagnostic advice.
- If user expresses self-harm or suicidal intent, encourage contacting emergency services and trusted contacts.
- Offer grounding exercises, breathing techniques, or small next steps.
`;

  const userPrompt = `Context:\n${contextLines}\n\nUser: ${prompt}\n\nRespond compassionately, suggest one short micro-intervention, and one small action the user can take right now.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const res = await ai.textGeneration("google/flan-t5-large", fullPrompt, {
    max_new_tokens: 120,
    temperature: 0.7
  });

  // many HF generation outputs have generated_text or similar
  const text = res?.generated_text ?? res?.[0]?.generated_text ?? res?.text ?? JSON.stringify(res);
  return { text, raw: res };
}
