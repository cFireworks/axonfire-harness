// @ts-nocheck
// Original declarations and selected dependency initializers retained verbatim.
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import * as nodeOs from 'node:os';
export const SERVICE_SOURCE={"sources":[{"file":"logger.js","sha256":"f577eeddc6b62df9f80d6324f5d61daf69a415069289d5fe469ffb00b8397af7"}],"segments":[{"file":"logger.js","from":63,"to":312},{"file":"logger.js","from":313,"to":356},{"file":"logger.js","from":357,"to":453},{"file":"logger.js","from":454,"to":510},{"file":"logger.js","from":511,"to":720},{"file":"logger.js","from":721,"to":1256},{"file":"logger.js","from":1257,"to":1474}],"names":["consoleWorkbuddyLogger","currentLogger","configureWorkbuddyLogger","getWorkbuddyLogger","createWorkbuddyScopedLogger","normalizeLogger","logWithFallback"]} as const;
export function createNativeSidecarLogger(runtime:any={}):any {
const process=runtime.process ?? globalThis.process, console=runtime.console ?? globalThis.console;

// BEGIN ORIGINAL
var consoleWorkbuddyLogger = {
	debug: (...args) => console.debug(...args),
	info: (...args) => console.info(...args),
	warn: (...args) => console.warn(...args),
	error: (...args) => console.error(...args),
	log: (...args) => console.log(...args)
};
var currentLogger = consoleWorkbuddyLogger;
function configureWorkbuddyLogger(logger) {
	currentLogger = logger ?? consoleWorkbuddyLogger;
}
function getWorkbuddyLogger() {
	return currentLogger;
}
function createWorkbuddyScopedLogger(scope) {
	const logger = getWorkbuddyLogger();
	const scoped = logger.scope?.(scope);
	if (scoped) return normalizeLogger(scoped);
	return normalizeLogger(logger, scope);
}
function normalizeLogger(logger, scope) {
	const prefix = scope ? `[${scope}]` : void 0;
	return {
		debug: (message, ...args) => logWithFallback(logger, "debug", prefix, message, args),
		info: (message, ...args) => logWithFallback(logger, "info", prefix, message, args),
		warn: (message, ...args) => logWithFallback(logger, "warn", prefix, message, args),
		error: (message, ...args) => logWithFallback(logger, "error", prefix, message, args),
		log: (message, ...args) => logWithFallback(logger, "log", prefix, message, args)
	};
}
function logWithFallback(logger, level, prefix, message, args) {
	(logger[level] ?? logger.info ?? consoleWorkbuddyLogger[level] ?? consoleWorkbuddyLogger.info)?.(prefix ? `${prefix} ${message}` : message, ...args);
}
// END ORIGINAL
return {consoleWorkbuddyLogger,currentLogger,configureWorkbuddyLogger,getWorkbuddyLogger,createWorkbuddyScopedLogger,normalizeLogger,logWithFallback};
}
