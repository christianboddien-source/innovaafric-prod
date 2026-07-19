-- ═══════════════════════════════════════════════════════════════════════════
--  TARIFAS DE ENTREGA EN VARIAS MONEDAS — XenderBigShop
--
--  Mismo criterio que plan_prices: precio LOCAL por mercado, no conversión.
--
--  POR QUÉ
--  Las tarifas estaban escritas a mano en euros dentro del modal de registro.
--  Un comerciante que elegía FCFA veía su plan en francos (15 000 FCFA/mes) y,
--  tres campos más abajo, el envío en euros (€4.99). Justo en el punto donde
--  decide si paga o se va.
--
--  Las cifras en CFA no son la conversión de 4,99 €/9,99 € (que serían ~3.270
--  y ~6.550). Siguen la misma proporción que ya se aplicó a los planes
--  —15 000 FCFA frente a 39 €, o sea ~385 FCFA por euro en vez de 655,957—
--  y encajan con el mercado real: una entrega en moto en Duala ronda los
--  1.000-2.000 FCFA.
--
--  'none' (recogida por el propio comerciante) es gratis y no vive aquí:
--  está fijado a 0 en el código, porque cero es cero en todas las monedas.
--
--  Ejecutar en: Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS delivery_prices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode        TEXT NOT NULL,              -- std | exp
  currency    TEXT NOT NULL,              -- EUR | USD | XAF | XOF
  amount      NUMERIC(14,2) NOT NULL,
  active      BOOLEAN DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS delivery_prices_mode_currency_key
  ON delivery_prices(mode, currency);

INSERT INTO delivery_prices (mode, currency, amount) VALUES
  -- Estándar, 3-5 días
  ('std', 'EUR',    4.99),
  ('std', 'USD',    5),
  ('std', 'XAF', 2000),
  ('std', 'XOF', 2000),
  -- Exprés, 24-48h
  ('exp', 'EUR',    9.99),
  ('exp', 'USD',   10),
  ('exp', 'XAF', 4000),
  ('exp', 'XOF', 4000)
ON CONFLICT (mode, currency) DO UPDATE
  SET amount = EXCLUDED.amount, updated_at = now();

-- Permisos: mismo modelo que plan_prices. Tarifa pública de lectura, escritura
-- solo con service_role. Verificado que la clave anon puede leer.
ALTER TABLE delivery_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tarifas de envio visibles para todos" ON delivery_prices;
CREATE POLICY "tarifas de envio visibles para todos"
  ON delivery_prices FOR SELECT TO anon, authenticated USING (true);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
--  COMPROBAR
--    SELECT mode, currency, amount FROM delivery_prices ORDER BY mode, currency;
--      → deben salir 8 filas (2 modos x 4 monedas)
--
--  CAMBIAR UNA TARIFA DESPUÉS (sin tocar código ni desplegar)
--    UPDATE delivery_prices SET amount = 2500, updated_at = now()
--    WHERE mode = 'std' AND currency = 'XAF';
-- ═══════════════════════════════════════════════════════════════════════════
