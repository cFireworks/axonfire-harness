// @ts-nocheck
// Captured FetchInstrumentation and instrumentation base/module-hook dependency closure.
export const GALILEO_FETCH_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const GALILEO_FETCH_MODULES = [
  [8009, 1364756, 1399516],
  [81822, 1047251, 1060129],
  [25318, 1060394, 1062780],
  [16928, 15800612, 15800662],
  [39023, 15801382, 15801432],
  [94377, 13019243, 13020520],
  [8821, 6504558, 6506320],
  [2385, 6274161, 6279051],
  [93931, 4847873, 4849571],
  [79896, 15798416, 15798464],
  [43193, 1060130, 1060393],
  [99589, 14402403, 14403557],
  [73339, 15798626, 15798678],
  [3680, 4139837, 4139978],
  [79280, 5726573, 5726986],
  [14666, 6279316, 6279419],
  [51444, 6279052, 6279315],
  [53134, 22107401, 22108611],
  [87016, 15801332, 15801381],
  [28167, 15801482, 15801542],
  [8026, 4849572, 4850381],
  [99718, 14404883, 14408953],
  [16874, 14403558, 14403876],
  [53908, 14393889, 14398260],
  [61123, 14404064, 14404347],
  [30144, 14401489, 14401657],
  [56953, 14402291, 14402402],
  [57414, 14398261, 14398400],
  [93007, 14400837, 14401057],
  [51832, 14400099, 14400578],
  [32938, 14401228, 14401314],
  [46254, 14401315, 14401401],
  [24493, 14401658, 14401744],
  [31729, 14401745, 14401881],
  [50560, 14399992, 14400098],
  [9970, 14401882, 14401963],
  [11763, 14399912, 14399991],
  [40909, 14399759, 14399911],
  [43927, 14402193, 14402290],
  [74277, 14401964, 14402061],
  [35580, 14400666, 14400750],
  [7059, 14401058, 14401141],
  [94641, 14400579, 14400665],
  [13999, 14401402, 14401488],
  [54089, 14400751, 14400836],
  [25200, 14401142, 14401227],
  [72111, 14398401, 14398985],
  [46170, 14398986, 14399758],
  [93904, 14385866, 14387770],
  [78311, 14387771, 14393888],
  [97638, 14402062, 14402192],
  [77631, 14414113, 14414255],
  [19628, 14409254, 14409500],
  [270, 14409501, 14409744],
  [41261, 14409745, 14410359],
  [13874, 14414256, 14414383],
  [97075, 14410360, 14411144],
  [75571, 14408954, 14409040],
  [5342, 14409168, 14409253],
  [76780, 14409041, 14409167],
  [72525, 14411145, 14411657],
  [75032, 14411658, 14414112],
  [20124, 4134379, 4137049],
  [85038, 4139979, 4142104],
  [98882, 6279420, 6284570],
  [77875, 6284762, 6284918],
  [94278, 6285354, 6285426],
  [41911, 6286122, 6289756],
  [57272, 14403877, 14404063],
  [98587, 14404758, 14404882],
  [68794, 14404348, 14404757],
  [27891, 4137050, 4139836],
  [52018, 15801282, 15801331],
  [35600, 6783478, 6785107],
  [79424, 6284919, 6285353],
  [36571, 6284571, 6284761],
  [11705, 6285427, 6286068],
  [92182, 6286069, 6286121],
  [96233, 4957529, 4958532],
  [5020, 22108612, 22114037],
  [27250, 5726987, 5728484],
  [70857, 15800563, 15800611],
  [56071, 4741075, 4741259],
  [10747, 6031595, 6032654],
  [78554, 4763234, 4763362],
  [1297, 21662396, 21667842],
  [79138, 4603354, 4603439],
  [28794, 4602264, 4603353],
] as const;
export function createNativeGalileoFetch(runtime: any) {
  if (!runtime.globals) throw Error("Explicit global surface required");
  const globalThis = runtime.globals,
    global = runtime.globals,
    require = runtime.require,
    process = runtime.process ?? globalThis.process,
    console = runtime.console ?? globalThis.console;
  const factories = {
      8009(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            getOutgoingRequestMetricAttributesOnResponse: () =>
              getOutgoingRequestMetricAttributesOnResponse,
            shouldFilterMetric: () => shouldFilterMetric,
            FetchInstrumentation: () => FetchInstrumentation,
            headerCapture: () => headerCapture,
            RESERVED_USER_EXT_FIELDS: () => eU,
            isIgnored: () => isIgnored,
            safeToText: () => safeToText,
            getCodeType: () => getCodeType,
            getKindName: () => getKindName,
            satisfiesPattern: () => satisfiesPattern,
            normalizeFetchRequest: () => normalizeFetchRequest,
            isTextualContentType: () => isTextualContentType,
            getOutgoingRequestMetricAttributes: () =>
              getOutgoingRequestMetricAttributes,
            getOutgoingRequestAttributes: () => getOutgoingRequestAttributes,
            parseResponseStatus: () => parseResponseStatus,
            getOutgoingRequestAttributesOnResponse: () =>
              getOutgoingRequestAttributesOnResponse,
            setSpanWithError: () => setSpanWithError,
          }));
        var eu,
          ed,
          ep = ec(11447),
          eg = ec(51244),
          eh = ec(33835),
          ef = ec(23258),
          em = ec(67006),
          eE = ec(67177),
          eC = ec(41437);
        let ey =
            "object" == typeof performance &&
            performance &&
            "function" == typeof performance.now
              ? performance
              : Date,
          ew = new Set(),
          eB = "object" == typeof process && process ? process : {},
          emitWarning = (eA, el, ec, eu) => {
            "function" == typeof eB.emitWarning
              ? eB.emitWarning(eA, el, ec, eu)
              : console.error(`[${ec}] ${el}: ${eA}`);
          },
          e_ = globalThis.AbortController,
          eI = globalThis.AbortSignal;
        if (void 0 === e_) {
          ((eI = class {
            onabort;
            _onabort = [];
            reason;
            aborted = !1;
            addEventListener(eA, el) {
              this._onabort.push(el);
            }
          }),
            (e_ = class {
              constructor() {
                warnACPolyfill();
              }
              signal = new eI();
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
          let eA = eB.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1",
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
        let shouldWarn = (eA) => !ew.has(eA);
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
              maxEntrySize: eB = 0,
              sizeCalculation: e_,
              fetchMethod: eI,
              memoMethod: ev,
              noDeleteOnFetchRejection: eS,
              noDeleteOnStaleGet: eQ,
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
              (this.maxEntrySize = eB || this.#A),
              (this.sizeCalculation = e_),
              this.sizeCalculation)
            ) {
              if (!this.#A && !this.maxEntrySize)
                throw TypeError(
                  "cannot set sizeCalculation without setting maxSize or maxEntrySize",
                );
              if ("function" != typeof this.sizeCalculation)
                throw TypeError("sizeCalculation set to non-function");
            }
            if (void 0 !== ev && "function" != typeof ev)
              throw TypeError("memoMethod must be a function if defined");
            if (((this.#o = ev), void 0 !== eI && "function" != typeof eI))
              throw TypeError("fetchMethod must be a function if specified");
            if (
              ((this.#i = eI),
              (this.#B = !!eI),
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
              (this.noDeleteOnFetchRejection = !!eS),
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
              (this.noDeleteOnStaleGet = !!eQ),
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
                (ew.add(eA),
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
              (this.#k = (ec, eu, ed = ey.now()) => {
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
                el[ec] = 0 !== eA[ec] ? ey.now() : 0;
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
                let eA = ey.now();
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
                ((ed.ttl = eA - (ey.now() - ec)), (ed.start = Date.now()));
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
                let eA = ey.now() - this.#C[el];
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
                ec.start = ey.now() - eA;
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
            let ep = new e_(),
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
              el.__abortController instanceof e_
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
        var ev = ec(81822),
          eS = ec(25318),
          eQ = ec(15183),
          eD = ec(45185),
          eT = "net.peer.port",
          eR = "net.peer.name",
          ek = "http.method",
          eM = "http.url",
          ex = "http.target",
          eO = "http.host",
          eN = "http.scheme",
          eP = "http.status_code",
          eL = "http.flavor",
          eF = "http.user_agent";
        !(function (eA) {
          ((eA.HTTP_ERROR_NAME = "http.error_name"),
            (eA.HTTP_ERROR_MESSAGE = "http.error_message"),
            (eA.HTTP_STATUS_TEXT = "http.status_text"));
        })(eu || (eu = {}));
        let eU = [
            eQ.ClientServerMetricAttributes.UserExt1,
            eQ.ClientServerMetricAttributes.UserExt2,
            eQ.ClientServerMetricAttributes.UserExt3,
          ],
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
              null == ec || ec(eA);
            }
            return !1;
          },
          parseResponseStatus = (eA) =>
            eA && eA >= 100 && eA < 400
              ? eD.SpanStatusCode.UNSET
              : eD.SpanStatusCode.ERROR,
          setSpanWithError = (eA, el) => {
            let ec = null == el ? void 0 : el.message;
            (eA.setAttribute(eu.HTTP_ERROR_NAME, null == el ? void 0 : el.name),
              eA.setAttribute(eu.HTTP_ERROR_MESSAGE, ec),
              eA.setStatus({ code: eD.SpanStatusCode.ERROR, message: ec }),
              eA.recordException(el));
          };
        !(function (eA) {
          ((eA.success = "success"),
            (eA.exception = "exception"),
            (eA.timeout = "timeout"));
        })(ed || (ed = {}));
        let getCodeType = (eA) => {
            let el = 0;
            try {
              el = Number(eA);
            } catch (eA) {
              el = 0;
            }
            return 504 === el
              ? ed.timeout
              : 200 === el
                ? ed.success
                : ed.exception;
          },
          getKindName = (eA) => {
            switch (eA) {
              case eg.SpanKind.CLIENT:
                return "client";
              case eg.SpanKind.SERVER:
                return "server";
              default:
                return "";
            }
          },
          normalizeFetchRequest = (eA, el) => {
            let ec = "",
              eu = "GET",
              ed = {},
              ep = eA;
            if ("string" == typeof eA) ec = eA;
            else if (eA && "object" == typeof eA) {
              if ("string" == typeof eA.href && "string" == typeof eA.origin)
                ec = eA.href;
              else if (
                ep &&
                "string" == typeof ep.url &&
                ((ec = ep.url),
                "string" == typeof ep.method && (eu = ep.method.toUpperCase()),
                ep.headers)
              ) {
                let eA = ep.headers;
                if ("function" == typeof eA.forEach)
                  eA.forEach((eA, el) => {
                    ed[el.toLowerCase()] = eA;
                  });
                else if ("object" == typeof eA)
                  for (let [el, ec] of Object.entries(eA))
                    "string" == typeof ec && (ed[el.toLowerCase()] = ec);
              }
            }
            if (
              el &&
              "object" == typeof el &&
              ("string" == typeof el.method && (eu = el.method.toUpperCase()),
              el.headers)
            ) {
              let eA = el.headers;
              if ("function" == typeof eA.forEach)
                eA.forEach((eA, el) => {
                  ed[el.toLowerCase()] = eA;
                });
              else if (Array.isArray(eA))
                for (let el of eA)
                  Array.isArray(el) &&
                    2 === el.length &&
                    (ed[String(el[0]).toLowerCase()] = String(el[1]));
              else if ("object" == typeof eA)
                for (let [el, ec] of Object.entries(eA))
                  null != ec && (ed[el.toLowerCase()] = String(ec));
            }
            let eg = "",
              eh = "",
              ef = "/",
              em = "";
            try {
              let eA = new URL(ec);
              ((eg = eA.hostname),
                (eh = eA.port),
                (ef = eA.pathname || "/"),
                (em = eA.search || ""));
            } catch (eA) {}
            return {
              url: ec,
              method: eu || "GET",
              headers: ed,
              hostname: eg,
              port: eh,
              pathname: ef,
              search: em,
              input: eA,
              init: el,
            };
          },
          getOutgoingRequestAttributes = (eA, el = {}) => {
            let ec = eA.url.startsWith("https:") ? "https" : "http",
              eu = {
                [eM]: eA.url,
                [ek]: eA.method,
                [ex]: `${eA.pathname}${eA.search}`,
                [eN]: ec,
                [eR]: eA.hostname,
                [eO]: eA.port ? `${eA.hostname}:${eA.port}` : eA.hostname,
              };
            return (
              eA.port && (eu[eT] = eA.port),
              eA.headers["user-agent"] && (eu[eF] = eA.headers["user-agent"]),
              (eu[eQ.GalileoTraceAttributes.TRPC_CALLEE_METHOD] =
                eA.pathname || ""),
              Object.assign(eu, el.hookAttributes)
            );
          },
          getOutgoingRequestMetricAttributes = (eA) => {
            let el = {};
            return (
              (el[ek] = null == eA ? void 0 : eA[ek]),
              (el[eR] = null == eA ? void 0 : eA[eR]),
              Object.assign(el, {
                [eQ.ClientServerMetricAttributes.CallerService]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CallerService],
                [eQ.ClientServerMetricAttributes.CallerMethod]: "",
                [eQ.ClientServerMetricAttributes.CallerConSetid]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CallerConSetid],
                [eQ.ClientServerMetricAttributes.CallerServer]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CallerServer],
                [eQ.ClientServerMetricAttributes.CallerGroup]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CallerGroup],
                [eQ.ClientServerMetricAttributes.CalleeServer]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CalleeServer],
                [eQ.ClientServerMetricAttributes.CalleeService]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CalleeService],
                [eQ.ClientServerMetricAttributes.CalleeMethod]:
                  (null == eA ? void 0 : eA["trpc.callee_method"]) || "",
                [eQ.ClientServerMetricAttributes.CalleeConSetid]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CalleeConSetid],
                [eQ.ClientServerMetricAttributes.CalleeIp]:
                  (null == eA ? void 0 : eA["net.peer.name"]) || "",
                [eQ.ClientServerMetricAttributes.CalleeContainer]:
                  null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.CalleeContainer],
                [eQ.ClientServerMetricAttributes.Code]: "",
                [eQ.ClientServerMetricAttributes.CodeType]: "",
                [eQ.ClientServerMetricAttributes.UserExt1]:
                  (null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.UserExt1]) || "",
                [eQ.ClientServerMetricAttributes.UserExt2]:
                  (null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.UserExt2]) || "",
                [eQ.ClientServerMetricAttributes.UserExt3]:
                  (null == eA
                    ? void 0
                    : eA[eQ.ClientServerMetricAttributes.UserExt3]) || "",
              })
            );
          },
          getOutgoingRequestAttributesOnResponse = (eA) => {
            let el = {};
            return (
              eA.status &&
                ((el[eP] = eA.status),
                (el[eu.HTTP_STATUS_TEXT] = (
                  eA.statusText || ""
                ).toUpperCase())),
              (el[eL] = "1.1"),
              el
            );
          },
          getOutgoingRequestMetricAttributesOnResponse = (eA) => {
            let el = {};
            return (
              (el[eP] = null == eA ? void 0 : eA[eP]),
              (el[eL] = null == eA ? void 0 : eA[eL]),
              (el[eQ.ClientServerMetricAttributes.Code] =
                null == eA ? void 0 : eA[eP]),
              (el[eQ.ClientServerMetricAttributes.CodeType] = getCodeType(
                null == eA ? void 0 : eA[eP],
              )),
              el
            );
          },
          shouldFilterMetric = (eA, el, ec) => {
            var eu, ed;
            return eA === eg.SpanKind.CLIENT
              ? !!(null == (eu = null == el ? void 0 : el.calleeMethod)
                  ? void 0
                  : eu.includes(
                      null == ec
                        ? void 0
                        : ec[eQ.ClientServerMetricAttributes.CalleeMethod],
                    ))
              : eA !== eg.SpanKind.SERVER ||
                  !!(null == (ed = null == el ? void 0 : el.callerMethod)
                    ? void 0
                    : ed.includes(
                        null == ec
                          ? void 0
                          : ec[eQ.ClientServerMetricAttributes.CallerMethod],
                      ));
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
                  : el.setAttribute(eh, [String(ep)]);
            }
          };
        }
        let isTextualContentType = (eA) =>
            !!eA &&
            (eA.includes("application/json") ||
              eA.startsWith("text/") ||
              eA.includes("application/x-www-form-urlencoded")),
          safeToText = (eA) => {
            try {
              if (null == eA) return "";
              if ("string" == typeof eA) return eA;
              if (eA instanceof URLSearchParams) return eA.toString();
              if (eA instanceof ArrayBuffer)
                return Buffer.from(eA).toString("utf-8");
              if (ArrayBuffer.isView(eA))
                return Buffer.from(eA.buffer).toString("utf-8");
              if ("object" == typeof eA) return JSON.stringify(eA);
              return String(eA);
            } catch (eA) {
              return "";
            }
          },
          ej = "fetch";
        let FetchInstrumentation = class FetchInstrumentation extends ev.InstrumentationBase {
          constructor(eA = {}) {
            var el, ec, eu, ed, ep;
            (super("@tencent/galileo-instrumentation-fetch", "0.1.0", eA),
              (this._cacheLRUMap = new LRUCache({ max: 10 })),
              (this._headerCapture = this._createHeaderCapture()),
              (this._clientMeter =
                null == (el = eA.meterProvider)
                  ? void 0
                  : el.getMeter(eQ.GalileoMeters.clientMetrics, "")),
              (this._selfMeter =
                null == (ec = eA.selfMeterProvider)
                  ? void 0
                  : ec.getMeter(
                      null == (eu = eA.pluginParams) ? void 0 : eu.selfMonitor,
                      "",
                    )),
              (this._pluginConfig = { ...eA.pluginParams }),
              (this._selfAttributes = {
                SdkTarget:
                  null == (ed = this._pluginConfig) ? void 0 : ed.target,
                TargetNameSpace:
                  null == (ep = this._pluginConfig) ? void 0 : ep.namespace,
                ReportType: "",
                Protocol: ej,
                Kind: "",
                Status: "",
              }),
              this._updateMeter());
          }
          _updateMeter() {
            this._clientMeter &&
              this._selfMeter &&
              ((this._nodeInstrumentStartCounter =
                this._selfMeter.createCounter("node_instrument_start", {
                  valueType: ep.ValueType.INT,
                })),
              (this._nodeInstrumentEndCounter = this._selfMeter.createCounter(
                "node_instrument_end",
                { valueType: ep.ValueType.INT },
              )),
              (this._httpClientDurationHistogram =
                this._clientMeter.createHistogram(
                  eQ.ClientServerMetrics.ClientHandledSeconds,
                  { description: "请求耗时", valueType: ep.ValueType.DOUBLE },
                )),
              (this._httpClientTotalCounter = this._clientMeter.createCounter(
                eQ.ClientServerMetrics.ClientStartedTotal,
                { valueType: ep.ValueType.INT },
              )),
              (this._httpClientSuccessCounter = this._clientMeter.createCounter(
                eQ.ClientServerMetrics.ClientHandledTotal,
                { valueType: ep.ValueType.INT },
              )));
          }
          setConfig(eA = {}) {
            (super.setConfig(eA),
              (this._headerCapture = this._createHeaderCapture()));
          }
          init() {
            return [];
          }
          enable() {
            if (this._patched) return;
            if ("function" != typeof globalThis.fetch)
              return void this._diag.warn(
                "global fetch not available – fetch instrumentation is a no-op",
              );
            let eA = globalThis.fetch;
            if (eA.__galileoPatched) {
              (this._diag.warn(
                "global fetch already patched, skip duplicate enable()",
              ),
                (this._originalFetch = eA.__galileoOriginalFetch || null),
                (this._patched = !0));
              return;
            }
            this._originalFetch = globalThis.fetch.bind(globalThis);
            let el = this._originalFetch,
              ec = this,
              patchedFetch = function (eA, el) {
                return ec._fetchHandler(eA, el);
              };
            (Object.defineProperty(patchedFetch, "name", {
              value: "fetch",
              configurable: !0,
            }),
              Object.defineProperty(patchedFetch, "__galileoPatched", {
                value: !0,
                configurable: !0,
              }),
              Object.defineProperty(patchedFetch, "__galileoOriginalFetch", {
                value: el,
                configurable: !0,
              }),
              (globalThis.fetch = patchedFetch),
              (this._patched = !0),
              this._diag.debug("global fetch has been patched by Galileo"));
          }
          disable() {
            this._patched &&
              (this._originalFetch && (globalThis.fetch = this._originalFetch),
              (this._patched = !1),
              (this._originalFetch = null));
          }
          async _fetchHandler(eA, el) {
            var ec, eu, ed;
            let ep,
              eE,
              ey = this._originalFetch;
            if (!ey)
              throw Error(
                "[Galileo Fetch] _originalFetch is null, instrumentation is in a broken state",
              );
            if (ey.__galileoPatched)
              throw Error(
                "[Galileo Fetch] _originalFetch points to a patched fetch (would recurse)",
              );
            let ew = normalizeFetchRequest(eA, el),
              eB = this.getConfig();
            if (
              isIgnored(
                ew.url,
                null == eB ? void 0 : eB.ignoreOutgoingUrls,
                (eA) =>
                  this._diag.error("caught ignoreOutgoingUrls error: ", eA),
              ) ||
              (0, eS.safeExecuteInTheMiddle)(
                () => {
                  var eA;
                  return null == (eA = eB.ignoreOutgoingRequestHook)
                    ? void 0
                    : eA.call(eB, ew);
                },
                (eA) => {
                  null != eA &&
                    this._diag.error(
                      "caught ignoreOutgoingRequestHook error: ",
                      eA,
                    );
                },
                !0,
              )
            )
              return ey(eA, el);
            let e_ = this._callStartSpanHook(ew, eB.startOutgoingSpanHook),
              eI = getOutgoingRequestAttributes(ew, { hookAttributes: e_ }),
              ev = (0, eC.hrTime)(),
              eD = getOutgoingRequestMetricAttributes(eI),
              eT = { kind: eg.SpanKind.CLIENT, attributes: eI },
              eR = this._startHttpSpan(ew.method, eT),
              ek = eh.context.active(),
              eM = ef.trace.setSpan(ek, eR),
              ex = { ...ew.headers },
              { traceId: eO } = eR.spanContext(),
              eN = null == eR ? void 0 : eR.parentSpanId;
            (eO && eN
              ? (ex.caller_method =
                  (null ==
                  (eu =
                    null == (ec = this._cacheLRUMap)
                      ? void 0
                      : ec.get(`${eO}-${eN}`))
                    ? void 0
                    : eu.caller_method) || "")
              : (ex.caller_method = "/"),
              (eD[eQ.ClientServerMetricAttributes.CallerMethod] =
                ex.caller_method),
              em.propagation.inject(eM, ex));
            let eP = null;
            if (
              (eA instanceof Request
                ? ((eP = eA.clone().body),
                  (ep = new Request(eA, { ...(el || {}), headers: ex })),
                  (eE = {}))
                : ((ep = eA), (eE = { ...(el || {}), headers: ex })),
              null == (ed = this._pluginConfig) ? void 0 : ed.enableTraceBody)
            )
              try {
                if ("GET" === ew.method) {
                  let eA = {};
                  try {
                    new URL(ew.url).searchParams.forEach(
                      (el, ec) => (eA[ec] = el),
                    );
                  } catch (el) {
                    eA = {};
                  }
                  eR.addEvent("SENT", { "message.detail": JSON.stringify(eA) });
                } else if (["POST", "PUT", "PATCH"].includes(ew.method)) {
                  let eA = "";
                  if (eP)
                    try {
                      let el = new Response(eP);
                      eA = await el.text();
                    } catch (el) {
                      eA = "";
                    }
                  else eA = safeToText(eE.body);
                  if (eA)
                    try {
                      let el = JSON.parse(eA);
                      eR.addEvent("SENT", {
                        "message.detail": JSON.stringify(el),
                      });
                    } catch (el) {
                      eR.addEvent("SENT", { "message.detail": eA });
                    }
                }
              } catch (eA) {
                this._diag.debug("Error capturing fetch SENT body: ", eA);
              }
            return (
              eB.requestHook &&
                (0, eS.safeExecuteInTheMiddle)(
                  () => eB.requestHook(eR, ew),
                  () => {},
                  !0,
                ),
              eh.context.with(eM, async () => {
                try {
                  let eA =
                    ep instanceof Request ? await ey(ep) : await ey(ep, eE);
                  return (await this._handleResponse(eR, ew, eA, ev, eD), eA);
                } catch (eA) {
                  throw (this._handleError(eR, ew, eA, ev, eD), eA);
                }
              })
            );
          }
          async _handleResponse(eA, el, ec, eu, ed) {
            var ep, eh;
            let ef = this.getConfig(),
              em = {};
            try {
              null == (ep = ec.headers) ||
                ep.forEach((eA, el) => {
                  em[el.toLowerCase()] = eA;
                });
            } catch (eA) {}
            let eE = {
                status: ec.status,
                statusText: ec.statusText,
                headers: em,
              },
              eC = getOutgoingRequestAttributesOnResponse(eE);
            if (
              (eA.setAttributes(eC),
              Object.assign(
                ed,
                getOutgoingRequestMetricAttributesOnResponse(eC),
              ),
              this._headerCapture.client.captureRequestHeaders(
                eA,
                (eA) => el.headers[eA],
              ),
              this._headerCapture.client.captureResponseHeaders(
                eA,
                (eA) => em[eA],
              ),
              (null == (eh = this._pluginConfig)
                ? void 0
                : eh.enableTraceBody) &&
                isTextualContentType(em["content-type"]))
            )
              try {
                let el = ec.clone(),
                  eu = await el.text();
                eE.body = eu;
                try {
                  let el = JSON.parse(eu);
                  if (
                    ((eE.json = el),
                    eA.addEvent("RECEIVED", {
                      "message.detail": JSON.stringify(el),
                    }),
                    ef.rewriteOutgoingRetCode)
                  )
                    try {
                      let eA = ef.rewriteOutgoingRetCode(el) || {};
                      ((ed[eQ.ClientServerMetricAttributes.UserExt1] =
                        null == eA ? void 0 : eA.user_ext1),
                        (ed[eQ.ClientServerMetricAttributes.UserExt2] =
                          null == eA ? void 0 : eA.user_ext2),
                        (ed[eQ.ClientServerMetricAttributes.UserExt3] =
                          null == eA ? void 0 : eA.user_ext3));
                    } catch (eA) {
                      this._diag.debug("rewriteOutgoingRetCode threw: ", eA);
                    }
                } catch (el) {
                  eA.addEvent("RECEIVED", { "message.detail": eu });
                }
              } catch (eA) {
                this._diag.debug("Error capturing fetch RECEIVED body: ", eA);
              }
            (ef.responseHook &&
              (0, eS.safeExecuteInTheMiddle)(
                () => ef.responseHook(eA, el, eE),
                () => {},
                !0,
              ),
              ef.applyCustomAttributesOnSpan &&
                (0, eS.safeExecuteInTheMiddle)(
                  () => ef.applyCustomAttributesOnSpan(eA, el, eE),
                  () => {},
                  !0,
                ));
            let ey = { code: parseResponseStatus(ec.status) };
            (eA.setStatus(ey),
              this._closeHttpSpan(eA, eg.SpanKind.CLIENT, eu, ed));
          }
          _handleError(eA, el, ec, eu, ed) {
            var ep;
            let eh = ec;
            if (
              (setSpanWithError(eA, eh),
              (ed[eQ.ClientServerMetricAttributes.Code] =
                (null == eh ? void 0 : eh.code) || "err_fetch"),
              (ed[eQ.ClientServerMetricAttributes.CodeType] = getCodeType(
                ed[eQ.ClientServerMetricAttributes.Code],
              )),
              null == (ep = this._pluginConfig) ? void 0 : ep.enableTraceBody)
            )
              try {
                eA.addEvent("RECEIVED", {
                  "message.detail": JSON.stringify({
                    name: null == eh ? void 0 : eh.name,
                    message: null == eh ? void 0 : eh.message,
                  }),
                });
              } catch (eA) {}
            this._closeHttpSpan(eA, eg.SpanKind.CLIENT, eu, ed);
          }
          _startHttpSpan(eA, el, ec = eh.context.active()) {
            var eu, ed, ep, em, eC, ey;
            let ew,
              eB =
                null == (eu = this.getConfig())
                  ? void 0
                  : eu.requireParentforOutgoingSpans,
              e_ = ef.trace.getSpan(ec);
            if (
              ((ew =
                !0 === eB && void 0 === e_
                  ? ef.trace.wrapSpanContext(eE.INVALID_SPAN_CONTEXT)
                  : !0 === eB &&
                      (null == e_ ? void 0 : e_.spanContext().isRemote)
                    ? e_
                    : this.tracer.startSpan(eA, el, ec)),
              el.kind === eg.SpanKind.CLIENT)
            ) {
              let { traceId: eA } = ew.spanContext(),
                ec = null == ew ? void 0 : ew.parentSpanId;
              if (
                (ec
                  ? ew.setAttribute(
                      eQ.GalileoTraceAttributes.CALLER_METHOD,
                      (null ==
                      (ep =
                        null == (ed = this._cacheLRUMap)
                          ? void 0
                          : ed.get(`${eA}-${ec}`))
                        ? void 0
                        : ep.caller_method) || "",
                    )
                  : ew.setAttribute(
                      eQ.GalileoTraceAttributes.CALLER_METHOD,
                      "/",
                    ),
                this._httpClientTotalCounter)
              ) {
                let eA = getOutgoingRequestMetricAttributes(el.attributes);
                shouldFilterMetric(
                  el.kind,
                  null == (em = this._pluginConfig) ? void 0 : em.filter,
                  eA,
                ) ||
                  (this._httpClientTotalCounter.add(1, eA),
                  null == (eC = this._nodeInstrumentStartCounter) ||
                    eC.add(1, {
                      ...this._selfAttributes,
                      ReportType: "span",
                      Kind: getKindName(el.kind),
                    }),
                  null == (ey = this._nodeInstrumentStartCounter) ||
                    ey.add(1, {
                      ...this._selfAttributes,
                      ReportType: "metric",
                      Kind: getKindName(el.kind),
                    }));
              }
            }
            return ew;
          }
          _closeHttpSpan(eA, el, ec, eu, ed = !0) {
            var ep, eh, ef;
            if (
              (eA.setAttributes({
                [eQ.GalileoTraceAttributes.TRPC_STATUS_TYPE]:
                  (null == eu
                    ? void 0
                    : eu[eQ.ClientServerMetricAttributes.CodeType]) || "",
                [eQ.GalileoTraceAttributes.TRPC_STATUS_CODE]:
                  (null == eu
                    ? void 0
                    : eu[eQ.ClientServerMetricAttributes.Code]) || "",
              }),
              eA.end(),
              el !== eg.SpanKind.CLIENT || !this._httpClientDurationHistogram)
            )
              return;
            let em = shouldFilterMetric(
              el,
              null == (ep = this._pluginConfig) ? void 0 : ep.filter,
              eu,
            );
            if (!ed || em) return;
            let eE = (0, eC.hrTimeToMilliseconds)(
              (0, eC.hrTimeDuration)(ec, (0, eC.hrTime)()),
            );
            (this._httpClientDurationHistogram.record(eE / 1e3, eu),
              this._httpClientSuccessCounter.add(1, eu),
              null == (eh = this._nodeInstrumentEndCounter) ||
                eh.add(1, {
                  ...this._selfAttributes,
                  ReportType: "span",
                  Kind: getKindName(el),
                  Status: "success",
                }),
              null == (ef = this._nodeInstrumentEndCounter) ||
                ef.add(1, {
                  ...this._selfAttributes,
                  ReportType: "metric",
                  Kind: getKindName(el),
                  Status: "success",
                }));
          }
          _callStartSpanHook(eA, el) {
            if ("function" == typeof el)
              return (0, eS.safeExecuteInTheMiddle)(
                () => el(eA),
                () => {},
                !0,
              );
          }
          _createHeaderCapture() {
            var eA, el, ec, eu;
            let ed = this.getConfig();
            return {
              client: {
                captureRequestHeaders: headerCapture(
                  "request",
                  null !=
                    (el =
                      null ==
                      (eA = null == ed ? void 0 : ed.headersToSpanAttributes)
                        ? void 0
                        : eA.requestHeaders)
                    ? el
                    : [],
                ),
                captureResponseHeaders: headerCapture(
                  "response",
                  null !=
                    (eu =
                      null ==
                      (ec = null == ed ? void 0 : ed.headersToSpanAttributes)
                        ? void 0
                        : ec.responseHeaders)
                    ? eu
                    : [],
                ),
              },
            };
          }
        };
      },
      81822(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { InstrumentationBase: () => eR }));
        var eu = ec(16928),
          ed = ec(39023),
          ep = ec(94377),
          eg = ec(8821),
          eh = ec(2339),
          ef = ec(23258),
          em = ec(37366),
          eE = ec(64270),
          __assign = function () {
            return (__assign =
              Object.assign ||
              function (eA) {
                for (var el, ec = 1, eu = arguments.length; ec < eu; ec++)
                  for (var ed in (el = arguments[ec]))
                    Object.prototype.hasOwnProperty.call(el, ed) &&
                      (eA[ed] = el[ed]);
                return eA;
              }).apply(this, arguments);
          },
          eC = (function () {
            function InstrumentationAbstract(eA, el, ec) {
              ((this.instrumentationName = eA),
                (this.instrumentationVersion = el),
                (this._config = {}),
                (this._wrap = eg.wrap),
                (this._unwrap = eg.unwrap),
                (this._massWrap = eg.massWrap),
                (this._massUnwrap = eg.massUnwrap),
                this.setConfig(ec),
                (this._diag = eh.diag.createComponentLogger({ namespace: eA })),
                (this._tracer = ef.trace.getTracer(eA, el)),
                (this._meter = em.metrics.getMeter(eA, el)),
                (this._logger = eE.logs.getLogger(eA, el)),
                this._updateMetricInstruments());
            }
            return (
              Object.defineProperty(
                InstrumentationAbstract.prototype,
                "meter",
                {
                  get: function () {
                    return this._meter;
                  },
                  enumerable: !1,
                  configurable: !0,
                },
              ),
              (InstrumentationAbstract.prototype.setMeterProvider = function (
                eA,
              ) {
                ((this._meter = eA.getMeter(
                  this.instrumentationName,
                  this.instrumentationVersion,
                )),
                  this._updateMetricInstruments());
              }),
              Object.defineProperty(
                InstrumentationAbstract.prototype,
                "logger",
                {
                  get: function () {
                    return this._logger;
                  },
                  enumerable: !1,
                  configurable: !0,
                },
              ),
              (InstrumentationAbstract.prototype.setLoggerProvider = function (
                eA,
              ) {
                this._logger = eA.getLogger(
                  this.instrumentationName,
                  this.instrumentationVersion,
                );
              }),
              (InstrumentationAbstract.prototype.getModuleDefinitions =
                function () {
                  var eA,
                    el = null != (eA = this.init()) ? eA : [];
                  return Array.isArray(el) ? el : [el];
                }),
              (InstrumentationAbstract.prototype._updateMetricInstruments =
                function () {}),
              (InstrumentationAbstract.prototype.getConfig = function () {
                return this._config;
              }),
              (InstrumentationAbstract.prototype.setConfig = function (eA) {
                this._config = __assign({ enabled: !0 }, eA);
              }),
              (InstrumentationAbstract.prototype.setTracerProvider = function (
                eA,
              ) {
                this._tracer = eA.getTracer(
                  this.instrumentationName,
                  this.instrumentationVersion,
                );
              }),
              Object.defineProperty(
                InstrumentationAbstract.prototype,
                "tracer",
                {
                  get: function () {
                    return this._tracer;
                  },
                  enumerable: !1,
                  configurable: !0,
                },
              ),
              (InstrumentationAbstract.prototype._runSpanCustomizationHook =
                function (eA, el, ec, eu) {
                  if (eA)
                    try {
                      eA(ec, eu);
                    } catch (eA) {
                      this._diag.error(
                        "Error running span customization hook due to exception in handler",
                        { triggerName: el },
                        eA,
                      );
                    }
                }),
              InstrumentationAbstract
            );
          })(),
          ey = ec(2385),
          __values = function (eA) {
            var el = "function" == typeof Symbol && Symbol.iterator,
              ec = el && eA[el],
              eu = 0;
            if (ec) return ec.call(eA);
            if (eA && "number" == typeof eA.length)
              return {
                next: function () {
                  return (
                    eA && eu >= eA.length && (eA = void 0),
                    { value: eA && eA[eu++], done: !eA }
                  );
                },
              };
            throw TypeError(
              el
                ? "Object is not iterable."
                : "Symbol.iterator is not defined.",
            );
          },
          __read = function (eA, el) {
            var ec = "function" == typeof Symbol && eA[Symbol.iterator];
            if (!ec) return eA;
            var eu,
              ed,
              ep = ec.call(eA),
              eg = [];
            try {
              for (; (void 0 === el || el-- > 0) && !(eu = ep.next()).done; )
                eg.push(eu.value);
            } catch (eA) {
              ed = { error: eA };
            } finally {
              try {
                eu && !eu.done && (ec = ep.return) && ec.call(ep);
              } finally {
                if (ed) throw ed.error;
              }
            }
            return eg;
          },
          __spreadArray = function (eA, el, ec) {
            if (ec || 2 == arguments.length)
              for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
                (!eu && ed in el) ||
                  (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
                  (eu[ed] = el[ed]));
            return eA.concat(eu || Array.prototype.slice.call(el));
          },
          ew = "/",
          eB = (function () {
            return function () {
              ((this.hooks = []), (this.children = new Map()));
            };
          })(),
          e_ = (function () {
            function ModuleNameTrie() {
              ((this._trie = new eB()), (this._counter = 0));
            }
            return (
              (ModuleNameTrie.prototype.insert = function (eA) {
                var el,
                  ec,
                  eu = this._trie;
                try {
                  for (
                    var ed = __values(eA.moduleName.split(ew)), ep = ed.next();
                    !ep.done;
                    ep = ed.next()
                  ) {
                    var eg = ep.value,
                      eh = eu.children.get(eg);
                    (eh || ((eh = new eB()), eu.children.set(eg, eh)),
                      (eu = eh));
                  }
                } catch (eA) {
                  el = { error: eA };
                } finally {
                  try {
                    ep && !ep.done && (ec = ed.return) && ec.call(ed);
                  } finally {
                    if (el) throw el.error;
                  }
                }
                eu.hooks.push({ hook: eA, insertedId: this._counter++ });
              }),
              (ModuleNameTrie.prototype.search = function (eA, el) {
                var ec,
                  eu,
                  ed = void 0 === el ? {} : el,
                  ep = ed.maintainInsertionOrder,
                  eg = ed.fullOnly,
                  eh = this._trie,
                  ef = [],
                  em = !0;
                try {
                  for (
                    var eE = __values(eA.split(ew)), eC = eE.next();
                    !eC.done;
                    eC = eE.next()
                  ) {
                    var ey = eC.value,
                      eB = eh.children.get(ey);
                    if (!eB) {
                      em = !1;
                      break;
                    }
                    (eg ||
                      ef.push.apply(
                        ef,
                        __spreadArray([], __read(eB.hooks), !1),
                      ),
                      (eh = eB));
                  }
                } catch (eA) {
                  ec = { error: eA };
                } finally {
                  try {
                    eC && !eC.done && (eu = eE.return) && eu.call(eE);
                  } finally {
                    if (ec) throw ec.error;
                  }
                }
                return (eg &&
                  em &&
                  ef.push.apply(ef, __spreadArray([], __read(eh.hooks), !1)),
                0 === ef.length)
                  ? []
                  : 1 === ef.length
                    ? [ef[0].hook]
                    : (ep &&
                        ef.sort(function (eA, el) {
                          return eA.insertedId - el.insertedId;
                        }),
                      ef.map(function (eA) {
                        return eA.hook;
                      }));
              }),
              ModuleNameTrie
            );
          })(),
          RequireInTheMiddleSingleton_values = function (eA) {
            var el = "function" == typeof Symbol && Symbol.iterator,
              ec = el && eA[el],
              eu = 0;
            if (ec) return ec.call(eA);
            if (eA && "number" == typeof eA.length)
              return {
                next: function () {
                  return (
                    eA && eu >= eA.length && (eA = void 0),
                    { value: eA && eA[eu++], done: !eA }
                  );
                },
              };
            throw TypeError(
              el
                ? "Object is not iterable."
                : "Symbol.iterator is not defined.",
            );
          },
          eI = [
            "afterEach",
            "after",
            "beforeEach",
            "before",
            "describe",
            "it",
          ].every(function (eA) {
            return "function" == typeof global[eA];
          }),
          ev = (function () {
            function RequireInTheMiddleSingleton() {
              ((this._moduleNameTrie = new e_()), this._initialize());
            }
            return (
              (RequireInTheMiddleSingleton.prototype._initialize = function () {
                var eA = this;
                new ey.Hook(null, { internals: !0 }, function (el, ec, eu) {
                  var ed,
                    ep,
                    eg = normalizePathSeparators(ec),
                    eh = eA._moduleNameTrie.search(eg, {
                      maintainInsertionOrder: !0,
                      fullOnly: void 0 === eu,
                    });
                  try {
                    for (
                      var ef = RequireInTheMiddleSingleton_values(eh),
                        em = ef.next();
                      !em.done;
                      em = ef.next()
                    )
                      el = (0, em.value.onRequire)(el, ec, eu);
                  } catch (eA) {
                    ed = { error: eA };
                  } finally {
                    try {
                      em && !em.done && (ep = ef.return) && ep.call(ef);
                    } finally {
                      if (ed) throw ed.error;
                    }
                  }
                  return el;
                });
              }),
              (RequireInTheMiddleSingleton.prototype.register = function (
                eA,
                el,
              ) {
                var ec = { moduleName: eA, onRequire: el };
                return (this._moduleNameTrie.insert(ec), ec);
              }),
              (RequireInTheMiddleSingleton.getInstance = function () {
                var eA;
                return eI
                  ? new RequireInTheMiddleSingleton()
                  : (this._instance =
                      null != (eA = this._instance)
                        ? eA
                        : new RequireInTheMiddleSingleton());
              }),
              RequireInTheMiddleSingleton
            );
          })();
        function normalizePathSeparators(eA) {
          return eu.sep !== ew ? eA.split(eu.sep).join(ew) : eA;
        }
        var eS = ec(93931),
          eQ = ec(79896),
          eD = ec(25318),
          eT = (function () {
            var extendStatics = function (eA, el) {
              return (extendStatics =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (eA, el) {
                    eA.__proto__ = el;
                  }) ||
                function (eA, el) {
                  for (var ec in el)
                    Object.prototype.hasOwnProperty.call(el, ec) &&
                      (eA[ec] = el[ec]);
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
          instrumentation_values = function (eA) {
            var el = "function" == typeof Symbol && Symbol.iterator,
              ec = el && eA[el],
              eu = 0;
            if (ec) return ec.call(eA);
            if (eA && "number" == typeof eA.length)
              return {
                next: function () {
                  return (
                    eA && eu >= eA.length && (eA = void 0),
                    { value: eA && eA[eu++], done: !eA }
                  );
                },
              };
            throw TypeError(
              el
                ? "Object is not iterable."
                : "Symbol.iterator is not defined.",
            );
          },
          eR = (function (eA) {
            function InstrumentationBase(el, ec, eu) {
              var ep = eA.call(this, el, ec, eu) || this;
              ((ep._hooks = []),
                (ep._requireInTheMiddleSingleton = ev.getInstance()),
                (ep._enabled = !1),
                (ep._wrap = function (eA, el, ec) {
                  if (
                    ((0, eD.isWrapped)(eA[el]) && ep._unwrap(eA, el),
                    !ed.types.isProxy(eA))
                  )
                    return (0, eg.wrap)(eA, el, ec);
                  var eu = (0, eg.wrap)(Object.assign({}, eA), el, ec);
                  return (Object.defineProperty(eA, el, { value: eu }), eu);
                }),
                (ep._unwrap = function (eA, el) {
                  return ed.types.isProxy(eA)
                    ? Object.defineProperty(eA, el, { value: eA[el] })
                    : (0, eg.unwrap)(eA, el);
                }),
                (ep._massWrap = function (eA, el, ec) {
                  eA
                    ? (Array.isArray(eA) || (eA = [eA]),
                      el && Array.isArray(el))
                      ? eA.forEach(function (eA) {
                          el.forEach(function (el) {
                            ep._wrap(eA, el, ec);
                          });
                        })
                      : eh.diag.error(
                          "must provide one or more functions to wrap on modules",
                        )
                    : eh.diag.error(
                        "must provide one or more modules to patch",
                      );
                }),
                (ep._massUnwrap = function (eA, el) {
                  eA
                    ? (Array.isArray(eA) || (eA = [eA]),
                      el && Array.isArray(el))
                      ? eA.forEach(function (eA) {
                          el.forEach(function (el) {
                            ep._unwrap(eA, el);
                          });
                        })
                      : eh.diag.error(
                          "must provide one or more functions to wrap on modules",
                        )
                    : eh.diag.error(
                        "must provide one or more modules to patch",
                      );
                }));
              var ef = ep.init();
              return (
                ef && !Array.isArray(ef) && (ef = [ef]),
                (ep._modules = ef || []),
                ep._config.enabled && ep.enable(),
                ep
              );
            }
            return (
              eT(InstrumentationBase, eA),
              (InstrumentationBase.prototype._warnOnPreloadedModules =
                function () {
                  var eA = this;
                  this._modules.forEach(function (el) {
                    var eu = el.name;
                    try {
                      var ed = ec(43193).resolve(eu);
                      ec.c[ed] &&
                        eA._diag.warn(
                          "Module " +
                            eu +
                            " has been loaded before " +
                            eA.instrumentationName +
                            " so it might not work, please initialize it before requiring " +
                            eu,
                        );
                    } catch (eA) {}
                  });
                }),
              (InstrumentationBase.prototype._extractPackageVersion = function (
                eA,
              ) {
                try {
                  var el = (0, eQ.readFileSync)(eu.join(eA, "package.json"), {
                      encoding: "utf8",
                    }),
                    ec = JSON.parse(el).version;
                  return "string" == typeof ec ? ec : void 0;
                } catch (el) {
                  eh.diag.warn("Failed extracting version", eA);
                }
              }),
              (InstrumentationBase.prototype._onRequire = function (
                eA,
                el,
                ec,
                ed,
              ) {
                var ep,
                  eg = this;
                if (!ed)
                  return "function" == typeof eA.patch &&
                    ((eA.moduleExports = el), this._enabled)
                    ? (this._diag.debug(
                        "Applying instrumentation patch for nodejs core module on require hook",
                        { module: eA.name },
                      ),
                      eA.patch(el))
                    : el;
                var eh = this._extractPackageVersion(ed);
                if (((eA.moduleVersion = eh), eA.name === ec))
                  return isSupported(
                    eA.supportedVersions,
                    eh,
                    eA.includePrerelease,
                  ) &&
                    "function" == typeof eA.patch &&
                    ((eA.moduleExports = el), this._enabled)
                    ? (this._diag.debug(
                        "Applying instrumentation patch for module on require hook",
                        {
                          module: eA.name,
                          version: eA.moduleVersion,
                          baseDir: ed,
                        },
                      ),
                      eA.patch(el, eA.moduleVersion))
                    : el;
                var ef = null != (ep = eA.files) ? ep : [],
                  em = eu.normalize(ec);
                return ef
                  .filter(function (eA) {
                    return eA.name === em;
                  })
                  .filter(function (el) {
                    return isSupported(
                      el.supportedVersions,
                      eh,
                      eA.includePrerelease,
                    );
                  })
                  .reduce(function (el, ec) {
                    return ((ec.moduleExports = el), eg._enabled)
                      ? (eg._diag.debug(
                          "Applying instrumentation patch for nodejs module file on require hook",
                          {
                            module: eA.name,
                            version: eA.moduleVersion,
                            fileName: ec.name,
                            baseDir: ed,
                          },
                        ),
                        ec.patch(el, eA.moduleVersion))
                      : el;
                  }, el);
              }),
              (InstrumentationBase.prototype.enable = function () {
                var eA,
                  el,
                  ec,
                  ed,
                  ep,
                  eg,
                  eh = this;
                if (!this._enabled) {
                  if (((this._enabled = !0), this._hooks.length > 0)) {
                    try {
                      for (
                        var ef = instrumentation_values(this._modules),
                          em = ef.next();
                        !em.done;
                        em = ef.next()
                      ) {
                        var eE = em.value;
                        "function" == typeof eE.patch &&
                          eE.moduleExports &&
                          (this._diag.debug(
                            "Applying instrumentation patch for nodejs module on instrumentation enabled",
                            { module: eE.name, version: eE.moduleVersion },
                          ),
                          eE.patch(eE.moduleExports, eE.moduleVersion));
                        try {
                          for (
                            var eC =
                                ((ec = void 0),
                                instrumentation_values(eE.files)),
                              ew = eC.next();
                            !ew.done;
                            ew = eC.next()
                          ) {
                            var eB = ew.value;
                            eB.moduleExports &&
                              (this._diag.debug(
                                "Applying instrumentation patch for nodejs module file on instrumentation enabled",
                                {
                                  module: eE.name,
                                  version: eE.moduleVersion,
                                  fileName: eB.name,
                                },
                              ),
                              eB.patch(eB.moduleExports, eE.moduleVersion));
                          }
                        } catch (eA) {
                          ec = { error: eA };
                        } finally {
                          try {
                            ew && !ew.done && (ed = eC.return) && ed.call(eC);
                          } finally {
                            if (ec) throw ec.error;
                          }
                        }
                      }
                    } catch (el) {
                      eA = { error: el };
                    } finally {
                      try {
                        em && !em.done && (el = ef.return) && el.call(ef);
                      } finally {
                        if (eA) throw eA.error;
                      }
                    }
                    return;
                  }
                  this._warnOnPreloadedModules();
                  var _loop_1 = function (eA) {
                      var hookFn = function (el, ec, ed) {
                          if (!ed && eu.isAbsolute(ec)) {
                            var ep = eu.parse(ec);
                            ((ec = ep.name), (ed = ep.dir));
                          }
                          return eh._onRequire(eA, el, ec, ed);
                        },
                        onRequire = function (el, ec, eu) {
                          return eh._onRequire(eA, el, ec, eu);
                        },
                        el = eu.isAbsolute(eA.name)
                          ? new ey.Hook([eA.name], { internals: !0 }, onRequire)
                          : e_._requireInTheMiddleSingleton.register(
                              eA.name,
                              onRequire,
                            );
                      e_._hooks.push(el);
                      var ec = new eS.Hook(
                        [eA.name],
                        { internals: !1 },
                        hookFn,
                      );
                      e_._hooks.push(ec);
                    },
                    e_ = this;
                  try {
                    for (
                      var eI = instrumentation_values(this._modules),
                        ev = eI.next();
                      !ev.done;
                      ev = eI.next()
                    ) {
                      var eQ = ev.value;
                      _loop_1(eQ);
                    }
                  } catch (eA) {
                    ep = { error: eA };
                  } finally {
                    try {
                      ev && !ev.done && (eg = eI.return) && eg.call(eI);
                    } finally {
                      if (ep) throw ep.error;
                    }
                  }
                }
              }),
              (InstrumentationBase.prototype.disable = function () {
                var eA, el, ec, eu;
                if (this._enabled) {
                  this._enabled = !1;
                  try {
                    for (
                      var ed = instrumentation_values(this._modules),
                        ep = ed.next();
                      !ep.done;
                      ep = ed.next()
                    ) {
                      var eg = ep.value;
                      "function" == typeof eg.unpatch &&
                        eg.moduleExports &&
                        (this._diag.debug(
                          "Removing instrumentation patch for nodejs module on instrumentation disabled",
                          { module: eg.name, version: eg.moduleVersion },
                        ),
                        eg.unpatch(eg.moduleExports, eg.moduleVersion));
                      try {
                        for (
                          var eh =
                              ((ec = void 0), instrumentation_values(eg.files)),
                            ef = eh.next();
                          !ef.done;
                          ef = eh.next()
                        ) {
                          var em = ef.value;
                          em.moduleExports &&
                            (this._diag.debug(
                              "Removing instrumentation patch for nodejs module file on instrumentation disabled",
                              {
                                module: eg.name,
                                version: eg.moduleVersion,
                                fileName: em.name,
                              },
                            ),
                            em.unpatch(em.moduleExports, eg.moduleVersion));
                        }
                      } catch (eA) {
                        ec = { error: eA };
                      } finally {
                        try {
                          ef && !ef.done && (eu = eh.return) && eu.call(eh);
                        } finally {
                          if (ec) throw ec.error;
                        }
                      }
                    }
                  } catch (el) {
                    eA = { error: el };
                  } finally {
                    try {
                      ep && !ep.done && (el = ed.return) && el.call(ed);
                    } finally {
                      if (eA) throw eA.error;
                    }
                  }
                }
              }),
              (InstrumentationBase.prototype.isEnabled = function () {
                return this._enabled;
              }),
              InstrumentationBase
            );
          })(eC);
        function isSupported(eA, el, ec) {
          return void 0 === el
            ? eA.includes("*")
            : eA.some(function (eA) {
                return (0, ep.satisfies)(el, eA, { includePrerelease: ec });
              });
        }
      },
      25318(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            isWrapped: () => isWrapped,
            safeExecuteInTheMiddle: () => safeExecuteInTheMiddle,
            safeExecuteInTheMiddleAsync: () => safeExecuteInTheMiddleAsync,
          }));
        var __awaiter = function (eA, el, ec, eu) {
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
                eA.done
                  ? ec(eA.value)
                  : adopt(eA.value).then(fulfilled, rejected);
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
                  switch (
                    ((eu = 0), ed && (ep = [2 & ep[0], ed.value]), ep[0])
                  ) {
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
                        !(ed =
                          (ed = eg.trys).length > 0 && ed[ed.length - 1]) &&
                        (6 === ep[0] || 2 === ep[0])
                      ) {
                        eg = 0;
                        continue;
                      }
                      if (
                        3 === ep[0] &&
                        (!ed || (ep[1] > ed[0] && ep[1] < ed[3]))
                      ) {
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
          };
        function safeExecuteInTheMiddle(eA, el, ec) {
          var eu, ed;
          try {
            ed = eA();
          } catch (eA) {
            eu = eA;
          } finally {
            if ((el(eu, ed), eu && !ec)) throw eu;
            return ed;
          }
        }
        function safeExecuteInTheMiddleAsync(eA, el, ec) {
          return __awaiter(this, void 0, void 0, function () {
            var eu, ed;
            return __generator(this, function (ep) {
              switch (ep.label) {
                case 0:
                  return (ep.trys.push([0, 2, 3, 4]), [4, eA()]);
                case 1:
                  return ((ed = ep.sent()), [3, 4]);
                case 2:
                  return ((eu = ep.sent()), [3, 4]);
                case 3:
                  if ((el(eu, ed), eu && !ec)) throw eu;
                  return [2, ed];
                case 4:
                  return [2];
              }
            });
          });
        }
        function isWrapped(eA) {
          return (
            "function" == typeof eA &&
            "function" == typeof eA.__original &&
            "function" == typeof eA.__unwrap &&
            !0 === eA.__wrapped
          );
        }
      },
      16928(eA) {
        "use strict";
        eA.exports = require("path");
      },
      39023(eA) {
        "use strict";
        eA.exports = require("util");
      },
      94377(eA, el, ec) {
        "use strict";
        function bunOrder(eA, el) {
          return Bun.semver.order(eA, el);
        }
        function originalSemver() {
          return ec(99589);
        }
        function gt(eA, el) {
          return "u" > typeof Bun
            ? 1 === bunOrder(eA, el)
            : originalSemver().gt(eA, el);
        }
        function gte(eA, el) {
          return "u" > typeof Bun
            ? bunOrder(eA, el) >= 0
            : originalSemver().gte(eA, el);
        }
        function lt(eA, el) {
          return "u" > typeof Bun
            ? -1 === bunOrder(eA, el)
            : originalSemver().lt(eA, el);
        }
        function lte(eA, el) {
          return "u" > typeof Bun
            ? 0 >= bunOrder(eA, el)
            : originalSemver().lte(eA, el);
        }
        function satisfies(eA, el) {
          return "u" > typeof Bun
            ? Bun.semver.satisfies(eA, el)
            : originalSemver().satisfies(eA, el);
        }
        function rcompare(eA, el) {
          return "u" > typeof Bun
            ? bunOrder(el, eA)
            : originalSemver().rcompare(eA, el);
        }
        function valid(eA) {
          return "u" > typeof Bun
            ? Bun.semver.satisfies(eA, ">=0.0.0")
              ? eA
              : null
            : originalSemver().valid(eA);
        }
        function coerce(eA) {
          return originalSemver().coerce(eA);
        }
        function validRange(eA) {
          return originalSemver().validRange(eA);
        }
        function maxSatisfying(eA, el) {
          return originalSemver().maxSatisfying(eA, el);
        }
        function minVersion(eA) {
          return originalSemver().minVersion(eA);
        }
        (ec.r(el),
          ec.d(el, {
            coerce: () => coerce,
            gt: () => gt,
            gte: () => gte,
            lt: () => lt,
            lte: () => lte,
            maxSatisfying: () => maxSatisfying,
            minVersion: () => minVersion,
            rcompare: () => rcompare,
            satisfies: () => satisfies,
            valid: () => valid,
            validRange: () => validRange,
          }));
      },
      8821(eA) {
        "use strict";
        function isFunction(eA) {
          return "function" == typeof eA;
        }
        var el = console.error.bind(console);
        function defineProperty(eA, el, ec) {
          var eu = !!eA[el] && eA.propertyIsEnumerable(el);
          Object.defineProperty(eA, el, {
            configurable: !0,
            enumerable: eu,
            writable: !0,
            value: ec,
          });
        }
        function shimmer(eA) {
          eA &&
            eA.logger &&
            (isFunction(eA.logger)
              ? (el = eA.logger)
              : el("new logger isn't a function, not replacing"));
        }
        function wrap(eA, ec, eu) {
          if (!eA || !eA[ec])
            return void el("no original function " + ec + " to wrap");
          if (!eu) {
            (el("no wrapper function"), el(Error().stack));
            return;
          }
          if (!isFunction(eA[ec]) || !isFunction(eu))
            return void el("original object and wrapper must be functions");
          var ed = eA[ec],
            ep = eu(ed, ec);
          return (
            defineProperty(ep, "__original", ed),
            defineProperty(ep, "__unwrap", function () {
              eA[ec] === ep && defineProperty(eA, ec, ed);
            }),
            defineProperty(ep, "__wrapped", !0),
            defineProperty(eA, ec, ep),
            ep
          );
        }
        function massWrap(eA, ec, eu) {
          if (eA) Array.isArray(eA) || (eA = [eA]);
          else {
            (el("must provide one or more modules to patch"),
              el(Error().stack));
            return;
          }
          ec && Array.isArray(ec)
            ? eA.forEach(function (eA) {
                ec.forEach(function (el) {
                  wrap(eA, el, eu);
                });
              })
            : el("must provide one or more functions to wrap on modules");
        }
        function unwrap(eA, ec) {
          if (!eA || !eA[ec]) {
            (el("no function to unwrap."), el(Error().stack));
            return;
          }
          if (eA[ec].__unwrap) return eA[ec].__unwrap();
          el(
            "no original to unwrap to -- has " +
              ec +
              " already been unwrapped?",
          );
        }
        function massUnwrap(eA, ec) {
          if (eA) Array.isArray(eA) || (eA = [eA]);
          else {
            (el("must provide one or more modules to patch"),
              el(Error().stack));
            return;
          }
          ec && Array.isArray(ec)
            ? eA.forEach(function (eA) {
                ec.forEach(function (el) {
                  unwrap(eA, el);
                });
              })
            : el("must provide one or more functions to unwrap on modules");
        }
        ((shimmer.wrap = wrap),
          (shimmer.massWrap = massWrap),
          (shimmer.unwrap = unwrap),
          (shimmer.massUnwrap = massUnwrap),
          (eA.exports = shimmer));
      },
      2385(eA, el, ec) {
        "use strict";
        let eu,
          ed,
          ep,
          eg = ec(16928),
          eh = ec(73339),
          ef = ec(3680)("require-in-the-middle"),
          em = ec(79280);
        if (((eA.exports = Hook), (eA.exports.Hook = Hook), eh.isBuiltin))
          ed = eh.isBuiltin;
        else if (eh.builtinModules)
          ed = (eA) =>
            !!eA.startsWith("node:") ||
            (void 0 === eu && (eu = new Set(eh.builtinModules)), eu.has(eA));
        else {
          let eA = ec(14666),
            [el, eu] = process.versions.node.split(".").map(Number);
          ed =
            8 === el && eu < 8
              ? (el) => "http2" === el || !!eA.core[el]
              : (el) => !!eA.core[el];
        }
        function resolve(eA, el) {
          if (!ep)
            if (ec(51444).resolve.paths)
              ep = function (eA, el) {
                return require.resolve(eA, { paths: [el] });
              };
            else {
              let eA = ec(14666);
              ep = function (el, ec) {
                return eA.sync(el, { basedir: ec });
              };
            }
          return ep(eA, el);
        }
        let eE = /([/\\]index)?(\.js)?$/;
        let ExportsCache = class ExportsCache {
          constructor() {
            ((this._localCache = new Map()),
              (this._kRitmExports = Symbol("RitmExports")));
          }
          has(eA, el) {
            if (this._localCache.has(eA)) return !0;
            if (el) return !1;
            {
              let el = ec.c[eA];
              return !!(el && this._kRitmExports in el);
            }
          }
          get(eA, el) {
            let eu = this._localCache.get(eA);
            if (void 0 !== eu) return eu;
            if (!el) {
              let el = ec.c[eA];
              return el && el[this._kRitmExports];
            }
          }
          set(eA, el, eu) {
            eu
              ? this._localCache.set(eA, el)
              : eA in ec.c
                ? (ec.c[eA][this._kRitmExports] = el)
                : (ef(
                    'non-core module is unexpectedly not in require.cache: "%s"',
                    eA,
                  ),
                  this._localCache.set(eA, el));
          }
        };
        function Hook(eA, el, eu) {
          if (this instanceof Hook == !1) return new Hook(eA, el, eu);
          if (
            ("function" == typeof eA
              ? ((eu = eA), (eA = null), (el = null))
              : "function" == typeof el && ((eu = el), (el = null)),
            "function" != typeof eh._resolveFilename)
          ) {
            (console.error(
              "Error: Expected Module._resolveFilename to be a function (was: %s) - aborting!",
              typeof eh._resolveFilename,
            ),
              console.error(
                "Please report this error as an issue related to Node.js %s at %s",
                process.version,
                ec(53134).bugs.url,
              ));
            return;
          }
          ((this._cache = new ExportsCache()),
            (this._unhooked = !1),
            (this._origRequire = eh.prototype.require));
          let ep = this,
            eE = new Set(),
            eC = !!el && !0 === el.internals,
            ey = Array.isArray(eA);
          function patchedRequire(el, ec) {
            let ew,
              eB,
              e_,
              eI = el[0],
              ev = ed(eI);
            if (ev) {
              if (((ew = eI), eI.startsWith("node:"))) {
                let eA = eI.slice(5);
                ed(eA) && (ew = eA);
              }
            } else if (ec)
              return (
                ef("call to process.getBuiltinModule with unknown built-in id"),
                ep._origGetBuiltinModule.apply(this, el)
              );
            else
              try {
                ew = eh._resolveFilename(eI, this);
              } catch (eA) {
                return (
                  ef(
                    'Module._resolveFilename("%s") threw %j, calling original Module.require',
                    eI,
                    eA.message,
                  ),
                  ep._origRequire.apply(this, el)
                );
              }
            if (
              (ef(
                "processing %s module require('%s'): %s",
                !0 === ev ? "core" : "non-core",
                eI,
                ew,
              ),
              !0 === ep._cache.has(ew, ev))
            )
              return (
                ef("returning already patched cached module: %s", ew),
                ep._cache.get(ew, ev)
              );
            let eS = eE.has(ew);
            !1 === eS && eE.add(ew);
            let eQ = ec
              ? ep._origGetBuiltinModule.apply(this, el)
              : ep._origRequire.apply(this, el);
            if (!0 === eS)
              return (
                ef(
                  "module is in the process of being patched already - ignoring: %s",
                  ew,
                ),
                eQ
              );
            if ((eE.delete(ew), !0 === ev)) {
              if (!0 === ey && !1 === eA.includes(ew))
                return (
                  ef("ignoring core module not on whitelist: %s", ew),
                  eQ
                );
              eB = ew;
            } else if (!0 === ey && eA.includes(ew)) {
              let eA = eg.parse(ew);
              ((eB = eA.name), (e_ = eA.dir));
            } else {
              let el = em(ew);
              if (void 0 === el)
                return (ef("could not parse filename: %s", ew), eQ);
              ((eB = el.name), (e_ = el.basedir));
              let ec = resolveModuleName(el);
              ef(
                "resolved filename to module: %s (id: %s, resolved: %s, basedir: %s)",
                eB,
                eI,
                ec,
                e_,
              );
              let eu = !1;
              if (ey) {
                if (
                  (!eI.startsWith(".") &&
                    eA.includes(eI) &&
                    ((eB = eI), (eu = !0)),
                  !eA.includes(eB) && !eA.includes(ec))
                )
                  return eQ;
                eA.includes(ec) && ec !== eB && ((eB = ec), (eu = !0));
              }
              if (!eu) {
                let eA;
                try {
                  eA = resolve(eB, e_);
                } catch (eA) {
                  return (
                    ef("could not resolve module: %s", eB),
                    ep._cache.set(ew, eQ, ev),
                    eQ
                  );
                }
                if (eA !== ew)
                  if (!0 !== eC)
                    return (
                      ef("ignoring require of non-main module file: %s", eA),
                      ep._cache.set(ew, eQ, ev),
                      eQ
                    );
                  else
                    ef(
                      "preparing to process require of internal file: %s",
                      (eB = eB + eg.sep + eg.relative(e_, ew)),
                    );
              }
            }
            (ep._cache.set(ew, eQ, ev), ef("calling require hook: %s", eB));
            let eD = eu(eQ, eB, e_);
            return (
              ep._cache.set(ew, eD, ev),
              ef("returning module: %s", eB),
              eD
            );
          }
          (ef("registering require hook"),
            (this._require = eh.prototype.require =
              function (eA) {
                return !0 === ep._unhooked
                  ? (ef("ignoring require call - module is soft-unhooked"),
                    ep._origRequire.apply(this, arguments))
                  : patchedRequire.call(this, arguments, !1);
              }),
            "function" == typeof process.getBuiltinModule &&
              ((this._origGetBuiltinModule = process.getBuiltinModule),
              (this._getBuiltinModule = process.getBuiltinModule =
                function (eA) {
                  return !0 === ep._unhooked
                    ? (ef(
                        "ignoring process.getBuiltinModule call - module is soft-unhooked",
                      ),
                      ep._origGetBuiltinModule.apply(this, arguments))
                    : patchedRequire.call(this, arguments, !0);
                })));
        }
        function resolveModuleName(eA) {
          let el = "/" !== eg.sep ? eA.path.split(eg.sep).join("/") : eA.path;
          return eg.posix.join(eA.name, el).replace(eE, "");
        }
        Hook.prototype.unhook = function () {
          ((this._unhooked = !0),
            this._require === eh.prototype.require
              ? ((eh.prototype.require = this._origRequire),
                ef("require unhook successful"))
              : ef("require unhook unsuccessful"),
            void 0 !== process.getBuiltinModule &&
              (this._getBuiltinModule === process.getBuiltinModule
                ? ((process.getBuiltinModule = this._origGetBuiltinModule),
                  ef("process.getBuiltinModule unhook successful"))
                : ef("process.getBuiltinModule unhook unsuccessful")));
        };
      },
      93931(eA, el, ec) {
        let eu,
          ed = ec(16928),
          ep = ec(79280),
          { fileURLToPath: eg } = ec(87016),
          { MessageChannel: eh } = ec(28167),
          {
            importHooks: ef,
            specifiers: em,
            toHook: eE,
            getExperimentalPatchInternals: eC,
          } = ec(8026);
        function addHook(eA) {
          (ef.push(eA), eE.forEach(([el, ec]) => eA(el, ec)));
        }
        function removeHook(eA) {
          let el = ef.indexOf(eA);
          el > -1 && ef.splice(el, 1);
        }
        function callHookFn(eA, el, ec, eu) {
          let ed = eA(el, ec, eu);
          ed && ed !== el && (el.default = ed);
        }
        function createAddHookMessageChannel() {
          let eA,
            { port1: el, port2: ec } = new eh(),
            ed = 0;
          ((eu = (eA) => {
            (ed++, el.postMessage(eA));
          }),
            el
              .on("message", () => {
                (ed--, eA && ed <= 0 && eA());
              })
              .unref());
          let ep = ec;
          return {
            registerOptions: {
              data: { addHookMessagePort: ep, include: [] },
              transferList: [ep],
            },
            addHookMessagePort: ep,
            waitForAllMessagesAcknowledged: function () {
              let el = setInterval(() => {}, 1e3),
                ec = new Promise((el) => {
                  eA = el;
                }).then(() => {
                  clearInterval(el);
                });
              return (0 === ed && eA(), ec);
            },
          };
        }
        function Hook(eA, el, ec) {
          if (this instanceof Hook == !1) return new Hook(eA, el, ec);
          "function" == typeof eA
            ? ((ec = eA), (eA = null), (el = null))
            : "function" == typeof el && ((ec = el), (el = null));
          let eh = !!el && !0 === el.internals;
          (eu && Array.isArray(eA) && eu(eA),
            (this._iitmHook = (el, eu) => {
              let ef,
                eE = el;
              if (el.startsWith("node:")) el = el.replace(/^node:/, "");
              else {
                if (el.startsWith("file://"))
                  try {
                    el = eg(el);
                  } catch (eA) {}
                let eA = ep(el);
                eA && ((el = eA.name), (ef = eA.basedir));
              }
              if (eA) {
                for (let ep of eA)
                  if (ep === el) {
                    if (ef) {
                      if (eh) el = el + ed.sep + ed.relative(ef, eg(eE));
                      else if (!eC() && !ef.endsWith(em.get(eE))) continue;
                    }
                    callHookFn(ec, eu, el, ef);
                  }
              } else callHookFn(ec, eu, el, ef);
            }),
            addHook(this._iitmHook));
        }
        ((Hook.prototype.unhook = function () {
          removeHook(this._iitmHook);
        }),
          (eA.exports = Hook),
          (eA.exports.Hook = Hook),
          (eA.exports.addHook = addHook),
          (eA.exports.removeHook = removeHook),
          (eA.exports.createAddHookMessageChannel =
            createAddHookMessageChannel));
      },
      79896(eA) {
        "use strict";
        eA.exports = require("fs");
      },
      43193(eA) {
        function webpackEmptyContext(eA) {
          var el = Error("Cannot find module '" + eA + "'");
          throw ((el.code = "MODULE_NOT_FOUND"), el);
        }
        ((webpackEmptyContext.keys = () => []),
          (webpackEmptyContext.resolve = webpackEmptyContext),
          (webpackEmptyContext.id = 43193),
          (eA.exports = webpackEmptyContext));
      },
      99589(eA, el, ec) {
        "use strict";
        let eu = ec(99718),
          ed = ec(16874),
          ep = ec(53908),
          eg = ec(61123),
          eh = ec(30144),
          ef = ec(56953),
          em = ec(57414),
          eE = ec(93007),
          eC = ec(51832),
          ey = ec(32938),
          ew = ec(46254),
          eB = ec(24493),
          e_ = ec(31729),
          eI = ec(50560),
          ev = ec(9970),
          eS = ec(11763),
          eQ = ec(40909),
          eD = ec(43927),
          eT = ec(74277),
          eR = ec(35580),
          ek = ec(7059),
          eM = ec(94641),
          ex = ec(13999),
          eO = ec(54089),
          eN = ec(25200),
          eP = ec(72111),
          eL = ec(46170),
          eF = ec(93904),
          eU = ec(78311),
          ej = ec(97638),
          eG = ec(77631),
          eH = ec(19628),
          eK = ec(270),
          e$ = ec(41261),
          eY = ec(13874),
          eJ = ec(97075),
          ez = ec(75571),
          eW = ec(5342),
          eV = ec(76780);
        eA.exports = {
          parse: eh,
          valid: ef,
          clean: em,
          inc: eE,
          diff: eC,
          major: ey,
          minor: ew,
          patch: eB,
          prerelease: e_,
          compare: eI,
          rcompare: ev,
          compareLoose: eS,
          compareBuild: eQ,
          sort: eD,
          rsort: eT,
          gt: eR,
          lt: ek,
          eq: eM,
          neq: ex,
          gte: eO,
          lte: eN,
          cmp: eP,
          coerce: eL,
          Comparator: eF,
          Range: eU,
          satisfies: ej,
          toComparators: eG,
          maxSatisfying: eH,
          minSatisfying: eK,
          minVersion: e$,
          validRange: eY,
          outside: eJ,
          gtr: ez,
          ltr: eW,
          intersects: eV,
          simplifyRange: ec(72525),
          subset: ec(75032),
          SemVer: ep,
          re: eu.re,
          src: eu.src,
          tokens: eu.t,
          SEMVER_SPEC_VERSION: ed.SEMVER_SPEC_VERSION,
          RELEASE_TYPES: ed.RELEASE_TYPES,
          compareIdentifiers: eg.compareIdentifiers,
          rcompareIdentifiers: eg.rcompareIdentifiers,
        };
      },
      73339(eA) {
        "use strict";
        eA.exports = require("module");
      },
      3680(eA, el, ec) {
        "u" < typeof process ||
        "renderer" === process.type ||
        !0 === process.browser ||
        process.__nwjs
          ? (eA.exports = ec(20124))
          : (eA.exports = ec(85038));
      },
      79280(eA, el, ec) {
        "use strict";
        var eu = ec(16928).sep;
        eA.exports = function (eA) {
          var el = eA.split(eu),
            ec = el.lastIndexOf("node_modules");
          if (-1 !== ec && el[ec + 1]) {
            for (
              var ed = "@" === el[ec + 1][0],
                ep = ed ? el[ec + 1] + "/" + el[ec + 2] : el[ec + 1],
                eg = ed ? 3 : 2,
                eh = "",
                ef = ec + eg - 1,
                em = 0;
              em <= ef;
              em++
            )
              em === ef ? (eh += el[em]) : (eh += el[em] + eu);
            for (var eE = "", eC = el.length - 1, ey = ec + eg; ey <= eC; ey++)
              ey === eC ? (eE += el[ey]) : (eE += el[ey] + eu);
            return { name: ep, basedir: eh, path: eE };
          }
        };
      },
      14666(eA, el, ec) {
        var eu = ec(98882);
        ((eu.core = ec(77875)),
          (eu.isCore = ec(94278)),
          (eu.sync = ec(41911)),
          (eA.exports = eu));
      },
      51444(eA) {
        function webpackEmptyContext(eA) {
          var el = Error("Cannot find module '" + eA + "'");
          throw ((el.code = "MODULE_NOT_FOUND"), el);
        }
        ((webpackEmptyContext.keys = () => []),
          (webpackEmptyContext.resolve = webpackEmptyContext),
          (webpackEmptyContext.id = 51444),
          (eA.exports = webpackEmptyContext));
      },
      53134(eA) {
        "use strict";
        eA.exports = JSON.parse(
          '{"name":"require-in-the-middle","version":"7.5.2","description":"Module to hook into the Node.js require function","main":"index.js","types":"types/index.d.ts","dependencies":{"debug":"^4.3.5","module-details-from-path":"^1.0.3","resolve":"^1.22.8"},"devDependencies":{"@babel/core":"^7.9.0","@babel/preset-env":"^7.9.5","@babel/preset-typescript":"^7.9.0","@babel/register":"^7.9.0","ipp-printer":"^1.0.0","patterns":"^1.0.3","roundround":"^0.2.0","semver":"^6.3.0","standard":"^14.3.1","tape":"^4.11.0"},"scripts":{"test":"npm run test:lint && npm run test:tape && npm run test:babel","test:lint":"standard","test:tape":"tape test/*.js","test:babel":"node test/babel/babel-register.js"},"repository":{"type":"git","url":"git+https://github.com/nodejs/require-in-the-middle.git"},"keywords":["require","hook","shim","shimmer","shimming","patch","monkey","monkeypatch","module","load"],"files":["types"],"author":"Thomas Watson Steen <w@tson.dk> (https://twitter.com/wa7son)","license":"MIT","bugs":{"url":"https://github.com/nodejs/require-in-the-middle/issues"},"homepage":"https://github.com/nodejs/require-in-the-middle#readme","engines":{"node":">=8.6.0"}}',
        );
      },
      87016(eA) {
        "use strict";
        eA.exports = require("url");
      },
      28167(eA) {
        "use strict";
        eA.exports = require("worker_threads");
      },
      8026(eA, el) {
        let ec = [],
          eu = new WeakMap(),
          ed = new WeakMap(),
          ep = new Map(),
          eg = [],
          eh = {
            set: (eA, el, ec) => eu.get(eA)[el](ec),
            get(eA, el) {
              if (el === Symbol.toStringTag) return "Module";
              let ec = ed.get(eA)[el];
              if ("function" == typeof ec) return ec();
            },
            defineProperty(eA, el, ec) {
              if (!("value" in ec))
                throw Error(
                  "Getters/setters are not supported for exports property descriptors.",
                );
              return eu.get(eA)[el](ec.value);
            },
          },
          ef = !1;
        function getExperimentalPatchInternals() {
          return ef;
        }
        function setExperimentalPatchInternals(eA) {
          ef = eA;
        }
        ((el.register = function (eA, el, ef, em, eE) {
          (ep.set(eA, eE), eu.set(el, ef), ed.set(el, em));
          let eC = new Proxy(el, eh);
          (ec.forEach((el) => el(eA, eC)), eg.push([eA, eC]));
        }),
          (el.importHooks = ec),
          (el.specifiers = ep),
          (el.toHook = eg),
          (el.getExperimentalPatchInternals = getExperimentalPatchInternals),
          (el.setExperimentalPatchInternals = setExperimentalPatchInternals));
      },
      99718(eA, el, ec) {
        "use strict";
        let {
            MAX_SAFE_COMPONENT_LENGTH: eu,
            MAX_SAFE_BUILD_LENGTH: ed,
            MAX_LENGTH: ep,
          } = ec(16874),
          eg = ec(57272),
          eh = ((el = eA.exports = {}).re = []),
          ef = (el.safeRe = []),
          em = (el.src = []),
          eE = (el.safeSrc = []),
          eC = (el.t = {}),
          ey = 0,
          ew = "[a-zA-Z0-9-]",
          eB = [
            ["\\s", 1],
            ["\\d", ep],
            [ew, ed],
          ],
          makeSafeRegex = (eA) => {
            for (let [el, ec] of eB)
              eA = eA
                .split(`${el}*`)
                .join(`${el}{0,${ec}}`)
                .split(`${el}+`)
                .join(`${el}{1,${ec}}`);
            return eA;
          },
          createToken = (eA, el, ec) => {
            let eu = makeSafeRegex(el),
              ed = ey++;
            (eg(eA, ed, el),
              (eC[eA] = ed),
              (em[ed] = el),
              (eE[ed] = eu),
              (eh[ed] = new RegExp(el, ec ? "g" : void 0)),
              (ef[ed] = new RegExp(eu, ec ? "g" : void 0)));
          };
        (createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*"),
          createToken("NUMERICIDENTIFIERLOOSE", "\\d+"),
          createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${ew}*`),
          createToken(
            "MAINVERSION",
            `(${em[eC.NUMERICIDENTIFIER]})\\.(${em[eC.NUMERICIDENTIFIER]})\\.(${em[eC.NUMERICIDENTIFIER]})`,
          ),
          createToken(
            "MAINVERSIONLOOSE",
            `(${em[eC.NUMERICIDENTIFIERLOOSE]})\\.(${em[eC.NUMERICIDENTIFIERLOOSE]})\\.(${em[eC.NUMERICIDENTIFIERLOOSE]})`,
          ),
          createToken(
            "PRERELEASEIDENTIFIER",
            `(?:${em[eC.NONNUMERICIDENTIFIER]}|${em[eC.NUMERICIDENTIFIER]})`,
          ),
          createToken(
            "PRERELEASEIDENTIFIERLOOSE",
            `(?:${em[eC.NONNUMERICIDENTIFIER]}|${em[eC.NUMERICIDENTIFIERLOOSE]})`,
          ),
          createToken(
            "PRERELEASE",
            `(?:-(${em[eC.PRERELEASEIDENTIFIER]}(?:\\.${em[eC.PRERELEASEIDENTIFIER]})*))`,
          ),
          createToken(
            "PRERELEASELOOSE",
            `(?:-?(${em[eC.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${em[eC.PRERELEASEIDENTIFIERLOOSE]})*))`,
          ),
          createToken("BUILDIDENTIFIER", `${ew}+`),
          createToken(
            "BUILD",
            `(?:\\+(${em[eC.BUILDIDENTIFIER]}(?:\\.${em[eC.BUILDIDENTIFIER]})*))`,
          ),
          createToken(
            "FULLPLAIN",
            `v?${em[eC.MAINVERSION]}${em[eC.PRERELEASE]}?${em[eC.BUILD]}?`,
          ),
          createToken("FULL", `^${em[eC.FULLPLAIN]}$`),
          createToken(
            "LOOSEPLAIN",
            `[v=\\s]*${em[eC.MAINVERSIONLOOSE]}${em[eC.PRERELEASELOOSE]}?${em[eC.BUILD]}?`,
          ),
          createToken("LOOSE", `^${em[eC.LOOSEPLAIN]}$`),
          createToken("GTLT", "((?:<|>)?=?)"),
          createToken(
            "XRANGEIDENTIFIERLOOSE",
            `${em[eC.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`,
          ),
          createToken(
            "XRANGEIDENTIFIER",
            `${em[eC.NUMERICIDENTIFIER]}|x|X|\\*`,
          ),
          createToken(
            "XRANGEPLAIN",
            `[v=\\s]*(${em[eC.XRANGEIDENTIFIER]})(?:\\.(${em[eC.XRANGEIDENTIFIER]})(?:\\.(${em[eC.XRANGEIDENTIFIER]})(?:${em[eC.PRERELEASE]})?${em[eC.BUILD]}?)?)?`,
          ),
          createToken(
            "XRANGEPLAINLOOSE",
            `[v=\\s]*(${em[eC.XRANGEIDENTIFIERLOOSE]})(?:\\.(${em[eC.XRANGEIDENTIFIERLOOSE]})(?:\\.(${em[eC.XRANGEIDENTIFIERLOOSE]})(?:${em[eC.PRERELEASELOOSE]})?${em[eC.BUILD]}?)?)?`,
          ),
          createToken("XRANGE", `^${em[eC.GTLT]}\\s*${em[eC.XRANGEPLAIN]}$`),
          createToken(
            "XRANGELOOSE",
            `^${em[eC.GTLT]}\\s*${em[eC.XRANGEPLAINLOOSE]}$`,
          ),
          createToken(
            "COERCEPLAIN",
            `(^|[^\\d])(\\d{1,${eu}})(?:\\.(\\d{1,${eu}}))?(?:\\.(\\d{1,${eu}}))?`,
          ),
          createToken("COERCE", `${em[eC.COERCEPLAIN]}(?:$|[^\\d])`),
          createToken(
            "COERCEFULL",
            em[eC.COERCEPLAIN] +
              `(?:${em[eC.PRERELEASE]})?` +
              `(?:${em[eC.BUILD]})?` +
              "(?:$|[^\\d])",
          ),
          createToken("COERCERTL", em[eC.COERCE], !0),
          createToken("COERCERTLFULL", em[eC.COERCEFULL], !0),
          createToken("LONETILDE", "(?:~>?)"),
          createToken("TILDETRIM", `(\\s*)${em[eC.LONETILDE]}\\s+`, !0),
          (el.tildeTrimReplace = "$1~"),
          createToken("TILDE", `^${em[eC.LONETILDE]}${em[eC.XRANGEPLAIN]}$`),
          createToken(
            "TILDELOOSE",
            `^${em[eC.LONETILDE]}${em[eC.XRANGEPLAINLOOSE]}$`,
          ),
          createToken("LONECARET", "(?:\\^)"),
          createToken("CARETTRIM", `(\\s*)${em[eC.LONECARET]}\\s+`, !0),
          (el.caretTrimReplace = "$1^"),
          createToken("CARET", `^${em[eC.LONECARET]}${em[eC.XRANGEPLAIN]}$`),
          createToken(
            "CARETLOOSE",
            `^${em[eC.LONECARET]}${em[eC.XRANGEPLAINLOOSE]}$`,
          ),
          createToken(
            "COMPARATORLOOSE",
            `^${em[eC.GTLT]}\\s*(${em[eC.LOOSEPLAIN]})$|^$`,
          ),
          createToken(
            "COMPARATOR",
            `^${em[eC.GTLT]}\\s*(${em[eC.FULLPLAIN]})$|^$`,
          ),
          createToken(
            "COMPARATORTRIM",
            `(\\s*)${em[eC.GTLT]}\\s*(${em[eC.LOOSEPLAIN]}|${em[eC.XRANGEPLAIN]})`,
            !0,
          ),
          (el.comparatorTrimReplace = "$1$2$3"),
          createToken(
            "HYPHENRANGE",
            `^\\s*(${em[eC.XRANGEPLAIN]})\\s+-\\s+(${em[eC.XRANGEPLAIN]})\\s*$`,
          ),
          createToken(
            "HYPHENRANGELOOSE",
            `^\\s*(${em[eC.XRANGEPLAINLOOSE]})\\s+-\\s+(${em[eC.XRANGEPLAINLOOSE]})\\s*$`,
          ),
          createToken("STAR", "(<|>)?=?\\s*\\*"),
          createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"),
          createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$"));
      },
      16874(eA) {
        "use strict";
        eA.exports = {
          MAX_LENGTH: 256,
          MAX_SAFE_COMPONENT_LENGTH: 16,
          MAX_SAFE_BUILD_LENGTH: 250,
          MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER || 0x1fffffffffffff,
          RELEASE_TYPES: [
            "major",
            "premajor",
            "minor",
            "preminor",
            "patch",
            "prepatch",
            "prerelease",
          ],
          SEMVER_SPEC_VERSION: "2.0.0",
          FLAG_INCLUDE_PRERELEASE: 1,
          FLAG_LOOSE: 2,
        };
      },
      53908(eA, el, ec) {
        "use strict";
        let eu = ec(57272),
          { MAX_LENGTH: ed, MAX_SAFE_INTEGER: ep } = ec(16874),
          { safeRe: eg, t: eh } = ec(99718),
          ef = ec(98587),
          { compareIdentifiers: em } = ec(61123);
        let SemVer = class SemVer {
          constructor(eA, el) {
            if (((el = ef(el)), eA instanceof SemVer))
              if (
                !!el.loose === eA.loose &&
                !!el.includePrerelease === eA.includePrerelease
              )
                return eA;
              else eA = eA.version;
            else if ("string" != typeof eA)
              throw TypeError(
                `Invalid version. Must be a string. Got type "${typeof eA}".`,
              );
            if (eA.length > ed)
              throw TypeError(`version is longer than ${ed} characters`);
            (eu("SemVer", eA, el),
              (this.options = el),
              (this.loose = !!el.loose),
              (this.includePrerelease = !!el.includePrerelease));
            const ec = eA.trim().match(el.loose ? eg[eh.LOOSE] : eg[eh.FULL]);
            if (!ec) throw TypeError(`Invalid Version: ${eA}`);
            if (
              ((this.raw = eA),
              (this.major = +ec[1]),
              (this.minor = +ec[2]),
              (this.patch = +ec[3]),
              this.major > ep || this.major < 0)
            )
              throw TypeError("Invalid major version");
            if (this.minor > ep || this.minor < 0)
              throw TypeError("Invalid minor version");
            if (this.patch > ep || this.patch < 0)
              throw TypeError("Invalid patch version");
            (ec[4]
              ? (this.prerelease = ec[4].split(".").map((eA) => {
                  if (/^[0-9]+$/.test(eA)) {
                    let el = +eA;
                    if (el >= 0 && el < ep) return el;
                  }
                  return eA;
                }))
              : (this.prerelease = []),
              (this.build = ec[5] ? ec[5].split(".") : []),
              this.format());
          }
          format() {
            return (
              (this.version = `${this.major}.${this.minor}.${this.patch}`),
              this.prerelease.length &&
                (this.version += `-${this.prerelease.join(".")}`),
              this.version
            );
          }
          toString() {
            return this.version;
          }
          compare(eA) {
            if (
              (eu("SemVer.compare", this.version, this.options, eA),
              !(eA instanceof SemVer))
            ) {
              if ("string" == typeof eA && eA === this.version) return 0;
              eA = new SemVer(eA, this.options);
            }
            return eA.version === this.version
              ? 0
              : this.compareMain(eA) || this.comparePre(eA);
          }
          compareMain(eA) {
            return (
              eA instanceof SemVer || (eA = new SemVer(eA, this.options)),
              em(this.major, eA.major) ||
                em(this.minor, eA.minor) ||
                em(this.patch, eA.patch)
            );
          }
          comparePre(eA) {
            if (
              (eA instanceof SemVer || (eA = new SemVer(eA, this.options)),
              this.prerelease.length && !eA.prerelease.length)
            )
              return -1;
            if (!this.prerelease.length && eA.prerelease.length) return 1;
            if (!this.prerelease.length && !eA.prerelease.length) return 0;
            let el = 0;
            do {
              let ec = this.prerelease[el],
                ed = eA.prerelease[el];
              if (
                (eu("prerelease compare", el, ec, ed),
                void 0 === ec && void 0 === ed)
              )
                return 0;
              if (void 0 === ed) return 1;
              if (void 0 === ec) return -1;
              else if (ec === ed) continue;
              else return em(ec, ed);
            } while (++el);
          }
          compareBuild(eA) {
            eA instanceof SemVer || (eA = new SemVer(eA, this.options));
            let el = 0;
            do {
              let ec = this.build[el],
                ed = eA.build[el];
              if (
                (eu("build compare", el, ec, ed),
                void 0 === ec && void 0 === ed)
              )
                return 0;
              if (void 0 === ed) return 1;
              if (void 0 === ec) return -1;
              else if (ec === ed) continue;
              else return em(ec, ed);
            } while (++el);
          }
          inc(eA, el, ec) {
            if (eA.startsWith("pre")) {
              if (!el && !1 === ec)
                throw Error("invalid increment argument: identifier is empty");
              if (el) {
                let eA = `-${el}`.match(
                  this.options.loose
                    ? eg[eh.PRERELEASELOOSE]
                    : eg[eh.PRERELEASE],
                );
                if (!eA || eA[1] !== el)
                  throw Error(`invalid identifier: ${el}`);
              }
            }
            switch (eA) {
              case "premajor":
                ((this.prerelease.length = 0),
                  (this.patch = 0),
                  (this.minor = 0),
                  this.major++,
                  this.inc("pre", el, ec));
                break;
              case "preminor":
                ((this.prerelease.length = 0),
                  (this.patch = 0),
                  this.minor++,
                  this.inc("pre", el, ec));
                break;
              case "prepatch":
                ((this.prerelease.length = 0),
                  this.inc("patch", el, ec),
                  this.inc("pre", el, ec));
                break;
              case "prerelease":
                (0 === this.prerelease.length && this.inc("patch", el, ec),
                  this.inc("pre", el, ec));
                break;
              case "release":
                if (0 === this.prerelease.length)
                  throw Error(`version ${this.raw} is not a prerelease`);
                this.prerelease.length = 0;
                break;
              case "major":
                ((0 !== this.minor ||
                  0 !== this.patch ||
                  0 === this.prerelease.length) &&
                  this.major++,
                  (this.minor = 0),
                  (this.patch = 0),
                  (this.prerelease = []));
                break;
              case "minor":
                ((0 !== this.patch || 0 === this.prerelease.length) &&
                  this.minor++,
                  (this.patch = 0),
                  (this.prerelease = []));
                break;
              case "patch":
                (0 === this.prerelease.length && this.patch++,
                  (this.prerelease = []));
                break;
              case "pre": {
                let eA = +!!Number(ec);
                if (0 === this.prerelease.length) this.prerelease = [eA];
                else {
                  let eu = this.prerelease.length;
                  for (; --eu >= 0; )
                    "number" == typeof this.prerelease[eu] &&
                      (this.prerelease[eu]++, (eu = -2));
                  if (-1 === eu) {
                    if (el === this.prerelease.join(".") && !1 === ec)
                      throw Error(
                        "invalid increment argument: identifier already exists",
                      );
                    this.prerelease.push(eA);
                  }
                }
                if (el) {
                  let eu = [el, eA];
                  (!1 === ec && (eu = [el]),
                    0 === em(this.prerelease[0], el)
                      ? isNaN(this.prerelease[1]) && (this.prerelease = eu)
                      : (this.prerelease = eu));
                }
                break;
              }
              default:
                throw Error(`invalid increment argument: ${eA}`);
            }
            return (
              (this.raw = this.format()),
              this.build.length && (this.raw += `+${this.build.join(".")}`),
              this
            );
          }
        };
        eA.exports = SemVer;
      },
      61123(eA) {
        "use strict";
        let el = /^[0-9]+$/,
          compareIdentifiers = (eA, ec) => {
            let eu = el.test(eA),
              ed = el.test(ec);
            return (
              eu && ed && ((eA *= 1), (ec *= 1)),
              eA === ec ? 0 : eu && !ed ? -1 : ed && !eu ? 1 : eA < ec ? -1 : 1
            );
          },
          rcompareIdentifiers = (eA, el) => compareIdentifiers(el, eA);
        eA.exports = { compareIdentifiers, rcompareIdentifiers };
      },
      30144(eA, el, ec) {
        "use strict";
        let eu = ec(53908);
        eA.exports = (eA, el, ec = !1) => {
          if (eA instanceof eu) return eA;
          try {
            return new eu(eA, el);
          } catch (eA) {
            if (!ec) return null;
            throw eA;
          }
        };
      },
      56953(eA, el, ec) {
        "use strict";
        let eu = ec(30144);
        eA.exports = (eA, el) => {
          let ec = eu(eA, el);
          return ec ? ec.version : null;
        };
      },
      57414(eA, el, ec) {
        "use strict";
        let eu = ec(30144);
        eA.exports = (eA, el) => {
          let ec = eu(eA.trim().replace(/^[=v]+/, ""), el);
          return ec ? ec.version : null;
        };
      },
      93007(eA, el, ec) {
        "use strict";
        let eu = ec(53908);
        eA.exports = (eA, el, ec, ed, ep) => {
          "string" == typeof ec && ((ep = ed), (ed = ec), (ec = void 0));
          try {
            return new eu(eA instanceof eu ? eA.version : eA, ec).inc(
              el,
              ed,
              ep,
            ).version;
          } catch (eA) {
            return null;
          }
        };
      },
      51832(eA, el, ec) {
        "use strict";
        let eu = ec(30144);
        eA.exports = (eA, el) => {
          let ec = eu(eA, null, !0),
            ed = eu(el, null, !0),
            ep = ec.compare(ed);
          if (0 === ep) return null;
          let eg = ep > 0,
            eh = eg ? ec : ed,
            ef = eg ? ed : ec,
            em = !!eh.prerelease.length;
          if (ef.prerelease.length && !em) {
            if (!ef.patch && !ef.minor) return "major";
            if (0 === ef.compareMain(eh))
              return ef.minor && !ef.patch ? "minor" : "patch";
          }
          let eE = em ? "pre" : "";
          return ec.major !== ed.major
            ? eE + "major"
            : ec.minor !== ed.minor
              ? eE + "minor"
              : ec.patch !== ed.patch
                ? eE + "patch"
                : "prerelease";
        };
      },
      32938(eA, el, ec) {
        "use strict";
        let eu = ec(53908);
        eA.exports = (eA, el) => new eu(eA, el).major;
      },
      46254(eA, el, ec) {
        "use strict";
        let eu = ec(53908);
        eA.exports = (eA, el) => new eu(eA, el).minor;
      },
      24493(eA, el, ec) {
        "use strict";
        let eu = ec(53908);
        eA.exports = (eA, el) => new eu(eA, el).patch;
      },
      31729(eA, el, ec) {
        "use strict";
        let eu = ec(30144);
        eA.exports = (eA, el) => {
          let ec = eu(eA, el);
          return ec && ec.prerelease.length ? ec.prerelease : null;
        };
      },
      50560(eA, el, ec) {
        "use strict";
        let eu = ec(53908);
        eA.exports = (eA, el, ec) => new eu(eA, ec).compare(new eu(el, ec));
      },
      9970(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el, ec) => eu(el, eA, ec);
      },
      11763(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el) => eu(eA, el, !0);
      },
      40909(eA, el, ec) {
        "use strict";
        let eu = ec(53908);
        eA.exports = (eA, el, ec) => {
          let ed = new eu(eA, ec),
            ep = new eu(el, ec);
          return ed.compare(ep) || ed.compareBuild(ep);
        };
      },
      43927(eA, el, ec) {
        "use strict";
        let eu = ec(40909);
        eA.exports = (eA, el) => eA.sort((eA, ec) => eu(eA, ec, el));
      },
      74277(eA, el, ec) {
        "use strict";
        let eu = ec(40909);
        eA.exports = (eA, el) => eA.sort((eA, ec) => eu(ec, eA, el));
      },
      35580(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el, ec) => eu(eA, el, ec) > 0;
      },
      7059(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el, ec) => 0 > eu(eA, el, ec);
      },
      94641(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el, ec) => 0 === eu(eA, el, ec);
      },
      13999(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el, ec) => 0 !== eu(eA, el, ec);
      },
      54089(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el, ec) => eu(eA, el, ec) >= 0;
      },
      25200(eA, el, ec) {
        "use strict";
        let eu = ec(50560);
        eA.exports = (eA, el, ec) => 0 >= eu(eA, el, ec);
      },
      72111(eA, el, ec) {
        "use strict";
        let eu = ec(94641),
          ed = ec(13999),
          ep = ec(35580),
          eg = ec(54089),
          eh = ec(7059),
          ef = ec(25200);
        eA.exports = (eA, el, ec, em) => {
          switch (el) {
            case "===":
              return (
                "object" == typeof eA && (eA = eA.version),
                "object" == typeof ec && (ec = ec.version),
                eA === ec
              );
            case "!==":
              return (
                "object" == typeof eA && (eA = eA.version),
                "object" == typeof ec && (ec = ec.version),
                eA !== ec
              );
            case "":
            case "=":
            case "==":
              return eu(eA, ec, em);
            case "!=":
              return ed(eA, ec, em);
            case ">":
              return ep(eA, ec, em);
            case ">=":
              return eg(eA, ec, em);
            case "<":
              return eh(eA, ec, em);
            case "<=":
              return ef(eA, ec, em);
            default:
              throw TypeError(`Invalid operator: ${el}`);
          }
        };
      },
      46170(eA, el, ec) {
        "use strict";
        let eu = ec(53908),
          ed = ec(30144),
          { safeRe: ep, t: eg } = ec(99718);
        eA.exports = (eA, el) => {
          if (eA instanceof eu) return eA;
          if (
            ("number" == typeof eA && (eA = String(eA)), "string" != typeof eA)
          )
            return null;
          let ec = null;
          if ((el = el || {}).rtl) {
            let eu,
              ed = el.includePrerelease
                ? ep[eg.COERCERTLFULL]
                : ep[eg.COERCERTL];
            for (
              ;
              (eu = ed.exec(eA)) &&
              (!ec || ec.index + ec[0].length !== eA.length);

            )
              ((ec && eu.index + eu[0].length === ec.index + ec[0].length) ||
                (ec = eu),
                (ed.lastIndex = eu.index + eu[1].length + eu[2].length));
            ed.lastIndex = -1;
          } else
            ec = eA.match(
              el.includePrerelease ? ep[eg.COERCEFULL] : ep[eg.COERCE],
            );
          if (null === ec) return null;
          let eh = ec[2],
            ef = ec[3] || "0",
            em = ec[4] || "0",
            eE = el.includePrerelease && ec[5] ? `-${ec[5]}` : "",
            eC = el.includePrerelease && ec[6] ? `+${ec[6]}` : "";
          return ed(`${eh}.${ef}.${em}${eE}${eC}`, el);
        };
      },
      93904(eA, el, ec) {
        "use strict";
        let eu = Symbol("SemVer ANY");
        let Comparator = class Comparator {
          static get ANY() {
            return eu;
          }
          constructor(eA, el) {
            if (((el = ed(el)), eA instanceof Comparator))
              if (!!el.loose === eA.loose) return eA;
              else eA = eA.value;
            (ef("comparator", (eA = eA.trim().split(/\s+/).join(" ")), el),
              (this.options = el),
              (this.loose = !!el.loose),
              this.parse(eA),
              this.semver === eu
                ? (this.value = "")
                : (this.value = this.operator + this.semver.version),
              ef("comp", this));
          }
          parse(eA) {
            let el = this.options.loose
                ? ep[eg.COMPARATORLOOSE]
                : ep[eg.COMPARATOR],
              ec = eA.match(el);
            if (!ec) throw TypeError(`Invalid comparator: ${eA}`);
            ((this.operator = void 0 !== ec[1] ? ec[1] : ""),
              "=" === this.operator && (this.operator = ""),
              ec[2]
                ? (this.semver = new em(ec[2], this.options.loose))
                : (this.semver = eu));
          }
          toString() {
            return this.value;
          }
          test(eA) {
            if (
              (ef("Comparator.test", eA, this.options.loose),
              this.semver === eu || eA === eu)
            )
              return !0;
            if ("string" == typeof eA)
              try {
                eA = new em(eA, this.options);
              } catch (eA) {
                return !1;
              }
            return eh(eA, this.operator, this.semver, this.options);
          }
          intersects(eA, el) {
            if (!(eA instanceof Comparator))
              throw TypeError("a Comparator is required");
            return "" === this.operator
              ? "" === this.value || new eE(eA.value, el).test(this.value)
              : "" === eA.operator
                ? "" === eA.value || new eE(this.value, el).test(eA.semver)
                : !(
                    ((el = ed(el)).includePrerelease &&
                      ("<0.0.0-0" === this.value || "<0.0.0-0" === eA.value)) ||
                    (!el.includePrerelease &&
                      (this.value.startsWith("<0.0.0") ||
                        eA.value.startsWith("<0.0.0")))
                  ) &&
                  !!(
                    (this.operator.startsWith(">") &&
                      eA.operator.startsWith(">")) ||
                    (this.operator.startsWith("<") &&
                      eA.operator.startsWith("<")) ||
                    (this.semver.version === eA.semver.version &&
                      this.operator.includes("=") &&
                      eA.operator.includes("=")) ||
                    (eh(this.semver, "<", eA.semver, el) &&
                      this.operator.startsWith(">") &&
                      eA.operator.startsWith("<")) ||
                    (eh(this.semver, ">", eA.semver, el) &&
                      this.operator.startsWith("<") &&
                      eA.operator.startsWith(">"))
                  );
          }
        };
        eA.exports = Comparator;
        let ed = ec(98587),
          { safeRe: ep, t: eg } = ec(99718),
          eh = ec(72111),
          ef = ec(57272),
          em = ec(53908),
          eE = ec(78311);
      },
      78311(eA, el, ec) {
        "use strict";
        let eu = /\s+/g;
        let Range = class Range {
          constructor(eA, el) {
            if (((el = ep(el)), eA instanceof Range))
              if (
                !!el.loose === eA.loose &&
                !!el.includePrerelease === eA.includePrerelease
              )
                return eA;
              else return new Range(eA.raw, el);
            if (eA instanceof eg)
              return (
                (this.raw = eA.value),
                (this.set = [[eA]]),
                (this.formatted = void 0),
                this
              );
            if (
              ((this.options = el),
              (this.loose = !!el.loose),
              (this.includePrerelease = !!el.includePrerelease),
              (this.raw = eA.trim().replace(eu, " ")),
              (this.set = this.raw
                .split("||")
                .map((eA) => this.parseRange(eA.trim()))
                .filter((eA) => eA.length)),
              !this.set.length)
            )
              throw TypeError(`Invalid SemVer Range: ${this.raw}`);
            if (this.set.length > 1) {
              const eA = this.set[0];
              if (
                ((this.set = this.set.filter((eA) => !isNullSet(eA[0]))),
                0 === this.set.length)
              )
                this.set = [eA];
              else if (this.set.length > 1) {
                for (const eA of this.set)
                  if (1 === eA.length && isAny(eA[0])) {
                    this.set = [eA];
                    break;
                  }
              }
            }
            this.formatted = void 0;
          }
          get range() {
            if (void 0 === this.formatted) {
              this.formatted = "";
              for (let eA = 0; eA < this.set.length; eA++) {
                eA > 0 && (this.formatted += "||");
                let el = this.set[eA];
                for (let eA = 0; eA < el.length; eA++)
                  (eA > 0 && (this.formatted += " "),
                    (this.formatted += el[eA].toString().trim()));
              }
            }
            return this.formatted;
          }
          format() {
            return this.range;
          }
          toString() {
            return this.range;
          }
          parseRange(eA) {
            let el =
                ((this.options.includePrerelease && eB) |
                  (this.options.loose && e_)) +
                ":" +
                eA,
              ec = ed.get(el);
            if (ec) return ec;
            let eu = this.options.loose,
              ep = eu ? em[eE.HYPHENRANGELOOSE] : em[eE.HYPHENRANGE];
            (eh(
              "hyphen replace",
              (eA = eA.replace(
                ep,
                hyphenReplace(this.options.includePrerelease),
              )),
            ),
              eh(
                "comparator trim",
                (eA = eA.replace(em[eE.COMPARATORTRIM], eC)),
              ),
              eh("tilde trim", (eA = eA.replace(em[eE.TILDETRIM], ey))),
              eh("caret trim", (eA = eA.replace(em[eE.CARETTRIM], ew))));
            let ef = eA
              .split(" ")
              .map((eA) => parseComparator(eA, this.options))
              .join(" ")
              .split(/\s+/)
              .map((eA) => replaceGTE0(eA, this.options));
            (eu &&
              (ef = ef.filter(
                (eA) => (
                  eh("loose invalid filter", eA, this.options),
                  !!eA.match(em[eE.COMPARATORLOOSE])
                ),
              )),
              eh("range list", ef));
            let eI = new Map();
            for (let eA of ef.map((eA) => new eg(eA, this.options))) {
              if (isNullSet(eA)) return [eA];
              eI.set(eA.value, eA);
            }
            eI.size > 1 && eI.has("") && eI.delete("");
            let ev = [...eI.values()];
            return (ed.set(el, ev), ev);
          }
          intersects(eA, el) {
            if (!(eA instanceof Range)) throw TypeError("a Range is required");
            return this.set.some(
              (ec) =>
                isSatisfiable(ec, el) &&
                eA.set.some(
                  (eA) =>
                    isSatisfiable(eA, el) &&
                    ec.every((ec) => eA.every((eA) => ec.intersects(eA, el))),
                ),
            );
          }
          test(eA) {
            if (!eA) return !1;
            if ("string" == typeof eA)
              try {
                eA = new ef(eA, this.options);
              } catch (eA) {
                return !1;
              }
            for (let el = 0; el < this.set.length; el++)
              if (testSet(this.set[el], eA, this.options)) return !0;
            return !1;
          }
        };
        eA.exports = Range;
        let ed = new (ec(68794))(),
          ep = ec(98587),
          eg = ec(93904),
          eh = ec(57272),
          ef = ec(53908),
          {
            safeRe: em,
            t: eE,
            comparatorTrimReplace: eC,
            tildeTrimReplace: ey,
            caretTrimReplace: ew,
          } = ec(99718),
          { FLAG_INCLUDE_PRERELEASE: eB, FLAG_LOOSE: e_ } = ec(16874),
          isNullSet = (eA) => "<0.0.0-0" === eA.value,
          isAny = (eA) => "" === eA.value,
          isSatisfiable = (eA, el) => {
            let ec = !0,
              eu = eA.slice(),
              ed = eu.pop();
            for (; ec && eu.length; )
              ((ec = eu.every((eA) => ed.intersects(eA, el))), (ed = eu.pop()));
            return ec;
          },
          parseComparator = (eA, el) => (
            eh("comp", eA, el),
            eh("caret", (eA = replaceCarets(eA, el))),
            eh("tildes", (eA = replaceTildes(eA, el))),
            eh("xrange", (eA = replaceXRanges(eA, el))),
            eh("stars", (eA = replaceStars(eA, el))),
            eA
          ),
          isX = (eA) => !eA || "x" === eA.toLowerCase() || "*" === eA,
          replaceTildes = (eA, el) =>
            eA
              .trim()
              .split(/\s+/)
              .map((eA) => replaceTilde(eA, el))
              .join(" "),
          replaceTilde = (eA, el) => {
            let ec = el.loose ? em[eE.TILDELOOSE] : em[eE.TILDE];
            return eA.replace(ec, (el, ec, eu, ed, ep) => {
              let eg;
              return (
                eh("tilde", eA, el, ec, eu, ed, ep),
                isX(ec)
                  ? (eg = "")
                  : isX(eu)
                    ? (eg = `>=${ec}.0.0 <${+ec + 1}.0.0-0`)
                    : isX(ed)
                      ? (eg = `>=${ec}.${eu}.0 <${ec}.${+eu + 1}.0-0`)
                      : ep
                        ? (eh("replaceTilde pr", ep),
                          (eg = `>=${ec}.${eu}.${ed}-${ep} <${ec}.${+eu + 1}.0-0`))
                        : (eg = `>=${ec}.${eu}.${ed} <${ec}.${+eu + 1}.0-0`),
                eh("tilde return", eg),
                eg
              );
            });
          },
          replaceCarets = (eA, el) =>
            eA
              .trim()
              .split(/\s+/)
              .map((eA) => replaceCaret(eA, el))
              .join(" "),
          replaceCaret = (eA, el) => {
            eh("caret", eA, el);
            let ec = el.loose ? em[eE.CARETLOOSE] : em[eE.CARET],
              eu = el.includePrerelease ? "-0" : "";
            return eA.replace(ec, (el, ec, ed, ep, eg) => {
              let ef;
              return (
                eh("caret", eA, el, ec, ed, ep, eg),
                isX(ec)
                  ? (ef = "")
                  : isX(ed)
                    ? (ef = `>=${ec}.0.0${eu} <${+ec + 1}.0.0-0`)
                    : isX(ep)
                      ? (ef =
                          "0" === ec
                            ? `>=${ec}.${ed}.0${eu} <${ec}.${+ed + 1}.0-0`
                            : `>=${ec}.${ed}.0${eu} <${+ec + 1}.0.0-0`)
                      : eg
                        ? (eh("replaceCaret pr", eg),
                          (ef =
                            "0" === ec
                              ? "0" === ed
                                ? `>=${ec}.${ed}.${ep}-${eg} <${ec}.${ed}.${+ep + 1}-0`
                                : `>=${ec}.${ed}.${ep}-${eg} <${ec}.${+ed + 1}.0-0`
                              : `>=${ec}.${ed}.${ep}-${eg} <${+ec + 1}.0.0-0`))
                        : (eh("no pr"),
                          (ef =
                            "0" === ec
                              ? "0" === ed
                                ? `>=${ec}.${ed}.${ep}${eu} <${ec}.${ed}.${+ep + 1}-0`
                                : `>=${ec}.${ed}.${ep}${eu} <${ec}.${+ed + 1}.0-0`
                              : `>=${ec}.${ed}.${ep} <${+ec + 1}.0.0-0`)),
                eh("caret return", ef),
                ef
              );
            });
          },
          replaceXRanges = (eA, el) => (
            eh("replaceXRanges", eA, el),
            eA
              .split(/\s+/)
              .map((eA) => replaceXRange(eA, el))
              .join(" ")
          ),
          replaceXRange = (eA, el) => {
            eA = eA.trim();
            let ec = el.loose ? em[eE.XRANGELOOSE] : em[eE.XRANGE];
            return eA.replace(ec, (ec, eu, ed, ep, eg, ef) => {
              eh("xRange", eA, ec, eu, ed, ep, eg, ef);
              let em = isX(ed),
                eE = em || isX(ep),
                eC = eE || isX(eg),
                ey = eC;
              return (
                "=" === eu && ey && (eu = ""),
                (ef = el.includePrerelease ? "-0" : ""),
                em
                  ? (ec = ">" === eu || "<" === eu ? "<0.0.0-0" : "*")
                  : eu && ey
                    ? (eE && (ep = 0),
                      (eg = 0),
                      ">" === eu
                        ? ((eu = ">="),
                          eE ? ((ed = +ed + 1), (ep = 0)) : (ep = +ep + 1),
                          (eg = 0))
                        : "<=" === eu &&
                          ((eu = "<"), eE ? (ed = +ed + 1) : (ep = +ep + 1)),
                      "<" === eu && (ef = "-0"),
                      (ec = `${eu + ed}.${ep}.${eg}${ef}`))
                    : eE
                      ? (ec = `>=${ed}.0.0${ef} <${+ed + 1}.0.0-0`)
                      : eC &&
                        (ec = `>=${ed}.${ep}.0${ef} <${ed}.${+ep + 1}.0-0`),
                eh("xRange return", ec),
                ec
              );
            });
          },
          replaceStars = (eA, el) => (
            eh("replaceStars", eA, el),
            eA.trim().replace(em[eE.STAR], "")
          ),
          replaceGTE0 = (eA, el) => (
            eh("replaceGTE0", eA, el),
            eA
              .trim()
              .replace(em[el.includePrerelease ? eE.GTE0PRE : eE.GTE0], "")
          ),
          hyphenReplace =
            (eA) => (el, ec, eu, ed, ep, eg, eh, ef, em, eE, eC, ey) => (
              (ec = isX(eu)
                ? ""
                : isX(ed)
                  ? `>=${eu}.0.0${eA ? "-0" : ""}`
                  : isX(ep)
                    ? `>=${eu}.${ed}.0${eA ? "-0" : ""}`
                    : eg
                      ? `>=${ec}`
                      : `>=${ec}${eA ? "-0" : ""}`),
              (ef = isX(em)
                ? ""
                : isX(eE)
                  ? `<${+em + 1}.0.0-0`
                  : isX(eC)
                    ? `<${em}.${+eE + 1}.0-0`
                    : ey
                      ? `<=${em}.${eE}.${eC}-${ey}`
                      : eA
                        ? `<${em}.${eE}.${+eC + 1}-0`
                        : `<=${ef}`),
              `${ec} ${ef}`.trim()
            ),
          testSet = (eA, el, ec) => {
            for (let ec = 0; ec < eA.length; ec++)
              if (!eA[ec].test(el)) return !1;
            if (el.prerelease.length && !ec.includePrerelease) {
              for (let ec = 0; ec < eA.length; ec++)
                if (
                  (eh(eA[ec].semver),
                  eA[ec].semver !== eg.ANY &&
                    eA[ec].semver.prerelease.length > 0)
                ) {
                  let eu = eA[ec].semver;
                  if (
                    eu.major === el.major &&
                    eu.minor === el.minor &&
                    eu.patch === el.patch
                  )
                    return !0;
                }
              return !1;
            }
            return !0;
          };
      },
      97638(eA, el, ec) {
        "use strict";
        let eu = ec(78311);
        eA.exports = (eA, el, ec) => {
          try {
            el = new eu(el, ec);
          } catch (eA) {
            return !1;
          }
          return el.test(eA);
        };
      },
      77631(eA, el, ec) {
        "use strict";
        let eu = ec(78311);
        eA.exports = (eA, el) =>
          new eu(eA, el).set.map((eA) =>
            eA
              .map((eA) => eA.value)
              .join(" ")
              .trim()
              .split(" "),
          );
      },
      19628(eA, el, ec) {
        "use strict";
        let eu = ec(53908),
          ed = ec(78311);
        eA.exports = (eA, el, ec) => {
          let ep = null,
            eg = null,
            eh = null;
          try {
            eh = new ed(el, ec);
          } catch (eA) {
            return null;
          }
          return (
            eA.forEach((eA) => {
              eh.test(eA) &&
                (!ep || -1 === eg.compare(eA)) &&
                (eg = new eu((ep = eA), ec));
            }),
            ep
          );
        };
      },
      270(eA, el, ec) {
        "use strict";
        let eu = ec(53908),
          ed = ec(78311);
        eA.exports = (eA, el, ec) => {
          let ep = null,
            eg = null,
            eh = null;
          try {
            eh = new ed(el, ec);
          } catch (eA) {
            return null;
          }
          return (
            eA.forEach((eA) => {
              eh.test(eA) &&
                (!ep || 1 === eg.compare(eA)) &&
                (eg = new eu((ep = eA), ec));
            }),
            ep
          );
        };
      },
      41261(eA, el, ec) {
        "use strict";
        let eu = ec(53908),
          ed = ec(78311),
          ep = ec(35580);
        eA.exports = (eA, el) => {
          eA = new ed(eA, el);
          let ec = new eu("0.0.0");
          if (eA.test(ec) || ((ec = new eu("0.0.0-0")), eA.test(ec))) return ec;
          ec = null;
          for (let el = 0; el < eA.set.length; ++el) {
            let ed = eA.set[el],
              eg = null;
            (ed.forEach((eA) => {
              let el = new eu(eA.semver.version);
              switch (eA.operator) {
                case ">":
                  (0 === el.prerelease.length
                    ? el.patch++
                    : el.prerelease.push(0),
                    (el.raw = el.format()));
                case "":
                case ">=":
                  (!eg || ep(el, eg)) && (eg = el);
                  break;
                case "<":
                case "<=":
                  break;
                default:
                  throw Error(`Unexpected operation: ${eA.operator}`);
              }
            }),
              eg && (!ec || ep(ec, eg)) && (ec = eg));
          }
          return ec && eA.test(ec) ? ec : null;
        };
      },
      13874(eA, el, ec) {
        "use strict";
        let eu = ec(78311);
        eA.exports = (eA, el) => {
          try {
            return new eu(eA, el).range || "*";
          } catch (eA) {
            return null;
          }
        };
      },
      97075(eA, el, ec) {
        "use strict";
        let eu = ec(53908),
          ed = ec(93904),
          { ANY: ep } = ed,
          eg = ec(78311),
          eh = ec(97638),
          ef = ec(35580),
          em = ec(7059),
          eE = ec(25200),
          eC = ec(54089);
        eA.exports = (eA, el, ec, ey) => {
          let ew, eB, e_, eI, ev;
          switch (((eA = new eu(eA, ey)), (el = new eg(el, ey)), ec)) {
            case ">":
              ((ew = ef), (eB = eE), (e_ = em), (eI = ">"), (ev = ">="));
              break;
            case "<":
              ((ew = em), (eB = eC), (e_ = ef), (eI = "<"), (ev = "<="));
              break;
            default:
              throw TypeError('Must provide a hilo val of "<" or ">"');
          }
          if (eh(eA, el, ey)) return !1;
          for (let ec = 0; ec < el.set.length; ++ec) {
            let eu = el.set[ec],
              eg = null,
              eh = null;
            if (
              (eu.forEach((eA) => {
                (eA.semver === ep && (eA = new ed(">=0.0.0")),
                  (eg = eg || eA),
                  (eh = eh || eA),
                  ew(eA.semver, eg.semver, ey)
                    ? (eg = eA)
                    : e_(eA.semver, eh.semver, ey) && (eh = eA));
              }),
              eg.operator === eI ||
                eg.operator === ev ||
                ((!eh.operator || eh.operator === eI) && eB(eA, eh.semver)) ||
                (eh.operator === ev && e_(eA, eh.semver)))
            )
              return !1;
          }
          return !0;
        };
      },
      75571(eA, el, ec) {
        "use strict";
        let eu = ec(97075);
        eA.exports = (eA, el, ec) => eu(eA, el, ">", ec);
      },
      5342(eA, el, ec) {
        "use strict";
        let eu = ec(97075);
        eA.exports = (eA, el, ec) => eu(eA, el, "<", ec);
      },
      76780(eA, el, ec) {
        "use strict";
        let eu = ec(78311);
        eA.exports = (eA, el, ec) => (
          (eA = new eu(eA, ec)),
          (el = new eu(el, ec)),
          eA.intersects(el, ec)
        );
      },
      72525(eA, el, ec) {
        "use strict";
        let eu = ec(97638),
          ed = ec(50560);
        eA.exports = (eA, el, ec) => {
          let ep = [],
            eg = null,
            eh = null,
            ef = eA.sort((eA, el) => ed(eA, el, ec));
          for (let eA of ef)
            eu(eA, el, ec)
              ? ((eh = eA), eg || (eg = eA))
              : (eh && ep.push([eg, eh]), (eh = null), (eg = null));
          eg && ep.push([eg, null]);
          let em = [];
          for (let [eA, el] of ep)
            eA === el
              ? em.push(eA)
              : el || eA !== ef[0]
                ? el
                  ? eA === ef[0]
                    ? em.push(`<=${el}`)
                    : em.push(`${eA} - ${el}`)
                  : em.push(`>=${eA}`)
                : em.push("*");
          let eE = em.join(" || "),
            eC = "string" == typeof el.raw ? el.raw : String(el);
          return eE.length < eC.length ? eE : el;
        };
      },
      75032(eA, el, ec) {
        "use strict";
        let eu = ec(78311),
          ed = ec(93904),
          { ANY: ep } = ed,
          eg = ec(97638),
          eh = ec(50560),
          subset = (eA, el, ec = {}) => {
            if (eA === el) return !0;
            ((eA = new eu(eA, ec)), (el = new eu(el, ec)));
            let ed = !1;
            R: for (let eu of eA.set) {
              for (let eA of el.set) {
                let el = simpleSubset(eu, eA, ec);
                if (((ed = ed || null !== el), el)) continue R;
              }
              if (ed) return !1;
            }
            return !0;
          },
          ef = [new ed(">=0.0.0-0")],
          em = [new ed(">=0.0.0")],
          simpleSubset = (eA, el, ec) => {
            let eu, ed, eE, eC, ey, ew, eB;
            if (eA === el) return !0;
            if (1 === eA.length && eA[0].semver === ep)
              if (1 === el.length && el[0].semver === ep) return !0;
              else eA = ec.includePrerelease ? ef : em;
            if (1 === el.length && el[0].semver === ep)
              if (ec.includePrerelease) return !0;
              else el = em;
            let e_ = new Set();
            for (let el of eA)
              ">" === el.operator || ">=" === el.operator
                ? (eu = higherGT(eu, el, ec))
                : "<" === el.operator || "<=" === el.operator
                  ? (ed = lowerLT(ed, el, ec))
                  : e_.add(el.semver);
            if (e_.size > 1) return null;
            if (
              eu &&
              ed &&
              ((eE = eh(eu.semver, ed.semver, ec)) > 0 ||
                (0 === eE && (">=" !== eu.operator || "<=" !== ed.operator)))
            )
              return null;
            for (let eA of e_) {
              if (
                (eu && !eg(eA, String(eu), ec)) ||
                (ed && !eg(eA, String(ed), ec))
              )
                return null;
              for (let eu of el) if (!eg(eA, String(eu), ec)) return !1;
              return !0;
            }
            let eI =
                !!ed &&
                !ec.includePrerelease &&
                !!ed.semver.prerelease.length &&
                ed.semver,
              ev =
                !!eu &&
                !ec.includePrerelease &&
                !!eu.semver.prerelease.length &&
                eu.semver;
            for (let eA of (eI &&
              1 === eI.prerelease.length &&
              "<" === ed.operator &&
              0 === eI.prerelease[0] &&
              (eI = !1),
            el)) {
              if (
                ((eB = eB || ">" === eA.operator || ">=" === eA.operator),
                (ew = ew || "<" === eA.operator || "<=" === eA.operator),
                eu)
              ) {
                if (
                  (ev &&
                    eA.semver.prerelease &&
                    eA.semver.prerelease.length &&
                    eA.semver.major === ev.major &&
                    eA.semver.minor === ev.minor &&
                    eA.semver.patch === ev.patch &&
                    (ev = !1),
                  ">" === eA.operator || ">=" === eA.operator)
                ) {
                  if ((eC = higherGT(eu, eA, ec)) === eA && eC !== eu)
                    return !1;
                } else if (
                  ">=" === eu.operator &&
                  !eg(eu.semver, String(eA), ec)
                )
                  return !1;
              }
              if (ed) {
                if (
                  (eI &&
                    eA.semver.prerelease &&
                    eA.semver.prerelease.length &&
                    eA.semver.major === eI.major &&
                    eA.semver.minor === eI.minor &&
                    eA.semver.patch === eI.patch &&
                    (eI = !1),
                  "<" === eA.operator || "<=" === eA.operator)
                ) {
                  if ((ey = lowerLT(ed, eA, ec)) === eA && ey !== ed) return !1;
                } else if (
                  "<=" === ed.operator &&
                  !eg(ed.semver, String(eA), ec)
                )
                  return !1;
              }
              if (!eA.operator && (ed || eu) && 0 !== eE) return !1;
            }
            return (
              (!eu || !ew || !!ed || 0 === eE) &&
              (!ed || !eB || !!eu || 0 === eE) &&
              !ev &&
              !eI &&
              !0
            );
          },
          higherGT = (eA, el, ec) => {
            if (!eA) return el;
            let eu = eh(eA.semver, el.semver, ec);
            return eu > 0
              ? eA
              : eu < 0 || (">" === el.operator && ">=" === eA.operator)
                ? el
                : eA;
          },
          lowerLT = (eA, el, ec) => {
            if (!eA) return el;
            let eu = eh(eA.semver, el.semver, ec);
            return eu < 0
              ? eA
              : eu > 0 || ("<" === el.operator && "<=" === eA.operator)
                ? el
                : eA;
          };
        eA.exports = subset;
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
      98882(eA, el, ec) {
        var eu = ec(79896),
          ed = ec(79424),
          ep = ec(16928),
          eg = ec(36571),
          eh = ec(11705),
          ef = ec(92182),
          em = ec(96233),
          eE =
            "win32" !== process.platform &&
            eu.realpath &&
            "function" == typeof eu.realpath.native
              ? eu.realpath.native
              : eu.realpath,
          eC = ed(),
          defaultPaths = function () {
            return [
              ep.join(eC, ".node_modules"),
              ep.join(eC, ".node_libraries"),
            ];
          },
          defaultIsFile = function (eA, el) {
            eu.stat(eA, function (eA, ec) {
              return eA
                ? "ENOENT" === eA.code || "ENOTDIR" === eA.code
                  ? el(null, !1)
                  : el(eA)
                : el(null, ec.isFile() || ec.isFIFO());
            });
          },
          defaultIsDir = function (eA, el) {
            eu.stat(eA, function (eA, ec) {
              return eA
                ? "ENOENT" === eA.code || "ENOTDIR" === eA.code
                  ? el(null, !1)
                  : el(eA)
                : el(null, ec.isDirectory());
            });
          },
          defaultRealpath = function (eA, el) {
            eE(eA, function (ec, eu) {
              ec && "ENOENT" !== ec.code ? el(ec) : el(null, ec ? eA : eu);
            });
          },
          maybeRealpath = function (eA, el, ec, eu) {
            ec && !1 === ec.preserveSymlinks ? eA(el, eu) : eu(null, el);
          },
          defaultReadPackage = function (eA, el, ec) {
            eA(el, function (eA, el) {
              if (eA) ec(eA);
              else
                try {
                  var eu = JSON.parse(el);
                  ec(null, eu);
                } catch (eA) {
                  ec(null);
                }
            });
          },
          getPackageCandidates = function (eA, el, ec) {
            for (var eu = eh(el, ec, eA), ed = 0; ed < eu.length; ed++)
              eu[ed] = ep.join(eu[ed], eA);
            return eu;
          };
        eA.exports = function (eA, el, ec) {
          var ed,
            eh = ec,
            eE = el;
          if (
            ("function" == typeof el && ((eh = eE), (eE = {})),
            "string" != typeof eA)
          ) {
            var eC = TypeError("Path must be a string.");
            return process.nextTick(function () {
              eh(eC);
            });
          }
          var ey = (eE = ef(eA, eE)).isFile || defaultIsFile,
            ew = eE.isDirectory || defaultIsDir,
            eB = eE.readFile || eu.readFile,
            e_ = eE.realpath || defaultRealpath,
            eI = eE.readPackage || defaultReadPackage;
          if (eE.readFile && eE.readPackage) {
            var ev = TypeError(
              "`readFile` and `readPackage` are mutually exclusive.",
            );
            return process.nextTick(function () {
              eh(ev);
            });
          }
          var eS = eE.packageIterator,
            eQ = eE.extensions || [".js"],
            eD = !1 !== eE.includeCoreModules,
            eT = eE.basedir || ep.dirname(eg()),
            eR = eE.filename || eT;
          function init(el) {
            if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(eA))
              ((ed = ep.resolve(el, eA)),
                ("." === eA || ".." === eA || "/" === eA.slice(-1)) &&
                  (ed += "/"),
                /\/$/.test(eA) && ed === el
                  ? loadAsDirectory(ed, eE.package, onfile)
                  : loadAsFile(ed, eE.package, onfile));
            else {
              if (eD && em(eA)) return eh(null, eA);
              loadNodeModules(eA, el, function (el, ec, eu) {
                if (el) eh(el);
                else {
                  if (ec)
                    return maybeRealpath(e_, ec, eE, function (eA, el) {
                      eA ? eh(eA) : eh(null, el, eu);
                    });
                  var ed = Error(
                    "Cannot find module '" + eA + "' from '" + eR + "'",
                  );
                  ((ed.code = "MODULE_NOT_FOUND"), eh(ed));
                }
              });
            }
          }
          function onfile(el, ec, eu) {
            el
              ? eh(el)
              : ec
                ? eh(null, ec, eu)
                : loadAsDirectory(ed, function (el, ec, eu) {
                    if (el) eh(el);
                    else if (ec)
                      maybeRealpath(e_, ec, eE, function (eA, el) {
                        eA ? eh(eA) : eh(null, el, eu);
                      });
                    else {
                      var ed = Error(
                        "Cannot find module '" + eA + "' from '" + eR + "'",
                      );
                      ((ed.code = "MODULE_NOT_FOUND"), eh(ed));
                    }
                  });
          }
          function loadAsFile(eA, el, ec) {
            var eu = el,
              ed = ec;
            function load(eA, el, ec) {
              if (0 === eA.length) return ed(null, void 0, ec);
              var eu = el + eA[0],
                eg = ec;
              function onpkg(ec, eh, ef) {
                if (((eg = eh), ec)) return ed(ec);
                if (ef && eg && eE.pathFilter) {
                  var em = ep.relative(ef, eu),
                    eC = em.slice(0, em.length - eA[0].length),
                    ew = eE.pathFilter(eg, el, eC);
                  if (ew)
                    return load(
                      [""].concat(eQ.slice()),
                      ep.resolve(ef, ew),
                      eg,
                    );
                }
                ey(eu, onex);
              }
              function onex(ec, ep) {
                return ec
                  ? ed(ec)
                  : ep
                    ? ed(null, eu, eg)
                    : void load(eA.slice(1), el, eg);
              }
              eg ? onpkg(null, eg) : loadpkg(ep.dirname(eu), onpkg);
            }
            ("function" == typeof eu && ((ed = eu), (eu = void 0)),
              load([""].concat(eQ), eA, eu));
          }
          function loadpkg(eA, el) {
            if (
              "" === eA ||
              "/" === eA ||
              ("win32" === process.platform && /^\w:[/\\]*$/.test(eA)) ||
              /[/\\]node_modules[/\\]*$/.test(eA)
            )
              return el(null);
            maybeRealpath(e_, eA, eE, function (ec, eu) {
              if (ec) return loadpkg(ep.dirname(eA), el);
              var ed = ep.join(eu, "package.json");
              ey(ed, function (ec, eu) {
                if (!eu) return loadpkg(ep.dirname(eA), el);
                eI(eB, ed, function (ec, eu) {
                  ec && el(ec);
                  var ep = eu;
                  (ep && eE.packageFilter && (ep = eE.packageFilter(ep, ed)),
                    el(null, ep, eA));
                });
              });
            });
          }
          function loadAsDirectory(eA, el, ec) {
            var eu = ec,
              ed = el;
            ("function" == typeof ed && ((eu = ed), (ed = eE.package)),
              maybeRealpath(e_, eA, eE, function (el, ec) {
                if (el) return eu(el);
                var eg = ep.join(ec, "package.json");
                ey(eg, function (el, ec) {
                  return el
                    ? eu(el)
                    : ec
                      ? void eI(eB, eg, function (el, ec) {
                          if (el) return eu(el);
                          var ed = ec;
                          if (
                            (ed &&
                              eE.packageFilter &&
                              (ed = eE.packageFilter(ed, eg)),
                            ed && ed.main)
                          ) {
                            if ("string" != typeof ed.main) {
                              var eh = TypeError(
                                "package “" +
                                  ed.name +
                                  "” `main` must be a string",
                              );
                              return (
                                (eh.code = "INVALID_PACKAGE_MAIN"),
                                eu(eh)
                              );
                            }
                            return (
                              ("." === ed.main || "./" === ed.main) &&
                                (ed.main = "index"),
                              void loadAsFile(
                                ep.resolve(eA, ed.main),
                                ed,
                                function (el, ec, ed) {
                                  return el
                                    ? eu(el)
                                    : ec
                                      ? eu(null, ec, ed)
                                      : ed
                                        ? void loadAsDirectory(
                                            ep.resolve(eA, ed.main),
                                            ed,
                                            function (el, ec, ed) {
                                              return el
                                                ? eu(el)
                                                : ec
                                                  ? eu(null, ec, ed)
                                                  : void loadAsFile(
                                                      ep.join(eA, "index"),
                                                      ed,
                                                      eu,
                                                    );
                                            },
                                          )
                                        : loadAsFile(
                                            ep.join(eA, "index"),
                                            ed,
                                            eu,
                                          );
                                },
                              )
                            );
                          }
                          loadAsFile(ep.join(eA, "/index"), ed, eu);
                        })
                      : loadAsFile(ep.join(eA, "index"), ed, eu);
                });
              }));
          }
          function processDirs(eA, el) {
            if (0 === el.length) return eA(null, void 0);
            var ec = el[0];
            function isdir(eu, ed) {
              return eu
                ? eA(eu)
                : ed
                  ? void loadAsFile(ec, eE.package, onfile)
                  : processDirs(eA, el.slice(1));
            }
            function onfile(el, eu, ed) {
              return el
                ? eA(el)
                : eu
                  ? eA(null, eu, ed)
                  : void loadAsDirectory(ec, eE.package, ondir);
            }
            function ondir(ec, eu, ed) {
              return ec
                ? eA(ec)
                : eu
                  ? eA(null, eu, ed)
                  : void processDirs(eA, el.slice(1));
            }
            ew(ep.dirname(ec), isdir);
          }
          function loadNodeModules(eA, el, ec) {
            var thunk = function () {
              return getPackageCandidates(eA, el, eE);
            };
            processDirs(ec, eS ? eS(eA, el, thunk, eE) : thunk());
          }
          ((eE.paths = eE.paths || defaultPaths()),
            maybeRealpath(e_, ep.resolve(eT), eE, function (eA, el) {
              eA ? eh(eA) : init(el);
            }));
        };
      },
      77875(eA, el, ec) {
        "use strict";
        var eu = ec(96233),
          ed = ec(5020),
          ep = {};
        for (var eg in ed)
          Object.prototype.hasOwnProperty.call(ed, eg) && (ep[eg] = eu(eg));
        eA.exports = ep;
      },
      94278(eA, el, ec) {
        var eu = ec(96233);
        eA.exports = function (eA) {
          return eu(eA);
        };
      },
      41911(eA, el, ec) {
        var eu = ec(96233),
          ed = ec(79896),
          ep = ec(16928),
          eg = ec(79424),
          eh = ec(36571),
          ef = ec(11705),
          em = ec(92182),
          eE =
            "win32" !== process.platform &&
            ed.realpathSync &&
            "function" == typeof ed.realpathSync.native
              ? ed.realpathSync.native
              : ed.realpathSync,
          eC = eg(),
          defaultPaths = function () {
            return [
              ep.join(eC, ".node_modules"),
              ep.join(eC, ".node_libraries"),
            ];
          },
          defaultIsFile = function (eA) {
            try {
              var el = ed.statSync(eA, { throwIfNoEntry: !1 });
            } catch (eA) {
              if (eA && ("ENOENT" === eA.code || "ENOTDIR" === eA.code))
                return !1;
              throw eA;
            }
            return !!el && (el.isFile() || el.isFIFO());
          },
          defaultIsDir = function (eA) {
            try {
              var el = ed.statSync(eA, { throwIfNoEntry: !1 });
            } catch (eA) {
              if (eA && ("ENOENT" === eA.code || "ENOTDIR" === eA.code))
                return !1;
              throw eA;
            }
            return !!el && el.isDirectory();
          },
          defaultRealpathSync = function (eA) {
            try {
              return eE(eA);
            } catch (eA) {
              if ("ENOENT" !== eA.code) throw eA;
            }
            return eA;
          },
          maybeRealpathSync = function (eA, el, ec) {
            return ec && !1 === ec.preserveSymlinks ? eA(el) : el;
          },
          defaultReadPackageSync = function (eA, el) {
            var ec = eA(el);
            try {
              return JSON.parse(ec);
            } catch (eA) {}
          },
          getPackageCandidates = function (eA, el, ec) {
            for (var eu = ef(el, ec, eA), ed = 0; ed < eu.length; ed++)
              eu[ed] = ep.join(eu[ed], eA);
            return eu;
          };
        eA.exports = function (eA, el) {
          if ("string" != typeof eA) throw TypeError("Path must be a string.");
          var ec = em(eA, el),
            eg = ec.isFile || defaultIsFile,
            ef = ec.readFileSync || ed.readFileSync,
            eE = ec.isDirectory || defaultIsDir,
            eC = ec.realpathSync || defaultRealpathSync,
            ey = ec.readPackageSync || defaultReadPackageSync;
          if (ec.readFileSync && ec.readPackageSync)
            throw TypeError(
              "`readFileSync` and `readPackageSync` are mutually exclusive.",
            );
          var ew = ec.packageIterator,
            eB = ec.extensions || [".js"],
            e_ = !1 !== ec.includeCoreModules,
            eI = ec.basedir || ep.dirname(eh()),
            ev = ec.filename || eI;
          ec.paths = ec.paths || defaultPaths();
          var eS = maybeRealpathSync(eC, ep.resolve(eI), ec);
          if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(eA)) {
            var eQ = ep.resolve(eS, eA);
            ("." === eA || ".." === eA || "/" === eA.slice(-1)) && (eQ += "/");
            var eD = loadAsFileSync(eQ) || loadAsDirectorySync(eQ);
            if (eD) return maybeRealpathSync(eC, eD, ec);
          } else {
            if (e_ && eu(eA)) return eA;
            var eT = loadNodeModulesSync(eA, eS);
            if (eT) return maybeRealpathSync(eC, eT, ec);
          }
          var eR = Error("Cannot find module '" + eA + "' from '" + ev + "'");
          throw ((eR.code = "MODULE_NOT_FOUND"), eR);
          function loadAsFileSync(eA) {
            var el = loadpkg(ep.dirname(eA));
            if (el && el.dir && el.pkg && ec.pathFilter) {
              var eu = ep.relative(el.dir, eA),
                ed = ec.pathFilter(el.pkg, eA, eu);
              ed && (eA = ep.resolve(el.dir, ed));
            }
            if (eg(eA)) return eA;
            for (var eh = 0; eh < eB.length; eh++) {
              var ef = eA + eB[eh];
              if (eg(ef)) return ef;
            }
          }
          function loadpkg(eA) {
            if (
              !(
                "" === eA ||
                "/" === eA ||
                ("win32" === process.platform && /^\w:[/\\]*$/.test(eA))
              ) &&
              !/[/\\]node_modules[/\\]*$/.test(eA)
            ) {
              var el = ep.join(maybeRealpathSync(eC, eA, ec), "package.json");
              if (!eg(el)) return loadpkg(ep.dirname(eA));
              var eu = ey(ef, el);
              return (
                eu && ec.packageFilter && (eu = ec.packageFilter(eu, eA)),
                { pkg: eu, dir: eA }
              );
            }
          }
          function loadAsDirectorySync(eA) {
            var el = ep.join(maybeRealpathSync(eC, eA, ec), "/package.json");
            if (eg(el)) {
              try {
                var eu = ey(ef, el);
              } catch (eA) {}
              if (
                (eu && ec.packageFilter && (eu = ec.packageFilter(eu, eA)),
                eu && eu.main)
              ) {
                if ("string" != typeof eu.main) {
                  var ed = TypeError(
                    "package “" + eu.name + "” `main` must be a string",
                  );
                  throw ((ed.code = "INVALID_PACKAGE_MAIN"), ed);
                }
                ("." === eu.main || "./" === eu.main) && (eu.main = "index");
                try {
                  var eh = loadAsFileSync(ep.resolve(eA, eu.main));
                  if (eh) return eh;
                  var em = loadAsDirectorySync(ep.resolve(eA, eu.main));
                  if (em) return em;
                } catch (eA) {}
              }
            }
            return loadAsFileSync(ep.join(eA, "/index"));
          }
          function loadNodeModulesSync(eA, el) {
            for (
              var thunk = function () {
                  return getPackageCandidates(eA, el, ec);
                },
                eu = ew ? ew(eA, el, thunk, ec) : thunk(),
                ed = 0;
              ed < eu.length;
              ed++
            ) {
              var eg = eu[ed];
              if (eE(ep.dirname(eg))) {
                var eh = loadAsFileSync(eg);
                if (eh) return eh;
                var ef = loadAsDirectorySync(eg);
                if (ef) return ef;
              }
            }
          }
        };
      },
      57272(eA) {
        "use strict";
        eA.exports =
          "object" == typeof process &&
          process.env &&
          process.env.NODE_DEBUG &&
          /\bsemver\b/i.test(process.env.NODE_DEBUG)
            ? (...eA) => console.error("SEMVER", ...eA)
            : () => {};
      },
      98587(eA) {
        "use strict";
        let el = Object.freeze({ loose: !0 }),
          ec = Object.freeze({});
        eA.exports = (eA) => (eA ? ("object" != typeof eA ? el : eA) : ec);
      },
      68794(eA) {
        "use strict";
        let LRUCache = class LRUCache {
          constructor() {
            ((this.max = 1e3), (this.map = new Map()));
          }
          get(eA) {
            let el = this.map.get(eA);
            if (void 0 !== el)
              return (this.map.delete(eA), this.map.set(eA, el), el);
          }
          delete(eA) {
            return this.map.delete(eA);
          }
          set(eA, el) {
            if (!this.delete(eA) && void 0 !== el) {
              if (this.map.size >= this.max) {
                let eA = this.map.keys().next().value;
                this.delete(eA);
              }
              this.map.set(eA, el);
            }
            return this;
          }
        };
        eA.exports = LRUCache;
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
            for (; ec < eA.length; )
              if (eu < el.length && (el[eu] === eA[ec] || "*" === el[eu]))
                ("*" === el[eu] ? ((ed = eu), (ep = ec)) : ec++, eu++);
              else {
                if (-1 === ed) return !1;
                ((eu = ed + 1), (ec = ++ep));
              }
            for (; eu < el.length && "*" === el[eu]; ) eu++;
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
      79424(eA, el, ec) {
        "use strict";
        eA.exports =
          ec(70857).homedir ||
          function () {
            var eA = process.env.HOME,
              el =
                process.env.LOGNAME ||
                process.env.USER ||
                process.env.LNAME ||
                process.env.USERNAME;
            return "win32" === process.platform
              ? process.env.USERPROFILE ||
                  process.env.HOMEDRIVE + process.env.HOMEPATH ||
                  eA ||
                  null
              : "darwin" === process.platform
                ? eA || (el ? "/Users/" + el : null)
                : "linux" === process.platform
                  ? eA ||
                    (0 === process.getuid()
                      ? "/root"
                      : el
                        ? "/home/" + el
                        : null)
                  : eA || null;
          };
      },
      36571(eA) {
        eA.exports = function () {
          var eA = Error.prepareStackTrace;
          Error.prepareStackTrace = function (eA, el) {
            return el;
          };
          var el = Error().stack;
          return ((Error.prepareStackTrace = eA), el[2].getFileName());
        };
      },
      11705(eA, el, ec) {
        var eu = ec(16928),
          ed = eu.parse || ec(10747),
          getNodeModulesDirs = function (eA, el) {
            var ec = "/";
            /^([A-Za-z]:)/.test(eA)
              ? (ec = "")
              : /^\\\\/.test(eA) && (ec = "\\\\");
            for (var ep = [eA], eg = ed(eA); eg.dir !== ep[ep.length - 1]; )
              (ep.push(eg.dir), (eg = ed(eg.dir)));
            return ep.reduce(function (eA, ed) {
              return eA.concat(
                el.map(function (eA) {
                  return eu.resolve(ec, ed, eA);
                }),
              );
            }, []);
          };
        eA.exports = function (eA, el, ec) {
          var eu =
            el && el.moduleDirectory
              ? [].concat(el.moduleDirectory)
              : ["node_modules"];
          if (el && "function" == typeof el.paths)
            return el.paths(
              ec,
              eA,
              function () {
                return getNodeModulesDirs(eA, eu);
              },
              el,
            );
          var ed = getNodeModulesDirs(eA, eu);
          return el && el.paths ? ed.concat(el.paths) : ed;
        };
      },
      92182(eA) {
        eA.exports = function (eA, el) {
          return el || {};
        };
      },
      96233(eA, el, ec) {
        "use strict";
        var eu = ec(78554);
        function specifierIncluded(eA, el) {
          for (
            var ec = eA.split("."),
              eu = el.split(" "),
              ed = eu.length > 1 ? eu[0] : "=",
              ep = (eu.length > 1 ? eu[1] : eu[0]).split("."),
              eg = 0;
            eg < 3;
            ++eg
          ) {
            var eh = parseInt(ec[eg] || 0, 10),
              ef = parseInt(ep[eg] || 0, 10);
            if (eh !== ef) {
              if ("<" === ed) return eh < ef;
              if (">=" === ed) return eh >= ef;
              return !1;
            }
          }
          return ">=" === ed;
        }
        function matchesRange(eA, el) {
          var ec = el.split(/ ?&& ?/);
          if (0 === ec.length) return !1;
          for (var eu = 0; eu < ec.length; ++eu)
            if (!specifierIncluded(eA, ec[eu])) return !1;
          return !0;
        }
        function versionIncluded(eA, el) {
          if ("boolean" == typeof el) return el;
          var ec =
            void 0 === eA ? process.versions && process.versions.node : eA;
          if ("string" != typeof ec)
            throw TypeError(
              void 0 === eA
                ? "Unable to determine current node version"
                : "If provided, a valid node version is required",
            );
          if (el && "object" == typeof el) {
            for (var eu = 0; eu < el.length; ++eu)
              if (matchesRange(ec, el[eu])) return !0;
            return !1;
          }
          return matchesRange(ec, el);
        }
        var ed = ec(1297);
        eA.exports = function (eA, el) {
          return eu(ed, eA) && versionIncluded(el, ed[eA]);
        };
      },
      5020(eA) {
        "use strict";
        eA.exports = JSON.parse(
          '{"assert":true,"node:assert":[">= 14.18 && < 15",">= 16"],"assert/strict":">= 15","node:assert/strict":">= 16","async_hooks":">= 8","node:async_hooks":[">= 14.18 && < 15",">= 16"],"buffer_ieee754":">= 0.5 && < 0.9.7","buffer":true,"node:buffer":[">= 14.18 && < 15",">= 16"],"child_process":true,"node:child_process":[">= 14.18 && < 15",">= 16"],"cluster":">= 0.5","node:cluster":[">= 14.18 && < 15",">= 16"],"console":true,"node:console":[">= 14.18 && < 15",">= 16"],"constants":true,"node:constants":[">= 14.18 && < 15",">= 16"],"crypto":true,"node:crypto":[">= 14.18 && < 15",">= 16"],"_debug_agent":">= 1 && < 8","_debugger":"< 8","dgram":true,"node:dgram":[">= 14.18 && < 15",">= 16"],"diagnostics_channel":[">= 14.17 && < 15",">= 15.1"],"node:diagnostics_channel":[">= 14.18 && < 15",">= 16"],"dns":true,"node:dns":[">= 14.18 && < 15",">= 16"],"dns/promises":">= 15","node:dns/promises":">= 16","domain":">= 0.7.12","node:domain":[">= 14.18 && < 15",">= 16"],"events":true,"node:events":[">= 14.18 && < 15",">= 16"],"freelist":"< 6","fs":true,"node:fs":[">= 14.18 && < 15",">= 16"],"fs/promises":[">= 10 && < 10.1",">= 14"],"node:fs/promises":[">= 14.18 && < 15",">= 16"],"_http_agent":">= 0.11.1","node:_http_agent":[">= 14.18 && < 15",">= 16"],"_http_client":">= 0.11.1","node:_http_client":[">= 14.18 && < 15",">= 16"],"_http_common":">= 0.11.1","node:_http_common":[">= 14.18 && < 15",">= 16"],"_http_incoming":">= 0.11.1","node:_http_incoming":[">= 14.18 && < 15",">= 16"],"_http_outgoing":">= 0.11.1","node:_http_outgoing":[">= 14.18 && < 15",">= 16"],"_http_server":">= 0.11.1","node:_http_server":[">= 14.18 && < 15",">= 16"],"http":true,"node:http":[">= 14.18 && < 15",">= 16"],"http2":">= 8.8","node:http2":[">= 14.18 && < 15",">= 16"],"https":true,"node:https":[">= 14.18 && < 15",">= 16"],"inspector":">= 8","node:inspector":[">= 14.18 && < 15",">= 16"],"inspector/promises":[">= 19"],"node:inspector/promises":[">= 19"],"_linklist":"< 8","module":true,"node:module":[">= 14.18 && < 15",">= 16"],"net":true,"node:net":[">= 14.18 && < 15",">= 16"],"node-inspect/lib/_inspect":">= 7.6 && < 12","node-inspect/lib/internal/inspect_client":">= 7.6 && < 12","node-inspect/lib/internal/inspect_repl":">= 7.6 && < 12","os":true,"node:os":[">= 14.18 && < 15",">= 16"],"path":true,"node:path":[">= 14.18 && < 15",">= 16"],"path/posix":">= 15.3","node:path/posix":">= 16","path/win32":">= 15.3","node:path/win32":">= 16","perf_hooks":">= 8.5","node:perf_hooks":[">= 14.18 && < 15",">= 16"],"process":">= 1","node:process":[">= 14.18 && < 15",">= 16"],"punycode":">= 0.5","node:punycode":[">= 14.18 && < 15",">= 16"],"querystring":true,"node:querystring":[">= 14.18 && < 15",">= 16"],"readline":true,"node:readline":[">= 14.18 && < 15",">= 16"],"readline/promises":">= 17","node:readline/promises":">= 17","repl":true,"node:repl":[">= 14.18 && < 15",">= 16"],"node:sea":[">= 20.12 && < 21",">= 21.7"],"smalloc":">= 0.11.5 && < 3","node:sqlite":">= 23.4","_stream_duplex":">= 0.9.4","node:_stream_duplex":[">= 14.18 && < 15",">= 16"],"_stream_transform":">= 0.9.4","node:_stream_transform":[">= 14.18 && < 15",">= 16"],"_stream_wrap":">= 1.4.1","node:_stream_wrap":[">= 14.18 && < 15",">= 16"],"_stream_passthrough":">= 0.9.4","node:_stream_passthrough":[">= 14.18 && < 15",">= 16"],"_stream_readable":">= 0.9.4","node:_stream_readable":[">= 14.18 && < 15",">= 16"],"_stream_writable":">= 0.9.4","node:_stream_writable":[">= 14.18 && < 15",">= 16"],"stream":true,"node:stream":[">= 14.18 && < 15",">= 16"],"stream/consumers":">= 16.7","node:stream/consumers":">= 16.7","stream/promises":">= 15","node:stream/promises":">= 16","stream/web":">= 16.5","node:stream/web":">= 16.5","string_decoder":true,"node:string_decoder":[">= 14.18 && < 15",">= 16"],"sys":[">= 0.4 && < 0.7",">= 0.8"],"node:sys":[">= 14.18 && < 15",">= 16"],"test/reporters":">= 19.9 && < 20.2","node:test/reporters":[">= 18.17 && < 19",">= 19.9",">= 20"],"test/mock_loader":">= 22.3 && < 22.7","node:test/mock_loader":">= 22.3 && < 22.7","node:test":[">= 16.17 && < 17",">= 18"],"timers":true,"node:timers":[">= 14.18 && < 15",">= 16"],"timers/promises":">= 15","node:timers/promises":">= 16","_tls_common":">= 0.11.13","node:_tls_common":[">= 14.18 && < 15",">= 16"],"_tls_legacy":">= 0.11.3 && < 10","_tls_wrap":">= 0.11.3","node:_tls_wrap":[">= 14.18 && < 15",">= 16"],"tls":true,"node:tls":[">= 14.18 && < 15",">= 16"],"trace_events":">= 10","node:trace_events":[">= 14.18 && < 15",">= 16"],"tty":true,"node:tty":[">= 14.18 && < 15",">= 16"],"url":true,"node:url":[">= 14.18 && < 15",">= 16"],"util":true,"node:util":[">= 14.18 && < 15",">= 16"],"util/types":">= 15.3","node:util/types":">= 16","v8/tools/arguments":">= 10 && < 12","v8/tools/codemap":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/consarray":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/csvparser":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/logreader":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/profile_view":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/splaytree":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8":">= 1","node:v8":[">= 14.18 && < 15",">= 16"],"vm":true,"node:vm":[">= 14.18 && < 15",">= 16"],"wasi":[">= 13.4 && < 13.5",">= 18.17 && < 19",">= 20"],"node:wasi":[">= 18.17 && < 19",">= 20"],"worker_threads":">= 11.7","node:worker_threads":[">= 14.18 && < 15",">= 16"],"zlib":">= 0.5","node:zlib":[">= 14.18 && < 15",">= 16"]}',
        );
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
      10747(eA) {
        "use strict";
        var el = "win32" === process.platform,
          ec =
            /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/,
          eu = {};
        function win32SplitPath(eA) {
          return ec.exec(eA).slice(1);
        }
        eu.parse = function (eA) {
          if ("string" != typeof eA)
            throw TypeError(
              "Parameter 'pathString' must be a string, not " + typeof eA,
            );
          var el = win32SplitPath(eA);
          if (!el || 5 !== el.length)
            throw TypeError("Invalid path '" + eA + "'");
          return {
            root: el[1],
            dir: el[0] === el[1] ? el[0] : el[0].slice(0, -1),
            base: el[2],
            ext: el[4],
            name: el[3],
          };
        };
        var ed = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/,
          ep = {};
        function posixSplitPath(eA) {
          return ed.exec(eA).slice(1);
        }
        ((ep.parse = function (eA) {
          if ("string" != typeof eA)
            throw TypeError(
              "Parameter 'pathString' must be a string, not " + typeof eA,
            );
          var el = posixSplitPath(eA);
          if (!el || 5 !== el.length)
            throw TypeError("Invalid path '" + eA + "'");
          return {
            root: el[1],
            dir: el[0].slice(0, -1),
            base: el[2],
            ext: el[4],
            name: el[3],
          };
        }),
          el ? (eA.exports = eu.parse) : (eA.exports = ep.parse),
          (eA.exports.posix = ep.parse),
          (eA.exports.win32 = eu.parse));
      },
      78554(eA, el, ec) {
        "use strict";
        var eu = Function.prototype.call,
          ed = Object.prototype.hasOwnProperty;
        eA.exports = ec(79138).call(eu, ed);
      },
      1297(eA) {
        "use strict";
        eA.exports = JSON.parse(
          '{"assert":true,"node:assert":[">= 14.18 && < 15",">= 16"],"assert/strict":">= 15","node:assert/strict":">= 16","async_hooks":">= 8","node:async_hooks":[">= 14.18 && < 15",">= 16"],"buffer_ieee754":">= 0.5 && < 0.9.7","buffer":true,"node:buffer":[">= 14.18 && < 15",">= 16"],"child_process":true,"node:child_process":[">= 14.18 && < 15",">= 16"],"cluster":">= 0.5","node:cluster":[">= 14.18 && < 15",">= 16"],"console":true,"node:console":[">= 14.18 && < 15",">= 16"],"constants":true,"node:constants":[">= 14.18 && < 15",">= 16"],"crypto":true,"node:crypto":[">= 14.18 && < 15",">= 16"],"_debug_agent":">= 1 && < 8","_debugger":"< 8","dgram":true,"node:dgram":[">= 14.18 && < 15",">= 16"],"diagnostics_channel":[">= 14.17 && < 15",">= 15.1"],"node:diagnostics_channel":[">= 14.18 && < 15",">= 16"],"dns":true,"node:dns":[">= 14.18 && < 15",">= 16"],"dns/promises":">= 15","node:dns/promises":">= 16","domain":">= 0.7.12","node:domain":[">= 14.18 && < 15",">= 16"],"events":true,"node:events":[">= 14.18 && < 15",">= 16"],"freelist":"< 6","fs":true,"node:fs":[">= 14.18 && < 15",">= 16"],"fs/promises":[">= 10 && < 10.1",">= 14"],"node:fs/promises":[">= 14.18 && < 15",">= 16"],"_http_agent":">= 0.11.1","node:_http_agent":[">= 14.18 && < 15",">= 16"],"_http_client":">= 0.11.1","node:_http_client":[">= 14.18 && < 15",">= 16"],"_http_common":">= 0.11.1","node:_http_common":[">= 14.18 && < 15",">= 16"],"_http_incoming":">= 0.11.1","node:_http_incoming":[">= 14.18 && < 15",">= 16"],"_http_outgoing":">= 0.11.1","node:_http_outgoing":[">= 14.18 && < 15",">= 16"],"_http_server":">= 0.11.1","node:_http_server":[">= 14.18 && < 15",">= 16"],"http":true,"node:http":[">= 14.18 && < 15",">= 16"],"http2":">= 8.8","node:http2":[">= 14.18 && < 15",">= 16"],"https":true,"node:https":[">= 14.18 && < 15",">= 16"],"inspector":">= 8","node:inspector":[">= 14.18 && < 15",">= 16"],"inspector/promises":[">= 19"],"node:inspector/promises":[">= 19"],"_linklist":"< 8","module":true,"node:module":[">= 14.18 && < 15",">= 16"],"net":true,"node:net":[">= 14.18 && < 15",">= 16"],"node-inspect/lib/_inspect":">= 7.6 && < 12","node-inspect/lib/internal/inspect_client":">= 7.6 && < 12","node-inspect/lib/internal/inspect_repl":">= 7.6 && < 12","os":true,"node:os":[">= 14.18 && < 15",">= 16"],"path":true,"node:path":[">= 14.18 && < 15",">= 16"],"path/posix":">= 15.3","node:path/posix":">= 16","path/win32":">= 15.3","node:path/win32":">= 16","perf_hooks":">= 8.5","node:perf_hooks":[">= 14.18 && < 15",">= 16"],"process":">= 1","node:process":[">= 14.18 && < 15",">= 16"],"punycode":">= 0.5","node:punycode":[">= 14.18 && < 15",">= 16"],"querystring":true,"node:querystring":[">= 14.18 && < 15",">= 16"],"readline":true,"node:readline":[">= 14.18 && < 15",">= 16"],"readline/promises":">= 17","node:readline/promises":">= 17","repl":true,"node:repl":[">= 14.18 && < 15",">= 16"],"node:sea":[">= 20.12 && < 21",">= 21.7"],"smalloc":">= 0.11.5 && < 3","node:sqlite":[">= 22.13 && < 23",">= 23.4"],"_stream_duplex":">= 0.9.4","node:_stream_duplex":[">= 14.18 && < 15",">= 16"],"_stream_transform":">= 0.9.4","node:_stream_transform":[">= 14.18 && < 15",">= 16"],"_stream_wrap":">= 1.4.1","node:_stream_wrap":[">= 14.18 && < 15",">= 16"],"_stream_passthrough":">= 0.9.4","node:_stream_passthrough":[">= 14.18 && < 15",">= 16"],"_stream_readable":">= 0.9.4","node:_stream_readable":[">= 14.18 && < 15",">= 16"],"_stream_writable":">= 0.9.4","node:_stream_writable":[">= 14.18 && < 15",">= 16"],"stream":true,"node:stream":[">= 14.18 && < 15",">= 16"],"stream/consumers":">= 16.7","node:stream/consumers":">= 16.7","stream/promises":">= 15","node:stream/promises":">= 16","stream/web":">= 16.5","node:stream/web":">= 16.5","string_decoder":true,"node:string_decoder":[">= 14.18 && < 15",">= 16"],"sys":[">= 0.4 && < 0.7",">= 0.8"],"node:sys":[">= 14.18 && < 15",">= 16"],"test/reporters":">= 19.9 && < 20.2","node:test/reporters":[">= 18.17 && < 19",">= 19.9",">= 20"],"test/mock_loader":">= 22.3 && < 22.7","node:test/mock_loader":">= 22.3 && < 22.7","node:test":[">= 16.17 && < 17",">= 18"],"timers":true,"node:timers":[">= 14.18 && < 15",">= 16"],"timers/promises":">= 15","node:timers/promises":">= 16","_tls_common":">= 0.11.13","node:_tls_common":[">= 14.18 && < 15",">= 16"],"_tls_legacy":">= 0.11.3 && < 10","_tls_wrap":">= 0.11.3","node:_tls_wrap":[">= 14.18 && < 15",">= 16"],"tls":true,"node:tls":[">= 14.18 && < 15",">= 16"],"trace_events":">= 10","node:trace_events":[">= 14.18 && < 15",">= 16"],"tty":true,"node:tty":[">= 14.18 && < 15",">= 16"],"url":true,"node:url":[">= 14.18 && < 15",">= 16"],"util":true,"node:util":[">= 14.18 && < 15",">= 16"],"util/types":">= 15.3","node:util/types":">= 16","v8/tools/arguments":">= 10 && < 12","v8/tools/codemap":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/consarray":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/csvparser":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/logreader":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/profile_view":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8/tools/splaytree":[">= 4.4 && < 5",">= 5.2 && < 12"],"v8":">= 1","node:v8":[">= 14.18 && < 15",">= 16"],"vm":true,"node:vm":[">= 14.18 && < 15",">= 16"],"wasi":[">= 13.4 && < 13.5",">= 18.17 && < 19",">= 20"],"node:wasi":[">= 18.17 && < 19",">= 20"],"worker_threads":">= 11.7","node:worker_threads":[">= 14.18 && < 15",">= 16"],"zlib":">= 0.5","node:zlib":[">= 14.18 && < 15",">= 16"]}',
        );
      },
      79138(eA, el, ec) {
        "use strict";
        var eu = ec(28794);
        eA.exports = Function.prototype.bind || eu;
      },
      28794(eA) {
        "use strict";
        var el = "Function.prototype.bind called on incompatible ",
          ec = Object.prototype.toString,
          eu = Math.max,
          ed = "[object Function]",
          concatty = function (eA, el) {
            for (var ec = [], eu = 0; eu < eA.length; eu += 1) ec[eu] = eA[eu];
            for (var ed = 0; ed < el.length; ed += 1)
              ec[ed + eA.length] = el[ed];
            return ec;
          },
          slicy = function (eA, el) {
            for (
              var ec = [], eu = el || 0, ed = 0;
              eu < eA.length;
              eu += 1, ed += 1
            )
              ec[ed] = eA[eu];
            return ec;
          },
          joiny = function (eA, el) {
            for (var ec = "", eu = 0; eu < eA.length; eu += 1)
              ((ec += eA[eu]), eu + 1 < eA.length && (ec += el));
            return ec;
          };
        eA.exports = function (eA) {
          var ep,
            eg = this;
          if ("function" != typeof eg || ec.apply(eg) !== ed)
            throw TypeError(el + eg);
          for (
            var eh = slicy(arguments, 1),
              binder = function () {
                if (this instanceof ep) {
                  var el = eg.apply(this, concatty(eh, arguments));
                  return Object(el) === el ? el : this;
                }
                return eg.apply(eA, concatty(eh, arguments));
              },
              ef = eu(0, eg.length - eh.length),
              em = [],
              eE = 0;
            eE < ef;
            eE++
          )
            em[eE] = "$" + eE;
          if (
            ((ep = Function(
              "binder",
              "return function (" +
                joiny(em, ",") +
                "){ return binder.apply(this,arguments); }",
            )(binder)),
            eg.prototype)
          ) {
            var Empty = function () {};
            ((Empty.prototype = eg.prototype),
              (ep.prototype = new Empty()),
              (Empty.prototype = null));
          }
          return ep;
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

  return { FetchInstrumentation: ec(8009).FetchInstrumentation, getModule: ec };
}
