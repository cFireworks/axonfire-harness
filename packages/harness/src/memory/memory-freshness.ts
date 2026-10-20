export function createMemoryFreshness(
  runtime: { now(): number } = { now: Date.now },
) {
  function memoryAgeDays(eA: any): any {
    return Math.max(0, Math.floor((runtime.now() - eA) / 864e5));
  }
  function memoryAge(eA: any): any {
    let el: any = memoryAgeDays(eA);
    return 0 === el ? "today" : 1 === el ? "yesterday" : `${el} days ago`;
  }
  function memoryFreshnessText(eA: any): any {
    let el: any = memoryAgeDays(eA);
    return el <= 1
      ? ""
      : `This memory is ${el} days old. Memories are point-in-time observations, not live state — claims about code behavior or file:line citations may be outdated. Verify against current code before asserting as fact.`;
  }
  function memoryFreshnessNote(eA: any): any {
    let el: any = memoryFreshnessText(eA);
    return el
      ? `<system-reminder data-role="memory-freshness">${el}</system-reminder>
`
      : "";
  }
  return { memoryAgeDays, memoryAge, memoryFreshnessText, memoryFreshnessNote };
}
export const {
  memoryAgeDays,
  memoryAge,
  memoryFreshnessText,
  memoryFreshnessNote,
} = createMemoryFreshness();
