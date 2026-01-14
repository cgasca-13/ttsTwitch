/**
 * Reproduce texto usando la API de Speech Synthesis
 * @param {string} text - Texto a reproducir
 * @param {SpeechSynthesisVoice} voice - Voz seleccionada
 */
export const speakText = (text, voice) => {
  if (typeof window === 'undefined') return;

  // Asegurar que la voz esté disponible
  let voiceToUse = voice;
  
  if (!voiceToUse || !window.speechSynthesis.getVoices().find(v => 
    v.name === voiceToUse.name && v.lang === voiceToUse.lang
  )) {
    const savedVoiceName = localStorage.getItem('selectedVoiceName');
    const savedVoiceLang = localStorage.getItem('selectedVoiceLang');
    
    if (savedVoiceName && savedVoiceLang) {
      voiceToUse = window.speechSynthesis.getVoices().find(v => 
        v.name === savedVoiceName && v.lang === savedVoiceLang
      );
    }
    
    if (!voiceToUse) {
      voiceToUse = window.speechSynthesis.getVoices()[0];
    }
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  if (voiceToUse) {
    utterance.voice = voiceToUse;
  }
  
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  utterance.onstart = () => {
    console.log('TTS iniciado con voz:', voiceToUse?.name);
  };
  
  utterance.onend = () => {
    console.log('TTS completado');
  };
  
  utterance.onerror = (event) => {
    console.error('Error en TTS:', event.error);
    
    if (event.error === 'not-allowed' || event.error === 'network') {
      const fallbackUtterance = new SpeechSynthesisUtterance(text);
      fallbackUtterance.rate = 0.9;
      fallbackUtterance.pitch = 1.0;
      fallbackUtterance.volume = 1.0;
      window.speechSynthesis.speak(fallbackUtterance);
    }
  };
  
  window.speechSynthesis.speak(utterance);
};

/**
 * Cancela cualquier reproducción de TTS en curso
 */
export const cancelSpeech = () => {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel();
  }
};

/**
 * Pausa la reproducción de TTS
 */
export const pauseSpeech = () => {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.pause();
  }
};

/**
 * Resume la reproducción de TTS
 */
export const resumeSpeech = () => {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.resume();
  }
};

/**
 * Filtra y reemplaza palabras baneadas en el texto
 * @param {string} text - Texto a filtrar
 * @param {string[]} bannedWords - Lista de palabras baneadas
 * @param {string} replacementWord - Palabra de reemplazo (por defecto "*****")
 * @param {boolean} filterEnabled - Si el filtro está habilitado
 * @returns {string} - Texto filtrado
 */
export const filterBannedWords = (text, bannedWords = [], replacementWord = "*****", filterEnabled = false) => {
  if (!filterEnabled || !text || bannedWords.length === 0) {
    return text;
  }

  let filteredText = text;
  
  // Reemplazar cada palabra baneada (case-insensitive)
  bannedWords.forEach(bannedWord => {
    const regex = new RegExp(`\\b${bannedWord}\\b`, 'gi');
    filteredText = filteredText.replace(regex, replacementWord);
  });

  return filteredText;
};
