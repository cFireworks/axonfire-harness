// @ts-nocheck
// Complete original Desktop cloud manager, with outer clock/timer/DI bindings.
export const DESKTOP_CLOUD_PRODUCT_SOURCE={"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","names":["CACHE_MAX","CACHE_KEY","MEM_CACHE_TTL","ERROR_LOG_DEDUP_MS","CloudProductManagerImpl","REQUEST_ID_HEADER"],"regions":[{"from":750329,"to":750364},{"from":996691,"to":996706},{"from":996708,"to":996749},{"from":996751,"to":996777},{"from":996779,"to":996809},{"from":996811,"to":1003574}]} as const;
export function createNativeDesktopCloudProduct(runtime:any={}) {
const Date={now:runtime.now??globalThis.Date.now},setTimeout=runtime.setTimeout??globalThis.setTimeout;
const ProductManager=Symbol('ProductManager'),import_common$37={ContainerUtil:{get:(key)=>{if(key!==ProductManager||!runtime.productManager)throw Error('Desktop cloud product manager requires productManager');return runtime.productManager;}}};
var CACHE_MAX,CACHE_KEY,MEM_CACHE_TTL,ERROR_LOG_DEDUP_MS,CloudProductManagerImpl,REQUEST_ID_HEADER;
REQUEST_ID_HEADER = "X-Request-ID";
CACHE_MAX = 20;
CACHE_KEY = "cloud_product_config_cache";
MEM_CACHE_TTL = 480 * 1e3;
ERROR_LOG_DEDUP_MS = 60 * 1e3;
CloudProductManagerImpl = class CloudProductManagerImpl {
		constructor() {
			this.memCache = /* @__PURE__ */ new Map();
			this.retrying = false;
			this.lastErrorLoggedAt = 0;
		}
		init() {
			this.logger.setContext("CloudProductManager");
		}
		/**
		* 获取产品配置。
		* 1. L1 内存缓存未过期 → 直接返回。
		* 2. L1 过期 → 远程拉取，成功更新 L1 + L2 磁盘缓存并返回。
		* 3. 远程失败 → 后台并行 retry（retrying flag 保证单并发），同时：
		*    a. 优先返回 L1 旧数据（最新，已在内存）
		*    b. L1 无数据则从磁盘缓存读取（不校验 TTL）
		*    c. 磁盘也无则 error 日志，返回空对象
		* 全程不抛错。
		* @param url 远端配置接口地址
		* @returns 产品配置
		*/
		async fetch(url) {
			const userId = (await this.userinfoProvider.provide())?.userId;
			if (userId) {
				const mem = this.memCache.get(userId);
				if (mem && Date.now() < mem.expireAt) return mem.data;
			}
			try {
				return await this.fetchFromRemote(url, userId);
			} catch (error) {
				this.logger.warn(`Fetch remote configuration failed: ${this.briefError(error)}`);
				if (userId) this.fetchWithRetry(url, userId);
				if (userId) {
					const staleMemCache = this.memCache.get(userId);
					if (staleMemCache) return staleMemCache.data;
				}
				if (userId) {
					const cached = await this.readDiskCache(userId);
					if (cached) {
						this.logger.info("[DiskCacheFallback] disk cache hit, returning cached configuration");
						return cached;
					}
					this.logger.info("[DiskCacheFallback] disk cache missed");
				}
				this.logger.error("No cached configuration available, returning empty config");
				return {};
			}
		}
		/**
		* 并发受控的远端重试拉取，指数退避，重试5次（1s/2s/4s/8s/16s），成功同时更新 L1 + L2 缓存。
		* 如果有正在进行中的 retry，则跳过，不启动新的 retry。
		* @param url 远端配置接口地址
		* @param userId 用户ID
		*/
		async fetchWithRetry(url, userId) {
			if (this.retrying) return;
			this.retrying = true;
			const delays = [
				1e3,
				2e3,
				4e3,
				8e3,
				16e3
			];
			let lastError = void 0;
			try {
				for (let i = 0; i < delays.length; i++) {
					await this.sleep(delays[i]);
					try {
						await this.fetchFromRemote(url, userId);
						this.logger.info(`Fetch remote configuration succeeded after ${i + 1} attempt(s)`, userId);
						lastError = void 0;
						break;
					} catch (error) {
						lastError = error;
						const nextDelay = delays[i + 1];
						this.logger.warn(`Fetch remote configuration failed (attempt ${i + 1})` + (nextDelay ? `, will retry after ${nextDelay / 1e3}s` : ", no more retries"));
					}
				}
				if (lastError) {
					const requestId = "isAxiosError" in lastError && lastError.isAxiosError ? lastError.response?.config.headers?.[REQUEST_ID_HEADER] : "";
					const now = Date.now();
					if (now - this.lastErrorLoggedAt > ERROR_LOG_DEDUP_MS) {
						this.lastErrorLoggedAt = now;
						this.logger.error(`Fetch remote configuration failed after all retries: ${this.briefError(lastError)}`, `${requestId}`);
					}
				}
			} finally {
				this.retrying = false;
			}
		}
		/**
		* 从磁盘缓存读取配置（不校验 TTL，用于网络故障降级）
		* @param userId
		*/
		async readDiskCache(userId) {
			const cacheArr = await this.localStorage.get(CACHE_KEY, []) ?? [];
			const idx = cacheArr.findIndex((item) => item.userId === userId);
			if (idx === -1) return;
			const cachedItem = cacheArr[idx];
			cacheArr.splice(idx, 1);
			cacheArr.push(cachedItem);
			await this.localStorage.set(CACHE_KEY, cacheArr);
			this.configuration = cachedItem.data;
			return cachedItem.data;
		}
		/**
		* 从远端读取配置
		* @param url
		* @param userId
		*/
		async fetchFromRemote(url, userId) {
			this.logger.time("Fetched configuration from remote");
			let repos = [];
			if (this.gitInfoCollector) repos = (await this.gitInfoCollector.collect())?.repositories ?? [];
			const res = await this.restOperations.get(url, {
				timeout: 5e3,
				baseURL: import_common$37.ContainerUtil.get(ProductManager).getEndpoint(),
				headers: { Connection: "close" },
				params: { repos: repos.map((item) => item.url) }
			});
			this.configuration = res?.data?.data ?? {};
			this.logger.info(`fetch cloud product ${res?.data?.data ? "success" : "empty"}, agents(${this.configuration.agents?.length ?? 0}): ${this.configuration.agents?.map((a) => a.name)}, models(${this.configuration.models?.length ?? 0}): ${this.configuration.models?.map((m) => m.id)}`);
			if (userId) {
				this.updateMemCache(userId, this.configuration);
				this.updateDiskCache(userId, this.configuration).catch((err) => this.logger.warn(`updateDiskCache failed: ${this.safeStringify(err)}`));
			}
			this.logger.timeEnd("Fetched configuration from remote");
			return this.configuration;
		}
		/**
		* 写入 L1 内存缓存
		*/
		updateMemCache(userId, data) {
			this.memCache.set(userId, {
				data,
				expireAt: Date.now() + MEM_CACHE_TTL
			});
		}
		/**
		* 将指定用户的产品配置写入本地缓存。
		* 如果该用户已存在缓存，则先移除旧项，再插入新项。
		* 保证缓存队列不超过最大长度 CACHE_MAX，超出则移除最久未使用项（LRU）。
		* @param userId 用户 ID
		* @param data 产品配置数据
		*/
		async updateDiskCache(userId, data) {
			const cacheArr = await this.localStorage.get(CACHE_KEY, []) ?? [];
			const idx = cacheArr.findIndex((item) => item.userId === userId);
			if (idx !== -1) cacheArr.splice(idx, 1);
			cacheArr.push({
				userId,
				data,
				ts: Date.now()
			});
			while (cacheArr.length > CACHE_MAX) cacheArr.shift();
			await this.localStorage.set(CACHE_KEY, cacheArr);
		}
		/**
		* 清空内存态：L1 内存缓存、当前 configuration、进行中的 retry 标志。
		* 用于退登：保证下次登录走真实 fetch，不被 8 分钟 TTL 的旧数据挡住。
		* 不动磁盘缓存（按 userId 分片，LRU，可作为下次同账号登录的网络降级兜底）。
		* @param userId 指定清理某个用户；不传则全清。
		*/
		reset(userId) {
			const beforeKeys = Array.from(this.memCache.keys());
			const beforeSize = this.memCache.size;
			if (userId) this.memCache.delete(userId);
			else this.memCache.clear();
			this.logger.info(`[RESET] memory cache cleared: scope=${userId ? `user:${userId}` : "all"}, beforeSize=${beforeSize}, beforeKeys=[${beforeKeys.join(",")}], afterSize=${this.memCache.size}, hadConfiguration=${!!this.configuration}, retrying=${this.retrying}`);
			this.configuration = void 0;
			this.retrying = false;
		}
		sleep(ms) {
			return new Promise((resolve) => setTimeout(resolve, ms));
		}
		/**
		* 从错误对象中提取关键诊断信息（message + status + url），避免序列化整个 AxiosError
		* 导致单条日志 200KB+（含 token、response body、socket 等）。
		*/
		briefError(error) {
			if (!error || typeof error !== "object") return String(error);
			const err = error;
			const message = err.message ?? String(error);
			const status = err.response?.status ?? err.status ?? "";
			const url = err.config?.url ?? "";
			const code = err.code ?? "";
			const result = [
				message,
				status && `status=${status}`,
				url && `url=${url}`,
				code && `code=${code}`
			].filter(Boolean).join(", ");
			return result.length > 500 ? result.slice(0, 500) + "..." : result;
		}
		safeStringify(source) {
			try {
				return JSON.stringify(source);
			} catch (_ignored) {
				return `${source}`;
			}
		}
	};
return {CACHE_MAX,CACHE_KEY,MEM_CACHE_TTL,ERROR_LOG_DEDUP_MS,CloudProductManagerImpl,REQUEST_ID_HEADER};
}
