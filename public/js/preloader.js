/* ===========================================================================
   preloader.js — интро-анимация PrintWell (CMYK)
   - Показывается ОДИН раз за сессию (sessionStorage 'pw_intro_shown').
   - prefers-reduced-motion: пропускаем, сразу показываем сайт.
   - На мобильном: только логотип + слоган, без CMYK-брызг.
   - Чистый vanilla JS, без зависимостей. Подключается в <head> первым.
   =========================================================================== */
(function () {
  'use strict';

  var KEY = 'pw_intro_shown';
  var SLOGAN = 'Типография полного цикла';
  var TOTAL = 2500;   // полная длительность, мс
  var OPEN_AT = 2000; // старт «раскрытия шторок», мс

  // --- Условия пропуска -----------------------------------------------------
  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var alreadyShown = false;
  try { alreadyShown = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  if (reduced || alreadyShown) {
    return; // сайт показывается сразу, оверлей не создаём
  }

  // Помечаем как показанный сразу — чтобы переходы между страницами в рамках
  // одной сессии не показывали интро повторно.
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

  var isMobile = window.matchMedia &&
    window.matchMedia('(max-width: 640px)').matches;

  // --- Сборка DOM -----------------------------------------------------------
  var pre = document.createElement('div');
  pre.id = 'pw-preloader';
  // Критичные инлайн-стили — чтобы оверлей перекрыл контент даже если CSS
  // ещё не успел загрузиться.
  pre.style.cssText = 'position:fixed;inset:0;z-index:9999;overflow:hidden;';

  var top = document.createElement('div');
  top.className = 'pw-half pw-half--top';
  top.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:50%;background:#0a0a0a;';

  var bottom = document.createElement('div');
  bottom.className = 'pw-half pw-half--bottom';
  bottom.style.cssText = 'position:absolute;left:0;bottom:0;width:100%;height:50%;background:#0a0a0a;';

  var content = document.createElement('div');
  content.className = 'pw-content';

  // ФАЗА 2 — брызги (только desktop)
  if (!isMobile) {
    var splashes = document.createElement('div');
    splashes.className = 'pw-splashes';
    ['tl', 'tr', 'bl', 'br'].forEach(function (dir) {
      var s = document.createElement('span');
      s.className = 'pw-splash pw-splash--' + dir;
      splashes.appendChild(s);
    });
    content.appendChild(splashes);
  }

  // ФАЗА 3 — логотип на белом чипе
  var logoWrap = document.createElement('div');
  logoWrap.className = 'pw-logo-wrap';
  var logo = document.createElement('img');
  logo.className = 'pw-logo';
  logo.src = './img/header/logo-color.svg';
  logo.alt = 'PrintWell';
  logo.width = 280;
  logo.height = 151;
  logoWrap.appendChild(logo);
  content.appendChild(logoWrap);

  // ФАЗА 4 — слоган побуквенно
  var slogan = document.createElement('div');
  slogan.className = 'pw-slogan';
  slogan.setAttribute('aria-label', SLOGAN);
  for (var i = 0; i < SLOGAN.length; i++) {
    var ch = SLOGAN.charAt(i);
    var span = document.createElement('span');
    span.className = 'pw-letter';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = ch === ' ' ? ' ' : ch;
    span.style.animationDelay = (1.4 + i * 0.02).toFixed(2) + 's';
    slogan.appendChild(span);
  }
  content.appendChild(slogan);

  pre.appendChild(top);
  pre.appendChild(bottom);
  pre.appendChild(content);

  // --- Монтирование + блокировка скролла ------------------------------------
  var docEl = document.documentElement;
  docEl.style.overflow = 'hidden';
  (document.body || docEl).appendChild(pre);

  function lockBody() {
    if (document.body) document.body.style.overflow = 'hidden';
  }
  if (document.body) lockBody();
  else document.addEventListener('DOMContentLoaded', lockBody);

  // --- ФАЗА 5 — раскрытие и удаление ----------------------------------------
  setTimeout(function () {
    pre.classList.add('is-opening');
  }, OPEN_AT);

  setTimeout(function () {
    if (pre.parentNode) pre.parentNode.removeChild(pre);
    docEl.style.overflow = '';
    if (document.body) document.body.style.overflow = '';
  }, TOTAL);
})();
