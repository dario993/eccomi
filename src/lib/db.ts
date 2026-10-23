import postgres from "postgres";

export type Volunteer = { id: number; first_name: string; last_name: string; active: boolean; group_ids: number[]; weekdays: number[] };
export type Group = { id: number; name: string };

// Keep `date` columns as 'YYYY-MM-DD' strings instead of JS Dates (avoids timezone shifts).
const create = () =>
  postgres(process.env.DATABASE_URL!, {
    onnotice: () => {},
    types: {
      date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x },
    },
  });

const g = globalThis as unknown as { __sql?: ReturnType<typeof create> };
export const sql = (g.__sql ??= create());
