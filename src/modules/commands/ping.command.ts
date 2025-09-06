import { Command, Cooldown, Execute } from '#framework';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

@Command(new SlashCommandBuilder().setName('ping').setDescription('devuelve pong.').toJSON())
export class PingCommand {
  @Execute()
  @Cooldown(3000)
  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const startTime = Date.now();

    await interaction.reply({
      content: 'Calculando ping...'
    });

    const pingTime = Date.now() - startTime;

    await interaction.editReply({
      content: `Pong! Mi latencia es de ${String(pingTime)}ms.`
    });
  }
}
