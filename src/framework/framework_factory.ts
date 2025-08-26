import { Client, ClientOptions, REST, Routes } from 'discord.js';
import { join } from 'node:path';
import 'reflect-metadata';
import { CommandHandler } from './handlers/command_handler.ts';
import { EventHandler } from './handlers/event_handler.ts';
import type { CommandConstructor } from './types/command.types.ts';
import type { EventConstructor } from './types/event.types.ts';
import { getExports } from './utils/files.ts';

export const FrameworkFactory = {
  async create(path: string, options: ClientOptions) {
    const client = createClient(options);

    const commands = await getExports<CommandConstructor>(
      join(path, 'commands')
    );
    const events = await getExports<EventConstructor>(join(path, 'events'));

    const commandHandler = new CommandHandler(client, commands);
    const eventHandler = new EventHandler(client, events);

    return {
      client,
      commandHandler,
      eventHandler,
      async listen(token: string, id: string) {
        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(Routes.applicationCommands(id), {
          body: commandHandler.commandData
        });
        await client.login(token);
      }
    };
  }
};

function createClient(opts: ClientOptions): Client {
  return new Client(opts);
}
