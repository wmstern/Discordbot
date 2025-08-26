import { Event } from '#framework';
import { type Client } from 'discord.js';
import { logger } from '../../common/logger.ts';

@Event('ready')
export class ReadyEvent {
  async run(client: Client) {
    const app = await client.application?.fetch();
    logger.info(app?.name);
    logger.info(Date.now());
  }
}
