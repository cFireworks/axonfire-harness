import { gzipSync } from "node:zlib";
export function ownedNpmPackage() {
  const entries: Record<string, string> = {
    "package/package.json": JSON.stringify({
      name: "owned-fixture",
      version: "1.0.0",
      scripts: {
        install:
          "node -e \"require('fs').writeFileSync('lifecycle-ran','owned')\"",
      },
    }),
    "package/.codebuddy-plugin/plugin.json": JSON.stringify({
      name: "npm-plugin",
      version: "1.0.0",
    }),
    "package/commands/echo.md":
      "---\ndescription: owned npm\n---\nowned npm prompt $ARGUMENTS",
    "package/agents/expert.md":
      "---\nname: npm-expert\ndescription: owned\n---\nowned npm expert",
  };
  const blocks: Buffer[] = [];
  for (const [name, text] of Object.entries(entries)) {
    const data = Buffer.from(text),
      header = Buffer.alloc(512);
    header.write(name, 0, 100, "utf8");
    header.write("0000644\0", 100, 8, "ascii");
    header.write("0000000\0", 108, 8, "ascii");
    header.write("0000000\0", 116, 8, "ascii");
    header.write(
      data.length.toString(8).padStart(11, "0") + "\0",
      124,
      12,
      "ascii",
    );
    header.write("00000000000\0", 136, 12, "ascii");
    header.fill(32, 148, 156);
    header[156] = 48;
    header.write("ustar\0", 257, 6, "ascii");
    header.write("00", 263, 2, "ascii");
    const sum = header.reduce((a, b) => a + b, 0);
    header.write(sum.toString(8).padStart(6, "0") + "\0 ", 148, 8, "ascii");
    blocks.push(header, data, Buffer.alloc((512 - (data.length % 512)) % 512));
  }
  return gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
}
