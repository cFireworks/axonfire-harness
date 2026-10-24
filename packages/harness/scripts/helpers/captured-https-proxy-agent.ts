import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/runtime/native-https-proxy-agent.js";
export function loadCapturedHttpsProxyAgent(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.HTTPS_PROXY_AGENT_SHA256,
  );
  let output = emittedPrompt("runtime/native-https-proxy-agent");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeHttpsProxyAgent",
    ).declaration.body.body,
    props = body.find((n: any) => n.declarations?.[0]?.id?.name === "factories")
      .declarations[0].init.properties,
    edits = tree.body
      .filter((n: any) => n.type === "ExportNamedDeclaration")
      .map((n: any) => ({
        start: n.start,
        end: n.declaration.start,
        text: "",
      }));
  for (const [id, start, end] of native.HTTPS_PROXY_AGENT_MODULES) {
    const raw = cli.slice(start, end),
      original: any = (
        parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
      ).expression.properties[0],
      port = props.find((p: any) => p.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(original),
      "complete tracer factory " + id,
    );
    edits.push({ start: port.start, end: port.end, text: raw });
  }
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeHttpsProxyAgent;",
  )() as typeof native.createNativeHttpsProxyAgent;
}
