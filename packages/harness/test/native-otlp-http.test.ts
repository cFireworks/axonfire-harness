import { test } from "node:test";
import { OTLP_HTTP_CASES } from "../scripts/helpers/otlp-http-scenarios.js";
import { createNativeOtlpHttp } from "../src/runtime/native-otlp-http.js";
for (const c of OTLP_HTTP_CASES)
  test(c.name, () => c.run(createNativeOtlpHttp));
