import assert from "node:assert/strict";
import { test } from "node:test";
import { galileoServiceFixture } from "../scripts/helpers/galileo-service-scenarios.js";
import { createNativeGalileoService } from "../src/runtime/native-galileo-service.js";
import { resolveGalileoConfig } from "../src/runtime/native-galileo-config-resolver.js";

function fixture(galileo: any) {
  const f = galileoServiceFixture((runtime) => {
    runtime.modules[9151].resolveGalileoConfig = resolveGalileoConfig;
    return createNativeGalileoService(runtime);
  });
  f.service.productManager.waitConfiguration = async () => ({ galileo });
  return f;
}
test("original Galileo service routes normalized product configuration without requiring an Aegis project ID", async () => {
  const f = fixture({
    enable: true,
    endpoint: " https://collector.example:443/// ",
    app: " app ",
    server: " server ",
    patchName: "patch",
  });
  try {
    f.service.initialize();
    await f.service.waitReady();
    assert.equal(f.service.isReady(), true);
    const setup = f.events.find((e) => e[0] === "setup")[1];
    assert.equal(
      setup.metricsCollectorAddr,
      "https://collector.example/v1/metrics",
    );
    assert.equal(
      setup.traceCollectorAddr,
      "https://collector.example/v1/traces",
    );
    assert.equal(setup.logCollectorAddr, "https://collector.example/v1/logs");
    assert.equal(setup.app, "app");
    assert.equal(setup.server, "server");
    assert.equal(f.env.GALILEO_SDK_READY, "1");
  } finally {
    f.service.onStop();
    await f.service.shutdown();
  }
});
test("original Galileo service skips SDK setup for disabled and invalid product endpoints", async () => {
  for (const galileo of [
    { enable: "true" },
    {
      enable: true,
      endpoint: "https://collector.example/path",
      app: "app",
      server: "server",
    },
  ]) {
    const f = fixture(galileo);
    try {
      f.service.initialize();
      await f.service.waitReady();
      assert.equal(f.service.isReady(), false);
      assert.equal(
        f.events.some((e) => e[0] === "setup"),
        false,
      );
      assert.equal(f.env.GALILEO_SDK_READY, "0");
    } finally {
      f.service.onStop();
    }
  }
});
