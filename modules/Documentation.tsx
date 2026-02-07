import React, { useState, useEffect } from "react";
import {
  Book,
  Plus,
  Search,
  Save,
  Trash2,
  Edit2,
  FileText,
  X,
  MoreVertical,
} from "lucide-react";

interface Doc {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updatedAt: string;
}

const Documentation: React.FC = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    category: "General",
  });

  // Fetch Docs
  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/docs");
      const data = await res.json();
      setDocs(data);
    } catch (error) {
      console.error("Error fetching docs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDoc(null);
    setEditForm({
      title: "Nouvelle Note",
      content: "# Titre\n\nContenu...",
      category: "General",
    });
    setIsEditing(true);
  };

  const handleSelect = (doc: Doc) => {
    setSelectedDoc(doc);
    setEditForm({
      title: doc.title,
      content: doc.content,
      category: doc.category,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const method = selectedDoc ? "PUT" : "POST";
    const url = selectedDoc ? `/api/docs/${selectedDoc._id}` : "/api/docs";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const savedDoc = await res.json();

      if (selectedDoc) {
        setDocs((prev) =>
          prev.map((d) => (d._id === savedDoc._id ? savedDoc : d)),
        );
      } else {
        setDocs((prev) => [savedDoc, ...prev]);
      }

      setSelectedDoc(savedDoc);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving doc:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    try {
      await fetch(`/api/docs/${id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d._id !== id));
      if (selectedDoc?._id === id) {
        setSelectedDoc(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error deleting doc:", error);
    }
  };

  const filteredDocs = docs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 animate-fade-in">
      {/* Sidebar List */}
      <div className="w-1/3 min-w-[300px] flex flex-col gap-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center glass-panel p-4 rounded-xl">
          <div className="relative flex-1 mr-4">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:bg-slate-900/80 transition-all"
            />
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary p-2 rounded-lg hover:scale-105 transition-transform"
            title="Nouveau Document"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Doc List */}
        <div className="glass-panel flex-1 overflow-y-auto space-y-3 p-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {isLoading ? (
            <p className="text-center text-slate-500 mt-10">Chargement...</p>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center text-slate-500 mt-10 flex flex-col items-center">
              <Book className="w-12 h-12 mb-2 opacity-20" />
              <p>Aucun document trouvé.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc._id}
                onClick={() => handleSelect(doc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                  selectedDoc?._id === doc._id
                    ? "bg-primary/20 border-primary/50 shadow-lg shadow-primary/10"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={`font-bold truncate ${
                      selectedDoc?._id === doc._id
                        ? "text-primary-light"
                        : "text-slate-200 group-hover:text-white"
                    }`}
                  >
                    {doc.title}
                  </h3>
                  {selectedDoc?._id === doc._id && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="bg-slate-900/50 px-2 py-0.5 rounded text-slate-400 border border-white/5">
                    {doc.category}
                  </span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor/Viewer */}
      <div className="glass-panel flex-1 rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {selectedDoc || isEditing ? (
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-surface-highlight flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center space-x-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="bg-transparent text-xl font-bold text-white border-b border-transparent focus:border-primary focus:outline-none w-full"
                    placeholder="Titre du document"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-primary" />
                    {selectedDoc?.title}
                  </h2>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        if (!selectedDoc) {
                          /* Cancel creation */
                        }
                      }}
                      className="text-slate-400 hover:text-white px-3 py-1.5 rounded transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-primary/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Éditer"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        selectedDoc && handleDelete(selectedDoc._id)
                      }
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              {isEditing ? (
                <div className="flex h-full flex-col">
                  <div className="px-4 py-2 bg-slate-900 border-b border-surface-highlight">
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      className="text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 focus:border-primary focus:outline-none"
                      placeholder="Catégorie"
                    />
                  </div>
                  <textarea
                    className="flex-1 w-full h-full bg-[#0d1117] text-slate-300 p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm({ ...editForm, content: e.target.value })
                    }
                    placeholder="# Commencez à écrire ici..."
                  />
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-8 prose prose-invert max-w-none">
                  {/* Basic auto-formatting for preview (MVP) */}
                  {selectedDoc?.content.split("\n").map((line, i) => (
                    <p
                      key={i}
                      className={`
                        ${line.startsWith("# ") ? "text-2xl font-bold text-white mb-4 mt-6 border-b border-slate-700 pb-2" : ""}
                        ${line.startsWith("## ") ? "text-xl font-bold text-slate-200 mb-3 mt-5" : ""}
                        ${line.startsWith("### ") ? "text-lg font-bold text-slate-300 mb-2 mt-4" : ""}
                        ${line.startsWith("- ") ? "ml-4 list-disc text-slate-300" : ""}
                        ${!line.startsWith("#") && !line.startsWith("-") ? "text-slate-300 mb-2 leading-relaxed" : ""}
                      `}
                    >
                      {line.replace(/^#+ |- /, "")}
                    </p>
                  ))}
                  <div className="mt-8 pt-4 border-t border-surface-highlight text-xs text-slate-500 font-mono">
                    ID: {selectedDoc?._id} • Catégorie: {selectedDoc?.category}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
            <Book className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Sélectionnez un document</p>
            <p className="text-sm">ou créez-en un nouveau</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;
