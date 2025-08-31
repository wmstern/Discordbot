import type {
  ApplicationCommandType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  ContextMenuCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord.js';

export type AutocompleteMethod = (i: AutocompleteInteraction) => unknown;
export type CommandMethod =
  | ((i: ChatInputCommandInteraction) => unknown)
  | ((i: ContextMenuCommandInteraction) => unknown)
  | ((i: CommandInteraction) => unknown);

export type CommandBase = Record<
  PropertyKey,
  CommandMethod | AutocompleteMethod
>;
export type CommandConstructor = new (...args: any) => CommandBase;

export type CommandMethodFilterResponse =
  | boolean
  | { block: boolean; reason: string; context?: unknown };
export type CommandMethodFilter = (
  i:
    | ChatInputCommandInteraction
    | ContextMenuCommandInteraction
    | CommandInteraction
) => CommandMethodFilterResponse | Promise<CommandMethodFilterResponse>;

export interface CommandMethodMetadata {
  methodName: string;
  name: string;
  cooldown?: number;
  defer?: boolean;
  filters: CommandMethodFilter[];
}

export interface SlashCommandAutocompleteMetadata {
  methodName: string;
}

export interface CommandMetadata {
  data:
    | RESTPostAPIChatInputApplicationCommandsJSONBody
    | RESTPostAPIContextMenuApplicationCommandsJSONBody;
  type: ApplicationCommandType;
  methods: CommandMethodMetadata[];
  autocomplete?: SlashCommandAutocompleteMetadata;
}

export interface CooldownObject {
  userId: string;
  start: number;
  time: number;
  fn: NodeJS.Timeout;
}
