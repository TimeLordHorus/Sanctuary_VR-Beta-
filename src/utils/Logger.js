/**
 * Logger Utility
 * Centralized logging for Sanctuary VR
 */

export class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  static currentLevel = Logger.levels.INFO;

  static setLevel(level) {
    Logger.currentLevel = level;
  }

  static debug(...args) {
    if (Logger.currentLevel <= Logger.levels.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  }

  static info(...args) {
    if (Logger.currentLevel <= Logger.levels.INFO) {
      console.log('[INFO]', ...args);
    }
  }

  static warn(...args) {
    if (Logger.currentLevel <= Logger.levels.WARN) {
      console.warn('[WARN]', ...args);
    }
  }

  static error(...args) {
    if (Logger.currentLevel <= Logger.levels.ERROR) {
      console.error('[ERROR]', ...args);
    }
  }

  static group(label) {
    console.group(label);
  }

  static groupEnd() {
    console.groupEnd();
  }
}

export default Logger;
