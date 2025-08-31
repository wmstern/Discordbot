import type { Client, ClientEvents } from 'discord.js';

export type EventMethod<key extends keyof ClientEvents> = (
  ...args: ClientEvents[key]
) => unknown;

export type EventBase = Record<PropertyKey, EventMethod<keyof ClientEvents>>;

export type EventConstructor = new (client?: Client) => EventBase;
