// @ts-nocheck
// Original Desktop base product loader and builtin model switch helpers.
import * as path from 'node:path';import {fileURLToPath} from 'node:url';
export const DESKTOP_CLIENT_PRODUCT_SOURCE=[{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":89890,"to":90639},{"from":746589,"to":748561},{"from":1029185,"to":1029311},{"from":1029546,"to":1029712},{"from":1029843,"to":1029921}]},{"file":"module-base.js","sha256":"edd9910d7cc967033c89a723f69ab449b59dd57aff78bcada77a973e95733a53","regions":[{"from":558418,"to":559720}]}] as const;
export function createNativeDesktopClientProduct(runtime:any={}){
const process=runtime.process??globalThis.process,__dirname=runtime.dirname??path.dirname(fileURLToPath(import.meta.url));var ProductProviderPriority,BooleanUtils,ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS,ClientProductProvider;
(function(_ProductProviderPriority) {
		_ProductProviderPriority.CLIENT = 5e3;
		_ProductProviderPriority.CLIENT_SETTINGS_ENDPOINT = 6e3;
		_ProductProviderPriority.CLOUD_PRE = 9999;
		_ProductProviderPriority.CLOUD = 1e4;
		_ProductProviderPriority.MODELS = 100100;
		_ProductProviderPriority.AGENTS = 100200;
		_ProductProviderPriority.AGENT_MODEL_RESOLVER = 100300;
		_ProductProviderPriority.CLIENT_SETTINGS = 11e3;
		_ProductProviderPriority.WORKSPACE = 15e3;
		_ProductProviderPriority.MODEL_SETTINGS = 18e3;
		_ProductProviderPriority.ENV = 2e4;
		_ProductProviderPriority.OPTIONS = 21e3;
		_ProductProviderPriority.MODEL_CHECK = 24e3;
		_ProductProviderPriority.DEFAULT = 25e3;
	})(ProductProviderPriority || (ProductProviderPriority = {}));
BooleanUtils = class {
		/**
		* 检查字符串是否表示 "true"
		* 支持多种表示 true 的值: "1", "true", "yes", "on"
		*
		* @param value 要检查的值
		* @returns 是否为 truthy 值
		*
		* @example
		* ```typescript
		* BooleanUtils.isTruthy('1')      // true
		* BooleanUtils.isTruthy('true')   // true
		* BooleanUtils.isTruthy('yes')    // true
		* BooleanUtils.isTruthy('on')     // true
		* BooleanUtils.isTruthy('false')  // false
		* BooleanUtils.isTruthy(undefined) // false
		* ```
		*/
		static isTruthy(value) {
			if (!value) return false;
			if (typeof value === "boolean") return value;
			const normalized = value.toLowerCase().trim();
			return [
				"1",
				"true",
				"yes",
				"on"
			].includes(normalized);
		}
		/**
		* 检查字符串是否表示 "false"
		* 支持多种表示 false 的值: "0", "false", "no", "off"
		*
		* @param value 要检查的值
		* @returns 是否为 falsy 值
		*
		* @example
		* ```typescript
		* BooleanUtils.isFalsy('0')       // true
		* BooleanUtils.isFalsy('false')   // true
		* BooleanUtils.isFalsy('no')      // true
		* BooleanUtils.isFalsy('off')     // true
		* BooleanUtils.isFalsy('true')    // false
		* BooleanUtils.isFalsy(undefined) // false
		* ```
		*/
		static isFalsy(value) {
			if (value === void 0) return false;
			if (typeof value === "boolean") return !value;
			if (!value) return false;
			const normalized = value.toLowerCase().trim();
			return [
				"0",
				"false",
				"no",
				"off"
			].includes(normalized);
		}
		/**
		* 将字符串转换为布尔值
		*
		* @param value 要转换的值
		* @param defaultValue 默认值（当无法确定时返回）
		* @returns 转换后的布尔值
		*
		* @example
		* ```typescript
		* BooleanUtils.toBoolean('true')           // true
		* BooleanUtils.toBoolean('false')          // false
		* BooleanUtils.toBoolean('invalid', true)  // true (使用默认值)
		* BooleanUtils.toBoolean(undefined, false) // false (使用默认值)
		* ```
		*/
		static toBoolean(value, defaultValue = false) {
			if (this.isTruthy(value)) return true;
			if (this.isFalsy(value)) return false;
			return defaultValue;
		}
	};
function isBuiltinModelsDisabled() {
	return BooleanUtils.isTruthy(process.env?.[ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS]);
}
function stripBuiltinModelsIfDisabled(config) {
	if (!isBuiltinModelsDisabled() || !config.models) return config;
	const { models, ...rest } = config;
	return rest;
}
ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS = "CODEBUDDY_DISABLE_BUILTIN_MODELS";
const require_common$2={ProductProviderPriority,stripBuiltinModelsIfDisabled};
ClientProductProvider = class ClientProductProvider {
		constructor() {
			this.priority = require_common$2.ProductProviderPriority.CLIENT;
		}
		init() {
			this.logger.setContext("ClientProductProvider");
		}
		async provide() {
			if (this.cachedProductConfiguration) return this.cachedProductConfiguration;
			if (!this.fs) return {};
			try {
				const basePath = this.configBasePath || __dirname;
				let productPath = (0, path.join)(basePath, "product.json");
				if (!this.fs.existsSync(productPath)) productPath = (0, path.join)(basePath, "..", "product.json");
				if (!this.fs.existsSync(productPath)) productPath = (0, path.join)(basePath, "..", "..", "product.json");
				if (!this.fs.existsSync(productPath)) {
					this.logger.debug("Failed to find product.json");
					return {};
				}
				this.logger.info(`Reading product configuration from ${productPath}`);
				const content = this.fs.readFileSync(productPath, { encoding: "utf-8" });
				this.cachedProductConfiguration = require_common$2.stripBuiltinModelsIfDisabled(JSON.parse(content.toString()));
				this.logger.info("Product configuration loaded and cached successfully");
				return this.cachedProductConfiguration;
			} catch (error) {
				this.logger.warn("Failed to read product.json", error);
				return {};
			}
		}
	};
return {ClientProductProvider,ProductProviderPriority,BooleanUtils,ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS,isBuiltinModelsDisabled,stripBuiltinModelsIfDisabled};
}
