import { Event, type CooldownObject } from '#framework';
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

@Event('commandBlock')
export class CommandBlockEvent {
  async run(i: ChatInputCommandInteraction, reason: string, content: unknown) {
    if (reason === 'cooldown') {
      const cooldown = content as CooldownObject;
      const remaining = (
        (cooldown.start + cooldown.time - Date.now()) /
        1000
      ).toFixed(1);

      await i.reply({
        content: `You must wait ${remaining} seconds before using this command again.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
}
