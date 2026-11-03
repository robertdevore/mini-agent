import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readBounded, safePath } from "./skills.js";
const exec = promisify(execFile);
const denied =
  /(^|\/)(\.[^/]+|node_modules|dist|agent|planning)(\/|$)|(^|\/)(?:[^/]*(?:secret|credential|token|private[-_]key)[^/]*|SKILL\.md|[^/]*\.(?:pem|key|p12|pfx))$/i;
export async function git(root: string, args: string[]): Promise<string> {
  try {
    return (
      await exec("git", ["--no-pager", ...args], {
        cwd: root,
        timeout: 5000,
        maxBuffer: 128 * 1024,
        env: {
          ...process.env,
          GIT_CONFIG_NOSYSTEM: "1",
          GIT_CONFIG_GLOBAL: "/dev/null",
          GIT_TERMINAL_PROMPT: "0",
        },
      })
    ).stdout;
  } catch {
    throw new Error(
      "Read-only Git operation failed (repository/history unavailable or output limit exceeded)",
    );
  }
}
export async function listRepository(root: string): Promise<string[]> {
  return (await git(root, ["ls-files", "-z"]))
    .split("\0")
    .filter((p) => p && !denied.test(p))
    .slice(0, 500);
}
export async function readRepository(
  root: string,
  file: string,
): Promise<string> {
  if (denied.test(file) || !(await listRepository(root)).includes(file))
    throw new Error(
      "Only listed, tracked, non-sensitive repository files may be read",
    );
  const resolved = await safePath(root, file);
  // Also apply exclusions to the resolved path, not just a symlink alias.
  const base = await import("node:fs/promises").then((fs) => fs.realpath(root));
  if (denied.test(resolved.slice(base.length + 1)))
    throw new Error("Resolved path is excluded");
  return readBounded(resolved);
}
export async function history(root: string): Promise<string> {
  return git(root, [
    "log",
    "-20",
    "--format=%H %aI %an%n%s%n%b",
    "--name-status",
    "--no-renames",
  ]);
}
export async function remote(root: string): Promise<string> {
  let value: string;
  try {
    value = (await git(root, ["remote", "get-url", "origin"])).trim();
  } catch {
    return "No readable origin configured. Ask the user whether this repository is local-only.";
  }
  // Never return URL userinfo, query strings, or arbitrary transport strings.
  const ssh = /^git@([\w.-]+):([\w./-]+?)(?:\.git)?$/.exec(value);
  if (ssh) return `https://${ssh[1]}/${ssh[2]}`;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error();
    return `${url.origin}${url.pathname.replace(/\.git$/, "")}`;
  } catch {
    return "Origin exists but is not a supported public HTTPS/SSH URL. Ask the user for citation context.";
  }
}
