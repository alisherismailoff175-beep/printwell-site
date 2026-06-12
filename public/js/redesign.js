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
      'services.card3.title': 'Ярлыки и бирки',
      'services.card3.badge': 'Новинка',
      'services.card3.desc': 'Бумажные ярлыки и бирки для одежды с фольгой, тиснением и высечкой под ваш бренд.',
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
      'svc.card7.title': 'Визитные карточки',
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
      'svc.cta.btn': 'Обсудить проект',

      /* --- ABOUT PAGE (about.html) --- */
      'ab.crumb.home': 'Главная',
      'ab.crumb.current': 'О нас',
      'ab.hero.title': 'О компании',
      'ab.hero.subtitle': '20 лет создаём упаковку для лидеров рынка Узбекистана',
      'ab.history.eyebrow': 'Наша история',
      'ab.history.p1': 'Начинали как небольшая типография, а сегодня входим в ТОП-10 типографий Узбекистана.',
      'ab.history.p2': 'Полный цикл: от разработки дизайна до доставки готовой продукции — всё под одной крышей в Ташкенте.',
      'ab.stat.years': 'лет на рынке',
      'ab.stat.clients': 'постоянных клиентов',
      'ab.stat.orders': 'выполненных заказов',
      'ab.stat.specialists': 'специалистов в команде',
      'ab.values.title': 'Наши ценности',
      'ab.val1.title': 'Качество',
      'ab.val1.text': 'Европейские стандарты печати и отделки на каждом тираже.',
      'ab.val2.title': 'Инновации',
      'ab.val2.text': 'AI-дизайн и современное оборудование для нестандартных задач.',
      'ab.val3.title': 'Надёжность',
      'ab.val3.text': 'Соблюдение сроков и тиражей — от 100 до 100 000 экземпляров.',
      'ab.team.title': 'Наша команда',
      'ab.team1.title': 'Производство',
      'ab.team1.text': 'Печать, резка и постпресс на собственном оборудовании.',
      'ab.team2.title': 'Дизайн',
      'ab.team2.text': 'Разработка макетов, брендинга и подготовка к печати.',
      'ab.team3.title': 'Логистика',
      'ab.team3.text': 'Доставка готовой продукции по всему Узбекистану.',
      'ab.cta.title': 'Готовы обсудить ваш проект?',
      'ab.cta.btn': 'Оставить заявку',

      /* --- PROJECTS PAGE (projects.html) --- */
      'prj.crumb.home': 'Главная',
      'prj.crumb.current': 'Наши работы',
      'prj.hero.title': 'Наши работы',
      'prj.hero.subtitle': 'Реализованные проекты для ведущих компаний Узбекистана',
      'prj.p1.title': 'Упаковка для фармацевтики',
      'prj.p2.title': 'Каталоги и брошюры',
      'prj.p3.title': 'Ярлыки для fashion-бренда',
      'prj.p4.title': 'Фольгирование коробок для косметики',
      'prj.p5.title': 'Визитные карточки с премиум-отделкой',
      'prj.p6.title': 'Мерч с логотипом для корпоратива',
      'prj.p7.title': 'Упаковка для кондитерской',
      'prj.p8.title': 'Блокноты, папки и кубарики',
      'prj.p9.title': 'Тиснение и ламинация на картонной упаковке',
      'prj.p10.title': 'Этикетки для продуктового бренда',
      'prj.p11.title': 'Термосы и кружки с логотипом',
      'prj.p12.title': 'Жёсткие коробки с магнитным замком',
      'prj.cta.title': 'Хотите такой же результат?',

      /* --- REQUEST PAGE (request.html) --- */
      'req.crumb.home': 'Главная',
      'req.crumb.current': 'Заявка',
      'req.hero.title': 'Оставить заявку',
      'req.hero.subtitle': 'Рассчитаем стоимость за 24 часа',
      'req.form.title': 'Расскажите о вашем заказе',
      'req.form.subtitle': 'Поля со звёздочкой обязательны',
      'req.f.name': 'Имя',
      'req.f.company': 'Компания',
      'req.f.phone': 'Телефон',
      'req.f.email': 'Email',
      'req.f.product': 'Тип продукции',
      'req.f.qty': 'Тираж',
      'req.f.qtyPlaceholder': 'например: 1000 шт',
      'req.f.message': 'Сообщение',
      'req.f.submit': 'Отправить заявку',
      'req.opt.boxes': 'Картонные коробки',
      'req.opt.bags': 'Бумажные пакеты',
      'req.opt.tags': 'Ярлыки и этикетки',
      'req.opt.notebooks': 'Блокноты, папки и кубарики',
      'req.opt.catalog': 'Каталоги и брошюры',
      'req.opt.cards': 'Визитки',
      'req.opt.merch': 'Мерч с логотипом',
      'req.opt.premium': 'Премиум-отделка',
      'req.opt.other': 'Другое',
      'req.success.title': 'Спасибо! Мы свяжемся с вами в течение 24 часов',
      'req.success.btn': 'Вернуться на главную',
      'req.c.telegram': 'Telegram',
      'req.c.telegramVal': 'Написать в Telegram',
      'req.c.instagram': 'Instagram',
      'req.c.instagramVal': 'Написать в Instagram',
      'req.c.phone': 'Телефон и адрес',
      'req.c.address': 'Qatartol koʻchasi 1, Ташкент',

      /* --- PARTNERS PAGE (partners.html) --- */
      'prt.crumb.home': 'Главная',
      'prt.crumb.current': 'Наши клиенты',
      'prt.hero.title': 'Наши клиенты',
      'prt.hero.subtitle': 'Компании которые доверяют PrintWell',
      'prt.grid.title': 'Среди наших клиентов',
      'prt.quote.pre': 'Среди наших клиентов — ',
      'prt.quote.post': ' и более 250 компаний Узбекистана',
      'prt.cta.title': 'Станьте нашим клиентом',
      'prt.cta.btn': 'Оставить заявку'
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
      'services.card3.title': 'Yorliq va birkalar',
      'services.card3.badge': 'Yangilik',
      'services.card3.desc': 'Kiyim uchun qogʻoz yorliq va birkalar: folga, tiqinlash va shtans — brendingiz uchun.',
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
      'svc.card7.title': 'Vizit kartalari',
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
      'svc.cta.btn': 'Loyihani muhokama qilish',

      /* --- ABOUT PAGE (about.html) --- */
      'ab.crumb.home': 'Bosh sahifa',
      'ab.crumb.current': 'Biz haqimizda',
      'ab.hero.title': 'Kompaniya haqida',
      'ab.hero.subtitle': '20 yildan beri Oʻzbekiston bozori yetakchilari uchun qadoqlash yaratamiz',
      'ab.history.eyebrow': 'Bizning tariximiz',
      'ab.history.p1': 'Kichik bosmaxona sifatida boshlagan edik, bugun esa Oʻzbekistonning TOP-10 bosmaxonasi qatoridamiz.',
      'ab.history.p2': 'Toʻliq tsikl: dizayn ishlab chiqishdan tayyor mahsulotni yetkazib berishgacha — barchasi Toshkentda bir tom ostida.',
      'ab.stat.years': 'yil bozorda',
      'ab.stat.clients': 'doimiy mijozlar',
      'ab.stat.orders': 'bajarilgan buyurtmalar',
      'ab.stat.specialists': 'jamoadagi mutaxassislar',
      'ab.values.title': 'Bizning qadriyatlarimiz',
      'ab.val1.title': 'Sifat',
      'ab.val1.text': 'Har bir nashrda Yevropa darajasidagi bosma va bezash standartlari.',
      'ab.val2.title': 'Innovatsiyalar',
      'ab.val2.text': 'AI-dizayn va nostandart vazifalar uchun zamonaviy uskunalar.',
      'ab.val3.title': 'Ishonchlilik',
      'ab.val3.text': 'Muddat va nashrlarga rioya — 100 dan 100 000 nusxagacha.',
      'ab.team.title': 'Bizning jamoamiz',
      'ab.team1.title': 'Ishlab chiqarish',
      'ab.team1.text': 'Bosma, kesish va postpress oʻz uskunalarimizda.',
      'ab.team2.title': 'Dizayn',
      'ab.team2.text': 'Maket, brending ishlab chiqish va bosmaga tayyorlash.',
      'ab.team3.title': 'Logistika',
      'ab.team3.text': 'Tayyor mahsulotni butun Oʻzbekiston boʻylab yetkazib berish.',
      'ab.cta.title': 'Loyihangizni muhokama qilishga tayyormisiz?',
      'ab.cta.btn': 'Buyurtma qoldirish',

      /* --- PROJECTS PAGE (projects.html) --- */
      'prj.crumb.home': 'Bosh sahifa',
      'prj.crumb.current': 'Bizning ishlarimiz',
      'prj.hero.title': 'Bizning ishlarimiz',
      'prj.hero.subtitle': 'Oʻzbekistonning yetakchi kompaniyalari uchun amalga oshirilgan loyihalar',
      'prj.p1.title': 'Farmatsevtika uchun qadoqlash',
      'prj.p2.title': 'Katalog va broshyuralar',
      'prj.p3.title': 'Fashion-brend uchun yorliqlar',
      'prj.p4.title': 'Kosmetika qutilari uchun folga bosish',
      'prj.p5.title': 'Premium bezashli vizit kartalari',
      'prj.p6.title': 'Korporativ tadbir uchun logotipli merch',
      'prj.p7.title': 'Qandolat sexi uchun qadoqlash',
      'prj.p8.title': 'Bloknot, papka va kubariklar',
      'prj.p9.title': 'Karton qadoqlashda tiqinlash va laminatsiya',
      'prj.p10.title': 'Oziq-ovqat brendi uchun etiketkalar',
      'prj.p11.title': 'Logotipli termos va krujkalar',
      'prj.p12.title': 'Magnitli qulfli qattiq qutilar',
      'prj.cta.title': 'Xuddi shunday natija xohlaysizmi?',

      /* --- REQUEST PAGE (request.html) --- */
      'req.crumb.home': 'Bosh sahifa',
      'req.crumb.current': 'Ariza',
      'req.hero.title': 'Ariza qoldirish',
      'req.hero.subtitle': 'Narxni 24 soat ichida hisoblab beramiz',
      'req.form.title': 'Buyurtmangiz haqida gapiring',
      'req.form.subtitle': 'Yulduzchali maydonlar majburiy',
      'req.f.name': 'Ism',
      'req.f.company': 'Kompaniya',
      'req.f.phone': 'Telefon',
      'req.f.email': 'Email',
      'req.f.product': 'Mahsulot turi',
      'req.f.qty': 'Nashr',
      'req.f.qtyPlaceholder': 'masalan: 1000 dona',
      'req.f.message': 'Xabar',
      'req.f.submit': 'Ariza yuborish',
      'req.opt.boxes': 'Karton qutilar',
      'req.opt.bags': 'Qogʻoz paketlar',
      'req.opt.tags': 'Yorliq va etiketkalar',
      'req.opt.notebooks': 'Bloknot, papka va kubariklar',
      'req.opt.catalog': 'Katalog va broshyuralar',
      'req.opt.cards': 'Vizitkalar',
      'req.opt.merch': 'Logotipli merch',
      'req.opt.premium': 'Premium bezash',
      'req.opt.other': 'Boshqa',
      'req.success.title': 'Rahmat! 24 soat ichida siz bilan bogʻlanamiz',
      'req.success.btn': 'Bosh sahifaga qaytish',
      'req.c.telegram': 'Telegram',
      'req.c.telegramVal': 'Telegramda yozish',
      'req.c.instagram': 'Instagram',
      'req.c.instagramVal': 'Instagramda yozish',
      'req.c.phone': 'Telefon va manzil',
      'req.c.address': 'Qatartol koʻchasi 1, Toshkent',

      /* --- PARTNERS PAGE (partners.html) --- */
      'prt.crumb.home': 'Bosh sahifa',
      'prt.crumb.current': 'Bizning mijozlar',
      'prt.hero.title': 'Bizning mijozlar',
      'prt.hero.subtitle': 'PrintWellʼga ishonadigan kompaniyalar',
      'prt.grid.title': 'Bizning mijozlar orasida',
      'prt.quote.pre': 'Mijozlarimiz orasida — ',
      'prt.quote.post': ' va Oʻzbekistonning 250 dan ortiq kompaniyasi',
      'prt.cta.title': 'Bizning mijozimizga aylaning',
      'prt.cta.btn': 'Ariza qoldirish'
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
      'services.card3.title': 'Tags & labels',
      'services.card3.badge': 'New',
      'services.card3.desc': 'Paper tags & labels for clothing with foil, embossing and die-cutting for your brand.',
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
      'svc.cta.btn': 'Discuss your project',

      /* --- ABOUT PAGE (about.html) --- */
      'ab.crumb.home': 'Home',
      'ab.crumb.current': 'About us',
      'ab.hero.title': 'About the company',
      'ab.hero.subtitle': 'For 20 years we\'ve created packaging for the market leaders of Uzbekistan',
      'ab.history.eyebrow': 'Our story',
      'ab.history.p1': 'We started as a small print shop and today we\'re among the TOP-10 printing houses in Uzbekistan.',
      'ab.history.p2': 'Full cycle: from design development to delivery of the finished product — all under one roof in Tashkent.',
      'ab.stat.years': 'years on the market',
      'ab.stat.clients': 'returning clients',
      'ab.stat.orders': 'orders completed',
      'ab.stat.specialists': 'specialists on the team',
      'ab.values.title': 'Our values',
      'ab.val1.title': 'Quality',
      'ab.val1.text': 'European print and finishing standards on every run.',
      'ab.val2.title': 'Innovation',
      'ab.val2.text': 'AI design and modern equipment for non-standard tasks.',
      'ab.val3.title': 'Reliability',
      'ab.val3.text': 'Meeting deadlines and volumes — from 100 to 100,000 copies.',
      'ab.team.title': 'Our team',
      'ab.team1.title': 'Production',
      'ab.team1.text': 'Printing, cutting and postpress on our own equipment.',
      'ab.team2.title': 'Design',
      'ab.team2.text': 'Layout and branding development and prepress.',
      'ab.team3.title': 'Logistics',
      'ab.team3.text': 'Delivery of the finished product across Uzbekistan.',
      'ab.cta.title': 'Ready to discuss your project?',
      'ab.cta.btn': 'Leave a request',

      /* --- PROJECTS PAGE (projects.html) --- */
      'prj.crumb.home': 'Home',
      'prj.crumb.current': 'Our work',
      'prj.hero.title': 'Our work',
      'prj.hero.subtitle': 'Completed projects for leading companies in Uzbekistan',
      'prj.p1.title': 'Packaging for pharmaceuticals',
      'prj.p2.title': 'Catalogues & brochures',
      'prj.p3.title': 'Tags for a fashion brand',
      'prj.p4.title': 'Foil stamping on cosmetics boxes',
      'prj.p5.title': 'Business cards with premium finishing',
      'prj.p6.title': 'Branded merch for a corporate event',
      'prj.p7.title': 'Packaging for a confectionery',
      'prj.p8.title': 'Notebooks, folders & cube pads',
      'prj.p9.title': 'Embossing & lamination on cardboard packaging',
      'prj.p10.title': 'Labels for a food brand',
      'prj.p11.title': 'Branded thermoses & mugs',
      'prj.p12.title': 'Rigid boxes with a magnetic closure',
      'prj.cta.title': 'Want the same result?',

      /* --- REQUEST PAGE (request.html) --- */
      'req.crumb.home': 'Home',
      'req.crumb.current': 'Request',
      'req.hero.title': 'Leave a request',
      'req.hero.subtitle': 'We\'ll calculate the cost within 24 hours',
      'req.form.title': 'Tell us about your order',
      'req.form.subtitle': 'Fields marked with an asterisk are required',
      'req.f.name': 'Name',
      'req.f.company': 'Company',
      'req.f.phone': 'Phone',
      'req.f.email': 'Email',
      'req.f.product': 'Product type',
      'req.f.qty': 'Quantity',
      'req.f.qtyPlaceholder': 'e.g. 1000 pcs',
      'req.f.message': 'Message',
      'req.f.submit': 'Send request',
      'req.opt.boxes': 'Cardboard boxes',
      'req.opt.bags': 'Paper bags',
      'req.opt.tags': 'Tags & labels',
      'req.opt.notebooks': 'Notebooks, folders & cube pads',
      'req.opt.catalog': 'Catalogues & brochures',
      'req.opt.cards': 'Business cards',
      'req.opt.merch': 'Branded merch',
      'req.opt.premium': 'Premium finishing',
      'req.opt.other': 'Other',
      'req.success.title': 'Thank you! We\'ll get in touch within 24 hours',
      'req.success.btn': 'Back to home',
      'req.c.telegram': 'Telegram',
      'req.c.telegramVal': 'Message on Telegram',
      'req.c.instagram': 'Instagram',
      'req.c.instagramVal': 'Message on Instagram',
      'req.c.phone': 'Phone & address',
      'req.c.address': 'Qatartol koʻchasi 1, Tashkent',

      /* --- PARTNERS PAGE (partners.html) --- */
      'prt.crumb.home': 'Home',
      'prt.crumb.current': 'Our clients',
      'prt.hero.title': 'Our clients',
      'prt.hero.subtitle': 'Companies that trust PrintWell',
      'prt.grid.title': 'Among our clients',
      'prt.quote.pre': 'Our clients include ',
      'prt.quote.post': ' and 250+ companies across Uzbekistan',
      'prt.cta.title': 'Become our client',
      'prt.cta.btn': 'Leave a request'
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
