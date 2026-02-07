import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import {
  ArrowLeft,
  GitBranch,
  Star,
  GitFork,
  Clock,
  Save,
  Trash2,
  FileText,
  Activity,
  Settings,
  ExternalLink,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addLog } = useData();
  const [project, setProject] = useState<any>(null);
  const [githubContent, setGithubContent] = useState<{
    readme: string | null;
    commits: any[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "settings"
  >("overview");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Editable fields
  const [editForm, setEditForm] = useState({
    description: "",
    status: "",
    progress: 0,
    tags: "",
  });

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === id);
    if (foundProject) {
      setProject(foundProject);
      setEditForm({
        description: foundProject.description,
        status: foundProject.status,
        progress: foundProject.progress,
        tags: foundProject.tags.join(", "),
      });

      // Fetch GitHub Content if Repo URL exists
      if (foundProject.repoUrl && !githubContent) {
        setIsLoadingContent(true);
        const urlParts = foundProject.repoUrl.split("/");
        const repo = urlParts[urlParts.length - 1];
        const owner = urlParts[urlParts.length - 2];

        fetch(`/api/github/content/${owner}/${repo}`)
          .then((res) => res.json())
          .then((data) => {
            setGithubContent(data);
            setIsLoadingContent(false);
          })
          .catch((err) => {
            console.error("Failed to fetch GitHub content", err);
            setIsLoadingContent(false);
          });
      }
    }
  }, [id, projects]);

  const handleSave = async () => {
    if (!project) return;

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editForm.description,
          status: editForm.status,
          progress: Number(editForm.progress),
          tags: editForm.tags.split(",").map((t) => t.trim()),
        }),
      });

      if (res.ok) {
        addLog({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          level: "SUCCESS",
          message: `Projet ${project.name} mis à jour.`,
          source: "Projects",
        });
        // Force refresh logic would be ideal here, but for now relies on parent poll or simple alert
        alert("Projet mis à jour !");
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "WARN",
        message: `Projet ${project.name} supprimé.`,
        source: "Projects",
      });
      navigate("/projects");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="glass-panel p-6 pb-0">
        <button
          onClick={() => navigate("/projects")}
          className="text-slate-400 hover:text-white flex items-center mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux projets
        </button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              {project.name}
              <span
                className={`ml-3 text-xs px-2 py-1 rounded-full border ${
                  project.status === "ACTIVE"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-slate-700/50 text-slate-400 border-slate-600"
                }`}
              >
                {project.status}
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl">{project.description}</p>
          </div>
          <div className="flex space-x-3">
            {project.repoUrl && (
              <button
                onClick={() => window.open(project.repoUrl, "_blank")}
                className="btn-secondary"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> GitHub
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex space-x-6 text-sm text-slate-500 pb-6 border-b border-white/5">
          {project.language && (
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
              {project.language}
            </div>
          )}
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-2" /> {project.stars || 0} Stars
          </div>
          <div className="flex items-center">
            <GitFork className="w-4 h-4 mr-2" /> {project.forks || 0} Forks
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" /> Mis à jour le{" "}
            {new Date(project.lastUpdate).toLocaleDateString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" /> Aperçu (Readme)
            </div>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === "activity"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Activité
            </div>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === "settings"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center">
              <Settings className="w-4 h-4 mr-2" /> Paramètres
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="glass-panel p-8 prose prose-invert max-w-none">
            {isLoadingContent ? (
              <div className="text-center py-10 text-slate-500">
                Chargement du Readme...
              </div>
            ) : githubContent?.readme ? (
              <ReactMarkdown>{githubContent.readme}</ReactMarkdown>
            ) : (
              <div className="text-center py-10 text-slate-500">
                Aucun fichier README disponible ou projet non lié à GitHub.
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Derniers Commits
            </h3>
            {isLoadingContent ? (
              <div className="text-center text-slate-500">Chargement...</div>
            ) : githubContent?.commits && githubContent.commits.length > 0 ? (
              <div className="space-y-4">
                {githubContent.commits.map((commit: any) => (
                  <div
                    key={commit.sha}
                    className="flex items-start p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <GitBranch className="w-5 h-5 text-blue-400 mt-1 mr-3" />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {commit.message}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                        <span>{commit.author}</span>
                        <span>{new Date(commit.date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500">
                Aucune activité récente trouvée.
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="glass-panel p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-6">
              Modifier le Projet
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white h-32"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Statut
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
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
                    value={editForm.progress}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        progress: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tags: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="pt-6 flex justify-between border-t border-white/10 mt-6">
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 flex items-center text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Supprimer le projet
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
