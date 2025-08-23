import 'reflect-metadata';
import { CommandBase } from '../command_base.ts';
import { EventBase } from '../event_base.ts';

export interface ModuleOptions {
  imports?: (new () => object)[];
  commands?: (new () => CommandBase)[];
  events?: (new () => EventBase)[];
}

export function Module(options: ModuleOptions) {
  return (target: new () => object) => {
    Reflect.defineMetadata('module:metadata', options, target);
  };
}
