// services/activityService.js
/**
 * activityService.js
 * Convert passive signals to a normalized mood score (-1 .. 1)
 *
 * This file uses simple, explainable rules now. Replace or extend with ML models later.
 */

export function inferActivityMood(signalType, value) {
  let score = 0;
  let confidence = 0.6;

  try {
    switch (signalType) {
      case "app_open": {
        const n = Number(value?.countLast7Days ?? 0);
        if (n <= 1) score = -0.4;
        else if (n <= 3) score = -0.1;
        else if (n <= 10) score = 0.1;
        else score = 0.25;
        confidence = 0.5;
        break;
      }

      case "session_length": {
        const secs = Number(value?.seconds ?? 0);
        if (secs < 20) score = -0.3;
        else if (secs < 120) score = 0.0;
        else score = 0.2;
        confidence = 0.5;
        break;
      }

      case "late_usage": {
        const c = Number(value?.countLast14Days ?? 0);
        if (c >= 5) score = -0.4;
        else if (c >= 2) score = -0.15;
        else score = 0.0;
        confidence = 0.6;
        break;
      }

      case "steps": {
        const s = Number(value?.avgDaily ?? 0);
        if (s < 2000) { score = -0.5; confidence = 0.7; }
        else if (s < 5000) { score = -0.1; confidence = 0.6; }
        else { score = 0.3; confidence = 0.7; }
        break;
      }

      case "screen_time": {
        const mins = Number(value?.minutesPerDay ?? 0);
        if (mins > 600) score = -0.35;
        else if (mins > 240) score = -0.1;
        else score = 0.1;
        confidence = 0.5;
        break;
      }

      case "music_sentiment": {
        const valence = Number(value?.valence ?? 0.5);
        const energy = Number(value?.energy ?? 0.5);
        score = ((valence - 0.5) * 2) * 0.7 + ((energy - 0.5) * 2) * 0.3;
        confidence = 0.8;
        break;
      }

      default: {
        score = 0;
        confidence = 0.4;
      }
    }
  } catch (e) {
    score = 0;
    confidence = 0.4;
  }

  // clamp -1..1
  if (score > 1) score = 1;
  if (score < -1) score = -1;

  return { score, confidence, signalType, value };
}
