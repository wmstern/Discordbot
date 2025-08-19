import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { Client } from './client.ts';

export abstract class Command {
  public readonly client: Client;

  public readonly builder: CommandBuilder;
  public readonly data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  public readonly guild?: string;

  abstract path: string;

  public adminOnly = false;
  public cooldown = 3e3;
  public readonly cooldowns = new Map<string, CooldownObject>();

  constructor(client: Client, builder: CommandBuilder) {
    this.client = client;
    this.builder = builder;
    this.data = builder.toJSON();
  }

  abstract run(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;

  onBlock(
    interaction: ChatInputCommandInteraction,
    reason: string,
    content?: CooldownObject
  ): Promise<void> | void {
    this.client.emit('commandBlock', interaction, reason, content);
  }
  onError(
    interaction: ChatInputCommandInteraction,
    err: Error
  ): Promise<void> | void {
    this.client.emit('commandError', interaction, err);
  }

  get id(): string | undefined {
    let id: string | undefined;
    void this.client.application?.commands.fetch().then((cmds) => {
      id = cmds.find((cmd) => cmd.name === this.data.name)?.id;
    });
    return id;
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

      await this.run(interaction).finally(() =>
        this.addCooldown(interaction.user.id)
      );
    } catch (err) {
      void this.onError(interaction, err as Error);
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
