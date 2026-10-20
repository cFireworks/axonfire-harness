import * as eY from "node:path";
import { MemoryMarkdownUtils } from "./native-memory-markdown.js";
export function createNativeMemoryScanner(
  runtime: any,
  parseMemorySemanticType: (value: any) => any,
) {
  const e$ = runtime.fsPromises,
    eJ = { MarkdownUtils: MemoryMarkdownUtils },
    tu = { parseMemorySemanticType },
    td = 200,
    tp = 4096,
    console = { warn: runtime.warn };
  function parseYamlFrontmatter(eA: any): any {
    try {
      return eJ.MarkdownUtils.extractFrontMatterWithContent(eA).data;
    } catch {
      return;
    }
  }
  async function readFileHead(eA: any, el: any, eu: any): Promise<any> {
    let ed: any = await Promise.resolve().then(() => runtime.fs),
      ep: any = await (0, e$.stat)(eA),
      eg: any = ep.mtimeMs;
    return 0 === ep.size
      ? { content: "", mtimeMs: eg }
      : new Promise((ec: any, eh: any) => {
          let ef: any = !1,
            em: any = [],
            eE: any = 0,
            eC: any = ed.createReadStream(eA, {
              start: 0,
              end: Math.min(el - 1, ep.size - 1),
              highWaterMark: el,
            }),
            onAbort: any = () => {
              (eC.destroy(),
                ef ||
                  ((ef = !0), eh(new DOMException("Aborted", "AbortError"))));
            };
          eu && eu.addEventListener("abort", onAbort, { once: !0 });
          let cleanup: any = () => {
            eu && eu.removeEventListener("abort", onAbort);
          };
          (eC.on("data", (eA: any) => {
            (em.push(eA), (eE += eA.length) >= el && eC.destroy());
          }),
            eC.on("end", () => {
              ef ||
                ((ef = !0),
                cleanup(),
                ec({
                  content: Buffer.concat(em).toString("utf-8"),
                  mtimeMs: eg,
                }));
            }),
            eC.on("error", (eA: any) => {
              ef || ((ef = !0), cleanup(), eh(eA));
            }),
            eC.on("close", () => {
              ef ||
                ((ef = !0),
                cleanup(),
                ec({
                  content: Buffer.concat(em).toString("utf-8"),
                  mtimeMs: eg,
                }));
            }));
        });
  }
  async function scanMemoryFiles(eA: any, el: any): Promise<any> {
    try {
      let ec: any = (await (0, e$.readdir)(eA, { recursive: !0 })).filter(
        (eA: any) => eA.endsWith(".md") && "MEMORY.md" !== (0, eY.basename)(eA),
      );
      return (
        await Promise.allSettled(
          ec.map(async (ec: any) => {
            if (el?.aborted) throw new DOMException("Aborted", "AbortError");
            let eu: any = (0, eY.join)(eA, ec),
              { content: ed, mtimeMs: ep } = await readFileHead(eu, tp, el),
              eg: any = parseYamlFrontmatter(ed);
            return {
              filename: ec,
              filePath: eu,
              mtimeMs: ep,
              description:
                "string" == typeof eg?.description ? eg.description : null,
              type: (0, tu.parseMemorySemanticType)(eg?.type),
              name: "string" == typeof eg?.name ? eg.name : null,
            };
          }),
        )
      )
        .filter((eA: any) => "fulfilled" === eA.status)
        .map((eA: any) => eA.value)
        .sort((eA: any, el: any) => el.mtimeMs - eA.mtimeMs)
        .slice(0, td);
    } catch (el: any) {
      return (
        "ENOENT" !== el.code &&
          console.warn(`[MemoryScanner] Error scanning ${eA}: ${el.message}`),
        []
      );
    }
  }
  function formatMemoryManifest(eA: any): any {
    return eA
      .map((eA: any) => {
        let el: any = eA.type ? `[${eA.type}] ` : "",
          ec: any = new Date(eA.mtimeMs).toISOString(),
          eu: any = eA.name ? `${eA.name}: ` : "";
        return eA.description
          ? `- ${el}${eA.filename} (${ec}): ${eu}${eA.description}`
          : `- ${el}${eA.filename} (${ec})${eu ? `: ${eu.slice(0, -2)}` : ""}`;
      })
      .join("\n");
  }
  return {
    readFileHead,
    scanMemoryFiles,
    formatMemoryManifest,
    parseYamlFrontmatter,
  };
}
