-- Esegui questo script una sola volta nel SQL Editor di Neon
-- dopo aver creato il progetto "segnalazioni".

CREATE TABLE IF NOT EXISTS negozi (
  id          BIGSERIAL PRIMARY KEY,
  negozio     TEXT NOT NULL DEFAULT '',
  sis         TEXT NOT NULL DEFAULT '',
  agenzia     TEXT NOT NULL DEFAULT '',
  telefono    TEXT NOT NULL DEFAULT '',
  mail        TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negozi_sort    ON negozi(sort_order, id);
CREATE INDEX IF NOT EXISTS idx_negozi_negozio ON negozi(negozio);
