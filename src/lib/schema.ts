// Applied at every server start (src/instrumentation.ts), so it must stay idempotent.
// Schema changes later: add idempotent statements here (e.g. ALTER TABLE ... ADD COLUMN IF NOT EXISTS).
const SCHEMA = `
CREATE TABLE IF NOT EXISTS volunteers (
  id serial PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS volunteers_name_uniq ON volunteers (lower(first_name), lower(last_name));
-- ISO weekdays the volunteer is expected on: 1 = Monday ... 7 = Sunday.
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS weekdays smallint[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}';

CREATE TABLE IF NOT EXISTS attendances (
  volunteer_id int NOT NULL REFERENCES volunteers(id),
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (volunteer_id, date)
);

CREATE TABLE IF NOT EXISTS groups (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS groups_name_uniq ON groups (lower(name));

CREATE TABLE IF NOT EXISTS group_members (
  group_id int NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  volunteer_id int NOT NULL REFERENCES volunteers(id),
  PRIMARY KEY (group_id, volunteer_id)
);
`;

export async function applySchema(sql: { unsafe: (query: string) => PromiseLike<unknown> }): Promise<void> {
  await sql.unsafe(SCHEMA);
}
