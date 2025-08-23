import { FrameworkFactory } from '#framework';
import { GatewayIntentBits } from 'discord.js';
import config from './config.ts';
import { AppModule } from './module.ts';

try {
  const app = FrameworkFactory.create(AppModule, {
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: {
      parse: [],
      repliedUser: false
    }
  });
  await app.sync(config.env.discordBotToken, config.env.discordClientId);
  await app.login(config.env.discordBotToken);
} catch (err) {
  console.error(err);
  process.exit(1);
}
