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
