import { useState, useEffect, useCallback } from 'react';
import { speakText, filterBannedWords } from '../utils/speechHelpers';

const getVoiceKey = (voice) => voice?.shortName || voice?.id || voice?.name || '';

const normalizeBrowserVoice = (voice) => ({
  name: voice.name,
  lang: voice.lang,
  localService: voice.localService,
  default: voice.default,
  voiceURI: voice.voiceURI,
  shortName: voice.name,
});

const normalizeBackendVoice = (voice) => ({
  name: voice.name,
  lang: voice.lang || voice.locale || '',
  localService: false,
  default: false,
  voiceURI: voice.shortName || voice.id || voice.name,
  shortName: voice.shortName || voice.id || voice.name,
  id: voice.id || voice.shortName || voice.name,
  provider: voice.provider || 'edge',
});

const selectDefaultVoice = (availableVoices) => {
  const spanishVoice = availableVoices.find((voice) => {
    const voiceName = (voice.name || '').toLowerCase();
    const voiceLang = (voice.lang || '').toLowerCase();

    return voiceLang.startsWith('es') || voiceName.includes('spanish') || voiceName.includes('español');
  });

  if (spanishVoice) {
    return spanishVoice;
  }

  const femaleVoice = availableVoices.find((voice) => {
    const voiceName = (voice.name || '').toLowerCase();

    return voiceName.includes('female') || voiceName.includes('mujer');
  });

  return femaleVoice || availableVoices[0] || null;
};

const findSavedVoice = (availableVoices) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const savedVoiceKey = localStorage.getItem('selectedVoiceKey');
  const savedVoiceName = localStorage.getItem('selectedVoiceName');
  const savedVoiceLang = localStorage.getItem('selectedVoiceLang');

  return availableVoices.find((voice) => {
    const voiceKey = getVoiceKey(voice);

    if (savedVoiceKey && voiceKey === savedVoiceKey) {
      return true;
    }

    if (savedVoiceName && voice.name === savedVoiceName) {
      return !savedVoiceLang || voice.lang === savedVoiceLang;
    }

    return false;
  }) || null;
};

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

  const getVoices = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const desktopBackendUrl = window.ttsTwitchDesktop?.ttsApiBaseUrl;

    if (desktopBackendUrl) {
      try {
        const response = await fetch(`${desktopBackendUrl}/voices`);

        if (!response.ok) {
          throw new Error(`Backend voices request failed: ${response.status}`);
        }

        const payload = await response.json();
        const availableVoices = Array.isArray(payload.voices)
          ? payload.voices.map(normalizeBackendVoice)
          : [];

        setVoices(availableVoices);

        const savedVoice = findSavedVoice(availableVoices);
        const defaultVoice = savedVoice || selectDefaultVoice(availableVoices);

        setSelectedVoice(defaultVoice);

        if (defaultVoice) {
          localStorage.setItem('selectedVoiceKey', getVoiceKey(defaultVoice));
          localStorage.setItem('selectedVoiceName', defaultVoice.name);
          localStorage.setItem('selectedVoiceLang', defaultVoice.lang);
        }

        return;
      } catch (error) {
        console.error('No se pudieron cargar las voces del backend:', error);
      }
    }

    const availableVoices = window.speechSynthesis.getVoices().map(normalizeBrowserVoice);
    setVoices(availableVoices);

    const savedVoice = findSavedVoice(availableVoices);
    const defaultVoice = savedVoice || selectDefaultVoice(availableVoices);

    setSelectedVoice(defaultVoice);

    if (defaultVoice) {
      localStorage.setItem('selectedVoiceKey', getVoiceKey(defaultVoice));
      localStorage.setItem('selectedVoiceName', defaultVoice.name);
      localStorage.setItem('selectedVoiceLang', defaultVoice.lang);
    }
  }, []);

  const saveSelectedVoice = useCallback((voice) => {
    if (voice && typeof window !== 'undefined') {
      localStorage.setItem('selectedVoiceKey', getVoiceKey(voice));
      localStorage.setItem('selectedVoiceName', voice.name);
      localStorage.setItem('selectedVoiceLang', voice.lang);
      setSelectedVoice(voice);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const desktopBackendUrl = window.ttsTwitchDesktop?.ttsApiBaseUrl;

    if (!desktopBackendUrl && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = getVoices;
    }

    getVoices();

    if (desktopBackendUrl) {
      return undefined;
    }

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
