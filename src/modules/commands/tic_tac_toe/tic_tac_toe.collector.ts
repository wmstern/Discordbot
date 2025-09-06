import {
  ComponentType,
  type ButtonInteraction,
  type InteractionCollector,
  type Message,
  type ReadonlyCollection
} from 'discord.js';
import type { GameManager } from '../../games/games.service.ts';
import { EndReasons } from './tic_tac_toe.constants.ts';
import type { GameLogic } from './tic_tac_toe.logic.ts';

export class TTTCollector {
  create(msg: Message, game: GameLogic, games: GameManager<typeof GameLogic>): InteractionCollector<ButtonInteraction> {
    const collector = msg.createMessageComponentCollector({
      idle: 180_000,
      componentType: ComponentType.Button
    });

    const handleCollect = async (i: ButtonInteraction) => {
      if (i.user.id !== game.currentPlayer.id) return;
      await i.deferUpdate();

      const [, xStr, yStr] = i.customId.split('_');
      if (!xStr || !yStr) return;

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

    const handleEnd = async (collected: ReadonlyCollection<string, ButtonInteraction>, reason: string) => {
      games.removeGame(msg.channelId);

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
        await msg.edit({
          content: 'tardaron mucho en escoger.',
          components: game.renderBoard(true)
        });
    };

    collector.on('collect', (i) => void handleCollect(i));
    collector.on('end', (collected, reason) => void handleEnd(collected, reason));

    return collector;
  }
}
