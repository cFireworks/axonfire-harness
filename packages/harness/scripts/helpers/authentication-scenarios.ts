import assert from "node:assert/strict";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import { authenticationFixture } from "./authentication-fixture.js";
type Fixture = ReturnType<typeof authenticationFixture>;
const scenario = (name: string, operation: (f: Fixture) => any) => ({
  name,
  async run(factory = createNativeAuthenticationRuntime) {
    const f = authenticationFixture(factory);
    try {
      return await operation(f);
    } finally {
      await f.close();
    }
  },
});

export const AUTHENTICATION_CASES = [
  scenario(
    "source custom token priority requires env/spilled signal, not product config alone",
    async (f) => {
      const c = f.custom();
      f.product.configuration.next({
        authentication: {
          type: "custom-token",
          attributes: { token: "owned-opaque" },
        },
      });
      assert.equal(await c.storage.priority(), 0);
      f.env.CODEBUDDY_AUTH_TOKEN = "owned-signal";
      assert.equal(await c.storage.priority(), 9);
      f.product.configuration.next({
        authentication: { type: "external-link", attributes: {} },
      });
      assert.equal(await c.storage.priority(), 0);
      f.product.configuration.next(undefined as any);
      assert.equal(await c.storage.priority(), 9);
      return true;
    },
  ),
  scenario(
    "source custom token restore uses merged product token, original epoch and no-op store/clean",
    async (f) => {
      f.env.CODEBUDDY_AUTH_TOKEN = "owned-signal";
      f.env.ACC_USER_ID = "owned-uid";
      f.env.ACC_USER_NICKNAME = "owned-name";
      const c = f.custom();
      assert.equal(await c.storage.restore(), undefined);
      f.product.configuration.next({
        authentication: {
          type: "custom-token",
          attributes: { token: "owned-product-token" },
        },
      });
      const seen: any[] = [];
      c.storage.storeSessionSubject.subscribe((s: any) =>
        seen.push(s.account.uid),
      );
      const value = await c.storage.restore();
      assert.equal(value.auth.accessToken, "owned-product-token");
      assert.equal(value.account.uid, "owned-uid");
      assert.equal(value.auth.expiresAt, 0x1d1a94a1fff);
      await c.storage.store(f.session("ignored"));
      await c.storage.clean();
      assert.equal((await c.storage.restore()).account.uid, "owned-uid");
      assert.deepEqual(seen, ["owned-uid", "owned-uid"]);
      return {
        uid: value.account.uid,
        type: value.account.type,
        epoch: value.auth.expiresAt,
        seen,
      };
    },
  ),
  scenario(
    "source custom JWT projection decodes without signature validation and enterprise attribute wins",
    async (f) => {
      f.runtime.modules[94959].decode = () => ({
        payload: {
          sub: "owned-jwt-user",
          preferred_username: "owned-jwt-name",
          iss: "https://owned.invalid/sso-jwt-enterprise",
        },
      });
      const c = f.custom();
      f.product.configuration.next({
        authentication: {
          type: "custom-token",
          attributes: {
            token: "owned-token",
            enterpriseId: "explicit-enterprise",
          },
        },
      });
      const value = await c.storage.restore();
      assert.equal(value.account.uid, "owned-jwt-user");
      assert.equal(value.account.enterpriseId, "explicit-enterprise");
      assert.equal(value.auth.domain, "owned.invalid");
      assert.equal(value.account.type, "ultimate");
      assert.equal(await c.provider.support(), true);
      assert.equal(
        (await c.provider.createSession()).account.uid,
        "owned-jwt-user",
      );
      assert.equal(await c.provider.switchAccount({}, value, {}), value);
      return {
        uid: value.account.uid,
        enterpriseId: value.account.enterpriseId,
        domain: value.auth.domain,
      };
    },
  ),
  scenario(
    "source custom spilled config uses only explicit injected require and catches malformed content",
    async (f) => {
      const owned = authenticationFixture(f.factory, {
        env: { ACC_PRODUCT_CONFIG_PATH: "/owned/spilled.json" },
        files: {
          "/owned/spilled.json": JSON.stringify({
            authentication: {
              type: "custom-token",
              attributes: { token: "owned" },
            },
          }),
        },
      });
      try {
        const c = owned.custom();
        assert.equal(
          await c.storage.hasSpilledAccProductConfigCustomToken(),
          true,
        );
        assert.equal(owned.calls[0][0], "spilled-read");
        return true;
      } finally {
        await owned.close();
      }
    },
  ),
  scenario(
    "source user info context publishes only id/nickname when current auth exists",
    async (f) => {
      const resolver = new f.C.UserInfoContextVariableResolver();
      resolver.authenticationManager = f.manager;
      assert.equal(await resolver.priority({}, {}), 0);
      assert.equal(await resolver.resolve({}, {}), undefined);
      f.manager.currentSessionSubject.next(f.session());
      assert.equal(await resolver.priority({}, {}), 5);
      const result = await resolver.resolve({}, {});
      assert.deepEqual(result, {
        name: "userInfo",
        value: { id: "owned-user", nickname: "Owned user" },
      });
      return result;
    },
  ),
  scenario(
    "source Wx provider executes injected IDE tmpcode then filters enabled account snapshot",
    async (f) => {
      const owned = authenticationFixture(f.factory, {
        wechatide: {
          workspace: {
            sendAuthRequest: async () => ({
              data: { tmpcode: "owned-tmpcode" },
            }),
          },
        },
      });
      try {
        owned.product.configuration.next({
          authentication: {
            type: "wechat",
            endpoint: "http://owned.invalid",
            attributes: {},
          },
        });
        const p = new owned.C.WxAuthenticationProvider(),
          requests: any[] = [];
        Object.assign(p, {
          productManager: owned.product,
          logger: owned.manager.logger,
          restOperations: {
            post: async (url: string) => {
              requests.push(url);
              return { data: { data: { accessToken: "owned-wx-token" } } };
            },
            get: async () => ({
              data: {
                data: {
                  accounts: [
                    { uid: "disabled", pluginEnabled: false },
                    {
                      uid: "owned-wx-user",
                      pluginEnabled: true,
                      avatar_url: " own.png ",
                    },
                  ],
                },
              },
            }),
          },
        });
        p.init();
        assert.equal(await p.support(), true);
        const result = await p.createSession({
          abortController: new AbortController(),
          traceSpan: owned.manager.traceService.startTrace("owned"),
        });
        assert.equal(result.account.uid, "owned-wx-user");
        assert.equal(result.account.avatarUrl, "own.png");
        assert.deepEqual(requests, [
          "/v2/auth/token/wxide?tmpCode=owned-tmpcode",
        ]);
        return { uid: result.account.uid, requests };
      } finally {
        await owned.close();
      }
    },
  ),
  scenario(
    "source authentication protocol retains error types, misspelled priority and marker suffix",
    async (f) => {
      assert.equal(f.A.AuthenticationStoragePriority.Heigh, 9);
      assert.equal(f.A.getLogoutMarkerPath("owned"), "owned.logged-out");
      const license = new f.A.SignLicenseError(12005, "owned limit");
      assert.equal(license.msg, "owned limit");
      assert.equal(
        f.native.getModule(7327).toSignLicenseError({
          response: { data: { code: 12005, msg: "owned limit" } },
        }).msg,
        "owned limit",
      );
      assert.equal(
        f.native
          .getModule(7327)
          .toSignLicenseError({ response: { data: { code: "12005" } } }),
        undefined,
      );
      return {
        priority: f.A.AuthenticationStoragePriority.Heigh,
        error: license.message,
      };
    },
  ),
  scenario(
    "source default storage emits on store/restore/clean and retains exact identity",
    async (f) => {
      const seen: any[] = [],
        s = f.session();
      f.storage.storeSessionSubject.subscribe((v: any) =>
        seen.push(v?.account.uid),
      );
      await f.storage.store(s);
      assert.equal(await f.storage.restore(), s);
      await f.storage.clean();
      assert.deepEqual(seen, ["owned-user", "owned-user", undefined]);
      return seen;
    },
  ),
  scenario(
    "source storage selection ignores failing/disabled priorities, caches only after await",
    async (f) => {
      const slow = f.deferred<number>();
      let calls = 0;
      const selected = {
        priority: async () => {
          calls++;
          return slow.promise;
        },
      };
      f.manager.authenticationStorages = [
        {
          priority: async () => {
            throw Error("priority failed");
          },
        },
        { priority: async () => -1 },
        selected,
        f.storage,
      ];
      const a = f.manager.getAuthenticationStorage(),
        b = f.manager.getAuthenticationStorage();
      slow.resolve(9);
      assert.equal(await a, selected);
      assert.equal(await b, selected);
      assert.equal(calls, 2);
      f.manager.authenticationStorages = [];
      assert.equal(await f.manager.getAuthenticationStorage(), selected);
      return calls;
    },
  ),
  scenario(
    "source storage/provider errors remain NotFound and forced provider ignores support",
    async (f) => {
      f.manager.authenticationStorages = [];
      await assert.rejects(
        f.manager.getAuthenticationStorage(),
        /No available Authentication Storage found/,
      );
      f.provider.support = async () => false;
      await assert.rejects(
        f.manager.getAuthenticationProvider(),
        /No available Authentication Provider found/,
      );
      await f.manager.setAuthenticationProvider("owned-provider");
      assert.equal(await f.manager.getAuthenticationProvider(), f.provider);
      await f.manager.clearAuthenticationProvider();
      await assert.rejects(
        f.manager.getAuthenticationProvider(),
        /No available/,
      );
      return true;
    },
  ),
  scenario(
    "source doInit restores anonymous state and resolves initialized without inventing login",
    async (f) => {
      await f.manager.doInit();
      await f.manager.initialized;
      assert.equal(f.manager.currentSessionSubject.value, undefined);
      assert.equal(f.manager.loggedOut, false);
      return f.manager.subscriptionManager.getStats();
    },
  ),
  scenario(
    "source init failure logs but does not reject or resolve initialized",
    async (f) => {
      f.storage.restore = async () => {
        throw Error("owned restore failed");
      };
      let done = false;
      void f.manager.initialized.then(() => {
        done = true;
      });
      assert.equal(f.manager.init(), undefined);
      await f.settle();
      assert.equal(done, false);
      assert.ok(
        f.logs.some(
          (row) => row[0] === "warn" && row[1].includes("Failed to initialize"),
        ),
      );
      return done;
    },
  ),
  scenario(
    "source restored account applies user root, environment, refresh short circuit and sync",
    async (f) => {
      const value = f.session();
      await f.storage.store(value);
      await f.manager.doInit();
      await f.settle();
      assert.equal(f.manager.currentSessionSubject.value, value);
      assert.ok(f.calls.some((c) => c[0] === "user-root"));
      assert.ok(f.calls.some((c) => c[0] === "switchBySession"));
      assert.ok(f.calls.some((c) => c[0] === "sync" && c[1] === true));
      return {
        uid: f.manager.currentSessionSubject.value.account.uid,
        revision: f.manager.storageSessionRevision,
        timerCount: f.timers.size,
      };
    },
  ),
  scenario(
    "source stored token equality suppresses duplicate object, anonymous updates are not suppressed",
    async (f) => {
      await f.manager.doInit();
      const s = f.session();
      await f.storage.store(s);
      await f.settle();
      const revision = f.manager.storageSessionRevision;
      await f.storage.store(structuredClone(s));
      await f.settle();
      assert.equal(f.manager.storageSessionRevision, revision);
      await f.storage.clean();
      await f.storage.clean();
      await f.settle();
      assert.equal(f.manager.storageSessionRevision, revision + 2);
      assert.equal(f.manager.loggedOut, true);
      return f.manager.storageSessionRevision;
    },
  ),
  scenario(
    "source login commits through persistence then publishes and reports success",
    async (f) => {
      await f.manager.doInit();
      assert.equal(await f.manager.login(), true);
      await f.settle();
      assert.equal(
        f.manager.currentSessionSubject.value.account.uid,
        "owned-user",
      );
      assert.equal(f.manager.committedLoginRevision, 1);
      assert.equal(f.manager.loginInFlight, false);
      assert.ok(f.calls.some((c) => c[0] === "notify" && c[1] === "info"));
      return {
        revision: f.manager.committedLoginRevision,
        uid: f.manager.currentSessionSubject.value.account.uid,
      };
    },
  ),
  scenario(
    "source login failure reports error and callback but cancellation suppresses notifier",
    async (f) => {
      let errors = 0;
      f.provider.createSession = async () => {
        throw Error("owned login failure");
      };
      assert.equal(
        await f.manager.login({ errorHandler: () => errors++ }),
        false,
      );
      assert.equal(errors, 1);
      const notices = f.calls.filter((c) => c[0] === "notify").length;
      f.provider.createSession = async () => {
        throw new f.A.CanceledError();
      };
      assert.equal(await f.manager.login(), false);
      assert.equal(f.calls.filter((c) => c[0] === "notify").length, notices);
      return errors;
    },
  ),
  scenario(
    "source concurrent login cancels old sign context and latest revision wins",
    async (f) => {
      const first = f.deferred(),
        second = f.deferred();
      let index = 0;
      f.provider.createSession = async () =>
        index++ === 0 ? first.promise : second.promise;
      const a = f.manager.login();
      await f.settle();
      const abort = f.manager.pendingSignContext.abortController.signal;
      const b = f.manager.login();
      await f.settle();
      assert.equal(abort.aborted, true);
      second.resolve(f.session("second"));
      assert.equal(await b, true);
      first.resolve(f.session("first"));
      assert.equal(await a, false);
      assert.equal(f.manager.currentSessionSubject.value.account.uid, "second");
      return f.manager.currentSessionSubject.value.account.uid;
    },
  ),
  scenario(
    "source logout invalidates pending login before provider returns",
    async (f) => {
      const d = f.deferred();
      f.provider.createSession = async () => d.promise;
      const pending = f.manager.login();
      await f.settle();
      await f.manager.logout();
      d.resolve(f.session());
      assert.equal(await pending, false);
      assert.equal(f.manager.currentSessionSubject.value, undefined);
      assert.equal(f.manager.loggedOut, true);
      return true;
    },
  ),
  scenario(
    "source serialized persistence survives failure and preserves before/after gates",
    async (f) => {
      const d = f.deferred(),
        seen: string[] = [];
      const first = f.manager.runSessionPersistence(async () => {
        seen.push("a");
        await d.promise;
        throw Error("owned failed write");
      });
      const rejection = assert.rejects(first, /owned failed write/);
      const next = f.manager.runSessionPersistence(async () => {
        seen.push("b");
        return 7;
      });
      await f.settle();
      assert.deepEqual(seen, ["a"]);
      d.resolve(undefined);
      await rejection;
      assert.equal(await next, 7);
      assert.equal(
        await f.manager.storeSession(
          f.session(),
          f.manager.traceService.startTrace("owned"),
          undefined,
          { beforeStore: () => false },
        ),
        false,
      );
      return seen;
    },
  ),
  scenario(
    "source logout begin marker, remove error and false clean preserve original subject",
    async (f) => {
      const s = f.session();
      f.manager.currentSessionSubject.next(s);
      const seen: any[] = [];
      f.storage.beginLogout = async () => {
        seen.push("begin");
        return "owned-marker";
      };
      f.provider.removeSession = async () => {
        seen.push("remove");
        throw Error("owned remove failure");
      };
      f.storage.clean = async (options: any) => {
        seen.push(["clean", options]);
        return false;
      };
      await f.manager.logout();
      assert.equal(f.manager.currentSessionSubject.value, s);
      assert.equal(f.manager.loggedOut, true);
      assert.deepEqual(seen, [
        "begin",
        "remove",
        ["clean", { logoutToken: "owned-marker" }],
      ]);
      return seen;
    },
  ),
  scenario(
    "source waitAuthSession resolves current identity and defers unsubscribe to zero timeout",
    async (f) => {
      const s = f.session();
      f.manager.currentSessionSubject.next(s);
      assert.equal(await f.manager.waitAuthSession(), s);
      assert.equal(f.timers.size, 1);
      await f.tick();
      assert.equal(f.timers.size, 0);
      return true;
    },
  ),
  scenario(
    "source buildAuthHeaders gates authorization, department and refresh independently",
    async (f) => {
      assert.deepEqual(f.manager.buildAuthHeaders(true, true, true), {});
      const s = f.session();
      Object.assign(s.account, {
        enterpriseId: "owned-enterprise",
        departmentFullName: "owned-department",
      });
      s.auth.domain = "owned.invalid";
      f.manager.currentSessionSubject.next(s);
      const full = f.manager.buildAuthHeaders(true, true, true),
        minimal = f.manager.buildAuthHeaders(false, false, false);
      assert.equal(full.Authorization, "Bearer owned-opaque-token");
      assert.equal(full["X-Refresh-Token"], "owned-refresh");
      assert.equal(minimal.Authorization, undefined);
      assert.equal(minimal["X-Tenant-Id"], "owned-enterprise");
      assert.equal(minimal["X-Department-Info"], undefined);
      return { full, minimal };
    },
  ),
  scenario(
    "source refresh throttles recent session but workbuddy missing allAccounts bypasses",
    async (f) => {
      const s = f.session();
      f.manager.currentSessionSubject.next(s);
      let calls = 0;
      f.provider.refreshSession = async () => {
        calls++;
        return s;
      };
      await f.manager.refreshSession();
      assert.equal(calls, 0);
      f.product.configuration.next({
        ...f.product.configuration.value,
        platform: " WorkBuddy ",
      });
      await f.manager.refreshSession();
      assert.equal(calls, 1);
      return calls;
    },
  ),
  scenario(
    "source refresh rejects mismatched uid and preserves old idp on accepted account",
    async (f) => {
      const s = f.session();
      s.auth.lastRefreshTime = 0;
      s.account.idp = "owned-idp";
      f.manager.currentSessionSubject.next(s);
      f.provider.refreshSession = async () => f.session("different");
      await f.manager.scheduleRefreshSession(true, 1);
      assert.equal(f.storage.session, undefined);
      const refreshed = f.session();
      f.provider.refreshSession = async () => refreshed;
      await f.manager.scheduleRefreshSession(true, 1);
      assert.equal(f.storage.session, refreshed);
      assert.equal(refreshed.account.idp, "owned-idp");
      return refreshed.account.idp;
    },
  ),
  scenario(
    "source refresh concurrent guard and logout prevent stale persistence",
    async (f) => {
      const s = f.session();
      s.auth.lastRefreshTime = 0;
      f.manager.currentSessionSubject.next(s);
      const d = f.deferred();
      let calls = 0;
      f.provider.refreshSession = async () => {
        calls++;
        return d.promise;
      };
      const pending = f.manager.scheduleRefreshSession(true, 1);
      await f.settle();
      await f.manager.scheduleRefreshSession(true, 1);
      assert.equal(calls, 1);
      await f.manager.logout();
      d.resolve(f.session());
      await pending;
      assert.equal(f.storage.session, undefined);
      return calls;
    },
  ),
  scenario(
    "source refresh minimum timer is cancellable on dispose with no extra refresh",
    async (f) => {
      const s = f.session();
      s.auth.lastRefreshTime = 0;
      f.manager.currentSessionSubject.next(s);
      let calls = 0;
      f.provider.refreshSession = async () => {
        calls++;
        return s;
      };
      const pending = f.manager.scheduleRefreshSession(false, 1);
      await f.settle();
      assert.equal(f.timers.size, 1);
      const entry: any = [...f.timers.values()][0];
      assert.equal(entry.at - f.now(), 15000);
      f.manager.dispose();
      await pending;
      assert.equal(calls, 0);
      assert.equal(f.timers.size, 0);
      return true;
    },
  ),
  scenario(
    "source Unauthorized refresh does not retry, ordinary failure uses original backoff",
    async (f) => {
      const s = f.session();
      s.auth.lastRefreshTime = 0;
      f.manager.currentSessionSubject.next(s);
      f.provider.refreshSession = async () => {
        throw new f.A.UnauthorizedError(Error("owned unauthorized"));
      };
      await f.manager.scheduleRefreshSession(true);
      assert.equal(f.timers.size, 0);
      let calls = 0;
      f.provider.refreshSession = async () => {
        calls++;
        return undefined;
      };
      const pending = f.manager.scheduleRefreshSession(true, 2);
      await f.settle();
      assert.equal(f.timers.size, 1);
      assert.equal([...f.timers.values()][0]!.at - f.now(), 40000);
      await f.tick(40000);
      await pending;
      await f.settle();
      assert.equal(calls, 2);
      return calls;
    },
  ),
  scenario(
    "source switchAccount rejects stale result when logout changes revision",
    async (f) => {
      const s = f.session();
      f.manager.currentSessionSubject.next(s);
      const d = f.deferred();
      f.provider.switchAccount = async () => d.promise;
      const pending = f.manager.switchAccount({
        type: "ultimate",
        enterpriseId: "owned",
      });
      await f.settle();
      assert.equal(f.manager.accountSwitchInFlight, true);
      await f.manager.logout();
      d.resolve(f.session());
      await pending;
      assert.equal(f.storage.session, undefined);
      assert.equal(f.manager.accountSwitchInFlight, false);
      return true;
    },
  ),
  scenario(
    "source account snapshot normalizes avatars and resolves only unambiguous identity",
    async (f) => {
      const a = f.native.accounts,
        current = {
          uid: "u",
          type: " PERSONAL ",
          avatarUrl: " old ",
          nickname: "old",
        };
      const snap = a.createAccountSnapshot([
        {
          uid: "u",
          type: "personal",
          nickname: "new",
          avatar_url: " new.png ",
          pluginEnabled: false,
        },
        { uid: "v", pluginEnabled: true },
      ]);
      assert.equal(snap.accounts.length, 1);
      const merged = a.mergeCurrentAccountDetails(current, snap.allAccounts);
      assert.equal(merged.nickname, "new");
      assert.equal(merged.type, " PERSONAL ");
      assert.equal(merged.avatarUrl, "new.png");
      const ambiguous = a.mergeCurrentAccountDetails(current, [
        snap.allAccounts[0],
        snap.allAccounts[0],
      ]);
      assert.equal(ambiguous.nickname, "old");
      return { merged, enabled: snap.accounts.length };
    },
  ),
  scenario(
    "source external support/environment, domain headers and expiry keep exact truthy rules",
    async (f) => {
      f.product.configuration.next({
        authentication: {
          type: "external-link",
          endpoint: "http://owned.invalid:8080/path",
          attributes: { prefixPath: "/owned" },
        },
      });
      const p = f.external();
      assert.equal(await p.support({ type: "internal" }), true);
      assert.equal(p.prefixPath, "/owned");
      assert.deepEqual(p.enterpriseHeaders(), {
        "X-Domain": "owned.invalid:8080",
      });
      const auth: any = { expiresIn: 2, refreshExpiresIn: 3, expiresAt: 0 };
      p.calculateExpiresAt(auth);
      assert.equal(auth.expiresAt, f.now() + 2000);
      assert.equal(auth.refreshExpiresAt, f.now() + 3000);
      return auth;
    },
  ),
  scenario(
    "source external launch schema whitelist, version/login session and browser false remain polling",
    async (f) => {
      f.env.launch_schema = "owned-schema";
      f.product.configuration.next({
        platform: "workbuddy",
        authentication: {
          attributes: { launchSchemaWhitelist: ["owned-schema"] },
        },
      });
      const p = f.external();
      const steps = f.native.getModule(7327);
      const revision = steps.setLoginStepCallback(
        () => {},
        undefined,
        "owned-login-id",
      );
      p.externalUriOpener.open = async (uri: string) => {
        f.calls.push(["open", uri]);
        return false;
      };
      await p.openAuthUrl({ authUrl: "http://owned.invalid/login" });
      const url = new URL(p.lastAuthUrl);
      assert.equal(url.searchParams.get("launch_schema"), "owned-schema");
      assert.equal(url.searchParams.get("version"), "owned-version");
      assert.equal(url.searchParams.get("loginSessionId"), "owned-login-id");
      assert.equal(p.lastBrowserOpenSuccess, false);
      steps.setLoginStepCallback(undefined, revision);
      return url.search;
    },
  ),
  scenario(
    "source external polling retries account status five times and token code without rewriting status field",
    async (f) => {
      const p = f.external();
      let requests = 0;
      p.restOperations.get = async () => {
        requests++;
        if (requests < 3) throw { code: 11217 };
        return { data: { data: { accessToken: "owned", expiresIn: 2 } } };
      };
      const context = {
        traceSpan: f.manager.traceService.startTrace("owned"),
        abortController: new AbortController(),
      };
      const pending = p.loopGetToken(
        { state: "owned-state" },
        f.now(),
        context,
      );
      for (let i = 0; i < 3; i++) await f.tick(1000);
      assert.equal((await pending).accessToken, "owned");
      assert.equal(requests, 3);
      requests = 0;
      p.restOperations.get = async () => {
        requests++;
        throw { response: { status: 401 } };
      };
      const account = p.loopGetAccount(
        { state: "owned-state" },
        { accessToken: "owned" },
        f.now(),
        context,
      );
      const rejected = assert.rejects(
        account,
        (e: any) => e.response.status === 401,
      );
      for (let i = 0; i < 6; i++) await f.tick(1000);
      await rejected;
      assert.equal(requests, 6);
      return requests;
    },
  ),
  scenario(
    "source external cancellation checks after wait before making request",
    async (f) => {
      const p = f.external();
      const abortController = new AbortController();
      abortController.abort();
      let requests = 0;
      p.restOperations.get = async () => requests++;
      const pending = p.loopGetToken({}, f.now(), {
        abortController,
        traceSpan: f.manager.traceService.startTrace("owned"),
      });
      const rejected = assert.rejects(
        pending,
        (e: any) => e instanceof f.A.CanceledError,
      );
      await f.tick(1000);
      await rejected;
      assert.equal(requests, 0);
      return requests;
    },
  ),
  scenario(
    "source HTTP interceptor owns header exclusions and endpoint-prefix logout whitelist quirks",
    async (f) => {
      const requests: any[] = [],
        responses: any[] = [];
      const s = f.session();
      s.account.enterpriseId = "owned-enterprise";
      f.manager.currentSessionSubject.next(s);
      f.runtime.modules[9151] = {
        getProductEndpointOverride: () => ({ resolve: () => undefined }),
      };
      // Reload only this scoped class so the explicit product endpoint resolver is captured before initialization.
      const n = f.factory({
        ...f.runtime,
        modules: { ...f.runtime.modules, 9151: f.runtime.modules[9151] },
      });
      const interceptor = new (n.getModule(
        34047,
      ).AuthenticationHttpInterceptor)();
      Object.assign(interceptor, {
        authenticationManager: f.manager,
        productManager: f.product,
        logger: f.manager.logger,
        notifier: f.manager.notifier,
        restOperations: {
          interceptors: {
            request: { use: (...args: any[]) => requests.push(args) },
            response: { use: (...args: any[]) => responses.push(args) },
          },
        },
      });
      interceptor.initialize();
      const request = requests[0][0];
      const config = request({
        headers: { [f.A.HTTP_HEADER_NO_AUTHORIZATION]: "true" },
      });
      assert.equal(config.headers.Authorization, undefined);
      assert.equal(config.headers["X-Tenant-Id"], "owned-enterprise");
      const skip = request({
        headers: { [f.A.HTTP_HEADER_SKIP_AUTH_INTERCEPTOR]: "true" },
      });
      assert.deepEqual(skip.headers, {});
      assert.equal(
        interceptor.isEndpointMatch(
          "http://owned.invalid",
          "http://owned.invalid.evil",
          "/owned",
        ),
        true,
      );
      let logout = 0;
      f.manager.logout = async () => {
        logout++;
      };
      interceptor.checkToLogout(
        "Bearer owned-opaque-token",
        "http://other.invalid",
        "/owned",
      );
      interceptor.checkToLogout(
        "Bearer owned-opaque-token",
        "http://owned.invalid",
        "/api/memory/search?x=1",
      );
      assert.equal(logout, 0);
      interceptor.checkToLogout(
        "Bearer owned-opaque-token",
        "http://owned.invalid",
        "/owned",
      );
      assert.equal(logout, 1);
      return {
        headers: config.headers,
        logout,
        callbacks: responses[0].length,
      };
    },
  ),
];
