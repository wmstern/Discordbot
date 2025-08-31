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
  CooldownObject
} from '../types/command.types.ts';
import { isAutocomplete, isCommandMethod } from '../utils/command_helpers.ts';

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
      if (typeof Cmd !== 'function' || !('prototype' in Cmd)) throw new Error();

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
    const metadata = Command[Symbol.metadata] as CommandMetadata | null;
    if (!metadata?.data) return;

    for (const method of metadata.methods)
      if (method.cooldown)
        this.cooldowns.set(metadata.data.name + method.name, new Map());

    return metadata;
  }

  async #interactionCreate(i: BaseInteraction) {
    if (i.isCommand()) {
      const instance = this.commandMap.get(i.commandName);
      const metadata = this.commandMetadata.get(i.commandName);
      if (!instance || !metadata) return;

      try {
        await this.#commandExecute(i, instance, metadata);
      } catch (err) {
        i.client.emit('commandError', i, err as Error, metadata);
      }
    } else if (i.isAutocomplete()) {
      const instance = this.commandMap.get(i.commandName);
      const metadata = this.commandMetadata.get(i.commandName);
      if (!instance || !metadata) return;

      try {
        await this.#autocompleteExecute(i, instance, metadata);
      } catch (err) {
        i.client.emit('autocompleteError', i, err as Error, metadata);
      }
    }
  }

  async #commandExecute(
    i: CommandInteraction,
    instance: CommandBase,
    metadata: CommandMetadata
  ) {
    let method = metadata.methods.find((m) => m.name === 'run');

    if (i.isChatInputCommand()) {
      const sub = i.options.getSubcommand(false);
      if (sub) method = metadata.methods.find((m) => m.name === sub);
    }

    if (!method) return;

    const execute = instance[method.methodName];
    if (!isCommandMethod(method, execute)) return;

    const cooldown = method.cooldown;
    const cooldowns = this.cooldowns.get(i.commandName + method.name);
    const hasCooldown = cooldown ? cooldowns?.has(i.user.id) : false;

    if (cooldowns && hasCooldown) {
      const response = {
        block: true,
        reason: 'cooldown',
        context: cooldowns.get(i.user.id)
      };
      i.client.emit('commandBlock', i, response, metadata);
      return;
    }

    if (method.defer) await i.deferReply();

    for (const filter of method.filters) {
      let response = await filter(i);

      if (typeof response === 'boolean') {
        response = { block: response, reason: undefined, context: null };
      }

      if (response.block) {
        i.client.emit('commandBlock', i, response, metadata);
        return;
      }
    }

    await execute(i);

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
    instance: CommandBase,
    metadata: CommandMetadata
  ) {
    const autocomplete = metadata.autocomplete;
    if (!autocomplete) return;

    const execute = instance[autocomplete.methodName];
    if (!isAutocomplete(metadata, execute)) return;

    await execute(i);
  }
}
