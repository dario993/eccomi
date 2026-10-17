import { addDays, isValidDate } from "./dates";

export type Range = { from: string; to: string };

export function parseRange(params: { from?: string; to?: string }, today: string): Range {
  const from = params.from;
  const to = params.to || from;
  if (!from || !to || !isValidDate(from) || !isValidDate(to)) return { from: today, to: today };
  return from <= to ? { from, to } : { from: to, to: from };
}

export function shortcutRange(kind: "today" | "week" | "month", today: string): Range {
  if (kind === "today") return { from: today, to: today };
  if (kind === "week") {
    const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
    const from = addDays(today, -weekday);
    return { from, to: addDays(from, 6) };
  }
  const from = `${today.slice(0, 7)}-01`;
  const nextMonth = addDays(from, 31).slice(0, 7);
  return { from, to: addDays(`${nextMonth}-01`, -1) };
}
