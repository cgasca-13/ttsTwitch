import { useState, useEffect, useCallback } from 'react';
import { speakText, filterBannedWords } from '../utils/speechHelpers';

/**
 * Hook para manejar Text-to-Speech
 * @param {boolean} filterEnabled - Si el filtro de palabras baneadas está habilitado
 * @param {string[]} bannedWords - Lista de palabras baneadas
 * @param {string} replacementWord - Palabra de reemplazo
 * @returns {object} - Objeto con voces, voz seleccionada y funciones
 */
export const useTTS = (filterEnabled = false, bannedWords = [], replacementWord = '*****') => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const getVoices = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    
    // Intentar recuperar la voz guardada del localStorage
    const savedVoiceName = localStorage.getItem('selectedVoiceName');
    const savedVoiceLang = localStorage.getItem('selectedVoiceLang');
    
    if (savedVoiceName && savedVoiceLang) {
      const savedVoice = availableVoices.find(voice => 
        voice.name === savedVoiceName && voice.lang === savedVoiceLang
      );
      
      if (savedVoice) {
        setSelectedVoice(savedVoice);
        return;
      }
    }
    
    // Si no hay voz guardada, seleccionar una voz por defecto
    const femaleVoice = availableVoices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('mujer') ||
      voice.name.toLowerCase().includes('español') ||
      voice.name.toLowerCase().includes('spanish')
    );
    
    const defaultVoice = femaleVoice || availableVoices[0];
    setSelectedVoice(defaultVoice);
    
    if (defaultVoice) {
      localStorage.setItem('selectedVoiceName', defaultVoice.name);
      localStorage.setItem('selectedVoiceLang', defaultVoice.lang);
    }
  }, []);

  const saveSelectedVoice = useCallback((voice) => {
    if (voice && typeof window !== 'undefined') {
      localStorage.setItem('selectedVoiceName', voice.name);
      localStorage.setItem('selectedVoiceLang', voice.lang);
      setSelectedVoice(voice);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = getVoices;
    }
    
    getVoices();
    
    const interval = setInterval(() => {
      const currentVoices = window.speechSynthesis.getVoices();
      if (currentVoices.length > voices.length) {
        getVoices();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [getVoices, voices.length]);

  const speak = useCallback((text) => {
    const filteredText = filterBannedWords(text, bannedWords, replacementWord, filterEnabled);
    speakText(filteredText, selectedVoice);
  }, [selectedVoice, bannedWords, replacementWord, filterEnabled]);

  return {
    voices,
    selectedVoice,
    setSelectedVoice: saveSelectedVoice,
    speak
  };
};
