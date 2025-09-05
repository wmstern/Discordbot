import { Routes, type Client } from 'discord.js';
import type { CommandStore } from '../stores/command_store.ts';

export class CommandDeployer {
  constructor(
    private readonly client: Client,
    private readonly store: CommandStore
  ) {}

  async deployGlobal(): Promise<void> {
    const app = await this.client.application?.fetch();
    if (!app) throw new Error('Could not fetch application');

    await this.client.rest.put(Routes.applicationCommands(app.id), {
      body: Array.from(this.store.values()).map((c) => c.metadata.data)
    });
  }

  async deployToGuild(guildId: string): Promise<void> {
    const app = await this.client.application?.fetch();
    if (!app) throw new Error('Could not fetch application');

    await this.client.rest.put(Routes.applicationGuildCommands(app.id, guildId), {
      body: Array.from(this.store.values())
        .filter((c) => c.metadata.guild === guildId)
        .map((c) => c.metadata.data)
    });
  }
}
