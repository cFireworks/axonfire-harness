// @ts-nocheck
// Captured HTTP instrumentation with explicit shared instrumentation-base parents.
export const GALILEO_HTTP_INSTRUMENTATION_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_HTTP_INSTRUMENTATION_MODULES = [
  [9808, 1399517, 1453330],
  [43408, 1047017, 1047250],
  [46077, 1013508, 1013975],
] as const;
export function createNativeGalileoHttpInstrumentation(runtime: any) {
  if (!runtime.globals) throw Error("Explicit global surface required");
  const globalThis = runtime.globals,
    global = runtime.globals,
    process = runtime.process ?? globalThis.process,
    console = runtime.console ?? globalThis.console;
  const factories = {
      9808(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            getOutgoingRequestMetricAttributesOnResponse: () =>
              getOutgoingRequestMetricAttributesOnResponse,
            shouldFilterMetric: () => shouldFilterMetric,
            isIgnored: () => isIgnored,
            setRequestContentLengthAttribute: () =>
              setRequestContentLengthAttribute,
            getCodeType: () => getCodeType,
            getKindName: () => getKindName,
            getAbsoluteUrl: () => getAbsoluteUrl,
            setResponseContentLengthAttribute: () =>
              setResponseContentLengthAttribute,
            getRequestInfo: () => getRequestInfo,
            getOutgoingRequestAttributes: () => getOutgoingRequestAttributes,
            genClientMetricAttributes: () => genClientMetricAttributes,
            parseResponseStatus: () => parseResponseStatus,
            getOutgoingRequestAttributesOnResponse: () =>
              getOutgoingRequestAttributesOnResponse,
            genServerMetricAttributes: () => genServerMetricAttributes,
            extractHostnameAndPort: () => extractHostnameAndPort,
            RESERVED_USER_EXT_FIELDS: () => tn,
            headerCapture: () => headerCapture,
            isValidOptionsType: () => isValidOptionsType,
            satisfiesPattern: () => satisfiesPattern,
            getIncomingRequestAttributes: () => getIncomingRequestAttributes,
            setAttributesFromHttpKind: () => setAttributesFromHttpKind,
            getIncomingRequestMetricAttributesOnResponse: () =>
              getIncomingRequestMetricAttributesOnResponse,
            HttpInstrumentation: () => HttpInstrumentation,
            debugLogToFile: () => debugLogToFile,
            getOutgoingRequestMetricAttributes: () =>
              getOutgoingRequestMetricAttributes,
            isCompressed: () => isCompressed,
            getIncomingRequestMetricAttributes: () =>
              getIncomingRequestMetricAttributes,
            getIncomingRequestAttributesOnResponse: () =>
              getIncomingRequestAttributesOnResponse,
            setSpanWithError: () => setSpanWithError,
          }));
        var eu,
          ed,
          ep,
          eg = ec(11447),
          eh = ec(33835),
          ef = ec(45185),
          em = ec(51244),
          eE = ec(67006),
          eC = ec(98902),
          ey = ec(23258),
          ew = ec(67177),
          eB = ec(65890),
          e_ = ec(41437),
          eI = ec(94377),
          ev = ec(87016);
        let eS =
            "object" == typeof performance &&
            performance &&
            "function" == typeof performance.now
              ? performance
              : Date,
          eQ = new Set(),
          eD = "object" == typeof process && process ? process : {},
          emitWarning = (eA, el, ec, eu) => {
            "function" == typeof eD.emitWarning
              ? eD.emitWarning(eA, el, ec, eu)
              : console.error(`[${ec}] ${el}: ${eA}`);
          },
          eT = globalThis.AbortController,
          eR = globalThis.AbortSignal;
        if (void 0 === eT) {
          ((eR = class {
            onabort;
            _onabort = [];
            reason;
            aborted = !1;
            addEventListener(eA, el) {
              this._onabort.push(el);
            }
          }),
            (eT = class {
              constructor() {
                warnACPolyfill();
              }
              signal = new eR();
              abort(eA) {
                if (!this.signal.aborted) {
                  for (let el of ((this.signal.reason = eA),
                  (this.signal.aborted = !0),
                  this.signal._onabort))
                    el(eA);
                  this.signal.onabort?.(eA);
                }
              }
            }));
          let eA = eD.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1",
            warnACPolyfill = () => {
              eA &&
                ((eA = !1),
                emitWarning(
                  "AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.",
                  "NO_ABORT_CONTROLLER",
                  "ENOTSUP",
                  warnACPolyfill,
                ));
            };
        }
        let shouldWarn = (eA) => !eQ.has(eA);
        Symbol("type");
        let isPosInt = (eA) =>
            eA && eA === Math.floor(eA) && eA > 0 && isFinite(eA),
          getUintArray = (eA) =>
            isPosInt(eA)
              ? eA <= 256
                ? Uint8Array
                : eA <= 65536
                  ? Uint16Array
                  : eA <= 0x100000000
                    ? Uint32Array
                    : eA <= Number.MAX_SAFE_INTEGER
                      ? ZeroArray
                      : null
              : null;
        let ZeroArray = class ZeroArray extends Array {
          constructor(eA) {
            (super(eA), this.fill(0));
          }
        };
        let Stack = class Stack {
          heap;
          length;
          static #e = !1;
          static create(eA) {
            let el = getUintArray(eA);
            if (!el) return [];
            Stack.#e = !0;
            let ec = new Stack(eA, el);
            return ((Stack.#e = !1), ec);
          }
          constructor(eA, el) {
            if (!Stack.#e)
              throw TypeError("instantiate Stack using Stack.create(n)");
            ((this.heap = new el(eA)), (this.length = 0));
          }
          push(eA) {
            this.heap[this.length++] = eA;
          }
          pop() {
            return this.heap[--this.length];
          }
        };
        let LRUCache = class LRUCache {
          #t;
          #A;
          #r;
          #n;
          #i;
          #o;
          ttl;
          ttlResolution;
          ttlAutopurge;
          updateAgeOnGet;
          updateAgeOnHas;
          allowStale;
          noDisposeOnSet;
          noUpdateTTL;
          maxEntrySize;
          sizeCalculation;
          noDeleteOnFetchRejection;
          noDeleteOnStaleGet;
          allowStaleOnFetchAbort;
          allowStaleOnFetchRejection;
          ignoreFetchAbort;
          #a;
          #s;
          #l;
          #c;
          #u;
          #d;
          #p;
          #g;
          #h;
          #f;
          #m;
          #E;
          #C;
          #y;
          #w;
          #B;
          #_;
          static unsafeExposeInternals(eA) {
            return {
              starts: eA.#C,
              ttls: eA.#y,
              sizes: eA.#E,
              keyMap: eA.#l,
              keyList: eA.#c,
              valList: eA.#u,
              next: eA.#d,
              prev: eA.#p,
              get head() {
                return eA.#g;
              },
              get tail() {
                return eA.#h;
              },
              free: eA.#f,
              isBackgroundFetch: (el) => eA.#b(el),
              backgroundFetch: (el, ec, eu, ed) => eA.#I(el, ec, eu, ed),
              moveToTail: (el) => eA.#v(el),
              indexes: (el) => eA.#S(el),
              rindexes: (el) => eA.#Q(el),
              isStale: (el) => eA.#D(el),
            };
          }
          get max() {
            return this.#t;
          }
          get maxSize() {
            return this.#A;
          }
          get calculatedSize() {
            return this.#s;
          }
          get size() {
            return this.#a;
          }
          get fetchMethod() {
            return this.#i;
          }
          get memoMethod() {
            return this.#o;
          }
          get dispose() {
            return this.#r;
          }
          get disposeAfter() {
            return this.#n;
          }
          constructor(eA) {
            const {
              max: el = 0,
              ttl: ec,
              ttlResolution: eu = 1,
              ttlAutopurge: ed,
              updateAgeOnGet: ep,
              updateAgeOnHas: eg,
              allowStale: eh,
              dispose: ef,
              disposeAfter: em,
              noDisposeOnSet: eE,
              noUpdateTTL: eC,
              maxSize: ey = 0,
              maxEntrySize: ew = 0,
              sizeCalculation: eB,
              fetchMethod: e_,
              memoMethod: eI,
              noDeleteOnFetchRejection: ev,
              noDeleteOnStaleGet: eS,
              allowStaleOnFetchRejection: eD,
              allowStaleOnFetchAbort: eT,
              ignoreFetchAbort: eR,
            } = eA;
            if (0 !== el && !isPosInt(el))
              throw TypeError("max option must be a nonnegative integer");
            const ek = el ? getUintArray(el) : Array;
            if (!ek) throw Error("invalid max value: " + el);
            if (
              ((this.#t = el),
              (this.#A = ey),
              (this.maxEntrySize = ew || this.#A),
              (this.sizeCalculation = eB),
              this.sizeCalculation)
            ) {
              if (!this.#A && !this.maxEntrySize)
                throw TypeError(
                  "cannot set sizeCalculation without setting maxSize or maxEntrySize",
                );
              if ("function" != typeof this.sizeCalculation)
                throw TypeError("sizeCalculation set to non-function");
            }
            if (void 0 !== eI && "function" != typeof eI)
              throw TypeError("memoMethod must be a function if defined");
            if (((this.#o = eI), void 0 !== e_ && "function" != typeof e_))
              throw TypeError("fetchMethod must be a function if specified");
            if (
              ((this.#i = e_),
              (this.#B = !!e_),
              (this.#l = new Map()),
              (this.#c = Array(el).fill(void 0)),
              (this.#u = Array(el).fill(void 0)),
              (this.#d = new ek(el)),
              (this.#p = new ek(el)),
              (this.#g = 0),
              (this.#h = 0),
              (this.#f = Stack.create(el)),
              (this.#a = 0),
              (this.#s = 0),
              "function" == typeof ef && (this.#r = ef),
              "function" == typeof em
                ? ((this.#n = em), (this.#m = []))
                : ((this.#n = void 0), (this.#m = void 0)),
              (this.#w = !!this.#r),
              (this.#_ = !!this.#n),
              (this.noDisposeOnSet = !!eE),
              (this.noUpdateTTL = !!eC),
              (this.noDeleteOnFetchRejection = !!ev),
              (this.allowStaleOnFetchRejection = !!eD),
              (this.allowStaleOnFetchAbort = !!eT),
              (this.ignoreFetchAbort = !!eR),
              0 !== this.maxEntrySize)
            ) {
              if (0 !== this.#A && !isPosInt(this.#A))
                throw TypeError(
                  "maxSize must be a positive integer if specified",
                );
              if (!isPosInt(this.maxEntrySize))
                throw TypeError(
                  "maxEntrySize must be a positive integer if specified",
                );
              this.#T();
            }
            if (
              ((this.allowStale = !!eh),
              (this.noDeleteOnStaleGet = !!eS),
              (this.updateAgeOnGet = !!ep),
              (this.updateAgeOnHas = !!eg),
              (this.ttlResolution = isPosInt(eu) || 0 === eu ? eu : 1),
              (this.ttlAutopurge = !!ed),
              (this.ttl = ec || 0),
              this.ttl)
            ) {
              if (!isPosInt(this.ttl))
                throw TypeError("ttl must be a positive integer if specified");
              this.#R();
            }
            if (0 === this.#t && 0 === this.ttl && 0 === this.#A)
              throw TypeError(
                "At least one of max, maxSize, or ttl is required",
              );
            if (!this.ttlAutopurge && !this.#t && !this.#A) {
              const eA = "LRU_CACHE_UNBOUNDED";
              shouldWarn(eA) &&
                (eQ.add(eA),
                emitWarning(
                  "TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.",
                  "UnboundedCacheWarning",
                  eA,
                  LRUCache,
                ));
            }
          }
          getRemainingTTL(eA) {
            return this.#l.has(eA) ? 1 / 0 : 0;
          }
          #R() {
            let eA = new ZeroArray(this.#t),
              el = new ZeroArray(this.#t);
            ((this.#y = eA),
              (this.#C = el),
              (this.#k = (ec, eu, ed = eS.now()) => {
                if (
                  ((el[ec] = 0 !== eu ? ed : 0),
                  (eA[ec] = eu),
                  0 !== eu && this.ttlAutopurge)
                ) {
                  let eA = setTimeout(() => {
                    this.#D(ec) && this.#M(this.#c[ec], "expire");
                  }, eu + 1);
                  eA.unref && eA.unref();
                }
              }),
              (this.#x = (ec) => {
                el[ec] = 0 !== eA[ec] ? eS.now() : 0;
              }),
              (this.#O = (eu, ed) => {
                if (eA[ed]) {
                  let ep = eA[ed],
                    eg = el[ed];
                  if (!ep || !eg) return;
                  ((eu.ttl = ep), (eu.start = eg), (eu.now = ec || getNow()));
                  let eh = eu.now - eg;
                  eu.remainingTTL = ep - eh;
                }
              }));
            let ec = 0,
              getNow = () => {
                let eA = eS.now();
                if (this.ttlResolution > 0) {
                  ec = eA;
                  let el = setTimeout(() => (ec = 0), this.ttlResolution);
                  el.unref && el.unref();
                }
                return eA;
              };
            ((this.getRemainingTTL = (eu) => {
              let ed = this.#l.get(eu);
              if (void 0 === ed) return 0;
              let ep = eA[ed],
                eg = el[ed];
              return ep && eg ? ep - ((ec || getNow()) - eg) : 1 / 0;
            }),
              (this.#D = (eu) => {
                let ed = el[eu],
                  ep = eA[eu];
                return !!ep && !!ed && (ec || getNow()) - ed > ep;
              }));
          }
          #x = () => {};
          #O = () => {};
          #k = () => {};
          #D = () => !1;
          #T() {
            let eA = new ZeroArray(this.#t);
            ((this.#s = 0),
              (this.#E = eA),
              (this.#N = (el) => {
                ((this.#s -= eA[el]), (eA[el] = 0));
              }),
              (this.#P = (eA, el, ec, eu) => {
                if (this.#b(el)) return 0;
                if (!isPosInt(ec))
                  if (eu) {
                    if ("function" != typeof eu)
                      throw TypeError("sizeCalculation must be a function");
                    if (!isPosInt((ec = eu(el, eA))))
                      throw TypeError(
                        "sizeCalculation return invalid (expect positive integer)",
                      );
                  } else
                    throw TypeError(
                      "invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.",
                    );
                return ec;
              }),
              (this.#L = (el, ec, eu) => {
                if (((eA[el] = ec), this.#A)) {
                  let ec = this.#A - eA[el];
                  for (; this.#s > ec; ) this.#F(!0);
                }
                ((this.#s += eA[el]),
                  eu &&
                    ((eu.entrySize = ec), (eu.totalCalculatedSize = this.#s)));
              }));
          }
          #N = (eA) => {};
          #L = (eA, el, ec) => {};
          #P = (eA, el, ec, eu) => {
            if (ec || eu)
              throw TypeError(
                "cannot set size without setting maxSize or maxEntrySize on cache",
              );
            return 0;
          };
          *#S({ allowStale: eA = this.allowStale } = {}) {
            if (this.#a)
              for (
                let el = this.#h;
                this.#U(el) &&
                ((eA || !this.#D(el)) && (yield el), el !== this.#g);

              )
                el = this.#p[el];
          }
          *#Q({ allowStale: eA = this.allowStale } = {}) {
            if (this.#a)
              for (
                let el = this.#g;
                this.#U(el) &&
                ((eA || !this.#D(el)) && (yield el), el !== this.#h);

              )
                el = this.#d[el];
          }
          #U(eA) {
            return void 0 !== eA && this.#l.get(this.#c[eA]) === eA;
          }
          *entries() {
            for (let eA of this.#S())
              void 0 === this.#u[eA] ||
                void 0 === this.#c[eA] ||
                this.#b(this.#u[eA]) ||
                (yield [this.#c[eA], this.#u[eA]]);
          }
          *rentries() {
            for (let eA of this.#Q())
              void 0 === this.#u[eA] ||
                void 0 === this.#c[eA] ||
                this.#b(this.#u[eA]) ||
                (yield [this.#c[eA], this.#u[eA]]);
          }
          *keys() {
            for (let eA of this.#S()) {
              let el = this.#c[eA];
              void 0 === el || this.#b(this.#u[eA]) || (yield el);
            }
          }
          *rkeys() {
            for (let eA of this.#Q()) {
              let el = this.#c[eA];
              void 0 === el || this.#b(this.#u[eA]) || (yield el);
            }
          }
          *values() {
            for (let eA of this.#S())
              void 0 === this.#u[eA] ||
                this.#b(this.#u[eA]) ||
                (yield this.#u[eA]);
          }
          *rvalues() {
            for (let eA of this.#Q())
              void 0 === this.#u[eA] ||
                this.#b(this.#u[eA]) ||
                (yield this.#u[eA]);
          }
          [Symbol.iterator]() {
            return this.entries();
          }
          [Symbol.toStringTag] = "LRUCache";
          find(eA, el = {}) {
            for (let ec of this.#S()) {
              let eu = this.#u[ec],
                ed = this.#b(eu) ? eu.__staleWhileFetching : eu;
              if (void 0 !== ed && eA(ed, this.#c[ec], this))
                return this.get(this.#c[ec], el);
            }
          }
          forEach(eA, el = this) {
            for (let ec of this.#S()) {
              let eu = this.#u[ec],
                ed = this.#b(eu) ? eu.__staleWhileFetching : eu;
              void 0 !== ed && eA.call(el, ed, this.#c[ec], this);
            }
          }
          rforEach(eA, el = this) {
            for (let ec of this.#Q()) {
              let eu = this.#u[ec],
                ed = this.#b(eu) ? eu.__staleWhileFetching : eu;
              void 0 !== ed && eA.call(el, ed, this.#c[ec], this);
            }
          }
          purgeStale() {
            let eA = !1;
            for (let el of this.#Q({ allowStale: !0 }))
              this.#D(el) && (this.#M(this.#c[el], "expire"), (eA = !0));
            return eA;
          }
          info(eA) {
            let el = this.#l.get(eA);
            if (void 0 === el) return;
            let ec = this.#u[el],
              eu = this.#b(ec) ? ec.__staleWhileFetching : ec;
            if (void 0 === eu) return;
            let ed = { value: eu };
            if (this.#y && this.#C) {
              let eA = this.#y[el],
                ec = this.#C[el];
              eA &&
                ec &&
                ((ed.ttl = eA - (eS.now() - ec)), (ed.start = Date.now()));
            }
            return (this.#E && (ed.size = this.#E[el]), ed);
          }
          dump() {
            let eA = [];
            for (let el of this.#S({ allowStale: !0 })) {
              let ec = this.#c[el],
                eu = this.#u[el],
                ed = this.#b(eu) ? eu.__staleWhileFetching : eu;
              if (void 0 === ed || void 0 === ec) continue;
              let ep = { value: ed };
              if (this.#y && this.#C) {
                ep.ttl = this.#y[el];
                let eA = eS.now() - this.#C[el];
                ep.start = Math.floor(Date.now() - eA);
              }
              (this.#E && (ep.size = this.#E[el]), eA.unshift([ec, ep]));
            }
            return eA;
          }
          load(eA) {
            for (let [el, ec] of (this.clear(), eA)) {
              if (ec.start) {
                let eA = Date.now() - ec.start;
                ec.start = eS.now() - eA;
              }
              this.set(el, ec.value, ec);
            }
          }
          set(eA, el, ec = {}) {
            if (void 0 === el) return (this.delete(eA), this);
            let {
                ttl: eu = this.ttl,
                start: ed,
                noDisposeOnSet: ep = this.noDisposeOnSet,
                sizeCalculation: eg = this.sizeCalculation,
                status: eh,
              } = ec,
              { noUpdateTTL: ef = this.noUpdateTTL } = ec,
              em = this.#P(eA, el, ec.size || 0, eg);
            if (this.maxEntrySize && em > this.maxEntrySize)
              return (
                eh && ((eh.set = "miss"), (eh.maxEntrySizeExceeded = !0)),
                this.#M(eA, "set"),
                this
              );
            let eE = 0 === this.#a ? void 0 : this.#l.get(eA);
            if (void 0 === eE)
              ((eE =
                0 === this.#a
                  ? this.#h
                  : 0 !== this.#f.length
                    ? this.#f.pop()
                    : this.#a === this.#t
                      ? this.#F(!1)
                      : this.#a),
                (this.#c[eE] = eA),
                (this.#u[eE] = el),
                this.#l.set(eA, eE),
                (this.#d[this.#h] = eE),
                (this.#p[eE] = this.#h),
                (this.#h = eE),
                this.#a++,
                this.#L(eE, em, eh),
                eh && (eh.set = "add"),
                (ef = !1));
            else {
              this.#v(eE);
              let ec = this.#u[eE];
              if (el !== ec) {
                if (this.#B && this.#b(ec)) {
                  ec.__abortController.abort(Error("replaced"));
                  let { __staleWhileFetching: el } = ec;
                  void 0 !== el &&
                    !ep &&
                    (this.#w && this.#r?.(el, eA, "set"),
                    this.#_ && this.#m?.push([el, eA, "set"]));
                } else
                  !ep &&
                    (this.#w && this.#r?.(ec, eA, "set"),
                    this.#_ && this.#m?.push([ec, eA, "set"]));
                if (
                  (this.#N(eE), this.#L(eE, em, eh), (this.#u[eE] = el), eh)
                ) {
                  eh.set = "replace";
                  let eA = ec && this.#b(ec) ? ec.__staleWhileFetching : ec;
                  void 0 !== eA && (eh.oldValue = eA);
                }
              } else eh && (eh.set = "update");
            }
            if (
              (0 === eu || this.#y || this.#R(),
              this.#y && (ef || this.#k(eE, eu, ed), eh && this.#O(eh, eE)),
              !ep && this.#_ && this.#m)
            ) {
              let eA,
                el = this.#m;
              for (; (eA = el?.shift()); ) this.#n?.(...eA);
            }
            return this;
          }
          pop() {
            try {
              for (; this.#a; ) {
                let eA = this.#u[this.#g];
                if ((this.#F(!0), this.#b(eA))) {
                  if (eA.__staleWhileFetching) return eA.__staleWhileFetching;
                } else if (void 0 !== eA) return eA;
              }
            } finally {
              if (this.#_ && this.#m) {
                let eA,
                  el = this.#m;
                for (; (eA = el?.shift()); ) this.#n?.(...eA);
              }
            }
          }
          #F(eA) {
            let el = this.#g,
              ec = this.#c[el],
              eu = this.#u[el];
            return (
              this.#B && this.#b(eu)
                ? eu.__abortController.abort(Error("evicted"))
                : (this.#w || this.#_) &&
                  (this.#w && this.#r?.(eu, ec, "evict"),
                  this.#_ && this.#m?.push([eu, ec, "evict"])),
              this.#N(el),
              eA &&
                ((this.#c[el] = void 0),
                (this.#u[el] = void 0),
                this.#f.push(el)),
              1 === this.#a
                ? ((this.#g = this.#h = 0), (this.#f.length = 0))
                : (this.#g = this.#d[el]),
              this.#l.delete(ec),
              this.#a--,
              el
            );
          }
          has(eA, el = {}) {
            let { updateAgeOnHas: ec = this.updateAgeOnHas, status: eu } = el,
              ed = this.#l.get(eA);
            if (void 0 !== ed) {
              let eA = this.#u[ed];
              if (this.#b(eA) && void 0 === eA.__staleWhileFetching) return !1;
              if (!this.#D(ed))
                return (
                  ec && this.#x(ed),
                  eu && ((eu.has = "hit"), this.#O(eu, ed)),
                  !0
                );
              eu && ((eu.has = "stale"), this.#O(eu, ed));
            } else eu && (eu.has = "miss");
            return !1;
          }
          peek(eA, el = {}) {
            let { allowStale: ec = this.allowStale } = el,
              eu = this.#l.get(eA);
            if (void 0 === eu || (!ec && this.#D(eu))) return;
            let ed = this.#u[eu];
            return this.#b(ed) ? ed.__staleWhileFetching : ed;
          }
          #I(eA, el, ec, eu) {
            let ed = void 0 === el ? void 0 : this.#u[el];
            if (this.#b(ed)) return ed;
            let ep = new eT(),
              { signal: eg } = ec;
            eg?.addEventListener("abort", () => ep.abort(eg.reason), {
              signal: ep.signal,
            });
            let eh = { signal: ep.signal, options: ec, context: eu },
              cb = (eu, ed = !1) => {
                let { aborted: eg } = ep.signal,
                  em = ec.ignoreFetchAbort && void 0 !== eu;
                if (
                  (ec.status &&
                    (eg && !ed
                      ? ((ec.status.fetchAborted = !0),
                        (ec.status.fetchError = ep.signal.reason),
                        em && (ec.status.fetchAbortIgnored = !0))
                      : (ec.status.fetchResolved = !0)),
                  eg && !em && !ed)
                )
                  return fetchFail(ep.signal.reason);
                let eE = ef;
                return (
                  this.#u[el] === ef &&
                    (void 0 === eu
                      ? eE.__staleWhileFetching
                        ? (this.#u[el] = eE.__staleWhileFetching)
                        : this.#M(eA, "fetch")
                      : (ec.status && (ec.status.fetchUpdated = !0),
                        this.set(eA, eu, eh.options))),
                  eu
                );
              },
              eb = (eA) => (
                ec.status &&
                  ((ec.status.fetchRejected = !0), (ec.status.fetchError = eA)),
                fetchFail(eA)
              ),
              fetchFail = (eu) => {
                let { aborted: ed } = ep.signal,
                  eg = ed && ec.allowStaleOnFetchAbort,
                  eh = eg || ec.allowStaleOnFetchRejection,
                  em = eh || ec.noDeleteOnFetchRejection,
                  eE = ef;
                if (
                  (this.#u[el] === ef &&
                    (em && void 0 !== eE.__staleWhileFetching
                      ? eg || (this.#u[el] = eE.__staleWhileFetching)
                      : this.#M(eA, "fetch")),
                  eh)
                )
                  return (
                    ec.status &&
                      void 0 !== eE.__staleWhileFetching &&
                      (ec.status.returnedStale = !0),
                    eE.__staleWhileFetching
                  );
                if (eE.__returned === eE) throw eu;
              },
              pcall = (el, eu) => {
                let eg = this.#i?.(eA, ed, eh);
                (eg &&
                  eg instanceof Promise &&
                  eg.then((eA) => el(void 0 === eA ? void 0 : eA), eu),
                  ep.signal.addEventListener("abort", () => {
                    (!ec.ignoreFetchAbort || ec.allowStaleOnFetchAbort) &&
                      (el(void 0),
                      ec.allowStaleOnFetchAbort && (el = (eA) => cb(eA, !0)));
                  }));
              };
            ec.status && (ec.status.fetchDispatched = !0);
            let ef = new Promise(pcall).then(cb, eb),
              em = Object.assign(ef, {
                __abortController: ep,
                __staleWhileFetching: ed,
                __returned: void 0,
              });
            return (
              void 0 === el
                ? (this.set(eA, em, { ...eh.options, status: void 0 }),
                  (el = this.#l.get(eA)))
                : (this.#u[el] = em),
              em
            );
          }
          #b(eA) {
            if (!this.#B) return !1;
            let el = eA;
            return (
              !!el &&
              el instanceof Promise &&
              el.hasOwnProperty("__staleWhileFetching") &&
              el.__abortController instanceof eT
            );
          }
          async fetch(eA, el = {}) {
            let {
              allowStale: ec = this.allowStale,
              updateAgeOnGet: eu = this.updateAgeOnGet,
              noDeleteOnStaleGet: ed = this.noDeleteOnStaleGet,
              ttl: ep = this.ttl,
              noDisposeOnSet: eg = this.noDisposeOnSet,
              size: eh = 0,
              sizeCalculation: ef = this.sizeCalculation,
              noUpdateTTL: em = this.noUpdateTTL,
              noDeleteOnFetchRejection: eE = this.noDeleteOnFetchRejection,
              allowStaleOnFetchRejection: eC = this.allowStaleOnFetchRejection,
              ignoreFetchAbort: ey = this.ignoreFetchAbort,
              allowStaleOnFetchAbort: ew = this.allowStaleOnFetchAbort,
              context: eB,
              forceRefresh: e_ = !1,
              status: eI,
              signal: ev,
            } = el;
            if (!this.#B)
              return (
                eI && (eI.fetch = "get"),
                this.get(eA, {
                  allowStale: ec,
                  updateAgeOnGet: eu,
                  noDeleteOnStaleGet: ed,
                  status: eI,
                })
              );
            let eS = {
                allowStale: ec,
                updateAgeOnGet: eu,
                noDeleteOnStaleGet: ed,
                ttl: ep,
                noDisposeOnSet: eg,
                size: eh,
                sizeCalculation: ef,
                noUpdateTTL: em,
                noDeleteOnFetchRejection: eE,
                allowStaleOnFetchRejection: eC,
                allowStaleOnFetchAbort: ew,
                ignoreFetchAbort: ey,
                status: eI,
                signal: ev,
              },
              eQ = this.#l.get(eA);
            if (void 0 === eQ) {
              eI && (eI.fetch = "miss");
              let el = this.#I(eA, eQ, eS, eB);
              return (el.__returned = el);
            }
            {
              let el = this.#u[eQ];
              if (this.#b(el)) {
                let eA = ec && void 0 !== el.__staleWhileFetching;
                return (
                  eI &&
                    ((eI.fetch = "inflight"), eA && (eI.returnedStale = !0)),
                  eA ? el.__staleWhileFetching : (el.__returned = el)
                );
              }
              let ed = this.#D(eQ);
              if (!e_ && !ed)
                return (
                  eI && (eI.fetch = "hit"),
                  this.#v(eQ),
                  eu && this.#x(eQ),
                  eI && this.#O(eI, eQ),
                  el
                );
              let ep = this.#I(eA, eQ, eS, eB),
                eg = void 0 !== ep.__staleWhileFetching && ec;
              return (
                eI &&
                  ((eI.fetch = ed ? "stale" : "refresh"),
                  eg && ed && (eI.returnedStale = !0)),
                eg ? ep.__staleWhileFetching : (ep.__returned = ep)
              );
            }
          }
          async forceFetch(eA, el = {}) {
            let ec = await this.fetch(eA, el);
            if (void 0 === ec) throw Error("fetch() returned undefined");
            return ec;
          }
          memo(eA, el = {}) {
            let ec = this.#o;
            if (!ec) throw Error("no memoMethod provided to constructor");
            let { context: eu, forceRefresh: ed, ...ep } = el,
              eg = this.get(eA, ep);
            if (!ed && void 0 !== eg) return eg;
            let eh = ec(eA, eg, { options: ep, context: eu });
            return (this.set(eA, eh, ep), eh);
          }
          get(eA, el = {}) {
            let {
                allowStale: ec = this.allowStale,
                updateAgeOnGet: eu = this.updateAgeOnGet,
                noDeleteOnStaleGet: ed = this.noDeleteOnStaleGet,
                status: ep,
              } = el,
              eg = this.#l.get(eA);
            if (void 0 !== eg) {
              let el = this.#u[eg],
                eh = this.#b(el);
              return (ep && this.#O(ep, eg), this.#D(eg))
                ? (ep && (ep.get = "stale"), eh)
                  ? (ep &&
                      ec &&
                      void 0 !== el.__staleWhileFetching &&
                      (ep.returnedStale = !0),
                    ec ? el.__staleWhileFetching : void 0)
                  : (ed || this.#M(eA, "expire"),
                    ep && ec && (ep.returnedStale = !0),
                    ec ? el : void 0)
                : (ep && (ep.get = "hit"), eh)
                  ? el.__staleWhileFetching
                  : (this.#v(eg), eu && this.#x(eg), el);
            }
            ep && (ep.get = "miss");
          }
          #j(eA, el) {
            ((this.#p[el] = eA), (this.#d[eA] = el));
          }
          #v(eA) {
            eA !== this.#h &&
              (eA === this.#g
                ? (this.#g = this.#d[eA])
                : this.#j(this.#p[eA], this.#d[eA]),
              this.#j(this.#h, eA),
              (this.#h = eA));
          }
          delete(eA) {
            return this.#M(eA, "delete");
          }
          #M(eA, el) {
            let ec = !1;
            if (0 !== this.#a) {
              let eu = this.#l.get(eA);
              if (void 0 !== eu)
                if (((ec = !0), 1 === this.#a)) this.#G(el);
                else {
                  this.#N(eu);
                  let ec = this.#u[eu];
                  if (
                    (this.#b(ec)
                      ? ec.__abortController.abort(Error("deleted"))
                      : (this.#w || this.#_) &&
                        (this.#w && this.#r?.(ec, eA, el),
                        this.#_ && this.#m?.push([ec, eA, el])),
                    this.#l.delete(eA),
                    (this.#c[eu] = void 0),
                    (this.#u[eu] = void 0),
                    eu === this.#h)
                  )
                    this.#h = this.#p[eu];
                  else if (eu === this.#g) this.#g = this.#d[eu];
                  else {
                    let eA = this.#p[eu];
                    this.#d[eA] = this.#d[eu];
                    let el = this.#d[eu];
                    this.#p[el] = this.#p[eu];
                  }
                  (this.#a--, this.#f.push(eu));
                }
            }
            if (this.#_ && this.#m?.length) {
              let eA,
                el = this.#m;
              for (; (eA = el?.shift()); ) this.#n?.(...eA);
            }
            return ec;
          }
          clear() {
            return this.#G("delete");
          }
          #G(eA) {
            for (let el of this.#Q({ allowStale: !0 })) {
              let ec = this.#u[el];
              if (this.#b(ec)) ec.__abortController.abort(Error("deleted"));
              else {
                let eu = this.#c[el];
                (this.#w && this.#r?.(ec, eu, eA),
                  this.#_ && this.#m?.push([ec, eu, eA]));
              }
            }
            if (
              (this.#l.clear(),
              this.#u.fill(void 0),
              this.#c.fill(void 0),
              this.#y && this.#C && (this.#y.fill(0), this.#C.fill(0)),
              this.#E && this.#E.fill(0),
              (this.#g = 0),
              (this.#h = 0),
              (this.#f.length = 0),
              (this.#s = 0),
              (this.#a = 0),
              this.#_ && this.#m)
            ) {
              let eA,
                el = this.#m;
              for (; (eA = el?.shift()); ) this.#n?.(...eA);
            }
          }
        };
        var ek = ec(81822),
          eM = ec(43408),
          ex = ec(25318),
          eO = ec(46077),
          eN = ec(24434),
          eP = "net.transport",
          eL = "net.peer.ip",
          eF = "net.peer.port",
          eU = "net.peer.name",
          ej = "net.host.ip",
          eG = "net.host.port",
          eH = "net.host.name",
          eK = "http.method",
          e$ = "http.url",
          eY = "http.target",
          eJ = "http.host",
          ez = "http.scheme",
          eW = "http.status_code",
          eV = "http.flavor",
          eZ = "http.user_agent",
          eX = "http.request_content_length",
          e0 = "http.request_content_length_uncompressed",
          e1 = "http.response_content_length",
          e2 = "http.response_content_length_uncompressed",
          e3 = "http.server_name",
          e4 = "http.route",
          e8 = "http.client_ip",
          e5 = "ip_tcp",
          e6 = "ip_udp",
          e9 = ec(15183);
        !(function (eA) {
          ((eA.JSON = "application/json"),
            (eA.TEXT = "text/plain"),
            (eA.FORM = "application/x-www-form-urlencoded"),
            (eA.FILE = "multipart/form-data"));
        })(eu || (eu = {}));
        var e7 = ec(79896);
        !(function (eA) {
          ((eA.HTTP_ERROR_NAME = "http.error_name"),
            (eA.HTTP_ERROR_MESSAGE = "http.error_message"),
            (eA.HTTP_STATUS_TEXT = "http.status_text"));
        })(ed || (ed = {}));
        let tn = [
            e9.ClientServerMetricAttributes.UserExt1,
            e9.ClientServerMetricAttributes.UserExt2,
            e9.ClientServerMetricAttributes.UserExt3,
          ],
          getAbsoluteUrl = (eA, el, ec = "http:") => {
            var eu;
            let ed = eA || {},
              ep = (null == ed ? void 0 : ed.protocol) || ec,
              eg = ((null == ed ? void 0 : ed.port) || "").toString(),
              eh = (null == ed ? void 0 : ed.path) || "/",
              ef =
                (null == ed ? void 0 : ed.host) ||
                (null == ed ? void 0 : ed.hostname) ||
                (null == el ? void 0 : el.host) ||
                "localhost";
            return (
              (null == (eu = ef) ? void 0 : eu.indexOf(":")) === -1 &&
                eg &&
                "80" !== eg &&
                "443" !== eg &&
                (ef += `:${eg}`),
              `${ep}//${ef}${eh}`
            );
          },
          parseResponseStatus = (eA, el) => {
            let ec = eA === em.SpanKind.CLIENT ? 400 : 500;
            return el && el >= 100 && el < ec
              ? ef.SpanStatusCode.UNSET
              : ef.SpanStatusCode.ERROR;
          },
          satisfiesPattern = (eA, el) => {
            if ("string" == typeof el) return el === eA;
            if (el instanceof RegExp) return el.test(eA);
            if ("function" == typeof el) return el(eA);
            throw TypeError("Pattern is in unsupported datatype");
          },
          isIgnored = (eA, el, ec) => {
            if (!el) return !1;
            try {
              for (let ec of el) if (satisfiesPattern(eA, ec)) return !0;
            } catch (eA) {
              ec && ec(eA);
            }
            return !1;
          },
          setSpanWithError = (eA, el) => {
            let ec = null == el ? void 0 : el.message;
            (eA.setAttribute(ed.HTTP_ERROR_NAME, null == el ? void 0 : el.name),
              eA.setAttribute(ed.HTTP_ERROR_MESSAGE, ec),
              eA.setStatus({ code: ef.SpanStatusCode.ERROR, message: ec }),
              eA.recordException(el));
          },
          setRequestContentLengthAttribute = (eA, el) => {
            let ec = getContentLength(null == eA ? void 0 : eA.headers);
            null !== ec &&
              (isCompressed(null == eA ? void 0 : eA.headers)
                ? (el[eX] = ec)
                : (el[e0] = ec));
          },
          setResponseContentLengthAttribute = (eA, el) => {
            let ec = getContentLength(null == eA ? void 0 : eA.headers);
            null !== ec &&
              (isCompressed(null == eA ? void 0 : eA.headers)
                ? (el[e1] = ec)
                : (el[e2] = ec));
          };
        function getContentLength(eA) {
          let el = null == eA ? void 0 : eA["content-length"];
          if (void 0 === el) return null;
          let ec = parseInt(el, 10);
          return isNaN(ec) ? null : ec;
        }
        let isCompressed = (eA) => {
            let el = null == eA ? void 0 : eA["content-encoding"];
            return !!el && "identity" !== el;
          },
          getRequestInfo = (eA, el) => {
            var ec, eu, ed, ep, eg;
            let eh,
              ef = "/",
              em = "";
            if ("string" == typeof eA)
              ((ef =
                (null == (ec = eh = ev.parse(eA)) ? void 0 : ec.pathname) ||
                "/"),
                (em = `${(null == eh ? void 0 : eh.protocol) || "http:"}//${null == eh ? void 0 : eh.host}`),
                void 0 !== el && Object.assign(eh, el));
            else if (eA instanceof ev.URL)
              ((eh = {
                protocol: null == eA ? void 0 : eA.protocol,
                hostname:
                  "string" == typeof (null == eA ? void 0 : eA.hostname) &&
                  (null == eA ? void 0 : eA.hostname.startsWith("["))
                    ? null == (eu = null == eA ? void 0 : eA.hostname)
                      ? void 0
                      : eu.slice(1, -1)
                    : null == eA
                      ? void 0
                      : eA.hostname,
                path: `${(null == eA ? void 0 : eA.pathname) || ""}${(null == eA ? void 0 : eA.search) || ""}`,
              }),
                (null == eA ? void 0 : eA.port) !== "" &&
                  (eh.port = Number(null == eA ? void 0 : eA.port)),
                ((null == eA ? void 0 : eA.username) ||
                  (null == eA ? void 0 : eA.password)) &&
                  (eh.auth = `${null == eA ? void 0 : eA.username}:${null == eA ? void 0 : eA.password}`),
                (ef = null == eA ? void 0 : eA.pathname),
                (em = null == eA ? void 0 : eA.origin),
                void 0 !== el && Object.assign(eh, el));
            else {
              ((eh = Object.assign(
                {
                  protocol: (null == eA ? void 0 : eA.host) ? "http:" : void 0,
                },
                eA,
              )),
                (ef = null == (ed = eA) ? void 0 : ed.pathname) ||
                  null == eh ||
                  !eh.path ||
                  (ef =
                    (null == (ep = ev.parse(null == eh ? void 0 : eh.path))
                      ? void 0
                      : ep.pathname) || "/"));
              let el =
                (null == eh ? void 0 : eh.host) ||
                ((null == eh ? void 0 : eh.port) != null
                  ? `${null == eh ? void 0 : eh.hostname}${null == eh ? void 0 : eh.port}`
                  : null == eh
                    ? void 0
                    : eh.hostname);
              em = `${(null == eh ? void 0 : eh.protocol) || "http:"}//${el}`;
            }
            return {
              origin: em,
              pathname: ef,
              method: (null == eh ? void 0 : eh.method)
                ? null == (eg = null == eh ? void 0 : eh.method)
                  ? void 0
                  : eg.toUpperCase()
                : "GET",
              optionsParsed: eh,
            };
          },
          isValidOptionsType = (eA) => {
            if (!eA) return !1;
            let el = typeof eA;
            return "string" === el || ("object" === el && !Array.isArray(eA));
          },
          extractHostnameAndPort = (eA) => {
            var el;
            if (
              (null == eA ? void 0 : eA.hostname) &&
              (null == eA ? void 0 : eA.port)
            )
              return { hostname: eA.hostname, port: eA.port };
            let ec =
                (null == (el = null == eA ? void 0 : eA.host)
                  ? void 0
                  : el.match(/^([^:/ ]+)(:\d{1,5})?/)) || null,
              eu =
                (null == eA ? void 0 : eA.hostname) ||
                (null === ec ? "localhost" : ec[1]),
              ed = null == eA ? void 0 : eA.port;
            return (
              ed ||
                (ed =
                  ec && ec[2]
                    ? ec[2].substring(1)
                    : (null == eA ? void 0 : eA.protocol) === "https:"
                      ? "443"
                      : "80"),
              { hostname: eu, port: ed }
            );
          },
          getOutgoingRequestAttributes = (eA, el) => {
            var ec, eu;
            let ed = null == el ? void 0 : el.hostname,
              ep = null == el ? void 0 : el.port,
              eg = null == eA ? void 0 : eA.method,
              eh = eg ? eg.toUpperCase() : "GET",
              ef = (null == eA ? void 0 : eA.headers) || {},
              em = null == ef ? void 0 : ef["user-agent"],
              eE = {
                [e$]: getAbsoluteUrl(
                  eA,
                  ef,
                  `${null == el ? void 0 : el.component}:`,
                ),
                [eK]: eh,
                [eY]: (null == eA ? void 0 : eA.path) || "/",
                [eU]: ed,
                [eJ]:
                  null != (ec = null == ef ? void 0 : ef.host)
                    ? ec
                    : `${ed}:${ep}`,
              },
              eC = "";
            try {
              ((eu = new URL(null == eE ? void 0 : eE[e$])),
                (eC = void 0 === eu ? void 0 : eu.pathname));
            } catch (eA) {
              eC = "";
            }
            return (
              (eE[e9.GalileoTraceAttributes.TRPC_CALLEE_METHOD] = eC),
              void 0 !== em && (eE[eZ] = em),
              Object.assign(eE, el.hookAttributes)
            );
          },
          getOutgoingRequestMetricAttributes = (eA) => {
            let el = {};
            return (
              (el[eK] = null == eA ? void 0 : eA[eK]),
              (el[eU] = null == eA ? void 0 : eA[eU]),
              Object.assign(el, genClientMetricAttributes(eA))
            );
          },
          setAttributesFromHttpKind = (eA, el) => {
            eA &&
              ((el[eV] = eA),
              "QUIC" !== eA.toUpperCase() ? (el[eP] = e5) : (el[eP] = e6));
          },
          getOutgoingRequestAttributesOnResponse = (eA) => {
            let {
                statusCode: el,
                statusMessage: ec,
                httpVersion: eu,
                socket: ep,
              } = eA,
              eg = {};
            if (ep) {
              let { remoteAddress: eA, remotePort: el } = ep;
              ((eg[eL] = eA), (eg[eF] = el));
            }
            return (
              setResponseContentLengthAttribute(eA, eg),
              el &&
                ((eg[eW] = el),
                (eg[ed.HTTP_STATUS_TEXT] = (ec || "").toUpperCase())),
              setAttributesFromHttpKind(eu, eg),
              eg
            );
          },
          getOutgoingRequestMetricAttributesOnResponse = (eA) => {
            let el = {};
            return (
              (el[eF] = null == eA ? void 0 : eA[eF]),
              (el[eW] = null == eA ? void 0 : eA[eW]),
              (el[eV] = null == eA ? void 0 : eA[eV]),
              (el[e9.ClientServerMetricAttributes.Code] =
                null == eA ? void 0 : eA[eW]),
              (el[e9.ClientServerMetricAttributes.CodeType] = getCodeType(
                null == eA ? void 0 : eA[eW],
              )),
              el
            );
          },
          getIncomingRequestAttributes = (eA, el) => {
            var ec, eu;
            let ed = null == eA ? void 0 : eA.headers,
              ep = null == ed ? void 0 : ed["user-agent"],
              eg = null == ed ? void 0 : ed["x-forwarded-for"],
              eh = (null == eA ? void 0 : eA.method) || "GET",
              ef = null == eA ? void 0 : eA.httpVersion,
              em = (null == eA ? void 0 : eA.url) ? ev.parse(eA.url) : null,
              eE =
                (null == em ? void 0 : em.host) ||
                (null == ed ? void 0 : ed.host),
              eC =
                (null == em ? void 0 : em.hostname) ||
                (null == eE
                  ? void 0
                  : eE.replace(/^(.*)(:[0-9]{1,5})/, "$1")) ||
                "localhost",
              ey = null == el ? void 0 : el.serverName,
              ew = {
                [e$]: getAbsoluteUrl(
                  em,
                  ed,
                  `${null == el ? void 0 : el.component}:`,
                ),
                [eJ]: eE,
                [eH]: eC,
                [eK]: eh,
                [ez]: null == el ? void 0 : el.component,
              };
            if (
              ("string" == typeof eg &&
                (ew[e8] = null == (ec = eg.split(",")) ? void 0 : ec[0]),
              "string" == typeof ey && (ew[e3] = ey),
              em)
            ) {
              let eA = (null == ed ? void 0 : ed.caller_method) || "",
                el = "";
              "clb-healthcheck" === ep && (eA = "clb-healthcheck");
              let ec = "TST(Tencent_Security_Team)";
              ep &&
                (null == ep ? void 0 : ep.indexOf(ec)) > -1 &&
                (eA = "Tencent-Leakscan");
              try {
                ((eu = new URL(null == ew ? void 0 : ew[e$])),
                  (el = void 0 === eu ? void 0 : eu.pathname));
              } catch (eA) {
                el = "";
              }
              ((ew[eY] = (null == em ? void 0 : em.path) || "/"),
                (ew[e9.GalileoTraceAttributes.TRPC_CALLEE_METHOD] = el),
                (ew[e9.GalileoTraceAttributes.TRPC_CALLER_METHOD] = eA));
            }
            return (
              void 0 !== ep && (ew[eZ] = ep),
              setRequestContentLengthAttribute(eA, ew),
              setAttributesFromHttpKind(ef, ew),
              Object.assign(ew, el.hookAttributes)
            );
          },
          getIncomingRequestMetricAttributes = (eA) => {
            let el = {};
            return (
              (el[ez] = null == eA ? void 0 : eA[ez]),
              (el[eK] = null == eA ? void 0 : eA[eK]),
              (el[eH] = null == eA ? void 0 : eA[eH]),
              (el[eV] = null == eA ? void 0 : eA[eV]),
              Object.assign(el, genServerMetricAttributes(eA))
            );
          },
          getIncomingRequestAttributesOnResponse = (eA, el) => {
            let { socket: ec } = eA,
              { statusCode: eu, statusMessage: ep } = el,
              eg = (0, eO.getRPCMetadata)(eh.context.active()),
              ef = {};
            if (ec) {
              let {
                localAddress: eA,
                localPort: el,
                remoteAddress: eu,
                remotePort: ed,
              } = ec;
              ((ef[ej] = eA), (ef[eG] = el), (ef[eL] = eu), (ef[eF] = ed));
            }
            return (
              (ef[eW] = eu),
              (ef[ed.HTTP_STATUS_TEXT] = (ep || "").toUpperCase()),
              (null == eg ? void 0 : eg.type) === eO.RPCType.HTTP &&
                (null == eg ? void 0 : eg.route) !== void 0 &&
                (ef[e4] = eg.route),
              ef
            );
          },
          getIncomingRequestMetricAttributesOnResponse = (eA) => {
            let el = {};
            return (
              (el[eW] = null == eA ? void 0 : eA[eW]),
              (el[eG] = null == eA ? void 0 : eA[eG]),
              (null == eA ? void 0 : eA[e4]) !== void 0 && (el[e4] = eA[e4]),
              (el[e9.ClientServerMetricAttributes.Code] =
                null == eA ? void 0 : eA[eW]),
              (el[e9.ClientServerMetricAttributes.CodeType] = getCodeType(
                null == eA ? void 0 : eA[eW],
              )),
              el
            );
          };
        function headerCapture(eA, el) {
          let ec = new Map();
          for (
            let eA = 0, eu = null == el ? void 0 : el.length;
            eA < eu;
            eA++
          ) {
            let eu = null == el ? void 0 : el[eA].toLowerCase();
            ec.set(eu, null == eu ? void 0 : eu.replace(/-/g, "_"));
          }
          return (el, eu) => {
            for (let ed of ec.keys()) {
              let ep = eu(ed);
              if (void 0 === ep) continue;
              let eg = ec.get(ed),
                eh = `http.${eA}.header.${eg}`;
              "string" == typeof ep
                ? el.setAttribute(eh, [ep])
                : Array.isArray(ep)
                  ? el.setAttribute(eh, ep)
                  : el.setAttribute(eh, [ep]);
            }
          };
        }
        let debugLogToFile = (eA, el) => {
            e7.appendFile(`${eA}.log`, el + "\n", (eA) => {
              if (eA) throw eA;
            });
          },
          getKindName = (eA) => {
            switch (eA) {
              case em.SpanKind.CLIENT:
                return "client";
              case em.SpanKind.SERVER:
                return "server";
              default:
                return "";
            }
          };
        !(function (eA) {
          ((eA.success = "success"),
            (eA.exception = "exception"),
            (eA.timeout = "timeout"));
        })(ep || (ep = {}));
        let getCodeType = (eA) => {
            let el = "",
              ec = 0;
            try {
              ec = Number(eA);
            } catch (eA) {
              ec = 0;
            }
            return 504 === ec
              ? ep.timeout
              : 200 === ec
                ? ep.success
                : ep.exception;
          },
          shouldFilterMetric = (eA, el, ec) => {
            var eu, ed;
            return eA === em.SpanKind.CLIENT
              ? null == (eu = null == el ? void 0 : el.calleeMethod)
                ? void 0
                : eu.includes(
                    null == ec
                      ? void 0
                      : ec[e9.ClientServerMetricAttributes.CalleeMethod],
                  )
              : eA !== em.SpanKind.SERVER ||
                  (null == (ed = null == el ? void 0 : el.callerMethod)
                    ? void 0
                    : ed.includes(
                        null == ec
                          ? void 0
                          : ec[e9.ClientServerMetricAttributes.CallerMethod],
                      ));
          },
          genClientMetricAttributes = (eA) => ({
            [e9.ClientServerMetricAttributes.CallerService]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerService],
            [e9.ClientServerMetricAttributes.CallerMethod]: "",
            [e9.ClientServerMetricAttributes.CallerConSetid]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerConSetid],
            [e9.ClientServerMetricAttributes.CallerServer]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerServer],
            [e9.ClientServerMetricAttributes.CallerGroup]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerGroup],
            [e9.ClientServerMetricAttributes.CalleeServer]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CalleeServer],
            [e9.ClientServerMetricAttributes.CalleeService]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CalleeService],
            [e9.ClientServerMetricAttributes.CalleeMethod]:
              (null == eA ? void 0 : eA["trpc.callee_method"]) || "",
            [e9.ClientServerMetricAttributes.CalleeConSetid]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CalleeConSetid],
            [e9.ClientServerMetricAttributes.CalleeIp]:
              (null == eA ? void 0 : eA["net.peer.name"]) || "",
            [e9.ClientServerMetricAttributes.CalleeContainer]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CalleeContainer],
            [e9.ClientServerMetricAttributes.Code]: "",
            [e9.ClientServerMetricAttributes.CodeType]: "",
            [e9.ClientServerMetricAttributes.UserExt1]:
              (null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.UserExt1]) || "",
            [e9.ClientServerMetricAttributes.UserExt2]:
              (null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.UserExt2]) || "",
            [e9.ClientServerMetricAttributes.UserExt3]:
              (null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.UserExt3]) || "",
          }),
          genServerMetricAttributes = (eA) => ({
            [e9.ClientServerMetricAttributes.CallerService]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerService],
            [e9.ClientServerMetricAttributes.CallerMethod]:
              (null == eA ? void 0 : eA["trpc.caller_method"]) ||
              (null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerMethod]),
            [e9.ClientServerMetricAttributes.CallerConSetid]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerConSetid],
            [e9.ClientServerMetricAttributes.CallerServer]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerServer],
            [e9.ClientServerMetricAttributes.CallerGroup]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerGroup],
            [e9.ClientServerMetricAttributes.CallerIp]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerIp],
            [e9.ClientServerMetricAttributes.CallerContainer]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CallerContainer],
            [e9.ClientServerMetricAttributes.CalleeServer]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CalleeServer],
            [e9.ClientServerMetricAttributes.CalleeService]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CalleeService],
            [e9.ClientServerMetricAttributes.CalleeMethod]:
              (null == eA ? void 0 : eA["trpc.callee_method"]) || "",
            [e9.ClientServerMetricAttributes.CalleeConSetid]:
              null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.CalleeConSetid],
            [e9.ClientServerMetricAttributes.Code]: "",
            [e9.ClientServerMetricAttributes.CodeType]: "",
            [e9.ClientServerMetricAttributes.UserExt1]:
              (null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.UserExt1]) || "",
            [e9.ClientServerMetricAttributes.UserExt2]:
              (null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.UserExt2]) || "",
            [e9.ClientServerMetricAttributes.UserExt3]:
              (null == eA
                ? void 0
                : eA[e9.ClientServerMetricAttributes.UserExt3]) || "",
          });
        let HttpInstrumentation = class HttpInstrumentation extends ek.InstrumentationBase {
          constructor(eA = {}) {
            var el, ec, eu;
            (super("", "", eA),
              (this._spanNotEnded = new WeakSet()),
              (this._cacheLRUMap = new LRUCache({ max: 10 })),
              (this._headerCapture = this._createHeaderCapture()),
              (this._clientMeter = eA.meterProvider.getMeter(
                e9.GalileoMeters.clientMetrics,
                "",
              )),
              (this._serverMeter = eA.meterProvider.getMeter(
                e9.GalileoMeters.serverMetrics,
                "",
              )),
              (this._selfMeter = eA.selfMeterProvider.getMeter(
                null == (el = eA.pluginParams) ? void 0 : el.selfMonitor,
                "",
              )),
              (this._pluginConfig = { ...eA.pluginParams }),
              (this._selfAttributes = {
                SdkTarget:
                  null == (ec = this._pluginConfig) ? void 0 : ec.target,
                TargetNameSpace:
                  null == (eu = this._pluginConfig) ? void 0 : eu.namespace,
                ReportType: "",
                Protocol: "http",
                Kind: "",
                Status: "",
              }),
              this._updateMeter());
          }
          _updateMeter() {
            ((this._nodeInstrumentStartCounter = this._selfMeter.createCounter(
              "node_instrument_start",
              { valueType: eg.ValueType.INT },
            )),
              (this._nodeInstrumentEndCounter = this._selfMeter.createCounter(
                "node_instrument_end",
                { valueType: eg.ValueType.INT },
              )),
              (this._httpClientDurationHistogram =
                this._clientMeter.createHistogram(
                  e9.ClientServerMetrics.ClientHandledSeconds,
                  { description: "请求耗时", valueType: eg.ValueType.DOUBLE },
                )),
              (this._httpClientTotalCounter = this._clientMeter.createCounter(
                e9.ClientServerMetrics.ClientStartedTotal,
                { valueType: eg.ValueType.INT },
              )),
              (this._httpClientSuccessCounter = this._clientMeter.createCounter(
                e9.ClientServerMetrics.ClientHandledTotal,
                { valueType: eg.ValueType.INT },
              )),
              (this._httpServerDurationHistogram =
                this._serverMeter.createHistogram(
                  e9.ClientServerMetrics.ServerHandledSeconds,
                  { description: "请求耗时", valueType: eg.ValueType.DOUBLE },
                )),
              (this._httpServerTotalCounter = this._serverMeter.createCounter(
                e9.ClientServerMetrics.ServerStartedTotal,
                { valueType: eg.ValueType.INT },
              )),
              (this._httpServerSuccessCounter = this._serverMeter.createCounter(
                e9.ClientServerMetrics.ServerHandledTotal,
                { valueType: eg.ValueType.INT },
              )));
          }
          setConfig(eA = {}) {
            (super.setConfig(eA),
              (this._headerCapture = this._createHeaderCapture()));
          }
          init() {
            return [
              this._getHttpsInstrumentation(),
              this._getHttpInstrumentation(),
            ];
          }
          _getHttpInstrumentation() {
            return new eM.InstrumentationNodeModuleDefinition(
              "http",
              ["*"],
              (eA) => {
                if (!this.getConfig().disableOutgoingRequestInstrumentation) {
                  let el = this._wrap(
                    eA,
                    "request",
                    this._getPatchOutgoingRequestFunction("http"),
                  );
                  this._wrap(eA, "get", this._getPatchOutgoingGetFunction(el));
                }
                return (
                  this.getConfig().disableIncomingRequestInstrumentation ||
                    this._wrap(
                      eA.Server.prototype,
                      "emit",
                      this._getPatchIncomingRequestFunction("http"),
                    ),
                  eA
                );
              },
              (eA) => {
                void 0 !== eA &&
                  (this.getConfig().disableOutgoingRequestInstrumentation ||
                    (this._unwrap(eA, "request"), this._unwrap(eA, "get")),
                  this.getConfig().disableIncomingRequestInstrumentation ||
                    this._unwrap(eA.Server.prototype, "emit"));
              },
            );
          }
          _getHttpsInstrumentation() {
            return new eM.InstrumentationNodeModuleDefinition(
              "https",
              ["*"],
              (eA) => {
                if (!this.getConfig().disableOutgoingRequestInstrumentation) {
                  let el = this._wrap(
                    eA,
                    "request",
                    this._getPatchHttpsOutgoingRequestFunction("https"),
                  );
                  this._wrap(
                    eA,
                    "get",
                    this._getPatchHttpsOutgoingGetFunction(el),
                  );
                }
                return (
                  this.getConfig().disableIncomingRequestInstrumentation ||
                    this._wrap(
                      eA.Server.prototype,
                      "emit",
                      this._getPatchIncomingRequestFunction("https"),
                    ),
                  eA
                );
              },
              (eA) => {
                void 0 !== eA &&
                  (this.getConfig().disableOutgoingRequestInstrumentation ||
                    (this._unwrap(eA, "request"), this._unwrap(eA, "get")),
                  this.getConfig().disableIncomingRequestInstrumentation ||
                    this._unwrap(eA.Server.prototype, "emit"));
              },
            );
          }
          _getPatchIncomingRequestFunction(eA) {
            return (el) => this._incomingRequestFunction(eA, el);
          }
          _getPatchOutgoingRequestFunction(eA) {
            return (el) => this._outgoingRequestFunction(eA, el);
          }
          _getPatchOutgoingGetFunction(eA) {
            return (el) =>
              function (el, ...ec) {
                let eu = eA(el, ...ec);
                return (eu.end(), eu);
              };
          }
          _getPatchHttpsOutgoingRequestFunction(eA) {
            return (el) => {
              let ec = this;
              return function (eu, ...ed) {
                var ep;
                return (
                  "https" === eA &&
                    "object" == typeof eu &&
                    (null == (ep = null == eu ? void 0 : eu.constructor)
                      ? void 0
                      : ep.name) !== "URL" &&
                    ((eu = Object.assign({}, eu)), ec._setDefaultOptions(eu)),
                  ec._getPatchOutgoingRequestFunction(eA)(el)(eu, ...ed)
                );
              };
            };
          }
          _setDefaultOptions(eA) {
            ((eA.protocol = (null == eA ? void 0 : eA.protocol) || "https:"),
              (eA.port = (null == eA ? void 0 : eA.port) || 443));
          }
          _getPatchHttpsOutgoingGetFunction(eA) {
            return (el) => {
              let ec = this;
              return function (eu, ...ed) {
                return ec._getPatchOutgoingGetFunction(eA)(el)(eu, ...ed);
              };
            };
          }
          _traceClientRequest(eA, el, ec, eu) {
            this.getConfig().requestHook && this._callRequestHook(el, eA);
            let ed = !1;
            eA.prependListener("response", (ep) => {
              var eg, eE, eC;
              (this._diag.debug("outgoingRequest on response()"),
                1 >= eA.listenerCount("response") && ep.resume());
              let ey = getOutgoingRequestAttributesOnResponse(ep);
              (el.setAttributes(ey),
                (eu = Object.assign(
                  eu,
                  getOutgoingRequestMetricAttributesOnResponse(ey),
                )),
                this.getConfig().responseHook && this._callResponseHook(el, ep),
                this._headerCapture.client.captureRequestHeaders(el, (el) =>
                  eA.getHeader(el),
                ),
                this._headerCapture.client.captureResponseHeaders(el, (eA) => {
                  var el;
                  return null == (el = null == ep ? void 0 : ep.headers)
                    ? void 0
                    : el[eA];
                }),
                eh.context.bind(eh.context.active(), ep));
              let ew = "",
                eB = [],
                responseBodyHandler = (eA) => {
                  let el = Buffer.from(eA);
                  eB.push(el);
                  let ec = el.toString();
                  ew += ec;
                };
              (null == (eg = this._pluginConfig)
                ? void 0
                : eg.enableTraceBody) &&
                (null ==
                (eC =
                  null == (eE = null == ep ? void 0 : ep.headers)
                    ? void 0
                    : eE["content-type"])
                  ? void 0
                  : eC.includes("application/json")) &&
                ("function" == typeof ep.prependListener
                  ? ep.prependListener("data", responseBodyHandler)
                  : ep.on("data", responseBodyHandler));
              let endHandler = () => {
                  var eg, eh;
                  try {
                    let eh;
                    if ((this._diag.debug("outgoingRequest on end()"), ed))
                      return;
                    if (
                      ((ed = !0),
                      (eh =
                        (null == ep ? void 0 : ep.aborted) &&
                        !(null == ep ? void 0 : ep.complete)
                          ? { code: ef.SpanStatusCode.ERROR }
                          : {
                              code: parseResponseStatus(
                                em.SpanKind.CLIENT,
                                null == ep ? void 0 : ep.statusCode,
                              ),
                            }),
                      el.setStatus(eh),
                      this.getConfig().applyCustomAttributesOnSpan &&
                        (0, ex.safeExecuteInTheMiddle)(
                          () =>
                            this.getConfig().applyCustomAttributesOnSpan(
                              el,
                              eA,
                              ep,
                            ),
                          () => {},
                          !0,
                        ),
                      null == (eg = this._pluginConfig)
                        ? void 0
                        : eg.enableTraceBody)
                    )
                      try {
                        let eA = JSON.parse(ew);
                        el.addEvent("RECEIVED", {
                          "message.detail": JSON.stringify(eA),
                        });
                      } catch (eA) {
                        el.addEvent("RECEIVED", { "message.detail": ew });
                      }
                    this._closeHttpSpan(el, em.SpanKind.CLIENT, ec, eu);
                  } finally {
                    ((null == (eh = this._pluginConfig)
                      ? void 0
                      : eh.enableTraceBody) &&
                      ep.removeListener("data", responseBodyHandler),
                      ep.removeListener("end", endHandler),
                      ep.removeListener("close", endHandler));
                  }
                },
                responseErrorMonitorHandler = (eA) => {
                  var eg, eh;
                  try {
                    if (
                      (this._diag.debug("outgoingRequest on error()", eA), ed)
                    )
                      return;
                    ((ed = !0),
                      setSpanWithError(el, eA),
                      el.setStatus({
                        code: ef.SpanStatusCode.ERROR,
                        message: null == eA ? void 0 : eA.message,
                      }),
                      (eu[e9.ClientServerMetricAttributes.Code] =
                        (null == (eg = eA) ? void 0 : eg.code) ||
                        "err_res_errorMonitor"),
                      (eu[e9.ClientServerMetricAttributes.CodeType] =
                        getCodeType(eu[e9.ClientServerMetricAttributes.Code])),
                      (null == (eh = this._pluginConfig)
                        ? void 0
                        : eh.enableTraceBody) &&
                        el.addEvent("RECEIVED", {
                          "message.detail": JSON.stringify(eA),
                        }),
                      this._closeHttpSpan(el, em.SpanKind.CLIENT, ec, eu));
                  } finally {
                    ep.removeListener(
                      eN.errorMonitor,
                      responseErrorMonitorHandler,
                    );
                  }
                };
              (ep.once("end", endHandler),
                eI.lt(process.version, "16.0.0") &&
                  ep.once("close", endHandler),
                ep.once(eN.errorMonitor, responseErrorMonitorHandler));
            });
            let closeHandler = () => {
              try {
                if (
                  (this._diag.debug("outgoingRequest on request close()"),
                  eA.aborted || ed)
                )
                  return;
                ((ed = !0),
                  this._closeHttpSpan(el, em.SpanKind.CLIENT, ec, eu, !1));
              } finally {
                (eA.removeListener("close", closeHandler),
                  eA.removeAllListeners());
              }
            };
            eA.once("close", closeHandler);
            let requestErrorMonitorHandler = (ep) => {
              try {
                if (
                  (this._diag.debug("outgoingRequest on request error()", ep),
                  ed)
                )
                  return;
                ((ed = !0),
                  setSpanWithError(el, ep),
                  (eu[e9.ClientServerMetricAttributes.Code] =
                    (null == ep ? void 0 : ep.code) || "err_req_errorMonitor"),
                  (eu[e9.ClientServerMetricAttributes.CodeType] = getCodeType(
                    eu[e9.ClientServerMetricAttributes.Code],
                  )),
                  this._closeHttpSpan(el, em.SpanKind.CLIENT, ec, eu));
              } finally {
                eA.removeListener(eN.errorMonitor, requestErrorMonitorHandler);
              }
            };
            return (
              eA.once(eN.errorMonitor, requestErrorMonitorHandler),
              this._diag.debug("http.ClientRequest return request"),
              eA
            );
          }
          _incomingRequestFunction(eA, el) {
            let ec = this;
            return function (ed, ...ep) {
              var eg, ef, ew, eI, eS, eQ, eD, eT, eR, ek;
              if ("request" !== ed) return el.apply(this, [ed, ...ep]);
              let eM = null == ep ? void 0 : ep[0],
                eP = null == ep ? void 0 : ep[1],
                eL =
                  ((null == eM ? void 0 : eM.url) &&
                    (null == (eg = ev.parse(eM.url)) ? void 0 : eg.pathname)) ||
                  "/",
                eF = (null == eM ? void 0 : eM.method) || "GET";
              if (
                (ec._diag.debug(`${eA} instrumentation incomingRequest`),
                isIgnored(
                  eL,
                  null == (ef = ec.getConfig())
                    ? void 0
                    : ef.ignoreIncomingPaths,
                  (eA) =>
                    ec._diag.error("caught ignoreIncomingPaths error: ", eA),
                ) ||
                  (0, ex.safeExecuteInTheMiddle)(
                    () => {
                      var eA, el;
                      return null ==
                        (el =
                          null == (eA = ec.getConfig())
                            ? void 0
                            : eA.ignoreIncomingRequestHook)
                        ? void 0
                        : el.call(eA, eM);
                    },
                    (eA) => {
                      null != eA &&
                        ec._diag.error(
                          "caught ignoreIncomingRequestHook error: ",
                          eA,
                        );
                    },
                    !0,
                  ))
              )
                return eh.context.with(
                  (0, eB.suppressTracing)(eh.context.active()),
                  () => (
                    eh.context.bind(eh.context.active(), eM),
                    eh.context.bind(eh.context.active(), eP),
                    el.apply(this, [ed, ...ep])
                  ),
                );
              let eU = (null == eM ? void 0 : eM.headers) || {},
                ej = getIncomingRequestAttributes(eM, {
                  component: eA,
                  serverName: ec.getConfig().serverName,
                  hookAttributes: ec._callStartSpanHook(
                    eM,
                    ec.getConfig().startIncomingSpanHook,
                  ),
                }),
                eG = { kind: em.SpanKind.SERVER, attributes: ej },
                eH = (0, e_.hrTime)(),
                eK = getIncomingRequestMetricAttributes(ej),
                e$ = { ...eU };
              if (
                null == (ew = Object.keys(eU))
                  ? void 0
                  : ew.includes("trpc-trans-info")
              )
                try {
                  e$ = {
                    ...e$,
                    traceparent: Buffer.from(
                      null == (eI = JSON.parse(eU["trpc-trans-info"]))
                        ? void 0
                        : eI.traceparent,
                      "base64",
                    ).toString(),
                  };
                } catch (eA) {
                  e$ = { ...eU };
                }
              if (ec.getConfig().rewriteIncomingReqHeaders)
                try {
                  e$ = {
                    ...((null ==
                    (eQ = (eS = ec.getConfig()).rewriteIncomingReqHeaders)
                      ? void 0
                      : eQ.call(eS, e$)) || e$),
                  };
                } catch (eA) {
                  e$ = { ...eU };
                }
              let eY = eE.propagation.extract(eC.ROOT_CONTEXT, e$),
                eJ = ec._startHttpSpan(eF, eG, eY),
                ez = { type: eO.RPCType.HTTP, span: eJ };
              if (
                (null == (eD = ec._pluginConfig)
                  ? void 0
                  : eD.enableTraceBody) &&
                "POST" === eF &&
                !(null == (eT = null == e$ ? void 0 : e$["content-type"])
                  ? void 0
                  : eT.includes("multipart/form-data"))
              ) {
                let eA = "",
                  el = [],
                  requestBodyHandler = (ec) => {
                    let eu = Buffer.from(ec);
                    el.push(eu);
                    let ed = eu.toString();
                    eA += ed;
                  };
                "function" == typeof eM.prependListener
                  ? eM.prependListener("data", requestBodyHandler)
                  : eM.on("data", requestBodyHandler);
                let requestEndHandler = () => {
                  var el;
                  let ec = {};
                  try {
                    switch (
                      null == (el = eM.headers) ? void 0 : el["content-type"]
                    ) {
                      case eu.JSON:
                        ec = JSON.parse(eA);
                        break;
                      case eu.FORM:
                        ec = new URLSearchParams(eA);
                        break;
                      default:
                        ec = eA;
                    }
                  } catch (eA) {
                  } finally {
                    (eM.removeListener("data", requestBodyHandler),
                      eM.removeListener("end", requestEndHandler));
                  }
                  eJ.addEvent("SENT", { "message.detail": JSON.stringify(ec) });
                };
                eM.once("end", requestEndHandler);
              }
              if (
                (null == (eR = ec._pluginConfig)
                  ? void 0
                  : eR.enableTraceBody) &&
                "GET" === eF
              ) {
                let eA = {};
                try {
                  eA =
                    null ==
                    (ek = ev.parse((null == eM ? void 0 : eM.url) || "", !0))
                      ? void 0
                      : ek.query;
                } catch (eA) {
                } finally {
                  eJ.addEvent("SENT", { "message.detail": JSON.stringify(eA) });
                }
              }
              return eh.context.with(
                (0, eO.setRPCMetadata)(ey.trace.setSpan(eY, eJ), ez),
                () => {
                  (eh.context.bind(eh.context.active(), eM),
                    eh.context.bind(eh.context.active(), eP),
                    ec.getConfig().requestHook && ec._callRequestHook(eJ, eM),
                    ec.getConfig().responseHook &&
                      ec._callResponseHook(eJ, eP));
                  let eA = "",
                    eu = eP.write.bind(eP),
                    eg = eP.end.bind(eP);
                  ((eP.write = function (el, ...ed) {
                    let ep = eu(el, ...ed);
                    try {
                      if (el) {
                        let ec = Buffer.isBuffer(el)
                          ? el.toString("utf-8")
                          : String(el);
                        eA += ec;
                      }
                    } catch (eA) {
                      ec._diag.debug(
                        "Error capturing response write data: ",
                        eA,
                      );
                    }
                    return ep;
                  }),
                    (eP.end = function (el, ...eu) {
                      var ed, ep, eh, ef;
                      try {
                        if (el) {
                          let ec = Buffer.isBuffer(el)
                            ? el.toString("utf-8")
                            : String(el);
                          eA += ec;
                        }
                        let eu = eP.getHeader("content-type");
                        if (eu && String(eu).includes("application/json") && eA)
                          try {
                            let el = JSON.parse(eA);
                            if (ec.getConfig().rewriteIncomingRetCode) {
                              let eA =
                                null ==
                                (ep = (ed = ec.getConfig())
                                  .rewriteIncomingRetCode)
                                  ? void 0
                                  : ep.call(ed, el);
                              ((eK[e9.ClientServerMetricAttributes.UserExt1] =
                                null == eA ? void 0 : eA.user_ext1),
                                (eK[e9.ClientServerMetricAttributes.UserExt2] =
                                  null == eA ? void 0 : eA.user_ext2),
                                (eK[e9.ClientServerMetricAttributes.UserExt3] =
                                  null == eA ? void 0 : eA.user_ext3));
                            }
                            (null == (eh = ec._pluginConfig)
                              ? void 0
                              : eh.enableTraceBody) &&
                              eJ.addEvent("RECEIVED", {
                                "message.detail": JSON.stringify(el),
                              });
                          } catch (el) {
                            (null == (ef = ec._pluginConfig)
                              ? void 0
                              : ef.enableTraceBody) &&
                              eJ.addEvent("RECEIVED", { "message.detail": eA });
                          }
                      } catch (eA) {
                        ec._diag.debug(
                          "Error capturing response end data: ",
                          eA,
                        );
                      }
                      return eg(el, ...eu);
                    }),
                    ec._headerCapture.server.captureRequestHeaders(eJ, (eA) => {
                      var el;
                      return null == (el = null == eM ? void 0 : eM.headers)
                        ? void 0
                        : el[eA];
                    }));
                  let ef = !1,
                    closeHandler = () => {
                      try {
                        if (ef) return;
                        ec._onServerResponseFinish(eM, eP, eJ, eK, eH);
                      } finally {
                        eP.removeListener("close", closeHandler);
                      }
                    };
                  eP.once("close", closeHandler);
                  let errorMonitorHandler = (eA) => {
                    var el;
                    try {
                      ((ef = !0),
                        (eK[e9.ClientServerMetricAttributes.Code] =
                          null == eA ? void 0 : eA.code),
                        (eK[e9.ClientServerMetricAttributes.CodeType] =
                          getCodeType(null == eA ? void 0 : eA.code)),
                        (null == (el = ec._pluginConfig)
                          ? void 0
                          : el.enableTraceBody) &&
                          eJ.addEvent("RECEIVED", {
                            "message.detail": JSON.stringify(eA),
                          }),
                        ec._onServerResponseError(eJ, eK, eH, eA));
                    } finally {
                      eP.removeListener(eN.errorMonitor, errorMonitorHandler);
                    }
                  };
                  return (
                    eP.once(eN.errorMonitor, errorMonitorHandler),
                    (0, ex.safeExecuteInTheMiddle)(
                      () => el.apply(this, [ed, ...ep]),
                      (eA) => {
                        var el;
                        if (eA)
                          throw (
                            setSpanWithError(eJ, eA),
                            (eK[e9.ClientServerMetricAttributes.Code] =
                              (null == (el = eA) ? void 0 : el.code) ||
                              "err_safeExe"),
                            (eK[e9.ClientServerMetricAttributes.CodeType] =
                              getCodeType(
                                eK[e9.ClientServerMetricAttributes.Code],
                              )),
                            ec._closeHttpSpan(eJ, em.SpanKind.SERVER, eH, eK),
                            eA
                          );
                      },
                    )
                  );
                },
              );
            };
          }
          _outgoingRequestFunction(eA, el) {
            let ec = this;
            return function (eu, ...ed) {
              var ep, eg, ef, eC, ew, eB;
              if (!isValidOptionsType(eu)) return el.apply(this, [eu, ...ed]);
              let eS =
                  "object" == typeof (null == ed ? void 0 : ed[0]) &&
                  ("string" == typeof eu || eu instanceof ev.URL)
                    ? ed.shift()
                    : void 0,
                {
                  origin: eQ,
                  pathname: eD,
                  method: eT,
                  optionsParsed: eR,
                } = getRequestInfo(eu, eS);
              if (
                ("http" === eA &&
                  eI.lt(process.version, "9.0.0") &&
                  (null == eR ? void 0 : eR.protocol) === "https:") ||
                isIgnored(
                  eQ + eD,
                  null == (ep = ec.getConfig())
                    ? void 0
                    : ep.ignoreOutgoingUrls,
                  (eA) =>
                    ec._diag.error("caught ignoreOutgoingUrls error: ", eA),
                ) ||
                (0, ex.safeExecuteInTheMiddle)(
                  () => {
                    var eA, el;
                    return null ==
                      (el = (eA = ec.getConfig()).ignoreOutgoingRequestHook)
                      ? void 0
                      : el.call(eA, eR);
                  },
                  (eA) => {
                    null != eA &&
                      ec._diag.error(
                        "caught ignoreOutgoingRequestHook error: ",
                        eA,
                      );
                  },
                  !0,
                )
              )
                return el.apply(this, [eR, ...ed]);
              let { hostname: ek, port: eM } = extractHostnameAndPort(eR),
                eO = getOutgoingRequestAttributes(eR, {
                  component: eA,
                  port: eM,
                  hostname: ek,
                  hookAttributes: ec._callStartSpanHook(
                    eR,
                    ec.getConfig().startOutgoingSpanHook,
                  ),
                }),
                eN = (0, e_.hrTime)(),
                eP = getOutgoingRequestMetricAttributes(eO),
                eL = { kind: em.SpanKind.CLIENT, attributes: eO },
                eF = ec._startHttpSpan(eT, eL),
                eU = eh.context.active(),
                ej = ey.trace.setSpan(eU, eF);
              if (eR.headers) {
                let { traceId: eA } = eF.spanContext(),
                  el = null == eF ? void 0 : eF.parentSpanId;
                (eA && el
                  ? (eR.headers.caller_method =
                      (null ==
                      (ef =
                        null == (eg = ec._cacheLRUMap)
                          ? void 0
                          : eg.get(`${eA}-${el}`))
                        ? void 0
                        : ef.caller_method) || "")
                  : (eR.headers.caller_method = "/"),
                  (eP[e9.ClientServerMetricAttributes.CallerMethod] =
                    null == (eC = eR.headers) ? void 0 : eC.caller_method),
                  (eR.headers = Object.assign({}, eR.headers)));
              } else eR.headers = {};
              if (
                (eE.propagation.inject(ej, eR.headers),
                (null == (ew = ec._pluginConfig)
                  ? void 0
                  : ew.enableTraceBody) && "GET" === eT)
              ) {
                let eA = {};
                try {
                  eA =
                    null ==
                    (eB = ev.parse((null == eR ? void 0 : eR.path) || "", !0))
                      ? void 0
                      : eB.query;
                } catch (eA) {
                } finally {
                  eF.addEvent("SENT", { "message.detail": JSON.stringify(eA) });
                }
              }
              return eh.context.with(ej, () => {
                var eu;
                let ep = ed[ed.length - 1];
                "function" == typeof ep &&
                  (ed[ed.length - 1] = eh.context.bind(eU, ep));
                let eg = (0, ex.safeExecuteInTheMiddle)(
                  () => el.apply(this, [eR, ...ed]),
                  (eA) => {
                    var el;
                    if (eA)
                      throw (
                        setSpanWithError(eF, eA),
                        (eP[e9.ClientServerMetricAttributes.Code] =
                          (null == (el = eA) ? void 0 : el.code) ||
                          "err_safeExe"),
                        (eP[e9.ClientServerMetricAttributes.CodeType] =
                          getCodeType(
                            eP[e9.ClientServerMetricAttributes.Code],
                          )),
                        ec._closeHttpSpan(eF, em.SpanKind.CLIENT, eN, eP),
                        eA
                      );
                  },
                );
                if (
                  (ec._diag.debug(`${eA} instrumentation outgoingRequest`),
                  eh.context.bind(eU, eg),
                  (null == (eu = ec._pluginConfig)
                    ? void 0
                    : eu.enableTraceBody) &&
                    ["POST", "PUT", "PATCH"].includes(eT.toUpperCase()))
                ) {
                  let eA = "",
                    el = eg.write.bind(eg),
                    eu = eg.end.bind(eg);
                  ((eg.write = function (eu, ...ed) {
                    let ep = el(eu, ...ed);
                    try {
                      if (eu) {
                        let el = Buffer.isBuffer(eu)
                          ? eu.toString("utf-8")
                          : String(eu);
                        eA += el;
                      }
                    } catch (eA) {
                      ec._diag.debug(
                        "Error capturing outgoing request write data: ",
                        eA,
                      );
                    }
                    return ep;
                  }),
                    (eg.end = function (el, ...ed) {
                      try {
                        if (el) {
                          let ec = Buffer.isBuffer(el)
                            ? el.toString("utf-8")
                            : String(el);
                          eA += ec;
                        }
                        if (eA)
                          try {
                            let el = JSON.parse(eA);
                            eF.addEvent("SENT", {
                              "message.detail": JSON.stringify(el),
                            });
                          } catch (el) {
                            eF.addEvent("SENT", { "message.detail": eA });
                          }
                      } catch (eA) {
                        ec._diag.debug(
                          "Error capturing outgoing request end data: ",
                          eA,
                        );
                      }
                      return eu(el, ...ed);
                    }));
                }
                return ec._traceClientRequest(eg, eF, eN, eP);
              });
            };
          }
          _onServerResponseFinish(eA, el, ec, eu, ed) {
            let ep = getIncomingRequestAttributesOnResponse(eA, el),
              eg = { ...eu };
            ((eu = Object.assign(
              eu,
              getIncomingRequestMetricAttributesOnResponse(ep),
            )),
              this.getConfig().rewriteIncomingRetCode &&
                ((eu[e9.ClientServerMetricAttributes.UserExt1] =
                  null == eg ? void 0 : eg.user_ext1),
                (eu[e9.ClientServerMetricAttributes.UserExt2] =
                  null == eg ? void 0 : eg.user_ext2),
                (eu[e9.ClientServerMetricAttributes.UserExt3] =
                  null == eg ? void 0 : eg.user_ext3)),
              this._headerCapture.server.captureResponseHeaders(ec, (eA) =>
                el.getHeader(eA),
              ),
              ec
                .setAttributes(ep)
                .setStatus({
                  code: parseResponseStatus(em.SpanKind.SERVER, el.statusCode),
                }));
            let eh = null == ep ? void 0 : ep[e4];
            (eh &&
              ec.updateName(
                `${(null == eA ? void 0 : eA.method) || "GET"} ${eh}`,
              ),
              this.getConfig().applyCustomAttributesOnSpan &&
                (0, ex.safeExecuteInTheMiddle)(
                  () =>
                    this.getConfig().applyCustomAttributesOnSpan(ec, eA, el),
                  () => {},
                  !0,
                ),
              this._closeHttpSpan(ec, em.SpanKind.SERVER, ed, eu));
          }
          _onServerResponseError(eA, el, ec, eu) {
            (setSpanWithError(eA, eu),
              this._closeHttpSpan(eA, em.SpanKind.SERVER, ec, el));
          }
          _startHttpSpan(eA, el, ec = eh.context.active()) {
            var eu, ed, ep, eg, ef, eE, eC, eB;
            let e_,
              eI =
                el.kind === em.SpanKind.CLIENT
                  ? null == (eu = this.getConfig())
                    ? void 0
                    : eu.requireParentforOutgoingSpans
                  : null == (ed = this.getConfig())
                    ? void 0
                    : ed.requireParentforIncomingSpans,
              ev = ey.trace.getSpan(ec);
            if (
              ((e_ =
                !0 === eI && void 0 === ev
                  ? ey.trace.wrapSpanContext(ew.INVALID_SPAN_CONTEXT)
                  : !0 === eI &&
                      (null == ev ? void 0 : ev.spanContext().isRemote)
                    ? ev
                    : this.tracer.startSpan(eA, el, ec)),
              this._spanNotEnded.add(e_),
              el.kind !== em.SpanKind.SERVER && el.kind !== em.SpanKind.CLIENT)
            )
              return e_;
            if (el.kind === em.SpanKind.CLIENT) {
              let { traceId: eA } = e_.spanContext(),
                ec = null == e_ ? void 0 : e_.parentSpanId;
              ec
                ? e_.setAttribute(
                    e9.GalileoTraceAttributes.CALLER_METHOD,
                    (null ==
                    (eg =
                      null == (ep = this._cacheLRUMap)
                        ? void 0
                        : ep.get(`${eA}-${ec}`))
                      ? void 0
                      : eg.caller_method) || "",
                  )
                : e_.setAttribute(e9.GalileoTraceAttributes.CALLER_METHOD, "/");
              let eu = getOutgoingRequestMetricAttributes(el.attributes);
              if (shouldFilterMetric(el.kind, this._pluginConfig.filter, eu))
                return e_;
              this._httpClientTotalCounter.add(1, eu);
            } else if (el.kind === em.SpanKind.SERVER) {
              let { traceId: eA, spanId: ec } = e_.spanContext(),
                eu = "";
              try {
                eu =
                  null !=
                  (eE =
                    null == (ef = null == el ? void 0 : el.attributes)
                      ? void 0
                      : ef["trpc.callee_method"])
                    ? eE
                    : ((eB = new URL(
                          null == (eC = null == el ? void 0 : el.attributes)
                            ? void 0
                            : eC["http.url"],
                        )),
                        void 0 === eB)
                      ? void 0
                      : eB.pathname;
              } catch (eA) {
                eu = "";
              }
              this._cacheLRUMap.set(`${eA}-${ec}`, { caller_method: eu });
              let ed = getIncomingRequestMetricAttributes(el.attributes);
              if (shouldFilterMetric(el.kind, this._pluginConfig.filter, ed))
                return e_;
              this._httpServerTotalCounter.add(1, ed);
            }
            return (
              this._nodeInstrumentStartCounter.add(1, {
                ...this._selfAttributes,
                ReportType: "span",
                Kind: getKindName(el.kind),
              }),
              this._nodeInstrumentStartCounter.add(1, {
                ...this._selfAttributes,
                ReportType: "metric",
                Kind: getKindName(el.kind),
              }),
              e_
            );
          }
          _closeHttpSpan(eA, el, ec, eu, ed = !0) {
            if (
              !this._spanNotEnded.has(eA) ||
              (eA.setAttributes({
                [e9.GalileoTraceAttributes.TRPC_STATUS_TYPE]:
                  (null == eu
                    ? void 0
                    : eu[e9.ClientServerMetricAttributes.CodeType]) || "",
                [e9.GalileoTraceAttributes.TRPC_STATUS_CODE]:
                  (null == eu
                    ? void 0
                    : eu[e9.ClientServerMetricAttributes.Code]) || "",
              }),
              eA.end(),
              this._spanNotEnded.delete(eA),
              el !== em.SpanKind.SERVER && el !== em.SpanKind.CLIENT)
            )
              return;
            let ep = shouldFilterMetric(el, this._pluginConfig.filter, eu);
            if (!ed || ep) return;
            let eg = (0, e_.hrTimeToMilliseconds)(
              (0, e_.hrTimeDuration)(ec, (0, e_.hrTime)()),
            );
            (el === em.SpanKind.SERVER
              ? (this._httpServerSuccessCounter.add(1, eu),
                this._httpServerDurationHistogram.record(eg / 1e3, eu))
              : el === em.SpanKind.CLIENT &&
                (this._httpClientDurationHistogram.record(eg / 1e3, eu),
                this._httpClientSuccessCounter.add(1, eu)),
              this._nodeInstrumentEndCounter.add(1, {
                ...this._selfAttributes,
                ReportType: "span",
                Kind: getKindName(el),
                Status: "success",
              }),
              this._nodeInstrumentEndCounter.add(1, {
                ...this._selfAttributes,
                ReportType: "metric",
                Kind: getKindName(el),
                Status: "success",
              }));
          }
          _callResponseHook(eA, el) {
            (0, ex.safeExecuteInTheMiddle)(
              () => this.getConfig().responseHook(eA, el),
              () => {},
              !0,
            );
          }
          _callRequestHook(eA, el) {
            (0, ex.safeExecuteInTheMiddle)(
              () => this.getConfig().requestHook(eA, el),
              () => {},
              !0,
            );
          }
          _callStartSpanHook(eA, el) {
            if ("function" == typeof el)
              return (0, ex.safeExecuteInTheMiddle)(
                () => el(eA),
                () => {},
                !0,
              );
          }
          _createHeaderCapture() {
            var eA, el, ec, eu, ed, ep, eg, eh, ef, em, eE, eC;
            let ey = this.getConfig();
            return {
              client: {
                captureRequestHeaders: headerCapture(
                  "request",
                  null !=
                    (ec =
                      null ==
                      (el =
                        null == (eA = ey.headersToSpanAttributes)
                          ? void 0
                          : eA.client)
                        ? void 0
                        : el.requestHeaders)
                    ? ec
                    : [],
                ),
                captureResponseHeaders: headerCapture(
                  "response",
                  null !=
                    (ep =
                      null ==
                      (ed =
                        null == (eu = ey.headersToSpanAttributes)
                          ? void 0
                          : eu.client)
                        ? void 0
                        : ed.responseHeaders)
                    ? ep
                    : [],
                ),
              },
              server: {
                captureRequestHeaders: headerCapture(
                  "request",
                  null !=
                    (ef =
                      null ==
                      (eh =
                        null == (eg = ey.headersToSpanAttributes)
                          ? void 0
                          : eg.server)
                        ? void 0
                        : eh.requestHeaders)
                    ? ef
                    : [],
                ),
                captureResponseHeaders: headerCapture(
                  "response",
                  null !=
                    (eC =
                      null ==
                      (eE =
                        null == (em = ey.headersToSpanAttributes)
                          ? void 0
                          : em.server)
                        ? void 0
                        : eE.responseHeaders)
                    ? eC
                    : [],
                ),
              },
            };
          }
        };
      },
      43408(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { InstrumentationNodeModuleDefinition: () => eu }));
        var eu = (function () {
          return function (eA, el, ec, eu, ed) {
            ((this.name = eA),
              (this.supportedVersions = el),
              (this.patch = ec),
              (this.unpatch = eu),
              (this.files = ed || []));
          };
        })();
      },
      46077(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            RPCType: () => eu,
            deleteRPCMetadata: () => deleteRPCMetadata,
            getRPCMetadata: () => getRPCMetadata,
            setRPCMetadata: () => setRPCMetadata,
          }));
        var eu,
          ed = (0, ec(98902).createContextKey)(
            "OpenTelemetry SDK Context Key RPC_METADATA",
          );
        function setRPCMetadata(eA, el) {
          return eA.setValue(ed, el);
        }
        function deleteRPCMetadata(eA) {
          return eA.deleteValue(ed);
        }
        function getRPCMetadata(eA) {
          return eA.getValue(ed);
        }
        !(function (eA) {
          eA.HTTP = "http";
        })(eu || (eu = {}));
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

  return { HttpInstrumentation: ec(9808).HttpInstrumentation, getModule: ec };
}
