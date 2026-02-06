import express from "express";
import axios from "axios";

const router = express.Router();

// @route   GET /api/github/repos
// @desc    Get user repositories from GitHub
router.get("/repos", async (req, res) => {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("❌ GITHUB_TOKEN missing in .env");
    return res.status(500).json({ message: "GITHUB_TOKEN missing in .env" });
  }
  console.log("🔄 Fetching GitHub repos...");

  try {
    // Fetch repos (limit 100, sorted by push)
    const response = await axios.get(
      "https://api.github.com/user/repos?sort=pushed&per_page=100&direction=desc",
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updated_at: repo.updated_at,
      private: repo.private,
    }));

    res.json(repos);
  } catch (error) {
    console.error("GitHub API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch GitHub repositories" });
  }
});

export default router;
