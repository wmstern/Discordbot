import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions
} from 'discord.js';
import { Event, EventBase } from '#framework';

@Event('commandError')
export class CommandErrorEvent extends EventBase {
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
