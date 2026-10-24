import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
type Factory = (runtime?: any) => any;
const logger = { setContext() {} };
export const workbuddyAuthBindingsScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "application userinfo reads current identity, preserves enterprise fields and clears after logout",
    async (f) => {
      const api = f();
      const provider = new api.WorkbuddyUserinfoProvider();
      let session: any;
      provider.authenticationManager = {
        currentSessionSubject: { getValue: () => session },
      };
      const empty = {
        userId: "",
        userName: "",
        userNickname: "",
        enterpriseId: undefined,
        token: "",
        enterprise: undefined,
      };
      assert.deepEqual(await provider.provide(), empty);
      session = {
        account: {
          uid: "owned",
          nickname: "测试 User",
          enterpriseId: "enterprise-1",
          departmentFullName: "Engineering/Agent",
        },
        auth: { accessToken: "owned-token" },
      };
      assert.deepEqual(await provider.provide(), {
        userId: "owned",
        userName: "测试 User",
        userNickname: "测试 User",
        enterpriseId: "enterprise-1",
        token: "owned-token",
        enterprise: "Engineering/Agent",
      });
      session = { account: {}, auth: {} };
      assert.deepEqual(await provider.provide(), empty);
      session = undefined;
      assert.deepEqual(await provider.provide(), empty);
    },
  ],

  [
    "bootstrap type precedence, custom-token exclusion and real spilled configuration",
    async (f) => {
      const root = fs.mkdtempSync(
          path.join(os.tmpdir(), "axon-bootstrap-auth-"),
        ),
        env: any = {},
        api = f({ process: { env } }),
        storage = new api.WorkbuddyBootstrapAuthenticationStorage();
      try {
        assert.equal(await storage.priority(), 0);
        env.ACC_PRODUCT_CONFIG_V2 = JSON.stringify({
          authentication: { type: "external-link" },
        });
        assert.equal(await storage.priority(), 11);
        env.ACC_PRODUCT_CONFIG_V3 = JSON.stringify({
          authentication: { type: api.AuthenticationType.CUSTOM_TOKEN },
        });
        assert.equal(await storage.priority(), 0);
        env.ACC_PRODUCT_CONFIG_V3 = "{bad";
        assert.equal(await storage.priority(), 11);
        delete env.ACC_PRODUCT_CONFIG_V3;
        delete env.ACC_PRODUCT_CONFIG_V2;
        env.ACC_PRODUCT_CONFIG_PATH = path.join(root, "product.json");
        fs.writeFileSync(
          env.ACC_PRODUCT_CONFIG_PATH,
          JSON.stringify({ authentication: { type: "external-link" } }),
        );
        assert.equal(await storage.priority(), 11);
        env.ACC_PRODUCT_CONFIG_V3 = JSON.stringify({
          authentication: { type: api.AuthenticationType.CUSTOM_TOKEN },
        });
        assert.equal(await storage.priority(), 0);
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    },
  ],
  [
    "bootstrap storage forwards original subject, session and logout ownership options",
    async (f) => {
      const api = f(),
        storage = new api.WorkbuddyBootstrapAuthenticationStorage(),
        subject = {},
        session = {},
        options = { logoutToken: "owned" },
        calls: any[] = [];
      storage.fileAuthenticationStorage = {
        storeSessionSubject: subject,
        store: async (...v: any[]) => {
          calls.push(v);
        },
        restore: async () => session,
        beginLogout: async () => "owned",
        clean: async (o: any) => {
          calls.push(o);
          return false;
        },
      };
      assert.equal(storage.storeSessionSubject, subject);
      await storage.store(session, options);
      assert.equal(calls[0][0], session);
      assert.equal(calls[0][1], options);
      assert.equal(await storage.restore(), session);
      assert.equal(await storage.beginLogout(), "owned");
      assert.equal(await storage.clean(options), false);
      assert.equal(calls[1], options);
    },
  ],
  [
    "application manager awaits replaceable session synchronizer and preserves rejection",
    async (f) => {
      const api = f(),
        manager = new api.WorkbuddyAuthenticationManager();
      assert.ok(
        manager instanceof api.authenticationApi.AuthenticationManagerImpl,
      );
      let release!: () => void,
        called = 0;
      api.setWorkbuddyAuthSessionSyncer(async () => {
        called++;
        await new Promise<void>((r) => {
          release = r;
        });
      });
      await manager.syncProductAfterSessionChange(undefined);
      assert.equal(called, 0);
      let done = false;
      const pending = manager
        .syncProductAfterSessionChange({ account: { uid: "owned" } })
        .then(() => {
          done = true;
        });
      await Promise.resolve();
      assert.equal(done, false);
      release();
      await pending;
      api.setWorkbuddyAuthSessionSyncer(async () => {
        throw Error("owned-sync");
      });
      await assert.rejects(
        manager.syncProductAfterSessionChange({}),
        /owned-sync/,
      );
      manager.logger = { info() {} };
      manager.dispose();
    },
  ],
  [
    "application environment bootstrap preserves explicit env and resolves disk only when absent",
    async (f) => {
      const env: any = { CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT: "explicit" };
      let reads = 0;
      const api = f({
        process: { env },
        productConfig: {
          resolveWorkbuddyProductEnvironmentFromSessionFile: () => {
            reads++;
            return "internal";
          },
        },
      });
      const service = Object.assign(new api.WorkbuddyProductEnvService(), {
        logger,
      });
      service.init();
      assert.equal(reads, 0);
      assert.equal(service.lastSwitchedEnv, "explicit");
      delete env.CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT;
      service.init();
      assert.equal(reads, 1);
      assert.equal(env.CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT, "internal");
    },
  ],
  [
    "application environment switches without product sync and does not await snapshot publication",
    async (f) => {
      const env: any = {},
        product = {},
        session = { account: { uid: "owned" } },
        publications: any[] = [];
      let release!: () => void;
      const publication = new Promise<void>((r) => {
        release = r;
      });
      const coordinator = {
        resolveEnvironment: (s: any, p: any) => {
          assert.equal(s, session);
          assert.equal(p, product);
          return "external";
        },
        publishResolvedSnapshot: (...args: any[]) => {
          publications.push(args);
          return publication;
        },
        getResolvedSnapshot: () => ({ networkEnvironment: "fallback" }),
      };
      const api = f({
        process: { env },
        coordinator,
        authenticationManager: {
          currentSessionSubject: { getValue: () => session },
        },
      });
      const service = Object.assign(new api.WorkbuddyProductEnvService(), {
        logger,
        productManager: {
          configuration: { getValue: () => product },
          sync: () => {
            throw Error("must not sync product");
          },
        },
      });
      await service.switchBySession(session);
      assert.equal(env.CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT, "external");
      assert.equal(publications[0][2], "product-env-switch");
      assert.equal(await service.getCurrent(), "external");
      await service.switch(undefined);
      assert.equal("CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT" in env, false);
      assert.equal(await service.getCurrent(), "fallback");
      await service.switchBySession(undefined);
      assert.equal(publications[1][0], undefined);
      release();
      await publication;
    },
  ],
];
