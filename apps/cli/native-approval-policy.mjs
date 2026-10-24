export function configureNativeApprovalTimeout(args, env) {
  // Print mode has no approval UI. Use the recovered queue's own timeout and
  // cleanup path, rather than leaving unattended sandbox escalation pending.
  if (
    args.some((arg) => arg === "-p" || arg === "--print") &&
    !args.includes("--serve") && !args.includes("--acp") &&
    !args.some((arg, index) =>
      arg === "--input-format=stream-json" ||
      (arg === "--input-format" && args[index + 1] === "stream-json"),
    )
  )
    env.CBC_SANDBOX_APPROVAL_TIMEOUT_MS ??= "100";

}
