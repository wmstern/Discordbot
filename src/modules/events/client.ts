import { Event } from '#framework';
import type { Client } from 'discord.js';
import { logger } from '../../common/logger.ts';

export class ClientEvents {
  @Event('ready')
  async ready(client: Client): Promise<void> {
    const app = await client.application?.fetch();
    logger.info(app?.name);
  }

  @Event('error')
  error(err: Error): void {
    logger.error(err);
  }

  @Event('warn')
  warn(msg: string): void {
    logger.warn(msg);
  }

  @Event('debug')
  debug(msg: string): void {
    logger.debug(msg);
  }
}
