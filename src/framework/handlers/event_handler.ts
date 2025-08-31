import { type Client, type ClientEvents } from 'discord.js';
import type { EventBase, EventConstructor } from '../types/event.types.ts';

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
      if (typeof Ev !== 'function' || !('prototype' in Ev)) continue;
      for (const key of Object.getOwnPropertyNames(Ev.prototype)) {
        if (key === 'constructor') continue;
        if (typeof (Ev.prototype as EventBase)[key] !== 'function') continue;

        const name = Ev[Symbol.metadata]?.[key] as
          | keyof ClientEvents
          | undefined;
        if (!name) continue;
        this.events.add(name);

        const instance = new Ev(Ev.length === 1 ? this.client : undefined);
        const fn = instance[key];
        this.client.on(name, (...args) => void fn(...args));
      }
    }
  }
}
