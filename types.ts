export interface Service {
  id: string;
  name: string;
  type: "PRINTER" | "NAS" | "HOME_ASSISTANT" | "SERVER" | "OTHER";
  url: string;
  icon?: string;
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "UNKNOWN";
  lastCheck: string;
  responseTime?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
  progress: number;
  tags: string[];
  repoUrl?: string;
  lastUpdate: string;
  githubStats?: {
    stars: number;
    forks: number;
    issues: number;
  };
}

export interface DocEntry {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  tags: string[];
  contentSnippet: string;
  isRunbook?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR";
  message: string;
  source: string;
}

export interface SystemStats {
  cpu: {
    load: number;
    cores: number;
    temp: number | string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  os: {
    platform: string;
    distro: string;
    hostname: string;
  };
  docker: {
    count: number;
    containers: any[];
  };
}
