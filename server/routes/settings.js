import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// @route   GET /api/settings
// @desc    Get current system settings (creates default if none)
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/settings
// @desc    Update system settings
router.post("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (req.body.serverName) settings.serverName = req.body.serverName;
    if (req.body.dashboardUrl) settings.dashboardUrl = req.body.dashboardUrl;
    if (req.body.theme) settings.theme = req.body.theme;
    if (req.body.language) settings.language = req.body.language;

    settings.lastUpdated = Date.now();

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
