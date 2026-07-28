const { contextBridge } = require("electron");

const ttsArgPrefix = "--tts-api-base-url=";
const ttsArg = process.argv.find((arg) => arg.startsWith(ttsArgPrefix));
const ttsApiBaseUrl = ttsArg ? ttsArg.slice(ttsArgPrefix.length) : (process.env.ELECTRON_TTS_API_URL || null);

contextBridge.exposeInMainWorld("ttsTwitchDesktop", {
  platform: process.platform,
  electronVersion: process.versions.electron,
  ttsApiBaseUrl,
});