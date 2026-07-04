-- ═══════════════════════════════════════════════════════════════════════
-- InnovaAFRIC · Migración XenderShop / XenderBigShop
-- Multi-moneda (EUR / USD / XAF / XOF) + subcategorías + categorías BigShop
--
-- Idempotente: se puede ejecutar varias veces sin riesgo.
-- Cómo aplicarla:  Supabase → SQL Editor → New query → pegar todo → Run.
-- ═══════════════════════════════════════════════════════════════════════

-- 1) PRODUCTS ─ categoría/subcategoría + precios en las 4 monedas del sistema.
--    El id sigue siendo UUID (lo genera Supabase) para respetar la FK
--    orders.product_id → products.id. El panel ya no fuerza ids de texto.
ALTER TABLE products ADD COLUMN IF NOT EXISTS category     TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_eur    NUMERIC(14,4) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_usd    NUMERIC(14,4) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_xaf    NUMERIC(14,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_xof    NUMERIC(14,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ce_certified BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin       TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image        TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT now();

-- 2) SHOP_CATEGORIES ─ permitir IDs de texto ('cat_123') para que el
--    guardado/edición del panel persista en la nube (antes caía a localStorage).
ALTER TABLE shop_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE shop_categories ALTER COLUMN id TYPE TEXT USING id::text;

-- 3) BIGSHOP_CATEGORIES ─ nueva tabla: categorías y subcategorías del
--    marketplace multivendor XenderBigShop (espejo de shop_categories, id TEXT).
CREATE TABLE IF NOT EXISTS bigshop_categories (
  id            TEXT PRIMARY KEY,
  emoji         TEXT,
  name          TEXT NOT NULL,
  description   TEXT,
  subcategories TEXT[],
  color         TEXT,
  order_idx     INTEGER DEFAULT 1,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE bigshop_categories DISABLE ROW LEVEL SECURITY;

-- 4) BIGSHOP_PRODUCTS ─ catálogo multivendor: productos de todas las tiendas
--    con categoría/subcategoría, precios en 4 monedas y estado de moderación.
CREATE TABLE IF NOT EXISTS bigshop_products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store        TEXT,
  name         TEXT NOT NULL,
  category     TEXT,
  subcategory  TEXT,
  price_eur    NUMERIC(14,4) DEFAULT 0,
  price_usd    NUMERIC(14,4) DEFAULT 0,
  price_xaf    NUMERIC(14,2) DEFAULT 0,
  price_xof    NUMERIC(14,2) DEFAULT 0,
  stock        INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'pending',   -- pending | approved | hidden
  origin       TEXT,
  image        TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE bigshop_products DISABLE ROW LEVEL SECURITY;

-- ── Verificación rápida (opcional) ─────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name='products' ORDER BY ordinal_position;
-- SELECT * FROM bigshop_categories;
