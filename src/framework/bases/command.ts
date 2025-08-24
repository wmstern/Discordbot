import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import 'reflect-metadata';

export abstract class CommandBase {
  cooldown = 3e3;

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
    try {
      const cooldown = Reflect.getMetadata(
        'command:cooldown',
        this,
        'run'
      ) as number;
      if (cooldown) {
        if (this.cooldowns.has(interaction.user.id)) {
          await this.onBlock(
            interaction,
            'cooldown',
            this.cooldowns.get(interaction.user.id)
          );
          return;
        } else {
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

      await this.run(interaction);
    } catch (err) {
      await this.onError(interaction, err as Error);
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
