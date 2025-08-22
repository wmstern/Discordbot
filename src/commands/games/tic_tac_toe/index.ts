import { Command, type Client } from '#flamework';
import {
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js';
import createCollector from './_collector.ts';
import GameLogic from './_logic.ts';
import { Difficulties } from './_types.ts';

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
              Object.values(Difficulties).map((v) => ({ name: v, value: v }))
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
    const player2 = i.options.getUser('adversario', false) ?? i.client.user;
    const difficulty =
      (i.options.getString('dificultad', false) as Difficulties | undefined) ??
      Difficulties.MEDIUM;

    const game = new GameLogic(player1, player2, difficulty);

    const msg = await i.editReply({
      content: `Turno de ${game.currentPlayer.username}`,
      components: game.renderBoard(false)
    });

    createCollector(msg, game, this);
  }
}
