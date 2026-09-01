(function () {
  'use strict';

  /* ============================================================
     Navbar: sombra al hacer scroll + menú hamburguesa
     ============================================================ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  });

  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  navMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
    })
  );

  /* ============================================================
     Hero: carrusel dinámico (fade + leve zoom), flechas y dots
     ============================================================ */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDotsWrap = document.getElementById('hero-dots');
  let heroIndex = 0;
  let heroTimer = null;

  heroSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    dot.addEventListener('click', () => goToHeroSlide(i));
    heroDotsWrap.appendChild(dot);
  });

  function goToHeroSlide(i) {
    heroSlides[heroIndex].classList.remove('active');
    heroDotsWrap.children[heroIndex].classList.remove('active');
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    heroSlides[heroIndex].classList.add('active');
    heroDotsWrap.children[heroIndex].classList.add('active');
  }

  document.getElementById('hero-prev').addEventListener('click', () => {
    goToHeroSlide(heroIndex - 1);
    restartHeroTimer();
  });
  document.getElementById('hero-next').addEventListener('click', () => {
    goToHeroSlide(heroIndex + 1);
    restartHeroTimer();
  });

  function restartHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goToHeroSlide(heroIndex + 1), 6500);
  }
  restartHeroTimer();

  const heroCarousel = document.getElementById('hero-carousel');
  heroCarousel.addEventListener('mouseenter', () => clearInterval(heroTimer));
  heroCarousel.addEventListener('mouseleave', restartHeroTimer);

  /* ------------------------------------------------------------
     Deslizamiento táctil (touch swipe) del carrusel principal
     ------------------------------------------------------------ */
  (function enableSwipe(el, onSwipeLeft, onSwipeRight) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let isSwiping = false;
    const THRESHOLD = 45; // píxeles mínimos para considerar un swipe válido

    el.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isSwiping = true;
        clearInterval(heroTimer);
      },
      { passive: true }
    );

    el.addEventListener(
      'touchmove',
      (e) => {
        if (!isSwiping) return;
        touchEndX = e.changedTouches[0].screenX;
        const deltaX = touchEndX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;
        // Si el gesto es mayormente horizontal, evitamos que el navegador
        // interprete el arrastre como scroll de página (sin bloquear el pan vertical normal).
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    el.addEventListener(
      'touchend',
      (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        touchEndX = e.changedTouches[0].screenX;
        const deltaX = touchEndX - touchStartX;
        if (deltaX > THRESHOLD) {
          onSwipeRight();
        } else if (deltaX < -THRESHOLD) {
          onSwipeLeft();
        }
        restartHeroTimer();
      },
      { passive: true }
    );
  })(
    heroCarousel,
    () => goToHeroSlide(heroIndex + 1), // swipe hacia la izquierda → siguiente
    () => goToHeroSlide(heroIndex - 1) // swipe hacia la derecha → anterior
  );

  /* ============================================================
     Servicios: slider horizontal + tarjetas "Leer más"
     ============================================================ */
  const track = document.getElementById('services-track');
  const cardWidth = 320 + 24; // ancho de tarjeta + gap

  document.getElementById('services-prev').addEventListener('click', () => {
    track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  });
  document.getElementById('services-next').addEventListener('click', () => {
    track.scrollBy({ left: cardWidth, behavior: 'smooth' });
  });

  document.querySelectorAll('.service-card').forEach((card) => {
    const btn = card.querySelector('.read-more span');
    card.querySelector('.read-more').addEventListener('click', (e) => {
      e.stopPropagation();
      const open = card.classList.toggle('open');
      btn.textContent = open ? 'Ver menos' : 'Leer más';
    });
  });

  // Iconos de especialidad: al hacer clic, desplazan el slider a la tarjeta correspondiente
  document.querySelectorAll('.service-icon-item').forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        track.scrollTo({ left: targetCard.offsetLeft - 24, behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     Calculadora de tarifas
     ============================================================ */
  const BASE = { enfermeria: 25, medicina: 35, obstetricia: 30, psicologia: 40, fisioterapia: 32 };
  const MODE_MULT = { hora: 1, dia: 7.5, semana: 45, mes: 170 };
  const MODE_LABEL = { hora: 'hora(s)', dia: 'día(s)', semana: 'semana(s)', mes: 'mes(es)' };

  const svcSel = document.getElementById('calc-service');
  const modeSel = document.getElementById('calc-mode');
  const qtyInput = document.getElementById('calc-qty');
  const priceOut = document.getElementById('calc-price');
  const noteOut = document.getElementById('calc-note');

  function updateCalc() {
    const svc = svcSel.value;
    const mode = modeSel.value;
    let qty = parseInt(qtyInput.value, 10);
    if (!qty || qty < 1) qty = 1;
    const base = BASE[svc] || 25;
    const total = base * MODE_MULT[mode] * qty;
    priceOut.textContent = 'S/. ' + total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    noteOut.textContent = `Estimado para ${qty} ${MODE_LABEL[mode]} de ${svcSel.options[svcSel.selectedIndex].text.toLowerCase()}. El precio final puede variar según complejidad.`;
  }
  [svcSel, modeSel, qtyInput].forEach((el) => el.addEventListener('input', updateCalc));
  updateCalc();

  /* ============================================================
     Testimonios
     ============================================================ */
  const testiSlides = document.querySelectorAll('.testi-slide');
  const testiDotsWrap = document.getElementById('testi-dots');
  let testiIndex = 0;
  testiSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', 'Testimonio ' + (i + 1));
    dot.addEventListener('click', () => goToTesti(i));
    testiDotsWrap.appendChild(dot);
  });
  function goToTesti(i) {
    testiSlides[testiIndex].classList.remove('active');
    testiDotsWrap.children[testiIndex].classList.remove('active');
    testiIndex = i;
    testiSlides[testiIndex].classList.add('active');
    testiDotsWrap.children[testiIndex].classList.add('active');
  }
  setInterval(() => goToTesti((testiIndex + 1) % testiSlides.length), 6000);

  /* ============================================================
     FAQ acordeón
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const answer = item.querySelector('.faq-a');
    if (item.classList.contains('open')) answer.style.maxHeight = answer.scrollHeight + 'px';
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();
