import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import 'reflect-metadata';
import type { CommandMethod } from '../types/command.types.ts';

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
      Reflect.defineMetadata('command:cooldown', time, this, context.name);
    });
  };
}

export function DeferReply(defer: boolean) {
  return (
    _target: CommandMethod,
    context: ClassMethodDecoratorContext<CommandBase>
  ) => {
    context.addInitializer(function () {
      Reflect.defineMetadata('command:defer', defer, this, context.name);
    });
  };
}
