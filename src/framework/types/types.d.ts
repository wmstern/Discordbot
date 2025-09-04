import 'discord.js';
import { CommandMetadata, FilterResponse } from './command.types.ts';

declare module 'discord.js' {
  export interface ClientEvents {
    autocompleteError: [
      interaction: AutocompleteInteraction,
      error: Error,
      metadata: CommandMetadata
    ];
    commandError: [interaction: CommandInteraction, error: Error, metadata: CommandMetadata];
    commandBlock: [
      interaction: CommandInteraction,
      response: FilterResponse,
      metadata: CommandMetadata
    ];
  }
}
