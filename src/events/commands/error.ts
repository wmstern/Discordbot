import { Event, EventBase } from '#framework';
import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions
} from 'discord.js';
import { logger } from '../../common/logger.ts';

@Event('commandError')
export class CommandErrorEvent extends EventBase {
  async run(i: ChatInputCommandInteraction, err: Error) {
    logger.error(err);

    const content: InteractionReplyOptions = {
      content: 'There was an error while executing this command.',
      flags: MessageFlags.Ephemeral
    };

    if (i.replied || i.deferred) await i.followUp(content);
    else await i.reply(content);
  }
}
