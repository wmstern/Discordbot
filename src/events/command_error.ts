import { ClientEvent, type Client } from '#flamework';
import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions
} from 'discord.js';

export default class CommandErrorEvent extends ClientEvent<'commandError'> {
  constructor(client: Client) {
    super(client, {
      name: 'commandError'
    });
  }

  async run(i: ChatInputCommandInteraction, err: Error) {
    console.error(err);

    const content: InteractionReplyOptions = {
      content: 'There was an error while executing this command.',
      flags: MessageFlags.Ephemeral
    };

    if (i.replied || i.deferred) await i.followUp(content);
    else await i.reply(content);
  }
}
