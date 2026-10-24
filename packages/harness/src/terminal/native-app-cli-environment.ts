// @ts-nocheck
import * as nodeOs from 'node:os';
import * as nodePath from 'node:path';
import {createNativeSidecarManager} from './native-sidecar-manager.js';
import {createNativeSidecarClientInfo} from './native-sidecar-client-info.js';
import {createNativeSidecarCliProductEnvironment} from './native-sidecar-cli-product-env.js';
import {createNativeSidecarLogger} from './native-sidecar-logger.js';
export const APP_CLI_ENVIRONMENT_SOURCE={"file":"initialize.js","sha256":"528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19","regions":[{"name":"resolveWorkbuddyAppServerCodeCliPath","from":3466102,"to":3466910},{"name":"buildWorkbuddyAppServerCodeCliEnv","from":3467290,"to":3469320},{"name":"warn","from":3469321,"to":3469582}]} as const;
export function createNativeAppCliEnvironment(runtime:any={}):any {
const process=runtime.process??globalThis.process;
const node_os=runtime.os??nodeOs,node_path=nodePath;
const require_cli_prewarm_pool=runtime.runtimeHelpers??createNativeSidecarManager({process,gateway:runtime.gateway});
const require_cli_product_env=runtime.productEnv??createNativeSidecarCliProductEnvironment({process});
const require_client_info_env=runtime.clientInfo??createNativeSidecarClientInfo({process});
const require_logger$1=runtime.loggerModule??createNativeSidecarLogger();
// BEGIN ORIGINAL
function resolveWorkbuddyAppServerCodeCliPath(options) {
	const bundled = options.adapters.resolveBundledAsset("cli", "bin", "codebuddy") ?? options.adapters.resolveBundledAsset("cli", "dist", "codebuddy.js");
	const envPath = process.env.CODEBUDDY_CODE_PATH;
	const resolution = require_cli_prewarm_pool.resolveAgentCliExecutablePath({
		bundledCliPaths: [bundled],
		envCliPath: envPath
	});
	if (resolution?.source === "env") warn(options.celljs.logger, `[CodeBuddyCodeBackend] resolveCLIPath: bundled CLI not found, falling back to CODEBUDDY_CODE_PATH=${envPath}`);
	if (resolution) return resolution.path;
	throw new Error("CLI not found.\n\nSearched:\n  - cli/bin/codebuddy\n  - cli/dist/codebuddy.js\n" + (envPath ? `  - CODEBUDDY_CODE_PATH: ${envPath}\n` : "") + "\nRun: node scripts/copy-cli.js");
}
function buildWorkbuddyAppServerCodeCliEnv(options, extra) {
	const productEnv = require_cli_product_env.resolveAgentCliProductEnv({
		processEnv: process.env,
		fallbackProductConfigEnv: process.env.ACC_PRODUCT_CONFIG_V3 ? void 0 : options.adapters.getBootstrapProductConfigEnv()
	});
	const localRuntimePathOptions = {
		homeDir: node_os.homedir(),
		platform: process.platform
	};
	return require_cli_prewarm_pool.buildAgentCliRuntimeEnv({
		configDir: options.platform.configDir,
		userDataDir: options.platform.dataDir,
		builtinSkillsDir: require_cli_prewarm_pool.normalizeAgentCliBuiltinSkillsDir(options.adapters.requireBundledAsset("plugins", "workbuddy-builtin", "skills")),
		productConfigEnv: productEnv.productConfigEnv,
		productConfigPathEnv: productEnv.productConfigPathEnv,
		hostedCliInternetEnv: productEnv.hostedCliInternetEnv,
		clientInfoEnv: require_client_info_env.buildWorkbuddyClientInfoEnv({
			getAppVersion: () => options.platform.appVersion,
			resolveBundledAsset: options.adapters.resolveBundledAsset
		}),
		pluginDirs: require_cli_prewarm_pool.listAgentCliEnabledPluginDirs(options.platform.configDir).join(node_path.delimiter),
		proxyEnv: options.adapters.getProcessProxyEnv?.(),
		cliConnectorBin: require_cli_prewarm_pool.resolveAgentCliConnectorBin(localRuntimePathOptions),
		pythonConnectorEnvBin: require_cli_prewarm_pool.resolveAgentCliPythonEnvBin(localRuntimePathOptions),
		managedNodeBinDirs: require_cli_prewarm_pool.listAgentCliManagedBinDirs({
			...localRuntimePathOptions,
			binaryType: "node"
		}),
		managedPythonBinDirs: require_cli_prewarm_pool.listAgentCliManagedBinDirs({
			...localRuntimePathOptions,
			binaryType: "python"
		}),
		bundledRuntimeConfig: require_cli_prewarm_pool.readAgentCliBundledRuntimeConfig(options.platform.dataDir),
		registeredBinaryTypes: options.adapters.getRegisteredBinaryTypes(),
		processEnv: process.env,
		pathDelimiter: node_path.delimiter,
		extra: {
			WORKBUDDY_NODE_ENV: process.env.NODE_ENV ?? "production",
			...extra
		}
	});
}
function warn(logger, message) {
	if (logger && typeof logger === "object" && "warn" in logger && typeof logger.warn === "function") {
		logger.warn(message);
		return;
	}
	require_logger$1.createWorkbuddyScopedLogger("app-server-code-backend").warn(message);
}
// END ORIGINAL
return {resolveWorkbuddyAppServerCodeCliPath,buildWorkbuddyAppServerCodeCliEnv,warn};
}
