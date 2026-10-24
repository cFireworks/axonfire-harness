// @ts-nocheck
// Original backend methods; bind to the owning backend instance before calling.
export const RUNTIME_ACQUISITION_SOURCE={"file":"initialize.js","sha256":"528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19","regions":[{"name":"TAG","from":5435448,"to":5435483,"method":false},{"name":"buildPrewarmActivateArgs","from":5495667,"to":5495948,"method":false},{"name":"summarizePrewarmArgs","from":5496840,"to":5497408,"method":false},{"name":"acquireRuntime","from":5464017,"to":5465558,"method":true},{"name":"killRuntimeSession","from":5465791,"to":5466420,"method":true}]} as const;
export function createNativeRuntimeAcquisition(runtime:any):any {
const sidecarLog=runtime.logger;
// BEGIN ORIGINAL
var TAG = "[CodeBuddyCodeBackend]";
function buildPrewarmActivateArgs(coldStartArgs, port) {
	const out = [
		...coldStartArgs.slice(1),
		"--port",
		String(port)
	];
	const hasPort = out.includes("--port");
	const hasServe = out.includes("--serve");
	if (hasPort && !hasServe) out.unshift("--serve");
	return out;
}
function summarizePrewarmArgs(args) {
	const sensitiveValueFlags = new Set([
		"--system-prompt",
		"--append-system-prompt",
		"--settings"
	]);
	const out = [];
	for (let i = 0; i < args.length; i++) {
		const tok = args[i];
		if (!tok.startsWith("-")) {
			out.push(`<positional:${tok}>`);
			continue;
		}
		const next = args[i + 1];
		if (next === void 0 || next.startsWith("-")) {
			out.push(tok);
			continue;
		}
		if (sensitiveValueFlags.has(tok)) out.push(`${tok}=<len=${next.length}>`);
		else out.push(`${tok}=${next}`);
		i++;
	}
	return out.join(" ");
}
return { async acquireRuntime(params, sessionDeltaEnv, trustedSessionEnvKeys = /* @__PURE__ */ new Set()) {
		const pool = this.dependencies.cliPrewarmPool;
		if (pool && !this.isBackgroundAutomation) {
			const acquired = pool.tryAcquire(sessionDeltaEnv, params.env, trustedSessionEnvKeys);
			if (acquired) {
				const activateArgs = buildPrewarmActivateArgs(params.args ?? [], 0);
				sidecarLog.info(`${TAG} [Prewarm] activate request: sessionId=${this.sessionId} cwd=${params.cwd} envKeys=[${Object.keys(sessionDeltaEnv).join(",")}] argsSummary=${summarizePrewarmArgs(activateArgs)}`);
				try {
					const activated = await acquired.activate({
						cwd: params.cwd,
						args: activateArgs,
						sessionId: this.sessionId
					});
					if (this.destroyed) {
						await pool.killSession(this.sessionId).catch(() => {});
						throw new Error(`${TAG} Session "${this.sessionId}" destroyed during prewarm activate`);
					}
					this.prewarmActivated = true;
					return { acpEndpoint: activated.acpEndpoint };
				} catch (err) {
					if (this.destroyed) throw err;
					sidecarLog.warn(`${TAG} prewarm acquire/activate failed, falling back to cold start: ${err instanceof Error ? err.message : String(err)}`);
				}
			}
		}
		const handle = await this.runtimeManager.createSession(params);
		if (this.destroyed) {
			await this.runtimeManager.killSession(this.sessionId).catch(() => {});
			throw new Error(`${TAG} Session "${this.sessionId}" destroyed during cold-start createSession`);
		}
		return { acpEndpoint: handle.acpEndpoint };
	},
async killRuntimeSession() {
		const pool = this.dependencies.cliPrewarmPool;
		if (this.prewarmActivated && pool) try {
			const handled = await pool.killSession(this.sessionId);
			this.prewarmActivated = false;
			if (handled) {
				this.runtimeEverStarted = false;
				return;
			}
		} catch (err) {
			this.dependencies.logger?.warn?.(`${TAG} killRuntimeSession via pool failed for sessionId="${this.sessionId}"`, { error: err instanceof Error ? err.message : String(err) });
			this.prewarmActivated = false;
		}
		await this.runtimeManager.killSession(this.sessionId).catch(() => {});
		this.runtimeEverStarted = false;
	}, buildPrewarmActivateArgs, summarizePrewarmArgs };
// END ORIGINAL
}
