import { test } from "node:test";
import { createNativeSidecarEnvironment } from "../src/terminal/native-sidecar-environment.js";
import { createNativeSidecar } from "../src/terminal/native-sidecar.js";
import { sidecarScenarios } from "../scripts/helpers/sidecar-scenarios.js";
test("original sidecar ring buffer, managed environment and readiness identity guards", () =>
  sidecarScenarios(createNativeSidecarEnvironment, createNativeSidecar));
