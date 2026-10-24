import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse, tokenizer } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import {
  AGENT_RUN_REGISTRATION_SHA256,
  NATIVE_AGENT_RUN_REGISTRATIONS,
  NATIVE_AGENT_SERVICE_REGISTRATION,
} from "../../src/agents/native-agent-run-registration.js";
import {
  WORKTREE_CONTEXT_DECLARATION,
  createNativeWorktreeContext,
} from "../../src/agents/native-worktree-context.js";

const member = (node: any) => {
  if (node?.type === "SequenceExpression")
    return member(node.expressions.at(-1));
  return node?.type === "MemberExpression" ? node.property.name : undefined;
};
/** Parse the enclosing original modules; never execute decorators or bootstrap. */
export function verifyCapturedAgentRunRegistration(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    AGENT_RUN_REGISTRATION_SHA256,
  );
  let propertyCount = 0,
    lifecycleCount = 0;
  const registrations: any[] = [];
  for (const id of [59233, 66545]) {
    const start = cli.indexOf("," + id + "(") + 1;
    assert.ok(start > 0);
    const tokens = tokenizer(cli.slice(start), { ecmaVersion: "latest" });
    let depth = 0,
      end = 0;
    for (;;) {
      const token = tokens.getToken();
      assert.notEqual(token.type.label, "eof");
      if (["{", "${"].includes(token.type.label)) depth++;
      if (token.type.label === "}" && --depth === 0) {
        end = start + token.end;
        break;
      }
    }
    const root: any = (
      parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0].value.body;
    const nodes = nodesOf(root),
      aliases = new Map<string, number>();
    for (const declaration of root.body
      .filter((n: any) => n.type === "VariableDeclaration")
      .flatMap((n: any) => n.declarations))
      if (
        declaration.init?.type === "CallExpression" &&
        declaration.init.callee.name === "ec" &&
        declaration.init.arguments[0]?.type === "Literal"
      )
        aliases.set(declaration.id.name, declaration.init.arguments[0].value);
    const expected = [
      ...NATIVE_AGENT_RUN_REGISTRATIONS,
      NATIVE_AGENT_SERVICE_REGISTRATION,
    ].filter((entry) => entry.sourceModule === id);
    for (const entry of expected) {
      const registration: any = nodes.find(
        (n: any) =>
          n.start + start - 2 === entry.registrationRange[0] &&
          n.end + start - 2 === entry.registrationRange[1],
      );
      assert.equal(registration?.type, "AssignmentExpression", entry.name);
      assert.equal(registration.left.name, entry.local);
      const component = registration.right.arguments[0].elements.find(
        (n: any) => member(n.callee) === "Component",
      );
      assert.equal(
        component.arguments[0].property.name,
        entry === NATIVE_AGENT_SERVICE_REGISTRATION
          ? "AgentService"
          : "AgentRunInterceptor",
      );
      assert.equal(aliases.get(component.arguments[0].object.name), 69466);
      const properties: any[] = [],
        lifecycle: any[] = [];
      for (const call of nodes.filter(
        (n: any) =>
          n.type === "CallExpression" &&
          n.arguments[0]?.type === "ArrayExpression" &&
          n.arguments[1]?.type === "MemberExpression" &&
          n.arguments[1].object.name === entry.local &&
          n.arguments[1].property.name === "prototype",
      )) {
        const decorators = call.arguments[0].elements;
        const injection = decorators.find((n: any) =>
          ["Autowired", "AutowiredProvider"].includes(member(n.callee)),
        );
        if (injection) {
          const token = injection.arguments[0];
          properties.push({
            property: call.arguments[2].value,
            tokenModule: aliases.get(token.object.name),
            tokenExport: token.property.name,
            kind: member(injection.callee),
            optional: decorators.some(
              (n: any) => member(n.callee) === "Optional",
            ),
            lazy: decorators.some((n: any) => member(n.callee) === "Lazy"),
            sourceRange: [
              call.arguments[0].start + start - 2,
              call.arguments[2].end + start - 2,
            ],
          });
        }
        if (decorators.some((n: any) => member(n.callee) === "PostConstruct"))
          lifecycle.push({
            method: call.arguments[2].value,
            kind: "PostConstruct",
            sourceRange: [call.start + start - 2, call.end + start - 2],
          });
      }
      assert.deepEqual(
        properties,
        entry.properties,
        entry.name + " complete property injection",
      );
      assert.deepEqual(
        lifecycle,
        entry.lifecycle,
        entry.name + " complete lifecycle",
      );
      propertyCount += properties.length;
      lifecycleCount += lifecycle.length;
    }
    for (const assignment of nodes.filter(
      (n: any) =>
        n.type === "AssignmentExpression" &&
        n.right?.type === "CallExpression" &&
        n.right.arguments[0]?.type === "ArrayExpression",
    )) {
      const component = assignment.right.arguments[0].elements.find(
        (n: any) =>
          member(n.callee) === "Component" &&
          n.arguments[0]?.property?.name === "AgentRunInterceptor",
      );
      if (component)
        registrations.push([
          id,
          assignment.left.name,
          assignment.start + start - 2,
          assignment.end + start - 2,
        ]);
    }
  }
  assert.deepEqual(
    registrations,
    NATIVE_AGENT_RUN_REGISTRATIONS.map((e) => [
      e.sourceModule,
      e.local,
      ...e.registrationRange,
    ]),
    "complete registration set in dependency/local source order",
  );
  // Also guard against additional token registrations outside these two modules.
  assert.equal(
    [...cli.matchAll(/\(0,\w+\.Component\)\(\w+\.AgentRunInterceptor\)/g)]
      .length,
    registrations.length,
  );
  let output = emittedPrompt("agents/native-worktree-context");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const nodes = nodesOf(tree);
  const port = nodes.find(
    (n: any) =>
      n.type === "VariableDeclaration" && n.declarations[0]?.id.name === "em",
  );
  const [start, end] = WORKTREE_CONTEXT_DECLARATION;
  assert.deepEqual(
    cleanAst(port),
    cleanAst(parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0]),
    "full Worktree declaration",
  );
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  edits.push({ start: port.start, end: port.end, text: cli.slice(start, end) });
  for (const edit of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return {
    registrations: registrations.length,
    properties: propertyCount,
    lifecycle: lifecycleCount,
    worktreeFactory: Function(
      output + "\nreturn createNativeWorktreeContext;",
    )() as typeof createNativeWorktreeContext,
  };
}
