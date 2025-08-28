import { ApplicationCommandType } from 'discord.js';
import {
  CommandBase,
  CommandMethod,
  ContextMenuCommandBase,
  ContextMenuCommandMethod,
  SlashCommandBase,
  SlashCommandMethod
} from '../types/command.types.ts';

export function isSlashCommand(
  instance: unknown,
  type: ApplicationCommandType
): instance is SlashCommandBase {
  return (
    typeof instance === 'object' && type === ApplicationCommandType.ChatInput
  );
}

export function isSlashCommandMethod(
  method: unknown,
  instance: SlashCommandBase
): method is SlashCommandMethod {
  return typeof method === 'function' && method.name in instance;
}

export function isContextMenuCommand(
  instance: unknown,
  type: ApplicationCommandType
): instance is ContextMenuCommandBase {
  return (
    typeof instance === 'object' &&
    (type === ApplicationCommandType.Message ||
      type === ApplicationCommandType.User)
  );
}

export function isContextMenuCommandMethod(
  method: unknown,
  instance: ContextMenuCommandBase
): method is ContextMenuCommandMethod {
  return typeof method === 'function' && method.name in instance;
}

export function isCommand(
  instance: unknown,
  type: ApplicationCommandType
): instance is CommandBase {
  return isSlashCommand(instance, type) || isContextMenuCommand(instance, type);
}

export function isCommandMethod(
  method: unknown,
  instance: CommandBase
): method is CommandMethod {
  return typeof method === 'function' && method.name in instance;
}
