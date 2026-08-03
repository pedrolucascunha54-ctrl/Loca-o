gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   SOCIAL PROOF POPUP — starts cycling once the Dor section
   comes into view, stops/hides if the user scrolls back above it
   ============================================================ */
(function socialToast() {
  const toast = document.getElementById("social-toast");
  const textEl = document.getElementById("social-toast-text");
  const trigger = document.getElementById("dor");
  if (!toast || !textEl || !trigger) return;

  const messages = [
    "São José do Rio Preto, SP — +1 moto alugada agora",
    "Campinas, SP — +1 motorista aprovado",
    "São Paulo, SP — +1 entregador voltou a trabalhar",
    "Ribeirão Preto, SP — +1 moto retirada hoje",
    "Bauru, SP — +1 motorista Uber Moto aprovado",
    "Araraquara, SP — +1 moto alugada agora"
  ];
  let index = 0;
  let timeoutId = null;
  let intervalId = null;

  function showToast() {
    textEl.textContent = messages[index % messages.length];
    index++;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3000);
  }

  function start() {
    if (intervalId) return;
    timeoutId = setTimeout(showToast, 2000);
    intervalId = setInterval(showToast, 14000);
  }

  function stop() {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
    intervalId = null;
    toast.classList.remove("visible");
  }

  ScrollTrigger.create({
    trigger: trigger,
    start: "top 80%",
    onEnter: start,
    onLeaveBack: stop
  });
})();

/* ============================================================
   WHATSAPP BUBBLE
   ============================================================ */
(function whatsappBubble() {
  const bubble = document.getElementById("whatsapp-bubble");
  const closeBtn = bubble ? bubble.querySelector(".whatsapp-bubble-close") : null;
  if (!bubble) return;

  const dismissed = sessionStorage.getItem("whatsappBubbleDismissed");
  if (dismissed) return;

  setTimeout(() => bubble.classList.add("visible"), 2500);

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      bubble.classList.remove("visible");
      sessionStorage.setItem("whatsappBubbleDismissed", "1");
    });
  }
})();

/* ============================================================
   PROMO BAR COUNTDOWN
   Persists the expiry in sessionStorage so a page refresh doesn't
   unfairly reset the clock — a new countdown only starts on a
   genuinely new browser session.
   ============================================================ */
(function promoCountdown() {
  const bar = document.getElementById("promo-bar");
  const timerEl = document.getElementById("promo-timer");
  const header = document.querySelector(".site-header");
  if (!bar || !timerEl) return;

  const DURATION = 10 * 60 * 1000;
  let expiry = parseInt(sessionStorage.getItem("promoExpiry"), 10);
  if (!expiry || Date.now() > expiry) {
    expiry = Date.now() + DURATION;
    sessionStorage.setItem("promoExpiry", expiry);
  }

  function tick() {
    const remaining = expiry - Date.now();
    if (remaining <= 0) {
      bar.classList.add("hidden");
      if (header) header.classList.add("no-promo");
      clearInterval(interval);
      return;
    }
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  tick();
  const interval = setInterval(tick, 1000);
})();

/* ============================================================
   CTA FINAL — URGENCY COUNTDOWN
   Mirrors the exact same expiry as the promo bar above (shared
   sessionStorage key), just displayed as days:hours:min:sec.
   ============================================================ */
(function urgencyCountdown() {
  const dEl = document.getElementById("t-days");
  const hEl = document.getElementById("t-hours");
  const mEl = document.getElementById("t-min");
  const sEl = document.getElementById("t-sec");
  if (!dEl) return;

  const deadline = parseInt(sessionStorage.getItem("promoExpiry"), 10) || Date.now();

  function tick() {
    const diff = Math.max(0, deadline - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const mins = Math.floor((diff / 60000) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    const pad = (n) => String(n).padStart(2, "0");
    dEl.textContent = pad(days);
    hEl.textContent = pad(hours);
    mEl.textContent = pad(mins);
    sEl.textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   LENIS SMOOTH SCROLL
   ============================================================ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ============================================================
   BACK TO TOP — logo (header) and the CTA final button
   ============================================================ */
document.querySelectorAll("#logo-top, #back-to-top").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    lenis.scrollTo(0, { duration: 1.4 });
  });
});

/* ============================================================
   LOADER
   ============================================================ */
(function () {
  const bar = document.getElementById("loader-bar-fill");
  const pct = document.getElementById("loader-percent");
  let p = 0;
  const t = setInterval(() => {
    p = Math.min(100, p + Math.random() * 18);
    bar.style.width = p + "%";
    pct.textContent = Math.floor(p) + "%";
    if (p >= 100) {
      clearInterval(t);
      setTimeout(() => {
        document.getElementById("loader").classList.add("loaded");
        playHeroIntro();
      }, 300);
    }
  }, 120);
})();

/* ============================================================
   LAZY-LOAD BACKGROUND VIDEOS
   Every video except the hero's ships with preload="none" and
   its real file on a data-src attribute, so nothing downloads
   until the section is actually about to be seen.
   ============================================================ */
(function lazyLoadVideos() {
  const videos = Array.from(document.querySelectorAll("video")).filter((v) =>
    v.querySelector("source[data-src]")
  );
  if (!videos.length) return;

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      const source = video.querySelector("source[data-src]");
      if (source) {
        source.src = source.dataset.src;
        source.removeAttribute("data-src");
        video.load();
        video.play().catch(() => {});
      }
      observer.unobserve(video);
    });
  }, { rootMargin: "150% 0px 150% 0px" });

  videos.forEach((video) => io.observe(video));
})();

/* ============================================================
   HEADER SCROLL STATE
   ============================================================ */
ScrollTrigger.create({
  start: 100,
  onUpdate: (self) => {
    document.querySelector(".site-header").classList.toggle("scrolled", self.scroll() > 80);
  }
});

/* ============================================================
   CURSOR GLOW
   ============================================================ */
const glow = document.getElementById("cursor-glow");
window.addEventListener("mousemove", (e) => {
  glow.classList.add("active");
  gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power3.out" });
});
document.addEventListener("mouseleave", () => glow.classList.remove("active"));

/* ============================================================
   SCROLL PROGRESS BAR — fills as the whole page scrolls
   ============================================================ */
(function scrollProgress() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.3,
    onUpdate: (self) => { bar.style.width = (self.progress * 100) + "%"; }
  });
})();

/* ============================================================
   BACKGROUND VIDEO PARALLAX — subtle zoom-out + drift per section,
   scrubbed to that section's own scroll range for a layered, tech feel
   ============================================================ */
(function videoParallax() {
  document.querySelectorAll(".bg-video").forEach((video) => {
    const section = video.closest("section");
    if (!section) return;
    gsap.fromTo(video,
      { scale: 1.18, yPercent: -4 },
      {
        scale: 1.0, yPercent: 4, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 }
      }
    );
  });
})();

/* ============================================================
   SECTION LABEL DECODE — terminal-style scramble reveal, once per label
   ============================================================ */
(function decodeLabels() {
  const CHARS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&";
  function scrambleReveal(el) {
    const finalText = el.textContent;
    const len = finalText.length;
    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1, duration: 0.7, ease: "power1.out",
      onUpdate: () => {
        const revealCount = Math.floor(proxy.p * len);
        let out = "";
        for (let i = 0; i < len; i++) {
          if (i < revealCount || finalText[i] === " " || finalText[i] === "/") out += finalText[i];
          else out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        el.textContent = out;
      },
      onComplete: () => { el.textContent = finalText; },
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
    });
  }
  document.querySelectorAll(".section-label").forEach(scrambleReveal);
})();

/* ============================================================
   HERO INTRO — word reveal
   ============================================================ */
function playHeroIntro() {
  gsap.to(".hero-heading .word", {
    y: "0%", duration: 1.1, stagger: 0.06, ease: "power4.out", delay: 0.1
  });
  gsap.from(".hero-tagline, .hero-actions, .hero-trust", {
    opacity: 0, y: 24, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.7
  });
}

/* ============================================================
   WORD-BY-WORD SCROLL REVEAL
   ============================================================ */
function splitIntoWords(el) {
  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((chunk) => {
        const piece = chunk.trim() === ""
          ? document.createTextNode(chunk)
          : (() => {
              const mask = document.createElement("span");
              mask.className = "word-mask";
              const inner = document.createElement("span");
              inner.className = "word-inner";
              inner.textContent = chunk;
              mask.appendChild(inner);
              return mask;
            })();
        el.insertBefore(piece, node);
      });
      el.removeChild(node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
      splitIntoWords(node);
    }
  });
}

function revealWords(el, opts = {}) {
  splitIntoWords(el);
  const words = el.querySelectorAll(".word-inner");
  gsap.set(words, { yPercent: 115 });
  gsap.to(words, {
    yPercent: 0,
    duration: 0.9,
    stagger: 0.03,
    ease: "power4.out",
    delay: opts.delay || 0,
    scrollTrigger: {
      trigger: opts.trigger || el,
      start: opts.start || "top 80%",
      toggleActions: "play none none reverse"
    }
  });
}

/* headings that reveal on their own scroll position */
gsap.utils.toArray(".reveal-heading").forEach((el) => revealWords(el, { start: "top 78%" }));

/* ============================================================
   COUNTER ANIMATIONS
   ============================================================ */
document.querySelectorAll(".stat-number").forEach((el) => {
  const target = parseFloat(el.dataset.value);
  const decimals = parseInt(el.dataset.decimals || "0");
  gsap.fromTo(el, { textContent: 0 }, {
    textContent: target,
    duration: 1.8,
    ease: "power1.out",
    snap: { textContent: decimals === 0 ? 1 : 0.01 },
    onUpdate: function () {
      el.textContent = decimals === 0
        ? Math.round(el.textContent)
        : parseFloat(el.textContent).toFixed(decimals);
    },
    scrollTrigger: { trigger: el.closest(".stat-row"), start: "top 75%", toggleActions: "play none none reverse" }
  });
});

/* ============================================================
   SECTION REVEALS — Dor, Benefícios, Plano Fidelidade copy blocks
   ============================================================ */
gsap.from(".problem-lines", {
  y: 30, opacity: 0, duration: 1, ease: "power3.out",
  scrollTrigger: { trigger: ".problem-block", start: "top 60%", toggleActions: "play none none reverse" }
});

gsap.from(".benefits-carousel, .benefit-dots", {
  y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
  scrollTrigger: { trigger: ".benefits-carousel", start: "top 80%" }
});

/* ============================================================
   BENEFÍCIOS — click-driven carousel (arrows/dots), one card at a time
   ============================================================ */
(function benefitsCarousel() {
  const slides = document.querySelectorAll(".benefit-slide");
  const dots = document.querySelectorAll(".benefit-dot");
  const prevBtn = document.querySelector(".benefit-arrow--prev");
  const nextBtn = document.querySelector(".benefit-arrow--next");
  if (!slides.length) return;

  let current = 0;
  let autoplayId = null;

  function setActive(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle("active", idx === current));
    dots.forEach((dot, idx) => dot.classList.toggle("active", idx === current));
  }

  function next() { setActive(current + 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(next, 4500);
  }
  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { setActive(current - 1); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAutoplay(); });
  dots.forEach((dot, idx) => dot.addEventListener("click", () => { setActive(idx); startAutoplay(); }));

  const section = document.querySelector(".benefits-block");
  if (section) {
    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom top",
      onEnter: startAutoplay,
      onEnterBack: startAutoplay,
      onLeave: stopAutoplay,
      onLeaveBack: stopAutoplay
    });
  } else {
    startAutoplay();
  }
})();

gsap.from([".solution-body", ".solution-bullets li", ".solution-copy .btn", ".solution-copy .btn-whats-inline"], {
  y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out",
  scrollTrigger: { trigger: ".solution-block", start: "top 65%" }
});

/* plans stagger-in */
gsap.from(".plan-column", {
  y: 60, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
  scrollTrigger: { trigger: ".plans-row", start: "top 75%" }
});

/* testimonial carousel entrance */
gsap.from(".testimonial-carousel, .testimonial-dots", {
  y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out",
  scrollTrigger: { trigger: ".testimonial-carousel", start: "top 82%" }
});

/* ============================================================
   DEPOIMENTOS — click-driven carousel (arrows/dots), one card at a time
   ============================================================ */
(function testimonialCarousel() {
  const slides = document.querySelectorAll(".testimonial-slide");
  const dots = document.querySelectorAll(".testimonial-dot");
  const prevBtn = document.querySelector(".testimonial-arrow--prev");
  const nextBtn = document.querySelector(".testimonial-arrow--next");
  if (!slides.length) return;

  let current = 0;
  let autoplayId = null;

  function setActive(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle("active", idx === current));
    dots.forEach((dot, idx) => dot.classList.toggle("active", idx === current));
  }

  function next() { setActive(current + 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(next, 5000);
  }
  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { setActive(current - 1); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAutoplay(); });
  dots.forEach((dot, idx) => dot.addEventListener("click", () => { setActive(idx); startAutoplay(); }));

  const section = document.querySelector(".testimonials");
  if (section) {
    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom top",
      onEnter: startAutoplay,
      onEnterBack: startAutoplay,
      onLeave: stopAutoplay,
      onLeaveBack: stopAutoplay
    });
  } else {
    startAutoplay();
  }
})();

/* ============================================================
   HORIZONTAL MARQUEE — continuous infinite loop, independent of scroll
   ============================================================ */
document.querySelectorAll(".marquee-track").forEach((track) => {
  const halfWidth = track.scrollWidth / 2;
  gsap.to(track, {
    x: -halfWidth,
    duration: 22,
    ease: "none",
    repeat: -1
  });
});

/* ============================================================
   COMO FUNCIONA — pinned horizontal timeline
   ============================================================ */
(function horizontalTimeline() {
  const track = document.querySelector(".timeline-track");
  const section = document.querySelector(".how-it-works");
  if (!track || !section) return;

  function getScrollAmount() {
    return -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.1);
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
      gsap.set(track, { x: self.progress * getScrollAmount() });
    }
  });
})();

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      if (openItem !== item) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-answer").style.maxHeight = null;
      }
    });

    item.classList.toggle("open", !isOpen);
    answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
  });
});

/* refresh ScrollTrigger after all layout settles */
window.addEventListener("load", () => ScrollTrigger.refresh());

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
