/* ============================================================================
   PrintWell — REDESIGN SCRIPT (index-new.html) · v1.1
   ----------------------------------------------------------------------------
   Vanilla JS, без библиотек и CDN. Содержит:
     1. Логику мобильного сайдбара (повтор из app.js, БЕЗ видео и аккордеона).
     2. HERO: пословную разбивку H1 + запуск анимаций появления.
     3. Переиспользуемую систему скролл-анимаций (.reveal, .count-up)
        на IntersectionObserver.
   ============================================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* =========================================================================
     0. МУЛЬТИЯЗЫЧНОСТЬ (RU / UZ / EN)
     ------------------------------------------------------------------------
     Инлайн-словарь I18N (никаких внешних fetch). Ключи совпадают с data-i18n
     в разметке index-new.html. UZ — узбекская латиница, EN — профессиональный
     английский. Переводы секций (marquee/services/about) объединены сюда же.

     Механизм:
       - [data-i18n="key"]          -> подставляется textContent.
       - [data-i18n-attr="attr:key,attr2:key2"] -> подставляются атрибуты.
       - [data-i18n-aria-label="key"] -> подставляется атрибут aria-label
         (поддержка «атрибутного варианта», уже встречается в about-секции).
       - hero.title обрабатывается особо: после смены текста заново вызывается
         window.PrintWellRedesign.refreshHeroTitle() — пословная пересборка H1.
     ========================================================================= */
  var I18N = {
    ru: {
      /* --- HERO --- */
      'hero.badge': 'ТОП-10 типографий Узбекистана · 20 лет на рынке',
      'hero.title': 'Упаковка, которая продаёт ваш продукт',
      'hero.subtitle': 'Фольгирование · Тиснение · Премиум-картон · Полный цикл',
      'hero.cta': 'Рассчитать заказ',
      'hero.stat1.label': 'лет на рынке',
      'hero.stat2.label': 'выполненных заказов',
      'hero.stat3.label': 'постоянных клиентов',
      'hero.sectionAria': 'PrintWell — главный экран',
      'hero.imgAlt': 'Премиальная упаковка и полиграфия PrintWell: фольгирование, тиснение, премиум-картон',

      /* --- NAV / SIDEBAR --- */
      'nav.menu': 'Меню',
      'nav.about': 'О нас',
      'nav.services': 'Наши услуги',
      'nav.projects': 'Наши проекты',
      'nav.partners': 'Наши партнеры',
      'nav.contacts': 'Контакты',

      /* --- FOOTER --- */
      'footer.tagline': 'Работайте с сильной командой, обладающей ценностями.',
      'footer.about': 'В PrintWell мы подходим к каждому проекту с ответственностью, честностью и качеством. Наша команда — это специалисты, которые искренне любят свою работу, надежные и преданные.',
      'footer.work': 'Наша работа',
      'footer.privacy': 'Политика конфиденциальности 2025',
      'footer.dev': 'Разработано агентством SIDQ',

      /* --- MARQUEE --- */
      'marquee.title': 'Нам доверяют',

      /* --- SERVICES --- */
      'services.eyebrow': 'Что мы делаем',
      'services.title': 'Полный цикл полиграфии — от дизайна до доставки',
      'services.card1.title': 'Картонная упаковка',
      'services.card1.desc': 'Гофрокартон, мелованный картон, микрогофра. Любые формы, тиражи и отделки под ваш продукт.',
      'services.card2.title': 'Премиум-отделка',
      'services.card2.badge': 'Только у нас',
      'services.card2.desc': 'Фольгирование, конгревное тиснение и Spot UV — эксклюзивные технологии постпресса в Ташкенте.',
      'services.card3.title': 'Текстильная упаковка',
      'services.card3.badge': 'Новинка',
      'services.card3.desc': 'Льняные и хлопковые мешочки, шопперы с лого — экоупаковка, которой нет у конкурентов.',
      'services.card4.title': 'Полиграфия',
      'services.card4.desc': 'Визитки, каталоги, брошюры, листовки — офсетная и цифровая печать любых тиражей.',

      /* --- ABOUT --- */
      'about.eyebrow': 'О нас',
      'about.title': 'О нас. 20 лет делаем упаковку, которой доверяют',
      'about.title.line1': '20 лет делаем',
      'about.title.line2': 'упаковку, которой доверяют',
      'about.b1.heading': 'С 2005 года: от Poligraf Group до PrintWell',
      'about.b1.text': '20 лет печатаем для лидеров рынка — и с каждым годом становимся сильнее.',
      'about.b2.heading': '150+ специалистов и европейское оборудование',
      'about.b2.text': 'Производственный парк уровня ведущих европейских типографий — прямо в Ташкенте.',
      'about.b3.heading': 'Chevrolet, Huawei, SQB доверяют нам',
      'about.b3.text': 'Упаковка продуктов мировых брендов — наш ежедневный стандарт качества.'
    },

    uz: {
      /* --- HERO --- */
      'hero.badge': 'Oʻzbekistonning TOP-10 bosmaxonasi · bozorda 20 yil',
      'hero.title': 'Mahsulotingizni sotadigan qadoqlash',
      'hero.subtitle': 'Folga bosish · Tiqinlash · Premium karton · Toʻliq tsikl',
      'hero.cta': 'Buyurtmani hisoblash',
      'hero.stat1.label': 'yil bozorda',
      'hero.stat2.label': 'bajarilgan buyurtma',
      'hero.stat3.label': 'doimiy mijozlar',
      'hero.sectionAria': 'PrintWell — bosh ekran',
      'hero.imgAlt': 'PrintWell premium qadoqlash va matbaachilik: folga bosish, tiqinlash, premium karton',

      /* --- NAV / SIDEBAR --- */
      'nav.menu': 'Menyu',
      'nav.about': 'Biz haqimizda',
      'nav.services': 'Xizmatlarimiz',
      'nav.projects': 'Loyihalarimiz',
      'nav.partners': 'Hamkorlarimiz',
      'nav.contacts': 'Aloqa',

      /* --- FOOTER --- */
      'footer.tagline': 'Qadriyatlarga ega kuchli jamoa bilan ishlang.',
      'footer.about': 'PrintWell\'da biz har bir loyihaga masʼuliyat, halollik va sifat bilan yondashamiz. Bizning jamoamiz — oʻz ishini chin dildan sevadigan, ishonchli va sodiq mutaxassislardir.',
      'footer.work': 'Bizning ishlarimiz',
      'footer.privacy': 'Maxfiylik siyosati 2025',
      'footer.dev': 'SIDQ agentligi tomonidan ishlab chiqilgan',

      /* --- MARQUEE --- */
      'marquee.title': 'Bizga ishonadi',

      /* --- SERVICES --- */
      'services.eyebrow': 'Biz nima qilamiz',
      'services.title': 'Toʻliq tsiklli bosmaxona — dizayndan yetkazib berishgacha',
      'services.card1.title': 'Karton qadoqlash',
      'services.card1.desc': 'Gofrokarton, koʻzgu karton, mikrogofra. Mahsulotingiz uchun istalgan shakl, nashr va bezak.',
      'services.card2.title': 'Premium bezash',
      'services.card2.badge': 'Faqat bizda',
      'services.card2.desc': 'Folga bosish, kongreve tiqinlash va Spot UV — Toshkentdagi eksklyuziv postpress texnologiyalari.',
      'services.card3.title': 'Toʻqima qadoqlash',
      'services.card3.badge': 'Yangilik',
      'services.card3.desc': 'Zigʻir va paxta xaltachalar, logoli shoperlar — raqobatchilarda yoʻq ekologik qadoqlash.',
      'services.card4.title': 'Matbaachilik',
      'services.card4.desc': 'Vizitka, katalog, broshyura, varaqalar — ofset va raqamli bosma, istalgan nashr.',

      /* --- ABOUT --- */
      'about.eyebrow': 'Biz haqimizda',
      'about.title': 'Biz haqimizda. 20 yil davomida ishonchli qadoqlash yaratamiz',
      'about.title.line1': '20 yil davomida',
      'about.title.line2': 'ishonchli qadoqlash yaratamiz',
      'about.b1.heading': '2005 yildan: Poligraf Group\'dan PrintWell\'gacha',
      'about.b1.text': '20 yil davomida bozor yetakchilari uchun bosib kelmoqdamiz — va yildan-yilga kuchayib bormoqdamiz.',
      'about.b2.heading': '150+ mutaxassis va Yevropa darajasidagi uskunalar',
      'about.b2.text': 'Yetakchi Yevropa bosmaxonalari darajasidagi ishlab chiqarish parki — Toshkentning oʻzida.',
      'about.b3.heading': 'Chevrolet, Huawei, SQB bizga ishonadi',
      'about.b3.text': 'Jahon brendlari mahsulotlari uchun qadoqlash — bizning kundalik sifat standartimiz.'
    },

    en: {
      /* --- HERO --- */
      'hero.badge': 'TOP-10 printing houses in Uzbekistan · 20 years on the market',
      'hero.title': 'Packaging that sells your product',
      'hero.subtitle': 'Foil stamping · Embossing · Premium cardboard · Full cycle',
      'hero.cta': 'Request a quote',
      'hero.stat1.label': 'years on the market',
      'hero.stat2.label': 'orders completed',
      'hero.stat3.label': 'returning clients',
      'hero.sectionAria': 'PrintWell — hero screen',
      'hero.imgAlt': 'PrintWell premium packaging and printing: foil stamping, embossing, premium cardboard',

      /* --- NAV / SIDEBAR --- */
      'nav.menu': 'Menu',
      'nav.about': 'About us',
      'nav.services': 'Our services',
      'nav.projects': 'Our projects',
      'nav.partners': 'Our partners',
      'nav.contacts': 'Contacts',

      /* --- FOOTER --- */
      'footer.tagline': 'Work with a strong team that lives by its values.',
      'footer.about': 'At PrintWell we approach every project with responsibility, honesty and quality. Our team is made up of specialists who genuinely love their work — reliable and dedicated.',
      'footer.work': 'Our work',
      'footer.privacy': 'Privacy Policy 2025',
      'footer.dev': 'Developed by SIDQ agency',

      /* --- MARQUEE --- */
      'marquee.title': 'Trusted by',

      /* --- SERVICES --- */
      'services.eyebrow': 'What we do',
      'services.title': 'Full-cycle printing — from design to delivery',
      'services.card1.title': 'Cardboard Packaging',
      'services.card1.desc': 'Corrugated board, coated board, micro-flute. Any shape, run length or finish for your product.',
      'services.card2.title': 'Premium Finishing',
      'services.card2.badge': 'Exclusive',
      'services.card2.desc': 'Hot foil stamping, embossing and Spot UV — postpress technologies exclusive to PrintWell in Tashkent.',
      'services.card3.title': 'Textile Packaging',
      'services.card3.badge': 'New',
      'services.card3.desc': 'Linen & cotton pouches, branded tote bags — eco-packaging unavailable elsewhere in the market.',
      'services.card4.title': 'Print Production',
      'services.card4.desc': 'Business cards, catalogues, brochures, flyers — offset and digital printing at any volume.',

      /* --- ABOUT --- */
      'about.eyebrow': 'About us',
      'about.title': 'About us. 20 years crafting packaging that earns trust',
      'about.title.line1': '20 years crafting',
      'about.title.line2': 'packaging that earns trust',
      'about.b1.heading': 'Since 2005: from Poligraf Group to PrintWell',
      'about.b1.text': 'Two decades printing for market leaders — and growing stronger every year.',
      'about.b2.heading': '150+ specialists & European-grade equipment',
      'about.b2.text': 'A production facility on par with leading European print houses — right here in Tashkent.',
      'about.b3.heading': 'Chevrolet, Huawei, SQB trust us',
      'about.b3.text': 'Packaging for global brand products is our everyday quality benchmark.'
    }
  };

  var LANG_STORAGE_KEY = 'pw-lang';
  var SUPPORTED_LANGS = ['ru', 'uz', 'en'];
  var DEFAULT_LANG = 'ru';

  function getStoredLang() {
    var stored;
    try {
      stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch (e) {
      stored = null;
    }
    return SUPPORTED_LANGS.indexOf(stored) !== -1 ? stored : DEFAULT_LANG;
  }

  function storeLang(lang) {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage недоступен (приватный режим) — тихо игнорируем */
    }
  }

  function translate(lang, key) {
    var dict = I18N[lang] || I18N[DEFAULT_LANG];
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      return dict[key];
    }
    // фолбэк на RU, если в выбранном языке ключа нет
    if (Object.prototype.hasOwnProperty.call(I18N[DEFAULT_LANG], key)) {
      return I18N[DEFAULT_LANG][key];
    }
    return null;
  }

  /* Подсветка активной кнопки в обоих переключателях */
  function updateLangButtons(lang) {
    // desktop-переключатель (rd-lang)
    document.querySelectorAll('.rd-lang__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('rd-lang__btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // мобильный сайдбар (lang__active)
    document.querySelectorAll('#mobile-sidebar [data-lang]').forEach(function (btn) {
      btn.classList.toggle('lang__active', btn.getAttribute('data-lang') === lang);
    });
  }

  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;

    // 1. Обычный текст [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = translate(lang, key);
      if (value === null) return;

      if (key === 'hero.title') {
        // H1 хранит исходный текст для пословной анимации.
        // Кладём перевод в data-text и сбрасываем содержимое — пересборка ниже.
        el.setAttribute('data-text', value);
        el.textContent = value;
      } else {
        el.textContent = value;
      }
    });

    // 2. Произвольные атрибуты [data-i18n-attr="attr:key,attr2:key2"]
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var value = translate(lang, parts[1].trim());
        if (attr && value !== null) el.setAttribute(attr, value);
      });
    });

    // 3. Атрибутный вариант aria-label [data-i18n-aria-label="key"]
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var value = translate(lang, el.getAttribute('data-i18n-aria-label'));
      if (value !== null) el.setAttribute('aria-label', value);
    });

    // 4. <html lang>
    document.documentElement.setAttribute('lang', lang);

    // 5. Сохранить выбор
    storeLang(lang);

    // 6. Подсветить активные кнопки
    updateLangButtons(lang);

    // 7. Пересобрать пословную анимацию H1 (не ломая её).
    // Вызываем splitHeroTitle напрямую (она в области видимости IIFE), а не
    // через window.PrintWellRedesign — на случай если init() сработал до
    // присвоения экспорта (defer + readyState !== 'loading').
    splitHeroTitle();
  }

  function initLangSwitchers() {
    // делегирование на все элементы с data-lang (desktop + мобильный сайдбар)
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  }

  /* =========================================================================
     1. МОБИЛЬНЫЙ САЙДБАР
     Повторяет логику public/js/app.js: toggle класса .open на сайдбаре и
     кнопке, body.sidebar-open, закрытие по Escape. Видео/аккордеон убраны.
     ========================================================================= */
  var hamburgerBtn = document.getElementById('hamburger-btn');
  var sidebar = document.getElementById('mobile-sidebar');

  function toggleSidebar() {
    if (!sidebar || !hamburgerBtn) return;
    var isOpen = sidebar.classList.contains('open');

    sidebar.classList.remove('invisible');
    if (isOpen) {
      sidebar.classList.remove('open');
      hamburgerBtn.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    } else {
      sidebar.classList.add('open');
      hamburgerBtn.classList.add('open');
      document.body.classList.add('sidebar-open');
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleSidebar);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      toggleSidebar();
    }
  });

  /* =========================================================================
     2. HERO — пословная разбивка H1
     Контейнер H1 имеет data-i18n="hero.title". Текст берём из его содержимого
     (или из data-text, если задан), разбиваем на слова и оборачиваем каждое в
     <span class="rd-hero__word">. Так перевод не ломает анимацию: при смене
     языка достаточно заменить текст и снова вызвать splitHeroTitle().
     ========================================================================= */
  function splitHeroTitle() {
    var title = document.querySelector('[data-rd-hero-title]');
    if (!title) return;

    var text = (title.getAttribute('data-text') || title.textContent || '').trim();
    if (!text) return;

    title.textContent = '';
    var words = text.split(/\s+/);

    words.forEach(function (word, i) {
      var outer = document.createElement('span');
      outer.className = 'rd-hero__word';
      // последнее слово делаем акцентным градиентом
      if (i === words.length - 1) {
        outer.classList.add('rd-hero__title-accent');
      }
      outer.textContent = word;
      outer.style.setProperty('--word-delay', (i * 120) + 'ms');
      title.appendChild(outer);

      // обычный пробел между словами (не ломает перенос)
      if (i < words.length - 1) {
        title.appendChild(document.createTextNode(' '));
      }
    });

    // запуск пословной анимации
    if (prefersReducedMotion) {
      // reduced motion: показываем сразу, без stagger
      title.querySelectorAll('.rd-hero__word').forEach(function (w) {
        w.style.opacity = '1';
        w.style.transform = 'none';
      });
    } else {
      // в следующий кадр добавляем .is-in (запускает keyframes с delay)
      requestAnimationFrame(function () {
        title.querySelectorAll('.rd-hero__word').forEach(function (w) {
          w.classList.add('is-in');
        });
      });
    }
  }

  /* =========================================================================
     3a. СЧЁТЧИКИ (.count-up) — набегание чисел
     data-target, data-suffix, data-duration (мс), data-group ("1" -> пробел
     как разделитель тысяч). easeOut.
     ========================================================================= */
  function formatNumber(value, grouped) {
    var rounded = Math.round(value);
    if (!grouped) return String(rounded);
    // пробел-разделитель тысяч: "20 000"
    return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = parseInt(el.getAttribute('data-duration'), 10) || 1800;
    var grouped = el.getAttribute('data-group') === '1';

    if (prefersReducedMotion) {
      el.textContent = formatNumber(target, grouped) + suffix;
      return;
    }

    var start = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (start === null) start = timestamp;
      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var current = target * easeOutCubic(progress);
      el.textContent = formatNumber(current, grouped) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target, grouped) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* =========================================================================
     3b. ПЕРЕИСПОЛЬЗУЕМАЯ СИСТЕМА СКРОЛЛ-АНИМАЦИЙ
     .reveal -> добавляем .is-visible при входе во вьюпорт (once).
     data-stagger на родителе -> прямым детям .reveal проставляем --stagger-i.
     .count-up -> запускаем animateCount при появлении.
     ========================================================================= */
  function setupStagger() {
    // на мобильных stagger выключен (CSS уже это учитывает, но обнулим индекс)
    var parents = document.querySelectorAll('[data-stagger]');
    parents.forEach(function (parent) {
      var children = parent.querySelectorAll(':scope > .reveal');
      children.forEach(function (child, i) {
        child.style.setProperty('--stagger-i', isMobile ? 0 : i);
      });
    });
  }

  function initScrollAnimations() {
    setupStagger();

    var revealEls = document.querySelectorAll('.reveal');
    var countEls = document.querySelectorAll('.count-up');

    // Фолбэк: нет IntersectionObserver -> показать всё сразу
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
      countEls.forEach(function (el) {
        animateCount(el);
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });

    var countObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    countEls.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  /* =========================================================================
     INIT
     ========================================================================= */
  function init() {
    // Применяем сохранённый язык. setLang сам вызовет refreshHeroTitle()
    // (пословную разбивку H1), поэтому отдельный splitHeroTitle() не нужен.
    initLangSwitchers();
    setLang(getStoredLang());
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспорт: window.PrintWellRedesign.refreshHeroTitle() / setLang() / getLang()
  window.PrintWellRedesign = {
    refreshHeroTitle: splitHeroTitle,
    setLang: setLang,
    getLang: getStoredLang
  };
})();
