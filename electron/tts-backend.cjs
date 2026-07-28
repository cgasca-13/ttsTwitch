const http = require("http");
const { URL } = require("url");
const { EdgeTTS, listVoicesUniversal } = require("edge-tts-universal");

const HOST = "127.0.0.1";

let cachedVoices = null;
let cachedVoicesAt = 0;

function getJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  response.end(JSON.stringify(payload));
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeVoice(voice) {
  const shortName = voice.ShortName || voice.Name || "";
  const friendlyName = voice.FriendlyName || shortName;
  const locale = voice.Locale || "";

  return {
    id: shortName,
    name: friendlyName,
    shortName,
    lang: locale,
    locale,
    gender: voice.Gender || "",
    friendlyName,
    localService: false,
    provider: "edge",
  };
}

async function getVoices() {
  const now = Date.now();
  if (cachedVoices && now - cachedVoicesAt < 24 * 60 * 60 * 1000) {
    return cachedVoices;
  }

  const voices = await listVoicesUniversal();
  cachedVoices = voices.map(normalizeVoice);
  cachedVoicesAt = now;
  return cachedVoices;
}

async function createAudioBuffer(text, voice, rate, pitch, volume) {
  const synthesis = new EdgeTTS(text, voice, {
    rate,
    pitch,
    volume,
  });
  const result = await synthesis.synthesize();
  return Buffer.from(await result.audio.arrayBuffer());
}

function startTtsBackend(port = 0) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (request, response) => {
      try {
        setCorsHeaders(response);

        if (request.method === "OPTIONS") {
          response.writeHead(204);
          response.end();
          return;
        }

        const requestUrl = new URL(request.url || "/", `http://${HOST}`);

        if (request.method === "GET" && requestUrl.pathname === "/health") {
          sendJson(response, 200, { ok: true });
          return;
        }

        if (request.method === "GET" && requestUrl.pathname === "/voices") {
          const voices = await getVoices();
          sendJson(response, 200, { voices });
          return;
        }

        if (request.method === "POST" && requestUrl.pathname === "/speak") {
          const body = await getJsonBody(request);
          const text = String(body.text || "").trim();

          if (!text) {
            sendJson(response, 400, { error: "text is required" });
            return;
          }

          const audioBuffer = await createAudioBuffer(
            text,
            body.voice || undefined,
            body.rate || "+0%",
            body.pitch || "+0Hz",
            body.volume || "+0%"
          );

          response.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.length,
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          });
          response.end(audioBuffer);
          return;
        }

        sendJson(response, 404, { error: "Not found" });
      } catch (error) {
        sendJson(response, 500, {
          error: error instanceof Error ? error.message : "Internal server error",
        });
      }
    });

    server.once("error", reject);
    server.listen(port, HOST, () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        reject(new Error("Unable to determine TTS backend port"));
        return;
      }

      resolve({
        server,
        url: `http://${HOST}:${address.port}`,
      });
    });
  });
}

module.exports = {
  startTtsBackend,
};