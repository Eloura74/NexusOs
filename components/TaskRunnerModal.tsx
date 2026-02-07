import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import io, { Socket } from "socket.io-client";
import { X, Play, Square, Loader2 } from "lucide-react";
import "xterm/css/xterm.css";

interface TaskRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  command: string;
  title: string;
}

const TaskRunnerModal: React.FC<TaskRunnerModalProps> = ({
  isOpen,
  onClose,
  command,
  title,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const termRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize Terminal & Socket when modal opens
  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    // 1. Setup XTerm
    const term = new XTerminal({
      cursorBlink: false,
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace",
      theme: {
        background: "#0f172a",
        foreground: "#f8fafc",
      },
      disableStdin: true, // Read-only for now
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);

    requestAnimationFrame(() => {
      fitAddon.fit();
    });

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // 2. Setup Socket
    const socket = io("http://localhost:5000/runner");
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsRunning(true);
      socket.emit("start-task", command);
    });

    socket.on("output", (data) => {
      term.write(data);
    });

    socket.on("task-exit", (code) => {
      setIsRunning(false);
      term.write(
        `\r\n\x1b[33m--- Task finished with code ${code} ---\x1b[0m\r\n`,
      );
    });

    return () => {
      socket.disconnect();
      term.dispose();
    };
  }, [isOpen, command]);

  if (!isOpen) return null;

  const handleStop = () => {
    socketRef.current?.emit("stop-task");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[80vh] rounded-xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isRunning ? "animate-pulse bg-amber-500/20 text-amber-500" : "bg-slate-700 text-slate-400"}`}
            >
              {isRunning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400 font-mono">{command}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isRunning && (
              <button
                onClick={handleStop}
                className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold flex items-center transition-colors"
              >
                <Square className="w-3 h-3 mr-2" fill="currentColor" />
                STOP
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Terminal Area */}
        <div className="flex-1 p-2 bg-slate-950 overflow-hidden relative">
          <div ref={terminalRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default TaskRunnerModal;
