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
import 'reflect-metadata';
import { CommandBase } from './command_base.ts';
import { EventBase } from './event_base.ts';
import { collectMetadata } from './utils/module_loader.ts';

export const FrameworkFactory = {
  create(rootModule: new () => object, options: ClientOptions) {
    const client = new Client(options);

    const acc: {
      commands: (new () => CommandBase)[];
      events: (new () => EventBase)[];
    } = { commands: [], events: [] };
    collectMetadata(rootModule, acc);
    const { commands, events } = acc;

    const commandMap = new Collection<string, CommandBase>();

    for (const Cmd of commands) {
      const instance = new Cmd();
      const name = Reflect.getMetadata('command:name', Cmd) as string;
      commandMap.set(name, instance);
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

    for (const Ev of events) {
      const eventName = Reflect.getMetadata(
        'event:name',
        Ev
      ) as keyof ClientEvents;
      const instance = new Ev();
      client.on(eventName, (...args) => instance.run(...args));
    }

    return {
      async sync(token: string, id: string) {
        const rest = new REST().setToken(token);

        const slashData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
        for (const [, cmd] of commandMap) {
          slashData.push(cmd.toJSON());
        }

        await rest.put(Routes.applicationCommands(id), {
          body: slashData
        });
      },
      async login(token: string) {
        await client.login(token);
      }
    };
  }
};
