import React from "react";
import { useData } from "../context/DataContext";
import ServiceCard from "../components/ServiceCard";
import {
  Activity,
  AlertCircle,
  Cpu,
  Server,
  CheckCircle,
  ArrowRight,
  HardDrive,
  Box,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  const { services, logs, systemStats, checkServices } = useData();

  const criticalServices = services.filter(
    (s) => s.status === "OFFLINE" || s.status === "UNKNOWN",
  );
  const healthyServices = services.filter(
    (s) => s.status === "ONLINE" || s.status === "MAINTENANCE",
  );

  return (
    <div className="space-y-8 animate-fade-in">
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Colonne Gauche : Grille de Services */}
        <div className="xl:col-span-2 space-y-6">
          {criticalServices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> Attention Requise
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500/50" />{" "}
                Services Monitorés
              </h2>
              <button
                onClick={() => checkServices()}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors flex items-center"
                title="Scanner les services maintenant"
              >
                <Activity className="w-3 h-3 mr-1" /> Scan
              </button>
            </div>
            <span className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded font-mono">
              {healthyServices.length}/{services.length} OK
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthyServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
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
                  <AreaChart data={CHART_DATA}>
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
                    <Area
                      type="monotone"
                      dataKey="load"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCpu)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs">
                  Chargement des métriques...
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
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
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
    </div>
  );
};

export default Dashboard;
