import { Event } from '#framework';
import { logger } from '../../common/logger.ts';

@Event('debug')
export class DebugEvent {
  run(msg: string) {
    logger.debug(msg);
  }
}
