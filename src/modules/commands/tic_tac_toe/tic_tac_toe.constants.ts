export const Emojis = {
  0: '⬛️',
  1: '❌️',
  2: '⭕️'
} as const;
export type Emojis = (typeof Emojis)[keyof typeof Emojis];

export const BoardCell = {
  NULL: 0,
  PLAYER_1: 1,
  PLAYER_2: 2
} as const;
export type BoardCell = (typeof BoardCell)[keyof typeof BoardCell];

export const Turns = {
  PLAYER_1: 0,
  PLAYER_2: 1
} as const;
export type Turns = (typeof Turns)[keyof typeof Turns];

export const EndReasons = {
  WIN: 'win',
  TIE: 'tie'
} as const;
export type EndReasons = (typeof EndReasons)[keyof typeof EndReasons];

export const Difficulties = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;
export type Difficulties = (typeof Difficulties)[keyof typeof Difficulties];
