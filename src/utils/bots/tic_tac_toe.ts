import createGame from '../games/tic_tac_toe.ts';

export const difficulties = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export default class createBot {
  public readonly game: createGame;
  public readonly difficulty: (typeof difficulties)[keyof typeof difficulties];

  constructor(game: createGame, difficulty: typeof this.difficulty) {
    this.game = game;
    this.difficulty = difficulty;
  }

  move() {
    switch (this.difficulty) {
      case difficulties.EASY:
        return this.easyMove(this.game);
      case difficulties.MEDIUM:
        return this.mediumMove(this.game);
      case difficulties.HARD:
        return this.hardMove(this.game);
    }
  }

  easyMove(game: createGame) {
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return null;
    const choice = freeCells[Math.floor(Math.random() * freeCells.length)];
    game.board[choice.y][choice.x] = 2;
    return choice;
  }

  mediumMove(game: createGame) {
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return null;

    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = 2;
      if (game.checkWin()) return cell;
      game.board[cell.y][cell.x] = 0;
    }

    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = 1;
      if (game.checkWin()) {
        game.board[cell.y][cell.x] = 2;
        return cell;
      }
      game.board[cell.y][cell.x] = 0;
    }

    const choice = freeCells[Math.floor(Math.random() * freeCells.length)];
    game.board[choice.y][choice.x] = 2;
    return choice;
  }

  hardMove(game: createGame) {
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = freeCells[0];

    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = 2;
      const score = this.minimax(game, false);
      game.board[cell.y][cell.x] = 0;
      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
    }

    game.board[bestMove.y][bestMove.x] = 2;
    return bestMove;
  }

  private minimax(game: createGame, isBot: boolean): number {
    if (game.checkWin()) return isBot ? -1 : 1;
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return 0;

    const scores: number[] = [];
    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = isBot ? 2 : 1;
      scores.push(this.minimax(game, !isBot));
      game.board[cell.y][cell.x] = 0;
    }

    return isBot ? Math.max(...scores) : Math.min(...scores);
  }
}
