import type { Client, ClientEvents } from 'discord.js';
import type { EventMethod, EventConstructor } from '../types/event.types.ts';

export class EventHandler {
  public readonly events = new Set<keyof ClientEvents>();

  constructor(
    protected readonly client: Client,
    private evs: EventConstructor[]
  ) {
    this.#getEventsStructures();
  }

  #getEventsStructures() {
    for (const Ev of this.evs) {
      for (const key of Object.getOwnPropertyNames(Ev.prototype)) {
        if (key === 'constructor') continue;
        const descriptor = Object.getOwnPropertyDescriptor(Ev.prototype, key);
        if (typeof descriptor?.value !== 'function') continue;
        const name = Ev[Symbol.metadata]?.[key] as
          | keyof ClientEvents
          | undefined;
        if (!name) continue;
        this.events.add(name);

        const fn = descriptor.value as EventMethod<keyof ClientEvents>;
        this.client.on(name, (...args) => void fn(...args));
      }
    }
  }
}
