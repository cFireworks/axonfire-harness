// @ts-nocheck
// Original CellJS REST factory and complete captured Axios dependency graph.
import {createRequire} from 'node:module';
const nodeRequire=createRequire(import.meta.url);
export const DESKTOP_REST_SOURCE=[{"file":"chunk.js","sha256":"d92687c96377faa98b2524502408c7a73328d6dc4e702c7a61c575218e3f75b4","regions":[{"from":370,"to":472}]},{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":774481,"to":774798},{"from":774886,"to":782979},{"from":783078,"to":784579},{"from":784685,"to":786090},{"from":786200,"to":786640},{"from":786740,"to":787854},{"from":787958,"to":788164},{"from":788263,"to":788950},{"from":789044,"to":789774},{"from":789872,"to":790999},{"from":791103,"to":791485},{"from":791587,"to":792045},{"from":792146,"to":792896},{"from":792999,"to":794323},{"from":794429,"to":796188},{"from":796284,"to":796751},{"from":796846,"to":801535},{"from":801590,"to":804463},{"from":804526,"to":810737},{"from":810801,"to":815577},{"from":815638,"to":816052},{"from":816119,"to":818654},{"from":818715,"to":823083},{"from":823145,"to":823529},{"from":823598,"to":823928},{"from":823997,"to":838857},{"from":838948,"to":839082},{"from":839178,"to":849279},{"from":849376,"to":852553},{"from":852654,"to":853335},{"from":853433,"to":853617},{"from":853720,"to":855574},{"from":855673,"to":858525},{"from":858625,"to":860781},{"from":860874,"to":864734},{"from":864835,"to":867068},{"from":867165,"to":867809},{"from":867912,"to":868364},{"from":868452,"to":869676},{"from":869760,"to":869889},{"from":871068,"to":871213}]}] as const;
export function createNativeDesktopRest(runtime:any={}) {
const require=runtime.require??nodeRequire,process=runtime.process??globalThis.process,console=runtime.console??globalThis.console;
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
const require_chunk={__commonJSMin};
var require_bind = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	module.exports = function bind(fn, thisArg) {
		return function wrap() {
			var args = new Array(arguments.length);
			for (var i = 0; i < args.length; i++) args[i] = arguments[i];
			return fn.apply(thisArg, args);
		};
	};
}));
var require_utils = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var bind = require_bind();
	var toString = Object.prototype.toString;
	/**
	* Determine if a value is an Array
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is an Array, otherwise false
	*/
	function isArray(val) {
		return Array.isArray(val);
	}
	/**
	* Determine if a value is undefined
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if the value is undefined, otherwise false
	*/
	function isUndefined(val) {
		return typeof val === "undefined";
	}
	/**
	* Determine if a value is a Buffer
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a Buffer, otherwise false
	*/
	function isBuffer(val) {
		return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === "function" && val.constructor.isBuffer(val);
	}
	/**
	* Determine if a value is an ArrayBuffer
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is an ArrayBuffer, otherwise false
	*/
	function isArrayBuffer(val) {
		return toString.call(val) === "[object ArrayBuffer]";
	}
	/**
	* Determine if a value is a FormData
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is an FormData, otherwise false
	*/
	function isFormData(val) {
		return toString.call(val) === "[object FormData]";
	}
	/**
	* Determine if a value is a view on an ArrayBuffer
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	*/
	function isArrayBufferView(val) {
		var result;
		if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) result = ArrayBuffer.isView(val);
		else result = val && val.buffer && isArrayBuffer(val.buffer);
		return result;
	}
	/**
	* Determine if a value is a String
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a String, otherwise false
	*/
	function isString(val) {
		return typeof val === "string";
	}
	/**
	* Determine if a value is a Number
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a Number, otherwise false
	*/
	function isNumber(val) {
		return typeof val === "number";
	}
	/**
	* Determine if a value is an Object
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is an Object, otherwise false
	*/
	function isObject(val) {
		return val !== null && typeof val === "object";
	}
	/**
	* Determine if a value is a plain Object
	*
	* @param {Object} val The value to test
	* @return {boolean} True if value is a plain Object, otherwise false
	*/
	function isPlainObject(val) {
		if (toString.call(val) !== "[object Object]") return false;
		var prototype = Object.getPrototypeOf(val);
		return prototype === null || prototype === Object.prototype;
	}
	/**
	* Determine if a value is a Date
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a Date, otherwise false
	*/
	function isDate(val) {
		return toString.call(val) === "[object Date]";
	}
	/**
	* Determine if a value is a File
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a File, otherwise false
	*/
	function isFile(val) {
		return toString.call(val) === "[object File]";
	}
	/**
	* Determine if a value is a Blob
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a Blob, otherwise false
	*/
	function isBlob(val) {
		return toString.call(val) === "[object Blob]";
	}
	/**
	* Determine if a value is a Function
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a Function, otherwise false
	*/
	function isFunction(val) {
		return toString.call(val) === "[object Function]";
	}
	/**
	* Determine if a value is a Stream
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a Stream, otherwise false
	*/
	function isStream(val) {
		return isObject(val) && isFunction(val.pipe);
	}
	/**
	* Determine if a value is a URLSearchParams object
	*
	* @param {Object} val The value to test
	* @returns {boolean} True if value is a URLSearchParams object, otherwise false
	*/
	function isURLSearchParams(val) {
		return toString.call(val) === "[object URLSearchParams]";
	}
	/**
	* Trim excess whitespace off the beginning and end of a string
	*
	* @param {String} str The String to trim
	* @returns {String} The String freed of excess whitespace
	*/
	function trim(str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
	}
	/**
	* Determine if we're running in a standard browser environment
	*
	* This allows axios to run in a web worker, and react-native.
	* Both environments support XMLHttpRequest, but not fully standard globals.
	*
	* web workers:
	*  typeof window -> undefined
	*  typeof document -> undefined
	*
	* react-native:
	*  navigator.product -> 'ReactNative'
	* nativescript
	*  navigator.product -> 'NativeScript' or 'NS'
	*/
	function isStandardBrowserEnv() {
		if (typeof navigator !== "undefined" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS")) return false;
		return typeof window !== "undefined" && typeof document !== "undefined";
	}
	/**
	* Iterate over an Array or an Object invoking a function for each item.
	*
	* If `obj` is an Array callback will be called passing
	* the value, index, and complete array for each item.
	*
	* If 'obj' is an Object callback will be called passing
	* the value, key, and complete object for each property.
	*
	* @param {Object|Array} obj The object to iterate
	* @param {Function} fn The callback to invoke for each item
	*/
	function forEach(obj, fn) {
		if (obj === null || typeof obj === "undefined") return;
		if (typeof obj !== "object") obj = [obj];
		if (isArray(obj)) for (var i = 0, l = obj.length; i < l; i++) fn.call(null, obj[i], i, obj);
		else for (var key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) fn.call(null, obj[key], key, obj);
	}
	/**
	* Accepts varargs expecting each argument to be an object, then
	* immutably merges the properties of each object and returns result.
	*
	* When multiple objects contain the same key the later object in
	* the arguments list will take precedence.
	*
	* Example:
	*
	* ```js
	* var result = merge({foo: 123}, {foo: 456});
	* console.log(result.foo); // outputs 456
	* ```
	*
	* @param {Object} obj1 Object to merge
	* @returns {Object} Result of all merge properties
	*/
	function merge() {
		var result = {};
		function assignValue(val, key) {
			if (isPlainObject(result[key]) && isPlainObject(val)) result[key] = merge(result[key], val);
			else if (isPlainObject(val)) result[key] = merge({}, val);
			else if (isArray(val)) result[key] = val.slice();
			else result[key] = val;
		}
		for (var i = 0, l = arguments.length; i < l; i++) forEach(arguments[i], assignValue);
		return result;
	}
	/**
	* Extends object a by mutably adding to it the properties of object b.
	*
	* @param {Object} a The object to be extended
	* @param {Object} b The object to copy properties from
	* @param {Object} thisArg The object to bind function to
	* @return {Object} The resulting value of object a
	*/
	function extend(a, b, thisArg) {
		forEach(b, function assignValue(val, key) {
			if (thisArg && typeof val === "function") a[key] = bind(val, thisArg);
			else a[key] = val;
		});
		return a;
	}
	/**
	* Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	*
	* @param {string} content with BOM
	* @return {string} content value without BOM
	*/
	function stripBOM(content) {
		if (content.charCodeAt(0) === 65279) content = content.slice(1);
		return content;
	}
	module.exports = {
		isArray,
		isArrayBuffer,
		isBuffer,
		isFormData,
		isArrayBufferView,
		isString,
		isNumber,
		isObject,
		isPlainObject,
		isUndefined,
		isDate,
		isFile,
		isBlob,
		isFunction,
		isStream,
		isURLSearchParams,
		isStandardBrowserEnv,
		forEach,
		merge,
		extend,
		trim,
		stripBOM
	};
}));
var require_buildURL = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	function encode(val) {
		return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
	}
	/**
	* Build a URL by appending params to the end
	*
	* @param {string} url The base of the url (e.g., http://www.google.com)
	* @param {object} [params] The params to be appended
	* @returns {string} The formatted url
	*/
	module.exports = function buildURL(url, params, paramsSerializer) {
		if (!params) return url;
		var serializedParams;
		if (paramsSerializer) serializedParams = paramsSerializer(params);
		else if (utils.isURLSearchParams(params)) serializedParams = params.toString();
		else {
			var parts = [];
			utils.forEach(params, function serialize(val, key) {
				if (val === null || typeof val === "undefined") return;
				if (utils.isArray(val)) key = key + "[]";
				else val = [val];
				utils.forEach(val, function parseValue(v) {
					if (utils.isDate(v)) v = v.toISOString();
					else if (utils.isObject(v)) v = JSON.stringify(v);
					parts.push(encode(key) + "=" + encode(v));
				});
			});
			serializedParams = parts.join("&");
		}
		if (serializedParams) {
			var hashmarkIndex = url.indexOf("#");
			if (hashmarkIndex !== -1) url = url.slice(0, hashmarkIndex);
			url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
		}
		return url;
	};
}));
var require_InterceptorManager = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	function InterceptorManager() {
		this.handlers = [];
	}
	/**
	* Add a new interceptor to the stack
	*
	* @param {Function} fulfilled The function to handle `then` for a `Promise`
	* @param {Function} rejected The function to handle `reject` for a `Promise`
	*
	* @return {Number} An ID used to remove interceptor later
	*/
	InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
		this.handlers.push({
			fulfilled,
			rejected,
			synchronous: options ? options.synchronous : false,
			runWhen: options ? options.runWhen : null
		});
		return this.handlers.length - 1;
	};
	/**
	* Remove an interceptor from the stack
	*
	* @param {Number} id The ID that was returned by `use`
	*/
	InterceptorManager.prototype.eject = function eject(id) {
		if (this.handlers[id]) this.handlers[id] = null;
	};
	/**
	* Iterate over all the registered interceptors
	*
	* This method is particularly useful for skipping over any
	* interceptors that may have become `null` calling `eject`.
	*
	* @param {Function} fn The function to call for each interceptor
	*/
	InterceptorManager.prototype.forEach = function forEach(fn) {
		utils.forEach(this.handlers, function forEachHandler(h) {
			if (h !== null) fn(h);
		});
	};
	module.exports = InterceptorManager;
}));
var require_normalizeHeaderName = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	module.exports = function normalizeHeaderName(headers, normalizedName) {
		utils.forEach(headers, function processHeader(value, name) {
			if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
				headers[normalizedName] = value;
				delete headers[name];
			}
		});
	};
}));
var require_enhanceError = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* Update an Error with the specified config, error code, and response.
	*
	* @param {Error} error The error to update.
	* @param {Object} config The config.
	* @param {string} [code] The error code (for example, 'ECONNABORTED').
	* @param {Object} [request] The request.
	* @param {Object} [response] The response.
	* @returns {Error} The error.
	*/
	module.exports = function enhanceError(error, config, code, request, response) {
		error.config = config;
		if (code) error.code = code;
		error.request = request;
		error.response = response;
		error.isAxiosError = true;
		error.toJSON = function toJSON() {
			return {
				message: this.message,
				name: this.name,
				description: this.description,
				number: this.number,
				fileName: this.fileName,
				lineNumber: this.lineNumber,
				columnNumber: this.columnNumber,
				stack: this.stack,
				config: this.config,
				code: this.code,
				status: this.response && this.response.status ? this.response.status : null
			};
		};
		return error;
	};
}));
var require_transitional = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	module.exports = {
		silentJSONParsing: true,
		forcedJSONParsing: true,
		clarifyTimeoutError: false
	};
}));
var require_createError = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var enhanceError = require_enhanceError();
	/**
	* Create an Error with the specified message, config, error code, request and response.
	*
	* @param {string} message The error message.
	* @param {Object} config The config.
	* @param {string} [code] The error code (for example, 'ECONNABORTED').
	* @param {Object} [request] The request.
	* @param {Object} [response] The response.
	* @returns {Error} The created error.
	*/
	module.exports = function createError(message, config, code, request, response) {
		return enhanceError(new Error(message), config, code, request, response);
	};
}));
var require_settle = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var createError = require_createError();
	/**
	* Resolve or reject a Promise based on response status.
	*
	* @param {Function} resolve A function that resolves the promise.
	* @param {Function} reject A function that rejects the promise.
	* @param {object} response The response.
	*/
	module.exports = function settle(resolve, reject, response) {
		var validateStatus = response.config.validateStatus;
		if (!response.status || !validateStatus || validateStatus(response.status)) resolve(response);
		else reject(createError("Request failed with status code " + response.status, response.config, null, response.request, response));
	};
}));
var require_cookies = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	module.exports = utils.isStandardBrowserEnv() ? (function standardBrowserEnv() {
		return {
			write: function write(name, value, expires, path, domain, secure) {
				var cookie = [];
				cookie.push(name + "=" + encodeURIComponent(value));
				if (utils.isNumber(expires)) cookie.push("expires=" + new Date(expires).toGMTString());
				if (utils.isString(path)) cookie.push("path=" + path);
				if (utils.isString(domain)) cookie.push("domain=" + domain);
				if (secure === true) cookie.push("secure");
				document.cookie = cookie.join("; ");
			},
			read: function read(name) {
				var match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
				return match ? decodeURIComponent(match[3]) : null;
			},
			remove: function remove(name) {
				this.write(name, "", Date.now() - 864e5);
			}
		};
	})() : (function nonStandardBrowserEnv() {
		return {
			write: function write() {},
			read: function read() {
				return null;
			},
			remove: function remove() {}
		};
	})();
}));
var require_isAbsoluteURL = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* Determines whether the specified URL is absolute
	*
	* @param {string} url The URL to test
	* @returns {boolean} True if the specified URL is absolute, otherwise false
	*/
	module.exports = function isAbsoluteURL(url) {
		return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
	};
}));
var require_combineURLs = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* Creates a new URL by combining the specified URLs
	*
	* @param {string} baseURL The base URL
	* @param {string} relativeURL The relative URL
	* @returns {string} The combined URL
	*/
	module.exports = function combineURLs(baseURL, relativeURL) {
		return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
	};
}));
var require_buildFullPath = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var isAbsoluteURL = require_isAbsoluteURL();
	var combineURLs = require_combineURLs();
	/**
	* Creates a new URL by combining the baseURL with the requestedURL,
	* only when the requestedURL is not already an absolute URL.
	* If the requestURL is absolute, this function returns the requestedURL untouched.
	*
	* @param {string} baseURL The base URL
	* @param {string} requestedURL Absolute or relative URL to combine
	* @returns {string} The combined full path
	*/
	module.exports = function buildFullPath(baseURL, requestedURL) {
		if (baseURL && !isAbsoluteURL(requestedURL)) return combineURLs(baseURL, requestedURL);
		return requestedURL;
	};
}));
var require_parseHeaders = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var ignoreDuplicateOf = [
		"age",
		"authorization",
		"content-length",
		"content-type",
		"etag",
		"expires",
		"from",
		"host",
		"if-modified-since",
		"if-unmodified-since",
		"last-modified",
		"location",
		"max-forwards",
		"proxy-authorization",
		"referer",
		"retry-after",
		"user-agent"
	];
	/**
	* Parse headers into an object
	*
	* ```
	* Date: Wed, 27 Aug 2014 08:58:49 GMT
	* Content-Type: application/json
	* Connection: keep-alive
	* Transfer-Encoding: chunked
	* ```
	*
	* @param {String} headers Headers needing to be parsed
	* @returns {Object} Headers parsed into an object
	*/
	module.exports = function parseHeaders(headers) {
		var parsed = {};
		var key;
		var val;
		var i;
		if (!headers) return parsed;
		utils.forEach(headers.split("\n"), function parser(line) {
			i = line.indexOf(":");
			key = utils.trim(line.substr(0, i)).toLowerCase();
			val = utils.trim(line.substr(i + 1));
			if (key) {
				if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) return;
				if (key === "set-cookie") parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
				else parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
			}
		});
		return parsed;
	};
}));
var require_isURLSameOrigin = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	module.exports = utils.isStandardBrowserEnv() ? (function standardBrowserEnv() {
		var msie = /(msie|trident)/i.test(navigator.userAgent);
		var urlParsingNode = document.createElement("a");
		var originURL;
		/**
		* Parse a URL to discover it's components
		*
		* @param {String} url The URL to be parsed
		* @returns {Object}
		*/
		function resolveURL(url) {
			var href = url;
			if (msie) {
				urlParsingNode.setAttribute("href", href);
				href = urlParsingNode.href;
			}
			urlParsingNode.setAttribute("href", href);
			return {
				href: urlParsingNode.href,
				protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
				host: urlParsingNode.host,
				search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
				hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
				hostname: urlParsingNode.hostname,
				port: urlParsingNode.port,
				pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
			};
		}
		originURL = resolveURL(window.location.href);
		/**
		* Determine if a URL shares the same origin as the current location
		*
		* @param {String} requestURL The URL to test
		* @returns {boolean} True if URL shares the same origin, otherwise false
		*/
		return function isURLSameOrigin(requestURL) {
			var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
			return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
		};
	})() : (function nonStandardBrowserEnv() {
		return function isURLSameOrigin() {
			return true;
		};
	})();
}));
var require_Cancel = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* A `Cancel` is an object that is thrown when an operation is canceled.
	*
	* @class
	* @param {string=} message The message.
	*/
	function Cancel(message) {
		this.message = message;
	}
	Cancel.prototype.toString = function toString() {
		return "Cancel" + (this.message ? ": " + this.message : "");
	};
	Cancel.prototype.__CANCEL__ = true;
	module.exports = Cancel;
}));
var require_xhr = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var settle = require_settle();
	var cookies = require_cookies();
	var buildURL = require_buildURL();
	var buildFullPath = require_buildFullPath();
	var parseHeaders = require_parseHeaders();
	var isURLSameOrigin = require_isURLSameOrigin();
	var createError = require_createError();
	var transitionalDefaults = require_transitional();
	var Cancel = require_Cancel();
	module.exports = function xhrAdapter(config) {
		return new Promise(function dispatchXhrRequest(resolve, reject) {
			var requestData = config.data;
			var requestHeaders = config.headers;
			var responseType = config.responseType;
			var onCanceled;
			function done() {
				if (config.cancelToken) config.cancelToken.unsubscribe(onCanceled);
				if (config.signal) config.signal.removeEventListener("abort", onCanceled);
			}
			if (utils.isFormData(requestData)) delete requestHeaders["Content-Type"];
			var request = new XMLHttpRequest();
			if (config.auth) {
				var username = config.auth.username || "";
				var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
				requestHeaders.Authorization = "Basic " + btoa(username + ":" + password);
			}
			var fullPath = buildFullPath(config.baseURL, config.url);
			request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
			request.timeout = config.timeout;
			function onloadend() {
				if (!request) return;
				var responseHeaders = "getAllResponseHeaders" in request ? parseHeaders(request.getAllResponseHeaders()) : null;
				settle(function _resolve(value) {
					resolve(value);
					done();
				}, function _reject(err) {
					reject(err);
					done();
				}, {
					data: !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response,
					status: request.status,
					statusText: request.statusText,
					headers: responseHeaders,
					config,
					request
				});
				request = null;
			}
			if ("onloadend" in request) request.onloadend = onloadend;
			else request.onreadystatechange = function handleLoad() {
				if (!request || request.readyState !== 4) return;
				if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) return;
				setTimeout(onloadend);
			};
			request.onabort = function handleAbort() {
				if (!request) return;
				reject(createError("Request aborted", config, "ECONNABORTED", request));
				request = null;
			};
			request.onerror = function handleError() {
				reject(createError("Network Error", config, null, request));
				request = null;
			};
			request.ontimeout = function handleTimeout() {
				var timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
				var transitional = config.transitional || transitionalDefaults;
				if (config.timeoutErrorMessage) timeoutErrorMessage = config.timeoutErrorMessage;
				reject(createError(timeoutErrorMessage, config, transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED", request));
				request = null;
			};
			if (utils.isStandardBrowserEnv()) {
				var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : void 0;
				if (xsrfValue) requestHeaders[config.xsrfHeaderName] = xsrfValue;
			}
			if ("setRequestHeader" in request) utils.forEach(requestHeaders, function setRequestHeader(val, key) {
				if (typeof requestData === "undefined" && key.toLowerCase() === "content-type") delete requestHeaders[key];
				else request.setRequestHeader(key, val);
			});
			if (!utils.isUndefined(config.withCredentials)) request.withCredentials = !!config.withCredentials;
			if (responseType && responseType !== "json") request.responseType = config.responseType;
			if (typeof config.onDownloadProgress === "function") request.addEventListener("progress", config.onDownloadProgress);
			if (typeof config.onUploadProgress === "function" && request.upload) request.upload.addEventListener("progress", config.onUploadProgress);
			if (config.cancelToken || config.signal) {
				onCanceled = function(cancel) {
					if (!request) return;
					reject(!cancel || cancel && cancel.type ? new Cancel("canceled") : cancel);
					request.abort();
					request = null;
				};
				config.cancelToken && config.cancelToken.subscribe(onCanceled);
				if (config.signal) config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
			}
			if (!requestData) requestData = null;
			request.send(requestData);
		});
	};
}));
var require_ms = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* Helpers.
	*/
	var s = 1e3;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	/**
	* Parse or format the given `val`.
	*
	* Options:
	*
	*  - `long` verbose formatting [false]
	*
	* @param {String|Number} val
	* @param {Object} [options]
	* @throws {Error} throw an error if val is not a non-empty string or a number
	* @return {String|Number}
	* @api public
	*/
	module.exports = function(val, options) {
		options = options || {};
		var type = typeof val;
		if (type === "string" && val.length > 0) return parse(val);
		else if (type === "number" && isFinite(val)) return options.long ? fmtLong(val) : fmtShort(val);
		throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
	};
	/**
	* Parse the given `str` and return milliseconds.
	*
	* @param {String} str
	* @return {Number}
	* @api private
	*/
	function parse(str) {
		str = String(str);
		if (str.length > 100) return;
		var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
		if (!match) return;
		var n = parseFloat(match[1]);
		switch ((match[2] || "ms").toLowerCase()) {
			case "years":
			case "year":
			case "yrs":
			case "yr":
			case "y": return n * y;
			case "weeks":
			case "week":
			case "w": return n * w;
			case "days":
			case "day":
			case "d": return n * d;
			case "hours":
			case "hour":
			case "hrs":
			case "hr":
			case "h": return n * h;
			case "minutes":
			case "minute":
			case "mins":
			case "min":
			case "m": return n * m;
			case "seconds":
			case "second":
			case "secs":
			case "sec":
			case "s": return n * s;
			case "milliseconds":
			case "millisecond":
			case "msecs":
			case "msec":
			case "ms": return n;
			default: return;
		}
	}
	/**
	* Short format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtShort(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + "d";
		if (msAbs >= h) return Math.round(ms / h) + "h";
		if (msAbs >= m) return Math.round(ms / m) + "m";
		if (msAbs >= s) return Math.round(ms / s) + "s";
		return ms + "ms";
	}
	/**
	* Long format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtLong(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return plural(ms, msAbs, d, "day");
		if (msAbs >= h) return plural(ms, msAbs, h, "hour");
		if (msAbs >= m) return plural(ms, msAbs, m, "minute");
		if (msAbs >= s) return plural(ms, msAbs, s, "second");
		return ms + " ms";
	}
	/**
	* Pluralization helper.
	*/
	function plural(ms, msAbs, n, name) {
		var isPlural = msAbs >= n * 1.5;
		return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
	}
}));
var require_common$1 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* This is the common logic for both the Node.js and web browser
	* implementations of `debug()`.
	*/
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = require_ms();
		createDebug.destroy = destroy;
		Object.keys(env).forEach((key) => {
			createDebug[key] = env[key];
		});
		/**
		* The currently active debug mode names, and names to skip.
		*/
		createDebug.names = [];
		createDebug.skips = [];
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
			for (let i = 0; i < namespace.length; i++) {
				hash = (hash << 5) - hash + namespace.charCodeAt(i);
				hash |= 0;
			}
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
			function debug(...args) {
				if (!debug.enabled) return;
				const self = debug;
				const curr = Number(/* @__PURE__ */ new Date());
				self.diff = curr - (prevTime || curr);
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
				args[0] = createDebug.coerce(args[0]);
				if (typeof args[0] !== "string") args.unshift("%O");
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					if (match === "%%") return "%";
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === "function") {
						const val = args[index];
						match = formatter.call(self, val);
						args.splice(index, 1);
						index--;
					}
					return match;
				});
				createDebug.formatArgs.call(self, args);
				(self.log || createDebug.log).apply(self, args);
			}
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy;
			Object.defineProperty(debug, "enabled", {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) return enableOverride;
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
					return enabledCache;
				},
				set: (v) => {
					enableOverride = v;
				}
			});
			if (typeof createDebug.init === "function") createDebug.init(debug);
			return debug;
		}
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
			createDebug.names = [];
			createDebug.skips = [];
			const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(" ", ",").split(",").filter(Boolean);
			for (const ns of split) if (ns[0] === "-") createDebug.skips.push(ns.slice(1));
			else createDebug.names.push(ns);
		}
		/**
		* Checks if the given string matches a namespace template, honoring
		* asterisks as wildcards.
		*
		* @param {String} search
		* @param {String} template
		* @return {Boolean}
		*/
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;
			while (searchIndex < search.length) if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) if (template[templateIndex] === "*") {
				starIndex = templateIndex;
				matchIndex = searchIndex;
				templateIndex++;
			} else {
				searchIndex++;
				templateIndex++;
			}
			else if (starIndex !== -1) {
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else return false;
			while (templateIndex < template.length && template[templateIndex] === "*") templateIndex++;
			return templateIndex === template.length;
		}
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [...createDebug.names, ...createDebug.skips.map((namespace) => "-" + namespace)].join(",");
			createDebug.enable("");
			return namespaces;
		}
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) if (matchesTemplate(name, skip)) return false;
			for (const ns of createDebug.names) if (matchesTemplate(name, ns)) return true;
			return false;
		}
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) return val.stack || val.message;
			return val;
		}
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
		}
		createDebug.enable(createDebug.load());
		return createDebug;
	}
	module.exports = setup;
}));
var require_browser = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* This is the web browser implementation of `debug()`.
	*/
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
		return () => {
			if (!warned) {
				warned = true;
				console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
			}
		};
	})();
	/**
	* Colors.
	*/
	exports.colors = [
		"#0000CC",
		"#0000FF",
		"#0033CC",
		"#0033FF",
		"#0066CC",
		"#0066FF",
		"#0099CC",
		"#0099FF",
		"#00CC00",
		"#00CC33",
		"#00CC66",
		"#00CC99",
		"#00CCCC",
		"#00CCFF",
		"#3300CC",
		"#3300FF",
		"#3333CC",
		"#3333FF",
		"#3366CC",
		"#3366FF",
		"#3399CC",
		"#3399FF",
		"#33CC00",
		"#33CC33",
		"#33CC66",
		"#33CC99",
		"#33CCCC",
		"#33CCFF",
		"#6600CC",
		"#6600FF",
		"#6633CC",
		"#6633FF",
		"#66CC00",
		"#66CC33",
		"#9900CC",
		"#9900FF",
		"#9933CC",
		"#9933FF",
		"#99CC00",
		"#99CC33",
		"#CC0000",
		"#CC0033",
		"#CC0066",
		"#CC0099",
		"#CC00CC",
		"#CC00FF",
		"#CC3300",
		"#CC3333",
		"#CC3366",
		"#CC3399",
		"#CC33CC",
		"#CC33FF",
		"#CC6600",
		"#CC6633",
		"#CC9900",
		"#CC9933",
		"#CCCC00",
		"#CCCC33",
		"#FF0000",
		"#FF0033",
		"#FF0066",
		"#FF0099",
		"#FF00CC",
		"#FF00FF",
		"#FF3300",
		"#FF3333",
		"#FF3366",
		"#FF3399",
		"#FF33CC",
		"#FF33FF",
		"#FF6600",
		"#FF6633",
		"#FF9900",
		"#FF9933",
		"#FFCC00",
		"#FFCC33"
	];
	/**
	* Currently only WebKit-based Web Inspectors, Firefox >= v31,
	* and the Firebug extension (any Firefox version) are known
	* to support "%c" CSS customizations.
	*
	* TODO: add a `localStorage` variable to explicitly enable/disable colors
	*/
	function useColors() {
		if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) return true;
		if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
		let m;
		return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	}
	/**
	* Colorize log arguments if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
		if (!this.useColors) return;
		const c = "color: " + this.color;
		args.splice(1, 0, c, "color: inherit");
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, (match) => {
			if (match === "%%") return;
			index++;
			if (match === "%c") lastC = index;
		});
		args.splice(lastC, 0, c);
	}
	/**
	* Invokes `console.debug()` when available.
	* No-op when `console.debug` is not a "function".
	* If `console.debug` is not available, falls back
	* to `console.log`.
	*
	* @api public
	*/
	exports.log = console.debug || console.log || (() => {});
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		try {
			if (namespaces) exports.storage.setItem("debug", namespaces);
			else exports.storage.removeItem("debug");
		} catch (error) {}
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		let r;
		try {
			r = exports.storage.getItem("debug");
		} catch (error) {}
		if (!r && typeof process !== "undefined" && "env" in process) r = process.env.DEBUG;
		return r;
	}
	/**
	* Localstorage attempts to return the localstorage.
	*
	* This is necessary because safari throws
	* when a user disables cookies/localstorage
	* and you attempt to access it.
	*
	* @return {LocalStorage}
	* @api private
	*/
	function localstorage() {
		try {
			return localStorage;
		} catch (error) {}
	}
	module.exports = require_common$1()(exports);
	var { formatters } = module.exports;
	/**
	* Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	*/
	formatters.j = function(v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return "[UnexpectedJSONParseError]: " + error.message;
		}
	};
}));
var require_has_flag = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	module.exports = (flag, argv = process.argv) => {
		const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf("--");
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
}));
var require_supports_color = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var os = require("os");
	var tty$1 = require("tty");
	var hasFlag = require_has_flag();
	var { env } = process;
	var forceColor;
	if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) forceColor = 0;
	else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) forceColor = 1;
	if ("FORCE_COLOR" in env) if (env.FORCE_COLOR === "true") forceColor = 1;
	else if (env.FORCE_COLOR === "false") forceColor = 0;
	else forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	function translateLevel(level) {
		if (level === 0) return false;
		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}
	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) return 0;
		if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) return 3;
		if (hasFlag("color=256")) return 2;
		if (haveStream && !streamIsTTY && forceColor === void 0) return 0;
		const min = forceColor || 0;
		if (env.TERM === "dumb") return min;
		if (process.platform === "win32") {
			const osRelease = os.release().split(".");
			if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) return Number(osRelease[2]) >= 14931 ? 3 : 2;
			return 1;
		}
		if ("CI" in env) {
			if ([
				"TRAVIS",
				"CIRCLECI",
				"APPVEYOR",
				"GITLAB_CI",
				"GITHUB_ACTIONS",
				"BUILDKITE"
			].some((sign) => sign in env) || env.CI_NAME === "codeship") return 1;
			return min;
		}
		if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		if (env.COLORTERM === "truecolor") return 3;
		if ("TERM_PROGRAM" in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
			switch (env.TERM_PROGRAM) {
				case "iTerm.app": return version >= 3 ? 3 : 2;
				case "Apple_Terminal": return 2;
			}
		}
		if (/-256(color)?$/i.test(env.TERM)) return 2;
		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) return 1;
		if ("COLORTERM" in env) return 1;
		return min;
	}
	function getSupportLevel(stream) {
		return translateLevel(supportsColor(stream, stream && stream.isTTY));
	}
	module.exports = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty$1.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty$1.isatty(2)))
	};
}));
var require_node = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* Module dependencies.
	*/
	var tty = require("tty");
	var util$4 = require("util");
	/**
	* This is the Node.js implementation of `debug()`.
	*/
	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.destroy = util$4.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
	/**
	* Colors.
	*/
	exports.colors = [
		6,
		2,
		3,
		4,
		5,
		1
	];
	try {
		const supportsColor = require_supports_color();
		if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	} catch (error) {}
	/**
	* Build up the default `inspectOpts` object from the environment variables.
	*
	*   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	*/
	exports.inspectOpts = Object.keys(process.env).filter((key) => {
		return /^debug_/i.test(key);
	}).reduce((obj, key) => {
		const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});
		let val = process.env[key];
		if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
		else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
		else if (val === "null") val = null;
		else val = Number(val);
		obj[prop] = val;
		return obj;
	}, {});
	/**
	* Is stdout a TTY? Colored output is enabled when `true`.
	*/
	function useColors() {
		return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
	}
	/**
	* Adds ANSI color escape codes if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		const { namespace: name, useColors } = this;
		if (useColors) {
			const c = this.color;
			const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
			const prefix = `  ${colorCode};1m${name} \u001B[0m`;
			args[0] = prefix + args[0].split("\n").join("\n" + prefix);
			args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
		} else args[0] = getDate() + name + " " + args[0];
	}
	function getDate() {
		if (exports.inspectOpts.hideDate) return "";
		return (/* @__PURE__ */ new Date()).toISOString() + " ";
	}
	/**
	* Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
	*/
	function log(...args) {
		return process.stderr.write(util$4.formatWithOptions(exports.inspectOpts, ...args) + "\n");
	}
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		if (namespaces) process.env.DEBUG = namespaces;
		else delete process.env.DEBUG;
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		return process.env.DEBUG;
	}
	/**
	* Init logic for `debug` instances.
	*
	* Create a new `inspectOpts` object in case `useColors` is set
	* differently for a particular `debug` instance.
	*/
	function init(debug) {
		debug.inspectOpts = {};
		const keys = Object.keys(exports.inspectOpts);
		for (let i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
	module.exports = require_common$1()(exports);
	var { formatters } = module.exports;
	/**
	* Map %o to `util.inspect()`, all on a single line.
	*/
	formatters.o = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util$4.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
	};
	/**
	* Map %O to `util.inspect()`, allowing multiple lines if needed.
	*/
	formatters.O = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util$4.inspect(v, this.inspectOpts);
	};
}));
var require_src = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* Detect Electron renderer / nwjs process, which is node, but we should
	* treat as a browser.
	*/
	if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) module.exports = require_browser();
	else module.exports = require_node();
}));
var require_debug$1 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var debug;
	module.exports = function() {
		if (!debug) {
			try {
				debug = require_src()("follow-redirects");
			} catch (error) {}
			if (typeof debug !== "function") debug = function() {};
		}
		debug.apply(null, arguments);
	};
}));
var require_follow_redirects = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var url$2 = require("url");
	var URL = url$2.URL;
	var http$2 = require("http");
	var https$2 = require("https");
	var Writable = require("stream").Writable;
	var assert = require("assert");
	var debug = require_debug$1();
	// istanbul ignore next
	(function detectUnsupportedEnvironment() {
		var looksLikeNode = typeof process !== "undefined";
		var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
		var looksLikeV8 = isFunction(Error.captureStackTrace);
		if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) console.warn("The follow-redirects package should be excluded from browser builds.");
	})();
	var useNativeURL = false;
	try {
		assert(new URL(""));
	} catch (error) {
		useNativeURL = error.code === "ERR_INVALID_URL";
	}
	var preservedUrlFields = [
		"auth",
		"host",
		"hostname",
		"href",
		"path",
		"pathname",
		"port",
		"protocol",
		"query",
		"search",
		"hash"
	];
	var events = [
		"abort",
		"aborted",
		"connect",
		"error",
		"socket",
		"timeout"
	];
	var eventHandlers = Object.create(null);
	events.forEach(function(event) {
		eventHandlers[event] = function(arg1, arg2, arg3) {
			this._redirectable.emit(event, arg1, arg2, arg3);
		};
	});
	var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
	var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
	var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
	var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
	var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
	// istanbul ignore next
	var destroy = Writable.prototype.destroy || noop;
	function RedirectableRequest(options, responseCallback) {
		Writable.call(this);
		this._sanitizeOptions(options);
		this._options = options;
		this._ended = false;
		this._ending = false;
		this._redirectCount = 0;
		this._redirects = [];
		this._requestBodyLength = 0;
		this._requestBodyBuffers = [];
		if (responseCallback) this.on("response", responseCallback);
		var self = this;
		this._onNativeResponse = function(response) {
			try {
				self._processResponse(response);
			} catch (cause) {
				self.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
			}
		};
		this._performRequest();
	}
	RedirectableRequest.prototype = Object.create(Writable.prototype);
	RedirectableRequest.prototype.abort = function() {
		destroyRequest(this._currentRequest);
		this._currentRequest.abort();
		this.emit("abort");
	};
	RedirectableRequest.prototype.destroy = function(error) {
		destroyRequest(this._currentRequest, error);
		destroy.call(this, error);
		return this;
	};
	RedirectableRequest.prototype.write = function(data, encoding, callback) {
		if (this._ending) throw new WriteAfterEndError();
		if (!isString(data) && !isBuffer(data)) throw new TypeError("data should be a string, Buffer or Uint8Array");
		if (isFunction(encoding)) {
			callback = encoding;
			encoding = null;
		}
		if (data.length === 0) {
			if (callback) callback();
			return;
		}
		if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
			this._requestBodyLength += data.length;
			this._requestBodyBuffers.push({
				data,
				encoding
			});
			this._currentRequest.write(data, encoding, callback);
		} else {
			this.emit("error", new MaxBodyLengthExceededError());
			this.abort();
		}
	};
	RedirectableRequest.prototype.end = function(data, encoding, callback) {
		if (isFunction(data)) {
			callback = data;
			data = encoding = null;
		} else if (isFunction(encoding)) {
			callback = encoding;
			encoding = null;
		}
		if (!data) {
			this._ended = this._ending = true;
			this._currentRequest.end(null, null, callback);
		} else {
			var self = this;
			var currentRequest = this._currentRequest;
			this.write(data, encoding, function() {
				self._ended = true;
				currentRequest.end(null, null, callback);
			});
			this._ending = true;
		}
	};
	RedirectableRequest.prototype.setHeader = function(name, value) {
		this._options.headers[name] = value;
		this._currentRequest.setHeader(name, value);
	};
	RedirectableRequest.prototype.removeHeader = function(name) {
		delete this._options.headers[name];
		this._currentRequest.removeHeader(name);
	};
	RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
		var self = this;
		function destroyOnTimeout(socket) {
			socket.setTimeout(msecs);
			socket.removeListener("timeout", socket.destroy);
			socket.addListener("timeout", socket.destroy);
		}
		function startTimer(socket) {
			if (self._timeout) clearTimeout(self._timeout);
			self._timeout = setTimeout(function() {
				self.emit("timeout");
				clearTimer();
			}, msecs);
			destroyOnTimeout(socket);
		}
		function clearTimer() {
			if (self._timeout) {
				clearTimeout(self._timeout);
				self._timeout = null;
			}
			self.removeListener("abort", clearTimer);
			self.removeListener("error", clearTimer);
			self.removeListener("response", clearTimer);
			self.removeListener("close", clearTimer);
			if (callback) self.removeListener("timeout", callback);
			if (!self.socket) self._currentRequest.removeListener("socket", startTimer);
		}
		if (callback) this.on("timeout", callback);
		if (this.socket) startTimer(this.socket);
		else this._currentRequest.once("socket", startTimer);
		this.on("socket", destroyOnTimeout);
		this.on("abort", clearTimer);
		this.on("error", clearTimer);
		this.on("response", clearTimer);
		this.on("close", clearTimer);
		return this;
	};
	[
		"flushHeaders",
		"getHeader",
		"setNoDelay",
		"setSocketKeepAlive"
	].forEach(function(method) {
		RedirectableRequest.prototype[method] = function(a, b) {
			return this._currentRequest[method](a, b);
		};
	});
	[
		"aborted",
		"connection",
		"socket"
	].forEach(function(property) {
		Object.defineProperty(RedirectableRequest.prototype, property, { get: function() {
			return this._currentRequest[property];
		} });
	});
	RedirectableRequest.prototype._sanitizeOptions = function(options) {
		if (!options.headers) options.headers = {};
		if (options.host) {
			if (!options.hostname) options.hostname = options.host;
			delete options.host;
		}
		if (!options.pathname && options.path) {
			var searchPos = options.path.indexOf("?");
			if (searchPos < 0) options.pathname = options.path;
			else {
				options.pathname = options.path.substring(0, searchPos);
				options.search = options.path.substring(searchPos);
			}
		}
	};
	RedirectableRequest.prototype._performRequest = function() {
		var protocol = this._options.protocol;
		var nativeProtocol = this._options.nativeProtocols[protocol];
		if (!nativeProtocol) throw new TypeError("Unsupported protocol " + protocol);
		if (this._options.agents) {
			var scheme = protocol.slice(0, -1);
			this._options.agent = this._options.agents[scheme];
		}
		var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
		request._redirectable = this;
		for (var event of events) request.on(event, eventHandlers[event]);
		this._currentUrl = /^\//.test(this._options.path) ? url$2.format(this._options) : this._options.path;
		if (this._isRedirect) {
			var i = 0;
			var self = this;
			var buffers = this._requestBodyBuffers;
			(function writeNext(error) {
				// istanbul ignore else
				if (request === self._currentRequest) {
					// istanbul ignore if
					if (error) self.emit("error", error);
					else if (i < buffers.length) {
						var buffer = buffers[i++];
						// istanbul ignore else
						if (!request.finished) request.write(buffer.data, buffer.encoding, writeNext);
					} else if (self._ended) request.end();
				}
			})();
		}
	};
	RedirectableRequest.prototype._processResponse = function(response) {
		var statusCode = response.statusCode;
		if (this._options.trackRedirects) this._redirects.push({
			url: this._currentUrl,
			headers: response.headers,
			statusCode
		});
		var location = response.headers.location;
		if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
			response.responseUrl = this._currentUrl;
			response.redirects = this._redirects;
			this.emit("response", response);
			this._requestBodyBuffers = [];
			return;
		}
		destroyRequest(this._currentRequest);
		response.destroy();
		if (++this._redirectCount > this._options.maxRedirects) throw new TooManyRedirectsError();
		var requestHeaders;
		var beforeRedirect = this._options.beforeRedirect;
		if (beforeRedirect) requestHeaders = Object.assign({ Host: response.req.getHeader("host") }, this._options.headers);
		var method = this._options.method;
		if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
			this._options.method = "GET";
			this._requestBodyBuffers = [];
			removeMatchingHeaders(/^content-/i, this._options.headers);
		}
		var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
		var currentUrlParts = parseUrl(this._currentUrl);
		var currentHost = currentHostHeader || currentUrlParts.host;
		var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url$2.format(Object.assign(currentUrlParts, { host: currentHost }));
		var redirectUrl = resolveUrl(location, currentUrl);
		debug("redirecting to", redirectUrl.href);
		this._isRedirect = true;
		spreadUrlObject(redirectUrl, this._options);
		if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
		if (isFunction(beforeRedirect)) {
			var responseDetails = {
				headers: response.headers,
				statusCode
			};
			var requestDetails = {
				url: currentUrl,
				method,
				headers: requestHeaders
			};
			beforeRedirect(this._options, responseDetails, requestDetails);
			this._sanitizeOptions(this._options);
		}
		this._performRequest();
	};
	function wrap(protocols) {
		var exports$4 = {
			maxRedirects: 21,
			maxBodyLength: 10 * 1024 * 1024
		};
		var nativeProtocols = {};
		Object.keys(protocols).forEach(function(scheme) {
			var protocol = scheme + ":";
			var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
			var wrappedProtocol = exports$4[scheme] = Object.create(nativeProtocol);
			function request(input, options, callback) {
				if (isURL(input)) input = spreadUrlObject(input);
				else if (isString(input)) input = spreadUrlObject(parseUrl(input));
				else {
					callback = options;
					options = validateUrl(input);
					input = { protocol };
				}
				if (isFunction(options)) {
					callback = options;
					options = null;
				}
				options = Object.assign({
					maxRedirects: exports$4.maxRedirects,
					maxBodyLength: exports$4.maxBodyLength
				}, input, options);
				options.nativeProtocols = nativeProtocols;
				if (!isString(options.host) && !isString(options.hostname)) options.hostname = "::1";
				assert.equal(options.protocol, protocol, "protocol mismatch");
				debug("options", options);
				return new RedirectableRequest(options, callback);
			}
			function get(input, options, callback) {
				var wrappedRequest = wrappedProtocol.request(input, options, callback);
				wrappedRequest.end();
				return wrappedRequest;
			}
			Object.defineProperties(wrappedProtocol, {
				request: {
					value: request,
					configurable: true,
					enumerable: true,
					writable: true
				},
				get: {
					value: get,
					configurable: true,
					enumerable: true,
					writable: true
				}
			});
		});
		return exports$4;
	}
	function noop() {}
	function parseUrl(input) {
		var parsed;
		// istanbul ignore else
		if (useNativeURL) parsed = new URL(input);
		else {
			parsed = validateUrl(url$2.parse(input));
			if (!isString(parsed.protocol)) throw new InvalidUrlError({ input });
		}
		return parsed;
	}
	function resolveUrl(relative, base) {
		// istanbul ignore next
		return useNativeURL ? new URL(relative, base) : parseUrl(url$2.resolve(base, relative));
	}
	function validateUrl(input) {
		if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) throw new InvalidUrlError({ input: input.href || input });
		if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) throw new InvalidUrlError({ input: input.href || input });
		return input;
	}
	function spreadUrlObject(urlObject, target) {
		var spread = target || {};
		for (var key of preservedUrlFields) spread[key] = urlObject[key];
		if (spread.hostname.startsWith("[")) spread.hostname = spread.hostname.slice(1, -1);
		if (spread.port !== "") spread.port = Number(spread.port);
		spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
		return spread;
	}
	function removeMatchingHeaders(regex, headers) {
		var lastValue;
		for (var header in headers) if (regex.test(header)) {
			lastValue = headers[header];
			delete headers[header];
		}
		return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
	}
	function createErrorType(code, message, baseClass) {
		function CustomError(properties) {
			// istanbul ignore else
			if (isFunction(Error.captureStackTrace)) Error.captureStackTrace(this, this.constructor);
			Object.assign(this, properties || {});
			this.code = code;
			this.message = this.cause ? message + ": " + this.cause.message : message;
		}
		CustomError.prototype = new (baseClass || Error)();
		Object.defineProperties(CustomError.prototype, {
			constructor: {
				value: CustomError,
				enumerable: false
			},
			name: {
				value: "Error [" + code + "]",
				enumerable: false
			}
		});
		return CustomError;
	}
	function destroyRequest(request, error) {
		for (var event of events) request.removeListener(event, eventHandlers[event]);
		request.on("error", noop);
		request.destroy(error);
	}
	function isSubdomain(subdomain, domain) {
		assert(isString(subdomain) && isString(domain));
		var dot = subdomain.length - domain.length - 1;
		return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
	}
	function isString(value) {
		return typeof value === "string" || value instanceof String;
	}
	function isFunction(value) {
		return typeof value === "function";
	}
	function isBuffer(value) {
		return typeof value === "object" && "length" in value;
	}
	function isURL(value) {
		return URL && value instanceof URL;
	}
	module.exports = wrap({
		http: http$2,
		https: https$2
	});
	module.exports.wrap = wrap;
}));
var require_data = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	module.exports = { "version": "0.26.1" };
}));
var require_http = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var settle = require_settle();
	var buildFullPath = require_buildFullPath();
	var buildURL = require_buildURL();
	var http$1 = require("http");
	var https$1 = require("https");
	var httpFollow = require_follow_redirects().http;
	var httpsFollow = require_follow_redirects().https;
	var url$1 = require("url");
	var zlib$1 = require("zlib");
	var VERSION = require_data().version;
	var createError = require_createError();
	var enhanceError = require_enhanceError();
	var transitionalDefaults = require_transitional();
	var Cancel = require_Cancel();
	var isHttps = /https:?/;
	/**
	*
	* @param {http.ClientRequestArgs} options
	* @param {AxiosProxyConfig} proxy
	* @param {string} location
	*/
	function setProxy(options, proxy, location) {
		options.hostname = proxy.host;
		options.host = proxy.host;
		options.port = proxy.port;
		options.path = location;
		if (proxy.auth) {
			var base64 = Buffer.from(proxy.auth.username + ":" + proxy.auth.password, "utf8").toString("base64");
			options.headers["Proxy-Authorization"] = "Basic " + base64;
		}
		options.beforeRedirect = function beforeRedirect(redirection) {
			redirection.headers.host = redirection.host;
			setProxy(redirection, proxy, redirection.href);
		};
	}
	module.exports = function httpAdapter(config) {
		return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
			var onCanceled;
			function done() {
				if (config.cancelToken) config.cancelToken.unsubscribe(onCanceled);
				if (config.signal) config.signal.removeEventListener("abort", onCanceled);
			}
			var resolve = function resolve(value) {
				done();
				resolvePromise(value);
			};
			var rejected = false;
			var reject = function reject(value) {
				done();
				rejected = true;
				rejectPromise(value);
			};
			var data = config.data;
			var headers = config.headers;
			var headerNames = {};
			Object.keys(headers).forEach(function storeLowerName(name) {
				headerNames[name.toLowerCase()] = name;
			});
			if ("user-agent" in headerNames) {
				if (!headers[headerNames["user-agent"]]) delete headers[headerNames["user-agent"]];
			} else headers["User-Agent"] = "axios/" + VERSION;
			if (data && !utils.isStream(data)) {
				if (Buffer.isBuffer(data)) {} else if (utils.isArrayBuffer(data)) data = Buffer.from(new Uint8Array(data));
				else if (utils.isString(data)) data = Buffer.from(data, "utf-8");
				else return reject(createError("Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream", config));
				if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) return reject(createError("Request body larger than maxBodyLength limit", config));
				if (!headerNames["content-length"]) headers["Content-Length"] = data.length;
			}
			var auth = void 0;
			if (config.auth) {
				var username = config.auth.username || "";
				var password = config.auth.password || "";
				auth = username + ":" + password;
			}
			var fullPath = buildFullPath(config.baseURL, config.url);
			var parsed = url$1.parse(fullPath);
			var protocol = parsed.protocol || "http:";
			if (!auth && parsed.auth) {
				var urlAuth = parsed.auth.split(":");
				var urlUsername = urlAuth[0] || "";
				var urlPassword = urlAuth[1] || "";
				auth = urlUsername + ":" + urlPassword;
			}
			if (auth && headerNames.authorization) delete headers[headerNames.authorization];
			var isHttpsRequest = isHttps.test(protocol);
			var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
			try {
				buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, "");
			} catch (err) {
				var customErr = new Error(err.message);
				customErr.config = config;
				customErr.url = config.url;
				customErr.exists = true;
				reject(customErr);
			}
			var options = {
				path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ""),
				method: config.method.toUpperCase(),
				headers,
				agent,
				agents: {
					http: config.httpAgent,
					https: config.httpsAgent
				},
				auth
			};
			if (config.socketPath) options.socketPath = config.socketPath;
			else {
				options.hostname = parsed.hostname;
				options.port = parsed.port;
			}
			var proxy = config.proxy;
			if (!proxy && proxy !== false) {
				var proxyEnv = protocol.slice(0, -1) + "_proxy";
				var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
				if (proxyUrl) {
					var parsedProxyUrl = url$1.parse(proxyUrl);
					var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
					var shouldProxy = true;
					if (noProxyEnv) shouldProxy = !noProxyEnv.split(",").map(function trim(s) {
						return s.trim();
					}).some(function proxyMatch(proxyElement) {
						if (!proxyElement) return false;
						if (proxyElement === "*") return true;
						if (proxyElement[0] === "." && parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) return true;
						return parsed.hostname === proxyElement;
					});
					if (shouldProxy) {
						proxy = {
							host: parsedProxyUrl.hostname,
							port: parsedProxyUrl.port,
							protocol: parsedProxyUrl.protocol
						};
						if (parsedProxyUrl.auth) {
							var proxyUrlAuth = parsedProxyUrl.auth.split(":");
							proxy.auth = {
								username: proxyUrlAuth[0],
								password: proxyUrlAuth[1]
							};
						}
					}
				}
			}
			if (proxy) {
				options.headers.host = parsed.hostname + (parsed.port ? ":" + parsed.port : "");
				setProxy(options, proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
			}
			var transport;
			var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
			if (config.transport) transport = config.transport;
			else if (config.maxRedirects === 0) transport = isHttpsProxy ? https$1 : http$1;
			else {
				if (config.maxRedirects) options.maxRedirects = config.maxRedirects;
				transport = isHttpsProxy ? httpsFollow : httpFollow;
			}
			if (config.maxBodyLength > -1) options.maxBodyLength = config.maxBodyLength;
			if (config.insecureHTTPParser) options.insecureHTTPParser = config.insecureHTTPParser;
			var req = transport.request(options, function handleResponse(res) {
				if (req.aborted) return;
				var stream = res;
				var lastRequest = res.req || req;
				if (res.statusCode !== 204 && lastRequest.method !== "HEAD" && config.decompress !== false) switch (res.headers["content-encoding"]) {
					case "gzip":
					case "compress":
					case "deflate":
						stream = stream.pipe(zlib$1.createUnzip());
						delete res.headers["content-encoding"];
						break;
				}
				var response = {
					status: res.statusCode,
					statusText: res.statusMessage,
					headers: res.headers,
					config,
					request: lastRequest
				};
				if (config.responseType === "stream") {
					response.data = stream;
					settle(resolve, reject, response);
				} else {
					var responseBuffer = [];
					var totalResponseBytes = 0;
					stream.on("data", function handleStreamData(chunk) {
						responseBuffer.push(chunk);
						totalResponseBytes += chunk.length;
						if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
							rejected = true;
							stream.destroy();
							reject(createError("maxContentLength size of " + config.maxContentLength + " exceeded", config, null, lastRequest));
						}
					});
					stream.on("aborted", function handlerStreamAborted() {
						if (rejected) return;
						stream.destroy();
						reject(createError("error request aborted", config, "ERR_REQUEST_ABORTED", lastRequest));
					});
					stream.on("error", function handleStreamError(err) {
						if (req.aborted) return;
						reject(enhanceError(err, config, null, lastRequest));
					});
					stream.on("end", function handleStreamEnd() {
						try {
							var responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
							if (config.responseType !== "arraybuffer") {
								responseData = responseData.toString(config.responseEncoding);
								if (!config.responseEncoding || config.responseEncoding === "utf8") responseData = utils.stripBOM(responseData);
							}
							response.data = responseData;
						} catch (err) {
							reject(enhanceError(err, config, err.code, response.request, response));
						}
						settle(resolve, reject, response);
					});
				}
			});
			req.on("error", function handleRequestError(err) {
				if (req.aborted && err.code !== "ERR_FR_TOO_MANY_REDIRECTS") return;
				reject(enhanceError(err, config, null, req));
			});
			req.on("socket", function handleRequestSocket(socket) {
				socket.setKeepAlive(true, 1e3 * 60);
			});
			if (config.timeout) {
				var timeout = parseInt(config.timeout, 10);
				if (isNaN(timeout)) {
					reject(createError("error trying to parse `config.timeout` to int", config, "ERR_PARSE_TIMEOUT", req));
					return;
				}
				req.setTimeout(timeout, function handleRequestTimeout() {
					req.abort();
					var timeoutErrorMessage = "";
					if (config.timeoutErrorMessage) timeoutErrorMessage = config.timeoutErrorMessage;
					else timeoutErrorMessage = "timeout of " + config.timeout + "ms exceeded";
					var transitional = config.transitional || transitionalDefaults;
					reject(createError(timeoutErrorMessage, config, transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED", req));
				});
			}
			if (config.cancelToken || config.signal) {
				onCanceled = function(cancel) {
					if (req.aborted) return;
					req.abort();
					reject(!cancel || cancel && cancel.type ? new Cancel("canceled") : cancel);
				};
				config.cancelToken && config.cancelToken.subscribe(onCanceled);
				if (config.signal) config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
			}
			if (utils.isStream(data)) data.on("error", function handleStreamError(err) {
				reject(enhanceError(err, config, null, req));
			}).pipe(req);
			else req.end(data);
		});
	};
}));
var require_defaults = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var normalizeHeaderName = require_normalizeHeaderName();
	var enhanceError = require_enhanceError();
	var transitionalDefaults = require_transitional();
	var DEFAULT_CONTENT_TYPE = { "Content-Type": "application/x-www-form-urlencoded" };
	function setContentTypeIfUnset(headers, value) {
		if (!utils.isUndefined(headers) && utils.isUndefined(headers["Content-Type"])) headers["Content-Type"] = value;
	}
	function getDefaultAdapter() {
		var adapter;
		if (typeof XMLHttpRequest !== "undefined") adapter = require_xhr();
		else if (typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]") adapter = require_http();
		return adapter;
	}
	function stringifySafely(rawValue, parser, encoder) {
		if (utils.isString(rawValue)) try {
			(parser || JSON.parse)(rawValue);
			return utils.trim(rawValue);
		} catch (e) {
			if (e.name !== "SyntaxError") throw e;
		}
		return (encoder || JSON.stringify)(rawValue);
	}
	var defaults = {
		transitional: transitionalDefaults,
		adapter: getDefaultAdapter(),
		transformRequest: [function transformRequest(data, headers) {
			normalizeHeaderName(headers, "Accept");
			normalizeHeaderName(headers, "Content-Type");
			if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) return data;
			if (utils.isArrayBufferView(data)) return data.buffer;
			if (utils.isURLSearchParams(data)) {
				setContentTypeIfUnset(headers, "application/x-www-form-urlencoded;charset=utf-8");
				return data.toString();
			}
			if (utils.isObject(data) || headers && headers["Content-Type"] === "application/json") {
				setContentTypeIfUnset(headers, "application/json");
				return stringifySafely(data);
			}
			return data;
		}],
		transformResponse: [function transformResponse(data) {
			var transitional = this.transitional || defaults.transitional;
			var silentJSONParsing = transitional && transitional.silentJSONParsing;
			var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
			var strictJSONParsing = !silentJSONParsing && this.responseType === "json";
			if (strictJSONParsing || forcedJSONParsing && utils.isString(data) && data.length) try {
				return JSON.parse(data);
			} catch (e) {
				if (strictJSONParsing) {
					if (e.name === "SyntaxError") throw enhanceError(e, this, "E_JSON_PARSE");
					throw e;
				}
			}
			return data;
		}],
		timeout: 0,
		xsrfCookieName: "XSRF-TOKEN",
		xsrfHeaderName: "X-XSRF-TOKEN",
		maxContentLength: -1,
		maxBodyLength: -1,
		validateStatus: function validateStatus(status) {
			return status >= 200 && status < 300;
		},
		headers: { common: { "Accept": "application/json, text/plain, */*" } }
	};
	utils.forEach([
		"delete",
		"get",
		"head"
	], function forEachMethodNoData(method) {
		defaults.headers[method] = {};
	});
	utils.forEach([
		"post",
		"put",
		"patch"
	], function forEachMethodWithData(method) {
		defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
	});
	module.exports = defaults;
}));
var require_transformData = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var defaults = require_defaults();
	/**
	* Transform the data for a request or a response
	*
	* @param {Object|String} data The data to be transformed
	* @param {Array} headers The headers for the request or response
	* @param {Array|Function} fns A single function or Array of functions
	* @returns {*} The resulting transformed data
	*/
	module.exports = function transformData(data, headers, fns) {
		var context = this || defaults;
		utils.forEach(fns, function transform(fn) {
			data = fn.call(context, data, headers);
		});
		return data;
	};
}));
var require_isCancel = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	module.exports = function isCancel(value) {
		return !!(value && value.__CANCEL__);
	};
}));
var require_dispatchRequest = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var transformData = require_transformData();
	var isCancel = require_isCancel();
	var defaults = require_defaults();
	var Cancel = require_Cancel();
	/**
	* Throws a `Cancel` if cancellation has been requested.
	*/
	function throwIfCancellationRequested(config) {
		if (config.cancelToken) config.cancelToken.throwIfRequested();
		if (config.signal && config.signal.aborted) throw new Cancel("canceled");
	}
	/**
	* Dispatch a request to the server using the configured adapter.
	*
	* @param {object} config The config that is to be used for the request
	* @returns {Promise} The Promise to be fulfilled
	*/
	module.exports = function dispatchRequest(config) {
		throwIfCancellationRequested(config);
		config.headers = config.headers || {};
		config.data = transformData.call(config, config.data, config.headers, config.transformRequest);
		config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers);
		utils.forEach([
			"delete",
			"get",
			"head",
			"post",
			"put",
			"patch",
			"common"
		], function cleanHeaderConfig(method) {
			delete config.headers[method];
		});
		return (config.adapter || defaults.adapter)(config).then(function onAdapterResolution(response) {
			throwIfCancellationRequested(config);
			response.data = transformData.call(config, response.data, response.headers, config.transformResponse);
			return response;
		}, function onAdapterRejection(reason) {
			if (!isCancel(reason)) {
				throwIfCancellationRequested(config);
				if (reason && reason.response) reason.response.data = transformData.call(config, reason.response.data, reason.response.headers, config.transformResponse);
			}
			return Promise.reject(reason);
		});
	};
}));
var require_mergeConfig = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	/**
	* Config-specific merge-function which creates a new config-object
	* by merging two configuration objects together.
	*
	* @param {Object} config1
	* @param {Object} config2
	* @returns {Object} New object resulting from merging config2 to config1
	*/
	module.exports = function mergeConfig(config1, config2) {
		config2 = config2 || {};
		var config = {};
		function getMergedValue(target, source) {
			if (utils.isPlainObject(target) && utils.isPlainObject(source)) return utils.merge(target, source);
			else if (utils.isPlainObject(source)) return utils.merge({}, source);
			else if (utils.isArray(source)) return source.slice();
			return source;
		}
		function mergeDeepProperties(prop) {
			if (!utils.isUndefined(config2[prop])) return getMergedValue(config1[prop], config2[prop]);
			else if (!utils.isUndefined(config1[prop])) return getMergedValue(void 0, config1[prop]);
		}
		function valueFromConfig2(prop) {
			if (!utils.isUndefined(config2[prop])) return getMergedValue(void 0, config2[prop]);
		}
		function defaultToConfig2(prop) {
			if (!utils.isUndefined(config2[prop])) return getMergedValue(void 0, config2[prop]);
			else if (!utils.isUndefined(config1[prop])) return getMergedValue(void 0, config1[prop]);
		}
		function mergeDirectKeys(prop) {
			if (prop in config2) return getMergedValue(config1[prop], config2[prop]);
			else if (prop in config1) return getMergedValue(void 0, config1[prop]);
		}
		var mergeMap = {
			"url": valueFromConfig2,
			"method": valueFromConfig2,
			"data": valueFromConfig2,
			"baseURL": defaultToConfig2,
			"transformRequest": defaultToConfig2,
			"transformResponse": defaultToConfig2,
			"paramsSerializer": defaultToConfig2,
			"timeout": defaultToConfig2,
			"timeoutMessage": defaultToConfig2,
			"withCredentials": defaultToConfig2,
			"adapter": defaultToConfig2,
			"responseType": defaultToConfig2,
			"xsrfCookieName": defaultToConfig2,
			"xsrfHeaderName": defaultToConfig2,
			"onUploadProgress": defaultToConfig2,
			"onDownloadProgress": defaultToConfig2,
			"decompress": defaultToConfig2,
			"maxContentLength": defaultToConfig2,
			"maxBodyLength": defaultToConfig2,
			"transport": defaultToConfig2,
			"httpAgent": defaultToConfig2,
			"httpsAgent": defaultToConfig2,
			"cancelToken": defaultToConfig2,
			"socketPath": defaultToConfig2,
			"responseEncoding": defaultToConfig2,
			"validateStatus": mergeDirectKeys
		};
		utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
			var merge = mergeMap[prop] || mergeDeepProperties;
			var configValue = merge(prop);
			utils.isUndefined(configValue) && merge !== mergeDirectKeys || (config[prop] = configValue);
		});
		return config;
	};
}));
var require_validator = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var VERSION = require_data().version;
	var validators = {};
	[
		"object",
		"boolean",
		"number",
		"function",
		"string",
		"symbol"
	].forEach(function(type, i) {
		validators[type] = function validator(thing) {
			return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
		};
	});
	var deprecatedWarnings = {};
	/**
	* Transitional option validator
	* @param {function|boolean?} validator - set to false if the transitional option has been removed
	* @param {string?} version - deprecated version / removed since version
	* @param {string?} message - some message with additional info
	* @returns {function}
	*/
	validators.transitional = function transitional(validator, version, message) {
		function formatMessage(opt, desc) {
			return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
		}
		return function(value, opt, opts) {
			if (validator === false) throw new Error(formatMessage(opt, " has been removed" + (version ? " in " + version : "")));
			if (version && !deprecatedWarnings[opt]) {
				deprecatedWarnings[opt] = true;
				console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
			}
			return validator ? validator(value, opt, opts) : true;
		};
	};
	/**
	* Assert object's properties type
	* @param {object} options
	* @param {object} schema
	* @param {boolean?} allowUnknown
	*/
	function assertOptions(options, schema, allowUnknown) {
		if (typeof options !== "object") throw new TypeError("options must be an object");
		var keys = Object.keys(options);
		var i = keys.length;
		while (i-- > 0) {
			var opt = keys[i];
			var validator = schema[opt];
			if (validator) {
				var value = options[opt];
				var result = value === void 0 || validator(value, opt, options);
				if (result !== true) throw new TypeError("option " + opt + " must be " + result);
				continue;
			}
			if (allowUnknown !== true) throw Error("Unknown option " + opt);
		}
	}
	module.exports = {
		assertOptions,
		validators
	};
}));
var require_Axios = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var buildURL = require_buildURL();
	var InterceptorManager = require_InterceptorManager();
	var dispatchRequest = require_dispatchRequest();
	var mergeConfig = require_mergeConfig();
	var validator = require_validator();
	var validators = validator.validators;
	/**
	* Create a new instance of Axios
	*
	* @param {Object} instanceConfig The default config for the instance
	*/
	function Axios(instanceConfig) {
		this.defaults = instanceConfig;
		this.interceptors = {
			request: new InterceptorManager(),
			response: new InterceptorManager()
		};
	}
	/**
	* Dispatch a request
	*
	* @param {Object} config The config specific for this request (merged with this.defaults)
	*/
	Axios.prototype.request = function request(configOrUrl, config) {
		if (typeof configOrUrl === "string") {
			config = config || {};
			config.url = configOrUrl;
		} else config = configOrUrl || {};
		config = mergeConfig(this.defaults, config);
		if (config.method) config.method = config.method.toLowerCase();
		else if (this.defaults.method) config.method = this.defaults.method.toLowerCase();
		else config.method = "get";
		var transitional = config.transitional;
		if (transitional !== void 0) validator.assertOptions(transitional, {
			silentJSONParsing: validators.transitional(validators.boolean),
			forcedJSONParsing: validators.transitional(validators.boolean),
			clarifyTimeoutError: validators.transitional(validators.boolean)
		}, false);
		var requestInterceptorChain = [];
		var synchronousRequestInterceptors = true;
		this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
			if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) return;
			synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
			requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
		});
		var responseInterceptorChain = [];
		this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
			responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
		});
		var promise;
		if (!synchronousRequestInterceptors) {
			var chain = [dispatchRequest, void 0];
			Array.prototype.unshift.apply(chain, requestInterceptorChain);
			chain = chain.concat(responseInterceptorChain);
			promise = Promise.resolve(config);
			while (chain.length) promise = promise.then(chain.shift(), chain.shift());
			return promise;
		}
		var newConfig = config;
		while (requestInterceptorChain.length) {
			var onFulfilled = requestInterceptorChain.shift();
			var onRejected = requestInterceptorChain.shift();
			try {
				newConfig = onFulfilled(newConfig);
			} catch (error) {
				onRejected(error);
				break;
			}
		}
		try {
			promise = dispatchRequest(newConfig);
		} catch (error) {
			return Promise.reject(error);
		}
		while (responseInterceptorChain.length) promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
		return promise;
	};
	Axios.prototype.getUri = function getUri(config) {
		config = mergeConfig(this.defaults, config);
		return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, "");
	};
	utils.forEach([
		"delete",
		"get",
		"head",
		"options"
	], function forEachMethodNoData(method) {
		Axios.prototype[method] = function(url, config) {
			return this.request(mergeConfig(config || {}, {
				method,
				url,
				data: (config || {}).data
			}));
		};
	});
	utils.forEach([
		"post",
		"put",
		"patch"
	], function forEachMethodWithData(method) {
		Axios.prototype[method] = function(url, data, config) {
			return this.request(mergeConfig(config || {}, {
				method,
				url,
				data
			}));
		};
	});
	module.exports = Axios;
}));
var require_CancelToken = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var Cancel = require_Cancel();
	/**
	* A `CancelToken` is an object that can be used to request cancellation of an operation.
	*
	* @class
	* @param {Function} executor The executor function.
	*/
	function CancelToken(executor) {
		if (typeof executor !== "function") throw new TypeError("executor must be a function.");
		var resolvePromise;
		this.promise = new Promise(function promiseExecutor(resolve) {
			resolvePromise = resolve;
		});
		var token = this;
		this.promise.then(function(cancel) {
			if (!token._listeners) return;
			var i;
			var l = token._listeners.length;
			for (i = 0; i < l; i++) token._listeners[i](cancel);
			token._listeners = null;
		});
		this.promise.then = function(onfulfilled) {
			var _resolve;
			var promise = new Promise(function(resolve) {
				token.subscribe(resolve);
				_resolve = resolve;
			}).then(onfulfilled);
			promise.cancel = function reject() {
				token.unsubscribe(_resolve);
			};
			return promise;
		};
		executor(function cancel(message) {
			if (token.reason) return;
			token.reason = new Cancel(message);
			resolvePromise(token.reason);
		});
	}
	/**
	* Throws a `Cancel` if cancellation has been requested.
	*/
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
		if (this.reason) throw this.reason;
	};
	/**
	* Subscribe to the cancel signal
	*/
	CancelToken.prototype.subscribe = function subscribe(listener) {
		if (this.reason) {
			listener(this.reason);
			return;
		}
		if (this._listeners) this._listeners.push(listener);
		else this._listeners = [listener];
	};
	/**
	* Unsubscribe from the cancel signal
	*/
	CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
		if (!this._listeners) return;
		var index = this._listeners.indexOf(listener);
		if (index !== -1) this._listeners.splice(index, 1);
	};
	/**
	* Returns an object that contains a new `CancelToken` and a function that, when called,
	* cancels the `CancelToken`.
	*/
	CancelToken.source = function source() {
		var cancel;
		return {
			token: new CancelToken(function executor(c) {
				cancel = c;
			}),
			cancel
		};
	};
	module.exports = CancelToken;
}));
var require_spread = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	/**
	* Syntactic sugar for invoking a function and expanding an array for arguments.
	*
	* Common use case would be to use `Function.prototype.apply`.
	*
	*  ```js
	*  function f(x, y, z) {}
	*  var args = [1, 2, 3];
	*  f.apply(null, args);
	*  ```
	*
	* With `spread` this example can be re-written.
	*
	*  ```js
	*  spread(function(x, y, z) {})([1, 2, 3]);
	*  ```
	*
	* @param {Function} callback
	* @returns {Function}
	*/
	module.exports = function spread(callback) {
		return function wrap(arr) {
			return callback.apply(null, arr);
		};
	};
}));
var require_isAxiosError = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	/**
	* Determines whether the payload is an error thrown by Axios
	*
	* @param {*} payload The value to test
	* @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
	*/
	module.exports = function isAxiosError(payload) {
		return utils.isObject(payload) && payload.isAxiosError === true;
	};
}));
var require_axios$1 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils();
	var bind = require_bind();
	var Axios = require_Axios();
	var mergeConfig = require_mergeConfig();
	var defaults = require_defaults();
	/**
	* Create an instance of Axios
	*
	* @param {Object} defaultConfig The default config for the instance
	* @return {Axios} A new instance of Axios
	*/
	function createInstance(defaultConfig) {
		var context = new Axios(defaultConfig);
		var instance = bind(Axios.prototype.request, context);
		utils.extend(instance, Axios.prototype, context);
		utils.extend(instance, context);
		instance.create = function create(instanceConfig) {
			return createInstance(mergeConfig(defaultConfig, instanceConfig));
		};
		return instance;
	}
	var axios = createInstance(defaults);
	axios.Axios = Axios;
	axios.Cancel = require_Cancel();
	axios.CancelToken = require_CancelToken();
	axios.isCancel = require_isCancel();
	axios.VERSION = require_data().version;
	axios.all = function all(promises) {
		return Promise.all(promises);
	};
	axios.spread = require_spread();
	axios.isAxiosError = require_isAxiosError();
	module.exports = axios;
	module.exports.default = axios;
}));
var require_axios = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	module.exports = require_axios$1();
}));
var DefaultRestOperationsFactory = class DefaultRestOperationsFactory {
		create() {
			return axios_1.default.create(this.clientConfig);
		}
	};
const axios_1=require_axios();
return {DefaultRestOperationsFactory,axios:axios_1.default};
}
