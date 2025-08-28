import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import 'reflect-metadata';
import type {
  CommandMethod,
  CommandMethodFilter,
  CommandMethodMetadata
} from '../types/command.types.ts';

export type CommandOptions =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder;

type CommandBase = object;
type CommandConstructor = new () => object;

export function Command(command: CommandOptions) {
  const data = command.toJSON();
  return (target: CommandConstructor) => {
    Reflect.defineMetadata('command:data', data, target);
  };
}

export function Cooldown(time: number) {
  return (
    _target: CommandMethod,
    context: ClassMethodDecoratorContext<CommandBase>
  ) => {
    context.addInitializer(function () {
      const original = (Reflect.getMetadata(
        'command:method',
        this,
        context.name
      ) ?? { methodName: context.name, filters: [] }) as CommandMethodMetadata;
      const method: CommandMethodMetadata = { ...original, cooldown: time };
      Reflect.defineMetadata('command:method', method, this, context.name);
    });
  };
}

export function DeferReply(defer = true) {
  return (
    _target: CommandMethod,
    context: ClassMethodDecoratorContext<CommandBase>
  ) => {
    context.addInitializer(function () {
      const original = (Reflect.getMetadata(
        'command:method',
        this,
        context.name
      ) ?? { methodName: context.name, filters: [] }) as CommandMethodMetadata;
      const method: CommandMethodMetadata = { ...original, defer };
      Reflect.defineMetadata('command:method', method, this, context.name);
    });
  };
}

export function Filters(...filters: CommandMethodFilter[]) {
  return (
    _target: CommandMethod,
    context: ClassMethodDecoratorContext<CommandBase>
  ) => {
    context.addInitializer(function () {
      const original = (Reflect.getMetadata(
        'command:method',
        this,
        context.name
      ) ?? { methodName: context.name, filters: [] }) as CommandMethodMetadata;
      const method: CommandMethodMetadata = {
        ...original,
        filters: [...original.filters, ...filters]
      };
      Reflect.defineMetadata('command:method', method, this, context.name);
    });
  };
}
