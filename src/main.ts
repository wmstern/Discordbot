import { FrameworkFactory } from '#framework';
import { GatewayIntentBits } from 'discord.js';
import config from './common/config.ts';
import { logger } from './common/logger.ts';

try {
  const app = await FrameworkFactory.create(import.meta.dirname, {
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: {
      parse: [],
      repliedUser: false
    }
  });
  app.listen(config.env.discordBotToken, config.env.discordClientId);
} catch (err) {
  logger.error(err);
  process.exit(1);
}
