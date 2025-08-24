import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import 'reflect-metadata';

export abstract class CommandBase {
  cooldowns = new Map<string, CooldownObject>();

  abstract run(interaction: ChatInputCommandInteraction): unknown;
  autocomplete?(interaction: AutocompleteInteraction): unknown;

  onBlock(
    interaction: ChatInputCommandInteraction,
    reason: string,
    content?: CooldownObject
  ): void | Promise<void> {
    interaction.client.emit('commandBlock', interaction, reason, content);
  }
  onError(
    interaction: ChatInputCommandInteraction,
    err: Error
  ): void | Promise<void> {
    interaction.client.emit('commandError', interaction, err);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    const defer = Reflect.getMetadata('command:defer', this, 'run') as boolean;

    if (defer) await interaction.deferReply();

    const cooldown = Reflect.getMetadata(
      'command:cooldown',
      this,
      'run'
    ) as number;
    const hasCooldown = cooldown ? this.cooldowns.has(userId) : false;

    try {
      if (hasCooldown) {
        await this.onBlock(interaction, 'cooldown', this.cooldowns.get(userId));
        return;
      }

      await this.run(interaction);
    } catch (err) {
      await this.onError(interaction, err as Error);
    } finally {
      if (cooldown && !hasCooldown)
        this.cooldowns.set(interaction.user.id, {
          userId: interaction.user.id,
          start: Date.now(),
          time: cooldown,
          fn: setTimeout(
            () => this.cooldowns.delete(interaction.user.id),
            cooldown
          )
        });
    }
  }

  async executeAutocomplete(interaction: AutocompleteInteraction) {
    try {
      await this.autocomplete?.(interaction);
    } catch (err) {
      interaction.client.emit('error', err as Error);
    }
  }
}

export type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder;

export interface CooldownObject {
  userId: string;
  time: number;
  start: number;
  fn: NodeJS.Timeout;
}
