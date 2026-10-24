// @ts-nocheck
// Captured HTTPS CONNECT proxy agent and full dependency closure.
export const HTTPS_PROXY_AGENT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const HTTPS_PROXY_AGENT_MODULES = [
  [64007, 4781856, 4785144],
  [69278, 15798679, 15798728],
  [64756, 15801232, 15801281],
  [42613, 15797977, 15798029],
  [3680, 4139837, 4139978],
  [64112, 2017568, 2020407],
  [87016, 15801332, 15801381],
  [36981, 4785145, 4786727],
  [20124, 4134379, 4137049],
  [85038, 4139979, 4142104],
  [58611, 15798523, 15798573],
  [65692, 15798574, 15798625],
  [83053, 2016185, 2017567],
  [27891, 4137050, 4139836],
  [52018, 15801282, 15801331],
  [39023, 15801382, 15801432],
  [35600, 6783478, 6785107],
  [27250, 5726987, 5728484],
  [70857, 15800563, 15800611],
  [56071, 4741075, 4741259],
] as const;
export function createNativeHttpsProxyAgent(runtime: any) {
  if (!runtime.globals) throw Error("Explicit global surface required");
  const globalThis = runtime.globals,
    global = runtime.globals,
    require = runtime.require,
    process = runtime.process ?? globalThis.process,
    console = runtime.console ?? globalThis.console;
  const factories = {
      64007(eA, el, ec) {
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
            (this && this.__importDefault) ||
            function (eA) {
              return eA && eA.__esModule ? eA : { default: eA };
            };
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.HttpsProxyAgent = void 0));
        let eh = ep(ec(69278)),
          ef = ep(ec(64756)),
          em = eg(ec(42613)),
          eE = eg(ec(3680)),
          eC = ec(64112),
          ey = ec(87016),
          ew = ec(36981),
          eB = (0, eE.default)("https-proxy-agent"),
          setServernameFromNonIpHost = (eA) =>
            void 0 === eA.servername && eA.host && !eh.isIP(eA.host)
              ? { ...eA, servername: eA.host }
              : eA;
        let HttpsProxyAgent = class HttpsProxyAgent extends eC.Agent {
          constructor(eA, el) {
            (super(el),
              (this.options = { path: void 0 }),
              (this.proxy = "string" == typeof eA ? new ey.URL(eA) : eA),
              (this.proxyHeaders = el?.headers ?? {}),
              eB("Creating new HttpsProxyAgent instance: %o", this.proxy.href));
            const ec = (this.proxy.hostname || this.proxy.host).replace(
                /^\[|\]$/g,
                "",
              ),
              eu = this.proxy.port
                ? parseInt(this.proxy.port, 10)
                : "https:" === this.proxy.protocol
                  ? 443
                  : 80;
            this.connectOpts = {
              ALPNProtocols: ["http/1.1"],
              ...(el ? omit(el, "headers") : null),
              host: ec,
              port: eu,
            };
          }
          async connect(eA, el) {
            let ec,
              { proxy: eu } = this;
            if (!el.host) throw TypeError('No "host" provided');
            "https:" === eu.protocol
              ? (eB("Creating `tls.Socket`: %o", this.connectOpts),
                (ec = ef.connect(setServernameFromNonIpHost(this.connectOpts))))
              : (eB("Creating `net.Socket`: %o", this.connectOpts),
                (ec = eh.connect(this.connectOpts)));
            let ed =
                "function" == typeof this.proxyHeaders
                  ? this.proxyHeaders()
                  : { ...this.proxyHeaders },
              ep = eh.isIPv6(el.host) ? `[${el.host}]` : el.host,
              eg = `CONNECT ${ep}:${el.port} HTTP/1.1\r
`;
            if (eu.username || eu.password) {
              let eA = `${decodeURIComponent(eu.username)}:${decodeURIComponent(eu.password)}`;
              ed["Proxy-Authorization"] =
                `Basic ${Buffer.from(eA).toString("base64")}`;
            }
            for (let eA of ((ed.Host = `${ep}:${el.port}`),
            ed["Proxy-Connection"] ||
              (ed["Proxy-Connection"] = this.keepAlive
                ? "Keep-Alive"
                : "close"),
            Object.keys(ed)))
              eg += `${eA}: ${ed[eA]}\r
`;
            let eE = (0, ew.parseProxyResponse)(ec);
            ec.write(`${eg}\r
`);
            let { connect: eC, buffered: ey } = await eE;
            if (
              (eA.emit("proxyConnect", eC),
              this.emit("proxyConnect", eC, eA),
              200 === eC.statusCode)
            )
              return (eA.once("socket", resume), el.secureEndpoint)
                ? (eB("Upgrading socket connection to TLS"),
                  ef.connect({
                    ...omit(
                      setServernameFromNonIpHost(el),
                      "host",
                      "path",
                      "port",
                    ),
                    socket: ec,
                  }))
                : ec;
            ec.destroy();
            let e_ = new eh.Socket({ writable: !1 });
            return (
              (e_.readable = !0),
              eA.once("socket", (eA) => {
                (eB("Replaying proxy buffer for failed request"),
                  (0, em.default)(eA.listenerCount("data") > 0),
                  eA.push(ey),
                  eA.push(null));
              }),
              e_
            );
          }
        };
        function resume(eA) {
          eA.resume();
        }
        function omit(eA, ...el) {
          let ec,
            eu = {};
          for (ec in eA) el.includes(ec) || (eu[ec] = eA[ec]);
          return eu;
        }
        ((HttpsProxyAgent.protocols = ["http", "https"]),
          (el.HttpsProxyAgent = HttpsProxyAgent));
      },
      69278(eA) {
        "use strict";
        eA.exports = require("net");
      },
      64756(eA) {
        "use strict";
        eA.exports = require("tls");
      },
      42613(eA) {
        "use strict";
        eA.exports = require("assert");
      },
      3680(eA, el, ec) {
        "u" < typeof process ||
        "renderer" === process.type ||
        !0 === process.browser ||
        process.__nwjs
          ? (eA.exports = ec(20124))
          : (eA.exports = ec(85038));
      },
      64112(eA, el, ec) {
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
          (el.Agent = void 0));
        let eh = ep(ec(69278)),
          ef = ep(ec(58611)),
          em = ec(65692);
        eg(ec(83053), el);
        let eE = Symbol("AgentBaseInternalState");
        let Agent = class Agent extends ef.Agent {
          constructor(eA) {
            (super(eA), (this[eE] = {}));
          }
          isSecureEndpoint(eA) {
            if (eA) {
              if ("boolean" == typeof eA.secureEndpoint)
                return eA.secureEndpoint;
              if ("string" == typeof eA.protocol)
                return "https:" === eA.protocol;
            }
            let { stack: el } = Error();
            return (
              "string" == typeof el &&
              el
                .split("\n")
                .some(
                  (eA) =>
                    -1 !== eA.indexOf("(https.js:") ||
                    -1 !== eA.indexOf("node:https:"),
                )
            );
          }
          incrementSockets(eA) {
            if (this.maxSockets === 1 / 0 && this.maxTotalSockets === 1 / 0)
              return null;
            this.sockets[eA] || (this.sockets[eA] = []);
            let el = new eh.Socket({ writable: !1 });
            return (this.sockets[eA].push(el), this.totalSocketCount++, el);
          }
          decrementSockets(eA, el) {
            if (!this.sockets[eA] || null === el) return;
            let ec = this.sockets[eA],
              eu = ec.indexOf(el);
            -1 !== eu &&
              (ec.splice(eu, 1),
              this.totalSocketCount--,
              0 === ec.length && delete this.sockets[eA]);
          }
          getName(eA) {
            return (
              "boolean" == typeof eA.secureEndpoint
                ? eA.secureEndpoint
                : this.isSecureEndpoint(eA)
            )
              ? em.Agent.prototype.getName.call(this, eA)
              : super.getName(eA);
          }
          createSocket(eA, el, ec) {
            let eu = { ...el, secureEndpoint: this.isSecureEndpoint(el) },
              ed = this.getName(eu),
              ep = this.incrementSockets(ed);
            Promise.resolve()
              .then(() => this.connect(eA, eu))
              .then(
                (eg) => {
                  if ((this.decrementSockets(ed, ep), eg instanceof ef.Agent))
                    try {
                      return eg.addRequest(eA, eu);
                    } catch (eA) {
                      return ec(eA);
                    }
                  ((this[eE].currentSocket = eg),
                    super.createSocket(eA, el, ec));
                },
                (eA) => {
                  (this.decrementSockets(ed, ep), ec(eA));
                },
              );
          }
          createConnection() {
            let eA = this[eE].currentSocket;
            if (((this[eE].currentSocket = void 0), !eA))
              throw Error("No socket was returned in the `connect()` function");
            return eA;
          }
          get defaultPort() {
            return (
              this[eE].defaultPort ?? ("https:" === this.protocol ? 443 : 80)
            );
          }
          set defaultPort(eA) {
            this[eE] && (this[eE].defaultPort = eA);
          }
          get protocol() {
            return (
              this[eE].protocol ??
              (this.isSecureEndpoint() ? "https:" : "http:")
            );
          }
          set protocol(eA) {
            this[eE] && (this[eE].protocol = eA);
          }
        };
        el.Agent = Agent;
      },
      87016(eA) {
        "use strict";
        eA.exports = require("url");
      },
      36981(eA, el, ec) {
        "use strict";
        var eu =
          (this && this.__importDefault) ||
          function (eA) {
            return eA && eA.__esModule ? eA : { default: eA };
          };
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.parseProxyResponse = void 0));
        let ed = (0, eu(ec(3680)).default)(
          "https-proxy-agent:parse-proxy-response",
        );
        el.parseProxyResponse = function (eA) {
          return new Promise((el, ec) => {
            let eu = 0,
              ep = [];
            function read() {
              let el = eA.read();
              el ? ondata(el) : eA.once("readable", read);
            }
            function cleanup() {
              (eA.removeListener("end", onend),
                eA.removeListener("error", onerror),
                eA.removeListener("readable", read));
            }
            function onend() {
              (cleanup(),
                ed("onend"),
                ec(
                  Error(
                    "Proxy connection ended before receiving CONNECT response",
                  ),
                ));
            }
            function onerror(eA) {
              (cleanup(), ed("onerror %o", eA), ec(eA));
            }
            function ondata(eg) {
              (ep.push(eg), (eu += eg.length));
              let eh = Buffer.concat(ep, eu),
                ef = eh.indexOf("\r\n\r\n");
              if (-1 === ef) {
                (ed("have not received end of HTTP headers yet..."), read());
                return;
              }
              let em = eh.slice(0, ef).toString("ascii").split("\r\n"),
                eE = em.shift();
              if (!eE)
                return (
                  eA.destroy(),
                  ec(Error("No header received from proxy CONNECT response"))
                );
              let eC = eE.split(" "),
                ey = +eC[1],
                ew = eC.slice(2).join(" "),
                eB = {};
              for (let el of em) {
                if (!el) continue;
                let eu = el.indexOf(":");
                if (-1 === eu)
                  return (
                    eA.destroy(),
                    ec(
                      Error(
                        `Invalid header from proxy CONNECT response: "${el}"`,
                      ),
                    )
                  );
                let ed = el.slice(0, eu).toLowerCase(),
                  ep = el.slice(eu + 1).trimStart(),
                  eg = eB[ed];
                "string" == typeof eg
                  ? (eB[ed] = [eg, ep])
                  : Array.isArray(eg)
                    ? eg.push(ep)
                    : (eB[ed] = ep);
              }
              (ed("got proxy server response: %o %o", eE, eB),
                cleanup(),
                el({
                  connect: { statusCode: ey, statusText: ew, headers: eB },
                  buffered: eh,
                }));
            }
            (eA.on("error", onerror), eA.on("end", onend), read());
          });
        };
      },
      20124(eA, el, ec) {
        function useColors() {
          let eA;
          return (
            ("u" > typeof window &&
              !!window.process &&
              ("renderer" === window.process.type ||
                !!window.process.__nwjs)) ||
            (!(
              "u" > typeof navigator &&
              navigator.userAgent &&
              navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
            ) &&
              (("u" > typeof document &&
                document.documentElement &&
                document.documentElement.style &&
                document.documentElement.style.WebkitAppearance) ||
                ("u" > typeof window &&
                  window.console &&
                  (window.console.firebug ||
                    (window.console.exception && window.console.table))) ||
                ("u" > typeof navigator &&
                  navigator.userAgent &&
                  (eA = navigator.userAgent
                    .toLowerCase()
                    .match(/firefox\/(\d+)/)) &&
                  parseInt(eA[1], 10) >= 31) ||
                ("u" > typeof navigator &&
                  navigator.userAgent &&
                  navigator.userAgent
                    .toLowerCase()
                    .match(/applewebkit\/(\d+)/))))
          );
        }
        function save(eA) {
          try {
            eA
              ? el.storage.setItem("debug", eA)
              : el.storage.removeItem("debug");
          } catch (eA) {}
        }
        function load() {
          let eA;
          try {
            eA = el.storage.getItem("debug");
          } catch (eA) {}
          return (
            !eA &&
              "u" > typeof process &&
              "env" in process &&
              (eA = process.env.DEBUG),
            eA
          );
        }
        function localstorage() {
          try {
            return localStorage;
          } catch (eA) {}
        }
        ((el.formatArgs = function formatArgs(el) {
          if (
            ((el[0] =
              (this.useColors ? "%c" : "") +
              this.namespace +
              (this.useColors ? " %c" : " ") +
              el[0] +
              (this.useColors ? "%c " : " ") +
              "+" +
              eA.exports.humanize(this.diff)),
            !this.useColors)
          )
            return;
          let ec = "color: " + this.color;
          el.splice(1, 0, ec, "color: inherit");
          let eu = 0,
            ed = 0;
          (el[0].replace(/%[a-zA-Z%]/g, (eA) => {
            "%%" !== eA && (eu++, "%c" === eA && (ed = eu));
          }),
            el.splice(ed, 0, ec));
        }),
          (el.save = save),
          (el.load = load),
          (el.useColors = useColors),
          (el.storage = localstorage()),
          (el.destroy = (() => {
            let eA = !1;
            return () => {
              eA ||
                ((eA = !0),
                console.warn(
                  "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
                ));
            };
          })()),
          (el.colors = [
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
            "#FFCC33",
          ]),
          (el.log = console.debug || console.log || (() => {})),
          (eA.exports = ec(27891)(el)));
        let { formatters: eu } = eA.exports;
        eu.j = function (eA) {
          try {
            return JSON.stringify(eA);
          } catch (eA) {
            return "[UnexpectedJSONParseError]: " + eA.message;
          }
        };
      },
      85038(eA, el, ec) {
        let eu = ec(52018),
          ed = ec(39023);
        ((el.init = init),
          (el.log = log),
          (el.formatArgs = formatArgs),
          (el.save = save),
          (el.load = load),
          (el.useColors = useColors),
          (el.destroy = ed.deprecate(
            () => {},
            "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
          )),
          (el.colors = [6, 2, 3, 4, 5, 1]));
        try {
          let eA = ec(35600);
          eA &&
            (eA.stderr || eA).level >= 2 &&
            (el.colors = [
              20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57,
              62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99,
              112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164,
              165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185,
              196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208,
              209, 214, 215, 220, 221,
            ]);
        } catch (eA) {}
        function useColors() {
          return "colors" in el.inspectOpts
            ? !!el.inspectOpts.colors
            : eu.isatty(process.stderr.fd);
        }
        function formatArgs(el) {
          let { namespace: ec, useColors: eu } = this;
          if (eu) {
            let eu = this.color,
              ed = "\x1b[3" + (eu < 8 ? eu : "8;5;" + eu),
              ep = `  ${ed};1m${ec} \u001B[0m`;
            ((el[0] = ep + el[0].split("\n").join("\n" + ep)),
              el.push(ed + "m+" + eA.exports.humanize(this.diff) + "\x1b[0m"));
          } else el[0] = getDate() + ec + " " + el[0];
        }
        function getDate() {
          return el.inspectOpts.hideDate ? "" : new Date().toISOString() + " ";
        }
        function log(...eA) {
          return process.stderr.write(
            ed.formatWithOptions(el.inspectOpts, ...eA) + "\n",
          );
        }
        function save(eA) {
          eA ? (process.env.DEBUG = eA) : delete process.env.DEBUG;
        }
        function load() {
          return process.env.DEBUG;
        }
        function init(eA) {
          eA.inspectOpts = {};
          let ec = Object.keys(el.inspectOpts);
          for (let eu = 0; eu < ec.length; eu++)
            eA.inspectOpts[ec[eu]] = el.inspectOpts[ec[eu]];
        }
        ((el.inspectOpts = Object.keys(process.env)
          .filter((eA) => /^debug_/i.test(eA))
          .reduce((eA, el) => {
            let ec = el
                .substring(6)
                .toLowerCase()
                .replace(/_([a-z])/g, (eA, el) => el.toUpperCase()),
              eu = process.env[el];
            return (
              (eu =
                !!/^(yes|on|true|enabled)$/i.test(eu) ||
                (!/^(no|off|false|disabled)$/i.test(eu) &&
                  ("null" === eu ? null : Number(eu)))),
              (eA[ec] = eu),
              eA
            );
          }, {})),
          (eA.exports = ec(27891)(el)));
        let { formatters: ep } = eA.exports;
        ((ep.o = function (eA) {
          return (
            (this.inspectOpts.colors = this.useColors),
            ed
              .inspect(eA, this.inspectOpts)
              .split("\n")
              .map((eA) => eA.trim())
              .join(" ")
          );
        }),
          (ep.O = function (eA) {
            return (
              (this.inspectOpts.colors = this.useColors),
              ed.inspect(eA, this.inspectOpts)
            );
          }));
      },
      58611(eA) {
        "use strict";
        eA.exports = require("http");
      },
      65692(eA) {
        "use strict";
        eA.exports = require("https");
      },
      83053(eA, el, ec) {
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
            };
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.req = el.json = el.toBuffer = void 0));
        let eg = ep(ec(58611)),
          eh = ep(ec(65692));
        async function toBuffer(eA) {
          let el = 0,
            ec = [];
          for await (let eu of eA) ((el += eu.length), ec.push(eu));
          return Buffer.concat(ec, el);
        }
        ((el.toBuffer = toBuffer),
          (el.json = async function (eA) {
            let el = (await toBuffer(eA)).toString("utf8");
            try {
              return JSON.parse(el);
            } catch (ec) {
              let eA = ec;
              throw ((eA.message += ` (input: ${el})`), eA);
            }
          }),
          (el.req = function (eA, el = {}) {
            let ec = (
                ("string" == typeof eA ? eA : eA.href).startsWith("https:")
                  ? eh
                  : eg
              ).request(eA, el),
              eu = new Promise((eA, el) => {
                ec.once("response", eA).once("error", el).end();
              });
            return ((ec.then = eu.then.bind(eu)), ec);
          }));
      },
      27891(eA, el, ec) {
        eA.exports = function (eA) {
          function selectColor(eA) {
            let el = 0;
            for (let ec = 0; ec < eA.length; ec++)
              el = ((el << 5) - el + eA.charCodeAt(ec)) | 0;
            return createDebug.colors[Math.abs(el) % createDebug.colors.length];
          }
          function createDebug(eA) {
            let el,
              ec,
              eu,
              ed = null;
            function debug(...eA) {
              if (!debug.enabled) return;
              let ec = debug,
                eu = Number(new Date());
              ((ec.diff = eu - (el || eu)),
                (ec.prev = el),
                (ec.curr = eu),
                (el = eu),
                (eA[0] = createDebug.coerce(eA[0])),
                "string" != typeof eA[0] && eA.unshift("%O"));
              let ed = 0;
              ((eA[0] = eA[0].replace(/%([a-zA-Z%])/g, (el, eu) => {
                if ("%%" === el) return "%";
                ed++;
                let ep = createDebug.formatters[eu];
                if ("function" == typeof ep) {
                  let eu = eA[ed];
                  ((el = ep.call(ec, eu)), eA.splice(ed, 1), ed--);
                }
                return el;
              })),
                createDebug.formatArgs.call(ec, eA),
                (ec.log || createDebug.log).apply(ec, eA));
            }
            return (
              (debug.namespace = eA),
              (debug.useColors = createDebug.useColors()),
              (debug.color = createDebug.selectColor(eA)),
              (debug.extend = extend),
              (debug.destroy = createDebug.destroy),
              Object.defineProperty(debug, "enabled", {
                enumerable: !0,
                configurable: !1,
                get: () =>
                  null !== ed
                    ? ed
                    : (ec !== createDebug.namespaces &&
                        ((ec = createDebug.namespaces),
                        (eu = createDebug.enabled(eA))),
                      eu),
                set: (eA) => {
                  ed = eA;
                },
              }),
              "function" == typeof createDebug.init && createDebug.init(debug),
              debug
            );
          }
          function extend(eA, el) {
            let ec = createDebug(
              this.namespace + (void 0 === el ? ":" : el) + eA,
            );
            return ((ec.log = this.log), ec);
          }
          function enable(eA) {
            for (let el of (createDebug.save(eA),
            (createDebug.namespaces = eA),
            (createDebug.names = []),
            (createDebug.skips = []),
            ("string" == typeof eA ? eA : "")
              .trim()
              .replace(" ", ",")
              .split(",")
              .filter(Boolean)))
              "-" === el[0]
                ? createDebug.skips.push(el.slice(1))
                : createDebug.names.push(el);
          }
          function matchesTemplate(eA, el) {
            let ec = 0,
              eu = 0,
              ed = -1,
              ep = 0;
            for (; ec < eA.length;)
              if (eu < el.length && (el[eu] === eA[ec] || "*" === el[eu]))
                ("*" === el[eu] ? ((ed = eu), (ep = ec)) : ec++, eu++);
              else {
                if (-1 === ed) return !1;
                ((eu = ed + 1), (ec = ++ep));
              }
            for (; eu < el.length && "*" === el[eu];) eu++;
            return eu === el.length;
          }
          function disable() {
            let eA = [
              ...createDebug.names,
              ...createDebug.skips.map((eA) => "-" + eA),
            ].join(",");
            return (createDebug.enable(""), eA);
          }
          function enabled(eA) {
            for (let el of createDebug.skips)
              if (matchesTemplate(eA, el)) return !1;
            for (let el of createDebug.names)
              if (matchesTemplate(eA, el)) return !0;
            return !1;
          }
          function coerce(eA) {
            return eA instanceof Error ? eA.stack || eA.message : eA;
          }
          function destroy() {
            console.warn(
              "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
            );
          }
          return (
            (createDebug.debug = createDebug),
            (createDebug.default = createDebug),
            (createDebug.coerce = coerce),
            (createDebug.disable = disable),
            (createDebug.enable = enable),
            (createDebug.enabled = enabled),
            (createDebug.humanize = ec(27250)),
            (createDebug.destroy = destroy),
            Object.keys(eA).forEach((el) => {
              createDebug[el] = eA[el];
            }),
            (createDebug.names = []),
            (createDebug.skips = []),
            (createDebug.formatters = {}),
            (createDebug.selectColor = selectColor),
            createDebug.enable(createDebug.load()),
            createDebug
          );
        };
      },
      52018(eA) {
        "use strict";
        eA.exports = require("tty");
      },
      39023(eA) {
        "use strict";
        eA.exports = require("util");
      },
      35600(eA, el, ec) {
        "use strict";
        let eu,
          ed = ec(70857),
          ep = ec(52018),
          eg = ec(56071),
          { env: eh } = process;
        function translateLevel(eA) {
          return (
            0 !== eA && {
              level: eA,
              hasBasic: !0,
              has256: eA >= 2,
              has16m: eA >= 3,
            }
          );
        }
        function supportsColor(eA, el) {
          if (0 === eu) return 0;
          if (eg("color=16m") || eg("color=full") || eg("color=truecolor"))
            return 3;
          if (eg("color=256")) return 2;
          if (eA && !el && void 0 === eu) return 0;
          let ec = eu || 0;
          if ("dumb" === eh.TERM) return ec;
          if ("win32" === process.platform) {
            let eA = ed.release().split(".");
            return Number(eA[0]) >= 10 && Number(eA[2]) >= 10586
              ? Number(eA[2]) >= 14931
                ? 3
                : 2
              : 1;
          }
          if ("CI" in eh)
            return [
              "TRAVIS",
              "CIRCLECI",
              "APPVEYOR",
              "GITLAB_CI",
              "GITHUB_ACTIONS",
              "BUILDKITE",
            ].some((eA) => eA in eh) || "codeship" === eh.CI_NAME
              ? 1
              : ec;
          if ("TEAMCITY_VERSION" in eh)
            return +!!/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(eh.TEAMCITY_VERSION);
          if ("truecolor" === eh.COLORTERM) return 3;
          if ("TERM_PROGRAM" in eh) {
            let eA = parseInt(
              (eh.TERM_PROGRAM_VERSION || "").split(".")[0],
              10,
            );
            switch (eh.TERM_PROGRAM) {
              case "iTerm.app":
                return eA >= 3 ? 3 : 2;
              case "Apple_Terminal":
                return 2;
            }
          }
          return /-256(color)?$/i.test(eh.TERM)
            ? 2
            : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(
                  eh.TERM,
                ) || "COLORTERM" in eh
              ? 1
              : ec;
        }
        (eg("no-color") ||
        eg("no-colors") ||
        eg("color=false") ||
        eg("color=never")
          ? (eu = 0)
          : (eg("color") ||
              eg("colors") ||
              eg("color=true") ||
              eg("color=always")) &&
            (eu = 1),
          "FORCE_COLOR" in eh &&
            (eu =
              "true" === eh.FORCE_COLOR
                ? 1
                : "false" === eh.FORCE_COLOR
                  ? 0
                  : 0 === eh.FORCE_COLOR.length
                    ? 1
                    : Math.min(parseInt(eh.FORCE_COLOR, 10), 3)),
          (eA.exports = {
            supportsColor: function (eA) {
              return translateLevel(supportsColor(eA, eA && eA.isTTY));
            },
            stdout: translateLevel(supportsColor(!0, ep.isatty(1))),
            stderr: translateLevel(supportsColor(!0, ep.isatty(2))),
          }));
      },
      27250(eA) {
        var el = 1e3,
          ec = 6e4,
          eu = 36e5,
          ed = 864e5,
          ep = 6048e5,
          eg = 315576e5;
        function parse(eA) {
          if (!((eA = String(eA)).length > 100)) {
            var eh =
              /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
                eA,
              );
            if (eh) {
              var ef = parseFloat(eh[1]),
                em = (eh[2] || "ms").toLowerCase();
              switch (em) {
                case "years":
                case "year":
                case "yrs":
                case "yr":
                case "y":
                  return ef * eg;
                case "weeks":
                case "week":
                case "w":
                  return ef * ep;
                case "days":
                case "day":
                case "d":
                  return ef * ed;
                case "hours":
                case "hour":
                case "hrs":
                case "hr":
                case "h":
                  return ef * eu;
                case "minutes":
                case "minute":
                case "mins":
                case "min":
                case "m":
                  return ef * ec;
                case "seconds":
                case "second":
                case "secs":
                case "sec":
                case "s":
                  return ef * el;
                case "milliseconds":
                case "millisecond":
                case "msecs":
                case "msec":
                case "ms":
                  return ef;
                default:
                  return;
              }
            }
          }
        }
        function fmtShort(eA) {
          var ep = Math.abs(eA);
          return ep >= ed
            ? Math.round(eA / ed) + "d"
            : ep >= eu
              ? Math.round(eA / eu) + "h"
              : ep >= ec
                ? Math.round(eA / ec) + "m"
                : ep >= el
                  ? Math.round(eA / el) + "s"
                  : eA + "ms";
        }
        function fmtLong(eA) {
          var ep = Math.abs(eA);
          return ep >= ed
            ? plural(eA, ep, ed, "day")
            : ep >= eu
              ? plural(eA, ep, eu, "hour")
              : ep >= ec
                ? plural(eA, ep, ec, "minute")
                : ep >= el
                  ? plural(eA, ep, el, "second")
                  : eA + " ms";
        }
        function plural(eA, el, ec, eu) {
          var ed = el >= 1.5 * ec;
          return Math.round(eA / ec) + " " + eu + (ed ? "s" : "");
        }
        eA.exports = function (eA, el) {
          el = el || {};
          var ec = typeof eA;
          if ("string" === ec && eA.length > 0) return parse(eA);
          if ("number" === ec && isFinite(eA))
            return el.long ? fmtLong(eA) : fmtShort(eA);
          throw Error(
            "val is not a non-empty string or a valid number. val=" +
              JSON.stringify(eA),
          );
        };
      },
      70857(eA) {
        "use strict";
        eA.exports = require("os");
      },
      56071(eA) {
        "use strict";
        eA.exports = (eA, el = process.argv) => {
          let ec = eA.startsWith("-") ? "" : 1 === eA.length ? "-" : "--",
            eu = el.indexOf(ec + eA),
            ed = el.indexOf("--");
          return -1 !== eu && (-1 === ed || eu < ed);
        };
      },
    },
    cache = new Map();
  function ec(id: number): any {
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit OTLP export parent required: " + id);
    return value;
  }
  ec.r = (o: any) => Object.defineProperty(o, "__esModule", { value: true });
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };

  return { HttpsProxyAgent: ec(64007).HttpsProxyAgent, getModule: ec };
}
