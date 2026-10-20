// @ts-nocheck
// Original filesystem concurrency helpers, fixed UTF-16 13060973..13061415.
export function createNativePluginConcurrency(env = {}) {
  const process = { env };
  function getPositiveIntegerEnv(eA, el) {
    let ec = process.env[eA];
    if (!ec) return el;
    let eu = Number.parseInt(ec, 10);
    return !Number.isFinite(eu) || eu <= 0 ? el : eu;
  }
  async function mapWithConcurrency(eA, el, ec) {
    if (0 === eA.length) return [];
    let eu = Math.max(1, Math.min(Math.floor(el) || 1, eA.length)),
      ed = Array(eA.length),
      ep = 0,
      eg = Array.from({ length: eu }, async () => {
        for (;;) {
          let el = ep++;
          if (el >= eA.length) return;
          ed[el] = await ec(eA[el], el);
        }
      });
    return (await Promise.all(eg), ed);
  }
  return {
    getPositiveIntegerEnv,
    mapWithConcurrency,
    DEFAULT_FS_CONCURRENCY: 32,
    DEFAULT_PLUGIN_COMPONENT_CONCURRENCY: 32,
  };
}
