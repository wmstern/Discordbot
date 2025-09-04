import { Event, type CooldownObject, type FilterResponse } from '#framework';
import { MessageFlags, type CommandInteraction } from 'discord.js';

export class CommandBlockEvent {
  @Event('commandBlock')
  async onBlock(i: CommandInteraction, { reason, context }: FilterResponse): Promise<void> {
    const replied = i.replied || i.deferred;

    if (reason === 'cooldown') {
      const cooldown = context as CooldownObject;
      const remaining = ((cooldown.start + cooldown.time - Date.now()) / 1000).toFixed(1);

      await i[replied ? 'followUp' : 'reply']({
        content: `You must wait ${remaining} seconds before using this command again.`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await i[replied ? 'followUp' : 'reply']({
        content: String(context),
        flags: MessageFlags.Ephemeral
      });
    }
  }
}
