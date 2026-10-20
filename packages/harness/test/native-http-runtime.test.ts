import test from "node:test";
import { NATIVE_HTTP_CASES } from "../scripts/helpers/native-http-scenarios.js";
import {
  nativeHttpSdk,
  NATIVE_HTTP_SDK_MODES,
} from "../scripts/helpers/native-http-sdk.js";
for (const scenario of NATIVE_HTTP_CASES)
  test(scenario.name, () => scenario.run());
for (const mode of NATIVE_HTTP_SDK_MODES)
  test(
    "full original HTTP/MVC/CLS + new/cold native sessions + actual SDK: " +
      mode,
    { timeout: 30000 },
    async () => {
      await nativeHttpSdk(undefined, undefined, undefined, mode);
    },
  );
