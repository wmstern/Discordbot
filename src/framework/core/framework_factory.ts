import 'core-js/proposals/decorator-metadata-v2';
import { Client, ClientOptions } from 'discord.js';
import { CommandDeployer } from '../services/command_deployer.ts';
import { CommandExecutor } from '../services/command_executor.ts';
import { EventDispatcher } from '../services/event_dispatcher.ts';
import { CommandStore } from '../stores/command_store.ts';
import { EventStore } from '../stores/event_store.ts';
import type { CommandClass } from '../types/command.types.ts';
import type { EventClass } from '../types/event.types.ts';
import { getCommands, getEvents } from '../utils/files.ts';

interface BaseConfig {
  client: ClientOptions;
}

interface DynamicConfig extends BaseConfig {
  mode: 'dynamic';
  path: string;
}

interface ModuleConfig extends BaseConfig {
  mode: 'module';
  module: Module;
}

export type Config = DynamicConfig | ModuleConfig;

export interface Module {
  commands?: CommandClass[];
  events?: EventClass[];
  imports?: Module[];
}

export const FrameworkFactory = {
  async create(config: Config): Promise<App> {
    const client = new Client(config.client);

    const commands: CommandClass[] = [];
    const events: EventClass[] = [];

    if (config.mode === 'dynamic') {
      commands.push(...(await getCommands(config.path)));
      events.push(...(await getEvents(config.path)));
    } else {
      commands.push(...(config.module.commands ?? []));
      events.push(...(config.module.events ?? []));
    }

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
  listen(token: string): Promise<void>;
}
