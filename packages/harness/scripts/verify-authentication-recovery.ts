import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { createNativeAuthenticationRuntime } from "../src/auth/native-authentication.js";
import { loadCapturedAuthentication } from "./helpers/captured-authentication.js";
import { AUTHENTICATION_CASES } from "./helpers/authentication-scenarios.js";
import {
  authenticationLoopback,
  authenticationAcpGate,
} from "./helpers/authentication-loopback.js";
import { loadCapturedAcpProtocol } from "./helpers/captured-acp-protocol.js";
const source = readFileSync(getCapturedBundlePath(), "utf8"),
  original = loadCapturedAuthentication(source),
  acp = loadCapturedAcpProtocol(source);
for (const scenario of AUTHENTICATION_CASES)
  assert.deepEqual(
    await scenario.run(createNativeAuthenticationRuntime),
    await scenario.run(original.factory),
    scenario.name,
  );
assert.deepEqual(
  await authenticationLoopback(),
  await authenticationLoopback(original.factory),
);
assert.deepEqual(
  await authenticationAcpGate(),
  await authenticationAcpGate(original.factory, acp as any),
);
console.log(
  JSON.stringify({
    ...original,
    factory: undefined,
    comparisons: AUTHENTICATION_CASES.length,
    realHttpPairs: 1,
    originalAcpAuthGatePairs: 1,
    originalBootstrapExecuted: false,
    productionAccountUsed: false,
    ok: true,
  }),
);
