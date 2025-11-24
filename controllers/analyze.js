// controllers/analyze.controller.js
import mongoose from "mongoose";
import { analyzeText as nlpAnalyze, classifyTopics } from "../services/nlpService.js";
import { inferFromTrackMeta, inferFromSpotifyTrack } from "../services/musicService.js";
import MoodEntry from "../models/MoodEntry.js";
import { inferActivityMood } from "../services/activityService.js";
import ActivityEntry from "../models/ActivityEntry.js";

// Validate mongo ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


// ------------------------------
// TEXT EMOTION ANALYSIS
// ------------------------------
export const analyzeText = async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });
    if (!isValidObjectId(userId)) return res.status(400).json({ error: "Invalid userId" });

    const result = await nlpAnalyze(text);

    const entry = await MoodEntry.create({
      userId,
      source: "text",
      raw: { text, result },
      score: result.score,
      confidence: result.confidence,
    });

    res.json({ label: result.label, score: result.score, result, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ------------------------------
// MUSIC EMOTION ANALYSIS
// ------------------------------
export const analyzeMusic = async (req, res) => {
  try {
    const { userId, trackMeta, spotifyTrackId } = req.body;

    if (!isValidObjectId(userId)) return res.status(400).json({ error: "Invalid userId" });

    let result;
    if (spotifyTrackId) {
      result = await inferFromSpotifyTrack(spotifyTrackId);
    } else {
      result = inferFromTrackMeta(trackMeta);
    }

    const entry = await MoodEntry.create({
      userId,
      source: "music",
      raw: { trackMeta, spotifyTrackId, result },
      score: result.score,
      confidence: result.features ? 0.9 : 0.5,
    });

    res.json({ result, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ------------------------------
// TOPIC CLASSIFICATION
// ------------------------------
export const analyzeTopics = async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!isValidObjectId(userId)) return res.status(400).json({ error: "Invalid userId" });

    const topics = [
      "stress",
      "anxiety",
      "depression",
      "academic pressure",
      "relationship",
      "work",
      "health",
      "motivation",
    ];

    const result = await classifyTopics(text, topics);

    const entry = await MoodEntry.create({
      userId,
      source: "topic",
      raw: { text, topic: result },
      score: 0, // topic classification doesn’t produce mood score
      confidence: result.confidence,
    });

    res.json({ topic: result, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ------------------------------
// OPTIONAL: PASSIVE ACTIVITY ANALYSIS
// ------------------------------
export const analyzeActivity = async (req, res) => {
  try {
    const { userId, signalType, value } = req.body;

    if (!isValidObjectId(userId)) return res.status(400).json({ error: "Invalid userId" });
    if (!signalType) return res.status(400).json({ error: "signalType required" });

    const inference = inferActivityMood(signalType, value);

    const entry = await ActivityEntry.create({
      userId,
      signalType,
      value,
      score: inference.score,
      confidence: inference.confidence,
    });

    res.json({ inference, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
