#!/usr/bin/env node
// Standalone host launcher, not a recovered WorkBuddy product component.
const args = process.argv.slice(2);
try {
  if (args[0] === "web") {
    const { main } = await import("../web/main.mjs");
    await main(args.slice(1));
  } else {
    if (args[0] === "chat") process.argv.splice(2, 1);
    await import("@axonfire/harness/cli.js");
  }
} catch (error) {
  console.error(
    `Axonfire: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
