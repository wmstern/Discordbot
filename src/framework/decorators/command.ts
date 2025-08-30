import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import type {
  CommandMetadata,
  CommandMethod,
  CommandMethodFilter
} from '../types/command.types.ts';

export type CommandOptions =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

type CommandConstructor = new () => object;

export function Command(command: CommandOptions) {
  return (_target: CommandConstructor, context: ClassDecoratorContext) => {
    context.metadata.data = command.toJSON();
    context.metadata.methods ??= {};
  };
}

export function Cooldown(time: number) {
  return (_target: CommandMethod, context: ClassMethodDecoratorContext) => {
    context.metadata.methods ??= {};
    const methods = context.metadata.methods as CommandMetadata['methods'];
    const method = (methods[String(context.name)] ??= {
      methodName: String(context.name),
      filters: []
    });
    method.cooldown = time;
  };
}

export function DeferReply(defer = true) {
  return (_target: CommandMethod, context: ClassMethodDecoratorContext) => {
    context.metadata.methods ??= {};
    const methods = context.metadata.methods as CommandMetadata['methods'];
    const method = (methods[String(context.name)] ??= {
      methodName: String(context.name),
      filters: []
    });
    method.defer = defer;
  };
}

export function Filters(...filters: CommandMethodFilter[]) {
  return (_target: CommandMethod, context: ClassMethodDecoratorContext) => {
    context.metadata.methods ??= {};
    const methods = context.metadata.methods as CommandMetadata['methods'];
    const method = (methods[String(context.name)] ??= {
      methodName: String(context.name),
      filters: []
    });
    method.filters.push(...filters);
  };
}
