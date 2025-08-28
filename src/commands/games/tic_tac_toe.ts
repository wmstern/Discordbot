import { Command, Cooldown, DeferReply } from '#framework';
import {
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js';
import { TTTCollector } from '../../services/tic_tac_toe/collector.ts';
import GameLogic from '../../services/tic_tac_toe/logic.ts';
import { Difficulties } from '../../types/ttt.types.ts';

const games = new Set<string>();
const collector = new TTTCollector();

@Command(
  new SlashCommandBuilder()
    .setName('tic_tac_toe')
    .setDescription('El clasico juego tic tac toe.')
    .addUserOption((opt) =>
      opt
        .setName('adversario')
        .setDescription('El segundo jugador.')
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName('dificultad')
        .setDescription(
          'Escoge la dificultad contra la que jugaras contra el bot.'
        )
        .setChoices(
          Object.values(Difficulties).map((v) => ({ name: v, value: v }))
        )
        .setRequired(false)
    )
)
export class TTTCommand {
  @DeferReply(true)
  @Cooldown(12000)
  async run(i: ChatInputCommandInteraction) {
    const channel = i.channel?.id ?? '';

    if (games.has(channel)) {
      await i.followUp({
        content: 'Ya hay una partida activa en este canal.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    games.add(channel);

    const player1 = i.user;
    const player2 = i.options.getUser('adversario', false) ?? i.client.user;
    const difficulty =
      (i.options.getString('dificultad', false) as Difficulties | undefined) ??
      Difficulties.MEDIUM;

    const game = new GameLogic(player1, player2, difficulty);

    const msg = await i.editReply({
      content: `Turno de ${game.currentPlayer.username}`,
      components: game.renderBoard(false)
    });

    collector.create(msg, game, games);
  }
}
