// Node host adaptation: original CLI code exits immediately after writing output.
// POSIX pipe writes are otherwise asynchronous and can be cut off by process.exit.
export function configureNativeStdio(process) {
  for (const stream of [process.stdout, process.stderr]) {
    if (!stream?.isTTY && typeof stream?._handle?.setBlocking === "function")
      stream._handle.setBlocking(true);
  }
}
