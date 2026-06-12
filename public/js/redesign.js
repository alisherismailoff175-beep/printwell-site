/* ============================================================================
   PrintWell — REDESIGN SCRIPT (index-new.html)
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
    return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
    splitHeroTitle();
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспорт для будущей мультиязычности: после смены языка можно заново
  // разбить заголовок (window.PrintWellRedesign.refreshHeroTitle()).
  window.PrintWellRedesign = {
    refreshHeroTitle: splitHeroTitle
  };
})();
