import { ActionRowBuilder, ButtonBuilder, type User } from 'discord.js';
import GameIA from './_ia.ts';
import { Board, Emojis, Line } from './_types.ts';

export default class GameLogic {
  public readonly player1: User;
  public readonly player2: User;

  public readonly bot?: GameIA;

  turn: 0 | 1;
  winner?: User;

  public readonly board: Board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  constructor(
    player1: User,
    player2: User,
    difficulty: typeof GameIA.prototype.difficulty
  ) {
    this.player1 = player1;
    this.player2 = player2;
    if (player2.bot) {
      this.turn = 0;
      this.bot = new GameIA(this, difficulty);
    } else this.turn = Math.floor(Math.random() * 2) as 0 | 1;
  }

  get currentPlayer(): User {
    return this.turn === 0 ? this.player1 : this.player2;
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

  placeMarker(x: number, y: number): boolean {
    if (this.board[y][x] !== 0) return false;
    this.board[y][x] = this.turn === 0 ? 1 : 2;
    return true;
  }

  nextTurn(): void {
    this.turn = this.turn === 0 ? 1 : 0;
  }

  checkWin(): boolean {
    const lines = this.lines;

    for (const line of lines) {
      if (line[0] !== 0 && line.every((v) => v === line[0])) {
        this.winner = line[0] === 1 ? this.player1 : this.player2;
        return true;
      }
    }

    return false;
  }

  getPlayerAt(x: number, y: number): User | undefined {
    const val = this.board[y][x];
    if (val === 1) return this.player1;
    if (val === 2) return this.player2;
    return undefined;
  }

  getFreeCells(): { x: number; y: number }[] {
    return this.board
      .flatMap((row, y) => row.map((cell, x) => (cell === 0 ? { y, x } : null)))
      .filter((v) => v !== null);
  }

  renderBoard(ended = false): ActionRowBuilder<ButtonBuilder>[] {
    return this.board.map((row, y) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...row.map((cell, x) =>
          new ButtonBuilder()
            .setStyle(2)
            .setLabel(Emojis[cell])
            .setCustomId(`tic-tac-toe_${x.toString()}_${y.toString()}`)
            .setDisabled(ended || cell !== 0)
        )
      )
    );
  }
}
