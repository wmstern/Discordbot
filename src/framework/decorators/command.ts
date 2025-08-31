import type {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';

export type SlashCommand =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export type ContextMenuCommand = ContextMenuCommandBuilder;

export type CommandOptions = SlashCommand | ContextMenuCommandBuilder;

type CommandConstructor = new () => object;

export function Command(command: CommandOptions) {
  const data = command.toJSON();
  return (_target: CommandConstructor, context: DecoratorContext) => {
    if (context.kind !== 'class') throw new Error();
    context.metadata.data = data;
    context.metadata.type = data.type;
    context.metadata.methods ??= [];
  };
}

export function SlashCommand(command: SlashCommand) {
  return Command(command);
}

export function ContextMenuCommand(command: ContextMenuCommand) {
  return Command(command);
}
