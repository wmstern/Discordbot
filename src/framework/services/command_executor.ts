import type {
  AutocompleteInteraction,
  BaseInteraction,
  Client,
  CommandInteraction
} from 'discord.js';
import { DEFAULT_METHOD } from '../decorators/command_method.ts';
import type { CommandStore } from '../stores/command_store.ts';
import type { CommandMethodMetadata, CooldownObject } from '../types/command.types.ts';
import { isAutocomplete, isCommandMethod } from '../utils/command_helpers.ts';

export class CommandExecutor {
  _cooldowns = new Map<string, Map<string, CooldownObject>>();
  constructor(
    private readonly client: Client,
    private readonly store: CommandStore
  ) {
    this.client.on('interactionCreate', (i) => void this.handleInteraction(i));
  }

  private async handleInteraction(interaction: BaseInteraction): Promise<void> {
    if (interaction.isAutocomplete()) await this.executeAutocomplete(interaction);
    else if (interaction.isCommand()) await this.executeCommand(interaction);
  }

  private async executeCommand(interaction: CommandInteraction): Promise<void> {
    const entry = this.store.get(interaction.commandName);
    if (!entry) return;

    const { instance, metadata } = entry;

    let method: CommandMethodMetadata | undefined;

    if (interaction.isChatInputCommand()) {
      const sub = interaction.options.getSubcommand(false);
      if (sub) method = metadata.methods.find((m) => m.name === sub);
    }

    method ??= metadata.methods.find((m) => m.name === DEFAULT_METHOD);
    if (!method) return;

    const func = instance[method.methodName];
    if (!isCommandMethod(method, func)) return;

    if (!this.#cooldown(interaction, method)) return;

    if (method.defer) await interaction.deferReply();

    if (!(await this.#filters(interaction, method))) return;

    try {
      await func(interaction);
    } catch (err) {
      this.client.emit('commandError', interaction, err as Error, entry);
    }
  }

  private async executeAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const entry = this.store.get(interaction.commandName);
    if (!entry) return;

    const { instance, metadata } = entry;
    if (!metadata.autocomplete) return;

    const func = instance[metadata.autocomplete.methodName];
    if (!isAutocomplete(metadata, func)) return;

    try {
      await func(interaction);
    } catch (err) {
      this.client.emit('autocompleteError', interaction, err as Error, entry);
    }
  }

  #cooldown(interaction: CommandInteraction, metadata: CommandMethodMetadata): boolean {
    const key = interaction.commandName + metadata.name;
    const cooldown = metadata.cooldown;

    if (!this._cooldowns.has(key)) this._cooldowns.set(key, new Map());
    const cooldowns = this._cooldowns.get(key);
    if (!cooldowns || !cooldown) return true;

    const hasCooldown = cooldowns.has(interaction.user.id);

    if (hasCooldown) {
      const res = {
        block: true,
        reason: 'cooldown',
        context: cooldowns.get(interaction.user.id)
      };

      this.client.emit('commandBlock', interaction, res, this.store.get(interaction.commandName));

      return false;
    }

    cooldowns.set(interaction.user.id, {
      userId: interaction.user.id,
      time: cooldown,
      start: Date.now(),
      fn: setTimeout(() => cooldowns.delete(interaction.user.id), cooldown)
    });

    return true;
  }

  async #filters(
    interaction: CommandInteraction,
    metadata: CommandMethodMetadata
  ): Promise<boolean> {
    if (!metadata.filters) return true;

    for (const filter of metadata.filters) {
      let res = await filter(interaction);

      if (typeof res === 'boolean') res = { block: res };

      if (res.block) {
        this.client.emit('commandBlock', interaction, res, this.store.get(interaction.commandName));
        return false;
      }
    }

    return true;
  }
}
