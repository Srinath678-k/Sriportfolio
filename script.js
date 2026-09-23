/**
 * ============================================================================
 * CINEMATIC 3D SCROLL-DRIVEN PORTFOLIO - JAVASCRIPT ENGINE
 * Author: Srinath K (Web Developer & Content Creator)
 * Technologies: Vanilla JS, GSAP 3.12, ScrollTrigger, CSS 3D Transforms
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. THEME CONTROLLER (GOLD / RED ACCENT) WITH LOCALSTORAGE PERSISTENCE
  // --------------------------------------------------------------------------
  const themeDots = document.querySelectorAll('.theme-dot');
  const THEME_STORAGE_KEY = 'srinath_portfolio_theme';

  /**
   * Applies the requested theme and persists in localStorage
   * @param {string} theme - 'gold' or 'red'
   */
  function setTheme(theme) {
    const validTheme = theme === 'red' ? 'red' : 'gold';
    document.documentElement.setAttribute('data-theme', validTheme);

    // Update active state on dots
    themeDots.forEach((dot) => {
      const isSelected = dot.getAttribute('data-set-theme') === validTheme;
      dot.classList.toggle('active', isSelected);
      dot.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    // Save choice in localStorage safely inside try/catch block
    try {
      localStorage.setItem(THEME_STORAGE_KEY, validTheme);
    } catch (err) {
      console.warn('LocalStorage is not available to save theme preference:', err);
    }
  }

  // Initialize theme from localStorage or default to gold
  (function initTheme() {
    let savedTheme = 'gold';
    try {
      savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'gold';
    } catch (err) {
      console.warn('LocalStorage inaccessible, using default gold theme:', err);
    }
    setTheme(savedTheme);

    // Attach click listeners to theme switchers
    themeDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const selected = dot.getAttribute('data-set-theme');
        setTheme(selected);
      });
    });
  })();


  // --------------------------------------------------------------------------
  // 2. SCROLL PROGRESS BAR CONTROLLER
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scroll-progress');
  const header = document.getElementById('site-header');

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
      progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    }

    // Toggle header glass background style when scrolled
    if (header) {
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();


  // --------------------------------------------------------------------------
  // 3. DESKTOP CURSOR GLOW FOLLOWER
  // --------------------------------------------------------------------------
  const cursorGlow = document.getElementById('cursor-glow');
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursorGlow && isFinePointer) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Smooth cursor trail physics with requestAnimationFrame
    function animateCursor() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }


  // --------------------------------------------------------------------------
  // 4. MOBILE HAMBURGER MENU OVERLAY
  // --------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu(forceClose = false) {
    if (!hamburgerBtn || !mobileMenuOverlay) return;

    const shouldOpen = forceClose ? false : !hamburgerBtn.classList.contains('active');

    hamburgerBtn.classList.toggle('active', shouldOpen);
    hamburgerBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    mobileMenuOverlay.classList.toggle('active', shouldOpen);
    mobileMenuOverlay.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    document.body.classList.toggle('menu-open', shouldOpen);
  }

  if (hamburgerBtn && mobileMenuOverlay) {
    hamburgerBtn.addEventListener('click', () => toggleMobileMenu());

    // Close when clicking mobile nav links
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(true));
    });

    // Close when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburgerBtn.classList.contains('active')) {
        toggleMobileMenu(true);
        hamburgerBtn.focus();
      }
    });

    // Close when clicking backdrop area
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay || e.target.classList.contains('mobile-menu-backdrop')) {
        toggleMobileMenu(true);
      }
    });
  }


  // --------------------------------------------------------------------------
  // 5. ACTIVE NAV LINK HIGHLIGHT WITH INTERSECTION OBSERVER
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');

          // Highlight desktop nav links
          desktopNavLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });

          // Highlight mobile menu links
          mobileNavLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }


  // --------------------------------------------------------------------------
  // 6. CONTACT FORM VALIDATION & MAILTO ACTION TRIGGER
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const formStatus = document.getElementById('form-status');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Reset errors
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (messageError) messageError.textContent = '';
      if (formStatus) {
        formStatus.className = 'form-status-alert';
        formStatus.textContent = '';
      }

      let isValid = true;
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      // Validate Name
      if (!name) {
        if (nameError) nameError.textContent = 'Please enter your name.';
        isValid = false;
      }

      // Validate Email
      if (!email) {
        if (emailError) emailError.textContent = 'Please enter your email address.';
        isValid = false;
      } else if (!validateEmail(email)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      // Validate Message
      if (!message) {
        if (messageError) messageError.textContent = 'Please enter your message.';
        isValid = false;
      }

      if (!isValid) return;

      // Construct mailto link
      const recipient = 'ksrinath14307@gmail.com';
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(
        `Hi Srinath,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from srinath-portfolio`
      );
      const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

      // Update Aria-live status
      if (formStatus) {
        formStatus.className = 'form-status-alert success';
        formStatus.textContent = 'Opening your email client to send message to ksrinath14307@gmail.com...';
      }

      // Trigger mail client
      setTimeout(() => {
        window.location.href = mailtoUrl;
        contactForm.reset();
      }, 400);
    });
  }


  // --------------------------------------------------------------------------
  // 7. DESKTOP 3D MOUSE TILT INTERACTION
  // --------------------------------------------------------------------------
  const heroCard = document.getElementById('hero-photo-card');
  const tiltElements = document.querySelectorAll('.tilt-interactive');

  if (isFinePointer && window.innerWidth >= 1024) {
    // Hero photo card 3D tilt tracking
    if (heroCard) {
      const cardStage = document.getElementById('hero-3d-stage');
      if (cardStage) {
        cardStage.addEventListener('mousemove', (e) => {
          const rect = cardStage.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -14;
          const rotateY = ((x - centerX) / centerX) * 14;

          heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        cardStage.addEventListener('mouseleave', () => {
          heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          heroCard.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        cardStage.addEventListener('mouseenter', () => {
          heroCard.style.transition = 'none';
        });
      }
    }

    // Project preview browser mockups tilt tracking
    tiltElements.forEach((container) => {
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotX = ((y - centerY) / centerY) * -8;
        const rotY = ((x - centerX) / centerX) * 8;

        const img = container.querySelector('.project-preview-img');
        if (img) {
          img.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
        }
      });

      container.addEventListener('mouseleave', () => {
        const img = container.querySelector('.project-preview-img');
        if (img) {
          img.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        }
      });
    });
  }


  // --------------------------------------------------------------------------
  // 8. GSAP 3.12 & SCROLLTRIGGER 3D ANIMATION ENGINE
  // --------------------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Graceful degradation safeguard if GSAP is unavailable or reduced motion is requested
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
    console.info('GSAP not loaded or prefers-reduced-motion active: Running standard layout mode.');
    // Ensure all elements remain completely visible and active
    document.querySelectorAll('.headline-line, .hero-bio, .hero-cta-group, .hero-roles-bar, .hero-photo-card, .section-3d, .timeline-line-fill').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const timelineFill = document.getElementById('timeline-line-fill');
    if (timelineFill) timelineFill.style.transform = 'scaleY(1)';
    return;
  }

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Configure matchMedia for responsive animations
  const mm = gsap.matchMedia();

  // Desktop, Tablet, and Mobile animation setups
  mm.add({
    isWide: '(min-width: 1025px)',
    isTablet: '(min-width: 769px) and (max-width: 1024px)',
    isMobile: '(min-width: 421px) and (max-width: 768px)',
    isSmallMobile: '(max-width: 420px)'
  }, (context) => {
    const { isWide, isTablet, isMobile, isSmallMobile } = context.conditions;
    const isDesktop = isWide || isTablet;

    // ------------------------------------------------------------------------
    // ANIMATION 1: HERO OPENING SEQUENCE ON PAGE LOAD
    // ------------------------------------------------------------------------
    const heroTl = gsap.timeline({
      defaults: { ease: 'power4.out', duration: 1.1 }
    });

    // 1. Reveal headline lines from masked wrapper
    heroTl.from('.headline-line', {
      yPercent: 125,
      rotateX: -20,
      stagger: 0.16,
      duration: 1.2,
      ease: 'power4.out'
    });

    // 2. Fade in badge, bio, CTA buttons, and roles bar
    heroTl.from('.hero-badge-pill', {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, '-=0.9');

    heroTl.from('.hero-bio', {
      y: 25,
      opacity: 0,
      duration: 0.9
    }, '-=0.7');

    heroTl.from('.hero-cta-group .btn', {
      y: 20,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8
    }, '-=0.7');

    heroTl.from('.hero-roles-bar', {
      opacity: 0,
      y: 15,
      duration: 0.8
    }, '-=0.6');

    // 3. Hero 3D Photo Card swing-in on vertical axis + spotlight beam
    heroTl.from('#hero-photo-card', {
      rotateY: isDesktop ? -40 : -20,
      scale: 0.85,
      opacity: 0,
      duration: 1.4,
      transformOrigin: 'center center',
      ease: 'power3.out'
    }, '-=1.2');

    heroTl.from('.hero-spotlight-beam', {
      opacity: 0,
      scale: 0.6,
      duration: 1.6,
      ease: 'power2.out'
    }, '-=1.4');

    heroTl.from('.floating-badge', {
      scale: 0,
      opacity: 0,
      stagger: 0.18,
      duration: 0.7,
      ease: 'back.out(1.7)'
    }, '-=0.8');

    // ------------------------------------------------------------------------
    // ANIMATION 2: HERO EXIT CAMERA-PULLBACK SCROLL ANIMATION
    // ------------------------------------------------------------------------
    // As user scrolls down, hero tilts back (rotateX), moves away (translateZ), and fades
    gsap.to('.hero-container', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2
      },
      rotateX: isDesktop ? -16 : -8,
      translateZ: isDesktop ? -300 : -140,
      yPercent: isDesktop ? -12 : -6,
      opacity: 0,
      transformPerspective: 1200,
      transformOrigin: '50% 50%',
      ease: 'none'
    });


    // ------------------------------------------------------------------------
    // ANIMATION 3: GHOST WORDS HORIZONTAL PARALLAX DRIFT
    // ------------------------------------------------------------------------
    // The giant outlined words drift smoothly sideways across the viewport
    const ghostWords = [
      { selector: '.ghost-hero', startX: 0, endX: -120 },
      { selector: '.ghost-about', startX: 80, endX: -140 },
      { selector: '.ghost-skills', startX: -100, endX: 120 },
      { selector: '.ghost-work', startX: 120, endX: -100 },
      { selector: '.ghost-create', startX: -90, endX: 110 },
      { selector: '.ghost-learn', startX: 100, endX: -120 },
      { selector: '.ghost-contact', startX: -80, endX: 80 }
    ];

    ghostWords.forEach((item) => {
      const el = document.querySelector(item.selector);
      if (el) {
        const parentSection = el.closest('section');
        gsap.fromTo(el,
          { x: item.startX },
          {
            x: item.endX,
            scrollTrigger: {
              trigger: parentSection || el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5
            },
            ease: 'none'
          }
        );
      }
    });


    // ------------------------------------------------------------------------
    // ANIMATION 4: SECTION 3D FLY-IN DEPTH TRANSITIONS
    // ------------------------------------------------------------------------
    // Every section flies in from depth (rotateX ~18deg, translateZ ~ -260px,
    // translateY, opacity) settling flat with scrub, then drifts back slightly when leaving.
    const animatedSections = document.querySelectorAll('.section-3d');

    animatedSections.forEach((section, index) => {
      const isLastSection = index === animatedSections.length - 1;
      const rotateAmount = isDesktop ? 18 : 9;
      const depthAmount = isDesktop ? -260 : -100;
      const yOffset = isDesktop ? 90 : 45;

      // Section Fly-In from Depth
      gsap.fromTo(section,
        {
          rotateX: rotateAmount,
          translateZ: depthAmount,
          y: yOffset,
          opacity: 0.15,
          transformPerspective: 1200,
          transformOrigin: '50% 0%'
        },
        {
          rotateX: 0,
          translateZ: 0,
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            end: 'top 35%',
            scrub: 1.2
          },
          ease: 'power2.out'
        }
      );

      // Section Exit Drift Back (Only for non-last sections)
      if (!isLastSection) {
        gsap.to(section, {
          scrollTrigger: {
            trigger: section,
            start: 'bottom 40%',
            end: 'bottom top',
            scrub: 1.2
          },
          rotateX: isDesktop ? -8 : -4,
          translateZ: isDesktop ? -120 : -50,
          opacity: 0.4,
          transformPerspective: 1200,
          transformOrigin: '50% 100%',
          ease: 'power1.in'
        });
      }
    });


    // ------------------------------------------------------------------------
    // ANIMATION 5: SKILLS 3D CARDS SWING-IN ON VERTICAL AXIS
    // ------------------------------------------------------------------------
    const skillCards = document.querySelectorAll('.skill-card-3d-wrap');
    if (skillCards.length > 0) {
      gsap.from(skillCards, {
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        rotateY: (idx) => (idx % 2 === 0 ? (isDesktop ? -35 : -18) : (isDesktop ? 35 : 18)),
        y: 60,
        opacity: 0,
        stagger: 0.18,
        duration: 1.1,
        ease: 'power3.out',
        transformPerspective: 1000
      });
    }


    // ------------------------------------------------------------------------
    // ANIMATION 6: PROJECT CARDS 3D TURN TOWARD VIEWER
    // ------------------------------------------------------------------------
    // Alternating project cards turn toward viewer
    const projectLeft = document.querySelector('.project-card-left');
    const projectRight = document.querySelector('.project-card-right');

    if (projectLeft) {
      gsap.fromTo(projectLeft,
        {
          rotateY: isDesktop ? -18 : -8,
          translateZ: isDesktop ? -120 : -50,
          opacity: 0.2,
          transformPerspective: 1200
        },
        {
          rotateY: 0,
          translateZ: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: projectLeft,
            start: 'top 80%',
            end: 'top 40%',
            scrub: 1
          },
          ease: 'power2.out'
        }
      );
    }

    if (projectRight) {
      gsap.fromTo(projectRight,
        {
          rotateY: isDesktop ? 18 : 8,
          translateZ: isDesktop ? -120 : -50,
          opacity: 0.2,
          transformPerspective: 1200
        },
        {
          rotateY: 0,
          translateZ: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: projectRight,
            start: 'top 80%',
            end: 'top 40%',
            scrub: 1
          },
          ease: 'power2.out'
        }
      );
    }


    // ------------------------------------------------------------------------
    // ANIMATION 7: CREATOR REEL PHONE FRAMES 3D FAN OUT & SCROLL BACK
    // ------------------------------------------------------------------------
    // The three phone frames fan out when scrolled down and retract smoothly on scroll back
    const phone1 = document.getElementById('phone-frame-1');
    const phone2 = document.getElementById('phone-frame-2');
    const phone3 = document.getElementById('phone-frame-3');

    if (phone1 && phone2 && phone3) {
      const fanSpread = isWide ? 210 : isTablet ? 165 : isMobile ? 135 : 100;
      const fanRotZ = isWide ? 10 : isTablet ? 8 : isMobile ? 5 : 3;
      const fanRotY = isWide ? 12 : isTablet ? 10 : isMobile ? 6 : 4;
      const fanZ = isWide ? -20 : isTablet ? -15 : -10;

      const fanTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#creator-phones-stage',
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.2
        }
      });

      fanTl.fromTo(phone1,
        {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          rotateZ: 0,
          rotateY: 0,
          translateZ: 0,
          opacity: 0.3
        },
        {
          xPercent: -50,
          yPercent: -50,
          x: -fanSpread,
          rotateZ: -fanRotZ,
          rotateY: fanRotY,
          translateZ: fanZ,
          opacity: 1,
          ease: 'power2.out'
        }, 0
      );

      fanTl.fromTo(phone2,
        {
          xPercent: -50,
          yPercent: -50,
          scale: 0.92,
          translateZ: 0,
          opacity: 0.5
        },
        {
          xPercent: -50,
          yPercent: -50,
          scale: isWide ? 1.06 : isTablet ? 1.03 : 1.01,
          translateZ: isWide ? 40 : 20,
          opacity: 1,
          ease: 'power2.out'
        }, 0
      );

      fanTl.fromTo(phone3,
        {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          rotateZ: 0,
          rotateY: 0,
          translateZ: 0,
          opacity: 0.3
        },
        {
          xPercent: -50,
          yPercent: -50,
          x: fanSpread,
          rotateZ: fanRotZ,
          rotateY: -fanRotY,
          translateZ: fanZ,
          opacity: 1,
          ease: 'power2.out'
        }, 0
      );
    }


    // ------------------------------------------------------------------------
    // ANIMATION 8: "SEE MORE ON INSTAGRAM" BUTTON ENTRANCE & SCROLL BACK
    // ------------------------------------------------------------------------
    const creatorMoreAction = document.getElementById('creator-more-action');
    if (creatorMoreAction) {
      gsap.fromTo(creatorMoreAction,
        {
          y: 35,
          opacity: 0,
          scale: 0.94
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#creator-more-action',
            start: 'top 92%',
            end: 'top 75%',
            scrub: 1.2
          }
        }
      );
    }


    // ------------------------------------------------------------------------
    // ANIMATION 9: TIMELINE LASER PROGRESS & MILESTONES REVEAL
    // ------------------------------------------------------------------------
    // The laser timeline draws downward with scroll (scaleY scrub)
    const timelineFill = document.getElementById('timeline-line-fill');
    if (timelineFill) {
      gsap.fromTo(timelineFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: '.timeline-container',
            start: 'top 75%',
            end: 'bottom 60%',
            scrub: 1
          }
        }
      );
    }

    // Timeline milestone cards fade & slide in with stagger
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        x: isDesktop ? 40 : 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

  }); // End matchMedia


  // --------------------------------------------------------------------------
  // 9. SMOOTH SCROLL FOR ALL ANCHOR LINKS (INCLUDING BACK TO TOP)
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });


  // --------------------------------------------------------------------------
  // 10. HERO FLOATING PARTICLES CANVAS
  // --------------------------------------------------------------------------
  (function initHeroParticles() {
    const canvas = document.getElementById('particle-canvas');
    const heroSection = document.getElementById('hero');
    if (!canvas || !heroSection) return;

    // Skip particles on mobile screens under 480px width
    if (window.innerWidth < 480) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId = null;
    let isVisible = false;
    let particles = [];
    const particleCount = 30; // 28-35 soft gold dots

    // Cap devicePixelRatio at 1.5 max for optimal performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resizeCanvas() {
      const rect = heroSection.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    function createParticles() {
      particles = [];
      const w = canvas.width;
      const h = canvas.height;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: (Math.random() * 1.8 + 0.8) * dpr,
          alpha: Math.random() * 0.45 + 0.15,
          speedY: (Math.random() * 0.4 + 0.15) * dpr,
          speedX: (Math.random() * 0.3 - 0.15) * dpr
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Drift slowly upward & sideways
        p.y -= p.speedY;
        p.x += p.speedX;

        // Wrap around canvas boundaries
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`;
        ctx.fill();
      }
    }

    function renderLoop() {
      if (!isVisible) return;
      drawParticles();
      animFrameId = requestAnimationFrame(renderLoop);
    }

    function startAnimation() {
      if (!animFrameId && isVisible) {
        animFrameId = requestAnimationFrame(renderLoop);
      }
    }

    function stopAnimation() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }

    // Pause animation when hero is scrolled out of view using IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      }, { threshold: 0.05 });

      observer.observe(heroSection);
    } else {
      isVisible = true;
      startAnimation();
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth < 480) {
        stopAnimation();
        return;
      }
      resizeCanvas();
      createParticles();
    }, { passive: true });

    resizeCanvas();
    createParticles();
  })();


  // --------------------------------------------------------------------------
  // 11. VIDEO / REEL LIGHTBOX MODAL CONTROLLER
  // --------------------------------------------------------------------------
  (function initMediaModal() {
    const modal = document.getElementById('media-modal');
    if (!modal) return;

    const modalTitle = document.getElementById('media-modal-title');
    const modalMediaContainer = modal.querySelector('.cinematic-modal__media');
    const modalTagsContainer = modal.querySelector('.cinematic-modal__tags');
    const modalNotes = modal.querySelector('.cinematic-modal__notes');
    const modalLink = modal.querySelector('.cinematic-modal__link');
    const closeBtns = modal.querySelectorAll('[data-modal-close]');
    const mainContent = document.getElementById('main-content');

    let triggerElement = null;

    function openModal(card) {
      triggerElement = card;
      const title = card.getAttribute('data-title') || 'Featured Edit';
      const software = card.getAttribute('data-software') || '';
      const notes = card.getAttribute('data-notes') || '[add edit notes here]';
      const thumb = card.getAttribute('data-thumb') || '';
      const instagramUrl = card.getAttribute('href') || '#';

      // Populate Title
      if (modalTitle) modalTitle.textContent = title;

      // Populate Image Thumbnail
      if (modalMediaContainer) {
        modalMediaContainer.innerHTML = '';
        if (thumb) {
          const img = document.createElement('img');
          img.src = thumb;
          img.alt = title;
          img.loading = 'eager';
          modalMediaContainer.appendChild(img);
        }
      }

      // Populate Software Tags
      if (modalTagsContainer) {
        modalTagsContainer.innerHTML = '';
        if (software) {
          const tags = software.split(',').map((t) => t.trim());
          tags.forEach((tagText) => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'cinematic-modal__tag';
            tagSpan.textContent = tagText;
            modalTagsContainer.appendChild(tagSpan);
          });
        }
      }

      // Populate Notes
      if (modalNotes) modalNotes.textContent = notes;

      // Populate Instagram Link
      if (modalLink) {
        modalLink.href = instagramUrl;
      }

      // Open State & Accessibility
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      if (mainContent) mainContent.setAttribute('inert', 'true');
      document.body.style.overflow = 'hidden';

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (window.gsap && !prefersReducedMotion) {
        gsap.fromTo(modal.querySelector('.cinematic-modal__panel'),
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
        );
      }

      // Set focus inside modal
      const closeButton = modal.querySelector('.cinematic-modal__close');
      if (closeButton) closeButton.focus();
    }

    function closeModal() {
      if (!modal.classList.contains('is-open')) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function finalizeClose() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (mainContent) mainContent.removeAttribute('inert');
        document.body.style.overflow = '';

        if (triggerElement) {
          triggerElement.focus();
          triggerElement = null;
        }
      }

      if (window.gsap && !prefersReducedMotion) {
        gsap.to(modal.querySelector('.cinematic-modal__panel'), {
          opacity: 0,
          scale: 0.92,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: finalizeClose
        });
      } else {
        finalizeClose();
      }
    }

    // Attach click triggers to phone frame cards
    const phoneCards = document.querySelectorAll('.phone-frame-3d');
    phoneCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(card);
      });
    });

    // Close on backdrop & close button click
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Focus trap inside modal
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    });
  })();

})();
