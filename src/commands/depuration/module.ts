import { Module } from '#framework';

import { PingCommand } from './ping.ts';

@Module({
  commands: [PingCommand]
})
export class DepurationCommandsModule {}
