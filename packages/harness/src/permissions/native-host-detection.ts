/** Original module 75753, with process access explicitly scoped to this host. */
export function createNativeHostDetection(
  runtime: { env?: NodeJS.ProcessEnv; argv?: string[] } = {},
) {
  const process = {
    env: runtime.env ?? globalThis.process.env,
    argv: runtime.argv ?? globalThis.process.argv,
  };
  let eu: any;
  function getHostName(): any {
    return (void 0 === eu && (eu = detectHost()), eu);
  }
  function isWorkBuddyDesktop(): any {
    return "workbuddy-desktop" === getHostName();
  }
  function __resetHostDetectionCache(): any {
    eu = void 0;
  }
  function detectHost(): any {
    if ("workbuddy-desktop" === process.env.CODEBUDDY_HOST)
      return "workbuddy-desktop";
    let eA: any = process.argv;
    return eA.includes("--acp")
      ? "vscode-acp"
      : eA.includes("--serve")
        ? "web-ui"
        : "cli";
  }
  return {
    getHostName,
    isWorkBuddyDesktop,
    __resetHostDetectionCache,
    detectHost,
  };
}
