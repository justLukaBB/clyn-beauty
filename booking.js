// ===== CLYN Beauty – Warenkorb (Preisliste) + Terminanfrage =====
(function () {
  'use strict';

  // --- Konfiguration ---
  const STUDIO_PHONE_WA = '491636183181';   // WhatsApp (international, ohne +)
  const STUDIO_EMAIL = 'info@clynbeauty.de';
  const SLOT_STEP = 30;                      // Minuten-Raster
  const SLOT_START = 9 * 60;                 // 09:00
  const SLOT_END = 18 * 60;                  // 18:00 (letzte Startzeit 17:30)

  const DAY_NAMES = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const minToStr = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  const toISO = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const fmtDate = (d) => DAY_NAMES[d.getDay()] + ', ' + d.getDate() + '. ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();

  // ===== DOM =====
  const form = $('appt-form');
  if (!form) return;
  const inpDate = $('af-date'), selTime = $('af-time');
  const success = $('appt-success'), band = $('termin');
  const btnSubmit = $('af-submit');

  const fab = $('cart-fab'), badge = $('cart-count');
  const overlay = $('cart-overlay');
  const cartItemsEl = $('cart-items'), cartEmptyEl = $('cart-empty'), cartFootEl = $('cart-foot');
  const cartTotalEl = $('cart-total');

  const afPick = $('af-pick'), afCart = $('af-cart'), afCartList = $('af-cart-list'), afCartTotal = $('af-cart-total'), afPickEmpty = $('af-pick-empty');

  const plItems = Array.prototype.slice.call(document.querySelectorAll('.pl-item'));

  // ===== Warenkorb-Status =====
  const cart = []; // [{name, price, label}]
  const inCart = (name) => cart.some((c) => c.name === name);

  function addItem(li) {
    const name = li.dataset.name;
    if (inCart(name)) return;
    cart.push({ name: name, price: +li.dataset.price || 0, label: li.dataset.pricelabel || (li.dataset.price + ' €') });
    render();
  }
  function removeItem(name) {
    const i = cart.findIndex((c) => c.name === name);
    if (i > -1) { cart.splice(i, 1); render(); }
  }
  function toggleItem(li) { inCart(li.dataset.name) ? removeItem(li.dataset.name) : addItem(li); }
  function clearCart() { cart.length = 0; render(); }

  const totalPrice = () => cart.reduce((s, c) => s + c.price, 0);
  const hasRange = () => cart.some((c) => c.label.indexOf('–') > -1);
  const priceLabel = () => (hasRange() ? 'ab ' : '') + totalPrice() + ' €';

  // ===== "+"-Buttons an den Preiszeilen erzeugen + Klick =====
  plItems.forEach((li) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pl-add';
    btn.textContent = '+';
    btn.setAttribute('aria-label', 'In den Warenkorb: ' + li.dataset.name);
    li.appendChild(btn);
    li.addEventListener('click', () => toggleItem(li));
  });

  // ===== Uhrzeiten (feste Startzeiten 09:00–17:30) =====
  for (let t = SLOT_START; t + SLOT_STEP <= SLOT_END; t += SLOT_STEP) {
    const o = document.createElement('option');
    o.value = minToStr(t);
    o.textContent = minToStr(t) + ' Uhr';
    selTime.appendChild(o);
  }

  // ===== Datum: heute als frühestmöglich =====
  const today = new Date(); today.setHours(0, 0, 0, 0);
  inpDate.min = toISO(today);
  function parsedDate() {
    if (!inpDate.value) return null;
    const p = inpDate.value.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  // ===== Rendering =====
  function render() {
    const n = cart.length;

    // FAB
    fab.hidden = n === 0;
    badge.textContent = n;

    // Preiszeilen-Status
    plItems.forEach((li) => {
      const active = inCart(li.dataset.name);
      li.classList.toggle('in-cart', active);
      const btn = li.querySelector('.pl-add');
      if (btn) { btn.textContent = active ? '✓' : '+'; btn.setAttribute('aria-label', (active ? 'Entfernen: ' : 'In den Warenkorb: ') + li.dataset.name); }
    });

    // Drawer
    cartItemsEl.innerHTML = '';
    cart.forEach((c) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = '<span class="cart-item-name">' + c.name + '</span><span class="cart-item-price">' + c.label + '</span>';
      const rm = document.createElement('button');
      rm.className = 'cart-item-remove'; rm.type = 'button';
      rm.setAttribute('aria-label', 'Entfernen'); rm.textContent = '×';
      rm.addEventListener('click', () => removeItem(c.name));
      li.appendChild(rm);
      cartItemsEl.appendChild(li);
    });
    cartEmptyEl.hidden = n > 0;
    cartFootEl.hidden = n === 0;
    if (n > 0) cartTotalEl.textContent = priceLabel();

    // Formular-Zusammenfassung
    afCart.hidden = n === 0;
    afPickEmpty.hidden = n > 0;
    afPick.classList.remove('invalid');
    afCartList.innerHTML = '';
    cart.forEach((c) => {
      const li = document.createElement('li');
      li.innerHTML = '<span>' + c.name + '</span><span>' + c.label + '</span>';
      const rm = document.createElement('button');
      rm.type = 'button'; rm.className = 'af-cart-remove'; rm.textContent = '×';
      rm.setAttribute('aria-label', 'Entfernen');
      rm.addEventListener('click', () => removeItem(c.name));
      li.appendChild(rm);
      afCartList.appendChild(li);
    });
    if (n > 0) afCartTotal.textContent = priceLabel();
  }

  // ===== Drawer öffnen/schließen =====
  function openCart() { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeCart() { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  fab.addEventListener('click', openCart);
  overlay.querySelector('.cart-drawer-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCart(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeCart(); });
  $('cart-clear').addEventListener('click', clearCart);
  $('cart-checkout').addEventListener('click', () => {
    closeCart();
    band.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ===== Validierung =====
  function mark(name, bad) { const el = form.elements[name]; if (el) el.classList.toggle('invalid', bad); }
  const emailOk = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

  function validateAll() {
    let firstBad = null;
    const fail = (el) => { if (el && !firstBad) firstBad = el; };

    ['firstname', 'lastname'].forEach((k) => {
      const bad = !form.elements[k].value.trim();
      mark(k, bad);
      if (bad) fail(form.elements[k]);
    });

    const emailBad = !emailOk(form.elements['email'].value.trim());
    mark('email', emailBad);
    if (emailBad) fail(form.elements['email']);

    const serviceBad = cart.length === 0;
    afPick.classList.toggle('invalid', serviceBad);
    if (serviceBad) fail(afPick);

    const d = parsedDate();
    const weekend = d && (d.getDay() === 0 || d.getDay() === 6);
    const dateBad = !d || weekend;
    mark('date', dateBad);
    if (dateBad) fail(inpDate);

    const timeBad = !selTime.value;
    mark('time', timeBad);
    if (timeBad) fail(selTime);

    const consent = form.elements['consent'];
    const consentBad = !consent.checked;
    consent.closest('.af-check').classList.toggle('invalid', consentBad);
    if (consentBad) fail(consent);

    return firstBad;
  }

  function shakeSubmit() { btnSubmit.classList.add('shake'); setTimeout(() => btnSubmit.classList.remove('shake'), 400); }

  // ===== Versand =====
  function buildMessage() {
    const v = (n) => form.elements[n].value.trim();
    const d = parsedDate();
    const lines = ['Terminanfrage – CLYN Beauty', '', 'Gewünschte Behandlungen:'];
    cart.forEach((c) => lines.push('  • ' + c.name + ' (' + c.label + ')'));
    lines.push('Gesamt: ' + priceLabel());
    lines.push('', 'Wunschtermin: ' + fmtDate(d) + ' um ' + selTime.value + ' Uhr', '',
      'Name: ' + v('firstname') + ' ' + v('lastname'),
      'E-Mail: ' + v('email'),
      'Telefon: ' + (v('phone') || '–'),
      'Nachricht: ' + (v('note') || '–'));
    return lines.join('\n');
  }

  function submitAnfrage() {
    const bad = validateAll();
    if (bad) {
      shakeSubmit();
      if (bad.focus) try { bad.focus({ preventScroll: true }); } catch (e) {}
      bad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const msg = buildMessage();
    const d = parsedDate();
    const subject = 'Terminanfrage CLYN Beauty – ' + cart.length + ' Behandlung(en) am ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
    $('af-whatsapp').href = 'https://wa.me/' + STUDIO_PHONE_WA + '?text=' + encodeURIComponent(msg);
    $('af-mail').href = 'mailto:' + STUDIO_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
    form.hidden = true; success.hidden = false;
    band.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Fehlermarkierung lösen, sobald korrigiert
  form.elements['consent'].addEventListener('change', function () {
    this.closest('.af-check').classList.toggle('invalid', !this.checked);
  });
  [inpDate, selTime].forEach((el) => el.addEventListener('change', () => el.classList.remove('invalid')));

  const edit = $('af-edit');
  if (edit) edit.addEventListener('click', () => {
    success.hidden = true; form.hidden = false;
    band.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Absenden
  form.addEventListener('submit', (e) => { e.preventDefault(); submitAnfrage(); });
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); submitAnfrage(); }
  });

  // Init
  render();
})();
