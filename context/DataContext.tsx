import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Service, Project, DocEntry, LogEntry, SystemStats } from "../types";
import { MOCK_DOCS, MOCK_LOGS } from "../constants";
import { useNotification } from "./NotificationContext";

interface DataContextType {
  services: Service[];
  projects: Project[];
  docs: DocEntry[];
  logs: LogEntry[];
  systemStats: SystemStats | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addService: (service: Service) => void;
  updateServiceStatus: (id: string, status: Service["status"]) => void;
  addProject: (project: Project) => void;
  syncGitHub: () => Promise<void>;
  checkServices: () => Promise<void>;
  analyzeProject: (
    name: string,
    description: string,
    tags: string[],
  ) => Promise<any>;
  addLog: (log: LogEntry) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [docs, setDocs] = useState<DocEntry[]>(MOCK_DOCS);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { showNotification } = useNotification();
  const prevServicesRef = useRef<Service[]>([]); // To track changes

  // 1. Fetch Projects
  const fetchProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        const mappedProjects = data.map((p: any) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          status: p.status,
          progress: p.progress,
          tags: p.tags,
          repoUrl: p.repoUrl,
          lastUpdate: new Date(p.lastUpdate).toLocaleDateString(),
          githubStats: p.githubStats,
        }));
        setProjects(mappedProjects);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  };

  // 2. Fetch Services
  const fetchServices = () => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const mappedServices = data.map((s: any) => ({
          id: s._id,
          name: s.name,
          type: s.type,
          url: s.url,
          icon: s.icon,
          status: s.status,
          lastCheck: new Date(s.lastCheck).toLocaleTimeString(),
          responseTime: s.responseTime,
        }));
        setServices(mappedServices);
      })
      .catch((err) => console.error("Error fetching services:", err));
  };

  // 4. Fetch Logs
  const fetchLogs = () => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Error fetching logs:", err));
  };

  useEffect(() => {
    fetchProjects();
    fetchServices();
    fetchLogs();
  }, []);

  // 3. Poll System Stats (5s)
  useEffect(() => {
    const fetchStats = () => {
      fetch("/api/system")
        .then((res) => res.json())
        .then((data) => setSystemStats(data))
        .catch((err) => console.error("Error polling system:", err));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const addService = (service: Service) => {
    // TODO: Implement POST /api/services if management UI added
    setServices((prev) => [...prev, service]);
  };

  const updateServiceStatus = (id: string, status: Service["status"]) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, lastCheck: "Maintenant" } : s,
      ),
    );
  };

  const addProject = (project: Project) => {
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    })
      .then((res) => res.json())
      .then(() => {
        fetchProjects(); // Refresh list
        addLog({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          level: "SUCCESS",
          message: `Projet créé : ${project.name}`,
          source: "Projects",
        });
      });
  };

  const checkServices = async () => {
    try {
      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        message: "Lancement du scan des services...",
        source: "System",
      });

      const res = await fetch("/api/services/scan", { method: "POST" });
      const data = await res.json();

      const mappedServices = data.map((s: any) => ({
        id: s._id,
        name: s.name,
        type: s.type,
        url: s.url,
        icon: s.icon,
        status: s.status,
        lastCheck: new Date(s.lastCheck).toLocaleTimeString(),
        responseTime: s.responseTime,
      }));

      // Check for status changes
      mappedServices.forEach((newSvc: Service) => {
        const oldSvc = prevServicesRef.current.find((s) => s.id === newSvc.id);
        if (oldSvc && oldSvc.status !== newSvc.status) {
          // Status Changed Notification
          const isUp = newSvc.status === "ONLINE";

          // Specific rule for Home Assistant & Critical infra
          if (
            ["HOME_ASSISTANT", "PRINTER", "NAS", "SERVER"].includes(newSvc.type)
          ) {
            showNotification(
              isUp ? "success" : "error",
              `État Service : ${newSvc.name}`,
              `${newSvc.name} est maintenant ${newSvc.status} (${newSvc.responseTime || 0}ms)`,
            );
          }
        }
      });

      prevServicesRef.current = mappedServices;
      setServices(mappedServices);

      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "SUCCESS",
        message: "Scan des services terminé.",
        source: "System",
      });

      showNotification(
        "success",
        "Scan Terminé",
        "Tous les services ont été écourtés.",
      );
    } catch (error) {
      console.error("Scan failed", error);
      showNotification(
        "error",
        "Erreur Scan",
        "Impossible de scanner les services.",
      );
    }
  };

  const syncGitHub = async () => {
    try {
      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        message: "Synchronisation GitHub en cours...",
        source: "GitHub",
      });

      const res = await fetch("/api/github/repos");
      const repos = await res.json();

      // Pour chaque repo, on essaie de l'ajouter s'il n'existe pas
      // Note: Idéalement, le backend devrait gérer le "sync/upsert" globalement
      // Pour l'instant on fait simple côté front ou on pourrait avoir une route /api/projects/sync-github

      // Ici on va juste recharger les projets si le backend avait une logique de sync,
      // mais le backend github route renvoie juste les repos.
      // On va les ajouter en mémoire ou DB ?
      // Le mieux est de les proposer à l'import ou de les auto-ajouter.
      // Pour cet exercice, on va auto-créer ceux qui manquent (simple check par nom)

      let addedCount = 0;
      for (const repo of repos) {
        const exists = projects.find((p) => p.name === repo.name);
        if (!exists) {
          await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: repo.name,
              description: repo.description,
              status: "ACTIVE", // Default
              progress: 0,
              tags: [repo.language || "Code"],
              repoUrl: repo.html_url,
            }),
          });
          addedCount++;
        }
      }

      fetchProjects(); // Reload final list

      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "SUCCESS",
        message: `Sync GitHub terminée : ${addedCount} nouveaux projets importés.`,
        source: "GitHub",
      });
    } catch (error) {
      console.error("GitHub Sync failed", error);
      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        message: "Échec de la synchronisation GitHub.",
        source: "GitHub",
      });
    }
  };

  const analyzeProject = async (
    name: string,
    description: string,
    tags: string[],
  ) => {
    try {
      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        message: `Analyse AI en cours pour ${name}...`,
        source: "AI",
      });

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, tags }),
      });
      const data = await res.json();

      return data; // { progress, analysis, suggestions }
    } catch (error) {
      console.error("AI Analysis failed", error);
      addLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        message: "Échec de l'analyse AI.",
        source: "AI",
      });
      return null;
    }
  };

  const addLog = (log: LogEntry) => {
    // Optimistic update
    const newLog = { ...log, timestamp: new Date() }; // Ensure date object for sorting if needed, though backend handles it
    // But we want to send to backend
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: log.level,
        message: log.message,
        source: log.source,
      }),
    })
      .then((res) => res.json())
      .then((savedLog) => {
        setLogs((prev) => [savedLog, ...prev].slice(0, 100));
      })
      .catch((err) => console.error("Failed to save log", err));
  };

  return (
    <DataContext.Provider
      value={{
        services,
        projects,
        docs,
        logs,
        systemStats,
        searchQuery,
        setSearchQuery,
        addService,
        updateServiceStatus,
        addProject,
        syncGitHub,
        checkServices,
        analyzeProject,
        addLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
