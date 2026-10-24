import assert from "node:assert/strict";
import { createNativeOtelEnvironment } from "../../src/runtime/native-otel-environment.js";
export const OTEL_ENVIRONMENT_CASES: {
  name: string;
  run(factory: typeof createNativeOtelEnvironment): Promise<any>;
}[] = [
  {
    name: "captured environment defaults and enums are complete and supplied process is explicit",
    async run(factory) {
      assert.throws(() => factory({}), /Explicit/);
      const n: any = factory({ process: { env: {} } }),
        defaults = n.getEnv();
      assert.deepEqual(n.getEnvWithoutDefaults(), {});
      assert.equal(
        defaults.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE,
        "cumulative",
      );
      assert.equal(defaults.OTEL_EXPORTER_OTLP_PROTOCOL, "http/protobuf");
      assert.equal(defaults.OTEL_ATTRIBUTE_COUNT_LIMIT, 128);
      assert.equal(defaults.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT, Infinity);
      assert.equal(defaults.OTEL_TRACES_SAMPLER, "parentbased_always_on");
      assert.equal(n.DiagLogLevel.DEBUG, 70);
      return defaults;
    },
  },
  {
    name: "boolean number list log-level and string parsers retain original coercion rules",
    async run(factory) {
      const n: any = factory({
          process: {
            env: {
              OTEL_SDK_DISABLED: "TrUe",
              OTEL_ATTRIBUTE_COUNT_LIMIT: "-3",
              OTEL_EXPORTER_OTLP_TIMEOUT: "",
              OTEL_PROPAGATORS: "tracecontext, baggage,,",
              OTEL_LOG_LEVEL: "debug",
              OTEL_SERVICE_NAME: 42,
              IGNORED: "value",
            },
          },
        }),
        out = n.getEnvWithoutDefaults();
      assert.equal(out.OTEL_SDK_DISABLED, true);
      assert.equal(out.OTEL_ATTRIBUTE_COUNT_LIMIT, -3);
      assert.equal(out.OTEL_EXPORTER_OTLP_TIMEOUT, 0);
      assert.deepEqual(out.OTEL_PROPAGATORS, [
        "tracecontext",
        "baggage",
        "",
        "",
      ]);
      assert.equal(out.OTEL_LOG_LEVEL, 70);
      assert.equal(out.OTEL_SERVICE_NAME, "42");
      assert.equal(out.IGNORED, undefined);
      assert.equal(
        n.parseEnvironment({ OTEL_SDK_DISABLED: " true " }).OTEL_SDK_DISABLED,
        false,
      );
      return out;
    },
  },
  {
    name: "invalid numeric and log levels fall back while infinity and null follow original coercion",
    async run(factory) {
      const n: any = factory({
          process: {
            env: {
              OTEL_ATTRIBUTE_COUNT_LIMIT: "invalid",
              OTEL_LOG_LEVEL: " invalid ",
              OTEL_EXPORTER_OTLP_TIMEOUT: Infinity,
              OTEL_BSP_MAX_QUEUE_SIZE: null,
              OTEL_SERVICE_NAME: null,
            },
          },
        }),
        out = n.getEnvWithoutDefaults();
      assert.equal(out.OTEL_ATTRIBUTE_COUNT_LIMIT, undefined);
      assert.equal(out.OTEL_LOG_LEVEL, undefined);
      assert.equal(out.OTEL_EXPORTER_OTLP_TIMEOUT, Infinity);
      assert.equal(out.OTEL_BSP_MAX_QUEUE_SIZE, 0);
      assert.equal(out.OTEL_SERVICE_NAME, undefined);
      assert.equal(n.getEnv().OTEL_ATTRIBUTE_COUNT_LIMIT, 128);
      return out;
    },
  },
  {
    name: "environment is read per call and defaults use the original shallow merge",
    async run(factory) {
      const env: any = { OTEL_SERVICE_NAME: "one" },
        n: any = factory({ process: { env } }),
        a = n.getEnv();
      env.OTEL_SERVICE_NAME = "two";
      const b = n.getEnv();
      assert.notEqual(a, b);
      assert.equal(a.OTEL_SERVICE_NAME, "one");
      assert.equal(b.OTEL_SERVICE_NAME, "two");
      assert.equal(a.OTEL_PROPAGATORS, b.OTEL_PROPAGATORS);
      assert.equal(a.OTEL_PROPAGATORS, n.DEFAULT_ENVIRONMENT.OTEL_PROPAGATORS);
      env.OTEL_PROPAGATORS = "owned";
      const c = n.getEnv();
      assert.notEqual(c.OTEL_PROPAGATORS, b.OTEL_PROPAGATORS);
      assert.deepEqual(c.OTEL_PROPAGATORS, ["owned"]);
      return {
        a: a.OTEL_SERVICE_NAME,
        b: b.OTEL_SERVICE_NAME,
        propagators: c.OTEL_PROPAGATORS,
      };
    },
  },
];
