import { CRON_EXPIRY_MS, DEFAULT_JITTER_CONFIG, type CronJitterConfig, type ScheduledTask } from "./cron-types.js";

export type ParsedCron = { minute: number[]; hour: number[]; dayOfMonth: number[]; month: number[]; dayOfWeek: number[] };
const bounds = [{ min: 0, max: 59 }, { min: 0, max: 23 }, { min: 1, max: 31 }, { min: 1, max: 12 }, { min: 0, max: 6 }];
/** Deliberately preserves parseInt-prefix acceptance in the captured parser. */
export function parseField(field: string, range: { min: number; max: number }): number[] | null {
  if (field === "*") return Array.from({ length: range.max - range.min + 1 }, (_, index) => range.min + index);
  if (field.startsWith("*/")) { const step = parseInt(field.slice(2), 10); if (isNaN(step) || step <= 0) return null; const values: number[] = []; for (let value = range.min; value <= range.max; value += step) values.push(value); return values; }
  const values: number[] = [];
  for (const item of field.split(",")) {
    const match = item.match(/^(\d+)-(\d+)(\/(\d+))?$/);
    if (match) {
      const first = parseInt(match[1]!, 10), last = parseInt(match[2]!, 10), step = match[4] ? parseInt(match[4], 10) : 1;
      if (first < range.min || last > range.max || first > last || step <= 0) return null;
      for (let value = first; value <= last; value += step) values.push(value);
    } else { let value = parseInt(item, 10); if (isNaN(value)) return null; if (range.max === 6 && value === 7) value = 0; if (value < range.min || value > range.max) return null; values.push(value); }
  }
  return values.length ? [...new Set(values)].sort((left, right) => left - right) : null;
}
export function parseCron(expression: string): ParsedCron | null {
  const fields = expression.trim().split(/\s+/); if (fields.length !== 5) return null;
  const values: number[][] = [];
  for (let index = 0; index < 5; index++) { const value = parseField(fields[index]!, bounds[index]!); if (!value) return null; values.push(value); }
  return { minute: values[0]!, hour: values[1]!, dayOfMonth: values[2]!, month: values[3]!, dayOfWeek: values[4]! };
}
export function getNextFireTime(cron: ParsedCron, after: Date): Date | null {
  const date = new Date(after.getTime()); date.setSeconds(0, 0); date.setMinutes(date.getMinutes() + 1);
  const months = new Set(cron.month), days = new Set(cron.dayOfMonth), weekdays = new Set(cron.dayOfWeek), hours = new Set(cron.hour), minutes = new Set(cron.minute), allDays = cron.dayOfMonth.length === 31, allWeekdays = cron.dayOfWeek.length === 7;
  for (let iteration = 0; iteration < 527040; iteration++) {
    if (!months.has(date.getMonth() + 1)) { date.setMonth(date.getMonth() + 1, 1); date.setHours(0, 0, 0, 0); continue; }
    const day = date.getDate(), weekday = date.getDay();
    if (!(allDays && allWeekdays || (allDays ? weekdays.has(weekday) : allWeekdays ? days.has(day) : days.has(day) || weekdays.has(weekday)))) { date.setDate(date.getDate() + 1); date.setHours(0, 0, 0, 0); continue; }
    if (!hours.has(date.getHours())) { date.setHours(date.getHours() + 1, 0, 0, 0); continue; }
    if (!minutes.has(date.getMinutes())) { date.setMinutes(date.getMinutes() + 1, 0, 0); continue; }
    return date;
  }
  return null;
}
export function getNextFireTimestamp(expression: string, after: number): number | null { const cron = parseCron(expression); if (!cron) return null; return getNextFireTime(cron, new Date(after))?.getTime() ?? null; }
export function deterministicFraction(id: string): number { const fraction = parseInt(id.slice(0, 8), 16) / 0x100000000; return Number.isFinite(fraction) ? fraction : 0; }
export function getRecurringFireTime(expression: string, after: number, id: string, config: CronJitterConfig = DEFAULT_JITTER_CONFIG): number | null {
  const next = getNextFireTimestamp(expression, after); if (next === null) return null;
  const following = getNextFireTimestamp(expression, next); if (following === null) return next;
  return next + Math.min(deterministicFraction(id) * config.recurringFrac * (following - next), config.recurringCapMs);
}
export function getOneShotFireTime(expression: string, after: number, id: string, config: CronJitterConfig = DEFAULT_JITTER_CONFIG): number | null {
  const next = getNextFireTimestamp(expression, after); if (next === null) return null;
  return new Date(next).getMinutes() % config.oneShotMinuteMod !== 0 ? next : Math.max(next - (config.oneShotFloorMs + deterministicFraction(id) * (config.oneShotMaxMs - config.oneShotFloorMs)), after);
}
export function humanSchedule(expression: string): string {
  const cron = parseCron(expression); if (!cron) return expression;
  const { minute, hour, dayOfMonth, month, dayOfWeek } = cron, allMinutes = minute.length === 60, allHours = hour.length === 24, allDays = dayOfMonth.length === 31, allMonths = month.length === 12, allWeekdays = dayOfWeek.length === 7;
  if (!allMinutes && allHours && allDays && allMonths && allWeekdays) { const match = expression.trim().split(/\s+/)[0]!.match(/^\*\/(\d+)$/); if (match) return `Every ${match[1]} minutes`; if (minute.length === 1 && minute[0] === 0) return "Every hour"; }
  if (minute.length === 1 && !allHours && allDays && allMonths && allWeekdays) { const match = expression.trim().split(/\s+/)[1]!.match(/^\*\/(\d+)$/); if (match) return `Every ${match[1]} hours`; }
  const time = () => `${hour[0]! % 12 || 12}:${String(minute[0]).padStart(2, "0")} ${hour[0]! >= 12 ? "PM" : "AM"}`;
  if (minute.length === 1 && hour.length === 1 && allDays && allMonths && allWeekdays) return `Every day at ${time()}`;
  if (minute.length === 1 && hour.length === 1 && allDays && allMonths && dayOfWeek.length === 5 && dayOfWeek[0] === 1 && dayOfWeek[4] === 5) return `Weekdays at ${time()}`;
  return expression;
}
export function isExpired(task: ScheduledTask, now = Date.now()): boolean { return Boolean(task.recurring && !task.permanent && now - task.createdAt >= CRON_EXPIRY_MS); }
export function detectMissedTasks(tasks: ScheduledTask[], now: number): ScheduledTask[] { return tasks.filter((task) => { const next = getNextFireTimestamp(task.cron, task.lastFiredAt ?? task.createdAt); return next !== null && next < now; }); }
