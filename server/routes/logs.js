import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Schema definition (can be moved to models/Log.js)
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

const Log = mongoose.model("Log", LogSchema);

// @route   GET /api/logs
// @desc    Get recent logs
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/logs
// @desc    Add a new log entry
router.post("/", async (req, res) => {
  try {
    const newLog = new Log({
      level: req.body.level,
      message: req.body.message,
      source: req.body.source,
      timestamp: req.body.timestamp || Date.now(),
    });
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
