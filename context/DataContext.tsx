import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import {
  SystemStats,
  Service,
  Project,
  DocEntry,
  LogEntry,
  Command,
} from "../types";
import { MOCK_DOCS, MOCK_LOGS } from "../constants";
import { useNotification } from "./NotificationContext";

interface DataContextType {
  services: Service[];
  projects: Project[];
  docs: DocEntry[];
  logs: LogEntry[];
  commands: Command[];
  addCommand: (command: any) => void;
  deleteCommand: (id: string) => void;
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
  const [logs, setLogs] = useState<LogEntry[]>([]); // Changed to empty array, MOCK_LOGS removed
  const [commands, setCommands] = useState<Command[]>([]); // Added commands state
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
  // This function is refactored to be a general data fetcher based on the provided snippet
  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get("http://localhost:5000/api/system/stats"),
        axios.get("http://localhost:5000/api/services"),
        axios.get("http://localhost:5000/api/projects"),
        axios.get("http://localhost:5000/api/logs"),
        axios.get("http://localhost:5000/api/settings"),
        axios.get("http://localhost:5000/api/commands"),
      ]);

      const [
        statsRes,
        servicesRes,
        projectsRes,
        logsRes,
        settingsRes,
        commandsRes,
      ] = results;

      if (statsRes.status === "fulfilled") setSystemStats(statsRes.value.data);

      if (
        servicesRes.status === "fulfilled" &&
        Array.isArray(servicesRes.value.data)
      ) {
        setServices(
          servicesRes.value.data.map((s: any) => ({
            id: s._id,
            name: s.name,
            type: s.type,
            url: s.url,
            icon: s.icon,
            description: s.description,
            tags: s.tags,
            status: s.status,
            lastCheck: new Date(s.lastCheck).toLocaleTimeString(),
            responseTime: s.responseTime,
          })),
        );
      }

      if (projectsRes.status === "fulfilled") {
        setProjects(
          projectsRes.value.data.map((p: any) => ({
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
          })),
        );
      }

      if (logsRes.status === "fulfilled") setLogs(logsRes.value.data);
      if (settingsRes.status === "fulfilled" && settingsRes.value.data)
        setSettings(settingsRes.value.data);
      if (commandsRes.status === "fulfilled")
        setCommands(commandsRes.value.data);
    } catch (err) {
      console.error("Error fetching initial data (Global Catch):", err); // Should rarely happen with allSettled
    }
  };

  // 4. Fetch Logs (This function is now redundant if fetchData is used for initial load)
  // Keeping it for potential future specific log fetching, but initial load is via fetchData
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
    fetchData(); // Use the new combined fetch function
    fetchDocs(); // Docs are not included in the new fetchData, so keep this
    // fetchProjects(); // Redundant
    // fetchServices(); // Redundant
    // fetchLogs(); // Redundant
    // fetchSettings(); // Redundant
  }, []);

  // 3. Poll System Stats (5s)
  useEffect(() => {
    const fetchStats = () => {
      fetch("/api/system/stats")
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
      // The backend now handles logging for status changes inside /api/services/scan
      // We just trigger the scan and update the local state
      const res = await fetch("/api/services/scan", { method: "POST" });
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Scan returned non-array data:", data);
        return;
      }

      const mappedServices = data.map((s: any) => ({
        id: s._id,
        name: s.name,
        type: s.type,
        url: s.url,
        icon: s.icon,
        description: s.description,
        tags: s.tags,
        status: s.status,
        lastCheck: new Date(s.lastCheck).toLocaleTimeString(),
        responseTime: s.responseTime,
      }));

      // Check for status changes for Notifications (Frontend side)
      mappedServices.forEach((newSvc: Service) => {
        const oldSvc = prevServicesRef.current.find((s) => s.id === newSvc.id);
        if (
          oldSvc &&
          oldSvc.status !== newSvc.status &&
          oldSvc.status !== "UNKNOWN"
        ) {
          const isUp = newSvc.status === "ONLINE";
          showNotification(
            isUp ? "success" : "error",
            `État Service : ${newSvc.name}`,
            `${newSvc.name} est maintenant ${newSvc.status} (${newSvc.responseTime || 0}ms)`,
          );
        }
      });

      prevServicesRef.current = mappedServices;
      setServices(mappedServices);

      // Refresh logs as the scan might have created new ones
      const logsRes = await axios.get("http://localhost:5000/api/logs");
      setLogs(logsRes.data);
    } catch (error) {
      console.error("Scan failed", error);
      // Suppress toast to avoid spam when backend is down
      // showNotification(
      //   "error",
      //   "Erreur Scan",
      //   "Impossible de scanner les services.",
      // );
    }
  };

  // Poll Services & Logs every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkServices();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Command Actions
  const addCommand = async (cmd: Omit<Command, "_id">) => {
    try {
      const res = await axios.post("http://localhost:5000/api/commands", cmd);
      setCommands((prev) => [res.data, ...prev]);
      showNotification("success", "Commande", "Commande ajoutée.");
      return true;
    } catch (error) {
      console.error("Error adding command:", error);
      showNotification("error", "Erreur", "Impossible d'ajouter la commande.");
      return false;
    }
  };

  const deleteCommand = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/commands/${id}`);
      setCommands((prev) => prev.filter((c) => c._id !== id));
      showNotification("info", "Commande", "Commande supprimée.");
      return true;
    } catch (error) {
      console.error("Error deleting command:", error);
      showNotification(
        "error",
        "Erreur",
        "Impossible de supprimer la commande.",
      );
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        services,
        projects,
        docs,
        logs,
        commands, // Added commands to context value
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
        addCommand,
        deleteCommand,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
