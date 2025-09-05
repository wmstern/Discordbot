import type { Client, ClientEvents } from 'discord.js';

export type EventMethod<key extends keyof ClientEvents> = (...args: ClientEvents[key]) => unknown;

export interface EventMetadata {
  methods: Record<string, keyof ClientEvents>;
}

export type EventInstance = Record<PropertyKey, EventMethod<keyof ClientEvents>>;

export interface EventClass {
  new (client?: Client): EventInstance;
  [Symbol.metadata]?: EventMetadata;
}

export interface EventEntry {
  instance: EventInstance;
  metadata: Readonly<EventMetadata>;
}
