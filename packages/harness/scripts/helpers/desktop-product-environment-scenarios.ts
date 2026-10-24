import { createNativeDesktopClientProduct } from "../../src/config/native-desktop-client-product.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { createNativeDesktopEnvironmentProviders } from "../../src/config/native-desktop-environment-providers.js";
import assert from "node:assert/strict";
import { BehaviorSubject } from "rxjs";
import { createNativeDesktopProductManager } from "../../src/config/native-desktop-product-manager.js";
import { withOwnedDesktopProduct } from "./desktop-product-scenarios.js";
type Factory = (runtime?: any) => any;
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  const env: any = {},
    configuration = new BehaviorSubject<any>({}),
    session = new BehaviorSubject<any>(undefined),
    syncs: any[] = [];
  const api = factory({
      process: { env },
      authenticationManager: { currentSessionSubject: session },
    }),
    service = Object.assign(new api.ProductEnvServiceImpl(), {
      productManager: {
        configuration,
        waitConfiguration: async () => configuration.getValue(),
        sync: async () => {
          syncs.push({ ...env });
        },
      },
    });
  try {
    await run({ api, env, configuration, session, syncs, service });
  } finally {
    configuration.complete();
    session.complete();
  }
}
export const desktopProductEnvironmentScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "domain priority, arrays and self-hosted fallback",
    (f) =>
      owned(f, async (s) => {
        s.configuration.next({
          authentication: {
            attributes: {
              internalDomain: ["internal.invalid", "overlap.invalid"],
              iOADomain: "ioa.invalid",
              cloudHostedDomain: "cloud.invalid",
              externalDomain: ["external.invalid", "overlap.invalid"],
            },
          },
        });
        for (const [domain, expected] of [
          ["internal.invalid", "internal"],
          ["overlap.invalid", "internal"],
          ["ioa.invalid", "iOA"],
          ["cloud.invalid", "cloudhosted"],
          ["external.invalid", "external"],
          ["custom.invalid", "selfhosted"],
        ])
          assert.equal(
            await s.service.resolveEnvBySession({ auth: { domain } }),
            expected,
          );
        assert.equal(await s.service.resolveEnvBySession(undefined), undefined);
        assert.equal(
          await s.service.resolveEnvBySession({ auth: {} }),
          undefined,
        );
      }),
  ],
  [
    "original wildcard matching is case-sensitive and retains regex metacharacters",
    (f) =>
      owned(f, async (s) => {
        assert.equal(
          s.service.matchDomain("*.owned.invalid", "one.owned.invalid"),
          true,
        );
        assert.equal(
          s.service.matchDomain("*.owned.invalid", "two.one.owned.invalid"),
          false,
        );
        assert.equal(
          s.service.matchDomain("*.owned.invalid", ".owned.invalid"),
          true,
        );
        assert.equal(
          s.service.matchDomain("OWNED.invalid", "owned.invalid"),
          false,
        );
        assert.equal(
          s.service.matchDomain("foo+.invalid", "fooo.invalid"),
          false,
        );
        assert.equal(
          s.service.matchDomain("foo+*.invalid", "fooo.invalid"),
          true,
        );
        assert.throws(
          () => s.service.matchDomain("(*.invalid", "owned.invalid"),
          SyntaxError,
        );
        assert.equal(s.service.isDomain(undefined, "owned.invalid"), false);
      }),
  ],
  [
    "current environment precedence and late-bound manager session",
    (f) =>
      owned(f, async (s) => {
        s.configuration.next({
          networkEnvironment: "configured",
          authentication: { attributes: { externalDomain: "owned.invalid" } },
        });
        s.session.next({ auth: { domain: "owned.invalid" } });
        s.env[s.api.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT] =
          "explicit";
        assert.equal(await s.service.getCurrent(), "explicit");
        delete s.env[s.api.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
        assert.equal(await s.service.getCurrent(), "configured");
        s.configuration.next({
          authentication: { attributes: { externalDomain: "owned.invalid" } },
        });
        assert.equal(await s.service.getCurrent(), "external");
        s.session.next(undefined);
        assert.equal(await s.service.getCurrent(), undefined);
      }),
  ],
  [
    "switch awaits synchronization, preserves pre-failure mutation and clears unknown domains",
    (f) =>
      owned(f, async (s) => {
        await s.service.switchBySession(undefined);
        assert.equal(s.syncs.length, 0);
        await s.service.switch("internal");
        assert.equal(
          s.syncs[0][s.api.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT],
          "internal",
        );
        await s.service.switchBySession({ auth: {} });
        assert.equal(
          s.env[s.api.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT],
          "",
        );
        s.service.productManager.sync = async () => {
          throw Error("owned sync failure");
        };
        await assert.rejects(
          s.service.switch("external"),
          /owned sync failure/,
        );
        assert.equal(
          s.env[s.api.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT],
          "external",
        );
      }),
  ],
  [
    "environment switch synchronizes the complete original Desktop product manager",
    (f) =>
      withOwnedDesktopProduct(createNativeDesktopProductManager, async (p) => {
        const api = f({ process: { env: p.env } }),
          service = Object.assign(new api.ProductEnvServiceImpl(), {
            productManager: p.manager,
          });
        const providers = createNativeDesktopEnvironmentProviders({
          process: { env: p.env },
          dirname: p.root,
          productManager: p.manager,
        });
        const internet = Object.assign(
          new providers.WorkbuddyInternetEnviromentProductProvider(),
          { fs, configBasePath: p.root, logger: p.logger },
        );
        for (const environment of ["internal", "external"])
          fs.writeFileSync(
            path.join(p.root, `product.${environment}.json`),
            JSON.stringify({
              endpoint: `https://${environment}.owned.invalid`,
              authentication: {
                attributes: { internalDomain: "must-not-replace" },
              },
            }),
          );
        fs.writeFileSync(
          path.join(p.root, "product.json"),
          JSON.stringify({
            endpoint: "https://default.owned.invalid",
            authentication: {
              attributes: {
                internalDomain: "inside.invalid",
                externalDomain: "outside.invalid",
              },
            },
          }),
        );
        const clientApi = createNativeDesktopClientProduct({
          process: { env: p.env },
          dirname: p.root,
        });
        const client = Object.assign(new clientApi.ClientProductProvider(), {
          fs,
          configBasePath: p.root,
          logger: p.logger,
        });
        p.manager.productProviderProvider.sort = async () => [internet, client];
        await p.manager.sync(true);
        assert.equal(p.manager.getEndpoint(), "https://default.owned.invalid");
        await service.switchBySession({ auth: { domain: "inside.invalid" } });
        assert.equal(
          p.env[api.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT],
          "internal",
        );
        assert.equal(p.manager.getEndpoint(), "https://internal.owned.invalid");
        await service.switchBySession({ auth: { domain: "outside.invalid" } });
        assert.equal(p.manager.getEndpoint(), "https://external.owned.invalid");
        assert.ok(p.published.length >= 3);
        assert.equal(
          p.manager.getCurrentConfiguration().authentication.attributes
            .internalDomain,
          "inside.invalid",
        );
      }),
  ],
];
