export type MediaRequest = {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: unknown;
  signal?: AbortSignal;
  responseType?: "arraybuffer";
  timeout?: number;
};
export type MediaRestOperations = {
  request(
    options: MediaRequest,
  ): Promise<{ data: any; headers?: Record<string, any>; status?: number }>;
};
export type MediaRuntime = {
  getWorkDir(): string;
  configuration(): Promise<any>;
  authentication(): { accessToken?: string } | undefined;
  settings: { get(key: string): Promise<any> };
  restOperations: MediaRestOperations;
  logger: {
    info(...args: any[]): void;
    debug(...args: any[]): void;
    error(...args: any[]): void;
  };
  env: NodeJS.ProcessEnv;
  Date: DateConstructor;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
  createFileHyperlink(path: string): string;
};
/** Standalone HTTP adapter, not the original Axios/RestOperations interceptor
 * stack. Response/error envelope supports the recovered service methods. */
export function createMediaRestOperations(
  fetcher: typeof fetch = fetch,
): MediaRestOperations {
  return {
    async request(options) {
      const signal = options.timeout
        ? options.signal
          ? AbortSignal.any([
              options.signal,
              AbortSignal.timeout(options.timeout),
            ])
          : AbortSignal.timeout(options.timeout)
        : options.signal;
      const response = await fetcher(options.url, {
        method: options.method,
        ...(options.headers ? { headers: options.headers } : {}),
        ...(options.data === undefined
          ? {}
          : { body: JSON.stringify(options.data) }),
        ...(signal ? { signal } : {}),
      });
      const headers: Record<string, string> = {};
      response.headers.forEach((value, name) => {
        headers[name] = value;
      });
      let data: any;
      if (options.responseType === "arraybuffer")
        data = Buffer.from(await response.arrayBuffer());
      else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
      if (!response.ok) {
        const error = new Error(
          `Request failed with status code ${response.status}`,
        ) as Error & { response: unknown; config: unknown };
        error.response = { data, status: response.status, headers };
        error.config = options;
        throw error;
      }
      return { data, headers, status: response.status };
    },
  };
}
export function createMediaRuntime(
  options: Pick<MediaRuntime, "getWorkDir" | "configuration"> &
    Partial<Omit<MediaRuntime, "getWorkDir" | "configuration">>,
): MediaRuntime {
  return {
    authentication: () => undefined,
    settings: { get: async () => undefined },
    restOperations: createMediaRestOperations(),
    logger: { info() {}, debug() {}, error() {} },
    env: process.env,
    Date,
    setTimeout,
    clearTimeout,
    createFileHyperlink: (path) => path,
    ...options,
  };
}
