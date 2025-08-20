import {
  ComponentType,
  type ButtonInteraction,
  type Message
} from 'discord.js';
import type Command from '../../commands/games/tic_tac_toe.ts';
import type TicTacToeGame from '../games/tic_tac_toe.ts';

const EndReasons = {
  WIN: 'win',
  TIE: 'tie'
} as const;

export default function createCollector(
  msg: Message,
  game: TicTacToeGame,
  command: Command
) {
  const collector = msg.createMessageComponentCollector({
    idle: 180_000,
    componentType: ComponentType.Button
  });

  const handleCollect = async (i: ButtonInteraction) => {
    if (i.user.id !== game.currentPlayer.id) return;

    const [, xStr, yStr] = i.customId.split('_');
    const x = parseInt(xStr);
    const y = parseInt(yStr);

    const placed = game.placeMarker(x, y);
    if (!placed) return;

    if (game.bot) game.bot.move();
    else game.nextTurn();

    const ended = game.checkWin();

    if (!ended && game.board.every((list) => list.every((n) => n !== 0))) {
      collector.stop(EndReasons.TIE);
      return;
    }

    if (ended) {
      collector.stop(EndReasons.WIN);
    }

    await i.update({
      content: ended
        ? `🎉 Ganador: ${game.winnerPlayer?.username ?? ''}`
        : `Turno de ${game.currentPlayer.username}`,
      components: game.renderBoard(ended)
    });
  };

  const handleEnd = async (reason: string) => {
    command.games.delete(msg.channelId);

    if (reason !== EndReasons.WIN)
      await msg.edit({
        content: 'tie...',
        components: game.renderBoard(true)
      });
  };

  collector.on('collect', (i) => void handleCollect(i));
  collector.on('end', (_ic, reason) => void handleEnd(reason));
}
