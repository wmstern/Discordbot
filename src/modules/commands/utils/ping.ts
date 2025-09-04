import { Command, Cooldown, Execute } from '#framework';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

@Command(new SlashCommandBuilder().setName('ping').setDescription('devuelve pong.'))
export class PingCommand {
  @Execute()
  @Cooldown(3000)
  async run(interaction: ChatInputCommandInteraction) {
    const startTime = Date.now();

    await interaction.reply({
      content: 'Calculando ping...'
    });

    const endTime = Date.now();
    const pingTime = endTime - startTime;

    await interaction.editReply({
      content: `Pong! Mi latencia es de ${pingTime.toString()}ms.`
    });
  }
}
