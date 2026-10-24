// @ts-nocheck
// Original Desktop merger, five strategies and constants, without application decorators.
export const DESKTOP_PRODUCT_MERGER_SOURCE={"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","names":["MergeStrategy","OVERRIDE_MODE","GALILEO_ROUTE_KEYS","DefaultProductMerger","OverrideProductMergeStrategy","MergeProductMergeStrategy","FORCE_REPLACE_ARRAY_FIELDS","SmartMergeProductMergeStrategy","DeepSmartMergeProductMergeStrategy","CommandsSmartMergeProductMergeStrategy"],"regions":[{"from":36018,"to":36626},{"from":80978,"to":81036},{"from":1008461,"to":1008536},{"from":1008538,"to":1009325},{"from":1010084,"to":1010305},{"from":1010438,"to":1011379},{"from":1011506,"to":1011574},{"from":1011576,"to":1013862},{"from":1013999,"to":1015915},{"from":1016060,"to":1017879}]} as const;
export function createNativeDesktopProductMerger(){
var MergeStrategy,OVERRIDE_MODE,GALILEO_ROUTE_KEYS,DefaultProductMerger,OverrideProductMergeStrategy,MergeProductMergeStrategy,FORCE_REPLACE_ARRAY_FIELDS,SmartMergeProductMergeStrategy,DeepSmartMergeProductMergeStrategy,CommandsSmartMergeProductMergeStrategy;
MergeStrategy = /* @__PURE__ */ function(MergeStrategy) {
		/** 完全覆盖替换 */
		MergeStrategy["Override"] = "override";
		/** 相同字段覆盖，不同字段合并 */
		MergeStrategy["Merge"] = "merge";
		/** 智能合并（如数组对象根据 id/name 合并） */
		MergeStrategy["SmartMerge"] = "smartMerge";
		/**
		* 深度智能合并：
		* - 对象数组按 id/name 合并（同 SmartMerge）
		* - 对象内部的 primitive 数组（字符串/数字等）做去重 union 合并
		* 适用于需要在嵌套对象内累积 primitive 列表的场景，例如多个来源各自贡献 agent.models 列表。
		*/
		MergeStrategy["DeepSmartMerge"] = "deepSmartMerge";
		/** commands 字段使用智能合并，其他字段保持普通合并 */
		MergeStrategy["CommandsSmartMerge"] = "commandsSmartMerge";
		return MergeStrategy;
	}({});
OVERRIDE_MODE = Symbol.for("@genie/product:overrideMode");
GALILEO_ROUTE_KEYS = [
		"projectId",
		"endpoint",
		"app",
		"server"
	];
DefaultProductMerger = class DefaultProductMerger {
		async merge(...products) {
			let merged = {};
			for (const product of products) {
				for (const strategy of this.productMergeStrategies) if (await strategy.support(product)) {
					merged = await strategy.merge(merged, product);
					break;
				}
				const route = product.galileo;
				const suppliedRouteKeys = GALILEO_ROUTE_KEYS.filter((key) => Object.prototype.hasOwnProperty.call(route ?? {}, key));
				if (suppliedRouteKeys.length > 0 && suppliedRouteKeys.length < GALILEO_ROUTE_KEYS.length) merged.galileo = {
					...merged.galileo,
					...route,
					enable: false,
					projectId: void 0,
					endpoint: void 0,
					app: void 0,
					server: void 0
				};
			}
			delete merged.mergeStrategy;
			return merged;
		}
	};
OverrideProductMergeStrategy = class OverrideProductMergeStrategy {
		async merge(source, target) {
			return { ...target };
		}
		async support(target) {
			return target.mergeStrategy === MergeStrategy.Override;
		}
	};
MergeProductMergeStrategy = class MergeProductMergeStrategy {
		async merge(source, target) {
			return this.doMerge(source, target);
		}
		mergeArray(source, target) {
			return target;
		}
		/**
		* 递归合并方法
		* @param source 目标对象
		* @param target 源对象
		*/
		doMerge(source, target) {
			if (target === void 0) return source;
			if (!source) return Array.isArray(target) ? this.mergeArray([], target) : target;
			if (target === null) return source;
			if (Array.isArray(source) || Array.isArray(target)) return this.mergeArray(source, target);
			let result = target;
			if (typeof source === "object" && source !== null && typeof target === "object" && target !== null) {
				result = { ...source };
				for (const key of Object.keys(target)) result[key] = this.doMerge(source[key], target[key]);
			}
			return result;
		}
		async support(target) {
			return target.mergeStrategy === MergeStrategy.Merge || !target.mergeStrategy;
		}
	};
FORCE_REPLACE_ARRAY_FIELDS = new Set(["builtInMarketPluginsMerge"]);
SmartMergeProductMergeStrategy = class SmartMergeProductMergeStrategy extends MergeProductMergeStrategy {
		async support(target) {
			return target.mergeStrategy === MergeStrategy.SmartMerge;
		}
		isObjectArray(source) {
			return Array.isArray(source) && (source.length === 0 || source.every((item) => typeof item === "object"));
		}
		getItemIdOrName(item) {
			return item?.id || item?.name;
		}
		/**
		* 带路径信息的 doMerge，供需要依据字段名决策合并行为的子类（或本类）使用。
		*/
		doMergeWithPath(source, target, path) {
			if (target === void 0) return source;
			if (!source && !Array.isArray(target)) return target;
			if (target === null) return source;
			if (Array.isArray(source) || Array.isArray(target)) return this.mergeArrayWithPath(source, target, path);
			let result = target;
			if (typeof source === "object" && source !== null && typeof target === "object" && target !== null) {
				result = { ...source };
				for (const key of Object.keys(target)) result[key] = this.doMergeWithPath(source[key], target[key], [...path, key]);
			}
			return result;
		}
		mergeArrayWithPath(source, target, path) {
			const key = path[path.length - 1];
			if (key && FORCE_REPLACE_ARRAY_FIELDS.has(key) && Array.isArray(target)) return target;
			return this.mergeArray(source ?? [], target ?? []);
		}
		async merge(source, target) {
			return this.doMergeWithPath(source, target, []);
		}
		mergeArray(source, target) {
			if (!this.isObjectArray(source) || !this.isObjectArray(target)) return super.mergeArray(source, target);
			const result = [...source];
			const indexById = /* @__PURE__ */ new Map();
			result.forEach((item, index) => {
				const id = this.getItemIdOrName(item);
				if (id && !indexById.has(id)) indexById.set(id, index);
			});
			for (const targetItem of target) {
				if (!targetItem) continue;
				const id = this.getItemIdOrName(targetItem);
				if (!id) {
					result.push(targetItem);
					continue;
				}
				const existingIndex = indexById.get(id);
				if (existingIndex === void 0) {
					indexById.set(id, result.length);
					result.push(targetItem);
					continue;
				}
				const existing = result[existingIndex];
				if (existing[OVERRIDE_MODE] === "replace") continue;
				result[existingIndex] = this.doMerge(existing, targetItem);
			}
			return result;
		}
	};
DeepSmartMergeProductMergeStrategy = class DeepSmartMergeProductMergeStrategy extends SmartMergeProductMergeStrategy {
		constructor(..._args) {
			super(..._args);
			this.sourceSeen = /* @__PURE__ */ new WeakSet();
			this.targetSeen = /* @__PURE__ */ new WeakSet();
		}
		async support(target) {
			return target.mergeStrategy === MergeStrategy.DeepSmartMerge;
		}
		async merge(source, target) {
			this.sourceSeen = /* @__PURE__ */ new WeakSet();
			this.targetSeen = /* @__PURE__ */ new WeakSet();
			return this.doMerge(source, target);
		}
		isPrimitiveArray(value) {
			return Array.isArray(value) && value.every((item) => item === null || typeof item !== "object");
		}
		mergeArray(source, target) {
			if (this.isPrimitiveArray(source) && this.isPrimitiveArray(target)) {
				const result = [...source];
				for (const item of target) if (!result.includes(item)) result.push(item);
				return result;
			}
			return super.mergeArray(source, target);
		}
		/**
		* 在父类递归基础上，进入对象节点前把引用登记到 seen 集合，退出时移除。
		* 若递归链上再次遇到同一引用，直接返回 target 截断递归。
		*/
		doMerge(source, target) {
			if (this.isCircular(source, this.sourceSeen) || this.isCircular(target, this.targetSeen)) return target;
			if (!(this.isTrackable(source) || this.isTrackable(target))) return super.doMerge(source, target);
			this.enter(source, target);
			try {
				return super.doMerge(source, target);
			} finally {
				this.leave(source, target);
			}
		}
		isTrackable(value) {
			return value !== null && typeof value === "object";
		}
		isCircular(value, seen) {
			return this.isTrackable(value) && seen.has(value);
		}
		enter(source, target) {
			if (this.isTrackable(source)) this.sourceSeen.add(source);
			if (this.isTrackable(target)) this.targetSeen.add(target);
		}
		leave(source, target) {
			if (this.isTrackable(source)) this.sourceSeen.delete(source);
			if (this.isTrackable(target)) this.targetSeen.delete(target);
		}
	};
CommandsSmartMergeProductMergeStrategy = class CommandsSmartMergeProductMergeStrategy extends MergeProductMergeStrategy {
		async support(target) {
			return target.mergeStrategy === MergeStrategy.CommandsSmartMerge;
		}
		async merge(source, target) {
			return this.doMergeWithPath(source, target, []);
		}
		doMergeWithPath(source, target, path) {
			if (target === void 0) return source;
			if (!source && !Array.isArray(target)) return target;
			if (target === null) return source;
			if (Array.isArray(source) || Array.isArray(target)) return this.mergeArrayWithPath(source, target, path);
			let result = target;
			if (typeof source === "object" && source !== null && typeof target === "object" && target !== null) {
				result = { ...source };
				for (const key of Object.keys(target)) result[key] = this.doMergeWithPath(source[key], target[key], [...path, key]);
			}
			return result;
		}
		mergeArrayWithPath(source, target, path) {
			const key = path[path.length - 1];
			if (key && FORCE_REPLACE_ARRAY_FIELDS.has(key) && Array.isArray(target)) return target;
			if (key === "commands") return this.mergeCommandsArray(Array.isArray(source) ? source : [], Array.isArray(target) ? target : [], path);
			return super.mergeArray(source ?? [], target ?? []);
		}
		mergeCommandsArray(source, target, path) {
			if (!target?.length) return source ?? [];
			const result = [...source];
			for (const targetCommand of target) {
				if (!targetCommand) continue;
				const name = targetCommand?.name;
				if (!name) {
					result.push(targetCommand);
					continue;
				}
				const index = result.findIndex((item) => item?.name === name);
				if (index >= 0) result[index] = this.doMergeWithPath(result[index], targetCommand, [...path, name]);
				else result.push(targetCommand);
			}
			return result;
		}
	};
return {MergeStrategy,OVERRIDE_MODE,GALILEO_ROUTE_KEYS,DefaultProductMerger,OverrideProductMergeStrategy,MergeProductMergeStrategy,FORCE_REPLACE_ARRAY_FIELDS,SmartMergeProductMergeStrategy,DeepSmartMergeProductMergeStrategy,CommandsSmartMergeProductMergeStrategy};
}
