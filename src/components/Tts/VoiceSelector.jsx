import { useState } from 'react';

/**
 * Componente selector de voces con búsqueda
 */
export const VoiceSelector = ({ voices, selectedVoice, onVoiceSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVoices = voices.filter(voice =>
    voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voice.lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVoiceSelect = (voice) => {
    onVoiceSelect(voice);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Seleccionar Voz:
      </label>
      
      <div className="relative">
        <button
          className="w-full p-3 rounded-lg border-2 bg-white dark:bg-gray-700 
          border-gray-300 dark:border-gray-600 text-left shadow-md 
          hover:border-blue-400 dark:hover:border-blue-500 
          focus:border-blue-500 dark:focus:border-blue-400 
          focus:outline-none transition-colors flex justify-between items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className={selectedVoice ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
            {selectedVoice ? selectedVoice.name : "Selecciona una voz"}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <input
                type="text"
                placeholder="Buscar voz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                rounded-md focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none
                placeholder-gray-500 dark:placeholder-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredVoices.length > 0 ? (
                filteredVoices.map((voice, index) => (
                  <div
                    key={index}
                    className={`p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors ${
                      selectedVoice === voice ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleVoiceSelect(voice)}
                  >
                    <div className="font-medium text-sm flex items-center">
                      {voice.name}
                      {voice.localService ? (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">Local</span>
                      ) : (
                        <span className="ml-2 px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">Online</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {voice.lang}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-sm text-center">
                  No se encontraron voces
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedVoice && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">Idioma:</span> {selectedVoice.lang} • 
          <span className="font-medium ml-2">Tipo:</span> {selectedVoice.localService ? 'Local' : 'Online'}
        </div>
      )}
    </div>
  );
};
