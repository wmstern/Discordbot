import 'reflect-metadata';
import { EventConstructor } from '../types/event.types.ts';

export function Event(eventName: string) {
  return (target: EventConstructor) => {
    Reflect.defineMetadata('event:name', eventName, target);
  };
}
