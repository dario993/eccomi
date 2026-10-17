CREATE TABLE volunteers (
  id serial PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX volunteers_name_uniq ON volunteers (lower(first_name), lower(last_name));

CREATE TABLE attendances (
  volunteer_id int NOT NULL REFERENCES volunteers(id),
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (volunteer_id, date)
);
