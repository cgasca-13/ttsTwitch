/**
 * Componente de checkboxes para permisos de TTS
 */
export const PermissionsCheckbox = ({ permissions, onPermissionChange }) => {
  const permissionsList = [
    { id: 'mod', label: 'Moderador', key: 'allowMod' },
    { id: 'vip', label: 'VIP', key: 'allowVip' },
    { id: 'sub', label: 'Suscriptor', key: 'allowSub' },
    { id: 'broadcaster', label: 'Streamer', key: 'allowBroadcaster' },
    { id: 'everyone', label: 'Todos', key: 'allowEveryone' },
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Permisos para usar TTS:
      </label>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {permissionsList.map(({ id, label, key }) => (
          <div key={id} className="flex items-center">
            <input 
              type="checkbox" 
              id={id}
              checked={permissions[key]}
              onChange={(e) => onPermissionChange(key, e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor={id} className="dark:text-white text-gray-800 cursor-pointer">
              {label}
            </label>
          </div>
        ))}
      </div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Nota: El Streamer también cuenta como Sub, por lo que si se permite a los Suscriptores, el Streamer también podrá usar TTS.
      </label>
    </div>
  );
};
