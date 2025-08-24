import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  Collection,
  REST,
  Routes,
  type ClientEvents,
  type RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js';
import { join } from 'node:path';
import 'reflect-metadata';
import { CommandBase } from './bases/command.ts';
import { EventBase } from './bases/event.ts';
import { getExports } from './utils/files.ts';

export const FrameworkFactory = {
  async create(path: string, options: ClientOptions) {
    const client = createClient(options);

    const acc: {
      commands: (new () => CommandBase)[];
      events: (new () => EventBase)[];
    } = {
      commands: await getExports<new () => CommandBase>(join(path, 'commands')),
      events: await getExports<new () => EventBase>(join(path, 'events'))
    };

    const commandMap = new Collection<string, CommandBase>();
    const commandData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    for (const Cmd of acc.commands) {
      const instance = new Cmd();
      const data = Reflect.getMetadata(
        'command:data',
        Cmd
      ) as RESTPostAPIChatInputApplicationCommandsJSONBody;
      commandMap.set(data.name, instance);
      commandData.push(data);
    }

    const handleInteraction = async (interaction: unknown) => {
      if (interaction instanceof ChatInputCommandInteraction) {
        const command = commandMap.get(interaction.commandName);
        if (command) {
          await command.execute(interaction as ChatInputCommandInteraction);
        }
      } else if (interaction instanceof AutocompleteInteraction) {
        const command = commandMap.get(interaction.commandName);
        if (command) {
          await command.executeAutocomplete(
            interaction as AutocompleteInteraction
          );
        }
      }
    };

    client.on('interactionCreate', (i) => void handleInteraction(i));

    for (const Ev of acc.events) {
      const instance = new Ev();
      const eventName = Reflect.getMetadata(
        'event:name',
        Ev
      ) as keyof ClientEvents;
      client.on(eventName, (...args) => instance.run(...args));
    }

    return {
      client,
      commandMap,
      commandData,
      async listen(token: string, id: string) {
        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(Routes.applicationCommands(id), {
          body: commandData
        });
        await client.login(token);
      }
    };
  }
};

function createClient(opts: ClientOptions): Client {
  return new Client(opts);
}
