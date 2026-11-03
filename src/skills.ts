import { open, readdir, realpath, stat, access } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
export type Skill = { name: string; description: string; directory: string; metadata: Record<string, unknown> };
export type Trace = (event: string) => void;
export const quiet: Trace = () => {};
const MAX_FILE = 64 * 1024;
export async function safePath(root: string, relative: string): Promise<string> {
  if (!relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(p => p === '..' || p === '.')) throw new Error('Invalid relative path');
  const base = await realpath(root);
  const resolved = await realpath(path.join(base, relative));
  if (!resolved.startsWith(base + path.sep)) throw new Error('Path escapes allowed directory');
  return resolved;
}
export async function readBounded(file: string): Promise<string> {
  const handle = await open(file, 'r');
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size > MAX_FILE) throw new Error('Expected a regular file up to 64 KiB');
    const bytes = Buffer.alloc(MAX_FILE + 1);
    const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0);
    if (bytesRead > MAX_FILE) throw new Error('File too large');
    return bytes.subarray(0, bytesRead).toString('utf8');
  } finally { await handle.close(); }
}
// Read only through the closing delimiter; no instruction body is read at discovery.
export async function frontmatter(file: string): Promise<string> {
  const handle = await open(file, 'r');
  try {
    if (!(await handle.stat()).isFile()) throw new Error('Skill must be a regular file');
    const bytes: number[] = []; const byte = Buffer.alloc(1);
    let line = ''; let first = true;
    for (let i = 0; i < 16384; i++) {
      if (!(await handle.read(byte, 0, 1, i)).bytesRead) break;
      const value = byte[0]!;
      if (value === 10) {
        const clean = line.replace(/\r$/, '');
        if (first) { if (clean !== '---') throw new Error('Missing YAML frontmatter'); first = false; }
        else if (clean === '---') return Buffer.from(bytes.slice(0, bytes.length - Buffer.byteLength(line))).toString('utf8');
        else bytes.push(10);
        line = '';
      } else { line += String.fromCharCode(value); if (!first) bytes.push(value); }
    }
    throw new Error('Unterminated or oversized frontmatter');
  } finally { await handle.close(); }
}
export function validate(yaml: string, directory: string): Record<string, unknown> {
  const doc = parseDocument(yaml, { uniqueKeys: true });
  if (doc.errors.length) throw new Error('Malformed YAML');
  const data: unknown = doc.toJS({ maxAliasCount: 0 });
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Metadata must be a mapping');
  const m = data as Record<string, unknown>;
  const fields = new Set(['name','description','license','compatibility','metadata','allowed-tools']);
  if (Object.keys(m).some(k => !fields.has(k))) throw new Error('Unknown metadata field');
  if (typeof m.name !== 'string' || [...m.name].length > 64 || !/^[\p{Ll}\p{Lo}\p{Nd}]+(?:-[\p{Ll}\p{Lo}\p{Nd}]+)*$/u.test(m.name) || m.name !== directory) throw new Error('Invalid skill name or directory mismatch');
  if (typeof m.description !== 'string' || !m.description.trim() || [...m.description].length > 1024) throw new Error('Invalid description');
  for (const key of ['license','compatibility','allowed-tools']) if (key in m && typeof m[key] !== 'string') throw new Error(`Invalid ${key}`);
  if (typeof m.compatibility === 'string' && (!m.compatibility.trim() || [...m.compatibility].length > 500)) throw new Error('Invalid compatibility');
  if ('metadata' in m && (!m.metadata || typeof m.metadata !== 'object' || Array.isArray(m.metadata) || Object.values(m.metadata).some(v => typeof v !== 'string'))) throw new Error('Invalid metadata map');
  return m;
}
export async function projectRoot(start = process.cwd()): Promise<string> {
  let current = await realpath(start);
  while (true) {
    for (const marker of ['.git', 'package.json']) { try { await access(path.join(current,marker)); return current; } catch {} }
    const parent = path.dirname(current); if (parent === current) throw new Error('No project root found (.git or package.json)'); current = parent;
  }
}
export async function discover(root: string, trace: Trace = quiet): Promise<Map<string, Skill>> {
  const skills = new Map<string, Skill>();
  for (const location of ['.skills', '.agents/skills']) {
    let entries;
    try { const dir = await safePath(root, location); entries = await readdir(dir, { withFileTypes: true }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue; throw error; }
    for (const entry of entries.sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
      if (!entry.isDirectory()) continue;
      const directory = await safePath(root, `${location}/${entry.name}`);
      let file;
      try { file = await safePath(directory, 'SKILL.md'); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue; throw error; }
      const metadata = validate(await frontmatter(file), entry.name);
      if (skills.has(entry.name)) { trace(`SHADOW ${entry.name} (higher-priority .skills wins)`); continue; }
      skills.set(entry.name, { name: entry.name, description: metadata.description as string, directory, metadata });
    }
  }
  trace(`DISCOVER ${skills.size} valid skills`); return skills;
}
export async function activate(skill: Skill): Promise<string> {
  const text = await readBounded(await safePath(skill.directory, 'SKILL.md'));
  const metadata = validate(await frontmatter(await safePath(skill.directory,'SKILL.md')), skill.name);
  if (JSON.stringify(metadata) !== JSON.stringify(skill.metadata)) throw new Error('Skill metadata changed; restart discovery');
  return text;
}
