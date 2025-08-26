import { Event } from '#framework';
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { logger } from '../../common/logger.ts';

@Event('commandError')
export class CommandErrorEvent {
  async run(i: ChatInputCommandInteraction, err: Error) {
    logger.error(err);

    if (i.replied || i.deferred)
      await i.followUp({
        content: 'There was an error while executing this command.',
        flags: MessageFlags.Ephemeral
      });
    else
      await i.reply({
        content: 'There was an error while executing this command.',
        flags: MessageFlags.Ephemeral
      });
  }
}
