import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord.js';

export type SlashCommandMethod = (i: ChatInputCommandInteraction) => unknown;
export type SlashCommandAutocomplete = (i: AutocompleteInteraction) => unknown;
export type ContextMenuCommandMethod = (
  i: ContextMenuCommandInteraction
) => unknown;
export type CommandMethod = SlashCommandMethod | ContextMenuCommandMethod;

export interface SlashCommandBase {
  run: SlashCommandMethod;
  autocomplete?: SlashCommandAutocomplete;
  [key: string]: SlashCommandMethod | SlashCommandAutocomplete | undefined;
}

export interface ContextMenuCommandBase {
  run: ContextMenuCommandMethod;
}

export type CommandBase = SlashCommandBase | ContextMenuCommandBase;

export type SlashCommandConstructor = new () => SlashCommandBase;
export type ContextMenuCommandConstructor = new () => ContextMenuCommandBase;
export type CommandConstructor =
  | SlashCommandConstructor
  | ContextMenuCommandConstructor;

export type CommandMethodFilter = (
  i: ChatInputCommandInteraction | ContextMenuCommandInteraction
) => boolean;

export interface CommandMethodMetadata {
  methodName: string;
  isAutocomplete?: boolean;
  cooldown?: number;
  defer?: boolean;
  filters: CommandMethodFilter[];
}

export interface CommandMetadata {
  data:
    | RESTPostAPIChatInputApplicationCommandsJSONBody
    | RESTPostAPIContextMenuApplicationCommandsJSONBody;
  methods: Record<string, CommandMethodMetadata>;
}

export interface CooldownObject {
  userId: string;
  start: number;
  time: number;
  fn: NodeJS.Timeout;
}
