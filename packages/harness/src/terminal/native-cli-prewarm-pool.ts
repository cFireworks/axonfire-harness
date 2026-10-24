// @ts-nocheck
import * as nodeFs from 'node:fs';
import * as node_path from 'node:path';
import * as node_os from 'node:os';
import * as nodeNet from 'node:net';
import * as nodeCrypto from 'node:crypto';
import * as nodeChildProcess from 'node:child_process';
import {createNativeSidecarEnvironment} from './native-sidecar-environment.js';
export const PREWARM_SOURCE={"file":"cli-prewarm-pool.js","sha256":"ecb7ff634b205288b5ea236519f01292a0a2d02802e1bded03d382532ec3f296","regions":[{"from":73783,"to":73801},{"from":73802,"to":73821},{"from":73822,"to":73852},{"from":74036,"to":74203},{"from":74240,"to":74308},{"from":74895,"to":74924},{"from":74957,"to":74982},{"from":75098,"to":75135},{"from":75171,"to":75198},{"from":75887,"to":75914},{"from":75984,"to":76022},{"from":76084,"to":76124},{"from":76306,"to":76342},{"from":76392,"to":76427},{"from":77617,"to":77655},{"from":77656,"to":77695},{"from":77696,"to":77730},{"from":77770,"to":77801},{"from":77840,"to":77878},{"from":77879,"to":77904},{"from":77905,"to":77974},{"from":78465,"to":78733},{"from":78848,"to":78924},{"from":79153,"to":79244},{"from":79337,"to":79610},{"from":79611,"to":79952},{"from":79953,"to":80205},{"from":80206,"to":80497},{"from":80498,"to":99679},{"from":99680,"to":99730},{"from":99731,"to":99935},{"from":99936,"to":101301},{"from":101342,"to":102465},{"from":102466,"to":102565}],"names":["ENABLED","DISABLED","TEAM_EXPERT_TYPE","resolveAgentTeamsEnv","AGENT_TEAMS_ENV_KEY","TAG","IPC_TIMEOUT_MS","ACTIVATE_READY_TIMEOUT_MS","KILL_GRACEFUL_MS","PING_INTERVAL_MS","SOCKET_READY_TIMEOUT_MS_WIN","SOCKET_READY_TIMEOUT_MS_POSIX","REPLENISH_BACKOFF_BASE_MS","REPLENISH_BACKOFF_MAX_MS","HEALTH_PROBE_FIRST_DELAY_MS","HEALTH_PROBE_INTERVAL_MS","HEALTH_PROBE_TIMEOUT_MS","STDERR_TAIL_MAX_LINES","STDERR_TAIL_MAX_LINE_BYTES","cliChildCrashWatcher","bindCliChildCrashWatcher","PER_SESSION_ENV_KEYS","PER_SESSION_ENV_SUFFIXES","MUTUALLY_EXCLUSIVE_ENV_GROUPS","resolveCurrentProductConfigEnv","applyCurrentProductConfigEnv","isWhitelistedSessionEnvKey","managedEnvMismatchKeys","CliPrewarmPool","PREWARM_ADDRESS_PREFIX","resolvePrewarmIpcPath","validateActivateReadyResponse","sendIpcLine","delay"]} as const;
export function createNativeCliPrewarmPool(runtime:any={}):any {
const process=runtime.process ?? globalThis.process,console=runtime.console ?? globalThis.console;
const node_fs=nodeFs,node_net=runtime.net ?? nodeNet,node_crypto=nodeCrypto,node_child_process=runtime.childProcess ?? nodeChildProcess;
const require_cli_process_env=runtime.environment ?? createNativeSidecarEnvironment({process});
// BEGIN ORIGINAL
var ENABLED = "1";
var DISABLED = "0";
var TEAM_EXPERT_TYPE = "team";
function resolveAgentTeamsEnv(input = {}) {
	if (input.expertType === TEAM_EXPERT_TYPE) return ENABLED;
	return input.disableAgentTeams ?? true ? DISABLED : ENABLED;
}
var AGENT_TEAMS_ENV_KEY = "CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS";
var TAG = "[CliPrewarmPool]";
var IPC_TIMEOUT_MS = 5e3;
var ACTIVATE_READY_TIMEOUT_MS = 18e4;
var KILL_GRACEFUL_MS = 3e3;
var PING_INTERVAL_MS = 3e3;
var SOCKET_READY_TIMEOUT_MS_WIN = 3e4;
var SOCKET_READY_TIMEOUT_MS_POSIX = 1e4;
var REPLENISH_BACKOFF_BASE_MS = 1e4;
var REPLENISH_BACKOFF_MAX_MS = 6e4;
var HEALTH_PROBE_FIRST_DELAY_MS = 2e4;
var HEALTH_PROBE_INTERVAL_MS = 8 * 6e4;
var HEALTH_PROBE_TIMEOUT_MS = 2e3;
var STDERR_TAIL_MAX_LINES = 20;
var STDERR_TAIL_MAX_LINE_BYTES = 1024;
var cliChildCrashWatcher;
function bindCliChildCrashWatcher(fn) {
	cliChildCrashWatcher = fn;
}
var PER_SESSION_ENV_KEYS = new Set([
	AGENT_TEAMS_ENV_KEY,
	"CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL",
	"TENCENT_DOCS_LOCAL_MCP",
	"TENCENT_DOCS_LOCAL_SERVER",
	"editor_sdk_port",
	"CODEBUDDY_HOST_CAPABILITIES",
	"CODEBUDDY_QIMEI36",
	"CODEBUDDY_SESSION_SKILL_DIRS"
]);
var PER_SESSION_ENV_SUFFIXES = [
	"_TOKEN",
	"_API_KEY",
	"_ACCESS_TOKEN"
];
var MUTUALLY_EXCLUSIVE_ENV_GROUPS = [["ACC_PRODUCT_CONFIG_PATH", "ACC_PRODUCT_CONFIG_V3"]];
function resolveCurrentProductConfigEnv() {
	const resolved = {};
	for (const group of MUTUALLY_EXCLUSIVE_ENV_GROUPS) {
		const activeKey = group.find((key) => Boolean(process.env[key]));
		if (activeKey) resolved[activeKey] = process.env[activeKey];
	}
	return resolved;
}
function applyCurrentProductConfigEnv(env) {
	const resolved = resolveCurrentProductConfigEnv();
	for (const group of MUTUALLY_EXCLUSIVE_ENV_GROUPS) {
		const activeKey = group.find((key) => key in resolved);
		if (!activeKey) continue;
		for (const key of group) if (key === activeKey) env[key] = resolved[key];
		else delete env[key];
	}
}
function isWhitelistedSessionEnvKey(key, trustedSessionEnvKeys) {
	if (PER_SESSION_ENV_KEYS.has(key) || trustedSessionEnvKeys.has(key)) return true;
	for (const suffix of PER_SESSION_ENV_SUFFIXES) if (key.endsWith(suffix)) return true;
	return false;
}
function managedEnvMismatchKeys(expected, actual) {
	return [...new Set([...Object.keys(expected), ...Object.keys(actual)])].filter((key) => !Object.prototype.hasOwnProperty.call(expected, key) || !Object.prototype.hasOwnProperty.call(actual, key) || expected[key] !== actual[key]).sort();
}
var CliPrewarmPool = class {
	entries = [];
	/** sessionId → entry，用于 killSession 时按 session 找到对应进程。 */
	bySession = /* @__PURE__ */ new Map();
	started = false;
	stopped = false;
	/**
	* 连续意外退出（idle/spawning 状态退出）时的退避时长。
	*
	* 避免环境性故障（cliPath 失效 / electron 二进制缺失 / 配额耗尽）下
	* 池退化成 spawn 风暴：每次失败翻倍，封顶 REPLENISH_BACKOFF_MAX_MS；
	* 一旦补成功（waitSocketReady 通过）即重置为 0，不影响正常运行时的
	* 即时补池语义。
	*/
	replenishBackoffMs = 0;
	/**
	* 已经排队、尚未触发 spawn 的补池 reservation 数量。
	*
	* 延迟补池必须先占容量：否则 post-acquire 与 activate-failure 等并发来源
	* 会在 entry 尚未 push 前各自看到空位，重复排 timer、重复推进 backoff。
	* timer 触发时先释放 reservation，再用实时 entries 做二次容量检查。
	*/
	pendingReplenishments = 0;
	/** 进行中的 flush 循环；非 null 表示正在重建，用于合并并发/连续请求。 */
	flushing = null;
	/** flush 进行中若又收到请求，置 true；当前轮结束后补跑一轮再清零。 */
	pendingFlush = false;
	constructor(deps) {
		this.deps = deps;
	}
	/** 启动池，spawn 初始 poolSize 个 prewarm 进程。失败不抛——池空 = 全走冷启动。 */
	start() {
		if (this.started || this.stopped) return;
		this.started = true;
		if (this.deps.poolSize <= 0) {
			this.log("info", "pool disabled (poolSize=0)");
			return;
		}
		this.log("info", `pool starting, size=${this.deps.poolSize}`);
		for (let i = 0; i < this.deps.poolSize; i++) this.spawnEntry().catch((err) => {
			this.log("warn", `initial spawn failed: ${String(err?.message ?? err)}`);
		});
	}
	/**
	* 尝试领取一个 idle prewarm 进程。
	*
	* 命中条件：
	* 1. 池非空（有 idle entry）；
	* 2. sessionDeltaEnv 中所有键都在白名单内（PER_SESSION_ENV_KEYS ∪
	*    PER_SESSION_ENV_SUFFIXES）。出现白名单外键即视为"未审计差异"，
	*    回退冷启动——保护 prewarm 复用不被新引入的 env 维度静默破坏。
	* 3. **候选 idle 通过一次 IPC ping 健康探活**——防止把"被 STOP / 冻结 /
	*    死锁的假死进程"当作可用（issue #73926）：假死进程的 `entry.status`
	*    仍是 'idle'、child.exit 永不触发，只有主动 ping 能识别。失败即
	*    reclaim（打 `discarded` 标 + removeEntry + scheduleReplenish +
	*    fire-and-forget terminateChild），继续尝试下一个候选，全部失败返回
	*    null。
	*
	* 4. entry 的 spawn managed env 叠加 sessionDeltaEnv 后，必须与本次冷启动
	*    最终会使用的 runtimeManagedEnv 完全一致；不一致即回退冷启动。
	*/
	tryAcquire(sessionDeltaEnv = {}, runtimeManagedEnv, trustedSessionEnvKeys = /* @__PURE__ */ new Set()) {
		if (this.stopped || this.deps.poolSize <= 0) return null;
		const unknownKeys = Object.keys(sessionDeltaEnv).filter((k) => !isWhitelistedSessionEnvKey(k, trustedSessionEnvKeys));
		if (unknownKeys.length > 0) {
			this.log("warn", `tryAcquire skipped: unknown session env keys=[${unknownKeys.join(", ")}]; add them to PER_SESSION_ENV_KEYS/SUFFIXES if expected`);
			return null;
		}
		const capturedDeltaEnv = { ...sessionDeltaEnv };
		for (const entry of [...this.entries]) {
			if (entry.status !== "idle") continue;
			if (runtimeManagedEnv) {
				const mismatchKeys = managedEnvMismatchKeys({
					...entry.spawnManagedEnv,
					...capturedDeltaEnv
				}, runtimeManagedEnv);
				if (mismatchKeys.length > 0) {
					this.log("warn", `tryAcquire skipped stale entry: managed env mismatch keys=[${mismatchKeys.join(", ")}]`);
					this.clearHealthProbe(entry);
					entry.discarded = true;
					this.removeEntry(entry);
					this.scheduleReplenish("managed env mismatch");
					this.terminateChild(entry.child).catch(() => {});
					continue;
				}
			}
			entry.status = "activated";
			this.clearHealthProbe(entry);
			this.log("info", `tryAcquire hit (id=${entry.prewarmId})`);
			return {
				prewarmId: entry.prewarmId,
				activate: (opts) => this.doActivate(entry, {
					...opts,
					env: Object.keys(capturedDeltaEnv).length > 0 ? capturedDeltaEnv : void 0
				})
			};
		}
		return null;
	}
	/**
	* 启动 entry 的后台健康探活（issue #75795），两段式：
	* - 首次：idle 后 HEALTH_PROBE_FIRST_DELAY_MS（默认 20s）做第一次探活，快速
	*   过滤刚 spawn 就假死的坏进程；
	* - 稳态：首次探活跑完后转 setInterval，每 HEALTH_PROBE_INTERVAL_MS（默认 8min）
	*   一次，低频发现假死。
	* 定时器 unref，避免拖住进程退出。幂等：已有定时器则先清再建。
	*/
	startHealthProbe(entry) {
		this.clearHealthProbe(entry);
		const firstDelayMs = this.deps.healthProbeFirstDelayMs ?? HEALTH_PROBE_FIRST_DELAY_MS;
		const intervalMs = this.deps.healthProbeIntervalMs ?? HEALTH_PROBE_INTERVAL_MS;
		const firstTimer = setTimeout(() => {
			this.runHealthProbe(entry).finally(() => {
				if (this.stopped || entry.status !== "idle" || entry.discarded) return;
				const intervalTimer = setInterval(() => {
					this.runHealthProbe(entry).catch(() => {});
				}, intervalMs);
				intervalTimer.unref?.();
				entry.healthTimer = intervalTimer;
			}).catch(() => {});
		}, firstDelayMs);
		firstTimer.unref?.();
		entry.healthTimer = firstTimer;
	}
	/**
	* 清除 entry 的健康探活定时器（activate / 淘汰 / stop 时调用）。
	* 句柄可能是 setTimeout（首次）或 setInterval（稳态）——Node 的 Timeout 对象
	* 对 clearTimeout / clearInterval 均可清理，这里两者都调以覆盖两种阶段。
	*/
	clearHealthProbe(entry) {
		if (entry.healthTimer) {
			clearTimeout(entry.healthTimer);
			clearInterval(entry.healthTimer);
			entry.healthTimer = void 0;
		}
	}
	/**
	* 后台探活一次：对 idle entry 发一次 ping，失败即当假死淘汰。
	*
	* 失败原因不区分（timeout / ECONNREFUSED / ok!=true），一律视作"不健康"——
	* 假死进程只有 timeout 一种表现，其他失败也意味着 entry 不可用。
	*
	* 淘汰路径与旧 tryAcquire 假死分支一致（issue #73926）：打 discarded 标避免
	* SIGKILL 触发 exit handler 双写补池，removeEntry + scheduleReplenish +
	* fire-and-forget terminateChild。只处理仍是 idle 的 entry——探活期间若已被
	* acquire（activated）或已淘汰，直接跳过。
	*/
	async runHealthProbe(entry) {
		if (this.stopped || entry.status !== "idle" || entry.discarded) return;
		const timeoutMs = this.deps.healthProbeTimeoutMs ?? HEALTH_PROBE_TIMEOUT_MS;
		let healthy = false;
		try {
			const res = await sendIpcLine(entry.socketPath, { cmd: "ping" }, timeoutMs);
			healthy = !!(res && res.ok === true);
		} catch {
			healthy = false;
		}
		if (healthy || this.stopped || entry.status !== "idle" || entry.discarded) return;
		this.log("warn", `health probe failed, reclaiming unhealthy idle prewarm (id=${entry.prewarmId}, pid=${entry.child.pid ?? "unknown"})`);
		this.clearHealthProbe(entry);
		entry.discarded = true;
		this.removeEntry(entry);
		this.scheduleReplenish("unhealthy idle", { minDelayMs: this.deps.unexpectedExitBackoffMs ?? REPLENISH_BACKOFF_BASE_MS });
		this.terminateChild(entry.child).catch(() => {});
	}
	/**
	* killSession：若该 session 由池产生，按 pid 终止并清映射；否则返回 false
	* 让调用方走原 runtimeManager.killSession（sidecar 路径）。
	*/
	async killSession(sessionId) {
		const entry = this.bySession.get(sessionId);
		if (!entry) return false;
		this.bySession.delete(sessionId);
		this.removeEntry(entry);
		await this.terminateChild(entry.child).catch((err) => {
			this.log("warn", `killSession terminate failed: ${String(err?.message ?? err)}`);
		});
		return true;
	}
	/**
	* 返回所有已 activate 的 prewarm 会话的 HTTP endpoint（去掉 /api/v1/acp 后缀）。
	*
	* prewarm 命中的会话绕过了 sidecar 会话表（见文件头设计边界），不会出现在
	* `SidecarManager.listSessions()` 里；供 `SidecarManager.getAllActiveEndpoints()`
	* 合并汇总，否则安全中心规则实时同步等广播场景会漏掉这些会话。
	*/
	getActiveEndpoints() {
		return this.entries.filter((e) => e.status === "activated" && e.acpEndpoint).map((e) => e.acpEndpoint.replace(/\/api\/v1\/acp$/, ""));
	}
	/**
	* 按 sessionId 精确查询该会话已 activate 的 HTTP endpoint（去掉 /api/v1/acp 后缀）。
	*
	* prewarm 命中的会话绕过 sidecar 会话表（见文件头设计边界），不在
	* `SidecarManager.listSessions()` 里；`SidecarManager.resolveSessionHttpBase()`
	* 查不到普通 sidecar session 时回退到这里，让 `ExpertPluginService`
	* 之类按 sessionId 定位 ACP endpoint 的链路在 prewarm 会话中也能拿到端点
	* （issue #62459：不然专家 plugin switch 会 degrade，专家身份注入失效）。
	*
	* 未 activate / 已 kill / 未知 sessionId 返回 undefined。
	*/
	getActiveEndpointForSession(sessionId) {
		const entry = this.bySession.get(sessionId);
		if (!entry || entry.status !== "activated" || !entry.acpEndpoint) return;
		return entry.acpEndpoint.replace(/\/api\/v1\/acp$/, "");
	}
	/**
	* flush：无条件杀掉所有 idle/spawning 条目并重新 spawn。
	*
	* 典型场景：
	* - auth 状态变化（登录 / 登出 / 切用户）：旧 prewarm 进程持有的 auth 文件
	*   快照已过时，必须换一批在新 auth 环境下重新冷启动。
	* - 产品配置快照变化：新配置已写入当前进程的产品配置 env（可能是内联
	*   ACC_PRODUCT_CONFIG_V3，也可能是 Linux 大配置 spill 后的固定路径文件），
	*   重新 spawn 时经 applyCurrentProductConfigEnv 覆盖固化的 baselineEnv 生效。
	*
	* 变化检测由上游 coordinator 的 rotation key 精确去重（无实质变化的高频发布
	* 不会触发本入口），因此这里不再做二次指纹去重——否则 spill 模式下固定路径的
	* 指纹恒定，会把真实变化误判为无变化而漏重建。
	*
	* 已 activated 的条目不受影响（它们已经绑定了 session，由 killSession 管理）。
	*
	* 多次并发/连续调用会被合并（见 enqueueFlush），不会重复杀正在 spawning 的新进程。
	*/
	async flush() {
		if (this.stopped || this.deps.poolSize <= 0) return;
		return this.enqueueFlush();
	}
	/**
	* 合并 flush 请求：进行中再来的请求只置 pending 并共享同一个 Promise，
	* 当前轮结束后按需补跑一轮。这样连环触发（auth + 产品三段式发布同时到达）
	* 最多收敛成一轮补充重建，不会 N 次反复杀掉刚 spawn 的进程。
	*/
	enqueueFlush() {
		if (this.flushing) {
			this.pendingFlush = true;
			return this.flushing;
		}
		this.flushing = this.runFlushLoop();
		return this.flushing;
	}
	async runFlushLoop() {
		try {
			do {
				this.pendingFlush = false;
				await this.runFlush();
			} while (this.pendingFlush && !this.stopped);
		} finally {
			this.flushing = null;
		}
	}
	/** 一轮实际重建：杀 idle/spawning 条目，补池到目标容量。 */
	async runFlush() {
		if (this.stopped || this.deps.poolSize <= 0) return;
		const idleOrSpawning = this.entries.filter((e) => e.status === "idle" || e.status === "spawning");
		if (idleOrSpawning.length === 0) {
			this.log("info", "flush: no idle/spawning entries to flush");
			return;
		}
		this.log("info", `flush: killing ${idleOrSpawning.length} idle/spawning entries, will re-spawn`);
		for (const entry of idleOrSpawning) {
			entry.discarded = true;
			this.removeEntry(entry);
		}
		await Promise.all(idleOrSpawning.map((e) => this.terminateChild(e.child).catch(() => {})));
		this.replenishBackoffMs = 0;
		const currentIdleOrSpawning = this.entries.filter((e) => e.status === "idle" || e.status === "spawning").length;
		const toSpawn = Math.max(0, this.deps.poolSize - currentIdleOrSpawning);
		for (let i = 0; i < toSpawn; i++) this.spawnEntry().catch((err) => {
			this.log("warn", `flush re-spawn failed: ${String(err?.message ?? err)}`);
		});
	}
	/** daemon 退出时调用，杀光所有待命 + 已 activate 但仍由池跟踪的进程。 */
	async stop() {
		if (this.stopped) return;
		this.stopped = true;
		const snapshot = [...this.entries];
		this.entries.length = 0;
		this.bySession.clear();
		for (const entry of snapshot) {
			entry.discarded = true;
			this.clearHealthProbe(entry);
		}
		await Promise.all(snapshot.map((e) => this.terminateChild(e.child).catch(() => {})));
	}
	async doActivate(entry, opts) {
		const pid = entry.child.pid ?? 0;
		const deltaEnvKeys = opts.env ? Object.keys(opts.env) : [];
		this.log("info", `doActivate (id=${entry.prewarmId}, pid=${pid}, sessionId=${opts.sessionId}, port=kernel-assigned, deltaEnvKeys=[${deltaEnvKeys.join(",")}])`);
		this.scheduleReplenish("post-acquire");
		let ready;
		try {
			ready = await this.sendActivate(entry.socketPath, {
				cwd: opts.cwd,
				args: opts.args,
				sessionId: opts.sessionId,
				ackMode: "ready",
				...opts.env && Object.keys(opts.env).length > 0 ? { env: opts.env } : {}
			});
			validateActivateReadyResponse(ready, {
				expectedPid: pid,
				expectedSessionId: opts.sessionId
			});
		} catch (err) {
			this.removeEntry(entry);
			await this.terminateChild(entry.child).catch(() => {});
			this.scheduleReplenish("activate failure", { minDelayMs: this.deps.unexpectedExitBackoffMs ?? REPLENISH_BACKOFF_BASE_MS });
			throw err;
		}
		const acpEndpoint = String(ready.endpoint);
		entry.sessionId = opts.sessionId;
		entry.acpEndpoint = acpEndpoint;
		this.bySession.set(opts.sessionId, entry);
		return {
			pid,
			acpEndpoint
		};
	}
	async spawnEntry() {
		if (this.stopped) return;
		const prewarmId = `wb-pool-${Date.now()}-${(0, node_crypto.randomBytes)(3).toString("hex")}`;
		const socketPath = resolvePrewarmIpcPath(prewarmId);
		const args = [
			this.deps.cliPath,
			"--prewarm",
			"--prewarm-id",
			prewarmId
		];
		const spawnManagedEnv = {
			...this.deps.baselineEnvProvider?.() ?? this.deps.baselineEnv,
			...require_cli_process_env.CLI_STATIC_MANAGED_ENV
		};
		applyCurrentProductConfigEnv(spawnManagedEnv);
		const env = require_cli_process_env.buildCliProcessEnv(spawnManagedEnv);
		this.log("info", `spawning prewarm (id=${prewarmId})`);
		const child = (0, node_child_process.spawn)(this.deps.execPath, args, {
			detached: true,
			stdio: [
				"ignore",
				"ignore",
				"pipe"
			],
			windowsHide: true,
			env
		});
		const entry = {
			prewarmId,
			socketPath,
			child,
			status: "spawning",
			spawnManagedEnv: { ...spawnManagedEnv }
		};
		this.entries.push(entry);
		cliChildCrashWatcher?.(child);
		child.on("error", (err) => {
			if (entry.discarded) return;
			entry.discarded = true;
			const errMsg = err instanceof Error ? err.message : String(err);
			this.log("warn", `prewarm child error (id=${prewarmId}, pid=${child.pid ?? "unknown"}, status=${entry.status}): ${errMsg}`);
			this.removeEntry(entry);
			if (entry.sessionId) this.bySession.delete(entry.sessionId);
			if (entry.status !== "activated") this.scheduleReplenish("child error", { minDelayMs: this.deps.unexpectedExitBackoffMs ?? REPLENISH_BACKOFF_BASE_MS });
		});
		const stderrTail = [];
		child.stderr?.on("data", (data) => {
			const text = data.toString();
			for (const rawLine of text.split(/\r?\n/)) {
				if (!rawLine) continue;
				const line = rawLine.length > STDERR_TAIL_MAX_LINE_BYTES ? rawLine.slice(0, STDERR_TAIL_MAX_LINE_BYTES) + "…" : rawLine;
				stderrTail.push(line);
				if (stderrTail.length > STDERR_TAIL_MAX_LINES) stderrTail.shift();
			}
		});
		child.stderr?.on("error", () => {});
		child.on("exit", (code, signal) => {
			const idx = this.entries.indexOf(entry);
			if (idx >= 0) this.entries.splice(idx, 1);
			if (entry.sessionId) this.bySession.delete(entry.sessionId);
			if (entry.discarded) return;
			if (entry.status !== "activated") {
				const tail = stderrTail.length > 0 ? ` | stderr tail:\n${stderrTail.join("\n")}` : "";
				this.log("warn", `prewarm entry exited before activate (id=${prewarmId}, code=${code}, signal=${signal ?? "none"})${tail}`);
				this.scheduleReplenish("unexpected exit", { minDelayMs: this.deps.unexpectedExitBackoffMs ?? REPLENISH_BACKOFF_BASE_MS });
			} else if (!this.stopped && !child.killed && ((code ?? 0) !== 0 || signal)) {
				const tail = stderrTail.length > 0 ? stderrTail.join("\n") : "<empty>";
				this.log("warn", `activated prewarm entry exited unexpectedly (id=${prewarmId}, pid=${child.pid ?? "unknown"}, sessionId=${entry.sessionId ?? "unknown"}, code=${code}, signal=${signal ?? "none"}) | stderr tail:\n${tail}`);
			}
		});
		if (!await this.waitSocketReady(socketPath)) {
			this.log("warn", `prewarm IPC not ready in time (id=${prewarmId})`);
			this.removeEntry(entry);
			await this.terminateChild(child).catch(() => {});
			return;
		}
		if (entry.status === "spawning") {
			entry.status = "idle";
			this.replenishBackoffMs = 0;
			this.log("info", `prewarm ready (id=${prewarmId})`);
			this.startHealthProbe(entry);
		}
	}
	/**
	* 调度一次补池。
	*
	* 时延决策：
	* - 实际延迟 = max(replenishBackoffMs, opts.minDelayMs ?? 0)
	* - replenishBackoffMs：连续 spawn 失败的退避计数；上次成功后归 0
	* - minDelayMs：调用方指定的最小等待，意外退出路径用它强制至少等 10s
	*
	* 退避计数推进规则：只有在 **实际等过** 的调度上推进（delayMs > 0），
	* 普通 post-acquire 命中→立即补的路径不污染计数。一次 spawn 成功
	* （waitSocketReady 通过）即把计数归零。stopped 时直接放弃。
	*
	* 容量不变量：只有 idle/spawning entry 占用可领取池容量，activated entry
	* 已绑定会话、不计入 poolSize。每次调度和 timer 真正触发时都重新检查容量：
	* 前者避免同一失败路径重复排 timer/推进退避，后者合并多个并发 timer，
	* 保证最多只有 poolSize 个 idle/spawning replacement。
	*/
	scheduleReplenish(reason, opts) {
		if (!this.hasReplenishCapacity()) return;
		this.pendingReplenishments += 1;
		const minDelay = opts?.minDelayMs ?? 0;
		const delayMs = Math.max(this.replenishBackoffMs, minDelay);
		if (delayMs > 0) this.replenishBackoffMs = this.replenishBackoffMs === 0 ? REPLENISH_BACKOFF_BASE_MS : Math.min(this.replenishBackoffMs * 2, REPLENISH_BACKOFF_MAX_MS);
		const fire = () => {
			this.pendingReplenishments = Math.max(0, this.pendingReplenishments - 1);
			if (!this.hasReplenishCapacity()) return;
			this.spawnEntry().catch((err) => {
				this.log("warn", `replenish spawn failed (${reason}): ${String(err?.message ?? err)}`);
			});
		};
		if (delayMs <= 0) fire();
		else {
			this.log("warn", `replenish scheduled in ${delayMs}ms (${reason})`);
			setTimeout(fire, delayMs).unref?.();
		}
	}
	hasReplenishCapacity() {
		if (this.stopped || this.deps.poolSize <= 0) return false;
		return this.entries.filter((entry) => !entry.discarded && (entry.status === "idle" || entry.status === "spawning")).length + this.pendingReplenishments < this.deps.poolSize;
	}
	async sendActivate(socketPath, body) {
		return sendIpcLine(socketPath, {
			cmd: "activate",
			...body
		}, this.deps.activateReadyTimeoutMs ?? ACTIVATE_READY_TIMEOUT_MS);
	}
	/**
	* 用 ping 探活，每 PING_INTERVAL_MS 一轮，到 SOCKET_READY_TIMEOUT_MS 总超时。
	*
	* 任意一轮 ping 拿到 `ok: true` 即视为 ready，立即返回 true——首次 ping
	* 就过的快路径不会等满 ping 间隔。
	*
	* 失败语义：单次 ping 抛错（ENOENT/ECONNREFUSED/timeout）只算"还没 listen"，
	* 等 PING_INTERVAL_MS 后再试，直到总超时；总超时仍未 ok 才返回 false。
	*
	* 默认值按平台分档（见 SOCKET_READY_TIMEOUT_MS_*）；deps 可注入覆盖（仅
	* 单测用）。
	*/
	async waitSocketReady(socketPath) {
		const totalTimeoutMs = this.deps.socketReadyTimeoutMs ?? (process.platform === "win32" ? SOCKET_READY_TIMEOUT_MS_WIN : SOCKET_READY_TIMEOUT_MS_POSIX);
		const intervalMs = this.deps.socketReadyPingIntervalMs ?? PING_INTERVAL_MS;
		const deadline = Date.now() + totalTimeoutMs;
		do {
			try {
				const res = await sendIpcLine(socketPath, { cmd: "ping" }, IPC_TIMEOUT_MS);
				if (res && res.ok) return true;
			} catch {}
			const remainingMs = deadline - Date.now();
			if (remainingMs <= 0) break;
			await delay(Math.min(intervalMs, remainingMs));
		} while (Date.now() < deadline);
		return false;
	}
	removeEntry(entry) {
		this.clearHealthProbe(entry);
		const idx = this.entries.indexOf(entry);
		if (idx >= 0) this.entries.splice(idx, 1);
	}
	async terminateChild(child) {
		const pid = child?.pid;
		try {
			if (!child || child.killed || child.exitCode !== null) return;
			await new Promise((resolve) => {
				const timer = setTimeout(() => {
					try {
						child.kill("SIGKILL");
					} catch {}
					resolve();
				}, KILL_GRACEFUL_MS);
				timer.unref?.();
				child.once("exit", () => {
					clearTimeout(timer);
					resolve();
				});
				try {
					child.kill("SIGTERM");
				} catch {
					resolve();
				}
			});
		} finally {
			this.tryUnlinkPidFile(pid);
		}
	}
	/**
	* 按 pid 删除子进程写入的 pid 文件（`<sessionsDir>/<pid>.json`）。
	*
	* 使用 unlinkSync：文件本身极小且极少（poolSize=1 → 只有 1 个），同步删也
	* <1ms；换来的是 `stop()` 返回时磁盘状态已定，测试断言可靠。ENOENT / 权限
	* 错误一律忽略——文件已被子进程自清（POSIX 常见路径）或首次 stop 时压根
	* 没写成功，都不该阻塞退出流程。
	*
	* pid 校验（正整数）防御未来 spawn 失败前调用——ENOENT 就算了，`unlink(NaN)`
	* 会抛不同的错，不吞会污染诊断信号。
	*/
	tryUnlinkPidFile(pid) {
		if (!pid || !Number.isInteger(pid) || pid <= 0) return;
		const pidFile = (0, node_path.join)(this.resolveSessionsDir(), `${pid}.json`);
		try {
			(0, node_fs.unlinkSync)(pidFile);
		} catch {}
	}
	/**
	* 解析子进程 pid 文件所在的 sessions 目录。
	*
	* 优先级见 CliPrewarmPoolDependencies.sessionsDir 注释——与 `bin/wb-prewarm`
	* 完全一致，保证 daemon 侧 unlink 的路径与子进程 register 的路径匹配。
	*/
	resolveSessionsDir() {
		if (this.deps.sessionsDir) return this.deps.sessionsDir;
		const cbc = process.env.CODEBUDDY_CONFIG_DIR;
		const wb = process.env.WORKBUDDY_CONFIG_DIR;
		return (0, node_path.join)(cbc && cbc.trim() !== "" ? cbc : wb && wb.trim() !== "" ? wb : (0, node_path.join)((0, node_os.homedir)(), ".workbuddy"), "sessions");
	}
	log(level, msg) {
		(this.deps.logger ?? console)[level](`${TAG} ${msg}`);
	}
};
var PREWARM_ADDRESS_PREFIX = "codebuddy-prewarm-";
function resolvePrewarmIpcPath(prewarmId) {
	const address = `${PREWARM_ADDRESS_PREFIX}${prewarmId}`;
	if (process.platform === "win32") return `\\\\.\\pipe\\${address}`;
	return `/tmp/${address}.sock`;
}
function validateActivateReadyResponse(response, expected) {
	if (response.ok !== true || response.cmd !== "activate" || response.status !== "active") {
		const error = typeof response.error === "string" ? ` error=${response.error}` : "";
		throw new Error(`invalid prewarm activate ready ACK: ok=${String(response.ok)} cmd=${String(response.cmd)} status=${String(response.status)}${error}`);
	}
	if (response.pid !== expected.expectedPid) throw new Error(`prewarm activate ready ACK pid mismatch: expected=${expected.expectedPid} actual=${String(response.pid)}`);
	if (response.sessionId !== expected.expectedSessionId) throw new Error(`prewarm activate ready ACK session mismatch: expected=${expected.expectedSessionId} actual=${String(response.sessionId)}`);
	if (typeof response.endpoint !== "string") throw new Error("prewarm activate ready ACK is missing endpoint");
	let endpoint;
	try {
		endpoint = new URL(response.endpoint);
	} catch {
		throw new Error(`invalid prewarm activate ready ACK endpoint: ${response.endpoint}`);
	}
	const port = Number(endpoint.port);
	if (endpoint.protocol !== "http:" || endpoint.hostname !== "127.0.0.1" || !Number.isInteger(port) || port < 1 || port > 65535 || endpoint.pathname !== "/api/v1/acp" || endpoint.search || endpoint.hash) throw new Error(`invalid prewarm activate ready ACK endpoint: ${response.endpoint}`);
}
function sendIpcLine(socketPath, payload, timeoutMs) {
	return new Promise((resolve, reject) => {
		let buf = "";
		let settled = false;
		const finish = (fn) => {
			if (settled) return;
			settled = true;
			try {
				sock.destroy();
			} catch {}
			clearTimeout(timer);
			fn();
		};
		const sock = (0, node_net.connect)(socketPath);
		const timer = setTimeout(() => finish(() => reject(/* @__PURE__ */ new Error(`prewarm IPC timeout: ${socketPath}`))), timeoutMs);
		timer.unref?.();
		sock.once("connect", () => {
			try {
				sock.write(JSON.stringify(payload) + "\n");
			} catch (err) {
				finish(() => reject(err));
			}
		});
		sock.on("data", (chunk) => {
			buf += String(chunk);
			const nl = buf.indexOf("\n");
			if (nl >= 0) {
				const line = buf.slice(0, nl);
				try {
					const parsed = JSON.parse(line);
					finish(() => resolve(parsed));
				} catch (err) {
					finish(() => reject(err));
				}
			}
		});
		sock.on("error", (err) => finish(() => reject(err)));
		sock.on("close", () => finish(() => reject(/* @__PURE__ */ new Error(`prewarm IPC closed before response: ${socketPath}`))));
	});
}
function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms).unref?.();
	});
}
// END ORIGINAL
return {ENABLED,DISABLED,TEAM_EXPERT_TYPE,resolveAgentTeamsEnv,AGENT_TEAMS_ENV_KEY,TAG,IPC_TIMEOUT_MS,ACTIVATE_READY_TIMEOUT_MS,KILL_GRACEFUL_MS,PING_INTERVAL_MS,SOCKET_READY_TIMEOUT_MS_WIN,SOCKET_READY_TIMEOUT_MS_POSIX,REPLENISH_BACKOFF_BASE_MS,REPLENISH_BACKOFF_MAX_MS,HEALTH_PROBE_FIRST_DELAY_MS,HEALTH_PROBE_INTERVAL_MS,HEALTH_PROBE_TIMEOUT_MS,STDERR_TAIL_MAX_LINES,STDERR_TAIL_MAX_LINE_BYTES,cliChildCrashWatcher,bindCliChildCrashWatcher,PER_SESSION_ENV_KEYS,PER_SESSION_ENV_SUFFIXES,MUTUALLY_EXCLUSIVE_ENV_GROUPS,resolveCurrentProductConfigEnv,applyCurrentProductConfigEnv,isWhitelistedSessionEnvKey,managedEnvMismatchKeys,CliPrewarmPool,PREWARM_ADDRESS_PREFIX,resolvePrewarmIpcPath,validateActivateReadyResponse,sendIpcLine,delay};
}
