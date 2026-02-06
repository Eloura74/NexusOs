import express from "express";
import si from "systeminformation";

const router = express.Router();

// @route   GET /api/system
// @desc    Get real-time system stats (CPU, RAM, Docker, Printers)
router.get("/", async (req, res) => {
  try {
    // Exécution parallèle des requêtes système pour la performance
    const [cpu, mem, os, docker, disk, network, printer] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
      si.dockerContainerStats(),
      si.fsSize(),
      si.networkStats(),
      si.printer(),
    ]);

    const activeInterface =
      network.find((iface) => iface.operstate === "up") || network[0];

    const systemData = {
      status: "ONLINE",
      timestamp: new Date().toISOString(),
      cpu: {
        load: Math.round(cpu.currentLoad),
        cores: cpu.cpus.length,
        speed: cpu.avgLoad,
        temp: cpu.main || "N/A", // Température (peut nécessiter privilèges admin)
      },
      memory: {
        total: mem.total,
        used: mem.active,
        free: mem.available,
        percent: Math.round((mem.active / mem.total) * 100),
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        hostname: os.hostname,
        arch: os.arch,
      },
      docker: {
        count: docker.length,
        containers: docker.map((c) => ({
          id: c.id,
          name: c.name,
          image: c.image,
          state: c.state,
          mem_percent: c.mem_percent,
          cpu_percent: c.cpu_percent,
        })),
      },
      disk: disk.map((d) => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        percent: d.use,
      })),
      network: {
        iface: activeInterface ? activeInterface.iface : "N/A",
        rx_sec: activeInterface ? activeInterface.rx_sec : 0,
        tx_sec: activeInterface ? activeInterface.tx_sec : 0,
      },
      printers: printer.map((p) => ({
        name: p.name,
        status: p.status,
        default: p.default,
      })),
    };

    res.json(systemData);
  } catch (error) {
    console.error("Error fetching system data:", error);
    // On renvoie quand même une réponse partielle ou une erreur formatée
    res.status(500).json({
      error: "Failed to fetch system metrics",
      details: error.message,
    });
  }
});

export default router;
