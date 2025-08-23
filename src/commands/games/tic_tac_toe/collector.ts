import {
  ComponentType,
  type ButtonInteraction,
  type Message,
  type ReadonlyCollection
} from 'discord.js';
import type { TTTCommand as Command } from './command.ts';
import type GameLogic from './logic.ts';
import { EndReasons } from './types.ts';

export default function createCollector(
  msg: Message,
  game: GameLogic,
  command: Command
) {
  const collector = msg.createMessageComponentCollector({
    idle: 180_000,
    componentType: ComponentType.Button
  });

  const handleCollect = async (i: ButtonInteraction) => {
    if (i.user.id !== game.currentPlayer.id) return;
    await i.deferUpdate();

    const [, xStr, yStr] = i.customId.split('_');
    const x = parseInt(xStr);
    const y = parseInt(yStr);

    const response = game.playMove(x, y);
    if (!response.placed) return;

    if (response.ended) {
      collector.stop(response.endReason);
      return;
    }

    await i.editReply({
      content: `Turno de ${game.currentPlayer.username}`,
      components: game.renderBoard(false)
    });
  };

  const handleEnd = async (
    collected: ReadonlyCollection<string, ButtonInteraction>,
    reason: string
  ) => {
    command.games.delete(msg.channelId);

    const i = collected.last();

    if (reason === EndReasons.WIN)
      await i?.editReply({
        content: `ganador: ${game.winnerPlayer?.username ?? ''}`,
        components: game.renderBoard(true)
      });
    else if (reason === EndReasons.TIE)
      await i?.editReply({
        content: 'empate...',
        components: game.renderBoard(true)
      });
    else
      await i?.editReply({
        content: 'tardaron mucho en escoger.',
        components: game.renderBoard(true)
      });
  };

  collector.on('collect', (i) => void handleCollect(i));
  collector.on('end', (collected, reason) => void handleEnd(collected, reason));
}
