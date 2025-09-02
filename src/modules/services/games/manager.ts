import type { GameLogic as TTT } from '../../domain/tic_tac_toe/logic.ts';

type Instance = TTT;
type Game = typeof TTT;

export class GameManager {
  static games = new Map<string, Instance>();

  addGame(id: string, game: Instance) {
    GameManager.games.set(id, game);
  }

  removeGame(id: string) {
    GameManager.games.delete(id);
  }

  clearGames({ all, game }: { all?: boolean; game?: Game }) {
    if (all) GameManager.games.clear();
    else if (game)
      this.filterGames((_, value) => value instanceof game).clear();
  }

  findGame(id: string) {
    return GameManager.games.get(id);
  }

  filterGames(callback: (key: string, value: Instance) => boolean) {
    return new Map(
      Array(...GameManager.games).filter(([key, value]) => callback(key, value))
    );
  }

  hasGame(id: string) {
    return GameManager.games.has(id);
  }
}
