(() => {
  'use strict';
  const en = document.documentElement.lang === 'en-US';
  const t = (pt, e) => en ? e : pt;
  const cfg = window.AIRWAY_CONFIG || { email: 'contato@airwayinsights.com', whatsappNumber: '' };
  const email = cfg.email;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const menu = $('.menu-toggle'), mnav = $('#mobile-nav');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', t('Abrir menu', 'Open menu')); mnav.hidden = true; };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open)); mnav.hidden = open;
    menu.setAttribute('aria-label', open ? t('Abrir menu', 'Open menu') : t('Fechar menu', 'Close menu'));
  });
  $$('a', mnav).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  matchMedia('(min-width:1041px)').addEventListener('change', e => e.matches && closeMenu());

  $$('.lang a').forEach(a => a.addEventListener('click', () => { const u = new URL(a.href); u.hash = location.hash; a.href = u.href; }));
  $$('.email-link').forEach(a => { a.href = `mailto:${email}`; a.textContent = email; });

  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  if ('IntersectionObserver' in window) {
    const links = $$('.desktop-nav a');
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    links.map(a => $(a.getAttribute('href'))).filter(Boolean).forEach(s => spy.observe(s));
  }

  const form = $('#contact-form'), intent = form.elements.intent;
  $$('[data-intent]').forEach(l => l.addEventListener('click', () => { intent.value = l.dataset.intent; }));
  $$('[data-size]').forEach(b => b.addEventListener('click', () => {
    const was = b.getAttribute('aria-pressed') === 'true';
    $$('[data-size]').forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', String(!was));
    form.elements.size.value = was ? '' : `${b.dataset.size} mm`;
    $('#size-feedback').textContent = was ? '' : t(`Tamanho de ${b.dataset.size} mm incluído na sua solicitação.`, `${b.dataset.size} mm size added to your inquiry.`);
    if (!was) intent.value = 'quote';
  }));

  const dlg = $('#inquiry-dialog'), prev = $('#inquiry-preview');
  let lastFocus;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const f = new FormData(form), c = k => String(f.get(k) || '').trim();
    const interest = intent.options[intent.selectedIndex].textContent;
    const subject = `OROPHAR | ${interest}`;
    const body = [t('Olá, equipe Airway Insights Medical.', 'Hello, Airway Insights Medical team.'), '',
      `${t('Interesse', 'Interest')}: ${interest}`, `${t('Nome', 'Name')}: ${c('name')}`, `Email: ${c('email')}`,
      `${t('Instituição / empresa', 'Institution / company')}: ${c('organization') || '—'}`,
      `${t('Região', 'Region')}: ${c('region') || '—'}`,
      `${t('Quantidade estimada', 'Estimated quantity')}: ${c('quantity') || t('A definir', 'To be discussed')}`,
      `${t('Tamanho de interesse', 'Size of interest')}: ${c('size') || t('A definir', 'To be discussed')}`, '', c('message')].join('\n');
    prev.value = body;
    $('#send-email').href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    lastFocus = document.activeElement; dlg.showModal();
  });
  $('.close-dialog').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => lastFocus && lastFocus.focus());
  dlg.addEventListener('click', e => { if (e.target === dlg) { const r = dlg.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close(); } });
  $('#copy-message').addEventListener('click', async () => {
    const s = $('#copy-status');
    try { if (!navigator.clipboard || !isSecureContext) throw 0; await navigator.clipboard.writeText(prev.value); s.textContent = t('Mensagem copiada. Cole no seu e-mail para enviar.', 'Message copied. Paste it into your email to send.'); }
    catch { prev.focus(); prev.select(); s.textContent = t('Mensagem selecionada. Use Ctrl+C ou Copiar.', 'Message selected. Use Ctrl+C or Copy.'); }
  });
})();
