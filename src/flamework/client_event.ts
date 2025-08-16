import { Client } from './client.ts';
import { Events, type ClientEvents } from 'discord.js';

export abstract class ClientEvent<
  T extends keyof ClientEvents = keyof ClientEvents
> {
  public readonly client: Client;
  public once = false;
  public readonly name: T;

  constructor(client: Client, opts: ClientEventOptions<T>) {
    this.client = client;
    if (opts.once) this.once = opts.once;
    if (!(opts.name in Events)) throw new Error(`invalid name: ${opts.name}`);
    this.name = opts.name;
  }

  abstract run(...args: ClientEvents[T]): Promise<void> | void;
}

export interface ClientEventOptions<T extends keyof ClientEvents> {
  once?: boolean;
  name: T;
}
