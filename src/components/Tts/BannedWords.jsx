"use client";
import { useState } from "react";

/**
 * Componente para gestionar palabras baneadas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.filterEnabled - Si el filtro está habilitado
 * @param {function} props.onFilterToggle - Callback al cambiar el estado del filtro
 * @param {string[]} props.bannedWords - Lista de palabras baneadas
 * @param {function} props.onBannedWordsChange - Callback al cambiar las palabras baneadas
 * @param {string} props.replacementWord - Palabra de reemplazo
 * @param {function} props.onReplacementWordChange - Callback al cambiar la palabra de reemplazo
 */
export const BannedWords = ({
  filterEnabled,
  onFilterToggle,
  bannedWords,
  onBannedWordsChange,
  replacementWord,
  onReplacementWordChange
}) => {
  const [inputWord, setInputWord] = useState("");

  const handleAddWord = () => {
    const word = inputWord.trim().toLowerCase();
    if (word && !bannedWords.includes(word)) {
      onBannedWordsChange([...bannedWords, word]);
      setInputWord("");
    }
  };

  const handleRemoveWord = (wordToRemove) => {
    onBannedWordsChange(bannedWords.filter(word => word !== wordToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Palabras Baneadas
        </h3>
        
        {/* Checkbox para habilitar/deshabilitar el filtro */}
        <label className="flex items-center space-x-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={filterEnabled}
            onChange={(e) => onFilterToggle(e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded 
                     focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                     focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar palabras baneadas
          </span>
        </label>

        {/* Input para palabra de reemplazo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Palabra de reemplazo:
          </label>
          <input
            type="text"
            value={replacementWord}
            onChange={(e) => onReplacementWordChange(e.target.value)}
            placeholder="*****"
            disabled={!filterEnabled}
            className="w-full p-2 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 
                     border-gray-300 dark:border-gray-600 placeholder-gray-400 
                     dark:placeholder-gray-500 focus:border-blue-500 
                     dark:focus:border-blue-400 focus:outline-none
                     text-gray-900 dark:text-white disabled:opacity-50 
                     disabled:cursor-not-allowed"
          />
        </div>

        {/* Input para agregar palabras baneadas */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Agregar palabra baneada:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe una palabra..."
              disabled={!filterEnabled}
              className="flex-1 p-2 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 
                       border-gray-300 dark:border-gray-600 placeholder-gray-400 
                       dark:placeholder-gray-500 focus:border-blue-500 
                       dark:focus:border-blue-400 focus:outline-none
                       text-gray-900 dark:text-white disabled:opacity-50 
                       disabled:cursor-not-allowed"
            />
            <button
              onClick={handleAddWord}
              disabled={!filterEnabled || !inputWord.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de palabras baneadas */}
        {bannedWords.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Palabras baneadas ({bannedWords.length}):
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 
                          bg-gray-50 dark:bg-gray-700 rounded-lg border 
                          border-gray-200 dark:border-gray-600">
              {bannedWords.map((word, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full 
                           text-sm font-medium bg-red-100 text-red-800 
                           dark:bg-red-900 dark:text-red-200"
                >
                  {word}
                  <button
                    onClick={() => handleRemoveWord(word)}
                    disabled={!filterEnabled}
                    className="ml-2 text-red-600 hover:text-red-800 
                             dark:text-red-300 dark:hover:text-red-100 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
