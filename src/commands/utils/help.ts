import { Command, Cooldown, Execute } from '#framework';
import {
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js';

const KEY = 'GLOBAL';
const embeds: Record<PropertyKey, EmbedBuilder> = {};

@Command(
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra la lista de comandos.')
    .addBooleanOption((opt) =>
      opt
        .setName('server')
        .setDescription('Muestra la lista de comandos del server.')
    )
)
export class HelpCommand {
  @Execute()
  @Cooldown(6000)
  async run(i: ChatInputCommandInteraction) {
    if (!(KEY in embeds)) {
      embeds.global = new EmbedBuilder();
      const commands = await (
        await i.client.application.fetch()
      ).commands.fetch();
      embeds.global.setDescription(
        '```\n' + commands.map((cmd) => `/${cmd.name}`).join('\n') + '\n```'
      );
    }

    await i.reply({
      embeds: [embeds.global]
    });
  }
}
