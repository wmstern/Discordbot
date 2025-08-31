import { ApplicationCommandType } from 'discord.js';
import type {
  AutocompleteMethod,
  CommandMethod,
  CommandMethodFilter,
  CommandMethodMetadata
} from '../types/command.types.ts';

export function Execute(name = 'run') {
  return (_target: CommandMethod, context: DecoratorContext) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    context.metadata.methods ??= [];
    const methods = getMethods(context);
    if (!methods) return;
    let method = methods.find((m) => m.methodName === context.name);
    if (!method) methods.push({ methodName: context.name });
    method = methods.find((m) => m.methodName === context.name);
    if (method) {
      method.name = name;
      method.filters = [];
    }
  };
}

export function Cooldown(time: number) {
  return (_target: CommandMethod, context: DecoratorContext) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    const methods = getMethods(context);
    if (!methods) return;
    let method = methods.find((m) => m.methodName === context.name);
    if (!method) methods.push({ methodName: context.name });
    method = methods.find((m) => m.methodName === context.name);
    if (method) method.cooldown = time;
  };
}

export function DeferReply(defer = true) {
  return (_target: CommandMethod, context: DecoratorContext) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    const methods = getMethods(context);
    if (!methods) return;
    let method = methods.find((m) => m.methodName === context.name);
    if (!method) methods.push({ methodName: context.name });
    method = methods.find((m) => m.methodName === context.name);
    if (method) method.defer = defer;
  };
}

export function Filters(...filters: CommandMethodFilter[]) {
  return (_target: CommandMethod, context: DecoratorContext) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    const methods = getMethods(context);
    if (!methods) return;
    let method = methods.find((m) => m.methodName === context.name);
    if (!method) methods.push({ methodName: context.name });
    method = methods.find((m) => m.methodName === context.name);
    if (method) {
      method.filters = [...(method.filters ?? []), ...filters];
    }
  };
}

export function Autocomplete() {
  return (_target: AutocompleteMethod, context: DecoratorContext) => {
    if (context.kind !== 'method' || typeof context.name !== 'string')
      throw new Error();
    if (context.metadata.type !== ApplicationCommandType.ChatInput)
      throw new Error();
    context.metadata.autocomplete = {
      methodName: context.name
    };
  };
}

function getMethods(
  context: ClassMethodDecoratorContext
): Partial<CommandMethodMetadata>[] | undefined {
  context.metadata.methods ??= [];
  const methods = context.metadata.methods as Partial<CommandMethodMetadata>[];
  return methods;
}
