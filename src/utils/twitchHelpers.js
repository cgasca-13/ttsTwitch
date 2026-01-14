/**
 * Verifica si un usuario tiene permisos para usar TTS
 * @param {object} tags - Tags del mensaje de Twitch
 * @param {string} channel - Nombre del canal
 * @param {object} permissions - Objeto con permisos habilitados
 * @returns {boolean} - True si el usuario tiene permiso
 */
export const checkUserPermissions = (tags, channel, permissions) => {
  const isMod = tags.mod || (tags.badges && tags.badges.moderator === '1');
  const isVip = tags.badges && tags.badges.vip === '1';
  const isSub = tags.subscriber;
  const isBroadcaster = channel.slice(1) === tags.username;

  return (
    permissions.allowEveryone ||
    (isMod && permissions.allowMod) ||
    (isVip && permissions.allowVip) ||
    (isSub && permissions.allowSub) ||
    (isBroadcaster && permissions.allowBroadcaster)
  );
};

/**
 * Obtiene el rol más alto del usuario
 * @param {object} tags - Tags del mensaje de Twitch
 * @param {string} channel - Nombre del canal
 * @returns {string} - Rol del usuario
 */
export const getUserRole = (tags, channel) => {
  if (channel.slice(1) === tags.username) return 'Broadcaster';
  if (tags.mod || (tags.badges && tags.badges.moderator === '1')) return 'Moderator';
  if (tags.badges && tags.badges.vip === '1') return 'VIP';
  if (tags.subscriber) return 'Subscriber';
  return 'Viewer';
};
