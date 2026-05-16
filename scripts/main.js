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
    const isConfigured = realSrc && !realSrc.includes('GOOGLE_CALENDAR_EMBED_URL');

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


  // ── Language Toggle (EN / ES) ──
  const i18n = {
    en: {
      'nav-home': 'Home',
      'nav-about': 'About',
      'nav-options': 'Rental Options',
      'nav-gallery': 'Gallery',
      'nav-reviews': 'Reviews',
      'nav-book': 'Book Now',
      'hero-tagline': 'Where the Sunset Meets the Sea',
      'btn-airbnb': 'Book on Airbnb',
      'btn-whatsapp-hero': 'WhatsApp Us',
      'label-property': 'The Property',
      'about-h2': 'A Slice of Paradise in Aguadilla',
      'about-p1': "Perched in the serene neighborhood of Maleza Alta, Sunset Coast Loft & Rooftop offers breathtaking ocean views from its signature rooftop jacuzzi. Whether you're looking for a romantic getaway or a family adventure, our loft delivers luxury and comfort steps from Puerto Rico's most beloved beaches.",
      'about-p2': "Crash Boat Beach — famous for its crystal-clear turquoise water — is just 5 minutes away. Jobos Beach, a surfers' paradise, sits only 10 minutes from your door. Stroll to local restaurants and shops, or simply unwind by the pool with a cold drink in hand.",
      'host-name': 'Hosted by Jacqueline',
      'host-stats': '⭐ Superhost · 4.95★ · 112+ Reviews · 3+ years',
      'label-stay': 'Your Stay',
      'options-h2': 'Choose Your Space',
      'options-sub': 'Rent half the building for an intimate getaway, or take the whole place for the ultimate group retreat.',
      'badge-popular': 'Most Popular',
      'card-a-h3': 'Unit A or B — Half Building',
      'feat-a-bed': '🛏️ 2 Bedrooms',
      'feat-a-bath': '🛁 1 Bathroom',
      'feat-a-kitchen': '🍳 1 Full Kitchen',
      'feat-a-pool': '🏊 Shared Pool & Jacuzzi',
      'feat-a-guests': '👥 Up to 4 Guests',
      'btn-calendar': 'Check Our Calendar',
      'card-b-h3': 'Full Building — Exclusive Use',
      'feat-b-bed': '🛏️ 4 Bedrooms',
      'feat-b-bath': '🛁 2 Bathrooms',
      'feat-b-kitchen': '🍳 2 Full Kitchens',
      'feat-b-pool': '🏊 Private Pool & Rooftop Jacuzzi',
      'feat-b-guests': '👥 Up to 8 Guests',
      'label-space': 'The Space',
      'gallery-h2': 'Gallery',
      'gallery-sub': 'A glimpse into your next escape.',
      'overlay-jacuzzi': 'Rooftop Jacuzzi',
      'overlay-pool-night': 'Pool at Night',
      'overlay-living': 'Living Room',
      'overlay-kitchen': 'Kitchen',
      'overlay-pool-day': 'Pool & Gazebo',
      'label-included': "What's Included",
      'amenities-h2': 'Amenities',
      'amen-pool': 'Private Pool',
      'amen-jacuzzi': 'Rooftop Jacuzzi',
      'amen-kitchen': 'Full Kitchen (×2)',
      'amen-ac': 'Air Conditioning',
      'amen-wifi': 'High-Speed WiFi',
      'amen-tv': 'Smart TV',
      'amen-bbq': 'BBQ Grill',
      'amen-ocean': 'Ocean View',
      'amen-parking': 'Free Parking',
      'amen-dining': 'Outdoor Dining',
      'amen-hammock': 'Hammock',
      'amen-beach': 'Near Beach',
      'label-findus': 'Find Us',
      'location-h2': 'Prime Location in Aguadilla',
      'loc-1': '🏖️ <strong>5 min</strong> to Crash Boat Beach',
      'loc-2': '🌊 <strong>10 min</strong> to Jobos Beach',
      'loc-3': '🍽️ Restaurants & cafés on the main road',
      'loc-4': '🛒 Walkable to local stores',
      'loc-5': '✈️ Near Rafael Hernández Airport',
      'label-guestlove': 'Guest Love',
      'reviews-h2': 'What Our Guests Say',
      'label-ready': 'Ready to Stay?',
      'booking-h2': 'Reserve Your Stay',
      'booking-sub': 'Check live availability below — then book directly with us or through your preferred platform.',
      'avail-h3': 'Live Availability',
      'avail-note': 'Grey dates are already booked on Airbnb or Booking.com and update automatically.',
      'gcal-notice-text': 'Availability calendar connecting — check back shortly or contact us directly.',
      'btn-ask-whatsapp': 'Ask via WhatsApp',
      'form-h3': 'Book Directly with Us',
      'form-note': "Skip the platform fees — send us your dates and we'll confirm within the hour.",
      'label-name': 'Full Name *',
      'ph-name': 'Maria García',
      'label-email': 'Email *',
      'ph-email': 'you@example.com',
      'label-phone': 'Phone / WhatsApp',
      'label-guests': 'Number of Guests *',
      'opt-select': 'Select…',
      'opt-1': '1 guest', 'opt-2': '2 guests', 'opt-3': '3 guests', 'opt-4': '4 guests',
      'opt-5': '5 guests', 'opt-6': '6 guests', 'opt-7': '7 guests', 'opt-8': '8 guests',
      'label-checkin': 'Check-in Date *',
      'label-checkout': 'Check-out Date *',
      'label-unit': 'Unit Preference',
      'opt-flexible': 'Flexible',
      'opt-half': 'Half Unit (up to 4 guests)',
      'opt-full': 'Full Building (up to 8 guests)',
      'label-message': 'Special Requests or Questions',
      'ph-message': 'Early check-in, celebrations, accessibility needs…',
      'btn-send': 'Send Booking Request',
      'btn-sending': 'Sending…',
      'success-h4': 'Request Sent!',
      'success-p': 'We received your booking request and will get back to you at',
      'success-p2': 'within the hour. Check your inbox!',
      'quick-h3': 'Quick Contact',
      'quick-note': "Prefer to message us directly? We're available on WhatsApp every day.",
      'btn-whatsapp-contact': 'WhatsApp Us',
      'btn-airbnb-contact': 'Book on Airbnb',
      'respond-note': 'We respond within the hour, every day.',
      'also-on': 'Also available on',
      'link-airbnb': 'Airbnb',
      'footer-airbnb': 'Airbnb Listing',
    },
    es: {
      'nav-home': 'Inicio',
      'nav-about': 'Nosotros',
      'nav-options': 'Opciones de Renta',
      'nav-gallery': 'Galería',
      'nav-reviews': 'Reseñas',
      'nav-book': 'Reservar',
      'hero-tagline': 'Donde el Atardecer Se Une al Mar',
      'btn-airbnb': 'Reservar en Airbnb',
      'btn-whatsapp-hero': 'Escríbenos por WhatsApp',
      'label-property': 'La Propiedad',
      'about-h2': 'Un Rincón del Paraíso en Aguadilla',
      'about-p1': 'Ubicado en el tranquilo vecindario de Maleza Alta, Sunset Coast Loft & Rooftop ofrece impresionantes vistas al mar desde su icónico jacuzzi en la azotea. Ya sea que busques una escapada romántica o una aventura familiar, nuestro loft te brinda lujo y comodidad a pasos de las playas más hermosas de Puerto Rico.',
      'about-p2': 'La playa Crash Boat — famosa por sus aguas turquesas cristalinas — está a solo 5 minutos. La playa Jobos, paraíso de los surfistas, se encuentra a solo 10 minutos de tu puerta. Explora restaurantes y tiendas locales, o simplemente relájate junto a la piscina con una bebida fría en mano.',
      'host-name': 'Anfitriona: Jacqueline',
      'host-stats': '⭐ Superanfitriona · 4.95★ · 112+ Reseñas · 3+ años',
      'label-stay': 'Tu Estancia',
      'options-h2': 'Elige Tu Espacio',
      'options-sub': 'Renta la mitad del edificio para una escapada íntima, o toma todo el lugar para el retiro grupal definitivo.',
      'badge-popular': 'Más Popular',
      'card-a-h3': 'Unidad A o B — Medio Edificio',
      'feat-a-bed': '🛏️ 2 Habitaciones',
      'feat-a-bath': '🛁 1 Baño',
      'feat-a-kitchen': '🍳 1 Cocina Completa',
      'feat-a-pool': '🏊 Piscina y Jacuzzi Compartidos',
      'feat-a-guests': '👥 Hasta 4 Huéspedes',
      'btn-calendar': 'Ver Nuestro Calendario',
      'card-b-h3': 'Edificio Completo — Uso Exclusivo',
      'feat-b-bed': '🛏️ 4 Habitaciones',
      'feat-b-bath': '🛁 2 Baños',
      'feat-b-kitchen': '🍳 2 Cocinas Completas',
      'feat-b-pool': '🏊 Piscina Privada y Jacuzzi en Azotea',
      'feat-b-guests': '👥 Hasta 8 Huéspedes',
      'label-space': 'El Espacio',
      'gallery-h2': 'Galería',
      'gallery-sub': 'Un vistazo a tu próxima escapada.',
      'overlay-jacuzzi': 'Jacuzzi en Azotea',
      'overlay-pool-night': 'Piscina de Noche',
      'overlay-living': 'Sala de Estar',
      'overlay-kitchen': 'Cocina',
      'overlay-pool-day': 'Piscina y Gazebo',
      'label-included': 'Qué Incluye',
      'amenities-h2': 'Amenidades',
      'amen-pool': 'Piscina Privada',
      'amen-jacuzzi': 'Jacuzzi en Azotea',
      'amen-kitchen': 'Cocina Completa (×2)',
      'amen-ac': 'Aire Acondicionado',
      'amen-wifi': 'WiFi de Alta Velocidad',
      'amen-tv': 'Smart TV',
      'amen-bbq': 'Parrilla BBQ',
      'amen-ocean': 'Vista al Mar',
      'amen-parking': 'Estacionamiento Gratis',
      'amen-dining': 'Comedor al Aire Libre',
      'amen-hammock': 'Hamaca',
      'amen-beach': 'Cerca de la Playa',
      'label-findus': 'Encuéntranos',
      'location-h2': 'Ubicación Privilegiada en Aguadilla',
      'loc-1': '🏖️ <strong>5 min</strong> a la Playa Crash Boat',
      'loc-2': '🌊 <strong>10 min</strong> a la Playa Jobos',
      'loc-3': '🍽️ Restaurantes y cafés en la vía principal',
      'loc-4': '🛒 Tiendas locales a pie',
      'loc-5': '✈️ Cerca del Aeropuerto Rafael Hernández',
      'label-guestlove': 'Lo Que Dicen',
      'reviews-h2': 'Lo Que Dicen Nuestros Huéspedes',
      'label-ready': '¿Listo para Quedarte?',
      'booking-h2': 'Reserva Tu Estadía',
      'booking-sub': 'Consulta la disponibilidad en vivo — luego reserva directamente con nosotros o a través de tu plataforma preferida.',
      'avail-h3': 'Disponibilidad en Tiempo Real',
      'avail-note': 'Las fechas en gris ya están reservadas en Airbnb o Booking.com y se actualizan automáticamente.',
      'gcal-notice-text': 'El calendario de disponibilidad se está conectando — regresa pronto o contáctanos directamente.',
      'btn-ask-whatsapp': 'Preguntar por WhatsApp',
      'form-h3': 'Reserva Directamente con Nosotros',
      'form-note': 'Evita las comisiones de plataforma — envíanos tus fechas y confirmamos en menos de una hora.',
      'label-name': 'Nombre Completo *',
      'ph-name': 'María García',
      'label-email': 'Correo Electrónico *',
      'ph-email': 'tú@ejemplo.com',
      'label-phone': 'Teléfono / WhatsApp',
      'label-guests': 'Número de Huéspedes *',
      'opt-select': 'Seleccionar…',
      'opt-1': '1 huésped', 'opt-2': '2 huéspedes', 'opt-3': '3 huéspedes', 'opt-4': '4 huéspedes',
      'opt-5': '5 huéspedes', 'opt-6': '6 huéspedes', 'opt-7': '7 huéspedes', 'opt-8': '8 huéspedes',
      'label-checkin': 'Fecha de Entrada *',
      'label-checkout': 'Fecha de Salida *',
      'label-unit': 'Preferencia de Unidad',
      'opt-flexible': 'Flexible',
      'opt-half': 'Medio Edificio (hasta 4 huéspedes)',
      'opt-full': 'Edificio Completo (hasta 8 huéspedes)',
      'label-message': 'Solicitudes Especiales o Preguntas',
      'ph-message': 'Check-in temprano, celebraciones, necesidades de accesibilidad…',
      'btn-send': 'Enviar Solicitud de Reserva',
      'btn-sending': 'Enviando…',
      'success-h4': '¡Solicitud Enviada!',
      'success-p': 'Recibimos tu solicitud de reserva y te responderemos a',
      'success-p2': 'en menos de una hora. ¡Revisa tu correo!',
      'quick-h3': 'Contacto Rápido',
      'quick-note': '¿Prefieres escribirnos directamente? Estamos disponibles por WhatsApp todos los días.',
      'btn-whatsapp-contact': 'Escríbenos por WhatsApp',
      'btn-airbnb-contact': 'Reservar en Airbnb',
      'respond-note': 'Respondemos en menos de una hora, todos los días.',
      'also-on': 'También disponibles en',
      'link-airbnb': 'Airbnb',
      'footer-airbnb': 'Listado en Airbnb',
    },
  };

  function applyLanguage(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = i18n[lang][el.getAttribute('data-i18n')];
      if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = i18n[lang][el.getAttribute('data-i18n-html')];
      if (val !== undefined) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = i18n[lang][el.getAttribute('data-i18n-placeholder')];
      if (val !== undefined) el.placeholder = val;
    });

    // Update gallery lightbox aria-labels to match current captions
    galleryItems.forEach(item => {
      const caption = item.querySelector('.gallery-overlay span').textContent;
      item.setAttribute('aria-label', `View photo: ${caption}`);
    });

    // Highlight active language in toggle button
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.querySelector('.lang-en').classList.toggle('lang-active', lang === 'en');
      toggleBtn.querySelector('.lang-es').classList.toggle('lang-active', lang === 'es');
      toggleBtn.setAttribute('aria-label', lang === 'en' ? 'Switch to Spanish' : 'Switch to English');
    }

    localStorage.setItem('lang', lang);
  }

  let currentLang = localStorage.getItem('lang') || 'en';
  applyLanguage(currentLang);

  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'es' : 'en';
      applyLanguage(currentLang);
    });
  }

})();
