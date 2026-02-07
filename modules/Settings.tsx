import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";
import { useData } from "../context/DataContext";

const Settings: React.FC = () => {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState({
    serverName: "",
    dashboardUrl: "",
    theme: "dark",
    language: "fr",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        serverName: settings.serverName || "",
        dashboardUrl: settings.dashboardUrl || "",
        theme: settings.theme || "dark",
        language: settings.language || "fr",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(formData);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-slate-800 p-3 rounded-xl">
          <SettingsIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Paramètres Système</h1>
          <p className="text-slate-400">Configuration globale de NexusOS</p>
        </div>
      </div>

      <div className="glass-panel p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4">
          Général
        </h2>

        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Nom du Serveur
            </label>
            <input
              type="text"
              value={formData.serverName}
              onChange={(e) =>
                setFormData({ ...formData, serverName: e.target.value })
              }
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 focus:outline-none focus:bg-slate-900/80 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              URL Dashboard
            </label>
            <input
              type="text"
              value={formData.dashboardUrl}
              onChange={(e) =>
                setFormData({ ...formData, dashboardUrl: e.target.value })
              }
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 focus:outline-none focus:bg-slate-900/80 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Thème
              </label>
              <select
                value={formData.theme}
                onChange={(e) =>
                  setFormData({ ...formData, theme: e.target.value })
                }
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 focus:outline-none focus:bg-slate-900/80 transition-all"
              >
                <option value="dark">Sombre</option>
                <option value="light">Clair (WIP)</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Langue
              </label>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 focus:outline-none focus:bg-slate-900/80 transition-all"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
