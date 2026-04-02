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

  const subtitleText = "Cinisello Balsamo · Aperto dalle 16:00 · 10–20€";
  const subtitleEl = document.getElementById('hero-info-badge');
  let i = 0;
  function typeText() {
    if (i < subtitleText.length) {
      subtitleEl.innerHTML += subtitleText.charAt(i);
      i++;
      setTimeout(typeText, 60);
    }
  }
  setTimeout(typeText, 1000);

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
    const d = new Date(), day = d.getDay(), hr = d.getHours();
    let open = false;
    if (day >= 1 && day <= 4 && hr >= 6 && hr < 21) open = true;
    if (day === 5 && hr >= 6 && hr < 22) open = true;
    if (day === 6 && hr >= 16 && hr <= 23) open = true;

    const b = document.getElementById('open-badge'), t = document.getElementById('open-text');
    if (open) { b.className = 'status-badge open'; t.innerText = 'Aperto Ora'; }
    else { b.className = 'status-badge closed'; t.innerText = 'Chiuso Ora'; }
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
  const video = document.getElementById('scroll-video');
  if (video) {
    video.pause();
    video.currentTime = 0;

    const unlockVideo = () => {
      video.play().then(() => video.pause()).catch(() => { });
      document.removeEventListener('touchstart', unlockVideo);
    };
    document.addEventListener('touchstart', unlockVideo, { once: true });

    ScrollTrigger.create({
      trigger: '#apple-scroll',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true, // Maximally fluid: follows scroll without delay
      onUpdate: (self) => {
        if (video.readyState >= 2 && video.duration) {
          video.currentTime = self.progress * video.duration;
        }
      }
    });

    // Mobile/Network loads
    video.addEventListener('loadedmetadata', () => {
      ScrollTrigger.refresh();
    });
  }

  // Fluid text reveals synchronized with video - Optimized timings to appear 1s (~10-15% scroll) earlier
  gsap.to('.t1', { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.5, yoyo: true, repeat: 1, scrollTrigger: { trigger: '#apple-scroll', start: '5% top', end: '25% top', scrub: 1 } });
  gsap.to('.t2', { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.5, yoyo: true, repeat: 1, scrollTrigger: { trigger: '#apple-scroll', start: '35% top', end: '55% top', scrub: 1 } });
  gsap.to('.t3', { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.5, yoyo: true, repeat: 1, scrollTrigger: { trigger: '#apple-scroll', start: '65% top', end: '90% top', scrub: 1 } });

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
