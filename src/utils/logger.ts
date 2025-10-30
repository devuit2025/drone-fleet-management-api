import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  driver: string;
  message: string;
  data?: any;
}

class Logger {
  private logsDir: string;
  private currentDate: string;

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    this.currentDate = getDateString();
    this.initialize();

    // Update date at midnight
    setInterval(() => {
      this.currentDate = getDateString();
    }, 60000); // Check every minute
  }

  private formatMessage(level: LogLevel, driver: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      driver,
      message,
      data,
    };
    return JSON.stringify(logEntry);
  }

  private writeToFile(filePath: string, logEntry: LogEntry): void {
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(filePath, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Clean old logs (older than 7 days)
  private cleanOldLogs(): void {
    try {
      const drivers = fs.readdirSync(this.logsDir);
      const now = Date.now();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      drivers.forEach((driver) => {
        const driverDir = path.join(this.logsDir, driver);
        const stats = fs.statSync(driverDir);

        // Only process directories
        if (stats.isDirectory()) {
          const files = fs.readdirSync(driverDir);
          files.forEach((file) => {
            const filePath = path.join(driverDir, file);
            const fileStats = fs.statSync(filePath);

            if (now - fileStats.mtimeMs > sevenDaysInMs) {
              fs.unlinkSync(filePath);
              console.log(`Deleted old log file: ${driver}/${file}`);
            }
          });
        }
      });
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }

  // Initialize logger with cleanup
  private initialize(): void {
    // Clean old logs on startup
    this.cleanOldLogs();
  }

  private log(level: LogLevel, driver: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      driver,
      message,
      data,
    };

    // Write to console
    const consoleMessage = `[${timestamp}] [${level}] [${driver}] ${message}`;
    if (level === LogLevel.ERROR) {
      console.error(consoleMessage, data || '');
    } else if (level === LogLevel.WARN) {
      console.warn(consoleMessage, data || '');
    } else {
      console.log(consoleMessage, data || '');
    }

    // Write to file organized by driver folder
    const driverDir = path.join(this.logsDir, driver);
    if (!fs.existsSync(driverDir)) {
      fs.mkdirSync(driverDir, { recursive: true });
    }

    const filename = `${this.currentDate}.log`;
    const filePath = path.join(driverDir, filename);
    this.writeToFile(filePath, logEntry);

    // Check if date changed
    const today = getDateString();
    if (today !== this.currentDate) {
      this.currentDate = today;
    }
  }

  info(driver: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, driver, message, data);
  }

  warn(driver: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, driver, message, data);
  }

  error(driver: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, driver, message, data);
  }

  debug(driver: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, driver, message, data);
  }

  // Convenience method for realtime test logging
  logRealtime(message: string, data?: any): void {
    this.info('realtime_test', message, data);
  }

  // Convenience method for WebSocket logging
  logWebSocket(message: string, data?: any): void {
    this.info('websocket', message, data);
  }

  // Convenience method for API logging
  logAPI(message: string, data?: any): void {
    this.info('api', message, data);
  }

  // Convenience method for database logging
  logDB(message: string, data?: any): void {
    this.debug('database', message, data);
  }
}

function getDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Export singleton instance
export const logger = new Logger();

// Export logger instance for use in modules
export default logger;
