import { readFile, mkdir, copyFile, cp, chmod } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = join(root, "vendor/native-assets");
const target = join(root, "dist/native-product");
const manifest = JSON.parse(await readFile(join(source, "manifest.json"), "utf8"));
for (const entry of manifest.files) {
  const bytes = await readFile(join(source, entry.path));
  if (
    bytes.length !== entry.bytes ||
    createHash("sha256").update(bytes).digest("hex") !== entry.sha256
  )
    throw new Error(`Native resource checksum mismatch: ${entry.path}`);
  const destination = join(target, entry.path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(source, entry.path), destination);
  if (entry.executable) await chmod(destination, 0o755);
}
for (const name of [
  "product.json",
  "product.internal.json",
  "product.ioa.json",
  "product.cloudhosted.json",
  "product.selfhosted.json",
])
  await copyFile(join(root, "config/original", name), join(target, name));
await cp(join(root, "vendor/shim"), join(target, "vendor/shim"), { recursive: true });
for (const name of ["rm", "rmdir", "unlink"])
  await chmod(join(target, "vendor/shim/safe-bin", name), 0o755);
// Factory 41936 selects the first existing directory, including the product root.
// Keep the captured dist/wasm layout and provide root aliases without editing it.
for (const name of ["tree-sitter.wasm", "tree-sitter-bash.wasm"])
  await copyFile(join(target, "dist/wasm", name), join(target, name));
console.log("Staged original product resources, parser WASM, shims and captured macOS arm64 binaries.");
