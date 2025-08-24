import { join } from 'node:path';
import pino from 'pino';

export const logger = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: 'info',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'yyyy-mm-dd HH:MM:ss.l'
        }
      },
      {
        target: 'pino/file',
        level: 'error',
        options: {
          translateTime: 'yyyy-mm--dd HH:MM:ss.l',
          destination: join(import.meta.dirname, '../../logs/errors.log')
        }
      }
    ],
    options: { sync: true }
  }
});
