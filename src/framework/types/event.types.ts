import type { Client, ClientEvents } from 'discord.js';

export type EventMethod<key extends keyof ClientEvents> = (...args: ClientEvents[key]) => unknown;

export type EventMetadata = Record<string, keyof ClientEvents | undefined>;

export type EventInstance = Record<string, EventMethod<keyof ClientEvents>>;

export interface EventClass {
  new (client?: Client): EventInstance;
  [Symbol.metadata]?: EventMetadata;
}

export interface EventEntry {
  instance: EventInstance;
  metadata: Readonly<EventMetadata>;
}
