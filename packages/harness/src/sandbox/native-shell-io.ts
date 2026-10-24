// @ts-nocheck
// Complete original encoding, detection and executable lookup dependency closure.
export const SHELL_IO_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SHELL_IO_MODULES = [
  [93130, 4842666, 4845045],
  [19845, 6472318, 6473583],
  [38900, 4841950, 4842665],
  [32499, 4796557, 4796805],
  [59506, 4796806, 4799512],
  [96015, 4833842, 4838046],
  [83025, 4831154, 4833841],
  [54849, 4838047, 4841949],
  [16247, 4799513, 4800728],
  [32929, 4827901, 4831153],
  [9913, 4800729, 4827900],
  [31132, 4786728, 4794724],
  [37772, 4794725, 4796556],
  [28716, 21653341, 21662395],
  [78879, 21634384, 21650108],
  [14365, 21580953, 21601598],
  [56299, 21652375, 21653340],
  [64830, 21650109, 21652374],
  [92235, 21601599, 21618797],
  [12925, 21618798, 21634383],
  [36220, 21555668, 21580952],
  [4463, 4845046, 4846827],
  [23238, 5082577, 5082614],
  [78615, 5277345, 5277802],
  [27596, 5414437, 5419055],
  [75546, 5162767, 5162867],
  [73439, 5402018, 5402426],
  [65084, 5159869, 5161313],
  [95927, 5161314, 5162088],
  [12719, 5400755, 5400839],
  [85242, 5155431, 5155764],
  [91203, 5162089, 5162766],
  [67326, 5400840, 5402017],
  [48712, 5402427, 5403271],
  [18141, 5155765, 5159868],
  [38511, 5277803, 5318141],
  [43351, 5212981, 5242050],
  [21519, 5169946, 5212640],
  [87756, 5242391, 5275221],
  [15852, 5082615, 5155430],
  [77388, 5419056, 5420226],
  [71662, 5407949, 5410246],
  [31122, 5412991, 5414436],
  [40236, 5407097, 5407948],
  [24612, 5318142, 5333854],
  [45622, 5168522, 5169945],
  [83944, 5403272, 5404229],
  [39802, 5275222, 5275565],
  [22076, 5406044, 5407096],
  [41537, 5212641, 5212980],
  [81643, 5404230, 5405002],
  [73017, 5242051, 5242390],
  [26567, 5405003, 5406043],
  [17117, 5412006, 5412990],
  [67044, 5410247, 5412005],
  [73695, 5369896, 5379245],
  [48432, 5275566, 5277344],
  [93322, 5344377, 5359427],
  [40474, 5359428, 5369895],
  [11300, 5389789, 5399122],
  [51733, 5379246, 5389788],
  [43761, 5333855, 5344376],
  [91266, 5399123, 5400754],
  [34918, 5162868, 5164152],
  [88114, 5164153, 5168521],
  [5516, 13020616, 13021203],
  [77242, 14924756, 14926273],
  [16262, 16433190, 16434353],
  [71481, 16434431, 16435336],
  [53381, 16435337, 16436121],
  [10136, 16434354, 16434430],
] as const;
export function createNativeShellIO(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit shell IO process boundary required");
  const process = runtime.process,
    Buffer = runtime.Buffer ?? globalThis.Buffer,
    console = runtime.console ?? globalThis.console,
    Bun = runtime.Bun ?? globalThis.Bun;
  const factories = {
    93130(eA, el, ec) {
      "use strict";
      var eu,
        ed = ec(19845).Buffer,
        ep = ec(38900),
        eg = eA.exports;
      ((eg.encodings = null),
        (eg.defaultCharUnicode = "�"),
        (eg.defaultCharSingleByte = "?"),
        (eg.encode = function (eA, el, ec) {
          eA = "" + (eA || "");
          var eu = eg.getEncoder(el, ec),
            ep = eu.write(eA),
            eh = eu.end();
          return eh && eh.length > 0 ? ed.concat([ep, eh]) : ep;
        }),
        (eg.decode = function (eA, el, ec) {
          "string" == typeof eA &&
            (eg.skipDecodeWarning ||
              (console.error(
                "Iconv-lite warning: decode()-ing strings is deprecated. Refer to https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding",
              ),
              (eg.skipDecodeWarning = !0)),
            (eA = ed.from("" + (eA || ""), "binary")));
          var eu = eg.getDecoder(el, ec),
            ep = eu.write(eA),
            eh = eu.end();
          return eh ? ep + eh : ep;
        }),
        (eg.encodingExists = function (eA) {
          try {
            return (eg.getCodec(eA), !0);
          } catch (eA) {
            return !1;
          }
        }),
        (eg.toEncoding = eg.encode),
        (eg.fromEncoding = eg.decode),
        (eg._codecDataCache = {}),
        (eg.getCodec = function (eA) {
          eg.encodings || (eg.encodings = ec(32499));
          for (var el = eg._canonicalizeEncoding(eA), eu = {}; ; ) {
            var ed = eg._codecDataCache[el];
            if (ed) return ed;
            var ep = eg.encodings[el];
            switch (typeof ep) {
              case "string":
                el = ep;
                break;
              case "object":
                for (var eh in ep) eu[eh] = ep[eh];
                (eu.encodingName || (eu.encodingName = el), (el = ep.type));
                break;
              case "function":
                return (
                  eu.encodingName || (eu.encodingName = el),
                  (ed = new ep(eu, eg)),
                  (eg._codecDataCache[eu.encodingName] = ed),
                  ed
                );
              default:
                throw Error(
                  "Encoding not recognized: '" +
                    eA +
                    "' (searched as: '" +
                    el +
                    "')",
                );
            }
          }
        }),
        (eg._canonicalizeEncoding = function (eA) {
          return ("" + eA).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");
        }),
        (eg.getEncoder = function (eA, el) {
          var ec = eg.getCodec(eA),
            eu = new ec.encoder(el, ec);
          return (
            ec.bomAware && el && el.addBOM && (eu = new ep.PrependBOM(eu, el)),
            eu
          );
        }),
        (eg.getDecoder = function (eA, el) {
          var ec = eg.getCodec(eA),
            eu = new ec.decoder(el, ec);
          return (
            ec.bomAware &&
              !(el && !1 === el.stripBOM) &&
              (eu = new ep.StripBOM(eu, el)),
            eu
          );
        }),
        (eg.enableStreamingAPI = function (eA) {
          if (!eg.supportsStreams) {
            var el = ec(4463)(eA);
            ((eg.IconvLiteEncoderStream = el.IconvLiteEncoderStream),
              (eg.IconvLiteDecoderStream = el.IconvLiteDecoderStream),
              (eg.encodeStream = function (eA, el) {
                return new eg.IconvLiteEncoderStream(eg.getEncoder(eA, el), el);
              }),
              (eg.decodeStream = function (eA, el) {
                return new eg.IconvLiteDecoderStream(eg.getDecoder(eA, el), el);
              }),
              (eg.supportsStreams = !0));
          }
        }));
      try {
        eu = ec(2203);
      } catch (eA) {}
      eu && eu.Transform
        ? eg.enableStreamingAPI(eu)
        : (eg.encodeStream = eg.decodeStream =
            function () {
              throw Error(
                "iconv-lite Streaming API is not enabled. Use iconv.enableStreamingAPI(require('stream')); to enable it.",
              );
            });
    },
    19845(eA, el, ec) {
      "use strict";
      var eu,
        ed = ec(20181),
        ep = ed.Buffer,
        eg = {};
      for (eu in ed)
        ed.hasOwnProperty(eu) &&
          "SlowBuffer" !== eu &&
          "Buffer" !== eu &&
          (eg[eu] = ed[eu]);
      var eh = (eg.Buffer = {});
      for (eu in ep)
        ep.hasOwnProperty(eu) &&
          "allocUnsafe" !== eu &&
          "allocUnsafeSlow" !== eu &&
          (eh[eu] = ep[eu]);
      if (
        ((eg.Buffer.prototype = ep.prototype),
        (eh.from && eh.from !== Uint8Array.from) ||
          (eh.from = function (eA, el, ec) {
            if ("number" == typeof eA)
              throw TypeError(
                'The "value" argument must not be of type number. Received type ' +
                  typeof eA,
              );
            if (eA && void 0 === eA.length)
              throw TypeError(
                "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
                  typeof eA,
              );
            return ep(eA, el, ec);
          }),
        eh.alloc ||
          (eh.alloc = function (eA, el, ec) {
            if ("number" != typeof eA)
              throw TypeError(
                'The "size" argument must be of type number. Received type ' +
                  typeof eA,
              );
            if (eA < 0 || eA >= 2 * 0x40000000)
              throw RangeError(
                'The value "' + eA + '" is invalid for option "size"',
              );
            var eu = ep(eA);
            return (
              el && 0 !== el.length
                ? "string" == typeof ec
                  ? eu.fill(el, ec)
                  : eu.fill(el)
                : eu.fill(0),
              eu
            );
          }),
        !eg.kStringMaxLength)
      )
        try {
          eg.kStringMaxLength = process.binding("buffer").kStringMaxLength;
        } catch (eA) {}
      (!eg.constants &&
        ((eg.constants = { MAX_LENGTH: eg.kMaxLength }),
        eg.kStringMaxLength &&
          (eg.constants.MAX_STRING_LENGTH = eg.kStringMaxLength)),
        (eA.exports = eg));
    },
    38900(eA, el) {
      "use strict";
      var ec = "\uFEFF";
      function PrependBOMWrapper(eA, el) {
        ((this.encoder = eA), (this.addBOM = !0));
      }
      function StripBOMWrapper(eA, el) {
        ((this.decoder = eA), (this.pass = !1), (this.options = el || {}));
      }
      ((el.PrependBOM = PrependBOMWrapper),
        (PrependBOMWrapper.prototype.write = function (eA) {
          return (
            this.addBOM && ((eA = ec + eA), (this.addBOM = !1)),
            this.encoder.write(eA)
          );
        }),
        (PrependBOMWrapper.prototype.end = function () {
          return this.encoder.end();
        }),
        (el.StripBOM = StripBOMWrapper),
        (StripBOMWrapper.prototype.write = function (eA) {
          var el = this.decoder.write(eA);
          return (
            this.pass ||
              !el ||
              (el[0] === ec &&
                ((el = el.slice(1)),
                "function" == typeof this.options.stripBOM &&
                  this.options.stripBOM()),
              (this.pass = !0)),
            el
          );
        }),
        (StripBOMWrapper.prototype.end = function () {
          return this.decoder.end();
        }));
    },
    32499(eA, el, ec) {
      "use strict";
      for (
        var eu = [
            ec(59506),
            ec(96015),
            ec(83025),
            ec(54849),
            ec(16247),
            ec(32929),
            ec(9913),
            ec(31132),
            ec(37772),
          ],
          ed = 0;
        ed < eu.length;
        ed++
      ) {
        var ep = eu[ed];
        for (var eg in ep)
          Object.prototype.hasOwnProperty.call(ep, eg) && (el[eg] = ep[eg]);
      }
    },
    59506(eA, el, ec) {
      "use strict";
      var eu = ec(19845).Buffer;
      function InternalCodec(eA, el) {
        ((this.enc = eA.encodingName),
          (this.bomAware = eA.bomAware),
          "base64" === this.enc
            ? (this.encoder = InternalEncoderBase64)
            : "cesu8" === this.enc &&
              ((this.enc = "utf8"),
              (this.encoder = InternalEncoderCesu8),
              "\uD83D\uDCA9" !== eu.from("eda0bdedb2a9", "hex").toString() &&
                ((this.decoder = InternalDecoderCesu8),
                (this.defaultCharUnicode = el.defaultCharUnicode))));
      }
      ((eA.exports = {
        utf8: { type: "_internal", bomAware: !0 },
        cesu8: { type: "_internal", bomAware: !0 },
        unicode11utf8: "utf8",
        ucs2: { type: "_internal", bomAware: !0 },
        utf16le: "ucs2",
        binary: { type: "_internal" },
        base64: { type: "_internal" },
        hex: { type: "_internal" },
        _internal: InternalCodec,
      }),
        (InternalCodec.prototype.encoder = InternalEncoder),
        (InternalCodec.prototype.decoder = InternalDecoder));
      var ed = ec(13193).StringDecoder;
      function InternalDecoder(eA, el) {
        this.decoder = new ed(el.enc);
      }
      function InternalEncoder(eA, el) {
        this.enc = el.enc;
      }
      function InternalEncoderBase64(eA, el) {
        this.prevStr = "";
      }
      function InternalEncoderCesu8(eA, el) {}
      function InternalDecoderCesu8(eA, el) {
        ((this.acc = 0),
          (this.contBytes = 0),
          (this.accBytes = 0),
          (this.defaultCharUnicode = el.defaultCharUnicode));
      }
      (ed.prototype.end || (ed.prototype.end = function () {}),
        (InternalDecoder.prototype.write = function (eA) {
          return (
            eu.isBuffer(eA) || (eA = eu.from(eA)),
            this.decoder.write(eA)
          );
        }),
        (InternalDecoder.prototype.end = function () {
          return this.decoder.end();
        }),
        (InternalEncoder.prototype.write = function (eA) {
          return eu.from(eA, this.enc);
        }),
        (InternalEncoder.prototype.end = function () {}),
        (InternalEncoderBase64.prototype.write = function (eA) {
          var el = (eA = this.prevStr + eA).length - (eA.length % 4);
          return (
            (this.prevStr = eA.slice(el)),
            (eA = eA.slice(0, el)),
            eu.from(eA, "base64")
          );
        }),
        (InternalEncoderBase64.prototype.end = function () {
          return eu.from(this.prevStr, "base64");
        }),
        (InternalEncoderCesu8.prototype.write = function (eA) {
          for (
            var el = eu.alloc(3 * eA.length), ec = 0, ed = 0;
            ed < eA.length;
            ed++
          ) {
            var ep = eA.charCodeAt(ed);
            ep < 128
              ? (el[ec++] = ep)
              : (ep < 2048
                  ? (el[ec++] = 192 + (ep >>> 6))
                  : ((el[ec++] = 224 + (ep >>> 12)),
                    (el[ec++] = 128 + ((ep >>> 6) & 63))),
                (el[ec++] = 128 + (63 & ep)));
          }
          return el.slice(0, ec);
        }),
        (InternalEncoderCesu8.prototype.end = function () {}),
        (InternalDecoderCesu8.prototype.write = function (eA) {
          for (
            var el = this.acc,
              ec = this.contBytes,
              eu = this.accBytes,
              ed = "",
              ep = 0;
            ep < eA.length;
            ep++
          ) {
            var eg = eA[ep];
            (192 & eg) != 128
              ? (ec > 0 && ((ed += this.defaultCharUnicode), (ec = 0)),
                eg < 128
                  ? (ed += String.fromCharCode(eg))
                  : eg < 224
                    ? ((el = 31 & eg), (ec = 1), (eu = 1))
                    : eg < 240
                      ? ((el = 15 & eg), (ec = 2), (eu = 1))
                      : (ed += this.defaultCharUnicode))
              : ec > 0
                ? ((el = (el << 6) | (63 & eg)),
                  ec--,
                  eu++,
                  0 === ec &&
                    ((2 === eu && el < 128 && el > 0) || (3 === eu && el < 2048)
                      ? (ed += this.defaultCharUnicode)
                      : (ed += String.fromCharCode(el))))
                : (ed += this.defaultCharUnicode);
          }
          return (
            (this.acc = el),
            (this.contBytes = ec),
            (this.accBytes = eu),
            ed
          );
        }),
        (InternalDecoderCesu8.prototype.end = function () {
          var eA = 0;
          return (this.contBytes > 0 && (eA += this.defaultCharUnicode), eA);
        }));
    },
    96015(eA, el, ec) {
      "use strict";
      var eu = ec(19845).Buffer;
      function Utf32Codec(eA, el) {
        ((this.iconv = el), (this.bomAware = !0), (this.isLE = eA.isLE));
      }
      function Utf32Encoder(eA, el) {
        ((this.isLE = el.isLE), (this.highSurrogate = 0));
      }
      function Utf32Decoder(eA, el) {
        ((this.isLE = el.isLE),
          (this.badChar = el.iconv.defaultCharUnicode.charCodeAt(0)),
          (this.overflow = []));
      }
      function _writeCodepoint(eA, el, ec, eu) {
        if (((ec < 0 || ec > 1114111) && (ec = eu), ec >= 65536)) {
          var ed = 55296 | ((ec -= 65536) >> 10);
          ((eA[el++] = 255 & ed), (eA[el++] = ed >> 8));
          var ec = 56320 | (1023 & ec);
        }
        return ((eA[el++] = 255 & ec), (eA[el++] = ec >> 8), el);
      }
      function Utf32AutoCodec(eA, el) {
        this.iconv = el;
      }
      function Utf32AutoEncoder(eA, el) {
        (void 0 === (eA = eA || {}).addBOM && (eA.addBOM = !0),
          (this.encoder = el.iconv.getEncoder(
            eA.defaultEncoding || "utf-32le",
            eA,
          )));
      }
      function Utf32AutoDecoder(eA, el) {
        ((this.decoder = null),
          (this.initialBufs = []),
          (this.initialBufsLen = 0),
          (this.options = eA || {}),
          (this.iconv = el.iconv));
      }
      function detectEncoding(eA, el) {
        var ec = [],
          eu = 0,
          ed = 0,
          ep = 0,
          eg = 0,
          eh = 0;
        m: for (var ef = 0; ef < eA.length; ef++)
          for (var em = eA[ef], eE = 0; eE < em.length; eE++)
            if ((ec.push(em[eE]), 4 === ec.length)) {
              if (0 === eu) {
                if (
                  255 === ec[0] &&
                  254 === ec[1] &&
                  0 === ec[2] &&
                  0 === ec[3]
                )
                  return "utf-32le";
                if (
                  0 === ec[0] &&
                  0 === ec[1] &&
                  254 === ec[2] &&
                  255 === ec[3]
                )
                  return "utf-32be";
              }
              if (
                ((0 !== ec[0] || ec[1] > 16) && ep++,
                (0 !== ec[3] || ec[2] > 16) && ed++,
                0 === ec[0] &&
                  0 === ec[1] &&
                  (0 !== ec[2] || 0 !== ec[3]) &&
                  eh++,
                (0 !== ec[0] || 0 !== ec[1]) &&
                  0 === ec[2] &&
                  0 === ec[3] &&
                  eg++,
                (ec.length = 0),
                ++eu >= 100)
              )
                break m;
            }
        return eh - ep > eg - ed
          ? "utf-32be"
          : eh - ep < eg - ed
            ? "utf-32le"
            : el || "utf-32le";
      }
      ((el._utf32 = Utf32Codec),
        (el.utf32le = { type: "_utf32", isLE: !0 }),
        (el.utf32be = { type: "_utf32", isLE: !1 }),
        (el.ucs4le = "utf32le"),
        (el.ucs4be = "utf32be"),
        (Utf32Codec.prototype.encoder = Utf32Encoder),
        (Utf32Codec.prototype.decoder = Utf32Decoder),
        (Utf32Encoder.prototype.write = function (eA) {
          for (
            var el = eu.from(eA, "ucs2"),
              ec = eu.alloc(2 * el.length),
              ed = this.isLE ? ec.writeUInt32LE : ec.writeUInt32BE,
              ep = 0,
              eg = 0;
            eg < el.length;
            eg += 2
          ) {
            var eh = el.readUInt16LE(eg),
              ef = 55296 <= eh && eh < 56320,
              em = 56320 <= eh && eh < 57344;
            if (this.highSurrogate)
              if (ef || !em) (ed.call(ec, this.highSurrogate, ep), (ep += 4));
              else {
                var eE =
                  (((this.highSurrogate - 55296) << 10) | (eh - 56320)) + 65536;
                (ed.call(ec, eE, ep), (ep += 4), (this.highSurrogate = 0));
                continue;
              }
            ef
              ? (this.highSurrogate = eh)
              : (ed.call(ec, eh, ep), (ep += 4), (this.highSurrogate = 0));
          }
          return (ep < ec.length && (ec = ec.slice(0, ep)), ec);
        }),
        (Utf32Encoder.prototype.end = function () {
          if (this.highSurrogate) {
            var eA = eu.alloc(4);
            return (
              this.isLE
                ? eA.writeUInt32LE(this.highSurrogate, 0)
                : eA.writeUInt32BE(this.highSurrogate, 0),
              (this.highSurrogate = 0),
              eA
            );
          }
        }),
        (Utf32Decoder.prototype.write = function (eA) {
          if (0 === eA.length) return "";
          var el = 0,
            ec = 0,
            ed = eu.alloc(eA.length + 4),
            ep = 0,
            eg = this.isLE,
            eh = this.overflow,
            ef = this.badChar;
          if (eh.length > 0) {
            for (; el < eA.length && eh.length < 4; el++) eh.push(eA[el]);
            4 === eh.length &&
              ((ec = eg
                ? eh[el] |
                  (eh[el + 1] << 8) |
                  (eh[el + 2] << 16) |
                  (eh[el + 3] << 24)
                : eh[el + 3] |
                  (eh[el + 2] << 8) |
                  (eh[el + 1] << 16) |
                  (eh[el] << 24)),
              (eh.length = 0),
              (ep = _writeCodepoint(ed, ep, ec, ef)));
          }
          for (; el < eA.length - 3; el += 4)
            ep = _writeCodepoint(
              ed,
              ep,
              (ec = eg
                ? eA[el] |
                  (eA[el + 1] << 8) |
                  (eA[el + 2] << 16) |
                  (eA[el + 3] << 24)
                : eA[el + 3] |
                  (eA[el + 2] << 8) |
                  (eA[el + 1] << 16) |
                  (eA[el] << 24)),
              ef,
            );
          for (; el < eA.length; el++) eh.push(eA[el]);
          return ed.slice(0, ep).toString("ucs2");
        }),
        (Utf32Decoder.prototype.end = function () {
          this.overflow.length = 0;
        }),
        (el.utf32 = Utf32AutoCodec),
        (el.ucs4 = "utf32"),
        (Utf32AutoCodec.prototype.encoder = Utf32AutoEncoder),
        (Utf32AutoCodec.prototype.decoder = Utf32AutoDecoder),
        (Utf32AutoEncoder.prototype.write = function (eA) {
          return this.encoder.write(eA);
        }),
        (Utf32AutoEncoder.prototype.end = function () {
          return this.encoder.end();
        }),
        (Utf32AutoDecoder.prototype.write = function (eA) {
          if (!this.decoder) {
            if (
              (this.initialBufs.push(eA),
              (this.initialBufsLen += eA.length),
              this.initialBufsLen < 32)
            )
              return "";
            var el = detectEncoding(
              this.initialBufs,
              this.options.defaultEncoding,
            );
            this.decoder = this.iconv.getDecoder(el, this.options);
            for (var ec = "", eu = 0; eu < this.initialBufs.length; eu++)
              ec += this.decoder.write(this.initialBufs[eu]);
            return ((this.initialBufs.length = this.initialBufsLen = 0), ec);
          }
          return this.decoder.write(eA);
        }),
        (Utf32AutoDecoder.prototype.end = function () {
          if (!this.decoder) {
            var eA = detectEncoding(
              this.initialBufs,
              this.options.defaultEncoding,
            );
            this.decoder = this.iconv.getDecoder(eA, this.options);
            for (var el = "", ec = 0; ec < this.initialBufs.length; ec++)
              el += this.decoder.write(this.initialBufs[ec]);
            var eu = this.decoder.end();
            return (
              eu && (el += eu),
              (this.initialBufs.length = this.initialBufsLen = 0),
              el
            );
          }
          return this.decoder.end();
        }));
    },
    83025(eA, el, ec) {
      "use strict";
      var eu = ec(19845).Buffer;
      function Utf16BECodec() {}
      function Utf16BEEncoder() {}
      function Utf16BEDecoder() {
        this.overflowByte = -1;
      }
      function Utf16Codec(eA, el) {
        this.iconv = el;
      }
      function Utf16Encoder(eA, el) {
        (void 0 === (eA = eA || {}).addBOM && (eA.addBOM = !0),
          (this.encoder = el.iconv.getEncoder("utf-16le", eA)));
      }
      function Utf16Decoder(eA, el) {
        ((this.decoder = null),
          (this.initialBufs = []),
          (this.initialBufsLen = 0),
          (this.options = eA || {}),
          (this.iconv = el.iconv));
      }
      function detectEncoding(eA, el) {
        var ec = [],
          eu = 0,
          ed = 0,
          ep = 0;
        m: for (var eg = 0; eg < eA.length; eg++)
          for (var eh = eA[eg], ef = 0; ef < eh.length; ef++)
            if ((ec.push(eh[ef]), 2 === ec.length)) {
              if (0 === eu) {
                if (255 === ec[0] && 254 === ec[1]) return "utf-16le";
                if (254 === ec[0] && 255 === ec[1]) return "utf-16be";
              }
              if (
                (0 === ec[0] && 0 !== ec[1] && ep++,
                0 !== ec[0] && 0 === ec[1] && ed++,
                (ec.length = 0),
                ++eu >= 100)
              )
                break m;
            }
        return ep > ed ? "utf-16be" : ep < ed ? "utf-16le" : el || "utf-16le";
      }
      ((el.utf16be = Utf16BECodec),
        (Utf16BECodec.prototype.encoder = Utf16BEEncoder),
        (Utf16BECodec.prototype.decoder = Utf16BEDecoder),
        (Utf16BECodec.prototype.bomAware = !0),
        (Utf16BEEncoder.prototype.write = function (eA) {
          for (var el = eu.from(eA, "ucs2"), ec = 0; ec < el.length; ec += 2) {
            var ed = el[ec];
            ((el[ec] = el[ec + 1]), (el[ec + 1] = ed));
          }
          return el;
        }),
        (Utf16BEEncoder.prototype.end = function () {}),
        (Utf16BEDecoder.prototype.write = function (eA) {
          if (0 == eA.length) return "";
          var el = eu.alloc(eA.length + 1),
            ec = 0,
            ed = 0;
          for (
            -1 !== this.overflowByte &&
            ((el[0] = eA[0]), (el[1] = this.overflowByte), (ec = 1), (ed = 2));
            ec < eA.length - 1;
            ec += 2, ed += 2
          )
            ((el[ed] = eA[ec + 1]), (el[ed + 1] = eA[ec]));
          return (
            (this.overflowByte = ec == eA.length - 1 ? eA[eA.length - 1] : -1),
            el.slice(0, ed).toString("ucs2")
          );
        }),
        (Utf16BEDecoder.prototype.end = function () {
          this.overflowByte = -1;
        }),
        (el.utf16 = Utf16Codec),
        (Utf16Codec.prototype.encoder = Utf16Encoder),
        (Utf16Codec.prototype.decoder = Utf16Decoder),
        (Utf16Encoder.prototype.write = function (eA) {
          return this.encoder.write(eA);
        }),
        (Utf16Encoder.prototype.end = function () {
          return this.encoder.end();
        }),
        (Utf16Decoder.prototype.write = function (eA) {
          if (!this.decoder) {
            if (
              (this.initialBufs.push(eA),
              (this.initialBufsLen += eA.length),
              this.initialBufsLen < 16)
            )
              return "";
            var el = detectEncoding(
              this.initialBufs,
              this.options.defaultEncoding,
            );
            this.decoder = this.iconv.getDecoder(el, this.options);
            for (var ec = "", eu = 0; eu < this.initialBufs.length; eu++)
              ec += this.decoder.write(this.initialBufs[eu]);
            return ((this.initialBufs.length = this.initialBufsLen = 0), ec);
          }
          return this.decoder.write(eA);
        }),
        (Utf16Decoder.prototype.end = function () {
          if (!this.decoder) {
            var eA = detectEncoding(
              this.initialBufs,
              this.options.defaultEncoding,
            );
            this.decoder = this.iconv.getDecoder(eA, this.options);
            for (var el = "", ec = 0; ec < this.initialBufs.length; ec++)
              el += this.decoder.write(this.initialBufs[ec]);
            var eu = this.decoder.end();
            return (
              eu && (el += eu),
              (this.initialBufs.length = this.initialBufsLen = 0),
              el
            );
          }
          return this.decoder.end();
        }));
    },
    54849(eA, el, ec) {
      "use strict";
      var eu = ec(19845).Buffer;
      function Utf7Codec(eA, el) {
        this.iconv = el;
      }
      ((el.utf7 = Utf7Codec),
        (el.unicode11utf7 = "utf7"),
        (Utf7Codec.prototype.encoder = Utf7Encoder),
        (Utf7Codec.prototype.decoder = Utf7Decoder),
        (Utf7Codec.prototype.bomAware = !0));
      var ed = /[^A-Za-z0-9'\(\),-\.\/:\? \n\r\t]+/g;
      function Utf7Encoder(eA, el) {
        this.iconv = el.iconv;
      }
      function Utf7Decoder(eA, el) {
        ((this.iconv = el.iconv),
          (this.inBase64 = !1),
          (this.base64Accum = ""));
      }
      ((Utf7Encoder.prototype.write = function (eA) {
        return eu.from(
          eA.replace(
            ed,
            function (eA) {
              return (
                "+" +
                ("+" === eA
                  ? ""
                  : this.iconv
                      .encode(eA, "utf16-be")
                      .toString("base64")
                      .replace(/=+$/, "")) +
                "-"
              );
            }.bind(this),
          ),
        );
      }),
        (Utf7Encoder.prototype.end = function () {}));
      for (var ep = /[A-Za-z0-9\/+]/, eg = [], eh = 0; eh < 256; eh++)
        eg[eh] = ep.test(String.fromCharCode(eh));
      var ef = 43,
        em = 45,
        eE = 38;
      function Utf7IMAPCodec(eA, el) {
        this.iconv = el;
      }
      function Utf7IMAPEncoder(eA, el) {
        ((this.iconv = el.iconv),
          (this.inBase64 = !1),
          (this.base64Accum = eu.alloc(6)),
          (this.base64AccumIdx = 0));
      }
      function Utf7IMAPDecoder(eA, el) {
        ((this.iconv = el.iconv),
          (this.inBase64 = !1),
          (this.base64Accum = ""));
      }
      ((Utf7Decoder.prototype.write = function (eA) {
        for (
          var el = "",
            ec = 0,
            ed = this.inBase64,
            ep = this.base64Accum,
            eh = 0;
          eh < eA.length;
          eh++
        )
          if (ed) {
            if (!eg[eA[eh]]) {
              if (eh == ec && eA[eh] == em) el += "+";
              else {
                var eE = ep + this.iconv.decode(eA.slice(ec, eh), "ascii");
                el += this.iconv.decode(eu.from(eE, "base64"), "utf16-be");
              }
              (eA[eh] != em && eh--, (ec = eh + 1), (ed = !1), (ep = ""));
            }
          } else
            eA[eh] == ef &&
              ((el += this.iconv.decode(eA.slice(ec, eh), "ascii")),
              (ec = eh + 1),
              (ed = !0));
        if (ed) {
          var eE = ep + this.iconv.decode(eA.slice(ec), "ascii"),
            eC = eE.length - (eE.length % 8);
          ((ep = eE.slice(eC)),
            (eE = eE.slice(0, eC)),
            (el += this.iconv.decode(eu.from(eE, "base64"), "utf16-be")));
        } else el += this.iconv.decode(eA.slice(ec), "ascii");
        return ((this.inBase64 = ed), (this.base64Accum = ep), el);
      }),
        (Utf7Decoder.prototype.end = function () {
          var eA = "";
          return (
            this.inBase64 &&
              this.base64Accum.length > 0 &&
              (eA = this.iconv.decode(
                eu.from(this.base64Accum, "base64"),
                "utf16-be",
              )),
            (this.inBase64 = !1),
            (this.base64Accum = ""),
            eA
          );
        }),
        (el.utf7imap = Utf7IMAPCodec),
        (Utf7IMAPCodec.prototype.encoder = Utf7IMAPEncoder),
        (Utf7IMAPCodec.prototype.decoder = Utf7IMAPDecoder),
        (Utf7IMAPCodec.prototype.bomAware = !0),
        (Utf7IMAPEncoder.prototype.write = function (eA) {
          for (
            var el = this.inBase64,
              ec = this.base64Accum,
              ed = this.base64AccumIdx,
              ep = eu.alloc(5 * eA.length + 10),
              eg = 0,
              eh = 0;
            eh < eA.length;
            eh++
          ) {
            var ef = eA.charCodeAt(eh);
            32 <= ef && ef <= 126
              ? (el &&
                  (ed > 0 &&
                    ((eg += ep.write(
                      ec
                        .slice(0, ed)
                        .toString("base64")
                        .replace(/\//g, ",")
                        .replace(/=+$/, ""),
                      eg,
                    )),
                    (ed = 0)),
                  (ep[eg++] = em),
                  (el = !1)),
                el || ((ep[eg++] = ef), ef === eE && (ep[eg++] = em)))
              : (el || ((ep[eg++] = eE), (el = !0)),
                el &&
                  ((ec[ed++] = ef >> 8),
                  (ec[ed++] = 255 & ef),
                  ed == ec.length &&
                    ((eg += ep.write(
                      ec.toString("base64").replace(/\//g, ","),
                      eg,
                    )),
                    (ed = 0))));
          }
          return (
            (this.inBase64 = el),
            (this.base64AccumIdx = ed),
            ep.slice(0, eg)
          );
        }),
        (Utf7IMAPEncoder.prototype.end = function () {
          var eA = eu.alloc(10),
            el = 0;
          return (
            this.inBase64 &&
              (this.base64AccumIdx > 0 &&
                ((el += eA.write(
                  this.base64Accum
                    .slice(0, this.base64AccumIdx)
                    .toString("base64")
                    .replace(/\//g, ",")
                    .replace(/=+$/, ""),
                  el,
                )),
                (this.base64AccumIdx = 0)),
              (eA[el++] = em),
              (this.inBase64 = !1)),
            eA.slice(0, el)
          );
        }));
      var eC = eg.slice();
      ((eC[44] = !0),
        (Utf7IMAPDecoder.prototype.write = function (eA) {
          for (
            var el = "",
              ec = 0,
              ed = this.inBase64,
              ep = this.base64Accum,
              eg = 0;
            eg < eA.length;
            eg++
          )
            if (ed) {
              if (!eC[eA[eg]]) {
                if (eg == ec && eA[eg] == em) el += "&";
                else {
                  var eh =
                    ep +
                    this.iconv
                      .decode(eA.slice(ec, eg), "ascii")
                      .replace(/,/g, "/");
                  el += this.iconv.decode(eu.from(eh, "base64"), "utf16-be");
                }
                (eA[eg] != em && eg--, (ec = eg + 1), (ed = !1), (ep = ""));
              }
            } else
              eA[eg] == eE &&
                ((el += this.iconv.decode(eA.slice(ec, eg), "ascii")),
                (ec = eg + 1),
                (ed = !0));
          if (ed) {
            var eh =
                ep +
                this.iconv.decode(eA.slice(ec), "ascii").replace(/,/g, "/"),
              ef = eh.length - (eh.length % 8);
            ((ep = eh.slice(ef)),
              (eh = eh.slice(0, ef)),
              (el += this.iconv.decode(eu.from(eh, "base64"), "utf16-be")));
          } else el += this.iconv.decode(eA.slice(ec), "ascii");
          return ((this.inBase64 = ed), (this.base64Accum = ep), el);
        }),
        (Utf7IMAPDecoder.prototype.end = function () {
          var eA = "";
          return (
            this.inBase64 &&
              this.base64Accum.length > 0 &&
              (eA = this.iconv.decode(
                eu.from(this.base64Accum, "base64"),
                "utf16-be",
              )),
            (this.inBase64 = !1),
            (this.base64Accum = ""),
            eA
          );
        }));
    },
    16247(eA, el, ec) {
      "use strict";
      var eu = ec(19845).Buffer;
      function SBCSCodec(eA, el) {
        if (!eA) throw Error("SBCS codec is called without the data.");
        if (!eA.chars || (128 !== eA.chars.length && 256 !== eA.chars.length))
          throw Error(
            "Encoding '" +
              eA.type +
              "' has incorrect 'chars' (must be of len 128 or 256)",
          );
        if (128 === eA.chars.length) {
          for (var ec = "", ed = 0; ed < 128; ed++)
            ec += String.fromCharCode(ed);
          eA.chars = ec + eA.chars;
        }
        this.decodeBuf = eu.from(eA.chars, "ucs2");
        for (
          var ep = eu.alloc(65536, el.defaultCharSingleByte.charCodeAt(0)),
            ed = 0;
          ed < eA.chars.length;
          ed++
        )
          ep[eA.chars.charCodeAt(ed)] = ed;
        this.encodeBuf = ep;
      }
      function SBCSEncoder(eA, el) {
        this.encodeBuf = el.encodeBuf;
      }
      function SBCSDecoder(eA, el) {
        this.decodeBuf = el.decodeBuf;
      }
      ((el._sbcs = SBCSCodec),
        (SBCSCodec.prototype.encoder = SBCSEncoder),
        (SBCSCodec.prototype.decoder = SBCSDecoder),
        (SBCSEncoder.prototype.write = function (eA) {
          for (var el = eu.alloc(eA.length), ec = 0; ec < eA.length; ec++)
            el[ec] = this.encodeBuf[eA.charCodeAt(ec)];
          return el;
        }),
        (SBCSEncoder.prototype.end = function () {}),
        (SBCSDecoder.prototype.write = function (eA) {
          for (
            var el = this.decodeBuf,
              ec = eu.alloc(2 * eA.length),
              ed = 0,
              ep = 0,
              eg = 0;
            eg < eA.length;
            eg++
          )
            ((ed = 2 * eA[eg]),
              (ec[(ep = 2 * eg)] = el[ed]),
              (ec[ep + 1] = el[ed + 1]));
          return ec.toString("ucs2");
        }),
        (SBCSDecoder.prototype.end = function () {}));
    },
    32929(eA) {
      "use strict";
      eA.exports = {
        10029: "maccenteuro",
        maccenteuro: {
          type: "_sbcs",
          chars:
            "\xc4Āā\xc9Ą\xd6\xdc\xe1ąČ\xe4čĆć\xe9ŹźĎ\xedďĒēĖ\xf3ė\xf4\xf6\xf5\xfaĚě\xfc†\xb0Ę\xa3\xa7•\xb6\xdf\xae\xa9™ę\xa8≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅņŃ\xac√ńŇ∆\xab\xbb…\xa0ňŐ\xd5őŌ–—“”‘’\xf7◊ōŔŕŘ‹›řŖŗŠ‚„šŚś\xc1Ťť\xcdŽžŪ\xd3\xd4ūŮ\xdaůŰűŲų\xdd\xfdķŻŁżĢˇ",
        },
        808: "cp808",
        ibm808: "cp808",
        cp808: {
          type: "_sbcs",
          chars:
            "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў\xb0∙\xb7√№€■\xa0",
        },
        mik: {
          type: "_sbcs",
          chars:
            "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя└┴┬├─┼╣║╚╔╩╦╠═╬┐░▒▓│┤№\xa7╗╝┘┌█▄▌▐▀α\xdfΓπΣσ\xb5τΦΘΩδ∞φε∩≡\xb1≥≤⌠⌡\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        cp720: {
          type: "_sbcs",
          chars:
            "\x80\x81\xe9\xe2\x84\xe0\x86\xe7\xea\xeb\xe8\xef\xee\x8d\x8e\x8f\x90ّْ\xf4\xa4ـ\xfb\xf9ءآأؤ\xa3إئابةتثجحخدذرزسشص\xab\xbb░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀ضطظعغف\xb5قكلمنهوىي≡ًٌٍَُِ≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ascii8bit: "ascii",
        usascii: "ascii",
        ansix34: "ascii",
        ansix341968: "ascii",
        ansix341986: "ascii",
        csascii: "ascii",
        cp367: "ascii",
        ibm367: "ascii",
        isoir6: "ascii",
        iso646us: "ascii",
        iso646irv: "ascii",
        us: "ascii",
        latin1: "iso88591",
        latin2: "iso88592",
        latin3: "iso88593",
        latin4: "iso88594",
        latin5: "iso88599",
        latin6: "iso885910",
        latin7: "iso885913",
        latin8: "iso885914",
        latin9: "iso885915",
        latin10: "iso885916",
        csisolatin1: "iso88591",
        csisolatin2: "iso88592",
        csisolatin3: "iso88593",
        csisolatin4: "iso88594",
        csisolatincyrillic: "iso88595",
        csisolatinarabic: "iso88596",
        csisolatingreek: "iso88597",
        csisolatinhebrew: "iso88598",
        csisolatin5: "iso88599",
        csisolatin6: "iso885910",
        l1: "iso88591",
        l2: "iso88592",
        l3: "iso88593",
        l4: "iso88594",
        l5: "iso88599",
        l6: "iso885910",
        l7: "iso885913",
        l8: "iso885914",
        l9: "iso885915",
        l10: "iso885916",
        isoir14: "iso646jp",
        isoir57: "iso646cn",
        isoir100: "iso88591",
        isoir101: "iso88592",
        isoir109: "iso88593",
        isoir110: "iso88594",
        isoir144: "iso88595",
        isoir127: "iso88596",
        isoir126: "iso88597",
        isoir138: "iso88598",
        isoir148: "iso88599",
        isoir157: "iso885910",
        isoir166: "tis620",
        isoir179: "iso885913",
        isoir199: "iso885914",
        isoir203: "iso885915",
        isoir226: "iso885916",
        cp819: "iso88591",
        ibm819: "iso88591",
        cyrillic: "iso88595",
        arabic: "iso88596",
        arabic8: "iso88596",
        ecma114: "iso88596",
        asmo708: "iso88596",
        greek: "iso88597",
        greek8: "iso88597",
        ecma118: "iso88597",
        elot928: "iso88597",
        hebrew: "iso88598",
        hebrew8: "iso88598",
        turkish: "iso88599",
        turkish8: "iso88599",
        thai: "iso885911",
        thai8: "iso885911",
        celtic: "iso885914",
        celtic8: "iso885914",
        isoceltic: "iso885914",
        tis6200: "tis620",
        tis62025291: "tis620",
        tis62025330: "tis620",
        1e4: "macroman",
        10006: "macgreek",
        10007: "maccyrillic",
        10079: "maciceland",
        10081: "macturkish",
        cspc8codepage437: "cp437",
        cspc775baltic: "cp775",
        cspc850multilingual: "cp850",
        cspcp852: "cp852",
        cspc862latinhebrew: "cp862",
        cpgr: "cp869",
        msee: "cp1250",
        mscyrl: "cp1251",
        msansi: "cp1252",
        msgreek: "cp1253",
        msturk: "cp1254",
        mshebr: "cp1255",
        msarab: "cp1256",
        winbaltrim: "cp1257",
        cp20866: "koi8r",
        20866: "koi8r",
        ibm878: "koi8r",
        cskoi8r: "koi8r",
        cp21866: "koi8u",
        21866: "koi8u",
        ibm1168: "koi8u",
        strk10482002: "rk1048",
        tcvn5712: "tcvn",
        tcvn57121: "tcvn",
        gb198880: "iso646cn",
        cn: "iso646cn",
        csiso14jisc6220ro: "iso646jp",
        jisc62201969ro: "iso646jp",
        jp: "iso646jp",
        cshproman8: "hproman8",
        r8: "hproman8",
        roman8: "hproman8",
        xroman8: "hproman8",
        ibm1051: "hproman8",
        mac: "macintosh",
        csmacintosh: "macintosh",
      };
    },
    9913(eA) {
      "use strict";
      eA.exports = {
        437: "cp437",
        737: "cp737",
        775: "cp775",
        850: "cp850",
        852: "cp852",
        855: "cp855",
        856: "cp856",
        857: "cp857",
        858: "cp858",
        860: "cp860",
        861: "cp861",
        862: "cp862",
        863: "cp863",
        864: "cp864",
        865: "cp865",
        866: "cp866",
        869: "cp869",
        874: "windows874",
        922: "cp922",
        1046: "cp1046",
        1124: "cp1124",
        1125: "cp1125",
        1129: "cp1129",
        1133: "cp1133",
        1161: "cp1161",
        1162: "cp1162",
        1163: "cp1163",
        1250: "windows1250",
        1251: "windows1251",
        1252: "windows1252",
        1253: "windows1253",
        1254: "windows1254",
        1255: "windows1255",
        1256: "windows1256",
        1257: "windows1257",
        1258: "windows1258",
        28591: "iso88591",
        28592: "iso88592",
        28593: "iso88593",
        28594: "iso88594",
        28595: "iso88595",
        28596: "iso88596",
        28597: "iso88597",
        28598: "iso88598",
        28599: "iso88599",
        28600: "iso885910",
        28601: "iso885911",
        28603: "iso885913",
        28604: "iso885914",
        28605: "iso885915",
        28606: "iso885916",
        windows874: {
          type: "_sbcs",
          chars:
            "€����…�����������‘’“”•–—��������\xa0กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����",
        },
        win874: "windows874",
        cp874: "windows874",
        windows1250: {
          type: "_sbcs",
          chars:
            "€�‚�„…†‡�‰Š‹ŚŤŽŹ�‘’“”•–—�™š›śťžź\xa0ˇ˘Ł\xa4Ą\xa6\xa7\xa8\xa9Ş\xab\xac\xad\xaeŻ\xb0\xb1˛ł\xb4\xb5\xb6\xb7\xb8ąş\xbbĽ˝ľżŔ\xc1\xc2Ă\xc4ĹĆ\xc7Č\xc9Ę\xcbĚ\xcd\xceĎĐŃŇ\xd3\xd4Ő\xd6\xd7ŘŮ\xdaŰ\xdc\xddŢ\xdfŕ\xe1\xe2ă\xe4ĺć\xe7č\xe9ę\xebě\xed\xeeďđńň\xf3\xf4ő\xf6\xf7řů\xfaű\xfc\xfdţ˙",
        },
        win1250: "windows1250",
        cp1250: "windows1250",
        windows1251: {
          type: "_sbcs",
          chars:
            "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ\xa0ЎўЈ\xa4Ґ\xa6\xa7Ё\xa9Є\xab\xac\xad\xaeЇ\xb0\xb1Ііґ\xb5\xb6\xb7ё№є\xbbјЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя",
        },
        win1251: "windows1251",
        cp1251: "windows1251",
        windows1252: {
          type: "_sbcs",
          chars:
            "€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
        },
        win1252: "windows1252",
        cp1252: "windows1252",
        windows1253: {
          type: "_sbcs",
          chars:
            "€�‚ƒ„…†‡�‰�‹�����‘’“”•–—�™�›����\xa0΅Ά\xa3\xa4\xa5\xa6\xa7\xa8\xa9�\xab\xac\xad\xae―\xb0\xb1\xb2\xb3΄\xb5\xb6\xb7ΈΉΊ\xbbΌ\xbdΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ�ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ�",
        },
        win1253: "windows1253",
        cp1253: "windows1253",
        windows1254: {
          type: "_sbcs",
          chars:
            "€�‚ƒ„…†‡ˆ‰Š‹Œ����‘’“”•–—˜™š›œ��Ÿ\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcfĞ\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdcİŞ\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xefğ\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfcış\xff",
        },
        win1254: "windows1254",
        cp1254: "windows1254",
        windows1255: {
          type: "_sbcs",
          chars:
            "€�‚ƒ„…†‡ˆ‰�‹�����‘’“”•–—˜™�›����\xa0\xa1\xa2\xa3₪\xa5\xa6\xa7\xa8\xa9\xd7\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xf7\xbb\xbc\xbd\xbe\xbfְֱֲֳִֵֶַָֹֺֻּֽ־ֿ׀ׁׂ׃װױײ׳״�������אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�",
        },
        win1255: "windows1255",
        cp1255: "windows1255",
        windows1256: {
          type: "_sbcs",
          chars:
            "€پ‚ƒ„…†‡ˆ‰ٹ‹Œچژڈگ‘’“”•–—ک™ڑ›œ‌‍ں\xa0،\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9ھ\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9؛\xbb\xbc\xbd\xbe؟ہءآأؤإئابةتثجحخدذرزسشصض\xd7طظعغـفقك\xe0ل\xe2منهو\xe7\xe8\xe9\xea\xebىي\xee\xefًٌٍَ\xf4ُِ\xf7ّ\xf9ْ\xfb\xfc‎‏ے",
        },
        win1256: "windows1256",
        cp1256: "windows1256",
        windows1257: {
          type: "_sbcs",
          chars:
            "€�‚�„…†‡�‰�‹�\xa8ˇ\xb8�‘’“”•–—�™�›�\xaf˛�\xa0�\xa2\xa3\xa4�\xa6\xa7\xd8\xa9Ŗ\xab\xac\xad\xae\xc6\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xf8\xb9ŗ\xbb\xbc\xbd\xbe\xe6ĄĮĀĆ\xc4\xc5ĘĒČ\xc9ŹĖĢĶĪĻŠŃŅ\xd3Ō\xd5\xd6\xd7ŲŁŚŪ\xdcŻŽ\xdfąįāć\xe4\xe5ęēč\xe9źėģķīļšńņ\xf3ō\xf5\xf6\xf7ųłśū\xfcżž˙",
        },
        win1257: "windows1257",
        cp1257: "windows1257",
        windows1258: {
          type: "_sbcs",
          chars:
            "€�‚ƒ„…†‡ˆ‰�‹Œ����‘’“”•–—˜™�›œ��Ÿ\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2Ă\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb̀\xcd\xce\xcfĐ\xd1̉\xd3\xd4Ơ\xd6\xd7\xd8\xd9\xda\xdb\xdcỮ\xdf\xe0\xe1\xe2ă\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb́\xed\xee\xefđ\xf1̣\xf3\xf4ơ\xf6\xf7\xf8\xf9\xfa\xfb\xfcư₫\xff",
        },
        win1258: "windows1258",
        cp1258: "windows1258",
        iso88591: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
        },
        cp28591: "iso88591",
        iso88592: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0Ą˘Ł\xa4ĽŚ\xa7\xa8ŠŞŤŹ\xadŽŻ\xb0ą˛ł\xb4ľśˇ\xb8šşťź˝žżŔ\xc1\xc2Ă\xc4ĹĆ\xc7Č\xc9Ę\xcbĚ\xcd\xceĎĐŃŇ\xd3\xd4Ő\xd6\xd7ŘŮ\xdaŰ\xdc\xddŢ\xdfŕ\xe1\xe2ă\xe4ĺć\xe7č\xe9ę\xebě\xed\xeeďđńň\xf3\xf4ő\xf6\xf7řů\xfaű\xfc\xfdţ˙",
        },
        cp28592: "iso88592",
        iso88593: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0Ħ˘\xa3\xa4�Ĥ\xa7\xa8İŞĞĴ\xad�Ż\xb0ħ\xb2\xb3\xb4\xb5ĥ\xb7\xb8ışğĵ\xbd�ż\xc0\xc1\xc2�\xc4ĊĈ\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf�\xd1\xd2\xd3\xd4Ġ\xd6\xd7Ĝ\xd9\xda\xdb\xdcŬŜ\xdf\xe0\xe1\xe2�\xe4ċĉ\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef�\xf1\xf2\xf3\xf4ġ\xf6\xf7ĝ\xf9\xfa\xfb\xfcŭŝ˙",
        },
        cp28593: "iso88593",
        iso88594: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0ĄĸŖ\xa4ĨĻ\xa7\xa8ŠĒĢŦ\xadŽ\xaf\xb0ą˛ŗ\xb4ĩļˇ\xb8šēģŧŊžŋĀ\xc1\xc2\xc3\xc4\xc5\xc6ĮČ\xc9Ę\xcbĖ\xcd\xceĪĐŅŌĶ\xd4\xd5\xd6\xd7\xd8Ų\xda\xdb\xdcŨŪ\xdfā\xe1\xe2\xe3\xe4\xe5\xe6įč\xe9ę\xebė\xed\xeeīđņōķ\xf4\xf5\xf6\xf7\xf8ų\xfa\xfb\xfcũū˙",
        },
        cp28594: "iso88594",
        iso88595: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0ЁЂЃЄЅІЇЈЉЊЋЌ\xadЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђѓєѕіїјљњћќ\xa7ўџ",
        },
        cp28595: "iso88595",
        iso88596: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0���\xa4�������،\xad�������������؛���؟�ءآأؤإئابةتثجحخدذرزسشصضطظعغ�����ـفقكلمنهوىيًٌٍَُِّْ�������������",
        },
        cp28596: "iso88596",
        iso88597: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0‘’\xa3€₯\xa6\xa7\xa8\xa9ͺ\xab\xac\xad�―\xb0\xb1\xb2\xb3΄΅Ά\xb7ΈΉΊ\xbbΌ\xbdΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ�ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ�",
        },
        cp28597: "iso88597",
        iso88598: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0�\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xd7\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xf7\xbb\xbc\xbd\xbe��������������������������������‗אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�",
        },
        cp28598: "iso88598",
        iso88599: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcfĞ\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdcİŞ\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xefğ\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfcış\xff",
        },
        cp28599: "iso88599",
        iso885910: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0ĄĒĢĪĨĶ\xa7ĻĐŠŦŽ\xadŪŊ\xb0ąēģīĩķ\xb7ļđšŧž―ūŋĀ\xc1\xc2\xc3\xc4\xc5\xc6ĮČ\xc9Ę\xcbĖ\xcd\xce\xcf\xd0ŅŌ\xd3\xd4\xd5\xd6Ũ\xd8Ų\xda\xdb\xdc\xdd\xde\xdfā\xe1\xe2\xe3\xe4\xe5\xe6įč\xe9ę\xebė\xed\xee\xef\xf0ņō\xf3\xf4\xf5\xf6ũ\xf8ų\xfa\xfb\xfc\xfd\xfeĸ",
        },
        cp28600: "iso885910",
        iso885911: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����",
        },
        cp28601: "iso885911",
        iso885913: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0”\xa2\xa3\xa4„\xa6\xa7\xd8\xa9Ŗ\xab\xac\xad\xae\xc6\xb0\xb1\xb2\xb3“\xb5\xb6\xb7\xf8\xb9ŗ\xbb\xbc\xbd\xbe\xe6ĄĮĀĆ\xc4\xc5ĘĒČ\xc9ŹĖĢĶĪĻŠŃŅ\xd3Ō\xd5\xd6\xd7ŲŁŚŪ\xdcŻŽ\xdfąįāć\xe4\xe5ęēč\xe9źėģķīļšńņ\xf3ō\xf5\xf6\xf7ųłśū\xfcżž’",
        },
        cp28603: "iso885913",
        iso885914: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0Ḃḃ\xa3ĊċḊ\xa7Ẁ\xa9ẂḋỲ\xad\xaeŸḞḟĠġṀṁ\xb6ṖẁṗẃṠỳẄẅṡ\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcfŴ\xd1\xd2\xd3\xd4\xd5\xd6Ṫ\xd8\xd9\xda\xdb\xdc\xddŶ\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xefŵ\xf1\xf2\xf3\xf4\xf5\xf6ṫ\xf8\xf9\xfa\xfb\xfc\xfdŷ\xff",
        },
        cp28604: "iso885914",
        iso885915: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3€\xa5Š\xa7š\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3Ž\xb5\xb6\xb7ž\xb9\xba\xbbŒœŸ\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
        },
        cp28605: "iso885915",
        iso885916: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0ĄąŁ€„Š\xa7š\xa9Ș\xabŹ\xadźŻ\xb0\xb1ČłŽ”\xb6\xb7žčș\xbbŒœŸż\xc0\xc1\xc2Ă\xc4Ć\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcfĐŃ\xd2\xd3\xd4Ő\xd6ŚŰ\xd9\xda\xdb\xdcĘȚ\xdf\xe0\xe1\xe2ă\xe4ć\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xefđń\xf2\xf3\xf4ő\xf6śű\xf9\xfa\xfb\xfcęț\xff",
        },
        cp28606: "iso885916",
        cp437: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe4\xe0\xe5\xe7\xea\xeb\xe8\xef\xee\xec\xc4\xc5\xc9\xe6\xc6\xf4\xf6\xf2\xfb\xf9\xff\xd6\xdc\xa2\xa3\xa5₧ƒ\xe1\xed\xf3\xfa\xf1\xd1\xaa\xba\xbf⌐\xac\xbd\xbc\xa1\xab\xbb░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀α\xdfΓπΣσ\xb5τΦΘΩδ∞φε∩≡\xb1≥≤⌠⌡\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ibm437: "cp437",
        csibm437: "cp437",
        cp737: {
          type: "_sbcs",
          chars:
            "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρσςτυφχψ░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀ωάέήϊίόύϋώΆΈΉΊΌΎΏ\xb1≥≤ΪΫ\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ibm737: "cp737",
        csibm737: "cp737",
        cp775: {
          type: "_sbcs",
          chars:
            "Ć\xfc\xe9ā\xe4ģ\xe5ćłēŖŗīŹ\xc4\xc5\xc9\xe6\xc6ō\xf6Ģ\xa2Śś\xd6\xdc\xf8\xa3\xd8\xd7\xa4ĀĪ\xf3Żżź”\xa6\xa9\xae\xac\xbd\xbcŁ\xab\xbb░▒▓│┤ĄČĘĖ╣║╗╝ĮŠ┐└┴┬├─┼ŲŪ╚╔╩╦╠═╬Žąčęėįšųūž┘┌█▄▌▐▀\xd3\xdfŌŃ\xf5\xd5\xb5ńĶķĻļņĒŅ’\xad\xb1“\xbe\xb6\xa7\xf7„\xb0∙\xb7\xb9\xb3\xb2■\xa0",
        },
        ibm775: "cp775",
        csibm775: "cp775",
        cp850: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe4\xe0\xe5\xe7\xea\xeb\xe8\xef\xee\xec\xc4\xc5\xc9\xe6\xc6\xf4\xf6\xf2\xfb\xf9\xff\xd6\xdc\xf8\xa3\xd8\xd7ƒ\xe1\xed\xf3\xfa\xf1\xd1\xaa\xba\xbf\xae\xac\xbd\xbc\xa1\xab\xbb░▒▓│┤\xc1\xc2\xc0\xa9╣║╗╝\xa2\xa5┐└┴┬├─┼\xe3\xc3╚╔╩╦╠═╬\xa4\xf0\xd0\xca\xcb\xc8ı\xcd\xce\xcf┘┌█▄\xa6\xcc▀\xd3\xdf\xd4\xd2\xf5\xd5\xb5\xfe\xde\xda\xdb\xd9\xfd\xdd\xaf\xb4\xad\xb1‗\xbe\xb6\xa7\xf7\xb8\xb0\xa8\xb7\xb9\xb3\xb2■\xa0",
        },
        ibm850: "cp850",
        csibm850: "cp850",
        cp852: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe4ůć\xe7ł\xebŐő\xeeŹ\xc4Ć\xc9Ĺĺ\xf4\xf6ĽľŚś\xd6\xdcŤťŁ\xd7č\xe1\xed\xf3\xfaĄąŽžĘę\xacźČş\xab\xbb░▒▓│┤\xc1\xc2ĚŞ╣║╗╝Żż┐└┴┬├─┼Ăă╚╔╩╦╠═╬\xa4đĐĎ\xcbďŇ\xcd\xceě┘┌█▄ŢŮ▀\xd3\xdf\xd4ŃńňŠšŔ\xdaŕŰ\xfd\xddţ\xb4\xad˝˛ˇ˘\xa7\xf7\xb8\xb0\xa8˙űŘř■\xa0",
        },
        ibm852: "cp852",
        csibm852: "cp852",
        cp855: {
          type: "_sbcs",
          chars:
            "ђЂѓЃёЁєЄѕЅіІїЇјЈљЉњЊћЋќЌўЎџЏюЮъЪаАбБцЦдДеЕфФгГ\xab\xbb░▒▓│┤хХиИ╣║╗╝йЙ┐└┴┬├─┼кК╚╔╩╦╠═╬\xa4лЛмМнНоОп┘┌█▄Пя▀ЯрРсСтТуУжЖвВьЬ№\xadыЫзЗшШэЭщЩчЧ\xa7■\xa0",
        },
        ibm855: "cp855",
        csibm855: "cp855",
        cp856: {
          type: "_sbcs",
          chars:
            "אבגדהוזחטיךכלםמןנסעףפץצקרשת�\xa3�\xd7����������\xae\xac\xbd\xbc�\xab\xbb░▒▓│┤���\xa9╣║╗╝\xa2\xa5┐└┴┬├─┼��╚╔╩╦╠═╬\xa4���������┘┌█▄\xa6�▀������\xb5�������\xaf\xb4\xad\xb1‗\xbe\xb6\xa7\xf7\xb8\xb0\xa8\xb7\xb9\xb3\xb2■\xa0",
        },
        ibm856: "cp856",
        csibm856: "cp856",
        cp857: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe4\xe0\xe5\xe7\xea\xeb\xe8\xef\xeeı\xc4\xc5\xc9\xe6\xc6\xf4\xf6\xf2\xfb\xf9İ\xd6\xdc\xf8\xa3\xd8Şş\xe1\xed\xf3\xfa\xf1\xd1Ğğ\xbf\xae\xac\xbd\xbc\xa1\xab\xbb░▒▓│┤\xc1\xc2\xc0\xa9╣║╗╝\xa2\xa5┐└┴┬├─┼\xe3\xc3╚╔╩╦╠═╬\xa4\xba\xaa\xca\xcb\xc8�\xcd\xce\xcf┘┌█▄\xa6\xcc▀\xd3\xdf\xd4\xd2\xf5\xd5\xb5�\xd7\xda\xdb\xd9\xec\xff\xaf\xb4\xad\xb1�\xbe\xb6\xa7\xf7\xb8\xb0\xa8\xb7\xb9\xb3\xb2■\xa0",
        },
        ibm857: "cp857",
        csibm857: "cp857",
        cp858: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe4\xe0\xe5\xe7\xea\xeb\xe8\xef\xee\xec\xc4\xc5\xc9\xe6\xc6\xf4\xf6\xf2\xfb\xf9\xff\xd6\xdc\xf8\xa3\xd8\xd7ƒ\xe1\xed\xf3\xfa\xf1\xd1\xaa\xba\xbf\xae\xac\xbd\xbc\xa1\xab\xbb░▒▓│┤\xc1\xc2\xc0\xa9╣║╗╝\xa2\xa5┐└┴┬├─┼\xe3\xc3╚╔╩╦╠═╬\xa4\xf0\xd0\xca\xcb\xc8€\xcd\xce\xcf┘┌█▄\xa6\xcc▀\xd3\xdf\xd4\xd2\xf5\xd5\xb5\xfe\xde\xda\xdb\xd9\xfd\xdd\xaf\xb4\xad\xb1‗\xbe\xb6\xa7\xf7\xb8\xb0\xa8\xb7\xb9\xb3\xb2■\xa0",
        },
        ibm858: "cp858",
        csibm858: "cp858",
        cp860: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe3\xe0\xc1\xe7\xea\xca\xe8\xcd\xd4\xec\xc3\xc2\xc9\xc0\xc8\xf4\xf5\xf2\xda\xf9\xcc\xd5\xdc\xa2\xa3\xd9₧\xd3\xe1\xed\xf3\xfa\xf1\xd1\xaa\xba\xbf\xd2\xac\xbd\xbc\xa1\xab\xbb░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀α\xdfΓπΣσ\xb5τΦΘΩδ∞φε∩≡\xb1≥≤⌠⌡\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ibm860: "cp860",
        csibm860: "cp860",
        cp861: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe4\xe0\xe5\xe7\xea\xeb\xe8\xd0\xf0\xde\xc4\xc5\xc9\xe6\xc6\xf4\xf6\xfe\xfb\xdd\xfd\xd6\xdc\xf8\xa3\xd8₧ƒ\xe1\xed\xf3\xfa\xc1\xcd\xd3\xda\xbf⌐\xac\xbd\xbc\xa1\xab\xbb░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀α\xdfΓπΣσ\xb5τΦΘΩδ∞φε∩≡\xb1≥≤⌠⌡\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ibm861: "cp861",
        csibm861: "cp861",
        cp862: {
          type: "_sbcs",
          chars:
            "אבגדהוזחטיךכלםמןנסעףפץצקרשת\xa2\xa3\xa5₧ƒ\xe1\xed\xf3\xfa\xf1\xd1\xaa\xba\xbf⌐\xac\xbd\xbc\xa1\xab\xbb░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀α\xdfΓπΣσ\xb5τΦΘΩδ∞φε∩≡\xb1≥≤⌠⌡\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ibm862: "cp862",
        csibm862: "cp862",
        cp863: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xc2\xe0\xb6\xe7\xea\xeb\xe8\xef\xee‗\xc0\xa7\xc9\xc8\xca\xf4\xcb\xcf\xfb\xf9\xa4\xd4\xdc\xa2\xa3\xd9\xdbƒ\xa6\xb4\xf3\xfa\xa8\xb8\xb3\xaf\xce⌐\xac\xbd\xbc\xbe\xab\xbb░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀α\xdfΓπΣσ\xb5τΦΘΩδ∞φε∩≡\xb1≥≤⌠⌡\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ibm863: "cp863",
        csibm863: "cp863",
        cp864: {
          type: "_sbcs",
          chars:
            "\0\x01\x02\x03\x04\x05\x06\x07\b	\n\v\f\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !\"#$٪&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f\xb0\xb7∙√▒─│┼┤┬├┴┐┌└┘β∞φ\xb1\xbd\xbc≈\xab\xbbﻷﻸ��ﻻﻼ�\xa0\xadﺂ\xa3\xa4ﺄ��ﺎﺏﺕﺙ،ﺝﺡﺥ٠١٢٣٤٥٦٧٨٩ﻑ؛ﺱﺵﺹ؟\xa2ﺀﺁﺃﺅﻊﺋﺍﺑﺓﺗﺛﺟﺣﺧﺩﺫﺭﺯﺳﺷﺻﺿﻁﻅﻋﻏ\xa6\xac\xf7\xd7ﻉـﻓﻗﻛﻟﻣﻧﻫﻭﻯﻳﺽﻌﻎﻍﻡﹽّﻥﻩﻬﻰﻲﻐﻕﻵﻶﻝﻙﻱ■�",
        },
        ibm864: "cp864",
        csibm864: "cp864",
        cp865: {
          type: "_sbcs",
          chars:
            "\xc7\xfc\xe9\xe2\xe4\xe0\xe5\xe7\xea\xeb\xe8\xef\xee\xec\xc4\xc5\xc9\xe6\xc6\xf4\xf6\xf2\xfb\xf9\xff\xd6\xdc\xf8\xa3\xd8₧ƒ\xe1\xed\xf3\xfa\xf1\xd1\xaa\xba\xbf⌐\xac\xbd\xbc\xa1\xab\xa4░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀α\xdfΓπΣσ\xb5τΦΘΩδ∞φε∩≡\xb1≥≤⌠⌡\xf7≈\xb0∙\xb7√ⁿ\xb2■\xa0",
        },
        ibm865: "cp865",
        csibm865: "cp865",
        cp866: {
          type: "_sbcs",
          chars:
            "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў\xb0∙\xb7√№\xa4■\xa0",
        },
        ibm866: "cp866",
        csibm866: "cp866",
        cp869: {
          type: "_sbcs",
          chars:
            "������Ά�\xb7\xac\xa6‘’Έ―ΉΊΪΌ��ΎΫ\xa9Ώ\xb2\xb3ά\xa3έήίϊΐόύΑΒΓΔΕΖΗ\xbdΘΙ\xab\xbb░▒▓│┤ΚΛΜΝ╣║╗╝ΞΟ┐└┴┬├─┼ΠΡ╚╔╩╦╠═╬ΣΤΥΦΧΨΩαβγ┘┌█▄δε▀ζηθικλμνξοπρσςτ΄\xad\xb1υφχ\xa7ψ΅\xb0\xa8ωϋΰώ■\xa0",
        },
        ibm869: "cp869",
        csibm869: "cp869",
        cp922: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae‾\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcfŠ\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xddŽ\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xefš\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfdž\xff",
        },
        ibm922: "cp922",
        csibm922: "cp922",
        cp1046: {
          type: "_sbcs",
          chars:
            "ﺈ\xd7\xf7ﹱ\x88■│─┐┌└┘ﹹﹻﹽﹿﹷﺊﻰﻳﻲﻎﻏﻐﻶﻸﻺﻼ\xa0\xa4ﺋﺑﺗﺛﺟﺣ،\xadﺧﺳ٠١٢٣٤٥٦٧٨٩ﺷ؛ﺻﺿﻊ؟ﻋءآأؤإئابةتثجحخدذرزسشصضطﻇعغﻌﺂﺄﺎﻓـفقكلمنهوىيًٌٍَُِّْﻗﻛﻟﻵﻷﻹﻻﻣﻧﻬﻩ�",
        },
        ibm1046: "cp1046",
        csibm1046: "cp1046",
        cp1124: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0ЁЂҐЄЅІЇЈЉЊЋЌ\xadЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђґєѕіїјљњћќ\xa7ўџ",
        },
        ibm1124: "cp1124",
        csibm1124: "cp1124",
        cp1125: {
          type: "_sbcs",
          chars:
            "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёҐґЄєІіЇї\xb7√№\xa4■\xa0",
        },
        ibm1125: "cp1125",
        csibm1125: "cp1125",
        cp1129: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7œ\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3Ÿ\xb5\xb6\xb7Œ\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2Ă\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb̀\xcd\xce\xcfĐ\xd1̉\xd3\xd4Ơ\xd6\xd7\xd8\xd9\xda\xdb\xdcỮ\xdf\xe0\xe1\xe2ă\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb́\xed\xee\xefđ\xf1̣\xf3\xf4ơ\xf6\xf7\xf8\xf9\xfa\xfb\xfcư₫\xff",
        },
        ibm1129: "cp1129",
        csibm1129: "cp1129",
        cp1133: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮ���ຯະາຳິີຶືຸູຼັົຽ���ເແໂໃໄ່້໊໋໌ໍໆ�ໜໝ₭����������������໐໑໒໓໔໕໖໗໘໙��\xa2\xac\xa6�",
        },
        ibm1133: "cp1133",
        csibm1133: "cp1133",
        cp1161: {
          type: "_sbcs",
          chars:
            "��������������������������������่กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู้๊๋€฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛\xa2\xac\xa6\xa0",
        },
        ibm1161: "cp1161",
        csibm1161: "cp1161",
        cp1162: {
          type: "_sbcs",
          chars:
            "€\x81\x82\x83\x84…\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90‘’“”•–—\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����",
        },
        ibm1162: "cp1162",
        csibm1162: "cp1162",
        cp1163: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3€\xa5\xa6\xa7œ\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3Ÿ\xb5\xb6\xb7Œ\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2Ă\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb̀\xcd\xce\xcfĐ\xd1̉\xd3\xd4Ơ\xd6\xd7\xd8\xd9\xda\xdb\xdcỮ\xdf\xe0\xe1\xe2ă\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb́\xed\xee\xefđ\xf1̣\xf3\xf4ơ\xf6\xf7\xf8\xf9\xfa\xfb\xfcư₫\xff",
        },
        ibm1163: "cp1163",
        csibm1163: "cp1163",
        maccroatian: {
          type: "_sbcs",
          chars:
            "\xc4\xc5\xc7\xc9\xd1\xd6\xdc\xe1\xe0\xe2\xe4\xe3\xe5\xe7\xe9\xe8\xea\xeb\xed\xec\xee\xef\xf1\xf3\xf2\xf4\xf6\xf5\xfa\xf9\xfb\xfc†\xb0\xa2\xa3\xa7•\xb6\xdf\xaeŠ™\xb4\xa8≠Ž\xd8∞\xb1≤≥∆\xb5∂∑∏š∫\xaa\xbaΩž\xf8\xbf\xa1\xac√ƒ≈Ć\xabČ…\xa0\xc0\xc3\xd5ŒœĐ—“”‘’\xf7◊�\xa9⁄\xa4‹›\xc6\xbb–\xb7‚„‰\xc2ć\xc1č\xc8\xcd\xce\xcf\xcc\xd3\xd4đ\xd2\xda\xdb\xd9ıˆ˜\xafπ\xcb˚\xb8\xca\xe6ˇ",
        },
        maccyrillic: {
          type: "_sbcs",
          chars:
            "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†\xb0\xa2\xa3\xa7•\xb6І\xae\xa9™Ђђ≠Ѓѓ∞\xb1≤≥і\xb5∂ЈЄєЇїЉљЊњјЅ\xac√ƒ≈∆\xab\xbb…\xa0ЋћЌќѕ–—“”‘’\xf7„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю\xa4",
        },
        macgreek: {
          type: "_sbcs",
          chars:
            "\xc4\xb9\xb2\xc9\xb3\xd6\xdc΅\xe0\xe2\xe4΄\xa8\xe7\xe9\xe8\xea\xeb\xa3™\xee\xef•\xbd‰\xf4\xf6\xa6\xad\xf9\xfb\xfc†ΓΔΘΛΞΠ\xdf\xae\xa9ΣΪ\xa7≠\xb0·Α\xb1≤≥\xa5ΒΕΖΗΙΚΜΦΫΨΩάΝ\xacΟΡ≈Τ\xab\xbb…\xa0ΥΧΆΈœ–―“”‘’\xf7ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ�",
        },
        maciceland: {
          type: "_sbcs",
          chars:
            "\xc4\xc5\xc7\xc9\xd1\xd6\xdc\xe1\xe0\xe2\xe4\xe3\xe5\xe7\xe9\xe8\xea\xeb\xed\xec\xee\xef\xf1\xf3\xf2\xf4\xf6\xf5\xfa\xf9\xfb\xfc\xdd\xb0\xa2\xa3\xa7•\xb6\xdf\xae\xa9™\xb4\xa8≠\xc6\xd8∞\xb1≤≥\xa5\xb5∂∑∏π∫\xaa\xbaΩ\xe6\xf8\xbf\xa1\xac√ƒ≈∆\xab\xbb…\xa0\xc0\xc3\xd5Œœ–—“”‘’\xf7◊\xffŸ⁄\xa4\xd0\xf0\xde\xfe\xfd\xb7‚„‰\xc2\xca\xc1\xcb\xc8\xcd\xce\xcf\xcc\xd3\xd4�\xd2\xda\xdb\xd9ıˆ˜\xaf˘˙˚\xb8˝˛ˇ",
        },
        macroman: {
          type: "_sbcs",
          chars:
            "\xc4\xc5\xc7\xc9\xd1\xd6\xdc\xe1\xe0\xe2\xe4\xe3\xe5\xe7\xe9\xe8\xea\xeb\xed\xec\xee\xef\xf1\xf3\xf2\xf4\xf6\xf5\xfa\xf9\xfb\xfc†\xb0\xa2\xa3\xa7•\xb6\xdf\xae\xa9™\xb4\xa8≠\xc6\xd8∞\xb1≤≥\xa5\xb5∂∑∏π∫\xaa\xbaΩ\xe6\xf8\xbf\xa1\xac√ƒ≈∆\xab\xbb…\xa0\xc0\xc3\xd5Œœ–—“”‘’\xf7◊\xffŸ⁄\xa4‹›ﬁﬂ‡\xb7‚„‰\xc2\xca\xc1\xcb\xc8\xcd\xce\xcf\xcc\xd3\xd4�\xd2\xda\xdb\xd9ıˆ˜\xaf˘˙˚\xb8˝˛ˇ",
        },
        macromania: {
          type: "_sbcs",
          chars:
            "\xc4\xc5\xc7\xc9\xd1\xd6\xdc\xe1\xe0\xe2\xe4\xe3\xe5\xe7\xe9\xe8\xea\xeb\xed\xec\xee\xef\xf1\xf3\xf2\xf4\xf6\xf5\xfa\xf9\xfb\xfc†\xb0\xa2\xa3\xa7•\xb6\xdf\xae\xa9™\xb4\xa8≠ĂŞ∞\xb1≤≥\xa5\xb5∂∑∏π∫\xaa\xbaΩăş\xbf\xa1\xac√ƒ≈∆\xab\xbb…\xa0\xc0\xc3\xd5Œœ–—“”‘’\xf7◊\xffŸ⁄\xa4‹›Ţţ‡\xb7‚„‰\xc2\xca\xc1\xcb\xc8\xcd\xce\xcf\xcc\xd3\xd4�\xd2\xda\xdb\xd9ıˆ˜\xaf˘˙˚\xb8˝˛ˇ",
        },
        macthai: {
          type: "_sbcs",
          chars:
            "\xab\xbb…“”�•‘’�\xa0กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู\uFEFF​–—฿เแโใไๅๆ็่้๊๋์ํ™๏๐๑๒๓๔๕๖๗๘๙\xae\xa9����",
        },
        macturkish: {
          type: "_sbcs",
          chars:
            "\xc4\xc5\xc7\xc9\xd1\xd6\xdc\xe1\xe0\xe2\xe4\xe3\xe5\xe7\xe9\xe8\xea\xeb\xed\xec\xee\xef\xf1\xf3\xf2\xf4\xf6\xf5\xfa\xf9\xfb\xfc†\xb0\xa2\xa3\xa7•\xb6\xdf\xae\xa9™\xb4\xa8≠\xc6\xd8∞\xb1≤≥\xa5\xb5∂∑∏π∫\xaa\xbaΩ\xe6\xf8\xbf\xa1\xac√ƒ≈∆\xab\xbb…\xa0\xc0\xc3\xd5Œœ–—“”‘’\xf7◊\xffŸĞğİıŞş‡\xb7‚„‰\xc2\xca\xc1\xcb\xc8\xcd\xce\xcf\xcc\xd3\xd4�\xd2\xda\xdb\xd9�ˆ˜\xaf˘˙˚\xb8˝˛ˇ",
        },
        macukraine: {
          type: "_sbcs",
          chars:
            "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†\xb0Ґ\xa3\xa7•\xb6І\xae\xa9™Ђђ≠Ѓѓ∞\xb1≤≥і\xb5ґЈЄєЇїЉљЊњјЅ\xac√ƒ≈∆\xab\xbb…\xa0ЋћЌќѕ–—“”‘’\xf7„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю\xa4",
        },
        koi8r: {
          type: "_sbcs",
          chars:
            "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥\xa0⌡\xb0\xb2\xb7\xf7═║╒ё╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡Ё╢╣╤╥╦╧╨╩╪╫╬\xa9юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ",
        },
        koi8u: {
          type: "_sbcs",
          chars:
            "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥\xa0⌡\xb0\xb2\xb7\xf7═║╒ёє╔ії╗╘╙╚╛ґ╝╞╟╠╡ЁЄ╣ІЇ╦╧╨╩╪Ґ╬\xa9юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ",
        },
        koi8ru: {
          type: "_sbcs",
          chars:
            "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥\xa0⌡\xb0\xb2\xb7\xf7═║╒ёє╔ії╗╘╙╚╛ґў╞╟╠╡ЁЄ╣ІЇ╦╧╨╩╪ҐЎ\xa9юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ",
        },
        koi8t: {
          type: "_sbcs",
          chars:
            "қғ‚Ғ„…†‡�‰ҳ‹ҲҷҶ�Қ‘’“”•–—�™�›�����ӯӮё\xa4ӣ\xa6\xa7���\xab\xac\xad\xae�\xb0\xb1\xb2Ё�Ӣ\xb6\xb7�№�\xbb���\xa9юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ",
        },
        armscii8: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0�և։)(\xbb\xab—.՝,-֊…՜՛՞ԱաԲբԳգԴդԵեԶզԷէԸըԹթԺժԻիԼլԽխԾծԿկՀհՁձՂղՃճՄմՅյՆնՇշՈոՉչՊպՋջՌռՍսՎվՏտՐրՑցՒւՓփՔքՕօՖֆ՚�",
        },
        rk1048: {
          type: "_sbcs",
          chars:
            "ЂЃ‚ѓ„…†‡€‰Љ‹ЊҚҺЏђ‘’“”•–—�™љ›њқһџ\xa0ҰұӘ\xa4Ө\xa6\xa7Ё\xa9Ғ\xab\xac\xad\xaeҮ\xb0\xb1Ііө\xb5\xb6\xb7ё№ғ\xbbәҢңүАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя",
        },
        tcvn: {
          type: "_sbcs",
          chars:
            "\0\xdaỤ\x03ỪỬỮ\x07\b	\n\v\f\r\x0e\x0f\x10ỨỰỲỶỸ\xddỴ\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f\xc0Ả\xc3\xc1ẠẶẬ\xc8ẺẼ\xc9ẸỆ\xccỈĨ\xcdỊ\xd2Ỏ\xd5\xd3ỌỘỜỞỠỚỢ\xd9ỦŨ\xa0Ă\xc2\xca\xd4ƠƯĐă\xe2\xea\xf4ơưđẶ̀̀̉̃́\xe0ả\xe3\xe1ạẲằẳẵắẴẮẦẨẪẤỀặầẩẫấậ\xe8Ểẻẽ\xe9ẹềểễếệ\xecỉỄẾỒĩ\xedị\xf2Ổỏ\xf5\xf3ọồổỗốộờởỡớợ\xf9Ỗủũ\xfaụừửữứựỳỷỹ\xfdỵỐ",
        },
        georgianacademy: {
          type: "_sbcs",
          chars:
            "\x80\x81‚ƒ„…†‡ˆ‰Š‹Œ\x8d\x8e\x8f\x90‘’“”•–—˜™š›œ\x9d\x9eŸ\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbfაბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰჱჲჳჴჵჶ\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
        },
        georgianps: {
          type: "_sbcs",
          chars:
            "\x80\x81‚ƒ„…†‡ˆ‰Š‹Œ\x8d\x8e\x8f\x90‘’“”•–—˜™š›œ\x9d\x9eŸ\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbfაბგდევზჱთიკლმნჲოპჟრსტჳუფქღყშჩცძწჭხჴჯჰჵ\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
        },
        pt154: {
          type: "_sbcs",
          chars:
            "ҖҒӮғ„…ҶҮҲүҠӢҢҚҺҸҗ‘’“”•–—ҳҷҡӣңқһҹ\xa0ЎўЈӨҘҰ\xa7Ё\xa9Ә\xab\xacӯ\xaeҜ\xb0ұІіҙө\xb6\xb7ё№ә\xbbјҪҫҝАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя",
        },
        viscii: {
          type: "_sbcs",
          chars:
            "\0\x01Ẳ\x03\x04ẴẪ\x07\b	\n\v\f\r\x0e\x0f\x10\x11\x12\x13Ỷ\x15\x16\x17\x18Ỹ\x1a\x1b\x1c\x1dỴ\x1f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7fẠẮẰẶẤẦẨẬẼẸẾỀỂỄỆỐỒỔỖỘỢỚỜỞỊỎỌỈỦŨỤỲ\xd5ắằặấầẩậẽẹếềểễệốồổỗỠƠộờởịỰỨỪỬơớƯ\xc0\xc1\xc2\xc3ẢĂẳẵ\xc8\xc9\xcaẺ\xcc\xcdĨỳĐứ\xd2\xd3\xd4ạỷừử\xd9\xdaỹỵ\xddỡư\xe0\xe1\xe2\xe3ảăữẫ\xe8\xe9\xeaẻ\xec\xedĩỉđự\xf2\xf3\xf4\xf5ỏọụ\xf9\xfaũủ\xfdợỮ",
        },
        iso646cn: {
          type: "_sbcs",
          chars:
            "\0\x01\x02\x03\x04\x05\x06\x07\b	\n\v\f\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !\"#\xa5%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}‾\x7f��������������������������������������������������������������������������������������������������������������������������������",
        },
        iso646jp: {
          type: "_sbcs",
          chars:
            "\0\x01\x02\x03\x04\x05\x06\x07\b	\n\v\f\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\xa5]^_`abcdefghijklmnopqrstuvwxyz{|}‾\x7f��������������������������������������������������������������������������������������������������������������������������������",
        },
        hproman8: {
          type: "_sbcs",
          chars:
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xc0\xc2\xc8\xca\xcb\xce\xcf\xb4ˋˆ\xa8˜\xd9\xdb₤\xaf\xdd\xfd\xb0\xc7\xe7\xd1\xf1\xa1\xbf\xa4\xa3\xa5\xa7ƒ\xa2\xe2\xea\xf4\xfb\xe1\xe9\xf3\xfa\xe0\xe8\xf2\xf9\xe4\xeb\xf6\xfc\xc5\xee\xd8\xc6\xe5\xed\xf8\xe6\xc4\xec\xd6\xdc\xc9\xef\xdf\xd4\xc1\xc3\xe3\xd0\xf0\xcd\xcc\xd3\xd2\xd5\xf5Šš\xdaŸ\xff\xde\xfe\xb7\xb5\xb6\xbe—\xbc\xbd\xaa\xba\xab■\xbb\xb1�",
        },
        macintosh: {
          type: "_sbcs",
          chars:
            "\xc4\xc5\xc7\xc9\xd1\xd6\xdc\xe1\xe0\xe2\xe4\xe3\xe5\xe7\xe9\xe8\xea\xeb\xed\xec\xee\xef\xf1\xf3\xf2\xf4\xf6\xf5\xfa\xf9\xfb\xfc†\xb0\xa2\xa3\xa7•\xb6\xdf\xae\xa9™\xb4\xa8≠\xc6\xd8∞\xb1≤≥\xa5\xb5∂∑∏π∫\xaa\xbaΩ\xe6\xf8\xbf\xa1\xac√ƒ≈∆\xab\xbb…\xa0\xc0\xc3\xd5Œœ–—“”‘’\xf7◊\xffŸ⁄\xa4‹›ﬁﬂ‡\xb7‚„‰\xc2\xca\xc1\xcb\xc8\xcd\xce\xcf\xcc\xd3\xd4�\xd2\xda\xdb\xd9ıˆ˜\xaf˘˙˚\xb8˝˛ˇ",
        },
        ascii: {
          type: "_sbcs",
          chars:
            "��������������������������������������������������������������������������������������������������������������������������������",
        },
        tis620: {
          type: "_sbcs",
          chars:
            "���������������������������������กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����",
        },
      };
    },
    31132(eA, el, ec) {
      "use strict";
      var eu = ec(19845).Buffer;
      el._dbcs = DBCSCodec;
      for (
        var ed = -1,
          ep = -2,
          eg = -10,
          eh = -1e3,
          ef = Array(256),
          em = -1,
          eE = 0;
        eE < 256;
        eE++
      )
        ef[eE] = ed;
      function DBCSCodec(eA, el) {
        if (((this.encodingName = eA.encodingName), !eA))
          throw Error("DBCS codec is called without the data.");
        if (!eA.table)
          throw Error("Encoding '" + this.encodingName + "' has no data.");
        var ec = eA.table();
        ((this.decodeTables = []),
          (this.decodeTables[0] = ef.slice(0)),
          (this.decodeTableSeq = []));
        for (var eu = 0; eu < ec.length; eu++) this._addDecodeChunk(ec[eu]);
        if ("function" == typeof eA.gb18030) {
          this.gb18030 = eA.gb18030();
          var eg = this.decodeTables.length;
          this.decodeTables.push(ef.slice(0));
          var em = this.decodeTables.length;
          this.decodeTables.push(ef.slice(0));
          for (var eE = this.decodeTables[0], eu = 129; eu <= 254; eu++)
            for (
              var eC = this.decodeTables[eh - eE[eu]], ey = 48;
              ey <= 57;
              ey++
            ) {
              if (eC[ey] === ed) eC[ey] = eh - eg;
              else if (eC[ey] > eh)
                throw Error("gb18030 decode tables conflict at byte 2");
              for (
                var ew = this.decodeTables[eh - eC[ey]], eB = 129;
                eB <= 254;
                eB++
              ) {
                if (ew[eB] === ed) ew[eB] = eh - em;
                else if (ew[eB] === eh - em) continue;
                else if (ew[eB] > eh)
                  throw Error("gb18030 decode tables conflict at byte 3");
                for (
                  var e_ = this.decodeTables[eh - ew[eB]], eI = 48;
                  eI <= 57;
                  eI++
                )
                  e_[eI] === ed && (e_[eI] = ep);
              }
            }
        }
        ((this.defaultCharUnicode = el.defaultCharUnicode),
          (this.encodeTable = []),
          (this.encodeTableSeq = []));
        var ev = {};
        if (eA.encodeSkipVals)
          for (var eu = 0; eu < eA.encodeSkipVals.length; eu++) {
            var eS = eA.encodeSkipVals[eu];
            if ("number" == typeof eS) ev[eS] = !0;
            else for (var ey = eS.from; ey <= eS.to; ey++) ev[ey] = !0;
          }
        if ((this._fillEncodeTable(0, 0, ev), eA.encodeAdd))
          for (var eQ in eA.encodeAdd)
            Object.prototype.hasOwnProperty.call(eA.encodeAdd, eQ) &&
              this._setEncodeChar(eQ.charCodeAt(0), eA.encodeAdd[eQ]);
        ((this.defCharSB =
          this.encodeTable[0][el.defaultCharSingleByte.charCodeAt(0)]),
          this.defCharSB === ed && (this.defCharSB = this.encodeTable[0]["?"]),
          this.defCharSB === ed && (this.defCharSB = 63));
      }
      function DBCSEncoder(eA, el) {
        ((this.leadSurrogate = -1),
          (this.seqObj = void 0),
          (this.encodeTable = el.encodeTable),
          (this.encodeTableSeq = el.encodeTableSeq),
          (this.defaultCharSingleByte = el.defCharSB),
          (this.gb18030 = el.gb18030));
      }
      function DBCSDecoder(eA, el) {
        ((this.nodeIdx = 0),
          (this.prevBytes = []),
          (this.decodeTables = el.decodeTables),
          (this.decodeTableSeq = el.decodeTableSeq),
          (this.defaultCharUnicode = el.defaultCharUnicode),
          (this.gb18030 = el.gb18030));
      }
      function findIdx(eA, el) {
        if (eA[0] > el) return -1;
        for (var ec = 0, eu = eA.length; ec < eu - 1; ) {
          var ed = ec + ((eu - ec + 1) >> 1);
          eA[ed] <= el ? (ec = ed) : (eu = ed);
        }
        return ec;
      }
      ((DBCSCodec.prototype.encoder = DBCSEncoder),
        (DBCSCodec.prototype.decoder = DBCSDecoder),
        (DBCSCodec.prototype._getDecodeTrieNode = function (eA) {
          for (var el = []; eA > 0; eA >>>= 8) el.push(255 & eA);
          0 == el.length && el.push(0);
          for (
            var ec = this.decodeTables[0], eu = el.length - 1;
            eu > 0;
            eu--
          ) {
            var ep = ec[el[eu]];
            if (ep == ed)
              ((ec[el[eu]] = eh - this.decodeTables.length),
                this.decodeTables.push((ec = ef.slice(0))));
            else if (ep <= eh) ec = this.decodeTables[eh - ep];
            else
              throw Error(
                "Overwrite byte in " +
                  this.encodingName +
                  ", addr: " +
                  eA.toString(16),
              );
          }
          return ec;
        }),
        (DBCSCodec.prototype._addDecodeChunk = function (eA) {
          var el = parseInt(eA[0], 16),
            ec = this._getDecodeTrieNode(el);
          el &= 255;
          for (var eu = 1; eu < eA.length; eu++) {
            var ed = eA[eu];
            if ("string" == typeof ed)
              for (var ep = 0; ep < ed.length; ) {
                var eh = ed.charCodeAt(ep++);
                if (55296 <= eh && eh < 56320) {
                  var ef = ed.charCodeAt(ep++);
                  if (56320 <= ef && ef < 57344)
                    ec[el++] = 65536 + (eh - 55296) * 1024 + (ef - 56320);
                  else
                    throw Error(
                      "Incorrect surrogate pair in " +
                        this.encodingName +
                        " at chunk " +
                        eA[0],
                    );
                } else if (4080 < eh && eh <= 4095) {
                  for (var em = 4095 - eh + 2, eE = [], eC = 0; eC < em; eC++)
                    eE.push(ed.charCodeAt(ep++));
                  ((ec[el++] = eg - this.decodeTableSeq.length),
                    this.decodeTableSeq.push(eE));
                } else ec[el++] = eh;
              }
            else if ("number" == typeof ed)
              for (var ey = ec[el - 1] + 1, ep = 0; ep < ed; ep++)
                ec[el++] = ey++;
            else
              throw Error(
                "Incorrect type '" +
                  typeof ed +
                  "' given in " +
                  this.encodingName +
                  " at chunk " +
                  eA[0],
              );
          }
          if (el > 255)
            throw Error(
              "Incorrect chunk in " +
                this.encodingName +
                " at addr " +
                eA[0] +
                ": too long" +
                el,
            );
        }),
        (DBCSCodec.prototype._getEncodeBucket = function (eA) {
          var el = eA >> 8;
          return (
            void 0 === this.encodeTable[el] &&
              (this.encodeTable[el] = ef.slice(0)),
            this.encodeTable[el]
          );
        }),
        (DBCSCodec.prototype._setEncodeChar = function (eA, el) {
          var ec = this._getEncodeBucket(eA),
            eu = 255 & eA;
          ec[eu] <= eg
            ? (this.encodeTableSeq[eg - ec[eu]][em] = el)
            : ec[eu] == ed && (ec[eu] = el);
        }),
        (DBCSCodec.prototype._setEncodeSequence = function (eA, el) {
          var ec,
            eu = eA[0],
            ep = this._getEncodeBucket(eu),
            eh = 255 & eu;
          ep[eh] <= eg
            ? (ec = this.encodeTableSeq[eg - ep[eh]])
            : ((ec = {}),
              ep[eh] !== ed && (ec[em] = ep[eh]),
              (ep[eh] = eg - this.encodeTableSeq.length),
              this.encodeTableSeq.push(ec));
          for (var ef = 1; ef < eA.length - 1; ef++) {
            var eE = ec[eu];
            "object" == typeof eE
              ? (ec = eE)
              : ((ec = ec[eu] = {}), void 0 !== eE && (ec[em] = eE));
          }
          ec[(eu = eA[eA.length - 1])] = el;
        }),
        (DBCSCodec.prototype._fillEncodeTable = function (eA, el, ec) {
          for (
            var eu = this.decodeTables[eA], ed = !1, ep = {}, ef = 0;
            ef < 256;
            ef++
          ) {
            var em = eu[ef],
              eE = el + ef;
            if (!ec[eE])
              if (em >= 0) (this._setEncodeChar(em, eE), (ed = !0));
              else if (em <= eh) {
                var eC = eh - em;
                if (!ep[eC]) {
                  var ey = (eE << 8) >>> 0;
                  this._fillEncodeTable(eC, ey, ec) ? (ed = !0) : (ep[eC] = !0);
                }
              } else
                em <= eg &&
                  (this._setEncodeSequence(this.decodeTableSeq[eg - em], eE),
                  (ed = !0));
          }
          return ed;
        }),
        (DBCSEncoder.prototype.write = function (eA) {
          for (
            var el = eu.alloc(eA.length * (this.gb18030 ? 4 : 3)),
              ec = this.leadSurrogate,
              ep = this.seqObj,
              eh = -1,
              ef = 0,
              eE = 0;
            ;

          ) {
            if (-1 === eh) {
              if (ef == eA.length) break;
              var eC = eA.charCodeAt(ef++);
            } else {
              var eC = eh;
              eh = -1;
            }
            if (55296 <= eC && eC < 57344)
              if (eC < 56320)
                if (-1 === ec) {
                  ec = eC;
                  continue;
                } else ((ec = eC), (eC = ed));
              else
                -1 !== ec
                  ? ((eC = 65536 + (ec - 55296) * 1024 + (eC - 56320)),
                    (ec = -1))
                  : (eC = ed);
            else -1 !== ec && ((eh = eC), (eC = ed), (ec = -1));
            var ey = ed;
            if (void 0 !== ep && eC != ed) {
              var ew = ep[eC];
              if ("object" == typeof ew) {
                ep = ew;
                continue;
              }
              ("number" == typeof ew
                ? (ey = ew)
                : void 0 == ew &&
                  void 0 !== (ew = ep[em]) &&
                  ((ey = ew), (eh = eC)),
                (ep = void 0));
            } else if (eC >= 0) {
              var eB = this.encodeTable[eC >> 8];
              if ((void 0 !== eB && (ey = eB[255 & eC]), ey <= eg)) {
                ep = this.encodeTableSeq[eg - ey];
                continue;
              }
              if (ey == ed && this.gb18030) {
                var e_ = findIdx(this.gb18030.uChars, eC);
                if (-1 != e_) {
                  var ey =
                    this.gb18030.gbChars[e_] + (eC - this.gb18030.uChars[e_]);
                  ((el[eE++] = 129 + Math.floor(ey / 12600)),
                    (ey %= 12600),
                    (el[eE++] = 48 + Math.floor(ey / 1260)),
                    (ey %= 1260),
                    (el[eE++] = 129 + Math.floor(ey / 10)),
                    (ey %= 10),
                    (el[eE++] = 48 + ey));
                  continue;
                }
              }
            }
            (ey === ed && (ey = this.defaultCharSingleByte),
              ey < 256
                ? (el[eE++] = ey)
                : (ey < 65536
                    ? (el[eE++] = ey >> 8)
                    : ey < 0x1000000
                      ? ((el[eE++] = ey >> 16), (el[eE++] = (ey >> 8) & 255))
                      : ((el[eE++] = ey >>> 24),
                        (el[eE++] = (ey >>> 16) & 255),
                        (el[eE++] = (ey >>> 8) & 255)),
                  (el[eE++] = 255 & ey)));
          }
          return (
            (this.seqObj = ep),
            (this.leadSurrogate = ec),
            el.slice(0, eE)
          );
        }),
        (DBCSEncoder.prototype.end = function () {
          if (-1 !== this.leadSurrogate || void 0 !== this.seqObj) {
            var eA = eu.alloc(10),
              el = 0;
            if (this.seqObj) {
              var ec = this.seqObj[em];
              (void 0 !== ec &&
                (ec < 256
                  ? (eA[el++] = ec)
                  : ((eA[el++] = ec >> 8), (eA[el++] = 255 & ec))),
                (this.seqObj = void 0));
            }
            return (
              -1 !== this.leadSurrogate &&
                ((eA[el++] = this.defaultCharSingleByte),
                (this.leadSurrogate = -1)),
              eA.slice(0, el)
            );
          }
        }),
        (DBCSEncoder.prototype.findIdx = findIdx),
        (DBCSDecoder.prototype.write = function (eA) {
          for (
            var el,
              ec = eu.alloc(2 * eA.length),
              ef = this.nodeIdx,
              em = this.prevBytes,
              eE = this.prevBytes.length,
              eC = -this.prevBytes.length,
              ey = 0,
              ew = 0;
            ey < eA.length;
            ey++
          ) {
            var eB = ey >= 0 ? eA[ey] : em[ey + eE],
              el = this.decodeTables[ef][eB];
            if (el >= 0);
            else if (el === ed)
              ((el = this.defaultCharUnicode.charCodeAt(0)), (ey = eC));
            else if (el === ep) {
              if (ey >= 3)
                var e_ =
                  (eA[ey - 3] - 129) * 12600 +
                  (eA[ey - 2] - 48) * 1260 +
                  (eA[ey - 1] - 129) * 10 +
                  (eB - 48);
              else
                var e_ =
                  (em[ey - 3 + eE] - 129) * 12600 +
                  ((ey - 2 >= 0 ? eA[ey - 2] : em[ey - 2 + eE]) - 48) * 1260 +
                  ((ey - 1 >= 0 ? eA[ey - 1] : em[ey - 1 + eE]) - 129) * 10 +
                  (eB - 48);
              var eI = findIdx(this.gb18030.gbChars, e_);
              el = this.gb18030.uChars[eI] + e_ - this.gb18030.gbChars[eI];
            } else if (el <= eh) {
              ef = eh - el;
              continue;
            } else if (el <= eg) {
              for (
                var ev = this.decodeTableSeq[eg - el], eS = 0;
                eS < ev.length - 1;
                eS++
              )
                ((el = ev[eS]), (ec[ew++] = 255 & el), (ec[ew++] = el >> 8));
              el = ev[ev.length - 1];
            } else
              throw Error(
                "iconv-lite internal error: invalid decoding table value " +
                  el +
                  " at " +
                  ef +
                  "/" +
                  eB,
              );
            if (el >= 65536) {
              var eQ = 55296 | ((el -= 65536) >> 10);
              ((ec[ew++] = 255 & eQ),
                (ec[ew++] = eQ >> 8),
                (el = 56320 | (1023 & el)));
            }
            ((ec[ew++] = 255 & el),
              (ec[ew++] = el >> 8),
              (ef = 0),
              (eC = ey + 1));
          }
          return (
            (this.nodeIdx = ef),
            (this.prevBytes =
              eC >= 0
                ? Array.prototype.slice.call(eA, eC)
                : em.slice(eC + eE).concat(Array.prototype.slice.call(eA))),
            ec.slice(0, ew).toString("ucs2")
          );
        }),
        (DBCSDecoder.prototype.end = function () {
          for (var eA = ""; this.prevBytes.length > 0; ) {
            eA += this.defaultCharUnicode;
            var el = this.prevBytes.slice(1);
            ((this.prevBytes = []),
              (this.nodeIdx = 0),
              el.length > 0 && (eA += this.write(el)));
          }
          return ((this.prevBytes = []), (this.nodeIdx = 0), eA);
        }));
    },
    37772(eA, el, ec) {
      "use strict";
      eA.exports = {
        shiftjis: {
          type: "_dbcs",
          table: function () {
            return ec(28716);
          },
          encodeAdd: { "\xa5": 92, "‾": 126 },
          encodeSkipVals: [{ from: 60736, to: 63808 }],
        },
        csshiftjis: "shiftjis",
        mskanji: "shiftjis",
        sjis: "shiftjis",
        windows31j: "shiftjis",
        ms31j: "shiftjis",
        xsjis: "shiftjis",
        windows932: "shiftjis",
        ms932: "shiftjis",
        932: "shiftjis",
        cp932: "shiftjis",
        eucjp: {
          type: "_dbcs",
          table: function () {
            return ec(78879);
          },
          encodeAdd: { "\xa5": 92, "‾": 126 },
        },
        gb2312: "cp936",
        gb231280: "cp936",
        gb23121980: "cp936",
        csgb2312: "cp936",
        csiso58gb231280: "cp936",
        euccn: "cp936",
        windows936: "cp936",
        ms936: "cp936",
        936: "cp936",
        cp936: {
          type: "_dbcs",
          table: function () {
            return ec(14365);
          },
        },
        gbk: {
          type: "_dbcs",
          table: function () {
            return ec(14365).concat(ec(56299));
          },
        },
        xgbk: "gbk",
        isoir58: "gbk",
        gb18030: {
          type: "_dbcs",
          table: function () {
            return ec(14365).concat(ec(56299));
          },
          gb18030: function () {
            return ec(64830);
          },
          encodeSkipVals: [128],
          encodeAdd: { "€": 41699 },
        },
        chinese: "gb18030",
        windows949: "cp949",
        ms949: "cp949",
        949: "cp949",
        cp949: {
          type: "_dbcs",
          table: function () {
            return ec(92235);
          },
        },
        cseuckr: "cp949",
        csksc56011987: "cp949",
        euckr: "cp949",
        isoir149: "cp949",
        korean: "cp949",
        ksc56011987: "cp949",
        ksc56011989: "cp949",
        ksc5601: "cp949",
        windows950: "cp950",
        ms950: "cp950",
        950: "cp950",
        cp950: {
          type: "_dbcs",
          table: function () {
            return ec(12925);
          },
        },
        big5: "big5hkscs",
        big5hkscs: {
          type: "_dbcs",
          table: function () {
            return ec(12925).concat(ec(36220));
          },
          encodeSkipVals: [
            36457, 36463, 36478, 36523, 36532, 36557, 36560, 36695, 36713,
            36718, 36811, 36862, 36973, 36986, 37060, 37084, 37105, 37311,
            37551, 37552, 37553, 37554, 37585, 37959, 38090, 38361, 38652,
            39285, 39798, 39800, 39803, 39878, 39902, 39916, 39926, 40002,
            40019, 40034, 40040, 40043, 40055, 40124, 40125, 40144, 40279,
            40282, 40388, 40431, 40443, 40617, 40687, 40701, 40800, 40907,
            41079, 41180, 41183, 36812, 37576, 38468, 38637, 41636, 41637,
            41639, 41638, 41676, 41678,
          ],
        },
        cnbig5: "big5hkscs",
        csbig5: "big5hkscs",
        xxbig5: "big5hkscs",
      };
    },
    28716(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '[["0","\\u0000",128],["a1","｡",62],["8140","　、。，．・：；？！゛゜\xb4｀\xa8＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈",9,"＋－\xb1\xd7"],["8180","\xf7＝≠＜＞≦≧∞∴♂♀\xb0′″℃￥＄￠￡％＃＆＊＠\xa7☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓"],["81b8","∈∋⊆⊇⊂⊃∪∩"],["81c8","∧∨￢⇒⇔∀∃"],["81da","∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬"],["81f0","Å‰♯♭♪†‡\xb6"],["81fc","◯"],["824f","０",9],["8260","Ａ",25],["8281","ａ",25],["829f","ぁ",82],["8340","ァ",62],["8380","ム",22],["839f","Α",16,"Σ",6],["83bf","α",16,"σ",6],["8440","А",5,"ЁЖ",25],["8470","а",5,"ёж",7],["8480","о",17],["849f","─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂"],["8740","①",19,"Ⅰ",9],["875f","㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡"],["877e","㍻"],["8780","〝〟№㏍℡㊤",4,"㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪"],["889f","亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭"],["8940","院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円"],["8980","園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改"],["8a40","魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫"],["8a80","橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄"],["8b40","機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救"],["8b80","朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈"],["8c40","掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨"],["8c80","劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向"],["8d40","后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降"],["8d80","項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷"],["8e40","察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止"],["8e80","死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周"],["8f40","宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳"],["8f80","準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾"],["9040","拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨"],["9080","逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線"],["9140","繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻"],["9180","操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只"],["9240","叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄"],["9280","逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓"],["9340","邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬"],["9380","凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入"],["9440","如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅"],["9480","楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美"],["9540","鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷"],["9580","斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋"],["9640","法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆"],["9680","摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒"],["9740","諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲"],["9780","沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯"],["9840","蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕"],["989f","弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲"],["9940","僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭"],["9980","凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨"],["9a40","咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸"],["9a80","噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩"],["9b40","奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀"],["9b80","它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏"],["9c40","廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠"],["9c80","怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛"],["9d40","戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫"],["9d80","捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼"],["9e40","曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎"],["9e80","梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣"],["9f40","檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯"],["9f80","麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌"],["e040","漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝"],["e080","烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱"],["e140","瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿"],["e180","痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬"],["e240","磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰"],["e280","窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆"],["e340","紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷"],["e380","縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋"],["e440","隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤"],["e480","艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈"],["e540","蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬"],["e580","蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞"],["e640","襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧"],["e680","諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊"],["e740","蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜"],["e780","轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮"],["e840","錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙"],["e880","閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰"],["e940","顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃"],["e980","騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈"],["ea40","鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯"],["ea80","黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙"],["ed40","纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏"],["ed80","塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱"],["ee40","犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙"],["ee80","蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"],["eeef","ⅰ",9,"￢￤＇＂"],["f040","",62],["f080","",124],["f140","",62],["f180","",124],["f240","",62],["f280","",124],["f340","",62],["f380","",124],["f440","",62],["f480","",124],["f540","",62],["f580","",124],["f640","",62],["f680","",124],["f740","",62],["f780","",124],["f840","",62],["f880","",124],["f940",""],["fa40","ⅰ",9,"Ⅰ",9,"￢￤＇＂㈱№℡∵纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊"],["fa80","兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯"],["fb40","涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神"],["fb80","祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙"],["fc40","髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"]]',
      );
    },
    78879(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '[["0","\\u0000",127],["8ea1","｡",62],["a1a1","　、。，．・：；？！゛゜\xb4｀\xa8＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈",9,"＋－\xb1\xd7\xf7＝≠＜＞≦≧∞∴♂♀\xb0′″℃￥＄￠￡％＃＆＊＠\xa7☆★○●◎◇"],["a2a1","◆□■△▲▽▼※〒→←↑↓〓"],["a2ba","∈∋⊆⊇⊂⊃∪∩"],["a2ca","∧∨￢⇒⇔∀∃"],["a2dc","∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬"],["a2f2","Å‰♯♭♪†‡\xb6"],["a2fe","◯"],["a3b0","０",9],["a3c1","Ａ",25],["a3e1","ａ",25],["a4a1","ぁ",82],["a5a1","ァ",85],["a6a1","Α",16,"Σ",6],["a6c1","α",16,"σ",6],["a7a1","А",5,"ЁЖ",25],["a7d1","а",5,"ёж",25],["a8a1","─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂"],["ada1","①",19,"Ⅰ",9],["adc0","㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡"],["addf","㍻〝〟№㏍℡㊤",4,"㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪"],["b0a1","亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭"],["b1a1","院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応"],["b2a1","押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改"],["b3a1","魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱"],["b4a1","粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄"],["b5a1","機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京"],["b6a1","供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈"],["b7a1","掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲"],["b8a1","検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向"],["b9a1","后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込"],["baa1","此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷"],["bba1","察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時"],["bca1","次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周"],["bda1","宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償"],["bea1","勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾"],["bfa1","拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾"],["c0a1","澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線"],["c1a1","繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎"],["c2a1","臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只"],["c3a1","叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵"],["c4a1","帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓"],["c5a1","邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到"],["c6a1","董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入"],["c7a1","如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦"],["c8a1","函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美"],["c9a1","鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服"],["caa1","福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋"],["cba1","法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満"],["cca1","漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒"],["cda1","諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃"],["cea1","痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯"],["cfa1","蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕"],["d0a1","弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲"],["d1a1","僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨"],["d2a1","辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨"],["d3a1","咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉"],["d4a1","圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩"],["d5a1","奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓"],["d6a1","屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏"],["d7a1","廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚"],["d8a1","悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛"],["d9a1","戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼"],["daa1","據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼"],["dba1","曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍"],["dca1","棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣"],["dda1","檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾"],["dea1","沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌"],["dfa1","漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼"],["e0a1","燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱"],["e1a1","瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰"],["e2a1","癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬"],["e3a1","磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐"],["e4a1","筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆"],["e5a1","紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺"],["e6a1","罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋"],["e7a1","隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙"],["e8a1","茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈"],["e9a1","蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙"],["eaa1","蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞"],["eba1","襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫"],["eca1","譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊"],["eda1","蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸"],["eea1","遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮"],["efa1","錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞"],["f0a1","陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰"],["f1a1","顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷"],["f2a1","髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈"],["f3a1","鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠"],["f4a1","堯槇遙瑤凜熙"],["f9a1","纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德"],["faa1","忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱"],["fba1","犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚"],["fca1","釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"],["fcf1","ⅰ",9,"￢￤＇＂"],["8fa2af","˘ˇ\xb8˙˝\xaf˛˚～΄΅"],["8fa2c2","\xa1\xa6\xbf"],["8fa2eb","\xba\xaa\xa9\xae™\xa4№"],["8fa6e1","ΆΈΉΊΪ"],["8fa6e7","Ό"],["8fa6e9","ΎΫ"],["8fa6ec","Ώ"],["8fa6f1","άέήίϊΐόςύϋΰώ"],["8fa7c2","Ђ",10,"ЎЏ"],["8fa7f2","ђ",10,"ўџ"],["8fa9a1","\xc6Đ"],["8fa9a4","Ħ"],["8fa9a6","Ĳ"],["8fa9a8","ŁĿ"],["8fa9ab","Ŋ\xd8Œ"],["8fa9af","Ŧ\xde"],["8fa9c1","\xe6đ\xf0ħıĳĸłŀŉŋ\xf8œ\xdfŧ\xfe"],["8faaa1","\xc1\xc0\xc4\xc2ĂǍĀĄ\xc5\xc3ĆĈČ\xc7ĊĎ\xc9\xc8\xcb\xcaĚĖĒĘ"],["8faaba","ĜĞĢĠĤ\xcd\xcc\xcf\xceǏİĪĮĨĴĶĹĽĻŃŇŅ\xd1\xd3\xd2\xd6\xd4ǑŐŌ\xd5ŔŘŖŚŜŠŞŤŢ\xda\xd9\xdc\xdbŬǓŰŪŲŮŨǗǛǙǕŴ\xddŸŶŹŽŻ"],["8faba1","\xe1\xe0\xe4\xe2ăǎāą\xe5\xe3ćĉč\xe7ċď\xe9\xe8\xeb\xeaěėēęǵĝğ"],["8fabbd","ġĥ\xed\xec\xef\xeeǐ"],["8fabc5","īįĩĵķĺľļńňņ\xf1\xf3\xf2\xf6\xf4ǒőō\xf5ŕřŗśŝšşťţ\xfa\xf9\xfc\xfbŭǔűūųůũǘǜǚǖŵ\xfd\xffŷźžż"],["8fb0a1","丂丄丅丌丒丟丣两丨丫丮丯丰丵乀乁乄乇乑乚乜乣乨乩乴乵乹乿亍亖亗亝亯亹仃仐仚仛仠仡仢仨仯仱仳仵份仾仿伀伂伃伈伋伌伒伕伖众伙伮伱你伳伵伷伹伻伾佀佂佈佉佋佌佒佔佖佘佟佣佪佬佮佱佷佸佹佺佽佾侁侂侄"],["8fb1a1","侅侉侊侌侎侐侒侓侔侗侙侚侞侟侲侷侹侻侼侽侾俀俁俅俆俈俉俋俌俍俏俒俜俠俢俰俲俼俽俿倀倁倄倇倊倌倎倐倓倗倘倛倜倝倞倢倧倮倰倲倳倵偀偁偂偅偆偊偌偎偑偒偓偗偙偟偠偢偣偦偧偪偭偰偱倻傁傃傄傆傊傎傏傐"],["8fb2a1","傒傓傔傖傛傜傞",4,"傪傯傰傹傺傽僀僃僄僇僌僎僐僓僔僘僜僝僟僢僤僦僨僩僯僱僶僺僾儃儆儇儈儋儌儍儎僲儐儗儙儛儜儝儞儣儧儨儬儭儯儱儳儴儵儸儹兂兊兏兓兕兗兘兟兤兦兾冃冄冋冎冘冝冡冣冭冸冺冼冾冿凂"],["8fb3a1","凈减凑凒凓凕凘凞凢凥凮凲凳凴凷刁刂刅划刓刕刖刘刢刨刱刲刵刼剅剉剕剗剘剚剜剟剠剡剦剮剷剸剹劀劂劅劊劌劓劕劖劗劘劚劜劤劥劦劧劯劰劶劷劸劺劻劽勀勄勆勈勌勏勑勔勖勛勜勡勥勨勩勪勬勰勱勴勶勷匀匃匊匋"],["8fb4a1","匌匑匓匘匛匜匞匟匥匧匨匩匫匬匭匰匲匵匼匽匾卂卌卋卙卛卡卣卥卬卭卲卹卾厃厇厈厎厓厔厙厝厡厤厪厫厯厲厴厵厷厸厺厽叀叅叏叒叓叕叚叝叞叠另叧叵吂吓吚吡吧吨吪启吱吴吵呃呄呇呍呏呞呢呤呦呧呩呫呭呮呴呿"],["8fb5a1","咁咃咅咈咉咍咑咕咖咜咟咡咦咧咩咪咭咮咱咷咹咺咻咿哆哊响哎哠哪哬哯哶哼哾哿唀唁唅唈唉唌唍唎唕唪唫唲唵唶唻唼唽啁啇啉啊啍啐啑啘啚啛啞啠啡啤啦啿喁喂喆喈喎喏喑喒喓喔喗喣喤喭喲喿嗁嗃嗆嗉嗋嗌嗎嗑嗒"],["8fb6a1","嗓嗗嗘嗛嗞嗢嗩嗶嗿嘅嘈嘊嘍",5,"嘙嘬嘰嘳嘵嘷嘹嘻嘼嘽嘿噀噁噃噄噆噉噋噍噏噔噞噠噡噢噣噦噩噭噯噱噲噵嚄嚅嚈嚋嚌嚕嚙嚚嚝嚞嚟嚦嚧嚨嚩嚫嚬嚭嚱嚳嚷嚾囅囉囊囋囏囐囌囍囙囜囝囟囡囤",4,"囱囫园"],["8fb7a1","囶囷圁圂圇圊圌圑圕圚圛圝圠圢圣圤圥圩圪圬圮圯圳圴圽圾圿坅坆坌坍坒坢坥坧坨坫坭",4,"坳坴坵坷坹坺坻坼坾垁垃垌垔垗垙垚垜垝垞垟垡垕垧垨垩垬垸垽埇埈埌埏埕埝埞埤埦埧埩埭埰埵埶埸埽埾埿堃堄堈堉埡"],["8fb8a1","堌堍堛堞堟堠堦堧堭堲堹堿塉塌塍塏塐塕塟塡塤塧塨塸塼塿墀墁墇墈墉墊墌墍墏墐墔墖墝墠墡墢墦墩墱墲壄墼壂壈壍壎壐壒壔壖壚壝壡壢壩壳夅夆夋夌夒夓夔虁夝夡夣夤夨夯夰夳夵夶夿奃奆奒奓奙奛奝奞奟奡奣奫奭"],["8fb9a1","奯奲奵奶她奻奼妋妌妎妒妕妗妟妤妧妭妮妯妰妳妷妺妼姁姃姄姈姊姍姒姝姞姟姣姤姧姮姯姱姲姴姷娀娄娌娍娎娒娓娞娣娤娧娨娪娭娰婄婅婇婈婌婐婕婞婣婥婧婭婷婺婻婾媋媐媓媖媙媜媞媟媠媢媧媬媱媲媳媵媸媺媻媿"],["8fbaa1","嫄嫆嫈嫏嫚嫜嫠嫥嫪嫮嫵嫶嫽嬀嬁嬈嬗嬴嬙嬛嬝嬡嬥嬭嬸孁孋孌孒孖孞孨孮孯孼孽孾孿宁宄宆宊宎宐宑宓宔宖宨宩宬宭宯宱宲宷宺宼寀寁寍寏寖",4,"寠寯寱寴寽尌尗尞尟尣尦尩尫尬尮尰尲尵尶屙屚屜屢屣屧屨屩"],["8fbba1","屭屰屴屵屺屻屼屽岇岈岊岏岒岝岟岠岢岣岦岪岲岴岵岺峉峋峒峝峗峮峱峲峴崁崆崍崒崫崣崤崦崧崱崴崹崽崿嵂嵃嵆嵈嵕嵑嵙嵊嵟嵠嵡嵢嵤嵪嵭嵰嵹嵺嵾嵿嶁嶃嶈嶊嶒嶓嶔嶕嶙嶛嶟嶠嶧嶫嶰嶴嶸嶹巃巇巋巐巎巘巙巠巤"],["8fbca1","巩巸巹帀帇帍帒帔帕帘帟帠帮帨帲帵帾幋幐幉幑幖幘幛幜幞幨幪",4,"幰庀庋庎庢庤庥庨庪庬庱庳庽庾庿廆廌廋廎廑廒廔廕廜廞廥廫异弆弇弈弎弙弜弝弡弢弣弤弨弫弬弮弰弴弶弻弽弿彀彄彅彇彍彐彔彘彛彠彣彤彧"],["8fbda1","彯彲彴彵彸彺彽彾徉徍徏徖徜徝徢徧徫徤徬徯徰徱徸忄忇忈忉忋忐",4,"忞忡忢忨忩忪忬忭忮忯忲忳忶忺忼怇怊怍怓怔怗怘怚怟怤怭怳怵恀恇恈恉恌恑恔恖恗恝恡恧恱恾恿悂悆悈悊悎悑悓悕悘悝悞悢悤悥您悰悱悷"],["8fbea1","悻悾惂惄惈惉惊惋惎惏惔惕惙惛惝惞惢惥惲惵惸惼惽愂愇愊愌愐",4,"愖愗愙愜愞愢愪愫愰愱愵愶愷愹慁慅慆慉慞慠慬慲慸慻慼慿憀憁憃憄憋憍憒憓憗憘憜憝憟憠憥憨憪憭憸憹憼懀懁懂懎懏懕懜懝懞懟懡懢懧懩懥"],["8fbfa1","懬懭懯戁戃戄戇戓戕戜戠戢戣戧戩戫戹戽扂扃扄扆扌扐扑扒扔扖扚扜扤扭扯扳扺扽抍抎抏抐抦抨抳抶抷抺抾抿拄拎拕拖拚拪拲拴拼拽挃挄挊挋挍挐挓挖挘挩挪挭挵挶挹挼捁捂捃捄捆捊捋捎捒捓捔捘捛捥捦捬捭捱捴捵"],["8fc0a1","捸捼捽捿掂掄掇掊掐掔掕掙掚掞掤掦掭掮掯掽揁揅揈揎揑揓揔揕揜揠揥揪揬揲揳揵揸揹搉搊搐搒搔搘搞搠搢搤搥搩搪搯搰搵搽搿摋摏摑摒摓摔摚摛摜摝摟摠摡摣摭摳摴摻摽撅撇撏撐撑撘撙撛撝撟撡撣撦撨撬撳撽撾撿"],["8fc1a1","擄擉擊擋擌擎擐擑擕擗擤擥擩擪擭擰擵擷擻擿攁攄攈攉攊攏攓攔攖攙攛攞攟攢攦攩攮攱攺攼攽敃敇敉敐敒敔敟敠敧敫敺敽斁斅斊斒斕斘斝斠斣斦斮斲斳斴斿旂旈旉旎旐旔旖旘旟旰旲旴旵旹旾旿昀昄昈昉昍昑昒昕昖昝"],["8fc2a1","昞昡昢昣昤昦昩昪昫昬昮昰昱昳昹昷晀晅晆晊晌晑晎晗晘晙晛晜晠晡曻晪晫晬晾晳晵晿晷晸晹晻暀晼暋暌暍暐暒暙暚暛暜暟暠暤暭暱暲暵暻暿曀曂曃曈曌曎曏曔曛曟曨曫曬曮曺朅朇朎朓朙朜朠朢朳朾杅杇杈杌杔杕杝"],["8fc3a1","杦杬杮杴杶杻极构枎枏枑枓枖枘枙枛枰枱枲枵枻枼枽柹柀柂柃柅柈柉柒柗柙柜柡柦柰柲柶柷桒栔栙栝栟栨栧栬栭栯栰栱栳栻栿桄桅桊桌桕桗桘桛桫桮",4,"桵桹桺桻桼梂梄梆梈梖梘梚梜梡梣梥梩梪梮梲梻棅棈棌棏"],["8fc4a1","棐棑棓棖棙棜棝棥棨棪棫棬棭棰棱棵棶棻棼棽椆椉椊椐椑椓椖椗椱椳椵椸椻楂楅楉楎楗楛楣楤楥楦楨楩楬楰楱楲楺楻楿榀榍榒榖榘榡榥榦榨榫榭榯榷榸榺榼槅槈槑槖槗槢槥槮槯槱槳槵槾樀樁樃樏樑樕樚樝樠樤樨樰樲"],["8fc5a1","樴樷樻樾樿橅橆橉橊橎橐橑橒橕橖橛橤橧橪橱橳橾檁檃檆檇檉檋檑檛檝檞檟檥檫檯檰檱檴檽檾檿櫆櫉櫈櫌櫐櫔櫕櫖櫜櫝櫤櫧櫬櫰櫱櫲櫼櫽欂欃欆欇欉欏欐欑欗欛欞欤欨欫欬欯欵欶欻欿歆歊歍歒歖歘歝歠歧歫歮歰歵歽"],["8fc6a1","歾殂殅殗殛殟殠殢殣殨殩殬殭殮殰殸殹殽殾毃毄毉毌毖毚毡毣毦毧毮毱毷毹毿氂氄氅氉氍氎氐氒氙氟氦氧氨氬氮氳氵氶氺氻氿汊汋汍汏汒汔汙汛汜汫汭汯汴汶汸汹汻沅沆沇沉沔沕沗沘沜沟沰沲沴泂泆泍泏泐泑泒泔泖"],["8fc7a1","泚泜泠泧泩泫泬泮泲泴洄洇洊洎洏洑洓洚洦洧洨汧洮洯洱洹洼洿浗浞浟浡浥浧浯浰浼涂涇涑涒涔涖涗涘涪涬涴涷涹涽涿淄淈淊淎淏淖淛淝淟淠淢淥淩淯淰淴淶淼渀渄渞渢渧渲渶渹渻渼湄湅湈湉湋湏湑湒湓湔湗湜湝湞"],["8fc8a1","湢湣湨湳湻湽溍溓溙溠溧溭溮溱溳溻溿滀滁滃滇滈滊滍滎滏滫滭滮滹滻滽漄漈漊漌漍漖漘漚漛漦漩漪漯漰漳漶漻漼漭潏潑潒潓潗潙潚潝潞潡潢潨潬潽潾澃澇澈澋澌澍澐澒澓澔澖澚澟澠澥澦澧澨澮澯澰澵澶澼濅濇濈濊"],["8fc9a1","濚濞濨濩濰濵濹濼濽瀀瀅瀆瀇瀍瀗瀠瀣瀯瀴瀷瀹瀼灃灄灈灉灊灋灔灕灝灞灎灤灥灬灮灵灶灾炁炅炆炔",4,"炛炤炫炰炱炴炷烊烑烓烔烕烖烘烜烤烺焃",4,"焋焌焏焞焠焫焭焯焰焱焸煁煅煆煇煊煋煐煒煗煚煜煞煠"],["8fcaa1","煨煹熀熅熇熌熒熚熛熠熢熯熰熲熳熺熿燀燁燄燋燌燓燖燙燚燜燸燾爀爇爈爉爓爗爚爝爟爤爫爯爴爸爹牁牂牃牅牎牏牐牓牕牖牚牜牞牠牣牨牫牮牯牱牷牸牻牼牿犄犉犍犎犓犛犨犭犮犱犴犾狁狇狉狌狕狖狘狟狥狳狴狺狻"],["8fcba1","狾猂猄猅猇猋猍猒猓猘猙猞猢猤猧猨猬猱猲猵猺猻猽獃獍獐獒獖獘獝獞獟獠獦獧獩獫獬獮獯獱獷獹獼玀玁玃玅玆玎玐玓玕玗玘玜玞玟玠玢玥玦玪玫玭玵玷玹玼玽玿珅珆珉珋珌珏珒珓珖珙珝珡珣珦珧珩珴珵珷珹珺珻珽"],["8fcca1","珿琀琁琄琇琊琑琚琛琤琦琨",9,"琹瑀瑃瑄瑆瑇瑋瑍瑑瑒瑗瑝瑢瑦瑧瑨瑫瑭瑮瑱瑲璀璁璅璆璇璉璏璐璑璒璘璙璚璜璟璠璡璣璦璨璩璪璫璮璯璱璲璵璹璻璿瓈瓉瓌瓐瓓瓘瓚瓛瓞瓟瓤瓨瓪瓫瓯瓴瓺瓻瓼瓿甆"],["8fcda1","甒甖甗甠甡甤甧甩甪甯甶甹甽甾甿畀畃畇畈畎畐畒畗畞畟畡畯畱畹",5,"疁疅疐疒疓疕疙疜疢疤疴疺疿痀痁痄痆痌痎痏痗痜痟痠痡痤痧痬痮痯痱痹瘀瘂瘃瘄瘇瘈瘊瘌瘏瘒瘓瘕瘖瘙瘛瘜瘝瘞瘣瘥瘦瘩瘭瘲瘳瘵瘸瘹"],["8fcea1","瘺瘼癊癀癁癃癄癅癉癋癕癙癟癤癥癭癮癯癱癴皁皅皌皍皕皛皜皝皟皠皢",6,"皪皭皽盁盅盉盋盌盎盔盙盠盦盨盬盰盱盶盹盼眀眆眊眎眒眔眕眗眙眚眜眢眨眭眮眯眴眵眶眹眽眾睂睅睆睊睍睎睏睒睖睗睜睞睟睠睢"],["8fcfa1","睤睧睪睬睰睲睳睴睺睽瞀瞄瞌瞍瞔瞕瞖瞚瞟瞢瞧瞪瞮瞯瞱瞵瞾矃矉矑矒矕矙矞矟矠矤矦矪矬矰矱矴矸矻砅砆砉砍砎砑砝砡砢砣砭砮砰砵砷硃硄硇硈硌硎硒硜硞硠硡硣硤硨硪确硺硾碊碏碔碘碡碝碞碟碤碨碬碭碰碱碲碳"],["8fd0a1","碻碽碿磇磈磉磌磎磒磓磕磖磤磛磟磠磡磦磪磲磳礀磶磷磺磻磿礆礌礐礚礜礞礟礠礥礧礩礭礱礴礵礻礽礿祄祅祆祊祋祏祑祔祘祛祜祧祩祫祲祹祻祼祾禋禌禑禓禔禕禖禘禛禜禡禨禩禫禯禱禴禸离秂秄秇秈秊秏秔秖秚秝秞"],["8fd1a1","秠秢秥秪秫秭秱秸秼稂稃稇稉稊稌稑稕稛稞稡稧稫稭稯稰稴稵稸稹稺穄穅穇穈穌穕穖穙穜穝穟穠穥穧穪穭穵穸穾窀窂窅窆窊窋窐窑窔窞窠窣窬窳窵窹窻窼竆竉竌竎竑竛竨竩竫竬竱竴竻竽竾笇笔笟笣笧笩笪笫笭笮笯笰"],["8fd2a1","笱笴笽笿筀筁筇筎筕筠筤筦筩筪筭筯筲筳筷箄箉箎箐箑箖箛箞箠箥箬箯箰箲箵箶箺箻箼箽篂篅篈篊篔篖篗篙篚篛篨篪篲篴篵篸篹篺篼篾簁簂簃簄簆簉簋簌簎簏簙簛簠簥簦簨簬簱簳簴簶簹簺籆籊籕籑籒籓籙",5],["8fd3a1","籡籣籧籩籭籮籰籲籹籼籽粆粇粏粔粞粠粦粰粶粷粺粻粼粿糄糇糈糉糍糏糓糔糕糗糙糚糝糦糩糫糵紃紇紈紉紏紑紒紓紖紝紞紣紦紪紭紱紼紽紾絀絁絇絈絍絑絓絗絙絚絜絝絥絧絪絰絸絺絻絿綁綂綃綅綆綈綋綌綍綑綖綗綝"],["8fd4a1","綞綦綧綪綳綶綷綹緂",4,"緌緍緎緗緙縀緢緥緦緪緫緭緱緵緶緹緺縈縐縑縕縗縜縝縠縧縨縬縭縯縳縶縿繄繅繇繎繐繒繘繟繡繢繥繫繮繯繳繸繾纁纆纇纊纍纑纕纘纚纝纞缼缻缽缾缿罃罄罇罏罒罓罛罜罝罡罣罤罥罦罭"],["8fd5a1","罱罽罾罿羀羋羍羏羐羑羖羗羜羡羢羦羪羭羴羼羿翀翃翈翎翏翛翟翣翥翨翬翮翯翲翺翽翾翿耇耈耊耍耎耏耑耓耔耖耝耞耟耠耤耦耬耮耰耴耵耷耹耺耼耾聀聄聠聤聦聭聱聵肁肈肎肜肞肦肧肫肸肹胈胍胏胒胔胕胗胘胠胭胮"],["8fd6a1","胰胲胳胶胹胺胾脃脋脖脗脘脜脞脠脤脧脬脰脵脺脼腅腇腊腌腒腗腠腡腧腨腩腭腯腷膁膐膄膅膆膋膎膖膘膛膞膢膮膲膴膻臋臃臅臊臎臏臕臗臛臝臞臡臤臫臬臰臱臲臵臶臸臹臽臿舀舃舏舓舔舙舚舝舡舢舨舲舴舺艃艄艅艆"],["8fd7a1","艋艎艏艑艖艜艠艣艧艭艴艻艽艿芀芁芃芄芇芉芊芎芑芔芖芘芚芛芠芡芣芤芧芨芩芪芮芰芲芴芷芺芼芾芿苆苐苕苚苠苢苤苨苪苭苯苶苷苽苾茀茁茇茈茊茋荔茛茝茞茟茡茢茬茭茮茰茳茷茺茼茽荂荃荄荇荍荎荑荕荖荗荰荸"],["8fd8a1","荽荿莀莂莄莆莍莒莔莕莘莙莛莜莝莦莧莩莬莾莿菀菇菉菏菐菑菔菝荓菨菪菶菸菹菼萁萆萊萏萑萕萙莭萯萹葅葇葈葊葍葏葑葒葖葘葙葚葜葠葤葥葧葪葰葳葴葶葸葼葽蒁蒅蒒蒓蒕蒞蒦蒨蒩蒪蒯蒱蒴蒺蒽蒾蓀蓂蓇蓈蓌蓏蓓"],["8fd9a1","蓜蓧蓪蓯蓰蓱蓲蓷蔲蓺蓻蓽蔂蔃蔇蔌蔎蔐蔜蔞蔢蔣蔤蔥蔧蔪蔫蔯蔳蔴蔶蔿蕆蕏",4,"蕖蕙蕜",6,"蕤蕫蕯蕹蕺蕻蕽蕿薁薅薆薉薋薌薏薓薘薝薟薠薢薥薧薴薶薷薸薼薽薾薿藂藇藊藋藎薭藘藚藟藠藦藨藭藳藶藼"],["8fdaa1","藿蘀蘄蘅蘍蘎蘐蘑蘒蘘蘙蘛蘞蘡蘧蘩蘶蘸蘺蘼蘽虀虂虆虒虓虖虗虘虙虝虠",4,"虩虬虯虵虶虷虺蚍蚑蚖蚘蚚蚜蚡蚦蚧蚨蚭蚱蚳蚴蚵蚷蚸蚹蚿蛀蛁蛃蛅蛑蛒蛕蛗蛚蛜蛠蛣蛥蛧蚈蛺蛼蛽蜄蜅蜇蜋蜎蜏蜐蜓蜔蜙蜞蜟蜡蜣"],["8fdba1","蜨蜮蜯蜱蜲蜹蜺蜼蜽蜾蝀蝃蝅蝍蝘蝝蝡蝤蝥蝯蝱蝲蝻螃",6,"螋螌螐螓螕螗螘螙螞螠螣螧螬螭螮螱螵螾螿蟁蟈蟉蟊蟎蟕蟖蟙蟚蟜蟟蟢蟣蟤蟪蟫蟭蟱蟳蟸蟺蟿蠁蠃蠆蠉蠊蠋蠐蠙蠒蠓蠔蠘蠚蠛蠜蠞蠟蠨蠭蠮蠰蠲蠵"],["8fdca1","蠺蠼衁衃衅衈衉衊衋衎衑衕衖衘衚衜衟衠衤衩衱衹衻袀袘袚袛袜袟袠袨袪袺袽袾裀裊",4,"裑裒裓裛裞裧裯裰裱裵裷褁褆褍褎褏褕褖褘褙褚褜褠褦褧褨褰褱褲褵褹褺褾襀襂襅襆襉襏襒襗襚襛襜襡襢襣襫襮襰襳襵襺"],["8fdda1","襻襼襽覉覍覐覔覕覛覜覟覠覥覰覴覵覶覷覼觔",4,"觥觩觫觭觱觳觶觹觽觿訄訅訇訏訑訒訔訕訞訠訢訤訦訫訬訯訵訷訽訾詀詃詅詇詉詍詎詓詖詗詘詜詝詡詥詧詵詶詷詹詺詻詾詿誀誃誆誋誏誐誒誖誗誙誟誧誩誮誯誳"],["8fdea1","誶誷誻誾諃諆諈諉諊諑諓諔諕諗諝諟諬諰諴諵諶諼諿謅謆謋謑謜謞謟謊謭謰謷謼譂",4,"譈譒譓譔譙譍譞譣譭譶譸譹譼譾讁讄讅讋讍讏讔讕讜讞讟谸谹谽谾豅豇豉豋豏豑豓豔豗豘豛豝豙豣豤豦豨豩豭豳豵豶豻豾貆"],["8fdfa1","貇貋貐貒貓貙貛貜貤貹貺賅賆賉賋賏賖賕賙賝賡賨賬賯賰賲賵賷賸賾賿贁贃贉贒贗贛赥赩赬赮赿趂趄趈趍趐趑趕趞趟趠趦趫趬趯趲趵趷趹趻跀跅跆跇跈跊跎跑跔跕跗跙跤跥跧跬跰趼跱跲跴跽踁踄踅踆踋踑踔踖踠踡踢"],["8fe0a1","踣踦踧踱踳踶踷踸踹踽蹀蹁蹋蹍蹎蹏蹔蹛蹜蹝蹞蹡蹢蹩蹬蹭蹯蹰蹱蹹蹺蹻躂躃躉躐躒躕躚躛躝躞躢躧躩躭躮躳躵躺躻軀軁軃軄軇軏軑軔軜軨軮軰軱軷軹軺軭輀輂輇輈輏輐輖輗輘輞輠輡輣輥輧輨輬輭輮輴輵輶輷輺轀轁"],["8fe1a1","轃轇轏轑",4,"轘轝轞轥辝辠辡辤辥辦辵辶辸达迀迁迆迊迋迍运迒迓迕迠迣迤迨迮迱迵迶迻迾适逄逈逌逘逛逨逩逯逪逬逭逳逴逷逿遃遄遌遛遝遢遦遧遬遰遴遹邅邈邋邌邎邐邕邗邘邙邛邠邡邢邥邰邲邳邴邶邽郌邾郃"],["8fe2a1","郄郅郇郈郕郗郘郙郜郝郟郥郒郶郫郯郰郴郾郿鄀鄄鄅鄆鄈鄍鄐鄔鄖鄗鄘鄚鄜鄞鄠鄥鄢鄣鄧鄩鄮鄯鄱鄴鄶鄷鄹鄺鄼鄽酃酇酈酏酓酗酙酚酛酡酤酧酭酴酹酺酻醁醃醅醆醊醎醑醓醔醕醘醞醡醦醨醬醭醮醰醱醲醳醶醻醼醽醿"],["8fe3a1","釂釃釅釓釔釗釙釚釞釤釥釩釪釬",5,"釷釹釻釽鈀鈁鈄鈅鈆鈇鈉鈊鈌鈐鈒鈓鈖鈘鈜鈝鈣鈤鈥鈦鈨鈮鈯鈰鈳鈵鈶鈸鈹鈺鈼鈾鉀鉂鉃鉆鉇鉊鉍鉎鉏鉑鉘鉙鉜鉝鉠鉡鉥鉧鉨鉩鉮鉯鉰鉵",4,"鉻鉼鉽鉿銈銉銊銍銎銒銗"],["8fe4a1","銙銟銠銤銥銧銨銫銯銲銶銸銺銻銼銽銿",4,"鋅鋆鋇鋈鋋鋌鋍鋎鋐鋓鋕鋗鋘鋙鋜鋝鋟鋠鋡鋣鋥鋧鋨鋬鋮鋰鋹鋻鋿錀錂錈錍錑錔錕錜錝錞錟錡錤錥錧錩錪錳錴錶錷鍇鍈鍉鍐鍑鍒鍕鍗鍘鍚鍞鍤鍥鍧鍩鍪鍭鍯鍰鍱鍳鍴鍶"],["8fe5a1","鍺鍽鍿鎀鎁鎂鎈鎊鎋鎍鎏鎒鎕鎘鎛鎞鎡鎣鎤鎦鎨鎫鎴鎵鎶鎺鎩鏁鏄鏅鏆鏇鏉",4,"鏓鏙鏜鏞鏟鏢鏦鏧鏹鏷鏸鏺鏻鏽鐁鐂鐄鐈鐉鐍鐎鐏鐕鐖鐗鐟鐮鐯鐱鐲鐳鐴鐻鐿鐽鑃鑅鑈鑊鑌鑕鑙鑜鑟鑡鑣鑨鑫鑭鑮鑯鑱鑲钄钃镸镹"],["8fe6a1","镾閄閈閌閍閎閝閞閟閡閦閩閫閬閴閶閺閽閿闆闈闉闋闐闑闒闓闙闚闝闞闟闠闤闦阝阞阢阤阥阦阬阱阳阷阸阹阺阼阽陁陒陔陖陗陘陡陮陴陻陼陾陿隁隂隃隄隉隑隖隚隝隟隤隥隦隩隮隯隳隺雊雒嶲雘雚雝雞雟雩雯雱雺霂"],["8fe7a1","霃霅霉霚霛霝霡霢霣霨霱霳靁靃靊靎靏靕靗靘靚靛靣靧靪靮靳靶靷靸靻靽靿鞀鞉鞕鞖鞗鞙鞚鞞鞟鞢鞬鞮鞱鞲鞵鞶鞸鞹鞺鞼鞾鞿韁韄韅韇韉韊韌韍韎韐韑韔韗韘韙韝韞韠韛韡韤韯韱韴韷韸韺頇頊頙頍頎頔頖頜頞頠頣頦"],["8fe8a1","頫頮頯頰頲頳頵頥頾顄顇顊顑顒顓顖顗顙顚顢顣顥顦顪顬颫颭颮颰颴颷颸颺颻颿飂飅飈飌飡飣飥飦飧飪飳飶餂餇餈餑餕餖餗餚餛餜餟餢餦餧餫餱",4,"餹餺餻餼饀饁饆饇饈饍饎饔饘饙饛饜饞饟饠馛馝馟馦馰馱馲馵"],["8fe9a1","馹馺馽馿駃駉駓駔駙駚駜駞駧駪駫駬駰駴駵駹駽駾騂騃騄騋騌騐騑騖騞騠騢騣騤騧騭騮騳騵騶騸驇驁驄驊驋驌驎驑驔驖驝骪骬骮骯骲骴骵骶骹骻骾骿髁髃髆髈髎髐髒髕髖髗髛髜髠髤髥髧髩髬髲髳髵髹髺髽髿",4],["8feaa1","鬄鬅鬈鬉鬋鬌鬍鬎鬐鬒鬖鬙鬛鬜鬠鬦鬫鬭鬳鬴鬵鬷鬹鬺鬽魈魋魌魕魖魗魛魞魡魣魥魦魨魪",4,"魳魵魷魸魹魿鮀鮄鮅鮆鮇鮉鮊鮋鮍鮏鮐鮔鮚鮝鮞鮦鮧鮩鮬鮰鮱鮲鮷鮸鮻鮼鮾鮿鯁鯇鯈鯎鯐鯗鯘鯝鯟鯥鯧鯪鯫鯯鯳鯷鯸"],["8feba1","鯹鯺鯽鯿鰀鰂鰋鰏鰑鰖鰘鰙鰚鰜鰞鰢鰣鰦",4,"鰱鰵鰶鰷鰽鱁鱃鱄鱅鱉鱊鱎鱏鱐鱓鱔鱖鱘鱛鱝鱞鱟鱣鱩鱪鱜鱫鱨鱮鱰鱲鱵鱷鱻鳦鳲鳷鳹鴋鴂鴑鴗鴘鴜鴝鴞鴯鴰鴲鴳鴴鴺鴼鵅鴽鵂鵃鵇鵊鵓鵔鵟鵣鵢鵥鵩鵪鵫鵰鵶鵷鵻"],["8feca1","鵼鵾鶃鶄鶆鶊鶍鶎鶒鶓鶕鶖鶗鶘鶡鶪鶬鶮鶱鶵鶹鶼鶿鷃鷇鷉鷊鷔鷕鷖鷗鷚鷞鷟鷠鷥鷧鷩鷫鷮鷰鷳鷴鷾鸊鸂鸇鸎鸐鸑鸒鸕鸖鸙鸜鸝鹺鹻鹼麀麂麃麄麅麇麎麏麖麘麛麞麤麨麬麮麯麰麳麴麵黆黈黋黕黟黤黧黬黭黮黰黱黲黵"],["8feda1","黸黿鼂鼃鼉鼏鼐鼑鼒鼔鼖鼗鼙鼚鼛鼟鼢鼦鼪鼫鼯鼱鼲鼴鼷鼹鼺鼼鼽鼿齁齃",4,"齓齕齖齗齘齚齝齞齨齩齭",4,"齳齵齺齽龏龐龑龒龔龖龗龞龡龢龣龥"]]',
      );
    },
    14365(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '[["0","\\u0000",127,"€"],["8140","丂丄丅丆丏丒丗丟丠両丣並丩丮丯丱丳丵丷丼乀乁乂乄乆乊乑乕乗乚乛乢乣乤乥乧乨乪",5,"乲乴",9,"乿",6,"亇亊"],["8180","亐亖亗亙亜亝亞亣亪亯亰亱亴亶亷亸亹亼亽亾仈仌仏仐仒仚仛仜仠仢仦仧仩仭仮仯仱仴仸仹仺仼仾伀伂",6,"伋伌伒",4,"伜伝伡伣伨伩伬伭伮伱伳伵伷伹伻伾",4,"佄佅佇",5,"佒佔佖佡佢佦佨佪佫佭佮佱佲併佷佸佹佺佽侀侁侂侅來侇侊侌侎侐侒侓侕侖侘侙侚侜侞侟価侢"],["8240","侤侫侭侰",4,"侶",8,"俀俁係俆俇俈俉俋俌俍俒",4,"俙俛俠俢俤俥俧俫俬俰俲俴俵俶俷俹俻俼俽俿",11],["8280","個倎倐們倓倕倖倗倛倝倞倠倢倣値倧倫倯",10,"倻倽倿偀偁偂偄偅偆偉偊偋偍偐",4,"偖偗偘偙偛偝",7,"偦",5,"偭",8,"偸偹偺偼偽傁傂傃傄傆傇傉傊傋傌傎",20,"傤傦傪傫傭",4,"傳",6,"傼"],["8340","傽",17,"僐",5,"僗僘僙僛",10,"僨僩僪僫僯僰僱僲僴僶",4,"僼",9,"儈"],["8380","儉儊儌",5,"儓",13,"儢",28,"兂兇兊兌兎兏児兒兓兗兘兙兛兝",4,"兣兤兦內兩兪兯兲兺兾兿冃冄円冇冊冋冎冏冐冑冓冔冘冚冝冞冟冡冣冦",4,"冭冮冴冸冹冺冾冿凁凂凃凅凈凊凍凎凐凒",5],["8440","凘凙凚凜凞凟凢凣凥",5,"凬凮凱凲凴凷凾刄刅刉刋刌刏刐刓刔刕刜刞刟刡刢刣別刦刧刪刬刯刱刲刴刵刼刾剄",5,"剋剎剏剒剓剕剗剘"],["8480","剙剚剛剝剟剠剢剣剤剦剨剫剬剭剮剰剱剳",9,"剾劀劃",4,"劉",6,"劑劒劔",6,"劜劤劥劦劧劮劯劰労",9,"勀勁勂勄勅勆勈勊勌勍勎勏勑勓勔動勗務",5,"勠勡勢勣勥",10,"勱",7,"勻勼勽匁匂匃匄匇匉匊匋匌匎"],["8540","匑匒匓匔匘匛匜匞匟匢匤匥匧匨匩匫匬匭匯",9,"匼匽區卂卄卆卋卌卍卐協単卙卛卝卥卨卪卬卭卲卶卹卻卼卽卾厀厁厃厇厈厊厎厏"],["8580","厐",4,"厖厗厙厛厜厞厠厡厤厧厪厫厬厭厯",6,"厷厸厹厺厼厽厾叀參",4,"収叏叐叒叓叕叚叜叝叞叡叢叧叴叺叾叿吀吂吅吇吋吔吘吙吚吜吢吤吥吪吰吳吶吷吺吽吿呁呂呄呅呇呉呌呍呎呏呑呚呝",4,"呣呥呧呩",7,"呴呹呺呾呿咁咃咅咇咈咉咊咍咑咓咗咘咜咞咟咠咡"],["8640","咢咥咮咰咲咵咶咷咹咺咼咾哃哅哊哋哖哘哛哠",4,"哫哬哯哰哱哴",5,"哻哾唀唂唃唄唅唈唊",4,"唒唓唕",5,"唜唝唞唟唡唥唦"],["8680","唨唩唫唭唲唴唵唶唸唹唺唻唽啀啂啅啇啈啋",4,"啑啒啓啔啗",4,"啝啞啟啠啢啣啨啩啫啯",5,"啹啺啽啿喅喆喌喍喎喐喒喓喕喖喗喚喛喞喠",6,"喨",8,"喲喴営喸喺喼喿",4,"嗆嗇嗈嗊嗋嗎嗏嗐嗕嗗",4,"嗞嗠嗢嗧嗩嗭嗮嗰嗱嗴嗶嗸",4,"嗿嘂嘃嘄嘅"],["8740","嘆嘇嘊嘋嘍嘐",7,"嘙嘚嘜嘝嘠嘡嘢嘥嘦嘨嘩嘪嘫嘮嘯嘰嘳嘵嘷嘸嘺嘼嘽嘾噀",11,"噏",4,"噕噖噚噛噝",4],["8780","噣噥噦噧噭噮噯噰噲噳噴噵噷噸噹噺噽",7,"嚇",6,"嚐嚑嚒嚔",14,"嚤",10,"嚰",6,"嚸嚹嚺嚻嚽",12,"囋",8,"囕囖囘囙囜団囥",5,"囬囮囯囲図囶囷囸囻囼圀圁圂圅圇國",6],["8840","園",9,"圝圞圠圡圢圤圥圦圧圫圱圲圴",4,"圼圽圿坁坃坄坅坆坈坉坋坒",4,"坘坙坢坣坥坧坬坮坰坱坲坴坵坸坹坺坽坾坿垀"],["8880","垁垇垈垉垊垍",4,"垔",6,"垜垝垞垟垥垨垪垬垯垰垱垳垵垶垷垹",8,"埄",6,"埌埍埐埑埓埖埗埛埜埞埡埢埣埥",7,"埮埰埱埲埳埵埶執埻埼埾埿堁堃堄堅堈堉堊堌堎堏堐堒堓堔堖堗堘堚堛堜堝堟堢堣堥",4,"堫",4,"報堲堳場堶",7],["8940","堾",5,"塅",6,"塎塏塐塒塓塕塖塗塙",4,"塟",5,"塦",4,"塭",16,"塿墂墄墆墇墈墊墋墌"],["8980","墍",4,"墔",4,"墛墜墝墠",7,"墪",17,"墽墾墿壀壂壃壄壆",10,"壒壓壔壖",13,"壥",5,"壭壯壱売壴壵壷壸壺",7,"夃夅夆夈",4,"夎夐夑夒夓夗夘夛夝夞夠夡夢夣夦夨夬夰夲夳夵夶夻"],["8a40","夽夾夿奀奃奅奆奊奌奍奐奒奓奙奛",4,"奡奣奤奦",12,"奵奷奺奻奼奾奿妀妅妉妋妌妎妏妐妑妔妕妘妚妛妜妝妟妠妡妢妦"],["8a80","妧妬妭妰妱妳",5,"妺妼妽妿",6,"姇姈姉姌姍姎姏姕姖姙姛姞",4,"姤姦姧姩姪姫姭",11,"姺姼姽姾娀娂娊娋娍娎娏娐娒娔娕娖娗娙娚娛娝娞娡娢娤娦娧娨娪",6,"娳娵娷",4,"娽娾娿婁",4,"婇婈婋",9,"婖婗婘婙婛",5],["8b40","婡婣婤婥婦婨婩婫",8,"婸婹婻婼婽婾媀",17,"媓",6,"媜",13,"媫媬"],["8b80","媭",4,"媴媶媷媹",4,"媿嫀嫃",5,"嫊嫋嫍",4,"嫓嫕嫗嫙嫚嫛嫝嫞嫟嫢嫤嫥嫧嫨嫪嫬",4,"嫲",22,"嬊",11,"嬘",25,"嬳嬵嬶嬸",7,"孁",6],["8c40","孈",7,"孒孖孞孠孡孧孨孫孭孮孯孲孴孶孷學孹孻孼孾孿宂宆宊宍宎宐宑宒宔宖実宧宨宩宬宭宮宯宱宲宷宺宻宼寀寁寃寈寉寊寋寍寎寏"],["8c80","寑寔",8,"寠寢寣實寧審",4,"寯寱",6,"寽対尀専尃尅將專尋尌對導尐尒尓尗尙尛尞尟尠尡尣尦尨尩尪尫尭尮尯尰尲尳尵尶尷屃屄屆屇屌屍屒屓屔屖屗屘屚屛屜屝屟屢層屧",6,"屰屲",6,"屻屼屽屾岀岃",4,"岉岊岋岎岏岒岓岕岝",4,"岤",4],["8d40","岪岮岯岰岲岴岶岹岺岻岼岾峀峂峃峅",5,"峌",5,"峓",5,"峚",6,"峢峣峧峩峫峬峮峯峱",9,"峼",4],["8d80","崁崄崅崈",5,"崏",4,"崕崗崘崙崚崜崝崟",4,"崥崨崪崫崬崯",4,"崵",7,"崿",7,"嵈嵉嵍",10,"嵙嵚嵜嵞",10,"嵪嵭嵮嵰嵱嵲嵳嵵",12,"嶃",21,"嶚嶛嶜嶞嶟嶠"],["8e40","嶡",21,"嶸",12,"巆",6,"巎",12,"巜巟巠巣巤巪巬巭"],["8e80","巰巵巶巸",4,"巿帀帄帇帉帊帋帍帎帒帓帗帞",7,"帨",4,"帯帰帲",4,"帹帺帾帿幀幁幃幆",5,"幍",6,"幖",4,"幜幝幟幠幣",14,"幵幷幹幾庁庂広庅庈庉庌庍庎庒庘庛庝庡庢庣庤庨",4,"庮",4,"庴庺庻庼庽庿",6],["8f40","廆廇廈廋",5,"廔廕廗廘廙廚廜",11,"廩廫",8,"廵廸廹廻廼廽弅弆弇弉弌弍弎弐弒弔弖弙弚弜弝弞弡弢弣弤"],["8f80","弨弫弬弮弰弲",6,"弻弽弾弿彁",14,"彑彔彙彚彛彜彞彟彠彣彥彧彨彫彮彯彲彴彵彶彸彺彽彾彿徃徆徍徎徏徑従徔徖徚徛徝從徟徠徢",5,"復徫徬徯",5,"徶徸徹徺徻徾",4,"忇忈忊忋忎忓忔忕忚忛応忞忟忢忣忥忦忨忩忬忯忰忲忳忴忶忷忹忺忼怇"],["9040","怈怉怋怌怐怑怓怗怘怚怞怟怢怣怤怬怭怮怰",4,"怶",4,"怽怾恀恄",6,"恌恎恏恑恓恔恖恗恘恛恜恞恟恠恡恥恦恮恱恲恴恵恷恾悀"],["9080","悁悂悅悆悇悈悊悋悎悏悐悑悓悕悗悘悙悜悞悡悢悤悥悧悩悪悮悰悳悵悶悷悹悺悽",7,"惇惈惉惌",4,"惒惓惔惖惗惙惛惞惡",4,"惪惱惲惵惷惸惻",4,"愂愃愄愅愇愊愋愌愐",4,"愖愗愘愙愛愜愝愞愡愢愥愨愩愪愬",18,"慀",6],["9140","慇慉態慍慏慐慒慓慔慖",6,"慞慟慠慡慣慤慥慦慩",6,"慱慲慳慴慶慸",18,"憌憍憏",4,"憕"],["9180","憖",6,"憞",8,"憪憫憭",9,"憸",5,"憿懀懁懃",4,"應懌",4,"懓懕",16,"懧",13,"懶",8,"戀",5,"戇戉戓戔戙戜戝戞戠戣戦戧戨戩戫戭戯戰戱戲戵戶戸",4,"扂扄扅扆扊"],["9240","扏扐払扖扗扙扚扜",6,"扤扥扨扱扲扴扵扷扸扺扻扽抁抂抃抅抆抇抈抋",5,"抔抙抜抝択抣抦抧抩抪抭抮抯抰抲抳抴抶抷抸抺抾拀拁"],["9280","拃拋拏拑拕拝拞拠拡拤拪拫拰拲拵拸拹拺拻挀挃挄挅挆挊挋挌挍挏挐挒挓挔挕挗挘挙挜挦挧挩挬挭挮挰挱挳",5,"挻挼挾挿捀捁捄捇捈捊捑捒捓捔捖",7,"捠捤捥捦捨捪捫捬捯捰捲捳捴捵捸捹捼捽捾捿掁掃掄掅掆掋掍掑掓掔掕掗掙",6,"採掤掦掫掯掱掲掵掶掹掻掽掿揀"],["9340","揁揂揃揅揇揈揊揋揌揑揓揔揕揗",6,"揟揢揤",4,"揫揬揮揯揰揱揳揵揷揹揺揻揼揾搃搄搆",4,"損搎搑搒搕",5,"搝搟搢搣搤"],["9380","搥搧搨搩搫搮",5,"搵",4,"搻搼搾摀摂摃摉摋",6,"摓摕摖摗摙",4,"摟",7,"摨摪摫摬摮",9,"摻",6,"撃撆撈",8,"撓撔撗撘撚撛撜撝撟",4,"撥撦撧撨撪撫撯撱撲撳撴撶撹撻撽撾撿擁擃擄擆",6,"擏擑擓擔擕擖擙據"],["9440","擛擜擝擟擠擡擣擥擧",24,"攁",7,"攊",7,"攓",4,"攙",8],["9480","攢攣攤攦",4,"攬攭攰攱攲攳攷攺攼攽敀",4,"敆敇敊敋敍敎敐敒敓敔敗敘敚敜敟敠敡敤敥敧敨敩敪敭敮敯敱敳敵敶數",14,"斈斉斊斍斎斏斒斔斕斖斘斚斝斞斠斢斣斦斨斪斬斮斱",7,"斺斻斾斿旀旂旇旈旉旊旍旐旑旓旔旕旘",7,"旡旣旤旪旫"],["9540","旲旳旴旵旸旹旻",4,"昁昄昅昇昈昉昋昍昐昑昒昖昗昘昚昛昜昞昡昢昣昤昦昩昪昫昬昮昰昲昳昷",4,"昽昿晀時晄",6,"晍晎晐晑晘"],["9580","晙晛晜晝晞晠晢晣晥晧晩",4,"晱晲晳晵晸晹晻晼晽晿暀暁暃暅暆暈暉暊暋暍暎暏暐暒暓暔暕暘",4,"暞",8,"暩",4,"暯",4,"暵暶暷暸暺暻暼暽暿",25,"曚曞",7,"曧曨曪",5,"曱曵曶書曺曻曽朁朂會"],["9640","朄朅朆朇朌朎朏朑朒朓朖朘朙朚朜朞朠",5,"朧朩朮朰朲朳朶朷朸朹朻朼朾朿杁杄杅杇杊杋杍杒杔杕杗",4,"杝杢杣杤杦杧杫杬杮東杴杶"],["9680","杸杹杺杻杽枀枂枃枅枆枈枊枌枍枎枏枑枒枓枔枖枙枛枟枠枡枤枦枩枬枮枱枲枴枹",7,"柂柅",9,"柕柖柗柛柟柡柣柤柦柧柨柪柫柭柮柲柵",7,"柾栁栂栃栄栆栍栐栒栔栕栘",4,"栞栟栠栢",6,"栫",6,"栴栵栶栺栻栿桇桋桍桏桒桖",5],["9740","桜桝桞桟桪桬",7,"桵桸",8,"梂梄梇",7,"梐梑梒梔梕梖梘",9,"梣梤梥梩梪梫梬梮梱梲梴梶梷梸"],["9780","梹",6,"棁棃",5,"棊棌棎棏棐棑棓棔棖棗棙棛",4,"棡棢棤",9,"棯棲棳棴棶棷棸棻棽棾棿椀椂椃椄椆",4,"椌椏椑椓",11,"椡椢椣椥",7,"椮椯椱椲椳椵椶椷椸椺椻椼椾楀楁楃",16,"楕楖楘楙楛楜楟"],["9840","楡楢楤楥楧楨楩楪楬業楯楰楲",4,"楺楻楽楾楿榁榃榅榊榋榌榎",5,"榖榗榙榚榝",9,"榩榪榬榮榯榰榲榳榵榶榸榹榺榼榽"],["9880","榾榿槀槂",7,"構槍槏槑槒槓槕",5,"槜槝槞槡",11,"槮槯槰槱槳",9,"槾樀",9,"樋",11,"標",5,"樠樢",5,"権樫樬樭樮樰樲樳樴樶",6,"樿",4,"橅橆橈",7,"橑",6,"橚"],["9940","橜",4,"橢橣橤橦",10,"橲",6,"橺橻橽橾橿檁檂檃檅",8,"檏檒",4,"檘",7,"檡",5],["9980","檧檨檪檭",114,"欥欦欨",6],["9a40","欯欰欱欳欴欵欶欸欻欼欽欿歀歁歂歄歅歈歊歋歍",11,"歚",7,"歨歩歫",13,"歺歽歾歿殀殅殈"],["9a80","殌殎殏殐殑殔殕殗殘殙殜",4,"殢",7,"殫",7,"殶殸",6,"毀毃毄毆",4,"毌毎毐毑毘毚毜",4,"毢",7,"毬毭毮毰毱毲毴毶毷毸毺毻毼毾",6,"氈",4,"氎氒気氜氝氞氠氣氥氫氬氭氱氳氶氷氹氺氻氼氾氿汃汄汅汈汋",4,"汑汒汓汖汘"],["9b40","汙汚汢汣汥汦汧汫",4,"汱汳汵汷汸決汻汼汿沀沄沇沊沋沍沎沑沒沕沖沗沘沚沜沝沞沠沢沨沬沯沰沴沵沶沷沺泀況泂泃泆泇泈泋泍泎泏泑泒泘"],["9b80","泙泚泜泝泟泤泦泧泩泬泭泲泴泹泿洀洂洃洅洆洈洉洊洍洏洐洑洓洔洕洖洘洜洝洟",5,"洦洨洩洬洭洯洰洴洶洷洸洺洿浀浂浄浉浌浐浕浖浗浘浛浝浟浡浢浤浥浧浨浫浬浭浰浱浲浳浵浶浹浺浻浽",4,"涃涄涆涇涊涋涍涏涐涒涖",4,"涜涢涥涬涭涰涱涳涴涶涷涹",5,"淁淂淃淈淉淊"],["9c40","淍淎淏淐淒淓淔淕淗淚淛淜淟淢淣淥淧淨淩淪淭淯淰淲淴淵淶淸淺淽",7,"渆渇済渉渋渏渒渓渕渘渙減渜渞渟渢渦渧渨渪測渮渰渱渳渵"],["9c80","渶渷渹渻",7,"湅",7,"湏湐湑湒湕湗湙湚湜湝湞湠",10,"湬湭湯",14,"満溁溂溄溇溈溊",4,"溑",6,"溙溚溛溝溞溠溡溣溤溦溨溩溫溬溭溮溰溳溵溸溹溼溾溿滀滃滄滅滆滈滉滊滌滍滎滐滒滖滘滙滛滜滝滣滧滪",5],["9d40","滰滱滲滳滵滶滷滸滺",7,"漃漄漅漇漈漊",4,"漐漑漒漖",9,"漡漢漣漥漦漧漨漬漮漰漲漴漵漷",6,"漿潀潁潂"],["9d80","潃潄潅潈潉潊潌潎",9,"潙潚潛潝潟潠潡潣潤潥潧",5,"潯潰潱潳潵潶潷潹潻潽",6,"澅澆澇澊澋澏",12,"澝澞澟澠澢",4,"澨",10,"澴澵澷澸澺",5,"濁濃",5,"濊",6,"濓",10,"濟濢濣濤濥"],["9e40","濦",7,"濰",32,"瀒",7,"瀜",6,"瀤",6],["9e80","瀫",9,"瀶瀷瀸瀺",17,"灍灎灐",13,"灟",11,"灮灱灲灳灴灷灹灺灻災炁炂炃炄炆炇炈炋炌炍炏炐炑炓炗炘炚炛炞",12,"炰炲炴炵炶為炾炿烄烅烆烇烉烋",12,"烚"],["9f40","烜烝烞烠烡烢烣烥烪烮烰",6,"烸烺烻烼烾",10,"焋",4,"焑焒焔焗焛",10,"焧",7,"焲焳焴"],["9f80","焵焷",13,"煆煇煈煉煋煍煏",12,"煝煟",4,"煥煩",4,"煯煰煱煴煵煶煷煹煻煼煾",5,"熅",4,"熋熌熍熎熐熑熒熓熕熖熗熚",4,"熡",6,"熩熪熫熭",5,"熴熶熷熸熺",8,"燄",9,"燏",4],["a040","燖",9,"燡燢燣燤燦燨",5,"燯",9,"燺",11,"爇",19],["a080","爛爜爞",9,"爩爫爭爮爯爲爳爴爺爼爾牀",6,"牉牊牋牎牏牐牑牓牔牕牗牘牚牜牞牠牣牤牥牨牪牫牬牭牰牱牳牴牶牷牸牻牼牽犂犃犅",4,"犌犎犐犑犓",11,"犠",11,"犮犱犲犳犵犺",6,"狅狆狇狉狊狋狌狏狑狓狔狕狖狘狚狛"],["a1a1","　、。\xb7ˉˇ\xa8〃々—～‖…‘’“”〔〕〈",7,"〖〗【】\xb1\xd7\xf7∶∧∨∑∏∪∩∈∷√⊥∥∠⌒⊙∫∮≡≌≈∽∝≠≮≯≤≥∞∵∴♂♀\xb0′″℃＄\xa4￠￡‰\xa7№☆★○●◎◇◆□■△▲※→←↑↓〓"],["a2a1","ⅰ",9],["a2b1","⒈",19,"⑴",19,"①",9],["a2e5","㈠",9],["a2f1","Ⅰ",11],["a3a1","！＂＃￥％",88,"￣"],["a4a1","ぁ",82],["a5a1","ァ",85],["a6a1","Α",16,"Σ",6],["a6c1","α",16,"σ",6],["a6e0","︵︶︹︺︿﹀︽︾﹁﹂﹃﹄"],["a6ee","︻︼︷︸︱"],["a6f4","︳︴"],["a7a1","А",5,"ЁЖ",25],["a7d1","а",5,"ёж",25],["a840","ˊˋ˙–―‥‵℅℉↖↗↘↙∕∟∣≒≦≧⊿═",35,"▁",6],["a880","█",7,"▓▔▕▼▽◢◣◤◥☉⊕〒〝〞"],["a8a1","ā\xe1ǎ\xe0ē\xe9ě\xe8ī\xedǐ\xecō\xf3ǒ\xf2ū\xfaǔ\xf9ǖǘǚǜ\xfc\xeaɑ"],["a8bd","ńň"],["a8c0","ɡ"],["a8c5","ㄅ",36],["a940","〡",8,"㊣㎎㎏㎜㎝㎞㎡㏄㏎㏑㏒㏕︰￢￤"],["a959","℡㈱"],["a95c","‐"],["a960","ー゛゜ヽヾ〆ゝゞ﹉",9,"﹔﹕﹖﹗﹙",8],["a980","﹢",4,"﹨﹩﹪﹫"],["a996","〇"],["a9a4","─",75],["aa40","狜狝狟狢",5,"狪狫狵狶狹狽狾狿猀猂猄",5,"猋猌猍猏猐猑猒猔猘猙猚猟猠猣猤猦猧猨猭猯猰猲猳猵猶猺猻猼猽獀",8],["aa80","獉獊獋獌獎獏獑獓獔獕獖獘",7,"獡",10,"獮獰獱"],["ab40","獲",11,"獿",4,"玅玆玈玊玌玍玏玐玒玓玔玕玗玘玙玚玜玝玞玠玡玣",5,"玪玬玭玱玴玵玶玸玹玼玽玾玿珁珃",4],["ab80","珋珌珎珒",6,"珚珛珜珝珟珡珢珣珤珦珨珪珫珬珮珯珰珱珳",4],["ac40","珸",10,"琄琇琈琋琌琍琎琑",8,"琜",5,"琣琤琧琩琫琭琯琱琲琷",4,"琽琾琿瑀瑂",11],["ac80","瑎",6,"瑖瑘瑝瑠",12,"瑮瑯瑱",4,"瑸瑹瑺"],["ad40","瑻瑼瑽瑿璂璄璅璆璈璉璊璌璍璏璑",10,"璝璟",7,"璪",15,"璻",12],["ad80","瓈",9,"瓓",8,"瓝瓟瓡瓥瓧",6,"瓰瓱瓲"],["ae40","瓳瓵瓸",6,"甀甁甂甃甅",7,"甎甐甒甔甕甖甗甛甝甞甠",4,"甦甧甪甮甴甶甹甼甽甿畁畂畃畄畆畇畉畊畍畐畑畒畓畕畖畗畘"],["ae80","畝",7,"畧畨畩畫",6,"畳畵當畷畺",4,"疀疁疂疄疅疇"],["af40","疈疉疊疌疍疎疐疓疕疘疛疜疞疢疦",4,"疭疶疷疺疻疿痀痁痆痋痌痎痏痐痑痓痗痙痚痜痝痟痠痡痥痩痬痭痮痯痲痳痵痶痷痸痺痻痽痾瘂瘄瘆瘇"],["af80","瘈瘉瘋瘍瘎瘏瘑瘒瘓瘔瘖瘚瘜瘝瘞瘡瘣瘧瘨瘬瘮瘯瘱瘲瘶瘷瘹瘺瘻瘽癁療癄"],["b040","癅",6,"癎",5,"癕癗",4,"癝癟癠癡癢癤",6,"癬癭癮癰",7,"癹発發癿皀皁皃皅皉皊皌皍皏皐皒皔皕皗皘皚皛"],["b080","皜",7,"皥",8,"皯皰皳皵",9,"盀盁盃啊阿埃挨哎唉哀皑癌蔼矮艾碍爱隘鞍氨安俺按暗岸胺案肮昂盎凹敖熬翱袄傲奥懊澳芭捌扒叭吧笆八疤巴拔跋靶把耙坝霸罢爸白柏百摆佰败拜稗斑班搬扳般颁板版扮拌伴瓣半办绊邦帮梆榜膀绑棒磅蚌镑傍谤苞胞包褒剥"],["b140","盄盇盉盋盌盓盕盙盚盜盝盞盠",4,"盦",7,"盰盳盵盶盷盺盻盽盿眀眂眃眅眆眊県眎",10,"眛眜眝眞眡眣眤眥眧眪眫"],["b180","眬眮眰",4,"眹眻眽眾眿睂睄睅睆睈",7,"睒",7,"睜薄雹保堡饱宝抱报暴豹鲍爆杯碑悲卑北辈背贝钡倍狈备惫焙被奔苯本笨崩绷甭泵蹦迸逼鼻比鄙笔彼碧蓖蔽毕毙毖币庇痹闭敝弊必辟壁臂避陛鞭边编贬扁便变卞辨辩辫遍标彪膘表鳖憋别瘪彬斌濒滨宾摈兵冰柄丙秉饼炳"],["b240","睝睞睟睠睤睧睩睪睭",11,"睺睻睼瞁瞂瞃瞆",5,"瞏瞐瞓",11,"瞡瞣瞤瞦瞨瞫瞭瞮瞯瞱瞲瞴瞶",4],["b280","瞼瞾矀",12,"矎",8,"矘矙矚矝",4,"矤病并玻菠播拨钵波博勃搏铂箔伯帛舶脖膊渤泊驳捕卜哺补埠不布步簿部怖擦猜裁材才财睬踩采彩菜蔡餐参蚕残惭惨灿苍舱仓沧藏操糙槽曹草厕策侧册测层蹭插叉茬茶查碴搽察岔差诧拆柴豺搀掺蝉馋谗缠铲产阐颤昌猖"],["b340","矦矨矪矯矰矱矲矴矵矷矹矺矻矼砃",5,"砊砋砎砏砐砓砕砙砛砞砠砡砢砤砨砪砫砮砯砱砲砳砵砶砽砿硁硂硃硄硆硈硉硊硋硍硏硑硓硔硘硙硚"],["b380","硛硜硞",11,"硯",7,"硸硹硺硻硽",6,"场尝常长偿肠厂敞畅唱倡超抄钞朝嘲潮巢吵炒车扯撤掣彻澈郴臣辰尘晨忱沉陈趁衬撑称城橙成呈乘程惩澄诚承逞骋秤吃痴持匙池迟弛驰耻齿侈尺赤翅斥炽充冲虫崇宠抽酬畴踌稠愁筹仇绸瞅丑臭初出橱厨躇锄雏滁除楚"],["b440","碄碅碆碈碊碋碏碐碒碔碕碖碙碝碞碠碢碤碦碨",7,"碵碶碷碸確碻碼碽碿磀磂磃磄磆磇磈磌磍磎磏磑磒磓磖磗磘磚",9],["b480","磤磥磦磧磩磪磫磭",4,"磳磵磶磸磹磻",5,"礂礃礄礆",6,"础储矗搐触处揣川穿椽传船喘串疮窗幢床闯创吹炊捶锤垂春椿醇唇淳纯蠢戳绰疵茨磁雌辞慈瓷词此刺赐次聪葱囱匆从丛凑粗醋簇促蹿篡窜摧崔催脆瘁粹淬翠村存寸磋撮搓措挫错搭达答瘩打大呆歹傣戴带殆代贷袋待逮"],["b540","礍",5,"礔",9,"礟",4,"礥",14,"礵",4,"礽礿祂祃祄祅祇祊",8,"祔祕祘祙祡祣"],["b580","祤祦祩祪祫祬祮祰",6,"祹祻",4,"禂禃禆禇禈禉禋禌禍禎禐禑禒怠耽担丹单郸掸胆旦氮但惮淡诞弹蛋当挡党荡档刀捣蹈倒岛祷导到稻悼道盗德得的蹬灯登等瞪凳邓堤低滴迪敌笛狄涤翟嫡抵底地蒂第帝弟递缔颠掂滇碘点典靛垫电佃甸店惦奠淀殿碉叼雕凋刁掉吊钓调跌爹碟蝶迭谍叠"],["b640","禓",6,"禛",11,"禨",10,"禴",4,"禼禿秂秄秅秇秈秊秌秎秏秐秓秔秖秗秙",5,"秠秡秢秥秨秪"],["b680","秬秮秱",6,"秹秺秼秾秿稁稄稅稇稈稉稊稌稏",4,"稕稖稘稙稛稜丁盯叮钉顶鼎锭定订丢东冬董懂动栋侗恫冻洞兜抖斗陡豆逗痘都督毒犊独读堵睹赌杜镀肚度渡妒端短锻段断缎堆兑队对墩吨蹲敦顿囤钝盾遁掇哆多夺垛躲朵跺舵剁惰堕蛾峨鹅俄额讹娥恶厄扼遏鄂饿恩而儿耳尔饵洱二"],["b740","稝稟稡稢稤",14,"稴稵稶稸稺稾穀",5,"穇",9,"穒",4,"穘",16],["b780","穩",6,"穱穲穳穵穻穼穽穾窂窅窇窉窊窋窌窎窏窐窓窔窙窚窛窞窡窢贰发罚筏伐乏阀法珐藩帆番翻樊矾钒繁凡烦反返范贩犯饭泛坊芳方肪房防妨仿访纺放菲非啡飞肥匪诽吠肺废沸费芬酚吩氛分纷坟焚汾粉奋份忿愤粪丰封枫蜂峰锋风疯烽逢冯缝讽奉凤佛否夫敷肤孵扶拂辐幅氟符伏俘服"],["b840","窣窤窧窩窪窫窮",4,"窴",10,"竀",10,"竌",9,"竗竘竚竛竜竝竡竢竤竧",5,"竮竰竱竲竳"],["b880","竴",4,"竻竼竾笀笁笂笅笇笉笌笍笎笐笒笓笖笗笘笚笜笝笟笡笢笣笧笩笭浮涪福袱弗甫抚辅俯釜斧脯腑府腐赴副覆赋复傅付阜父腹负富讣附妇缚咐噶嘎该改概钙盖溉干甘杆柑竿肝赶感秆敢赣冈刚钢缸肛纲岗港杠篙皋高膏羔糕搞镐稿告哥歌搁戈鸽胳疙割革葛格蛤阁隔铬个各给根跟耕更庚羹"],["b940","笯笰笲笴笵笶笷笹笻笽笿",5,"筆筈筊筍筎筓筕筗筙筜筞筟筡筣",10,"筯筰筳筴筶筸筺筼筽筿箁箂箃箄箆",6,"箎箏"],["b980","箑箒箓箖箘箙箚箛箞箟箠箣箤箥箮箯箰箲箳箵箶箷箹",7,"篂篃範埂耿梗工攻功恭龚供躬公宫弓巩汞拱贡共钩勾沟苟狗垢构购够辜菇咕箍估沽孤姑鼓古蛊骨谷股故顾固雇刮瓜剐寡挂褂乖拐怪棺关官冠观管馆罐惯灌贯光广逛瑰规圭硅归龟闺轨鬼诡癸桂柜跪贵刽辊滚棍锅郭国果裹过哈"],["ba40","篅篈築篊篋篍篎篏篐篒篔",4,"篛篜篞篟篠篢篣篤篧篨篩篫篬篭篯篰篲",4,"篸篹篺篻篽篿",7,"簈簉簊簍簎簐",5,"簗簘簙"],["ba80","簚",4,"簠",5,"簨簩簫",12,"簹",5,"籂骸孩海氦亥害骇酣憨邯韩含涵寒函喊罕翰撼捍旱憾悍焊汗汉夯杭航壕嚎豪毫郝好耗号浩呵喝荷菏核禾和何合盒貉阂河涸赫褐鹤贺嘿黑痕很狠恨哼亨横衡恒轰哄烘虹鸿洪宏弘红喉侯猴吼厚候后呼乎忽瑚壶葫胡蝴狐糊湖"],["bb40","籃",9,"籎",36,"籵",5,"籾",9],["bb80","粈粊",6,"粓粔粖粙粚粛粠粡粣粦粧粨粩粫粬粭粯粰粴",4,"粺粻弧虎唬护互沪户花哗华猾滑画划化话槐徊怀淮坏欢环桓还缓换患唤痪豢焕涣宦幻荒慌黄磺蝗簧皇凰惶煌晃幌恍谎灰挥辉徽恢蛔回毁悔慧卉惠晦贿秽会烩汇讳诲绘荤昏婚魂浑混豁活伙火获或惑霍货祸击圾基机畸稽积箕"],["bc40","粿糀糂糃糄糆糉糋糎",6,"糘糚糛糝糞糡",6,"糩",5,"糰",7,"糹糺糼",13,"紋",5],["bc80","紑",14,"紡紣紤紥紦紨紩紪紬紭紮細",6,"肌饥迹激讥鸡姬绩缉吉极棘辑籍集及急疾汲即嫉级挤几脊己蓟技冀季伎祭剂悸济寄寂计记既忌际妓继纪嘉枷夹佳家加荚颊贾甲钾假稼价架驾嫁歼监坚尖笺间煎兼肩艰奸缄茧检柬碱硷拣捡简俭剪减荐槛鉴践贱见键箭件"],["bd40","紷",54,"絯",7],["bd80","絸",32,"健舰剑饯渐溅涧建僵姜将浆江疆蒋桨奖讲匠酱降蕉椒礁焦胶交郊浇骄娇嚼搅铰矫侥脚狡角饺缴绞剿教酵轿较叫窖揭接皆秸街阶截劫节桔杰捷睫竭洁结解姐戒藉芥界借介疥诫届巾筋斤金今津襟紧锦仅谨进靳晋禁近烬浸"],["be40","継",12,"綧",6,"綯",42],["be80","線",32,"尽劲荆兢茎睛晶鲸京惊精粳经井警景颈静境敬镜径痉靖竟竞净炯窘揪究纠玖韭久灸九酒厩救旧臼舅咎就疚鞠拘狙疽居驹菊局咀矩举沮聚拒据巨具距踞锯俱句惧炬剧捐鹃娟倦眷卷绢撅攫抉掘倔爵觉决诀绝均菌钧军君峻"],["bf40","緻",62],["bf80","縺縼",4,"繂",4,"繈",21,"俊竣浚郡骏喀咖卡咯开揩楷凯慨刊堪勘坎砍看康慷糠扛抗亢炕考拷烤靠坷苛柯棵磕颗科壳咳可渴克刻客课肯啃垦恳坑吭空恐孔控抠口扣寇枯哭窟苦酷库裤夸垮挎跨胯块筷侩快宽款匡筐狂框矿眶旷况亏盔岿窥葵奎魁傀"],["c040","繞",35,"纃",23,"纜纝纞"],["c080","纮纴纻纼绖绤绬绹缊缐缞缷缹缻",6,"罃罆",9,"罒罓馈愧溃坤昆捆困括扩廓阔垃拉喇蜡腊辣啦莱来赖蓝婪栏拦篮阑兰澜谰揽览懒缆烂滥琅榔狼廊郎朗浪捞劳牢老佬姥酪烙涝勒乐雷镭蕾磊累儡垒擂肋类泪棱楞冷厘梨犁黎篱狸离漓理李里鲤礼莉荔吏栗丽厉励砾历利傈例俐"],["c140","罖罙罛罜罝罞罠罣",4,"罫罬罭罯罰罳罵罶罷罸罺罻罼罽罿羀羂",7,"羋羍羏",4,"羕",4,"羛羜羠羢羣羥羦羨",6,"羱"],["c180","羳",4,"羺羻羾翀翂翃翄翆翇翈翉翋翍翏",4,"翖翗翙",5,"翢翣痢立粒沥隶力璃哩俩联莲连镰廉怜涟帘敛脸链恋炼练粮凉梁粱良两辆量晾亮谅撩聊僚疗燎寥辽潦了撂镣廖料列裂烈劣猎琳林磷霖临邻鳞淋凛赁吝拎玲菱零龄铃伶羚凌灵陵岭领另令溜琉榴硫馏留刘瘤流柳六龙聋咙笼窿"],["c240","翤翧翨翪翫翬翭翯翲翴",6,"翽翾翿耂耇耈耉耊耎耏耑耓耚耛耝耞耟耡耣耤耫",5,"耲耴耹耺耼耾聀聁聄聅聇聈聉聎聏聐聑聓聕聖聗"],["c280","聙聛",13,"聫",5,"聲",11,"隆垄拢陇楼娄搂篓漏陋芦卢颅庐炉掳卤虏鲁麓碌露路赂鹿潞禄录陆戮驴吕铝侣旅履屡缕虑氯律率滤绿峦挛孪滦卵乱掠略抡轮伦仑沦纶论萝螺罗逻锣箩骡裸落洛骆络妈麻玛码蚂马骂嘛吗埋买麦卖迈脉瞒馒蛮满蔓曼慢漫"],["c340","聾肁肂肅肈肊肍",5,"肔肕肗肙肞肣肦肧肨肬肰肳肵肶肸肹肻胅胇",4,"胏",6,"胘胟胠胢胣胦胮胵胷胹胻胾胿脀脁脃脄脅脇脈脋"],["c380","脌脕脗脙脛脜脝脟",12,"脭脮脰脳脴脵脷脹",4,"脿谩芒茫盲氓忙莽猫茅锚毛矛铆卯茂冒帽貌贸么玫枚梅酶霉煤没眉媒镁每美昧寐妹媚门闷们萌蒙檬盟锰猛梦孟眯醚靡糜迷谜弥米秘觅泌蜜密幂棉眠绵冕免勉娩缅面苗描瞄藐秒渺庙妙蔑灭民抿皿敏悯闽明螟鸣铭名命谬摸"],["c440","腀",5,"腇腉腍腎腏腒腖腗腘腛",4,"腡腢腣腤腦腨腪腫腬腯腲腳腵腶腷腸膁膃",4,"膉膋膌膍膎膐膒",5,"膙膚膞",4,"膤膥"],["c480","膧膩膫",7,"膴",5,"膼膽膾膿臄臅臇臈臉臋臍",6,"摹蘑模膜磨摩魔抹末莫墨默沫漠寞陌谋牟某拇牡亩姆母墓暮幕募慕木目睦牧穆拿哪呐钠那娜纳氖乃奶耐奈南男难囊挠脑恼闹淖呢馁内嫩能妮霓倪泥尼拟你匿腻逆溺蔫拈年碾撵捻念娘酿鸟尿捏聂孽啮镊镍涅您柠狞凝宁"],["c540","臔",14,"臤臥臦臨臩臫臮",4,"臵",5,"臽臿舃與",4,"舎舏舑舓舕",5,"舝舠舤舥舦舧舩舮舲舺舼舽舿"],["c580","艀艁艂艃艅艆艈艊艌艍艎艐",7,"艙艛艜艝艞艠",7,"艩拧泞牛扭钮纽脓浓农弄奴努怒女暖虐疟挪懦糯诺哦欧鸥殴藕呕偶沤啪趴爬帕怕琶拍排牌徘湃派攀潘盘磐盼畔判叛乓庞旁耪胖抛咆刨炮袍跑泡呸胚培裴赔陪配佩沛喷盆砰抨烹澎彭蓬棚硼篷膨朋鹏捧碰坯砒霹批披劈琵毗"],["c640","艪艫艬艭艱艵艶艷艸艻艼芀芁芃芅芆芇芉芌芐芓芔芕芖芚芛芞芠芢芣芧芲芵芶芺芻芼芿苀苂苃苅苆苉苐苖苙苚苝苢苧苨苩苪苬苭苮苰苲苳苵苶苸"],["c680","苺苼",4,"茊茋茍茐茒茓茖茘茙茝",9,"茩茪茮茰茲茷茻茽啤脾疲皮匹痞僻屁譬篇偏片骗飘漂瓢票撇瞥拼频贫品聘乒坪苹萍平凭瓶评屏坡泼颇婆破魄迫粕剖扑铺仆莆葡菩蒲埔朴圃普浦谱曝瀑期欺栖戚妻七凄漆柒沏其棋奇歧畦崎脐齐旗祈祁骑起岂乞企启契砌器气迄弃汽泣讫掐"],["c740","茾茿荁荂荄荅荈荊",4,"荓荕",4,"荝荢荰",6,"荹荺荾",6,"莇莈莊莋莌莍莏莐莑莔莕莖莗莙莚莝莟莡",6,"莬莭莮"],["c780","莯莵莻莾莿菂菃菄菆菈菉菋菍菎菐菑菒菓菕菗菙菚菛菞菢菣菤菦菧菨菫菬菭恰洽牵扦钎铅千迁签仟谦乾黔钱钳前潜遣浅谴堑嵌欠歉枪呛腔羌墙蔷强抢橇锹敲悄桥瞧乔侨巧鞘撬翘峭俏窍切茄且怯窃钦侵亲秦琴勤芹擒禽寝沁青轻氢倾卿清擎晴氰情顷请庆琼穷秋丘邱球求囚酋泅趋区蛆曲躯屈驱渠"],["c840","菮華菳",4,"菺菻菼菾菿萀萂萅萇萈萉萊萐萒",5,"萙萚萛萞",5,"萩",7,"萲",5,"萹萺萻萾",7,"葇葈葉"],["c880","葊",6,"葒",4,"葘葝葞葟葠葢葤",4,"葪葮葯葰葲葴葷葹葻葼取娶龋趣去圈颧权醛泉全痊拳犬券劝缺炔瘸却鹊榷确雀裙群然燃冉染瓤壤攘嚷让饶扰绕惹热壬仁人忍韧任认刃妊纫扔仍日戎茸蓉荣融熔溶容绒冗揉柔肉茹蠕儒孺如辱乳汝入褥软阮蕊瑞锐闰润若弱撒洒萨腮鳃塞赛三叁"],["c940","葽",4,"蒃蒄蒅蒆蒊蒍蒏",7,"蒘蒚蒛蒝蒞蒟蒠蒢",12,"蒰蒱蒳蒵蒶蒷蒻蒼蒾蓀蓂蓃蓅蓆蓇蓈蓋蓌蓎蓏蓒蓔蓕蓗"],["c980","蓘",4,"蓞蓡蓢蓤蓧",4,"蓭蓮蓯蓱",10,"蓽蓾蔀蔁蔂伞散桑嗓丧搔骚扫嫂瑟色涩森僧莎砂杀刹沙纱傻啥煞筛晒珊苫杉山删煽衫闪陕擅赡膳善汕扇缮墒伤商赏晌上尚裳梢捎稍烧芍勺韶少哨邵绍奢赊蛇舌舍赦摄射慑涉社设砷申呻伸身深娠绅神沈审婶甚肾慎渗声生甥牲升绳"],["ca40","蔃",8,"蔍蔎蔏蔐蔒蔔蔕蔖蔘蔙蔛蔜蔝蔞蔠蔢",8,"蔭",9,"蔾",4,"蕄蕅蕆蕇蕋",10],["ca80","蕗蕘蕚蕛蕜蕝蕟",4,"蕥蕦蕧蕩",8,"蕳蕵蕶蕷蕸蕼蕽蕿薀薁省盛剩胜圣师失狮施湿诗尸虱十石拾时什食蚀实识史矢使屎驶始式示士世柿事拭誓逝势是嗜噬适仕侍释饰氏市恃室视试收手首守寿授售受瘦兽蔬枢梳殊抒输叔舒淑疏书赎孰熟薯暑曙署蜀黍鼠属术述树束戍竖墅庶数漱"],["cb40","薂薃薆薈",6,"薐",10,"薝",6,"薥薦薧薩薫薬薭薱",5,"薸薺",6,"藂",6,"藊",4,"藑藒"],["cb80","藔藖",5,"藝",6,"藥藦藧藨藪",14,"恕刷耍摔衰甩帅栓拴霜双爽谁水睡税吮瞬顺舜说硕朔烁斯撕嘶思私司丝死肆寺嗣四伺似饲巳松耸怂颂送宋讼诵搜艘擞嗽苏酥俗素速粟僳塑溯宿诉肃酸蒜算虽隋随绥髓碎岁穗遂隧祟孙损笋蓑梭唆缩琐索锁所塌他它她塔"],["cc40","藹藺藼藽藾蘀",4,"蘆",10,"蘒蘓蘔蘕蘗",15,"蘨蘪",13,"蘹蘺蘻蘽蘾蘿虀"],["cc80","虁",11,"虒虓處",4,"虛虜虝號虠虡虣",7,"獭挞蹋踏胎苔抬台泰酞太态汰坍摊贪瘫滩坛檀痰潭谭谈坦毯袒碳探叹炭汤塘搪堂棠膛唐糖倘躺淌趟烫掏涛滔绦萄桃逃淘陶讨套特藤腾疼誊梯剔踢锑提题蹄啼体替嚏惕涕剃屉天添填田甜恬舔腆挑条迢眺跳贴铁帖厅听烃"],["cd40","虭虯虰虲",6,"蚃",6,"蚎",4,"蚔蚖",5,"蚞",4,"蚥蚦蚫蚭蚮蚲蚳蚷蚸蚹蚻",4,"蛁蛂蛃蛅蛈蛌蛍蛒蛓蛕蛖蛗蛚蛜"],["cd80","蛝蛠蛡蛢蛣蛥蛦蛧蛨蛪蛫蛬蛯蛵蛶蛷蛺蛻蛼蛽蛿蜁蜄蜅蜆蜋蜌蜎蜏蜐蜑蜔蜖汀廷停亭庭挺艇通桐酮瞳同铜彤童桶捅筒统痛偷投头透凸秃突图徒途涂屠土吐兔湍团推颓腿蜕褪退吞屯臀拖托脱鸵陀驮驼椭妥拓唾挖哇蛙洼娃瓦袜歪外豌弯湾玩顽丸烷完碗挽晚皖惋宛婉万腕汪王亡枉网往旺望忘妄威"],["ce40","蜙蜛蜝蜟蜠蜤蜦蜧蜨蜪蜫蜬蜭蜯蜰蜲蜳蜵蜶蜸蜹蜺蜼蜽蝀",6,"蝊蝋蝍蝏蝐蝑蝒蝔蝕蝖蝘蝚",5,"蝡蝢蝦",7,"蝯蝱蝲蝳蝵"],["ce80","蝷蝸蝹蝺蝿螀螁螄螆螇螉螊螌螎",4,"螔螕螖螘",6,"螠",4,"巍微危韦违桅围唯惟为潍维苇萎委伟伪尾纬未蔚味畏胃喂魏位渭谓尉慰卫瘟温蚊文闻纹吻稳紊问嗡翁瓮挝蜗涡窝我斡卧握沃巫呜钨乌污诬屋无芜梧吾吴毋武五捂午舞伍侮坞戊雾晤物勿务悟误昔熙析西硒矽晰嘻吸锡牺"],["cf40","螥螦螧螩螪螮螰螱螲螴螶螷螸螹螻螼螾螿蟁",4,"蟇蟈蟉蟌",4,"蟔",6,"蟜蟝蟞蟟蟡蟢蟣蟤蟦蟧蟨蟩蟫蟬蟭蟯",9],["cf80","蟺蟻蟼蟽蟿蠀蠁蠂蠄",5,"蠋",7,"蠔蠗蠘蠙蠚蠜",4,"蠣稀息希悉膝夕惜熄烯溪汐犀檄袭席习媳喜铣洗系隙戏细瞎虾匣霞辖暇峡侠狭下厦夏吓掀锨先仙鲜纤咸贤衔舷闲涎弦嫌显险现献县腺馅羡宪陷限线相厢镶香箱襄湘乡翔祥详想响享项巷橡像向象萧硝霄削哮嚣销消宵淆晓"],["d040","蠤",13,"蠳",5,"蠺蠻蠽蠾蠿衁衂衃衆",5,"衎",5,"衕衖衘衚",6,"衦衧衪衭衯衱衳衴衵衶衸衹衺"],["d080","衻衼袀袃袆袇袉袊袌袎袏袐袑袓袔袕袗",4,"袝",4,"袣袥",5,"小孝校肖啸笑效楔些歇蝎鞋协挟携邪斜胁谐写械卸蟹懈泄泻谢屑薪芯锌欣辛新忻心信衅星腥猩惺兴刑型形邢行醒幸杏性姓兄凶胸匈汹雄熊休修羞朽嗅锈秀袖绣墟戌需虚嘘须徐许蓄酗叙旭序畜恤絮婿绪续轩喧宣悬旋玄"],["d140","袬袮袯袰袲",4,"袸袹袺袻袽袾袿裀裃裄裇裈裊裋裌裍裏裐裑裓裖裗裚",4,"裠裡裦裧裩",6,"裲裵裶裷裺裻製裿褀褁褃",5],["d180","褉褋",4,"褑褔",4,"褜",4,"褢褣褤褦褧褨褩褬褭褮褯褱褲褳褵褷选癣眩绚靴薛学穴雪血勋熏循旬询寻驯巡殉汛训讯逊迅压押鸦鸭呀丫芽牙蚜崖衙涯雅哑亚讶焉咽阉烟淹盐严研蜒岩延言颜阎炎沿奄掩眼衍演艳堰燕厌砚雁唁彦焰宴谚验殃央鸯秧杨扬佯疡羊洋阳氧仰痒养样漾邀腰妖瑶"],["d240","褸",8,"襂襃襅",24,"襠",5,"襧",19,"襼"],["d280","襽襾覀覂覄覅覇",26,"摇尧遥窑谣姚咬舀药要耀椰噎耶爷野冶也页掖业叶曳腋夜液一壹医揖铱依伊衣颐夷遗移仪胰疑沂宜姨彝椅蚁倚已乙矣以艺抑易邑屹亿役臆逸肄疫亦裔意毅忆义益溢诣议谊译异翼翌绎茵荫因殷音阴姻吟银淫寅饮尹引隐"],["d340","覢",30,"觃觍觓觔觕觗觘觙觛觝觟觠觡觢觤觧觨觩觪觬觭觮觰觱觲觴",6],["d380","觻",4,"訁",5,"計",21,"印英樱婴鹰应缨莹萤营荧蝇迎赢盈影颖硬映哟拥佣臃痈庸雍踊蛹咏泳涌永恿勇用幽优悠忧尤由邮铀犹油游酉有友右佑釉诱又幼迂淤于盂榆虞愚舆余俞逾鱼愉渝渔隅予娱雨与屿禹宇语羽玉域芋郁吁遇喻峪御愈欲狱育誉"],["d440","訞",31,"訿",8,"詉",21],["d480","詟",25,"詺",6,"浴寓裕预豫驭鸳渊冤元垣袁原援辕园员圆猿源缘远苑愿怨院曰约越跃钥岳粤月悦阅耘云郧匀陨允运蕴酝晕韵孕匝砸杂栽哉灾宰载再在咱攒暂赞赃脏葬遭糟凿藻枣早澡蚤躁噪造皂灶燥责择则泽贼怎增憎曾赠扎喳渣札轧"],["d540","誁",7,"誋",7,"誔",46],["d580","諃",32,"铡闸眨栅榨咋乍炸诈摘斋宅窄债寨瞻毡詹粘沾盏斩辗崭展蘸栈占战站湛绽樟章彰漳张掌涨杖丈帐账仗胀瘴障招昭找沼赵照罩兆肇召遮折哲蛰辙者锗蔗这浙珍斟真甄砧臻贞针侦枕疹诊震振镇阵蒸挣睁征狰争怔整拯正政"],["d640","諤",34,"謈",27],["d680","謤謥謧",30,"帧症郑证芝枝支吱蜘知肢脂汁之织职直植殖执值侄址指止趾只旨纸志挚掷至致置帜峙制智秩稚质炙痔滞治窒中盅忠钟衷终种肿重仲众舟周州洲诌粥轴肘帚咒皱宙昼骤珠株蛛朱猪诸诛逐竹烛煮拄瞩嘱主著柱助蛀贮铸筑"],["d740","譆",31,"譧",4,"譭",25],["d780","讇",24,"讬讱讻诇诐诪谉谞住注祝驻抓爪拽专砖转撰赚篆桩庄装妆撞壮状椎锥追赘坠缀谆准捉拙卓桌琢茁酌啄着灼浊兹咨资姿滋淄孜紫仔籽滓子自渍字鬃棕踪宗综总纵邹走奏揍租足卒族祖诅阻组钻纂嘴醉最罪尊遵昨左佐柞做作坐座"],["d840","谸",8,"豂豃豄豅豈豊豋豍",7,"豖豗豘豙豛",5,"豣",6,"豬",6,"豴豵豶豷豻",6,"貃貄貆貇"],["d880","貈貋貍",6,"貕貖貗貙",20,"亍丌兀丐廿卅丕亘丞鬲孬噩丨禺丿匕乇夭爻卮氐囟胤馗毓睾鼗丶亟鼐乜乩亓芈孛啬嘏仄厍厝厣厥厮靥赝匚叵匦匮匾赜卦卣刂刈刎刭刳刿剀剌剞剡剜蒯剽劂劁劐劓冂罔亻仃仉仂仨仡仫仞伛仳伢佤仵伥伧伉伫佞佧攸佚佝"],["d940","貮",62],["d980","賭",32,"佟佗伲伽佶佴侑侉侃侏佾佻侪佼侬侔俦俨俪俅俚俣俜俑俟俸倩偌俳倬倏倮倭俾倜倌倥倨偾偃偕偈偎偬偻傥傧傩傺僖儆僭僬僦僮儇儋仝氽佘佥俎龠汆籴兮巽黉馘冁夔勹匍訇匐凫夙兕亠兖亳衮袤亵脔裒禀嬴蠃羸冫冱冽冼"],["da40","贎",14,"贠赑赒赗赟赥赨赩赪赬赮赯赱赲赸",8,"趂趃趆趇趈趉趌",4,"趒趓趕",9,"趠趡"],["da80","趢趤",12,"趲趶趷趹趻趽跀跁跂跅跇跈跉跊跍跐跒跓跔凇冖冢冥讠讦讧讪讴讵讷诂诃诋诏诎诒诓诔诖诘诙诜诟诠诤诨诩诮诰诳诶诹诼诿谀谂谄谇谌谏谑谒谔谕谖谙谛谘谝谟谠谡谥谧谪谫谮谯谲谳谵谶卩卺阝阢阡阱阪阽阼陂陉陔陟陧陬陲陴隈隍隗隰邗邛邝邙邬邡邴邳邶邺"],["db40","跕跘跙跜跠跡跢跥跦跧跩跭跮跰跱跲跴跶跼跾",6,"踆踇踈踋踍踎踐踑踒踓踕",7,"踠踡踤",4,"踫踭踰踲踳踴踶踷踸踻踼踾"],["db80","踿蹃蹅蹆蹌",4,"蹓",5,"蹚",11,"蹧蹨蹪蹫蹮蹱邸邰郏郅邾郐郄郇郓郦郢郜郗郛郫郯郾鄄鄢鄞鄣鄱鄯鄹酃酆刍奂劢劬劭劾哿勐勖勰叟燮矍廴凵凼鬯厶弁畚巯坌垩垡塾墼壅壑圩圬圪圳圹圮圯坜圻坂坩垅坫垆坼坻坨坭坶坳垭垤垌垲埏垧垴垓垠埕埘埚埙埒垸埴埯埸埤埝"],["dc40","蹳蹵蹷",4,"蹽蹾躀躂躃躄躆躈",6,"躑躒躓躕",6,"躝躟",11,"躭躮躰躱躳",6,"躻",7],["dc80","軃",10,"軏",21,"堋堍埽埭堀堞堙塄堠塥塬墁墉墚墀馨鼙懿艹艽艿芏芊芨芄芎芑芗芙芫芸芾芰苈苊苣芘芷芮苋苌苁芩芴芡芪芟苄苎芤苡茉苷苤茏茇苜苴苒苘茌苻苓茑茚茆茔茕苠苕茜荑荛荜茈莒茼茴茱莛荞茯荏荇荃荟荀茗荠茭茺茳荦荥"],["dd40","軥",62],["dd80","輤",32,"荨茛荩荬荪荭荮莰荸莳莴莠莪莓莜莅荼莶莩荽莸荻莘莞莨莺莼菁萁菥菘堇萘萋菝菽菖萜萸萑萆菔菟萏萃菸菹菪菅菀萦菰菡葜葑葚葙葳蒇蒈葺蒉葸萼葆葩葶蒌蒎萱葭蓁蓍蓐蓦蒽蓓蓊蒿蒺蓠蒡蒹蒴蒗蓥蓣蔌甍蔸蓰蔹蔟蔺"],["de40","轅",32,"轪辀辌辒辝辠辡辢辤辥辦辧辪辬辭辮辯農辳辴辵辷辸辺辻込辿迀迃迆"],["de80","迉",4,"迏迒迖迗迚迠迡迣迧迬迯迱迲迴迵迶迺迻迼迾迿逇逈逌逎逓逕逘蕖蔻蓿蓼蕙蕈蕨蕤蕞蕺瞢蕃蕲蕻薤薨薇薏蕹薮薜薅薹薷薰藓藁藜藿蘧蘅蘩蘖蘼廾弈夼奁耷奕奚奘匏尢尥尬尴扌扪抟抻拊拚拗拮挢拶挹捋捃掭揶捱捺掎掴捭掬掊捩掮掼揲揸揠揿揄揞揎摒揆掾摅摁搋搛搠搌搦搡摞撄摭撖"],["df40","這逜連逤逥逧",5,"逰",4,"逷逹逺逽逿遀遃遅遆遈",4,"過達違遖遙遚遜",5,"遤遦遧適遪遫遬遯",4,"遶",6,"遾邁"],["df80","還邅邆邇邉邊邌",4,"邒邔邖邘邚邜邞邟邠邤邥邧邨邩邫邭邲邷邼邽邿郀摺撷撸撙撺擀擐擗擤擢攉攥攮弋忒甙弑卟叱叽叩叨叻吒吖吆呋呒呓呔呖呃吡呗呙吣吲咂咔呷呱呤咚咛咄呶呦咝哐咭哂咴哒咧咦哓哔呲咣哕咻咿哌哙哚哜咩咪咤哝哏哞唛哧唠哽唔哳唢唣唏唑唧唪啧喏喵啉啭啁啕唿啐唼"],["e040","郂郃郆郈郉郋郌郍郒郔郕郖郘郙郚郞郟郠郣郤郥郩郪郬郮郰郱郲郳郵郶郷郹郺郻郼郿鄀鄁鄃鄅",19,"鄚鄛鄜"],["e080","鄝鄟鄠鄡鄤",10,"鄰鄲",6,"鄺",8,"酄唷啖啵啶啷唳唰啜喋嗒喃喱喹喈喁喟啾嗖喑啻嗟喽喾喔喙嗪嗷嗉嘟嗑嗫嗬嗔嗦嗝嗄嗯嗥嗲嗳嗌嗍嗨嗵嗤辔嘞嘈嘌嘁嘤嘣嗾嘀嘧嘭噘嘹噗嘬噍噢噙噜噌噔嚆噤噱噫噻噼嚅嚓嚯囔囗囝囡囵囫囹囿圄圊圉圜帏帙帔帑帱帻帼"],["e140","酅酇酈酑酓酔酕酖酘酙酛酜酟酠酦酧酨酫酭酳酺酻酼醀",4,"醆醈醊醎醏醓",6,"醜",5,"醤",5,"醫醬醰醱醲醳醶醷醸醹醻"],["e180","醼",10,"釈釋釐釒",9,"針",8,"帷幄幔幛幞幡岌屺岍岐岖岈岘岙岑岚岜岵岢岽岬岫岱岣峁岷峄峒峤峋峥崂崃崧崦崮崤崞崆崛嵘崾崴崽嵬嵛嵯嵝嵫嵋嵊嵩嵴嶂嶙嶝豳嶷巅彳彷徂徇徉後徕徙徜徨徭徵徼衢彡犭犰犴犷犸狃狁狎狍狒狨狯狩狲狴狷猁狳猃狺"],["e240","釦",62],["e280","鈥",32,"狻猗猓猡猊猞猝猕猢猹猥猬猸猱獐獍獗獠獬獯獾舛夥飧夤夂饣饧",5,"饴饷饽馀馄馇馊馍馐馑馓馔馕庀庑庋庖庥庠庹庵庾庳赓廒廑廛廨廪膺忄忉忖忏怃忮怄忡忤忾怅怆忪忭忸怙怵怦怛怏怍怩怫怊怿怡恸恹恻恺恂"],["e340","鉆",45,"鉵",16],["e380","銆",7,"銏",24,"恪恽悖悚悭悝悃悒悌悛惬悻悱惝惘惆惚悴愠愦愕愣惴愀愎愫慊慵憬憔憧憷懔懵忝隳闩闫闱闳闵闶闼闾阃阄阆阈阊阋阌阍阏阒阕阖阗阙阚丬爿戕氵汔汜汊沣沅沐沔沌汨汩汴汶沆沩泐泔沭泷泸泱泗沲泠泖泺泫泮沱泓泯泾"],["e440","銨",5,"銯",24,"鋉",31],["e480","鋩",32,"洹洧洌浃浈洇洄洙洎洫浍洮洵洚浏浒浔洳涑浯涞涠浞涓涔浜浠浼浣渚淇淅淞渎涿淠渑淦淝淙渖涫渌涮渫湮湎湫溲湟溆湓湔渲渥湄滟溱溘滠漭滢溥溧溽溻溷滗溴滏溏滂溟潢潆潇漤漕滹漯漶潋潴漪漉漩澉澍澌潸潲潼潺濑"],["e540","錊",51,"錿",10],["e580","鍊",31,"鍫濉澧澹澶濂濡濮濞濠濯瀚瀣瀛瀹瀵灏灞宀宄宕宓宥宸甯骞搴寤寮褰寰蹇謇辶迓迕迥迮迤迩迦迳迨逅逄逋逦逑逍逖逡逵逶逭逯遄遑遒遐遨遘遢遛暹遴遽邂邈邃邋彐彗彖彘尻咫屐屙孱屣屦羼弪弩弭艴弼鬻屮妁妃妍妩妪妣"],["e640","鍬",34,"鎐",27],["e680","鎬",29,"鏋鏌鏍妗姊妫妞妤姒妲妯姗妾娅娆姝娈姣姘姹娌娉娲娴娑娣娓婀婧婊婕娼婢婵胬媪媛婷婺媾嫫媲嫒嫔媸嫠嫣嫱嫖嫦嫘嫜嬉嬗嬖嬲嬷孀尕尜孚孥孳孑孓孢驵驷驸驺驿驽骀骁骅骈骊骐骒骓骖骘骛骜骝骟骠骢骣骥骧纟纡纣纥纨纩"],["e740","鏎",7,"鏗",54],["e780","鐎",32,"纭纰纾绀绁绂绉绋绌绐绔绗绛绠绡绨绫绮绯绱绲缍绶绺绻绾缁缂缃缇缈缋缌缏缑缒缗缙缜缛缟缡",6,"缪缫缬缭缯",4,"缵幺畿巛甾邕玎玑玮玢玟珏珂珑玷玳珀珉珈珥珙顼琊珩珧珞玺珲琏琪瑛琦琥琨琰琮琬"],["e840","鐯",14,"鐿",43,"鑬鑭鑮鑯"],["e880","鑰",20,"钑钖钘铇铏铓铔铚铦铻锜锠琛琚瑁瑜瑗瑕瑙瑷瑭瑾璜璎璀璁璇璋璞璨璩璐璧瓒璺韪韫韬杌杓杞杈杩枥枇杪杳枘枧杵枨枞枭枋杷杼柰栉柘栊柩枰栌柙枵柚枳柝栀柃枸柢栎柁柽栲栳桠桡桎桢桄桤梃栝桕桦桁桧桀栾桊桉栩梵梏桴桷梓桫棂楮棼椟椠棹"],["e940","锧锳锽镃镈镋镕镚镠镮镴镵長",7,"門",42],["e980","閫",32,"椤棰椋椁楗棣椐楱椹楠楂楝榄楫榀榘楸椴槌榇榈槎榉楦楣楹榛榧榻榫榭槔榱槁槊槟榕槠榍槿樯槭樗樘橥槲橄樾檠橐橛樵檎橹樽樨橘橼檑檐檩檗檫猷獒殁殂殇殄殒殓殍殚殛殡殪轫轭轱轲轳轵轶轸轷轹轺轼轾辁辂辄辇辋"],["ea40","闌",27,"闬闿阇阓阘阛阞阠阣",6,"阫阬阭阯阰阷阸阹阺阾陁陃陊陎陏陑陒陓陖陗"],["ea80","陘陙陚陜陝陞陠陣陥陦陫陭",4,"陳陸",12,"隇隉隊辍辎辏辘辚軎戋戗戛戟戢戡戥戤戬臧瓯瓴瓿甏甑甓攴旮旯旰昊昙杲昃昕昀炅曷昝昴昱昶昵耆晟晔晁晏晖晡晗晷暄暌暧暝暾曛曜曦曩贲贳贶贻贽赀赅赆赈赉赇赍赕赙觇觊觋觌觎觏觐觑牮犟牝牦牯牾牿犄犋犍犏犒挈挲掰"],["eb40","隌階隑隒隓隕隖隚際隝",9,"隨",7,"隱隲隴隵隷隸隺隻隿雂雃雈雊雋雐雑雓雔雖",9,"雡",6,"雫"],["eb80","雬雭雮雰雱雲雴雵雸雺電雼雽雿霂霃霅霊霋霌霐霑霒霔霕霗",4,"霝霟霠搿擘耄毪毳毽毵毹氅氇氆氍氕氘氙氚氡氩氤氪氲攵敕敫牍牒牖爰虢刖肟肜肓肼朊肽肱肫肭肴肷胧胨胩胪胛胂胄胙胍胗朐胝胫胱胴胭脍脎胲胼朕脒豚脶脞脬脘脲腈腌腓腴腙腚腱腠腩腼腽腭腧塍媵膈膂膑滕膣膪臌朦臊膻"],["ec40","霡",8,"霫霬霮霯霱霳",4,"霺霻霼霽霿",18,"靔靕靗靘靚靜靝靟靣靤靦靧靨靪",7],["ec80","靲靵靷",4,"靽",7,"鞆",4,"鞌鞎鞏鞐鞓鞕鞖鞗鞙",4,"臁膦欤欷欹歃歆歙飑飒飓飕飙飚殳彀毂觳斐齑斓於旆旄旃旌旎旒旖炀炜炖炝炻烀炷炫炱烨烊焐焓焖焯焱煳煜煨煅煲煊煸煺熘熳熵熨熠燠燔燧燹爝爨灬焘煦熹戾戽扃扈扉礻祀祆祉祛祜祓祚祢祗祠祯祧祺禅禊禚禧禳忑忐"],["ed40","鞞鞟鞡鞢鞤",6,"鞬鞮鞰鞱鞳鞵",46],["ed80","韤韥韨韮",4,"韴韷",23,"怼恝恚恧恁恙恣悫愆愍慝憩憝懋懑戆肀聿沓泶淼矶矸砀砉砗砘砑斫砭砜砝砹砺砻砟砼砥砬砣砩硎硭硖硗砦硐硇硌硪碛碓碚碇碜碡碣碲碹碥磔磙磉磬磲礅磴礓礤礞礴龛黹黻黼盱眄眍盹眇眈眚眢眙眭眦眵眸睐睑睇睃睚睨"],["ee40","頏",62],["ee80","顎",32,"睢睥睿瞍睽瞀瞌瞑瞟瞠瞰瞵瞽町畀畎畋畈畛畲畹疃罘罡罟詈罨罴罱罹羁罾盍盥蠲钅钆钇钋钊钌钍钏钐钔钗钕钚钛钜钣钤钫钪钭钬钯钰钲钴钶",4,"钼钽钿铄铈",6,"铐铑铒铕铖铗铙铘铛铞铟铠铢铤铥铧铨铪"],["ef40","顯",5,"颋颎颒颕颙颣風",37,"飏飐飔飖飗飛飜飝飠",4],["ef80","飥飦飩",30,"铩铫铮铯铳铴铵铷铹铼铽铿锃锂锆锇锉锊锍锎锏锒",4,"锘锛锝锞锟锢锪锫锩锬锱锲锴锶锷锸锼锾锿镂锵镄镅镆镉镌镎镏镒镓镔镖镗镘镙镛镞镟镝镡镢镤",8,"镯镱镲镳锺矧矬雉秕秭秣秫稆嵇稃稂稞稔"],["f040","餈",4,"餎餏餑",28,"餯",26],["f080","饊",9,"饖",12,"饤饦饳饸饹饻饾馂馃馉稹稷穑黏馥穰皈皎皓皙皤瓞瓠甬鸠鸢鸨",4,"鸲鸱鸶鸸鸷鸹鸺鸾鹁鹂鹄鹆鹇鹈鹉鹋鹌鹎鹑鹕鹗鹚鹛鹜鹞鹣鹦",6,"鹱鹭鹳疒疔疖疠疝疬疣疳疴疸痄疱疰痃痂痖痍痣痨痦痤痫痧瘃痱痼痿瘐瘀瘅瘌瘗瘊瘥瘘瘕瘙"],["f140","馌馎馚",10,"馦馧馩",47],["f180","駙",32,"瘛瘼瘢瘠癀瘭瘰瘿瘵癃瘾瘳癍癞癔癜癖癫癯翊竦穸穹窀窆窈窕窦窠窬窨窭窳衤衩衲衽衿袂袢裆袷袼裉裢裎裣裥裱褚裼裨裾裰褡褙褓褛褊褴褫褶襁襦襻疋胥皲皴矜耒耔耖耜耠耢耥耦耧耩耨耱耋耵聃聆聍聒聩聱覃顸颀颃"],["f240","駺",62],["f280","騹",32,"颉颌颍颏颔颚颛颞颟颡颢颥颦虍虔虬虮虿虺虼虻蚨蚍蚋蚬蚝蚧蚣蚪蚓蚩蚶蛄蚵蛎蚰蚺蚱蚯蛉蛏蚴蛩蛱蛲蛭蛳蛐蜓蛞蛴蛟蛘蛑蜃蜇蛸蜈蜊蜍蜉蜣蜻蜞蜥蜮蜚蜾蝈蜴蜱蜩蜷蜿螂蜢蝽蝾蝻蝠蝰蝌蝮螋蝓蝣蝼蝤蝙蝥螓螯螨蟒"],["f340","驚",17,"驲骃骉骍骎骔骕骙骦骩",6,"骲骳骴骵骹骻骽骾骿髃髄髆",4,"髍髎髏髐髒體髕髖髗髙髚髛髜"],["f380","髝髞髠髢髣髤髥髧髨髩髪髬髮髰",8,"髺髼",6,"鬄鬅鬆蟆螈螅螭螗螃螫蟥螬螵螳蟋蟓螽蟑蟀蟊蟛蟪蟠蟮蠖蠓蟾蠊蠛蠡蠹蠼缶罂罄罅舐竺竽笈笃笄笕笊笫笏筇笸笪笙笮笱笠笥笤笳笾笞筘筚筅筵筌筝筠筮筻筢筲筱箐箦箧箸箬箝箨箅箪箜箢箫箴篑篁篌篝篚篥篦篪簌篾篼簏簖簋"],["f440","鬇鬉",5,"鬐鬑鬒鬔",10,"鬠鬡鬢鬤",10,"鬰鬱鬳",7,"鬽鬾鬿魀魆魊魋魌魎魐魒魓魕",5],["f480","魛",32,"簟簪簦簸籁籀臾舁舂舄臬衄舡舢舣舭舯舨舫舸舻舳舴舾艄艉艋艏艚艟艨衾袅袈裘裟襞羝羟羧羯羰羲籼敉粑粝粜粞粢粲粼粽糁糇糌糍糈糅糗糨艮暨羿翎翕翥翡翦翩翮翳糸絷綦綮繇纛麸麴赳趄趔趑趱赧赭豇豉酊酐酎酏酤"],["f540","魼",62],["f580","鮻",32,"酢酡酰酩酯酽酾酲酴酹醌醅醐醍醑醢醣醪醭醮醯醵醴醺豕鹾趸跫踅蹙蹩趵趿趼趺跄跖跗跚跞跎跏跛跆跬跷跸跣跹跻跤踉跽踔踝踟踬踮踣踯踺蹀踹踵踽踱蹉蹁蹂蹑蹒蹊蹰蹶蹼蹯蹴躅躏躔躐躜躞豸貂貊貅貘貔斛觖觞觚觜"],["f640","鯜",62],["f680","鰛",32,"觥觫觯訾謦靓雩雳雯霆霁霈霏霎霪霭霰霾龀龃龅",5,"龌黾鼋鼍隹隼隽雎雒瞿雠銎銮鋈錾鍪鏊鎏鐾鑫鱿鲂鲅鲆鲇鲈稣鲋鲎鲐鲑鲒鲔鲕鲚鲛鲞",5,"鲥",4,"鲫鲭鲮鲰",7,"鲺鲻鲼鲽鳄鳅鳆鳇鳊鳋"],["f740","鰼",62],["f780","鱻鱽鱾鲀鲃鲄鲉鲊鲌鲏鲓鲖鲗鲘鲙鲝鲪鲬鲯鲹鲾",4,"鳈鳉鳑鳒鳚鳛鳠鳡鳌",4,"鳓鳔鳕鳗鳘鳙鳜鳝鳟鳢靼鞅鞑鞒鞔鞯鞫鞣鞲鞴骱骰骷鹘骶骺骼髁髀髅髂髋髌髑魅魃魇魉魈魍魑飨餍餮饕饔髟髡髦髯髫髻髭髹鬈鬏鬓鬟鬣麽麾縻麂麇麈麋麒鏖麝麟黛黜黝黠黟黢黩黧黥黪黯鼢鼬鼯鼹鼷鼽鼾齄"],["f840","鳣",62],["f880","鴢",32],["f940","鵃",62],["f980","鶂",32],["fa40","鶣",62],["fa80","鷢",32],["fb40","鸃",27,"鸤鸧鸮鸰鸴鸻鸼鹀鹍鹐鹒鹓鹔鹖鹙鹝鹟鹠鹡鹢鹥鹮鹯鹲鹴",9,"麀"],["fb80","麁麃麄麅麆麉麊麌",5,"麔",8,"麞麠",5,"麧麨麩麪"],["fc40","麫",8,"麵麶麷麹麺麼麿",4,"黅黆黇黈黊黋黌黐黒黓黕黖黗黙黚點黡黣黤黦黨黫黬黭黮黰",8,"黺黽黿",6],["fc80","鼆",4,"鼌鼏鼑鼒鼔鼕鼖鼘鼚",5,"鼡鼣",8,"鼭鼮鼰鼱"],["fd40","鼲",4,"鼸鼺鼼鼿",4,"齅",10,"齒",38],["fd80","齹",5,"龁龂龍",11,"龜龝龞龡",4,"郎凉秊裏隣"],["fe40","兀嗀﨎﨏﨑﨓﨔礼﨟蘒﨡﨣﨤﨧﨨﨩"]]',
      );
    },
    56299(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '[["a140","",62],["a180","",32],["a240","",62],["a280","",32],["a2ab","",5],["a2e3","€"],["a2ef",""],["a2fd",""],["a340","",62],["a380","",31,"　"],["a440","",62],["a480","",32],["a4f4","",10],["a540","",62],["a580","",32],["a5f7","",7],["a640","",62],["a680","",32],["a6b9","",7],["a6d9","",6],["a6ec",""],["a6f3",""],["a6f6","",8],["a740","",62],["a780","",32],["a7c2","",14],["a7f2","",12],["a896","",10],["a8bc","ḿ"],["a8bf","ǹ"],["a8c1",""],["a8ea","",20],["a958",""],["a95b",""],["a95d",""],["a989","〾⿰",11],["a997","",12],["a9f0","",14],["aaa1","",93],["aba1","",93],["aca1","",93],["ada1","",93],["aea1","",93],["afa1","",93],["d7fa","",4],["f8a1","",93],["f9a1","",93],["faa1","",93],["fba1","",93],["fca1","",93],["fda1","",93],["fe50","⺁⺄㑳㑇⺈⺋㖞㘚㘎⺌⺗㥮㤘㧏㧟㩳㧐㭎㱮㳠⺧⺪䁖䅟⺮䌷⺳⺶⺷䎱䎬⺻䏝䓖䙡䙌"],["fe80","䜣䜩䝼䞍⻊䥇䥺䥽䦂䦃䦅䦆䦟䦛䦷䦶䲣䲟䲠䲡䱷䲢䴓",6,"䶮",93],["8135f437",""]]',
      );
    },
    64830(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '{"uChars":[128,165,169,178,184,216,226,235,238,244,248,251,253,258,276,284,300,325,329,334,364,463,465,467,469,471,473,475,477,506,594,610,712,716,730,930,938,962,970,1026,1104,1106,8209,8215,8218,8222,8231,8241,8244,8246,8252,8365,8452,8454,8458,8471,8482,8556,8570,8596,8602,8713,8720,8722,8726,8731,8737,8740,8742,8748,8751,8760,8766,8777,8781,8787,8802,8808,8816,8854,8858,8870,8896,8979,9322,9372,9548,9588,9616,9622,9634,9652,9662,9672,9676,9680,9702,9735,9738,9793,9795,11906,11909,11913,11917,11928,11944,11947,11951,11956,11960,11964,11979,12284,12292,12312,12319,12330,12351,12436,12447,12535,12543,12586,12842,12850,12964,13200,13215,13218,13253,13263,13267,13270,13384,13428,13727,13839,13851,14617,14703,14801,14816,14964,15183,15471,15585,16471,16736,17208,17325,17330,17374,17623,17997,18018,18212,18218,18301,18318,18760,18811,18814,18820,18823,18844,18848,18872,19576,19620,19738,19887,40870,59244,59336,59367,59413,59417,59423,59431,59437,59443,59452,59460,59478,59493,63789,63866,63894,63976,63986,64016,64018,64021,64025,64034,64037,64042,65074,65093,65107,65112,65127,65132,65375,65510,65536],"gbChars":[0,36,38,45,50,81,89,95,96,100,103,104,105,109,126,133,148,172,175,179,208,306,307,308,309,310,311,312,313,341,428,443,544,545,558,741,742,749,750,805,819,820,7922,7924,7925,7927,7934,7943,7944,7945,7950,8062,8148,8149,8152,8164,8174,8236,8240,8262,8264,8374,8380,8381,8384,8388,8390,8392,8393,8394,8396,8401,8406,8416,8419,8424,8437,8439,8445,8482,8485,8496,8521,8603,8936,8946,9046,9050,9063,9066,9076,9092,9100,9108,9111,9113,9131,9162,9164,9218,9219,11329,11331,11334,11336,11346,11361,11363,11366,11370,11372,11375,11389,11682,11686,11687,11692,11694,11714,11716,11723,11725,11730,11736,11982,11989,12102,12336,12348,12350,12384,12393,12395,12397,12510,12553,12851,12962,12973,13738,13823,13919,13933,14080,14298,14585,14698,15583,15847,16318,16434,16438,16481,16729,17102,17122,17315,17320,17402,17418,17859,17909,17911,17915,17916,17936,17939,17961,18664,18703,18814,18962,19043,33469,33470,33471,33484,33485,33490,33497,33501,33505,33513,33520,33536,33550,37845,37921,37948,38029,38038,38064,38065,38066,38069,38075,38076,38078,39108,39109,39113,39114,39115,39116,39265,39394,189000]}',
      );
    },
    92235(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '[["0","\\u0000",127],["8141","갂갃갅갆갋",4,"갘갞갟갡갢갣갥",6,"갮갲갳갴"],["8161","갵갶갷갺갻갽갾갿걁",9,"걌걎",5,"걕"],["8181","걖걗걙걚걛걝",18,"걲걳걵걶걹걻",4,"겂겇겈겍겎겏겑겒겓겕",6,"겞겢",5,"겫겭겮겱",6,"겺겾겿곀곂곃곅곆곇곉곊곋곍",7,"곖곘",7,"곢곣곥곦곩곫곭곮곲곴곷",4,"곾곿괁괂괃괅괇",4,"괎괐괒괓"],["8241","괔괕괖괗괙괚괛괝괞괟괡",7,"괪괫괮",5],["8261","괶괷괹괺괻괽",6,"굆굈굊",5,"굑굒굓굕굖굗"],["8281","굙",7,"굢굤",7,"굮굯굱굲굷굸굹굺굾궀궃",4,"궊궋궍궎궏궑",10,"궞",5,"궥",17,"궸",7,"귂귃귅귆귇귉",6,"귒귔",7,"귝귞귟귡귢귣귥",18],["8341","귺귻귽귾긂",5,"긊긌긎",5,"긕",7],["8361","긝",18,"긲긳긵긶긹긻긼"],["8381","긽긾긿깂깄깇깈깉깋깏깑깒깓깕깗",4,"깞깢깣깤깦깧깪깫깭깮깯깱",6,"깺깾",5,"꺆",5,"꺍",46,"꺿껁껂껃껅",6,"껎껒",5,"껚껛껝",8],["8441","껦껧껩껪껬껮",5,"껵껶껷껹껺껻껽",8],["8461","꼆꼉꼊꼋꼌꼎꼏꼑",18],["8481","꼤",7,"꼮꼯꼱꼳꼵",6,"꼾꽀꽄꽅꽆꽇꽊",5,"꽑",10,"꽞",5,"꽦",18,"꽺",5,"꾁꾂꾃꾅꾆꾇꾉",6,"꾒꾓꾔꾖",5,"꾝",26,"꾺꾻꾽꾾"],["8541","꾿꿁",5,"꿊꿌꿏",4,"꿕",6,"꿝",4],["8561","꿢",5,"꿪",5,"꿲꿳꿵꿶꿷꿹",6,"뀂뀃"],["8581","뀅",6,"뀍뀎뀏뀑뀒뀓뀕",6,"뀞",9,"뀩",26,"끆끇끉끋끍끏끐끑끒끖끘끚끛끜끞",29,"끾끿낁낂낃낅",6,"낎낐낒",5,"낛낝낞낣낤"],["8641","낥낦낧낪낰낲낶낷낹낺낻낽",6,"냆냊",5,"냒"],["8661","냓냕냖냗냙",6,"냡냢냣냤냦",10],["8681","냱",22,"넊넍넎넏넑넔넕넖넗넚넞",4,"넦넧넩넪넫넭",6,"넶넺",5,"녂녃녅녆녇녉",6,"녒녓녖녗녙녚녛녝녞녟녡",22,"녺녻녽녾녿놁놃",4,"놊놌놎놏놐놑놕놖놗놙놚놛놝"],["8741","놞",9,"놩",15],["8761","놹",18,"뇍뇎뇏뇑뇒뇓뇕"],["8781","뇖",5,"뇞뇠",7,"뇪뇫뇭뇮뇯뇱",7,"뇺뇼뇾",5,"눆눇눉눊눍",6,"눖눘눚",5,"눡",18,"눵",6,"눽",26,"뉙뉚뉛뉝뉞뉟뉡",6,"뉪",4],["8841","뉯",4,"뉶",5,"뉽",6,"늆늇늈늊",4],["8861","늏늒늓늕늖늗늛",4,"늢늤늧늨늩늫늭늮늯늱늲늳늵늶늷"],["8881","늸",15,"닊닋닍닎닏닑닓",4,"닚닜닞닟닠닡닣닧닩닪닰닱닲닶닼닽닾댂댃댅댆댇댉",6,"댒댖",5,"댝",54,"덗덙덚덝덠덡덢덣"],["8941","덦덨덪덬덭덯덲덳덵덶덷덹",6,"뎂뎆",5,"뎍"],["8961","뎎뎏뎑뎒뎓뎕",10,"뎢",5,"뎩뎪뎫뎭"],["8981","뎮",21,"돆돇돉돊돍돏돑돒돓돖돘돚돜돞돟돡돢돣돥돦돧돩",18,"돽",18,"됑",6,"됙됚됛됝됞됟됡",6,"됪됬",7,"됵",15],["8a41","둅",10,"둒둓둕둖둗둙",6,"둢둤둦"],["8a61","둧",4,"둭",18,"뒁뒂"],["8a81","뒃",4,"뒉",19,"뒞",5,"뒥뒦뒧뒩뒪뒫뒭",7,"뒶뒸뒺",5,"듁듂듃듅듆듇듉",6,"듑듒듓듔듖",5,"듞듟듡듢듥듧",4,"듮듰듲",5,"듹",26,"딖딗딙딚딝"],["8b41","딞",5,"딦딫",4,"딲딳딵딶딷딹",6,"땂땆"],["8b61","땇땈땉땊땎땏땑땒땓땕",6,"땞땢",8],["8b81","땫",52,"떢떣떥떦떧떩떬떭떮떯떲떶",4,"떾떿뗁뗂뗃뗅",6,"뗎뗒",5,"뗙",18,"뗭",18],["8c41","똀",15,"똒똓똕똖똗똙",4],["8c61","똞",6,"똦",5,"똭",6,"똵",5],["8c81","똻",12,"뙉",26,"뙥뙦뙧뙩",50,"뚞뚟뚡뚢뚣뚥",5,"뚭뚮뚯뚰뚲",16],["8d41","뛃",16,"뛕",8],["8d61","뛞",17,"뛱뛲뛳뛵뛶뛷뛹뛺"],["8d81","뛻",4,"뜂뜃뜄뜆",33,"뜪뜫뜭뜮뜱",6,"뜺뜼",7,"띅띆띇띉띊띋띍",6,"띖",9,"띡띢띣띥띦띧띩",6,"띲띴띶",5,"띾띿랁랂랃랅",6,"랎랓랔랕랚랛랝랞"],["8e41","랟랡",6,"랪랮",5,"랶랷랹",8],["8e61","럂",4,"럈럊",19],["8e81","럞",13,"럮럯럱럲럳럵",6,"럾렂",4,"렊렋렍렎렏렑",6,"렚렜렞",5,"렦렧렩렪렫렭",6,"렶렺",5,"롁롂롃롅",11,"롒롔",7,"롞롟롡롢롣롥",6,"롮롰롲",5,"롹롺롻롽",7],["8f41","뢅",7,"뢎",17],["8f61","뢠",7,"뢩",6,"뢱뢲뢳뢵뢶뢷뢹",4],["8f81","뢾뢿룂룄룆",5,"룍룎룏룑룒룓룕",7,"룞룠룢",5,"룪룫룭룮룯룱",6,"룺룼룾",5,"뤅",18,"뤙",6,"뤡",26,"뤾뤿륁륂륃륅",6,"륍륎륐륒",5],["9041","륚륛륝륞륟륡",6,"륪륬륮",5,"륶륷륹륺륻륽"],["9061","륾",5,"릆릈릋릌릏",15],["9081","릟",12,"릮릯릱릲릳릵",6,"릾맀맂",5,"맊맋맍맓",4,"맚맜맟맠맢맦맧맩맪맫맭",6,"맶맻",4,"먂",5,"먉",11,"먖",33,"먺먻먽먾먿멁멃멄멅멆"],["9141","멇멊멌멏멐멑멒멖멗멙멚멛멝",6,"멦멪",5],["9161","멲멳멵멶멷멹",9,"몆몈몉몊몋몍",5],["9181","몓",20,"몪몭몮몯몱몳",4,"몺몼몾",5,"뫅뫆뫇뫉",14,"뫚",33,"뫽뫾뫿묁묂묃묅",7,"묎묐묒",5,"묙묚묛묝묞묟묡",6],["9241","묨묪묬",7,"묷묹묺묿",4,"뭆뭈뭊뭋뭌뭎뭑뭒"],["9261","뭓뭕뭖뭗뭙",7,"뭢뭤",7,"뭭",4],["9281","뭲",21,"뮉뮊뮋뮍뮎뮏뮑",18,"뮥뮦뮧뮩뮪뮫뮭",6,"뮵뮶뮸",7,"믁믂믃믅믆믇믉",6,"믑믒믔",35,"믺믻믽믾밁"],["9341","밃",4,"밊밎밐밒밓밙밚밠밡밢밣밦밨밪밫밬밮밯밲밳밵"],["9361","밶밷밹",6,"뱂뱆뱇뱈뱊뱋뱎뱏뱑",8],["9381","뱚뱛뱜뱞",37,"벆벇벉벊벍벏",4,"벖벘벛",4,"벢벣벥벦벩",6,"벲벶",5,"벾벿볁볂볃볅",7,"볎볒볓볔볖볗볙볚볛볝",22,"볷볹볺볻볽"],["9441","볾",5,"봆봈봊",5,"봑봒봓봕",8],["9461","봞",5,"봥",6,"봭",12],["9481","봺",5,"뵁",6,"뵊뵋뵍뵎뵏뵑",6,"뵚",9,"뵥뵦뵧뵩",22,"붂붃붅붆붋",4,"붒붔붖붗붘붛붝",6,"붥",10,"붱",6,"붹",24],["9541","뷒뷓뷖뷗뷙뷚뷛뷝",11,"뷪",5,"뷱"],["9561","뷲뷳뷵뷶뷷뷹",6,"븁븂븄븆",5,"븎븏븑븒븓"],["9581","븕",6,"븞븠",35,"빆빇빉빊빋빍빏",4,"빖빘빜빝빞빟빢빣빥빦빧빩빫",4,"빲빶",4,"빾빿뺁뺂뺃뺅",6,"뺎뺒",5,"뺚",13,"뺩",14],["9641","뺸",23,"뻒뻓"],["9661","뻕뻖뻙",6,"뻡뻢뻦",5,"뻭",8],["9681","뻶",10,"뼂",5,"뼊",13,"뼚뼞",33,"뽂뽃뽅뽆뽇뽉",6,"뽒뽓뽔뽖",44],["9741","뾃",16,"뾕",8],["9761","뾞",17,"뾱",7],["9781","뾹",11,"뿆",5,"뿎뿏뿑뿒뿓뿕",6,"뿝뿞뿠뿢",89,"쀽쀾쀿"],["9841","쁀",16,"쁒",5,"쁙쁚쁛"],["9861","쁝쁞쁟쁡",6,"쁪",15],["9881","쁺",21,"삒삓삕삖삗삙",6,"삢삤삦",5,"삮삱삲삷",4,"삾샂샃샄샆샇샊샋샍샎샏샑",6,"샚샞",5,"샦샧샩샪샫샭",6,"샶샸샺",5,"섁섂섃섅섆섇섉",6,"섑섒섓섔섖",5,"섡섢섥섨섩섪섫섮"],["9941","섲섳섴섵섷섺섻섽섾섿셁",6,"셊셎",5,"셖셗"],["9961","셙셚셛셝",6,"셦셪",5,"셱셲셳셵셶셷셹셺셻"],["9981","셼",8,"솆",5,"솏솑솒솓솕솗",4,"솞솠솢솣솤솦솧솪솫솭솮솯솱",11,"솾",5,"쇅쇆쇇쇉쇊쇋쇍",6,"쇕쇖쇙",6,"쇡쇢쇣쇥쇦쇧쇩",6,"쇲쇴",7,"쇾쇿숁숂숃숅",6,"숎숐숒",5,"숚숛숝숞숡숢숣"],["9a41","숤숥숦숧숪숬숮숰숳숵",16],["9a61","쉆쉇쉉",6,"쉒쉓쉕쉖쉗쉙",6,"쉡쉢쉣쉤쉦"],["9a81","쉧",4,"쉮쉯쉱쉲쉳쉵",6,"쉾슀슂",5,"슊",5,"슑",6,"슙슚슜슞",5,"슦슧슩슪슫슮",5,"슶슸슺",33,"싞싟싡싢싥",5,"싮싰싲싳싴싵싷싺싽싾싿쌁",6,"쌊쌋쌎쌏"],["9b41","쌐쌑쌒쌖쌗쌙쌚쌛쌝",6,"쌦쌧쌪",8],["9b61","쌳",17,"썆",7],["9b81","썎",25,"썪썫썭썮썯썱썳",4,"썺썻썾",5,"쎅쎆쎇쎉쎊쎋쎍",50,"쏁",22,"쏚"],["9c41","쏛쏝쏞쏡쏣",4,"쏪쏫쏬쏮",5,"쏶쏷쏹",5],["9c61","쏿",8,"쐉",6,"쐑",9],["9c81","쐛",8,"쐥",6,"쐭쐮쐯쐱쐲쐳쐵",6,"쐾",9,"쑉",26,"쑦쑧쑩쑪쑫쑭",6,"쑶쑷쑸쑺",5,"쒁",18,"쒕",6,"쒝",12],["9d41","쒪",13,"쒹쒺쒻쒽",8],["9d61","쓆",25],["9d81","쓠",8,"쓪",5,"쓲쓳쓵쓶쓷쓹쓻쓼쓽쓾씂",9,"씍씎씏씑씒씓씕",6,"씝",10,"씪씫씭씮씯씱",6,"씺씼씾",5,"앆앇앋앏앐앑앒앖앚앛앜앟앢앣앥앦앧앩",6,"앲앶",5,"앾앿얁얂얃얅얆얈얉얊얋얎얐얒얓얔"],["9e41","얖얙얚얛얝얞얟얡",7,"얪",9,"얶"],["9e61","얷얺얿",4,"엋엍엏엒엓엕엖엗엙",6,"엢엤엦엧"],["9e81","엨엩엪엫엯엱엲엳엵엸엹엺엻옂옃옄옉옊옋옍옎옏옑",6,"옚옝",6,"옦옧옩옪옫옯옱옲옶옸옺옼옽옾옿왂왃왅왆왇왉",6,"왒왖",5,"왞왟왡",10,"왭왮왰왲",5,"왺왻왽왾왿욁",6,"욊욌욎",5,"욖욗욙욚욛욝",6,"욦"],["9f41","욨욪",5,"욲욳욵욶욷욻",4,"웂웄웆",5,"웎"],["9f61","웏웑웒웓웕",6,"웞웟웢",5,"웪웫웭웮웯웱웲"],["9f81","웳",4,"웺웻웼웾",5,"윆윇윉윊윋윍",6,"윖윘윚",5,"윢윣윥윦윧윩",6,"윲윴윶윸윹윺윻윾윿읁읂읃읅",4,"읋읎읐읙읚읛읝읞읟읡",6,"읩읪읬",7,"읶읷읹읺읻읿잀잁잂잆잋잌잍잏잒잓잕잙잛",4,"잢잧",4,"잮잯잱잲잳잵잶잷"],["a041","잸잹잺잻잾쟂",5,"쟊쟋쟍쟏쟑",6,"쟙쟚쟛쟜"],["a061","쟞",5,"쟥쟦쟧쟩쟪쟫쟭",13],["a081","쟻",4,"젂젃젅젆젇젉젋",4,"젒젔젗",4,"젞젟젡젢젣젥",6,"젮젰젲",5,"젹젺젻젽젾젿졁",6,"졊졋졎",5,"졕",26,"졲졳졵졶졷졹졻",4,"좂좄좈좉좊좎",5,"좕",7,"좞좠좢좣좤"],["a141","좥좦좧좩",18,"좾좿죀죁"],["a161","죂죃죅죆죇죉죊죋죍",6,"죖죘죚",5,"죢죣죥"],["a181","죦",14,"죶",5,"죾죿줁줂줃줇",4,"줎　、。\xb7‥…\xa8〃\xad―∥＼∼‘’“”〔〕〈",9,"\xb1\xd7\xf7≠≤≥∞∴\xb0′″℃Å￠￡￥♂♀∠⊥⌒∂∇≡≒\xa7※☆★○●◎◇◆□■△▲▽▼→←↑↓↔〓≪≫√∽∝∵∫∬∈∋⊆⊇⊂⊃∪∩∧∨￢"],["a241","줐줒",5,"줙",18],["a261","줭",6,"줵",18],["a281","쥈",7,"쥒쥓쥕쥖쥗쥙",6,"쥢쥤",7,"쥭쥮쥯⇒⇔∀∃\xb4～ˇ˘˝˚˙\xb8˛\xa1\xbfː∮∑∏\xa4℉‰◁◀▷▶♤♠♡♥♧♣⊙◈▣◐◑▒▤▥▨▧▦▩♨☏☎☜☞\xb6†‡↕↗↙↖↘♭♩♪♬㉿㈜№㏇™㏂㏘℡€\xae"],["a341","쥱쥲쥳쥵",6,"쥽",10,"즊즋즍즎즏"],["a361","즑",6,"즚즜즞",16],["a381","즯",16,"짂짃짅짆짉짋",4,"짒짔짗짘짛！",58,"￦］",32,"￣"],["a441","짞짟짡짣짥짦짨짩짪짫짮짲",5,"짺짻짽짾짿쨁쨂쨃쨄"],["a461","쨅쨆쨇쨊쨎",5,"쨕쨖쨗쨙",12],["a481","쨦쨧쨨쨪",28,"ㄱ",93],["a541","쩇",4,"쩎쩏쩑쩒쩓쩕",6,"쩞쩢",5,"쩩쩪"],["a561","쩫",17,"쩾",5,"쪅쪆"],["a581","쪇",16,"쪙",14,"ⅰ",9],["a5b0","Ⅰ",9],["a5c1","Α",16,"Σ",6],["a5e1","α",16,"σ",6],["a641","쪨",19,"쪾쪿쫁쫂쫃쫅"],["a661","쫆",5,"쫎쫐쫒쫔쫕쫖쫗쫚",5,"쫡",6],["a681","쫨쫩쫪쫫쫭",6,"쫵",18,"쬉쬊─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂┒┑┚┙┖┕┎┍┞┟┡┢┦┧┩┪┭┮┱┲┵┶┹┺┽┾╀╁╃",7],["a741","쬋",4,"쬑쬒쬓쬕쬖쬗쬙",6,"쬢",7],["a761","쬪",22,"쭂쭃쭄"],["a781","쭅쭆쭇쭊쭋쭍쭎쭏쭑",6,"쭚쭛쭜쭞",5,"쭥",7,"㎕㎖㎗ℓ㎘㏄㎣㎤㎥㎦㎙",9,"㏊㎍㎎㎏㏏㎈㎉㏈㎧㎨㎰",9,"㎀",4,"㎺",5,"㎐",4,"Ω㏀㏁㎊㎋㎌㏖㏅㎭㎮㎯㏛㎩㎪㎫㎬㏝㏐㏓㏃㏉㏜㏆"],["a841","쭭",10,"쭺",14],["a861","쮉",18,"쮝",6],["a881","쮤",19,"쮹",11,"\xc6\xd0\xaaĦ"],["a8a6","Ĳ"],["a8a8","ĿŁ\xd8Œ\xba\xdeŦŊ"],["a8b1","㉠",27,"ⓐ",25,"①",14,"\xbd⅓⅔\xbc\xbe⅛⅜⅝⅞"],["a941","쯅",14,"쯕",10],["a961","쯠쯡쯢쯣쯥쯦쯨쯪",18],["a981","쯽",14,"찎찏찑찒찓찕",6,"찞찟찠찣찤\xe6đ\xf0ħıĳĸŀł\xf8œ\xdf\xfeŧŋŉ㈀",27,"⒜",25,"⑴",14,"\xb9\xb2\xb3⁴ⁿ₁₂₃₄"],["aa41","찥찦찪찫찭찯찱",6,"찺찿",4,"챆챇챉챊챋챍챎"],["aa61","챏",4,"챖챚",5,"챡챢챣챥챧챩",6,"챱챲"],["aa81","챳챴챶",29,"ぁ",82],["ab41","첔첕첖첗첚첛첝첞첟첡",6,"첪첮",5,"첶첷첹"],["ab61","첺첻첽",6,"쳆쳈쳊",5,"쳑쳒쳓쳕",5],["ab81","쳛",8,"쳥",6,"쳭쳮쳯쳱",12,"ァ",85],["ac41","쳾쳿촀촂",5,"촊촋촍촎촏촑",6,"촚촜촞촟촠"],["ac61","촡촢촣촥촦촧촩촪촫촭",11,"촺",4],["ac81","촿",28,"쵝쵞쵟А",5,"ЁЖ",25],["acd1","а",5,"ёж",25],["ad41","쵡쵢쵣쵥",6,"쵮쵰쵲",5,"쵹",7],["ad61","춁",6,"춉",10,"춖춗춙춚춛춝춞춟"],["ad81","춠춡춢춣춦춨춪",5,"춱",18,"췅"],["ae41","췆",5,"췍췎췏췑",16],["ae61","췢",5,"췩췪췫췭췮췯췱",6,"췺췼췾",4],["ae81","츃츅츆츇츉츊츋츍",6,"츕츖츗츘츚",5,"츢츣츥츦츧츩츪츫"],["af41","츬츭츮츯츲츴츶",19],["af61","칊",13,"칚칛칝칞칢",5,"칪칬"],["af81","칮",5,"칶칷칹칺칻칽",6,"캆캈캊",5,"캒캓캕캖캗캙"],["b041","캚",5,"캢캦",5,"캮",12],["b061","캻",5,"컂",19],["b081","컖",13,"컦컧컩컪컭",6,"컶컺",5,"가각간갇갈갉갊감",7,"같",4,"갠갤갬갭갯갰갱갸갹갼걀걋걍걔걘걜거걱건걷걸걺검겁것겄겅겆겉겊겋게겐겔겜겝겟겠겡겨격겪견겯결겸겹겻겼경곁계곈곌곕곗고곡곤곧골곪곬곯곰곱곳공곶과곽관괄괆"],["b141","켂켃켅켆켇켉",6,"켒켔켖",5,"켝켞켟켡켢켣"],["b161","켥",6,"켮켲",5,"켹",11],["b181","콅",14,"콖콗콙콚콛콝",6,"콦콨콪콫콬괌괍괏광괘괜괠괩괬괭괴괵괸괼굄굅굇굉교굔굘굡굣구국군굳굴굵굶굻굼굽굿궁궂궈궉권궐궜궝궤궷귀귁귄귈귐귑귓규균귤그극근귿글긁금급긋긍긔기긱긴긷길긺김깁깃깅깆깊까깍깎깐깔깖깜깝깟깠깡깥깨깩깬깰깸"],["b241","콭콮콯콲콳콵콶콷콹",6,"쾁쾂쾃쾄쾆",5,"쾍"],["b261","쾎",18,"쾢",5,"쾩"],["b281","쾪",5,"쾱",18,"쿅",6,"깹깻깼깽꺄꺅꺌꺼꺽꺾껀껄껌껍껏껐껑께껙껜껨껫껭껴껸껼꼇꼈꼍꼐꼬꼭꼰꼲꼴꼼꼽꼿꽁꽂꽃꽈꽉꽐꽜꽝꽤꽥꽹꾀꾄꾈꾐꾑꾕꾜꾸꾹꾼꿀꿇꿈꿉꿋꿍꿎꿔꿜꿨꿩꿰꿱꿴꿸뀀뀁뀄뀌뀐뀔뀜뀝뀨끄끅끈끊끌끎끓끔끕끗끙"],["b341","쿌",19,"쿢쿣쿥쿦쿧쿩"],["b361","쿪",5,"쿲쿴쿶",5,"쿽쿾쿿퀁퀂퀃퀅",5],["b381","퀋",5,"퀒",5,"퀙",19,"끝끼끽낀낄낌낍낏낑나낙낚난낟날낡낢남납낫",4,"낱낳내낵낸낼냄냅냇냈냉냐냑냔냘냠냥너넉넋넌널넒넓넘넙넛넜넝넣네넥넨넬넴넵넷넸넹녀녁년녈념녑녔녕녘녜녠노녹논놀놂놈놉놋농높놓놔놘놜놨뇌뇐뇔뇜뇝"],["b441","퀮",5,"퀶퀷퀹퀺퀻퀽",6,"큆큈큊",5],["b461","큑큒큓큕큖큗큙",6,"큡",10,"큮큯"],["b481","큱큲큳큵",6,"큾큿킀킂",18,"뇟뇨뇩뇬뇰뇹뇻뇽누눅눈눋눌눔눕눗눙눠눴눼뉘뉜뉠뉨뉩뉴뉵뉼늄늅늉느늑는늘늙늚늠늡늣능늦늪늬늰늴니닉닌닐닒님닙닛닝닢다닥닦단닫",4,"닳담답닷",4,"닿대댁댄댈댐댑댓댔댕댜더덕덖던덛덜덞덟덤덥"],["b541","킕",14,"킦킧킩킪킫킭",5],["b561","킳킶킸킺",5,"탂탃탅탆탇탊",5,"탒탖",4],["b581","탛탞탟탡탢탣탥",6,"탮탲",5,"탹",11,"덧덩덫덮데덱덴델뎀뎁뎃뎄뎅뎌뎐뎔뎠뎡뎨뎬도독돈돋돌돎돐돔돕돗동돛돝돠돤돨돼됐되된될됨됩됫됴두둑둔둘둠둡둣둥둬뒀뒈뒝뒤뒨뒬뒵뒷뒹듀듄듈듐듕드득든듣들듦듬듭듯등듸디딕딘딛딜딤딥딧딨딩딪따딱딴딸"],["b641","턅",7,"턎",17],["b661","턠",15,"턲턳턵턶턷턹턻턼턽턾"],["b681","턿텂텆",5,"텎텏텑텒텓텕",6,"텞텠텢",5,"텩텪텫텭땀땁땃땄땅땋때땍땐땔땜땝땟땠땡떠떡떤떨떪떫떰떱떳떴떵떻떼떽뗀뗄뗌뗍뗏뗐뗑뗘뗬또똑똔똘똥똬똴뙈뙤뙨뚜뚝뚠뚤뚫뚬뚱뛔뛰뛴뛸뜀뜁뜅뜨뜩뜬뜯뜰뜸뜹뜻띄띈띌띔띕띠띤띨띰띱띳띵라락란랄람랍랏랐랑랒랖랗"],["b741","텮",13,"텽",6,"톅톆톇톉톊"],["b761","톋",20,"톢톣톥톦톧"],["b781","톩",6,"톲톴톶톷톸톹톻톽톾톿퇁",14,"래랙랜랠램랩랫랬랭랴략랸럇량러럭런럴럼럽럿렀렁렇레렉렌렐렘렙렛렝려력련렬렴렵렷렸령례롄롑롓로록론롤롬롭롯롱롸롼뢍뢨뢰뢴뢸룀룁룃룅료룐룔룝룟룡루룩룬룰룸룹룻룽뤄뤘뤠뤼뤽륀륄륌륏륑류륙륜률륨륩"],["b841","퇐",7,"퇙",17],["b861","퇫",8,"퇵퇶퇷퇹",13],["b881","툈툊",5,"툑",24,"륫륭르륵른를름릅릇릉릊릍릎리릭린릴림립릿링마막만많",4,"맘맙맛망맞맡맣매맥맨맬맴맵맷맸맹맺먀먁먈먕머먹먼멀멂멈멉멋멍멎멓메멕멘멜멤멥멧멨멩며멱면멸몃몄명몇몌모목몫몬몰몲몸몹못몽뫄뫈뫘뫙뫼"],["b941","툪툫툮툯툱툲툳툵",6,"툾퉀퉂",5,"퉉퉊퉋퉌"],["b961","퉍",14,"퉝",6,"퉥퉦퉧퉨"],["b981","퉩",22,"튂튃튅튆튇튉튊튋튌묀묄묍묏묑묘묜묠묩묫무묵묶문묻물묽묾뭄뭅뭇뭉뭍뭏뭐뭔뭘뭡뭣뭬뮈뮌뮐뮤뮨뮬뮴뮷므믄믈믐믓미믹민믿밀밂밈밉밋밌밍및밑바",4,"받",4,"밤밥밧방밭배백밴밸뱀뱁뱃뱄뱅뱉뱌뱍뱐뱝버벅번벋벌벎범법벗"],["ba41","튍튎튏튒튓튔튖",5,"튝튞튟튡튢튣튥",6,"튭"],["ba61","튮튯튰튲",5,"튺튻튽튾틁틃",4,"틊틌",5],["ba81","틒틓틕틖틗틙틚틛틝",6,"틦",9,"틲틳틵틶틷틹틺벙벚베벡벤벧벨벰벱벳벴벵벼벽변별볍볏볐병볕볘볜보복볶본볼봄봅봇봉봐봔봤봬뵀뵈뵉뵌뵐뵘뵙뵤뵨부북분붇불붉붊붐붑붓붕붙붚붜붤붰붸뷔뷕뷘뷜뷩뷰뷴뷸븀븃븅브븍븐블븜븝븟비빅빈빌빎빔빕빗빙빚빛빠빡빤"],["bb41","틻",4,"팂팄팆",5,"팏팑팒팓팕팗",4,"팞팢팣"],["bb61","팤팦팧팪팫팭팮팯팱",6,"팺팾",5,"퍆퍇퍈퍉"],["bb81","퍊",31,"빨빪빰빱빳빴빵빻빼빽뺀뺄뺌뺍뺏뺐뺑뺘뺙뺨뻐뻑뻔뻗뻘뻠뻣뻤뻥뻬뼁뼈뼉뼘뼙뼛뼜뼝뽀뽁뽄뽈뽐뽑뽕뾔뾰뿅뿌뿍뿐뿔뿜뿟뿡쀼쁑쁘쁜쁠쁨쁩삐삑삔삘삠삡삣삥사삭삯산삳살삵삶삼삽삿샀상샅새색샌샐샘샙샛샜생샤"],["bc41","퍪",17,"퍾퍿펁펂펃펅펆펇"],["bc61","펈펉펊펋펎펒",5,"펚펛펝펞펟펡",6,"펪펬펮"],["bc81","펯",4,"펵펶펷펹펺펻펽",6,"폆폇폊",5,"폑",5,"샥샨샬샴샵샷샹섀섄섈섐섕서",4,"섣설섦섧섬섭섯섰성섶세섹센셀셈셉셋셌셍셔셕션셜셤셥셧셨셩셰셴셸솅소속솎손솔솖솜솝솟송솥솨솩솬솰솽쇄쇈쇌쇔쇗쇘쇠쇤쇨쇰쇱쇳쇼쇽숀숄숌숍숏숑수숙순숟술숨숩숫숭"],["bd41","폗폙",7,"폢폤",7,"폮폯폱폲폳폵폶폷"],["bd61","폸폹폺폻폾퐀퐂",5,"퐉",13],["bd81","퐗",5,"퐞",25,"숯숱숲숴쉈쉐쉑쉔쉘쉠쉥쉬쉭쉰쉴쉼쉽쉿슁슈슉슐슘슛슝스슥슨슬슭슴습슷승시식신싣실싫심십싯싱싶싸싹싻싼쌀쌈쌉쌌쌍쌓쌔쌕쌘쌜쌤쌥쌨쌩썅써썩썬썰썲썸썹썼썽쎄쎈쎌쏀쏘쏙쏜쏟쏠쏢쏨쏩쏭쏴쏵쏸쐈쐐쐤쐬쐰"],["be41","퐸",7,"푁푂푃푅",14],["be61","푔",7,"푝푞푟푡푢푣푥",7,"푮푰푱푲"],["be81","푳",4,"푺푻푽푾풁풃",4,"풊풌풎",5,"풕",8,"쐴쐼쐽쑈쑤쑥쑨쑬쑴쑵쑹쒀쒔쒜쒸쒼쓩쓰쓱쓴쓸쓺쓿씀씁씌씐씔씜씨씩씬씰씸씹씻씽아악안앉않알앍앎앓암압앗았앙앝앞애액앤앨앰앱앳앴앵야약얀얄얇얌얍얏양얕얗얘얜얠얩어억언얹얻얼얽얾엄",6,"엌엎"],["bf41","풞",10,"풪",14],["bf61","풹",18,"퓍퓎퓏퓑퓒퓓퓕"],["bf81","퓖",5,"퓝퓞퓠",7,"퓩퓪퓫퓭퓮퓯퓱",6,"퓹퓺퓼에엑엔엘엠엡엣엥여역엮연열엶엷염",5,"옅옆옇예옌옐옘옙옛옜오옥온올옭옮옰옳옴옵옷옹옻와왁완왈왐왑왓왔왕왜왝왠왬왯왱외왹왼욀욈욉욋욍요욕욘욜욤욥욧용우욱운울욹욺움웁웃웅워웍원월웜웝웠웡웨"],["c041","퓾",5,"픅픆픇픉픊픋픍",6,"픖픘",5],["c061","픞",25],["c081","픸픹픺픻픾픿핁핂핃핅",6,"핎핐핒",5,"핚핛핝핞핟핡핢핣웩웬웰웸웹웽위윅윈윌윔윕윗윙유육윤율윰윱윳융윷으윽은을읊음읍읏응",7,"읜읠읨읫이익인일읽읾잃임입잇있잉잊잎자작잔잖잗잘잚잠잡잣잤장잦재잭잰잴잼잽잿쟀쟁쟈쟉쟌쟎쟐쟘쟝쟤쟨쟬저적전절젊"],["c141","핤핦핧핪핬핮",5,"핶핷핹핺핻핽",6,"햆햊햋"],["c161","햌햍햎햏햑",19,"햦햧"],["c181","햨",31,"점접젓정젖제젝젠젤젬젭젯젱져젼졀졈졉졌졍졔조족존졸졺좀좁좃종좆좇좋좌좍좔좝좟좡좨좼좽죄죈죌죔죕죗죙죠죡죤죵주죽준줄줅줆줌줍줏중줘줬줴쥐쥑쥔쥘쥠쥡쥣쥬쥰쥴쥼즈즉즌즐즘즙즛증지직진짇질짊짐집짓"],["c241","헊헋헍헎헏헑헓",4,"헚헜헞",5,"헦헧헩헪헫헭헮"],["c261","헯",4,"헶헸헺",5,"혂혃혅혆혇혉",6,"혒"],["c281","혖",5,"혝혞혟혡혢혣혥",7,"혮",9,"혺혻징짖짙짚짜짝짠짢짤짧짬짭짯짰짱째짹짼쨀쨈쨉쨋쨌쨍쨔쨘쨩쩌쩍쩐쩔쩜쩝쩟쩠쩡쩨쩽쪄쪘쪼쪽쫀쫄쫌쫍쫏쫑쫓쫘쫙쫠쫬쫴쬈쬐쬔쬘쬠쬡쭁쭈쭉쭌쭐쭘쭙쭝쭤쭸쭹쮜쮸쯔쯤쯧쯩찌찍찐찔찜찝찡찢찧차착찬찮찰참찹찻"],["c341","혽혾혿홁홂홃홄홆홇홊홌홎홏홐홒홓홖홗홙홚홛홝",4],["c361","홢",4,"홨홪",5,"홲홳홵",11],["c381","횁횂횄횆",5,"횎횏횑횒횓횕",7,"횞횠횢",5,"횩횪찼창찾채책챈챌챔챕챗챘챙챠챤챦챨챰챵처척천철첨첩첫첬청체첵첸첼쳄쳅쳇쳉쳐쳔쳤쳬쳰촁초촉촌촐촘촙촛총촤촨촬촹최쵠쵤쵬쵭쵯쵱쵸춈추축춘출춤춥춧충춰췄췌췐취췬췰췸췹췻췽츄츈츌츔츙츠측츤츨츰츱츳층"],["c441","횫횭횮횯횱",7,"횺횼",7,"훆훇훉훊훋"],["c461","훍훎훏훐훒훓훕훖훘훚",5,"훡훢훣훥훦훧훩",4],["c481","훮훯훱훲훳훴훶",5,"훾훿휁휂휃휅",11,"휒휓휔치칙친칟칠칡침칩칫칭카칵칸칼캄캅캇캉캐캑캔캘캠캡캣캤캥캬캭컁커컥컨컫컬컴컵컷컸컹케켁켄켈켐켑켓켕켜켠켤켬켭켯켰켱켸코콕콘콜콤콥콧콩콰콱콴콸쾀쾅쾌쾡쾨쾰쿄쿠쿡쿤쿨쿰쿱쿳쿵쿼퀀퀄퀑퀘퀭퀴퀵퀸퀼"],["c541","휕휖휗휚휛휝휞휟휡",6,"휪휬휮",5,"휶휷휹"],["c561","휺휻휽",6,"흅흆흈흊",5,"흒흓흕흚",4],["c581","흟흢흤흦흧흨흪흫흭흮흯흱흲흳흵",6,"흾흿힀힂",5,"힊힋큄큅큇큉큐큔큘큠크큭큰클큼큽킁키킥킨킬킴킵킷킹타탁탄탈탉탐탑탓탔탕태택탠탤탬탭탯탰탱탸턍터턱턴털턺텀텁텃텄텅테텍텐텔템텝텟텡텨텬텼톄톈토톡톤톨톰톱톳통톺톼퇀퇘퇴퇸툇툉툐투툭툰툴툼툽툿퉁퉈퉜"],["c641","힍힎힏힑",6,"힚힜힞",5],["c6a1","퉤튀튁튄튈튐튑튕튜튠튤튬튱트특튼튿틀틂틈틉틋틔틘틜틤틥티틱틴틸팀팁팃팅파팍팎판팔팖팜팝팟팠팡팥패팩팬팰팸팹팻팼팽퍄퍅퍼퍽펀펄펌펍펏펐펑페펙펜펠펨펩펫펭펴편펼폄폅폈평폐폘폡폣포폭폰폴폼폽폿퐁"],["c7a1","퐈퐝푀푄표푠푤푭푯푸푹푼푿풀풂품풉풋풍풔풩퓌퓐퓔퓜퓟퓨퓬퓰퓸퓻퓽프픈플픔픕픗피픽핀필핌핍핏핑하학한할핥함합핫항해핵핸핼햄햅햇했행햐향허헉헌헐헒험헙헛헝헤헥헨헬헴헵헷헹혀혁현혈혐협혓혔형혜혠"],["c8a1","혤혭호혹혼홀홅홈홉홋홍홑화확환활홧황홰홱홴횃횅회획횐횔횝횟횡효횬횰횹횻후훅훈훌훑훔훗훙훠훤훨훰훵훼훽휀휄휑휘휙휜휠휨휩휫휭휴휵휸휼흄흇흉흐흑흔흖흗흘흙흠흡흣흥흩희흰흴흼흽힁히힉힌힐힘힙힛힝"],["caa1","伽佳假價加可呵哥嘉嫁家暇架枷柯歌珂痂稼苛茄街袈訶賈跏軻迦駕刻却各恪慤殼珏脚覺角閣侃刊墾奸姦干幹懇揀杆柬桿澗癎看磵稈竿簡肝艮艱諫間乫喝曷渴碣竭葛褐蝎鞨勘坎堪嵌感憾戡敢柑橄減甘疳監瞰紺邯鑑鑒龕"],["cba1","匣岬甲胛鉀閘剛堈姜岡崗康强彊慷江畺疆糠絳綱羌腔舡薑襁講鋼降鱇介价個凱塏愷愾慨改槪漑疥皆盖箇芥蓋豈鎧開喀客坑更粳羹醵倨去居巨拒据據擧渠炬祛距踞車遽鉅鋸乾件健巾建愆楗腱虔蹇鍵騫乞傑杰桀儉劍劒檢"],["cca1","瞼鈐黔劫怯迲偈憩揭擊格檄激膈覡隔堅牽犬甄絹繭肩見譴遣鵑抉決潔結缺訣兼慊箝謙鉗鎌京俓倞傾儆勁勍卿坰境庚徑慶憬擎敬景暻更梗涇炅烱璟璥瓊痙硬磬竟競絅經耕耿脛莖警輕逕鏡頃頸驚鯨係啓堺契季屆悸戒桂械"],["cda1","棨溪界癸磎稽系繫繼計誡谿階鷄古叩告呱固姑孤尻庫拷攷故敲暠枯槁沽痼皐睾稿羔考股膏苦苽菰藁蠱袴誥賈辜錮雇顧高鼓哭斛曲梏穀谷鵠困坤崑昆梱棍滾琨袞鯤汨滑骨供公共功孔工恐恭拱控攻珙空蚣貢鞏串寡戈果瓜"],["cea1","科菓誇課跨過鍋顆廓槨藿郭串冠官寬慣棺款灌琯瓘管罐菅觀貫關館刮恝括适侊光匡壙廣曠洸炚狂珖筐胱鑛卦掛罫乖傀塊壞怪愧拐槐魁宏紘肱轟交僑咬喬嬌嶠巧攪敎校橋狡皎矯絞翹膠蕎蛟較轎郊餃驕鮫丘久九仇俱具勾"],["cfa1","區口句咎嘔坵垢寇嶇廐懼拘救枸柩構歐毆毬求溝灸狗玖球瞿矩究絿耉臼舅舊苟衢謳購軀逑邱鉤銶駒驅鳩鷗龜國局菊鞠鞫麴君窘群裙軍郡堀屈掘窟宮弓穹窮芎躬倦券勸卷圈拳捲權淃眷厥獗蕨蹶闕机櫃潰詭軌饋句晷歸貴"],["d0a1","鬼龜叫圭奎揆槻珪硅窺竅糾葵規赳逵閨勻均畇筠菌鈞龜橘克剋劇戟棘極隙僅劤勤懃斤根槿瑾筋芹菫覲謹近饉契今妗擒昑檎琴禁禽芩衾衿襟金錦伋及急扱汲級給亘兢矜肯企伎其冀嗜器圻基埼夔奇妓寄岐崎己幾忌技旗旣"],["d1a1","朞期杞棋棄機欺氣汽沂淇玘琦琪璂璣畸畿碁磯祁祇祈祺箕紀綺羈耆耭肌記譏豈起錡錤飢饑騎騏驥麒緊佶吉拮桔金喫儺喇奈娜懦懶拏拿癩",5,"那樂",4,"諾酪駱亂卵暖欄煖爛蘭難鸞捏捺南嵐枏楠湳濫男藍襤拉"],["d2a1","納臘蠟衲囊娘廊",4,"乃來內奈柰耐冷女年撚秊念恬拈捻寧寗努勞奴弩怒擄櫓爐瑙盧",5,"駑魯",10,"濃籠聾膿農惱牢磊腦賂雷尿壘",7,"嫩訥杻紐勒",5,"能菱陵尼泥匿溺多茶"],["d3a1","丹亶但單團壇彖斷旦檀段湍短端簞緞蛋袒鄲鍛撻澾獺疸達啖坍憺擔曇淡湛潭澹痰聃膽蕁覃談譚錟沓畓答踏遝唐堂塘幢戇撞棠當糖螳黨代垈坮大對岱帶待戴擡玳臺袋貸隊黛宅德悳倒刀到圖堵塗導屠島嶋度徒悼挑掉搗桃"],["d4a1","棹櫂淘渡滔濤燾盜睹禱稻萄覩賭跳蹈逃途道都鍍陶韜毒瀆牘犢獨督禿篤纛讀墩惇敦旽暾沌焞燉豚頓乭突仝冬凍動同憧東桐棟洞潼疼瞳童胴董銅兜斗杜枓痘竇荳讀豆逗頭屯臀芚遁遯鈍得嶝橙燈登等藤謄鄧騰喇懶拏癩羅"],["d5a1","蘿螺裸邏樂洛烙珞絡落諾酪駱丹亂卵欄欒瀾爛蘭鸞剌辣嵐擥攬欖濫籃纜藍襤覽拉臘蠟廊朗浪狼琅瑯螂郞來崍徠萊冷掠略亮倆兩凉梁樑粮粱糧良諒輛量侶儷勵呂廬慮戾旅櫚濾礪藜蠣閭驢驪麗黎力曆歷瀝礫轢靂憐戀攣漣"],["d6a1","煉璉練聯蓮輦連鍊冽列劣洌烈裂廉斂殮濂簾獵令伶囹寧岺嶺怜玲笭羚翎聆逞鈴零靈領齡例澧禮醴隷勞怒撈擄櫓潞瀘爐盧老蘆虜路輅露魯鷺鹵碌祿綠菉錄鹿麓論壟弄朧瀧瓏籠聾儡瀨牢磊賂賚賴雷了僚寮廖料燎療瞭聊蓼"],["d7a1","遼鬧龍壘婁屢樓淚漏瘻累縷蔞褸鏤陋劉旒柳榴流溜瀏琉瑠留瘤硫謬類六戮陸侖倫崙淪綸輪律慄栗率隆勒肋凜凌楞稜綾菱陵俚利厘吏唎履悧李梨浬犁狸理璃異痢籬罹羸莉裏裡里釐離鯉吝潾燐璘藺躪隣鱗麟林淋琳臨霖砬"],["d8a1","立笠粒摩瑪痲碼磨馬魔麻寞幕漠膜莫邈万卍娩巒彎慢挽晩曼滿漫灣瞞萬蔓蠻輓饅鰻唜抹末沫茉襪靺亡妄忘忙望網罔芒茫莽輞邙埋妹媒寐昧枚梅每煤罵買賣邁魅脈貊陌驀麥孟氓猛盲盟萌冪覓免冕勉棉沔眄眠綿緬面麵滅"],["d9a1","蔑冥名命明暝椧溟皿瞑茗蓂螟酩銘鳴袂侮冒募姆帽慕摸摹暮某模母毛牟牡瑁眸矛耗芼茅謀謨貌木沐牧目睦穆鶩歿沒夢朦蒙卯墓妙廟描昴杳渺猫竗苗錨務巫憮懋戊拇撫无楙武毋無珷畝繆舞茂蕪誣貿霧鵡墨默們刎吻問文"],["daa1","汶紊紋聞蚊門雯勿沕物味媚尾嵋彌微未梶楣渼湄眉米美薇謎迷靡黴岷悶愍憫敏旻旼民泯玟珉緡閔密蜜謐剝博拍搏撲朴樸泊珀璞箔粕縛膊舶薄迫雹駁伴半反叛拌搬攀斑槃泮潘班畔瘢盤盼磐磻礬絆般蟠返頒飯勃拔撥渤潑"],["dba1","發跋醱鉢髮魃倣傍坊妨尨幇彷房放方旁昉枋榜滂磅紡肪膀舫芳蒡蚌訪謗邦防龐倍俳北培徘拜排杯湃焙盃背胚裴裵褙賠輩配陪伯佰帛柏栢白百魄幡樊煩燔番磻繁蕃藩飜伐筏罰閥凡帆梵氾汎泛犯範范法琺僻劈壁擘檗璧癖"],["dca1","碧蘗闢霹便卞弁變辨辯邊別瞥鱉鼈丙倂兵屛幷昞昺柄棅炳甁病秉竝輧餠騈保堡報寶普步洑湺潽珤甫菩補褓譜輔伏僕匐卜宓復服福腹茯蔔複覆輹輻馥鰒本乶俸奉封峯峰捧棒烽熢琫縫蓬蜂逢鋒鳳不付俯傅剖副否咐埠夫婦"],["dda1","孚孵富府復扶敷斧浮溥父符簿缶腐腑膚艀芙莩訃負賦賻赴趺部釜阜附駙鳧北分吩噴墳奔奮忿憤扮昐汾焚盆粉糞紛芬賁雰不佛弗彿拂崩朋棚硼繃鵬丕備匕匪卑妃婢庇悲憊扉批斐枇榧比毖毗毘沸泌琵痺砒碑秕秘粃緋翡肥"],["dea1","脾臂菲蜚裨誹譬費鄙非飛鼻嚬嬪彬斌檳殯浜濱瀕牝玭貧賓頻憑氷聘騁乍事些仕伺似使俟僿史司唆嗣四士奢娑寫寺射巳師徙思捨斜斯柶査梭死沙泗渣瀉獅砂社祀祠私篩紗絲肆舍莎蓑蛇裟詐詞謝賜赦辭邪飼駟麝削數朔索"],["dfa1","傘刪山散汕珊産疝算蒜酸霰乷撒殺煞薩三參杉森渗芟蔘衫揷澁鈒颯上傷像償商喪嘗孀尙峠常床庠廂想桑橡湘爽牀狀相祥箱翔裳觴詳象賞霜塞璽賽嗇塞穡索色牲生甥省笙墅壻嶼序庶徐恕抒捿敍暑曙書栖棲犀瑞筮絮緖署"],["e0a1","胥舒薯西誓逝鋤黍鼠夕奭席惜昔晳析汐淅潟石碩蓆釋錫仙僊先善嬋宣扇敾旋渲煽琁瑄璇璿癬禪線繕羨腺膳船蘚蟬詵跣選銑鐥饍鮮卨屑楔泄洩渫舌薛褻設說雪齧剡暹殲纖蟾贍閃陝攝涉燮葉城姓宬性惺成星晟猩珹盛省筬"],["e1a1","聖聲腥誠醒世勢歲洗稅笹細說貰召嘯塑宵小少巢所掃搔昭梳沼消溯瀟炤燒甦疏疎瘙笑篠簫素紹蔬蕭蘇訴逍遡邵銷韶騷俗屬束涑粟續謖贖速孫巽損蓀遜飡率宋悚松淞訟誦送頌刷殺灑碎鎖衰釗修受嗽囚垂壽嫂守岫峀帥愁"],["e2a1","戍手授搜收數樹殊水洙漱燧狩獸琇璲瘦睡秀穗竪粹綏綬繡羞脩茱蒐蓚藪袖誰讐輸遂邃酬銖銹隋隧隨雖需須首髓鬚叔塾夙孰宿淑潚熟琡璹肅菽巡徇循恂旬栒楯橓殉洵淳珣盾瞬筍純脣舜荀蓴蕣詢諄醇錞順馴戌術述鉥崇崧"],["e3a1","嵩瑟膝蝨濕拾習褶襲丞乘僧勝升承昇繩蠅陞侍匙嘶始媤尸屎屍市弑恃施是時枾柴猜矢示翅蒔蓍視試詩諡豕豺埴寔式息拭植殖湜熄篒蝕識軾食飾伸侁信呻娠宸愼新晨燼申神紳腎臣莘薪藎蜃訊身辛辰迅失室實悉審尋心沁"],["e4a1","沈深瀋甚芯諶什十拾雙氏亞俄兒啞娥峨我牙芽莪蛾衙訝阿雅餓鴉鵝堊岳嶽幄惡愕握樂渥鄂鍔顎鰐齷安岸按晏案眼雁鞍顔鮟斡謁軋閼唵岩巖庵暗癌菴闇壓押狎鴨仰央怏昻殃秧鴦厓哀埃崖愛曖涯碍艾隘靄厄扼掖液縊腋額"],["e5a1","櫻罌鶯鸚也倻冶夜惹揶椰爺耶若野弱掠略約若葯蒻藥躍亮佯兩凉壤孃恙揚攘敭暘梁楊樣洋瀁煬痒瘍禳穰糧羊良襄諒讓釀陽量養圄御於漁瘀禦語馭魚齬億憶抑檍臆偃堰彦焉言諺孼蘖俺儼嚴奄掩淹嶪業円予余勵呂女如廬"],["e6a1","旅歟汝濾璵礖礪與艅茹輿轝閭餘驪麗黎亦力域役易曆歷疫繹譯轢逆驛嚥堧姸娟宴年延憐戀捐挻撚椽沇沿涎涓淵演漣烟然煙煉燃燕璉硏硯秊筵緣練縯聯衍軟輦蓮連鉛鍊鳶列劣咽悅涅烈熱裂說閱厭廉念捻染殮炎焰琰艶苒"],["e7a1","簾閻髥鹽曄獵燁葉令囹塋寧嶺嶸影怜映暎楹榮永泳渶潁濚瀛瀯煐營獰玲瑛瑩瓔盈穎纓羚聆英詠迎鈴鍈零霙靈領乂倪例刈叡曳汭濊猊睿穢芮藝蘂禮裔詣譽豫醴銳隸霓預五伍俉傲午吾吳嗚塢墺奧娛寤悟惡懊敖旿晤梧汚澳"],["e8a1","烏熬獒筽蜈誤鰲鼇屋沃獄玉鈺溫瑥瘟穩縕蘊兀壅擁瓮甕癰翁邕雍饔渦瓦窩窪臥蛙蝸訛婉完宛梡椀浣玩琓琬碗緩翫脘腕莞豌阮頑曰往旺枉汪王倭娃歪矮外嵬巍猥畏了僚僥凹堯夭妖姚寥寮尿嶢拗搖撓擾料曜樂橈燎燿瑤療"],["e9a1","窈窯繇繞耀腰蓼蟯要謠遙遼邀饒慾欲浴縟褥辱俑傭冗勇埇墉容庸慂榕涌湧溶熔瑢用甬聳茸蓉踊鎔鏞龍于佑偶優又友右宇寓尤愚憂旴牛玗瑀盂祐禑禹紆羽芋藕虞迂遇郵釪隅雨雩勖彧旭昱栯煜稶郁頊云暈橒殞澐熉耘芸蕓"],["eaa1","運隕雲韻蔚鬱亐熊雄元原員圓園垣媛嫄寃怨愿援沅洹湲源爰猿瑗苑袁轅遠阮院願鴛月越鉞位偉僞危圍委威尉慰暐渭爲瑋緯胃萎葦蔿蝟衛褘謂違韋魏乳侑儒兪劉唯喩孺宥幼幽庾悠惟愈愉揄攸有杻柔柚柳楡楢油洧流游溜"],["eba1","濡猶猷琉瑜由留癒硫紐維臾萸裕誘諛諭踰蹂遊逾遺酉釉鍮類六堉戮毓肉育陸倫允奫尹崙淪潤玧胤贇輪鈗閏律慄栗率聿戎瀜絨融隆垠恩慇殷誾銀隱乙吟淫蔭陰音飮揖泣邑凝應膺鷹依倚儀宜意懿擬椅毅疑矣義艤薏蟻衣誼"],["eca1","議醫二以伊利吏夷姨履已弛彛怡易李梨泥爾珥理異痍痢移罹而耳肄苡荑裏裡貽貳邇里離飴餌匿溺瀷益翊翌翼謚人仁刃印吝咽因姻寅引忍湮燐璘絪茵藺蚓認隣靭靷鱗麟一佚佾壹日溢逸鎰馹任壬妊姙恁林淋稔臨荏賃入卄"],["eda1","立笠粒仍剩孕芿仔刺咨姉姿子字孜恣慈滋炙煮玆瓷疵磁紫者自茨蔗藉諮資雌作勺嚼斫昨灼炸爵綽芍酌雀鵲孱棧殘潺盞岑暫潛箴簪蠶雜丈仗匠場墻壯奬將帳庄張掌暲杖樟檣欌漿牆狀獐璋章粧腸臟臧莊葬蔣薔藏裝贓醬長"],["eea1","障再哉在宰才材栽梓渽滓災縡裁財載齋齎爭箏諍錚佇低儲咀姐底抵杵楮樗沮渚狙猪疽箸紵苧菹著藷詛貯躇這邸雎齟勣吊嫡寂摘敵滴狄炙的積笛籍績翟荻謫賊赤跡蹟迪迹適鏑佃佺傳全典前剪塡塼奠專展廛悛戰栓殿氈澱"],["efa1","煎琠田甸畑癲筌箋箭篆纏詮輾轉鈿銓錢鐫電顚顫餞切截折浙癤竊節絶占岾店漸点粘霑鮎點接摺蝶丁井亭停偵呈姃定幀庭廷征情挺政整旌晶晸柾楨檉正汀淀淨渟湞瀞炡玎珽町睛碇禎程穽精綎艇訂諪貞鄭酊釘鉦鋌錠霆靖"],["f0a1","靜頂鼎制劑啼堤帝弟悌提梯濟祭第臍薺製諸蹄醍除際霽題齊俎兆凋助嘲弔彫措操早晁曺曹朝條棗槽漕潮照燥爪璪眺祖祚租稠窕粗糟組繰肇藻蚤詔調趙躁造遭釣阻雕鳥族簇足鏃存尊卒拙猝倧宗從悰慫棕淙琮種終綜縱腫"],["f1a1","踪踵鍾鐘佐坐左座挫罪主住侏做姝胄呪周嗾奏宙州廚晝朱柱株注洲湊澍炷珠疇籌紂紬綢舟蛛註誅走躊輳週酎酒鑄駐竹粥俊儁准埈寯峻晙樽浚準濬焌畯竣蠢逡遵雋駿茁中仲衆重卽櫛楫汁葺增憎曾拯烝甑症繒蒸證贈之只"],["f2a1","咫地址志持指摯支旨智枝枳止池沚漬知砥祉祗紙肢脂至芝芷蜘誌識贄趾遲直稙稷織職唇嗔塵振搢晉晋桭榛殄津溱珍瑨璡畛疹盡眞瞋秦縉縝臻蔯袗診賑軫辰進鎭陣陳震侄叱姪嫉帙桎瓆疾秩窒膣蛭質跌迭斟朕什執潗緝輯"],["f3a1","鏶集徵懲澄且侘借叉嗟嵯差次此磋箚茶蹉車遮捉搾着窄錯鑿齪撰澯燦璨瓚竄簒纂粲纘讚贊鑽餐饌刹察擦札紮僭參塹慘慙懺斬站讒讖倉倡創唱娼廠彰愴敞昌昶暢槍滄漲猖瘡窓脹艙菖蒼債埰寀寨彩採砦綵菜蔡采釵冊柵策"],["f4a1","責凄妻悽處倜刺剔尺慽戚拓擲斥滌瘠脊蹠陟隻仟千喘天川擅泉淺玔穿舛薦賤踐遷釧闡阡韆凸哲喆徹撤澈綴輟轍鐵僉尖沾添甛瞻簽籤詹諂堞妾帖捷牒疊睫諜貼輒廳晴淸聽菁請靑鯖切剃替涕滯締諦逮遞體初剿哨憔抄招梢"],["f5a1","椒楚樵炒焦硝礁礎秒稍肖艸苕草蕉貂超酢醋醮促囑燭矗蜀觸寸忖村邨叢塚寵悤憁摠總聰蔥銃撮催崔最墜抽推椎楸樞湫皺秋芻萩諏趨追鄒酋醜錐錘鎚雛騶鰍丑畜祝竺筑築縮蓄蹙蹴軸逐春椿瑃出朮黜充忠沖蟲衝衷悴膵萃"],["f6a1","贅取吹嘴娶就炊翠聚脆臭趣醉驟鷲側仄厠惻測層侈値嗤峙幟恥梔治淄熾痔痴癡稚穉緇緻置致蚩輜雉馳齒則勅飭親七柒漆侵寢枕沈浸琛砧針鍼蟄秤稱快他咤唾墮妥惰打拖朶楕舵陀馱駝倬卓啄坼度托拓擢晫柝濁濯琢琸託"],["f7a1","鐸呑嘆坦彈憚歎灘炭綻誕奪脫探眈耽貪塔搭榻宕帑湯糖蕩兌台太怠態殆汰泰笞胎苔跆邰颱宅擇澤撑攄兎吐土討慟桶洞痛筒統通堆槌腿褪退頹偸套妬投透鬪慝特闖坡婆巴把播擺杷波派爬琶破罷芭跛頗判坂板版瓣販辦鈑"],["f8a1","阪八叭捌佩唄悖敗沛浿牌狽稗覇貝彭澎烹膨愎便偏扁片篇編翩遍鞭騙貶坪平枰萍評吠嬖幣廢弊斃肺蔽閉陛佈包匍匏咆哺圃布怖抛抱捕暴泡浦疱砲胞脯苞葡蒲袍褒逋鋪飽鮑幅暴曝瀑爆輻俵剽彪慓杓標漂瓢票表豹飇飄驃"],["f9a1","品稟楓諷豊風馮彼披疲皮被避陂匹弼必泌珌畢疋筆苾馝乏逼下何厦夏廈昰河瑕荷蝦賀遐霞鰕壑學虐謔鶴寒恨悍旱汗漢澣瀚罕翰閑閒限韓割轄函含咸啣喊檻涵緘艦銜陷鹹合哈盒蛤閤闔陜亢伉姮嫦巷恒抗杭桁沆港缸肛航"],["faa1","行降項亥偕咳垓奚孩害懈楷海瀣蟹解該諧邂駭骸劾核倖幸杏荇行享向嚮珦鄕響餉饗香噓墟虛許憲櫶獻軒歇險驗奕爀赫革俔峴弦懸晛泫炫玄玹現眩睍絃絢縣舷衒見賢鉉顯孑穴血頁嫌俠協夾峽挾浹狹脅脇莢鋏頰亨兄刑型"],["fba1","形泂滎瀅灐炯熒珩瑩荊螢衡逈邢鎣馨兮彗惠慧暳蕙蹊醯鞋乎互呼壕壺好岵弧戶扈昊晧毫浩淏湖滸澔濠濩灝狐琥瑚瓠皓祜糊縞胡芦葫蒿虎號蝴護豪鎬頀顥惑或酷婚昏混渾琿魂忽惚笏哄弘汞泓洪烘紅虹訌鴻化和嬅樺火畵"],["fca1","禍禾花華話譁貨靴廓擴攫確碻穫丸喚奐宦幻患換歡晥桓渙煥環紈還驩鰥活滑猾豁闊凰幌徨恍惶愰慌晃晄榥況湟滉潢煌璜皇篁簧荒蝗遑隍黃匯回廻徊恢悔懷晦會檜淮澮灰獪繪膾茴蛔誨賄劃獲宖橫鐄哮嚆孝效斅曉梟涍淆"],["fda1","爻肴酵驍侯候厚后吼喉嗅帿後朽煦珝逅勛勳塤壎焄熏燻薰訓暈薨喧暄煊萱卉喙毁彙徽揮暉煇諱輝麾休携烋畦虧恤譎鷸兇凶匈洶胸黑昕欣炘痕吃屹紇訖欠欽歆吸恰洽翕興僖凞喜噫囍姬嬉希憙憘戱晞曦熙熹熺犧禧稀羲詰"]]',
      );
    },
    12925(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '[["0","\\u0000",127],["a140","　，、。．‧；：？！︰…‥﹐﹑﹒\xb7﹔﹕﹖﹗｜–︱—︳╴︴﹏（）︵︶｛｝︷︸〔〕︹︺【】︻︼《》︽︾〈〉︿﹀「」﹁﹂『』﹃﹄﹙﹚"],["a1a1","﹛﹜﹝﹞‘’“”〝〞‵′＃＆＊※\xa7〃○●△▲◎☆★◇◆□■▽▼㊣℅\xaf￣＿ˍ﹉﹊﹍﹎﹋﹌﹟﹠﹡＋－\xd7\xf7\xb1√＜＞＝≦≧≠∞≒≡﹢",4,"～∩∪⊥∠∟⊿㏒㏑∫∮∵∴♀♂⊕⊙↑↓←→↖↗↙↘∥∣／"],["a240","＼∕﹨＄￥〒￠￡％＠℃℉﹩﹪﹫㏕㎜㎝㎞㏎㎡㎎㎏㏄\xb0兙兛兞兝兡兣嗧瓩糎▁",7,"▏▎▍▌▋▊▉┼┴┬┤├▔─│▕┌┐└┘╭"],["a2a1","╮╰╯═╞╪╡◢◣◥◤╱╲╳０",9,"Ⅰ",9,"〡",8,"十卄卅Ａ",25,"ａ",21],["a340","ｗｘｙｚΑ",16,"Σ",6,"α",16,"σ",6,"ㄅ",10],["a3a1","ㄐ",25,"˙ˉˊˇˋ"],["a3e1","€"],["a440","一乙丁七乃九了二人儿入八几刀刁力匕十卜又三下丈上丫丸凡久么也乞于亡兀刃勺千叉口土士夕大女子孑孓寸小尢尸山川工己已巳巾干廾弋弓才"],["a4a1","丑丐不中丰丹之尹予云井互五亢仁什仃仆仇仍今介仄元允內六兮公冗凶分切刈勻勾勿化匹午升卅卞厄友及反壬天夫太夭孔少尤尺屯巴幻廿弔引心戈戶手扎支文斗斤方日曰月木欠止歹毋比毛氏水火爪父爻片牙牛犬王丙"],["a540","世丕且丘主乍乏乎以付仔仕他仗代令仙仞充兄冉冊冬凹出凸刊加功包匆北匝仟半卉卡占卯卮去可古右召叮叩叨叼司叵叫另只史叱台句叭叻四囚外"],["a5a1","央失奴奶孕它尼巨巧左市布平幼弁弘弗必戊打扔扒扑斥旦朮本未末札正母民氐永汁汀氾犯玄玉瓜瓦甘生用甩田由甲申疋白皮皿目矛矢石示禾穴立丞丟乒乓乩亙交亦亥仿伉伙伊伕伍伐休伏仲件任仰仳份企伋光兇兆先全"],["a640","共再冰列刑划刎刖劣匈匡匠印危吉吏同吊吐吁吋各向名合吃后吆吒因回囝圳地在圭圬圯圩夙多夷夸妄奸妃好她如妁字存宇守宅安寺尖屹州帆并年"],["a6a1","式弛忙忖戎戌戍成扣扛托收早旨旬旭曲曳有朽朴朱朵次此死氖汝汗汙江池汐汕污汛汍汎灰牟牝百竹米糸缶羊羽老考而耒耳聿肉肋肌臣自至臼舌舛舟艮色艾虫血行衣西阡串亨位住佇佗佞伴佛何估佐佑伽伺伸佃佔似但佣"],["a740","作你伯低伶余佝佈佚兌克免兵冶冷別判利刪刨劫助努劬匣即卵吝吭吞吾否呎吧呆呃吳呈呂君吩告吹吻吸吮吵吶吠吼呀吱含吟听囪困囤囫坊坑址坍"],["a7a1","均坎圾坐坏圻壯夾妝妒妨妞妣妙妖妍妤妓妊妥孝孜孚孛完宋宏尬局屁尿尾岐岑岔岌巫希序庇床廷弄弟彤形彷役忘忌志忍忱快忸忪戒我抄抗抖技扶抉扭把扼找批扳抒扯折扮投抓抑抆改攻攸旱更束李杏材村杜杖杞杉杆杠"],["a840","杓杗步每求汞沙沁沈沉沅沛汪決沐汰沌汨沖沒汽沃汲汾汴沆汶沍沔沘沂灶灼災灸牢牡牠狄狂玖甬甫男甸皂盯矣私秀禿究系罕肖肓肝肘肛肚育良芒"],["a8a1","芋芍見角言谷豆豕貝赤走足身車辛辰迂迆迅迄巡邑邢邪邦那酉釆里防阮阱阪阬並乖乳事些亞享京佯依侍佳使佬供例來侃佰併侈佩佻侖佾侏侑佺兔兒兕兩具其典冽函刻券刷刺到刮制剁劾劻卒協卓卑卦卷卸卹取叔受味呵"],["a940","咖呸咕咀呻呷咄咒咆呼咐呱呶和咚呢周咋命咎固垃坷坪坩坡坦坤坼夜奉奇奈奄奔妾妻委妹妮姑姆姐姍始姓姊妯妳姒姅孟孤季宗定官宜宙宛尚屈居"],["a9a1","屆岷岡岸岩岫岱岳帘帚帖帕帛帑幸庚店府底庖延弦弧弩往征彿彼忝忠忽念忿怏怔怯怵怖怪怕怡性怩怫怛或戕房戾所承拉拌拄抿拂抹拒招披拓拔拋拈抨抽押拐拙拇拍抵拚抱拘拖拗拆抬拎放斧於旺昔易昌昆昂明昀昏昕昊"],["aa40","昇服朋杭枋枕東果杳杷枇枝林杯杰板枉松析杵枚枓杼杪杲欣武歧歿氓氛泣注泳沱泌泥河沽沾沼波沫法泓沸泄油況沮泗泅泱沿治泡泛泊沬泯泜泖泠"],["aaa1","炕炎炒炊炙爬爭爸版牧物狀狎狙狗狐玩玨玟玫玥甽疝疙疚的盂盲直知矽社祀祁秉秈空穹竺糾罔羌羋者肺肥肢肱股肫肩肴肪肯臥臾舍芳芝芙芭芽芟芹花芬芥芯芸芣芰芾芷虎虱初表軋迎返近邵邸邱邶采金長門阜陀阿阻附"],["ab40","陂隹雨青非亟亭亮信侵侯便俠俑俏保促侶俘俟俊俗侮俐俄係俚俎俞侷兗冒冑冠剎剃削前剌剋則勇勉勃勁匍南卻厚叛咬哀咨哎哉咸咦咳哇哂咽咪品"],["aba1","哄哈咯咫咱咻咩咧咿囿垂型垠垣垢城垮垓奕契奏奎奐姜姘姿姣姨娃姥姪姚姦威姻孩宣宦室客宥封屎屏屍屋峙峒巷帝帥帟幽庠度建弈弭彥很待徊律徇後徉怒思怠急怎怨恍恰恨恢恆恃恬恫恪恤扁拜挖按拼拭持拮拽指拱拷"],["ac40","拯括拾拴挑挂政故斫施既春昭映昧是星昨昱昤曷柿染柱柔某柬架枯柵柩柯柄柑枴柚查枸柏柞柳枰柙柢柝柒歪殃殆段毒毗氟泉洋洲洪流津洌洱洞洗"],["aca1","活洽派洶洛泵洹洧洸洩洮洵洎洫炫為炳炬炯炭炸炮炤爰牲牯牴狩狠狡玷珊玻玲珍珀玳甚甭畏界畎畋疫疤疥疢疣癸皆皇皈盈盆盃盅省盹相眉看盾盼眇矜砂研砌砍祆祉祈祇禹禺科秒秋穿突竿竽籽紂紅紀紉紇約紆缸美羿耄"],["ad40","耐耍耑耶胖胥胚胃胄背胡胛胎胞胤胝致舢苧范茅苣苛苦茄若茂茉苒苗英茁苜苔苑苞苓苟苯茆虐虹虻虺衍衫要觔計訂訃貞負赴赳趴軍軌述迦迢迪迥"],["ada1","迭迫迤迨郊郎郁郃酋酊重閂限陋陌降面革韋韭音頁風飛食首香乘亳倌倍倣俯倦倥俸倩倖倆值借倚倒們俺倀倔倨俱倡個候倘俳修倭倪俾倫倉兼冤冥冢凍凌准凋剖剜剔剛剝匪卿原厝叟哨唐唁唷哼哥哲唆哺唔哩哭員唉哮哪"],["ae40","哦唧唇哽唏圃圄埂埔埋埃堉夏套奘奚娑娘娜娟娛娓姬娠娣娩娥娌娉孫屘宰害家宴宮宵容宸射屑展屐峭峽峻峪峨峰島崁峴差席師庫庭座弱徒徑徐恙"],["aea1","恣恥恐恕恭恩息悄悟悚悍悔悌悅悖扇拳挈拿捎挾振捕捂捆捏捉挺捐挽挪挫挨捍捌效敉料旁旅時晉晏晃晒晌晅晁書朔朕朗校核案框桓根桂桔栩梳栗桌桑栽柴桐桀格桃株桅栓栘桁殊殉殷氣氧氨氦氤泰浪涕消涇浦浸海浙涓"],["af40","浬涉浮浚浴浩涌涊浹涅浥涔烊烘烤烙烈烏爹特狼狹狽狸狷玆班琉珮珠珪珞畔畝畜畚留疾病症疲疳疽疼疹痂疸皋皰益盍盎眩真眠眨矩砰砧砸砝破砷"],["afa1","砥砭砠砟砲祕祐祠祟祖神祝祗祚秤秣秧租秦秩秘窄窈站笆笑粉紡紗紋紊素索純紐紕級紜納紙紛缺罟羔翅翁耆耘耕耙耗耽耿胱脂胰脅胭胴脆胸胳脈能脊胼胯臭臬舀舐航舫舨般芻茫荒荔荊茸荐草茵茴荏茲茹茶茗荀茱茨荃"],["b040","虔蚊蚪蚓蚤蚩蚌蚣蚜衰衷袁袂衽衹記訐討訌訕訊託訓訖訏訑豈豺豹財貢起躬軒軔軏辱送逆迷退迺迴逃追逅迸邕郡郝郢酒配酌釘針釗釜釙閃院陣陡"],["b0a1","陛陝除陘陞隻飢馬骨高鬥鬲鬼乾偺偽停假偃偌做偉健偶偎偕偵側偷偏倏偯偭兜冕凰剪副勒務勘動匐匏匙匿區匾參曼商啪啦啄啞啡啃啊唱啖問啕唯啤唸售啜唬啣唳啁啗圈國圉域堅堊堆埠埤基堂堵執培夠奢娶婁婉婦婪婀"],["b140","娼婢婚婆婊孰寇寅寄寂宿密尉專將屠屜屝崇崆崎崛崖崢崑崩崔崙崤崧崗巢常帶帳帷康庸庶庵庾張強彗彬彩彫得徙從徘御徠徜恿患悉悠您惋悴惦悽"],["b1a1","情悻悵惜悼惘惕惆惟悸惚惇戚戛扈掠控捲掖探接捷捧掘措捱掩掉掃掛捫推掄授掙採掬排掏掀捻捩捨捺敝敖救教敗啟敏敘敕敔斜斛斬族旋旌旎晝晚晤晨晦晞曹勗望梁梯梢梓梵桿桶梱梧梗械梃棄梭梆梅梔條梨梟梡梂欲殺"],["b240","毫毬氫涎涼淳淙液淡淌淤添淺清淇淋涯淑涮淞淹涸混淵淅淒渚涵淚淫淘淪深淮淨淆淄涪淬涿淦烹焉焊烽烯爽牽犁猜猛猖猓猙率琅琊球理現琍瓠瓶"],["b2a1","瓷甜產略畦畢異疏痔痕疵痊痍皎盔盒盛眷眾眼眶眸眺硫硃硎祥票祭移窒窕笠笨笛第符笙笞笮粒粗粕絆絃統紮紹紼絀細紳組累終紲紱缽羞羚翌翎習耜聊聆脯脖脣脫脩脰脤舂舵舷舶船莎莞莘荸莢莖莽莫莒莊莓莉莠荷荻荼"],["b340","莆莧處彪蛇蛀蚶蛄蚵蛆蛋蚱蚯蛉術袞袈被袒袖袍袋覓規訪訝訣訥許設訟訛訢豉豚販責貫貨貪貧赧赦趾趺軛軟這逍通逗連速逝逐逕逞造透逢逖逛途"],["b3a1","部郭都酗野釵釦釣釧釭釩閉陪陵陳陸陰陴陶陷陬雀雪雩章竟頂頃魚鳥鹵鹿麥麻傢傍傅備傑傀傖傘傚最凱割剴創剩勞勝勛博厥啻喀喧啼喊喝喘喂喜喪喔喇喋喃喳單喟唾喲喚喻喬喱啾喉喫喙圍堯堪場堤堰報堡堝堠壹壺奠"],["b440","婷媚婿媒媛媧孳孱寒富寓寐尊尋就嵌嵐崴嵇巽幅帽幀幃幾廊廁廂廄弼彭復循徨惑惡悲悶惠愜愣惺愕惰惻惴慨惱愎惶愉愀愒戟扉掣掌描揀揩揉揆揍"],["b4a1","插揣提握揖揭揮捶援揪換摒揚揹敞敦敢散斑斐斯普晰晴晶景暑智晾晷曾替期朝棺棕棠棘棗椅棟棵森棧棹棒棲棣棋棍植椒椎棉棚楮棻款欺欽殘殖殼毯氮氯氬港游湔渡渲湧湊渠渥渣減湛湘渤湖湮渭渦湯渴湍渺測湃渝渾滋"],["b540","溉渙湎湣湄湲湩湟焙焚焦焰無然煮焜牌犄犀猶猥猴猩琺琪琳琢琥琵琶琴琯琛琦琨甥甦畫番痢痛痣痙痘痞痠登發皖皓皴盜睏短硝硬硯稍稈程稅稀窘"],["b5a1","窗窖童竣等策筆筐筒答筍筋筏筑粟粥絞結絨絕紫絮絲絡給絢絰絳善翔翕耋聒肅腕腔腋腑腎脹腆脾腌腓腴舒舜菩萃菸萍菠菅萋菁華菱菴著萊菰萌菌菽菲菊萸萎萄菜萇菔菟虛蛟蛙蛭蛔蛛蛤蛐蛞街裁裂袱覃視註詠評詞証詁"],["b640","詔詛詐詆訴診訶詖象貂貯貼貳貽賁費賀貴買貶貿貸越超趁跎距跋跚跑跌跛跆軻軸軼辜逮逵週逸進逶鄂郵鄉郾酣酥量鈔鈕鈣鈉鈞鈍鈐鈇鈑閔閏開閑"],["b6a1","間閒閎隊階隋陽隅隆隍陲隄雁雅雄集雇雯雲韌項順須飧飪飯飩飲飭馮馭黃黍黑亂傭債傲傳僅傾催傷傻傯僇剿剷剽募勦勤勢勣匯嗟嗨嗓嗦嗎嗜嗇嗑嗣嗤嗯嗚嗡嗅嗆嗥嗉園圓塞塑塘塗塚塔填塌塭塊塢塒塋奧嫁嫉嫌媾媽媼"],["b740","媳嫂媲嵩嵯幌幹廉廈弒彙徬微愚意慈感想愛惹愁愈慎慌慄慍愾愴愧愍愆愷戡戢搓搾搞搪搭搽搬搏搜搔損搶搖搗搆敬斟新暗暉暇暈暖暄暘暍會榔業"],["b7a1","楚楷楠楔極椰概楊楨楫楞楓楹榆楝楣楛歇歲毀殿毓毽溢溯滓溶滂源溝滇滅溥溘溼溺溫滑準溜滄滔溪溧溴煎煙煩煤煉照煜煬煦煌煥煞煆煨煖爺牒猷獅猿猾瑯瑚瑕瑟瑞瑁琿瑙瑛瑜當畸瘀痰瘁痲痱痺痿痴痳盞盟睛睫睦睞督"],["b840","睹睪睬睜睥睨睢矮碎碰碗碘碌碉硼碑碓硿祺祿禁萬禽稜稚稠稔稟稞窟窠筷節筠筮筧粱粳粵經絹綑綁綏絛置罩罪署義羨群聖聘肆肄腱腰腸腥腮腳腫"],["b8a1","腹腺腦舅艇蒂葷落萱葵葦葫葉葬葛萼萵葡董葩葭葆虞虜號蛹蜓蜈蜇蜀蛾蛻蜂蜃蜆蜊衙裟裔裙補裘裝裡裊裕裒覜解詫該詳試詩詰誇詼詣誠話誅詭詢詮詬詹詻訾詨豢貊貉賊資賈賄貲賃賂賅跡跟跨路跳跺跪跤跦躲較載軾輊"],["b940","辟農運遊道遂達逼違遐遇遏過遍遑逾遁鄒鄗酬酪酩釉鈷鉗鈸鈽鉀鈾鉛鉋鉤鉑鈴鉉鉍鉅鈹鈿鉚閘隘隔隕雍雋雉雊雷電雹零靖靴靶預頑頓頊頒頌飼飴"],["b9a1","飽飾馳馱馴髡鳩麂鼎鼓鼠僧僮僥僖僭僚僕像僑僱僎僩兢凳劃劂匱厭嗾嘀嘛嘗嗽嘔嘆嘉嘍嘎嗷嘖嘟嘈嘐嗶團圖塵塾境墓墊塹墅塽壽夥夢夤奪奩嫡嫦嫩嫗嫖嫘嫣孵寞寧寡寥實寨寢寤察對屢嶄嶇幛幣幕幗幔廓廖弊彆彰徹慇"],["ba40","愿態慷慢慣慟慚慘慵截撇摘摔撤摸摟摺摑摧搴摭摻敲斡旗旖暢暨暝榜榨榕槁榮槓構榛榷榻榫榴槐槍榭槌榦槃榣歉歌氳漳演滾漓滴漩漾漠漬漏漂漢"],["baa1","滿滯漆漱漸漲漣漕漫漯澈漪滬漁滲滌滷熔熙煽熊熄熒爾犒犖獄獐瑤瑣瑪瑰瑭甄疑瘧瘍瘋瘉瘓盡監瞄睽睿睡磁碟碧碳碩碣禎福禍種稱窪窩竭端管箕箋筵算箝箔箏箸箇箄粹粽精綻綰綜綽綾綠緊綴網綱綺綢綿綵綸維緒緇綬"],["bb40","罰翠翡翟聞聚肇腐膀膏膈膊腿膂臧臺與舔舞艋蓉蒿蓆蓄蒙蒞蒲蒜蓋蒸蓀蓓蒐蒼蓑蓊蜿蜜蜻蜢蜥蜴蜘蝕蜷蜩裳褂裴裹裸製裨褚裯誦誌語誣認誡誓誤"],["bba1","說誥誨誘誑誚誧豪貍貌賓賑賒赫趙趕跼輔輒輕輓辣遠遘遜遣遙遞遢遝遛鄙鄘鄞酵酸酷酴鉸銀銅銘銖鉻銓銜銨鉼銑閡閨閩閣閥閤隙障際雌雒需靼鞅韶頗領颯颱餃餅餌餉駁骯骰髦魁魂鳴鳶鳳麼鼻齊億儀僻僵價儂儈儉儅凜"],["bc40","劇劈劉劍劊勰厲嘮嘻嘹嘲嘿嘴嘩噓噎噗噴嘶嘯嘰墀墟增墳墜墮墩墦奭嬉嫻嬋嫵嬌嬈寮寬審寫層履嶝嶔幢幟幡廢廚廟廝廣廠彈影德徵慶慧慮慝慕憂"],["bca1","慼慰慫慾憧憐憫憎憬憚憤憔憮戮摩摯摹撞撲撈撐撰撥撓撕撩撒撮播撫撚撬撙撢撳敵敷數暮暫暴暱樣樟槨樁樞標槽模樓樊槳樂樅槭樑歐歎殤毅毆漿潼澄潑潦潔澆潭潛潸潮澎潺潰潤澗潘滕潯潠潟熟熬熱熨牖犛獎獗瑩璋璃"],["bd40","瑾璀畿瘠瘩瘟瘤瘦瘡瘢皚皺盤瞎瞇瞌瞑瞋磋磅確磊碾磕碼磐稿稼穀稽稷稻窯窮箭箱範箴篆篇篁箠篌糊締練緯緻緘緬緝編緣線緞緩綞緙緲緹罵罷羯"],["bda1","翩耦膛膜膝膠膚膘蔗蔽蔚蓮蔬蔭蔓蔑蔣蔡蔔蓬蔥蓿蔆螂蝴蝶蝠蝦蝸蝨蝙蝗蝌蝓衛衝褐複褒褓褕褊誼諒談諄誕請諸課諉諂調誰論諍誶誹諛豌豎豬賠賞賦賤賬賭賢賣賜質賡赭趟趣踫踐踝踢踏踩踟踡踞躺輝輛輟輩輦輪輜輞"],["be40","輥適遮遨遭遷鄰鄭鄧鄱醇醉醋醃鋅銻銷鋪銬鋤鋁銳銼鋒鋇鋰銲閭閱霄霆震霉靠鞍鞋鞏頡頫頜颳養餓餒餘駝駐駟駛駑駕駒駙骷髮髯鬧魅魄魷魯鴆鴉"],["bea1","鴃麩麾黎墨齒儒儘儔儐儕冀冪凝劑劓勳噙噫噹噩噤噸噪器噥噱噯噬噢噶壁墾壇壅奮嬝嬴學寰導彊憲憑憩憊懍憶憾懊懈戰擅擁擋撻撼據擄擇擂操撿擒擔撾整曆曉暹曄曇暸樽樸樺橙橫橘樹橄橢橡橋橇樵機橈歙歷氅濂澱澡"],["bf40","濃澤濁澧澳激澹澶澦澠澴熾燉燐燒燈燕熹燎燙燜燃燄獨璜璣璘璟璞瓢甌甍瘴瘸瘺盧盥瞠瞞瞟瞥磨磚磬磧禦積穎穆穌穋窺篙簑築篤篛篡篩篦糕糖縊"],["bfa1","縑縈縛縣縞縝縉縐罹羲翰翱翮耨膳膩膨臻興艘艙蕊蕙蕈蕨蕩蕃蕉蕭蕪蕞螃螟螞螢融衡褪褲褥褫褡親覦諦諺諫諱謀諜諧諮諾謁謂諷諭諳諶諼豫豭貓賴蹄踱踴蹂踹踵輻輯輸輳辨辦遵遴選遲遼遺鄴醒錠錶鋸錳錯錢鋼錫錄錚"],["c040","錐錦錡錕錮錙閻隧隨險雕霎霑霖霍霓霏靛靜靦鞘頰頸頻頷頭頹頤餐館餞餛餡餚駭駢駱骸骼髻髭鬨鮑鴕鴣鴦鴨鴒鴛默黔龍龜優償儡儲勵嚎嚀嚐嚅嚇"],["c0a1","嚏壕壓壑壎嬰嬪嬤孺尷屨嶼嶺嶽嶸幫彌徽應懂懇懦懋戲戴擎擊擘擠擰擦擬擱擢擭斂斃曙曖檀檔檄檢檜櫛檣橾檗檐檠歜殮毚氈濘濱濟濠濛濤濫濯澀濬濡濩濕濮濰燧營燮燦燥燭燬燴燠爵牆獰獲璩環璦璨癆療癌盪瞳瞪瞰瞬"],["c140","瞧瞭矯磷磺磴磯礁禧禪穗窿簇簍篾篷簌篠糠糜糞糢糟糙糝縮績繆縷縲繃縫總縱繅繁縴縹繈縵縿縯罄翳翼聱聲聰聯聳臆臃膺臂臀膿膽臉膾臨舉艱薪"],["c1a1","薄蕾薜薑薔薯薛薇薨薊虧蟀蟑螳蟒蟆螫螻螺蟈蟋褻褶襄褸褽覬謎謗謙講謊謠謝謄謐豁谿豳賺賽購賸賻趨蹉蹋蹈蹊轄輾轂轅輿避遽還邁邂邀鄹醣醞醜鍍鎂錨鍵鍊鍥鍋錘鍾鍬鍛鍰鍚鍔闊闋闌闈闆隱隸雖霜霞鞠韓顆颶餵騁"],["c240","駿鮮鮫鮪鮭鴻鴿麋黏點黜黝黛鼾齋叢嚕嚮壙壘嬸彝懣戳擴擲擾攆擺擻擷斷曜朦檳檬櫃檻檸櫂檮檯歟歸殯瀉瀋濾瀆濺瀑瀏燻燼燾燸獷獵璧璿甕癖癘"],["c2a1","癒瞽瞿瞻瞼礎禮穡穢穠竄竅簫簧簪簞簣簡糧織繕繞繚繡繒繙罈翹翻職聶臍臏舊藏薩藍藐藉薰薺薹薦蟯蟬蟲蟠覆覲觴謨謹謬謫豐贅蹙蹣蹦蹤蹟蹕軀轉轍邇邃邈醫醬釐鎔鎊鎖鎢鎳鎮鎬鎰鎘鎚鎗闔闖闐闕離雜雙雛雞霤鞣鞦"],["c340","鞭韹額顏題顎顓颺餾餿餽餮馥騎髁鬃鬆魏魎魍鯊鯉鯽鯈鯀鵑鵝鵠黠鼕鼬儳嚥壞壟壢寵龐廬懲懷懶懵攀攏曠曝櫥櫝櫚櫓瀛瀟瀨瀚瀝瀕瀘爆爍牘犢獸"],["c3a1","獺璽瓊瓣疇疆癟癡矇礙禱穫穩簾簿簸簽簷籀繫繭繹繩繪羅繳羶羹羸臘藩藝藪藕藤藥藷蟻蠅蠍蟹蟾襠襟襖襞譁譜識證譚譎譏譆譙贈贊蹼蹲躇蹶蹬蹺蹴轔轎辭邊邋醱醮鏡鏑鏟鏃鏈鏜鏝鏖鏢鏍鏘鏤鏗鏨關隴難霪霧靡韜韻類"],["c440","願顛颼饅饉騖騙鬍鯨鯧鯖鯛鶉鵡鵲鵪鵬麒麗麓麴勸嚨嚷嚶嚴嚼壤孀孃孽寶巉懸懺攘攔攙曦朧櫬瀾瀰瀲爐獻瓏癢癥礦礪礬礫竇競籌籃籍糯糰辮繽繼"],["c4a1","纂罌耀臚艦藻藹蘑藺蘆蘋蘇蘊蠔蠕襤覺觸議譬警譯譟譫贏贍躉躁躅躂醴釋鐘鐃鏽闡霰飄饒饑馨騫騰騷騵鰓鰍鹹麵黨鼯齟齣齡儷儸囁囀囂夔屬巍懼懾攝攜斕曩櫻欄櫺殲灌爛犧瓖瓔癩矓籐纏續羼蘗蘭蘚蠣蠢蠡蠟襪襬覽譴"],["c540","護譽贓躊躍躋轟辯醺鐮鐳鐵鐺鐸鐲鐫闢霸霹露響顧顥饗驅驃驀騾髏魔魑鰭鰥鶯鶴鷂鶸麝黯鼙齜齦齧儼儻囈囊囉孿巔巒彎懿攤權歡灑灘玀瓤疊癮癬"],["c5a1","禳籠籟聾聽臟襲襯觼讀贖贗躑躓轡酈鑄鑑鑒霽霾韃韁顫饕驕驍髒鬚鱉鰱鰾鰻鷓鷗鼴齬齪龔囌巖戀攣攫攪曬欐瓚竊籤籣籥纓纖纔臢蘸蘿蠱變邐邏鑣鑠鑤靨顯饜驚驛驗髓體髑鱔鱗鱖鷥麟黴囑壩攬灞癱癲矗罐羈蠶蠹衢讓讒"],["c640","讖艷贛釀鑪靂靈靄韆顰驟鬢魘鱟鷹鷺鹼鹽鼇齷齲廳欖灣籬籮蠻觀躡釁鑲鑰顱饞髖鬣黌灤矚讚鑷韉驢驥纜讜躪釅鑽鑾鑼鱷鱸黷豔鑿鸚爨驪鬱鸛鸞籲"],["c940","乂乜凵匚厂万丌乇亍囗兀屮彳丏冇与丮亓仂仉仈冘勼卬厹圠夃夬尐巿旡殳毌气爿丱丼仨仜仩仡仝仚刌匜卌圢圣夗夯宁宄尒尻屴屳帄庀庂忉戉扐氕"],["c9a1","氶汃氿氻犮犰玊禸肊阞伎优伬仵伔仱伀价伈伝伂伅伢伓伄仴伒冱刓刉刐劦匢匟卍厊吇囡囟圮圪圴夼妀奼妅奻奾奷奿孖尕尥屼屺屻屾巟幵庄异弚彴忕忔忏扜扞扤扡扦扢扙扠扚扥旯旮朾朹朸朻机朿朼朳氘汆汒汜汏汊汔汋"],["ca40","汌灱牞犴犵玎甪癿穵网艸艼芀艽艿虍襾邙邗邘邛邔阢阤阠阣佖伻佢佉体佤伾佧佒佟佁佘伭伳伿佡冏冹刜刞刡劭劮匉卣卲厎厏吰吷吪呔呅吙吜吥吘"],["caa1","吽呏呁吨吤呇囮囧囥坁坅坌坉坋坒夆奀妦妘妠妗妎妢妐妏妧妡宎宒尨尪岍岏岈岋岉岒岊岆岓岕巠帊帎庋庉庌庈庍弅弝彸彶忒忑忐忭忨忮忳忡忤忣忺忯忷忻怀忴戺抃抌抎抏抔抇扱扻扺扰抁抈扷扽扲扴攷旰旴旳旲旵杅杇"],["cb40","杙杕杌杈杝杍杚杋毐氙氚汸汧汫沄沋沏汱汯汩沚汭沇沕沜汦汳汥汻沎灴灺牣犿犽狃狆狁犺狅玕玗玓玔玒町甹疔疕皁礽耴肕肙肐肒肜芐芏芅芎芑芓"],["cba1","芊芃芄豸迉辿邟邡邥邞邧邠阰阨阯阭丳侘佼侅佽侀侇佶佴侉侄佷佌侗佪侚佹侁佸侐侜侔侞侒侂侕佫佮冞冼冾刵刲刳剆刱劼匊匋匼厒厔咇呿咁咑咂咈呫呺呾呥呬呴呦咍呯呡呠咘呣呧呤囷囹坯坲坭坫坱坰坶垀坵坻坳坴坢"],["cc40","坨坽夌奅妵妺姏姎妲姌姁妶妼姃姖妱妽姀姈妴姇孢孥宓宕屄屇岮岤岠岵岯岨岬岟岣岭岢岪岧岝岥岶岰岦帗帔帙弨弢弣弤彔徂彾彽忞忥怭怦怙怲怋"],["cca1","怴怊怗怳怚怞怬怢怍怐怮怓怑怌怉怜戔戽抭抴拑抾抪抶拊抮抳抯抻抩抰抸攽斨斻昉旼昄昒昈旻昃昋昍昅旽昑昐曶朊枅杬枎枒杶杻枘枆构杴枍枌杺枟枑枙枃杽极杸杹枔欥殀歾毞氝沓泬泫泮泙沶泔沭泧沷泐泂沺泃泆泭泲"],["cd40","泒泝沴沊沝沀泞泀洰泍泇沰泹泏泩泑炔炘炅炓炆炄炑炖炂炚炃牪狖狋狘狉狜狒狔狚狌狑玤玡玭玦玢玠玬玝瓝瓨甿畀甾疌疘皯盳盱盰盵矸矼矹矻矺"],["cda1","矷祂礿秅穸穻竻籵糽耵肏肮肣肸肵肭舠芠苀芫芚芘芛芵芧芮芼芞芺芴芨芡芩苂芤苃芶芢虰虯虭虮豖迒迋迓迍迖迕迗邲邴邯邳邰阹阽阼阺陃俍俅俓侲俉俋俁俔俜俙侻侳俛俇俖侺俀侹俬剄剉勀勂匽卼厗厖厙厘咺咡咭咥哏"],["ce40","哃茍咷咮哖咶哅哆咠呰咼咢咾呲哞咰垵垞垟垤垌垗垝垛垔垘垏垙垥垚垕壴复奓姡姞姮娀姱姝姺姽姼姶姤姲姷姛姩姳姵姠姾姴姭宨屌峐峘峌峗峋峛"],["cea1","峞峚峉峇峊峖峓峔峏峈峆峎峟峸巹帡帢帣帠帤庰庤庢庛庣庥弇弮彖徆怷怹恔恲恞恅恓恇恉恛恌恀恂恟怤恄恘恦恮扂扃拏挍挋拵挎挃拫拹挏挌拸拶挀挓挔拺挕拻拰敁敃斪斿昶昡昲昵昜昦昢昳昫昺昝昴昹昮朏朐柁柲柈枺"],["cf40","柜枻柸柘柀枷柅柫柤柟枵柍枳柷柶柮柣柂枹柎柧柰枲柼柆柭柌枮柦柛柺柉柊柃柪柋欨殂殄殶毖毘毠氠氡洨洴洭洟洼洿洒洊泚洳洄洙洺洚洑洀洝浂"],["cfa1","洁洘洷洃洏浀洇洠洬洈洢洉洐炷炟炾炱炰炡炴炵炩牁牉牊牬牰牳牮狊狤狨狫狟狪狦狣玅珌珂珈珅玹玶玵玴珫玿珇玾珃珆玸珋瓬瓮甮畇畈疧疪癹盄眈眃眄眅眊盷盻盺矧矨砆砑砒砅砐砏砎砉砃砓祊祌祋祅祄秕种秏秖秎窀"],["d040","穾竑笀笁籺籸籹籿粀粁紃紈紁罘羑羍羾耇耎耏耔耷胘胇胠胑胈胂胐胅胣胙胜胊胕胉胏胗胦胍臿舡芔苙苾苹茇苨茀苕茺苫苖苴苬苡苲苵茌苻苶苰苪"],["d0a1","苤苠苺苳苭虷虴虼虳衁衎衧衪衩觓訄訇赲迣迡迮迠郱邽邿郕郅邾郇郋郈釔釓陔陏陑陓陊陎倞倅倇倓倢倰倛俵俴倳倷倬俶俷倗倜倠倧倵倯倱倎党冔冓凊凄凅凈凎剡剚剒剞剟剕剢勍匎厞唦哢唗唒哧哳哤唚哿唄唈哫唑唅哱"],["d140","唊哻哷哸哠唎唃唋圁圂埌堲埕埒垺埆垽垼垸垶垿埇埐垹埁夎奊娙娖娭娮娕娏娗娊娞娳孬宧宭宬尃屖屔峬峿峮峱峷崀峹帩帨庨庮庪庬弳弰彧恝恚恧"],["d1a1","恁悢悈悀悒悁悝悃悕悛悗悇悜悎戙扆拲挐捖挬捄捅挶捃揤挹捋捊挼挩捁挴捘捔捙挭捇挳捚捑挸捗捀捈敊敆旆旃旄旂晊晟晇晑朒朓栟栚桉栲栳栻桋桏栖栱栜栵栫栭栯桎桄栴栝栒栔栦栨栮桍栺栥栠欬欯欭欱欴歭肂殈毦毤"],["d240","毨毣毢毧氥浺浣浤浶洍浡涒浘浢浭浯涑涍淯浿涆浞浧浠涗浰浼浟涂涘洯浨涋浾涀涄洖涃浻浽浵涐烜烓烑烝烋缹烢烗烒烞烠烔烍烅烆烇烚烎烡牂牸"],["d2a1","牷牶猀狺狴狾狶狳狻猁珓珙珥珖玼珧珣珩珜珒珛珔珝珚珗珘珨瓞瓟瓴瓵甡畛畟疰痁疻痄痀疿疶疺皊盉眝眛眐眓眒眣眑眕眙眚眢眧砣砬砢砵砯砨砮砫砡砩砳砪砱祔祛祏祜祓祒祑秫秬秠秮秭秪秜秞秝窆窉窅窋窌窊窇竘笐"],["d340","笄笓笅笏笈笊笎笉笒粄粑粊粌粈粍粅紞紝紑紎紘紖紓紟紒紏紌罜罡罞罠罝罛羖羒翃翂翀耖耾耹胺胲胹胵脁胻脀舁舯舥茳茭荄茙荑茥荖茿荁茦茜茢"],["d3a1","荂荎茛茪茈茼荍茖茤茠茷茯茩荇荅荌荓茞茬荋茧荈虓虒蚢蚨蚖蚍蚑蚞蚇蚗蚆蚋蚚蚅蚥蚙蚡蚧蚕蚘蚎蚝蚐蚔衃衄衭衵衶衲袀衱衿衯袃衾衴衼訒豇豗豻貤貣赶赸趵趷趶軑軓迾迵适迿迻逄迼迶郖郠郙郚郣郟郥郘郛郗郜郤酐"],["d440","酎酏釕釢釚陜陟隼飣髟鬯乿偰偪偡偞偠偓偋偝偲偈偍偁偛偊偢倕偅偟偩偫偣偤偆偀偮偳偗偑凐剫剭剬剮勖勓匭厜啵啶唼啍啐唴唪啑啢唶唵唰啒啅"],["d4a1","唌唲啥啎唹啈唭唻啀啋圊圇埻堔埢埶埜埴堀埭埽堈埸堋埳埏堇埮埣埲埥埬埡堎埼堐埧堁堌埱埩埰堍堄奜婠婘婕婧婞娸娵婭婐婟婥婬婓婤婗婃婝婒婄婛婈媎娾婍娹婌婰婩婇婑婖婂婜孲孮寁寀屙崞崋崝崚崠崌崨崍崦崥崏"],["d540","崰崒崣崟崮帾帴庱庴庹庲庳弶弸徛徖徟悊悐悆悾悰悺惓惔惏惤惙惝惈悱惛悷惊悿惃惍惀挲捥掊掂捽掽掞掭掝掗掫掎捯掇掐据掯捵掜捭掮捼掤挻掟"],["d5a1","捸掅掁掑掍捰敓旍晥晡晛晙晜晢朘桹梇梐梜桭桮梮梫楖桯梣梬梩桵桴梲梏桷梒桼桫桲梪梀桱桾梛梖梋梠梉梤桸桻梑梌梊桽欶欳欷欸殑殏殍殎殌氪淀涫涴涳湴涬淩淢涷淶淔渀淈淠淟淖涾淥淜淝淛淴淊涽淭淰涺淕淂淏淉"],["d640","淐淲淓淽淗淍淣涻烺焍烷焗烴焌烰焄烳焐烼烿焆焓焀烸烶焋焂焎牾牻牼牿猝猗猇猑猘猊猈狿猏猞玈珶珸珵琄琁珽琇琀珺珼珿琌琋珴琈畤畣痎痒痏"],["d6a1","痋痌痑痐皏皉盓眹眯眭眱眲眴眳眽眥眻眵硈硒硉硍硊硌砦硅硐祤祧祩祪祣祫祡离秺秸秶秷窏窔窐笵筇笴笥笰笢笤笳笘笪笝笱笫笭笯笲笸笚笣粔粘粖粣紵紽紸紶紺絅紬紩絁絇紾紿絊紻紨罣羕羜羝羛翊翋翍翐翑翇翏翉耟"],["d740","耞耛聇聃聈脘脥脙脛脭脟脬脞脡脕脧脝脢舑舸舳舺舴舲艴莐莣莨莍荺荳莤荴莏莁莕莙荵莔莩荽莃莌莝莛莪莋荾莥莯莈莗莰荿莦莇莮荶莚虙虖蚿蚷"],["d7a1","蛂蛁蛅蚺蚰蛈蚹蚳蚸蛌蚴蚻蚼蛃蚽蚾衒袉袕袨袢袪袚袑袡袟袘袧袙袛袗袤袬袌袓袎覂觖觙觕訰訧訬訞谹谻豜豝豽貥赽赻赹趼跂趹趿跁軘軞軝軜軗軠軡逤逋逑逜逌逡郯郪郰郴郲郳郔郫郬郩酖酘酚酓酕釬釴釱釳釸釤釹釪"],["d840","釫釷釨釮镺閆閈陼陭陫陱陯隿靪頄飥馗傛傕傔傞傋傣傃傌傎傝偨傜傒傂傇兟凔匒匑厤厧喑喨喥喭啷噅喢喓喈喏喵喁喣喒喤啽喌喦啿喕喡喎圌堩堷"],["d8a1","堙堞堧堣堨埵塈堥堜堛堳堿堶堮堹堸堭堬堻奡媯媔媟婺媢媞婸媦婼媥媬媕媮娷媄媊媗媃媋媩婻婽媌媜媏媓媝寪寍寋寔寑寊寎尌尰崷嵃嵫嵁嵋崿崵嵑嵎嵕崳崺嵒崽崱嵙嵂崹嵉崸崼崲崶嵀嵅幄幁彘徦徥徫惉悹惌惢惎惄愔"],["d940","惲愊愖愅惵愓惸惼惾惁愃愘愝愐惿愄愋扊掔掱掰揎揥揨揯揃撝揳揊揠揶揕揲揵摡揟掾揝揜揄揘揓揂揇揌揋揈揰揗揙攲敧敪敤敜敨敥斌斝斞斮旐旒"],["d9a1","晼晬晻暀晱晹晪晲朁椌棓椄棜椪棬棪棱椏棖棷棫棤棶椓椐棳棡椇棌椈楰梴椑棯棆椔棸棐棽棼棨椋椊椗棎棈棝棞棦棴棑椆棔棩椕椥棇欹欻欿欼殔殗殙殕殽毰毲毳氰淼湆湇渟湉溈渼渽湅湢渫渿湁湝湳渜渳湋湀湑渻渃渮湞"],["da40","湨湜湡渱渨湠湱湫渹渢渰湓湥渧湸湤湷湕湹湒湦渵渶湚焠焞焯烻焮焱焣焥焢焲焟焨焺焛牋牚犈犉犆犅犋猒猋猰猢猱猳猧猲猭猦猣猵猌琮琬琰琫琖"],["daa1","琚琡琭琱琤琣琝琩琠琲瓻甯畯畬痧痚痡痦痝痟痤痗皕皒盚睆睇睄睍睅睊睎睋睌矞矬硠硤硥硜硭硱硪确硰硩硨硞硢祴祳祲祰稂稊稃稌稄窙竦竤筊笻筄筈筌筎筀筘筅粢粞粨粡絘絯絣絓絖絧絪絏絭絜絫絒絔絩絑絟絎缾缿罥"],["db40","罦羢羠羡翗聑聏聐胾胔腃腊腒腏腇脽腍脺臦臮臷臸臹舄舼舽舿艵茻菏菹萣菀菨萒菧菤菼菶萐菆菈菫菣莿萁菝菥菘菿菡菋菎菖菵菉萉萏菞萑萆菂菳"],["dba1","菕菺菇菑菪萓菃菬菮菄菻菗菢萛菛菾蛘蛢蛦蛓蛣蛚蛪蛝蛫蛜蛬蛩蛗蛨蛑衈衖衕袺裗袹袸裀袾袶袼袷袽袲褁裉覕覘覗觝觚觛詎詍訹詙詀詗詘詄詅詒詈詑詊詌詏豟貁貀貺貾貰貹貵趄趀趉跘跓跍跇跖跜跏跕跙跈跗跅軯軷軺"],["dc40","軹軦軮軥軵軧軨軶軫軱軬軴軩逭逴逯鄆鄬鄄郿郼鄈郹郻鄁鄀鄇鄅鄃酡酤酟酢酠鈁鈊鈥鈃鈚鈦鈏鈌鈀鈒釿釽鈆鈄鈧鈂鈜鈤鈙鈗鈅鈖镻閍閌閐隇陾隈"],["dca1","隉隃隀雂雈雃雱雰靬靰靮頇颩飫鳦黹亃亄亶傽傿僆傮僄僊傴僈僂傰僁傺傱僋僉傶傸凗剺剸剻剼嗃嗛嗌嗐嗋嗊嗝嗀嗔嗄嗩喿嗒喍嗏嗕嗢嗖嗈嗲嗍嗙嗂圔塓塨塤塏塍塉塯塕塎塝塙塥塛堽塣塱壼嫇嫄嫋媺媸媱媵媰媿嫈媻嫆"],["dd40","媷嫀嫊媴媶嫍媹媐寖寘寙尟尳嵱嵣嵊嵥嵲嵬嵞嵨嵧嵢巰幏幎幊幍幋廅廌廆廋廇彀徯徭惷慉慊愫慅愶愲愮慆愯慏愩慀戠酨戣戥戤揅揱揫搐搒搉搠搤"],["dda1","搳摃搟搕搘搹搷搢搣搌搦搰搨摁搵搯搊搚摀搥搧搋揧搛搮搡搎敯斒旓暆暌暕暐暋暊暙暔晸朠楦楟椸楎楢楱椿楅楪椹楂楗楙楺楈楉椵楬椳椽楥棰楸椴楩楀楯楄楶楘楁楴楌椻楋椷楜楏楑椲楒椯楻椼歆歅歃歂歈歁殛嗀毻毼"],["de40","毹毷毸溛滖滈溏滀溟溓溔溠溱溹滆滒溽滁溞滉溷溰滍溦滏溲溾滃滜滘溙溒溎溍溤溡溿溳滐滊溗溮溣煇煔煒煣煠煁煝煢煲煸煪煡煂煘煃煋煰煟煐煓"],["dea1","煄煍煚牏犍犌犑犐犎猼獂猻猺獀獊獉瑄瑊瑋瑒瑑瑗瑀瑏瑐瑎瑂瑆瑍瑔瓡瓿瓾瓽甝畹畷榃痯瘏瘃痷痾痼痹痸瘐痻痶痭痵痽皙皵盝睕睟睠睒睖睚睩睧睔睙睭矠碇碚碔碏碄碕碅碆碡碃硹碙碀碖硻祼禂祽祹稑稘稙稒稗稕稢稓"],["df40","稛稐窣窢窞竫筦筤筭筴筩筲筥筳筱筰筡筸筶筣粲粴粯綈綆綀綍絿綅絺綎絻綃絼綌綔綄絽綒罭罫罧罨罬羦羥羧翛翜耡腤腠腷腜腩腛腢腲朡腞腶腧腯"],["dfa1","腄腡舝艉艄艀艂艅蓱萿葖葶葹蒏蒍葥葑葀蒆葧萰葍葽葚葙葴葳葝蔇葞萷萺萴葺葃葸萲葅萩菙葋萯葂萭葟葰萹葎葌葒葯蓅蒎萻葇萶萳葨葾葄萫葠葔葮葐蜋蜄蛷蜌蛺蛖蛵蝍蛸蜎蜉蜁蛶蜍蜅裖裋裍裎裞裛裚裌裐覅覛觟觥觤"],["e040","觡觠觢觜触詶誆詿詡訿詷誂誄詵誃誁詴詺谼豋豊豥豤豦貆貄貅賌赨赩趑趌趎趏趍趓趔趐趒跰跠跬跱跮跐跩跣跢跧跲跫跴輆軿輁輀輅輇輈輂輋遒逿"],["e0a1","遄遉逽鄐鄍鄏鄑鄖鄔鄋鄎酮酯鉈鉒鈰鈺鉦鈳鉥鉞銃鈮鉊鉆鉭鉬鉏鉠鉧鉯鈶鉡鉰鈱鉔鉣鉐鉲鉎鉓鉌鉖鈲閟閜閞閛隒隓隑隗雎雺雽雸雵靳靷靸靲頏頍頎颬飶飹馯馲馰馵骭骫魛鳪鳭鳧麀黽僦僔僗僨僳僛僪僝僤僓僬僰僯僣僠"],["e140","凘劀劁勩勫匰厬嘧嘕嘌嘒嗼嘏嘜嘁嘓嘂嗺嘝嘄嗿嗹墉塼墐墘墆墁塿塴墋塺墇墑墎塶墂墈塻墔墏壾奫嫜嫮嫥嫕嫪嫚嫭嫫嫳嫢嫠嫛嫬嫞嫝嫙嫨嫟孷寠"],["e1a1","寣屣嶂嶀嵽嶆嵺嶁嵷嶊嶉嶈嵾嵼嶍嵹嵿幘幙幓廘廑廗廎廜廕廙廒廔彄彃彯徶愬愨慁慞慱慳慒慓慲慬憀慴慔慺慛慥愻慪慡慖戩戧戫搫摍摛摝摴摶摲摳摽摵摦撦摎撂摞摜摋摓摠摐摿搿摬摫摙摥摷敳斠暡暠暟朅朄朢榱榶槉"],["e240","榠槎榖榰榬榼榑榙榎榧榍榩榾榯榿槄榽榤槔榹槊榚槏榳榓榪榡榞槙榗榐槂榵榥槆歊歍歋殞殟殠毃毄毾滎滵滱漃漥滸漷滻漮漉潎漙漚漧漘漻漒滭漊"],["e2a1","漶潳滹滮漭潀漰漼漵滫漇漎潃漅滽滶漹漜滼漺漟漍漞漈漡熇熐熉熀熅熂熏煻熆熁熗牄牓犗犕犓獃獍獑獌瑢瑳瑱瑵瑲瑧瑮甀甂甃畽疐瘖瘈瘌瘕瘑瘊瘔皸瞁睼瞅瞂睮瞀睯睾瞃碲碪碴碭碨硾碫碞碥碠碬碢碤禘禊禋禖禕禔禓"],["e340","禗禈禒禐稫穊稰稯稨稦窨窫窬竮箈箜箊箑箐箖箍箌箛箎箅箘劄箙箤箂粻粿粼粺綧綷緂綣綪緁緀緅綝緎緄緆緋緌綯綹綖綼綟綦綮綩綡緉罳翢翣翥翞"],["e3a1","耤聝聜膉膆膃膇膍膌膋舕蒗蒤蒡蒟蒺蓎蓂蒬蒮蒫蒹蒴蓁蓍蒪蒚蒱蓐蒝蒧蒻蒢蒔蓇蓌蒛蒩蒯蒨蓖蒘蒶蓏蒠蓗蓔蓒蓛蒰蒑虡蜳蜣蜨蝫蝀蜮蜞蜡蜙蜛蝃蜬蝁蜾蝆蜠蜲蜪蜭蜼蜒蜺蜱蜵蝂蜦蜧蜸蜤蜚蜰蜑裷裧裱裲裺裾裮裼裶裻"],["e440","裰裬裫覝覡覟覞觩觫觨誫誙誋誒誏誖谽豨豩賕賏賗趖踉踂跿踍跽踊踃踇踆踅跾踀踄輐輑輎輍鄣鄜鄠鄢鄟鄝鄚鄤鄡鄛酺酲酹酳銥銤鉶銛鉺銠銔銪銍"],["e4a1","銦銚銫鉹銗鉿銣鋮銎銂銕銢鉽銈銡銊銆銌銙銧鉾銇銩銝銋鈭隞隡雿靘靽靺靾鞃鞀鞂靻鞄鞁靿韎韍頖颭颮餂餀餇馝馜駃馹馻馺駂馽駇骱髣髧鬾鬿魠魡魟鳱鳲鳵麧僿儃儰僸儆儇僶僾儋儌僽儊劋劌勱勯噈噂噌嘵噁噊噉噆噘"],["e540","噚噀嘳嘽嘬嘾嘸嘪嘺圚墫墝墱墠墣墯墬墥墡壿嫿嫴嫽嫷嫶嬃嫸嬂嫹嬁嬇嬅嬏屧嶙嶗嶟嶒嶢嶓嶕嶠嶜嶡嶚嶞幩幝幠幜緳廛廞廡彉徲憋憃慹憱憰憢憉"],["e5a1","憛憓憯憭憟憒憪憡憍慦憳戭摮摰撖撠撅撗撜撏撋撊撌撣撟摨撱撘敶敺敹敻斲斳暵暰暩暲暷暪暯樀樆樗槥槸樕槱槤樠槿槬槢樛樝槾樧槲槮樔槷槧橀樈槦槻樍槼槫樉樄樘樥樏槶樦樇槴樖歑殥殣殢殦氁氀毿氂潁漦潾澇濆澒"],["e640","澍澉澌潢潏澅潚澖潶潬澂潕潲潒潐潗澔澓潝漀潡潫潽潧澐潓澋潩潿澕潣潷潪潻熲熯熛熰熠熚熩熵熝熥熞熤熡熪熜熧熳犘犚獘獒獞獟獠獝獛獡獚獙"],["e6a1","獢璇璉璊璆璁瑽璅璈瑼瑹甈甇畾瘥瘞瘙瘝瘜瘣瘚瘨瘛皜皝皞皛瞍瞏瞉瞈磍碻磏磌磑磎磔磈磃磄磉禚禡禠禜禢禛歶稹窲窴窳箷篋箾箬篎箯箹篊箵糅糈糌糋緷緛緪緧緗緡縃緺緦緶緱緰緮緟罶羬羰羭翭翫翪翬翦翨聤聧膣膟"],["e740","膞膕膢膙膗舖艏艓艒艐艎艑蔤蔻蔏蔀蔩蔎蔉蔍蔟蔊蔧蔜蓻蔫蓺蔈蔌蓴蔪蓲蔕蓷蓫蓳蓼蔒蓪蓩蔖蓾蔨蔝蔮蔂蓽蔞蓶蔱蔦蓧蓨蓰蓯蓹蔘蔠蔰蔋蔙蔯虢"],["e7a1","蝖蝣蝤蝷蟡蝳蝘蝔蝛蝒蝡蝚蝑蝞蝭蝪蝐蝎蝟蝝蝯蝬蝺蝮蝜蝥蝏蝻蝵蝢蝧蝩衚褅褌褔褋褗褘褙褆褖褑褎褉覢覤覣觭觰觬諏諆誸諓諑諔諕誻諗誾諀諅諘諃誺誽諙谾豍貏賥賟賙賨賚賝賧趠趜趡趛踠踣踥踤踮踕踛踖踑踙踦踧"],["e840","踔踒踘踓踜踗踚輬輤輘輚輠輣輖輗遳遰遯遧遫鄯鄫鄩鄪鄲鄦鄮醅醆醊醁醂醄醀鋐鋃鋄鋀鋙銶鋏鋱鋟鋘鋩鋗鋝鋌鋯鋂鋨鋊鋈鋎鋦鋍鋕鋉鋠鋞鋧鋑鋓"],["e8a1","銵鋡鋆銴镼閬閫閮閰隤隢雓霅霈霂靚鞊鞎鞈韐韏頞頝頦頩頨頠頛頧颲餈飺餑餔餖餗餕駜駍駏駓駔駎駉駖駘駋駗駌骳髬髫髳髲髱魆魃魧魴魱魦魶魵魰魨魤魬鳼鳺鳽鳿鳷鴇鴀鳹鳻鴈鴅鴄麃黓鼏鼐儜儓儗儚儑凞匴叡噰噠噮"],["e940","噳噦噣噭噲噞噷圜圛壈墽壉墿墺壂墼壆嬗嬙嬛嬡嬔嬓嬐嬖嬨嬚嬠嬞寯嶬嶱嶩嶧嶵嶰嶮嶪嶨嶲嶭嶯嶴幧幨幦幯廩廧廦廨廥彋徼憝憨憖懅憴懆懁懌憺"],["e9a1","憿憸憌擗擖擐擏擉撽撉擃擛擳擙攳敿敼斢曈暾曀曊曋曏暽暻暺曌朣樴橦橉橧樲橨樾橝橭橶橛橑樨橚樻樿橁橪橤橐橏橔橯橩橠樼橞橖橕橍橎橆歕歔歖殧殪殫毈毇氄氃氆澭濋澣濇澼濎濈潞濄澽澞濊澨瀄澥澮澺澬澪濏澿澸"],["ea40","澢濉澫濍澯澲澰燅燂熿熸燖燀燁燋燔燊燇燏熽燘熼燆燚燛犝犞獩獦獧獬獥獫獪瑿璚璠璔璒璕璡甋疀瘯瘭瘱瘽瘳瘼瘵瘲瘰皻盦瞚瞝瞡瞜瞛瞢瞣瞕瞙"],["eaa1","瞗磝磩磥磪磞磣磛磡磢磭磟磠禤穄穈穇窶窸窵窱窷篞篣篧篝篕篥篚篨篹篔篪篢篜篫篘篟糒糔糗糐糑縒縡縗縌縟縠縓縎縜縕縚縢縋縏縖縍縔縥縤罃罻罼罺羱翯耪耩聬膱膦膮膹膵膫膰膬膴膲膷膧臲艕艖艗蕖蕅蕫蕍蕓蕡蕘"],["eb40","蕀蕆蕤蕁蕢蕄蕑蕇蕣蔾蕛蕱蕎蕮蕵蕕蕧蕠薌蕦蕝蕔蕥蕬虣虥虤螛螏螗螓螒螈螁螖螘蝹螇螣螅螐螑螝螄螔螜螚螉褞褦褰褭褮褧褱褢褩褣褯褬褟觱諠"],["eba1","諢諲諴諵諝謔諤諟諰諈諞諡諨諿諯諻貑貒貐賵賮賱賰賳赬赮趥趧踳踾踸蹀蹅踶踼踽蹁踰踿躽輶輮輵輲輹輷輴遶遹遻邆郺鄳鄵鄶醓醐醑醍醏錧錞錈錟錆錏鍺錸錼錛錣錒錁鍆錭錎錍鋋錝鋺錥錓鋹鋷錴錂錤鋿錩錹錵錪錔錌"],["ec40","錋鋾錉錀鋻錖閼闍閾閹閺閶閿閵閽隩雔霋霒霐鞙鞗鞔韰韸頵頯頲餤餟餧餩馞駮駬駥駤駰駣駪駩駧骹骿骴骻髶髺髹髷鬳鮀鮅鮇魼魾魻鮂鮓鮒鮐魺鮕"],["eca1","魽鮈鴥鴗鴠鴞鴔鴩鴝鴘鴢鴐鴙鴟麈麆麇麮麭黕黖黺鼒鼽儦儥儢儤儠儩勴嚓嚌嚍嚆嚄嚃噾嚂噿嚁壖壔壏壒嬭嬥嬲嬣嬬嬧嬦嬯嬮孻寱寲嶷幬幪徾徻懃憵憼懧懠懥懤懨懞擯擩擣擫擤擨斁斀斶旚曒檍檖檁檥檉檟檛檡檞檇檓檎"],["ed40","檕檃檨檤檑橿檦檚檅檌檒歛殭氉濌澩濴濔濣濜濭濧濦濞濲濝濢濨燡燱燨燲燤燰燢獳獮獯璗璲璫璐璪璭璱璥璯甐甑甒甏疄癃癈癉癇皤盩瞵瞫瞲瞷瞶"],["eda1","瞴瞱瞨矰磳磽礂磻磼磲礅磹磾礄禫禨穜穛穖穘穔穚窾竀竁簅簏篲簀篿篻簎篴簋篳簂簉簃簁篸篽簆篰篱簐簊糨縭縼繂縳顈縸縪繉繀繇縩繌縰縻縶繄縺罅罿罾罽翴翲耬膻臄臌臊臅臇膼臩艛艚艜薃薀薏薧薕薠薋薣蕻薤薚薞"],["ee40","蕷蕼薉薡蕺蕸蕗薎薖薆薍薙薝薁薢薂薈薅蕹蕶薘薐薟虨螾螪螭蟅螰螬螹螵螼螮蟉蟃蟂蟌螷螯蟄蟊螴螶螿螸螽蟞螲褵褳褼褾襁襒褷襂覭覯覮觲觳謞"],["eea1","謘謖謑謅謋謢謏謒謕謇謍謈謆謜謓謚豏豰豲豱豯貕貔賹赯蹎蹍蹓蹐蹌蹇轃轀邅遾鄸醚醢醛醙醟醡醝醠鎡鎃鎯鍤鍖鍇鍼鍘鍜鍶鍉鍐鍑鍠鍭鎏鍌鍪鍹鍗鍕鍒鍏鍱鍷鍻鍡鍞鍣鍧鎀鍎鍙闇闀闉闃闅閷隮隰隬霠霟霘霝霙鞚鞡鞜"],["ef40","鞞鞝韕韔韱顁顄顊顉顅顃餥餫餬餪餳餲餯餭餱餰馘馣馡騂駺駴駷駹駸駶駻駽駾駼騃骾髾髽鬁髼魈鮚鮨鮞鮛鮦鮡鮥鮤鮆鮢鮠鮯鴳鵁鵧鴶鴮鴯鴱鴸鴰"],["efa1","鵅鵂鵃鴾鴷鵀鴽翵鴭麊麉麍麰黈黚黻黿鼤鼣鼢齔龠儱儭儮嚘嚜嚗嚚嚝嚙奰嬼屩屪巀幭幮懘懟懭懮懱懪懰懫懖懩擿攄擽擸攁攃擼斔旛曚曛曘櫅檹檽櫡櫆檺檶檷櫇檴檭歞毉氋瀇瀌瀍瀁瀅瀔瀎濿瀀濻瀦濼濷瀊爁燿燹爃燽獶"],["f040","璸瓀璵瓁璾璶璻瓂甔甓癜癤癙癐癓癗癚皦皽盬矂瞺磿礌礓礔礉礐礒礑禭禬穟簜簩簙簠簟簭簝簦簨簢簥簰繜繐繖繣繘繢繟繑繠繗繓羵羳翷翸聵臑臒"],["f0a1","臐艟艞薴藆藀藃藂薳薵薽藇藄薿藋藎藈藅薱薶藒蘤薸薷薾虩蟧蟦蟢蟛蟫蟪蟥蟟蟳蟤蟔蟜蟓蟭蟘蟣螤蟗蟙蠁蟴蟨蟝襓襋襏襌襆襐襑襉謪謧謣謳謰謵譇謯謼謾謱謥謷謦謶謮謤謻謽謺豂豵貙貘貗賾贄贂贀蹜蹢蹠蹗蹖蹞蹥蹧"],["f140","蹛蹚蹡蹝蹩蹔轆轇轈轋鄨鄺鄻鄾醨醥醧醯醪鎵鎌鎒鎷鎛鎝鎉鎧鎎鎪鎞鎦鎕鎈鎙鎟鎍鎱鎑鎲鎤鎨鎴鎣鎥闒闓闑隳雗雚巂雟雘雝霣霢霥鞬鞮鞨鞫鞤鞪"],["f1a1","鞢鞥韗韙韖韘韺顐顑顒颸饁餼餺騏騋騉騍騄騑騊騅騇騆髀髜鬈鬄鬅鬩鬵魊魌魋鯇鯆鯃鮿鯁鮵鮸鯓鮶鯄鮹鮽鵜鵓鵏鵊鵛鵋鵙鵖鵌鵗鵒鵔鵟鵘鵚麎麌黟鼁鼀鼖鼥鼫鼪鼩鼨齌齕儴儵劖勷厴嚫嚭嚦嚧嚪嚬壚壝壛夒嬽嬾嬿巃幰"],["f240","徿懻攇攐攍攉攌攎斄旞旝曞櫧櫠櫌櫑櫙櫋櫟櫜櫐櫫櫏櫍櫞歠殰氌瀙瀧瀠瀖瀫瀡瀢瀣瀩瀗瀤瀜瀪爌爊爇爂爅犥犦犤犣犡瓋瓅璷瓃甖癠矉矊矄矱礝礛"],["f2a1","礡礜礗礞禰穧穨簳簼簹簬簻糬糪繶繵繸繰繷繯繺繲繴繨罋罊羃羆羷翽翾聸臗臕艤艡艣藫藱藭藙藡藨藚藗藬藲藸藘藟藣藜藑藰藦藯藞藢蠀蟺蠃蟶蟷蠉蠌蠋蠆蟼蠈蟿蠊蠂襢襚襛襗襡襜襘襝襙覈覷覶觶譐譈譊譀譓譖譔譋譕"],["f340","譑譂譒譗豃豷豶貚贆贇贉趬趪趭趫蹭蹸蹳蹪蹯蹻軂轒轑轏轐轓辴酀鄿醰醭鏞鏇鏏鏂鏚鏐鏹鏬鏌鏙鎩鏦鏊鏔鏮鏣鏕鏄鏎鏀鏒鏧镽闚闛雡霩霫霬霨霦"],["f3a1","鞳鞷鞶韝韞韟顜顙顝顗颿颽颻颾饈饇饃馦馧騚騕騥騝騤騛騢騠騧騣騞騜騔髂鬋鬊鬎鬌鬷鯪鯫鯠鯞鯤鯦鯢鯰鯔鯗鯬鯜鯙鯥鯕鯡鯚鵷鶁鶊鶄鶈鵱鶀鵸鶆鶋鶌鵽鵫鵴鵵鵰鵩鶅鵳鵻鶂鵯鵹鵿鶇鵨麔麑黀黼鼭齀齁齍齖齗齘匷嚲"],["f440","嚵嚳壣孅巆巇廮廯忀忁懹攗攖攕攓旟曨曣曤櫳櫰櫪櫨櫹櫱櫮櫯瀼瀵瀯瀷瀴瀱灂瀸瀿瀺瀹灀瀻瀳灁爓爔犨獽獼璺皫皪皾盭矌矎矏矍矲礥礣礧礨礤礩"],["f4a1","禲穮穬穭竷籉籈籊籇籅糮繻繾纁纀羺翿聹臛臙舋艨艩蘢藿蘁藾蘛蘀藶蘄蘉蘅蘌藽蠙蠐蠑蠗蠓蠖襣襦覹觷譠譪譝譨譣譥譧譭趮躆躈躄轙轖轗轕轘轚邍酃酁醷醵醲醳鐋鐓鏻鐠鐏鐔鏾鐕鐐鐨鐙鐍鏵鐀鏷鐇鐎鐖鐒鏺鐉鏸鐊鏿"],["f540","鏼鐌鏶鐑鐆闞闠闟霮霯鞹鞻韽韾顠顢顣顟飁飂饐饎饙饌饋饓騲騴騱騬騪騶騩騮騸騭髇髊髆鬐鬒鬑鰋鰈鯷鰅鰒鯸鱀鰇鰎鰆鰗鰔鰉鶟鶙鶤鶝鶒鶘鶐鶛"],["f5a1","鶠鶔鶜鶪鶗鶡鶚鶢鶨鶞鶣鶿鶩鶖鶦鶧麙麛麚黥黤黧黦鼰鼮齛齠齞齝齙龑儺儹劘劗囃嚽嚾孈孇巋巏廱懽攛欂櫼欃櫸欀灃灄灊灈灉灅灆爝爚爙獾甗癪矐礭礱礯籔籓糲纊纇纈纋纆纍罍羻耰臝蘘蘪蘦蘟蘣蘜蘙蘧蘮蘡蘠蘩蘞蘥"],["f640","蠩蠝蠛蠠蠤蠜蠫衊襭襩襮襫觺譹譸譅譺譻贐贔趯躎躌轞轛轝酆酄酅醹鐿鐻鐶鐩鐽鐼鐰鐹鐪鐷鐬鑀鐱闥闤闣霵霺鞿韡顤飉飆飀饘饖騹騽驆驄驂驁騺"],["f6a1","騿髍鬕鬗鬘鬖鬺魒鰫鰝鰜鰬鰣鰨鰩鰤鰡鶷鶶鶼鷁鷇鷊鷏鶾鷅鷃鶻鶵鷎鶹鶺鶬鷈鶱鶭鷌鶳鷍鶲鹺麜黫黮黭鼛鼘鼚鼱齎齥齤龒亹囆囅囋奱孋孌巕巑廲攡攠攦攢欋欈欉氍灕灖灗灒爞爟犩獿瓘瓕瓙瓗癭皭礵禴穰穱籗籜籙籛籚"],["f740","糴糱纑罏羇臞艫蘴蘵蘳蘬蘲蘶蠬蠨蠦蠪蠥襱覿覾觻譾讄讂讆讅譿贕躕躔躚躒躐躖躗轠轢酇鑌鑐鑊鑋鑏鑇鑅鑈鑉鑆霿韣顪顩飋饔饛驎驓驔驌驏驈驊"],["f7a1","驉驒驐髐鬙鬫鬻魖魕鱆鱈鰿鱄鰹鰳鱁鰼鰷鰴鰲鰽鰶鷛鷒鷞鷚鷋鷐鷜鷑鷟鷩鷙鷘鷖鷵鷕鷝麶黰鼵鼳鼲齂齫龕龢儽劙壨壧奲孍巘蠯彏戁戃戄攩攥斖曫欑欒欏毊灛灚爢玂玁玃癰矔籧籦纕艬蘺虀蘹蘼蘱蘻蘾蠰蠲蠮蠳襶襴襳觾"],["f840","讌讎讋讈豅贙躘轤轣醼鑢鑕鑝鑗鑞韄韅頀驖驙鬞鬟鬠鱒鱘鱐鱊鱍鱋鱕鱙鱌鱎鷻鷷鷯鷣鷫鷸鷤鷶鷡鷮鷦鷲鷰鷢鷬鷴鷳鷨鷭黂黐黲黳鼆鼜鼸鼷鼶齃齏"],["f8a1","齱齰齮齯囓囍孎屭攭曭曮欓灟灡灝灠爣瓛瓥矕礸禷禶籪纗羉艭虃蠸蠷蠵衋讔讕躞躟躠躝醾醽釂鑫鑨鑩雥靆靃靇韇韥驞髕魙鱣鱧鱦鱢鱞鱠鸂鷾鸇鸃鸆鸅鸀鸁鸉鷿鷽鸄麠鼞齆齴齵齶囔攮斸欘欙欗欚灢爦犪矘矙礹籩籫糶纚"],["f940","纘纛纙臠臡虆虇虈襹襺襼襻觿讘讙躥躤躣鑮鑭鑯鑱鑳靉顲饟鱨鱮鱭鸋鸍鸐鸏鸒鸑麡黵鼉齇齸齻齺齹圞灦籯蠼趲躦釃鑴鑸鑶鑵驠鱴鱳鱱鱵鸔鸓黶鼊"],["f9a1","龤灨灥糷虪蠾蠽蠿讞貜躩軉靋顳顴飌饡馫驤驦驧鬤鸕鸗齈戇欞爧虌躨钂钀钁驩驨鬮鸙爩虋讟钃鱹麷癵驫鱺鸝灩灪麤齾齉龘碁銹裏墻恒粧嫺╔╦╗╠╬╣╚╩╝╒╤╕╞╪╡╘╧╛╓╥╖╟╫╢╙╨╜║═╭╮╰╯▓"]]',
      );
    },
    36220(eA) {
      "use strict";
      eA.exports = JSON.parse(
        '[["8740","䏰䰲䘃䖦䕸\uD85C\uDE67䵷䖳\uD85F\uDCB1䳢\uD85F\uDCC5㮕䜶䝄䱇䱀\uD850\uDEBF\uD84D\uDE17\uD85C\uDF52\uD85B\uDE8B\uD85C\uDCD2䱗\uD868\uDF51䝏䗚䲅\uD85F\uDC6C䴇䪤䚡\uD85A\uDF23爥\uD856\uDE54\uD846\uDE63\uD84F\uDE06\uD84F\uDF61晍囻"],["8767","綕夝\uD862\uDFB9㷴霴\uD85E\uDFEF寛\uD847\uDD5E媤㘥\uD867\uDEB0嫑宷峼杮薓\uD866\uDD45瑡璝㡵\uD847\uDD53\uD84D\uDE9E\uD858\uDC21㻬"],["87a1","\uD856\uDCDE㫵竼龗\uD850\uDD61\uD862\uDD0D\uD84C\uDDEA\uD842\uDE8A\uD84C\uDE5E䌊蒄龖鐯䤰蘓墖靊鈘秐稲晠権袝瑌篅枂稬剏遆㓦珄\uD857\uDDB9瓆鿇垳䤯呌䄱\uD84D\uDE8E堘穲\uD85E\uDF65讏䚮\uD85B\uDE88䆁\uD857\uDD99箮\uD849\uDCBC鿈\uD849\uDCC1\uD849\uDCC9\uD849\uDCCC鿉蔄\uD84D\uDDBB䂴鿊䓡\uD86B\uDDFF拁灮鿋"],["8840","㇀",4,"\uD840\uDD0C㇅\uD840\uDCD1\uD840\uDCCD㇆㇇\uD840\uDCCB\uD847\uDFE8㇈\uD840\uDCCA㇉㇊㇋㇌\uD840\uDD0E㇍㇎Ā\xc1Ǎ\xc0Ē\xc9Ě\xc8Ō\xd3Ǒ\xd2࿿\xcāẾ࿿\xcǎỀ\xcaā\xe1ǎ\xe0ɑē\xe9ě\xe8ī\xedǐ\xecō\xf3ǒ\xf2ū\xfaǔ\xf9ǖǘǚ"],["88a1","ǜ\xfc࿿\xeāế࿿\xeǎề\xeaɡ⏚⏛"],["8940","\uD868\uDFA9\uD844\uDD45"],["8943","攊"],["8946","丽滝鵎釟"],["894c","\uD85D\uDF35撑会伨侨兖兴农凤务动医华发变团声处备夲头学实実岚庆总斉柾栄桥济炼电纤纬纺织经统缆缷艺苏药视设询车轧轮"],["89a1","琑糼緍楆竉刧"],["89ab","醌碸酞肼"],["89b0","贋胶\uD842\uDDE7"],["89b5","肟黇䳍鷉鸌䰾\uD867\uDDF6\uD85C\uDC0E鸊\uD868\uDD33㗁"],["89c1","溚舾甙"],["89c5","䤑马骏龙禇\uD861\uDC6C\uD847\uDDCA\uD841\uDDD0\uD84A\uDEE6两亁亀亇亿仫伷㑌侽㹈倃傈㑽㒓㒥円夅凛凼刅争剹劐匧㗇厩㕑厰㕓参吣㕭㕲㚁咓咣咴咹哐哯唘唣唨㖘唿㖥㖿嗗㗅"],["8a40","\uD85F\uDD84唥"],["8a43","\uD843\uDC42\uD843\uDD15\uD854\uDD2B喐\uD84B\uDCC6㧬\uD840\uDF41蹆\uD853\uDDB8\uD865\uDCE5䁓\uD860\uDCBE睺\uD84B\uDC38㨴䟕\uD860\uDD5D\uD85A\uDDF2\uD853\uDDEA擝\uD843\uDD7C\uD843\uDFB4\uD843\uDCD5\uD844\uDCF4撍蹾\uD843\uDE96\uD843\uDC0B\uD843\uDF64\uD84B\uDCA9\uD860\uDE56\uD851\uDCD3"],["8a64","\uD843\uDD46\uD866\uDE4D\uD860\uDCE9䟴\uD853\uDEA7\uD84B\uDCC2骲㩧\uD865\uDDF4㿭㔆\uD854\uDEC7\uD865\uDFD4\uD85E\uDCC8\uD84B\uDD44鵮頕"],["8a76","䏙\uD858\uDCA5撴哣\uD84B\uDD4C\uD84A\uDFCA\uD844\uDC77㧻\uD844\uDC6F"],["8aa1","\uD859\uDEDA\uD859\uDF16\uD85E\uDDA0擪\uD854\uDC52\uD843\uDC43蹨\uD848\uDDA1\uD862\uDF4C\uD841\uDF31"],["8aac","䠋\uD840\uDDA9㿺塳\uD84B\uDD8D"],["8ab2","\uD851\uDDC8\uD841\uDCFC\uD858\uDC97\uD843\uDF4C\uD843\uDD96啹䂻䎺"],["8abb","䪴\uD84A\uDE66\uD844\uDC9D膪飵\uD843\uDD9C捹㧾\uD849\uDF75跀嚡摼㹃"],["8ac9","\uD869\uDE01\uD843\uDE09\uD84A\uDECF\uD84B\uDCC9"],["8ace","\uD844\uDCC8\uD84E\uDDC2㦒㨆\uD860\uDE9B㕸\uD857\uDE49\uD848\uDCC7噒\uD843\uDF31\uD84B\uDCB2\uD865\uDF20㒼氽\uD853\uDE3B"],["8adf","\uD85D\uDD74\uD84B\uDE8B\uD848\uDE08\uD869\uDE5B\uD863\uDCCD\uD843\uDE7A\uD843\uDC34\uD85A\uDC1C羓\uD844\uDCCF\uD84A\uDC03\uD84A\uDD39㗻\uD854\uDDE3\uD843\uDE8C\uD843\uDF8D\uD843\uDEAA㾓\uD843\uDF30\uD843\uDD47\uD844\uDD4F\uD843\uDE4C"],["8af6","\uD843\uDEAB\uD842\uDFA9\uD843\uDD48\uD844\uDCC0\uD844\uDD3D㿹\uD849\uDE96搲\uD843\uDFAD"],["8b40","\uD84C\uDFF4\uD85D\uDE39\uD84A\uDFCE\uD843\uDD7E\uD843\uDD7F\uD84B\uDC51\uD84B\uDC55㨘\uD843\uDE98\uD844\uDCC7\uD843\uDF2E\uD869\uDE32\uD85A\uDF50\uD863\uDCD2\uD863\uDD99\uD863\uDCCA閪哌苄喹"],["8b55","\uD867\uDEC3鰦骶\uD85D\uDF5E\uD84B\uDDEE煀腭胬尜\uD859\uDD72脴㞗卟\uD860\uDCBD醶\uD843\uDEFA\uD843\uDE0F\uD843\uDE77\uD843\uDEFB㗝\uD853\uDDEB㘉\uD843\uDCD6嚯\uD849\uDFB5\uD844\uDCC9\uD843\uDE10\uD843\uDE78\uD844\uDC78\uD844\uDD48\uD860\uDE07\uD845\uDC55\uD843\uDE79\uD853\uDE50\uD84B\uDDA4婔\uD844\uDC1D\uD844\uDC1E\uD844\uDCF5\uD844\uDCF6垜\uD843\uDE11"],["8ba1","\uD85D\uDE94\uD860\uDECD\uD843\uDFB5\uD843\uDE7B\uD854\uDD7E㜃\uD843\uDFB6\uD844\uDD80\uD854\uDED8\uD868\uDEBD\uD852\uDDDA\uD846\uDC3A\uD850\uDD77\uD860\uDE7C墙剨㘚\uD855\uDF3D箲孨䠀䬬鼧䧧鰟鮍\uD856\uDF74\uD84C\uDD3D嗻㗲嚉丨夂\uD846\uDFC1\uD87E\uDC78靑\uD840\uDC86乛亻㔾尣彑忄㣺扌攵歺氵氺灬爫丬犭\uD852\uDCE9罒礻糹罓\uD858\uDE6A㓁"],["8bde","\uD858\uDF4B耂肀\uD859\uDE12\uD85A\uDD51卝衤见\uD85E\uDCB2讠贝钅镸长门\uD863\uDE0F韦页风飞饣\uD866\uDC10鱼鸟黄歯龜丷\uD840\uDC87阝户钢"],["8c40","倻淾\uD867\uDC73龦㷉袏\uD850\uDD4E灷峵䬠\uD854\uDDCD㕙\uD857\uDD30愢\uD862\uDE32辧釶熑朙玺\uD84C\uDE81\uD868\uDD07㲋\uD846\uDD80䬐磤琂冮\uD861\uDF0F䀉橣\uD868\uDEBA䈣蘏\uD842\uDE6F稪\uD866\uDD47\uD862\uDEEA靕灍匤\uD848\uDC7E鏴盙\uD862\uDDE3龧矝亣俰傼丯众龨吴綋墒壐\uD847\uDDB6庒庙忂\uD849\uDF12斋"],["8ca1","\uD84C\uDFF9椙橃\uD84F\uDC63泿"],["8ca7","爀\uD851\uDD05玌㻛\uD852\uDE13嬕璹讃\uD857\uDCA4\uD855\uDE95窓篬糃繬苸薗龩袐龪躹龫迏蕟駠鈡龬\uD863\uDDB9\uD845\uDC3F䁱䊢娚"],["8cc9","顨杫䉶圽"],["8cce","藖\uD852\uDD7B芿\uD85C\uDD0D䲁\uD85B\uDD74嵻\uD85A\uDF15\uD85B\uDFBE龭龮宖龯曧繛湗秊㶈䓃\uD84C\uDE56\uD849\uDF96䎚䔶"],["8ce6","峕\uD84E\uDF1A諹屸㴒\uD84D\uDD51嵸龲煗䕘\uD850\uDCEC\uD847\uDE23䱷㥸㑊\uD840\uDDA4\uD85B\uDC41諌侴\uD840\uDE39妿腬顖\uD866\uDCFA弻"],["8d40","\uD842\uDF9F"],["8d42","\uD848\uDDC1\uD862\uDD6D䄂䚻\uD864\uDC79㼇龳\uD868\uDDB5䃸㟖䛷\uD85B\uDC46䅼\uD861\uDEB2\uD85C\uDFFF䕭㣔\uD855\uDC9A䕡䔛䶉䱻䵶䗪㿈\uD852\uDF0F㙡䓞䒽䇭崾嵈嵖㷼㠏嶤嶹㠠㠸幂庽弥徃㤈㤔㤿㥍惗愽峥㦉憷憹懏㦸戬抐拥挘㧸嚱"],["8da1","㨃揢揻搇摚㩋擀崕嘡龟㪗斆㪽旿晓㫲暒㬢朖㭂枤栀㭘桊梄㭲㭱㭻椉楃牜楤榟榅㮼槖㯝橥橴橱檂㯬檙㯲檫檵櫔櫶殁毁毪汵沪㳋洂洆洦涁㳯涤涱渕渘温溆\uD862\uDDC0溻滢滚齿滨滩漤漴㵆\uD84F\uDF41澁澾㵪㵵熷岙㶊瀬㶑灐灔灯灿炉\uD840\uDF25䏁㗱\uD843\uDED8"],["8e40","\uD84F\uDED7垾\uD85B\uDED3焾\uD855\uDFE0㙎榢\uD862\uDFE9孴穉\uD856\uDCE1\uD865\uDCD9穥穽\uD856\uDDAC窻窰竂竃燑\uD859\uDC8D䇊竚竝竪䇯咲\uD857\uDC01笋筕笩\uD854\uDF0E\uD857\uDCFE箢筯莜\uD856\uDFB4\uD85B\uDC7F篐萡箒箸\uD857\uDD20㶭\uD857\uDC65蒒篺簆簵\uD857\uDCC1籄粃\uD852\uDC82粦晽\uD851\uDD78糉糇糦籴糳糵糎"],["8ea1","繧䔝\uD85B\uDE44絝\uD85B\uDED6璍綉綫焵綳緒\uD850\uDC57\uD858\uDC29緤㴓緵\uD845\uDFF9緥\uD860\uDF6D縝\uD858\uDD21\uD858\uDD5A繮纒䌫鑬縧罀罁罇礶\uD858\uDED0駡羗\uD858\uDF51羣\uD845\uDE61\uD840\uDC68䕜\uD84D\uDF66䔃\uD860\uDF3A翺\uD859\uDC89者耈耝耨耯\uD868\uDC87\uD85B\uDCC3耻耼聡\uD849\uDF14䦉\uD859\uDE26\uD84F\uDDE3\uD859\uDEE8朥肧\uD862\uDE48脇脚墰\uD849\uDEF6汿\uD859\uDC98\uD853\uDFB8擧\uD845\uDC8A舘\uD846\uDC5E橓\uD852\uDE65\uD852\uDE95䑺舩\uD842\uDF0D\uD85A\uDE52\uD84F\uDD7E俹\uD845\uDCFD蓢荢\uD85A\uDF0A\uD852\uDDA7\uD84D\uDD30\uD845\uDF73\uD84F\uDDF8芪椛\uD87E\uDD94䇛"],["8f40","蕋苐茚\uD843\uDE16\uD845\uDFB4㛁\uD84C\uDD7D\uD84D\uDD5A艻苢茘\uD84F\uDE8B\uD85B\uDDA3\uD85A\uDF05\uD85A\uDF97\uD84D\uDDCE㶿茝嗬莅䔋\uD85B\uDDA5莬菁菓㑾\uD85B\uDED4橗蕚㒖\uD85B\uDE42\uD84B\uDEEF葘\uD856\uDFE4葱㷓䓤檧葊\uD84F\uDCB5祘蒨\uD85A\uDF96\uD85B\uDE77\uD85B\uDE43蓞萏莑䒠蒓蓤\uD857\uDC91䉀\uD857\uDCC0䕃蔴嫲\uD85B\uDE99䔧蕳䔖枿蘖"],["8fa1","\uD861\uDE25\uD861\uDE3B藁\uD85C\uDC88蘂\uD845\uDD82\uD85C\uDCCD\uD87E\uDDB2䕪蘨㙈\uD846\uDCA2号\uD85C\uDF9A虾蝱\uD868\uDCF8蟮\uD84B\uDC27螱蟚蠏噡虬桖䘏衅衆\uD85D\uDDE0\uD84F\uDDB9\uD85D\uDDE4衞袜䙛袴袵揁装睷\uD85D\uDF0F覇覊覦覩覧覼\uD862\uDE25觧\uD85E\uDD24\uD85E\uDEBD誜瞓釾誐\uD85E\uDE59竩\uD85E\uDF3A\uD84F\uDF8F䜓\uD85E\uDF38煼謌謟\uD855\uDC30\uD855\uDD65謿譌譍誩\uD852\uDE7A讐讛誯\uD845\uDEDF䘕衏貛\uD85F\uDD54\uD85F\uDD8F\uD87E\uDDD4㜥\uD85F\uDD53賖\uD85F\uDD98\uD85F\uDDBD贒贃\uD846\uDD10賛灜贑\uD853\uDCC9㻐起"],["9040","趩\uD860\uDC02\uD844\uDC14\uD852\uDD8A㭼\uD860\uDDBC\uD85C\uDD0C竧躭躶軃鋔輙輭\uD860\uDF65\uD861\uDC12辥錃\uD868\uDE9F\uD842\uDE50辳䤪\uD862\uDDDE\uD861\uDD3D\uD84F\uDDBB廸\uD84C\uDE62迹\uD868\uDC14\uD861\uDEBC\uD861\uDD01\uD848\uDF25㦀\uD85B\uDED7逷\uD861\uDD3C\uD85E\uDEBE遡\uD861\uDD6C\uD861\uDE0B邨\uD861\uDF13郄\uD861\uDEE6邮都酧㫰醩釄粬\uD862\uDD33\uD847\uDE89鈎沟鉁鉢\uD855\uDDB9銹\uD862\uDEC6\uD84F\uDC9B\uD862\uDF0C\uD855\uDDDB"],["90a1","\uD843\uDD31錬鍫\uD862\uDEE1\uD862\uDFEB炏嫃\uD862\uDEE2\uD862\uDEE5䥥鉄\uD862\uDFEC\uD863\uDC39\uD862\uDFFF鍳鑛躼閅閦鐦閠濶䊹\uD849\uDE7A\uD861\uDED8\uD844\uDE7C\uD84F\uDE2E䧟氜陻隖䅬隣\uD85B\uDED5懚隶磵\uD862\uDEE0隽双䦡\uD85B\uDCB8\uD840\uDE74\uD859\uDC10\uD864\uDCAF\uD864\uDCE5\uD852\uDED1\uD846\uDD15\uD84C\uDF0A霱虂霶䨏䔽䖅\uD852\uDEE9灵孁霛靜\uD864\uDDD5靗孊\uD864\uDDEB靟鐥僐\uD84C\uDCB7\uD84C\uDCBC鞉鞟鞱鞾韀韒韠\uD855\uDC6C韮琜\uD865\uDC33響韵\uD865\uDC1D\uD85E\uDD7A䫑頴頳顋顦㬎\uD85C\uDD75㵑\uD841\uDE30\uD850\uDD5C"],["9140","\uD855\uDF06飊颷飈飇䫿\uD85B\uDD27\uD845\uDED3喰飡飦飬鍸餹\uD852\uDE29䭲\uD866\uDC57\uD866\uDD05駵騌騻騐驘\uD855\uDF25㛄\uD864\uDCB1\uD866\uDFD5髠髢\uD866\uDF05髴䰎鬔鬭\uD861\uDE00倴鬴\uD85A\uDDA8㣃\uD84C\uDC7D魐魀\uD867\uDD3E婅\uD846\uDC63鮎\uD850\uDE4B鰂鯿鰌\uD867\uDE68鷔\uD867\uDFB7\uD868\uDD92\uD868\uDDAB\uD868\uDCE1\uD868\uDD23\uD868\uDDDF鵾鶃\uD868\uDD34鸎梈"],["91a1","鷄\uD848\uDD5B\uD868\uDD93\uD868\uDE20\uD846\uDD3B\uD868\uDE33鴹\uD868\uDCB9\uD868\uDEB4麐麕麞麢䴴麪麯\uD850\uDF64黁㭠㧥㴝伲㞾\uD863\uDC2B鼂鼈䮖鐤\uD85B\uDDA2鼗鼖鼹嚟嚊齅馸\uD864\uDC8B韲葿齢齩竜龎爖䮾\uD852\uDD75\uD852\uDDBB煷\uD852\uDDF8\uD850\uDF48\uD852\uDE51玞\uD862\uDFDA\uD846\uDCFA禟\uD862\uDD7E\uD863\uDE36鍩鏳\uD862\uDE44鋬鎁鏋\uD862\uDD6C\uD851\uDCB9爗㻫睲穃烐\uD851\uDC73\uD850\uDFF8煾\uD845\uDFEF炣\uD846\uDCBE\uD84D\uDD99㻇\uD846\uDC85\uD855\uDC2F\uD845\uDFF8㜢\uD845\uDEFB\uD846\uDC39㛡\uD845\uDF74\uD846\uDCD1\uD857\uDF4B㜣\uD845\uDEC0坛\uD852\uDE25\uD844\uDFFE\uD844\uDEA8"],["9240","\uD844\uDFC6\uD845\uDCB6蔃\uD84D\uDEA6蔃葕\uD852\uDD94\uD85C\uDD65\uD84F\uDE31\uD855\uDD5C\uD84F\uDEFB\uD85C\uDC52䓴\uD84D\uDEEE\uD866\uDD9D\uD85B\uDF26柹㜳㰕㷧塬\uD846\uDD22栐䁗\uD84D\uDF3F\uD850\uDCE1\uD850\uDC8B\uD850\uDD0F\uD85B\uDC21哋嚞\uD859\uDEB1嚒\uD843\uDFDF\uD842\uDFA8\uD843\uDE0D鏆\uD862\uDF13鎜仸儫㠙\uD851\uDC36亼\uD841\uDC65\uD840\uDF7F佋侊\uD855\uDE51婨\uD840\uDDAB\uD840\uDFCB㦙\uD840\uDF0A\uD841\uDC14㐵伩\uD840\uDEC0\uD863\uDEB3\uD840\uDE75諚\uD840\uDE0C亘"],["92a1","働儍侢伃\uD852\uDE0E\uD84F\uDE8A佂倮偬傁俌俥偘僼兙兛兝兞湶\uD84D\uDD95\uD84F\uDE39\uD84F\uDEBF浲\uD846\uDC84\uD84F\uDE89冨凃\uD841\uDDE0䓝\uD841\uDCA3\uD841\uDC92\uD841\uDC91赺\uD862\uDE9C\uD841\uDF0E剙劤\uD842\uDC73勡鍮䙺熌\uD850\uDF8C\uD843\uDC20\uD852\uDDAC\uD844\uDCE4槑\uD843\uDE1D瑹㻞璙琔瑖玘䮎\uD852\uDEBC\uD850\uDC8D叐㖄爏\uD850\uDCC9喴\uD840\uDF45响\uD842\uDFC6圝鉝雴鍦埝垍坿㘾壋媙\uD862\uDE46\uD845\uDEFA\uD845\uDF6F\uD845\uDF10娬妸銏婾嫏娒\uD856\uDD46\uD846\uDDF3\uD846\uDC61\uD850\uDE95㛵洅瑃娡\uD857\uDE83"],["9340","媁\uD862\uDFD7\uD841\uDC13鏠璌\uD844\uDF03焅䥲鐈\uD862\uDDFB鎽㞠尞岞幞幈\uD846\uDD96\uD846\uDD7C\uD84E\uDEEE廍孏\uD846\uDD03\uD846\uDD04㜁\uD846\uDCA0㛝\uD845\uDEFE㛓脪\uD862\uDE47\uD847\uDDBA\uD84D\uDC72\uD862\uDDA8弌弎\uD846\uDD27\uD845\uDFAB婫\uD845\uDF3B孄蘔\uD85D\uDDFD衠恾\uD84A\uDC60\uD849\uDE2B忛㺸\uD849\uDDAF\uD849\uDDBE\uD864\uDC88\uD85B\uDF73懀\uD840\uDC3E\uD840\uDC46\uD849\uDE1B憙憘恵\uD84B\uDC9B\uD84B\uDD07\uD851\uDED4\uD864\uDD4D"],["93a1","摱\uD851\uDE65\uD84A\uDF6A㨩\uD84A\uDF22\uD84D\uDC50\uD866\uDCEA\uD84B\uDE78挷\uD869\uDC5B撶挱揑\uD852\uDDE3\uD84B\uDD67护\uD84B\uDCA1搻敫楲㯴\uD84C\uDC8E\uD84C\uDEAD\uD852\uDD89\uD84C\uDEAB唍\uD84C\uDEE0\uD846\uDCD9\uD865\uDC3F曎\uD84C\uDE89\uD84C\uDDB3㫠䆐\uD855\uDD84\uD862\uDF22\uD855\uDD8F\uD845\uDEFC\uD855\uDD5B\uD855\uDC25磮\uD84C\uDD03\uD846\uDC2A\uD84C\uDE34㑤\uD84C\uDE0F\uD84C\uDD82\uD850\uDEC9暎\uD85B\uDD24晫䮓昰\uD85E\uDC70\uD847\uDDEB晣\uD84C\uDED2\uD84C\uDEE1昞\uD856\uDC72㣑\uD84E\uDC3A\uD84D\uDFBC㮙\uD84D\uDFA2\uD84C\uDFFE瓐㮖枏\uD851\uDE2A梶栞㯄檾㡣\uD84D\uDFD5\uD851\uDC87樳橒櫉欅\uD846\uDD12攑梘橌㯗橺歗\uD84F\uDFC0\uD84F\uDC9A鎠鋲\uD862\uDFEA\uD862\uDECB"],["9440","銉\uD860\uDC1E\uD862\uDDDC鑧涥漋\uD852\uDDEC浧\uD84F\uDF7F㶏渄\uD850\uDC3C娽渊塇洤硂焻\uD850\uDF1A\uD850\uDE76烱牐犇犔\uD851\uDF8F\uD851\uDF25兹\uD852\uDEA4\uD841\uDDEB瑺\uD84F\uDEF8\uD84D\uDE5F\uD852\uDE4A\uD852\uDD17\uD857\uDFE1㼆㺱\uD852\uDEDF\uD863\uDC23\uD84F\uDF35悧㻳瓌琼鎇琷䒟\uD85B\uDDEA䕑疃㽣\uD853\uDCD9\uD853\uDD06㽘畕癳\uD869\uDDC6㬙瑨\uD862\uDECC\uD852\uDDAB\uD852\uDD8E㫻"],["94a1","㷍\uD852\uDE4E㻿\uD852\uDDC5\uD852\uDCF3釺圲鍂\uD862\uDEE3\uD846\uDC64僟\uD854\uDE21\uD854\uDDE7睸\uD84C\uDE32眎眏睻\uD851\uDE97\uD84D\uDF81㩞\uD852\uDCF0琸璛㺿\uD852\uDEBA\uD852\uDEC7䃈\uD852\uDE96\uD858\uDDAE錇\uD855\uDD81砞碍碈磒珐祙\uD85D\uDF41\uD855\uDEE3䄎禛蒖禥樭\uD84F\uDEFA稺秴䅮\uD845\uDEE6䄲鈵秱\uD843\uDD4C\uD852\uDD8C\uD840\uDE99\uD84F\uDDBA\uD845\uDF6E㖗啫㕰㚪\uD840\uDDD4\uD843\uDC0D竢婙\uD849\uDEF5\uD856\uDEAF\uD856\uDE9C娍\uD840\uDE5B磰娪\uD856\uDFC6竾䇹籝籭䈑\uD856\uDFB3\uD857\uDEBC\uD857\uDEA6糍\uD852\uDDF9\uD845\uDFB0粎籼粮檲緜縇緓罎\uD858\uDE61"],["9540","\uD858\uDD5C\uD85E\uDF48綗\uD857\uDE82䉪\uD85A\uDF75\uD842\uDD16柖\uD840\uDC4E\uD84D\uDDCF埄\uD859\uDC12\uD858\uDFF8\uD852\uDD62翝笧\uD842\uDC2C\uD856\uDEE9\uD857\uDD43笌\uD857\uDE0E駦虅驣樜\uD84D\uDC3F㧢\uD852\uDDF7\uD859\uDDAD騟\uD859\uDDA0蒀\uD85C\uDD27\uD85B\uDCD1䓪脷䐂胆脉腂\uD859\uDFB4飃\uD85A\uDE42艢艥\uD85A\uDE51葓\uD85B\uDDA7蘐\uD85C\uDE1B媆䅿\uD846\uDC40嬫\uD846\uDCA1嫤\uD846\uDCD8蚠\uD87E\uDDBC\uD84F\uDD8F蠭\uD85D\uDC22娂"],["95a1","衮佅袇袿裦襥襍\uD855\uDE83襔\uD85D\uDF85\uD85D\uDF84\uD862\uDFF5\uD862\uDFD9\uD862\uDF9C\uD862\uDDF9㺭蒣䛵䛏㟲訽訜\uD865\uDC48彍鈫\uD850\uDE84旔焩烄\uD846\uDC45鵭貟賩\uD85F\uDDDC妚矃姰䍮㛔踪躧\uD853\uDC09輰轊䋴汘澻\uD848\uDF21䢛潹溋\uD845\uDFDA鯩㚵\uD852\uDD2F邻邗啱䤆醻鐄\uD862\uDE4B䁢\uD862\uDEFC鐧\uD863\uDC1D\uD863\uDC3B蓥訫閙閧閗閖\uD863\uDD34瑅㻂\uD852\uDCFF\uD852\uDE42\uD850\uDFEA㻧\uD84C\uDE25随\uD863\uDEE7\uD863\uDE66\uD863\uDE65㻌\uD852\uDDED\uD852\uDE78\uD84F\uDFEE琒瑫㻼靁\uD864\uDCB0"],["9640","桇䨝\uD864\uDC93\uD855\uDFDF靝鍨\uD862\uDD89\uD863\uDC26\uD862\uDF2F\uD858\uDFBE銺嬑譩䤼珹\uD850\uDE1B鞛靱餸\uD843\uDF26巁\uD862\uDFC5\uD852\uDEB2頟\uD865\uDCDA鋶\uD865\uDDD7釥䓀\uD862\uDF50\uD852\uDE67\uD862\uDF64飜\uD862\uDE45㼀鈪䤥萔餻饍\uD85E\uDF06㷽馛䭯馪驜\uD862\uDF65\uD856\uDCC8檏騡嫾騯\uD866\uDCF1䮐\uD866\uDD48馼䮽䮗鍽塲\uD844\uDF02堢\uD852\uDDB8"],["96a1","\uD845\uDCE8硄\uD849\uDF1F\uD84F\uDDB8棅㵽鑘㤧慐\uD849\uDF81\uD84A\uDD6B愇鱏鱓鱻鰵鰐魿鯏\uD867\uDE2D鮟\uD868\uDDF5\uD868\uDCFE鴡䲮\uD850\uDD04鸘䲰鴌\uD868\uDDB4\uD868\uDCED\uD868\uDCF3\uD866\uDD2F鶥蒽\uD85B\uDE12\uD85B\uDFDF\uD85A\uDF82藼䔳\uD85B\uDDA4\uD85B\uDE84\uD85B\uDDF0萠藮\uD85B\uDE00\uD84D\uDFD7\uD858\uDC64秢\uD84D\uDD9C\uD84D\uDE40䤭\uD852\uDDDE㵢鏛銾鍈\uD840\uDEBF碹鉷鑍俤㑀遤\uD855\uDD5D砽硔碶硋\uD845\uDF57\uD84C\uDDC9\uD852\uDD41㚚佲濚濙瀞瀞吔\uD850\uDDB5垻壳垊鴖埗焴㒯\uD850\uDDAC燫\uD85B\uDC40\uD853\uDF97嬨\uD845\uDFB5\uD862\uDE49"],["9740","愌嫎娋䊼\uD851\uDC88㜬䭻\uD862\uDDFC鎻鎸\uD846\uDCD6\uD843\uDF1D葲\uD85B\uDCC0\uD845\uDC13\uD850\uDEFA\uD84B\uDC26\uD850\uDFC1妔\uD84F\uDDB7\uD859\uDF41綨\uD858\uDD5B\uD858\uDCA4\uD852\uDDB9\uD852\uDD8B\uD862\uDDFA鋥珢㻩璴\uD862\uDF63\uD846\uDC9F㻡\uD852\uDEB3櫘珳珻㻖\uD852\uDE3E\uD852\uDE94\uD845\uDFD9\uD852\uDE66\uD840\uDFA7\uD845\uDC24\uD852\uDDE5瑈\uD852\uDD16炥\uD852\uDD76銄珦鍟\uD841\uDCFE錱\uD862\uDECE\uD862\uDE16鎆\uD862\uDFE7\uD855\uDDD5䤵\uD862\uDE82煫"],["97a1","\uD852\uDD43\uD843\uDCFF嚤\uD841\uDE1A\uD842\uDFEB\uD843\uDCB8唂秄\uD845\uDFFA緾\uD845\uDEC2\uD852\uDE50\uD846\uDC52䔮鐁㜊\uD862\uDEC0\uD852\uDDAD妰\uD846\uDCBF\uD846\uDC83\uD85D\uDC84媡㛢\uD84F\uDD5B㚰鉟婹\uD862\uDE81\uD846\uDC62鍴㳍\uD842\uDEB4䪖㦊僴㵩㵌\uD844\uDF9C煵䋻\uD860\uDE18渏\uD864\uDCE4䓫浗\uD85F\uDE4F灧沯㳖\uD84F\uDFED\uD84F\uDE2D渂漌㵯\uD840\uDFF5畑㚼㓈䚀㻚䡱姄鉮䤾轁\uD863\uDC1C\uD85A\uDFC0堒埈㛖\uD845\uDC52烾\uD850\uDF62\uD852\uDE71\uD84B\uDFE3\uD844\uDEB0\uD848\uDFBD梹楧\uD844\uDF98\uD84D\uDCE5\uD85E\uDFF4\uD84D\uDEDF\uD862\uDE83\uD84D\uDFD6\uD84C\uDFFA\uD853\uDC9F樚\uD84D\uDEAD\uD85B\uDCB7萾䓟䓎"],["9840","\uD85B\uDD26\uD85B\uDD51\uD85B\uDC82\uD85B\uDFDE漗\uD85C\uDD09茽\uD845\uDF3A菭\uD85B\uDC80\uD85C\uDC53\uD845\uDFDB妉媂\uD845\uDFB3婡婱\uD846\uDD05\uD850\uDDFC㜭姯\uD845\uDF3C㛇熎鎐暚\uD850\uDEA5婮娫\uD850\uDE93樫\uD84F\uDEF9\uD85D\uDF36\uD851\uDC5B\uD850\uDECA焝\uD850\uDE59\uD862\uDDE1侰\uD85B\uDD28峂\uD851\uDCCE\uD85F\uDE4D\uD850\uDFBD樌\uD850\uDE56\uD844\uDF04炦焳\uD850\uDFE9㶥泟\uD87E\uDC25\uD852\uDE4F繥姫崯㷳彜\uD852\uDE5D\uD845\uDFDF綤萦"],["98a1","咅\uD84E\uDEFA\uD84C\uDF00\uD840\uDE14坾\uD842\uDCD5\uD841\uDE19㿥\uD847\uDF9E\uD868\uDEB6瀃\uD864\uDD5B嵰玏糓\uD862\uDE59\uD865\uDC20俈翧狍猐\uD85E\uDEF4猸猹\uD855\uDEF6獁獈㺩\uD85E\uDF18遬燵\uD852\uDCF2珡臶㻊県㻑沢国琙琞琟㻢㻰㻴㻺瓓㼎㽓畂畭畲疍㽼痈痜㿀癍㿗癴㿜発\uD853\uDF5C熈嘣覀塩䀝睃䀹条䁅㗛瞘䁪䁯属瞾矋売砘点砜䂨砹硇硑硦葈\uD855\uDD35礳栃礲䄃"],["9940","䄉禑禙辻稆込䅧窑䆲窼艹䇄竏竛䇏両筢筬筻簒簛䉠䉺类粜䊌粸䊔糭输烀\uD843\uDCCF総緔緐緽羮羴犟䎗耠耥笹耮耱联㷌垴炠肷胩䏭脌猪脎脒畠脔䐁㬹腖腙腚"],["99a1","䐓堺腼膄䐥膓䐭膥埯臁臤艔䒏芦艶苊苘苿䒰荗险榊萅烵葤惣蒈䔄蒾蓡蓸蔐蔸蕒䔻蕯蕰藠䕷虲蚒蚲蛯际螋䘆䘗袮裿褤襇覑\uD85E\uDD67訩訸誔誴豑賔賲贜䞘塟跃䟭仮踺嗘坔蹱嗵躰䠷軎転軤軭軲辷迁迊迌逳駄䢭飠鈓䤞鈨鉘鉫銱銮銿"],["9a40","鋣鋫鋳鋴鋽鍃鎄鎭䥅䥑麿鐗匁鐝鐭鐾䥪鑔鑹锭関䦧间阳䧥枠䨤靀䨵鞲韂噔䫤惨颹䬙飱塄餎餙冴餜餷饂饝饢䭰駅䮝騼鬏窃魩鮁鯝鯱鯴䱭鰠㝯\uD846\uDFC2鵉鰺"],["9aa1","黾噐鶓鶽鷀鷼银辶鹻麬麱麽黆铜黢黱黸竈齄\uD840\uDC94\uD840\uDEB7\uD840\uDFA0椚铃妬\uD841\uDCD7塀铁㞹\uD841\uDDD5\uD841\uDE15\uD841\uDE76\uD845\uDEBA块煳\uD842\uDEC2\uD842\uDECD\uD842\uDFBF呪\uD87E\uDC3B\uD842\uDFCB咞\uD842\uDFFB\uD843\uDC3B\uD843\uDC53\uD843\uDC65\uD843\uDC7C惧\uD843\uDC8D噺\uD843\uDCB5\uD843\uDCDD\uD843\uDCED\uD843\uDD6F\uD843\uDDB2\uD843\uDDC8楕鰯螥\uD843\uDE04\uD843\uDE0E\uD843\uDED7\uD843\uDF90\uD843\uDF2D\uD843\uDE73尠\uD843\uDFBC帋\uD844\uDC5C\uD844\uDC4F\uD844\uDC76朞\uD844\uDC7B\uD844\uDC88\uD844\uDC96㙇\uD844\uDCBF\uD844\uDCD3\uD844\uDD2F\uD844\uDD3B卤蒭\uD844\uDEE3\uD844\uDF75\uD844\uDF36讁\uD845\uDD77\uD845\uDE19\uD845\uDFC3\uD845\uDFC7乸炻\uD846\uDC2D\uD846\uDD6A"],["9b40","\uD846\uDE2D\uD846\uDE45\uD847\uDC2A\uD847\uDC70\uD847\uDCAC\uD847\uDEC8拃\uD847\uDED5\uD847\uDF15熘桕\uD848\uDC45槩㛈\uD848\uDE7C\uD848\uDFD7\uD848\uDFFA\uD849\uDF2A\uD84A\uDC71\uD84A\uDD4F苽\uD84A\uDD67\uD84A\uDD93\uD84A\uDED5覥\uD84A\uDEE8辠\uD84A\uDF0E鞸\uD84A\uDF3F顇骽\uD84B\uDC4C"],["9b62","\uD84B\uDC88\uD84B\uDCB7\uD856\uDFE8\uD84B\uDD08\uD84B\uDD12\uD84B\uDDB7\uD84B\uDD95\uD84B\uDE42\uD84B\uDF74\uD84B\uDFCC\uD84C\uDC33\uD84C\uDC66\uD84C\uDF1F\uD84C\uDFDE徱晈暿\uD85E\uDE79\uD84D\uDD67\uD84D\uDDF3爁\uD852\uDDBA矗\uD84D\uDE1A\uD84D\uDF16纇\uD840\uDF46墵朎"],["9ba1","椘\uD84E\uDEA7\uD85D\uDE57\uD857\uDFE2\uD84F\uDE11\uD84F\uDEB9\uD85D\uDDFE\uD848\uDC9A䣐䪸\uD850\uDD19\uD862\uDE9A\uD850\uDEEE\uD850\uDF0D\uD850\uDC3B\uD850\uDF34\uD850\uDF96\uD852\uDE45\uD841\uDDCA凒\uD841\uDE11妟\uD847\uDEA8㮾\uD84F\uDCFF\uD851\uDC04\uD851\uDCD6垈\uD851\uDE74㦛\uD851\uDF2F\uD861\uDDE8\uD866\uDDC9㝢\uD848\uDDC3譞\uD862\uDF4E駖\uD852\uDC12\uD852\uDCFB\uD852\uDE15爉\uD852\uDEC0\uD843\uDC78奥\uD853\uDEA5\uD853\uDF86\uD841\uDF79軚\uD854\uDC2C劏圿煱\uD854\uDE99\uD855\uDC19\uD84F\uDF4A\uD852\uDEA7喼\uD855\uDC46\uD855\uDC6E\uD85A\uDF52釔㑳\uD855\uDD3F\uD85D\uDE32\uD855\uDD5E䜘\uD855\uDD62\uD855\uDD66\uD855\uDFC7\uD852\uDD3F\uD856\uDC5D偦㓻\uD84C\uDFCC惞\uD856\uDD03䝼\uD862\uDD48\uD856\uDEAE\uD856\uDF89\uD857\uDC06\uD847\uDD90垡煑澶\uD858\uDD02\uD85F\uDC12遖\uD858\uDDB2\uD853\uDF9A譢\uD859\uDC02\uD859\uDC4A"],["9c40","嵛\uD85A\uDFF7輶\uD859\uDC84\uD846\uDD1C諪\uD852\uDDF6\uD859\uDC88\uD84F\uDFEF\uD859\uDD12䯀\uD859\uDDBF\uD859\uDEB5\uD849\uDF1B鑥\uD855\uDFE1憕娧\uD87E\uDCCD侻嚹\uD851\uDD21\uD859\uDEFC乪\uD852\uDD34陖涏\uD85B\uDCBD㘘襷\uD859\uDF99\uD85A\uDC6E\uD859\uDC11\uD85A\uDC5E營\uD85A\uDCC7筂\uD864\uDCC0\uD842\uDE11\uD85A\uDD26鄄\uD85A\uDD39穅鷰\uD85A\uDDFA騦\uD85A\uDE2D㙟\uD859\uDC69\uD840\uDC21禃\uD85A\uDE34\uD85A\uDF5B崬\uD84D\uDD19菏\uD85A\uDF9D䛐\uD85B\uDCA4画补\uD85B\uDDAE墶"],["9ca1","㜜\uD849\uDD8D\uD85C\uDC4B\uD85C\uDDCD㱔\uD85C\uDE80\uD85C\uDE85銁\uD848\uDD7A\uD85C\uDE8B錰\uD85C\uDEE6\uD852\uDDD0氹钟\uD85D\uDC50\uD843\uDEF8蠧裵\uD84A\uDD26\uD861\uDC73\uD845\uDFB1溸\uD852\uDE2A\uD846\uDC20㦤㚹尐秣䔿暶\uD867\uDCAD\uD866\uDCA4襃\uD85D\uDFCC\uD85E\uDC58囖䃟\uD845\uDE0A㦡\uD84D\uDF2F\uD860\uDCE8\uD844\uDFC5熭荦\uD85E\uDDDD\uD864\uDDA8婧䲷\uD85C\uDCAF\uD862\uDDAB\uD85E\uDDFD\uD85E\uDE0A\uD85E\uDF0B\uD85F\uDD66\uD850\uDD7A筃祾\uD860\uDC09澵\uD868\uDEDF樃\uD860\uDF18厢\uD85B\uDE07鎿栶靝\uD860\uDD6F\uD860\uDC23\uD85A\uDDB5\uD844\uDFED\uD84C\uDE2F\uD860\uDC48嶅\uD863\uDC30\uD860\uDC83圕頣\uD862\uDD49嶫\uD852\uDD88斾槕叒\uD852\uDEA5\uD84F\uDF81㰑朶\uD860\uDC90\uD860\uDCF4\uD860\uDD2E\uD847\uDFA1\uD860\uDD4F"],["9d40","\uD860\uDD89\uD860\uDDAF\uD860\uDE1A\uD860\uDF06\uD860\uDF2F\uD860\uDF8A㗊\uD861\uDC68\uD861\uDEAA䣺揦\uD862\uDD56砈鉕\uD862\uDDB8䏲\uD862\uDDE7䏟\uD862\uDDE8\uD862\uDF46\uD862\uDFD4姸\uD863\uDC09輋\uD863\uDFC5\uD864\uDCEC筑\uD864\uDD10\uD864\uDD3C㷷\uD864\uDD5E\uD852\uDECA运犏嚋\uD865\uDCE7\uD865\uDDE9\uD865\uDDB0\uD865\uDDB8\uD865\uDF32\uD866\uDCD1\uD866\uDD49\uD866\uDD6A\uD866\uDDC3\uD866\uDE28\uD866\uDF0E\uD867\uDD5A\uD867\uDD9B纟\uD867\uDEF8\uD867\uDF23䲤镇\uD868\uDE93熢\uD868\uDEFF䶑递\uD869\uDDCB䶜\uD843\uDC9C达嗁"],["9da1","辺\uD849\uDCB0边\uD852\uDE93䔉繿潖檱仪㓤\uD862\uDF2C\uD85E\uDC9D㜺躀\uD845\uDFF5\uD860\uDC24\uD862\uDF6C\uD862\uDF99\uD85E\uDE3E\uD859\uDEAF㷫\uD85D\uDE55\uD84F\uDCB7\uD855\uDE35\uD856\uDD56亚\uD857\uDE81\uD858\uDE58嚿\uD843\uDE6D踎孭\uD84F\uDE88\uD853\uDC9E揞拐\uD845\uDFF6\uD846\uDC7B攰嘭\uD857\uDC4A吚\uD854\uDF11㷆\uD867\uDD98䱽嘢嘞罉\uD857\uDED8奵\uD84F\uDD40蝰东\uD843\uDFEA\uD843\uDD49\uD84D\uDEBA脗鵞贘瘻鱅癎瞹鍅吲腈苷嘥脲萘肽嗪祢噃吖\uD843\uDE9D㗎嘅嗱曱\uD860\uDEE2㘭甴嗰喺咗啲\uD843\uDC41\uD843\uDC96廐\uD854\uDD48\uD843\uDE76\uD84B\uDC62"],["9e40","\uD843\uDEA2麫絚嗞\uD844\uDC75抝靭咔賍燶酶揼掹揾啩\uD84A\uDF43鱲\uD84B\uDEB3冚㓟\uD843\uDDA7冧呍唞唓癦踭\uD85A\uDC8A疱肶蠄螆裇膶萜\uD844\uDCC1䓬猄\uD851\uDF06宐茋\uD85A\uDC93噻\uD849\uDEF4\uD85F\uDD2F\uD850\uDDA3\uD85F\uDD73\uD85B\uDED0\uD85C\uDEB6酰\uD844\uDDD9鈈\uD84F\uDCFC\uD869\uDEA9\uD843\uDEAC\uD843\uDEF9牦\uD847\uDCA2䝎\uD853\uDFC2\uD85F\uDFF9\uD843\uDFEB䃺"],["9ea1","鱝攟\uD84B\uDDA0䣳\uD851\uDFE0\uD867\uDD7C\uD843\uDFEC\uD843\uDE0A恢\uD85D\uDDA3\uD843\uDFED"],["9ead","\uD858\uDC48\uD844\uDD87熣纎鵐业丄㕷嬍沲卧㚬㧜卽㚥\uD851\uDE18墚\uD852\uDF6E舭呋垪\uD856\uDE95\uD842\uDD79"],["9ec5","㩒\uD849\uDC65獴\uD867\uDEAC䴉鯭\uD84F\uDCFE\uD867\uDF30䱛\uD853\uDFA9\uD865\uDD9E\uD867\uDFDE葜\uD84F\uDDB6\uD85C\uDEB2\uD859\uDFB3\uD84D\uDF20挮紥\uD84F\uDEF7\uD84F\uDE2C㨪逈勌㹴㙺䗩\uD841\uDC8E癀嫰\uD843\uDEB6硺\uD85F\uDF2E墧䂿噼鮋嵴癔\uD869\uDC34麅䳡痹㟻愙\uD84C\uDCDA\uD850\uDFF2"],["9ef5","噝\uD844\uDEA9垧\uD852\uDD63\uD867\uDE06刴\uD85C\uDCAE㖭汊鵼"],["9f40","籖鬹埞\uD845\uDF6C屓擓\uD865\uDCD0\uD858\uDF35\uD85C\uDD64蚭\uD843\uDD28\uD85B\uDD22\uD852\uDEE2\uD843\uDD71"],["9f4f","凾\uD847\uDF0F嶎霃\uD847\uDDD1麁遌笟鬂峑箣扨挵髿篏鬪籾鬮籂粆鰕篼鬉鼗鰛\uD852\uDD3E齚啳寃俽麘俲剠㸆勑坧偖妷帒韈鶫轜呩鞴饀鞺匬愰"],["9fa1","椬叚鰊鴂䰻陁榀傦畆\uD845\uDF6D駚剳"],["9fae","酙隁酜"],["9fb2","酑\uD863\uDE97捿\uD85B\uDD23櫊嘑醎畺抅\uD840\uDFFC獏籰\uD857\uDC21\uD84F\uDCFD"],["9fc1","\uD852\uDD19盖鮝个\uD843\uDCD4莾衂"],["9fc9","届槀僭坺刟巵从氱\uD840\uDDF2伹咜哚劚趂㗾弌㗳"],["9fdb","歒酼龥鮗頮颴骺麨麄煺笔"],["9fe7","毺蠘罸"],["9feb","嘠\uD869\uDE4A蹷齓"],["9ff0","跔蹏鸜踁抂\uD860\uDF7D踨蹵竓\uD852\uDE77稾磘泪詧瘇"],["a040","\uD862\uDE5A鼦泎蟖痃\uD868\uDEB2硓\uD87E\uDC40贌狢獱謭猂瓱賫\uD852\uDEBB蘯徺袠䒷"],["a055","\uD846\uDC3B\uD85B\uDE05"],["a058","詾\uD849\uDD1B"],["a05b","惽癧髗鵄鍮鮏蟵"],["a063","蠏賷猬霡鮰㗖犲䰇籑饊\uD858\uDD59慙䰄麖慽"],["a073","坟慯抦戹拎㩜懢厪\uD84C\uDFF5捤栂㗒"],["a0a1","嵗\uD862\uDFC2迚\uD863\uDE39"],["a0a6","僙\uD847\uDD46礆匲阸\uD843\uDF3B䁥"],["a0ae","矾"],["a0b0","糂\uD857\uDF1A糚稭聦聣絍甅瓲覔舚朌聢\uD85D\uDC86聛瓰脃眤覉\uD859\uDFCC畓\uD85B\uDED1螩蟎臈螌詉貭譃眫瓸蓚㘵榲趦"],["a0d4","覩瑨涹蟁\uD850\uDC11瓧㷛煶悤憜㳑煢恷"],["a0e2","罱\uD862\uDF2D牐惩䭾删㰘\uD84F\uDCC7\uD857\uDED7\uD85D\uDE56\uD855\uDD31\uD846\uDD44\uD844\uDEFE\uD866\uDD03\uD85B\uDDDC\uD85C\uDCAD峁\uD858\uDDAD\uD862\uDE0F\uD84D\uDE77\uD840\uDCEE\uD85A\uDC46\uD853\uDF0E䕢嬟\uD858\uDF4C齐麦\uD858\uDE6B"],["a3c0","␀",31,"␡"],["c6a1","①",9,"⑴",9,"ⅰ",9,"丶丿亅亠冂冖冫勹匸卩厶夊宀巛⼳广廴彐彡攴无疒癶辵隶\xa8ˆヽヾゝゞ〃仝々〆〇ー［］✽ぁ",23],["c740","す",58,"ァアィイ"],["c7a1","ゥ",81,"А",5,"ЁЖ",4],["c840","Л",26,"ёж",25,"⇧↸↹㇏\uD840\uDCCC乚\uD840\uDC8A刂䒑"],["c8a1","龰冈龱\uD85D\uDE07"],["c8cd","￢￤＇＂㈱№℡゛゜⺀⺄⺆⺇⺈⺊⺌⺍⺕⺜⺝⺥⺧⺪⺬⺮⺶⺼⺾⻆⻊⻌⻍⻏⻖⻗⻞⻣"],["c8f5","ʃɐɛɔɵœ\xf8ŋʊɪ"],["f9fe","￭"],["fa40","\uD841\uDD47鋛\uD841\uDDDF\uD84F\uDFC5蕌䊵珯况㙉\uD852\uDD42\uD862\uDDE4鍄\uD846\uDDDB苮\uD84F\uDCC8砼杄拟\uD852\uDD33\uD862\uDDAA\uD840\uDEA0\uD85A\uDFB3\uD844\uDF05侫\uD849\uDCED倈\uD85B\uDD29\uD85E\uDE84\uD84D\uDE00\uD852\uDEB1\uD849\uDD13倩\uD840\uDF7E徤\uD840\uDF80\uD840\uDF47滛\uD841\uDC1F偽儁㑺儎顬㝃萖\uD852\uDDA4\uD841\uDC87兠\uD84C\uDFB4兪\uD842\uDFFF\uD848\uDCFC\uD840\uDEE5\uD849\uDD30\uD841\uDD8E\uD84C\uDE33\uD846\uDD83宂蝽\uD841\uDDB3\uD84F\uDC99冲冸"],["faa1","鴴凉减凑㳜凓\uD852\uDEA6决凢卂凭菍椾\uD84D\uDF2D彻刋刦刼劵剗劔効勅簕蕂勠蘍\uD85A\uDF13包\uD862\uDEDE啉滙\uD84F\uDF80\uD842\uDD54\uD84F\uDFEC匳卄\uD842\uDFE2泋\uD845\uDF26栛珕恊㺪㣌\uD845\uDEE8燝䒢卭却\uD861\uDEAB卾卿\uD845\uDD96\uD845\uDE13矦厓\uD862\uDE9B厠厫厮玧\uD855\uDF72㽙玜叁叅汉义埾叙㪫\uD842\uDF8F叠\uD84F\uDFEB\uD84B\uDDA3叶\uD843\uDC77吓灹唫晗浛呭\uD85A\uDF53\uD843\uDD74啝咏咤䞦\uD845\uDF0D\uD843\uDEDD㶴\uD843\uDD4D"],["fb40","\uD862\uDDBC\uD849\uDE98啇䳭启琗喆喩嘅\uD846\uDCD7\uD850\uDC3A䕒\uD851\uDC35暳\uD844\uDCB4嘷曍\uD84C\uDE8A暤暭噍噏磱囱鞇叾圀囯园\uD862\uDF66㘣\uD844\uDE4F坆\uD850\uDDA5汮炋坂㚱\uD85B\uDC7E埦\uD845\uDC16堃\uD845\uDC54\uD850\uDF63堦\uD852\uDFF5塜墪㕡壠壜\uD844\uDE3C壻寿坃\uD868\uDD50\uD850\uDE78鏓㖡够梦㛃湙"],["fba1","\uD845\uDE3E娤啓\uD845\uDE92蔅姉\uD843\uDD4E\uD85B\uDC81\uD85B\uDD2A\uD845\uDFDC姙\uD845\uDFFB\uD845\uDFB2\uD85B\uDDA6浱\uD846\uDC28\uD845\uDED5姹\uD85B\uDE45媫婣㛦\uD852\uDDA9婷㜈媖瑥嫓\uD85B\uDFA1\uD849\uDD54㶅\uD846\uDD11㜲\uD845\uDEB8広勐孶斈孼\uD85E\uDE0E䀄䡝\uD840\uDE04寕慠\uD846\uDE34\uD856\uDDCC\uD841\uDDA5寳宝䴐尅\uD846\uDF44尓珎尔\uD847\uDCA5\uD85A\uDF28屉䣝岅峩峯嶋\uD847\uDDF9\uD847\uDE37崐崘嵆\uD847\uDEA4岺巗苼㠭\uD852\uDD01\uD848\uDC49\uD848\uDD73芇㠶㯂帮檊幵幺\uD851\uDCBC\uD843\uDCD3厦亷廐厨\uD845\uDF71帉廴\uD861\uDC82"],["fc40","廹廻㢠廼栾鐛弍\uD840\uDDC1\uD87E\uDC94㫞䢮\uD844\uDF3A强\uD85A\uDC88\uD848\uDFD0彘\uD849\uDC71彣鞽\uD85B\uDE6E彲鍀\uD862\uDE36徧嶶㵟\uD854\uDE50\uD847\uDF6A\uD85C\uDCF8\uD849\uDE68釖\uD840\uDE9E\uD862\uDE29怱暅\uD846\uDC77㥣㷇㘹垐\uD849\uDFB4祱㹀悞悤悳\uD852\uDD82\uD852\uDD8F\uD85E\uDE53璤僡媠慤萤慂\uD87E\uDCA6\uD85B\uDED2憁凴\uD841\uDE56憇宪\uD84F\uDFB7"],["fca1","\uD84A\uDC5F懓\uD862\uDF9D\uD866\uDD5D懐㤲\uD84A\uDD80\uD84A\uDCC1怣慜攞掋\uD840\uDD18担\uD845\uDF70拕\uD84B\uDE0D捬\uD852\uDDDF㨗搸揸\uD844\uDF8E\uD845\uDFFC撐澊\uD84B\uDE36頔\uD850\uDC8C\uD855\uDF1D擡擥鑻㩦携㩗敍漖\uD852\uDE28\uD852\uDE23斅敭敟\uD84C\uDC7E斵\uD852\uDD40䬷旑䃘\uD846\uDC29无旣忟\uD84D\uDC00昘\uD84C\uDDF7\uD84C\uDDF8晄\uD84C\uDDA4\uD84C\uDDA5晋\uD843\uDE75晧\uD854\uDDE6晳晴\uD847\uDE3D\uD84C\uDE31\uD861\uDDF4\uD84C\uDDC8\uD854\uDF13矅\uD84A\uDCF7馤朂\uD850\uDF9C\uD852\uDE21㬫槺\uD84D\uDFC2杞杧杢\uD850\uDDCD\uD864\uDCED柗䓩栢湐鈼栁\uD84C\uDFE6\uD85B\uDDA0桝"],["fd40","\uD84D\uDC6F槡樋\uD862\uDEDF楳棃\uD84D\uDDCD椁椀㴲㨁\uD84D\uDE3C㮀枬楡\uD862\uDE4A䋼椶榘㮡\uD840\uDFC9荣傐槹\uD84D\uDE59\uD848\uDD2A橅\uD84D\uDF03檝㯳枱櫈\uD864\uDD9C㰍欝\uD842\uDD23惞欵歴\uD849\uDFCD溵\uD84E\uDEDB\uD840\uDFB5\uD846\uDD58㝀吡\uD84E\uDF5A毡\uD84F\uDEFC毜氷\uD849\uDC8B\uD852\uDCF1\uD85A\uDF51汚舦汹\uD84F\uDDBC䓅\uD84F\uDDBD\uD850\uDDA4\uD852\uDD0C\uD852\uDD00"],["fda1","\uD84F\uDCC9㛥㳫\uD843\uDD32鮃\uD84C\uDDF9\uD849\uDC91羏样\uD85B\uDD25\uD85B\uDDA1\uD85B\uDDEB涖浜湼漄\uD852\uDD7F\uD850\uDC85\uD85B\uDE72蔳\uD85B\uDF74凇沜渝萮\uD862\uDF21港\uD84F\uDE2F瑓\uD84F\uDF82秌湏媑\uD84C\uDC4B濸㜍澝\uD84F\uDE30滺\uD845\uDC97\uD850\uDC3D䕕鏰潄潜㵎潴\uD864\uDD70㴻澟\uD850\uDD44濓\uD850\uDC91\uD850\uDD55\uD850\uDC39\uD84F\uDFF0\uD84F\uDFB4\uD850\uDD3F凟\uD850\uDD56\uD850\uDD57\uD850\uDD40\uD858\uDDDD灋灾炧炁烌烕烖烟䄄㷨熴熖\uD850\uDE77焫煅媈煊煮岜\uD850\uDF65煏鍢\uD850\uDEC1焬\uD851\uDC5A\uD852\uDE27\uD852\uDE22熺\uD862\uDFE8炽爎"],["fe40","鑂爕夑鑃爤鍁\uD855\uDE05爮牀\uD852\uDD74梽牕牗㹕\uD84C\uDC44栍漽犂猪猫\uD852\uDC23\uD862\uDC2B䣭\uD862\uDC04猨献珏玪\uD843\uDC3A\uD85A\uDE2E珉瑉\uD850\uDDE2\uD845\uDEE7\uD852\uDE24昣㛅\uD852\uDDB7\uD852\uDD8D\uD852\uDDFB珷琕椃\uD852\uDE26琹\uD841\uDDC3㻗瑜\uD84A\uDCAD瑠\uD863\uDEB2瑇珤瑶莹瑬㜰瑴鏱樬璂䥓\uD852\uDE8C"],["fea1","\uD850\uDD5F\uD852\uDE79\uD862\uDF8F孆\uD863\uDC03\uD846\uDC9E瓈\uD846\uDD88甎瓩甞\uD863\uDED9\uD846\uDE4B寗\uD863\uDEAC鎅畍畊畧畮\uD853\uDF82㼄\uD853\uDD13疎瑝疞疴瘂瘬癑癏癯癶\uD858\uDFF5皐臯㟸\uD85A\uDD11\uD85A\uDD0E皡皥皷盌\uD85B\uDF9F葢\uD854\uDC9D\uD854\uDD7D\uD847\uDE1C眞眦着撯\uD854\uDE20睘\uD84C\uDEAC瞯\uD862\uDD64\uD862\uDD68\uD845\uDEC1矴砉\uD844\uDF76\uD852\uDE12棊碯磇磓隥礮\uD855\uDDE0磗礴碱\uD85D\uDE0C辸袄\uD862\uDF2B\uD858\uDC83\uD849\uDE1C禆褀椂禀\uD856\uDC57禝\uD85E\uDF39礼禩渪\uD85C\uDD26㺨秆\uD864\uDD0D秔"]]',
      );
    },
    4463(eA, el, ec) {
      "use strict";
      var eu = ec(19845).Buffer;
      eA.exports = function (eA) {
        var el = eA.Transform;
        function IconvLiteEncoderStream(eA, ec) {
          ((this.conv = eA),
            ((ec = ec || {}).decodeStrings = !1),
            el.call(this, ec));
        }
        function IconvLiteDecoderStream(eA, ec) {
          ((this.conv = eA),
            ((ec = ec || {}).encoding = this.encoding = "utf8"),
            el.call(this, ec));
        }
        return (
          (IconvLiteEncoderStream.prototype = Object.create(el.prototype, {
            constructor: { value: IconvLiteEncoderStream },
          })),
          (IconvLiteEncoderStream.prototype._transform = function (eA, el, ec) {
            if ("string" != typeof eA)
              return ec(
                Error("Iconv encoding stream needs strings as its input."),
              );
            try {
              var eu = this.conv.write(eA);
              (eu && eu.length && this.push(eu), ec());
            } catch (eA) {
              ec(eA);
            }
          }),
          (IconvLiteEncoderStream.prototype._flush = function (eA) {
            try {
              var el = this.conv.end();
              (el && el.length && this.push(el), eA());
            } catch (el) {
              eA(el);
            }
          }),
          (IconvLiteEncoderStream.prototype.collect = function (eA) {
            var el = [];
            return (
              this.on("error", eA),
              this.on("data", function (eA) {
                el.push(eA);
              }),
              this.on("end", function () {
                eA(null, eu.concat(el));
              }),
              this
            );
          }),
          (IconvLiteDecoderStream.prototype = Object.create(el.prototype, {
            constructor: { value: IconvLiteDecoderStream },
          })),
          (IconvLiteDecoderStream.prototype._transform = function (eA, el, ec) {
            if (!eu.isBuffer(eA) && !(eA instanceof Uint8Array))
              return ec(
                Error("Iconv decoding stream needs buffers as its input."),
              );
            try {
              var ed = this.conv.write(eA);
              (ed && ed.length && this.push(ed, this.encoding), ec());
            } catch (eA) {
              ec(eA);
            }
          }),
          (IconvLiteDecoderStream.prototype._flush = function (eA) {
            try {
              var el = this.conv.end();
              (el && el.length && this.push(el, this.encoding), eA());
            } catch (el) {
              eA(el);
            }
          }),
          (IconvLiteDecoderStream.prototype.collect = function (eA) {
            var el = "";
            return (
              this.on("error", eA),
              this.on("data", function (eA) {
                el += eA;
              }),
              this.on("end", function () {
                eA(null, el);
              }),
              this
            );
          }),
          {
            IconvLiteEncoderStream: IconvLiteEncoderStream,
            IconvLiteDecoderStream: IconvLiteDecoderStream,
          }
        );
      };
    },
    23238(eA, el, ec) {
      eA.exports = ec(78615);
    },
    78615(eA, el, ec) {
      var eu = ec(27596),
        ed = ec(12719).setLogger;
      function runUniversalDetector(eA, el) {
        var ec = new eu(el);
        return (
          ec.reset(),
          "function" == typeof Buffer && eA instanceof Buffer
            ? ec.feed(eA.toString("binary"))
            : ec.feed(eA),
          ec.close(),
          ec
        );
      }
      ((el.detect = function (eA, el) {
        return runUniversalDetector(eA, el).result;
      }),
        (el.detectAll = function (eA, el) {
          return runUniversalDetector(eA, el).results;
        }),
        (el.UniversalDetector = eu),
        (el.enableDebug = function () {
          ed(console.log.bind(console));
        }));
    },
    27596(eA, el, ec) {
      var eu = ec(75546),
        ed = ec(73439),
        ep = ec(17117),
        eg = ec(91266),
        eh = ec(34918),
        ef = ec(12719);
      let em = (function () {
          let eA = [
              "UTF-8",
              "UTF-32LE",
              "UTF-32BE",
              "UTF-32BE",
              "UTF-16LE",
              "UTF-16BE",
              "X-ISO-10646-UCS-4-3412",
              "X-ISO-10646-UCS-4-2143",
            ],
            el = [new eh(), new ed(), new ep(), new eg()],
            ec = eA.slice(0);
          for (let eA of el) [].push.apply(ec, eA.getSupportedCharsetNames());
          return ec;
        })(),
        eE = (function () {
          let eA = [];
          for (let el of em)
            eA.push(
              el.toLocaleLowerCase(),
              el.toLocaleLowerCase().replace(/-/g, ""),
            );
          return eA;
        })();
      eA.exports = function (eA) {
        if (
          (eA || (eA = {}),
          "number" != typeof eA.minimumThreshold &&
            (eA.detectEncodings
              ? (eA.minimumThreshold = 0)
              : (eA.minimumThreshold = 0.2)),
          eA.detectEncodings)
        ) {
          for (let el of eA.detectEncodings)
            if (!eE.includes(el.toLowerCase()))
              throw Error(
                `Encoding ${el} is not supported. Supported encodings: ${em}.`,
              );
        }
        var el = 0,
          ec = 1,
          eC = 2,
          ey = this;
        function init() {
          ((ey._highBitDetector = /[\x80-\xFF]/),
            (ey._escDetector = /(\x1B|~\{)/),
            (ey._mEscCharsetProber = null),
            (ey._mCharsetProbers = []),
            ey.reset());
        }
        function canDetectEncoding(el) {
          return (
            !eA.detectEncodings ||
            eA.detectEncodings
              .map((eA) => eA.toLowerCase())
              .includes(el.toLowerCase())
          );
        }
        ((this.reset = function () {
          ((this.result = { encoding: null, confidence: 0 }),
            (this.results = []),
            (this.done = !1),
            (this._mStart = !0),
            (this._mGotData = !1),
            (this._mInputState = el),
            (this._mLastChar = []),
            (this._mBOM = ""),
            this._mEscCharsetProber && this._mEscCharsetProber.reset());
          for (var eA, ec = 0; (eA = this._mCharsetProbers[ec]); ec++)
            eA.reset();
        }),
          (this.feed = function (eA) {
            if (!this.done && eA.length) {
              if (
                (!this._mGotData &&
                  ((this._mBOM += eA),
                  "\xef\xbb\xbf" == this._mBOM.slice(0, 3) &&
                  canDetectEncoding("UTF-8")
                    ? (this.result = { encoding: "UTF-8", confidence: 1 })
                    : "\xff\xfe\0\0" == this._mBOM.slice(0, 4) &&
                        canDetectEncoding("UTF-32LE")
                      ? (this.result = { encoding: "UTF-32LE", confidence: 1 })
                      : "\0\0\xfe\xff" == this._mBOM.slice(0, 4) &&
                          canDetectEncoding("UTF-32BE")
                        ? (this.result = {
                            encoding: "UTF-32BE",
                            confidence: 1,
                          })
                        : "\xfe\xff\0\0" == this._mBOM.slice(0, 4) &&
                            canDetectEncoding("X-ISO-10646-UCS-4-3412")
                          ? (this.result = {
                              encoding: "X-ISO-10646-UCS-4-3412",
                              confidence: 1,
                            })
                          : "\0\0\xff\xfe" == this._mBOM.slice(0, 4) &&
                              canDetectEncoding("X-ISO-10646-UCS-4-2143")
                            ? (this.result = {
                                encoding: "X-ISO-10646-UCS-4-2143",
                                confidence: 1,
                              })
                            : "\xff\xfe" == this._mBOM.slice(0, 2) &&
                                canDetectEncoding("UTF-16LE")
                              ? (this.result = {
                                  encoding: "UTF-16LE",
                                  confidence: 1,
                                })
                              : "\xfe\xff" == this._mBOM.slice(0, 2) &&
                                canDetectEncoding("UTF-16BE") &&
                                (this.result = {
                                  encoding: "UTF-16BE",
                                  confidence: 1,
                                }),
                  this.result.confidence > 0 && (this.results = [this.result]),
                  this._mBOM.length > 3 && (this._mGotData = !0)),
                this.result.encoding && this.result.confidence > 0)
              ) {
                this.done = !0;
                return;
              }
              if (
                (this._mInputState == el &&
                  (this._highBitDetector.test(eA)
                    ? (this._mInputState = eC)
                    : this._escDetector.test(this._mLastChar.join("") + eA) &&
                      (this._mInputState = ec)),
                (this._mLastChar = eA.slice(-1).split("")),
                this._mInputState == ec)
              )
                (this._mEscCharsetProber ||
                  (this._mEscCharsetProber = new eh()),
                  this._mEscCharsetProber.feed(eA) == eu.foundIt &&
                    canDetectEncoding(
                      this._mEscCharsetProber.getCharsetName(),
                    ) &&
                    ((this.result = {
                      encoding: this._mEscCharsetProber.getCharsetName(),
                      confidence: this._mEscCharsetProber.getConfidence(),
                    }),
                    (this.results = [this.result]),
                    (this.done = !0)));
              else if (this._mInputState == eC) {
                0 == this._mCharsetProbers.length &&
                  (this._mCharsetProbers = [new ed(), new ep(), new eg()]);
                for (var ef, em = 0; (ef = this._mCharsetProbers[em]); em++)
                  if (
                    ef.feed(eA) == eu.foundIt &&
                    canDetectEncoding(ef.getCharsetName())
                  ) {
                    ((this.result = {
                      encoding: ef.getCharsetName(),
                      confidence: ef.getConfidence(),
                    }),
                      (this.results = [this.result]),
                      (this.done = !0));
                    break;
                  }
              }
            }
          }),
          (this.close = function () {
            if (!this.done) {
              if (0 === this._mBOM.length)
                return void ef.log("no data received!\n");
              if (
                ((this.done = !0),
                this._mInputState == el && canDetectEncoding("ascii"))
              )
                return (
                  ef.log("pure ascii"),
                  (this.result = { encoding: "ascii", confidence: 1 }),
                  this.results.push(this.result),
                  this.result
                );
              if (this._mInputState == eC) {
                let el = 0,
                  ep = !1;
                for (var ec, eu = 0; (ec = this._mCharsetProbers[eu]); eu++) {
                  if (!ec) continue;
                  let eA = ec.getCharsetName(),
                    eu = ec.getConfidence();
                  ("windows-1252" === ec.getCharsetName() && (el = eu),
                    eA &&
                      canDetectEncoding(eA) &&
                      (this.results.push({
                        encoding: ec.getCharsetName(),
                        confidence: eu,
                      }),
                      "windows-1250" === ec.getCharsetName() && (ep = !0),
                      ef.log(ec.getCharsetName() + " confidence " + eu)));
                }
                if (
                  (el &&
                    !ep &&
                    canDetectEncoding("windows-1250") &&
                    this.results.push({
                      encoding: "windows-1250",
                      confidence: el - Math.pow(0.5, String(el).length - 1),
                    }),
                  this.results.sort(function (eA, el) {
                    return el.confidence - eA.confidence;
                  }),
                  this.results.length > 0)
                ) {
                  var ed = this.results[0];
                  if (ed.confidence >= eA.minimumThreshold)
                    return ((this.result = ed), ed);
                }
              }
              if (ef.enabled) {
                ef.log("no probers hit minimum threshhold\n");
                for (var ec, eu = 0; (ec = this._mCharsetProbers[eu]); eu++)
                  ec &&
                    canDetectEncoding(ec.getCharsetName()) &&
                    ef.log(
                      ec.getCharsetName() +
                        " confidence = " +
                        ec.getConfidence() +
                        "\n",
                    );
              }
            }
          }),
          init());
      };
    },
    75546(eA) {
      eA.exports = {
        detecting: 0,
        foundIt: 1,
        notMe: 2,
        start: 0,
        error: 1,
        itsMe: 2,
        SHORTCUT_THRESHOLD: 0.95,
      };
    },
    73439(eA, el, ec) {
      var eu = ec(65084),
        ed = ec(85242),
        ep = ec(77388),
        eg = ec(31122),
        eh = ec(45622),
        ef = ec(39802),
        em = ec(41537),
        eE = ec(73017);
      function MBCSGroupProber() {
        (eu.apply(this),
          (this._mProbers = [
            new ep(),
            new eg(),
            new eh(),
            new ef(),
            new em(),
            new ed(),
            new eE(),
          ]));
        let eA = this._mProbers.map((eA) => eA.getCharsetName());
        ((this.getSupportedCharsetNames = function () {
          return eA;
        }),
          this.reset());
      }
      ((MBCSGroupProber.prototype = new eu()), (eA.exports = MBCSGroupProber));
    },
    65084(eA, el, ec) {
      var eu = ec(75546),
        ed = ec(95927),
        ep = ec(12719);
      function CharSetGroupProber() {
        ed.apply(this);
        var eA = this;
        function init() {
          ((eA._mActiveNum = 0),
            (eA._mProbers = []),
            (eA._mBestGuessProber = null));
        }
        ((this.reset = function () {
          (CharSetGroupProber.prototype.reset.apply(this),
            (this._mActiveNum = 0));
          for (var eA, el = 0; (eA = this._mProbers[el]); el++)
            eA && (eA.reset(), (eA.active = !0), this._mActiveNum++);
          this._mBestGuessProber = null;
        }),
          (this.getCharsetName = function () {
            return this._mBestGuessProber ||
              (this.getConfidence(), this._mBestGuessProber)
              ? this._mBestGuessProber.getCharsetName()
              : null;
          }),
          (this.getSupportedCharsetNames = function () {
            throw Error("Unimplemented method getSupportedCharsetNames()");
          }),
          (this.feed = function (eA) {
            for (var el, ec = 0; (el = this._mProbers[ec]); ec++)
              if (el && el.active) {
                var ed = el.feed(eA);
                if (ed) {
                  if (ed == eu.foundIt) {
                    this._mBestGuessProber = el;
                    break;
                  } else if (
                    ed == eu.notMe &&
                    ((el.active = !1),
                    this._mActiveNum--,
                    this._mActiveNum <= 0)
                  ) {
                    this._mState = eu.notMe;
                    break;
                  }
                }
              }
            return this.getState();
          }),
          (this.getConfidence = function () {
            var eA = this.getState();
            if (eA == eu.foundIt) return 0.99;
            if (eA == eu.notMe) return 0.01;
            var el = 0;
            this._mBestGuessProber = null;
            for (var ec, ed = 0; (ec = this._mProbers[ed]); ed++)
              if (ec) {
                if (!ec.active) {
                  ep.log(ec.getCharsetName() + " not active\n");
                  continue;
                }
                var eg = ec.getConfidence();
                (ep.log(ec.getCharsetName() + " confidence = " + eg + "\n"),
                  el < eg && ((el = eg), (this._mBestGuessProber = ec)));
              }
            return this._mBestGuessProber ? el : 0;
          }),
          init());
      }
      ((CharSetGroupProber.prototype = new ed()),
        (eA.exports = CharSetGroupProber));
    },
    95927(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = function () {
        ((this.reset = function () {
          this._mState = eu.detecting;
        }),
          (this.getCharsetName = function () {
            return null;
          }),
          (this.getSupportedCharsetNames = function () {
            throw Error("Unimplemented method getSupportedCharsetNames()");
          }),
          (this.feed = function (eA) {}),
          (this.getState = function () {
            return this._mState;
          }),
          (this.getConfidence = function () {
            return 0;
          }),
          (this.filterHighBitOnly = function (eA) {
            return eA.replace(/[\x00-\x7F]+/g, " ");
          }),
          (this.filterWithoutEnglishLetters = function (eA) {
            return eA.replace(/[A-Za-z]+/g, " ");
          }),
          (this.removeXmlTags = function (eA) {
            for (var el = "", ec = !1, eu = 0, ed = 0; ed < eA.length; ed++) {
              var ep = eA[ed];
              ">" == ep && "?" !== eA[ed - 1]
                ? ((eu = ed + 1), (ec = !1))
                : "<" == ep &&
                  "?" !== eA[ed + 1] &&
                  (ed > eu && !ec && (el = el + eA.substring(eu, ed) + " "),
                  (ec = !0));
            }
            return (ec || (el += eA.substring(eu)), el);
          }));
      };
    },
    12719(eA, el) {
      ((el.log = function () {}),
        (el.setLogger = function (eA) {
          ((el.enabled = !0), (el.log = eA));
        }));
    },
    85242(eA, el, ec) {
      var eu = ec(91203),
        ed = ec(67326),
        ep = ec(48712),
        eg = ec(18141).Big5DistributionAnalysis;
      function Big5Prober() {
        ed.apply(this);
        var eA = this;
        function init() {
          ((eA._mCodingSM = new eu(ep)),
            (eA._mDistributionAnalyzer = new eg()),
            eA.reset());
        }
        ((this.getCharsetName = function () {
          return "Big5";
        }),
          init());
      }
      ((Big5Prober.prototype = new ed()), (eA.exports = Big5Prober));
    },
    91203(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = function (eA) {
        var el = this;
        function init(eA) {
          ((el._mModel = eA),
            (el._mCurrentBytePos = 0),
            (el._mCurrentCharLen = 0),
            el.reset());
        }
        ((this.reset = function () {
          this._mCurrentState = eu.start;
        }),
          (this.nextState = function (eA) {
            var el = this._mModel.classTable[eA.charCodeAt(0)];
            return (
              this._mCurrentState == eu.start &&
                ((this._mCurrentBytePos = 0),
                (this._mCurrentCharLen = this._mModel.charLenTable[el])),
              (this._mCurrentState =
                this._mModel.stateTable[
                  this._mCurrentState * this._mModel.classFactor + el
                ]),
              this._mCurrentBytePos++,
              this._mCurrentState
            );
          }),
          (this.getCurrentCharLen = function () {
            return this._mCurrentCharLen;
          }),
          (this.getCodingStateMachine = function () {
            return this._mModel.name;
          }),
          init(eA));
      };
    },
    67326(eA, el, ec) {
      var eu = ec(95927),
        ed = ec(75546),
        ep = ec(12719);
      function MultiByteCharSetProber() {
        eu.apply(this);
        ((this.reset = function () {
          (MultiByteCharSetProber.prototype.reset.apply(this),
            this._mCodingSM && this._mCodingSM.reset(),
            this._mDistributionAnalyzer && this._mDistributionAnalyzer.reset(),
            (this._mLastChar = ["\0", "\0"]));
        }),
          (this.getCharsetName = function () {}),
          (this.feed = function (eA) {
            for (var el = eA.length, ec = 0; ec < el; ec++) {
              var eu = this._mCodingSM.nextState(eA[ec]);
              if (eu == ed.error) {
                (ep.log(
                  this.getCharsetName() +
                    " prober hit error at byte " +
                    ec +
                    "\n",
                ),
                  (this._mState = ed.notMe));
                break;
              }
              if (eu == ed.itsMe) {
                this._mState = ed.foundIt;
                break;
              }
              if (eu == ed.start) {
                var eg = this._mCodingSM.getCurrentCharLen();
                0 == ec
                  ? ((this._mLastChar[1] = eA[0]),
                    this._mDistributionAnalyzer.feed(
                      this._mLastChar.join(""),
                      eg,
                    ))
                  : this._mDistributionAnalyzer.feed(
                      eA.slice(ec - 1, ec + 1),
                      eg,
                    );
              }
            }
            return (
              (this._mLastChar[0] = eA[el - 1]),
              this.getState() == ed.detecting &&
                this._mDistributionAnalyzer.gotEnoughData() &&
                this.getConfidence() > ed.SHORTCUT_THRESHOLD &&
                (this._mState = ed.foundIt),
              this.getState()
            );
          }),
          (this.getConfidence = function () {
            return this._mDistributionAnalyzer.getConfidence();
          }));
      }
      ((MultiByteCharSetProber.prototype = new eu()),
        (eA.exports = MultiByteCharSetProber));
    },
    48712(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = {
        classTable: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
          4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 0,
        ],
        classFactor: 5,
        stateTable: [
          eu.error,
          eu.start,
          eu.start,
          3,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.error,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
        ],
        charLenTable: [0, 1, 1, 2, 0],
        name: "Big5",
      };
    },
    18141(eA, el, ec) {
      var eu = ec(38511),
        ed = ec(43351),
        ep = ec(21519),
        eg = ec(87756),
        eh = ec(15852);
      function CharDistributionAnalysis() {
        var eA = 1024,
          el = 0.99,
          ec = 0.01,
          eu = 3,
          ed = this;
        function init() {
          ((ed._mCharToFreqOrder = null),
            (ed._mTableSize = null),
            (ed._mTypicalDistributionRatio = null),
            ed.reset());
        }
        ((this.reset = function () {
          ((this._mDone = !1), (this._mTotalChars = 0), (this._mFreqChars = 0));
        }),
          (this.feed = function (eA, el) {
            if (2 == el) var ec = this.getOrder(eA);
            else ec = -1;
            ec >= 0 &&
              (this._mTotalChars++,
              ec < this._mTableSize &&
                512 > this._mCharToFreqOrder[ec] &&
                this._mFreqChars++);
          }),
          (this.getConfidence = function () {
            if (this._mTotalChars <= 0 || this._mFreqChars <= eu) return ec;
            if (this._mTotalChars != this._mFreqChars) {
              var eA =
                this._mFreqChars /
                ((this._mTotalChars - this._mFreqChars) *
                  this._mTypicalDistributionRatio);
              if (eA < el) return eA;
            }
            return el;
          }),
          (this.gotEnoughData = function () {
            return this._mTotalChars > eA;
          }),
          (this.getOrder = function (eA) {
            return -1;
          }),
          init());
      }
      function EUCTWDistributionAnalysis() {
        CharDistributionAnalysis.apply(this);
        var eA = this;
        function init() {
          ((eA._mCharToFreqOrder = ed.EUCTWCharToFreqOrder),
            (eA._mTableSize = ed.EUCTW_TABLE_SIZE),
            (eA._mTypicalDistributionRatio =
              ed.EUCTW_TYPICAL_DISTRIBUTION_RATIO));
        }
        ((this.getOrder = function (eA) {
          return eA.charCodeAt(0) >= 196
            ? 94 * (eA.charCodeAt(0) - 196) + eA.charCodeAt(1) - 161
            : -1;
        }),
          init());
      }
      function EUCKRDistributionAnalysis() {
        CharDistributionAnalysis.apply(this);
        var eA = this;
        function init() {
          ((eA._mCharToFreqOrder = ep.EUCKRCharToFreqOrder),
            (eA._mTableSize = ep.EUCKR_TABLE_SIZE),
            (eA._mTypicalDistributionRatio =
              ep.EUCKR_TYPICAL_DISTRIBUTION_RATIO));
        }
        ((this.getOrder = function (eA) {
          return eA.charCodeAt(0) >= 176
            ? 94 * (eA.charCodeAt(0) - 176) + eA.charCodeAt(1) - 161
            : -1;
        }),
          init());
      }
      function GB2312DistributionAnalysis() {
        CharDistributionAnalysis.apply(this);
        var eA = this;
        function init() {
          ((eA._mCharToFreqOrder = eg.GB2312CharToFreqOrder),
            (eA._mTableSize = eg.GB2312_TABLE_SIZE),
            (eA._mTypicalDistributionRatio =
              eg.GB2312_TYPICAL_DISTRIBUTION_RATIO));
        }
        ((this.getOrder = function (eA) {
          return eA.charCodeAt(0) >= 176 && eA.charCodeAt(1) >= 161
            ? 94 * (eA.charCodeAt(0) - 176) + eA.charCodeAt(1) - 161
            : -1;
        }),
          init());
      }
      function Big5DistributionAnalysis() {
        CharDistributionAnalysis.apply(this);
        var eA = this;
        function init() {
          ((eA._mCharToFreqOrder = eh.Big5CharToFreqOrder),
            (eA._mTableSize = eh.BIG5_TABLE_SIZE),
            (eA._mTypicalDistributionRatio =
              eh.BIG5_TYPICAL_DISTRIBUTION_RATIO));
        }
        ((this.getOrder = function (eA) {
          return eA.charCodeAt(0) >= 164
            ? eA.charCodeAt(1) >= 161
              ? 157 * (eA.charCodeAt(0) - 164) + eA.charCodeAt(1) - 161 + 63
              : 157 * (eA.charCodeAt(0) - 164) + eA.charCodeAt(1) - 64
            : -1;
        }),
          init());
      }
      function SJISDistributionAnalysis() {
        CharDistributionAnalysis.apply(this);
        var eA = this;
        function init() {
          ((eA._mCharToFreqOrder = eu.JISCharToFreqOrder),
            (eA._mTableSize = eu.JIS_TABLE_SIZE),
            (eA._mTypicalDistributionRatio =
              eu.JIS_TYPICAL_DISTRIBUTION_RATIO));
        }
        ((this.getOrder = function (eA) {
          if (eA.charCodeAt(0) >= 129 && 159 >= eA.charCodeAt(0))
            var el = 188 * (eA.charCodeAt(0) - 129);
          else {
            if (!(eA.charCodeAt(0) >= 224 && 239 >= eA.charCodeAt(0)))
              return -1;
            el = 188 * (eA.charCodeAt(0) - 224 + 31);
          }
          return (
            (el += eA.charCodeAt(1) - 64),
            (64 > eA.charCodeAt(1) ||
              127 === eA.charCodeAt(1) ||
              eA.charCodeAt(1) > 252) &&
              (el = -1),
            el
          );
        }),
          init());
      }
      function EUCJPDistributionAnalysis() {
        CharDistributionAnalysis.apply(this);
        var eA = this;
        function init() {
          ((eA._mCharToFreqOrder = eu.JISCharToFreqOrder),
            (eA._mTableSize = eu.JIS_TABLE_SIZE),
            (eA._mTypicalDistributionRatio =
              eu.JIS_TYPICAL_DISTRIBUTION_RATIO));
        }
        ((this.getOrder = function (eA) {
          return eA[0] >= "\xa0"
            ? 94 * (eA.charCodeAt(0) - 161) + eA.charCodeAt(1) - 161
            : -1;
        }),
          init());
      }
      ((el.CharDistributionAnalysis = CharDistributionAnalysis),
        (EUCTWDistributionAnalysis.prototype = new CharDistributionAnalysis()),
        (el.EUCTWDistributionAnalysis = EUCTWDistributionAnalysis),
        (EUCKRDistributionAnalysis.prototype = new CharDistributionAnalysis()),
        (el.EUCKRDistributionAnalysis = EUCKRDistributionAnalysis),
        (GB2312DistributionAnalysis.prototype = new CharDistributionAnalysis()),
        (el.GB2312DistributionAnalysis = GB2312DistributionAnalysis),
        (Big5DistributionAnalysis.prototype = new CharDistributionAnalysis()),
        (el.Big5DistributionAnalysis = Big5DistributionAnalysis),
        (SJISDistributionAnalysis.prototype = new CharDistributionAnalysis()),
        (el.SJISDistributionAnalysis = SJISDistributionAnalysis),
        (EUCJPDistributionAnalysis.prototype = new CharDistributionAnalysis()),
        (el.EUCJPDistributionAnalysis = EUCJPDistributionAnalysis));
    },
    38511(eA, el) {
      ((el.JIS_TYPICAL_DISTRIBUTION_RATIO = 3),
        (el.JIS_TABLE_SIZE = 4368),
        (el.JISCharToFreqOrder = [
          40, 1, 6, 182, 152, 180, 295, 2127, 285, 381, 3295, 4304, 3068, 4606,
          3165, 3510, 3511, 1822, 2785, 4607, 1193, 2226, 5070, 4608, 171, 2996,
          1247, 18, 179, 5071, 856, 1661, 1262, 5072, 619, 127, 3431, 3512,
          3230, 1899, 1700, 232, 228, 1294, 1298, 284, 283, 2041, 2042, 1061,
          1062, 48, 49, 44, 45, 433, 434, 1040, 1041, 996, 787, 2997, 1255,
          4305, 2108, 4609, 1684, 1648, 5073, 5074, 5075, 5076, 5077, 5078,
          3687, 5079, 4610, 5080, 3927, 3928, 5081, 3296, 3432, 290, 2285, 1471,
          2187, 5082, 2580, 2825, 1303, 2140, 1739, 1445, 2691, 3375, 1691,
          3297, 4306, 4307, 4611, 452, 3376, 1182, 2713, 3688, 3069, 4308, 5083,
          5084, 5085, 5086, 5087, 5088, 5089, 5090, 5091, 5092, 5093, 5094,
          5095, 5096, 5097, 5098, 5099, 5100, 5101, 5102, 5103, 5104, 5105,
          5106, 5107, 5108, 5109, 5110, 5111, 5112, 4097, 5113, 5114, 5115,
          5116, 5117, 5118, 5119, 5120, 5121, 5122, 5123, 5124, 5125, 5126,
          5127, 5128, 5129, 5130, 5131, 5132, 5133, 5134, 5135, 5136, 5137,
          5138, 5139, 5140, 5141, 5142, 5143, 5144, 5145, 5146, 5147, 5148,
          5149, 5150, 5151, 5152, 4612, 5153, 5154, 5155, 5156, 5157, 5158,
          5159, 5160, 5161, 5162, 5163, 5164, 5165, 5166, 5167, 5168, 5169,
          5170, 5171, 5172, 5173, 5174, 5175, 1472, 598, 618, 820, 1205, 1309,
          1412, 1858, 1307, 1692, 5176, 5177, 5178, 5179, 5180, 5181, 5182,
          1142, 1452, 1234, 1172, 1875, 2043, 2149, 1793, 1382, 2973, 925, 2404,
          1067, 1241, 960, 1377, 2935, 1491, 919, 1217, 1865, 2030, 1406, 1499,
          2749, 4098, 5183, 5184, 5185, 5186, 5187, 5188, 2561, 4099, 3117,
          1804, 2049, 3689, 4309, 3513, 1663, 5189, 3166, 3118, 3298, 1587,
          1561, 3433, 5190, 3119, 1625, 2998, 3299, 4613, 1766, 3690, 2786,
          4614, 5191, 5192, 5193, 5194, 2161, 26, 3377, 2, 3929, 20, 3691, 47,
          4100, 50, 17, 16, 35, 268, 27, 243, 42, 155, 24, 154, 29, 184, 4, 91,
          14, 92, 53, 396, 33, 289, 9, 37, 64, 620, 21, 39, 321, 5, 12, 11, 52,
          13, 3, 208, 138, 0, 7, 60, 526, 141, 151, 1069, 181, 275, 1591, 83,
          132, 1475, 126, 331, 829, 15, 69, 160, 59, 22, 157, 55, 1079, 312,
          109, 38, 23, 25, 10, 19, 79, 5195, 61, 382, 1124, 8, 30, 5196, 5197,
          5198, 5199, 5200, 5201, 5202, 5203, 5204, 5205, 5206, 89, 62, 74, 34,
          2416, 112, 139, 196, 271, 149, 84, 607, 131, 765, 46, 88, 153, 683,
          76, 874, 101, 258, 57, 80, 32, 364, 121, 1508, 169, 1547, 68, 235,
          145, 2999, 41, 360, 3027, 70, 63, 31, 43, 259, 262, 1383, 99, 533,
          194, 66, 93, 846, 217, 192, 56, 106, 58, 565, 280, 272, 311, 256, 146,
          82, 308, 71, 100, 128, 214, 655, 110, 261, 104, 1140, 54, 51, 36, 87,
          67, 3070, 185, 2618, 2936, 2020, 28, 1066, 2390, 2059, 5207, 5208,
          5209, 5210, 5211, 5212, 5213, 5214, 5215, 5216, 4615, 5217, 5218,
          5219, 5220, 5221, 5222, 5223, 5224, 5225, 5226, 5227, 5228, 5229,
          5230, 5231, 5232, 5233, 5234, 5235, 5236, 3514, 5237, 5238, 5239,
          5240, 5241, 5242, 5243, 5244, 2297, 2031, 4616, 4310, 3692, 5245,
          3071, 5246, 3598, 5247, 4617, 3231, 3515, 5248, 4101, 4311, 4618,
          3808, 4312, 4102, 5249, 4103, 4104, 3599, 5250, 5251, 5252, 5253,
          5254, 5255, 5256, 5257, 5258, 5259, 5260, 5261, 5262, 5263, 5264,
          5265, 5266, 5267, 5268, 5269, 5270, 5271, 5272, 5273, 5274, 5275,
          5276, 5277, 5278, 5279, 5280, 5281, 5282, 5283, 5284, 5285, 5286,
          5287, 5288, 5289, 5290, 5291, 5292, 5293, 5294, 5295, 5296, 5297,
          5298, 5299, 5300, 5301, 5302, 5303, 5304, 5305, 5306, 5307, 5308,
          5309, 5310, 5311, 5312, 5313, 5314, 5315, 5316, 5317, 5318, 5319,
          5320, 5321, 5322, 5323, 5324, 5325, 5326, 5327, 5328, 5329, 5330,
          5331, 5332, 5333, 5334, 5335, 5336, 5337, 5338, 5339, 5340, 5341,
          5342, 5343, 5344, 5345, 5346, 5347, 5348, 5349, 5350, 5351, 5352,
          5353, 5354, 5355, 5356, 5357, 5358, 5359, 5360, 5361, 5362, 5363,
          5364, 5365, 5366, 5367, 5368, 5369, 5370, 5371, 5372, 5373, 5374,
          5375, 5376, 5377, 5378, 5379, 5380, 5381, 363, 642, 2787, 2878, 2788,
          2789, 2316, 3232, 2317, 3434, 2011, 165, 1942, 3930, 3931, 3932, 3933,
          5382, 4619, 5383, 4620, 5384, 5385, 5386, 5387, 5388, 5389, 5390,
          5391, 5392, 5393, 5394, 5395, 5396, 5397, 5398, 5399, 5400, 5401,
          5402, 5403, 5404, 5405, 5406, 5407, 5408, 5409, 5410, 5411, 5412,
          5413, 5414, 5415, 5416, 5417, 5418, 5419, 5420, 5421, 5422, 5423,
          5424, 5425, 5426, 5427, 5428, 5429, 5430, 5431, 5432, 5433, 5434,
          5435, 5436, 5437, 5438, 5439, 5440, 5441, 5442, 5443, 5444, 5445,
          5446, 5447, 5448, 5449, 5450, 5451, 5452, 5453, 5454, 5455, 5456,
          5457, 5458, 5459, 5460, 5461, 5462, 5463, 5464, 5465, 5466, 5467,
          5468, 5469, 5470, 5471, 5472, 5473, 5474, 5475, 5476, 5477, 5478,
          5479, 5480, 5481, 5482, 5483, 5484, 5485, 5486, 5487, 5488, 5489,
          5490, 5491, 5492, 5493, 5494, 5495, 5496, 5497, 5498, 5499, 5500,
          5501, 5502, 5503, 5504, 5505, 5506, 5507, 5508, 5509, 5510, 5511,
          5512, 5513, 5514, 5515, 5516, 5517, 5518, 5519, 5520, 5521, 5522,
          5523, 5524, 5525, 5526, 5527, 5528, 5529, 5530, 5531, 5532, 5533,
          5534, 5535, 5536, 5537, 5538, 5539, 5540, 5541, 5542, 5543, 5544,
          5545, 5546, 5547, 5548, 5549, 5550, 5551, 5552, 5553, 5554, 5555,
          5556, 5557, 5558, 5559, 5560, 5561, 5562, 5563, 5564, 5565, 5566,
          5567, 5568, 5569, 5570, 5571, 5572, 5573, 5574, 5575, 5576, 5577,
          5578, 5579, 5580, 5581, 5582, 5583, 5584, 5585, 5586, 5587, 5588,
          5589, 5590, 5591, 5592, 5593, 5594, 5595, 5596, 5597, 5598, 5599,
          5600, 5601, 5602, 5603, 5604, 5605, 5606, 5607, 5608, 5609, 5610,
          5611, 5612, 5613, 5614, 5615, 5616, 5617, 5618, 5619, 5620, 5621,
          5622, 5623, 5624, 5625, 5626, 5627, 5628, 5629, 5630, 5631, 5632,
          5633, 5634, 5635, 5636, 5637, 5638, 5639, 5640, 5641, 5642, 5643,
          5644, 5645, 5646, 5647, 5648, 5649, 5650, 5651, 5652, 5653, 5654,
          5655, 5656, 5657, 5658, 5659, 5660, 5661, 5662, 5663, 5664, 5665,
          5666, 5667, 5668, 5669, 5670, 5671, 5672, 5673, 5674, 5675, 5676,
          5677, 5678, 5679, 5680, 5681, 5682, 5683, 5684, 5685, 5686, 5687,
          5688, 5689, 5690, 5691, 5692, 5693, 5694, 5695, 5696, 5697, 5698,
          5699, 5700, 5701, 5702, 5703, 5704, 5705, 5706, 5707, 5708, 5709,
          5710, 5711, 5712, 5713, 5714, 5715, 5716, 5717, 5718, 5719, 5720,
          5721, 5722, 5723, 5724, 5725, 5726, 5727, 5728, 5729, 5730, 5731,
          5732, 5733, 5734, 5735, 5736, 5737, 5738, 5739, 5740, 5741, 5742,
          5743, 5744, 5745, 5746, 5747, 5748, 5749, 5750, 5751, 5752, 5753,
          5754, 5755, 5756, 5757, 5758, 5759, 5760, 5761, 5762, 5763, 5764,
          5765, 5766, 5767, 5768, 5769, 5770, 5771, 5772, 5773, 5774, 5775,
          5776, 5777, 5778, 5779, 5780, 5781, 5782, 5783, 5784, 5785, 5786,
          5787, 5788, 5789, 5790, 5791, 5792, 5793, 5794, 5795, 5796, 5797,
          5798, 5799, 5800, 5801, 5802, 5803, 5804, 5805, 5806, 5807, 5808,
          5809, 5810, 5811, 5812, 5813, 5814, 5815, 5816, 5817, 5818, 5819,
          5820, 5821, 5822, 5823, 5824, 5825, 5826, 5827, 5828, 5829, 5830,
          5831, 5832, 5833, 5834, 5835, 5836, 5837, 5838, 5839, 5840, 5841,
          5842, 5843, 5844, 5845, 5846, 5847, 5848, 5849, 5850, 5851, 5852,
          5853, 5854, 5855, 5856, 5857, 5858, 5859, 5860, 5861, 5862, 5863,
          5864, 5865, 5866, 5867, 5868, 5869, 5870, 5871, 5872, 5873, 5874,
          5875, 5876, 5877, 5878, 5879, 5880, 5881, 5882, 5883, 5884, 5885,
          5886, 5887, 5888, 5889, 5890, 5891, 5892, 5893, 5894, 5895, 5896,
          5897, 5898, 5899, 5900, 5901, 5902, 5903, 5904, 5905, 5906, 5907,
          5908, 5909, 5910, 5911, 5912, 5913, 5914, 5915, 5916, 5917, 5918,
          5919, 5920, 5921, 5922, 5923, 5924, 5925, 5926, 5927, 5928, 5929,
          5930, 5931, 5932, 5933, 5934, 5935, 5936, 5937, 5938, 5939, 5940,
          5941, 5942, 5943, 5944, 5945, 5946, 5947, 5948, 5949, 5950, 5951,
          5952, 5953, 5954, 5955, 5956, 5957, 5958, 5959, 5960, 5961, 5962,
          5963, 5964, 5965, 5966, 5967, 5968, 5969, 5970, 5971, 5972, 5973,
          5974, 5975, 5976, 5977, 5978, 5979, 5980, 5981, 5982, 5983, 5984,
          5985, 5986, 5987, 5988, 5989, 5990, 5991, 5992, 5993, 5994, 5995,
          5996, 5997, 5998, 5999, 6e3, 6001, 6002, 6003, 6004, 6005, 6006, 6007,
          6008, 6009, 6010, 6011, 6012, 6013, 6014, 6015, 6016, 6017, 6018,
          6019, 6020, 6021, 6022, 6023, 6024, 6025, 6026, 6027, 6028, 6029,
          6030, 6031, 6032, 6033, 6034, 6035, 6036, 6037, 6038, 6039, 6040,
          6041, 6042, 6043, 6044, 6045, 6046, 6047, 6048, 6049, 6050, 6051,
          6052, 6053, 6054, 6055, 6056, 6057, 6058, 6059, 6060, 6061, 6062,
          6063, 6064, 6065, 6066, 6067, 6068, 6069, 6070, 6071, 6072, 6073,
          6074, 6075, 6076, 6077, 6078, 6079, 6080, 6081, 6082, 6083, 6084,
          6085, 6086, 6087, 6088, 6089, 6090, 6091, 6092, 6093, 6094, 6095,
          6096, 6097, 6098, 6099, 6100, 6101, 6102, 6103, 6104, 6105, 6106,
          6107, 6108, 6109, 6110, 6111, 6112, 6113, 6114, 2044, 2060, 4621, 997,
          1235, 473, 1186, 4622, 920, 3378, 6115, 6116, 379, 1108, 4313, 2657,
          2735, 3934, 6117, 3809, 636, 3233, 573, 1026, 3693, 3435, 2974, 3300,
          2298, 4105, 854, 2937, 2463, 393, 2581, 2417, 539, 752, 1280, 2750,
          2480, 140, 1161, 440, 708, 1569, 665, 2497, 1746, 1291, 1523, 3e3,
          164, 1603, 847, 1331, 537, 1997, 486, 508, 1693, 2418, 1970, 2227,
          878, 1220, 299, 1030, 969, 652, 2751, 624, 1137, 3301, 2619, 65, 3302,
          2045, 1761, 1859, 3120, 1930, 3694, 3516, 663, 1767, 852, 835, 3695,
          269, 767, 2826, 2339, 1305, 896, 1150, 770, 1616, 6118, 506, 1502,
          2075, 1012, 2519, 775, 2520, 2975, 2340, 2938, 4314, 3028, 2086, 1224,
          1943, 2286, 6119, 3072, 4315, 2240, 1273, 1987, 3935, 1557, 175, 597,
          985, 3517, 2419, 2521, 1416, 3029, 585, 938, 1931, 1007, 1052, 1932,
          1685, 6120, 3379, 4316, 4623, 804, 599, 3121, 1333, 2128, 2539, 1159,
          1554, 2032, 3810, 687, 2033, 2904, 952, 675, 1467, 3436, 6121, 2241,
          1096, 1786, 2440, 1543, 1924, 980, 1813, 2228, 781, 2692, 1879, 728,
          1918, 3696, 4624, 548, 1950, 4625, 1809, 1088, 1356, 3303, 2522, 1944,
          502, 972, 373, 513, 2827, 586, 2377, 2391, 1003, 1976, 1631, 6122,
          2464, 1084, 648, 1776, 4626, 2141, 324, 962, 2012, 2177, 2076, 1384,
          742, 2178, 1448, 1173, 1810, 222, 102, 301, 445, 125, 2420, 662, 2498,
          277, 200, 1476, 1165, 1068, 224, 2562, 1378, 1446, 450, 1880, 659,
          791, 582, 4627, 2939, 3936, 1516, 1274, 555, 2099, 3697, 1020, 1389,
          1526, 3380, 1762, 1723, 1787, 2229, 412, 2114, 1900, 2392, 3518, 512,
          2597, 427, 1925, 2341, 3122, 1653, 1686, 2465, 2499, 697, 330, 273,
          380, 2162, 951, 832, 780, 991, 1301, 3073, 965, 2270, 3519, 668, 2523,
          2636, 1286, 535, 1407, 518, 671, 957, 2658, 2378, 267, 611, 2197,
          3030, 6123, 248, 2299, 967, 1799, 2356, 850, 1418, 3437, 1876, 1256,
          1480, 2828, 1718, 6124, 6125, 1755, 1664, 2405, 6126, 4628, 2879,
          2829, 499, 2179, 676, 4629, 557, 2329, 2214, 2090, 325, 3234, 464,
          811, 3001, 992, 2342, 2481, 1232, 1469, 303, 2242, 466, 1070, 2163,
          603, 1777, 2091, 4630, 2752, 4631, 2714, 322, 2659, 1964, 1768, 481,
          2188, 1463, 2330, 2857, 3600, 2092, 3031, 2421, 4632, 2318, 2070,
          1849, 2598, 4633, 1302, 2254, 1668, 1701, 2422, 3811, 2905, 3032,
          3123, 2046, 4106, 1763, 1694, 4634, 1604, 943, 1724, 1454, 917, 868,
          2215, 1169, 2940, 552, 1145, 1800, 1228, 1823, 1955, 316, 1080, 2510,
          361, 1807, 2830, 4107, 2660, 3381, 1346, 1423, 1134, 4108, 6127, 541,
          1263, 1229, 1148, 2540, 545, 465, 1833, 2880, 3438, 1901, 3074, 2482,
          816, 3937, 713, 1788, 2500, 122, 1575, 195, 1451, 2501, 1111, 6128,
          859, 374, 1225, 2243, 2483, 4317, 390, 1033, 3439, 3075, 2524, 1687,
          266, 793, 1440, 2599, 946, 779, 802, 507, 897, 1081, 528, 2189, 1292,
          711, 1866, 1725, 1167, 1640, 753, 398, 2661, 1053, 246, 348, 4318,
          137, 1024, 3440, 1600, 2077, 2129, 825, 4319, 698, 238, 521, 187,
          2300, 1157, 2423, 1641, 1605, 1464, 1610, 1097, 2541, 1260, 1436, 759,
          2255, 1814, 2150, 705, 3235, 409, 2563, 3304, 561, 3033, 2005, 2564,
          726, 1956, 2343, 3698, 4109, 949, 3812, 3813, 3520, 1669, 653, 1379,
          2525, 881, 2198, 632, 2256, 1027, 778, 1074, 733, 1957, 514, 1481,
          2466, 554, 2180, 702, 3938, 1606, 1017, 1398, 6129, 1380, 3521, 921,
          993, 1313, 594, 449, 1489, 1617, 1166, 768, 1426, 1360, 495, 1794,
          3601, 1177, 3602, 1170, 4320, 2344, 476, 425, 3167, 4635, 3168, 1424,
          401, 2662, 1171, 3382, 1998, 1089, 4110, 477, 3169, 474, 6130, 1909,
          596, 2831, 1842, 494, 693, 1051, 1028, 1207, 3076, 606, 2115, 727,
          2790, 1473, 1115, 743, 3522, 630, 805, 1532, 4321, 2021, 366, 1057,
          838, 684, 1114, 2142, 4322, 2050, 1492, 1892, 1808, 2271, 3814, 2424,
          1971, 1447, 1373, 3305, 1090, 1536, 3939, 3523, 3306, 1455, 2199, 336,
          369, 2331, 1035, 584, 2393, 902, 718, 2600, 6131, 2753, 463, 2151,
          1149, 1611, 2467, 715, 1308, 3124, 1268, 343, 1413, 3236, 1517, 1347,
          2663, 2093, 3940, 2022, 1131, 1553, 2100, 2941, 1427, 3441, 2942,
          1323, 2484, 6132, 1980, 872, 2368, 2441, 2943, 320, 2369, 2116, 1082,
          679, 1933, 3941, 2791, 3815, 625, 1143, 2023, 422, 2200, 3816, 6133,
          730, 1695, 356, 2257, 1626, 2301, 2858, 2637, 1627, 1778, 937, 883,
          2906, 2693, 3002, 1769, 1086, 400, 1063, 1325, 3307, 2792, 4111, 3077,
          456, 2345, 1046, 747, 6134, 1524, 884, 1094, 3383, 1474, 2164, 1059,
          974, 1688, 2181, 2258, 1047, 345, 1665, 1187, 358, 875, 3170, 305,
          660, 3524, 2190, 1334, 1135, 3171, 1540, 1649, 2542, 1527, 927, 968,
          2793, 885, 1972, 1850, 482, 500, 2638, 1218, 1109, 1085, 2543, 1654,
          2034, 876, 78, 2287, 1482, 1277, 861, 1675, 1083, 1779, 724, 2754,
          454, 397, 1132, 1612, 2332, 893, 672, 1237, 257, 2259, 2370, 135,
          3384, 337, 2244, 547, 352, 340, 709, 2485, 1400, 788, 1138, 2511, 540,
          772, 1682, 2260, 2272, 2544, 2013, 1843, 1902, 4636, 1999, 1562, 2288,
          4637, 2201, 1403, 1533, 407, 576, 3308, 1254, 2071, 978, 3385, 170,
          136, 1201, 3125, 2664, 3172, 2394, 213, 912, 873, 3603, 1713, 2202,
          699, 3604, 3699, 813, 3442, 493, 531, 1054, 468, 2907, 1483, 304, 281,
          4112, 1726, 1252, 2094, 339, 2319, 2130, 2639, 756, 1563, 2944, 748,
          571, 2976, 1588, 2425, 2715, 1851, 1460, 2426, 1528, 1392, 1973, 3237,
          288, 3309, 685, 3386, 296, 892, 2716, 2216, 1570, 2245, 722, 1747,
          2217, 905, 3238, 1103, 6135, 1893, 1441, 1965, 251, 1805, 2371, 3700,
          2601, 1919, 1078, 75, 2182, 1509, 1592, 1270, 2640, 4638, 2152, 6136,
          3310, 3817, 524, 706, 1075, 292, 3818, 1756, 2602, 317, 98, 3173,
          3605, 3525, 1844, 2218, 3819, 2502, 814, 567, 385, 2908, 1534, 6137,
          534, 1642, 3239, 797, 6138, 1670, 1529, 953, 4323, 188, 1071, 538,
          178, 729, 3240, 2109, 1226, 1374, 2e3, 2357, 2977, 731, 2468, 1116,
          2014, 2051, 6139, 1261, 1593, 803, 2859, 2736, 3443, 556, 682, 823,
          1541, 6140, 1369, 2289, 1706, 2794, 845, 462, 2603, 2665, 1361, 387,
          162, 2358, 1740, 739, 1770, 1720, 1304, 1401, 3241, 1049, 627, 1571,
          2427, 3526, 1877, 3942, 1852, 1500, 431, 1910, 1503, 677, 297, 2795,
          286, 1433, 1038, 1198, 2290, 1133, 1596, 4113, 4639, 2469, 1510, 1484,
          3943, 6141, 2442, 108, 712, 4640, 2372, 866, 3701, 2755, 3242, 1348,
          834, 1945, 1408, 3527, 2395, 3243, 1811, 824, 994, 1179, 2110, 1548,
          1453, 790, 3003, 690, 4324, 4325, 2832, 2909, 3820, 1860, 3821, 225,
          1748, 310, 346, 1780, 2470, 821, 1993, 2717, 2796, 828, 877, 3528,
          2860, 2471, 1702, 2165, 2910, 2486, 1789, 453, 359, 2291, 1676, 73,
          1164, 1461, 1127, 3311, 421, 604, 314, 1037, 589, 116, 2487, 737, 837,
          1180, 111, 244, 735, 6142, 2261, 1861, 1362, 986, 523, 418, 581, 2666,
          3822, 103, 855, 503, 1414, 1867, 2488, 1091, 657, 1597, 979, 605,
          1316, 4641, 1021, 2443, 2078, 2001, 1209, 96, 587, 2166, 1032, 260,
          1072, 2153, 173, 94, 226, 3244, 819, 2006, 4642, 4114, 2203, 231,
          1744, 782, 97, 2667, 786, 3387, 887, 391, 442, 2219, 4326, 1425, 6143,
          2694, 633, 1544, 1202, 483, 2015, 592, 2052, 1958, 2472, 1655, 419,
          129, 4327, 3444, 3312, 1714, 1257, 3078, 4328, 1518, 1098, 865, 1310,
          1019, 1885, 1512, 1734, 469, 2444, 148, 773, 436, 1815, 1868, 1128,
          1055, 4329, 1245, 2756, 3445, 2154, 1934, 1039, 4643, 579, 1238, 932,
          2320, 353, 205, 801, 115, 2428, 944, 2321, 1881, 399, 2565, 1211, 678,
          766, 3944, 335, 2101, 1459, 1781, 1402, 3945, 2737, 2131, 1010, 844,
          981, 1326, 1013, 550, 1816, 1545, 2620, 1335, 1008, 371, 2881, 936,
          1419, 1613, 3529, 1456, 1395, 2273, 1834, 2604, 1317, 2738, 2503, 416,
          1643, 4330, 806, 1126, 229, 591, 3946, 1314, 1981, 1576, 1837, 1666,
          347, 1790, 977, 3313, 764, 2861, 1853, 688, 2429, 1920, 1462, 77, 595,
          415, 2002, 3034, 798, 1192, 4115, 6144, 2978, 4331, 3035, 2695, 2582,
          2072, 2566, 430, 2430, 1727, 842, 1396, 3947, 3702, 613, 377, 278,
          236, 1417, 3388, 3314, 3174, 757, 1869, 107, 3530, 6145, 1194, 623,
          2262, 207, 1253, 2167, 3446, 3948, 492, 1117, 1935, 536, 1838, 2757,
          1246, 4332, 696, 2095, 2406, 1393, 1572, 3175, 1782, 583, 190, 253,
          1390, 2230, 830, 3126, 3389, 934, 3245, 1703, 1749, 2979, 1870, 2545,
          1656, 2204, 869, 2346, 4116, 3176, 1817, 496, 1764, 4644, 942, 1504,
          404, 1903, 1122, 1580, 3606, 2945, 1022, 515, 372, 1735, 955, 2431,
          3036, 6146, 2797, 1110, 2302, 2798, 617, 6147, 441, 762, 1771, 3447,
          3607, 3608, 1904, 840, 3037, 86, 939, 1385, 572, 1370, 2445, 1336,
          114, 3703, 898, 294, 203, 3315, 703, 1583, 2274, 429, 961, 4333, 1854,
          1951, 3390, 2373, 3704, 4334, 1318, 1381, 966, 1911, 2322, 1006, 1155,
          309, 989, 458, 2718, 1795, 1372, 1203, 252, 1689, 1363, 3177, 517,
          1936, 168, 1490, 562, 193, 3823, 1042, 4117, 1835, 551, 470, 4645,
          395, 489, 3448, 1871, 1465, 2583, 2641, 417, 1493, 279, 1295, 511,
          1236, 1119, 72, 1231, 1982, 1812, 3004, 871, 1564, 984, 3449, 1667,
          2696, 2096, 4646, 2347, 2833, 1673, 3609, 695, 3246, 2668, 807, 1183,
          4647, 890, 388, 2333, 1801, 1457, 2911, 1765, 1477, 1031, 3316, 3317,
          1278, 3391, 2799, 2292, 2526, 163, 3450, 4335, 2669, 1404, 1802, 6148,
          2323, 2407, 1584, 1728, 1494, 1824, 1269, 298, 909, 3318, 1034, 1632,
          375, 776, 1683, 2061, 291, 210, 1123, 809, 1249, 1002, 2642, 3038,
          206, 1011, 2132, 144, 975, 882, 1565, 342, 667, 754, 1442, 2143, 1299,
          2303, 2062, 447, 626, 2205, 1221, 2739, 2912, 1144, 1214, 2206, 2584,
          760, 1715, 614, 950, 1281, 2670, 2621, 810, 577, 1287, 2546, 4648,
          242, 2168, 250, 2643, 691, 123, 2644, 647, 313, 1029, 689, 1357, 2946,
          1650, 216, 771, 1339, 1306, 808, 2063, 549, 913, 1371, 2913, 2914,
          6149, 1466, 1092, 1174, 1196, 1311, 2605, 2396, 1783, 1796, 3079, 406,
          2671, 2117, 3949, 4649, 487, 1825, 2220, 6150, 2915, 448, 2348, 1073,
          6151, 2397, 1707, 130, 900, 1598, 329, 176, 1959, 2527, 1620, 6152,
          2275, 4336, 3319, 1983, 2191, 3705, 3610, 2155, 3706, 1912, 1513,
          1614, 6153, 1988, 646, 392, 2304, 1589, 3320, 3039, 1826, 1239, 1352,
          1340, 2916, 505, 2567, 1709, 1437, 2408, 2547, 906, 6154, 2672, 384,
          1458, 1594, 1100, 1329, 710, 423, 3531, 2064, 2231, 2622, 1989, 2673,
          1087, 1882, 333, 841, 3005, 1296, 2882, 2379, 580, 1937, 1827, 1293,
          2585, 601, 574, 249, 1772, 4118, 2079, 1120, 645, 901, 1176, 1690,
          795, 2207, 478, 1434, 516, 1190, 1530, 761, 2080, 930, 1264, 355, 435,
          1552, 644, 1791, 987, 220, 1364, 1163, 1121, 1538, 306, 2169, 1327,
          1222, 546, 2645, 218, 241, 610, 1704, 3321, 1984, 1839, 1966, 2528,
          451, 6155, 2586, 3707, 2568, 907, 3178, 254, 2947, 186, 1845, 4650,
          745, 432, 1757, 428, 1633, 888, 2246, 2221, 2489, 3611, 2118, 1258,
          1265, 956, 3127, 1784, 4337, 2490, 319, 510, 119, 457, 3612, 274,
          2035, 2007, 4651, 1409, 3128, 970, 2758, 590, 2800, 661, 2247, 4652,
          2008, 3950, 1420, 1549, 3080, 3322, 3951, 1651, 1375, 2111, 485, 2491,
          1429, 1156, 6156, 2548, 2183, 1495, 831, 1840, 2529, 2446, 501, 1657,
          307, 1894, 3247, 1341, 666, 899, 2156, 1539, 2549, 1559, 886, 349,
          2208, 3081, 2305, 1736, 3824, 2170, 2759, 1014, 1913, 1386, 542, 1397,
          2948, 490, 368, 716, 362, 159, 282, 2569, 1129, 1658, 1288, 1750,
          2674, 276, 649, 2016, 751, 1496, 658, 1818, 1284, 1862, 2209, 2087,
          2512, 3451, 622, 2834, 376, 117, 1060, 2053, 1208, 1721, 1101, 1443,
          247, 1250, 3179, 1792, 3952, 2760, 2398, 3953, 6157, 2144, 3708, 446,
          2432, 1151, 2570, 3452, 2447, 2761, 2835, 1210, 2448, 3082, 424, 2222,
          1251, 2449, 2119, 2836, 504, 1581, 4338, 602, 817, 857, 3825, 2349,
          2306, 357, 3826, 1470, 1883, 2883, 255, 958, 929, 2917, 3248, 302,
          4653, 1050, 1271, 1751, 2307, 1952, 1430, 2697, 2719, 2359, 354, 3180,
          777, 158, 2036, 4339, 1659, 4340, 4654, 2308, 2949, 2248, 1146, 2232,
          3532, 2720, 1696, 2623, 3827, 6158, 3129, 1550, 2698, 1485, 1297,
          1428, 637, 931, 2721, 2145, 914, 2550, 2587, 81, 2450, 612, 827, 2646,
          1242, 4655, 1118, 2884, 472, 1855, 3181, 3533, 3534, 569, 1353, 2699,
          1244, 1758, 2588, 4119, 2009, 2762, 2171, 3709, 1312, 1531, 6159,
          1152, 1938, 134, 1830, 471, 3710, 2276, 1112, 1535, 3323, 3453, 3535,
          982, 1337, 2950, 488, 826, 674, 1058, 1628, 4120, 2017, 522, 2399,
          211, 568, 1367, 3454, 350, 293, 1872, 1139, 3249, 1399, 1946, 3006,
          1300, 2360, 3324, 588, 736, 6160, 2606, 744, 669, 3536, 3828, 6161,
          1358, 199, 723, 848, 933, 851, 1939, 1505, 1514, 1338, 1618, 1831,
          4656, 1634, 3613, 443, 2740, 3829, 717, 1947, 491, 1914, 6162, 2551,
          1542, 4121, 1025, 6163, 1099, 1223, 198, 3040, 2722, 370, 410, 1905,
          2589, 998, 1248, 3182, 2380, 519, 1449, 4122, 1710, 947, 928, 1153,
          4341, 2277, 344, 2624, 1511, 615, 105, 161, 1212, 1076, 1960, 3130,
          2054, 1926, 1175, 1906, 2473, 414, 1873, 2801, 6164, 2309, 315, 1319,
          3325, 318, 2018, 2146, 2157, 963, 631, 223, 4342, 4343, 2675, 479,
          3711, 1197, 2625, 3712, 2676, 2361, 6165, 4344, 4123, 6166, 2451,
          3183, 1886, 2184, 1674, 1330, 1711, 1635, 1506, 799, 219, 3250, 3083,
          3954, 1677, 3713, 3326, 2081, 3614, 1652, 2073, 4657, 1147, 3041,
          1752, 643, 1961, 147, 1974, 3955, 6167, 1716, 2037, 918, 3007, 1994,
          120, 1537, 118, 609, 3184, 4345, 740, 3455, 1219, 332, 1615, 3830,
          6168, 1621, 2980, 1582, 783, 212, 553, 2350, 3714, 1349, 2433, 2082,
          4124, 889, 6169, 2310, 1275, 1410, 973, 166, 1320, 3456, 1797, 1215,
          3185, 2885, 1846, 2590, 2763, 4658, 629, 822, 3008, 763, 940, 1990,
          2862, 439, 2409, 1566, 1240, 1622, 926, 1282, 1907, 2764, 654, 2210,
          1607, 327, 1130, 3956, 1678, 1623, 6170, 2434, 2192, 686, 608, 3831,
          3715, 903, 3957, 3042, 6171, 2741, 1522, 1915, 1105, 1555, 2552, 1359,
          323, 3251, 4346, 3457, 738, 1354, 2553, 2311, 2334, 1828, 2003, 3832,
          1753, 2351, 1227, 6172, 1887, 4125, 1478, 6173, 2410, 1874, 1712,
          1847, 520, 1204, 2607, 264, 4659, 836, 2677, 2102, 600, 4660, 3833,
          2278, 3084, 6174, 4347, 3615, 1342, 640, 532, 543, 2608, 1888, 2400,
          2591, 1009, 4348, 1497, 341, 1737, 3616, 2723, 1394, 529, 3252, 1321,
          983, 4661, 1515, 2120, 971, 2592, 924, 287, 1662, 3186, 4349, 2700,
          4350, 1519, 908, 1948, 2452, 156, 796, 1629, 1486, 2223, 2055, 694,
          4126, 1259, 1036, 3392, 1213, 2249, 2742, 1889, 1230, 3958, 1015, 910,
          408, 559, 3617, 4662, 746, 725, 935, 4663, 3959, 3009, 1289, 563, 867,
          4664, 3960, 1567, 2981, 2038, 2626, 988, 2263, 2381, 4351, 143, 2374,
          704, 1895, 6175, 1188, 3716, 2088, 673, 3085, 2362, 4352, 484, 1608,
          1921, 2765, 2918, 215, 904, 3618, 3537, 894, 509, 976, 3043, 2701,
          3961, 4353, 2837, 2982, 498, 6176, 6177, 1102, 3538, 1332, 3393, 1487,
          1636, 1637, 233, 245, 3962, 383, 650, 995, 3044, 460, 1520, 1206,
          2352, 749, 3327, 530, 700, 389, 1438, 1560, 1773, 3963, 2264, 719,
          2951, 2724, 3834, 870, 1832, 1644, 1e3, 839, 2474, 3717, 197, 1630,
          3394, 365, 2886, 3964, 1285, 2133, 734, 922, 818, 1106, 732, 480,
          2083, 1774, 3458, 923, 2279, 1350, 221, 3086, 85, 2233, 2234, 3835,
          1585, 3010, 2147, 1387, 1705, 2382, 1619, 2475, 133, 239, 2802, 1991,
          1016, 2084, 2383, 411, 2838, 1113, 651, 1985, 1160, 3328, 990, 1863,
          3087, 1048, 1276, 2647, 265, 2627, 1599, 3253, 2056, 150, 638, 2019,
          656, 853, 326, 1479, 680, 1439, 4354, 1001, 1759, 413, 3459, 3395,
          2492, 1431, 459, 4355, 1125, 3329, 2265, 1953, 1450, 2065, 2863, 849,
          351, 2678, 3131, 3254, 3255, 1104, 1577, 227, 1351, 1645, 2453, 2193,
          1421, 2887, 812, 2121, 634, 95, 2435, 201, 2312, 4665, 1646, 1671,
          2743, 1601, 2554, 2702, 2648, 2280, 1315, 1366, 2089, 3132, 1573,
          3718, 3965, 1729, 1189, 328, 2679, 1077, 1940, 1136, 558, 1283, 964,
          1195, 621, 2074, 1199, 1743, 3460, 3619, 1896, 1916, 1890, 3836, 2952,
          1154, 2112, 1064, 862, 378, 3011, 2066, 2113, 2803, 1568, 2839, 6178,
          3088, 2919, 1941, 1660, 2004, 1992, 2194, 142, 707, 1590, 1708, 1624,
          1922, 1023, 1836, 1233, 1004, 2313, 789, 741, 3620, 6179, 1609, 2411,
          1200, 4127, 3719, 3720, 4666, 2057, 3721, 593, 2840, 367, 2920, 1878,
          6180, 3461, 1521, 628, 1168, 692, 2211, 2649, 300, 720, 2067, 2571,
          2953, 3396, 959, 2504, 3966, 3539, 3462, 1977, 701, 6181, 954, 1043,
          800, 681, 183, 3722, 1803, 1730, 3540, 4128, 2103, 815, 2314, 174,
          467, 230, 2454, 1093, 2134, 755, 3541, 3397, 1141, 1162, 6182, 1738,
          2039, 270, 3256, 2513, 1005, 1647, 2185, 3837, 858, 1679, 1897, 1719,
          2954, 2324, 1806, 402, 670, 167, 4129, 1498, 2158, 2104, 750, 6183,
          915, 189, 1680, 1551, 455, 4356, 1501, 2455, 405, 1095, 2955, 338,
          1586, 1266, 1819, 570, 641, 1324, 237, 1556, 2650, 1388, 3723, 6184,
          1368, 2384, 1343, 1978, 3089, 2436, 879, 3724, 792, 1191, 758, 3012,
          1411, 2135, 1322, 4357, 240, 4667, 1848, 3725, 1574, 6185, 420, 3045,
          1546, 1391, 714, 4358, 1967, 941, 1864, 863, 664, 426, 560, 1731,
          2680, 1785, 2864, 1949, 2363, 403, 3330, 1415, 1279, 2136, 1697, 2335,
          204, 721, 2097, 3838, 90, 6186, 2085, 2505, 191, 3967, 124, 2148,
          1376, 1798, 1178, 1107, 1898, 1405, 860, 4359, 1243, 1272, 2375, 2983,
          1558, 2456, 1638, 113, 3621, 578, 1923, 2609, 880, 386, 4130, 784,
          2186, 2266, 1422, 2956, 2172, 1722, 497, 263, 2514, 1267, 2412, 2610,
          177, 2703, 3542, 774, 1927, 1344, 616, 1432, 1595, 1018, 172, 4360,
          2325, 911, 4361, 438, 1468, 3622, 794, 3968, 2024, 2173, 1681, 1829,
          2957, 945, 895, 3090, 575, 2212, 2476, 475, 2401, 2681, 785, 2744,
          1745, 2293, 2555, 1975, 3133, 2865, 394, 4668, 3839, 635, 4131, 639,
          202, 1507, 2195, 2766, 1345, 1435, 2572, 3726, 1908, 1184, 1181, 2457,
          3727, 3134, 4362, 843, 2611, 437, 916, 4669, 234, 769, 1884, 3046,
          3047, 3623, 833, 6187, 1639, 2250, 2402, 1355, 1185, 2010, 2047, 999,
          525, 1732, 1290, 1488, 2612, 948, 1578, 3728, 2413, 2477, 1216, 2725,
          2159, 334, 3840, 1328, 3624, 2921, 1525, 4132, 564, 1056, 891, 4363,
          1444, 1698, 2385, 2251, 3729, 1365, 2281, 2235, 1717, 6188, 864, 3841,
          2515, 444, 527, 2767, 2922, 3625, 544, 461, 6189, 566, 209, 2437,
          3398, 2098, 1065, 2068, 3331, 3626, 3257, 2137, 2138, 2122, 3730,
          2888, 1995, 1820, 1044, 6190, 6191, 6192, 6193, 6194, 6195, 6196,
          6197, 6198, 6199, 6200, 6201, 6202, 6203, 6204, 6205, 4670, 6206,
          6207, 6208, 6209, 6210, 6211, 6212, 6213, 6214, 6215, 6216, 6217,
          6218, 6219, 6220, 6221, 6222, 6223, 6224, 6225, 6226, 6227, 6228,
          6229, 6230, 6231, 6232, 6233, 6234, 6235, 6236, 6237, 3187, 6238,
          6239, 3969, 6240, 6241, 6242, 6243, 6244, 4671, 6245, 6246, 4672,
          6247, 6248, 4133, 6249, 6250, 4364, 6251, 2923, 2556, 2613, 4673,
          4365, 3970, 6252, 6253, 6254, 6255, 4674, 6256, 6257, 6258, 2768,
          2353, 4366, 4675, 4676, 3188, 4367, 3463, 6259, 4134, 4677, 4678,
          6260, 2267, 6261, 3842, 3332, 4368, 3543, 6262, 6263, 6264, 3013,
          1954, 1928, 4135, 4679, 6265, 6266, 2478, 3091, 6267, 4680, 4369,
          6268, 6269, 1699, 6270, 3544, 4136, 4681, 6271, 4137, 6272, 4370,
          2804, 6273, 6274, 2593, 3971, 3972, 4682, 6275, 2236, 4683, 6276,
          6277, 4684, 6278, 6279, 4138, 3973, 4685, 6280, 6281, 3258, 6282,
          6283, 6284, 6285, 3974, 4686, 2841, 3975, 6286, 6287, 3545, 6288,
          6289, 4139, 4687, 4140, 6290, 4141, 6291, 4142, 6292, 6293, 3333,
          6294, 6295, 6296, 4371, 6297, 3399, 6298, 6299, 4372, 3976, 6300,
          6301, 6302, 4373, 6303, 6304, 3843, 3731, 6305, 4688, 4374, 6306,
          6307, 3259, 2294, 6308, 3732, 2530, 4143, 6309, 4689, 6310, 6311,
          6312, 3048, 6313, 6314, 4690, 3733, 2237, 6315, 6316, 2282, 3334,
          6317, 6318, 3844, 6319, 6320, 4691, 6321, 3400, 4692, 6322, 4693,
          6323, 3049, 6324, 4375, 6325, 3977, 6326, 6327, 6328, 3546, 6329,
          4694, 3335, 6330, 4695, 4696, 6331, 6332, 6333, 6334, 4376, 3978,
          6335, 4697, 3979, 4144, 6336, 3980, 4698, 6337, 6338, 6339, 6340,
          6341, 4699, 4700, 4701, 6342, 6343, 4702, 6344, 6345, 4703, 6346,
          6347, 4704, 6348, 4705, 4706, 3135, 6349, 4707, 6350, 4708, 6351,
          4377, 6352, 4709, 3734, 4145, 6353, 2506, 4710, 3189, 6354, 3050,
          4711, 3981, 6355, 3547, 3014, 4146, 4378, 3735, 2651, 3845, 3260,
          3136, 2224, 1986, 6356, 3401, 6357, 4712, 2594, 3627, 3137, 2573,
          3736, 3982, 4713, 3628, 4714, 4715, 2682, 3629, 4716, 6358, 3630,
          4379, 3631, 6359, 6360, 6361, 3983, 6362, 6363, 6364, 6365, 4147,
          3846, 4717, 6366, 6367, 3737, 2842, 6368, 4718, 2628, 6369, 3261,
          6370, 2386, 6371, 6372, 3738, 3984, 4719, 3464, 4720, 3402, 6373,
          2924, 3336, 4148, 2866, 6374, 2805, 3262, 4380, 2704, 2069, 2531,
          3138, 2806, 2984, 6375, 2769, 6376, 4721, 4722, 3403, 6377, 6378,
          3548, 6379, 6380, 2705, 3092, 1979, 4149, 2629, 3337, 2889, 6381,
          3338, 4150, 2557, 3339, 4381, 6382, 3190, 3263, 3739, 6383, 4151,
          4723, 4152, 2558, 2574, 3404, 3191, 6384, 6385, 4153, 6386, 4724,
          4382, 6387, 6388, 4383, 6389, 6390, 4154, 6391, 4725, 3985, 6392,
          3847, 4155, 6393, 6394, 6395, 6396, 6397, 3465, 6398, 4384, 6399,
          6400, 6401, 6402, 6403, 6404, 4156, 6405, 6406, 6407, 6408, 2123,
          6409, 6410, 2326, 3192, 4726, 6411, 6412, 6413, 6414, 4385, 4157,
          6415, 6416, 4158, 6417, 3093, 3848, 6418, 3986, 6419, 6420, 3849,
          6421, 6422, 6423, 4159, 6424, 6425, 4160, 6426, 3740, 6427, 6428,
          6429, 6430, 3987, 6431, 4727, 6432, 2238, 6433, 6434, 4386, 3988,
          6435, 6436, 3632, 6437, 6438, 2843, 6439, 6440, 6441, 6442, 3633,
          6443, 2958, 6444, 6445, 3466, 6446, 2364, 4387, 3850, 6447, 4388,
          2959, 3340, 6448, 3851, 6449, 4728, 6450, 6451, 3264, 4729, 6452,
          3193, 6453, 4389, 4390, 2706, 3341, 4730, 6454, 3139, 6455, 3194,
          6456, 3051, 2124, 3852, 1602, 4391, 4161, 3853, 1158, 3854, 4162,
          3989, 4392, 3990, 4731, 4732, 4393, 2040, 4163, 4394, 3265, 6457,
          2807, 3467, 3855, 6458, 6459, 6460, 3991, 3468, 4733, 4734, 6461,
          3140, 2960, 6462, 4735, 6463, 6464, 6465, 6466, 4736, 4737, 4738,
          4739, 6467, 6468, 4164, 2403, 3856, 6469, 6470, 2770, 2844, 6471,
          4740, 6472, 6473, 6474, 6475, 6476, 6477, 6478, 3195, 6479, 4741,
          4395, 6480, 2867, 6481, 4742, 2808, 6482, 2493, 4165, 6483, 6484,
          6485, 6486, 2295, 4743, 6487, 6488, 6489, 3634, 6490, 6491, 6492,
          6493, 6494, 6495, 6496, 2985, 4744, 6497, 6498, 4745, 6499, 6500,
          2925, 3141, 4166, 6501, 6502, 4746, 6503, 6504, 4747, 6505, 6506,
          6507, 2890, 6508, 6509, 6510, 6511, 6512, 6513, 6514, 6515, 6516,
          6517, 6518, 6519, 3469, 4167, 6520, 6521, 6522, 4748, 4396, 3741,
          4397, 4749, 4398, 3342, 2125, 4750, 6523, 4751, 4752, 4753, 3052,
          6524, 2961, 4168, 6525, 4754, 6526, 4755, 4399, 2926, 4169, 6527,
          3857, 6528, 4400, 4170, 6529, 4171, 6530, 6531, 2595, 6532, 6533,
          6534, 6535, 3635, 6536, 6537, 6538, 6539, 6540, 6541, 6542, 4756,
          6543, 6544, 6545, 6546, 6547, 6548, 4401, 6549, 6550, 6551, 6552,
          4402, 3405, 4757, 4403, 6553, 6554, 6555, 4172, 3742, 6556, 6557,
          6558, 3992, 3636, 6559, 6560, 3053, 2726, 6561, 3549, 4173, 3054,
          4404, 6562, 6563, 3993, 4405, 3266, 3550, 2809, 4406, 6564, 6565,
          6566, 4758, 4759, 6567, 3743, 6568, 4760, 3744, 4761, 3470, 6569,
          6570, 6571, 4407, 6572, 3745, 4174, 6573, 4175, 2810, 4176, 3196,
          4762, 6574, 4177, 6575, 6576, 2494, 2891, 3551, 6577, 6578, 3471,
          6579, 4408, 6580, 3015, 3197, 6581, 3343, 2532, 3994, 3858, 6582,
          3094, 3406, 4409, 6583, 2892, 4178, 4763, 4410, 3016, 4411, 6584,
          3995, 3142, 3017, 2683, 6585, 4179, 6586, 6587, 4764, 4412, 6588,
          6589, 4413, 6590, 2986, 6591, 2962, 3552, 6592, 2963, 3472, 6593,
          6594, 4180, 4765, 6595, 6596, 2225, 3267, 4414, 6597, 3407, 3637,
          4766, 6598, 6599, 3198, 6600, 4415, 6601, 3859, 3199, 6602, 3473,
          4767, 2811, 4416, 1856, 3268, 3200, 2575, 3996, 3997, 3201, 4417,
          6603, 3095, 2927, 6604, 3143, 6605, 2268, 6606, 3998, 3860, 3096,
          2771, 6607, 6608, 3638, 2495, 4768, 6609, 3861, 6610, 3269, 2745,
          4769, 4181, 3553, 6611, 2845, 3270, 6612, 6613, 6614, 3862, 6615,
          6616, 4770, 4771, 6617, 3474, 3999, 4418, 4419, 6618, 3639, 3344,
          6619, 4772, 4182, 6620, 2126, 6621, 6622, 6623, 4420, 4773, 6624,
          3018, 6625, 4774, 3554, 6626, 4183, 2025, 3746, 6627, 4184, 2707,
          6628, 4421, 4422, 3097, 1775, 4185, 3555, 6629, 6630, 2868, 6631,
          6632, 4423, 6633, 6634, 4424, 2414, 2533, 2928, 6635, 4186, 2387,
          6636, 4775, 6637, 4187, 6638, 1891, 4425, 3202, 3203, 6639, 6640,
          4776, 6641, 3345, 6642, 6643, 3640, 6644, 3475, 3346, 3641, 4e3, 6645,
          3144, 6646, 3098, 2812, 4188, 3642, 3204, 6647, 3863, 3476, 6648,
          3864, 6649, 4426, 4001, 6650, 6651, 6652, 2576, 6653, 4189, 4777,
          6654, 6655, 6656, 2846, 6657, 3477, 3205, 4002, 6658, 4003, 6659,
          3347, 2252, 6660, 6661, 6662, 4778, 6663, 6664, 6665, 6666, 6667,
          6668, 6669, 4779, 4780, 2048, 6670, 3478, 3099, 6671, 3556, 3747,
          4004, 6672, 6673, 6674, 3145, 4005, 3748, 6675, 6676, 6677, 6678,
          6679, 3408, 6680, 6681, 6682, 6683, 3206, 3207, 6684, 6685, 4781,
          4427, 6686, 4782, 4783, 4784, 6687, 6688, 6689, 4190, 6690, 6691,
          3479, 6692, 2746, 6693, 4428, 6694, 6695, 6696, 6697, 6698, 6699,
          4785, 6700, 6701, 3208, 2727, 6702, 3146, 6703, 6704, 3409, 2196,
          6705, 4429, 6706, 6707, 6708, 2534, 1996, 6709, 6710, 6711, 2747,
          6712, 6713, 6714, 4786, 3643, 6715, 4430, 4431, 6716, 3557, 6717,
          4432, 4433, 6718, 6719, 6720, 6721, 3749, 6722, 4006, 4787, 6723,
          6724, 3644, 4788, 4434, 6725, 6726, 4789, 2772, 6727, 6728, 6729,
          6730, 6731, 2708, 3865, 2813, 4435, 6732, 6733, 4790, 4791, 3480,
          6734, 6735, 6736, 6737, 4436, 3348, 6738, 3410, 4007, 6739, 6740,
          4008, 6741, 6742, 4792, 3411, 4191, 6743, 6744, 6745, 6746, 6747,
          3866, 6748, 3750, 6749, 6750, 6751, 6752, 6753, 6754, 6755, 3867,
          6756, 4009, 6757, 4793, 4794, 6758, 2814, 2987, 6759, 6760, 6761,
          4437, 6762, 6763, 6764, 6765, 3645, 6766, 6767, 3481, 4192, 6768,
          3751, 6769, 6770, 2174, 6771, 3868, 3752, 6772, 6773, 6774, 4193,
          4795, 4438, 3558, 4796, 4439, 6775, 4797, 6776, 6777, 4798, 6778,
          4799, 3559, 4800, 6779, 6780, 6781, 3482, 6782, 2893, 6783, 6784,
          4194, 4801, 4010, 6785, 6786, 4440, 6787, 4011, 6788, 6789, 6790,
          6791, 6792, 6793, 4802, 6794, 6795, 6796, 4012, 6797, 6798, 6799,
          6800, 3349, 4803, 3483, 6801, 4804, 4195, 6802, 4013, 6803, 6804,
          4196, 6805, 4014, 4015, 6806, 2847, 3271, 2848, 6807, 3484, 6808,
          6809, 6810, 4441, 6811, 4442, 4197, 4443, 3272, 4805, 6812, 3412,
          4016, 1579, 6813, 6814, 4017, 6815, 3869, 6816, 2964, 6817, 4806,
          6818, 6819, 4018, 3646, 6820, 6821, 4807, 4019, 4020, 6822, 6823,
          3560, 6824, 6825, 4021, 4444, 6826, 4198, 6827, 6828, 4445, 6829,
          6830, 4199, 4808, 6831, 6832, 6833, 3870, 3019, 2458, 6834, 3753,
          3413, 3350, 6835, 4809, 3871, 4810, 3561, 4446, 6836, 6837, 4447,
          4811, 4812, 6838, 2459, 4448, 6839, 4449, 6840, 6841, 4022, 3872,
          6842, 4813, 4814, 6843, 6844, 4815, 4200, 4201, 4202, 6845, 4023,
          6846, 6847, 4450, 3562, 3873, 6848, 6849, 4816, 4817, 6850, 4451,
          4818, 2139, 6851, 3563, 6852, 6853, 3351, 6854, 6855, 3352, 4024,
          2709, 3414, 4203, 4452, 6856, 4204, 6857, 6858, 3874, 3875, 6859,
          6860, 4819, 6861, 6862, 6863, 6864, 4453, 3647, 6865, 6866, 4820,
          6867, 6868, 6869, 6870, 4454, 6871, 2869, 6872, 6873, 4821, 6874,
          3754, 6875, 4822, 4205, 6876, 6877, 6878, 3648, 4206, 4455, 6879,
          4823, 6880, 4824, 3876, 6881, 3055, 4207, 6882, 3415, 6883, 6884,
          6885, 4208, 4209, 6886, 4210, 3353, 6887, 3354, 3564, 3209, 3485,
          2652, 6888, 2728, 6889, 3210, 3755, 6890, 4025, 4456, 6891, 4825,
          6892, 6893, 6894, 6895, 4211, 6896, 6897, 6898, 4826, 6899, 6900,
          4212, 6901, 4827, 6902, 2773, 3565, 6903, 4828, 6904, 6905, 6906,
          6907, 3649, 3650, 6908, 2849, 3566, 6909, 3567, 3100, 6910, 6911,
          6912, 6913, 6914, 6915, 4026, 6916, 3355, 4829, 3056, 4457, 3756,
          6917, 3651, 6918, 4213, 3652, 2870, 6919, 4458, 6920, 2438, 6921,
          6922, 3757, 2774, 4830, 6923, 3356, 4831, 4832, 6924, 4833, 4459,
          3653, 2507, 6925, 4834, 2535, 6926, 6927, 3273, 4027, 3147, 6928,
          3568, 6929, 6930, 6931, 4460, 6932, 3877, 4461, 2729, 3654, 6933,
          6934, 6935, 6936, 2175, 4835, 2630, 4214, 4028, 4462, 4836, 4215,
          6937, 3148, 4216, 4463, 4837, 4838, 4217, 6938, 6939, 2850, 4839,
          6940, 4464, 6941, 6942, 6943, 4840, 6944, 4218, 3274, 4465, 6945,
          6946, 2710, 6947, 4841, 4466, 6948, 6949, 2894, 6950, 6951, 4842,
          6952, 4219, 3057, 2871, 6953, 6954, 6955, 6956, 4467, 6957, 2711,
          6958, 6959, 6960, 3275, 3101, 4843, 6961, 3357, 3569, 6962, 4844,
          6963, 6964, 4468, 4845, 3570, 6965, 3102, 4846, 3758, 6966, 4847,
          3878, 4848, 4849, 4029, 6967, 2929, 3879, 4850, 4851, 6968, 6969,
          1733, 6970, 4220, 6971, 6972, 6973, 6974, 6975, 6976, 4852, 6977,
          6978, 6979, 6980, 6981, 6982, 3759, 6983, 6984, 6985, 3486, 3487,
          6986, 3488, 3416, 6987, 6988, 6989, 6990, 6991, 6992, 6993, 6994,
          6995, 6996, 6997, 4853, 6998, 6999, 4030, 7e3, 7001, 3211, 7002, 7003,
          4221, 7004, 7005, 3571, 4031, 7006, 3572, 7007, 2614, 4854, 2577,
          7008, 7009, 2965, 3655, 3656, 4855, 2775, 3489, 3880, 4222, 4856,
          3881, 4032, 3882, 3657, 2730, 3490, 4857, 7010, 3149, 7011, 4469,
          4858, 2496, 3491, 4859, 2283, 7012, 7013, 7014, 2365, 4860, 4470,
          7015, 7016, 3760, 7017, 7018, 4223, 1917, 7019, 7020, 7021, 4471,
          7022, 2776, 4472, 7023, 7024, 7025, 7026, 4033, 7027, 3573, 4224,
          4861, 4034, 4862, 7028, 7029, 1929, 3883, 4035, 7030, 4473, 3058,
          7031, 2536, 3761, 3884, 7032, 4036, 7033, 2966, 2895, 1968, 4474,
          3276, 4225, 3417, 3492, 4226, 2105, 7034, 7035, 1754, 2596, 3762,
          4227, 4863, 4475, 3763, 4864, 3764, 2615, 2777, 3103, 3765, 3658,
          3418, 4865, 2296, 3766, 2815, 7036, 7037, 7038, 3574, 2872, 3277,
          4476, 7039, 4037, 4477, 7040, 7041, 4038, 7042, 7043, 7044, 7045,
          7046, 7047, 2537, 7048, 7049, 7050, 7051, 7052, 7053, 7054, 4478,
          7055, 7056, 3767, 3659, 4228, 3575, 7057, 7058, 4229, 7059, 7060,
          7061, 3660, 7062, 3212, 7063, 3885, 4039, 2460, 7064, 7065, 7066,
          7067, 7068, 7069, 7070, 7071, 7072, 7073, 7074, 4866, 3768, 4867,
          7075, 7076, 7077, 7078, 4868, 3358, 3278, 2653, 7079, 7080, 4479,
          3886, 7081, 7082, 4869, 7083, 7084, 7085, 7086, 7087, 7088, 2538,
          7089, 7090, 7091, 4040, 3150, 3769, 4870, 4041, 2896, 3359, 4230,
          2930, 7092, 3279, 7093, 2967, 4480, 3213, 4481, 3661, 7094, 7095,
          7096, 7097, 7098, 7099, 7100, 7101, 7102, 2461, 3770, 7103, 7104,
          4231, 3151, 7105, 7106, 7107, 4042, 3662, 7108, 7109, 4871, 3663,
          4872, 4043, 3059, 7110, 7111, 7112, 3493, 2988, 7113, 4873, 7114,
          7115, 7116, 3771, 4874, 7117, 7118, 4232, 4875, 7119, 3576, 2336,
          4876, 7120, 4233, 3419, 4044, 4877, 4878, 4482, 4483, 4879, 4484,
          4234, 7121, 3772, 4880, 1045, 3280, 3664, 4881, 4882, 7122, 7123,
          7124, 7125, 4883, 7126, 2778, 7127, 4485, 4486, 7128, 4884, 3214,
          3887, 7129, 7130, 3215, 7131, 4885, 4045, 7132, 7133, 4046, 7134,
          7135, 7136, 7137, 7138, 7139, 7140, 7141, 7142, 7143, 4235, 7144,
          4886, 7145, 7146, 7147, 4887, 7148, 7149, 7150, 4487, 4047, 4488,
          7151, 7152, 4888, 4048, 2989, 3888, 7153, 3665, 7154, 4049, 7155,
          7156, 7157, 7158, 7159, 7160, 2931, 4889, 4890, 4489, 7161, 2631,
          3889, 4236, 2779, 7162, 7163, 4891, 7164, 3060, 7165, 1672, 4892,
          7166, 4893, 4237, 3281, 4894, 7167, 7168, 3666, 7169, 3494, 7170,
          7171, 4050, 7172, 7173, 3104, 3360, 3420, 4490, 4051, 2684, 4052,
          7174, 4053, 7175, 7176, 7177, 2253, 4054, 7178, 7179, 4895, 7180,
          3152, 3890, 3153, 4491, 3216, 7181, 7182, 7183, 2968, 4238, 4492,
          4055, 7184, 2990, 7185, 2479, 7186, 7187, 4493, 7188, 7189, 7190,
          7191, 7192, 4896, 7193, 4897, 2969, 4494, 4898, 7194, 3495, 7195,
          7196, 4899, 4495, 7197, 3105, 2731, 7198, 4900, 7199, 7200, 7201,
          4056, 7202, 3361, 7203, 7204, 4496, 4901, 4902, 7205, 4497, 7206,
          7207, 2315, 4903, 7208, 4904, 7209, 4905, 2851, 7210, 7211, 3577,
          7212, 3578, 4906, 7213, 4057, 3667, 4907, 7214, 4058, 2354, 3891,
          2376, 3217, 3773, 7215, 7216, 7217, 7218, 7219, 4498, 7220, 4908,
          3282, 2685, 7221, 3496, 4909, 2632, 3154, 4910, 7222, 2337, 7223,
          4911, 7224, 7225, 7226, 4912, 4913, 3283, 4239, 4499, 7227, 2816,
          7228, 7229, 7230, 7231, 7232, 7233, 7234, 4914, 4500, 4501, 7235,
          7236, 7237, 2686, 7238, 4915, 7239, 2897, 4502, 7240, 4503, 7241,
          2516, 7242, 4504, 3362, 3218, 7243, 7244, 7245, 4916, 7246, 7247,
          4505, 3363, 7248, 7249, 7250, 7251, 3774, 4506, 7252, 7253, 4917,
          7254, 7255, 3284, 2991, 4918, 4919, 3219, 3892, 4920, 3106, 3497,
          4921, 7256, 7257, 7258, 4922, 7259, 4923, 3364, 4507, 4508, 4059,
          7260, 4240, 3498, 7261, 7262, 4924, 7263, 2992, 3893, 4060, 3220,
          7264, 7265, 7266, 7267, 7268, 7269, 4509, 3775, 7270, 2817, 7271,
          4061, 4925, 4510, 3776, 7272, 4241, 4511, 3285, 7273, 7274, 3499,
          7275, 7276, 7277, 4062, 4512, 4926, 7278, 3107, 3894, 7279, 7280,
          4927, 7281, 4513, 7282, 7283, 3668, 7284, 7285, 4242, 4514, 4243,
          7286, 2058, 4515, 4928, 4929, 4516, 7287, 3286, 4244, 7288, 4517,
          7289, 7290, 7291, 3669, 7292, 7293, 4930, 4931, 4932, 2355, 4933,
          7294, 2633, 4518, 7295, 4245, 7296, 7297, 4519, 7298, 7299, 4520,
          4521, 4934, 7300, 4246, 4522, 7301, 7302, 7303, 3579, 7304, 4247,
          4935, 7305, 4936, 7306, 7307, 7308, 7309, 3777, 7310, 4523, 7311,
          7312, 7313, 4248, 3580, 7314, 4524, 3778, 4249, 7315, 3581, 7316,
          3287, 7317, 3221, 7318, 4937, 7319, 7320, 7321, 7322, 7323, 7324,
          4938, 4939, 7325, 4525, 7326, 7327, 7328, 4063, 7329, 7330, 4940,
          7331, 7332, 4941, 7333, 4526, 7334, 3500, 2780, 1741, 4942, 2026,
          1742, 7335, 7336, 3582, 4527, 2388, 7337, 7338, 7339, 4528, 7340,
          4250, 4943, 7341, 7342, 7343, 4944, 7344, 7345, 7346, 3020, 7347,
          4945, 7348, 7349, 7350, 7351, 3895, 7352, 3896, 4064, 3897, 7353,
          7354, 7355, 4251, 7356, 7357, 3898, 7358, 3779, 7359, 3780, 3288,
          7360, 7361, 4529, 7362, 4946, 4530, 2027, 7363, 3899, 4531, 4947,
          3222, 3583, 7364, 4948, 7365, 7366, 7367, 7368, 4949, 3501, 4950,
          3781, 4951, 4532, 7369, 2517, 4952, 4252, 4953, 3155, 7370, 4954,
          4955, 4253, 2518, 4533, 7371, 7372, 2712, 4254, 7373, 7374, 7375,
          3670, 4956, 3671, 7376, 2389, 3502, 4065, 7377, 2338, 7378, 7379,
          7380, 7381, 3061, 7382, 4957, 7383, 7384, 7385, 7386, 4958, 4534,
          7387, 7388, 2993, 7389, 3062, 7390, 4959, 7391, 7392, 7393, 4960,
          3108, 4961, 7394, 4535, 7395, 4962, 3421, 4536, 7396, 4963, 7397,
          4964, 1857, 7398, 4965, 7399, 7400, 2176, 3584, 4966, 7401, 7402,
          3422, 4537, 3900, 3585, 7403, 3782, 7404, 2852, 7405, 7406, 7407,
          4538, 3783, 2654, 3423, 4967, 4539, 7408, 3784, 3586, 2853, 4540,
          4541, 7409, 3901, 7410, 3902, 7411, 7412, 3785, 3109, 2327, 3903,
          7413, 7414, 2970, 4066, 2932, 7415, 7416, 7417, 3904, 3672, 3424,
          7418, 4542, 4543, 4544, 7419, 4968, 7420, 7421, 4255, 7422, 7423,
          7424, 7425, 7426, 4067, 7427, 3673, 3365, 4545, 7428, 3110, 2559,
          3674, 7429, 7430, 3156, 7431, 7432, 3503, 7433, 3425, 4546, 7434,
          3063, 2873, 7435, 3223, 4969, 4547, 4548, 2898, 4256, 4068, 7436,
          4069, 3587, 3786, 2933, 3787, 4257, 4970, 4971, 3788, 7437, 4972,
          3064, 7438, 4549, 7439, 7440, 7441, 7442, 7443, 4973, 3905, 7444,
          2874, 7445, 7446, 7447, 7448, 3021, 7449, 4550, 3906, 3588, 4974,
          7450, 7451, 3789, 3675, 7452, 2578, 7453, 4070, 7454, 7455, 7456,
          4258, 3676, 7457, 4975, 7458, 4976, 4259, 3790, 3504, 2634, 4977,
          3677, 4551, 4260, 7459, 7460, 7461, 7462, 3907, 4261, 4978, 7463,
          7464, 7465, 7466, 4979, 4980, 7467, 7468, 2213, 4262, 7469, 7470,
          7471, 3678, 4981, 7472, 2439, 7473, 4263, 3224, 3289, 7474, 3908,
          2415, 4982, 7475, 4264, 7476, 4983, 2655, 7477, 7478, 2732, 4552,
          2854, 2875, 7479, 7480, 4265, 7481, 4553, 4984, 7482, 7483, 4266,
          7484, 3679, 3366, 3680, 2818, 2781, 2782, 3367, 3589, 4554, 3065,
          7485, 4071, 2899, 7486, 7487, 3157, 2462, 4072, 4555, 4073, 4985,
          4986, 3111, 4267, 2687, 3368, 4556, 4074, 3791, 4268, 7488, 3909,
          2783, 7489, 2656, 1962, 3158, 4557, 4987, 1963, 3159, 3160, 7490,
          3112, 4988, 4989, 3022, 4990, 4991, 3792, 2855, 7491, 7492, 2971,
          4558, 7493, 7494, 4992, 7495, 7496, 7497, 7498, 4993, 7499, 3426,
          4559, 4994, 7500, 3681, 4560, 4269, 4270, 3910, 7501, 4075, 4995,
          4271, 7502, 7503, 4076, 7504, 4996, 7505, 3225, 4997, 4272, 4077,
          2819, 3023, 7506, 7507, 2733, 4561, 7508, 4562, 7509, 3369, 3793,
          7510, 3590, 2508, 7511, 7512, 4273, 3113, 2994, 2616, 7513, 7514,
          7515, 7516, 7517, 7518, 2820, 3911, 4078, 2748, 7519, 7520, 4563,
          4998, 7521, 7522, 7523, 7524, 4999, 4274, 7525, 4564, 3682, 2239,
          4079, 4565, 7526, 7527, 7528, 7529, 5e3, 7530, 7531, 5001, 4275, 3794,
          7532, 7533, 7534, 3066, 5002, 4566, 3161, 7535, 7536, 4080, 7537,
          3162, 7538, 7539, 4567, 7540, 7541, 7542, 7543, 7544, 7545, 5003,
          7546, 4568, 7547, 7548, 7549, 7550, 7551, 7552, 7553, 7554, 7555,
          7556, 5004, 7557, 7558, 7559, 5005, 7560, 3795, 7561, 4569, 7562,
          7563, 7564, 2821, 3796, 4276, 4277, 4081, 7565, 2876, 7566, 5006,
          7567, 7568, 2900, 7569, 3797, 3912, 7570, 7571, 7572, 4278, 7573,
          7574, 7575, 5007, 7576, 7577, 5008, 7578, 7579, 4279, 2934, 7580,
          7581, 5009, 7582, 4570, 7583, 4280, 7584, 7585, 7586, 4571, 4572,
          3913, 7587, 4573, 3505, 7588, 5010, 7589, 7590, 7591, 7592, 3798,
          4574, 7593, 7594, 5011, 7595, 4281, 7596, 7597, 7598, 4282, 5012,
          7599, 7600, 5013, 3163, 7601, 5014, 7602, 3914, 7603, 7604, 2734,
          4575, 4576, 4577, 7605, 7606, 7607, 7608, 7609, 3506, 5015, 4578,
          7610, 4082, 7611, 2822, 2901, 2579, 3683, 3024, 4579, 3507, 7612,
          4580, 7613, 3226, 3799, 5016, 7614, 7615, 7616, 7617, 7618, 7619,
          7620, 2995, 3290, 7621, 4083, 7622, 5017, 7623, 7624, 7625, 7626,
          7627, 4581, 3915, 7628, 3291, 7629, 5018, 7630, 7631, 7632, 7633,
          4084, 7634, 7635, 3427, 3800, 7636, 7637, 4582, 7638, 5019, 4583,
          5020, 7639, 3916, 7640, 3801, 5021, 4584, 4283, 7641, 7642, 3428,
          3591, 2269, 7643, 2617, 7644, 4585, 3592, 7645, 4586, 2902, 7646,
          7647, 3227, 5022, 7648, 4587, 7649, 4284, 7650, 7651, 7652, 4588,
          2284, 7653, 5023, 7654, 7655, 7656, 4589, 5024, 3802, 7657, 7658,
          5025, 3508, 4590, 7659, 7660, 7661, 1969, 5026, 7662, 7663, 3684,
          1821, 2688, 7664, 2028, 2509, 4285, 7665, 2823, 1841, 7666, 2689,
          3114, 7667, 3917, 4085, 2160, 5027, 5028, 2972, 7668, 5029, 7669,
          7670, 7671, 3593, 4086, 7672, 4591, 4087, 5030, 3803, 7673, 7674,
          7675, 7676, 7677, 7678, 7679, 4286, 2366, 4592, 4593, 3067, 2328,
          7680, 7681, 4594, 3594, 3918, 2029, 4287, 7682, 5031, 3919, 3370,
          4288, 4595, 2856, 7683, 3509, 7684, 7685, 5032, 5033, 7686, 7687,
          3804, 2784, 7688, 7689, 7690, 7691, 3371, 7692, 7693, 2877, 5034,
          7694, 7695, 3920, 4289, 4088, 7696, 7697, 7698, 5035, 7699, 5036,
          4290, 5037, 5038, 5039, 7700, 7701, 7702, 5040, 5041, 3228, 7703,
          1760, 7704, 5042, 3229, 4596, 2106, 4089, 7705, 4597, 2824, 5043,
          2107, 3372, 7706, 4291, 4090, 5044, 7707, 4091, 7708, 5045, 3025,
          3805, 4598, 4292, 4293, 4294, 3373, 7709, 4599, 7710, 5046, 7711,
          7712, 5047, 5048, 3806, 7713, 7714, 7715, 5049, 7716, 7717, 7718,
          7719, 4600, 5050, 7720, 7721, 7722, 5051, 7723, 4295, 3429, 7724,
          7725, 7726, 7727, 3921, 7728, 3292, 5052, 4092, 7729, 7730, 7731,
          7732, 7733, 7734, 7735, 5053, 5054, 7736, 7737, 7738, 7739, 3922,
          3685, 7740, 7741, 7742, 7743, 2635, 5055, 7744, 5056, 4601, 7745,
          7746, 2560, 7747, 7748, 7749, 7750, 3923, 7751, 7752, 7753, 7754,
          7755, 4296, 2903, 7756, 7757, 7758, 7759, 7760, 3924, 7761, 5057,
          4297, 7762, 7763, 5058, 4298, 7764, 4093, 7765, 7766, 5059, 3925,
          7767, 7768, 7769, 7770, 7771, 7772, 7773, 7774, 7775, 7776, 3595,
          7777, 4299, 5060, 4094, 7778, 3293, 5061, 7779, 7780, 4300, 7781,
          7782, 4602, 7783, 3596, 7784, 7785, 3430, 2367, 7786, 3164, 5062,
          5063, 4301, 7787, 7788, 4095, 5064, 5065, 7789, 3374, 3115, 7790,
          7791, 7792, 7793, 7794, 7795, 7796, 3597, 4603, 7797, 7798, 3686,
          3116, 3807, 5066, 7799, 7800, 5067, 7801, 7802, 4604, 4302, 5068,
          4303, 4096, 7803, 7804, 3294, 7805, 7806, 5069, 4605, 2690, 7807,
          3026, 7808, 7809, 7810, 7811, 7812, 7813, 7814, 7815, 7816, 7817,
          7818, 7819, 7820, 7821, 7822, 7823, 7824, 7825, 7826, 7827, 7828,
          7829, 7830, 7831, 7832, 7833, 7834, 7835, 7836, 7837, 7838, 7839,
          7840, 7841, 7842, 7843, 7844, 7845, 7846, 7847, 7848, 7849, 7850,
          7851, 7852, 7853, 7854, 7855, 7856, 7857, 7858, 7859, 7860, 7861,
          7862, 7863, 7864, 7865, 7866, 7867, 7868, 7869, 7870, 7871, 7872,
          7873, 7874, 7875, 7876, 7877, 7878, 7879, 7880, 7881, 7882, 7883,
          7884, 7885, 7886, 7887, 7888, 7889, 7890, 7891, 7892, 7893, 7894,
          7895, 7896, 7897, 7898, 7899, 7900, 7901, 7902, 7903, 7904, 7905,
          7906, 7907, 7908, 7909, 7910, 7911, 7912, 7913, 7914, 7915, 7916,
          7917, 7918, 7919, 7920, 7921, 7922, 7923, 7924, 3926, 7925, 7926,
          7927, 7928, 7929, 7930, 7931, 7932, 7933, 7934, 7935, 7936, 7937,
          7938, 7939, 7940, 7941, 7942, 7943, 7944, 7945, 7946, 7947, 7948,
          7949, 7950, 7951, 7952, 7953, 7954, 7955, 7956, 7957, 7958, 7959,
          7960, 7961, 7962, 7963, 7964, 7965, 7966, 7967, 7968, 7969, 7970,
          7971, 7972, 7973, 7974, 7975, 7976, 7977, 7978, 7979, 7980, 7981,
          7982, 7983, 7984, 7985, 7986, 7987, 7988, 7989, 7990, 7991, 7992,
          7993, 7994, 7995, 7996, 7997, 7998, 7999, 8e3, 8001, 8002, 8003, 8004,
          8005, 8006, 8007, 8008, 8009, 8010, 8011, 8012, 8013, 8014, 8015,
          8016, 8017, 8018, 8019, 8020, 8021, 8022, 8023, 8024, 8025, 8026,
          8027, 8028, 8029, 8030, 8031, 8032, 8033, 8034, 8035, 8036, 8037,
          8038, 8039, 8040, 8041, 8042, 8043, 8044, 8045, 8046, 8047, 8048,
          8049, 8050, 8051, 8052, 8053, 8054, 8055, 8056, 8057, 8058, 8059,
          8060, 8061, 8062, 8063, 8064, 8065, 8066, 8067, 8068, 8069, 8070,
          8071, 8072, 8073, 8074, 8075, 8076, 8077, 8078, 8079, 8080, 8081,
          8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8091, 8092,
          8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8101, 8102, 8103,
          8104, 8105, 8106, 8107, 8108, 8109, 8110, 8111, 8112, 8113, 8114,
          8115, 8116, 8117, 8118, 8119, 8120, 8121, 8122, 8123, 8124, 8125,
          8126, 8127, 8128, 8129, 8130, 8131, 8132, 8133, 8134, 8135, 8136,
          8137, 8138, 8139, 8140, 8141, 8142, 8143, 8144, 8145, 8146, 8147,
          8148, 8149, 8150, 8151, 8152, 8153, 8154, 8155, 8156, 8157, 8158,
          8159, 8160, 8161, 8162, 8163, 8164, 8165, 8166, 8167, 8168, 8169,
          8170, 8171, 8172, 8173, 8174, 8175, 8176, 8177, 8178, 8179, 8180,
          8181, 8182, 8183, 8184, 8185, 8186, 8187, 8188, 8189, 8190, 8191,
          8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202,
          8203, 8204, 8205, 8206, 8207, 8208, 8209, 8210, 8211, 8212, 8213,
          8214, 8215, 8216, 8217, 8218, 8219, 8220, 8221, 8222, 8223, 8224,
          8225, 8226, 8227, 8228, 8229, 8230, 8231, 8232, 8233, 8234, 8235,
          8236, 8237, 8238, 8239, 8240, 8241, 8242, 8243, 8244, 8245, 8246,
          8247, 8248, 8249, 8250, 8251, 8252, 8253, 8254, 8255, 8256, 8257,
          8258, 8259, 8260, 8261, 8262, 8263, 8264, 8265, 8266, 8267, 8268,
          8269, 8270, 8271,
        ]));
    },
    43351(eA, el) {
      ((el.EUCTW_TYPICAL_DISTRIBUTION_RATIO = 0.75),
        (el.EUCTW_TABLE_SIZE = 8102),
        (el.EUCTWCharToFreqOrder = [
          1, 1800, 1506, 255, 1431, 198, 9, 82, 6, 7310, 177, 202, 3615, 1256,
          2808, 110, 3735, 33, 3241, 261, 76, 44, 2113, 16, 2931, 2184, 1176,
          659, 3868, 26, 3404, 2643, 1198, 3869, 3313, 4060, 410, 2211, 302,
          590, 361, 1963, 8, 204, 58, 4296, 7311, 1931, 63, 7312, 7313, 317,
          1614, 75, 222, 159, 4061, 2412, 1480, 7314, 3500, 3068, 224, 2809,
          3616, 3, 10, 3870, 1471, 29, 2774, 1135, 2852, 1939, 873, 130, 3242,
          1123, 312, 7315, 4297, 2051, 507, 252, 682, 7316, 142, 1914, 124, 206,
          2932, 34, 3501, 3173, 64, 604, 7317, 2494, 1976, 1977, 155, 1990, 645,
          641, 1606, 7318, 3405, 337, 72, 406, 7319, 80, 630, 238, 3174, 1509,
          263, 939, 1092, 2644, 756, 1440, 1094, 3406, 449, 69, 2969, 591, 179,
          2095, 471, 115, 2034, 1843, 60, 50, 2970, 134, 806, 1868, 734, 2035,
          3407, 180, 995, 1607, 156, 537, 2893, 688, 7320, 319, 1305, 779, 2144,
          514, 2374, 298, 4298, 359, 2495, 90, 2707, 1338, 663, 11, 906, 1099,
          2545, 20, 2436, 182, 532, 1716, 7321, 732, 1376, 4062, 1311, 1420,
          3175, 25, 2312, 1056, 113, 399, 382, 1949, 242, 3408, 2467, 529, 3243,
          475, 1447, 3617, 7322, 117, 21, 656, 810, 1297, 2295, 2329, 3502,
          7323, 126, 4063, 706, 456, 150, 613, 4299, 71, 1118, 2036, 4064, 145,
          3069, 85, 835, 486, 2114, 1246, 1426, 428, 727, 1285, 1015, 800, 106,
          623, 303, 1281, 7324, 2127, 2354, 347, 3736, 221, 3503, 3110, 7325,
          1955, 1153, 4065, 83, 296, 1199, 3070, 192, 624, 93, 7326, 822, 1897,
          2810, 3111, 795, 2064, 991, 1554, 1542, 1592, 27, 43, 2853, 859, 139,
          1456, 860, 4300, 437, 712, 3871, 164, 2392, 3112, 695, 211, 3017,
          2096, 195, 3872, 1608, 3504, 3505, 3618, 3873, 234, 811, 2971, 2097,
          3874, 2229, 1441, 3506, 1615, 2375, 668, 2076, 1638, 305, 228, 1664,
          4301, 467, 415, 7327, 262, 2098, 1593, 239, 108, 300, 200, 1033, 512,
          1247, 2077, 7328, 7329, 2173, 3176, 3619, 2673, 593, 845, 1062, 3244,
          88, 1723, 2037, 3875, 1950, 212, 266, 152, 149, 468, 1898, 4066, 4302,
          77, 187, 7330, 3018, 37, 5, 2972, 7331, 3876, 7332, 7333, 39, 2517,
          4303, 2894, 3177, 2078, 55, 148, 74, 4304, 545, 483, 1474, 1029, 1665,
          217, 1869, 1531, 3113, 1104, 2645, 4067, 24, 172, 3507, 900, 3877,
          3508, 3509, 4305, 32, 1408, 2811, 1312, 329, 487, 2355, 2247, 2708,
          784, 2674, 4, 3019, 3314, 1427, 1788, 188, 109, 499, 7334, 3620, 1717,
          1789, 888, 1217, 3020, 4306, 7335, 3510, 7336, 3315, 1520, 3621, 3878,
          196, 1034, 775, 7337, 7338, 929, 1815, 249, 439, 38, 7339, 1063, 7340,
          794, 3879, 1435, 2296, 46, 178, 3245, 2065, 7341, 2376, 7342, 214,
          1709, 4307, 804, 35, 707, 324, 3622, 1601, 2546, 140, 459, 4068, 7343,
          7344, 1365, 839, 272, 978, 2257, 2572, 3409, 2128, 1363, 3623, 1423,
          697, 100, 3071, 48, 70, 1231, 495, 3114, 2193, 7345, 1294, 7346, 2079,
          462, 586, 1042, 3246, 853, 256, 988, 185, 2377, 3410, 1698, 434, 1084,
          7347, 3411, 314, 2615, 2775, 4308, 2330, 2331, 569, 2280, 637, 1816,
          2518, 757, 1162, 1878, 1616, 3412, 287, 1577, 2115, 768, 4309, 1671,
          2854, 3511, 2519, 1321, 3737, 909, 2413, 7348, 4069, 933, 3738, 7349,
          2052, 2356, 1222, 4310, 765, 2414, 1322, 786, 4311, 7350, 1919, 1462,
          1677, 2895, 1699, 7351, 4312, 1424, 2437, 3115, 3624, 2590, 3316,
          1774, 1940, 3413, 3880, 4070, 309, 1369, 1130, 2812, 364, 2230, 1653,
          1299, 3881, 3512, 3882, 3883, 2646, 525, 1085, 3021, 902, 2e3, 1475,
          964, 4313, 421, 1844, 1415, 1057, 2281, 940, 1364, 3116, 376, 4314,
          4315, 1381, 7, 2520, 983, 2378, 336, 1710, 2675, 1845, 321, 3414, 559,
          1131, 3022, 2742, 1808, 1132, 1313, 265, 1481, 1857, 7352, 352, 1203,
          2813, 3247, 167, 1089, 420, 2814, 776, 792, 1724, 3513, 4071, 2438,
          3248, 7353, 4072, 7354, 446, 229, 333, 2743, 901, 3739, 1200, 1557,
          4316, 2647, 1920, 395, 2744, 2676, 3740, 4073, 1835, 125, 916, 3178,
          2616, 4317, 7355, 7356, 3741, 7357, 7358, 7359, 4318, 3117, 3625,
          1133, 2547, 1757, 3415, 1510, 2313, 1409, 3514, 7360, 2145, 438, 2591,
          2896, 2379, 3317, 1068, 958, 3023, 461, 311, 2855, 2677, 4074, 1915,
          3179, 4075, 1978, 383, 750, 2745, 2617, 4076, 274, 539, 385, 1278,
          1442, 7361, 1154, 1964, 384, 561, 210, 98, 1295, 2548, 3515, 7362,
          1711, 2415, 1482, 3416, 3884, 2897, 1257, 129, 7363, 3742, 642, 523,
          2776, 2777, 2648, 7364, 141, 2231, 1333, 68, 176, 441, 876, 907, 4077,
          603, 2592, 710, 171, 3417, 404, 549, 18, 3118, 2393, 1410, 3626, 1666,
          7365, 3516, 4319, 2898, 4320, 7366, 2973, 368, 7367, 146, 366, 99,
          871, 3627, 1543, 748, 807, 1586, 1185, 22, 2258, 379, 3743, 3180,
          7368, 3181, 505, 1941, 2618, 1991, 1382, 2314, 7369, 380, 2357, 218,
          702, 1817, 1248, 3418, 3024, 3517, 3318, 3249, 7370, 2974, 3628, 930,
          3250, 3744, 7371, 59, 7372, 585, 601, 4078, 497, 3419, 1112, 1314,
          4321, 1801, 7373, 1223, 1472, 2174, 7374, 749, 1836, 690, 1899, 3745,
          1772, 3885, 1476, 429, 1043, 1790, 2232, 2116, 917, 4079, 447, 1086,
          1629, 7375, 556, 7376, 7377, 2020, 1654, 844, 1090, 105, 550, 966,
          1758, 2815, 1008, 1782, 686, 1095, 7378, 2282, 793, 1602, 7379, 3518,
          2593, 4322, 4080, 2933, 2297, 4323, 3746, 980, 2496, 544, 353, 527,
          4324, 908, 2678, 2899, 7380, 381, 2619, 1942, 1348, 7381, 1341, 1252,
          560, 3072, 7382, 3420, 2856, 7383, 2053, 973, 886, 2080, 143, 4325,
          7384, 7385, 157, 3886, 496, 4081, 57, 840, 540, 2038, 4326, 4327,
          3421, 2117, 1445, 970, 2259, 1748, 1965, 2081, 4082, 3119, 1234, 1775,
          3251, 2816, 3629, 773, 1206, 2129, 1066, 2039, 1326, 3887, 1738, 1725,
          4083, 279, 3120, 51, 1544, 2594, 423, 1578, 2130, 2066, 173, 4328,
          1879, 7386, 7387, 1583, 264, 610, 3630, 4329, 2439, 280, 154, 7388,
          7389, 7390, 1739, 338, 1282, 3073, 693, 2857, 1411, 1074, 3747, 2440,
          7391, 4330, 7392, 7393, 1240, 952, 2394, 7394, 2900, 1538, 2679, 685,
          1483, 4084, 2468, 1436, 953, 4085, 2054, 4331, 671, 2395, 79, 4086,
          2441, 3252, 608, 567, 2680, 3422, 4087, 4088, 1691, 393, 1261, 1791,
          2396, 7395, 4332, 7396, 7397, 7398, 7399, 1383, 1672, 3748, 3182,
          1464, 522, 1119, 661, 1150, 216, 675, 4333, 3888, 1432, 3519, 609,
          4334, 2681, 2397, 7400, 7401, 7402, 4089, 3025, 0, 7403, 2469, 315,
          231, 2442, 301, 3319, 4335, 2380, 7404, 233, 4090, 3631, 1818, 4336,
          4337, 7405, 96, 1776, 1315, 2082, 7406, 257, 7407, 1809, 3632, 2709,
          1139, 1819, 4091, 2021, 1124, 2163, 2778, 1777, 2649, 7408, 3074, 363,
          1655, 3183, 7409, 2975, 7410, 7411, 7412, 3889, 1567, 3890, 718, 103,
          3184, 849, 1443, 341, 3320, 2934, 1484, 7413, 1712, 127, 67, 339,
          4092, 2398, 679, 1412, 821, 7414, 7415, 834, 738, 351, 2976, 2146,
          846, 235, 1497, 1880, 418, 1992, 3749, 2710, 186, 1100, 2147, 2746,
          3520, 1545, 1355, 2935, 2858, 1377, 583, 3891, 4093, 2573, 2977, 7416,
          1298, 3633, 1078, 2549, 3634, 2358, 78, 3750, 3751, 267, 1289, 2099,
          2001, 1594, 4094, 348, 369, 1274, 2194, 2175, 1837, 4338, 1820, 2817,
          3635, 2747, 2283, 2002, 4339, 2936, 2748, 144, 3321, 882, 4340, 3892,
          2749, 3423, 4341, 2901, 7417, 4095, 1726, 320, 7418, 3893, 3026, 788,
          2978, 7419, 2818, 1773, 1327, 2859, 3894, 2819, 7420, 1306, 4342,
          2003, 1700, 3752, 3521, 2359, 2650, 787, 2022, 506, 824, 3636, 534,
          323, 4343, 1044, 3322, 2023, 1900, 946, 3424, 7421, 1778, 1500, 1678,
          7422, 1881, 4344, 165, 243, 4345, 3637, 2521, 123, 683, 4096, 764,
          4346, 36, 3895, 1792, 589, 2902, 816, 626, 1667, 3027, 2233, 1639,
          1555, 1622, 3753, 3896, 7423, 3897, 2860, 1370, 1228, 1932, 891, 2083,
          2903, 304, 4097, 7424, 292, 2979, 2711, 3522, 691, 2100, 4098, 1115,
          4347, 118, 662, 7425, 611, 1156, 854, 2381, 1316, 2861, 2, 386, 515,
          2904, 7426, 7427, 3253, 868, 2234, 1486, 855, 2651, 785, 2212, 3028,
          7428, 1040, 3185, 3523, 7429, 3121, 448, 7430, 1525, 7431, 2164, 4348,
          7432, 3754, 7433, 4099, 2820, 3524, 3122, 503, 818, 3898, 3123, 1568,
          814, 676, 1444, 306, 1749, 7434, 3755, 1416, 1030, 197, 1428, 805,
          2821, 1501, 4349, 7435, 7436, 7437, 1993, 7438, 4350, 7439, 7440,
          2195, 13, 2779, 3638, 2980, 3124, 1229, 1916, 7441, 3756, 2131, 7442,
          4100, 4351, 2399, 3525, 7443, 2213, 1511, 1727, 1120, 7444, 7445, 646,
          3757, 2443, 307, 7446, 7447, 1595, 3186, 7448, 7449, 7450, 3639, 1113,
          1356, 3899, 1465, 2522, 2523, 7451, 519, 7452, 128, 2132, 92, 2284,
          1979, 7453, 3900, 1512, 342, 3125, 2196, 7454, 2780, 2214, 1980, 3323,
          7455, 290, 1656, 1317, 789, 827, 2360, 7456, 3758, 4352, 562, 581,
          3901, 7457, 401, 4353, 2248, 94, 4354, 1399, 2781, 7458, 1463, 2024,
          4355, 3187, 1943, 7459, 828, 1105, 4101, 1262, 1394, 7460, 4102, 605,
          4356, 7461, 1783, 2862, 7462, 2822, 819, 2101, 578, 2197, 2937, 7463,
          1502, 436, 3254, 4103, 3255, 2823, 3902, 2905, 3425, 3426, 7464, 2712,
          2315, 7465, 7466, 2332, 2067, 23, 4357, 193, 826, 3759, 2102, 699,
          1630, 4104, 3075, 390, 1793, 1064, 3526, 7467, 1579, 3076, 3077, 1400,
          7468, 4105, 1838, 1640, 2863, 7469, 4358, 4359, 137, 4106, 598, 3078,
          1966, 780, 104, 974, 2938, 7470, 278, 899, 253, 402, 572, 504, 493,
          1339, 7471, 3903, 1275, 4360, 2574, 2550, 7472, 3640, 3029, 3079,
          2249, 565, 1334, 2713, 863, 41, 7473, 7474, 4361, 7475, 1657, 2333,
          19, 463, 2750, 4107, 606, 7476, 2981, 3256, 1087, 2084, 1323, 2652,
          2982, 7477, 1631, 1623, 1750, 4108, 2682, 7478, 2864, 791, 2714, 2653,
          2334, 232, 2416, 7479, 2983, 1498, 7480, 2654, 2620, 755, 1366, 3641,
          3257, 3126, 2025, 1609, 119, 1917, 3427, 862, 1026, 4109, 7481, 3904,
          3760, 4362, 3905, 4363, 2260, 1951, 2470, 7482, 1125, 817, 4110, 4111,
          3906, 1513, 1766, 2040, 1487, 4112, 3030, 3258, 2824, 3761, 3127,
          7483, 7484, 1507, 7485, 2683, 733, 40, 1632, 1106, 2865, 345, 4113,
          841, 2524, 230, 4364, 2984, 1846, 3259, 3428, 7486, 1263, 986, 3429,
          7487, 735, 879, 254, 1137, 857, 622, 1300, 1180, 1388, 1562, 3907,
          3908, 2939, 967, 2751, 2655, 1349, 592, 2133, 1692, 3324, 2985, 1994,
          4114, 1679, 3909, 1901, 2185, 7488, 739, 3642, 2715, 1296, 1290, 7489,
          4115, 2198, 2199, 1921, 1563, 2595, 2551, 1870, 2752, 2986, 7490, 435,
          7491, 343, 1108, 596, 17, 1751, 4365, 2235, 3430, 3643, 7492, 4366,
          294, 3527, 2940, 1693, 477, 979, 281, 2041, 3528, 643, 2042, 3644,
          2621, 2782, 2261, 1031, 2335, 2134, 2298, 3529, 4367, 367, 1249, 2552,
          7493, 3530, 7494, 4368, 1283, 3325, 2004, 240, 1762, 3326, 4369, 4370,
          836, 1069, 3128, 474, 7495, 2148, 2525, 268, 3531, 7496, 3188, 1521,
          1284, 7497, 1658, 1546, 4116, 7498, 3532, 3533, 7499, 4117, 3327,
          2684, 1685, 4118, 961, 1673, 2622, 190, 2005, 2200, 3762, 4371, 4372,
          7500, 570, 2497, 3645, 1490, 7501, 4373, 2623, 3260, 1956, 4374, 584,
          1514, 396, 1045, 1944, 7502, 4375, 1967, 2444, 7503, 7504, 4376, 3910,
          619, 7505, 3129, 3261, 215, 2006, 2783, 2553, 3189, 4377, 3190, 4378,
          763, 4119, 3763, 4379, 7506, 7507, 1957, 1767, 2941, 3328, 3646, 1174,
          452, 1477, 4380, 3329, 3130, 7508, 2825, 1253, 2382, 2186, 1091, 2285,
          4120, 492, 7509, 638, 1169, 1824, 2135, 1752, 3911, 648, 926, 1021,
          1324, 4381, 520, 4382, 997, 847, 1007, 892, 4383, 3764, 2262, 1871,
          3647, 7510, 2400, 1784, 4384, 1952, 2942, 3080, 3191, 1728, 4121,
          2043, 3648, 4385, 2007, 1701, 3131, 1551, 30, 2263, 4122, 7511, 2026,
          4386, 3534, 7512, 501, 7513, 4123, 594, 3431, 2165, 1821, 3535, 3432,
          3536, 3192, 829, 2826, 4124, 7514, 1680, 3132, 1225, 4125, 7515, 3262,
          4387, 4126, 3133, 2336, 7516, 4388, 4127, 7517, 3912, 3913, 7518,
          1847, 2383, 2596, 3330, 7519, 4389, 374, 3914, 652, 4128, 4129, 375,
          1140, 798, 7520, 7521, 7522, 2361, 4390, 2264, 546, 1659, 138, 3031,
          2445, 4391, 7523, 2250, 612, 1848, 910, 796, 3765, 1740, 1371, 825,
          3766, 3767, 7524, 2906, 2554, 7525, 692, 444, 3032, 2624, 801, 4392,
          4130, 7526, 1491, 244, 1053, 3033, 4131, 4132, 340, 7527, 3915, 1041,
          2987, 293, 1168, 87, 1357, 7528, 1539, 959, 7529, 2236, 721, 694,
          4133, 3768, 219, 1478, 644, 1417, 3331, 2656, 1413, 1401, 1335, 1389,
          3916, 7530, 7531, 2988, 2362, 3134, 1825, 730, 1515, 184, 2827, 66,
          4393, 7532, 1660, 2943, 246, 3332, 378, 1457, 226, 3433, 975, 3917,
          2944, 1264, 3537, 674, 696, 7533, 163, 7534, 1141, 2417, 2166, 713,
          3538, 3333, 4394, 3918, 7535, 7536, 1186, 15, 7537, 1079, 1070, 7538,
          1522, 3193, 3539, 276, 1050, 2716, 758, 1126, 653, 2945, 3263, 7539,
          2337, 889, 3540, 3919, 3081, 2989, 903, 1250, 4395, 3920, 3434, 3541,
          1342, 1681, 1718, 766, 3264, 286, 89, 2946, 3649, 7540, 1713, 7541,
          2597, 3334, 2990, 7542, 2947, 2215, 3194, 2866, 7543, 4396, 2498,
          2526, 181, 387, 1075, 3921, 731, 2187, 3335, 7544, 3265, 310, 313,
          3435, 2299, 770, 4134, 54, 3034, 189, 4397, 3082, 3769, 3922, 7545,
          1230, 1617, 1849, 355, 3542, 4135, 4398, 3336, 111, 4136, 3650, 1350,
          3135, 3436, 3035, 4137, 2149, 3266, 3543, 7546, 2784, 3923, 3924,
          2991, 722, 2008, 7547, 1071, 247, 1207, 2338, 2471, 1378, 4399, 2009,
          864, 1437, 1214, 4400, 373, 3770, 1142, 2216, 667, 4401, 442, 2753,
          2555, 3771, 3925, 1968, 4138, 3267, 1839, 837, 170, 1107, 934, 1336,
          1882, 7548, 7549, 2118, 4139, 2828, 743, 1569, 7550, 4402, 4140, 582,
          2384, 1418, 3437, 7551, 1802, 7552, 357, 1395, 1729, 3651, 3268, 2418,
          1564, 2237, 7553, 3083, 3772, 1633, 4403, 1114, 2085, 4141, 1532,
          7554, 482, 2446, 4404, 7555, 7556, 1492, 833, 1466, 7557, 2717, 3544,
          1641, 2829, 7558, 1526, 1272, 3652, 4142, 1686, 1794, 416, 2556, 1902,
          1953, 1803, 7559, 3773, 2785, 3774, 1159, 2316, 7560, 2867, 4405,
          1610, 1584, 3036, 2419, 2754, 443, 3269, 1163, 3136, 7561, 7562, 3926,
          7563, 4143, 2499, 3037, 4406, 3927, 3137, 2103, 1647, 3545, 2010,
          1872, 4144, 7564, 4145, 431, 3438, 7565, 250, 97, 81, 4146, 7566,
          1648, 1850, 1558, 160, 848, 7567, 866, 740, 1694, 7568, 2201, 2830,
          3195, 4147, 4407, 3653, 1687, 950, 2472, 426, 469, 3196, 3654, 3655,
          3928, 7569, 7570, 1188, 424, 1995, 861, 3546, 4148, 3775, 2202, 2685,
          168, 1235, 3547, 4149, 7571, 2086, 1674, 4408, 3337, 3270, 220, 2557,
          1009, 7572, 3776, 670, 2992, 332, 1208, 717, 7573, 7574, 3548, 2447,
          3929, 3338, 7575, 513, 7576, 1209, 2868, 3339, 3138, 4409, 1080, 7577,
          7578, 7579, 7580, 2527, 3656, 3549, 815, 1587, 3930, 3931, 7581, 3550,
          3439, 3777, 1254, 4410, 1328, 3038, 1390, 3932, 1741, 3933, 3778,
          3934, 7582, 236, 3779, 2448, 3271, 7583, 7584, 3657, 3780, 1273, 3781,
          4411, 7585, 308, 7586, 4412, 245, 4413, 1851, 2473, 1307, 2575, 430,
          715, 2136, 2449, 7587, 270, 199, 2869, 3935, 7588, 3551, 2718, 1753,
          761, 1754, 725, 1661, 1840, 4414, 3440, 3658, 7589, 7590, 587, 14,
          3272, 227, 2598, 326, 480, 2265, 943, 2755, 3552, 291, 650, 1883,
          7591, 1702, 1226, 102, 1547, 62, 3441, 904, 4415, 3442, 1164, 4150,
          7592, 7593, 1224, 1548, 2756, 391, 498, 1493, 7594, 1386, 1419, 7595,
          2055, 1177, 4416, 813, 880, 1081, 2363, 566, 1145, 4417, 2286, 1001,
          1035, 2558, 2599, 2238, 394, 1286, 7596, 7597, 2068, 7598, 86, 1494,
          1730, 3936, 491, 1588, 745, 897, 2948, 843, 3340, 3937, 2757, 2870,
          3273, 1768, 998, 2217, 2069, 397, 1826, 1195, 1969, 3659, 2993, 3341,
          284, 7599, 3782, 2500, 2137, 2119, 1903, 7600, 3938, 2150, 3939, 4151,
          1036, 3443, 1904, 114, 2559, 4152, 209, 1527, 7601, 7602, 2949, 2831,
          2625, 2385, 2719, 3139, 812, 2560, 7603, 3274, 7604, 1559, 737, 1884,
          3660, 1210, 885, 28, 2686, 3553, 3783, 7605, 4153, 1004, 1779, 4418,
          7606, 346, 1981, 2218, 2687, 4419, 3784, 1742, 797, 1642, 3940, 1933,
          1072, 1384, 2151, 896, 3941, 3275, 3661, 3197, 2871, 3554, 7607, 2561,
          1958, 4420, 2450, 1785, 7608, 7609, 7610, 3942, 4154, 1005, 1308,
          3662, 4155, 2720, 4421, 4422, 1528, 2600, 161, 1178, 4156, 1982, 987,
          4423, 1101, 4157, 631, 3943, 1157, 3198, 2420, 1343, 1241, 1016, 2239,
          2562, 372, 877, 2339, 2501, 1160, 555, 1934, 911, 3944, 7611, 466,
          1170, 169, 1051, 2907, 2688, 3663, 2474, 2994, 1182, 2011, 2563, 1251,
          2626, 7612, 992, 2340, 3444, 1540, 2721, 1201, 2070, 2401, 1996, 2475,
          7613, 4424, 528, 1922, 2188, 1503, 1873, 1570, 2364, 3342, 3276, 7614,
          557, 1073, 7615, 1827, 3445, 2087, 2266, 3140, 3039, 3084, 767, 3085,
          2786, 4425, 1006, 4158, 4426, 2341, 1267, 2176, 3664, 3199, 778, 3945,
          3200, 2722, 1597, 2657, 7616, 4427, 7617, 3446, 7618, 7619, 7620,
          3277, 2689, 1433, 3278, 131, 95, 1504, 3946, 723, 4159, 3141, 1841,
          3555, 2758, 2189, 3947, 2027, 2104, 3665, 7621, 2995, 3948, 1218,
          7622, 3343, 3201, 3949, 4160, 2576, 248, 1634, 3785, 912, 7623, 2832,
          3666, 3040, 3786, 654, 53, 7624, 2996, 7625, 1688, 4428, 777, 3447,
          1032, 3950, 1425, 7626, 191, 820, 2120, 2833, 971, 4429, 931, 3202,
          135, 664, 783, 3787, 1997, 772, 2908, 1935, 3951, 3788, 4430, 2909,
          3203, 282, 2723, 640, 1372, 3448, 1127, 922, 325, 3344, 7627, 7628,
          711, 2044, 7629, 7630, 3952, 2219, 2787, 1936, 3953, 3345, 2220, 2251,
          3789, 2300, 7631, 4431, 3790, 1258, 3279, 3954, 3204, 2138, 2950,
          3955, 3956, 7632, 2221, 258, 3205, 4432, 101, 1227, 7633, 3280, 1755,
          7634, 1391, 3281, 7635, 2910, 2056, 893, 7636, 7637, 7638, 1402, 4161,
          2342, 7639, 7640, 3206, 3556, 7641, 7642, 878, 1325, 1780, 2788, 4433,
          259, 1385, 2577, 744, 1183, 2267, 4434, 7643, 3957, 2502, 7644, 684,
          1024, 4162, 7645, 472, 3557, 3449, 1165, 3282, 3958, 3959, 322, 2152,
          881, 455, 1695, 1152, 1340, 660, 554, 2153, 4435, 1058, 4436, 4163,
          830, 1065, 3346, 3960, 4437, 1923, 7646, 1703, 1918, 7647, 932, 2268,
          122, 7648, 4438, 947, 677, 7649, 3791, 2627, 297, 1905, 1924, 2269,
          4439, 2317, 3283, 7650, 7651, 4164, 7652, 4165, 84, 4166, 112, 989,
          7653, 547, 1059, 3961, 701, 3558, 1019, 7654, 4167, 7655, 3450, 942,
          639, 457, 2301, 2451, 993, 2951, 407, 851, 494, 4440, 3347, 927, 7656,
          1237, 7657, 2421, 3348, 573, 4168, 680, 921, 2911, 1279, 1874, 285,
          790, 1448, 1983, 719, 2167, 7658, 7659, 4441, 3962, 3963, 1649, 7660,
          1541, 563, 7661, 1077, 7662, 3349, 3041, 3451, 511, 2997, 3964, 3965,
          3667, 3966, 1268, 2564, 3350, 3207, 4442, 4443, 7663, 535, 1048, 1276,
          1189, 2912, 2028, 3142, 1438, 1373, 2834, 2952, 1134, 2012, 7664,
          4169, 1238, 2578, 3086, 1259, 7665, 700, 7666, 2953, 3143, 3668, 4170,
          7667, 4171, 1146, 1875, 1906, 4444, 2601, 3967, 781, 2422, 132, 1589,
          203, 147, 273, 2789, 2402, 898, 1786, 2154, 3968, 3969, 7668, 3792,
          2790, 7669, 7670, 4445, 4446, 7671, 3208, 7672, 1635, 3793, 965, 7673,
          1804, 2690, 1516, 3559, 1121, 1082, 1329, 3284, 3970, 1449, 3794, 65,
          1128, 2835, 2913, 2759, 1590, 3795, 7674, 7675, 12, 2658, 45, 976,
          2579, 3144, 4447, 517, 2528, 1013, 1037, 3209, 7676, 3796, 2836, 7677,
          3797, 7678, 3452, 7679, 2602, 614, 1998, 2318, 3798, 3087, 2724, 2628,
          7680, 2580, 4172, 599, 1269, 7681, 1810, 3669, 7682, 2691, 3088, 759,
          1060, 489, 1805, 3351, 3285, 1358, 7683, 7684, 2386, 1387, 1215, 2629,
          2252, 490, 7685, 7686, 4173, 1759, 2387, 2343, 7687, 4448, 3799, 1907,
          3971, 2630, 1806, 3210, 4449, 3453, 3286, 2760, 2344, 874, 7688, 7689,
          3454, 3670, 1858, 91, 2914, 3671, 3042, 3800, 4450, 7690, 3145, 3972,
          2659, 7691, 3455, 1202, 1403, 3801, 2954, 2529, 1517, 2503, 4451,
          3456, 2504, 7692, 4452, 7693, 2692, 1885, 1495, 1731, 3973, 2365,
          4453, 7694, 2029, 7695, 7696, 3974, 2693, 1216, 237, 2581, 4174, 2319,
          3975, 3802, 4454, 4455, 2694, 3560, 3457, 445, 4456, 7697, 7698, 7699,
          7700, 2761, 61, 3976, 3672, 1822, 3977, 7701, 687, 2045, 935, 925,
          405, 2660, 703, 1096, 1859, 2725, 4457, 3978, 1876, 1367, 2695, 3352,
          918, 2105, 1781, 2476, 334, 3287, 1611, 1093, 4458, 564, 3146, 3458,
          3673, 3353, 945, 2631, 2057, 4459, 7702, 1925, 872, 4175, 7703, 3459,
          2696, 3089, 349, 4176, 3674, 3979, 4460, 3803, 4177, 3675, 2155, 3980,
          4461, 4462, 4178, 4463, 2403, 2046, 782, 3981, 400, 251, 4179, 1624,
          7704, 7705, 277, 3676, 299, 1265, 476, 1191, 3804, 2121, 4180, 4181,
          1109, 205, 7706, 2582, 1e3, 2156, 3561, 1860, 7707, 7708, 7709, 4464,
          7710, 4465, 2565, 107, 2477, 2157, 3982, 3460, 3147, 7711, 1533, 541,
          1301, 158, 753, 4182, 2872, 3562, 7712, 1696, 370, 1088, 4183, 4466,
          3563, 579, 327, 440, 162, 2240, 269, 1937, 1374, 3461, 968, 3043, 56,
          1396, 3090, 2106, 3288, 3354, 7713, 1926, 2158, 4467, 2998, 7714,
          3564, 7715, 7716, 3677, 4468, 2478, 7717, 2791, 7718, 1650, 4469,
          7719, 2603, 7720, 7721, 3983, 2661, 3355, 1149, 3356, 3984, 3805,
          3985, 7722, 1076, 49, 7723, 951, 3211, 3289, 3290, 450, 2837, 920,
          7724, 1811, 2792, 2366, 4184, 1908, 1138, 2367, 3806, 3462, 7725,
          3212, 4470, 1909, 1147, 1518, 2423, 4471, 3807, 7726, 4472, 2388,
          2604, 260, 1795, 3213, 7727, 7728, 3808, 3291, 708, 7729, 3565, 1704,
          7730, 3566, 1351, 1618, 3357, 2999, 1886, 944, 4185, 3358, 4186, 3044,
          3359, 4187, 7731, 3678, 422, 413, 1714, 3292, 500, 2058, 2345, 4188,
          2479, 7732, 1344, 1910, 954, 7733, 1668, 7734, 7735, 3986, 2404, 4189,
          3567, 3809, 4190, 7736, 2302, 1318, 2505, 3091, 133, 3092, 2873, 4473,
          629, 31, 2838, 2697, 3810, 4474, 850, 949, 4475, 3987, 2955, 1732,
          2088, 4191, 1496, 1852, 7737, 3988, 620, 3214, 981, 1242, 3679, 3360,
          1619, 3680, 1643, 3293, 2139, 2452, 1970, 1719, 3463, 2168, 7738,
          3215, 7739, 7740, 3361, 1828, 7741, 1277, 4476, 1565, 2047, 7742,
          1636, 3568, 3093, 7743, 869, 2839, 655, 3811, 3812, 3094, 3989, 3e3,
          3813, 1310, 3569, 4477, 7744, 7745, 7746, 1733, 558, 4478, 3681, 335,
          1549, 3045, 1756, 4192, 3682, 1945, 3464, 1829, 1291, 1192, 470, 2726,
          2107, 2793, 913, 1054, 3990, 7747, 1027, 7748, 3046, 3991, 4479, 982,
          2662, 3362, 3148, 3465, 3216, 3217, 1946, 2794, 7749, 571, 4480, 7750,
          1830, 7751, 3570, 2583, 1523, 2424, 7752, 2089, 984, 4481, 3683, 1959,
          7753, 3684, 852, 923, 2795, 3466, 3685, 969, 1519, 999, 2048, 2320,
          1705, 7754, 3095, 615, 1662, 151, 597, 3992, 2405, 2321, 1049, 275,
          4482, 3686, 4193, 568, 3687, 3571, 2480, 4194, 3688, 7755, 2425, 2270,
          409, 3218, 7756, 1566, 2874, 3467, 1002, 769, 2840, 194, 2090, 3149,
          3689, 2222, 3294, 4195, 628, 1505, 7757, 7758, 1763, 2177, 3001, 3993,
          521, 1161, 2584, 1787, 2203, 2406, 4483, 3994, 1625, 4196, 4197, 412,
          42, 3096, 464, 7759, 2632, 4484, 3363, 1760, 1571, 2875, 3468, 2530,
          1219, 2204, 3814, 2633, 2140, 2368, 4485, 4486, 3295, 1651, 3364,
          3572, 7760, 7761, 3573, 2481, 3469, 7762, 3690, 7763, 7764, 2271,
          2091, 460, 7765, 4487, 7766, 3002, 962, 588, 3574, 289, 3219, 2634,
          1116, 52, 7767, 3047, 1796, 7768, 7769, 7770, 1467, 7771, 1598, 1143,
          3691, 4198, 1984, 1734, 1067, 4488, 1280, 3365, 465, 4489, 1572, 510,
          7772, 1927, 2241, 1812, 1644, 3575, 7773, 4490, 3692, 7774, 7775,
          2663, 1573, 1534, 7776, 7777, 4199, 536, 1807, 1761, 3470, 3815, 3150,
          2635, 7778, 7779, 7780, 4491, 3471, 2915, 1911, 2796, 7781, 3296,
          1122, 377, 3220, 7782, 360, 7783, 7784, 4200, 1529, 551, 7785, 2059,
          3693, 1769, 2426, 7786, 2916, 4201, 3297, 3097, 2322, 2108, 2030,
          4492, 1404, 136, 1468, 1479, 672, 1171, 3221, 2303, 271, 3151, 7787,
          2762, 7788, 2049, 678, 2727, 865, 1947, 4493, 7789, 2013, 3995, 2956,
          7790, 2728, 2223, 1397, 3048, 3694, 4494, 4495, 1735, 2917, 3366,
          3576, 7791, 3816, 509, 2841, 2453, 2876, 3817, 7792, 7793, 3152, 3153,
          4496, 4202, 2531, 4497, 2304, 1166, 1010, 552, 681, 1887, 7794, 7795,
          2957, 2958, 3996, 1287, 1596, 1861, 3154, 358, 453, 736, 175, 478,
          1117, 905, 1167, 1097, 7796, 1853, 1530, 7797, 1706, 7798, 2178, 3472,
          2287, 3695, 3473, 3577, 4203, 2092, 4204, 7799, 3367, 1193, 2482,
          4205, 1458, 2190, 2205, 1862, 1888, 1421, 3298, 2918, 3049, 2179,
          3474, 595, 2122, 7800, 3997, 7801, 7802, 4206, 1707, 2636, 223, 3696,
          1359, 751, 3098, 183, 3475, 7803, 2797, 3003, 419, 2369, 633, 704,
          3818, 2389, 241, 7804, 7805, 7806, 838, 3004, 3697, 2272, 2763, 2454,
          3819, 1938, 2050, 3998, 1309, 3099, 2242, 1181, 7807, 1136, 2206,
          3820, 2370, 1446, 4207, 2305, 4498, 7808, 7809, 4208, 1055, 2605, 484,
          3698, 7810, 3999, 625, 4209, 2273, 3368, 1499, 4210, 4e3, 7811, 4001,
          4211, 3222, 2274, 2275, 3476, 7812, 7813, 2764, 808, 2606, 3699, 3369,
          4002, 4212, 3100, 2532, 526, 3370, 3821, 4213, 955, 7814, 1620, 4214,
          2637, 2427, 7815, 1429, 3700, 1669, 1831, 994, 928, 7816, 3578, 1260,
          7817, 7818, 7819, 1948, 2288, 741, 2919, 1626, 4215, 2729, 2455, 867,
          1184, 362, 3371, 1392, 7820, 7821, 4003, 4216, 1770, 1736, 3223, 2920,
          4499, 4500, 1928, 2698, 1459, 1158, 7822, 3050, 3372, 2877, 1292,
          1929, 2506, 2842, 3701, 1985, 1187, 2071, 2014, 2607, 4217, 7823,
          2566, 2507, 2169, 3702, 2483, 3299, 7824, 3703, 4501, 7825, 7826, 666,
          1003, 3005, 1022, 3579, 4218, 7827, 4502, 1813, 2253, 574, 3822, 1603,
          295, 1535, 705, 3823, 4219, 283, 858, 417, 7828, 7829, 3224, 4503,
          4504, 3051, 1220, 1889, 1046, 2276, 2456, 4004, 1393, 1599, 689, 2567,
          388, 4220, 7830, 2484, 802, 7831, 2798, 3824, 2060, 1405, 2254, 7832,
          4505, 3825, 2109, 1052, 1345, 3225, 1585, 7833, 809, 7834, 7835, 7836,
          575, 2730, 3477, 956, 1552, 1469, 1144, 2323, 7837, 2324, 1560, 2457,
          3580, 3226, 4005, 616, 2207, 3155, 2180, 2289, 7838, 1832, 7839, 3478,
          4506, 7840, 1319, 3704, 3705, 1211, 3581, 1023, 3227, 1293, 2799,
          7841, 7842, 7843, 3826, 607, 2306, 3827, 762, 2878, 1439, 4221, 1360,
          7844, 1485, 3052, 7845, 4507, 1038, 4222, 1450, 2061, 2638, 4223,
          1379, 4508, 2585, 7846, 7847, 4224, 1352, 1414, 2325, 2921, 1172,
          7848, 7849, 3828, 3829, 7850, 1797, 1451, 7851, 7852, 7853, 7854,
          2922, 4006, 4007, 2485, 2346, 411, 4008, 4009, 3582, 3300, 3101, 4509,
          1561, 2664, 1452, 4010, 1375, 7855, 7856, 47, 2959, 316, 7857, 1406,
          1591, 2923, 3156, 7858, 1025, 2141, 3102, 3157, 354, 2731, 884, 2224,
          4225, 2407, 508, 3706, 726, 3583, 996, 2428, 3584, 729, 7859, 392,
          2191, 1453, 4011, 4510, 3707, 7860, 7861, 2458, 3585, 2608, 1675,
          2800, 919, 2347, 2960, 2348, 1270, 4511, 4012, 73, 7862, 7863, 647,
          7864, 3228, 2843, 2255, 1550, 1346, 3006, 7865, 1332, 883, 3479, 7866,
          7867, 7868, 7869, 3301, 2765, 7870, 1212, 831, 1347, 4226, 4512, 2326,
          3830, 1863, 3053, 720, 3831, 4513, 4514, 3832, 7871, 4227, 7872, 7873,
          4515, 7874, 7875, 1798, 4516, 3708, 2609, 4517, 3586, 1645, 2371,
          7876, 7877, 2924, 669, 2208, 2665, 2429, 7878, 2879, 7879, 7880, 1028,
          3229, 7881, 4228, 2408, 7882, 2256, 1353, 7883, 7884, 4518, 3158, 518,
          7885, 4013, 7886, 4229, 1960, 7887, 2142, 4230, 7888, 7889, 3007,
          2349, 2350, 3833, 516, 1833, 1454, 4014, 2699, 4231, 4519, 2225, 2610,
          1971, 1129, 3587, 7890, 2766, 7891, 2961, 1422, 577, 1470, 3008, 1524,
          3373, 7892, 7893, 432, 4232, 3054, 3480, 7894, 2586, 1455, 2508, 2226,
          1972, 1175, 7895, 1020, 2732, 4015, 3481, 4520, 7896, 2733, 7897,
          1743, 1361, 3055, 3482, 2639, 4016, 4233, 4521, 2290, 895, 924, 4234,
          2170, 331, 2243, 3056, 166, 1627, 3057, 1098, 7898, 1232, 2880, 2227,
          3374, 4522, 657, 403, 1196, 2372, 542, 3709, 3375, 1600, 4235, 3483,
          7899, 4523, 2767, 3230, 576, 530, 1362, 7900, 4524, 2533, 2666, 3710,
          4017, 7901, 842, 3834, 7902, 2801, 2031, 1014, 4018, 213, 2700, 3376,
          665, 621, 4236, 7903, 3711, 2925, 2430, 7904, 2431, 3302, 3588, 3377,
          7905, 4237, 2534, 4238, 4525, 3589, 1682, 4239, 3484, 1380, 7906, 724,
          2277, 600, 1670, 7907, 1337, 1233, 4526, 3103, 2244, 7908, 1621, 4527,
          7909, 651, 4240, 7910, 1612, 4241, 2611, 7911, 2844, 7912, 2734, 2307,
          3058, 7913, 716, 2459, 3059, 174, 1255, 2701, 4019, 3590, 548, 1320,
          1398, 728, 4020, 1574, 7914, 1890, 1197, 3060, 4021, 7915, 3061, 3062,
          3712, 3591, 3713, 747, 7916, 635, 4242, 4528, 7917, 7918, 7919, 4243,
          7920, 7921, 4529, 7922, 3378, 4530, 2432, 451, 7923, 3714, 2535, 2072,
          4244, 2735, 4245, 4022, 7924, 1764, 4531, 7925, 4246, 350, 7926, 2278,
          2390, 2486, 7927, 4247, 4023, 2245, 1434, 4024, 488, 4532, 458, 4248,
          4025, 3715, 771, 1330, 2391, 3835, 2568, 3159, 2159, 2409, 1553, 2667,
          3160, 4249, 7928, 2487, 2881, 2612, 1720, 2702, 4250, 3379, 4533,
          7929, 2536, 4251, 7930, 3231, 4252, 2768, 7931, 2015, 2736, 7932,
          1155, 1017, 3716, 3836, 7933, 3303, 2308, 201, 1864, 4253, 1430, 7934,
          4026, 7935, 7936, 7937, 7938, 7939, 4254, 1604, 7940, 414, 1865, 371,
          2587, 4534, 4535, 3485, 2016, 3104, 4536, 1708, 960, 4255, 887, 389,
          2171, 1536, 1663, 1721, 7941, 2228, 4027, 2351, 2926, 1580, 7942,
          7943, 7944, 1744, 7945, 2537, 4537, 4538, 7946, 4539, 7947, 2073,
          7948, 7949, 3592, 3380, 2882, 4256, 7950, 4257, 2640, 3381, 2802, 673,
          2703, 2460, 709, 3486, 4028, 3593, 4258, 7951, 1148, 502, 634, 7952,
          7953, 1204, 4540, 3594, 1575, 4541, 2613, 3717, 7954, 3718, 3105, 948,
          3232, 121, 1745, 3837, 1110, 7955, 4259, 3063, 2509, 3009, 4029, 3719,
          1151, 1771, 3838, 1488, 4030, 1986, 7956, 2433, 3487, 7957, 7958,
          2093, 7959, 4260, 3839, 1213, 1407, 2803, 531, 2737, 2538, 3233, 1011,
          1537, 7960, 2769, 4261, 3106, 1061, 7961, 3720, 3721, 1866, 2883,
          7962, 2017, 120, 4262, 4263, 2062, 3595, 3234, 2309, 3840, 2668, 3382,
          1954, 4542, 7963, 7964, 3488, 1047, 2704, 1266, 7965, 1368, 4543,
          2845, 649, 3383, 3841, 2539, 2738, 1102, 2846, 2669, 7966, 7967, 1999,
          7968, 1111, 3596, 2962, 7969, 2488, 3842, 3597, 2804, 1854, 3384,
          3722, 7970, 7971, 3385, 2410, 2884, 3304, 3235, 3598, 7972, 2569,
          7973, 3599, 2805, 4031, 1460, 856, 7974, 3600, 7975, 2885, 2963, 7976,
          2886, 3843, 7977, 4264, 632, 2510, 875, 3844, 1697, 3845, 2291, 7978,
          7979, 4544, 3010, 1239, 580, 4545, 4265, 7980, 914, 936, 2074, 1190,
          4032, 1039, 2123, 7981, 7982, 7983, 3386, 1473, 7984, 1354, 4266,
          3846, 7985, 2172, 3064, 4033, 915, 3305, 4267, 4268, 3306, 1605, 1834,
          7986, 2739, 398, 3601, 4269, 3847, 4034, 328, 1912, 2847, 4035, 3848,
          1331, 4270, 3011, 937, 4271, 7987, 3602, 4036, 4037, 3387, 2160, 4546,
          3388, 524, 742, 538, 3065, 1012, 7988, 7989, 3849, 2461, 7990, 658,
          1103, 225, 3850, 7991, 7992, 4547, 7993, 4548, 7994, 3236, 1243, 7995,
          4038, 963, 2246, 4549, 7996, 2705, 3603, 3161, 7997, 7998, 2588, 2327,
          7999, 4550, 8e3, 8001, 8002, 3489, 3307, 957, 3389, 2540, 2032, 1930,
          2927, 2462, 870, 2018, 3604, 1746, 2770, 2771, 2434, 2463, 8003, 3851,
          8004, 3723, 3107, 3724, 3490, 3390, 3725, 8005, 1179, 3066, 8006,
          3162, 2373, 4272, 3726, 2541, 3163, 3108, 2740, 4039, 8007, 3391,
          1556, 2542, 2292, 977, 2887, 2033, 4040, 1205, 3392, 8008, 1765, 3393,
          3164, 2124, 1271, 1689, 714, 4551, 3491, 8009, 2328, 3852, 533, 4273,
          3605, 2181, 617, 8010, 2464, 3308, 3492, 2310, 8011, 8012, 3165, 8013,
          8014, 3853, 1987, 618, 427, 2641, 3493, 3394, 8015, 8016, 1244, 1690,
          8017, 2806, 4274, 4552, 8018, 3494, 8019, 8020, 2279, 1576, 473, 3606,
          4275, 3395, 972, 8021, 3607, 8022, 3067, 8023, 8024, 4553, 4554, 8025,
          3727, 4041, 4042, 8026, 153, 4555, 356, 8027, 1891, 2888, 4276, 2143,
          408, 803, 2352, 8028, 3854, 8029, 4277, 1646, 2570, 2511, 4556, 4557,
          3855, 8030, 3856, 4278, 8031, 2411, 3396, 752, 8032, 8033, 1961, 2964,
          8034, 746, 3012, 2465, 8035, 4279, 3728, 698, 4558, 1892, 4280, 3608,
          2543, 4559, 3609, 3857, 8036, 3166, 3397, 8037, 1823, 1302, 4043,
          2706, 3858, 1973, 4281, 8038, 4282, 3167, 823, 1303, 1288, 1236, 2848,
          3495, 4044, 3398, 774, 3859, 8039, 1581, 4560, 1304, 2849, 3860, 4561,
          8040, 2435, 2161, 1083, 3237, 4283, 4045, 4284, 344, 1173, 288, 2311,
          454, 1683, 8041, 8042, 1461, 4562, 4046, 2589, 8043, 8044, 4563, 985,
          894, 8045, 3399, 3168, 8046, 1913, 2928, 3729, 1988, 8047, 2110, 1974,
          8048, 4047, 8049, 2571, 1194, 425, 8050, 4564, 3169, 1245, 3730, 4285,
          8051, 8052, 2850, 8053, 636, 4565, 1855, 3861, 760, 1799, 8054, 4286,
          2209, 1508, 4566, 4048, 1893, 1684, 2293, 8055, 8056, 8057, 4287,
          4288, 2210, 479, 8058, 8059, 832, 8060, 4049, 2489, 8061, 2965, 2490,
          3731, 990, 3109, 627, 1814, 2642, 4289, 1582, 4290, 2125, 2111, 3496,
          4567, 8062, 799, 4291, 3170, 8063, 4568, 2112, 1737, 3013, 1018, 543,
          754, 4292, 3309, 1676, 4569, 4570, 4050, 8064, 1489, 8065, 3497, 8066,
          2614, 2889, 4051, 8067, 8068, 2966, 8069, 8070, 8071, 8072, 3171,
          4571, 4572, 2182, 1722, 8073, 3238, 3239, 1842, 3610, 1715, 481, 365,
          1975, 1856, 8074, 8075, 1962, 2491, 4573, 8076, 2126, 3611, 3240, 433,
          1894, 2063, 2075, 8077, 602, 2741, 8078, 8079, 8080, 8081, 8082, 3014,
          1628, 3400, 8083, 3172, 4574, 4052, 2890, 4575, 2512, 8084, 2544,
          2772, 8085, 8086, 8087, 3310, 4576, 2891, 8088, 4577, 8089, 2851,
          4578, 4579, 1221, 2967, 4053, 2513, 8090, 8091, 8092, 1867, 1989,
          8093, 8094, 8095, 1895, 8096, 8097, 4580, 1896, 4054, 318, 8098, 2094,
          4055, 4293, 8099, 8100, 485, 8101, 938, 3862, 553, 2670, 116, 8102,
          3863, 3612, 8103, 3498, 2671, 2773, 3401, 3311, 2807, 8104, 3613,
          2929, 4056, 1747, 2930, 2968, 8105, 8106, 207, 8107, 8108, 2672, 4581,
          2514, 8109, 3015, 890, 3614, 3864, 8110, 1877, 3732, 3402, 8111, 2183,
          2353, 3403, 1652, 8112, 8113, 8114, 941, 2294, 208, 3499, 4057, 2019,
          330, 4294, 3865, 2892, 2492, 3733, 4295, 8115, 8116, 8117, 8118, 2515,
          1613, 4582, 8119, 3312, 3866, 2516, 8120, 4058, 8121, 1637, 4059,
          2466, 4583, 3867, 8122, 2493, 3016, 3734, 8123, 8124, 2192, 8125,
          8126, 2162, 8127, 8128, 8129, 8130, 8131, 8132, 8133, 8134, 8135,
          8136, 8137, 8138, 8139, 8140, 8141, 8142, 8143, 8144, 8145, 8146,
          8147, 8148, 8149, 8150, 8151, 8152, 8153, 8154, 8155, 8156, 8157,
          8158, 8159, 8160, 8161, 8162, 8163, 8164, 8165, 8166, 8167, 8168,
          8169, 8170, 8171, 8172, 8173, 8174, 8175, 8176, 8177, 8178, 8179,
          8180, 8181, 8182, 8183, 8184, 8185, 8186, 8187, 8188, 8189, 8190,
          8191, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201,
          8202, 8203, 8204, 8205, 8206, 8207, 8208, 8209, 8210, 8211, 8212,
          8213, 8214, 8215, 8216, 8217, 8218, 8219, 8220, 8221, 8222, 8223,
          8224, 8225, 8226, 8227, 8228, 8229, 8230, 8231, 8232, 8233, 8234,
          8235, 8236, 8237, 8238, 8239, 8240, 8241, 8242, 8243, 8244, 8245,
          8246, 8247, 8248, 8249, 8250, 8251, 8252, 8253, 8254, 8255, 8256,
          8257, 8258, 8259, 8260, 8261, 8262, 8263, 8264, 8265, 8266, 8267,
          8268, 8269, 8270, 8271, 8272, 8273, 8274, 8275, 8276, 8277, 8278,
          8279, 8280, 8281, 8282, 8283, 8284, 8285, 8286, 8287, 8288, 8289,
          8290, 8291, 8292, 8293, 8294, 8295, 8296, 8297, 8298, 8299, 8300,
          8301, 8302, 8303, 8304, 8305, 8306, 8307, 8308, 8309, 8310, 8311,
          8312, 8313, 8314, 8315, 8316, 8317, 8318, 8319, 8320, 8321, 8322,
          8323, 8324, 8325, 8326, 8327, 8328, 8329, 8330, 8331, 8332, 8333,
          8334, 8335, 8336, 8337, 8338, 8339, 8340, 8341, 8342, 8343, 8344,
          8345, 8346, 8347, 8348, 8349, 8350, 8351, 8352, 8353, 8354, 8355,
          8356, 8357, 8358, 8359, 8360, 8361, 8362, 8363, 8364, 8365, 8366,
          8367, 8368, 8369, 8370, 8371, 8372, 8373, 8374, 8375, 8376, 8377,
          8378, 8379, 8380, 8381, 8382, 8383, 8384, 8385, 8386, 8387, 8388,
          8389, 8390, 8391, 8392, 8393, 8394, 8395, 8396, 8397, 8398, 8399,
          8400, 8401, 8402, 8403, 8404, 8405, 8406, 8407, 8408, 8409, 8410,
          8411, 8412, 8413, 8414, 8415, 8416, 8417, 8418, 8419, 8420, 8421,
          8422, 8423, 8424, 8425, 8426, 8427, 8428, 8429, 8430, 8431, 8432,
          8433, 8434, 8435, 8436, 8437, 8438, 8439, 8440, 8441, 8442, 8443,
          8444, 8445, 8446, 8447, 8448, 8449, 8450, 8451, 8452, 8453, 8454,
          8455, 8456, 8457, 8458, 8459, 8460, 8461, 8462, 8463, 8464, 8465,
          8466, 8467, 8468, 8469, 8470, 8471, 8472, 8473, 8474, 8475, 8476,
          8477, 8478, 8479, 8480, 8481, 8482, 8483, 8484, 8485, 8486, 8487,
          8488, 8489, 8490, 8491, 8492, 8493, 8494, 8495, 8496, 8497, 8498,
          8499, 8500, 8501, 8502, 8503, 8504, 8505, 8506, 8507, 8508, 8509,
          8510, 8511, 8512, 8513, 8514, 8515, 8516, 8517, 8518, 8519, 8520,
          8521, 8522, 8523, 8524, 8525, 8526, 8527, 8528, 8529, 8530, 8531,
          8532, 8533, 8534, 8535, 8536, 8537, 8538, 8539, 8540, 8541, 8542,
          8543, 8544, 8545, 8546, 8547, 8548, 8549, 8550, 8551, 8552, 8553,
          8554, 8555, 8556, 8557, 8558, 8559, 8560, 8561, 8562, 8563, 8564,
          8565, 8566, 8567, 8568, 8569, 8570, 8571, 8572, 8573, 8574, 8575,
          8576, 8577, 8578, 8579, 8580, 8581, 8582, 8583, 8584, 8585, 8586,
          8587, 8588, 8589, 8590, 8591, 8592, 8593, 8594, 8595, 8596, 8597,
          8598, 8599, 8600, 8601, 8602, 8603, 8604, 8605, 8606, 8607, 8608,
          8609, 8610, 8611, 8612, 8613, 8614, 8615, 8616, 8617, 8618, 8619,
          8620, 8621, 8622, 8623, 8624, 8625, 8626, 8627, 8628, 8629, 8630,
          8631, 8632, 8633, 8634, 8635, 8636, 8637, 8638, 8639, 8640, 8641,
          8642, 8643, 8644, 8645, 8646, 8647, 8648, 8649, 8650, 8651, 8652,
          8653, 8654, 8655, 8656, 8657, 8658, 8659, 8660, 8661, 8662, 8663,
          8664, 8665, 8666, 8667, 8668, 8669, 8670, 8671, 8672, 8673, 8674,
          8675, 8676, 8677, 8678, 8679, 8680, 8681, 8682, 8683, 8684, 8685,
          8686, 8687, 8688, 8689, 8690, 8691, 8692, 8693, 8694, 8695, 8696,
          8697, 8698, 8699, 8700, 8701, 8702, 8703, 8704, 8705, 8706, 8707,
          8708, 8709, 8710, 8711, 8712, 8713, 8714, 8715, 8716, 8717, 8718,
          8719, 8720, 8721, 8722, 8723, 8724, 8725, 8726, 8727, 8728, 8729,
          8730, 8731, 8732, 8733, 8734, 8735, 8736, 8737, 8738, 8739, 8740,
          8741,
        ]));
    },
    21519(eA, el) {
      ((el.EUCKR_TYPICAL_DISTRIBUTION_RATIO = 6),
        (el.EUCKR_TABLE_SIZE = 2352),
        (el.EUCKRCharToFreqOrder = [
          13, 130, 120, 1396, 481, 1719, 1720, 328, 609, 212, 1721, 707, 400,
          299, 1722, 87, 1397, 1723, 104, 536, 1117, 1203, 1724, 1267, 685,
          1268, 508, 1725, 1726, 1727, 1728, 1398, 1399, 1729, 1730, 1731, 141,
          621, 326, 1057, 368, 1732, 267, 488, 20, 1733, 1269, 1734, 945, 1400,
          1735, 47, 904, 1270, 1736, 1737, 773, 248, 1738, 409, 313, 786, 429,
          1739, 116, 987, 813, 1401, 683, 75, 1204, 145, 1740, 1741, 1742, 1743,
          16, 847, 667, 622, 708, 1744, 1745, 1746, 966, 787, 304, 129, 1747,
          60, 820, 123, 676, 1748, 1749, 1750, 1751, 617, 1752, 626, 1753, 1754,
          1755, 1756, 653, 1757, 1758, 1759, 1760, 1761, 1762, 856, 344, 1763,
          1764, 1765, 1766, 89, 401, 418, 806, 905, 848, 1767, 1768, 1769, 946,
          1205, 709, 1770, 1118, 1771, 241, 1772, 1773, 1774, 1271, 1775, 569,
          1776, 999, 1777, 1778, 1779, 1780, 337, 751, 1058, 28, 628, 254, 1781,
          177, 906, 270, 349, 891, 1079, 1782, 19, 1783, 379, 1784, 315, 1785,
          629, 754, 1402, 559, 1786, 636, 203, 1206, 1787, 710, 567, 1788, 935,
          814, 1789, 1790, 1207, 766, 528, 1791, 1792, 1208, 1793, 1794, 1795,
          1796, 1797, 1403, 1798, 1799, 533, 1059, 1404, 1405, 1156, 1406, 936,
          884, 1080, 1800, 351, 1801, 1802, 1803, 1804, 1805, 801, 1806, 1807,
          1808, 1119, 1809, 1157, 714, 474, 1407, 1810, 298, 899, 885, 1811,
          1120, 802, 1158, 1812, 892, 1813, 1814, 1408, 659, 1815, 1816, 1121,
          1817, 1818, 1819, 1820, 1821, 1822, 319, 1823, 594, 545, 1824, 815,
          937, 1209, 1825, 1826, 573, 1409, 1022, 1827, 1210, 1828, 1829, 1830,
          1831, 1832, 1833, 556, 722, 807, 1122, 1060, 1834, 697, 1835, 900,
          557, 715, 1836, 1410, 540, 1411, 752, 1159, 294, 597, 1211, 976, 803,
          770, 1412, 1837, 1838, 39, 794, 1413, 358, 1839, 371, 925, 1840, 453,
          661, 788, 531, 723, 544, 1023, 1081, 869, 91, 1841, 392, 430, 790,
          602, 1414, 677, 1082, 457, 1415, 1416, 1842, 1843, 475, 327, 1024,
          1417, 795, 121, 1844, 733, 403, 1418, 1845, 1846, 1847, 300, 119, 711,
          1212, 627, 1848, 1272, 207, 1849, 1850, 796, 1213, 382, 1851, 519,
          1852, 1083, 893, 1853, 1854, 1855, 367, 809, 487, 671, 1856, 663,
          1857, 1858, 956, 471, 306, 857, 1859, 1860, 1160, 1084, 1861, 1862,
          1863, 1864, 1865, 1061, 1866, 1867, 1868, 1869, 1870, 1871, 282, 96,
          574, 1872, 502, 1085, 1873, 1214, 1874, 907, 1875, 1876, 827, 977,
          1419, 1420, 1421, 268, 1877, 1422, 1878, 1879, 1880, 308, 1881, 2,
          537, 1882, 1883, 1215, 1884, 1885, 127, 791, 1886, 1273, 1423, 1887,
          34, 336, 404, 643, 1888, 571, 654, 894, 840, 1889, 0, 886, 1274, 122,
          575, 260, 908, 938, 1890, 1275, 410, 316, 1891, 1892, 100, 1893, 1894,
          1123, 48, 1161, 1124, 1025, 1895, 633, 901, 1276, 1896, 1897, 115,
          816, 1898, 317, 1899, 694, 1900, 909, 734, 1424, 572, 866, 1425, 691,
          85, 524, 1010, 543, 394, 841, 1901, 1902, 1903, 1026, 1904, 1905,
          1906, 1907, 1908, 1909, 30, 451, 651, 988, 310, 1910, 1911, 1426, 810,
          1216, 93, 1912, 1913, 1277, 1217, 1914, 858, 759, 45, 58, 181, 610,
          269, 1915, 1916, 131, 1062, 551, 443, 1e3, 821, 1427, 957, 895, 1086,
          1917, 1918, 375, 1919, 359, 1920, 687, 1921, 822, 1922, 293, 1923,
          1924, 40, 662, 118, 692, 29, 939, 887, 640, 482, 174, 1925, 69, 1162,
          728, 1428, 910, 1926, 1278, 1218, 1279, 386, 870, 217, 854, 1163, 823,
          1927, 1928, 1929, 1930, 834, 1931, 78, 1932, 859, 1933, 1063, 1934,
          1935, 1936, 1937, 438, 1164, 208, 595, 1938, 1939, 1940, 1941, 1219,
          1125, 1942, 280, 888, 1429, 1430, 1220, 1431, 1943, 1944, 1945, 1946,
          1947, 1280, 150, 510, 1432, 1948, 1949, 1950, 1951, 1952, 1953, 1954,
          1011, 1087, 1955, 1433, 1043, 1956, 881, 1957, 614, 958, 1064, 1065,
          1221, 1958, 638, 1001, 860, 967, 896, 1434, 989, 492, 553, 1281, 1165,
          1959, 1282, 1002, 1283, 1222, 1960, 1961, 1962, 1963, 36, 383, 228,
          753, 247, 454, 1964, 876, 678, 1965, 1966, 1284, 126, 464, 490, 835,
          136, 672, 529, 940, 1088, 1435, 473, 1967, 1968, 467, 50, 390, 227,
          587, 279, 378, 598, 792, 968, 240, 151, 160, 849, 882, 1126, 1285,
          639, 1044, 133, 140, 288, 360, 811, 563, 1027, 561, 142, 523, 1969,
          1970, 1971, 7, 103, 296, 439, 407, 506, 634, 990, 1972, 1973, 1974,
          1975, 645, 1976, 1977, 1978, 1979, 1980, 1981, 236, 1982, 1436, 1983,
          1984, 1089, 192, 828, 618, 518, 1166, 333, 1127, 1985, 818, 1223,
          1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 342, 1128, 1286, 746,
          842, 1994, 1995, 560, 223, 1287, 98, 8, 189, 650, 978, 1288, 1996,
          1437, 1997, 17, 345, 250, 423, 277, 234, 512, 226, 97, 289, 42, 167,
          1998, 201, 1999, 2e3, 843, 836, 824, 532, 338, 783, 1090, 182, 576,
          436, 1438, 1439, 527, 500, 2001, 947, 889, 2002, 2003, 2004, 2005,
          262, 600, 314, 447, 2006, 547, 2007, 693, 738, 1129, 2008, 71, 1440,
          745, 619, 688, 2009, 829, 2010, 2011, 147, 2012, 33, 948, 2013, 2014,
          74, 224, 2015, 61, 191, 918, 399, 637, 2016, 1028, 1130, 257, 902,
          2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 837, 2027,
          2028, 2029, 2030, 179, 874, 591, 52, 724, 246, 2031, 2032, 2033, 2034,
          1167, 969, 2035, 1289, 630, 605, 911, 1091, 1168, 2036, 2037, 2038,
          1441, 912, 2039, 623, 2040, 2041, 253, 1169, 1290, 2042, 1442, 146,
          620, 611, 577, 433, 2043, 1224, 719, 1170, 959, 440, 437, 534, 84,
          388, 480, 1131, 159, 220, 198, 679, 2044, 1012, 819, 1066, 1443, 113,
          1225, 194, 318, 1003, 1029, 2045, 2046, 2047, 2048, 1067, 2049, 2050,
          2051, 2052, 2053, 59, 913, 112, 2054, 632, 2055, 455, 144, 739, 1291,
          2056, 273, 681, 499, 2057, 448, 2058, 2059, 760, 2060, 2061, 970, 384,
          169, 245, 1132, 2062, 2063, 414, 1444, 2064, 2065, 41, 235, 2066, 157,
          252, 877, 568, 919, 789, 580, 2067, 725, 2068, 2069, 1292, 2070, 2071,
          1445, 2072, 1446, 2073, 2074, 55, 588, 66, 1447, 271, 1092, 2075,
          1226, 2076, 960, 1013, 372, 2077, 2078, 2079, 2080, 2081, 1293, 2082,
          2083, 2084, 2085, 850, 2086, 2087, 2088, 2089, 2090, 186, 2091, 1068,
          180, 2092, 2093, 2094, 109, 1227, 522, 606, 2095, 867, 1448, 1093,
          991, 1171, 926, 353, 1133, 2096, 581, 2097, 2098, 2099, 1294, 1449,
          1450, 2100, 596, 1172, 1014, 1228, 2101, 1451, 1295, 1173, 1229, 2102,
          2103, 1296, 1134, 1452, 949, 1135, 2104, 2105, 1094, 1453, 1454, 1455,
          2106, 1095, 2107, 2108, 2109, 2110, 2111, 2112, 2113, 2114, 2115,
          2116, 2117, 804, 2118, 2119, 1230, 1231, 805, 1456, 405, 1136, 2120,
          2121, 2122, 2123, 2124, 720, 701, 1297, 992, 1457, 927, 1004, 2125,
          2126, 2127, 2128, 2129, 2130, 22, 417, 2131, 303, 2132, 385, 2133,
          971, 520, 513, 2134, 1174, 73, 1096, 231, 274, 962, 1458, 673, 2135,
          1459, 2136, 152, 1137, 2137, 2138, 2139, 2140, 1005, 1138, 1460, 1139,
          2141, 2142, 2143, 2144, 11, 374, 844, 2145, 154, 1232, 46, 1461, 2146,
          838, 830, 721, 1233, 106, 2147, 90, 428, 462, 578, 566, 1175, 352,
          2148, 2149, 538, 1234, 124, 1298, 2150, 1462, 761, 565, 2151, 686,
          2152, 649, 2153, 72, 173, 2154, 460, 415, 2155, 1463, 2156, 1235, 305,
          2157, 2158, 2159, 2160, 2161, 2162, 579, 2163, 2164, 2165, 2166, 2167,
          747, 2168, 2169, 2170, 2171, 1464, 669, 2172, 2173, 2174, 2175, 2176,
          1465, 2177, 23, 530, 285, 2178, 335, 729, 2179, 397, 2180, 2181, 2182,
          1030, 2183, 2184, 698, 2185, 2186, 325, 2187, 2188, 369, 2189, 799,
          1097, 1015, 348, 2190, 1069, 680, 2191, 851, 1466, 2192, 2193, 10,
          2194, 613, 424, 2195, 979, 108, 449, 589, 27, 172, 81, 1031, 80, 774,
          281, 350, 1032, 525, 301, 582, 1176, 2196, 674, 1045, 2197, 2198,
          1467, 730, 762, 2199, 2200, 2201, 2202, 1468, 2203, 993, 2204, 2205,
          266, 1070, 963, 1140, 2206, 2207, 2208, 664, 1098, 972, 2209, 2210,
          2211, 1177, 1469, 1470, 871, 2212, 2213, 2214, 2215, 2216, 1471, 2217,
          2218, 2219, 2220, 2221, 2222, 2223, 2224, 2225, 2226, 2227, 1472,
          1236, 2228, 2229, 2230, 2231, 2232, 2233, 2234, 2235, 1299, 2236,
          2237, 200, 2238, 477, 373, 2239, 2240, 731, 825, 777, 2241, 2242,
          2243, 521, 486, 548, 2244, 2245, 2246, 1473, 1300, 53, 549, 137, 875,
          76, 158, 2247, 1301, 1474, 469, 396, 1016, 278, 712, 2248, 321, 442,
          503, 767, 744, 941, 1237, 1178, 1475, 2249, 82, 178, 1141, 1179, 973,
          2250, 1302, 2251, 297, 2252, 2253, 570, 2254, 2255, 2256, 18, 450,
          206, 2257, 290, 292, 1142, 2258, 511, 162, 99, 346, 164, 735, 2259,
          1476, 1477, 4, 554, 343, 798, 1099, 2260, 1100, 2261, 43, 171, 1303,
          139, 215, 2262, 2263, 717, 775, 2264, 1033, 322, 216, 2265, 831, 2266,
          149, 2267, 1304, 2268, 2269, 702, 1238, 135, 845, 347, 309, 2270, 484,
          2271, 878, 655, 238, 1006, 1478, 2272, 67, 2273, 295, 2274, 2275, 461,
          2276, 478, 942, 412, 2277, 1034, 2278, 2279, 2280, 265, 2281, 541,
          2282, 2283, 2284, 2285, 2286, 70, 852, 1071, 2287, 2288, 2289, 2290,
          21, 56, 509, 117, 432, 2291, 2292, 331, 980, 552, 1101, 148, 284, 105,
          393, 1180, 1239, 755, 2293, 187, 2294, 1046, 1479, 2295, 340, 2296,
          63, 1047, 230, 2297, 2298, 1305, 763, 1306, 101, 800, 808, 494, 2299,
          2300, 2301, 903, 2302, 37, 1072, 14, 5, 2303, 79, 675, 2304, 312,
          2305, 2306, 2307, 2308, 2309, 1480, 6, 1307, 2310, 2311, 2312, 1, 470,
          35, 24, 229, 2313, 695, 210, 86, 778, 15, 784, 592, 779, 32, 77, 855,
          964, 2314, 259, 2315, 501, 380, 2316, 2317, 83, 981, 153, 689, 1308,
          1481, 1482, 1483, 2318, 2319, 716, 1484, 2320, 2321, 2322, 2323, 2324,
          2325, 1485, 2326, 2327, 128, 57, 68, 261, 1048, 211, 170, 1240, 31,
          2328, 51, 435, 742, 2329, 2330, 2331, 635, 2332, 264, 456, 2333, 2334,
          2335, 425, 2336, 1486, 143, 507, 263, 943, 2337, 363, 920, 1487, 256,
          1488, 1102, 243, 601, 1489, 2338, 2339, 2340, 2341, 2342, 2343, 2344,
          861, 2345, 2346, 2347, 2348, 2349, 2350, 395, 2351, 1490, 1491, 62,
          535, 166, 225, 2352, 2353, 668, 419, 1241, 138, 604, 928, 2354, 1181,
          2355, 1492, 1493, 2356, 2357, 2358, 1143, 2359, 696, 2360, 387, 307,
          1309, 682, 476, 2361, 2362, 332, 12, 222, 156, 2363, 232, 2364, 641,
          276, 656, 517, 1494, 1495, 1035, 416, 736, 1496, 2365, 1017, 586,
          2366, 2367, 2368, 1497, 2369, 242, 2370, 2371, 2372, 1498, 2373, 965,
          713, 2374, 2375, 2376, 2377, 740, 982, 1499, 944, 1500, 1007, 2378,
          2379, 1310, 1501, 2380, 2381, 2382, 785, 329, 2383, 2384, 1502, 2385,
          2386, 2387, 932, 2388, 1503, 2389, 2390, 2391, 2392, 1242, 2393, 2394,
          2395, 2396, 2397, 994, 950, 2398, 2399, 2400, 2401, 1504, 1311, 2402,
          2403, 2404, 2405, 1049, 749, 2406, 2407, 853, 718, 1144, 1312, 2408,
          1182, 1505, 2409, 2410, 255, 516, 479, 564, 550, 214, 1506, 1507,
          1313, 413, 239, 444, 339, 1145, 1036, 1508, 1509, 1314, 1037, 1510,
          1315, 2411, 1511, 2412, 2413, 2414, 176, 703, 497, 624, 593, 921, 302,
          2415, 341, 165, 1103, 1512, 2416, 1513, 2417, 2418, 2419, 376, 2420,
          700, 2421, 2422, 2423, 258, 768, 1316, 2424, 1183, 2425, 995, 608,
          2426, 2427, 2428, 2429, 221, 2430, 2431, 2432, 2433, 2434, 2435, 2436,
          2437, 195, 323, 726, 188, 897, 983, 1317, 377, 644, 1050, 879, 2438,
          452, 2439, 2440, 2441, 2442, 2443, 2444, 914, 2445, 2446, 2447, 2448,
          915, 489, 2449, 1514, 1184, 2450, 2451, 515, 64, 427, 495, 2452, 583,
          2453, 483, 485, 1038, 562, 213, 1515, 748, 666, 2454, 2455, 2456,
          2457, 334, 2458, 780, 996, 1008, 705, 1243, 2459, 2460, 2461, 2462,
          2463, 114, 2464, 493, 1146, 366, 163, 1516, 961, 1104, 2465, 291,
          2466, 1318, 1105, 2467, 1517, 365, 2468, 355, 951, 1244, 2469, 1319,
          2470, 631, 2471, 2472, 218, 1320, 364, 320, 756, 1518, 1519, 1321,
          1520, 1322, 2473, 2474, 2475, 2476, 997, 2477, 2478, 2479, 2480, 665,
          1185, 2481, 916, 1521, 2482, 2483, 2484, 584, 684, 2485, 2486, 797,
          2487, 1051, 1186, 2488, 2489, 2490, 1522, 2491, 2492, 370, 2493, 1039,
          1187, 65, 2494, 434, 205, 463, 1188, 2495, 125, 812, 391, 402, 826,
          699, 286, 398, 155, 781, 771, 585, 2496, 590, 505, 1073, 2497, 599,
          244, 219, 917, 1018, 952, 646, 1523, 2498, 1323, 2499, 2500, 49, 984,
          354, 741, 2501, 625, 2502, 1324, 2503, 1019, 190, 357, 757, 491, 95,
          782, 868, 2504, 2505, 2506, 2507, 2508, 2509, 134, 1524, 1074, 422,
          1525, 898, 2510, 161, 2511, 2512, 2513, 2514, 769, 2515, 1526, 2516,
          2517, 411, 1325, 2518, 472, 1527, 2519, 2520, 2521, 2522, 2523, 2524,
          985, 2525, 2526, 2527, 2528, 2529, 2530, 764, 2531, 1245, 2532, 2533,
          25, 204, 311, 2534, 496, 2535, 1052, 2536, 2537, 2538, 2539, 2540,
          2541, 2542, 199, 704, 504, 468, 758, 657, 1528, 196, 44, 839, 1246,
          272, 750, 2543, 765, 862, 2544, 2545, 1326, 2546, 132, 615, 933, 2547,
          732, 2548, 2549, 2550, 1189, 1529, 2551, 283, 1247, 1053, 607, 929,
          2552, 2553, 2554, 930, 183, 872, 616, 1040, 1147, 2555, 1148, 1020,
          441, 249, 1075, 2556, 2557, 2558, 466, 743, 2559, 2560, 2561, 92, 514,
          426, 420, 526, 2562, 2563, 2564, 2565, 2566, 2567, 2568, 185, 2569,
          2570, 2571, 2572, 776, 1530, 658, 2573, 362, 2574, 361, 922, 1076,
          793, 2575, 2576, 2577, 2578, 2579, 2580, 1531, 251, 2581, 2582, 2583,
          2584, 1532, 54, 612, 237, 1327, 2585, 2586, 275, 408, 647, 111, 2587,
          1533, 1106, 465, 3, 458, 9, 38, 2588, 107, 110, 890, 209, 26, 737,
          498, 2589, 1534, 2590, 431, 202, 88, 1535, 356, 287, 1107, 660, 1149,
          2591, 381, 1536, 986, 1150, 445, 1248, 1151, 974, 2592, 2593, 846,
          2594, 446, 953, 184, 1249, 1250, 727, 2595, 923, 193, 883, 2596, 2597,
          2598, 102, 324, 539, 817, 2599, 421, 1041, 2600, 832, 2601, 94, 175,
          197, 406, 2602, 459, 2603, 2604, 2605, 2606, 2607, 330, 555, 2608,
          2609, 2610, 706, 1108, 389, 2611, 2612, 2613, 2614, 233, 2615, 833,
          558, 931, 954, 1251, 2616, 2617, 1537, 546, 2618, 2619, 1009, 2620,
          2621, 2622, 1538, 690, 1328, 2623, 955, 2624, 1539, 2625, 2626, 772,
          2627, 2628, 2629, 2630, 2631, 924, 648, 863, 603, 2632, 2633, 934,
          1540, 864, 865, 2634, 642, 1042, 670, 1190, 2635, 2636, 2637, 2638,
          168, 2639, 652, 873, 542, 1054, 1541, 2640, 2641, 2642, 2643, 2644,
          2645, 2646, 2647, 2648, 2649, 2650, 2651, 2652, 2653, 2654, 2655,
          2656, 2657, 2658, 2659, 2660, 2661, 2662, 2663, 2664, 2665, 2666,
          2667, 2668, 2669, 2670, 2671, 2672, 2673, 2674, 2675, 2676, 2677,
          2678, 2679, 2680, 2681, 2682, 2683, 2684, 2685, 2686, 2687, 2688,
          2689, 2690, 2691, 2692, 2693, 2694, 2695, 2696, 2697, 2698, 2699,
          1542, 880, 2700, 2701, 2702, 2703, 2704, 2705, 2706, 2707, 2708, 2709,
          2710, 2711, 2712, 2713, 2714, 2715, 2716, 2717, 2718, 2719, 2720,
          2721, 2722, 2723, 2724, 2725, 1543, 2726, 2727, 2728, 2729, 2730,
          2731, 2732, 1544, 2733, 2734, 2735, 2736, 2737, 2738, 2739, 2740,
          2741, 2742, 2743, 2744, 2745, 2746, 2747, 2748, 2749, 2750, 2751,
          2752, 2753, 2754, 1545, 2755, 2756, 2757, 2758, 2759, 2760, 2761,
          2762, 2763, 2764, 2765, 2766, 1546, 2767, 1547, 2768, 2769, 2770,
          2771, 2772, 2773, 2774, 2775, 2776, 2777, 2778, 2779, 2780, 2781,
          2782, 2783, 2784, 2785, 2786, 1548, 2787, 2788, 2789, 1109, 2790,
          2791, 2792, 2793, 2794, 2795, 2796, 2797, 2798, 2799, 2800, 2801,
          2802, 2803, 2804, 2805, 2806, 2807, 2808, 2809, 2810, 2811, 2812,
          1329, 2813, 2814, 2815, 2816, 2817, 2818, 2819, 2820, 2821, 2822,
          2823, 2824, 2825, 2826, 2827, 2828, 2829, 2830, 2831, 2832, 2833,
          2834, 2835, 2836, 2837, 2838, 2839, 2840, 2841, 2842, 2843, 2844,
          2845, 2846, 2847, 2848, 2849, 2850, 2851, 2852, 2853, 2854, 2855,
          2856, 1549, 2857, 2858, 2859, 2860, 1550, 2861, 2862, 1551, 2863,
          2864, 2865, 2866, 2867, 2868, 2869, 2870, 2871, 2872, 2873, 2874,
          1110, 1330, 2875, 2876, 2877, 2878, 2879, 2880, 2881, 2882, 2883,
          2884, 2885, 2886, 2887, 2888, 2889, 2890, 2891, 2892, 2893, 2894,
          2895, 2896, 2897, 2898, 2899, 2900, 2901, 2902, 2903, 2904, 2905,
          2906, 2907, 2908, 2909, 2910, 2911, 2912, 2913, 2914, 2915, 2916,
          2917, 2918, 2919, 2920, 2921, 2922, 2923, 2924, 2925, 2926, 2927,
          2928, 2929, 2930, 1331, 2931, 2932, 2933, 2934, 2935, 2936, 2937,
          2938, 2939, 2940, 2941, 2942, 2943, 1552, 2944, 2945, 2946, 2947,
          2948, 2949, 2950, 2951, 2952, 2953, 2954, 2955, 2956, 2957, 2958,
          2959, 2960, 2961, 2962, 2963, 2964, 1252, 2965, 2966, 2967, 2968,
          2969, 2970, 2971, 2972, 2973, 2974, 2975, 2976, 2977, 2978, 2979,
          2980, 2981, 2982, 2983, 2984, 2985, 2986, 2987, 2988, 2989, 2990,
          2991, 2992, 2993, 2994, 2995, 2996, 2997, 2998, 2999, 3e3, 3001, 3002,
          3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 1553,
          3013, 3014, 3015, 3016, 3017, 1554, 3018, 1332, 3019, 3020, 3021,
          3022, 3023, 3024, 3025, 3026, 3027, 3028, 3029, 3030, 3031, 3032,
          3033, 3034, 3035, 3036, 3037, 3038, 3039, 3040, 3041, 3042, 3043,
          3044, 3045, 3046, 3047, 3048, 3049, 3050, 1555, 3051, 3052, 3053,
          1556, 1557, 3054, 3055, 3056, 3057, 3058, 3059, 3060, 3061, 3062,
          3063, 3064, 3065, 3066, 3067, 1558, 3068, 3069, 3070, 3071, 3072,
          3073, 3074, 3075, 3076, 1559, 3077, 3078, 3079, 3080, 3081, 3082,
          3083, 1253, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3091, 3092,
          3093, 3094, 3095, 3096, 3097, 3098, 3099, 3100, 3101, 3102, 3103,
          3104, 3105, 3106, 3107, 3108, 1152, 3109, 3110, 3111, 3112, 3113,
          1560, 3114, 3115, 3116, 3117, 1111, 3118, 3119, 3120, 3121, 3122,
          3123, 3124, 3125, 3126, 3127, 3128, 3129, 3130, 3131, 3132, 3133,
          3134, 3135, 3136, 3137, 3138, 3139, 3140, 3141, 3142, 3143, 3144,
          3145, 3146, 3147, 3148, 3149, 3150, 3151, 3152, 3153, 3154, 3155,
          3156, 3157, 3158, 3159, 3160, 3161, 3162, 3163, 3164, 3165, 3166,
          3167, 3168, 3169, 3170, 3171, 3172, 3173, 3174, 3175, 3176, 1333,
          3177, 3178, 3179, 3180, 3181, 3182, 3183, 3184, 3185, 3186, 3187,
          3188, 3189, 1561, 3190, 3191, 1334, 3192, 3193, 3194, 3195, 3196,
          3197, 3198, 3199, 3200, 3201, 3202, 3203, 3204, 3205, 3206, 3207,
          3208, 3209, 3210, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218,
          3219, 3220, 3221, 3222, 3223, 3224, 3225, 3226, 3227, 3228, 3229,
          3230, 3231, 3232, 3233, 3234, 1562, 3235, 3236, 3237, 3238, 3239,
          3240, 3241, 3242, 3243, 3244, 3245, 3246, 3247, 3248, 3249, 3250,
          3251, 3252, 3253, 3254, 3255, 3256, 3257, 3258, 3259, 3260, 3261,
          3262, 3263, 3264, 3265, 3266, 3267, 3268, 3269, 3270, 3271, 3272,
          3273, 3274, 3275, 3276, 3277, 1563, 3278, 3279, 3280, 3281, 3282,
          3283, 3284, 3285, 3286, 3287, 3288, 3289, 3290, 3291, 3292, 3293,
          3294, 3295, 3296, 3297, 3298, 3299, 3300, 3301, 3302, 3303, 3304,
          3305, 3306, 3307, 3308, 3309, 3310, 3311, 3312, 3313, 3314, 3315,
          3316, 3317, 3318, 3319, 3320, 3321, 3322, 3323, 3324, 3325, 3326,
          3327, 3328, 3329, 3330, 3331, 3332, 3333, 3334, 3335, 3336, 3337,
          3338, 3339, 3340, 3341, 3342, 3343, 3344, 3345, 3346, 3347, 3348,
          3349, 3350, 3351, 3352, 3353, 3354, 3355, 3356, 3357, 3358, 3359,
          3360, 3361, 3362, 3363, 3364, 1335, 3365, 3366, 3367, 3368, 3369,
          3370, 3371, 3372, 3373, 3374, 3375, 3376, 3377, 3378, 3379, 3380,
          3381, 3382, 3383, 3384, 3385, 3386, 3387, 1336, 3388, 3389, 3390,
          3391, 3392, 3393, 3394, 3395, 3396, 3397, 3398, 3399, 3400, 3401,
          3402, 3403, 3404, 3405, 3406, 3407, 3408, 3409, 3410, 3411, 3412,
          3413, 3414, 1337, 3415, 3416, 3417, 3418, 3419, 1338, 3420, 3421,
          3422, 1564, 1565, 3423, 3424, 3425, 3426, 3427, 3428, 3429, 3430,
          3431, 1254, 3432, 3433, 3434, 1339, 3435, 3436, 3437, 3438, 3439,
          1566, 3440, 3441, 3442, 3443, 3444, 3445, 3446, 3447, 3448, 3449,
          3450, 3451, 3452, 3453, 3454, 1255, 3455, 3456, 3457, 3458, 3459,
          1567, 1191, 3460, 1568, 1569, 3461, 3462, 3463, 1570, 3464, 3465,
          3466, 3467, 3468, 1571, 3469, 3470, 3471, 3472, 3473, 1572, 3474,
          3475, 3476, 3477, 3478, 3479, 3480, 3481, 3482, 3483, 3484, 3485,
          3486, 1340, 3487, 3488, 3489, 3490, 3491, 3492, 1021, 3493, 3494,
          3495, 3496, 3497, 3498, 1573, 3499, 1341, 3500, 3501, 3502, 3503,
          3504, 3505, 3506, 3507, 3508, 3509, 3510, 3511, 1342, 3512, 3513,
          3514, 3515, 3516, 1574, 1343, 3517, 3518, 3519, 1575, 3520, 1576,
          3521, 3522, 3523, 3524, 3525, 3526, 3527, 3528, 3529, 3530, 3531,
          3532, 3533, 3534, 3535, 3536, 3537, 3538, 3539, 3540, 3541, 3542,
          3543, 3544, 3545, 3546, 3547, 3548, 3549, 3550, 3551, 3552, 3553,
          3554, 3555, 3556, 3557, 3558, 3559, 3560, 3561, 3562, 3563, 3564,
          3565, 3566, 3567, 3568, 3569, 3570, 3571, 3572, 3573, 3574, 3575,
          3576, 3577, 3578, 3579, 3580, 1577, 3581, 3582, 1578, 3583, 3584,
          3585, 3586, 3587, 3588, 3589, 3590, 3591, 3592, 3593, 3594, 3595,
          3596, 3597, 3598, 3599, 3600, 3601, 3602, 3603, 3604, 1579, 3605,
          3606, 3607, 3608, 3609, 3610, 3611, 3612, 3613, 3614, 3615, 3616,
          3617, 3618, 3619, 3620, 3621, 3622, 3623, 3624, 3625, 3626, 3627,
          3628, 3629, 1580, 3630, 3631, 1581, 3632, 3633, 3634, 3635, 3636,
          3637, 3638, 3639, 3640, 3641, 3642, 3643, 3644, 3645, 3646, 3647,
          3648, 3649, 3650, 3651, 3652, 3653, 3654, 3655, 3656, 1582, 3657,
          3658, 3659, 3660, 3661, 3662, 3663, 3664, 3665, 3666, 3667, 3668,
          3669, 3670, 3671, 3672, 3673, 3674, 3675, 3676, 3677, 3678, 3679,
          3680, 3681, 3682, 3683, 3684, 3685, 3686, 3687, 3688, 3689, 3690,
          3691, 3692, 3693, 3694, 3695, 3696, 3697, 3698, 3699, 3700, 1192,
          3701, 3702, 3703, 3704, 1256, 3705, 3706, 3707, 3708, 1583, 1257,
          3709, 3710, 3711, 3712, 3713, 3714, 3715, 3716, 1584, 3717, 3718,
          3719, 3720, 3721, 3722, 3723, 3724, 3725, 3726, 3727, 3728, 3729,
          3730, 3731, 3732, 3733, 3734, 3735, 3736, 3737, 3738, 3739, 3740,
          3741, 3742, 3743, 3744, 3745, 1344, 3746, 3747, 3748, 3749, 3750,
          3751, 3752, 3753, 3754, 3755, 3756, 1585, 3757, 3758, 3759, 3760,
          3761, 3762, 3763, 3764, 3765, 3766, 1586, 3767, 3768, 3769, 3770,
          3771, 3772, 3773, 3774, 3775, 3776, 3777, 3778, 1345, 3779, 3780,
          3781, 3782, 3783, 3784, 3785, 3786, 3787, 3788, 3789, 3790, 3791,
          3792, 3793, 3794, 3795, 1346, 1587, 3796, 3797, 1588, 3798, 3799,
          3800, 3801, 3802, 3803, 3804, 3805, 3806, 1347, 3807, 3808, 3809,
          3810, 3811, 1589, 3812, 3813, 3814, 3815, 3816, 3817, 3818, 3819,
          3820, 3821, 1590, 3822, 3823, 1591, 1348, 3824, 3825, 3826, 3827,
          3828, 3829, 3830, 1592, 3831, 3832, 1593, 3833, 3834, 3835, 3836,
          3837, 3838, 3839, 3840, 3841, 3842, 3843, 3844, 1349, 3845, 3846,
          3847, 3848, 3849, 3850, 3851, 3852, 3853, 3854, 3855, 3856, 3857,
          3858, 1594, 3859, 3860, 3861, 3862, 3863, 3864, 3865, 3866, 3867,
          3868, 3869, 1595, 3870, 3871, 3872, 3873, 1596, 3874, 3875, 3876,
          3877, 3878, 3879, 3880, 3881, 3882, 3883, 3884, 3885, 3886, 1597,
          3887, 3888, 3889, 3890, 3891, 3892, 3893, 3894, 3895, 1598, 3896,
          3897, 3898, 1599, 1600, 3899, 1350, 3900, 1351, 3901, 3902, 1352,
          3903, 3904, 3905, 3906, 3907, 3908, 3909, 3910, 3911, 3912, 3913,
          3914, 3915, 3916, 3917, 3918, 3919, 3920, 3921, 3922, 3923, 3924,
          1258, 3925, 3926, 3927, 3928, 3929, 3930, 3931, 1193, 3932, 1601,
          3933, 3934, 3935, 3936, 3937, 3938, 3939, 3940, 3941, 3942, 3943,
          1602, 3944, 3945, 3946, 3947, 3948, 1603, 3949, 3950, 3951, 3952,
          3953, 3954, 3955, 3956, 3957, 3958, 3959, 3960, 3961, 3962, 3963,
          3964, 3965, 1604, 3966, 3967, 3968, 3969, 3970, 3971, 3972, 3973,
          3974, 3975, 3976, 3977, 1353, 3978, 3979, 3980, 3981, 3982, 3983,
          3984, 3985, 3986, 3987, 3988, 3989, 3990, 3991, 1354, 3992, 3993,
          3994, 3995, 3996, 3997, 3998, 3999, 4e3, 4001, 4002, 4003, 4004, 4005,
          4006, 4007, 4008, 4009, 4010, 4011, 4012, 4013, 4014, 4015, 4016,
          4017, 4018, 4019, 4020, 4021, 4022, 4023, 1355, 4024, 4025, 4026,
          4027, 4028, 4029, 4030, 4031, 4032, 4033, 4034, 4035, 4036, 4037,
          4038, 4039, 4040, 1605, 4041, 4042, 4043, 4044, 4045, 4046, 4047,
          4048, 4049, 4050, 4051, 4052, 4053, 4054, 4055, 4056, 4057, 4058,
          4059, 4060, 1606, 4061, 4062, 4063, 4064, 1607, 4065, 4066, 4067,
          4068, 4069, 4070, 4071, 4072, 4073, 4074, 4075, 4076, 1194, 4077,
          4078, 1608, 4079, 4080, 4081, 4082, 4083, 4084, 4085, 4086, 4087,
          1609, 4088, 4089, 4090, 4091, 4092, 4093, 4094, 4095, 4096, 4097,
          4098, 4099, 4100, 4101, 4102, 4103, 4104, 4105, 4106, 4107, 4108,
          1259, 4109, 4110, 4111, 4112, 4113, 4114, 4115, 4116, 4117, 4118,
          4119, 4120, 4121, 4122, 4123, 4124, 1195, 4125, 4126, 4127, 1610,
          4128, 4129, 4130, 4131, 4132, 4133, 4134, 4135, 4136, 4137, 1356,
          4138, 4139, 4140, 4141, 4142, 4143, 4144, 1611, 4145, 4146, 4147,
          4148, 4149, 4150, 4151, 4152, 4153, 4154, 4155, 4156, 4157, 4158,
          4159, 4160, 4161, 4162, 4163, 4164, 4165, 4166, 4167, 4168, 4169,
          4170, 4171, 4172, 4173, 4174, 4175, 4176, 4177, 4178, 4179, 4180,
          4181, 4182, 4183, 4184, 4185, 4186, 4187, 4188, 4189, 4190, 4191,
          4192, 4193, 4194, 4195, 4196, 4197, 4198, 4199, 4200, 4201, 4202,
          4203, 4204, 4205, 4206, 4207, 4208, 4209, 4210, 4211, 4212, 4213,
          4214, 4215, 4216, 4217, 4218, 4219, 1612, 4220, 4221, 4222, 4223,
          4224, 4225, 4226, 4227, 1357, 4228, 1613, 4229, 4230, 4231, 4232,
          4233, 4234, 4235, 4236, 4237, 4238, 4239, 4240, 4241, 4242, 4243,
          1614, 4244, 4245, 4246, 4247, 4248, 4249, 4250, 4251, 4252, 4253,
          4254, 4255, 4256, 4257, 4258, 4259, 4260, 4261, 4262, 4263, 4264,
          4265, 4266, 4267, 4268, 4269, 4270, 1196, 1358, 4271, 4272, 4273,
          4274, 4275, 4276, 4277, 4278, 4279, 4280, 4281, 4282, 4283, 4284,
          4285, 4286, 4287, 1615, 4288, 4289, 4290, 4291, 4292, 4293, 4294,
          4295, 4296, 4297, 4298, 4299, 4300, 4301, 4302, 4303, 4304, 4305,
          4306, 4307, 4308, 4309, 4310, 4311, 4312, 4313, 4314, 4315, 4316,
          4317, 4318, 4319, 4320, 4321, 4322, 4323, 4324, 4325, 4326, 4327,
          4328, 4329, 4330, 4331, 4332, 4333, 4334, 1616, 4335, 4336, 4337,
          4338, 4339, 4340, 4341, 4342, 4343, 4344, 4345, 4346, 4347, 4348,
          4349, 4350, 4351, 4352, 4353, 4354, 4355, 4356, 4357, 4358, 4359,
          4360, 1617, 4361, 4362, 4363, 4364, 4365, 1618, 4366, 4367, 4368,
          4369, 4370, 4371, 4372, 4373, 4374, 4375, 4376, 4377, 4378, 4379,
          4380, 4381, 4382, 4383, 4384, 4385, 4386, 4387, 4388, 4389, 4390,
          4391, 4392, 4393, 4394, 4395, 4396, 4397, 4398, 4399, 4400, 4401,
          4402, 4403, 4404, 4405, 4406, 4407, 4408, 4409, 4410, 4411, 4412,
          4413, 4414, 4415, 4416, 1619, 4417, 4418, 4419, 4420, 4421, 4422,
          4423, 4424, 4425, 1112, 4426, 4427, 4428, 4429, 4430, 1620, 4431,
          4432, 4433, 4434, 4435, 4436, 4437, 4438, 4439, 4440, 4441, 4442,
          1260, 1261, 4443, 4444, 4445, 4446, 4447, 4448, 4449, 4450, 4451,
          4452, 4453, 4454, 4455, 1359, 4456, 4457, 4458, 4459, 4460, 4461,
          4462, 4463, 4464, 4465, 1621, 4466, 4467, 4468, 4469, 4470, 4471,
          4472, 4473, 4474, 4475, 4476, 4477, 4478, 4479, 4480, 4481, 4482,
          4483, 4484, 4485, 4486, 4487, 4488, 4489, 1055, 4490, 4491, 4492,
          4493, 4494, 4495, 4496, 4497, 4498, 4499, 4500, 4501, 4502, 4503,
          4504, 4505, 4506, 4507, 4508, 4509, 4510, 4511, 4512, 4513, 4514,
          4515, 4516, 4517, 4518, 1622, 4519, 4520, 4521, 1623, 4522, 4523,
          4524, 4525, 4526, 4527, 4528, 4529, 4530, 4531, 4532, 4533, 4534,
          4535, 1360, 4536, 4537, 4538, 4539, 4540, 4541, 4542, 4543, 975, 4544,
          4545, 4546, 4547, 4548, 4549, 4550, 4551, 4552, 4553, 4554, 4555,
          4556, 4557, 4558, 4559, 4560, 4561, 4562, 4563, 4564, 4565, 4566,
          4567, 4568, 4569, 4570, 4571, 1624, 4572, 4573, 4574, 4575, 4576,
          1625, 4577, 4578, 4579, 4580, 4581, 4582, 4583, 4584, 1626, 4585,
          4586, 4587, 4588, 4589, 4590, 4591, 4592, 4593, 4594, 4595, 1627,
          4596, 4597, 4598, 4599, 4600, 4601, 4602, 4603, 4604, 4605, 4606,
          4607, 4608, 4609, 4610, 4611, 4612, 4613, 4614, 4615, 1628, 4616,
          4617, 4618, 4619, 4620, 4621, 4622, 4623, 4624, 4625, 4626, 4627,
          4628, 4629, 4630, 4631, 4632, 4633, 4634, 4635, 4636, 4637, 4638,
          4639, 4640, 4641, 4642, 4643, 4644, 4645, 4646, 4647, 4648, 4649,
          1361, 4650, 4651, 4652, 4653, 4654, 4655, 4656, 4657, 4658, 4659,
          4660, 4661, 1362, 4662, 4663, 4664, 4665, 4666, 4667, 4668, 4669,
          4670, 4671, 4672, 4673, 4674, 4675, 4676, 4677, 4678, 4679, 4680,
          4681, 4682, 1629, 4683, 4684, 4685, 4686, 4687, 1630, 4688, 4689,
          4690, 4691, 1153, 4692, 4693, 4694, 1113, 4695, 4696, 4697, 4698,
          4699, 4700, 4701, 4702, 4703, 4704, 4705, 4706, 4707, 4708, 4709,
          4710, 4711, 1197, 4712, 4713, 4714, 4715, 4716, 4717, 4718, 4719,
          4720, 4721, 4722, 4723, 4724, 4725, 4726, 4727, 4728, 4729, 4730,
          4731, 4732, 4733, 4734, 4735, 1631, 4736, 1632, 4737, 4738, 4739,
          4740, 4741, 4742, 4743, 4744, 1633, 4745, 4746, 4747, 4748, 4749,
          1262, 4750, 4751, 4752, 4753, 4754, 1363, 4755, 4756, 4757, 4758,
          4759, 4760, 4761, 4762, 4763, 4764, 4765, 4766, 4767, 4768, 1634,
          4769, 4770, 4771, 4772, 4773, 4774, 4775, 4776, 4777, 4778, 1635,
          4779, 4780, 4781, 4782, 4783, 4784, 4785, 4786, 4787, 4788, 4789,
          1636, 4790, 4791, 4792, 4793, 4794, 4795, 4796, 4797, 4798, 4799,
          4800, 4801, 4802, 4803, 4804, 4805, 4806, 1637, 4807, 4808, 4809,
          1638, 4810, 4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 1639,
          4819, 4820, 4821, 4822, 4823, 4824, 4825, 4826, 4827, 4828, 4829,
          4830, 4831, 4832, 4833, 1077, 4834, 4835, 4836, 4837, 4838, 4839,
          4840, 4841, 4842, 4843, 4844, 4845, 4846, 4847, 4848, 4849, 4850,
          4851, 4852, 4853, 4854, 4855, 4856, 4857, 4858, 4859, 4860, 4861,
          4862, 4863, 4864, 4865, 4866, 4867, 4868, 4869, 4870, 4871, 4872,
          4873, 4874, 4875, 4876, 4877, 4878, 4879, 4880, 4881, 4882, 4883,
          1640, 4884, 4885, 1641, 4886, 4887, 4888, 4889, 4890, 4891, 4892,
          4893, 4894, 4895, 4896, 4897, 4898, 4899, 4900, 4901, 4902, 4903,
          4904, 4905, 4906, 4907, 4908, 4909, 4910, 4911, 1642, 4912, 4913,
          4914, 1364, 4915, 4916, 4917, 4918, 4919, 4920, 4921, 4922, 4923,
          4924, 4925, 4926, 4927, 4928, 4929, 4930, 4931, 1643, 4932, 4933,
          4934, 4935, 4936, 4937, 4938, 4939, 4940, 4941, 4942, 4943, 4944,
          4945, 4946, 4947, 4948, 4949, 4950, 4951, 4952, 4953, 4954, 4955,
          4956, 4957, 4958, 4959, 4960, 4961, 4962, 4963, 4964, 4965, 4966,
          4967, 4968, 4969, 4970, 4971, 4972, 4973, 4974, 4975, 4976, 4977,
          4978, 4979, 4980, 1644, 4981, 4982, 4983, 4984, 1645, 4985, 4986,
          1646, 4987, 4988, 4989, 4990, 4991, 4992, 4993, 4994, 4995, 4996,
          4997, 4998, 4999, 5e3, 5001, 5002, 5003, 5004, 5005, 1647, 5006, 1648,
          5007, 5008, 5009, 5010, 5011, 5012, 1078, 5013, 5014, 5015, 5016,
          5017, 5018, 5019, 5020, 5021, 5022, 5023, 5024, 5025, 5026, 5027,
          5028, 1365, 5029, 5030, 5031, 5032, 5033, 5034, 5035, 5036, 5037,
          5038, 5039, 1649, 5040, 5041, 5042, 5043, 5044, 5045, 1366, 5046,
          5047, 5048, 5049, 5050, 5051, 5052, 5053, 5054, 5055, 1650, 5056,
          5057, 5058, 5059, 5060, 5061, 5062, 5063, 5064, 5065, 5066, 5067,
          5068, 5069, 5070, 5071, 5072, 5073, 5074, 5075, 5076, 5077, 1651,
          5078, 5079, 5080, 5081, 5082, 5083, 5084, 5085, 5086, 5087, 5088,
          5089, 5090, 5091, 5092, 5093, 5094, 5095, 5096, 5097, 5098, 5099,
          5100, 5101, 5102, 5103, 5104, 5105, 5106, 5107, 5108, 5109, 5110,
          1652, 5111, 5112, 5113, 5114, 5115, 5116, 5117, 5118, 1367, 5119,
          5120, 5121, 5122, 5123, 5124, 5125, 5126, 5127, 5128, 5129, 1653,
          5130, 5131, 5132, 5133, 5134, 5135, 5136, 5137, 5138, 5139, 5140,
          5141, 5142, 5143, 5144, 5145, 5146, 5147, 5148, 5149, 1368, 5150,
          1654, 5151, 1369, 5152, 5153, 5154, 5155, 5156, 5157, 5158, 5159,
          5160, 5161, 5162, 5163, 5164, 5165, 5166, 5167, 5168, 5169, 5170,
          5171, 5172, 5173, 5174, 5175, 5176, 5177, 5178, 1370, 5179, 5180,
          5181, 5182, 5183, 5184, 5185, 5186, 5187, 5188, 5189, 5190, 5191,
          5192, 5193, 5194, 5195, 5196, 5197, 5198, 1655, 5199, 5200, 5201,
          5202, 1656, 5203, 5204, 5205, 5206, 1371, 5207, 1372, 5208, 5209,
          5210, 5211, 1373, 5212, 5213, 1374, 5214, 5215, 5216, 5217, 5218,
          5219, 5220, 5221, 5222, 5223, 5224, 5225, 5226, 5227, 5228, 5229,
          5230, 5231, 5232, 5233, 5234, 5235, 5236, 5237, 5238, 5239, 5240,
          5241, 5242, 5243, 5244, 5245, 5246, 5247, 1657, 5248, 5249, 5250,
          5251, 1658, 1263, 5252, 5253, 5254, 5255, 5256, 1375, 5257, 5258,
          5259, 5260, 5261, 5262, 5263, 5264, 5265, 5266, 5267, 5268, 5269,
          5270, 5271, 5272, 5273, 5274, 5275, 5276, 5277, 5278, 5279, 5280,
          5281, 5282, 5283, 1659, 5284, 5285, 5286, 5287, 5288, 5289, 5290,
          5291, 5292, 5293, 5294, 5295, 5296, 5297, 5298, 5299, 5300, 1660,
          5301, 5302, 5303, 5304, 5305, 5306, 5307, 5308, 5309, 5310, 5311,
          5312, 5313, 5314, 5315, 5316, 5317, 5318, 5319, 5320, 5321, 1376,
          5322, 5323, 5324, 5325, 5326, 5327, 5328, 5329, 5330, 5331, 5332,
          5333, 1198, 5334, 5335, 5336, 5337, 5338, 5339, 5340, 5341, 5342,
          5343, 1661, 5344, 5345, 5346, 5347, 5348, 5349, 5350, 5351, 5352,
          5353, 5354, 5355, 5356, 5357, 5358, 5359, 5360, 5361, 5362, 5363,
          5364, 5365, 5366, 5367, 5368, 5369, 5370, 5371, 5372, 5373, 5374,
          5375, 5376, 5377, 5378, 5379, 5380, 5381, 5382, 5383, 5384, 5385,
          5386, 5387, 5388, 5389, 5390, 5391, 5392, 5393, 5394, 5395, 5396,
          5397, 5398, 1264, 5399, 5400, 5401, 5402, 5403, 5404, 5405, 5406,
          5407, 5408, 5409, 5410, 5411, 5412, 1662, 5413, 5414, 5415, 5416,
          1663, 5417, 5418, 5419, 5420, 5421, 5422, 5423, 5424, 5425, 5426,
          5427, 5428, 5429, 5430, 5431, 5432, 5433, 5434, 5435, 5436, 5437,
          5438, 1664, 5439, 5440, 5441, 5442, 5443, 5444, 5445, 5446, 5447,
          5448, 5449, 5450, 5451, 5452, 5453, 5454, 5455, 5456, 5457, 5458,
          5459, 5460, 5461, 5462, 5463, 5464, 5465, 5466, 5467, 5468, 5469,
          5470, 5471, 5472, 5473, 5474, 5475, 5476, 5477, 5478, 1154, 5479,
          5480, 5481, 5482, 5483, 5484, 5485, 1665, 5486, 5487, 5488, 5489,
          5490, 5491, 5492, 5493, 5494, 5495, 5496, 5497, 5498, 5499, 5500,
          5501, 5502, 5503, 5504, 5505, 5506, 5507, 5508, 5509, 5510, 5511,
          5512, 5513, 5514, 5515, 5516, 5517, 5518, 5519, 5520, 5521, 5522,
          5523, 5524, 5525, 5526, 5527, 5528, 5529, 5530, 5531, 5532, 5533,
          5534, 5535, 5536, 5537, 5538, 5539, 5540, 5541, 5542, 5543, 5544,
          5545, 5546, 5547, 5548, 1377, 5549, 5550, 5551, 5552, 5553, 5554,
          5555, 5556, 5557, 5558, 5559, 5560, 5561, 5562, 5563, 5564, 5565,
          5566, 5567, 5568, 5569, 5570, 1114, 5571, 5572, 5573, 5574, 5575,
          5576, 5577, 5578, 5579, 5580, 5581, 5582, 5583, 5584, 5585, 5586,
          5587, 5588, 5589, 5590, 5591, 5592, 1378, 5593, 5594, 5595, 5596,
          5597, 5598, 5599, 5600, 5601, 5602, 5603, 5604, 5605, 5606, 5607,
          5608, 5609, 5610, 5611, 5612, 5613, 5614, 1379, 5615, 5616, 5617,
          5618, 5619, 5620, 5621, 5622, 5623, 5624, 5625, 5626, 5627, 5628,
          5629, 5630, 5631, 5632, 5633, 5634, 1380, 5635, 5636, 5637, 5638,
          5639, 5640, 5641, 5642, 5643, 5644, 5645, 5646, 5647, 5648, 5649,
          1381, 1056, 5650, 5651, 5652, 5653, 5654, 5655, 5656, 5657, 5658,
          5659, 5660, 1666, 5661, 5662, 5663, 5664, 5665, 5666, 5667, 5668,
          1667, 5669, 1668, 5670, 5671, 5672, 5673, 5674, 5675, 5676, 5677,
          5678, 1155, 5679, 5680, 5681, 5682, 5683, 5684, 5685, 5686, 5687,
          5688, 5689, 5690, 5691, 5692, 5693, 5694, 5695, 5696, 5697, 5698,
          1669, 5699, 5700, 5701, 5702, 5703, 5704, 5705, 1670, 5706, 5707,
          5708, 5709, 5710, 1671, 5711, 5712, 5713, 5714, 1382, 5715, 5716,
          5717, 5718, 5719, 5720, 5721, 5722, 5723, 5724, 5725, 1672, 5726,
          5727, 1673, 1674, 5728, 5729, 5730, 5731, 5732, 5733, 5734, 5735,
          5736, 1675, 5737, 5738, 5739, 5740, 5741, 5742, 5743, 5744, 1676,
          5745, 5746, 5747, 5748, 5749, 5750, 5751, 1383, 5752, 5753, 5754,
          5755, 5756, 5757, 5758, 5759, 5760, 5761, 5762, 5763, 5764, 5765,
          5766, 5767, 5768, 1677, 5769, 5770, 5771, 5772, 5773, 1678, 5774,
          5775, 5776, 998, 5777, 5778, 5779, 5780, 5781, 5782, 5783, 5784, 5785,
          1384, 5786, 5787, 5788, 5789, 5790, 5791, 5792, 5793, 5794, 5795,
          5796, 5797, 5798, 5799, 5800, 1679, 5801, 5802, 5803, 1115, 1116,
          5804, 5805, 5806, 5807, 5808, 5809, 5810, 5811, 5812, 5813, 5814,
          5815, 5816, 5817, 5818, 5819, 5820, 5821, 5822, 5823, 5824, 5825,
          5826, 5827, 5828, 5829, 5830, 5831, 5832, 5833, 5834, 5835, 5836,
          5837, 5838, 5839, 5840, 5841, 5842, 5843, 5844, 5845, 5846, 5847,
          5848, 5849, 5850, 5851, 5852, 5853, 5854, 5855, 1680, 5856, 5857,
          5858, 5859, 5860, 5861, 5862, 5863, 5864, 1681, 5865, 5866, 5867,
          1682, 5868, 5869, 5870, 5871, 5872, 5873, 5874, 5875, 5876, 5877,
          5878, 5879, 1683, 5880, 1684, 5881, 5882, 5883, 5884, 1685, 5885,
          5886, 5887, 5888, 5889, 5890, 5891, 5892, 5893, 5894, 5895, 5896,
          5897, 5898, 5899, 5900, 5901, 5902, 5903, 5904, 5905, 5906, 5907,
          1686, 5908, 5909, 5910, 5911, 5912, 5913, 5914, 5915, 5916, 5917,
          5918, 5919, 5920, 5921, 5922, 5923, 5924, 5925, 5926, 5927, 5928,
          5929, 5930, 5931, 5932, 5933, 5934, 5935, 1687, 5936, 5937, 5938,
          5939, 5940, 5941, 5942, 5943, 5944, 5945, 5946, 5947, 5948, 5949,
          5950, 5951, 5952, 1688, 1689, 5953, 1199, 5954, 5955, 5956, 5957,
          5958, 5959, 5960, 5961, 1690, 5962, 5963, 5964, 5965, 5966, 5967,
          5968, 5969, 5970, 5971, 5972, 5973, 5974, 5975, 5976, 5977, 5978,
          5979, 5980, 5981, 1385, 5982, 1386, 5983, 5984, 5985, 5986, 5987,
          5988, 5989, 5990, 5991, 5992, 5993, 5994, 5995, 5996, 5997, 5998,
          5999, 6e3, 6001, 6002, 6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010,
          6011, 6012, 6013, 6014, 6015, 6016, 6017, 6018, 6019, 6020, 6021,
          6022, 6023, 6024, 6025, 6026, 6027, 1265, 6028, 6029, 1691, 6030,
          6031, 6032, 6033, 6034, 6035, 6036, 6037, 6038, 6039, 6040, 6041,
          6042, 6043, 6044, 6045, 6046, 6047, 6048, 6049, 6050, 6051, 6052,
          6053, 6054, 6055, 6056, 6057, 6058, 6059, 6060, 6061, 6062, 6063,
          6064, 6065, 6066, 6067, 6068, 6069, 6070, 6071, 6072, 6073, 6074,
          6075, 6076, 6077, 6078, 6079, 6080, 6081, 6082, 6083, 6084, 1692,
          6085, 6086, 6087, 6088, 6089, 6090, 6091, 6092, 6093, 6094, 6095,
          6096, 6097, 6098, 6099, 6100, 6101, 6102, 6103, 6104, 6105, 6106,
          6107, 6108, 6109, 6110, 6111, 6112, 6113, 6114, 6115, 6116, 6117,
          6118, 6119, 6120, 6121, 6122, 6123, 6124, 6125, 6126, 6127, 6128,
          6129, 6130, 6131, 1693, 6132, 6133, 6134, 6135, 6136, 1694, 6137,
          6138, 6139, 6140, 6141, 1695, 6142, 6143, 6144, 6145, 6146, 6147,
          6148, 6149, 6150, 6151, 6152, 6153, 6154, 6155, 6156, 6157, 6158,
          6159, 6160, 6161, 6162, 6163, 6164, 6165, 6166, 6167, 6168, 6169,
          6170, 6171, 6172, 6173, 6174, 6175, 6176, 6177, 6178, 6179, 6180,
          6181, 6182, 6183, 6184, 6185, 1696, 6186, 6187, 6188, 6189, 6190,
          6191, 6192, 6193, 6194, 6195, 6196, 6197, 6198, 6199, 6200, 6201,
          6202, 6203, 6204, 6205, 6206, 6207, 6208, 6209, 6210, 6211, 6212,
          6213, 6214, 6215, 6216, 6217, 6218, 6219, 1697, 6220, 6221, 6222,
          6223, 6224, 6225, 6226, 6227, 6228, 6229, 6230, 6231, 6232, 6233,
          6234, 6235, 6236, 6237, 6238, 6239, 6240, 6241, 6242, 6243, 6244,
          6245, 6246, 6247, 6248, 6249, 6250, 6251, 6252, 6253, 1698, 6254,
          6255, 6256, 6257, 6258, 6259, 6260, 6261, 6262, 6263, 1200, 6264,
          6265, 6266, 6267, 6268, 6269, 6270, 6271, 6272, 6273, 6274, 6275,
          6276, 6277, 6278, 6279, 6280, 6281, 6282, 6283, 6284, 6285, 6286,
          6287, 6288, 6289, 6290, 6291, 6292, 6293, 6294, 6295, 6296, 6297,
          6298, 6299, 6300, 6301, 6302, 1699, 6303, 6304, 1700, 6305, 6306,
          6307, 6308, 6309, 6310, 6311, 6312, 6313, 6314, 6315, 6316, 6317,
          6318, 6319, 6320, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6328,
          6329, 6330, 6331, 6332, 6333, 6334, 6335, 6336, 6337, 6338, 6339,
          1701, 6340, 6341, 6342, 6343, 6344, 1387, 6345, 6346, 6347, 6348,
          6349, 6350, 6351, 6352, 6353, 6354, 6355, 6356, 6357, 6358, 6359,
          6360, 6361, 6362, 6363, 6364, 6365, 6366, 6367, 6368, 6369, 6370,
          6371, 6372, 6373, 6374, 6375, 6376, 6377, 6378, 6379, 6380, 6381,
          6382, 6383, 6384, 6385, 6386, 6387, 6388, 6389, 6390, 6391, 6392,
          6393, 6394, 6395, 6396, 6397, 6398, 6399, 6400, 6401, 6402, 6403,
          6404, 6405, 6406, 6407, 6408, 6409, 6410, 6411, 6412, 6413, 1702,
          6414, 6415, 6416, 6417, 6418, 6419, 6420, 6421, 6422, 1703, 6423,
          6424, 6425, 6426, 6427, 6428, 6429, 6430, 6431, 6432, 6433, 6434,
          6435, 6436, 6437, 6438, 1704, 6439, 6440, 6441, 6442, 6443, 6444,
          6445, 6446, 6447, 6448, 6449, 6450, 6451, 6452, 6453, 6454, 6455,
          6456, 6457, 6458, 6459, 6460, 6461, 6462, 6463, 6464, 6465, 6466,
          6467, 6468, 6469, 6470, 6471, 6472, 6473, 6474, 6475, 6476, 6477,
          6478, 6479, 6480, 6481, 6482, 6483, 6484, 6485, 6486, 6487, 6488,
          6489, 6490, 6491, 6492, 6493, 6494, 6495, 6496, 6497, 6498, 6499,
          6500, 6501, 6502, 6503, 1266, 6504, 6505, 6506, 6507, 6508, 6509,
          6510, 6511, 6512, 6513, 6514, 6515, 6516, 6517, 6518, 6519, 6520,
          6521, 6522, 6523, 6524, 6525, 6526, 6527, 6528, 6529, 6530, 6531,
          6532, 6533, 6534, 6535, 6536, 6537, 6538, 6539, 6540, 6541, 6542,
          6543, 6544, 6545, 6546, 6547, 6548, 6549, 6550, 6551, 1705, 1706,
          6552, 6553, 6554, 6555, 6556, 6557, 6558, 6559, 6560, 6561, 6562,
          6563, 6564, 6565, 6566, 6567, 6568, 6569, 6570, 6571, 6572, 6573,
          6574, 6575, 6576, 6577, 6578, 6579, 6580, 6581, 6582, 6583, 6584,
          6585, 6586, 6587, 6588, 6589, 6590, 6591, 6592, 6593, 6594, 6595,
          6596, 6597, 6598, 6599, 6600, 6601, 6602, 6603, 6604, 6605, 6606,
          6607, 6608, 6609, 6610, 6611, 6612, 6613, 6614, 6615, 6616, 6617,
          6618, 6619, 6620, 6621, 6622, 6623, 6624, 6625, 6626, 6627, 6628,
          6629, 6630, 6631, 6632, 6633, 6634, 6635, 6636, 6637, 1388, 6638,
          6639, 6640, 6641, 6642, 6643, 6644, 1707, 6645, 6646, 6647, 6648,
          6649, 6650, 6651, 6652, 6653, 6654, 6655, 6656, 6657, 6658, 6659,
          6660, 6661, 6662, 6663, 1708, 6664, 6665, 6666, 6667, 6668, 6669,
          6670, 6671, 6672, 6673, 6674, 1201, 6675, 6676, 6677, 6678, 6679,
          6680, 6681, 6682, 6683, 6684, 6685, 6686, 6687, 6688, 6689, 6690,
          6691, 6692, 6693, 6694, 6695, 6696, 6697, 6698, 6699, 6700, 6701,
          6702, 6703, 6704, 6705, 6706, 6707, 6708, 6709, 6710, 6711, 6712,
          6713, 6714, 6715, 6716, 6717, 6718, 6719, 6720, 6721, 6722, 6723,
          6724, 6725, 1389, 6726, 6727, 6728, 6729, 6730, 6731, 6732, 6733,
          6734, 6735, 6736, 1390, 1709, 6737, 6738, 6739, 6740, 6741, 6742,
          1710, 6743, 6744, 6745, 6746, 1391, 6747, 6748, 6749, 6750, 6751,
          6752, 6753, 6754, 6755, 6756, 6757, 1392, 6758, 6759, 6760, 6761,
          6762, 6763, 6764, 6765, 6766, 6767, 6768, 6769, 6770, 6771, 6772,
          6773, 6774, 6775, 6776, 6777, 6778, 6779, 6780, 1202, 6781, 6782,
          6783, 6784, 6785, 6786, 6787, 6788, 6789, 6790, 6791, 6792, 6793,
          6794, 6795, 6796, 6797, 6798, 6799, 6800, 6801, 6802, 6803, 6804,
          6805, 6806, 6807, 6808, 6809, 1711, 6810, 6811, 6812, 6813, 6814,
          6815, 6816, 6817, 6818, 6819, 6820, 6821, 6822, 6823, 6824, 6825,
          6826, 6827, 6828, 6829, 6830, 6831, 6832, 6833, 6834, 6835, 6836,
          1393, 6837, 6838, 6839, 6840, 6841, 6842, 6843, 6844, 6845, 6846,
          6847, 6848, 6849, 6850, 6851, 6852, 6853, 6854, 6855, 6856, 6857,
          6858, 6859, 6860, 6861, 6862, 6863, 6864, 6865, 6866, 6867, 6868,
          6869, 6870, 6871, 6872, 6873, 6874, 6875, 6876, 6877, 6878, 6879,
          6880, 6881, 6882, 6883, 6884, 6885, 6886, 6887, 6888, 6889, 6890,
          6891, 6892, 6893, 6894, 6895, 6896, 6897, 6898, 6899, 6900, 6901,
          6902, 1712, 6903, 6904, 6905, 6906, 6907, 6908, 6909, 6910, 1713,
          6911, 6912, 6913, 6914, 6915, 6916, 6917, 6918, 6919, 6920, 6921,
          6922, 6923, 6924, 6925, 6926, 6927, 6928, 6929, 6930, 6931, 6932,
          6933, 6934, 6935, 6936, 6937, 6938, 6939, 6940, 6941, 6942, 6943,
          6944, 6945, 6946, 6947, 6948, 6949, 6950, 6951, 6952, 6953, 6954,
          6955, 6956, 6957, 6958, 6959, 6960, 6961, 6962, 6963, 6964, 6965,
          6966, 6967, 6968, 6969, 6970, 6971, 6972, 6973, 6974, 1714, 6975,
          6976, 6977, 6978, 6979, 6980, 6981, 6982, 6983, 6984, 6985, 6986,
          6987, 6988, 1394, 6989, 6990, 6991, 6992, 6993, 6994, 6995, 6996,
          6997, 6998, 6999, 7e3, 1715, 7001, 7002, 7003, 7004, 7005, 7006, 7007,
          7008, 7009, 7010, 7011, 7012, 7013, 7014, 7015, 7016, 7017, 7018,
          7019, 7020, 7021, 7022, 7023, 7024, 7025, 7026, 7027, 7028, 1716,
          7029, 7030, 7031, 7032, 7033, 7034, 7035, 7036, 7037, 7038, 7039,
          7040, 7041, 7042, 7043, 7044, 7045, 7046, 7047, 7048, 7049, 7050,
          7051, 7052, 7053, 7054, 7055, 7056, 7057, 7058, 7059, 7060, 7061,
          7062, 7063, 7064, 7065, 7066, 7067, 7068, 7069, 7070, 7071, 7072,
          7073, 7074, 7075, 7076, 7077, 7078, 7079, 7080, 7081, 7082, 7083,
          7084, 7085, 7086, 7087, 7088, 7089, 7090, 7091, 7092, 7093, 7094,
          7095, 7096, 7097, 7098, 7099, 7100, 7101, 7102, 7103, 7104, 7105,
          7106, 7107, 7108, 7109, 7110, 7111, 7112, 7113, 7114, 7115, 7116,
          7117, 7118, 7119, 7120, 7121, 7122, 7123, 7124, 7125, 7126, 7127,
          7128, 7129, 7130, 7131, 7132, 7133, 7134, 7135, 7136, 7137, 7138,
          7139, 7140, 7141, 7142, 7143, 7144, 7145, 7146, 7147, 7148, 7149,
          7150, 7151, 7152, 7153, 7154, 7155, 7156, 7157, 7158, 7159, 7160,
          7161, 7162, 7163, 7164, 7165, 7166, 7167, 7168, 7169, 7170, 7171,
          7172, 7173, 7174, 7175, 7176, 7177, 7178, 7179, 7180, 7181, 7182,
          7183, 7184, 7185, 7186, 7187, 7188, 7189, 7190, 7191, 7192, 7193,
          7194, 7195, 7196, 7197, 7198, 7199, 7200, 7201, 7202, 7203, 7204,
          7205, 7206, 7207, 1395, 7208, 7209, 7210, 7211, 7212, 7213, 1717,
          7214, 7215, 7216, 7217, 7218, 7219, 7220, 7221, 7222, 7223, 7224,
          7225, 7226, 7227, 7228, 7229, 7230, 7231, 7232, 7233, 7234, 7235,
          7236, 7237, 7238, 7239, 7240, 7241, 7242, 7243, 7244, 7245, 7246,
          7247, 7248, 7249, 7250, 7251, 7252, 7253, 7254, 7255, 7256, 7257,
          7258, 7259, 7260, 7261, 7262, 7263, 7264, 7265, 7266, 7267, 7268,
          7269, 7270, 7271, 7272, 7273, 7274, 7275, 7276, 7277, 7278, 7279,
          7280, 7281, 7282, 7283, 7284, 7285, 7286, 7287, 7288, 7289, 7290,
          7291, 7292, 7293, 7294, 7295, 7296, 7297, 7298, 7299, 7300, 7301,
          7302, 7303, 7304, 7305, 7306, 7307, 7308, 7309, 7310, 7311, 7312,
          7313, 1718, 7314, 7315, 7316, 7317, 7318, 7319, 7320, 7321, 7322,
          7323, 7324, 7325, 7326, 7327, 7328, 7329, 7330, 7331, 7332, 7333,
          7334, 7335, 7336, 7337, 7338, 7339, 7340, 7341, 7342, 7343, 7344,
          7345, 7346, 7347, 7348, 7349, 7350, 7351, 7352, 7353, 7354, 7355,
          7356, 7357, 7358, 7359, 7360, 7361, 7362, 7363, 7364, 7365, 7366,
          7367, 7368, 7369, 7370, 7371, 7372, 7373, 7374, 7375, 7376, 7377,
          7378, 7379, 7380, 7381, 7382, 7383, 7384, 7385, 7386, 7387, 7388,
          7389, 7390, 7391, 7392, 7393, 7394, 7395, 7396, 7397, 7398, 7399,
          7400, 7401, 7402, 7403, 7404, 7405, 7406, 7407, 7408, 7409, 7410,
          7411, 7412, 7413, 7414, 7415, 7416, 7417, 7418, 7419, 7420, 7421,
          7422, 7423, 7424, 7425, 7426, 7427, 7428, 7429, 7430, 7431, 7432,
          7433, 7434, 7435, 7436, 7437, 7438, 7439, 7440, 7441, 7442, 7443,
          7444, 7445, 7446, 7447, 7448, 7449, 7450, 7451, 7452, 7453, 7454,
          7455, 7456, 7457, 7458, 7459, 7460, 7461, 7462, 7463, 7464, 7465,
          7466, 7467, 7468, 7469, 7470, 7471, 7472, 7473, 7474, 7475, 7476,
          7477, 7478, 7479, 7480, 7481, 7482, 7483, 7484, 7485, 7486, 7487,
          7488, 7489, 7490, 7491, 7492, 7493, 7494, 7495, 7496, 7497, 7498,
          7499, 7500, 7501, 7502, 7503, 7504, 7505, 7506, 7507, 7508, 7509,
          7510, 7511, 7512, 7513, 7514, 7515, 7516, 7517, 7518, 7519, 7520,
          7521, 7522, 7523, 7524, 7525, 7526, 7527, 7528, 7529, 7530, 7531,
          7532, 7533, 7534, 7535, 7536, 7537, 7538, 7539, 7540, 7541, 7542,
          7543, 7544, 7545, 7546, 7547, 7548, 7549, 7550, 7551, 7552, 7553,
          7554, 7555, 7556, 7557, 7558, 7559, 7560, 7561, 7562, 7563, 7564,
          7565, 7566, 7567, 7568, 7569, 7570, 7571, 7572, 7573, 7574, 7575,
          7576, 7577, 7578, 7579, 7580, 7581, 7582, 7583, 7584, 7585, 7586,
          7587, 7588, 7589, 7590, 7591, 7592, 7593, 7594, 7595, 7596, 7597,
          7598, 7599, 7600, 7601, 7602, 7603, 7604, 7605, 7606, 7607, 7608,
          7609, 7610, 7611, 7612, 7613, 7614, 7615, 7616, 7617, 7618, 7619,
          7620, 7621, 7622, 7623, 7624, 7625, 7626, 7627, 7628, 7629, 7630,
          7631, 7632, 7633, 7634, 7635, 7636, 7637, 7638, 7639, 7640, 7641,
          7642, 7643, 7644, 7645, 7646, 7647, 7648, 7649, 7650, 7651, 7652,
          7653, 7654, 7655, 7656, 7657, 7658, 7659, 7660, 7661, 7662, 7663,
          7664, 7665, 7666, 7667, 7668, 7669, 7670, 7671, 7672, 7673, 7674,
          7675, 7676, 7677, 7678, 7679, 7680, 7681, 7682, 7683, 7684, 7685,
          7686, 7687, 7688, 7689, 7690, 7691, 7692, 7693, 7694, 7695, 7696,
          7697, 7698, 7699, 7700, 7701, 7702, 7703, 7704, 7705, 7706, 7707,
          7708, 7709, 7710, 7711, 7712, 7713, 7714, 7715, 7716, 7717, 7718,
          7719, 7720, 7721, 7722, 7723, 7724, 7725, 7726, 7727, 7728, 7729,
          7730, 7731, 7732, 7733, 7734, 7735, 7736, 7737, 7738, 7739, 7740,
          7741, 7742, 7743, 7744, 7745, 7746, 7747, 7748, 7749, 7750, 7751,
          7752, 7753, 7754, 7755, 7756, 7757, 7758, 7759, 7760, 7761, 7762,
          7763, 7764, 7765, 7766, 7767, 7768, 7769, 7770, 7771, 7772, 7773,
          7774, 7775, 7776, 7777, 7778, 7779, 7780, 7781, 7782, 7783, 7784,
          7785, 7786, 7787, 7788, 7789, 7790, 7791, 7792, 7793, 7794, 7795,
          7796, 7797, 7798, 7799, 7800, 7801, 7802, 7803, 7804, 7805, 7806,
          7807, 7808, 7809, 7810, 7811, 7812, 7813, 7814, 7815, 7816, 7817,
          7818, 7819, 7820, 7821, 7822, 7823, 7824, 7825, 7826, 7827, 7828,
          7829, 7830, 7831, 7832, 7833, 7834, 7835, 7836, 7837, 7838, 7839,
          7840, 7841, 7842, 7843, 7844, 7845, 7846, 7847, 7848, 7849, 7850,
          7851, 7852, 7853, 7854, 7855, 7856, 7857, 7858, 7859, 7860, 7861,
          7862, 7863, 7864, 7865, 7866, 7867, 7868, 7869, 7870, 7871, 7872,
          7873, 7874, 7875, 7876, 7877, 7878, 7879, 7880, 7881, 7882, 7883,
          7884, 7885, 7886, 7887, 7888, 7889, 7890, 7891, 7892, 7893, 7894,
          7895, 7896, 7897, 7898, 7899, 7900, 7901, 7902, 7903, 7904, 7905,
          7906, 7907, 7908, 7909, 7910, 7911, 7912, 7913, 7914, 7915, 7916,
          7917, 7918, 7919, 7920, 7921, 7922, 7923, 7924, 7925, 7926, 7927,
          7928, 7929, 7930, 7931, 7932, 7933, 7934, 7935, 7936, 7937, 7938,
          7939, 7940, 7941, 7942, 7943, 7944, 7945, 7946, 7947, 7948, 7949,
          7950, 7951, 7952, 7953, 7954, 7955, 7956, 7957, 7958, 7959, 7960,
          7961, 7962, 7963, 7964, 7965, 7966, 7967, 7968, 7969, 7970, 7971,
          7972, 7973, 7974, 7975, 7976, 7977, 7978, 7979, 7980, 7981, 7982,
          7983, 7984, 7985, 7986, 7987, 7988, 7989, 7990, 7991, 7992, 7993,
          7994, 7995, 7996, 7997, 7998, 7999, 8e3, 8001, 8002, 8003, 8004, 8005,
          8006, 8007, 8008, 8009, 8010, 8011, 8012, 8013, 8014, 8015, 8016,
          8017, 8018, 8019, 8020, 8021, 8022, 8023, 8024, 8025, 8026, 8027,
          8028, 8029, 8030, 8031, 8032, 8033, 8034, 8035, 8036, 8037, 8038,
          8039, 8040, 8041, 8042, 8043, 8044, 8045, 8046, 8047, 8048, 8049,
          8050, 8051, 8052, 8053, 8054, 8055, 8056, 8057, 8058, 8059, 8060,
          8061, 8062, 8063, 8064, 8065, 8066, 8067, 8068, 8069, 8070, 8071,
          8072, 8073, 8074, 8075, 8076, 8077, 8078, 8079, 8080, 8081, 8082,
          8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8091, 8092, 8093,
          8094, 8095, 8096, 8097, 8098, 8099, 8100, 8101, 8102, 8103, 8104,
          8105, 8106, 8107, 8108, 8109, 8110, 8111, 8112, 8113, 8114, 8115,
          8116, 8117, 8118, 8119, 8120, 8121, 8122, 8123, 8124, 8125, 8126,
          8127, 8128, 8129, 8130, 8131, 8132, 8133, 8134, 8135, 8136, 8137,
          8138, 8139, 8140, 8141, 8142, 8143, 8144, 8145, 8146, 8147, 8148,
          8149, 8150, 8151, 8152, 8153, 8154, 8155, 8156, 8157, 8158, 8159,
          8160, 8161, 8162, 8163, 8164, 8165, 8166, 8167, 8168, 8169, 8170,
          8171, 8172, 8173, 8174, 8175, 8176, 8177, 8178, 8179, 8180, 8181,
          8182, 8183, 8184, 8185, 8186, 8187, 8188, 8189, 8190, 8191, 8192,
          8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8203,
          8204, 8205, 8206, 8207, 8208, 8209, 8210, 8211, 8212, 8213, 8214,
          8215, 8216, 8217, 8218, 8219, 8220, 8221, 8222, 8223, 8224, 8225,
          8226, 8227, 8228, 8229, 8230, 8231, 8232, 8233, 8234, 8235, 8236,
          8237, 8238, 8239, 8240, 8241, 8242, 8243, 8244, 8245, 8246, 8247,
          8248, 8249, 8250, 8251, 8252, 8253, 8254, 8255, 8256, 8257, 8258,
          8259, 8260, 8261, 8262, 8263, 8264, 8265, 8266, 8267, 8268, 8269,
          8270, 8271, 8272, 8273, 8274, 8275, 8276, 8277, 8278, 8279, 8280,
          8281, 8282, 8283, 8284, 8285, 8286, 8287, 8288, 8289, 8290, 8291,
          8292, 8293, 8294, 8295, 8296, 8297, 8298, 8299, 8300, 8301, 8302,
          8303, 8304, 8305, 8306, 8307, 8308, 8309, 8310, 8311, 8312, 8313,
          8314, 8315, 8316, 8317, 8318, 8319, 8320, 8321, 8322, 8323, 8324,
          8325, 8326, 8327, 8328, 8329, 8330, 8331, 8332, 8333, 8334, 8335,
          8336, 8337, 8338, 8339, 8340, 8341, 8342, 8343, 8344, 8345, 8346,
          8347, 8348, 8349, 8350, 8351, 8352, 8353, 8354, 8355, 8356, 8357,
          8358, 8359, 8360, 8361, 8362, 8363, 8364, 8365, 8366, 8367, 8368,
          8369, 8370, 8371, 8372, 8373, 8374, 8375, 8376, 8377, 8378, 8379,
          8380, 8381, 8382, 8383, 8384, 8385, 8386, 8387, 8388, 8389, 8390,
          8391, 8392, 8393, 8394, 8395, 8396, 8397, 8398, 8399, 8400, 8401,
          8402, 8403, 8404, 8405, 8406, 8407, 8408, 8409, 8410, 8411, 8412,
          8413, 8414, 8415, 8416, 8417, 8418, 8419, 8420, 8421, 8422, 8423,
          8424, 8425, 8426, 8427, 8428, 8429, 8430, 8431, 8432, 8433, 8434,
          8435, 8436, 8437, 8438, 8439, 8440, 8441, 8442, 8443, 8444, 8445,
          8446, 8447, 8448, 8449, 8450, 8451, 8452, 8453, 8454, 8455, 8456,
          8457, 8458, 8459, 8460, 8461, 8462, 8463, 8464, 8465, 8466, 8467,
          8468, 8469, 8470, 8471, 8472, 8473, 8474, 8475, 8476, 8477, 8478,
          8479, 8480, 8481, 8482, 8483, 8484, 8485, 8486, 8487, 8488, 8489,
          8490, 8491, 8492, 8493, 8494, 8495, 8496, 8497, 8498, 8499, 8500,
          8501, 8502, 8503, 8504, 8505, 8506, 8507, 8508, 8509, 8510, 8511,
          8512, 8513, 8514, 8515, 8516, 8517, 8518, 8519, 8520, 8521, 8522,
          8523, 8524, 8525, 8526, 8527, 8528, 8529, 8530, 8531, 8532, 8533,
          8534, 8535, 8536, 8537, 8538, 8539, 8540, 8541, 8542, 8543, 8544,
          8545, 8546, 8547, 8548, 8549, 8550, 8551, 8552, 8553, 8554, 8555,
          8556, 8557, 8558, 8559, 8560, 8561, 8562, 8563, 8564, 8565, 8566,
          8567, 8568, 8569, 8570, 8571, 8572, 8573, 8574, 8575, 8576, 8577,
          8578, 8579, 8580, 8581, 8582, 8583, 8584, 8585, 8586, 8587, 8588,
          8589, 8590, 8591, 8592, 8593, 8594, 8595, 8596, 8597, 8598, 8599,
          8600, 8601, 8602, 8603, 8604, 8605, 8606, 8607, 8608, 8609, 8610,
          8611, 8612, 8613, 8614, 8615, 8616, 8617, 8618, 8619, 8620, 8621,
          8622, 8623, 8624, 8625, 8626, 8627, 8628, 8629, 8630, 8631, 8632,
          8633, 8634, 8635, 8636, 8637, 8638, 8639, 8640, 8641, 8642, 8643,
          8644, 8645, 8646, 8647, 8648, 8649, 8650, 8651, 8652, 8653, 8654,
          8655, 8656, 8657, 8658, 8659, 8660, 8661, 8662, 8663, 8664, 8665,
          8666, 8667, 8668, 8669, 8670, 8671, 8672, 8673, 8674, 8675, 8676,
          8677, 8678, 8679, 8680, 8681, 8682, 8683, 8684, 8685, 8686, 8687,
          8688, 8689, 8690, 8691, 8692, 8693, 8694, 8695, 8696, 8697, 8698,
          8699, 8700, 8701, 8702, 8703, 8704, 8705, 8706, 8707, 8708, 8709,
          8710, 8711, 8712, 8713, 8714, 8715, 8716, 8717, 8718, 8719, 8720,
          8721, 8722, 8723, 8724, 8725, 8726, 8727, 8728, 8729, 8730, 8731,
          8732, 8733, 8734, 8735, 8736, 8737, 8738, 8739, 8740, 8741,
        ]));
    },
    87756(eA, el) {
      ((el.GB2312_TYPICAL_DISTRIBUTION_RATIO = 0.9),
        (el.GB2312_TABLE_SIZE = 3760),
        (el.GB2312CharToFreqOrder = [
          1671, 749, 1443, 2364, 3924, 3807, 2330, 3921, 1704, 3463, 2691, 1511,
          1515, 572, 3191, 2205, 2361, 224, 2558, 479, 1711, 963, 3162, 440,
          4060, 1905, 2966, 2947, 3580, 2647, 3961, 3842, 2204, 869, 4207, 970,
          2678, 5626, 2944, 2956, 1479, 4048, 514, 3595, 588, 1346, 2820, 3409,
          249, 4088, 1746, 1873, 2047, 1774, 581, 1813, 358, 1174, 3590, 1014,
          1561, 4844, 2245, 670, 1636, 3112, 889, 1286, 953, 556, 2327, 3060,
          1290, 3141, 613, 185, 3477, 1367, 850, 3820, 1715, 2428, 2642, 2303,
          2732, 3041, 2562, 2648, 3566, 3946, 1349, 388, 3098, 2091, 1360, 3585,
          152, 1687, 1539, 738, 1559, 59, 1232, 2925, 2267, 1388, 1249, 1741,
          1679, 2960, 151, 1566, 1125, 1352, 4271, 924, 4296, 385, 3166, 4459,
          310, 1245, 2850, 70, 3285, 2729, 3534, 3575, 2398, 3298, 3466, 1960,
          2265, 217, 3647, 864, 1909, 2084, 4401, 2773, 1010, 3269, 5152, 853,
          3051, 3121, 1244, 4251, 1895, 364, 1499, 1540, 2313, 1180, 3655, 2268,
          562, 715, 2417, 3061, 544, 336, 3768, 2380, 1752, 4075, 950, 280,
          2425, 4382, 183, 2759, 3272, 333, 4297, 2155, 1688, 2356, 1444, 1039,
          4540, 736, 1177, 3349, 2443, 2368, 2144, 2225, 565, 196, 1482, 3406,
          927, 1335, 4147, 692, 878, 1311, 1653, 3911, 3622, 1378, 4200, 1840,
          2969, 3149, 2126, 1816, 2534, 1546, 2393, 2760, 737, 2494, 13, 447,
          245, 2747, 38, 2765, 2129, 2589, 1079, 606, 360, 471, 3755, 2890, 404,
          848, 699, 1785, 1236, 370, 2221, 1023, 3746, 2074, 2026, 2023, 2388,
          1581, 2119, 812, 1141, 3091, 2536, 1519, 804, 2053, 406, 1596, 1090,
          784, 548, 4414, 1806, 2264, 2936, 1100, 343, 4114, 5096, 622, 3358,
          743, 3668, 1510, 1626, 5020, 3567, 2513, 3195, 4115, 5627, 2489, 2991,
          24, 2065, 2697, 1087, 2719, 48, 1634, 315, 68, 985, 2052, 198, 2239,
          1347, 1107, 1439, 597, 2366, 2172, 871, 3307, 919, 2487, 2790, 1867,
          236, 2570, 1413, 3794, 906, 3365, 3381, 1701, 1982, 1818, 1524, 2924,
          1205, 616, 2586, 2072, 2004, 575, 253, 3099, 32, 1365, 1182, 197,
          1714, 2454, 1201, 554, 3388, 3224, 2748, 756, 2587, 250, 2567, 1507,
          1517, 3529, 1922, 2761, 2337, 3416, 1961, 1677, 2452, 2238, 3153, 615,
          911, 1506, 1474, 2495, 1265, 1906, 2749, 3756, 3280, 2161, 898, 2714,
          1759, 3450, 2243, 2444, 563, 26, 3286, 2266, 3769, 3344, 2707, 3677,
          611, 1402, 531, 1028, 2871, 4548, 1375, 261, 2948, 835, 1190, 4134,
          353, 840, 2684, 1900, 3082, 1435, 2109, 1207, 1674, 329, 1872, 2781,
          4055, 2686, 2104, 608, 3318, 2423, 2957, 2768, 1108, 3739, 3512, 3271,
          3985, 2203, 1771, 3520, 1418, 2054, 1681, 1153, 225, 1627, 2929, 162,
          2050, 2511, 3687, 1954, 124, 1859, 2431, 1684, 3032, 2894, 585, 4805,
          3969, 2869, 2704, 2088, 2032, 2095, 3656, 2635, 4362, 2209, 256, 518,
          2042, 2105, 3777, 3657, 643, 2298, 1148, 1779, 190, 989, 3544, 414,
          11, 2135, 2063, 2979, 1471, 403, 3678, 126, 770, 1563, 671, 2499,
          3216, 2877, 600, 1179, 307, 2805, 4937, 1268, 1297, 2694, 252, 4032,
          1448, 1494, 1331, 1394, 127, 2256, 222, 1647, 1035, 1481, 3056, 1915,
          1048, 873, 3651, 210, 33, 1608, 2516, 200, 1520, 415, 102, 0, 3389,
          1287, 817, 91, 3299, 2940, 836, 1814, 549, 2197, 1396, 1669, 2987,
          3582, 2297, 2848, 4528, 1070, 687, 20, 1819, 121, 1552, 1364, 1461,
          1968, 2617, 3540, 2824, 2083, 177, 948, 4938, 2291, 110, 4549, 2066,
          648, 3359, 1755, 2110, 2114, 4642, 4845, 1693, 3937, 3308, 1257, 1869,
          2123, 208, 1804, 3159, 2992, 2531, 2549, 3361, 2418, 1350, 2347, 2800,
          2568, 1291, 2036, 2680, 72, 842, 1990, 212, 1233, 1154, 1586, 75,
          2027, 3410, 4900, 1823, 1337, 2710, 2676, 728, 2810, 1522, 3026, 4995,
          157, 755, 1050, 4022, 710, 785, 1936, 2194, 2085, 1406, 2777, 2400,
          150, 1250, 4049, 1206, 807, 1910, 534, 529, 3309, 1721, 1660, 274, 39,
          2827, 661, 2670, 1578, 925, 3248, 3815, 1094, 4278, 4901, 4252, 41,
          1150, 3747, 2572, 2227, 4501, 3658, 4902, 3813, 3357, 3617, 2884,
          2258, 887, 538, 4187, 3199, 1294, 2439, 3042, 2329, 2343, 2497, 1255,
          107, 543, 1527, 521, 3478, 3568, 194, 5062, 15, 961, 3870, 1241, 1192,
          2664, 66, 5215, 3260, 2111, 1295, 1127, 2152, 3805, 4135, 901, 1164,
          1976, 398, 1278, 530, 1460, 748, 904, 1054, 1966, 1426, 53, 2909, 509,
          523, 2279, 1534, 536, 1019, 239, 1685, 460, 2353, 673, 1065, 2401,
          3600, 4298, 2272, 1272, 2363, 284, 1753, 3679, 4064, 1695, 81, 815,
          2677, 2757, 2731, 1386, 859, 500, 4221, 2190, 2566, 757, 1006, 2519,
          2068, 1166, 1455, 337, 2654, 3203, 1863, 1682, 1914, 3025, 1252, 1409,
          1366, 847, 714, 2834, 2038, 3209, 964, 2970, 1901, 885, 2553, 1078,
          1756, 3049, 301, 1572, 3326, 688, 2130, 1996, 2429, 1805, 1648, 2930,
          3421, 2750, 3652, 3088, 262, 1158, 1254, 389, 1641, 1812, 526, 1719,
          923, 2073, 1073, 1902, 468, 489, 4625, 1140, 857, 2375, 3070, 3319,
          2863, 380, 116, 1328, 2693, 1161, 2244, 273, 1212, 1884, 2769, 3011,
          1775, 1142, 461, 3066, 1200, 2147, 2212, 790, 702, 2695, 4222, 1601,
          1058, 434, 2338, 5153, 3640, 67, 2360, 4099, 2502, 618, 3472, 1329,
          416, 1132, 830, 2782, 1807, 2653, 3211, 3510, 1662, 192, 2124, 296,
          3979, 1739, 1611, 3684, 23, 118, 324, 446, 1239, 1225, 293, 2520,
          3814, 3795, 2535, 3116, 17, 1074, 467, 2692, 2201, 387, 2922, 45,
          1326, 3055, 1645, 3659, 2817, 958, 243, 1903, 2320, 1339, 2825, 1784,
          3289, 356, 576, 865, 2315, 2381, 3377, 3916, 1088, 3122, 1713, 1655,
          935, 628, 4689, 1034, 1327, 441, 800, 720, 894, 1979, 2183, 1528,
          5289, 2702, 1071, 4046, 3572, 2399, 1571, 3281, 79, 761, 1103, 327,
          134, 758, 1899, 1371, 1615, 879, 442, 215, 2605, 2579, 173, 2048,
          2485, 1057, 2975, 3317, 1097, 2253, 3801, 4263, 1403, 1650, 2946, 814,
          4968, 3487, 1548, 2644, 1567, 1285, 2, 295, 2636, 97, 946, 3576, 832,
          141, 4257, 3273, 760, 3821, 3521, 3156, 2607, 949, 1024, 1733, 1516,
          1803, 1920, 2125, 2283, 2665, 3180, 1501, 2064, 3560, 2171, 1592, 803,
          3518, 1416, 732, 3897, 4258, 1363, 1362, 2458, 119, 1427, 602, 1525,
          2608, 1605, 1639, 3175, 694, 3064, 10, 465, 76, 2e3, 4846, 4208, 444,
          3781, 1619, 3353, 2206, 1273, 3796, 740, 2483, 320, 1723, 2377, 3660,
          2619, 1359, 1137, 1762, 1724, 2345, 2842, 1850, 1862, 912, 821, 1866,
          612, 2625, 1735, 2573, 3369, 1093, 844, 89, 937, 930, 1424, 3564,
          2413, 2972, 1004, 3046, 3019, 2011, 711, 3171, 1452, 4178, 428, 801,
          1943, 432, 445, 2811, 206, 4136, 1472, 730, 349, 73, 397, 2802, 2547,
          998, 1637, 1167, 789, 396, 3217, 154, 1218, 716, 1120, 1780, 2819,
          4826, 1931, 3334, 3762, 2139, 1215, 2627, 552, 3664, 3628, 3232, 1405,
          2383, 3111, 1356, 2652, 3577, 3320, 3101, 1703, 640, 1045, 1370, 1246,
          4996, 371, 1575, 2436, 1621, 2210, 984, 4033, 1734, 2638, 16, 4529,
          663, 2755, 3255, 1451, 3917, 2257, 1253, 1955, 2234, 1263, 2951, 214,
          1229, 617, 485, 359, 1831, 1969, 473, 2310, 750, 2058, 165, 80, 2864,
          2419, 361, 4344, 2416, 2479, 1134, 796, 3726, 1266, 2943, 860, 2715,
          938, 390, 2734, 1313, 1384, 248, 202, 877, 1064, 2854, 522, 3907, 279,
          1602, 297, 2357, 395, 3740, 137, 2075, 944, 4089, 2584, 1267, 3802,
          62, 1533, 2285, 178, 176, 780, 2440, 201, 3707, 590, 478, 1560, 4354,
          2117, 1075, 30, 74, 4643, 4004, 1635, 1441, 2745, 776, 2596, 238,
          1077, 1692, 1912, 2844, 605, 499, 1742, 3947, 241, 3053, 980, 1749,
          936, 2640, 4511, 2582, 515, 1543, 2162, 5322, 2892, 2993, 890, 2148,
          1924, 665, 1827, 3581, 1032, 968, 3163, 339, 1044, 1896, 270, 583,
          1791, 1720, 4367, 1194, 3488, 3669, 43, 2523, 1657, 163, 2167, 290,
          1209, 1622, 3378, 550, 634, 2508, 2510, 695, 2634, 2384, 2512, 1476,
          1414, 220, 1469, 2341, 2138, 2852, 3183, 2900, 4939, 2865, 3502, 1211,
          3680, 854, 3227, 1299, 2976, 3172, 186, 2998, 1459, 443, 1067, 3251,
          1495, 321, 1932, 3054, 909, 753, 1410, 1828, 436, 2441, 1119, 1587,
          3164, 2186, 1258, 227, 231, 1425, 1890, 3200, 3942, 247, 959, 725,
          5254, 2741, 577, 2158, 2079, 929, 120, 174, 838, 2813, 591, 1115, 417,
          2024, 40, 3240, 1536, 1037, 291, 4151, 2354, 632, 1298, 2406, 2500,
          3535, 1825, 1846, 3451, 205, 1171, 345, 4238, 18, 1163, 811, 685,
          2208, 1217, 425, 1312, 1508, 1175, 4308, 2552, 1033, 587, 1381, 3059,
          2984, 3482, 340, 1316, 4023, 3972, 792, 3176, 519, 777, 4690, 918,
          933, 4130, 2981, 3741, 90, 3360, 2911, 2200, 5184, 4550, 609, 3079,
          2030, 272, 3379, 2736, 363, 3881, 1130, 1447, 286, 779, 357, 1169,
          3350, 3137, 1630, 1220, 2687, 2391, 747, 1277, 3688, 2618, 2682, 2601,
          1156, 3196, 5290, 4034, 3102, 1689, 3596, 3128, 874, 219, 2783, 798,
          508, 1843, 2461, 269, 1658, 1776, 1392, 1913, 2983, 3287, 2866, 2159,
          2372, 829, 4076, 46, 4253, 2873, 1889, 1894, 915, 1834, 1631, 2181,
          2318, 298, 664, 2818, 3555, 2735, 954, 3228, 3117, 527, 3511, 2173,
          681, 2712, 3033, 2247, 2346, 3467, 1652, 155, 2164, 3382, 113, 1994,
          450, 899, 494, 994, 1237, 2958, 1875, 2336, 1926, 3727, 545, 1577,
          1550, 633, 3473, 204, 1305, 3072, 2410, 1956, 2471, 707, 2134, 841,
          2195, 2196, 2663, 3843, 1026, 4940, 990, 3252, 4997, 368, 1092, 437,
          3212, 3258, 1933, 1829, 675, 2977, 2893, 412, 943, 3723, 4644, 3294,
          3283, 2230, 2373, 5154, 2389, 2241, 2661, 2323, 1404, 2524, 593, 787,
          677, 3008, 1275, 2059, 438, 2709, 2609, 2240, 2269, 2246, 1446, 36,
          1568, 1373, 3892, 1574, 2301, 1456, 3962, 693, 2276, 5216, 2035, 1143,
          2720, 1919, 1797, 1811, 2763, 4137, 2597, 1830, 1699, 1488, 1198,
          2090, 424, 1694, 312, 3634, 3390, 4179, 3335, 2252, 1214, 561, 1059,
          3243, 2295, 2561, 975, 5155, 2321, 2751, 3772, 472, 1537, 3282, 3398,
          1047, 2077, 2348, 2878, 1323, 3340, 3076, 690, 2906, 51, 369, 170,
          3541, 1060, 2187, 2688, 3670, 2541, 1083, 1683, 928, 3918, 459, 109,
          4427, 599, 3744, 4286, 143, 2101, 2730, 2490, 82, 1588, 3036, 2121,
          281, 1860, 477, 4035, 1238, 2812, 3020, 2716, 3312, 1530, 2188, 2055,
          1317, 843, 636, 1808, 1173, 3495, 649, 181, 1002, 147, 3641, 1159,
          2414, 3750, 2289, 2795, 813, 3123, 2610, 1136, 4368, 5, 3391, 4541,
          2174, 420, 429, 1728, 754, 1228, 2115, 2219, 347, 2223, 2733, 735,
          1518, 3003, 2355, 3134, 1764, 3948, 3329, 1888, 2424, 1001, 1234,
          1972, 3321, 3363, 1672, 1021, 1450, 1584, 226, 765, 655, 2526, 3404,
          3244, 2302, 3665, 731, 594, 2184, 319, 1576, 621, 658, 2656, 4299,
          2099, 3864, 1279, 2071, 2598, 2739, 795, 3086, 3699, 3908, 1707, 2352,
          2402, 1382, 3136, 2475, 1465, 4847, 3496, 3865, 1085, 3004, 2591,
          1084, 213, 2287, 1963, 3565, 2250, 822, 793, 4574, 3187, 1772, 1789,
          3050, 595, 1484, 1959, 2770, 1080, 2650, 456, 422, 2996, 940, 3322,
          4328, 4345, 3092, 2742, 965, 2784, 739, 4124, 952, 1358, 2498, 2949,
          2565, 332, 2698, 2378, 660, 2260, 2473, 4194, 3856, 2919, 535, 1260,
          2651, 1208, 1428, 1300, 1949, 1303, 2942, 433, 2455, 2450, 1251, 1946,
          614, 1269, 641, 1306, 1810, 2737, 3078, 2912, 564, 2365, 1419, 1415,
          1497, 4460, 2367, 2185, 1379, 3005, 1307, 3218, 2175, 1897, 3063, 682,
          1157, 4040, 4005, 1712, 1160, 1941, 1399, 394, 402, 2952, 1573, 1151,
          2986, 2404, 862, 299, 2033, 1489, 3006, 346, 171, 2886, 3401, 1726,
          2932, 168, 2533, 47, 2507, 1030, 3735, 1145, 3370, 1395, 1318, 1579,
          3609, 4560, 2857, 4116, 1457, 2529, 1965, 504, 1036, 2690, 2988, 2405,
          745, 5871, 849, 2397, 2056, 3081, 863, 2359, 3857, 2096, 99, 1397,
          1769, 2300, 4428, 1643, 3455, 1978, 1757, 3718, 1440, 35, 4879, 3742,
          1296, 4228, 2280, 160, 5063, 1599, 2013, 166, 520, 3479, 1646, 3345,
          3012, 490, 1937, 1545, 1264, 2182, 2505, 1096, 1188, 1369, 1436, 2421,
          1667, 2792, 2460, 1270, 2122, 727, 3167, 2143, 806, 1706, 1012, 1800,
          3037, 960, 2218, 1882, 805, 139, 2456, 1139, 1521, 851, 1052, 3093,
          3089, 342, 2039, 744, 5097, 1468, 1502, 1585, 2087, 223, 939, 326,
          2140, 2577, 892, 2481, 1623, 4077, 982, 3708, 135, 2131, 87, 2503,
          3114, 2326, 1106, 876, 1616, 547, 2997, 2831, 2093, 3441, 4530, 4314,
          9, 3256, 4229, 4148, 659, 1462, 1986, 1710, 2046, 2913, 2231, 4090,
          4880, 5255, 3392, 3274, 1368, 3689, 4645, 1477, 705, 3384, 3635, 1068,
          1529, 2941, 1458, 3782, 1509, 100, 1656, 2548, 718, 2339, 408, 1590,
          2780, 3548, 1838, 4117, 3719, 1345, 3530, 717, 3442, 2778, 3220, 2898,
          1892, 4590, 3614, 3371, 2043, 1998, 1224, 3483, 891, 635, 584, 2559,
          3355, 733, 1766, 1729, 1172, 3789, 1891, 2307, 781, 2982, 2271, 1957,
          1580, 5773, 2633, 2005, 4195, 3097, 1535, 3213, 1189, 1934, 5693,
          3262, 586, 3118, 1324, 1598, 517, 1564, 2217, 1868, 1893, 4445, 3728,
          2703, 3139, 1526, 1787, 1992, 3882, 2875, 1549, 1199, 1056, 2224,
          1904, 2711, 5098, 4287, 338, 1993, 3129, 3489, 2689, 1809, 2815, 1997,
          957, 1855, 3898, 2550, 3275, 3057, 1105, 1319, 627, 1505, 1911, 1883,
          3526, 698, 3629, 3456, 1833, 1431, 746, 77, 1261, 2017, 2296, 1977,
          1885, 125, 1334, 1600, 525, 1798, 1109, 2222, 1470, 1945, 559, 2236,
          1186, 3443, 2476, 1929, 1411, 2411, 3135, 1777, 3372, 2621, 1841,
          1613, 3229, 668, 1430, 1839, 2643, 2916, 195, 1989, 2671, 2358, 1387,
          629, 3205, 2293, 5256, 4439, 123, 1310, 888, 1879, 4300, 3021, 3605,
          1003, 1162, 3192, 2910, 2010, 140, 2395, 2859, 55, 1082, 2012, 2901,
          662, 419, 2081, 1438, 680, 2774, 4654, 3912, 1620, 1731, 1625, 5035,
          4065, 2328, 512, 1344, 802, 5443, 2163, 2311, 2537, 524, 3399, 98,
          1155, 2103, 1918, 2606, 3925, 2816, 1393, 2465, 1504, 3773, 2177,
          3963, 1478, 4346, 180, 1113, 4655, 3461, 2028, 1698, 833, 2696, 1235,
          1322, 1594, 4408, 3623, 3013, 3225, 2040, 3022, 541, 2881, 607, 3632,
          2029, 1665, 1219, 639, 1385, 1686, 1099, 2803, 3231, 1938, 3188, 2858,
          427, 676, 2772, 1168, 2025, 454, 3253, 2486, 3556, 230, 1950, 580,
          791, 1991, 1280, 1086, 1974, 2034, 630, 257, 3338, 2788, 4903, 1017,
          86, 4790, 966, 2789, 1995, 1696, 1131, 259, 3095, 4188, 1308, 179,
          1463, 5257, 289, 4107, 1248, 42, 3413, 1725, 2288, 896, 1947, 774,
          4474, 4254, 604, 3430, 4264, 392, 2514, 2588, 452, 237, 1408, 3018,
          988, 4531, 1970, 3034, 3310, 540, 2370, 1562, 1288, 2990, 502, 4765,
          1147, 4, 1853, 2708, 207, 294, 2814, 4078, 2902, 2509, 684, 34, 3105,
          3532, 2551, 644, 709, 2801, 2344, 573, 1727, 3573, 3557, 2021, 1081,
          3100, 4315, 2100, 3681, 199, 2263, 1837, 2385, 146, 3484, 1195, 2776,
          3949, 997, 1939, 3973, 1008, 1091, 1202, 1962, 1847, 1149, 4209, 5444,
          1076, 493, 117, 5400, 2521, 972, 1490, 2934, 1796, 4542, 2374, 1512,
          2933, 2657, 413, 2888, 1135, 2762, 2314, 2156, 1355, 2369, 766, 2007,
          2527, 2170, 3124, 2491, 2593, 2632, 4757, 2437, 234, 3125, 3591, 1898,
          1750, 1376, 1942, 3468, 3138, 570, 2127, 2145, 3276, 4131, 962, 132,
          1445, 4196, 19, 941, 3624, 3480, 3366, 1973, 1374, 4461, 3431, 2629,
          283, 2415, 2275, 808, 2887, 3620, 2112, 2563, 1353, 3610, 955, 1089,
          3103, 1053, 96, 88, 4097, 823, 3808, 1583, 399, 292, 4091, 3313, 421,
          1128, 642, 4006, 903, 2539, 1877, 2082, 596, 29, 4066, 1790, 722,
          2157, 130, 995, 1569, 769, 1485, 464, 513, 2213, 288, 1923, 1101,
          2453, 4316, 133, 486, 2445, 50, 625, 487, 2207, 57, 423, 481, 2962,
          159, 3729, 1558, 491, 303, 482, 501, 240, 2837, 112, 3648, 2392, 1783,
          362, 8, 3433, 3422, 610, 2793, 3277, 1390, 1284, 1654, 21, 3823, 734,
          367, 623, 193, 287, 374, 1009, 1483, 816, 476, 313, 2255, 2340, 1262,
          2150, 2899, 1146, 2581, 782, 2116, 1659, 2018, 1880, 255, 3586, 3314,
          1110, 2867, 2137, 2564, 986, 2767, 5185, 2006, 650, 158, 926, 762,
          881, 3157, 2717, 2362, 3587, 306, 3690, 3245, 1542, 3077, 2427, 1691,
          2478, 2118, 2985, 3490, 2438, 539, 2305, 983, 129, 1754, 355, 4201,
          2386, 827, 2923, 104, 1773, 2838, 2771, 411, 2905, 3919, 376, 767,
          122, 1114, 828, 2422, 1817, 3506, 266, 3460, 1007, 1609, 4998, 945,
          2612, 4429, 2274, 726, 1247, 1964, 2914, 2199, 2070, 4002, 4108, 657,
          3323, 1422, 579, 455, 2764, 4737, 1222, 2895, 1670, 824, 1223, 1487,
          2525, 558, 861, 3080, 598, 2659, 2515, 1967, 752, 2583, 2376, 2214,
          4180, 977, 704, 2464, 4999, 2622, 4109, 1210, 2961, 819, 1541, 142,
          2284, 44, 418, 457, 1126, 3730, 4347, 4626, 1644, 1876, 3671, 1864,
          302, 1063, 5694, 624, 723, 1984, 3745, 1314, 1676, 2488, 1610, 1449,
          3558, 3569, 2166, 2098, 409, 1011, 2325, 3704, 2306, 818, 1732, 1383,
          1824, 1844, 3757, 999, 2705, 3497, 1216, 1423, 2683, 2426, 2954, 2501,
          2726, 2229, 1475, 2554, 5064, 1971, 1794, 1666, 2014, 1343, 783, 724,
          191, 2434, 1354, 2220, 5065, 1763, 2752, 2472, 4152, 131, 175, 2885,
          3434, 92, 1466, 4920, 2616, 3871, 3872, 3866, 128, 1551, 1632, 669,
          1854, 3682, 4691, 4125, 1230, 188, 2973, 3290, 1302, 1213, 560, 3266,
          917, 763, 3909, 3249, 1760, 868, 1958, 764, 1782, 2097, 145, 2277,
          3774, 4462, 64, 1491, 3062, 971, 2132, 3606, 2442, 221, 1226, 1617,
          218, 323, 1185, 3207, 3147, 571, 619, 1473, 1005, 1744, 2281, 449,
          1887, 2396, 3685, 275, 375, 3816, 1743, 3844, 3731, 845, 1983, 2350,
          4210, 1377, 773, 967, 3499, 3052, 3743, 2725, 4007, 1697, 1022, 3943,
          1464, 3264, 2855, 2722, 1952, 1029, 2839, 2467, 84, 4383, 2215, 820,
          1391, 2015, 2448, 3672, 377, 1948, 2168, 797, 2545, 3536, 2578, 2645,
          94, 2874, 1678, 405, 1259, 3071, 771, 546, 1315, 470, 1243, 3083, 895,
          2468, 981, 969, 2037, 846, 4181, 653, 1276, 2928, 14, 2594, 557, 3007,
          2474, 156, 902, 1338, 1740, 2574, 537, 2518, 973, 2282, 2216, 2433,
          1928, 138, 2903, 1293, 2631, 1612, 646, 3457, 839, 2935, 111, 496,
          2191, 2847, 589, 3186, 149, 3994, 2060, 4031, 2641, 4067, 3145, 1870,
          37, 3597, 2136, 1025, 2051, 3009, 3383, 3549, 1121, 1016, 3261, 1301,
          251, 2446, 2599, 2153, 872, 3246, 637, 334, 3705, 831, 884, 921, 3065,
          3140, 4092, 2198, 1944, 246, 2964, 108, 2045, 1152, 1921, 2308, 1031,
          203, 3173, 4170, 1907, 3890, 810, 1401, 2003, 1690, 506, 647, 1242,
          2828, 1761, 1649, 3208, 2249, 1589, 3709, 2931, 5156, 1708, 498, 666,
          2613, 834, 3817, 1231, 184, 2851, 1124, 883, 3197, 2261, 3710, 1765,
          1553, 2658, 1178, 2639, 2351, 93, 1193, 942, 2538, 2141, 4402, 235,
          1821, 870, 1591, 2192, 1709, 1871, 3341, 1618, 4126, 2595, 2334, 603,
          651, 69, 701, 268, 2662, 3411, 2555, 1380, 1606, 503, 448, 254, 2371,
          2646, 574, 1187, 2309, 1770, 322, 2235, 1292, 1801, 305, 566, 1133,
          229, 2067, 2057, 706, 167, 483, 2002, 2672, 3295, 1820, 3561, 3067,
          316, 378, 2746, 3452, 1112, 136, 1981, 507, 1651, 2917, 1117, 285,
          4591, 182, 2580, 3522, 1304, 335, 3303, 1835, 2504, 1795, 1792, 2248,
          674, 1018, 2106, 2449, 1857, 2292, 2845, 976, 3047, 1781, 2600, 2727,
          1389, 1281, 52, 3152, 153, 265, 3950, 672, 3485, 3951, 4463, 430,
          1183, 365, 278, 2169, 27, 1407, 1336, 2304, 209, 1340, 1730, 2202,
          1852, 2403, 2883, 979, 1737, 1062, 631, 2829, 2542, 3876, 2592, 825,
          2086, 2226, 3048, 3625, 352, 1417, 3724, 542, 991, 431, 1351, 3938,
          1861, 2294, 826, 1361, 2927, 3142, 3503, 1738, 463, 2462, 2723, 582,
          1916, 1595, 2808, 400, 3845, 3891, 2868, 3621, 2254, 58, 2492, 1123,
          910, 2160, 2614, 1372, 1603, 1196, 1072, 3385, 1700, 3267, 1980, 696,
          480, 2430, 920, 799, 1570, 2920, 1951, 2041, 4047, 2540, 1321, 4223,
          2469, 3562, 2228, 1271, 2602, 401, 2833, 3351, 2575, 5157, 907, 2312,
          1256, 410, 263, 3507, 1582, 996, 678, 1849, 2316, 1480, 908, 3545,
          2237, 703, 2322, 667, 1826, 2849, 1531, 2604, 2999, 2407, 3146, 2151,
          2630, 1786, 3711, 469, 3542, 497, 3899, 2409, 858, 837, 4446, 3393,
          1274, 786, 620, 1845, 2001, 3311, 484, 308, 3367, 1204, 1815, 3691,
          2332, 1532, 2557, 1842, 2020, 2724, 1927, 2333, 4440, 567, 22, 1673,
          2728, 4475, 1987, 1858, 1144, 1597, 101, 1832, 3601, 12, 974, 3783,
          4391, 951, 1412, 1, 3720, 453, 4608, 4041, 528, 1041, 1027, 3230,
          2628, 1129, 875, 1051, 3291, 1203, 2262, 1069, 2860, 2799, 2149, 2615,
          3278, 144, 1758, 3040, 31, 475, 1680, 366, 2685, 3184, 311, 1642,
          4008, 2466, 5036, 1593, 1493, 2809, 216, 1420, 1668, 233, 304, 2128,
          3284, 232, 1429, 1768, 1040, 2008, 3407, 2740, 2967, 2543, 242, 2133,
          778, 1565, 2022, 2620, 505, 2189, 2756, 1098, 2273, 372, 1614, 708,
          553, 2846, 2094, 2278, 169, 3626, 2835, 4161, 228, 2674, 3165, 809,
          1454, 1309, 466, 1705, 1095, 900, 3423, 880, 2667, 3751, 5258, 2317,
          3109, 2571, 4317, 2766, 1503, 1342, 866, 4447, 1118, 63, 2076, 314,
          1881, 1348, 1061, 172, 978, 3515, 1747, 532, 511, 3970, 6, 601, 905,
          2699, 3300, 1751, 276, 1467, 3725, 2668, 65, 4239, 2544, 2779, 2556,
          1604, 578, 2451, 1802, 992, 2331, 2624, 1320, 3446, 713, 1513, 1013,
          103, 2786, 2447, 1661, 886, 1702, 916, 654, 3574, 2031, 1556, 751,
          2178, 2821, 2179, 1498, 1538, 2176, 271, 914, 2251, 2080, 1325, 638,
          1953, 2937, 3877, 2432, 2754, 95, 3265, 1716, 260, 1227, 4083, 775,
          106, 1357, 3254, 426, 1607, 555, 2480, 772, 1985, 244, 2546, 474, 495,
          1046, 2611, 1851, 2061, 71, 2089, 1675, 2590, 742, 3758, 2843, 3222,
          1433, 267, 2180, 2576, 2826, 2233, 2092, 3913, 2435, 956, 1745, 3075,
          856, 2113, 1116, 451, 3, 1988, 2896, 1398, 993, 2463, 1878, 2049,
          1341, 2718, 2721, 2870, 2108, 712, 2904, 4363, 2753, 2324, 277, 2872,
          2349, 2649, 384, 987, 435, 691, 3e3, 922, 164, 3939, 652, 1500, 1184,
          4153, 2482, 3373, 2165, 4848, 2335, 3775, 3508, 3154, 2806, 2830,
          1554, 2102, 1664, 2530, 1434, 2408, 893, 1547, 2623, 3447, 2832, 2242,
          2532, 3169, 2856, 3223, 2078, 49, 3770, 3469, 462, 318, 656, 2259,
          3250, 3069, 679, 1629, 2758, 344, 1138, 1104, 3120, 1836, 1283, 3115,
          2154, 1437, 4448, 934, 759, 1999, 794, 2862, 1038, 533, 2560, 1722,
          2342, 855, 2626, 1197, 1663, 4476, 3127, 85, 4240, 2528, 25, 1111,
          1181, 3673, 407, 3470, 4561, 2679, 2713, 768, 1925, 2841, 3986, 1544,
          1165, 932, 373, 1240, 2146, 1930, 2673, 721, 4766, 354, 4333, 391,
          2963, 187, 61, 3364, 1442, 1102, 330, 1940, 1767, 341, 3809, 4118,
          393, 2496, 2062, 2211, 105, 331, 300, 439, 913, 1332, 626, 379, 3304,
          1557, 328, 689, 3952, 309, 1555, 931, 317, 2517, 3027, 325, 569, 686,
          2107, 3084, 60, 1042, 1333, 2794, 264, 3177, 4014, 1628, 258, 3712, 7,
          4464, 1176, 1043, 1778, 683, 114, 1975, 78, 1492, 383, 1886, 510, 386,
          645, 5291, 2891, 2069, 3305, 4138, 3867, 2939, 2603, 2493, 1935, 1066,
          1848, 3588, 1015, 1282, 1289, 4609, 697, 1453, 3044, 2666, 3611, 1856,
          2412, 54, 719, 1330, 568, 3778, 2459, 1748, 788, 492, 551, 1191, 1e3,
          488, 3394, 3763, 282, 1799, 348, 2016, 1523, 3155, 2390, 1049, 382,
          2019, 1788, 1170, 729, 2968, 3523, 897, 3926, 2785, 2938, 3292, 350,
          2319, 3238, 1718, 1717, 2655, 3453, 3143, 4465, 161, 2889, 2980, 2009,
          1421, 56, 1908, 1640, 2387, 2232, 1917, 1874, 2477, 4921, 148, 83,
          3438, 592, 4245, 2882, 1822, 1055, 741, 115, 1496, 1624, 381, 1638,
          4592, 1020, 516, 3214, 458, 947, 4575, 1432, 211, 1514, 2926, 1865,
          2142, 189, 852, 1221, 1400, 1486, 882, 2299, 4036, 351, 28, 1122, 700,
          6479, 6480, 6481, 6482, 6483, 5508, 6484, 3900, 3414, 3974, 4441,
          4024, 3537, 4037, 5628, 5099, 3633, 6485, 3148, 6486, 3636, 5509,
          3257, 5510, 5973, 5445, 5872, 4941, 4403, 3174, 4627, 5873, 6276,
          2286, 4230, 5446, 5874, 5122, 6102, 6103, 4162, 5447, 5123, 5323,
          4849, 6277, 3980, 3851, 5066, 4246, 5774, 5067, 6278, 3001, 2807,
          5695, 3346, 5775, 5974, 5158, 5448, 6487, 5975, 5976, 5776, 3598,
          6279, 5696, 4806, 4211, 4154, 6280, 6488, 6489, 6490, 6281, 4212,
          5037, 3374, 4171, 6491, 4562, 4807, 4722, 4827, 5977, 6104, 4532,
          4079, 5159, 5324, 5160, 4404, 3858, 5359, 5875, 3975, 4288, 4610,
          3486, 4512, 5325, 3893, 5360, 6282, 6283, 5560, 2522, 4231, 5978,
          5186, 5449, 2569, 3878, 6284, 5401, 3578, 4415, 6285, 4656, 5124,
          5979, 2506, 4247, 4449, 3219, 3417, 4334, 4969, 4329, 6492, 4576,
          4828, 4172, 4416, 4829, 5402, 6286, 3927, 3852, 5361, 4369, 4830,
          4477, 4867, 5876, 4173, 6493, 6105, 4657, 6287, 6106, 5877, 5450,
          6494, 4155, 4868, 5451, 3700, 5629, 4384, 6288, 6289, 5878, 3189,
          4881, 6107, 6290, 6495, 4513, 6496, 4692, 4515, 4723, 5100, 3356,
          6497, 6291, 3810, 4080, 5561, 3570, 4430, 5980, 6498, 4355, 5697,
          6499, 4724, 6108, 6109, 3764, 4050, 5038, 5879, 4093, 3226, 6292,
          5068, 5217, 4693, 3342, 5630, 3504, 4831, 4377, 4466, 4309, 5698,
          4431, 5777, 6293, 5778, 4272, 3706, 6110, 5326, 3752, 4676, 5327,
          4273, 5403, 4767, 5631, 6500, 5699, 5880, 3475, 5039, 6294, 5562,
          5125, 4348, 4301, 4482, 4068, 5126, 4593, 5700, 3380, 3462, 5981,
          5563, 3824, 5404, 4970, 5511, 3825, 4738, 6295, 6501, 5452, 4516,
          6111, 5881, 5564, 6502, 6296, 5982, 6503, 4213, 4163, 3454, 6504,
          6112, 4009, 4450, 6113, 4658, 6297, 6114, 3035, 6505, 6115, 3995,
          4904, 4739, 4563, 4942, 4110, 5040, 3661, 3928, 5362, 3674, 6506,
          5292, 3612, 4791, 5565, 4149, 5983, 5328, 5259, 5021, 4725, 4577,
          4564, 4517, 4364, 6298, 5405, 4578, 5260, 4594, 4156, 4157, 5453,
          3592, 3491, 6507, 5127, 5512, 4709, 4922, 5984, 5701, 4726, 4289,
          6508, 4015, 6116, 5128, 4628, 3424, 4241, 5779, 6299, 4905, 6509,
          6510, 5454, 5702, 5780, 6300, 4365, 4923, 3971, 6511, 5161, 3270,
          3158, 5985, 4100, 867, 5129, 5703, 6117, 5363, 3695, 3301, 5513, 4467,
          6118, 6512, 5455, 4232, 4242, 4629, 6513, 3959, 4478, 6514, 5514,
          5329, 5986, 4850, 5162, 5566, 3846, 4694, 6119, 5456, 4869, 5781,
          3779, 6301, 5704, 5987, 5515, 4710, 6302, 5882, 6120, 4392, 5364,
          5705, 6515, 6121, 6516, 6517, 3736, 5988, 5457, 5989, 4695, 2457,
          5883, 4551, 5782, 6303, 6304, 6305, 5130, 4971, 6122, 5163, 6123,
          4870, 3263, 5365, 3150, 4871, 6518, 6306, 5783, 5069, 5706, 3513,
          3498, 4409, 5330, 5632, 5366, 5458, 5459, 3991, 5990, 4502, 3324,
          5991, 5784, 3696, 4518, 5633, 4119, 6519, 4630, 5634, 4417, 5707,
          4832, 5992, 3418, 6124, 5993, 5567, 4768, 5218, 6520, 4595, 3458,
          5367, 6125, 5635, 6126, 4202, 6521, 4740, 4924, 6307, 3981, 4069,
          4385, 6308, 3883, 2675, 4051, 3834, 4302, 4483, 5568, 5994, 4972,
          4101, 5368, 6309, 5164, 5884, 3922, 6127, 6522, 6523, 5261, 5460,
          5187, 4164, 5219, 3538, 5516, 4111, 3524, 5995, 6310, 6311, 5369,
          3181, 3386, 2484, 5188, 3464, 5569, 3627, 5708, 6524, 5406, 5165,
          4677, 4492, 6312, 4872, 4851, 5885, 4468, 5996, 6313, 5709, 5710,
          6128, 2470, 5886, 6314, 5293, 4882, 5785, 3325, 5461, 5101, 6129,
          5711, 5786, 6525, 4906, 6526, 6527, 4418, 5887, 5712, 4808, 2907,
          3701, 5713, 5888, 6528, 3765, 5636, 5331, 6529, 6530, 3593, 5889,
          3637, 4943, 3692, 5714, 5787, 4925, 6315, 6130, 5462, 4405, 6131,
          6132, 6316, 5262, 6531, 6532, 5715, 3859, 5716, 5070, 4696, 5102,
          3929, 5788, 3987, 4792, 5997, 6533, 6534, 3920, 4809, 5e3, 5998, 6535,
          2974, 5370, 6317, 5189, 5263, 5717, 3826, 6536, 3953, 5001, 4883,
          3190, 5463, 5890, 4973, 5999, 4741, 6133, 6134, 3607, 5570, 6e3, 4711,
          3362, 3630, 4552, 5041, 6318, 6001, 2950, 2953, 5637, 4646, 5371,
          4944, 6002, 2044, 4120, 3429, 6319, 6537, 5103, 4833, 6538, 6539,
          4884, 4647, 3884, 6003, 6004, 4758, 3835, 5220, 5789, 4565, 5407,
          6540, 6135, 5294, 4697, 4852, 6320, 6321, 3206, 4907, 6541, 6322,
          4945, 6542, 6136, 6543, 6323, 6005, 4631, 3519, 6544, 5891, 6545,
          5464, 3784, 5221, 6546, 5571, 4659, 6547, 6324, 6137, 5190, 6548,
          3853, 6549, 4016, 4834, 3954, 6138, 5332, 3827, 4017, 3210, 3546,
          4469, 5408, 5718, 3505, 4648, 5790, 5131, 5638, 5791, 5465, 4727,
          4318, 6325, 6326, 5792, 4553, 4010, 4698, 3439, 4974, 3638, 4335,
          3085, 6006, 5104, 5042, 5166, 5892, 5572, 6327, 4356, 4519, 5222,
          5573, 5333, 5793, 5043, 6550, 5639, 5071, 4503, 6328, 6139, 6551,
          6140, 3914, 3901, 5372, 6007, 5640, 4728, 4793, 3976, 3836, 4885,
          6552, 4127, 6553, 4451, 4102, 5002, 6554, 3686, 5105, 6555, 5191,
          5072, 5295, 4611, 5794, 5296, 6556, 5893, 5264, 5894, 4975, 5466,
          5265, 4699, 4976, 4370, 4056, 3492, 5044, 4886, 6557, 5795, 4432,
          4769, 4357, 5467, 3940, 4660, 4290, 6141, 4484, 4770, 4661, 3992,
          6329, 4025, 4662, 5022, 4632, 4835, 4070, 5297, 4663, 4596, 5574,
          5132, 5409, 5895, 6142, 4504, 5192, 4664, 5796, 5896, 3885, 5575,
          5797, 5023, 4810, 5798, 3732, 5223, 4712, 5298, 4084, 5334, 5468,
          6143, 4052, 4053, 4336, 4977, 4794, 6558, 5335, 4908, 5576, 5224,
          4233, 5024, 4128, 5469, 5225, 4873, 6008, 5045, 4729, 4742, 4633,
          3675, 4597, 6559, 5897, 5133, 5577, 5003, 5641, 5719, 6330, 6560,
          3017, 2382, 3854, 4406, 4811, 6331, 4393, 3964, 4946, 6561, 2420,
          3722, 6562, 4926, 4378, 3247, 1736, 4442, 6332, 5134, 6333, 5226,
          3996, 2918, 5470, 4319, 4003, 4598, 4743, 4744, 4485, 3785, 3902,
          5167, 5004, 5373, 4394, 5898, 6144, 4874, 1793, 3997, 6334, 4085,
          4214, 5106, 5642, 4909, 5799, 6009, 4419, 4189, 3330, 5899, 4165,
          4420, 5299, 5720, 5227, 3347, 6145, 4081, 6335, 2876, 3930, 6146,
          3293, 3786, 3910, 3998, 5900, 5300, 5578, 2840, 6563, 5901, 5579,
          6147, 3531, 5374, 6564, 6565, 5580, 4759, 5375, 6566, 6148, 3559,
          5643, 6336, 6010, 5517, 6337, 6338, 5721, 5902, 3873, 6011, 6339,
          6567, 5518, 3868, 3649, 5722, 6568, 4771, 4947, 6569, 6149, 4812,
          6570, 2853, 5471, 6340, 6341, 5644, 4795, 6342, 6012, 5723, 6343,
          5724, 6013, 4349, 6344, 3160, 6150, 5193, 4599, 4514, 4493, 5168,
          4320, 6345, 4927, 3666, 4745, 5169, 5903, 5005, 4928, 6346, 5725,
          6014, 4730, 4203, 5046, 4948, 3395, 5170, 6015, 4150, 6016, 5726,
          5519, 6347, 5047, 3550, 6151, 6348, 4197, 4310, 5904, 6571, 5581,
          2965, 6152, 4978, 3960, 4291, 5135, 6572, 5301, 5727, 4129, 4026,
          5905, 4853, 5728, 5472, 6153, 6349, 4533, 2700, 4505, 5336, 4678,
          3583, 5073, 2994, 4486, 3043, 4554, 5520, 6350, 6017, 5800, 4487,
          6351, 3931, 4103, 5376, 6352, 4011, 4321, 4311, 4190, 5136, 6018,
          3988, 3233, 4350, 5906, 5645, 4198, 6573, 5107, 3432, 4191, 3435,
          5582, 6574, 4139, 5410, 6353, 5411, 3944, 5583, 5074, 3198, 6575,
          6354, 4358, 6576, 5302, 4600, 5584, 5194, 5412, 6577, 6578, 5585,
          5413, 5303, 4248, 5414, 3879, 4433, 6579, 4479, 5025, 4854, 5415,
          6355, 4760, 4772, 3683, 2978, 4700, 3797, 4452, 3965, 3932, 3721,
          4910, 5801, 6580, 5195, 3551, 5907, 3221, 3471, 3029, 6019, 3999,
          5908, 5909, 5266, 5267, 3444, 3023, 3828, 3170, 4796, 5646, 4979,
          4259, 6356, 5647, 5337, 3694, 6357, 5648, 5338, 4520, 4322, 5802,
          3031, 3759, 4071, 6020, 5586, 4836, 4386, 5048, 6581, 3571, 4679,
          4174, 4949, 6154, 4813, 3787, 3402, 3822, 3958, 3215, 3552, 5268,
          4387, 3933, 4950, 4359, 6021, 5910, 5075, 3579, 6358, 4234, 4566,
          5521, 6359, 3613, 5049, 6022, 5911, 3375, 3702, 3178, 4911, 5339,
          4521, 6582, 6583, 4395, 3087, 3811, 5377, 6023, 6360, 6155, 4027,
          5171, 5649, 4421, 4249, 2804, 6584, 2270, 6585, 4e3, 4235, 3045, 6156,
          5137, 5729, 4140, 4312, 3886, 6361, 4330, 6157, 4215, 6158, 3500,
          3676, 4929, 4331, 3713, 4930, 5912, 4265, 3776, 3368, 5587, 4470,
          4855, 3038, 4980, 3631, 6159, 6160, 4132, 4680, 6161, 6362, 3923,
          4379, 5588, 4255, 6586, 4121, 6587, 6363, 4649, 6364, 3288, 4773,
          4774, 6162, 6024, 6365, 3543, 6588, 4274, 3107, 3737, 5050, 5803,
          4797, 4522, 5589, 5051, 5730, 3714, 4887, 5378, 4001, 4523, 6163,
          5026, 5522, 4701, 4175, 2791, 3760, 6589, 5473, 4224, 4133, 3847,
          4814, 4815, 4775, 3259, 5416, 6590, 2738, 6164, 6025, 5304, 3733,
          5076, 5650, 4816, 5590, 6591, 6165, 6592, 3934, 5269, 6593, 3396,
          5340, 6594, 5804, 3445, 3602, 4042, 4488, 5731, 5732, 3525, 5591,
          4601, 5196, 6166, 6026, 5172, 3642, 4612, 3202, 4506, 4798, 6366,
          3818, 5108, 4303, 5138, 5139, 4776, 3332, 4304, 2915, 3415, 4434,
          5077, 5109, 4856, 2879, 5305, 4817, 6595, 5913, 3104, 3144, 3903,
          4634, 5341, 3133, 5110, 5651, 5805, 6167, 4057, 5592, 2945, 4371,
          5593, 6596, 3474, 4182, 6367, 6597, 6168, 4507, 4279, 6598, 2822,
          6599, 4777, 4713, 5594, 3829, 6169, 3887, 5417, 6170, 3653, 5474,
          6368, 4216, 2971, 5228, 3790, 4579, 6369, 5733, 6600, 6601, 4951,
          4746, 4555, 6602, 5418, 5475, 6027, 3400, 4665, 5806, 6171, 4799,
          6028, 5052, 6172, 3343, 4800, 4747, 5006, 6370, 4556, 4217, 5476,
          4396, 5229, 5379, 5477, 3839, 5914, 5652, 5807, 4714, 3068, 4635,
          5808, 6173, 5342, 4192, 5078, 5419, 5523, 5734, 6174, 4557, 6175,
          4602, 6371, 6176, 6603, 5809, 6372, 5735, 4260, 3869, 5111, 5230,
          6029, 5112, 6177, 3126, 4681, 5524, 5915, 2706, 3563, 4748, 3130,
          6178, 4018, 5525, 6604, 6605, 5478, 4012, 4837, 6606, 4534, 4193,
          5810, 4857, 3615, 5479, 6030, 4082, 3697, 3539, 4086, 5270, 3662,
          4508, 4931, 5916, 4912, 5811, 5027, 3888, 6607, 4397, 3527, 3302,
          3798, 2775, 2921, 2637, 3966, 4122, 4388, 4028, 4054, 1633, 4858,
          5079, 3024, 5007, 3982, 3412, 5736, 6608, 3426, 3236, 5595, 3030,
          6179, 3427, 3336, 3279, 3110, 6373, 3874, 3039, 5080, 5917, 5140,
          4489, 3119, 6374, 5812, 3405, 4494, 6031, 4666, 4141, 6180, 4166,
          6032, 5813, 4981, 6609, 5081, 4422, 4982, 4112, 3915, 5653, 3296,
          3983, 6375, 4266, 4410, 5654, 6610, 6181, 3436, 5082, 6611, 5380,
          6033, 3819, 5596, 4535, 5231, 5306, 5113, 6612, 4952, 5918, 4275,
          3113, 6613, 6376, 6182, 6183, 5814, 3073, 4731, 4838, 5008, 3831,
          6614, 4888, 3090, 3848, 4280, 5526, 5232, 3014, 5655, 5009, 5737,
          5420, 5527, 6615, 5815, 5343, 5173, 5381, 4818, 6616, 3151, 4953,
          6617, 5738, 2796, 3204, 4360, 2989, 4281, 5739, 5174, 5421, 5197,
          3132, 5141, 3849, 5142, 5528, 5083, 3799, 3904, 4839, 5480, 2880,
          4495, 3448, 6377, 6184, 5271, 5919, 3771, 3193, 6034, 6035, 5920,
          5010, 6036, 5597, 6037, 6378, 6038, 3106, 5422, 6618, 5423, 5424,
          4142, 6619, 4889, 5084, 4890, 4313, 5740, 6620, 3437, 5175, 5307,
          5816, 4199, 5198, 5529, 5817, 5199, 5656, 4913, 5028, 5344, 3850,
          6185, 2955, 5272, 5011, 5818, 4567, 4580, 5029, 5921, 3616, 5233,
          6621, 6622, 6186, 4176, 6039, 6379, 6380, 3352, 5200, 5273, 2908,
          5598, 5234, 3837, 5308, 6623, 6624, 5819, 4496, 4323, 5309, 5201,
          6625, 6626, 4983, 3194, 3838, 4167, 5530, 5922, 5274, 6381, 6382,
          3860, 3861, 5599, 3333, 4292, 4509, 6383, 3553, 5481, 5820, 5531,
          4778, 6187, 3955, 3956, 4324, 4389, 4218, 3945, 4325, 3397, 2681,
          5923, 4779, 5085, 4019, 5482, 4891, 5382, 5383, 6040, 4682, 3425,
          5275, 4094, 6627, 5310, 3015, 5483, 5657, 4398, 5924, 3168, 4819,
          6628, 5925, 6629, 5532, 4932, 4613, 6041, 6630, 4636, 6384, 4780,
          4204, 5658, 4423, 5821, 3989, 4683, 5822, 6385, 4954, 6631, 5345,
          6188, 5425, 5012, 5384, 3894, 6386, 4490, 4104, 6632, 5741, 5053,
          6633, 5823, 5926, 5659, 5660, 5927, 6634, 5235, 5742, 5824, 4840,
          4933, 4820, 6387, 4859, 5928, 4955, 6388, 4143, 3584, 5825, 5346,
          5013, 6635, 5661, 6389, 5014, 5484, 5743, 4337, 5176, 5662, 6390,
          2836, 6391, 3268, 6392, 6636, 6042, 5236, 6637, 4158, 6638, 5744,
          5663, 4471, 5347, 3663, 4123, 5143, 4293, 3895, 6639, 6640, 5311,
          5929, 5826, 3800, 6189, 6393, 6190, 5664, 5348, 3554, 3594, 4749,
          4603, 6641, 5385, 4801, 6043, 5827, 4183, 6642, 5312, 5426, 4761,
          6394, 5665, 6191, 4715, 2669, 6643, 6644, 5533, 3185, 5427, 5086,
          5930, 5931, 5386, 6192, 6044, 6645, 4781, 4013, 5745, 4282, 4435,
          5534, 4390, 4267, 6045, 5746, 4984, 6046, 2743, 6193, 3501, 4087,
          5485, 5932, 5428, 4184, 4095, 5747, 4061, 5054, 3058, 3862, 5933,
          5600, 6646, 5144, 3618, 6395, 3131, 5055, 5313, 6396, 4650, 4956,
          3855, 6194, 3896, 5202, 4985, 4029, 4225, 6195, 6647, 5828, 5486,
          5829, 3589, 3002, 6648, 6397, 4782, 5276, 6649, 6196, 6650, 4105,
          3803, 4043, 5237, 5830, 6398, 4096, 3643, 6399, 3528, 6651, 4453,
          3315, 4637, 6652, 3984, 6197, 5535, 3182, 3339, 6653, 3096, 2660,
          6400, 6654, 3449, 5934, 4250, 4236, 6047, 6401, 5831, 6655, 5487,
          3753, 4062, 5832, 6198, 6199, 6656, 3766, 6657, 3403, 4667, 6048,
          6658, 4338, 2897, 5833, 3880, 2797, 3780, 4326, 6659, 5748, 5015,
          6660, 5387, 4351, 5601, 4411, 6661, 3654, 4424, 5935, 4339, 4072,
          5277, 4568, 5536, 6402, 6662, 5238, 6663, 5349, 5203, 6200, 5204,
          6201, 5145, 4536, 5016, 5056, 4762, 5834, 4399, 4957, 6202, 6403,
          5666, 5749, 6664, 4340, 6665, 5936, 5177, 5667, 6666, 6667, 3459,
          4668, 6404, 6668, 6669, 4543, 6203, 6670, 4276, 6405, 4480, 5537,
          6671, 4614, 5205, 5668, 6672, 3348, 2193, 4763, 6406, 6204, 5937,
          5602, 4177, 5669, 3419, 6673, 4020, 6205, 4443, 4569, 5388, 3715,
          3639, 6407, 6049, 4058, 6206, 6674, 5938, 4544, 6050, 4185, 4294,
          4841, 4651, 4615, 5488, 6207, 6408, 6051, 5178, 3241, 3509, 5835,
          6208, 4958, 5836, 4341, 5489, 5278, 6209, 2823, 5538, 5350, 5206,
          5429, 6675, 4638, 4875, 4073, 3516, 4684, 4914, 4860, 5939, 5603,
          5389, 6052, 5057, 3237, 5490, 3791, 6676, 6409, 6677, 4821, 4915,
          4106, 5351, 5058, 4243, 5539, 4244, 5604, 4842, 4916, 5239, 3028,
          3716, 5837, 5114, 5605, 5390, 5940, 5430, 6210, 4332, 6678, 5540,
          4732, 3667, 3840, 6053, 4305, 3408, 5670, 5541, 6410, 2744, 5240,
          5750, 6679, 3234, 5606, 6680, 5607, 5671, 3608, 4283, 4159, 4400,
          5352, 4783, 6681, 6411, 6682, 4491, 4802, 6211, 6412, 5941, 6413,
          6414, 5542, 5751, 6683, 4669, 3734, 5942, 6684, 6415, 5943, 5059,
          3328, 4670, 4144, 4268, 6685, 6686, 6687, 6688, 4372, 3603, 6689,
          5944, 5491, 4373, 3440, 6416, 5543, 4784, 4822, 5608, 3792, 4616,
          5838, 5672, 3514, 5391, 6417, 4892, 6690, 4639, 6691, 6054, 5673,
          5839, 6055, 6692, 6056, 5392, 6212, 4038, 5544, 5674, 4497, 6057,
          6693, 5840, 4284, 5675, 4021, 4545, 5609, 6418, 4454, 6419, 6213,
          4113, 4472, 5314, 3738, 5087, 5279, 4074, 5610, 4959, 4063, 3179,
          4750, 6058, 6420, 6214, 3476, 4498, 4716, 5431, 4960, 4685, 6215,
          5241, 6694, 6421, 6216, 6695, 5841, 5945, 6422, 3748, 5946, 5179,
          3905, 5752, 5545, 5947, 4374, 6217, 4455, 6423, 4412, 6218, 4803,
          5353, 6696, 3832, 5280, 6219, 4327, 4702, 6220, 6221, 6059, 4652,
          5432, 6424, 3749, 4751, 6425, 5753, 4986, 5393, 4917, 5948, 5030,
          5754, 4861, 4733, 6426, 4703, 6697, 6222, 4671, 5949, 4546, 4961,
          5180, 6223, 5031, 3316, 5281, 6698, 4862, 4295, 4934, 5207, 3644,
          6427, 5842, 5950, 6428, 6429, 4570, 5843, 5282, 6430, 6224, 5088,
          3239, 6060, 6699, 5844, 5755, 6061, 6431, 2701, 5546, 6432, 5115,
          5676, 4039, 3993, 3327, 4752, 4425, 5315, 6433, 3941, 6434, 5677,
          4617, 4604, 3074, 4581, 6225, 5433, 6435, 6226, 6062, 4823, 5756,
          5116, 6227, 3717, 5678, 4717, 5845, 6436, 5679, 5846, 6063, 5847,
          6064, 3977, 3354, 6437, 3863, 5117, 6228, 5547, 5394, 4499, 4524,
          6229, 4605, 6230, 4306, 4500, 6700, 5951, 6065, 3693, 5952, 5089,
          4366, 4918, 6701, 6231, 5548, 6232, 6702, 6438, 4704, 5434, 6703,
          6704, 5953, 4168, 6705, 5680, 3420, 6706, 5242, 4407, 6066, 3812,
          5757, 5090, 5954, 4672, 4525, 3481, 5681, 4618, 5395, 5354, 5316,
          5955, 6439, 4962, 6707, 4526, 6440, 3465, 4673, 6067, 6441, 5682,
          6708, 5435, 5492, 5758, 5683, 4619, 4571, 4674, 4804, 4893, 4686,
          5493, 4753, 6233, 6068, 4269, 6442, 6234, 5032, 4705, 5146, 5243,
          5208, 5848, 6235, 6443, 4963, 5033, 4640, 4226, 6236, 5849, 3387,
          6444, 6445, 4436, 4437, 5850, 4843, 5494, 4785, 4894, 6709, 4361,
          6710, 5091, 5956, 3331, 6237, 4987, 5549, 6069, 6711, 4342, 3517,
          4473, 5317, 6070, 6712, 6071, 4706, 6446, 5017, 5355, 6713, 6714,
          4988, 5436, 6447, 4734, 5759, 6715, 4735, 4547, 4456, 4754, 6448,
          5851, 6449, 6450, 3547, 5852, 5318, 6451, 6452, 5092, 4205, 6716,
          6238, 4620, 4219, 5611, 6239, 6072, 4481, 5760, 5957, 5958, 4059,
          6240, 6453, 4227, 4537, 6241, 5761, 4030, 4186, 5244, 5209, 3761,
          4457, 4876, 3337, 5495, 5181, 6242, 5959, 5319, 5612, 5684, 5853,
          3493, 5854, 6073, 4169, 5613, 5147, 4895, 6074, 5210, 6717, 5182,
          6718, 3830, 6243, 2798, 3841, 6075, 6244, 5855, 5614, 3604, 4606,
          5496, 5685, 5118, 5356, 6719, 6454, 5960, 5357, 5961, 6720, 4145,
          3935, 4621, 5119, 5962, 4261, 6721, 6455, 4786, 5963, 4375, 4582,
          6245, 6246, 6247, 6076, 5437, 4877, 5856, 3376, 4380, 6248, 4160,
          6722, 5148, 6456, 5211, 6457, 6723, 4718, 6458, 6724, 6249, 5358,
          4044, 3297, 6459, 6250, 5857, 5615, 5497, 5245, 6460, 5498, 6725,
          6251, 6252, 5550, 3793, 5499, 2959, 5396, 6461, 6462, 4572, 5093,
          5500, 5964, 3806, 4146, 6463, 4426, 5762, 5858, 6077, 6253, 4755,
          3967, 4220, 5965, 6254, 4989, 5501, 6464, 4352, 6726, 6078, 4764,
          2290, 5246, 3906, 5438, 5283, 3767, 4964, 2861, 5763, 5094, 6255,
          6256, 4622, 5616, 5859, 5860, 4707, 6727, 4285, 4708, 4824, 5617,
          6257, 5551, 4787, 5212, 4965, 4935, 4687, 6465, 6728, 6466, 5686,
          6079, 3494, 4413, 2995, 5247, 5966, 5618, 6729, 5967, 5764, 5765,
          5687, 5502, 6730, 6731, 6080, 5397, 6467, 4990, 6258, 6732, 4538,
          5060, 5619, 6733, 4719, 5688, 5439, 5018, 5149, 5284, 5503, 6734,
          6081, 4607, 6259, 5120, 3645, 5861, 4583, 6260, 4584, 4675, 5620,
          4098, 5440, 6261, 4863, 2379, 3306, 4585, 5552, 5689, 4586, 5285,
          6735, 4864, 6736, 5286, 6082, 6737, 4623, 3010, 4788, 4381, 4558,
          5621, 4587, 4896, 3698, 3161, 5248, 4353, 4045, 6262, 3754, 5183,
          4588, 6738, 6263, 6739, 6740, 5622, 3936, 6741, 6468, 6742, 6264,
          5095, 6469, 4991, 5968, 6743, 4992, 6744, 6083, 4897, 6745, 4256,
          5766, 4307, 3108, 3968, 4444, 5287, 3889, 4343, 6084, 4510, 6085,
          4559, 6086, 4898, 5969, 6746, 5623, 5061, 4919, 5249, 5250, 5504,
          5441, 6265, 5320, 4878, 3242, 5862, 5251, 3428, 6087, 6747, 4237,
          5624, 5442, 6266, 5553, 4539, 6748, 2585, 3533, 5398, 4262, 6088,
          5150, 4736, 4438, 6089, 6267, 5505, 4966, 6749, 6268, 6750, 6269,
          5288, 5554, 3650, 6090, 6091, 4624, 6092, 5690, 6751, 5863, 4270,
          5691, 4277, 5555, 5864, 6752, 5692, 4720, 4865, 6470, 5151, 4688,
          4825, 6753, 3094, 6754, 6471, 3235, 4653, 6755, 5213, 5399, 6756,
          3201, 4589, 5865, 4967, 6472, 5866, 6473, 5019, 3016, 6757, 5321,
          4756, 3957, 4573, 6093, 4993, 5767, 4721, 6474, 6758, 5625, 6759,
          4458, 6475, 6270, 6760, 5556, 4994, 5214, 5252, 6271, 3875, 5768,
          6094, 5034, 5506, 4376, 5769, 6761, 2120, 6476, 5253, 5770, 6762,
          5771, 5970, 3990, 5971, 5557, 5558, 5772, 6477, 6095, 2787, 4641,
          5972, 5121, 6096, 6097, 6272, 6763, 3703, 5867, 5507, 6273, 4206,
          6274, 4789, 6098, 6764, 3619, 3646, 3833, 3804, 2394, 3788, 4936,
          3978, 4866, 4899, 6099, 6100, 5559, 6478, 6765, 3599, 5868, 6101,
          5869, 5870, 6275, 6766, 4527, 6767,
        ]));
    },
    15852(eA, el) {
      ((el.BIG5_TYPICAL_DISTRIBUTION_RATIO = 0.75),
        (el.BIG5_TABLE_SIZE = 5376),
        (el.Big5CharToFreqOrder = [
          1, 1801, 1506, 255, 1431, 198, 9, 82, 6, 5008, 177, 202, 3681, 1256,
          2821, 110, 3814, 33, 3274, 261, 76, 44, 2114, 16, 2946, 2187, 1176,
          659, 3971, 26, 3451, 2653, 1198, 3972, 3350, 4202, 410, 2215, 302,
          590, 361, 1964, 8, 204, 58, 4510, 5009, 1932, 63, 5010, 5011, 317,
          1614, 75, 222, 159, 4203, 2417, 1480, 5012, 3555, 3091, 224, 2822,
          3682, 3, 10, 3973, 1471, 29, 2787, 1135, 2866, 1940, 873, 130, 3275,
          1123, 312, 5013, 4511, 2052, 507, 252, 682, 5014, 142, 1915, 124, 206,
          2947, 34, 3556, 3204, 64, 604, 5015, 2501, 1977, 1978, 155, 1991, 645,
          641, 1606, 5016, 3452, 337, 72, 406, 5017, 80, 630, 238, 3205, 1509,
          263, 939, 1092, 2654, 756, 1440, 1094, 3453, 449, 69, 2987, 591, 179,
          2096, 471, 115, 2035, 1844, 60, 50, 2988, 134, 806, 1869, 734, 2036,
          3454, 180, 995, 1607, 156, 537, 2907, 688, 5018, 319, 1305, 779, 2145,
          514, 2379, 298, 4512, 359, 2502, 90, 2716, 1338, 663, 11, 906, 1099,
          2553, 20, 2441, 182, 532, 1716, 5019, 732, 1376, 4204, 1311, 1420,
          3206, 25, 2317, 1056, 113, 399, 382, 1950, 242, 3455, 2474, 529, 3276,
          475, 1447, 3683, 5020, 117, 21, 656, 810, 1297, 2300, 2334, 3557,
          5021, 126, 4205, 706, 456, 150, 613, 4513, 71, 1118, 2037, 4206, 145,
          3092, 85, 835, 486, 2115, 1246, 1426, 428, 727, 1285, 1015, 800, 106,
          623, 303, 1281, 5022, 2128, 2359, 347, 3815, 221, 3558, 3135, 5023,
          1956, 1153, 4207, 83, 296, 1199, 3093, 192, 624, 93, 5024, 822, 1898,
          2823, 3136, 795, 2065, 991, 1554, 1542, 1592, 27, 43, 2867, 859, 139,
          1456, 860, 4514, 437, 712, 3974, 164, 2397, 3137, 695, 211, 3037,
          2097, 195, 3975, 1608, 3559, 3560, 3684, 3976, 234, 811, 2989, 2098,
          3977, 2233, 1441, 3561, 1615, 2380, 668, 2077, 1638, 305, 228, 1664,
          4515, 467, 415, 5025, 262, 2099, 1593, 239, 108, 300, 200, 1033, 512,
          1247, 2078, 5026, 5027, 2176, 3207, 3685, 2682, 593, 845, 1062, 3277,
          88, 1723, 2038, 3978, 1951, 212, 266, 152, 149, 468, 1899, 4208, 4516,
          77, 187, 5028, 3038, 37, 5, 2990, 5029, 3979, 5030, 5031, 39, 2524,
          4517, 2908, 3208, 2079, 55, 148, 74, 4518, 545, 483, 1474, 1029, 1665,
          217, 1870, 1531, 3138, 1104, 2655, 4209, 24, 172, 3562, 900, 3980,
          3563, 3564, 4519, 32, 1408, 2824, 1312, 329, 487, 2360, 2251, 2717,
          784, 2683, 4, 3039, 3351, 1427, 1789, 188, 109, 499, 5032, 3686, 1717,
          1790, 888, 1217, 3040, 4520, 5033, 3565, 5034, 3352, 1520, 3687, 3981,
          196, 1034, 775, 5035, 5036, 929, 1816, 249, 439, 38, 5037, 1063, 5038,
          794, 3982, 1435, 2301, 46, 178, 3278, 2066, 5039, 2381, 5040, 214,
          1709, 4521, 804, 35, 707, 324, 3688, 1601, 2554, 140, 459, 4210, 5041,
          5042, 1365, 839, 272, 978, 2262, 2580, 3456, 2129, 1363, 3689, 1423,
          697, 100, 3094, 48, 70, 1231, 495, 3139, 2196, 5043, 1294, 5044, 2080,
          462, 586, 1042, 3279, 853, 256, 988, 185, 2382, 3457, 1698, 434, 1084,
          5045, 3458, 314, 2625, 2788, 4522, 2335, 2336, 569, 2285, 637, 1817,
          2525, 757, 1162, 1879, 1616, 3459, 287, 1577, 2116, 768, 4523, 1671,
          2868, 3566, 2526, 1321, 3816, 909, 2418, 5046, 4211, 933, 3817, 4212,
          2053, 2361, 1222, 4524, 765, 2419, 1322, 786, 4525, 5047, 1920, 1462,
          1677, 2909, 1699, 5048, 4526, 1424, 2442, 3140, 3690, 2600, 3353,
          1775, 1941, 3460, 3983, 4213, 309, 1369, 1130, 2825, 364, 2234, 1653,
          1299, 3984, 3567, 3985, 3986, 2656, 525, 1085, 3041, 902, 2001, 1475,
          964, 4527, 421, 1845, 1415, 1057, 2286, 940, 1364, 3141, 376, 4528,
          4529, 1381, 7, 2527, 983, 2383, 336, 1710, 2684, 1846, 321, 3461, 559,
          1131, 3042, 2752, 1809, 1132, 1313, 265, 1481, 1858, 5049, 352, 1203,
          2826, 3280, 167, 1089, 420, 2827, 776, 792, 1724, 3568, 4214, 2443,
          3281, 5050, 4215, 5051, 446, 229, 333, 2753, 901, 3818, 1200, 1557,
          4530, 2657, 1921, 395, 2754, 2685, 3819, 4216, 1836, 125, 916, 3209,
          2626, 4531, 5052, 5053, 3820, 5054, 5055, 5056, 4532, 3142, 3691,
          1133, 2555, 1757, 3462, 1510, 2318, 1409, 3569, 5057, 2146, 438, 2601,
          2910, 2384, 3354, 1068, 958, 3043, 461, 311, 2869, 2686, 4217, 1916,
          3210, 4218, 1979, 383, 750, 2755, 2627, 4219, 274, 539, 385, 1278,
          1442, 5058, 1154, 1965, 384, 561, 210, 98, 1295, 2556, 3570, 5059,
          1711, 2420, 1482, 3463, 3987, 2911, 1257, 129, 5060, 3821, 642, 523,
          2789, 2790, 2658, 5061, 141, 2235, 1333, 68, 176, 441, 876, 907, 4220,
          603, 2602, 710, 171, 3464, 404, 549, 18, 3143, 2398, 1410, 3692, 1666,
          5062, 3571, 4533, 2912, 4534, 5063, 2991, 368, 5064, 146, 366, 99,
          871, 3693, 1543, 748, 807, 1586, 1185, 22, 2263, 379, 3822, 3211,
          5065, 3212, 505, 1942, 2628, 1992, 1382, 2319, 5066, 380, 2362, 218,
          702, 1818, 1248, 3465, 3044, 3572, 3355, 3282, 5067, 2992, 3694, 930,
          3283, 3823, 5068, 59, 5069, 585, 601, 4221, 497, 3466, 1112, 1314,
          4535, 1802, 5070, 1223, 1472, 2177, 5071, 749, 1837, 690, 1900, 3824,
          1773, 3988, 1476, 429, 1043, 1791, 2236, 2117, 917, 4222, 447, 1086,
          1629, 5072, 556, 5073, 5074, 2021, 1654, 844, 1090, 105, 550, 966,
          1758, 2828, 1008, 1783, 686, 1095, 5075, 2287, 793, 1602, 5076, 3573,
          2603, 4536, 4223, 2948, 2302, 4537, 3825, 980, 2503, 544, 353, 527,
          4538, 908, 2687, 2913, 5077, 381, 2629, 1943, 1348, 5078, 1341, 1252,
          560, 3095, 5079, 3467, 2870, 5080, 2054, 973, 886, 2081, 143, 4539,
          5081, 5082, 157, 3989, 496, 4224, 57, 840, 540, 2039, 4540, 4541,
          3468, 2118, 1445, 970, 2264, 1748, 1966, 2082, 4225, 3144, 1234, 1776,
          3284, 2829, 3695, 773, 1206, 2130, 1066, 2040, 1326, 3990, 1738, 1725,
          4226, 279, 3145, 51, 1544, 2604, 423, 1578, 2131, 2067, 173, 4542,
          1880, 5083, 5084, 1583, 264, 610, 3696, 4543, 2444, 280, 154, 5085,
          5086, 5087, 1739, 338, 1282, 3096, 693, 2871, 1411, 1074, 3826, 2445,
          5088, 4544, 5089, 5090, 1240, 952, 2399, 5091, 2914, 1538, 2688, 685,
          1483, 4227, 2475, 1436, 953, 4228, 2055, 4545, 671, 2400, 79, 4229,
          2446, 3285, 608, 567, 2689, 3469, 4230, 4231, 1691, 393, 1261, 1792,
          2401, 5092, 4546, 5093, 5094, 5095, 5096, 1383, 1672, 3827, 3213,
          1464, 522, 1119, 661, 1150, 216, 675, 4547, 3991, 1432, 3574, 609,
          4548, 2690, 2402, 5097, 5098, 5099, 4232, 3045, 0, 5100, 2476, 315,
          231, 2447, 301, 3356, 4549, 2385, 5101, 233, 4233, 3697, 1819, 4550,
          4551, 5102, 96, 1777, 1315, 2083, 5103, 257, 5104, 1810, 3698, 2718,
          1139, 1820, 4234, 2022, 1124, 2164, 2791, 1778, 2659, 5105, 3097, 363,
          1655, 3214, 5106, 2993, 5107, 5108, 5109, 3992, 1567, 3993, 718, 103,
          3215, 849, 1443, 341, 3357, 2949, 1484, 5110, 1712, 127, 67, 339,
          4235, 2403, 679, 1412, 821, 5111, 5112, 834, 738, 351, 2994, 2147,
          846, 235, 1497, 1881, 418, 1993, 3828, 2719, 186, 1100, 2148, 2756,
          3575, 1545, 1355, 2950, 2872, 1377, 583, 3994, 4236, 2581, 2995, 5113,
          1298, 3699, 1078, 2557, 3700, 2363, 78, 3829, 3830, 267, 1289, 2100,
          2002, 1594, 4237, 348, 369, 1274, 2197, 2178, 1838, 4552, 1821, 2830,
          3701, 2757, 2288, 2003, 4553, 2951, 2758, 144, 3358, 882, 4554, 3995,
          2759, 3470, 4555, 2915, 5114, 4238, 1726, 320, 5115, 3996, 3046, 788,
          2996, 5116, 2831, 1774, 1327, 2873, 3997, 2832, 5117, 1306, 4556,
          2004, 1700, 3831, 3576, 2364, 2660, 787, 2023, 506, 824, 3702, 534,
          323, 4557, 1044, 3359, 2024, 1901, 946, 3471, 5118, 1779, 1500, 1678,
          5119, 1882, 4558, 165, 243, 4559, 3703, 2528, 123, 683, 4239, 764,
          4560, 36, 3998, 1793, 589, 2916, 816, 626, 1667, 3047, 2237, 1639,
          1555, 1622, 3832, 3999, 5120, 4e3, 2874, 1370, 1228, 1933, 891, 2084,
          2917, 304, 4240, 5121, 292, 2997, 2720, 3577, 691, 2101, 4241, 1115,
          4561, 118, 662, 5122, 611, 1156, 854, 2386, 1316, 2875, 2, 386, 515,
          2918, 5123, 5124, 3286, 868, 2238, 1486, 855, 2661, 785, 2216, 3048,
          5125, 1040, 3216, 3578, 5126, 3146, 448, 5127, 1525, 5128, 2165, 4562,
          5129, 3833, 5130, 4242, 2833, 3579, 3147, 503, 818, 4001, 3148, 1568,
          814, 676, 1444, 306, 1749, 5131, 3834, 1416, 1030, 197, 1428, 805,
          2834, 1501, 4563, 5132, 5133, 5134, 1994, 5135, 4564, 5136, 5137,
          2198, 13, 2792, 3704, 2998, 3149, 1229, 1917, 5138, 3835, 2132, 5139,
          4243, 4565, 2404, 3580, 5140, 2217, 1511, 1727, 1120, 5141, 5142, 646,
          3836, 2448, 307, 5143, 5144, 1595, 3217, 5145, 5146, 5147, 3705, 1113,
          1356, 4002, 1465, 2529, 2530, 5148, 519, 5149, 128, 2133, 92, 2289,
          1980, 5150, 4003, 1512, 342, 3150, 2199, 5151, 2793, 2218, 1981, 3360,
          4244, 290, 1656, 1317, 789, 827, 2365, 5152, 3837, 4566, 562, 581,
          4004, 5153, 401, 4567, 2252, 94, 4568, 5154, 1399, 2794, 5155, 1463,
          2025, 4569, 3218, 1944, 5156, 828, 1105, 4245, 1262, 1394, 5157, 4246,
          605, 4570, 5158, 1784, 2876, 5159, 2835, 819, 2102, 578, 2200, 2952,
          5160, 1502, 436, 3287, 4247, 3288, 2836, 4005, 2919, 3472, 3473, 5161,
          2721, 2320, 5162, 5163, 2337, 2068, 23, 4571, 193, 826, 3838, 2103,
          699, 1630, 4248, 3098, 390, 1794, 1064, 3581, 5164, 1579, 3099, 3100,
          1400, 5165, 4249, 1839, 1640, 2877, 5166, 4572, 4573, 137, 4250, 598,
          3101, 1967, 780, 104, 974, 2953, 5167, 278, 899, 253, 402, 572, 504,
          493, 1339, 5168, 4006, 1275, 4574, 2582, 2558, 5169, 3706, 3049, 3102,
          2253, 565, 1334, 2722, 863, 41, 5170, 5171, 4575, 5172, 1657, 2338,
          19, 463, 2760, 4251, 606, 5173, 2999, 3289, 1087, 2085, 1323, 2662,
          3e3, 5174, 1631, 1623, 1750, 4252, 2691, 5175, 2878, 791, 2723, 2663,
          2339, 232, 2421, 5176, 3001, 1498, 5177, 2664, 2630, 755, 1366, 3707,
          3290, 3151, 2026, 1609, 119, 1918, 3474, 862, 1026, 4253, 5178, 4007,
          3839, 4576, 4008, 4577, 2265, 1952, 2477, 5179, 1125, 817, 4254, 4255,
          4009, 1513, 1766, 2041, 1487, 4256, 3050, 3291, 2837, 3840, 3152,
          5180, 5181, 1507, 5182, 2692, 733, 40, 1632, 1106, 2879, 345, 4257,
          841, 2531, 230, 4578, 3002, 1847, 3292, 3475, 5183, 1263, 986, 3476,
          5184, 735, 879, 254, 1137, 857, 622, 1300, 1180, 1388, 1562, 4010,
          4011, 2954, 967, 2761, 2665, 1349, 592, 2134, 1692, 3361, 3003, 1995,
          4258, 1679, 4012, 1902, 2188, 5185, 739, 3708, 2724, 1296, 1290, 5186,
          4259, 2201, 2202, 1922, 1563, 2605, 2559, 1871, 2762, 3004, 5187, 435,
          5188, 343, 1108, 596, 17, 1751, 4579, 2239, 3477, 3709, 5189, 4580,
          294, 3582, 2955, 1693, 477, 979, 281, 2042, 3583, 643, 2043, 3710,
          2631, 2795, 2266, 1031, 2340, 2135, 2303, 3584, 4581, 367, 1249, 2560,
          5190, 3585, 5191, 4582, 1283, 3362, 2005, 240, 1762, 3363, 4583, 4584,
          836, 1069, 3153, 474, 5192, 2149, 2532, 268, 3586, 5193, 3219, 1521,
          1284, 5194, 1658, 1546, 4260, 5195, 3587, 3588, 5196, 4261, 3364,
          2693, 1685, 4262, 961, 1673, 2632, 190, 2006, 2203, 3841, 4585, 4586,
          5197, 570, 2504, 3711, 1490, 5198, 4587, 2633, 3293, 1957, 4588, 584,
          1514, 396, 1045, 1945, 5199, 4589, 1968, 2449, 5200, 5201, 4590, 4013,
          619, 5202, 3154, 3294, 215, 2007, 2796, 2561, 3220, 4591, 3221, 4592,
          763, 4263, 3842, 4593, 5203, 5204, 1958, 1767, 2956, 3365, 3712, 1174,
          452, 1477, 4594, 3366, 3155, 5205, 2838, 1253, 2387, 2189, 1091, 2290,
          4264, 492, 5206, 638, 1169, 1825, 2136, 1752, 4014, 648, 926, 1021,
          1324, 4595, 520, 4596, 997, 847, 1007, 892, 4597, 3843, 2267, 1872,
          3713, 2405, 1785, 4598, 1953, 2957, 3103, 3222, 1728, 4265, 2044,
          3714, 4599, 2008, 1701, 3156, 1551, 30, 2268, 4266, 5207, 2027, 4600,
          3589, 5208, 501, 5209, 4267, 594, 3478, 2166, 1822, 3590, 3479, 3591,
          3223, 829, 2839, 4268, 5210, 1680, 3157, 1225, 4269, 5211, 3295, 4601,
          4270, 3158, 2341, 5212, 4602, 4271, 5213, 4015, 4016, 5214, 1848,
          2388, 2606, 3367, 5215, 4603, 374, 4017, 652, 4272, 4273, 375, 1140,
          798, 5216, 5217, 5218, 2366, 4604, 2269, 546, 1659, 138, 3051, 2450,
          4605, 5219, 2254, 612, 1849, 910, 796, 3844, 1740, 1371, 825, 3845,
          3846, 5220, 2920, 2562, 5221, 692, 444, 3052, 2634, 801, 4606, 4274,
          5222, 1491, 244, 1053, 3053, 4275, 4276, 340, 5223, 4018, 1041, 3005,
          293, 1168, 87, 1357, 5224, 1539, 959, 5225, 2240, 721, 694, 4277,
          3847, 219, 1478, 644, 1417, 3368, 2666, 1413, 1401, 1335, 1389, 4019,
          5226, 5227, 3006, 2367, 3159, 1826, 730, 1515, 184, 2840, 66, 4607,
          5228, 1660, 2958, 246, 3369, 378, 1457, 226, 3480, 975, 4020, 2959,
          1264, 3592, 674, 696, 5229, 163, 5230, 1141, 2422, 2167, 713, 3593,
          3370, 4608, 4021, 5231, 5232, 1186, 15, 5233, 1079, 1070, 5234, 1522,
          3224, 3594, 276, 1050, 2725, 758, 1126, 653, 2960, 3296, 5235, 2342,
          889, 3595, 4022, 3104, 3007, 903, 1250, 4609, 4023, 3481, 3596, 1342,
          1681, 1718, 766, 3297, 286, 89, 2961, 3715, 5236, 1713, 5237, 2607,
          3371, 3008, 5238, 2962, 2219, 3225, 2880, 5239, 4610, 2505, 2533, 181,
          387, 1075, 4024, 731, 2190, 3372, 5240, 3298, 310, 313, 3482, 2304,
          770, 4278, 54, 3054, 189, 4611, 3105, 3848, 4025, 5241, 1230, 1617,
          1850, 355, 3597, 4279, 4612, 3373, 111, 4280, 3716, 1350, 3160, 3483,
          3055, 4281, 2150, 3299, 3598, 5242, 2797, 4026, 4027, 3009, 722, 2009,
          5243, 1071, 247, 1207, 2343, 2478, 1378, 4613, 2010, 864, 1437, 1214,
          4614, 373, 3849, 1142, 2220, 667, 4615, 442, 2763, 2563, 3850, 4028,
          1969, 4282, 3300, 1840, 837, 170, 1107, 934, 1336, 1883, 5244, 5245,
          2119, 4283, 2841, 743, 1569, 5246, 4616, 4284, 582, 2389, 1418, 3484,
          5247, 1803, 5248, 357, 1395, 1729, 3717, 3301, 2423, 1564, 2241, 5249,
          3106, 3851, 1633, 4617, 1114, 2086, 4285, 1532, 5250, 482, 2451, 4618,
          5251, 5252, 1492, 833, 1466, 5253, 2726, 3599, 1641, 2842, 5254, 1526,
          1272, 3718, 4286, 1686, 1795, 416, 2564, 1903, 1954, 1804, 5255, 3852,
          2798, 3853, 1159, 2321, 5256, 2881, 4619, 1610, 1584, 3056, 2424,
          2764, 443, 3302, 1163, 3161, 5257, 5258, 4029, 5259, 4287, 2506, 3057,
          4620, 4030, 3162, 2104, 1647, 3600, 2011, 1873, 4288, 5260, 4289, 431,
          3485, 5261, 250, 97, 81, 4290, 5262, 1648, 1851, 1558, 160, 848, 5263,
          866, 740, 1694, 5264, 2204, 2843, 3226, 4291, 4621, 3719, 1687, 950,
          2479, 426, 469, 3227, 3720, 3721, 4031, 5265, 5266, 1188, 424, 1996,
          861, 3601, 4292, 3854, 2205, 2694, 168, 1235, 3602, 4293, 5267, 2087,
          1674, 4622, 3374, 3303, 220, 2565, 1009, 5268, 3855, 670, 3010, 332,
          1208, 717, 5269, 5270, 3603, 2452, 4032, 3375, 5271, 513, 5272, 1209,
          2882, 3376, 3163, 4623, 1080, 5273, 5274, 5275, 5276, 2534, 3722,
          3604, 815, 1587, 4033, 4034, 5277, 3605, 3486, 3856, 1254, 4624, 1328,
          3058, 1390, 4035, 1741, 4036, 3857, 4037, 5278, 236, 3858, 2453, 3304,
          5279, 5280, 3723, 3859, 1273, 3860, 4625, 5281, 308, 5282, 4626, 245,
          4627, 1852, 2480, 1307, 2583, 430, 715, 2137, 2454, 5283, 270, 199,
          2883, 4038, 5284, 3606, 2727, 1753, 761, 1754, 725, 1661, 1841, 4628,
          3487, 3724, 5285, 5286, 587, 14, 3305, 227, 2608, 326, 480, 2270, 943,
          2765, 3607, 291, 650, 1884, 5287, 1702, 1226, 102, 1547, 62, 3488,
          904, 4629, 3489, 1164, 4294, 5288, 5289, 1224, 1548, 2766, 391, 498,
          1493, 5290, 1386, 1419, 5291, 2056, 1177, 4630, 813, 880, 1081, 2368,
          566, 1145, 4631, 2291, 1001, 1035, 2566, 2609, 2242, 394, 1286, 5292,
          5293, 2069, 5294, 86, 1494, 1730, 4039, 491, 1588, 745, 897, 2963,
          843, 3377, 4040, 2767, 2884, 3306, 1768, 998, 2221, 2070, 397, 1827,
          1195, 1970, 3725, 3011, 3378, 284, 5295, 3861, 2507, 2138, 2120, 1904,
          5296, 4041, 2151, 4042, 4295, 1036, 3490, 1905, 114, 2567, 4296, 209,
          1527, 5297, 5298, 2964, 2844, 2635, 2390, 2728, 3164, 812, 2568, 5299,
          3307, 5300, 1559, 737, 1885, 3726, 1210, 885, 28, 2695, 3608, 3862,
          5301, 4297, 1004, 1780, 4632, 5302, 346, 1982, 2222, 2696, 4633, 3863,
          1742, 797, 1642, 4043, 1934, 1072, 1384, 2152, 896, 4044, 3308, 3727,
          3228, 2885, 3609, 5303, 2569, 1959, 4634, 2455, 1786, 5304, 5305,
          5306, 4045, 4298, 1005, 1308, 3728, 4299, 2729, 4635, 4636, 1528,
          2610, 161, 1178, 4300, 1983, 987, 4637, 1101, 4301, 631, 4046, 1157,
          3229, 2425, 1343, 1241, 1016, 2243, 2570, 372, 877, 2344, 2508, 1160,
          555, 1935, 911, 4047, 5307, 466, 1170, 169, 1051, 2921, 2697, 3729,
          2481, 3012, 1182, 2012, 2571, 1251, 2636, 5308, 992, 2345, 3491, 1540,
          2730, 1201, 2071, 2406, 1997, 2482, 5309, 4638, 528, 1923, 2191, 1503,
          1874, 1570, 2369, 3379, 3309, 5310, 557, 1073, 5311, 1828, 3492, 2088,
          2271, 3165, 3059, 3107, 767, 3108, 2799, 4639, 1006, 4302, 4640, 2346,
          1267, 2179, 3730, 3230, 778, 4048, 3231, 2731, 1597, 2667, 5312, 4641,
          5313, 3493, 5314, 5315, 5316, 3310, 2698, 1433, 3311, 131, 95, 1504,
          4049, 723, 4303, 3166, 1842, 3610, 2768, 2192, 4050, 2028, 2105, 3731,
          5317, 3013, 4051, 1218, 5318, 3380, 3232, 4052, 4304, 2584, 248, 1634,
          3864, 912, 5319, 2845, 3732, 3060, 3865, 654, 53, 5320, 3014, 5321,
          1688, 4642, 777, 3494, 1032, 4053, 1425, 5322, 191, 820, 2121, 2846,
          971, 4643, 931, 3233, 135, 664, 783, 3866, 1998, 772, 2922, 1936,
          4054, 3867, 4644, 2923, 3234, 282, 2732, 640, 1372, 3495, 1127, 922,
          325, 3381, 5323, 5324, 711, 2045, 5325, 5326, 4055, 2223, 2800, 1937,
          4056, 3382, 2224, 2255, 3868, 2305, 5327, 4645, 3869, 1258, 3312,
          4057, 3235, 2139, 2965, 4058, 4059, 5328, 2225, 258, 3236, 4646, 101,
          1227, 5329, 3313, 1755, 5330, 1391, 3314, 5331, 2924, 2057, 893, 5332,
          5333, 5334, 1402, 4305, 2347, 5335, 5336, 3237, 3611, 5337, 5338, 878,
          1325, 1781, 2801, 4647, 259, 1385, 2585, 744, 1183, 2272, 4648, 5339,
          4060, 2509, 5340, 684, 1024, 4306, 5341, 472, 3612, 3496, 1165, 3315,
          4061, 4062, 322, 2153, 881, 455, 1695, 1152, 1340, 660, 554, 2154,
          4649, 1058, 4650, 4307, 830, 1065, 3383, 4063, 4651, 1924, 5342, 1703,
          1919, 5343, 932, 2273, 122, 5344, 4652, 947, 677, 5345, 3870, 2637,
          297, 1906, 1925, 2274, 4653, 2322, 3316, 5346, 5347, 4308, 5348, 4309,
          84, 4310, 112, 989, 5349, 547, 1059, 4064, 701, 3613, 1019, 5350,
          4311, 5351, 3497, 942, 639, 457, 2306, 2456, 993, 2966, 407, 851, 494,
          4654, 3384, 927, 5352, 1237, 5353, 2426, 3385, 573, 4312, 680, 921,
          2925, 1279, 1875, 285, 790, 1448, 1984, 719, 2168, 5354, 5355, 4655,
          4065, 4066, 1649, 5356, 1541, 563, 5357, 1077, 5358, 3386, 3061, 3498,
          511, 3015, 4067, 4068, 3733, 4069, 1268, 2572, 3387, 3238, 4656, 4657,
          5359, 535, 1048, 1276, 1189, 2926, 2029, 3167, 1438, 1373, 2847, 2967,
          1134, 2013, 5360, 4313, 1238, 2586, 3109, 1259, 5361, 700, 5362, 2968,
          3168, 3734, 4314, 5363, 4315, 1146, 1876, 1907, 4658, 2611, 4070, 781,
          2427, 132, 1589, 203, 147, 273, 2802, 2407, 898, 1787, 2155, 4071,
          4072, 5364, 3871, 2803, 5365, 5366, 4659, 4660, 5367, 3239, 5368,
          1635, 3872, 965, 5369, 1805, 2699, 1516, 3614, 1121, 1082, 1329, 3317,
          4073, 1449, 3873, 65, 1128, 2848, 2927, 2769, 1590, 3874, 5370, 5371,
          12, 2668, 45, 976, 2587, 3169, 4661, 517, 2535, 1013, 1037, 3240,
          5372, 3875, 2849, 5373, 3876, 5374, 3499, 5375, 2612, 614, 1999, 2323,
          3877, 3110, 2733, 2638, 5376, 2588, 4316, 599, 1269, 5377, 1811, 3735,
          5378, 2700, 3111, 759, 1060, 489, 1806, 3388, 3318, 1358, 5379, 5380,
          2391, 1387, 1215, 2639, 2256, 490, 5381, 5382, 4317, 1759, 2392, 2348,
          5383, 4662, 3878, 1908, 4074, 2640, 1807, 3241, 4663, 3500, 3319,
          2770, 2349, 874, 5384, 5385, 3501, 3736, 1859, 91, 2928, 3737, 3062,
          3879, 4664, 5386, 3170, 4075, 2669, 5387, 3502, 1202, 1403, 3880,
          2969, 2536, 1517, 2510, 4665, 3503, 2511, 5388, 4666, 5389, 2701,
          1886, 1495, 1731, 4076, 2370, 4667, 5390, 2030, 5391, 5392, 4077,
          2702, 1216, 237, 2589, 4318, 2324, 4078, 3881, 4668, 4669, 2703, 3615,
          3504, 445, 4670, 5393, 5394, 5395, 5396, 2771, 61, 4079, 3738, 1823,
          4080, 5397, 687, 2046, 935, 925, 405, 2670, 703, 1096, 1860, 2734,
          4671, 4081, 1877, 1367, 2704, 3389, 918, 2106, 1782, 2483, 334, 3320,
          1611, 1093, 4672, 564, 3171, 3505, 3739, 3390, 945, 2641, 2058, 4673,
          5398, 1926, 872, 4319, 5399, 3506, 2705, 3112, 349, 4320, 3740, 4082,
          4674, 3882, 4321, 3741, 2156, 4083, 4675, 4676, 4322, 4677, 2408,
          2047, 782, 4084, 400, 251, 4323, 1624, 5400, 5401, 277, 3742, 299,
          1265, 476, 1191, 3883, 2122, 4324, 4325, 1109, 205, 5402, 2590, 1e3,
          2157, 3616, 1861, 5403, 5404, 5405, 4678, 5406, 4679, 2573, 107, 2484,
          2158, 4085, 3507, 3172, 5407, 1533, 541, 1301, 158, 753, 4326, 2886,
          3617, 5408, 1696, 370, 1088, 4327, 4680, 3618, 579, 327, 440, 162,
          2244, 269, 1938, 1374, 3508, 968, 3063, 56, 1396, 3113, 2107, 3321,
          3391, 5409, 1927, 2159, 4681, 3016, 5410, 3619, 5411, 5412, 3743,
          4682, 2485, 5413, 2804, 5414, 1650, 4683, 5415, 2613, 5416, 5417,
          4086, 2671, 3392, 1149, 3393, 4087, 3884, 4088, 5418, 1076, 49, 5419,
          951, 3242, 3322, 3323, 450, 2850, 920, 5420, 1812, 2805, 2371, 4328,
          1909, 1138, 2372, 3885, 3509, 5421, 3243, 4684, 1910, 1147, 1518,
          2428, 4685, 3886, 5422, 4686, 2393, 2614, 260, 1796, 3244, 5423, 5424,
          3887, 3324, 708, 5425, 3620, 1704, 5426, 3621, 1351, 1618, 3394, 3017,
          1887, 944, 4329, 3395, 4330, 3064, 3396, 4331, 5427, 3744, 422, 413,
          1714, 3325, 500, 2059, 2350, 4332, 2486, 5428, 1344, 1911, 954, 5429,
          1668, 5430, 5431, 4089, 2409, 4333, 3622, 3888, 4334, 5432, 2307,
          1318, 2512, 3114, 133, 3115, 2887, 4687, 629, 31, 2851, 2706, 3889,
          4688, 850, 949, 4689, 4090, 2970, 1732, 2089, 4335, 1496, 1853, 5433,
          4091, 620, 3245, 981, 1242, 3745, 3397, 1619, 3746, 1643, 3326, 2140,
          2457, 1971, 1719, 3510, 2169, 5434, 3246, 5435, 5436, 3398, 1829,
          5437, 1277, 4690, 1565, 2048, 5438, 1636, 3623, 3116, 5439, 869, 2852,
          655, 3890, 3891, 3117, 4092, 3018, 3892, 1310, 3624, 4691, 5440, 5441,
          5442, 1733, 558, 4692, 3747, 335, 1549, 3065, 1756, 4336, 3748, 1946,
          3511, 1830, 1291, 1192, 470, 2735, 2108, 2806, 913, 1054, 4093, 5443,
          1027, 5444, 3066, 4094, 4693, 982, 2672, 3399, 3173, 3512, 3247, 3248,
          1947, 2807, 5445, 571, 4694, 5446, 1831, 5447, 3625, 2591, 1523, 2429,
          5448, 2090, 984, 4695, 3749, 1960, 5449, 3750, 852, 923, 2808, 3513,
          3751, 969, 1519, 999, 2049, 2325, 1705, 5450, 3118, 615, 1662, 151,
          597, 4095, 2410, 2326, 1049, 275, 4696, 3752, 4337, 568, 3753, 3626,
          2487, 4338, 3754, 5451, 2430, 2275, 409, 3249, 5452, 1566, 2888, 3514,
          1002, 769, 2853, 194, 2091, 3174, 3755, 2226, 3327, 4339, 628, 1505,
          5453, 5454, 1763, 2180, 3019, 4096, 521, 1161, 2592, 1788, 2206, 2411,
          4697, 4097, 1625, 4340, 4341, 412, 42, 3119, 464, 5455, 2642, 4698,
          3400, 1760, 1571, 2889, 3515, 2537, 1219, 2207, 3893, 2643, 2141,
          2373, 4699, 4700, 3328, 1651, 3401, 3627, 5456, 5457, 3628, 2488,
          3516, 5458, 3756, 5459, 5460, 2276, 2092, 460, 5461, 4701, 5462, 3020,
          962, 588, 3629, 289, 3250, 2644, 1116, 52, 5463, 3067, 1797, 5464,
          5465, 5466, 1467, 5467, 1598, 1143, 3757, 4342, 1985, 1734, 1067,
          4702, 1280, 3402, 465, 4703, 1572, 510, 5468, 1928, 2245, 1813, 1644,
          3630, 5469, 4704, 3758, 5470, 5471, 2673, 1573, 1534, 5472, 5473, 536,
          1808, 1761, 3517, 3894, 3175, 2645, 5474, 5475, 5476, 4705, 3518,
          2929, 1912, 2809, 5477, 3329, 1122, 377, 3251, 5478, 360, 5479, 5480,
          4343, 1529, 551, 5481, 2060, 3759, 1769, 2431, 5482, 2930, 4344, 3330,
          3120, 2327, 2109, 2031, 4706, 1404, 136, 1468, 1479, 672, 1171, 3252,
          2308, 271, 3176, 5483, 2772, 5484, 2050, 678, 2736, 865, 1948, 4707,
          5485, 2014, 4098, 2971, 5486, 2737, 2227, 1397, 3068, 3760, 4708,
          4709, 1735, 2931, 3403, 3631, 5487, 3895, 509, 2854, 2458, 2890, 3896,
          5488, 5489, 3177, 3178, 4710, 4345, 2538, 4711, 2309, 1166, 1010, 552,
          681, 1888, 5490, 5491, 2972, 2973, 4099, 1287, 1596, 1862, 3179, 358,
          453, 736, 175, 478, 1117, 905, 1167, 1097, 5492, 1854, 1530, 5493,
          1706, 5494, 2181, 3519, 2292, 3761, 3520, 3632, 4346, 2093, 4347,
          5495, 3404, 1193, 2489, 4348, 1458, 2193, 2208, 1863, 1889, 1421,
          3331, 2932, 3069, 2182, 3521, 595, 2123, 5496, 4100, 5497, 5498, 4349,
          1707, 2646, 223, 3762, 1359, 751, 3121, 183, 3522, 5499, 2810, 3021,
          419, 2374, 633, 704, 3897, 2394, 241, 5500, 5501, 5502, 838, 3022,
          3763, 2277, 2773, 2459, 3898, 1939, 2051, 4101, 1309, 3122, 2246,
          1181, 5503, 1136, 2209, 3899, 2375, 1446, 4350, 2310, 4712, 5504,
          5505, 4351, 1055, 2615, 484, 3764, 5506, 4102, 625, 4352, 2278, 3405,
          1499, 4353, 4103, 5507, 4104, 4354, 3253, 2279, 2280, 3523, 5508,
          5509, 2774, 808, 2616, 3765, 3406, 4105, 4355, 3123, 2539, 526, 3407,
          3900, 4356, 955, 5510, 1620, 4357, 2647, 2432, 5511, 1429, 3766, 1669,
          1832, 994, 928, 5512, 3633, 1260, 5513, 5514, 5515, 1949, 2293, 741,
          2933, 1626, 4358, 2738, 2460, 867, 1184, 362, 3408, 1392, 5516, 5517,
          4106, 4359, 1770, 1736, 3254, 2934, 4713, 4714, 1929, 2707, 1459,
          1158, 5518, 3070, 3409, 2891, 1292, 1930, 2513, 2855, 3767, 1986,
          1187, 2072, 2015, 2617, 4360, 5519, 2574, 2514, 2170, 3768, 2490,
          3332, 5520, 3769, 4715, 5521, 5522, 666, 1003, 3023, 1022, 3634, 4361,
          5523, 4716, 1814, 2257, 574, 3901, 1603, 295, 1535, 705, 3902, 4362,
          283, 858, 417, 5524, 5525, 3255, 4717, 4718, 3071, 1220, 1890, 1046,
          2281, 2461, 4107, 1393, 1599, 689, 2575, 388, 4363, 5526, 2491, 802,
          5527, 2811, 3903, 2061, 1405, 2258, 5528, 4719, 3904, 2110, 1052,
          1345, 3256, 1585, 5529, 809, 5530, 5531, 5532, 575, 2739, 3524, 956,
          1552, 1469, 1144, 2328, 5533, 2329, 1560, 2462, 3635, 3257, 4108, 616,
          2210, 4364, 3180, 2183, 2294, 5534, 1833, 5535, 3525, 4720, 5536,
          1319, 3770, 3771, 1211, 3636, 1023, 3258, 1293, 2812, 5537, 5538,
          5539, 3905, 607, 2311, 3906, 762, 2892, 1439, 4365, 1360, 4721, 1485,
          3072, 5540, 4722, 1038, 4366, 1450, 2062, 2648, 4367, 1379, 4723,
          2593, 5541, 5542, 4368, 1352, 1414, 2330, 2935, 1172, 5543, 5544,
          3907, 3908, 4724, 1798, 1451, 5545, 5546, 5547, 5548, 2936, 4109,
          4110, 2492, 2351, 411, 4111, 4112, 3637, 3333, 3124, 4725, 1561, 2674,
          1452, 4113, 1375, 5549, 5550, 47, 2974, 316, 5551, 1406, 1591, 2937,
          3181, 5552, 1025, 2142, 3125, 3182, 354, 2740, 884, 2228, 4369, 2412,
          508, 3772, 726, 3638, 996, 2433, 3639, 729, 5553, 392, 2194, 1453,
          4114, 4726, 3773, 5554, 5555, 2463, 3640, 2618, 1675, 2813, 919, 2352,
          2975, 2353, 1270, 4727, 4115, 73, 5556, 5557, 647, 5558, 3259, 2856,
          2259, 1550, 1346, 3024, 5559, 1332, 883, 3526, 5560, 5561, 5562, 5563,
          3334, 2775, 5564, 1212, 831, 1347, 4370, 4728, 2331, 3909, 1864, 3073,
          720, 3910, 4729, 4730, 3911, 5565, 4371, 5566, 5567, 4731, 5568, 5569,
          1799, 4732, 3774, 2619, 4733, 3641, 1645, 2376, 4734, 5570, 2938, 669,
          2211, 2675, 2434, 5571, 2893, 5572, 5573, 1028, 3260, 5574, 4372,
          2413, 5575, 2260, 1353, 5576, 5577, 4735, 3183, 518, 5578, 4116, 5579,
          4373, 1961, 5580, 2143, 4374, 5581, 5582, 3025, 2354, 2355, 3912, 516,
          1834, 1454, 4117, 2708, 4375, 4736, 2229, 2620, 1972, 1129, 3642,
          5583, 2776, 5584, 2976, 1422, 577, 1470, 3026, 1524, 3410, 5585, 5586,
          432, 4376, 3074, 3527, 5587, 2594, 1455, 2515, 2230, 1973, 1175, 5588,
          1020, 2741, 4118, 3528, 4737, 5589, 2742, 5590, 1743, 1361, 3075,
          3529, 2649, 4119, 4377, 4738, 2295, 895, 924, 4378, 2171, 331, 2247,
          3076, 166, 1627, 3077, 1098, 5591, 1232, 2894, 2231, 3411, 4739, 657,
          403, 1196, 2377, 542, 3775, 3412, 1600, 4379, 3530, 5592, 4740, 2777,
          3261, 576, 530, 1362, 4741, 4742, 2540, 2676, 3776, 4120, 5593, 842,
          3913, 5594, 2814, 2032, 1014, 4121, 213, 2709, 3413, 665, 621, 4380,
          5595, 3777, 2939, 2435, 5596, 2436, 3335, 3643, 3414, 4743, 4381,
          2541, 4382, 4744, 3644, 1682, 4383, 3531, 1380, 5597, 724, 2282, 600,
          1670, 5598, 1337, 1233, 4745, 3126, 2248, 5599, 1621, 4746, 5600, 651,
          4384, 5601, 1612, 4385, 2621, 5602, 2857, 5603, 2743, 2312, 3078,
          5604, 716, 2464, 3079, 174, 1255, 2710, 4122, 3645, 548, 1320, 1398,
          728, 4123, 1574, 5605, 1891, 1197, 3080, 4124, 5606, 3081, 3082, 3778,
          3646, 3779, 747, 5607, 635, 4386, 4747, 5608, 5609, 5610, 4387, 5611,
          5612, 4748, 5613, 3415, 4749, 2437, 451, 5614, 3780, 2542, 2073, 4388,
          2744, 4389, 4125, 5615, 1764, 4750, 5616, 4390, 350, 4751, 2283, 2395,
          2493, 5617, 4391, 4126, 2249, 1434, 4127, 488, 4752, 458, 4392, 4128,
          3781, 771, 1330, 2396, 3914, 2576, 3184, 2160, 2414, 1553, 2677, 3185,
          4393, 5618, 2494, 2895, 2622, 1720, 2711, 4394, 3416, 4753, 5619,
          2543, 4395, 5620, 3262, 4396, 2778, 5621, 2016, 2745, 5622, 1155,
          1017, 3782, 3915, 5623, 3336, 2313, 201, 1865, 4397, 1430, 5624, 4129,
          5625, 5626, 5627, 5628, 5629, 4398, 1604, 5630, 414, 1866, 371, 2595,
          4754, 4755, 3532, 2017, 3127, 4756, 1708, 960, 4399, 887, 389, 2172,
          1536, 1663, 1721, 5631, 2232, 4130, 2356, 2940, 1580, 5632, 5633,
          1744, 4757, 2544, 4758, 4759, 5634, 4760, 5635, 2074, 5636, 4761,
          3647, 3417, 2896, 4400, 5637, 4401, 2650, 3418, 2815, 673, 2712, 2465,
          709, 3533, 4131, 3648, 4402, 5638, 1148, 502, 634, 5639, 5640, 1204,
          4762, 3649, 1575, 4763, 2623, 3783, 5641, 3784, 3128, 948, 3263, 121,
          1745, 3916, 1110, 5642, 4403, 3083, 2516, 3027, 4132, 3785, 1151,
          1771, 3917, 1488, 4133, 1987, 5643, 2438, 3534, 5644, 5645, 2094,
          5646, 4404, 3918, 1213, 1407, 2816, 531, 2746, 2545, 3264, 1011, 1537,
          4764, 2779, 4405, 3129, 1061, 5647, 3786, 3787, 1867, 2897, 5648,
          2018, 120, 4406, 4407, 2063, 3650, 3265, 2314, 3919, 2678, 3419, 1955,
          4765, 4134, 5649, 3535, 1047, 2713, 1266, 5650, 1368, 4766, 2858, 649,
          3420, 3920, 2546, 2747, 1102, 2859, 2679, 5651, 5652, 2e3, 5653, 1111,
          3651, 2977, 5654, 2495, 3921, 3652, 2817, 1855, 3421, 3788, 5655,
          5656, 3422, 2415, 2898, 3337, 3266, 3653, 5657, 2577, 5658, 3654,
          2818, 4135, 1460, 856, 5659, 3655, 5660, 2899, 2978, 5661, 2900, 3922,
          5662, 4408, 632, 2517, 875, 3923, 1697, 3924, 2296, 5663, 5664, 4767,
          3028, 1239, 580, 4768, 4409, 5665, 914, 936, 2075, 1190, 4136, 1039,
          2124, 5666, 5667, 5668, 5669, 3423, 1473, 5670, 1354, 4410, 3925,
          4769, 2173, 3084, 4137, 915, 3338, 4411, 4412, 3339, 1605, 1835, 5671,
          2748, 398, 3656, 4413, 3926, 4138, 328, 1913, 2860, 4139, 3927, 1331,
          4414, 3029, 937, 4415, 5672, 3657, 4140, 4141, 3424, 2161, 4770, 3425,
          524, 742, 538, 3085, 1012, 5673, 5674, 3928, 2466, 5675, 658, 1103,
          225, 3929, 5676, 5677, 4771, 5678, 4772, 5679, 3267, 1243, 5680, 4142,
          963, 2250, 4773, 5681, 2714, 3658, 3186, 5682, 5683, 2596, 2332, 5684,
          4774, 5685, 5686, 5687, 3536, 957, 3426, 2547, 2033, 1931, 2941, 2467,
          870, 2019, 3659, 1746, 2780, 2781, 2439, 2468, 5688, 3930, 5689, 3789,
          3130, 3790, 3537, 3427, 3791, 5690, 1179, 3086, 5691, 3187, 2378,
          4416, 3792, 2548, 3188, 3131, 2749, 4143, 5692, 3428, 1556, 2549,
          2297, 977, 2901, 2034, 4144, 1205, 3429, 5693, 1765, 3430, 3189, 2125,
          1271, 714, 1689, 4775, 3538, 5694, 2333, 3931, 533, 4417, 3660, 2184,
          617, 5695, 2469, 3340, 3539, 2315, 5696, 5697, 3190, 5698, 5699, 3932,
          1988, 618, 427, 2651, 3540, 3431, 5700, 5701, 1244, 1690, 5702, 2819,
          4418, 4776, 5703, 3541, 4777, 5704, 2284, 1576, 473, 3661, 4419, 3432,
          972, 5705, 3662, 5706, 3087, 5707, 5708, 4778, 4779, 5709, 3793, 4145,
          4146, 5710, 153, 4780, 356, 5711, 1892, 2902, 4420, 2144, 408, 803,
          2357, 5712, 3933, 5713, 4421, 1646, 2578, 2518, 4781, 4782, 3934,
          5714, 3935, 4422, 5715, 2416, 3433, 752, 5716, 5717, 1962, 3341, 2979,
          5718, 746, 3030, 2470, 4783, 4423, 3794, 698, 4784, 1893, 4424, 3663,
          2550, 4785, 3664, 3936, 5719, 3191, 3434, 5720, 1824, 1302, 4147,
          2715, 3937, 1974, 4425, 5721, 4426, 3192, 823, 1303, 1288, 1236, 2861,
          3542, 4148, 3435, 774, 3938, 5722, 1581, 4786, 1304, 2862, 3939, 4787,
          5723, 2440, 2162, 1083, 3268, 4427, 4149, 4428, 344, 1173, 288, 2316,
          454, 1683, 5724, 5725, 1461, 4788, 4150, 2597, 5726, 5727, 4789, 985,
          894, 5728, 3436, 3193, 5729, 1914, 2942, 3795, 1989, 5730, 2111, 1975,
          5731, 4151, 5732, 2579, 1194, 425, 5733, 4790, 3194, 1245, 3796, 4429,
          5734, 5735, 2863, 5736, 636, 4791, 1856, 3940, 760, 1800, 5737, 4430,
          2212, 1508, 4792, 4152, 1894, 1684, 2298, 5738, 5739, 4793, 4431,
          4432, 2213, 479, 5740, 5741, 832, 5742, 4153, 2496, 5743, 2980, 2497,
          3797, 990, 3132, 627, 1815, 2652, 4433, 1582, 4434, 2126, 2112, 3543,
          4794, 5744, 799, 4435, 3195, 5745, 4795, 2113, 1737, 3031, 1018, 543,
          754, 4436, 3342, 1676, 4796, 4797, 4154, 4798, 1489, 5746, 3544, 5747,
          2624, 2903, 4155, 5748, 5749, 2981, 5750, 5751, 5752, 5753, 3196,
          4799, 4800, 2185, 1722, 5754, 3269, 3270, 1843, 3665, 1715, 481, 365,
          1976, 1857, 5755, 5756, 1963, 2498, 4801, 5757, 2127, 3666, 3271, 433,
          1895, 2064, 2076, 5758, 602, 2750, 5759, 5760, 5761, 5762, 5763, 3032,
          1628, 3437, 5764, 3197, 4802, 4156, 2904, 4803, 2519, 5765, 2551,
          2782, 5766, 5767, 5768, 3343, 4804, 2905, 5769, 4805, 5770, 2864,
          4806, 4807, 1221, 2982, 4157, 2520, 5771, 5772, 5773, 1868, 1990,
          5774, 5775, 5776, 1896, 5777, 5778, 4808, 1897, 4158, 318, 5779, 2095,
          4159, 4437, 5780, 5781, 485, 5782, 938, 3941, 553, 2680, 116, 5783,
          3942, 3667, 5784, 3545, 2681, 2783, 3438, 3344, 2820, 5785, 3668,
          2943, 4160, 1747, 2944, 2983, 5786, 5787, 207, 5788, 4809, 5789, 4810,
          2521, 5790, 3033, 890, 3669, 3943, 5791, 1878, 3798, 3439, 5792, 2186,
          2358, 3440, 1652, 5793, 5794, 5795, 941, 2299, 208, 3546, 4161, 2020,
          330, 4438, 3944, 2906, 2499, 3799, 4439, 4811, 5796, 5797, 5798, 2522,
          1613, 4812, 5799, 3345, 3945, 2523, 5800, 4162, 5801, 1637, 4163,
          2471, 4813, 3946, 5802, 2500, 3034, 3800, 5803, 5804, 2195, 4814,
          5805, 2163, 5806, 5807, 5808, 5809, 5810, 5811, 5812, 5813, 5814,
          5815, 5816, 5817, 5818, 5819, 5820, 5821, 5822, 5823, 5824, 5825,
          5826, 5827, 5828, 5829, 5830, 5831, 5832, 5833, 5834, 5835, 5836,
          5837, 5838, 5839, 5840, 5841, 5842, 5843, 5844, 5845, 5846, 5847,
          5848, 5849, 5850, 5851, 5852, 5853, 5854, 5855, 5856, 5857, 5858,
          5859, 5860, 5861, 5862, 5863, 5864, 5865, 5866, 5867, 5868, 5869,
          5870, 5871, 5872, 5873, 5874, 5875, 5876, 5877, 5878, 5879, 5880,
          5881, 5882, 5883, 5884, 5885, 5886, 5887, 5888, 5889, 5890, 5891,
          5892, 5893, 5894, 5895, 5896, 5897, 5898, 5899, 5900, 5901, 5902,
          5903, 5904, 5905, 5906, 5907, 5908, 5909, 5910, 5911, 5912, 5913,
          5914, 5915, 5916, 5917, 5918, 5919, 5920, 5921, 5922, 5923, 5924,
          5925, 5926, 5927, 5928, 5929, 5930, 5931, 5932, 5933, 5934, 5935,
          5936, 5937, 5938, 5939, 5940, 5941, 5942, 5943, 5944, 5945, 5946,
          5947, 5948, 5949, 5950, 5951, 5952, 5953, 5954, 5955, 5956, 5957,
          5958, 5959, 5960, 5961, 5962, 5963, 5964, 5965, 5966, 5967, 5968,
          5969, 5970, 5971, 5972, 5973, 5974, 5975, 5976, 5977, 5978, 5979,
          5980, 5981, 5982, 5983, 5984, 5985, 5986, 5987, 5988, 5989, 5990,
          5991, 5992, 5993, 5994, 5995, 5996, 5997, 5998, 5999, 6e3, 6001, 6002,
          6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010, 6011, 6012, 6013,
          6014, 6015, 6016, 6017, 6018, 6019, 6020, 6021, 6022, 6023, 6024,
          6025, 6026, 6027, 6028, 6029, 6030, 6031, 6032, 6033, 6034, 6035,
          6036, 6037, 6038, 6039, 6040, 6041, 6042, 6043, 6044, 6045, 6046,
          6047, 6048, 6049, 6050, 6051, 6052, 6053, 6054, 6055, 6056, 6057,
          6058, 6059, 6060, 6061, 6062, 6063, 6064, 6065, 6066, 6067, 6068,
          6069, 6070, 6071, 6072, 6073, 6074, 6075, 6076, 6077, 6078, 6079,
          6080, 6081, 6082, 6083, 6084, 6085, 6086, 6087, 6088, 6089, 6090,
          6091, 6092, 6093, 6094, 6095, 6096, 6097, 6098, 6099, 6100, 6101,
          6102, 6103, 6104, 6105, 6106, 6107, 6108, 6109, 6110, 6111, 6112,
          6113, 6114, 6115, 6116, 6117, 6118, 6119, 6120, 6121, 6122, 6123,
          6124, 6125, 6126, 6127, 6128, 6129, 6130, 6131, 6132, 6133, 6134,
          6135, 6136, 6137, 6138, 6139, 6140, 6141, 6142, 6143, 6144, 6145,
          6146, 6147, 6148, 6149, 6150, 6151, 6152, 6153, 6154, 6155, 6156,
          6157, 6158, 6159, 6160, 6161, 6162, 6163, 6164, 6165, 6166, 6167,
          6168, 6169, 6170, 6171, 6172, 6173, 6174, 6175, 6176, 6177, 6178,
          6179, 6180, 6181, 6182, 6183, 6184, 6185, 6186, 6187, 6188, 6189,
          6190, 6191, 6192, 6193, 6194, 6195, 6196, 6197, 6198, 6199, 6200,
          6201, 6202, 6203, 6204, 6205, 6206, 6207, 6208, 6209, 6210, 6211,
          6212, 6213, 6214, 6215, 6216, 6217, 6218, 6219, 6220, 6221, 6222,
          6223, 3670, 6224, 6225, 6226, 6227, 6228, 6229, 6230, 6231, 6232,
          6233, 6234, 6235, 6236, 6237, 6238, 6239, 6240, 6241, 6242, 6243,
          6244, 6245, 6246, 6247, 6248, 6249, 6250, 6251, 6252, 6253, 6254,
          6255, 6256, 6257, 6258, 6259, 6260, 6261, 6262, 6263, 6264, 6265,
          6266, 6267, 6268, 6269, 6270, 6271, 6272, 6273, 6274, 6275, 6276,
          6277, 6278, 6279, 6280, 6281, 6282, 6283, 6284, 6285, 4815, 6286,
          6287, 6288, 6289, 6290, 6291, 6292, 4816, 6293, 6294, 6295, 6296,
          6297, 6298, 6299, 6300, 6301, 6302, 6303, 6304, 6305, 6306, 6307,
          6308, 6309, 6310, 6311, 4817, 4818, 6312, 6313, 6314, 6315, 6316,
          6317, 6318, 4819, 6319, 6320, 6321, 6322, 6323, 6324, 6325, 6326,
          6327, 6328, 6329, 6330, 6331, 6332, 6333, 6334, 6335, 6336, 6337,
          4820, 6338, 6339, 6340, 6341, 6342, 6343, 6344, 6345, 6346, 6347,
          6348, 6349, 6350, 6351, 6352, 6353, 6354, 6355, 6356, 6357, 6358,
          6359, 6360, 6361, 6362, 6363, 6364, 6365, 6366, 6367, 6368, 6369,
          6370, 6371, 6372, 6373, 6374, 6375, 6376, 6377, 6378, 6379, 6380,
          6381, 6382, 6383, 6384, 6385, 6386, 6387, 6388, 6389, 6390, 6391,
          6392, 6393, 6394, 6395, 6396, 6397, 6398, 6399, 6400, 6401, 6402,
          6403, 6404, 6405, 6406, 6407, 6408, 6409, 6410, 3441, 6411, 6412,
          6413, 6414, 6415, 6416, 6417, 6418, 6419, 6420, 6421, 6422, 6423,
          6424, 6425, 4440, 6426, 6427, 6428, 6429, 6430, 6431, 6432, 6433,
          6434, 6435, 6436, 6437, 6438, 6439, 6440, 6441, 6442, 6443, 6444,
          6445, 6446, 6447, 6448, 6449, 6450, 6451, 6452, 6453, 6454, 4821,
          6455, 6456, 6457, 6458, 6459, 6460, 6461, 6462, 6463, 6464, 6465,
          6466, 6467, 6468, 6469, 6470, 6471, 6472, 6473, 6474, 6475, 6476,
          6477, 3947, 3948, 6478, 6479, 6480, 6481, 3272, 4441, 6482, 6483,
          6484, 6485, 4442, 6486, 6487, 6488, 6489, 6490, 6491, 6492, 6493,
          6494, 6495, 6496, 4822, 6497, 6498, 6499, 6500, 6501, 6502, 6503,
          6504, 6505, 6506, 6507, 6508, 6509, 6510, 6511, 6512, 6513, 6514,
          6515, 6516, 6517, 6518, 6519, 6520, 6521, 6522, 6523, 6524, 6525,
          6526, 6527, 6528, 6529, 6530, 6531, 6532, 6533, 6534, 6535, 6536,
          6537, 6538, 6539, 6540, 6541, 6542, 6543, 6544, 6545, 6546, 6547,
          6548, 6549, 6550, 6551, 6552, 6553, 6554, 6555, 6556, 2784, 6557,
          4823, 6558, 6559, 6560, 6561, 6562, 6563, 6564, 6565, 6566, 6567,
          6568, 6569, 3949, 6570, 6571, 6572, 4824, 6573, 6574, 6575, 6576,
          6577, 6578, 6579, 6580, 6581, 6582, 6583, 4825, 6584, 6585, 6586,
          3950, 2785, 6587, 6588, 6589, 6590, 6591, 6592, 6593, 6594, 6595,
          6596, 6597, 6598, 6599, 6600, 6601, 6602, 6603, 6604, 6605, 6606,
          6607, 6608, 6609, 6610, 6611, 6612, 4826, 6613, 6614, 6615, 4827,
          6616, 6617, 6618, 6619, 6620, 6621, 6622, 6623, 6624, 6625, 4164,
          6626, 6627, 6628, 6629, 6630, 6631, 6632, 6633, 6634, 3547, 6635,
          4828, 6636, 6637, 6638, 6639, 6640, 6641, 6642, 3951, 2984, 6643,
          6644, 6645, 6646, 6647, 6648, 6649, 4165, 6650, 4829, 6651, 6652,
          4830, 6653, 6654, 6655, 6656, 6657, 6658, 6659, 6660, 6661, 6662,
          4831, 6663, 6664, 6665, 6666, 6667, 6668, 6669, 6670, 6671, 4166,
          6672, 4832, 3952, 6673, 6674, 6675, 6676, 4833, 6677, 6678, 6679,
          4167, 6680, 6681, 6682, 3198, 6683, 6684, 6685, 6686, 6687, 6688,
          6689, 6690, 6691, 6692, 6693, 6694, 6695, 6696, 6697, 4834, 6698,
          6699, 6700, 6701, 6702, 6703, 6704, 6705, 6706, 6707, 6708, 6709,
          6710, 6711, 6712, 6713, 6714, 6715, 6716, 6717, 6718, 6719, 6720,
          6721, 6722, 6723, 6724, 6725, 6726, 6727, 6728, 6729, 6730, 6731,
          6732, 6733, 6734, 4443, 6735, 6736, 6737, 6738, 6739, 6740, 6741,
          6742, 6743, 6744, 6745, 4444, 6746, 6747, 6748, 6749, 6750, 6751,
          6752, 6753, 6754, 6755, 6756, 6757, 6758, 6759, 6760, 6761, 6762,
          6763, 6764, 6765, 6766, 6767, 6768, 6769, 6770, 6771, 6772, 6773,
          6774, 6775, 6776, 6777, 6778, 6779, 6780, 6781, 4168, 6782, 6783,
          3442, 6784, 6785, 6786, 6787, 6788, 6789, 6790, 6791, 4169, 6792,
          6793, 6794, 6795, 6796, 6797, 6798, 6799, 6800, 6801, 6802, 6803,
          6804, 6805, 6806, 6807, 6808, 6809, 6810, 6811, 4835, 6812, 6813,
          6814, 4445, 6815, 6816, 4446, 6817, 6818, 6819, 6820, 6821, 6822,
          6823, 6824, 6825, 6826, 6827, 6828, 6829, 6830, 6831, 6832, 6833,
          6834, 6835, 3548, 6836, 6837, 6838, 6839, 6840, 6841, 6842, 6843,
          6844, 6845, 6846, 4836, 6847, 6848, 6849, 6850, 6851, 6852, 6853,
          6854, 3953, 6855, 6856, 6857, 6858, 6859, 6860, 6861, 6862, 6863,
          6864, 6865, 6866, 6867, 6868, 6869, 6870, 6871, 6872, 6873, 6874,
          6875, 6876, 6877, 3199, 6878, 6879, 6880, 6881, 6882, 4447, 6883,
          6884, 6885, 6886, 6887, 6888, 6889, 6890, 6891, 6892, 6893, 6894,
          6895, 6896, 6897, 6898, 6899, 6900, 6901, 6902, 6903, 6904, 4170,
          6905, 6906, 6907, 6908, 6909, 6910, 6911, 6912, 6913, 6914, 6915,
          6916, 6917, 6918, 6919, 6920, 6921, 6922, 6923, 6924, 6925, 6926,
          6927, 4837, 6928, 6929, 6930, 6931, 6932, 6933, 6934, 6935, 6936,
          3346, 6937, 6938, 4838, 6939, 6940, 6941, 4448, 6942, 6943, 6944,
          6945, 6946, 4449, 6947, 6948, 6949, 6950, 6951, 6952, 6953, 6954,
          6955, 6956, 6957, 6958, 6959, 6960, 6961, 6962, 6963, 6964, 6965,
          6966, 6967, 6968, 6969, 6970, 6971, 6972, 6973, 6974, 6975, 6976,
          6977, 6978, 6979, 6980, 6981, 6982, 6983, 6984, 6985, 6986, 6987,
          6988, 6989, 6990, 6991, 6992, 6993, 6994, 3671, 6995, 6996, 6997,
          6998, 4839, 6999, 7e3, 7001, 7002, 3549, 7003, 7004, 7005, 7006, 7007,
          7008, 7009, 7010, 7011, 7012, 7013, 7014, 7015, 7016, 7017, 7018,
          7019, 7020, 7021, 7022, 7023, 7024, 7025, 7026, 7027, 7028, 7029,
          7030, 4840, 7031, 7032, 7033, 7034, 7035, 7036, 7037, 7038, 4841,
          7039, 7040, 7041, 7042, 7043, 7044, 7045, 7046, 7047, 7048, 7049,
          7050, 7051, 7052, 7053, 7054, 7055, 7056, 7057, 7058, 7059, 7060,
          7061, 7062, 7063, 7064, 7065, 7066, 7067, 7068, 7069, 7070, 2985,
          7071, 7072, 7073, 7074, 7075, 7076, 7077, 7078, 7079, 7080, 4842,
          7081, 7082, 7083, 7084, 7085, 7086, 7087, 7088, 7089, 7090, 7091,
          7092, 7093, 7094, 7095, 7096, 7097, 7098, 7099, 7100, 7101, 7102,
          7103, 7104, 7105, 7106, 7107, 7108, 7109, 7110, 7111, 7112, 7113,
          7114, 7115, 7116, 7117, 7118, 4450, 7119, 7120, 7121, 7122, 7123,
          7124, 7125, 7126, 7127, 7128, 7129, 7130, 7131, 7132, 7133, 7134,
          7135, 7136, 7137, 7138, 7139, 7140, 7141, 7142, 7143, 4843, 7144,
          7145, 7146, 7147, 7148, 7149, 7150, 7151, 7152, 7153, 7154, 7155,
          7156, 7157, 7158, 7159, 7160, 7161, 7162, 7163, 7164, 7165, 7166,
          7167, 7168, 7169, 7170, 7171, 7172, 7173, 7174, 7175, 7176, 7177,
          7178, 7179, 7180, 7181, 7182, 7183, 7184, 7185, 7186, 7187, 7188,
          4171, 4172, 7189, 7190, 7191, 7192, 7193, 7194, 7195, 7196, 7197,
          7198, 7199, 7200, 7201, 7202, 7203, 7204, 7205, 7206, 7207, 7208,
          7209, 7210, 7211, 7212, 7213, 7214, 7215, 7216, 7217, 7218, 7219,
          7220, 7221, 7222, 7223, 7224, 7225, 7226, 7227, 7228, 7229, 7230,
          7231, 7232, 7233, 7234, 7235, 7236, 7237, 7238, 7239, 7240, 7241,
          7242, 7243, 7244, 7245, 7246, 7247, 7248, 7249, 7250, 7251, 7252,
          7253, 7254, 7255, 7256, 7257, 7258, 7259, 7260, 7261, 7262, 7263,
          7264, 7265, 7266, 7267, 7268, 7269, 7270, 7271, 7272, 7273, 7274,
          7275, 7276, 7277, 7278, 7279, 7280, 7281, 7282, 7283, 7284, 7285,
          7286, 7287, 7288, 7289, 7290, 7291, 7292, 7293, 7294, 7295, 7296,
          4844, 7297, 7298, 7299, 7300, 7301, 7302, 7303, 7304, 7305, 7306,
          7307, 7308, 7309, 7310, 7311, 7312, 7313, 7314, 7315, 7316, 4451,
          7317, 7318, 7319, 7320, 7321, 7322, 7323, 7324, 7325, 7326, 7327,
          7328, 7329, 7330, 7331, 7332, 7333, 7334, 7335, 7336, 7337, 7338,
          7339, 7340, 7341, 7342, 7343, 7344, 7345, 7346, 7347, 7348, 7349,
          7350, 7351, 7352, 7353, 4173, 7354, 7355, 4845, 7356, 7357, 7358,
          7359, 7360, 7361, 7362, 7363, 7364, 7365, 7366, 7367, 7368, 7369,
          7370, 7371, 7372, 7373, 7374, 7375, 7376, 7377, 7378, 7379, 7380,
          7381, 7382, 7383, 7384, 7385, 7386, 7387, 7388, 4846, 7389, 7390,
          7391, 7392, 7393, 7394, 7395, 7396, 7397, 7398, 7399, 7400, 7401,
          7402, 7403, 7404, 7405, 3672, 7406, 7407, 7408, 7409, 7410, 7411,
          7412, 7413, 7414, 7415, 7416, 7417, 7418, 7419, 7420, 7421, 7422,
          7423, 7424, 7425, 7426, 7427, 7428, 7429, 7430, 7431, 7432, 7433,
          7434, 7435, 7436, 7437, 7438, 7439, 7440, 7441, 7442, 7443, 7444,
          7445, 7446, 7447, 7448, 7449, 7450, 7451, 7452, 7453, 4452, 7454,
          3200, 7455, 7456, 7457, 7458, 7459, 7460, 7461, 7462, 7463, 7464,
          7465, 7466, 7467, 7468, 7469, 7470, 7471, 7472, 7473, 7474, 4847,
          7475, 7476, 7477, 3133, 7478, 7479, 7480, 7481, 7482, 7483, 7484,
          7485, 7486, 7487, 7488, 7489, 7490, 7491, 7492, 7493, 7494, 7495,
          7496, 7497, 7498, 7499, 7500, 7501, 7502, 3347, 7503, 7504, 7505,
          7506, 7507, 7508, 7509, 7510, 7511, 7512, 7513, 7514, 7515, 7516,
          7517, 7518, 7519, 7520, 7521, 4848, 7522, 7523, 7524, 7525, 7526,
          7527, 7528, 7529, 7530, 7531, 7532, 7533, 7534, 7535, 7536, 7537,
          7538, 7539, 7540, 7541, 7542, 7543, 7544, 7545, 7546, 7547, 7548,
          7549, 3801, 4849, 7550, 7551, 7552, 7553, 7554, 7555, 7556, 7557,
          7558, 7559, 7560, 7561, 7562, 7563, 7564, 7565, 7566, 7567, 7568,
          7569, 3035, 7570, 7571, 7572, 7573, 7574, 7575, 7576, 7577, 7578,
          7579, 7580, 7581, 7582, 7583, 7584, 7585, 7586, 7587, 7588, 7589,
          7590, 7591, 7592, 7593, 7594, 7595, 7596, 7597, 7598, 7599, 7600,
          7601, 7602, 7603, 7604, 7605, 7606, 7607, 7608, 7609, 7610, 7611,
          7612, 7613, 7614, 7615, 7616, 4850, 7617, 7618, 3802, 7619, 7620,
          7621, 7622, 7623, 7624, 7625, 7626, 7627, 7628, 7629, 7630, 7631,
          7632, 4851, 7633, 7634, 7635, 7636, 7637, 7638, 7639, 7640, 7641,
          7642, 7643, 7644, 7645, 7646, 7647, 7648, 7649, 7650, 7651, 7652,
          7653, 7654, 7655, 7656, 7657, 7658, 7659, 7660, 7661, 7662, 7663,
          7664, 7665, 7666, 7667, 7668, 7669, 7670, 4453, 7671, 7672, 7673,
          7674, 7675, 7676, 7677, 7678, 7679, 7680, 7681, 7682, 7683, 7684,
          7685, 7686, 7687, 7688, 7689, 7690, 7691, 7692, 7693, 7694, 7695,
          7696, 7697, 3443, 7698, 7699, 7700, 7701, 7702, 4454, 7703, 7704,
          7705, 7706, 7707, 7708, 7709, 7710, 7711, 7712, 7713, 2472, 7714,
          7715, 7716, 7717, 7718, 7719, 7720, 7721, 7722, 7723, 7724, 7725,
          7726, 7727, 7728, 7729, 7730, 7731, 3954, 7732, 7733, 7734, 7735,
          7736, 7737, 7738, 7739, 7740, 7741, 7742, 7743, 7744, 7745, 7746,
          7747, 7748, 7749, 7750, 3134, 7751, 7752, 4852, 7753, 7754, 7755,
          4853, 7756, 7757, 7758, 7759, 7760, 4174, 7761, 7762, 7763, 7764,
          7765, 7766, 7767, 7768, 7769, 7770, 7771, 7772, 7773, 7774, 7775,
          7776, 7777, 7778, 7779, 7780, 7781, 7782, 7783, 7784, 7785, 7786,
          7787, 7788, 7789, 7790, 7791, 7792, 7793, 7794, 7795, 7796, 7797,
          7798, 7799, 7800, 7801, 7802, 7803, 7804, 7805, 4854, 7806, 7807,
          7808, 7809, 7810, 7811, 7812, 7813, 7814, 7815, 7816, 7817, 7818,
          7819, 7820, 7821, 7822, 7823, 7824, 7825, 4855, 7826, 7827, 7828,
          7829, 7830, 7831, 7832, 7833, 7834, 7835, 7836, 7837, 7838, 7839,
          7840, 7841, 7842, 7843, 7844, 7845, 7846, 7847, 3955, 7848, 7849,
          7850, 7851, 7852, 7853, 7854, 7855, 7856, 7857, 7858, 7859, 7860,
          3444, 7861, 7862, 7863, 7864, 7865, 7866, 7867, 7868, 7869, 7870,
          7871, 7872, 7873, 7874, 7875, 7876, 7877, 7878, 7879, 7880, 7881,
          7882, 7883, 7884, 7885, 7886, 7887, 7888, 7889, 7890, 7891, 4175,
          7892, 7893, 7894, 7895, 7896, 4856, 4857, 7897, 7898, 7899, 7900,
          2598, 7901, 7902, 7903, 7904, 7905, 7906, 7907, 7908, 4455, 7909,
          7910, 7911, 7912, 7913, 7914, 3201, 7915, 7916, 7917, 7918, 7919,
          7920, 7921, 4858, 7922, 7923, 7924, 7925, 7926, 7927, 7928, 7929,
          7930, 7931, 7932, 7933, 7934, 7935, 7936, 7937, 7938, 7939, 7940,
          7941, 7942, 7943, 7944, 7945, 7946, 7947, 7948, 7949, 7950, 7951,
          7952, 7953, 7954, 7955, 7956, 7957, 7958, 7959, 7960, 7961, 7962,
          7963, 7964, 7965, 7966, 7967, 7968, 7969, 7970, 7971, 7972, 7973,
          7974, 7975, 7976, 7977, 7978, 7979, 7980, 7981, 4859, 7982, 7983,
          7984, 7985, 7986, 7987, 7988, 7989, 7990, 7991, 7992, 7993, 7994,
          7995, 7996, 4860, 7997, 7998, 7999, 8e3, 8001, 8002, 8003, 8004, 8005,
          8006, 8007, 8008, 8009, 8010, 8011, 8012, 8013, 8014, 8015, 8016,
          4176, 8017, 8018, 8019, 8020, 8021, 8022, 8023, 4861, 8024, 8025,
          8026, 8027, 8028, 8029, 8030, 8031, 8032, 8033, 8034, 8035, 8036,
          4862, 4456, 8037, 8038, 8039, 8040, 4863, 8041, 8042, 8043, 8044,
          8045, 8046, 8047, 8048, 8049, 8050, 8051, 8052, 8053, 8054, 8055,
          8056, 8057, 8058, 8059, 8060, 8061, 8062, 8063, 8064, 8065, 8066,
          8067, 8068, 8069, 8070, 8071, 8072, 8073, 8074, 8075, 8076, 8077,
          8078, 8079, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088,
          8089, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099,
          4864, 4177, 8100, 8101, 8102, 8103, 8104, 8105, 8106, 8107, 8108,
          8109, 8110, 8111, 8112, 8113, 8114, 8115, 8116, 8117, 8118, 8119,
          8120, 4178, 8121, 8122, 8123, 8124, 8125, 8126, 8127, 8128, 8129,
          8130, 8131, 8132, 8133, 8134, 8135, 8136, 8137, 8138, 8139, 8140,
          8141, 8142, 8143, 8144, 8145, 4865, 4866, 8146, 8147, 8148, 8149,
          8150, 8151, 8152, 8153, 8154, 8155, 8156, 8157, 8158, 8159, 8160,
          8161, 8162, 8163, 8164, 8165, 4179, 8166, 8167, 8168, 8169, 8170,
          8171, 8172, 8173, 8174, 8175, 8176, 8177, 8178, 8179, 8180, 8181,
          4457, 8182, 8183, 8184, 8185, 8186, 8187, 8188, 8189, 8190, 8191,
          8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202,
          8203, 8204, 8205, 8206, 8207, 8208, 8209, 8210, 8211, 8212, 8213,
          8214, 8215, 8216, 8217, 8218, 8219, 8220, 8221, 8222, 8223, 8224,
          8225, 8226, 8227, 8228, 8229, 8230, 8231, 8232, 8233, 8234, 8235,
          8236, 8237, 8238, 8239, 8240, 8241, 8242, 8243, 8244, 8245, 8246,
          8247, 8248, 8249, 8250, 8251, 8252, 8253, 8254, 8255, 8256, 3445,
          8257, 8258, 8259, 8260, 8261, 8262, 4458, 8263, 8264, 8265, 8266,
          8267, 8268, 8269, 8270, 8271, 8272, 4459, 8273, 8274, 8275, 8276,
          3550, 8277, 8278, 8279, 8280, 8281, 8282, 8283, 8284, 8285, 8286,
          8287, 8288, 8289, 4460, 8290, 8291, 8292, 8293, 8294, 8295, 8296,
          8297, 8298, 8299, 8300, 8301, 8302, 8303, 8304, 8305, 8306, 8307,
          4867, 8308, 8309, 8310, 8311, 8312, 3551, 8313, 8314, 8315, 8316,
          8317, 8318, 8319, 8320, 8321, 8322, 8323, 8324, 8325, 8326, 4868,
          8327, 8328, 8329, 8330, 8331, 8332, 8333, 8334, 8335, 8336, 8337,
          8338, 8339, 8340, 8341, 8342, 8343, 8344, 8345, 8346, 8347, 8348,
          8349, 8350, 8351, 8352, 8353, 8354, 8355, 8356, 8357, 8358, 8359,
          8360, 8361, 8362, 8363, 4869, 4461, 8364, 8365, 8366, 8367, 8368,
          8369, 8370, 4870, 8371, 8372, 8373, 8374, 8375, 8376, 8377, 8378,
          8379, 8380, 8381, 8382, 8383, 8384, 8385, 8386, 8387, 8388, 8389,
          8390, 8391, 8392, 8393, 8394, 8395, 8396, 8397, 8398, 8399, 8400,
          8401, 8402, 8403, 8404, 8405, 8406, 8407, 8408, 8409, 8410, 4871,
          8411, 8412, 8413, 8414, 8415, 8416, 8417, 8418, 8419, 8420, 8421,
          8422, 4462, 8423, 8424, 8425, 8426, 8427, 8428, 8429, 8430, 8431,
          8432, 8433, 2986, 8434, 8435, 8436, 8437, 8438, 8439, 8440, 8441,
          8442, 8443, 8444, 8445, 8446, 8447, 8448, 8449, 8450, 8451, 8452,
          8453, 8454, 8455, 8456, 8457, 8458, 8459, 8460, 8461, 8462, 8463,
          8464, 8465, 8466, 8467, 8468, 8469, 8470, 8471, 8472, 8473, 8474,
          8475, 8476, 8477, 8478, 4180, 8479, 8480, 8481, 8482, 8483, 8484,
          8485, 8486, 8487, 8488, 8489, 8490, 8491, 8492, 8493, 8494, 8495,
          8496, 8497, 8498, 8499, 8500, 8501, 8502, 8503, 8504, 8505, 8506,
          8507, 8508, 8509, 8510, 8511, 8512, 8513, 8514, 8515, 8516, 8517,
          8518, 8519, 8520, 8521, 8522, 8523, 8524, 8525, 8526, 8527, 8528,
          8529, 8530, 8531, 8532, 8533, 8534, 8535, 8536, 8537, 8538, 8539,
          8540, 8541, 8542, 8543, 8544, 8545, 8546, 8547, 8548, 8549, 8550,
          8551, 8552, 8553, 8554, 8555, 8556, 8557, 8558, 8559, 8560, 8561,
          8562, 8563, 8564, 4872, 8565, 8566, 8567, 8568, 8569, 8570, 8571,
          8572, 8573, 4873, 8574, 8575, 8576, 8577, 8578, 8579, 8580, 8581,
          8582, 8583, 8584, 8585, 8586, 8587, 8588, 8589, 8590, 8591, 8592,
          8593, 8594, 8595, 8596, 8597, 8598, 8599, 8600, 8601, 8602, 8603,
          8604, 8605, 3803, 8606, 8607, 8608, 8609, 8610, 8611, 8612, 8613,
          4874, 3804, 8614, 8615, 8616, 8617, 8618, 8619, 8620, 8621, 3956,
          8622, 8623, 8624, 8625, 8626, 8627, 8628, 8629, 8630, 8631, 8632,
          8633, 8634, 8635, 8636, 8637, 8638, 2865, 8639, 8640, 8641, 8642,
          8643, 8644, 8645, 8646, 8647, 8648, 8649, 8650, 8651, 8652, 8653,
          8654, 8655, 8656, 4463, 8657, 8658, 8659, 4875, 4876, 8660, 8661,
          8662, 8663, 8664, 8665, 8666, 8667, 8668, 8669, 8670, 8671, 8672,
          8673, 8674, 8675, 8676, 8677, 8678, 8679, 8680, 8681, 4464, 8682,
          8683, 8684, 8685, 8686, 8687, 8688, 8689, 8690, 8691, 8692, 8693,
          8694, 8695, 8696, 8697, 8698, 8699, 8700, 8701, 8702, 8703, 8704,
          8705, 8706, 8707, 8708, 8709, 2261, 8710, 8711, 8712, 8713, 8714,
          8715, 8716, 8717, 8718, 8719, 8720, 8721, 8722, 8723, 8724, 8725,
          8726, 8727, 8728, 8729, 8730, 8731, 8732, 8733, 4181, 8734, 8735,
          8736, 8737, 8738, 8739, 8740, 8741, 8742, 8743, 8744, 8745, 8746,
          8747, 8748, 8749, 8750, 8751, 8752, 8753, 8754, 8755, 8756, 8757,
          8758, 8759, 8760, 8761, 8762, 8763, 4877, 8764, 8765, 8766, 8767,
          8768, 8769, 8770, 8771, 8772, 8773, 8774, 8775, 8776, 8777, 8778,
          8779, 8780, 8781, 8782, 8783, 8784, 8785, 8786, 8787, 8788, 4878,
          8789, 4879, 8790, 8791, 8792, 4880, 8793, 8794, 8795, 8796, 8797,
          8798, 8799, 8800, 8801, 4881, 8802, 8803, 8804, 8805, 8806, 8807,
          8808, 8809, 8810, 8811, 8812, 8813, 8814, 8815, 3957, 8816, 8817,
          8818, 8819, 8820, 8821, 8822, 8823, 8824, 8825, 8826, 8827, 8828,
          8829, 8830, 8831, 8832, 8833, 8834, 8835, 8836, 8837, 8838, 8839,
          8840, 8841, 8842, 8843, 8844, 8845, 8846, 8847, 4882, 8848, 8849,
          8850, 8851, 8852, 8853, 8854, 8855, 8856, 8857, 8858, 8859, 8860,
          8861, 8862, 8863, 8864, 8865, 8866, 8867, 8868, 8869, 8870, 8871,
          8872, 8873, 8874, 8875, 8876, 8877, 8878, 8879, 8880, 8881, 8882,
          8883, 8884, 3202, 8885, 8886, 8887, 8888, 8889, 8890, 8891, 8892,
          8893, 8894, 8895, 8896, 8897, 8898, 8899, 8900, 8901, 8902, 8903,
          8904, 8905, 8906, 8907, 8908, 8909, 8910, 8911, 8912, 8913, 8914,
          8915, 8916, 8917, 8918, 8919, 8920, 8921, 8922, 8923, 8924, 4465,
          8925, 8926, 8927, 8928, 8929, 8930, 8931, 8932, 4883, 8933, 8934,
          8935, 8936, 8937, 8938, 8939, 8940, 8941, 8942, 8943, 2214, 8944,
          8945, 8946, 8947, 8948, 8949, 8950, 8951, 8952, 8953, 8954, 8955,
          8956, 8957, 8958, 8959, 8960, 8961, 8962, 8963, 8964, 8965, 4884,
          8966, 8967, 8968, 8969, 8970, 8971, 8972, 8973, 8974, 8975, 8976,
          8977, 8978, 8979, 8980, 8981, 8982, 8983, 8984, 8985, 8986, 8987,
          8988, 8989, 8990, 8991, 8992, 4885, 8993, 8994, 8995, 8996, 8997,
          8998, 8999, 9e3, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009,
          9010, 9011, 9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020,
          9021, 4182, 9022, 9023, 9024, 9025, 9026, 9027, 9028, 9029, 9030,
          9031, 9032, 9033, 9034, 9035, 9036, 9037, 9038, 9039, 9040, 9041,
          9042, 9043, 9044, 9045, 9046, 9047, 9048, 9049, 9050, 9051, 9052,
          9053, 9054, 9055, 9056, 9057, 9058, 9059, 9060, 9061, 9062, 9063,
          4886, 9064, 9065, 9066, 9067, 9068, 9069, 4887, 9070, 9071, 9072,
          9073, 9074, 9075, 9076, 9077, 9078, 9079, 9080, 9081, 9082, 9083,
          9084, 9085, 9086, 9087, 9088, 9089, 9090, 9091, 9092, 9093, 9094,
          9095, 9096, 9097, 9098, 9099, 9100, 9101, 9102, 9103, 9104, 9105,
          9106, 9107, 9108, 9109, 9110, 9111, 9112, 9113, 9114, 9115, 9116,
          9117, 9118, 9119, 9120, 9121, 9122, 9123, 9124, 9125, 9126, 9127,
          9128, 9129, 9130, 9131, 9132, 9133, 9134, 9135, 9136, 9137, 9138,
          9139, 9140, 9141, 3958, 9142, 9143, 9144, 9145, 9146, 9147, 9148,
          9149, 9150, 9151, 4888, 9152, 9153, 9154, 9155, 9156, 9157, 9158,
          9159, 9160, 9161, 9162, 9163, 9164, 9165, 9166, 9167, 9168, 9169,
          9170, 9171, 9172, 9173, 9174, 9175, 4889, 9176, 9177, 9178, 9179,
          9180, 9181, 9182, 9183, 9184, 9185, 9186, 9187, 9188, 9189, 9190,
          9191, 9192, 9193, 9194, 9195, 9196, 9197, 9198, 9199, 9200, 9201,
          9202, 9203, 4890, 9204, 9205, 9206, 9207, 9208, 9209, 9210, 9211,
          9212, 9213, 9214, 9215, 9216, 9217, 9218, 9219, 9220, 9221, 9222,
          4466, 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232,
          9233, 9234, 9235, 9236, 9237, 9238, 9239, 9240, 9241, 9242, 9243,
          9244, 9245, 4891, 9246, 9247, 9248, 9249, 9250, 9251, 9252, 9253,
          9254, 9255, 9256, 9257, 4892, 9258, 9259, 9260, 9261, 4893, 4894,
          9262, 9263, 9264, 9265, 9266, 9267, 9268, 9269, 9270, 9271, 9272,
          9273, 4467, 9274, 9275, 9276, 9277, 9278, 9279, 9280, 9281, 9282,
          9283, 9284, 9285, 3673, 9286, 9287, 9288, 9289, 9290, 9291, 9292,
          9293, 9294, 9295, 9296, 9297, 9298, 9299, 9300, 9301, 9302, 9303,
          9304, 9305, 9306, 9307, 9308, 9309, 9310, 9311, 9312, 9313, 9314,
          9315, 9316, 9317, 9318, 9319, 9320, 9321, 9322, 4895, 9323, 9324,
          9325, 9326, 9327, 9328, 9329, 9330, 9331, 9332, 9333, 9334, 9335,
          9336, 9337, 9338, 9339, 9340, 9341, 9342, 9343, 9344, 9345, 9346,
          9347, 4468, 9348, 9349, 9350, 9351, 9352, 9353, 9354, 9355, 9356,
          9357, 9358, 9359, 9360, 9361, 9362, 9363, 9364, 9365, 9366, 9367,
          9368, 9369, 9370, 9371, 9372, 9373, 4896, 9374, 4469, 9375, 9376,
          9377, 9378, 9379, 4897, 9380, 9381, 9382, 9383, 9384, 9385, 9386,
          9387, 9388, 9389, 9390, 9391, 9392, 9393, 9394, 9395, 9396, 9397,
          9398, 9399, 9400, 9401, 9402, 9403, 9404, 9405, 9406, 4470, 9407,
          2751, 9408, 9409, 3674, 3552, 9410, 9411, 9412, 9413, 9414, 9415,
          9416, 9417, 9418, 9419, 9420, 9421, 4898, 9422, 9423, 9424, 9425,
          9426, 9427, 9428, 9429, 3959, 9430, 9431, 9432, 9433, 9434, 9435,
          9436, 4471, 9437, 9438, 9439, 9440, 9441, 9442, 9443, 9444, 9445,
          9446, 9447, 9448, 9449, 9450, 3348, 9451, 9452, 9453, 9454, 9455,
          9456, 9457, 9458, 9459, 9460, 9461, 9462, 9463, 9464, 9465, 9466,
          9467, 9468, 9469, 9470, 9471, 9472, 4899, 9473, 9474, 9475, 9476,
          9477, 4900, 9478, 9479, 9480, 9481, 9482, 9483, 9484, 9485, 9486,
          9487, 9488, 3349, 9489, 9490, 9491, 9492, 9493, 9494, 9495, 9496,
          9497, 9498, 9499, 9500, 9501, 9502, 9503, 9504, 9505, 9506, 9507,
          9508, 9509, 9510, 9511, 9512, 9513, 9514, 9515, 9516, 9517, 9518,
          9519, 9520, 4901, 9521, 9522, 9523, 9524, 9525, 9526, 4902, 9527,
          9528, 9529, 9530, 9531, 9532, 9533, 9534, 9535, 9536, 9537, 9538,
          9539, 9540, 9541, 9542, 9543, 9544, 9545, 9546, 9547, 9548, 9549,
          9550, 9551, 9552, 9553, 9554, 9555, 9556, 9557, 9558, 9559, 9560,
          9561, 9562, 9563, 9564, 9565, 9566, 9567, 9568, 9569, 9570, 9571,
          9572, 9573, 9574, 9575, 9576, 9577, 9578, 9579, 9580, 9581, 9582,
          9583, 9584, 3805, 9585, 9586, 9587, 9588, 9589, 9590, 9591, 9592,
          9593, 9594, 9595, 9596, 9597, 9598, 9599, 9600, 9601, 9602, 4903,
          9603, 9604, 9605, 9606, 9607, 4904, 9608, 9609, 9610, 9611, 9612,
          9613, 9614, 4905, 9615, 9616, 9617, 9618, 9619, 9620, 9621, 9622,
          9623, 9624, 9625, 9626, 9627, 9628, 9629, 9630, 9631, 9632, 4906,
          9633, 9634, 9635, 9636, 9637, 9638, 9639, 9640, 9641, 9642, 9643,
          4907, 9644, 9645, 9646, 9647, 9648, 9649, 9650, 9651, 9652, 9653,
          9654, 9655, 9656, 9657, 9658, 9659, 9660, 9661, 9662, 9663, 9664,
          9665, 9666, 9667, 9668, 9669, 9670, 9671, 9672, 4183, 9673, 9674,
          9675, 9676, 9677, 4908, 9678, 9679, 9680, 9681, 4909, 9682, 9683,
          9684, 9685, 9686, 9687, 9688, 9689, 9690, 4910, 9691, 9692, 9693,
          3675, 9694, 9695, 9696, 2945, 9697, 9698, 9699, 9700, 9701, 9702,
          9703, 9704, 9705, 4911, 9706, 9707, 9708, 9709, 9710, 9711, 9712,
          9713, 9714, 9715, 9716, 9717, 9718, 9719, 9720, 9721, 9722, 9723,
          9724, 9725, 9726, 9727, 9728, 9729, 9730, 9731, 9732, 9733, 9734,
          9735, 4912, 9736, 9737, 9738, 9739, 9740, 4913, 9741, 9742, 9743,
          9744, 9745, 9746, 9747, 9748, 9749, 9750, 9751, 9752, 9753, 9754,
          9755, 9756, 9757, 9758, 4914, 9759, 9760, 9761, 9762, 9763, 9764,
          9765, 9766, 9767, 9768, 9769, 9770, 9771, 9772, 9773, 9774, 9775,
          9776, 9777, 9778, 9779, 9780, 9781, 9782, 4915, 9783, 9784, 9785,
          9786, 9787, 9788, 9789, 9790, 9791, 9792, 9793, 4916, 9794, 9795,
          9796, 9797, 9798, 9799, 9800, 9801, 9802, 9803, 9804, 9805, 9806,
          9807, 9808, 9809, 9810, 9811, 9812, 9813, 9814, 9815, 9816, 9817,
          9818, 9819, 9820, 9821, 9822, 9823, 9824, 9825, 9826, 9827, 9828,
          9829, 9830, 9831, 9832, 9833, 9834, 9835, 9836, 9837, 9838, 9839,
          9840, 9841, 9842, 9843, 9844, 9845, 9846, 9847, 9848, 9849, 9850,
          9851, 9852, 9853, 9854, 9855, 9856, 9857, 9858, 9859, 9860, 9861,
          9862, 9863, 9864, 9865, 9866, 9867, 9868, 4917, 9869, 9870, 9871,
          9872, 9873, 9874, 9875, 9876, 9877, 9878, 9879, 9880, 9881, 9882,
          9883, 9884, 9885, 9886, 9887, 9888, 9889, 9890, 9891, 9892, 4472,
          9893, 9894, 9895, 9896, 9897, 3806, 9898, 9899, 9900, 9901, 9902,
          9903, 9904, 9905, 9906, 9907, 9908, 9909, 9910, 9911, 9912, 9913,
          9914, 4918, 9915, 9916, 9917, 4919, 9918, 9919, 9920, 9921, 4184,
          9922, 9923, 9924, 9925, 9926, 9927, 9928, 9929, 9930, 9931, 9932,
          9933, 9934, 9935, 9936, 9937, 9938, 9939, 9940, 9941, 9942, 9943,
          9944, 9945, 9946, 4920, 9947, 9948, 9949, 9950, 9951, 9952, 9953,
          9954, 9955, 4185, 9956, 9957, 9958, 9959, 9960, 9961, 9962, 9963,
          9964, 9965, 4921, 9966, 9967, 9968, 4473, 9969, 9970, 9971, 9972,
          9973, 9974, 9975, 9976, 9977, 4474, 9978, 9979, 9980, 9981, 9982,
          9983, 9984, 9985, 9986, 9987, 9988, 9989, 9990, 9991, 9992, 9993,
          9994, 9995, 9996, 9997, 9998, 9999, 1e4, 10001, 10002, 10003, 10004,
          10005, 10006, 10007, 10008, 10009, 10010, 10011, 10012, 10013, 10014,
          10015, 10016, 10017, 10018, 10019, 10020, 10021, 4922, 10022, 4923,
          10023, 10024, 10025, 10026, 10027, 10028, 10029, 10030, 10031, 10032,
          10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10042,
          10043, 10044, 10045, 10046, 10047, 10048, 4924, 10049, 10050, 10051,
          10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10061,
          10062, 10063, 10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071,
          10072, 10073, 10074, 10075, 10076, 10077, 10078, 10079, 10080, 10081,
          10082, 10083, 10084, 10085, 10086, 10087, 4475, 10088, 10089, 10090,
          10091, 10092, 10093, 10094, 10095, 10096, 10097, 4476, 10098, 10099,
          10100, 10101, 10102, 10103, 10104, 10105, 10106, 10107, 10108, 10109,
          10110, 10111, 2174, 10112, 10113, 10114, 10115, 10116, 10117, 10118,
          10119, 10120, 10121, 10122, 10123, 10124, 10125, 10126, 10127, 10128,
          10129, 10130, 10131, 10132, 10133, 10134, 10135, 10136, 10137, 10138,
          10139, 10140, 3807, 4186, 4925, 10141, 10142, 10143, 10144, 10145,
          10146, 10147, 4477, 4187, 10148, 10149, 10150, 10151, 10152, 10153,
          4188, 10154, 10155, 10156, 10157, 10158, 10159, 10160, 10161, 4926,
          10162, 10163, 10164, 10165, 10166, 10167, 10168, 10169, 10170, 10171,
          10172, 10173, 10174, 10175, 10176, 10177, 10178, 10179, 10180, 10181,
          10182, 10183, 10184, 10185, 10186, 10187, 10188, 10189, 10190, 10191,
          10192, 3203, 10193, 10194, 10195, 10196, 10197, 10198, 10199, 10200,
          4478, 10201, 10202, 10203, 10204, 4479, 10205, 10206, 10207, 10208,
          10209, 10210, 10211, 10212, 10213, 10214, 10215, 10216, 10217, 10218,
          10219, 10220, 10221, 10222, 10223, 10224, 10225, 10226, 10227, 10228,
          10229, 10230, 10231, 10232, 10233, 10234, 4927, 10235, 10236, 10237,
          10238, 10239, 10240, 10241, 10242, 10243, 10244, 10245, 10246, 10247,
          10248, 10249, 10250, 10251, 10252, 10253, 10254, 10255, 10256, 10257,
          10258, 10259, 10260, 10261, 10262, 10263, 10264, 10265, 10266, 10267,
          10268, 10269, 10270, 10271, 10272, 10273, 4480, 4928, 4929, 10274,
          10275, 10276, 10277, 10278, 10279, 10280, 10281, 10282, 10283, 10284,
          10285, 10286, 10287, 10288, 10289, 10290, 10291, 10292, 10293, 10294,
          10295, 10296, 10297, 10298, 10299, 10300, 10301, 10302, 10303, 10304,
          10305, 10306, 10307, 10308, 10309, 10310, 10311, 10312, 10313, 10314,
          10315, 10316, 10317, 10318, 10319, 10320, 10321, 10322, 10323, 10324,
          10325, 10326, 10327, 10328, 10329, 10330, 10331, 10332, 10333, 10334,
          4930, 10335, 10336, 10337, 10338, 10339, 10340, 10341, 10342, 4931,
          10343, 10344, 10345, 10346, 10347, 10348, 10349, 10350, 10351, 10352,
          10353, 10354, 10355, 3088, 10356, 2786, 10357, 10358, 10359, 10360,
          4189, 10361, 10362, 10363, 10364, 10365, 10366, 10367, 10368, 10369,
          10370, 10371, 10372, 10373, 10374, 10375, 4932, 10376, 10377, 10378,
          10379, 10380, 10381, 10382, 10383, 10384, 10385, 10386, 10387, 10388,
          10389, 10390, 10391, 10392, 4933, 10393, 10394, 10395, 4934, 10396,
          10397, 10398, 10399, 10400, 10401, 10402, 10403, 10404, 10405, 10406,
          10407, 10408, 10409, 10410, 10411, 10412, 3446, 10413, 10414, 10415,
          10416, 10417, 10418, 10419, 10420, 10421, 10422, 10423, 4935, 10424,
          10425, 10426, 10427, 10428, 10429, 10430, 4936, 10431, 10432, 10433,
          10434, 10435, 10436, 10437, 10438, 10439, 10440, 10441, 10442, 10443,
          4937, 10444, 10445, 10446, 10447, 4481, 10448, 10449, 10450, 10451,
          10452, 10453, 10454, 10455, 10456, 10457, 10458, 10459, 10460, 10461,
          10462, 10463, 10464, 10465, 10466, 10467, 10468, 10469, 10470, 10471,
          10472, 10473, 10474, 10475, 10476, 10477, 10478, 10479, 10480, 10481,
          10482, 10483, 10484, 10485, 10486, 10487, 10488, 10489, 10490, 10491,
          10492, 10493, 10494, 10495, 10496, 10497, 10498, 10499, 10500, 10501,
          10502, 10503, 10504, 10505, 4938, 10506, 10507, 10508, 10509, 10510,
          2552, 10511, 10512, 10513, 10514, 10515, 10516, 3447, 10517, 10518,
          10519, 10520, 10521, 10522, 10523, 10524, 10525, 10526, 10527, 10528,
          10529, 10530, 10531, 10532, 10533, 10534, 10535, 10536, 10537, 10538,
          10539, 10540, 10541, 10542, 10543, 4482, 10544, 4939, 10545, 10546,
          10547, 10548, 10549, 10550, 10551, 10552, 10553, 10554, 10555, 10556,
          10557, 10558, 10559, 10560, 10561, 10562, 10563, 10564, 10565, 10566,
          10567, 3676, 4483, 10568, 10569, 10570, 10571, 10572, 3448, 10573,
          10574, 10575, 10576, 10577, 10578, 10579, 10580, 10581, 10582, 10583,
          10584, 10585, 10586, 10587, 10588, 10589, 10590, 10591, 10592, 10593,
          10594, 10595, 10596, 10597, 10598, 10599, 10600, 10601, 10602, 10603,
          10604, 10605, 10606, 10607, 10608, 10609, 10610, 10611, 10612, 10613,
          10614, 10615, 10616, 10617, 10618, 10619, 10620, 10621, 10622, 10623,
          10624, 10625, 10626, 10627, 4484, 10628, 10629, 10630, 10631, 10632,
          4940, 10633, 10634, 10635, 10636, 10637, 10638, 10639, 10640, 10641,
          10642, 10643, 10644, 10645, 10646, 10647, 10648, 10649, 10650, 10651,
          10652, 10653, 10654, 10655, 10656, 4941, 10657, 10658, 10659, 2599,
          10660, 10661, 10662, 10663, 10664, 10665, 10666, 3089, 10667, 10668,
          10669, 10670, 10671, 10672, 10673, 10674, 10675, 10676, 10677, 10678,
          10679, 10680, 4942, 10681, 10682, 10683, 10684, 10685, 10686, 10687,
          10688, 10689, 10690, 10691, 10692, 10693, 10694, 10695, 10696, 10697,
          4485, 10698, 10699, 10700, 10701, 10702, 10703, 10704, 4943, 10705,
          3677, 10706, 10707, 10708, 10709, 10710, 10711, 10712, 4944, 10713,
          10714, 10715, 10716, 10717, 10718, 10719, 10720, 10721, 10722, 10723,
          10724, 10725, 10726, 10727, 10728, 4945, 10729, 10730, 10731, 10732,
          10733, 10734, 10735, 10736, 10737, 10738, 10739, 10740, 10741, 10742,
          10743, 10744, 10745, 10746, 10747, 10748, 10749, 10750, 10751, 10752,
          10753, 10754, 10755, 10756, 10757, 10758, 10759, 10760, 10761, 4946,
          10762, 10763, 10764, 10765, 10766, 10767, 4947, 4948, 10768, 10769,
          10770, 10771, 10772, 10773, 10774, 10775, 10776, 10777, 10778, 10779,
          10780, 10781, 10782, 10783, 10784, 10785, 10786, 10787, 10788, 10789,
          10790, 10791, 10792, 10793, 10794, 10795, 10796, 10797, 10798, 10799,
          10800, 10801, 10802, 10803, 10804, 10805, 10806, 10807, 10808, 10809,
          10810, 10811, 10812, 10813, 10814, 10815, 10816, 10817, 10818, 10819,
          10820, 10821, 10822, 10823, 10824, 10825, 10826, 10827, 10828, 10829,
          10830, 10831, 10832, 10833, 10834, 10835, 10836, 10837, 10838, 10839,
          10840, 10841, 10842, 10843, 10844, 10845, 10846, 10847, 10848, 10849,
          10850, 10851, 10852, 10853, 10854, 10855, 10856, 10857, 10858, 10859,
          10860, 10861, 10862, 10863, 10864, 10865, 10866, 10867, 10868, 10869,
          10870, 10871, 10872, 10873, 10874, 10875, 10876, 10877, 10878, 4486,
          10879, 10880, 10881, 10882, 10883, 10884, 10885, 4949, 10886, 10887,
          10888, 10889, 10890, 10891, 10892, 10893, 10894, 10895, 10896, 10897,
          10898, 10899, 10900, 10901, 10902, 10903, 10904, 10905, 10906, 10907,
          10908, 10909, 10910, 10911, 10912, 10913, 10914, 10915, 10916, 10917,
          10918, 10919, 4487, 10920, 10921, 10922, 10923, 10924, 10925, 10926,
          10927, 10928, 10929, 10930, 10931, 10932, 4950, 10933, 10934, 10935,
          10936, 10937, 10938, 10939, 10940, 10941, 10942, 10943, 10944, 10945,
          10946, 10947, 10948, 10949, 4488, 10950, 10951, 10952, 10953, 10954,
          10955, 10956, 10957, 10958, 10959, 4190, 10960, 10961, 10962, 10963,
          10964, 10965, 10966, 10967, 10968, 10969, 10970, 10971, 10972, 10973,
          10974, 10975, 10976, 10977, 10978, 10979, 10980, 10981, 10982, 10983,
          10984, 10985, 10986, 10987, 10988, 10989, 10990, 10991, 10992, 10993,
          10994, 10995, 10996, 10997, 10998, 10999, 11e3, 11001, 11002, 11003,
          11004, 11005, 11006, 3960, 11007, 11008, 11009, 11010, 11011, 11012,
          11013, 11014, 11015, 11016, 11017, 11018, 11019, 11020, 11021, 11022,
          11023, 11024, 11025, 11026, 11027, 11028, 11029, 11030, 11031, 11032,
          4951, 11033, 11034, 11035, 11036, 11037, 11038, 11039, 11040, 11041,
          11042, 11043, 11044, 11045, 11046, 11047, 4489, 11048, 11049, 11050,
          11051, 4952, 11052, 11053, 11054, 11055, 11056, 11057, 11058, 4953,
          11059, 11060, 11061, 11062, 11063, 11064, 11065, 11066, 11067, 11068,
          11069, 11070, 11071, 4954, 11072, 11073, 11074, 11075, 11076, 11077,
          11078, 11079, 11080, 11081, 11082, 11083, 11084, 11085, 11086, 11087,
          11088, 11089, 11090, 11091, 11092, 11093, 11094, 11095, 11096, 11097,
          11098, 11099, 11100, 11101, 11102, 11103, 11104, 11105, 11106, 11107,
          11108, 11109, 11110, 11111, 11112, 11113, 11114, 11115, 3808, 11116,
          11117, 11118, 11119, 11120, 11121, 11122, 11123, 11124, 11125, 11126,
          11127, 11128, 11129, 11130, 11131, 11132, 11133, 11134, 4955, 11135,
          11136, 11137, 11138, 11139, 11140, 11141, 11142, 11143, 11144, 11145,
          11146, 11147, 11148, 11149, 11150, 11151, 11152, 11153, 11154, 11155,
          11156, 11157, 11158, 11159, 11160, 11161, 4956, 11162, 11163, 11164,
          11165, 11166, 11167, 11168, 11169, 11170, 11171, 11172, 11173, 11174,
          11175, 11176, 11177, 11178, 11179, 11180, 4957, 11181, 11182, 11183,
          11184, 11185, 11186, 4958, 11187, 11188, 11189, 11190, 11191, 11192,
          11193, 11194, 11195, 11196, 11197, 11198, 11199, 11200, 3678, 11201,
          11202, 11203, 11204, 11205, 11206, 4191, 11207, 11208, 11209, 11210,
          11211, 11212, 11213, 11214, 11215, 11216, 11217, 11218, 11219, 11220,
          11221, 11222, 11223, 11224, 11225, 11226, 11227, 11228, 11229, 11230,
          11231, 11232, 11233, 11234, 11235, 11236, 11237, 11238, 11239, 11240,
          11241, 11242, 11243, 11244, 11245, 11246, 11247, 11248, 11249, 11250,
          11251, 4959, 11252, 11253, 11254, 11255, 11256, 11257, 11258, 11259,
          11260, 11261, 11262, 11263, 11264, 11265, 11266, 11267, 11268, 11269,
          11270, 11271, 11272, 11273, 11274, 11275, 11276, 11277, 11278, 11279,
          11280, 11281, 11282, 11283, 11284, 11285, 11286, 11287, 11288, 11289,
          11290, 11291, 11292, 11293, 11294, 11295, 11296, 11297, 11298, 11299,
          11300, 11301, 11302, 11303, 11304, 11305, 11306, 11307, 11308, 11309,
          11310, 11311, 11312, 11313, 11314, 3679, 11315, 11316, 11317, 11318,
          4490, 11319, 11320, 11321, 11322, 11323, 11324, 11325, 11326, 11327,
          11328, 11329, 11330, 11331, 11332, 11333, 11334, 11335, 11336, 11337,
          11338, 11339, 11340, 11341, 11342, 11343, 11344, 11345, 11346, 11347,
          4960, 11348, 11349, 11350, 11351, 11352, 11353, 11354, 11355, 11356,
          11357, 11358, 11359, 11360, 11361, 11362, 11363, 11364, 11365, 11366,
          11367, 11368, 11369, 11370, 11371, 11372, 11373, 11374, 11375, 11376,
          11377, 3961, 4961, 11378, 11379, 11380, 11381, 11382, 11383, 11384,
          11385, 11386, 11387, 11388, 11389, 11390, 11391, 11392, 11393, 11394,
          11395, 11396, 11397, 4192, 11398, 11399, 11400, 11401, 11402, 11403,
          11404, 11405, 11406, 11407, 11408, 11409, 11410, 11411, 4962, 11412,
          11413, 11414, 11415, 11416, 11417, 11418, 11419, 11420, 11421, 11422,
          11423, 11424, 11425, 11426, 11427, 11428, 11429, 11430, 11431, 11432,
          11433, 11434, 11435, 11436, 11437, 11438, 11439, 11440, 11441, 11442,
          11443, 11444, 11445, 11446, 11447, 11448, 11449, 11450, 11451, 11452,
          11453, 11454, 11455, 11456, 11457, 11458, 11459, 11460, 11461, 11462,
          11463, 11464, 11465, 11466, 11467, 11468, 11469, 4963, 11470, 11471,
          4491, 11472, 11473, 11474, 11475, 4964, 11476, 11477, 11478, 11479,
          11480, 11481, 11482, 11483, 11484, 11485, 11486, 11487, 11488, 11489,
          11490, 11491, 11492, 4965, 11493, 11494, 11495, 11496, 11497, 11498,
          11499, 11500, 11501, 11502, 11503, 11504, 11505, 11506, 11507, 11508,
          11509, 11510, 11511, 11512, 11513, 11514, 11515, 11516, 11517, 11518,
          11519, 11520, 11521, 11522, 11523, 11524, 11525, 11526, 11527, 11528,
          11529, 3962, 11530, 11531, 11532, 11533, 11534, 11535, 11536, 11537,
          11538, 11539, 11540, 11541, 11542, 11543, 11544, 11545, 11546, 11547,
          11548, 11549, 11550, 11551, 11552, 11553, 11554, 11555, 11556, 11557,
          11558, 11559, 11560, 11561, 11562, 11563, 11564, 4193, 4194, 11565,
          11566, 11567, 11568, 11569, 11570, 11571, 11572, 11573, 11574, 11575,
          11576, 11577, 11578, 11579, 11580, 11581, 11582, 11583, 11584, 11585,
          11586, 11587, 11588, 11589, 11590, 11591, 4966, 4195, 11592, 11593,
          11594, 11595, 11596, 11597, 11598, 11599, 11600, 11601, 11602, 11603,
          11604, 3090, 11605, 11606, 11607, 11608, 11609, 11610, 4967, 11611,
          11612, 11613, 11614, 11615, 11616, 11617, 11618, 11619, 11620, 11621,
          11622, 11623, 11624, 11625, 11626, 11627, 11628, 11629, 11630, 11631,
          11632, 11633, 11634, 11635, 11636, 11637, 11638, 11639, 11640, 11641,
          11642, 11643, 11644, 11645, 11646, 11647, 11648, 11649, 11650, 11651,
          11652, 11653, 11654, 11655, 11656, 11657, 11658, 11659, 11660, 11661,
          11662, 11663, 11664, 11665, 11666, 11667, 11668, 11669, 11670, 11671,
          11672, 11673, 11674, 4968, 11675, 11676, 11677, 11678, 11679, 11680,
          11681, 11682, 11683, 11684, 11685, 11686, 11687, 11688, 11689, 11690,
          11691, 11692, 11693, 3809, 11694, 11695, 11696, 11697, 11698, 11699,
          11700, 11701, 11702, 11703, 11704, 11705, 11706, 11707, 11708, 11709,
          11710, 11711, 11712, 11713, 11714, 11715, 11716, 11717, 11718, 3553,
          11719, 11720, 11721, 11722, 11723, 11724, 11725, 11726, 11727, 11728,
          11729, 11730, 4969, 11731, 11732, 11733, 11734, 11735, 11736, 11737,
          11738, 11739, 11740, 4492, 11741, 11742, 11743, 11744, 11745, 11746,
          11747, 11748, 11749, 11750, 11751, 11752, 4970, 11753, 11754, 11755,
          11756, 11757, 11758, 11759, 11760, 11761, 11762, 11763, 11764, 11765,
          11766, 11767, 11768, 11769, 11770, 11771, 11772, 11773, 11774, 11775,
          11776, 11777, 11778, 11779, 11780, 11781, 11782, 11783, 11784, 11785,
          11786, 11787, 11788, 11789, 11790, 4971, 11791, 11792, 11793, 11794,
          11795, 11796, 11797, 4972, 11798, 11799, 11800, 11801, 11802, 11803,
          11804, 11805, 11806, 11807, 11808, 11809, 11810, 4973, 11811, 11812,
          11813, 11814, 11815, 11816, 11817, 11818, 11819, 11820, 11821, 11822,
          11823, 11824, 11825, 11826, 11827, 11828, 11829, 11830, 11831, 11832,
          11833, 11834, 3680, 3810, 11835, 11836, 4974, 11837, 11838, 11839,
          11840, 11841, 11842, 11843, 11844, 11845, 11846, 11847, 11848, 11849,
          11850, 11851, 11852, 11853, 11854, 11855, 11856, 11857, 11858, 11859,
          11860, 11861, 11862, 11863, 11864, 11865, 11866, 11867, 11868, 11869,
          11870, 11871, 11872, 11873, 11874, 11875, 11876, 11877, 11878, 11879,
          11880, 11881, 11882, 11883, 11884, 4493, 11885, 11886, 11887, 11888,
          11889, 11890, 11891, 11892, 11893, 11894, 11895, 11896, 11897, 11898,
          11899, 11900, 11901, 11902, 11903, 11904, 11905, 11906, 11907, 11908,
          11909, 11910, 11911, 11912, 11913, 11914, 11915, 4975, 11916, 11917,
          11918, 11919, 11920, 11921, 11922, 11923, 11924, 11925, 11926, 11927,
          11928, 11929, 11930, 11931, 11932, 11933, 11934, 11935, 11936, 11937,
          11938, 11939, 11940, 11941, 11942, 11943, 11944, 11945, 11946, 11947,
          11948, 11949, 4976, 11950, 11951, 11952, 11953, 11954, 11955, 11956,
          11957, 11958, 11959, 11960, 11961, 11962, 11963, 11964, 11965, 11966,
          11967, 11968, 11969, 11970, 11971, 11972, 11973, 11974, 11975, 11976,
          11977, 11978, 11979, 11980, 11981, 11982, 11983, 11984, 11985, 11986,
          11987, 4196, 11988, 11989, 11990, 11991, 11992, 4977, 11993, 11994,
          11995, 11996, 11997, 11998, 11999, 12e3, 12001, 12002, 12003, 12004,
          12005, 12006, 12007, 12008, 12009, 12010, 12011, 12012, 12013, 12014,
          12015, 12016, 12017, 12018, 12019, 12020, 12021, 12022, 12023, 12024,
          12025, 12026, 12027, 12028, 12029, 12030, 12031, 12032, 12033, 12034,
          12035, 12036, 12037, 12038, 12039, 12040, 12041, 12042, 12043, 12044,
          12045, 12046, 12047, 12048, 12049, 12050, 12051, 12052, 12053, 12054,
          12055, 12056, 12057, 12058, 12059, 12060, 12061, 4978, 12062, 12063,
          12064, 12065, 12066, 12067, 12068, 12069, 12070, 12071, 12072, 12073,
          12074, 12075, 12076, 12077, 12078, 12079, 12080, 12081, 12082, 12083,
          12084, 12085, 12086, 12087, 12088, 12089, 12090, 12091, 12092, 12093,
          12094, 12095, 12096, 12097, 12098, 12099, 12100, 12101, 12102, 12103,
          12104, 12105, 12106, 12107, 12108, 12109, 12110, 12111, 12112, 12113,
          12114, 12115, 12116, 12117, 12118, 12119, 12120, 12121, 12122, 12123,
          4979, 12124, 12125, 12126, 12127, 12128, 4197, 12129, 12130, 12131,
          12132, 12133, 12134, 12135, 12136, 12137, 12138, 12139, 12140, 12141,
          12142, 12143, 12144, 12145, 12146, 12147, 12148, 12149, 12150, 12151,
          12152, 12153, 12154, 4980, 12155, 12156, 12157, 12158, 12159, 12160,
          4494, 12161, 12162, 12163, 12164, 3811, 12165, 12166, 12167, 12168,
          12169, 4495, 12170, 12171, 4496, 12172, 12173, 12174, 12175, 12176,
          3812, 12177, 12178, 12179, 12180, 12181, 12182, 12183, 12184, 12185,
          12186, 12187, 12188, 12189, 12190, 12191, 12192, 12193, 12194, 12195,
          12196, 12197, 12198, 12199, 12200, 12201, 12202, 12203, 12204, 12205,
          12206, 12207, 12208, 12209, 12210, 12211, 12212, 12213, 12214, 12215,
          12216, 12217, 12218, 12219, 12220, 12221, 4981, 12222, 12223, 12224,
          12225, 12226, 12227, 12228, 12229, 12230, 12231, 12232, 12233, 12234,
          12235, 4982, 12236, 12237, 12238, 12239, 12240, 12241, 12242, 12243,
          12244, 12245, 4983, 12246, 12247, 12248, 12249, 4984, 12250, 12251,
          12252, 12253, 12254, 12255, 12256, 12257, 12258, 12259, 12260, 12261,
          12262, 12263, 12264, 4985, 12265, 4497, 12266, 12267, 12268, 12269,
          12270, 12271, 12272, 12273, 12274, 12275, 12276, 12277, 12278, 12279,
          12280, 12281, 12282, 12283, 12284, 12285, 12286, 12287, 4986, 12288,
          12289, 12290, 12291, 12292, 12293, 12294, 12295, 12296, 2473, 12297,
          12298, 12299, 12300, 12301, 12302, 12303, 12304, 12305, 12306, 12307,
          12308, 12309, 12310, 12311, 12312, 12313, 12314, 12315, 12316, 12317,
          12318, 12319, 3963, 12320, 12321, 12322, 12323, 12324, 12325, 12326,
          12327, 12328, 12329, 12330, 12331, 12332, 4987, 12333, 12334, 12335,
          12336, 12337, 12338, 12339, 12340, 12341, 12342, 12343, 12344, 12345,
          12346, 12347, 12348, 12349, 12350, 12351, 12352, 12353, 12354, 12355,
          12356, 12357, 12358, 12359, 3964, 12360, 12361, 12362, 12363, 12364,
          12365, 12366, 12367, 12368, 12369, 12370, 3965, 12371, 12372, 12373,
          12374, 12375, 12376, 12377, 12378, 12379, 12380, 12381, 12382, 12383,
          12384, 12385, 12386, 12387, 12388, 12389, 12390, 12391, 12392, 12393,
          12394, 12395, 12396, 12397, 12398, 12399, 12400, 12401, 12402, 12403,
          12404, 12405, 12406, 12407, 12408, 4988, 12409, 12410, 12411, 12412,
          12413, 12414, 12415, 12416, 12417, 12418, 12419, 12420, 12421, 12422,
          12423, 12424, 12425, 12426, 12427, 12428, 12429, 12430, 12431, 12432,
          12433, 12434, 12435, 12436, 12437, 12438, 3554, 12439, 12440, 12441,
          12442, 12443, 12444, 12445, 12446, 12447, 12448, 12449, 12450, 12451,
          12452, 12453, 12454, 12455, 12456, 12457, 12458, 12459, 12460, 12461,
          12462, 12463, 12464, 4989, 12465, 12466, 12467, 12468, 12469, 12470,
          12471, 12472, 12473, 12474, 12475, 12476, 12477, 12478, 12479, 12480,
          4990, 12481, 12482, 12483, 12484, 12485, 12486, 12487, 12488, 12489,
          4498, 12490, 12491, 12492, 12493, 12494, 12495, 12496, 12497, 12498,
          12499, 12500, 12501, 12502, 12503, 12504, 12505, 12506, 12507, 12508,
          12509, 12510, 12511, 12512, 12513, 12514, 12515, 12516, 12517, 12518,
          12519, 12520, 12521, 12522, 12523, 12524, 12525, 12526, 12527, 12528,
          12529, 12530, 12531, 12532, 12533, 12534, 12535, 12536, 12537, 12538,
          12539, 12540, 12541, 12542, 12543, 12544, 12545, 12546, 12547, 12548,
          12549, 12550, 12551, 4991, 12552, 12553, 12554, 12555, 12556, 12557,
          12558, 12559, 12560, 12561, 12562, 12563, 12564, 12565, 12566, 12567,
          12568, 12569, 12570, 12571, 12572, 12573, 12574, 12575, 12576, 12577,
          12578, 3036, 12579, 12580, 12581, 12582, 12583, 3966, 12584, 12585,
          12586, 12587, 12588, 12589, 12590, 12591, 12592, 12593, 12594, 12595,
          12596, 12597, 12598, 12599, 12600, 12601, 12602, 12603, 12604, 12605,
          12606, 12607, 12608, 12609, 12610, 12611, 12612, 12613, 12614, 12615,
          12616, 12617, 12618, 12619, 12620, 12621, 12622, 12623, 12624, 12625,
          12626, 12627, 12628, 12629, 12630, 12631, 12632, 12633, 12634, 12635,
          12636, 12637, 12638, 12639, 12640, 12641, 12642, 12643, 12644, 12645,
          12646, 4499, 12647, 12648, 12649, 12650, 12651, 12652, 12653, 12654,
          12655, 12656, 12657, 12658, 12659, 12660, 12661, 12662, 12663, 12664,
          12665, 12666, 12667, 12668, 12669, 12670, 12671, 12672, 12673, 12674,
          12675, 12676, 12677, 12678, 12679, 12680, 12681, 12682, 12683, 12684,
          12685, 12686, 12687, 12688, 12689, 12690, 12691, 12692, 12693, 12694,
          12695, 12696, 12697, 12698, 4992, 12699, 12700, 12701, 12702, 12703,
          12704, 12705, 12706, 12707, 12708, 12709, 12710, 12711, 12712, 12713,
          12714, 12715, 12716, 12717, 12718, 12719, 12720, 12721, 12722, 12723,
          12724, 12725, 12726, 12727, 12728, 12729, 12730, 12731, 12732, 12733,
          12734, 12735, 12736, 12737, 12738, 12739, 12740, 12741, 12742, 12743,
          12744, 12745, 12746, 12747, 12748, 12749, 12750, 12751, 12752, 12753,
          12754, 12755, 12756, 12757, 12758, 12759, 12760, 12761, 12762, 12763,
          12764, 12765, 12766, 12767, 12768, 12769, 12770, 12771, 12772, 12773,
          12774, 12775, 12776, 12777, 12778, 4993, 2175, 12779, 12780, 12781,
          12782, 12783, 12784, 12785, 12786, 4500, 12787, 12788, 12789, 12790,
          12791, 12792, 12793, 12794, 12795, 12796, 12797, 12798, 12799, 12800,
          12801, 12802, 12803, 12804, 12805, 12806, 12807, 12808, 12809, 12810,
          12811, 12812, 12813, 12814, 12815, 12816, 12817, 12818, 12819, 12820,
          12821, 12822, 12823, 12824, 12825, 12826, 4198, 3967, 12827, 12828,
          12829, 12830, 12831, 12832, 12833, 12834, 12835, 12836, 12837, 12838,
          12839, 12840, 12841, 12842, 12843, 12844, 12845, 12846, 12847, 12848,
          12849, 12850, 12851, 12852, 12853, 12854, 12855, 12856, 12857, 12858,
          12859, 12860, 12861, 4199, 12862, 12863, 12864, 12865, 12866, 12867,
          12868, 12869, 12870, 12871, 12872, 12873, 12874, 12875, 12876, 12877,
          12878, 12879, 12880, 12881, 12882, 12883, 12884, 12885, 12886, 12887,
          4501, 12888, 12889, 12890, 12891, 12892, 12893, 12894, 12895, 12896,
          12897, 12898, 12899, 12900, 12901, 12902, 12903, 12904, 12905, 12906,
          12907, 12908, 12909, 12910, 12911, 12912, 4994, 12913, 12914, 12915,
          12916, 12917, 12918, 12919, 12920, 12921, 12922, 12923, 12924, 12925,
          12926, 12927, 12928, 12929, 12930, 12931, 12932, 12933, 12934, 12935,
          12936, 12937, 12938, 12939, 12940, 12941, 12942, 12943, 12944, 12945,
          12946, 12947, 12948, 12949, 12950, 12951, 12952, 12953, 12954, 12955,
          12956, 1772, 12957, 12958, 12959, 12960, 12961, 12962, 12963, 12964,
          12965, 12966, 12967, 12968, 12969, 12970, 12971, 12972, 12973, 12974,
          12975, 12976, 12977, 12978, 12979, 12980, 12981, 12982, 12983, 12984,
          12985, 12986, 12987, 12988, 12989, 12990, 12991, 12992, 12993, 12994,
          12995, 12996, 12997, 4502, 12998, 4503, 12999, 13e3, 13001, 13002,
          13003, 4504, 13004, 13005, 13006, 13007, 13008, 13009, 13010, 13011,
          13012, 13013, 13014, 13015, 13016, 13017, 13018, 13019, 13020, 13021,
          13022, 13023, 13024, 13025, 13026, 13027, 13028, 13029, 3449, 13030,
          13031, 13032, 13033, 13034, 13035, 13036, 13037, 13038, 13039, 13040,
          13041, 13042, 13043, 13044, 13045, 13046, 13047, 13048, 13049, 13050,
          13051, 13052, 13053, 13054, 13055, 13056, 13057, 13058, 13059, 13060,
          13061, 13062, 13063, 13064, 13065, 13066, 13067, 13068, 13069, 13070,
          13071, 13072, 13073, 13074, 13075, 13076, 13077, 13078, 13079, 13080,
          13081, 13082, 13083, 13084, 13085, 13086, 13087, 13088, 13089, 13090,
          13091, 13092, 13093, 13094, 13095, 13096, 13097, 13098, 13099, 13100,
          13101, 13102, 13103, 13104, 13105, 13106, 13107, 13108, 13109, 13110,
          13111, 13112, 13113, 13114, 13115, 13116, 13117, 13118, 3968, 13119,
          4995, 13120, 13121, 13122, 13123, 13124, 13125, 13126, 13127, 4505,
          13128, 13129, 13130, 13131, 13132, 13133, 13134, 4996, 4506, 13135,
          13136, 13137, 13138, 13139, 4997, 13140, 13141, 13142, 13143, 13144,
          13145, 13146, 13147, 13148, 13149, 13150, 13151, 13152, 13153, 13154,
          13155, 13156, 13157, 13158, 13159, 4998, 13160, 13161, 13162, 13163,
          13164, 13165, 13166, 13167, 13168, 13169, 13170, 13171, 13172, 13173,
          13174, 13175, 13176, 4999, 13177, 13178, 13179, 13180, 13181, 13182,
          13183, 13184, 13185, 13186, 13187, 13188, 13189, 13190, 13191, 13192,
          13193, 13194, 13195, 13196, 13197, 13198, 13199, 13200, 13201, 13202,
          13203, 13204, 13205, 13206, 5e3, 13207, 13208, 13209, 13210, 13211,
          13212, 13213, 13214, 13215, 13216, 13217, 13218, 13219, 13220, 13221,
          13222, 13223, 13224, 13225, 13226, 13227, 4200, 5001, 13228, 13229,
          13230, 13231, 13232, 13233, 13234, 13235, 13236, 13237, 13238, 13239,
          13240, 3969, 13241, 13242, 13243, 13244, 3970, 13245, 13246, 13247,
          13248, 13249, 13250, 13251, 13252, 13253, 13254, 13255, 13256, 13257,
          13258, 13259, 13260, 13261, 13262, 13263, 13264, 13265, 13266, 13267,
          13268, 3450, 13269, 13270, 13271, 13272, 13273, 13274, 13275, 13276,
          5002, 13277, 13278, 13279, 13280, 13281, 13282, 13283, 13284, 13285,
          13286, 13287, 13288, 13289, 13290, 13291, 13292, 13293, 13294, 13295,
          13296, 13297, 13298, 13299, 13300, 13301, 13302, 3813, 13303, 13304,
          13305, 13306, 13307, 13308, 13309, 13310, 13311, 13312, 13313, 13314,
          13315, 13316, 13317, 13318, 13319, 13320, 13321, 13322, 13323, 13324,
          13325, 13326, 13327, 13328, 4507, 13329, 13330, 13331, 13332, 13333,
          13334, 13335, 13336, 13337, 13338, 13339, 13340, 13341, 5003, 13342,
          13343, 13344, 13345, 13346, 13347, 13348, 13349, 13350, 13351, 13352,
          13353, 13354, 13355, 13356, 13357, 13358, 13359, 13360, 13361, 13362,
          13363, 13364, 13365, 13366, 13367, 5004, 13368, 13369, 13370, 13371,
          13372, 13373, 13374, 13375, 13376, 13377, 13378, 13379, 13380, 13381,
          13382, 13383, 13384, 13385, 13386, 13387, 13388, 13389, 13390, 13391,
          13392, 13393, 13394, 13395, 13396, 13397, 13398, 13399, 13400, 13401,
          13402, 13403, 13404, 13405, 13406, 13407, 13408, 13409, 13410, 13411,
          13412, 13413, 13414, 13415, 13416, 13417, 13418, 13419, 13420, 13421,
          13422, 13423, 13424, 13425, 13426, 13427, 13428, 13429, 13430, 13431,
          13432, 4508, 13433, 13434, 13435, 4201, 13436, 13437, 13438, 13439,
          13440, 13441, 13442, 13443, 13444, 13445, 13446, 13447, 13448, 13449,
          13450, 13451, 13452, 13453, 13454, 13455, 13456, 13457, 5005, 13458,
          13459, 13460, 13461, 13462, 13463, 13464, 13465, 13466, 13467, 13468,
          13469, 13470, 4509, 13471, 13472, 13473, 13474, 13475, 13476, 13477,
          13478, 13479, 13480, 13481, 13482, 13483, 13484, 13485, 13486, 13487,
          13488, 13489, 13490, 13491, 13492, 13493, 13494, 13495, 13496, 13497,
          13498, 13499, 13500, 13501, 13502, 13503, 13504, 13505, 13506, 13507,
          13508, 13509, 13510, 13511, 13512, 13513, 13514, 13515, 13516, 13517,
          13518, 13519, 13520, 13521, 13522, 13523, 13524, 13525, 13526, 13527,
          13528, 13529, 13530, 13531, 13532, 13533, 13534, 13535, 13536, 13537,
          13538, 13539, 13540, 13541, 13542, 13543, 13544, 13545, 13546, 13547,
          13548, 13549, 13550, 13551, 13552, 13553, 13554, 13555, 13556, 13557,
          13558, 13559, 13560, 13561, 13562, 13563, 13564, 13565, 13566, 13567,
          13568, 13569, 13570, 13571, 13572, 13573, 13574, 13575, 13576, 13577,
          13578, 13579, 13580, 13581, 13582, 13583, 13584, 13585, 13586, 13587,
          13588, 13589, 13590, 13591, 13592, 13593, 13594, 13595, 13596, 13597,
          13598, 13599, 13600, 13601, 13602, 13603, 13604, 13605, 13606, 13607,
          13608, 13609, 13610, 13611, 13612, 13613, 13614, 13615, 13616, 13617,
          13618, 13619, 13620, 13621, 13622, 13623, 13624, 13625, 13626, 13627,
          13628, 13629, 13630, 13631, 13632, 13633, 13634, 13635, 13636, 13637,
          13638, 13639, 13640, 13641, 13642, 5006, 13643, 13644, 13645, 13646,
          13647, 13648, 13649, 13650, 13651, 5007, 13652, 13653, 13654, 13655,
          13656, 13657, 13658, 13659, 13660, 13661, 13662, 13663, 13664, 13665,
          13666, 13667, 13668, 13669, 13670, 13671, 13672, 13673, 13674, 13675,
          13676, 13677, 13678, 13679, 13680, 13681, 13682, 13683, 13684, 13685,
          13686, 13687, 13688, 13689, 13690, 13691, 13692, 13693, 13694, 13695,
          13696, 13697, 13698, 13699, 13700, 13701, 13702, 13703, 13704, 13705,
          13706, 13707, 13708, 13709, 13710, 13711, 13712, 13713, 13714, 13715,
          13716, 13717, 13718, 13719, 13720, 13721, 13722, 13723, 13724, 13725,
          13726, 13727, 13728, 13729, 13730, 13731, 13732, 13733, 13734, 13735,
          13736, 13737, 13738, 13739, 13740, 13741, 13742, 13743, 13744, 13745,
          13746, 13747, 13748, 13749, 13750, 13751, 13752, 13753, 13754, 13755,
          13756, 13757, 13758, 13759, 13760, 13761, 13762, 13763, 13764, 13765,
          13766, 13767, 13768, 13769, 13770, 13771, 13772, 13773, 13774, 3273,
          13775, 13776, 13777, 13778, 13779, 13780, 13781, 13782, 13783, 13784,
          13785, 13786, 13787, 13788, 13789, 13790, 13791, 13792, 13793, 13794,
          13795, 13796, 13797, 13798, 13799, 13800, 13801, 13802, 13803, 13804,
          13805, 13806, 13807, 13808, 13809, 13810, 13811, 13812, 13813, 13814,
          13815, 13816, 13817, 13818, 13819, 13820, 13821, 13822, 13823, 13824,
          13825, 13826, 13827, 13828, 13829, 13830, 13831, 13832, 13833, 13834,
          13835, 13836, 13837, 13838, 13839, 13840, 13841, 13842, 13843, 13844,
          13845, 13846, 13847, 13848, 13849, 13850, 13851, 13852, 13853, 13854,
          13855, 13856, 13857, 13858, 13859, 13860, 13861, 13862, 13863, 13864,
          13865, 13866, 13867, 13868, 13869, 13870, 13871, 13872, 13873, 13874,
          13875, 13876, 13877, 13878, 13879, 13880, 13881, 13882, 13883, 13884,
          13885, 13886, 13887, 13888, 13889, 13890, 13891, 13892, 13893, 13894,
          13895, 13896, 13897, 13898, 13899, 13900, 13901, 13902, 13903, 13904,
          13905, 13906, 13907, 13908, 13909, 13910, 13911, 13912, 13913, 13914,
          13915, 13916, 13917, 13918, 13919, 13920, 13921, 13922, 13923, 13924,
          13925, 13926, 13927, 13928, 13929, 13930, 13931, 13932, 13933, 13934,
          13935, 13936, 13937, 13938, 13939, 13940, 13941, 13942, 13943, 13944,
          13945, 13946, 13947, 13948, 13949, 13950, 13951, 13952, 13953, 13954,
          13955, 13956, 13957, 13958, 13959, 13960, 13961, 13962, 13963, 13964,
          13965, 13966, 13967, 13968, 13969, 13970, 13971, 13972,
        ]));
    },
    77388(eA, el, ec) {
      var eu = ec(91203),
        ed = ec(95927),
        ep = ec(75546),
        eg = ec(71662);
      function UTF8Prober() {
        ed.apply(this);
        var eA = 0.5,
          el = this;
        function init() {
          ((el._mCodingSM = new eu(eg)), el.reset());
        }
        ((this.reset = function () {
          (UTF8Prober.prototype.reset.apply(this),
            this._mCodingSM.reset(),
            (this._mNumOfMBChar = 0),
            (this._mMBCharLen = 0),
            (this._mFullLen = 0),
            (this._mBasicAsciiLen = 0));
        }),
          (this.getCharsetName = function () {
            return "UTF-8";
          }),
          (this.feed = function (eA) {
            this._mFullLen += eA.length;
            for (var el, ec = 0; ec < eA.length; ec++) {
              el = eA[ec];
              var eu = this._mCodingSM.nextState(el);
              if (eu == ep.error) {
                this._mState = ep.notMe;
                break;
              }
              if (eu == ep.itsMe) {
                this._mState = ep.foundIt;
                break;
              }
              eu == ep.start &&
                (this._mCodingSM.getCurrentCharLen() >= 2
                  ? (this._mNumOfMBChar++,
                    (this._mMBCharLen += this._mCodingSM.getCurrentCharLen()))
                  : 128 > el.charCodeAt(0) && this._mBasicAsciiLen++);
            }
            return (
              this.getState() == ep.detecting &&
                this.getConfidence() > ep.SHORTCUT_THRESHOLD &&
                (this._mState = ep.foundIt),
              this.getState()
            );
          }),
          (this.getConfidence = function () {
            var el = 0.99,
              ec = 0,
              eu = this._mFullLen - this._mBasicAsciiLen;
            return (eu > 0 && (ec = this._mMBCharLen / eu),
            this._mNumOfMBChar < 6 && ec <= 0.6)
              ? 1 - (el *= Math.pow(eA, this._mNumOfMBChar))
              : el;
          }),
          init());
      }
      ((UTF8Prober.prototype = new ed()), (eA.exports = UTF8Prober));
    },
    71662(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = {
        classTable: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4,
          4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5,
          5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
          6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 8, 8, 8, 8, 8,
          8, 8, 8, 8, 8, 8, 8, 9, 8, 8, 10, 11, 11, 11, 11, 11, 11, 11, 12, 13,
          13, 13, 14, 15, 0, 0,
        ],
        classFactor: 16,
        stateTable: [
          eu.error,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          12,
          10,
          9,
          11,
          8,
          7,
          6,
          5,
          4,
          3,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.error,
          eu.error,
          5,
          5,
          5,
          5,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          5,
          5,
          5,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          7,
          7,
          7,
          7,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          7,
          7,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          9,
          9,
          9,
          9,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          9,
          9,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          12,
          12,
          12,
          12,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          12,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          12,
          12,
          12,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
        ],
        charLenTable: [0, 1, 0, 0, 0, 0, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6],
        name: "UTF-8",
      };
    },
    31122(eA, el, ec) {
      var eu = ec(91203),
        ed = ec(67326),
        ep = ec(40236),
        eg = ec(18141).SJISDistributionAnalysis,
        eh = ec(24612).SJISContextAnalysis,
        ef = ec(75546),
        em = ec(12719);
      function SJISProber() {
        ed.apply(this);
        var eA = this;
        function init() {
          ((eA._mCodingSM = new eu(ep)),
            (eA._mDistributionAnalyzer = new eg()),
            (eA._mContextAnalyzer = new eh()),
            eA.reset());
        }
        ((this.reset = function () {
          (SJISProber.prototype.reset.apply(this),
            this._mContextAnalyzer.reset());
        }),
          (this.getCharsetName = function () {
            return "SHIFT_JIS";
          }),
          (this.feed = function (eA) {
            for (var el = eA.length, ec = 0; ec < el; ec++) {
              var eu = this._mCodingSM.nextState(eA[ec]);
              if (eu == ef.error) {
                (em.log(
                  this.getCharsetName() +
                    " prober hit error at byte " +
                    ec +
                    "\n",
                ),
                  (this._mState = ef.notMe));
                break;
              }
              if (eu == ef.itsMe) {
                this._mState = ef.foundIt;
                break;
              }
              if (eu == ef.start) {
                var ed = this._mCodingSM.getCurrentCharLen();
                0 == ec
                  ? ((this._mLastChar[1] = eA[0]),
                    this._mContextAnalyzer.feed(
                      this._mLastChar.slice(2 - ed).join(""),
                      ed,
                    ),
                    this._mDistributionAnalyzer.feed(
                      this._mLastChar.join(""),
                      ed,
                    ))
                  : (this._mContextAnalyzer.feed(
                      eA.slice(ec + 1 - ed, ec + 3 - ed),
                      ed,
                    ),
                    this._mDistributionAnalyzer.feed(
                      eA.slice(ec - 1, ec + 1),
                      ed,
                    ));
              }
            }
            return (
              (this._mLastChar[0] = eA[el - 1]),
              this.getState() == ef.detecting &&
                this._mContextAnalyzer.gotEnoughData() &&
                this.getConfidence() > ef.SHORTCUT_THRESHOLD &&
                (this._mState = ef.foundIt),
              this.getState()
            );
          }),
          (this.getConfidence = function () {
            return Math.max(
              this._mContextAnalyzer.getConfidence(),
              this._mDistributionAnalyzer.getConfidence(),
            );
          }),
          init());
      }
      ((SJISProber.prototype = new ed()), (eA.exports = SJISProber));
    },
    40236(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = {
        classTable: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          0, 0, 0,
        ],
        classFactor: 6,
        stateTable: [
          eu.error,
          eu.start,
          eu.start,
          3,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.error,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
        ],
        charLenTable: [0, 1, 1, 2, 0, 0],
        name: "Shift_JIS",
      };
    },
    24612(eA, el) {
      function JapaneseContextAnalysis() {
        var eA = 6,
          ec = -1,
          eu = 100,
          ed = 1e3,
          ep = 4,
          eg = this;
        function init() {
          eg.reset();
        }
        ((this.reset = function () {
          ((this._mTotalRel = 0), (this._mRelSample = []));
          for (var el = 0; el < eA; this._mRelSample[el++] = 0);
          ((this._mNeedToSkipCharNum = 0),
            (this._mLastCharOrder = -1),
            (this._mDone = !1));
        }),
          (this.feed = function (eA, ec) {
            if (!this._mDone)
              for (var eu = this._mNeedToSkipCharNum; eu < ec; ) {
                var ep = this.getOrder(eA.slice(eu, eu + 2)),
                  eg = ep[0];
                if ((eu += ep[1]) > ec)
                  ((this._mNeedToSkipCharNum = eu - ec),
                    (this._mLastCharOrder = -1));
                else {
                  if (-1 != eg && -1 != this._mLastCharOrder) {
                    if (((this._mTotalRel += 1), this._mTotalRel > ed)) {
                      this._mDone = !0;
                      break;
                    }
                    this._mRelSample[
                      el.jp2CharContext[this._mLastCharOrder][eg]
                    ] += 1;
                  }
                  this._mLastCharOrder = eg;
                }
              }
          }),
          (this.gotEnoughData = function () {
            return this._mTotalRel > eu;
          }),
          (this.getConfidence = function () {
            return this._mTotalRel > ep
              ? (this._mTotalRel - this._mRelSample[0]) / this._mTotalRel
              : ec;
          }),
          (this.getOrder = function (eA) {
            return [-1, 1];
          }),
          init());
      }
      function SJISContextAnalysis() {
        this.getOrder = function (eA) {
          if (!eA) return [-1, 1];
          if (
            (eA.charCodeAt(0) >= 129 && 159 >= eA.charCodeAt(0)) ||
            (eA.charCodeAt(0) >= 224 && 252 >= eA.charCodeAt(0))
          )
            var el = 2;
          else el = 1;
          return eA.length > 1 &&
            130 == eA.charCodeAt(0) &&
            eA.charCodeAt(1) >= 159 &&
            241 >= eA.charCodeAt(0)
            ? [eA.charCodeAt(1) - 159, el]
            : [-1, el];
        };
      }
      function EUCJPContextAnalysis() {
        this.getOrder = function (eA) {
          if (!eA) return [-1, 1];
          if (
            eA.charCodeAt(0) >= 142 ||
            (eA.charCodeAt(0) >= 161 && 254 >= eA.charCodeAt(0))
          )
            var el = 2;
          else el = 143 == eA.charCodeAt(0) ? 3 : 1;
          return eA.length > 1 &&
            164 == eA.charCodeAt(0) &&
            eA.charCodeAt(1) >= 161 &&
            243 >= eA.charCodeAt(1)
            ? [eA.charCodeAt(1) - 161, el]
            : [-1, el];
        };
      }
      ((el.jp2CharContext = [
        [
          0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ],
        [
          2, 4, 0, 4, 0, 3, 0, 4, 0, 3, 4, 4, 4, 2, 4, 3, 3, 4, 3, 2, 3, 3, 4,
          2, 3, 3, 3, 2, 4, 1, 4, 3, 3, 1, 5, 4, 3, 4, 3, 4, 3, 5, 3, 0, 3, 5,
          4, 2, 0, 3, 1, 0, 3, 3, 0, 3, 3, 0, 1, 1, 0, 4, 3, 0, 3, 3, 0, 4, 0,
          2, 0, 3, 5, 5, 5, 5, 4, 0, 4, 1, 0, 3, 4,
        ],
        [
          0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        ],
        [
          0, 4, 0, 5, 0, 5, 0, 4, 0, 4, 5, 4, 4, 3, 5, 3, 5, 1, 5, 3, 4, 3, 4,
          4, 3, 4, 3, 3, 4, 3, 5, 4, 4, 3, 5, 5, 3, 5, 5, 5, 3, 5, 5, 3, 4, 5,
          5, 3, 1, 3, 2, 0, 3, 4, 0, 4, 2, 0, 4, 2, 1, 5, 3, 2, 3, 5, 0, 4, 0,
          2, 0, 5, 4, 4, 5, 4, 5, 0, 4, 0, 0, 4, 4,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 3, 0, 4, 0, 3, 0, 3, 0, 4, 5, 4, 3, 3, 3, 3, 4, 3, 5, 4, 4, 3, 5,
          4, 4, 3, 4, 3, 4, 4, 4, 4, 5, 3, 4, 4, 3, 4, 5, 5, 4, 5, 5, 1, 4, 5,
          4, 3, 0, 3, 3, 1, 3, 3, 0, 4, 4, 0, 3, 3, 1, 5, 3, 3, 3, 5, 0, 4, 0,
          3, 0, 4, 4, 3, 4, 3, 3, 0, 4, 1, 1, 3, 4,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 4, 0, 3, 0, 3, 0, 4, 0, 3, 4, 4, 3, 2, 2, 1, 2, 1, 3, 1, 3, 3, 3,
          3, 3, 4, 3, 1, 3, 3, 5, 3, 3, 0, 4, 3, 0, 5, 4, 3, 3, 5, 4, 4, 3, 4,
          4, 5, 0, 1, 2, 0, 1, 2, 0, 2, 2, 0, 1, 0, 0, 5, 2, 2, 1, 4, 0, 3, 0,
          1, 0, 4, 4, 3, 5, 4, 3, 0, 2, 1, 0, 4, 3,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 3, 0, 5, 0, 4, 0, 2, 1, 4, 4, 2, 4, 1, 4, 2, 4, 2, 4, 3, 3, 3, 4,
          3, 3, 3, 3, 1, 4, 2, 3, 3, 3, 1, 4, 4, 1, 1, 1, 4, 3, 3, 2, 0, 2, 4,
          3, 2, 0, 3, 3, 0, 3, 1, 1, 0, 0, 0, 3, 3, 0, 4, 2, 2, 3, 4, 0, 4, 0,
          3, 0, 4, 4, 5, 3, 4, 4, 0, 3, 0, 0, 1, 4,
        ],
        [
          1, 4, 0, 4, 0, 4, 0, 4, 0, 3, 5, 4, 4, 3, 4, 3, 5, 4, 3, 3, 4, 3, 5,
          4, 4, 4, 4, 3, 4, 2, 4, 3, 3, 1, 5, 4, 3, 2, 4, 5, 4, 5, 5, 4, 4, 5,
          4, 4, 0, 3, 2, 2, 3, 3, 0, 4, 3, 1, 3, 2, 1, 4, 3, 3, 4, 5, 0, 3, 0,
          2, 0, 4, 5, 5, 4, 5, 4, 0, 4, 0, 0, 5, 4,
        ],
        [
          0, 5, 0, 5, 0, 4, 0, 3, 0, 4, 4, 3, 4, 3, 3, 3, 4, 0, 4, 4, 4, 3, 4,
          3, 4, 3, 3, 1, 4, 2, 4, 3, 4, 0, 5, 4, 1, 4, 5, 4, 4, 5, 3, 2, 4, 3,
          4, 3, 2, 4, 1, 3, 3, 3, 2, 3, 2, 0, 4, 3, 3, 4, 3, 3, 3, 4, 0, 4, 0,
          3, 0, 4, 5, 4, 4, 4, 3, 0, 4, 1, 0, 1, 3,
        ],
        [
          0, 3, 1, 4, 0, 3, 0, 2, 0, 3, 4, 4, 3, 1, 4, 2, 3, 3, 4, 3, 4, 3, 4,
          3, 4, 4, 3, 2, 3, 1, 5, 4, 4, 1, 4, 4, 3, 5, 4, 4, 3, 5, 5, 4, 3, 4,
          4, 3, 1, 2, 3, 1, 2, 2, 0, 3, 2, 0, 3, 1, 0, 5, 3, 3, 3, 4, 3, 3, 3,
          3, 4, 4, 4, 4, 5, 4, 2, 0, 3, 3, 2, 4, 3,
        ],
        [
          0, 2, 0, 3, 0, 1, 0, 1, 0, 0, 3, 2, 0, 0, 2, 0, 1, 0, 2, 1, 3, 3, 3,
          1, 2, 3, 1, 0, 1, 0, 4, 2, 1, 1, 3, 3, 0, 4, 3, 3, 1, 4, 3, 3, 0, 3,
          3, 2, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 4, 1, 0, 2, 3, 2, 2, 2,
          1, 3, 3, 3, 4, 4, 3, 2, 0, 3, 1, 0, 3, 3,
        ],
        [
          0, 4, 0, 4, 0, 3, 0, 3, 0, 4, 4, 4, 3, 3, 3, 3, 3, 3, 4, 3, 4, 2, 4,
          3, 4, 3, 3, 2, 4, 3, 4, 5, 4, 1, 4, 5, 3, 5, 4, 5, 3, 5, 4, 0, 3, 5,
          5, 3, 1, 3, 3, 2, 2, 3, 0, 3, 4, 1, 3, 3, 2, 4, 3, 3, 3, 4, 0, 4, 0,
          3, 0, 4, 5, 4, 4, 5, 3, 0, 4, 1, 0, 3, 4,
        ],
        [
          0, 2, 0, 3, 0, 3, 0, 0, 0, 2, 2, 2, 1, 0, 1, 0, 0, 0, 3, 0, 3, 0, 3,
          0, 1, 3, 1, 0, 3, 1, 3, 3, 3, 1, 3, 3, 3, 0, 1, 3, 1, 3, 4, 0, 0, 3,
          1, 1, 0, 3, 2, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 3, 3, 2, 0, 3, 0, 0, 0,
          0, 0, 3, 4, 3, 4, 3, 3, 0, 3, 0, 0, 2, 3,
        ],
        [
          2, 3, 0, 3, 0, 2, 0, 1, 0, 3, 3, 4, 3, 1, 3, 1, 1, 1, 3, 1, 4, 3, 4,
          3, 3, 3, 0, 0, 3, 1, 5, 4, 3, 1, 4, 3, 2, 5, 5, 4, 4, 4, 4, 3, 3, 4,
          4, 4, 0, 2, 1, 1, 3, 2, 0, 1, 2, 0, 0, 1, 0, 4, 1, 3, 3, 3, 0, 3, 0,
          1, 0, 4, 4, 4, 5, 5, 3, 0, 2, 0, 0, 4, 4,
        ],
        [
          0, 2, 0, 1, 0, 3, 1, 3, 0, 2, 3, 3, 3, 0, 3, 1, 0, 0, 3, 0, 3, 2, 3,
          1, 3, 2, 1, 1, 0, 0, 4, 2, 1, 0, 2, 3, 1, 4, 3, 2, 0, 4, 4, 3, 1, 3,
          1, 3, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 4, 1, 1, 1, 2, 0, 3, 0,
          0, 0, 3, 4, 2, 4, 3, 2, 0, 1, 0, 0, 3, 3,
        ],
        [
          0, 1, 0, 4, 0, 5, 0, 4, 0, 2, 4, 4, 2, 3, 3, 2, 3, 3, 5, 3, 3, 3, 4,
          3, 4, 2, 3, 0, 4, 3, 3, 3, 4, 1, 4, 3, 2, 1, 5, 5, 3, 4, 5, 1, 3, 5,
          4, 2, 0, 3, 3, 0, 1, 3, 0, 4, 2, 0, 1, 3, 1, 4, 3, 3, 3, 3, 0, 3, 0,
          1, 0, 3, 4, 4, 4, 5, 5, 0, 3, 0, 1, 4, 5,
        ],
        [
          0, 2, 0, 3, 0, 3, 0, 0, 0, 2, 3, 1, 3, 0, 4, 0, 1, 1, 3, 0, 3, 4, 3,
          2, 3, 1, 0, 3, 3, 2, 3, 1, 3, 0, 2, 3, 0, 2, 1, 4, 1, 2, 2, 0, 0, 3,
          3, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 3, 2, 1, 3, 3, 0, 2, 0,
          2, 0, 0, 3, 3, 1, 2, 4, 0, 3, 0, 2, 2, 3,
        ],
        [
          2, 4, 0, 5, 0, 4, 0, 4, 0, 2, 4, 4, 4, 3, 4, 3, 3, 3, 1, 2, 4, 3, 4,
          3, 4, 4, 5, 0, 3, 3, 3, 3, 2, 0, 4, 3, 1, 4, 3, 4, 1, 4, 4, 3, 3, 4,
          4, 3, 1, 2, 3, 0, 4, 2, 0, 4, 1, 0, 3, 3, 0, 4, 3, 3, 3, 4, 0, 4, 0,
          2, 0, 3, 5, 3, 4, 5, 2, 0, 3, 0, 0, 4, 5,
        ],
        [
          0, 3, 0, 4, 0, 1, 0, 1, 0, 1, 3, 2, 2, 1, 3, 0, 3, 0, 2, 0, 2, 0, 3,
          0, 2, 0, 0, 0, 1, 0, 1, 1, 0, 0, 3, 1, 0, 0, 0, 4, 0, 3, 1, 0, 2, 1,
          3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4, 2, 2, 3, 1, 0, 3, 0,
          0, 0, 1, 4, 4, 4, 3, 0, 0, 4, 0, 0, 1, 4,
        ],
        [
          1, 4, 1, 5, 0, 3, 0, 3, 0, 4, 5, 4, 4, 3, 5, 3, 3, 4, 4, 3, 4, 1, 3,
          3, 3, 3, 2, 1, 4, 1, 5, 4, 3, 1, 4, 4, 3, 5, 4, 4, 3, 5, 4, 3, 3, 4,
          4, 4, 0, 3, 3, 1, 2, 3, 0, 3, 1, 0, 3, 3, 0, 5, 4, 4, 4, 4, 4, 4, 3,
          3, 5, 4, 4, 3, 3, 5, 4, 0, 3, 2, 0, 4, 4,
        ],
        [
          0, 2, 0, 3, 0, 1, 0, 0, 0, 1, 3, 3, 3, 2, 4, 1, 3, 0, 3, 1, 3, 0, 2,
          2, 1, 1, 0, 0, 2, 0, 4, 3, 1, 0, 4, 3, 0, 4, 4, 4, 1, 4, 3, 1, 1, 3,
          3, 1, 0, 2, 0, 0, 1, 3, 0, 0, 0, 0, 2, 0, 0, 4, 3, 2, 4, 3, 5, 4, 3,
          3, 3, 4, 3, 3, 4, 3, 3, 0, 2, 1, 0, 3, 3,
        ],
        [
          0, 2, 0, 4, 0, 3, 0, 2, 0, 2, 5, 5, 3, 4, 4, 4, 4, 1, 4, 3, 3, 0, 4,
          3, 4, 3, 1, 3, 3, 2, 4, 3, 0, 3, 4, 3, 0, 3, 4, 4, 2, 4, 4, 0, 4, 5,
          3, 3, 2, 2, 1, 1, 1, 2, 0, 1, 5, 0, 3, 3, 2, 4, 3, 3, 3, 4, 0, 3, 0,
          2, 0, 4, 4, 3, 5, 5, 0, 0, 3, 0, 2, 3, 3,
        ],
        [
          0, 3, 0, 4, 0, 3, 0, 1, 0, 3, 4, 3, 3, 1, 3, 3, 3, 0, 3, 1, 3, 0, 4,
          3, 3, 1, 1, 0, 3, 0, 3, 3, 0, 0, 4, 4, 0, 1, 5, 4, 3, 3, 5, 0, 3, 3,
          4, 3, 0, 2, 0, 1, 1, 1, 0, 1, 3, 0, 1, 2, 1, 3, 3, 2, 3, 3, 0, 3, 0,
          1, 0, 1, 3, 3, 4, 4, 1, 0, 1, 2, 2, 1, 3,
        ],
        [
          0, 1, 0, 4, 0, 4, 0, 3, 0, 1, 3, 3, 3, 2, 3, 1, 1, 0, 3, 0, 3, 3, 4,
          3, 2, 4, 2, 0, 1, 0, 4, 3, 2, 0, 4, 3, 0, 5, 3, 3, 2, 4, 4, 4, 3, 3,
          3, 4, 0, 1, 3, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 4, 2, 3, 3, 3, 0, 3, 0,
          0, 0, 4, 4, 4, 5, 3, 2, 0, 3, 3, 0, 3, 5,
        ],
        [
          0, 2, 0, 3, 0, 0, 0, 3, 0, 1, 3, 0, 2, 0, 0, 0, 1, 0, 3, 1, 1, 3, 3,
          0, 0, 3, 0, 0, 3, 0, 2, 3, 1, 0, 3, 1, 0, 3, 3, 2, 0, 4, 2, 2, 0, 2,
          0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 1, 0, 1, 0,
          0, 0, 1, 3, 1, 2, 0, 0, 0, 1, 0, 0, 1, 4,
        ],
        [
          0, 3, 0, 3, 0, 5, 0, 1, 0, 2, 4, 3, 1, 3, 3, 2, 1, 1, 5, 2, 1, 0, 5,
          1, 2, 0, 0, 0, 3, 3, 2, 2, 3, 2, 4, 3, 0, 0, 3, 3, 1, 3, 3, 0, 2, 5,
          3, 4, 0, 3, 3, 0, 1, 2, 0, 2, 2, 0, 3, 2, 0, 2, 2, 3, 3, 3, 0, 2, 0,
          1, 0, 3, 4, 4, 2, 5, 4, 0, 3, 0, 0, 3, 5,
        ],
        [
          0, 3, 0, 3, 0, 3, 0, 1, 0, 3, 3, 3, 3, 0, 3, 0, 2, 0, 2, 1, 1, 0, 2,
          0, 1, 0, 0, 0, 2, 1, 0, 0, 1, 0, 3, 2, 0, 0, 3, 3, 1, 2, 3, 1, 0, 3,
          3, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 3, 1, 2, 3, 0, 3, 0,
          1, 0, 3, 2, 1, 0, 4, 3, 0, 1, 1, 0, 3, 3,
        ],
        [
          0, 4, 0, 5, 0, 3, 0, 3, 0, 4, 5, 5, 4, 3, 5, 3, 4, 3, 5, 3, 3, 2, 5,
          3, 4, 4, 4, 3, 4, 3, 4, 5, 5, 3, 4, 4, 3, 4, 4, 5, 4, 4, 4, 3, 4, 5,
          5, 4, 2, 3, 4, 2, 3, 4, 0, 3, 3, 1, 4, 3, 2, 4, 3, 3, 5, 5, 0, 3, 0,
          3, 0, 5, 5, 5, 5, 4, 4, 0, 4, 0, 1, 4, 4,
        ],
        [
          0, 4, 0, 4, 0, 3, 0, 3, 0, 3, 5, 4, 4, 2, 3, 2, 5, 1, 3, 2, 5, 1, 4,
          2, 3, 2, 3, 3, 4, 3, 3, 3, 3, 2, 5, 4, 1, 3, 3, 5, 3, 4, 4, 0, 4, 4,
          3, 1, 1, 3, 1, 0, 2, 3, 0, 2, 3, 0, 3, 0, 0, 4, 3, 1, 3, 4, 0, 3, 0,
          2, 0, 4, 4, 4, 3, 4, 5, 0, 4, 0, 0, 3, 4,
        ],
        [
          0, 3, 0, 3, 0, 3, 1, 2, 0, 3, 4, 4, 3, 3, 3, 0, 2, 2, 4, 3, 3, 1, 3,
          3, 3, 1, 1, 0, 3, 1, 4, 3, 2, 3, 4, 4, 2, 4, 4, 4, 3, 4, 4, 3, 2, 4,
          4, 3, 1, 3, 3, 1, 3, 3, 0, 4, 1, 0, 2, 2, 1, 4, 3, 2, 3, 3, 5, 4, 3,
          3, 5, 4, 4, 3, 3, 0, 4, 0, 3, 2, 2, 4, 4,
        ],
        [
          0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 2, 1, 3, 0, 0, 0, 0, 0, 2, 0, 1, 2, 1,
          0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 1, 0, 1, 1, 3, 1, 0, 0, 0, 1, 1, 0, 1,
          1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 0, 3, 4, 0,
          0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1,
        ],
        [
          0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 4, 0, 4, 1, 4, 0, 3, 0, 4, 0, 3, 0, 4,
          0, 3, 0, 3, 0, 4, 1, 5, 1, 4, 0, 0, 3, 0, 5, 0, 5, 2, 0, 1, 0, 0, 0,
          2, 1, 4, 0, 1, 3, 0, 0, 3, 0, 0, 3, 1, 1, 4, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          1, 4, 0, 5, 0, 3, 0, 2, 0, 3, 5, 4, 4, 3, 4, 3, 5, 3, 4, 3, 3, 0, 4,
          3, 3, 3, 3, 3, 3, 2, 4, 4, 3, 1, 3, 4, 4, 5, 4, 4, 3, 4, 4, 1, 3, 5,
          4, 3, 3, 3, 1, 2, 2, 3, 3, 1, 3, 1, 3, 3, 3, 5, 3, 3, 4, 5, 0, 3, 0,
          3, 0, 3, 4, 3, 4, 4, 3, 0, 3, 0, 2, 4, 3,
        ],
        [
          0, 1, 0, 4, 0, 0, 0, 0, 0, 1, 4, 0, 4, 1, 4, 2, 4, 0, 3, 0, 1, 0, 1,
          0, 0, 0, 0, 0, 2, 0, 3, 1, 1, 1, 0, 3, 0, 0, 0, 1, 2, 1, 0, 0, 1, 1,
          1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0, 3, 2, 0, 2, 2, 0, 1, 0,
          0, 0, 2, 3, 2, 3, 3, 0, 0, 0, 0, 2, 1, 0,
        ],
        [
          0, 5, 1, 5, 0, 3, 0, 3, 0, 5, 4, 4, 5, 1, 5, 3, 3, 0, 4, 3, 4, 3, 5,
          3, 4, 3, 3, 2, 4, 3, 4, 3, 3, 0, 3, 3, 1, 4, 4, 3, 4, 4, 4, 3, 4, 5,
          5, 3, 2, 3, 1, 1, 3, 3, 1, 3, 1, 1, 3, 3, 2, 4, 5, 3, 3, 5, 0, 4, 0,
          3, 0, 4, 4, 3, 5, 3, 3, 0, 3, 4, 0, 4, 3,
        ],
        [
          0, 5, 0, 5, 0, 3, 0, 2, 0, 4, 4, 3, 5, 2, 4, 3, 3, 3, 4, 4, 4, 3, 5,
          3, 5, 3, 3, 1, 4, 0, 4, 3, 3, 0, 3, 3, 0, 4, 4, 4, 4, 5, 4, 3, 3, 5,
          5, 3, 2, 3, 1, 2, 3, 2, 0, 1, 0, 0, 3, 2, 2, 4, 4, 3, 1, 5, 0, 4, 0,
          3, 0, 4, 3, 1, 3, 2, 1, 0, 3, 3, 0, 3, 3,
        ],
        [
          0, 4, 0, 5, 0, 5, 0, 4, 0, 4, 5, 5, 5, 3, 4, 3, 3, 2, 5, 4, 4, 3, 5,
          3, 5, 3, 4, 0, 4, 3, 4, 4, 3, 2, 4, 4, 3, 4, 5, 4, 4, 5, 5, 0, 3, 5,
          5, 4, 1, 3, 3, 2, 3, 3, 1, 3, 1, 0, 4, 3, 1, 4, 4, 3, 4, 5, 0, 4, 0,
          2, 0, 4, 3, 4, 4, 3, 3, 0, 4, 0, 0, 5, 5,
        ],
        [
          0, 4, 0, 4, 0, 5, 0, 1, 1, 3, 3, 4, 4, 3, 4, 1, 3, 0, 5, 1, 3, 0, 3,
          1, 3, 1, 1, 0, 3, 0, 3, 3, 4, 0, 4, 3, 0, 4, 4, 4, 3, 4, 4, 0, 3, 5,
          4, 1, 0, 3, 0, 0, 2, 3, 0, 3, 1, 0, 3, 1, 0, 3, 2, 1, 3, 5, 0, 3, 0,
          1, 0, 3, 2, 3, 3, 4, 4, 0, 2, 2, 0, 4, 4,
        ],
        [
          2, 4, 0, 5, 0, 4, 0, 3, 0, 4, 5, 5, 4, 3, 5, 3, 5, 3, 5, 3, 5, 2, 5,
          3, 4, 3, 3, 4, 3, 4, 5, 3, 2, 1, 5, 4, 3, 2, 3, 4, 5, 3, 4, 1, 2, 5,
          4, 3, 0, 3, 3, 0, 3, 2, 0, 2, 3, 0, 4, 1, 0, 3, 4, 3, 3, 5, 0, 3, 0,
          1, 0, 4, 5, 5, 5, 4, 3, 0, 4, 2, 0, 3, 5,
        ],
        [
          0, 5, 0, 4, 0, 4, 0, 2, 0, 5, 4, 3, 4, 3, 4, 3, 3, 3, 4, 3, 4, 2, 5,
          3, 5, 3, 4, 1, 4, 3, 4, 4, 4, 0, 3, 5, 0, 4, 4, 4, 4, 5, 3, 1, 3, 4,
          5, 3, 3, 3, 3, 3, 3, 3, 0, 2, 2, 0, 3, 3, 2, 4, 3, 3, 3, 5, 3, 4, 1,
          3, 3, 5, 3, 2, 0, 0, 0, 0, 4, 3, 1, 3, 3,
        ],
        [
          0, 1, 0, 3, 0, 3, 0, 1, 0, 1, 3, 3, 3, 2, 3, 3, 3, 0, 3, 0, 0, 0, 3,
          1, 3, 0, 0, 0, 2, 2, 2, 3, 0, 0, 3, 2, 0, 1, 2, 4, 1, 3, 3, 0, 0, 3,
          3, 3, 0, 1, 0, 0, 2, 1, 0, 0, 3, 0, 3, 1, 0, 3, 0, 0, 1, 3, 0, 2, 0,
          1, 0, 3, 3, 1, 3, 3, 0, 0, 1, 1, 0, 3, 3,
        ],
        [
          0, 2, 0, 3, 0, 2, 1, 4, 0, 2, 2, 3, 1, 1, 3, 1, 1, 0, 2, 0, 3, 1, 2,
          3, 1, 3, 0, 0, 1, 0, 4, 3, 2, 3, 3, 3, 1, 4, 2, 3, 3, 3, 3, 1, 0, 3,
          1, 4, 0, 1, 1, 0, 1, 2, 0, 1, 1, 0, 1, 1, 0, 3, 1, 3, 2, 2, 0, 1, 0,
          0, 0, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 2, 3,
        ],
        [
          0, 5, 0, 4, 0, 5, 0, 2, 0, 4, 5, 5, 3, 3, 4, 3, 3, 1, 5, 4, 4, 2, 4,
          4, 4, 3, 4, 2, 4, 3, 5, 5, 4, 3, 3, 4, 3, 3, 5, 5, 4, 5, 5, 1, 3, 4,
          5, 3, 1, 4, 3, 1, 3, 3, 0, 3, 3, 1, 4, 3, 1, 4, 5, 3, 3, 5, 0, 4, 0,
          3, 0, 5, 3, 3, 1, 4, 3, 0, 4, 0, 1, 5, 3,
        ],
        [
          0, 5, 0, 5, 0, 4, 0, 2, 0, 4, 4, 3, 4, 3, 3, 3, 3, 3, 5, 4, 4, 4, 4,
          4, 4, 5, 3, 3, 5, 2, 4, 4, 4, 3, 4, 4, 3, 3, 4, 4, 5, 5, 3, 3, 4, 3,
          4, 3, 3, 4, 3, 3, 3, 3, 1, 2, 2, 1, 4, 3, 3, 5, 4, 4, 3, 4, 0, 4, 0,
          3, 0, 4, 4, 4, 4, 4, 1, 0, 4, 2, 0, 2, 4,
        ],
        [
          0, 4, 0, 4, 0, 3, 0, 1, 0, 3, 5, 2, 3, 0, 3, 0, 2, 1, 4, 2, 3, 3, 4,
          1, 4, 3, 3, 2, 4, 1, 3, 3, 3, 0, 3, 3, 0, 0, 3, 3, 3, 5, 3, 3, 3, 3,
          3, 2, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 1, 0, 0, 3, 1, 2, 2, 3, 0, 3, 0,
          2, 0, 4, 4, 3, 3, 4, 1, 0, 3, 0, 0, 2, 4,
        ],
        [
          0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 0, 0, 0, 1, 0, 2,
          0, 1, 0, 0, 0, 0, 0, 3, 1, 3, 0, 3, 2, 0, 0, 0, 1, 0, 3, 2, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 4, 0, 2, 0, 0, 0, 0, 0, 0, 2,
        ],
        [
          0, 2, 1, 3, 0, 2, 0, 2, 0, 3, 3, 3, 3, 1, 3, 1, 3, 3, 3, 3, 3, 3, 4,
          2, 2, 1, 2, 1, 4, 0, 4, 3, 1, 3, 3, 3, 2, 4, 3, 5, 4, 3, 3, 3, 3, 3,
          3, 3, 0, 1, 3, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 4, 2, 0, 2, 3, 0, 3, 3,
          0, 3, 3, 4, 2, 3, 1, 4, 0, 1, 2, 0, 2, 3,
        ],
        [
          0, 3, 0, 3, 0, 1, 0, 3, 0, 2, 3, 3, 3, 0, 3, 1, 2, 0, 3, 3, 2, 3, 3,
          2, 3, 2, 3, 1, 3, 0, 4, 3, 2, 0, 3, 3, 1, 4, 3, 3, 2, 3, 4, 3, 1, 3,
          3, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 4, 1, 1, 0, 3, 0, 3, 1,
          0, 2, 3, 3, 3, 3, 3, 1, 0, 0, 2, 0, 3, 3,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3,
          0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 3, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          0, 2, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        ],
        [
          0, 2, 0, 3, 1, 3, 0, 3, 0, 2, 3, 3, 3, 1, 3, 1, 3, 1, 3, 1, 3, 3, 3,
          1, 3, 0, 2, 3, 1, 1, 4, 3, 3, 2, 3, 3, 1, 2, 2, 4, 1, 3, 3, 0, 1, 4,
          2, 3, 0, 1, 3, 0, 3, 0, 0, 1, 3, 0, 2, 0, 0, 3, 3, 2, 1, 3, 0, 3, 0,
          2, 0, 3, 4, 4, 4, 3, 1, 0, 3, 0, 0, 3, 3,
        ],
        [
          0, 2, 0, 1, 0, 2, 0, 0, 0, 1, 3, 2, 2, 1, 3, 0, 1, 1, 3, 0, 3, 2, 3,
          1, 2, 0, 2, 0, 1, 1, 3, 3, 3, 0, 3, 3, 1, 1, 2, 3, 2, 3, 3, 1, 2, 3,
          2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0, 2, 1, 2, 1, 3, 0, 3, 0,
          0, 0, 3, 4, 4, 4, 3, 2, 0, 2, 0, 0, 2, 4,
        ],
        [
          0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 3,
        ],
        [
          0, 3, 0, 3, 0, 2, 0, 3, 0, 3, 3, 3, 2, 3, 2, 2, 2, 0, 3, 1, 3, 3, 3,
          2, 3, 3, 0, 0, 3, 0, 3, 2, 2, 0, 2, 3, 1, 4, 3, 4, 3, 3, 2, 3, 1, 5,
          4, 4, 0, 3, 1, 2, 1, 3, 0, 3, 1, 1, 2, 0, 2, 3, 1, 3, 1, 3, 0, 3, 0,
          1, 0, 3, 3, 4, 4, 2, 1, 0, 2, 1, 0, 2, 4,
        ],
        [
          0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 4, 2, 5, 1, 4, 0, 2, 0, 2, 1, 3, 1, 4,
          0, 2, 1, 0, 0, 2, 1, 4, 1, 1, 0, 3, 3, 0, 5, 1, 3, 2, 3, 3, 1, 0, 3,
          2, 3, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 4, 0, 1, 0, 3, 0, 2, 0,
          1, 0, 3, 3, 3, 4, 3, 3, 0, 0, 0, 0, 2, 3,
        ],
        [
          0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 3,
        ],
        [
          0, 1, 0, 3, 0, 4, 0, 3, 0, 2, 4, 3, 1, 0, 3, 2, 2, 1, 3, 1, 2, 2, 3,
          1, 1, 1, 2, 1, 3, 0, 1, 2, 0, 1, 3, 2, 1, 3, 0, 5, 5, 1, 0, 0, 1, 3,
          2, 1, 0, 3, 0, 0, 1, 0, 0, 0, 0, 0, 3, 4, 0, 1, 1, 1, 3, 2, 0, 2, 0,
          1, 0, 2, 3, 3, 1, 2, 3, 0, 1, 0, 1, 0, 4,
        ],
        [
          0, 0, 0, 1, 0, 3, 0, 3, 0, 2, 2, 1, 0, 0, 4, 0, 3, 0, 3, 1, 3, 0, 3,
          0, 3, 0, 1, 0, 3, 0, 3, 1, 3, 0, 3, 3, 0, 0, 1, 2, 1, 1, 1, 0, 1, 2,
          0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 2, 0, 0, 2, 0,
          0, 0, 0, 2, 3, 3, 3, 3, 0, 0, 0, 0, 1, 4,
        ],
        [
          0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 3, 1, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 3, 0, 2, 0, 2, 3, 0, 0, 2, 2, 3, 1, 2, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 2, 3,
        ],
        [
          2, 4, 0, 5, 0, 5, 0, 4, 0, 3, 4, 3, 3, 3, 4, 3, 3, 3, 4, 3, 4, 4, 5,
          4, 5, 5, 5, 2, 3, 0, 5, 5, 4, 1, 5, 4, 3, 1, 5, 4, 3, 4, 4, 3, 3, 4,
          3, 3, 0, 3, 2, 0, 2, 3, 0, 3, 0, 0, 3, 3, 0, 5, 3, 2, 3, 3, 0, 3, 0,
          3, 0, 3, 4, 5, 4, 5, 3, 0, 4, 3, 0, 3, 4,
        ],
        [
          0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 3, 4, 3, 2, 3, 2, 3, 0, 4, 3, 3, 3, 3,
          3, 3, 3, 3, 0, 3, 2, 4, 3, 3, 1, 3, 4, 3, 4, 4, 4, 3, 4, 4, 3, 2, 4,
          4, 1, 0, 2, 0, 0, 1, 1, 0, 2, 0, 0, 3, 1, 0, 5, 3, 2, 1, 3, 0, 3, 0,
          1, 2, 4, 3, 2, 4, 3, 3, 0, 3, 2, 0, 4, 4,
        ],
        [
          0, 3, 0, 3, 0, 1, 0, 0, 0, 1, 4, 3, 3, 2, 3, 1, 3, 1, 4, 2, 3, 2, 4,
          2, 3, 4, 3, 0, 2, 2, 3, 3, 3, 0, 3, 3, 3, 0, 3, 4, 1, 3, 3, 0, 3, 4,
          3, 3, 0, 1, 1, 0, 1, 0, 0, 0, 4, 0, 3, 0, 0, 3, 1, 2, 1, 3, 0, 4, 0,
          1, 0, 4, 3, 3, 4, 3, 3, 0, 2, 0, 0, 3, 3,
        ],
        [
          0, 3, 0, 4, 0, 1, 0, 3, 0, 3, 4, 3, 3, 0, 3, 3, 3, 1, 3, 1, 3, 3, 4,
          3, 3, 3, 0, 0, 3, 1, 5, 3, 3, 1, 3, 3, 2, 5, 4, 3, 3, 4, 5, 3, 2, 5,
          3, 4, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 1, 1, 0, 4, 2, 2, 1, 3, 0, 3, 0,
          2, 0, 4, 4, 3, 5, 3, 2, 0, 1, 1, 0, 3, 4,
        ],
        [
          0, 5, 0, 4, 0, 5, 0, 2, 0, 4, 4, 3, 3, 2, 3, 3, 3, 1, 4, 3, 4, 1, 5,
          3, 4, 3, 4, 0, 4, 2, 4, 3, 4, 1, 5, 4, 0, 4, 4, 4, 4, 5, 4, 1, 3, 5,
          4, 2, 1, 4, 1, 1, 3, 2, 0, 3, 1, 0, 3, 2, 1, 4, 3, 3, 3, 4, 0, 4, 0,
          3, 0, 4, 4, 4, 3, 3, 3, 0, 4, 2, 0, 3, 4,
        ],
        [
          1, 4, 0, 4, 0, 3, 0, 1, 0, 3, 3, 3, 1, 1, 3, 3, 2, 2, 3, 3, 1, 0, 3,
          2, 2, 1, 2, 0, 3, 1, 2, 1, 2, 0, 3, 2, 0, 2, 2, 3, 3, 4, 3, 0, 3, 3,
          1, 2, 0, 1, 1, 3, 1, 2, 0, 0, 3, 0, 1, 1, 0, 3, 2, 2, 3, 3, 0, 3, 0,
          0, 0, 2, 3, 3, 4, 3, 3, 0, 1, 0, 0, 1, 4,
        ],
        [
          0, 4, 0, 4, 0, 4, 0, 0, 0, 3, 4, 4, 3, 1, 4, 2, 3, 2, 3, 3, 3, 1, 4,
          3, 4, 0, 3, 0, 4, 2, 3, 3, 2, 2, 5, 4, 2, 1, 3, 4, 3, 4, 3, 1, 3, 3,
          4, 2, 0, 2, 1, 0, 3, 3, 0, 0, 2, 0, 3, 1, 0, 4, 4, 3, 4, 3, 0, 4, 0,
          1, 0, 2, 4, 4, 4, 4, 4, 0, 3, 2, 0, 3, 3,
        ],
        [
          0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2,
        ],
        [
          0, 2, 0, 3, 0, 4, 0, 4, 0, 1, 3, 3, 3, 0, 4, 0, 2, 1, 2, 1, 1, 1, 2,
          0, 3, 1, 1, 0, 1, 0, 3, 1, 0, 0, 3, 3, 2, 0, 1, 1, 0, 0, 0, 0, 0, 1,
          0, 2, 0, 2, 2, 0, 3, 1, 0, 0, 1, 0, 1, 1, 0, 1, 2, 0, 3, 0, 0, 0, 0,
          1, 0, 0, 3, 3, 4, 3, 1, 0, 1, 0, 3, 0, 2,
        ],
        [
          0, 0, 0, 3, 0, 5, 0, 0, 0, 0, 1, 0, 2, 0, 3, 1, 0, 1, 3, 0, 0, 0, 2,
          0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 4, 0, 0, 0, 2, 3, 0, 1, 4, 1, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 0, 0, 0, 3,
        ],
        [
          0, 2, 0, 5, 0, 5, 0, 1, 0, 2, 4, 3, 3, 2, 5, 1, 3, 2, 3, 3, 3, 0, 4,
          1, 2, 0, 3, 0, 4, 0, 2, 2, 1, 1, 5, 3, 0, 0, 1, 4, 2, 3, 2, 0, 3, 3,
          3, 2, 0, 2, 4, 1, 1, 2, 0, 1, 1, 0, 3, 1, 0, 1, 3, 1, 2, 3, 0, 2, 0,
          0, 0, 1, 3, 5, 4, 4, 4, 0, 3, 0, 0, 1, 3,
        ],
        [
          0, 4, 0, 5, 0, 4, 0, 4, 0, 4, 5, 4, 3, 3, 4, 3, 3, 3, 4, 3, 4, 4, 5,
          3, 4, 5, 4, 2, 4, 2, 3, 4, 3, 1, 4, 4, 1, 3, 5, 4, 4, 5, 5, 4, 4, 5,
          5, 5, 2, 3, 3, 1, 4, 3, 1, 3, 3, 0, 3, 3, 1, 4, 3, 4, 4, 4, 0, 3, 0,
          4, 0, 3, 3, 4, 4, 5, 0, 0, 4, 3, 0, 4, 5,
        ],
        [
          0, 4, 0, 4, 0, 3, 0, 3, 0, 3, 4, 4, 4, 3, 3, 2, 4, 3, 4, 3, 4, 3, 5,
          3, 4, 3, 2, 1, 4, 2, 4, 4, 3, 1, 3, 4, 2, 4, 5, 5, 3, 4, 5, 4, 1, 5,
          4, 3, 0, 3, 2, 2, 3, 2, 1, 3, 1, 0, 3, 3, 3, 5, 3, 3, 3, 5, 4, 4, 2,
          3, 3, 4, 3, 3, 3, 2, 1, 0, 3, 2, 1, 4, 3,
        ],
        [
          0, 4, 0, 5, 0, 4, 0, 3, 0, 3, 5, 5, 3, 2, 4, 3, 4, 0, 5, 4, 4, 1, 4,
          4, 4, 3, 3, 3, 4, 3, 5, 5, 2, 3, 3, 4, 1, 2, 5, 5, 3, 5, 5, 2, 3, 5,
          5, 4, 0, 3, 2, 0, 3, 3, 1, 1, 5, 1, 4, 1, 0, 4, 3, 2, 3, 5, 0, 4, 0,
          3, 0, 5, 4, 3, 4, 3, 0, 0, 4, 1, 0, 4, 4,
        ],
        [
          1, 3, 0, 4, 0, 2, 0, 2, 0, 2, 5, 5, 3, 3, 3, 3, 3, 0, 4, 2, 3, 4, 4,
          4, 3, 4, 0, 0, 3, 4, 5, 4, 3, 3, 3, 3, 2, 5, 5, 4, 5, 5, 5, 4, 3, 5,
          5, 5, 1, 3, 1, 0, 1, 0, 0, 3, 2, 0, 4, 2, 0, 5, 2, 3, 2, 4, 1, 3, 0,
          3, 0, 4, 5, 4, 5, 4, 3, 0, 4, 2, 0, 5, 4,
        ],
        [
          0, 3, 0, 4, 0, 5, 0, 3, 0, 3, 4, 4, 3, 2, 3, 2, 3, 3, 3, 3, 3, 2, 4,
          3, 3, 2, 2, 0, 3, 3, 3, 3, 3, 1, 3, 3, 3, 0, 4, 4, 3, 4, 4, 1, 1, 4,
          4, 2, 0, 3, 1, 0, 1, 1, 0, 4, 1, 0, 2, 3, 1, 3, 3, 1, 3, 4, 0, 3, 0,
          1, 0, 3, 1, 3, 0, 0, 1, 0, 2, 0, 0, 4, 4,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 3, 0, 3, 0, 2, 0, 3, 0, 1, 5, 4, 3, 3, 3, 1, 4, 2, 1, 2, 3, 4, 4,
          2, 4, 4, 5, 0, 3, 1, 4, 3, 4, 0, 4, 3, 3, 3, 2, 3, 2, 5, 3, 4, 3, 2,
          2, 3, 0, 0, 3, 0, 2, 1, 0, 1, 2, 0, 0, 0, 0, 2, 1, 1, 3, 1, 0, 2, 0,
          4, 0, 3, 4, 4, 4, 5, 2, 0, 2, 0, 0, 1, 3,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1,
          0, 0, 1, 1, 0, 0, 0, 4, 2, 1, 1, 0, 1, 0, 3, 2, 0, 0, 3, 1, 1, 1, 2,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0, 0, 2, 0,
          0, 0, 1, 4, 0, 4, 2, 1, 0, 0, 0, 0, 0, 1,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          1, 0, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 2, 0, 2, 1, 0, 0, 1, 2, 1, 0, 1,
          1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0,
          1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        ],
        [
          0, 4, 0, 4, 0, 4, 0, 3, 0, 4, 4, 3, 4, 2, 4, 3, 2, 0, 4, 4, 4, 3, 5,
          3, 5, 3, 3, 2, 4, 2, 4, 3, 4, 3, 1, 4, 0, 2, 3, 4, 4, 4, 3, 3, 3, 4,
          4, 4, 3, 4, 1, 3, 4, 3, 2, 1, 2, 1, 3, 3, 3, 4, 4, 3, 3, 5, 0, 4, 0,
          3, 0, 4, 3, 3, 3, 2, 1, 0, 3, 0, 0, 3, 3,
        ],
        [
          0, 4, 0, 3, 0, 3, 0, 3, 0, 3, 5, 5, 3, 3, 3, 3, 4, 3, 4, 3, 3, 3, 4,
          4, 4, 3, 3, 3, 3, 4, 3, 5, 3, 3, 1, 3, 2, 4, 5, 5, 5, 5, 4, 3, 4, 5,
          5, 3, 2, 2, 3, 3, 3, 3, 2, 3, 3, 1, 2, 3, 2, 4, 3, 3, 3, 4, 0, 4, 0,
          2, 0, 4, 3, 2, 2, 1, 2, 0, 3, 0, 0, 4, 1,
        ],
      ]),
        (SJISContextAnalysis.prototype = new JapaneseContextAnalysis()),
        (el.SJISContextAnalysis = SJISContextAnalysis),
        (EUCJPContextAnalysis.prototype = new JapaneseContextAnalysis()),
        (el.EUCJPContextAnalysis = EUCJPContextAnalysis));
    },
    45622(eA, el, ec) {
      var eu = ec(91203),
        ed = ec(67326),
        ep = ec(18141).EUCJPDistributionAnalysis,
        eg = ec(24612).EUCJPContextAnalysis,
        eh = ec(83944),
        ef = ec(75546),
        em = ec(12719);
      function EUCJPProber() {
        ed.apply(this);
        var eA = this;
        function init() {
          ((eA._mCodingSM = new eu(eh)),
            (eA._mDistributionAnalyzer = new ep()),
            (eA._mContextAnalyzer = new eg()),
            eA.reset());
        }
        ((this.reset = function () {
          (EUCJPProber.prototype.reset.apply(this),
            this._mContextAnalyzer.reset());
        }),
          (this.getCharsetName = function () {
            return "EUC-JP";
          }),
          (this.feed = function (eA) {
            for (var el = eA.length, ec = 0; ec < el; ec++) {
              var eu = this._mCodingSM.nextState(eA[ec]);
              if (eu == ef.error) {
                (em.log(
                  this.getCharsetName() +
                    " prober hit error at byte " +
                    ec +
                    "\n",
                ),
                  (this._mState = ef.notMe));
                break;
              }
              if (eu == ef.itsMe) {
                this._mState = ef.foundIt;
                break;
              }
              if (eu == ef.start) {
                var ed = this._mCodingSM.getCurrentCharLen();
                if (0 == ec) {
                  this._mLastChar[1] = eA[0];
                  var ep = this._mLastChar.join("");
                  (this._mContextAnalyzer.feed(ep, ed),
                    this._mDistributionAnalyzer.feed(ep, ed));
                } else
                  (this._mContextAnalyzer.feed(eA.slice(ec - 1, ec + 1), ed),
                    this._mDistributionAnalyzer.feed(
                      eA.slice(ec - 1, ec + 1),
                      ed,
                    ));
              }
            }
            return (
              (this._mLastChar[0] = eA[el - 1]),
              this.getState() == ef.detecting &&
                this._mContextAnalyzer.gotEnoughData() &&
                this.getConfidence() > ef.SHORTCUT_THRESHOLD &&
                (this._mState = ef.foundIt),
              this.getState()
            );
          }),
          (this.getConfidence = function () {
            return Math.max(
              this._mContextAnalyzer.getConfidence(),
              this._mDistributionAnalyzer.getConfidence(),
            );
          }),
          init());
      }
      ((EUCJPProber.prototype = new ed()), (eA.exports = EUCJPProber));
    },
    83944(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = {
        classTable: [
          4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 4, 4, 4, 4, 4, 4, 4,
          4, 4, 4, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
          4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
          4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
          4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
          4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          5, 5, 5, 5, 1, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 5,
        ],
        classFactor: 6,
        stateTable: [
          3,
          4,
          3,
          5,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.start,
          eu.error,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          3,
          eu.error,
          3,
          eu.error,
          eu.error,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
        ],
        charLenTable: [2, 2, 2, 3, 1, 0],
        name: "EUC-JP",
      };
    },
    39802(eA, el, ec) {
      var eu = ec(67326),
        ed = ec(91203),
        ep = ec(22076),
        eg = ec(18141).GB2312DistributionAnalysis;
      function GB2312Prober() {
        eu.apply(this);
        var eA = this;
        function init() {
          ((eA._mCodingSM = new ed(ep)),
            (eA._mDistributionAnalyzer = new eg()),
            eA.reset());
        }
        ((this.getCharsetName = function () {
          return "GB2312";
        }),
          init());
      }
      ((GB2312Prober.prototype = new eu()), (eA.exports = GB2312Prober));
    },
    22076(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = {
        classTable: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6,
          6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
          6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
          6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
          6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
          6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
          6, 6, 0,
        ],
        classFactor: 7,
        stateTable: [
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          3,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.error,
          eu.error,
          eu.start,
          4,
          eu.error,
          eu.start,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          5,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.error,
          eu.error,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
        ],
        charLenTable: [0, 1, 1, 1, 1, 1, 2],
        name: "GB2312",
      };
    },
    41537(eA, el, ec) {
      var eu = ec(91203),
        ed = ec(67326),
        ep = ec(18141).EUCKRDistributionAnalysis,
        eg = ec(81643);
      function EUCKRProber() {
        ed.apply(this);
        var eA = this;
        function init() {
          ((eA._mCodingSM = new eu(eg)),
            (eA._mDistributionAnalyzer = new ep()),
            eA.reset());
        }
        ((this.getCharsetName = function () {
          return "EUC-KR";
        }),
          init());
      }
      ((EUCKRProber.prototype = new ed()), (eA.exports = EUCKRProber));
    },
    81643(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = {
        classTable: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 0,
        ],
        classFactor: 4,
        stateTable: [
          eu.error,
          eu.start,
          3,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.error,
          eu.error,
          eu.start,
          eu.start,
        ],
        charLenTable: [0, 1, 2, 0],
        name: "EUC-KR",
      };
    },
    73017(eA, el, ec) {
      var eu = ec(91203),
        ed = ec(67326),
        ep = ec(18141).EUCTWDistributionAnalysis,
        eg = ec(26567);
      function EUCTWProber() {
        ed.apply(this);
        var eA = this;
        function init() {
          ((eA._mCodingSM = new eu(eg)),
            (eA._mDistributionAnalyzer = new ep()),
            eA.reset());
        }
        ((this.getCharsetName = function () {
          return "EUC-TW";
        }),
          init());
      }
      ((EUCTWProber.prototype = new ed()), (eA.exports = EUCTWProber));
    },
    26567(eA, el, ec) {
      var eu = ec(75546);
      eA.exports = {
        classTable: [
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          3, 4, 4, 4, 4, 4, 4, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 0,
        ],
        classFactor: 7,
        stateTable: [
          eu.error,
          eu.error,
          eu.start,
          3,
          3,
          3,
          4,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.error,
          eu.start,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          5,
          eu.error,
          eu.error,
          eu.error,
          eu.start,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.error,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
        ],
        charLenTable: [0, 0, 1, 2, 2, 2, 3],
        name: "x-euc-tw",
      };
    },
    17117(eA, el, ec) {
      var eu = ec(67044),
        ed = ec(65084),
        ep = ec(73695).Win1255HebrewModel,
        eg = ec(48432),
        eh = ec(93322),
        ef = ec(40474),
        em = ec(11300).TIS620ThaiModel,
        eE = ec(51733),
        eC = ec(43761);
      function SBCSGroupProber() {
        ed.apply(this);
        var eA = this;
        function init() {
          eA._mProbers = [
            new eu(eh.Win1251CyrillicModel),
            new eu(eh.Koi8rModel),
            new eu(eh.Latin5CyrillicModel),
            new eu(eh.MacCyrillicModel),
            new eu(eh.Ibm866Model),
            new eu(eh.Ibm855Model),
            new eu(ef.Latin7GreekModel),
            new eu(ef.Win1253GreekModel),
            new eu(eC.Latin5BulgarianModel),
            new eu(eC.Win1251BulgarianModel),
            new eu(eE.Latin2HungarianModel),
            new eu(eE.Win1250HungarianModel),
            new eu(em),
          ];
          var el = new eg(),
            ec = new eu(ep, !1, el),
            ed = new eu(ep, !0, el);
          for (let eu of (el.setModelProbers(ec, ed),
          eA._mProbers.push(el, ec, ed),
          (eA._supportedCharsetNames = []),
          eA._mProbers))
            eA._supportedCharsetNames.push(eu.getCharsetName());
          eA.reset();
        }
        ((this.getSupportedCharsetNames = function () {
          return eA._supportedCharsetNames;
        }),
          init());
      }
      ((SBCSGroupProber.prototype = new ed()), (eA.exports = SBCSGroupProber));
    },
    67044(eA, el, ec) {
      var eu = ec(95927),
        ed = ec(75546),
        ep = ec(12719);
      function SingleByteCharSetProber(eA, el, ec) {
        eu.apply(this);
        var eg = 64,
          eh = 1024,
          ef = 0.95,
          em = 0.05,
          eE = 250,
          eC = 4,
          ey = 3,
          ew = this;
        function init(eA, el, ec) {
          ((ew._mModel = eA),
            (ew._mReversed = el),
            (ew._mNameProber = ec),
            ew.reset());
        }
        ((this.reset = function () {
          (SingleByteCharSetProber.prototype.reset.apply(this),
            (this._mLastOrder = 255),
            (this._mSeqCounters = []));
          for (var eA = 0; eA < eC; this._mSeqCounters[eA++] = 0);
          ((this._mTotalSeqs = 0),
            (this._mTotalChar = 0),
            (this._mFreqChar = 0));
        }),
          (this.getCharsetName = function () {
            return this._mNameProber
              ? this._mNameProber.getCharsetName()
              : this._mModel.charsetName;
          }),
          (this.feed = function (eA) {
            this._mModel.keepEnglishLetter ||
              (eA = this.filterWithoutEnglishLetters(eA));
            var el = eA.length;
            if (!el) return this.getState();
            for (var ec, eu = 0; eu < el; eu++) {
              ec = eA.charCodeAt(eu);
              var eC = this._mModel.charToOrderMap[ec];
              (eC < eE && this._mTotalChar++,
                eC < eg &&
                  (this._mFreqChar++,
                  this._mLastOrder < eg &&
                    (this._mTotalSeqs++,
                    this._mReversed
                      ? this._mSeqCounters[
                          this._mModel.precedenceMatrix[
                            eC * eg + this._mLastOrder
                          ]
                        ]++
                      : this._mSeqCounters[
                          this._mModel.precedenceMatrix[
                            this._mLastOrder * eg + eC
                          ]
                        ]++)),
                (this._mLastOrder = eC));
            }
            if (this.getState() == ed.detecting && ew._mTotalSeqs > eh) {
              var ey = this.getConfidence();
              ey > ef
                ? ep.log(
                    this._mModel.charsetName +
                      " confidence = " +
                      ey +
                      ", we have a winner\n",
                  )
                : ey < em &&
                  (ep.log(
                    this._mModel.charsetName +
                      " confidence = " +
                      ey +
                      ", below negative shortcut threshhold " +
                      em +
                      "\n",
                  ),
                  (this._mState = ed.notMe));
            }
            return this.getState();
          }),
          (this.getConfidence = function () {
            var eA = 0.01;
            return (
              this._mTotalSeqs > 0 &&
                (eA =
                  (this._mSeqCounters[ey] /
                    this._mTotalSeqs /
                    this._mModel.mTypicalPositiveRatio) *
                  (this._mFreqChar / this._mTotalChar)) >= 1 &&
                (eA = 0.99),
              eA
            );
          }),
          init(
            eA,
            (el = void 0 !== el && el),
            (ec = void 0 !== ec ? ec : null),
          ));
      }
      ((SingleByteCharSetProber.prototype = new eu()),
        (eA.exports = SingleByteCharSetProber));
    },
    73695(eA, el) {
      ((el.win1255_CharToOrderMap = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
        253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 253, 253, 253, 253, 253, 253, 253, 69, 91, 79, 80, 92, 89, 97,
        90, 68, 111, 112, 82, 73, 95, 85, 78, 121, 86, 71, 67, 102, 107, 84,
        114, 103, 115, 253, 253, 253, 253, 253, 253, 50, 74, 60, 61, 42, 76, 70,
        64, 53, 105, 93, 56, 65, 54, 49, 66, 110, 51, 43, 44, 63, 81, 77, 98,
        75, 108, 253, 253, 253, 253, 253, 124, 202, 203, 204, 205, 40, 58, 206,
        207, 208, 209, 210, 211, 212, 213, 214, 215, 83, 52, 47, 46, 72, 32, 94,
        216, 113, 217, 109, 218, 219, 220, 221, 34, 116, 222, 118, 100, 223,
        224, 117, 119, 104, 125, 225, 226, 87, 99, 227, 106, 122, 123, 228, 55,
        229, 230, 101, 231, 232, 120, 233, 48, 39, 57, 234, 30, 59, 41, 88, 33,
        37, 36, 31, 29, 35, 235, 62, 28, 236, 126, 237, 238, 38, 45, 239, 240,
        241, 242, 243, 127, 244, 245, 246, 247, 248, 249, 250, 9, 8, 20, 16, 3,
        2, 24, 14, 22, 1, 25, 15, 4, 11, 6, 23, 12, 19, 13, 26, 18, 27, 21, 17,
        7, 10, 5, 251, 252, 128, 96, 253,
      ]),
        (el.HebrewLangModel = [
          0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          2, 3, 2, 1, 2, 0, 1, 0, 0, 3, 0, 3, 1, 0, 0, 1, 3, 2, 0, 1, 1, 2, 0,
          2, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 0, 0, 2, 2, 0, 1, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1,
          2, 1, 3, 1, 1, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 2,
          0, 0, 2, 2, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
          1, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 2, 3, 3, 2, 2, 2, 2, 3, 2, 1, 2, 1, 2, 2, 2, 0, 0, 1, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 2, 3, 2, 2, 3, 2,
          2, 2, 1, 2, 2, 2, 2, 1, 2, 1, 1, 2, 2, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 2, 2, 2,
          2, 2, 0, 2, 0, 2, 2, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 0, 2, 2, 2, 0, 2, 1,
          2, 2, 2, 0, 0, 2, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0,
          0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 3, 2, 2, 2, 1, 2, 1, 2, 2, 2, 0, 0,
          1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1,
          0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 1, 0, 2, 0, 2, 0, 2, 1, 2, 2, 2, 0, 0, 1, 2, 0, 0, 0,
          0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 2, 2, 3, 2,
          1, 2, 1, 1, 1, 0, 1, 1, 1, 1, 1, 3, 0, 1, 0, 0, 0, 0, 2, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 0, 2, 0, 1, 2,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 1, 2, 3, 3, 2,
          3, 3, 3, 3, 2, 3, 2, 1, 2, 0, 2, 1, 2, 0, 2, 0, 2, 2, 2, 0, 0, 1, 2,
          0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 1, 2, 2, 3, 3, 2, 3, 2, 3, 2, 2,
          3, 1, 2, 2, 0, 2, 2, 2, 0, 2, 1, 2, 2, 2, 0, 0, 1, 2, 0, 0, 0, 0, 1,
          0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 2, 2, 2, 3, 3, 3, 3, 1, 3,
          2, 2, 2, 0, 2, 0, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 2, 2, 3, 3, 3, 2, 3, 2, 2, 2, 1, 2, 2, 0, 2, 2, 2, 2, 0, 2,
          0, 2, 2, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 1,
          3, 2, 3, 3, 2, 3, 3, 2, 2, 1, 2, 2, 2, 2, 2, 2, 0, 2, 1, 2, 1, 2, 0,
          0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          1, 0, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 2, 3, 3, 3, 3, 2, 3, 2, 3, 3,
          3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 2, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 2, 1, 2,
          3, 0, 2, 1, 2, 2, 0, 2, 1, 1, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 2, 3, 3, 3, 3, 2, 1, 3, 1, 2, 2, 2, 1, 2, 3, 3, 1, 2, 1, 2, 2, 2,
          2, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
          0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 2, 3,
          3, 3, 1, 3, 3, 3, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 0, 2, 0, 1,
          1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 3, 3, 3, 2, 1, 2,
          3, 2, 3, 2, 2, 2, 2, 1, 2, 1, 1, 1, 2, 2, 0, 2, 1, 1, 1, 1, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
          0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3,
          2, 3, 3, 2, 3, 1, 2, 2, 2, 2, 3, 2, 3, 1, 1, 2, 2, 1, 2, 2, 1, 1, 0,
          2, 2, 2, 2, 0, 1, 0, 1, 2, 2, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1, 1, 0, 1, 0, 0, 1,
          1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1,
          1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2,
          2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1,
          2, 1, 1, 0, 3, 3, 3, 0, 3, 0, 2, 2, 2, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 2, 3, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1,
          2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 0,
          1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 1, 1, 1, 1, 2, 1, 1,
          2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1,
          0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
          1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 1,
          2, 1, 1, 1, 2, 1, 2, 1, 2, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          3, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2,
          1, 2, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 2, 2, 0, 2, 0, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1,
          0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 2, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1,
          0, 0, 0, 1, 1, 1, 2, 1, 2, 2, 2, 0, 2, 0, 2, 0, 1, 1, 2, 1, 1, 1, 1,
          2, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 2, 2, 0, 1, 0, 0,
          1, 1, 2, 2, 1, 2, 0, 2, 0, 0, 0, 1, 2, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 1, 2, 0, 2, 0, 0, 1, 1, 1, 1, 1,
          1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 1, 0, 2, 1, 1, 0, 1, 0, 0, 1, 1, 1, 2, 2, 0, 0, 1, 0, 0,
          0, 1, 0, 0, 1, 1, 1, 2, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0,
          1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 2, 0, 1, 2, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1,
          1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 2, 0, 1, 0, 1, 0, 1, 0, 0, 1,
          0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 2, 1, 1, 2, 0, 1, 0, 0, 0, 1,
          1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
          1, 2, 0, 1, 0, 0, 0, 0, 2, 1, 1, 2, 0, 2, 0, 0, 0, 1, 1, 0, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 1, 0, 1, 0,
          0, 2, 2, 1, 2, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 2, 0, 1, 0, 0, 1, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 0, 0, 0, 0, 0, 1, 1, 0,
          1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 0, 0, 0, 0, 2, 1, 1, 1, 0, 2, 1, 1, 0,
          0, 0, 2, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 1, 1, 2, 0, 1, 0, 0, 1, 1, 0, 2, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0,
          1, 2, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 1, 0, 1, 0, 0, 1,
          1, 0, 1, 2, 1, 0, 2, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0,
          0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 2, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0,
          0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 0, 1,
          0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 2, 1, 1,
          1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 0, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1,
          0, 0,
        ]),
        (el.Win1255HebrewModel = {
          charToOrderMap: el.win1255_CharToOrderMap,
          precedenceMatrix: el.HebrewLangModel,
          mTypicalPositiveRatio: 0.984004,
          keepEnglishLetter: !1,
          charsetName: "windows-1255",
        }));
    },
    48432(eA, el, ec) {
      var eu = ec(95927),
        ed = ec(75546);
      function HebrewProber() {
        eu.apply(this);
        var eA = "\xea",
          el = "\xeb",
          ec = "\xed",
          ep = "\xee",
          eg = "\xef",
          eh = "\xf0",
          ef = "\xf3",
          em = "\xf4",
          eE = "\xf5",
          eC = 5,
          ey = 0.01,
          ew = "ISO-8859-8",
          eB = "windows-1255",
          e_ = this;
        function init() {
          ((e_._mLogicalProber = null), (e_._mVisualProber = null), e_.reset());
        }
        ((this.reset = function () {
          ((this._mFinalCharLogicalScore = 0),
            (this._mFinalCharVisualScore = 0),
            (this._mPrev = " "),
            (this._mBeforePrev = " "));
        }),
          (this.setModelProbers = function (eA, el) {
            ((this._mLogicalProber = eA), (this._mVisualProber = el));
          }),
          (this.isFinal = function (el) {
            return -1 != [eA, ec, eg, ef, eE].indexOf(el);
          }),
          (this.isNonFinal = function (eA) {
            return -1 != [el, ep, eh, em].indexOf(eA);
          }),
          (this.feed = function (eA) {
            if (this.getState() == ed.notMe) return ed.notMe;
            eA = this.filterHighBitOnly(eA);
            for (var el, ec = 0; ec < eA.length; ec++)
              (" " == (el = eA[ec])
                ? " " != this._mBeforePrev &&
                  (this.isFinal(this._mPrev)
                    ? this._mFinalCharLogicalScore++
                    : this.isNonFinal(this._mPrev) &&
                      this._mFinalCharVisualScore++)
                : " " == this._mBeforePrev &&
                  this.isFinal(this._mPrev) &&
                  " " != el &&
                  this._mFinalCharVisualScore++,
                (this._mBeforePrev = this._mPrev),
                (this._mPrev = el));
            return ed.detecting;
          }),
          (this.getCharsetName = function () {
            var eA = this._mFinalCharLogicalScore - this._mFinalCharVisualScore;
            if (eA >= eC) return eB;
            if (eA <= -eC) return ew;
            var el =
              this._mLogicalProber.getConfidence() -
              this._mVisualProber.getConfidence();
            return el > ey ? eB : el < -ey || eA < 0 ? ew : eB;
          }),
          (this.getState = function () {
            return this._mLogicalProber.getState() == ed.notMe &&
              this._mVisualProber.getState() == ed.notMe
              ? ed.notMe
              : ed.detecting;
          }),
          init());
      }
      (Array.prototype.indexOf ||
        (Array.prototype.indexOf = function (eA) {
          var el = this.length >>> 0,
            ec = Number(arguments[1]) || 0;
          for (
            (ec = ec < 0 ? Math.ceil(ec) : Math.floor(ec)) < 0 && (ec += el);
            ec < el;
            ec++
          )
            if (ec in this && this[ec] === eA) return ec;
          return -1;
        }),
        (HebrewProber.prototype = new eu()),
        (eA.exports = HebrewProber));
    },
    93322(eA, el) {
      ((el.KOI8R_CharToOrderMap = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
        253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 253, 253, 253, 253, 253, 253, 253, 142, 143, 144, 145, 146,
        147, 148, 149, 150, 151, 152, 74, 153, 75, 154, 155, 156, 157, 158, 159,
        160, 161, 162, 163, 164, 165, 253, 253, 253, 253, 253, 253, 71, 172, 66,
        173, 65, 174, 76, 175, 64, 176, 177, 77, 72, 178, 69, 67, 179, 78, 73,
        180, 181, 79, 182, 183, 184, 185, 253, 253, 253, 253, 253, 191, 192,
        193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206,
        207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220,
        221, 222, 223, 224, 225, 68, 226, 227, 228, 229, 230, 231, 232, 233,
        234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247,
        248, 249, 250, 251, 252, 253, 27, 3, 21, 28, 13, 2, 39, 19, 26, 4, 23,
        11, 8, 12, 5, 1, 15, 16, 9, 7, 6, 14, 24, 10, 17, 18, 20, 25, 30, 29,
        22, 54, 59, 37, 44, 58, 41, 48, 53, 46, 55, 42, 60, 36, 49, 38, 31, 34,
        35, 43, 45, 32, 40, 52, 56, 33, 61, 62, 51, 57, 47, 63, 50, 70,
      ]),
        (el.win1251_CharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 142, 143, 144, 145, 146,
          147, 148, 149, 150, 151, 152, 74, 153, 75, 154, 155, 156, 157, 158,
          159, 160, 161, 162, 163, 164, 165, 253, 253, 253, 253, 253, 253, 71,
          172, 66, 173, 65, 174, 76, 175, 64, 176, 177, 77, 72, 178, 69, 67,
          179, 78, 73, 180, 181, 79, 182, 183, 184, 185, 253, 253, 253, 253,
          253, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203,
          204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217,
          218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231,
          232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245,
          246, 68, 247, 248, 249, 250, 251, 252, 253, 37, 44, 33, 46, 41, 48,
          56, 51, 42, 60, 36, 49, 38, 31, 34, 35, 45, 32, 40, 52, 53, 55, 58,
          50, 57, 63, 70, 62, 61, 47, 59, 43, 3, 21, 10, 19, 13, 2, 24, 20, 4,
          23, 11, 8, 12, 5, 1, 15, 9, 7, 6, 14, 39, 26, 28, 22, 25, 29, 54, 18,
          17, 30, 27, 16,
        ]),
        (el.latin5_CharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 142, 143, 144, 145, 146,
          147, 148, 149, 150, 151, 152, 74, 153, 75, 154, 155, 156, 157, 158,
          159, 160, 161, 162, 163, 164, 165, 253, 253, 253, 253, 253, 253, 71,
          172, 66, 173, 65, 174, 76, 175, 64, 176, 177, 77, 72, 178, 69, 67,
          179, 78, 73, 180, 181, 79, 182, 183, 184, 185, 253, 253, 253, 253,
          253, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203,
          204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217,
          218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231,
          232, 233, 234, 235, 236, 237, 238, 37, 44, 33, 46, 41, 48, 56, 51, 42,
          60, 36, 49, 38, 31, 34, 35, 45, 32, 40, 52, 53, 55, 58, 50, 57, 63,
          70, 62, 61, 47, 59, 43, 3, 21, 10, 19, 13, 2, 24, 20, 4, 23, 11, 8,
          12, 5, 1, 15, 9, 7, 6, 14, 39, 26, 28, 22, 25, 29, 54, 18, 17, 30, 27,
          16, 239, 68, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250,
          251, 252, 255,
        ]),
        (el.macCyrillic_CharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 142, 143, 144, 145, 146,
          147, 148, 149, 150, 151, 152, 74, 153, 75, 154, 155, 156, 157, 158,
          159, 160, 161, 162, 163, 164, 165, 253, 253, 253, 253, 253, 253, 71,
          172, 66, 173, 65, 174, 76, 175, 64, 176, 177, 77, 72, 178, 69, 67,
          179, 78, 73, 180, 181, 79, 182, 183, 184, 185, 253, 253, 253, 253,
          253, 37, 44, 33, 46, 41, 48, 56, 51, 42, 60, 36, 49, 38, 31, 34, 35,
          45, 32, 40, 52, 53, 55, 58, 50, 57, 63, 70, 62, 61, 47, 59, 43, 191,
          192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205,
          206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219,
          220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233,
          234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247,
          248, 249, 250, 251, 252, 68, 16, 3, 21, 10, 19, 13, 2, 24, 20, 4, 23,
          11, 8, 12, 5, 1, 15, 9, 7, 6, 14, 39, 26, 28, 22, 25, 29, 54, 18, 17,
          30, 27, 255,
        ]),
        (el.IBM855_CharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 142, 143, 144, 145, 146,
          147, 148, 149, 150, 151, 152, 74, 153, 75, 154, 155, 156, 157, 158,
          159, 160, 161, 162, 163, 164, 165, 253, 253, 253, 253, 253, 253, 71,
          172, 66, 173, 65, 174, 76, 175, 64, 176, 177, 77, 72, 178, 69, 67,
          179, 78, 73, 180, 181, 79, 182, 183, 184, 185, 253, 253, 253, 253,
          253, 191, 192, 193, 194, 68, 195, 196, 197, 198, 199, 200, 201, 202,
          203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216,
          217, 27, 59, 54, 70, 3, 37, 21, 44, 28, 58, 13, 41, 2, 48, 39, 53, 19,
          46, 218, 219, 220, 221, 222, 223, 224, 26, 55, 4, 42, 225, 226, 227,
          228, 23, 60, 229, 230, 231, 232, 233, 234, 235, 11, 36, 236, 237, 238,
          239, 240, 241, 242, 243, 8, 49, 12, 38, 5, 31, 1, 34, 15, 244, 245,
          246, 247, 35, 16, 248, 43, 9, 45, 7, 32, 6, 40, 14, 52, 24, 56, 10,
          33, 17, 61, 249, 250, 18, 62, 20, 51, 25, 57, 30, 47, 29, 63, 22, 50,
          251, 252, 255,
        ]),
        (el.IBM866_CharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 142, 143, 144, 145, 146,
          147, 148, 149, 150, 151, 152, 74, 153, 75, 154, 155, 156, 157, 158,
          159, 160, 161, 162, 163, 164, 165, 253, 253, 253, 253, 253, 253, 71,
          172, 66, 173, 65, 174, 76, 175, 64, 176, 177, 77, 72, 178, 69, 67,
          179, 78, 73, 180, 181, 79, 182, 183, 184, 185, 253, 253, 253, 253,
          253, 37, 44, 33, 46, 41, 48, 56, 51, 42, 60, 36, 49, 38, 31, 34, 35,
          45, 32, 40, 52, 53, 55, 58, 50, 57, 63, 70, 62, 61, 47, 59, 43, 3, 21,
          10, 19, 13, 2, 24, 20, 4, 23, 11, 8, 12, 5, 1, 15, 191, 192, 193, 194,
          195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208,
          209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222,
          223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236,
          237, 238, 9, 7, 6, 14, 39, 26, 28, 22, 25, 29, 54, 18, 17, 30, 27, 16,
          239, 68, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251,
          252, 255,
        ]),
        (el.RussianLangModel = [
          0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3,
          1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 2, 2, 2, 2, 2, 0, 0, 2, 3, 3, 3, 2, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 2, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0,
          0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 0, 0, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3,
          3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 2, 2, 3, 0, 2,
          2, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2,
          3, 3, 3, 3, 3, 2, 2, 3, 2, 3, 3, 3, 2, 1, 2, 2, 0, 1, 2, 2, 2, 2, 2,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 0, 2, 2, 3, 3, 2, 1, 2, 0, 0, 0, 0,
          0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 3, 3, 1, 2, 3, 2, 2, 3, 2, 3,
          3, 3, 3, 2, 2, 3, 0, 3, 2, 2, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 2,
          2, 0, 3, 3, 3, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, 3, 2, 3, 2, 2, 0, 1, 3, 2,
          1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 2, 1, 1, 3, 0, 1, 1, 1, 1, 2, 1, 1, 0, 2, 2, 2, 1, 2, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 3, 3, 2, 2, 2, 2, 1,
          3, 2, 3, 2, 3, 2, 1, 2, 2, 0, 1, 1, 2, 1, 2, 1, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 2, 3, 3, 3,
          2, 2, 2, 2, 0, 2, 2, 2, 2, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          2, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 0, 0, 3, 3, 3, 3, 2,
          3, 3, 3, 3, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3,
          2, 2, 3, 3, 0, 2, 1, 0, 3, 2, 3, 2, 3, 0, 0, 1, 2, 0, 0, 1, 0, 1, 2,
          1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 2, 3, 3, 3, 3, 2, 3,
          3, 3, 3, 1, 2, 2, 0, 0, 2, 3, 2, 2, 2, 3, 2, 3, 2, 2, 3, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 3, 2, 3, 0, 2, 3, 2, 3, 0, 1, 2, 3, 3, 2, 0, 2,
          3, 0, 0, 2, 3, 2, 2, 0, 1, 3, 1, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 3, 1, 3, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 2, 0, 0, 2, 2,
          3, 3, 3, 2, 3, 3, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3,
          3, 3, 3, 2, 2, 3, 3, 2, 2, 2, 3, 3, 0, 0, 1, 1, 1, 1, 1, 2, 0, 0, 1,
          1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 2,
          3, 3, 3, 3, 3, 3, 3, 0, 3, 2, 3, 3, 2, 3, 2, 0, 2, 1, 0, 1, 1, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 2,
          2, 3, 1, 3, 2, 3, 1, 1, 2, 1, 0, 2, 2, 2, 2, 1, 3, 1, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 2, 2, 3, 3, 3, 3, 3, 1, 2, 2, 1, 3, 1, 0, 3, 0, 0, 3,
          0, 0, 0, 1, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          3, 2, 2, 1, 1, 3, 3, 3, 2, 2, 1, 2, 2, 3, 1, 1, 2, 0, 0, 2, 2, 1, 3,
          0, 0, 2, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 3, 3, 3,
          3, 1, 2, 2, 2, 1, 2, 1, 3, 3, 1, 1, 2, 1, 2, 1, 2, 2, 0, 2, 0, 0, 1,
          1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 2, 1, 3, 2,
          2, 3, 2, 0, 3, 2, 0, 3, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 3, 3, 3, 2, 2, 2, 3, 3, 1, 2, 1, 2,
          1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 2, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 1, 1, 2, 1, 2, 3, 3, 2, 2, 1, 2, 2, 3, 0, 2, 1, 0, 0, 2,
          2, 3, 2, 1, 2, 2, 2, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3,
          3, 3, 3, 1, 1, 0, 1, 1, 2, 2, 1, 1, 3, 0, 0, 1, 3, 1, 1, 1, 0, 0, 0,
          1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 3, 3, 3, 2, 0,
          0, 0, 2, 1, 0, 1, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 2, 3, 2, 2, 2, 1, 2,
          2, 2, 1, 2, 1, 0, 0, 1, 1, 1, 0, 2, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0,
          0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 1,
          2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 2, 0, 0,
          1, 1, 2, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1,
          0, 2, 2, 3, 2, 2, 2, 3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1,
          1, 0, 1, 0, 1, 1, 1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 3, 3, 3, 2,
          2, 2, 2, 3, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 3, 1, 2, 1, 2, 0, 0, 1, 1,
          0, 1, 0, 2, 1, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1,
          0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 2, 0, 0, 1, 0, 3, 2, 2, 2,
          2, 1, 2, 1, 2, 1, 2, 0, 0, 0, 2, 1, 2, 2, 1, 1, 2, 2, 0, 1, 1, 0, 2,
          1, 1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0, 1, 2, 1, 1, 1, 1, 0,
          1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 3, 2, 2, 2, 1, 1, 1, 2, 3, 0, 0, 0, 0,
          2, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0,
          1, 0, 1, 1, 0, 1, 1, 0, 2, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 1, 0, 2, 3, 2, 3, 2, 1, 2, 2, 2, 2, 1, 0, 0, 0, 2, 0, 0, 1, 1,
          0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 1, 1, 1, 2, 1, 0, 2, 0, 0, 1, 0,
          1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3,
          0, 0, 1, 0, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 1, 2, 1, 1,
          1, 2, 2, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1,
          0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 3, 2, 3, 3, 2,
          0, 1, 1, 1, 0, 0, 1, 0, 2, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0,
          1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 2, 3, 3, 3, 3, 1, 2, 2, 2, 2, 0,
          1, 1, 0, 2, 1, 1, 1, 2, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 2, 0, 0, 1, 1, 2, 2, 1, 0, 0, 2, 0,
          1, 1, 3, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 2, 1, 1, 1, 2, 0, 1, 1, 1,
          0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1,
          1, 0, 1, 3, 2, 3, 2, 1, 0, 0, 2, 2, 2, 0, 1, 0, 2, 0, 1, 1, 1, 0, 1,
          0, 0, 0, 3, 0, 1, 1, 0, 0, 2, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1,
          0, 1, 0, 0, 2, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 3, 1, 2,
          1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 1, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1,
          2, 1, 0, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2,
          1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 3, 0, 0, 0, 0, 2, 0, 1,
          1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0,
          1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0,
          0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 3, 3, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0,
          1, 2, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0, 1, 1, 0,
          0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 2, 3, 2, 3, 2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0, 2, 0,
          2, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 2, 0, 1, 2, 1, 0, 1,
          1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0,
          1, 3, 2, 2, 2, 1, 0, 0, 2, 2, 1, 0, 1, 2, 2, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1,
          0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0,
          2, 3, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 1, 0, 1, 0, 2, 1, 1, 1, 0,
          0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 2, 0, 0, 1, 0, 3, 2, 1,
          2, 1, 2, 2, 0, 1, 0, 0, 0, 2, 1, 0, 0, 2, 1, 1, 1, 1, 0, 2, 0, 2, 2,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1,
          1, 1, 1, 0, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 2,
          0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 2, 0, 0, 2, 0, 1, 0, 1, 1, 1, 2,
          1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0,
          1, 1, 0, 2, 1, 2, 2, 2, 0, 3, 0, 1, 1, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1,
          0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 2,
          2, 3, 2, 2, 0, 0, 1, 1, 2, 0, 1, 2, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0,
          1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 2, 1, 1, 2, 1, 2,
          2, 2, 2, 2, 1, 2, 2, 0, 1, 0, 0, 0, 1, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1,
          2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0,
          0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2, 0, 1, 0, 2, 2, 0, 0,
          0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1,
          0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2,
          2, 0, 0, 0, 0, 1, 0, 0, 1, 1, 2, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0,
          2, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0,
          0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 1, 2, 0, 2,
          1, 1, 1, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1,
          0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1,
          1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 1, 0, 0, 0, 0, 2, 0, 1, 2, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0,
          1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1,
          0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2,
          2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0,
          0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
          0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0,
          1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0,
        ]),
        (el.Koi8rModel = {
          charToOrderMap: el.KOI8R_CharToOrderMap,
          precedenceMatrix: el.RussianLangModel,
          mTypicalPositiveRatio: 0.976601,
          keepEnglishLetter: !1,
          charsetName: "KOI8-R",
        }),
        (el.Win1251CyrillicModel = {
          charToOrderMap: el.win1251_CharToOrderMap,
          precedenceMatrix: el.RussianLangModel,
          mTypicalPositiveRatio: 0.976601,
          keepEnglishLetter: !1,
          charsetName: "windows-1251",
        }),
        (el.Latin5CyrillicModel = {
          charToOrderMap: el.latin5_CharToOrderMap,
          precedenceMatrix: el.RussianLangModel,
          mTypicalPositiveRatio: 0.976601,
          keepEnglishLetter: !1,
          charsetName: "ISO-8859-5",
        }),
        (el.MacCyrillicModel = {
          charToOrderMap: el.macCyrillic_CharToOrderMap,
          precedenceMatrix: el.RussianLangModel,
          mTypicalPositiveRatio: 0.976601,
          keepEnglishLetter: !1,
          charsetName: "x-mac-cyrillic",
        }),
        (el.Ibm866Model = {
          charToOrderMap: el.IBM866_CharToOrderMap,
          precedenceMatrix: el.RussianLangModel,
          mTypicalPositiveRatio: 0.976601,
          keepEnglishLetter: !1,
          charsetName: "IBM866",
        }),
        (el.Ibm855Model = {
          charToOrderMap: el.IBM855_CharToOrderMap,
          precedenceMatrix: el.RussianLangModel,
          mTypicalPositiveRatio: 0.976601,
          keepEnglishLetter: !1,
          charsetName: "IBM855",
        }));
    },
    40474(eA, el) {
      ((el.Latin7_CharToOrderMap = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
        253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 253, 253, 253, 253, 253, 253, 253, 82, 100, 104, 94, 98, 101,
        116, 102, 111, 187, 117, 92, 88, 113, 85, 79, 118, 105, 83, 67, 114,
        119, 95, 99, 109, 188, 253, 253, 253, 253, 253, 253, 72, 70, 80, 81, 60,
        96, 93, 89, 68, 120, 97, 77, 86, 69, 55, 78, 115, 65, 66, 58, 76, 106,
        103, 87, 107, 112, 253, 253, 253, 253, 253, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 253,
        233, 90, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253, 74, 253, 253,
        253, 253, 253, 253, 247, 248, 61, 36, 46, 71, 73, 253, 54, 253, 108,
        123, 110, 31, 51, 43, 41, 34, 91, 40, 52, 47, 44, 53, 38, 49, 59, 39,
        35, 48, 250, 37, 33, 45, 56, 50, 84, 57, 120, 121, 17, 18, 22, 15, 124,
        1, 29, 20, 21, 3, 32, 13, 25, 5, 11, 16, 10, 6, 30, 4, 9, 8, 14, 7, 2,
        12, 28, 23, 42, 24, 64, 75, 19, 26, 27, 253,
      ]),
        (el.win1253_CharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 82, 100, 104, 94, 98,
          101, 116, 102, 111, 187, 117, 92, 88, 113, 85, 79, 118, 105, 83, 67,
          114, 119, 95, 99, 109, 188, 253, 253, 253, 253, 253, 253, 72, 70, 80,
          81, 60, 96, 93, 89, 68, 120, 97, 77, 86, 69, 55, 78, 115, 65, 66, 58,
          76, 106, 103, 87, 107, 112, 253, 253, 253, 253, 253, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 253, 233, 61, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          74, 253, 253, 253, 253, 253, 253, 247, 253, 253, 36, 46, 71, 73, 253,
          54, 253, 108, 123, 110, 31, 51, 43, 41, 34, 91, 40, 52, 47, 44, 53,
          38, 49, 59, 39, 35, 48, 250, 37, 33, 45, 56, 50, 84, 57, 120, 121, 17,
          18, 22, 15, 124, 1, 29, 20, 21, 3, 32, 13, 25, 5, 11, 16, 10, 6, 30,
          4, 9, 8, 14, 7, 2, 12, 28, 23, 42, 24, 64, 75, 19, 26, 27, 253,
        ]),
        (el.GreekLangModel = [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2,
          3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 0, 2, 2, 3, 3, 0, 3, 0, 3, 2, 0,
          3, 3, 3, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 3, 3, 0,
          3, 2, 3, 3, 0, 3, 2, 3, 3, 3, 0, 0, 3, 0, 3, 0, 3, 3, 2, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3,
          3, 3, 3, 0, 2, 3, 3, 0, 3, 3, 3, 3, 2, 3, 3, 3, 0, 2, 0, 0, 0, 2, 0,
          0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 2, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 2, 1,
          3, 3, 3, 3, 2, 3, 3, 2, 3, 3, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 0, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 0, 3, 2, 3, 3, 0, 2, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 2,
          3, 0, 0, 0, 0, 3, 3, 0, 3, 1, 3, 3, 3, 0, 3, 3, 0, 3, 3, 3, 3, 0, 0,
          0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 3, 0, 3, 3, 3,
          3, 3, 0, 3, 2, 2, 2, 3, 0, 2, 3, 3, 3, 3, 3, 2, 3, 3, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 0, 3, 1,
          3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 3, 3, 3, 3, 3, 2, 0, 3, 0, 0, 0, 3, 3, 2, 3, 3, 3, 3, 3, 0, 0,
          3, 2, 3, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3,
          3, 3, 3, 0, 0, 3, 3, 0, 2, 3, 0, 3, 0, 3, 3, 3, 0, 0, 3, 0, 3, 0, 2,
          2, 3, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 2, 0, 3,
          2, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 0, 3, 3, 2, 3, 2, 3, 3, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, 3, 0, 2,
          3, 2, 3, 2, 2, 2, 3, 2, 3, 3, 2, 3, 0, 2, 2, 2, 3, 0, 2, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 3, 3, 2, 3, 3, 0, 0, 3, 0, 3, 0, 0,
          0, 3, 2, 0, 3, 0, 3, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0,
          3, 3, 3, 3, 3, 3, 0, 3, 3, 0, 3, 0, 0, 0, 3, 3, 0, 3, 3, 3, 0, 0, 1,
          2, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 2, 0, 0, 3, 2,
          2, 3, 3, 0, 3, 3, 3, 3, 3, 2, 1, 3, 0, 3, 2, 3, 3, 2, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 2, 3, 3, 3, 3, 3, 3, 0, 0, 3, 0,
          3, 0, 0, 0, 3, 3, 0, 3, 2, 3, 0, 0, 3, 3, 3, 0, 3, 0, 0, 0, 2, 0, 0,
          0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 0, 0, 3, 0, 3, 0, 0, 0, 3,
          2, 0, 3, 2, 3, 0, 0, 3, 2, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          1, 2, 2, 3, 3, 3, 3, 3, 3, 0, 2, 3, 0, 3, 0, 0, 0, 3, 3, 0, 3, 0, 2,
          0, 0, 2, 3, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 3, 0,
          3, 0, 3, 3, 2, 3, 0, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 0, 2, 3, 0, 0, 3,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 0, 0, 3, 0, 0, 0, 3,
          3, 0, 3, 0, 2, 3, 3, 0, 0, 3, 0, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 3, 0, 2, 0,
          0, 0, 3, 3, 0, 3, 0, 3, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
          0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 3, 3, 3, 3, 3, 3, 0, 3, 0, 2, 0, 3, 2, 0, 3, 2, 3, 2, 3, 0, 0, 3,
          2, 3, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0,
          2, 3, 3, 3, 3, 3, 0, 0, 0, 3, 0, 2, 1, 0, 0, 3, 2, 2, 2, 0, 3, 0, 0,
          2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 2, 0, 3, 0,
          3, 0, 3, 3, 0, 2, 1, 2, 3, 3, 0, 0, 3, 0, 3, 0, 3, 3, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 0, 2, 3,
          0, 3, 0, 0, 0, 2, 1, 0, 2, 2, 3, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 3, 0, 0, 2, 3, 3, 3, 2, 3, 0, 0, 1, 3, 0, 2, 0, 0, 0,
          0, 3, 0, 1, 0, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          3, 3, 3, 3, 1, 0, 3, 0, 0, 0, 3, 2, 0, 3, 2, 3, 3, 3, 0, 0, 3, 0, 3,
          2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 0,
          0, 3, 0, 0, 0, 0, 2, 0, 2, 3, 3, 2, 2, 2, 2, 3, 0, 2, 0, 2, 2, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 2, 0, 0, 0, 0, 0, 0,
          2, 3, 0, 2, 0, 2, 3, 2, 0, 0, 3, 0, 3, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 3, 3, 2, 2, 3, 0, 2, 0, 3,
          0, 0, 0, 2, 0, 0, 0, 0, 1, 2, 0, 2, 0, 2, 0, 0, 2, 0, 2, 0, 2, 2, 0,
          0, 1, 0, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 0, 0, 1, 0, 0, 0,
          0, 0, 2, 0, 3, 3, 2, 0, 0, 0, 0, 0, 0, 1, 3, 0, 2, 0, 2, 2, 2, 0, 0,
          2, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2,
          3, 2, 0, 2, 2, 0, 2, 0, 2, 2, 0, 2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2,
          3, 0, 0, 0, 2, 0, 1, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 2, 1, 0, 2, 2, 0,
          0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 2, 3, 2, 2,
          3, 2, 3, 2, 0, 0, 3, 3, 3, 0, 0, 3, 2, 0, 0, 0, 1, 1, 0, 2, 0, 2, 2,
          0, 2, 0, 2, 0, 2, 2, 0, 0, 2, 0, 2, 2, 2, 0, 2, 2, 2, 2, 0, 0, 2, 0,
          0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 3, 0, 3, 3, 2, 2, 0, 3, 0, 0, 0, 2, 2,
          0, 2, 2, 2, 1, 2, 0, 0, 1, 2, 2, 0, 0, 3, 0, 0, 0, 2, 0, 1, 2, 0, 0,
          0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1, 0, 0, 2, 0, 0, 0, 2, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 3, 3, 2, 2, 0, 0, 0, 2, 0, 2, 3, 3, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2,
          2, 0, 2, 2, 0, 2, 0, 2, 0, 2, 2, 0, 0, 2, 2, 2, 2, 1, 0, 0, 2, 2, 0,
          2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 2, 3,
          0, 0, 0, 3, 0, 0, 2, 2, 0, 2, 0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 3, 2, 0, 2, 2, 2,
          2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 0, 0, 2, 0, 1, 0, 0, 0, 0, 2,
          2, 2, 0, 2, 2, 0, 1, 2, 0, 2, 2, 2, 0, 2, 2, 2, 2, 1, 2, 2, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 2,
          0, 0, 0, 0, 1, 2, 1, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 3, 2, 3, 0, 0, 2, 0, 0, 0, 2, 2, 0, 2, 0, 0, 0, 1, 0,
          0, 2, 0, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0,
          0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2,
          3, 2, 2, 0, 0, 0, 0, 0, 0, 1, 3, 0, 2, 0, 2, 2, 0, 0, 0, 1, 0, 2, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 3, 2, 0,
          2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 2, 1, 2, 0, 2, 2, 0, 1, 0, 0, 1,
          0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 2,
          0, 0, 0, 2, 3, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 2, 0, 1, 2, 0,
          0, 0, 1, 2, 2, 1, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 2, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 2, 2, 0, 2,
          0, 0, 2, 0, 0, 0, 0, 1, 2, 1, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 2, 0, 0, 0, 3, 1, 2, 2, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0,
          3, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 2,
          0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 2, 0, 2, 2, 0, 0, 2, 2, 2, 2, 2, 0, 1, 2, 0, 0, 0, 2, 2, 0,
          1, 0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2, 0,
          1, 2, 0, 0, 0, 0, 2, 2, 1, 0, 1, 0, 1, 0, 2, 2, 2, 1, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 0, 0, 2, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 0, 0,
          0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2,
          0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0,
          0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 1, 2, 0, 0,
          0, 0, 0, 0, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0,
          0, 2, 0, 0, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0,
          2, 0, 0, 2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2,
          0, 0, 2, 0, 2, 2, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2,
          2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2,
          0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0,
          2, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ]),
        (el.Latin7GreekModel = {
          charToOrderMap: el.Latin7_CharToOrderMap,
          precedenceMatrix: el.GreekLangModel,
          mTypicalPositiveRatio: 0.982851,
          keepEnglishLetter: !1,
          charsetName: "ISO-8859-7",
        }),
        (el.Win1253GreekModel = {
          charToOrderMap: el.win1253_CharToOrderMap,
          precedenceMatrix: el.GreekLangModel,
          mTypicalPositiveRatio: 0.982851,
          keepEnglishLetter: !1,
          charsetName: "windows-1253",
        }));
    },
    11300(eA, el) {
      ((el.TIS620CharToOrderMap = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
        253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 253, 253, 253, 253, 253, 253, 253, 182, 106, 107, 100, 183,
        184, 185, 101, 94, 186, 187, 108, 109, 110, 111, 188, 189, 190, 89, 95,
        112, 113, 191, 192, 193, 194, 253, 253, 253, 253, 253, 253, 64, 72, 73,
        114, 74, 115, 116, 102, 81, 201, 117, 90, 103, 78, 82, 96, 202, 91, 79,
        84, 104, 105, 97, 98, 92, 203, 253, 253, 253, 253, 253, 209, 210, 211,
        212, 213, 88, 214, 215, 216, 217, 218, 219, 220, 118, 221, 222, 223,
        224, 99, 85, 83, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235,
        236, 5, 30, 237, 24, 238, 75, 8, 26, 52, 34, 51, 119, 47, 58, 57, 49,
        53, 55, 43, 20, 19, 44, 14, 48, 3, 17, 25, 39, 62, 31, 54, 45, 9, 16, 2,
        61, 15, 239, 12, 42, 46, 18, 21, 76, 4, 66, 63, 22, 10, 1, 36, 23, 13,
        40, 27, 32, 35, 86, 240, 241, 242, 243, 244, 11, 28, 41, 29, 33, 245,
        50, 37, 6, 7, 67, 77, 38, 93, 246, 247, 68, 56, 59, 65, 69, 60, 70, 80,
        71, 87, 248, 249, 250, 251, 252, 253,
      ]),
        (el.ThaiLangModel = [
          0, 1, 3, 3, 3, 3, 0, 0, 3, 3, 0, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0,
          0, 3, 3, 3, 0, 3, 3, 3, 3, 0, 3, 3, 0, 0, 0, 1, 3, 0, 3, 3, 2, 3, 3,
          0, 1, 2, 3, 3, 3, 3, 0, 2, 0, 2, 0, 0, 3, 2, 1, 2, 2, 3, 0, 3, 3, 2,
          3, 0, 0, 3, 3, 0, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 2, 3, 0,
          2, 2, 2, 3, 0, 2, 3, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1, 1, 3, 2, 2, 0, 1,
          1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 3, 2, 3, 3, 2, 2, 2, 3,
          1, 2, 3, 0, 3, 3, 2, 2, 1, 2, 3, 3, 1, 2, 0, 1, 3, 0, 1, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 2, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3,
          2, 2, 2, 2, 3, 3, 2, 2, 3, 3, 2, 2, 3, 2, 3, 2, 2, 3, 3, 1, 2, 3, 1,
          2, 2, 3, 3, 1, 0, 2, 1, 0, 0, 3, 1, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          1, 0, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 2, 3, 2, 2, 3, 3, 2, 2,
          3, 2, 2, 2, 2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 0, 2, 1, 0, 1, 0, 1, 1,
          0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3,
          3, 2, 3, 2, 3, 3, 2, 2, 3, 2, 3, 3, 2, 3, 1, 1, 2, 3, 2, 2, 2, 3, 2,
          2, 2, 2, 2, 1, 2, 1, 2, 2, 1, 1, 3, 3, 2, 1, 0, 1, 2, 2, 0, 1, 3, 0,
          0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 3, 0, 0, 2, 1, 1, 3, 3, 2, 3, 3, 2, 0,
          0, 3, 3, 0, 3, 3, 0, 2, 2, 3, 1, 2, 2, 1, 1, 1, 0, 2, 2, 2, 0, 2, 2,
          1, 1, 0, 2, 1, 0, 2, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 2, 3, 3, 2, 0, 0, 3, 3, 0, 2,
          3, 0, 2, 1, 2, 2, 2, 2, 1, 2, 0, 0, 2, 2, 2, 0, 2, 2, 1, 1, 0, 2, 1,
          0, 2, 0, 0, 2, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 3, 3, 2, 3, 2, 3, 2, 0, 2, 2, 1, 3, 2, 1, 3, 2, 1,
          2, 3, 2, 2, 3, 0, 2, 3, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 0, 0, 0, 0, 2,
          0, 1, 2, 0, 1, 1, 1, 0, 1, 0, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 3, 3, 2, 3, 3, 2, 3, 2, 2, 2, 3, 2, 2, 3, 2, 2, 1, 2, 3, 2, 2, 3,
          1, 3, 2, 2, 2, 3, 2, 2, 2, 3, 3, 2, 1, 3, 0, 1, 1, 1, 0, 2, 1, 1, 1,
          1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 3,
          0, 3, 3, 3, 3, 3, 0, 0, 3, 0, 2, 2, 3, 3, 3, 3, 3, 0, 0, 0, 1, 1, 3,
          0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 3, 0, 2,
          0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 3, 3, 3, 0, 0, 2,
          3, 0, 0, 3, 0, 3, 3, 2, 3, 3, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 3, 3,
          0, 0, 3, 0, 0, 0, 0, 2, 0, 0, 2, 1, 1, 3, 0, 0, 1, 0, 0, 2, 3, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 1, 2,
          1, 3, 3, 2, 2, 1, 2, 2, 2, 3, 1, 1, 2, 0, 2, 1, 2, 1, 2, 2, 1, 0, 0,
          0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 3, 0, 2, 1, 2, 3, 3, 3, 0, 2, 0, 2, 2, 0, 2, 1, 3, 2, 2,
          1, 2, 1, 0, 0, 2, 2, 1, 0, 2, 1, 2, 2, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          3, 3, 3, 2, 1, 3, 3, 1, 1, 3, 0, 2, 3, 1, 1, 3, 2, 1, 1, 2, 0, 2, 2,
          3, 2, 1, 1, 1, 1, 1, 2, 3, 0, 0, 1, 3, 1, 2, 1, 2, 0, 3, 0, 0, 0, 1,
          0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 3, 1, 1, 3, 2,
          3, 3, 3, 1, 3, 2, 1, 3, 2, 1, 3, 2, 2, 2, 2, 1, 3, 3, 1, 2, 1, 3, 1,
          2, 3, 0, 2, 1, 1, 3, 2, 2, 2, 1, 2, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 2, 3, 2, 3, 3, 2, 3, 2, 3,
          2, 3, 3, 2, 1, 0, 3, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 2,
          2, 3, 0, 1, 3, 1, 1, 1, 1, 0, 1, 1, 0, 2, 1, 0, 2, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 2, 3, 2, 2, 1, 1, 3, 2, 3, 2, 3, 2,
          0, 3, 2, 2, 1, 2, 0, 2, 2, 2, 1, 2, 2, 2, 2, 1, 3, 2, 1, 2, 2, 1, 0,
          2, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 3, 3, 3, 3, 3, 2, 3, 1, 2, 3, 3, 2, 2, 3, 0, 1, 1, 2, 0, 3, 3,
          2, 2, 3, 0, 1, 1, 3, 0, 0, 0, 0, 3, 1, 0, 3, 3, 0, 2, 0, 2, 1, 0, 0,
          3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3,
          2, 3, 2, 3, 3, 0, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 1, 0, 2, 3, 1, 1,
          1, 1, 1, 1, 1, 1, 3, 1, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0, 2, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 1, 1, 2, 1, 3,
          3, 2, 3, 2, 2, 3, 2, 2, 3, 1, 2, 2, 1, 2, 0, 3, 2, 1, 2, 2, 2, 2, 2,
          1, 3, 2, 1, 2, 2, 2, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 0, 2,
          1, 0, 3, 2, 0, 0, 3, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1,
          0, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 3, 0, 2, 2, 2, 3, 0, 0, 1, 3, 0, 3, 2, 0, 3, 2, 2, 3,
          3, 3, 3, 3, 1, 0, 2, 2, 2, 0, 2, 2, 1, 2, 0, 2, 3, 0, 0, 0, 0, 1, 0,
          1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          3, 0, 2, 3, 1, 3, 3, 2, 3, 3, 0, 3, 3, 0, 3, 2, 2, 3, 2, 3, 3, 3, 0,
          0, 2, 2, 3, 0, 1, 1, 1, 3, 0, 0, 3, 0, 0, 0, 2, 2, 0, 1, 3, 0, 1, 2,
          2, 2, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 3, 3, 2,
          0, 3, 3, 2, 2, 3, 1, 3, 2, 1, 3, 2, 0, 1, 2, 2, 0, 2, 3, 2, 1, 0, 3,
          0, 0, 0, 0, 3, 0, 0, 2, 3, 1, 3, 0, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 2, 2, 2, 1, 2, 0, 1,
          3, 1, 1, 3, 1, 3, 0, 0, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0, 2, 1, 0, 1, 1,
          2, 0, 0, 0, 3, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0,
          0, 3, 1, 0, 0, 0, 1, 0, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 3, 1, 1, 1, 2,
          0, 1, 1, 2, 1, 2, 1, 3, 2, 0, 0, 3, 1, 1, 1, 1, 1, 3, 1, 0, 2, 3, 0,
          0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 3, 0, 3, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 3, 1, 3, 0, 0, 1, 2, 0, 0, 2, 0, 3, 3, 2, 3, 3, 3, 2, 3, 0, 0, 2,
          2, 2, 0, 0, 0, 2, 2, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 0, 0, 1, 0, 3, 0, 0, 0,
          0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1, 2, 3, 1, 2, 3, 1, 0, 3, 0,
          2, 2, 1, 0, 2, 1, 1, 2, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0,
          0, 0, 1, 1, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 2, 1, 0, 1, 1, 1, 3, 1, 2, 2, 2, 2, 2,
          2, 1, 1, 1, 1, 0, 3, 1, 0, 1, 3, 1, 1, 1, 1, 1, 1, 0, 2, 0, 1, 3, 1,
          1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0,
          1, 3, 0, 2, 2, 1, 3, 3, 2, 3, 3, 0, 1, 1, 0, 2, 2, 1, 2, 1, 3, 3, 1,
          0, 0, 3, 2, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 0, 1, 2, 0, 1, 1, 3, 1,
          1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0,
          0, 1, 0, 0, 0, 3, 0, 0, 3, 0, 3, 1, 0, 1, 1, 1, 3, 2, 0, 0, 0, 3, 0,
          0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1, 3, 2, 1, 3, 3, 1,
          2, 2, 0, 1, 2, 1, 0, 1, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0,
          3, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 2, 0, 3, 3, 3, 2, 2, 0, 1, 1, 0,
          1, 3, 0, 0, 0, 2, 2, 0, 0, 0, 0, 3, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 3, 0, 2, 3, 1, 2, 0, 0, 2, 1, 0, 3, 1, 0, 1, 2, 0, 1, 1,
          1, 1, 3, 0, 0, 3, 1, 1, 0, 2, 2, 1, 1, 0, 2, 0, 0, 0, 0, 0, 1, 0, 1,
          0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3,
          0, 0, 3, 1, 2, 0, 0, 2, 2, 0, 1, 2, 0, 1, 0, 1, 3, 1, 2, 1, 0, 0, 0,
          2, 0, 3, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 1, 2, 2,
          0, 0, 0, 2, 0, 2, 1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 0, 0, 1, 1, 1, 0, 2,
          1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 2, 0, 1, 3, 1, 1, 1, 1,
          0, 0, 0, 0, 3, 2, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 2, 3, 2, 2, 0, 0, 0, 1, 0, 0, 0, 0, 2, 3, 2, 1, 2, 2, 3,
          0, 0, 0, 2, 3, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2,
          2, 0, 1, 0, 0, 0, 0, 2, 0, 2, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0,
          1, 0, 1, 1, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 3, 0, 1, 0, 0, 0, 2, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1, 0, 0, 1, 0, 0,
          0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 1, 0, 0, 1, 3, 1, 0, 0, 0, 0, 1, 1, 0,
          0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1, 1, 1, 1, 2, 3, 0, 0, 2, 1, 1,
          1, 1, 1, 0, 2, 1, 1, 0, 0, 0, 2, 1, 0, 1, 2, 1, 1, 0, 1, 2, 1, 0, 3,
          0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          3, 3, 2, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 0, 2, 0, 0, 1, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 3, 0, 1,
          0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 1,
          1, 2, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 2, 1, 1, 0, 1, 0, 0,
          1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
          0, 1, 2, 0, 1, 2, 0, 0, 1, 1, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0,
          0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 1, 1, 0, 1, 1, 0, 2, 1, 3, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
          0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 1, 1, 2, 0,
          0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 3, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 1, 0, 0, 1,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ]),
        (el.TIS620ThaiModel = {
          charToOrderMap: el.TIS620CharToOrderMap,
          precedenceMatrix: el.ThaiLangModel,
          mTypicalPositiveRatio: 0.926386,
          keepEnglishLetter: !1,
          charsetName: "TIS-620",
        }));
    },
    51733(eA, el) {
      ((el.Latin2_HungarianCharToOrderMap = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
        253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 253, 253, 253, 253, 253, 253, 253, 28, 40, 54, 45, 32, 50, 49,
        38, 39, 53, 36, 41, 34, 35, 47, 46, 71, 43, 33, 37, 57, 48, 64, 68, 55,
        52, 253, 253, 253, 253, 253, 253, 2, 18, 26, 17, 1, 27, 12, 20, 9, 22,
        7, 6, 13, 4, 8, 23, 67, 10, 5, 3, 21, 19, 65, 62, 16, 11, 253, 253, 253,
        253, 253, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170,
        171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184,
        185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 75,
        198, 199, 200, 201, 202, 203, 204, 205, 79, 206, 207, 208, 209, 210,
        211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 51, 81, 222, 78,
        223, 224, 225, 226, 44, 227, 228, 229, 61, 230, 231, 232, 233, 234, 58,
        235, 66, 59, 236, 237, 238, 60, 69, 63, 239, 240, 241, 82, 14, 74, 242,
        70, 80, 243, 72, 244, 15, 83, 77, 84, 30, 76, 85, 245, 246, 247, 25, 73,
        42, 24, 248, 249, 250, 31, 56, 29, 251, 252, 253,
      ]),
        (el.win1250HungarianCharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 28, 40, 54, 45, 32, 50,
          49, 38, 39, 53, 36, 41, 34, 35, 47, 46, 72, 43, 33, 37, 57, 48, 64,
          68, 55, 52, 253, 253, 253, 253, 253, 253, 2, 18, 26, 17, 1, 27, 12,
          20, 9, 22, 7, 6, 13, 4, 8, 23, 67, 10, 5, 3, 21, 19, 65, 62, 16, 11,
          253, 253, 253, 253, 253, 161, 162, 163, 164, 165, 166, 167, 168, 169,
          170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 78, 181, 69,
          182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195,
          196, 197, 76, 198, 199, 200, 201, 202, 203, 204, 205, 81, 206, 207,
          208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221,
          51, 83, 222, 80, 223, 224, 225, 226, 44, 227, 228, 229, 61, 230, 231,
          232, 233, 234, 58, 235, 66, 59, 236, 237, 238, 60, 70, 63, 239, 240,
          241, 84, 14, 75, 242, 71, 82, 243, 73, 244, 15, 85, 79, 86, 30, 77,
          87, 245, 246, 247, 25, 74, 42, 24, 248, 249, 250, 31, 56, 29, 251,
          252, 253,
        ]),
        (el.HungarianLangModel = [
          0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3,
          3, 3, 3, 3, 3, 2, 2, 3, 3, 1, 1, 2, 2, 2, 2, 2, 1, 2, 3, 2, 2, 3, 3,
          3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 2, 3, 3, 1, 1, 3, 3,
          0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 2, 1, 3, 3, 3, 3, 3, 2, 3,
          3, 3, 3, 3, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 2, 0, 1, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 3,
          3, 3, 1, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 0, 3, 2, 3, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0,
          0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 2, 3, 3, 3, 3, 3, 2,
          3, 3, 2, 2, 3, 2, 3, 2, 0, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 3, 3,
          3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 1, 2, 3, 2, 2, 3, 1, 2, 3,
          3, 2, 2, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 2, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 0, 2,
          3, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1,
          1, 1, 3, 3, 2, 1, 3, 2, 2, 3, 2, 1, 3, 2, 2, 1, 0, 3, 3, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 3, 2, 2, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 1, 2, 1,
          3, 3, 3, 3, 2, 2, 3, 1, 1, 3, 2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3,
          2, 2, 1, 3, 3, 3, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 2, 3, 3, 3,
          2, 0, 3, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 2, 3, 3,
          3, 2, 3, 2, 3, 3, 3, 1, 3, 2, 2, 2, 3, 1, 1, 3, 3, 1, 1, 0, 3, 3, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 2,
          3, 3, 3, 2, 3, 3, 3, 3, 3, 1, 2, 3, 2, 2, 0, 2, 2, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 3, 3, 3, 2, 2, 2, 3, 1, 3, 3, 2, 2, 1, 3, 3, 3, 1, 1, 3,
          1, 2, 3, 2, 3, 2, 2, 2, 1, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3,
          1, 1, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 1, 2, 1, 3, 3, 3, 2, 2, 3, 2,
          1, 0, 3, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 3, 3, 3,
          3, 3, 1, 2, 3, 3, 3, 3, 1, 1, 0, 3, 3, 3, 3, 0, 2, 3, 0, 0, 2, 1, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 2,
          2, 2, 2, 3, 3, 0, 1, 2, 3, 2, 3, 2, 2, 3, 2, 1, 2, 0, 2, 2, 2, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 2, 1, 2, 3, 3,
          2, 2, 2, 3, 2, 3, 3, 1, 3, 3, 1, 1, 0, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 3, 3, 3, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1,
          3, 2, 1, 2, 3, 1, 1, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3,
          2, 1, 2, 1, 1, 3, 3, 1, 1, 1, 1, 3, 3, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2,
          1, 1, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 1, 1, 2, 1, 1,
          3, 3, 1, 0, 1, 1, 3, 3, 2, 0, 1, 1, 2, 3, 1, 0, 2, 2, 1, 0, 0, 1, 3,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 2, 1, 3, 3, 3, 3, 3, 1, 2, 3, 2, 3,
          3, 2, 1, 1, 3, 2, 3, 2, 1, 2, 2, 0, 1, 2, 1, 0, 0, 1, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 3, 3, 3, 3, 2, 2, 2, 2, 3, 1, 2, 2, 1, 1, 3, 3, 0, 3,
          2, 1, 2, 3, 2, 1, 3, 3, 1, 1, 0, 2, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          3, 3, 3, 2, 2, 2, 3, 2, 3, 3, 3, 2, 1, 1, 3, 3, 1, 1, 1, 2, 2, 3, 2,
          3, 2, 2, 2, 1, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 3,
          3, 3, 3, 0, 0, 3, 3, 2, 3, 0, 0, 0, 2, 3, 3, 1, 0, 1, 2, 0, 0, 1, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 2, 3, 3, 3, 3, 3, 1, 2,
          3, 3, 2, 2, 1, 1, 0, 3, 3, 2, 2, 1, 2, 2, 1, 0, 2, 2, 0, 1, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 2, 1, 3, 1, 2, 3, 3, 2, 2, 1, 1, 2,
          2, 1, 1, 1, 1, 3, 2, 1, 1, 1, 1, 2, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 2, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 0, 1, 1, 3, 3, 1, 1, 1, 1,
          1, 2, 2, 0, 3, 1, 1, 2, 0, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1,
          0, 1, 2, 1, 2, 2, 0, 1, 2, 3, 1, 2, 0, 0, 0, 2, 1, 1, 1, 1, 1, 2, 0,
          0, 1, 1, 0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 0, 2, 0, 2, 2, 1,
          1, 2, 1, 1, 2, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 2, 3, 2, 3,
          3, 0, 1, 2, 2, 3, 1, 0, 1, 0, 2, 1, 2, 2, 0, 1, 1, 0, 0, 1, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 3, 2, 2, 1, 0, 0, 3, 2,
          3, 2, 0, 0, 0, 1, 1, 3, 0, 0, 1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 3, 1, 1, 2, 2, 3, 3, 1, 0, 1, 3, 2, 3, 1, 1, 1, 0,
          1, 1, 1, 1, 1, 3, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 3, 1, 1, 1, 2, 2, 2, 1, 0, 1, 2, 3, 3, 2, 0, 0, 0, 2, 1, 1, 1, 2,
          1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 0, 2, 1,
          1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 3, 2, 2, 1,
          0, 0, 1, 1, 2, 2, 0, 3, 0, 1, 2, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1,
          0, 2, 1, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1,
          1, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 3, 3, 0, 1, 0, 0, 0, 3,
          3, 1, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 2, 0, 0, 1, 1, 1, 0, 2, 1, 1, 1,
          2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 2, 1, 1, 0,
          1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 3, 3, 0, 1, 0, 0, 0, 2, 2, 0, 0, 0, 0,
          1, 2, 2, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 0, 1, 0, 2, 1, 1, 1, 1,
          2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1, 1, 1,
          1, 1, 0, 1, 3, 2, 2, 0, 1, 0, 1, 0, 2, 3, 2, 0, 0, 1, 2, 2, 1, 0, 0,
          1, 1, 1, 0, 0, 2, 1, 0, 1, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1,
          1, 1, 1, 1, 0, 2, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 2,
          2, 2, 0, 0, 1, 0, 0, 2, 2, 1, 1, 0, 0, 2, 1, 1, 0, 0, 0, 1, 2, 0, 0,
          2, 1, 0, 0, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 2, 1, 1,
          2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 3, 0, 0, 0,
          1, 0, 3, 2, 1, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 2, 1, 0, 1, 1, 0, 0, 2,
          1, 2, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 2, 0, 0, 1, 0, 0, 0, 2,
          0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 3, 0, 0, 2, 1, 2, 2, 1, 0, 0, 2,
          1, 2, 2, 0, 0, 0, 2, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 2, 0, 0, 0, 1, 2,
          1, 2, 2, 1, 1, 2, 1, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0,
          1, 1, 1, 1, 0, 0, 1, 1, 3, 2, 0, 0, 0, 1, 0, 2, 2, 2, 0, 0, 0, 2, 2,
          1, 0, 0, 0, 0, 3, 1, 1, 1, 1, 0, 0, 2, 1, 1, 1, 2, 1, 0, 1, 1, 1, 0,
          1, 1, 1, 1, 1, 1, 1, 0, 2, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1,
          0, 1, 2, 3, 2, 0, 0, 0, 1, 0, 2, 2, 0, 0, 0, 0, 2, 1, 1, 0, 0, 0, 0,
          2, 1, 0, 1, 1, 0, 0, 2, 1, 1, 0, 2, 1, 1, 1, 1, 2, 1, 2, 1, 2, 0, 1,
          1, 1, 0, 2, 1, 1, 1, 2, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 3, 1, 1,
          2, 2, 2, 3, 2, 1, 1, 2, 2, 1, 1, 0, 1, 0, 2, 2, 1, 1, 1, 1, 1, 0, 0,
          1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0,
          2, 2, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0, 1, 1, 0, 0, 1, 2, 0, 0, 2, 1, 1,
          1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1,
          1, 1, 0, 1, 2, 1, 1, 1, 0, 1, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 2, 0, 1,
          1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 1, 2,
          1, 2, 1, 1, 1, 2, 0, 2, 1, 1, 1, 0, 1, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 2, 3, 2, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 1, 1, 1, 0,
          0, 0, 0, 2, 0, 0, 1, 1, 0, 0, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1,
          0, 1, 1, 1, 1, 0, 2, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1,
          1, 2, 2, 0, 1, 1, 1, 0, 2, 2, 2, 0, 0, 0, 3, 2, 1, 0, 0, 0, 1, 1, 0,
          0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1,
          1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 2, 1, 0, 2, 1,
          1, 2, 2, 1, 1, 2, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1,
          1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 2, 3, 0, 0, 0, 1, 0, 2, 2,
          0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 0, 1, 0, 2,
          1, 1, 1, 1, 1, 0, 2, 0, 0, 0, 1, 2, 1, 1, 1, 1, 0, 1, 2, 0, 1, 0, 1,
          0, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 0, 0, 0, 1, 0, 2, 1, 2, 0, 0, 0, 1,
          1, 2, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 2, 1, 0, 1, 2, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1, 1, 1, 1,
          1, 0, 1, 1, 2, 2, 0, 0, 0, 1, 0, 2, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0,
          0, 1, 1, 0, 2, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1,
          1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0,
          0, 1, 0, 1, 2, 1, 0, 0, 1, 1, 1, 2, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 1, 1, 1, 1, 2, 0, 2, 0, 1, 1, 0,
          1, 2, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 1, 0, 1, 2, 0,
          0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 1,
          0, 1, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1,
          1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 2, 2, 0, 0, 0, 0, 0, 1, 1, 0, 0,
          0, 0, 2, 1, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0, 1, 2, 1, 1,
          1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1,
          1, 1, 1, 0, 0, 1, 1, 1, 2, 0, 0, 3, 1, 0, 2, 1, 1, 1, 0, 0, 1, 1, 1,
          0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 1, 1, 2,
          1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0,
          0, 2, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0,
          0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1,
          2, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0,
          0, 1, 1, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0,
          1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
          0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0,
          0, 0, 0, 1, 1, 1, 2, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1,
          1, 1, 1, 1, 2, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0,
          1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1,
          0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0,
          0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0,
          1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0,
          0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
          0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0,
        ]),
        (el.Latin2HungarianModel = {
          charToOrderMap: el.Latin2_HungarianCharToOrderMap,
          precedenceMatrix: el.HungarianLangModel,
          mTypicalPositiveRatio: 0.947368,
          keepEnglishLetter: !0,
          charsetName: "ISO-8859-2",
        }),
        (el.Win1250HungarianModel = {
          charToOrderMap: el.win1250HungarianCharToOrderMap,
          precedenceMatrix: el.HungarianLangModel,
          mTypicalPositiveRatio: 0.947368,
          keepEnglishLetter: !0,
          charsetName: "windows-1250",
        }));
    },
    43761(eA, el) {
      ((el.Latin5_BulgarianCharToOrderMap = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
        253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 253, 253, 253, 253, 253, 253, 253, 77, 90, 99, 100, 72, 109,
        107, 101, 79, 185, 81, 102, 76, 94, 82, 110, 186, 108, 91, 74, 119, 84,
        96, 111, 187, 115, 253, 253, 253, 253, 253, 253, 65, 69, 70, 66, 63, 68,
        112, 103, 92, 194, 104, 95, 86, 87, 71, 116, 195, 85, 93, 97, 113, 196,
        197, 198, 199, 200, 253, 253, 253, 253, 253, 194, 195, 196, 197, 198,
        199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212,
        213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 81,
        226, 227, 228, 229, 230, 105, 231, 232, 233, 234, 235, 236, 45, 237,
        238, 31, 32, 35, 43, 37, 44, 55, 47, 40, 59, 33, 46, 38, 36, 41, 30, 39,
        28, 34, 51, 48, 49, 53, 50, 54, 57, 61, 239, 67, 240, 60, 56, 1, 18, 9,
        20, 11, 3, 23, 15, 2, 26, 12, 10, 14, 6, 4, 13, 7, 8, 5, 19, 29, 25, 22,
        21, 27, 24, 17, 75, 52, 241, 42, 16, 62, 242, 243, 244, 58, 245, 98,
        246, 247, 248, 249, 250, 251, 91, 252, 253,
      ]),
        (el.win1251BulgarianCharToOrderMap = [
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 254,
          255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 253, 253, 253, 253, 253, 253, 253, 253, 253, 253,
          253, 253, 253, 253, 253, 253, 252, 252, 252, 252, 252, 252, 252, 252,
          252, 252, 253, 253, 253, 253, 253, 253, 253, 77, 90, 99, 100, 72, 109,
          107, 101, 79, 185, 81, 102, 76, 94, 82, 110, 186, 108, 91, 74, 119,
          84, 96, 111, 187, 115, 253, 253, 253, 253, 253, 253, 65, 69, 70, 66,
          63, 68, 112, 103, 92, 194, 104, 95, 86, 87, 71, 116, 195, 85, 93, 97,
          113, 196, 197, 198, 199, 200, 253, 253, 253, 253, 253, 206, 207, 208,
          209, 210, 211, 212, 213, 120, 214, 215, 216, 217, 218, 219, 220, 221,
          78, 64, 83, 121, 98, 117, 105, 222, 223, 224, 225, 226, 227, 228, 229,
          88, 230, 231, 232, 233, 122, 89, 106, 234, 235, 236, 237, 238, 45,
          239, 240, 73, 80, 118, 114, 241, 242, 243, 244, 245, 62, 58, 246, 247,
          248, 249, 250, 31, 32, 35, 43, 37, 44, 55, 47, 40, 59, 33, 46, 38, 36,
          41, 30, 39, 28, 34, 51, 48, 49, 53, 50, 54, 57, 61, 251, 67, 252, 60,
          56, 1, 18, 9, 20, 11, 3, 23, 15, 2, 26, 12, 10, 14, 6, 4, 13, 7, 8, 5,
          19, 29, 25, 22, 21, 27, 24, 17, 75, 52, 253, 42, 16,
        ]),
        (el.BulgarianLangModel = [
          0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3,
          3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 2, 2, 3, 2, 2, 1, 2, 2, 3, 1, 3, 3, 2,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 1, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 2, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2,
          3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 2, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1,
          2, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3,
          2, 3, 2, 2, 3, 3, 1, 1, 2, 3, 3, 2, 3, 3, 3, 3, 2, 1, 2, 0, 2, 0, 3,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3,
          3, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 3, 1, 3, 0, 3, 0, 2, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 3, 3, 1, 3,
          3, 2, 3, 2, 2, 2, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 2, 2, 3, 3, 3, 1, 2, 2, 3,
          2, 1, 1, 2, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0,
          1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3,
          3, 3, 3, 2, 3, 3, 1, 2, 3, 2, 2, 2, 3, 3, 3, 3, 3, 2, 2, 3, 1, 2, 0,
          2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0, 0, 0, 0,
          0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3,
          3, 3, 2, 3, 3, 3, 2, 3, 3, 2, 3, 2, 2, 2, 3, 1, 2, 0, 1, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1,
          2, 2, 1, 3, 1, 3, 2, 2, 3, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 3, 3, 3, 3, 3, 2, 2, 3, 2, 2, 3, 1, 2, 1, 1, 1, 2, 3, 1,
          3, 1, 2, 2, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3,
          3, 3, 3, 3, 1, 3, 2, 2, 3, 3, 1, 2, 3, 1, 1, 3, 3, 3, 3, 1, 2, 2, 1,
          1, 1, 0, 2, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 2, 2, 3, 3, 3, 2, 2, 1, 1, 2, 0, 2, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 1, 2, 1, 3, 3, 2, 3, 3, 3,
          3, 3, 2, 3, 2, 1, 0, 3, 1, 2, 1, 2, 1, 2, 3, 2, 1, 0, 1, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          0, 0, 3, 1, 3, 3, 2, 3, 3, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 2, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 2, 1, 1, 2, 1, 3, 3, 0, 3, 1,
          1, 1, 1, 3, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2,
          2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 3, 3, 2, 3, 2, 2,
          2, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 2, 3, 3,
          2, 2, 3, 2, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 2, 3, 2, 0, 3, 2, 0, 3,
          0, 2, 0, 0, 2, 1, 3, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 3, 3, 3, 3, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 2,
          1, 2, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          3, 3, 3, 3, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 0, 1, 2, 3, 2, 1, 1, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3,
          2, 2, 1, 0, 1, 0, 0, 1, 0, 0, 0, 2, 1, 0, 3, 0, 0, 1, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 3, 2, 3, 3, 1, 3,
          2, 1, 1, 1, 2, 1, 1, 2, 1, 3, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 2, 2, 3, 3, 2, 3, 2, 2, 2, 3, 1, 2,
          2, 1, 1, 2, 1, 1, 2, 2, 0, 1, 1, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 3, 3, 3, 3, 2, 1, 3, 1, 0, 2, 2, 1, 3, 2, 1, 0, 0, 2, 0, 2,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3,
          3, 3, 3, 3, 1, 2, 0, 2, 3, 1, 2, 3, 2, 0, 1, 3, 1, 2, 1, 1, 1, 0, 0,
          1, 0, 0, 2, 2, 2, 3, 2, 2, 2, 2, 1, 2, 1, 1, 2, 2, 1, 1, 2, 0, 1, 1,
          1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 3, 3, 3, 3, 3, 2, 1,
          2, 2, 1, 2, 0, 2, 0, 1, 0, 1, 2, 1, 2, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 3, 3, 1, 1, 3, 1, 0, 3, 2,
          1, 0, 0, 0, 1, 2, 0, 2, 0, 1, 0, 0, 0, 1, 0, 1, 2, 1, 2, 2, 1, 1, 1,
          1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 0, 0, 0,
          0, 0, 1, 1, 0, 0, 3, 1, 0, 1, 0, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2, 2, 1,
          0, 2, 1, 2, 1, 1, 1, 0, 1, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 1, 2,
          1, 1, 0, 1, 2, 1, 2, 2, 2, 1, 1, 1, 0, 1, 1, 1, 1, 2, 0, 1, 0, 0, 0,
          0, 2, 3, 2, 3, 3, 0, 0, 2, 1, 0, 2, 1, 0, 0, 0, 0, 2, 3, 0, 2, 0, 0,
          0, 0, 0, 1, 0, 0, 2, 0, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1,
          0, 1, 2, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 2, 0, 0, 3, 3, 2, 2,
          3, 0, 2, 3, 1, 1, 2, 0, 0, 0, 1, 0, 0, 2, 0, 2, 0, 0, 0, 1, 0, 1, 0,
          1, 2, 0, 2, 2, 1, 1, 1, 1, 2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1,
          0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 3, 2, 3, 3, 0, 0, 3, 0,
          1, 1, 0, 1, 0, 0, 0, 2, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 2,
          2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 0, 2, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
          0, 1, 0, 0, 0, 0, 1, 0, 0, 3, 3, 3, 3, 2, 2, 2, 2, 2, 0, 2, 1, 1, 1,
          1, 2, 1, 2, 1, 1, 0, 2, 0, 1, 0, 1, 0, 0, 2, 0, 1, 2, 1, 1, 1, 1, 1,
          1, 1, 2, 2, 1, 1, 0, 2, 0, 1, 0, 2, 0, 0, 1, 1, 1, 0, 0, 2, 0, 0, 0,
          1, 1, 0, 0, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0,
          1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 0, 1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 2, 2,
          2, 1, 2, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 2,
          3, 3, 3, 3, 0, 2, 2, 0, 2, 1, 0, 0, 0, 1, 1, 1, 2, 0, 2, 0, 0, 0, 3,
          0, 0, 0, 0, 2, 0, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 2, 1, 2, 0, 1,
          1, 1, 0, 1, 1, 1, 1, 0, 2, 1, 0, 0, 0, 1, 1, 0, 0, 2, 3, 3, 3, 3, 0,
          2, 1, 0, 0, 2, 0, 0, 0, 0, 0, 1, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
          0, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 2, 0, 1, 0, 1, 1, 1, 0, 0, 1,
          1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 3, 3, 2, 2, 3, 0, 1, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 1, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 1, 1,
          1, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1,
          0, 0, 0, 1, 1, 0, 0, 3, 1, 0, 1, 0, 2, 2, 2, 2, 3, 2, 1, 1, 1, 2, 3,
          0, 0, 1, 0, 2, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 1, 2, 1, 2,
          2, 1, 1, 0, 1, 2, 1, 2, 2, 1, 1, 1, 0, 0, 1, 1, 1, 2, 1, 0, 1, 0, 0,
          0, 0, 2, 1, 0, 1, 0, 3, 1, 2, 2, 2, 2, 1, 2, 2, 1, 1, 1, 0, 2, 1, 2,
          2, 1, 1, 2, 1, 1, 0, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 0, 1,
          1, 0, 2, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 2, 1, 1,
          1, 1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 3, 2, 2, 1, 1,
          1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 2, 0, 1, 2,
          0, 1, 2, 1, 1, 0, 1, 0, 1, 2, 1, 2, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0,
          2, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 2, 0, 1, 1, 1, 0, 0, 1, 1, 0,
          0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2,
          1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 2,
          2, 1, 1, 2, 1, 2, 1, 1, 1, 0, 2, 1, 2, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0,
          1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          2, 2, 2, 3, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 2, 2, 2, 0,
          1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 2, 3, 1, 2, 1,
          0, 1, 1, 0, 2, 2, 2, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0,
          1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0,
          2, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 1,
          1, 1, 1, 1, 0, 0, 1, 2, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 0, 2, 0, 1, 1, 0, 0, 0, 1,
          0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 2, 2, 3, 2, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 2,
          0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0,
          0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1,
          2, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1, 2, 0, 1, 0,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 1, 1, 1,
          1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 3, 1, 1,
          0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1, 0, 0, 1, 0, 2, 0, 0,
          0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 2, 0,
          1, 0, 0, 1, 1, 2, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 1, 1, 0, 2, 1, 0, 1, 1, 1, 0, 0,
          1, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0,
          1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 2, 2, 2, 2, 2, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1,
          0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0,
          0, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1,
          1, 1, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 2, 1, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1,
          0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 2, 0, 0, 2,
          0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 1, 0,
          0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1,
        ]),
        (el.Latin5BulgarianModel = {
          charToOrderMap: el.Latin5_BulgarianCharToOrderMap,
          precedenceMatrix: el.BulgarianLangModel,
          mTypicalPositiveRatio: 0.969392,
          keepEnglishLetter: !1,
          charsetName: "ISO-8859-5",
        }),
        (el.Win1251BulgarianModel = {
          charToOrderMap: el.win1251BulgarianCharToOrderMap,
          precedenceMatrix: el.BulgarianLangModel,
          mTypicalPositiveRatio: 0.969392,
          keepEnglishLetter: !1,
          charsetName: "windows-1251",
        }));
    },
    91266(eA, el, ec) {
      var eu = ec(95927),
        ed = ec(75546),
        ep = 1,
        eg = [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2,
          2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
          1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
          3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 7, 1, 1, 1, 1, 1, 1,
          5, 1, 5, 0, 5, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 1, 7, 0, 7, 5, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 5, 5, 4, 4, 4, 4, 4, 4, 4,
          4, 5, 5, 4, 4, 4, 4, 4, 1, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 6, 6,
          7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 6, 6, 6, 6, 6, 1, 6, 6, 6, 6, 6,
          7, 7, 7,
        ],
        eh = [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3,
          3, 0, 3, 3, 3, 1, 1, 3, 3, 0, 3, 3, 3, 1, 2, 1, 2, 0, 3, 3, 3, 3, 3,
          3, 3, 0, 3, 1, 3, 1, 1, 1, 3, 0, 3, 1, 3, 1, 1, 3, 3,
        ];
      function Latin1Prober() {
        eu.apply(this);
        var eA = 4,
          el = 8,
          ec = this;
        function init() {
          ec.reset();
        }
        ((this.reset = function () {
          ((this._mLastCharClass = ep), (this._mFreqCounter = []));
          for (var el = 0; el < eA; this._mFreqCounter[el++] = 0);
          Latin1Prober.prototype.reset.apply(this);
        }),
          (this.getCharsetName = function () {
            return "windows-1252";
          }),
          (this.getSupportedCharsetNames = function () {
            return [this.getCharsetName()];
          }),
          (this.feed = function (eA) {
            eA = this.removeXmlTags(eA);
            for (var ec = 0; ec < eA.length; ec++) {
              var eu = eg[eA.charCodeAt(ec)],
                ep = eh[this._mLastCharClass * el + eu];
              if (0 == ep) {
                this._mState = ed.notMe;
                break;
              }
              (this._mFreqCounter[ep]++, (this._mLastCharClass = eu));
            }
            return this.getState();
          }),
          (this.getConfidence = function () {
            if (this.getState() == ed.notMe) return 0.01;
            for (var eA, el = 0, ec = 0; ec < this._mFreqCounter.length; ec++)
              el += this._mFreqCounter[ec];
            return (
              (eA =
                el < 0.01
                  ? 0
                  : this._mFreqCounter[3] / el -
                    (20 * this._mFreqCounter[1]) / el) < 0 && (eA = 0),
              (eA *= 0.95)
            );
          }),
          init());
      }
      ((Latin1Prober.prototype = new eu()), (eA.exports = Latin1Prober));
    },
    34918(eA, el, ec) {
      var eu = ec(95927),
        ed = ec(91203),
        ep = ec(88114),
        eg = ec(75546);
      function EscCharSetProber() {
        eu.apply(this);
        var eA = this;
        function init() {
          for (let el of ((eA._mCodingSM = [
            new ed(ep.HZSMModel),
            new ed(ep.ISO2022CNSMModel),
            new ed(ep.ISO2022JPSMModel),
            new ed(ep.ISO2022KRSMModel),
          ]),
          (eA._supportedCharsetNames = []),
          eA._mCodingSM))
            eA._supportedCharsetNames.push(el.getCodingStateMachine());
          eA.reset();
        }
        ((this.reset = function () {
          EscCharSetProber.prototype.reset.apply(this);
          for (var el, ec = 0; (el = this._mCodingSM[ec]); ec++)
            el && ((el.active = !0), el.reset());
          ((this._mActiveSM = eA._mCodingSM.length),
            (this._mDetectedCharset = null));
        }),
          (this.getCharsetName = function () {
            return this._mDetectedCharset;
          }),
          (this.getSupportedCharsetNames = function () {
            return eA._supportedCharsetNames;
          }),
          (this.getConfidence = function () {
            return 0.99 * !!this._mDetectedCharset;
          }),
          (this.feed = function (eA) {
            for (var el, ec = 0; ec < eA.length; ec++) {
              el = eA[ec];
              for (var eu, ed = 0; (eu = this._mCodingSM[ed]); ed++)
                if (eu && eu.active) {
                  var ep = eu.nextState(el);
                  if (ep == eg.error) {
                    if (
                      ((eu.active = !1),
                      this._mActiveSM--,
                      this._mActiveSM <= 0)
                    )
                      return ((this._mState = eg.notMe), this.getState());
                  } else if (ep == eg.itsMe)
                    return (
                      (this._mState = eg.foundIt),
                      (this._mDetectedCharset = eu.getCodingStateMachine()),
                      this.getState()
                    );
                }
            }
            return this.getState();
          }),
          init());
      }
      ((EscCharSetProber.prototype = new eu()),
        (eA.exports = EscCharSetProber));
    },
    88114(eA, el, ec) {
      var eu = ec(75546);
      ((el.HZSMModel = {
        classTable: [
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 5, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1,
        ],
        classFactor: 6,
        stateTable: [
          eu.start,
          eu.error,
          3,
          eu.start,
          eu.start,
          eu.start,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.error,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.itsMe,
          eu.error,
          eu.error,
          eu.start,
          eu.start,
          4,
          eu.error,
          5,
          eu.error,
          6,
          eu.error,
          5,
          5,
          4,
          eu.error,
          4,
          eu.error,
          4,
          4,
          4,
          eu.error,
          4,
          eu.error,
          4,
          eu.itsMe,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
          eu.start,
        ],
        charLenTable: [0, 0, 0, 0, 0, 0],
        name: "HZ-GB-2312",
      }),
        (el.ISO2022CNSMModel = {
          classTable: [
            2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2,
          ],
          classFactor: 9,
          stateTable: [
            eu.start,
            3,
            eu.error,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            4,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            5,
            6,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.error,
            eu.start,
          ],
          charLenTable: [0, 0, 0, 0, 0, 0, 0, 0, 0],
          name: "ISO-2022-CN",
        }),
        (el.ISO2022JPSMModel = {
          classTable: [
            2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 3, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 4, 0, 8,
            0, 0, 0, 0, 9, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2,
          ],
          classFactor: 10,
          stateTable: [
            eu.start,
            3,
            eu.error,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            5,
            eu.error,
            eu.error,
            eu.error,
            4,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            6,
            eu.itsMe,
            eu.error,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.error,
            eu.start,
            eu.start,
          ],
          charLenTable: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          name: "ISO-2022-JP",
        }),
        (el.ISO2022KRSMModel = {
          classTable: [
            2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 2, 2,
          ],
          classFactor: 6,
          stateTable: [
            eu.start,
            3,
            eu.error,
            eu.start,
            eu.start,
            eu.start,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.itsMe,
            eu.error,
            eu.error,
            eu.error,
            4,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            5,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.error,
            eu.itsMe,
            eu.start,
            eu.start,
            eu.start,
            eu.start,
          ],
          charLenTable: [0, 0, 0, 0, 0, 0],
          name: "ISO-2022-KR",
        }));
    },
    5516(eA, el, ec) {
      function bunWhich(eA) {
        return Bun.which(eA);
      }
      function bunWhichAll(eA) {
        let el = process.env.PATH || "",
          ec = "win32" === process.platform ? ";" : ":",
          eu = [];
        for (let ed of el.split(ec)) {
          let el = Bun.which(eA, { PATH: ed });
          el && !eu.includes(el) && eu.push(el);
        }
        return eu;
      }
      function whichAsync(eA) {
        return "u" > typeof Bun
          ? Promise.resolve(bunWhich(eA))
          : ec(77242)(eA).catch(() => null);
      }
      ((whichAsync.sync = function (eA, el) {
        if (!("u" > typeof Bun)) return ec(77242).sync(eA, el);
        {
          if (el?.all) return bunWhichAll(eA);
          let ec = bunWhich(eA);
          if (!ec && !el?.nothrow) throw Error(`not found: ${eA}`);
          return ec;
        }
      }),
        (eA.exports = whichAsync));
    },
    77242(eA, el, ec) {
      let { isexe: eu, sync: ed } = ec(16262),
        { join: ep, delimiter: eg, sep: eh, posix: ef } = ec(16928),
        em = "win32" === process.platform,
        eE = new RegExp(
          `[${ef.sep}${eh === ef.sep ? "" : eh}]`.replace(/(\\)/g, "\\$1"),
        ),
        eC = RegExp(`^\\.${eE.source}`),
        getNotFoundError = (eA) =>
          Object.assign(Error(`not found: ${eA}`), { code: "ENOENT" }),
        getPathInfo = (
          eA,
          {
            path: el = process.env.PATH,
            pathExt: ec = process.env.PATHEXT,
            delimiter: eu = eg,
          },
        ) => {
          let ed = eA.match(eE)
            ? [""]
            : [...(em ? [process.cwd()] : []), ...(el || "").split(eu)];
          if (em) {
            let el = ec || [".EXE", ".CMD", ".BAT", ".COM"].join(eu),
              ep = el.split(eu).flatMap((eA) => [eA, eA.toLowerCase()]);
            return (
              eA.includes(".") && "" !== ep[0] && ep.unshift(""),
              { pathEnv: ed, pathExt: ep, pathExtExe: el }
            );
          }
          return { pathEnv: ed, pathExt: [""] };
        },
        getPathPart = (eA, el) => {
          let ec = /^".*"$/.test(eA) ? eA.slice(1, -1) : eA;
          return (!ec && eC.test(el) ? el.slice(0, 2) : "") + ep(ec, el);
        },
        which = async (eA, el = {}) => {
          let {
              pathEnv: ec,
              pathExt: ed,
              pathExtExe: ep,
            } = getPathInfo(eA, el),
            eg = [];
          for (let eh of ec) {
            let ec = getPathPart(eh, eA);
            for (let eA of ed) {
              let ed = ec + eA;
              if (await eu(ed, { pathExt: ep, ignoreErrors: !0 })) {
                if (!el.all) return ed;
                eg.push(ed);
              }
            }
          }
          if (el.all && eg.length) return eg;
          if (el.nothrow) return null;
          throw getNotFoundError(eA);
        },
        whichSync = (eA, el = {}) => {
          let {
              pathEnv: ec,
              pathExt: eu,
              pathExtExe: ep,
            } = getPathInfo(eA, el),
            eg = [];
          for (let eh of ec) {
            let ec = getPathPart(eh, eA);
            for (let eA of eu) {
              let eu = ec + eA;
              if (ed(eu, { pathExt: ep, ignoreErrors: !0 })) {
                if (!el.all) return eu;
                eg.push(eu);
              }
            }
          }
          if (el.all && eg.length) return eg;
          if (el.nothrow) return null;
          throw getNotFoundError(eA);
        };
      ((eA.exports = which), (which.sync = whichSync));
    },
    16262(eA, el, ec) {
      "use strict";
      var eu =
          (this && this.__createBinding) ||
          (Object.create
            ? function (eA, el, ec, eu) {
                void 0 === eu && (eu = ec);
                var ed = Object.getOwnPropertyDescriptor(el, ec);
                ((!ed ||
                  ("get" in ed
                    ? !el.__esModule
                    : ed.writable || ed.configurable)) &&
                  (ed = {
                    enumerable: !0,
                    get: function () {
                      return el[ec];
                    },
                  }),
                  Object.defineProperty(eA, eu, ed));
              }
            : function (eA, el, ec, eu) {
                (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
              }),
        ed =
          (this && this.__setModuleDefault) ||
          (Object.create
            ? function (eA, el) {
                Object.defineProperty(eA, "default", {
                  enumerable: !0,
                  value: el,
                });
              }
            : function (eA, el) {
                eA.default = el;
              }),
        ep =
          (this && this.__importStar) ||
          function (eA) {
            if (eA && eA.__esModule) return eA;
            var el = {};
            if (null != eA)
              for (var ec in eA)
                "default" !== ec &&
                  Object.prototype.hasOwnProperty.call(eA, ec) &&
                  eu(el, eA, ec);
            return (ed(el, eA), el);
          },
        eg =
          (this && this.__exportStar) ||
          function (eA, el) {
            for (var ec in eA)
              "default" === ec ||
                Object.prototype.hasOwnProperty.call(el, ec) ||
                eu(el, eA, ec);
          };
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.sync = el.isexe = el.posix = el.win32 = void 0));
      let eh = ep(ec(71481));
      el.posix = eh;
      let ef = ep(ec(53381));
      ((el.win32 = ef), eg(ec(10136), el));
      let em =
        "win32" === (process.env._ISEXE_TEST_PLATFORM_ || process.platform)
          ? ef
          : eh;
      ((el.isexe = em.isexe), (el.sync = em.sync));
    },
    71481(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.sync = el.isexe = void 0));
      let eu = ec(79896),
        ed = ec(91943);
      ((el.isexe = async (eA, el = {}) => {
        let { ignoreErrors: ec = !1 } = el;
        try {
          return checkStat(await (0, ed.stat)(eA), el);
        } catch (el) {
          let eA = el;
          if (ec || "EACCES" === eA.code) return !1;
          throw eA;
        }
      }),
        (el.sync = (eA, el = {}) => {
          let { ignoreErrors: ec = !1 } = el;
          try {
            return checkStat((0, eu.statSync)(eA), el);
          } catch (el) {
            let eA = el;
            if (ec || "EACCES" === eA.code) return !1;
            throw eA;
          }
        }));
      let checkStat = (eA, el) => eA.isFile() && checkMode(eA, el),
        checkMode = (eA, el) => {
          let ec = el.uid ?? process.getuid?.(),
            eu = el.groups ?? process.getgroups?.() ?? [],
            ed = el.gid ?? process.getgid?.() ?? eu[0];
          if (void 0 === ec || void 0 === ed)
            throw Error("cannot get uid or gid");
          let ep = new Set([ed, ...eu]),
            eg = eA.mode,
            eh = eA.uid,
            ef = eA.gid,
            em = parseInt("100", 8),
            eE = parseInt("010", 8),
            eC = parseInt("001", 8),
            ey = em | eE;
          return !!(
            eg & eC ||
            (eg & eE && ep.has(ef)) ||
            (eg & em && eh === ec) ||
            (eg & ey && 0 === ec)
          );
        };
    },
    53381(eA, el, ec) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.sync = el.isexe = void 0));
      let eu = ec(79896),
        ed = ec(91943);
      ((el.isexe = async (eA, el = {}) => {
        let { ignoreErrors: ec = !1 } = el;
        try {
          return checkStat(await (0, ed.stat)(eA), eA, el);
        } catch (el) {
          let eA = el;
          if (ec || "EACCES" === eA.code) return !1;
          throw eA;
        }
      }),
        (el.sync = (eA, el = {}) => {
          let { ignoreErrors: ec = !1 } = el;
          try {
            return checkStat((0, eu.statSync)(eA), eA, el);
          } catch (el) {
            let eA = el;
            if (ec || "EACCES" === eA.code) return !1;
            throw eA;
          }
        }));
      let checkPathExt = (eA, el) => {
          let { pathExt: ec = process.env.PATHEXT || "" } = el,
            eu = ec.split(";");
          if (-1 !== eu.indexOf("")) return !0;
          for (let el = 0; el < eu.length; el++) {
            let ec = eu[el].toLowerCase(),
              ed = eA.substring(eA.length - ec.length).toLowerCase();
            if (ec && ed === ec) return !0;
          }
          return !1;
        },
        checkStat = (eA, el, ec) => eA.isFile() && checkPathExt(el, ec);
    },
    10136(eA, el) {
      "use strict";
      Object.defineProperty(el, "__esModule", { value: !0 });
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const mod = { exports: {} };
      cache.set(id, mod);
      factories[id](mod, mod.exports, getModule);
      return mod.exports;
    }
    const value = runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit shell IO dependency required: " + id);
    return value;
  }
  return {
    iconv: getModule(93130),
    detector: getModule(23238),
    which: getModule(5516),
    getModule,
  };
}
