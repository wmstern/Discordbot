import { Module } from '#framework';

import { ClientEventsModule } from './client/module.ts';
import { CommandsEventsModule } from './commands/module.ts';

@Module({
  imports: [ClientEventsModule, CommandsEventsModule]
})
export class EventsModule {}
