import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  serverName: { type: String, default: "NexusOS-Core" },
  dashboardUrl: { type: String, default: "http://localhost:3000" },
  theme: { type: String, default: "dark" },
  language: { type: String, default: "fr" },
  lastUpdated: { type: Date, default: Date.now },
});

// Singleton pattern: We really only want one settings document
export default mongoose.model("Settings", SettingsSchema);
