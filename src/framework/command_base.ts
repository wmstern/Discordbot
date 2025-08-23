import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder
} from 'discord.js';

export abstract class CommandBase {
  abstract data: CommandBuilder;
  abstract cooldown: number;

  private cooldowns = new Map<string, CooldownObject>();

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
      if (this.cooldowns.has(interaction.user.id)) {
        await this.onBlock(
          interaction,
          'cooldown',
          this.cooldowns.get(interaction.user.id)
        );
        return;
      }

      await this.run(interaction);
    } catch (err) {
      void this.onError(interaction, err as Error);
    } finally {
      this.addCooldown(interaction.user.id);
    }
  }

  async executeAutocomplete(interaction: AutocompleteInteraction) {
    try {
      await this.autocomplete?.(interaction);
    } catch (err) {
      interaction.client.emit('error', err as Error);
    }
  }

  addCooldown(userId: string): CooldownObject {
    const content: CooldownObject = {
      userId,
      time: this.cooldown,
      start: Date.now(),
      fn: setTimeout(() => this.cooldowns.delete(userId), this.cooldown)
    };

    this.cooldowns.set(userId, content);

    return content;
  }

  toJSON() {
    return this.data.toJSON();
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
