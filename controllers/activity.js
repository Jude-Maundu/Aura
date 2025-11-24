// controllers/activity.controller.js
import ActivityEntry from "../models/ActivityEntry.js";
import User from "../models/User.js";
import { inferActivityMood } from "../services/activityService.js";

export const ingestActivity = async (req, res) => {
  try {
    const { userId, signalType, value, meta } = req.body;
    if (!userId || !signalType) return res.status(400).json({ error: "userId and signalType required" });

    // Check user consent before accepting passive signals
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Respect explicit opt-in - use settings.privacyConsent or settings.activityMonitoringEnabled
    const allowed = user?.settings?.privacyConsent || user?.settings?.activityMonitoringEnabled;
    if (!allowed) {
      return res.status(403).json({
        error: "User has not enabled passive activity monitoring. Require explicit opt-in."
      });
    }

    // Infer mood from activity signal
    const inference = inferActivityMood(signalType, value);

    // Persist ActivityEntry
    const entry = await ActivityEntry.create({
      userId,
      signalType,
      value,
      score: inference.score,
      confidence: inference.confidence,
      meta: meta ?? {}
    });

    res.json({ success: true, inference, entry });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
