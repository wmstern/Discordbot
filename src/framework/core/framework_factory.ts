import 'core-js/proposals/decorator-metadata-v2';
import { Client, ClientOptions } from 'discord.js';
import { join } from 'node:path';
import { CommandDeployer } from '../services/command_deployer.ts';
import { CommandExecutor } from '../services/command_executor.ts';
import { EventDispatcher } from '../services/event_dispatcher.ts';
import { CommandStore } from '../stores/command_store.ts';
import { EventStore } from '../stores/event_store.ts';
import type { CommandClass } from '../types/command.types.ts';
import type { EventClass } from '../types/event.types.ts';
import { getExports } from '../utils/files.ts';

export const FrameworkFactory = {
  async create(path: string, options: ClientOptions): Promise<App> {
    const client = new Client(options);

    const commands = await getExports<CommandClass>(join(path, 'commands'));
    const events = await getExports<EventClass>(join(path, 'events'));

    const commandStore = new CommandStore();
    const eventStore = new EventStore();
    commandStore.registerCommands(commands);
    eventStore.registerEvents(events);

    new CommandExecutor(client, commandStore);
    const commandDeployer = new CommandDeployer(client, commandStore);
    const eventDispatcher = new EventDispatcher(client, eventStore);

    return {
      client,
      async listen(token: string) {
        eventDispatcher.dispatchAll();
        await client.login(token);
        await commandDeployer.deployGlobal();
      }
    };
  }
};

interface App {
  client: Client;
  listen(token: string): void;
}
