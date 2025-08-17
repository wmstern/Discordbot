import type { ClientEvent } from './client_event.ts';
import type { Command } from './command.ts';

export function once(target: typeof ClientEvent) {
  target.prototype.once = true;
}

export function adminOnly(target: typeof Command) {
  target.prototype.adminOnly = true;
}
