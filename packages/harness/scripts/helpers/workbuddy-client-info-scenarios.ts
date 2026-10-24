import assert from "node:assert/strict";
import { BehaviorSubject } from "rxjs";
type Factory = (runtime?: any) => any;
function fixture(factory: Factory, extra: any = {}) {
  const scoped = Object.create(process);
  scoped.env = {
    CLIENT_INFO_MACHINE_ID: "owned-machine",
    WORKBUDDY_APP_VERSION: "5.3.14",
    ...extra.env,
  };
  Object.defineProperty(scoped, "platform", {
    value: extra.platform ?? "darwin",
  });
  const files: any = {
    "product.json": JSON.stringify({
      productName: "Bundled name",
      win32RegValueName: "OwnedRegistry",
    }),
    "cli/package.json": JSON.stringify({
      version: "0.0.0",
      publishConfig: { customPackage: { version: "1.2.3" } },
    }),
  };
  const api = factory({
    process: scoped,
    fs: {
      readFileSync: (p: string) => {
        if (!(p in files)) throw Error("missing");
        return files[p];
      },
    },
    crypto: { randomUUID: () => "owned-session" },
    ...extra.runtime,
  });
  api.setWorkbuddyClientInfoAssetResolver((...parts: string[]) =>
    parts.join("/"),
  );
  const configuration = new BehaviorSubject<any>({
    applicationName: "OwnedApp",
    productName: "Product name",
    productVersion: "product-version",
  });
  const provider = new api.WorkbuddyClientInfoProvider();
  const types: string[] = [];
  Object.assign(provider, {
    productManager: {
      configuration,
      getCurrentConfiguration: () => configuration.getValue(),
    },
    filePathService: { setIDEType: (v: string) => types.push(v) },
  });
  return {
    api,
    provider,
    configuration,
    files,
    types,
    env: scoped.env,
    close() {
      configuration.complete();
      provider.clientInfo$.complete();
    },
  };
}
export const workbuddyClientInfoScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "application identity, original asset precedence and cached get",
    async (f) => {
      const s = fixture(f);
      try {
        s.provider.initialize();
        const a = await s.provider.get();
        assert.equal(a.machineId, "owned-machine");
        assert.equal(a.sessionId, "owned-session");
        assert.equal(a.productName, "Bundled name");
        assert.equal(a.pluginVersion, "5.3.14");
        assert.equal(a.productVersion, "product-version");
        assert.equal(a.userAgentExtension, "CLI/1.2.3");
        assert.equal(a.ideType, "OwnedApp");
        assert.equal(await s.provider.get(), a);
        s.configuration.next({ applicationName: "Changed" });
        const b = await s.provider.get();
        assert.notEqual(a, b);
        assert.equal(b.ideType, "Changed");
        assert.equal(b.sessionId, a.sessionId);
      } finally {
        s.close();
      }
    },
  ],
  [
    "environment overrides, IDE mapping and original bundled name override",
    async (f) => {
      const s = fixture(f, {
        env: {
          CLIENT_INFO_PLATFORM: "JetBrainsPyCharm",
          CLIENT_INFO_PLUGIN_VERSION: "env-version",
          CLIENT_INFO_PRODUCT_NAME: "Env name",
        },
      });
      try {
        const a = await s.provider.get();
        assert.equal(a.ideType, "JetBrains");
        assert.equal(a.pluginVersion, "env-version");
        assert.equal(a.productName, "Bundled name");
        s.env.ACC_IDE_TYPE = "explicit";
        assert.equal(s.provider.initClientInfo().ideType, "explicit");
        delete s.env.ACC_IDE_TYPE;
        s.env.ACC_USER_ID = "owned";
        assert.equal(
          s.provider.initClientInfo().ideType,
          "web-JetBrainsPyCharm",
        );
      } finally {
        s.close();
      }
    },
  ],
  [
    "malformed/missing assets preserve product fallbacks and CLI version rules",
    async (f) => {
      const s = fixture(f);
      try {
        s.files["product.json"] = "{";
        s.files["cli/package.json"] = "{";
        assert.equal(s.provider.resolveProductName("fallback"), "fallback");
        assert.equal(s.provider.resolveBundledCliUserAgent(), undefined);
        assert.equal(s.provider.resolveWin32RegValueName(), "OwnedApp");
        s.configuration.next({});
        assert.equal(s.provider.resolveWin32RegValueName(), "WorkBuddy");
        s.files["cli/package.json"] = JSON.stringify({ version: "7.8.9" });
        assert.equal(s.provider.resolveBundledCliUserAgent(), "CLI/7.8.9");
        s.api.setWorkbuddyClientInfoAssetResolver(undefined);
        assert.equal(s.provider.resolveBundledCliUserAgent(), undefined);
      } finally {
        s.close();
      }
    },
  ],
  [
    "Windows registry fallback and one-time background publication",
    async (f) => {
      const calls: any[] = [];
      const s = fixture(f, {
        platform: "win32",
        runtime: {
          childProcess: {
            execFile: Object.assign(() => {}, {
              [Symbol.for("nodejs.util.promisify.custom")]: async (
                exe: any,
                args: any,
                options: any,
              ) => {
                calls.push([exe, args, options]);
                return {
                  stdout: args[1].startsWith("HKLM")
                    ? "DownloadChannel    REG_SZ    owned-channel\r\n"
                    : "",
                  stderr: "",
                };
              },
            }),
          },
        },
      });
      try {
        s.provider.initialize();
        for (
          let i = 0;
          i < 20 && !s.env.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL;
          i++
        )
          await new Promise((r) => setImmediate(r));
        assert.equal(
          s.env.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL,
          "owned-channel",
        );
        assert.equal((await s.provider.get()).downloadChannel, "owned-channel");
        assert.equal(calls.length, 2);
        assert.equal(calls[0][0], "reg");
        assert.equal(calls[0][2].timeout, 3000);
        s.provider.initClientInfo();
        assert.equal(calls.length, 2);
      } finally {
        s.close();
      }
    },
  ],
  [
    "inherited download channel suppresses registry probing",
    async (f) => {
      let calls = 0;
      const s = fixture(f, {
        platform: "win32",
        env: { CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL: "inherited" },
        runtime: {
          childProcess: {
            execFile: () => {
              calls++;
            },
          },
        },
      });
      try {
        s.provider.initialize();
        assert.equal((await s.provider.get()).downloadChannel, "inherited");
        assert.equal(calls, 0);
      } finally {
        s.close();
      }
    },
  ],
];
