import { Difficulties, BoardCell } from './constants.ts';
import { GameLogic } from './logic.ts';

export class GameIA {
  public readonly game: GameLogic;
  public readonly difficulty: Difficulties;

  constructor(game: GameLogic, Difficulty: Difficulties) {
    this.game = game;
    this.difficulty = Difficulty;
  }

  move() {
    switch (this.difficulty) {
      case Difficulties.EASY:
        return this.easyMove(this.game);
      case Difficulties.MEDIUM:
        return this.mediumMove(this.game);
      case Difficulties.HARD:
        return this.hardMove(this.game);
    }
  }

  easyMove(game: GameLogic) {
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return null;
    const choice = freeCells[Math.floor(Math.random() * freeCells.length)];
    game.board[choice.y][choice.x] = BoardCell.PLAYER_2;
    return choice;
  }

  mediumMove(game: GameLogic) {
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return null;

    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = BoardCell.PLAYER_2;
      if (game.checkWin()) return cell;
      game.board[cell.y][cell.x] = BoardCell.NULL;
    }

    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = BoardCell.PLAYER_1;
      if (game.checkWin()) {
        game.board[cell.y][cell.x] = BoardCell.PLAYER_2;
        return cell;
      }
      game.board[cell.y][cell.x] = BoardCell.NULL;
    }

    return this.easyMove(game);
  }

  hardMove(game: GameLogic) {
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = freeCells[0];

    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = BoardCell.PLAYER_2;
      const score = this.minimax(game, false);
      game.board[cell.y][cell.x] = BoardCell.NULL;
      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
    }

    game.board[bestMove.y][bestMove.x] = BoardCell.PLAYER_2;
    return bestMove;
  }

  private minimax(game: GameLogic, isBot: boolean): number {
    if (game.checkWin()) return isBot ? -1 : 1;
    const freeCells = game.getFreeCells();
    if (freeCells.length === 0) return 0;

    const scores: number[] = [];
    for (const cell of freeCells) {
      game.board[cell.y][cell.x] = isBot ? BoardCell.PLAYER_2 : BoardCell.PLAYER_1;
      scores.push(this.minimax(game, !isBot));
      game.board[cell.y][cell.x] = BoardCell.NULL;
    }

    return isBot ? Math.max(...scores) : Math.min(...scores);
  }
}
