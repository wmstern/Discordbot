import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction
} from 'discord.js';

export interface CommandStructure {
  run(i: ChatInputCommandInteraction | ContextMenuCommandInteraction): unknown;
}

export interface SlashCommandBase extends CommandStructure {
  autocomplete?(i: AutocompleteInteraction): unknown;
}

export type ContextMenuCommandBase = CommandStructure;

export type CommandBase = SlashCommandBase | ContextMenuCommandBase;

export type SlashCommandConstructor = new () => SlashCommandBase;
export type ContextMenuCommandConstructor = new () => ContextMenuCommandBase;

export type CommandConstructor =
  | SlashCommandConstructor
  | ContextMenuCommandConstructor;

export interface CooldownObject {
  userId: string;
  start: number;
  time: number;
  fn: NodeJS.Timeout;
}
