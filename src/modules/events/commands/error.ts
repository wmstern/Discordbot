import { Event } from '#framework';
import {
  MessageFlags,
  type AutocompleteInteraction,
  type CommandInteraction
} from 'discord.js';
import { logger } from '../../../common/logger.ts';

export class CommandErrorEvents {
  @Event('commandError')
  async command(i: CommandInteraction, err: Error) {
    logger.error(err);

    const replied = i.replied || i.deferred;

    await i[replied ? 'followUp' : 'reply']({
      content: 'There was an error while executing this command.',
      flags: MessageFlags.Ephemeral
    });
  }

  @Event('autocompleteError')
  autocomplete(_i: AutocompleteInteraction, err: Error) {
    logger.error(err);
  }
}
