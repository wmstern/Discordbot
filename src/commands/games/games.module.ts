import { Module } from '#framework';

import { TTTCommandModule } from './tic_tac_toe/module.ts';

@Module({
  imports: [TTTCommandModule]
})
export class GamesCommandsModule {}
