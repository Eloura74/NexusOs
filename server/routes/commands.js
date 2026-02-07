import express from "express";
import Command from "../models/Command.js";

const router = express.Router();

// GET all commands
router.get("/", async (req, res) => {
  try {
    const commands = await Command.find().sort({ createdAt: -1 });
    res.json(commands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new command
router.post("/", async (req, res) => {
  const command = new Command({
    label: req.body.label,
    command: req.body.command,
    type: req.body.type,
    icon: req.body.icon,
  });

  try {
    const newCommand = await command.save();
    res.status(201).json(newCommand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE command
router.delete("/:id", async (req, res) => {
  try {
    await Command.findByIdAndDelete(req.params.id);
    res.json({ message: "Command deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
