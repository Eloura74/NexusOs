import React from "react";
import { Service } from "../types";
import { ExternalLink, Clock, Tag } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const [printerStatus, setPrinterStatus] = React.useState<any>(null);

  React.useEffect(() => {
    if (service.type === "KLIPPER" && service.status === "ONLINE") {
      const fetchStatus = () => {
        fetch(`http://localhost:5000/api/moonraker/${service.id}/status`)
          .then((res) => res.json())
          .then((data) => setPrinterStatus(data))
          .catch((err) => console.error("Moonraker fetch error", err));
      };

      fetchStatus();
      const interval = setInterval(fetchStatus, 3000); // Poll every 3s for smooth temp updates
      return () => clearInterval(interval);
    }
  }, [service.type, service.status, service.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "MAINTENANCE":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "OFFLINE":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const statusColor = getStatusColor(service.status);

  return (
    <div className="glass-panel p-5 hover:border-blue-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col h-full">
      {/* Background Glow Effect based on status */}
      {service.status === "OFFLINE" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      )}
      {service.type === "KLIPPER" && service.status === "ONLINE" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
            {service.name}
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          </h3>
          <div className="flex items-center space-x-2 mt-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}
            >
              {service.status}
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              {service.type}
            </span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded mb-1 border border-slate-800">
          {service.responseTime ? `${service.responseTime}ms` : "--"}
        </span>
      </div>

      {service.type === "KLIPPER" && printerStatus ? (
        <div className="mt-2 space-y-3 bg-slate-900/40 p-3 rounded-lg border border-white/5">
          {/* Progress Bar */}
          {printerStatus.print_stats?.state === "printing" && (
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 animate-pulse">
                  Impression en cours...
                </span>
                <span className="text-white font-mono">
                  {Math.round(printerStatus.progress * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${printerStatus.progress * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Temps */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex flex-col items-center bg-slate-800/50 p-1.5 rounded">
              <span className="text-slate-400 text-[10px]">BUSE</span>
              <span className="text-orange-400 font-bold">
                {Math.round(printerStatus.extruder?.temperature)}°C
              </span>
              <span className="text-slate-600 text-[9px]">
                / {Math.round(printerStatus.extruder?.target)}°C
              </span>
            </div>
            <div className="flex flex-col items-center bg-slate-800/50 p-1.5 rounded">
              <span className="text-slate-400 text-[10px]">PLATEAU</span>
              <span className="text-orange-400 font-bold">
                {Math.round(printerStatus.heater_bed?.temperature)}°C
              </span>
              <span className="text-slate-600 text-[9px]">
                / {Math.round(printerStatus.heater_bed?.target)}°C
              </span>
            </div>
          </div>

          {/* State */}
          <div className="text-[10px] text-center text-slate-500 pt-1">
            État:{" "}
            <span className="text-slate-300 uppercase">
              {printerStatus.print_stats?.state}
            </span>
          </div>
        </div>
      ) : (
        /* Default Description Display */
        service.description && (
          <p className="text-xs text-slate-400 mb-4 bg-slate-900/50 p-2 rounded border border-surface-highlight/50">
            {service.description}
          </p>
        )
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-2 border-t border-slate-800/50">
        <div className="flex gap-1.5">
          {(service.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="flex items-center bg-slate-800 px-1.5 py-0.5 rounded text-[10px]"
            >
              <Tag className="w-3 h-3 mr-1 opacity-50" /> {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center font-mono text-[10px]">
          <Clock className="w-3 h-3 mr-1" />
          {service.lastCheck}
        </div>
      </div>

      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
        aria-label={`Open ${service.name}`}
      />
    </div>
  );
};

export default ServiceCard;
