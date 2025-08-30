import { EventConstructor } from '../types/event.types.ts';

export function Event(eventName: string) {
  return (
    _target: EventConstructor,
    context: ClassDecoratorContext<EventConstructor>
  ) => {
    context.metadata.name = eventName;
  };
}
