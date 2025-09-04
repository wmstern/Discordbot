import { lstat, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const exts = new Set(['.js', '.cjs', '.mjs', '.ts', '.mts']);

export async function getFiles(dir: string): Promise<string[]> {
  const dirStat = await lstat(dir);
  if (!dirStat.isDirectory()) throw new Error(`${dir} is not a directory.`);

  const files: string[] = [];
  const dirFiles = await readdir(dir);

  for (const fileName of dirFiles) {
    if (fileName.startsWith('_') || fileName.startsWith('.')) continue;

    const filePath = join(dir, fileName);
    const fileStat = await lstat(filePath);

    if (fileStat.isDirectory()) {
      files.push(...(await getFiles(filePath)));
    } else if (fileStat.isFile() && exts.has(extname(fileName))) {
      files.push(filePath);
    }
  }

  return files;
}

export async function getExports<T>(dir: string): Promise<T[]> {
  const filePaths = await getFiles(dir);
  const modules = await Promise.all(
    filePaths.map(async (file) => {
      const module = (await import(pathToFileURL(file).href)) as Record<string, T>;
      return Object.values(module);
    })
  );
  return modules.flat();
}
