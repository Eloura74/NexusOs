import React from "react";
import { Terminal as TerminalIcon } from "lucide-react";

const Terminal: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 animate-fade-in">
      <div className="bg-slate-900/50 p-6 rounded-full mb-4 ring-1 ring-slate-800">
        <TerminalIcon className="w-12 h-12" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Terminal Web</h2>
      <p className="max-w-md text-center">
        Le module de terminal interactif (xterm.js + node-pty) est en cours
        d'intégration. Il permettra de contrôler le serveur directement depuis
        cette interface.
      </p>
    </div>
  );
};

export default Terminal;
