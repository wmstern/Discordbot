import { type Client } from 'discord.js';
import { Event, EventBase } from '#framework';

@Event('ready')
export class ReadyEvent extends EventBase {
  run(client: Client) {
    console.log(client.user?.tag);
  }
}
