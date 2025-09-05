import {
  ApplicationCommandType,
  type Client,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord.js';
import type { CommandMetadata } from '../types/command.types.ts';

type CommandConstructor = (new () => object) | (new (client: Client) => object);
interface Context extends Omit<DecoratorContext, 'metadata'> {
  metadata: Partial<CommandMetadata>;
}

export function Command(
  command:
    | RESTPostAPIChatInputApplicationCommandsJSONBody
    | RESTPostAPIContextMenuApplicationCommandsJSONBody
) {
  const data = command;
  return (_target: CommandConstructor, context: Context) => {
    if (context.kind !== 'class') throw new Error();
    context.metadata.data = data;
    context.metadata.type = data.type ?? ApplicationCommandType.ChatInput;
    if (!Array.isArray(context.metadata.methods)) context.metadata.methods = [];
  };
}
