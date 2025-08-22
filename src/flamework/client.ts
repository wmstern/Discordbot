import {
  AutocompleteInteraction,
  Client as BaseClient,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  REST,
  Routes,
  type ClientEvents,
  type ClientOptions,
  type RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js';
import { ClientEvent } from './client_event.ts';
import { Command } from './command.ts';
import { getExports } from './utils/files.ts';

export class Client extends BaseClient {
  readonly #token: string;
  readonly #clientId: string;
  readonly #rest: REST;
  readonly dirs: DirsOptions;

  public readonly commands = new Map<string, AnyCommand>();

  constructor({ token, clientId, dirs, ...opts }: Options) {
    super(opts);

    this.#token = token;
    this.#clientId = clientId;
    this.dirs = dirs;

    this.#rest = new REST().setToken(token);

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
    const commands: CommandsDatas = { global: [] };

    for (const [, cmd] of this.commands) {
      if (cmd.guild) {
        (commands[cmd.guild] ??= []).push(cmd.data);
        continue;
      }
      commands.global.push(cmd.data);
    }

    for (const key of Object.keys(commands)) {
      if (key === 'global') await this.registerGlobalCommands(commands[key]);
      else await this.registerGuildCommands(key, commands[key]);
    }
  }

  async registerGlobalCommands(
    commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]
  ) {
    await this.#rest.put(Routes.applicationCommands(this.#clientId), {
      body: commands
    });
  }

  async registerGuildCommands(
    guild: string,
    commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]
  ) {
    await this.#rest.put(
      Routes.applicationGuildCommands(this.#clientId, guild),
      {
        body: commands
      }
    );
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

type CommandsDatas = Record<
  string,
  RESTPostAPIChatInputApplicationCommandsJSONBody[]
>;

export type AnyCommandConstructor = new (client: Client) => Command;
export type AnyCommand = InstanceType<AnyCommandConstructor>;
export type AnyEventConstructor = new (client: Client) => ClientEvent;
