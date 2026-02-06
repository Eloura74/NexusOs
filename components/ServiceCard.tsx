import React from "react";
import { Service } from "../types";
import { ExternalLink, Clock, Tag } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
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
    <div className="bg-surface border border-surface-highlight rounded-xl p-5 hover:border-slate-500 transition-all duration-200 group relative overflow-hidden">
      {/* Background Glow Effect based on status */}
      {service.status === "OFFLINE" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
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

      {service.description && (
        <p className="text-xs text-slate-400 mb-4 bg-slate-900/50 p-2 rounded border border-surface-highlight/50">
          {service.description}
        </p>
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
