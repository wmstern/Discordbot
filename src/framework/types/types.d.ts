import 'discord.js';
import { CommandEntry, FilterResponse } from './command.types.ts';

declare module 'discord.js' {
  export interface ClientEvents {
    autocompleteError: [interaction: AutocompleteInteraction, error: Error, command: CommandEntry];
    commandError: [interaction: CommandInteraction, error: Error, metadata: CommandEntry];
    commandBlock: [interaction: CommandInteraction, res: FilterResponse, command: CommandEntry];
  }
}
