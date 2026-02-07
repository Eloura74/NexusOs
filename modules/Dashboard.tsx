import React, { useState } from "react";
import { useData } from "../context/DataContext";
import ServiceCard from "../components/ServiceCard";
import Modal from "../components/Modal";
import {
  Activity,
  HardDrive,
  Cpu,
  GitGraph,
  Clock,
  Server,
  Terminal,
  Trash2,
  RefreshCw,
  Github,
  AlertCircle,
  ArrowRight,
  Box,
  Plus,
  X,
} from "lucide-react";
import TaskRunnerModal from "../components/TaskRunnerModal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart, // Keeping this if needed, but we switched to LineChart
  Area,
} from "recharts";

// Données mock pour le graphique de charge (on pourra dynamiser plus tard avec l'historique)
const CHART_DATA = [
  { time: "10:00", load: 24 },
  { time: "10:05", load: 35 },
  { time: "10:10", load: 85 },
  { time: "10:15", load: 45 },
  { time: "10:20", load: 30 },
  { time: "10:25", load: 28 },
  { time: "10:30", load: 32 },
];

const Dashboard: React.FC = () => {
  const { services, logs, systemStats, checkServices, addService } = useData();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    type: "OTHER",
    url: "http://",
    icon: "Box", // Default icon
    apiKey: "",
    description: "",
    tags: "",
  });

  // Task Runner State
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState({ command: "", title: "" });

  // Command Management State
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [newCommand, setNewCommand] = useState<{
    label: string;
    command: string;
    type?: string;
  }>({ label: "", command: "", type: "dashboard" }); // Default type dashboard
  const { commands, addCommand, deleteCommand } = useData();

  const runTask = (title: string, command: string) => {
    setCurrentTask({ title, command });
    setIsRunnerOpen(true);
  };

  const criticalServices = services.filter(
    (s) => s.status === "OFFLINE" || s.status === "UNKNOWN",
  );
  const healthyServices = services.filter(
    (s) => s.status === "ONLINE" || s.status === "MAINTENANCE",
  );

  const handleAddService = () => {
    if (!newService.name || !newService.url) return;

    addService({
      id: Date.now().toString(), // Temp ID
      name: newService.name,
      type: newService.type,
      url: newService.url,
      icon: newService.icon,
      apiKey: newService.apiKey,
      description: newService.description,
      tags: newService.tags
        ? newService.tags.split(",").map((t) => t.trim())
        : [],
      status: "UNKNOWN",
      lastCheck: "Jamais",
      responseTime: 0,
    } as any);

    setIsServiceModalOpen(false);
    setNewService({
      name: "",
      type: "OTHER",
      url: "http://",
      icon: "Box",
      apiKey: "",
      description: "",
      tags: "",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Statistiques d'en-tête (Données Réelles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Services Totaux / OS Info */}
        <div className="glass-panel p-4 flex items-center space-x-4 hover:border-blue-500/30 transition-colors group">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500/20 transition-colors">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-white truncate max-w-[150px] text-glow">
              {systemStats?.os.hostname || "Loading..."}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {systemStats?.os.distro || "Système"}
            </div>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="glass-panel p-4 flex items-center space-x-4 hover:border-purple-500/30 transition-colors group">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg group-hover:bg-purple-500/20 transition-colors">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white text-glow">
              {systemStats ? `${systemStats.memory.percent}%` : "--%"}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              RAM (
              {systemStats
                ? Math.round(systemStats.memory.used / 1024 / 1024 / 1024)
                : 0}{" "}
              GB)
            </div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="glass-panel p-4 flex items-center space-x-4 hover:border-green-500/30 transition-colors group">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg group-hover:bg-green-500/20 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white text-glow">
              {systemStats ? `${systemStats.cpu.load}%` : "--%"}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              CPU Load
            </div>
          </div>
        </div>

        {/* Docker Containers */}
        <div className="glass-panel p-4 flex items-center space-x-4 hover:border-orange-500/30 transition-colors group">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg group-hover:bg-orange-500/20 transition-colors">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white text-glow">
              {systemStats ? systemStats.docker.count : 0}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Conteneurs
            </div>
          </div>
        </div>
      </div>

      {/* Division du Contenu Principal : Services & Contexte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : État des Services */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              État des Services
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => checkServices()}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center"
                title="Scanner les services maintenant"
              >
                <Activity className="w-3 h-3 mr-1.5" /> Scan
              </button>
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="text-xs bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg border border-primary-highlight transition-colors flex items-center shadow-lg shadow-primary/20"
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Ajouter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Services Critiques / Offline */}
            {criticalServices.length > 0 && (
              <div className="col-span-1 md:col-span-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h3 className="text-red-400 font-bold mb-3 flex items-center text-sm uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Attention Requise ({criticalServices.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criticalServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            )}

            {/* Services Online */}
            {healthyServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
              <Box className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Aucun service configuré.</p>
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="text-primary hover:underline text-sm mt-2"
              >
                Ajouter votre premier service
              </button>
            </div>
          )}
        </div>

        {/* Colonne Droite : Widgets */}
        <div className="space-y-6">
          {/* Graphique de Charge Système */}
          <div className="glass-panel p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary" />
              Charge Système (15m)
            </h3>
            <div className="h-[200px] w-full min-w-[300px] min-h-[200px]">
              {/* Attendre que les données soient chargées pour éviter le warning Recharts */}
              {systemStats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.8)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        backdropFilter: "blur(4px)",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="load"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={false}
                      fillOpacity={1}
                      fill="url(#colorCpu)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs">
                  Chargement des métriques...
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Terminal className="w-5 h-5 mr-2 text-primary" />
                Actions Rapides
              </h3>
              <button
                onClick={() => setIsCommandModalOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all hover:scale-105"
                title="Ajouter une commande"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {commands
                .filter((c) => c.type === "dashboard")
                .map((cmd) => (
                  <div key={cmd._id} className="relative group">
                    <button
                      onClick={() => runTask(cmd.label, cmd.command)}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center justify-center transition-all border border-white/5 hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10"
                    >
                      <Terminal className="w-6 h-6 text-slate-300 mb-2 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                        {cmd.label}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Supprimer cette commande ?"))
                          deleteCommand(cmd._id);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 hover:scale-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

              {commands.filter((c) => c.type === "dashboard").length === 0 && (
                <div className="col-span-2 text-center text-xs text-slate-500 py-6 border border-dashed border-slate-700/50 rounded-xl">
                  Aucune action configurée.
                </div>
              )}
            </div>
          </div>
          {/* Logs Rapides */}
          <div className="glass-panel overflow-hidden shadow-lg">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
              <h3 className="text-slate-100 font-medium text-sm">
                Activité Récente
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-mono opacity-80">
                  LIVE
                </span>
              </div>
            </div>
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
              {logs.slice(0, 5).map((log, index) => (
                <div
                  key={log.id || index}
                  className="p-3 text-sm hover:bg-white/5 transition-colors group cursor-default"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`
                      text-[10px] font-bold px-1.5 py-0.5 rounded border backdrop-blur-sm
                      ${
                        log.level === "ERROR"
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : log.level === "WARN"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : log.level === "SUCCESS"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }
                    `}
                    >
                      {log.level}
                    </span>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono transition-colors">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed truncate group-hover:whitespace-normal transition-all">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-2 bg-slate-900/40 text-center border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
              <button className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center w-full py-1">
                Voir Journal Système <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Ajouter un Service"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Nom du Service
            </label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              placeholder="ex: Home Assistant"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Type
              </label>
              <select
                value={newService.type}
                onChange={(e) =>
                  setNewService({ ...newService, type: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              >
                <option value="OTHER">Autre</option>
                <option value="HOME_ASSISTANT">Home Assistant</option>
                <option value="KLIPPER">Imprimante 3D (Klipper)</option>
                <option value="NAS">NAS / Stockage</option>
                <option value="SERVER">Serveur / VM</option>
                <option value="NETWORK">Réseau</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Icône
              </label>
              <select
                value={newService.icon}
                onChange={(e) =>
                  setNewService({ ...newService, icon: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              >
                <option value="Box">Box (Défaut)</option>
                <option value="Server">Serveur</option>
                <option value="Activity">Activité</option>
                <option value="Cpu">CPU</option>
                <option value="HardDrive">Disque</option>
                <option value="Wifi">Wifi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              URL (avec http://)
            </label>
            <input
              type="text"
              value={newService.url}
              onChange={(e) =>
                setNewService({ ...newService, url: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              placeholder="http://192.168.1.x:8123"
            />
          </div>

          {newService.type === "KLIPPER" && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                API Key (Moonraker)
              </label>
              <input
                type="password"
                value={newService.apiKey}
                onChange={(e) =>
                  setNewService({ ...newService, apiKey: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                placeholder="Optionnel si IP de confiance configurée"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              placeholder="Courte description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Tags (séparés par virgule)
            </label>
            <input
              type="text"
              value={newService.tags}
              onChange={(e) =>
                setNewService({ ...newService, tags: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              placeholder="ex: lab, prod, backup"
            />
          </div>

          <button
            onClick={handleAddService}
            className="w-full btn-primary justify-center mt-6"
          >
            Ajouter
          </button>
        </div>
      </Modal>

      {/* Command Modal */}
      <Modal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
        title="Ajouter une Action Rapide"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Nom (Label)
            </label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              placeholder="Ex: Mise à jour Git"
              value={newCommand.label}
              onChange={(e) =>
                setNewCommand({ ...newCommand, label: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Commande (Shell)
            </label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-primary focus:outline-none"
              placeholder="Ex: git pull && npm install"
              value={newCommand.command}
              onChange={(e) =>
                setNewCommand({ ...newCommand, command: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Afficher dans
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              value={newCommand.type || "dashboard"}
              onChange={(e) =>
                setNewCommand({ ...newCommand, type: e.target.value as any })
              }
            >
              <option value="dashboard">Dashboard (Bouton)</option>
              <option value="terminal">Terminal Web (Snippet)</option>
            </select>
          </div>
          <button
            onClick={() => {
              addCommand({
                ...newCommand,
                type: (newCommand.type as any) || "dashboard",
                icon: "Terminal",
              });
              setIsCommandModalOpen(false);
              setNewCommand({ label: "", command: "" });
            }}
            className="w-full btn-primary justify-center mt-4"
          >
            Créer l'action
          </button>
        </div>
      </Modal>

      <TaskRunnerModal
        isOpen={isRunnerOpen}
        onClose={() => setIsRunnerOpen(false)}
        title={currentTask.title}
        command={currentTask.command}
      />
    </div>
  );
};

export default Dashboard;
