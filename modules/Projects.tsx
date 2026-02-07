import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { Project } from "../types";
import {
  GitBranch,
  Clock,
  ArrowRight,
  Folder,
  Plus,
  X,
  RefreshCw,
  Star,
  GitFork,
  Code,
} from "lucide-react";

const Projects: React.FC = () => {
  const { projects, addProject, syncGitHub, analyzeProject } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    description: "",
    status: "PLANNING",
    progress: 0,
    tags: [],
  });

  const handleSync = async () => {
    setIsSyncing(true);
    await syncGitHub();
    setIsSyncing(false);
  };

  const handleCreateProject = () => {
    // ... existing logic ...
    if (!newProject.name) return;

    addProject({
      id: Date.now().toString(),
      name: newProject.name!,
      description: newProject.description || "",
      status: newProject.status as any,
      progress: newProject.progress || 0,
      tags: newProject.tags || [],
      lastUpdate: "À l'instant",
      repoUrl: newProject.repoUrl,
    });

    setIsModalOpen(false);
    setNewProject({
      name: "",
      description: "",
      status: "PLANNING",
      progress: 0,
      tags: [],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-end border-b border-surface-highlight pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Projets</h1>
          <p className="text-slate-400">
            Développements en cours et initiatives hardware.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`btn-secondary flex items-center ${isSyncing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Sync..." : "Sync GitHub"}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="card-surface flex flex-col h-full hover:border-slate-500 transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-800 rounded-lg text-slate-300 group-hover:text-white transition-colors">
                <Folder className="w-6 h-6" />
              </div>
              <span
                className={`
                text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider
                ${
                  project.status === "ACTIVE"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : project.status === "ON_HOLD"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-slate-700/50 text-slate-400 border-slate-600"
                }
              `}
              >
                {project.status.replace("_", " ")}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed line-clamp-3">
              {project.description}
            </p>

            {/* GitHub Stats */}
            <div className="flex items-center space-x-4 mb-4 text-xs text-slate-500">
              {project.language && (
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                  {project.language}
                </div>
              )}
              {(project.stars > 0 || project.forks > 0) && (
                <>
                  <div className="flex items-center" title="Stars">
                    <Star className="w-3 h-3 mr-1" /> {project.stars}
                  </div>
                  <div className="flex items-center" title="Forks">
                    <GitFork className="w-3 h-3 mr-1" /> {project.forks}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-mono">
                  <span>Progression</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${project.status === "ACTIVE" ? "bg-primary" : "bg-slate-500"}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-500 font-mono border-t border-surface-highlight pt-4">
                {project.repoUrl && (
                  <div
                    className="flex items-center hover:text-white cursor-pointer transition-colors px-2 py-1 -ml-2 rounded hover:bg-slate-800"
                    onClick={() => window.open(project.repoUrl, "_blank")}
                  >
                    <GitBranch className="w-3 h-3 mr-1.5" />
                    repo
                  </div>
                )}
                <div className="flex items-center ml-auto">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {new Date(project.lastUpdate).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() =>
                  project.repoUrl
                    ? window.open(project.repoUrl, "_blank")
                    : alert("Aucune URL configurée pour ce projet")
                }
                className="w-full mt-2 py-2 flex items-center justify-center text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group-hover:shadow-md border border-transparent hover:border-slate-700"
              >
                Ouvrir l'Espace{" "}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        {/* Ajout Rapide */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group h-full min-h-[300px]"
        >
          <div className="p-4 rounded-full bg-slate-900 group-hover:bg-primary/10 mb-4 transition-colors">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-medium">Créer un Nouveau Projet</span>
        </button>
      </div>

      {isModalOpen && (
        // ... Modal content code (keeping it cleaner in this thought, but will replace full content) ...
        // Actually, I will just return the full file content to be safe and avoid "..."
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Nouveau Projet</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Nom du Projet
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  placeholder="ex: Domotique Salon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none h-24 resize-none"
                  placeholder="Objectifs et notes..."
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newProject.name)
                      return alert("Entrez un nom de projet d'abord");

                    const btn = document.getElementById("ai-btn");
                    if (btn) btn.innerText = "Analyse en cours...";

                    const result = await analyzeProject(
                      newProject.name!,
                      newProject.description || "",
                      newProject.tags || [],
                    );

                    if (btn) btn.innerText = "✨ Analyser avec IA";

                    if (result) {
                      setNewProject((prev) => ({
                        ...prev,
                        progress: result.progress || prev.progress,
                        description:
                          (prev.description ? prev.description + "\n\n" : "") +
                          "🤖 Analyse IA:\n" +
                          result.analysis,
                      }));
                      if (result.suggestions) {
                        alert(
                          "Suggestions IA:\n" + result.suggestions.join("\n- "),
                        );
                      }
                    }
                  }}
                  id="ai-btn"
                  className="mt-2 text-xs flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span className="mr-1">✨</span> Analyser avec IA (gpt-ss:20b)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Statut
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="ON_HOLD">En Pause</option>
                    <option value="COMPLETED">Terminé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Progression (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProject.progress}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        progress: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateProject}
                className="w-full btn-primary justify-center mt-6"
              >
                Créer le Projet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
