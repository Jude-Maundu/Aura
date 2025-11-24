import mongoose from "mongoose";
const { Schema } = mongoose;

const SessionLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  sessionId: { type: String, index: true }, // external conversation id
  context: { type: Schema.Types.Mixed, default: {} }, // limited context for companion
  lastInteractionAt: { type: Date },
  interactionCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model("SessionLog", SessionLogSchema);
