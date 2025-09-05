import type { ClientEvents } from 'discord.js';
import type { EventMetadata, EventMethod } from '../types/event.types.ts';

interface Context extends Omit<DecoratorContext, 'metadata'> {
  metadata: Partial<EventMetadata>;
}

export function Event<T extends keyof ClientEvents>(name: T) {
  return (_target: EventMethod<T>, context: Context) => {
    if (context.kind !== 'method' || typeof context.name !== 'string') throw new Error();
    context.metadata.methods ??= {};
    context.metadata.methods[context.name] = name;
  };
}
