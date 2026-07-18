/**
 * PROXY DE ALIEXPRESS — InnovaAFRIC
 *
 * POR QUÉ EXISTE
 * La API de AliExpress firma cada petición con HMAC-SHA256 usando el
 * `app_secret`. Ese secreto NO puede vivir en el navegador: quien abra el
 * código fuente de xendershop.com lo tendría, y podría gastar la cuota o
 * suplantar a la tienda. Este servicio se queda en el servidor, guarda el
 * secreto en una variable de entorno y expone solo lo que la web necesita.
 *
 * PORTABLE A PROPÓSITO
 * Cero dependencias: solo módulos de Node (>=18). Se ejecuta igual con
 * `node server.js` en Railway que dentro de Docker en el servidor de IONOS.
 * No hay `npm install` que pueda fallar en la migración.
 *
 * ALGORITMO DE FIRMA
 * Verificado contra la implementación de referencia github.com/moh3a/ae_sdk:
 *   1. Si el método lleva "/" (API nueva REST), la cadena base empieza por la
 *      ruta del método y `method` se saca de los parámetros.
 *   2. Se concatenan clave+valor de todos los parámetros no nulos, ordenados
 *      alfabéticamente por clave.
 *   3. HMAC-SHA256 con el app_secret → hexadecimal EN MAYÚSCULAS.
 * El timestamp va en milisegundos (Date.now()), no en texto.
 */

const http = require('http');
const crypto = require('crypto');

// ── Configuración ─────────────────────────────────────────────────────────
const PORT        = process.env.PORT || 3000;
const APP_KEY     = process.env.AE_APP_KEY || '';
const APP_SECRET  = process.env.AE_APP_SECRET || '';
const AE_TRACKING = process.env.AE_TRACKING_ID || '';   // id de afiliado, opcional
const CACHE_TTL   = Number(process.env.CACHE_TTL_MS || 10 * 60 * 1000);

// Solo estos orígenes pueden usar el proxy. Sin esta lista, cualquier web
// podría consumir la cuota de AliExpress de InnovaAFRIC.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://www.xendershop.com,https://xendershop.com,' +
  'https://christianboddien-source.github.io,http://localhost:8899'
).split(',').map(s => s.trim()).filter(Boolean);

const TOP_API = 'https://api-sg.aliexpress.com/sync';
const OP_API  = 'https://api-sg.aliexpress.com/rest';

// ── Firma ─────────────────────────────────────────────────────────────────
function sign(params, secret) {
  const p = { ...params };
  let base = '';
  if (typeof p.method === 'string' && p.method.includes('/')) {
    base = p.method;
    delete p.method;
  }
  base += Object.entries(p)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [k, v]) => acc + k + String(v), '');

  return crypto.createHmac('sha256', secret).update(base, 'utf8')
    .digest('hex').toUpperCase();
}

async function callAliExpress(method, params) {
  const full = {
    ...params,
    method,
    app_key: APP_KEY,
    sign_method: 'sha256',
    timestamp: Date.now(),
    format: 'json',
    v: '2.0'
  };
  full.sign = sign(full, APP_SECRET);

  const isRest = method.includes('/');
  const url = isRest ? OP_API + method : TOP_API;
  const qs = new URLSearchParams(
    Object.entries(full).filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => [k, String(v)])
  );

  // Sin timeout, una API lenta deja peticiones colgadas y agota el servidor.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch(url + '?' + qs.toString(), { signal: ctrl.signal });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error('Respuesta no-JSON de AliExpress: ' + text.slice(0, 200)); }
    // AliExpress devuelve 200 con el error dentro del cuerpo.
    if (data.error_response) {
      const e = data.error_response;
      throw new Error('AliExpress ' + (e.code || '?') + ': ' + (e.msg || e.sub_msg || 'error'));
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// ── Normalización ─────────────────────────────────────────────────────────
// La respuesta viene muy anidada y con nombres distintos según el endpoint.
// Aquí se aplana a la forma que espera xsNormalize() en xendershop.
function pickProducts(data) {
  const resp = data.aliexpress_affiliate_product_query_response
            || data.resp_result || data.result || data;
  const result = resp.resp_result?.result || resp.result || resp;
  const list = result.products?.product || result.products || [];
  return Array.isArray(list) ? list : [list].filter(Boolean);
}

function toCard(p) {
  return {
    product_title:          p.product_title || p.subject || '',
    target_sale_price:      p.target_sale_price || p.sale_price || p.app_sale_price || '0',
    target_original_price:  p.target_original_price || p.original_price || '',
    product_main_image_url: p.product_main_image_url || p.image_url || '',
    discount:               p.discount || '',
    evaluate_rate:          p.evaluate_rate || '',
    lastest_volume:         p.lastest_volume || 0,
    promotion_link:         p.promotion_link || p.product_detail_url || '',
    product_id:             p.product_id || ''
  };
}

// ── Caché en memoria ──────────────────────────────────────────────────────
// Evita repetir la misma búsqueda contra la cuota de AliExpress. Al reiniciar
// se pierde, que es justo lo que queremos: nada que persistir ni invalidar.
const cache = new Map();
function cacheGet(k) {
  const hit = cache.get(k);
  if (hit && Date.now() - hit.t < CACHE_TTL) return hit.v;
  cache.delete(k);
  return null;
}
function cacheSet(k, v) {
  cache.set(k, { t: Date.now(), v });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
}

// ── Servidor ──────────────────────────────────────────────────────────────
function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, 'http://localhost');

  // Sonda de salud. Nunca revela el secreto, solo si está configurado.
  if (url.pathname === '/health') {
    return json(res, 200, {
      ok: true,
      configurado: Boolean(APP_KEY && APP_SECRET),
      cache: cache.size,
      uptime_s: Math.round(process.uptime())
    });
  }

  if (url.pathname === '/aliexpress/products') {
    if (!APP_KEY || !APP_SECRET) {
      return json(res, 503, { error: 'Faltan AE_APP_KEY / AE_APP_SECRET en el entorno' });
    }
    const q = url.searchParams;
    const params = {
      keywords:     q.get('keywords') || '',
      category_ids: q.get('category_id') || '',
      target_currency: q.get('currency') || 'EUR',
      target_language: (q.get('lang') || 'ES').toUpperCase(),
      page_size:    Math.min(Number(q.get('page_size') || 20), 50),
      page_no:      Number(q.get('page') || 1),
      ship_to_country: q.get('ship_to') || '',
      sort:         q.get('sort') || '',
      tracking_id:  AE_TRACKING
    };

    const key = JSON.stringify(params);
    const hit = cacheGet(key);
    if (hit) { res.setHeader('X-Cache', 'HIT'); return json(res, 200, hit); }

    try {
      const raw = await callAliExpress('aliexpress.affiliate.product.query', params);
      const body = { products: pickProducts(raw).map(toCard) };
      cacheSet(key, body);
      res.setHeader('X-Cache', 'MISS');
      return json(res, 200, body);
    } catch (err) {
      // El mensaje de AliExpress puede contener detalles internos: se registra
      // completo en el servidor pero al navegador va solo lo justo.
      console.error('[aliexpress-proxy]', err.message);
      return json(res, 502, { error: 'No se pudo consultar el catálogo', detail: err.message.slice(0, 160) });
    }
  }

  json(res, 404, { error: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log('[aliexpress-proxy] escuchando en :' + PORT);
  if (!APP_KEY || !APP_SECRET) {
    console.warn('[aliexpress-proxy] ⚠ Sin AE_APP_KEY/AE_APP_SECRET: /aliexpress/products devolverá 503 hasta que se configuren.');
  }
});
