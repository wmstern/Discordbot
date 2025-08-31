import { ApplicationCommandType, type CommandInteraction } from 'discord.js';
import {
  AutocompleteMethod,
  CommandMetadata,
  CommandMethodMetadata
} from '../types/command.types.ts';

export function isCommandMethod(
  metadata: CommandMethodMetadata,
  method: unknown
): method is (i: CommandInteraction) => unknown {
  return (
    typeof method === 'function' &&
    method.length === 1 &&
    metadata.methodName === method.name
  );
}

export function isAutocomplete(
  metadata: CommandMetadata,
  method: unknown
): method is AutocompleteMethod {
  return (
    typeof method === 'function' &&
    method.length === 1 &&
    'autocomplete' in metadata &&
    metadata.type === ApplicationCommandType.ChatInput
  );
}
