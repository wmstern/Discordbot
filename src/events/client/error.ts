import { Event } from '#framework';
import { logger } from '../../common/logger.ts';

@Event('error')
export class ErrorEvent {
  run(err: Error) {
    logger.error(err);
  }
}
