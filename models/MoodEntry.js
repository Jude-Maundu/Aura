import mongoose from "mongoose";
const { Schema } = mongoose;

const MoodEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  source: { type: String, enum: ["text","music","topic","fusion","system"], required: true },
  // raw contains model outputs or original payload (text, track metadata, topics etc.)
  raw: { type: Schema.Types.Mixed, default: {} },
  // normalized score: use -1.0 (very negative) .. 0 .. +1.0 (very positive)
  score: { type: Number, default: null },
  // optional subtype for more context (e.g., "sentiment", "valence", "topic-classification")
  subtype: { type: String },
  // confidence of the inference 0..1 when available
  confidence: { type: Number, min: 0, max: 1 },
  // meta flags: e.g. whether saved with consent, ephemeral, or derived
  flags: {
    consentGiven: { type: Boolean, default: true },
    derived: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

MoodEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("MoodEntry", MoodEntrySchema);
