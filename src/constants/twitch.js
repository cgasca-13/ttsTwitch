/**
 * Configuración del bot de Twitch
 */
export const TWITCH_CONFIG = {
  BOT_USERNAME: process.env.BOT_USERNAME,
  BOT_PASSWORD: process.env.BOT_PASSWORD,
};

/**
 * Comandos disponibles
 */
export const COMMANDS = {
  TTS: '!tts',
};

/**
 * Configuración por defecto de permisos
 */
export const DEFAULT_PERMISSIONS = {
  allowMod: true,
  allowVip: true,
  allowSub: true,
  allowBroadcaster: true,
  allowEveryone: false,
};
