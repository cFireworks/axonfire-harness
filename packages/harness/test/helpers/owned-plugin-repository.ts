import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
export async function ownedPluginRepository(root: string) {
  const source = join(root, "repository"),
    bare = join(root, "origin.git");
  await mkdir(source, { recursive: true });
  const git = (args: string[], cwd = source) =>
    execFileSync(
      "git",
      [
        "-c",
        "user.name=Owned Fixture",
        "-c",
        "user.email=fixture@example.invalid",
        ...args,
      ],
      {
        cwd,
        env: {
          PATH: process.env.PATH,
          HOME: root,
          GIT_CONFIG_NOSYSTEM: "1",
          GIT_CONFIG_GLOBAL: join(root, "no-global-config"),
        },
        encoding: "utf8",
        stdio: "pipe",
      },
    ).trim();
  async function content(version: string) {
    for (const prefix of ["", "nested/plugin/"]) {
      await mkdir(join(source, prefix, ".codebuddy-plugin"), {
        recursive: true,
      });
      await writeFile(
        join(source, prefix, ".codebuddy-plugin", "plugin.json"),
        JSON.stringify({ name: "owned-plugin", version }),
      );
      await mkdir(join(source, prefix, "commands"), { recursive: true });
      await writeFile(
        join(source, prefix, "commands", "echo.md"),
        "---\ndescription: owned\n---\ninstaller version " +
          version +
          " $ARGUMENTS",
      );
      await mkdir(join(source, prefix, "agents"), { recursive: true });
      await writeFile(
        join(source, prefix, "agents", "expert.md"),
        "---\nname: installed-expert\ndescription: owned\n---\ninstalled expert " +
          version,
      );
    }
  }
  git(["init", "-b", "main"]);
  await content("1.0.0");
  git(["add", "."]);
  git(["commit", "-m", "owned initial"]);
  const initial = git(["rev-parse", "HEAD"]);
  git(["clone", "--bare", source, bare]);
  return {
    source,
    bare,
    url: "file://" + bare,
    initial,
    git,
    async update() {
      await content("2.0.0");
      git(["add", "."]);
      git(["commit", "-m", "owned update"]);
      git(["push", bare, "main"]);
      return git(["rev-parse", "HEAD"]);
    },
  };
}
