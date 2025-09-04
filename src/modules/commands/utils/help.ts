import { Command, Cooldown, Execute } from '#framework';
import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

const embed = new EmbedBuilder();

@Command(new SlashCommandBuilder().setName('help').setDescription('Muestra la lista de comandos.'))
export class HelpCommand {
  @Execute()
  @Cooldown(6000)
  async run(i: ChatInputCommandInteraction) {
    if (!('description' in embed.data)) {
      const commands = await (await i.client.application.fetch()).commands.fetch();
      embed.setDescription('```\n' + commands.map((cmd) => `/${cmd.name}`).join('\n') + '\n```');
    }

    await i.reply({
      embeds: [embed]
    });
  }
}
