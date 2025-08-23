import { Command, CommandBase } from '#framework';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

@Command('ping', { path: import.meta.dirname })
export class PingCommand extends CommandBase {
  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('devuelve pong.');
  cooldown = 3e3;

  async run(interaction: ChatInputCommandInteraction) {
    await interaction.reply('pong!');
  }
}
