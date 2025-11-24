import mongoose from "mongoose";
const { Schema } = mongoose;

const InterventionSchema = new Schema({
  key: { type: String, required: true, unique: true }, // e.g., "ground-5-4-3-2-1"
  title: { type: String, required: true },
  description: { type: String },
  steps: { type: [String], default: [] },
  recommendedFor: { type: [String], default: [] }, // tags e.g. ["anxiety","panic","low-energy"]
  durationSeconds: { type: Number, default: 60 }, // approximate
  // content reference: URL or internal id for music/resource
  resources: { type: [String], default: [] }
}, {
  timestamps: true
});

export default mongoose.model("Intervention", InterventionSchema);
