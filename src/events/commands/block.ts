import { Event, type CooldownObject, type FilterResponse } from '#framework';
import { MessageFlags, type CommandInteraction } from 'discord.js';

export class CommandBlockEvent {
  @Event('commandBlock')
  async onCooldown(i: CommandInteraction, { reason, context }: FilterResponse) {
    if (reason === 'cooldown') {
      const cooldown = context as CooldownObject;
      const remaining = (
        (cooldown.start + cooldown.time - Date.now()) /
        1000
      ).toFixed(1);

      const replied = i.replied || i.deferred;

      await i[replied ? 'followUp' : 'reply']({
        content: `You must wait ${remaining} seconds before using this command again.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
}
