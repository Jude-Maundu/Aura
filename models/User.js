import mongoose from "mongoose";

const { Schema } = mongoose;

const PersonalitySchema = new Schema({
  style: { type: String, enum: ["balanced","empathetic","concise","encouraging"], default: "balanced" },
  traits: { type: [String], default: [] }, // e.g. ["introvert","reflective"]
  lastUpdated: Date
}, { _id: false });

const SettingsSchema = new Schema({
  notifyEscalation: { type: Boolean, default: false },
  escalationThreshold: { type: Number, default: 0.6 }, // threshold on MDI or fusion score decline
  privacyConsent: { type: Boolean, default: false }, // user has consented to data use
}, { _id: false });

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String }, // optional if using social login
  displayName: { type: String },
  phone: { type: String },
  // basic profile metadata
  dob: { type: Date },
  gender: { type: String },
  // personality & settings
  personality: { type: PersonalitySchema, default: () => ({}) },
  settings: { type: SettingsSchema, default: () => ({}) },
  // lightweight baseline mood (optional): used to compute MDI baseline quickly
  baselineMoodScore: { type: Number, default: 0 }, // normalized -1..1
}, {
  timestamps: true
});

export default mongoose.model("User", UserSchema);
