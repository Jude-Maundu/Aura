// routes/routes.js
import { Router } from "express";

// --- Controllers ---
import {
  analyzeText,
  analyzeMusic,
  analyzeTopics
} from "../controllers/analyze.js";

import {
  computeFusion,
  computeMoodDrift
} from "../controllers/fusion.js";

import {
  respond,
  getInterventions
} from "../controllers/support.js";

import {
  escalate
} from "../controllers/escalation.js";

import {
  ingestActivity
} from "../controllers/analyzeActivity.js"; // <-- THIS IS CORRECT (matches your folder)

const router = Router();


// ======================
//   ANALYSIS ROUTES
// ======================
router.post("/analyze/text", analyzeText);
router.post("/analyze/music", analyzeMusic);
router.post("/analyze/topics", analyzeTopics);


// ======================
//   FUSION + DRIFT ROUTES
// ======================
router.post("/fusion/score", computeFusion);
router.post("/mood-drift", computeMoodDrift);


// ======================
//   SUPPORT SYSTEM
// ======================
router.post("/ai-support/respond", respond);
router.get("/interventions/get", getInterventions);


// ======================
//   ESCALATION ROUTE
// ======================
router.post("/escalate", escalate);


// ======================
//   PASSIVE ACTIVITY SYSTEM
// ======================
router.post("/activity/ingest", ingestActivity);


export default router;
