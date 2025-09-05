import type { Client } from 'discord.js';
import type { EventStore } from '../stores/event_store.ts';

export class EventDispatcher {
  constructor(
    private readonly client: Client,
    private readonly store: EventStore
  ) {}

  dispatchAll(): void {
    for (const { instance, metadata } of this.store.values()) {
      for (const [methodName, eventName] of Object.entries(metadata.methods)) {
        const handler = instance[methodName];
        this.client.on(eventName, (...args) => handler.apply(instance, args));
      }
    }
  }
}
