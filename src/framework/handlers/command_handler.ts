import {
  AutocompleteInteraction,
  BaseInteraction,
  CommandInteraction,
  type Client
} from 'discord.js';
import { DEFAULT_METHOD } from '../decorators/command_method.ts';
import type {
  CommandClass,
  CommandEntry,
  CommandMetadata,
  CooldownObject
} from '../types/command.types.ts';
import { isAutocomplete, isCommandMethod } from '../utils/command_helpers.ts';

export class CommandHandler {
  public readonly commands = new Map<string, CommandEntry>();
  public readonly cooldowns = new Map<string, Map<string, CooldownObject>>();

  constructor(
    protected readonly client: Client,
    private readonly cmds: CommandClass[]
  ) {
    this.#getCommandsStructures();
    this.client.on('interactionCreate', (i) => void this.#interactionCreate(i));
  }

  #getCommandsStructures(): void {
    for (const Cmd of this.cmds) {
      if (typeof Cmd !== 'function' || !('prototype' in Cmd)) throw new Error();

      const metadata = this.#getCommandMetadata(Cmd);
      if (!metadata) continue;

      const instance = new Cmd(Cmd.length === 1 ? this.client : undefined);
      this.commands.set(metadata.data.name, { instance, metadata });
    }
  }

  #getCommandMetadata(Command: CommandClass): CommandMetadata | undefined {
    const metadata = Command[Symbol.metadata];
    if (!metadata?.data) return;

    for (const method of metadata.methods)
      if (method.cooldown) this.cooldowns.set(metadata.data.name + method.name, new Map());

    return metadata;
  }

  async #interactionCreate(i: BaseInteraction): Promise<void> {
    if (i.isCommand()) {
      const command = this.commands.get(i.commandName);
      if (!command) return;

      try {
        await this.#commandExecute(i, command);
      } catch (err) {
        i.client.emit('commandError', i, err as Error, command);
      }
    } else if (i.isAutocomplete()) {
      const command = this.commands.get(i.commandName);
      if (!command) return;

      try {
        await this.#autocompleteExecute(i, command);
      } catch (err) {
        i.client.emit('autocompleteError', i, err as Error, command);
      }
    }
  }

  async #commandExecute(
    i: CommandInteraction,
    { instance, metadata }: CommandEntry
  ): Promise<void> {
    let method = metadata.methods.find((m) => m.name === DEFAULT_METHOD);

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
      i.client.emit('commandBlock', i, response, { instance, metadata });
      return;
    }

    if (method.defer) await i.deferReply();

    for (const filter of method.filters ?? []) {
      let response = await filter(i);

      if (typeof response === 'boolean') {
        response = { block: response };
      }

      if (response.block) {
        i.client.emit('commandBlock', i, response, { instance, metadata });
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
    { instance, metadata }: CommandEntry
  ): Promise<void> {
    const autocomplete = metadata.autocomplete;
    if (!autocomplete) return;

    const execute = instance[autocomplete.methodName];
    if (!isAutocomplete(metadata, execute)) return;

    await execute(i);
  }
}
