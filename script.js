// ===== CLYN Beauty – Interactions =====

// Jahr im Footer
document.getElementById('year').textContent = new Date().getFullYear();

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

  const listId = list.id || `pl-${Math.random().toString(36).slice(2, 8)}`;
  list.id = listId;
  title.setAttribute('role', 'button');
  title.setAttribute('tabindex', '0');
  title.setAttribute('aria-expanded', 'false');
  title.setAttribute('aria-controls', listId);

  const toggleBlock = () => {
    const open = block.classList.toggle('open');
    title.setAttribute('aria-expanded', open);
  };

  title.addEventListener('click', toggleBlock);
  title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleBlock();
    }
  });
});

// Reveal-on-Scroll
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
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
