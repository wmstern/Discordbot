import type {
  ApplicationCommandType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  CommandInteraction,
  ContextMenuCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord.js';

export type CommandContext =
  | CommandInteraction
  | ChatInputCommandInteraction
  | ContextMenuCommandInteraction;

export type AutocompleteMethod = (i: AutocompleteInteraction) => unknown;
export type CommandMethod<T extends CommandContext> = (
  interaction: T
) => unknown;

export type CommandBase = Record<
  PropertyKey,
  CommandMethod<CommandContext> | AutocompleteMethod
>;
export type CommandConstructor = new (client?: Client) => CommandBase;

export interface FilterResponse {
  block: boolean;
  reason?: string;
  context?: unknown;
}
export type CommandMethodFilterResponse =
  | (FilterResponse | boolean)
  | Promise<FilterResponse | boolean>;

export type CommandMethodFilter<T extends CommandContext> = (
  interaction: T
) => CommandMethodFilterResponse;

export interface CommandMethodMetadata {
  methodName: string;
  name: string;
  cooldown?: number;
  defer?: boolean;
  filters: CommandMethodFilter<CommandContext>[];
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
