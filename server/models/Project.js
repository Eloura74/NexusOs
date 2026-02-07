import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"],
      default: "PLANNING",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    tags: [String],
    repoUrl: String,
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: String,
    githubStats: {
      stars: Number,
      forks: Number,
      lastCommit: Date,
      issues: Number,
    },
    lastUpdate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Project", ProjectSchema);
