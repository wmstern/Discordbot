import { ClientEvent, type Client } from '#flamework';
import { Events } from 'discord.js';

export default class ErrorEvent extends ClientEvent<'error'> {
  constructor(client: Client) {
    super(client, {
      name: Events.Error
    });
  }

  run(err: Error) {
    console.error(err);
  }
}
