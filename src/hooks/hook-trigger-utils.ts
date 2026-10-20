export function buildAgentTrigger(eA: any): any {
  if (!eA) return {};
  let el: any = {};
  return (
    eA.agentName && (el.agent_type = eA.agentName),
    eA.storeId && (el.agent_id = eA.storeId),
    el
  );
}
export function resolveHookSessionId(eA: any): any {
  if (eA) return eA.meta?.parentSessionId ?? eA.id;
}
