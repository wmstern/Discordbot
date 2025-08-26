import { Command, Cooldown, DeferReply } from '#framework';
import {
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js';

const embed = new EmbedBuilder();

@Command(
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra la lista de comandos.')
)
export class HelpCommand {
  @DeferReply(true)
  @Cooldown(6000)
  async run(i: ChatInputCommandInteraction) {
    if (!embed.data.description) {
      const commands = await (
        await i.client.application.fetch()
      ).commands.fetch();
      embed.setDescription(
        '```\n' + commands.map((cmd) => `/${cmd.name}`).join('\n') + '\n```'
      );
    }

    await i.editReply({
      embeds: [embed]
    });
  }
}
