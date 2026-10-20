/** Verification-only input; the original installation bundle is not distributed. */
export function getCapturedBundlePath(): string {
  const path = process.argv[2] ?? process.env.WORKBUDDY_BUNDLE;
  if (!path) throw new Error("Provide the captured WorkBuddy bundle path as an argument or WORKBUDDY_BUNDLE. See npm run verify:recovery.");
  return path;
}
