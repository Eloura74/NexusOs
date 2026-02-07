import express from "express";
import Service from "../models/Service.js";
import axios from "axios";

import Log from "../models/Log.js";

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/services
// @desc    Add a new service
router.post("/", async (req, res) => {
  const service = new Service({
    name: req.body.name,
    type: req.body.type,
    url: req.body.url,
    icon: req.body.icon,
    description: req.body.description,
    tags: req.body.tags,
  });

  try {
    const newService = await service.save();
    // Log creation
    await new Log({
      level: "SUCCESS",
      message: `Service ajouté : ${newService.name}`,
      source: "SYSTEM",
    }).save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    service.name = req.body.name || service.name;
    service.type = req.body.type || service.type;
    service.url = req.body.url || service.url;
    service.icon = req.body.icon || service.icon;
    service.description = req.body.description || service.description;
    service.tags = req.body.tags || service.tags;

    if (req.body.apiKey) service.apiKey = req.body.apiKey; // Allow updating API Key

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   POST /api/services/scan
// @desc    Ping all services to update status
router.post("/scan", async (req, res) => {
  try {
    const services = await Service.find();

    const updates = services.map(async (service) => {
      const start = Date.now();
      const oldStatus = service.status;
      let newStatus = "UNKNOWN";

      try {
        await axios.get(service.url, { timeout: 2000 });
        newStatus = "ONLINE";
        service.responseTime = Date.now() - start;
      } catch (error) {
        newStatus = "OFFLINE";
        service.responseTime = 0;
      }

      // Log only if status changed
      if (oldStatus !== newStatus && oldStatus !== "UNKNOWN") {
        const uniqueLogId = `${service.name}-${newStatus}-${Date.now()}`; // Dedup simplistic
        await new Log({
          level: newStatus === "ONLINE" ? "SUCCESS" : "ERROR",
          message: `Service ${service.name} est maintenant ${newStatus}`,
          source: "MONITOR",
        }).save();
      }

      service.status = newStatus;
      service.lastCheck = Date.now();
      return service.save();
    });

    await Promise.all(updates);
    const updatedServices = await Service.find().sort({ name: 1 });
    res.json(updatedServices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/services/:id
router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    await service.deleteOne();
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
