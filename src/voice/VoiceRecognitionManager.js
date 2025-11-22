/**
 * Voice Recognition Manager
 * Handles speech-to-text using Web Speech API
 */

export class VoiceRecognitionManager {
  constructor(core, config = {}) {
    this.core = core;
    this.config = {
      continuous: config.continuous || true,
      interimResults: config.interimResults || true,
      maxAlternatives: config.maxAlternatives || 3,
      language: config.language || 'en-US',
      ...config
    };

    this.recognition = null;
    this.isActive = false;
    this.isSupported = this.checkSupport();

    // Event handlers
    this.eventHandlers = new Map();

    // Recognition state
    this.lastResult = null;
    this.finalTranscripts = [];
    this.interimTranscript = '';
  }

  /**
   * Check if Web Speech API is supported
   */
  checkSupport() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Initialize the voice recognition system
   */
  async init() {
    if (!this.isSupported) {
      throw new Error('Web Speech API is not supported in this browser');
    }

    console.log('[VoiceRecognitionManager] Initializing voice recognition...');

    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
    this.recognition.lang = this.config.language;

    // Set up event handlers
    this.setupRecognitionHandlers();

    console.log('[VoiceRecognitionManager] Voice recognition initialized');
    return true;
  }

  /**
   * Set up Web Speech API event handlers
   */
  setupRecognitionHandlers() {
    // Recognition starts
    this.recognition.onstart = () => {
      console.log('[VoiceRecognitionManager] Recognition started');
      this.isActive = true;
      this.emit('start', {});
    };

    // Recognition ends
    this.recognition.onend = () => {
      console.log('[VoiceRecognitionManager] Recognition ended');
      this.isActive = false;
      this.emit('end', {});

      // Auto-restart if continuous mode
      if (this.config.continuous && this.shouldRestart) {
        setTimeout(() => {
          if (this.shouldRestart) {
            this.start();
          }
        }, 100);
      }
    };

    // Recognition result
    this.recognition.onresult = (event) => {
      this.handleResult(event);
    };

    // Recognition error
    this.recognition.onerror = (event) => {
      console.error('[VoiceRecognitionManager] Recognition error:', event.error);
      this.emit('error', {
        error: event.error,
        message: event.message
      });
    };

    // Audio start (user started speaking)
    this.recognition.onaudiostart = () => {
      console.log('[VoiceRecognitionManager] Audio capture started');
      this.emit('audioStart', {});
    };

    // Audio end (user stopped speaking)
    this.recognition.onaudioend = () => {
      console.log('[VoiceRecognitionManager] Audio capture ended');
      this.emit('audioEnd', {});
    };

    // Sound start (sound detected)
    this.recognition.onsoundstart = () => {
      this.emit('soundStart', {});
    };

    // Sound end (sound stopped)
    this.recognition.onsoundend = () => {
      this.emit('soundEnd', {});
    };

    // Speech start (speech detected)
    this.recognition.onspeechstart = () => {
      console.log('[VoiceRecognitionManager] Speech started');
      this.emit('speechStart', {});
    };

    // Speech end (speech stopped)
    this.recognition.onspeechend = () => {
      console.log('[VoiceRecognitionManager] Speech ended');
      this.emit('speechEnd', {});
    };

    // No speech detected
    this.recognition.onnomatch = () => {
      console.warn('[VoiceRecognitionManager] No speech match');
      this.emit('noMatch', {});
    };
  }

  /**
   * Handle recognition result
   */
  handleResult(event) {
    let interimTranscript = '';
    let finalTranscript = '';

    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscript += transcript + ' ';
        this.finalTranscripts.push({
          transcript: transcript.trim(),
          confidence,
          timestamp: Date.now()
        });

        // Emit final result
        this.emit('result', {
          transcript: transcript.trim(),
          confidence,
          isFinal: true,
          alternatives: this.getAlternatives(result)
        });

        this.lastResult = {
          transcript: transcript.trim(),
          confidence,
          isFinal: true
        };
      } else {
        interimTranscript += transcript;

        // Emit interim result
        this.emit('result', {
          transcript: transcript.trim(),
          confidence,
          isFinal: false,
          alternatives: this.getAlternatives(result)
        });
      }
    }

    this.interimTranscript = interimTranscript;

    // Emit combined transcript update
    if (finalTranscript || interimTranscript) {
      this.emit('transcriptUpdate', {
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
        combined: (finalTranscript + interimTranscript).trim()
      });
    }
  }

  /**
   * Get alternative transcriptions
   */
  getAlternatives(result) {
    const alternatives = [];
    for (let j = 0; j < result.length && j < this.config.maxAlternatives; j++) {
      alternatives.push({
        transcript: result[j].transcript,
        confidence: result[j].confidence
      });
    }
    return alternatives;
  }

  /**
   * Start voice recognition
   */
  async start() {
    if (!this.isSupported) {
      throw new Error('Voice recognition not supported');
    }

    if (this.isActive) {
      console.warn('[VoiceRecognitionManager] Already active');
      return;
    }

    try {
      // Request microphone permission
      await this.requestMicrophonePermission();

      // Start recognition
      this.shouldRestart = true;
      this.recognition.start();

      console.log('[VoiceRecognitionManager] Started listening');
    } catch (error) {
      console.error('[VoiceRecognitionManager] Failed to start:', error);
      throw error;
    }
  }

  /**
   * Stop voice recognition
   */
  stop() {
    if (!this.isActive) {
      return;
    }

    this.shouldRestart = false;
    this.recognition.stop();

    console.log('[VoiceRecognitionManager] Stopped listening');
  }

  /**
   * Request microphone permission
   */
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('[VoiceRecognitionManager] Microphone permission denied:', error);
      throw new Error('Microphone access denied');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    if (this.recognition) {
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
      this.recognition.lang = this.config.language;
    }
  }

  /**
   * Change recognition language
   */
  setLanguage(language) {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'en-US', name: 'English (United States)' },
      { code: 'en-GB', name: 'English (United Kingdom)' },
      { code: 'es-ES', name: 'Spanish (Spain)' },
      { code: 'es-MX', name: 'Spanish (Mexico)' },
      { code: 'fr-FR', name: 'French (France)' },
      { code: 'de-DE', name: 'German (Germany)' },
      { code: 'it-IT', name: 'Italian (Italy)' },
      { code: 'ja-JP', name: 'Japanese (Japan)' },
      { code: 'ko-KR', name: 'Korean (South Korea)' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'zh-TW', name: 'Chinese (Traditional)' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'pt-PT', name: 'Portuguese (Portugal)' },
      { code: 'ru-RU', name: 'Russian (Russia)' },
      { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
      { code: 'hi-IN', name: 'Hindi (India)' }
    ];
  }

  /**
   * Get last recognized text
   */
  getLastResult() {
    return this.lastResult;
  }

  /**
   * Get all final transcripts from current session
   */
  getFinalTranscripts() {
    return this.finalTranscripts;
  }

  /**
   * Clear transcript history
   */
  clearHistory() {
    this.finalTranscripts = [];
    this.interimTranscript = '';
    this.lastResult = null;
  }

  /**
   * Check if voice recognition is currently active
   */
  isListening() {
    return this.isActive;
  }

  /**
   * Check if voice recognition is supported
   */
  isSupported() {
    return this.isSupported;
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Unregister event handler
   */
  off(event, handler) {
    if (!this.eventHandlers.has(event)) {
      return;
    }

    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[VoiceRecognitionManager] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Get recognition statistics
   */
  getStats() {
    return {
      isActive: this.isActive,
      isSupported: this.isSupported,
      language: this.config.language,
      totalTranscripts: this.finalTranscripts.length,
      averageConfidence: this.calculateAverageConfidence()
    };
  }

  /**
   * Calculate average confidence from transcripts
   */
  calculateAverageConfidence() {
    if (this.finalTranscripts.length === 0) {
      return 0;
    }

    const total = this.finalTranscripts.reduce((sum, t) => sum + t.confidence, 0);
    return total / this.finalTranscripts.length;
  }

  /**
   * Test microphone access
   */
  async testMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio context to test audio levels
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Get audio level
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      // Clean up
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();

      return {
        success: true,
        audioLevel: average,
        message: 'Microphone is working'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Microphone test failed'
      };
    }
  }

  /**
   * Clean up and destroy
   */
  destroy() {
    if (this.isActive) {
      this.stop();
    }

    this.recognition = null;
    this.eventHandlers.clear();
    this.finalTranscripts = [];
    this.interimTranscript = '';
    this.lastResult = null;
  }
}
