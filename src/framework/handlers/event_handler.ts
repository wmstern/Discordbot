import type { Client } from 'discord.js';
import 'reflect-metadata';
import type { EventConstructor } from '../types/event.types.ts';

export class EventHandler {
  public readonly events = new Set<string>();
  public readonly eventInstances: InstanceType<EventConstructor>[] = [];

  constructor(
    protected readonly client: Client,
    private evs: EventConstructor[]
  ) {
    this.#getEventsStructures();
  }

  #getEventsStructures() {
    for (const Ev of this.evs) {
      const name = Reflect.getMetadata('event:name', Ev) as string | undefined;
      if (!name) continue;
      const instance = new Ev();
      this.eventInstances.push(instance);
      this.#RegisterEvent(name, instance);
    }
  }

  #RegisterEvent(name: string, ev: InstanceType<EventConstructor>) {
    this.client.on(name, (...args: unknown[]) => void ev.run(...args));
  }
}
