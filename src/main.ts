import { Client } from '#flamework';
import { GatewayIntentBits } from 'discord.js';
import config from './config.ts';

try {
  const client = new Client({
    token: config.env.discordBotToken,
    clientId: config.env.discordClientId,
    dirs: {
      events: config.dirs.events,
      commands: config.dirs.commands
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
