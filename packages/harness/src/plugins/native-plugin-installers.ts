// Complete original Git/npm/git-subdir installers; external process/filesystem ownership is injected.
import * as path from "node:path";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
export function createNativePluginInstallers(runtime: any) {
  const t$: any = createCapturedPluginConstants(),
    tX = path,
    tZ = runtime.fsExtra,
    t8 = { default: runtime.exec },
    process = runtime.process ?? { env: {} },
    rJ = {
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0",
        GIT_SSH_COMMAND:
          "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new",
        NODE_OPTIONS: "",
      },
    },
    rq = /^[A-Za-z0-9][-A-Za-z0-9._]*$/,
    rW = /^(@[\w-]+\/)?[\w.-]+$/,
    rZ = /^[A-Za-z0-9][-A-Za-z0-9._]*$/;
  // UTF-16 9784026..9788420
  class GitPluginInstaller {
    [key: string]: any;
    support(eA: any): any {
      return (
        !!eA &&
        "string" != typeof eA &&
        (eA.source === t$.PluginSourceType.Url ||
          eA.source === t$.PluginSourceType.Github)
      );
    }
    async install(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = eA.name,
        ed: any = eA.source;
      if ((this.validatePluginName(eu), "string" == typeof ed))
        throw Error(
          `GitPluginInstaller does not support string source for ${eu}`,
        );
      if ((this.validateGitSha(ed.sha), !ed.url && !ed.repo))
        throw Error(`Git plugin source requires a URL or repo for ${eu}`);
      let ep: any = this.resolveGitUrl(ed),
        eg: any = await this.isInstalled(eA, el);
      if (eg)
        return (
          ec?.(`Plugin ${eu} already exists, updating instead...`),
          this.update(eA, eg, ec)
        );
      await tZ.ensureDir(el);
      let eh: any = (0, tX.join)(el, t$.DEFAULT_GIT_PLUGINS_DIR, eu);
      try {
        (ec?.(`Cloning Git repository for ${eu}...`), ec?.(`Source: ${ep}`));
        let eA: any = ["clone", "--depth", "1"];
        if (
          (ed.ref && !ed.sha && eA.push("--branch", ed.ref),
          ed.sha && eA.push("--no-checkout"),
          eA.push(ep, eh),
          await (0, t8.default)("git", eA, rJ),
          ed.sha)
        ) {
          let eA: any = { ...rJ, cwd: eh };
          (await (0, t8.default)(
            "git",
            ["fetch", "origin", ed.sha, "--depth", "1"],
            eA,
          ),
            await (0, t8.default)(
              "git",
              ["checkout", "--detach", "FETCH_HEAD"],
              eA,
            ));
          let el: any = String(
            (await (0, t8.default)("git", ["rev-parse", "HEAD"], eA)).stdout ||
              "",
          ).trim();
          if (el.toLowerCase() !== ed.sha.toLowerCase())
            throw Error(`Resolved Git SHA ${el} does not match ${ed.sha}`);
        }
        return (ec?.(`Plugin ${eu} cloned successfully to ${eh}`), eh);
      } catch (eA: any) {
        throw (
          (await tZ.pathExists(eh)) && (await tZ.remove(eh)),
          this.errorCollector.addError({
            type: t$.PluginErrorType.InstallFailed,
            pluginName: eu,
            marketplaceName: "",
            message: `Failed to clone Git repository for plugin '${eu}'`,
            details: eA instanceof Error ? eA.message : String(eA),
          }),
          Error(`Failed to clone Git repository for ${eu}: ${eA}`)
        );
      }
    }
    async update(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = eA.name,
        ed: any = eA.source;
      if ((this.validatePluginName(eu), "string" == typeof ed))
        throw Error(
          `GitPluginInstaller does not support string source for ${eu}`,
        );
      if ((this.validateGitSha(ed.sha), !(await tZ.pathExists(el))))
        return (
          ec?.(`Plugin ${eu} not found at ${el}, reinstalling...`),
          this.install(eA, (0, tX.join)(el, "..", ".."), ec)
        );
      try {
        ec?.(`Updating Git plugin ${eu}...`);
        let eA: any = (0, tX.join)(el, ".git");
        if (!(await tZ.pathExists(eA)))
          throw Error(`Path ${el} is not a Git repository`);
        let ep: any = { ...rJ, cwd: el };
        if (ed.sha) {
          (await (0, t8.default)(
            "git",
            ["fetch", "origin", ed.sha, "--depth", "1"],
            ep,
          ),
            await (0, t8.default)(
              "git",
              ["reset", "--hard", "FETCH_HEAD"],
              ep,
            ));
          let eA: any = String(
            (await (0, t8.default)("git", ["rev-parse", "HEAD"], ep)).stdout ||
              "",
          ).trim();
          if (eA.toLowerCase() !== ed.sha.toLowerCase())
            throw Error(`Resolved Git SHA ${eA} does not match ${ed.sha}`);
          return el;
        }
        if (ed.ref)
          return (
            await (0, t8.default)(
              "git",
              ["fetch", "origin", ed.ref, "--depth", "1"],
              ep,
            ),
            await (0, t8.default)("git", ["reset", "--hard", "FETCH_HEAD"], ep),
            el
          );
        let eg: any = await (0, t8.default)(
            "git",
            ["rev-parse", "--abbrev-ref", "HEAD"],
            ep,
          ),
          eh: any = String(eg.stdout || "").trim() || "main";
        return (
          ec?.(`Fetching latest changes for ${eu}...`),
          await (0, t8.default)(
            "git",
            ["fetch", "origin", eh, "--depth", "1"],
            ep,
          ),
          ec?.(`Syncing ${eu} to remote...`),
          await (0, t8.default)("git", ["reset", "--hard", `origin/${eh}`], ep),
          await (0, t8.default)("git", ["clean", "-fd"], ep),
          ec?.(`Plugin ${eu} updated successfully`),
          el
        );
      } catch (el: any) {
        (ec?.(`Failed to update plugin ${eu}: ${el}`),
          this.errorCollector.addError({
            type: t$.PluginErrorType.UpdateFailed,
            pluginName: eu,
            marketplaceName: "",
            message: `Failed to update Git plugin '${eu}'`,
            details: el instanceof Error ? el.message : String(el),
          }));
        let eA: any = ed.sha || ed.ref || "the remote HEAD";
        throw Error(
          `Failed to update Git plugin ${eu} to ${eA}: ${el instanceof Error ? el.message : String(el)}`,
        );
      }
    }
    async isInstalled(eA: any, el: any): Promise<any> {
      let ec: any = (0, tX.join)(el, t$.DEFAULT_GIT_PLUGINS_DIR, eA.name);
      if (await tZ.pathExists(ec)) {
        let eA: any = (0, tX.join)(ec, ".git");
        if (await tZ.pathExists(eA)) return ec;
      }
    }
    async getInstalledVersion(eA: any): Promise<any> {
      try {
        if (!(await tZ.pathExists(eA))) return;
        let el: any = { ...rJ, cwd: eA },
          ec: any = await (0, t8.default)("git", ["rev-parse", "HEAD"], el);
        return String(ec.stdout || "").trim();
      } catch (eA: any) {
        return;
      }
    }
    async getRemoteUrl(eA: any): Promise<any> {
      try {
        if (!(await tZ.pathExists(eA))) return;
        let el: any = { ...rJ, cwd: eA },
          ec: any = await (0, t8.default)(
            "git",
            ["config", "--get", "remote.origin.url"],
            el,
          );
        return String(ec.stdout || "").trim();
      } catch (eA: any) {
        return;
      }
    }
    resolveGitUrl(eA: any): any {
      if (eA.url) return eA.url;
      if (eA.repo) return `https://github.com/${eA.repo}.git`;
      throw Error("Invalid plugin source: missing url or repo");
    }
    validateGitSha(eA: any): any {
      if (eA && !/^[0-9a-f]{40}$/i.test(eA))
        throw Error(`Invalid Git SHA: ${eA}`);
    }
    validatePluginName(eA: any): any {
      if (!rq.test(eA)) throw Error(`Invalid plugin name: ${eA}`);
    }
  }
  // UTF-16 9789325..9790587
  class NpmPluginInstaller {
    [key: string]: any;
    init(): any {
      this.logger.setContext("NpmPluginInstaller");
    }
    support(eA: any): any {
      return "string" != typeof eA && eA.source === t$.PluginSourceType.Npm;
    }
    async install(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = eA.source,
        ed: any = eu.package || eA.name,
        ep: any = eu.versionConstraint || eA.version || "latest";
      if (!rW.test(ed)) throw Error(`Invalid npm package name: ${ed}`);
      let eg: any = (0, tX.join)(el, "plugins", eA.name);
      (await (0, tZ.mkdirp)(eg), ec?.(`Installing npm package ${ed}@${ep}...`));
      let eh: any = ["install", `${ed}@${ep}`, "--prefix", eg, "--no-save"];
      eu.registry && eh.push("--registry", eu.registry);
      try {
        await (0, t8.default)("npm", eh, {
          timeout: 12e4,
          cwd: eg,
          env: { ...process.env, NODE_OPTIONS: "" },
        });
      } catch (eA: any) {
        throw Error(
          `Failed to install npm package ${ed}@${ep}: ${eA instanceof Error ? eA.message : String(eA)}`,
        );
      }
      let ef: any = (0, tX.join)(eg, "node_modules", ed);
      if (!(await (0, tZ.pathExists)(ef)))
        throw Error(`Package directory not found after install: ${ef}`);
      return (
        ec?.(`npm package ${ed}@${ep} installed successfully`),
        this.logger.info(`Installed npm plugin ${ed}@${ep} to ${ef}`),
        ef
      );
    }
    async update(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = (0, tX.join)(el, "..", "..");
      return this.install(eA, eu, ec);
    }
    async isInstalled(eA: any, el: any): Promise<any> {
      let ec: any = (0, tX.join)(el, "plugins", eA.name),
        eu: any = eA.source,
        ed: any = eu?.package || eA.name,
        ep: any = (0, tX.join)(ec, "node_modules", ed);
      if (await (0, tZ.pathExists)(ep)) return ep;
    }
  }
  // UTF-16 9791710..9795641
  class GitSubdirPluginInstaller {
    [key: string]: any;
    init(): any {
      this.logger.setContext("GitSubdirPluginInstaller");
    }
    support(eA: any): any {
      return (
        "string" != typeof eA && eA.source === t$.PluginSourceType.GitSubdir
      );
    }
    async install(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = eA.source;
      (this.validatePluginName(eA.name), this.validateGitSha(eu.sha));
      let ed: any = eu.url || eu.repo,
        ep: any =
          ed && /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(ed)
            ? `https://github.com/${ed}.git`
            : ed,
        eg: any = this.getValidatedSubdir(eu);
      if (!ep) throw Error("Git URL is required for git-subdir source");
      let eh: any = (0, tX.join)(el, "plugins", eA.name),
        ef: any = (0, tX.join)(eh, eg);
      if (await (0, tZ.pathExists)((0, tX.join)(eh, ".git")))
        return this.update(eA, ef, ec);
      ((await (0, tZ.pathExists)(eh)) && (await (0, tZ.remove)(eh)),
        await (0, tZ.mkdirp)(eh),
        ec?.(`Cloning ${ep} (sparse checkout: ${eg})...`));
      let em: any = {
          ...process.env,
          GIT_TERMINAL_PROMPT: "0",
          GIT_SSH_COMMAND:
            "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new",
          NODE_OPTIONS: "",
        },
        runGit: any = (eA: any, el: any, ec: any) =>
          (0, t8.default)("git", eA, {
            timeout: el,
            ...(ec && { cwd: ec }),
            env: em,
          });
      try {
        let eA: any = [
          "clone",
          "--filter=tree:0",
          "--no-checkout",
          "--depth",
          "1",
        ];
        if (
          (eu.ref && !eu.sha && eA.push("--branch", eu.ref),
          eA.push(ep, eh),
          await runGit(eA, 12e4),
          await runGit(["sparse-checkout", "set", "--no-cone", eg], 3e4, eh),
          eu.sha &&
            (await runGit(
              ["fetch", "origin", eu.sha, "--depth", "1"],
              6e4,
              eh,
            )),
          await runGit(
            eu.sha ? ["checkout", "--detach", "FETCH_HEAD"] : ["checkout"],
            6e4,
            eh,
          ),
          eu.sha)
        ) {
          let { stdout: eA } = await runGit(["rev-parse", "HEAD"], 3e4, eh),
            el: any = eA.trim();
          if (el.toLowerCase() !== eu.sha.toLowerCase())
            throw Error(`Resolved Git SHA ${el} does not match ${eu.sha}`);
        }
      } catch (eA: any) {
        throw (
          await (0, tZ.remove)(eh).catch(() => void 0),
          Error(
            `Failed to sparse checkout ${ep}/${eg}: ${eA instanceof Error ? eA.message : String(eA)}`,
          )
        );
      }
      let eE: any = (0, tX.join)(eh, eg);
      if (!(await (0, tZ.pathExists)(eE)))
        throw Error(`Subdir not found after checkout: ${eE}`);
      return (
        ec?.(`Sparse checkout complete: ${eg}`),
        this.logger.info(
          `Installed git-subdir plugin ${eA.name} from ${ep}/${eg}`,
        ),
        eE
      );
    }
    async update(eA: any, el: any, ec?: any): Promise<any> {
      ec?.("Updating git-subdir plugin...");
      let eu: any = eA.source;
      (this.validatePluginName(eA.name), this.validateGitSha(eu.sha));
      let ed: any = this.getValidatedSubdir(eu)
          .split(/[\\/]+/)
          .filter(Boolean).length,
        ep: any =
          ed > 0
            ? (0, tX.join)(el, ...Array.from({ length: ed }, () => ".."))
            : el,
        eg: any = ep;
      for (; eg && !(await (0, tZ.pathExists)((0, tX.join)(eg, ".git"))); ) {
        let eA: any = (0, tX.join)(eg, "..");
        if (eA === eg) break;
        eg = eA;
      }
      if (!(await (0, tZ.pathExists)((0, tX.join)(eg, ".git")))) {
        let el: any = (0, tX.join)(ep, "..", "..");
        return this.install(eA, el, ec);
      }
      let eh: any = {
          ...process.env,
          GIT_TERMINAL_PROMPT: "0",
          GIT_SSH_COMMAND:
            "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new",
          NODE_OPTIONS: "",
        },
        runGit: any = (eA: any, el: any) =>
          (0, t8.default)("git", eA, { timeout: el, cwd: eg, env: eh });
      try {
        if (eu.sha) {
          (await runGit(["fetch", "origin", eu.sha, "--depth", "1"], 6e4),
            await runGit(["reset", "--hard", "FETCH_HEAD"], 3e4));
          let { stdout: eA } = await runGit(["rev-parse", "HEAD"], 3e4),
            el: any = eA.trim();
          if (el.toLowerCase() !== eu.sha.toLowerCase())
            throw Error(`Resolved Git SHA ${el} does not match ${eu.sha}`);
        } else
          eu.ref
            ? (await runGit(["fetch", "origin", eu.ref, "--depth", "1"], 6e4),
              await runGit(["reset", "--hard", "FETCH_HEAD"], 3e4))
            : await runGit(["pull", "--depth", "1"], 6e4);
      } catch (eu: any) {
        this.logger.warn(`Git pull failed, re-installing: ${eu}`);
        let el: any = (0, tX.join)(ep, "..", "..");
        return (await (0, tZ.remove)(eg), this.install(eA, el, ec));
      }
      return (ec?.("Update complete"), el);
    }
    async isInstalled(eA: any, el: any): Promise<any> {
      let ec: any = eA.source;
      this.validatePluginName(eA.name);
      let eu: any = this.getValidatedSubdir(ec),
        ed: any = (0, tX.join)(el, "plugins", eA.name),
        ep: any = (0, tX.join)(ed, eu);
      return (await (0, tZ.pathExists)(ep))
        ? ep
        : (await (0, tZ.pathExists)(ed))
          ? ed
          : void 0;
    }
    validateGitSha(eA: any): any {
      if (eA && !/^[0-9a-f]{40}$/i.test(eA))
        throw Error(`Invalid Git SHA: ${eA}`);
    }
    validatePluginName(eA: any): any {
      if (!rZ.test(eA)) throw Error(`Invalid plugin name: ${eA}`);
    }
    getValidatedSubdir(eA: any): any {
      let el: any = (eA.path || eA.subdir || "")
        .replace(/\\/g, "/")
        .replace(/^\.\//, "")
        .replace(/\/+$/, "");
      if (
        !el ||
        el.startsWith("/") ||
        /^[A-Za-z]:\//.test(el) ||
        el.split("/").includes("..")
      )
        throw Error(`Invalid git-subdir path: ${eA.path || eA.subdir || ""}`);
      return el;
    }
  }
  return { GitPluginInstaller, NpmPluginInstaller, GitSubdirPluginInstaller };
}
