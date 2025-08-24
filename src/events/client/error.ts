import { Event, EventBase } from '#framework';
import { logger } from '../../common/logger.ts';

@Event('error')
export class ErrorEvent extends EventBase {
  run(err: Error) {
    logger.error(err);
  }
}
