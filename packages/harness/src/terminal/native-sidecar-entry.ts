// @ts-nocheck
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import {createNativeSidecar} from './native-sidecar.js';
import {createNativeSidecarCrashWriter} from './native-sidecar-crash-writer.js';
export const ENTRY_SOURCE={"file":"sidecar-entry.js","sha256":"c7428bd733e1f864fd609a105806b4d6fec19557f20fc0dce98f99d365fc9b2b","regions":[{"from":36176,"to":36790},{"from":36791,"to":37032},{"from":37033,"to":37306}],"names":["installSidecarCrashWriter","parseToken","main"]} as const;
export function createNativeSidecarEntry(runtime:any={}):any {
const process=runtime.process ?? globalThis.process,console=runtime.console ?? globalThis.console;
const node_path=nodePath;
const {SidecarServer,bindSessionCrashReporter}=runtime.sidecar ?? createNativeSidecar(runtime);
const require_crash_reporter=runtime.crashWriter ?? createNativeSidecarCrashWriter({process});
// BEGIN ORIGINAL
function installSidecarCrashWriter() {
	try {
		const configDir = process.env.WORKBUDDY_CONFIG_DIR;
		if (!configDir) return;
		const handle = require_crash_reporter.installCrashWriter({
			logsDir: node_path.join(configDir, "logs"),
			processName: "sidecar",
			appVersion: process.env.WORKBUDDY_APP_VERSION ?? ""
		});
		bindSessionCrashReporter(({ exitCode, signal, name }) => {
			handle.write({
				type: "child_process_crash",
				childProcess: {
					processType: "spawned",
					reason: signal !== void 0 ? `signal:${signal}` : `exit:${exitCode}`,
					exitCode,
					name
				}
			});
		});
	} catch {}
}
function parseToken() {
	const idx = process.argv.indexOf("--token");
	if (idx === -1 || idx + 1 >= process.argv.length) {
		console.error("[Sidecar] Missing required --token argument");
		process.exit(1);
	}
	return process.argv[idx + 1];
}
async function main() {
	installSidecarCrashWriter();
	const server = new SidecarServer(parseToken());
	const onSignal = () => {
		server.shutdown().then(() => process.exit(0));
	};
	process.on("SIGTERM", onSignal);
	process.on("SIGINT", onSignal);
	await server.start();
}
// END ORIGINAL
return {installSidecarCrashWriter,parseToken,main};
}
