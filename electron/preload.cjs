const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("ttsTwitchDesktop", {
  platform: process.platform,
  electronVersion: process.versions.electron,
});