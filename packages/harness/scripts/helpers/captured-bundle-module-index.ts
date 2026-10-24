import assert from "node:assert/strict";
import { tokenizer } from "acorn";
/** Index only the top-level Rspack factory table; nested bundle IDs are separate scopes. */
export function capturedBundleModuleIndex(source: string) {
  const marker = "var __webpack_modules__=";
  const markerAt = source.indexOf(marker);
  assert.ok(markerAt >= 0, "captured module table must exist");
  const offset = markerAt + marker.length;
  const tokens = tokenizer(source.slice(offset), { ecmaVersion: "latest" });
  const index = new Map<number, { start: number; end: number }>();
  let depth = 0,
    expectKey = false;
  let current: { id: number; start: number } | undefined;
  for (;;) {
    const token = tokens.getToken(),
      label = token.type.label;
    assert.notEqual(label, "eof", "unterminated captured module table");
    if (depth === 1 && expectKey && label === "num") {
      current = {
        id: Number(source.slice(offset + token.start, offset + token.end)),
        start: offset + token.start,
      };
      expectKey = false;
    }
    if (label === "{" || label === "${") {
      depth++;
      if (depth === 1) expectKey = true;
    }
    if (label === "}") {
      depth--;
      if (depth === 1 && current) {
        assert.equal(
          index.has(current.id),
          false,
          "duplicate top-level factory",
        );
        index.set(current.id, {
          start: current.start,
          end: offset + token.end,
        });
        current = undefined;
      }
      if (depth === 0) break;
    }
    if (label === "," && depth === 1) expectKey = true;
  }
  return index;
}
