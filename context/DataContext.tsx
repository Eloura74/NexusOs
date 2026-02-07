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
  addDoc: (doc: DocEntry) => void;
  updateDoc: (doc: DocEntry) => void;
  deleteDoc: (id: string) => void;
  settings: any;
  updateSettings: (newSettings: any) => Promise<boolean>;
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

  // Settings State
  const [settings, setSettings] = useState<any>({
    serverName: "NexusOS-Core",
    dashboardUrl: "http://localhost:3000",
  });

  const { showNotification } = useNotification();
  const prevServicesRef = useRef<Service[]>([]); // To track changes

  // Settings Actions
  const fetchSettings = () => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((err) => console.error("Error fetching settings:", err));
  };

  const updateSettings = async (newSettings: any) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      setSettings(data);
      showNotification("success", "Paramètres", "Configuration sauvegardée !");
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      showNotification("error", "Erreur", "Impossible de sauvegarder.");
      return false;
    }
  };

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
          stars: p.stars,
          forks: p.forks,
          language: p.language,
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

  // Doc Actions
  const fetchDocs = () => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error("Error fetching docs:", err));
  };

  const addDoc = (doc: DocEntry) => {
    fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    })
      .then((res) => res.json())
      .then((savedDoc) => {
        setDocs((prev) => [...prev, savedDoc]);
        showNotification("success", "Doc", "Document créé.");
      });
  };

  const updateDoc = (doc: DocEntry) => {
    fetch(`/api/docs/${doc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    })
      .then((res) => res.json())
      .then((updatedDoc) => {
        setDocs((prev) => prev.map((d) => (d.id === doc.id ? updatedDoc : d)));
        showNotification("success", "Doc", "Document mis à jour.");
      });
  };

  const deleteDoc = (id: string) => {
    fetch(`/api/docs/${id}`, { method: "DELETE" }).then(() => {
      setDocs((prev) => prev.filter((d) => d.id !== id));
      showNotification("info", "Doc", "Document supprimé.");
    });
  };

  useEffect(() => {
    fetchProjects();
    fetchServices();
    fetchLogs();
    fetchDocs();
    fetchSettings();
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
    fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    })
      .then((res) => res.json())
      .then((savedService) => {
        // Use the saved service from backend to get the real ID
        setServices((prev) => [
          ...prev,
          {
            ...savedService,
            id: savedService._id, // Ensure ID mapping if needed, backend sends _id
            lastCheck: "Jamais",
            status: "UNKNOWN",
          },
        ]);

        addLog({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          level: "SUCCESS",
          message: `Service ajouté : ${service.name}`,
          source: "System",
        });

        showNotification(
          "success",
          "Service Ajouté",
          `${service.name} est maintenant surveillé.`,
        );
      })
      .catch((err) => {
        console.error("Error adding service:", err);
        showNotification("error", "Erreur", "Impossible d'ajouter le service.");
      });
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
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
      showNotification(
        "info",
        "Synchronisation GitHub",
        "Récupération des dépôts...",
      );

      const res = await fetch("/api/github/sync", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        showNotification(
          "success",
          "Synchronisation Terminée",
          `Ajoutés: ${data.stats.added}, Mis à jour: ${data.stats.updated}`,
        );
        fetchProjects();

        addLog({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          level: "SUCCESS",
          message: `Sync GitHub : ${data.stats.added} ajoutés, ${data.stats.updated} mis à jour.`,
          source: "GitHub",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("GitHub Sync Error:", error);
      showNotification(
        "error",
        "Erreur Sync",
        "Impossible de synchroniser avec GitHub.",
      );
      addLog({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        message: `Erreur Sync GitHub : ${error.message || "Erreur inconnue"}`,
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
    const newLog = {
      ...log,
      timestamp: new Date(),
      id: log.id || Date.now().toString(),
    };

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
        addDoc,
        updateDoc,
        deleteDoc,
        settings,
        updateSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
