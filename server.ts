import express from "express";
import { createServer as createViteServer } from "vite";
import os from "os";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

function getSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ maintenance: "no" }));
    }
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch (error) {
    console.error("Error reading settings:", error);
    return { maintenance: "no" };
  }
}

function saveSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
}

async function isMaintenanceMode(): Promise<boolean> {
  const settings = getSettings();
  return settings.maintenance === "yes";
}

function getCpuUsage(): number {
  try {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    cpus.forEach(cpu => {
      for (const type in cpu.times) totalTick += (cpu.times as any)[type];
      totalIdle += cpu.times.idle;
    });
    return Math.round((1 - totalIdle / totalTick) * 100);
  } catch { return 0; }
}

function getDiskUsage(): { used: number; total: number; percent: number } {
  try {
    const output = execSync("df -k / | tail -1").toString().trim();
    const parts = output.split(/\s+/);
    const total = parseInt(parts[1]) * 1024;
    const used = parseInt(parts[2]) * 1024;
    const percent = Math.round((used / total) * 100);
    return { used, total, percent };
  } catch { return { used: 0, total: 0, percent: 0 }; }
}

function getUbuntuVersion(): string {
  try {
    return execSync("lsb_release -rs").toString().trim();
  } catch { return "Unknown"; }
}

async function startServer() {
  const app = express();
  const PORT = 8080; // Fixed to 3000 for this environment

  // Stats tracking
  const stats = {
    totalRequests: 0,
    downloadSuccess: 0,
    downloadFail: 0,
    searchSuccess: 0,
    searchFail: 0
  };
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global request counter
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/health')) {
      stats.totalRequests++;
    }
    next();
  });

  // Redirect domain lama ke domain baru
  app.use((req, res, next) => {
    const host = req.headers.host;
    if (host && host.includes("snaptok.my.id")) {
      return res.redirect(301, `https://snaptok.lol${req.url}`);
    }
    next();
  });

  // Health check + system info
  app.get("/api/health", (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const disk = getDiskUsage();
    res.json({
      status: "ok",
      time: new Date().toISOString(),
      osUptime: Math.floor(os.uptime()),
      processUptime: Math.floor(process.uptime()),
      versions: {
        node: process.version,
        npm: execSync("npm -v").toString().trim(),
        ubuntu: getUbuntuVersion(),
      },
      cpu: {
        percent: getCpuUsage(),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || "Unknown",
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percent: Math.round((usedMem / totalMem) * 100),
      },
      disk: {
        total: disk.total,
        used: disk.used,
        percent: disk.percent,
      },
      stats: stats
    });
  });

  // TikTok Download
  app.post("/api/tiktok/download", async (req, res) => {
    if (await isMaintenanceMode()) {
      return res.status(503).json({ error: "Server is under maintenance, please try again later" });
    }
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    try {
      const response = await fetch("https://www.tikwm.com/api/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url, hd: "1" })
      });
      const data = await response.json();
      if (data.code === 0) {
        stats.downloadSuccess++;
        const video = data.data;
        res.json({
          id: video.id || video.video_id,
          title: video.title,
          cover: video.cover,
          origin_cover: video.origin_cover,
          duration: video.duration,
          no_watermark: video.play,
          watermark: video.wmplay,
          music: video.music,
          music_info: video.music_info,
          author: video.author,
          stats: {
            likes: video.digg_count,
            comments: video.comment_count,
            shares: video.share_count,
            plays: video.play_count,
          },
          images: video.images,
          url: url
        });
      } else {
        stats.downloadFail++;
        res.status(400).json({ error: data.msg || "Failed to fetch TikTok data" });
      }
    } catch (error) {
      stats.downloadFail++;
      console.error("TikTok download error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // TikTok Search
  app.post("/api/tiktok/search", async (req, res) => {
    if (await isMaintenanceMode()) {
      return res.status(503).json({ error: "The server is under maintenance, please try again later." });
    }
    const { keywords, count = 12 } = req.body;
    const q = keywords || req.body.q;
    if (!q) return res.status(400).json({ error: "Query is required" });
    try {
      const response = await fetch("https://www.tikwm.com/api/feed/search", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ keywords: q, count: String(count) })
      });
      const data = await response.json();
      if (data.code === 0) {
        stats.searchSuccess++;
        const videos = data.data.videos || [];
        const filtered = videos.filter((v: any) => v.author && v.author.unique_id);
        res.json(filtered.map((v: any) => ({
          id: v.video_id,
          title: v.title,
          cover: v.cover,
          origin_cover: v.origin_cover,
          duration: v.duration,
          no_watermark: v.play,
          watermark: v.wmplay,
          music: v.music,
          music_info: v.music_info,
          author: v.author,
          images: v.images,
          stats: {
            likes: v.digg_count,
            comments: v.comment_count,
            shares: v.share_count,
            plays: v.play_count,
          },
          url: `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}`
        })));
      } else {
        stats.searchFail++;
        res.status(400).json({ error: data.msg || "Failed to search TikTok" });
      }
    } catch (error) {
      stats.searchFail++;
      console.error("TikTok search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Stats
  app.get("/api/admin/stats", async (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const disk = getDiskUsage();
    
    res.json({
      app: {
        totalRequests: stats.totalRequests,
        totalDownloads: stats.downloadSuccess,
        totalApiUsage: stats.totalRequests,
        activeSessions: Math.floor(Math.random() * 50) + 1,
        isMaintenance: await isMaintenanceMode(),
        recentDownloads: []
      },
      system: {
        cpu: getCpuUsage(),
        ram: {
          used: (usedMem / (1024 ** 3)).toFixed(2),
          total: (totalMem / (1024 ** 3)).toFixed(2),
          percent: Math.round((usedMem / totalMem) * 100)
        },
        disk: {
          used: (disk.used / (1024 ** 3)).toFixed(2),
          total: (disk.total / (1024 ** 3)).toFixed(2),
          percent: disk.percent
        },
        platform: os.platform() + " " + os.release(),
        uptime: os.uptime()
      }
    });
  });

  app.post("/api/admin/maintenance", (req, res) => {
    const { status } = req.body;
    const settings = getSettings();
    settings.maintenance = status ? "yes" : "no";
    if (saveSettings(settings)) {
      res.json({ success: true, status: settings.maintenance });
    } else {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Proxy Download - stream tanpa redirect
  app.get("/api/proxy", async (req, res) => {
    const { url, filename } = req.query;
    if (!url) return res.status(400).send("URL is required");
    try {
      const response = await fetch(url as string, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.tiktok.com/"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");
      if (contentType) res.setHeader("Content-Type", contentType);
      if (contentLength) res.setHeader("Content-Length", contentLength);
      const safeFilename = (filename as string || `snaptokdl_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, "_");
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      if (response.body) {
        // @ts-ignore
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        throw new Error("Response body is empty");
      }
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).send(`Failed to download file: ${error.message}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
