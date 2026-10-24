// @ts-nocheck
// Executable daemon entry. Library imports use native-sidecar-entry instead.
import {createNativeSidecarEntry} from './native-sidecar-entry.js';
const {main}=createNativeSidecarEntry();
main().catch((err) => {
	console.error("[Sidecar] Fatal error:", err);
	process.exit(1);
});
