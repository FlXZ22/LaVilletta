// 0. Preloader Logic
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('preloader').style.visibility = 'hidden';
      initApp();
    }, 800);
  }, 2000);
});

function initApp() {
  // 1. Lenis Smooth Scroll
  const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);

  let lenis;
  if (!isMobile) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // Fix: Force immediate scroll on first click for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      if (target === "#") return;
      if (lenis) {
        lenis.scrollTo(target);
      } else {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 2. GSAP Registrations
  gsap.registerPlugin(ScrollTrigger);

  // 3. Hero Particles
  if (window.innerWidth > 768) {
    tsParticles.load("tsparticles", {
      fpsLimit: 60,
      particles: {
        color: { value: "#C8860A" },
        links: { enable: false },
        move: { enable: true, speed: 1.5, direction: "top", random: true, outModes: "out" },
        number: { density: { enable: true, area: 800 }, value: 60 },
        opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 1 } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 4 } }
      }
    });
  }

  // 4. Hero Text Animations
  const title = document.getElementById('stagger-title');
  const titleInner = title.innerHTML;
  title.innerHTML = titleInner.split('').map(c => {
    if (c === '<') return '<'; // start of BR tag
    if (c === 'b' || c === 'r' || c === '>') return c; // rest of BR tag
    return `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`;
  }).join('');
  // Actually, split on words or handle HTML properly
  title.innerHTML = titleInner.replace(/([^\s<>]+)/g, '<span class="char-word">$1</span>');
  gsap.to('.hero-title .char-word', { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "back.out(1.5)" });

  const subtitleEl = document.getElementById('hero-info-badge');
  let heroBadgeTyped = false;

  function isVenueOpen(date = new Date()) {
    const schedules = {
      0: [{ start: 0, end: 2 * 60 }],
      1: [{ start: 6 * 60 + 30, end: 21 * 60 }],
      2: [{ start: 6 * 60 + 30, end: 21 * 60 }],
      3: [{ start: 6 * 60, end: 21 * 60 }],
      4: [{ start: 6 * 60 + 30, end: 21 * 60 }],
      5: [{ start: 6 * 60, end: 22 * 60 }],
      6: [{ start: 18 * 60, end: 24 * 60 }]
    };

    const day = date.getDay();
    const minutes = date.getHours() * 60 + date.getMinutes();
    return (schedules[day] || []).some(({ start, end }) => minutes >= start && minutes < end);
  }

  function getHeroBadgeText() {
    return `Cinisello Balsamo · ${isVenueOpen() ? 'Aperto ora' : 'Chiuso ora'} · 10–20€`;
  }

  function renderHeroBadge(typed = false) {
    if (!subtitleEl) return;

    const subtitleText = getHeroBadgeText();
    if (!typed) {
      subtitleEl.textContent = subtitleText;
      heroBadgeTyped = true;
      return;
    }

    subtitleEl.textContent = '';
    let i = 0;

    function typeText() {
      if (i < subtitleText.length) {
        subtitleEl.textContent += subtitleText.charAt(i);
        i++;
        setTimeout(typeText, 60);
      } else {
        heroBadgeTyped = true;
      }
    }

    typeText();
  }
  setTimeout(() => renderHeroBadge(true), 1000);

  // 5. Scroll Animations (Chi siamo, Gallery)
  gsap.to('.chi-text-block', {
    y: 0, opacity: 1, duration: 1,
    scrollTrigger: { trigger: '#chi-siamo', start: 'top 70%' }
  });

  gsap.to('.clip-reveal', {
    clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: 'power4.inOut',
    scrollTrigger: { trigger: '#gallery', start: 'top 80%' }
  });

  // 7. Menu Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabs = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // 8. Reviews Setup (Static now)

  // 9. Live Status Badge
  function checkOpen() {
    const open = isVenueOpen();

    const b = document.getElementById('open-badge');
    const t = document.getElementById('open-text');
    if (!b || !t) return;

    if (open) {
      b.className = 'status-badge open';
      t.innerText = 'Aperto Ora';
    } else {
      b.className = 'status-badge closed';
      t.innerText = 'Chiuso Ora';
    }

    if (heroBadgeTyped) {
      renderHeroBadge();
    }
  }
  checkOpen(); setInterval(checkOpen, 60000);

  // 10. Scroll To Top Button
  const stBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) stBtn.classList.add('visible');
    else stBtn.classList.remove('visible');
  });
  stBtn.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 11. Custom Vanilla Tilt Initialization for dynamically injected content
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  if (!isTouchDevice()) {
    VanillaTilt.init(document.querySelectorAll(".menu-card"), {
      max: 5,
      speed: 400
    });
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 8,
      speed: 400,
      perspective: 1000
    });
  }

  initScrubVideo();
}

// 11. Scroll Video scrubbing logic (formerly initThreeJS)
function initScrubVideo() {
  // --- Apple Scroll Video Sequence ---
  const section = document.getElementById('apple-scroll');
  const video = document.getElementById('scroll-video');
  if (!section || !video) {
    return;
  }

  const videoContainer = section.querySelector('.video-container');
  const copyShell = section.querySelector('.apple-copy-shell');
  const scenes = gsap.utils.toArray('#apple-scroll .apple-text');
  const mobileVideoQuery = window.matchMedia('(max-width: 767px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isMobileLayout = mobileVideoQuery.matches || isCoarsePointer;
  const sceneEnterY = isMobileLayout ? 10 : 38;
  const kickerEnterY = isMobileLayout ? 4 : 14;
  const lineEnterY = isMobileLayout ? 8 : 32;
  const lineExitY = isMobileLayout ? -8 : -18;
  const kickerExitY = isMobileLayout ? -4 : -10;
  const sceneExitY = isMobileLayout ? -10 : -24;
  let scrubTrigger;

  const buildScene = (timeline, scene, start, end) => {
    const kicker = scene.querySelector('.apple-kicker');
    const lines = scene.querySelectorAll('.apple-title-line');

    timeline
      .to(scene, { autoAlpha: 1, y: 0, scale: 1, duration: 0.08 }, start)
      .to(kicker, { autoAlpha: 1, y: 0, duration: 0.08 }, start + 0.02)
      .to(lines, { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.035 }, start + 0.04)
      .to(lines, { autoAlpha: 0, y: lineExitY, duration: 0.08, stagger: { each: 0.025, from: 'end' } }, end - 0.08)
      .to(kicker, { autoAlpha: 0, y: kickerExitY, duration: 0.07 }, end - 0.05)
      .to(scene, { autoAlpha: 0, y: sceneExitY, scale: isMobileLayout ? 1.005 : 1.01, duration: 0.08, ease: 'power2.in' }, end - 0.02);
  };

  const buildFinalScene = (timeline, scene, start) => {
    const kicker = scene.querySelector('.apple-kicker');
    const lines = scene.querySelectorAll('.apple-title-line');

    timeline
      .to(scene, { autoAlpha: 1, y: 0, scale: 1, duration: 0.09 }, start)
      .to(kicker, { autoAlpha: 1, y: 0, duration: 0.09 }, start + 0.02)
      .to(lines, { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.04 }, start + 0.05)
      .to(copyShell, { yPercent: isMobileLayout ? 0 : -8, duration: 0.18, ease: 'power2.out' }, start + 0.18);
  };

  const applyVideoSource = (preserveProgress = false) => {
    if (reducedMotionQuery.matches) {
      return;
    }

    const nextSrc = mobileVideoQuery.matches ? video.dataset.srcMobile : video.dataset.srcDesktop;
    if (!nextSrc || video.dataset.loadedSrc === nextSrc) {
      return;
    }

    const progressRatio = preserveProgress && video.duration ? video.currentTime / video.duration : 0;

    video.dataset.loadedSrc = nextSrc;
    video.src = nextSrc;
    video.load();

    if (progressRatio > 0) {
      const restoreTime = () => {
        if (video.duration) {
          video.currentTime = progressRatio * video.duration;
        }
        video.removeEventListener('loadedmetadata', restoreTime);
        ScrollTrigger.refresh();
      };

      video.addEventListener('loadedmetadata', restoreTime);
    }
  };

  if (reducedMotionQuery.matches) {
    section.classList.add('apple-scroll-static');
    video.removeAttribute('src');
    video.load();
    return;
  }

  section.classList.remove('apple-scroll-static');
  applyVideoSource();
  video.pause();
  video.currentTime = 0;

  const unlockVideo = () => {
    video.play().then(() => video.pause()).catch(() => { });
  };
  document.addEventListener('touchstart', unlockVideo, { once: true });

  gsap.set(section, { '--apple-focus-opacity': isMobileLayout ? 0.54 : 0.46 });
  gsap.set(videoContainer, { scale: isMobileLayout ? 1 : 1.02, yPercent: isMobileLayout ? 0 : 1 });
  gsap.set(copyShell, { yPercent: isMobileLayout ? 0 : -4 });
  gsap.set(scenes, { autoAlpha: 0, y: sceneEnterY, scale: 0.985 });
  gsap.set('#apple-scroll .apple-kicker', { autoAlpha: 0, y: kickerEnterY });
  gsap.set('#apple-scroll .apple-title-line', { autoAlpha: 0, y: lineEnterY });

  scrubTrigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      if (video.readyState >= 2 && video.duration) {
        video.currentTime = self.progress * video.duration;
      }
    }
  });

  video.addEventListener('loadedmetadata', () => {
    if (video.duration && scrubTrigger) {
      video.currentTime = scrubTrigger.progress * video.duration;
    }
    ScrollTrigger.refresh();
  });

  const motionTimeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.75
    }
  });

  motionTimeline
    .to(videoContainer, { scale: isMobileLayout ? 1 : 1.08, yPercent: isMobileLayout ? 0 : -3, duration: 1 }, 0)
    .to(copyShell, { yPercent: isMobileLayout ? 0 : -7, duration: 1 }, 0)
    .to(section, { '--apple-focus-opacity': isMobileLayout ? 0.62 : 0.54, duration: 0.28, ease: 'power2.out' }, 0.12);

  buildScene(motionTimeline, scenes[0], 0.06, 0.29);
  motionTimeline.to(section, { '--apple-focus-opacity': isMobileLayout ? 0.68 : 0.6, duration: 0.12, ease: 'power2.out' }, 0.37);
  buildScene(motionTimeline, scenes[1], 0.39, 0.63);
  motionTimeline.to(section, { '--apple-focus-opacity': isMobileLayout ? 0.6 : 0.5, duration: 0.14, ease: 'power2.out' }, 0.7);
  buildFinalScene(motionTimeline, scenes[2], 0.72);

  const handleVideoProfileChange = () => {
    applyVideoSource(true);
  };

  if (mobileVideoQuery.addEventListener) {
    mobileVideoQuery.addEventListener('change', handleVideoProfileChange);
  } else {
    mobileVideoQuery.addListener(handleVideoProfileChange);
  }

  // 12. Hero Slideshow
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 4000);
  }

  // Window Resize Listener (Empty now, can be removed)
  window.addEventListener('resize', () => {
    // No active Three.js renderers
  });
}
