// ===== CLYN Beauty – Interactions =====

// Jahr im Footer
document.getElementById('year').textContent = new Date().getFullYear();

// Hero-Slideshow – Studio-Fotos automatisch durchwechseln (sanfter Crossfade)
(() => {
  const slides = document.querySelectorAll('.hero-media .hero-slide');
  if (slides.length < 2) return;

  const WECHSEL_MS = 5000; // Anzeigedauer pro Foto (ruhig/langsam); jedes Foto zoomt währenddessen sanft

  // Barrierefrei: bei „reduzierte Bewegung" nur das erste Bild zeigen, nicht wechseln
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let i = 0;
  let timer = null;

  const next = () => {
    // Sofortiger Wechsel – es ist immer genau EIN Foto sichtbar (kein Überblenden,
    // keine Lücke): altes raus & neues rein im selben Schritt
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  };
  const start = () => { if (!timer) timer = setInterval(next, WECHSEL_MS); };
  const stop = () => { clearInterval(timer); timer = null; };

  // Im Hintergrund-Tab pausieren (spart Ressourcen, kein „Sprung" beim Zurückkommen)
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
})();

// Header-Schatten beim Scrollen
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile-Drawer
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.mobile-menu');
const overlay = document.getElementById('nav-overlay');
const closeBtn = menu.querySelector('.mm-close');
const navLinks = menu.querySelectorAll('.mm-nav a');

// Aktiven Eintrag anhand des sichtbaren Abschnitts markieren
const markActive = () => {
  let current = '';
  document.querySelectorAll('section[id], div[id]').forEach((sec) => {
    if (sec.getBoundingClientRect().top <= 120) current = `#${sec.id}`;
  });
  navLinks.forEach((a) =>
    a.classList.toggle('active', a.getAttribute('href') === current)
  );
};

const openMenu = () => {
  markActive();
  overlay.classList.add('show');
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    menu.classList.add('open');
  });
  toggle.classList.add('open');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Menü schließen');
  document.body.style.overflow = 'hidden';
};

const closeMenu = () => {
  overlay.classList.remove('open');
  menu.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Menü öffnen');
  document.body.style.overflow = '';
  setTimeout(() => overlay.classList.remove('show'), 400);
};

toggle.addEventListener('click', () =>
  menu.classList.contains('open') ? closeMenu() : openMenu()
);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
});

// Leistungs-Akkordeon – Angebote erst beim Klick auf die Überschrift zeigen
document.querySelectorAll('.service-block').forEach((block) => {
  const title = block.querySelector('.service-title');
  const list = block.querySelector('.price-list');
  if (!title || !list) return;

  // Reihen-Index für das gestaffelte Einblenden der Angebote beim Aufklappen
  Array.prototype.forEach.call(
    list.querySelectorAll('.pl-item, .pl-subhead, .pl-note'),
    (li, i) => li.style.setProperty('--rvi', Math.min(i, 9))
  );

  const listId = list.id || `pl-${Math.random().toString(36).slice(2, 8)}`;
  list.id = listId;
  title.setAttribute('role', 'button');
  title.setAttribute('tabindex', '0');
  title.setAttribute('aria-expanded', 'false');
  title.setAttribute('aria-controls', listId);

  const setOpen = (open) => {
    block.classList.toggle('open', open);
    title.setAttribute('aria-expanded', open);
  };

  title.addEventListener('click', () => setOpen(!block.classList.contains('open')));
  title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!block.classList.contains('open'));
    }
  });

  // „Schließen"-Button am Ende der aufgeklappten Liste → klappt zu & springt zur Überschrift
  const closeLi = document.createElement('li');
  closeLi.className = 'pl-close-row';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pl-close';
  closeBtn.textContent = 'Schließen';
  closeLi.appendChild(closeBtn);
  list.appendChild(closeLi);
  closeBtn.addEventListener('click', () => {
    setOpen(false);
    title.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Gestaffelte Container: jedem Kind seinen Index als --rvi geben (Verzögerungs-Kaskade)
document.querySelectorAll('[data-stagger]').forEach((group) => {
  Array.prototype.forEach.call(group.children, (child, i) => {
    child.style.setProperty('--rvi', i);
  });
});

// Reveal-on-Scroll (einzelne .reveal-Elemente + gestaffelte [data-stagger]-Container)
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal, [data-stagger]').forEach((el) => io.observe(el));

// Google-Maps Klick-zum-Laden (DSGVO) – Karte erst nach aktiver Einwilligung laden
document.querySelectorAll('.map-consent-load').forEach((btn) => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('.map-wrap');
    const src = wrap && wrap.dataset.src;
    if (!src) return;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'Karte CLYN Beauty Dorsten';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    wrap.innerHTML = '';
    wrap.appendChild(iframe);
  });
});

// Schulungs-Karten: Wisch-Karussell mit Punkte-Indikator (Punkte nur auf dem Handy sichtbar)
const pkgGrid = document.querySelector('.pkg-grid');
if (pkgGrid) {
  const cards = Array.prototype.slice.call(pkgGrid.querySelectorAll('.pkg-card'));
  if (cards.length > 1) {
    // Punkte erzeugen
    const dots = document.createElement('div');
    dots.className = 'pkg-dots';
    dots.setAttribute('aria-label', 'Schulungen durchblättern');
    const dotEls = cards.map((card, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'pkg-dot';
      dot.setAttribute('aria-label', 'Zur Schulung ' + (i + 1));
      dot.addEventListener('click', () => {
        const gr = pkgGrid.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        const delta = (cr.left + cr.width / 2) - (gr.left + pkgGrid.clientWidth / 2);
        pkgGrid.scrollTo({ left: pkgGrid.scrollLeft + delta, behavior: 'smooth' });
      });
      dots.appendChild(dot);
      return dot;
    });
    pkgGrid.insertAdjacentElement('afterend', dots);

    // Aktiven Punkt setzen (entfernen + neu vergeben => 360°-Dreh-Animation triggert jedes Mal)
    let active = -1;
    const setActive = (i) => {
      if (i === active) return;
      if (active > -1) dotEls[active].classList.remove('active');
      dotEls[i].classList.add('active');
      active = i;
    };
    setActive(0);

    // Beim Wischen die mittig liegende Karte ermitteln (über Bildschirm-Koordinaten = robust)
    let raf = 0;
    pkgGrid.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const gr = pkgGrid.getBoundingClientRect();
        const gridCenter = gr.left + pkgGrid.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        cards.forEach((card, i) => {
          const cr = card.getBoundingClientRect();
          const d = Math.abs(cr.left + cr.width / 2 - gridCenter);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        setActive(best);
      });
    }, { passive: true });
  }
}
