import 'discord.js';
import type { AnyCommand } from './client.ts';
import type { CooldownObject } from './command.ts';

declare module 'discord.js' {
  export interface Client {
    commands: Map<string, AnyCommand>;
  }
  export interface ClientEvents {
    commandError: [intraction: ChatInputCommandInteraction, error: Error];
    commandBlock: [
      interaction: ChatInputCommandInteraction,
      reason: string,
      content?: CooldownObject
    ];
    autocompleteInteraction: [interaction: AutocompleteInteraction];
    commandInteraction: [interaction: ChatInputCommandInteraction];
    messageComponentInteraction: [interaction: MessageComponentInteraction];
    modalSubmitInteraction: [interaction: ModalSubmitInteraction];
  }
}
