/* =========================================================================
   PrintWell — плавающий AI-чат виджет (каркас под будущий AI)
   - Плавающая кнопка + окно чата (тёмная тема).
   - 4 быстрые кнопки (заявка, услуги, Telegram, Instagram).
   - 3 языка (RU/UZ/EN). Язык берём из той же системы, что и redesign.js:
     ключ localStorage 'pw-lang' + атрибут <html lang>. Реагируем на смену
     языка через MutationObserver, не трогая redesign.js.
   - sendToAI(msg) — заглушка, точка интеграции с реальным AI.
   ========================================================================= */
(function () {
  'use strict';

  if (window.__pwChatInit) return;
  window.__pwChatInit = true;

  var SUPPORTED = ['ru', 'uz', 'en'];
  var DEFAULT_LANG = 'ru';
  var LANG_KEY = 'pw-lang';

  /* ----- Словарь строк виджета ----- */
  var I18N = {
    ru: {
      title: 'PrintWell Ассистент',
      status: 'Онлайн',
      greeting: 'Здравствуйте! Чем можем помочь?',
      q_request: 'Рассчитать заказ',
      q_services: 'Каталог услуг',
      q_telegram: 'Написать в Telegram',
      q_instagram: 'Instagram',
      placeholder: 'Напишите сообщение…',
      open: 'Открыть чат',
      close: 'Закрыть чат',
      send: 'Отправить',
      stub: 'Спасибо за сообщение! Менеджер скоро ответит. Для быстрого ответа напишите нам в Telegram.',
      error: 'Не удалось получить ответ. Попробуйте ещё раз или напишите нам в Telegram.'
    },
    uz: {
      title: 'PrintWell Yordamchisi',
      status: 'Onlayn',
      greeting: 'Assalomu alaykum! Sizga qanday yordam bera olamiz?',
      q_request: 'Buyurtmani hisoblash',
      q_services: 'Xizmatlar katalogi',
      q_telegram: 'Telegramga yozish',
      q_instagram: 'Instagram',
      placeholder: 'Xabar yozing…',
      open: 'Chatni ochish',
      close: 'Chatni yopish',
      send: 'Yuborish',
      stub: 'Xabaringiz uchun rahmat! Menejer tez orada javob beradi. Tezkor javob uchun Telegramga yozing.',
      error: 'Javob olib bo‘lmadi. Qayta urinib ko‘ring yoki Telegramga yozing.'
    },
    en: {
      title: 'PrintWell Assistant',
      status: 'Online',
      greeting: 'Hello! How can we help?',
      q_request: 'Calculate an order',
      q_services: 'Services catalogue',
      q_telegram: 'Message on Telegram',
      q_instagram: 'Instagram',
      placeholder: 'Type a message…',
      open: 'Open chat',
      close: 'Close chat',
      send: 'Send',
      stub: 'Thanks for your message! A manager will reply shortly. For a quick reply, message us on Telegram.',
      error: 'Could not get a reply. Please try again or message us on Telegram.'
    }
  };

  function getLang() {
    var lang;
    try {
      lang = window.localStorage.getItem(LANG_KEY);
    } catch (e) {
      lang = null;
    }
    if (SUPPORTED.indexOf(lang) === -1) {
      lang = document.documentElement.getAttribute('lang');
    }
    return SUPPORTED.indexOf(lang) !== -1 ? lang : DEFAULT_LANG;
  }

  function t(key) {
    var dict = I18N[getLang()] || I18N[DEFAULT_LANG];
    return dict[key] != null ? dict[key] : I18N[DEFAULT_LANG][key];
  }

  /* ----- SVG-иконки ----- */
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_CALC = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 6h8M8 10h2M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_GRID = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/></svg>';
  var ICON_TG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.94 4.6 18.9 19.2c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.94.46l.33-4.78 8.7-7.86c.38-.34-.08-.53-.59-.19L6.97 13.4l-4.64-1.45c-1.01-.32-1.03-1.01.21-1.5l18.14-6.99c.84-.31 1.58.2 1.26 1.64z"/></svg>';
  var ICON_IG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ----- Сборка DOM ----- */
  var root = document.createElement('div');
  root.className = 'pw-chat';

  root.innerHTML =
    '<button class="pw-chat__fab" type="button" data-pw-open data-pw-i18n-aria="open">' + ICON_CHAT + '</button>' +
    '<div class="pw-chat__panel" role="dialog" aria-modal="false" data-pw-i18n-aria-label="title">' +
      '<div class="pw-chat__header">' +
        '<span class="pw-chat__avatar">' + ICON_CHAT + '</span>' +
        '<span class="pw-chat__heading">' +
          '<span class="pw-chat__title" data-pw-i18n="title">PrintWell Ассистент</span>' +
          '<span class="pw-chat__status" data-pw-i18n="status">Онлайн</span>' +
        '</span>' +
        '<button class="pw-chat__close" type="button" data-pw-close data-pw-i18n-aria="close">&times;</button>' +
      '</div>' +
      '<div class="pw-chat__body">' +
        '<div class="pw-chat__messages" data-pw-messages>' +
          '<div class="pw-chat__msg pw-chat__msg--bot" data-pw-i18n="greeting">Здравствуйте! Чем можем помочь?</div>' +
        '</div>' +
        '<div class="pw-chat__quick">' +
          '<a class="pw-chat__quick-btn" href="./request.html">' + ICON_CALC + '<span data-pw-i18n="q_request">Рассчитать заказ</span></a>' +
          '<a class="pw-chat__quick-btn" href="./services.html">' + ICON_GRID + '<span data-pw-i18n="q_services">Каталог услуг</span></a>' +
          '<a class="pw-chat__quick-btn" href="https://t.me/printwell_sales_alisher" target="_blank" rel="noopener">' + ICON_TG + '<span data-pw-i18n="q_telegram">Написать в Telegram</span></a>' +
          '<a class="pw-chat__quick-btn" href="https://www.instagram.com/printwell.uz/" target="_blank" rel="noopener">' + ICON_IG + '<span data-pw-i18n="q_instagram">Instagram</span></a>' +
        '</div>' +
      '</div>' +
      '<form class="pw-chat__inputbar" data-pw-form>' +
        '<input class="pw-chat__input" type="text" autocomplete="off" data-pw-input data-pw-i18n-ph="placeholder">' +
        '<button class="pw-chat__send" type="submit" data-pw-send data-pw-i18n-aria="send">' + ICON_SEND + '</button>' +
      '</form>' +
    '</div>';

  /* ----- Применение перевода ----- */
  function applyI18n() {
    root.querySelectorAll('[data-pw-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-pw-i18n'));
    });
    root.querySelectorAll('[data-pw-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-pw-i18n-aria')));
    });
    root.querySelectorAll('[data-pw-i18n-aria-label]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-pw-i18n-aria-label')));
    });
    root.querySelectorAll('[data-pw-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-pw-i18n-ph')));
    });
  }

  /* ----- Открытие / закрытие ----- */
  function open() {
    root.classList.add('pw-chat--open');
    var input = root.querySelector('[data-pw-input]');
    if (input) {
      try { input.focus(); } catch (e) {}
    }
  }
  function close() {
    root.classList.remove('pw-chat--open');
  }

  /* ----- Лента сообщений ----- */
  function appendMessage(text, who) {
    var box = root.querySelector('[data-pw-messages]');
    if (!box) return;
    var msg = document.createElement('div');
    msg.className = 'pw-chat__msg pw-chat__msg--' + (who === 'user' ? 'user' : 'bot');
    msg.textContent = text;
    box.appendChild(msg);
    box.parentNode.scrollTop = box.parentNode.scrollHeight;
  }

  /* ----- История диалога (накапливается, шлётся с каждым запросом) ----- */
  var history = [];
  var busy = false;

  /* ----- Индикатор набора текста (typing) — без правки CSS -----
     Временный bot-бабл с анимацией точек. Возвращает функцию удаления. */
  function showTyping() {
    var box = root.querySelector('[data-pw-messages]');
    if (!box) return function () {};
    var bubble = document.createElement('div');
    bubble.className = 'pw-chat__msg pw-chat__msg--bot pw-chat__msg--typing';
    bubble.textContent = '·';
    box.appendChild(bubble);
    box.parentNode.scrollTop = box.parentNode.scrollHeight;
    var step = 0;
    var timer = window.setInterval(function () {
      step = (step + 1) % 3;
      bubble.textContent = new Array(step + 2).join('·'); // ·, ··, ···
    }, 350);
    return function () {
      window.clearInterval(timer);
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    };
  }

  /* ----- Блокировка ввода/кнопки на время запроса ----- */
  function setBusy(state) {
    busy = state;
    var send = root.querySelector('[data-pw-send]');
    var input = root.querySelector('[data-pw-input]');
    if (send) send.disabled = state;
    if (input) input.disabled = state;
  }

  /* -------------------------------------------------------------------------
     sendToAI(message) — реальный вызов /api/chat (Claude API).
     Показывает сообщение пользователя, копит историю, шлёт её на сервер,
     добавляет ответ бота. При ошибке — понятное сообщение, не "error".
     ------------------------------------------------------------------------- */
  function sendToAI(message) {
    if (busy) return;
    appendMessage(message, 'user');
    history.push({ role: 'user', content: message });

    setBusy(true);
    var removeTyping = showTyping();

    return fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, history: history.slice(0, -1) })
    })
      .then(function (response) {
        if (!response.ok) throw new Error('API error');
        return response.json();
      })
      .then(function (data) {
        var reply = data && data.reply ? data.reply : '';
        removeTyping();
        if (reply) {
          appendMessage(reply, 'bot');
          history.push({ role: 'assistant', content: reply });
        } else {
          appendMessage(t('error'), 'bot');
        }
      })
      .catch(function () {
        removeTyping();
        appendMessage(t('error'), 'bot');
      })
      .then(function () {
        setBusy(false);
        var input = root.querySelector('[data-pw-input]');
        if (input) { try { input.focus(); } catch (e) {} }
      });
  }

  /* ----- Привязка событий ----- */
  function bind() {
    root.querySelector('[data-pw-open]').addEventListener('click', open);
    root.querySelector('[data-pw-close]').addEventListener('click', close);

    root.querySelector('[data-pw-form]').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = root.querySelector('[data-pw-input]');
      var value = input ? input.value.trim() : '';
      if (!value) return;
      input.value = '';
      sendToAI(value);
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('pw-chat--open')) close();
    });

    // Реакция на смену языка (redesign.js меняет <html lang>)
    if (window.MutationObserver) {
      var mo = new MutationObserver(applyI18n);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  document.body.appendChild(root);
  applyI18n();
  bind();

  /* Экспорт для будущей интеграции / отладки */
  window.PrintWellChat = {
    open: open,
    close: close,
    sendToAI: sendToAI,
    refreshI18n: applyI18n
  };
})();
