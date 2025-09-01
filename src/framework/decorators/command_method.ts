import { ApplicationCommandType, type CommandInteraction } from 'discord.js';
import type {
  AutocompleteMethod,
  CommandMetadata,
  CommandMethod,
  CommandMethodFilter,
  CommandMethodMetadata
} from '../types/command.types.ts';

export const DEFAULT_METHOD = '/';

interface Context extends Omit<DecoratorContext, 'metadata'> {
  metadata: Partial<CommandMetadata>;
}

export function Execute(name?: string) {
  return <T extends CommandInteraction>(
    _target: CommandMethod<T>,
    context: Context
  ) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    const methods = getMethods(context);
    if (!methods) return;

    if (methods.some((m) => m.name === (name ?? DEFAULT_METHOD)))
      throw new Error();

    const method = ensureMethod(methods, context.name);
    if (method) {
      method.name = name ?? DEFAULT_METHOD;
      method.filters = [];
    }
  };
}

export function Cooldown(time: number) {
  return <T extends CommandInteraction>(
    _target: CommandMethod<T>,
    context: Context
  ) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();

    const methods = getMethods(context);
    if (!methods) return;

    const method = ensureMethod(methods, context.name);
    if (method) method.cooldown = time;
  };
}

export function DeferReply(defer = true) {
  return <T extends CommandInteraction>(
    _target: CommandMethod<T>,
    context: Context
  ) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();

    const methods = getMethods(context);
    if (!methods) return;

    const method = ensureMethod(methods, context.name);
    if (method) method.defer = defer;
  };
}

export function Filters(...filters: CommandMethodFilter[]) {
  return <T extends CommandInteraction>(
    _target: CommandMethod<T>,
    context: Context
  ) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();

    const methods = getMethods(context);
    if (!methods) return;

    const method = ensureMethod(methods, context.name);
    if (method) {
      method.filters = [...(method.filters ?? []), ...filters];
    }
  };
}

export function Autocomplete() {
  return (_target: AutocompleteMethod, context: Context) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    if (context.metadata.type !== ApplicationCommandType.ChatInput)
      throw new Error();
    if (context.metadata.autocomplete) throw new Error();

    context.metadata.autocomplete = {
      methodName: context.name
    };
  };
}

function getMethods(
  context: Context
): Partial<CommandMethodMetadata>[] | undefined {
  context.metadata.methods ??= [];
  const methods = context.metadata.methods as Partial<CommandMethodMetadata>[];
  return methods;
}

function ensureMethod(
  methods: Partial<CommandMethodMetadata>[],
  methodName: string
): Partial<CommandMethodMetadata> | undefined {
  let method = methods.find((m) => m.methodName === methodName);
  if (!method) methods.push({ methodName });
  method = methods.find((m) => m.methodName === methodName);
  return method;
}
