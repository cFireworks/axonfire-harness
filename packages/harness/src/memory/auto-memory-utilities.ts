import * as ef from "node:path";
export function createAutoMemoryUtilities(runtime: any) {
  const ep = runtime.fs;
  const ec = (id: number) => {
    if (id !== 35317) throw Error("Unmapped Git identity dependency");
    return runtime.childProcess;
  };
  class AutoMemoryGitUtils {
    static getGitUserName(): any {
      try {
        let { execSync: eA } = ec(35317);
        return (
          eA("git config user.name", {
            encoding: "utf-8",
            timeout: 5e3,
            stdio: ["pipe", "pipe", "pipe"],
          }).trim() || void 0
        );
      } catch {
        return;
      }
    }
  }
  class AutoMemoryPathUtils {
    static getWorkDir = runtime.getWorkDir;
    static getHomeDir = runtime.getHomeDir;
    static getCompressedWorkDir(): any {
      return this.compressPath(this.getWorkDir());
    }
    static compressPath(eA: any): any {
      return eA
        .replace(/[/\\:]/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
        .replace(/-+/g, "-");
    }
    static getProjectMemoryDir(eA: any): any {
      let el: any = eA ?? this.getCompressedWorkDir(),
        ec: any = (0, ef.join)(this.getHomeProjectsDir(), el, "memory"),
        eu: any = (0, ef.join)(this.getHomeMemoriesDir(), el);
      return !(0, ep.existsSync)(ec) && (0, ep.existsSync)(eu) ? eu : ec;
    }
    static getGlobalMemoryDir(): any {
      return (0, ef.join)(this.getHomeMemoriesDir(), "global");
    }
    static getTeamMemoryDir(eA: any): any {
      return (0, ef.join)(this.getProjectHomeDir(), "memories", `@${eA}`);
    }
    static getSessionHistoryDir(eA: any): any {
      return (0, ef.join)(
        this.getHomeProjectsDir(),
        eA ?? this.getCompressedWorkDir(),
        "sessions",
      );
    }
    static getHomeMemoriesDir(): any {
      return (0, ef.join)(this.getHomeDir(), "memories");
    }
    static getHomeProjectsDir(): any {
      return (0, ef.join)(this.getHomeDir(), "projects");
    }
    static getProjectHomeDir(): any {
      return (0, ef.join)(this.getWorkDir(), ".codebuddy");
    }
  }
  class MemoryMessageUtils {
    static addSystemReminder = runtime.addSystemReminder;
    static findFirstUserMessage(eA: any): any {
      return eA.find((eA: any) => "message" === eA.type && "user" === eA.role);
    }
    static firstUserMessageContainsRole(eA: any, el: any): any {
      let ec: any = this.findFirstUserMessage(eA);
      if (!ec) return !1;
      let eu: any = `data-role="${el}"`,
        ed: any = ec.content;
      if ("string" == typeof ed) return ed.includes(eu);
      if (Array.isArray(ed)) {
        for (let eA of ed)
          if (
            "input_text" === eA.type &&
            "string" == typeof eA.text &&
            eA.text.includes(eu)
          )
            return !0;
      }
      return !1;
    }
  }
  return {
    PathUtils: AutoMemoryPathUtils,
    MessageUtils: MemoryMessageUtils,
    GitUtils: AutoMemoryGitUtils,
  };
}
