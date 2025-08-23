import { Module } from '#framework';

import { DebugEvent } from './debug.ts';
import { ErrorEvent } from './error.ts';
import { ReadyEvent } from './ready.ts';
import { WarnEvent } from './warn.ts';

@Module({
  events: [DebugEvent, ErrorEvent, ReadyEvent, WarnEvent]
})
export class ClientEventsModule {}
