import { ClientEvent, type Client, type CooldownObject } from '#flamework';
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

export default class CommandBlockEvent extends ClientEvent<'commandBlock'> {
  constructor(client: Client) {
    super(client, {
      name: 'commandBlock'
    });
  }

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
