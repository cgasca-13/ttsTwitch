const { spawn } = require("child_process");

const electronProcess = spawn("electron", ["."], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.on("SIGINT", () => {
  if (!electronProcess.killed) {
    electronProcess.kill();
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (!electronProcess.killed) {
    electronProcess.kill();
  }
  process.exit(0);
});

electronProcess.on("exit", (code) => {
  process.exit(code ?? 0);
});