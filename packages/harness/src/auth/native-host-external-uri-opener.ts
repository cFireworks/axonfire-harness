// @ts-nocheck
// Original WorkBuddy host opener; the application supplies its browser delegate.
import { Subject } from 'rxjs';
export const HOST_EXTERNAL_URI_OPENER_SOURCE={"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78","regions":[{"from":1941973,"to":1942047},{"from":1942048,"to":1942085},{"from":1942086,"to":1942292},{"from":1942293,"to":1942397},{"from":1942398,"to":1942815}]} as const;
export function createNativeHostExternalUriOpener(runtime:any={}){
const require_common$2={Subject};
const process=runtime.process??globalThis.process,console=runtime.console??globalThis.console;
var MOCK_OPEN_EXTERNAL_REJECT_ENV = "WORKBUDDY_MOCK_OPEN_EXTERNAL_REJECT";
var workbuddyExternalUriOpenDelegate;
async function openExternalWithLocalMock(uri) {
	if (process.env[MOCK_OPEN_EXTERNAL_REJECT_ENV] === "1") throw new Error("mock shell.openExternal reject");
	return workbuddyExternalUriOpenDelegate?.(uri);
}
function setWorkbuddyExternalUriOpenDelegate(delegate) {
	workbuddyExternalUriOpenDelegate = delegate;
}
var WorkbuddyHostExternalUriOpener = class WorkbuddyHostExternalUriOpener {
	urlSubject = new require_common$2.Subject();
	async open(uri) {
		if (!workbuddyExternalUriOpenDelegate) return false;
		this.urlSubject.next(uri);
		try {
			if (await openExternalWithLocalMock(uri) === false) console.warn(`[WorkbuddyHostExternalUriOpener] shell.openExternal returned false for: ${uri}`);
		} catch {}
		return true;
	}
};
return {WorkbuddyHostExternalUriOpener,setWorkbuddyExternalUriOpenDelegate,openExternalWithLocalMock};
}
