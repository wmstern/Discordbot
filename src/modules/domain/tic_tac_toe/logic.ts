import { ActionRowBuilder, ButtonBuilder, type User } from 'discord.js';
import { BoardCell, Emojis, EndReasons, Turns, type Difficulties } from './constants.ts';
import { GameIA } from './ia.ts';
import type { Board, Coor, Line, Response } from './types.ts';

export class GameLogic {
  public readonly player1: User;
  public readonly player2: User;

  public readonly bot?: GameIA;

  turn: Turns;
  winner?: User;

  public readonly board: Board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  constructor(player1: User, player2: User, difficulty: Difficulties) {
    this.player1 = player1;
    this.player2 = player2;
    if (player2.bot) {
      this.turn = Turns.PLAYER_1;
      this.bot = new GameIA(this, difficulty);
    } else this.turn = Math.floor(Math.random() * 2) as Turns;
  }

  get currentPlayer(): User {
    return this.turn === Turns.PLAYER_1 ? this.player1 : this.player2;
  }

  get winnerPlayer(): User | undefined {
    return this.winner;
  }

  get lines(): Line[] {
    const b = this.board;
    return [
      [b[0][0], b[0][1], b[0][2]],
      [b[1][0], b[1][1], b[1][2]],
      [b[2][0], b[2][1], b[2][2]],

      [b[0][0], b[1][0], b[2][0]],
      [b[0][1], b[1][1], b[2][1]],
      [b[0][2], b[1][2], b[2][2]],

      [b[0][0], b[1][1], b[2][2]],
      [b[0][2], b[1][1], b[2][0]]
    ];
  }

  playMove(x: number, y: number): Response {
    const placed = this.placeMarker(x, y);

    const response: Response = { placed, ended: false };

    if (this.checkWin()) response.endReason = EndReasons.WIN;
    else if (this.board.every((row) => row.every((cell) => cell !== BoardCell.NULL)))
      response.endReason = EndReasons.TIE;

    if (!response.endReason && response.placed) {
      if (this.bot) {
        this.bot.move();
        if (this.checkWin()) response.endReason = EndReasons.WIN;
        else if (this.board.every((row) => row.every((cell) => cell !== BoardCell.NULL)))
          response.endReason = EndReasons.TIE;
      } else this.nextTurn();
    }

    if (response.endReason) response.ended = true;

    return response;
  }

  placeMarker(x: number, y: number): boolean {
    if (this.board[y][x] !== BoardCell.NULL) return false;
    this.board[y][x] = this.turn === Turns.PLAYER_1 ? BoardCell.PLAYER_1 : BoardCell.PLAYER_2;
    return true;
  }

  nextTurn(): void {
    this.turn = this.turn === Turns.PLAYER_1 ? Turns.PLAYER_2 : Turns.PLAYER_1;
  }

  checkWin(): boolean {
    const lines = this.lines;

    for (const line of lines) {
      if (line[0] !== BoardCell.NULL && line.every((v) => v === line[0])) {
        this.winner = line[0] === BoardCell.PLAYER_1 ? this.player1 : this.player2;
        return true;
      }
    }

    return false;
  }

  getPlayerAt(x: number, y: number): User | undefined {
    const val = this.board[y][x];
    if (val === BoardCell.PLAYER_1) return this.player1;
    if (val === BoardCell.PLAYER_2) return this.player2;
    return undefined;
  }

  getFreeCells(): Coor[] {
    return this.board
      .flatMap((row, y) => row.map((cell, x) => (cell === BoardCell.NULL ? { y, x } : null)))
      .filter((v) => v !== null);
  }

  renderBoard(ended = false): ActionRowBuilder<ButtonBuilder>[] {
    return this.board.map((row, y) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...row.map((cell, x) =>
          new ButtonBuilder()
            .setStyle(2)
            .setLabel(Emojis[cell])
            .setCustomId(`tic-tac-toe_${String(x)}_${String(y)}`)
            .setDisabled(ended || cell !== BoardCell.NULL)
        )
      )
    );
  }
}
