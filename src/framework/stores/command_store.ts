import { Collection } from 'discord.js';
import type { CommandClass, CommandEntry, CommandMetadata } from '../types/command.types.ts';

export class CommandStore extends Collection<string, CommandEntry> {
  registerCommands(commands: CommandClass[]): void {
    for (const commandClass of commands) {
      this.registerCommand(commandClass);
    }
  }

  registerCommand(commandClass: CommandClass): void {
    if (typeof commandClass !== 'function' && !('prototype' in commandClass)) throw new Error();

    const commandMetadata = this.getMetadata(commandClass);
    if (!commandMetadata) return;

    const commandInstance = new commandClass();

    const commandEntry = {
      instance: commandInstance,
      metadata: Object.freeze(commandMetadata)
    };

    this.set(commandMetadata.data.name, commandEntry);
  }

  private getMetadata(commandClass: CommandClass): CommandMetadata | undefined {
    const commandMetadata = commandClass[Symbol.metadata];
    if (!commandMetadata?.data) return;

    return commandMetadata;
  }
}
