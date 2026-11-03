import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
// Test setup and independent assertions only; never imported by production code.
export async function git(root: string, args: string[]): Promise<string> {
  return (await exec("git", ["--no-pager", ...args], {
    cwd: root,
    timeout: 5000,
    maxBuffer: 128 * 1024,
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0" },
  })).stdout;
}
