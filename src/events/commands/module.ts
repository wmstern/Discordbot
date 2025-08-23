import { Module } from '#framework';

import { CommandBlockEvent } from './block.ts';
import { CommandErrorEvent } from './error.ts';

@Module({
  events: [CommandBlockEvent, CommandErrorEvent]
})
export class CommandsEventsModule {}
