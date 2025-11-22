/**
 * Voice Creation System
 * Main orchestrator for voice-based creation and interaction in Sanctuary VR
 */

import { NLPEngine } from './NLPEngine.js';
import { VoiceRecognitionManager } from './VoiceRecognitionManager.js';
import { CommandExecutor } from './CommandExecutor.js';

export class VoiceCreationSystem {
  constructor(core) {
    this.core = core;
    this.nlpEngine = null;
    this.voiceRecognition = null;
    this.commandExecutor = null;

    this.isListening = false;
    this.isProcessing = false;
    this.conversationContext = [];
    this.lastCommand = null;
    this.commandHistory = [];

    // Voice system configuration
    this.config = {
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      language: 'en-US',
      confidenceThreshold: 0.7,
      contextWindowSize: 5, // Remember last 5 commands for context
      enableFeedback: true,
      autoExecute: true
    };

    // Statistics
    this.stats = {
      commandsProcessed: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageConfidence: 0,
      sessionStartTime: null
    };
  }

  /**
   * Initialize the voice creation system
   */
  async init() {
    try {
      console.log('[VoiceCreationSystem] Initializing voice creation system...');

      // Initialize components
      this.nlpEngine = new NLPEngine(this.core);
      await this.nlpEngine.init();

      this.voiceRecognition = new VoiceRecognitionManager(this.core, this.config);
      await this.voiceRecognition.init();

      this.commandExecutor = new CommandExecutor(this.core);
      await this.commandExecutor.init();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize stats
      this.stats.sessionStartTime = Date.now();

      // Emit ready event
      this.core.emit('voiceSystemReady', {
        capabilities: this.getCapabilities()
      });

      console.log('[VoiceCreationSystem] Voice system initialized successfully');
      return true;
    } catch (error) {
      console.error('[VoiceCreationSystem] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners for voice system
   */
  setupEventListeners() {
    // Listen for speech recognition results
    this.voiceRecognition.on('result', (data) => this.handleSpeechResult(data));
    this.voiceRecognition.on('error', (error) => this.handleSpeechError(error));
    this.voiceRecognition.on('start', () => this.handleListeningStart());
    this.voiceRecognition.on('end', () => this.handleListeningEnd());

    // Listen for command execution results
    this.commandExecutor.on('success', (data) => this.handleCommandSuccess(data));
    this.commandExecutor.on('error', (data) => this.handleCommandError(data));
    this.commandExecutor.on('progress', (data) => this.handleCommandProgress(data));

    // Listen for core events
    this.core.on('voiceCommand', (data) => this.processVoiceCommand(data));
    this.core.on('cancelCommand', () => this.cancelCurrentCommand());
  }

  /**
   * Start listening for voice commands
   */
  async startListening() {
    if (this.isListening) {
      console.warn('[VoiceCreationSystem] Already listening');
      return;
    }

    try {
      await this.voiceRecognition.start();
      this.isListening = true;

      this.core.emit('voiceListeningStarted');

      if (this.config.enableFeedback) {
        this.showFeedback('Listening...', 'listening');
      }
    } catch (error) {
      console.error('[VoiceCreationSystem] Failed to start listening:', error);
      this.core.emit('voiceSystemError', { error: error.message });
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (!this.isListening) {
      return;
    }

    this.voiceRecognition.stop();
    this.isListening = false;
    this.core.emit('voiceListeningStopped');
  }

  /**
   * Toggle voice listening on/off
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Handle speech recognition result
   */
  async handleSpeechResult(data) {
    const { transcript, confidence, isFinal } = data;

    // Show interim results
    if (!isFinal && this.config.enableFeedback) {
      this.showFeedback(transcript, 'interim');
      return;
    }

    // Process final result
    if (isFinal && confidence >= this.config.confidenceThreshold) {
      console.log(`[VoiceCreationSystem] Processing: "${transcript}" (confidence: ${confidence})`);

      if (this.config.enableFeedback) {
        this.showFeedback(`Processing: "${transcript}"`, 'processing');
      }

      await this.processVoiceCommand(transcript);
    } else if (isFinal) {
      console.warn(`[VoiceCreationSystem] Low confidence (${confidence}), skipping: "${transcript}"`);
      this.showFeedback('Could not understand. Please try again.', 'error');
    }
  }

  /**
   * Process a voice command
   */
  async processVoiceCommand(transcript) {
    if (this.isProcessing) {
      console.warn('[VoiceCreationSystem] Already processing a command');
      return;
    }

    this.isProcessing = true;
    this.stats.commandsProcessed++;

    try {
      // Parse command with NLP
      const parsedCommand = await this.nlpEngine.parse(transcript, {
        context: this.getRecentContext(),
        history: this.commandHistory
      });

      console.log('[VoiceCreationSystem] Parsed command:', parsedCommand);

      // Validate command
      if (!parsedCommand || !parsedCommand.intent) {
        throw new Error('Could not understand command');
      }

      // Add to history
      this.addToHistory({
        transcript,
        parsedCommand,
        timestamp: Date.now()
      });

      // Execute command
      if (this.config.autoExecute) {
        await this.executeCommand(parsedCommand);
      } else {
        // Show confirmation dialog
        this.requestConfirmation(parsedCommand);
      }

    } catch (error) {
      console.error('[VoiceCreationSystem] Command processing failed:', error);
      this.stats.failedCommands++;
      this.showFeedback(error.message, 'error');
      this.core.emit('voiceCommandError', { error: error.message, transcript });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a parsed command
   */
  async executeCommand(command) {
    try {
      this.lastCommand = command;

      const result = await this.commandExecutor.execute(command);

      this.stats.successfulCommands++;
      this.updateAverageConfidence(command.confidence);

      this.core.emit('voiceCommandSuccess', {
        command,
        result
      });

      if (this.config.enableFeedback) {
        this.showFeedback(result.message || 'Command executed successfully', 'success');
      }

      return result;
    } catch (error) {
      this.stats.failedCommands++;
      throw error;
    }
  }

  /**
   * Cancel the current command
   */
  cancelCurrentCommand() {
    if (this.isProcessing) {
      this.isProcessing = false;
      this.commandExecutor.cancel();
      this.showFeedback('Command cancelled', 'info');
    }
  }

  /**
   * Handle speech recognition error
   */
  handleSpeechError(error) {
    console.error('[VoiceCreationSystem] Speech recognition error:', error);
    this.isListening = false;

    let message = 'Voice recognition error';

    switch (error.error) {
      case 'no-speech':
        message = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        message = 'Microphone access denied or not available.';
        break;
      case 'not-allowed':
        message = 'Microphone permission denied.';
        break;
      case 'network':
        message = 'Network error. Check your connection.';
        break;
    }

    this.showFeedback(message, 'error');
    this.core.emit('voiceSystemError', { error: message });
  }

  /**
   * Handle listening start
   */
  handleListeningStart() {
    console.log('[VoiceCreationSystem] Started listening');
    this.isListening = true;
  }

  /**
   * Handle listening end
   */
  handleListeningEnd() {
    console.log('[VoiceCreationSystem] Stopped listening');
    this.isListening = false;
  }

  /**
   * Handle command execution success
   */
  handleCommandSuccess(data) {
    console.log('[VoiceCreationSystem] Command executed successfully:', data);
  }

  /**
   * Handle command execution error
   */
  handleCommandError(data) {
    console.error('[VoiceCreationSystem] Command execution error:', data);
  }

  /**
   * Handle command execution progress
   */
  handleCommandProgress(data) {
    if (this.config.enableFeedback) {
      this.showFeedback(data.message, 'progress', data.progress);
    }
  }

  /**
   * Show visual feedback to user
   */
  showFeedback(message, type = 'info', progress = null) {
    this.core.emit('voiceFeedback', {
      message,
      type,
      progress,
      timestamp: Date.now()
    });
  }

  /**
   * Request confirmation for a command
   */
  requestConfirmation(command) {
    this.core.emit('voiceCommandConfirmation', {
      command,
      onConfirm: () => this.executeCommand(command),
      onCancel: () => this.cancelCurrentCommand()
    });
  }

  /**
   * Add command to history
   */
  addToHistory(entry) {
    this.commandHistory.push(entry);

    // Maintain context window size
    if (this.commandHistory.length > this.config.contextWindowSize * 2) {
      this.commandHistory = this.commandHistory.slice(-this.config.contextWindowSize * 2);
    }
  }

  /**
   * Get recent context for NLP
   */
  getRecentContext() {
    return this.commandHistory.slice(-this.config.contextWindowSize);
  }

  /**
   * Update average confidence statistic
   */
  updateAverageConfidence(confidence) {
    const total = this.stats.averageConfidence * (this.stats.successfulCommands - 1) + confidence;
    this.stats.averageConfidence = total / this.stats.successfulCommands;
  }

  /**
   * Get system capabilities
   */
  getCapabilities() {
    return {
      voiceRecognition: this.voiceRecognition?.isSupported() || false,
      languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
      intents: this.nlpEngine?.getSupportedIntents() || [],
      maxConfidence: 1.0,
      minConfidence: this.config.confidenceThreshold
    };
  }

  /**
   * Get system statistics
   */
  getStats() {
    const sessionDuration = Date.now() - this.stats.sessionStartTime;
    const successRate = this.stats.commandsProcessed > 0
      ? (this.stats.successfulCommands / this.stats.commandsProcessed) * 100
      : 0;

    return {
      ...this.stats,
      sessionDuration,
      successRate: successRate.toFixed(2),
      commandsPerMinute: (this.stats.commandsProcessed / (sessionDuration / 60000)).toFixed(2)
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    if (this.voiceRecognition) {
      this.voiceRecognition.updateConfig(this.config);
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      commandsProcessed: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageConfidence: 0,
      sessionStartTime: Date.now()
    };
  }

  /**
   * Clean up and destroy the system
   */
  destroy() {
    if (this.isListening) {
      this.stopListening();
    }

    if (this.voiceRecognition) {
      this.voiceRecognition.destroy();
    }

    if (this.commandExecutor) {
      this.commandExecutor.destroy();
    }

    this.commandHistory = [];
    this.conversationContext = [];
  }
}
