// models/ActivityEntry.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ActivityEntrySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  signalType: {
    type: String,
    required: true
    // examples: "app_open", "session_length", "steps", "late_usage"
  },

  value: {
    type: Schema.Types.Mixed,
    default: {}
  },

  // Normalized AI mood score between -1 .. 1
  score: {
    type: Number,
    default: null
  },

  // Confidence score from 0 .. 1
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.6
  },

  // Additional metadata (optional)
  meta: {
    type: Schema.Types.Mixed,
    default: {}
  }

}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

// Index to speed up queries
ActivityEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("ActivityEntry", ActivityEntrySchema);
