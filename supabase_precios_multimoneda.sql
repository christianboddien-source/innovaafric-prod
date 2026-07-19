-- ═══════════════════════════════════════════════════════════════════════════
--  PRECIOS EN VARIAS MONEDAS — XenderBigShop
--
--  Precios LOCALES FIJOS por mercado, no conversión automática.
--
--  POR QUÉ ASÍ
--  El franco CFA está fijado al euro por ley: 1 EUR = 655,957 FCFA, y no
--  fluctúa. Pero convertir sin más un precio pensado para Europa deja al
--  comerciante africano fuera de mercado: $40/mes son ~26.000 FCFA, entre un
--  quinto y un cuarto de un salario medio mensual en Camerún.
--
--  Por eso cada moneda lleva su propia cifra, redonda y creíble en su
--  mercado. Es lo que hacen Netflix o Spotify: no convierten, fijan precio
--  por país.
--
--  Las cifras de abajo son una PROPUESTA DE PARTIDA. Cámbialas a tu gusto
--  desde el editor SQL o desde el panel: la web las lee de aquí, no del
--  código, así que no hace falta desplegar nada.
--
--  Ejecutar en: Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Arreglar exchange_rates ────────────────────────────────────────────
-- La tabla existe pero solo tiene id, rate y created_at. El archivo
-- supabase_exchange_rates.sql intenta insertar una columna `pair` que no
-- existe, así que nunca llegó a ejecutarse.
ALTER TABLE exchange_rates ADD COLUMN IF NOT EXISTS pair       TEXT;
ALTER TABLE exchange_rates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE exchange_rates ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS exchange_rates_pair_key
  ON exchange_rates(pair) WHERE pair IS NOT NULL;

-- Paridades. Las del CFA son FIJAS POR LEY y no hay que actualizarlas nunca.
-- Las que llevan USD o GBP sí fluctúan: conviene refrescarlas de vez en cuando.
INSERT INTO exchange_rates (pair, rate, updated_at) VALUES
  ('EUR-XAF', 655.957, now()),   -- fija por tratado, no tocar
  ('EUR-XOF', 655.957, now()),   -- fija por tratado, no tocar
  ('XAF-EUR', 0.00152449, now()),
  ('XOF-EUR', 0.00152449, now()),
  ('XAF-XOF', 1, now()),         -- misma paridad, intercambiables 1:1
  ('EUR-USD', 1.08, now()),      -- ⚠ fluctúa
  ('USD-EUR', 0.9259, now()),    -- ⚠ fluctúa
  ('USD-XAF', 607.4, now()),     -- ⚠ fluctúa (deriva de USD-EUR)
  ('USD-XOF', 607.4, now())      -- ⚠ fluctúa
ON CONFLICT (pair) DO UPDATE SET rate = EXCLUDED.rate, updated_at = now();

-- ── 2. Precios de los planes, uno por moneda ──────────────────────────────
CREATE TABLE IF NOT EXISTS plan_prices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan        TEXT NOT NULL,              -- starter | business | prime | enterprise
  currency    TEXT NOT NULL,              -- EUR | USD | XAF | XOF
  amount      NUMERIC(14,2) NOT NULL,     -- importe mensual en esa moneda
  -- Si el importe lleva decimales (39,99) se muestran; si no (15000), no.
  decimals    INTEGER DEFAULT 0,
  active      BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS plan_prices_plan_currency_key
  ON plan_prices(plan, currency);

-- ── 3. Tarifa de partida ──────────────────────────────────────────────────
-- USD y EUR: el nivel que definió Christian.
-- FCFA: deliberadamente MÁS BAJO. No es una conversión, es precio de mercado.
--       26.000 FCFA/mes (la conversión directa de $40) es inasumible para un
--       pequeño comercio en Duala o Abiyán.
INSERT INTO plan_prices (plan, currency, amount, decimals, sort_order) VALUES
  -- Starter
  ('starter',    'EUR',     39,     0, 1),
  ('starter',    'USD',     40,     0, 1),
  ('starter',    'XAF',  15000,     0, 1),
  ('starter',    'XOF',  15000,     0, 1),
  -- Business
  ('business',   'EUR',     69,     0, 2),
  ('business',   'USD',     70,     0, 2),
  ('business',   'XAF',  30000,     0, 2),
  ('business',   'XOF',  30000,     0, 2),
  -- Business Prime
  ('prime',      'EUR',    149,     0, 3),
  ('prime',      'USD',    150,     0, 3),
  ('prime',      'XAF',  65000,     0, 3),
  ('prime',      'XOF',  65000,     0, 3),
  -- Enterprise
  ('enterprise', 'EUR',    299,     0, 4),
  ('enterprise', 'USD',    300,     0, 4),
  ('enterprise', 'XAF', 150000,     0, 4),
  ('enterprise', 'XOF', 150000,     0, 4)
ON CONFLICT (plan, currency) DO UPDATE
  SET amount = EXCLUDED.amount, updated_at = now();

-- ── 4. Permisos ───────────────────────────────────────────────────────────
-- Los precios son información pública: cualquiera puede leerlos, nadie puede
-- cambiarlos desde el navegador. Escribir requiere la service_role key.
ALTER TABLE plan_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precios visibles para todos" ON plan_prices;
CREATE POLICY "precios visibles para todos"
  ON plan_prices FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tipos visibles para todos" ON exchange_rates;
CREATE POLICY "tipos visibles para todos"
  ON exchange_rates FOR SELECT TO anon, authenticated USING (true);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
--  CÓMO CAMBIAR UN PRECIO DESPUÉS
--
--    UPDATE plan_prices SET amount = 12000, updated_at = now()
--    WHERE plan = 'starter' AND currency = 'XAF';
--
--  La web lo coge en cuanto alguien recargue. No hay que tocar código ni
--  desplegar nada.
--
--  COMPROBAR QUE HA FUNCIONADO, desde la consola del navegador:
--    await SB.from('plan_prices').select('*').order('sort_order')
--      → deben salir 16 filas (4 planes x 4 monedas)
-- ═══════════════════════════════════════════════════════════════════════════
