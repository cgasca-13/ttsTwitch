const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");
const { startTtsBackend } = require("./tts-backend.cjs");

const DEFAULT_URL = "http://127.0.0.1:3000";
const STATIC_HOST = "127.0.0.1";
const STATIC_PORT = Number(process.env.ELECTRON_STATIC_PORT || 3067);

let staticServerInstance;
let ttsBackendInstance;

function getMimeType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".ico":
      return "image/x-icon";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

function startStaticServer() {
  const outDirectory = path.join(app.getAppPath(), "out");

  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      try {
        const requestUrl = new URL(request.url || "/", `http://${STATIC_HOST}:${STATIC_PORT}`);
        const decodedPath = decodeURIComponent(requestUrl.pathname);
        const normalizedPath = decodedPath === "/" ? "/index.html" : decodedPath;
        const candidatePath = path.join(outDirectory, normalizedPath);

        let filePath = candidatePath;

        if (!filePath.startsWith(outDirectory)) {
          response.writeHead(403);
          response.end("Forbidden");
          return;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, "index.html");
        }

        if (!fs.existsSync(filePath)) {
          const directoryIndex = path.join(outDirectory, normalizedPath, "index.html");

          if (fs.existsSync(directoryIndex)) {
            filePath = directoryIndex;
          } else {
            const fallbackIndex = path.join(outDirectory, "index.html");

            if (fs.existsSync(fallbackIndex)) {
              filePath = fallbackIndex;
            } else {
              response.writeHead(404);
              response.end("Not found");
              return;
            }
          }
        }

        const fileContent = fs.readFileSync(filePath);
        response.writeHead(200, {
          "Content-Type": getMimeType(filePath),
        });
        response.end(fileContent);
      } catch (error) {
        response.writeHead(500);
        response.end("Internal server error");
      }
    });

    server.once("error", reject);
    server.listen(STATIC_PORT, STATIC_HOST, () => {
      resolve({
        server,
        url: `http://${STATIC_HOST}:${STATIC_PORT}`,
      });
    });
  });
}

function createWindow() {
  const startUrl = process.env.ELECTRON_START_URL || DEFAULT_URL;
  const ttsApiBaseUrl = process.env.ELECTRON_TTS_API_URL || "";

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    additionalArguments: ttsApiBaseUrl ? [`--tts-api-base-url=${ttsApiBaseUrl}`] : [],
  });

  mainWindow.removeMenu();

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  ttsBackendInstance = await startTtsBackend(Number(process.env.ELECTRON_TTS_PORT || 0));
  process.env.ELECTRON_TTS_API_URL = ttsBackendInstance.url;

  if (!process.env.ELECTRON_START_URL) {
    staticServerInstance = await startStaticServer();
    process.env.ELECTRON_START_URL = staticServerInstance.url;
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (ttsBackendInstance?.server) {
    ttsBackendInstance.server.close();
  }

  if (staticServerInstance?.server) {
    staticServerInstance.server.close();
  }
});