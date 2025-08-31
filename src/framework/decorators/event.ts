import type { ClientEvents } from 'discord.js';
import type { EventMethod } from '../types/event.types.ts';

export function Event<T extends keyof ClientEvents>(name: T) {
  return (_target: EventMethod<T>, context: DecoratorContext) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    context.metadata[context.name] = name;
  };
}
