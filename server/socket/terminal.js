import os from "os";
import pty from "node-pty";

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

export const setupTerminalSocket = (io) => {
  const terminalNamespace = io.of("/terminal");

  terminalNamespace.on("connection", (socket) => {
    console.log(`🔌 Terminal Connected: ${socket.id}`);

    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: process.env.HOME || process.cwd(),
      env: process.env,
      useConpty: false, // Fix for "AttachConsole failed" on some Windows setups
    });

    // Send data from PTY to Client
    ptyProcess.onData((data) => {
      socket.emit("output", data);
    });

    // Receive data from Client to PTY
    socket.on("input", (data) => {
      ptyProcess.write(data);
    });

    // Handle Resize
    socket.on("resize", ({ cols, rows }) => {
      try {
        ptyProcess.resize(cols, rows);
      } catch (err) {
        console.error("Resize error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Terminal Disconnected: ${socket.id}`);
      ptyProcess.kill();
    });
  });
};
