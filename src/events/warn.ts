import { ClientEvent, type Client } from '#flamework';
import { Events } from 'discord.js';

export default class WarnEvent extends ClientEvent<'warn'> {
  constructor(client: Client) {
    super(client, {
      name: Events.Warn
    });
  }

  run(msg: string) {
    console.warn(msg);
  }
}
