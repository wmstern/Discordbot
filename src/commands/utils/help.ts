import { Command, Cooldown, Filters } from '#framework';
import {
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js';

const embeds: Record<PropertyKey, EmbedBuilder> = {};

@Command(
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra la lista de comandos.')
    .addSubcommand((sub) =>
      sub
        .setName('global')
        .setDescription('Muestra la lista de comandos del bot.')
    )
    .addSubcommand((sub) =>
      sub
        .setName('server')
        .setDescription('Muestra la lista de comandos del servidor.')
    )
)
export class HelpCommand {
  @Cooldown(6000)
  async global(i: ChatInputCommandInteraction) {
    if (!('global' in embeds)) {
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

  @Cooldown(6000)
  @Filters((i) => !i.guild)
  async server(i: ChatInputCommandInteraction) {
    if (!i.guild) return;

    if (!(i.guild.id in embeds)) {
      embeds[i.guild.id] = new EmbedBuilder();
      const commands = await (await i.guild.fetch()).commands.fetch();
      embeds[i.guild.id].setDescription(
        '```\n' + commands.map((cmd) => `/${cmd.name}`).join('\n') + '\n```'
      );
    }

    await i.reply({
      embeds: [embeds[i.guild.id]]
    });
  }
}
