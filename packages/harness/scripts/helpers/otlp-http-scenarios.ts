import assert from "node:assert/strict";
import { createNativeOtlpHttp } from "../../src/runtime/native-otlp-http.js";
function fixture(factory: typeof createNativeOtlpHttp, env: any = {}) {
  const warnings: any[] = [],
    diag = {
      warn: (...a: any[]) => warnings.push(a),
      error: (...a: any[]) => warnings.push(a),
    };
  return {
    n: factory({
      process: { env },
      diag,
      modules: { 58583: { DiagAPI: { instance: () => diag } } },
    }) as any,
    warnings,
  };
}
const project = (v: any) => ({ ...v, headers: v.headers() });
export const OTLP_HTTP_CASES: {
  name: string;
  run(factory: typeof createNativeOtlpHttp): Promise<any>;
}[] = [
  {
    name: "HTTP defaults and explicit configuration retain original precedence",
    async run(factory) {
      const f = fixture(factory, {
          OTEL_EXPORTER_OTLP_ENDPOINT: "http://env.invalid/root",
          OTEL_EXPORTER_OTLP_TIMEOUT: "200",
          OTEL_EXPORTER_OTLP_COMPRESSION: "gzip",
          OTEL_EXPORTER_OTLP_HEADERS: "common=env,only=env",
        }),
        defaults = { required: "default", common: "default" };
      const a = project(
        f.n.convertLegacyHttpOptions(
          {
            url: "http://explicit.invalid/path",
            headers: { common: "user", num: 5, omit: undefined, nil: null },
            timeoutMillis: 400,
            concurrencyLimit: 2,
            compression: "none",
          },
          "TRACES",
          "v1/traces",
          defaults,
        ),
      );
      assert.equal(a.url, "http://explicit.invalid/path");
      assert.equal(a.timeoutMillis, 400);
      assert.equal(a.headers.common, "default");
      assert.equal(a.headers.num, "5");
      assert.equal(a.headers.nil, "null");
      assert.equal(a.headers.omit, undefined);
      assert.equal(a.headers.only, "env");
      assert.equal(f.warnings.length, 1);
      const b = project(
        fixture(factory).n.convertLegacyHttpOptions({}, "LOGS", "v1/logs", {}),
      );
      assert.equal(b.url, "http://localhost:4318/v1/logs");
      assert.equal(b.timeoutMillis, 10000);
      assert.equal(b.concurrencyLimit, 30);
      assert.deepEqual(b.agentOptions, { keepAlive: true });
      return { a, b, warnings: f.warnings };
    },
  },
  {
    name: "signal environment overrides general values and invalid values fall back",
    async run(factory) {
      const f = fixture(factory, {
          OTEL_EXPORTER_OTLP_ENDPOINT: " http://general.invalid/base ",
          OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: " http://specific.invalid ",
          OTEL_EXPORTER_OTLP_TIMEOUT: "20",
          OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: "bad",
          OTEL_EXPORTER_OTLP_COMPRESSION: "gzip",
          OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "bad",
          OTEL_EXPORTER_OTLP_HEADERS: "a=general,encoded=x%20y",
          OTEL_EXPORTER_OTLP_TRACES_HEADERS: "a=signal,empty=,semi=value;meta",
        }),
        a = project(
          f.n.convertLegacyHttpOptions({}, "TRACES", "v1/traces", {}),
        );
      assert.equal(a.url, "http://specific.invalid/");
      assert.equal(a.timeoutMillis, 20);
      assert.equal(a.compression, "gzip");
      assert.deepEqual(a.headers, {
        a: "signal",
        encoded: "x y",
        semi: "value",
      });
      assert.equal(f.warnings.length, 2);
      const b = project(
        f.n.convertLegacyHttpOptions({}, "LOGS", "v1/logs", {}),
      );
      assert.equal(b.url, "http://general.invalid/base/v1/logs");
      return { a, b, warnings: f.warnings };
    },
  },
  {
    name: "invalid explicit URL timeout and malformed percent encoding preserve failures",
    async run(factory) {
      const f = fixture(factory);
      assert.throws(
        () =>
          f.n.convertLegacyHttpOptions(
            { url: "not-url" },
            "TRACES",
            "v1/traces",
            {},
          ),
        /user-provided export URL/,
      );
      for (const timeoutMillis of [0, -1, NaN, Infinity])
        assert.throws(
          () =>
            f.n.convertLegacyHttpOptions(
              { timeoutMillis },
              "TRACES",
              "v1/traces",
              {},
            ),
          /timeoutMillis is invalid/,
        );
      const b = fixture(factory, {
          OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "bad",
          OTEL_EXPORTER_OTLP_ENDPOINT: "also-bad",
        }),
        out = project(
          b.n.convertLegacyHttpOptions({}, "TRACES", "v1/traces", {}),
        );
      assert.equal(out.url, "http://localhost:4318/v1/traces");
      assert.equal(b.warnings.length, 2);
      assert.throws(
        () =>
          fixture(factory, {
            OTEL_EXPORTER_OTLP_HEADERS: "a=%ZZ",
          }).n.convertLegacyHttpOptions({}, "TRACES", "v1/traces", {}),
        URIError,
      );
      return { out, warnings: b.warnings };
    },
  },
  {
    name: "dynamic header merging retains prior keys and defaults override later inputs",
    async run(factory) {
      const f = fixture(factory);
      let user: any = { a: 1, stale: "kept" },
        env: any = { a: "env", e: "env" },
        defaults: any = { a: "default" };
      const headers = f.n.mergeHeaders(
          () => user,
          () => env,
          () => defaults,
        ),
        first = { ...headers() };
      user = { b: 2 };
      env = {};
      defaults.a = "changed";
      const second = { ...headers() };
      assert.deepEqual(first, { a: "default", e: "env", stale: "kept" });
      assert.deepEqual(second, { a: "default", e: "env", stale: "kept", b: 2 });
      return { first, second };
    },
  },
  {
    name: "legacy keepAlive mutates caller agent options and baggage helper is immutable",
    async run(factory) {
      const f = fixture(factory),
        a: any = {
          keepAlive: false,
          httpAgentOptions: { maxSockets: 3 },
          metadata: { owned: "test" },
        },
        out = project(
          f.n.convertLegacyHttpOptions(a, "METRICS", "v1/metrics", {}),
        );
      assert.equal(a.httpAgentOptions.keepAlive, false);
      assert.equal(out.agentOptions, a.httpAgentOptions);
      const b = { keepAlive: true, httpAgentOptions: { keepAlive: false } };
      f.n.convertLegacyAgentOptions(b);
      assert.equal(b.httpAgentOptions.keepAlive, false);
      const helpers = f.n.getModule(44874),
        api = f.n.getModule(20662),
        original = api.createBaggage({ a: { value: "one" } }),
        next = original.setEntry("b", {
          value: "two",
          metadata: api.baggageEntryMetadataFromString("owned"),
        });
      assert.equal(original.getEntry("b"), undefined);
      assert.deepEqual(helpers.getKeyPairs(next), ["a=one", "b=two;owned"]);
      assert.deepEqual(
        helpers.parseKeyPairsIntoRecord("a=1,a=2,b=,invalid,c=a%3Db"),
        { a: "2", c: "a=b" },
      );
      return { out, warnings: f.warnings };
    },
  },
];
