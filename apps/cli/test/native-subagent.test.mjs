import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const execute = promisify(execFile);
const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
for (const sameParent of [false, true]) for (const allowRead of [true, false]) test(`default CLI Agent child permissions, model routing and cross-process resume: ${allowRead ? "allow" : "deny"}, ${sameParent ? "same-parent" : "new-parent"}`, { timeout: 60000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), "axon-native-subagent-"));
  const evidence = "Owned child file evidence 2917";
  const childAnswer = allowRead ? "Owned child completed with evidence 2917." : "Owned child reported denied Read.";
  const requests = [], failures = [];
  let resumeId;
  const server = createServer(async (req, res) => {
    try {
      let body = ""; for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
      const turn = requests.length;
      const tool = turn === 1 ? { name: "Agent", arguments: JSON.stringify({ description: "Read owned child evidence", prompt: "Owned child task: read owned.txt and report it.", subagent_type: "owned-child" }) }
        : turn === 2 ? { name: "Read", arguments: JSON.stringify({ file_path: join(root, "owned.txt") }) }
        : (turn === 5 || turn === 8) ? { name: "Agent", arguments: JSON.stringify({ description: "Continue owned child", prompt: turn === 5 ? "Owned resumed child question" : "Owned third child question", subagent_type: "owned-child", resume: resumeId }) } : undefined;
      const chunk = { id: `owned-${turn}`, object: "chat.completion.chunk", created: 1, model: requests.at(-1).model,
        choices: [{ index: 0, delta: tool ? { role: "assistant", tool_calls: [{ index: 0, id: `owned-call-${turn}`, type: "function", function: tool }] }
          : { role: "assistant", content: turn === 3 ? childAnswer : turn === 6 ? "Owned resumed child answer." : turn === 9 ? "Owned third child answer." : turn === 10 ? "Owned third parent done." : turn === 7 ? "Owned fresh parent received resumed child." : "Owned parent received child evidence." }, finish_reason: null }] };
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: tool ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
    } catch (error) { failures.push(String(error)); res.writeHead(500).end(); }
  });
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    await writeFile(join(root, "owned.txt"), evidence);
    const config = join(root, "product.json");
    await writeFile(config, JSON.stringify({ authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true },
      agents: [
        { name: "owned-parent", tags: ["cli", "default"], instructions: "OWNED_PARENT_INSTRUCTIONS", tools: ["Agent"], models: ["owned-model"] },
        { name: "owned-child", tags: ["cli", "custom"], description: "Owned child reader", instructions: "OWNED_CHILD_INSTRUCTIONS", tools: ["Read"], models: ["owned-child-model"] },
        ], models: ["owned-model", "owned-child-model"].map(id => ({ id, name: id, url: `http://127.0.0.1:${server.address().port}/v1` })) }));
    const options = {
      cwd: root, timeout: 35000, maxBuffer: 2 * 1024 * 1024,
      env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: config },
    };
    let launchCount = 0;
    const run = prompt => execute(process.execPath, [launcher, "-p", prompt,
      ...(sameParent ? [launchCount++ === 0 ? "--session-id" : "--resume", "owned-parent-session"] : []), "--allowedTools", "Agent", ...(allowRead ? ["Read"] : [])], options);
    const result = await run("Owned parent task: delegate reading owned.txt.");
    assert.equal(requests.length, 4, JSON.stringify(requests.map(request => ({ tools: request.tools?.map(tool => tool.function?.name), tail: request.messages?.slice(-1) }))));
    assert.match(result.stdout, /Owned parent received child evidence/);
    assert.deepEqual(requests.map(request => request.model), ["owned-model", "owned-child-model", "owned-child-model", "owned-model"]);
    const toolNames = request => request.tools?.map(tool => tool.function?.name) ?? [];
    assert.ok(toolNames(requests[0]).includes("Agent"));
    assert.equal(toolNames(requests[0]).includes("Read"), false);
    assert.ok(toolNames(requests[1]).includes("Read"));
    assert.ok(JSON.stringify(requests[1].messages).includes("Owned child task"));
    assert.ok(JSON.stringify(requests[3].messages).includes("OWNED_PARENT_INSTRUCTIONS"));
    assert.equal(requests[3].messages.some(message => message.tool_call_id === "owned-call-2"), false);
    assert.ok(JSON.stringify(requests[1].messages).includes("OWNED_CHILD_INSTRUCTIONS"));
    const childResult = requests[2].messages.find(message => message.role === "tool" && message.tool_call_id === "owned-call-2");
    assert.ok(childResult, "the child must return a tool result to its own model");
    if (allowRead) assert.ok(childResult.content.includes(evidence), JSON.stringify(childResult));
    else {
      assert.equal(childResult.content.includes(evidence), false);
      assert.match(childResult.content, /denied|not allowed|permission/i);
    }
    const parentResult = requests[3].messages.find(message => message.role === "tool" && message.tool_call_id === "owned-call-1");
    assert.ok(parentResult?.content.includes(childAnswer), JSON.stringify(parentResult));
    resumeId = parentResult.content.match(/\[Agent ID: ([^\]]+)\]/)?.[1];
    assert.ok(resumeId, "the original Agent result must expose a resume ID");
    const childFiles = (await readdir(root, { recursive: true })).filter(path => basename(path) === `${resumeId}.jsonl`);
    assert.equal(childFiles.length, 1);
    const childPath = join(root, childFiles[0]);
    const before = await readFile(childPath, "utf8");
    assert.ok(before.includes(childAnswer));
    const resumed = await run("Owned fresh parent: continue the previous child.");
    assert.match(resumed.stdout, /Owned fresh parent received resumed child/);
    assert.equal(requests.length, 7);
    assert.deepEqual(requests.slice(4).map(request => request.model), ["owned-model", "owned-child-model", "owned-model"]);
    const resumedHistory = JSON.stringify(requests[5].messages);
    assert.ok(resumedHistory.includes("Owned child task"));
    assert.ok(resumedHistory.includes(childAnswer));
    assert.ok(resumedHistory.includes("Owned resumed child question"));
    const restoredRead = requests[5].messages.find(message => message.role === "tool" && message.tool_call_id === "owned-call-2");
    assert.deepEqual(restoredRead, childResult);
    const resumedResult = requests[6].messages.find(message => message.role === "tool" && message.tool_call_id === "owned-call-5");
    assert.ok(resumedResult?.content.includes("Owned resumed child answer."), JSON.stringify(resumedResult));
    assert.equal(resumedResult.content.match(/\[Agent ID: ([^\]]+)\]/)?.[1], resumeId);
    assert.equal(JSON.stringify(requests[4].messages).includes("Owned parent task: delegate reading owned.txt."), sameParent);
    const after = await readFile(childPath, "utf8");
    assert.ok(after.includes(childAnswer));
    const restoredFiles = (await readdir(root, { recursive: true })).filter(path => basename(path) === `${resumeId}.jsonl`);
    if (sameParent) {
      assert.equal(restoredFiles.length, 1);
      assert.ok(after.includes("Owned resumed child answer."));
      assert.ok(after.length > before.length);
    } else {
      assert.equal(restoredFiles.length, 2, "new parent writes the same child store ID under a different parent directory");
      const newChildPath = join(root, restoredFiles.find(path => join(root, path) !== childPath));
      const newHistory = await readFile(newChildPath, "utf8");
      assert.ok(newHistory.includes("Owned resumed child answer."));
      assert.equal(newHistory.includes(childAnswer), false, "the original append does not copy the loaded history");
      assert.equal(after, before, "the first parent's child transcript is unchanged");
    }
    // Original lookup returns the first matching child file in filesystem directory order.
    const storageRoot = dirname(dirname(dirname(childPath)));
    let selectedHistory;
    for (const entry of await readdir(storageRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      try { selectedHistory = await readFile(join(storageRoot, entry.name, "subagents", `${resumeId}.jsonl`), "utf8"); break; }
      catch (error) { if (error.code !== "ENOENT") throw error; }
    }
    assert.ok(selectedHistory);
    const third = await run("Owned third parent: continue the child again.");
    assert.match(third.stdout, /Owned third parent done/);
    assert.equal(requests.length, 10);
    const thirdHistory = JSON.stringify(requests[8].messages);
    assert.equal(thirdHistory.includes(childAnswer), selectedHistory.includes(childAnswer));
    assert.equal(thirdHistory.includes("Owned resumed child answer."), selectedHistory.includes("Owned resumed child answer."));
    assert.ok(thirdHistory.includes("Owned third child question"));
    if (sameParent) {
      const finalFiles = (await readdir(root, { recursive: true })).filter(path => basename(path) === `${resumeId}.jsonl`);
      assert.deepEqual(finalFiles, childFiles);
      const complete = await readFile(childPath, "utf8");
      for (const text of [childAnswer, "Owned resumed child answer.", "Owned third child answer."]) assert.ok(complete.includes(text));
      assert.ok(thirdHistory.includes(childAnswer));
      assert.ok(thirdHistory.includes("Owned resumed child answer."));
    }
    assert.deepEqual(failures, []);
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
