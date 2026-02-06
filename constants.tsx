import { Service, Project, DocEntry, LogEntry } from "./types";

export const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    name: "Proxmox Node 01",
    url: "https://192.168.1.10:8006",
    status: "OK",
    category: "INFRA",
    tags: ["hyperviseur", "core"],
    uptime: "45j 12h",
    lastCheck: "il y a 10s",
  },
  {
    id: "2",
    name: "TrueNAS Scale",
    url: "https://192.168.1.15",
    status: "OK",
    category: "INFRA",
    tags: ["stockage", "zfs"],
    uptime: "12j 4h",
    lastCheck: "il y a 10s",
  },
  {
    id: "3",
    name: "Home Assistant",
    url: "http://ha.local:8123",
    status: "WARN",
    description: "Latence Zigbee élevée",
    category: "IOT",
    tags: ["domotique", "automatisation"],
    uptime: "2j 1h",
    lastCheck: "il y a 1m",
  },
  {
    id: "4",
    name: "Voron 2.4 (Mainsail)",
    url: "http://mainsail.local",
    status: "CRIT",
    description: "Défaut de chauffe détecté",
    category: "3DPRINT",
    tags: ["klipper", "impression"],
    uptime: "4h",
    lastCheck: "Maintenant",
  },
  {
    id: "5",
    name: "Portainer",
    url: "https://portainer.local",
    status: "OK",
    category: "DEV",
    tags: ["docker", "gestion"],
    uptime: "30j",
    lastCheck: "il y a 5m",
  },
  {
    id: "6",
    name: "Ollama API",
    url: "http://llm.local:11434",
    status: "OK",
    category: "DEV",
    tags: ["ia", "inference"],
    uptime: "1j 2h",
    lastCheck: "il y a 2m",
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Nexus OS Dashboard",
    status: "ACTIVE",
    repoUrl: "github.com/user/nexus-os",
    description:
      "Construction de la V1 du tableau de bord centralisé pour le homelab.",
    progress: 75,
    tags: ["react", "typescript", "ui"],
    lastUpdate: "il y a 2 heures",
  },
  {
    id: "p2",
    name: "Upgrade Voron Stealthburner",
    status: "ON_HOLD",
    description: "En attente des pièces venant de ChaoticLab.",
    progress: 30,
    tags: ["hardware", "3dprint"],
    lastUpdate: "il y a 3 jours",
  },
  {
    id: "p3",
    name: "Moniteur Énergie Maison",
    status: "PLANNING",
    description:
      "Moniteur ESP32 avec pince ampèremétrique pour le disjoncteur principal.",
    progress: 0,
    tags: ["iot", "esp32"],
    lastUpdate: "il y a 1 semaine",
  },
];

export const MOCK_DOCS: DocEntry[] = [
  {
    id: "d1",
    title: "Récupération Klipper après Erreur MCU",
    category: "3DPRINT",
    tags: ["dépannage", "runbook"],
    isRunbook: true,
    lastUpdated: "25/10/2023",
    contentSnippet:
      "1. Vérifier la connexion USB. 2. Redémarrer le service Klipper `sudo service klipper restart`...",
  },
  {
    id: "d2",
    title: "Configuration Nginx Proxy Manager",
    category: "INFRA",
    tags: ["réseau", "config"],
    isRunbook: false,
    lastUpdated: "12/09/2023",
    contentSnippet:
      "Configuration standard pour les certificats wildcard utilisant le challenge DNS...",
  },
  {
    id: "d3",
    title: "Bonnes Pratiques Docker Compose",
    category: "DEV",
    tags: ["standards"],
    isRunbook: false,
    lastUpdated: "01/11/2023",
    contentSnippet:
      "Toujours verrouiller les versions des images. Utiliser des fichiers .env pour les secrets...",
  },
];

export const MOCK_LOGS: LogEntry[] = [
  {
    id: "l1",
    timestamp: "10:42",
    level: "ERROR",
    message: "Voron 2.4: Erreur ADC sur la tête d'impression",
    source: "Moonraker",
  },
  {
    id: "l2",
    timestamp: "10:40",
    level: "INFO",
    message: "Sauvegarde terminée avec succès",
    source: "TrueNAS",
  },
  {
    id: "l3",
    timestamp: "09:15",
    level: "WARN",
    message: "Utilisation CPU élevée détectée (92%)",
    source: "Proxmox Node 01",
  },
  {
    id: "l4",
    timestamp: "08:00",
    level: "SUCCESS",
    message: "Mise à jour système quotidienne terminée",
    source: "Système",
  },
];
