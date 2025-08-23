import { Event, EventBase } from '#framework';

@Event('warn')
export class WarnEvent extends EventBase {
  run(msg: string) {
    console.warn(msg);
  }
}
