# InnovaAFRIC — Mega App (todo-en-uno)

Esta es la **app principal del cliente**: el súper-app que reúne XenderMoney,
XenderShop, BigShop y XenderDelivery en una sola interfaz (34 pantallas, 12+
servicios, 4 monedas EUR/USD/XAF/XOF).

- **URL en producción:** https://christianboddien-source.github.io/innovaafric-prod/
- **Se sirve desde la RAÍZ del repo** (no desde una subcarpeta, a diferencia de
  las demás apps). Es deliberado: la raíz mapea directo a un dominio propio
  (p. ej. `app.innovaafric.com`) cuando migremos a IONOS.

---

## 📁 Archivos que forman la mega app (todo en la raíz del repo)

| Archivo | Qué es |
|---|---|
| `index.html` | **La app entera** (HTML + CSS + JS en un solo archivo, ~360 KB). Las 34 pantallas y toda la lógica. |
| `app-i18n.js` | Traducciones ES / FR / EN (diccionario + traductor por coincidencia exacta). Se carga con `?v=N` para saltar la caché — subir ese número al cambiarlo. |
| `sw.js` | Service worker: funciona sin conexión y pide el HTML siempre fresco a la red (red-primero). |
| `manifest.json` | Manifiesto PWA (nombre, icono, `start_url: ./`, `scope: ./`). |
| `icon.svg` | Icono de la app (PWA / pantalla de inicio). |

> **Para migrar la mega app a otro servidor (IONOS), basta con copiar esos 5
> archivos** a la raíz del sitio. No dependen de ningún otro archivo del repo.

Todas las rutas internas son relativas (`./app-i18n.js`, `./sw.js`,
`./manifest.json`, `./icon.svg`), así que funciona igual en la raíz de cualquier
dominio sin cambios.

---

## 🔌 Con qué se conecta

| Servicio | URL | Para qué |
|---|---|---|
| **API Railway** | `https://api.innovaafric.com/v1` | Fuente de verdad: saldo, envíos, retiros, cambio de divisa, compras, préstamos, notificaciones, bancos… (repo: `innovaafric-api`). |
| **Supabase** | `https://spnfvmvrlexyiljwyola.supabase.co` | Autenticación (login) y lectura de saldo como respaldo. |

**Flujo de datos (importante):**
1. El usuario inicia sesión con Supabase Auth.
2. La app cambia el token de Supabase por un JWT de Railway (`/v1/auth/token`,
   grant `supabase_exchange`).
3. **Toda operación de dinero se escribe en Railway** (fuente de verdad).
4. Railway **sincroniza el saldo a Supabase** (`syncWalletToSupabase`) para que
   las otras apps del ecosistema (XenderMoney web, dashboard) lo vean.
5. La app muestra el saldo leyendo de Railway (primario) o Supabase (respaldo).

> El puente Railway→Supabase usa el UUID de Supabase guardado en el usuario de
> Railway (`User.supabaseId`). El id de Railway es `usr_<8>` y **no** sirve para
> escribir en la tabla `wallets` de Supabase (indexada por UUID) — por eso se
> guarda el UUID completo.

---

## 🧩 El resto del repo (no es la mega app)

| Carpeta / archivo | Qué es |
|---|---|
| `innovaafric/` | Web pública / landing (presentación del ecosistema). |
| `xendermoney/`, `xendershop/`, `xenderbigshop/`, `xenderdelivery/` | Apps/portales individuales del ecosistema. |
| `app/` | Build antiguo (Expo). No es la mega app. |
| `InnovaAFRIC_Admin.html` | Panel de administración (dashboard). |
| `services/aliexpress-proxy/` | Proxy firmado de AliExpress (para Railway/Docker). |
| `docs/` | Documentación (informe técnico, manuales, API reference). |
| `supabase_*.sql` | Scripts SQL de Supabase (esquema, tarifas, RLS). |
| `Caddyfile`, `docker-compose.yml` | Despliegue con Docker/Caddy (para IONOS). |

---

## 🚀 Cómo actualizar la app

1. Editar `index.html` (y `app-i18n.js` si cambian textos — subir el `?v=N`).
2. `git commit` + `git push origin main`.
3. GitHub Pages publica en 1–2 min. El service worker sirve el HTML fresco al
   recargar con conexión (no hace falta reinstalar la PWA).
