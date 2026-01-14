import { useEffect } from 'react';
import tmi from 'tmi.js';
import { checkUserPermissions } from '../utils/twitchHelpers';
import { TWITCH_CONFIG } from '../constants/twitch';

/**
 * Hook para conectar y manejar el chat de Twitch
 * @param {string} channel - Nombre del canal
 * @param {Function} onMessage - Callback cuando llega un mensaje TTS válido
 * @param {object} permissions - Objeto con permisos habilitados
 */
export const useTwitchChat = (channel, onMessage, permissions) => {
  useEffect(() => {
    if (!channel) return;

    const client = new tmi.Client({
      options: { debug: false },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: TWITCH_CONFIG.BOT_USERNAME,
        password: TWITCH_CONFIG.BOT_PASSWORD,
      },
      channels: [channel],
    });

    client.connect().catch(console.error);

    const handleMessage = (channel, tags, message, self) => {
      if (self) return;

      const hasPermission = checkUserPermissions(tags, channel, permissions);

      if (message.startsWith('!tts') && hasPermission) {
        const content = message.replace('!tts', '').trim();
        if (content) {
          onMessage(content);
        }
      }
    };

    client.on('message', handleMessage);

    return () => {
      client.off('message', handleMessage);
      client.disconnect();
    };
  }, [channel, onMessage, permissions]);
};
