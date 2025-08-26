export interface EventBase {
  run(...args: unknown[]): unknown;
}

export type EventConstructor = new () => EventBase;
