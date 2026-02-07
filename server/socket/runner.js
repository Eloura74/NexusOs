import os from "os";
import pty from "node-pty";

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

export const setupRunnerSocket = (io) => {
  const runnerNamespace = io.of("/runner");

  runnerNamespace.on("connection", (socket) => {
    let ptyProcess = null;

    socket.on("start-task", (command) => {
      if (ptyProcess) {
        ptyProcess.kill();
      }

      console.log(`🚀 Starting Task: ${command}`);
      socket.emit(
        "output",
        `\r\n\x1b[36m> Executing: ${command}\x1b[0m\r\n\r\n`,
      );

      // Spawn process
      // We use the shell to execute the command string
      ptyProcess = pty.spawn(shell, ["/c", command], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env,
        useConpty: false, // Fix for "AttachConsole failed"
      });

      ptyProcess.onData((data) => {
        socket.emit("output", data);
      });

      ptyProcess.onExit(({ exitCode }) => {
        console.log(`🏁 Task Finished with code ${exitCode}`);
        socket.emit(
          "output",
          `\r\n\x1b[${exitCode === 0 ? "32" : "31"}m> Process exited with code ${exitCode}\x1b[0m\r\n`,
        );
        socket.emit("task-exit", exitCode);
        ptyProcess = null;
      });
    });

    socket.on("stop-task", () => {
      if (ptyProcess) {
        ptyProcess.kill();
        socket.emit(
          "output",
          "\r\n\x1b[31m> Process terminated by user.\x1b[0m\r\n",
        );
        ptyProcess = null;
      }
    });

    socket.on("disconnect", () => {
      if (ptyProcess) {
        ptyProcess.kill();
      }
    });
  });
};
