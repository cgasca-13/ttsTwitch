"use client";
import { useState, useCallback } from "react";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useTTS } from "../../hooks/useTTS";
import { useTwitchChat } from "../../hooks/useTwitchChat";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { ThemeToggle } from "./ThemeToggle";
import { VoiceSelector } from "./VoiceSelector";
import { PermissionsCheckbox } from "./PermissionsCheckbox";
import { BannedWords } from "./BannedWords";
import { DEFAULT_PERMISSIONS } from "../../constants/twitch";

const Tts = () => {
  const [channel, setChannel] = useLocalStorage('channel', '');
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  
  // Estados de permisos
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  
  // Estados de palabras baneadas
  const [filterEnabled, setFilterEnabled] = useLocalStorage('filterEnabled', false);
  const [bannedWords, setBannedWords] = useLocalStorage('bannedWords', []);
  const [replacementWord, setReplacementWord] = useLocalStorage('replacementWord', '*****');
  
  // Hook de TTS
  const { voices, selectedVoice, setSelectedVoice, speak } = useTTS(
    filterEnabled,
    bannedWords,
    replacementWord
  );

  // Manejar cambios de permisos
  const handlePermissionChange = useCallback((key, value) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Callback para cuando llega un mensaje TTS
  const handleTTSMessage = useCallback((content) => {
    speak(content);
  }, [speak]);

  // Hook de Twitch Chat
  useTwitchChat(channel, handleTTSMessage, permissions);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 w-2/5 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            TTS Twitch Bot
          </h1>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
        </div>
        
        <input
          className="flex w-full text-center mb-4 p-3 rounded-lg border-2
                    bg-blue-50 dark:bg-gray-700 border-blue-300 dark:border-gray-600 
                    placeholder-blue-400 dark:placeholder-gray-400 shadow-md 
                    focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none
                    text-gray-900 dark:text-white"
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="Nombre del canal"
        />

        <VoiceSelector
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceSelect={setSelectedVoice}
        />

        <PermissionsCheckbox
          permissions={permissions}
          onPermissionChange={handlePermissionChange}
        />

        <BannedWords
          filterEnabled={filterEnabled}
          onFilterToggle={setFilterEnabled}
          bannedWords={bannedWords}
          onBannedWordsChange={setBannedWords}
          replacementWord={replacementWord}
          onReplacementWordChange={setReplacementWord}
        />
      </div>
  </div>
  );
};

export default Tts;
