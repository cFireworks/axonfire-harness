// @ts-nocheck
// Captured OTLP delegate, exporter base and bounded queue. No automatic activation.
export const OTLP_EXPORT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const OTLP_EXPORT_REGIONS = [
  [7913603, 7916506],
  [7916506, 7916593],
  [7916593, 7917364],
  [7917364, 7917467],
  [7917467, 7917751],
  [7917751, 7921199],
  [7921199, 7921356],
  [7921356, 7921554],
] as const;
export const OTLP_EXPORT_MODULES = [[36275, 996612, 996771]] as const;
export function createNativeOtlpExport(runtime: any) {
  const factories = {
      36275(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { ExportResultCode: () => eu }),
          (function (eA) {
            ((eA[(eA.SUCCESS = 0)] = "SUCCESS"),
              (eA[(eA.FAILED = 1)] = "FAILED"));
          })(eu || (eu = {})));
      },
    },
    cache = new Map();
  function ec(id: number): any {
    if (cache.has(id)) return cache.get(id);
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m.exports);
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
  var eN = ec(69700),
    eP = ec(14515),
    eL = ec(62207),
    eF = ec(84992),
    eU = ec(11440),
    ej = ec(84746),
    eG = ec(15086),
    eH = ec(58611),
    eK = ec(65692),
    e$ = ec(43106),
    eY = (function () {
      function OTLPExporterBase(eA) {
        this._delegate = eA;
      }
      return (
        (OTLPExporterBase.prototype.export = function (eA, el) {
          this._delegate.export(eA, el);
        }),
        (OTLPExporterBase.prototype.forceFlush = function () {
          return this._delegate.forceFlush();
        }),
        (OTLPExporterBase.prototype.shutdown = function () {
          return this._delegate.shutdown();
        }),
        OTLPExporterBase
      );
    })(),
    __awaiter = function (eA, el, ec, eu) {
      function adopt(eA) {
        return eA instanceof ec
          ? eA
          : new ec(function (el) {
              el(eA);
            });
      }
      return new (ec || (ec = Promise))(function (ec, ed) {
        function fulfilled(eA) {
          try {
            step(eu.next(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function rejected(eA) {
          try {
            step(eu.throw(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function step(eA) {
          eA.done ? ec(eA.value) : adopt(eA.value).then(fulfilled, rejected);
        }
        step((eu = eu.apply(eA, el || [])).next());
      });
    },
    __generator = function (eA, el) {
      var ec,
        eu,
        ed,
        ep,
        eg = {
          label: 0,
          sent: function () {
            if (1 & ed[0]) throw ed[1];
            return ed[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (ep = { next: verb(0), throw: verb(1), return: verb(2) }),
        "function" == typeof Symbol &&
          (ep[Symbol.iterator] = function () {
            return this;
          }),
        ep
      );
      function verb(eA) {
        return function (el) {
          return step([eA, el]);
        };
      }
      function step(ep) {
        if (ec) throw TypeError("Generator is already executing.");
        for (; eg; )
          try {
            if (
              ((ec = 1),
              eu &&
                (ed =
                  2 & ep[0]
                    ? eu.return
                    : ep[0]
                      ? eu.throw || ((ed = eu.return) && ed.call(eu), 0)
                      : eu.next) &&
                !(ed = ed.call(eu, ep[1])).done)
            )
              return ed;
            switch (((eu = 0), ed && (ep = [2 & ep[0], ed.value]), ep[0])) {
              case 0:
              case 1:
                ed = ep;
                break;
              case 4:
                return (eg.label++, { value: ep[1], done: !1 });
              case 5:
                (eg.label++, (eu = ep[1]), (ep = [0]));
                continue;
              case 7:
                ((ep = eg.ops.pop()), eg.trys.pop());
                continue;
              default:
                if (
                  !(ed = (ed = eg.trys).length > 0 && ed[ed.length - 1]) &&
                  (6 === ep[0] || 2 === ep[0])
                ) {
                  eg = 0;
                  continue;
                }
                if (3 === ep[0] && (!ed || (ep[1] > ed[0] && ep[1] < ed[3]))) {
                  eg.label = ep[1];
                  break;
                }
                if (6 === ep[0] && eg.label < ed[1]) {
                  ((eg.label = ed[1]), (ed = ep));
                  break;
                }
                if (ed && eg.label < ed[2]) {
                  ((eg.label = ed[2]), eg.ops.push(ep));
                  break;
                }
                (ed[2] && eg.ops.pop(), eg.trys.pop());
                continue;
            }
            ep = el.call(eA, eg);
          } catch (eA) {
            ((ep = [6, eA]), (eu = 0));
          } finally {
            ec = ed = 0;
          }
        if (5 & ep[0]) throw ep[1];
        return { value: ep[0] ? ep[1] : void 0, done: !0 };
      }
    },
    eJ = (function () {
      function BoundedQueueExportPromiseHandler(eA) {
        ((this._sendingPromises = []), (this._concurrencyLimit = eA));
      }
      return (
        (BoundedQueueExportPromiseHandler.prototype.pushPromise = function (
          eA,
        ) {
          var el = this;
          if (this.hasReachedLimit()) throw Error("Concurrency Limit reached");
          this._sendingPromises.push(eA);
          var popPromise = function () {
            var ec = el._sendingPromises.indexOf(eA);
            el._sendingPromises.splice(ec, 1);
          };
          eA.then(popPromise, popPromise);
        }),
        (BoundedQueueExportPromiseHandler.prototype.hasReachedLimit =
          function () {
            return this._sendingPromises.length >= this._concurrencyLimit;
          }),
        (BoundedQueueExportPromiseHandler.prototype.awaitAll = function () {
          return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (eA) {
              switch (eA.label) {
                case 0:
                  return [4, Promise.all(this._sendingPromises)];
                case 1:
                  return (eA.sent(), [2]);
              }
            });
          });
        }),
        BoundedQueueExportPromiseHandler
      );
    })();
  function createBoundedQueueExportPromiseHandler(eA) {
    return new eJ(eA.concurrencyLimit);
  }
  var ez = ec(36275),
    eW = (function () {
      var extendStatics = function (eA, el) {
        return (extendStatics =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (eA, el) {
              eA.__proto__ = el;
            }) ||
          function (eA, el) {
            for (var ec in el)
              Object.prototype.hasOwnProperty.call(el, ec) && (eA[ec] = el[ec]);
          })(eA, el);
      };
      return function (eA, el) {
        if ("function" != typeof el && null !== el)
          throw TypeError(
            "Class extends value " +
              String(el) +
              " is not a constructor or null",
          );
        function __() {
          this.constructor = eA;
        }
        (extendStatics(eA, el),
          (eA.prototype =
            null === el
              ? Object.create(el)
              : ((__.prototype = el.prototype), new __())));
      };
    })(),
    eV = (function (eA) {
      function OTLPExporterError(el, ec, eu) {
        var ed = eA.call(this, el) || this;
        return (
          (ed.name = "OTLPExporterError"),
          (ed.data = eu),
          (ed.code = ec),
          ed
        );
      }
      return (eW(OTLPExporterError, eA), OTLPExporterError);
    })(Error),
    eZ = ec(2339);
  function isPartialSuccessResponse(eA) {
    return Object.prototype.hasOwnProperty.call(eA, "partialSuccess");
  }
  function createLoggingPartialSuccessResponseHandler() {
    return {
      handleResponse: function (eA) {
        null != eA &&
          isPartialSuccessResponse(eA) &&
          null != eA.partialSuccess &&
          0 !== Object.keys(eA.partialSuccess).length &&
          eZ.diag.warn(
            "Received Partial Success response:",
            JSON.stringify(eA.partialSuccess),
          );
      },
    };
  }
  var otlp_export_delegate_awaiter = function (eA, el, ec, eu) {
      function adopt(eA) {
        return eA instanceof ec
          ? eA
          : new ec(function (el) {
              el(eA);
            });
      }
      return new (ec || (ec = Promise))(function (ec, ed) {
        function fulfilled(eA) {
          try {
            step(eu.next(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function rejected(eA) {
          try {
            step(eu.throw(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function step(eA) {
          eA.done ? ec(eA.value) : adopt(eA.value).then(fulfilled, rejected);
        }
        step((eu = eu.apply(eA, el || [])).next());
      });
    },
    otlp_export_delegate_generator = function (eA, el) {
      var ec,
        eu,
        ed,
        ep,
        eg = {
          label: 0,
          sent: function () {
            if (1 & ed[0]) throw ed[1];
            return ed[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (ep = { next: verb(0), throw: verb(1), return: verb(2) }),
        "function" == typeof Symbol &&
          (ep[Symbol.iterator] = function () {
            return this;
          }),
        ep
      );
      function verb(eA) {
        return function (el) {
          return step([eA, el]);
        };
      }
      function step(ep) {
        if (ec) throw TypeError("Generator is already executing.");
        for (; eg; )
          try {
            if (
              ((ec = 1),
              eu &&
                (ed =
                  2 & ep[0]
                    ? eu.return
                    : ep[0]
                      ? eu.throw || ((ed = eu.return) && ed.call(eu), 0)
                      : eu.next) &&
                !(ed = ed.call(eu, ep[1])).done)
            )
              return ed;
            switch (((eu = 0), ed && (ep = [2 & ep[0], ed.value]), ep[0])) {
              case 0:
              case 1:
                ed = ep;
                break;
              case 4:
                return (eg.label++, { value: ep[1], done: !1 });
              case 5:
                (eg.label++, (eu = ep[1]), (ep = [0]));
                continue;
              case 7:
                ((ep = eg.ops.pop()), eg.trys.pop());
                continue;
              default:
                if (
                  !(ed = (ed = eg.trys).length > 0 && ed[ed.length - 1]) &&
                  (6 === ep[0] || 2 === ep[0])
                ) {
                  eg = 0;
                  continue;
                }
                if (3 === ep[0] && (!ed || (ep[1] > ed[0] && ep[1] < ed[3]))) {
                  eg.label = ep[1];
                  break;
                }
                if (6 === ep[0] && eg.label < ed[1]) {
                  ((eg.label = ed[1]), (ed = ep));
                  break;
                }
                if (ed && eg.label < ed[2]) {
                  ((eg.label = ed[2]), eg.ops.push(ep));
                  break;
                }
                (ed[2] && eg.ops.pop(), eg.trys.pop());
                continue;
            }
            ep = el.call(eA, eg);
          } catch (eA) {
            ((ep = [6, eA]), (eu = 0));
          } finally {
            ec = ed = 0;
          }
        if (5 & ep[0]) throw ep[1];
        return { value: ep[0] ? ep[1] : void 0, done: !0 };
      }
    },
    eX = (function () {
      function OTLPExportDelegate(eA, el, ec, eu, ed) {
        ((this._transport = eA),
          (this._serializer = el),
          (this._responseHandler = ec),
          (this._promiseQueue = eu),
          (this._timeout = ed),
          (this._diagLogger = eZ.diag.createComponentLogger({
            namespace: "OTLPExportDelegate",
          })));
      }
      return (
        (OTLPExportDelegate.prototype.export = function (eA, el) {
          var ec = this;
          if (
            (this._diagLogger.debug("items to be sent", eA),
            this._promiseQueue.hasReachedLimit())
          )
            return void el({
              code: ez.ExportResultCode.FAILED,
              error: Error("Concurrent export limit reached"),
            });
          var eu = this._serializer.serializeRequest(eA);
          null == eu
            ? el({
                code: ez.ExportResultCode.FAILED,
                error: Error("Nothing to send"),
              })
            : this._promiseQueue.pushPromise(
                this._transport.send(eu, this._timeout).then(
                  function (eA) {
                    if ("success" === eA.status) {
                      if (null != eA.data)
                        try {
                          ec._responseHandler.handleResponse(
                            ec._serializer.deserializeResponse(eA.data),
                          );
                        } catch (el) {
                          ec._diagLogger.warn(
                            "Export succeeded but could not deserialize response - is the response specification compliant?",
                            el,
                            eA.data,
                          );
                        }
                      el({ code: ez.ExportResultCode.SUCCESS });
                      return;
                    }
                    "failure" === eA.status && eA.error
                      ? el({
                          code: ez.ExportResultCode.FAILED,
                          error: eA.error,
                        })
                      : "retryable" === eA.status
                        ? el({
                            code: ez.ExportResultCode.FAILED,
                            error: new eV(
                              "Export failed with retryable status",
                            ),
                          })
                        : el({
                            code: ez.ExportResultCode.FAILED,
                            error: new eV("Export failed with unknown error"),
                          });
                  },
                  function (eA) {
                    return el({ code: ez.ExportResultCode.FAILED, error: eA });
                  },
                ),
              );
        }),
        (OTLPExportDelegate.prototype.forceFlush = function () {
          return this._promiseQueue.awaitAll();
        }),
        (OTLPExportDelegate.prototype.shutdown = function () {
          return otlp_export_delegate_awaiter(
            this,
            void 0,
            void 0,
            function () {
              return otlp_export_delegate_generator(this, function (eA) {
                switch (eA.label) {
                  case 0:
                    return (
                      this._diagLogger.debug("shutdown started"),
                      [4, this.forceFlush()]
                    );
                  case 1:
                    return (eA.sent(), this._transport.shutdown(), [2]);
                }
              });
            },
          );
        }),
        OTLPExportDelegate
      );
    })();
  function createOtlpExportDelegate(eA, el) {
    return new eX(
      eA.transport,
      eA.serializer,
      createLoggingPartialSuccessResponseHandler(),
      eA.promiseHandler,
      el.timeout,
    );
  }
  function createOtlpNetworkExportDelegate(eA, el, ec) {
    return createOtlpExportDelegate(
      {
        transport: ec,
        serializer: el,
        promiseHandler: createBoundedQueueExportPromiseHandler(eA),
      },
      { timeout: eA.timeoutMillis },
    );
  }
  return {
    OTLPExporterBase: eY,
    OTLPExportDelegate: eX,
    OTLPExporterError: eV,
    createOtlpExportDelegate,
    createOtlpNetworkExportDelegate,
    createBoundedQueueExportPromiseHandler,
    createLoggingPartialSuccessResponseHandler,
  };
}
