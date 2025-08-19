import { Command, type Client } from '#flamework';
import {
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js';
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
        .setDescription('tic tac toe game')
        .addUserOption((opt) =>
          opt
            .setName('adversary')
            .setDescription('The second player.')
            .setRequired(false)
        )
    );
  }

  async run(i: ChatInputCommandInteraction) {
    const channel = i.channel?.id ?? '';

    if (this.games.has(channel)) {
      await i.reply({
        content: `There is already an active game on this server.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await i.deferReply();

    this.games.add(channel);

    const player1 = i.user;
    const player2 = i.options.getUser('adversary', false) ?? i.client.user;

    const game = new createGame(player1, player2);

    const msg = await i.editReply({
      content: `Turno de ${game.currentPlayer.username}`,
      components: game.renderBoard()
    });

    createCollector(msg, game, this);
  }
}
