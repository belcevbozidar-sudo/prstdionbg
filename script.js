// ============ Kinetix — interactions ============

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ---- custom cursor ---- */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

if (cursorDot && cursorRing) {
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
}

/* ---- nav scroll state ---- */
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progressBar');

function onScroll(){
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if (progressBar) progressBar.style.width = scrolled + '%';
}
window.addEventListener('scroll', onScroll);
onScroll();

/* ---- mobile burger menu ---- */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
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
}

/* ---- scroll reveal ---- */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length > 0) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* ---- animated stat counters ---- */
const statEls = document.querySelectorAll('.stat-num');
if (statEls.length > 0) {
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
}

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
    if (num) {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2;
      num.classList.toggle('filled', itemCenter <= triggerY);
    }
  });
}
if (timelineEl && timelineFill) {
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();
}

/* ---- contact modal ---- */
const contactModal = document.getElementById('contactModal');
const modalClose = document.getElementById('modalClose');

if (contactModal && modalClose) {
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
}

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
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn-text');
    const original = label.textContent;
    btn.disabled = true;
    btn.classList.add('btn-loading');

    const payload = {
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
      success = true;
    } catch (err) {
      btn.classList.remove('btn-loading');
      label.textContent = 'Грешка — опитайте отново';
      btn.disabled = false;
      setTimeout(() => {
        label.textContent = original;
      }, 3000);
    }

    if (success) {
      contactForm.reset();
      closeContactModal();
      window.location.href = '/thank-you';
    }
  });
}

/* ============ COOKIE CONSENT & META PIXEL ACTIVATION ============ */

function loadMetaPixel() {
  if (window.fbqInitialized) return;
  window.fbqInitialized = true;

  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  fbq('init', '2191550724962643');
  fbq('track', 'PageView');
  
  if (window.location.pathname.includes('thank-you')) {
    fbq('track', 'Contact');
    fbq('track', 'Lead');
  }
}

function initCookieConsent() {
  const consent = localStorage.getItem('cookieConsent');
  if (consent === 'accepted') {
    loadMetaPixel();
    return;
  }
  if (consent === 'declined') {
    return;
  }

  // Inject banner
  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-text" id="cookieText">
        Използваме бисквитки, за да подобрим вашето преживяване на нашия сайт. С посещението му се съгласявате с нашите условия.
      </div>
      <div class="cookie-banner-actions" id="cookieActions">
        <button class="btn btn-primary" id="cookieAccept" style="background: var(--grad); color: #0a0a0d;">Потвърждавам</button>
        <button class="btn btn-nav" id="cookieLearnMore">Научи повече</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  // Show banner with a slight delay
  setTimeout(() => {
    banner.classList.add('show');
    if (cursorRing) {
      banner.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
        btn.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
      });
    }
  }, 600);

  // Initial screen handlers
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 500);
    loadMetaPixel();
  });

  document.getElementById('cookieLearnMore').addEventListener('click', () => {
    // Show expanded view
    document.getElementById('cookieText').innerHTML = `
      Бисквитките ни помагат да анализираме трафика и да персонализираме рекламите. За повече информация прочетете нашата <a href="/privacy-policy">Политика за поверителност</a> и <a href="/cookie-policy">Политика за бисквитките</a>.
    `;
    document.getElementById('cookieActions').innerHTML = `
      <button class="btn btn-primary" id="cookieAcceptExpanded" style="background: var(--grad); color: #0a0a0d;">Потвърждавам</button>
      <button class="btn btn-nav" id="cookieDecline">Отказвам</button>
    `;

    // Re-attach handlers for new buttons
    document.getElementById('cookieAcceptExpanded').addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 500);
      loadMetaPixel();
    });

    document.getElementById('cookieDecline').addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined');
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 500);
    });

    // Add hover cursor styles for new buttons
    if (cursorRing) {
      document.getElementById('cookieActions').querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
        btn.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCookieConsent();
    initReviewModal();
  });
} else {
  initCookieConsent();
  initReviewModal();
}

/* ============ REVIEW MODAL LOGIC ============ */
function initReviewModal() {
  const reviewModal = document.getElementById('reviewModal');
  const openReviewBtns = document.querySelectorAll('.js-open-review');
  const closeReviewBtn = document.getElementById('reviewModalClose');
  const reviewForm = document.getElementById('reviewForm');
  const cursorRing = document.getElementById('cursorRing');

  if (openReviewBtns && reviewModal && closeReviewBtn) {
    openReviewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reviewModal.classList.add('show');
        document.body.classList.add('no-scroll');
      });
    });

    closeReviewBtn.addEventListener('click', () => {
      reviewModal.classList.remove('show');
      document.body.classList.remove('no-scroll');
    });

    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) {
        reviewModal.classList.remove('show');
        document.body.classList.remove('no-scroll');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && reviewModal.classList.contains('show')) {
        reviewModal.classList.remove('show');
        document.body.classList.remove('no-scroll');
      }
    });

    // Custom cursor hover listeners
    if (cursorRing) {
      openReviewBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
        btn.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
      });
      closeReviewBtn.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
      closeReviewBtn.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
      
      const ratingLabels = reviewForm.querySelectorAll('.star-rating label');
      ratingLabels.forEach(lbl => {
        lbl.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
        lbl.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
      });
    }
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText.textContent;

      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');

      const photoFile = document.getElementById('reviewPhoto').files[0];
      const name = document.getElementById('reviewNameInput').value;
      const role = document.getElementById('reviewRoleInput').value;
      const text = document.getElementById('reviewTextInput').value;
      const rating = reviewForm.querySelector('input[name="rating"]:checked').value;

      if (photoFile && photoFile.size > 3 * 1024 * 1024) {
        alert('Снимката е твърде голяма. Моля, изберете файл под 3 MB.');
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(photoFile);
      reader.onerror = () => {
        alert('Грешка при четене на снимката.');
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
      };
      
      reader.onload = async () => {
        const photoBase64 = reader.result;

        try {
          const res = await fetch('/api/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, text, rating, photo: photoBase64 })
          });

          if (res.ok) {
            alert('Благодарим ви! Вашият отзив беше изпратен успешно за преглед.');
            reviewForm.reset();
            reviewModal.classList.remove('show');
            document.body.classList.remove('no-scroll');
          } else {
            alert('Грешка при изпращането. Моля, опитайте отново.');
          }
        } catch (err) {
          alert('Грешка при връзката. Моля, опитайте отново.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-loading');
        }
      };
    });
  }
}

