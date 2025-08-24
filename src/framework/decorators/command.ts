import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import 'reflect-metadata';
import type { CommandBase } from '../bases/command.ts';

export type CommandOptions =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder;

export type CommandConstructor = new () => CommandBase;

export function Command(command: CommandOptions) {
  const data = command.toJSON();
  return (target: CommandConstructor) => {
    Reflect.defineMetadata('command:data', data, target);
  };
}

export function Cooldown(time: number) {
  return (
    _target: (i: ChatInputCommandInteraction) => any,
    context: ClassMethodDecoratorContext<CommandBase>
  ) => {
    context.addInitializer(function () {
      Reflect.defineMetadata('command:cooldown', time, this, context.name);
    });
  };
}

export function GuildId(id: string) {
  return (target: CommandConstructor) => {
    Reflect.defineMetadata('command', id, target);
  };
}

export function DeferReply(defer: boolean) {
  return (
    _target: (i: ChatInputCommandInteraction) => any,
    context: ClassMethodDecoratorContext<CommandBase>
  ) => {
    context.addInitializer(function () {
      Reflect.defineMetadata('command:defer', defer, this, context.name);
    });
  };
}
