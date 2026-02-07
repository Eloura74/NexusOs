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
      status: "UNKNOWN",
      lastCheck: "Jamais",
      responseTime: 0,
    } as any);

    setIsServiceModalOpen(false);
    setNewService({ name: "", type: "OTHER", url: "http://", icon: "Box" });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Statistiques d'en-tête (Données Réelles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Services Totaux / OS Info */}
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex items-center space-x-4 shadow-sm hover:border-primary/30 transition-colors">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-white truncate max-w-[150px]">
              {systemStats?.os.hostname || "Loading..."}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {systemStats?.os.distro || "Système"}
            </div>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex items-center space-x-4 shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white">
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
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex items-center space-x-4 shadow-sm hover:border-green-500/30 transition-colors">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white">
              {systemStats ? `${systemStats.cpu.load}%` : "--%"}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              CPU Load
            </div>
          </div>
        </div>

        {/* Docker Containers */}
        <div className="bg-surface border border-surface-highlight rounded-xl p-4 flex items-center space-x-4 shadow-sm hover:border-orange-500/30 transition-colors">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white">
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
          <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary" />
              Charge Système (15m)
            </h3>
            <div className="h-[200px] w-full min-w-[300px]">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="load"
                      stroke="#3B82F6"
                      strokeWidth={2}
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
          <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Terminal className="w-5 h-5 mr-2 text-primary" />
                Actions Rapides
              </h3>
              <button
                onClick={() => setIsCommandModalOpen(true)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                title="Ajouter une commande"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {commands
                .filter((c) => c.type === "dashboard")
                .map((cmd) => (
                  <div key={cmd._id} className="relative group">
                    <button
                      onClick={() => runTask(cmd.label, cmd.command)}
                      className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex flex-col items-center justify-center transition-all border border-slate-700 hover:border-primary/50"
                    >
                      <Terminal className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-300">
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
                <div className="col-span-2 text-center text-xs text-slate-500 py-4 border border-dashed border-slate-700 rounded-xl">
                  Aucune action configurée.
                </div>
              )}
            </div>
          </div>
          {/* Logs Rapides */}
          <div className="bg-surface border border-surface-highlight rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-surface-highlight flex justify-between items-center bg-slate-900/50">
              <h3 className="text-slate-100 font-medium text-sm">
                Activité Récente
              </h3>
              <span className="text-[10px] text-green-500 font-mono bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                LIVE
              </span>
            </div>
            <div className="divide-y divide-slate-800">
              {logs.slice(0, 5).map((log, index) => (
                <div
                  key={log.id || index}
                  className="p-3 text-sm hover:bg-slate-800/50 transition-colors group cursor-default"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`
                      text-[10px] font-bold px-1.5 py-0.5 rounded border
                      ${
                        log.level === "ERROR"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : log.level === "WARN"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : log.level === "SUCCESS"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }
                    `}
                    >
                      {log.level}
                    </span>
                    <span className="text-[10px] text-slate-600 group-hover:text-slate-400 font-mono transition-colors">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed truncate group-hover:whitespace-normal transition-all">
                    {log.message}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1 font-mono flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-1.5"></span>
                    {log.source}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-2 bg-slate-900/50 text-center border-t border-surface-highlight">
              <button className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center justify-center w-full py-1">
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
                <option value="PRINTER">Imprimante 3D</option>
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
