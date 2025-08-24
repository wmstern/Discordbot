import 'reflect-metadata';
import { EventBase } from '../bases/event.ts';

export function Event(eventName: string) {
  return (target: new () => EventBase) => {
    Reflect.defineMetadata('event:name', eventName, target);
  };
}
