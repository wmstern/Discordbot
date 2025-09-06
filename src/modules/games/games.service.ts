import type { GameLogic as TTT } from '../commands/tic_tac_toe/tic_tac_toe.logic.ts';

type Instance = TTT;
type Constructor = typeof TTT;

export class GameManager<T extends Constructor, I extends InstanceType<T> = InstanceType<T>> {
  static games = new Map<string, Instance>();

  constructor(public readonly game: T) {}

  get games(): Map<string, I> {
    const filter = ([, v]: [string, Instance]) => v instanceof this.game;

    return new Map(Array.from(GameManager.games).filter(filter)) as Map<string, I>;
  }

  addGame(channelId: string, game: I): boolean {
    if (GameManager.games.has(channelId)) return false;
    if (!(game instanceof this.game)) return false;
    GameManager.games.set(channelId, game);
    return true;
  }

  removeGame(channelId: string): boolean {
    const game = GameManager.games.get(channelId);
    if (!(game instanceof this.game)) return false;
    GameManager.games.delete(channelId);
    return true;
  }
}
