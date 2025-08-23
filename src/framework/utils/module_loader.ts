import 'reflect-metadata';
import type { ModuleOptions } from '../decorators/module.ts';
import type { CommandBase, EventBase } from '../module.ts';

export function collectMetadata(
  moduleClass: new () => object,
  acc: { commands: (new () => CommandBase)[]; events: (new () => EventBase)[] }
) {
  const metadata: ModuleOptions = (Reflect.getMetadata(
    'module:metadata',
    moduleClass
  ) ?? {}) as ModuleOptions;

  if (metadata.commands) acc.commands.push(...metadata.commands);
  if (metadata.events) acc.events.push(...metadata.events);

  if (metadata.imports) {
    for (const importedModule of metadata.imports) {
      collectMetadata(importedModule, acc);
    }
  }
}
