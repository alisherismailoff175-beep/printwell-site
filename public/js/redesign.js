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
      'about.b3.text': 'Упаковка продуктов мировых брендов — наш ежедневный стандарт качества.',

      /* --- SERVICES PAGE (services.html) --- */
      'svc.crumb.home': 'Главная',
      'svc.crumb.current': 'Услуги',
      'svc.hero.title': 'Наши услуги',
      'svc.hero.subtitle': 'Полный цикл — от разработки дизайна до готовой продукции',
      'svc.tab.all': 'Все',
      'svc.tab.packaging': 'Упаковка',
      'svc.tab.print': 'Полиграфия',
      'svc.tab.premium': 'Премиум-отделка',
      'svc.tab.merch': 'Мерч',
      'svc.cat.packaging': 'Упаковка',
      'svc.cat.print': 'Полиграфия',
      'svc.cat.premium': 'Премиум',
      'svc.cat.merch': 'Мерч',
      'svc.price': 'Запросить цену',
      'svc.card1.title': 'Картонные коробки',
      'svc.card1.desc': 'Гофрокартон, мелованный картон и микрогофра. Любые размеры и высечка под продукт — от пробной партии до крупного тиража.',
      'svc.card2.title': 'Бумажные пакеты',
      'svc.card2.desc': 'Брендированные пакеты с ручками, глянцевой или матовой ламинацией. Для ритейла, подарочных наборов и фирменного мерча.',
      'svc.card3.title': 'Ярлыки и бирки для текстиля',
      'svc.card3.desc': 'Навесные ярлыки и бирки для одежды: плотный картон, тиснение фольгой, фигурная высечка и люверсы под ваш бренд.',
      'svc.card4.title': 'Этикетки',
      'svc.card4.desc': 'Самоклеящиеся этикетки для продуктов, флаконов и тары. Влагостойкие материалы, точная цветопередача, любые формы.',
      'svc.card5.title': 'Блокноты и папки',
      'svc.card5.desc': 'Корпоративные блокноты, ежедневники и папки с логотипом. Твёрдый переплёт, тиснение, фирменные цвета.',
      'svc.card6.title': 'Каталоги и брошюры',
      'svc.card6.desc': 'Каталоги, брошюры и буклеты на скрепке или КБС. Офсетная печать, плотная бумага, премиальная отделка обложки.',
      'svc.card7.title': 'Визитки',
      'svc.card7.desc': 'Визитки от 100 штук: дизайнерская бумага, фольга, тиснение, Spot UV и скруглённые углы — в любой комбинации.',
      'svc.card8.title': 'Нанесение логотипа на мерч',
      'svc.card8.desc': 'Логотип на ручки, термосы, кружки и блокноты. Тампопечать, УФ-печать и гравировка для брендированных подарков.',
      'svc.card9.title': 'Премиум-отделка',
      'svc.card9.desc': 'Фольгирование, конгревное тиснение, Spot UV, ламинация и высечка. Эксклюзивные технологии постпресса в Ташкенте.',
      'svc.adv.heading': 'Почему PrintWell',
      'svc.adv1.title': 'Собственное производство',
      'svc.adv1.text': 'Не перекупщики: весь цикл — печать, постпресс и сборка — на нашем производстве в Ташкенте.',
      'svc.adv2.title': 'Премиум-отделка',
      'svc.adv2.text': 'Фольга, конгревное тиснение и Spot UV, которых нет у конкурентов в Узбекистане.',
      'svc.adv3.title': 'Сроки и тиражи',
      'svc.adv3.text': 'От 100 до 100 000 экземпляров — выдерживаем срок даже на срочных заказах.',
      'svc.cta.title': 'Не нашли нужную услугу? Мы делаем любую полиграфию под заказ',
      'svc.cta.btn': 'Обсудить проект'
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
      'about.b3.text': 'Jahon brendlari mahsulotlari uchun qadoqlash — bizning kundalik sifat standartimiz.',

      /* --- SERVICES PAGE (services.html) --- */
      'svc.crumb.home': 'Bosh sahifa',
      'svc.crumb.current': 'Xizmatlar',
      'svc.hero.title': 'Xizmatlarimiz',
      'svc.hero.subtitle': 'Toʻliq tsikl — dizayn ishlab chiqishdan tayyor mahsulotgacha',
      'svc.tab.all': 'Hammasi',
      'svc.tab.packaging': 'Qadoqlash',
      'svc.tab.print': 'Matbaachilik',
      'svc.tab.premium': 'Premium bezash',
      'svc.tab.merch': 'Merch',
      'svc.cat.packaging': 'Qadoqlash',
      'svc.cat.print': 'Matbaachilik',
      'svc.cat.premium': 'Premium',
      'svc.cat.merch': 'Merch',
      'svc.price': 'Narxni soʻrash',
      'svc.card1.title': 'Karton qutilar',
      'svc.card1.desc': 'Gofrokarton, koʻzgu karton va mikrogofra. Mahsulot uchun istalgan oʻlcham va shtans — sinov partiyasidan yirik nashrgacha.',
      'svc.card2.title': 'Qogʻoz paketlar',
      'svc.card2.desc': 'Tutqichli brendli paketlar, yaltiroq yoki mat laminatsiya. Riteyl, sovgʻa toʻplamlari va firma merchi uchun.',
      'svc.card3.title': 'Toʻqimachilik uchun yorliq va birkalar',
      'svc.card3.desc': 'Kiyim uchun osma yorliq va birkalar: zich karton, folga bosish, figurali shtans va lyuverslar — brendingiz uchun.',
      'svc.card4.title': 'Etiketkalar',
      'svc.card4.desc': 'Mahsulot, flakon va idishlar uchun yopishqoq etiketkalar. Namga chidamli materiallar, aniq rang, istalgan shakl.',
      'svc.card5.title': 'Bloknot va papkalar',
      'svc.card5.desc': 'Logotipli korporativ bloknotlar, kundaliklar va papkalar. Qattiq muqova, tiqinlash, firma ranglari.',
      'svc.card6.title': 'Katalog va broshyuralar',
      'svc.card6.desc': 'Qisqichli yoki KBS kataloglar, broshyura va bukletlar. Ofset bosma, zich qogʻoz, premium muqova bezagi.',
      'svc.card7.title': 'Vizitkalar',
      'svc.card7.desc': '100 donadan vizitkalar: dizaynerlik qogʻozi, folga, tiqinlash, Spot UV va yumaloq burchaklar — istalgan uygʻunlikda.',
      'svc.card8.title': 'Merchga logotip tushirish',
      'svc.card8.desc': 'Ruchka, termos, krujka va bloknotlarga logotip. Tampon bosma, UV bosma va gravyura — brendli sovgʻalar uchun.',
      'svc.card9.title': 'Premium bezash',
      'svc.card9.desc': 'Folga bosish, kongreve tiqinlash, Spot UV, laminatsiya va shtans. Toshkentdagi eksklyuziv postpress texnologiyalari.',
      'svc.adv.heading': 'Nega PrintWell',
      'svc.adv1.title': 'Oʻz ishlab chiqarishimiz',
      'svc.adv1.text': 'Qayta sotuvchilar emas: butun tsikl — bosma, postpress va yigʻish — Toshkentdagi oʻz ishlab chiqarishimizda.',
      'svc.adv2.title': 'Premium bezash',
      'svc.adv2.text': 'Raqobatchilarda yoʻq folga, kongreve tiqinlash va Spot UV — Oʻzbekistonda faqat bizda.',
      'svc.adv3.title': 'Muddat va nashrlar',
      'svc.adv3.text': '100 dan 100 000 nusxagacha — shoshilinch buyurtmalarda ham muddatga rioya qilamiz.',
      'svc.cta.title': 'Kerakli xizmatni topmadingizmi? Biz istalgan matbaa mahsulotini buyurtmaga tayyorlaymiz',
      'svc.cta.btn': 'Loyihani muhokama qilish'
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
      'about.b3.text': 'Packaging for global brand products is our everyday quality benchmark.',

      /* --- SERVICES PAGE (services.html) --- */
      'svc.crumb.home': 'Home',
      'svc.crumb.current': 'Services',
      'svc.hero.title': 'Our services',
      'svc.hero.subtitle': 'Full cycle — from design development to the finished product',
      'svc.tab.all': 'All',
      'svc.tab.packaging': 'Packaging',
      'svc.tab.print': 'Print',
      'svc.tab.premium': 'Premium finishing',
      'svc.tab.merch': 'Merch',
      'svc.cat.packaging': 'Packaging',
      'svc.cat.print': 'Print',
      'svc.cat.premium': 'Premium',
      'svc.cat.merch': 'Merch',
      'svc.price': 'Request a quote',
      'svc.card1.title': 'Cardboard boxes',
      'svc.card1.desc': 'Corrugated board, coated board and micro-flute. Any size and die-cut for your product — from a trial run to large volumes.',
      'svc.card2.title': 'Paper bags',
      'svc.card2.desc': 'Branded bags with handles, glossy or matte lamination. For retail, gift sets and corporate merch.',
      'svc.card3.title': 'Textile tags & labels',
      'svc.card3.desc': 'Hang tags and labels for clothing: thick cardstock, foil stamping, custom die-cut shapes and eyelets for your brand.',
      'svc.card4.title': 'Labels',
      'svc.card4.desc': 'Self-adhesive labels for products, bottles and containers. Water-resistant materials, accurate colour, any shape.',
      'svc.card5.title': 'Notebooks & folders',
      'svc.card5.desc': 'Corporate notebooks, planners and folders with your logo. Hardcover, embossing, brand colours.',
      'svc.card6.title': 'Catalogues & brochures',
      'svc.card6.desc': 'Saddle-stitched or perfect-bound catalogues, brochures and booklets. Offset print, heavy paper, premium cover finishing.',
      'svc.card7.title': 'Business cards',
      'svc.card7.desc': 'Business cards from 100 pcs: designer paper, foil, embossing, Spot UV and rounded corners — in any combination.',
      'svc.card8.title': 'Logo printing on merch',
      'svc.card8.desc': 'Logos on pens, thermoses, mugs and notebooks. Pad printing, UV printing and engraving for branded gifts.',
      'svc.card9.title': 'Premium finishing',
      'svc.card9.desc': 'Foil stamping, blind embossing, Spot UV, lamination and die-cutting. Exclusive postpress technologies in Tashkent.',
      'svc.adv.heading': 'Why PrintWell',
      'svc.adv1.title': 'In-house production',
      'svc.adv1.text': 'No middlemen: the entire cycle — printing, postpress and assembly — runs at our own facility in Tashkent.',
      'svc.adv2.title': 'Premium finishing',
      'svc.adv2.text': 'Foil, blind embossing and Spot UV that competitors in Uzbekistan simply don\'t offer.',
      'svc.adv3.title': 'Deadlines & volumes',
      'svc.adv3.text': 'From 100 to 100,000 copies — we meet the deadline even on rush orders.',
      'svc.cta.title': 'Didn\'t find the service you need? We produce any print product to order',
      'svc.cta.btn': 'Discuss your project'
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
