(() => {
  'use strict';
  const en = document.documentElement.lang === 'en-US';
  const text = (pt, english) => en ? english : pt;
  const config = window.AIRWAY_CONFIG || { email: 'airwayinsights@gmail.com', whatsappNumber: '' };
  const email = config.email || 'airwayinsights@gmail.com';
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', text('Abrir menu', 'Open menu')); mobileNav.hidden = true; };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open)); mobileNav.hidden = open;
    menu.setAttribute('aria-label', open ? text('Abrir menu', 'Open menu') : text('Fechar menu', 'Close menu'));
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width:1001px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  document.querySelectorAll('.language-switch a').forEach(link => {
    link.addEventListener('click', () => { const url = new URL(link.href); url.hash = window.location.hash; link.href = url.href; });
  });
  document.querySelectorAll('.email-link').forEach(link => {
    link.href = `mailto:${email}`;
    link.replaceChildren(document.createTextNode(email));
  });
  if (/^\d{10,15}$/.test(config.whatsappNumber)) {
    document.querySelectorAll('.whatsapp-contact').forEach(link => {
      link.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text('Olá! Gostaria de informações sobre o OROPHAR 2.0.', 'Hello! I would like information about OROPHAR 2.0.'))}`;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; link.hidden = false;
    });
  }
  if (config.productImage && config.productImage !== 'orophar-reference.webp') {
    document.querySelectorAll('.product-image').forEach(img => {
      img.src = new URL(config.productImage, img.src).href;
      if (!config.productImageIsLegacy) {
        img.alt = text('OROPHAR 2.0 — fotografia do produto', 'OROPHAR 2.0 — product photograph');
        img.style.clipPath = 'none'; img.style.marginTop = '0';
        img.closest('.product-stage').querySelector('.stage-bottom').children[1].textContent = text('OROPHAR 2.0 • fotografia do produto', 'OROPHAR 2.0 • product photograph');
      }
    });
  }
  const form = document.querySelector('#contact-form');
  const intent = form.elements.intent;
  document.querySelectorAll('[data-intent]').forEach(link => link.addEventListener('click', () => { intent.value = link.dataset.intent; }));
  document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {
    const wasSelected = button.getAttribute('aria-pressed') === 'true';
    document.querySelectorAll('[data-size]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', String(!wasSelected));
    form.elements.size.value = wasSelected ? '' : `${button.dataset.size} mm`;
    document.querySelector('#size-feedback').textContent = wasSelected
      ? text('Nenhum tamanho selecionado.', 'No size selected.')
      : text(`Interesse em ${button.dataset.size} mm incluído na solicitação.`, `${button.dataset.size} mm interest added to your inquiry.`);
  }));
  const dialog = document.querySelector('#inquiry-dialog');
  const preview = document.querySelector('#inquiry-preview');
  let previousFocus;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const clean = key => String(fields.get(key) || '').trim();
    const interest = intent.options[intent.selectedIndex].textContent;
    const subject = `OROPHAR 2.0 | ${interest}`;
    const lines = [text('Olá, equipe Airway Insights Medical.', 'Hello, Airway Insights Medical team.'), '',
      `${text('Interesse', 'Interest')}: ${interest}`,
      `${text('Nome', 'Name')}: ${clean('name')}`,
      `Email: ${clean('email')}`,
      `${text('Instituição / empresa', 'Institution / company')}: ${clean('organization') || '—'}`,
      `${text('Região', 'Region')}: ${clean('region') || text('A informar', 'To be provided')}`,
      `${text('Quantidade estimada', 'Estimated quantity')}: ${clean('quantity') || text('A definir', 'To be discussed')}`,
      `${text('Tamanho de interesse', 'Size of interest')}: ${clean('size') || text('A definir', 'To be discussed')}`,
      '', clean('message')];
    const message = lines.join('\n');
    preview.value = message;
    document.querySelector('#send-email').href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    document.querySelector('#copy-status').textContent = text(`Se o aplicativo não abrir, copie a mensagem e envie para ${email}.`, `If your email application does not open, copy the message and send it to ${email}.`);
    previousFocus = document.activeElement;
    dialog.showModal();
  });
  document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => previousFocus?.focus());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  document.querySelector('#copy-message').addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(preview.value);
      status.textContent = text('Mensagem copiada. Cole no seu e-mail para enviar.', 'Message copied. Paste it into your email to send.');
    } catch {
      preview.focus(); preview.select();
      status.textContent = text('Mensagem selecionada. Use Ctrl+C ou a opção Copiar do seu dispositivo.', 'Message selected. Use Ctrl+C or your device’s Copy option.');
    }
  });

  // Melhorias: sombra do cabeçalho, link ativo e animação de entrada
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  if ('IntersectionObserver' in window) {
    const targets = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + entry.target.id));
    }), { rootMargin: '-35% 0px -60% 0px' });
    targets.forEach(t => spy.observe(t));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('js-reveal');
      const items = document.querySelectorAll('.section-heading, .feature, .spec-panel, .contact-form, .resource-row, .expert-layout, .research-strip, .distribution-inner, .faq-list details');
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
      items.forEach(el => { el.classList.add('reveal'); io.observe(el); });
    }
  }
})();
