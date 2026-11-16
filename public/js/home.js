/* PrintWell — главная: меню, языки RU/UZ/EN, фильтр работ, форма расчёта.
   Язык хранится в localStorage 'pw-lang' и в <html lang> — так же, как на остальных
   страницах и в чат-виджете. Русский текст лежит в разметке, здесь только UZ и EN. */
(function () {
  'use strict';

  var LANG_KEY = 'pw-lang';
  var T = {
    uz: {
      'skip': 'Buyurtma hisobiga o\'tish',
      'nav.services': 'Xizmatlar', 'nav.works': 'Ishlarimiz', 'nav.about': 'Kompaniya haqida', 'nav.contacts': 'Aloqa',
      'cta.short': 'Narxni hisoblash', 'cta.main': 'Narxni so\'rash',
      'hero.title': 'Asakabank, Nestlé va Humo uchun chop etamiz. Siz uchun ham chop etamiz',
      'hero.sub': 'Biznes uchun qadoq va poligrafiya. Tayyor tirajlarni ko\'ring va xuddi shundayiga narx so\'rang.',
      'hero.all': 'Barcha ishlar',
      'job.1': 'Kalendarlar, Asakabank', 'job.2': 'Paketlar, Nestlé', 'job.3': 'Bloknotlar, Humo va NRG', 'job.4': 'Karton quti',
      'trust': 'Bizga ishonishadi',
      'works.title': 'Tayyor tirajlar',
      'works.lead': 'O\'zingiznikiga o\'xshash mahsulotni toping va «Xuddi shunday tiraj kerak» tugmasini bosing. Forma tanlangan mahsulot bilan ochiladi.',
      'f.all': 'Hammasi', 'f.box': 'Qadoq', 'f.bag': 'Paketlar', 'f.cal': 'Kalendar va bloknotlar', 'f.cat': 'Kataloglar va papkalar',
      'w.want': 'Xuddi shunday tiraj kerak',
      'w.1': 'Stol kalendarlari', 'w.2': 'Tutqichli qog\'oz paketlar', 'w.3': 'Dori qutilari', 'w.3for': 'Farmatsevtika',
      'w.4': 'Prujinali bloknotlar', 'w.5': 'Qopqoqli quti', 'w.5for': 'To\'qimachilik', 'w.6': 'Oziq-ovqat qadog\'i', 'w.6for': 'Qandolat mahsulotlari',
      'w.7': 'Kataloglar va broshyuralar', 'w.7for': 'Korporativ poligrafiya', 'w.8': 'Kalendarlar va planinglar', 'w.8for': 'Korporativ sovg\'alar',
      'w.9': 'To\'liq rangli bosma paketlar', 'w.9for': 'Riteyl va banklar', 'w.10': 'Papkalar va menyular', 'w.10for': 'Restoranlar va ofislar',
      'fin.title': 'Qo\'l bilan seziladigan bezak',
      'fin.lead': 'Bir xil karton oddiy quti ham, sovg\'a ham bo\'lib ko\'rinishi mumkin. Farqni bosmadan keyingi ishlov beradi.',
      'fin.1': 'Folga bosish', 'fin.1d': 'Logotip, hoshiya yoki naqshda metall yaltirashi.',
      'fin.2': 'Kongrev bosish', 'fin.2d': 'Bo\'yoqsiz relyef: yorug\'da ko\'rinadi, barmoq bilan seziladi.',
      'fin.3': 'Tanlab UF-laklash', 'fin.3d': 'Mat yuzada yaltiroq detallar.',
      'fin.more': 'Barcha xizmatlar va mahsulot turlari',
      'steps.title': 'Arizadan keyin nima bo\'ladi',
      's.1': 'Hisob-kitob', 's.1d': 'Menejer tafsilotlarni aniqlab, 24 soat ichida narx va muddatni yuboradi.',
      's.2': 'Maket', 's.2d': 'Maketingizni tekshiramiz yoki dizayn ishlab chiqib, siz bilan kelishamiz.',
      's.3': 'Bosma va bezak', 's.3d': 'Toshkentdagi o\'z ishlab chiqarishimizda chop etamiz, kesamiz, bosamiz va yig\'amiz.',
      's.4': 'Yetkazib berish', 's.4d': 'Tayyor tirajni olib kelamiz. O\'zbekiston bo\'ylab yetkazamiz.',
      'calc.title': 'Buyurtma narxini so\'rang', 'calc.lead': 'To\'rtta maydon. Aniq o\'lcham va maketni menejer bilan muhokama qilamiz.',
      'form.what': 'Nimani chop etish kerak?',
      'p.box': 'Qutilar', 'p.bag': 'Paketlar', 'p.label': 'Etiketka va yorliqlar', 'p.cat': 'Kataloglar', 'p.cal': 'Kalendar va bloknotlar', 'p.other': 'Boshqa',
      'form.qty': 'Tiraj', 'q.1': '100–500 dona', 'q.2': '500–1 000 dona', 'q.3': '1 000–5 000 dona', 'q.4': '5 000 donadan ko\'p', 'q.5': 'hali bilmayman',
      'form.name': 'Ismingiz', 'form.phone': 'Telefon', 'form.note': 'Izoh (ixtiyoriy)',
      'form.send': 'Narxni olish', 'form.sending': 'Yuborilmoqda…', 'form.promise': 'Menejer 24 soat ichida javob beradi.',
      'err.name': 'Ismingizni yozing.', 'err.phone': 'Telefon raqamini to\'liq yozing.',
      'err.send': 'Ariza yuborilmadi. Qo\'ng\'iroq qiling: +998 90 903 55 52 yoki Telegramga yozing.',
      'done.title': 'Ariza yuborildi', 'done.text': 'Menejer 24 soat ichida siz bilan bog\'lanadi. Tezroq kerak bo\'lsa, qo\'ng\'iroq qiling yoki Telegramga yozing.', 'done.tg': 'Telegramga yozish',
      'c.phone': 'Telefon', 'c.addr': 'Ishlab chiqarish manzili', 'c.addrv': 'Toshkent, Qatortol ko\'chasi, 1',
      'ft.about': 'Toshkentdagi to\'liq siklli bosmaxona: biznes uchun karton qadoq va poligrafiya.',
      'ft.nav': 'Bo\'limlar', 'ft.partners': 'Mijozlar', 'ft.privacy': 'Maxfiylik siyosati'
    },
    en: {
      'skip': 'Skip to the quote form',
      'nav.services': 'Services', 'nav.works': 'Work', 'nav.about': 'About', 'nav.contacts': 'Contacts',
      'cta.short': 'Get a quote', 'cta.main': 'Request a quote',
      'hero.title': 'We print for Asakabank, Nestlé and Humo. We will print for you too',
      'hero.sub': 'Packaging and print for business. Browse finished runs and request a quote for one like them.',
      'hero.all': 'All work',
      'job.1': 'Calendars, Asakabank', 'job.2': 'Bags, Nestlé', 'job.3': 'Notebooks, Humo and NRG', 'job.4': 'Cardboard box',
      'trust': 'Trusted by',
      'works.title': 'Finished print runs',
      'works.lead': 'Find a product like yours and press “I want a run like this”. The form opens with that product already selected.',
      'f.all': 'All', 'f.box': 'Packaging', 'f.bag': 'Bags', 'f.cal': 'Calendars and notebooks', 'f.cat': 'Catalogues and folders',
      'w.want': 'I want a run like this',
      'w.1': 'Desk calendars', 'w.2': 'Paper bags with handles', 'w.3': 'Medicine boxes', 'w.3for': 'Pharmaceuticals',
      'w.4': 'Spiral notebooks', 'w.5': 'Lid-and-base box', 'w.5for': 'Textiles', 'w.6': 'Food packaging', 'w.6for': 'Confectionery',
      'w.7': 'Catalogues and brochures', 'w.7for': 'Corporate print', 'w.8': 'Calendars and planners', 'w.8for': 'Corporate gifts',
      'w.9': 'Full-colour printed bags', 'w.9for': 'Retail and banks', 'w.10': 'Folders and menus', 'w.10for': 'Restaurants and offices',
      'fin.title': 'Finishing you notice with your hands',
      'fin.lead': 'The same board can look like a plain box or like a gift. Post-press finishing makes the difference.',
      'fin.1': 'Foil stamping', 'fin.1d': 'A metallic shine on a logo, frame or pattern.',
      'fin.2': 'Embossing', 'fin.2d': 'Relief without ink: seen in the light, felt with the fingers.',
      'fin.3': 'Spot UV varnish', 'fin.3d': 'Glossy details on a matt surface.',
      'fin.more': 'All services and product types',
      'steps.title': 'What happens after your request',
      's.1': 'Quote', 's.1d': 'A manager checks the details and sends the price and lead time within 24 hours.',
      's.2': 'Artwork', 's.2d': 'We check your artwork or create the design and agree it with you.',
      's.3': 'Printing and finishing', 's.3d': 'We print, cut, stamp and assemble at our own plant in Tashkent.',
      's.4': 'Delivery', 's.4d': 'We bring you the finished run. Delivery across Uzbekistan.',
      'calc.title': 'Request a quote', 'calc.lead': 'Four fields. Exact sizes and artwork are agreed with a manager.',
      'form.what': 'What do you need printed?',
      'p.box': 'Boxes', 'p.bag': 'Bags', 'p.label': 'Labels and tags', 'p.cat': 'Catalogues', 'p.cal': 'Calendars and notebooks', 'p.other': 'Other',
      'form.qty': 'Quantity', 'q.1': '100–500 pcs', 'q.2': '500–1,000 pcs', 'q.3': '1,000–5,000 pcs', 'q.4': 'over 5,000 pcs', 'q.5': 'not sure yet',
      'form.name': 'Your name', 'form.phone': 'Phone', 'form.note': 'Comment (optional)',
      'form.send': 'Get a quote', 'form.sending': 'Sending…', 'form.promise': 'A manager replies within 24 hours.',
      'err.name': 'Enter your name.', 'err.phone': 'Enter the full phone number.',
      'err.send': 'The request was not sent. Call +998 90 903 55 52 or message us on Telegram.',
      'done.title': 'Request sent', 'done.text': 'A manager will contact you within 24 hours. If you need it sooner, call or message us on Telegram.', 'done.tg': 'Message on Telegram',
      'c.phone': 'Phone', 'c.addr': 'Production address', 'c.addrv': '1 Qatortol Street, Tashkent',
      'ft.about': 'A full-cycle printing house in Tashkent: cardboard packaging and print for business.',
      'ft.nav': 'Sections', 'ft.partners': 'Clients', 'ft.privacy': 'Privacy policy'
    }
  };
  // Русские строки, которых нет в разметке (сообщения формы).
  var RU = {
    'form.sending': 'Отправляем…',
    'err.name': 'Напишите ваше имя.',
    'err.phone': 'Напишите номер телефона полностью.',
    'err.send': 'Заявка не отправилась. Позвоните: +998 90 903 55 52 или напишите в Telegram.'
  };

  var lang = 'ru';
  var nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach(function (el) { RU[el.getAttribute('data-i18n')] = RU[el.getAttribute('data-i18n')] || el.textContent; });

  function t(key) { return (lang !== 'ru' && T[lang] && T[lang][key]) || RU[key] || ''; }

  function setLang(next) {
    lang = (next === 'uz' || next === 'en') ? next : 'ru';
    document.documentElement.lang = lang;
    nodes.forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* приватный режим */ }
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try { var saved = localStorage.getItem(LANG_KEY); if (saved && saved !== 'ru') setLang(saved); } catch (e) { /* нет доступа */ }

  /* ----- мобильное меню ----- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function toggleMenu(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { toggleMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) toggleMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { toggleMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 980 && !menu.hidden) toggleMenu(false); });

  function press(group, btn) {
    group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
  }

  /* ----- фильтр работ ----- */
  var works = document.querySelectorAll('.work');
  document.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      press(b.parentNode, b);
      var f = b.getAttribute('data-filter');
      works.forEach(function (w) { w.hidden = f !== 'all' && w.getAttribute('data-cat') !== f; });
    });
  });

  /* ----- форма ----- */
  var form = document.getElementById('lead-form');
  var chips = document.getElementById('prod-chips');
  var note = document.getElementById('f-note');
  var nameEl = document.getElementById('f-name');
  var phoneEl = document.getElementById('f-phone');
  var errEl = document.getElementById('form-err');
  var btn = document.getElementById('form-btn');
  var done = document.getElementById('form-done');
  var wanted = '';

  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (b) press(chips, b);
  });

  // «Хочу такой же тираж»: выбираем продукцию в форме и ведём к ней.
  document.getElementById('works-list').addEventListener('click', function (e) {
    var b = e.target.closest('.work__btn'); if (!b) return;
    var card = b.closest('.work');
    var chip = chips.querySelector('[data-p="' + card.getAttribute('data-product') + '"]');
    if (chip) press(chips, chip);
    var forWhom = card.querySelector('.work__for').textContent;
    wanted = RU[card.querySelector('h3').getAttribute('data-i18n')] + ' (' + forWhom + ')';
    document.getElementById('calc').scrollIntoView();
    nameEl.focus({ preventScroll: true });
  });

  function fail(el, key) {
    errEl.textContent = t(key); errEl.hidden = false;
    if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errEl.hidden = true;
    nameEl.removeAttribute('aria-invalid'); phoneEl.removeAttribute('aria-invalid');
    var name = nameEl.value.trim();
    var phone = phoneEl.value.trim();
    if (!name) return fail(nameEl, 'err.name');
    if (phone.replace(/\D/g, '').length < 9) return fail(phoneEl, 'err.phone');

    var chip = chips.querySelector('[aria-pressed="true"]');
    var product = chip ? RU[chip.getAttribute('data-i18n')] : '';
    var comment = ['Тираж: ' + document.getElementById('f-qty').value];
    if (wanted) comment.push('Как в работе: ' + wanted);
    if (note.value.trim()) comment.push(note.value.trim());
    comment.push('Язык сайта: ' + lang.toUpperCase());

    btn.disabled = true; btn.textContent = t('form.sending');
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, product: product, comment: comment.join('. ') })
    }).then(function (r) {
      if (!r.ok) throw new Error('status ' + r.status);
      form.hidden = true; done.hidden = false; done.focus();
    }).catch(function () {
      btn.disabled = false; btn.textContent = t('form.send');
      fail(null, 'err.send');
    });
  });

  /* ----- блик фольги в блоке «Отделка» ----- */
  var fin = document.querySelector('.fin');
  if (fin && window.matchMedia && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fin.addEventListener('pointermove', function (e) {
      var r = fin.getBoundingClientRect();
      fin.style.setProperty('--mx', (100 - ((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
    });
  }
})();
