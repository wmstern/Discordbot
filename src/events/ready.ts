import { ClientEvent, type Client } from '#flamework';
import { Events } from 'discord.js';

export default class ReadyEvent extends ClientEvent<'ready'> {
  constructor(client: Client) {
    super(client, { name: Events.ClientReady });
  }

  run() {
    console.log(this.client.user?.tag);
  }
}
