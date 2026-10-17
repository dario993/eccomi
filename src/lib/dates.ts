// All dates are 'YYYY-MM-DD' strings; arithmetic is done in UTC so DST never shifts a day.

export function todayZurich(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(now);
}

const toUtc = (date: string) => new Date(`${date}T00:00:00Z`);
const fromUtc = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(date: string, n: number): string {
  const d = toUtc(date);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUtc(d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000) + 1;
}

export function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(toUtc(s).getTime()) && fromUtc(toUtc(s)) === s;
}

export function formatDateIt(date: string, style: "long" | "short"): string {
  if (style === "short") return `${date.slice(8, 10)}.${date.slice(5, 7)}`;
  return new Intl.DateTimeFormat("it-CH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(toUtc(date)).replace(",", "");
}
