import type {
  ApplicationCommandType,
  AutocompleteInteraction,
  Client,
  CommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord.js';

export type AutocompleteMethod = (i: AutocompleteInteraction) => unknown;
export type CommandMethod<T extends CommandInteraction = CommandInteraction> = (
  interaction: T
) => unknown;

export type CommandBase = Record<
  PropertyKey,
  CommandMethod | AutocompleteMethod
>;
export interface CommandConstructor {
  new (client?: Client): CommandBase;
  [Symbol.metadata]?: CommandMetadata;
}

export interface FilterResponse {
  block: boolean;
  reason?: string;
  context?: unknown;
}
export type CommandMethodFilterResponse =
  | (FilterResponse | boolean)
  | Promise<FilterResponse | boolean>;

export type CommandMethodFilter<
  T extends CommandInteraction = CommandInteraction
> = (interaction: T) => CommandMethodFilterResponse;

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
