export const LSPClient = Symbol("LSPClient");
export const LSPManager = Symbol("LSPManager");
export enum LSPServerStatus {
  Stopped = "stopped",
  Starting = "starting",
  Running = "running",
  Crashed = "crashed",
  Unavailable = "unavailable",
}
export enum LSPSymbolKind {
  File = 1,
  Module,
  Namespace,
  Package,
  Class,
  Method,
  Property,
  Field,
  Constructor,
  Enum,
  Interface,
  Function,
  Variable,
  Constant,
  String,
  Number,
  Boolean,
  Array,
  Object,
  Key,
  Null,
  EnumMember,
  Struct,
  Event,
  Operator,
  TypeParameter,
}
export type LSPPosition = { line: number; character: number };
export type LSPServerConfig = {
  command: string;
  extensionToLanguage: Record<string, string>;
  args?: string[];
  env?: NodeJS.ProcessEnv;
  workspaceFolder?: string;
  transport?: string;
  startupTimeout?: number;
  shutdownTimeout?: number;
  initializationOptions?: unknown;
  settings?: Record<string, any>;
  eager?: boolean;
  restartOnCrash?: boolean;
  maxRestarts?: number;
  [key: string]: unknown;
};
export type LSPLogger = {
  setContext(value: string): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  log(...args: any[]): void;
};
export const noopLSPLogger: LSPLogger = {
  setContext() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
  log() {},
};
export type LSPWorkspace = {
  workspaceFolders?: readonly { uri: { fsPath: string } }[] | undefined;
};
export interface LSPClientService {
  init(config: LSPServerConfig, languageId: string): void;
  initialize(): Promise<void>;
  isRunning(): boolean;
  shutdown(): Promise<void>;
  goToDefinition(uri: string, position: LSPPosition): Promise<any[]>;
  findReferences(uri: string, position: LSPPosition): Promise<any[]>;
  hover(uri: string, position: LSPPosition): Promise<any>;
  documentSymbol(uri: string): Promise<any[]>;
  workspaceSymbol(query: string): Promise<any[]>;
  goToImplementation(uri: string, position: LSPPosition): Promise<any[]>;
  prepareCallHierarchy(uri: string, position: LSPPosition): Promise<any[]>;
  incomingCalls(item: any): Promise<any[]>;
  outgoingCalls(item: any): Promise<any[]>;
  goToTypeDefinition(uri: string, position: LSPPosition): Promise<any[]>;
  completion(uri: string, position: LSPPosition): Promise<any[]>;
}
export type LSPServerInstance = {
  languageId: string;
  config: LSPServerConfig;
  status: LSPServerStatus;
  restartCount: number;
  pluginName: string;
  marketplaceName: string;
  client?: LSPClientService;
};
export type LSPPluginManager = {
  getActivePlugins(): Promise<
    readonly {
      plugin: { name: string; marketplaceName: string };
      components?: { lspServers?: Record<string, LSPServerConfig> } | undefined;
    }[]
  >;
};
