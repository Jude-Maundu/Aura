// controllers/escalation.controller.js
import TrustedContact from "../models/TrustedContact.js";
import User from "../models/User.js";

/**
 * Trigger escalation: notify trusted contacts (MVP simulated)
 */
export const escalate = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Get user's trusted contacts
    const contacts = await TrustedContact.find({
      userId,
      optedIn: true
    });

    if (contacts.length === 0) {
      return res.json({
        success: true,
        notified: [],
        note: "No trusted contacts opted-in."
      });
    }

    // In MVP: we do NOT send real SMS/email.
    // We simply return the contacts that WOULD be notified.
    const preview = contacts.map(c => ({
      name: c.name,
      phone: c.phone,
      email: c.email,
      channel: c.preferredChannel
    }));

    return res.json({
      success: true,
      message: "Escalation triggered successfully.",
      notified: preview,
      simulatedMessage: message || "User may need emotional support."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
