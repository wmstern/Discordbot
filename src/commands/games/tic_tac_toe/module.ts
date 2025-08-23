import { Module } from '#framework';

import { TTTCommand } from './command.ts';

@Module({
  commands: [TTTCommand]
})
export class TTTCommandModule {}
