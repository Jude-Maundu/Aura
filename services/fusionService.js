// services/fusionService.js

import MoodEntry from "../models/MoodEntry.js";
import ActivityEntry from "../models/ActivityEntry.js";
import FusionRecord from "../models/FusionRecord.js";

// Weighted fusion. Higher weight = stronger signal.
const SOURCE_WEIGHTS = {
  text: 3,
  music: 2,
  topic: 1,
  activity: 2,
  fusion: 2,
  system: 1
};

// Recency decay (half-life = 72 hours)
function recencyDecay(hoursAge) {
  const halfLife = 72;
  return Math.exp(-Math.log(2) * (hoursAge / halfLife));
}

/**
 * MAIN FUSION ENGINE
 * Collects: MoodEntry + ActivityEntry
 * Computes weighted + decayed mood score
 */
export async function fuse(userId, options = {}) {
  const lookback = options.lookbackEntries ?? 100;

  // fetch mood + activity
  const moodEntries = await MoodEntry.find({ userId })
    .sort({ createdAt: -1 })
    .limit(lookback);

  const activityEntries = await ActivityEntry.find({ userId })
    .sort({ createdAt: -1 })
    .limit(lookback);

  // merge into unified array
  const combined = [
    ...moodEntries.map(e => ({
      source: e.source || "text",
      score: e.score ?? 0,
      createdAt: e.createdAt
    })),
    ...activityEntries.map(e => ({
      source: "activity",
      score: e.score ?? 0,
      createdAt: e.createdAt
    }))
  ];

  const now = Date.now();
  let numerator = 0;
  let denom = 0;

  for (const e of combined) {
    const weight = SOURCE_WEIGHTS[e.source] ?? 1;
    const ageHours = Math.max(0.1, (now - new Date(e.createdAt).getTime()) / (1000 * 3600));
    const decay = recencyDecay(ageHours);

    const w = weight * decay;
    const s = typeof e.score === "number" ? e.score : 0;

    numerator += s * w;
    denom += w;
  }

  const fusionScore = denom ? numerator / denom : 0;

  const record = await FusionRecord.create({
    userId,
    fusionScore,
    entries: [...moodEntries.map(e => e._id), ...activityEntries.map(e => e._id)]
  });

  return { fusionScore, record };
}

/**
 * computeMoodDrift:
 * Statistical drift over 14-day period.
 */
export async function computeMoodDrift(userId) {
  const now = new Date();
  const oneWeekMs = 7 * 24 * 3600 * 1000;

  const recent = await MoodEntry.find({
    userId,
    createdAt: { $gte: new Date(now - oneWeekMs) }
  });

  const prev = await MoodEntry.find({
    userId,
    createdAt: {
      $gte: new Date(now - 2 * oneWeekMs),
      $lt: new Date(now - oneWeekMs)
    }
  });

  const avg = arr =>
    arr.length
      ? arr.reduce((s, a) => s + (a.score ?? 0), 0) / arr.length
      : 0;

  const stdev = arr => {
    if (!arr.length) return 0;
    const m = avg(arr);
    return Math.sqrt(
      arr.reduce((s, a) => s + Math.pow((a.score ?? 0) - m, 2), 0) / arr.length
    );
  };

  const recentAvg = avg(recent);
  const prevAvg = avg(prev);
  const drift = recentAvg - prevAvg;
  const recentStd = stdev(recent);
  const z = recentStd ? drift / recentStd : 0;

  const snapshot = await FusionRecord.create({
    userId,
    fusionScore: recentAvg,
    moodDrift: { recentAvg, prevAvg, drift, z }
  });

  return { recentAvg, prevAvg, drift, z, snapshot };
}
