import assert from "node:assert/strict";
import { createNativeGalileoConfigResolver } from "../../src/runtime/native-galileo-config-resolver.js";
type Factory = typeof createNativeGalileoConfigResolver;
const valid = {
  enable: true,
  endpoint: " https://collector.example:443/// ",
  projectId: " project ",
  app: " app ",
  server: " server ",
};
export const GALILEO_CONFIG_RESOLVER_CASES = [
  {
    name: "Galileo routing requires literal enable=true and canonical origin-only endpoints",
    run(factory: Factory) {
      const resolve = factory().resolveGalileoConfig;
      const disabled = [
        undefined,
        {},
        { enable: 1 },
        { enable: "true" },
        { enable: false },
      ].map((c) => resolve(c));
      for (const r of disabled)
        assert.deepEqual(r, {
          enabled: false,
          canExportOtlp: false,
          canExportAegis: false,
          fingerprint: "disabled",
          issues: [],
        });
      const good = resolve(valid, { platform: " ElectronApp " });
      assert.equal(good.endpoint, "https://collector.example");
      assert.equal(good.target, "ElectronApp.app.server");
      assert.equal(good.tracesUrl, "https://collector.example/v1/traces");
      assert.equal(good.canExportAegis, true);
      assert.deepEqual(good.issues, []);
      const invalid = [
        "https://user:password@host",
        "https://host/path",
        "https://host/?q=1",
        "https://host/#fragment",
        "ftp://host",
        "garbage",
        42,
        "",
      ].map((endpoint) => resolve({ ...valid, endpoint }));
      for (const r of invalid) {
        assert.equal(r.canExportOtlp, false);
        assert.deepEqual(r.issues, ["invalid-endpoint"]);
        assert.equal(r.logsUrl, undefined);
      }
      return { disabled, good, invalid };
    },
  },
  {
    name: "Galileo routing separates OTLP and Aegis eligibility and preserves fingerprint inputs",
    run(factory: Factory) {
      const resolve = factory().resolveGalileoConfig;
      const base = resolve(valid, { platform: "ElectronApp" });
      const missingProject = resolve({ ...valid, projectId: " " });
      assert.equal(missingProject.canExportOtlp, true);
      assert.equal(missingProject.canExportAegis, false);
      assert.deepEqual(missingProject.issues, ["missing-project-id"]);
      const alternate = resolve(
        {
          ...valid,
          aegisEndpoint: "http://aegis.example:8080/",
          patchName: "new",
        },
        { platform: "ElectronApp" },
      );
      assert.equal(alternate.collectUrl, "http://aegis.example:8080/collect");
      assert.equal(alternate.fingerprint, base.fingerprint);
      const fallback = resolve({ ...valid, aegisEndpoint: "https://bad/path" });
      assert.equal(fallback.collectUrl, "https://collector.example/collect");
      const absent = resolve({ enable: true });
      assert.deepEqual(absent.issues, [
        "invalid-endpoint",
        "missing-project-id",
        "missing-app",
        "missing-server",
      ]);
      assert.equal(absent.canExportOtlp, false);
      assert.notEqual(
        resolve({ ...valid, server: "other" }, { platform: "ElectronApp" })
          .fingerprint,
        base.fingerprint,
      );
      return { base, missingProject, alternate, fallback, absent };
    },
  },
];
