import { CommandContext, Event } from '#framework';
import { MessageFlags, type AutocompleteInteraction } from 'discord.js';
import { logger } from '../../common/logger.ts';

export class CommandErrorEvent {
  @Event('commandError')
  async command(i: CommandContext, err: Error) {
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

  @Event('autocompleteError')
  autocomplete(_i: AutocompleteInteraction, err: Error) {
    logger.error(err);
  }
}
