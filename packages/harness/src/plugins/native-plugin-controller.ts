// Complete original PluginController. Routing/console/readline are standalone bindings.
import * as readline from "node:readline/promises";
import { SettingsScope } from "../permissions/native-permission-policy.js";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
export function createNativePluginController(runtime: any) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    process: any = runtime.process ?? globalThis.process,
    t$: any = createCapturedPluginConstants(),
    A_ = { SettingsScope },
    t0 = { ConsoleOutputMode: { NATIVE: "native" } },
    rH = { ManifestValidationError: runtime.ManifestValidationError };
  const ec: any = (id: number) => {
    if (id === 42232) return runtime.readline ?? readline;
    throw Error("Plugin controller import " + id);
  };
  ec.t = ec;
  // UTF-16 9763415..9773771
  class PluginController {
    [key: string]: any;
    async reconcileWorkbuddyBuiltin(eA: any): Promise<any> {
      let el: any;
      try {
        await this.pluginRuntimeRefreshService.refresh("builtin-seed", {
          reloadDesiredState: !1,
          prepareDesiredState: async () => {
            el = await this.pluginManager.reconcileWorkbuddyBuiltinSeed(eA);
          },
        });
      } catch (ec: any) {
        if (!el) throw ec;
        let eA: any = ec instanceof Error ? ec.message : String(ec);
        return (
          this.logger.warn(
            "WorkBuddy builtin metadata committed but runtime projection failed: " +
              eA,
          ),
          Object.freeze({
            ...el,
            runtimeProjectionSucceeded: !1,
            runtimeProjectionError: eA,
          })
        );
      }
      if (!el) throw Error("WorkBuddy builtin seed reconciliation did not run");
      return Object.freeze({ ...el, runtimeProjectionSucceeded: !0 });
    }
    async validate(eA: any): Promise<any> {
      let el: any = eA.path;
      try {
        let eA: any = await this.pluginValidator.validateManifest(el),
          ec: any = `Validating ${eA.fileType} manifest: ${eA.filePath}

`;
        if (
          (eA.errors.length > 0 &&
            ((ec += `✘ Found ${eA.errors.length} error${1 === eA.errors.length ? "" : "s"}:

`),
            eA.errors.forEach((eA: any) => {
              ec += `  → ${eA.path}: ${eA.message}
`;
            }),
            (ec += "\n")),
          eA.warnings.length > 0 &&
            ((ec += `⚠ Found ${eA.warnings.length} warning${1 === eA.warnings.length ? "" : "s"}:

`),
            eA.warnings.forEach((eA: any) => {
              ec += `  → ${eA.path}: ${eA.message}
`;
            }),
            (ec += "\n")),
          eA.success
            ? eA.warnings.length > 0
              ? (ec += "✔ Validation passed with warnings")
              : (ec += "✔ Validation passed")
            : (ec += "✘ Validation failed"),
          this.consoleManager.log(ec, { mode: t0.ConsoleOutputMode.NATIVE }),
          !eA.success)
        )
          throw new rH.ManifestValidationError("", eA.filePath, eA);
        return {
          path: eA.filePath,
          valid: eA.success,
          type: eA.fileType,
          errors: eA.errors.length > 0 ? eA.errors : void 0,
          warnings: eA.warnings.length > 0 ? eA.warnings : void 0,
        };
      } catch (el: any) {
        if (el instanceof rH.ManifestValidationError) throw el;
        let eA: any = el.message || String(el);
        throw (
          this.consoleManager.log(`✘ Validation error: ${eA}`, {
            mode: t0.ConsoleOutputMode.NATIVE,
          }),
          el
        );
      }
    }
    async addMarketplace(eA: any): Promise<any> {
      this.consoleManager.log("Adding marketplace...", {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        let el: any = await this.pluginManager.addMarketplace(eA.source, {
          name: eA.name,
        });
        return (
          this.consoleManager.log(
            `✔ Marketplace '${el.name}' added successfully`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          { name: el.name, type: el.type }
        );
      } catch (eA: any) {
        throw (
          this.consoleManager.log(
            `✘ Failed to add marketplace: ${eA.message}`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          eA
        );
      }
    }
    async listMarketplaces(): Promise<any> {
      let eA: any = await this.pluginManager.listMarketplace();
      if (0 === eA.length)
        return (this.logger.info("No marketplaces configured"), eA);
      for (let el of (this.logger.info("Configured marketplaces:"), eA)) {
        let eA: any = this.getMarketplaceTypeLabel(el.type),
          ec: any = this.getSourceInfo(el);
        this.logger.info(`  ${el.name} - Source: ${eA} (${ec})`);
      }
      return eA.map((eA: any) => ({
        name: eA.name,
        type: eA.type,
        description: eA.description,
      }));
    }
    async updateMarketplace(eA: any): Promise<any> {
      this.consoleManager.log(`Updating marketplace '${eA.name}'...`, {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        let el: any = await this.pluginManager.updateMarketplace(
          eA.name || "",
          { name: eA.name, force: !0 === eA.force },
        );
        return (
          this.consoleManager.log(
            `✔ Marketplace '${el.name}' updated successfully`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          { name: el.name, type: el.type }
        );
      } catch (eA: any) {
        throw (
          this.consoleManager.log(
            `✘ Failed to update marketplace: ${eA.message}`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          eA
        );
      }
    }
    async removeMarketplace(eA: any): Promise<any> {
      this.consoleManager.log(`Removing marketplace '${eA.name}'...`, {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        (await this.pluginManager.removeMarketplace(eA.name),
          this.consoleManager.log(
            `✔ Marketplace '${eA.name}' removed successfully`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ));
      } catch (eA: any) {
        throw (
          this.consoleManager.log(
            `✘ Failed to remove marketplace: ${eA.message}`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          eA
        );
      }
    }
    async rmMarketplace(eA: any): Promise<any> {
      return this.removeMarketplace(eA);
    }
    async installPlugins(eA: any): Promise<any> {
      let el: any = eA.plugin,
        ec: any = {
          ...eA.options,
          ...(eA.scope && { scope: this.parseScope(eA.scope) }),
        };
      this.consoleManager.log(`Installing plugin: ${el}...`, {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        (await this.pluginManager.installPlugins(...this.parsePluginId(el), ec),
          this.consoleManager.log(
            `✔ Successfully installed plugin: ${el}. Run /reload-plugins to apply now, or start a new session.`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ));
      } catch (eA: any) {
        throw (
          this.consoleManager.log(
            `✘ Failed to install plugin(s): ${eA.message}`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          eA
        );
      }
    }
    async uninstallPlugins(eA: any): Promise<any> {
      this.consoleManager.log(`Uninstalling plugin(s): ${eA.plugin}...`, {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        if (
          eA.prune &&
          !eA.yes &&
          !(await this.confirmRemoval(
            `Uninstall ${eA.plugin} and remove auto-installed dependencies that are no longer needed?`,
          ))
        )
          return void this.consoleManager.log("Uninstall cancelled", {
            mode: t0.ConsoleOutputMode.NATIVE,
          });
        let el: any = {
          ...eA.options,
          ...(eA.scope && { scope: this.parseScope(eA.scope) }),
          ...(void 0 !== eA.prune && { prune: eA.prune }),
          ...(void 0 !== eA.keepData && { keepData: eA.keepData }),
        };
        (await this.pluginManager.uninstallPlugins(
          ...this.parsePluginId(eA.plugin),
          el,
        ),
          this.consoleManager.log(
            `✔ Successfully uninstalled plugin: ${eA.plugin}. Run /reload-plugins to apply now, or start a new session.`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ));
      } catch (eA: any) {
        throw (
          this.consoleManager.log(
            `✘ Failed to uninstall plugin(s): ${eA.message}`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          eA
        );
      }
    }
    async prunePlugins(eA: any = {}): Promise<any> {
      let el: any = {
          ...(eA.scope && { scope: this.parseScope(eA.scope) }),
          ...(eA.workspacePath && { workspacePath: eA.workspacePath }),
          dryRun: !0,
        },
        ec: any = await this.pluginManager.prunePlugins(el);
      if (eA.dryRun || 0 === ec.length) {
        let eA: any =
          ec.length > 0 ? ec.join(", ") : "no orphaned dependencies";
        return (
          this.consoleManager.log(`Would prune: ${eA}`, {
            mode: t0.ConsoleOutputMode.NATIVE,
          }),
          ec
        );
      }
      if (!eA.yes && (!process.stdin.isTTY || !process.stdout.isTTY))
        return (
          this.consoleManager.log(
            `Would prune: ${ec.join(", ")}. Re-run with --yes to remove them.`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          ec
        );
      if (
        !eA.yes &&
        !(await this.confirmRemoval(
          `Remove ${ec.length} auto-installed dependenc${1 === ec.length ? "y" : "ies"}: ${ec.join(", ")}?`,
        ))
      )
        return (
          this.consoleManager.log("Prune cancelled", {
            mode: t0.ConsoleOutputMode.NATIVE,
          }),
          []
        );
      let eu: any = await this.pluginManager.prunePlugins({
        ...el,
        dryRun: !1,
      });
      return (
        this.consoleManager.log(`Pruned: ${eu.join(", ")}`, {
          mode: t0.ConsoleOutputMode.NATIVE,
        }),
        eu
      );
    }
    async enablePlugins(eA: any): Promise<any> {
      this.consoleManager.log(`Enabling plugin(s): ${eA.plugin}...`, {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        (await this.pluginManager.enablePlugins(
          ...this.parsePluginId(eA.plugin),
          eA.scope ? { scope: this.parseScope(eA.scope) } : void 0,
        ),
          this.consoleManager.log(
            `✔ Successfully enabled plugin: ${eA.plugin}. Run /reload-plugins to apply now, or start a new session.`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ));
      } catch (eA: any) {
        throw (
          this.consoleManager.log(
            `✘ Failed to enable plugin(s): ${eA.message}`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          eA
        );
      }
    }
    async disablePlugins(eA: any): Promise<any> {
      this.consoleManager.log(`Disabling plugin(s): ${eA.plugin}...`, {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        (await this.pluginManager.disablePlugins(
          ...this.parsePluginId(eA.plugin),
          eA.scope ? { scope: this.parseScope(eA.scope) } : void 0,
        ),
          this.consoleManager.log(
            `✔ Successfully disabled plugin: ${eA.plugin}. Run /reload-plugins to apply now, or start a new session.`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ));
      } catch (eA: any) {
        throw (
          this.consoleManager.log(
            `✘ Failed to disable plugin(s): ${eA.message}`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ),
          eA
        );
      }
    }
    async updatePlugin(eA: any): Promise<any> {
      let el: any = eA.plugin,
        ec: any = { ...(eA.scope && { scope: this.parseScope(eA.scope) }) };
      this.consoleManager.log(`Updating plugin: ${el}...`, {
        mode: t0.ConsoleOutputMode.NATIVE,
      });
      try {
        (await this.pluginManager.updatePlugins(...this.parsePluginId(el), ec),
          this.consoleManager.log(
            `✔ Successfully updated plugin: ${el}. Run /reload-plugins to apply now, or start a new session.`,
            { mode: t0.ConsoleOutputMode.NATIVE },
          ));
      } catch (eA: any) {
        throw (
          this.consoleManager.log(`✘ Failed to update plugin: ${eA.message}`, {
            mode: t0.ConsoleOutputMode.NATIVE,
          }),
          eA
        );
      }
    }
    async listInstalledPlugins(eA: any = {}): Promise<any> {
      let el: any = await this.pluginManager.getInstalledPlugins(),
        ec: any = el.map((eA: any) => ({
          name: eA.name,
          version: eA.version,
          description: eA.description,
          status: eA.status,
          marketplace: eA.marketplaceName,
          author: eA.author,
          license: eA.license,
          homepage: eA.homepage,
          repository: eA.repository,
          keywords: eA.keywords,
          category: eA.category,
          features: eA.features,
          source: eA.source,
          dependencies: eA.dependencies,
          dependencyErrors: eA.dependencyErrors,
        }));
      if (!eA.print) return ec;
      if (eA.json)
        return el.map((eA: any) => ({
          id: `${eA.name}@${eA.marketplaceName}`,
          version: eA.version || "unknown",
          scope: this.getCliInstallScope(eA),
          enabled: eA.status === t$.PluginStatus.Enabled,
          installPath: eA.installedPath,
          resolvedVersion: eA.resolvedVersion,
          gitCommitSha: eA.gitCommitSha,
          auto: eA.autoInstalled || void 0,
          dependencies: eA.dependencies,
          dependencyErrors: eA.dependencyErrors,
        }));
      let eu: any = this.formatInstalledPluginList(el);
      return (
        process.stdout.isTTY &&
          this.consoleManager.log(eu, { mode: t0.ConsoleOutputMode.NATIVE }),
        { text: eu }
      );
    }
    async getPlugin(eA: any): Promise<any> {
      return await this.pluginManager.getPlugin(eA.name, eA.marketplace);
    }
    async browseMarketplace(eA: any): Promise<any> {
      let el: any = eA.marketplace;
      if (!el) throw Error("Marketplace name is required");
      try {
        return await this.pluginManager.getPlugins(el);
      } catch (eA: any) {
        throw (
          this.logger.error(
            `Failed to browse marketplace '${el}': ${eA.message}`,
          ),
          eA
        );
      }
    }
    getMarketplaceTypeLabel(eA: any): any {
      switch (eA) {
        case t$.MarketplaceType.Directory:
          return "Directory";
        case t$.MarketplaceType.Github:
          return "GitHub";
        case t$.MarketplaceType.Git:
          return "Git";
        case t$.MarketplaceType.URL:
          return "HTTP";
        default:
          return eA;
      }
    }
    getSourceInfo(eA: any): any {
      return eA.source?.path
        ? eA.source.path
        : eA.source?.repo
          ? eA.source.repo
          : eA.installLocation || "unknown";
    }
    parsePluginId(eA: any): any {
      let [el, ec] = eA.split("@");
      return [[el], ec];
    }
    parseScope(eA: any): any {
      switch (eA) {
        case "user":
        default:
          return A_.SettingsScope.USER;
        case "project":
          return A_.SettingsScope.PROJECT;
        case "local":
          return A_.SettingsScope.PROJECT_LOCAL;
      }
    }
    async confirmRemoval(eA: any): Promise<any> {
      if (!process.stdin.isTTY || !process.stdout.isTTY)
        throw Error(
          "Confirmation requires --yes when stdin or stdout is not a TTY",
        );
      let { createInterface: el } = await Promise.resolve().then(
          ec.t.bind(ec, 42232, 23),
        ),
        eu: any = el({ input: process.stdin, output: process.stdout });
      try {
        let el: any = await eu.question(`${eA} [y/N] `);
        return /^(?:y|yes)$/i.test(el.trim());
      } finally {
        eu.close();
      }
    }
    getCliInstallScope(eA: any): any {
      return eA.installScope === A_.SettingsScope.PROJECT_LOCAL
        ? "local"
        : eA.installScope || "user";
    }
    formatInstalledPluginList(eA: any): any {
      return 0 === eA.length
        ? "No plugins installed. Use `codebuddy plugin install` to install a plugin."
        : [
            "Installed plugins:",
            ...eA.flatMap((eA: any) => [
              "",
              `  > ${eA.name}@${eA.marketplaceName}`,
              `    Version: ${eA.version || "unknown"}`,
              `    Scope: ${this.getCliInstallScope(eA)}`,
              `    Status: ${eA.status === t$.PluginStatus.Enabled ? "enabled" : "disabled"}`,
            ]),
          ].join("\n");
    }
  }
  return { PluginController };
}
