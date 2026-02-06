import express from "express";
import Project from "../models/Project.js"; // Notez le .js obligatoire en ESM

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ lastUpdate: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
router.post("/", async (req, res) => {
  const project = new Project({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status,
    progress: req.body.progress,
    tags: req.body.tags,
    repoUrl: req.body.repoUrl,
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PATCH /api/projects/:id
// @desc    Update a project
router.patch("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (req.body.name != null) project.name = req.body.name;
    if (req.body.description != null)
      project.description = req.body.description;
    if (req.body.status != null) project.status = req.body.status;
    if (req.body.progress != null) project.progress = req.body.progress;
    if (req.body.tags != null) project.tags = req.body.tags;

    // Update timestamp
    project.lastUpdate = Date.now();

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await project.deleteOne();
    res.json({ message: "Deleted Project" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
