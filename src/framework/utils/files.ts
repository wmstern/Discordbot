import { CommandClass, EventClass } from '#framework';
import { lstat, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

type Filter = (file: string, dir: string) => boolean;

const exts = new Set(['.js', '.cjs', '.mjs', '.ts', '.mts']);

const commandFilter = (file: string) => /^(command\..*|.*\.command\..*)$/.test(file);
const eventFilter = (file: string) => /^(event\..*|.*\.event\..*)$/.test(file);

export async function getFiles(dir: string, filter?: Filter): Promise<string[]> {
  const dirStat = await lstat(dir);
  if (!dirStat.isDirectory()) throw new Error(`${dir} is not a directory.`);

  const files: string[] = [];
  const dirFiles = await readdir(dir);

  for (const fileName of dirFiles) {
    if (fileName.startsWith('_') || fileName.startsWith('.')) continue;

    const filePath = join(dir, fileName);
    const fileStat = await lstat(filePath);

    if (fileStat.isDirectory()) {
      files.push(...(await getFiles(filePath, filter)));
    } else if (fileStat.isFile() && exts.has(extname(fileName))) {
      if (!filter?.(fileName, dir)) continue;
      files.push(filePath);
    }
  }

  return files;
}

export async function getExports<T>(filePaths: string[]): Promise<T[]> {
  return (
    await Promise.all(
      filePaths.map(async (file) => {
        const module = (await import(pathToFileURL(file).href)) as Record<string, T>;
        return Object.values(module);
      })
    )
  ).flat();
}

export async function getCommands(dir: string): Promise<CommandClass[]> {
  const filePaths = await getFiles(dir, commandFilter);
  return await getExports<CommandClass>(filePaths);
}

export async function getEvents(dir: string): Promise<EventClass[]> {
  const filePaths = await getFiles(dir, eventFilter);
  return await getExports<EventClass>(filePaths);
}
