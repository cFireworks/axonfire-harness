// Complete original manifest validator and validation error; owned read-only dependencies.
import * as path from "node:path";
import { createCapturedPluginConstants } from "../vendor/captured-plugin-constants.js";
import { createNativePluginSemver } from "./native-plugin-semver.js";
export function createNativePluginValidator(runtime: any) {
  const ed: any = runtime.fsExtra,
    ep = path,
    eg: any = createNativePluginSemver(runtime),
    eh: any = createCapturedPluginConstants(),
    ef = /^[A-Za-z0-9][-A-Za-z0-9._]*$/,
    em = /^[A-Za-z0-9][-A-Za-z0-9._]*(?:@[A-Za-z0-9][-A-Za-z0-9._]*)?$/;
  // UTF-16 9839074..9839229
  class ManifestValidationError extends Error {
    [key: string]: any;
    constructor(eA: any, el: any, ec: any) {
      (super(eA),
        (this.name = "ManifestValidationError"),
        (this.filePath = el),
        (this.validationResult = ec));
    }
  }
  // UTF-16 9839237..9844910
  class PluginValidatorImpl {
    [key: string]: any;
    async validateManifest(eA: any): Promise<any> {
      let el: any = ep.resolve(eA);
      return (await ed.pathExists(el))
        ? (await ed.stat(el)).isDirectory()
          ? await this.validateDirectory(el)
          : await this.validateFile(el)
        : {
            success: !1,
            errors: [{ path: "file", message: `File not found: ${el}` }],
            warnings: [],
            filePath: el,
            fileType: "plugin",
          };
    }
    async validateDirectory(eA: any): Promise<any> {
      for (let el of eh.PLUGINS_METADATA_DIRS) {
        let ec: any = ep.join(eA, el, eh.MARKETPLACE_MANIFEST_FILE);
        if (await ed.pathExists(ec))
          return await this.validateMarketplaceManifestFile(ec);
        let eu: any = ep.join(eA, el, eh.PLUGIN_MANIFEST_FILE);
        if (await ed.pathExists(eu))
          return await this.validatePluginManifestFile(eu);
      }
      return {
        success: !1,
        errors: [
          {
            path: "directory",
            message: `No manifest found in directory. Expected ${eh.PLUGINS_METADATA_DIRS.map((eA: any) => `${eA}/${eh.MARKETPLACE_MANIFEST_FILE} or ${eA}/${eh.PLUGIN_MANIFEST_FILE}`).join(" or ")}`,
          },
        ],
        warnings: [],
        filePath: eA,
        fileType: "plugin",
      };
    }
    async validateFile(eA: any): Promise<any> {
      let el: any = ep.basename(eA);
      if (el === eh.MARKETPLACE_MANIFEST_FILE)
        return await this.validateMarketplaceManifestFile(eA);
      if (el === eh.PLUGIN_MANIFEST_FILE)
        return await this.validatePluginManifestFile(eA);
      try {
        let el: any = await ed.readFile(eA, "utf-8"),
          ec: any = JSON.parse(el);
        if (Array.isArray(ec.plugins))
          return await this.validateMarketplaceManifestFile(eA);
        return await this.validatePluginManifestFile(eA);
      } catch (el: any) {
        return {
          success: !1,
          errors: [
            {
              path: "file",
              message: `Failed to parse JSON: ${el instanceof Error ? el.message : String(el)}`,
            },
          ],
          warnings: [],
          filePath: eA,
          fileType: "plugin",
        };
      }
    }
    async validatePluginManifestFile(eA: any): Promise<any> {
      try {
        let el: any = await ed.readFile(eA, "utf-8"),
          ec: any = JSON.parse(el),
          eu: any = [],
          ep: any = [];
        return (
          ec.name ||
            eu.push({ path: "name", message: "Missing required field: name" }),
          ec.version ||
            ep.push({
              path: "version",
              message: 'Field "version" is recommended',
            }),
          ec.description ||
            ep.push({
              path: "description",
              message: 'Field "description" is recommended',
            }),
          ec.commands &&
            !Array.isArray(ec.commands) &&
            "string" != typeof ec.commands &&
            eu.push({
              path: "commands",
              message: 'Field "commands" must be an array or string',
            }),
          ec.agents &&
            !Array.isArray(ec.agents) &&
            "string" != typeof ec.agents &&
            eu.push({
              path: "agents",
              message: 'Field "agents" must be an array or string',
            }),
          ec.skills &&
            !Array.isArray(ec.skills) &&
            "string" != typeof ec.skills &&
            eu.push({
              path: "skills",
              message: 'Field "skills" must be an array or string',
            }),
          ec.hooks &&
            (("object" != typeof ec.hooks && "string" != typeof ec.hooks) ||
              (Array.isArray(ec.hooks) &&
                ec.hooks.some(
                  (eA: any) =>
                    "string" != typeof eA &&
                    (!eA || "object" != typeof eA || Array.isArray(eA)),
                ))) &&
            eu.push({
              path: "hooks",
              message:
                'Field "hooks" must be a path, object, or array of those values',
            }),
          ec.mcpServers &&
            "object" != typeof ec.mcpServers &&
            "string" != typeof ec.mcpServers &&
            eu.push({
              path: "mcpServers",
              message: 'Field "mcpServers" must be an object or string',
            }),
          ec.outputStyles &&
            !Array.isArray(ec.outputStyles) &&
            "string" != typeof ec.outputStyles &&
            eu.push({
              path: "outputStyles",
              message: 'Field "outputStyles" must be an array or string',
            }),
          void 0 !== ec.defaultEnabled &&
            "boolean" != typeof ec.defaultEnabled &&
            eu.push({
              path: "defaultEnabled",
              message: 'Field "defaultEnabled" must be a boolean',
            }),
          this.validateDependencies(ec.dependencies, "dependencies", eu),
          {
            success: 0 === eu.length,
            errors: eu,
            warnings: ep,
            filePath: eA,
            fileType: "plugin",
          }
        );
      } catch (el: any) {
        return {
          success: !1,
          errors: [
            {
              path: "file",
              message: `Failed to parse plugin manifest: ${el instanceof Error ? el.message : String(el)}`,
            },
          ],
          warnings: [],
          filePath: eA,
          fileType: "plugin",
        };
      }
    }
    async validateMarketplaceManifestFile(eA: any): Promise<any> {
      try {
        let el: any = await ed.readFile(eA, "utf-8"),
          ec: any = JSON.parse(el),
          eu: any = [],
          ep: any = [];
        return (
          ec.plugins && Array.isArray(ec.plugins)
            ? ec.plugins.forEach((eA: any, el: any) => {
                (eA.name ||
                  eu.push({
                    path: `plugins[${el}].name`,
                    message: "Plugin name is required",
                  }),
                  eA.source ||
                    eu.push({
                      path: `plugins[${el}].source`,
                      message: "Plugin source is required",
                    }),
                  eA.version ||
                    ep.push({
                      path: `plugins[${el}].version`,
                      message: "Plugin version is recommended",
                    }),
                  eA.description ||
                    ep.push({
                      path: `plugins[${el}].description`,
                      message: "Plugin description is recommended",
                    }),
                  this.validateDependencies(
                    eA.dependencies,
                    `plugins[${el}].dependencies`,
                    eu,
                  ));
              })
            : eu.push({
                path: "plugins",
                message:
                  "Missing or invalid required field: plugins (must be an array)",
              }),
          void 0 !== ec.allowCrossMarketplaceDependenciesOn &&
            (!Array.isArray(ec.allowCrossMarketplaceDependenciesOn) ||
              ec.allowCrossMarketplaceDependenciesOn.some(
                (eA: any) => "string" != typeof eA || !ef.test(eA),
              )) &&
            eu.push({
              path: "allowCrossMarketplaceDependenciesOn",
              message:
                'Field "allowCrossMarketplaceDependenciesOn" must contain valid marketplace names',
            }),
          {
            success: 0 === eu.length,
            errors: eu,
            warnings: ep,
            filePath: eA,
            fileType: "marketplace",
          }
        );
      } catch (el: any) {
        return {
          success: !1,
          errors: [
            {
              path: "file",
              message: `Failed to parse marketplace manifest: ${el instanceof Error ? el.message : String(el)}`,
            },
          ],
          warnings: [],
          filePath: eA,
          fileType: "marketplace",
        };
      }
    }
    validateDependencies(eA: any, el: any, ec: any): any {
      if (void 0 !== eA) {
        if (!Array.isArray(eA))
          return void ec.push({
            path: el,
            message: 'Field "dependencies" must be an array',
          });
        eA.forEach((eA: any, eu: any) => {
          let ed: any = `${el}[${eu}]`;
          if ("string" == typeof eA) {
            em.test(eA.trim()) ||
              ec.push({
                path: ed,
                message:
                  "Dependency must be a plugin name optionally qualified with @marketplace",
              });
            return;
          }
          if (!eA || "object" != typeof eA || Array.isArray(eA))
            return void ec.push({
              path: ed,
              message: "Dependency must be a string or object",
            });
          let ep: any = eA;
          (("string" == typeof ep.name && ef.test(ep.name.trim())) ||
            ec.push({
              path: `${ed}.name`,
              message: "Dependency object requires a valid plugin name",
            }),
            void 0 === ep.version ||
              ("string" == typeof ep.version &&
                ep.version.trim() &&
                (0, eg.validRange)(ep.version.trim())) ||
              ec.push({
                path: `${ed}.version`,
                message: "Dependency version must be a valid semver range",
              }),
            void 0 === ep.marketplace ||
              ("string" == typeof ep.marketplace &&
                ef.test(ep.marketplace.trim())) ||
              ec.push({
                path: `${ed}.marketplace`,
                message: "Dependency marketplace must be a valid name",
              }));
        });
      }
    }
  }
  return { ManifestValidationError, PluginValidatorImpl };
}
