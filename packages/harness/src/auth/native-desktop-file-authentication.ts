// @ts-nocheck
// Complete original file storage; outer Node/RxJS and DI bindings only.
import * as nodeFs from 'node:fs';import * as nodePath from 'node:path';import * as nodeCrypto from 'node:crypto';import {Subject} from 'rxjs';
export const DESKTOP_FILE_AUTHENTICATION_SOURCE=[{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":2539779,"to":2539863},{"from":2541597,"to":2542086}]},{"file":"file-authentication-storage.js","sha256":"0c16be22a7b4b6873e6d56febc2a1931b3150fbf0bca436fa26a915be452b8bb","regions":[{"from":525,"to":589},{"from":590,"to":718},{"from":719,"to":861},{"from":1352,"to":1391},{"from":1392,"to":1500},{"from":1501,"to":18364}]}] as const;
export function createNativeDesktopFileAuthentication(runtime:any={}){
const fs=runtime.fs??nodeFs,path=nodePath,node_crypto=runtime.crypto??nodeCrypto,process=runtime.process??globalThis.process,Date=runtime.Date??globalThis.Date,setTimeout=runtime.setTimeout??globalThis.setTimeout,clearTimeout=runtime.clearTimeout??globalThis.clearTimeout;
var AuthenticationStoragePriority,_FileAuthenticationStorage;
function getLogoutMarkerPath(authFilePath) {
	return `${authFilePath}.logged-out`;
}
AuthenticationStoragePriority = /* @__PURE__ */ function(AuthenticationStoragePriority) {
		AuthenticationStoragePriority[AuthenticationStoragePriority["Disabled"] = 0] = "Disabled";
		AuthenticationStoragePriority[AuthenticationStoragePriority["Low"] = 1] = "Low";
		AuthenticationStoragePriority[AuthenticationStoragePriority["Normal"] = 5] = "Normal";
		AuthenticationStoragePriority[AuthenticationStoragePriority["Heigh"] = 9] = "Heigh";
		return AuthenticationStoragePriority;
	}({});
const require_common$1={Subject,getLogoutMarkerPath,AuthenticationStoragePriority};
var workbuddyAuthenticationConfigurationProvider = () => void 0;
function setWorkbuddyAuthenticationConfigurationProvider(provider) {
	workbuddyAuthenticationConfigurationProvider = provider;
}
function getWorkbuddyAuthenticationConfiguration() {
	try {
		return workbuddyAuthenticationConfigurationProvider();
	} catch {
		return;
	}
}
var workbuddyLegacyAuthSessionMigrator;
function setWorkbuddyLegacyAuthSessionMigrator(migrator) {
	workbuddyLegacyAuthSessionMigrator = migrator;
}
var FileAuthenticationStorage = class FileAuthenticationStorage {
	static {
		_FileAuthenticationStorage = this;
	}
	static IS_WRITING_HOLD_MS = 300;
	static UNLINK_CONFIRM_DELAY_MS = 500;
	static WATCHER_RETRY_INITIAL_DELAY_MS = 250;
	static WATCHER_RETRY_MAX_DELAY_MS = 3e4;
	static WATCHER_STABLE_RESET_MS = 3e4;
	logger;
	filePathService;
	productManager;
	storeSessionSubject = new require_common$1.Subject();
	watcher = null;
	watcherRetryTimer = null;
	watcherStableTimer = null;
	watcherRetryDelayMs = _FileAuthenticationStorage.WATCHER_RETRY_INITIAL_DELAY_MS;
	session;
	isWriting = false;
	isWritingTimer = null;
	pendingUnlinkTimer = null;
	pendingExternalReconcile = false;
	disposed = false;
	init() {
		this.logger.setContext("FileAuthenticationStorage");
		this.initializeWatcher().catch((error) => {
			if (!this.disposed) this.logger.warn(`Failed to initialize watcher: ${error}`);
		});
	}
	async priority() {
		return require_common$1.AuthenticationStoragePriority.Normal + 1;
	}
	async store(session, options) {
		const filePath = await this.getAuthSavePath();
		if (this.disposed) return;
		let tempFile;
		const serializedSession = JSON.stringify(session, null, 2);
		try {
			this.beginWriting();
			const dir = path.dirname(filePath);
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
			if (options?.preserveLogoutMarker && this.hasLogoutMarker(filePath)) {
				this.setSessionAndEmit(void 0);
				return;
			}
			tempFile = `${filePath}.${process.pid}.${(0, node_crypto.randomUUID)()}.tmp`;
			fs.writeFileSync(tempFile, serializedSession, "utf-8");
			if (options?.preserveLogoutMarker && this.hasLogoutMarker(filePath)) {
				this.setSessionAndEmit(void 0);
				return;
			}
			fs.renameSync(tempFile, filePath);
			tempFile = void 0;
			if (!options?.preserveLogoutMarker) this.retireLogoutMarker(filePath);
			if (this.hasLogoutMarker(filePath)) {
				this.setSessionAndEmit(void 0);
				return;
			}
			if (!this.ensureSerializedSession(filePath, serializedSession) || this.hasLogoutMarker(filePath)) {
				await this.restore();
				return;
			}
			if (this.disposed) return;
			this.session = session;
			const stackTrace = (/* @__PURE__ */ new Error("store stack")).stack?.split("\n").slice(1, 6).join("\n");
			this.logger.info(`Stored auth session to file, userId: ${session?.account?.uid}\n${stackTrace}`);
			this.emitSession(session);
		} catch (error) {
			this.logger.error(`Failed to store auth: ${error}`);
			throw error;
		} finally {
			if (tempFile && fs.existsSync(tempFile)) try {
				fs.unlinkSync(tempFile);
			} catch {}
			this.endWritingDeferred();
		}
	}
	async restore() {
		const filePath = await this.getAuthSavePath();
		if (this.disposed) return;
		try {
			if (this.hasLogoutMarker(filePath)) {
				this.logger.info("Auth logout marker found, ignoring stored session");
				this.setSessionAndEmit(void 0);
				return;
			}
			if (!fs.existsSync(filePath)) {
				await this.migrateLegacySession();
				if (this.disposed) return;
			}
			if (this.hasLogoutMarker(filePath)) {
				this.logger.info("Auth logout marker found after migration, ignoring stored session");
				this.setSessionAndEmit(void 0);
				return;
			}
			if (!fs.existsSync(filePath)) {
				this.logger.info("No auth file found, no existing session");
				this.emitSession(void 0);
				return;
			}
			const content = fs.readFileSync(filePath, "utf-8");
			this.session = JSON.parse(content);
			this.logger.info(`Restored auth session from file, userId: ${this.session?.account?.uid}`);
			this.emitSession(this.session);
			return this.session;
		} catch (error) {
			if (this.disposed) return;
			this.logger.warn(`Failed to restore auth: ${error}`);
			this.setSessionAndEmit(void 0);
			return;
		}
	}
	async beginLogout() {
		const filePath = await this.getAuthSavePath();
		if (this.disposed) return;
		const logoutToken = (0, node_crypto.randomUUID)();
		try {
			this.beginWriting();
			this.writeLogoutMarker(filePath, logoutToken);
			this.setSessionAndEmit(void 0);
			return logoutToken;
		} catch (error) {
			this.logger.warn(`Failed to publish logout marker: ${error}`);
			return;
		} finally {
			this.endWritingDeferred();
		}
	}
	async clean(options) {
		const filePath = await this.getAuthSavePath();
		if (this.disposed) return false;
		const logoutToken = options?.logoutToken;
		if (logoutToken && !this.ownsLogoutMarker(filePath, logoutToken)) {
			await this.restore();
			return false;
		}
		let backupFile;
		let superseded = false;
		try {
			this.beginWriting();
			if (fs.existsSync(filePath)) {
				const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
				const dir = path.dirname(filePath);
				const ext = path.extname(filePath);
				const basename = path.basename(filePath, ext);
				backupFile = path.join(dir, `${basename}.${timestamp}.${process.pid}.${(0, node_crypto.randomUUID)()}${ext}`);
				fs.renameSync(filePath, backupFile);
				this.logger.info(`Auth file backed up to: ${backupFile}`);
			}
			if (logoutToken && !this.ownsLogoutMarker(filePath, logoutToken)) superseded = true;
			else if (!logoutToken) this.writeLogoutMarker(filePath);
		} catch (error) {
			this.logger.warn(`Failed to clean auth: ${error}`);
			superseded = true;
		} finally {
			this.endWritingDeferred();
		}
		if (superseded) {
			if (backupFile) try {
				this.restoreBackupIfAbsent(backupFile, filePath);
			} catch (error) {
				this.logger.warn(`Failed to restore auth backup: ${error}`);
			}
			await this.restore();
			return false;
		}
		this.setSessionAndEmit(void 0);
		return true;
	}
	async initializeWatcher() {
		if (this.disposed || this.watcher) return;
		try {
			const filePath = await this.getAuthSavePath();
			if (this.disposed || this.watcher) return;
			const directory = path.dirname(filePath);
			const filename = path.basename(filePath);
			const markerFilename = path.basename(require_common$1.getLogoutMarkerPath(filePath));
			fs.mkdirSync(directory, { recursive: true });
			const watcher = this.createDirectoryWatcher(directory, (_eventType, changedFilename) => {
				const changed = changedFilename === null ? null : String(changedFilename);
				if (changed !== null && changed !== filename && changed !== markerFilename) return;
				this.handleWatcherEvent();
			});
			watcher.on("error", (error) => {
				if (this.watcher !== watcher || this.disposed) return;
				this.logger.warn(`Watcher error: ${error}`);
				this.clearWatcherStableTimer();
				this.watcher = null;
				watcher.close();
				this.scheduleWatcherRetry();
			});
			watcher.on("close", () => {
				if (this.watcher !== watcher || this.disposed) return;
				this.logger.warn("Watcher closed unexpectedly");
				this.clearWatcherStableTimer();
				this.watcher = null;
				this.scheduleWatcherRetry();
			});
			this.watcher = watcher;
			this.scheduleWatcherStableReset(watcher);
			this.logger.info("File watcher ready");
			this.reconcileExternalState().catch((error) => {
				if (!this.disposed) this.logger.warn(`Failed to reconcile auth state after watcher setup: ${error}`);
			});
		} catch (error) {
			if (!this.disposed) {
				this.logger.warn(`Failed to initialize watcher: ${error}`);
				this.scheduleWatcherRetry();
			}
		}
	}
	createDirectoryWatcher(directory, listener) {
		return fs.watch(directory, {
			encoding: "utf-8",
			persistent: false
		}, listener);
	}
	scheduleWatcherRetry() {
		if (this.disposed || this.watcherRetryTimer) return;
		const delay = this.watcherRetryDelayMs;
		this.watcherRetryDelayMs = Math.min(delay * 2, _FileAuthenticationStorage.WATCHER_RETRY_MAX_DELAY_MS);
		this.watcherRetryTimer = setTimeout(() => {
			this.watcherRetryTimer = null;
			this.initializeWatcher().catch((error) => {
				if (!this.disposed) this.logger.warn(`Failed to restart watcher: ${error}`);
			});
		}, delay);
		this.watcherRetryTimer.unref?.();
	}
	scheduleWatcherStableReset(watcher) {
		this.clearWatcherStableTimer();
		this.watcherStableTimer = setTimeout(() => {
			this.watcherStableTimer = null;
			if (this.watcher === watcher && !this.disposed) this.watcherRetryDelayMs = _FileAuthenticationStorage.WATCHER_RETRY_INITIAL_DELAY_MS;
		}, _FileAuthenticationStorage.WATCHER_STABLE_RESET_MS);
		this.watcherStableTimer.unref?.();
	}
	clearWatcherStableTimer() {
		if (this.watcherStableTimer) {
			clearTimeout(this.watcherStableTimer);
			this.watcherStableTimer = null;
		}
	}
	beginWriting() {
		if (this.disposed) return;
		this.isWriting = true;
		if (this.isWritingTimer) {
			clearTimeout(this.isWritingTimer);
			this.isWritingTimer = null;
		}
	}
	endWritingDeferred() {
		if (this.disposed) {
			this.isWriting = false;
			this.pendingExternalReconcile = false;
			return;
		}
		if (this.isWritingTimer) clearTimeout(this.isWritingTimer);
		this.isWritingTimer = setTimeout(() => {
			if (this.disposed) return;
			this.isWriting = false;
			this.isWritingTimer = null;
			if (this.pendingExternalReconcile) {
				this.pendingExternalReconcile = false;
				this.reconcileExternalState().catch((error) => {
					if (this.disposed) return;
					this.logger.warn(`Failed to reconcile deferred auth change: ${error}`);
				});
			}
		}, _FileAuthenticationStorage.IS_WRITING_HOLD_MS);
		this.isWritingTimer.unref?.();
	}
	handleWatcherEvent() {
		if (this.disposed) return;
		if (this.isWriting) {
			this.pendingExternalReconcile = true;
			return;
		}
		this.logger.info("Auth storage changed externally; reconciling");
		this.reconcileExternalState().catch((error) => {
			if (this.disposed) return;
			this.logger.warn(`Failed to reconcile external auth change: ${error}`);
		});
	}
	async reconcileExternalState() {
		if (this.disposed) return;
		const filePath = await this.getAuthSavePath();
		if (this.disposed) return;
		if (this.hasLogoutMarker(filePath)) {
			if (this.pendingUnlinkTimer) {
				clearTimeout(this.pendingUnlinkTimer);
				this.pendingUnlinkTimer = null;
			}
			this.setSessionAndEmit(void 0);
		} else if (fs.existsSync(filePath)) {
			await this.handleExternalChange();
			if (this.disposed) return;
		} else this.handleUnlinkExternally(filePath);
	}
	handleUnlinkExternally(filePath) {
		if (this.disposed) return;
		if (this.pendingUnlinkTimer) clearTimeout(this.pendingUnlinkTimer);
		const timer = setTimeout(() => {
			if (this.disposed) return;
			if (this.pendingUnlinkTimer === timer) this.pendingUnlinkTimer = null;
			try {
				if (fs.existsSync(filePath)) {
					this.logger.info("Auth file unlink superseded by re-create; ignoring");
					return;
				}
				if (this.hasLogoutMarker(filePath)) {
					this.logger.info("Auth file removed with logout marker; clearing session");
					this.setSessionAndEmit(void 0);
					return;
				}
				this.logger.warn("Auth file removed without logout marker; preserving in-memory session to avoid spurious logout (WB-44172)");
			} catch (error) {
				this.logger.warn(`Failed to confirm unlink event: ${error}`);
			}
		}, _FileAuthenticationStorage.UNLINK_CONFIRM_DELAY_MS);
		timer.unref?.();
		this.pendingUnlinkTimer = timer;
	}
	async handleExternalChange() {
		if (this.disposed) return;
		try {
			await this.restore();
			if (this.disposed) return;
			this.logger.info("External change applied to session");
		} catch (error) {
			if (this.disposed) return;
			this.logger.warn(`Failed to handle external change: ${error}`);
		}
	}
	async getAuthSavePath() {
		const authenticationId = getWorkbuddyAuthenticationConfiguration()?.id ?? this.productManager.configuration.getValue()?.authentication?.id ?? "auth";
		return path.join(this.filePathService.sharedDataPath, "auth", `${authenticationId}.info`);
	}
	hasLogoutMarker(filePath) {
		return fs.existsSync(require_common$1.getLogoutMarkerPath(filePath));
	}
	writeLogoutMarker(filePath, value = (/* @__PURE__ */ new Date()).toISOString()) {
		const markerPath = require_common$1.getLogoutMarkerPath(filePath);
		fs.mkdirSync(path.dirname(markerPath), { recursive: true });
		const tempMarkerPath = `${markerPath}.${process.pid}.${(0, node_crypto.randomUUID)()}.tmp`;
		try {
			fs.writeFileSync(tempMarkerPath, value, "utf-8");
			fs.renameSync(tempMarkerPath, markerPath);
		} finally {
			if (fs.existsSync(tempMarkerPath)) try {
				fs.unlinkSync(tempMarkerPath);
			} catch {}
		}
	}
	ownsLogoutMarker(filePath, logoutToken) {
		const markerPath = require_common$1.getLogoutMarkerPath(filePath);
		try {
			return fs.readFileSync(markerPath, "utf-8") === logoutToken;
		} catch {
			return false;
		}
	}
	retireLogoutMarker(filePath) {
		const markerPath = require_common$1.getLogoutMarkerPath(filePath);
		const retiredPath = `${markerPath}.retired.${process.pid}.${(0, node_crypto.randomUUID)()}`;
		try {
			fs.renameSync(markerPath, retiredPath);
		} catch (error) {
			if (error.code === "ENOENT") return;
			throw error;
		}
		try {
			fs.unlinkSync(retiredPath);
		} catch (error) {
			this.logger.warn(`Failed to clean retired logout marker: ${error}`);
		}
	}
	ensureSerializedSession(filePath, serializedSession) {
		try {
			if (fs.readFileSync(filePath, "utf-8") === serializedSession) return true;
			return false;
		} catch (error) {
			if (error.code !== "ENOENT") return false;
		}
		const recoveryPath = `${filePath}.recovery.${process.pid}.${(0, node_crypto.randomUUID)()}.tmp`;
		try {
			fs.writeFileSync(recoveryPath, serializedSession, "utf-8");
			try {
				fs.linkSync(recoveryPath, filePath);
			} catch (error) {
				if (error.code !== "EEXIST") try {
					fs.copyFileSync(recoveryPath, filePath, fs.constants.COPYFILE_EXCL);
				} catch (copyError) {
					if (copyError.code !== "EEXIST") return false;
				}
			}
		} finally {
			if (fs.existsSync(recoveryPath)) try {
				fs.unlinkSync(recoveryPath);
			} catch {}
		}
		try {
			return fs.readFileSync(filePath, "utf-8") === serializedSession;
		} catch {
			return false;
		}
	}
	restoreBackupIfAbsent(backupFile, filePath) {
		try {
			fs.linkSync(backupFile, filePath);
			return;
		} catch (error) {
			const code = error.code;
			if (code === "EEXIST" || code === "ENOENT") return;
			try {
				fs.copyFileSync(backupFile, filePath, fs.constants.COPYFILE_EXCL);
			} catch (copyError) {
				const copyCode = copyError.code;
				if (copyCode === "EEXIST" || copyCode === "ENOENT") return;
				throw copyError;
			}
		}
	}
	async dispose() {
		this.disposed = true;
		this.isWriting = false;
		this.pendingExternalReconcile = false;
		if (this.isWritingTimer) {
			clearTimeout(this.isWritingTimer);
			this.isWritingTimer = null;
		}
		if (this.pendingUnlinkTimer) {
			clearTimeout(this.pendingUnlinkTimer);
			this.pendingUnlinkTimer = null;
		}
		if (this.watcherRetryTimer) {
			clearTimeout(this.watcherRetryTimer);
			this.watcherRetryTimer = null;
		}
		this.clearWatcherStableTimer();
		this.watcher?.close();
		this.watcher = null;
	}
	setSessionAndEmit(session) {
		if (this.disposed) return;
		this.session = session;
		this.storeSessionSubject.next(session);
	}
	emitSession(session) {
		if (this.disposed) return;
		this.storeSessionSubject.next(session);
	}
	async migrateLegacySession() {
		const migrator = workbuddyLegacyAuthSessionMigrator;
		if (!migrator) return;
		try {
			const session = await migrator.migrate();
			if (this.disposed) return;
			if (session?.auth && session?.account) {
				if (session.auth.domain && !this.isSessionDomainMatchingCurrentEnv(session.auth.domain)) {
					this.logger.warn(`Skipping legacy session migration: domain mismatch (session domain="${session.auth.domain}", current endpoint="${this.getCurrentExpectedEndpoint()}")`);
					return;
				}
				await this.store(session, { preserveLogoutMarker: true });
				if (this.disposed) return;
				this.logger.info("Migrated auth session from legacy source");
			}
		} catch (error) {
			if (this.disposed) return;
			this.logger.warn(`Failed to migrate legacy auth session: ${error}`);
		}
	}
	/**
	* Check whether a session's auth domain matches the current environment endpoint.
	* Compares the domain (hostname) of the legacy session against the current
	* product configuration's authentication endpoint.
	*/
	isSessionDomainMatchingCurrentEnv(sessionDomain) {
		const currentEndpoint = this.getCurrentExpectedEndpoint();
		if (!currentEndpoint) return true;
		try {
			return new URL(currentEndpoint).hostname === (sessionDomain.includes("://") ? new URL(sessionDomain).hostname : sessionDomain);
		} catch {
			return currentEndpoint.includes(sessionDomain) || sessionDomain.includes(currentEndpoint);
		}
	}
	/**
	* Get the current expected endpoint from product configuration.
	*/
	getCurrentExpectedEndpoint() {
		const authConfig = getWorkbuddyAuthenticationConfiguration();
		if (authConfig?.endpoint) return authConfig.endpoint;
		const productConfig = this.productManager.configuration.getValue();
		return productConfig?.authentication?.endpoint ?? productConfig?.endpoint;
	}
};
return {workbuddyAuthenticationConfigurationProvider,setWorkbuddyAuthenticationConfigurationProvider,getWorkbuddyAuthenticationConfiguration,workbuddyLegacyAuthSessionMigrator,setWorkbuddyLegacyAuthSessionMigrator,FileAuthenticationStorage,getLogoutMarkerPath,AuthenticationStoragePriority};
}
