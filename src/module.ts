import { Module } from '#framework';

import { CommandsModule } from './commands/module.ts';
import { EventsModule } from './events/module.ts';

@Module({
  imports: [CommandsModule, EventsModule]
})
export class AppModule {}
