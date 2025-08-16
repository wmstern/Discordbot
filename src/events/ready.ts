import { ClientEvent, once, type Client } from '#flamework';
import { Events } from 'discord.js';

@once
export default class ReadyEvent extends ClientEvent<'ready'> {
  constructor(client: Client) {
    super(client, { name: Events.ClientReady });
  }

  run() {
    console.log(this.client.user?.tag);
  }
}
