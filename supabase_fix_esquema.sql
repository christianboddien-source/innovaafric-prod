-- ═══════════════════════════════════════════════════════════════════════════
--  CORRECCIÓN DE ESQUEMA — ecosistema InnovaAFRIC
--
--  ⚠ LO MÁS URGENTE ESTÁ EN EL BLOQUE `users`: sin esas cuatro columnas
--    NADIE PUEDE REGISTRARSE en XenderMoney. El alta falla siempre.
--
--  POR QUÉ EXISTE ESTE ARCHIVO
--  El esquema desplegado en Supabase no coincide ni con supabase_migration_v1.sql
--  ni con lo que insertan las páginas. Resultado: TODAS las escrituras de
--  XenderShop fallaban con error 42703 (column does not exist), el error se
--  tragaba un try/catch y al usuario se le mostraba "✅ guardado". Pedidos,
--  altas de tienda y suscripciones se estaban perdiendo en silencio.
--
--  Comprobado el 2026-07-18 sondeando la API REST columna a columna.
--
--  ESTADO REAL ENCONTRADO
--    orders   → id, user_id, status, total_eur, notes, created_at, updated_at
--               (NO tiene: amount, currency, reference, source, product_id,
--                delivery_id, fx_rate)
--    stores   → id, name, created_at, phone, country
--               (NO tiene: email, status, source)
--    promo_codes → id, code
--               (NO tiene: active, discount_pct, discount_fixed)
--    products → id, name, price_eur, category, subcategory, rating
--               (NO tiene: image_url, discount, orders)
--    users    → id, email, phone, country, role, created_at
--               (NO tiene: name, ia_code, status, kyc_status)  ← ROMPE EL ALTA
--    wallets  → id, user_id, created_at
--               (NO tiene: currency, balance)
--    kyc_requests → id, user_id, status
--               (NO tiene: document_type, document_url, submitted_at)
--    riders   → id, created_at
--               (NO tiene: name, email, phone, city, status)
--    newsletter_subscribers → NO EXISTE
--
--  CÓMO USARLO
--  Revísalo entero antes de ejecutarlo. Todo es aditivo: solo añade columnas
--  y tablas, no borra ni modifica datos existentes. Aun así, haz copia de
--  seguridad antes (Supabase → Database → Backups).
--  Ejecutar en: Supabase → SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── ORDERS ────────────────────────────────────────────────────────────────
-- total_eur y notes ya existen. Se añade lo que el checkout necesita para no
-- tener que serializarlo todo dentro de notes.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reference    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency     TEXT DEFAULT 'EUR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_shown  NUMERIC(14,4);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fx_rate      NUMERIC(14,6) DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source       TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_mode   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  TEXT;

-- La referencia identifica el pedido de cara al cliente: debe ser única.
CREATE UNIQUE INDEX IF NOT EXISTS orders_reference_key ON orders(reference)
  WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders(status);

-- ── STORES ────────────────────────────────────────────────────────────────
-- Sin columna email no hay forma de contactar a quien pide abrir tienda.
ALTER TABLE stores ADD COLUMN IF NOT EXISTS email   TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS status  TEXT DEFAULT 'pending';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS source  TEXT;

CREATE INDEX IF NOT EXISTS stores_status_idx ON stores(status);

-- ── PROMO_CODES ───────────────────────────────────────────────────────────
-- Hoy solo hay id y code, así que ningún código puede llevar descuento real
-- y solo funciona el INNOVA10 que está escrito a mano en el HTML.
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS active        BOOLEAN DEFAULT true;
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS discount_pct  NUMERIC(5,2);
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS discount_fixed NUMERIC(14,4);
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS expires_at    TIMESTAMPTZ;
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT now();

-- El INNOVA10 que ahora vive hardcodeado en el HTML, en la base de datos.
INSERT INTO promo_codes (code, active, discount_pct)
VALUES ('INNOVA10', true, 10)
ON CONFLICT DO NOTHING;

-- ── PRODUCTS ──────────────────────────────────────────────────────────────
-- category y subcategory ya existen, que es lo que necesita el filtrado por
-- subcategoría. Faltan los campos que pinta la tarjeta de producto.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url      TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(14,4);
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount       NUMERIC(5,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS orders         INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS aliexpress_id  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS synced_at      TIMESTAMPTZ;

-- Clave para la sincronización con AliExpress: evita duplicar el mismo
-- producto en cada pasada.
CREATE UNIQUE INDEX IF NOT EXISTS products_aliexpress_id_key
  ON products(aliexpress_id) WHERE aliexpress_id IS NOT NULL;
-- El filtrado por subcategoría de la home consulta por este par.
CREATE INDEX IF NOT EXISTS products_cat_subcat_idx ON products(category, subcategory);

-- ── NEWSLETTER_SUBSCRIBERS ────────────────────────────────────────────────
-- No existía: cada suscripción se perdía mostrando "✅ ¡Suscrito!".
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  source     TEXT,
  lang       TEXT,
  country    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_key
  ON newsletter_subscribers(lower(email));

-- ── USERS ─────────────────────────────────────────────────────────────────
-- CRÍTICO: sin estas cuatro columnas el alta de XenderMoney falla siempre y
-- nadie puede crear una cuenta. El insert de xendermoney/index.html envía
-- name, ia_code, status y kyc_status, y las cuatro dan 42703.
ALTER TABLE users ADD COLUMN IF NOT EXISTS name        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ia_code     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status      TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status  TEXT DEFAULT 'pending';

-- El código IA identifica al usuario en todo el ecosistema: debe ser único.
CREATE UNIQUE INDEX IF NOT EXISTS users_ia_code_key ON users(ia_code)
  WHERE ia_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(lower(email))
  WHERE email IS NOT NULL;

-- ── WALLETS ───────────────────────────────────────────────────────────────
-- Un monedero sin saldo ni moneda no es un monedero. El insert se hace sin
-- comprobar el error, asi que la cuenta se creaba sin monedero y nadie
-- se enteraba.
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS balance  NUMERIC(14,4) DEFAULT 0;

-- Un monedero por usuario y moneda.
CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_currency_key
  ON wallets(user_id, currency);

-- ── KYC_REQUESTS ──────────────────────────────────────────────────────────
-- Sin document_url no queda constancia del documento subido, aunque al
-- usuario se le diga "⏳ En revisión". Esto es un problema de cumplimiento,
-- no solo de datos.
ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS document_url  TEXT;
ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS submitted_at  TIMESTAMPTZ DEFAULT now();
ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS reviewed_at   TIMESTAMPTZ;
ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS reviewer_note TEXT;

CREATE INDEX IF NOT EXISTS kyc_requests_user_idx   ON kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS kyc_requests_status_idx ON kyc_requests(status);

-- ── RIDERS ────────────────────────────────────────────────────────────────
-- El alta de repartidores de XenderDelivery no puede guardar ni el nombre.
ALTER TABLE riders ADD COLUMN IF NOT EXISTS name    TEXT;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS email   TEXT;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS phone   TEXT;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS city    TEXT;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS status  TEXT DEFAULT 'pending';
ALTER TABLE riders ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
-- vehicle_type ya existe; es la única columna del formulario que sí estaba.

CREATE INDEX IF NOT EXISTS riders_status_idx ON riders(status);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
--  DESPUÉS DE EJECUTAR
--
--  1) Revisa las políticas RLS de newsletter_subscribers. La tabla se crea con
--     RLS deshabilitado por defecto en este proyecto (ver
--     supabase_rls_disable_all.sql). Si en algún momento activas RLS, la
--     página necesita permiso de INSERT anónimo sobre esta tabla y sobre
--     orders y stores, o volverán a fallar las escrituras.
--
--  2) Comprueba que funciona, desde la consola del navegador en la página:
--       await SB.from('orders').select('reference,currency,total_eur').limit(1)
--       await SB.from('newsletter_subscribers').select('email').limit(1)
--     Si devuelven error, la migración no se aplicó.
--
--  3) Una vez aplicada, en xendershop/index.html se puede simplificar
--     xsCheckout() para escribir en columnas propias en vez de serializar
--     el detalle dentro de `notes`. El código sigue funcionando sin tocarlo.
-- ═══════════════════════════════════════════════════════════════════════════
