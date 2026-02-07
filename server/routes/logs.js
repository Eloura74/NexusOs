import express from "express";
import Log from "../models/Log.js";

const router = express.Router();

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
