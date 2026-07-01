// ============ Premium Studio — interactions ============

document.getElementById('year').textContent = new Date().getFullYear();

/* ---- custom cursor ---- */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
});

function animateRing(){
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .mini-card, .bento-card, .review-card, .team-card, summary').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
});

/* ---- nav scroll state ---- */
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progressBar');

function onScroll(){
  nav.classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
}
window.addEventListener('scroll', onScroll);
onScroll();

/* ---- mobile burger menu ---- */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navLinks.style.display = open ? 'flex' : '';
  if(open){
    navLinks.style.position = 'fixed';
    navLinks.style.top = '70px';
    navLinks.style.left = '20px';
    navLinks.style.right = '20px';
    navLinks.style.background = 'rgba(13,13,19,.98)';
    navLinks.style.border = '1px solid rgba(255,255,255,.08)';
    navLinks.style.borderRadius = '16px';
    navLinks.style.padding = '20px';
    navLinks.style.flexDirection = 'column';
    navLinks.style.gap = '18px';
  }
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navLinks.style.display = '';
}));

/* ---- scroll reveal ---- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => io.observe(el));

/* ---- animated stat counters ---- */
const statEls = document.querySelectorAll('.stat-num');
const statIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if(progress < 1){ requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
}, { threshold: 0.5 });
statEls.forEach(el => statIO.observe(el));

/* ---- process timeline scroll-linked fill ---- */
const timelineEl = document.querySelector('.timeline');
const timelineFill = document.getElementById('timelineFill');
const timelineItems = document.querySelectorAll('.timeline-item');

function updateTimeline(){
  if(!timelineEl || !timelineFill) return;
  const rect = timelineEl.getBoundingClientRect();
  const triggerY = window.innerHeight * 0.62;
  let filled = triggerY - rect.top;
  filled = Math.max(0, Math.min(filled, rect.height));
  timelineFill.style.height = filled + 'px';

  timelineItems.forEach(item => {
    const num = item.querySelector('.timeline-num');
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.top + itemRect.height / 2;
    num.classList.toggle('filled', itemCenter <= triggerY);
  });
}
window.addEventListener('scroll', updateTimeline, { passive: true });
window.addEventListener('resize', updateTimeline);
updateTimeline();

/* ---- contact modal ---- */
const contactModal = document.getElementById('contactModal');
const modalClose = document.getElementById('modalClose');

function openContactModal(){
  contactModal.classList.add('open');
  document.body.classList.add('no-scroll');
}
function closeContactModal(){
  contactModal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}
document.querySelectorAll('.js-open-contact').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });
});
modalClose.addEventListener('click', closeContactModal);
contactModal.addEventListener('click', (e) => {
  if(e.target === contactModal) closeContactModal();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && contactModal.classList.contains('open')) closeContactModal();
});

/* ---- magnetic buttons ---- */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ---- contact form: sends the lead to Telegram via /api/telegram ---- */
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  const label = btn.querySelector('.btn-text');
  const original = label.textContent;
  btn.disabled = true;
  label.textContent = 'Изпращане…';

  const payload = {
    name: contactForm.name.value,
    business: contactForm.business.value,
    email: contactForm.email.value,
    phone: contactForm.phone.value,
    message: contactForm.message.value,
  };

  let success = false;
  try {
    const res = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if(!res.ok) throw new Error('request failed');
    label.textContent = 'Изпратено ✓ Ще се свържем с вас скоро';
    success = true;
  } catch (err) {
    label.textContent = 'Грешка — опитайте отново';
  }

  setTimeout(() => {
    label.textContent = original;
    btn.disabled = false;
    if(success){
      contactForm.reset();
      closeContactModal();
    }
  }, 2600);
});
