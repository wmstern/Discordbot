import { Event, EventBase } from '#framework';
import { logger } from '../../common/logger.ts';

@Event('warn')
export class WarnEvent extends EventBase {
  run(msg: string) {
    logger.warn(msg);
  }
}
