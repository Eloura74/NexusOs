import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Schema
const DocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Markdown content
  category: { type: String, default: "General" },
  tags: [String],
  updatedAt: { type: Date, default: Date.now },
});

const Doc = mongoose.model("Doc", DocSchema);

// GET /api/docs - List all docs
router.get("/", async (req, res) => {
  try {
    const docs = await Doc.find().sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/docs/:id - Get single doc
router.get("/:id", async (req, res) => {
  try {
    const doc = await Doc.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/docs - Create new doc
router.post("/", async (req, res) => {
  try {
    const newDoc = new Doc(req.body);
    const savedDoc = await newDoc.save();
    res.status(201).json(savedDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/docs/:id - Update doc
router.put("/:id", async (req, res) => {
  try {
    const updatedDoc = await Doc.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true },
    );
    res.json(updatedDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/docs/:id - Delete doc
router.delete("/:id", async (req, res) => {
  try {
    await Doc.findByIdAndDelete(req.params.id);
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
