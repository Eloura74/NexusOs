import mongoose from "mongoose";

const commandSchema = new mongoose.Schema({
  label: { type: String, required: true },
  command: { type: String, required: true },
  type: {
    type: String,
    enum: ["dashboard", "terminal"],
    default: "dashboard",
  },
  icon: { type: String, default: "Terminal" }, // Lucide icon name
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Command", commandSchema);
