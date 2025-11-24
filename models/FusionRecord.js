import mongoose from "mongoose";
const { Schema } = mongoose;

const FusionRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  // the combined score -1..1
  fusionScore: { type: Number, required: true },
  // mood drift snapshot (if computed) e.g. { recentAvg, prevAvg, drift }
  moodDrift: { type: Schema.Types.Mixed },
  // reference to the contributing MoodEntry ids (can be empty for performance)
  entries: { type: [Schema.Types.ObjectId], default: [] },
  note: { type: String }
}, {
  timestamps: true
});

export default mongoose.model("FusionRecord", FusionRecordSchema);
