import test from "node:test";
import { AUTHENTICATION_CASES } from "../scripts/helpers/authentication-scenarios.js";
import {
  authenticationLoopback,
  authenticationAcpGate,
} from "../scripts/helpers/authentication-loopback.js";
for (const scenario of AUTHENTICATION_CASES)
  test(scenario.name, { timeout: 15000 }, () => scenario.run());
test(
  "source authentication manager/provider/default storage login, refresh and logout over real owned HTTP",
  { timeout: 15000 },
  async () => { await authenticationLoopback(); },
);
test(
  "source ACP newSession waits the complete original auth manager then refuses anonymous default storage",
  { timeout: 15000 },
  async () => { await authenticationAcpGate(); },
);
