import { Event } from '#framework';
import { logger } from '../../common/logger.ts';

@Event('warn')
export class WarnEvent {
  run(msg: string) {
    logger.warn(msg);
  }
}
