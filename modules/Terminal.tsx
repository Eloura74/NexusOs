import React, { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import io, { Socket } from "socket.io-client";
import "xterm/css/xterm.css";
import { Terminal as TerminalIcon } from "lucide-react";

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
      try {
        fitAddon.fit();
      } catch (e) {
        console.error("Fit error:", e);
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

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
      <div className="absolute top-4 right-4 z-10 opacity-50 pointer-events-none">
        <TerminalIcon className="w-12 h-12 text-slate-700" />
      </div>
      <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl p-2 relative">
        <div
          ref={terminalRef}
          className="w-full h-full"
          style={{ minHeight: "600px" }} // Force height
        />
      </div>
    </div>
  );
};

export default Terminal;
