export abstract class EventBase {
  abstract run(...args: unknown[]): unknown;
}
