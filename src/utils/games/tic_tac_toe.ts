import { ActionRowBuilder, ButtonBuilder, type User } from 'discord.js';

export const EMOJIS = ['▪️', '❌️', '⭕️'] as const;

export default class createGame {
  public readonly player1: User;
  public readonly player2: User;

  turn: 0 | 1;
  winner?: User;

  public readonly board: Board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  constructor(player1: User, player2: User) {
    this.player1 = player1;
    this.player2 = player2;
    if (player2.bot) this.turn = 0;
    else this.turn = Math.floor(Math.random() * 2) as 0 | 1;
  }

  get currentPlayer(): User {
    return this.turn === 0 ? this.player1 : this.player2;
  }

  get winnerPlayer(): User | undefined {
    return this.winner;
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
    const b = this.board;
    const lines: Line[] = [
      [b[0][0], b[0][1], b[0][2]],
      [b[1][0], b[1][1], b[1][2]],
      [b[2][0], b[2][1], b[2][2]],

      [b[0][0], b[1][0], b[2][0]],
      [b[0][1], b[1][1], b[2][1]],
      [b[0][2], b[1][2], b[2][2]],

      [b[0][0], b[1][1], b[2][2]],
      [b[0][2], b[1][1], b[2][0]]
    ];

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

  renderBoard(ended = false): ActionRowBuilder<ButtonBuilder>[] {
    return this.board.map((row, y) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...row.map((cell, x) =>
          new ButtonBuilder()
            .setStyle(2)
            .setLabel(EMOJIS[cell])
            .setCustomId(`tic-tac-toe_${x.toString()}_${y.toString()}`)
            .setDisabled(ended || cell !== 0)
        )
      )
    );
  }

  botMove(): { x: number; y: number } | null {
    const freeCells: { x: number; y: number }[] = [];
    this.board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 0) freeCells.push({ x, y });
      });
    });
    if (freeCells.length === 0) return null;
    const choice = freeCells[Math.floor(Math.random() * freeCells.length)];
    this.board[choice.y][choice.x] = 2;
    return choice;
  }
}

type EmojiN = 0 | 1 | 2;
type Line = [EmojiN, EmojiN, EmojiN];
type Board = [Line, Line, Line];
