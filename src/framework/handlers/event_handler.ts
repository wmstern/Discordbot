import type { Client, ClientEvents } from 'discord.js';
import type { EventConstructor } from '../types/event.types.ts';

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
      if (typeof Ev !== 'function' || !('prototype' in Ev)) throw new Error();

      for (const [key, value] of Object.entries(Ev.prototype as object)) {
        if (key === 'constructor') continue;
        if (typeof value !== 'function') continue;

        const name = Ev[Symbol.metadata]?.[key] as
          | keyof ClientEvents
          | undefined;
        if (!name) continue;
        this.events.add(name);

        const instance = new Ev();
        const fn = instance[key];
        this.client.on(name, (...args) => void fn(...args));
      }
    }
  }
}
