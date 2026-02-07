import express from "express";
import axios from "axios";
import Project from "../models/Project.js";

const router = express.Router();

// @route   POST /api/github/sync
// @desc    Sync user repositories from GitHub to MongoDB
router.post("/sync", async (req, res) => {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("❌ GITHUB_TOKEN missing in .env");
    return res.status(500).json({ message: "GITHUB_TOKEN missing in .env" });
  }

  console.log("🔄 Starting GitHub Sync...");

  try {
    // 1. Fetch all repos from GitHub (Page 1, 100 items - MVP)
    const response = await axios.get(
      "https://api.github.com/user/repos?sort=pushed&per_page=100&direction=desc&type=all",
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    const repos = response.data;
    const stats = { added: 0, updated: 0, errors: 0 };

    // 2. Process each repo
    await Promise.all(
      repos.map(async (repo) => {
        try {
          // Check if project exists by githubUrl or Name
          let project = await Project.findOne({
            $or: [{ repoUrl: repo.html_url }, { name: repo.name }],
          });

          if (project) {
            // UPDATE existing project
            let needsUpdate = false;

            if (project.description !== repo.description) {
              project.description = repo.description || "";
              needsUpdate = true;
            }
            if (project.repoUrl !== repo.html_url) {
              project.repoUrl = repo.html_url;
              needsUpdate = true;
            }
            if (project.stars !== repo.stargazers_count) {
              project.stars = repo.stargazers_count;
              needsUpdate = true;
            }
            if (project.forks !== repo.forks_count) {
              project.forks = repo.forks_count;
              needsUpdate = true;
            }
            if (project.language !== repo.language) {
              project.language = repo.language;
              needsUpdate = true;
            }

            if (needsUpdate) {
              project.lastUpdate = new Date();
              await project.save();
              stats.updated++;
            }
          } else {
            // CREATE new project from Repo
            const newProject = new Project({
              name: repo.name,
              description: repo.description || "Importé depuis GitHub",
              status: "PLANNING",
              progress: 0,
              tags: [repo.language || "Code"],
              repoUrl: repo.html_url,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              language: repo.language,
              lastUpdate: new Date(),
            });

            await newProject.save();
            stats.added++;
          }
        } catch (err) {
          console.error(`Error syncing repo ${repo.name}:`, err);
          stats.errors++;
        }
      }),
    );

    console.log(
      `✅ GitHub Sync Complete: Added ${stats.added}, Updated ${stats.updated}`,
    );
    res.json({
      message: "Sync Completed",
      stats,
      totalRepos: repos.length,
    });
  } catch (error) {
    console.error("GitHub API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch GitHub repositories" });
  }
});

// @route   GET /api/github/content/:owner/:repo
// @desc    Get Readme and Commits for a specific repo
router.get("/content/:owner/:repo", async (req, res) => {
  const { owner, repo } = req.params;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(500).json({ message: "GITHUB_TOKEN missing" });
  }

  try {
    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const [readmeRes, commitsRes] = await Promise.allSettled([
      axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers,
      }),
      axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
        {
          headers,
        },
      ),
    ]);

    let readme = null;
    let commits = [];

    if (readmeRes.status === "fulfilled") {
      // GitHub returns Base64 encoded content
      const content = Buffer.from(
        readmeRes.value.data.content,
        "base64",
      ).toString("utf-8");
      readme = content;
    }

    if (commitsRes.status === "fulfilled") {
      commits = commitsRes.value.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      }));
    }

    res.json({ readme, commits });
  } catch (err) {
    console.error("GitHub Content Error:", err.message);
    res.status(500).json({ message: "Failed to fetch GitHub content" });
  }
});

export default router;
