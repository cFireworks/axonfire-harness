// @ts-nocheck
// Complete original AppServer stop method with its existing closure dependencies.
export const APP_SERVER_STOP_SOURCE={"file":"initialize.js","sha256":"528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19","from":5755052,"to":5755596} as const;
export function createNativeAppServerStop(runtime:any):any {
const {pluginRecommendationRegistry,sessionRuntimeHandleRef,sessionEventsHandle,edgeSyncInstallDispose,powerManager,appServerServices,bootstrapInstance,runtimeManager,cliPrewarmPool}=runtime;
return {async stop() {
			pluginRecommendationRegistry.cancelAll("daemon stopped");
			sessionRuntimeHandleRef.current?.stop();
			sessionEventsHandle?.dispose();
			try {
				edgeSyncInstallDispose?.();
			} catch {}
			powerManager.cleanup();
			await appServerServices.docsService.dispose?.();
			await (await bootstrapInstance.handlerDeps.hostServices?.catch(() => void 0))?.memory.dispose?.();
			await bootstrapInstance.stop().catch(() => {});
			await runtimeManager.onStop().catch(() => {});
			await cliPrewarmPool?.stop().catch(() => {});
		}};
}
