import React, { useState } from "react";
import { useData } from "../context/DataContext"; // Import du Context
import { Book, FileText, Search, Tag, AlertTriangle } from "lucide-react";

const Documentation: React.FC = () => {
  const { docs, searchQuery } = useData(); // Utilisation des données du contexte
  const [localSearch, setLocalSearch] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Combinaison de la recherche globale et locale
  const activeSearch = searchQuery || localSearch;

  const filteredDocs = docs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      doc.tags.some((t) =>
        t.toLowerCase().includes(activeSearch.toLowerCase()),
      ),
  );

  const selectedDoc =
    docs.find((d) => d.id === selectedDocId) ||
    (filteredDocs.length > 0 ? filteredDocs[0] : null);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Base de Connaissances
          </h1>
          <p className="text-slate-400 text-sm">
            Procédures, Configs, et SOPs.
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar Liste */}
        <div className="w-full md:w-1/3 flex flex-col bg-surface border border-surface-highlight rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-surface-highlight bg-slate-900/30">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher docs..."
                value={activeSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder-slate-600"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-3 rounded-lg transition-all flex items-start space-x-3 border
                  ${
                    selectedDoc?.id === doc.id
                      ? "bg-primary/10 border-primary/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]"
                      : "hover:bg-slate-800 border-transparent"
                  }
                `}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-md ${doc.isRunbook ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}
                >
                  {doc.isRunbook ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-sm font-medium ${selectedDoc?.id === doc.id ? "text-primary" : "text-slate-200"}`}
                  >
                    {doc.title}
                  </h4>
                  <div className="flex items-center mt-1.5 space-x-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {doc.lastUpdated}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Visionneuse de Contenu */}
        <div className="hidden md:flex flex-1 flex-col bg-surface border border-surface-highlight rounded-xl overflow-hidden shadow-lg relative">
          {selectedDoc ? (
            <>
              {/* Entête du Document */}
              <div className="p-6 border-b border-surface-highlight bg-slate-800/30 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border tracking-wider flex items-center
                    ${
                      selectedDoc.isRunbook
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }
                  `}
                  >
                    {selectedDoc.isRunbook && (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {selectedDoc.isRunbook ? "RUNBOOK" : "DOCUMENTATION"}
                  </span>
                  <span className="text-slate-600 text-xs font-mono">
                    ID: {selectedDoc.id}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                  {selectedDoc.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center text-xs text-slate-400 bg-slate-900 border border-slate-700/50 px-2.5 py-1 rounded-full"
                    >
                      <Tag className="w-3 h-3 mr-1.5 opacity-70" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contenu du Document */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-900/20 custom-scrollbar">
                <div className="prose prose-invert prose-slate max-w-none">
                  <div className="font-mono text-sm bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6 text-slate-300 shadow-inner">
                    {selectedDoc.contentSnippet}
                  </div>
                  <p className="text-slate-300 leading-7">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>

                  <div className="not-prose my-6 p-4 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg">
                    <h4 className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wide">
                      Note Importante
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Assurez-vous d'avoir les permissions root avant d'exécuter
                      ces commandes.
                    </p>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-slate-800 pb-2">
                    Procédure
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-300 marker:text-primary">
                    <li>
                      Vérifier l'intégrité du système avec{" "}
                      <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-primary font-mono border border-slate-700">
                        systemctl status
                      </code>
                    </li>
                    <li>
                      Vérifier les logs pour les codes d'erreur spécifiques
                      définis dans le SOP.
                    </li>
                    <li>Si critique, escalader au canal Ops immédiatement.</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20">
              <div className="p-6 rounded-full bg-slate-800/50 mb-4 animate-pulse">
                <Book className="w-12 h-12 opacity-50" />
              </div>
              <p className="font-medium">
                Aucun document ne correspond à la recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documentation;
