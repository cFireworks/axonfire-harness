// @ts-nocheck
// Complete inert original shell service, handles and utility factories; explicit host boundaries.
export const SANDBOX_SHELL_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SANDBOX_SHELL_BLOCKS = [
  ["lU", 8662573, 8663134],
  ["SandboxPtyExecutionHandle", 8663134, 8667787],
  ["SandboxPipeExecutionHandle", 8667787, 8671835],
  ["toShellNetworkBlockRecord", 8671835, 8671952],
  ["mapNetworkBlockRecords", 8671952, 8672050],
  ["lW", 8672701, 8672899],
  ["sweepStaleWindowsBashPayloads", 8672899, 8673220],
  ["stageWindowsBashScript", 8673220, 8673665],
  ["l0", 8673665, 8690075],
] as const;
export const SANDBOX_SHELL_MODULES = [
  [62922, 1855732, 2003091],
  [6453, 11305623, 11314891],
  [2752, 11314892, 11320235],
  [83044, 11320236, 11321663],
  [70543, 12172666, 12176594],
  [38736, 13020521, 13020615],
  [79436, 6774816, 6774920],
  [91371, 2145113, 2145377],
  [19702, 11303046, 11304324],
  [3927, 13322684, 13323238],
  [70064, 13407006, 13408972],
] as const;
export const SANDBOX_SHELL_STATICS = [8690075, 8690131] as const;
export function createNativeSandboxShell(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit SandboxShell process boundary required");
  const process = runtime.process,
    Bun = runtime.Bun,
    Buffer = runtime.Buffer ?? globalThis.Buffer,
    Date = runtime.Date ?? globalThis.Date;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  const factories = {
    62922(eA, el) {
      (() => {
        "use strict";
        var eA = {
            349: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.CircularList = void 0));
              let eu = ec(460),
                ed = ec(844);
              let n = class n extends ed.Disposable {
                constructor(eA) {
                  (super(),
                    (this._maxLength = eA),
                    (this.onDeleteEmitter = this.register(
                      new eu.EventEmitter(),
                    )),
                    (this.onDelete = this.onDeleteEmitter.event),
                    (this.onInsertEmitter = this.register(
                      new eu.EventEmitter(),
                    )),
                    (this.onInsert = this.onInsertEmitter.event),
                    (this.onTrimEmitter = this.register(new eu.EventEmitter())),
                    (this.onTrim = this.onTrimEmitter.event),
                    (this._array = Array(this._maxLength)),
                    (this._startIndex = 0),
                    (this._length = 0));
                }
                get maxLength() {
                  return this._maxLength;
                }
                set maxLength(eA) {
                  if (this._maxLength === eA) return;
                  let el = Array(eA);
                  for (let ec = 0; ec < Math.min(eA, this.length); ec++)
                    el[ec] = this._array[this._getCyclicIndex(ec)];
                  ((this._array = el),
                    (this._maxLength = eA),
                    (this._startIndex = 0));
                }
                get length() {
                  return this._length;
                }
                set length(eA) {
                  if (eA > this._length)
                    for (let el = this._length; el < eA; el++)
                      this._array[el] = void 0;
                  this._length = eA;
                }
                get(eA) {
                  return this._array[this._getCyclicIndex(eA)];
                }
                set(eA, el) {
                  this._array[this._getCyclicIndex(eA)] = el;
                }
                push(eA) {
                  ((this._array[this._getCyclicIndex(this._length)] = eA),
                    this._length === this._maxLength
                      ? ((this._startIndex =
                          ++this._startIndex % this._maxLength),
                        this.onTrimEmitter.fire(1))
                      : this._length++);
                }
                recycle() {
                  if (this._length !== this._maxLength)
                    throw Error("Can only recycle when the buffer is full");
                  return (
                    (this._startIndex = ++this._startIndex % this._maxLength),
                    this.onTrimEmitter.fire(1),
                    this._array[this._getCyclicIndex(this._length - 1)]
                  );
                }
                get isFull() {
                  return this._length === this._maxLength;
                }
                pop() {
                  return this._array[this._getCyclicIndex(this._length-- - 1)];
                }
                splice(eA, el, ...ec) {
                  if (el) {
                    for (let ec = eA; ec < this._length - el; ec++)
                      this._array[this._getCyclicIndex(ec)] =
                        this._array[this._getCyclicIndex(ec + el)];
                    ((this._length -= el),
                      this.onDeleteEmitter.fire({ index: eA, amount: el }));
                  }
                  for (let el = this._length - 1; el >= eA; el--)
                    this._array[this._getCyclicIndex(el + ec.length)] =
                      this._array[this._getCyclicIndex(el)];
                  for (let el = 0; el < ec.length; el++)
                    this._array[this._getCyclicIndex(eA + el)] = ec[el];
                  if (
                    (ec.length &&
                      this.onInsertEmitter.fire({
                        index: eA,
                        amount: ec.length,
                      }),
                    this._length + ec.length > this._maxLength)
                  ) {
                    let eA = this._length + ec.length - this._maxLength;
                    ((this._startIndex += eA),
                      (this._length = this._maxLength),
                      this.onTrimEmitter.fire(eA));
                  } else this._length += ec.length;
                }
                trimStart(eA) {
                  (eA > this._length && (eA = this._length),
                    (this._startIndex += eA),
                    (this._length -= eA),
                    this.onTrimEmitter.fire(eA));
                }
                shiftElements(eA, el, ec) {
                  if (!(el <= 0)) {
                    if (eA < 0 || eA >= this._length)
                      throw Error("start argument out of range");
                    if (eA + ec < 0)
                      throw Error(
                        "Cannot shift elements in list beyond index 0",
                      );
                    if (ec > 0) {
                      for (let eu = el - 1; eu >= 0; eu--)
                        this.set(eA + eu + ec, this.get(eA + eu));
                      let eu = eA + el + ec - this._length;
                      if (eu > 0)
                        for (
                          this._length += eu;
                          this._length > this._maxLength;

                        )
                          (this._length--,
                            this._startIndex++,
                            this.onTrimEmitter.fire(1));
                    } else
                      for (let eu = 0; eu < el; eu++)
                        this.set(eA + eu + ec, this.get(eA + eu));
                  }
                }
                _getCyclicIndex(eA) {
                  return (this._startIndex + eA) % this._maxLength;
                }
              };
              el.CircularList = n;
            },
            439: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.clone = void 0),
                (el.clone = function e(eA, el = 5) {
                  if ("object" != typeof eA) return eA;
                  let ec = Array.isArray(eA) ? [] : {};
                  for (let eu in eA)
                    ec[eu] = el <= 1 ? eA[eu] : eA[eu] && e(eA[eu], el - 1);
                  return ec;
                }));
            },
            969: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.CoreTerminal = void 0));
              let eu = ec(844),
                ed = ec(585),
                ep = ec(348),
                eg = ec(866),
                eh = ec(744),
                ef = ec(302),
                em = ec(83),
                eE = ec(460),
                eC = ec(753),
                ey = ec(480),
                ew = ec(994),
                eB = ec(282),
                e_ = ec(435),
                eI = ec(981),
                ev = ec(660),
                eS = !1;
              let S = class S extends eu.Disposable {
                get onScroll() {
                  return (
                    this._onScrollApi ||
                      ((this._onScrollApi = this.register(
                        new eE.EventEmitter(),
                      )),
                      this._onScroll.event((eA) => {
                        this._onScrollApi?.fire(eA.position);
                      })),
                    this._onScrollApi.event
                  );
                }
                get cols() {
                  return this._bufferService.cols;
                }
                get rows() {
                  return this._bufferService.rows;
                }
                get buffers() {
                  return this._bufferService.buffers;
                }
                get options() {
                  return this.optionsService.options;
                }
                set options(eA) {
                  for (let el in eA) this.optionsService.options[el] = eA[el];
                }
                constructor(eA) {
                  (super(),
                    (this._windowsWrappingHeuristics = this.register(
                      new eu.MutableDisposable(),
                    )),
                    (this._onBinary = this.register(new eE.EventEmitter())),
                    (this.onBinary = this._onBinary.event),
                    (this._onData = this.register(new eE.EventEmitter())),
                    (this.onData = this._onData.event),
                    (this._onLineFeed = this.register(new eE.EventEmitter())),
                    (this.onLineFeed = this._onLineFeed.event),
                    (this._onResize = this.register(new eE.EventEmitter())),
                    (this.onResize = this._onResize.event),
                    (this._onWriteParsed = this.register(
                      new eE.EventEmitter(),
                    )),
                    (this.onWriteParsed = this._onWriteParsed.event),
                    (this._onScroll = this.register(new eE.EventEmitter())),
                    (this._instantiationService =
                      new ep.InstantiationService()),
                    (this.optionsService = this.register(
                      new ef.OptionsService(eA),
                    )),
                    this._instantiationService.setService(
                      ed.IOptionsService,
                      this.optionsService,
                    ),
                    (this._bufferService = this.register(
                      this._instantiationService.createInstance(
                        eh.BufferService,
                      ),
                    )),
                    this._instantiationService.setService(
                      ed.IBufferService,
                      this._bufferService,
                    ),
                    (this._logService = this.register(
                      this._instantiationService.createInstance(eg.LogService),
                    )),
                    this._instantiationService.setService(
                      ed.ILogService,
                      this._logService,
                    ),
                    (this.coreService = this.register(
                      this._instantiationService.createInstance(em.CoreService),
                    )),
                    this._instantiationService.setService(
                      ed.ICoreService,
                      this.coreService,
                    ),
                    (this.coreMouseService = this.register(
                      this._instantiationService.createInstance(
                        eC.CoreMouseService,
                      ),
                    )),
                    this._instantiationService.setService(
                      ed.ICoreMouseService,
                      this.coreMouseService,
                    ),
                    (this.unicodeService = this.register(
                      this._instantiationService.createInstance(
                        ey.UnicodeService,
                      ),
                    )),
                    this._instantiationService.setService(
                      ed.IUnicodeService,
                      this.unicodeService,
                    ),
                    (this._charsetService =
                      this._instantiationService.createInstance(
                        ew.CharsetService,
                      )),
                    this._instantiationService.setService(
                      ed.ICharsetService,
                      this._charsetService,
                    ),
                    (this._oscLinkService =
                      this._instantiationService.createInstance(
                        ev.OscLinkService,
                      )),
                    this._instantiationService.setService(
                      ed.IOscLinkService,
                      this._oscLinkService,
                    ),
                    (this._inputHandler = this.register(
                      new e_.InputHandler(
                        this._bufferService,
                        this._charsetService,
                        this.coreService,
                        this._logService,
                        this.optionsService,
                        this._oscLinkService,
                        this.coreMouseService,
                        this.unicodeService,
                      ),
                    )),
                    this.register(
                      (0, eE.forwardEvent)(
                        this._inputHandler.onLineFeed,
                        this._onLineFeed,
                      ),
                    ),
                    this.register(this._inputHandler),
                    this.register(
                      (0, eE.forwardEvent)(
                        this._bufferService.onResize,
                        this._onResize,
                      ),
                    ),
                    this.register(
                      (0, eE.forwardEvent)(
                        this.coreService.onData,
                        this._onData,
                      ),
                    ),
                    this.register(
                      (0, eE.forwardEvent)(
                        this.coreService.onBinary,
                        this._onBinary,
                      ),
                    ),
                    this.register(
                      this.coreService.onRequestScrollToBottom(() =>
                        this.scrollToBottom(),
                      ),
                    ),
                    this.register(
                      this.coreService.onUserInput(() =>
                        this._writeBuffer.handleUserInput(),
                      ),
                    ),
                    this.register(
                      this.optionsService.onMultipleOptionChange(
                        ["windowsMode", "windowsPty"],
                        () => this._handleWindowsPtyOptionChange(),
                      ),
                    ),
                    this.register(
                      this._bufferService.onScroll((eA) => {
                        (this._onScroll.fire({
                          position: this._bufferService.buffer.ydisp,
                          source: 0,
                        }),
                          this._inputHandler.markRangeDirty(
                            this._bufferService.buffer.scrollTop,
                            this._bufferService.buffer.scrollBottom,
                          ));
                      }),
                    ),
                    this.register(
                      this._inputHandler.onScroll((eA) => {
                        (this._onScroll.fire({
                          position: this._bufferService.buffer.ydisp,
                          source: 0,
                        }),
                          this._inputHandler.markRangeDirty(
                            this._bufferService.buffer.scrollTop,
                            this._bufferService.buffer.scrollBottom,
                          ));
                      }),
                    ),
                    (this._writeBuffer = this.register(
                      new eI.WriteBuffer((eA, el) =>
                        this._inputHandler.parse(eA, el),
                      ),
                    )),
                    this.register(
                      (0, eE.forwardEvent)(
                        this._writeBuffer.onWriteParsed,
                        this._onWriteParsed,
                      ),
                    ));
                }
                write(eA, el) {
                  this._writeBuffer.write(eA, el);
                }
                writeSync(eA, el) {
                  (this._logService.logLevel <= ed.LogLevelEnum.WARN &&
                    !eS &&
                    (this._logService.warn(
                      "writeSync is unreliable and will be removed soon.",
                    ),
                    (eS = !0)),
                    this._writeBuffer.writeSync(eA, el));
                }
                input(eA, el = !0) {
                  this.coreService.triggerDataEvent(eA, el);
                }
                resize(eA, el) {
                  isNaN(eA) ||
                    isNaN(el) ||
                    ((eA = Math.max(eA, eh.MINIMUM_COLS)),
                    (el = Math.max(el, eh.MINIMUM_ROWS)),
                    this._bufferService.resize(eA, el));
                }
                scroll(eA, el = !1) {
                  this._bufferService.scroll(eA, el);
                }
                scrollLines(eA, el, ec) {
                  this._bufferService.scrollLines(eA, el, ec);
                }
                scrollPages(eA) {
                  this.scrollLines(eA * (this.rows - 1));
                }
                scrollToTop() {
                  this.scrollLines(-this._bufferService.buffer.ydisp);
                }
                scrollToBottom() {
                  this.scrollLines(
                    this._bufferService.buffer.ybase -
                      this._bufferService.buffer.ydisp,
                  );
                }
                scrollToLine(eA) {
                  let el = eA - this._bufferService.buffer.ydisp;
                  0 !== el && this.scrollLines(el);
                }
                registerEscHandler(eA, el) {
                  return this._inputHandler.registerEscHandler(eA, el);
                }
                registerDcsHandler(eA, el) {
                  return this._inputHandler.registerDcsHandler(eA, el);
                }
                registerCsiHandler(eA, el) {
                  return this._inputHandler.registerCsiHandler(eA, el);
                }
                registerOscHandler(eA, el) {
                  return this._inputHandler.registerOscHandler(eA, el);
                }
                _setup() {
                  this._handleWindowsPtyOptionChange();
                }
                reset() {
                  (this._inputHandler.reset(),
                    this._bufferService.reset(),
                    this._charsetService.reset(),
                    this.coreService.reset(),
                    this.coreMouseService.reset());
                }
                _handleWindowsPtyOptionChange() {
                  let eA = !1,
                    el = this.optionsService.rawOptions.windowsPty;
                  (el && void 0 !== el.buildNumber && void 0 !== el.buildNumber
                    ? (eA = !!(
                        "conpty" === el.backend && el.buildNumber < 21376
                      ))
                    : this.optionsService.rawOptions.windowsMode && (eA = !0),
                    eA
                      ? this._enableWindowsWrappingHeuristics()
                      : this._windowsWrappingHeuristics.clear());
                }
                _enableWindowsWrappingHeuristics() {
                  if (!this._windowsWrappingHeuristics.value) {
                    let eA = [];
                    (eA.push(
                      this.onLineFeed(
                        eB.updateWindowsModeWrappedState.bind(
                          null,
                          this._bufferService,
                        ),
                      ),
                    ),
                      eA.push(
                        this.registerCsiHandler(
                          { final: "H" },
                          () => (
                            (0, eB.updateWindowsModeWrappedState)(
                              this._bufferService,
                            ),
                            !1
                          ),
                        ),
                      ),
                      (this._windowsWrappingHeuristics.value = (0,
                      eu.toDisposable)(() => {
                        for (let el of eA) el.dispose();
                      })));
                  }
                }
              };
              el.CoreTerminal = S;
            },
            460: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.runAndSubscribe =
                  el.forwardEvent =
                  el.EventEmitter =
                    void 0),
                (el.EventEmitter = class {
                  constructor() {
                    ((this._listeners = []), (this._disposed = !1));
                  }
                  get event() {
                    return (
                      this._event ||
                        (this._event = (eA) => (
                          this._listeners.push(eA),
                          {
                            dispose: () => {
                              if (!this._disposed) {
                                for (
                                  let el = 0;
                                  el < this._listeners.length;
                                  el++
                                )
                                  if (this._listeners[el] === eA)
                                    return void this._listeners.splice(el, 1);
                              }
                            },
                          }
                        )),
                      this._event
                    );
                  }
                  fire(eA, el) {
                    let ec = [];
                    for (let eA = 0; eA < this._listeners.length; eA++)
                      ec.push(this._listeners[eA]);
                    for (let eu = 0; eu < ec.length; eu++)
                      ec[eu].call(void 0, eA, el);
                  }
                  dispose() {
                    (this.clearListeners(), (this._disposed = !0));
                  }
                  clearListeners() {
                    this._listeners && (this._listeners.length = 0);
                  }
                }),
                (el.forwardEvent = function (eA, el) {
                  return eA((eA) => el.fire(eA));
                }),
                (el.runAndSubscribe = function (eA, el) {
                  return (el(void 0), eA((eA) => el(eA)));
                }));
            },
            435: function (eA, el, ec) {
              var eu,
                ed =
                  (this && this.__decorate) ||
                  function (eA, el, ec, eu) {
                    var ed,
                      ep = arguments.length,
                      eg =
                        ep < 3
                          ? el
                          : null === eu
                            ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                            : eu;
                    if (
                      "object" == typeof Reflect &&
                      "function" == typeof Reflect.decorate
                    )
                      eg = Reflect.decorate(eA, el, ec, eu);
                    else
                      for (var eh = eA.length - 1; eh >= 0; eh--)
                        (ed = eA[eh]) &&
                          (eg =
                            (ep < 3
                              ? ed(eg)
                              : ep > 3
                                ? ed(el, ec, eg)
                                : ed(el, ec)) || eg);
                    return (
                      ep > 3 && eg && Object.defineProperty(el, ec, eg),
                      eg
                    );
                  },
                ep =
                  (this && this.__param) ||
                  function (eA, el) {
                    return function (ec, eu) {
                      el(ec, eu, eA);
                    };
                  };
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.InputHandler = el.WindowsOptionsReportType = void 0));
              let eg = ec(584),
                eh = ec(116),
                ef = ec(15),
                em = ec(844),
                eE = ec(482),
                eC = ec(437),
                ey = ec(460),
                ew = ec(643),
                eB = ec(511),
                e_ = ec(734),
                eI = ec(585),
                ev = ec(480),
                eS = ec(242),
                eQ = ec(351),
                eD = ec(941),
                eT = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 },
                eR = 131072;
              function y(eA, el) {
                if (eA > 24) return el.setWinLines || !1;
                switch (eA) {
                  case 1:
                    return !!el.restoreWin;
                  case 2:
                    return !!el.minimizeWin;
                  case 3:
                    return !!el.setWinPosition;
                  case 4:
                    return !!el.setWinSizePixels;
                  case 5:
                    return !!el.raiseWin;
                  case 6:
                    return !!el.lowerWin;
                  case 7:
                    return !!el.refreshWin;
                  case 8:
                    return !!el.setWinSizeChars;
                  case 9:
                    return !!el.maximizeWin;
                  case 10:
                    return !!el.fullscreenWin;
                  case 11:
                    return !!el.getWinState;
                  case 13:
                    return !!el.getWinPosition;
                  case 14:
                    return !!el.getWinSizePixels;
                  case 15:
                    return !!el.getScreenSizePixels;
                  case 16:
                    return !!el.getCellSizePixels;
                  case 18:
                    return !!el.getWinSizeChars;
                  case 19:
                    return !!el.getScreenSizeChars;
                  case 20:
                    return !!el.getIconTitle;
                  case 21:
                    return !!el.getWinTitle;
                  case 22:
                    return !!el.pushTitle;
                  case 23:
                    return !!el.popTitle;
                  case 24:
                    return !!el.setWinLines;
                }
                return !1;
              }
              !(function (eA) {
                ((eA[(eA.GET_WIN_SIZE_PIXELS = 0)] = "GET_WIN_SIZE_PIXELS"),
                  (eA[(eA.GET_CELL_SIZE_PIXELS = 1)] = "GET_CELL_SIZE_PIXELS"));
              })(eu || (el.WindowsOptionsReportType = eu = {}));
              let ek = 0;
              let E = class E extends em.Disposable {
                getAttrData() {
                  return this._curAttrData;
                }
                constructor(
                  eA,
                  el,
                  ec,
                  eu,
                  ed,
                  ep,
                  em,
                  ew,
                  e_ = new ef.EscapeSequenceParser(),
                ) {
                  for (const ef in (super(),
                  (this._bufferService = eA),
                  (this._charsetService = el),
                  (this._coreService = ec),
                  (this._logService = eu),
                  (this._optionsService = ed),
                  (this._oscLinkService = ep),
                  (this._coreMouseService = em),
                  (this._unicodeService = ew),
                  (this._parser = e_),
                  (this._parseBuffer = new Uint32Array(4096)),
                  (this._stringDecoder = new eE.StringToUtf32()),
                  (this._utf8Decoder = new eE.Utf8ToUtf32()),
                  (this._workCell = new eB.CellData()),
                  (this._windowTitle = ""),
                  (this._iconName = ""),
                  (this._windowTitleStack = []),
                  (this._iconNameStack = []),
                  (this._curAttrData = eC.DEFAULT_ATTR_DATA.clone()),
                  (this._eraseAttrDataInternal = eC.DEFAULT_ATTR_DATA.clone()),
                  (this._onRequestBell = this.register(new ey.EventEmitter())),
                  (this.onRequestBell = this._onRequestBell.event),
                  (this._onRequestRefreshRows = this.register(
                    new ey.EventEmitter(),
                  )),
                  (this.onRequestRefreshRows =
                    this._onRequestRefreshRows.event),
                  (this._onRequestReset = this.register(new ey.EventEmitter())),
                  (this.onRequestReset = this._onRequestReset.event),
                  (this._onRequestSendFocus = this.register(
                    new ey.EventEmitter(),
                  )),
                  (this.onRequestSendFocus = this._onRequestSendFocus.event),
                  (this._onRequestSyncScrollBar = this.register(
                    new ey.EventEmitter(),
                  )),
                  (this.onRequestSyncScrollBar =
                    this._onRequestSyncScrollBar.event),
                  (this._onRequestWindowsOptionsReport = this.register(
                    new ey.EventEmitter(),
                  )),
                  (this.onRequestWindowsOptionsReport =
                    this._onRequestWindowsOptionsReport.event),
                  (this._onA11yChar = this.register(new ey.EventEmitter())),
                  (this.onA11yChar = this._onA11yChar.event),
                  (this._onA11yTab = this.register(new ey.EventEmitter())),
                  (this.onA11yTab = this._onA11yTab.event),
                  (this._onCursorMove = this.register(new ey.EventEmitter())),
                  (this.onCursorMove = this._onCursorMove.event),
                  (this._onLineFeed = this.register(new ey.EventEmitter())),
                  (this.onLineFeed = this._onLineFeed.event),
                  (this._onScroll = this.register(new ey.EventEmitter())),
                  (this.onScroll = this._onScroll.event),
                  (this._onTitleChange = this.register(new ey.EventEmitter())),
                  (this.onTitleChange = this._onTitleChange.event),
                  (this._onColor = this.register(new ey.EventEmitter())),
                  (this.onColor = this._onColor.event),
                  (this._parseStack = {
                    paused: !1,
                    cursorStartX: 0,
                    cursorStartY: 0,
                    decodedLength: 0,
                    position: 0,
                  }),
                  (this._specialColors = [256, 257, 258]),
                  this.register(this._parser),
                  (this._dirtyRowTracker = new eM(this._bufferService)),
                  (this._activeBuffer = this._bufferService.buffer),
                  this.register(
                    this._bufferService.buffers.onBufferActivate(
                      (eA) => (this._activeBuffer = eA.activeBuffer),
                    ),
                  ),
                  this._parser.setCsiHandlerFallback((eA, el) => {
                    this._logService.debug("Unknown CSI code: ", {
                      identifier: this._parser.identToString(eA),
                      params: el.toArray(),
                    });
                  }),
                  this._parser.setEscHandlerFallback((eA) => {
                    this._logService.debug("Unknown ESC code: ", {
                      identifier: this._parser.identToString(eA),
                    });
                  }),
                  this._parser.setExecuteHandlerFallback((eA) => {
                    this._logService.debug("Unknown EXECUTE code: ", {
                      code: eA,
                    });
                  }),
                  this._parser.setOscHandlerFallback((eA, el, ec) => {
                    this._logService.debug("Unknown OSC code: ", {
                      identifier: eA,
                      action: el,
                      data: ec,
                    });
                  }),
                  this._parser.setDcsHandlerFallback((eA, el, ec) => {
                    ("HOOK" === el && (ec = ec.toArray()),
                      this._logService.debug("Unknown DCS code: ", {
                        identifier: this._parser.identToString(eA),
                        action: el,
                        payload: ec,
                      }));
                  }),
                  this._parser.setPrintHandler((eA, el, ec) =>
                    this.print(eA, el, ec),
                  ),
                  this._parser.registerCsiHandler({ final: "@" }, (eA) =>
                    this.insertChars(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: " ", final: "@" },
                    (eA) => this.scrollLeft(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "A" }, (eA) =>
                    this.cursorUp(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: " ", final: "A" },
                    (eA) => this.scrollRight(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "B" }, (eA) =>
                    this.cursorDown(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "C" }, (eA) =>
                    this.cursorForward(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "D" }, (eA) =>
                    this.cursorBackward(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "E" }, (eA) =>
                    this.cursorNextLine(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "F" }, (eA) =>
                    this.cursorPrecedingLine(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "G" }, (eA) =>
                    this.cursorCharAbsolute(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "H" }, (eA) =>
                    this.cursorPosition(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "I" }, (eA) =>
                    this.cursorForwardTab(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "J" }, (eA) =>
                    this.eraseInDisplay(eA, !1),
                  ),
                  this._parser.registerCsiHandler(
                    { prefix: "?", final: "J" },
                    (eA) => this.eraseInDisplay(eA, !0),
                  ),
                  this._parser.registerCsiHandler({ final: "K" }, (eA) =>
                    this.eraseInLine(eA, !1),
                  ),
                  this._parser.registerCsiHandler(
                    { prefix: "?", final: "K" },
                    (eA) => this.eraseInLine(eA, !0),
                  ),
                  this._parser.registerCsiHandler({ final: "L" }, (eA) =>
                    this.insertLines(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "M" }, (eA) =>
                    this.deleteLines(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "P" }, (eA) =>
                    this.deleteChars(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "S" }, (eA) =>
                    this.scrollUp(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "T" }, (eA) =>
                    this.scrollDown(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "X" }, (eA) =>
                    this.eraseChars(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "Z" }, (eA) =>
                    this.cursorBackwardTab(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "`" }, (eA) =>
                    this.charPosAbsolute(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "a" }, (eA) =>
                    this.hPositionRelative(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "b" }, (eA) =>
                    this.repeatPrecedingCharacter(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "c" }, (eA) =>
                    this.sendDeviceAttributesPrimary(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { prefix: ">", final: "c" },
                    (eA) => this.sendDeviceAttributesSecondary(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "d" }, (eA) =>
                    this.linePosAbsolute(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "e" }, (eA) =>
                    this.vPositionRelative(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "f" }, (eA) =>
                    this.hVPosition(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "g" }, (eA) =>
                    this.tabClear(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "h" }, (eA) =>
                    this.setMode(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { prefix: "?", final: "h" },
                    (eA) => this.setModePrivate(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "l" }, (eA) =>
                    this.resetMode(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { prefix: "?", final: "l" },
                    (eA) => this.resetModePrivate(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "m" }, (eA) =>
                    this.charAttributes(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "n" }, (eA) =>
                    this.deviceStatus(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { prefix: "?", final: "n" },
                    (eA) => this.deviceStatusPrivate(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: "!", final: "p" },
                    (eA) => this.softReset(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: " ", final: "q" },
                    (eA) => this.setCursorStyle(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "r" }, (eA) =>
                    this.setScrollRegion(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "s" }, (eA) =>
                    this.saveCursor(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "t" }, (eA) =>
                    this.windowOptions(eA),
                  ),
                  this._parser.registerCsiHandler({ final: "u" }, (eA) =>
                    this.restoreCursor(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: "'", final: "}" },
                    (eA) => this.insertColumns(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: "'", final: "~" },
                    (eA) => this.deleteColumns(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: '"', final: "q" },
                    (eA) => this.selectProtected(eA),
                  ),
                  this._parser.registerCsiHandler(
                    { intermediates: "$", final: "p" },
                    (eA) => this.requestMode(eA, !0),
                  ),
                  this._parser.registerCsiHandler(
                    { prefix: "?", intermediates: "$", final: "p" },
                    (eA) => this.requestMode(eA, !1),
                  ),
                  this._parser.setExecuteHandler(eg.C0.BEL, () => this.bell()),
                  this._parser.setExecuteHandler(eg.C0.LF, () =>
                    this.lineFeed(),
                  ),
                  this._parser.setExecuteHandler(eg.C0.VT, () =>
                    this.lineFeed(),
                  ),
                  this._parser.setExecuteHandler(eg.C0.FF, () =>
                    this.lineFeed(),
                  ),
                  this._parser.setExecuteHandler(eg.C0.CR, () =>
                    this.carriageReturn(),
                  ),
                  this._parser.setExecuteHandler(eg.C0.BS, () =>
                    this.backspace(),
                  ),
                  this._parser.setExecuteHandler(eg.C0.HT, () => this.tab()),
                  this._parser.setExecuteHandler(eg.C0.SO, () =>
                    this.shiftOut(),
                  ),
                  this._parser.setExecuteHandler(eg.C0.SI, () =>
                    this.shiftIn(),
                  ),
                  this._parser.setExecuteHandler(eg.C1.IND, () => this.index()),
                  this._parser.setExecuteHandler(eg.C1.NEL, () =>
                    this.nextLine(),
                  ),
                  this._parser.setExecuteHandler(eg.C1.HTS, () =>
                    this.tabSet(),
                  ),
                  this._parser.registerOscHandler(
                    0,
                    new eS.OscHandler(
                      (eA) => (this.setTitle(eA), this.setIconName(eA), !0),
                    ),
                  ),
                  this._parser.registerOscHandler(
                    1,
                    new eS.OscHandler((eA) => this.setIconName(eA)),
                  ),
                  this._parser.registerOscHandler(
                    2,
                    new eS.OscHandler((eA) => this.setTitle(eA)),
                  ),
                  this._parser.registerOscHandler(
                    4,
                    new eS.OscHandler((eA) => this.setOrReportIndexedColor(eA)),
                  ),
                  this._parser.registerOscHandler(
                    8,
                    new eS.OscHandler((eA) => this.setHyperlink(eA)),
                  ),
                  this._parser.registerOscHandler(
                    10,
                    new eS.OscHandler((eA) => this.setOrReportFgColor(eA)),
                  ),
                  this._parser.registerOscHandler(
                    11,
                    new eS.OscHandler((eA) => this.setOrReportBgColor(eA)),
                  ),
                  this._parser.registerOscHandler(
                    12,
                    new eS.OscHandler((eA) => this.setOrReportCursorColor(eA)),
                  ),
                  this._parser.registerOscHandler(
                    104,
                    new eS.OscHandler((eA) => this.restoreIndexedColor(eA)),
                  ),
                  this._parser.registerOscHandler(
                    110,
                    new eS.OscHandler((eA) => this.restoreFgColor(eA)),
                  ),
                  this._parser.registerOscHandler(
                    111,
                    new eS.OscHandler((eA) => this.restoreBgColor(eA)),
                  ),
                  this._parser.registerOscHandler(
                    112,
                    new eS.OscHandler((eA) => this.restoreCursorColor(eA)),
                  ),
                  this._parser.registerEscHandler({ final: "7" }, () =>
                    this.saveCursor(),
                  ),
                  this._parser.registerEscHandler({ final: "8" }, () =>
                    this.restoreCursor(),
                  ),
                  this._parser.registerEscHandler({ final: "D" }, () =>
                    this.index(),
                  ),
                  this._parser.registerEscHandler({ final: "E" }, () =>
                    this.nextLine(),
                  ),
                  this._parser.registerEscHandler({ final: "H" }, () =>
                    this.tabSet(),
                  ),
                  this._parser.registerEscHandler({ final: "M" }, () =>
                    this.reverseIndex(),
                  ),
                  this._parser.registerEscHandler({ final: "=" }, () =>
                    this.keypadApplicationMode(),
                  ),
                  this._parser.registerEscHandler({ final: ">" }, () =>
                    this.keypadNumericMode(),
                  ),
                  this._parser.registerEscHandler({ final: "c" }, () =>
                    this.fullReset(),
                  ),
                  this._parser.registerEscHandler({ final: "n" }, () =>
                    this.setgLevel(2),
                  ),
                  this._parser.registerEscHandler({ final: "o" }, () =>
                    this.setgLevel(3),
                  ),
                  this._parser.registerEscHandler({ final: "|" }, () =>
                    this.setgLevel(3),
                  ),
                  this._parser.registerEscHandler({ final: "}" }, () =>
                    this.setgLevel(2),
                  ),
                  this._parser.registerEscHandler({ final: "~" }, () =>
                    this.setgLevel(1),
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: "%", final: "@" },
                    () => this.selectDefaultCharset(),
                  ),
                  this._parser.registerEscHandler(
                    { intermediates: "%", final: "G" },
                    () => this.selectDefaultCharset(),
                  ),
                  eh.CHARSETS))
                    (this._parser.registerEscHandler(
                      { intermediates: "(", final: ef },
                      () => this.selectCharset("(" + ef),
                    ),
                      this._parser.registerEscHandler(
                        { intermediates: ")", final: ef },
                        () => this.selectCharset(")" + ef),
                      ),
                      this._parser.registerEscHandler(
                        { intermediates: "*", final: ef },
                        () => this.selectCharset("*" + ef),
                      ),
                      this._parser.registerEscHandler(
                        { intermediates: "+", final: ef },
                        () => this.selectCharset("+" + ef),
                      ),
                      this._parser.registerEscHandler(
                        { intermediates: "-", final: ef },
                        () => this.selectCharset("-" + ef),
                      ),
                      this._parser.registerEscHandler(
                        { intermediates: ".", final: ef },
                        () => this.selectCharset("." + ef),
                      ),
                      this._parser.registerEscHandler(
                        { intermediates: "/", final: ef },
                        () => this.selectCharset("/" + ef),
                      ));
                  (this._parser.registerEscHandler(
                    { intermediates: "#", final: "8" },
                    () => this.screenAlignmentPattern(),
                  ),
                    this._parser.setErrorHandler(
                      (eA) => (
                        this._logService.error("Parsing error: ", eA),
                        eA
                      ),
                    ),
                    this._parser.registerDcsHandler(
                      { intermediates: "$", final: "q" },
                      new eQ.DcsHandler((eA, el) =>
                        this.requestStatusString(eA, el),
                      ),
                    ));
                }
                _preserveStack(eA, el, ec, eu) {
                  ((this._parseStack.paused = !0),
                    (this._parseStack.cursorStartX = eA),
                    (this._parseStack.cursorStartY = el),
                    (this._parseStack.decodedLength = ec),
                    (this._parseStack.position = eu));
                }
                _logSlowResolvingAsync(eA) {
                  this._logService.logLevel <= eI.LogLevelEnum.WARN &&
                    Promise.race([
                      eA,
                      new Promise((eA, el) =>
                        setTimeout(() => el("#SLOW_TIMEOUT"), 5e3),
                      ),
                    ]).catch((eA) => {
                      if ("#SLOW_TIMEOUT" !== eA) throw eA;
                      console.warn(
                        "async parser handler taking longer than 5000 ms",
                      );
                    });
                }
                _getCurrentLinkId() {
                  return this._curAttrData.extended.urlId;
                }
                parse(eA, el) {
                  let ec,
                    eu = this._activeBuffer.x,
                    ed = this._activeBuffer.y,
                    ep = 0,
                    eg = this._parseStack.paused;
                  if (eg) {
                    if (
                      (ec = this._parser.parse(
                        this._parseBuffer,
                        this._parseStack.decodedLength,
                        el,
                      ))
                    )
                      return (this._logSlowResolvingAsync(ec), ec);
                    ((eu = this._parseStack.cursorStartX),
                      (ed = this._parseStack.cursorStartY),
                      (this._parseStack.paused = !1),
                      eA.length > eR && (ep = this._parseStack.position + eR));
                  }
                  if (
                    (this._logService.logLevel <= eI.LogLevelEnum.DEBUG &&
                      this._logService.debug(
                        "parsing data" +
                          ("string" == typeof eA
                            ? ` "${eA}"`
                            : ` "${Array.prototype.map.call(eA, (eA) => String.fromCharCode(eA)).join("")}"`),
                        "string" == typeof eA
                          ? eA.split("").map((eA) => eA.charCodeAt(0))
                          : eA,
                      ),
                    this._parseBuffer.length < eA.length &&
                      this._parseBuffer.length < eR &&
                      (this._parseBuffer = new Uint32Array(
                        Math.min(eA.length, eR),
                      )),
                    eg || this._dirtyRowTracker.clearRange(),
                    eA.length > eR)
                  )
                    for (let el = ep; el < eA.length; el += eR) {
                      let ep = el + eR < eA.length ? el + eR : eA.length,
                        eg =
                          "string" == typeof eA
                            ? this._stringDecoder.decode(
                                eA.substring(el, ep),
                                this._parseBuffer,
                              )
                            : this._utf8Decoder.decode(
                                eA.subarray(el, ep),
                                this._parseBuffer,
                              );
                      if ((ec = this._parser.parse(this._parseBuffer, eg)))
                        return (
                          this._preserveStack(eu, ed, eg, el),
                          this._logSlowResolvingAsync(ec),
                          ec
                        );
                    }
                  else if (!eg) {
                    let el =
                      "string" == typeof eA
                        ? this._stringDecoder.decode(eA, this._parseBuffer)
                        : this._utf8Decoder.decode(eA, this._parseBuffer);
                    if ((ec = this._parser.parse(this._parseBuffer, el)))
                      return (
                        this._preserveStack(eu, ed, el, 0),
                        this._logSlowResolvingAsync(ec),
                        ec
                      );
                  }
                  (this._activeBuffer.x === eu &&
                    this._activeBuffer.y === ed) ||
                    this._onCursorMove.fire();
                  let eh =
                      this._dirtyRowTracker.end +
                      (this._bufferService.buffer.ybase -
                        this._bufferService.buffer.ydisp),
                    ef =
                      this._dirtyRowTracker.start +
                      (this._bufferService.buffer.ybase -
                        this._bufferService.buffer.ydisp);
                  ef < this._bufferService.rows &&
                    this._onRequestRefreshRows.fire(
                      Math.min(ef, this._bufferService.rows - 1),
                      Math.min(eh, this._bufferService.rows - 1),
                    );
                }
                print(eA, el, ec) {
                  let eu,
                    ed,
                    ep = this._charsetService.charset,
                    eg = this._optionsService.rawOptions.screenReaderMode,
                    eh = this._bufferService.cols,
                    ef = this._coreService.decPrivateModes.wraparound,
                    em = this._coreService.modes.insertMode,
                    ey = this._curAttrData,
                    eB = this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + this._activeBuffer.y,
                    );
                  (this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                    this._activeBuffer.x &&
                      ec - el > 0 &&
                      2 === eB.getWidth(this._activeBuffer.x - 1) &&
                      eB.setCellFromCodepoint(
                        this._activeBuffer.x - 1,
                        0,
                        1,
                        ey,
                      ));
                  let e_ = this._parser.precedingJoinState;
                  for (let eI = el; eI < ec; ++eI) {
                    if ((eu = eA[eI]) < 127 && ep) {
                      let eA = ep[String.fromCharCode(eu)];
                      eA && (eu = eA.charCodeAt(0));
                    }
                    let el = this._unicodeService.charProperties(eu, e_);
                    ed = ev.UnicodeService.extractWidth(el);
                    let ec = ev.UnicodeService.extractShouldJoin(el),
                      eS = ec ? ev.UnicodeService.extractWidth(e_) : 0;
                    if (
                      ((e_ = el),
                      eg &&
                        this._onA11yChar.fire((0, eE.stringFromCodePoint)(eu)),
                      this._getCurrentLinkId() &&
                        this._oscLinkService.addLineToLink(
                          this._getCurrentLinkId(),
                          this._activeBuffer.ybase + this._activeBuffer.y,
                        ),
                      this._activeBuffer.x + ed - eS > eh)
                    ) {
                      if (ef) {
                        let eA = eB,
                          el = this._activeBuffer.x - eS;
                        for (
                          this._activeBuffer.x = eS,
                            this._activeBuffer.y++,
                            this._activeBuffer.y ===
                            this._activeBuffer.scrollBottom + 1
                              ? (this._activeBuffer.y--,
                                this._bufferService.scroll(
                                  this._eraseAttrData(),
                                  !0,
                                ))
                              : (this._activeBuffer.y >=
                                  this._bufferService.rows &&
                                  (this._activeBuffer.y =
                                    this._bufferService.rows - 1),
                                (this._activeBuffer.lines.get(
                                  this._activeBuffer.ybase +
                                    this._activeBuffer.y,
                                ).isWrapped = !0)),
                            eB = this._activeBuffer.lines.get(
                              this._activeBuffer.ybase + this._activeBuffer.y,
                            ),
                            eS > 0 &&
                              eB instanceof eC.BufferLine &&
                              eB.copyCellsFrom(eA, el, 0, eS, !1);
                          el < eh;

                        )
                          eA.setCellFromCodepoint(el++, 0, 1, ey);
                      } else if (((this._activeBuffer.x = eh - 1), 2 === ed))
                        continue;
                    }
                    if (ec && this._activeBuffer.x) {
                      let eA = eB.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
                      eB.addCodepointToCell(this._activeBuffer.x - eA, eu, ed);
                      for (let eA = ed - eS; --eA >= 0; )
                        eB.setCellFromCodepoint(
                          this._activeBuffer.x++,
                          0,
                          0,
                          ey,
                        );
                    } else if (
                      (em &&
                        (eB.insertCells(
                          this._activeBuffer.x,
                          ed - eS,
                          this._activeBuffer.getNullCell(ey),
                        ),
                        2 === eB.getWidth(eh - 1) &&
                          eB.setCellFromCodepoint(
                            eh - 1,
                            ew.NULL_CELL_CODE,
                            ew.NULL_CELL_WIDTH,
                            ey,
                          )),
                      eB.setCellFromCodepoint(
                        this._activeBuffer.x++,
                        eu,
                        ed,
                        ey,
                      ),
                      ed > 0)
                    )
                      for (; --ed; )
                        eB.setCellFromCodepoint(
                          this._activeBuffer.x++,
                          0,
                          0,
                          ey,
                        );
                  }
                  ((this._parser.precedingJoinState = e_),
                    this._activeBuffer.x < eh &&
                      ec - el > 0 &&
                      0 === eB.getWidth(this._activeBuffer.x) &&
                      !eB.hasContent(this._activeBuffer.x) &&
                      eB.setCellFromCodepoint(this._activeBuffer.x, 0, 1, ey),
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y));
                }
                registerCsiHandler(eA, el) {
                  return "t" !== eA.final || eA.prefix || eA.intermediates
                    ? this._parser.registerCsiHandler(eA, el)
                    : this._parser.registerCsiHandler(
                        eA,
                        (eA) =>
                          !y(
                            eA.params[0],
                            this._optionsService.rawOptions.windowOptions,
                          ) || el(eA),
                      );
                }
                registerDcsHandler(eA, el) {
                  return this._parser.registerDcsHandler(
                    eA,
                    new eQ.DcsHandler(el),
                  );
                }
                registerEscHandler(eA, el) {
                  return this._parser.registerEscHandler(eA, el);
                }
                registerOscHandler(eA, el) {
                  return this._parser.registerOscHandler(
                    eA,
                    new eS.OscHandler(el),
                  );
                }
                bell() {
                  return (this._onRequestBell.fire(), !0);
                }
                lineFeed() {
                  return (
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                    this._optionsService.rawOptions.convertEol &&
                      (this._activeBuffer.x = 0),
                    this._activeBuffer.y++,
                    this._activeBuffer.y === this._activeBuffer.scrollBottom + 1
                      ? (this._activeBuffer.y--,
                        this._bufferService.scroll(this._eraseAttrData()))
                      : this._activeBuffer.y >= this._bufferService.rows
                        ? (this._activeBuffer.y = this._bufferService.rows - 1)
                        : (this._activeBuffer.lines.get(
                            this._activeBuffer.ybase + this._activeBuffer.y,
                          ).isWrapped = !1),
                    this._activeBuffer.x >= this._bufferService.cols &&
                      this._activeBuffer.x--,
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                    this._onLineFeed.fire(),
                    !0
                  );
                }
                carriageReturn() {
                  return ((this._activeBuffer.x = 0), !0);
                }
                backspace() {
                  if (!this._coreService.decPrivateModes.reverseWraparound)
                    return (
                      this._restrictCursor(),
                      this._activeBuffer.x > 0 && this._activeBuffer.x--,
                      !0
                    );
                  if (
                    (this._restrictCursor(this._bufferService.cols),
                    this._activeBuffer.x > 0)
                  )
                    this._activeBuffer.x--;
                  else if (
                    0 === this._activeBuffer.x &&
                    this._activeBuffer.y > this._activeBuffer.scrollTop &&
                    this._activeBuffer.y <= this._activeBuffer.scrollBottom &&
                    this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + this._activeBuffer.y,
                    )?.isWrapped
                  ) {
                    ((this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + this._activeBuffer.y,
                    ).isWrapped = !1),
                      this._activeBuffer.y--,
                      (this._activeBuffer.x = this._bufferService.cols - 1));
                    let eA = this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + this._activeBuffer.y,
                    );
                    eA.hasWidth(this._activeBuffer.x) &&
                      !eA.hasContent(this._activeBuffer.x) &&
                      this._activeBuffer.x--;
                  }
                  return (this._restrictCursor(), !0);
                }
                tab() {
                  if (this._activeBuffer.x >= this._bufferService.cols)
                    return !0;
                  let eA = this._activeBuffer.x;
                  return (
                    (this._activeBuffer.x = this._activeBuffer.nextStop()),
                    this._optionsService.rawOptions.screenReaderMode &&
                      this._onA11yTab.fire(this._activeBuffer.x - eA),
                    !0
                  );
                }
                shiftOut() {
                  return (this._charsetService.setgLevel(1), !0);
                }
                shiftIn() {
                  return (this._charsetService.setgLevel(0), !0);
                }
                _restrictCursor(eA = this._bufferService.cols - 1) {
                  ((this._activeBuffer.x = Math.min(
                    eA,
                    Math.max(0, this._activeBuffer.x),
                  )),
                    (this._activeBuffer.y = this._coreService.decPrivateModes
                      .origin
                      ? Math.min(
                          this._activeBuffer.scrollBottom,
                          Math.max(
                            this._activeBuffer.scrollTop,
                            this._activeBuffer.y,
                          ),
                        )
                      : Math.min(
                          this._bufferService.rows - 1,
                          Math.max(0, this._activeBuffer.y),
                        )),
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y));
                }
                _setCursor(eA, el) {
                  (this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                    this._coreService.decPrivateModes.origin
                      ? ((this._activeBuffer.x = eA),
                        (this._activeBuffer.y =
                          this._activeBuffer.scrollTop + el))
                      : ((this._activeBuffer.x = eA),
                        (this._activeBuffer.y = el)),
                    this._restrictCursor(),
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y));
                }
                _moveCursor(eA, el) {
                  (this._restrictCursor(),
                    this._setCursor(
                      this._activeBuffer.x + eA,
                      this._activeBuffer.y + el,
                    ));
                }
                cursorUp(eA) {
                  let el = this._activeBuffer.y - this._activeBuffer.scrollTop;
                  return (
                    el >= 0
                      ? this._moveCursor(0, -Math.min(el, eA.params[0] || 1))
                      : this._moveCursor(0, -(eA.params[0] || 1)),
                    !0
                  );
                }
                cursorDown(eA) {
                  let el =
                    this._activeBuffer.scrollBottom - this._activeBuffer.y;
                  return (
                    el >= 0
                      ? this._moveCursor(0, Math.min(el, eA.params[0] || 1))
                      : this._moveCursor(0, eA.params[0] || 1),
                    !0
                  );
                }
                cursorForward(eA) {
                  return (this._moveCursor(eA.params[0] || 1, 0), !0);
                }
                cursorBackward(eA) {
                  return (this._moveCursor(-(eA.params[0] || 1), 0), !0);
                }
                cursorNextLine(eA) {
                  return (this.cursorDown(eA), (this._activeBuffer.x = 0), !0);
                }
                cursorPrecedingLine(eA) {
                  return (this.cursorUp(eA), (this._activeBuffer.x = 0), !0);
                }
                cursorCharAbsolute(eA) {
                  return (
                    this._setCursor(
                      (eA.params[0] || 1) - 1,
                      this._activeBuffer.y,
                    ),
                    !0
                  );
                }
                cursorPosition(eA) {
                  return (
                    this._setCursor(
                      eA.length >= 2 ? (eA.params[1] || 1) - 1 : 0,
                      (eA.params[0] || 1) - 1,
                    ),
                    !0
                  );
                }
                charPosAbsolute(eA) {
                  return (
                    this._setCursor(
                      (eA.params[0] || 1) - 1,
                      this._activeBuffer.y,
                    ),
                    !0
                  );
                }
                hPositionRelative(eA) {
                  return (this._moveCursor(eA.params[0] || 1, 0), !0);
                }
                linePosAbsolute(eA) {
                  return (
                    this._setCursor(
                      this._activeBuffer.x,
                      (eA.params[0] || 1) - 1,
                    ),
                    !0
                  );
                }
                vPositionRelative(eA) {
                  return (this._moveCursor(0, eA.params[0] || 1), !0);
                }
                hVPosition(eA) {
                  return (this.cursorPosition(eA), !0);
                }
                tabClear(eA) {
                  let el = eA.params[0];
                  return (
                    0 === el
                      ? delete this._activeBuffer.tabs[this._activeBuffer.x]
                      : 3 === el && (this._activeBuffer.tabs = {}),
                    !0
                  );
                }
                cursorForwardTab(eA) {
                  if (this._activeBuffer.x >= this._bufferService.cols)
                    return !0;
                  let el = eA.params[0] || 1;
                  for (; el--; )
                    this._activeBuffer.x = this._activeBuffer.nextStop();
                  return !0;
                }
                cursorBackwardTab(eA) {
                  if (this._activeBuffer.x >= this._bufferService.cols)
                    return !0;
                  let el = eA.params[0] || 1;
                  for (; el--; )
                    this._activeBuffer.x = this._activeBuffer.prevStop();
                  return !0;
                }
                selectProtected(eA) {
                  let el = eA.params[0];
                  return (
                    1 === el && (this._curAttrData.bg |= 0x20000000),
                    (2 !== el && 0 !== el) ||
                      (this._curAttrData.bg &= -0x20000001),
                    !0
                  );
                }
                _eraseInBufferLine(eA, el, ec, eu = !1, ed = !1) {
                  let ep = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + eA,
                  );
                  (ep.replaceCells(
                    el,
                    ec,
                    this._activeBuffer.getNullCell(this._eraseAttrData()),
                    ed,
                  ),
                    eu && (ep.isWrapped = !1));
                }
                _resetBufferLine(eA, el = !1) {
                  let ec = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + eA,
                  );
                  ec &&
                    (ec.fill(
                      this._activeBuffer.getNullCell(this._eraseAttrData()),
                      el,
                    ),
                    this._bufferService.buffer.clearMarkers(
                      this._activeBuffer.ybase + eA,
                    ),
                    (ec.isWrapped = !1));
                }
                eraseInDisplay(eA, el = !1) {
                  let ec;
                  switch (
                    (this._restrictCursor(this._bufferService.cols),
                    eA.params[0])
                  ) {
                    case 0:
                      for (
                        ec = this._activeBuffer.y,
                          this._dirtyRowTracker.markDirty(ec),
                          this._eraseInBufferLine(
                            ec++,
                            this._activeBuffer.x,
                            this._bufferService.cols,
                            0 === this._activeBuffer.x,
                            el,
                          );
                        ec < this._bufferService.rows;
                        ec++
                      )
                        this._resetBufferLine(ec, el);
                      this._dirtyRowTracker.markDirty(ec);
                      break;
                    case 1:
                      for (
                        ec = this._activeBuffer.y,
                          this._dirtyRowTracker.markDirty(ec),
                          this._eraseInBufferLine(
                            ec,
                            0,
                            this._activeBuffer.x + 1,
                            !0,
                            el,
                          ),
                          this._activeBuffer.x + 1 >=
                            this._bufferService.cols &&
                            (this._activeBuffer.lines.get(ec + 1).isWrapped =
                              !1);
                        ec--;

                      )
                        this._resetBufferLine(ec, el);
                      this._dirtyRowTracker.markDirty(0);
                      break;
                    case 2:
                      for (
                        ec = this._bufferService.rows,
                          this._dirtyRowTracker.markDirty(ec - 1);
                        ec--;

                      )
                        this._resetBufferLine(ec, el);
                      this._dirtyRowTracker.markDirty(0);
                      break;
                    case 3:
                      let eu =
                        this._activeBuffer.lines.length -
                        this._bufferService.rows;
                      eu > 0 &&
                        (this._activeBuffer.lines.trimStart(eu),
                        (this._activeBuffer.ybase = Math.max(
                          this._activeBuffer.ybase - eu,
                          0,
                        )),
                        (this._activeBuffer.ydisp = Math.max(
                          this._activeBuffer.ydisp - eu,
                          0,
                        )),
                        this._onScroll.fire(0));
                  }
                  return !0;
                }
                eraseInLine(eA, el = !1) {
                  switch (
                    (this._restrictCursor(this._bufferService.cols),
                    eA.params[0])
                  ) {
                    case 0:
                      this._eraseInBufferLine(
                        this._activeBuffer.y,
                        this._activeBuffer.x,
                        this._bufferService.cols,
                        0 === this._activeBuffer.x,
                        el,
                      );
                      break;
                    case 1:
                      this._eraseInBufferLine(
                        this._activeBuffer.y,
                        0,
                        this._activeBuffer.x + 1,
                        !1,
                        el,
                      );
                      break;
                    case 2:
                      this._eraseInBufferLine(
                        this._activeBuffer.y,
                        0,
                        this._bufferService.cols,
                        !0,
                        el,
                      );
                  }
                  return (
                    this._dirtyRowTracker.markDirty(this._activeBuffer.y),
                    !0
                  );
                }
                insertLines(eA) {
                  this._restrictCursor();
                  let el = eA.params[0] || 1;
                  if (
                    this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                    this._activeBuffer.y < this._activeBuffer.scrollTop
                  )
                    return !0;
                  let ec = this._activeBuffer.ybase + this._activeBuffer.y,
                    eu =
                      this._bufferService.rows -
                      1 -
                      this._activeBuffer.scrollBottom,
                    ed =
                      this._bufferService.rows -
                      1 +
                      this._activeBuffer.ybase -
                      eu +
                      1;
                  for (; el--; )
                    (this._activeBuffer.lines.splice(ed - 1, 1),
                      this._activeBuffer.lines.splice(
                        ec,
                        0,
                        this._activeBuffer.getBlankLine(this._eraseAttrData()),
                      ));
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.y,
                      this._activeBuffer.scrollBottom,
                    ),
                    (this._activeBuffer.x = 0),
                    !0
                  );
                }
                deleteLines(eA) {
                  let el;
                  this._restrictCursor();
                  let ec = eA.params[0] || 1;
                  if (
                    this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                    this._activeBuffer.y < this._activeBuffer.scrollTop
                  )
                    return !0;
                  let eu = this._activeBuffer.ybase + this._activeBuffer.y;
                  for (
                    el =
                      this._bufferService.rows -
                      1 -
                      this._activeBuffer.scrollBottom,
                      el =
                        this._bufferService.rows -
                        1 +
                        this._activeBuffer.ybase -
                        el;
                    ec--;

                  )
                    (this._activeBuffer.lines.splice(eu, 1),
                      this._activeBuffer.lines.splice(
                        el,
                        0,
                        this._activeBuffer.getBlankLine(this._eraseAttrData()),
                      ));
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.y,
                      this._activeBuffer.scrollBottom,
                    ),
                    (this._activeBuffer.x = 0),
                    !0
                  );
                }
                insertChars(eA) {
                  this._restrictCursor();
                  let el = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + this._activeBuffer.y,
                  );
                  return (
                    el &&
                      (el.insertCells(
                        this._activeBuffer.x,
                        eA.params[0] || 1,
                        this._activeBuffer.getNullCell(this._eraseAttrData()),
                      ),
                      this._dirtyRowTracker.markDirty(this._activeBuffer.y)),
                    !0
                  );
                }
                deleteChars(eA) {
                  this._restrictCursor();
                  let el = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + this._activeBuffer.y,
                  );
                  return (
                    el &&
                      (el.deleteCells(
                        this._activeBuffer.x,
                        eA.params[0] || 1,
                        this._activeBuffer.getNullCell(this._eraseAttrData()),
                      ),
                      this._dirtyRowTracker.markDirty(this._activeBuffer.y)),
                    !0
                  );
                }
                scrollUp(eA) {
                  let el = eA.params[0] || 1;
                  for (; el--; )
                    (this._activeBuffer.lines.splice(
                      this._activeBuffer.ybase + this._activeBuffer.scrollTop,
                      1,
                    ),
                      this._activeBuffer.lines.splice(
                        this._activeBuffer.ybase +
                          this._activeBuffer.scrollBottom,
                        0,
                        this._activeBuffer.getBlankLine(this._eraseAttrData()),
                      ));
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.scrollTop,
                      this._activeBuffer.scrollBottom,
                    ),
                    !0
                  );
                }
                scrollDown(eA) {
                  let el = eA.params[0] || 1;
                  for (; el--; )
                    (this._activeBuffer.lines.splice(
                      this._activeBuffer.ybase +
                        this._activeBuffer.scrollBottom,
                      1,
                    ),
                      this._activeBuffer.lines.splice(
                        this._activeBuffer.ybase + this._activeBuffer.scrollTop,
                        0,
                        this._activeBuffer.getBlankLine(eC.DEFAULT_ATTR_DATA),
                      ));
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.scrollTop,
                      this._activeBuffer.scrollBottom,
                    ),
                    !0
                  );
                }
                scrollLeft(eA) {
                  if (
                    this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                    this._activeBuffer.y < this._activeBuffer.scrollTop
                  )
                    return !0;
                  let el = eA.params[0] || 1;
                  for (
                    let eA = this._activeBuffer.scrollTop;
                    eA <= this._activeBuffer.scrollBottom;
                    ++eA
                  ) {
                    let ec = this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + eA,
                    );
                    (ec.deleteCells(
                      0,
                      el,
                      this._activeBuffer.getNullCell(this._eraseAttrData()),
                    ),
                      (ec.isWrapped = !1));
                  }
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.scrollTop,
                      this._activeBuffer.scrollBottom,
                    ),
                    !0
                  );
                }
                scrollRight(eA) {
                  if (
                    this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                    this._activeBuffer.y < this._activeBuffer.scrollTop
                  )
                    return !0;
                  let el = eA.params[0] || 1;
                  for (
                    let eA = this._activeBuffer.scrollTop;
                    eA <= this._activeBuffer.scrollBottom;
                    ++eA
                  ) {
                    let ec = this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + eA,
                    );
                    (ec.insertCells(
                      0,
                      el,
                      this._activeBuffer.getNullCell(this._eraseAttrData()),
                    ),
                      (ec.isWrapped = !1));
                  }
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.scrollTop,
                      this._activeBuffer.scrollBottom,
                    ),
                    !0
                  );
                }
                insertColumns(eA) {
                  if (
                    this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                    this._activeBuffer.y < this._activeBuffer.scrollTop
                  )
                    return !0;
                  let el = eA.params[0] || 1;
                  for (
                    let eA = this._activeBuffer.scrollTop;
                    eA <= this._activeBuffer.scrollBottom;
                    ++eA
                  ) {
                    let ec = this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + eA,
                    );
                    (ec.insertCells(
                      this._activeBuffer.x,
                      el,
                      this._activeBuffer.getNullCell(this._eraseAttrData()),
                    ),
                      (ec.isWrapped = !1));
                  }
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.scrollTop,
                      this._activeBuffer.scrollBottom,
                    ),
                    !0
                  );
                }
                deleteColumns(eA) {
                  if (
                    this._activeBuffer.y > this._activeBuffer.scrollBottom ||
                    this._activeBuffer.y < this._activeBuffer.scrollTop
                  )
                    return !0;
                  let el = eA.params[0] || 1;
                  for (
                    let eA = this._activeBuffer.scrollTop;
                    eA <= this._activeBuffer.scrollBottom;
                    ++eA
                  ) {
                    let ec = this._activeBuffer.lines.get(
                      this._activeBuffer.ybase + eA,
                    );
                    (ec.deleteCells(
                      this._activeBuffer.x,
                      el,
                      this._activeBuffer.getNullCell(this._eraseAttrData()),
                    ),
                      (ec.isWrapped = !1));
                  }
                  return (
                    this._dirtyRowTracker.markRangeDirty(
                      this._activeBuffer.scrollTop,
                      this._activeBuffer.scrollBottom,
                    ),
                    !0
                  );
                }
                eraseChars(eA) {
                  this._restrictCursor();
                  let el = this._activeBuffer.lines.get(
                    this._activeBuffer.ybase + this._activeBuffer.y,
                  );
                  return (
                    el &&
                      (el.replaceCells(
                        this._activeBuffer.x,
                        this._activeBuffer.x + (eA.params[0] || 1),
                        this._activeBuffer.getNullCell(this._eraseAttrData()),
                      ),
                      this._dirtyRowTracker.markDirty(this._activeBuffer.y)),
                    !0
                  );
                }
                repeatPrecedingCharacter(eA) {
                  let el = this._parser.precedingJoinState;
                  if (!el) return !0;
                  let ec = eA.params[0] || 1,
                    eu = ev.UnicodeService.extractWidth(el),
                    ed = this._activeBuffer.x - eu,
                    ep = this._activeBuffer.lines
                      .get(this._activeBuffer.ybase + this._activeBuffer.y)
                      .getString(ed),
                    eg = new Uint32Array(ep.length * ec),
                    eh = 0;
                  for (let eA = 0; eA < ep.length; ) {
                    let el = ep.codePointAt(eA) || 0;
                    ((eg[eh++] = el), (eA += el > 65535 ? 2 : 1));
                  }
                  let ef = eh;
                  for (let eA = 1; eA < ec; ++eA)
                    (eg.copyWithin(ef, 0, eh), (ef += eh));
                  return (this.print(eg, 0, ef), !0);
                }
                sendDeviceAttributesPrimary(eA) {
                  return (
                    eA.params[0] > 0 ||
                      (this._is("xterm") ||
                      this._is("rxvt-unicode") ||
                      this._is("screen")
                        ? this._coreService.triggerDataEvent(
                            eg.C0.ESC + "[?1;2c",
                          )
                        : this._is("linux") &&
                          this._coreService.triggerDataEvent(
                            eg.C0.ESC + "[?6c",
                          )),
                    !0
                  );
                }
                sendDeviceAttributesSecondary(eA) {
                  return (
                    eA.params[0] > 0 ||
                      (this._is("xterm")
                        ? this._coreService.triggerDataEvent(
                            eg.C0.ESC + "[>0;276;0c",
                          )
                        : this._is("rxvt-unicode")
                          ? this._coreService.triggerDataEvent(
                              eg.C0.ESC + "[>85;95;0c",
                            )
                          : this._is("linux")
                            ? this._coreService.triggerDataEvent(
                                eA.params[0] + "c",
                              )
                            : this._is("screen") &&
                              this._coreService.triggerDataEvent(
                                eg.C0.ESC + "[>83;40003;0c",
                              )),
                    !0
                  );
                }
                _is(eA) {
                  return (
                    0 ===
                    (this._optionsService.rawOptions.termName + "").indexOf(eA)
                  );
                }
                setMode(eA) {
                  for (let el = 0; el < eA.length; el++)
                    switch (eA.params[el]) {
                      case 4:
                        this._coreService.modes.insertMode = !0;
                        break;
                      case 20:
                        this._optionsService.options.convertEol = !0;
                    }
                  return !0;
                }
                setModePrivate(eA) {
                  for (let el = 0; el < eA.length; el++)
                    switch (eA.params[el]) {
                      case 1:
                        this._coreService.decPrivateModes.applicationCursorKeys =
                          !0;
                        break;
                      case 2:
                        (this._charsetService.setgCharset(
                          0,
                          eh.DEFAULT_CHARSET,
                        ),
                          this._charsetService.setgCharset(
                            1,
                            eh.DEFAULT_CHARSET,
                          ),
                          this._charsetService.setgCharset(
                            2,
                            eh.DEFAULT_CHARSET,
                          ),
                          this._charsetService.setgCharset(
                            3,
                            eh.DEFAULT_CHARSET,
                          ));
                        break;
                      case 3:
                        this._optionsService.rawOptions.windowOptions
                          .setWinLines &&
                          (this._bufferService.resize(
                            132,
                            this._bufferService.rows,
                          ),
                          this._onRequestReset.fire());
                        break;
                      case 6:
                        ((this._coreService.decPrivateModes.origin = !0),
                          this._setCursor(0, 0));
                        break;
                      case 7:
                        this._coreService.decPrivateModes.wraparound = !0;
                        break;
                      case 12:
                        this._optionsService.options.cursorBlink = !0;
                        break;
                      case 45:
                        this._coreService.decPrivateModes.reverseWraparound =
                          !0;
                        break;
                      case 66:
                        (this._logService.debug(
                          "Serial port requested application keypad.",
                        ),
                          (this._coreService.decPrivateModes.applicationKeypad =
                            !0),
                          this._onRequestSyncScrollBar.fire());
                        break;
                      case 9:
                        this._coreMouseService.activeProtocol = "X10";
                        break;
                      case 1e3:
                        this._coreMouseService.activeProtocol = "VT200";
                        break;
                      case 1002:
                        this._coreMouseService.activeProtocol = "DRAG";
                        break;
                      case 1003:
                        this._coreMouseService.activeProtocol = "ANY";
                        break;
                      case 1004:
                        ((this._coreService.decPrivateModes.sendFocus = !0),
                          this._onRequestSendFocus.fire());
                        break;
                      case 1005:
                        this._logService.debug(
                          "DECSET 1005 not supported (see #2507)",
                        );
                        break;
                      case 1006:
                        this._coreMouseService.activeEncoding = "SGR";
                        break;
                      case 1015:
                        this._logService.debug(
                          "DECSET 1015 not supported (see #2507)",
                        );
                        break;
                      case 1016:
                        this._coreMouseService.activeEncoding = "SGR_PIXELS";
                        break;
                      case 25:
                        this._coreService.isCursorHidden = !1;
                        break;
                      case 1048:
                        this.saveCursor();
                        break;
                      case 1049:
                        this.saveCursor();
                      case 47:
                      case 1047:
                        (this._bufferService.buffers.activateAltBuffer(
                          this._eraseAttrData(),
                        ),
                          (this._coreService.isCursorInitialized = !0),
                          this._onRequestRefreshRows.fire(
                            0,
                            this._bufferService.rows - 1,
                          ),
                          this._onRequestSyncScrollBar.fire());
                        break;
                      case 2004:
                        this._coreService.decPrivateModes.bracketedPasteMode =
                          !0;
                    }
                  return !0;
                }
                resetMode(eA) {
                  for (let el = 0; el < eA.length; el++)
                    switch (eA.params[el]) {
                      case 4:
                        this._coreService.modes.insertMode = !1;
                        break;
                      case 20:
                        this._optionsService.options.convertEol = !1;
                    }
                  return !0;
                }
                resetModePrivate(eA) {
                  for (let el = 0; el < eA.length; el++)
                    switch (eA.params[el]) {
                      case 1:
                        this._coreService.decPrivateModes.applicationCursorKeys =
                          !1;
                        break;
                      case 3:
                        this._optionsService.rawOptions.windowOptions
                          .setWinLines &&
                          (this._bufferService.resize(
                            80,
                            this._bufferService.rows,
                          ),
                          this._onRequestReset.fire());
                        break;
                      case 6:
                        ((this._coreService.decPrivateModes.origin = !1),
                          this._setCursor(0, 0));
                        break;
                      case 7:
                        this._coreService.decPrivateModes.wraparound = !1;
                        break;
                      case 12:
                        this._optionsService.options.cursorBlink = !1;
                        break;
                      case 45:
                        this._coreService.decPrivateModes.reverseWraparound =
                          !1;
                        break;
                      case 66:
                        (this._logService.debug(
                          "Switching back to normal keypad.",
                        ),
                          (this._coreService.decPrivateModes.applicationKeypad =
                            !1),
                          this._onRequestSyncScrollBar.fire());
                        break;
                      case 9:
                      case 1e3:
                      case 1002:
                      case 1003:
                        this._coreMouseService.activeProtocol = "NONE";
                        break;
                      case 1004:
                        this._coreService.decPrivateModes.sendFocus = !1;
                        break;
                      case 1005:
                        this._logService.debug(
                          "DECRST 1005 not supported (see #2507)",
                        );
                        break;
                      case 1006:
                      case 1016:
                        this._coreMouseService.activeEncoding = "DEFAULT";
                        break;
                      case 1015:
                        this._logService.debug(
                          "DECRST 1015 not supported (see #2507)",
                        );
                        break;
                      case 25:
                        this._coreService.isCursorHidden = !0;
                        break;
                      case 1048:
                        this.restoreCursor();
                        break;
                      case 1049:
                      case 47:
                      case 1047:
                        (this._bufferService.buffers.activateNormalBuffer(),
                          1049 === eA.params[el] && this.restoreCursor(),
                          (this._coreService.isCursorInitialized = !0),
                          this._onRequestRefreshRows.fire(
                            0,
                            this._bufferService.rows - 1,
                          ),
                          this._onRequestSyncScrollBar.fire());
                        break;
                      case 2004:
                        this._coreService.decPrivateModes.bracketedPasteMode =
                          !1;
                    }
                  return !0;
                }
                requestMode(eA, el) {
                  var ec, eu;
                  let ed = this._coreService.decPrivateModes,
                    { activeProtocol: ep, activeEncoding: eh } =
                      this._coreMouseService,
                    ef = this._coreService,
                    { buffers: em, cols: eE } = this._bufferService,
                    { active: eC, alt: ey } = em,
                    ew = this._optionsService.rawOptions,
                    d = (eA) => (eA ? 1 : 2),
                    eB = eA.params[0];
                  return (
                    (ec = eB),
                    (eu = el
                      ? 2 === eB
                        ? 4
                        : 4 === eB
                          ? d(ef.modes.insertMode)
                          : 12 === eB
                            ? 3
                            : 20 === eB
                              ? d(ew.convertEol)
                              : 0
                      : 1 === eB
                        ? d(ed.applicationCursorKeys)
                        : 3 === eB
                          ? ew.windowOptions.setWinLines
                            ? 80 === eE
                              ? 2
                              : +(132 === eE)
                            : 0
                          : 6 === eB
                            ? d(ed.origin)
                            : 7 === eB
                              ? d(ed.wraparound)
                              : 8 === eB
                                ? 3
                                : 9 === eB
                                  ? d("X10" === ep)
                                  : 12 === eB
                                    ? d(ew.cursorBlink)
                                    : 25 === eB
                                      ? d(!ef.isCursorHidden)
                                      : 45 === eB
                                        ? d(ed.reverseWraparound)
                                        : 66 === eB
                                          ? d(ed.applicationKeypad)
                                          : 67 === eB
                                            ? 4
                                            : 1e3 === eB
                                              ? d("VT200" === ep)
                                              : 1002 === eB
                                                ? d("DRAG" === ep)
                                                : 1003 === eB
                                                  ? d("ANY" === ep)
                                                  : 1004 === eB
                                                    ? d(ed.sendFocus)
                                                    : 1005 === eB
                                                      ? 4
                                                      : 1006 === eB
                                                        ? d("SGR" === eh)
                                                        : 1015 === eB
                                                          ? 4
                                                          : 1016 === eB
                                                            ? d(
                                                                "SGR_PIXELS" ===
                                                                  eh,
                                                              )
                                                            : 1048 === eB
                                                              ? 1
                                                              : 47 === eB ||
                                                                  1047 === eB ||
                                                                  1049 === eB
                                                                ? d(eC === ey)
                                                                : 2004 === eB
                                                                  ? d(
                                                                      ed.bracketedPasteMode,
                                                                    )
                                                                  : 0),
                    ef.triggerDataEvent(
                      `${eg.C0.ESC}[${el ? "" : "?"}${ec};${eu}$y`,
                    ),
                    !0
                  );
                }
                _updateAttrColor(eA, el, ec, eu, ed) {
                  return (
                    2 === el
                      ? ((eA |= 0x3000000),
                        (eA &= -0x1000000),
                        (eA |= e_.AttributeData.fromColorRGB([ec, eu, ed])))
                      : 5 === el &&
                        ((eA &= -0x3000100), (eA |= 0x2000000 | (255 & ec))),
                    eA
                  );
                }
                _extractColor(eA, el, ec) {
                  let eu = [0, 0, -1, 0, 0, 0],
                    ed = 0,
                    ep = 0;
                  do {
                    if (
                      ((eu[ep + ed] = eA.params[el + ep]),
                      eA.hasSubParams(el + ep))
                    ) {
                      let ec = eA.getSubParams(el + ep),
                        eg = 0;
                      do
                        (5 === eu[1] && (ed = 1),
                          (eu[ep + eg + 1 + ed] = ec[eg]));
                      while (++eg < ec.length && eg + ep + 1 + ed < eu.length);
                      break;
                    }
                    if (
                      (5 === eu[1] && ep + ed >= 2) ||
                      (2 === eu[1] && ep + ed >= 5)
                    )
                      break;
                    eu[1] && (ed = 1);
                  } while (++ep + el < eA.length && ep + ed < eu.length);
                  for (let eA = 2; eA < eu.length; ++eA)
                    -1 === eu[eA] && (eu[eA] = 0);
                  switch (eu[0]) {
                    case 38:
                      ec.fg = this._updateAttrColor(
                        ec.fg,
                        eu[1],
                        eu[3],
                        eu[4],
                        eu[5],
                      );
                      break;
                    case 48:
                      ec.bg = this._updateAttrColor(
                        ec.bg,
                        eu[1],
                        eu[3],
                        eu[4],
                        eu[5],
                      );
                      break;
                    case 58:
                      ((ec.extended = ec.extended.clone()),
                        (ec.extended.underlineColor = this._updateAttrColor(
                          ec.extended.underlineColor,
                          eu[1],
                          eu[3],
                          eu[4],
                          eu[5],
                        )));
                  }
                  return ep;
                }
                _processUnderline(eA, el) {
                  ((el.extended = el.extended.clone()),
                    (!~eA || eA > 5) && (eA = 1),
                    (el.extended.underlineStyle = eA),
                    (el.fg |= 0x10000000),
                    0 === eA && (el.fg &= -0x10000001),
                    el.updateExtended());
                }
                _processSGR0(eA) {
                  ((eA.fg = eC.DEFAULT_ATTR_DATA.fg),
                    (eA.bg = eC.DEFAULT_ATTR_DATA.bg),
                    (eA.extended = eA.extended.clone()),
                    (eA.extended.underlineStyle = 0),
                    (eA.extended.underlineColor &= -0x4000000),
                    eA.updateExtended());
                }
                charAttributes(eA) {
                  let el;
                  if (1 === eA.length && 0 === eA.params[0])
                    return (this._processSGR0(this._curAttrData), !0);
                  let ec = eA.length,
                    eu = this._curAttrData;
                  for (let ed = 0; ed < ec; ed++)
                    (el = eA.params[ed]) >= 30 && el <= 37
                      ? ((eu.fg &= -0x3000100),
                        (eu.fg |= 0x1000000 | (el - 30)))
                      : el >= 40 && el <= 47
                        ? ((eu.bg &= -0x3000100),
                          (eu.bg |= 0x1000000 | (el - 40)))
                        : el >= 90 && el <= 97
                          ? ((eu.fg &= -0x3000100),
                            (eu.fg |= 0x1000008 | (el - 90)))
                          : el >= 100 && el <= 107
                            ? ((eu.bg &= -0x3000100),
                              (eu.bg |= 0x1000008 | (el - 100)))
                            : 0 === el
                              ? this._processSGR0(eu)
                              : 1 === el
                                ? (eu.fg |= 0x8000000)
                                : 3 === el
                                  ? (eu.bg |= 0x4000000)
                                  : 4 === el
                                    ? ((eu.fg |= 0x10000000),
                                      this._processUnderline(
                                        eA.hasSubParams(ed)
                                          ? eA.getSubParams(ed)[0]
                                          : 1,
                                        eu,
                                      ))
                                    : 5 === el
                                      ? (eu.fg |= 0x20000000)
                                      : 7 === el
                                        ? (eu.fg |= 0x4000000)
                                        : 8 === el
                                          ? (eu.fg |= 0x40000000)
                                          : 9 === el
                                            ? (eu.fg |= 0x80000000)
                                            : 2 === el
                                              ? (eu.bg |= 0x8000000)
                                              : 21 === el
                                                ? this._processUnderline(2, eu)
                                                : 22 === el
                                                  ? ((eu.fg &= -0x8000001),
                                                    (eu.bg &= -0x8000001))
                                                  : 23 === el
                                                    ? (eu.bg &= -0x4000001)
                                                    : 24 === el
                                                      ? ((eu.fg &= -0x10000001),
                                                        this._processUnderline(
                                                          0,
                                                          eu,
                                                        ))
                                                      : 25 === el
                                                        ? (eu.fg &= -0x20000001)
                                                        : 27 === el
                                                          ? (eu.fg &=
                                                              -0x4000001)
                                                          : 28 === el
                                                            ? (eu.fg &=
                                                                -0x40000001)
                                                            : 29 === el
                                                              ? (eu.fg &= 0x7fffffff)
                                                              : 39 === el
                                                                ? ((eu.fg &=
                                                                    -0x4000000),
                                                                  (eu.fg |=
                                                                    0xffffff &
                                                                    eC
                                                                      .DEFAULT_ATTR_DATA
                                                                      .fg))
                                                                : 49 === el
                                                                  ? ((eu.bg &=
                                                                      -0x4000000),
                                                                    (eu.bg |=
                                                                      0xffffff &
                                                                      eC
                                                                        .DEFAULT_ATTR_DATA
                                                                        .bg))
                                                                  : 38 === el ||
                                                                      48 ===
                                                                        el ||
                                                                      58 === el
                                                                    ? (ed +=
                                                                        this._extractColor(
                                                                          eA,
                                                                          ed,
                                                                          eu,
                                                                        ))
                                                                    : 53 === el
                                                                      ? (eu.bg |= 0x40000000)
                                                                      : 55 ===
                                                                          el
                                                                        ? (eu.bg &=
                                                                            -0x40000001)
                                                                        : 59 ===
                                                                            el
                                                                          ? ((eu.extended =
                                                                              eu.extended.clone()),
                                                                            (eu.extended.underlineColor =
                                                                              -1),
                                                                            eu.updateExtended())
                                                                          : 100 ===
                                                                              el
                                                                            ? ((eu.fg &=
                                                                                -0x4000000),
                                                                              (eu.fg |=
                                                                                0xffffff &
                                                                                eC
                                                                                  .DEFAULT_ATTR_DATA
                                                                                  .fg),
                                                                              (eu.bg &=
                                                                                -0x4000000),
                                                                              (eu.bg |=
                                                                                0xffffff &
                                                                                eC
                                                                                  .DEFAULT_ATTR_DATA
                                                                                  .bg))
                                                                            : this._logService.debug(
                                                                                "Unknown SGR attribute: %d.",
                                                                                el,
                                                                              );
                  return !0;
                }
                deviceStatus(eA) {
                  switch (eA.params[0]) {
                    case 5:
                      this._coreService.triggerDataEvent(`${eg.C0.ESC}[0n`);
                      break;
                    case 6:
                      let el = this._activeBuffer.y + 1,
                        ec = this._activeBuffer.x + 1;
                      this._coreService.triggerDataEvent(
                        `${eg.C0.ESC}[${el};${ec}R`,
                      );
                  }
                  return !0;
                }
                deviceStatusPrivate(eA) {
                  if (6 === eA.params[0]) {
                    let eA = this._activeBuffer.y + 1,
                      el = this._activeBuffer.x + 1;
                    this._coreService.triggerDataEvent(
                      `${eg.C0.ESC}[?${eA};${el}R`,
                    );
                  }
                  return !0;
                }
                softReset(eA) {
                  return (
                    (this._coreService.isCursorHidden = !1),
                    this._onRequestSyncScrollBar.fire(),
                    (this._activeBuffer.scrollTop = 0),
                    (this._activeBuffer.scrollBottom =
                      this._bufferService.rows - 1),
                    (this._curAttrData = eC.DEFAULT_ATTR_DATA.clone()),
                    this._coreService.reset(),
                    this._charsetService.reset(),
                    (this._activeBuffer.savedX = 0),
                    (this._activeBuffer.savedY = this._activeBuffer.ybase),
                    (this._activeBuffer.savedCurAttrData.fg =
                      this._curAttrData.fg),
                    (this._activeBuffer.savedCurAttrData.bg =
                      this._curAttrData.bg),
                    (this._activeBuffer.savedCharset =
                      this._charsetService.charset),
                    (this._coreService.decPrivateModes.origin = !1),
                    !0
                  );
                }
                setCursorStyle(eA) {
                  let el = eA.params[0] || 1;
                  switch (el) {
                    case 1:
                    case 2:
                      this._optionsService.options.cursorStyle = "block";
                      break;
                    case 3:
                    case 4:
                      this._optionsService.options.cursorStyle = "underline";
                      break;
                    case 5:
                    case 6:
                      this._optionsService.options.cursorStyle = "bar";
                  }
                  let ec = el % 2 == 1;
                  return ((this._optionsService.options.cursorBlink = ec), !0);
                }
                setScrollRegion(eA) {
                  let el,
                    ec = eA.params[0] || 1;
                  return (
                    (eA.length < 2 ||
                      (el = eA.params[1]) > this._bufferService.rows ||
                      0 === el) &&
                      (el = this._bufferService.rows),
                    el > ec &&
                      ((this._activeBuffer.scrollTop = ec - 1),
                      (this._activeBuffer.scrollBottom = el - 1),
                      this._setCursor(0, 0)),
                    !0
                  );
                }
                windowOptions(eA) {
                  if (
                    !y(
                      eA.params[0],
                      this._optionsService.rawOptions.windowOptions,
                    )
                  )
                    return !0;
                  let el = eA.length > 1 ? eA.params[1] : 0;
                  switch (eA.params[0]) {
                    case 14:
                      2 !== el &&
                        this._onRequestWindowsOptionsReport.fire(
                          eu.GET_WIN_SIZE_PIXELS,
                        );
                      break;
                    case 16:
                      this._onRequestWindowsOptionsReport.fire(
                        eu.GET_CELL_SIZE_PIXELS,
                      );
                      break;
                    case 18:
                      this._bufferService &&
                        this._coreService.triggerDataEvent(
                          `${eg.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`,
                        );
                      break;
                    case 22:
                      ((0 !== el && 2 !== el) ||
                        (this._windowTitleStack.push(this._windowTitle),
                        this._windowTitleStack.length > 10 &&
                          this._windowTitleStack.shift()),
                        (0 !== el && 1 !== el) ||
                          (this._iconNameStack.push(this._iconName),
                          this._iconNameStack.length > 10 &&
                            this._iconNameStack.shift()));
                      break;
                    case 23:
                      ((0 !== el && 2 !== el) ||
                        (this._windowTitleStack.length &&
                          this.setTitle(this._windowTitleStack.pop())),
                        (0 !== el && 1 !== el) ||
                          (this._iconNameStack.length &&
                            this.setIconName(this._iconNameStack.pop())));
                  }
                  return !0;
                }
                saveCursor(eA) {
                  return (
                    (this._activeBuffer.savedX = this._activeBuffer.x),
                    (this._activeBuffer.savedY =
                      this._activeBuffer.ybase + this._activeBuffer.y),
                    (this._activeBuffer.savedCurAttrData.fg =
                      this._curAttrData.fg),
                    (this._activeBuffer.savedCurAttrData.bg =
                      this._curAttrData.bg),
                    (this._activeBuffer.savedCharset =
                      this._charsetService.charset),
                    !0
                  );
                }
                restoreCursor(eA) {
                  return (
                    (this._activeBuffer.x = this._activeBuffer.savedX || 0),
                    (this._activeBuffer.y = Math.max(
                      this._activeBuffer.savedY - this._activeBuffer.ybase,
                      0,
                    )),
                    (this._curAttrData.fg =
                      this._activeBuffer.savedCurAttrData.fg),
                    (this._curAttrData.bg =
                      this._activeBuffer.savedCurAttrData.bg),
                    (this._charsetService.charset = this._savedCharset),
                    this._activeBuffer.savedCharset &&
                      (this._charsetService.charset =
                        this._activeBuffer.savedCharset),
                    this._restrictCursor(),
                    !0
                  );
                }
                setTitle(eA) {
                  return (
                    (this._windowTitle = eA),
                    this._onTitleChange.fire(eA),
                    !0
                  );
                }
                setIconName(eA) {
                  return ((this._iconName = eA), !0);
                }
                setOrReportIndexedColor(eA) {
                  let el = [],
                    ec = eA.split(";");
                  for (; ec.length > 1; ) {
                    let eA = ec.shift(),
                      eu = ec.shift();
                    if (/^\d+$/.exec(eA)) {
                      let ec = parseInt(eA);
                      if (L(ec))
                        if ("?" === eu) el.push({ type: 0, index: ec });
                        else {
                          let eA = (0, eD.parseColor)(eu);
                          eA && el.push({ type: 1, index: ec, color: eA });
                        }
                    }
                  }
                  return (el.length && this._onColor.fire(el), !0);
                }
                setHyperlink(eA) {
                  let el = eA.split(";");
                  return (
                    !(el.length < 2) &&
                    (el[1]
                      ? this._createHyperlink(el[0], el[1])
                      : !el[0] && this._finishHyperlink())
                  );
                }
                _createHyperlink(eA, el) {
                  let ec;
                  this._getCurrentLinkId() && this._finishHyperlink();
                  let eu = eA.split(":"),
                    ed = eu.findIndex((eA) => eA.startsWith("id="));
                  return (
                    -1 !== ed && (ec = eu[ed].slice(3) || void 0),
                    (this._curAttrData.extended =
                      this._curAttrData.extended.clone()),
                    (this._curAttrData.extended.urlId =
                      this._oscLinkService.registerLink({ id: ec, uri: el })),
                    this._curAttrData.updateExtended(),
                    !0
                  );
                }
                _finishHyperlink() {
                  return (
                    (this._curAttrData.extended =
                      this._curAttrData.extended.clone()),
                    (this._curAttrData.extended.urlId = 0),
                    this._curAttrData.updateExtended(),
                    !0
                  );
                }
                _setOrReportSpecialColor(eA, el) {
                  let ec = eA.split(";");
                  for (
                    let eA = 0;
                    eA < ec.length && !(el >= this._specialColors.length);
                    ++eA, ++el
                  )
                    if ("?" === ec[eA])
                      this._onColor.fire([
                        { type: 0, index: this._specialColors[el] },
                      ]);
                    else {
                      let eu = (0, eD.parseColor)(ec[eA]);
                      eu &&
                        this._onColor.fire([
                          {
                            type: 1,
                            index: this._specialColors[el],
                            color: eu,
                          },
                        ]);
                    }
                  return !0;
                }
                setOrReportFgColor(eA) {
                  return this._setOrReportSpecialColor(eA, 0);
                }
                setOrReportBgColor(eA) {
                  return this._setOrReportSpecialColor(eA, 1);
                }
                setOrReportCursorColor(eA) {
                  return this._setOrReportSpecialColor(eA, 2);
                }
                restoreIndexedColor(eA) {
                  if (!eA) return (this._onColor.fire([{ type: 2 }]), !0);
                  let el = [],
                    ec = eA.split(";");
                  for (let eA = 0; eA < ec.length; ++eA)
                    if (/^\d+$/.exec(ec[eA])) {
                      let eu = parseInt(ec[eA]);
                      L(eu) && el.push({ type: 2, index: eu });
                    }
                  return (el.length && this._onColor.fire(el), !0);
                }
                restoreFgColor(eA) {
                  return (this._onColor.fire([{ type: 2, index: 256 }]), !0);
                }
                restoreBgColor(eA) {
                  return (this._onColor.fire([{ type: 2, index: 257 }]), !0);
                }
                restoreCursorColor(eA) {
                  return (this._onColor.fire([{ type: 2, index: 258 }]), !0);
                }
                nextLine() {
                  return ((this._activeBuffer.x = 0), this.index(), !0);
                }
                keypadApplicationMode() {
                  return (
                    this._logService.debug(
                      "Serial port requested application keypad.",
                    ),
                    (this._coreService.decPrivateModes.applicationKeypad = !0),
                    this._onRequestSyncScrollBar.fire(),
                    !0
                  );
                }
                keypadNumericMode() {
                  return (
                    this._logService.debug("Switching back to normal keypad."),
                    (this._coreService.decPrivateModes.applicationKeypad = !1),
                    this._onRequestSyncScrollBar.fire(),
                    !0
                  );
                }
                selectDefaultCharset() {
                  return (
                    this._charsetService.setgLevel(0),
                    this._charsetService.setgCharset(0, eh.DEFAULT_CHARSET),
                    !0
                  );
                }
                selectCharset(eA) {
                  return (
                    2 !== eA.length
                      ? this.selectDefaultCharset()
                      : "/" === eA[0] ||
                        this._charsetService.setgCharset(
                          eT[eA[0]],
                          eh.CHARSETS[eA[1]] || eh.DEFAULT_CHARSET,
                        ),
                    !0
                  );
                }
                index() {
                  return (
                    this._restrictCursor(),
                    this._activeBuffer.y++,
                    this._activeBuffer.y === this._activeBuffer.scrollBottom + 1
                      ? (this._activeBuffer.y--,
                        this._bufferService.scroll(this._eraseAttrData()))
                      : this._activeBuffer.y >= this._bufferService.rows &&
                        (this._activeBuffer.y = this._bufferService.rows - 1),
                    this._restrictCursor(),
                    !0
                  );
                }
                tabSet() {
                  return (
                    (this._activeBuffer.tabs[this._activeBuffer.x] = !0),
                    !0
                  );
                }
                reverseIndex() {
                  if (
                    (this._restrictCursor(),
                    this._activeBuffer.y === this._activeBuffer.scrollTop)
                  ) {
                    let eA =
                      this._activeBuffer.scrollBottom -
                      this._activeBuffer.scrollTop;
                    (this._activeBuffer.lines.shiftElements(
                      this._activeBuffer.ybase + this._activeBuffer.y,
                      eA,
                      1,
                    ),
                      this._activeBuffer.lines.set(
                        this._activeBuffer.ybase + this._activeBuffer.y,
                        this._activeBuffer.getBlankLine(this._eraseAttrData()),
                      ),
                      this._dirtyRowTracker.markRangeDirty(
                        this._activeBuffer.scrollTop,
                        this._activeBuffer.scrollBottom,
                      ));
                  } else (this._activeBuffer.y--, this._restrictCursor());
                  return !0;
                }
                fullReset() {
                  return (
                    this._parser.reset(),
                    this._onRequestReset.fire(),
                    !0
                  );
                }
                reset() {
                  ((this._curAttrData = eC.DEFAULT_ATTR_DATA.clone()),
                    (this._eraseAttrDataInternal =
                      eC.DEFAULT_ATTR_DATA.clone()));
                }
                _eraseAttrData() {
                  return (
                    (this._eraseAttrDataInternal.bg &= -0x4000000),
                    (this._eraseAttrDataInternal.bg |=
                      0x3ffffff & this._curAttrData.bg),
                    this._eraseAttrDataInternal
                  );
                }
                setgLevel(eA) {
                  return (this._charsetService.setgLevel(eA), !0);
                }
                screenAlignmentPattern() {
                  let eA = new eB.CellData();
                  ((eA.content = 4194373),
                    (eA.fg = this._curAttrData.fg),
                    (eA.bg = this._curAttrData.bg),
                    this._setCursor(0, 0));
                  for (let el = 0; el < this._bufferService.rows; ++el) {
                    let ec =
                        this._activeBuffer.ybase + this._activeBuffer.y + el,
                      eu = this._activeBuffer.lines.get(ec);
                    eu && (eu.fill(eA), (eu.isWrapped = !1));
                  }
                  return (
                    this._dirtyRowTracker.markAllDirty(),
                    this._setCursor(0, 0),
                    !0
                  );
                }
                requestStatusString(eA, el) {
                  let ec,
                    eu = this._bufferService.buffer,
                    ed = this._optionsService.rawOptions;
                  return (
                    (ec =
                      '"q' === eA
                        ? `P1$r${+!!this._curAttrData.isProtected()}"q`
                        : '"p' === eA
                          ? 'P1$r61;1"p'
                          : "r" === eA
                            ? `P1$r${eu.scrollTop + 1};${eu.scrollBottom + 1}r`
                            : "m" === eA
                              ? "P1$r0m"
                              : " q" === eA
                                ? `P1$r${{ block: 2, underline: 4, bar: 6 }[ed.cursorStyle] - !!ed.cursorBlink} q`
                                : "P0$r"),
                    this._coreService.triggerDataEvent(
                      `${eg.C0.ESC}${ec}${eg.C0.ESC}\\`,
                    ),
                    !0
                  );
                }
                markRangeDirty(eA, el) {
                  this._dirtyRowTracker.markRangeDirty(eA, el);
                }
              };
              el.InputHandler = E;
              let eM = class {
                constructor(eA) {
                  ((this._bufferService = eA), this.clearRange());
                }
                clearRange() {
                  ((this.start = this._bufferService.buffer.y),
                    (this.end = this._bufferService.buffer.y));
                }
                markDirty(eA) {
                  eA < this.start
                    ? (this.start = eA)
                    : eA > this.end && (this.end = eA);
                }
                markRangeDirty(eA, el) {
                  (eA > el && ((ek = eA), (eA = el), (el = ek)),
                    eA < this.start && (this.start = eA),
                    el > this.end && (this.end = el));
                }
                markAllDirty() {
                  this.markRangeDirty(0, this._bufferService.rows - 1);
                }
              };
              function L(eA) {
                return 0 <= eA && eA < 256;
              }
              eM = ed([ep(0, eI.IBufferService)], eM);
            },
            844: (eA, el) => {
              function i(eA) {
                for (let el of eA) el.dispose();
                eA.length = 0;
              }
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.getDisposeArrayDisposable =
                  el.disposeArray =
                  el.toDisposable =
                  el.MutableDisposable =
                  el.Disposable =
                    void 0),
                (el.Disposable = class {
                  constructor() {
                    ((this._disposables = []), (this._isDisposed = !1));
                  }
                  dispose() {
                    for (let eA of ((this._isDisposed = !0), this._disposables))
                      eA.dispose();
                    this._disposables.length = 0;
                  }
                  register(eA) {
                    return (this._disposables.push(eA), eA);
                  }
                  unregister(eA) {
                    let el = this._disposables.indexOf(eA);
                    -1 !== el && this._disposables.splice(el, 1);
                  }
                }),
                (el.MutableDisposable = class {
                  constructor() {
                    this._isDisposed = !1;
                  }
                  get value() {
                    return this._isDisposed ? void 0 : this._value;
                  }
                  set value(eA) {
                    this._isDisposed ||
                      eA === this._value ||
                      (this._value?.dispose(), (this._value = eA));
                  }
                  clear() {
                    this.value = void 0;
                  }
                  dispose() {
                    ((this._isDisposed = !0),
                      this._value?.dispose(),
                      (this._value = void 0));
                  }
                }),
                (el.toDisposable = function (eA) {
                  return { dispose: eA };
                }),
                (el.disposeArray = i),
                (el.getDisposeArrayDisposable = function (eA) {
                  return { dispose: () => i(eA) };
                }));
            },
            114: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.isChromeOS =
                  el.isLinux =
                  el.isWindows =
                  el.isIphone =
                  el.isIpad =
                  el.isMac =
                  el.getSafariVersion =
                  el.isSafari =
                  el.isLegacyEdge =
                  el.isFirefox =
                  el.isNode =
                    void 0),
                (el.isNode = "u" > typeof process && "title" in process));
              let ec = el.isNode ? "node" : navigator.userAgent,
                eu = el.isNode ? "node" : navigator.platform;
              ((el.isFirefox = ec.includes("Firefox")),
                (el.isLegacyEdge = ec.includes("Edge")),
                (el.isSafari = /^((?!chrome|android).)*safari/i.test(ec)),
                (el.getSafariVersion = function () {
                  if (!el.isSafari) return 0;
                  let eA = ec.match(/Version\/(\d+)/);
                  return null === eA || eA.length < 2 ? 0 : parseInt(eA[1]);
                }),
                (el.isMac = [
                  "Macintosh",
                  "MacIntel",
                  "MacPPC",
                  "Mac68K",
                ].includes(eu)),
                (el.isIpad = "iPad" === eu),
                (el.isIphone = "iPhone" === eu),
                (el.isWindows = ["Windows", "Win16", "Win32", "WinCE"].includes(
                  eu,
                )),
                (el.isLinux = eu.indexOf("Linux") >= 0),
                (el.isChromeOS = /\bCrOS\b/.test(ec)));
            },
            226: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.DebouncedIdleTask =
                  el.IdleTaskQueue =
                  el.PriorityTaskQueue =
                    void 0));
              let eu = ec(114);
              let r = class r {
                constructor() {
                  ((this._tasks = []), (this._i = 0));
                }
                enqueue(eA) {
                  (this._tasks.push(eA), this._start());
                }
                flush() {
                  for (; this._i < this._tasks.length; )
                    this._tasks[this._i]() || this._i++;
                  this.clear();
                }
                clear() {
                  (this._idleCallback &&
                    (this._cancelCallback(this._idleCallback),
                    (this._idleCallback = void 0)),
                    (this._i = 0),
                    (this._tasks.length = 0));
                }
                _start() {
                  this._idleCallback ||
                    (this._idleCallback = this._requestCallback(
                      this._process.bind(this),
                    ));
                }
                _process(eA) {
                  this._idleCallback = void 0;
                  let el = 0,
                    ec = 0,
                    eu = eA.timeRemaining(),
                    ed = 0;
                  for (; this._i < this._tasks.length; ) {
                    if (
                      ((el = Date.now()),
                      this._tasks[this._i]() || this._i++,
                      1.5 *
                        (ec = Math.max(
                          (el = Math.max(1, Date.now() - el)),
                          ec,
                        )) >
                        (ed = eA.timeRemaining()))
                    )
                      return (
                        eu - el < -20 &&
                          console.warn(
                            `task queue exceeded allotted deadline by ${Math.abs(Math.round(eu - el))}ms`,
                          ),
                        void this._start()
                      );
                    eu = ed;
                  }
                  this.clear();
                }
              };
              let n = class n extends r {
                _requestCallback(eA) {
                  return setTimeout(() => eA(this._createDeadline(16)));
                }
                _cancelCallback(eA) {
                  clearTimeout(eA);
                }
                _createDeadline(eA) {
                  let el = Date.now() + eA;
                  return { timeRemaining: () => Math.max(0, el - Date.now()) };
                }
              };
              ((el.PriorityTaskQueue = n),
                (el.IdleTaskQueue =
                  !eu.isNode && "requestIdleCallback" in window
                    ? class extends r {
                        _requestCallback(eA) {
                          return requestIdleCallback(eA);
                        }
                        _cancelCallback(eA) {
                          cancelIdleCallback(eA);
                        }
                      }
                    : n),
                (el.DebouncedIdleTask = class {
                  constructor() {
                    this._queue = new el.IdleTaskQueue();
                  }
                  set(eA) {
                    (this._queue.clear(), this._queue.enqueue(eA));
                  }
                  flush() {
                    this._queue.flush();
                  }
                }));
            },
            282: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.updateWindowsModeWrappedState = void 0));
              let eu = ec(643);
              el.updateWindowsModeWrappedState = function (eA) {
                let el = eA.buffer.lines.get(eA.buffer.ybase + eA.buffer.y - 1),
                  ec = el?.get(eA.cols - 1),
                  ed = eA.buffer.lines.get(eA.buffer.ybase + eA.buffer.y);
                ed &&
                  ec &&
                  (ed.isWrapped =
                    ec[eu.CHAR_DATA_CODE_INDEX] !== eu.NULL_CELL_CODE &&
                    ec[eu.CHAR_DATA_CODE_INDEX] !== eu.WHITESPACE_CELL_CODE);
              };
            },
            734: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.ExtendedAttrs = el.AttributeData = void 0));
              let i = class i {
                constructor() {
                  ((this.fg = 0), (this.bg = 0), (this.extended = new s()));
                }
                static toColorRGB(eA) {
                  return [(eA >>> 16) & 255, (eA >>> 8) & 255, 255 & eA];
                }
                static fromColorRGB(eA) {
                  return (
                    ((255 & eA[0]) << 16) | ((255 & eA[1]) << 8) | (255 & eA[2])
                  );
                }
                clone() {
                  let eA = new i();
                  return (
                    (eA.fg = this.fg),
                    (eA.bg = this.bg),
                    (eA.extended = this.extended.clone()),
                    eA
                  );
                }
                isInverse() {
                  return 0x4000000 & this.fg;
                }
                isBold() {
                  return 0x8000000 & this.fg;
                }
                isUnderline() {
                  return this.hasExtendedAttrs() &&
                    0 !== this.extended.underlineStyle
                    ? 1
                    : 0x10000000 & this.fg;
                }
                isBlink() {
                  return 0x20000000 & this.fg;
                }
                isInvisible() {
                  return 0x40000000 & this.fg;
                }
                isItalic() {
                  return 0x4000000 & this.bg;
                }
                isDim() {
                  return 0x8000000 & this.bg;
                }
                isStrikethrough() {
                  return 0x80000000 & this.fg;
                }
                isProtected() {
                  return 0x20000000 & this.bg;
                }
                isOverline() {
                  return 0x40000000 & this.bg;
                }
                getFgColorMode() {
                  return 0x3000000 & this.fg;
                }
                getBgColorMode() {
                  return 0x3000000 & this.bg;
                }
                isFgRGB() {
                  return 0x3000000 == (0x3000000 & this.fg);
                }
                isBgRGB() {
                  return 0x3000000 == (0x3000000 & this.bg);
                }
                isFgPalette() {
                  return (
                    0x1000000 == (0x3000000 & this.fg) ||
                    0x2000000 == (0x3000000 & this.fg)
                  );
                }
                isBgPalette() {
                  return (
                    0x1000000 == (0x3000000 & this.bg) ||
                    0x2000000 == (0x3000000 & this.bg)
                  );
                }
                isFgDefault() {
                  return 0 == (0x3000000 & this.fg);
                }
                isBgDefault() {
                  return 0 == (0x3000000 & this.bg);
                }
                isAttributeDefault() {
                  return 0 === this.fg && 0 === this.bg;
                }
                getFgColor() {
                  switch (0x3000000 & this.fg) {
                    case 0x1000000:
                    case 0x2000000:
                      return 255 & this.fg;
                    case 0x3000000:
                      return 0xffffff & this.fg;
                    default:
                      return -1;
                  }
                }
                getBgColor() {
                  switch (0x3000000 & this.bg) {
                    case 0x1000000:
                    case 0x2000000:
                      return 255 & this.bg;
                    case 0x3000000:
                      return 0xffffff & this.bg;
                    default:
                      return -1;
                  }
                }
                hasExtendedAttrs() {
                  return 0x10000000 & this.bg;
                }
                updateExtended() {
                  this.extended.isEmpty()
                    ? (this.bg &= -0x10000001)
                    : (this.bg |= 0x10000000);
                }
                getUnderlineColor() {
                  if (0x10000000 & this.bg && ~this.extended.underlineColor)
                    switch (0x3000000 & this.extended.underlineColor) {
                      case 0x1000000:
                      case 0x2000000:
                        return 255 & this.extended.underlineColor;
                      case 0x3000000:
                        return 0xffffff & this.extended.underlineColor;
                    }
                  return this.getFgColor();
                }
                getUnderlineColorMode() {
                  return 0x10000000 & this.bg && ~this.extended.underlineColor
                    ? 0x3000000 & this.extended.underlineColor
                    : this.getFgColorMode();
                }
                isUnderlineColorRGB() {
                  return 0x10000000 & this.bg && ~this.extended.underlineColor
                    ? 0x3000000 == (0x3000000 & this.extended.underlineColor)
                    : this.isFgRGB();
                }
                isUnderlineColorPalette() {
                  return 0x10000000 & this.bg && ~this.extended.underlineColor
                    ? 0x1000000 == (0x3000000 & this.extended.underlineColor) ||
                        0x2000000 == (0x3000000 & this.extended.underlineColor)
                    : this.isFgPalette();
                }
                isUnderlineColorDefault() {
                  return 0x10000000 & this.bg && ~this.extended.underlineColor
                    ? 0 == (0x3000000 & this.extended.underlineColor)
                    : this.isFgDefault();
                }
                getUnderlineStyle() {
                  return 0x10000000 & this.fg
                    ? 0x10000000 & this.bg
                      ? this.extended.underlineStyle
                      : 1
                    : 0;
                }
                getUnderlineVariantOffset() {
                  return this.extended.underlineVariantOffset;
                }
              };
              el.AttributeData = i;
              let s = class s {
                get ext() {
                  return this._urlId
                    ? (-0x1c000001 & this._ext) | (this.underlineStyle << 26)
                    : this._ext;
                }
                set ext(eA) {
                  this._ext = eA;
                }
                get underlineStyle() {
                  return this._urlId ? 5 : (0x1c000000 & this._ext) >> 26;
                }
                set underlineStyle(eA) {
                  ((this._ext &= -0x1c000001),
                    (this._ext |= (eA << 26) & 0x1c000000));
                }
                get underlineColor() {
                  return 0x3ffffff & this._ext;
                }
                set underlineColor(eA) {
                  ((this._ext &= -0x4000000), (this._ext |= 0x3ffffff & eA));
                }
                get urlId() {
                  return this._urlId;
                }
                set urlId(eA) {
                  this._urlId = eA;
                }
                get underlineVariantOffset() {
                  let eA = (0xe0000000 & this._ext) >> 29;
                  return eA < 0 ? 0xfffffff8 ^ eA : eA;
                }
                set underlineVariantOffset(eA) {
                  ((this._ext &= 0x1fffffff),
                    (this._ext |= (eA << 29) & 0xe0000000));
                }
                constructor(eA = 0, el = 0) {
                  ((this._ext = 0),
                    (this._urlId = 0),
                    (this._ext = eA),
                    (this._urlId = el));
                }
                clone() {
                  return new s(this._ext, this._urlId);
                }
                isEmpty() {
                  return 0 === this.underlineStyle && 0 === this._urlId;
                }
              };
              el.ExtendedAttrs = s;
            },
            92: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.Buffer = el.MAX_BUFFER_SIZE = void 0));
              let eu = ec(349),
                ed = ec(226),
                ep = ec(734),
                eg = ec(437),
                eh = ec(634),
                ef = ec(511),
                em = ec(643),
                eE = ec(863),
                eC = ec(116);
              ((el.MAX_BUFFER_SIZE = 0xffffffff),
                (el.Buffer = class {
                  constructor(eA, el, ec) {
                    ((this._hasScrollback = eA),
                      (this._optionsService = el),
                      (this._bufferService = ec),
                      (this.ydisp = 0),
                      (this.ybase = 0),
                      (this.y = 0),
                      (this.x = 0),
                      (this.tabs = {}),
                      (this.savedY = 0),
                      (this.savedX = 0),
                      (this.savedCurAttrData = eg.DEFAULT_ATTR_DATA.clone()),
                      (this.savedCharset = eC.DEFAULT_CHARSET),
                      (this.markers = []),
                      (this._nullCell = ef.CellData.fromCharData([
                        0,
                        em.NULL_CELL_CHAR,
                        em.NULL_CELL_WIDTH,
                        em.NULL_CELL_CODE,
                      ])),
                      (this._whitespaceCell = ef.CellData.fromCharData([
                        0,
                        em.WHITESPACE_CELL_CHAR,
                        em.WHITESPACE_CELL_WIDTH,
                        em.WHITESPACE_CELL_CODE,
                      ])),
                      (this._isClearing = !1),
                      (this._memoryCleanupQueue = new ed.IdleTaskQueue()),
                      (this._memoryCleanupPosition = 0),
                      (this._cols = this._bufferService.cols),
                      (this._rows = this._bufferService.rows),
                      (this.lines = new eu.CircularList(
                        this._getCorrectBufferLength(this._rows),
                      )),
                      (this.scrollTop = 0),
                      (this.scrollBottom = this._rows - 1),
                      this.setupTabStops());
                  }
                  getNullCell(eA) {
                    return (
                      eA
                        ? ((this._nullCell.fg = eA.fg),
                          (this._nullCell.bg = eA.bg),
                          (this._nullCell.extended = eA.extended))
                        : ((this._nullCell.fg = 0),
                          (this._nullCell.bg = 0),
                          (this._nullCell.extended = new ep.ExtendedAttrs())),
                      this._nullCell
                    );
                  }
                  getWhitespaceCell(eA) {
                    return (
                      eA
                        ? ((this._whitespaceCell.fg = eA.fg),
                          (this._whitespaceCell.bg = eA.bg),
                          (this._whitespaceCell.extended = eA.extended))
                        : ((this._whitespaceCell.fg = 0),
                          (this._whitespaceCell.bg = 0),
                          (this._whitespaceCell.extended =
                            new ep.ExtendedAttrs())),
                      this._whitespaceCell
                    );
                  }
                  getBlankLine(eA, el) {
                    return new eg.BufferLine(
                      this._bufferService.cols,
                      this.getNullCell(eA),
                      el,
                    );
                  }
                  get hasScrollback() {
                    return (
                      this._hasScrollback && this.lines.maxLength > this._rows
                    );
                  }
                  get isCursorInViewport() {
                    let eA = this.ybase + this.y - this.ydisp;
                    return eA >= 0 && eA < this._rows;
                  }
                  _getCorrectBufferLength(eA) {
                    if (!this._hasScrollback) return eA;
                    let ec = eA + this._optionsService.rawOptions.scrollback;
                    return ec > el.MAX_BUFFER_SIZE ? el.MAX_BUFFER_SIZE : ec;
                  }
                  fillViewportRows(eA) {
                    if (0 === this.lines.length) {
                      void 0 === eA && (eA = eg.DEFAULT_ATTR_DATA);
                      let el = this._rows;
                      for (; el--; ) this.lines.push(this.getBlankLine(eA));
                    }
                  }
                  clear() {
                    ((this.ydisp = 0),
                      (this.ybase = 0),
                      (this.y = 0),
                      (this.x = 0),
                      (this.lines = new eu.CircularList(
                        this._getCorrectBufferLength(this._rows),
                      )),
                      (this.scrollTop = 0),
                      (this.scrollBottom = this._rows - 1),
                      this.setupTabStops());
                  }
                  resize(eA, el) {
                    let ec = this.getNullCell(eg.DEFAULT_ATTR_DATA),
                      eu = 0,
                      ed = this._getCorrectBufferLength(el);
                    if (
                      (ed > this.lines.maxLength && (this.lines.maxLength = ed),
                      this.lines.length > 0)
                    ) {
                      if (this._cols < eA)
                        for (let el = 0; el < this.lines.length; el++)
                          eu += +this.lines.get(el).resize(eA, ec);
                      let ep = 0;
                      if (this._rows < el)
                        for (let eu = this._rows; eu < el; eu++)
                          this.lines.length < el + this.ybase &&
                            (this._optionsService.rawOptions.windowsMode ||
                            void 0 !==
                              this._optionsService.rawOptions.windowsPty
                                .backend ||
                            void 0 !==
                              this._optionsService.rawOptions.windowsPty
                                .buildNumber
                              ? this.lines.push(new eg.BufferLine(eA, ec))
                              : this.ybase > 0 &&
                                  this.lines.length <=
                                    this.ybase + this.y + ep + 1
                                ? (this.ybase--,
                                  ep++,
                                  this.ydisp > 0 && this.ydisp--)
                                : this.lines.push(new eg.BufferLine(eA, ec)));
                      else
                        for (let eA = this._rows; eA > el; eA--)
                          this.lines.length > el + this.ybase &&
                            (this.lines.length > this.ybase + this.y + 1
                              ? this.lines.pop()
                              : (this.ybase++, this.ydisp++));
                      if (ed < this.lines.maxLength) {
                        let eA = this.lines.length - ed;
                        (eA > 0 &&
                          (this.lines.trimStart(eA),
                          (this.ybase = Math.max(this.ybase - eA, 0)),
                          (this.ydisp = Math.max(this.ydisp - eA, 0)),
                          (this.savedY = Math.max(this.savedY - eA, 0))),
                          (this.lines.maxLength = ed));
                      }
                      ((this.x = Math.min(this.x, eA - 1)),
                        (this.y = Math.min(this.y, el - 1)),
                        ep && (this.y += ep),
                        (this.savedX = Math.min(this.savedX, eA - 1)),
                        (this.scrollTop = 0));
                    }
                    if (
                      ((this.scrollBottom = el - 1),
                      this._isReflowEnabled &&
                        (this._reflow(eA, el), this._cols > eA))
                    )
                      for (let el = 0; el < this.lines.length; el++)
                        eu += +this.lines.get(el).resize(eA, ec);
                    ((this._cols = eA),
                      (this._rows = el),
                      this._memoryCleanupQueue.clear(),
                      eu > 0.1 * this.lines.length &&
                        ((this._memoryCleanupPosition = 0),
                        this._memoryCleanupQueue.enqueue(() =>
                          this._batchedMemoryCleanup(),
                        )));
                  }
                  _batchedMemoryCleanup() {
                    let eA = !0;
                    this._memoryCleanupPosition >= this.lines.length &&
                      ((this._memoryCleanupPosition = 0), (eA = !1));
                    let el = 0;
                    for (; this._memoryCleanupPosition < this.lines.length; )
                      if (
                        (el += this.lines
                          .get(this._memoryCleanupPosition++)
                          .cleanupMemory()) > 100
                      )
                        return !0;
                    return eA;
                  }
                  get _isReflowEnabled() {
                    let eA = this._optionsService.rawOptions.windowsPty;
                    return eA && eA.buildNumber
                      ? this._hasScrollback &&
                          "conpty" === eA.backend &&
                          eA.buildNumber >= 21376
                      : this._hasScrollback &&
                          !this._optionsService.rawOptions.windowsMode;
                  }
                  _reflow(eA, el) {
                    this._cols !== eA &&
                      (eA > this._cols
                        ? this._reflowLarger(eA, el)
                        : this._reflowSmaller(eA, el));
                  }
                  _reflowLarger(eA, el) {
                    let ec = (0, eh.reflowLargerGetLinesToRemove)(
                      this.lines,
                      this._cols,
                      eA,
                      this.ybase + this.y,
                      this.getNullCell(eg.DEFAULT_ATTR_DATA),
                    );
                    if (ec.length > 0) {
                      let eu = (0, eh.reflowLargerCreateNewLayout)(
                        this.lines,
                        ec,
                      );
                      ((0, eh.reflowLargerApplyNewLayout)(
                        this.lines,
                        eu.layout,
                      ),
                        this._reflowLargerAdjustViewport(
                          eA,
                          el,
                          eu.countRemoved,
                        ));
                    }
                  }
                  _reflowLargerAdjustViewport(eA, el, ec) {
                    let eu = this.getNullCell(eg.DEFAULT_ATTR_DATA),
                      ed = ec;
                    for (; ed-- > 0; )
                      0 === this.ybase
                        ? (this.y > 0 && this.y--,
                          this.lines.length < el &&
                            this.lines.push(new eg.BufferLine(eA, eu)))
                        : (this.ydisp === this.ybase && this.ydisp--,
                          this.ybase--);
                    this.savedY = Math.max(this.savedY - ec, 0);
                  }
                  _reflowSmaller(eA, el) {
                    let ec = this.getNullCell(eg.DEFAULT_ATTR_DATA),
                      eu = [],
                      ed = 0;
                    for (let ep = this.lines.length - 1; ep >= 0; ep--) {
                      let ef,
                        em = this.lines.get(ep);
                      if (!em || (!em.isWrapped && em.getTrimmedLength() <= eA))
                        continue;
                      let eE = [em];
                      for (; em.isWrapped && ep > 0; )
                        ((em = this.lines.get(--ep)), eE.unshift(em));
                      let eC = this.ybase + this.y;
                      if (eC >= ep && eC < ep + eE.length) continue;
                      let ey = eE[eE.length - 1].getTrimmedLength(),
                        ew = (0, eh.reflowSmallerGetNewLineLengths)(
                          eE,
                          this._cols,
                          eA,
                        ),
                        eB = ew.length - eE.length;
                      ef =
                        0 === this.ybase && this.y !== this.lines.length - 1
                          ? Math.max(0, this.y - this.lines.maxLength + eB)
                          : Math.max(
                              0,
                              this.lines.length - this.lines.maxLength + eB,
                            );
                      let e_ = [];
                      for (let eA = 0; eA < eB; eA++) {
                        let eA = this.getBlankLine(eg.DEFAULT_ATTR_DATA, !0);
                        e_.push(eA);
                      }
                      (e_.length > 0 &&
                        (eu.push({ start: ep + eE.length + ed, newLines: e_ }),
                        (ed += e_.length)),
                        eE.push(...e_));
                      let eI = ew.length - 1,
                        ev = ew[eI];
                      0 === ev && (ev = ew[--eI]);
                      let eS = eE.length - eB - 1,
                        eQ = ey;
                      for (; eS >= 0; ) {
                        let eA = Math.min(eQ, ev);
                        if (void 0 === eE[eI]) break;
                        if (
                          (eE[eI].copyCellsFrom(
                            eE[eS],
                            eQ - eA,
                            ev - eA,
                            eA,
                            !0,
                          ),
                          0 == (ev -= eA) && (ev = ew[--eI]),
                          0 == (eQ -= eA))
                        ) {
                          let eA = Math.max(--eS, 0);
                          eQ = (0, eh.getWrappedLineTrimmedLength)(
                            eE,
                            eA,
                            this._cols,
                          );
                        }
                      }
                      for (let el = 0; el < eE.length; el++)
                        ew[el] < eA && eE[el].setCell(ew[el], ec);
                      let eD = eB - ef;
                      for (; eD-- > 0; )
                        0 === this.ybase
                          ? this.y < el - 1
                            ? (this.y++, this.lines.pop())
                            : (this.ybase++, this.ydisp++)
                          : this.ybase <
                              Math.min(
                                this.lines.maxLength,
                                this.lines.length + ed,
                              ) -
                                el &&
                            (this.ybase === this.ydisp && this.ydisp++,
                            this.ybase++);
                      this.savedY = Math.min(
                        this.savedY + eB,
                        this.ybase + el - 1,
                      );
                    }
                    if (eu.length > 0) {
                      let eA = [],
                        el = [];
                      for (let eA = 0; eA < this.lines.length; eA++)
                        el.push(this.lines.get(eA));
                      let ec = this.lines.length,
                        ep = ec - 1,
                        eg = 0,
                        eh = eu[0];
                      this.lines.length = Math.min(
                        this.lines.maxLength,
                        this.lines.length + ed,
                      );
                      let ef = 0;
                      for (
                        let em = Math.min(
                          this.lines.maxLength - 1,
                          ec + ed - 1,
                        );
                        em >= 0;
                        em--
                      )
                        if (eh && eh.start > ep + ef) {
                          for (let eA = eh.newLines.length - 1; eA >= 0; eA--)
                            this.lines.set(em--, eh.newLines[eA]);
                          (em++,
                            eA.push({
                              index: ep + 1,
                              amount: eh.newLines.length,
                            }),
                            (ef += eh.newLines.length),
                            (eh = eu[++eg]));
                        } else this.lines.set(em, el[ep--]);
                      let em = 0;
                      for (let el = eA.length - 1; el >= 0; el--)
                        ((eA[el].index += em),
                          this.lines.onInsertEmitter.fire(eA[el]),
                          (em += eA[el].amount));
                      let eE = Math.max(0, ec + ed - this.lines.maxLength);
                      eE > 0 && this.lines.onTrimEmitter.fire(eE);
                    }
                  }
                  translateBufferLineToString(eA, el, ec = 0, eu) {
                    let ed = this.lines.get(eA);
                    return ed ? ed.translateToString(el, ec, eu) : "";
                  }
                  getWrappedRangeForLine(eA) {
                    let el = eA,
                      ec = eA;
                    for (; el > 0 && this.lines.get(el).isWrapped; ) el--;
                    for (
                      ;
                      ec + 1 < this.lines.length &&
                      this.lines.get(ec + 1).isWrapped;

                    )
                      ec++;
                    return { first: el, last: ec };
                  }
                  setupTabStops(eA) {
                    for (
                      null != eA
                        ? this.tabs[eA] || (eA = this.prevStop(eA))
                        : ((this.tabs = {}), (eA = 0));
                      eA < this._cols;
                      eA += this._optionsService.rawOptions.tabStopWidth
                    )
                      this.tabs[eA] = !0;
                  }
                  prevStop(eA) {
                    for (
                      null == eA && (eA = this.x);
                      !this.tabs[--eA] && eA > 0;

                    );
                    return eA >= this._cols ? this._cols - 1 : eA < 0 ? 0 : eA;
                  }
                  nextStop(eA) {
                    for (
                      null == eA && (eA = this.x);
                      !this.tabs[++eA] && eA < this._cols;

                    );
                    return eA >= this._cols ? this._cols - 1 : eA < 0 ? 0 : eA;
                  }
                  clearMarkers(eA) {
                    this._isClearing = !0;
                    for (let el = 0; el < this.markers.length; el++)
                      this.markers[el].line === eA &&
                        (this.markers[el].dispose(),
                        this.markers.splice(el--, 1));
                    this._isClearing = !1;
                  }
                  clearAllMarkers() {
                    this._isClearing = !0;
                    for (let eA = 0; eA < this.markers.length; eA++)
                      (this.markers[eA].dispose(),
                        this.markers.splice(eA--, 1));
                    this._isClearing = !1;
                  }
                  addMarker(eA) {
                    let el = new eE.Marker(eA);
                    return (
                      this.markers.push(el),
                      el.register(
                        this.lines.onTrim((eA) => {
                          ((el.line -= eA), el.line < 0 && el.dispose());
                        }),
                      ),
                      el.register(
                        this.lines.onInsert((eA) => {
                          el.line >= eA.index && (el.line += eA.amount);
                        }),
                      ),
                      el.register(
                        this.lines.onDelete((eA) => {
                          (el.line >= eA.index &&
                            el.line < eA.index + eA.amount &&
                            el.dispose(),
                            el.line > eA.index && (el.line -= eA.amount));
                        }),
                      ),
                      el.register(el.onDispose(() => this._removeMarker(el))),
                      el
                    );
                  }
                  _removeMarker(eA) {
                    this._isClearing ||
                      this.markers.splice(this.markers.indexOf(eA), 1);
                  }
                }));
            },
            437: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.BufferLine = el.DEFAULT_ATTR_DATA = void 0));
              let eu = ec(734),
                ed = ec(511),
                ep = ec(643),
                eg = ec(482);
              el.DEFAULT_ATTR_DATA = Object.freeze(new eu.AttributeData());
              let eh = 0;
              let h = class h {
                constructor(eA, el, ec = !1) {
                  ((this.isWrapped = ec),
                    (this._combined = {}),
                    (this._extendedAttrs = {}),
                    (this._data = new Uint32Array(3 * eA)));
                  const eu =
                    el ||
                    ed.CellData.fromCharData([
                      0,
                      ep.NULL_CELL_CHAR,
                      ep.NULL_CELL_WIDTH,
                      ep.NULL_CELL_CODE,
                    ]);
                  for (let el = 0; el < eA; ++el) this.setCell(el, eu);
                  this.length = eA;
                }
                get(eA) {
                  let el = this._data[3 * eA + 0],
                    ec = 2097151 & el;
                  return [
                    this._data[3 * eA + 1],
                    2097152 & el
                      ? this._combined[eA]
                      : ec
                        ? (0, eg.stringFromCodePoint)(ec)
                        : "",
                    el >> 22,
                    2097152 & el
                      ? this._combined[eA].charCodeAt(
                          this._combined[eA].length - 1,
                        )
                      : ec,
                  ];
                }
                set(eA, el) {
                  ((this._data[3 * eA + 1] = el[ep.CHAR_DATA_ATTR_INDEX]),
                    el[ep.CHAR_DATA_CHAR_INDEX].length > 1
                      ? ((this._combined[eA] = el[1]),
                        (this._data[3 * eA + 0] =
                          2097152 | eA | (el[ep.CHAR_DATA_WIDTH_INDEX] << 22)))
                      : (this._data[3 * eA + 0] =
                          el[ep.CHAR_DATA_CHAR_INDEX].charCodeAt(0) |
                          (el[ep.CHAR_DATA_WIDTH_INDEX] << 22)));
                }
                getWidth(eA) {
                  return this._data[3 * eA + 0] >> 22;
                }
                hasWidth(eA) {
                  return 0xc00000 & this._data[3 * eA + 0];
                }
                getFg(eA) {
                  return this._data[3 * eA + 1];
                }
                getBg(eA) {
                  return this._data[3 * eA + 2];
                }
                hasContent(eA) {
                  return 4194303 & this._data[3 * eA + 0];
                }
                getCodePoint(eA) {
                  let el = this._data[3 * eA + 0];
                  return 2097152 & el
                    ? this._combined[eA].charCodeAt(
                        this._combined[eA].length - 1,
                      )
                    : 2097151 & el;
                }
                isCombined(eA) {
                  return 2097152 & this._data[3 * eA + 0];
                }
                getString(eA) {
                  let el = this._data[3 * eA + 0];
                  return 2097152 & el
                    ? this._combined[eA]
                    : 2097151 & el
                      ? (0, eg.stringFromCodePoint)(2097151 & el)
                      : "";
                }
                isProtected(eA) {
                  return 0x20000000 & this._data[3 * eA + 2];
                }
                loadCell(eA, el) {
                  return (
                    (eh = 3 * eA),
                    (el.content = this._data[eh + 0]),
                    (el.fg = this._data[eh + 1]),
                    (el.bg = this._data[eh + 2]),
                    2097152 & el.content &&
                      (el.combinedData = this._combined[eA]),
                    0x10000000 & el.bg &&
                      (el.extended = this._extendedAttrs[eA]),
                    el
                  );
                }
                setCell(eA, el) {
                  (2097152 & el.content &&
                    (this._combined[eA] = el.combinedData),
                    0x10000000 & el.bg &&
                      (this._extendedAttrs[eA] = el.extended),
                    (this._data[3 * eA + 0] = el.content),
                    (this._data[3 * eA + 1] = el.fg),
                    (this._data[3 * eA + 2] = el.bg));
                }
                setCellFromCodepoint(eA, el, ec, eu) {
                  (0x10000000 & eu.bg &&
                    (this._extendedAttrs[eA] = eu.extended),
                    (this._data[3 * eA + 0] = el | (ec << 22)),
                    (this._data[3 * eA + 1] = eu.fg),
                    (this._data[3 * eA + 2] = eu.bg));
                }
                addCodepointToCell(eA, el, ec) {
                  let eu = this._data[3 * eA + 0];
                  (2097152 & eu
                    ? (this._combined[eA] += (0, eg.stringFromCodePoint)(el))
                    : 2097151 & eu
                      ? ((this._combined[eA] =
                          (0, eg.stringFromCodePoint)(2097151 & eu) +
                          (0, eg.stringFromCodePoint)(el)),
                        (eu &= -2097152),
                        (eu |= 2097152))
                      : (eu = 4194304 | el),
                    ec && ((eu &= -0xc00001), (eu |= ec << 22)),
                    (this._data[3 * eA + 0] = eu));
                }
                insertCells(eA, el, ec) {
                  if (
                    ((eA %= this.length) &&
                      2 === this.getWidth(eA - 1) &&
                      this.setCellFromCodepoint(eA - 1, 0, 1, ec),
                    el < this.length - eA)
                  ) {
                    let eu = new ed.CellData();
                    for (let ec = this.length - eA - el - 1; ec >= 0; --ec)
                      this.setCell(eA + el + ec, this.loadCell(eA + ec, eu));
                    for (let eu = 0; eu < el; ++eu) this.setCell(eA + eu, ec);
                  } else
                    for (let el = eA; el < this.length; ++el)
                      this.setCell(el, ec);
                  2 === this.getWidth(this.length - 1) &&
                    this.setCellFromCodepoint(this.length - 1, 0, 1, ec);
                }
                deleteCells(eA, el, ec) {
                  if (((eA %= this.length), el < this.length - eA)) {
                    let eu = new ed.CellData();
                    for (let ec = 0; ec < this.length - eA - el; ++ec)
                      this.setCell(eA + ec, this.loadCell(eA + el + ec, eu));
                    for (let eA = this.length - el; eA < this.length; ++eA)
                      this.setCell(eA, ec);
                  } else
                    for (let el = eA; el < this.length; ++el)
                      this.setCell(el, ec);
                  (eA &&
                    2 === this.getWidth(eA - 1) &&
                    this.setCellFromCodepoint(eA - 1, 0, 1, ec),
                    0 !== this.getWidth(eA) ||
                      this.hasContent(eA) ||
                      this.setCellFromCodepoint(eA, 0, 1, ec));
                }
                replaceCells(eA, el, ec, eu = !1) {
                  if (eu)
                    for (
                      eA &&
                        2 === this.getWidth(eA - 1) &&
                        !this.isProtected(eA - 1) &&
                        this.setCellFromCodepoint(eA - 1, 0, 1, ec),
                        el < this.length &&
                          2 === this.getWidth(el - 1) &&
                          !this.isProtected(el) &&
                          this.setCellFromCodepoint(el, 0, 1, ec);
                      eA < el && eA < this.length;

                    )
                      (this.isProtected(eA) || this.setCell(eA, ec), eA++);
                  else
                    for (
                      eA &&
                        2 === this.getWidth(eA - 1) &&
                        this.setCellFromCodepoint(eA - 1, 0, 1, ec),
                        el < this.length &&
                          2 === this.getWidth(el - 1) &&
                          this.setCellFromCodepoint(el, 0, 1, ec);
                      eA < el && eA < this.length;

                    )
                      this.setCell(eA++, ec);
                }
                resize(eA, el) {
                  if (eA === this.length)
                    return (
                      4 * this._data.length * 2 < this._data.buffer.byteLength
                    );
                  let ec = 3 * eA;
                  if (eA > this.length) {
                    if (this._data.buffer.byteLength >= 4 * ec)
                      this._data = new Uint32Array(this._data.buffer, 0, ec);
                    else {
                      let eA = new Uint32Array(ec);
                      (eA.set(this._data), (this._data = eA));
                    }
                    for (let ec = this.length; ec < eA; ++ec)
                      this.setCell(ec, el);
                  } else {
                    this._data = this._data.subarray(0, ec);
                    let el = Object.keys(this._combined);
                    for (let ec = 0; ec < el.length; ec++) {
                      let eu = parseInt(el[ec], 10);
                      eu >= eA && delete this._combined[eu];
                    }
                    let eu = Object.keys(this._extendedAttrs);
                    for (let el = 0; el < eu.length; el++) {
                      let ec = parseInt(eu[el], 10);
                      ec >= eA && delete this._extendedAttrs[ec];
                    }
                  }
                  return (
                    (this.length = eA),
                    4 * ec * 2 < this._data.buffer.byteLength
                  );
                }
                cleanupMemory() {
                  if (
                    4 * this._data.length * 2 <
                    this._data.buffer.byteLength
                  ) {
                    let eA = new Uint32Array(this._data.length);
                    return (eA.set(this._data), (this._data = eA), 1);
                  }
                  return 0;
                }
                fill(eA, el = !1) {
                  if (el)
                    for (let el = 0; el < this.length; ++el)
                      this.isProtected(el) || this.setCell(el, eA);
                  else {
                    ((this._combined = {}), (this._extendedAttrs = {}));
                    for (let el = 0; el < this.length; ++el)
                      this.setCell(el, eA);
                  }
                }
                copyFrom(eA) {
                  for (let el in (this.length !== eA.length
                    ? (this._data = new Uint32Array(eA._data))
                    : this._data.set(eA._data),
                  (this.length = eA.length),
                  (this._combined = {}),
                  eA._combined))
                    this._combined[el] = eA._combined[el];
                  for (let el in ((this._extendedAttrs = {}),
                  eA._extendedAttrs))
                    this._extendedAttrs[el] = eA._extendedAttrs[el];
                  this.isWrapped = eA.isWrapped;
                }
                clone() {
                  let eA = new h(0);
                  for (let el in ((eA._data = new Uint32Array(this._data)),
                  (eA.length = this.length),
                  this._combined))
                    eA._combined[el] = this._combined[el];
                  for (let el in this._extendedAttrs)
                    eA._extendedAttrs[el] = this._extendedAttrs[el];
                  return ((eA.isWrapped = this.isWrapped), eA);
                }
                getTrimmedLength() {
                  for (let eA = this.length - 1; eA >= 0; --eA)
                    if (4194303 & this._data[3 * eA + 0])
                      return eA + (this._data[3 * eA + 0] >> 22);
                  return 0;
                }
                getNoBgTrimmedLength() {
                  for (let eA = this.length - 1; eA >= 0; --eA)
                    if (
                      4194303 & this._data[3 * eA + 0] ||
                      0x3000000 & this._data[3 * eA + 2]
                    )
                      return eA + (this._data[3 * eA + 0] >> 22);
                  return 0;
                }
                copyCellsFrom(eA, el, ec, eu, ed) {
                  let ep = eA._data;
                  if (ed)
                    for (let ed = eu - 1; ed >= 0; ed--) {
                      for (let eA = 0; eA < 3; eA++)
                        this._data[3 * (ec + ed) + eA] = ep[3 * (el + ed) + eA];
                      0x10000000 & ep[3 * (el + ed) + 2] &&
                        (this._extendedAttrs[ec + ed] =
                          eA._extendedAttrs[el + ed]);
                    }
                  else
                    for (let ed = 0; ed < eu; ed++) {
                      for (let eA = 0; eA < 3; eA++)
                        this._data[3 * (ec + ed) + eA] = ep[3 * (el + ed) + eA];
                      0x10000000 & ep[3 * (el + ed) + 2] &&
                        (this._extendedAttrs[ec + ed] =
                          eA._extendedAttrs[el + ed]);
                    }
                  let eg = Object.keys(eA._combined);
                  for (let eu = 0; eu < eg.length; eu++) {
                    let ed = parseInt(eg[eu], 10);
                    ed >= el &&
                      (this._combined[ed - el + ec] = eA._combined[ed]);
                  }
                }
                translateToString(eA, el, ec, eu) {
                  ((el = el ?? 0),
                    (ec = ec ?? this.length),
                    eA && (ec = Math.min(ec, this.getTrimmedLength())),
                    eu && (eu.length = 0));
                  let ed = "";
                  for (; el < ec; ) {
                    let eA = this._data[3 * el + 0],
                      ec = 2097151 & eA,
                      eh =
                        2097152 & eA
                          ? this._combined[el]
                          : ec
                            ? (0, eg.stringFromCodePoint)(ec)
                            : ep.WHITESPACE_CELL_CHAR;
                    if (((ed += eh), eu))
                      for (let eA = 0; eA < eh.length; ++eA) eu.push(el);
                    el += eA >> 22 || 1;
                  }
                  return (eu && eu.push(el), ed);
                }
              };
              el.BufferLine = h;
            },
            634: (eA, el) => {
              function i(eA, el, ec) {
                if (el === eA.length - 1) return eA[el].getTrimmedLength();
                let eu =
                    !eA[el].hasContent(ec - 1) && 1 === eA[el].getWidth(ec - 1),
                  ed = 2 === eA[el + 1].getWidth(0);
                return eu && ed ? ec - 1 : ec;
              }
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.getWrappedLineTrimmedLength =
                  el.reflowSmallerGetNewLineLengths =
                  el.reflowLargerApplyNewLayout =
                  el.reflowLargerCreateNewLayout =
                  el.reflowLargerGetLinesToRemove =
                    void 0),
                (el.reflowLargerGetLinesToRemove = function (
                  eA,
                  el,
                  ec,
                  eu,
                  ed,
                ) {
                  let ep = [];
                  for (let eg = 0; eg < eA.length - 1; eg++) {
                    let eh = eg,
                      ef = eA.get(++eh);
                    if (!ef.isWrapped) continue;
                    let em = [eA.get(eg)];
                    for (; eh < eA.length && ef.isWrapped; )
                      (em.push(ef), (ef = eA.get(++eh)));
                    if (eu >= eg && eu < eh) {
                      eg += em.length - 1;
                      continue;
                    }
                    let eE = 0,
                      eC = i(em, 0, el),
                      ey = 1,
                      ew = 0;
                    for (; ey < em.length; ) {
                      let eA = i(em, ey, el),
                        eu = Math.min(eA - ew, ec - eC);
                      (em[eE].copyCellsFrom(em[ey], ew, eC, eu, !1),
                        (eC += eu) === ec && (eE++, (eC = 0)),
                        (ew += eu) === eA && (ey++, (ew = 0)),
                        0 === eC &&
                          0 !== eE &&
                          2 === em[eE - 1].getWidth(ec - 1) &&
                          (em[eE].copyCellsFrom(
                            em[eE - 1],
                            ec - 1,
                            eC++,
                            1,
                            !1,
                          ),
                          em[eE - 1].setCell(ec - 1, ed)));
                    }
                    em[eE].replaceCells(eC, ec, ed);
                    let eB = 0;
                    for (
                      let eA = em.length - 1;
                      eA > 0 && (eA > eE || 0 === em[eA].getTrimmedLength());
                      eA--
                    )
                      eB++;
                    (eB > 0 && (ep.push(eg + em.length - eB), ep.push(eB)),
                      (eg += em.length - 1));
                  }
                  return ep;
                }),
                (el.reflowLargerCreateNewLayout = function (eA, el) {
                  let ec = [],
                    eu = 0,
                    ed = el[0],
                    ep = 0;
                  for (let eg = 0; eg < eA.length; eg++)
                    if (ed === eg) {
                      let ec = el[++eu];
                      (eA.onDeleteEmitter.fire({ index: eg - ep, amount: ec }),
                        (eg += ec - 1),
                        (ep += ec),
                        (ed = el[++eu]));
                    } else ec.push(eg);
                  return { layout: ec, countRemoved: ep };
                }),
                (el.reflowLargerApplyNewLayout = function (eA, el) {
                  let ec = [];
                  for (let eu = 0; eu < el.length; eu++)
                    ec.push(eA.get(el[eu]));
                  for (let el = 0; el < ec.length; el++) eA.set(el, ec[el]);
                  eA.length = el.length;
                }),
                (el.reflowSmallerGetNewLineLengths = function (eA, el, ec) {
                  let eu = [],
                    ed = eA
                      .map((ec, eu) => i(eA, eu, el))
                      .reduce((eA, el) => eA + el),
                    ep = 0,
                    eg = 0,
                    eh = 0;
                  for (; eh < ed; ) {
                    if (ed - eh < ec) {
                      eu.push(ed - eh);
                      break;
                    }
                    ep += ec;
                    let ef = i(eA, eg, el);
                    ep > ef && ((ep -= ef), eg++);
                    let em = 2 === eA[eg].getWidth(ep - 1);
                    em && ep--;
                    let eE = em ? ec - 1 : ec;
                    (eu.push(eE), (eh += eE));
                  }
                  return eu;
                }),
                (el.getWrappedLineTrimmedLength = i));
            },
            295: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.BufferSet = void 0));
              let eu = ec(460),
                ed = ec(844),
                ep = ec(92);
              let a = class a extends ed.Disposable {
                constructor(eA, el) {
                  (super(),
                    (this._optionsService = eA),
                    (this._bufferService = el),
                    (this._onBufferActivate = this.register(
                      new eu.EventEmitter(),
                    )),
                    (this.onBufferActivate = this._onBufferActivate.event),
                    this.reset(),
                    this.register(
                      this._optionsService.onSpecificOptionChange(
                        "scrollback",
                        () =>
                          this.resize(
                            this._bufferService.cols,
                            this._bufferService.rows,
                          ),
                      ),
                    ),
                    this.register(
                      this._optionsService.onSpecificOptionChange(
                        "tabStopWidth",
                        () => this.setupTabStops(),
                      ),
                    ));
                }
                reset() {
                  ((this._normal = new ep.Buffer(
                    !0,
                    this._optionsService,
                    this._bufferService,
                  )),
                    this._normal.fillViewportRows(),
                    (this._alt = new ep.Buffer(
                      !1,
                      this._optionsService,
                      this._bufferService,
                    )),
                    (this._activeBuffer = this._normal),
                    this._onBufferActivate.fire({
                      activeBuffer: this._normal,
                      inactiveBuffer: this._alt,
                    }),
                    this.setupTabStops());
                }
                get alt() {
                  return this._alt;
                }
                get active() {
                  return this._activeBuffer;
                }
                get normal() {
                  return this._normal;
                }
                activateNormalBuffer() {
                  this._activeBuffer !== this._normal &&
                    ((this._normal.x = this._alt.x),
                    (this._normal.y = this._alt.y),
                    this._alt.clearAllMarkers(),
                    this._alt.clear(),
                    (this._activeBuffer = this._normal),
                    this._onBufferActivate.fire({
                      activeBuffer: this._normal,
                      inactiveBuffer: this._alt,
                    }));
                }
                activateAltBuffer(eA) {
                  this._activeBuffer !== this._alt &&
                    (this._alt.fillViewportRows(eA),
                    (this._alt.x = this._normal.x),
                    (this._alt.y = this._normal.y),
                    (this._activeBuffer = this._alt),
                    this._onBufferActivate.fire({
                      activeBuffer: this._alt,
                      inactiveBuffer: this._normal,
                    }));
                }
                resize(eA, el) {
                  (this._normal.resize(eA, el),
                    this._alt.resize(eA, el),
                    this.setupTabStops(eA));
                }
                setupTabStops(eA) {
                  (this._normal.setupTabStops(eA), this._alt.setupTabStops(eA));
                }
              };
              el.BufferSet = a;
            },
            511: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.CellData = void 0));
              let eu = ec(482),
                ed = ec(643),
                ep = ec(734);
              let a = class a extends ep.AttributeData {
                constructor() {
                  (super(...arguments),
                    (this.content = 0),
                    (this.fg = 0),
                    (this.bg = 0),
                    (this.extended = new ep.ExtendedAttrs()),
                    (this.combinedData = ""));
                }
                static fromCharData(eA) {
                  let el = new a();
                  return (el.setFromCharData(eA), el);
                }
                isCombined() {
                  return 2097152 & this.content;
                }
                getWidth() {
                  return this.content >> 22;
                }
                getChars() {
                  return 2097152 & this.content
                    ? this.combinedData
                    : 2097151 & this.content
                      ? (0, eu.stringFromCodePoint)(2097151 & this.content)
                      : "";
                }
                getCode() {
                  return this.isCombined()
                    ? this.combinedData.charCodeAt(this.combinedData.length - 1)
                    : 2097151 & this.content;
                }
                setFromCharData(eA) {
                  ((this.fg = eA[ed.CHAR_DATA_ATTR_INDEX]), (this.bg = 0));
                  let el = !1;
                  if (eA[ed.CHAR_DATA_CHAR_INDEX].length > 2) el = !0;
                  else if (2 === eA[ed.CHAR_DATA_CHAR_INDEX].length) {
                    let ec = eA[ed.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
                    if (55296 <= ec && ec <= 56319) {
                      let eu = eA[ed.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                      56320 <= eu && eu <= 57343
                        ? (this.content =
                            (1024 * (ec - 55296) + eu - 56320 + 65536) |
                            (eA[ed.CHAR_DATA_WIDTH_INDEX] << 22))
                        : (el = !0);
                    } else el = !0;
                  } else
                    this.content =
                      eA[ed.CHAR_DATA_CHAR_INDEX].charCodeAt(0) |
                      (eA[ed.CHAR_DATA_WIDTH_INDEX] << 22);
                  el &&
                    ((this.combinedData = eA[ed.CHAR_DATA_CHAR_INDEX]),
                    (this.content =
                      2097152 | (eA[ed.CHAR_DATA_WIDTH_INDEX] << 22)));
                }
                getAsCharData() {
                  return [
                    this.fg,
                    this.getChars(),
                    this.getWidth(),
                    this.getCode(),
                  ];
                }
              };
              el.CellData = a;
            },
            643: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.WHITESPACE_CELL_CODE =
                  el.WHITESPACE_CELL_WIDTH =
                  el.WHITESPACE_CELL_CHAR =
                  el.NULL_CELL_CODE =
                  el.NULL_CELL_WIDTH =
                  el.NULL_CELL_CHAR =
                  el.CHAR_DATA_CODE_INDEX =
                  el.CHAR_DATA_WIDTH_INDEX =
                  el.CHAR_DATA_CHAR_INDEX =
                  el.CHAR_DATA_ATTR_INDEX =
                  el.DEFAULT_EXT =
                  el.DEFAULT_ATTR =
                  el.DEFAULT_COLOR =
                    void 0),
                (el.DEFAULT_COLOR = 0),
                (el.DEFAULT_ATTR = 256 | (el.DEFAULT_COLOR << 9)),
                (el.DEFAULT_EXT = 0),
                (el.CHAR_DATA_ATTR_INDEX = 0),
                (el.CHAR_DATA_CHAR_INDEX = 1),
                (el.CHAR_DATA_WIDTH_INDEX = 2),
                (el.CHAR_DATA_CODE_INDEX = 3),
                (el.NULL_CELL_CHAR = ""),
                (el.NULL_CELL_WIDTH = 1),
                (el.NULL_CELL_CODE = 0),
                (el.WHITESPACE_CELL_CHAR = " "),
                (el.WHITESPACE_CELL_WIDTH = 1),
                (el.WHITESPACE_CELL_CODE = 32));
            },
            863: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.Marker = void 0));
              let eu = ec(460),
                ed = ec(844);
              let n = class n {
                get id() {
                  return this._id;
                }
                constructor(eA) {
                  ((this.line = eA),
                    (this.isDisposed = !1),
                    (this._disposables = []),
                    (this._id = n._nextId++),
                    (this._onDispose = this.register(new eu.EventEmitter())),
                    (this.onDispose = this._onDispose.event));
                }
                dispose() {
                  this.isDisposed ||
                    ((this.isDisposed = !0),
                    (this.line = -1),
                    this._onDispose.fire(),
                    (0, ed.disposeArray)(this._disposables),
                    (this._disposables.length = 0));
                }
                register(eA) {
                  return (this._disposables.push(eA), eA);
                }
              };
              ((el.Marker = n), (n._nextId = 1));
            },
            116: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.DEFAULT_CHARSET = el.CHARSETS = void 0),
                (el.CHARSETS = {}),
                (el.DEFAULT_CHARSET = el.CHARSETS.B),
                (el.CHARSETS[0] = {
                  "`": "◆",
                  a: "▒",
                  b: "␉",
                  c: "␌",
                  d: "␍",
                  e: "␊",
                  f: "\xb0",
                  g: "\xb1",
                  h: "␤",
                  i: "␋",
                  j: "┘",
                  k: "┐",
                  l: "┌",
                  m: "└",
                  n: "┼",
                  o: "⎺",
                  p: "⎻",
                  q: "─",
                  r: "⎼",
                  s: "⎽",
                  t: "├",
                  u: "┤",
                  v: "┴",
                  w: "┬",
                  x: "│",
                  y: "≤",
                  z: "≥",
                  "{": "π",
                  "|": "≠",
                  "}": "\xa3",
                  "~": "\xb7",
                }),
                (el.CHARSETS.A = { "#": "\xa3" }),
                (el.CHARSETS.B = void 0),
                (el.CHARSETS[4] = {
                  "#": "\xa3",
                  "@": "\xbe",
                  "[": "ij",
                  "\\": "\xbd",
                  "]": "|",
                  "{": "\xa8",
                  "|": "f",
                  "}": "\xbc",
                  "~": "\xb4",
                }),
                (el.CHARSETS.C = el.CHARSETS[5] =
                  {
                    "[": "\xc4",
                    "\\": "\xd6",
                    "]": "\xc5",
                    "^": "\xdc",
                    "`": "\xe9",
                    "{": "\xe4",
                    "|": "\xf6",
                    "}": "\xe5",
                    "~": "\xfc",
                  }),
                (el.CHARSETS.R = {
                  "#": "\xa3",
                  "@": "\xe0",
                  "[": "\xb0",
                  "\\": "\xe7",
                  "]": "\xa7",
                  "{": "\xe9",
                  "|": "\xf9",
                  "}": "\xe8",
                  "~": "\xa8",
                }),
                (el.CHARSETS.Q = {
                  "@": "\xe0",
                  "[": "\xe2",
                  "\\": "\xe7",
                  "]": "\xea",
                  "^": "\xee",
                  "`": "\xf4",
                  "{": "\xe9",
                  "|": "\xf9",
                  "}": "\xe8",
                  "~": "\xfb",
                }),
                (el.CHARSETS.K = {
                  "@": "\xa7",
                  "[": "\xc4",
                  "\\": "\xd6",
                  "]": "\xdc",
                  "{": "\xe4",
                  "|": "\xf6",
                  "}": "\xfc",
                  "~": "\xdf",
                }),
                (el.CHARSETS.Y = {
                  "#": "\xa3",
                  "@": "\xa7",
                  "[": "\xb0",
                  "\\": "\xe7",
                  "]": "\xe9",
                  "`": "\xf9",
                  "{": "\xe0",
                  "|": "\xf2",
                  "}": "\xe8",
                  "~": "\xec",
                }),
                (el.CHARSETS.E = el.CHARSETS[6] =
                  {
                    "@": "\xc4",
                    "[": "\xc6",
                    "\\": "\xd8",
                    "]": "\xc5",
                    "^": "\xdc",
                    "`": "\xe4",
                    "{": "\xe6",
                    "|": "\xf8",
                    "}": "\xe5",
                    "~": "\xfc",
                  }),
                (el.CHARSETS.Z = {
                  "#": "\xa3",
                  "@": "\xa7",
                  "[": "\xa1",
                  "\\": "\xd1",
                  "]": "\xbf",
                  "{": "\xb0",
                  "|": "\xf1",
                  "}": "\xe7",
                }),
                (el.CHARSETS.H = el.CHARSETS[7] =
                  {
                    "@": "\xc9",
                    "[": "\xc4",
                    "\\": "\xd6",
                    "]": "\xc5",
                    "^": "\xdc",
                    "`": "\xe9",
                    "{": "\xe4",
                    "|": "\xf6",
                    "}": "\xe5",
                    "~": "\xfc",
                  }),
                (el.CHARSETS["="] = {
                  "#": "\xf9",
                  "@": "\xe0",
                  "[": "\xe9",
                  "\\": "\xe7",
                  "]": "\xea",
                  "^": "\xee",
                  _: "\xe8",
                  "`": "\xf4",
                  "{": "\xe4",
                  "|": "\xf6",
                  "}": "\xfc",
                  "~": "\xfb",
                }));
            },
            584: (eA, el) => {
              var ec, eu, ed;
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.C1_ESCAPED = el.C1 = el.C0 = void 0),
                (function (eA) {
                  ((eA.NUL = "\0"),
                    (eA.SOH = "\x01"),
                    (eA.STX = "\x02"),
                    (eA.ETX = "\x03"),
                    (eA.EOT = "\x04"),
                    (eA.ENQ = "\x05"),
                    (eA.ACK = "\x06"),
                    (eA.BEL = "\x07"),
                    (eA.BS = "\b"),
                    (eA.HT = "	"),
                    (eA.LF = "\n"),
                    (eA.VT = "\v"),
                    (eA.FF = "\f"),
                    (eA.CR = "\r"),
                    (eA.SO = "\x0e"),
                    (eA.SI = "\x0f"),
                    (eA.DLE = "\x10"),
                    (eA.DC1 = "\x11"),
                    (eA.DC2 = "\x12"),
                    (eA.DC3 = "\x13"),
                    (eA.DC4 = "\x14"),
                    (eA.NAK = "\x15"),
                    (eA.SYN = "\x16"),
                    (eA.ETB = "\x17"),
                    (eA.CAN = "\x18"),
                    (eA.EM = "\x19"),
                    (eA.SUB = "\x1a"),
                    (eA.ESC = "\x1b"),
                    (eA.FS = "\x1c"),
                    (eA.GS = "\x1d"),
                    (eA.RS = "\x1e"),
                    (eA.US = "\x1f"),
                    (eA.SP = " "),
                    (eA.DEL = ""));
                })(ec || (el.C0 = ec = {})),
                (function (eA) {
                  ((eA.PAD = "\x80"),
                    (eA.HOP = "\x81"),
                    (eA.BPH = "\x82"),
                    (eA.NBH = "\x83"),
                    (eA.IND = "\x84"),
                    (eA.NEL = "\x85"),
                    (eA.SSA = "\x86"),
                    (eA.ESA = "\x87"),
                    (eA.HTS = "\x88"),
                    (eA.HTJ = "\x89"),
                    (eA.VTS = "\x8a"),
                    (eA.PLD = "\x8b"),
                    (eA.PLU = "\x8c"),
                    (eA.RI = "\x8d"),
                    (eA.SS2 = "\x8e"),
                    (eA.SS3 = "\x8f"),
                    (eA.DCS = "\x90"),
                    (eA.PU1 = "\x91"),
                    (eA.PU2 = "\x92"),
                    (eA.STS = "\x93"),
                    (eA.CCH = "\x94"),
                    (eA.MW = "\x95"),
                    (eA.SPA = "\x96"),
                    (eA.EPA = "\x97"),
                    (eA.SOS = "\x98"),
                    (eA.SGCI = "\x99"),
                    (eA.SCI = "\x9a"),
                    (eA.CSI = "\x9b"),
                    (eA.ST = "\x9c"),
                    (eA.OSC = "\x9d"),
                    (eA.PM = "\x9e"),
                    (eA.APC = "\x9f"));
                })(eu || (el.C1 = eu = {})),
                (function (eA) {
                  eA.ST = `${ec.ESC}\\`;
                })(ed || (el.C1_ESCAPED = ed = {})));
            },
            482: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.Utf8ToUtf32 =
                  el.StringToUtf32 =
                  el.utf32ToString =
                  el.stringFromCodePoint =
                    void 0),
                (el.stringFromCodePoint = function (eA) {
                  return eA > 65535
                    ? String.fromCharCode(55296 + ((eA -= 65536) >> 10)) +
                        String.fromCharCode((eA % 1024) + 56320)
                    : String.fromCharCode(eA);
                }),
                (el.utf32ToString = function (eA, el = 0, ec = eA.length) {
                  let eu = "";
                  for (let ed = el; ed < ec; ++ed) {
                    let el = eA[ed];
                    el > 65535
                      ? ((el -= 65536),
                        (eu +=
                          String.fromCharCode(55296 + (el >> 10)) +
                          String.fromCharCode((el % 1024) + 56320)))
                      : (eu += String.fromCharCode(el));
                  }
                  return eu;
                }),
                (el.StringToUtf32 = class {
                  constructor() {
                    this._interim = 0;
                  }
                  clear() {
                    this._interim = 0;
                  }
                  decode(eA, el) {
                    let ec = eA.length;
                    if (!ec) return 0;
                    let eu = 0,
                      ed = 0;
                    if (this._interim) {
                      let ec = eA.charCodeAt(ed++);
                      (56320 <= ec && ec <= 57343
                        ? (el[eu++] =
                            1024 * (this._interim - 55296) + ec - 56320 + 65536)
                        : ((el[eu++] = this._interim), (el[eu++] = ec)),
                        (this._interim = 0));
                    }
                    for (let ep = ed; ep < ec; ++ep) {
                      let ed = eA.charCodeAt(ep);
                      if (55296 <= ed && ed <= 56319) {
                        if (++ep >= ec) return ((this._interim = ed), eu);
                        let eg = eA.charCodeAt(ep);
                        56320 <= eg && eg <= 57343
                          ? (el[eu++] =
                              1024 * (ed - 55296) + eg - 56320 + 65536)
                          : ((el[eu++] = ed), (el[eu++] = eg));
                      } else 65279 !== ed && (el[eu++] = ed);
                    }
                    return eu;
                  }
                }),
                (el.Utf8ToUtf32 = class {
                  constructor() {
                    this.interim = new Uint8Array(3);
                  }
                  clear() {
                    this.interim.fill(0);
                  }
                  decode(eA, el) {
                    let ec = eA.length;
                    if (!ec) return 0;
                    let eu,
                      ed,
                      ep,
                      eg,
                      eh = 0,
                      ef = 0,
                      em = 0;
                    if (this.interim[0]) {
                      let eu = !1,
                        ed = this.interim[0];
                      ed &= 192 == (224 & ed) ? 31 : 224 == (240 & ed) ? 15 : 7;
                      let ep,
                        eg = 0;
                      for (; (ep = 63 & this.interim[++eg]) && eg < 4; )
                        ((ed <<= 6), (ed |= ep));
                      let ef =
                          192 == (224 & this.interim[0])
                            ? 2
                            : 224 == (240 & this.interim[0])
                              ? 3
                              : 4,
                        eE = ef - eg;
                      for (; em < eE; ) {
                        if (em >= ec) return 0;
                        if (128 != (192 & (ep = eA[em++]))) {
                          (em--, (eu = !0));
                          break;
                        }
                        ((this.interim[eg++] = ep),
                          (ed <<= 6),
                          (ed |= 63 & ep));
                      }
                      (eu ||
                        (2 === ef
                          ? ed < 128
                            ? em--
                            : (el[eh++] = ed)
                          : 3 === ef
                            ? ed < 2048 ||
                              (ed >= 55296 && ed <= 57343) ||
                              65279 === ed ||
                              (el[eh++] = ed)
                            : ed < 65536 || ed > 1114111 || (el[eh++] = ed)),
                        this.interim.fill(0));
                    }
                    let eE = ec - 4,
                      eC = em;
                    for (; eC < ec; ) {
                      for (
                        ;
                        !(
                          !(eC < eE) ||
                          128 & (eu = eA[eC]) ||
                          128 & (ed = eA[eC + 1]) ||
                          128 & (ep = eA[eC + 2]) ||
                          128 & (eg = eA[eC + 3])
                        );

                      )
                        ((el[eh++] = eu),
                          (el[eh++] = ed),
                          (el[eh++] = ep),
                          (el[eh++] = eg),
                          (eC += 4));
                      if ((eu = eA[eC++]) < 128) el[eh++] = eu;
                      else if (192 == (224 & eu)) {
                        if (eC >= ec) return ((this.interim[0] = eu), eh);
                        if (
                          128 != (192 & (ed = eA[eC++])) ||
                          (ef = ((31 & eu) << 6) | (63 & ed)) < 128
                        ) {
                          eC--;
                          continue;
                        }
                        el[eh++] = ef;
                      } else if (224 == (240 & eu)) {
                        if (eC >= ec) return ((this.interim[0] = eu), eh);
                        if (128 != (192 & (ed = eA[eC++]))) {
                          eC--;
                          continue;
                        }
                        if (eC >= ec)
                          return (
                            (this.interim[0] = eu),
                            (this.interim[1] = ed),
                            eh
                          );
                        if (128 != (192 & (ep = eA[eC++]))) {
                          eC--;
                          continue;
                        }
                        if (
                          (ef =
                            ((15 & eu) << 12) | ((63 & ed) << 6) | (63 & ep)) <
                            2048 ||
                          (ef >= 55296 && ef <= 57343) ||
                          65279 === ef
                        )
                          continue;
                        el[eh++] = ef;
                      } else if (240 == (248 & eu)) {
                        if (eC >= ec) return ((this.interim[0] = eu), eh);
                        if (128 != (192 & (ed = eA[eC++]))) {
                          eC--;
                          continue;
                        }
                        if (eC >= ec)
                          return (
                            (this.interim[0] = eu),
                            (this.interim[1] = ed),
                            eh
                          );
                        if (128 != (192 & (ep = eA[eC++]))) {
                          eC--;
                          continue;
                        }
                        if (eC >= ec)
                          return (
                            (this.interim[0] = eu),
                            (this.interim[1] = ed),
                            (this.interim[2] = ep),
                            eh
                          );
                        if (128 != (192 & (eg = eA[eC++]))) {
                          eC--;
                          continue;
                        }
                        if (
                          (ef =
                            ((7 & eu) << 18) |
                            ((63 & ed) << 12) |
                            ((63 & ep) << 6) |
                            (63 & eg)) < 65536 ||
                          ef > 1114111
                        )
                          continue;
                        el[eh++] = ef;
                      }
                    }
                    return eh;
                  }
                }));
            },
            225: (eA, el, ec) => {
              let eu;
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.UnicodeV6 = void 0));
              let ed = ec(480),
                ep = [
                  [768, 879],
                  [1155, 1158],
                  [1160, 1161],
                  [1425, 1469],
                  [1471, 1471],
                  [1473, 1474],
                  [1476, 1477],
                  [1479, 1479],
                  [1536, 1539],
                  [1552, 1557],
                  [1611, 1630],
                  [1648, 1648],
                  [1750, 1764],
                  [1767, 1768],
                  [1770, 1773],
                  [1807, 1807],
                  [1809, 1809],
                  [1840, 1866],
                  [1958, 1968],
                  [2027, 2035],
                  [2305, 2306],
                  [2364, 2364],
                  [2369, 2376],
                  [2381, 2381],
                  [2385, 2388],
                  [2402, 2403],
                  [2433, 2433],
                  [2492, 2492],
                  [2497, 2500],
                  [2509, 2509],
                  [2530, 2531],
                  [2561, 2562],
                  [2620, 2620],
                  [2625, 2626],
                  [2631, 2632],
                  [2635, 2637],
                  [2672, 2673],
                  [2689, 2690],
                  [2748, 2748],
                  [2753, 2757],
                  [2759, 2760],
                  [2765, 2765],
                  [2786, 2787],
                  [2817, 2817],
                  [2876, 2876],
                  [2879, 2879],
                  [2881, 2883],
                  [2893, 2893],
                  [2902, 2902],
                  [2946, 2946],
                  [3008, 3008],
                  [3021, 3021],
                  [3134, 3136],
                  [3142, 3144],
                  [3146, 3149],
                  [3157, 3158],
                  [3260, 3260],
                  [3263, 3263],
                  [3270, 3270],
                  [3276, 3277],
                  [3298, 3299],
                  [3393, 3395],
                  [3405, 3405],
                  [3530, 3530],
                  [3538, 3540],
                  [3542, 3542],
                  [3633, 3633],
                  [3636, 3642],
                  [3655, 3662],
                  [3761, 3761],
                  [3764, 3769],
                  [3771, 3772],
                  [3784, 3789],
                  [3864, 3865],
                  [3893, 3893],
                  [3895, 3895],
                  [3897, 3897],
                  [3953, 3966],
                  [3968, 3972],
                  [3974, 3975],
                  [3984, 3991],
                  [3993, 4028],
                  [4038, 4038],
                  [4141, 4144],
                  [4146, 4146],
                  [4150, 4151],
                  [4153, 4153],
                  [4184, 4185],
                  [4448, 4607],
                  [4959, 4959],
                  [5906, 5908],
                  [5938, 5940],
                  [5970, 5971],
                  [6002, 6003],
                  [6068, 6069],
                  [6071, 6077],
                  [6086, 6086],
                  [6089, 6099],
                  [6109, 6109],
                  [6155, 6157],
                  [6313, 6313],
                  [6432, 6434],
                  [6439, 6440],
                  [6450, 6450],
                  [6457, 6459],
                  [6679, 6680],
                  [6912, 6915],
                  [6964, 6964],
                  [6966, 6970],
                  [6972, 6972],
                  [6978, 6978],
                  [7019, 7027],
                  [7616, 7626],
                  [7678, 7679],
                  [8203, 8207],
                  [8234, 8238],
                  [8288, 8291],
                  [8298, 8303],
                  [8400, 8431],
                  [12330, 12335],
                  [12441, 12442],
                  [43014, 43014],
                  [43019, 43019],
                  [43045, 43046],
                  [64286, 64286],
                  [65024, 65039],
                  [65056, 65059],
                  [65279, 65279],
                  [65529, 65531],
                ],
                eg = [
                  [68097, 68099],
                  [68101, 68102],
                  [68108, 68111],
                  [68152, 68154],
                  [68159, 68159],
                  [119143, 119145],
                  [119155, 119170],
                  [119173, 119179],
                  [119210, 119213],
                  [119362, 119364],
                  [917505, 917505],
                  [917536, 917631],
                  [917760, 917999],
                ];
              el.UnicodeV6 = class {
                constructor() {
                  if (((this.version = "6"), !eu)) {
                    ((eu = new Uint8Array(65536)).fill(1),
                      (eu[0] = 0),
                      eu.fill(0, 1, 32),
                      eu.fill(0, 127, 160),
                      eu.fill(2, 4352, 4448),
                      (eu[9001] = 2),
                      (eu[9002] = 2),
                      eu.fill(2, 11904, 42192),
                      (eu[12351] = 1),
                      eu.fill(2, 44032, 55204),
                      eu.fill(2, 63744, 64256),
                      eu.fill(2, 65040, 65050),
                      eu.fill(2, 65072, 65136),
                      eu.fill(2, 65280, 65377),
                      eu.fill(2, 65504, 65511));
                    for (let eA = 0; eA < ep.length; ++eA)
                      eu.fill(0, ep[eA][0], ep[eA][1] + 1);
                  }
                }
                wcwidth(eA) {
                  return eA < 32
                    ? 0
                    : eA < 127
                      ? 1
                      : eA < 65536
                        ? eu[eA]
                        : !(function (eA, el) {
                              let ec,
                                eu = 0,
                                ed = el.length - 1;
                              if (eA < el[0][0] || eA > el[ed][1]) return !1;
                              for (; ed >= eu; )
                                if (eA > el[(ec = (eu + ed) >> 1)][1])
                                  eu = ec + 1;
                                else {
                                  if (!(eA < el[ec][0])) return !0;
                                  ed = ec - 1;
                                }
                              return !1;
                            })(eA, eg)
                          ? (eA >= 131072 && eA <= 196605) ||
                            (eA >= 196608 && eA <= 262141)
                            ? 2
                            : 1
                          : 0;
                }
                charProperties(eA, el) {
                  let ec = this.wcwidth(eA),
                    eu = 0 === ec && 0 !== el;
                  if (eu) {
                    let eA = ed.UnicodeService.extractWidth(el);
                    0 === eA ? (eu = !1) : eA > ec && (ec = eA);
                  }
                  return ed.UnicodeService.createPropertyValue(0, ec, eu);
                }
              };
            },
            981: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.WriteBuffer = void 0));
              let eu = ec(460),
                ed = ec(844);
              let n = class n extends ed.Disposable {
                constructor(eA) {
                  (super(),
                    (this._action = eA),
                    (this._writeBuffer = []),
                    (this._callbacks = []),
                    (this._pendingData = 0),
                    (this._bufferOffset = 0),
                    (this._isSyncWriting = !1),
                    (this._syncCalls = 0),
                    (this._didUserInput = !1),
                    (this._onWriteParsed = this.register(
                      new eu.EventEmitter(),
                    )),
                    (this.onWriteParsed = this._onWriteParsed.event));
                }
                handleUserInput() {
                  this._didUserInput = !0;
                }
                writeSync(eA, el) {
                  let ec;
                  if (void 0 !== el && this._syncCalls > el)
                    return void (this._syncCalls = 0);
                  if (
                    ((this._pendingData += eA.length),
                    this._writeBuffer.push(eA),
                    this._callbacks.push(void 0),
                    this._syncCalls++,
                    !this._isSyncWriting)
                  ) {
                    for (
                      this._isSyncWriting = !0;
                      (ec = this._writeBuffer.shift());

                    ) {
                      this._action(ec);
                      let eA = this._callbacks.shift();
                      eA && eA();
                    }
                    ((this._pendingData = 0),
                      (this._bufferOffset = 0x7fffffff),
                      (this._isSyncWriting = !1),
                      (this._syncCalls = 0));
                  }
                }
                write(eA, el) {
                  if (this._pendingData > 5e7)
                    throw Error(
                      "write data discarded, use flow control to avoid losing data",
                    );
                  if (!this._writeBuffer.length) {
                    if (((this._bufferOffset = 0), this._didUserInput))
                      return (
                        (this._didUserInput = !1),
                        (this._pendingData += eA.length),
                        this._writeBuffer.push(eA),
                        this._callbacks.push(el),
                        void this._innerWrite()
                      );
                    setTimeout(() => this._innerWrite());
                  }
                  ((this._pendingData += eA.length),
                    this._writeBuffer.push(eA),
                    this._callbacks.push(el));
                }
                _innerWrite(eA = 0, el = !0) {
                  let ec = eA || Date.now();
                  for (; this._writeBuffer.length > this._bufferOffset; ) {
                    let eA = this._writeBuffer[this._bufferOffset],
                      eu = this._action(eA, el);
                    if (eu) {
                      let e = (eA) =>
                        Date.now() - ec >= 12
                          ? setTimeout(() => this._innerWrite(0, eA))
                          : this._innerWrite(ec, eA);
                      return void eu
                        .catch(
                          (eA) => (
                            queueMicrotask(() => {
                              throw eA;
                            }),
                            Promise.resolve(!1)
                          ),
                        )
                        .then(e);
                    }
                    let ed = this._callbacks[this._bufferOffset];
                    if (
                      (ed && ed(),
                      this._bufferOffset++,
                      (this._pendingData -= eA.length),
                      Date.now() - ec >= 12)
                    )
                      break;
                  }
                  (this._writeBuffer.length > this._bufferOffset
                    ? (this._bufferOffset > 50 &&
                        ((this._writeBuffer = this._writeBuffer.slice(
                          this._bufferOffset,
                        )),
                        (this._callbacks = this._callbacks.slice(
                          this._bufferOffset,
                        )),
                        (this._bufferOffset = 0)),
                      setTimeout(() => this._innerWrite()))
                    : ((this._writeBuffer.length = 0),
                      (this._callbacks.length = 0),
                      (this._pendingData = 0),
                      (this._bufferOffset = 0)),
                    this._onWriteParsed.fire());
                }
              };
              el.WriteBuffer = n;
            },
            941: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.toRgbString = el.parseColor = void 0));
              let ec =
                  /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/,
                eu = /^[\da-f]+$/;
              function r(eA, el) {
                let ec = eA.toString(16),
                  eu = ec.length < 2 ? "0" + ec : ec;
                switch (el) {
                  case 4:
                    return ec[0];
                  case 8:
                    return eu;
                  case 12:
                    return (eu + eu).slice(0, 3);
                  default:
                    return eu + eu;
                }
              }
              ((el.parseColor = function (eA) {
                if (!eA) return;
                let el = eA.toLowerCase();
                if (0 === el.indexOf("rgb:")) {
                  el = el.slice(4);
                  let eA = ec.exec(el);
                  if (eA) {
                    let el = eA[1] ? 15 : eA[4] ? 255 : eA[7] ? 4095 : 65535;
                    return [
                      Math.round(
                        (parseInt(eA[1] || eA[4] || eA[7] || eA[10], 16) / el) *
                          255,
                      ),
                      Math.round(
                        (parseInt(eA[2] || eA[5] || eA[8] || eA[11], 16) / el) *
                          255,
                      ),
                      Math.round(
                        (parseInt(eA[3] || eA[6] || eA[9] || eA[12], 16) / el) *
                          255,
                      ),
                    ];
                  }
                } else if (
                  0 === el.indexOf("#") &&
                  ((el = el.slice(1)),
                  eu.exec(el) && [3, 6, 9, 12].includes(el.length))
                ) {
                  let eA = el.length / 3,
                    ec = [0, 0, 0];
                  for (let eu = 0; eu < 3; ++eu) {
                    let ed = parseInt(el.slice(eA * eu, eA * eu + eA), 16);
                    ec[eu] =
                      1 === eA
                        ? ed << 4
                        : 2 === eA
                          ? ed
                          : 3 === eA
                            ? ed >> 4
                            : ed >> 8;
                  }
                  return ec;
                }
              }),
                (el.toRgbString = function (eA, el = 16) {
                  let [ec, eu, ed] = eA;
                  return `rgb:${r(ec, el)}/${r(eu, el)}/${r(ed, el)}`;
                }));
            },
            770: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.PAYLOAD_LIMIT = void 0),
                (el.PAYLOAD_LIMIT = 1e7));
            },
            351: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.DcsHandler = el.DcsParser = void 0));
              let eu = ec(482),
                ed = ec(742),
                ep = ec(770),
                eg = [];
              el.DcsParser = class {
                constructor() {
                  ((this._handlers = Object.create(null)),
                    (this._active = eg),
                    (this._ident = 0),
                    (this._handlerFb = () => {}),
                    (this._stack = {
                      paused: !1,
                      loopPosition: 0,
                      fallThrough: !1,
                    }));
                }
                dispose() {
                  ((this._handlers = Object.create(null)),
                    (this._handlerFb = () => {}),
                    (this._active = eg));
                }
                registerHandler(eA, el) {
                  void 0 === this._handlers[eA] && (this._handlers[eA] = []);
                  let ec = this._handlers[eA];
                  return (
                    ec.push(el),
                    {
                      dispose: () => {
                        let eA = ec.indexOf(el);
                        -1 !== eA && ec.splice(eA, 1);
                      },
                    }
                  );
                }
                clearHandler(eA) {
                  this._handlers[eA] && delete this._handlers[eA];
                }
                setHandlerFallback(eA) {
                  this._handlerFb = eA;
                }
                reset() {
                  if (this._active.length)
                    for (
                      let eA = this._stack.paused
                        ? this._stack.loopPosition - 1
                        : this._active.length - 1;
                      eA >= 0;
                      --eA
                    )
                      this._active[eA].unhook(!1);
                  ((this._stack.paused = !1),
                    (this._active = eg),
                    (this._ident = 0));
                }
                hook(eA, el) {
                  if (
                    (this.reset(),
                    (this._ident = eA),
                    (this._active = this._handlers[eA] || eg),
                    this._active.length)
                  )
                    for (let eA = this._active.length - 1; eA >= 0; eA--)
                      this._active[eA].hook(el);
                  else this._handlerFb(this._ident, "HOOK", el);
                }
                put(eA, el, ec) {
                  if (this._active.length)
                    for (let eu = this._active.length - 1; eu >= 0; eu--)
                      this._active[eu].put(eA, el, ec);
                  else
                    this._handlerFb(
                      this._ident,
                      "PUT",
                      (0, eu.utf32ToString)(eA, el, ec),
                    );
                }
                unhook(eA, el = !0) {
                  if (this._active.length) {
                    let ec = !1,
                      eu = this._active.length - 1,
                      ed = !1;
                    if (
                      (this._stack.paused &&
                        ((eu = this._stack.loopPosition - 1),
                        (ec = el),
                        (ed = this._stack.fallThrough),
                        (this._stack.paused = !1)),
                      !ed && !1 === ec)
                    ) {
                      for (
                        ;
                        eu >= 0 && !0 !== (ec = this._active[eu].unhook(eA));
                        eu--
                      )
                        if (ec instanceof Promise)
                          return (
                            (this._stack.paused = !0),
                            (this._stack.loopPosition = eu),
                            (this._stack.fallThrough = !1),
                            ec
                          );
                      eu--;
                    }
                    for (; eu >= 0; eu--)
                      if ((ec = this._active[eu].unhook(!1)) instanceof Promise)
                        return (
                          (this._stack.paused = !0),
                          (this._stack.loopPosition = eu),
                          (this._stack.fallThrough = !0),
                          ec
                        );
                  } else this._handlerFb(this._ident, "UNHOOK", eA);
                  ((this._active = eg), (this._ident = 0));
                }
              };
              let eh = new ed.Params();
              (eh.addParam(0),
                (el.DcsHandler = class {
                  constructor(eA) {
                    ((this._handler = eA),
                      (this._data = ""),
                      (this._params = eh),
                      (this._hitLimit = !1));
                  }
                  hook(eA) {
                    ((this._params =
                      eA.length > 1 || eA.params[0] ? eA.clone() : eh),
                      (this._data = ""),
                      (this._hitLimit = !1));
                  }
                  put(eA, el, ec) {
                    this._hitLimit ||
                      ((this._data += (0, eu.utf32ToString)(eA, el, ec)),
                      this._data.length > ep.PAYLOAD_LIMIT &&
                        ((this._data = ""), (this._hitLimit = !0)));
                  }
                  unhook(eA) {
                    let el = !1;
                    if (this._hitLimit) el = !1;
                    else if (
                      eA &&
                      (el = this._handler(this._data, this._params)) instanceof
                        Promise
                    )
                      return el.then(
                        (eA) => (
                          (this._params = eh),
                          (this._data = ""),
                          (this._hitLimit = !1),
                          eA
                        ),
                      );
                    return (
                      (this._params = eh),
                      (this._data = ""),
                      (this._hitLimit = !1),
                      el
                    );
                  }
                }));
            },
            15: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.EscapeSequenceParser =
                  el.VT500_TRANSITION_TABLE =
                  el.TransitionTable =
                    void 0));
              let eu = ec(844),
                ed = ec(742),
                ep = ec(242),
                eg = ec(351);
              let o = class o {
                constructor(eA) {
                  this.table = new Uint8Array(eA);
                }
                setDefault(eA, el) {
                  this.table.fill((eA << 4) | el);
                }
                add(eA, el, ec, eu) {
                  this.table[(el << 8) | eA] = (ec << 4) | eu;
                }
                addMany(eA, el, ec, eu) {
                  for (let ed = 0; ed < eA.length; ed++)
                    this.table[(el << 8) | eA[ed]] = (ec << 4) | eu;
                }
              };
              el.TransitionTable = o;
              let eh = 160;
              el.VT500_TRANSITION_TABLE = (function () {
                let eA,
                  el = new o(4095),
                  ec = Array.apply(null, Array(256)).map((eA, el) => el),
                  i = (eA, el) => ec.slice(eA, el),
                  eu = i(32, 127),
                  ed = i(0, 24);
                (ed.push(25), ed.push.apply(ed, i(28, 32)));
                let ep = i(0, 14);
                for (eA in (el.setDefault(1, 0), el.addMany(eu, 0, 2, 0), ep))
                  (el.addMany([24, 26, 153, 154], eA, 3, 0),
                    el.addMany(i(128, 144), eA, 3, 0),
                    el.addMany(i(144, 152), eA, 3, 0),
                    el.add(156, eA, 0, 0),
                    el.add(27, eA, 11, 1),
                    el.add(157, eA, 4, 8),
                    el.addMany([152, 158, 159], eA, 0, 7),
                    el.add(155, eA, 11, 3),
                    el.add(144, eA, 11, 9));
                return (
                  el.addMany(ed, 0, 3, 0),
                  el.addMany(ed, 1, 3, 1),
                  el.add(127, 1, 0, 1),
                  el.addMany(ed, 8, 0, 8),
                  el.addMany(ed, 3, 3, 3),
                  el.add(127, 3, 0, 3),
                  el.addMany(ed, 4, 3, 4),
                  el.add(127, 4, 0, 4),
                  el.addMany(ed, 6, 3, 6),
                  el.addMany(ed, 5, 3, 5),
                  el.add(127, 5, 0, 5),
                  el.addMany(ed, 2, 3, 2),
                  el.add(127, 2, 0, 2),
                  el.add(93, 1, 4, 8),
                  el.addMany(eu, 8, 5, 8),
                  el.add(127, 8, 5, 8),
                  el.addMany([156, 27, 24, 26, 7], 8, 6, 0),
                  el.addMany(i(28, 32), 8, 0, 8),
                  el.addMany([88, 94, 95], 1, 0, 7),
                  el.addMany(eu, 7, 0, 7),
                  el.addMany(ed, 7, 0, 7),
                  el.add(156, 7, 0, 0),
                  el.add(127, 7, 0, 7),
                  el.add(91, 1, 11, 3),
                  el.addMany(i(64, 127), 3, 7, 0),
                  el.addMany(i(48, 60), 3, 8, 4),
                  el.addMany([60, 61, 62, 63], 3, 9, 4),
                  el.addMany(i(48, 60), 4, 8, 4),
                  el.addMany(i(64, 127), 4, 7, 0),
                  el.addMany([60, 61, 62, 63], 4, 0, 6),
                  el.addMany(i(32, 64), 6, 0, 6),
                  el.add(127, 6, 0, 6),
                  el.addMany(i(64, 127), 6, 0, 0),
                  el.addMany(i(32, 48), 3, 9, 5),
                  el.addMany(i(32, 48), 5, 9, 5),
                  el.addMany(i(48, 64), 5, 0, 6),
                  el.addMany(i(64, 127), 5, 7, 0),
                  el.addMany(i(32, 48), 4, 9, 5),
                  el.addMany(i(32, 48), 1, 9, 2),
                  el.addMany(i(32, 48), 2, 9, 2),
                  el.addMany(i(48, 127), 2, 10, 0),
                  el.addMany(i(48, 80), 1, 10, 0),
                  el.addMany(i(81, 88), 1, 10, 0),
                  el.addMany([89, 90, 92], 1, 10, 0),
                  el.addMany(i(96, 127), 1, 10, 0),
                  el.add(80, 1, 11, 9),
                  el.addMany(ed, 9, 0, 9),
                  el.add(127, 9, 0, 9),
                  el.addMany(i(28, 32), 9, 0, 9),
                  el.addMany(i(32, 48), 9, 9, 12),
                  el.addMany(i(48, 60), 9, 8, 10),
                  el.addMany([60, 61, 62, 63], 9, 9, 10),
                  el.addMany(ed, 11, 0, 11),
                  el.addMany(i(32, 128), 11, 0, 11),
                  el.addMany(i(28, 32), 11, 0, 11),
                  el.addMany(ed, 10, 0, 10),
                  el.add(127, 10, 0, 10),
                  el.addMany(i(28, 32), 10, 0, 10),
                  el.addMany(i(48, 60), 10, 8, 10),
                  el.addMany([60, 61, 62, 63], 10, 0, 11),
                  el.addMany(i(32, 48), 10, 9, 12),
                  el.addMany(ed, 12, 0, 12),
                  el.add(127, 12, 0, 12),
                  el.addMany(i(28, 32), 12, 0, 12),
                  el.addMany(i(32, 48), 12, 9, 12),
                  el.addMany(i(48, 64), 12, 0, 11),
                  el.addMany(i(64, 127), 12, 12, 13),
                  el.addMany(i(64, 127), 10, 12, 13),
                  el.addMany(i(64, 127), 9, 12, 13),
                  el.addMany(ed, 13, 13, 13),
                  el.addMany(eu, 13, 13, 13),
                  el.add(127, 13, 0, 13),
                  el.addMany([27, 156, 24, 26], 13, 14, 0),
                  el.add(eh, 0, 2, 0),
                  el.add(eh, 8, 5, 8),
                  el.add(eh, 6, 0, 6),
                  el.add(eh, 11, 0, 11),
                  el.add(eh, 13, 13, 13),
                  el
                );
              })();
              let c = class c extends eu.Disposable {
                constructor(eA = el.VT500_TRANSITION_TABLE) {
                  (super(),
                    (this._transitions = eA),
                    (this._parseStack = {
                      state: 0,
                      handlers: [],
                      handlerPos: 0,
                      transition: 0,
                      chunkPos: 0,
                    }),
                    (this.initialState = 0),
                    (this.currentState = this.initialState),
                    (this._params = new ed.Params()),
                    this._params.addParam(0),
                    (this._collect = 0),
                    (this.precedingJoinState = 0),
                    (this._printHandlerFb = (eA, el, ec) => {}),
                    (this._executeHandlerFb = (eA) => {}),
                    (this._csiHandlerFb = (eA, el) => {}),
                    (this._escHandlerFb = (eA) => {}),
                    (this._errorHandlerFb = (eA) => eA),
                    (this._printHandler = this._printHandlerFb),
                    (this._executeHandlers = Object.create(null)),
                    (this._csiHandlers = Object.create(null)),
                    (this._escHandlers = Object.create(null)),
                    this.register(
                      (0, eu.toDisposable)(() => {
                        ((this._csiHandlers = Object.create(null)),
                          (this._executeHandlers = Object.create(null)),
                          (this._escHandlers = Object.create(null)));
                      }),
                    ),
                    (this._oscParser = this.register(new ep.OscParser())),
                    (this._dcsParser = this.register(new eg.DcsParser())),
                    (this._errorHandler = this._errorHandlerFb),
                    this.registerEscHandler({ final: "\\" }, () => !0));
                }
                _identifier(eA, el = [64, 126]) {
                  let ec = 0;
                  if (eA.prefix) {
                    if (eA.prefix.length > 1)
                      throw Error("only one byte as prefix supported");
                    if (((ec = eA.prefix.charCodeAt(0)) && 60 > ec) || ec > 63)
                      throw Error("prefix must be in range 0x3c .. 0x3f");
                  }
                  if (eA.intermediates) {
                    if (eA.intermediates.length > 2)
                      throw Error(
                        "only two bytes as intermediates are supported",
                      );
                    for (let el = 0; el < eA.intermediates.length; ++el) {
                      let eu = eA.intermediates.charCodeAt(el);
                      if (32 > eu || eu > 47)
                        throw Error(
                          "intermediate must be in range 0x20 .. 0x2f",
                        );
                      ((ec <<= 8), (ec |= eu));
                    }
                  }
                  if (1 !== eA.final.length)
                    throw Error("final must be a single byte");
                  let eu = eA.final.charCodeAt(0);
                  if (el[0] > eu || eu > el[1])
                    throw Error(`final must be in range ${el[0]} .. ${el[1]}`);
                  return ((ec <<= 8), (ec |= eu));
                }
                identToString(eA) {
                  let el = [];
                  for (; eA; )
                    (el.push(String.fromCharCode(255 & eA)), (eA >>= 8));
                  return el.reverse().join("");
                }
                setPrintHandler(eA) {
                  this._printHandler = eA;
                }
                clearPrintHandler() {
                  this._printHandler = this._printHandlerFb;
                }
                registerEscHandler(eA, el) {
                  let ec = this._identifier(eA, [48, 126]);
                  void 0 === this._escHandlers[ec] &&
                    (this._escHandlers[ec] = []);
                  let eu = this._escHandlers[ec];
                  return (
                    eu.push(el),
                    {
                      dispose: () => {
                        let eA = eu.indexOf(el);
                        -1 !== eA && eu.splice(eA, 1);
                      },
                    }
                  );
                }
                clearEscHandler(eA) {
                  this._escHandlers[this._identifier(eA, [48, 126])] &&
                    delete this._escHandlers[this._identifier(eA, [48, 126])];
                }
                setEscHandlerFallback(eA) {
                  this._escHandlerFb = eA;
                }
                setExecuteHandler(eA, el) {
                  this._executeHandlers[eA.charCodeAt(0)] = el;
                }
                clearExecuteHandler(eA) {
                  this._executeHandlers[eA.charCodeAt(0)] &&
                    delete this._executeHandlers[eA.charCodeAt(0)];
                }
                setExecuteHandlerFallback(eA) {
                  this._executeHandlerFb = eA;
                }
                registerCsiHandler(eA, el) {
                  let ec = this._identifier(eA);
                  void 0 === this._csiHandlers[ec] &&
                    (this._csiHandlers[ec] = []);
                  let eu = this._csiHandlers[ec];
                  return (
                    eu.push(el),
                    {
                      dispose: () => {
                        let eA = eu.indexOf(el);
                        -1 !== eA && eu.splice(eA, 1);
                      },
                    }
                  );
                }
                clearCsiHandler(eA) {
                  this._csiHandlers[this._identifier(eA)] &&
                    delete this._csiHandlers[this._identifier(eA)];
                }
                setCsiHandlerFallback(eA) {
                  this._csiHandlerFb = eA;
                }
                registerDcsHandler(eA, el) {
                  return this._dcsParser.registerHandler(
                    this._identifier(eA),
                    el,
                  );
                }
                clearDcsHandler(eA) {
                  this._dcsParser.clearHandler(this._identifier(eA));
                }
                setDcsHandlerFallback(eA) {
                  this._dcsParser.setHandlerFallback(eA);
                }
                registerOscHandler(eA, el) {
                  return this._oscParser.registerHandler(eA, el);
                }
                clearOscHandler(eA) {
                  this._oscParser.clearHandler(eA);
                }
                setOscHandlerFallback(eA) {
                  this._oscParser.setHandlerFallback(eA);
                }
                setErrorHandler(eA) {
                  this._errorHandler = eA;
                }
                clearErrorHandler() {
                  this._errorHandler = this._errorHandlerFb;
                }
                reset() {
                  ((this.currentState = this.initialState),
                    this._oscParser.reset(),
                    this._dcsParser.reset(),
                    this._params.reset(),
                    this._params.addParam(0),
                    (this._collect = 0),
                    (this.precedingJoinState = 0),
                    0 !== this._parseStack.state &&
                      ((this._parseStack.state = 2),
                      (this._parseStack.handlers = [])));
                }
                _preserveStack(eA, el, ec, eu, ed) {
                  ((this._parseStack.state = eA),
                    (this._parseStack.handlers = el),
                    (this._parseStack.handlerPos = ec),
                    (this._parseStack.transition = eu),
                    (this._parseStack.chunkPos = ed));
                }
                parse(eA, el, ec) {
                  let eu,
                    ed = 0,
                    ep = 0,
                    eg = 0;
                  if (this._parseStack.state)
                    if (2 === this._parseStack.state)
                      ((this._parseStack.state = 0),
                        (eg = this._parseStack.chunkPos + 1));
                    else {
                      if (void 0 === ec || 1 === this._parseStack.state)
                        throw (
                          (this._parseStack.state = 1),
                          Error(
                            "improper continuation due to previous async handler, giving up parsing",
                          )
                        );
                      let el = this._parseStack.handlers,
                        ep = this._parseStack.handlerPos - 1;
                      switch (this._parseStack.state) {
                        case 3:
                          if (!1 === ec && ep > -1) {
                            for (
                              ;
                              ep >= 0 && !0 !== (eu = el[ep](this._params));
                              ep--
                            )
                              if (eu instanceof Promise)
                                return ((this._parseStack.handlerPos = ep), eu);
                          }
                          this._parseStack.handlers = [];
                          break;
                        case 4:
                          if (!1 === ec && ep > -1) {
                            for (; ep >= 0 && !0 !== (eu = el[ep]()); ep--)
                              if (eu instanceof Promise)
                                return ((this._parseStack.handlerPos = ep), eu);
                          }
                          this._parseStack.handlers = [];
                          break;
                        case 6:
                          if (
                            ((ed = eA[this._parseStack.chunkPos]),
                            (eu = this._dcsParser.unhook(
                              24 !== ed && 26 !== ed,
                              ec,
                            )))
                          )
                            return eu;
                          (27 === ed && (this._parseStack.transition |= 1),
                            this._params.reset(),
                            this._params.addParam(0),
                            (this._collect = 0));
                          break;
                        case 5:
                          if (
                            ((ed = eA[this._parseStack.chunkPos]),
                            (eu = this._oscParser.end(
                              24 !== ed && 26 !== ed,
                              ec,
                            )))
                          )
                            return eu;
                          (27 === ed && (this._parseStack.transition |= 1),
                            this._params.reset(),
                            this._params.addParam(0),
                            (this._collect = 0));
                      }
                      ((this._parseStack.state = 0),
                        (eg = this._parseStack.chunkPos + 1),
                        (this.precedingJoinState = 0),
                        (this.currentState = 15 & this._parseStack.transition));
                    }
                  for (let ec = eg; ec < el; ++ec) {
                    switch (
                      ((ed = eA[ec]),
                      (ep =
                        this._transitions.table[
                          (this.currentState << 8) | (ed < 160 ? ed : eh)
                        ]) >> 4)
                    ) {
                      case 2:
                        for (let eu = ec + 1; ; ++eu)
                          if (
                            eu >= el ||
                            (ed = eA[eu]) < 32 ||
                            (ed > 126 && ed < eh) ||
                            ++eu >= el ||
                            (ed = eA[eu]) < 32 ||
                            (ed > 126 && ed < eh) ||
                            ++eu >= el ||
                            (ed = eA[eu]) < 32 ||
                            (ed > 126 && ed < eh) ||
                            ++eu >= el ||
                            (ed = eA[eu]) < 32 ||
                            (ed > 126 && ed < eh)
                          ) {
                            (this._printHandler(eA, ec, eu), (ec = eu - 1));
                            break;
                          }
                        break;
                      case 3:
                        (this._executeHandlers[ed]
                          ? this._executeHandlers[ed]()
                          : this._executeHandlerFb(ed),
                          (this.precedingJoinState = 0));
                        break;
                      case 0:
                        break;
                      case 1:
                        if (
                          this._errorHandler({
                            position: ec,
                            code: ed,
                            currentState: this.currentState,
                            collect: this._collect,
                            params: this._params,
                            abort: !1,
                          }).abort
                        )
                          return;
                        break;
                      case 7:
                        let eg = this._csiHandlers[(this._collect << 8) | ed],
                          ef = eg ? eg.length - 1 : -1;
                        for (
                          ;
                          ef >= 0 && !0 !== (eu = eg[ef](this._params));
                          ef--
                        )
                          if (eu instanceof Promise)
                            return (this._preserveStack(3, eg, ef, ep, ec), eu);
                        (ef < 0 &&
                          this._csiHandlerFb(
                            (this._collect << 8) | ed,
                            this._params,
                          ),
                          (this.precedingJoinState = 0));
                        break;
                      case 8:
                        do
                          switch (ed) {
                            case 59:
                              this._params.addParam(0);
                              break;
                            case 58:
                              this._params.addSubParam(-1);
                              break;
                            default:
                              this._params.addDigit(ed - 48);
                          }
                        while (++ec < el && (ed = eA[ec]) > 47 && ed < 60);
                        ec--;
                        break;
                      case 9:
                        ((this._collect <<= 8), (this._collect |= ed));
                        break;
                      case 10:
                        let em = this._escHandlers[(this._collect << 8) | ed],
                          eE = em ? em.length - 1 : -1;
                        for (; eE >= 0 && !0 !== (eu = em[eE]()); eE--)
                          if (eu instanceof Promise)
                            return (this._preserveStack(4, em, eE, ep, ec), eu);
                        (eE < 0 &&
                          this._escHandlerFb((this._collect << 8) | ed),
                          (this.precedingJoinState = 0));
                        break;
                      case 11:
                        (this._params.reset(),
                          this._params.addParam(0),
                          (this._collect = 0));
                        break;
                      case 12:
                        this._dcsParser.hook(
                          (this._collect << 8) | ed,
                          this._params,
                        );
                        break;
                      case 13:
                        for (let eu = ec + 1; ; ++eu)
                          if (
                            eu >= el ||
                            24 === (ed = eA[eu]) ||
                            26 === ed ||
                            27 === ed ||
                            (ed > 127 && ed < eh)
                          ) {
                            (this._dcsParser.put(eA, ec, eu), (ec = eu - 1));
                            break;
                          }
                        break;
                      case 14:
                        if (
                          (eu = this._dcsParser.unhook(24 !== ed && 26 !== ed))
                        )
                          return (this._preserveStack(6, [], 0, ep, ec), eu);
                        (27 === ed && (ep |= 1),
                          this._params.reset(),
                          this._params.addParam(0),
                          (this._collect = 0),
                          (this.precedingJoinState = 0));
                        break;
                      case 4:
                        this._oscParser.start();
                        break;
                      case 5:
                        for (let eu = ec + 1; ; eu++)
                          if (
                            eu >= el ||
                            (ed = eA[eu]) < 32 ||
                            (ed > 127 && ed < eh)
                          ) {
                            (this._oscParser.put(eA, ec, eu), (ec = eu - 1));
                            break;
                          }
                        break;
                      case 6:
                        if ((eu = this._oscParser.end(24 !== ed && 26 !== ed)))
                          return (this._preserveStack(5, [], 0, ep, ec), eu);
                        (27 === ed && (ep |= 1),
                          this._params.reset(),
                          this._params.addParam(0),
                          (this._collect = 0),
                          (this.precedingJoinState = 0));
                    }
                    this.currentState = 15 & ep;
                  }
                }
              };
              el.EscapeSequenceParser = c;
            },
            242: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.OscHandler = el.OscParser = void 0));
              let eu = ec(770),
                ed = ec(482),
                ep = [];
              ((el.OscParser = class {
                constructor() {
                  ((this._state = 0),
                    (this._active = ep),
                    (this._id = -1),
                    (this._handlers = Object.create(null)),
                    (this._handlerFb = () => {}),
                    (this._stack = {
                      paused: !1,
                      loopPosition: 0,
                      fallThrough: !1,
                    }));
                }
                registerHandler(eA, el) {
                  void 0 === this._handlers[eA] && (this._handlers[eA] = []);
                  let ec = this._handlers[eA];
                  return (
                    ec.push(el),
                    {
                      dispose: () => {
                        let eA = ec.indexOf(el);
                        -1 !== eA && ec.splice(eA, 1);
                      },
                    }
                  );
                }
                clearHandler(eA) {
                  this._handlers[eA] && delete this._handlers[eA];
                }
                setHandlerFallback(eA) {
                  this._handlerFb = eA;
                }
                dispose() {
                  ((this._handlers = Object.create(null)),
                    (this._handlerFb = () => {}),
                    (this._active = ep));
                }
                reset() {
                  if (2 === this._state)
                    for (
                      let eA = this._stack.paused
                        ? this._stack.loopPosition - 1
                        : this._active.length - 1;
                      eA >= 0;
                      --eA
                    )
                      this._active[eA].end(!1);
                  ((this._stack.paused = !1),
                    (this._active = ep),
                    (this._id = -1),
                    (this._state = 0));
                }
                _start() {
                  if (
                    ((this._active = this._handlers[this._id] || ep),
                    this._active.length)
                  )
                    for (let eA = this._active.length - 1; eA >= 0; eA--)
                      this._active[eA].start();
                  else this._handlerFb(this._id, "START");
                }
                _put(eA, el, ec) {
                  if (this._active.length)
                    for (let eu = this._active.length - 1; eu >= 0; eu--)
                      this._active[eu].put(eA, el, ec);
                  else
                    this._handlerFb(
                      this._id,
                      "PUT",
                      (0, ed.utf32ToString)(eA, el, ec),
                    );
                }
                start() {
                  (this.reset(), (this._state = 1));
                }
                put(eA, el, ec) {
                  if (3 !== this._state) {
                    if (1 === this._state)
                      for (; el < ec; ) {
                        let ec = eA[el++];
                        if (59 === ec) {
                          ((this._state = 2), this._start());
                          break;
                        }
                        if (ec < 48 || 57 < ec) return void (this._state = 3);
                        (-1 === this._id && (this._id = 0),
                          (this._id = 10 * this._id + ec - 48));
                      }
                    2 === this._state && ec - el > 0 && this._put(eA, el, ec);
                  }
                }
                end(eA, el = !0) {
                  if (0 !== this._state) {
                    if (3 !== this._state)
                      if (
                        (1 === this._state && this._start(),
                        this._active.length)
                      ) {
                        let ec = !1,
                          eu = this._active.length - 1,
                          ed = !1;
                        if (
                          (this._stack.paused &&
                            ((eu = this._stack.loopPosition - 1),
                            (ec = el),
                            (ed = this._stack.fallThrough),
                            (this._stack.paused = !1)),
                          !ed && !1 === ec)
                        ) {
                          for (
                            ;
                            eu >= 0 && !0 !== (ec = this._active[eu].end(eA));
                            eu--
                          )
                            if (ec instanceof Promise)
                              return (
                                (this._stack.paused = !0),
                                (this._stack.loopPosition = eu),
                                (this._stack.fallThrough = !1),
                                ec
                              );
                          eu--;
                        }
                        for (; eu >= 0; eu--)
                          if (
                            (ec = this._active[eu].end(!1)) instanceof Promise
                          )
                            return (
                              (this._stack.paused = !0),
                              (this._stack.loopPosition = eu),
                              (this._stack.fallThrough = !0),
                              ec
                            );
                      } else this._handlerFb(this._id, "END", eA);
                    ((this._active = ep), (this._id = -1), (this._state = 0));
                  }
                }
              }),
                (el.OscHandler = class {
                  constructor(eA) {
                    ((this._handler = eA),
                      (this._data = ""),
                      (this._hitLimit = !1));
                  }
                  start() {
                    ((this._data = ""), (this._hitLimit = !1));
                  }
                  put(eA, el, ec) {
                    this._hitLimit ||
                      ((this._data += (0, ed.utf32ToString)(eA, el, ec)),
                      this._data.length > eu.PAYLOAD_LIMIT &&
                        ((this._data = ""), (this._hitLimit = !0)));
                  }
                  end(eA) {
                    let el = !1;
                    if (this._hitLimit) el = !1;
                    else if (
                      eA &&
                      (el = this._handler(this._data)) instanceof Promise
                    )
                      return el.then(
                        (eA) => ((this._data = ""), (this._hitLimit = !1), eA),
                      );
                    return ((this._data = ""), (this._hitLimit = !1), el);
                  }
                }));
            },
            742: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.Params = void 0));
              let ec = 0x7fffffff;
              let s = class s {
                static fromArray(eA) {
                  let el = new s();
                  if (!eA.length) return el;
                  for (let ec = +!!Array.isArray(eA[0]); ec < eA.length; ++ec) {
                    let eu = eA[ec];
                    if (Array.isArray(eu))
                      for (let eA = 0; eA < eu.length; ++eA)
                        el.addSubParam(eu[eA]);
                    else el.addParam(eu);
                  }
                  return el;
                }
                constructor(eA = 32, el = 32) {
                  if (
                    ((this.maxLength = eA),
                    (this.maxSubParamsLength = el),
                    el > 256)
                  )
                    throw Error(
                      "maxSubParamsLength must not be greater than 256",
                    );
                  ((this.params = new Int32Array(eA)),
                    (this.length = 0),
                    (this._subParams = new Int32Array(el)),
                    (this._subParamsLength = 0),
                    (this._subParamsIdx = new Uint16Array(eA)),
                    (this._rejectDigits = !1),
                    (this._rejectSubDigits = !1),
                    (this._digitIsSub = !1));
                }
                clone() {
                  let eA = new s(this.maxLength, this.maxSubParamsLength);
                  return (
                    eA.params.set(this.params),
                    (eA.length = this.length),
                    eA._subParams.set(this._subParams),
                    (eA._subParamsLength = this._subParamsLength),
                    eA._subParamsIdx.set(this._subParamsIdx),
                    (eA._rejectDigits = this._rejectDigits),
                    (eA._rejectSubDigits = this._rejectSubDigits),
                    (eA._digitIsSub = this._digitIsSub),
                    eA
                  );
                }
                toArray() {
                  let eA = [];
                  for (let el = 0; el < this.length; ++el) {
                    eA.push(this.params[el]);
                    let ec = this._subParamsIdx[el] >> 8,
                      eu = 255 & this._subParamsIdx[el];
                    eu - ec > 0 &&
                      eA.push(
                        Array.prototype.slice.call(this._subParams, ec, eu),
                      );
                  }
                  return eA;
                }
                reset() {
                  ((this.length = 0),
                    (this._subParamsLength = 0),
                    (this._rejectDigits = !1),
                    (this._rejectSubDigits = !1),
                    (this._digitIsSub = !1));
                }
                addParam(eA) {
                  if (((this._digitIsSub = !1), this.length >= this.maxLength))
                    this._rejectDigits = !0;
                  else {
                    if (eA < -1)
                      throw Error("values lesser than -1 are not allowed");
                    ((this._subParamsIdx[this.length] =
                      (this._subParamsLength << 8) | this._subParamsLength),
                      (this.params[this.length++] = eA > ec ? ec : eA));
                  }
                }
                addSubParam(eA) {
                  if (((this._digitIsSub = !0), this.length))
                    if (
                      this._rejectDigits ||
                      this._subParamsLength >= this.maxSubParamsLength
                    )
                      this._rejectSubDigits = !0;
                    else {
                      if (eA < -1)
                        throw Error("values lesser than -1 are not allowed");
                      ((this._subParams[this._subParamsLength++] =
                        eA > ec ? ec : eA),
                        this._subParamsIdx[this.length - 1]++);
                    }
                }
                hasSubParams(eA) {
                  return (
                    (255 & this._subParamsIdx[eA]) -
                      (this._subParamsIdx[eA] >> 8) >
                    0
                  );
                }
                getSubParams(eA) {
                  let el = this._subParamsIdx[eA] >> 8,
                    ec = 255 & this._subParamsIdx[eA];
                  return ec - el > 0 ? this._subParams.subarray(el, ec) : null;
                }
                getSubParamsAll() {
                  let eA = {};
                  for (let el = 0; el < this.length; ++el) {
                    let ec = this._subParamsIdx[el] >> 8,
                      eu = 255 & this._subParamsIdx[el];
                    eu - ec > 0 && (eA[el] = this._subParams.slice(ec, eu));
                  }
                  return eA;
                }
                addDigit(eA) {
                  let el;
                  if (
                    this._rejectDigits ||
                    !(el = this._digitIsSub
                      ? this._subParamsLength
                      : this.length) ||
                    (this._digitIsSub && this._rejectSubDigits)
                  )
                    return;
                  let eu = this._digitIsSub ? this._subParams : this.params,
                    ed = eu[el - 1];
                  eu[el - 1] = ~ed ? Math.min(10 * ed + eA, ec) : eA;
                }
              };
              el.Params = s;
            },
            741: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.AddonManager = void 0),
                (el.AddonManager = class {
                  constructor() {
                    this._addons = [];
                  }
                  dispose() {
                    for (let eA = this._addons.length - 1; eA >= 0; eA--)
                      this._addons[eA].instance.dispose();
                  }
                  loadAddon(eA, el) {
                    let ec = {
                      instance: el,
                      dispose: el.dispose,
                      isDisposed: !1,
                    };
                    (this._addons.push(ec),
                      (el.dispose = () => this._wrappedAddonDispose(ec)),
                      el.activate(eA));
                  }
                  _wrappedAddonDispose(eA) {
                    if (eA.isDisposed) return;
                    let el = -1;
                    for (let ec = 0; ec < this._addons.length; ec++)
                      if (this._addons[ec] === eA) {
                        el = ec;
                        break;
                      }
                    if (-1 === el)
                      throw Error(
                        "Could not dispose an addon that has not been loaded",
                      );
                    ((eA.isDisposed = !0),
                      eA.dispose.apply(eA.instance),
                      this._addons.splice(el, 1));
                  }
                }));
            },
            771: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.BufferApiView = void 0));
              let eu = ec(785),
                ed = ec(511);
              el.BufferApiView = class {
                constructor(eA, el) {
                  ((this._buffer = eA), (this.type = el));
                }
                init(eA) {
                  return ((this._buffer = eA), this);
                }
                get cursorY() {
                  return this._buffer.y;
                }
                get cursorX() {
                  return this._buffer.x;
                }
                get viewportY() {
                  return this._buffer.ydisp;
                }
                get baseY() {
                  return this._buffer.ybase;
                }
                get length() {
                  return this._buffer.lines.length;
                }
                getLine(eA) {
                  let el = this._buffer.lines.get(eA);
                  if (el) return new eu.BufferLineApiView(el);
                }
                getNullCell() {
                  return new ed.CellData();
                }
              };
            },
            785: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.BufferLineApiView = void 0));
              let eu = ec(511);
              el.BufferLineApiView = class {
                constructor(eA) {
                  this._line = eA;
                }
                get isWrapped() {
                  return this._line.isWrapped;
                }
                get length() {
                  return this._line.length;
                }
                getCell(eA, el) {
                  if (!(eA < 0 || eA >= this._line.length))
                    return el
                      ? (this._line.loadCell(eA, el), el)
                      : this._line.loadCell(eA, new eu.CellData());
                }
                translateToString(eA, el, ec) {
                  return this._line.translateToString(eA, el, ec);
                }
              };
            },
            285: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.BufferNamespaceApi = void 0));
              let eu = ec(771),
                ed = ec(460),
                ep = ec(844);
              let a = class a extends ep.Disposable {
                constructor(eA) {
                  (super(),
                    (this._core = eA),
                    (this._onBufferChange = this.register(
                      new ed.EventEmitter(),
                    )),
                    (this.onBufferChange = this._onBufferChange.event),
                    (this._normal = new eu.BufferApiView(
                      this._core.buffers.normal,
                      "normal",
                    )),
                    (this._alternate = new eu.BufferApiView(
                      this._core.buffers.alt,
                      "alternate",
                    )),
                    this._core.buffers.onBufferActivate(() =>
                      this._onBufferChange.fire(this.active),
                    ));
                }
                get active() {
                  if (this._core.buffers.active === this._core.buffers.normal)
                    return this.normal;
                  if (this._core.buffers.active === this._core.buffers.alt)
                    return this.alternate;
                  throw Error("Active buffer is neither normal nor alternate");
                }
                get normal() {
                  return this._normal.init(this._core.buffers.normal);
                }
                get alternate() {
                  return this._alternate.init(this._core.buffers.alt);
                }
              };
              el.BufferNamespaceApi = a;
            },
            975: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.ParserApi = void 0),
                (el.ParserApi = class {
                  constructor(eA) {
                    this._core = eA;
                  }
                  registerCsiHandler(eA, el) {
                    return this._core.registerCsiHandler(eA, (eA) =>
                      el(eA.toArray()),
                    );
                  }
                  addCsiHandler(eA, el) {
                    return this.registerCsiHandler(eA, el);
                  }
                  registerDcsHandler(eA, el) {
                    return this._core.registerDcsHandler(eA, (eA, ec) =>
                      el(eA, ec.toArray()),
                    );
                  }
                  addDcsHandler(eA, el) {
                    return this.registerDcsHandler(eA, el);
                  }
                  registerEscHandler(eA, el) {
                    return this._core.registerEscHandler(eA, el);
                  }
                  addEscHandler(eA, el) {
                    return this.registerEscHandler(eA, el);
                  }
                  registerOscHandler(eA, el) {
                    return this._core.registerOscHandler(eA, el);
                  }
                  addOscHandler(eA, el) {
                    return this.registerOscHandler(eA, el);
                  }
                }));
            },
            90: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.UnicodeApi = void 0),
                (el.UnicodeApi = class {
                  constructor(eA) {
                    this._core = eA;
                  }
                  register(eA) {
                    this._core.unicodeService.register(eA);
                  }
                  get versions() {
                    return this._core.unicodeService.versions;
                  }
                  get activeVersion() {
                    return this._core.unicodeService.activeVersion;
                  }
                  set activeVersion(eA) {
                    this._core.unicodeService.activeVersion = eA;
                  }
                }));
            },
            744: function (eA, el, ec) {
              var eu =
                  (this && this.__decorate) ||
                  function (eA, el, ec, eu) {
                    var ed,
                      ep = arguments.length,
                      eg =
                        ep < 3
                          ? el
                          : null === eu
                            ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                            : eu;
                    if (
                      "object" == typeof Reflect &&
                      "function" == typeof Reflect.decorate
                    )
                      eg = Reflect.decorate(eA, el, ec, eu);
                    else
                      for (var eh = eA.length - 1; eh >= 0; eh--)
                        (ed = eA[eh]) &&
                          (eg =
                            (ep < 3
                              ? ed(eg)
                              : ep > 3
                                ? ed(el, ec, eg)
                                : ed(el, ec)) || eg);
                    return (
                      ep > 3 && eg && Object.defineProperty(el, ec, eg),
                      eg
                    );
                  },
                ed =
                  (this && this.__param) ||
                  function (eA, el) {
                    return function (ec, eu) {
                      el(ec, eu, eA);
                    };
                  };
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.BufferService =
                  el.MINIMUM_ROWS =
                  el.MINIMUM_COLS =
                    void 0));
              let ep = ec(460),
                eg = ec(844),
                eh = ec(295),
                ef = ec(585);
              ((el.MINIMUM_COLS = 2), (el.MINIMUM_ROWS = 1));
              let em = (el.BufferService = class extends eg.Disposable {
                get buffer() {
                  return this.buffers.active;
                }
                constructor(eA) {
                  (super(),
                    (this.isUserScrolling = !1),
                    (this._onResize = this.register(new ep.EventEmitter())),
                    (this.onResize = this._onResize.event),
                    (this._onScroll = this.register(new ep.EventEmitter())),
                    (this.onScroll = this._onScroll.event),
                    (this.cols = Math.max(
                      eA.rawOptions.cols || 0,
                      el.MINIMUM_COLS,
                    )),
                    (this.rows = Math.max(
                      eA.rawOptions.rows || 0,
                      el.MINIMUM_ROWS,
                    )),
                    (this.buffers = this.register(new eh.BufferSet(eA, this))));
                }
                resize(eA, el) {
                  ((this.cols = eA),
                    (this.rows = el),
                    this.buffers.resize(eA, el),
                    this._onResize.fire({ cols: eA, rows: el }));
                }
                reset() {
                  (this.buffers.reset(), (this.isUserScrolling = !1));
                }
                scroll(eA, el = !1) {
                  let ec,
                    eu = this.buffer;
                  (((ec = this._cachedBlankLine) &&
                    ec.length === this.cols &&
                    ec.getFg(0) === eA.fg &&
                    ec.getBg(0) === eA.bg) ||
                    ((ec = eu.getBlankLine(eA, el)),
                    (this._cachedBlankLine = ec)),
                    (ec.isWrapped = el));
                  let ed = eu.ybase + eu.scrollTop,
                    ep = eu.ybase + eu.scrollBottom;
                  if (0 === eu.scrollTop) {
                    let eA = eu.lines.isFull;
                    (ep === eu.lines.length - 1
                      ? eA
                        ? eu.lines.recycle().copyFrom(ec)
                        : eu.lines.push(ec.clone())
                      : eu.lines.splice(ep + 1, 0, ec.clone()),
                      eA
                        ? this.isUserScrolling &&
                          (eu.ydisp = Math.max(eu.ydisp - 1, 0))
                        : (eu.ybase++, this.isUserScrolling || eu.ydisp++));
                  } else {
                    let eA = ep - ed + 1;
                    (eu.lines.shiftElements(ed + 1, eA - 1, -1),
                      eu.lines.set(ep, ec.clone()));
                  }
                  (this.isUserScrolling || (eu.ydisp = eu.ybase),
                    this._onScroll.fire(eu.ydisp));
                }
                scrollLines(eA, el, ec) {
                  let eu = this.buffer;
                  if (eA < 0) {
                    if (0 === eu.ydisp) return;
                    this.isUserScrolling = !0;
                  } else
                    eA + eu.ydisp >= eu.ybase && (this.isUserScrolling = !1);
                  let ed = eu.ydisp;
                  ((eu.ydisp = Math.max(Math.min(eu.ydisp + eA, eu.ybase), 0)),
                    ed !== eu.ydisp && (el || this._onScroll.fire(eu.ydisp)));
                }
              });
              el.BufferService = eu([ed(0, ef.IOptionsService)], em);
            },
            994: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.CharsetService = void 0),
                (el.CharsetService = class {
                  constructor() {
                    ((this.glevel = 0), (this._charsets = []));
                  }
                  reset() {
                    ((this.charset = void 0),
                      (this._charsets = []),
                      (this.glevel = 0));
                  }
                  setgLevel(eA) {
                    ((this.glevel = eA), (this.charset = this._charsets[eA]));
                  }
                  setgCharset(eA, el) {
                    ((this._charsets[eA] = el),
                      this.glevel === eA && (this.charset = el));
                  }
                }));
            },
            753: function (eA, el, ec) {
              var eu =
                  (this && this.__decorate) ||
                  function (eA, el, ec, eu) {
                    var ed,
                      ep = arguments.length,
                      eg =
                        ep < 3
                          ? el
                          : null === eu
                            ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                            : eu;
                    if (
                      "object" == typeof Reflect &&
                      "function" == typeof Reflect.decorate
                    )
                      eg = Reflect.decorate(eA, el, ec, eu);
                    else
                      for (var eh = eA.length - 1; eh >= 0; eh--)
                        (ed = eA[eh]) &&
                          (eg =
                            (ep < 3
                              ? ed(eg)
                              : ep > 3
                                ? ed(el, ec, eg)
                                : ed(el, ec)) || eg);
                    return (
                      ep > 3 && eg && Object.defineProperty(el, ec, eg),
                      eg
                    );
                  },
                ed =
                  (this && this.__param) ||
                  function (eA, el) {
                    return function (ec, eu) {
                      el(ec, eu, eA);
                    };
                  };
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.CoreMouseService = void 0));
              let ep = ec(585),
                eg = ec(460),
                eh = ec(844),
                ef = {
                  NONE: { events: 0, restrict: () => !1 },
                  X10: {
                    events: 1,
                    restrict: (eA) =>
                      4 !== eA.button &&
                      1 === eA.action &&
                      ((eA.ctrl = !1), (eA.alt = !1), (eA.shift = !1), !0),
                  },
                  VT200: { events: 19, restrict: (eA) => 32 !== eA.action },
                  DRAG: {
                    events: 23,
                    restrict: (eA) => 32 !== eA.action || 3 !== eA.button,
                  },
                  ANY: { events: 31, restrict: (eA) => !0 },
                };
              function c(eA, el) {
                let ec = (16 * !!eA.ctrl) | (4 * !!eA.shift) | (8 * !!eA.alt);
                return (
                  4 === eA.button
                    ? ((ec |= 64), (ec |= eA.action))
                    : ((ec |= 3 & eA.button),
                      4 & eA.button && (ec |= 64),
                      8 & eA.button && (ec |= 128),
                      32 === eA.action
                        ? (ec |= 32)
                        : 0 !== eA.action || el || (ec |= 3)),
                  ec
                );
              }
              let em = String.fromCharCode,
                eE = {
                  DEFAULT: (eA) => {
                    let el = [c(eA, !1) + 32, eA.col + 32, eA.row + 32];
                    return el[0] > 255 || el[1] > 255 || el[2] > 255
                      ? ""
                      : `[M${em(el[0])}${em(el[1])}${em(el[2])}`;
                  },
                  SGR: (eA) => {
                    let el = 0 === eA.action && 4 !== eA.button ? "m" : "M";
                    return `[<${c(eA, !0)};${eA.col};${eA.row}${el}`;
                  },
                  SGR_PIXELS: (eA) => {
                    let el = 0 === eA.action && 4 !== eA.button ? "m" : "M";
                    return `[<${c(eA, !0)};${eA.x};${eA.y}${el}`;
                  },
                },
                eC = (el.CoreMouseService = class extends eh.Disposable {
                  constructor(eA, el) {
                    for (const ec of (super(),
                    (this._bufferService = eA),
                    (this._coreService = el),
                    (this._protocols = {}),
                    (this._encodings = {}),
                    (this._activeProtocol = ""),
                    (this._activeEncoding = ""),
                    (this._lastEvent = null),
                    (this._onProtocolChange = this.register(
                      new eg.EventEmitter(),
                    )),
                    (this.onProtocolChange = this._onProtocolChange.event),
                    Object.keys(ef)))
                      this.addProtocol(ec, ef[ec]);
                    for (const eA of Object.keys(eE))
                      this.addEncoding(eA, eE[eA]);
                    this.reset();
                  }
                  addProtocol(eA, el) {
                    this._protocols[eA] = el;
                  }
                  addEncoding(eA, el) {
                    this._encodings[eA] = el;
                  }
                  get activeProtocol() {
                    return this._activeProtocol;
                  }
                  get areMouseEventsActive() {
                    return 0 !== this._protocols[this._activeProtocol].events;
                  }
                  set activeProtocol(eA) {
                    if (!this._protocols[eA])
                      throw Error(`unknown protocol "${eA}"`);
                    ((this._activeProtocol = eA),
                      this._onProtocolChange.fire(this._protocols[eA].events));
                  }
                  get activeEncoding() {
                    return this._activeEncoding;
                  }
                  set activeEncoding(eA) {
                    if (!this._encodings[eA])
                      throw Error(`unknown encoding "${eA}"`);
                    this._activeEncoding = eA;
                  }
                  reset() {
                    ((this.activeProtocol = "NONE"),
                      (this.activeEncoding = "DEFAULT"),
                      (this._lastEvent = null));
                  }
                  triggerMouseEvent(eA) {
                    if (
                      eA.col < 0 ||
                      eA.col >= this._bufferService.cols ||
                      eA.row < 0 ||
                      eA.row >= this._bufferService.rows ||
                      (4 === eA.button && 32 === eA.action) ||
                      (3 === eA.button && 32 !== eA.action) ||
                      (4 !== eA.button &&
                        (2 === eA.action || 3 === eA.action)) ||
                      (eA.col++,
                      eA.row++,
                      32 === eA.action &&
                        this._lastEvent &&
                        this._equalEvents(
                          this._lastEvent,
                          eA,
                          "SGR_PIXELS" === this._activeEncoding,
                        )) ||
                      !this._protocols[this._activeProtocol].restrict(eA)
                    )
                      return !1;
                    let el = this._encodings[this._activeEncoding](eA);
                    return (
                      el &&
                        ("DEFAULT" === this._activeEncoding
                          ? this._coreService.triggerBinaryEvent(el)
                          : this._coreService.triggerDataEvent(el, !0)),
                      (this._lastEvent = eA),
                      !0
                    );
                  }
                  explainEvents(eA) {
                    return {
                      down: !!(1 & eA),
                      up: !!(2 & eA),
                      drag: !!(4 & eA),
                      move: !!(8 & eA),
                      wheel: !!(16 & eA),
                    };
                  }
                  _equalEvents(eA, el, ec) {
                    if (ec) {
                      if (eA.x !== el.x || eA.y !== el.y) return !1;
                    } else if (eA.col !== el.col || eA.row !== el.row)
                      return !1;
                    return (
                      eA.button === el.button &&
                      eA.action === el.action &&
                      eA.ctrl === el.ctrl &&
                      eA.alt === el.alt &&
                      eA.shift === el.shift
                    );
                  }
                });
              el.CoreMouseService = eu(
                [ed(0, ep.IBufferService), ed(1, ep.ICoreService)],
                eC,
              );
            },
            83: function (eA, el, ec) {
              var eu =
                  (this && this.__decorate) ||
                  function (eA, el, ec, eu) {
                    var ed,
                      ep = arguments.length,
                      eg =
                        ep < 3
                          ? el
                          : null === eu
                            ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                            : eu;
                    if (
                      "object" == typeof Reflect &&
                      "function" == typeof Reflect.decorate
                    )
                      eg = Reflect.decorate(eA, el, ec, eu);
                    else
                      for (var eh = eA.length - 1; eh >= 0; eh--)
                        (ed = eA[eh]) &&
                          (eg =
                            (ep < 3
                              ? ed(eg)
                              : ep > 3
                                ? ed(el, ec, eg)
                                : ed(el, ec)) || eg);
                    return (
                      ep > 3 && eg && Object.defineProperty(el, ec, eg),
                      eg
                    );
                  },
                ed =
                  (this && this.__param) ||
                  function (eA, el) {
                    return function (ec, eu) {
                      el(ec, eu, eA);
                    };
                  };
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.CoreService = void 0));
              let ep = ec(439),
                eg = ec(460),
                eh = ec(844),
                ef = ec(585),
                em = Object.freeze({ insertMode: !1 }),
                eE = Object.freeze({
                  applicationCursorKeys: !1,
                  applicationKeypad: !1,
                  bracketedPasteMode: !1,
                  origin: !1,
                  reverseWraparound: !1,
                  sendFocus: !1,
                  wraparound: !0,
                }),
                eC = (el.CoreService = class extends eh.Disposable {
                  constructor(eA, el, ec) {
                    (super(),
                      (this._bufferService = eA),
                      (this._logService = el),
                      (this._optionsService = ec),
                      (this.isCursorInitialized = !1),
                      (this.isCursorHidden = !1),
                      (this._onData = this.register(new eg.EventEmitter())),
                      (this.onData = this._onData.event),
                      (this._onUserInput = this.register(
                        new eg.EventEmitter(),
                      )),
                      (this.onUserInput = this._onUserInput.event),
                      (this._onBinary = this.register(new eg.EventEmitter())),
                      (this.onBinary = this._onBinary.event),
                      (this._onRequestScrollToBottom = this.register(
                        new eg.EventEmitter(),
                      )),
                      (this.onRequestScrollToBottom =
                        this._onRequestScrollToBottom.event),
                      (this.modes = (0, ep.clone)(em)),
                      (this.decPrivateModes = (0, ep.clone)(eE)));
                  }
                  reset() {
                    ((this.modes = (0, ep.clone)(em)),
                      (this.decPrivateModes = (0, ep.clone)(eE)));
                  }
                  triggerDataEvent(eA, el = !1) {
                    if (this._optionsService.rawOptions.disableStdin) return;
                    let ec = this._bufferService.buffer;
                    (el &&
                      this._optionsService.rawOptions.scrollOnUserInput &&
                      ec.ybase !== ec.ydisp &&
                      this._onRequestScrollToBottom.fire(),
                      el && this._onUserInput.fire(),
                      this._logService.debug(`sending data "${eA}"`, () =>
                        eA.split("").map((eA) => eA.charCodeAt(0)),
                      ),
                      this._onData.fire(eA));
                  }
                  triggerBinaryEvent(eA) {
                    this._optionsService.rawOptions.disableStdin ||
                      (this._logService.debug(`sending binary "${eA}"`, () =>
                        eA.split("").map((eA) => eA.charCodeAt(0)),
                      ),
                      this._onBinary.fire(eA));
                  }
                });
              el.CoreService = eu(
                [
                  ed(0, ef.IBufferService),
                  ed(1, ef.ILogService),
                  ed(2, ef.IOptionsService),
                ],
                eC,
              );
            },
            348: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.InstantiationService = el.ServiceCollection = void 0));
              let eu = ec(585),
                ed = ec(343);
              let n = class n {
                constructor(...eA) {
                  for (const [el, ec] of ((this._entries = new Map()), eA))
                    this.set(el, ec);
                }
                set(eA, el) {
                  let ec = this._entries.get(eA);
                  return (this._entries.set(eA, el), ec);
                }
                forEach(eA) {
                  for (let [el, ec] of this._entries.entries()) eA(el, ec);
                }
                has(eA) {
                  return this._entries.has(eA);
                }
                get(eA) {
                  return this._entries.get(eA);
                }
              };
              ((el.ServiceCollection = n),
                (el.InstantiationService = class {
                  constructor() {
                    ((this._services = new n()),
                      this._services.set(eu.IInstantiationService, this));
                  }
                  setService(eA, el) {
                    this._services.set(eA, el);
                  }
                  getService(eA) {
                    return this._services.get(eA);
                  }
                  createInstance(eA, ...el) {
                    let ec = (0, ed.getServiceDependencies)(eA).sort(
                        (eA, el) => eA.index - el.index,
                      ),
                      eu = [];
                    for (let el of ec) {
                      let ec = this._services.get(el.id);
                      if (!ec)
                        throw Error(
                          `[createInstance] ${eA.name} depends on UNKNOWN service ${el.id}.`,
                        );
                      eu.push(ec);
                    }
                    let ep = ec.length > 0 ? ec[0].index : el.length;
                    if (el.length !== ep)
                      throw Error(
                        `[createInstance] First service dependency of ${eA.name} at position ${ep + 1} conflicts with ${el.length} static arguments`,
                      );
                    return new eA(...[...el, ...eu]);
                  }
                }));
            },
            866: function (eA, el, ec) {
              var eu =
                  (this && this.__decorate) ||
                  function (eA, el, ec, eu) {
                    var ed,
                      ep = arguments.length,
                      eg =
                        ep < 3
                          ? el
                          : null === eu
                            ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                            : eu;
                    if (
                      "object" == typeof Reflect &&
                      "function" == typeof Reflect.decorate
                    )
                      eg = Reflect.decorate(eA, el, ec, eu);
                    else
                      for (var eh = eA.length - 1; eh >= 0; eh--)
                        (ed = eA[eh]) &&
                          (eg =
                            (ep < 3
                              ? ed(eg)
                              : ep > 3
                                ? ed(el, ec, eg)
                                : ed(el, ec)) || eg);
                    return (
                      ep > 3 && eg && Object.defineProperty(el, ec, eg),
                      eg
                    );
                  },
                ed =
                  (this && this.__param) ||
                  function (eA, el) {
                    return function (ec, eu) {
                      el(ec, eu, eA);
                    };
                  };
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.traceCall = el.setTraceLogger = el.LogService = void 0));
              let ep = ec(844),
                eg = ec(585),
                eh = {
                  trace: eg.LogLevelEnum.TRACE,
                  debug: eg.LogLevelEnum.DEBUG,
                  info: eg.LogLevelEnum.INFO,
                  warn: eg.LogLevelEnum.WARN,
                  error: eg.LogLevelEnum.ERROR,
                  off: eg.LogLevelEnum.OFF,
                },
                ef,
                em = (el.LogService = class extends ep.Disposable {
                  get logLevel() {
                    return this._logLevel;
                  }
                  constructor(eA) {
                    (super(),
                      (this._optionsService = eA),
                      (this._logLevel = eg.LogLevelEnum.OFF),
                      this._updateLogLevel(),
                      this.register(
                        this._optionsService.onSpecificOptionChange(
                          "logLevel",
                          () => this._updateLogLevel(),
                        ),
                      ),
                      (ef = this));
                  }
                  _updateLogLevel() {
                    this._logLevel =
                      eh[this._optionsService.rawOptions.logLevel];
                  }
                  _evalLazyOptionalParams(eA) {
                    for (let el = 0; el < eA.length; el++)
                      "function" == typeof eA[el] && (eA[el] = eA[el]());
                  }
                  _log(eA, el, ec) {
                    (this._evalLazyOptionalParams(ec),
                      eA.call(
                        console,
                        (this._optionsService.options.logger
                          ? ""
                          : "xterm.js: ") + el,
                        ...ec,
                      ));
                  }
                  trace(eA, ...el) {
                    this._logLevel <= eg.LogLevelEnum.TRACE &&
                      this._log(
                        this._optionsService.options.logger?.trace.bind(
                          this._optionsService.options.logger,
                        ) ?? console.log,
                        eA,
                        el,
                      );
                  }
                  debug(eA, ...el) {
                    this._logLevel <= eg.LogLevelEnum.DEBUG &&
                      this._log(
                        this._optionsService.options.logger?.debug.bind(
                          this._optionsService.options.logger,
                        ) ?? console.log,
                        eA,
                        el,
                      );
                  }
                  info(eA, ...el) {
                    this._logLevel <= eg.LogLevelEnum.INFO &&
                      this._log(
                        this._optionsService.options.logger?.info.bind(
                          this._optionsService.options.logger,
                        ) ?? console.info,
                        eA,
                        el,
                      );
                  }
                  warn(eA, ...el) {
                    this._logLevel <= eg.LogLevelEnum.WARN &&
                      this._log(
                        this._optionsService.options.logger?.warn.bind(
                          this._optionsService.options.logger,
                        ) ?? console.warn,
                        eA,
                        el,
                      );
                  }
                  error(eA, ...el) {
                    this._logLevel <= eg.LogLevelEnum.ERROR &&
                      this._log(
                        this._optionsService.options.logger?.error.bind(
                          this._optionsService.options.logger,
                        ) ?? console.error,
                        eA,
                        el,
                      );
                  }
                });
              ((el.LogService = em = eu([ed(0, eg.IOptionsService)], em)),
                (el.setTraceLogger = function (eA) {
                  ef = eA;
                }),
                (el.traceCall = function (eA, el, ec) {
                  if ("function" != typeof ec.value)
                    throw Error("not supported");
                  let eu = ec.value;
                  ec.value = function (...eA) {
                    if (ef.logLevel !== eg.LogLevelEnum.TRACE)
                      return eu.apply(this, eA);
                    ef.trace(
                      `GlyphRenderer#${eu.name}(${eA.map((eA) => JSON.stringify(eA)).join(", ")})`,
                    );
                    let el = eu.apply(this, eA);
                    return (
                      ef.trace(`GlyphRenderer#${eu.name} return`, el),
                      el
                    );
                  };
                }));
            },
            302: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.OptionsService = el.DEFAULT_OPTIONS = void 0));
              let eu = ec(460),
                ed = ec(844);
              el.DEFAULT_OPTIONS = {
                cols: 80,
                rows: 24,
                cursorBlink: !1,
                cursorStyle: "block",
                cursorWidth: 1,
                cursorInactiveStyle: "outline",
                customGlyphs: !0,
                drawBoldTextInBrightColors: !0,
                documentOverride: null,
                fastScrollModifier: "alt",
                fastScrollSensitivity: 5,
                fontFamily: "courier-new, courier, monospace",
                fontSize: 15,
                fontWeight: "normal",
                fontWeightBold: "bold",
                ignoreBracketedPasteMode: !1,
                lineHeight: 1,
                letterSpacing: 0,
                linkHandler: null,
                logLevel: "info",
                logger: null,
                scrollback: 1e3,
                scrollOnUserInput: !0,
                scrollSensitivity: 1,
                screenReaderMode: !1,
                smoothScrollDuration: 0,
                macOptionIsMeta: !1,
                macOptionClickForcesSelection: !1,
                minimumContrastRatio: 1,
                disableStdin: !1,
                allowProposedApi: !1,
                allowTransparency: !1,
                tabStopWidth: 8,
                theme: {},
                rescaleOverlappingGlyphs: !1,
                rightClickSelectsWord: ec(114).isMac,
                windowOptions: {},
                windowsMode: !1,
                windowsPty: {},
                wordSeparator: " ()[]{}',\"`",
                altClickMovesCursor: !0,
                convertEol: !1,
                termName: "xterm",
                cancelEvents: !1,
                overviewRulerWidth: 0,
              };
              let ep = [
                "normal",
                "bold",
                "100",
                "200",
                "300",
                "400",
                "500",
                "600",
                "700",
                "800",
                "900",
              ];
              let o = class o extends ed.Disposable {
                constructor(eA) {
                  (super(),
                    (this._onOptionChange = this.register(
                      new eu.EventEmitter(),
                    )),
                    (this.onOptionChange = this._onOptionChange.event));
                  const ec = { ...el.DEFAULT_OPTIONS };
                  for (const el in eA)
                    if (el in ec)
                      try {
                        const eu = eA[el];
                        ec[el] = this._sanitizeAndValidateOption(el, eu);
                      } catch (eA) {
                        console.error(eA);
                      }
                  ((this.rawOptions = ec),
                    (this.options = { ...ec }),
                    this._setupOptions(),
                    this.register(
                      (0, ed.toDisposable)(() => {
                        ((this.rawOptions.linkHandler = null),
                          (this.rawOptions.documentOverride = null));
                      }),
                    ));
                }
                onSpecificOptionChange(eA, el) {
                  return this.onOptionChange((ec) => {
                    ec === eA && el(this.rawOptions[eA]);
                  });
                }
                onMultipleOptionChange(eA, el) {
                  return this.onOptionChange((ec) => {
                    -1 !== eA.indexOf(ec) && el();
                  });
                }
                _setupOptions() {
                  let e = (eA) => {
                      if (!(eA in el.DEFAULT_OPTIONS))
                        throw Error(`No option with key "${eA}"`);
                      return this.rawOptions[eA];
                    },
                    i = (eA, ec) => {
                      if (!(eA in el.DEFAULT_OPTIONS))
                        throw Error(`No option with key "${eA}"`);
                      ((ec = this._sanitizeAndValidateOption(eA, ec)),
                        this.rawOptions[eA] !== ec &&
                          ((this.rawOptions[eA] = ec),
                          this._onOptionChange.fire(eA)));
                    };
                  for (let eA in this.rawOptions) {
                    let el = { get: e.bind(this, eA), set: i.bind(this, eA) };
                    Object.defineProperty(this.options, eA, el);
                  }
                }
                _sanitizeAndValidateOption(eA, ec) {
                  switch (eA) {
                    case "cursorStyle":
                      if (
                        (ec || (ec = el.DEFAULT_OPTIONS[eA]),
                        !(function (eA) {
                          return (
                            "block" === eA || "underline" === eA || "bar" === eA
                          );
                        })(ec))
                      )
                        throw Error(`"${ec}" is not a valid value for ${eA}`);
                      break;
                    case "wordSeparator":
                      ec || (ec = el.DEFAULT_OPTIONS[eA]);
                      break;
                    case "fontWeight":
                    case "fontWeightBold":
                      if ("number" == typeof ec && 1 <= ec && ec <= 1e3) break;
                      ec = ep.includes(ec) ? ec : el.DEFAULT_OPTIONS[eA];
                      break;
                    case "cursorWidth":
                      ec = Math.floor(ec);
                    case "lineHeight":
                    case "tabStopWidth":
                      if (ec < 1)
                        throw Error(
                          `${eA} cannot be less than 1, value: ${ec}`,
                        );
                      break;
                    case "minimumContrastRatio":
                      ec = Math.max(1, Math.min(21, Math.round(10 * ec) / 10));
                      break;
                    case "scrollback":
                      if ((ec = Math.min(ec, 0xffffffff)) < 0)
                        throw Error(
                          `${eA} cannot be less than 0, value: ${ec}`,
                        );
                      break;
                    case "fastScrollSensitivity":
                    case "scrollSensitivity":
                      if (ec <= 0)
                        throw Error(
                          `${eA} cannot be less than or equal to 0, value: ${ec}`,
                        );
                      break;
                    case "rows":
                    case "cols":
                      if (!ec && 0 !== ec)
                        throw Error(`${eA} must be numeric, value: ${ec}`);
                      break;
                    case "windowsPty":
                      ec = ec ?? {};
                  }
                  return ec;
                }
              };
              el.OptionsService = o;
            },
            660: function (eA, el, ec) {
              var eu =
                  (this && this.__decorate) ||
                  function (eA, el, ec, eu) {
                    var ed,
                      ep = arguments.length,
                      eg =
                        ep < 3
                          ? el
                          : null === eu
                            ? (eu = Object.getOwnPropertyDescriptor(el, ec))
                            : eu;
                    if (
                      "object" == typeof Reflect &&
                      "function" == typeof Reflect.decorate
                    )
                      eg = Reflect.decorate(eA, el, ec, eu);
                    else
                      for (var eh = eA.length - 1; eh >= 0; eh--)
                        (ed = eA[eh]) &&
                          (eg =
                            (ep < 3
                              ? ed(eg)
                              : ep > 3
                                ? ed(el, ec, eg)
                                : ed(el, ec)) || eg);
                    return (
                      ep > 3 && eg && Object.defineProperty(el, ec, eg),
                      eg
                    );
                  },
                ed =
                  (this && this.__param) ||
                  function (eA, el) {
                    return function (ec, eu) {
                      el(ec, eu, eA);
                    };
                  };
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.OscLinkService = void 0));
              let ep = ec(585),
                eg = (el.OscLinkService = class {
                  constructor(eA) {
                    ((this._bufferService = eA),
                      (this._nextId = 1),
                      (this._entriesWithId = new Map()),
                      (this._dataByLinkId = new Map()));
                  }
                  registerLink(eA) {
                    let el = this._bufferService.buffer;
                    if (void 0 === eA.id) {
                      let ec = el.addMarker(el.ybase + el.y),
                        eu = { data: eA, id: this._nextId++, lines: [ec] };
                      return (
                        ec.onDispose(() => this._removeMarkerFromLink(eu, ec)),
                        this._dataByLinkId.set(eu.id, eu),
                        eu.id
                      );
                    }
                    let ec = eA,
                      eu = this._getEntryIdKey(ec),
                      ed = this._entriesWithId.get(eu);
                    if (ed)
                      return (
                        this.addLineToLink(ed.id, el.ybase + el.y),
                        ed.id
                      );
                    let ep = el.addMarker(el.ybase + el.y),
                      eg = {
                        id: this._nextId++,
                        key: this._getEntryIdKey(ec),
                        data: ec,
                        lines: [ep],
                      };
                    return (
                      ep.onDispose(() => this._removeMarkerFromLink(eg, ep)),
                      this._entriesWithId.set(eg.key, eg),
                      this._dataByLinkId.set(eg.id, eg),
                      eg.id
                    );
                  }
                  addLineToLink(eA, el) {
                    let ec = this._dataByLinkId.get(eA);
                    if (ec && ec.lines.every((eA) => eA.line !== el)) {
                      let eA = this._bufferService.buffer.addMarker(el);
                      (ec.lines.push(eA),
                        eA.onDispose(() => this._removeMarkerFromLink(ec, eA)));
                    }
                  }
                  getLinkData(eA) {
                    return this._dataByLinkId.get(eA)?.data;
                  }
                  _getEntryIdKey(eA) {
                    return `${eA.id};;${eA.uri}`;
                  }
                  _removeMarkerFromLink(eA, el) {
                    let ec = eA.lines.indexOf(el);
                    -1 !== ec &&
                      (eA.lines.splice(ec, 1),
                      0 === eA.lines.length &&
                        (void 0 !== eA.data.id &&
                          this._entriesWithId.delete(eA.key),
                        this._dataByLinkId.delete(eA.id)));
                  }
                });
              el.OscLinkService = eu([ed(0, ep.IBufferService)], eg);
            },
            343: (eA, el) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.createDecorator =
                  el.getServiceDependencies =
                  el.serviceRegistry =
                    void 0));
              let ec = "di$target",
                eu = "di$dependencies";
              ((el.serviceRegistry = new Map()),
                (el.getServiceDependencies = function (eA) {
                  return eA[eu] || [];
                }),
                (el.createDecorator = function (eA) {
                  if (el.serviceRegistry.has(eA))
                    return el.serviceRegistry.get(eA);
                  let r = function (eA, el, ed) {
                    if (3 != arguments.length)
                      throw Error(
                        "@IServiceName-decorator can only be used to decorate a parameter",
                      );
                    !(function (eA, el, ed) {
                      el[ec] === el
                        ? el[eu].push({ id: eA, index: ed })
                        : ((el[eu] = [{ id: eA, index: ed }]), (el[ec] = el));
                    })(r, eA, ed);
                  };
                  return (
                    (r.toString = () => eA),
                    el.serviceRegistry.set(eA, r),
                    r
                  );
                }));
            },
            585: (eA, el, ec) => {
              var eu;
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.IDecorationService =
                  el.IUnicodeService =
                  el.IOscLinkService =
                  el.IOptionsService =
                  el.ILogService =
                  el.LogLevelEnum =
                  el.IInstantiationService =
                  el.ICharsetService =
                  el.ICoreService =
                  el.ICoreMouseService =
                  el.IBufferService =
                    void 0));
              let ed = ec(343);
              ((el.IBufferService = (0, ed.createDecorator)("BufferService")),
                (el.ICoreMouseService = (0, ed.createDecorator)(
                  "CoreMouseService",
                )),
                (el.ICoreService = (0, ed.createDecorator)("CoreService")),
                (el.ICharsetService = (0, ed.createDecorator)(
                  "CharsetService",
                )),
                (el.IInstantiationService = (0, ed.createDecorator)(
                  "InstantiationService",
                )),
                (function (eA) {
                  ((eA[(eA.TRACE = 0)] = "TRACE"),
                    (eA[(eA.DEBUG = 1)] = "DEBUG"),
                    (eA[(eA.INFO = 2)] = "INFO"),
                    (eA[(eA.WARN = 3)] = "WARN"),
                    (eA[(eA.ERROR = 4)] = "ERROR"),
                    (eA[(eA.OFF = 5)] = "OFF"));
                })(eu || (el.LogLevelEnum = eu = {})),
                (el.ILogService = (0, ed.createDecorator)("LogService")),
                (el.IOptionsService = (0, ed.createDecorator)(
                  "OptionsService",
                )),
                (el.IOscLinkService = (0, ed.createDecorator)(
                  "OscLinkService",
                )),
                (el.IUnicodeService = (0, ed.createDecorator)(
                  "UnicodeService",
                )),
                (el.IDecorationService = (0, ed.createDecorator)(
                  "DecorationService",
                )));
            },
            480: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.UnicodeService = void 0));
              let eu = ec(460),
                ed = ec(225);
              let n = class n {
                static extractShouldJoin(eA) {
                  return 0 != (1 & eA);
                }
                static extractWidth(eA) {
                  return (eA >> 1) & 3;
                }
                static extractCharKind(eA) {
                  return eA >> 3;
                }
                static createPropertyValue(eA, el, ec = !1) {
                  return ((0xffffff & eA) << 3) | ((3 & el) << 1) | !!ec;
                }
                constructor() {
                  ((this._providers = Object.create(null)),
                    (this._active = ""),
                    (this._onChange = new eu.EventEmitter()),
                    (this.onChange = this._onChange.event));
                  const eA = new ed.UnicodeV6();
                  (this.register(eA),
                    (this._active = eA.version),
                    (this._activeProvider = eA));
                }
                dispose() {
                  this._onChange.dispose();
                }
                get versions() {
                  return Object.keys(this._providers);
                }
                get activeVersion() {
                  return this._active;
                }
                set activeVersion(eA) {
                  if (!this._providers[eA])
                    throw Error(`unknown Unicode version "${eA}"`);
                  ((this._active = eA),
                    (this._activeProvider = this._providers[eA]),
                    this._onChange.fire(eA));
                }
                register(eA) {
                  this._providers[eA.version] = eA;
                }
                wcwidth(eA) {
                  return this._activeProvider.wcwidth(eA);
                }
                getStringCellWidth(eA) {
                  let el = 0,
                    ec = 0,
                    eu = eA.length;
                  for (let ed = 0; ed < eu; ++ed) {
                    let ep = eA.charCodeAt(ed);
                    if (55296 <= ep && ep <= 56319) {
                      if (++ed >= eu) return el + this.wcwidth(ep);
                      let ec = eA.charCodeAt(ed);
                      56320 <= ec && ec <= 57343
                        ? (ep = 1024 * (ep - 55296) + ec - 56320 + 65536)
                        : (el += this.wcwidth(ec));
                    }
                    let eg = this.charProperties(ep, ec),
                      eh = n.extractWidth(eg);
                    (n.extractShouldJoin(eg) && (eh -= n.extractWidth(ec)),
                      (el += eh),
                      (ec = eg));
                  }
                  return el;
                }
                charProperties(eA, el) {
                  return this._activeProvider.charProperties(eA, el);
                }
              };
              el.UnicodeService = n;
            },
            781: (eA, el, ec) => {
              (Object.defineProperty(el, "__esModule", { value: !0 }),
                (el.Terminal = void 0));
              let eu = ec(437),
                ed = ec(969),
                ep = ec(460);
              let a = class a extends ed.CoreTerminal {
                constructor(eA = {}) {
                  (super(eA),
                    (this._onBell = this.register(new ep.EventEmitter())),
                    (this.onBell = this._onBell.event),
                    (this._onCursorMove = this.register(new ep.EventEmitter())),
                    (this.onCursorMove = this._onCursorMove.event),
                    (this._onTitleChange = this.register(
                      new ep.EventEmitter(),
                    )),
                    (this.onTitleChange = this._onTitleChange.event),
                    (this._onA11yCharEmitter = this.register(
                      new ep.EventEmitter(),
                    )),
                    (this.onA11yChar = this._onA11yCharEmitter.event),
                    (this._onA11yTabEmitter = this.register(
                      new ep.EventEmitter(),
                    )),
                    (this.onA11yTab = this._onA11yTabEmitter.event),
                    this._setup(),
                    this.register(
                      this._inputHandler.onRequestBell(() => this.bell()),
                    ),
                    this.register(
                      this._inputHandler.onRequestReset(() => this.reset()),
                    ),
                    this.register(
                      (0, ep.forwardEvent)(
                        this._inputHandler.onCursorMove,
                        this._onCursorMove,
                      ),
                    ),
                    this.register(
                      (0, ep.forwardEvent)(
                        this._inputHandler.onTitleChange,
                        this._onTitleChange,
                      ),
                    ),
                    this.register(
                      (0, ep.forwardEvent)(
                        this._inputHandler.onA11yChar,
                        this._onA11yCharEmitter,
                      ),
                    ),
                    this.register(
                      (0, ep.forwardEvent)(
                        this._inputHandler.onA11yTab,
                        this._onA11yTabEmitter,
                      ),
                    ));
                }
                get buffer() {
                  return this.buffers.active;
                }
                get markers() {
                  return this.buffer.markers;
                }
                addMarker(eA) {
                  if (this.buffer === this.buffers.normal)
                    return this.buffer.addMarker(
                      this.buffer.ybase + this.buffer.y + eA,
                    );
                }
                bell() {
                  this._onBell.fire();
                }
                input(eA, el = !0) {
                  this.coreService.triggerDataEvent(eA, el);
                }
                resize(eA, el) {
                  (eA === this.cols && el === this.rows) ||
                    super.resize(eA, el);
                }
                clear() {
                  if (0 !== this.buffer.ybase || 0 !== this.buffer.y) {
                    (this.buffer.lines.set(
                      0,
                      this.buffer.lines.get(this.buffer.ybase + this.buffer.y),
                    ),
                      (this.buffer.lines.length = 1),
                      (this.buffer.ydisp = 0),
                      (this.buffer.ybase = 0),
                      (this.buffer.y = 0));
                    for (let eA = 1; eA < this.rows; eA++)
                      this.buffer.lines.push(
                        this.buffer.getBlankLine(eu.DEFAULT_ATTR_DATA),
                      );
                    this._onScroll.fire({
                      position: this.buffer.ydisp,
                      source: 0,
                    });
                  }
                }
                reset() {
                  ((this.options.rows = this.rows),
                    (this.options.cols = this.cols),
                    this._setup(),
                    super.reset());
                }
              };
              el.Terminal = a;
            },
          },
          ec = {};
        function i(el) {
          var eu = ec[el];
          if (void 0 !== eu) return eu.exports;
          var ed = (ec[el] = { exports: {} });
          return (eA[el].call(ed.exports, ed, ed.exports, i), ed.exports);
        }
        var eu = {};
        (() => {
          var eA = eu;
          (Object.defineProperty(eA, "__esModule", { value: !0 }),
            (eA.Terminal = void 0));
          let el = i(285),
            ec = i(975),
            ed = i(90),
            ep = i(781),
            eg = i(741),
            eh = i(844),
            ef = ["cols", "rows"];
          let l = class l extends eh.Disposable {
            constructor(eA) {
              (super(),
                (this._core = this.register(new ep.Terminal(eA))),
                (this._addonManager = this.register(new eg.AddonManager())),
                (this._publicOptions = { ...this._core.options }));
              const t = (eA) => this._core.options[eA],
                i = (eA, el) => {
                  (this._checkReadonlyOptions(eA),
                    (this._core.options[eA] = el));
                };
              for (const eA in this._core.options) {
                Object.defineProperty(this._publicOptions, eA, {
                  get: () => this._core.options[eA],
                  set: (el) => {
                    (this._checkReadonlyOptions(eA),
                      (this._core.options[eA] = el));
                  },
                });
                const el = { get: t.bind(this, eA), set: i.bind(this, eA) };
                Object.defineProperty(this._publicOptions, eA, el);
              }
            }
            _checkReadonlyOptions(eA) {
              if (ef.includes(eA))
                throw Error(
                  `Option "${eA}" can only be set in the constructor`,
                );
            }
            _checkProposedApi() {
              if (!this._core.optionsService.options.allowProposedApi)
                throw Error(
                  "You must set the allowProposedApi option to true to use proposed API",
                );
            }
            get onBell() {
              return this._core.onBell;
            }
            get onBinary() {
              return this._core.onBinary;
            }
            get onCursorMove() {
              return this._core.onCursorMove;
            }
            get onData() {
              return this._core.onData;
            }
            get onLineFeed() {
              return this._core.onLineFeed;
            }
            get onResize() {
              return this._core.onResize;
            }
            get onScroll() {
              return this._core.onScroll;
            }
            get onTitleChange() {
              return this._core.onTitleChange;
            }
            get parser() {
              return (
                this._checkProposedApi(),
                this._parser || (this._parser = new ec.ParserApi(this._core)),
                this._parser
              );
            }
            get unicode() {
              return (this._checkProposedApi(), new ed.UnicodeApi(this._core));
            }
            get rows() {
              return this._core.rows;
            }
            get cols() {
              return this._core.cols;
            }
            get buffer() {
              return (
                this._checkProposedApi(),
                this._buffer ||
                  (this._buffer = this.register(
                    new el.BufferNamespaceApi(this._core),
                  )),
                this._buffer
              );
            }
            get markers() {
              return (this._checkProposedApi(), this._core.markers);
            }
            get modes() {
              let eA = this._core.coreService.decPrivateModes,
                el = "none";
              switch (this._core.coreMouseService.activeProtocol) {
                case "X10":
                  el = "x10";
                  break;
                case "VT200":
                  el = "vt200";
                  break;
                case "DRAG":
                  el = "drag";
                  break;
                case "ANY":
                  el = "any";
              }
              return {
                applicationCursorKeysMode: eA.applicationCursorKeys,
                applicationKeypadMode: eA.applicationKeypad,
                bracketedPasteMode: eA.bracketedPasteMode,
                insertMode: this._core.coreService.modes.insertMode,
                mouseTrackingMode: el,
                originMode: eA.origin,
                reverseWraparoundMode: eA.reverseWraparound,
                sendFocusMode: eA.sendFocus,
                wraparoundMode: eA.wraparound,
              };
            }
            get options() {
              return this._publicOptions;
            }
            set options(eA) {
              for (let el in eA) this._publicOptions[el] = eA[el];
            }
            input(eA, el = !0) {
              this._core.input(eA, el);
            }
            resize(eA, el) {
              (this._verifyIntegers(eA, el), this._core.resize(eA, el));
            }
            registerMarker(eA = 0) {
              return (
                this._checkProposedApi(),
                this._verifyIntegers(eA),
                this._core.addMarker(eA)
              );
            }
            addMarker(eA) {
              return this.registerMarker(eA);
            }
            dispose() {
              super.dispose();
            }
            scrollLines(eA) {
              (this._verifyIntegers(eA), this._core.scrollLines(eA));
            }
            scrollPages(eA) {
              (this._verifyIntegers(eA), this._core.scrollPages(eA));
            }
            scrollToTop() {
              this._core.scrollToTop();
            }
            scrollToBottom() {
              this._core.scrollToBottom();
            }
            scrollToLine(eA) {
              (this._verifyIntegers(eA), this._core.scrollToLine(eA));
            }
            clear() {
              this._core.clear();
            }
            write(eA, el) {
              this._core.write(eA, el);
            }
            writeln(eA, el) {
              (this._core.write(eA), this._core.write("\r\n", el));
            }
            reset() {
              this._core.reset();
            }
            loadAddon(eA) {
              this._addonManager.loadAddon(this, eA);
            }
            _verifyIntegers(...eA) {
              for (let el of eA)
                if (el === 1 / 0 || isNaN(el) || el % 1 != 0)
                  throw Error("This API only accepts integers");
            }
          };
          eA.Terminal = l;
        })();
        var ed = el;
        for (var ep in eu) ed[ep] = eu[ep];
        eu.__esModule && Object.defineProperty(ed, "__esModule", { value: !0 });
      })();
    },
    6453(eA, el, ec) {
      "use strict";
      let eu;
      (ec.r(el),
        ec.d(el, {
          SNAPSHOT_SUPPORTED_SHELLS: () => eI,
          decodeBuffer: () => decodeBuffer,
          decodeBufferWindows: () => decodeBufferWindows,
          detectEncodingFromBuffer: () => detectEncodingFromBuffer,
          ensureShoptDisabled: () => ensureShoptDisabled,
          escapePathForShell: () => escapePathForShell,
          findLeakedPtmxFd: () => findLeakedPtmxFd,
          getCachedEncodingForBuffer: () => getCachedEncodingForBuffer,
          getPowerShellArgsPrefix: () => getPowerShellArgsPrefix,
          getPty: () => getPty,
          getShellConfiguration: () => getShellConfiguration,
          getSystemEncoding: () => getSystemEncoding,
          isBinary: () => isBinary,
          isGitBashAvailable: () => isGitBashAvailable,
          isSnapshotSupportedShell: () => isSnapshotSupportedShell,
          isValidUtf8: () => isValidUtf8,
          isWindows: () => isWindows,
          listOpenFds: () => listOpenFds,
          parseCommandLine: () => parseCommandLine,
          parseEnvFile: () => parseEnvFile,
          resetEncodingCache: () => resetEncodingCache,
          splitPendingUtf8Tail: () => splitPendingUtf8Tail,
          windowsCodePageToEncoding: () => windowsCodePageToEncoding,
          windowsPathToUnix: () => windowsPathToUnix,
        }));
      var ed = ec(35317),
        ep = ec(79896),
        eg = ec.n(ep),
        eh = ec(93130),
        ef = ec.n(eh),
        em = ec(23238),
        eE = ec(70857),
        eC = ec.n(eE),
        ey = ec(5516),
        ew = ec.n(ey),
        eB = ec(70543),
        e_ = ec(70064);
      function listOpenFds() {
        if (isWindows()) return new Set();
        try {
          let eA = eg().readdirSync("/dev/fd"),
            el = new Set();
          for (let ec of eA) {
            let eA = parseInt(ec, 10);
            isNaN(eA) || el.add(eA);
          }
          return el;
        } catch {
          return new Set();
        }
      }
      function findLeakedPtmxFd(eA, el, ec) {
        for (let eu of el)
          if (!eA.has(eu) && eu !== ec)
            try {
              if (eg().fstatSync(eu).isCharacterDevice()) return eu;
            } catch {}
      }
      function isMuslLinux() {
        if ("linux" !== eC().platform()) return !1;
        try {
          if (
            eg()
              .readdirSync("/lib")
              .some((eA) => eA.startsWith("ld-musl-"))
          )
            return !0;
        } catch {}
        return !1;
      }
      let getPty = async () => {
          if (isWindows()) {
            if ((0, eB.getWindowsBuildNumber)() < eB.WINDOWS_CONPTY_MIN_BUILD)
              return null;
            try {
              return {
                module: await import("@lydell/node-pty"),
                name: "lydell-node-pty",
              };
            } catch (eA) {
              return null;
            }
          }
          if ("u" > typeof Bun)
            return {
              module: {
                spawn(eA, el, ec) {
                  let eu = null,
                    ed = [],
                    ep = Bun.spawn([eA, ...el], {
                      cwd: ec?.cwd,
                      env: ec?.env,
                      terminal: {
                        cols: ec?.cols || 80,
                        rows: ec?.rows || 24,
                        name: ec?.name || "xterm-256color",
                        data(eA, el) {
                          let ec = el.toString();
                          eu ? eu(ec) : ed.push(ec);
                        },
                      },
                    });
                  return {
                    get pid() {
                      return ep.pid;
                    },
                    onData(eA) {
                      for (let el of ((eu = eA), ed)) eA(el);
                      ed.length = 0;
                    },
                    onExit(eA) {
                      ep.exited.then((el) => eA({ exitCode: el ?? 0 }));
                    },
                    write(eA) {
                      ep.terminal?.write(eA);
                    },
                    resize(eA, el) {
                      ep.terminal?.resize(eA, el);
                    },
                    kill(eA) {
                      ep.kill(eA);
                    },
                  };
                },
              },
              name: "bun-native-pty",
            };
          if (isMuslLinux()) return null;
          try {
            return {
              module: await import("@lydell/node-pty"),
              name: "lydell-node-pty",
            };
          } catch (eA) {
            return null;
          }
        },
        eI = new Set(["bash", "zsh", "sh"]);
      function isWindows() {
        return "win32" === eC().platform();
      }
      function isGitBashAvailable() {
        return !isWindows() || !!e_.WindowsBashUtils.findBashPath();
      }
      function commandExists(eA) {
        try {
          return (ew().sync(eA), !0);
        } catch {
          return !1;
        }
      }
      function getPowerShellArgsPrefix(eA = isWindows()) {
        return eA
          ? [
              "-NoProfile",
              "-NonInteractive",
              "-WindowStyle",
              "Hidden",
              "-Command",
            ]
          : ["-NoProfile", "-NonInteractive", "-Command"];
      }
      function getPowerShellConfiguration() {
        let eA = getPowerShellArgsPrefix(),
          el = ew().sync("pwsh", { nothrow: !0 });
        if (el) return { executable: el, argsPrefix: eA, shell: "powershell" };
        let ec = ew().sync("powershell", { nothrow: !0 });
        if (ec) return { executable: ec, argsPrefix: eA, shell: "powershell" };
        let eu =
          (process.env.SYSTEMROOT || "C:\\Windows") +
          "\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
        try {
          return (
            eg().accessSync(eu),
            { executable: eu, argsPrefix: eA, shell: "powershell" }
          );
        } catch {
          throw Error(
            "No shell is available. Neither Git Bash nor PowerShell could be found. Please install PowerShell 7+ (https://aka.ms/powershell) or Git for Windows (https://git-scm.com/download/win).",
          );
        }
      }
      function getShellConfigByType(eA) {
        switch (eA.toLowerCase()) {
          case "bash":
            if (isWindows()) {
              let eA = e_.WindowsBashUtils.findBashPath();
              if (!eA)
                return (
                  console.warn(
                    'CODEBUDDY_CODE_SHELL is set to "bash" but Git Bash was not found. Falling back to PowerShell. Install Git for Windows (https://git-scm.com/download/win) to use bash.',
                  ),
                  getPowerShellConfiguration()
                );
              return { executable: eA, argsPrefix: ["-c"], shell: "bash" };
            }
            return { executable: "bash", argsPrefix: ["-c"], shell: "bash" };
          case "zsh":
            return { executable: "zsh", argsPrefix: ["-c"], shell: "zsh" };
          case "sh":
            return { executable: "/bin/sh", argsPrefix: ["-c"], shell: "sh" };
          case "powershell":
            return getPowerShellConfiguration();
          case "cmd":
            throw Error(
              'CODEBUDDY_CODE_SHELL="cmd" is not supported. Please use powershell, bash, or install Git for Windows.',
            );
          default:
            throw Error(`Unsupported shell type: ${eA}`);
        }
      }
      function getShellConfiguration() {
        let eA = process.env.CODEBUDDY_CODE_SHELL;
        if (eA) return getShellConfigByType(eA);
        if (isWindows()) {
          let eA = e_.WindowsBashUtils.findBashPath();
          return eA
            ? { executable: eA, argsPrefix: ["-c"], shell: "bash" }
            : getPowerShellConfiguration();
        }
        let el = process.env.SHELL;
        if (el && commandExists(el)) {
          let eA = detectShellType(el);
          return { executable: el, argsPrefix: ["-c"], shell: eA };
        }
        return { executable: "/bin/sh", argsPrefix: ["-c"], shell: "sh" };
      }
      function detectShellType(eA) {
        let el = eA.toLowerCase().split("/").pop() || "sh";
        return el.startsWith("bash")
          ? "bash"
          : el.startsWith("zsh")
            ? "zsh"
            : "sh" === el
              ? "sh"
              : el;
      }
      function isSnapshotSupportedShell(eA) {
        return eI.has(eA);
      }
      let ev = "promptvars nullglob extglob nocaseglob dotglob",
        eS = `shopt -u ${ev};`;
      function ensureShoptDisabled(eA, el) {
        return "bash" !== el || eA.trimStart().startsWith(eS)
          ? eA
          : `${eS} ${eA}`;
      }
      function resetEncodingCache() {
        eu = void 0;
      }
      function getCachedEncodingForBuffer(eA) {
        return (void 0 === eu && (eu = getSystemEncoding()), eu)
          ? eu
          : detectEncodingFromBuffer(eA) || "utf-8";
      }
      function getSystemEncoding() {
        if ("win32" === eC().platform()) {
          try {
            let eA = (0, ed.execSync)("chcp", {
              encoding: "utf8",
              stdio: "pipe",
              windowsHide: !0,
            }).match(/:\s*(\d+)/);
            if (eA) {
              let el = parseInt(eA[1], 10);
              if (!isNaN(el)) return windowsCodePageToEncoding(el);
            }
          } catch (eA) {}
          return null;
        }
        let eA = process.env,
          el = eA.LC_ALL || eA.LC_CTYPE || eA.LANG || "";
        if (!el)
          try {
            el = (0, ed.execSync)("locale charmap", {
              encoding: "utf8",
              stdio: "pipe",
            })
              .toString()
              .trim();
          } catch (eA) {
            return null;
          }
        let ec = el.match(/\.(.+)/);
        return ec && ec[1]
          ? ec[1].toLowerCase()
          : el && !el.includes(".")
            ? el.toLowerCase()
            : null;
      }
      function windowsCodePageToEncoding(eA) {
        return (
          {
            437: "cp437",
            850: "cp850",
            852: "cp852",
            866: "cp866",
            874: "windows-874",
            932: "shift_jis",
            936: "gb2312",
            949: "euc-kr",
            950: "big5",
            1200: "utf-16le",
            1201: "utf-16be",
            1250: "windows-1250",
            1251: "windows-1251",
            1252: "windows-1252",
            1253: "windows-1253",
            1254: "windows-1254",
            1255: "windows-1255",
            1256: "windows-1256",
            1257: "windows-1257",
            1258: "windows-1258",
            65001: "utf-8",
          }[eA] || null
        );
      }
      function detectEncodingFromBuffer(eA) {
        try {
          let el = em.detect(eA);
          if (el && el.encoding) return el.encoding.toLowerCase();
        } catch (eA) {}
        return null;
      }
      function isValidUtf8(eA) {
        try {
          return (
            Buffer.from(eA, "utf8").toString("utf8") === eA && !eA.includes("�")
          );
        } catch (eA) {
          return !1;
        }
      }
      function isAsciiOnly(eA) {
        for (let el of eA) if (el > 127) return !1;
        return !0;
      }
      function isStrictValidUtf8(eA) {
        try {
          return (
            new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !1 }).decode(eA),
            !0
          );
        } catch (eA) {
          return !1;
        }
      }
      function splitPendingUtf8Tail(eA) {
        let el = eA.length,
          ec = Math.min(3, el);
        for (let eu = 1; eu <= ec; eu++) {
          let ec = el - eu,
            ed = eA[ec];
          if ((192 & ed) == 128) continue;
          let ep = 0;
          if ((128 & ed) == 0) break;
          if ((224 & ed) == 192) ep = 2;
          else if ((240 & ed) == 224) ep = 3;
          else if ((248 & ed) == 240) ep = 4;
          else break;
          if (eu < ep)
            return { ready: eA.subarray(0, ec), pending: eA.subarray(ec) };
          break;
        }
        return { ready: eA, pending: Buffer.alloc(0) };
      }
      function decodeBufferWindows(eA) {
        if ("string" == typeof eA) return eA;
        if (isAsciiOnly(eA)) return eA.toString("ascii");
        if (isStrictValidUtf8(eA)) return eA.toString("utf8");
        try {
          let el = em.detect(eA);
          if (el && el.encoding && el.confidence >= 0.9) {
            let ec = el.encoding.toLowerCase();
            if (ef().encodingExists(ec)) return ef().decode(eA, ec);
          }
        } catch (eA) {}
        try {
          return ef().decode(eA, "cp936");
        } catch (el) {
          return eA.toString("utf8");
        }
      }
      function decodeBuffer(eA) {
        if ("string" == typeof eA) return eA;
        if (isWindows()) return decodeBufferWindows(eA);
        if (isStrictValidUtf8(eA)) return eA.toString("utf8");
        let el = getCachedEncodingForBuffer(eA);
        try {
          return ef().decode(eA, el);
        } catch (el) {
          return ef().decode(eA, "utf8");
        }
      }
      function isBinary(eA, el = 512) {
        if (!eA) return !1;
        for (let ec of eA.length > el ? eA.subarray(0, el) : eA)
          if (0 === ec) return !0;
        return !1;
      }
      function windowsPathToUnix(eA) {
        let el = eA.replace(/\\/g, "/"),
          ec = el.match(/^([a-zA-Z]):\//);
        return (ec && (el = "/" + ec[1].toLowerCase() + el.slice(2)), el);
      }
      function escapePathForShell(eA) {
        return (
          isWindows() && (eA = windowsPathToUnix(eA)),
          `'${eA.replace(/'/g, "'\\''")}'`
        );
      }
      function parseCommandLine(eA) {
        if ("string" != typeof eA || 0 === eA.trim().length)
          throw Error("parseCommandLine: empty command line");
        let el = [],
          ec = "",
          eu = !1,
          ed = !1;
        for (let ep = 0; ep < eA.length; ep++) {
          let eg = eA[ep],
            eh = eA[ep + 1];
          if (eu) {
            if (("`" === eg && '"' === eh) || ("\\" === eg && '"' === eh)) {
              ((ec += '"'), ep++);
              continue;
            }
            if ('"' === eg) {
              eu = !1;
              continue;
            }
            ec += eg;
            continue;
          }
          if ('"' === eg) {
            ((eu = !0), (ed = !0));
            continue;
          }
          if (" " === eg || "	" === eg) {
            ed && (el.push(ec), (ec = ""), (ed = !1));
            continue;
          }
          ((ec += eg), (ed = !0));
        }
        if (eu)
          throw Error(
            `parseCommandLine: unterminated quoted string in ${JSON.stringify(eA)}`,
          );
        if ((ed && el.push(ec), 0 === el.length))
          throw Error("parseCommandLine: no tokens parsed");
        let [ep, ...eg] = el;
        return { exe: ep, args: eg };
      }
      function parseEnvFile(eA) {
        let el = {},
          ec = eA.split(/\r?\n/),
          eu = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;
        for (let eA of ec) {
          let ec = eA.trim();
          if (!ec || ec.startsWith("#")) continue;
          let ed = ec.match(eu);
          if (!ed) continue;
          let ep = ed[2];
          (((ep.startsWith('"') && ep.endsWith('"') && ep.length >= 2) ||
            (ep.startsWith("'") && ep.endsWith("'") && ep.length >= 2)) &&
            (ep = ep.slice(1, -1)),
            (el[ed[1]] = ep));
        }
        return el;
      }
    },
    2752(eA, el, ec) {
      "use strict";
      var eu, ed;
      (ec.r(el),
        ec.d(el, {
          ColorMode: () => ed,
          serializeTerminalToObject: () => serializeTerminalToObject,
        }),
        (function (eA) {
          ((eA[(eA.inverse = 1)] = "inverse"),
            (eA[(eA.bold = 2)] = "bold"),
            (eA[(eA.italic = 4)] = "italic"),
            (eA[(eA.underline = 8)] = "underline"),
            (eA[(eA.dim = 16)] = "dim"));
        })(eu || (eu = {})),
        (function (eA) {
          ((eA[(eA.DEFAULT = 0)] = "DEFAULT"),
            (eA[(eA.PALETTE = 1)] = "PALETTE"),
            (eA[(eA.RGB = 2)] = "RGB"));
        })(ed || (ed = {})));
      let Cell = class Cell {
        constructor(eA, el, ec, ep, eg) {
          if (
            ((this.attributes = 0),
            (this.fg = 0),
            (this.bg = 0),
            (this.fgColorMode = ed.DEFAULT),
            (this.bgColorMode = ed.DEFAULT),
            (this.cell = eA),
            (this.x = el),
            (this.y = ec),
            (this.cursorX = ep),
            (this.cursorY = eg),
            !eA)
          )
            return;
          (eA.isInverse() && (this.attributes += eu.inverse),
            eA.isBold() && (this.attributes += eu.bold),
            eA.isItalic() && (this.attributes += eu.italic),
            eA.isUnderline() && (this.attributes += eu.underline),
            eA.isDim() && (this.attributes += eu.dim),
            eA.isFgRGB()
              ? (this.fgColorMode = ed.RGB)
              : eA.isFgPalette()
                ? (this.fgColorMode = ed.PALETTE)
                : (this.fgColorMode = ed.DEFAULT),
            eA.isBgRGB()
              ? (this.bgColorMode = ed.RGB)
              : eA.isBgPalette()
                ? (this.bgColorMode = ed.PALETTE)
                : (this.bgColorMode = ed.DEFAULT),
            this.fgColorMode === ed.DEFAULT
              ? (this.fg = -1)
              : (this.fg = eA.getFgColor()),
            this.bgColorMode === ed.DEFAULT
              ? (this.bg = -1)
              : (this.bg = eA.getBgColor()));
        }
        isCursor() {
          return this.x === this.cursorX && this.y === this.cursorY;
        }
        getChars() {
          return this.cell?.getChars() || " ";
        }
        isAttribute(eA) {
          return (this.attributes & eA) != 0;
        }
        equals(eA) {
          return (
            this.attributes === eA.attributes &&
            this.fg === eA.fg &&
            this.bg === eA.bg &&
            this.fgColorMode === eA.fgColorMode &&
            this.bgColorMode === eA.bgColorMode &&
            this.isCursor() === eA.isCursor()
          );
        }
      };
      let ep = [
        "#000000",
        "#800000",
        "#008000",
        "#808000",
        "#000080",
        "#800080",
        "#008080",
        "#c0c0c0",
        "#808080",
        "#ff0000",
        "#00ff00",
        "#ffff00",
        "#0000ff",
        "#ff00ff",
        "#00ffff",
        "#ffffff",
        "#000000",
        "#00005f",
        "#000087",
        "#0000af",
        "#0000d7",
        "#0000ff",
        "#005f00",
        "#005f5f",
        "#005f87",
        "#005faf",
        "#005fd7",
        "#005fff",
        "#008700",
        "#00875f",
        "#008787",
        "#0087af",
        "#0087d7",
        "#0087ff",
        "#00af00",
        "#00af5f",
        "#00af87",
        "#00afaf",
        "#00afd7",
        "#00afff",
        "#00d700",
        "#00d75f",
        "#00d787",
        "#00d7af",
        "#00d7d7",
        "#00d7ff",
        "#00ff00",
        "#00ff5f",
        "#00ff87",
        "#00ffaf",
        "#00ffd7",
        "#00ffff",
        "#5f0000",
        "#5f005f",
        "#5f0087",
        "#5f00af",
        "#5f00d7",
        "#5f00ff",
        "#5f5f00",
        "#5f5f5f",
        "#5f5f87",
        "#5f5faf",
        "#5f5fd7",
        "#5f5fff",
        "#5f8700",
        "#5f875f",
        "#5f8787",
        "#5f87af",
        "#5f87d7",
        "#5f87ff",
        "#5faf00",
        "#5faf5f",
        "#5faf87",
        "#5fafaf",
        "#5fafd7",
        "#5fafff",
        "#5fd700",
        "#5fd75f",
        "#5fd787",
        "#5fd7af",
        "#5fd7d7",
        "#5fd7ff",
        "#5fff00",
        "#5fff5f",
        "#5fff87",
        "#5fffaf",
        "#5fffd7",
        "#5fffff",
        "#870000",
        "#87005f",
        "#870087",
        "#8700af",
        "#8700d7",
        "#8700ff",
        "#875f00",
        "#875f5f",
        "#875f87",
        "#875faf",
        "#875fd7",
        "#875fff",
        "#878700",
        "#87875f",
        "#878787",
        "#8787af",
        "#8787d7",
        "#8787ff",
        "#87af00",
        "#87af5f",
        "#87af87",
        "#87afaf",
        "#87afd7",
        "#87afff",
        "#87d700",
        "#87d75f",
        "#87d787",
        "#87d7af",
        "#87d7d7",
        "#87d7ff",
        "#87ff00",
        "#87ff5f",
        "#87ff87",
        "#87ffaf",
        "#87ffd7",
        "#87ffff",
        "#af0000",
        "#af005f",
        "#af0087",
        "#af00af",
        "#af00d7",
        "#af00ff",
        "#af5f00",
        "#af5f5f",
        "#af5f87",
        "#af5faf",
        "#af5fd7",
        "#af5fff",
        "#af8700",
        "#af875f",
        "#af8787",
        "#af87af",
        "#af87d7",
        "#af87ff",
        "#afaf00",
        "#afaf5f",
        "#afaf87",
        "#afafaf",
        "#afafd7",
        "#afafff",
        "#afd700",
        "#afd75f",
        "#afd787",
        "#afd7af",
        "#afd7d7",
        "#afd7ff",
        "#afff00",
        "#afff5f",
        "#afff87",
        "#afffaf",
        "#afffd7",
        "#afffff",
        "#d70000",
        "#d7005f",
        "#d70087",
        "#d700af",
        "#d700d7",
        "#d700ff",
        "#d75f00",
        "#d75f5f",
        "#d75f87",
        "#d75faf",
        "#d75fd7",
        "#d75fff",
        "#d78700",
        "#d7875f",
        "#d78787",
        "#d787af",
        "#d787d7",
        "#d787ff",
        "#d7af00",
        "#d7af5f",
        "#d7af87",
        "#d7afaf",
        "#d7afd7",
        "#d7afff",
        "#d7d700",
        "#d7d75f",
        "#d7d787",
        "#d7d7af",
        "#d7d7d7",
        "#d7d7ff",
        "#d7ff00",
        "#d7ff5f",
        "#d7ff87",
        "#d7ffaf",
        "#d7ffd7",
        "#d7ffff",
        "#ff0000",
        "#ff005f",
        "#ff0087",
        "#ff00af",
        "#ff00d7",
        "#ff00ff",
        "#ff5f00",
        "#ff5f5f",
        "#ff5f87",
        "#ff5faf",
        "#ff5fd7",
        "#ff5fff",
        "#ff8700",
        "#ff875f",
        "#ff8787",
        "#ff87af",
        "#ff87d7",
        "#ff87ff",
        "#ffaf00",
        "#ffaf5f",
        "#ffaf87",
        "#ffafaf",
        "#ffafd7",
        "#ffafff",
        "#ffd700",
        "#ffd75f",
        "#ffd787",
        "#ffd7af",
        "#ffd7d7",
        "#ffd7ff",
        "#ffff00",
        "#ffff5f",
        "#ffff87",
        "#ffffaf",
        "#ffffd7",
        "#ffffff",
        "#080808",
        "#121212",
        "#1c1c1c",
        "#262626",
        "#303030",
        "#3a3a3a",
        "#444444",
        "#4e4e4e",
        "#585858",
        "#626262",
        "#6c6c6c",
        "#767676",
        "#808080",
        "#8a8a8a",
        "#949494",
        "#9e9e9e",
        "#a8a8a8",
        "#b2b2b2",
        "#bcbcbc",
        "#c6c6c6",
        "#d0d0d0",
        "#dadada",
        "#e4e4e4",
        "#eeeeee",
      ];
      function convertColorToHex(eA, el, ec) {
        if (el === ed.RGB) {
          let el = (eA >> 16) & 255,
            ec = (eA >> 8) & 255,
            eu = 255 & eA;
          return `#${el.toString(16).padStart(2, "0")}${ec.toString(16).padStart(2, "0")}${eu.toString(16).padStart(2, "0")}`;
        }
        return (el === ed.PALETTE && ep[eA]) || ec;
      }
      function serializeTerminalToObject(eA) {
        let el = eA.buffer.active,
          ec = el.cursorX,
          ed = el.cursorY,
          ep = "",
          eg = "",
          eh = [];
        for (let ef = 0; ef < eA.rows; ef++) {
          let em = el.getLine(el.viewportY + ef),
            eE = [];
          if (!em) {
            eh.push(eE);
            continue;
          }
          let eC = new Cell(null, -1, -1, ec, ed),
            ey = "";
          for (let el = 0; el < eA.cols; el++) {
            let eA = new Cell(em.getCell(el) || null, el, ef, ec, ed);
            if (el > 0 && !eA.equals(eC)) {
              if (ey) {
                let eA = {
                  text: ey,
                  bold: eC.isAttribute(eu.bold),
                  italic: eC.isAttribute(eu.italic),
                  underline: eC.isAttribute(eu.underline),
                  dim: eC.isAttribute(eu.dim),
                  inverse: eC.isAttribute(eu.inverse) || eC.isCursor(),
                  fg: convertColorToHex(eC.fg, eC.fgColorMode, ep),
                  bg: convertColorToHex(eC.bg, eC.bgColorMode, eg),
                };
                eE.push(eA);
              }
              ey = "";
            }
            ((ey += eA.getChars()), (eC = eA));
          }
          if (ey) {
            let eA = {
              text: ey,
              bold: eC.isAttribute(eu.bold),
              italic: eC.isAttribute(eu.italic),
              underline: eC.isAttribute(eu.underline),
              dim: eC.isAttribute(eu.dim),
              inverse: eC.isAttribute(eu.inverse) || eC.isCursor(),
              fg: convertColorToHex(eC.fg, eC.fgColorMode, ep),
              bg: convertColorToHex(eC.bg, eC.bgColorMode, eg),
            };
            eE.push(eA);
          }
          eh.push(eE);
        }
        return eh;
      }
    },
    83044(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { TruncateBuffer: () => TruncateBuffer }));
      var eu = ec(19702);
      let TruncateBuffer = class TruncateBuffer {
        constructor(
          eA = Math.floor(0.2 * eu.MAX_SHELL_OUTPUT_LENGTH),
          el = eu.MAX_SHELL_OUTPUT_LENGTH -
            Math.floor(0.2 * eu.MAX_SHELL_OUTPUT_LENGTH),
        ) {
          ((this.headBuf = ""),
            (this.tailBuf = ""),
            (this.truncatedBytes = 0),
            (this.totalLines = 0),
            (this.headLimit = Math.max(0, 0 | eA)),
            (this.tailLimit = Math.max(0, 0 | el)));
        }
        push(eA) {
          if (!eA) return;
          let el = (eA.match(/\r\n|\r|\n/g) || []).length;
          if (((this.totalLines += el), this.headBuf.length < this.headLimit)) {
            let el = this.headLimit - this.headBuf.length;
            if (eA.length <= el) this.headBuf += eA;
            else {
              this.headBuf += eA.slice(0, el);
              let ec = eA.slice(el);
              ((this.tailBuf += ec),
                this.tailBuf.length > this.tailLimit &&
                  ((this.truncatedBytes +=
                    this.tailBuf.length - this.tailLimit),
                  (this.tailBuf = this.tailBuf.slice(-this.tailLimit))));
            }
          } else
            ((this.tailBuf += eA),
              this.tailBuf.length > this.tailLimit &&
                ((this.truncatedBytes += this.tailBuf.length - this.tailLimit),
                (this.tailBuf = this.tailBuf.slice(-this.tailLimit))));
        }
        toString(eA = !0) {
          return eA && this.truncatedBytes > 0
            ? `${this.headBuf}
... [truncated ${this.truncatedBytes} bytes] ...
${this.tailBuf}`
            : this.headBuf + this.tailBuf;
        }
        isEmpty() {
          return "" === this.headBuf && "" === this.tailBuf;
        }
        getHead() {
          return this.headBuf;
        }
        getTail() {
          return this.tailBuf;
        }
        getTruncatedBytes() {
          return this.truncatedBytes;
        }
        getTotalLines() {
          return this.totalLines;
        }
        clear() {
          ((this.headBuf = ""),
            (this.tailBuf = ""),
            (this.truncatedBytes = 0),
            (this.totalLines = 0));
        }
      };
    },
    70543(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          POWERSHELL_USE_PTY_ENV: () => ep,
          WINDOWS_CONPTY_MIN_BUILD: () => ed,
          buildPowerShellConptyEnv: () => buildPowerShellConptyEnv,
          formatPowerShellConptyCommand: () => formatPowerShellConptyCommand,
          getPowerShellConptyPathEntries: () => getPowerShellConptyPathEntries,
          getWindowsBuildNumber: () => getWindowsBuildNumber,
          redactPowerShellCommand: () => redactPowerShellCommand,
          shouldUsePowerShellConpty: () => shouldUsePowerShellConpty,
          splitCompletePowerShellPtyOutput: () =>
            splitCompletePowerShellPtyOutput,
          stripOscSequences: () => stripOscSequences,
          wrapPowerShellCommandForExitCode: () =>
            wrapPowerShellCommandForExitCode,
        }));
      var eu = ec(70857);
      let ed = 18309,
        ep = "CODEBUDDY_POWERSHELL_USE_PTY",
        eg = ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL",
        eh = "C:\\Windows",
        ef = "C:\\nvm4w\\nvm\\nodejs",
        em = ["Path", "PATH", "path"];
      function getWindowsBuildNumber(eA = eu.release()) {
        let el = Number(eA.split(".")[2] || 0);
        return Number.isFinite(el) ? el : 0;
      }
      function shouldUsePowerShellConpty(
        eA,
        el = process.env[ep],
        ec = getWindowsBuildNumber(),
      ) {
        return eA && "1" === el && ec >= ed;
      }
      function redactPowerShellCommand(eA) {
        return eA
          .replace(
            /((?:echo\s+(?:-n\s+)?)?["'][^"']+["']\s*\|\s*[^\r\n;]*--token-stdin\b)/gi,
            (eA) => eA.replace(/(["'])[^"']+\1/, "$1[REDACTED]$1"),
          )
          .replace(
            /(\$env:BUDDY_CLOUD_TOKEN\s*=\s*)(?:"[^"]*"|'[^']*'|[^;\r\n]+)/gi,
            '$1"[REDACTED]"',
          )
          .replace(
            /(\bBUDDY_CLOUD_TOKEN\s*=\s*)(?:"[^"]*"|'[^']*'|[^;\r\n]+)/gi,
            '$1"[REDACTED]"',
          )
          .replace(/(\s-Token\s+)(?:"[^"]*"|'[^']*'|\S+)/gi, "$1[REDACTED]");
      }
      function wrapPowerShellCommandForExitCode(eA) {
        return [
          eA,
          "$_codebuddyPsSucceeded = $?\n$_codebuddyPsLastExitCode = $LASTEXITCODE\n$_code = if ($null -ne $_codebuddyPsLastExitCode) { $_codebuddyPsLastExitCode } elseif ($_codebuddyPsSucceeded) { 0 } else { 1 }\nexit $_code",
        ].join("\n");
      }
      function splitCompletePowerShellPtyOutput(eA) {
        let el = eA.lastIndexOf("\x1b]");
        if (-1 === el) return { complete: eA, pending: "" };
        let ec = eA.indexOf("\x07", el),
          eu = eA.indexOf("\x1b\\", el);
        return -1 === ec && -1 === eu
          ? { complete: eA.slice(0, el), pending: eA.slice(el) }
          : { complete: eA, pending: "" };
      }
      let eE = /\x1b\][\s\S]*?(?:\x07|\x1b\\|\x9c)/g;
      function stripOscSequences(eA) {
        return eA.replace(eE, "");
      }
      function appendUniquePathEntry(eA, el, ec) {
        let eu = ec?.trim();
        if (!eu) return;
        let ed = eu.toLowerCase();
        el.has(ed) || (el.add(ed), eA.push(eu));
      }
      function getEnvValueIgnoreCase(eA, el) {
        let ec = Object.keys(eA).find(
          (ec) => ec.toLowerCase() === el.toLowerCase() && !!eA[ec],
        );
        return ec ? eA[ec] : void 0;
      }
      function setWindowsPathEnv(eA, el) {
        for (let ec of new Set([
          ...Object.keys(eA).filter((eA) => "path" === eA.toLowerCase()),
          ...em,
        ]))
          eA[ec] = el;
      }
      function buildPowerShellConptyPathExt(eA) {
        let el = [],
          ec = new Set();
        for (let eu of (eA || eg).split(";")) appendUniquePathEntry(el, ec, eu);
        for (let eA of eg.split(";")) appendUniquePathEntry(el, ec, eA);
        return el.join(";");
      }
      function getPowerShellConptyPathEntries(
        eA = process.env.WORKBUDDY_EXTRA_PATHS,
        el = getEnvValueIgnoreCase(process.env, "PATH"),
        ec = process.env.SystemRoot || eh,
        eu = process.env.NVM_SYMLINK,
      ) {
        let ed = [],
          ep = new Set();
        for (let el of (eA || "").split(";")) appendUniquePathEntry(ed, ep, el);
        for (let eA of (appendUniquePathEntry(ed, ep, eu),
        appendUniquePathEntry(ed, ep, ef),
        appendUniquePathEntry(ed, ep, `${ec}\\System32`),
        appendUniquePathEntry(ed, ep, ec),
        appendUniquePathEntry(ed, ep, `${ec}\\System32\\Wbem`),
        appendUniquePathEntry(
          ed,
          ep,
          `${ec}\\System32\\WindowsPowerShell\\v1.0`,
        ),
        appendUniquePathEntry(ed, ep, `${ec}\\System32\\OpenSSH`),
        (el || "").split(";")))
          appendUniquePathEntry(ed, ep, eA);
        return ed;
      }
      function buildPowerShellConptyEnv(eA = process.env) {
        let el = { ...eA };
        return (
          setWindowsPathEnv(
            el,
            getPowerShellConptyPathEntries(
              eA.WORKBUDDY_EXTRA_PATHS,
              getEnvValueIgnoreCase(eA, "PATH"),
              eA.SystemRoot,
              eA.NVM_SYMLINK,
            ).join(";"),
          ),
          (el.PATHEXT = buildPowerShellConptyPathExt(
            getEnvValueIgnoreCase(eA, "PATHEXT"),
          )),
          "1" !== el.WORKBUDDY_PS_DOTNET_UTF8_DISABLED &&
            void 0 === el.DOTNET_SYSTEM_CONSOLE_USEUTF8ENCODING &&
            (el.DOTNET_SYSTEM_CONSOLE_USEUTF8ENCODING = "1"),
          el
        );
      }
      function formatPowerShellConptyCommand(eA) {
        return eA.trim();
      }
    },
    38736(eA, el, ec) {
      eA.exports = function (eA) {
        return "u" > typeof Bun ? Bun.stripANSI(eA) : ec(79436)(eA);
      };
    },
    79436(eA, el, ec) {
      "use strict";
      let eu = ec(91371);
      eA.exports = (eA) => ("string" == typeof eA ? eA.replace(eu(), "") : eA);
    },
    91371(eA) {
      "use strict";
      eA.exports = ({ onlyFirst: eA = !1 } = {}) =>
        RegExp(
          "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
          eA ? void 0 : "g",
        );
    },
    19702(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          DEFAULT_BASH_ASSISTANT_BUDGET_MS: () => ef,
          DEFAULT_BASH_MAX_OUTPUT_LENGTH: () => eg,
          DEFAULT_BASH_MAX_TIMEOUT_MS: () => ep,
          DEFAULT_BASH_TIMEOUT_MS: () => ed,
          LocalShellService: () => eQ,
          MAX_BASH_OUTPUT_LENGTH_CAP: () => eh,
          MAX_SHELL_OUTPUT_LENGTH: () => ev,
          RESOLVED_BASH_ASSISTANT_BUDGET_MS: () => eC,
          RESOLVED_BASH_DEFAULT_TIMEOUT_MS: () => e_,
          RESOLVED_BASH_MAX_TIMEOUT_MS: () => ew,
          ShellService: () => eS,
          resolveBashTimeoutFromEnv: () => resolveBashTimeoutFromEnv,
        }));
      var eu = ec(3927);
      let ed = 12e4,
        ep = 6e5,
        eg = 3e4,
        eh = 15e4,
        ef = 0,
        em = process.env.CODEBUDDY_BASH_ASSISTANT_BUDGET_MS,
        eE = eu.NumberUtils.parsePositiveInteger(em),
        eC = "0" === em ? 0 : void 0 === eE ? ef : eE,
        ey = eu.NumberUtils.parsePositiveInteger(
          process.env.BASH_MAX_TIMEOUT_MS,
        ),
        ew = void 0 === ey ? ep : ey,
        eB = eu.NumberUtils.parsePositiveInteger(
          process.env.BASH_DEFAULT_TIMEOUT_MS,
        ),
        e_ = void 0 === eB ? ed : eB;
      function resolveBashTimeoutFromEnv(eA) {
        if (!eA) return { defaultTimeout: e_, maxTimeout: ew };
        let el =
          eu.NumberUtils.parsePositiveInteger(eA.BASH_MAX_TIMEOUT_MS) ?? ew;
        return {
          defaultTimeout:
            eu.NumberUtils.parsePositiveInteger(eA.BASH_DEFAULT_TIMEOUT_MS) ??
            e_,
          maxTimeout: el,
        };
      }
      let eI = eu.NumberUtils.parsePositiveInteger(
          process.env.BASH_MAX_OUTPUT_LENGTH,
        ),
        ev = void 0 === eI ? eg : Math.min(eI, eh),
        eS = Symbol("ShellService"),
        eQ = Symbol("LocalShellService");
    },
    3927(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { NumberUtils: () => NumberUtils }));
      let NumberUtils = class NumberUtils {
        static clamp(eA, el, ec) {
          if (!Number.isFinite(eA))
            throw Error("Value to clamp must be a finite number");
          if (!Number.isFinite(el) || !Number.isFinite(ec))
            throw Error("Clamp bounds must be finite numbers");
          if (el > ec)
            throw Error("Clamp minimum cannot be greater than maximum");
          return eA < el ? el : eA > ec ? ec : eA;
        }
        static parsePositiveInteger(eA) {
          if (null == eA) return;
          let el = "number" == typeof eA ? eA : Number(eA);
          if (Number.isFinite(el) && !(el <= 0)) return Math.floor(el);
        }
      };
    },
    70064(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { WindowsBashUtils: () => WindowsBashUtils }));
      var eu = ec(79896),
        ed = ec(16928),
        ep = ec(5516),
        eg = ec.n(ep);
      let WindowsBashUtils = class WindowsBashUtils {
        static verifyPathExists(eA) {
          try {
            return eu.existsSync(eA);
          } catch {
            return !1;
          }
        }
        static isWslBash(eA) {
          let el = eA.toLowerCase();
          return (
            el.includes("\\system32\\") ||
            el.includes("/system32/") ||
            el.includes("\\syswow64\\") ||
            el.includes("/syswow64/")
          );
        }
        static isGitBash(eA) {
          let el = eA.toLowerCase();
          return el.includes("\\git\\") || el.includes("/git/");
        }
        static findExecutableInPath(eA) {
          if ("git" === eA) {
            for (let eA of [
              "C:\\Program Files\\Git\\cmd\\git.exe",
              "C:\\Program Files (x86)\\Git\\cmd\\git.exe",
            ])
              if (this.verifyPathExists(eA)) return eA;
          }
          try {
            let el = eg().sync(eA, { all: !0, nothrow: !0 });
            if (!el || 0 === el.length) return;
            let ec = process.cwd().toLowerCase();
            for (let eu of el) {
              let el = ed.resolve(eu).toLowerCase();
              if (
                !(
                  ed.dirname(el).toLowerCase() === ec ||
                  el.startsWith(ec + ed.sep)
                ) &&
                !("bash" === eA && this.isWslBash(eu))
              )
                return eu;
            }
            return;
          } catch {
            return;
          }
        }
        static findBashPath() {
          if (void 0 !== this.cachedBashPath)
            return this.cachedBashPath ?? void 0;
          let eA = this.doFindBashPath();
          return ((this.cachedBashPath = eA ?? null), eA);
        }
        static doFindBashPath() {
          if (process.env.CODEBUDDY_CODE_GIT_BASH_PATH) {
            if (this.verifyPathExists(process.env.CODEBUDDY_CODE_GIT_BASH_PATH))
              return process.env.CODEBUDDY_CODE_GIT_BASH_PATH;
            (console.warn(
              `[WindowsBashUtils] CODEBUDDY_CODE_GIT_BASH_PATH path not found: "${process.env.CODEBUDDY_CODE_GIT_BASH_PATH}", falling back to system git bash detection`,
            ),
              delete process.env.CODEBUDDY_CODE_GIT_BASH_PATH);
          }
          let eA = this.findExecutableInPath("git");
          if (eA) {
            let el = ed.join(ed.dirname(eA), "..", "bin", "bash.exe");
            if (
              this.verifyPathExists(el) ||
              ((el = ed.join(ed.dirname(eA), "..", "usr", "bin", "bash.exe")),
              this.verifyPathExists(el))
            )
              return el;
          }
          let el = this.findExecutableInPath("bash");
          if (el && !this.isWslBash(el) && this.isGitBash(el)) return el;
        }
        static clearCache() {
          this.cachedBashPath = void 0;
        }
      };
      WindowsBashUtils.cachedBashPath = void 0;
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
      throw Error("Explicit SandboxShell module required: " + id);
    return value;
  }
  getModule.r = (o: any) => {
    Object.defineProperty(o, "__esModule", { value: true });
    Object.defineProperty(o, Symbol.toStringTag, { value: "Module" });
  };
  getModule.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      if (!Object.hasOwn(o, k))
        Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  getModule.n = (v: any) => (v && v.__esModule ? () => v.default : () => v);
  const r6 = getModule(80699),
    ad = getModule(74674),
    oK = getModule(6453),
    lx = getModule(62922),
    lN = getModule.n(getModule(38736)),
    lP = getModule(2752),
    lL = getModule(83044),
    lF = getModule(70543),
    nK = getModule.n(getModule(79896)),
    iT = getModule.n(getModule(16928)),
    lK = getModule.n(getModule(70857)),
    lJ = getModule(35568),
    lG = getModule(64187),
    l$ = getModule(93289),
    lz = getModule(48973);
  let AX;
  let lU = {
      CTRL_C: "ctrl+c",
      CTRL_D: "ctrl+d",
      CTRL_Z: "ctrl+z",
      UP: "up",
      DOWN: "down",
      LEFT: "left",
      RIGHT: "right",
      ENTER: "enter",
      TAB: "tab",
      ESCAPE: "escape",
      BACKSPACE: "backspace",
    },
    lj = {
      CTRL_A: "\x01",
      CTRL_B: "\x02",
      CTRL_E: "\x05",
      CTRL_F: "\x06",
      CTRL_G: "\x07",
      CTRL_H: "\b",
      CTRL_I: "	",
      CTRL_J: "\n",
      CTRL_K: "\v",
      CTRL_L: "\f",
      CTRL_M: "\r",
      CTRL_N: "\x0e",
      CTRL_O: "\x0f",
      CTRL_P: "\x10",
      CTRL_Q: "\x11",
      CTRL_R: "\x12",
      CTRL_S: "\x13",
      CTRL_T: "\x14",
      CTRL_U: "\x15",
      CTRL_V: "\x16",
      CTRL_W: "\x17",
      CTRL_X: "\x18",
      CTRL_Y: "\x19",
      DELETE: "\x1b[3~",
      HOME: "\x1b[H",
      END: "\x1b[F",
      PAGE_UP: "\x1b[5~",
      PAGE_DOWN: "\x1b[6~",
    };
  let SandboxPtyExecutionHandle = class SandboxPtyExecutionHandle {
    constructor(eA) {
      ((this._disposed = !1),
        (this._exited = !1),
        (this._interrupted = !1),
        (this._result = null),
        (this._usedAlternateBuffer = !1),
        (this._onData = new r6.Emitter()),
        (this._onExit = new r6.Emitter()),
        (this._onAlternateBuffer = new r6.Emitter()),
        (this.onData = this._onData.event),
        (this.onExit = this._onExit.event),
        (this.onAlternateBuffer = this._onAlternateBuffer.event),
        (this.stdoutBuf = new lL.TruncateBuffer()),
        (this.pendingStdoutTail = Buffer.alloc(0)),
        (this.renderTimeout = null),
        (this.timeoutTimer = null),
        (this._processId = eA.processId),
        (this._pid = eA.pid),
        (this.command = eA.command),
        (this._client = eA.client),
        (this._sessionId = eA.sessionId),
        (this._onOutput = eA.onOutput),
        (this._exitPromise = new Promise((eA) => {
          this._exitResolve = eA;
        })),
        (this.headlessTerminal = new lx.Terminal({
          allowProposedApi: !0,
          logLevel: "off",
          cols: eA.cols,
          rows: eA.rows,
        })),
        this.headlessTerminal.scrollToTop(),
        eA.abortSignal &&
          (eA.abortSignal.aborted
            ? ((this._interrupted = !0), this.kill())
            : eA.abortSignal.addEventListener(
                "abort",
                () => {
                  ((this._interrupted = !0), this.kill());
                },
                { once: !0 },
              )),
        eA.timeout &&
          eA.timeout > 0 &&
          (this.timeoutTimer = setTimeout(() => {
            ((this._interrupted = !0), this.kill());
          }, eA.timeout)));
    }
    get id() {
      return this._processId;
    }
    get pid() {
      return this._pid;
    }
    get isAlive() {
      return !this._exited && !this._disposed;
    }
    write(eA) {
      if (this._disposed || this._exited) return;
      let el = Buffer.from(eA, "utf-8").toString("base64"),
        ec = { processId: this._processId, data: el };
      this._sendCommand(ad.SANDBOX_COMMANDS.PROCESS_WRITE, ec);
    }
    sendKey(eA) {
      if (this._disposed || this._exited) return;
      let el = lU[eA];
      if (el) {
        let eA = { processId: this._processId, key: el };
        this._sendCommand(ad.SANDBOX_COMMANDS.PROCESS_SEND_KEY, eA);
        return;
      }
      let ec = lj[eA];
      ec && this.write(ec);
    }
    resize(eA, el) {
      if (this._disposed || this._exited) return;
      let ec = { processId: this._processId, cols: eA, rows: el };
      this._sendCommand(ad.SANDBOX_COMMANDS.PROCESS_RESIZE, ec);
      try {
        this.headlessTerminal.resize(eA, el);
      } catch {}
    }
    async kill(eA = "SIGTERM") {
      if (this._exited) return;
      let el = "SIGKILL" === eA ? "kill" : "term",
        ec = { processId: this._processId, signal: el };
      try {
        await this._client.sendRequest(
          this._sessionId,
          ad.SANDBOX_COMMANDS.PROCESS_KILL,
          ec,
        );
      } catch {}
    }
    getScreen() {
      let eA = this.headlessTerminal.buffer.active,
        el = [];
      for (let ec = 0; ec < this.headlessTerminal.rows; ec++) {
        let eu = eA.getLine(eA.viewportY + ec);
        el.push(eu ? eu.translateToString(!0) : "");
      }
      for (; el.length > 0 && "" === el[el.length - 1].trim(); ) el.pop();
      return lN()(el.join("\n"));
    }
    getColorScreen() {
      return (0, lP.serializeTerminalToObject)(this.headlessTerminal);
    }
    usedAlternateBuffer() {
      return this._usedAlternateBuffer;
    }
    wait() {
      return this._result ? Promise.resolve(this._result) : this._exitPromise;
    }
    dispose() {
      this._disposed ||
        ((this._disposed = !0),
        this.timeoutTimer &&
          (clearTimeout(this.timeoutTimer), (this.timeoutTimer = null)),
        this.renderTimeout &&
          (clearTimeout(this.renderTimeout), (this.renderTimeout = null)),
        this._exited || this.kill().catch(() => {}),
        this._onData.dispose(),
        this._onExit.dispose(),
        this._onAlternateBuffer.dispose(),
        this.headlessTerminal.dispose());
    }
    handleOutput(eA) {
      if (this._disposed) return "";
      let el = Buffer.from(eA, "base64");
      if (0 === el.length) return "";
      this.pendingStdoutTail.length > 0 &&
        (el = Buffer.concat([this.pendingStdoutTail, el]));
      let { ready: ec, pending: eu } = (0, oK.splitPendingUtf8Tail)(el);
      if (((this.pendingStdoutTail = eu), 0 === ec.length)) return "";
      let ed = (0, oK.decodeBuffer)(ec);
      if (0 === ed.length) return "";
      !this._usedAlternateBuffer &&
        (ed.includes("\x1b[?1049h") || ed.includes("\x1b[?47h")) &&
        ((this._usedAlternateBuffer = !0), this._onAlternateBuffer.fire());
      let ep = lN()((0, lF.stripOscSequences)(ed));
      return (
        this.stdoutBuf.push(ep),
        this._onData.fire(ep),
        this._onOutput &&
          ep &&
          this._onOutput({ type: "stdout", data: ep, timestamp: Date.now() }),
        this.headlessTerminal.write(ed, () => {
          this.render();
        }),
        ep
      );
    }
    handleExit(eA, el, ec, eu) {
      if (!this._exited) {
        if (((this._exited = !0), this.pendingStdoutTail.length > 0)) {
          let eA = this.pendingStdoutTail;
          this.pendingStdoutTail = Buffer.alloc(0);
          let el = (0, oK.decodeBuffer)(eA);
          if (el) {
            let eA = lN()((0, lF.stripOscSequences)(el));
            (this.stdoutBuf.push(eA),
              this._onData.fire(eA),
              this._onOutput &&
                eA &&
                this._onOutput({
                  type: "stdout",
                  data: eA,
                  timestamp: Date.now(),
                }),
              this.headlessTerminal.write(el));
          }
        }
        (this.timeoutTimer &&
          (clearTimeout(this.timeoutTimer), (this.timeoutTimer = null)),
          this.render(!0),
          (this._result = {
            stdout: this.stdoutBuf.toString(!0),
            stderr: "",
            exitCode: eA,
            signal: null,
            interrupted: this._interrupted,
            fileBlockRecords: ec,
            networkBlockRecords: mapNetworkBlockRecords(eu),
          }),
          this._onExit.fire(this._result),
          this._exitResolve(this._result));
      }
    }
    _sendCommand(eA, el) {
      this._client.sendRequest(this._sessionId, eA, el).catch(() => {});
    }
    render(eA = !1) {
      if (eA) {
        this.renderTimeout &&
          (clearTimeout(this.renderTimeout), (this.renderTimeout = null));
        return;
      }
      this.renderTimeout ||
        (this.renderTimeout = setTimeout(() => {
          this.renderTimeout = null;
        }, 68));
    }
  };
  let SandboxPipeExecutionHandle = class SandboxPipeExecutionHandle {
    constructor(eA) {
      ((this._disposed = !1),
        (this._exited = !1),
        (this._interrupted = !1),
        (this._result = null),
        (this._onData = new r6.Emitter()),
        (this._onExit = new r6.Emitter()),
        (this._onAlternateBuffer = new r6.Emitter()),
        (this.onData = this._onData.event),
        (this.onExit = this._onExit.event),
        (this.onAlternateBuffer = this._onAlternateBuffer.event),
        (this.stdoutBuf = new lL.TruncateBuffer()),
        (this.stderrBuf = new lL.TruncateBuffer()),
        (this.pendingStdoutTail = Buffer.alloc(0)),
        (this.pendingStderrTail = Buffer.alloc(0)),
        (this.timeoutTimer = null),
        (this._processId = eA.processId),
        (this._pid = eA.pid),
        (this.command = eA.command),
        (this._client = eA.client),
        (this._sessionId = eA.sessionId),
        (this._logger = eA.logger),
        (this._onOutput = eA.onOutput),
        (this._exitPromise = new Promise((eA) => {
          this._exitResolve = eA;
        })),
        eA.abortSignal &&
          (eA.abortSignal.aborted
            ? ((this._interrupted = !0), this.kill())
            : eA.abortSignal.addEventListener(
                "abort",
                () => {
                  ((this._interrupted = !0), this.kill());
                },
                { once: !0 },
              )),
        eA.timeout &&
          eA.timeout > 0 &&
          (this.timeoutTimer = setTimeout(() => {
            ((this._interrupted = !0), this.kill());
          }, eA.timeout)));
    }
    get id() {
      return this._processId;
    }
    get pid() {
      return this._pid;
    }
    get isAlive() {
      return !this._exited && !this._disposed;
    }
    write(eA) {
      if (this._disposed || this._exited) return;
      let el = Buffer.from(eA, "utf-8").toString("base64"),
        ec = { processId: this._processId, data: el };
      this._sendCommand(ad.SANDBOX_COMMANDS.PROCESS_WRITE, ec);
    }
    sendKey(eA) {
      if (this._disposed || this._exited) return;
      let el = lj[eA] ?? lU[eA];
      el && this.write(el);
    }
    resize(eA, el) {}
    async kill(eA = "SIGTERM") {
      if (this._exited) return;
      let el = "SIGKILL" === eA ? "kill" : "term",
        ec = { processId: this._processId, signal: el };
      try {
        await this._client.sendRequest(
          this._sessionId,
          ad.SANDBOX_COMMANDS.PROCESS_KILL,
          ec,
        );
      } catch {}
    }
    getScreen() {
      return this.stdoutBuf.toString(!0);
    }
    getColorScreen() {
      return this.stdoutBuf
        .toString(!0)
        .split("\n")
        .map((eA) => [
          {
            text: eA,
            bold: !1,
            italic: !1,
            underline: !1,
            dim: !1,
            inverse: !1,
            fg: "",
            bg: "",
          },
        ]);
    }
    usedAlternateBuffer() {
      return !1;
    }
    wait() {
      return this._result ? Promise.resolve(this._result) : this._exitPromise;
    }
    dispose() {
      this._disposed ||
        ((this._disposed = !0),
        this.timeoutTimer &&
          (clearTimeout(this.timeoutTimer), (this.timeoutTimer = null)),
        this._exited || this.kill().catch(() => {}),
        this._onData.dispose(),
        this._onExit.dispose(),
        this._onAlternateBuffer.dispose());
    }
    handleOutput(eA, el) {
      if (this._disposed) return "";
      let ec = Buffer.from(eA, "base64");
      if (0 === ec.length) return "";
      let eu =
        "stdout" === el ? this.pendingStdoutTail : this.pendingStderrTail;
      eu.length > 0 && (ec = Buffer.concat([eu, ec]));
      let { ready: ed, pending: ep } = (0, oK.splitPendingUtf8Tail)(ec);
      if (
        ("stdout" === el
          ? (this.pendingStdoutTail = ep)
          : (this.pendingStderrTail = ep),
        0 === ed.length)
      )
        return "";
      let eg = (0, oK.decodeBuffer)(ed);
      if (0 === eg.length) return "";
      let eh = lN()(eg);
      return (
        "stdout" === el ? this.stdoutBuf.push(eh) : this.stderrBuf.push(eh),
        this._onData.fire(eh),
        this._onOutput &&
          eh &&
          this._onOutput({ type: el, data: eh, timestamp: Date.now() }),
        eh
      );
    }
    handleExit(eA, el, ec, eu) {
      if (this._exited) return;
      for (let eA of ((this._exited = !0), ["stdout", "stderr"])) {
        let el =
          "stdout" === eA ? this.pendingStdoutTail : this.pendingStderrTail;
        if (0 === el.length) continue;
        "stdout" === eA
          ? (this.pendingStdoutTail = Buffer.alloc(0))
          : (this.pendingStderrTail = Buffer.alloc(0));
        let ec = (0, oK.decodeBuffer)(el);
        if (!ec) continue;
        let eu = lN()(ec);
        ("stdout" === eA ? this.stdoutBuf.push(eu) : this.stderrBuf.push(eu),
          this._onData.fire(eu),
          this._onOutput &&
            eu &&
            this._onOutput({ type: eA, data: eu, timestamp: Date.now() }));
      }
      (this.timeoutTimer &&
        (clearTimeout(this.timeoutTimer), (this.timeoutTimer = null)),
        (this._result = {
          stdout: this.stdoutBuf.toString(!0),
          stderr: this.stderrBuf.toString(!0),
          exitCode: eA,
          signal: null,
          interrupted: this._interrupted,
          fileBlockRecords: ec,
          networkBlockRecords: mapNetworkBlockRecords(eu),
        }));
      let ed = this._result.stdout.slice(0, 256),
        ep = this._result.stderr.slice(0, 256);
      (this._logger.info?.(
        `[SandboxPipeHandle] processExit | processId=${this._processId} | exitCode=${eA} | killed=${el ?? !1} | stdout(${this._result.stdout.length})="${ed}" | stderr(${this._result.stderr.length})="${ep}"`,
      ),
        this._onExit.fire(this._result),
        this._exitResolve(this._result));
    }
    _sendCommand(eA, el) {
      this._client.sendRequest(this._sessionId, eA, el).catch(() => {});
    }
  };
  function toShellNetworkBlockRecord(eA) {
    return {
      host: eA.host,
      port: eA.port,
      protocol: eA.scheme,
      actionMask: eA.actionMask,
    };
  }
  function mapNetworkBlockRecords(eA) {
    if (Array.isArray(eA)) return eA.map(toShellNetworkBlockRecord);
  }
  let lW = "codebuddy-shell-payload-",
    lV = 864e5,
    lZ =
      '__codebuddy_payload=$1; shift; __codebuddy_script=$(<"$__codebuddy_payload") || exit 125; unset __codebuddy_payload; eval "$__codebuddy_script"',
    lX = !1;
  function sweepStaleWindowsBashPayloads() {
    if (!lX) {
      lX = !0;
      try {
        let eA = Date.now() - lV;
        for (let el of nK().readdirSync(lK().tmpdir(), { withFileTypes: !0 })) {
          if (!el.isDirectory() || !el.name.startsWith(lW)) continue;
          let ec = iT().join(lK().tmpdir(), el.name);
          nK().statSync(ec).mtimeMs < eA &&
            nK().rmSync(ec, { recursive: !0, force: !0 });
        }
      } catch {}
    }
  }
  function stageWindowsBashScript(eA, el, ec) {
    sweepStaleWindowsBashPayloads();
    let eu = nK().mkdtempSync(iT().join(lK().tmpdir(), `${lW}${process.pid}-`)),
      ed = iT().join(eu, "script.sh");
    try {
      nK().writeFileSync(ed, ec, { encoding: "utf8", flag: "wx", mode: 384 });
    } catch (eA) {
      try {
        nK().rmSync(eu, { recursive: !0, force: !0 });
      } catch {}
      throw eA;
    }
    let ep = !1;
    return {
      args: [...eA, lZ, el, (0, oK.windowsPathToUnix)(ed)],
      cleanup: () => {
        ep || (nK().rmSync(eu, { recursive: !0, force: !0 }), (ep = !0));
      },
    };
  }
  let l0 = (AX = class {
    constructor() {
      ((this.activeHandles = new Set()),
        (this.processHandles = new Map()),
        (this.stagedScriptCleanups = new Set()),
        (this._reverseHandlerRegistered = !1));
    }
    init() {
      this.lifecycle.onSessionReady(async () => {
        this._registerReverseHandlers();
      });
    }
    _registerReverseHandlers() {
      if (this._reverseHandlerRegistered) return;
      let eA = this.lifecycle.getClient();
      (eA.addReverseListener(
        {
          commands: [
            ad.SANDBOX_COMMANDS.PROCESS_OUTPUT,
            ad.SANDBOX_COMMANDS.PROCESS_EXIT,
            ad.SANDBOX_COMMANDS.REPORT_EVENT,
          ],
        },
        (eA) => this._handleReverseRequest(eA),
      ),
        eA.onDisconnect(() =>
          this._failAllProcessHandles("sandbox-cli connection lost"),
        ),
        (this._reverseHandlerRegistered = !0),
        this.logger.info?.(
          "[SandboxShell] reverse handler registered via sessionReady callback",
        ));
    }
    formatCommand(eA, el, ec) {
      if (((eA = eA.trim()), "powershell" === el)) return eA;
      let eu = [];
      if (ec)
        for (let [eA, el] of Object.entries(ec)) {
          let ec = el.replace(/'/g, "'\\''");
          eu.push(`export ${eA}='${ec}'`);
        }
      let ed = (0, lJ.buildSafeDeletePosixBootstrap)(el);
      ed && eu.push(ed);
      let ep = process.env.WORKBUDDY_EXTRA_PATHS;
      if (ep) {
        let eA = "win32" === process.platform ? ";" : ":",
          el = ep
            .split(eA)
            .filter(Boolean)
            .map((eA) => (0, oK.escapePathForShell)(eA));
        el.length > 0 && eu.push(`export PATH=${el.join(":")}:"$PATH"`);
      }
      let eg = process.env.CODEBUDDY_ENV_FILE;
      if (eg)
        try {
          if (nK().existsSync(eg)) {
            let eA = nK().readFileSync(eg, "utf8").trim();
            eA && eu.push(eA);
          }
        } catch (eA) {
          this.logger.info?.(
            `[SandboxShell] Failed to read ENV_FILE ${eg}: ${eA}`,
          );
        }
      (0, oK.isWindows)() &&
        (eA = eA.replace(
          /"([A-Za-z]:\\[^"]*)"|([A-Za-z]:\\[^\s'`]*)/g,
          (eA, el, ec) =>
            void 0 !== el
              ? `"${el.replace(/\\/g, "/")}"`
              : ec.replace(/\\/g, "/"),
        ));
      let eh = (0, lJ.buildSafeDeletePosixBootstrap)(el);
      eh && eu.push(eh);
      let ef = eA.replace(/'/g, "'\\''");
      eu.push(`eval '${ef}'`);
      let em = eu.join(" && "),
        eE = process.env.CODEBUDDY_CODE_SHELL_PREFIX;
      if (eE) {
        let eA = em.replace(/'/g, "'\\''");
        em = `${eE} '${eA}'`;
      }
      return em;
    }
    buildSandboxCommand(
      eA,
      el = {
        enabled: !0,
        bulkThreshold: lJ.DEFAULT_SAFE_DELETE_BULK_THRESHOLD,
      },
    ) {
      let ec,
        eu,
        {
          executable: ed,
          argsPrefix: ep,
          shell: eg,
        } = (0, oK.getShellConfiguration)(),
        eh = this._withDefaultSandboxEnv(eA.env, el, eA.toolCallId);
      if ("bash" === eg)
        for (let eA of ((ec = {}),
        [
          "NODE_OPTIONS",
          "PYTHONPATH",
          "PYTHONDONTWRITEBYTECODE",
          "PYTHONIOENCODING",
          "PYTHONUTF8",
          "GENIE_TRASH_DIR",
          "CODEBUDDY_SESSION_ID",
          "CODEBUDDY_TOOL_CALL_ID",
          "CODEBUDDY_CONVERSATION_REQUEST_ID",
          "CODEBUDDY_MCP_CONFIG",
          "CODEBUDDY_SAFE_DELETE_SANDBOX",
          "CODEBUDDY_SAFE_DELETE_BIN_DIR",
          "CODEBUDDY_SAFE_DELETE_BULK_GUARD",
          "CODEBUDDY_SAFE_DELETE_BULK_STATE_DIR",
          "CODEBUDDY_SAFE_DELETE_BULK_THRESHOLD",
          "CODEBUDDY_NODE_BIN",
          lJ.SAFE_DELETE_REPORT_ENV,
          "BASH_ENV",
          "TEMP",
          "TMP",
          "TMPDIR",
        ]))
          eh[eA] && (ec[eA] = eh[eA]);
      let ef = this.formatCommand(eA.command, eg, ec),
        em = (0, oK.ensureShoptDisabled)(ef, eg),
        eE =
          "win32" === process.platform && "bash" === eg
            ? stageWindowsBashScript(ep, ed, em)
            : { args: [...ep, em], cleanup: void 0 },
        { args: eC } = eE;
      return (
        (0, oK.isWindows)() && "bash" === eg && (eu = iT().dirname(ed)),
        this.logger.info?.(
          `[SandboxShell] buildSandboxCommand | original="${eA.command?.slice(0, 100)}" | executable=${ed} | argc=${eC.length} | pathOverride=${eu ?? "none"}`,
        ),
        {
          executable: ed,
          args: eC,
          displayCommand: eA.command,
          pathOverride: eu,
          env: eh,
          cleanup: eE.cleanup,
        }
      );
    }
    _trackStagedScriptCleanup(eA) {
      if (!eA) return;
      let el = !1,
        release = () => {
          if (!el)
            try {
              (eA(), (el = !0), this.stagedScriptCleanups.delete(release));
            } catch (eA) {
              this.logger.info?.(
                `[SandboxShell] staged script cleanup failed: ${eA}`,
              );
            }
        };
      return (this.stagedScriptCleanups.add(release), release);
    }
    _bindStagedScriptCleanup(eA, el, ec) {
      if (!el) return;
      eA.onExit(el);
      let eu = eA.kill.bind(eA);
      ((eA.kill = async (eA) => {
        try {
          await eu(eA);
        } finally {
          el();
        }
      }),
        ec?.aborted && el());
    }
    _withDefaultSandboxEnv(
      eA,
      el = {
        enabled: !0,
        bulkThreshold: lJ.DEFAULT_SAFE_DELETE_BULK_THRESHOLD,
      },
      ec,
    ) {
      let eu = this.sessionManager.sessionSubject.value,
        ed = (0, lJ.buildSafeDeleteEnv)(eA, {
          enabled: el.enabled,
          sessionId: eu?.id,
          conversationRequestId: eu?.conversationRequestId,
          toolCallId: ec,
          bulkThreshold: el.bulkThreshold,
        }),
        ep = {
          PYTHONDONTWRITEBYTECODE: "1",
          PYTHONIOENCODING: "utf-8",
          PYTHONUTF8: "1",
          NO_UPDATE_NOTIFIER: "1",
          AGENT_BROWSER_ARGS: "--no-sandbox",
          PLAYWRIGHT_MCP_NO_SANDBOX: "1",
          BROWSER_USE_CHROMIUM_SANDBOX: "false",
          IN_DOCKER: "1",
        };
      if (
        (el.enabled && (ep.CODEBUDDY_SAFE_DELETE_SANDBOX = "1"),
        (0, oK.isWindows)())
      ) {
        let eA = lK().tmpdir();
        ((ep.TEMP = eA), (ep.TMP = eA), (ep.TMPDIR = eA));
      }
      let eg = { ...ed, ...ep };
      return (
        (0, lJ.logSafeDeleteInjection)(
          this.logger,
          "sandbox-default-env",
          eg,
          el.enabled,
        ),
        eg
      );
    }
    async execute(eA) {
      try {
        let el = await this.bashSandboxManager.getConfig();
        if (el?.excludedCommands?.length) {
          let ec = this._getCommandRoot(eA.command);
          if (ec && el.excludedCommands.includes(ec))
            return (
              this.logger.info?.(
                `[SandboxShell] Command excluded from sandbox: ${ec}, falling back to local`,
              ),
              this.localShellService.execute(eA)
            );
        }
      } catch (eA) {
        this.logger.info?.(
          `[SandboxShell] Failed to check excluded commands: ${eA.message}`,
        );
      }
      let el = Date.now(),
        ec = this.workspace.workspaceFolders?.[0]?.uri?.fsPath || process.cwd(),
        eu = iT().resolve(ec, eA.cwd || "");
      if (
        (this.logger.info?.(
          `[SandboxShell] execute | cmd="${eA.command?.slice(0, 200)}" | cwd="${eu}" | timeout=${eA.timeout ?? "none"}`,
        ),
        !this.isValidDirectory(eu))
      )
        throw (
          this.logger.info?.(`[SandboxShell] invalid cwd: ${eu}`),
          Error(`Working directory does not exist or is not accessible: ${eu}`)
        );
      try {
        (await this.lifecycle.waitReady(), await this.lifecycle.ensureAlive());
      } catch (el) {
        return (
          this.logger.warn?.(
            `[SandboxShell] sandbox not ready, falling back to local execution: ${el?.message ?? el}`,
          ),
          this.localShellService.execute(eA)
        );
      }
      let ed = this.lifecycle.getOpenedSessionId();
      if (!ed)
        return (
          this.logger.warn?.(
            "[SandboxShell] no opened sandbox session, falling back to local execution",
          ),
          this.localShellService.execute(eA)
        );
      let ep = await (0, lJ.resolveSafeDeleteRuntimeConfig)(
        this.settingsManager,
        this.logger,
        "SandboxShell",
      );
      return await this._createHandle(eA, eu, ed, el, ep);
    }
    async _createHandle(eA, el, ec, eu, ed) {
      let ep,
        eg = eA.usePty ?? !1;
      try {
        ep = eg
          ? await this.createPtyHandle(eA, el, ec, ed)
          : await this.createPipeHandle(eA, el, ec, ed);
      } catch (ec) {
        let eA = ec?.message ?? String(ec),
          el = eA.match(/SandboxError\(0x([0-9a-fA-F]+)\)/);
        if (el) {
          let ec =
            5 === parseInt(el[1], 16)
              ? "executable not found in sandbox PATH, not a permission issue"
              : `sandbox creation failed (code 0x${el[1]})`;
          throw Error(`[SandboxError] ${ec}. Original: ${eA}`);
        }
        throw ec;
      }
      (this.logger.info?.(
        `[SandboxShell] execute OK | pid=${ep.pid} | mode=Pipe | elapsed=${Date.now() - eu}ms`,
      ),
        this.activeHandles.add(ep),
        ep.onExit(() => {
          this.activeHandles.delete(ep);
        }));
      let eh = ep.wait.bind(ep),
        ef = this;
      return (
        (ep.wait = async function () {
          let eA = await eh();
          return (
            ef._enrichResult(eA),
            (0, lJ.attachSafeDeleteReportEvents)(
              eA,
              ep.safeDeleteReportPath,
              ef.logger,
            )
          );
        }),
        ep
      );
    }
    async createPtyHandle(eA, el, ec, eu) {
      let ed,
        ep = eA.cols || process.stdout.columns || 80,
        eg = eA.rows || process.stdout.rows || 30,
        eh = eA.rawCommand
          ? (() => {
              let el = (0, oK.parseCommandLine)(eA.command);
              return this._needsSafeDeleteShellWrap(el.exe)
                ? (this.logger.info?.(
                    `[SandboxShell] safe-delete wrap (pty) | exe=${el.exe} → routing through bash shell`,
                  ),
                  this.buildSandboxCommand(eA, eu))
                : {
                    executable: el.exe,
                    args: el.args,
                    displayCommand: eA.command,
                    pathOverride: void 0,
                    env: this._withDefaultSandboxEnv(eA.env, eu, eA.toolCallId),
                  };
            })()
          : this.buildSandboxCommand(eA, eu),
        {
          executable: ef,
          args: em,
          displayCommand: eE,
          pathOverride: eC,
          env: ey,
        } = eh,
        ew = this._trackStagedScriptCleanup(
          "cleanup" in eh ? eh.cleanup : void 0,
        ),
        eB = ey?.[lJ.SAFE_DELETE_REPORT_ENV],
        e_ = {
          executable: ef,
          args: em,
          displayCommand: eE,
          cwdDir: el,
          timeoutMs: eA.timeout,
          executionMode: "sandbox",
          env: ey,
          stdoutMode: "pty",
          stdinMode: "pipe",
          cols: ep,
          rows: eg,
          pathOverride: eC,
        },
        eI = this.lifecycle.getClient();
      try {
        ed = await eI.sendRequest(ec, ad.SANDBOX_COMMANDS.RUN_EXECUTABLE, e_);
      } catch (eA) {
        throw (ew?.(), eA);
      }
      if (
        (this.logger.info?.(
          `[SandboxShell] RunExecutable pty response | processId=${ed?.processId} | pid=${ed?.pid}`,
        ),
        !ed?.processId)
      ) {
        let eA = JSON.stringify(ed ?? null).slice(0, 500);
        throw (
          ew?.(),
          Error(
            `[SandboxError] sandbox-cli returned invalid PTY response. Raw: ${eA}`,
          )
        );
      }
      let ev = new SandboxPtyExecutionHandle({
        processId: ed.processId,
        pid: ed.pid,
        command: eA.command,
        client: eI,
        sessionId: ec,
        cols: ep,
        rows: eg,
        onOutput: eA.onOutput,
        logger: this.logger,
        abortSignal: eA.abortSignal,
        timeout: eA.timeout,
      });
      return (
        (ev.safeDeleteReportPath = eB),
        this.processHandles.set(ed.processId, ev),
        this._bindStagedScriptCleanup(ev, ew, eA.abortSignal),
        ev.onExit(() => {
          this.processHandles.delete(ed.processId);
        }),
        ev
      );
    }
    _needsSafeDeleteShellWrap(eA) {
      return !!(0, oK.isWindows)() && !!eA && AX.SAFE_DELETE_COMMANDS.has(eA);
    }
    async createPipeHandle(eA, el, ec, eu) {
      let ed, ep;
      if (eA.rawCommand) {
        let el = (0, oK.parseCommandLine)(eA.command);
        this._needsSafeDeleteShellWrap(el.exe)
          ? (this.logger.info?.(
              `[SandboxShell] safe-delete wrap | exe=${el.exe} → routing through bash shell`,
            ),
            (ed = this.buildSandboxCommand(eA, eu)))
          : (ed = {
              executable: el.exe,
              args: el.args,
              displayCommand: eA.command,
              pathOverride: void 0,
              env: this._withDefaultSandboxEnv(eA.env, eu, eA.toolCallId),
            });
      } else ed = this.buildSandboxCommand(eA, eu);
      let {
          executable: eg,
          args: eh,
          displayCommand: ef,
          pathOverride: em,
          env: eE,
        } = ed,
        eC = this._trackStagedScriptCleanup(ed.cleanup),
        ey = eE?.[lJ.SAFE_DELETE_REPORT_ENV],
        ew = {
          executable: eg,
          args: eh,
          displayCommand: ef,
          cwdDir: el,
          timeoutMs: eA.timeout,
          executionMode: "sandbox",
          env: eE,
          stdoutMode: "pipe",
          stdinMode: "pipe",
          pathOverride: em,
        };
      this.logger.info?.(
        `[SandboxShell] RunExecutable request | mode=pipe | executionMode=${ew.executionMode} | cwd=${el} | executable=${eg} | argc=${eh.length} | timeoutMs=${ew.timeoutMs}`,
      );
      let eB = this.lifecycle.getClient();
      try {
        ep = await eB.sendRequest(ec, ad.SANDBOX_COMMANDS.RUN_EXECUTABLE, ew);
      } catch (eA) {
        throw (eC?.(), eA);
      }
      if (
        (this.logger.info?.(
          `[SandboxShell] RunExecutable response | raw=${JSON.stringify(ep ?? null).slice(0, 500)}`,
        ),
        ep && !ep.processId && void 0 !== ep.exitCode)
      ) {
        this.logger.info?.(
          `[SandboxShell] sync response detected | exitCode=${ep.exitCode} | output=${(ep.output ?? "").slice(0, 200)}`,
        );
        let el = new SandboxPipeExecutionHandle({
          processId: `sync-${Date.now()}`,
          pid: 0,
          command: eA.command,
          client: eB,
          sessionId: ec,
          onOutput: eA.onOutput,
          logger: this.logger,
          abortSignal: eA.abortSignal,
        });
        ((el.safeDeleteReportPath = ey),
          this._bindStagedScriptCleanup(el, eC, eA.abortSignal));
        let eu = ep.output ?? ep.stdout ?? "",
          ed = ep.stderr ?? "";
        return (
          eu &&
            el.handleOutput(
              Buffer.from(eu, "utf-8").toString("base64"),
              "stdout",
            ),
          ed &&
            el.handleOutput(
              Buffer.from(ed, "utf-8").toString("base64"),
              "stderr",
            ),
          el.handleExit(
            ep.exitCode ?? 0,
            void 0,
            ep.fileBlockRecords,
            ep.networkBlockRecords,
          ),
          el
        );
      }
      if (!ep?.processId) {
        let eA = JSON.stringify(ep ?? null).slice(0, 500);
        throw (
          this.logger.info?.(
            `[SandboxShell] RunExecutable returned unexpected response (no processId, not sync) | raw=${eA}`,
          ),
          eC?.(),
          Error(
            `[SandboxError] sandbox-cli returned invalid response. Raw: ${eA}`,
          )
        );
      }
      this.logger.info?.(
        `[SandboxShell] pipe-mode response | processId=${ep.processId} | pid=${ep.pid}`,
      );
      let e_ = new SandboxPipeExecutionHandle({
        processId: ep.processId,
        pid: ep.pid,
        command: eA.command,
        client: eB,
        sessionId: ec,
        onOutput: eA.onOutput,
        logger: this.logger,
        abortSignal: eA.abortSignal,
        timeout: eA.timeout,
      });
      return (
        (e_.safeDeleteReportPath = ey),
        this.processHandles.set(ep.processId, e_),
        this._bindStagedScriptCleanup(e_, eC, eA.abortSignal),
        e_.onExit(() => {
          this.processHandles.delete(ep.processId);
        }),
        e_
      );
    }
    sendRuleCommand(eA, el, ec, eu) {
      return eA.sendRequest(el, ec, eu);
    }
    async applyRulesDelta(eA) {
      let el = this.lifecycle.getClient();
      if (!el.isConnected())
        return void this.logger.info?.(
          "[SandboxShell] applyRulesDelta: sandbox not connected, skipping",
        );
      let ec = this.lifecycle.getOpenedSessionId();
      if (!ec)
        return void this.logger.info?.(
          "[SandboxShell] applyRulesDelta: no opened session, skipping",
        );
      if (this.isFullAccessRelaxedRules())
        return void this.logger.info?.(
          `[SandboxShell] applyRulesDelta skipped for fullAccess-relaxed | sessionId=${ec} | networkAdded=${eA.network?.added?.length ?? 0} | networkRemoved=${eA.network?.removed?.length ?? 0} | fileAdded=${eA.file?.added?.length ?? 0} | fileRemoved=${eA.file?.removed?.length ?? 0}`,
        );
      let eu = [],
        ed = [];
      for (let el of eA.network?.added ?? [])
        for (let eA of (0, lG.expandDomainWithWildcard)(el.endpoint))
          ed.push({ endpoint: eA, type: el.type, source: "global" });
      ed.length > 0 &&
        (await this.sendRuleCommand(
          el,
          ec,
          ad.SANDBOX_COMMANDS.ADD_NETWORK_RULE,
          { rules: ed },
        ).catch((eA) => eu.push(Error(`ADD_NETWORK_RULE: ${eA.message}`))));
      let ep = [];
      for (let el of eA.network?.removed ?? [])
        ep.push(...(0, lG.expandDomainWithWildcard)(el.endpoint));
      ep.length > 0 &&
        (await this.sendRuleCommand(
          el,
          ec,
          ad.SANDBOX_COMMANDS.REMOVE_NETWORK_RULE,
          { endpoints: ep },
        ).catch((eA) => eu.push(Error(`REMOVE_NETWORK_RULE: ${eA.message}`))));
      let eg = [];
      for (let el of eA.file?.added ?? []) {
        let eA =
            this.sandboxRuleSyncService?.expandSecurityCenterPath(el.path) ??
            el.path,
          ec = this.isValidDirectory(eA);
        eg.push({
          path: eA,
          type: el.type,
          source: "global",
          ...(ec ? { isDirectory: !0 } : {}),
        });
      }
      eg.length > 0 &&
        (await this.sendRuleCommand(el, ec, ad.SANDBOX_COMMANDS.ADD_FILE_RULE, {
          rules: eg,
        }).catch((eA) => eu.push(Error(`ADD_FILE_RULE: ${eA.message}`))));
      let eh = [];
      for (let el of eA.file?.removed ?? [])
        eh.push(
          this.sandboxRuleSyncService?.expandSecurityCenterPath(el.path) ??
            el.path,
        );
      if (
        (eh.length > 0 &&
          (await this.sendRuleCommand(
            el,
            ec,
            ad.SANDBOX_COMMANDS.REMOVE_FILE_RULE,
            { paths: eh },
          ).catch((eA) => eu.push(Error(`REMOVE_FILE_RULE: ${eA.message}`)))),
        eu.length > 0)
      )
        throw new ad.SandboxRulesApplyError(eu);
      this.logger.info?.(
        "[SandboxShell] applyRulesDelta: rules synced to sandbox",
      );
    }
    isFullAccessRelaxedRules() {
      return (
        this.turnConfig?.ruleProfile === "fullAccess-relaxed" ||
        this.turnConfig?.permissionMode === "fullAccess"
      );
    }
    async disposeAll() {
      let eA = Array.from(this.activeHandles);
      for (let el of (this.activeHandles.clear(),
      await Promise.allSettled(
        eA.map(async (eA) => {
          try {
            await eA.kill("SIGTERM");
          } catch {}
          try {
            eA.dispose();
          } catch {}
        }),
      ),
      this.processHandles.clear(),
      Array.from(this.stagedScriptCleanups)))
        el();
    }
    getActiveHandleCount() {
      return this.activeHandles.size;
    }
    isValidDirectory(eA) {
      try {
        return nK().statSync(eA).isDirectory();
      } catch {
        return !1;
      }
    }
    getNetworkBlockTarget(eA) {
      return "number" == typeof eA.port ? `${eA.host}:${eA.port}` : eA.host;
    }
    _failAllProcessHandles(eA) {
      if (0 === this.processHandles.size) return;
      let el = Array.from(this.processHandles.entries());
      for (let [ec, eu] of (this.processHandles.clear(),
      this.logger.info?.(
        `[SandboxShell] Force-exiting ${el.length} pending handle(s) due to: ${eA}`,
      ),
      el))
        try {
          (this.logger.info?.(
            `[SandboxShell] forcing exit | processId=${ec} | reason=${eA}`,
          ),
            eu.handleExit(-1, !0, [], []));
        } catch (eA) {
          this.logger.info?.(
            `[SandboxShell] force-exit failed | processId=${ec} | error=${eA?.message ?? eA}`,
          );
        }
    }
    async _handleReverseRequest(eA) {
      let el = eA.data;
      switch (eA.command) {
        case ad.SANDBOX_COMMANDS.PROCESS_OUTPUT: {
          let eA = el,
            ec = this.processHandles.get(eA?.processId);
          if (ec) {
            let el,
              eu =
                (el =
                  ec instanceof SandboxPipeExecutionHandle
                    ? ec.handleOutput(eA.data, eA.stream ?? "stdout")
                    : ec.handleOutput(eA.data)).length > 200
                  ? el.slice(0, 200)
                  : el;
            this.logger.info?.(
              `[SandboxShell] ProcessOutput | processId=${eA.processId} | stream=${eA.stream ?? "pty"} | dataLen=${eA.data?.length ?? 0} | content=${eu}`,
            );
          } else
            this.logger.info?.(
              `[SandboxShell] ProcessOutput for unknown processId: ${eA?.processId}`,
            );
          return;
        }
        case ad.SANDBOX_COMMANDS.PROCESS_EXIT: {
          let eA = el,
            ec = this.processHandles.get(eA?.processId);
          if (ec) {
            let el = eA.fileBlockRecords?.length ?? 0,
              eu = eA.networkBlockRecords?.length ?? 0;
            for (let ec of (this.logger.info?.(
              `[SandboxShell] ProcessExit | processId=${eA.processId} | exitCode=${eA.exitCode} | killed=${eA.killed ?? !1} | fileBlockRecords=${el} | networkBlockRecords=${eu}`,
            ),
            eA.networkBlockRecords ?? []))
              (0, lz.appendSandboxBlockAuditLog)({
                blockType: "network",
                target: this.getNetworkBlockTarget(ec),
              });
            ec.handleExit(
              eA.exitCode,
              eA.killed,
              eA.fileBlockRecords,
              eA.networkBlockRecords,
            );
          } else
            this.logger.info?.(
              `[SandboxShell] ProcessExit for unknown processId: ${eA?.processId}`,
            );
          return;
        }
        case ad.SANDBOX_COMMANDS.REPORT_EVENT:
          this.telemetryReporter?.ingestRawEvent(el);
          return;
        default:
          this.logger.info?.(
            `[SandboxShell] Unhandled reverse request: ${eA.command}`,
          );
          return;
      }
    }
    _getCommandRoot(eA) {
      try {
        if (!eA || "string" != typeof eA) return;
        for (let el of (0, l$.parse)(eA.trim()))
          if (
            !("string" == typeof el && /^[A-Za-z_]\w*=/.test(el)) &&
            "string" == typeof el
          )
            return el.split(/[/\\]/).pop();
        return;
      } catch {
        return;
      }
    }
    _parseFileBlockRecords(eA) {
      return eA && Array.isArray(eA)
        ? eA
            .filter((eA) => {
              if (
                "object" != typeof eA ||
                null === eA ||
                !eA.path ||
                eA.actionMask <= 0
              )
                return !1;
              let el = eA.raw?.operation;
              return (
                !("string" == typeof el && el.startsWith("process-exec")) ||
                (this.logger.info?.(
                  `[SandboxShell] _parseFileBlockRecords: skipping process-exec record | path=${eA.path} | operation=${el}`,
                ),
                !1)
              );
            })
            .map((eA) => ({ path: eA.path }))
        : [];
    }
    _enrichResult(eA) {
      if (void 0 !== eA.sandboxDenied || !eA.fileBlockRecords) return;
      let el = this._parseFileBlockRecords(eA.fileBlockRecords);
      el.length > 0 &&
        ((eA.sandboxDenied = !0),
        (eA.sandboxBlockedPaths = el.map((eA) => eA.path)));
    }
  });
  l0.SAFE_DELETE_COMMANDS = new Set(["rm", "unlink", "rmdir"]);
  return {
    SandboxShellServiceImpl: l0,
    SandboxPipeExecutionHandle,
    SandboxPtyExecutionHandle,
    getModule,
    toShellNetworkBlockRecord,
    mapNetworkBlockRecords,
    stageWindowsBashScript,
  };
}
