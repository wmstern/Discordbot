import 'reflect-metadata';
import type { CommandBase } from '../command_base.ts';

export interface CommandOptions {
  admin?: boolean;
  dev?: boolean;
  guild?: string;
  path: string;
}

export function Command(name: string, data: CommandOptions) {
  return (target: new () => CommandBase) => {
    Reflect.defineMetadata('command:name', name, target);
    Reflect.defineMetadata('command:data', data, target);
  };
}
