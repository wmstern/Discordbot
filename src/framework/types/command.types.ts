import type {
  ApplicationCommandType,
  AutocompleteInteraction,
  BaseInteraction,
  Client,
  CommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js';

export type InteractionMethod<I extends BaseInteraction, R = unknown> = (i: I) => R;
export type AutocompleteMethod = InteractionMethod<AutocompleteInteraction>;
export type CommandMethod<I extends CommandInteraction = CommandInteraction> = InteractionMethod<I>;

export interface FilterResponse {
  block: boolean;
  reason?: string;
  context?: unknown;
}
export type FilterFunc<I extends CommandInteraction = CommandInteraction> = InteractionMethod<
  I,
  (boolean | FilterResponse) | Promise<boolean | FilterResponse>
>;

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
