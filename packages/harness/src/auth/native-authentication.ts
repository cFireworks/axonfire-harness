// @ts-nocheck
// Complete original authentication class bodies and business declarations. No DI decorators or application bootstrap.
// Network, account storage, dynamic require and process environment are explicit caller-owned boundaries.
export const NATIVE_AUTHENTICATION_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const NATIVE_AUTHENTICATION_SCOPES = [
  {
    "id": 52521,
    "params": ["eA", "el", "ec"],
    "blocks": [
      ["expression", 15040267, 15040316],
      ["expression", 15040317, 15040352],
      ["declaration", 15040353, 15056301],
      ["expression", 15056301, 15056332],
      ["expression", 15056333, 15056361],
    ],
    "fragments": [["var", "eu", 15039730, 15039732]],
    "classes": [["ev", 15040505, 15056300, 25]],
    "bindings": [
      ["eg", 80699],
      ["eh", 67062],
      ["ef", 51147],
      ["em", 54194],
      ["eE", 9151],
      ["eC", 79814],
      ["ey", 92735],
      ["ew", 42315],
      ["eB", 51098],
      ["e_", 63525],
      ["eI", 67865],
    ],
    "exports": [["AuthenticationManagerImpl", "ev"]],
  },
  {
    "id": 7327,
    "params": ["eA", "el", "ec"],
    "blocks": [
      ["declaration", 15069713, 15069723],
      ["expression", 15070264, 15070313],
      ["expression", 15070314, 15070404],
      ["declaration", 15070405, 15070541],
      ["declaration", 15070541, 15070605],
      ["expression", 15070605, 15070722],
      ["declaration", 15070723, 15070736],
      ["expression", 15070736, 15070996],
      ["declaration", 15070997, 15071069],
      ["declaration", 15071069, 15071285],
      ["expression", 15071285, 15071325],
      ["declaration", 15071326, 15084539],
      ["expression", 15084539, 15084579],
    ],
    "fragments": [["var", "ep", 15069727, 15069729]],
    "classes": [["ek", 15071333, 15084538, 25]],
    "bindings": [
      ["ef", 80699],
      ["em", 67062],
      ["eE", 9151],
      ["eC", 79814],
      ["ey", 92735],
      ["ew", 22186],
      ["eB", 63525],
      ["e_", 67865],
    ],
    "exports": [
      ["toSignLicenseError", "toSignLicenseError"],
      ["ExternalLinkAuthenticationProvider", "ek"],
    ],
  },
  {
    "id": 78850,
    "params": ["eA", "el", "ec"],
    "blocks": [
      ["expression", 15089474, 15089523],
      ["expression", 15089524, 15089565],
      ["declaration", 15089566, 15089920],
      ["expression", 15089920, 15089957],
    ],
    "fragments": [],
    "classes": [["ef", 15089612, 15089919, 3]],
    "bindings": [
      ["ep", 80699],
      ["eg", 66915],
      ["eh", 67865],
    ],
    "exports": [["UserInfoContextVariableResolver", "ef"]],
  },
  {
    "id": 34047,
    "params": ["eA", "el", "ec"],
    "blocks": [
      ["expression", 15035441, 15035490],
      ["expression", 15035491, 15035530],
      ["declaration", 15035531, 15039068],
      ["expression", 15039068, 15039103],
    ],
    "fragments": [],
    "classes": [["ey", 15035843, 15039067, 4]],
    "bindings": [
      ["ep", 80699],
      ["eg", 67062],
      ["eh", 9151],
      ["ef", 79814],
      ["em", 67865],
    ],
    "exports": [["AuthenticationHttpInterceptor", "ey"]],
  },
  {
    "id": 26968,
    "params": ["eA", "el", "ec"],
    "blocks": [
      ["expression", 15069089, 15069138],
      ["expression", 15069139, 15069177],
      ["declaration", 15069178, 15069565],
      ["expression", 15069565, 15069599],
    ],
    "fragments": [],
    "classes": [["eh", 15069224, 15069564, 5]],
    "bindings": [
      ["ed", 80699],
      ["ep", 42315],
      ["eg", 67865],
    ],
    "exports": [["DefaultAuthenticationStorage", "eh"]],
  },
  {
    "id": 15064,
    "params": ["eA", "el", "ec"],
    "blocks": [
      ["expression", 15061798, 15061847],
      ["expression", 15061848, 15061891],
      ["declaration", 15061892, 15062490],
      ["expression", 15062490, 15062529],
    ],
    "fragments": [],
    "classes": [["eE", 15061963, 15062489, 6]],
    "bindings": [
      ["ep", 80699],
      ["eg", 9151],
      ["eh", 92735],
      ["ef", 67865],
      ["em", 40544],
    ],
    "exports": [["CustomTokenAuthenticationProvider", "eE"]],
  },
  {
    "id": 40544,
    "params": ["__unused_rspack_module", "exports", "__webpack_require__"],
    "blocks": [
      ["expression", 15063677, 15063731],
      ["expression", 15063732, 15063824],
      ["declaration", 15063825, 15064073],
      ["expression", 15064073, 15064156],
      ["declaration", 15064157, 15068023],
      ["expression", 15068023, 15068104],
    ],
    "fragments": [["var", "__importDefault", 15063578, 15063676]],
    "classes": [
      ["CustomTokenAuthenticationStorageImpl", 15064198, 15068022, 12],
    ],
    "bindings": [
      ["core_1", 80699],
      ["product_1", 9151],
      ["rxjs_1", 42315],
      ["authentication_protocol_1", 67865],
    ],
    "exports": [
      [
        "CustomTokenAuthenticationStorageImpl",
        "CustomTokenAuthenticationStorageImpl",
      ],
    ],
  },
  {
    "id": 13832,
    "params": ["__unused_rspack_module", "exports", "__webpack_require__"],
    "blocks": [
      ["expression", 15090791, 15090845],
      ["expression", 15090846, 15090885],
      ["declaration", 15090886, 15095219],
      ["expression", 15095219, 15095276],
    ],
    "fragments": [],
    "classes": [["WxAuthenticationProvider", 15091194, 15095218, 14]],
    "bindings": [
      ["core_1", 80699],
      ["http_1", 67062],
      ["product_1", 9151],
      ["telemetry_1", 92735],
      ["vscode_uri_1", 22186],
      ["account_utils_1", 63525],
      ["authentication_protocol_1", 67865],
    ],
    "exports": [["WxAuthenticationProvider", "WxAuthenticationProvider"]],
  },
] as const;
export const NATIVE_AUTHENTICATION_FACTORIES = [
  [67865, 15057656, 15061230],
  [63525, 15033009, 15034873],
  [54194, 15169875, 15172567],
  [66629, 81960, 94666],
  [15694, 96558, 98219],
  [96771, 99952, 103298],
  [74525, 103615, 105066],
  [5935, 98650, 99951],
  [44943, 19512, 19852],
  [8461, 116942, 117169],
  [26052, 66720, 67113],
  [99600, 116086, 116941],
  [79845, 15607804, 15608188],
  [55114, 15608650, 15618888],
  [93280, 103299, 103614],
] as const;
export function createNativeAuthenticationRuntime(runtime: any = {}) {
  const process = runtime.process ?? { env: {} };
  const Date = runtime.Date ?? globalThis.Date,
    Math = runtime.Math ?? globalThis.Math,
    console = runtime.console ?? globalThis.console;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout;
  const setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  const require =
    runtime.require ??
    ((id: string) => {
      throw Error("Explicit authentication dynamic dependency required: " + id);
    });
  const cache = new Map(),
    factories: any = {
      93280(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.ErrorUtil = void 0));
        let ErrorUtil = class ErrorUtil {
          static fixProto(eA, el) {
            let ec = Object.setPrototypeOf;
            ec ? ec(eA, el) : (eA.__proto__ = el);
          }
          static fixStack(eA, el = eA.constructor) {
            let ec = Error.captureStackTrace;
            ec && ec(eA, el);
          }
        };
        el.ErrorUtil = ErrorUtil;
      },
      67865(eA, el, ec) {
        "use strict";
        var eu, ed;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.UnauthorizedError =
            el.SignLicenseError =
            el.SignIpLimitError =
            el.SignError =
            el.OpenExternalLinkError =
            el.CanceledError =
            el.TimeoutError =
            el.AuthErrorCode =
            el.X_USER_ID =
            el.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT =
            el.ProductEnviroment =
            el.AuthenticationStoragePriority =
            el.HTTP_HEADER_SKIP_AUTH_INTERCEPTOR =
            el.HTTP_HEADER_NO_AUTHORIZATION =
            el.HTTP_HEADER_NO_DEPARTMENT_INFO =
            el.HTTP_HEADER_NO_ENTERPRISE_ID =
            el.HTTP_HEADER_NO_USER_ID =
            el.HTTP_HEADER_DOMAIN =
            el.HTTP_HEADER_TENANT_ID =
            el.HTTP_HEADER_DEPARTMENT_INFO =
            el.HTTP_HEADER_ENTERPRISE_ID =
            el.HTTP_HEADER_USER_ID =
            el.getLogoutMarkerPath =
            el.ProductEnvService =
            el.AuthenticationManager =
            el.AuthenticationStorage =
            el.AuthenticationProvider =
            el.AUTHENTICATION_PROVIDER_ID =
              void 0));
        let ep = ec(80699);
        ((el.AUTHENTICATION_PROVIDER_ID = "codingcopilot"),
          (el.AuthenticationProvider = Symbol("AuthenticationProvider")),
          (el.AuthenticationStorage = Symbol("AuthenticationStorage")),
          (el.AuthenticationManager = Symbol("AuthenticationManager")),
          (el.ProductEnvService = Symbol("ProductEnvService")),
          (el.getLogoutMarkerPath = function (eA) {
            return `${eA}.logged-out`;
          }),
          (el.HTTP_HEADER_USER_ID = "X-User-Id"),
          (el.HTTP_HEADER_ENTERPRISE_ID = "X-Enterprise-Id"),
          (el.HTTP_HEADER_DEPARTMENT_INFO = "X-Department-Info"),
          (el.HTTP_HEADER_TENANT_ID = "X-Tenant-Id"),
          (el.HTTP_HEADER_DOMAIN = "X-Domain"),
          (el.HTTP_HEADER_NO_USER_ID = "X-No-User-Id"),
          (el.HTTP_HEADER_NO_ENTERPRISE_ID = "X-No-Enterprise-Id"),
          (el.HTTP_HEADER_NO_DEPARTMENT_INFO = "X-No-Department-Info"),
          (el.HTTP_HEADER_NO_AUTHORIZATION = "X-No-Authorization"),
          (el.HTTP_HEADER_SKIP_AUTH_INTERCEPTOR = "X-Skip-Auth-Interceptor"),
          (function (eA) {
            ((eA[(eA.Disabled = 0)] = "Disabled"),
              (eA[(eA.Low = 1)] = "Low"),
              (eA[(eA.Normal = 5)] = "Normal"),
              (eA[(eA.Heigh = 9)] = "Heigh"));
          })(eu || (el.AuthenticationStoragePriority = eu = {})),
          (function (eA) {
            ((eA.External = "external"),
              (eA.Internal = "internal"),
              (eA.IOA = "iOA"),
              (eA.Selfhosted = "selfhosted"),
              (eA.Cloudhosted = "cloudhosted"));
          })(ed || (el.ProductEnviroment = ed = {})),
          (el.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT =
            "CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT"),
          (el.X_USER_ID = "X-User-Id"),
          (el.AuthErrorCode = {
            OpenExternalLinkFailed: "AUTH_OPEN_EXTERNAL_LINK_FAILED",
            Sign: "AUTH_SIGN_FAILED",
            Timeout: "AUTH_TIMEOUT",
            Canceled: "AUTH_CANCELED",
            IpLimit: "AUTH_IP_LIMIT",
            Unauthorized: "AUTH_UNAUTHORIZED",
            Network: "AUTH_NETWORK_ERROR",
            PermissionDenied: "AUTH_PERMISSION_DENIED",
            License: "AUTH_LICENSE",
            Unknown: "AUTH_UNKNOWN",
          }));
        let TimeoutError = class TimeoutError extends ep.CustomError {
          constructor() {
            (super(...arguments), (this.code = el.AuthErrorCode.Timeout));
          }
        };
        el.TimeoutError = TimeoutError;
        let CanceledError = class CanceledError extends ep.CustomError {
          constructor() {
            (super(...arguments), (this.code = el.AuthErrorCode.Canceled));
          }
        };
        el.CanceledError = CanceledError;
        let OpenExternalLinkError = class OpenExternalLinkError extends ep.CustomError {
          constructor() {
            (super(...arguments),
              (this.code = el.AuthErrorCode.OpenExternalLinkFailed));
          }
        };
        el.OpenExternalLinkError = OpenExternalLinkError;
        let SignError = class SignError extends ep.CustomError {
          constructor() {
            (super(...arguments), (this.code = el.AuthErrorCode.Sign));
          }
        };
        el.SignError = SignError;
        let SignIpLimitError = class SignIpLimitError extends ep.CustomError {
          constructor() {
            (super(...arguments), (this.code = el.AuthErrorCode.IpLimit));
          }
        };
        el.SignIpLimitError = SignIpLimitError;
        let SignLicenseError = class SignLicenseError extends ep.CustomError {
          constructor(eA, el) {
            (super(el), (this.code = eA), (this.msg = el));
          }
        };
        el.SignLicenseError = SignLicenseError;
        let UnauthorizedError = class UnauthorizedError extends ep.CustomError {
          constructor() {
            (super(...arguments), (this.code = el.AuthErrorCode.Unauthorized));
          }
        };
        el.UnauthorizedError = UnauthorizedError;
      },
      63525(eA, el) {
        "use strict";
        function normalizeAccountType(eA) {
          var el;
          return null != (el = null == eA ? void 0 : eA.trim().toLowerCase())
            ? el
            : "";
        }
        function normalizeAccountAvatar(eA) {
          var el, ec;
          return {
            ...eA,
            avatarUrl:
              (null == (el = eA.avatarUrl) ? void 0 : el.trim()) ||
              (null == (ec = eA.avatar_url) ? void 0 : ec.trim()) ||
              void 0,
          };
        }
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.isPersonalAccount =
            el.mergeCurrentAccountDetails =
            el.createAccountSnapshot =
            el.normalizeAccountAvatar =
            el.isWorkbuddyAuthenticationPlatform =
              void 0),
          (el.isWorkbuddyAuthenticationPlatform = function (eA) {
            var el;
            return (
              null !=
                (el =
                  null == eA
                    ? void 0
                    : eA.trim().toLowerCase().startsWith("workbuddy")) && el
            );
          }),
          (el.normalizeAccountAvatar = normalizeAccountAvatar),
          (el.createAccountSnapshot = function (eA) {
            let el = eA.map(normalizeAccountAvatar);
            return {
              allAccounts: el,
              accounts: el.filter((eA) => eA.pluginEnabled),
            };
          }),
          (el.mergeCurrentAccountDetails = function (eA, el) {
            var ec, eu, ed;
            let ep = el.filter((el) => el.uid === eA.uid),
              eg = normalizeAccountType(eA.type),
              eh =
                null !=
                (eu = null == (ec = eA.enterpriseId) ? void 0 : ec.trim())
                  ? eu
                  : "",
              ef = ep.filter((eA) => {
                var el, ec;
                return (
                  normalizeAccountType(eA.type) === eg &&
                  (null !=
                  (ec = null == (el = eA.enterpriseId) ? void 0 : el.trim())
                    ? ec
                    : "") === eh
                );
              }),
              em = eh
                ? ep.filter((eA) => {
                    var el;
                    return (
                      (null == (el = eA.enterpriseId) ? void 0 : el.trim()) ===
                      eh
                    );
                  })
                : [],
              eE = eh
                ? []
                : ep.filter(
                    (eA) =>
                      eA.lastLogin &&
                      ("personal" === eg
                        ? "personal" === normalizeAccountType(eA.type)
                        : "personal" !== normalizeAccountType(eA.type)),
                  ),
              eC =
                1 === ef.length
                  ? ef[0]
                  : 1 === em.length
                    ? em[0]
                    : 1 === eE.length
                      ? eE[0]
                      : void 0;
            if (!eC) return normalizeAccountAvatar(eA);
            let ey = normalizeAccountAvatar(eA).avatarUrl,
              ew = normalizeAccountAvatar(eC).avatarUrl;
            return normalizeAccountAvatar({
              ...eA,
              ...eC,
              uid: eA.uid,
              type: eA.type,
              enterpriseId:
                null != (ed = eA.enterpriseId) ? ed : eC.enterpriseId,
              avatarUrl: ew || ey,
            });
          }),
          (el.isPersonalAccount = function (eA) {
            var el;
            return (
              (null == (el = null == eA ? void 0 : eA.type)
                ? void 0
                : el.trim().toLowerCase()) === "personal"
            );
          }));
      },
      54194(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.DisposableComponent = el.SubscriptionManager = void 0));
        let SubscriptionManager = class SubscriptionManager {
          constructor() {
            ((this.subscriptions = new Set()),
              (this.disposables = new Set()),
              (this.timers = new Set()),
              (this.intervals = new Set()),
              (this.isDisposed = !1));
          }
          addSubscription(eA) {
            this.isDisposed ? eA.unsubscribe() : this.subscriptions.add(eA);
          }
          addDisposable(eA) {
            this.isDisposed ? eA.dispose() : this.disposables.add(eA);
          }
          addTimer(eA) {
            this.isDisposed ? clearTimeout(eA) : this.timers.add(eA);
          }
          addInterval(eA) {
            this.isDisposed ? clearInterval(eA) : this.intervals.add(eA);
          }
          removeSubscription(eA) {
            this.subscriptions.has(eA) &&
              (this.subscriptions.delete(eA), eA.closed || eA.unsubscribe());
          }
          removeTimer(eA) {
            this.timers.has(eA) && (this.timers.delete(eA), clearTimeout(eA));
          }
          removeInterval(eA) {
            this.intervals.has(eA) &&
              (this.intervals.delete(eA), clearInterval(eA));
          }
          removeDisposable(eA) {
            if (this.disposables.has(eA)) {
              this.disposables.delete(eA);
              try {
                eA.dispose();
              } catch (eA) {
                console.warn(
                  "[SubscriptionManager] Error disposing resource during removal:",
                  eA,
                );
              }
            }
          }
          getStats() {
            return {
              subscriptions: this.subscriptions.size,
              disposables: this.disposables.size,
              timers: this.timers.size,
              intervals: this.intervals.size,
              isDisposed: this.isDisposed,
            };
          }
          dispose() {
            this.isDisposed ||
              ((this.isDisposed = !0),
              this.subscriptions.forEach((eA) => {
                try {
                  eA.closed || eA.unsubscribe();
                } catch (eA) {
                  console.warn(
                    "[SubscriptionManager] Error disposing subscription:",
                    eA,
                  );
                }
              }),
              this.subscriptions.clear(),
              this.timers.forEach((eA) => {
                try {
                  clearTimeout(eA);
                } catch (eA) {
                  console.warn(
                    "[SubscriptionManager] Error clearing timer:",
                    eA,
                  );
                }
              }),
              this.timers.clear(),
              this.intervals.forEach((eA) => {
                try {
                  clearInterval(eA);
                } catch (eA) {
                  console.warn(
                    "[SubscriptionManager] Error clearing interval:",
                    eA,
                  );
                }
              }),
              this.intervals.clear(),
              this.disposables.forEach((eA) => {
                try {
                  eA.dispose();
                } catch (eA) {
                  console.warn(
                    "[SubscriptionManager] Error disposing resource:",
                    eA,
                  );
                }
              }),
              this.disposables.clear());
          }
          get disposed() {
            return this.isDisposed;
          }
        };
        el.SubscriptionManager = SubscriptionManager;
        let DisposableComponent = class DisposableComponent {
          constructor() {
            ((this.subscriptionManager = new SubscriptionManager()),
              (this.isDisposed = !1));
          }
          addSubscription(eA) {
            this.subscriptionManager.addSubscription(eA);
          }
          addTimer(eA) {
            this.subscriptionManager.addTimer(eA);
          }
          addInterval(eA) {
            this.subscriptionManager.addInterval(eA);
          }
          addDisposable(eA) {
            this.subscriptionManager.addDisposable(eA);
          }
          onDispose() {}
          dispose() {
            if (!this.isDisposed) {
              this.isDisposed = !0;
              try {
                this.onDispose();
              } catch (eA) {
                console.warn("[DisposableComponent] Error in onDispose:", eA);
              }
              this.subscriptionManager.dispose();
            }
          }
          get disposed() {
            return this.isDisposed;
          }
          getResourceStats() {
            return this.subscriptionManager.getStats();
          }
        };
        el.DisposableComponent = DisposableComponent;
      },
      66629(eA, el, ec) {
        "use strict";
        var eu;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Promises =
            el.DeferredPromise =
            el.IntervalCounter =
            el.TaskSequentializer =
            el.RunOnceWorker =
            el.ProcessTimeRunOnceScheduler =
            el.RunOnceScheduler =
            el.IntervalTimer =
            el.TimeoutTimer =
            el.Queue =
            el.Limiter =
            el.AutoOpenBarrier =
            el.Barrier =
            el.ThrottledDelayer =
            el.Delayer =
            el.MicrotaskDelay =
            el.SequencerByKey =
            el.Sequencer =
            el.Throttler =
              void 0),
          (el.isThenable = isThenable),
          (el.delay = delay),
          (el.wait = wait),
          (el.waitForEvent = waitForEvent),
          (el.createCancelablePromise = createCancelablePromise),
          (el.raceCancellation = raceCancellation),
          (el.raceCancellationError = raceCancellationError),
          (el.raceCancellablePromises = raceCancellablePromises),
          (el.raceTimeout = raceTimeout),
          (el.asPromise = asPromise),
          (el.timeout = timeout),
          (el.disposableTimeout = disposableTimeout),
          (el.sequence = sequence),
          (el.first = first),
          (el.firstParallel = firstParallel),
          (el.retry = retry));
        let ed = ec(15694),
          ep = ec(5935),
          eg = ec(96771);
        function isThenable(eA) {
          return !!eA && "function" == typeof eA.then;
        }
        function delay(eA) {
          return (el) =>
            new Promise((ec, eu) => {
              setTimeout(() => ec(el), eA);
            });
        }
        async function wait(eA) {
          await delay(eA)(void 0);
        }
        function waitForEvent(eA, el, ec, eu) {
          return new Promise((ep, eg) => {
            let eh = setTimeout(() => {
                (ef.dispose(), eg(new ed.CancellationError()));
              }, el),
              ef = eA(
                (eA) => {
                  (clearTimeout(eh), ef.dispose(), ep(eA));
                },
                ec,
                eu,
              );
          });
        }
        function createCancelablePromise(eA) {
          let el = new ed.CancellationTokenSource(),
            ec = eA(el.token),
            eu = new Promise((eA, eu) => {
              let ep = el.token.onCancellationRequested(() => {
                (ep.dispose(), el.dispose(), eu(new ed.CancellationError()));
              });
              Promise.resolve(ec).then(
                (ec) => {
                  (ep.dispose(), el.dispose(), eA(ec));
                },
                (eA) => {
                  (ep.dispose(), el.dispose(), eu(eA));
                },
              );
            });
          return new (class {
            cancel() {
              el.cancel();
            }
            then(eA, el) {
              return eu.then(eA, el);
            }
            catch(eA) {
              return this.then(void 0, eA);
            }
            finally(eA) {
              return eu.finally(eA);
            }
          })();
        }
        function raceCancellation(eA, el, ec) {
          return new Promise((eu, ed) => {
            let ep = el.onCancellationRequested(() => {
              (ep.dispose(), eu(ec));
            });
            eA.then(eu, ed).finally(() => ep.dispose());
          });
        }
        function raceCancellationError(eA, el) {
          return new Promise((ec, eu) => {
            let ep = el.onCancellationRequested(() => {
              (ep.dispose(), eu(new ed.CancellationError()));
            });
            eA.then(ec, eu).finally(() => ep.dispose());
          });
        }
        async function raceCancellablePromises(eA) {
          let el = -1,
            ec = eA.map((eA, ec) => eA.then((eA) => ((el = ec), eA))),
            eu = await Promise.race(ec);
          return (
            eA.forEach((eA, ec) => {
              ec !== el && eA.cancel();
            }),
            eu
          );
        }
        function raceTimeout(eA, el, ec) {
          let eu,
            ed = setTimeout(() => {
              (null == eu || eu(void 0), null == ec || ec());
            }, el);
          return Promise.race([
            eA.finally(() => clearTimeout(ed)),
            new Promise((eA) => (eu = eA)),
          ]);
        }
        function asPromise(eA) {
          return new Promise((el, ec) => {
            let eu = eA();
            isThenable(eu) ? eu.then(el, ec) : el(eu);
          });
        }
        let Throttler = class Throttler {
          constructor() {
            ((this.activePromise = void 0),
              (this.queuedPromise = void 0),
              (this.queuedPromiseFactory = void 0));
          }
          queue(eA) {
            if (this.activePromise) {
              if (((this.queuedPromiseFactory = eA), !this.queuedPromise)) {
                let onComplete = () => {
                  this.queuedPromise = void 0;
                  let eA = this.queue(this.queuedPromiseFactory);
                  return ((this.queuedPromiseFactory = void 0), eA);
                };
                this.queuedPromise = new Promise((eA) => {
                  this.activePromise.then(onComplete, onComplete).then(eA);
                });
              }
              return new Promise((eA, el) => {
                this.queuedPromise.then(eA, el);
              });
            }
            return (
              (this.activePromise = eA()),
              new Promise((eA, el) => {
                this.activePromise.then(
                  (el) => {
                    ((this.activePromise = void 0), eA(el));
                  },
                  (eA) => {
                    ((this.activePromise = void 0), el(eA));
                  },
                );
              })
            );
          }
        };
        el.Throttler = Throttler;
        let Sequencer = class Sequencer {
          constructor() {
            this.current = Promise.resolve(void 0);
          }
          queue(eA) {
            return (this.current = this.current.then(
              () => eA(),
              () => eA(),
            ));
          }
        };
        el.Sequencer = Sequencer;
        let SequencerByKey = class SequencerByKey {
          constructor() {
            this.promiseMap = new Map();
          }
          queue(eA, el) {
            var ec;
            let eu = (
              null != (ec = this.promiseMap.get(eA)) ? ec : Promise.resolve()
            )
              .catch(() => {})
              .then(el)
              .finally(() => {
                this.promiseMap.get(eA) === eu && this.promiseMap.delete(eA);
              });
            return (this.promiseMap.set(eA, eu), eu);
          }
        };
        el.SequencerByKey = SequencerByKey;
        let timeoutDeferred = (eA, el) => {
            let ec = !0,
              eu = setTimeout(() => {
                ((ec = !1), el());
              }, eA);
            return {
              isTriggered: () => ec,
              dispose: () => {
                (clearTimeout(eu), (ec = !1));
              },
            };
          },
          microtaskDeferred = (eA) => {
            let el = !0;
            return (
              queueMicrotask(() => {
                el && ((el = !1), eA());
              }),
              {
                isTriggered: () => el,
                dispose: () => {
                  el = !1;
                },
              }
            );
          };
        el.MicrotaskDelay = Symbol("MicrotaskDelay");
        let Delayer = class Delayer {
          constructor(eA) {
            ((this.defaultDelay = eA),
              (this.deferred = void 0),
              (this.completionPromise = void 0),
              (this.doResolve = void 0),
              (this.doReject = void 0),
              (this.task = void 0));
          }
          trigger(eA, ec = this.defaultDelay) {
            ((this.task = eA),
              this.cancelTimeout(),
              this.completionPromise ||
                (this.completionPromise = new Promise((eA, el) => {
                  ((this.doResolve = eA), (this.doReject = el));
                }).then(() => {
                  if (
                    ((this.completionPromise = void 0),
                    (this.doResolve = void 0),
                    this.task)
                  ) {
                    let eA = this.task;
                    return ((this.task = void 0), eA());
                  }
                })));
            let fn = () => {
              var eA;
              ((this.deferred = void 0),
                null == (eA = this.doResolve) || eA.call(this, void 0));
            };
            return (
              (this.deferred =
                ec === el.MicrotaskDelay
                  ? microtaskDeferred(fn)
                  : timeoutDeferred(ec, fn)),
              this.completionPromise
            );
          }
          isTriggered() {
            var eA;
            return !!(null == (eA = this.deferred) ? void 0 : eA.isTriggered());
          }
          cancel() {
            (this.cancelTimeout(),
              this.completionPromise &&
                (this.doReject && this.doReject(new ed.CancellationError()),
                (this.completionPromise = void 0)));
          }
          cancelTimeout() {
            var eA;
            (null == (eA = this.deferred) || eA.dispose(),
              (this.deferred = void 0));
          }
          dispose() {
            this.cancel();
          }
        };
        el.Delayer = Delayer;
        let ThrottledDelayer = class ThrottledDelayer {
          constructor(eA) {
            ((this.delayer = new Delayer(eA)),
              (this.throttler = new Throttler()));
          }
          trigger(eA, el) {
            return this.delayer.trigger(() => this.throttler.queue(eA), el);
          }
          isTriggered() {
            return this.delayer.isTriggered();
          }
          cancel() {
            this.delayer.cancel();
          }
          dispose() {
            this.delayer.dispose();
          }
        };
        el.ThrottledDelayer = ThrottledDelayer;
        let Barrier = class Barrier {
          constructor() {
            ((this._isOpen = !1),
              (this._promise = new Promise((eA, el) => {
                this._completePromise = eA;
              })));
          }
          isOpen() {
            return this._isOpen;
          }
          open() {
            ((this._isOpen = !0), this._completePromise(!0));
          }
          wait() {
            return this._promise;
          }
        };
        el.Barrier = Barrier;
        let AutoOpenBarrier = class AutoOpenBarrier extends Barrier {
          constructor(eA) {
            (super(), (this._timeout = setTimeout(() => this.open(), eA)));
          }
          open() {
            (clearTimeout(this._timeout), super.open());
          }
        };
        function timeout(eA, el) {
          return el
            ? new Promise((ec, eu) => {
                let ep = setTimeout(() => {
                    (eg.dispose(), ec());
                  }, eA),
                  eg = el.onCancellationRequested(() => {
                    (clearTimeout(ep),
                      eg.dispose(),
                      eu(new ed.CancellationError()));
                  });
              })
            : createCancelablePromise((el) => timeout(eA, el));
        }
        function disposableTimeout(eA, el = 0) {
          let ec = setTimeout(eA, el);
          return ep.Disposable.create(() => clearTimeout(ec));
        }
        function sequence(eA) {
          let el = [],
            ec = 0,
            eu = eA.length;
          function next() {
            return ec < eu ? eA[ec++]() : void 0;
          }
          function thenHandler(eA) {
            void 0 !== eA && void 0 !== eA && el.push(eA);
            let ec = next();
            return ec ? ec.then(thenHandler) : Promise.resolve(el);
          }
          return Promise.resolve(void 0).then(thenHandler);
        }
        function first(eA, el = (eA) => !!eA, ec) {
          let eu = 0,
            ed = eA.length,
            loop = () =>
              eu >= ed
                ? Promise.resolve(ec)
                : Promise.resolve((0, eA[eu++])()).then((eA) =>
                    el(eA) ? Promise.resolve(eA) : loop(),
                  );
          return loop();
        }
        function firstParallel(eA, el = (eA) => !!eA, ec) {
          if (0 === eA.length) return Promise.resolve(ec);
          let eu = eA.length,
            finish = () => {
              var el, ec;
              for (let ed of ((eu = -1), eA))
                null == (ec = (el = ed).cancel) || ec.call(el);
            };
          return new Promise((ed, ep) => {
            for (let eg of eA)
              eg.then((eA) => {
                --eu >= 0 && el(eA) ? (finish(), ed(eA)) : 0 === eu && ed(ec);
              }).catch((eA) => {
                --eu >= 0 && (finish(), ep(eA));
              });
          });
        }
        el.AutoOpenBarrier = AutoOpenBarrier;
        let Limiter = class Limiter {
          constructor(eA) {
            ((this._size = 0),
              (this.maxDegreeOfParalellism = eA),
              (this.outstandingPromises = []),
              (this.runningPromises = 0),
              (this._onDrained = new eg.Emitter()));
          }
          get onDrained() {
            return this._onDrained.event;
          }
          get size() {
            return this._size;
          }
          queue(eA) {
            return (
              this._size++,
              new Promise((el, ec) => {
                (this.outstandingPromises.push({ factory: eA, c: el, e: ec }),
                  this.consume());
              })
            );
          }
          consume() {
            for (
              ;
              this.outstandingPromises.length &&
              this.runningPromises < this.maxDegreeOfParalellism;

            ) {
              let eA = this.outstandingPromises.shift();
              this.runningPromises++;
              let el = eA.factory();
              (el.then(eA.c, eA.e),
                el.then(
                  () => this.consumed(),
                  () => this.consumed(),
                ));
            }
          }
          consumed() {
            (this._size--,
              this.runningPromises--,
              this.outstandingPromises.length > 0
                ? this.consume()
                : this._onDrained.fire());
          }
          dispose() {
            this._onDrained.dispose();
          }
        };
        el.Limiter = Limiter;
        let Queue = class Queue extends Limiter {
          constructor() {
            super(1);
          }
        };
        el.Queue = Queue;
        let TimeoutTimer = class TimeoutTimer {
          constructor(eA, el) {
            ((this._token = -1),
              "function" == typeof eA &&
                "number" == typeof el &&
                this.setIfNotSet(eA, el));
          }
          dispose() {
            this.cancel();
          }
          cancel() {
            -1 !== this._token &&
              (clearTimeout(this._token), (this._token = -1));
          }
          cancelAndSet(eA, el) {
            (this.cancel(),
              (this._token = setTimeout(() => {
                ((this._token = -1), eA());
              }, el)));
          }
          setIfNotSet(eA, el) {
            -1 === this._token &&
              (this._token = setTimeout(() => {
                ((this._token = -1), eA());
              }, el));
          }
        };
        el.TimeoutTimer = TimeoutTimer;
        let IntervalTimer = class IntervalTimer {
          constructor() {
            this._token = -1;
          }
          dispose() {
            this.cancel();
          }
          cancel() {
            -1 !== this._token &&
              (clearInterval(this._token), (this._token = -1));
          }
          cancelAndSet(eA, el) {
            (this.cancel(),
              (this._token = setInterval(() => {
                eA();
              }, el)));
          }
        };
        el.IntervalTimer = IntervalTimer;
        let RunOnceScheduler = class RunOnceScheduler {
          constructor(eA, el) {
            ((this.timeoutToken = -1),
              (this.runner = eA),
              (this.timeout = el),
              (this.timeoutHandler = this.onTimeout.bind(this)));
          }
          dispose() {
            (this.cancel(), (this.runner = void 0));
          }
          cancel() {
            this.isScheduled() &&
              (clearTimeout(this.timeoutToken), (this.timeoutToken = -1));
          }
          schedule(eA = this.timeout) {
            (this.cancel(),
              (this.timeoutToken = setTimeout(this.timeoutHandler, eA)));
          }
          get delay() {
            return this.timeout;
          }
          set delay(eA) {
            this.timeout = eA;
          }
          isScheduled() {
            return -1 !== this.timeoutToken;
          }
          onTimeout() {
            ((this.timeoutToken = -1), this.runner && this.doRun());
          }
          doRun() {
            this.runner && this.runner();
          }
        };
        el.RunOnceScheduler = RunOnceScheduler;
        let ProcessTimeRunOnceScheduler = class ProcessTimeRunOnceScheduler {
          constructor(eA, el) {
            (el % 1e3 != 0 &&
              console.warn(
                `ProcessTimeRunOnceScheduler resolution is 1s, ${el}ms is not a multiple of 1000ms.`,
              ),
              (this.runner = eA),
              (this.timeout = el),
              (this.counter = 0),
              (this.intervalToken = -1),
              (this.intervalHandler = this.onInterval.bind(this)));
          }
          dispose() {
            (this.cancel(), (this.runner = void 0));
          }
          cancel() {
            this.isScheduled() &&
              (clearInterval(this.intervalToken), (this.intervalToken = -1));
          }
          schedule(eA = this.timeout) {
            (eA % 1e3 != 0 &&
              console.warn(
                `ProcessTimeRunOnceScheduler resolution is 1s, ${eA}ms is not a multiple of 1000ms.`,
              ),
              this.cancel(),
              (this.counter = Math.ceil(eA / 1e3)),
              (this.intervalToken = setInterval(this.intervalHandler, 1e3)));
          }
          isScheduled() {
            return -1 !== this.intervalToken;
          }
          onInterval() {
            (this.counter--,
              !(this.counter > 0) &&
                (clearInterval(this.intervalToken),
                (this.intervalToken = -1),
                this.runner && this.runner()));
          }
        };
        el.ProcessTimeRunOnceScheduler = ProcessTimeRunOnceScheduler;
        let RunOnceWorker = class RunOnceWorker extends RunOnceScheduler {
          constructor(eA, el) {
            (super(eA, el), (this.units = []));
          }
          work(eA) {
            (this.units.push(eA), this.isScheduled() || this.schedule());
          }
          doRun() {
            let eA = this.units;
            ((this.units = []), this.runner && this.runner(eA));
          }
          dispose() {
            ((this.units = []), super.dispose());
          }
        };
        async function retry(eA, el, ec) {
          let eu;
          for (let ed = 0; ed < ec; ed++)
            try {
              return await eA();
            } catch (eA) {
              ((eu = eA), await timeout(el));
            }
          throw eu;
        }
        el.RunOnceWorker = RunOnceWorker;
        let TaskSequentializer = class TaskSequentializer {
          hasPending(eA) {
            return (
              !!this._pending &&
              ("number" == typeof eA
                ? this._pending.taskId === eA
                : !!this._pending)
            );
          }
          get pending() {
            return this._pending ? this._pending.promise : void 0;
          }
          cancelPending() {
            var eA;
            null == (eA = this._pending) || eA.cancel();
          }
          setPending(eA, el, ec) {
            return (
              (this._pending = {
                taskId: eA,
                cancel: () => (null == ec ? void 0 : ec()),
                promise: el,
              }),
              el.then(
                () => this.donePending(eA),
                () => this.donePending(eA),
              ),
              el
            );
          }
          donePending(eA) {
            this._pending &&
              eA === this._pending.taskId &&
              ((this._pending = void 0), this.triggerNext());
          }
          triggerNext() {
            if (this._next) {
              let eA = this._next;
              ((this._next = void 0),
                eA.run().then(eA.promiseResolve, eA.promiseReject));
            }
          }
          setNext(eA) {
            if (this._next) this._next.run = eA;
            else {
              let el,
                ec,
                eu = new Promise((eA, eu) => {
                  ((el = eA), (ec = eu));
                });
              this._next = {
                run: eA,
                promise: eu,
                promiseResolve: el,
                promiseReject: ec,
              };
            }
            return this._next.promise;
          }
        };
        el.TaskSequentializer = TaskSequentializer;
        let IntervalCounter = class IntervalCounter {
          constructor(eA, el = () => Date.now()) {
            ((this.interval = eA),
              (this.nowFn = el),
              (this.lastIncrementTime = 0),
              (this.value = 0));
          }
          increment() {
            let eA = this.nowFn();
            return (
              eA - this.lastIncrementTime > this.interval &&
                ((this.lastIncrementTime = eA), (this.value = 0)),
              this.value++,
              this.value
            );
          }
        };
        el.IntervalCounter = IntervalCounter;
        let DeferredPromise = class DeferredPromise {
          get isRejected() {
            return this.rejected;
          }
          get isResolved() {
            return this.resolved;
          }
          get isSettled() {
            return this.rejected || this.resolved;
          }
          constructor() {
            ((this.rejected = !1),
              (this.resolved = !1),
              (this.p = new Promise((eA, el) => {
                ((this.completeCallback = eA), (this.errorCallback = el));
              })));
          }
          complete(eA) {
            return new Promise((el) => {
              (this.completeCallback(eA), (this.resolved = !0), el());
            });
          }
          error(eA) {
            return new Promise((el) => {
              (this.errorCallback(eA), (this.rejected = !0), el());
            });
          }
          cancel() {
            new Promise((eA) => {
              (this.errorCallback(new ed.CancellationError()),
                (this.rejected = !0),
                eA());
            });
          }
        };
        ((el.DeferredPromise = DeferredPromise),
          (function (eA) {
            ((eA.settled = async function (eA) {
              let el,
                ec = await Promise.all(
                  eA.map((eA) =>
                    eA.then(
                      (eA) => eA,
                      (eA) => {
                        el || (el = eA);
                      },
                    ),
                  ),
                );
              if (void 0 !== el) throw el;
              return ec;
            }),
              (eA.withAsyncBody = function (eA) {
                return new Promise(async (el, ec) => {
                  try {
                    await eA(el, ec);
                  } catch (eA) {
                    ec(eA);
                  }
                });
              }));
          })(eu || (el.Promises = eu = {})));
      },
      15694(eA, el, ec) {
        "use strict";
        var eu;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.CancellationTokenSource =
            el.CancellationToken =
            el.CancellationError =
              void 0),
          (el.cancelled = cancelled),
          (el.isCancelled = isCancelled),
          (el.checkCancelled = checkCancelled));
        let ed = ec(74525),
          ep = ec(96771);
        let CancellationError = class CancellationError extends Error {
          constructor() {
            (super("Canceled"), (this.name = this.message));
          }
        };
        el.CancellationError = CancellationError;
        let eg = Object.freeze(
          Object.assign(
            function (eA, el) {
              let ec = setTimeout(eA.bind(el), 0);
              return {
                dispose() {
                  clearTimeout(ec);
                },
              };
            },
            { maxListeners: 0 },
          ),
        );
        !(function (eA) {
          ((eA.None = Object.freeze({
            isCancellationRequested: !1,
            onCancellationRequested: ed.Event.None,
          })),
            (eA.Cancelled = Object.freeze({
              isCancellationRequested: !0,
              onCancellationRequested: eg,
            })));
        })(eu || (el.CancellationToken = eu = {}));
        let MutableToken = class MutableToken {
          constructor() {
            this._isCancelled = !1;
          }
          cancel() {
            !this._isCancelled &&
              ((this._isCancelled = !0),
              this._emitter &&
                (this._emitter.fire(void 0), (this._emitter = void 0)));
          }
          get isCancellationRequested() {
            return this._isCancelled;
          }
          get onCancellationRequested() {
            return this._isCancelled
              ? eg
              : (this._emitter || (this._emitter = new ep.Emitter()),
                this._emitter.event);
          }
        };
        let CancellationTokenSource = class CancellationTokenSource {
          get token() {
            return (
              this._token || (this._token = new MutableToken()),
              this._token
            );
          }
          cancel() {
            this._token
              ? this._token !== eu.Cancelled && this._token.cancel()
              : (this._token = eu.Cancelled);
          }
          dispose() {
            this.cancel();
          }
        };
        el.CancellationTokenSource = CancellationTokenSource;
        let eh = "Cancelled";
        function cancelled() {
          return Error(eh);
        }
        function isCancelled(eA) {
          return !!eA && eA.message === eh;
        }
        function checkCancelled(eA) {
          if (eA && eA.isCancellationRequested) throw cancelled();
        }
      },
      96771(eA, el, ec) {
        "use strict";
        var eu;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.AsyncEmitter = el.WaitUntilEvent = el.Emitter = void 0));
        let ed = ec(74525);
        let Emitter = class Emitter {
          constructor(eA) {
            ((this._options = eA),
              (this._disposed = !1),
              (this._leakWarnCountdown = 0));
          }
          get event() {
            return (
              this._event ||
                (this._event = Object.assign(
                  (eA, el, ec) => {
                    (this._callbacks ||
                      (this._callbacks = new ed.CallbackList()),
                      this._options &&
                        this._options.onFirstListenerAdd &&
                        this._callbacks.isEmpty() &&
                        this._options.onFirstListenerAdd(this),
                      this._callbacks.add(eA, el));
                    let eu = this.checkMaxListeners(this._event.maxListeners),
                      ep = {
                        dispose: () => {
                          (eu && eu(),
                            (ep.dispose = Emitter._noop),
                            !this._disposed &&
                              (this._callbacks.remove(eA, el),
                              (ep.dispose = Emitter._noop),
                              this._options &&
                                this._options.onLastListenerRemove &&
                                this._callbacks.isEmpty() &&
                                this._options.onLastListenerRemove(this)));
                        },
                      };
                    return (Array.isArray(ec) && ec.push(ep), ep);
                  },
                  { maxListeners: Emitter.LEAK_WARNING_THRESHHOLD },
                )),
              this._event
            );
          }
          checkMaxListeners(eA) {
            if (0 === eA || !this._callbacks) return;
            let el = this._callbacks.length;
            if (el <= eA) return;
            let ec = this.pushLeakingStack();
            if (
              ((this._leakWarnCountdown -= 1), this._leakWarnCountdown <= 0)
            ) {
              let ec;
              this._leakWarnCountdown = 0.5 * eA;
              let eu = 0;
              (this._leakingStacks.forEach((eA, el) => {
                (!ec || eu < eA) && ((ec = el), (eu = eA));
              }),
                console.warn(
                  `Possible Emitter memory leak detected. ${el} listeners added. Use event.maxListeners to increase the limit (${eA}). MOST frequent listener (${eu}):`,
                ),
                console.warn(ec));
            }
            return ec;
          }
          pushLeakingStack() {
            this._leakingStacks || (this._leakingStacks = new Map());
            let eA = Error().stack.split("\n").slice(3).join("\n"),
              el = this._leakingStacks.get(eA) || 0;
            return (
              this._leakingStacks.set(eA, el + 1),
              () => this.popLeakingStack(eA)
            );
          }
          popLeakingStack(eA) {
            if (!this._leakingStacks) return;
            let el = this._leakingStacks.get(eA) || 0;
            this._leakingStacks.set(eA, el - 1);
          }
          fire(eA) {
            this._callbacks && this._callbacks.invoke(eA);
          }
          async sequence(eA) {
            if (this._callbacks) {
              for (let el of this._callbacks) if (!(await eA(el))) break;
            }
          }
          dispose() {
            (this._leakingStacks &&
              (this._leakingStacks.clear(), (this._leakingStacks = void 0)),
              this._callbacks &&
                (this._callbacks.dispose(), (this._callbacks = void 0)),
              (this._disposed = !0));
          }
        };
        ((el.Emitter = Emitter),
          (Emitter.LEAK_WARNING_THRESHHOLD = 175),
          (Emitter._noop = function () {}),
          (function (eA) {
            eA.fire = async function (eA, el, ec) {
              let eu = [],
                ed = Object.assign(el, {
                  waitUntil: (eA) => {
                    if (Object.isFrozen(eu))
                      throw Error("waitUntil cannot be called asynchronously.");
                    eu.push(eA);
                  },
                });
              try {
                (eA.fire(ed), Object.freeze(eu));
              } finally {
                delete ed.waitUntil;
              }
              eu.length &&
                (void 0 !== ec
                  ? await Promise.race([
                      Promise.all(eu),
                      new Promise((eA) => setTimeout(eA, ec)),
                    ])
                  : await Promise.all(eu));
            };
          })(eu || (el.WaitUntilEvent = eu = {})));
        let ep = ec(15694);
        let AsyncEmitter = class AsyncEmitter extends Emitter {
          fire(eA, el = ep.CancellationToken.None, ec) {
            let eu = this._callbacks;
            if (!eu) return Promise.resolve();
            let ed = [...eu];
            return this.deliveryQueue
              ? (this.deliveryQueue = this.deliveryQueue.then(() =>
                  this.deliver(ed, eA, el, ec),
                ))
              : (this.deliveryQueue = this.deliver(ed, eA, el, ec));
          }
          async deliver(eA, el, ec, eu) {
            for (let ed of eA) {
              if (ec.isCancellationRequested) return;
              let eA = [],
                ep = Object.assign(el, {
                  waitUntil: (el) => {
                    if (Object.isFrozen(eA))
                      throw Error("waitUntil cannot be called asynchronously.");
                    (eu && (el = eu(el, ed)), eA.push(el));
                  },
                });
              try {
                (ed(el), Object.freeze(eA));
              } catch (eA) {
                console.error(eA);
              } finally {
                delete ep.waitUntil;
              }
              if (!eA.length) return;
              try {
                await Promise.all(eA);
              } catch (eA) {
                console.error(eA);
              }
            }
          }
        };
        el.AsyncEmitter = AsyncEmitter;
      },
      74525(eA, el) {
        "use strict";
        var ec;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.CallbackList = el.Event = void 0),
          (function (eA) {
            let el = { dispose() {} };
            ((eA.None = Object.assign(
              function () {
                return el;
              },
              {
                get maxListeners() {
                  return 0;
                },
                set maxListeners(maxListeners) {},
              },
            )),
              (eA.map = function (eA, el) {
                return Object.assign(
                  (ec, eu, ed) => eA((eA) => ec.call(eu, el(eA)), void 0, ed),
                  { maxListeners: 0 },
                );
              }));
          })(ec || (el.Event = ec = {})));
        let CallbackList = class CallbackList {
          get length() {
            return (this._callbacks && this._callbacks.length) || 0;
          }
          add(eA, el, ec) {
            (this._callbacks || ((this._callbacks = []), (this._contexts = [])),
              this._callbacks.push(eA),
              this._contexts.push(el),
              Array.isArray(ec) &&
                ec.push({ dispose: () => this.remove(eA, el) }));
          }
          remove(eA, el) {
            if (!this._callbacks) return;
            let ec = !1;
            for (let eu = 0; eu < this._callbacks.length; eu++)
              if (this._callbacks[eu] === eA)
                if (this._contexts[eu] === el) {
                  (this._callbacks.splice(eu, 1), this._contexts.splice(eu, 1));
                  return;
                } else ec = !0;
            if (ec)
              throw Error(
                "When adding a listener with a context, you should remove it with the same context",
              );
          }
          [Symbol.iterator]() {
            if (!this._callbacks) return [][Symbol.iterator]();
            let eA = this._callbacks.slice(0),
              el = this._contexts.slice(0);
            return eA
              .map(
                (eA, ec) =>
                  (...eu) =>
                    eA.apply(el[ec], eu),
              )
              [Symbol.iterator]();
          }
          invoke(...eA) {
            let el = [];
            for (let ec of this)
              try {
                el.push(ec(...eA));
              } catch (eA) {
                console.error(eA);
              }
            return el;
          }
          isEmpty() {
            return !this._callbacks || 0 === this._callbacks.length;
          }
          dispose() {
            ((this._callbacks = void 0), (this._contexts = void 0));
          }
        };
        el.CallbackList = CallbackList;
      },
      5935(eA, el, ec) {
        "use strict";
        var eu;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.DisposableCollection = el.Disposable = void 0));
        let ed = ec(96771);
        !(function (eA) {
          function create(eA) {
            return { dispose: eA };
          }
          ((eA.is = function (eA) {
            return (
              !!eA &&
              "object" == typeof eA &&
              "dispose" in eA &&
              "function" == typeof eA.dispose
            );
          }),
            (eA.create = create),
            (eA.NULL = create(() => {})));
        })(eu || (el.Disposable = eu = {}));
        let DisposableCollection = class DisposableCollection {
          constructor(...eA) {
            ((this.disposables = []),
              (this.onDisposeEmitter = new ed.Emitter()),
              (this.disposingElements = !1),
              eA.forEach((eA) => this.push(eA)));
          }
          get onDispose() {
            return this.onDisposeEmitter.event;
          }
          checkDisposed() {
            this.disposed &&
              !this.disposingElements &&
              (this.onDisposeEmitter.fire(void 0),
              this.onDisposeEmitter.dispose());
          }
          get disposed() {
            return 0 === this.disposables.length;
          }
          dispose() {
            if (!this.disposed && !this.disposingElements) {
              for (this.disposingElements = !0; !this.disposed; )
                try {
                  this.disposables.pop().dispose();
                } catch (eA) {
                  console.error(eA);
                }
              ((this.disposingElements = !1), this.checkDisposed());
            }
          }
          push(eA) {
            let el = this.disposables;
            el.push(eA);
            let ec = eA.dispose.bind(eA),
              ed = eu.create(() => {
                let ec = el.indexOf(eA);
                (-1 !== ec && el.splice(ec, 1), this.checkDisposed());
              });
            return (
              (eA.dispose = () => {
                (ed.dispose(), (eA.dispose = ec), ec());
              }),
              ed
            );
          }
          pushAll(eA) {
            return eA.map((eA) => this.push(eA));
          }
        };
        el.DisposableCollection = DisposableCollection;
      },
      44943(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.NotFoundError = el.AIError = void 0));
        let eu = ec(80699);
        let AIError = class AIError extends eu.CustomError {
          constructor(eA) {
            super(eA);
          }
        };
        el.AIError = AIError;
        let NotFoundError = class NotFoundError extends AIError {
          constructor(eA) {
            super(eA);
          }
        };
        el.NotFoundError = NotFoundError;
      },
      8461(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Deferred = void 0));
        let Deferred = class Deferred {
          constructor() {
            this.promise = new Promise((eA, el) => {
              ((this.resolve = eA), (this.reject = el));
            });
          }
        };
        el.Deferred = Deferred;
      },
      26052(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.CustomError = void 0));
        let eu = ec(17237);
        let CustomError = class CustomError extends Error {
          constructor(eA, el) {
            (super(eA, el),
              Object.defineProperty(this, "name", {
                value: new.target.name,
                enumerable: !1,
                configurable: !0,
              }),
              eu.ErrorUtil.fixProto(this, new.target.prototype),
              eu.ErrorUtil.fixStack(this));
          }
        };
        el.CustomError = CustomError;
      },
      99600(eA, el) {
        "use strict";
        var ec;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Prioritizeable = void 0),
          (function (eA) {
            async function toPrioritizeable(eA, el) {
              if (eA instanceof Array)
                return Promise.all(eA.map((eA) => toPrioritizeable(eA, el)));
              let ec = await eA;
              return { priority: await el(ec), value: ec };
            }
            function toPrioritizeableSync(eA, el = (eA) => eA.priority) {
              return eA.map((eA) => ({ value: eA, priority: el(eA) }));
            }
            function isValid(eA) {
              return eA.priority > 0;
            }
            function compare(eA, el) {
              return el.priority - eA.priority;
            }
            ((eA.toPrioritizeable = toPrioritizeable),
              (eA.toPrioritizeableSync = toPrioritizeableSync),
              (eA.prioritizeAllSync = function (eA, el) {
                return toPrioritizeableSync(eA, el)
                  .filter(isValid)
                  .sort(compare);
              }),
              (eA.prioritizeAll = async function (eA, el) {
                return (await toPrioritizeable(eA, el))
                  .filter(isValid)
                  .sort(compare);
              }),
              (eA.isValid = isValid),
              (eA.compare = compare));
          })(ec || (el.Prioritizeable = ec = {})));
      },
      79845(eA, el) {
        "use strict";
        var ec;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.AuthenticationType = void 0),
          (function (eA) {
            ((eA.CUSTOM_TOKEN = "custom-token"),
              (eA.WECHAT = "wechat"),
              (eA.EXTERNAL_LINK = "external-link"),
              (eA.EXTERNAL_LINK_V2 = "external-link-v2"),
              (eA.IDE_HOST = "ide-host"),
              (eA.CUSTOM_HOSTNAME = "custom-hostname"),
              (eA.CLI_EXTERNAL_LINK = "cli-external-link"));
          })(ec || (el.AuthenticationType = ec = {})));
      },
      55114(eA, el) {
        "use strict";
        var ec, eu;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.FeatureToggle = el.ProductFeature = void 0),
          (function (eA) {
            ((eA.Chat = "Chat"),
              (eA.InlineChat = "InlineChat"),
              (eA.StatusBar = "StatusBar"),
              (eA.ChatVariable = "ChatVariable"),
              (eA.InlineCompletions = "InlineCompletions"),
              (eA.NesCompletions = "NesCompletions"),
              (eA.MergedNesCompletions = "MergedNesCompletions"),
              (eA.SlashCommand = "SlashCommand"),
              (eA.GenerateCommitMessage = "GenerateCommitMessage"),
              (eA.GenerateReadmeFile = "GenerateReadmeFile"),
              (eA.ConfigServer = "ConfigServer"),
              (eA.StopParamPatch = "StopParamPatch"),
              (eA.OpenAIStyleAPI = "OpenAIStyleAPI"),
              (eA.SecretKeyRequired = "SecretKeyRequired"),
              (eA.MultiFileWithPromptParam = "MultiFileWithPromptParam"),
              (eA.MultiFileWithSeparateParams = "MultiFileWithSeparateParams"),
              (eA.TrimByIndentation = "TrimByIndentation"),
              (eA.ASTForCompletions = "ASTForCompletions"),
              (eA.CompletionsPrefetching = "CompletionsPrefetching"),
              (eA.NESPrefetchingAfterEmptyCompletion =
                "NESPrefetchingAfterEmptyCompletion"),
              (eA.TriggerNESAfterCompletionHasBeenAccepted =
                "TriggerNESAfterCompletionHasBeenAccepted"),
              (eA.CursorPositonPrefetching = "CursorPositonPrefetching"),
              (eA.CompletionsRelatedSnippets = "CompletionsRelatedSnippets"),
              (eA.ImportMetadataForCompletions =
                "ImportMetadataForCompletions"),
              (eA.CompletionItemsForCompletions =
                "CompletionItemsForCompletions"),
              (eA.NesDocumentActiveChangeTrigger =
                "NesDocumentActiveChangeTrigger"),
              (eA.NesCompletionsPrefetching = "NesCompletionsPrefetching"),
              (eA.NesCompletionsJumpToHere = "NesCompletionsJumpToHere"),
              (eA.RemoveBelowExist = "RemoveBelowExist"),
              (eA.NesRepeatFilter = "NesRepeatFilter"),
              (eA.NesRepeatFilterV2 = "NesRepeatFilterV2"),
              (eA.NesRangeFix = "NesRangeFix"),
              (eA.CompletionsResultFusion = "CompletionsResultFusion"),
              (eA.ChatHistory = "ChatHistory"),
              (eA.InlineChatSelectionAppendToResult =
                "InlineChatSelectionAppendToResult"),
              (eA.ChatFollowup = "ChatFollowup"),
              (eA.CRLFCompatible = "CRLFCompatible"),
              (eA.CodeAction = "CodeAction"),
              (eA.CodeActionIDE = "CodeActionIDE"),
              (eA.FloatShortcut = "FloatShortcut"),
              (eA.CodeLens = "CodeLens"),
              (eA.InlineChatIntentRecognition = "InlineChatIntentRecognition"),
              (eA.MultiStepCompletions = "MultiStepCompletions"),
              (eA.Codebase = "Codebase"),
              (eA.UseDefaultModelIfCurrentNotInList =
                "UseDefaultModelIfCurrentNotInList"),
              (eA.Mcp = "Mcp"),
              (eA.McpMarket = "McpMarket"),
              (eA.McpInstallationGuide = "McpInstallationGuide"),
              (eA.DisableMcpSampling = "DisableMcpSampling"),
              (eA.DisableMcpRoots = "DisableMcpRoots"),
              (eA.MemoryManagement = "MemoryManagement"),
              (eA.DisableMemoryPersonalization =
                "DisableMemoryPersonalization"),
              (eA.PoiMap = "PoiMap"),
              (eA.NicknameEditEnabled = "NicknameEditEnabled"),
              (eA.SelectImage = "SelectImage"),
              (eA.SelectFigma = "SelectFigma"),
              (eA.SelectComponent = "SelectComponent"),
              (eA.Aegis = "Aegis"),
              (eA.BillingNotice = "BillingNotice"),
              (eA.VSCodeAuthProvider = "VSCodeAuthProvider"),
              (eA.TerminalChatIDE = "TerminalChatIDE"),
              (eA.InlineChatIDE = "InlineChatIDE"),
              (eA.Integration = "Integration"),
              (eA.PdcFlow = "PdcFlow"),
              (eA.AdditionalPrompt = "AdditionalPrompt"),
              (eA.CustomModel = "CustomModel"),
              (eA.CommandsSmartMerge = "CommandsSmartMerge"),
              (eA.WriteAndReplaceToolIDE = "WriteAndReplaceToolIDE"),
              (eA.GeneralSettings = "GeneralSettings"),
              (eA.Billing = "Billing"),
              (eA.AutoMode = "AutoMode"),
              (eA.isIDE = "isIDE"),
              (eA.WebFetch = "WebFetch"),
              (eA.SummaryWebFetch = "SummaryWebFetch"),
              (eA.WebBrowserFetch = "WebBrowserFetch"),
              (eA.WebSearch = "WebSearch"),
              (eA.DynamicAddWebSearch = "DynamicAddWebSearch"),
              (eA.Skills = "Skills"),
              (eA.SkillSecurityScan = "SkillSecurityScan"),
              (eA.SkillRecommend = "SkillRecommend"),
              (eA.IntentRecommend = "IntentRecommend"),
              (eA.CodeSelectionActions = "CodeSelectionActions"),
              (eA.DisableDeleteFilesTool = "DisableDeleteFilesTool"),
              (eA.DisableHtmlStreamUIShow = "DisableHtmlStreamUIShow"),
              (eA.ProposalAPI = "ProposalAPI"),
              (eA.PreviewUrl = "PreviewUrl"),
              (eA.NESNativeRenderer = "NESNativeRenderer"),
              (eA.EnterpriseDomainLogin = "EnterpriseDomainLogin"),
              (eA.SwitchBySession = "SwitchBySession"),
              (eA.InternationalLogin = "InternationalLogin"),
              (eA.Task = "Task"),
              (eA.CustomModelsJSON = "CustomModelsJSON"),
              (eA.CustomModelIdPrefix = "CustomModelIdPrefix"),
              (eA.CustomModelHideDefaultProvider =
                "CustomModelHideDefaultProvider"),
              (eA.CustomModelProviderLabelI18nOnly =
                "CustomModelProviderLabelI18nOnly"),
              (eA.CloudAgentsSmartMerge = "CloudAgentsSmartMerge"),
              (eA.HideCustomBrandingLogos = "HideCustomBrandingLogos"),
              (eA.CBChatUI = "CBChatUI"),
              (eA.ChatMessageQueue = "ChatMessageQueue"),
              (eA.MessageQueuePluginDispatch = "MessageQueuePluginDispatch"),
              (eA.MessageQueueDeferredDispatch =
                "MessageQueueDeferredDispatch"),
              (eA.TaskList = "TaskList"),
              (eA.Plan = "Plan"),
              (eA.ReplaceFileEscapeNormalization =
                "ReplaceFileEscapeNormalization"),
              (eA.StandaloneTerminal = "StandaloneTerminal"),
              (eA.ReplaceFileChinesePunctuationNormalization =
                "ReplaceFileChinesePunctuationNormalization"),
              (eA.EnhancedCompletionRequest = "EnhancedCompletionRequest"),
              (eA.ReportAfterCancel = "ReportAfterCancel"),
              (eA.DisableTerminalVariable = "DisableTerminalVariable"),
              (eA.RequestBodyGzip = "RequestBodyGzip"),
              (eA.DisableCreditsConsumed = "DisableCreditsConsumed"),
              (eA.ShowCreditsBalance = "ShowCreditsBalance"),
              (eA.DisableCreditsEntry = "DisableCreditsEntry"),
              (eA.DisableManageCenterEntry = "DisableManageCenterEntry"),
              (eA.DisablePublishedApps = "DisablePublishedApps"),
              (eA.DisableArchivedTasks = "DisableArchivedTasks"),
              (eA.DisableCloudAssistantUpgradeBanner =
                "DisableCloudAssistantUpgradeBanner"),
              (eA.DisableTeamsProject = "DisableTeamsProject"),
              (eA.DisableInspirationEntry = "DisableInspirationEntry"),
              (eA.HomePlaybooks = "HomePlaybooks"),
              (eA.GaokaoEnabled = "gaokaoEnabled"),
              (eA.DisableHomePlaybookShuffle = "DisableHomePlaybookShuffle"),
              (eA.DisableCheckin = "DisableCheckin"),
              (eA.DisableActivityBanner = "DisableActivityBanner"),
              (eA.EnableAppearance = "EnableAppearance"),
              (eA.DisableCreditPurchaseGuide = "DisableCreditPurchaseGuide"),
              (eA.ChannelSlack = "ChannelSlack"),
              (eA.ChannelTelegram = "ChannelTelegram"),
              (eA.ChannelDiscord = "ChannelDiscord"),
              (eA.ChannelWechatKf = "ChannelWechatKf"),
              (eA.DisableContextUsage = "DisableContextUsage"),
              (eA.FileHistoryTracker = "FileHistoryTracker"),
              (eA.ShellIntegrationFix = "ShellIntegrationFix"),
              (eA.DisableCodebase = "DisableCodebase"),
              (eA.DisablePlugin = "DisablePlugin"),
              (eA.DisableWechatMiniProgramIntegration =
                "DisableWechatMiniProgramIntegration"),
              (eA.DisableWecomBotIntegration = "DisableWecomBotIntegration"),
              (eA.EnableWechatShareFile = "EnableWechatShareFile"),
              (eA.DisableLoginLegalLinks = "DisableLoginLegalLinks"),
              (eA.DisableBotWebhookUrl = "DisableBotWebhookUrl"),
              (eA.DisableWecomAibot = "DisableWecomAibot"),
              (eA.EnableWecomAibotCustomWsUrl = "EnableWecomAibotCustomWsUrl"),
              (eA.UserGrowth = "UserGrowth"),
              (eA.DisableGrowthBuddySlot = "DisableGrowthBuddySlot"),
              (eA.DisableSlotSystem = "DisableSlotSystem"),
              (eA.LSP = "LSP"),
              (eA.DisableHooks = "DisableHooks"),
              (eA.RepositorySensitivityDetection =
                "RepositorySensitivityDetection"),
              (eA.BannerDecorativeImage = "BannerDecorativeImage"),
              (eA.SystemMemoryMonitor = "SystemMemoryMonitor"),
              (eA.UseNativeAuth = "UseNativeAuth"),
              (eA.ShowAccountManagementMenu = "ShowAccountManagementMenu"),
              (eA.ShowUsageEntry = "ShowUsageEntry"),
              (eA.ImageGen = "ImageGen"),
              (eA.ImageEdit = "ImageEdit"),
              (eA.VideoGen = "VideoGen"),
              (eA.DisableMultiAgentConcurrent = "DisableMultiAgentConcurrent"),
              (eA.DeferToolLoading = "DeferToolLoading"),
              (eA.DnsFallbackLookup = "EnableDnsFallback"),
              (eA.DisableAgentTeam = "DisableAgentTeam"),
              (eA.Agents = "Agents"),
              (eA.RemoteControl = "RemoteControl"),
              (eA.FileDiffHistory = "FileDiffHistory"),
              (eA.ScheduledTasks = "ScheduledTasks"),
              (eA.BillingUpgradeBanner = "BillingUpgradeBanner"),
              (eA.WorkBuddyBanner = "WorkBuddyBanner"),
              (eA.DisableIdentityBootstrap = "DisableIdentityBootstrap"),
              (eA.DisableIdentityCustomization =
                "DisableIdentityCustomization"),
              (eA.AllowIdentityNameEdit = "AllowIdentityNameEdit"),
              (eA.DisableTlsVerification = "DisableTlsVerification"),
              (eA.ShowFileChangesForNonGitRepo =
                "ShowFileChangesForNonGitRepo"),
              (eA.Inspiration = "Inspiration"),
              (eA.Connector = "Connector"),
              (eA.TencentDesignX = "TencentDesignX"),
              (eA.HtmlPreviewShare = "HtmlPreviewShare"),
              (eA.Sandbox = "Sandbox"),
              (eA.SandboxFileVersionManagement =
                "SandboxFileVersionManagement"),
              (eA.SkillManage = "SkillManage"),
              (eA.TencentDocsKnowledge = "TencentDocsKnowledge"),
              (eA.TencentDocsAiEdit = "TencentDocsAiEdit"),
              (eA.TencentDocsAiEditEnterprise = "TencentDocsAiEditEnterprise"),
              (eA.TencentPptxBuiltinDefaultEnabled =
                "TencentPptxBuiltinDefaultEnabled"),
              (eA.TencentLexiangKnowledge = "TencentLexiangKnowledge"),
              (eA.TencentNetDriveKnowledge = "TencentNetDriveKnowledge"),
              (eA.DisableHelpFeedback = "DisableHelpFeedback"),
              (eA.ShowAboutQRCodes = "ShowAboutQRCodes"),
              (eA.DisableDocumentation = "DisableDocumentation"),
              (eA.DisableYuanbaoChannel = "DisableYuanbaoChannel"),
              (eA.DisableYuanbaoSearchEntry = "DisableYuanbaoSearchEntry"),
              (eA.DisableMultimodalGeneration = "DisableMultimodalGeneration"),
              (eA.DefaultModelOptimizationOff = "DefaultModelOptimizationOff"),
              (eA.SystemProxyDetection = "SystemProxyDetection"),
              (eA.DisableShareFeature = "DisableShareFeature"),
              (eA.DisableHomeQuickEntries = "DisableHomeQuickEntries"),
              (eA.EnterpriseConsole = "EnterpriseConsole"),
              (eA.WelcomeAppsConnectors = "WelcomeAppsConnectors"),
              (eA.ContextSummaryAgent = "ContextSummaryAgent"),
              (eA.EnablePreMessageCompact = "enablePreMessageCompact"),
              (eA.DisableExpertManagement = "DisableExpertManagement"),
              (eA.DisableVoiceInput = "DisableVoiceInput"),
              (eA.DisableVoiceOutput = "DisableVoiceOutput"),
              (eA.SkipToolCallSupportCheck = "SkipToolCallSupportCheck"),
              (eA.EnableEnterpriseCustomModelPolicy =
                "EnableEnterpriseCustomModelPolicy"),
              (eA.EnableEnterpriseSkillUploadPolicy =
                "EnableEnterpriseSkillUploadPolicy"),
              (eA.WebFetchRemoteApi = "WebFetchRemoteApi"),
              (eA.EnableEnterpriseLicenseCheck =
                "EnableEnterpriseLicenseCheck"),
              (eA.EnableClawChannelControl = "EnableClawChannelControl"),
              (eA.CodeAdoptionRate = "CodeAdoptionRate"),
              (eA.ChatPromptFrictionAnalysis = "ChatPromptFrictionAnalysis"),
              (eA.Claw = "Claw"),
              (eA.Automation = "Automation"),
              (eA.Discover = "Discover"),
              (eA.AgentMail = "AgentMail"),
              (eA.EnableSecurityCenter = "EnableSecurityCenter"),
              (eA.WeixinPayInterception = "WeixinPayInterception"),
              (eA.IOAImWhitelistEligible = "IOAImWhitelistEligible"),
              (eA.HomePracticeCases = "HomePracticeCases"),
              (eA.HidePresetBuiltinSkills = "HidePresetBuiltinSkills"),
              (eA.DisableUpdateChangelog = "DisableUpdateChangelog"),
              (eA.ProjectLocalTask = "ProjectLocalTask"),
              (eA.EnableProjectPin = "EnableProjectPin"),
              (eA.TodoAssistantDelegate = "TodoAssistantDelegate"),
              (eA.DisableSkillHub = "DisableSkillHub"),
              (eA.DisableStorageUpgradeEntry = "DisableStorageUpgradeEntry"),
              (eA.Space = "Space"),
              (eA.DisableBuiltinPluginMarketplace =
                "DisableBuiltinPluginMarketplace"),
              (eA.EnableClientMenuInAppNavigation =
                "EnableClientMenuInAppNavigation"));
          })(ec || (el.ProductFeature = ec = {})),
          (function (eA) {
            ((eA.SupportHttpsAgentProxy = "SupportHttpsAgentProxy"),
              (eA.ShowFileDiffOnClick = "ShowFileDiffOnClick"),
              (eA.EnableUserMessageTopAlignment =
                "EnableUserMessageTopAlignment"),
              (eA.QueueBanner = "QueueBanner"));
          })(eu || (el.FeatureToggle = eu = {})));
      },
    };
  function resolveOriginal(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    if (id === 51147) return resolveOriginal(44943);
    if (id === 17237) return resolveOriginal(93280);
    if (id === 9151)
      return { ...resolveOriginal(79845), ...resolveOriginal(55114) };
    const m = { exports: {} };
    if (factories[id] || scopeFactories[id]) {
      cache.set(id, m);
      if (factories[id]) factories[id](m, m.exports, resolveOriginal);
      else Object.assign(m.exports, scopeFactories[id]());
      return m.exports;
    }
    return (
      runtime.getModule?.(id) ??
      new Proxy(
        {},
        {
          get(_target, key) {
            throw Error(
              "Explicit native authentication dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  }
  function scope52521() {
    const el: any = {};
    const ec = resolveOriginal;
    var eu;
    Object.defineProperty(el, "__esModule", { value: !0 });
    el.AuthenticationManagerImpl = void 0;
    let eg = ec(80699),
      eh = ec(67062),
      ef = ec(51147),
      em = ec(54194),
      eE = ec(9151),
      eC = ec(79814),
      ey = ec(92735),
      ew = ec(42315),
      eB = ec(51098),
      e_ = ec(63525),
      eI = ec(67865),
      ev = (eu = class {
        constructor() {
          ((this.authenticationStorages = []),
            (this.loggedOut = !1),
            (this.refreshInFlight = !1),
            (this.accountSwitchInFlight = !1),
            (this.loginInFlight = !1),
            (this.subscriptionManager = new em.SubscriptionManager()),
            (this.initializedDeferred = new eg.Deferred()),
            (this.storageSessionRevision = 0),
            (this.loginAttemptRevision = 0),
            (this.authOperationRevision = 0),
            (this.committedLoginRevision = 0),
            (this.sessionPersistenceTail = Promise.resolve()),
            (this.disposed = !1),
            (this.initialized = this.initializedDeferred.promise),
            (this.currentSessionSubject = new ew.BehaviorSubject(void 0)),
            (this.authStorageResolved = !1));
        }
        init() {
          (this.logger.setContext("AuthenticationManager"),
            this.doInit().catch((eA) => {
              this.logger.warn(
                "Failed to initialize authentication session:",
                eA,
              );
            }));
        }
        async doInit() {
          var eA;
          let el,
            ec = await this.getAuthenticationStorage(),
            eu = Promise.resolve(),
            ed = !0,
            ep =
              null == ec
                ? void 0
                : ec.storeSessionSubject
                    .pipe(
                      (0, eB.distinctUntilChanged)((eA, el) => {
                        var ec, eu;
                        return (
                          !!(null == (ec = null == eA ? void 0 : eA.auth)
                            ? void 0
                            : ec.accessToken) &&
                          !!(null == (eu = null == el ? void 0 : el.auth)
                            ? void 0
                            : eu.accessToken) &&
                          JSON.stringify(eA) === JSON.stringify(el)
                        );
                      }),
                    )
                    .subscribe((eA) => {
                      var el;
                      if (this.disposed) return;
                      let ec = ++this.storageSessionRevision;
                      (
                        null == (el = null == eA ? void 0 : eA.auth)
                          ? void 0
                          : el.accessToken
                      )
                        ? (this.loggedOut = !1)
                        : ed ||
                          (this.authOperationRevision++,
                          this.loginAttemptRevision++,
                          (this.loggedOut = !0),
                          (this.loginInFlight = !1),
                          (this.accountSwitchInFlight = !1),
                          this.refreshTokenTimer &&
                            (this.refreshTokenTimer.cancel(),
                            (this.refreshTokenTimer = void 0)),
                          this.clearPendingSign(),
                          this.currentSessionSubject.next(void 0));
                      let ep = eu.then(async () => {
                        this.disposed ||
                          ec !== this.storageSessionRevision ||
                          (eA && this.loggedOut) ||
                          (await this.productEnvService.switchBySession(eA),
                          !this.disposed &&
                            ec === this.storageSessionRevision &&
                            eA &&
                            this.currentSessionSubject.next(eA));
                      });
                      ((eu = ep.catch((eA) => {
                        this.logger.warn(
                          "Failed to apply stored session update:",
                          eA,
                        );
                      })),
                        ep
                          .then(async () => {
                            this.disposed ||
                              ec !== this.storageSessionRevision ||
                              !eA ||
                              (await this.scheduleRefreshSession(!0),
                              ec === this.storageSessionRevision &&
                                (await this.syncProductAfterSessionChange(eA)));
                          })
                          .catch((eA) => {
                            this.logger.warn(
                              "Failed to finish stored session update:",
                              eA,
                            );
                          }));
                    });
          ep && this.subscriptionManager.addSubscription(ep);
          let eg = this.currentSessionSubject.subscribe((eA) => {
            var el, ec, eu;
            (null == (el = null == eA ? void 0 : eA.account)
              ? void 0
              : el.uid) &&
              (null == (ec = this.filePathService) ||
                ec.setCurrentUserId(
                  null == (eu = null == eA ? void 0 : eA.account)
                    ? void 0
                    : eu.uid,
                ));
          });
          this.subscriptionManager.addSubscription(eg);
          try {
            el = await (null == ec ? void 0 : ec.restore());
          } finally {
            ed = !1;
          }
          let eh = this.productManager.configuration.getValue();
          ((null == (eA = null == eh ? void 0 : eh.productFeatures)
            ? void 0
            : eA[eE.ProductFeature.SwitchBySession]) &&
            (await this.productEnvService.switchBySession(el)),
            this.currentSessionSubject.next(el),
            this.initializedDeferred.resolve());
        }
        async checkNetworkConnectivity() {
          var eA;
          let el = await this.getAuthenticationProvider();
          return "function" ==
            typeof (null == el ? void 0 : el.checkNetworkConnectivity)
            ? null == (eA = null == el ? void 0 : el.checkNetworkConnectivity)
              ? void 0
              : eA.call(el)
            : [null, !0];
        }
        async getLoginUrl() {
          try {
            let eA = await this.getAuthenticationProvider();
            return null == eA ? void 0 : eA.lastAuthUrl;
          } catch (eA) {
            return;
          }
        }
        async getLastBrowserOpenSuccess() {
          try {
            let eA = await this.getAuthenticationProvider(),
              el = null == eA ? void 0 : eA.lastBrowserOpenSuccess;
            return !1 !== el;
          } catch (eA) {
            return !0;
          }
        }
        cancelLogin() {
          (this.logger.info("[AuthenticationManager] cancelLogin called"),
            this.loginAttemptRevision++,
            this.clearPendingSign(),
            (this.loginInFlight = !1),
            this.clearLastAuthUrl());
        }
        async clearLastAuthUrl() {
          try {
            let eA = await this.getAuthenticationProvider();
            eA && "lastAuthUrl" in eA && (eA.lastAuthUrl = void 0);
          } catch (eA) {}
        }
        async login(eA) {
          var el, ec, eu, ed, ep;
          this.loginInFlight &&
            (this.logger.info(
              "[AuthenticationManager] Login already in progress, cancelling previous one before starting new",
            ),
            this.cancelLogin());
          let eg = ++this.loginAttemptRevision,
            eh = ++this.authOperationRevision;
          ((this.loggedOut = !1),
            (this.loginInFlight = !0),
            (this.accountSwitchInFlight = !1),
            this.clearPendingSign());
          let ef = await this.getAuthenticationProvider(eA);
          if (
            eg !== this.loginAttemptRevision ||
            eh !== this.authOperationRevision
          )
            return !1;
          let em = this.traceService.startTrace(ey.SPAN_LOGIN);
          this.logger.info(`[${em.traceId}] Start login...`);
          try {
            this.pendingSignContext = {
              type: null == eA ? void 0 : eA.type,
              abortController:
                null != (el = null == eA ? void 0 : eA.abortController)
                  ? el
                  : new AbortController(),
              traceSpan: em,
            };
            let eE = await ef.createSession(this.pendingSignContext);
            if (!eE) return (em.markAsFailed(), !1);
            if (
              eg !== this.loginAttemptRevision ||
              eh !== this.authOperationRevision
            )
              return (
                em.markAsFailed(),
                this.logger.info(
                  "[AuthenticationManager] Discard login: a newer auth operation won",
                ),
                !1
              );
            eE.auth.lastRefreshTime = Date.now();
            let eC = !1;
            if (
              (await this.storeSession(eE, em, void 0, {
                beforeStore: () =>
                  eg === this.loginAttemptRevision &&
                  eh === this.authOperationRevision &&
                  ((this.loggedOut = !1), !0),
                afterStore: () => {
                  eg !== this.loginAttemptRevision ||
                    eh !== this.authOperationRevision ||
                    this.loggedOut ||
                    (this.committedLoginRevision++, (eC = !0));
                },
              }),
              !eC ||
                eg !== this.loginAttemptRevision ||
                eh !== this.authOperationRevision ||
                this.loggedOut)
            )
              return (
                em.markAsFailed(),
                this.logger.info(
                  "[AuthenticationManager] Login was superseded by a concurrent logout",
                ),
                !1
              );
            return (
              em.markAsSuccessful(),
              this.eventService.report(ey.Events.UserAuthAction, {
                userId: (null == (ec = eE.account) ? void 0 : ec.uid) || "",
                username:
                  (null == (eu = eE.account) ? void 0 : eu.nickname) || "",
                userNickname:
                  (null == (ed = eE.account) ? void 0 : ed.nickname) || "",
                enterpriseId:
                  (null == (ep = eE.account) ? void 0 : ep.enterpriseId) || "",
                action: ey.UserAuthActionType.Login,
                actionAt: Date.now(),
              }),
              this.currentSessionSubject.next(eE),
              this.notifier.info("Successfully signed in."),
              !0
            );
          } catch (el) {
            return (
              em.markAsFailed(el),
              this.logger.error(`sign in error: ${el}`),
              el instanceof eI.CanceledError ||
                (el instanceof eI.SignLicenseError
                  ? this.notifier.error(el.msg)
                  : this.notifier.error("Login failed: {0}", [String(el)])),
              (null == eA ? void 0 : eA.errorHandler) && eA.errorHandler(el),
              !1
            );
          } finally {
            eg === this.loginAttemptRevision && (this.loginInFlight = !1);
          }
        }
        async logout() {
          var eA, el, ec, eu;
          let ed;
          this.authOperationRevision++;
          let ep = this.committedLoginRevision,
            eg = this.currentSessionSubject.getValue();
          ((this.loggedOut = !0),
            (this.loginInFlight = !1),
            (this.accountSwitchInFlight = !1),
            this.refreshTokenTimer &&
              (this.refreshTokenTimer.cancel(),
              (this.refreshTokenTimer = void 0)),
            this.clearPendingSign());
          let eh = await this.getAuthenticationStorage();
          if (
            (this.eventService.report(ey.Events.UserAuthAction, {
              userId:
                (null == (eA = null == eg ? void 0 : eg.account)
                  ? void 0
                  : eA.uid) || "",
              username:
                (null == (el = null == eg ? void 0 : eg.account)
                  ? void 0
                  : el.nickname) || "",
              userNickname:
                (null == (ec = null == eg ? void 0 : eg.account)
                  ? void 0
                  : ec.nickname) || "",
              enterpriseId:
                (null == (eu = null == eg ? void 0 : eg.account)
                  ? void 0
                  : eu.enterpriseId) || "",
              action: ey.UserAuthActionType.Logout,
              actionAt: Date.now(),
            }),
            (null == eh ? void 0 : eh.beginLogout) &&
              (await this.runSessionPersistence(async () => {
                var eA;
                ep === this.committedLoginRevision &&
                  (ed = await (null == (eA = eh.beginLogout)
                    ? void 0
                    : eA.call(eh)));
              })),
            eg && ep === this.committedLoginRevision)
          )
            try {
              await (await this.getAuthenticationProvider()).removeSession(eg);
            } catch (eA) {
              this.logger.warn("remove session error:", eA);
            }
          (await this.runSessionPersistence(
            async () =>
              ep === this.committedLoginRevision &&
              !1 !==
                (await (null == eh ? void 0 : eh.clean({ logoutToken: ed }))),
          )) &&
            ((this.loggedOut = !0), this.currentSessionSubject.next(void 0));
        }
        async refreshSession() {
          await this.scheduleRefreshSession(!0);
        }
        async switchAccount(eA) {
          var el;
          let ec = this.currentSessionSubject.getValue();
          if (!ec || this.loggedOut) return;
          let eu = ++this.authOperationRevision,
            ed = this.storageSessionRevision,
            ep = null == (el = ec.account) ? void 0 : el.uid;
          ((this.accountSwitchInFlight = !0), this.clearPendingSign());
          let eg = this.traceService.startTrace(ey.SPAN_SWITCH_ACCOUNT);
          this.logger.info(`[${eg.traceId}] Start switch account...`);
          let eh = { abortController: new AbortController(), traceSpan: eg };
          this.pendingSignContext = eh;
          try {
            let el = await this.getAuthenticationProvider(),
              ef = await el.switchAccount(eA, ec, eh);
            if (ef) {
              if (
                eu !== this.authOperationRevision ||
                ed !== this.storageSessionRevision ||
                this.loggedOut ||
                !(await this.storeSession(
                  ef,
                  eg,
                  { preserveLogoutMarker: !0 },
                  {
                    beforeStore: () => {
                      var eA, el;
                      return (
                        !this.disposed &&
                        !this.loggedOut &&
                        eu === this.authOperationRevision &&
                        ed === this.storageSessionRevision &&
                        ep ===
                          (null ==
                          (el =
                            null == (eA = this.currentSessionSubject.getValue())
                              ? void 0
                              : eA.account)
                            ? void 0
                            : el.uid)
                      );
                    },
                  },
                )) ||
                eu !== this.authOperationRevision ||
                this.loggedOut
              )
                return void eg.markAsFailed();
              eg.markAsSuccessful();
            } else eg.markAsFailed();
          } finally {
            (eu === this.authOperationRevision &&
              (this.accountSwitchInFlight = !1),
              this.pendingSignContext === eh &&
                (this.pendingSignContext = void 0));
          }
        }
        async waitAuthSession() {
          return new Promise((eA) => {
            let el = this.currentSessionSubject.subscribe((ec) => {
              ec &&
                (eA(ec),
                setTimeout(() => {
                  el.unsubscribe();
                }, 0));
            });
          });
        }
        buildAuthHeaders(eA, el, ec) {
          let eu = this.currentSessionSubject.getValue();
          if (!eu) return {};
          let { account: ed, auth: ep } = eu,
            eg = {};
          return (
            (null == ed ? void 0 : ed.uid) &&
              (eg[eI.HTTP_HEADER_USER_ID] = ed.uid),
            eA &&
              (null == ep ? void 0 : ep.accessToken) &&
              (eg[eh.HttpHeaders.AUTHORIZATION] = `Bearer ${ep.accessToken}`),
            (null == ed ? void 0 : ed.enterpriseId) &&
              ((eg[eI.HTTP_HEADER_ENTERPRISE_ID] = ed.enterpriseId),
              (eg[eI.HTTP_HEADER_TENANT_ID] = ed.enterpriseId)),
            (null == ep ? void 0 : ep.domain) &&
              (eg[eI.HTTP_HEADER_DOMAIN] = ep.domain),
            el &&
              (null == ed ? void 0 : ed.departmentFullName) &&
              (eg[eI.HTTP_HEADER_DEPARTMENT_INFO] = ed.departmentFullName),
            ec &&
              (null == ep ? void 0 : ep.refreshToken) &&
              (eg["X-Refresh-Token"] = ep.refreshToken),
            eg
          );
        }
        clearPendingSign() {
          this.pendingSignContext &&
            (this.pendingSignContext.abortController.abort(),
            (this.pendingSignContext = void 0));
        }
        async storeSession(eA, el, ec, eu) {
          return this.runSessionPersistence(async () => {
            var ed, ep;
            if (
              (null == (ed = null == eu ? void 0 : eu.beforeStore)
                ? void 0
                : ed.call(eu)) === !1
            )
              return !1;
            let eg = el.startSpan(ey.SPAN_STORAGE_SESSION);
            try {
              let el = await this.getAuthenticationStorage();
              return (
                await (null == el ? void 0 : el.store(eA, ec)),
                null == (ep = null == eu ? void 0 : eu.afterStore) ||
                  ep.call(eu),
                eg.markAsSuccessful(),
                !0
              );
            } catch (eA) {
              throw (eg.markAsFailed(eA), eA);
            }
          });
        }
        runSessionPersistence(eA) {
          let el = this.sessionPersistenceTail.then(eA, eA);
          return (
            (this.sessionPersistenceTail = el.then(
              () => void 0,
              () => void 0,
            )),
            el
          );
        }
        shouldRecoverWorkbuddyAccountMetadata(eA) {
          var el, ec, eu, ed;
          let ep = this.productManager.configuration.getValue(),
            eg =
              null !=
              (eu =
                null ==
                (ec =
                  null == (el = null == ep ? void 0 : ep.authentication)
                    ? void 0
                    : el.attributes)
                  ? void 0
                  : ec.platform)
                ? eu
                : null == ep
                  ? void 0
                  : ep.platform;
          return (
            (0, e_.isWorkbuddyAuthenticationPlatform)(eg) &&
            !(null == (ed = eA.allAccounts) ? void 0 : ed.length)
          );
        }
        async scheduleRefreshSession(eA, el = 5) {
          var ec, ed, ep, eh, ef, em;
          (this.refreshTokenTimer &&
            (this.refreshTokenTimer.cancel(),
            (this.refreshTokenTimer = void 0)),
            el--);
          let eE = this.currentSessionSubject.getValue();
          if (!eE) return;
          if (eA) {
            let eA = eE.auth.lastRefreshTime || 0;
            if (
              Date.now() - eA < 3e4 &&
              !this.shouldRecoverWorkbuddyAccountMetadata(eE)
            )
              return;
          }
          if (!eA) {
            let eA = eE.auth.expiresAt || 0,
              el = 864e5 + Math.floor(10 * Math.random() * 6e4) - 3e5;
            eA - 864e5 < Date.now() &&
              (el = 3e5 + Math.floor(60 * Math.random() * 1e3));
            let ec = el,
              ed = eE.auth.lastRefreshTime || 0;
            (0 == (ec = ed + el < Date.now() ? 0 : ed + el - Date.now()) &&
              ((ec = eu.MIN_REFRESH_DELAY_MS),
              this.logger.info(
                `[AuthenticationManager] Delay immediate refresh to fixed minimum: ${ec}ms`,
              )),
              (ec = Math.max(ec, eu.MIN_REFRESH_DELAY_MS)));
            let ep = (0, eg.timeout)(ec);
            this.refreshTokenTimer = ep;
            try {
              await ep;
            } catch (eA) {
              if (eA instanceof eg.CancellationError) return;
              this.logger.warn(`Token refresh timer error: ${eA}`);
              return;
            }
          }
          if (!(eE = this.currentSessionSubject.getValue()) || this.loggedOut)
            return;
          if (this.accountSwitchInFlight)
            return void this.logger.info(
              "[AuthenticationManager] Skip refresh: account switch is in flight",
            );
          if (this.refreshInFlight)
            return void this.logger.info(
              "[AuthenticationManager] Skip refresh: refresh already in flight",
            );
          let eC = this.storageSessionRevision,
            ew = this.authOperationRevision,
            eB = null == (ec = eE.account) ? void 0 : ec.uid,
            e_ = this.traceService.startTrace(ey.SPAN_REFRESH_SESSION);
          this.logger.info(`[${e_.traceId}] Start refresh session...`);
          let ev = !1,
            eS = 0;
          this.refreshInFlight = !0;
          try {
            let eA = await this.getAuthenticationProvider();
            if (this.accountSwitchInFlight || ew !== this.authOperationRevision)
              return void this.logger.info(
                "[AuthenticationManager] Discard refresh: account operation started before refresh request",
              );
            (this.clearPendingSign(),
              (this.pendingSignContext = {
                abortController: new AbortController(),
                traceSpan: e_,
              }));
            let ec = await eA.refreshSession(eE, this.pendingSignContext);
            if (this.loggedOut || eC !== this.storageSessionRevision)
              return void this.logger.info(
                "[AuthenticationManager] Discard refresh: session changed while refresh was in flight",
              );
            if (ec) {
              let eA =
                  null ==
                  (ep =
                    null == (ed = this.currentSessionSubject.getValue())
                      ? void 0
                      : ed.account)
                    ? void 0
                    : ep.uid,
                el = null == (eh = ec.account) ? void 0 : eh.uid;
              if (eA && el && eA !== el) {
                (this.logger.warn(
                  `Discarded refresh result: uid "${el}" does not match current uid "${eA}"`,
                ),
                  e_.markAsFailed());
                return;
              }
              if (
                ((null == (ef = null == eE ? void 0 : eE.account)
                  ? void 0
                  : ef.idp) &&
                  !(null == (em = ec.account) ? void 0 : em.idp) &&
                  ((ec.account.idp = eE.account.idp),
                  this.logger.info(
                    `Preserved idp field from original session: ${eE.account.idp}`,
                  )),
                (ec.auth.lastRefreshTime = Date.now()),
                !(await this.storeSession(
                  ec,
                  e_,
                  { preserveLogoutMarker: !0 },
                  {
                    beforeStore: () => {
                      var eA, el;
                      return (
                        !this.disposed &&
                        !this.loggedOut &&
                        eC === this.storageSessionRevision &&
                        ew === this.authOperationRevision &&
                        eB ===
                          (null ==
                          (el =
                            null == (eA = this.currentSessionSubject.getValue())
                              ? void 0
                              : eA.account)
                            ? void 0
                            : el.uid)
                      );
                    },
                  },
                )) ||
                  this.disposed ||
                  this.loggedOut)
              ) {
                (e_.markAsFailed(),
                  this.logger.info(
                    "[AuthenticationManager] Discard refresh: session changed before persistence",
                  ));
                return;
              }
              e_.markAsSuccessful();
            } else if (
              (e_.markAsFailed(),
              this.logger.warn("refresh session error"),
              el > 0 && !this.loggedOut)
            ) {
              let eA = 5 - el;
              ((eS = Math.min(5e3 * Math.pow(2, Math.max(0, eA - 1)), 6e4)),
                (ev = !0));
            }
          } catch (eA) {
            (e_.markAsFailed(eA),
              this.logger.warn("refresh session error:", eA),
              eA instanceof eI.UnauthorizedError ||
                !(el > 0) ||
                this.loggedOut ||
                ((eS = Math.min(
                  5e3 * Math.pow(2, Math.max(0, 5 - el - 1)),
                  6e4,
                )),
                (ev = !0)));
          } finally {
            this.refreshInFlight = !1;
          }
          if (ev) {
            if (
              (this.logger.info(
                `[AuthenticationManager] Retry refresh in ${eS}ms`,
              ),
              await (0, eg.wait)(eS),
              this.loggedOut)
            )
              return;
            this.scheduleRefreshSession(eA, el).catch((eA) => {
              this.logger.warn("retry refresh session error:", eA);
            });
          }
        }
        async setAuthenticationProvider(eA) {
          let el;
          for (let ec of this.authenticationProvider.get())
            if ((await ec.getAuthenticationType()).includes(eA)) {
              el = ec;
              break;
            }
          if (!el) {
            let eA = new ef.NotFoundError(
              "No available Authentication Provider found",
            );
            throw (this.logger.error(eA), eA);
          }
          this.customAuthenticationProvider = el;
        }
        async clearAuthenticationProvider() {
          this.customAuthenticationProvider = void 0;
        }
        async getAuthenticationProvider(eA) {
          let el;
          if (this.customAuthenticationProvider)
            return this.customAuthenticationProvider;
          for (let ec of this.authenticationProvider.get())
            if (await ec.support(eA)) {
              el = ec;
              break;
            }
          if (!el) {
            let eA = new ef.NotFoundError(
              "No available Authentication Provider found",
            );
            throw (this.logger.error(eA), eA);
          }
          return el;
        }
        async getAuthenticationStorage() {
          if (this.authStorageResolved) return this.cachedAuthStorage;
          let eA = (
            await eg.Prioritizeable.prioritizeAll(
              this.authenticationStorages,
              async (eA) => {
                try {
                  return await eA.priority();
                } catch (eA) {
                  return 0;
                }
              },
            )
          )
            .filter((eA) => eA.priority > 0)
            .map((eA) => eA.value)[0];
          if (!eA) {
            let eA = new ef.NotFoundError(
              "No available Authentication Storage found",
            );
            throw (this.logger.error(eA), eA);
          }
          return (
            (this.cachedAuthStorage = eA),
            (this.authStorageResolved = !0),
            eA
          );
        }
        async syncProductAfterSessionChange(eA) {
          eA && (await this.productManager.sync(!0));
        }
        dispose() {
          if (!this.disposed) {
            ((this.disposed = !0),
              (this.loggedOut = !0),
              (this.loginInFlight = !1),
              (this.accountSwitchInFlight = !1),
              this.authOperationRevision++,
              this.loginAttemptRevision++,
              this.storageSessionRevision++,
              this.clearPendingSign(),
              this.refreshTokenTimer &&
                (this.refreshTokenTimer.cancel(),
                (this.refreshTokenTimer = void 0)),
              this.subscriptionManager.dispose());
            try {
              this.currentSessionSubject.complete();
            } catch (eA) {
              this.logger.warn("Error completing currentSessionSubject:", eA);
            }
            this.logger.info("AuthenticationManager disposed successfully");
          }
        }
      });
    el.AuthenticationManagerImpl = ev;
    ev.MIN_REFRESH_DELAY_MS = 15e3;
    return el;
  }
  function scope7327() {
    const el: any = {};
    const ec = resolveOriginal;
    var ep;
    let eu, ed;
    Object.defineProperty(el, "__esModule", { value: !0 });
    el.ExternalLinkAuthenticationProvider =
      el.toSignLicenseError =
      el.setLoginStepCallback =
        void 0;
    let ef = ec(80699),
      em = ec(67062),
      eE = ec(9151),
      eC = ec(79814),
      ey = ec(92735),
      ew = ec(22186),
      eB = ec(63525),
      e_ = ec(67865),
      eI = 3e5,
      ev = 1e3,
      eS = 1,
      eQ = 5,
      eD = 0;
    function emitLoginStep(eA, el, ec) {
      eA === eD && (null == eu || eu(el, ec));
    }
    el.setLoginStepCallback = function (eA, el, ec) {
      return (
        (void 0 === eA && void 0 !== el && el !== eD) ||
          (eD++, (eu = eA), (ed = eA ? ec : void 0)),
        eD
      );
    };
    let eT = 10081;
    !(function (eA) {
      ((eA[(eA.RetryFetchToken = 11217)] = "RetryFetchToken"),
        (eA[(eA.RetryFetchAccount = 12151)] = "RetryFetchAccount"),
        (eA[(eA.LicenseSeatLimit = 12005)] = "LicenseSeatLimit"),
        (eA[(eA.LicenseExpired = 11212)] = "LicenseExpired"),
        (eA[(eA.TrialExpired = 11216)] = "TrialExpired"));
    })(ep || (ep = {}));
    let eR = new Set([ep.LicenseSeatLimit, ep.LicenseExpired, ep.TrialExpired]);
    function toSignLicenseError(eA) {
      var el, ec;
      let eu =
        null == (el = null == eA ? void 0 : eA.response) ? void 0 : el.data;
      if (eu && "number" == typeof eu.code && eR.has(eu.code))
        return new e_.SignLicenseError(
          eu.code,
          null != (ec = eu.msg) ? ec : "",
        );
    }
    el.toSignLicenseError = toSignLicenseError;
    let ek = class {
      constructor() {
        this.lastBrowserOpenSuccess = !0;
      }
      init() {
        (this.logger.setContext("ExternalLinkAuthenticationProvider"),
          this.productManager.configuration.subscribe((eA) => {
            this.configuration = eA || {};
          }));
      }
      async checkNetworkConnectivity() {
        var eA, el, ec;
        try {
          let eu =
            null !=
            (ec =
              null ==
              (el =
                null == (eA = this.configuration.authentication)
                  ? void 0
                  : eA.attributes)
                ? void 0
                : el.platform)
              ? ec
              : this.configuration.platform;
          return (
            await this.restOperations.post(
              `/v2${this.prefixPath}/auth/state?platform=${eu}`,
              null,
              { timeout: 5e3 },
            ),
            [null, !0]
          );
        } catch (eu) {
          let eA = "Unknown error";
          eu instanceof Error
            ? (eA = eu.message)
            : "string" == typeof eu
              ? (eA = eu)
              : "object" == typeof eu &&
                null !== eu &&
                "toString" in eu &&
                (eA = eu.toString());
          let el = eu;
          if (el && el.response && el.response.data) {
            let eA = el.response.data;
            if (eA && "object" == typeof eA && "code" in eA && eA.code)
              return (
                console.error(`Error with code ${eA.code}: ${el.message}`),
                [`Error: ${el.message}`, null]
              );
            this.logger.error(`Error details: ${JSON.stringify(eA)}`);
          }
          let ec = eA.toLowerCase();
          if (ec.includes("proxy"))
            return (
              this.logger.error("Proxy connection error detected"),
              [`Network connectivity test failed: ${eA}`, null]
            );
          if (
            ec.includes("socket") ||
            ec.includes("connect") ||
            ec.includes("network") ||
            ec.includes("timeout")
          )
            return (
              this.logger.error(" Network connection error detected"),
              [
                "Unable to connect to server. Please check your network settings or confirm your network location.\n\n无法连接服务器，请检查您的网络设置，或当前区域暂不支持此服务，请确认您的网络位置",
                null,
              ]
            );
          return (
            this.logger.error(`Other error detected, original error: ${eA}`),
            [
              "Unable to connect to server. Please check your network settings or confirm your network location.\n\n无法连接服务器，请检查您的网络设置，或当前区域暂不支持此服务，请确认您的网络位置",
              null,
            ]
          );
        }
      }
      async support(eA) {
        var el, ec;
        await this.productManager.waitConfiguration();
        let eu =
          (null == (el = this.configuration.authentication)
            ? void 0
            : el.type) === eE.AuthenticationType.EXTERNAL_LINK ||
          (null == (ec = this.configuration.authentication)
            ? void 0
            : ec.type) === eE.AuthenticationType.EXTERNAL_LINK_V2;
        return (
          eu &&
            (null == eA ? void 0 : eA.type) &&
            (await this.productEnvService.switch(
              null == eA ? void 0 : eA.type,
            )),
          eu
        );
      }
      async getAuthenticationType() {
        return [
          eE.AuthenticationType.EXTERNAL_LINK,
          eE.AuthenticationType.EXTERNAL_LINK_V2,
        ];
      }
      async createSession(eA) {
        let el;
        (null == eA ? void 0 : eA.type) &&
          (await this.productEnvService.switch(null == eA ? void 0 : eA.type));
        let ec = Date.now(),
          ed = eD,
          ep = new Promise((eA, ec) => {
            el = setTimeout(() => ec(new e_.TimeoutError()), eI);
          }),
          eg = (async () => {
            try {
              emitLoginStep(ed, "state_request", {});
              let el = Date.now(),
                eu = await this.fetchAuthState(eA);
              emitLoginStep(ed, "state_received", {
                duration_ms: String(Date.now() - el),
              });
              let ep = eA.traceSpan.startSpan(ey.SPAN_OPEN_EXTERNAL_LINK);
              ((this.lastBrowserOpenSuccess = !0),
                await this.openAuthUrl(eu),
                (eA.browserOpened = this.lastBrowserOpenSuccess),
                emitLoginStep(ed, "browser_open", { outcome: "success" }),
                ep.markAsSuccessful(),
                emitLoginStep(ed, "polling_start", {}));
              let eg = Date.now(),
                eh = await this.loopGetToken(eu, ec, eA);
              emitLoginStep(ed, "token_received", {
                duration_ms: String(Date.now() - eg),
              });
              let ef = Date.now(),
                em = await this.loopGetAccount(eu, eh, ec, eA);
              emitLoginStep(ed, "account_received", {
                duration_ms: String(Date.now() - ef),
              });
              let eE = await this.getAccountSnapshot(eh, eA),
                eC = this.mergeAccountFromSnapshot(em, eE);
              return (
                emitLoginStep(ed, "completed", {
                  duration_ms: String(Date.now() - ec),
                }),
                { account: eC, auth: eh, ...this.toSessionAccountLists(eE) }
              );
            } catch (eA) {
              if (
                (this.logger.error(`createSession main logic error: ${eA}`),
                !(eA instanceof e_.CanceledError))
              ) {
                let el = this.classifyFailedStep(eA, ec);
                emitLoginStep(ed, "failed", {
                  error_kind: el.errorKind,
                  failed_step: el.step,
                });
              }
              throw eA;
            }
          })();
        try {
          let eA = await Promise.race([eg, ep]);
          return (el && clearTimeout(el), eA);
        } catch (ec) {
          if (
            (el && clearTimeout(el),
            ec instanceof e_.TimeoutError &&
              (null == eu || eu("polling_timeout", {}),
              !0 !== eA.browserOpened))
          )
            throw (
              this.logger.warn(
                "[ExternalLinkAuth] Timeout with browser not opened, reclassify as OpenExternalLinkError",
              ),
              new e_.OpenExternalLinkError()
            );
          throw (this.logger.error(`createSession error: ${ec}`), ec);
        }
      }
      async refreshSession(eA, el) {
        let ec = !!eA.auth.refreshToken;
        if (!ec && !this.isWorkbuddyPlatform()) return eA;
        try {
          let eu;
          if (
            (ec
              ? (eu = (
                  (await this.restOperations.post(
                    `/v2${this.prefixPath}/auth/token/refresh`,
                    {},
                    {
                      headers: {
                        ...this.enterpriseHeaders(eA.auth),
                        "X-Refresh-Token": eA.auth.refreshToken,
                        "X-Auth-Refresh-Source": "plugin",
                        ...el.traceSpan.requestHeaders,
                      },
                    },
                  )) || { data: { data: void 0 } }
                ).data.data) &&
                ((eu.lastRefreshTime = Date.now()), this.calculateExpiresAt(eu))
              : (eu = { ...eA.auth }),
            eu)
          ) {
            let ec = await this.getAccountSnapshot(eu, el);
            if (!ec.allAccounts.length) {
              let eA = new e_.SignError(
                "Failed to refresh session: account list is empty",
              );
              throw (this.logger.error(eA), eA);
            }
            let ed = this.isWorkbuddyPlatform()
              ? this.mergeAccountFromSnapshot(eA.account, ec)
              : ec.accounts.find((eA) => eA.lastLogin) || ec.accounts[0];
            if (!ed) {
              let eA = new e_.SignError(
                "Failed to refresh session: current account is null",
              );
              throw (this.logger.error(eA), eA);
            }
            return {
              ...eA,
              account: ed,
              auth: eu,
              ...this.toSessionAccountLists(ec),
            };
          }
        } catch (eA) {
          if (
            (this.logger.error(`refresh token error: ${eA}`),
            this.isAuthenticationInvalidError(eA))
          )
            throw new e_.UnauthorizedError(eA);
        }
        throw new e_.SignError("Failed to refresh token");
      }
      async removeSession() {}
      async switchAccount(eA, el, ec) {
        var eu, ed, ep, eg;
        let { type: eh, enterpriseId: ef } = eA,
          em =
            "personal" === eh
              ? `/v2${this.prefixPath}/login/enterprise`
              : `/v2${this.prefixPath}/login/enterprise/${ef}`,
          eE = eS,
          eC = el;
        for (; eE > 0; ) {
          eE--;
          try {
            let {
              data: { data: el },
            } = (await this.restOperations.post(
              em,
              {},
              {
                signal:
                  null == (eu = null == ec ? void 0 : ec.abortController)
                    ? void 0
                    : eu.signal,
                headers: (() => {
                  let eA = {
                    ...this.enterpriseHeaders(eC.auth),
                    "X-Refresh-Token": eC.auth.refreshToken,
                    Authorization: `Bearer ${eC.auth.accessToken}`,
                    ...ec.traceSpan.requestHeaders,
                  };
                  return (
                    ef &&
                      ((eA[e_.HTTP_HEADER_ENTERPRISE_ID] = ef),
                      (eA[e_.HTTP_HEADER_TENANT_ID] = ef)),
                    eA
                  );
                })(),
              },
            )) || { data: { data: void 0 } };
            if (el) {
              ((el.domain =
                null != (ed = null == el ? void 0 : el.domain)
                  ? ed
                  : null == (ep = eC.auth)
                    ? void 0
                    : ep.domain),
                (el.lastRefreshTime = Date.now()),
                this.calculateExpiresAt(el));
              let eu = await this.getAccountSnapshot(el, ec);
              return {
                account: this.mergeAccountFromSnapshot(eA, eu),
                auth: el,
                ...this.toSessionAccountLists(eu),
              };
            }
          } catch (eA) {
            if (
              (this.logger.error(`switch account error: ${eA}`),
              (null == (eg = null == eA ? void 0 : eA.response)
                ? void 0
                : eg.code) === 403)
            ) {
              eC = await this.refreshSession(eC, ec);
              continue;
            }
            if (await this.isIpLimitError(eA)) throw new e_.SignIpLimitError();
            break;
          }
        }
        throw new e_.SignError("Failed to switch account");
      }
      async fetchAuthState(eA) {
        var el, ec, eu;
        let ed = eA.traceSpan.startSpan(ey.SPAN_GET_AUTH_STATE),
          ep =
            null !=
            (eu =
              null ==
              (ec =
                null == (el = this.configuration.authentication)
                  ? void 0
                  : el.attributes)
                ? void 0
                : ec.platform)
              ? eu
              : this.configuration.platform;
        try {
          let {
            data: { data: el },
          } = (await this.restOperations.post(
            `/v2${this.prefixPath}/auth/state?platform=${ep}`,
            {},
            {
              headers: {
                ...this.enterpriseHeaders(),
                [e_.HTTP_HEADER_NO_AUTHORIZATION]: "true",
                [e_.HTTP_HEADER_NO_USER_ID]: "true",
                [e_.HTTP_HEADER_NO_ENTERPRISE_ID]: "true",
                [e_.HTTP_HEADER_NO_DEPARTMENT_INFO]: "true",
              },
              ...eA.traceSpan.requestHeaders,
            },
          )) || { data: { data: void 0 } };
          if (el) return (ed.markAsSuccessful(), el);
          let ec = new e_.SignError("Failed to fetch auth state");
          throw (ed.markAsFailed(ec), ec);
        } catch (el) {
          (this.logger.error(`fetch auth state error: ${el}`),
            ed.markAsFailed(el));
          let eA = toSignLicenseError(el);
          if (eA) throw eA;
          throw el;
        }
      }
      async openAuthUrl(eA) {
        var el, ec, eu, ep, eg;
        let eh =
            null !=
            (eu =
              null ==
              (ec =
                null == (el = this.configuration.authentication)
                  ? void 0
                  : el.attributes)
                ? void 0
                : ec.platform)
              ? eu
              : this.configuration.platform,
          ef = new URL(eA.authUrl),
          em = process.env.launch_schema;
        if (em) {
          let eA =
            (null ==
            (eg =
              null == (ep = this.configuration.authentication)
                ? void 0
                : ep.attributes)
              ? void 0
              : eg.launchSchemaWhitelist) || [];
          eA.includes(em) || !eA.length
            ? (ef.searchParams.append("launch_schema", em),
              this.logger.info(`Added launch_schema parameter: ${em}`))
            : this.logger.info(
                `launch_schema "${em}" not in whitelist, skipping`,
              );
        }
        let eE = (await this.clientInfoProvider.get()).pluginVersion;
        (eE && ef.searchParams.append("version", eE),
          ed &&
            (null == eh ? void 0 : eh.toLowerCase()) === "workbuddy" &&
            ef.searchParams.set("loginSessionId", ed));
        let eC = ef.toString();
        this.lastAuthUrl = eC;
        let ey = this.externalUriOpener.urlSubject.subscribe((eA) => {
            this.lastAuthUrl = eA;
          }),
          ew = await this.externalUriOpener.open(eC);
        (ey.unsubscribe(),
          this.logger.info(`Opening auth URL: ${eC}`),
          this.logger.info(
            `[ExternalLinkAuth] externalUriOpener.open returned openSuccess=${ew}`,
          ),
          (this.lastBrowserOpenSuccess = ew),
          ew ||
            this.logger.warn(
              "[ExternalLinkAuth] browser open failed, keep polling so manual login can still complete",
            ));
      }
      async loopGetToken(eA, el, ec) {
        let eu = ec.traceSpan.startSpan(ey.SPAN_GET_AUTH_TOKEN);
        for (; Date.now() - el < eI; ) {
          if ((await (0, ef.wait)(ev), ec.abortController.signal.aborted))
            throw (eu.markAsFailed("Canceled"), new e_.CanceledError());
          try {
            let {
              data: { data: el },
            } = (await this.restOperations.get(
              `/v2${this.prefixPath}/auth/token?state=${eA.state}`,
              {
                signal: ec.abortController.signal,
                headers: {
                  ...ec.traceSpan.requestHeaders,
                  [e_.HTTP_HEADER_NO_AUTHORIZATION]: "true",
                  [e_.HTTP_HEADER_NO_USER_ID]: "true",
                  [e_.HTTP_HEADER_NO_ENTERPRISE_ID]: "true",
                  [e_.HTTP_HEADER_NO_DEPARTMENT_INFO]: "true",
                },
              },
            )) || { data: { data: void 0 } };
            if (el)
              return (
                (el.lastRefreshTime = Date.now()),
                this.calculateExpiresAt(el),
                eu.markAsSuccessful(),
                el
              );
          } catch (eA) {
            if ((null == eA ? void 0 : eA.code) === ep.RetryFetchToken)
              continue;
            throw (
              this.logger.error(`fetch auth token error: ${eA}`),
              eu.markAsFailed(eA),
              eA
            );
          }
        }
        throw (eu.markAsFailed("Timeout"), new e_.TimeoutError());
      }
      async loopGetAccount(eA, el, ec, eu) {
        var ed;
        let eg = eu.traceSpan.startSpan(ey.SPAN_GET_ACCOUNT),
          eh = 0;
        for (; Date.now() - ec < eI; ) {
          if ((await (0, ef.wait)(ev), eu.abortController.signal.aborted))
            throw (eg.markAsFailed("Canceled"), new e_.CanceledError());
          try {
            let {
              data: { data: ec },
            } = (await this.restOperations.get(
              `/v2${this.prefixPath}/login/account?state=${eA.state}`,
              {
                signal: eu.abortController.signal,
                headers: {
                  ...this.enterpriseHeaders(el),
                  Authorization: `Bearer ${el.accessToken}`,
                  ...eu.traceSpan.requestHeaders,
                  [e_.HTTP_HEADER_NO_USER_ID]: "true",
                  [e_.HTTP_HEADER_NO_ENTERPRISE_ID]: "true",
                  [e_.HTTP_HEADER_NO_DEPARTMENT_INFO]: "true",
                },
              },
            )) || { data: { data: void 0 } };
            if (ec)
              return (
                eg.markAsSuccessful(),
                (0, eB.normalizeAccountAvatar)(ec)
              );
          } catch (el) {
            if ((null == el ? void 0 : el.code) === ep.RetryFetchAccount)
              continue;
            let eA =
              null == (ed = null == el ? void 0 : el.response)
                ? void 0
                : ed.status;
            if ((401 === eA || 403 === eA) && eh < eQ) {
              (eh++,
                this.logger.warn(
                  `[loopGetAccount] HTTP ${eA}, retrying (${eh}/${eQ})`,
                ));
              continue;
            }
            throw (
              this.logger.error(`fetch auth account error: ${el}`),
              eg.markAsFailed(el),
              el
            );
          }
        }
        throw (eg.markAsFailed("Timeout"), new e_.TimeoutError());
      }
      mergeAccountFromSnapshot(eA, el) {
        let ec = this.isWorkbuddyPlatform() ? el.allAccounts : el.accounts;
        return (0, eB.mergeCurrentAccountDetails)(eA, ec);
      }
      toSessionAccountLists(eA) {
        return {
          accounts: eA.accounts,
          ...(this.isWorkbuddyPlatform()
            ? { allAccounts: eA.allAccounts }
            : {}),
        };
      }
      isWorkbuddyPlatform() {
        var eA, el, ec;
        let eu =
          null !=
          (ec =
            null ==
            (el =
              null == (eA = this.configuration.authentication)
                ? void 0
                : eA.attributes)
              ? void 0
              : el.platform)
            ? ec
            : this.configuration.platform;
        return (0, eB.isWorkbuddyAuthenticationPlatform)(eu);
      }
      async getAccountSnapshot(eA, el) {
        var ec;
        let eu = el.traceSpan.startSpan(ey.SPAN_GET_ACCOUNT_LIST);
        try {
          let {
            data: { data: ed },
          } = (await this.restOperations.get(`/v2${this.prefixPath}/accounts`, {
            signal: el.abortController.signal,
            headers: {
              ...this.enterpriseHeaders(eA),
              Authorization: `Bearer ${eA.accessToken}`,
              ...el.traceSpan.requestHeaders,
            },
          })) || { data: { data: void 0 } };
          if (
            null == (ec = null == ed ? void 0 : ed.accounts)
              ? void 0
              : ec.length
          )
            return (
              eu.markAsSuccessful(),
              (0, eB.createAccountSnapshot)(ed.accounts)
            );
        } catch (eA) {
          (eu.markAsFailed(eA),
            this.logger.error(`fetch auth accounts error: ${eA}`));
        }
        return (
          eu.markAsFailed("accounts is empty"),
          (0, eB.createAccountSnapshot)([])
        );
      }
      classifyFailedStep(eA, el) {
        return eA instanceof e_.TimeoutError
          ? { step: "polling", errorKind: "timeout" }
          : eA instanceof e_.CanceledError
            ? { step: "polling", errorKind: "canceled" }
            : eA instanceof e_.OpenExternalLinkError
              ? { step: "browser_open", errorKind: "open_failed" }
              : {
                  step: "unknown",
                  errorKind:
                    eA instanceof Error ? eA.constructor.name : "unknown",
                };
      }
      enterpriseHeaders(eA) {
        var el;
        let ec = "";
        try {
          if (null == eA ? void 0 : eA.domain) ec = eA.domain;
          else {
            let eA =
              (null == (el = this.configuration.authentication)
                ? void 0
                : el.endpoint) ||
              this.configuration.endpoint ||
              "";
            ec = ew.URI.parse(eA).authority;
          }
          return { [e_.HTTP_HEADER_DOMAIN]: ec };
        } catch (eA) {
          return (this.logger.warn(`endpoint domain format error: ${eA}`), {});
        }
      }
      calculateExpiresAt(eA) {
        (!eA.expiresAt &&
          eA.expiresIn &&
          (eA.expiresAt = new Date(Date.now() + 1e3 * eA.expiresIn).getTime()),
          !eA.refreshExpiresAt &&
            eA.refreshExpiresIn &&
            (eA.refreshExpiresAt = new Date(
              Date.now() + 1e3 * eA.refreshExpiresIn,
            ).getTime()));
      }
      async isIpLimitError(eA) {
        var el;
        try {
          let ec =
            null == (el = null == eA ? void 0 : eA.response) ? void 0 : el.data;
          if ((null == ec ? void 0 : ec.code) === eT) return !0;
          return (
            (null == (ec = JSON.parse(await this.streamToString(ec)))
              ? void 0
              : ec.code) === eT
          );
        } catch (eA) {
          return !1;
        }
      }
      async streamToString(eA) {
        let el = [];
        return new Promise((ec, eu) => {
          (eA.on("data", (eA) => el.push(Buffer.from(eA))),
            eA.on("error", (eA) => eu(eA)),
            eA.on("end", () => ec(Buffer.concat(el).toString("utf8"))));
        });
      }
      isAuthenticationInvalidError(eA) {
        var el;
        if (eA && eA.isAxiosError) {
          let ec = null == (el = eA.response) ? void 0 : el.status;
          return 401 === ec || 403 === ec;
        }
        return !1;
      }
      get endpoint() {
        var eA;
        return (
          (null == (eA = this.configuration.authentication)
            ? void 0
            : eA.endpoint) ||
          this.configuration.endpoint ||
          ""
        );
      }
      get prefixPath() {
        var eA, el;
        return (
          (null ==
          (el =
            null == (eA = this.configuration.authentication)
              ? void 0
              : eA.attributes)
            ? void 0
            : el.prefixPath) || ""
        );
      }
    };
    el.ExternalLinkAuthenticationProvider = ek;
    return el;
  }
  function scope78850() {
    const el: any = {};
    const ec = resolveOriginal;
    Object.defineProperty(el, "__esModule", { value: !0 });
    el.UserInfoContextVariableResolver = void 0;
    let ep = ec(80699),
      eg = ec(66915),
      eh = ec(67865),
      ef = class {
        constructor() {
          this.name = "userInfo";
        }
        async priority(eA, el) {
          return (
            5 * !!this.authenticationManager.currentSessionSubject.getValue()
          );
        }
        async resolve(eA, el) {
          let ec = this.authenticationManager.currentSessionSubject.getValue();
          if (ec)
            return {
              name: this.name,
              value: { id: ec.account.uid, nickname: ec.account.nickname },
            };
        }
      };
    el.UserInfoContextVariableResolver = ef;
    return el;
  }
  function scope34047() {
    const el: any = {};
    const ec = resolveOriginal;
    Object.defineProperty(el, "__esModule", { value: !0 });
    el.AuthenticationHttpInterceptor = void 0;
    let ep = ec(80699),
      eg = ec(67062),
      eh = ec(9151),
      ef = ec(79814),
      em = ec(67865),
      eE = [
        "/api/memory/profile",
        "/api/memory/search",
        "/api/memory/clear_profile",
        "/api/memory/update_profile",
      ],
      eC = [
        /^\/v2\/enterprises\/[^/]+\/member-custom-model-policy\/user-check$/,
        /^\/v2\/enterprises\/[^/]+\/skill-upload-policy\/user-check$/,
      ],
      ey = class {
        initialize() {
          (this.restOperations.interceptors.request.use((eA) => {
            if (
              (eA.headers || (eA.headers = {}),
              eA.headers[em.HTTP_HEADER_SKIP_AUTH_INTERCEPTOR])
            )
              return (
                delete eA.headers[em.HTTP_HEADER_SKIP_AUTH_INTERCEPTOR],
                eA
              );
            let el =
              this.authenticationManager.currentSessionSubject.getValue();
            if (el) {
              let { account: ec, auth: eu } = el;
              (eA.headers[eg.HttpHeaders.AUTHORIZATION] ||
                !eu.accessToken ||
                eA.headers[em.HTTP_HEADER_NO_AUTHORIZATION] ||
                (eA.headers[eg.HttpHeaders.AUTHORIZATION] =
                  `Bearer ${eu.accessToken}`),
                !eA.headers[em.HTTP_HEADER_USER_ID] &&
                  (null == ec ? void 0 : ec.uid) &&
                  !eA.headers[em.HTTP_HEADER_NO_USER_ID] &&
                  (eA.headers[em.HTTP_HEADER_USER_ID] = ec.uid),
                !eA.headers[em.HTTP_HEADER_ENTERPRISE_ID] &&
                  (null == ec ? void 0 : ec.enterpriseId) &&
                  !eA.headers[em.HTTP_HEADER_NO_ENTERPRISE_ID] &&
                  (eA.headers[em.HTTP_HEADER_ENTERPRISE_ID] = ec.enterpriseId),
                !eA.headers[em.HTTP_HEADER_DEPARTMENT_INFO] &&
                  (null == ec ? void 0 : ec.departmentFullName) &&
                  !eA.headers[em.HTTP_HEADER_NO_DEPARTMENT_INFO] &&
                  (eA.headers[em.HTTP_HEADER_DEPARTMENT_INFO] =
                    ec.departmentFullName),
                !eA.headers[em.HTTP_HEADER_TENANT_ID] &&
                  (null == ec ? void 0 : ec.enterpriseId) &&
                  (eA.headers[em.HTTP_HEADER_TENANT_ID] = ec.enterpriseId),
                !eA.headers[em.HTTP_HEADER_DOMAIN] &&
                  eu.domain &&
                  (eA.headers[em.HTTP_HEADER_DOMAIN] = eu.domain));
            }
            return eA;
          }),
            this.restOperations.interceptors.response.use(
              async (eA) => {
                var el;
                let ec = null == eA ? void 0 : eA.data;
                try {
                  let eu = null == ec ? void 0 : ec.code;
                  401 === eu &&
                    (null == (el = eA.config.headers)
                      ? void 0
                      : el.Authorization) &&
                    this.checkToLogout(
                      `${eA.config.headers.Authorization}`,
                      eA.config.baseURL,
                      eA.config.url,
                    );
                } catch (eA) {
                  this.logger.warn("Failed to get response code");
                }
                return eA;
              },
              (eA) => {
                var el, ec;
                return (
                  (null == (el = eA.response) ? void 0 : el.status) === 401 &&
                    (null == (ec = eA.response.config.headers)
                      ? void 0
                      : ec.Authorization) &&
                    this.checkToLogout(
                      `${eA.response.config.headers.Authorization}`,
                      eA.response.config.baseURL,
                      eA.response.config.url,
                    ),
                  Promise.reject(eA)
                );
              },
            ));
        }
        checkToLogout(eA, el, ec) {
          var eu, ed;
          let ep = `${eA}`.substring(7),
            eg =
              null ==
              (ed =
                null ==
                (eu =
                  this.authenticationManager.currentSessionSubject.getValue())
                  ? void 0
                  : eu.auth)
                ? void 0
                : ed.accessToken;
          if (ep && ep === eg) {
            let eA = this.productManager.getEndpoint();
            if (eA && !this.isEndpointMatch(eA, el, ec))
              return void this.logger.warn(
                `401 ignored (endpoint mismatch): request baseURL=${el}, url=${ec}, current endpoint=${eA}`,
              );
            let eu = (0, eh.getProductEndpointOverride)().resolve();
            if (eu && el && !this.isEndpointMatch(eu, el, ec))
              return void this.logger.warn(
                `401 ignored (endpoint override mismatch): request baseURL=${el}, override=${eu}`,
              );
            if (this.isLogoutWhitelistedPath(ec, el))
              return void this.logger.warn(
                `401 ignored (path whitelisted): request baseURL=${el}, url=${ec}`,
              );
            (this.logger.warn(
              `[AuthInterceptor] triggering logout: baseURL=${el}, url=${ec}, currentEndpoint=${eA}`,
            ),
              this.notifier.warn(
                "Session expired. You have been automatically logged out.",
              ),
              this.authenticationManager.logout());
          }
        }
        isLogoutWhitelistedPath(eA, el) {
          if (!eA) return !1;
          try {
            let el;
            if (/^https?:\/\//i.test(eA)) el = new URL(eA).pathname;
            else {
              let ec = eA.indexOf("?");
              el = ec >= 0 ? eA.slice(0, ec) : eA;
            }
            return eE.includes(el) || eC.some((eA) => eA.test(el));
          } catch (eA) {
            return !1;
          }
        }
        isEndpointMatch(eA, el, ec) {
          return ec && /^https?:\/\//i.test(ec)
            ? ec.startsWith(eA) || eA.startsWith(ec)
            : !el || el.startsWith(eA) || eA.startsWith(el);
        }
      };
    el.AuthenticationHttpInterceptor = ey;
    return el;
  }
  function scope26968() {
    const el: any = {};
    const ec = resolveOriginal;
    Object.defineProperty(el, "__esModule", { value: !0 });
    el.DefaultAuthenticationStorage = void 0;
    let ed = ec(80699),
      ep = ec(42315),
      eg = ec(67865),
      eh = class {
        constructor() {
          this.storeSessionSubject = new ep.Subject();
        }
        async priority() {
          return eg.AuthenticationStoragePriority.Low;
        }
        async store(eA) {
          ((this.session = eA), this.storeSessionSubject.next(eA));
        }
        async restore() {
          return (this.storeSessionSubject.next(this.session), this.session);
        }
        async clean() {
          ((this.session = void 0), this.storeSessionSubject.next(void 0));
        }
      };
    el.DefaultAuthenticationStorage = eh;
    return el;
  }
  function scope15064() {
    const el: any = {};
    const ec = resolveOriginal;
    Object.defineProperty(el, "__esModule", { value: !0 });
    el.CustomTokenAuthenticationProvider = void 0;
    let ep = ec(80699),
      eg = ec(9151),
      eh = ec(92735),
      ef = ec(67865),
      em = ec(40544),
      eE = class {
        async support() {
          var eA;
          return (
            (null ==
            (eA = (await this.productManager.waitConfiguration())
              .authentication)
              ? void 0
              : eA.type) === eg.AuthenticationType.CUSTOM_TOKEN
          );
        }
        async getAuthenticationType() {
          return [eg.AuthenticationType.CUSTOM_TOKEN];
        }
        async createSession(eA) {
          let el = await this.customTokenAuthenticationStorage.restore();
          if (!el) throw Error("authentication token is undefined");
          return el;
        }
        async refreshSession(eA, el) {
          return ((eA.auth.lastRefreshTime = Date.now()), eA);
        }
        async removeSession(eA) {}
        async switchAccount(eA, el, ec) {
          return el;
        }
      };
    el.CustomTokenAuthenticationProvider = eE;
    return el;
  }
  function scope40544() {
    const exports: any = {};
    const __webpack_require__ = resolveOriginal;
    var __importDefault =
      (this && this.__importDefault) ||
      function (eA) {
        return eA && eA.__esModule ? eA : { default: eA };
      };
    Object.defineProperty(exports, "__esModule", { value: !0 });
    exports.CustomTokenAuthenticationStorageImpl =
      exports.CustomTokenAuthenticationStorage = void 0;
    let core_1 = __webpack_require__(80699),
      product_1 = __webpack_require__(9151),
      jsonwebtoken_1 = __importDefault(__webpack_require__(94959)),
      rxjs_1 = __webpack_require__(42315),
      authentication_protocol_1 = __webpack_require__(67865),
      LONG_TIME_AGO = 0x1d1a94a1fff;
    exports.CustomTokenAuthenticationStorage = Symbol(
      "CustomTokenAuthenticationStorage",
    );
    let CustomTokenAuthenticationStorageImpl = class CustomTokenAuthenticationStorageImpl {
      constructor() {
        this.storeSessionSubject = new rxjs_1.Subject();
      }
      async priority() {
        var eA, el, ec, eu, ed, ep;
        if (
          !process.env.CODEBUDDY_AUTH_TOKEN &&
          !this.hasAccProductConfigCustomToken() &&
          !(await this.hasSpilledAccProductConfigCustomToken())
        )
          return authentication_protocol_1.AuthenticationStoragePriority
            .Disabled;
        let eg = this.productManager.configuration.getValue();
        if (eg) {
          if (
            (null == (eA = eg.authentication) ? void 0 : eA.type) ===
              product_1.AuthenticationType.CUSTOM_TOKEN &&
            (null ==
            (ec = null == (el = eg.authentication) ? void 0 : el.attributes)
              ? void 0
              : ec.token)
          )
            return authentication_protocol_1.AuthenticationStoragePriority
              .Heigh;
          let eh = await this.productManager.waitConfiguration(!0);
          return (null == (eu = null == eh ? void 0 : eh.authentication)
            ? void 0
            : eu.type) === product_1.AuthenticationType.CUSTOM_TOKEN &&
            (null ==
            (ep =
              null == (ed = null == eh ? void 0 : eh.authentication)
                ? void 0
                : ed.attributes)
              ? void 0
              : ep.token)
            ? authentication_protocol_1.AuthenticationStoragePriority.Heigh
            : authentication_protocol_1.AuthenticationStoragePriority.Disabled;
        }
        return authentication_protocol_1.AuthenticationStoragePriority.Heigh;
      }
      hasAccProductConfigCustomToken() {
        var eA;
        let el = this.getAccProductConfigAuthentication();
        return (
          (null == el ? void 0 : el.type) ===
            product_1.AuthenticationType.CUSTOM_TOKEN &&
          !!(null == (eA = el.attributes) ? void 0 : eA.token)
        );
      }
      getAccProductConfigAuthentication() {
        for (let eA of ["ACC_PRODUCT_CONFIG_V3", "ACC_PRODUCT_CONFIG_V2"]) {
          let el = process.env[eA];
          if (el)
            try {
              let eA = JSON.parse(el);
              if (eA.authentication) return eA.authentication;
            } catch (eA) {}
        }
      }
      async hasSpilledAccProductConfigCustomToken() {
        var _a;
        let configPath = process.env.ACC_PRODUCT_CONFIG_PATH;
        if (!configPath) return !1;
        try {
          let req = eval("require"),
            fs = req("fs/promises"),
            raw = await fs.readFile(configPath, { encoding: "utf-8" }),
            authentication = JSON.parse(raw).authentication;
          return (
            (null == authentication ? void 0 : authentication.type) ===
              product_1.AuthenticationType.CUSTOM_TOKEN &&
            !!(null == (_a = authentication.attributes) ? void 0 : _a.token)
          );
        } catch (_b) {
          return !1;
        }
      }
      async store(eA) {}
      async restore() {
        var eA, el, ec, eu;
        let ed = await this.productManager.waitConfiguration(!0),
          ep =
            null ==
            (el = null == (eA = ed.authentication) ? void 0 : eA.attributes)
              ? void 0
              : el.token;
        if (!ep) return;
        let eg = this.tryExtractUserIDFromJWTToken(ep),
          eh =
            (null ==
            (eu = null == (ec = ed.authentication) ? void 0 : ec.attributes)
              ? void 0
              : eu.enterpriseId) || (null == eg ? void 0 : eg.enterpriseId),
          ef = {
            uid: (null == eg ? void 0 : eg.userId) || this.getUserId(),
            nickname: (null == eg ? void 0 : eg.nickname) || this.getUsername(),
            enterpriseId: eh,
            type: eh
              ? "ultimate"
              : (null == eg ? void 0 : eg.type) || "personal",
            lastLogin: !0,
          },
          em = {
            auth: {
              accessToken: ep,
              expiresIn: LONG_TIME_AGO,
              expiresAt: LONG_TIME_AGO,
              refreshToken: "",
              refreshExpiresIn: LONG_TIME_AGO,
              refreshExpiresAt: LONG_TIME_AGO,
              tokenType: "Bearer",
              scope: "",
              domain: null == eg ? void 0 : eg.domain,
            },
            account: ef,
            accounts: [ef],
          };
        return (this.storeSessionSubject.next(em), em);
      }
      async clean() {}
      getUserId() {
        var eA;
        return null != (eA = process.env.ACC_USER_ID) ? eA : this.getUsername();
      }
      getUsername() {
        return process.env.ACC_USER_NICKNAME
          ? process.env.ACC_USER_NICKNAME
          : "anonymous";
      }
      tryExtractUserIDFromJWTToken(eA) {
        let el = {};
        try {
          let ec = jsonwebtoken_1.default.decode(eA, { complete: !0 }),
            eu = null == ec ? void 0 : ec.payload;
          if (!eu) return;
          if (
            (eu.sub && "string" == typeof eu.sub && (el.userId = eu.sub),
            (el.nickname = eu.nickname || eu.preferred_username),
            eu.iss)
          ) {
            this.logger.debug(`[JWT] iss: ${eu.iss}`);
            let eA = eu.iss.split("/").pop();
            (this.logger.debug(`[JWT] lastItem from iss: ${eA}`),
              eA.startsWith("sso-")
                ? ((el.enterpriseId = eA.slice(4)),
                  this.logger.debug(
                    `[JWT] extracted enterpriseId: ${el.enterpriseId}`,
                  ),
                  (el.type = "ultimate"))
                : this.logger.warn(
                    "[JWT] iss does not contain sso- prefix, enterpriseId will be undefined",
                  ),
              (el.domain = this.extractDomain(eu.iss)));
          }
        } catch (eA) {
          return;
        }
        return el;
      }
      extractDomain(eA) {
        try {
          return new URL(eA).hostname;
        } catch (ec) {
          let el = eA.match(/https?:\/\/([^\/]+)/);
          return el ? el[1] : void 0;
        }
      }
    };
    exports.CustomTokenAuthenticationStorageImpl =
      CustomTokenAuthenticationStorageImpl;
    return exports;
  }
  function scope13832() {
    const exports: any = {};
    const __webpack_require__ = resolveOriginal;
    Object.defineProperty(exports, "__esModule", { value: !0 });
    exports.WxAuthenticationProvider = void 0;
    let core_1 = __webpack_require__(80699),
      http_1 = __webpack_require__(67062),
      product_1 = __webpack_require__(9151),
      telemetry_1 = __webpack_require__(92735),
      vscode_uri_1 = __webpack_require__(22186),
      account_utils_1 = __webpack_require__(63525),
      authentication_protocol_1 = __webpack_require__(67865),
      WxAuthenticationProvider = class WxAuthenticationProvider {
        init() {
          (this.logger.setContext("WxAuthenticationProvider"),
            this.productManager.configuration.subscribe((eA) => {
              this.configuration = eA || {};
            }));
        }
        async support() {
          var eA;
          return (
            await this.productManager.waitConfiguration(),
            (null == (eA = this.configuration.authentication)
              ? void 0
              : eA.type) === product_1.AuthenticationType.WECHAT
          );
        }
        async getAuthenticationType() {
          return [product_1.AuthenticationType.WECHAT];
        }
        async createSession(ctx) {
          try {
            let req = eval("require"),
              wechatide = req("wechatide"),
              data = await wechatide.workspace.sendAuthRequest(),
              {
                data: { tmpcode: code },
                errCode,
                errMsg,
              } = data;
            if (!code) {
              let errorMessage = `[CODE: ${errCode}]: No tmpcode found -- ERROR MESSAGE: ${errMsg}`;
              throw Error(errorMessage);
            }
            let authToken = await this.fetchTokenByTmpCode(code, ctx),
              accounts = await this.fetchAccounts(authToken, ctx);
            return {
              account: accounts.length ? accounts[0] : {},
              accounts: accounts,
              auth: authToken,
            };
          } catch (error) {
            throw (
              this.logger.error(
                `WxAuthenticationProvider createSession error: ${error}`,
              ),
              error
            );
          }
        }
        async refreshSession(eA, el) {
          var ec;
          try {
            let eu = await this.restOperations.post(
                "/v2/auth/token/refresh",
                {},
                {
                  headers: {
                    ...this.enterpriseHeaders(),
                    "X-Refresh-Token": eA.auth.refreshToken,
                    "X-Auth-Refresh-Source": "plugin",
                    ...el.traceSpan.requestHeaders,
                  },
                },
              ),
              ed =
                null == (ec = null == eu ? void 0 : eu.data) ? void 0 : ec.data;
            if (ed) {
              ((ed.lastRefreshTime = Date.now()), this.calculateExpiresAt(ed));
              let eA = await this.fetchAccounts(ed, el),
                ec = eA.find((eA) => eA.lastLogin) || eA[0];
              if (!ec) {
                let eA = new authentication_protocol_1.SignError(
                  "Failed to refresh token: account is null",
                );
                throw (this.logger.error(eA), eA);
              }
              return { account: ec, auth: ed, accounts: eA };
            }
          } catch (eA) {
            if (
              (this.logger.error(`refresh token error: ${eA}`),
              this.isAuthenticationInvalidError(eA))
            )
              throw new authentication_protocol_1.UnauthorizedError(eA);
          }
          throw new authentication_protocol_1.SignError(
            "Failed to refresh token",
          );
        }
        async removeSession() {}
        async switchAccount(eA, el, ec) {
          return el;
        }
        async fetchTokenByTmpCode(eA, el) {
          var ec;
          console.error(`code: ${eA}`);
          try {
            let eu = await this.restOperations.post(
              `/v2/auth/token/wxide?tmpCode=${eA}`,
              {},
              {
                headers: {
                  ...this.enterpriseHeaders(),
                  ...el.traceSpan.requestHeaders,
                },
                signal: el.abortController.signal,
              },
            );
            return null == (ec = null == eu ? void 0 : eu.data)
              ? void 0
              : ec.data;
          } catch (eA) {
            throw (
              this.logger.error(
                `WxAuthenticationProvider fetchTokenByTmpCode error: ${eA}`,
              ),
              eA
            );
          }
        }
        async fetchAccounts(eA, el) {
          var ec, eu;
          let ed = el.traceSpan.startSpan(telemetry_1.SPAN_GET_ACCOUNT_LIST);
          try {
            let ep = await this.restOperations.get("/v2/accounts", {
                signal: el.abortController.signal,
                headers: {
                  ...this.enterpriseHeaders(),
                  ...((null == eA ? void 0 : eA.domain)
                    ? {
                        [authentication_protocol_1.HTTP_HEADER_DOMAIN]:
                          eA.domain,
                      }
                    : {}),
                  Authorization: `Bearer ${eA.accessToken}`,
                  ...el.traceSpan.requestHeaders,
                },
              }),
              eg =
                null ==
                (eu =
                  null == (ec = null == ep ? void 0 : ep.data)
                    ? void 0
                    : ec.data)
                  ? void 0
                  : eu.accounts;
            if (null == eg ? void 0 : eg.length)
              return (
                ed.markAsSuccessful(),
                eg
                  .filter((eA) => eA.pluginEnabled)
                  .map(account_utils_1.normalizeAccountAvatar)
              );
          } catch (eA) {
            (this.logger.error(`fetch auth accounts error: ${eA}`),
              ed.markAsFailed(eA));
          }
          return (ed.markAsFailed("accounts is empty"), []);
        }
        get prefixPath() {
          var eA, el;
          return (
            (null ==
            (el =
              null == (eA = this.configuration.authentication)
                ? void 0
                : eA.attributes)
              ? void 0
              : el.prefixPath) || ""
          );
        }
        get endpoint() {
          var eA;
          return (
            (null == (eA = this.configuration.authentication)
              ? void 0
              : eA.endpoint) ||
            this.configuration.endpoint ||
            ""
          );
        }
        enterpriseHeaders() {
          var eA;
          let el = "";
          try {
            let ec =
              (null == (eA = this.configuration.authentication)
                ? void 0
                : eA.endpoint) ||
              this.configuration.endpoint ||
              "";
            return (
              (el = vscode_uri_1.URI.parse(ec).authority),
              { [authentication_protocol_1.HTTP_HEADER_DOMAIN]: el }
            );
          } catch (eA) {
            return (
              this.logger.warn(`endpoint domain format error: ${eA}`),
              {}
            );
          }
        }
        calculateExpiresAt(eA) {
          (!eA.expiresAt &&
            eA.expiresIn &&
            (eA.expiresAt = new Date(
              Date.now() + 1e3 * eA.expiresIn,
            ).getTime()),
            !eA.refreshExpiresAt &&
              eA.refreshExpiresIn &&
              (eA.refreshExpiresAt = new Date(
                Date.now() + 1e3 * eA.refreshExpiresIn,
              ).getTime()));
        }
        isAuthenticationInvalidError(eA) {
          var el;
          if (eA && eA.isAxiosError) {
            let ec = null == (el = eA.response) ? void 0 : el.status;
            return 401 === ec || 403 === ec;
          }
          return !1;
        }
      };
    exports.WxAuthenticationProvider = WxAuthenticationProvider;
    return exports;
  }
  const scopeFactories: any = {
    52521: scope52521,
    7327: scope7327,
    78850: scope78850,
    34047: scope34047,
    26968: scope26968,
    15064: scope15064,
    40544: scope40544,
    13832: scope13832,
  };
  return {
    getModule: resolveOriginal,
    get classes() {
      return Object.assign(
        {},
        ...Object.keys(scopeFactories).map((id) => resolveOriginal(Number(id))),
      );
    },
    get core() {
      return {
        ...resolveOriginal(8461),
        ...resolveOriginal(26052),
        ...resolveOriginal(99600),
        ...resolveOriginal(66629),
        ...resolveOriginal(15694),
      };
    },
    get constants() {
      return resolveOriginal(67865);
    },
    get accounts() {
      return resolveOriginal(63525);
    },
    get subscription() {
      return resolveOriginal(54194);
    },
  };
}
