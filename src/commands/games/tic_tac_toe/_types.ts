export const Emojis = {
  '0': '▪️',
  '1': '❌️',
  '2': '⭕️'
} as const;

export const EndReasons = {
  WIN: 'win',
  TIE: 'tie'
} as const;

export const Difficulties = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export type Board = [Line, Line, Line];
export type EmojisKeys = 0 | 1 | 2;
export type Line = [EmojisKeys, EmojisKeys, EmojisKeys];
