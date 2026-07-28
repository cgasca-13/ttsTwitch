/**
 * Reproduce texto usando la API de Speech Synthesis
 * @param {string} text - Texto a reproducir
 * @param {SpeechSynthesisVoice} voice - Voz seleccionada
 */
let currentAudio = null;
let currentObjectUrl = null;
let desktopBackendSpeechEnabled = true;

const resolveBrowserVoice = (voice) => {
  if (typeof window === 'undefined' || !voice) {
    return null;
  }

  const availableVoices = window.speechSynthesis.getVoices();
  const candidateKey = voice.voiceURI || voice.shortName || voice.id || voice.name || '';

  return availableVoices.find((availableVoice) => {
    const availableKey = availableVoice.voiceURI || availableVoice.name || '';

    return (
      availableKey === candidateKey ||
      (voice.name && availableVoice.name === voice.name && (!voice.lang || availableVoice.lang === voice.lang))
    );
  }) || null;
};

const getBrowserVoices = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  return window.speechSynthesis.getVoices();
};

const waitForBrowserVoices = (timeoutMs = 1500) => {
  if (typeof window === 'undefined') {
    return Promise.resolve([]);
  }

  const existingVoices = getBrowserVoices();

  if (existingVoices.length > 0) {
    return Promise.resolve(existingVoices);
  }

  return new Promise((resolve) => {
    const previousHandler = window.speechSynthesis.onvoiceschanged;

    const timer = setTimeout(() => {
      window.speechSynthesis.onvoiceschanged = previousHandler;
      resolve(getBrowserVoices());
    }, timeoutMs);

    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timer);
      window.speechSynthesis.onvoiceschanged = previousHandler;
      resolve(getBrowserVoices());
      if (typeof previousHandler === 'function') {
        previousHandler();
      }
    };
  });
};

const getDesktopTtsApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.ttsTwitchDesktop?.ttsApiBaseUrl || null;
};

const stopDesktopAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
};

const speakWithBrowser = (text, voice) => {
  if (typeof window === 'undefined') return;

  return waitForBrowserVoices().then((availableVoices) => {
    let voiceToUse = resolveBrowserVoice(voice);

    if (!voiceToUse) {
      const savedVoiceName = localStorage.getItem('selectedVoiceName');
      const savedVoiceLang = localStorage.getItem('selectedVoiceLang');

      if (savedVoiceName && savedVoiceLang) {
        voiceToUse = availableVoices.find((availableVoice) => (
          availableVoice.name === savedVoiceName && availableVoice.lang === savedVoiceLang
        ));
      }

      if (!voiceToUse) {
        voiceToUse = availableVoices[0] || null;
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
  });
};

const speakWithDesktopBackend = async (text, voice) => {
  const backendBaseUrl = getDesktopTtsApiBaseUrl();

  if (!backendBaseUrl || !desktopBackendSpeechEnabled) {
    return false;
  }

  stopDesktopAudio();

  const response = await fetch(`${backendBaseUrl}/speak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voice: voice?.shortName || voice?.id || voice?.name || undefined,
      rate: '+0%',
      pitch: '+0Hz',
      volume: '+0%',
    }),
  });

  if (!response.ok) {
    desktopBackendSpeechEnabled = false;
    return false;
  }

  const audioBlob = await response.blob();
  currentObjectUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(currentObjectUrl);

  currentAudio.onended = () => {
    stopDesktopAudio();
  };

  currentAudio.onerror = () => {
    stopDesktopAudio();
  };

  await currentAudio.play();
  return true;
};

export const speakText = async (text, voice) => {
  if (typeof window === 'undefined') return;

  try {
    const didUseDesktopBackend = await speakWithDesktopBackend(text, voice);

    if (didUseDesktopBackend) {
      return;
    }
  } catch (error) {
    console.error('Error en TTS desktop, usando Speech Synthesis:', error);
  }

  speakWithBrowser(text, voice);
};

/**
 * Cancela cualquier reproducción de TTS en curso
 */
export const cancelSpeech = () => {
  if (typeof window !== 'undefined') {
    stopDesktopAudio();
    window.speechSynthesis.cancel();
  }
};

/**
 * Pausa la reproducción de TTS
 */
export const pauseSpeech = () => {
  if (typeof window !== 'undefined') {
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      return;
    }

    window.speechSynthesis.pause();
  }
};

/**
 * Resume la reproducción de TTS
 */
export const resumeSpeech = () => {
  if (typeof window !== 'undefined') {
    if (currentAudio && currentAudio.paused) {
      currentAudio.play().catch(() => {});
      return;
    }

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
