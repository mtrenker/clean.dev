export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface LoggerSink {
  stdout(message: string): void;
  stderr(message: string): void;
}

const formatMessage = (level: 'INFO' | 'WARN' | 'ERROR', message: string) =>
  `[${level}] ${message}\n`;

export const createLogger = (sink: LoggerSink): Logger => ({
  info(message) {
    sink.stdout(formatMessage('INFO', message));
  },
  warn(message) {
    sink.stderr(formatMessage('WARN', message));
  },
  error(message) {
    sink.stderr(formatMessage('ERROR', message));
  },
});
