import * as eY from "node:path";
import * as eH from "./memory-rule-constants.js";
import type { MemoryRulesRuntime } from "./memory-rules-runtime.js";
const eZ = "rules";
export class LRUCache {
  [key: string]: any;
  constructor(eA: any) {
    ((this.map = new Map()), (this.max = eA.max));
  }
  get(eA: any): any {
    let el: any = this.map.get(eA);
    return (void 0 !== el && (this.map.delete(eA), this.map.set(eA, el)), el);
  }
  set(eA: any, el: any): any {
    (this.map.delete(eA),
      this.map.set(eA, el),
      this.map.size > this.max &&
        this.map.delete(this.map.keys().next().value));
  }
  clear(): any {
    this.map.clear();
  }
}
const e4 = {
  filePath: "",
  scope: eH.MemoryScope.PROJECT,
  type: "always",
  content: "",
  enabled: !1,
  globs: [],
  alwaysApply: !1,
  importedFrom: [],
};
// UTF-16 9313253..9314720
export class MemoryManagerImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  initialize(): any {
    this.logger.setContext("MemoryManager");
  }
  async get(eA?: any): Promise<any> {
    let el: any = await this.memoryCache.getOrLoad(() =>
      this.memoryLoader.loadAll(),
    );
    return this.filterMemories(el, eA);
  }
  async addFact(eA: any, el: any): Promise<any> {
    let ec: any = eA
        .trim()
        .replace(/^(-+\s*)+/, "")
        .trim(),
      eu: any = `- ${ec}`,
      ed: any = this.runtime.utilities.PathUtils.getMemoryFilePath(el),
      ep: any = "";
    try {
      ep = await (0, this.runtime.fs.readFile)(ed, "utf-8");
    } catch (eA: any) {
      if ("ENOENT" !== eA.code) throw eA;
    }
    if (ep.includes(eu)) return;
    let eg: any = this.insertIntoMemorySection(ep, eu);
    await this.write(eg, el);
  }
  async write(eA: any, el: any): Promise<any> {
    let ec: any = this.runtime.utilities.PathUtils.getMemoryFilePath(el);
    (await (0, this.runtime.fs.mkdir)((0, eY.dirname)(ec), { recursive: !0 }),
      await (0, this.runtime.fs.writeFile)(ec, eA, "utf-8"),
      this.clear());
  }
  clear(): any {
    this.memoryCache.clear();
  }
  filterMemories(eA: any, el: any): any {
    if (!el) return eA.filter((eA: any) => eA.type !== eH.MemoryType.MANUAL);
    let { scope: ec, type: eu } = el;
    return eA.filter(
      (eA: any) =>
        (void 0 === ec || eA.scope === ec) && (void 0 === eu || eA.type === eu),
    );
  }
  insertIntoMemorySection(eA: any, el: any): any {
    if (eA.includes(eH.MEMORY_SECTION_HEADER)) {
      let ec: any =
          eA.indexOf(eH.MEMORY_SECTION_HEADER) +
          eH.MEMORY_SECTION_HEADER.length,
        eu: any = eA.indexOf("\n## ", ec);
      -1 === eu && (eu = eA.length);
      let ed: any = eA.substring(0, ec).trimEnd(),
        ep: any = eA.substring(ec, eu).trimEnd(),
        eg: any = eA.substring(eu);
      return (
        (ep += `
${el}`),
        `${ed}
${ep.trimStart()}
${eg}`.trimEnd() + "\n"
      );
    }
    {
      let ec: any = this.ensureNewlineSeparation(eA);
      return `${eA}${ec}${eH.MEMORY_SECTION_HEADER}
${el}
`;
    }
  }
  ensureNewlineSeparation(eA: any): any {
    return 0 === eA.length || eA.endsWith("\n\n") || eA.endsWith("\r\n\r\n")
      ? ""
      : eA.endsWith("\n") || eA.endsWith("\r\n")
        ? "\n"
        : "\n\n";
  }
}
// UTF-16 9316053..9320988
export class MemoryLoaderImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  initialize(): any {
    this.logger.setContext("MemoryLoader");
  }
  async loadAll(): Promise<any> {
    let eA: any = this.runtime.utilities.MemoryLoadContextUtils.create();
    await Promise.all([
      this.loadUserMemories(eA),
      this.loadProjectMemories(eA),
      this.loadLocalMemories(eA),
    ]);
    let el: any = Array.from(eA.loadedMemories.values());
    if (el.length > 0) {
      let eA: any = el
        .map((eA: any) => `[${eA.scope}] [${eA.type}] ${eA.filePath}`)
        .join("\n  ");
      this.logger.info(`Loaded ${el.length} memory rules:
  ${eA}`);
    } else this.logger.info("No memory rules loaded");
    return (
      this.dispatchInstructionsLoadedHooks(el).catch((eA: any) => {
        this.logger.warn?.(`InstructionsLoaded hook dispatch failed: ${eA}`);
      }),
      el
    );
  }
  mapScopeToMemoryType(eA: any): any {
    switch (eA) {
      case eH.MemoryScope.USER:
        return "User";
      case eH.MemoryScope.PROJECT:
        return "Project";
      case eH.MemoryScope.PROJECT_LOCAL:
        return "Local";
      case eH.MemoryScope.MANAGED:
        return "Managed";
      default:
        return "Project";
    }
  }
  async dispatchInstructionsLoadedHooks(eA: any): Promise<any> {
    let el: any;
    if (!eA || 0 === eA.length) return;
    try {
      el = this.runtime.getHookManager();
    } catch {
      return;
    }
    if (!el || !(await el.hasHooks("InstructionsLoaded"))) return;
    let ec: any = this.runtime.utilities.PathUtils.getWorkDir();
    for (let eu of eA) {
      let eA: any = {
        transcript_path: "",
        cwd: ec,
        hook_event_name: "InstructionsLoaded",
        file_path: eu.filePath,
        memory_type: this.mapScopeToMemoryType(eu.scope),
        load_reason: "session_start",
      };
      try {
        await el.executeHooks("InstructionsLoaded", eA);
      } catch (eA: any) {
        this.logger.warn?.(
          `InstructionsLoaded hook for ${eu.filePath} failed: ${eA}`,
        );
      }
    }
  }
  async loadUserMemories(eA: any): Promise<any> {
    let el: any = this.runtime.utilities.PathUtils.getHomeDir();
    for (let ec of [eH.MEMORY_FILENAME, eH.MEMORY_FILENAME_MDC])
      if (
        await this.loadFile((0, eY.join)(el, ec), eA, {
          scope: eH.MemoryScope.USER,
        })
      )
        break;
    await this.loadDirectory((0, eY.join)(el, eZ), eH.MemoryScope.USER, eA);
  }
  async loadProjectMemories(eA: any): Promise<any> {
    let el: any = this.runtime.utilities.PathUtils.getWorkDir(),
      ec: any = (0, eY.parse)(el).root,
      eu: any = [],
      ed: any = el;
    for (; ed !== ec; ) {
      eu.push(ed);
      let eA: any = (0, eY.dirname)(ed);
      if (eA === ed) break;
      ed = eA;
    }
    for (let el: any = eu.length - 1; el >= 0; el--)
      await this.loadProjectMainFiles(eu[el], eA);
    await this.loadDirectory(
      (0, eY.join)(el, ".codebuddy", eZ),
      eH.MemoryScope.PROJECT,
      eA,
    );
  }
  async loadLocalMemories(eA: any): Promise<any> {
    let el: any = this.runtime.utilities.PathUtils.getWorkDir();
    for (let ec of [eH.MEMORY_LOCAL_FILENAME, eH.MEMORY_LOCAL_FILENAME_MDC])
      if (
        await this.loadFile((0, eY.join)(el, ec), eA, {
          scope: eH.MemoryScope.PROJECT_LOCAL,
        })
      )
        break;
  }
  async loadProjectMainFiles(eA: any, el: any): Promise<any> {
    let ec: any = [
      eH.MEMORY_FILENAME,
      eH.MEMORY_FILENAME_MDC,
      eH.AGENTS_FILENAME,
      eH.AGENTS_FILENAME_MDC,
    ];
    for (let eu of ec)
      if (
        await this.loadFile((0, eY.join)(eA, eu), el, {
          scope: eH.MemoryScope.PROJECT,
        })
      )
        break;
    let eu: any = (0, eY.join)(eA, ".codebuddy");
    for (let eA of ec)
      if (
        await this.loadFile((0, eY.join)(eu, eA), el, {
          scope: eH.MemoryScope.PROJECT,
        })
      )
        break;
  }
  async loadFile(eA: any, el: any, ec: any): Promise<any> {
    let { scope: eu, importedFrom: ed, autoGeneratedGlobs: ep } = ec;
    try {
      let ec: any = await this.resolveRealPath(eA);
      if (el.loadedMemories.has(ec)) {
        if (ed) {
          let eA: any = el.loadedMemories.get(ec);
          ((eA.importedFrom = eA.importedFrom || []),
            eA.importedFrom.includes(ed) || eA.importedFrom.push(ed));
        }
        return !0;
      }
      if (!this.canLoad(ec, el)) return !1;
      let eg: any = { scope: eu, autoGeneratedGlobs: ep },
        eh: any = await this.parser.parse(ec, eg);
      ed &&
        ((eh.importedFrom = eh.importedFrom || []),
        eh.importedFrom.includes(ed) || eh.importedFrom.push(ed));
      let ef: any = !!ed;
      if (!this.validator.validate(eh, { isImported: ef })) return !1;
      return (
        el.loadedMemories.set(ec, eh),
        el.visitedFilePaths.add(ec),
        await this.loadImports(eh, el),
        !0
      );
    } catch (el: any) {
      return this.handleLoadError(eA, el);
    }
  }
  async resolveRealPath(eA: any): Promise<any> {
    try {
      return await (0, this.runtime.fs.realpath)(eA);
    } catch {
      throw Error(`FILE_NOT_FOUND: ${eA}`);
    }
  }
  canLoad(eA: any, el: any): any {
    return el.visitedFilePaths.has(eA)
      ? (this.logger.warn(`Circular import detected: ${eA}`), !1)
      : !(el.importDepth >= this.runtime.utilities.MAX_IMPORT_DEPTH) ||
          (this.logger.warn(
            `Max import depth (${this.runtime.utilities.MAX_IMPORT_DEPTH}) exceeded: ${eA}`,
          ),
          !1);
  }
  async loadImports(eA: any, el: any): Promise<any> {
    let ec: any = this.runtime.utilities.ImportUtils.extractImports(
      eA.content,
      eA.filePath,
    );
    if (0 === ec.length) return;
    let eu: any = this.runtime.utilities.MemoryLoadContextUtils.createChild(el);
    for (let el of ec)
      (await this.runtime.utilities.FileUtils.isDirectory(el.resolvedPath)) ||
        (await this.loadFile(el.resolvedPath, eu, {
          scope: eA.scope,
          importedFrom: eA.filePath,
        }));
  }
  handleLoadError(eA: any, el: any): any {
    return (
      !(el.message || "").includes("FILE_NOT_FOUND") &&
      "ENOENT" !== el.code &&
      "EACCES" !== el.code &&
      (this.logger.error(`Failed to load memory file ${eA}:`, el), !1)
    );
  }
  async loadDirectory(eA: any, el: any, ec: any): Promise<any> {
    try {
      let eu: any = await (0, this.runtime.fs.realpath)(eA);
      if (
        ec.visitedDirectories.has(eu) ||
        (ec.visitedDirectories.add(eu),
        !(await (0, this.runtime.fs.stat)(eA)).isDirectory())
      )
        return;
      for (let eu of await (0, this.runtime.fs.readdir)(eA, {
        withFileTypes: !0,
      })) {
        let ed: any = (0, eY.join)(eA, eu.name);
        if (eu.isSymbolicLink())
          try {
            let eA: any = await (0, this.runtime.fs.stat)(ed);
            eA.isDirectory()
              ? await this.loadDirectory(ed, el, ec)
              : eA.isFile() &&
                this.isSupportedFile(eu.name) &&
                (await this.loadFile(ed, ec, { scope: el }));
          } catch (eA: any) {
            this.logger.warn(`Invalid symlink: ${ed}`);
          }
        else
          eu.isDirectory()
            ? await this.loadDirectory(ed, el, ec)
            : eu.isFile() &&
              this.isSupportedFile(eu.name) &&
              (await this.loadFile(ed, ec, { scope: el }));
      }
    } catch (el: any) {
      "ENOENT" !== el.code &&
        this.logger.error(`Failed to load directory ${eA}:`, el);
    }
  }
  isSupportedFile(eA: any): any {
    return eA.endsWith(".md") || eA.endsWith(".mdc");
  }
}
// UTF-16 9322398..9322964
export class MemoryParserImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  async parse(eA: any, el: any): Promise<any> {
    let ec: any,
      { scope: eu, autoGeneratedGlobs: ed } = el,
      ep: any = await (0, this.runtime.fs.readFile)(eA, "utf-8"),
      eg: any =
        this.runtime.utilities.MarkdownUtils.extractFrontMatterWithContent(ep),
      eh: any = eg.data,
      ef: any = !1 !== eh.enabled,
      em: any =
        (ec = ed && ed.length > 0 ? ed : this.parseGlobs(eh)) && ec.length > 0,
      eE: any = !0 === eh.alwaysApply || (!em && !1 !== eh.alwaysApply);
    return {
      filePath: eA,
      scope: eu,
      type: !eE && em ? eH.MemoryType.MANUAL : eH.MemoryType.ALWAYS,
      content: eg.content,
      enabled: ef,
      globs: ec,
      alwaysApply: eE,
      importedFrom: [],
    };
  }
  parseGlobs(eA: any): any {
    if (!eA.paths) return;
    let el: any = this.runtime.utilities.MarkdownUtils.parseListField(eA.paths);
    return el.length > 0 ? el : void 0;
  }
}
// UTF-16 9323568..9323772
export class MemoryCacheImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  async getOrLoad(eA: any): Promise<any> {
    return (
      this.cache ||
        (this.logger.debug("Memory cache miss, loading memories..."),
        (this.cache = eA())),
      this.cache
    );
  }
  clear(): any {
    (this.logger.debug("Clearing memory cache"), (this.cache = void 0));
  }
}
// UTF-16 9324564..9324969
export class MemoryValidatorImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  validate(eA: any, el: any): any {
    let { isImported: ec = !1, isSubdirectory: eu = !1 } = el || {};
    return (
      (!!ec || !1 !== eA.enabled) &&
      (!!ec ||
        !!eu ||
        !1 !== eA.alwaysApply ||
        (!!eA.globs && 0 !== eA.globs.length)) &&
      (!(eA.content.length > eH.MAX_MEMORY_FILE_SIZE) ||
        (this.logger
          .error(`Rule file exceeds maximum size (${eA.content.length} > ${eH.MAX_MEMORY_FILE_SIZE}): ${eA.filePath}
Suggestion: Split into multiple files or use @import syntax`),
        !1))
    );
  }
}
// UTF-16 9325634..9326091
export class GlobMatcherImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  matches(eA: any, el: any): any {
    let ec: any = this.runtime.utilities.GlobUtils.normalizePath(eA),
      eu: any = this.getRelativePath(ec);
    for (let eA of el) if (this.matchSingleGlob(ec, eu, eA)) return !0;
    return !1;
  }
  matchSingleGlob(eA: any, el: any, ec: any): any {
    let eu: any = this.runtime.utilities.GlobUtils.normalizePath(ec);
    return eY.isAbsolute(eu)
      ? this.runtime.utilities.GlobUtils.match(eA, eu, { matchBase: !0 })
      : !el.startsWith("..") &&
          this.runtime.utilities.GlobUtils.match(el, eu, { matchBase: !0 });
  }
  getRelativePath(eA: any): any {
    let el: any = eY.relative(
      this.runtime.utilities.PathUtils.getWorkDir(),
      eA,
    );
    return this.runtime.utilities.GlobUtils.normalizePath(el);
  }
}
// UTF-16 9327165..9329952
export class SubdirectoryMemoryLoaderImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
    ((this.chainCache = new LRUCache({ max: 200 })),
      (this.dirCache = new LRUCache({ max: 200 })),
      (this.fileCache = new LRUCache({ max: 100 })));
  }
  initialize(): any {
    this.logger.setContext("SubdirectoryMemoryLoader");
  }
  async loadForPaths(eA: any): Promise<any> {
    let el: any = this.runtime.utilities.PathUtils.getWorkDir(),
      ec: any = [],
      eu: any = new Set();
    for (let ed of eA)
      for (let eA of await this.loadForDirectory((0, eY.dirname)(ed), el))
        eu.has(eA.filePath) || (eu.add(eA.filePath), ec.push(eA));
    if (ec.length > 0) {
      let el: any = eA.join(", "),
        eu: any = ec
          .map(
            (eA: any) => `${eA.filePath} (globs: [${eA?.globs?.join(", ")}])`,
          )
          .join("\n  ");
      this.logger
        .info(`Loaded ${ec.length} subdirectory memories for paths [${el}]:
  ${eu}`);
    }
    return ec;
  }
  clear(): any {
    (this.chainCache.clear(),
      this.dirCache.clear(),
      this.fileCache.clear(),
      this.logger.info("Subdirectory memory cache cleared"));
  }
  async loadForDirectory(eA: any, el: any): Promise<any> {
    if (!this.isSubPath(eA, el) || this.isInsideCodeBuddyDir(eA, el)) return [];
    let ec: any = this.chainCache.get(eA);
    if (void 0 !== ec) return ec;
    let eu: any = [],
      ed: any = eA;
    for (; this.isSubPath(ed, el) && !this.isInsideCodeBuddyDir(ed, el); ) {
      let eA: any = await this.loadDirMemory(ed, el);
      eA && eu.push(eA);
      let ec: any = (0, eY.dirname)(ed);
      if (ec === ed) break;
      ed = ec;
    }
    return (this.chainCache.set(eA, eu), eu);
  }
  async loadDirMemory(eA: any, el: any): Promise<any> {
    let ec: any = this.dirCache.get(eA);
    if (void 0 !== ec) return ec === e4 ? void 0 : ec;
    let eu: any = await this.findMemoryFile(eA);
    if (!eu) return void this.dirCache.set(eA, e4);
    let ed: any = this.fileCache.get(eu);
    if (ed) return (this.dirCache.set(eA, ed), ed);
    try {
      let ec: any = (0, eY.relative)(el, eA).replace(/\\/g, "/"),
        ed: any = await this.parser.parse(eu, {
          scope: eH.MemoryScope.PROJECT,
        });
      if (
        ((ed.globs = this.resolveGlobs(ed.globs, ec)),
        !this.validator.validate(ed, { isSubdirectory: !0 }))
      ) {
        (this.logger.info(`Subdirectory memory validation failed: ${eu}`),
          this.dirCache.set(eA, e4));
        return;
      }
      return (
        this.fileCache.set(eu, ed),
        this.dirCache.set(eA, ed),
        this.logger.info(
          `Loaded subdirectory memory: ${eu}, globs: [${ed.globs.join(", ")}]`,
        ),
        ed
      );
    } catch (eA: any) {
      this.logger.warn(`Failed to parse subdirectory memory file ${eu}:`, eA);
      return;
    }
  }
  resolveGlobs(eA: any, el: any): any {
    let ec: any = el ? `${el}/**` : "**";
    if (!eA || 0 === eA.length) return [ec];
    let eu: any = eA
      .map((eA: any) => this.resolveGlobToWorkDir(eA, el))
      .filter(
        (eA: any) =>
          void 0 !== eA && this.runtime.utilities.GlobUtils.isValidPattern(eA),
      );
    return eu.length > 0 ? eu : [ec];
  }
  resolveGlobToWorkDir(eA: any, el: any): any {
    if (!eA || !eA.trim()) return;
    let ec: any = !1,
      eu: any = eA.trim();
    if (
      (eu.startsWith("!") && ((ec = !0), (eu = eu.slice(1))),
      (0, eY.isAbsolute)(eu))
    )
      return eA;
    if (
      eu.startsWith("..") ||
      ((eu.startsWith("./") || eu.startsWith(".\\")) && (eu = eu.slice(2)), !eu)
    )
      return;
    let ed: any = el ? `${el}/${eu}` : eu;
    return ec ? `!${ed}` : ed;
  }
  async findMemoryFile(eA: any): Promise<any> {
    for (let el of [
      (0, eY.join)(eA, eH.MEMORY_FILENAME),
      (0, eY.join)(eA, eH.MEMORY_FILENAME_MDC),
    ])
      try {
        if ((await (0, this.runtime.fs.stat)(el)).isFile()) return el;
      } catch {}
  }
  isSubPath(eA: any, el: any): any {
    return this.runtime.utilities.PathUtils.isPathInside(eA, el);
  }
  isInsideCodeBuddyDir(eA: any, el: any): any {
    let ec: any = (0, eY.join)(el, ".codebuddy");
    return eA === ec || this.runtime.utilities.PathUtils.isPathInside(eA, ec);
  }
}
// UTF-16 9331562..9332942
export class ConditionalRulesServiceImpl {
  [key: string]: any;
  constructor(readonly runtime: MemoryRulesRuntime) {
    Object.assign(this, runtime.dependencies);
  }
  async consume(eA: any): Promise<any> {
    if (0 === eA.pendingTriggers.size) return { content: "", matchedCount: 0 };
    let el: any = Array.from(eA.pendingTriggers),
      ec: any = await this.findMatchingRules(el, eA.processedRules);
    eA.pendingTriggers.clear();
    let eu: any = ec.length > 0 ? this.buildInjectionContent(ec) : "";
    return (
      ec.length > 0 &&
        this.logger.info(`Matched ${ec.length} conditional rules`),
      { content: eu, matchedCount: ec.length }
    );
  }
  async findMatchingRules(eA: any, el: any): Promise<any> {
    let ec: any = [
      ...(await this.memoryManager.get({ type: eH.MemoryType.MANUAL })),
      ...(await this.subdirLoader.loadForPaths(eA)),
    ].filter((eA: any) => !el.has(eA.filePath));
    if (0 === ec.length) return [];
    let eu: any = [];
    for (let ed of eA)
      for (let eA of ec)
        !el.has(eA.filePath) &&
          this.matchesRule(ed, eA) &&
          (eu.push(eA), el.add(eA.filePath));
    return eu;
  }
  buildInjectionContent(eA: any): any {
    if (0 === eA.length) return "";
    let el: any = eA
      .map(
        (eA: any) => `Contents of ${eA.filePath}:

${eA.content}`,
      )
      .join("\n\n\n");
    return `<system-reminder>
<rules>
The rules section has a number of possible rules/memories/context that you should consider. In each subsection, we provide instructions about what information the subsection contains and how you should consider/follow the contents of the subsection.
<conditional_workspace_rules description="These rules trigger based on file context.">
${el}
</conditional_workspace_rules>
</rules>
</system-reminder>
`;
  }
  matchesRule(eA: any, el: any): any {
    return (
      !!el.globs &&
      0 !== el.globs.length &&
      this.globMatcher.matches(eA, el.globs)
    );
  }
}
