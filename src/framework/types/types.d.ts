import 'discord.js';
import {
  CommandContext,
  CommandMetadata,
  FilterResponse
} from './command.types.ts';

declare module 'discord.js' {
  export interface ClientEvents {
    autocompleteError: [
      interaction: AutocompleteInteraction,
      error: Error,
      metadata: CommandMetadata
    ];
    commandError: [
      interaction: CommandContext,
      error: Error,
      metadata: CommandMetadata
    ];
    commandBlock: [
      interaction: CommandContext,
      response: FilterResponse,
      metadata: CommandMetadata
    ];
  }
}
