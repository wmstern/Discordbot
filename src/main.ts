import { Client } from '#flamework';
import config from './config.ts';
import { join } from 'node:path';
import { GatewayIntentBits } from 'discord.js';

try {
  const client = new Client({
    token: config.env.discordBotToken,
    clientId: config.env.discordClientId,
    dirs: {
      events: join(import.meta.dirname, 'commands'),
      commands: join(import.meta.dirname, 'events')
    },
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: {
      parse: [],
      repliedUser: false
    }
  });

  await client.loadEvents();
  await client.loadCommands();
  await client.registerCommands();
  await client.login();
} catch (err) {
  console.error(err);
  process.exit(1);
}
