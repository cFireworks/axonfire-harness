import * as crypto from "node:crypto";
import * as path from "node:path";
import { createChannelClientIoRuntime } from "../../src/channels/channel-client-runtime.js";
import { noopChannelLogger } from "../../src/channels/channel-runtime.js";
/** Memory FS, deterministic randomness/timers and socket; never reads real credentials. */
export function clientFixture(options: any = {}) {
  const events: any[] = [],
    files = new Map<string, Buffer>(),
    timers = new Map<
      number,
      { fn: (...args: any[]) => any; delay: number; interval: boolean }
    >();
  let time = 12345,
    next = 0,
    randomId = 0,
    uuid = 0;
  const sockets: any[] = [];
  const logger: any = Object.fromEntries(
    Object.keys(noopChannelLogger).map((key) => [
      key,
      (...args: any[]) => events.push([key, ...args]),
    ]),
  );
  const put = (file: string, value: any) =>
    files.set(
      file,
      Buffer.isBuffer(value)
        ? Buffer.from(value)
        : Buffer.from(
            typeof value === "string" ? value : JSON.stringify(value),
          ),
    );
  for (const [key, value] of Object.entries(options.files ?? {}))
    put(key, value);
  const fs: any = {
    existsSync: (file: string) =>
      files.has(file) ||
      [...files.keys()].some((p) => p.startsWith(file + "/")),
    mkdirSync: (...args: any[]) => events.push(["mkdir", ...args]),
    writeFileSync: (file: string, value: any, encoding: any) => {
      events.push(["write", file, Buffer.from(value), encoding]);
      put(file, value);
    },
    readFileSync: (file: string, encoding?: any) => {
      events.push(["read", file, encoding]);
      if (!files.has(file)) throw Error("ENOENT " + file);
      const value = files.get(file)!;
      return encoding ? value.toString() : Buffer.from(value);
    },
    readdirSync: (directory: string) => [
      ...new Set(
        [...files.keys()]
          .filter((file) => path.dirname(file) === directory)
          .map((file) => path.basename(file)),
      ),
    ],
    renameSync: (a: string, b: string) => {
      events.push(["rename", a, b]);
      if (!files.has(a)) throw Error("ENOENT " + a);
      files.set(b, files.get(a)!);
      files.delete(a);
    },
    chmodSync: (...args: any[]) => events.push(["chmod", ...args]),
    unlinkSync: (file: string) => {
      events.push(["unlink", file]);
      files.delete(file);
    },
  };
  const setTimer = (
    interval: boolean,
    fn: (...args: any[]) => any,
    delay: number,
    ...args: any[]
  ) => {
    const id = ++next;
    events.push([interval ? "setInterval" : "setTimeout", id, delay]);
    timers.set(id, { fn: () => fn(...args), delay, interval });
    if (options.autoSleep && delay < 5000 && !interval)
      queueMicrotask(() => {
        if (timers.has(id)) {
          timers.delete(id);
          time += delay;
          fn(...args);
        }
      });
    return id;
  };
  const clearTimer = (kind: string, id: number) => {
    events.push([kind, id]);
    timers.delete(id);
  };
  const response = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    statusText: status === 200 ? "OK" : "Fixture failure",
    headers: {
      get: (key: string) =>
        key === "x-encrypted-param"
          ? (options.encryptedParam ?? "fixture-download")
          : null,
    },
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
    arrayBuffer: async () =>
      Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data)),
  });
  const qrStatuses = [
    ...(options.qrStatuses ?? [
      {
        status: "confirmed",
        bot_token: "fixture-token",
        ilink_bot_id: "FIXTURE_ACCOUNT",
        ilink_user_id: "fixture-user",
      },
    ]),
  ];
  const fetchImpl: any = async (url: any, config: any = {}) => {
    events.push(["fetch", String(url), config]);
    if (options.fetchError) throw options.fetchError;
    if (String(url).includes("get_bot_qrcode"))
      return response({
        qrcode: "fixture-qr",
        qrcode_img_content: "https://fixture.invalid/qr",
      });
    if (String(url).includes("get_qrcode_status"))
      return response(qrStatuses.shift() ?? { status: "wait" });
    if (options.fetch) return options.fetch(url, config, response);
    if (
      config.method === "POST" &&
      config.headers?.["Content-Type"] === "application/octet-stream"
    )
      return response({}, options.ok ?? true);
    return response(
      options.response ?? { ret: 0 },
      options.ok ?? true,
      options.ok === false ? 500 : 200,
    );
  };
  class FakeSocket {
    readyState = 1;
    onopen: any;
    onmessage: any;
    onclose: any;
    onerror: any;
    constructor(readonly url: string) {
      events.push(["socket", url]);
      sockets.push(this);
      queueMicrotask(() => this.onopen?.({}));
    }
    send(text: string) {
      const frame = JSON.parse(text);
      events.push(["frame", frame]);
      if (options.socketResponses === false) return;
      let body: any = {};
      if (frame.cmd === "aibot_upload_media_init")
        body = options.noUploadId ? {} : { upload_id: "fixture-upload" };
      if (frame.cmd === "aibot_upload_media_finish")
        body = options.noMediaId
          ? {}
          : { media_id: "fixture-media", type: options.finishedType };
      const message = {
        headers: { req_id: frame.headers.req_id },
        errcode:
          frame.cmd === "aibot_subscribe" ? (options.subscribeError ?? 0) : 0,
        errmsg: "fixture",
        body,
      };
      queueMicrotask(() => this.onmessage?.({ data: JSON.stringify(message) }));
    }
    close(code = 1000, reason = "fixture close") {
      events.push(["closeSocket", code, reason]);
      this.readyState = 3;
      queueMicrotask(() => this.onclose?.({ code, reason }));
    }
  }
  const io = createChannelClientIoRuntime({
    fs,
    path,
    os: { hostname: () => "fixture-host", tmpdir: () => "/fixture-tmp" } as any,
    crypto: {
      ...crypto,
      randomBytes: ((length: number) =>
        Buffer.alloc(length, ++randomId)) as any,
      randomUUID: (() => `fixture-${++uuid}`) as any,
    },
    env: options.env ?? {},
    pid: 42,
    getHomeDir: () => "/fixture-home",
    now: () => time,
    random: () => 0.25,
    fetch: fetchImpl,
    setTimeout: ((fn: any, delay: any, ...args: any[]) =>
      setTimer(false, fn, delay, ...args)) as any,
    clearTimeout: ((id: number) => clearTimer("clearTimeout", id)) as any,
    setInterval: ((fn: any, delay: any, ...args: any[]) =>
      setTimer(true, fn, delay, ...args)) as any,
    clearInterval: ((id: number) => clearTimer("clearInterval", id)) as any,
    stderrWrite: (value) => events.push(["stderr", value]),
    generateTerminalQRCode: async (text: string) => {
      events.push(["qr", text]);
      return "fixture terminal qr";
    },
    timeoutSignal: (delay: number) => {
      events.push(["timeoutSignal", delay]);
      return new AbortController().signal;
    },
    isBun: false,
    loadWebSocketModule: () => ({ default: FakeSocket }),
    ...options.io,
  });
  return {
    io,
    events,
    files,
    timers,
    sockets,
    logger,
    FakeSocket,
    put,
    response,
    advance: (milliseconds: number) => {
      time += milliseconds;
    },
    fire: async (id: number) => {
      const timer = timers.get(id);
      if (!timer) return;
      if (!timer.interval) timers.delete(id);
      time += timer.delay;
      await timer.fn();
    },
  };
}
export async function flushClientFixture() {
  for (let i = 0; i < 32; i++) await Promise.resolve();
}
