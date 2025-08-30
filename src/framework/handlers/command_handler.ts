import {
  AutocompleteInteraction,
  BaseInteraction,
  CommandInteraction,
  type Client
} from 'discord.js';
import type {
  CommandBase,
  CommandConstructor,
  CommandMetadata,
  CooldownObject,
  SlashCommandBase
} from '../types/command.types.ts';
import {
  isCommandMethod,
  isContextMenuCommand,
  isSlashCommand,
  isSlashCommandMethod
} from '../utils/command_helpers.ts';

export class CommandHandler {
  public readonly commandMap = new Map<string, CommandBase>();
  public readonly commandMetadata = new Map<string, CommandMetadata>();

  public readonly cooldowns = new Map<string, Map<string, CooldownObject>>();

  constructor(
    protected readonly client: Client,
    private readonly cmds: CommandConstructor[]
  ) {
    this.#getCommandsStructures();
    this.client.on('interactionCreate', (i) => void this.#interactionCreate(i));
  }

  #getCommandsStructures() {
    for (const Cmd of this.cmds) {
      const metadata = this.#getCommandMetadata(Cmd);
      if (!metadata) continue;
      const instance = new Cmd();
      this.commandMap.set(metadata.data.name, instance);
      this.commandMetadata.set(metadata.data.name, metadata);
    }
  }

  #getCommandMetadata(
    Command: CommandConstructor
  ): CommandMetadata | undefined {
    const prototype = Command.prototype as CommandBase;

    const data = Command[Symbol.metadata]?.data as
      | CommandMetadata['data']
      | undefined;
    if (!data) return;

    const methods = (Command[Symbol.metadata]?.methods ??
      {}) as CommandMetadata['methods'];

    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (key === 'constructor') continue;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
      if (!isCommandMethod(descriptor?.value, prototype)) continue;

      methods[key] ??= { methodName: key, filters: [] };

      if (methods[key].cooldown)
        this.cooldowns.set(data.name + methods[key].methodName, new Map());
      if (key === 'autocomplete') methods[key].isAutocomplete = true;
    }

    return { data, methods };
  }

  async #interactionCreate(i: BaseInteraction) {
    if (i.isCommand()) {
      const instance = this.commandMap.get(i.commandName);
      const metadata = this.commandMetadata.get(i.commandName);
      if (!instance || !metadata) return;
      try {
        await this.#commandExecute(i, instance, metadata);
      } catch (err) {
        i.client.emit('commandError', i, err as Error);
      }
    } else if (i.isAutocomplete()) {
      const instance = this.commandMap.get(i.commandName);
      const metadata = this.commandMetadata.get(i.commandName);
      if (!instance || !metadata) return;
      try {
        await this.#autocompleteExecute(
          i,
          instance as SlashCommandBase,
          metadata
        );
      } catch (err) {
        i.client.emit('error', err as Error);
      }
    }
  }

  async #commandExecute(
    i: CommandInteraction,
    instance: CommandBase,
    metadata: CommandMetadata
  ) {
    let method = metadata.methods.run;

    if (i.isChatInputCommand()) {
      const sub = i.options.getSubcommand(false);
      if (sub) method = metadata.methods[sub];
    }

    if (!method) return;

    const cooldown = method.cooldown;
    const cooldowns = this.cooldowns.get(i.commandName + method.methodName);
    const hasCooldown = cooldown ? cooldowns?.has(i.user.id) : false;

    if (cooldowns && hasCooldown) {
      i.client.emit('commandBlock', i, 'cooldown', cooldowns.get(i.user.id));
      return;
    }

    if (method.defer) await i.deferReply();

    for (const filter of method.filters) {
      if (filter(i)) {
        i.client.emit('commandBlock', i, 'filter', filter);
        return;
      }
    }

    if (i.isChatInputCommand() && isSlashCommand(instance, i.commandType)) {
      const run = instance[method.methodName];
      if (!isSlashCommandMethod(run, instance)) return;
      await run(i);
    } else if (
      i.isContextMenuCommand() &&
      isContextMenuCommand(instance, i.commandType)
    ) {
      await instance.run(i);
    }

    if (cooldown && cooldowns && !hasCooldown) {
      cooldowns.set(i.user.id, {
        userId: i.user.id,
        start: Date.now(),
        time: cooldown,
        fn: setTimeout(() => cooldowns.delete(i.user.id), cooldown)
      });
    }
  }

  async #autocompleteExecute(
    i: AutocompleteInteraction,
    instance: SlashCommandBase,
    metadata: CommandMetadata
  ) {
    const method = metadata.methods.autocomplete;
    if (!method?.isAutocomplete) return;
    await instance.autocomplete?.(i);
  }
}
