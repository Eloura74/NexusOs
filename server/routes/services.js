import express from "express";
import Service from "../models/Service.js";
import axios from "axios";

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
  });

  try {
    const newService = await service.save();
    res.status(201).json(newService);
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
      try {
        await axios.get(service.url, { timeout: 2000 });
        service.status = "ONLINE";
        service.responseTime = Date.now() - start;
      } catch (error) {
        service.status = "OFFLINE";
        service.responseTime = 0;
      }
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
