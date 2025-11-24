import mongoose from "mongoose";
const { Schema } = mongoose;

const TrustedContactSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  relation: { type: String },
  phone: { type: String },
  email: { type: String },
  preferredChannel: { type: String, enum: ["sms","email","both"], default: "sms" },
  // opt-in (user must have explicitly allowed escalation to this contact)
  optedIn: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model("TrustedContact", TrustedContactSchema);
