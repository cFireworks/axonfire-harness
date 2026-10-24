import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import {
  createNativeCodeRatioServices,
  CODE_RATIO_SERVICES_MODULES,
} from "../../src/runtime/native-code-ratio-services.js";
const require = createRequire(import.meta.url);
export async function codeRatioServicesScenario(
  factory: typeof createNativeCodeRatioServices,
) {
  const temp = await mkdtemp(join(tmpdir(), "axon-events-")),
    proc = Object.create(process);
  proc.env = {
    CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
    WORKBUDDY_CONFIG_DIR: temp,
  };
  const frames: any[] = [];
  let received: () => void;
  const done = new Promise<void>((r) => {
    received = r;
  });
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    frames.push({ headers: req.headers, events: JSON.parse(body) });
    res.end("{}");
    if (frames.length === 1) received();
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${(server.address() as any).port}`;
  await writeFile(
    join(temp, "product.json"),
    JSON.stringify({
      endpoint: origin,
      deploymentType: "Cloud-Hosted",
      productFeatures: { CodeAdoptionRate: true },
      date: "2020-01-01",
      commit: "owned-commit",
      config: { disabled: true },
      telemetry: {
        report: { standard: { enabled: true, headers: { "x-base": "base" } } },
      },
    }),
  );
  const di = createNativeDi({ ...diRuntime(), process: proc }),
    core = di.getModule(78842).default;
  di.ConfigUtil.getRaw().cell.logger.level = "error";
  const runtime = {
    di,
    globals: Object.create(globalThis),
    require,
    process: proc,
    basePath: temp,
    filename: join(temp, "bundle.js"),
  };
  const foundation = createNativeBackendFoundation(runtime),
    express = createNativeExpress(runtime),
    timers = new Set<any>();
  Object.assign(runtime, {
    setTimeout(fn: any, ms: number) {
      const timer = setTimeout(fn, ms);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer: any) {
      timers.delete(timer);
      clearTimeout(timer);
    },
  });
  const host = factory({
    ...runtime,
    express,
    getModule: foundation.getModule,
    setTimeout(fn: any, ms: number) {
      const t = setTimeout(fn, ms);
      timers.add(t);
      return t;
    },
    clearTimeout(t: any) {
      timers.delete(t);
      clearTimeout(t);
    },
  });
  const ids = new Set<number>(CODE_RATIO_SERVICES_MODULES.map(([id]) => id));
  const loader = createNativeContainerBootstrap({
    di,
    configBasePath: temp,
    getModule: (id: number) =>
      ids.has(id) ? host.getModule(id) : foundation.getModule(id),
  });
  const container = di.ContainerFactory.create(core);
  let service: any, manager: any, subscription: any;
  try {
    for (const stage of [
      21280, 39066, 62309, 65903, 53879, 61488, 97619, 54387, 66892, 18707,
      98759, 5112,
    ])
      container.load(loader.getModule(stage).default);
    di.ContainerProvider.set(container);
    const api = foundation.getModule(92735),
      product = foundation.getModule(9151),
      ratio = host.load();
    manager = container.get(product.ProductManager);
    await manager.waitConfiguration();
    service = container.get(api.EventService);
    await service.initialize();
    const reporter = container.get(ratio.CodeRatioReporter);
    const input = {
      filePath: "owned.ts",
      oldContent: "before\n",
      newContent: "after\nextra\n",
      repoUrl: "https://owned.invalid/repo",
      repoBranch: "main",
      changeType: "modify",
      source: "owned",
      vcsType: "git",
    };
    assert.deepEqual(
      await reporter.recordAIChange({ ...input, rejected: true }),
      { reported: false, skipReason: "rejected" },
    );
    assert.deepEqual(
      await reporter.recordAIChange({ ...input, newContent: "before\n" }),
      { reported: false, skipReason: "empty-change" },
    );
    assert.deepEqual(
      await reporter.recordAIChange({ ...input, newContent: "binary\0" }),
      { reported: false, skipReason: "binary-content" },
    );
    assert.deepEqual(await reporter.recordAIChange(input), { reported: true });
    service.fireBatch();
    await done;
    assert.equal(frames[0].events.length, 1);
    const event = frames[0].events[0];
    assert.equal(event.eventCode, api.Events.CodeChangeEvent);
    assert.equal(event.protocolVersion, "1.0");
    assert.equal(event.lineCount, 1);
    assert.equal(event.filePath, "owned.ts");
    assert.match(event.codeDiff, /\+after/);
    assert.match(event.codeDiff, /\+extra/);
    const vcs = host.getModule(23294);
    await assert.rejects(() =>
      vcs.loadCommitMeta("/owned", "short", () => Promise.resolve("")),
    );
    const git = (args: string[]) =>
      execFileSync("git", args, {
        cwd: temp,
        encoding: "utf8",
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: "Owned",
          GIT_AUTHOR_EMAIL: "owned@example.invalid",
          GIT_COMMITTER_NAME: "Owned",
          GIT_COMMITTER_EMAIL: "owned@example.invalid",
        },
      });
    git(["init", "--quiet"]);
    await writeFile(join(temp, "owned.ts"), "before\n");
    git(["add", "owned.ts"]);
    git(["commit", "--quiet", "-m", "before"]);
    await writeFile(join(temp, "owned.ts"), "after\nextra\n");
    git(["add", "owned.ts"]);
    git(["commit", "--quiet", "-m", "after"]);
    const commit = await vcs.loadCommit({
      cwd: temp,
      commitId: git(["rev-parse", "HEAD"]).trim(),
      runGit: async (args: string[]) => git(args),
    });
    assert.equal(commit.meta.parents.length, 1);
    assert.equal(commit.files.length, 1);
    assert.equal(commit.files[0].addedLines.length, 2);
    assert.equal(commit.files[0].deletedLines.length, 1);
    const observedCommit = {
      ...commit.meta,
      committedAt: "2026-01-01T00:00:00Z",
      repoUrl: input.repoUrl,
      repoBranch: input.repoBranch,
      files: commit.files,
      vcsType: "git",
    };
    await reporter.observeCommit(observedCommit);
    await reporter.observeCommit(observedCommit);
    assert.equal(reporter.recentlyObservedCommits.size, 1);
    assert.equal(service.events.length, 1);
    await service.sendSync(service.events.splice(0));
    assert.equal(frames[1].events[0].eventCode, api.Events.CommitObserved);

    return {
      gitFiles: commit.files.length,
      reported: true,
      eventCode: event.eventCode,
      keys: Object.keys(event).sort(),
      svn: vcs.inferSvnBranch(
        "https://owned/repo/branches/test/a",
        "https://owned/repo",
      ),
    };
  } finally {
    subscription?.dispose();
    service?.onStop();
    for (const timer of timers) clearTimeout(timer);
    await manager?.promise;
    server.closeIdleConnections?.();
    await new Promise<void>((r) => server.close(() => r()));
    await container.unbindAllAsync();
    await foundation.closeContext();
    await rm(temp, { recursive: true, force: true });
  }
}
