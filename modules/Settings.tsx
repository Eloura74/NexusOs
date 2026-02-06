import React from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";

const Settings: React.FC = () => {
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

      <div className="card-surface space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-surface-highlight pb-4">
          Général
        </h2>

        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Nom du Serveur
            </label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
              defaultValue="NexusOS-Core"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              URL Dashboard
            </label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary/50 focus:outline-none"
              defaultValue="http://localhost:3000"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
