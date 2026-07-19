-- ═══════════════════════════════════════════════════════════════════════════
--  PRECIOS EN VARIAS MONEDAS — XenderBigShop
--
--  Precios LOCALES FIJOS por mercado, no conversión automática.
--
--  POR QUÉ ASÍ
--  Convertir sin más un precio pensado para Europa deja al comerciante
--  africano fuera de mercado: $40/mes son ~26.000 FCFA, entre un quinto y un
--  cuarto de un salario medio mensual en Camerún. Por eso cada moneda lleva
--  su propia cifra, redonda y creíble en su mercado. Es lo que hacen Netflix
--  o Spotify: no convierten, fijan precio por país.
--
--  Las cifras son una PROPUESTA DE PARTIDA. Cámbialas desde el editor SQL:
--  la web las lee de aquí, no del código, así que no hace falta desplegar.
--
--  Ejecutar en: Supabase → SQL Editor
--
--  ── NOTA SOBRE LA VERSIÓN ANTERIOR ──────────────────────────────────────
--  La primera versión de este archivo traía una sección que añadía una
--  columna `pair` a exchange_rates. Estaba mal por tres motivos:
--    1. exchange_rates YA modela los pares como from_curr/to_curr, y tiene
--       27 filas cargadas y en uso. Añadir `pair` habría dejado la tabla con
--       dos representaciones del mismo dato y ninguna autoritativa.
--    2. `ON CONFLICT (pair)` contra un índice único PARCIAL falla con 42P10
--       si no se repite el predicado — habría abortado la transacción entera.
--    3. BigShop no lee exchange_rates en absoluto: los precios son fijos por
--       mercado, no convertidos. La sección no servía para nada.
--  Eliminada. exchange_rates se queda como está.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Precios de los planes, uno por moneda ──────────────────────────────
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

-- ── 2. Tarifa de partida ──────────────────────────────────────────────────
-- USD y EUR: el nivel que definió Christian.
-- FCFA: deliberadamente MÁS BAJO. No es una conversión, es precio de mercado.
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

-- ── 3. Permisos ───────────────────────────────────────────────────────────
-- Los precios son información pública: cualquiera puede leerlos, nadie puede
-- cambiarlos desde el navegador. Escribir requiere la service_role key.
ALTER TABLE plan_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precios visibles para todos" ON plan_prices;
CREATE POLICY "precios visibles para todos"
  ON plan_prices FOR SELECT TO anon, authenticated USING (true);

-- NOTA: la versión anterior también activaba RLS sobre exchange_rates. Lo he
-- quitado a propósito: esa tabla tiene filas con source='manual' y 'ecb', o
-- sea que algo las escribe. Si ese algo usa la clave anon, activar RLS
-- rompería las actualizaciones de tipos EN SILENCIO. Antes de blindarla hay
-- que averiguar quién escribe ahí. Es un cambio aparte, no de esta migración.

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
--  COMPROBAR QUE HA FUNCIONADO
--
--    SELECT plan, currency, amount FROM plan_prices ORDER BY sort_order, currency;
--      → deben salir 16 filas (4 planes x 4 monedas)
--
--  CÓMO CAMBIAR UN PRECIO DESPUÉS
--
--    UPDATE plan_prices SET amount = 12000, updated_at = now()
--    WHERE plan = 'starter' AND currency = 'XAF';
--
--  La web lo coge en cuanto alguien recargue. Sin tocar código ni desplegar.
-- ═══════════════════════════════════════════════════════════════════════════
