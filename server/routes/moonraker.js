import express from "express";
import axios from "axios";
import Service from "../models/Service.js";

const router = express.Router();

// @route   GET /api/moonraker/:id/status
// @desc    Get Klipper status (Printer Info, Temp, Job)
router.get("/:id/status", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.type !== "KLIPPER") {
      return res
        .status(400)
        .json({ message: "Service is not a Klipper instance" });
    }

    const { url, apiKey } = service;
    // Ensure URL doesn't end with slash for cleaner concatenation
    const baseUrl = url.replace(/\/$/, "");

    const headers = {};
    if (apiKey) {
      headers["X-Api-Key"] = apiKey;
    }

    // Parallel fetch for speed
    // 1. /printer/objects/query?heater_bed&extruder&print_stats&toolhead
    // 2. /server/info (optional, for version/load)

    // We use the "objects/query" endpoint which is the standard way to get status in Moonraker
    const query =
      "printer.objects.query?heater_bed&extruder&print_stats&display_status";

    // Ensure URL doesn't end with slash for cleaner concatenation
    // const baseUrl = service.url.replace(/\/$/, ""); // Already declared above

    const response = await axios.get(
      `${baseUrl}/printer/objects/query?print_stats&extruder&heater_bed&display_status`,
      {
        headers: service.apiKey ? { "X-Api-Key": service.apiKey } : {},
        timeout: 2000, // Short timeout to avoid hanging
      },
    );

    // Check if Moonraker returned a valid result
    if (
      !response.data ||
      !response.data.result ||
      !response.data.result.status
    ) {
      throw new Error("Invalid response from Moonraker");
    }

    const data = response.data.result.status;

    // Transform data for lightweight frontend consumption
    const status = {
      print_stats: data.print_stats || { state: "standby" },
      extruder: {
        temperature: data.extruder?.temperature || 0,
        target: data.extruder?.target || 0,
      },
      heater_bed: {
        temperature: data.heater_bed?.temperature || 0,
        target: data.heater_bed?.target || 0,
      },
      progress: data.display_status?.progress || 0,
    };

    res.json(status);
  } catch (err) {
    console.error(`Moonraker Proxy Error (${req.params.id}):`, err.message);
    // Return a "neutral" error so frontend just shows "Offline" or similar without crashing
    res
      .status(502)
      .json({ message: "Failed to contact Printer", error: err.message });
  }
});

export default router;
