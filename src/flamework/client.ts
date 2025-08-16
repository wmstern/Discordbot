import { getExports } from './utils/files.ts';
import {
  Client as BaseClient,
  Routes,
  type ClientOptions,
  type ClientEvents,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction
} from 'discord.js';
import { Command } from './command.ts';
import { ClientEvent } from './client_event.ts';

export class Client extends BaseClient {
  readonly #token: string;
  readonly #clientId: string;
  readonly dirs: DirsOptions;

  public readonly commands = new Map<string, AnyCommand>();

  constructor({ token, clientId, dirs, ...opts }: Options) {
    super(opts);

    this.#token = token;
    this.#clientId = clientId;
    this.dirs = dirs;

    this.on('interactionCreate', (i) => void this.#handleInteractions(i));
  }

  async loadEvents() {
    const modules = await getExports<AnyEventConstructor>(this.dirs.events);

    await Promise.all(
      modules.map((mod) => {
        const event = new mod(this);

        if (!(event instanceof ClientEvent))
          throw new TypeError(`invalid client event constructor`);

        const handler = (...args: ClientEvents[keyof ClientEvents]) =>
          void event.run(...args);

        if (event.once) this.once(event.name, handler);
        else this.on(event.name, handler);
      })
    );
  }

  async loadCommands() {
    const modules = await getExports<AnyCommandConstructor>(this.dirs.commands);

    await Promise.all(
      modules.map((mod) => {
        const command = new mod(this);

        if (!(command instanceof Command))
          throw new TypeError(`invalid command constructor`);

        this.commands.set(command.data.name, command);
      })
    );
  }

  async reloadCommand(name: string) {
    const oldCmd = this.commands.get(name);

    if (!oldCmd) throw new Error(`${name} command not exist.`);

    const mod = (await import(
      `${oldCmd.path}?update=${Date.now().toString()}`
    )) as {
      default: AnyCommandConstructor;
    };

    const newCmd = new mod.default(this);
    this.commands.set(newCmd.data.name, newCmd);
  }

  async registerCommands() {
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    for (const [, { data }] of this.commands) {
      commands.push(data);
    }

    await this.rest.put(Routes.applicationCommands(this.#clientId), {
      body: commands
    });
  }

  login() {
    return super.login(this.#token);
  }

  async #handleInteractions(i: unknown) {
    if (i instanceof AutocompleteInteraction) {
      const cmd = this.commands.get(i.commandName);
      if (!cmd) {
        this.emit('warn', `unknowm command ${i.commandName}`);
        return;
      }

      if (!cmd.autocomplete) {
        this.emit('warn', `unknown autocomplete in ${cmd.data.name}`);
        return;
      }

      try {
        await cmd.autocomplete(i as AutocompleteInteraction);
      } catch (err) {
        this.emit('error', err as Error);
      }
    } else if (i instanceof ChatInputCommandInteraction) {
      const cmd = this.commands.get(i.commandName);
      if (!cmd) {
        this.emit('unknownCommand', i);
        return;
      }

      await cmd.execute(i as ChatInputCommandInteraction);
    } else if (i instanceof MessageComponentInteraction) {
      this.emit(
        'messageComponentInteraction',
        i as MessageComponentInteraction
      );
    } else if (i instanceof ModalSubmitInteraction) {
      this.emit('modalSubmitInteraction', i as ModalSubmitInteraction);
    } else {
      this.emit('unknownInteraction', i);
    }
  }
}

export interface DirsOptions {
  commands: string;
  events: string;
}
interface Options extends ClientOptions {
  token: string;
  clientId: string;
  dirs: DirsOptions;
}

export type AnyCommandConstructor = new (client: Client) => Command;
export type AnyCommand = InstanceType<AnyCommandConstructor>;
export type AnyEventConstructor = new (client: Client) => ClientEvent;
