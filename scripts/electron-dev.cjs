const { spawn } = require("child_process");
const http = require("http");
const net = require("net");

const host = process.env.ELECTRON_HOST || "127.0.0.1";
const STATIC_PORT = Number(process.env.ELECTRON_STATIC_PORT || 3067);
const preferredPort = Number(process.env.ELECTRON_PORT || 3000);

let serverProcess;
let electronProcess;
let shuttingDown = false;

function waitForServer(url, attempts = 120, delayMs = 500) {
  return new Promise((resolve, reject) => {
    const check = (remainingAttempts) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (remainingAttempts <= 0) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }

        setTimeout(() => check(remainingAttempts - 1), delayMs);
      });
    };

    check(attempts);
  });
}

function findFreePort(startPort, attempts = 20) {
  return new Promise((resolve, reject) => {
    const tryPort = (port, remainingAttempts) => {
      const tester = net.createServer();

      tester.once("error", () => {
        tester.close();

        if (remainingAttempts <= 1) {
          reject(new Error(`No free port found starting from ${startPort}`));
          return;
        }

        tryPort(port + 1, remainingAttempts - 1);
      });

      tester.once("listening", () => {
        tester.close(() => resolve(port));
      });

      tester.listen(port, host);
    };

    tryPort(startPort, attempts);
  });
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (electronProcess && !electronProcess.killed) {
    electronProcess.kill();
  }

  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

findFreePort(preferredPort)
  .then((port) => {
    const startUrl = `http://${host}:${port}`;

    serverProcess = spawn(
      "npm",
      ["run", "dev", "--", "--hostname", host, "--port", String(port)],
      {
        stdio: "inherit",
        shell: true,
        env: process.env,
      }
    );

    serverProcess.on("exit", (code) => {
      if (!electronProcess) {
        process.exit(code ?? 0);
        return;
      }

      shutdown(code ?? 0);
    });

    return waitForServer(startUrl).then(() => ({ startUrl }));
  })
  .then(({ startUrl }) => {
    electronProcess = spawn("electron", ["."], {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        ELECTRON_START_URL: startUrl,
      },
    });

    electronProcess.on("exit", (code) => {
      shutdown(code ?? 0);
    });
  })
  .catch((error) => {
    console.error(error.message);
    shutdown(1);
  });