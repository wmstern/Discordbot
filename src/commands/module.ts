import { Module } from '#framework';

import { DepurationCommandsModule } from './depuration/module.ts';
import { GamesCommandsModule } from './games/games.module.ts';

@Module({
  imports: [DepurationCommandsModule, GamesCommandsModule]
})
export class CommandsModule {}
