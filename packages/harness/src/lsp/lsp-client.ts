import * as path from "node:path";
import {
  spawn,
  execSync,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";
import { readFile } from "node:fs/promises";
import { URI } from "vscode-uri";
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
  type MessageConnection,
} from "vscode-jsonrpc/node.js";
import {
  noopLSPLogger,
  type LSPLogger,
  type LSPWorkspace,
  type LSPServerConfig,
  type LSPClientService,
  type LSPPosition,
} from "./lsp-types.js";
export const LSP_DEFAULT_STARTUP_TIMEOUT = 30000;
export type LSPClientRuntime = {
  process: Pick<NodeJS.Process, "platform" | "env" | "pid">;
  spawn: typeof spawn;
  execSync: typeof execSync;
  readFile: typeof readFile;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
  createMessageConnection: typeof createMessageConnection;
};
const defaultRuntime: LSPClientRuntime = {
  process,
  spawn,
  execSync,
  readFile,
  setTimeout,
  clearTimeout,
  createMessageConnection,
};
/** Native helper preceding 11971809: Unix commands intentionally remain unchanged. */
export function resolveLSPCommand(
  command: string,
  runtime: Pick<LSPClientRuntime, "process" | "execSync"> = defaultRuntime,
): string {
  if (path.isAbsolute(command)) return command;
  if (runtime.process.platform === "win32") {
    const locate = (value: string) =>
      (
        runtime.execSync(`where.exe ${value}`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
          windowsHide: true,
        }) as string
      )
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            !(
              !line ||
              line.toLowerCase().includes("powershell.exe") ||
              line.includes("管理员")
            ) && !!/^[a-zA-Z]:\\/.test(line),
        );
    try {
      const results = locate(command);
      if (results.length > 0)
        return (
          results.find((value) => value.toLowerCase().endsWith(".cmd")) ||
          results[0]!
        );
    } catch {
      for (const suffix of [".cmd", ".bat", ".exe"])
        if (!command.toLowerCase().endsWith(suffix))
          try {
            const results = locate(command + suffix);
            if (results.length > 0) return results[0]!;
          } catch {}
    }
  }
  return command;
}
/** Native LSPClient 11971809..11982082, with explicit host dependencies. */
export class LSPClientImpl implements LSPClientService {
  isInitialized = false;
  readonly openedDocuments = new Set<string>();
  config!: LSPServerConfig;
  languageId!: string;
  workspaceRoot!: string;
  process: ChildProcessWithoutNullStreams | undefined;
  connection: MessageConnection | undefined;
  readonly runtime: LSPClientRuntime;
  constructor(
    readonly logger: LSPLogger = noopLSPLogger,
    readonly workspace: LSPWorkspace = {},
    readonly getWorkDir: () => string = () => process.cwd(),
    runtime: Partial<LSPClientRuntime> = {},
  ) {
    this.runtime = { ...defaultRuntime, ...runtime };
  }
  init(config: LSPServerConfig, languageId: string): void {
    this.config = config;
    this.languageId = languageId;
    const folders = this.workspace.workspaceFolders;
    this.workspaceRoot =
      config.workspaceFolder ||
      (folders && folders.length > 0
        ? folders[0]!.uri.fsPath
        : this.getWorkDir());
  }
  async initialize(): Promise<void> {
    if (!this.isInitialized)
      try {
        this.logger.info(
          `Starting LSP server for language '${this.languageId}': ${this.config.command}`,
        );
        const transport = this.config.transport || "stdio";
        if (transport === "stdio") await this.startServerStdio();
        else throw Error(`Unsupported transport: ${transport}`);
        await this.sendInitializeRequest();
        this.isInitialized = true;
        this.logger.info(
          `LSP server for '${this.languageId}' initialized successfully`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to initialize LSP server for '${this.languageId}': ${message}`,
        );
        await this.cleanup();
        throw error;
      }
  }
  async startServerStdio(): Promise<void> {
    const { command, args = [], env = {} } = this.config,
      startupTimeout =
        this.config.startupTimeout || LSP_DEFAULT_STARTUP_TIMEOUT;
    let executable = command;
    try {
      executable = resolveLSPCommand(command, this.runtime);
      this.logger.debug(`Resolved LSP command '${command}' to '${executable}'`);
    } catch (error) {
      this.logger.warn(
        `Failed to resolve command '${command}', will use as-is: ${error}`,
      );
    }
    const windows = this.runtime.process.platform === "win32",
      options: any = {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: this.workspaceRoot,
      };
    if (windows) {
      const extension = path.extname(executable).toLowerCase();
      if (extension === ".cmd" || extension === ".bat" || extension === "")
        options.shell = true;
      else if (extension === ".exe" && executable.includes(" ")) {
        executable = `"${executable}"`;
        options.shell = true;
      }
      options.env = {
        ...this.runtime.process.env,
        ...env,
        CHCP: "65001",
        NODE_OPTIONS: "",
      };
      options.windowsHide = true;
    } else
      options.env = { ...this.runtime.process.env, ...env, NODE_OPTIONS: "" };
    this.process = this.runtime.spawn(
      executable,
      args,
      options,
    ) as ChildProcessWithoutNullStreams;
    if (this.process.stderr)
      this.process.stderr.on("data", (data) => {
        const message = data.toString().trim();
        if (message)
          this.logger.debug(
            `LSP server stderr for '${this.languageId}': ${message}`,
          );
      });
    this.process.on("error", (error: NodeJS.ErrnoException) => {
      const message =
        error.code === "ENOENT"
          ? `Executable not found in PATH: ${command}. Please install it or check your PATH.`
          : error.message;
      this.logger.error(
        `LSP server process error for '${this.languageId}': ${message}`,
      );
    });
    this.process.on("exit", (code, signal) => {
      this.logger.warn(
        `LSP server process exited for '${this.languageId}' with code ${code}, signal ${signal}`,
      );
      void this.cleanup();
    });
    await new Promise<void>((resolve, reject) => {
      const timer = this.runtime.setTimeout(() => {
        if (this.process && this.process.exitCode !== null)
          reject(
            Error(
              `LSP server process exited immediately with code ${this.process.exitCode}`,
            ),
          );
        else resolve();
      }, 500);
      this.process!.once("error", (error: NodeJS.ErrnoException) => {
        this.runtime.clearTimeout(timer);
        reject(
          error.code === "ENOENT"
            ? Error(
                `Executable not found in PATH: ${command}. Please install it (e.g., npm install -g ${command}) or check your PATH.`,
              )
            : error,
        );
      });
      this.process!.once("exit", (code) => {
        this.runtime.clearTimeout(timer);
        reject(
          Error(`LSP server process exited immediately with code ${code}`),
        );
      });
    });
    const reader = new StreamMessageReader(this.process!.stdout),
      writer = new StreamMessageWriter(this.process!.stdin);
    this.connection = this.runtime.createMessageConnection(
      reader,
      writer,
      this.logger,
    );
    this.setupMessageHandlers();
    if (this.connection) {
      this.connection.onError((error) => {
        this.logger.error(
          `LSP connection error for '${this.languageId}': ${error[0]?.message || error}`,
        );
      });
      this.connection.onClose(() => {
        this.logger.info(`LSP connection closed for '${this.languageId}'`);
        void this.cleanup();
      });
      this.connection.listen();
    }
    await new Promise<void>((resolve, reject) => {
      const timer = this.runtime.setTimeout(
        () =>
          reject(Error(`LSP server startup timeout after ${startupTimeout}ms`)),
        startupTimeout,
      );
      this.runtime.setTimeout(() => {
        this.runtime.clearTimeout(timer);
        if (this.connection) resolve();
        else reject(Error("Connection failed to establish"));
      }, 1000);
    });
  }
  setupMessageHandlers(): void {
    if (!this.connection) return;
    this.connection.onRequest(
      "window/workDoneProgress/create",
      (params: any) => {
        this.logger.debug(
          `Server requested progress creation: ${JSON.stringify(params)}`,
        );
        return null;
      },
    );
    this.connection.onRequest("client/registerCapability", (params: any) => {
      this.logger.debug(
        `Server requested capability registration: ${JSON.stringify(params)}`,
      );
      return null;
    });
    this.connection.onRequest("workspace/configuration", (params: any) => {
      this.logger.debug(
        `Server requested configuration for ${params.items?.length || 0} item(s)`,
      );
      return params.items && Array.isArray(params.items)
        ? params.items.map(
            (item: any) =>
              (this.config.settings &&
                item.section &&
                this.config.settings[item.section]) ||
              {},
          )
        : [];
    });
    this.connection.onNotification("$/progress", (_params: any) => {});
    this.connection.onNotification("window/logMessage", (params: any) => {
      const level = ["", "ERROR", "WARN", "INFO", "LOG"][params.type] || "LOG",
        message = `[SERVER-${level}] ${params.message}`;
      if (params.type === 1) this.logger.error(message);
      else if (params.type === 2) this.logger.warn(message);
      else this.logger.info(message);
    });
    this.connection.onNotification("window/showMessage", (params: any) => {
      const level = ["", "ERROR", "WARN", "INFO", "LOG"][params.type] || "INFO";
      this.logger.info(`[SERVER-MSG-${level}] ${params.message}`);
    });
    this.connection.onNotification(
      "textDocument/publishDiagnostics",
      (params: any) => {
        this.logger.debug(
          `Diagnostics for ${params.uri}: ${params.diagnostics?.length || 0} issue(s)`,
        );
      },
    );
  }
  async sendInitializeRequest(): Promise<void> {
    if (!this.connection) throw Error("Connection not established");
    const uri = URI.file(this.workspaceRoot).toString(),
      params = {
        processId: this.runtime.process.pid,
        rootUri: uri,
        clientInfo: { name: "genie-agent-cli", version: "1.0.0" },
        capabilities: {
          textDocument: {
            definition: { linkSupport: true },
            references: {},
            hover: { contentFormat: ["plaintext", "markdown"] },
            documentSymbol: { hierarchicalDocumentSymbolSupport: true },
            implementation: { linkSupport: true },
            synchronization: {
              dynamicRegistration: false,
              willSave: false,
              willSaveWaitUntil: false,
              didSave: false,
            },
            completion: {
              dynamicRegistration: false,
              completionItem: { snippetSupport: false },
            },
            signatureHelp: { dynamicRegistration: false },
            documentHighlight: { dynamicRegistration: false },
            formatting: { dynamicRegistration: false },
            rangeFormatting: { dynamicRegistration: false },
            onTypeFormatting: { dynamicRegistration: false },
            typeDefinition: { dynamicRegistration: false },
            codeAction: { dynamicRegistration: false },
            codeLens: { dynamicRegistration: false },
            documentLink: { dynamicRegistration: false },
            rename: { dynamicRegistration: false },
          },
          workspace: {
            symbol: {},
            workspaceFolders: true,
            applyEdit: false,
            workspaceEdit: { documentChanges: false },
            didChangeConfiguration: { dynamicRegistration: false },
            didChangeWatchedFiles: { dynamicRegistration: false },
            executeCommand: { dynamicRegistration: false },
            configuration: true,
          },
          window: { workDoneProgress: true },
        },
        workspaceFolders: [{ uri, name: path.basename(this.workspaceRoot) }],
        initializationOptions: this.config.initializationOptions,
        trace: "off",
      },
      response: any = await this.connection.sendRequest("initialize", params);
    this.logger.debug(
      `LSP server capabilities: ${JSON.stringify(response.capabilities)}`,
    );
    await this.connection.sendNotification("initialized", {});
    const settings = this.config.settings || {};
    if (settings)
      await this.connection.sendNotification(
        "workspace/didChangeConfiguration",
        { settings },
      );
  }
  async ensureDocumentOpened(uri: string): Promise<void> {
    if (this.openedDocuments.has(uri)) return;
    const file = URI.parse(uri).fsPath,
      text = await this.runtime.readFile(file, "utf-8"),
      params = {
        textDocument: { uri, languageId: this.languageId, version: 1, text },
      };
    if (this.connection) {
      await this.connection.sendNotification("textDocument/didOpen", params);
      this.openedDocuments.add(uri);
    }
  }
  toLSPPosition(position: LSPPosition): LSPPosition {
    return { line: position.line, character: position.character };
  }
  async goToDefinition(uri: string, position: LSPPosition): Promise<any[]> {
    await this.ensureDocumentOpened(uri);
    return this.normalizeLocations(
      await this.connection!.sendRequest("textDocument/definition", {
        textDocument: { uri },
        position: this.toLSPPosition(position),
      }),
    );
  }
  async findReferences(uri: string, position: LSPPosition): Promise<any[]> {
    await this.ensureDocumentOpened(uri);
    return this.normalizeLocations(
      await this.connection!.sendRequest("textDocument/references", {
        textDocument: { uri },
        position: this.toLSPPosition(position),
        context: { includeDeclaration: true },
      }),
    );
  }
  async hover(uri: string, position: LSPPosition): Promise<any> {
    await this.ensureDocumentOpened(uri);
    const response: any = await this.connection!.sendRequest(
      "textDocument/hover",
      { textDocument: { uri }, position: this.toLSPPosition(position) },
    );
    if (!response) return null;
    let contents: any = "";
    if (typeof response.contents === "string") contents = response.contents;
    else if (response.contents && "value" in response.contents)
      contents = {
        language: response.contents.language || "plaintext",
        value: response.contents.value,
      };
    else if (Array.isArray(response.contents) && response.contents.length > 0) {
      const first = response.contents[0];
      if (typeof first === "string") contents = first;
      else if (first && "value" in first)
        contents = {
          language: first.language || "plaintext",
          value: first.value,
        };
    }
    return { contents, range: response.range };
  }
  async documentSymbol(uri: string): Promise<any[]> {
    await this.ensureDocumentOpened(uri);
    return (
      (await this.connection!.sendRequest("textDocument/documentSymbol", {
        textDocument: { uri },
      })) || []
    );
  }
  async workspaceSymbol(query: string): Promise<any[]> {
    return (
      (await this.connection!.sendRequest("workspace/symbol", { query })) || []
    );
  }
  async goToImplementation(uri: string, position: LSPPosition): Promise<any[]> {
    await this.ensureDocumentOpened(uri);
    return this.normalizeLocations(
      await this.connection!.sendRequest("textDocument/implementation", {
        textDocument: { uri },
        position: this.toLSPPosition(position),
      }),
    );
  }
  async prepareCallHierarchy(
    uri: string,
    position: LSPPosition,
  ): Promise<any[]> {
    await this.ensureDocumentOpened(uri);
    return (
      (await this.connection!.sendRequest("textDocument/prepareCallHierarchy", {
        textDocument: { uri },
        position: this.toLSPPosition(position),
      })) || []
    );
  }
  async incomingCalls(item: any): Promise<any[]> {
    return (
      (await this.connection!.sendRequest("callHierarchy/incomingCalls", {
        item,
      })) || []
    );
  }
  async outgoingCalls(item: any): Promise<any[]> {
    return (
      (await this.connection!.sendRequest("callHierarchy/outgoingCalls", {
        item,
      })) || []
    );
  }
  async goToTypeDefinition(uri: string, position: LSPPosition): Promise<any[]> {
    await this.ensureDocumentOpened(uri);
    return this.normalizeLocations(
      await this.connection!.sendRequest("textDocument/typeDefinition", {
        textDocument: { uri },
        position: this.toLSPPosition(position),
      }),
    );
  }
  async completion(uri: string, position: LSPPosition): Promise<any[]> {
    await this.ensureDocumentOpened(uri);
    const response: any = await this.connection!.sendRequest(
      "textDocument/completion",
      { textDocument: { uri }, position: this.toLSPPosition(position) },
    );
    return response
      ? Array.isArray(response)
        ? response
        : response.items
          ? response.items
          : []
      : [];
  }
  normalizeLocations(value: any): any[] {
    // The LocationLink branch is unreachable for arrays in the sample.
    return value
      ? "uri" in value && "range" in value
        ? [value]
        : Array.isArray(value)
          ? value.filter((item) => item && "uri" in item && "range" in item)
          : Array.isArray(value) && value[0] && "targetUri" in value[0]
            ? value.map((item: any) => ({
                uri: item.targetUri,
                range: item.targetRange,
              }))
            : []
      : [];
  }
  isRunning(): boolean {
    return (
      this.isInitialized &&
      !!this.connection &&
      !!this.process &&
      this.process.exitCode === null
    );
  }
  async shutdown(): Promise<void> {
    if (this.connection)
      try {
        const timeout = this.config.shutdownTimeout || 5000;
        this.logger.info(`Shutting down LSP server for '${this.languageId}'`);
        await Promise.race([
          this.connection.sendRequest("shutdown", null),
          new Promise((_resolve, reject) =>
            this.runtime.setTimeout(
              () => reject(Error("Shutdown timeout")),
              timeout,
            ),
          ),
        ]);
        await this.connection.sendNotification("exit", null);
      } catch (error) {
        this.logger.warn(
          `Error during LSP server shutdown for '${this.languageId}': ${error}`,
        );
      } finally {
        await this.cleanup();
      }
  }
  async cleanup(): Promise<void> {
    this.isInitialized = false;
    this.openedDocuments.clear();
    if (this.connection) {
      try {
        this.connection.dispose();
      } catch {}
      this.connection = undefined;
    }
    if (this.process && this.process.pid) {
      try {
        if (this.runtime.process.platform === "win32")
          this.runtime.spawn(
            "taskkill",
            ["/pid", String(this.process.pid), "/f", "/t"],
            { windowsHide: true },
          );
        else this.process.kill("SIGTERM");
      } catch {}
      this.process = undefined;
    }
  }
}
