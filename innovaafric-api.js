// ═══════════════════════════════════════════════════════════
// INNOVAAFRIC · API CONNECTOR v1.0
// Conecta la app con Railway API. Fallback automático a Supabase.
// Incluir en index.html ANTES del bloque <script> principal:
//   <script src="innovaafric-api.js"></script>
// ═══════════════════════════════════════════════════════════

(function(){

  // ── CONFIGURACIÓN ────────────────────────────────────────
  var API_BASE = 'https://innovaafric-api-production.up.railway.app/v1';
  var API_TIMEOUT = 8000; // 8 segundos antes de usar fallback

  // Token JWT del usuario (se guarda al hacer login)
  var _token = localStorage.getItem('ia_api_token') || null;

  // ── UTILIDADES ───────────────────────────────────────────

  function setToken(token) {
    _token = token;
    if (token) localStorage.setItem('ia_api_token', token);
    else localStorage.removeItem('ia_api_token');
  }

  function getToken() { return _token; }

  function apiHeaders() {
    var h = { 'Content-Type': 'application/json' };
    if (_token) h['Authorization'] = 'Bearer ' + _token;
    return h;
  }

  // Fetch con timeout
  function fetchWithTimeout(url, options, timeout) {
    return Promise.race([
      fetch(url, options),
      new Promise(function(_, reject) {
        setTimeout(function() { reject(new Error('timeout')); }, timeout || API_TIMEOUT);
      })
    ]);
  }

  // Llamada genérica a Railway
  async function apiCall(method, endpoint, body) {
    try {
      var options = {
        method: method,
        headers: apiHeaders()
      };
      if (body) options.body = JSON.stringify(body);
      var res = await fetchWithTimeout(API_BASE + endpoint, options);
      var data = await res.json();
      if (!res.ok) throw new Error(data.error && data.error.message || 'API error ' + res.status);
      return { ok: true, data: data };
    } catch (e) {
      console.warn('[InnovaAFRIC API] ' + endpoint + ' failed:', e.message, '→ using fallback');
      return { ok: false, error: e.message };
    }
  }

  // ── MÓDULO DE TASAS ──────────────────────────────────────
  // Reemplaza el fetch a open.er-api.com

  var _ratesCache = null;
  var _ratesCacheTime = 0;

  window.INNOVA_API = window.INNOVA_API || {};

  window.INNOVA_API.getRates = async function() {
    // Cache de 5 minutos
    if (_ratesCache && (Date.now() - _ratesCacheTime) < 300000) {
      return { ok: true, data: _ratesCache };
    }
    var result = await apiCall('GET', '/utils/rates');
    if (result.ok && result.data) {
      _ratesCache = result.data;
      _ratesCacheTime = Date.now();
      // Actualizar el objeto RATES global de la app si existe
      if (window.RATES && result.data.rates) {
        var r = result.data.rates;
        if (r['EUR-XAF']) window.RATES['EUR-XAF'] = r['EUR-XAF'];
        if (r['EUR-USD']) window.RATES['EUR-USD'] = r['EUR-USD'];
        if (r['EUR-XOF']) window.RATES['EUR-XOF'] = r['EUR-XOF'];
        if (r['USD-XAF']) window.RATES['USD-XAF'] = r['USD-XAF'];
        if (r['XAF-EUR']) window.RATES['XAF-EUR'] = r['XAF-EUR'];
        if (r['USD-EUR']) window.RATES['USD-EUR'] = r['USD-EUR'];
        console.log('[InnovaAFRIC API] ✅ Tasas actualizadas desde Railway');
      }
    }
    return result;
  };

  // ── MÓDULO DE AUTH ───────────────────────────────────────

  window.INNOVA_API.login = async function(email, password) {
    var result = await apiCall('POST', '/auth/token', { email: email, password: password });
    if (result.ok && result.data && result.data.token) {
      setToken(result.data.token);
      console.log('[InnovaAFRIC API] ✅ Login via Railway OK');
      return { ok: true, token: result.data.token, user: result.data.user };
    }
    return { ok: false };
  };

  window.INNOVA_API.register = async function(userData) {
    // userData: { email, password, full_name, role, country, phone, city,
    //             postal_code, street, street_number, floor }
    var result = await apiCall('POST', '/auth/register', userData);
    if (result.ok && result.data && result.data.token) {
      setToken(result.data.token);
      console.log('[InnovaAFRIC API] ✅ Registro via Railway OK');
      return { ok: true, token: result.data.token, user: result.data.user };
    }
    return { ok: false };
  };

  window.INNOVA_API.logout = function() {
    setToken(null);
  };

  // ── MÓDULO DE WALLET / SALDO ─────────────────────────────

  window.INNOVA_API.getBalance = async function() {
    if (!_token) return { ok: false, error: 'no token' };
    var result = await apiCall('GET', '/money/balance');
    if (result.ok && result.data) {
      console.log('[InnovaAFRIC API] ✅ Balance via Railway OK');
      // Actualizar WALLET global si existe
      if (window.WALLET && result.data.wallet) {
        var w = result.data.wallet;
        window.WALLET.eur = w.eur || 0;
        window.WALLET.xaf = w.xaf || 0;
        window.WALLET.usd = w.usd || 0;
        window.WALLET.points = w.points || 0;
        if (typeof window.updBal === 'function') window.updBal();
      }
    }
    return result;
  };

  // ── MÓDULO DE ENVÍOS ─────────────────────────────────────

  window.INNOVA_API.send = async function(sendData) {
    // sendData: { amount, from_currency, to_currency, recipient_phone,
    //             recipient_name, description, type ('send'|'p2p'), recipient_code }
    if (!_token) return { ok: false, error: 'no token' };
    var result = await apiCall('POST', '/money/send', sendData);
    if (result.ok) {
      console.log('[InnovaAFRIC API] ✅ Envío via Railway OK');
      // Refrescar saldo
      setTimeout(window.INNOVA_API.getBalance, 1000);
    }
    return result;
  };

  // ── MÓDULO DE REINTEGROS ─────────────────────────────────

  window.INNOVA_API.withdraw = async function(withdrawData) {
    // withdrawData: { amount, currency, method ('circular'|'mtn'|'orange'|'bank'), account }
    if (!_token) return { ok: false, error: 'no token' };
    var result = await apiCall('POST', '/money/withdraw', withdrawData);
    if (result.ok) {
      console.log('[InnovaAFRIC API] ✅ Reintegro via Railway OK');
      setTimeout(window.INNOVA_API.getBalance, 1000);
    }
    return result;
  };

  // ── MÓDULO DE TRANSFERENCIA INTERNA ──────────────────────

  window.INNOVA_API.transfer = async function(fromCurrency, toCurrency, amount) {
    if (!_token) return { ok: false, error: 'no token' };
    var result = await apiCall('POST', '/money/transfer', {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount: amount
    });
    if (result.ok) {
      console.log('[InnovaAFRIC API] ✅ Transferencia interna via Railway OK');
      setTimeout(window.INNOVA_API.getBalance, 1000);
    }
    return result;
  };

  // ── MÓDULO DE SALUD / ESTADO ─────────────────────────────

  window.INNOVA_API.health = async function() {
    var result = await apiCall('GET', '/utils/health');
    return result;
  };

  // ── AUTO-INICIALIZACIÓN ──────────────────────────────────
  // Cuando la app carga, verificar que Railway está activa y precargar tasas

  window.INNOVA_API.init = async function() {
    // 1. Verificar health
    var health = await window.INNOVA_API.health();
    if (health.ok) {
      console.log('[InnovaAFRIC API] ✅ Railway activa —', health.data && health.data.status);
      // Mostrar indicador visual si existe
      var dot = document.getElementById('api-status-dot');
      if (dot) { dot.style.background = '#10b981'; dot.title = 'API Railway activa'; }
    } else {
      console.warn('[InnovaAFRIC API] ⚠️ Railway no responde — modo Supabase directo');
      var dot = document.getElementById('api-status-dot');
      if (dot) { dot.style.background = '#f59e0b'; dot.title = 'API Railway no disponible — usando Supabase'; }
    }

    // 2. Precargar tasas de cambio
    await window.INNOVA_API.getRates();
  };

  // ── INTERCEPTOR DE FUNCIONES EXISTENTES ─────────────────
  // Se engancha con las funciones de la app DESPUÉS de que se definan.
  // Usando DOMContentLoaded para esperar a que el script principal cargue.

  document.addEventListener('DOMContentLoaded', function() {
    // Esperar un tick para que el script principal defina sus funciones
    setTimeout(function() {

      // ── INTERCEPTAR fetchLiveRates ────────────────────────
      if (typeof window.fetchLiveRates === 'function') {
        var _origFetchRates = window.fetchLiveRates;
        window.fetchLiveRates = async function() {
          var result = await window.INNOVA_API.getRates();
          if (result.ok) {
            // Actualizar UI de tasas si existe
            if (typeof window.renderLiveRates === 'function') window.renderLiveRates();
            if (typeof window.renderRatesChart === 'function') window.renderRatesChart();
            var el = document.getElementById('rates-updated');
            if (el) el.textContent = new Date().toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit'});
          } else {
            // Fallback al método original
            _origFetchRates();
          }
        };
        console.log('[InnovaAFRIC API] ✅ fetchLiveRates interceptado');
      }

      // ── INTERCEPTAR doSend ────────────────────────────────
      if (typeof window.doSend === 'function') {
        var _origDoSend = window.doSend;
        window.doSend = async function() {
          // Solo interceptar si hay token (usuario logueado via Railway)
          if (!window.INNOVA_API.getToken || !window.INNOVA_API.getToken()) {
            _origDoSend();
            return;
          }
          var amt = parseFloat(document.getElementById('s-amt') && document.getElementById('s-amt').value) || 0;
          var from = document.getElementById('s-fc') && document.getElementById('s-fc').value || 'EUR';
          var to = document.getElementById('s-tc') && document.getElementById('s-tc').value || 'XAF';
          var desc = document.getElementById('s-ds') && document.getElementById('s-ds').value || '';
          var sendData = { amount: amt, from_currency: from, to_currency: to, description: desc };
          // Determinar tipo
          var ST = window.ST || 'intl';
          if (ST === 'p2p') {
            sendData.type = 'p2p';
            sendData.recipient_code = document.getElementById('s-code') && document.getElementById('s-code').value || '';
          } else {
            sendData.type = 'send';
            var cc = document.getElementById('s-country-code') && document.getElementById('s-country-code').value || '';
            var phone = document.getElementById('s-dest') && document.getElementById('s-dest').value || '';
            sendData.recipient_phone = cc + phone;
            sendData.recipient_name = document.getElementById('s-name') && document.getElementById('s-name').value || '';
          }
          var result = await window.INNOVA_API.send(sendData);
          if (result.ok) {
            // Railway procesó el envío, mostrar confirmación
            if (typeof window.showOK === 'function') {
              var recv = result.data && result.data.amount_received;
              var recvStr = recv ? (Math.round(recv).toLocaleString('es') + ' ' + to) : '—';
              window.showOK('¡Enviado!', 'El destinatario recibirá ' + recvStr + ' en minutos.');
            }
            if (typeof window.addNotif === 'function') window.addNotif('💸', 'Envío completado', 'Procesado via InnovaAFRIC API');
          } else {
            // Fallback a Supabase directo
            console.warn('[InnovaAFRIC API] send falló, usando Supabase directo');
            _origDoSend();
          }
        };
        console.log('[InnovaAFRIC API] ✅ doSend interceptado');
      }

      // ── INTERCEPTAR doCO (reintegros) ─────────────────────
      if (typeof window.doCO === 'function') {
        var _origDoCO = window.doCO;
        window.doCO = async function() {
          if (!window.INNOVA_API.getToken || !window.INNOVA_API.getToken()) {
            _origDoCO();
            return;
          }
          var amt = parseFloat(document.getElementById('co-a') && document.getElementById('co-a').value) || 0;
          var curr = document.getElementById('co-c') && document.getElementById('co-c').value || 'EUR';
          var method = window.COM || 'circular';
          var account = document.getElementById('co-acc') && document.getElementById('co-acc').value || '';
          var result = await window.INNOVA_API.withdraw({ amount: amt, currency: curr, method: method, account: account });
          if (result.ok) {
            var times = { circular: '15 minutos', mtn: '2 horas', orange: '2 horas', bank: '24-48 horas' };
            if (typeof window.showOK === 'function') window.showOK('¡Solicitado!', 'Tu reintegro de ' + amt + ' ' + curr + ' llegará en ' + (times[method] || 'breve'));
            if (typeof window.addNotif === 'function') window.addNotif('🏦', 'Reintegro solicitado', amt + ' ' + curr + ' via ' + method);
          } else {
            _origDoCO();
          }
        };
        console.log('[InnovaAFRIC API] ✅ doCO interceptado');
      }

      // ── INTERCEPTAR doXfer (cambio interno) ───────────────
      if (typeof window.doXfer === 'function') {
        var _origDoXfer = window.doXfer;
        window.doXfer = async function() {
          if (!window.INNOVA_API.getToken || !window.INNOVA_API.getToken()) {
            _origDoXfer();
            return;
          }
          var from = document.getElementById('xfer-from') && document.getElementById('xfer-from').value || 'EUR';
          var to = document.getElementById('xfer-to') && document.getElementById('xfer-to').value || 'XAF';
          var amt = parseFloat(document.getElementById('xfer-amt') && document.getElementById('xfer-amt').value) || 0;
          var result = await window.INNOVA_API.transfer(from, to, amt);
          if (result.ok) {
            var recv = result.data && result.data.amount_received;
            if (typeof window.showOK === 'function') window.showOK('¡Cambio completado!', amt + ' ' + from + ' convertido correctamente.');
            if (typeof window.updBal === 'function') window.updBal();
          } else {
            _origDoXfer();
          }
        };
        console.log('[InnovaAFRIC API] ✅ doXfer interceptado');
      }

      // ── INIT ──────────────────────────────────────────────
      window.INNOVA_API.init();
      console.log('[InnovaAFRIC API] 🚀 Connector v1.0 iniciado');

    }, 500); // 500ms para que el script principal cargue
  });

  // Exponer getToken para uso externo
  window.INNOVA_API.getToken = function() { return _token; };

})();
