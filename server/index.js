import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import systemRoutes from "./routes/system.js";
import projectRoutes from "./routes/projects.js";
import serviceRoutes from "./routes/services.js";
import githubRoutes from "./routes/github.js";
import aiRoutes from "./routes/ai.js";
import logsRoutes from "./routes/logs.js";
import docsRoutes from "./routes/docs.js";

// ... imports

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexusos";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Atlas/Local)"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.log("⚠️ Running in disconnected mode (DB features will fail)");
  });

// Use Routes
app.use("/api/system", systemRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/docs", docsRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server NexusOS running on port ${PORT}`);
  console.log(`📡 System API: http://localhost:${PORT}/api/system`);
  console.log(`📂 Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`🔌 Services API: http://localhost:${PORT}/api/services`);
});
