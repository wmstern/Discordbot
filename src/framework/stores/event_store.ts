import { Collection } from 'discord.js';
import type { EventClass, EventEntry, EventMetadata } from '../types/event.types.ts';

export class EventStore extends Collection<string, EventEntry> {
  registerEvents(events: EventClass[]) {
    for (const eventClass of events) {
      this.registerEvent(eventClass);
    }
  }

  registerEvent(eventClass: EventClass) {
    if (typeof eventClass !== 'function' || !('prototype' in eventClass)) throw new Error();

    const eventMetadata = this.getMetadata(eventClass);
    if (!eventMetadata) return;

    const eventInstance = new eventClass();

    const eventEntry = {
      instance: eventInstance,
      metadata: Object.freeze(eventMetadata)
    };

    this.set(eventClass.name, eventEntry);
  }

  private getMetadata(eventClass: EventClass): EventMetadata | undefined {
    const eventMetadata = eventClass[Symbol.metadata];
    if (!eventMetadata?.methods) return;
    return eventMetadata;
  }
}
