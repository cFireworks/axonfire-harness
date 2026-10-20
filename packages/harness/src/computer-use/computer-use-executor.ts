import {
  createComputerUseRuntime,
  type ComputerUseRuntime,
} from "./computer-use-runtime.js";
// Native helper bodies: codebuddy.js 12137xxx..121472xx (UTF-16 offsets).
// Explicit runtime and per-harness factory are host adapters; default export below is shared.
export function createComputerUseExecutor(
  options: Partial<ComputerUseRuntime> = {},
) {
  const runtime = createComputerUseRuntime(options),
    uG = runtime.execFile;
  let uH: any = {
    platformChecked: false,
    isDarwin: false,
    cliclickChecked: false,
    cliclickPath: null,
  };
  function isDarwin(): any {
    return (
      uH.platformChecked ||
        ((uH.isDarwin = "darwin" === runtime.platform),
        (uH.platformChecked = !0)),
      uH.isDarwin
    );
  }
  async function detectCliclick(): Promise<any> {
    if (uH.cliclickChecked) return uH.cliclickPath;
    if (((uH.cliclickChecked = !0), !isDarwin()))
      return ((uH.cliclickPath = null), null);
    try {
      let { stdout: eA } = await uG("/usr/bin/which", ["cliclick"], {
          timeout: 2e3,
        }),
        el: any = eA.trim();
      uH.cliclickPath = el.length > 0 ? el : null;
    } catch {
      uH.cliclickPath = null;
    }
    return uH.cliclickPath;
  }
  function getComputerUseDir(): any {
    return `${runtime.getHomeDir()}/computer-use`;
  }
  let uK: any = runtime.execFile,
    u$: any = 5e3,
    uY: any = 3e3,
    debugLog: any = (eA: any, el: any) => {
      runtime.env.CODEBUDDY_COMPUTER_USE_DEBUG &&
        runtime.debug(`[ComputerUse] ${eA}`, el ?? "");
    },
    uJ: any = "/usr/sbin/screencapture",
    uq: any = "/usr/bin/osascript",
    uW: any = "/usr/bin/sips",
    uV: any = 1280,
    uZ: any = 75,
    uX: any = { x: 1, y: 1 };
  function rescaleToLogical(eA: any, el: any): any {
    return { x: Math.round(eA * uX.x), y: Math.round(el * uX.y) };
  }
  async function probeImageSize(eA: any): Promise<any> {
    try {
      let { stdout: el } = await uK(
          uW,
          ["-g", "pixelWidth", "-g", "pixelHeight", eA],
          { timeout: u$ },
        ),
        ec: any = Number(el.match(/pixelWidth:\s*(\d+)/)?.[1]),
        eu: any = Number(el.match(/pixelHeight:\s*(\d+)/)?.[1]);
      if (!Number.isFinite(ec) || !Number.isFinite(eu) || ec <= 0 || eu <= 0)
        return null;
      return { w: ec, h: eu };
    } catch (eA: any) {
      return (debugLog("sips probe failed", eA), null);
    }
  }
  async function probeLogicalScreenSize(): Promise<any> {
    try {
      let eA: any = (
        await runAppleScript(
          'tell application "Finder" to get bounds of window of desktop',
          u$,
        )
      )
        .split(",")
        .map((eA: any) => Number(eA.trim()));
      if (eA.length >= 4 && Number.isFinite(eA[2]) && Number.isFinite(eA[3]))
        return { w: eA[2], h: eA[3] };
      return null;
    } catch (eA: any) {
      return (debugLog("logical screen probe failed", eA), null);
    }
  }
  async function takeScreenshot(eA?: any): Promise<any> {
    let el: any = getComputerUseDir();
    await runtime.mkdir(el, { recursive: !0 });
    let ec: any = `${el}/${runtime.now()}.jpg`,
      eu: any = ["-x", "-t", "jpg", "-T", "0"];
    ("number" == typeof eA && Number.isFinite(eA) && eu.push("-D", String(eA)),
      eu.push(ec),
      await uK(uJ, eu, { timeout: u$ }));
    let [ed, ep] = await Promise.all([
      probeImageSize(ec),
      probeLogicalScreenSize(),
    ]);
    try {
      await uK(
        uW,
        [
          "-Z",
          String(uV),
          "-s",
          "format",
          "jpeg",
          "-s",
          "formatOptions",
          String(uZ),
          ec,
        ],
        { timeout: u$ },
      );
    } catch (eA: any) {
      debugLog("sips compression failed, using uncompressed screenshot", eA);
    }
    let eg: any = await probeImageSize(ec);
    return (
      ep && eg
        ? ((uX = { x: ep.w / eg.w, y: ep.h / eg.h }),
          debugLog("screenshot scale updated", {
            logical: ep,
            compressed: eg,
            scale: uX,
            backingScale: ed && ep.w > 0 ? ed.w / ep.w : null,
          }))
        : ((uX = { x: 1, y: 1 }),
          debugLog("screenshot scale fallback to 1:1", {
            logicalSize: ep,
            compressedSize: eg,
          })),
      { action: "screenshot", screenshot_path: ec }
    );
  }
  function escapeAppleScriptString(eA: any): any {
    return eA.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
  async function runAppleScript(eA: any, el = u$): Promise<any> {
    try {
      let { stdout: ec } = await uK(uq, ["-e", eA], { timeout: el });
      return ec.trim();
    } catch (eu: any) {
      let el: any = eu instanceof Error ? eu.message : String(eu),
        ec: any = el.toLowerCase();
      if (
        ec.includes("not allowed to send keystrokes") ||
        ec.includes("assistive access") ||
        ec.includes("不允许发送按键") ||
        ec.includes("辅助访问")
      )
        throw Error(
          "macOS Accessibility permission required. Open System Settings → Privacy & Security → Accessibility and enable your terminal (Terminal.app / iTerm / VS Code / etc.), then restart it.",
        );
      if (ec.includes("screen recording") || ec.includes("屏幕录制"))
        throw Error(
          "macOS Screen Recording permission required. Open System Settings → Privacy & Security → Screen Recording and enable your terminal, then restart it.",
        );
      throw (
        debugLog("unclassified osascript error", {
          scriptHead: eA.slice(0, 200),
          raw: el,
        }),
        Error(
          `AppleScript failed: ${el.split("\n").slice(-3).join(" ").trim()}`,
        )
      );
    }
  }
  async function mouseAction(eA: any, el: any, ec: any): Promise<any> {
    let eu: any = await detectCliclick(),
      ed: any = Math.round(el),
      ep: any = Math.round(ec),
      { x: eg, y: eh } = rescaleToLogical(el, ec);
    if (eu) {
      let el: any = {
        left_click: "c",
        right_click: "rc",
        middle_click: "mc",
        double_click: "dc",
        triple_click: "tc",
        mouse_move: "m",
      };
      await uK(eu, [`${el[eA]}:${eg},${eh}`], { timeout: u$ });
    } else {
      if ("mouse_move" === eA || "middle_click" === eA || "triple_click" === eA)
        throw Error(
          `${eA} requires cliclick. Install with: brew install cliclick`,
        );
      "double_click" === eA
        ? (await runAppleScript(
            `tell application "System Events" to tell (process 1 whose frontmost is true) to click at {${eg}, ${eh}}`,
          ),
          await runAppleScript(
            `tell application "System Events" to tell (process 1 whose frontmost is true) to click at {${eg}, ${eh}}`,
          ))
        : "right_click" === eA
          ? await runAppleScript(`tell application "System Events"
  key down control
  tell (process 1 whose frontmost is true) to click at {${eg}, ${eh}}
  key up control
end tell`)
          : await runAppleScript(
              `tell application "System Events" to tell (process 1 whose frontmost is true) to click at {${eg}, ${eh}}`,
            );
    }
    return { action: eA, x: ed, y: ep };
  }
  async function leftClickDrag(
    eA: any,
    el: any,
    ec: any,
    eu: any,
  ): Promise<any> {
    let ed: any = await detectCliclick();
    if (!ed)
      throw Error(
        "left_click_drag requires cliclick. Install with: brew install cliclick",
      );
    let ep: any = Math.round(eA),
      eg: any = Math.round(el),
      eh: any = Math.round(ec),
      ef: any = Math.round(eu),
      em: any = rescaleToLogical(eA, el),
      eE: any = rescaleToLogical(ec, eu);
    return (
      await uK(ed, [`dd:${em.x},${em.y}`, `du:${eE.x},${eE.y}`], {
        timeout: u$,
      }),
      {
        action: "left_click_drag",
        start_x: ep,
        start_y: eg,
        end_x: eh,
        end_y: ef,
      }
    );
  }
  async function typeText(eA: any): Promise<any> {
    let el: any = eA.replace(/\r\n?/g, "\n").split("\n");
    for (let eA: any = 0; eA < el.length; eA++) {
      eA > 0 &&
        (await runAppleScript(
          'tell application "System Events" to key code 36',
        ));
      let ec: any = el[eA];
      if (0 === ec.length) continue;
      let eu: any = escapeAppleScriptString(ec);
      await runAppleScript(
        `tell application "System Events" to keystroke "${eu}"`,
      );
    }
    return { action: "type", text_length: eA.length };
  }
  let u0: any = {
      cmd: "command down",
      command: "command down",
      ctrl: "control down",
      control: "control down",
      alt: "option down",
      opt: "option down",
      option: "option down",
      shift: "shift down",
      fn: "function down",
    },
    u1: any = {
      return: 36,
      enter: 36,
      tab: 48,
      space: 49,
      delete: 51,
      backspace: 51,
      escape: 53,
      esc: 53,
      left: 123,
      right: 124,
      down: 125,
      up: 126,
      home: 115,
      end: 119,
      pageup: 116,
      pagedown: 121,
      f1: 122,
      f2: 120,
      f3: 99,
      f4: 118,
      f5: 96,
      f6: 97,
      f7: 98,
      f8: 100,
      f9: 101,
      f10: 109,
      f11: 103,
      f12: 111,
    };
  function buildKeyScript(eA: any): any {
    let el: any = eA
      .split("+")
      .map((eA: any) => eA.trim())
      .filter((eA: any) => eA.length > 0);
    if (0 === el.length)
      throw Error(`Invalid key sequence: ${JSON.stringify(eA)}`);
    let ec: any = el[el.length - 1].toLowerCase(),
      eu: any = el.slice(0, -1).map((eA: any) => eA.toLowerCase()),
      ed: any = [];
    for (let eA of eu) {
      let el: any = u0[eA];
      if (!el)
        throw Error(
          `Unknown modifier: ${JSON.stringify(eA)}. Supported: cmd, ctrl, alt/option, shift, fn`,
        );
      ed.push(el);
    }
    let ep: any = ed.length > 0 ? ` using {${ed.join(", ")}}` : "";
    if (1 === ec.length) {
      let eA: any = escapeAppleScriptString(ec);
      return `tell application "System Events" to keystroke "${eA}"${ep}`;
    }
    let eg: any = u1[ec];
    if (void 0 === eg)
      throw Error(
        `Unsupported key: ${JSON.stringify(ec)}. Supported named keys: ${Object.keys(u1).sort().join(", ")}. For single characters use the character directly.`,
      );
    return `tell application "System Events" to key code ${eg}${ep}`;
  }
  async function pressKey(eA: any): Promise<any> {
    let el: any = buildKeyScript(eA);
    return (await runAppleScript(el), { action: "key", text: eA });
  }
  async function holdKey(eA: any, el: any): Promise<any> {
    let ec: any = Math.max(0, Math.min(30, el)),
      eu: any = eA
        .split("+")
        .map((eA: any) => eA.trim())
        .filter((eA: any) => eA.length > 0);
    if (1 !== eu.length)
      throw Error("hold_key accepts only a single key (no modifiers).");
    let ed: any = eu[0].toLowerCase(),
      ep: any = u1[ed];
    if (void 0 === ep)
      throw Error(
        `hold_key: unsupported key ${JSON.stringify(ed)}. Supported named keys: ${Object.keys(u1).sort().join(", ")}.`,
      );
    let eg: any = `tell application "System Events"
  key down (key code ${ep})
  delay ${ec}
  key up (key code ${ep})
end tell`;
    return (
      await runAppleScript(eg, 1e3 * ec + uY),
      { action: "hold_key", text: eA, duration: ec }
    );
  }
  async function computer_use_executor_wait(eA: any): Promise<any> {
    let el: any = Math.max(0, Math.min(60, eA));
    return (
      await new Promise((eA: any) => runtime.setTimeout(eA, 1e3 * el)),
      { action: "wait", duration: el }
    );
  }
  async function scrollAt(eA: any, el: any, ec: any, eu: any): Promise<any> {
    let ed: any = Math.round(eA),
      ep: any = Math.round(el),
      { x: eg, y: eh } = rescaleToLogical(eA, el),
      ef: any = Math.max(1, Math.round(eu)),
      em: any = 0,
      eE: any = 0;
    switch (ec) {
      case "up":
        eE = ef;
        break;
      case "down":
        eE = -ef;
        break;
      case "left":
        em = ef;
        break;
      case "right":
        em = -ef;
    }
    let eC: any = `import sys
try:
    import Quartz
except Exception as e:
    sys.stderr.write("QuartzMissing: " + str(e))
    sys.exit(2)
loc = (${eg}, ${eh})
mv = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventMouseMoved, loc, 0)
Quartz.CGEventPost(Quartz.kCGHIDEventTap, mv)
ev = Quartz.CGEventCreateScrollWheelEvent(None, Quartz.kCGScrollEventUnitLine, 2, ${eE}, ${em})
Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
`;
    try {
      await uK("/usr/bin/python3", ["-c", eC], { timeout: u$ });
    } catch (el: any) {
      let eA: any = el instanceof Error ? el.message : String(el);
      if (eA.includes("QuartzMissing"))
        throw Error(
          "scroll requires the macOS system python3 with Quartz (PyObjC). It is bundled with macOS by default; please ensure /usr/bin/python3 is available.",
        );
      throw (
        debugLog("scroll via Quartz failed", eA),
        Error(`scroll failed: ${eA.split("\n").slice(-3).join(" ").trim()}`)
      );
    }
    return {
      action: "scroll",
      x: ed,
      y: ep,
      scroll_direction: ec,
      scroll_amount: ef,
    };
  }
  async function getCursorPosition(): Promise<any> {
    let eA: any = await detectCliclick();
    if (eA) {
      let { stdout: el } = await uK(eA, ["p"], { timeout: u$ }),
        [ec, eu] = el.trim().split(","),
        ed: any = Number.parseInt(ec, 10),
        ep: any = Number.parseInt(eu, 10);
      if (!Number.isFinite(ed) || !Number.isFinite(ep))
        throw Error(
          `cliclick returned invalid position: ${JSON.stringify(el)}`,
        );
      return { action: "cursor_position", x: ed, y: ep };
    }
    let [el, ec] = (
        await runAppleScript(
          'tell application "System Events"\n  set mousePos to mouse location of (first process whose frontmost is true)\n  return (item 1 of mousePos as string) & "," & (item 2 of mousePos as string)\nend tell',
        )
      ).split(","),
      eu: any = Number.parseInt(el.trim(), 10),
      ed: any = Number.parseInt(ec.trim(), 10);
    if (!Number.isFinite(eu) || !Number.isFinite(ed))
      throw Error(
        "Could not determine cursor position. Install cliclick for reliable position queries: brew install cliclick",
      );
    return { action: "cursor_position", x: eu, y: ed };
  }
  return {
    isDarwin,
    detectCliclick,
    getComputerUseDir,
    rescaleToLogical,
    probeImageSize,
    probeLogicalScreenSize,
    takeScreenshot,
    escapeAppleScriptString,
    runAppleScript,
    mouseAction,
    leftClickDrag,
    typeText,
    buildKeyScript,
    pressKey,
    holdKey,
    scrollAt,
    getCursorPosition,
    wait: computer_use_executor_wait,
    getState: () => ({ cache: { ...uH }, scale: { ...uX } }),
  };
}
export type ComputerUseExecutor = ReturnType<typeof createComputerUseExecutor>;
export const defaultComputerUseExecutor = createComputerUseExecutor();
