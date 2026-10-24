// @ts-nocheck
import { installNativeModuleRuntime } from "./native-module-runtime.js";
// Original source-map support and consumer/generator closure. Installation remains explicit.
export const SOURCE_MAP_SUPPORT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SOURCE_MAP_SUPPORT_MODULES = [
  [25844, 6605619, 6613249],
  [74064, 6605467, 6605618],
  [16928, 15800612, 15800662],
  [79896, 15798416, 15798464],
  [46031, 2551959, 2552938],
  [17280, 6592248, 6597470],
  [93569, 6578918, 6592247],
  [27748, 6597471, 6601644],
  [64637, 6576133, 6576760],
  [63578, 6601645, 6605466],
  [94100, 6574979, 6576132],
  [53551, 6577719, 6578448],
  [12192, 6577157, 6577718],
  [58448, 6578449, 6578917],
  [11573, 6576761, 6577156],
] as const;
export function createNativeSourceMapSupport(runtime: any) {
  if (!runtime?.require || !runtime.process || !runtime.Error)
    throw globalThis.Error(
      "Explicit source-map require, process and Error surfaces required",
    );
  const require = runtime.require,
    process = runtime.process,
    Error = runtime.Error,
    console = runtime.console ?? globalThis.console,
    Buffer = runtime.Buffer ?? globalThis.Buffer;
  const factories = {
    25844(eA, el, ec) {
      eA = ec.nmd(eA);
      var eu,
        ed = ec(74064).SourceMapConsumer,
        ep = ec(16928);
      try {
        ((eu = ec(79896)).existsSync && eu.readFileSync) || (eu = null);
      } catch (eA) {}
      var eg = ec(46031);
      function dynamicRequire(eA, el) {
        return eA.require(el);
      }
      var eh = !1,
        ef = !1,
        em = !1,
        eE = "auto",
        eC = {},
        ey = {},
        ew = /^data:application\/json[^,]+base64,/,
        eB = [],
        e_ = [];
      function isInBrowser() {
        return (
          "browser" === eE ||
          ("node" !== eE &&
            "u" > typeof window &&
            "function" == typeof XMLHttpRequest &&
            !(
              window.require &&
              window.module &&
              window.process &&
              "renderer" === window.process.type
            ))
        );
      }
      function hasGlobalProcessEventEmitter() {
        return (
          "object" == typeof process &&
          null !== process &&
          "function" == typeof process.on
        );
      }
      function globalProcessVersion() {
        return "object" == typeof process && null !== process
          ? process.version
          : "";
      }
      function globalProcessStderr() {
        if ("object" == typeof process && null !== process)
          return process.stderr;
      }
      function globalProcessExit(eA) {
        if (
          "object" == typeof process &&
          null !== process &&
          "function" == typeof process.exit
        )
          return process.exit(eA);
      }
      function handlerExec(eA) {
        return function (el) {
          for (var ec = 0; ec < eA.length; ec++) {
            var eu = eA[ec](el);
            if (eu) return eu;
          }
          return null;
        };
      }
      var eI = handlerExec(eB);
      function supportRelativeURL(eA, el) {
        if (!eA) return el;
        var ec = ep.dirname(eA),
          eu = /^\w+:\/\/[^\/]*/.exec(ec),
          ed = eu ? eu[0] : "",
          eg = ec.slice(ed.length);
        return ed && /^\/\w\:/.test(eg)
          ? (ed += "/") +
              ep.resolve(ec.slice(ed.length), el).replace(/\\/g, "/")
          : ed + ep.resolve(ec.slice(ed.length), el);
      }
      function retrieveSourceMapURL(eA) {
        if (isInBrowser())
          try {
            var el,
              ec,
              eu,
              ed = new XMLHttpRequest();
            (ed.open("GET", eA, !1),
              ed.send(null),
              (el = 4 === ed.readyState ? ed.responseText : null));
            var ep =
              ed.getResponseHeader("SourceMap") ||
              ed.getResponseHeader("X-SourceMap");
            if (ep) return ep;
          } catch (eA) {}
        el = eI(eA);
        for (
          var eg =
            /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)|(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
          (eu = eg.exec(el));
        )
          ec = eu;
        return ec ? ec[1] : null;
      }
      eB.push(function (eA) {
        if (
          ((eA = eA.trim()),
          /^file:/.test(eA) &&
            (eA = eA.replace(/file:\/\/\/(\w:)?/, function (eA, el) {
              return el ? "" : "/";
            })),
          eA in eC)
        )
          return eC[eA];
        var el = "";
        try {
          if (eu) eu.existsSync(eA) && (el = eu.readFileSync(eA, "utf8"));
          else {
            var ec = new XMLHttpRequest();
            (ec.open("GET", eA, !1),
              ec.send(null),
              4 === ec.readyState &&
                200 === ec.status &&
                (el = ec.responseText));
          }
        } catch (eA) {}
        return (eC[eA] = el);
      });
      var ev = handlerExec(e_);
      function mapSourcePosition(eA) {
        var el = ey[eA.source];
        if (!el) {
          var ec = ev(eA.source);
          ec
            ? (el = ey[eA.source] = { url: ec.url, map: new ed(ec.map) }).map
                .sourcesContent &&
              el.map.sources.forEach(function (eA, ec) {
                var eu = el.map.sourcesContent[ec];
                eu && (eC[supportRelativeURL(el.url, eA)] = eu);
              })
            : (el = ey[eA.source] = { url: null, map: null });
        }
        if (el && el.map && "function" == typeof el.map.originalPositionFor) {
          var eu = el.map.originalPositionFor(eA);
          if (null !== eu.source)
            return ((eu.source = supportRelativeURL(el.url, eu.source)), eu);
        }
        return eA;
      }
      function mapEvalOrigin(eA) {
        var el = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(eA);
        if (el) {
          var ec = mapSourcePosition({
            source: el[2],
            line: +el[3],
            column: el[4] - 1,
          });
          return (
            "eval at " +
            el[1] +
            " (" +
            ec.source +
            ":" +
            ec.line +
            ":" +
            (ec.column + 1) +
            ")"
          );
        }
        return (el = /^eval at ([^(]+) \((.+)\)$/.exec(eA))
          ? "eval at " + el[1] + " (" + mapEvalOrigin(el[2]) + ")"
          : eA;
      }
      function CallSiteToString() {
        var eA,
          el = "";
        if (this.isNative()) el = "native";
        else {
          (!(eA = this.getScriptNameOrSourceURL()) &&
            this.isEval() &&
            (el = this.getEvalOrigin() + ", "),
            eA ? (el += eA) : (el += "<anonymous>"));
          var ec = this.getLineNumber();
          if (null != ec) {
            el += ":" + ec;
            var eu = this.getColumnNumber();
            eu && (el += ":" + eu);
          }
        }
        var ed = "",
          ep = this.getFunctionName(),
          eg = !0,
          eh = this.isConstructor();
        if (this.isToplevel() || eh)
          eh
            ? (ed += "new " + (ep || "<anonymous>"))
            : ep
              ? (ed += ep)
              : ((ed += el), (eg = !1));
        else {
          var ef = this.getTypeName();
          "[object Object]" === ef && (ef = "null");
          var em = this.getMethodName();
          ep
            ? (ef && 0 != ep.indexOf(ef) && (ed += ef + "."),
              (ed += ep),
              em &&
                ep.indexOf("." + em) != ep.length - em.length - 1 &&
                (ed += " [as " + em + "]"))
            : (ed += ef + "." + (em || "<anonymous>"));
        }
        return (eg && (ed += " (" + el + ")"), ed);
      }
      function cloneCallSite(eA) {
        var el = {};
        return (
          Object.getOwnPropertyNames(Object.getPrototypeOf(eA)).forEach(
            function (ec) {
              el[ec] = /^(?:is|get)/.test(ec)
                ? function () {
                    return eA[ec].call(eA);
                  }
                : eA[ec];
            },
          ),
          (el.toString = CallSiteToString),
          el
        );
      }
      function wrapCallSite(eA, el) {
        if (
          (void 0 === el && (el = { nextPosition: null, curPosition: null }),
          eA.isNative())
        )
          return ((el.curPosition = null), eA);
        var ec = eA.getFileName() || eA.getScriptNameOrSourceURL();
        if (ec) {
          var eu = eA.getLineNumber(),
            ed = eA.getColumnNumber() - 1,
            ep =
              62 *
              !/^v(10\.1[6-9]|10\.[2-9][0-9]|10\.[0-9]{3,}|1[2-9]\d*|[2-9]\d|\d{3,}|11\.11)/.test(
                globalProcessVersion(),
              );
          1 !== eu || !(ed > ep) || isInBrowser() || eA.isEval() || (ed -= ep);
          var eg = mapSourcePosition({ source: ec, line: eu, column: ed });
          el.curPosition = eg;
          var eh = (eA = cloneCallSite(eA)).getFunctionName;
          return (
            (eA.getFunctionName = function () {
              return null == el.nextPosition
                ? eh()
                : el.nextPosition.name || eh();
            }),
            (eA.getFileName = function () {
              return eg.source;
            }),
            (eA.getLineNumber = function () {
              return eg.line;
            }),
            (eA.getColumnNumber = function () {
              return eg.column + 1;
            }),
            (eA.getScriptNameOrSourceURL = function () {
              return eg.source;
            }),
            eA
          );
        }
        var ef = eA.isEval() && eA.getEvalOrigin();
        return (
          ef &&
            ((ef = mapEvalOrigin(ef)),
            ((eA = cloneCallSite(eA)).getEvalOrigin = function () {
              return ef;
            })),
          eA
        );
      }
      function prepareStackTrace(eA, el) {
        em && ((eC = {}), (ey = {}));
        for (
          var ec = (eA.name || "Error") + ": " + (eA.message || ""),
            eu = { nextPosition: null, curPosition: null },
            ed = [],
            ep = el.length - 1;
          ep >= 0;
          ep--
        )
          (ed.push("\n    at " + wrapCallSite(el[ep], eu)),
            (eu.nextPosition = eu.curPosition));
        return (
          (eu.curPosition = eu.nextPosition = null),
          ec + ed.reverse().join("")
        );
      }
      function getErrorSource(eA) {
        var el = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(eA.stack);
        if (el) {
          var ec = el[1],
            ed = +el[2],
            ep = +el[3],
            eg = eC[ec];
          if (!eg && eu && eu.existsSync(ec))
            try {
              eg = eu.readFileSync(ec, "utf8");
            } catch (eA) {
              eg = "";
            }
          if (eg) {
            var eh = eg.split(/(?:\r\n|\r|\n)/)[ed - 1];
            if (eh)
              return (
                ec + ":" + ed + "\n" + eh + "\n" + Array(ep).join(" ") + "^"
              );
          }
        }
        return null;
      }
      function printErrorAndExit(eA) {
        var el = getErrorSource(eA),
          ec = globalProcessStderr();
        (ec &&
          ec._handle &&
          ec._handle.setBlocking &&
          ec._handle.setBlocking(!0),
          el && (console.error(), console.error(el)),
          console.error(eA.stack),
          globalProcessExit(1));
      }
      function shimEmitUncaughtException() {
        var eA = process.emit;
        process.emit = function (el) {
          if ("uncaughtException" === el) {
            var ec = arguments[1] && arguments[1].stack,
              eu = this.listeners(el).length > 0;
            if (ec && !eu) return printErrorAndExit(arguments[1]);
          }
          return eA.apply(this, arguments);
        };
      }
      e_.push(function (eA) {
        var el,
          ec = retrieveSourceMapURL(eA);
        return ec &&
          (ew.test(ec)
            ? ((el = eg(ec.slice(ec.indexOf(",") + 1), "base64").toString()),
              (ec = eA))
            : ((ec = supportRelativeURL(eA, ec)), (el = eI(ec))),
          el)
          ? { url: ec, map: el }
          : null;
      });
      var eS = eB.slice(0),
        eQ = e_.slice(0);
      ((el.wrapCallSite = wrapCallSite),
        (el.getErrorSource = getErrorSource),
        (el.mapSourcePosition = mapSourcePosition),
        (el.retrieveSourceMap = ev),
        (el.install = function (el) {
          if (
            (el = el || {}).environment &&
            -1 === ["node", "browser", "auto"].indexOf((eE = el.environment))
          )
            throw Error(
              "environment " +
                eE +
                " was unknown. Available options are {auto, browser, node}",
            );
          if (
            (el.retrieveFile &&
              (el.overrideRetrieveFile && (eB.length = 0),
              eB.unshift(el.retrieveFile)),
            el.retrieveSourceMap &&
              (el.overrideRetrieveSourceMap && (e_.length = 0),
              e_.unshift(el.retrieveSourceMap)),
            el.hookRequire && !isInBrowser())
          ) {
            var ec = dynamicRequire(eA, "module"),
              eu = ec.prototype._compile;
            eu.__sourceMapSupport ||
              ((ec.prototype._compile = function (eA, el) {
                return (
                  (eC[el] = eA),
                  (ey[el] = void 0),
                  eu.call(this, eA, el)
                );
              }),
              (ec.prototype._compile.__sourceMapSupport = !0));
          }
          if (
            (em ||
              (em =
                "emptyCacheBetweenOperations" in el &&
                el.emptyCacheBetweenOperations),
            eh || ((eh = !0), (Error.prepareStackTrace = prepareStackTrace)),
            !ef)
          ) {
            var ed =
              !("handleUncaughtExceptions" in el) ||
              el.handleUncaughtExceptions;
            try {
              var ep = dynamicRequire(eA, "worker_threads");
              !1 === ep.isMainThread && (ed = !1);
            } catch (eA) {}
            ed &&
              hasGlobalProcessEventEmitter() &&
              ((ef = !0), shimEmitUncaughtException());
          }
        }),
        (el.resetRetrieveHandlers = function () {
          ((eB.length = 0),
            (e_.length = 0),
            (eB = eS.slice(0)),
            (ev = handlerExec((e_ = eQ.slice(0)))),
            (eI = handlerExec(eB)));
        }));
    },
    74064(eA, el, ec) {
      ((el.SourceMapGenerator = ec(17280).SourceMapGenerator),
        (el.SourceMapConsumer = ec(93569).SourceMapConsumer),
        (el.SourceNode = ec(27748).SourceNode));
    },
    16928(eA) {
      "use strict";
      eA.exports = require("path");
    },
    79896(eA) {
      "use strict";
      eA.exports = require("fs");
    },
    46031(eA) {
      var el = Object.prototype.toString,
        ec =
          "u" > typeof Buffer &&
          "function" == typeof Buffer.alloc &&
          "function" == typeof Buffer.allocUnsafe &&
          "function" == typeof Buffer.from;
      function isArrayBuffer(eA) {
        return "ArrayBuffer" === el.call(eA).slice(8, -1);
      }
      function fromArrayBuffer(eA, el, eu) {
        el >>>= 0;
        var ed = eA.byteLength - el;
        if (ed < 0) throw RangeError("'offset' is out of bounds");
        if (void 0 === eu) eu = ed;
        else if ((eu >>>= 0) > ed)
          throw RangeError("'length' is out of bounds");
        return ec
          ? Buffer.from(eA.slice(el, el + eu))
          : new Buffer(new Uint8Array(eA.slice(el, el + eu)));
      }
      function fromString(eA, el) {
        if (
          (("string" != typeof el || "" === el) && (el = "utf8"),
          !Buffer.isEncoding(el))
        )
          throw TypeError('"encoding" must be a valid string encoding');
        return ec ? Buffer.from(eA, el) : new Buffer(eA, el);
      }
      eA.exports = function (eA, el, eu) {
        if ("number" == typeof eA)
          throw TypeError('"value" argument must not be a number');
        return isArrayBuffer(eA)
          ? fromArrayBuffer(eA, el, eu)
          : "string" == typeof eA
            ? fromString(eA, el)
            : ec
              ? Buffer.from(eA)
              : new Buffer(eA);
      };
    },
    17280(eA, el, ec) {
      var eu = ec(64637),
        ed = ec(63578),
        ep = ec(94100).ArraySet,
        eg = ec(53551).MappingList;
      function SourceMapGenerator(eA) {
        (eA || (eA = {}),
          (this._file = ed.getArg(eA, "file", null)),
          (this._sourceRoot = ed.getArg(eA, "sourceRoot", null)),
          (this._skipValidation = ed.getArg(eA, "skipValidation", !1)),
          (this._sources = new ep()),
          (this._names = new ep()),
          (this._mappings = new eg()),
          (this._sourcesContents = null));
      }
      ((SourceMapGenerator.prototype._version = 3),
        (SourceMapGenerator.fromSourceMap = function (eA) {
          var el = eA.sourceRoot,
            ec = new SourceMapGenerator({ file: eA.file, sourceRoot: el });
          return (
            eA.eachMapping(function (eA) {
              var eu = {
                generated: {
                  line: eA.generatedLine,
                  column: eA.generatedColumn,
                },
              };
              (null != eA.source &&
                ((eu.source = eA.source),
                null != el && (eu.source = ed.relative(el, eu.source)),
                (eu.original = {
                  line: eA.originalLine,
                  column: eA.originalColumn,
                }),
                null != eA.name && (eu.name = eA.name)),
                ec.addMapping(eu));
            }),
            eA.sources.forEach(function (eu) {
              var ep = eu;
              (null !== el && (ep = ed.relative(el, eu)),
                ec._sources.has(ep) || ec._sources.add(ep));
              var eg = eA.sourceContentFor(eu);
              null != eg && ec.setSourceContent(eu, eg);
            }),
            ec
          );
        }),
        (SourceMapGenerator.prototype.addMapping = function (eA) {
          var el = ed.getArg(eA, "generated"),
            ec = ed.getArg(eA, "original", null),
            eu = ed.getArg(eA, "source", null),
            ep = ed.getArg(eA, "name", null);
          (this._skipValidation || this._validateMapping(el, ec, eu, ep),
            null != eu &&
              ((eu = String(eu)),
              this._sources.has(eu) || this._sources.add(eu)),
            null != ep &&
              ((ep = String(ep)), this._names.has(ep) || this._names.add(ep)),
            this._mappings.add({
              generatedLine: el.line,
              generatedColumn: el.column,
              originalLine: null != ec && ec.line,
              originalColumn: null != ec && ec.column,
              source: eu,
              name: ep,
            }));
        }),
        (SourceMapGenerator.prototype.setSourceContent = function (eA, el) {
          var ec = eA;
          (null != this._sourceRoot && (ec = ed.relative(this._sourceRoot, ec)),
            null != el
              ? (this._sourcesContents ||
                  (this._sourcesContents = Object.create(null)),
                (this._sourcesContents[ed.toSetString(ec)] = el))
              : this._sourcesContents &&
                (delete this._sourcesContents[ed.toSetString(ec)],
                0 === Object.keys(this._sourcesContents).length &&
                  (this._sourcesContents = null)));
        }),
        (SourceMapGenerator.prototype.applySourceMap = function (eA, el, ec) {
          var eu = el;
          if (null == el) {
            if (null == eA.file)
              throw Error(
                'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map\'s "file" property. Both were omitted.',
              );
            eu = eA.file;
          }
          var eg = this._sourceRoot;
          null != eg && (eu = ed.relative(eg, eu));
          var eh = new ep(),
            ef = new ep();
          (this._mappings.unsortedForEach(function (el) {
            if (el.source === eu && null != el.originalLine) {
              var ep = eA.originalPositionFor({
                line: el.originalLine,
                column: el.originalColumn,
              });
              null != ep.source &&
                ((el.source = ep.source),
                null != ec && (el.source = ed.join(ec, el.source)),
                null != eg && (el.source = ed.relative(eg, el.source)),
                (el.originalLine = ep.line),
                (el.originalColumn = ep.column),
                null != ep.name && (el.name = ep.name));
            }
            var em = el.source;
            null == em || eh.has(em) || eh.add(em);
            var eE = el.name;
            null == eE || ef.has(eE) || ef.add(eE);
          }, this),
            (this._sources = eh),
            (this._names = ef),
            eA.sources.forEach(function (el) {
              var eu = eA.sourceContentFor(el);
              null != eu &&
                (null != ec && (el = ed.join(ec, el)),
                null != eg && (el = ed.relative(eg, el)),
                this.setSourceContent(el, eu));
            }, this));
        }),
        (SourceMapGenerator.prototype._validateMapping = function (
          eA,
          el,
          ec,
          eu,
        ) {
          if (el && "number" != typeof el.line && "number" != typeof el.column)
            throw Error(
              "original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.",
            );
          if (
            !eA ||
            !("line" in eA) ||
            !("column" in eA) ||
            !(eA.line > 0) ||
            !(eA.column >= 0) ||
            el ||
            ec ||
            eu
          ) {
            if (
              !eA ||
              !("line" in eA) ||
              !("column" in eA) ||
              !el ||
              !("line" in el) ||
              !("column" in el) ||
              !(eA.line > 0) ||
              !(eA.column >= 0) ||
              !(el.line > 0) ||
              !(el.column >= 0) ||
              !ec
            )
              throw Error(
                "Invalid mapping: " +
                  JSON.stringify({
                    generated: eA,
                    source: ec,
                    original: el,
                    name: eu,
                  }),
              );
          }
        }),
        (SourceMapGenerator.prototype._serializeMappings = function () {
          for (
            var eA,
              el,
              ec,
              ep,
              eg = 0,
              eh = 1,
              ef = 0,
              em = 0,
              eE = 0,
              eC = 0,
              ey = "",
              ew = this._mappings.toArray(),
              eB = 0,
              e_ = ew.length;
            eB < e_;
            eB++
          ) {
            if (((el = ew[eB]), (eA = ""), el.generatedLine !== eh))
              for (eg = 0; el.generatedLine !== eh;) ((eA += ";"), eh++);
            else if (eB > 0) {
              if (!ed.compareByGeneratedPositionsInflated(el, ew[eB - 1]))
                continue;
              eA += ",";
            }
            ((eA += eu.encode(el.generatedColumn - eg)),
              (eg = el.generatedColumn),
              null != el.source &&
                ((ep = this._sources.indexOf(el.source)),
                (eA += eu.encode(ep - eC)),
                (eC = ep),
                (eA += eu.encode(el.originalLine - 1 - em)),
                (em = el.originalLine - 1),
                (eA += eu.encode(el.originalColumn - ef)),
                (ef = el.originalColumn),
                null != el.name &&
                  ((ec = this._names.indexOf(el.name)),
                  (eA += eu.encode(ec - eE)),
                  (eE = ec))),
              (ey += eA));
          }
          return ey;
        }),
        (SourceMapGenerator.prototype._generateSourcesContent = function (
          eA,
          el,
        ) {
          return eA.map(function (eA) {
            if (!this._sourcesContents) return null;
            null != el && (eA = ed.relative(el, eA));
            var ec = ed.toSetString(eA);
            return Object.prototype.hasOwnProperty.call(
              this._sourcesContents,
              ec,
            )
              ? this._sourcesContents[ec]
              : null;
          }, this);
        }),
        (SourceMapGenerator.prototype.toJSON = function () {
          var eA = {
            version: this._version,
            sources: this._sources.toArray(),
            names: this._names.toArray(),
            mappings: this._serializeMappings(),
          };
          return (
            null != this._file && (eA.file = this._file),
            null != this._sourceRoot && (eA.sourceRoot = this._sourceRoot),
            this._sourcesContents &&
              (eA.sourcesContent = this._generateSourcesContent(
                eA.sources,
                eA.sourceRoot,
              )),
            eA
          );
        }),
        (SourceMapGenerator.prototype.toString = function () {
          return JSON.stringify(this.toJSON());
        }),
        (el.SourceMapGenerator = SourceMapGenerator));
    },
    93569(eA, el, ec) {
      var eu = ec(63578),
        ed = ec(12192),
        ep = ec(94100).ArraySet,
        eg = ec(64637),
        eh = ec(58448).quickSort;
      function SourceMapConsumer(eA, el) {
        var ec = eA;
        return (
          "string" == typeof eA && (ec = eu.parseSourceMapInput(eA)),
          null != ec.sections
            ? new IndexedSourceMapConsumer(ec, el)
            : new BasicSourceMapConsumer(ec, el)
        );
      }
      function BasicSourceMapConsumer(eA, el) {
        var ec = eA;
        "string" == typeof eA && (ec = eu.parseSourceMapInput(eA));
        var ed = eu.getArg(ec, "version"),
          eg = eu.getArg(ec, "sources"),
          eh = eu.getArg(ec, "names", []),
          ef = eu.getArg(ec, "sourceRoot", null),
          em = eu.getArg(ec, "sourcesContent", null),
          eE = eu.getArg(ec, "mappings"),
          eC = eu.getArg(ec, "file", null);
        if (ed != this._version) throw Error("Unsupported version: " + ed);
        (ef && (ef = eu.normalize(ef)),
          (eg = eg
            .map(String)
            .map(eu.normalize)
            .map(function (eA) {
              return ef && eu.isAbsolute(ef) && eu.isAbsolute(eA)
                ? eu.relative(ef, eA)
                : eA;
            })),
          (this._names = ep.fromArray(eh.map(String), !0)),
          (this._sources = ep.fromArray(eg, !0)),
          (this._absoluteSources = this._sources.toArray().map(function (eA) {
            return eu.computeSourceURL(ef, eA, el);
          })),
          (this.sourceRoot = ef),
          (this.sourcesContent = em),
          (this._mappings = eE),
          (this._sourceMapURL = el),
          (this.file = eC));
      }
      function Mapping() {
        ((this.generatedLine = 0),
          (this.generatedColumn = 0),
          (this.source = null),
          (this.originalLine = null),
          (this.originalColumn = null),
          (this.name = null));
      }
      function IndexedSourceMapConsumer(eA, el) {
        var ec = eA;
        "string" == typeof eA && (ec = eu.parseSourceMapInput(eA));
        var ed = eu.getArg(ec, "version"),
          eg = eu.getArg(ec, "sections");
        if (ed != this._version) throw Error("Unsupported version: " + ed);
        ((this._sources = new ep()), (this._names = new ep()));
        var eh = { line: -1, column: 0 };
        this._sections = eg.map(function (eA) {
          if (eA.url)
            throw Error("Support for url field in sections not implemented.");
          var ec = eu.getArg(eA, "offset"),
            ed = eu.getArg(ec, "line"),
            ep = eu.getArg(ec, "column");
          if (ed < eh.line || (ed === eh.line && ep < eh.column))
            throw Error("Section offsets must be ordered and non-overlapping.");
          return (
            (eh = ec),
            {
              generatedOffset: {
                generatedLine: ed + 1,
                generatedColumn: ep + 1,
              },
              consumer: new SourceMapConsumer(eu.getArg(eA, "map"), el),
            }
          );
        });
      }
      ((SourceMapConsumer.fromSourceMap = function (eA, el) {
        return BasicSourceMapConsumer.fromSourceMap(eA, el);
      }),
        (SourceMapConsumer.prototype._version = 3),
        (SourceMapConsumer.prototype.__generatedMappings = null),
        Object.defineProperty(
          SourceMapConsumer.prototype,
          "_generatedMappings",
          {
            configurable: !0,
            enumerable: !0,
            get: function () {
              return (
                this.__generatedMappings ||
                  this._parseMappings(this._mappings, this.sourceRoot),
                this.__generatedMappings
              );
            },
          },
        ),
        (SourceMapConsumer.prototype.__originalMappings = null),
        Object.defineProperty(
          SourceMapConsumer.prototype,
          "_originalMappings",
          {
            configurable: !0,
            enumerable: !0,
            get: function () {
              return (
                this.__originalMappings ||
                  this._parseMappings(this._mappings, this.sourceRoot),
                this.__originalMappings
              );
            },
          },
        ),
        (SourceMapConsumer.prototype._charIsMappingSeparator = function (
          eA,
          el,
        ) {
          var ec = eA.charAt(el);
          return ";" === ec || "," === ec;
        }),
        (SourceMapConsumer.prototype._parseMappings = function (eA, el) {
          throw Error("Subclasses must implement _parseMappings");
        }),
        (SourceMapConsumer.GENERATED_ORDER = 1),
        (SourceMapConsumer.ORIGINAL_ORDER = 2),
        (SourceMapConsumer.GREATEST_LOWER_BOUND = 1),
        (SourceMapConsumer.LEAST_UPPER_BOUND = 2),
        (SourceMapConsumer.prototype.eachMapping = function (eA, el, ec) {
          var ed,
            ep = el || null;
          switch (ec || SourceMapConsumer.GENERATED_ORDER) {
            case SourceMapConsumer.GENERATED_ORDER:
              ed = this._generatedMappings;
              break;
            case SourceMapConsumer.ORIGINAL_ORDER:
              ed = this._originalMappings;
              break;
            default:
              throw Error("Unknown order of iteration.");
          }
          var eg = this.sourceRoot;
          ed.map(function (eA) {
            var el = null === eA.source ? null : this._sources.at(eA.source);
            return {
              source: (el = eu.computeSourceURL(eg, el, this._sourceMapURL)),
              generatedLine: eA.generatedLine,
              generatedColumn: eA.generatedColumn,
              originalLine: eA.originalLine,
              originalColumn: eA.originalColumn,
              name: null === eA.name ? null : this._names.at(eA.name),
            };
          }, this).forEach(eA, ep);
        }),
        (SourceMapConsumer.prototype.allGeneratedPositionsFor = function (eA) {
          var el = eu.getArg(eA, "line"),
            ec = {
              source: eu.getArg(eA, "source"),
              originalLine: el,
              originalColumn: eu.getArg(eA, "column", 0),
            };
          if (((ec.source = this._findSourceIndex(ec.source)), ec.source < 0))
            return [];
          var ep = [],
            eg = this._findMapping(
              ec,
              this._originalMappings,
              "originalLine",
              "originalColumn",
              eu.compareByOriginalPositions,
              ed.LEAST_UPPER_BOUND,
            );
          if (eg >= 0) {
            var eh = this._originalMappings[eg];
            if (void 0 === eA.column)
              for (var ef = eh.originalLine; eh && eh.originalLine === ef;)
                (ep.push({
                  line: eu.getArg(eh, "generatedLine", null),
                  column: eu.getArg(eh, "generatedColumn", null),
                  lastColumn: eu.getArg(eh, "lastGeneratedColumn", null),
                }),
                  (eh = this._originalMappings[++eg]));
            else
              for (
                var em = eh.originalColumn;
                eh && eh.originalLine === el && eh.originalColumn == em;
              )
                (ep.push({
                  line: eu.getArg(eh, "generatedLine", null),
                  column: eu.getArg(eh, "generatedColumn", null),
                  lastColumn: eu.getArg(eh, "lastGeneratedColumn", null),
                }),
                  (eh = this._originalMappings[++eg]));
          }
          return ep;
        }),
        (el.SourceMapConsumer = SourceMapConsumer),
        (BasicSourceMapConsumer.prototype = Object.create(
          SourceMapConsumer.prototype,
        )),
        (BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer),
        (BasicSourceMapConsumer.prototype._findSourceIndex = function (eA) {
          var el,
            ec = eA;
          if (
            (null != this.sourceRoot && (ec = eu.relative(this.sourceRoot, ec)),
            this._sources.has(ec))
          )
            return this._sources.indexOf(ec);
          for (el = 0; el < this._absoluteSources.length; ++el)
            if (this._absoluteSources[el] == eA) return el;
          return -1;
        }),
        (BasicSourceMapConsumer.fromSourceMap = function (eA, el) {
          var ec = Object.create(BasicSourceMapConsumer.prototype),
            ed = (ec._names = ep.fromArray(eA._names.toArray(), !0)),
            eg = (ec._sources = ep.fromArray(eA._sources.toArray(), !0));
          ((ec.sourceRoot = eA._sourceRoot),
            (ec.sourcesContent = eA._generateSourcesContent(
              ec._sources.toArray(),
              ec.sourceRoot,
            )),
            (ec.file = eA._file),
            (ec._sourceMapURL = el),
            (ec._absoluteSources = ec._sources.toArray().map(function (eA) {
              return eu.computeSourceURL(ec.sourceRoot, eA, el);
            })));
          for (
            var ef = eA._mappings.toArray().slice(),
              em = (ec.__generatedMappings = []),
              eE = (ec.__originalMappings = []),
              eC = 0,
              ey = ef.length;
            eC < ey;
            eC++
          ) {
            var ew = ef[eC],
              eB = new Mapping();
            ((eB.generatedLine = ew.generatedLine),
              (eB.generatedColumn = ew.generatedColumn),
              ew.source &&
                ((eB.source = eg.indexOf(ew.source)),
                (eB.originalLine = ew.originalLine),
                (eB.originalColumn = ew.originalColumn),
                ew.name && (eB.name = ed.indexOf(ew.name)),
                eE.push(eB)),
              em.push(eB));
          }
          return (eh(ec.__originalMappings, eu.compareByOriginalPositions), ec);
        }),
        (BasicSourceMapConsumer.prototype._version = 3),
        Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", {
          get: function () {
            return this._absoluteSources.slice();
          },
        }),
        (BasicSourceMapConsumer.prototype._parseMappings = function (eA, el) {
          for (
            var ec,
              ed,
              ep,
              ef,
              em,
              eE = 1,
              eC = 0,
              ey = 0,
              ew = 0,
              eB = 0,
              e_ = 0,
              eI = eA.length,
              ev = 0,
              eS = {},
              eQ = {},
              eD = [],
              eT = [];
            ev < eI;
          )
            if (";" === eA.charAt(ev)) (eE++, ev++, (eC = 0));
            else if ("," === eA.charAt(ev)) ev++;
            else {
              for (
                (ec = new Mapping()).generatedLine = eE, ef = ev;
                ef < eI && !this._charIsMappingSeparator(eA, ef);
                ef++
              );
              if ((ep = eS[(ed = eA.slice(ev, ef))])) ev += ed.length;
              else {
                for (ep = []; ev < ef;)
                  (eg.decode(eA, ev, eQ),
                    (em = eQ.value),
                    (ev = eQ.rest),
                    ep.push(em));
                if (2 === ep.length)
                  throw Error("Found a source, but no line and column");
                if (3 === ep.length)
                  throw Error("Found a source and line, but no column");
                eS[ed] = ep;
              }
              ((ec.generatedColumn = eC + ep[0]),
                (eC = ec.generatedColumn),
                ep.length > 1 &&
                  ((ec.source = eB + ep[1]),
                  (eB += ep[1]),
                  (ec.originalLine = ey + ep[2]),
                  (ey = ec.originalLine),
                  (ec.originalLine += 1),
                  (ec.originalColumn = ew + ep[3]),
                  (ew = ec.originalColumn),
                  ep.length > 4 && ((ec.name = e_ + ep[4]), (e_ += ep[4]))),
                eT.push(ec),
                "number" == typeof ec.originalLine && eD.push(ec));
            }
          (eh(eT, eu.compareByGeneratedPositionsDeflated),
            (this.__generatedMappings = eT),
            eh(eD, eu.compareByOriginalPositions),
            (this.__originalMappings = eD));
        }),
        (BasicSourceMapConsumer.prototype._findMapping = function (
          eA,
          el,
          ec,
          eu,
          ep,
          eg,
        ) {
          if (eA[ec] <= 0)
            throw TypeError(
              "Line must be greater than or equal to 1, got " + eA[ec],
            );
          if (eA[eu] < 0)
            throw TypeError(
              "Column must be greater than or equal to 0, got " + eA[eu],
            );
          return ed.search(eA, el, ep, eg);
        }),
        (BasicSourceMapConsumer.prototype.computeColumnSpans = function () {
          for (var eA = 0; eA < this._generatedMappings.length; ++eA) {
            var el = this._generatedMappings[eA];
            if (eA + 1 < this._generatedMappings.length) {
              var ec = this._generatedMappings[eA + 1];
              if (el.generatedLine === ec.generatedLine) {
                el.lastGeneratedColumn = ec.generatedColumn - 1;
                continue;
              }
            }
            el.lastGeneratedColumn = 1 / 0;
          }
        }),
        (BasicSourceMapConsumer.prototype.originalPositionFor = function (eA) {
          var el = {
              generatedLine: eu.getArg(eA, "line"),
              generatedColumn: eu.getArg(eA, "column"),
            },
            ec = this._findMapping(
              el,
              this._generatedMappings,
              "generatedLine",
              "generatedColumn",
              eu.compareByGeneratedPositionsDeflated,
              eu.getArg(eA, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND),
            );
          if (ec >= 0) {
            var ed = this._generatedMappings[ec];
            if (ed.generatedLine === el.generatedLine) {
              var ep = eu.getArg(ed, "source", null);
              null !== ep &&
                ((ep = this._sources.at(ep)),
                (ep = eu.computeSourceURL(
                  this.sourceRoot,
                  ep,
                  this._sourceMapURL,
                )));
              var eg = eu.getArg(ed, "name", null);
              return (
                null !== eg && (eg = this._names.at(eg)),
                {
                  source: ep,
                  line: eu.getArg(ed, "originalLine", null),
                  column: eu.getArg(ed, "originalColumn", null),
                  name: eg,
                }
              );
            }
          }
          return { source: null, line: null, column: null, name: null };
        }),
        (BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
          function () {
            return (
              !!this.sourcesContent &&
              this.sourcesContent.length >= this._sources.size() &&
              !this.sourcesContent.some(function (eA) {
                return null == eA;
              })
            );
          }),
        (BasicSourceMapConsumer.prototype.sourceContentFor = function (eA, el) {
          if (!this.sourcesContent) return null;
          var ec,
            ed = this._findSourceIndex(eA);
          if (ed >= 0) return this.sourcesContent[ed];
          var ep = eA;
          if (
            (null != this.sourceRoot && (ep = eu.relative(this.sourceRoot, ep)),
            null != this.sourceRoot && (ec = eu.urlParse(this.sourceRoot)))
          ) {
            var eg = ep.replace(/^file:\/\//, "");
            if ("file" == ec.scheme && this._sources.has(eg))
              return this.sourcesContent[this._sources.indexOf(eg)];
            if ((!ec.path || "/" == ec.path) && this._sources.has("/" + ep))
              return this.sourcesContent[this._sources.indexOf("/" + ep)];
          }
          if (el) return null;
          throw Error('"' + ep + '" is not in the SourceMap.');
        }),
        (BasicSourceMapConsumer.prototype.generatedPositionFor = function (eA) {
          var el = eu.getArg(eA, "source");
          if ((el = this._findSourceIndex(el)) < 0)
            return { line: null, column: null, lastColumn: null };
          var ec = {
              source: el,
              originalLine: eu.getArg(eA, "line"),
              originalColumn: eu.getArg(eA, "column"),
            },
            ed = this._findMapping(
              ec,
              this._originalMappings,
              "originalLine",
              "originalColumn",
              eu.compareByOriginalPositions,
              eu.getArg(eA, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND),
            );
          if (ed >= 0) {
            var ep = this._originalMappings[ed];
            if (ep.source === ec.source)
              return {
                line: eu.getArg(ep, "generatedLine", null),
                column: eu.getArg(ep, "generatedColumn", null),
                lastColumn: eu.getArg(ep, "lastGeneratedColumn", null),
              };
          }
          return { line: null, column: null, lastColumn: null };
        }),
        (el.BasicSourceMapConsumer = BasicSourceMapConsumer),
        (IndexedSourceMapConsumer.prototype = Object.create(
          SourceMapConsumer.prototype,
        )),
        (IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer),
        (IndexedSourceMapConsumer.prototype._version = 3),
        Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", {
          get: function () {
            for (var eA = [], el = 0; el < this._sections.length; el++)
              for (
                var ec = 0;
                ec < this._sections[el].consumer.sources.length;
                ec++
              )
                eA.push(this._sections[el].consumer.sources[ec]);
            return eA;
          },
        }),
        (IndexedSourceMapConsumer.prototype.originalPositionFor = function (
          eA,
        ) {
          var el = {
              generatedLine: eu.getArg(eA, "line"),
              generatedColumn: eu.getArg(eA, "column"),
            },
            ec = ed.search(el, this._sections, function (eA, el) {
              var ec = eA.generatedLine - el.generatedOffset.generatedLine;
              return (
                ec || eA.generatedColumn - el.generatedOffset.generatedColumn
              );
            }),
            ep = this._sections[ec];
          return ep
            ? ep.consumer.originalPositionFor({
                line: el.generatedLine - (ep.generatedOffset.generatedLine - 1),
                column:
                  el.generatedColumn -
                  (ep.generatedOffset.generatedLine === el.generatedLine
                    ? ep.generatedOffset.generatedColumn - 1
                    : 0),
                bias: eA.bias,
              })
            : { source: null, line: null, column: null, name: null };
        }),
        (IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
          function () {
            return this._sections.every(function (eA) {
              return eA.consumer.hasContentsOfAllSources();
            });
          }),
        (IndexedSourceMapConsumer.prototype.sourceContentFor = function (
          eA,
          el,
        ) {
          for (var ec = 0; ec < this._sections.length; ec++) {
            var eu = this._sections[ec].consumer.sourceContentFor(eA, !0);
            if (eu) return eu;
          }
          if (el) return null;
          throw Error('"' + eA + '" is not in the SourceMap.');
        }),
        (IndexedSourceMapConsumer.prototype.generatedPositionFor = function (
          eA,
        ) {
          for (var el = 0; el < this._sections.length; el++) {
            var ec = this._sections[el];
            if (-1 !== ec.consumer._findSourceIndex(eu.getArg(eA, "source"))) {
              var ed = ec.consumer.generatedPositionFor(eA);
              if (ed)
                return {
                  line: ed.line + (ec.generatedOffset.generatedLine - 1),
                  column:
                    ed.column +
                    (ec.generatedOffset.generatedLine === ed.line
                      ? ec.generatedOffset.generatedColumn - 1
                      : 0),
                };
            }
          }
          return { line: null, column: null };
        }),
        (IndexedSourceMapConsumer.prototype._parseMappings = function (eA, el) {
          ((this.__generatedMappings = []), (this.__originalMappings = []));
          for (var ec = 0; ec < this._sections.length; ec++)
            for (
              var ed = this._sections[ec],
                ep = ed.consumer._generatedMappings,
                eg = 0;
              eg < ep.length;
              eg++
            ) {
              var ef = ep[eg],
                em = ed.consumer._sources.at(ef.source);
              ((em = eu.computeSourceURL(
                ed.consumer.sourceRoot,
                em,
                this._sourceMapURL,
              )),
                this._sources.add(em),
                (em = this._sources.indexOf(em)));
              var eE = null;
              ef.name &&
                ((eE = ed.consumer._names.at(ef.name)),
                this._names.add(eE),
                (eE = this._names.indexOf(eE)));
              var eC = {
                source: em,
                generatedLine:
                  ef.generatedLine + (ed.generatedOffset.generatedLine - 1),
                generatedColumn:
                  ef.generatedColumn +
                  (ed.generatedOffset.generatedLine === ef.generatedLine
                    ? ed.generatedOffset.generatedColumn - 1
                    : 0),
                originalLine: ef.originalLine,
                originalColumn: ef.originalColumn,
                name: eE,
              };
              (this.__generatedMappings.push(eC),
                "number" == typeof eC.originalLine &&
                  this.__originalMappings.push(eC));
            }
          (eh(this.__generatedMappings, eu.compareByGeneratedPositionsDeflated),
            eh(this.__originalMappings, eu.compareByOriginalPositions));
        }),
        (el.IndexedSourceMapConsumer = IndexedSourceMapConsumer));
    },
    27748(eA, el, ec) {
      var eu = ec(17280).SourceMapGenerator,
        ed = ec(63578),
        ep = /(\r?\n)/,
        eg = 10,
        eh = "$$$isSourceNode$$$";
      function SourceNode(eA, el, ec, eu, ed) {
        ((this.children = []),
          (this.sourceContents = {}),
          (this.line = null == eA ? null : eA),
          (this.column = null == el ? null : el),
          (this.source = null == ec ? null : ec),
          (this.name = null == ed ? null : ed),
          (this[eh] = !0),
          null != eu && this.add(eu));
      }
      ((SourceNode.fromStringWithSourceMap = function (eA, el, ec) {
        var eu = new SourceNode(),
          eg = eA.split(ep),
          eh = 0,
          shiftNextLine = function () {
            return getNextLine() + (getNextLine() || "");
            function getNextLine() {
              return eh < eg.length ? eg[eh++] : void 0;
            }
          },
          ef = 1,
          em = 0,
          eE = null;
        return (
          el.eachMapping(function (eA) {
            if (null !== eE)
              if (ef < eA.generatedLine)
                (addMappingWithCode(eE, shiftNextLine()), ef++, (em = 0));
              else {
                var el = eg[eh] || "",
                  ec = el.substr(0, eA.generatedColumn - em);
                ((eg[eh] = el.substr(eA.generatedColumn - em)),
                  (em = eA.generatedColumn),
                  addMappingWithCode(eE, ec),
                  (eE = eA));
                return;
              }
            for (; ef < eA.generatedLine;) (eu.add(shiftNextLine()), ef++);
            if (em < eA.generatedColumn) {
              var el = eg[eh] || "";
              (eu.add(el.substr(0, eA.generatedColumn)),
                (eg[eh] = el.substr(eA.generatedColumn)),
                (em = eA.generatedColumn));
            }
            eE = eA;
          }, this),
          eh < eg.length &&
            (eE && addMappingWithCode(eE, shiftNextLine()),
            eu.add(eg.splice(eh).join(""))),
          el.sources.forEach(function (eA) {
            var ep = el.sourceContentFor(eA);
            null != ep &&
              (null != ec && (eA = ed.join(ec, eA)),
              eu.setSourceContent(eA, ep));
          }),
          eu
        );
        function addMappingWithCode(eA, el) {
          if (null === eA || void 0 === eA.source) eu.add(el);
          else {
            var ep = ec ? ed.join(ec, eA.source) : eA.source;
            eu.add(
              new SourceNode(
                eA.originalLine,
                eA.originalColumn,
                ep,
                el,
                eA.name,
              ),
            );
          }
        }
      }),
        (SourceNode.prototype.add = function (eA) {
          if (Array.isArray(eA))
            eA.forEach(function (eA) {
              this.add(eA);
            }, this);
          else if (eA[eh] || "string" == typeof eA)
            eA && this.children.push(eA);
          else
            throw TypeError(
              "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " +
                eA,
            );
          return this;
        }),
        (SourceNode.prototype.prepend = function (eA) {
          if (Array.isArray(eA))
            for (var el = eA.length - 1; el >= 0; el--) this.prepend(eA[el]);
          else if (eA[eh] || "string" == typeof eA) this.children.unshift(eA);
          else
            throw TypeError(
              "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " +
                eA,
            );
          return this;
        }),
        (SourceNode.prototype.walk = function (eA) {
          for (var el, ec = 0, eu = this.children.length; ec < eu; ec++)
            (el = this.children[ec])[eh]
              ? el.walk(eA)
              : "" !== el &&
                eA(el, {
                  source: this.source,
                  line: this.line,
                  column: this.column,
                  name: this.name,
                });
        }),
        (SourceNode.prototype.join = function (eA) {
          var el,
            ec,
            eu = this.children.length;
          if (eu > 0) {
            for (ec = 0, el = []; ec < eu - 1; ec++)
              (el.push(this.children[ec]), el.push(eA));
            (el.push(this.children[ec]), (this.children = el));
          }
          return this;
        }),
        (SourceNode.prototype.replaceRight = function (eA, el) {
          var ec = this.children[this.children.length - 1];
          return (
            ec[eh]
              ? ec.replaceRight(eA, el)
              : "string" == typeof ec
                ? (this.children[this.children.length - 1] = ec.replace(eA, el))
                : this.children.push("".replace(eA, el)),
            this
          );
        }),
        (SourceNode.prototype.setSourceContent = function (eA, el) {
          this.sourceContents[ed.toSetString(eA)] = el;
        }),
        (SourceNode.prototype.walkSourceContents = function (eA) {
          for (var el = 0, ec = this.children.length; el < ec; el++)
            this.children[el][eh] && this.children[el].walkSourceContents(eA);
          for (
            var eu = Object.keys(this.sourceContents), el = 0, ec = eu.length;
            el < ec;
            el++
          )
            eA(ed.fromSetString(eu[el]), this.sourceContents[eu[el]]);
        }),
        (SourceNode.prototype.toString = function () {
          var eA = "";
          return (
            this.walk(function (el) {
              eA += el;
            }),
            eA
          );
        }),
        (SourceNode.prototype.toStringWithSourceMap = function (eA) {
          var el = { code: "", line: 1, column: 0 },
            ec = new eu(eA),
            ed = !1,
            ep = null,
            eh = null,
            ef = null,
            em = null;
          return (
            this.walk(function (eA, eu) {
              ((el.code += eA),
                null !== eu.source && null !== eu.line && null !== eu.column
                  ? ((ep !== eu.source ||
                      eh !== eu.line ||
                      ef !== eu.column ||
                      em !== eu.name) &&
                      ec.addMapping({
                        source: eu.source,
                        original: { line: eu.line, column: eu.column },
                        generated: { line: el.line, column: el.column },
                        name: eu.name,
                      }),
                    (ep = eu.source),
                    (eh = eu.line),
                    (ef = eu.column),
                    (em = eu.name),
                    (ed = !0))
                  : ed &&
                    (ec.addMapping({
                      generated: { line: el.line, column: el.column },
                    }),
                    (ep = null),
                    (ed = !1)));
              for (var eE = 0, eC = eA.length; eE < eC; eE++)
                eA.charCodeAt(eE) === eg
                  ? (el.line++,
                    (el.column = 0),
                    eE + 1 === eC
                      ? ((ep = null), (ed = !1))
                      : ed &&
                        ec.addMapping({
                          source: eu.source,
                          original: { line: eu.line, column: eu.column },
                          generated: { line: el.line, column: el.column },
                          name: eu.name,
                        }))
                  : el.column++;
            }),
            this.walkSourceContents(function (eA, el) {
              ec.setSourceContent(eA, el);
            }),
            { code: el.code, map: ec }
          );
        }),
        (el.SourceNode = SourceNode));
    },
    64637(eA, el, ec) {
      var eu = ec(11573),
        ed = 5,
        ep = 31,
        eg = 32;
      function toVLQSigned(eA) {
        return eA < 0 ? (-eA << 1) + 1 : (eA << 1) + 0;
      }
      function fromVLQSigned(eA) {
        var el = (1 & eA) == 1,
          ec = eA >> 1;
        return el ? -ec : ec;
      }
      ((el.encode = function (eA) {
        var el,
          ec = "",
          eh = toVLQSigned(eA);
        do
          ((el = eh & ep),
            (eh >>>= ed) > 0 && (el |= eg),
            (ec += eu.encode(el)));
        while (eh > 0);
        return ec;
      }),
        (el.decode = function (eA, el, ec) {
          var eh,
            ef,
            em = eA.length,
            eE = 0,
            eC = 0;
          do {
            if (el >= em)
              throw Error("Expected more digits in base 64 VLQ value.");
            if (-1 === (ef = eu.decode(eA.charCodeAt(el++))))
              throw Error("Invalid base64 digit: " + eA.charAt(el - 1));
            ((eh = !!(ef & eg)), (ef &= ep), (eE += ef << eC), (eC += ed));
          } while (eh);
          ((ec.value = fromVLQSigned(eE)), (ec.rest = el));
        }));
    },
    63578(eA, el) {
      el.getArg = function (eA, el, ec) {
        if (el in eA) return eA[el];
        if (3 == arguments.length) return ec;
        throw Error('"' + el + '" is a required argument.');
      };
      var ec = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/,
        eu = /^data:.+\,.+$/;
      function urlParse(eA) {
        var el = eA.match(ec);
        return el
          ? {
              scheme: el[1],
              auth: el[2],
              host: el[3],
              port: el[4],
              path: el[5],
            }
          : null;
      }
      function urlGenerate(eA) {
        var el = "";
        return (
          eA.scheme && (el += eA.scheme + ":"),
          (el += "//"),
          eA.auth && (el += eA.auth + "@"),
          eA.host && (el += eA.host),
          eA.port && (el += ":" + eA.port),
          eA.path && (el += eA.path),
          el
        );
      }
      function normalize(eA) {
        var ec = eA,
          eu = urlParse(eA);
        if (eu) {
          if (!eu.path) return eA;
          ec = eu.path;
        }
        for (
          var ed,
            ep = el.isAbsolute(ec),
            eg = ec.split(/\/+/),
            eh = 0,
            ef = eg.length - 1;
          ef >= 0;
          ef--
        )
          "." === (ed = eg[ef])
            ? eg.splice(ef, 1)
            : ".." === ed
              ? eh++
              : eh > 0 &&
                ("" === ed
                  ? (eg.splice(ef + 1, eh), (eh = 0))
                  : (eg.splice(ef, 2), eh--));
        return ("" === (ec = eg.join("/")) && (ec = ep ? "/" : "."), eu)
          ? ((eu.path = ec), urlGenerate(eu))
          : ec;
      }
      function join(eA, el) {
        ("" === eA && (eA = "."), "" === el && (el = "."));
        var ec = urlParse(el),
          ed = urlParse(eA);
        if ((ed && (eA = ed.path || "/"), ec && !ec.scheme))
          return (ed && (ec.scheme = ed.scheme), urlGenerate(ec));
        if (ec || el.match(eu)) return el;
        if (ed && !ed.host && !ed.path)
          return ((ed.host = el), urlGenerate(ed));
        var ep =
          "/" === el.charAt(0)
            ? el
            : normalize(eA.replace(/\/+$/, "") + "/" + el);
        return ed ? ((ed.path = ep), urlGenerate(ed)) : ep;
      }
      ((el.urlParse = urlParse),
        (el.urlGenerate = urlGenerate),
        (el.normalize = normalize),
        (el.join = join),
        (el.isAbsolute = function (eA) {
          return "/" === eA.charAt(0) || ec.test(eA);
        }),
        (el.relative = function (eA, el) {
          ("" === eA && (eA = "."), (eA = eA.replace(/\/$/, "")));
          for (var ec = 0; 0 !== el.indexOf(eA + "/");) {
            var eu = eA.lastIndexOf("/");
            if (eu < 0 || (eA = eA.slice(0, eu)).match(/^([^\/]+:\/)?\/*$/))
              return el;
            ++ec;
          }
          return Array(ec + 1).join("../") + el.substr(eA.length + 1);
        }));
      var ed = (function () {
        return !("__proto__" in Object.create(null));
      })();
      function identity(eA) {
        return eA;
      }
      function toSetString(eA) {
        return isProtoString(eA) ? "$" + eA : eA;
      }
      function fromSetString(eA) {
        return isProtoString(eA) ? eA.slice(1) : eA;
      }
      function isProtoString(eA) {
        if (!eA) return !1;
        var el = eA.length;
        if (
          el < 9 ||
          95 !== eA.charCodeAt(el - 1) ||
          95 !== eA.charCodeAt(el - 2) ||
          111 !== eA.charCodeAt(el - 3) ||
          116 !== eA.charCodeAt(el - 4) ||
          111 !== eA.charCodeAt(el - 5) ||
          114 !== eA.charCodeAt(el - 6) ||
          112 !== eA.charCodeAt(el - 7) ||
          95 !== eA.charCodeAt(el - 8) ||
          95 !== eA.charCodeAt(el - 9)
        )
          return !1;
        for (var ec = el - 10; ec >= 0; ec--)
          if (36 !== eA.charCodeAt(ec)) return !1;
        return !0;
      }
      function strcmp(eA, el) {
        return eA === el
          ? 0
          : null === eA
            ? 1
            : null === el
              ? -1
              : eA > el
                ? 1
                : -1;
      }
      ((el.toSetString = ed ? identity : toSetString),
        (el.fromSetString = ed ? identity : fromSetString),
        (el.compareByOriginalPositions = function (eA, el, ec) {
          var eu = strcmp(eA.source, el.source);
          return 0 !== eu ||
            0 != (eu = eA.originalLine - el.originalLine) ||
            0 != (eu = eA.originalColumn - el.originalColumn) ||
            ec ||
            0 != (eu = eA.generatedColumn - el.generatedColumn) ||
            0 != (eu = eA.generatedLine - el.generatedLine)
            ? eu
            : strcmp(eA.name, el.name);
        }),
        (el.compareByGeneratedPositionsDeflated = function (eA, el, ec) {
          var eu = eA.generatedLine - el.generatedLine;
          return 0 !== eu ||
            0 != (eu = eA.generatedColumn - el.generatedColumn) ||
            ec ||
            0 !== (eu = strcmp(eA.source, el.source)) ||
            0 != (eu = eA.originalLine - el.originalLine) ||
            0 != (eu = eA.originalColumn - el.originalColumn)
            ? eu
            : strcmp(eA.name, el.name);
        }),
        (el.compareByGeneratedPositionsInflated = function (eA, el) {
          var ec = eA.generatedLine - el.generatedLine;
          return 0 !== ec ||
            0 != (ec = eA.generatedColumn - el.generatedColumn) ||
            0 !== (ec = strcmp(eA.source, el.source)) ||
            0 != (ec = eA.originalLine - el.originalLine) ||
            0 != (ec = eA.originalColumn - el.originalColumn)
            ? ec
            : strcmp(eA.name, el.name);
        }),
        (el.parseSourceMapInput = function (eA) {
          return JSON.parse(eA.replace(/^\)]}'[^\n]*\n/, ""));
        }),
        (el.computeSourceURL = function (eA, el, ec) {
          if (
            ((el = el || ""),
            eA &&
              ("/" !== eA[eA.length - 1] && "/" !== el[0] && (eA += "/"),
              (el = eA + el)),
            ec)
          ) {
            var eu = urlParse(ec);
            if (!eu) throw Error("sourceMapURL could not be parsed");
            if (eu.path) {
              var ed = eu.path.lastIndexOf("/");
              ed >= 0 && (eu.path = eu.path.substring(0, ed + 1));
            }
            el = join(urlGenerate(eu), el);
          }
          return normalize(el);
        }));
    },
    94100(eA, el, ec) {
      var eu = ec(63578),
        ed = Object.prototype.hasOwnProperty,
        ep = "u" > typeof Map;
      function ArraySet() {
        ((this._array = []),
          (this._set = ep ? new Map() : Object.create(null)));
      }
      ((ArraySet.fromArray = function (eA, el) {
        for (var ec = new ArraySet(), eu = 0, ed = eA.length; eu < ed; eu++)
          ec.add(eA[eu], el);
        return ec;
      }),
        (ArraySet.prototype.size = function () {
          return ep
            ? this._set.size
            : Object.getOwnPropertyNames(this._set).length;
        }),
        (ArraySet.prototype.add = function (eA, el) {
          var ec = ep ? eA : eu.toSetString(eA),
            eg = ep ? this.has(eA) : ed.call(this._set, ec),
            eh = this._array.length;
          ((!eg || el) && this._array.push(eA),
            eg || (ep ? this._set.set(eA, eh) : (this._set[ec] = eh)));
        }),
        (ArraySet.prototype.has = function (eA) {
          if (ep) return this._set.has(eA);
          var el = eu.toSetString(eA);
          return ed.call(this._set, el);
        }),
        (ArraySet.prototype.indexOf = function (eA) {
          if (ep) {
            var el = this._set.get(eA);
            if (el >= 0) return el;
          } else {
            var ec = eu.toSetString(eA);
            if (ed.call(this._set, ec)) return this._set[ec];
          }
          throw Error('"' + eA + '" is not in the set.');
        }),
        (ArraySet.prototype.at = function (eA) {
          if (eA >= 0 && eA < this._array.length) return this._array[eA];
          throw Error("No element indexed by " + eA);
        }),
        (ArraySet.prototype.toArray = function () {
          return this._array.slice();
        }),
        (el.ArraySet = ArraySet));
    },
    53551(eA, el, ec) {
      var eu = ec(63578);
      function generatedPositionAfter(eA, el) {
        var ec = eA.generatedLine,
          ed = el.generatedLine,
          ep = eA.generatedColumn,
          eg = el.generatedColumn;
        return (
          ed > ec ||
          (ed == ec && eg >= ep) ||
          0 >= eu.compareByGeneratedPositionsInflated(eA, el)
        );
      }
      function MappingList() {
        ((this._array = []),
          (this._sorted = !0),
          (this._last = { generatedLine: -1, generatedColumn: 0 }));
      }
      ((MappingList.prototype.unsortedForEach = function (eA, el) {
        this._array.forEach(eA, el);
      }),
        (MappingList.prototype.add = function (eA) {
          (generatedPositionAfter(this._last, eA)
            ? (this._last = eA)
            : (this._sorted = !1),
            this._array.push(eA));
        }),
        (MappingList.prototype.toArray = function () {
          return (
            this._sorted ||
              (this._array.sort(eu.compareByGeneratedPositionsInflated),
              (this._sorted = !0)),
            this._array
          );
        }),
        (el.MappingList = MappingList));
    },
    12192(eA, el) {
      function recursiveSearch(eA, ec, eu, ed, ep, eg) {
        var eh = Math.floor((ec - eA) / 2) + eA,
          ef = ep(eu, ed[eh], !0);
        return 0 === ef
          ? eh
          : ef > 0
            ? ec - eh > 1
              ? recursiveSearch(eh, ec, eu, ed, ep, eg)
              : eg == el.LEAST_UPPER_BOUND
                ? ec < ed.length
                  ? ec
                  : -1
                : eh
            : eh - eA > 1
              ? recursiveSearch(eA, eh, eu, ed, ep, eg)
              : eg == el.LEAST_UPPER_BOUND
                ? eh
                : eA < 0
                  ? -1
                  : eA;
      }
      ((el.GREATEST_LOWER_BOUND = 1),
        (el.LEAST_UPPER_BOUND = 2),
        (el.search = function (eA, ec, eu, ed) {
          if (0 === ec.length) return -1;
          var ep = recursiveSearch(
            -1,
            ec.length,
            eA,
            ec,
            eu,
            ed || el.GREATEST_LOWER_BOUND,
          );
          if (ep < 0) return -1;
          for (; ep - 1 >= 0 && 0 === eu(ec[ep], ec[ep - 1], !0);) --ep;
          return ep;
        }));
    },
    58448(eA, el) {
      function swap(eA, el, ec) {
        var eu = eA[el];
        ((eA[el] = eA[ec]), (eA[ec] = eu));
      }
      function randomIntInRange(eA, el) {
        return Math.round(eA + Math.random() * (el - eA));
      }
      function doQuickSort(eA, el, ec, eu) {
        if (ec < eu) {
          var ed = randomIntInRange(ec, eu),
            ep = ec - 1;
          swap(eA, ed, eu);
          for (var eg = eA[eu], eh = ec; eh < eu; eh++)
            0 >= el(eA[eh], eg) && swap(eA, (ep += 1), eh);
          swap(eA, ep + 1, eh);
          var ef = ep + 1;
          (doQuickSort(eA, el, ec, ef - 1), doQuickSort(eA, el, ef + 1, eu));
        }
      }
      el.quickSort = function (eA, el) {
        doQuickSort(eA, el, 0, eA.length - 1);
      };
    },
    11573(eA, el) {
      var ec =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(
          "",
        );
      ((el.encode = function (eA) {
        if (0 <= eA && eA < ec.length) return ec[eA];
        throw TypeError("Must be between 0 and 63: " + eA);
      }),
        (el.decode = function (eA) {
          var el = 65,
            ec = 90,
            eu = 97,
            ed = 122,
            ep = 48,
            eg = 57,
            eh = 43,
            ef = 47,
            em = 26,
            eE = 52;
          return 65 <= eA && eA <= ec
            ? eA - el
            : eu <= eA && eA <= ed
              ? eA - eu + em
              : ep <= eA && eA <= eg
                ? eA - ep + eE
                : eA == eh
                  ? 62
                  : eA == ef
                    ? 63
                    : -1;
        }));
    },
  };
  const cache = Object.create(null);
  function ec(id: number) {
    if (cache[id]) return cache[id].exports;
    const module = { exports: {} };
    cache[id] = module;
    factories[id](module, module.exports, ec);
    return module.exports;
  }
  installNativeModuleRuntime({ require: ec, moduleCache: cache });
  return { ...ec(25844), getModule: ec };
}
