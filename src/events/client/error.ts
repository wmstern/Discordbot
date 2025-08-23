import { Event, EventBase } from '#framework';

@Event('error')
export class ErrorEvent extends EventBase {
  run(err: Error) {
    console.error(err);
  }
}
