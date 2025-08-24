import { FrameworkFactory } from '#framework';
import { GatewayIntentBits } from 'discord.js';
import config from './common/config.ts';
import { join } from 'node:path';

try {
  const app = await FrameworkFactory.create(
    join(import.meta.dirname, 'modules'),
    {
      intents: [GatewayIntentBits.Guilds],
      allowedMentions: {
        parse: [],
        repliedUser: false
      }
    }
  );
  await app.listen(config.env.discordBotToken, config.env.discordClientId);
} catch (err) {
  console.error(err);
  process.exit(1);
}
