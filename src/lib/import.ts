export type NameEntry = { first_name: string; last_name: string };

/** One person per line: first word is the first name, the rest the last name. */
export function parseNameList(text: string): NameEntry[] {
  const seen = new Set<string>();
  const out: NameEntry[] = [];
  for (const line of text.split(/\r?\n/)) {
    const [first, ...rest] = line.trim().split(/\s+/);
    if (!first) continue;
    const entry = { first_name: first, last_name: rest.join(" ") };
    const key = `${entry.first_name} ${entry.last_name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}
