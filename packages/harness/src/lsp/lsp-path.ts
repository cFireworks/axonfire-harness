import * as path from "node:path";
import { homedir } from "node:os";
import { accessSync } from "node:fs";
/** PathUtils.resolveFilePathToWorkDir + its two helpers, 13336036 onward.
 * file URI prefix stripping intentionally does not decode URI escapes. */
export function resolveLSPFilePath(
  file: string,
  cwd: string,
  runtime = { platform: process.platform, homedir, accessSync },
): string {
  if (file.startsWith("file://")) file = file.replace(/^file:\/\//, "");
  else if (file.startsWith("file:")) file = file.replace(/^file:/, "");
  if (file.startsWith("~/"))
    return path.resolve(runtime.homedir(), file.slice(2));
  if (path.isAbsolute(file)) {
    if (runtime.platform !== "win32") return file;
    const drive = file.match(/^\/([a-zA-Z])\//);
    return drive
      ? path.win32.resolve(`${drive[1]!.toUpperCase()}:\\`, file.slice(3))
      : path.win32.normalize(file);
  }
  const normalized =
    runtime.platform === "win32" ? file : file.replace(/\\/g, "/");
  if (normalized.startsWith("@")) {
    const withoutAt = normalized.slice(1),
      candidate = path.resolve(cwd, normalized);
    try {
      runtime.accessSync(candidate);
      return candidate;
    } catch {
      return path.resolve(cwd, withoutAt);
    }
  }
  return path.resolve(cwd, normalized);
}
