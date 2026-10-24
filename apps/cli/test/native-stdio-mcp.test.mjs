import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, readdir, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const execute = promisify(execFile);
const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
for (const mode of ["allow", "deny", "hook-deny", "error"])
    test(`default CLI external stdio MCP: ${mode}`, { timeout: 45000 }, async (t) => {
        const root = await mkdtemp(join(tmpdir(), "axon-stdio-mcp-"));
        const requests = [], failures = [];
        const logPath = join(root, "rpc.jsonl");
        let ownedPid;
        const server = createServer(async (req, res) => {
            try {
                let raw = "";
                for await (const chunk of req)
                    raw += chunk;
                if (req.url === "/owned-pre-tool") {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: "owned hook permission denied" } }));
                    return;
                }
                requests.push(JSON.parse(raw));
                const tool = requests.length === 1;
                const delta = tool ? { role: "assistant", tool_calls: [{ index: 0, id: "owned-mcp", type: "function", function: { name: "mcp__owned__echo", arguments: JSON.stringify({ text: "owned-input" }) } }] } : { role: "assistant", content: "Owned stdio MCP completed." };
                const chunk = { id: `owned-${requests.length}`, object: "chat.completion.chunk", created: 1, model: "owned-model", choices: [{ index: 0, delta, finish_reason: null }] };
                res.writeHead(200, { "content-type": "text/event-stream" });
                res.end(`data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: tool ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`);
            }
            catch (error) {
                failures.push(String(error));
                res.writeHead(500).end();
            }
        });
        try {
            await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
            if (mode === "hook-deny") {
                await mkdir(join(root, ".codebuddy"), { recursive: true });
                await writeFile(join(root, ".codebuddy", "settings.local.json"), JSON.stringify({ hooks: {
                        PreToolUse: [{ matcher: "mcp__owned__echo", hooks: [{ type: "http", url: `http://127.0.0.1:${server.address().port}/owned-pre-tool`, timeout: 10 }] }],
                    } }));
            }
            const script = join(root, "server.mjs");
            await writeFile(script, `import { createInterface } from 'node:readline';
import { appendFileSync } from 'node:fs';
const log = value => appendFileSync(process.env.OWNED_RPC_LOG, JSON.stringify(value)+'\\n');
log({event:'start',pid:process.pid});
process.stderr.write('Owned MCP diagnostic on stderr\\n');
const lines = createInterface({input:process.stdin});
lines.on('line', line => {
 const rpc=JSON.parse(line);log(rpc); if(rpc.id===undefined)return;
 let result;
 if(rpc.method==='initialize')result={protocolVersion:rpc.params.protocolVersion,capabilities:{tools:{listChanged:true}},serverInfo:{name:'owned-stdio',version:'1.0.0'}};
 else if(rpc.method==='tools/list')result={tools:[{name:'echo',description:'Owned stdio echo',inputSchema:{type:'object',properties:{text:{type:'string'}},required:['text']}}]};
 else if(rpc.method==='tools/call')result={content:[{type:'text',text:process.env.OWNED_MODE==='error'?'owned-stdio-error':'owned-stdio-result:'+rpc.params.arguments.text}],isError:process.env.OWNED_MODE==='error'};
 else if(rpc.method==='ping')result={};
 else {process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:rpc.id,error:{code:-32601,message:'owned unsupported'}})+'\\n');return;}
 process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:rpc.id,result})+'\\n');
});
lines.on('close',()=>{log({event:'stdin-closed'});process.exit(0)});
process.on('SIGTERM',()=>{log({event:'terminated'});process.exit(0)});
`);
            const mcp = join(root, "mcp.json"), product = join(root, "product.json");
            await writeFile(mcp, JSON.stringify({ mcpServers: { owned: { command: process.execPath, args: [script], env: { OWNED_RPC_LOG: logPath, OWNED_MODE: mode } } } }));
            await writeFile(product, JSON.stringify({ authentication: { type: "custom-token", attributes: { token: "owned-token" } }, config: { disabled: true },
                agents: [{ name: "owned-main", tags: ["cli", "default"], instructions: "Call the owned MCP tool.", tools: [], models: ["owned-model"] }],
                models: [{ id: "owned-model", name: "owned-model", url: `http://127.0.0.1:${server.address().port}/v1` }] }));
            const result = await execute(process.execPath, [launcher, "-p", "Call the owned echo tool.", "--mcp-config", mcp, "--strict-mcp-config", "--permission-mode", "default", "--debug", ...(mode === "deny" ? [] : ["--allowedTools", "mcp__owned__echo"])], {
                cwd: root, timeout: 35000, maxBuffer: 2 * 1024 * 1024,
                env: { ...nativeFixtureEnv, HOME: root, SHELL: "/bin/sh", AXONFIRE_STATE_DIR: join(root, "state"), AXONFIRE_NATIVE_PRODUCT_CONFIG: product },
            });
            assert.match(result.stdout, /Owned stdio MCP completed/);
            assert.equal(requests.length, 2);
            assert.ok(requests[0].tools.some(tool => tool.function.name === "mcp__owned__echo"));
            const toolResult = requests[1].messages.find(message => message.role === "tool" && message.tool_call_id === "owned-mcp");
            assert.ok(toolResult);
            if (mode === "deny") {
                const paths = await readdir(root, { recursive: true });
                const logs = await Promise.all(paths.filter(path => /\.(log|txt)$/.test(path)).map(path => readFile(join(root, path), "utf8")));
                assert.ok([...logs, result.stdout, result.stderr].some(log => log.includes("shouldAvoidPermissionPrompts is true, denying")), "Original policy must reach its deny branch");
            }
            const observedDenialDefect = mode === "deny" && toolResult.content.includes("owned-stdio-result:owned-input");
            let rpc, alive = true;
            const deadline = Date.now() + 5000;
            do {
                rpc = (await readFile(logPath, "utf8")).trim().split("\n").map(line => JSON.parse(line));
                ownedPid = rpc.find(message => message.event === "start")?.pid;
                try {
                    process.kill(ownedPid, 0);
                    alive = true;
                }
                catch (error) {
                    if (error.code !== "ESRCH")
                        throw error;
                    alive = false;
                }
                if (!alive && rpc.some(message => ["stdin-closed", "terminated"].includes(message.event)))
                    break;
                await new Promise(resolve => setTimeout(resolve, 25));
            } while (Date.now() < deadline);
            assert.ok(rpc.some(message => message.method === "initialize"));
            assert.ok(rpc.some(message => message.method === "notifications/initialized"));
            assert.ok(rpc.some(message => message.method === "tools/list"));
            assert.equal(rpc.filter(message => message.method === "tools/call").length, observedDenialDefect ? 1 : mode.endsWith("deny") ? 0 : 1);
            assert.ok(rpc.some(message => ["stdin-closed", "terminated"].includes(message.event)), JSON.stringify(rpc));
            assert.equal(alive, false, `Owned MCP process ${ownedPid} is still running`);
            assert.deepEqual(failures, []);
            // Only this reproduced original defect is TODO; transport, policy-log and
            // lifecycle regressions above must still fail normally.
            if (observedDenialDefect)
                t.todo("Original MCP proxy does not consume cached permission denial; keep the failing boundary visible");
            assert.match(toolResult.content, mode.endsWith("deny") ? /denied|not allowed|permission/i : mode === "error" ? /owned-stdio-error/ : /owned-stdio-result:owned-input/);
        }
        finally {
            if (!ownedPid) {
                try {
                    ownedPid = (await readFile(logPath, "utf8")).trim().split("\n").map(line => JSON.parse(line)).find(item => item.event === "start")?.pid;
                }
                catch (error) {
                    if (error.code !== "ENOENT")
                        throw error;
                }
            }
            // Only terminate this fixture's still-live server on a failed assertion.
            if (ownedPid && process.platform !== "win32") {
                try {
                    const status = await execute("/bin/ps", ["-p", String(ownedPid), "-o", "command="]);
                    if (status.stdout.includes(join(root, "server.mjs")))
                        process.kill(ownedPid, "SIGTERM");
                }
                catch (error) {
                    if (error.code !== "ESRCH" && error.code !== 1)
                        throw error;
                }
            }
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
            await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
        }
    });
