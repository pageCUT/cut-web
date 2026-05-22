/* ================================================================
   CUT — Confederación Unitaria de Trabajadores
   main.js  |  v3.0
   Incluye: Panel accesibilidad estilo UserWay | PWA | Seguridad
   ================================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. AÑOS AUTOMÁTICOS (23 nov de cada año)
     ============================================================ */
  function calcYears() {
    var now = new Date();
    var aniv = new Date(now.getFullYear(), 10, 23);
    return now >= aniv ? now.getFullYear() - 1980 : now.getFullYear() - 1981;
  }
  function updateYears() {
    document.querySelectorAll('[data-years]').forEach(function(el) {
      el.textContent = calcYears();
    });
    var fy = document.getElementById('fyear');
    if (fy) fy.textContent = new Date().getFullYear();
  }

  /* ============================================================
     2. READING PROGRESS BAR
     ============================================================ */
  function initReadBar() {
    var bar = document.getElementById('readBar');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }, { passive: true });
  }

  /* ============================================================
     3. HAMBURGER NAV
     ============================================================ */
  function initHamburger() {
    var btn  = document.getElementById('burger');
    var menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     4. FADE-IN ON SCROLL
     ============================================================ */
  function initFadeIn() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fi').forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     5. ACTIVE NAV + SMOOTH SCROLL
     ============================================================ */
  function initNav() {
    var links = document.querySelectorAll('.nav-link[href^="#"]');
    window.addEventListener('scroll', function () {
      var pos = window.scrollY + 100;
      document.querySelectorAll('section[id]').forEach(function (sec) {
        if (sec.offsetTop <= pos && sec.offsetTop + sec.offsetHeight > pos) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var m = document.querySelector('.nav-link[href="#' + sec.id + '"]');
          if (m) m.classList.add('active');
        }
      });
    }, { passive: true });

    var navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 64;
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        var el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
        }
      });
    });
  }

  /* ============================================================
     6. HERO DOTS AUTO-ROTATE
     ============================================================ */
  function initHeroDots() {
    var dots = document.querySelectorAll('.hero-dot');
    if (!dots.length) return;
    var idx = 0;
    setInterval(function () {
      dots.forEach(function (d) { d.classList.remove('active'); });
      idx = (idx + 1) % dots.length;
      dots[idx].classList.add('active');
    }, 4200);
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        dots.forEach(function (d) { d.classList.remove('active'); });
        dot.classList.add('active');
      });
    });
  }

  /* ============================================================
     7. SEGURIDAD — SANITIZACIÓN DE INPUTS
     Previene XSS e inyección en formularios
     ============================================================ */
  var Security = {
    /* Escapa caracteres HTML peligrosos */
    escapeHtml: function(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#x60;')
        .replace(/=/g, '&#x3D;');
    },

    /* Elimina caracteres de control y scripts */
    sanitize: function(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:/gi, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim()
        .slice(0, 2000);
    },

    /* Valida email */
    isValidEmail: function(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
    },

    /* Valida teléfono Costa Rica y general */
    isValidPhone: function(phone) {
      return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
    },

    /* Rate limiting simple en el cliente (localStorage) */
    rateLimit: function(key, maxRequests, windowMs) {
      var now = Date.now();
      var stored = '{}';
      try { stored = localStorage.getItem('rl_' + key) || '{}'; } catch(e) {}
      var data = {};
      try { data = JSON.parse(stored); } catch(e) {}
      data.requests = (data.requests || []).filter(function(t) { return now - t < windowMs; });
      if (data.requests.length >= maxRequests) return false;
      data.requests.push(now);
      try { localStorage.setItem('rl_' + key, JSON.stringify(data)); } catch(e) {}
      return true;
    },

    /* Sanitiza todos los inputs de un form */
    sanitizeForm: function(form) {
      var errors = [];
      form.querySelectorAll('input, textarea, select').forEach(function(field) {
        if (field.type === 'checkbox' || field.type === 'radio') return;
        field.value = Security.sanitize(field.value);
      });
      return errors;
    },

    /* Honeypot anti-bot: agrega campo oculto */
    addHoneypot: function(form) {
      if (form.querySelector('[name="website_url"]')) return;
      var hp = document.createElement('input');
      hp.type = 'text';
      hp.name = 'website_url';
      hp.autocomplete = 'off';
      hp.tabIndex = -1;
      hp.setAttribute('aria-hidden', 'true');
      hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
      form.appendChild(hp);
    },

    /* Verifica honeypot (si tiene valor = bot) */
    checkHoneypot: function(form) {
      var hp = form.querySelector('[name="website_url"]');
      return hp && hp.value.length > 0;
    }
  };

  /* ============================================================
     8. FORMULARIO DE CONTACTO — con sanitización
     ============================================================ */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    Security.addHoneypot(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fb = document.getElementById('ffb');

      /* Rate limiting: máx 3 envíos por 5 minutos */
      if (!Security.rateLimit('contact_form', 3, 5 * 60 * 1000)) {
        if (fb) {
          fb.style.display = 'block';
          fb.style.color = '#C0001A';
          fb.textContent = 'Ha enviado demasiados mensajes. Por favor espere unos minutos.';
        }
        return;
      }

      /* Anti-bot honeypot */
      if (Security.checkHoneypot(form)) return;

      /* Sanitizar todos los campos */
      Security.sanitizeForm(form);

      /* Validar campos */
      var fn   = Security.sanitize(document.getElementById('fn')  ? document.getElementById('fn').value  : '');
      var fe   = Security.sanitize(document.getElementById('fe')  ? document.getElementById('fe').value  : '');
      var fm   = Security.sanitize(document.getElementById('fm')  ? document.getElementById('fm').value  : '');
      var fsuj = document.getElementById('fsuj') ? document.getElementById('fsuj').value : '';

      if (!fn || !fe || !fm) {
        if (fb) { fb.style.display = 'block'; fb.style.color = '#C0001A'; fb.textContent = 'Por favor complete todos los campos requeridos.'; }
        return;
      }
      if (!Security.isValidEmail(fe)) {
        if (fb) { fb.style.display = 'block'; fb.style.color = '#C0001A'; fb.textContent = 'Por favor ingrese un correo electrónico válido.'; }
        return;
      }

      if (fb) {
        fb.style.display = 'block';
        fb.style.color = '#1a6b5c';
        fb.textContent = '✓ Mensaje enviado. Nos comunicaremos pronto.';
      }
      form.reset();
      setTimeout(function() { if (fb) fb.style.display = 'none'; }, 6000);
    });
  }

  /* ============================================================
     9. FORMULARIO DE AFILIACIÓN — con sanitización
     ============================================================ */
  function initAffForm() {
    var form = document.getElementById('affForm');
    if (!form) return;
    Security.addHoneypot(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fb = document.getElementById('aff-fb');

      if (!Security.rateLimit('aff_form', 2, 10 * 60 * 1000)) {
        if (fb) { fb.style.display = 'block'; fb.style.color = '#C0001A'; fb.textContent = 'Ya envió una solicitud recientemente. Intente en unos minutos.'; }
        return;
      }
      if (Security.checkHoneypot(form)) return;
      Security.sanitizeForm(form);

      var nombre  = document.getElementById('aff-nombre')  ? document.getElementById('aff-nombre').value.trim()  : '';
      var email   = document.getElementById('aff-email')   ? document.getElementById('aff-email').value.trim()   : '';
      var tel     = document.getElementById('aff-tel')     ? document.getElementById('aff-tel').value.trim()     : '';
      var sector  = document.getElementById('aff-sector')  ? document.getElementById('aff-sector').value         : '';
      var cedula  = document.getElementById('aff-cedula')  ? document.getElementById('aff-cedula').value.trim()  : '';

      if (!nombre || !email || !tel || !sector || !cedula) {
        if (fb) { fb.style.display = 'block'; fb.style.background = 'rgba(192,0,26,0.06)'; fb.style.color = '#C0001A'; fb.style.border = '1px solid rgba(192,0,26,0.2)'; fb.textContent = 'Por favor complete todos los campos requeridos.'; }
        return;
      }
      if (!Security.isValidEmail(email)) {
        if (fb) { fb.style.display = 'block'; fb.style.background = 'rgba(192,0,26,0.06)'; fb.style.color = '#C0001A'; fb.style.border = '1px solid rgba(192,0,26,0.2)'; fb.textContent = 'Por favor ingrese un correo electrónico válido.'; }
        return;
      }
      if (fb) {
        fb.style.display = 'block';
        fb.style.background = 'rgba(26,107,92,0.06)';
        fb.style.color = '#1a6b5c';
        fb.style.border = '1px solid rgba(26,107,92,0.2)';
        fb.textContent = '✓ Solicitud enviada. Un representante de la CUT se comunicará en 48 horas.';
      }
      form.reset();
      setTimeout(function() { if (fb) fb.style.display = 'none'; }, 8000);
    });
  }

  /* ============================================================
     10. PANEL DE ACCESIBILIDAD — ESTILO USERWAY
     ============================================================ */
  var A11Y_PREFS_KEY = 'cut_a11y_v3';
  var ttsUtterance  = null;
  var ttsActive     = false;

  /* Estado de todas las opciones */
  var A11Y = {
    fontSize:    1,
    contrast:    false,
    dyslexia:    false,
    lowStim:     false,
    bigCursor:   false,
    lineHeight:  false,
    letterSpace: false,
    align:       false,
    saturation:  false,
    hideImages:  false,
    links:       false,
    tts:         false
  };

  /* Aplicar todas las opciones al DOM */
  function applyA11Y() {
    var b = document.body;
    var h = document.documentElement;

    /* Tamaño de fuente */
    h.style.fontSize = (16 * A11Y.fontSize) + 'px';

    /* Clases en body */
    b.classList.toggle('a11y-contrast',    A11Y.contrast);
    b.classList.toggle('a11y-dyslexia',    A11Y.dyslexia);
    b.classList.toggle('a11y-low-stim',    A11Y.lowStim);
    b.classList.toggle('a11y-big-cursor',  A11Y.bigCursor);
    b.classList.toggle('a11y-line-height', A11Y.lineHeight);
    b.classList.toggle('a11y-letter-space',A11Y.letterSpace);
    b.classList.toggle('a11y-align',       A11Y.align);
    b.classList.toggle('a11y-saturation',  A11Y.saturation);
    b.classList.toggle('a11y-hide-images', A11Y.hideImages);
    b.classList.toggle('a11y-links',       A11Y.links);

    /* Actualizar UI del panel */
    updateA11yUI();
  }

  function updateA11yUI() {
    /* Font size buttons */
    document.querySelectorAll('.uw-fs-btn').forEach(function(btn) {
      var active = parseFloat(btn.dataset.fs) === A11Y.fontSize;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });
    /* Toggle options */
    var map = {
      'uw-contrast':    'contrast',
      'uw-dyslexia':    'dyslexia',
      'uw-lowstim':     'lowStim',
      'uw-cursor':      'bigCursor',
      'uw-lineheight':  'lineHeight',
      'uw-letterspace': 'letterSpace',
      'uw-align':       'align',
      'uw-saturation':  'saturation',
      'uw-hideimages':  'hideImages',
      'uw-links':       'links',
      'uw-tts':         'tts'
    };
    Object.keys(map).forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var on = A11Y[map[id]];
      el.classList.toggle('active', on);
      el.setAttribute('aria-checked', on);
    });
  }

  /* Guardar prefs */
  function saveA11Y() {
    try { localStorage.setItem(A11Y_PREFS_KEY, JSON.stringify(A11Y)); } catch(e) {}
  }

  /* Cargar prefs */
  function loadA11Y() {
    try {
      var p = JSON.parse(localStorage.getItem(A11Y_PREFS_KEY));
      if (!p) return;
      Object.keys(A11Y).forEach(function(k) {
        if (p[k] !== undefined) A11Y[k] = p[k];
      });
      applyA11Y();
    } catch(e) {}
  }

  /* Toggle de una opción */
  function toggleOption(key) {
    A11Y[key] = !A11Y[key];
    applyA11Y();
    saveA11Y();
  }

  /* TTS */
  function getPageText() {
    var ids = ['noticias', 'sobre', 'mision', 'sindicatos', 'junta', 'main-content'];
    var text = 'Página oficial de la Confederación Unitaria de Trabajadores de Costa Rica. Fundada el 23 de noviembre de 1980. Siempre con el Pueblo. ';
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) text += el.innerText.replace(/\s+/g, ' ').trim() + ' ';
    });
    return text.slice(0, 5000);
  }

  function startTTS() {
    window.speechSynthesis.cancel();
    ttsUtterance = new SpeechSynthesisUtterance(getPageText());
    ttsUtterance.lang = 'es-CR';
    ttsUtterance.rate = 0.92;
    var statusEl = document.getElementById('uw-tts-status');
    ttsUtterance.onstart  = function() { if (statusEl) statusEl.textContent = '▶ Leyendo...'; };
    ttsUtterance.onend    = function() {
      ttsActive = false; A11Y.tts = false;
      if (statusEl) statusEl.textContent = '✓ Completado';
      updateA11yUI();
    };
    ttsUtterance.onerror  = function() {
      ttsActive = false; A11Y.tts = false;
      if (statusEl) statusEl.textContent = '';
      updateA11yUI();
    };
    window.speechSynthesis.speak(ttsUtterance);
    ttsActive = true;
  }

  function stopTTS() {
    window.speechSynthesis.cancel();
    ttsActive = false;
    var statusEl = document.getElementById('uw-tts-status');
    if (statusEl) statusEl.textContent = '';
  }

  /* Inyectar el CSS del panel y modos de accesibilidad */
  function injectA11yStyles() {
    if (document.getElementById('cut-a11y-styles')) return;
    var style = document.createElement('style');
    style.id = 'cut-a11y-styles';
    style.textContent = [
      /* Accessibility body classes */
      'body.a11y-contrast{filter:contrast(1.85) brightness(0.88)!important}',
      'body.a11y-dyslexia,body.a11y-dyslexia *{font-family:"Atkinson Hyperlegible",sans-serif!important;letter-spacing:.05em;word-spacing:.14em}',
      'body.a11y-low-stim *{animation:none!important;transition:none!important}',
      'body.a11y-big-cursor,body.a11y-big-cursor *{cursor:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Cpath d=\'M8 2L8 26L14 20L20 30L24 28L18 18L26 18Z\' fill=\'%23C0001A\' stroke=\'white\' stroke-width=\'2\'/%3E%3C/svg%3E") 0 0,auto!important}',
      'body.a11y-line-height *{line-height:2!important}',
      'body.a11y-letter-space *{letter-spacing:.12em!important;word-spacing:.16em!important}',
      'body.a11y-align p,body.a11y-align li,body.a11y-align td{text-align:left!important}',
      'body.a11y-saturation{filter:saturate(0)!important}',
      'body.a11y-hide-images img,body.a11y-hide-images [style*="background-image"]{visibility:hidden!important}',
      'body.a11y-links a{text-decoration:underline!important;text-underline-offset:3px!important;outline:2px solid rgba(192,0,26,0.5)!important;outline-offset:2px!important;border-radius:2px!important}',
      /* Panel FAB */
      '.uw-fab{position:fixed;right:1.5rem;bottom:1rem;z-index:99999;width:50px;height:50px;border-radius:50%;background:#1a6b5c;border:2px solid rgba(255,255,255,.2);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.35);transition:all .22s;outline:none}',
      '.uw-fab:hover{background:#0f4f40;transform:scale(1.1)}',
      '.uw-fab:focus-visible{outline:3px solid #F5C300;outline-offset:2px}',
      '.uw-fab svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
      /* Panel */
      '.uw-panel{position:fixed;right:1.5rem;bottom:5.5rem;z-index:99998;width:320px;background:#fff;border-radius:16px;box-shadow:0 8px 48px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.1);overflow:hidden;transform:translateY(18px) scale(.95);opacity:0;pointer-events:none;transition:all .28s cubic-bezier(.4,0,.2,1)}',
      '.uw-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all}',
      /* Panel header */
      '.uw-head{background:#1a1a1a;padding:.9rem 1.1rem;display:flex;align-items:center;justify-content:space-between}',
      '.uw-head-left{display:flex;align-items:center;gap:.55rem}',
      '.uw-head-logo{width:28px;height:28px;border-radius:50%;background:#1a6b5c;display:flex;align-items:center;justify-content:center}',
      '.uw-head-logo svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
      '.uw-head-title{font-family:system-ui,sans-serif;font-weight:600;font-size:15px;color:#fff;letter-spacing:.02em}',
      '.uw-head-close{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:background .2s;line-height:1}',
      '.uw-head-close:hover{background:rgba(255,255,255,.28)}',
      /* Keyboard hint */
      '.uw-kbd{font-size:10px;color:rgba(255,255,255,.45);font-family:monospace;background:rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;margin-left:4px}',
      /* Body */
      '.uw-body{padding:1rem;max-height:72vh;overflow-y:auto}',
      '.uw-body::-webkit-scrollbar{width:4px}',
      '.uw-body::-webkit-scrollbar-track{background:transparent}',
      '.uw-body::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px}',
      '.uw-section-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.18em;color:#999;margin:.85rem 0 .55rem;font-family:system-ui,sans-serif}',
      /* Font size row */
      '.uw-fs-row{display:flex;gap:.5rem;margin-bottom:.85rem}',
      '.uw-fs-btn{flex:1;padding:.6rem .3rem;border:1.5px solid rgba(0,0,0,.1);border-radius:10px;background:#f5f5f5;cursor:pointer;font-family:system-ui,sans-serif;font-weight:600;color:#555;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:2px}',
      '.uw-fs-btn .fs-lbl{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#aaa;margin-top:1px}',
      '.uw-fs-btn:hover{border-color:#1a6b5c;color:#1a6b5c}',
      '.uw-fs-btn.active{background:#1a6b5c;border-color:#1a6b5c;color:#fff}',
      '.uw-fs-btn.active .fs-lbl{color:rgba(255,255,255,.8)}',
      /* Option grid */
      '.uw-grid{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin-bottom:.85rem}',
      '.uw-opt{padding:.75rem .7rem;border:1.5px solid rgba(0,0,0,.09);border-radius:10px;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;transition:all .2s;font-family:system-ui,sans-serif;min-height:78px}',
      '.uw-opt:hover{border-color:#1a6b5c;background:rgba(26,107,92,.04)}',
      '.uw-opt.active{background:#1a6b5c;border-color:#1a6b5c}',
      '.uw-opt.active *{color:#fff!important}',
      '.uw-opt-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#444}',
      '.uw-opt-icon svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
      '.uw-opt-label{font-size:11.5px;font-weight:600;color:#333;text-align:center;line-height:1.25}',
      /* TTS full-width */
      '.uw-tts-btn{width:100%;padding:.7rem 1rem;border:2px solid #1a6b5c;border-radius:10px;background:#fff;cursor:pointer;display:flex;align-items:center;gap:.7rem;font-family:system-ui,sans-serif;font-size:13.5px;font-weight:600;color:#1a6b5c;transition:all .2s;margin-bottom:.55rem}',
      '.uw-tts-btn:hover,.uw-tts-btn.active{background:#1a6b5c;color:#fff}',
      '.uw-tts-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;flex-shrink:0}',
      '.uw-tts-status{font-size:11px;color:#888;text-align:center;min-height:14px;margin-bottom:.75rem;font-style:italic}',
      /* Reset button */
      '.uw-reset{width:100%;padding:.7rem 1rem;border:1.5px solid #C0001A;border-radius:10px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem;font-family:system-ui,sans-serif;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:#C0001A;transition:all .2s}',
      '.uw-reset:hover{background:#C0001A;color:#fff}',
      /* UserWay branding footer */
      '.uw-footer{padding:.65rem 1rem;border-top:0.5px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:center;gap:.4rem;background:#fafafa}',
      '.uw-footer-text{font-size:10px;color:#bbb;font-family:system-ui,sans-serif;letter-spacing:.04em}',
      /* Social float position adjustment */
      '.social-float{bottom:5.5rem}',
      /* Responsive */
      '@media(max-width:560px){.uw-panel{right:.5rem;width:calc(100vw - 1rem)}.uw-fab{right:.75rem;bottom:.75rem}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* Crear el HTML del panel */
  function createA11yPanel() {
    if (document.getElementById('uwPanel')) return;

    var fab = document.createElement('button');
    fab.id = 'uwFab';
    fab.className = 'uw-fab';
    fab.setAttribute('aria-label', 'Abrir menú de accesibilidad (Ctrl+U)');
    fab.setAttribute('aria-controls', 'uwPanel');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.8"/><path d="M12 7v5"/><path d="M8 10h8"/><path d="M10 15l-2 5"/><path d="M14 15l2 5"/></svg>';
    document.body.appendChild(fab);

    var panel = document.createElement('div');
    panel.id = 'uwPanel';
    panel.className = 'uw-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Menú de accesibilidad');
    panel.innerHTML = [
      '<div class="uw-head">',
        '<div class="uw-head-left">',
          '<div class="uw-head-logo" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8"/><path d="M12 7v5"/><path d="M8 10h8"/><path d="M10 15l-2 5"/><path d="M14 15l2 5"/></svg></div>',
          '<span class="uw-head-title">Menú de Accesibilidad</span>',
          '<span class="uw-kbd">Ctrl+U</span>',
        '</div>',
        '<button class="uw-head-close" id="uwClose" aria-label="Cerrar menú de accesibilidad">✕</button>',
      '</div>',
      '<div class="uw-body">',
        /* Font size */
        '<div class="uw-section-title">Tamaño de texto</div>',
        '<div class="uw-fs-row" role="group" aria-label="Tamaño de texto">',
          '<button class="uw-fs-btn" data-fs="1"    aria-pressed="true"><span style="font-size:1.1rem">A</span><span class="fs-lbl">Normal</span></button>',
          '<button class="uw-fs-btn" data-fs="1.25" aria-pressed="false"><span style="font-size:1.35rem">A</span><span class="fs-lbl">+25%</span></button>',
          '<button class="uw-fs-btn" data-fs="1.5"  aria-pressed="false"><span style="font-size:1.6rem">A</span><span class="fs-lbl">+50%</span></button>',
        '</div>',
        /* Grid de opciones */
        '<div class="uw-section-title">Opciones visuales</div>',
        '<div class="uw-grid">',
          mkOpt('uw-contrast',    svgContrast(),    'Contraste +'),
          mkOpt('uw-dyslexia',    svgDf(),          'Apto para dislexia'),
          mkOpt('uw-cursor',      svgCursor(),      'Cursor grande'),
          mkOpt('uw-lowstim',     svgAnim(),        'Detener animaciones'),
          mkOpt('uw-lineheight',  svgLineH(),       'Altura de línea'),
          mkOpt('uw-letterspace', svgLetterS(),     'Espaciado de texto'),
          mkOpt('uw-align',       svgAlign(),       'Texto alineado'),
          mkOpt('uw-saturation',  svgSat(),         'Saturación'),
          mkOpt('uw-links',       svgLinks(),       'Resaltar enlaces'),
          mkOpt('uw-hideimages',  svgImgs(),        'Ocultar imágenes'),
        '</div>',
        /* TTS */
        '<div class="uw-section-title">Lectura</div>',
        '<button class="uw-tts-btn" id="uw-tts" role="switch" aria-checked="false">',
          svgTts(),
          '<span>Leer en voz alta</span>',
        '</button>',
        '<div class="uw-tts-status" id="uw-tts-status" aria-live="polite" aria-atomic="true"></div>',
        /* Reset */
        '<button class="uw-reset" id="uwReset" aria-label="Restablecer todas las configuraciones de accesibilidad">',
          svgReset() + '<span>Restablecer todas las configuraciones</span>',
        '</button>',
      '</div>',
      /* Footer */
      '<div class="uw-footer"><span class="uw-footer-text">♿ Panel de Accesibilidad · CUT Costa Rica</span></div>'
    ].join('');
    document.body.appendChild(panel);
  }

  /* Helpers para iconos SVG */
  function mkOpt(id, icon, label) {
    return '<button class="uw-opt" id="' + id + '" role="switch" aria-checked="false"><div class="uw-opt-icon" aria-hidden="true">' + icon + '</div><span class="uw-opt-label">' + label + '</span></button>';
  }
  function svgContrast()   { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 7a5 5 0 0 1 0 10z"/></svg>'; }
  function svgDf()         { return '<svg viewBox="0 0 24 24"><text y="17" font-size="14" font-weight="700" font-family="serif" fill="currentColor" stroke="none">Df</text></svg>'; }
  function svgCursor()     { return '<svg viewBox="0 0 24 24"><path d="M4 3l16 7-7 3-3 7z"/></svg>'; }
  function svgAnim()       { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>'; }
  function svgLineH()      { return '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/><path d="M8 3l-3 3 3 3M16 3l3 3-3 3M8 15l-3 3 3 3M16 15l3 3-3 3"/></svg>'; }
  function svgLetterS()    { return '<svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/><path d="M7 11h10"/></svg>'; }
  function svgAlign()      { return '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 10h12M3 14h18M3 18h12"/></svg>'; }
  function svgSat()        { return '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 2v20"/><path d="M12 6c3.3 0 6 2.7 6 6s-2.7 6-6 6"/></svg>'; }
  function svgLinks()      { return '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.5 5.5"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12.5 18.5"/></svg>'; }
  function svgImgs()       { return '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/><line x1="3" y1="3" x2="21" y2="21"/></svg>'; }
  function svgTts()        { return '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'; }
  function svgReset()      { return '<svg style="width:16px;height:16px;margin-right:.3rem;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>'; }

  /* Inicializar eventos del panel */
  function initA11yEvents() {
    var fab   = document.getElementById('uwFab');
    var panel = document.getElementById('uwPanel');
    var close = document.getElementById('uwClose');
    var reset = document.getElementById('uwReset');
    if (!fab || !panel) return;

    function openPanel()  { panel.classList.add('open');  fab.setAttribute('aria-expanded', 'true');  if (close) close.focus(); }
    function closePanel() { panel.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); fab.focus(); }

    fab.addEventListener('click', function() { panel.classList.contains('open') ? closePanel() : openPanel(); });
    if (close) close.addEventListener('click', closePanel);

    /* Ctrl+U shortcut */
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') { e.preventDefault(); panel.classList.contains('open') ? closePanel() : openPanel(); }
      if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
    });

    /* Click outside */
    document.addEventListener('click', function(e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== fab) closePanel();
    });

    /* Font size */
    document.querySelectorAll('.uw-fs-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        A11Y.fontSize = parseFloat(btn.dataset.fs);
        applyA11Y(); saveA11Y();
      });
    });

    /* Toggle options */
    var toggleMap = {
      'uw-contrast':    'contrast',
      'uw-dyslexia':    'dyslexia',
      'uw-lowstim':     'lowStim',
      'uw-cursor':      'bigCursor',
      'uw-lineheight':  'lineHeight',
      'uw-letterspace': 'letterSpace',
      'uw-align':       'align',
      'uw-saturation':  'saturation',
      'uw-hideimages':  'hideImages',
      'uw-links':       'links'
    };
    Object.keys(toggleMap).forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', function() { toggleOption(toggleMap[id]); });
      el.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
    });

    /* TTS */
    var ttsBtn = document.getElementById('uw-tts');
    if (ttsBtn && 'speechSynthesis' in window) {
      ttsBtn.addEventListener('click', function() {
        A11Y.tts = !A11Y.tts;
        if (A11Y.tts) { startTTS(); } else { stopTTS(); }
        updateA11yUI(); saveA11Y();
      });
    }

    /* Reset */
    if (reset) {
      reset.addEventListener('click', function() {
        Object.keys(A11Y).forEach(function(k) {
          A11Y[k] = (k === 'fontSize') ? 1 : false;
        });
        stopTTS();
        applyA11Y();
        try { localStorage.removeItem(A11Y_PREFS_KEY); } catch(e) {}
        var status = document.getElementById('uw-tts-status');
        if (status) status.textContent = '';
      });
    }
  }

  /* ============================================================
     11. PWA — REGISTRO DEL SERVICE WORKER
     ============================================================ */
  function initPWA() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/cut-web/sw.js', { scope: '/cut-web/' })
        .then(function(reg) {
          console.log('[PWA] Service Worker registrado:', reg.scope);
          /* Mostrar banner de instalación */
          initInstallBanner();
        })
        .catch(function(err) {
          console.warn('[PWA] Error al registrar SW:', err);
        });
    });
  }

  var deferredPrompt = null;
  function initInstallBanner() {
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      showInstallBanner();
    });
  }

  function showInstallBanner() {
    if (document.getElementById('pwa-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Instalar aplicación');
    banner.style.cssText = [
      'position:fixed;bottom:0;left:0;right:0;z-index:89999;',
      'background:linear-gradient(135deg,#1a1a1a,#111);',
      'color:#fff;padding:.85rem 1.25rem;',
      'display:flex;align-items:center;justify-content:space-between;gap:1rem;',
      'border-top:2px solid #C0001A;',
      'font-family:system-ui,sans-serif;font-size:13px;',
      'box-shadow:0 -4px 20px rgba(0,0,0,.3);',
      'flex-wrap:wrap;'
    ].join('');
    banner.innerHTML = [
      '<div style="display:flex;align-items:center;gap:.65rem;flex:1">',
        '<img src="/cut-web/assets/images/logo-cut.png" alt="" style="width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(192,0,26,.5);flex-shrink:0">',
        '<div>',
          '<div style="font-weight:600;font-size:13.5px">Instalar CUT Costa Rica</div>',
          '<div style="color:rgba(255,255,255,.55);font-size:11.5px">Acceso rápido y funciona sin internet</div>',
        '</div>',
      '</div>',
      '<div style="display:flex;gap:.65rem;flex-shrink:0">',
        '<button id="pwa-install" style="padding:.45rem 1rem;background:#C0001A;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;">Instalar</button>',
        '<button id="pwa-dismiss" style="padding:.45rem .75rem;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);border:none;border-radius:6px;font-size:12px;cursor:pointer;">No, gracias</button>',
      '</div>'
    ].join('');
    document.body.appendChild(banner);

    document.getElementById('pwa-install').addEventListener('click', function() {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(result) {
        if (result.outcome === 'accepted') banner.remove();
        deferredPrompt = null;
      });
    });
    document.getElementById('pwa-dismiss').addEventListener('click', function() {
      banner.remove();
      try { localStorage.setItem('pwa_dismissed', '1'); } catch(e) {}
    });
  }

  /* ============================================================
     12. INIT — arranque de todo
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    updateYears();
    initReadBar();
    initHamburger();
    initFadeIn();
    initNav();
    initHeroDots();
    initContactForm();
    initAffForm();

    /* Panel de accesibilidad */
    injectA11yStyles();
    createA11yPanel();
    initA11yEvents();
    loadA11Y();

    /* PWA */
    initPWA();
  });

})();
