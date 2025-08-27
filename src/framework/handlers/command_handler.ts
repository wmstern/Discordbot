import {
  AutocompleteInteraction,
  CommandInteraction,
  type Client
} from 'discord.js';
import 'reflect-metadata';
import type {
  CommandConstructor,
  CooldownObject,
  SlashCommandConstructor,
  CommandMetadata
} from '../types/command.types.ts';

export class CommandHandler {
  public readonly commandMap = new Map<
    string,
    InstanceType<CommandConstructor>
  >();
  public readonly commandData: CommandMetadata['data'][] = [];

  public readonly cooldowns = new Map<string, Map<string, CooldownObject>>();

  constructor(
    protected readonly client: Client,
    private readonly cmds: CommandConstructor[]
  ) {
    this.#getCommandsStructures();
    this.client.on('interactionCreate', (i) => void this.#interactionEvent(i));
  }

  #getCommandsStructures() {
    for (const Cmd of this.cmds) {
      const data = Reflect.getMetadata('command:data', Cmd) as
        | CommandMetadata['data']
        | undefined;
      if (!data) continue;
      const instance = new Cmd();
      this.commandMap.set(data.name, instance);
      this.commandData.push(data);
    }
  }

  async #interactionEvent(i: unknown) {
    if (i instanceof AutocompleteInteraction) {
      const instance = this.commandMap.get(i.commandName) as
        | InstanceType<SlashCommandConstructor>
        | undefined;
      if (!instance) return;

      try {
        await instance.autocomplete?.(i as AutocompleteInteraction);
      } catch (err) {
        i.client.emit('error', err as Error);
      }
    } else if (i instanceof CommandInteraction) {
      const instance = this.commandMap.get(i.commandName);
      if (!instance) return;

      const defer = Reflect.getMetadata('command:defer', instance, 'run') as
        | boolean
        | undefined;
      if (defer) await i.deferReply();

      const cooldown = Reflect.getMetadata(
        'command:cooldown',
        instance,
        'run'
      ) as number;
      if (cooldown && !this.cooldowns.has(i.commandName))
        this.cooldowns.set(i.commandName, new Map());
      const cooldowns = this.cooldowns.get(i.commandName);
      const hasCooldown = cooldowns ? cooldowns.has(i.user.id) : false;

      if (cooldowns && hasCooldown) {
        this.client.emit(
          'commandBlock',
          i,
          'cooldown',
          cooldowns.get(i.user.id)
        );
        return;
      }

      try {
        await instance.run(i as never);
      } catch (err) {
        i.client.emit('commandError', i, err as Error);
      } finally {
        cooldowns?.set(i.user.id, {
          userId: i.user.id,
          start: Date.now(),
          time: cooldown,
          fn: setTimeout(() => cooldowns.delete(i.user.id), cooldown)
        });
      }
    } else return;
  }
}
