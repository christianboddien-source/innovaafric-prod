-- ═══════════════════════════════════════════════════════════════════════════
--  CORRECCIÓN DE ESQUEMA v2 — lo que solo se ve intentando escribir
--
--  La v1 añadió las columnas que faltaban. Pero un `select` no puede detectar
--  restricciones NOT NULL, valores por defecto que faltan ni políticas RLS:
--  eso solo aparece cuando intentas insertar de verdad.
--
--  Probado el 2026-07-18 creando una cuenta de prueba real (y borrándola
--  después). Estos son los tres fallos que quedaban.
--
--  Ejecutar en: Supabase → SQL Editor, después de supabase_fix_esquema.sql
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. stores.id no tiene valor por defecto ───────────────────────────────
-- Sin esto, cualquier alta de tienda falla con:
--   null value in column "id" of relation "stores" violates not-null constraint
-- La tabla está vacía, así que no hay filas que arreglar.
ALTER TABLE stores ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Por si otras tablas del mismo lote tienen el mismo problema.
ALTER TABLE newsletter_subscribers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ── 2. RLS en newsletter_subscribers ──────────────────────────────────────
-- La tabla se creó en la v1 con RLS activo, así que la web (que usa la clave
-- anónima) puede leer pero no insertar:
--   new row violates row-level security policy
--
-- El resto del proyecto tiene RLS deshabilitado (ver supabase_rls_disable_all.sql).
-- Aquí se hace lo contrario a propósito: se deja RLS ACTIVO y se concede solo
-- el permiso de insertar. Una lista de correo no necesita que un visitante
-- anónimo pueda leer las direcciones de los demás — eso sería una fuga de
-- datos personales.
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon puede suscribirse" ON newsletter_subscribers;
CREATE POLICY "anon puede suscribirse"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Deliberadamente NO se crea política de SELECT para anon: nadie debe poder
-- listar los suscriptores desde el navegador. El panel de administración usa
-- la service_role key, que se salta RLS.

-- ── 3. wallets: el monedero ya lo crea un trigger ─────────────────────────
-- No hay nada que cambiar aquí, pero conviene dejarlo escrito.
--
-- La tabla real es multi-moneda en una sola fila (eur, xaf, xof, usd, points)
-- y hay un trigger que crea el monedero automáticamente al dar de alta un
-- usuario. Por eso el insert explícito de xendermoney fallaba siempre con:
--   duplicate key value violates unique constraint "wallets_user_id_key"
--
-- La solución va en el código, no en el esquema: se ha quitado ese insert de
-- xendermoney/index.html. El trigger se encarga.
--
-- Las columnas currency/balance que añadió la v1 sobran con este diseño. Se
-- dejan porque quitarlas no aporta nada y borrar columnas siempre es más
-- arriesgado que dejarlas.

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
--  COMPROBAR QUE HA FUNCIONADO
--
--  Desde la consola del navegador, en cualquiera de las páginas:
--
--    await SB.from('stores').insert({name:'prueba'}).select()
--      → debe devolver la fila creada, no un error de "id"
--
--    await SB.from('newsletter_subscribers').insert({email:'a@b.com'}).select()
--      → debe funcionar
--
--    await SB.from('newsletter_subscribers').select('email')
--      → debe devolver [] aunque haya filas: la política de lectura no existe
--        para anon, y eso es lo correcto.
--
--  Acuérdate de borrar las filas de prueba después.
-- ═══════════════════════════════════════════════════════════════════════════
