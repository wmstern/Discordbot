import { Command, type Client } from '#flamework';
import {
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js';
import { difficulties } from '../../utils/bots/tic_tac_toe.ts';
import createCollector from '../../utils/collectors/tic_tac_toe.ts';
import createGame from '../../utils/games/tic_tac_toe.ts';

export default class TicTacToeCommand extends Command {
  path = import.meta.dirname;
  games = new Set<string>();

  constructor(client: Client) {
    super(
      client,
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
              Object.values(difficulties).map((v) => ({ name: v, value: v }))
            )
            .setRequired(false)
        )
    );
  }

  async run(i: ChatInputCommandInteraction) {
    const channel = i.channel?.id ?? '';

    if (this.games.has(channel)) {
      await i.reply({
        content: 'Ya hay una partida activa en este canal.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await i.deferReply();

    this.games.add(channel);

    const player1 = i.user;
    const player2 = i.options.getUser('adversary', false) ?? i.client.user;
    const difficulty =
      (i.options.getString('dificultad', false) as
        | (typeof difficulties)[keyof typeof difficulties]
        | undefined) ?? difficulties.MEDIUM;

    const game = new createGame(player1, player2, difficulty);

    const msg = await i.editReply({
      content: `Turno de ${game.currentPlayer.username}`,
      components: game.renderBoard()
    });

    createCollector(msg, game, this);
  }
}
