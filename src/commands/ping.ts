import { Command, type Client } from '#flamework';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default class PingCommand extends Command {
  path = import.meta.dirname;

  constructor(client: Client) {
    super(
      client,
      new SlashCommandBuilder().setName('ping').setDescription('pong!')
    );
  }

  async run(interaction: ChatInputCommandInteraction) {
    await interaction.reply('pong!');
  }
}
