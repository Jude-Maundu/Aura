// controllers/analyzeActivity.js

import ActivityEntry from "../models/ActivityEntry.js";
import { inferActivityMood } from "../services/activityService.js";

export const ingestActivity = async (req, res) => {
  try {
    const { userId, signalType, value } = req.body;

    if (!userId || !signalType) {
      return res.status(400).json({ error: "userId and signalType are required" });
    }

    // Convert activity into mood score
    const result = inferActivityMood(signalType, value);

    // Save to DB
    const entry = await ActivityEntry.create({
      userId,
      signalType,
      value,
      score: result.score,
      confidence: result.confidence,
      meta: { processed: true }
    });

    return res.json({
      message: "Activity ingested successfully",
      result,
      entry
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
