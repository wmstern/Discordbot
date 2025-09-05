import type {
  ApplicationCommandType,
  AutocompleteInteraction,
  BaseInteraction,
  Client,
  CommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js';

export type Func<T extends unknown[], R> = (...arg: T) => R;

export type InteractionMethod<I extends BaseInteraction> = Func<[I], unknown>;
export type AutocompleteMethod = InteractionMethod<AutocompleteInteraction>;
export type CommandMethod<I extends CommandInteraction = CommandInteraction> = InteractionMethod<I>;

export interface FilterResponse {
  block: boolean;
  reason?: string;
  context?: unknown;
}

export type FilterReturns = boolean | FilterResponse | Promise<boolean> | Promise<FilterReturns>;
export type FilterFunc<I extends CommandInteraction = CommandInteraction> = Func<[I], FilterReturns>;

export interface CommandAutocompleteMetadata {
  methodName: string;
}

export interface CommandMethodMetadata {
  name: string;
  methodName: string;
  cooldown?: number;
  defer?: boolean;
  filters?: FilterFunc[];
}

export interface CommandMetadata {
  data: RESTPostAPIApplicationCommandsJSONBody;
  type: ApplicationCommandType;
  guild?: string;
  autocomplete?: CommandAutocompleteMetadata;
  methods: CommandMethodMetadata[];
}

export type CommandInstance = Record<PropertyKey, CommandMethod | AutocompleteMethod>;

export interface CommandClass {
  new (client?: Client): CommandInstance;
  [Symbol.metadata]?: CommandMetadata;
}

export interface CommandEntry {
  instance: CommandInstance;
  metadata: Readonly<CommandMetadata>;
}

export interface CooldownObject {
  userId: string;
  start: number;
  time: number;
  fn: NodeJS.Timeout;
}
