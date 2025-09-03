import type { GameLogic as TTT } from '../../domain/tic_tac_toe/logic.ts';

type GameConstructor = typeof TTT;

export class GameManager<
  T extends GameConstructor,
  I extends InstanceType<T> = InstanceType<T>
> {
  static games = new Map<string, InstanceType<GameConstructor>>();

  constructor(public readonly gameClass: T) {}

  get games(): Map<string, I> {
    return GameManager.filterGames(
      (_, v) => v instanceof this.gameClass
    ) as Map<string, I>;
  }

  addGame(id: string, game: I) {
    GameManager.games.set(id, game);
  }

  removeGame(id: string) {
    const game = GameManager.games.get(id);
    if (!(game instanceof this.gameClass)) return;
    GameManager.games.delete(id);
  }

  static removeGame(id: string) {
    GameManager.games.delete(id);
  }

  clearGames() {
    for (const [k, v] of GameManager.games)
      if (v instanceof this.gameClass) GameManager.games.delete(k);
  }

  static clearGames() {
    GameManager.games.clear();
  }

  findGame(id: string): I | undefined {
    const game = GameManager.games.get(id);
    if (game instanceof this.gameClass) return game as I;
    return undefined;
  }

  static findGame(id: string) {
    return GameManager.games.get(id);
  }

  filterGames(callback: (key: string, value: I) => boolean) {
    return new Map(
      Array(...this.games).filter(([key, value]) => callback(key, value))
    );
  }

  static filterGames(
    callback: (key: string, value: InstanceType<GameConstructor>) => boolean
  ) {
    return new Map(
      Array(...GameManager.games).filter(([key, value]) => callback(key, value))
    );
  }

  hasGame(id: string) {
    const game = GameManager.games.get(id);
    if (!(game instanceof this.gameClass)) return false;
    return true;
  }

  static hasGame(id: string) {
    return GameManager.games.has(id);
  }
}
