import express from "express";
import axios from "axios";

const router = express.Router();

const OLLAMA_HOST = "http://127.0.0.1:11434";

// @route   POST /api/ai/analyze
// @desc    Analyze project description using Ollama
router.post("/analyze", async (req, res) => {
  const { name, description, tags } = req.body;

  if (!description) {
    return res.status(400).json({ message: "Description required" });
  }

  const prompt = `
    Tu es un expert en gestion de projet et développement logiciel.
    Analyse le projet suivant et estime son pourcentage de progression (0-100) basé sur la description, ainsi que des suggestions.
    
    Projet: ${name}
    Tags: ${tags?.join(", ")}
    Description: ${description}
    
    Réponds UNIQUEMENT au format JSON valide:
    {
      "progress": <nombre>,
      "analysis": "<courte analyse en français>",
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    }
  `;

  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: "mistral", // Ou "llama3", à configurer par le user
      prompt: prompt,
      stream: false,
      format: "json",
    });

    const aiResponse = JSON.parse(response.data.response);
    res.json(aiResponse);
  } catch (error) {
    console.error("Ollama Error:", error.message);
    // Fallback mock si Ollama n'est pas lancé
    res.json({
      progress: 0,
      analysis:
        "Impossible de contacter Ollama (vérifiez qu'il tourne sur le port 11434).",
      suggestions: ["Lancer Ollama", "Vérifier le modèle"],
    });
  }
});

// @route   POST /api/ai/chat
// @desc    Chat with local AI
router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: "mistral",
      prompt: message,
      stream: false,
    });

    res.json({ response: response.data.response });
  } catch (error) {
    res.status(500).json({ message: "Ollama offline" });
  }
});

export default router;
