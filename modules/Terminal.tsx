import React, { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import io, { Socket } from "socket.io-client";
import "xterm/css/xterm.css";
import { Terminal as TerminalIcon } from "lucide-react";
import { useData } from "../context/DataContext";

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const termRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // 1. Initialize Terminal
    const term = new XTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      theme: {
        background: "#0f172a", // Slate-900
        foreground: "#f8fafc", // Slate-50
        cursor: "#38bdf8", // Primary Cyan
        selectionBackground: "#334155",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);

    // Fit needs DOM dimensions, wait for next frame
    requestAnimationFrame(() => {
      if (terminalRef.current && terminalRef.current.offsetParent) {
        try {
          fitAddon.fit();
        } catch (e) {
          console.error("Fit error:", e);
        }
      }
    });

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // 2. Connect to Socket
    const socket = io("http://localhost:5000/terminal");
    socketRef.current = socket;

    socket.on("connect", () => {
      term.write("\r\n\x1b[32m🔌 Connected to NexusOS Terminal\x1b[0m\r\n");
    });

    socket.on("output", (data) => {
      term.write(data);
    });

    socket.on("disconnect", () => {
      term.write(
        "\r\n\x1b[31m🔌 Disconnected from NexusOS Terminal\x1b[0m\r\n",
      );
    });

    // 3. Handle Input
    term.onData((data) => {
      socket.emit("input", data);
    });

    // 4. Handle Resize
    const handleResize = () => {
      if (!termRef.current || !fitAddonRef.current) return;

      fitAddonRef.current.fit();
      const dims = {
        cols: termRef.current.cols,
        rows: termRef.current.rows,
      };
      socket.emit("resize", dims);
    };

    window.addEventListener("resize", handleResize);
    // Initial resize to sync backend
    setTimeout(handleResize, 100);

    // Cleanup
    return () => {
      socket.disconnect();
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Command Management
  const { commands } = useData();

  return (
    <div className="h-full flex animate-fade-in gap-4">
      {/* Terminal Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-4 z-10 opacity-50 pointer-events-none">
          <TerminalIcon className="w-12 h-12 text-slate-700" />
        </div>
        <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl p-2 relative">
          <div
            ref={terminalRef}
            className="w-full h-full"
            style={{ minHeight: "600px" }}
          />
        </div>
      </div>

      {/* Sidebar Snippets */}
      <div className="w-64 bg-surface border border-surface-highlight rounded-xl p-4 flex flex-col">
        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">
          Snippets
        </h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {commands
            .filter((c) => c.type === "terminal")
            .map((cmd) => (
              <button
                key={cmd._id}
                onClick={() => {
                  console.log("Sending command:", cmd.command);
                  if (socketRef.current) {
                    socketRef.current.emit("input", cmd.command + "\r");
                    termRef.current?.focus();
                  } else {
                    console.error("Socket not connected");
                  }
                }}
                className="w-full text-left p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-500 transition-all group"
              >
                <div className="font-bold text-slate-300 text-xs mb-1 group-hover:text-white">
                  {cmd.label}
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate">
                  {cmd.command}
                </div>
              </button>
            ))}
          {commands.filter((c) => c.type === "terminal").length === 0 && (
            <div className="text-center text-xs text-slate-600 py-8 italic">
              Aucun snippet.
              <br />
              Ajoutez-en via le Dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
