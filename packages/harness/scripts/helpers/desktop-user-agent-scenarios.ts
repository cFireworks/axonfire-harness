import assert from "node:assert/strict";
export const desktopUserAgentScenarios: [
  string,
  (f: () => any) => Promise<void>,
][] = [
  [
    "original composition order and unknown versions",
    async (f) => {
      const a = f(),
        p = new a.UserAgentHttpInterceptor();
      p.clientInfoProvider = {
        get: async () => ({
          platform: "Owned",
          productName: "Product",
          userAgentExtension: "CLI/1",
        }),
      };
      assert.equal(
        await p.buildUserAgent("Extra/2"),
        "Owned/unknown Product/unknown Extra/2 CLI/1",
      );
      assert.equal(
        await p.buildUserAgent(),
        "Owned/unknown Product/unknown CLI/1",
      );
    },
  ],
  [
    "missing identity retains additional value and empty output",
    async (f) => {
      const p = new (f().UserAgentHttpInterceptor)();
      p.clientInfoProvider = { get: async () => undefined };
      assert.equal(await p.buildUserAgent("extra"), "extra");
      assert.equal(await p.buildUserAgent(), "");
    },
  ],
  [
    "request mutation, skip header removal and provider failure propagation",
    async (f) => {
      const a = f(),
        p = new a.UserAgentHttpInterceptor();
      let handler: any,
        calls = 0;
      p.restOperations = {
        interceptors: {
          request: {
            use: (h: any) => {
              handler = h;
            },
          },
        },
      };
      p.clientInfoProvider = {
        get: async () => {
          calls++;
          return { platform: "Owned", platformVersion: "2" };
        },
      };
      p.initialize();
      const config: any = { headers: { "User-Agent": "existing" } };
      assert.equal(await handler(config), config);
      assert.equal(config.headers["User-Agent"], "Owned/2 existing");
      assert.deepEqual(await handler({}), {
        headers: { "User-Agent": "Owned/2" },
      });
      const skip = {
        headers: { "X-Skip-User-Agent-Merge": true, "User-Agent": "exact" },
      };
      assert.equal(await handler(skip), skip);
      assert.deepEqual(skip.headers, { "User-Agent": "exact" });
      assert.equal(calls, 2);
      p.clientInfoProvider.get = async () => {
        throw Error("owned failure");
      };
      await assert.rejects(handler({}), /owned failure/);
    },
  ],
];
