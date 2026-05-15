/* =============================================
   SUNSET COAST LOFT & ROOFTOP — Main Scripts
   ============================================= */

(function () {
  'use strict';

  // ── Navbar: transparent → dark on scroll ──
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      if (
        scrollPos >= section.offsetTop &&
        scrollPos < section.offsetTop + section.offsetHeight
      ) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + section.id);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ── Hamburger menu ──
  const hamburger = document.getElementById('hamburger');
  const navList = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on link click
  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── Scroll fade-in (IntersectionObserver) ──
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger sibling fade-ins within the same parent
            const siblings = entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)');
            siblings.forEach((el, idx) => {
              setTimeout(() => el.classList.add('visible'), idx * 100);
            });
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback for old browsers
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ── Gallery Lightbox ──
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightbox-img');
  const lbCaption    = document.getElementById('lightbox-caption');
  const lbClose      = document.getElementById('lightbox-close');
  const lbPrev       = document.getElementById('lightbox-prev');
  const lbNext       = document.getElementById('lightbox-next');

  const images = Array.from(galleryItems).map(item => ({
    src:     item.querySelector('img').src,
    alt:     item.querySelector('img').alt,
    caption: item.querySelector('.gallery-overlay span').textContent,
  }));

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lbImg.src         = images[index].src;
    lbImg.alt         = images[index].alt;
    lbCaption.textContent = images[index].caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    galleryItems[currentIndex].focus();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lbImg.src             = images[currentIndex].src;
    lbImg.alt             = images[currentIndex].alt;
    lbCaption.textContent = images[currentIndex].caption;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lbImg.src             = images[currentIndex].src;
    lbImg.alt             = images[currentIndex].alt;
    lbCaption.textContent = images[currentIndex].caption;
  }

  galleryItems.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View photo: ${images[index].caption}`);

    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  // Close on backdrop click
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPrev();
    if (e.key === 'ArrowRight')  showNext();
  });

  // ── Google Calendar: show iframe once it loads ──
  const gcalIframe = document.getElementById('gcal-embed');
  const gcalNotice = document.getElementById('gcal-notice');

  if (gcalIframe) {
    // Only activate the iframe if a real src has been configured
    const realSrc = gcalIframe.getAttribute('data-src') || '';
    const isConfigured = realSrc && !realSrc.includes('sunsetcoastloft%40gmail.com') === false;

    if (isConfigured) {
      gcalIframe.src = realSrc;
      gcalIframe.addEventListener('load', () => {
        gcalIframe.classList.add('loaded');
        if (gcalNotice) gcalNotice.classList.add('hidden');
      });
    }
  }

  // ── Direct Booking Form ──
  const bookingForm = document.getElementById('booking-form');
  const formSuccess = document.getElementById('form-success');
  const formError   = document.getElementById('form-error');
  const dateError   = document.getElementById('date-error');
  const submitBtn   = document.getElementById('bf-submit');
  const successEmail = document.getElementById('success-email');

  if (bookingForm) {
    // Set min date to today on both date inputs
    const today = new Date().toISOString().split('T')[0];
    const checkinInput  = document.getElementById('bf-checkin');
    const checkoutInput = document.getElementById('bf-checkout');
    if (checkinInput)  checkinInput.min  = today;
    if (checkoutInput) checkoutInput.min = today;

    // Update checkout min when checkin changes
    checkinInput && checkinInput.addEventListener('change', () => {
      if (checkoutInput && checkinInput.value) {
        checkoutInput.min = checkinInput.value;
        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          checkoutInput.value = '';
        }
      }
    });

    bookingForm.addEventListener('submit', async e => {
      e.preventDefault();
      dateError.textContent = '';
      formError.textContent = '';

      // Validate dates
      const checkIn  = new Date(checkinInput.value);
      const checkOut = new Date(checkoutInput.value);
      if (!checkinInput.value || !checkoutInput.value) {
        dateError.textContent = 'Please select both check-in and check-out dates.';
        checkoutInput.focus();
        return;
      }
      if (checkOut <= checkIn) {
        dateError.textContent = 'Check-out must be after check-in.';
        checkoutInput.focus();
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      try {
        const res = await fetch(bookingForm.action, {
          method: 'POST',
          body: new FormData(bookingForm),
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          if (successEmail) successEmail.textContent = document.getElementById('bf-email').value;
          bookingForm.style.display = 'none';
          formSuccess.classList.add('visible');
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const data = await res.json().catch(() => ({}));
          formError.textContent = data.error ||
            'Something went wrong. Please try WhatsApp or email us directly.';
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }
      } catch {
        formError.textContent = 'Network error — please check your connection and try again.';
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
      }
    });
  }

})();
