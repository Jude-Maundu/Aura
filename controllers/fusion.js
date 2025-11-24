// controllers/fusion.controller.js
import { fuse, computeMoodDrift as computeDriftService } from "../services/fusionService.js";

export const computeFusion = async (req, res) => {
  try {
    const { userId } = req.body;
    const out = await fuse(userId);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const computeMoodDrift = async (req, res) => {
  try {
    const { userId } = req.body;
    const out = await computeDriftService(userId); // ✅ fixed!
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
