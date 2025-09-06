import type { BoardCell, EndReasons } from './tic_tac_toe.constants.ts';

export type Board = [Line, Line, Line];
export type Cell = BoardCell;
export type Line = [Cell, Cell, Cell];

export interface Response {
  placed: boolean;
  ended: boolean;
  endReason?: EndReasons;
}

export interface Coor {
  y: number;
  x: number;
}
