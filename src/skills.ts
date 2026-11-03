import { open, readdir, realpath, access } from "node:fs/promises";
import path from "node:path";
import { parseDocument, isMap, isScalar } from "yaml";
export type Skill = {
  name: string;
  description: string;
  directory: string;
  metadata: Record<string, unknown>;
};
export type Trace = (event: string) => void;
export const quiet: Trace = () => {};
const MAX_FILE = 64 * 1024;
export async function safePath(
  root: string,
  relative: string,
): Promise<string> {
  if (
    !relative ||
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative.split("/").some((p) => p === ".." || p === ".")
  )
    throw new Error("Invalid relative path");
  const base = await realpath(root);
  const resolved = await realpath(path.join(base, relative));
  if (!resolved.startsWith(base + path.sep))
    throw new Error("Path escapes allowed directory");
  return resolved;
}
export async function readBounded(file: string): Promise<string> {
  const handle = await open(file, "r");
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size > MAX_FILE)
      throw new Error("Expected a regular file up to 64 KiB");
    const bytes = Buffer.alloc(MAX_FILE + 1);
    const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0);
    if (bytesRead > MAX_FILE) throw new Error("File too large");
    return bytes.subarray(0, bytesRead).toString("utf8");
  } finally {
    await handle.close();
  }
}
// Read a bounded prefix; return only metadata, never the buffered body suffix.
export async function frontmatter(file: string): Promise<string> {
  const handle = await open(file, "r");
  try {
    if (!(await handle.stat()).isFile())
      throw new Error("Skill must be a regular file");
    const bytes = Buffer.alloc(16384);
    let length = 0;
    // Regular-file reads may be short; fill only the bounded prefix.
    while (length < bytes.length) {
      const { bytesRead } = await handle.read(bytes, length, bytes.length - length, length);
      if (!bytesRead) break;
      length += bytesRead;
    }
    const prefix = bytes.subarray(0, length);
    let start = 0;
    let metadataStart = 0;
    for (let end = prefix.indexOf(10); end !== -1; end = prefix.indexOf(10, start)) {
      const lineEnd = prefix[end - 1] === 13 ? end - 1 : end;
      const delimiter = prefix.subarray(start, lineEnd).equals(Buffer.from("---"));
      if (start === 0) {
        if (!delimiter) throw new Error("Missing YAML frontmatter");
        metadataStart = end + 1;
      } else if (delimiter) {
        return prefix.subarray(metadataStart, start).toString("utf8");
      }
      start = end + 1;
    }
    throw new Error("Unterminated or oversized frontmatter");
  } finally {
    await handle.close();
  }
}
export function validate(
  yaml: string,
  directory: string,
): Record<string, unknown> {
  const doc = parseDocument(yaml, { uniqueKeys: true });
  if (doc.errors.length) throw new Error("Malformed YAML");
  const data: unknown = doc.toJS({ maxAliasCount: 0 });
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Metadata must be a mapping");
  const m = data as Record<string, unknown>;
  const fields = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
  ]);
  if (Object.keys(m).some((k) => !fields.has(k)))
    throw new Error("Unknown metadata field");
  if (
    typeof m.name !== "string" ||
    [...m.name].length > 64 ||
    m.name !== m.name.toLowerCase() ||
    !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(m.name) ||
    m.name.normalize("NFKC") !== directory.normalize("NFKC")
  )
    throw new Error("Invalid skill name or directory mismatch");
  if (
    typeof m.description !== "string" ||
    !m.description.trim() ||
    [...m.description].length > 1024
  )
    throw new Error("Invalid description");
  for (const key of ["license", "compatibility", "allowed-tools"])
    if (key in m && typeof m[key] !== "string")
      throw new Error(`Invalid ${key}`);
  if (
    typeof m.compatibility === "string" &&
    (!m.compatibility.trim() || [...m.compatibility].length > 500)
  )
    throw new Error("Invalid compatibility");
  if (
    "metadata" in m &&
    (!m.metadata ||
      typeof m.metadata !== "object" ||
      Array.isArray(m.metadata) ||
      Object.values(m.metadata).some((v) => typeof v !== "string"))
  )
    throw new Error("Invalid metadata map");
  if ("metadata" in m) {
    const mapping = doc.get("metadata", true);
    if (
      !isMap(mapping) ||
      mapping.items.some(
        (pair) => !isScalar(pair.key) || typeof pair.key.value !== "string",
      )
    )
      throw new Error("Metadata keys must be strings");
  }
  return m;
}
export async function projectRoot(start = process.cwd()): Promise<string> {
  let current = await realpath(start);
  while (true) {
    for (const marker of [".git", "package.json"]) {
      try {
        await access(path.join(current, marker));
        return current;
      } catch {}
    }
    const parent = path.dirname(current);
    if (parent === current)
      throw new Error("No project root found (.git or package.json)");
    current = parent;
  }
}
export async function discover(
  root: string,
  trace: Trace = quiet,
): Promise<Map<string, Skill>> {
  const skills = new Map<string, Skill>();
  for (const location of [".skills", ".agents/skills"]) {
    let entries;
    try {
      const dir = await safePath(root, location);
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    for (const entry of entries.sort((a, b) =>
      a.name.localeCompare(b.name, "en"),
    )) {
      if (!entry.isDirectory()) continue;
      const directory = await safePath(root, `${location}/${entry.name}`);
      let file;
      try {
        file = await safePath(directory, "SKILL.md");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
        throw error;
      }
      const metadata = validate(await frontmatter(file), entry.name);
      if (skills.has(entry.name)) {
        trace(`SHADOW ${entry.name} (higher-priority .skills wins)`);
        continue;
      }
      skills.set(entry.name, {
        name: entry.name,
        description: metadata.description as string,
        directory,
        metadata,
      });
    }
  }
  trace(`DISCOVER ${skills.size} valid skills`);
  return skills;
}
export async function activate(skill: Skill): Promise<string> {
  const text = await readBounded(await safePath(skill.directory, "SKILL.md"));
  const header = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!header) throw new Error("Missing YAML frontmatter");
  const metadata = validate(header[1]!, skill.name);
  if (JSON.stringify(metadata) !== JSON.stringify(skill.metadata))
    throw new Error("Skill metadata changed; restart discovery");
  return text;
}
