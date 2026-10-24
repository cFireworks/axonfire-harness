// @ts-nocheck
// Original application local storage and captured hash utility closure.
import * as nodeFs from 'node:fs';import * as nodePath from 'node:path';import * as nodeOs from 'node:os';import {createRequire} from 'node:module';import {createNativeAuthenticationRuntime} from '../auth/native-authentication.js';import {createNativeAuthProductCoordinator} from './native-auth-product-coordinator.js';
const nodeRequire=createRequire(import.meta.url);
export const WORKBUDDY_LOCAL_STORAGE_SOURCE=[{"file":"chunk.js","sha256":"d92687c96377faa98b2524502408c7a73328d6dc4e702c7a61c575218e3f75b4","regions":[{"from":370,"to":472}]},{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":696670,"to":697021},{"from":697093,"to":697778},{"from":697842,"to":698190},{"from":698259,"to":703985},{"from":704055,"to":706197},{"from":706271,"to":707218},{"from":707287,"to":708918},{"from":708989,"to":712018},{"from":712089,"to":712816},{"from":712887,"to":721150},{"from":721221,"to":722071},{"from":722138,"to":722386},{"from":722456,"to":726532},{"from":726600,"to":727717},{"from":727780,"to":728238},{"from":728304,"to":745832},{"from":746158,"to":746430}]},{"file":"module.app-server.js","sha256":"965b5e0124e633fc71dd2a7adc2d777ce1b621631fd30994a03a544e3e23c37d","regions":[{"from":748587,"to":748630},{"from":748631,"to":748662},{"from":748663,"to":748687},{"from":748774,"to":751512}]}] as const;
export function createNativeWorkbuddyLocalStorage(runtime:any={}){
const fs=runtime.fs??nodeFs,path={default:nodePath},os=runtime.os??nodeOs,process=runtime.process??globalThis.process,require=runtime.require??nodeRequire,logger=runtime.logger??console;
const import_common$1={Emitter:runtime.Emitter??createNativeAuthenticationRuntime(runtime).getModule(96771).Emitter};
const require_workbuddy_product_config=runtime.productConfig??createNativeAuthProductCoordinator(runtime).productConfig;
const HashUtils=(()=>{
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
const require_chunk={__commonJSMin};var HashUtils;
var require_minimalistic_assert = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	module.exports = assert;
	function assert(val, msg) {
		if (!val) throw new Error(msg || "Assertion failed");
	}
	assert.equal = function assertEqual(l, r, msg) {
		if (l != r) throw new Error(msg || "Assertion failed: " + l + " != " + r);
	};
}));
var require_inherits_browser = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	if (typeof Object.create === "function") module.exports = function inherits(ctor, superCtor) {
		if (superCtor) {
			ctor.super_ = superCtor;
			ctor.prototype = Object.create(superCtor.prototype, { constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			} });
		}
	};
	else module.exports = function inherits(ctor, superCtor) {
		if (superCtor) {
			ctor.super_ = superCtor;
			var TempCtor = function() {};
			TempCtor.prototype = superCtor.prototype;
			ctor.prototype = new TempCtor();
			ctor.prototype.constructor = ctor;
		}
	};
}));
var require_inherits = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	try {
		var util$5 = require("util");
		/* istanbul ignore next */
		if (typeof util$5.inherits !== "function") throw "";
		module.exports = util$5.inherits;
	} catch (e) {
		/* istanbul ignore next */
		module.exports = require_inherits_browser();
	}
}));
var require_utils$1 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var assert = require_minimalistic_assert();
	exports.inherits = require_inherits();
	function isSurrogatePair(msg, i) {
		if ((msg.charCodeAt(i) & 64512) !== 55296) return false;
		if (i < 0 || i + 1 >= msg.length) return false;
		return (msg.charCodeAt(i + 1) & 64512) === 56320;
	}
	function toArray(msg, enc) {
		if (Array.isArray(msg)) return msg.slice();
		if (!msg) return [];
		var res = [];
		if (typeof msg === "string") {
			if (!enc) {
				var p = 0;
				for (var i = 0; i < msg.length; i++) {
					var c = msg.charCodeAt(i);
					if (c < 128) res[p++] = c;
					else if (c < 2048) {
						res[p++] = c >> 6 | 192;
						res[p++] = c & 63 | 128;
					} else if (isSurrogatePair(msg, i)) {
						c = 65536 + ((c & 1023) << 10) + (msg.charCodeAt(++i) & 1023);
						res[p++] = c >> 18 | 240;
						res[p++] = c >> 12 & 63 | 128;
						res[p++] = c >> 6 & 63 | 128;
						res[p++] = c & 63 | 128;
					} else {
						res[p++] = c >> 12 | 224;
						res[p++] = c >> 6 & 63 | 128;
						res[p++] = c & 63 | 128;
					}
				}
			} else if (enc === "hex") {
				msg = msg.replace(/[^a-z0-9]+/gi, "");
				if (msg.length % 2 !== 0) msg = "0" + msg;
				for (i = 0; i < msg.length; i += 2) res.push(parseInt(msg[i] + msg[i + 1], 16));
			}
		} else for (i = 0; i < msg.length; i++) res[i] = msg[i] | 0;
		return res;
	}
	exports.toArray = toArray;
	function toHex(msg) {
		var res = "";
		for (var i = 0; i < msg.length; i++) res += zero2(msg[i].toString(16));
		return res;
	}
	exports.toHex = toHex;
	function htonl(w) {
		return (w >>> 24 | w >>> 8 & 65280 | w << 8 & 16711680 | (w & 255) << 24) >>> 0;
	}
	exports.htonl = htonl;
	function toHex32(msg, endian) {
		var res = "";
		for (var i = 0; i < msg.length; i++) {
			var w = msg[i];
			if (endian === "little") w = htonl(w);
			res += zero8(w.toString(16));
		}
		return res;
	}
	exports.toHex32 = toHex32;
	function zero2(word) {
		if (word.length === 1) return "0" + word;
		else return word;
	}
	exports.zero2 = zero2;
	function zero8(word) {
		if (word.length === 7) return "0" + word;
		else if (word.length === 6) return "00" + word;
		else if (word.length === 5) return "000" + word;
		else if (word.length === 4) return "0000" + word;
		else if (word.length === 3) return "00000" + word;
		else if (word.length === 2) return "000000" + word;
		else if (word.length === 1) return "0000000" + word;
		else return word;
	}
	exports.zero8 = zero8;
	function join32(msg, start, end, endian) {
		var len = end - start;
		assert(len % 4 === 0);
		var res = new Array(len / 4);
		for (var i = 0, k = start; i < res.length; i++, k += 4) {
			var w;
			if (endian === "big") w = msg[k] << 24 | msg[k + 1] << 16 | msg[k + 2] << 8 | msg[k + 3];
			else w = msg[k + 3] << 24 | msg[k + 2] << 16 | msg[k + 1] << 8 | msg[k];
			res[i] = w >>> 0;
		}
		return res;
	}
	exports.join32 = join32;
	function split32(msg, endian) {
		var res = new Array(msg.length * 4);
		for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
			var m = msg[i];
			if (endian === "big") {
				res[k] = m >>> 24;
				res[k + 1] = m >>> 16 & 255;
				res[k + 2] = m >>> 8 & 255;
				res[k + 3] = m & 255;
			} else {
				res[k + 3] = m >>> 24;
				res[k + 2] = m >>> 16 & 255;
				res[k + 1] = m >>> 8 & 255;
				res[k] = m & 255;
			}
		}
		return res;
	}
	exports.split32 = split32;
	function rotr32(w, b) {
		return w >>> b | w << 32 - b;
	}
	exports.rotr32 = rotr32;
	function rotl32(w, b) {
		return w << b | w >>> 32 - b;
	}
	exports.rotl32 = rotl32;
	function sum32(a, b) {
		return a + b >>> 0;
	}
	exports.sum32 = sum32;
	function sum32_3(a, b, c) {
		return a + b + c >>> 0;
	}
	exports.sum32_3 = sum32_3;
	function sum32_4(a, b, c, d) {
		return a + b + c + d >>> 0;
	}
	exports.sum32_4 = sum32_4;
	function sum32_5(a, b, c, d, e) {
		return a + b + c + d + e >>> 0;
	}
	exports.sum32_5 = sum32_5;
	function sum64(buf, pos, ah, al) {
		var bh = buf[pos];
		var lo = al + buf[pos + 1] >>> 0;
		buf[pos] = (lo < al ? 1 : 0) + ah + bh >>> 0;
		buf[pos + 1] = lo;
	}
	exports.sum64 = sum64;
	function sum64_hi(ah, al, bh, bl) {
		return (al + bl >>> 0 < al ? 1 : 0) + ah + bh >>> 0;
	}
	exports.sum64_hi = sum64_hi;
	function sum64_lo(ah, al, bh, bl) {
		return al + bl >>> 0;
	}
	exports.sum64_lo = sum64_lo;
	function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
		var carry = 0;
		var lo = al;
		lo = lo + bl >>> 0;
		carry += lo < al ? 1 : 0;
		lo = lo + cl >>> 0;
		carry += lo < cl ? 1 : 0;
		lo = lo + dl >>> 0;
		carry += lo < dl ? 1 : 0;
		return ah + bh + ch + dh + carry >>> 0;
	}
	exports.sum64_4_hi = sum64_4_hi;
	function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
		return al + bl + cl + dl >>> 0;
	}
	exports.sum64_4_lo = sum64_4_lo;
	function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
		var carry = 0;
		var lo = al;
		lo = lo + bl >>> 0;
		carry += lo < al ? 1 : 0;
		lo = lo + cl >>> 0;
		carry += lo < cl ? 1 : 0;
		lo = lo + dl >>> 0;
		carry += lo < dl ? 1 : 0;
		lo = lo + el >>> 0;
		carry += lo < el ? 1 : 0;
		return ah + bh + ch + dh + eh + carry >>> 0;
	}
	exports.sum64_5_hi = sum64_5_hi;
	function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
		return al + bl + cl + dl + el >>> 0;
	}
	exports.sum64_5_lo = sum64_5_lo;
	function rotr64_hi(ah, al, num) {
		return (al << 32 - num | ah >>> num) >>> 0;
	}
	exports.rotr64_hi = rotr64_hi;
	function rotr64_lo(ah, al, num) {
		return (ah << 32 - num | al >>> num) >>> 0;
	}
	exports.rotr64_lo = rotr64_lo;
	function shr64_hi(ah, al, num) {
		return ah >>> num;
	}
	exports.shr64_hi = shr64_hi;
	function shr64_lo(ah, al, num) {
		return (ah << 32 - num | al >>> num) >>> 0;
	}
	exports.shr64_lo = shr64_lo;
}));
var require_common$3 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var utils = require_utils$1();
	var assert = require_minimalistic_assert();
	function BlockHash() {
		this.pending = null;
		this.pendingTotal = 0;
		this.blockSize = this.constructor.blockSize;
		this.outSize = this.constructor.outSize;
		this.hmacStrength = this.constructor.hmacStrength;
		this.padLength = this.constructor.padLength / 8;
		this.endian = "big";
		this._delta8 = this.blockSize / 8;
		this._delta32 = this.blockSize / 32;
	}
	exports.BlockHash = BlockHash;
	BlockHash.prototype.update = function update(msg, enc) {
		msg = utils.toArray(msg, enc);
		if (!this.pending) this.pending = msg;
		else this.pending = this.pending.concat(msg);
		this.pendingTotal += msg.length;
		if (this.pending.length >= this._delta8) {
			msg = this.pending;
			var r = msg.length % this._delta8;
			this.pending = msg.slice(msg.length - r, msg.length);
			if (this.pending.length === 0) this.pending = null;
			msg = utils.join32(msg, 0, msg.length - r, this.endian);
			for (var i = 0; i < msg.length; i += this._delta32) this._update(msg, i, i + this._delta32);
		}
		return this;
	};
	BlockHash.prototype.digest = function digest(enc) {
		this.update(this._pad());
		assert(this.pending === null);
		return this._digest(enc);
	};
	BlockHash.prototype._pad = function pad() {
		var len = this.pendingTotal;
		var bytes = this._delta8;
		var k = bytes - (len + this.padLength) % bytes;
		var res = new Array(k + this.padLength);
		res[0] = 128;
		for (var i = 1; i < k; i++) res[i] = 0;
		len <<= 3;
		if (this.endian === "big") {
			for (var t = 8; t < this.padLength; t++) res[i++] = 0;
			res[i++] = 0;
			res[i++] = 0;
			res[i++] = 0;
			res[i++] = 0;
			res[i++] = len >>> 24 & 255;
			res[i++] = len >>> 16 & 255;
			res[i++] = len >>> 8 & 255;
			res[i++] = len & 255;
		} else {
			res[i++] = len & 255;
			res[i++] = len >>> 8 & 255;
			res[i++] = len >>> 16 & 255;
			res[i++] = len >>> 24 & 255;
			res[i++] = 0;
			res[i++] = 0;
			res[i++] = 0;
			res[i++] = 0;
			for (t = 8; t < this.padLength; t++) res[i++] = 0;
		}
		return res;
	};
}));
var require_common$2 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var rotr32 = require_utils$1().rotr32;
	function ft_1(s, x, y, z) {
		if (s === 0) return ch32(x, y, z);
		if (s === 1 || s === 3) return p32(x, y, z);
		if (s === 2) return maj32(x, y, z);
	}
	exports.ft_1 = ft_1;
	function ch32(x, y, z) {
		return x & y ^ ~x & z;
	}
	exports.ch32 = ch32;
	function maj32(x, y, z) {
		return x & y ^ x & z ^ y & z;
	}
	exports.maj32 = maj32;
	function p32(x, y, z) {
		return x ^ y ^ z;
	}
	exports.p32 = p32;
	function s0_256(x) {
		return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
	}
	exports.s0_256 = s0_256;
	function s1_256(x) {
		return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
	}
	exports.s1_256 = s1_256;
	function g0_256(x) {
		return rotr32(x, 7) ^ rotr32(x, 18) ^ x >>> 3;
	}
	exports.g0_256 = g0_256;
	function g1_256(x) {
		return rotr32(x, 17) ^ rotr32(x, 19) ^ x >>> 10;
	}
	exports.g1_256 = g1_256;
}));
var require__1 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils$1();
	var common = require_common$3();
	var shaCommon = require_common$2();
	var rotl32 = utils.rotl32;
	var sum32 = utils.sum32;
	var sum32_5 = utils.sum32_5;
	var ft_1 = shaCommon.ft_1;
	var BlockHash = common.BlockHash;
	var sha1_K = [
		1518500249,
		1859775393,
		2400959708,
		3395469782
	];
	function SHA1() {
		if (!(this instanceof SHA1)) return new SHA1();
		BlockHash.call(this);
		this.h = [
			1732584193,
			4023233417,
			2562383102,
			271733878,
			3285377520
		];
		this.W = new Array(80);
	}
	utils.inherits(SHA1, BlockHash);
	module.exports = SHA1;
	SHA1.blockSize = 512;
	SHA1.outSize = 160;
	SHA1.hmacStrength = 80;
	SHA1.padLength = 64;
	SHA1.prototype._update = function _update(msg, start) {
		var W = this.W;
		for (var i = 0; i < 16; i++) W[i] = msg[start + i];
		for (; i < W.length; i++) W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
		var a = this.h[0];
		var b = this.h[1];
		var c = this.h[2];
		var d = this.h[3];
		var e = this.h[4];
		for (i = 0; i < W.length; i++) {
			var s = ~~(i / 20);
			var t = sum32_5(rotl32(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
			e = d;
			d = c;
			c = rotl32(b, 30);
			b = a;
			a = t;
		}
		this.h[0] = sum32(this.h[0], a);
		this.h[1] = sum32(this.h[1], b);
		this.h[2] = sum32(this.h[2], c);
		this.h[3] = sum32(this.h[3], d);
		this.h[4] = sum32(this.h[4], e);
	};
	SHA1.prototype._digest = function digest(enc) {
		if (enc === "hex") return utils.toHex32(this.h, "big");
		else return utils.split32(this.h, "big");
	};
}));
var require__256 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils$1();
	var common = require_common$3();
	var shaCommon = require_common$2();
	var assert = require_minimalistic_assert();
	var sum32 = utils.sum32;
	var sum32_4 = utils.sum32_4;
	var sum32_5 = utils.sum32_5;
	var ch32 = shaCommon.ch32;
	var maj32 = shaCommon.maj32;
	var s0_256 = shaCommon.s0_256;
	var s1_256 = shaCommon.s1_256;
	var g0_256 = shaCommon.g0_256;
	var g1_256 = shaCommon.g1_256;
	var BlockHash = common.BlockHash;
	var sha256_K = [
		1116352408,
		1899447441,
		3049323471,
		3921009573,
		961987163,
		1508970993,
		2453635748,
		2870763221,
		3624381080,
		310598401,
		607225278,
		1426881987,
		1925078388,
		2162078206,
		2614888103,
		3248222580,
		3835390401,
		4022224774,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		2554220882,
		2821834349,
		2952996808,
		3210313671,
		3336571891,
		3584528711,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		2177026350,
		2456956037,
		2730485921,
		2820302411,
		3259730800,
		3345764771,
		3516065817,
		3600352804,
		4094571909,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		2227730452,
		2361852424,
		2428436474,
		2756734187,
		3204031479,
		3329325298
	];
	function SHA256() {
		if (!(this instanceof SHA256)) return new SHA256();
		BlockHash.call(this);
		this.h = [
			1779033703,
			3144134277,
			1013904242,
			2773480762,
			1359893119,
			2600822924,
			528734635,
			1541459225
		];
		this.k = sha256_K;
		this.W = new Array(64);
	}
	utils.inherits(SHA256, BlockHash);
	module.exports = SHA256;
	SHA256.blockSize = 512;
	SHA256.outSize = 256;
	SHA256.hmacStrength = 192;
	SHA256.padLength = 64;
	SHA256.prototype._update = function _update(msg, start) {
		var W = this.W;
		for (var i = 0; i < 16; i++) W[i] = msg[start + i];
		for (; i < W.length; i++) W[i] = sum32_4(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);
		var a = this.h[0];
		var b = this.h[1];
		var c = this.h[2];
		var d = this.h[3];
		var e = this.h[4];
		var f = this.h[5];
		var g = this.h[6];
		var h = this.h[7];
		assert(this.k.length === W.length);
		for (i = 0; i < W.length; i++) {
			var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
			var T2 = sum32(s0_256(a), maj32(a, b, c));
			h = g;
			g = f;
			f = e;
			e = sum32(d, T1);
			d = c;
			c = b;
			b = a;
			a = sum32(T1, T2);
		}
		this.h[0] = sum32(this.h[0], a);
		this.h[1] = sum32(this.h[1], b);
		this.h[2] = sum32(this.h[2], c);
		this.h[3] = sum32(this.h[3], d);
		this.h[4] = sum32(this.h[4], e);
		this.h[5] = sum32(this.h[5], f);
		this.h[6] = sum32(this.h[6], g);
		this.h[7] = sum32(this.h[7], h);
	};
	SHA256.prototype._digest = function digest(enc) {
		if (enc === "hex") return utils.toHex32(this.h, "big");
		else return utils.split32(this.h, "big");
	};
}));
var require__224 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils$1();
	var SHA256 = require__256();
	function SHA224() {
		if (!(this instanceof SHA224)) return new SHA224();
		SHA256.call(this);
		this.h = [
			3238371032,
			914150663,
			812702999,
			4144912697,
			4290775857,
			1750603025,
			1694076839,
			3204075428
		];
	}
	utils.inherits(SHA224, SHA256);
	module.exports = SHA224;
	SHA224.blockSize = 512;
	SHA224.outSize = 224;
	SHA224.hmacStrength = 192;
	SHA224.padLength = 64;
	SHA224.prototype._digest = function digest(enc) {
		if (enc === "hex") return utils.toHex32(this.h.slice(0, 7), "big");
		else return utils.split32(this.h.slice(0, 7), "big");
	};
}));
var require__512 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils$1();
	var common = require_common$3();
	var assert = require_minimalistic_assert();
	var rotr64_hi = utils.rotr64_hi;
	var rotr64_lo = utils.rotr64_lo;
	var shr64_hi = utils.shr64_hi;
	var shr64_lo = utils.shr64_lo;
	var sum64 = utils.sum64;
	var sum64_hi = utils.sum64_hi;
	var sum64_lo = utils.sum64_lo;
	var sum64_4_hi = utils.sum64_4_hi;
	var sum64_4_lo = utils.sum64_4_lo;
	var sum64_5_hi = utils.sum64_5_hi;
	var sum64_5_lo = utils.sum64_5_lo;
	var BlockHash = common.BlockHash;
	var sha512_K = [
		1116352408,
		3609767458,
		1899447441,
		602891725,
		3049323471,
		3964484399,
		3921009573,
		2173295548,
		961987163,
		4081628472,
		1508970993,
		3053834265,
		2453635748,
		2937671579,
		2870763221,
		3664609560,
		3624381080,
		2734883394,
		310598401,
		1164996542,
		607225278,
		1323610764,
		1426881987,
		3590304994,
		1925078388,
		4068182383,
		2162078206,
		991336113,
		2614888103,
		633803317,
		3248222580,
		3479774868,
		3835390401,
		2666613458,
		4022224774,
		944711139,
		264347078,
		2341262773,
		604807628,
		2007800933,
		770255983,
		1495990901,
		1249150122,
		1856431235,
		1555081692,
		3175218132,
		1996064986,
		2198950837,
		2554220882,
		3999719339,
		2821834349,
		766784016,
		2952996808,
		2566594879,
		3210313671,
		3203337956,
		3336571891,
		1034457026,
		3584528711,
		2466948901,
		113926993,
		3758326383,
		338241895,
		168717936,
		666307205,
		1188179964,
		773529912,
		1546045734,
		1294757372,
		1522805485,
		1396182291,
		2643833823,
		1695183700,
		2343527390,
		1986661051,
		1014477480,
		2177026350,
		1206759142,
		2456956037,
		344077627,
		2730485921,
		1290863460,
		2820302411,
		3158454273,
		3259730800,
		3505952657,
		3345764771,
		106217008,
		3516065817,
		3606008344,
		3600352804,
		1432725776,
		4094571909,
		1467031594,
		275423344,
		851169720,
		430227734,
		3100823752,
		506948616,
		1363258195,
		659060556,
		3750685593,
		883997877,
		3785050280,
		958139571,
		3318307427,
		1322822218,
		3812723403,
		1537002063,
		2003034995,
		1747873779,
		3602036899,
		1955562222,
		1575990012,
		2024104815,
		1125592928,
		2227730452,
		2716904306,
		2361852424,
		442776044,
		2428436474,
		593698344,
		2756734187,
		3733110249,
		3204031479,
		2999351573,
		3329325298,
		3815920427,
		3391569614,
		3928383900,
		3515267271,
		566280711,
		3940187606,
		3454069534,
		4118630271,
		4000239992,
		116418474,
		1914138554,
		174292421,
		2731055270,
		289380356,
		3203993006,
		460393269,
		320620315,
		685471733,
		587496836,
		852142971,
		1086792851,
		1017036298,
		365543100,
		1126000580,
		2618297676,
		1288033470,
		3409855158,
		1501505948,
		4234509866,
		1607167915,
		987167468,
		1816402316,
		1246189591
	];
	function SHA512() {
		if (!(this instanceof SHA512)) return new SHA512();
		BlockHash.call(this);
		this.h = [
			1779033703,
			4089235720,
			3144134277,
			2227873595,
			1013904242,
			4271175723,
			2773480762,
			1595750129,
			1359893119,
			2917565137,
			2600822924,
			725511199,
			528734635,
			4215389547,
			1541459225,
			327033209
		];
		this.k = sha512_K;
		this.W = new Array(160);
	}
	utils.inherits(SHA512, BlockHash);
	module.exports = SHA512;
	SHA512.blockSize = 1024;
	SHA512.outSize = 512;
	SHA512.hmacStrength = 192;
	SHA512.padLength = 128;
	SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
		var W = this.W;
		for (var i = 0; i < 32; i++) W[i] = msg[start + i];
		for (; i < W.length; i += 2) {
			var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);
			var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
			var c1_hi = W[i - 14];
			var c1_lo = W[i - 13];
			var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);
			var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
			var c3_hi = W[i - 32];
			var c3_lo = W[i - 31];
			W[i] = sum64_4_hi(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo);
			W[i + 1] = sum64_4_lo(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo);
		}
	};
	SHA512.prototype._update = function _update(msg, start) {
		this._prepareBlock(msg, start);
		var W = this.W;
		var ah = this.h[0];
		var al = this.h[1];
		var bh = this.h[2];
		var bl = this.h[3];
		var ch = this.h[4];
		var cl = this.h[5];
		var dh = this.h[6];
		var dl = this.h[7];
		var eh = this.h[8];
		var el = this.h[9];
		var fh = this.h[10];
		var fl = this.h[11];
		var gh = this.h[12];
		var gl = this.h[13];
		var hh = this.h[14];
		var hl = this.h[15];
		assert(this.k.length === W.length);
		for (var i = 0; i < W.length; i += 2) {
			var c0_hi = hh;
			var c0_lo = hl;
			var c1_hi = s1_512_hi(eh, el);
			var c1_lo = s1_512_lo(eh, el);
			var c2_hi = ch64_hi(eh, el, fh, fl, gh, gl);
			var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
			var c3_hi = this.k[i];
			var c3_lo = this.k[i + 1];
			var c4_hi = W[i];
			var c4_lo = W[i + 1];
			var T1_hi = sum64_5_hi(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo, c4_hi, c4_lo);
			var T1_lo = sum64_5_lo(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo, c4_hi, c4_lo);
			c0_hi = s0_512_hi(ah, al);
			c0_lo = s0_512_lo(ah, al);
			c1_hi = maj64_hi(ah, al, bh, bl, ch, cl);
			c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);
			var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
			var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);
			hh = gh;
			hl = gl;
			gh = fh;
			gl = fl;
			fh = eh;
			fl = el;
			eh = sum64_hi(dh, dl, T1_hi, T1_lo);
			el = sum64_lo(dl, dl, T1_hi, T1_lo);
			dh = ch;
			dl = cl;
			ch = bh;
			cl = bl;
			bh = ah;
			bl = al;
			ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
			al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
		}
		sum64(this.h, 0, ah, al);
		sum64(this.h, 2, bh, bl);
		sum64(this.h, 4, ch, cl);
		sum64(this.h, 6, dh, dl);
		sum64(this.h, 8, eh, el);
		sum64(this.h, 10, fh, fl);
		sum64(this.h, 12, gh, gl);
		sum64(this.h, 14, hh, hl);
	};
	SHA512.prototype._digest = function digest(enc) {
		if (enc === "hex") return utils.toHex32(this.h, "big");
		else return utils.split32(this.h, "big");
	};
	function ch64_hi(xh, xl, yh, yl, zh) {
		var r = xh & yh ^ ~xh & zh;
		if (r < 0) r += 4294967296;
		return r;
	}
	function ch64_lo(xh, xl, yh, yl, zh, zl) {
		var r = xl & yl ^ ~xl & zl;
		if (r < 0) r += 4294967296;
		return r;
	}
	function maj64_hi(xh, xl, yh, yl, zh) {
		var r = xh & yh ^ xh & zh ^ yh & zh;
		if (r < 0) r += 4294967296;
		return r;
	}
	function maj64_lo(xh, xl, yh, yl, zh, zl) {
		var r = xl & yl ^ xl & zl ^ yl & zl;
		if (r < 0) r += 4294967296;
		return r;
	}
	function s0_512_hi(xh, xl) {
		var c0_hi = rotr64_hi(xh, xl, 28);
		var c1_hi = rotr64_hi(xl, xh, 2);
		var c2_hi = rotr64_hi(xl, xh, 7);
		var r = c0_hi ^ c1_hi ^ c2_hi;
		if (r < 0) r += 4294967296;
		return r;
	}
	function s0_512_lo(xh, xl) {
		var c0_lo = rotr64_lo(xh, xl, 28);
		var c1_lo = rotr64_lo(xl, xh, 2);
		var c2_lo = rotr64_lo(xl, xh, 7);
		var r = c0_lo ^ c1_lo ^ c2_lo;
		if (r < 0) r += 4294967296;
		return r;
	}
	function s1_512_hi(xh, xl) {
		var c0_hi = rotr64_hi(xh, xl, 14);
		var c1_hi = rotr64_hi(xh, xl, 18);
		var c2_hi = rotr64_hi(xl, xh, 9);
		var r = c0_hi ^ c1_hi ^ c2_hi;
		if (r < 0) r += 4294967296;
		return r;
	}
	function s1_512_lo(xh, xl) {
		var c0_lo = rotr64_lo(xh, xl, 14);
		var c1_lo = rotr64_lo(xh, xl, 18);
		var c2_lo = rotr64_lo(xl, xh, 9);
		var r = c0_lo ^ c1_lo ^ c2_lo;
		if (r < 0) r += 4294967296;
		return r;
	}
	function g0_512_hi(xh, xl) {
		var c0_hi = rotr64_hi(xh, xl, 1);
		var c1_hi = rotr64_hi(xh, xl, 8);
		var c2_hi = shr64_hi(xh, xl, 7);
		var r = c0_hi ^ c1_hi ^ c2_hi;
		if (r < 0) r += 4294967296;
		return r;
	}
	function g0_512_lo(xh, xl) {
		var c0_lo = rotr64_lo(xh, xl, 1);
		var c1_lo = rotr64_lo(xh, xl, 8);
		var c2_lo = shr64_lo(xh, xl, 7);
		var r = c0_lo ^ c1_lo ^ c2_lo;
		if (r < 0) r += 4294967296;
		return r;
	}
	function g1_512_hi(xh, xl) {
		var c0_hi = rotr64_hi(xh, xl, 19);
		var c1_hi = rotr64_hi(xl, xh, 29);
		var c2_hi = shr64_hi(xh, xl, 6);
		var r = c0_hi ^ c1_hi ^ c2_hi;
		if (r < 0) r += 4294967296;
		return r;
	}
	function g1_512_lo(xh, xl) {
		var c0_lo = rotr64_lo(xh, xl, 19);
		var c1_lo = rotr64_lo(xl, xh, 29);
		var c2_lo = shr64_lo(xh, xl, 6);
		var r = c0_lo ^ c1_lo ^ c2_lo;
		if (r < 0) r += 4294967296;
		return r;
	}
}));
var require__384 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils$1();
	var SHA512 = require__512();
	function SHA384() {
		if (!(this instanceof SHA384)) return new SHA384();
		SHA512.call(this);
		this.h = [
			3418070365,
			3238371032,
			1654270250,
			914150663,
			2438529370,
			812702999,
			355462360,
			4144912697,
			1731405415,
			4290775857,
			2394180231,
			1750603025,
			3675008525,
			1694076839,
			1203062813,
			3204075428
		];
	}
	utils.inherits(SHA384, SHA512);
	module.exports = SHA384;
	SHA384.blockSize = 1024;
	SHA384.outSize = 384;
	SHA384.hmacStrength = 192;
	SHA384.padLength = 128;
	SHA384.prototype._digest = function digest(enc) {
		if (enc === "hex") return utils.toHex32(this.h.slice(0, 12), "big");
		else return utils.split32(this.h.slice(0, 12), "big");
	};
}));
var require_sha = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	exports.sha1 = require__1();
	exports.sha224 = require__224();
	exports.sha256 = require__256();
	exports.sha384 = require__384();
	exports.sha512 = require__512();
}));
var require_ripemd = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var utils = require_utils$1();
	var common = require_common$3();
	var rotl32 = utils.rotl32;
	var sum32 = utils.sum32;
	var sum32_3 = utils.sum32_3;
	var sum32_4 = utils.sum32_4;
	var BlockHash = common.BlockHash;
	function RIPEMD160() {
		if (!(this instanceof RIPEMD160)) return new RIPEMD160();
		BlockHash.call(this);
		this.h = [
			1732584193,
			4023233417,
			2562383102,
			271733878,
			3285377520
		];
		this.endian = "little";
	}
	utils.inherits(RIPEMD160, BlockHash);
	exports.ripemd160 = RIPEMD160;
	RIPEMD160.blockSize = 512;
	RIPEMD160.outSize = 160;
	RIPEMD160.hmacStrength = 192;
	RIPEMD160.padLength = 64;
	RIPEMD160.prototype._update = function update(msg, start) {
		var A = this.h[0];
		var B = this.h[1];
		var C = this.h[2];
		var D = this.h[3];
		var E = this.h[4];
		var Ah = A;
		var Bh = B;
		var Ch = C;
		var Dh = D;
		var Eh = E;
		for (var j = 0; j < 80; j++) {
			var T = sum32(rotl32(sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)), s[j]), E);
			A = E;
			E = D;
			D = rotl32(C, 10);
			C = B;
			B = T;
			T = sum32(rotl32(sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)), sh[j]), Eh);
			Ah = Eh;
			Eh = Dh;
			Dh = rotl32(Ch, 10);
			Ch = Bh;
			Bh = T;
		}
		T = sum32_3(this.h[1], C, Dh);
		this.h[1] = sum32_3(this.h[2], D, Eh);
		this.h[2] = sum32_3(this.h[3], E, Ah);
		this.h[3] = sum32_3(this.h[4], A, Bh);
		this.h[4] = sum32_3(this.h[0], B, Ch);
		this.h[0] = T;
	};
	RIPEMD160.prototype._digest = function digest(enc) {
		if (enc === "hex") return utils.toHex32(this.h, "little");
		else return utils.split32(this.h, "little");
	};
	function f(j, x, y, z) {
		if (j <= 15) return x ^ y ^ z;
		else if (j <= 31) return x & y | ~x & z;
		else if (j <= 47) return (x | ~y) ^ z;
		else if (j <= 63) return x & z | y & ~z;
		else return x ^ (y | ~z);
	}
	function K(j) {
		if (j <= 15) return 0;
		else if (j <= 31) return 1518500249;
		else if (j <= 47) return 1859775393;
		else if (j <= 63) return 2400959708;
		else return 2840853838;
	}
	function Kh(j) {
		if (j <= 15) return 1352829926;
		else if (j <= 31) return 1548603684;
		else if (j <= 47) return 1836072691;
		else if (j <= 63) return 2053994217;
		else return 0;
	}
	var r = [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		7,
		4,
		13,
		1,
		10,
		6,
		15,
		3,
		12,
		0,
		9,
		5,
		2,
		14,
		11,
		8,
		3,
		10,
		14,
		4,
		9,
		15,
		8,
		1,
		2,
		7,
		0,
		6,
		13,
		11,
		5,
		12,
		1,
		9,
		11,
		10,
		0,
		8,
		12,
		4,
		13,
		3,
		7,
		15,
		14,
		5,
		6,
		2,
		4,
		0,
		5,
		9,
		7,
		12,
		2,
		10,
		14,
		1,
		3,
		8,
		11,
		6,
		15,
		13
	];
	var rh = [
		5,
		14,
		7,
		0,
		9,
		2,
		11,
		4,
		13,
		6,
		15,
		8,
		1,
		10,
		3,
		12,
		6,
		11,
		3,
		7,
		0,
		13,
		5,
		10,
		14,
		15,
		8,
		12,
		4,
		9,
		1,
		2,
		15,
		5,
		1,
		3,
		7,
		14,
		6,
		9,
		11,
		8,
		12,
		2,
		10,
		0,
		4,
		13,
		8,
		6,
		4,
		1,
		3,
		11,
		15,
		0,
		5,
		12,
		2,
		13,
		9,
		7,
		10,
		14,
		12,
		15,
		10,
		4,
		1,
		5,
		8,
		7,
		6,
		2,
		13,
		14,
		0,
		3,
		9,
		11
	];
	var s = [
		11,
		14,
		15,
		12,
		5,
		8,
		7,
		9,
		11,
		13,
		14,
		15,
		6,
		7,
		9,
		8,
		7,
		6,
		8,
		13,
		11,
		9,
		7,
		15,
		7,
		12,
		15,
		9,
		11,
		7,
		13,
		12,
		11,
		13,
		6,
		7,
		14,
		9,
		13,
		15,
		14,
		8,
		13,
		6,
		5,
		12,
		7,
		5,
		11,
		12,
		14,
		15,
		14,
		15,
		9,
		8,
		9,
		14,
		5,
		6,
		8,
		6,
		5,
		12,
		9,
		15,
		5,
		11,
		6,
		8,
		13,
		12,
		5,
		12,
		13,
		14,
		11,
		8,
		5,
		6
	];
	var sh = [
		8,
		9,
		9,
		11,
		13,
		15,
		15,
		5,
		7,
		7,
		8,
		11,
		14,
		14,
		12,
		6,
		9,
		13,
		15,
		7,
		12,
		8,
		9,
		11,
		7,
		7,
		12,
		7,
		6,
		15,
		13,
		11,
		9,
		7,
		15,
		11,
		8,
		6,
		6,
		14,
		12,
		13,
		5,
		14,
		13,
		13,
		7,
		5,
		15,
		5,
		8,
		11,
		14,
		14,
		6,
		14,
		6,
		9,
		12,
		9,
		12,
		5,
		15,
		8,
		8,
		5,
		12,
		9,
		12,
		5,
		14,
		6,
		8,
		13,
		6,
		5,
		15,
		13,
		11,
		11
	];
}));
var require_hmac = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	var utils = require_utils$1();
	var assert = require_minimalistic_assert();
	function Hmac(hash, key, enc) {
		if (!(this instanceof Hmac)) return new Hmac(hash, key, enc);
		this.Hash = hash;
		this.blockSize = hash.blockSize / 8;
		this.outSize = hash.outSize / 8;
		this.inner = null;
		this.outer = null;
		this._init(utils.toArray(key, enc));
	}
	module.exports = Hmac;
	Hmac.prototype._init = function init(key) {
		if (key.length > this.blockSize) key = new this.Hash().update(key).digest();
		assert(key.length <= this.blockSize);
		for (var i = key.length; i < this.blockSize; i++) key.push(0);
		for (i = 0; i < key.length; i++) key[i] ^= 54;
		this.inner = new this.Hash().update(key);
		for (i = 0; i < key.length; i++) key[i] ^= 106;
		this.outer = new this.Hash().update(key);
	};
	Hmac.prototype.update = function update(msg, enc) {
		this.inner.update(msg, enc);
		return this;
	};
	Hmac.prototype.digest = function digest(enc) {
		this.outer.update(this.inner.digest());
		return this.outer.digest(enc);
	};
}));
var require_hash = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var hash = exports;
	hash.utils = require_utils$1();
	hash.common = require_common$3();
	hash.sha = require_sha();
	hash.ripemd = require_ripemd();
	hash.hmac = require_hmac();
	hash.sha1 = hash.sha.sha1;
	hash.sha256 = hash.sha.sha256;
	hash.sha224 = hash.sha.sha224;
	hash.sha384 = hash.sha.sha384;
	hash.sha512 = hash.sha.sha512;
	hash.ripemd160 = hash.ripemd.ripemd160;
}));
var require_spark_md5 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports, module) => {
	(function(factory) {
		if (typeof exports === "object") module.exports = factory();
		else if (typeof define === "function" && define.amd) define(factory);
		else {
			var glob;
			try {
				glob = window;
			} catch (e) {
				glob = self;
			}
			glob.SparkMD5 = factory();
		}
	})(function(undefined) {
		"use strict";
		var hex_chr = [
			"0",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"a",
			"b",
			"c",
			"d",
			"e",
			"f"
		];
		function md5cycle(x, k) {
			var a = x[0], b = x[1], c = x[2], d = x[3];
			a += (b & c | ~b & d) + k[0] - 680876936 | 0;
			a = (a << 7 | a >>> 25) + b | 0;
			d += (a & b | ~a & c) + k[1] - 389564586 | 0;
			d = (d << 12 | d >>> 20) + a | 0;
			c += (d & a | ~d & b) + k[2] + 606105819 | 0;
			c = (c << 17 | c >>> 15) + d | 0;
			b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
			b = (b << 22 | b >>> 10) + c | 0;
			a += (b & c | ~b & d) + k[4] - 176418897 | 0;
			a = (a << 7 | a >>> 25) + b | 0;
			d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
			d = (d << 12 | d >>> 20) + a | 0;
			c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
			c = (c << 17 | c >>> 15) + d | 0;
			b += (c & d | ~c & a) + k[7] - 45705983 | 0;
			b = (b << 22 | b >>> 10) + c | 0;
			a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
			a = (a << 7 | a >>> 25) + b | 0;
			d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
			d = (d << 12 | d >>> 20) + a | 0;
			c += (d & a | ~d & b) + k[10] - 42063 | 0;
			c = (c << 17 | c >>> 15) + d | 0;
			b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
			b = (b << 22 | b >>> 10) + c | 0;
			a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
			a = (a << 7 | a >>> 25) + b | 0;
			d += (a & b | ~a & c) + k[13] - 40341101 | 0;
			d = (d << 12 | d >>> 20) + a | 0;
			c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
			c = (c << 17 | c >>> 15) + d | 0;
			b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
			b = (b << 22 | b >>> 10) + c | 0;
			a += (b & d | c & ~d) + k[1] - 165796510 | 0;
			a = (a << 5 | a >>> 27) + b | 0;
			d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
			d = (d << 9 | d >>> 23) + a | 0;
			c += (d & b | a & ~b) + k[11] + 643717713 | 0;
			c = (c << 14 | c >>> 18) + d | 0;
			b += (c & a | d & ~a) + k[0] - 373897302 | 0;
			b = (b << 20 | b >>> 12) + c | 0;
			a += (b & d | c & ~d) + k[5] - 701558691 | 0;
			a = (a << 5 | a >>> 27) + b | 0;
			d += (a & c | b & ~c) + k[10] + 38016083 | 0;
			d = (d << 9 | d >>> 23) + a | 0;
			c += (d & b | a & ~b) + k[15] - 660478335 | 0;
			c = (c << 14 | c >>> 18) + d | 0;
			b += (c & a | d & ~a) + k[4] - 405537848 | 0;
			b = (b << 20 | b >>> 12) + c | 0;
			a += (b & d | c & ~d) + k[9] + 568446438 | 0;
			a = (a << 5 | a >>> 27) + b | 0;
			d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
			d = (d << 9 | d >>> 23) + a | 0;
			c += (d & b | a & ~b) + k[3] - 187363961 | 0;
			c = (c << 14 | c >>> 18) + d | 0;
			b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
			b = (b << 20 | b >>> 12) + c | 0;
			a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
			a = (a << 5 | a >>> 27) + b | 0;
			d += (a & c | b & ~c) + k[2] - 51403784 | 0;
			d = (d << 9 | d >>> 23) + a | 0;
			c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
			c = (c << 14 | c >>> 18) + d | 0;
			b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
			b = (b << 20 | b >>> 12) + c | 0;
			a += (b ^ c ^ d) + k[5] - 378558 | 0;
			a = (a << 4 | a >>> 28) + b | 0;
			d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
			d = (d << 11 | d >>> 21) + a | 0;
			c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
			c = (c << 16 | c >>> 16) + d | 0;
			b += (c ^ d ^ a) + k[14] - 35309556 | 0;
			b = (b << 23 | b >>> 9) + c | 0;
			a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
			a = (a << 4 | a >>> 28) + b | 0;
			d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
			d = (d << 11 | d >>> 21) + a | 0;
			c += (d ^ a ^ b) + k[7] - 155497632 | 0;
			c = (c << 16 | c >>> 16) + d | 0;
			b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
			b = (b << 23 | b >>> 9) + c | 0;
			a += (b ^ c ^ d) + k[13] + 681279174 | 0;
			a = (a << 4 | a >>> 28) + b | 0;
			d += (a ^ b ^ c) + k[0] - 358537222 | 0;
			d = (d << 11 | d >>> 21) + a | 0;
			c += (d ^ a ^ b) + k[3] - 722521979 | 0;
			c = (c << 16 | c >>> 16) + d | 0;
			b += (c ^ d ^ a) + k[6] + 76029189 | 0;
			b = (b << 23 | b >>> 9) + c | 0;
			a += (b ^ c ^ d) + k[9] - 640364487 | 0;
			a = (a << 4 | a >>> 28) + b | 0;
			d += (a ^ b ^ c) + k[12] - 421815835 | 0;
			d = (d << 11 | d >>> 21) + a | 0;
			c += (d ^ a ^ b) + k[15] + 530742520 | 0;
			c = (c << 16 | c >>> 16) + d | 0;
			b += (c ^ d ^ a) + k[2] - 995338651 | 0;
			b = (b << 23 | b >>> 9) + c | 0;
			a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
			a = (a << 6 | a >>> 26) + b | 0;
			d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
			d = (d << 10 | d >>> 22) + a | 0;
			c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
			c = (c << 15 | c >>> 17) + d | 0;
			b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
			b = (b << 21 | b >>> 11) + c | 0;
			a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
			a = (a << 6 | a >>> 26) + b | 0;
			d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
			d = (d << 10 | d >>> 22) + a | 0;
			c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
			c = (c << 15 | c >>> 17) + d | 0;
			b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
			b = (b << 21 | b >>> 11) + c | 0;
			a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
			a = (a << 6 | a >>> 26) + b | 0;
			d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
			d = (d << 10 | d >>> 22) + a | 0;
			c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
			c = (c << 15 | c >>> 17) + d | 0;
			b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
			b = (b << 21 | b >>> 11) + c | 0;
			a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
			a = (a << 6 | a >>> 26) + b | 0;
			d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
			d = (d << 10 | d >>> 22) + a | 0;
			c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
			c = (c << 15 | c >>> 17) + d | 0;
			b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
			b = (b << 21 | b >>> 11) + c | 0;
			x[0] = a + x[0] | 0;
			x[1] = b + x[1] | 0;
			x[2] = c + x[2] | 0;
			x[3] = d + x[3] | 0;
		}
		function md5blk(s) {
			var md5blks = [], i;
			for (i = 0; i < 64; i += 4) md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
			return md5blks;
		}
		function md5blk_array(a) {
			var md5blks = [], i;
			for (i = 0; i < 64; i += 4) md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
			return md5blks;
		}
		function md51(s) {
			var n = s.length, state = [
				1732584193,
				-271733879,
				-1732584194,
				271733878
			], i, length, tail, tmp, lo, hi;
			for (i = 64; i <= n; i += 64) md5cycle(state, md5blk(s.substring(i - 64, i)));
			s = s.substring(i - 64);
			length = s.length;
			tail = [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			];
			for (i = 0; i < length; i += 1) tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
			tail[i >> 2] |= 128 << (i % 4 << 3);
			if (i > 55) {
				md5cycle(state, tail);
				for (i = 0; i < 16; i += 1) tail[i] = 0;
			}
			tmp = n * 8;
			tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
			lo = parseInt(tmp[2], 16);
			hi = parseInt(tmp[1], 16) || 0;
			tail[14] = lo;
			tail[15] = hi;
			md5cycle(state, tail);
			return state;
		}
		function md51_array(a) {
			var n = a.length, state = [
				1732584193,
				-271733879,
				-1732584194,
				271733878
			], i, length, tail, tmp, lo, hi;
			for (i = 64; i <= n; i += 64) md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
			a = i - 64 < n ? a.subarray(i - 64) : new Uint8Array(0);
			length = a.length;
			tail = [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			];
			for (i = 0; i < length; i += 1) tail[i >> 2] |= a[i] << (i % 4 << 3);
			tail[i >> 2] |= 128 << (i % 4 << 3);
			if (i > 55) {
				md5cycle(state, tail);
				for (i = 0; i < 16; i += 1) tail[i] = 0;
			}
			tmp = n * 8;
			tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
			lo = parseInt(tmp[2], 16);
			hi = parseInt(tmp[1], 16) || 0;
			tail[14] = lo;
			tail[15] = hi;
			md5cycle(state, tail);
			return state;
		}
		function rhex(n) {
			var s = "", j;
			for (j = 0; j < 4; j += 1) s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
			return s;
		}
		function hex(x) {
			var i;
			for (i = 0; i < x.length; i += 1) x[i] = rhex(x[i]);
			return x.join("");
		}
		if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592");
		/**
		* ArrayBuffer slice polyfill.
		*
		* @see https://github.com/ttaubert/node-arraybuffer-slice
		*/
		if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) (function() {
			function clamp(val, length) {
				val = val | 0 || 0;
				if (val < 0) return Math.max(val + length, 0);
				return Math.min(val, length);
			}
			ArrayBuffer.prototype.slice = function(from, to) {
				var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
				if (to !== undefined) end = clamp(to, length);
				if (begin > end) return /* @__PURE__ */ new ArrayBuffer(0);
				num = end - begin;
				target = new ArrayBuffer(num);
				targetArray = new Uint8Array(target);
				sourceArray = new Uint8Array(this, begin, num);
				targetArray.set(sourceArray);
				return target;
			};
		})();
		/**
		* Helpers.
		*/
		function toUtf8(str) {
			if (/[\u0080-\uFFFF]/.test(str)) str = unescape(encodeURIComponent(str));
			return str;
		}
		function utf8Str2ArrayBuffer(str, returnUInt8Array) {
			var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i;
			for (i = 0; i < length; i += 1) arr[i] = str.charCodeAt(i);
			return returnUInt8Array ? arr : buff;
		}
		function arrayBuffer2Utf8Str(buff) {
			return String.fromCharCode.apply(null, new Uint8Array(buff));
		}
		function concatenateArrayBuffers(first, second, returnUInt8Array) {
			var result = new Uint8Array(first.byteLength + second.byteLength);
			result.set(new Uint8Array(first));
			result.set(new Uint8Array(second), first.byteLength);
			return returnUInt8Array ? result : result.buffer;
		}
		function hexToBinaryString(hex) {
			var bytes = [], length = hex.length, x;
			for (x = 0; x < length - 1; x += 2) bytes.push(parseInt(hex.substr(x, 2), 16));
			return String.fromCharCode.apply(String, bytes);
		}
		/**
		* SparkMD5 OOP implementation.
		*
		* Use this class to perform an incremental md5, otherwise use the
		* static methods instead.
		*/
		function SparkMD5() {
			this.reset();
		}
		/**
		* Appends a string.
		* A conversion will be applied if an utf8 string is detected.
		*
		* @param {String} str The string to be appended
		*
		* @return {SparkMD5} The instance itself
		*/
		SparkMD5.prototype.append = function(str) {
			this.appendBinary(toUtf8(str));
			return this;
		};
		/**
		* Appends a binary string.
		*
		* @param {String} contents The binary string to be appended
		*
		* @return {SparkMD5} The instance itself
		*/
		SparkMD5.prototype.appendBinary = function(contents) {
			this._buff += contents;
			this._length += contents.length;
			var length = this._buff.length, i;
			for (i = 64; i <= length; i += 64) md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
			this._buff = this._buff.substring(i - 64);
			return this;
		};
		/**
		* Finishes the incremental computation, reseting the internal state and
		* returning the result.
		*
		* @param {Boolean} raw True to get the raw string, false to get the hex string
		*
		* @return {String} The result
		*/
		SparkMD5.prototype.end = function(raw) {
			var buff = this._buff, length = buff.length, i, tail = [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			], ret;
			for (i = 0; i < length; i += 1) tail[i >> 2] |= buff.charCodeAt(i) << (i % 4 << 3);
			this._finish(tail, length);
			ret = hex(this._hash);
			if (raw) ret = hexToBinaryString(ret);
			this.reset();
			return ret;
		};
		/**
		* Resets the internal state of the computation.
		*
		* @return {SparkMD5} The instance itself
		*/
		SparkMD5.prototype.reset = function() {
			this._buff = "";
			this._length = 0;
			this._hash = [
				1732584193,
				-271733879,
				-1732584194,
				271733878
			];
			return this;
		};
		/**
		* Gets the internal state of the computation.
		*
		* @return {Object} The state
		*/
		SparkMD5.prototype.getState = function() {
			return {
				buff: this._buff,
				length: this._length,
				hash: this._hash.slice()
			};
		};
		/**
		* Gets the internal state of the computation.
		*
		* @param {Object} state The state
		*
		* @return {SparkMD5} The instance itself
		*/
		SparkMD5.prototype.setState = function(state) {
			this._buff = state.buff;
			this._length = state.length;
			this._hash = state.hash;
			return this;
		};
		/**
		* Releases memory used by the incremental buffer and other additional
		* resources. If you plan to use the instance again, use reset instead.
		*/
		SparkMD5.prototype.destroy = function() {
			delete this._hash;
			delete this._buff;
			delete this._length;
		};
		/**
		* Finish the final calculation based on the tail.
		*
		* @param {Array}  tail   The tail (will be modified)
		* @param {Number} length The length of the remaining buffer
		*/
		SparkMD5.prototype._finish = function(tail, length) {
			var i = length, tmp, lo, hi;
			tail[i >> 2] |= 128 << (i % 4 << 3);
			if (i > 55) {
				md5cycle(this._hash, tail);
				for (i = 0; i < 16; i += 1) tail[i] = 0;
			}
			tmp = this._length * 8;
			tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
			lo = parseInt(tmp[2], 16);
			hi = parseInt(tmp[1], 16) || 0;
			tail[14] = lo;
			tail[15] = hi;
			md5cycle(this._hash, tail);
		};
		/**
		* Performs the md5 hash on a string.
		* A conversion will be applied if utf8 string is detected.
		*
		* @param {String}  str The string
		* @param {Boolean} [raw] True to get the raw string, false to get the hex string
		*
		* @return {String} The result
		*/
		SparkMD5.hash = function(str, raw) {
			return SparkMD5.hashBinary(toUtf8(str), raw);
		};
		/**
		* Performs the md5 hash on a binary string.
		*
		* @param {String}  content The binary string
		* @param {Boolean} [raw]     True to get the raw string, false to get the hex string
		*
		* @return {String} The result
		*/
		SparkMD5.hashBinary = function(content, raw) {
			var ret = hex(md51(content));
			return raw ? hexToBinaryString(ret) : ret;
		};
		/**
		* SparkMD5 OOP implementation for array buffers.
		*
		* Use this class to perform an incremental md5 ONLY for array buffers.
		*/
		SparkMD5.ArrayBuffer = function() {
			this.reset();
		};
		/**
		* Appends an array buffer.
		*
		* @param {ArrayBuffer} arr The array to be appended
		*
		* @return {SparkMD5.ArrayBuffer} The instance itself
		*/
		SparkMD5.ArrayBuffer.prototype.append = function(arr) {
			var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i;
			this._length += arr.byteLength;
			for (i = 64; i <= length; i += 64) md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
			this._buff = i - 64 < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
			return this;
		};
		/**
		* Finishes the incremental computation, reseting the internal state and
		* returning the result.
		*
		* @param {Boolean} raw True to get the raw string, false to get the hex string
		*
		* @return {String} The result
		*/
		SparkMD5.ArrayBuffer.prototype.end = function(raw) {
			var buff = this._buff, length = buff.length, tail = [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			], i, ret;
			for (i = 0; i < length; i += 1) tail[i >> 2] |= buff[i] << (i % 4 << 3);
			this._finish(tail, length);
			ret = hex(this._hash);
			if (raw) ret = hexToBinaryString(ret);
			this.reset();
			return ret;
		};
		/**
		* Resets the internal state of the computation.
		*
		* @return {SparkMD5.ArrayBuffer} The instance itself
		*/
		SparkMD5.ArrayBuffer.prototype.reset = function() {
			this._buff = new Uint8Array(0);
			this._length = 0;
			this._hash = [
				1732584193,
				-271733879,
				-1732584194,
				271733878
			];
			return this;
		};
		/**
		* Gets the internal state of the computation.
		*
		* @return {Object} The state
		*/
		SparkMD5.ArrayBuffer.prototype.getState = function() {
			var state = SparkMD5.prototype.getState.call(this);
			state.buff = arrayBuffer2Utf8Str(state.buff);
			return state;
		};
		/**
		* Gets the internal state of the computation.
		*
		* @param {Object} state The state
		*
		* @return {SparkMD5.ArrayBuffer} The instance itself
		*/
		SparkMD5.ArrayBuffer.prototype.setState = function(state) {
			state.buff = utf8Str2ArrayBuffer(state.buff, true);
			return SparkMD5.prototype.setState.call(this, state);
		};
		SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;
		SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;
		/**
		* Performs the md5 hash on an array buffer.
		*
		* @param {ArrayBuffer} arr The array buffer
		* @param {Boolean}     [raw] True to get the raw string, false to get the hex one
		*
		* @return {String} The result
		*/
		SparkMD5.ArrayBuffer.hash = function(arr, raw) {
			var ret = hex(md51_array(new Uint8Array(arr)));
			return raw ? hexToBinaryString(ret) : ret;
		};
		return SparkMD5;
	});
}));
const import_hash=require_hash(),import_spark_md5={default:require_spark_md5()};
(function(_HashUtils) {
		function md5(str) {
			return import_spark_md5.default.hash(str);
		}
		_HashUtils.md5 = md5;
		function sha256(str) {
			return import_hash.sha256().update(str).digest("hex");
		}
		_HashUtils.sha256 = sha256;
	})(HashUtils || (HashUtils = {}));
return HashUtils;})();
const require_common$2={HashUtils};
var LOCAL_STORAGE_FOLDER = "local_storage";
var ENTRY_PREFIX = "wb_entry_";
var ENTRY_EXT = ".info";
var WorkbuddyFileLocalStorage = class WorkbuddyFileLocalStorage {
	emitter = new import_common$1.Emitter();
	changeEvent = this.emitter.event;
	init() {
		logger.info(`initialized, storageRoot=${this.resolveStorageRoot()}`);
	}
	async set(key, value) {
		const entryPath = this.resolveEntryPath(key);
		const entryDir = path.default.dirname(entryPath);
		try {
			if (!fs.existsSync(entryDir)) fs.mkdirSync(entryDir, { recursive: true });
			fs.writeFileSync(entryPath, JSON.stringify(value));
			logger.info(`set succeeded, keyHash=${this.resolveKeyHash(key)}`);
			this.emitter.fire({ domain: key });
		} catch (error) {
			logger.error(`set failed, keyHash=${this.resolveKeyHash(key)}, error=${this.formatError(error)}`);
			throw error;
		}
	}
	getSync(key, defaultValue) {
		const entryPath = this.resolveEntryPath(key);
		const keyHash = this.resolveKeyHash(key);
		try {
			if (!fs.existsSync(entryPath)) {
				logger.info(`get missed, keyHash=${keyHash}`);
				return defaultValue;
			}
			const content = fs.readFileSync(entryPath, { encoding: "utf-8" });
			try {
				logger.info(`get hit, keyHash=${keyHash}`);
				return JSON.parse(content.toString());
			} catch (error) {
				logger.warn(`get failed to parse cache, keyHash=${keyHash}, error=${this.formatError(error)}`);
				return defaultValue;
			}
		} catch (error) {
			logger.warn(`get failed, keyHash=${keyHash}, error=${this.formatError(error)}`);
			return defaultValue;
		}
	}
	async get(key, defaultValue) {
		return this.getSync(key, defaultValue);
	}
	async remove(key) {
		const entryPath = this.resolveEntryPath(key);
		const keyHash = this.resolveKeyHash(key);
		try {
			if (fs.existsSync(entryPath)) fs.rmSync(entryPath);
			logger.info(`remove succeeded, keyHash=${keyHash}`);
			this.emitter.fire({ domain: key });
		} catch (error) {
			logger.error(`remove failed, keyHash=${keyHash}, error=${this.formatError(error)}`);
			throw error;
		}
	}
	resolveEntryPath(key) {
		return path.default.join(this.resolveStorageRoot(), `${ENTRY_PREFIX}${this.resolveKeyHash(key)}${ENTRY_EXT}`);
	}
	resolveStorageRoot() {
		return path.default.join(this.resolveHomeDir(), LOCAL_STORAGE_FOLDER);
	}
	resolveHomeDir() {
		return process.env.WORKBUDDY_CONFIG_DIR?.trim() || path.default.join(os.homedir(), this.getDefaultConfigDirname());
	}
	resolveKeyHash(key) {
		return require_common$2.HashUtils.md5(key);
	}
	formatError(error) {
		return error instanceof Error ? error.message : String(error);
	}
	getDefaultConfigDirname() {
		const dataFolderName = require_workbuddy_product_config.tryGetWorkbuddyBaseProductConfiguration()?.dataFolderName;
		if (typeof dataFolderName === "string" && dataFolderName.trim()) return dataFolderName;
		return ".workbuddy";
	}
};
return {WorkbuddyFileLocalStorage,HashUtils,LOCAL_STORAGE_FOLDER,ENTRY_PREFIX,ENTRY_EXT};
}
