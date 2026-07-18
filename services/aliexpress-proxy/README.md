# Proxy de AliExpress — InnovaAFRIC

Servicio que firma las llamadas a la API de AliExpress **en el servidor**, para
que el `app_secret` no acabe en el navegador.

Sin él, el secreto tendría que ir en `xendershop/index.html` y estaría a la
vista de cualquiera que abriese el código fuente: podrían agotar la cuota de
peticiones o hacerse pasar por la tienda.

## Estado

| | |
|---|---|
| Algoritmo de firma | ✅ Verificado contra [ae_sdk](https://github.com/moh3a/ae_sdk) — 4/4 casos idénticos, incluidos acentos y orden alterado |
| Montaje de la petición | ✅ Probado contra la API real de AliExpress |
| Manejo de errores | ✅ Probado (`InvalidAppKey` → 502 con mensaje seguro) |
| CORS | ✅ Probado: permite los orígenes de la lista, ignora el resto |
| Respuesta correcta | ⏳ **Sin verificar** — necesita credenciales reales |

Lo último es importante: AliExpress valida el `app_key` **antes** que la firma,
así que con una clave falsa no se llega a comprobar si la firma se acepta. Por
eso la firma se validó contra la implementación de referencia. La primera
llamada con credenciales de verdad es la prueba definitiva.

## Puesta en marcha

### En Railway (ahora)

1. Nuevo servicio → apuntar a este repo, carpeta `services/aliexpress-proxy`.
2. Variables de entorno: copiar de `.env.example`. **El `AE_APP_SECRET` se
   pega directamente en el panel de Railway, nunca en un archivo del repo.**
3. Railway inyecta `PORT` solo. Arranque: `npm start`.

### En Docker / IONOS (después)

```bash
docker compose up -d aliexpress-proxy
```

El `docker-compose.yml` está en la raíz del repo. Lee el secreto desde un
archivo `.env` que **no se sube a Git** (ya está en `.gitignore`).

## Conectarlo con XenderShop

En `xendershop/index.html`, en el bloque `XS_SOURCE`:

```js
var XS_SOURCE={
  aliexpress:{
    enabled: true,                                     // ← cambiar a true
    endpoint: 'https://tu-proxy.up.railway.app/aliexpress/products',
    ttl: 600000
  },
  supabase:{enabled:true}
};
```

Nada más. El resto de la página ya está preparado: `xsFetchProducts()` prueba
AliExpress primero y cae a Supabase si falla, y `xsNormalize()` entiende ya el
formato que devuelve este proxy.

## Endpoints

### `GET /health`

```json
{"ok":true,"configurado":true,"cache":12,"uptime_s":3600}
```

`configurado` dice si hay credenciales, sin revelarlas. Útil para monitorizar.

### `GET /aliexpress/products`

| Parámetro | Por defecto | Notas |
|---|---|---|
| `keywords` | — | Lo que más manda en la búsqueda |
| `category_id` | — | Id de categoría de AliExpress |
| `currency` | `EUR` | |
| `lang` | `ES` | |
| `page_size` | 20 | Máximo 50 |
| `page` | 1 | |
| `ship_to` | — | País de destino (`CM`, `GQ`, `CI`…) |

Respuesta:

```json
{ "products": [ { "product_title": "...", "target_sale_price": "12.99", ... } ] }
```

Cabecera `X-Cache: HIT|MISS`. Cada búsqueda se guarda 10 minutos en memoria
para no gastar cuota repitiendo lo mismo.

## Sobre los ids de categoría

Los `ae` de `XS_CATS` en `xendershop/index.html` **están sin confirmar**. Una
vez tengas el App Key, sácalos de verdad con:

```
aliexpress.affiliate.category.get
```

Mientras tanto la búsqueda por `keywords` funciona igual de bien y no depende
de que los ids sean correctos.

## Seguridad

- El `app_secret` solo vive en variables de entorno. No está en el repo ni
  llega nunca al navegador.
- `ALLOWED_ORIGINS` limita quién puede usar el proxy. Si se deja abierto,
  cualquier web puede consumir la cuota de AliExpress de InnovaAFRIC.
- Los errores de AliExpress se registran completos en el servidor pero al
  navegador va solo un extracto: pueden contener detalles internos.
- El contenedor no corre como root.
