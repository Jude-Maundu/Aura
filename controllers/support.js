// controllers/support.controller.js
import { generateSupportResponse } from "../services/supportService.js";

// =========================
// 1) AI SUPPORT RESPONSE
// =========================
export const respond = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const out = await generateSupportResponse(userId, prompt);

    res.json({
      response: out.text,
      raw: out.raw
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =========================
// 2) MICRO-INTERVENTIONS
// =========================
export const getInterventions = async (req, res) => {
  try {
    const interventions = [
      {
        key: "ground_54321",
        title: "5-4-3-2-1 Grounding Technique",
        steps: [
          "Name 5 things you can see",
          "Name 4 things you can touch",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste"
        ]
      },
      {
        key: "box_breathing",
        title: "Box Breathing",
        steps: [
          "Inhale for 4 seconds",
          "Hold for 4 seconds",
          "Exhale for 4 seconds",
          "Hold for 4 seconds"
        ]
      },
      {
        key: "journaling",
        title: "Quick Journaling Prompt",
        steps: [
          "Describe how you're feeling in one sentence",
          "Write one thing stressing you today",
          "Write one thing you can control right now"
        ]
      }
    ];

    res.json(interventions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
