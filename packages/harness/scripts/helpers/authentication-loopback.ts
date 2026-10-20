import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import { authenticationFixture } from "./authentication-fixture.js";
import {
  acpProtocolFixture,
  protocolFactories,
} from "./acp-protocol-fixture.js";

/** Real transport and original login/provider/storage decisions; the remote protocol is owned, not product authentication. */
export async function authenticationLoopback(
  factory = createNativeAuthenticationRuntime,
) {
  const f = authenticationFixture(factory),
    capability = randomUUID(),
    requests: any[] = [];
  let origin = "";
  const server = createServer(async (request, response) => {
    if (request.headers["x-owned-capability"] !== capability) {
      response.writeHead(403);
      response.end();
      return;
    }
    const path = new URL(request.url!, origin).pathname;
    requests.push({
      method: request.method,
      path,
      authorization: request.headers.authorization,
    });
    let data: any;
    switch (path) {
      case "/v2/owned/auth/state":
        data = { state: "owned-state", authUrl: origin + "/owned-login" };
        break;
      case "/v2/owned/auth/token":
        data = {
          accessToken: "owned-issued-token",
          refreshToken: "owned-issued-refresh",
          expiresIn: 7200,
          refreshExpiresIn: 86400,
        };
        break;
      case "/v2/owned/login/account":
        data = {
          uid: "owned-auth-user",
          type: "personal",
          nickname: "Owned auth user",
          pluginEnabled: true,
        };
        break;
      case "/v2/owned/accounts":
        data = {
          accounts: [
            {
              uid: "owned-auth-user",
              type: "personal",
              nickname: "Owned account details",
              avatar_url: " owned.png ",
              pluginEnabled: true,
            },
            { uid: "owned-disabled", type: "ultimate", pluginEnabled: false },
          ],
        };
        break;
      case "/v2/owned/auth/token/refresh":
        data = {
          accessToken: "owned-refreshed-token",
          refreshToken: "owned-issued-refresh",
          expiresIn: 3600,
        };
        break;
      default:
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ data }));
  });
  try {
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    origin = "http://127.0.0.1:" + address.port;
    f.product.configuration.next({
      platform: "workbuddy",
      authentication: {
        type: "external-link",
        endpoint: origin,
        attributes: { platform: "workbuddy", prefixPath: "/owned" },
      },
    });
    const p = f.external();
    async function send(
      method: string,
      target: string,
      body: any,
      options: any = {},
    ) {
      const url = new URL(target, origin);
      if (url.origin !== origin) throw Error("Owned auth origin only");
      const response = await fetch(url, {
        method,
        headers: {
          ...options.headers,
          "x-owned-capability": capability,
          "content-type": "application/json",
        },
        signal: options.signal,
        ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
      });
      assert.equal(response.status, 200);
      return { data: await response.json() };
    }
    p.restOperations = {
      post: (url: string, body: any, options: any) =>
        send("POST", url, body, options),
      get: (url: string, options: any) => send("GET", url, undefined, options),
    };
    f.providers.splice(0, f.providers.length, p);
    await f.manager.doInit();
    await f.manager.initialized;
    assert.equal(f.manager.currentSessionSubject.value, undefined);
    let finished = false;
    const login = f.manager.login().finally(() => {
      finished = true;
    });
    for (let i = 0; i < 200 && !finished; i++) {
      await delay(2);
      await f.tick(1000);
    }
    assert.equal(finished, true, "owned protocol login must settle");
    assert.equal(await login, true);
    await f.settle();
    const session = f.manager.currentSessionSubject.value;
    assert.equal(session.account.uid, "owned-auth-user");
    assert.equal(session.account.nickname, "Owned account details");
    assert.equal(session.account.avatarUrl, "owned.png");
    assert.equal(session.allAccounts.length, 2);
    assert.equal(session.accounts.length, 1);
    assert.equal(session.auth.accessToken, "owned-issued-token");
    assert.equal(f.manager.committedLoginRevision, 1);
    assert.equal((await f.storage.restore()).account.uid, "owned-auth-user");
    await f.settle();
    f.setNow(f.now() + 31000);
    await f.manager.refreshSession();
    await f.settle();
    assert.equal(
      f.manager.currentSessionSubject.value.auth.accessToken,
      "owned-refreshed-token",
    );
    await f.manager.logout();
    await f.settle();
    assert.equal(f.manager.currentSessionSubject.value, undefined);
    assert.equal(f.manager.loggedOut, true);
    assert.deepEqual(
      requests.map((row) => row.path),
      [
        "/v2/owned/auth/state",
        "/v2/owned/auth/token",
        "/v2/owned/login/account",
        "/v2/owned/accounts",
        "/v2/owned/auth/token/refresh",
        "/v2/owned/accounts",
      ],
    );
    return {
      paths: requests.map((row) => row.path),
      methods: requests.map((row) => row.method),
      authorization: requests.map((row) => row.authorization ?? null),
      uid: session.account.uid,
      accounts: session.accounts.length,
      allAccounts: session.allAccounts.length,
      committed: f.manager.committedLoginRevision,
      anonymousAfterLogout: true,
      productionAccountUsed: false,
    };
  } finally {
    f.manager.cancelLogin();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await f.tick(1000);
    await f.close();
  }
}

/** Complete authentication manager and original default storage, not a prefilled auth Subject. */
export async function authenticationAcpGate(
  factory = createNativeAuthenticationRuntime,
  protocol = protocolFactories,
) {
  const f = authenticationFixture(factory),
    p = acpProtocolFixture(protocol, { modules: { 86482: f.A } });
  try {
    p.setDependency(f.A.AuthenticationManager, f.manager);
    let network = 0;
    p.modules[67062].RestOperationsFactory = Symbol("owned denied REST");
    p.setDependency(p.modules[67062].RestOperationsFactory, {
      create() {
        network++;
        throw Error("Must refuse before REST");
      },
    });
    let finished = false;
    const pending = p.agent
      .newSession({ cwd: "/owned", mcpServers: [] })
      .finally(() => {
        finished = true;
      });
    const rejection = assert.rejects(
      pending,
      (error: any) => error.code === -32000,
    );
    await f.settle();
    assert.equal(finished, false);
    assert.equal(network, 0);
    await f.manager.doInit();
    await rejection;
    assert.equal(f.manager.currentSessionSubject.value, undefined);
    assert.equal(network, 0);
    assert.equal(p.agent.sessionDeferred, undefined);
    return {
      anonymous: true,
      waitedForOriginalInitialized: true,
      refusedBeforeREST: network === 0,
    };
  } finally {
    p.close();
    await f.close();
  }
}
