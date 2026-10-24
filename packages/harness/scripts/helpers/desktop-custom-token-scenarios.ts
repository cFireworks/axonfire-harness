import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { BehaviorSubject } from "rxjs";
import { createNativeDesktopAuthentication } from "../../src/auth/native-desktop-authentication.js";
import { createNativeDesktopFileAuthentication } from "../../src/auth/native-desktop-file-authentication.js";
import { withOwnedDesktopAuthentication } from "./desktop-auth-scenarios.js";
type Factory = (runtime?: any) => any;
const jwt = (payload: any) =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "owned-unverified-signature",
  ].join(".");
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  const env: any = {},
    api = factory({
      process: { env },
      Date: class extends Date {
        static now() {
          return 1700000000000;
        }
      },
    });
  const config = new BehaviorSubject<any>(undefined),
    events: any[] = [],
    waits: any[] = [];
  const product = {
    configuration: config,
    waitConfiguration: async (force?: boolean) => {
      waits.push(force);
      return config.getValue();
    },
  };
  const logger = { debug() {}, warn() {} };
  const storage = Object.assign(
    new api.CustomTokenAuthenticationStorageImpl(),
    { productManager: product, logger },
  );
  const provider = Object.assign(new api.CustomTokenAuthenticationProvider(), {
    productManager: product,
    customTokenAuthenticationStorage: storage,
    logger,
  });
  const sub = storage.storeSessionSubject.subscribe((s: any) => events.push(s));
  const set = (token: any = "opaque", extra: any = {}) =>
    config.next({
      authentication: {
        type: api.AuthenticationType.CUSTOM_TOKEN,
        attributes: { token, ...extra },
      },
    });
  try {
    await run({
      api,
      env,
      config,
      events,
      waits,
      product,
      storage,
      provider,
      set,
    });
  } finally {
    sub.unsubscribe();
    config.complete();
    storage.storeSessionSubject.complete();
  }
}
export const desktopCustomTokenScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "inline configuration precedence, V1 exclusion and product recheck",
    (factory) =>
      owned(factory, async (s) => {
        const { api, env, storage, config, set, product, waits } = s;
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Disabled,
        );
        env.ACC_PRODUCT_CONFIG = JSON.stringify({
          authentication: {
            type: api.AuthenticationType.CUSTOM_TOKEN,
            attributes: { token: "v1" },
          },
        });
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Disabled,
        );
        env.ACC_PRODUCT_CONFIG_V2 = JSON.stringify({
          authentication: {
            type: api.AuthenticationType.CUSTOM_TOKEN,
            attributes: { token: "v2" },
          },
        });
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Heigh,
        );
        env.ACC_PRODUCT_CONFIG_V3 = JSON.stringify({
          authentication: { type: "other" },
        });
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Disabled,
        );
        env.ACC_PRODUCT_CONFIG_V3 = "{broken";
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Heigh,
        );
        config.next({ authentication: { type: "other" } });
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Disabled,
        );
        product.waitConfiguration = async (force: any) => {
          waits.push(force);
          return {
            authentication: {
              type: api.AuthenticationType.CUSTOM_TOKEN,
              attributes: { token: "late" },
            },
          };
        };
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Heigh,
        );
        assert.equal(waits.at(-1), true);
        set();
        assert.equal(
          await storage.priority(),
          api.AuthenticationStoragePriority.Heigh,
        );
      }),
  ],
  [
    "real spilled config read, malformed input and missing files",
    (factory) =>
      owned(factory, async (s) => {
        const root = await fs.mkdtemp(
          path.join(os.tmpdir(), "axon-custom-token-"),
        );
        try {
          s.env.ACC_PRODUCT_CONFIG_PATH = path.join(root, "product.json");
          assert.equal(
            await s.storage.hasSpilledAccProductConfigCustomToken(),
            false,
          );
          await fs.writeFile(s.env.ACC_PRODUCT_CONFIG_PATH, "{bad");
          assert.equal(
            await s.storage.hasSpilledAccProductConfigCustomToken(),
            false,
          );
          s.set("spilled");
          await fs.writeFile(
            s.env.ACC_PRODUCT_CONFIG_PATH,
            JSON.stringify(s.config.getValue()),
          );
          assert.equal(
            await s.storage.hasSpilledAccProductConfigCustomToken(),
            true,
          );
          assert.equal(
            await s.storage.priority(),
            s.api.AuthenticationStoragePriority.Heigh,
          );
        } finally {
          await fs.rm(root, { recursive: true, force: true });
        }
      }),
  ],
  [
    "JWT metadata decoding, enterprise override and opaque token fallback",
    (factory) =>
      owned(factory, async (s) => {
        s.set(
          jwt({
            sub: "user",
            nickname: "Nick",
            iss: "https://auth.owned.invalid/sso-team",
            exp: 1,
          }),
        );
        const session = await s.storage.restore();
        assert.equal(session.account.uid, "user");
        assert.equal(session.account.nickname, "Nick");
        assert.equal(session.account.enterpriseId, "team");
        assert.equal(session.account.type, s.api.Edition.Ultimate);
        assert.equal(session.auth.domain, "auth.owned.invalid");
        assert.equal(session.auth.expiresAt, s.api.LONG_TIME_AGO);
        assert.equal(s.events.at(-1), session);
        s.set(
          jwt({
            sub: "user",
            preferred_username: "Preferred",
            iss: "https://auth.owned.invalid/sso-team",
          }),
          { enterpriseId: "override" },
        );
        assert.equal(
          (await s.storage.restore()).account.enterpriseId,
          "override",
        );
        s.env.ACC_USER_ID = "environment-user";
        s.env.ACC_USER_NICKNAME = "Environment";
        s.set("not-a-jwt");
        assert.deepEqual((await s.storage.restore()).account, {
          uid: "environment-user",
          nickname: "Environment",
          enterpriseId: undefined,
          type: s.api.Edition.Personal,
          lastLogin: true,
        });
        delete s.env.ACC_USER_ID;
        delete s.env.ACC_USER_NICKNAME;
        assert.equal((await s.storage.restore()).account.uid, "anonymous");
        assert.equal(s.storage.extractDomain("invalid"), undefined);
      }),
  ],
  [
    "provider support, missing token failure, in-place refresh and no-op persistence",
    (factory) =>
      owned(factory, async (s) => {
        s.set("owned");
        assert.equal(await s.provider.support(), true);
        assert.deepEqual(await s.provider.getAuthenticationType(), [
          s.api.AuthenticationType.CUSTOM_TOKEN,
        ]);
        const session = await s.provider.createSession({});
        assert.equal(await s.provider.refreshSession(session, {}), session);
        assert.equal(session.auth.lastRefreshTime, 1700000000000);
        assert.equal(
          await s.provider.switchAccount({ uid: "different" }, session, {}),
          session,
        );
        const count = s.events.length;
        await s.provider.removeSession(session);
        await s.storage.store(session);
        await s.storage.clean();
        assert.equal(s.events.length, count);
        s.set("");
        await assert.rejects(
          s.provider.createSession({}),
          /authentication token is undefined/,
        );
        s.config.next({ authentication: { type: "other" } });
        assert.equal(await s.provider.support(), false);
      }),
  ],
  [
    "complete manager chooses custom storage over real file storage and uses original provider",
    (factory) =>
      owned(factory, async (s) => {
        const root = await fs.mkdtemp(
          path.join(os.tmpdir(), "axon-custom-manager-"),
        );
        const fileApi = createNativeDesktopFileAuthentication();
        let file: any;
        try {
          await withOwnedDesktopAuthentication(
            createNativeDesktopAuthentication,
            async (f) => {
              s.env.CODEBUDDY_AUTH_TOKEN = "presence-only";
              s.set(jwt({ sub: "custom-user" }));
              f.product.configuration.next(s.config.getValue());
              s.storage.productManager = f.product;
              s.provider.productManager = f.product;
              file = Object.assign(new fileApi.FileAuthenticationStorage(), {
                logger: f.logger,
                filePathService: { sharedDataPath: root },
                productManager: f.product,
              });
              await file.store(f.session("disk-user"));
              f.manager.authenticationStorages = [file, s.storage];
              f.manager.authenticationProvider = { get: () => [s.provider] };
              assert.equal(
                await f.manager.getAuthenticationStorage(),
                s.storage,
              );
              await f.manager.doInit();
              await f.manager.initialized;
              assert.equal(
                f.manager.currentSessionSubject.getValue().account.uid,
                "custom-user",
              );
              assert.equal(
                f.manager.buildAuthHeaders(true, true, true)["Authorization"],
                "Bearer " + s.config.getValue().authentication.attributes.token,
              );
              await f.manager.logout();
              assert.equal(
                f.manager.currentSessionSubject.getValue(),
                undefined,
              );
              assert.equal((await file.restore()).account.uid, "disk-user");
              await f.manager.login({});
              assert.equal(
                f.manager.currentSessionSubject.getValue().account.uid,
                "custom-user",
              );
            },
          );
        } finally {
          await file?.dispose();
          await fs.rm(root, { recursive: true, force: true });
        }
      }),
  ],
];
