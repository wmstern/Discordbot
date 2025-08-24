import { Event, EventBase } from '#framework';
import { type Client } from 'discord.js';
import { logger } from '../../common/logger.ts';

@Event('ready')
export class ReadyEvent extends EventBase {
  run(client: Client) {
    logger.info(client.user?.tag);
  }
}
