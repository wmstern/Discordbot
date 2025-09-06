import { FrameworkFactory } from '#framework';
import { GatewayIntentBits } from 'discord.js';
import { join } from 'node:path';
import config from './common/config.ts';
import { logger } from './common/logger.ts';

try {
  const app = await FrameworkFactory.create({
    mode: 'dynamic',
    path: join(import.meta.dirname, 'modules'),
    client: {
      intents: [GatewayIntentBits.Guilds],
      allowedMentions: {
        parse: [],
        repliedUser: false
      }
    }
  });
  await app.listen(config.env.discordBotToken);
} catch (err) {
  logger.error(err);
  process.exit(1);
}
