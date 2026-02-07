import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: {
    type: String,
    enum: ["INFO", "SUCCESS", "WARN", "ERROR"],
    required: true,
  },
  message: { type: String, required: true },
  source: { type: String, required: true },
});

export default mongoose.model("Log", LogSchema);
