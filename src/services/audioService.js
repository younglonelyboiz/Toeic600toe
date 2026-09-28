// Audio Service for English pronunciation
// Uses Web Speech Synthesis API with fallback

class AudioService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.preferredVoice = null;

    if (this.synth) {
      this.initVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Prioritize natural US English voices
    this.preferredVoice = 
      this.voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Ava'))) ||
      this.voices.find(v => v.lang === 'en-US') ||
      this.voices.find(v => v.lang.startsWith('en')) ||
      null;
  }

  speak(text, rate = 0.9) {
    if (!text || typeof window === 'undefined') return;

    // Clean text (remove slashes, brackets, parentheticals for clear speech)
    const cleanText = text.replace(/[\/\[\]\(\)]/g, ' ').replace(/\s+/g, ' ').trim();

    try {
      if (this.synth) {
        // Cancel any pending speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = rate; // 0.9 is perfect for clear pronunciation learning
        utterance.pitch = 1.0;

        if (this.preferredVoice) {
          utterance.voice = this.preferredVoice;
        } else {
          this.initVoices();
          if (this.preferredVoice) utterance.voice = this.preferredVoice;
        }

        utterance.onerror = (e) => {
          console.warn('Speech synthesis error, trying fallback', e);
          this.fallbackAudio(cleanText);
        };

        this.synth.speak(utterance);
      } else {
        this.fallbackAudio(cleanText);
      }
    } catch (err) {
      console.error('Audio playback error', err);
      this.fallbackAudio(cleanText);
    }
  }

  fallbackAudio(text) {
    try {
      const encoded = encodeURIComponent(text);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encoded}`;
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.warn('Fallback audio failed', e));
    } catch (e) {
      console.warn('Fallback audio error', e);
    }
  }
}

export const audioService = new AudioService();
