# INFORME TÉCNICO — INFRAESTRUCTURA INNOVAAFRIC
### Technical Report — INNOVAAFRIC Infrastructure
### Rapport Technique — Infrastructure INNOVAAFRIC

**Versión / Version / Version:** 1.0  
**Fecha / Date / Date:** Junio 2026 / June 2026 / Juin 2026  
**Autor / Author / Auteur:** INNOVAAFRIC Tech Team  

---

---

# ═══════════════════════════════════════════
# 🇪🇸 ESPAÑOL — INFORME TÉCNICO COMPLETO
# ═══════════════════════════════════════════

## 1. VISIÓN GENERAL DEL ECOSISTEMA

INNOVAAFRIC es un ecosistema digital financiero y comercial tricontinental (África, Europa, Asia) compuesto por **5 plataformas web interconectadas** y **1 API REST backend** desplegada en la nube. Todas las plataformas comparten una base de datos común en Supabase (PostgreSQL) y un backend centralizado en Railway.

### Mapa de plataformas

```
┌─────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA INNOVAAFRIC                    │
├─────────────────┬──────────────────────────────────────────┤
│   FRONTENDS     │   GitHub Pages (Static HTML)             │
│                 │                                           │
│  XenderMoney    │  Billetera digital, transferencias,       │
│                 │  cambio de divisas, KYC                   │
│                 │                                           │
│  XenderShop     │  Marketplace de productos físicos         │
│                 │                                           │
│  XenderDelivery │  Plataforma de riders y delivery          │
│                 │                                           │
│  XenderBigShop  │  Portal B2B: Merchants y proveedores      │
│                 │                                           │
│  Admin Panel    │  Panel de control del ecosistema          │
├─────────────────┴──────────────────────────────────────────┤
│   BASE DE DATOS  │  Supabase — PostgreSQL                   │
│                  │  56+ tablas, RLS deshabilitado           │
│                  │  SDK JavaScript @supabase/supabase-js    │
├──────────────────┴─────────────────────────────────────────┤
│   BACKEND API    │  Railway — Node.js + Express + Prisma    │
│                  │  URL: innovaafric-api-production.up.     │
│                  │       railway.app                        │
│                  │  49 módulos de rutas                     │
└────────────────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Stack tecnológico

| Capa | Tecnología | Versión | Función |
|---|---|---|---|
| Frontend | HTML5 + CSS3 + JavaScript ES6 | — | Interfaz de usuario |
| Frontend DB client | @supabase/supabase-js | v2 (CDN UMD) | Lectura/escritura directa a Supabase |
| Backend runtime | Node.js | ≥18.0.0 | Servidor de aplicaciones |
| Backend framework | Express.js | 4.18.3 | API REST |
| ORM | Prisma | 6.0.0 | Acceso a base de datos |
| Base de datos | PostgreSQL | 15 (Railway) | Datos de producción backend |
| Base de datos pública | Supabase (PostgreSQL) | 15 | Datos de usuario, productos, wallets |
| Autenticación | JWT (jsonwebtoken 9.0.2) | — | Sesiones del admin panel |
| Seguridad | helmet, express-rate-limit | — | Cabeceras HTTP, rate limiting |
| Cifrado | bcryptjs | 2.4.3 | Hash de contraseñas |
| Hosting frontend | GitHub Pages | — | Despliegue estático |
| Hosting backend | Railway | — | PaaS con auto-deploy |
| Storage archivos | Supabase Storage | — | Documentos KYC |
| HTTP interno | pg_net (PostgreSQL extension) | — | Webhooks Supabase → Railway |

### 2.2 Flujo de comunicación entre plataformas

```
Usuario
  │
  ▼
[XenderMoney / XenderShop / XenderDelivery / XenderBigShop]
  │        (HTML estático en GitHub Pages)
  │
  ├──► Supabase SDK (directo)
  │         └── Lectura/escritura de tablas en tiempo real
  │              users, wallets, transactions, orders,
  │              products, riders, merchants, kyc_requests,
  │              exchange_rates, promo_codes, stores
  │
  └──► Admin Panel → Railway API (fetch + JWT)
            └── Lógica de negocio compleja
                 Analytics, compliance, massmailing,
                 api-keys, payroll, tontines, loans...

[Supabase Trigger pg_net]
  │  Cada INSERT en tabla 'users'
  └──► POST → Railway /v1/admin/sync-user
              Header: X-Webhook-Secret
              (sincronización automática de usuarios)
```

### 2.3 Sistema de sesión compartida

Las 4 apps Xender usan el mismo mecanismo de sesión para mantener al usuario identificado en todo el ecosistema:

```javascript
// Escrito por XenderMoney al hacer login
localStorage.setItem('xm_session', JSON.stringify({
  id, email, name, phone, country, role, kycStatus
}));

// Leído por XenderShop, XenderDelivery, XenderBigShop
var SESSION = JSON.parse(localStorage.getItem('xm_session') || 'null');
```

**Resultado:** Un usuario que se identifica en XenderMoney queda automáticamente reconocido en todas las demás apps del ecosistema sin volver a hacer login.

---

## 3. FRONTENDS — DETALLE TÉCNICO

### 3.1 Características comunes a los 4 frontends

- **Formato:** Archivo único `index.html` (HTML + CSS + JS en un solo fichero)
- **Hosting:** GitHub Pages (repositorio `innovaafric-prod`, rama `main`)
- **URL base:** `https://christianboddien-source.github.io/innovaafric-prod/`
- **Supabase SDK:** Cargado vía CDN en el `<head>`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  ```
- **Cliente Supabase** inicializado con clave pública (anon key):
  ```javascript
  const SB_URL = 'https://spnfvmvrlexyiljwyola.supabase.co';
  const SB_KEY = 'sb_publishable_Aqe-VLEi6MfY8AvlpRfnLQ_OAom278u';
  const SB = supabase.createClient(SB_URL, SB_KEY);
  ```

> **Seguridad:** Solo la `anon key` (clave pública) está en los HTML. La `service_role key` (clave secreta) NUNCA se expone en archivos públicos — vive únicamente en las variables de entorno de Railway.

### 3.2 XenderMoney — Billetera Digital

**Ruta:** `/xendermoney/index.html`  
**Función:** App principal del ecosistema. Gestión financiera completa.

**Funcionalidades implementadas:**

| Función | Implementación |
|---|---|
| Registro de usuario | `SB.from('users').insert(...)` + `SB.from('wallets').insert(...)` |
| Login | Consulta por email en tabla `users`, verifica passwordHash |
| Dashboard wallet | Lee balances EUR/USD/XAF/XOF de tabla `wallets` |
| Historial transacciones | Últimas 5 de tabla `transactions` ordenadas por fecha |
| Calculadora de divisas | Rates en vivo de `exchange_rates` (from_curr/to_curr/rate) |
| Estado KYC | Lee `kyc_status` de tabla `users` + registros de `kyc_requests` |
| Subida de documentos KYC | Upload a Supabase Storage bucket `kyc-docs` + INSERT en `kyc_requests` |
| Sesión persistente | `localStorage` con clave `xm_session` |

**Calculadora de divisas — lógica:**
```javascript
var _XM_RATES = { 'EUR-XAF': 655.957, 'EUR-USD': 1.08, ... }; // fallback

async function loadLiveRates() {
  var { data } = await SB.from('exchange_rates')
    .select('from_curr,to_curr,rate');
  if (data && data.length) {
    data.forEach(r => _XM_RATES[r.from_curr + '-' + r.to_curr] = r.rate);
  }
  calcXM(); // recalcula con datos reales
}
```

### 3.3 XenderShop — Marketplace

**Ruta:** `/xendershop/index.html`  
**Función:** Tienda online con productos reales desde Supabase.

| Función | Implementación |
|---|---|
| Cargar productos | `SB.from('products').select('*').limit(20)` |
| Promo codes | `SB.from('promo_codes').select(...)` con fallback a código hardcoded |
| Checkout | Crea registro en `SB.from('orders').insert(...)`, redirige a XenderMoney |
| Registro vendedor | `SB.from('stores').insert(...)` |
| Sesión compartida | Lee `xm_session`, muestra badge con nombre de usuario |

### 3.4 XenderDelivery — Logística

**Ruta:** `/xenderdelivery/index.html`  
**Función:** Plataforma de delivery con registro de riders y tracking de pedidos.

| Función | Implementación |
|---|---|
| Registro de rider | `SB.from('riders').insert(...)` con campos: name, phone, email, city, vehicle, zone |
| Tracking de pedido | `SB.from('orders').select('*').eq('reference', ref)` con fallback demo |
| Sesión compartida | Badge de usuario en navbar |

### 3.5 XenderBigShop — Portal B2B

**Ruta:** `/xenderbigshop/index.html`  
**Función:** Portal para merchants (compradores B2B) y partners (proveedores).

| Función | Implementación |
|---|---|
| Registro merchant | `SB.from('merchants').insert(...)` |
| Registro partner/proveedor | `SB.from('partners').insert(...)` |
| Sesión compartida | Badge naranja (#E0921A) en navbar |

### 3.6 Admin Panel — Panel de Control

**Archivo:** `InnovaAFRIC_Admin.html`  
**Función:** Interfaz de administración completa del ecosistema.

**Sistema de llamadas al backend (tres niveles de fallback):**
```javascript
async function rwAPI(method, endpoint, body) {
  // Nivel 1: Railway API (datos reales)
  // Nivel 2: Supabase directo (si Railway falla)
  // Nivel 3: localStorage queue (offline, sincroniza después)
}
```

**Módulos del admin panel:**
- Dashboard con KPIs (usuarios, volumen, transacciones)
- Gestión de usuarios (ban/unban, KYC approval)
- Analytics y reportes
- Compliance y AML
- Gestión de API keys para partners
- Notificaciones masivas
- Configuración por país
- Soporte y tickets
- Payroll y tontines
- Campañas y marketing

---

## 4. BACKEND — RAILWAY API

### 4.1 Estructura del servidor

```
File Code/
├── server.js              ← Punto de entrada Express
├── scripts/start.js       ← Arranque: prisma migrate deploy → server
├── prisma/
│   ├── schema.prisma      ← 30+ modelos de datos
│   ├── seed.js            ← Datos iniciales
│   └── migrations/        ← 7 migraciones SQL
│       ├── 20260523000000_init_postgres/
│       ├── 20260524000000_advanced_modules/
│       ├── 20260524033018_security_campaigns_apikeys/
│       ├── 20260524100000_add_events_banktransfer_email/
│       ├── 20260524200000_security_campaigns_apikeys/
│       ├── 20260524300000_tickets_countryconfig_analytics/
│       └── 20260604000000_apikey_notification_product_fixes/
├── src/
│   ├── middleware/        ← Auth JWT, rate limit
│   ├── routes/            ← 49 módulos de rutas
│   ├── helpers/           ← Utilidades
│   └── config/            ← Configuración
└── package.json
```

### 4.2 Sistema de arranque

```javascript
// scripts/start.js
// 1. Arranca Express inmediatamente (para pasar healthcheck de Railway)
// 2. Ejecuta prisma migrate deploy en background
// 3. El servidor está listo antes de que termine la migración
```

### 4.3 Los 49 módulos de rutas

| Módulo | Ruta base | Función |
|---|---|---|
| auth | /v1/auth | Login, registro, refresh token |
| admin | /v1/admin | Control total del ecosistema |
| users | /v1/users | Perfil, datos de usuario |
| money | /v1/money | Transferencias, envíos |
| transfers | /v1/transfers | Transferencias P2P |
| wallets | — | Gestión de saldos |
| transactions | — | Historial de movimientos |
| shop | /v1/shop | Productos, catálogo |
| orders | — | Pedidos marketplace |
| delivery | /v1/delivery | Riders, paquetes |
| merchants | /v1/merchants | Cuentas comerciales |
| kyc | /v1/kyc | Verificación de identidad |
| loans | /v1/loans | Créditos y préstamos |
| savings | /v1/savings | Cuentas de ahorro |
| tontines | /v1/tontines | Tontinas africanas |
| invest | /v1/invest | Inversiones |
| insurance | /v1/insurance | Seguros |
| cards | /v1/cards | Tarjetas virtuales |
| mobilemoney | /v1/mobilemoney | Mobile money (Orange, MTN) |
| swift | /v1/swift | Transferencias SWIFT |
| banks | /v1/banks | Cuentas bancarias vinculadas |
| bills | /v1/bills | Pago de facturas |
| billing | /v1/billing | Facturación |
| campaigns | /v1/campaigns | Campañas de marketing |
| notifications | /v1/notifications | Sistema de notificaciones |
| payroll | /v1/payroll | Nóminas empresariales |
| taxes | /v1/taxes | Gestión fiscal |
| accounting | /v1/accounting | Contabilidad |
| events | /v1/events | Eventos del ecosistema |
| chat | /v1/chat | Mensajería interna |
| loyalty | /v1/loyalty | Programa de puntos |
| referrals | /v1/referrals | Sistema de referidos |
| reviews | /v1/reviews | Valoraciones |
| wishlist | /v1/wishlist | Lista de deseos |
| categories | /v1/categories | Categorías de productos |
| marketplace | /v1/marketplace | Marketplace general |
| partners | /v1/partners | Partners B2B |
| business | /v1/business | Cuentas empresa |
| credit | /v1/credit | Líneas de crédito |
| installments | /v1/installments | Pagos a plazos |
| coupons | /v1/coupons | Cupones descuento |
| promocodes | /v1/promocodes | Códigos promo |
| refunds | /v1/refunds | Devoluciones |
| sms | /v1/sms | SMS (Twilio) |
| emails | /v1/emails | Email (SendGrid) |
| stripe | /v1/stripe | Pagos Stripe |
| whitelabel | /v1/whitelabel | Marca blanca |
| apikeys | /v1/apikeys | Gestión de API keys |
| tickets | /v1/tickets | Soporte al cliente |
| countryconfig | /v1/countryconfig | Configuración por país |

### 4.4 Modelos de datos (Prisma Schema)

**30+ modelos** en PostgreSQL que cubren:

```
User ─────────► Wallet (balances EUR/USD/XAF/XOF)
  │
  ├──► Transaction (sent/received, fees, exchange rates)
  ├──► Order (marketplace orders)
  ├──► GroceryOrder
  ├──► BillPayment
  ├──► Loan + LoanPayment
  ├──► SavingsAccount + SavingsTransaction
  ├──► TontineMember → Tontine → TontineContribution
  ├──► VirtualCard
  ├──► LoyaltyAccount + LoyaltyTransaction
  ├──► BusinessAccount
  ├──► WishlistItem
  ├──► Review
  ├──► Referral
  ├──► BulkPayment
  ├──► Invoice
  ├──► CartItem
  ├──► UserBankAccount → BankTransfer
  ├──► ChatMessage
  └──► Notification

Product → CartItem, WishlistItem, Review, OrderItem
Store → Product
Campaign (marketing)
CountryConfig (configuración por país)
SupportTicket
ApiKey (partner API management)
PayrollRun → PayrollItem
```

### 4.5 Seguridad del backend

| Mecanismo | Implementación |
|---|---|
| Autenticación | JWT Bearer token en header `Authorization` |
| Niveles de acceso | `requireLevel(1-4)` — 4 niveles de privilegio |
| Rate limiting | `express-rate-limit`: 100 req/min por defecto |
| CORS | Orígenes permitidos en variable `ALLOWED_ORIGINS` |
| Cabeceras HTTP | `helmet` — CSP, HSTS, XSS protection |
| Contraseñas | `bcryptjs` hash antes de almacenar |
| Webhook secret | `X-Webhook-Secret` header para Supabase → Railway |
| Variables sensibles | `.env` solo en Railway, nunca en repositorio público |

---

## 5. BASE DE DATOS — SUPABASE

### 5.1 Configuración

- **URL:** `https://spnfvmvrlexyiljwyola.supabase.co`
- **Motor:** PostgreSQL 15
- **Plan:** Free (escalable)
- **RLS:** Deshabilitado en todas las tablas (acceso controlado por JWT en backend)
- **Extensiones activas:** `pg_net` (webhooks HTTP salientes), `uuid-ossp`

### 5.2 Tablas principales (56+ tablas)

| Tabla | Función |
|---|---|
| users | Registro de todos los usuarios |
| wallets | Saldos multi-divisa por usuario |
| transactions | Historial de todas las transacciones |
| orders | Pedidos de XenderShop |
| products | Catálogo de productos |
| stores | Tiendas de vendedores |
| riders | Riders de XenderDelivery |
| merchants | Merchants B2B de XenderBigShop |
| partners | Proveedores B2B |
| kyc_requests | Solicitudes de verificación de identidad |
| exchange_rates | Tipos de cambio (21 pares de divisas) |
| promo_codes | Códigos promocionales |
| notifications | Sistema de notificaciones |
| api_keys | Claves API para partners externos |
| campaigns | Campañas de marketing |
| support_tickets | Tickets de soporte |
| country_config | Configuración por país |

### 5.3 Webhook automático (pg_net)

Cada vez que se registra un nuevo usuario en Supabase, el trigger `on_user_insert_sync_railway` llama automáticamente al backend de Railway:

```sql
CREATE TRIGGER on_user_insert_sync_railway
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_railway_new_user();
```

```sql
-- La función usa pg_net para hacer HTTP POST
PERFORM net.http_post(
  url     := 'https://innovaafric-api-production.up.railway.app/v1/admin/sync-user',
  headers := jsonb_build_object('X-Webhook-Secret', 'innovaafric_sync_2026'),
  body    := row_to_json(NEW)::text
);
```

### 5.4 Supabase Storage

- **Bucket `kyc-docs`:** Público, almacena documentos de identidad subidos por usuarios para verificación KYC
- **Ruta de archivos:** `{user_id}_{document_type}_{timestamp}.{extension}`

---

## 6. FLUJO DE DATOS COMPLETO — EJEMPLO: REGISTRO DE USUARIO

```
1. Usuario rellena formulario en XenderMoney (HTML)
        │
        ▼
2. JavaScript llama a SB.from('users').insert({
     id, email, name, phone, country,
     role: 'customer', kyc_status: 'pending'
   })
        │
        ▼
3. Supabase inserta fila en tabla 'users'
        │
        ├──► 4a. SB.from('wallets').insert({
        │         user_id, balance_eur: 0, ...
        │       })  ← Wallet creada automáticamente
        │
        └──► 4b. Trigger pg_net dispara POST a Railway
                  /v1/admin/sync-user
                  ← Railway sincroniza en su PostgreSQL propio

5. localStorage.setItem('xm_session', JSON.stringify(user))
        │
        ▼
6. Usuario ve su dashboard con balance €0.00
   — puede navegar a XenderShop, XenderDelivery, XenderBigShop
   — el badge de sesión aparece automáticamente en todas las apps
```

---

## 7. DESPLIEGUE Y CI/CD

### 7.1 Frontend — GitHub Pages

- **Repositorio:** `christianboddien-source/innovaafric-prod`
- **Rama:** `main`
- **Despliegue:** Automático al hacer `git push origin main`
- **Sin build step:** Los HTML son estáticos, no requieren compilación
- **Tiempo de despliegue:** ~30 segundos

### 7.2 Backend — Railway

- **Repositorio:** `christianboddien-source/innovaafric-api`
- **Rama:** `master`
- **Despliegue:** Automático al hacer `git push origin master`
- **Proceso de arranque:**
  1. Railway instala dependencias (`npm install`)
  2. `postinstall` ejecuta `npx prisma generate`
  3. `start` ejecuta `node scripts/start.js`
  4. El script arranca Express (para pasar healthcheck)
  5. En background: `npx prisma migrate deploy`
- **Tiempo de despliegue:** ~2-3 minutos

### 7.3 Variables de entorno (Railway)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL Railway (auto-inyectado) |
| `JWT_SECRET` | Secreto para firmar tokens JWT (min 32 chars) |
| `ALLOWED_ORIGINS` | Dominios CORS permitidos |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Clave secreta Supabase (NUNCA en código público) |
| `WEBHOOK_SECRET` | Secreto compartido para autenticar webhooks |
| `PORT` | Puerto del servidor (Railway lo asigna) |
| `NODE_ENV` | `production` |

---

## 8. RESUMEN DE TECNOLOGÍAS POR CAPA

```
┌─────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN                           │
│  HTML5 · CSS3 · JavaScript ES6 · CDN Supabase   │
│  4 Single-Page Applications (archivos únicos)   │
│  Hosting: GitHub Pages (gratuito)               │
├─────────────────────────────────────────────────┤
│  CAPA DE DATOS (cliente)                        │
│  @supabase/supabase-js v2 (UMD, sin bundler)    │
│  localStorage para sesión compartida            │
│  fetch() nativo para Railway API                │
├─────────────────────────────────────────────────┤
│  CAPA DE LÓGICA DE NEGOCIO (servidor)           │
│  Node.js 18+ · Express 4 · Prisma ORM 6         │
│  49 módulos de rutas · JWT · bcrypt · helmet    │
│  Hosting: Railway PaaS                          │
├─────────────────────────────────────────────────┤
│  CAPA DE PERSISTENCIA                           │
│  Supabase PostgreSQL 15 (56+ tablas)            │
│  Railway PostgreSQL 15 (30+ modelos Prisma)     │
│  Supabase Storage (bucket kyc-docs)             │
│  pg_net (webhooks automáticos)                  │
└─────────────────────────────────────────────────┘
```

---
---
---

# ═══════════════════════════════════════════
# 🇬🇧 ENGLISH — FULL TECHNICAL REPORT
# ═══════════════════════════════════════════

## 1. ECOSYSTEM OVERVIEW

INNOVAAFRIC is a tricontinental (Africa, Europe, Asia) digital financial and commercial ecosystem comprising **5 interconnected web platforms** and **1 cloud-deployed REST API backend**. All platforms share a common Supabase (PostgreSQL) database and a centralized Railway backend.

### Platform Map

```
┌─────────────────────────────────────────────────────────────┐
│                   INNOVAAFRIC ECOSYSTEM                      │
├─────────────────┬──────────────────────────────────────────┤
│   FRONTENDS     │   GitHub Pages (Static HTML)             │
│                 │                                           │
│  XenderMoney    │  Digital wallet, transfers, FX, KYC       │
│                 │                                           │
│  XenderShop     │  Physical products marketplace            │
│                 │                                           │
│  XenderDelivery │  Rider and delivery platform              │
│                 │                                           │
│  XenderBigShop  │  B2B portal: Merchants & suppliers        │
│                 │                                           │
│  Admin Panel    │  Ecosystem control panel                  │
├─────────────────┴──────────────────────────────────────────┤
│   DATABASE       │  Supabase — PostgreSQL                   │
│                  │  56+ tables, RLS disabled                │
│                  │  JavaScript SDK @supabase/supabase-js    │
├──────────────────┴─────────────────────────────────────────┤
│   BACKEND API    │  Railway — Node.js + Express + Prisma    │
│                  │  URL: innovaafric-api-production.up.     │
│                  │       railway.app                        │
│                  │  49 route modules                        │
└────────────────────────────────────────────────────────────┘
```

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | HTML5 + CSS3 + JavaScript ES6 | — | User interface |
| Frontend DB client | @supabase/supabase-js | v2 (CDN UMD) | Direct read/write to Supabase |
| Backend runtime | Node.js | ≥18.0.0 | Application server |
| Backend framework | Express.js | 4.18.3 | REST API |
| ORM | Prisma | 6.0.0 | Database access |
| Database | PostgreSQL | 15 (Railway) | Backend production data |
| Public database | Supabase (PostgreSQL) | 15 | User data, products, wallets |
| Authentication | JWT (jsonwebtoken 9.0.2) | — | Admin panel sessions |
| Security | helmet, express-rate-limit | — | HTTP headers, rate limiting |
| Encryption | bcryptjs | 2.4.3 | Password hashing |
| Frontend hosting | GitHub Pages | — | Static deployment |
| Backend hosting | Railway | — | PaaS with auto-deploy |
| File storage | Supabase Storage | — | KYC documents |
| Internal HTTP | pg_net (PostgreSQL extension) | — | Webhooks Supabase → Railway |

### 2.2 Inter-platform Communication Flow

```
User
  │
  ▼
[XenderMoney / XenderShop / XenderDelivery / XenderBigShop]
  │        (Static HTML on GitHub Pages)
  │
  ├──► Supabase SDK (direct connection)
  │         └── Real-time table read/write
  │              users, wallets, transactions, orders,
  │              products, riders, merchants, kyc_requests,
  │              exchange_rates, promo_codes, stores
  │
  └──► Admin Panel → Railway API (fetch + JWT)
            └── Complex business logic
                 Analytics, compliance, mass notifications,
                 api-keys, payroll, tontines, loans...

[Supabase Trigger pg_net]
  │  Every INSERT into 'users' table
  └──► POST → Railway /v1/admin/sync-user
              Header: X-Webhook-Secret
              (automatic user synchronization)
```

### 2.3 Shared Session System

All 4 Xender apps use the same session mechanism to identify the user across the entire ecosystem:

```javascript
// Written by XenderMoney on login
localStorage.setItem('xm_session', JSON.stringify({
  id, email, name, phone, country, role, kycStatus
}));

// Read by XenderShop, XenderDelivery, XenderBigShop
var SESSION = JSON.parse(localStorage.getItem('xm_session') || 'null');
```

**Result:** A user who logs into XenderMoney is automatically recognized across all other apps in the ecosystem without logging in again.

---

## 3. FRONTENDS — TECHNICAL DETAIL

### 3.1 Common Features (All 4 Frontends)

- **Format:** Single `index.html` file (HTML + CSS + JS in one file)
- **Hosting:** GitHub Pages (repository `innovaafric-prod`, branch `main`)
- **Base URL:** `https://christianboddien-source.github.io/innovaafric-prod/`
- **Supabase SDK:** Loaded via CDN in `<head>`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  ```
- **Supabase client** initialized with public anon key:
  ```javascript
  const SB_URL = 'https://spnfvmvrlexyiljwyola.supabase.co';
  const SB_KEY = 'sb_publishable_Aqe-VLEi6MfY8AvlpRfnLQ_OAom278u';
  const SB = supabase.createClient(SB_URL, SB_KEY);
  ```

> **Security:** Only the `anon key` (public key) is present in HTML files. The `service_role key` (secret key) is NEVER exposed in public files — it lives exclusively in Railway environment variables.

### 3.2 XenderMoney — Digital Wallet

**Path:** `/xendermoney/index.html`  
**Purpose:** Main app of the ecosystem. Complete financial management.

| Feature | Implementation |
|---|---|
| User registration | `SB.from('users').insert(...)` + `SB.from('wallets').insert(...)` |
| Login | Query by email in `users` table, verify passwordHash |
| Wallet dashboard | Reads EUR/USD/XAF/XOF balances from `wallets` table |
| Transaction history | Last 5 from `transactions` table ordered by date |
| Currency calculator | Live rates from `exchange_rates` (from_curr/to_curr/rate) |
| KYC status | Reads `kyc_status` from `users` + records from `kyc_requests` |
| KYC document upload | Upload to Supabase Storage `kyc-docs` bucket + INSERT into `kyc_requests` |
| Persistent session | `localStorage` with key `xm_session` |

### 3.3 XenderShop — Marketplace

**Path:** `/xendershop/index.html`

| Feature | Implementation |
|---|---|
| Load products | `SB.from('products').select('*').limit(20)` |
| Promo codes | `SB.from('promo_codes').select(...)` with hardcoded fallback |
| Checkout | Creates record in `SB.from('orders').insert(...)`, redirects to XenderMoney |
| Vendor registration | `SB.from('stores').insert(...)` |
| Shared session | Reads `xm_session`, shows user badge |

### 3.4 XenderDelivery — Logistics

**Path:** `/xenderdelivery/index.html`

| Feature | Implementation |
|---|---|
| Rider registration | `SB.from('riders').insert(...)` with fields: name, phone, email, city, vehicle, zone |
| Order tracking | `SB.from('orders').select('*').eq('reference', ref)` with demo fallback |
| Shared session | User badge in navbar |

### 3.5 XenderBigShop — B2B Portal

**Path:** `/xenderbigshop/index.html`

| Feature | Implementation |
|---|---|
| Merchant registration | `SB.from('merchants').insert(...)` |
| Partner/supplier registration | `SB.from('partners').insert(...)` |
| Shared session | Orange badge (#E0921A) in navbar |

### 3.6 Admin Panel — Control Center

**File:** `InnovaAFRIC_Admin.html`

**Three-tier backend call system:**
```javascript
async function rwAPI(method, endpoint, body) {
  // Tier 1: Railway API (real data)
  // Tier 2: Supabase direct (if Railway fails)
  // Tier 3: localStorage queue (offline, syncs later)
}
```

---

## 4. BACKEND — RAILWAY API

### 4.1 Server Structure

```
File Code/
├── server.js              ← Express entry point
├── scripts/start.js       ← Boot: prisma migrate deploy → server
├── prisma/
│   ├── schema.prisma      ← 30+ data models
│   ├── seed.js            ← Initial data
│   └── migrations/        ← 7 SQL migrations
├── src/
│   ├── middleware/        ← JWT auth, rate limit
│   ├── routes/            ← 49 route modules
│   ├── helpers/           ← Utilities
│   └── config/            ← Configuration
└── package.json
```

### 4.2 Backend Security

| Mechanism | Implementation |
|---|---|
| Authentication | JWT Bearer token in `Authorization` header |
| Access levels | `requireLevel(1-4)` — 4 privilege levels |
| Rate limiting | `express-rate-limit`: 100 req/min default |
| CORS | Allowed origins in `ALLOWED_ORIGINS` variable |
| HTTP headers | `helmet` — CSP, HSTS, XSS protection |
| Passwords | `bcryptjs` hash before storing |
| Webhook secret | `X-Webhook-Secret` header for Supabase → Railway |
| Sensitive variables | `.env` only on Railway, never in public repository |

---

## 5. DATABASE — SUPABASE

### 5.1 Configuration

- **URL:** `https://spnfvmvrlexyiljwyola.supabase.co`
- **Engine:** PostgreSQL 15
- **RLS:** Disabled on all tables (access controlled by JWT on backend)
- **Active extensions:** `pg_net` (outbound HTTP webhooks), `uuid-ossp`

### 5.2 Automatic Webhook (pg_net)

Every new user registered in Supabase automatically triggers a POST to Railway:

```sql
CREATE TRIGGER on_user_insert_sync_railway
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_railway_new_user();
```

### 5.3 Supabase Storage

- **Bucket `kyc-docs`:** Public, stores identity documents uploaded by users for KYC verification
- **File path pattern:** `{user_id}_{document_type}_{timestamp}.{extension}`

---

## 6. DEPLOYMENT & CI/CD

### 6.1 Frontend — GitHub Pages

- **Repository:** `christianboddien-source/innovaafric-prod`
- **Branch:** `main`
- **Deploy:** Automatic on `git push origin main`
- **No build step:** HTML files are static, no compilation required
- **Deploy time:** ~30 seconds

### 6.2 Backend — Railway

- **Repository:** `christianboddien-source/innovaafric-api`
- **Branch:** `master`
- **Deploy:** Automatic on `git push origin master`
- **Boot process:**
  1. Railway installs dependencies (`npm install`)
  2. `postinstall` runs `npx prisma generate`
  3. `start` runs `node scripts/start.js`
  4. Script starts Express immediately (to pass Railway healthcheck)
  5. Background: `npx prisma migrate deploy`
- **Deploy time:** ~2-3 minutes

---

## 7. TECHNOLOGY SUMMARY BY LAYER

```
┌─────────────────────────────────────────────────┐
│  PRESENTATION LAYER                             │
│  HTML5 · CSS3 · JavaScript ES6 · CDN Supabase   │
│  4 Single-Page Applications (single files)      │
│  Hosting: GitHub Pages (free)                   │
├─────────────────────────────────────────────────┤
│  DATA LAYER (client-side)                       │
│  @supabase/supabase-js v2 (UMD, no bundler)     │
│  localStorage for shared session                │
│  Native fetch() for Railway API                 │
├─────────────────────────────────────────────────┤
│  BUSINESS LOGIC LAYER (server-side)             │
│  Node.js 18+ · Express 4 · Prisma ORM 6         │
│  49 route modules · JWT · bcrypt · helmet       │
│  Hosting: Railway PaaS                          │
├─────────────────────────────────────────────────┤
│  PERSISTENCE LAYER                              │
│  Supabase PostgreSQL 15 (56+ tables)            │
│  Railway PostgreSQL 15 (30+ Prisma models)      │
│  Supabase Storage (kyc-docs bucket)             │
│  pg_net (automatic webhooks)                    │
└─────────────────────────────────────────────────┘
```

---
---
---

# ═══════════════════════════════════════════
# 🇫🇷 FRANÇAIS — RAPPORT TECHNIQUE COMPLET
# ═══════════════════════════════════════════

## 1. PRÉSENTATION GÉNÉRALE DE L'ÉCOSYSTÈME

INNOVAAFRIC est un écosystème numérique financier et commercial tricontinental (Afrique, Europe, Asie) composé de **5 plateformes web interconnectées** et **1 API REST backend** déployée dans le cloud. Toutes les plateformes partagent une base de données commune dans Supabase (PostgreSQL) et un backend centralisé sur Railway.

### Carte des plateformes

```
┌─────────────────────────────────────────────────────────────┐
│                  ÉCOSYSTÈME INNOVAAFRIC                      │
├─────────────────┬──────────────────────────────────────────┤
│   FRONTENDS     │   GitHub Pages (HTML Statique)           │
│                 │                                           │
│  XenderMoney    │  Portefeuille numérique, transferts,      │
│                 │  change de devises, KYC                   │
│                 │                                           │
│  XenderShop     │  Marketplace de produits physiques        │
│                 │                                           │
│  XenderDelivery │  Plateforme de riders et livraison        │
│                 │                                           │
│  XenderBigShop  │  Portail B2B : Marchands et fournisseurs  │
│                 │                                           │
│  Admin Panel    │  Panneau de contrôle de l'écosystème      │
├─────────────────┴──────────────────────────────────────────┤
│   BASE DE DONNÉES │  Supabase — PostgreSQL                  │
│                   │  56+ tables, RLS désactivé              │
│                   │  SDK JavaScript @supabase/supabase-js   │
├───────────────────┴────────────────────────────────────────┤
│   API BACKEND     │  Railway — Node.js + Express + Prisma   │
│                   │  URL: innovaafric-api-production.up.    │
│                   │       railway.app                       │
│                   │  49 modules de routes                   │
└────────────────────────────────────────────────────────────┘
```

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Stack Technologique

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| Frontend | HTML5 + CSS3 + JavaScript ES6 | — | Interface utilisateur |
| Client DB frontend | @supabase/supabase-js | v2 (CDN UMD) | Lecture/écriture directe Supabase |
| Runtime backend | Node.js | ≥18.0.0 | Serveur d'applications |
| Framework backend | Express.js | 4.18.3 | API REST |
| ORM | Prisma | 6.0.0 | Accès base de données |
| Base de données | PostgreSQL | 15 (Railway) | Données de production backend |
| Base de données publique | Supabase (PostgreSQL) | 15 | Utilisateurs, produits, wallets |
| Authentification | JWT (jsonwebtoken 9.0.2) | — | Sessions du panel admin |
| Sécurité | helmet, express-rate-limit | — | En-têtes HTTP, rate limiting |
| Chiffrement | bcryptjs | 2.4.3 | Hashage des mots de passe |
| Hébergement frontend | GitHub Pages | — | Déploiement statique |
| Hébergement backend | Railway | — | PaaS avec auto-deploy |
| Stockage fichiers | Supabase Storage | — | Documents KYC |
| HTTP interne | pg_net (extension PostgreSQL) | — | Webhooks Supabase → Railway |

### 2.2 Flux de Communication entre Plateformes

```
Utilisateur
  │
  ▼
[XenderMoney / XenderShop / XenderDelivery / XenderBigShop]
  │        (HTML statique sur GitHub Pages)
  │
  ├──► SDK Supabase (connexion directe)
  │         └── Lecture/écriture de tables en temps réel
  │              users, wallets, transactions, orders,
  │              products, riders, merchants, kyc_requests,
  │              exchange_rates, promo_codes, stores
  │
  └──► Admin Panel → Railway API (fetch + JWT)
            └── Logique métier complexe
                 Analytics, conformité, notifications de masse,
                 api-keys, paie, tontines, prêts...

[Trigger Supabase pg_net]
  │  Chaque INSERT dans la table 'users'
  └──► POST → Railway /v1/admin/sync-user
              Header: X-Webhook-Secret
              (synchronisation automatique des utilisateurs)
```

### 2.3 Système de Session Partagée

Les 4 applications Xender utilisent le même mécanisme de session pour identifier l'utilisateur dans tout l'écosystème :

```javascript
// Écrit par XenderMoney à la connexion
localStorage.setItem('xm_session', JSON.stringify({
  id, email, name, phone, country, role, kycStatus
}));

// Lu par XenderShop, XenderDelivery, XenderBigShop
var SESSION = JSON.parse(localStorage.getItem('xm_session') || 'null');
```

**Résultat :** Un utilisateur connecté sur XenderMoney est automatiquement reconnu dans toutes les autres applications de l'écosystème sans se reconnecter.

---

## 3. FRONTENDS — DÉTAIL TECHNIQUE

### 3.1 Caractéristiques communes (4 frontends)

- **Format :** Fichier unique `index.html` (HTML + CSS + JS dans un seul fichier)
- **Hébergement :** GitHub Pages (dépôt `innovaafric-prod`, branche `main`)
- **URL de base :** `https://christianboddien-source.github.io/innovaafric-prod/`
- **SDK Supabase :** Chargé via CDN dans le `<head>` :
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  ```
- **Client Supabase** initialisé avec la clé publique (anon key) :
  ```javascript
  const SB_URL = 'https://spnfvmvrlexyiljwyola.supabase.co';
  const SB_KEY = 'sb_publishable_Aqe-VLEi6MfY8AvlpRfnLQ_OAom278u';
  const SB = supabase.createClient(SB_URL, SB_KEY);
  ```

> **Sécurité :** Seule l'`anon key` (clé publique) est présente dans les fichiers HTML. La `service_role key` (clé secrète) n'est JAMAIS exposée dans des fichiers publics — elle réside uniquement dans les variables d'environnement de Railway.

### 3.2 XenderMoney — Portefeuille Numérique

**Chemin :** `/xendermoney/index.html`  
**Rôle :** Application principale de l'écosystème. Gestion financière complète.

| Fonctionnalité | Implémentation |
|---|---|
| Inscription utilisateur | `SB.from('users').insert(...)` + `SB.from('wallets').insert(...)` |
| Connexion | Requête par email dans la table `users`, vérifie passwordHash |
| Tableau de bord wallet | Lecture des soldes EUR/USD/XAF/XOF depuis la table `wallets` |
| Historique transactions | 5 dernières de la table `transactions` triées par date |
| Calculateur de devises | Taux en direct depuis `exchange_rates` (from_curr/to_curr/rate) |
| Statut KYC | Lecture `kyc_status` depuis `users` + enregistrements de `kyc_requests` |
| Upload documents KYC | Upload vers le bucket Supabase Storage `kyc-docs` + INSERT dans `kyc_requests` |
| Session persistante | `localStorage` avec clé `xm_session` |

### 3.3 XenderShop — Marketplace

**Chemin :** `/xendershop/index.html`

| Fonctionnalité | Implémentation |
|---|---|
| Chargement produits | `SB.from('products').select('*').limit(20)` |
| Codes promo | `SB.from('promo_codes').select(...)` avec fallback hardcodé |
| Checkout | Crée un enregistrement dans `SB.from('orders').insert(...)`, redirige vers XenderMoney |
| Inscription vendeur | `SB.from('stores').insert(...)` |
| Session partagée | Lecture de `xm_session`, affichage du badge utilisateur |

### 3.4 XenderDelivery — Logistique

**Chemin :** `/xenderdelivery/index.html`

| Fonctionnalité | Implémentation |
|---|---|
| Inscription rider | `SB.from('riders').insert(...)` avec champs : name, phone, email, city, vehicle, zone |
| Suivi de commande | `SB.from('orders').select('*').eq('reference', ref)` avec fallback démo |
| Session partagée | Badge utilisateur dans la navbar |

### 3.5 XenderBigShop — Portail B2B

**Chemin :** `/xenderbigshop/index.html`

| Fonctionnalité | Implémentation |
|---|---|
| Inscription marchand | `SB.from('merchants').insert(...)` |
| Inscription partenaire/fournisseur | `SB.from('partners').insert(...)` |
| Session partagée | Badge orange (#E0921A) dans la navbar |

### 3.6 Panel Administrateur — Centre de Contrôle

**Fichier :** `InnovaAFRIC_Admin.html`

**Système d'appels backend à trois niveaux :**
```javascript
async function rwAPI(method, endpoint, body) {
  // Niveau 1 : Railway API (données réelles)
  // Niveau 2 : Supabase direct (si Railway échoue)
  // Niveau 3 : file localStorage (hors ligne, synchronise plus tard)
}
```

**Modules du panel admin :**
- Tableau de bord KPIs (utilisateurs, volume, transactions)
- Gestion utilisateurs (ban/unban, validation KYC)
- Analytics et rapports
- Conformité et LAB (Lutte Anti-Blanchiment)
- Gestion des clés API pour partenaires
- Notifications de masse
- Configuration par pays
- Support et tickets
- Paie et tontines
- Campagnes et marketing

---

## 4. BACKEND — RAILWAY API

### 4.1 Structure du Serveur

```
File Code/
├── server.js              ← Point d'entrée Express
├── scripts/start.js       ← Démarrage : prisma migrate deploy → serveur
├── prisma/
│   ├── schema.prisma      ← 30+ modèles de données
│   ├── seed.js            ← Données initiales
│   └── migrations/        ← 7 migrations SQL
│       ├── 20260523000000_init_postgres/
│       ├── 20260524000000_advanced_modules/
│       ├── 20260524033018_security_campaigns_apikeys/
│       ├── 20260524100000_add_events_banktransfer_email/
│       ├── 20260524200000_security_campaigns_apikeys/
│       ├── 20260524300000_tickets_countryconfig_analytics/
│       └── 20260604000000_apikey_notification_product_fixes/
├── src/
│   ├── middleware/        ← Auth JWT, rate limit
│   ├── routes/            ← 49 modules de routes
│   ├── helpers/           ← Utilitaires
│   └── config/            ← Configuration
└── package.json
```

### 4.2 Processus de Démarrage

```javascript
// scripts/start.js
// 1. Express démarre immédiatement (pour passer le healthcheck Railway)
// 2. prisma migrate deploy s'exécute en arrière-plan
// 3. Le serveur est opérationnel avant la fin de la migration
```

### 4.3 Les 49 Modules de Routes

| Module | Route base | Fonction |
|---|---|---|
| auth | /v1/auth | Login, inscription, refresh token |
| admin | /v1/admin | Contrôle total de l'écosystème |
| money | /v1/money | Transferts, envois |
| transfers | /v1/transfers | Transferts P2P |
| kyc | /v1/kyc | Vérification d'identité |
| loans | /v1/loans | Crédits et prêts |
| savings | /v1/savings | Comptes d'épargne |
| tontines | /v1/tontines | Tontines africaines |
| invest | /v1/invest | Investissements |
| insurance | /v1/insurance | Assurances |
| cards | /v1/cards | Cartes virtuelles |
| mobilemoney | /v1/mobilemoney | Mobile money (Orange, MTN) |
| swift | /v1/swift | Transferts SWIFT |
| payroll | /v1/payroll | Paie d'entreprise |
| taxes | /v1/taxes | Gestion fiscale |
| accounting | /v1/accounting | Comptabilité |
| campaigns | /v1/campaigns | Campagnes marketing |
| notifications | /v1/notifications | Système de notifications |
| tickets | /v1/tickets | Support client |
| countryconfig | /v1/countryconfig | Configuration par pays |
| apikeys | /v1/apikeys | Gestion des clés API |
| stripe | /v1/stripe | Paiements Stripe |
| sms | /v1/sms | SMS (Twilio) |
| emails | /v1/emails | Email (SendGrid) |
| ... | ... | + 25 modules supplémentaires |

### 4.4 Sécurité du Backend

| Mécanisme | Implémentation |
|---|---|
| Authentification | Jeton JWT Bearer dans l'en-tête `Authorization` |
| Niveaux d'accès | `requireLevel(1-4)` — 4 niveaux de privilège |
| Limitation de débit | `express-rate-limit` : 100 req/min par défaut |
| CORS | Origines autorisées dans la variable `ALLOWED_ORIGINS` |
| En-têtes HTTP | `helmet` — CSP, HSTS, protection XSS |
| Mots de passe | Hash `bcryptjs` avant stockage |
| Secret webhook | En-tête `X-Webhook-Secret` pour Supabase → Railway |
| Variables sensibles | `.env` uniquement sur Railway, jamais dans le dépôt public |

---

## 5. BASE DE DONNÉES — SUPABASE

### 5.1 Configuration

- **URL :** `https://spnfvmvrlexyiljwyola.supabase.co`
- **Moteur :** PostgreSQL 15
- **RLS :** Désactivé sur toutes les tables (accès contrôlé par JWT côté backend)
- **Extensions actives :** `pg_net` (webhooks HTTP sortants), `uuid-ossp`

### 5.2 Tables Principales (56+ tables)

| Table | Fonction |
|---|---|
| users | Registre de tous les utilisateurs |
| wallets | Soldes multi-devises par utilisateur |
| transactions | Historique de toutes les transactions |
| orders | Commandes XenderShop |
| products | Catalogue de produits |
| stores | Boutiques des vendeurs |
| riders | Riders XenderDelivery |
| merchants | Marchands B2B XenderBigShop |
| partners | Fournisseurs B2B |
| kyc_requests | Demandes de vérification d'identité |
| exchange_rates | Taux de change (21 paires de devises) |
| promo_codes | Codes promotionnels |
| notifications | Système de notifications |
| api_keys | Clés API pour partenaires externes |
| campaigns | Campagnes marketing |
| support_tickets | Tickets de support |
| country_config | Configuration par pays |

### 5.3 Webhook Automatique (pg_net)

À chaque inscription d'un nouvel utilisateur dans Supabase, le trigger `on_user_insert_sync_railway` appelle automatiquement le backend Railway :

```sql
CREATE TRIGGER on_user_insert_sync_railway
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_railway_new_user();
```

### 5.4 Supabase Storage

- **Bucket `kyc-docs` :** Public, stocke les documents d'identité téléchargés par les utilisateurs pour la vérification KYC
- **Schéma de nommage :** `{user_id}_{document_type}_{timestamp}.{extension}`

---

## 6. DÉPLOIEMENT ET CI/CD

### 6.1 Frontend — GitHub Pages

- **Dépôt :** `christianboddien-source/innovaafric-prod`
- **Branche :** `main`
- **Déploiement :** Automatique à chaque `git push origin main`
- **Sans étape de build :** Les fichiers HTML sont statiques, aucune compilation requise
- **Temps de déploiement :** ~30 secondes

### 6.2 Backend — Railway

- **Dépôt :** `christianboddien-source/innovaafric-api`
- **Branche :** `master`
- **Déploiement :** Automatique à chaque `git push origin master`
- **Processus de démarrage :**
  1. Railway installe les dépendances (`npm install`)
  2. `postinstall` exécute `npx prisma generate`
  3. `start` exécute `node scripts/start.js`
  4. Le script démarre Express immédiatement (pour passer le healthcheck)
  5. En arrière-plan : `npx prisma migrate deploy`
- **Temps de déploiement :** ~2-3 minutes

### 6.3 Variables d'Environnement (Railway)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL Railway (injecté automatiquement) |
| `JWT_SECRET` | Secret pour signer les tokens JWT (min 32 caractères) |
| `ALLOWED_ORIGINS` | Domaines CORS autorisés |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_KEY` | Clé secrète Supabase (JAMAIS dans le code public) |
| `WEBHOOK_SECRET` | Secret partagé pour authentifier les webhooks |
| `PORT` | Port du serveur (assigné par Railway) |
| `NODE_ENV` | `production` |

---

## 7. RÉSUMÉ DES TECHNOLOGIES PAR COUCHE

```
┌─────────────────────────────────────────────────┐
│  COUCHE DE PRÉSENTATION                         │
│  HTML5 · CSS3 · JavaScript ES6 · CDN Supabase   │
│  4 Applications monopage (fichiers uniques)     │
│  Hébergement : GitHub Pages (gratuit)           │
├─────────────────────────────────────────────────┤
│  COUCHE DE DONNÉES (côté client)                │
│  @supabase/supabase-js v2 (UMD, sans bundler)   │
│  localStorage pour la session partagée          │
│  fetch() natif pour l'API Railway               │
├─────────────────────────────────────────────────┤
│  COUCHE LOGIQUE MÉTIER (côté serveur)           │
│  Node.js 18+ · Express 4 · Prisma ORM 6         │
│  49 modules de routes · JWT · bcrypt · helmet   │
│  Hébergement : Railway PaaS                     │
├─────────────────────────────────────────────────┤
│  COUCHE DE PERSISTANCE                          │
│  Supabase PostgreSQL 15 (56+ tables)            │
│  Railway PostgreSQL 15 (30+ modèles Prisma)     │
│  Supabase Storage (bucket kyc-docs)             │
│  pg_net (webhooks automatiques)                 │
└─────────────────────────────────────────────────┘
```

---

## 8. FLUX DE DONNÉES COMPLET — EXEMPLE : INSCRIPTION UTILISATEUR

```
1. L'utilisateur remplit le formulaire sur XenderMoney (HTML)
        │
        ▼
2. JavaScript appelle SB.from('users').insert({
     id, email, name, phone, country,
     role: 'customer', kyc_status: 'pending'
   })
        │
        ▼
3. Supabase insère une ligne dans la table 'users'
        │
        ├──► 4a. SB.from('wallets').insert({
        │         user_id, balance_eur: 0, ...
        │       })  ← Wallet créé automatiquement
        │
        └──► 4b. Le trigger pg_net déclenche un POST vers Railway
                  /v1/admin/sync-user
                  ← Railway synchronise dans son propre PostgreSQL

5. localStorage.setItem('xm_session', JSON.stringify(user))
        │
        ▼
6. L'utilisateur voit son tableau de bord avec un solde de €0.00
   — peut naviguer vers XenderShop, XenderDelivery, XenderBigShop
   — le badge de session apparaît automatiquement dans toutes les apps
```

---

*Document généré par INNOVAAFRIC Tech Team — Juin 2026*  
*Generated by INNOVAAFRIC Tech Team — June 2026*  
*Documento generado por INNOVAAFRIC Tech Team — Junio 2026*
