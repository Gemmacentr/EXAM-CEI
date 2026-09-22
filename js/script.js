"use strict";
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progressBar");
const Loader = document.getElementById("Loader");
const siteContent = document.getElementById("site-content");

function revealSite() {
  Loader.classList.add("hidden");
  siteContent.classList.add("visible");
  document.body.style.overflow = "auto";
  maybeShowCookieBanner();
}

function maybeShowCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;
  if (localStorage.getItem("cookieChoice")) return;
  setTimeout(() => banner.classList.add("visible"), 500);
}

document.getElementById("cookieAccept").addEventListener("click", () => {
  localStorage.setItem("cookieChoice", "accepted");
  document.getElementById("cookieBanner").classList.remove("visible");
});
document.getElementById("cookieDecline").addEventListener("click", () => {
  localStorage.setItem("cookieChoice", "declined");
  document.getElementById("cookieBanner").classList.remove("visible");
});

// ===== torna in cima =====
(function () {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  function update() {
    const show = window.scrollY > window.innerHeight * 0.6;
    btn.classList.toggle("visible", show);
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });
  update();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  const accentMap = { indigo: "--indigo", plum: "--plum", green: "--green", coral: "--coral" };
  const sections = document.querySelectorAll("[data-accent]");
  const navCenter = document.getElementById("navCenter");
  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const varName = accentMap[entry.target.dataset.accent];
            if (varName) {
              document.documentElement.style.setProperty("--btt-color", `var(${varName})`);
            }
            const key = entry.target.dataset.labelKey;
            if (navCenter && key) {
              navCenter.textContent = translate(key);
              navCenter.dataset.i18nActive = key;
            }
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }
})();

if (sessionStorage.getItem("loaded")) {
  revealSite();
} else {
  sessionStorage.setItem("loaded", "true");
  let progress = 0;
  const loading = setInterval(() => {
    progress += 4;
    if (progress > 100) progress = 100;
    counter.textContent = progress;
    progressBar.style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(loading);
      setTimeout(revealSite, 200);
    }
  }, 16);
}

const secondNav = document.querySelector(".Second-nav");
const navigationTrigger = document.querySelector(".Navigation-trigger");
navigationTrigger.addEventListener("click", () => {
  const willOpen = !secondNav.classList.contains("isOpen");
  secondNav.classList.toggle("isOpen");
  navigationTrigger.classList.toggle("isOpen");
  navigationTrigger.setAttribute("aria-expanded", String(willOpen));
});
document.querySelectorAll(".Second-nav .Nav-list a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    secondNav.classList.add("isClosing");
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth" });
      secondNav.classList.remove("isOpen");
      secondNav.classList.remove("isClosing");
      navigationTrigger.classList.remove("isOpen");
      navigationTrigger.setAttribute("aria-expanded", "false");
    }, 550);
  });
});

const Cursor = document.querySelector(".Cursor");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.addEventListener("mousemove", (e) => {
    Cursor.style.left = e.clientX + "px";
    Cursor.style.top = e.clientY + "px";
  });
}

// ===== canvas interattivo nella hero: griglia di punti con distorsione magnetica =====
(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const heroEl = canvas.closest(".hero");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const style = getComputedStyle(document.documentElement);
  const dotColor = style.getPropertyValue("--ink").trim() || "#17150F";

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, cols = 0, rows = 0, gap = 34;
  let points = [];
  let mouse = { x: -9999, y: -9999, active: false };

  function build() {
    const rect = heroEl.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / gap) + 1;
    rows = Math.ceil(h / gap) + 1;
    points = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        points.push({ x: i * gap, y: j * gap, ox: i * gap, oy: j * gap });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const radius = 120;
    for (const p of points) {
      let x = p.ox, y = p.oy;
      if (mouse.active) {
        const dx = p.ox - mouse.x, dy = p.oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
          const force = (1 - dist / radius) * 14;
          x += (dx / (dist || 1)) * force;
          y += (dy / (dist || 1)) * force;
        }
      }
      p.x += (x - p.x) * 0.18;
      p.y += (y - p.y) * 0.18;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = 0.16;
      ctx.fill();
    }
  }

  let raf = null;
  function loop() {
    draw();
    raf = requestAnimationFrame(loop);
  }

  build();
  if (reduceMotion) {
    draw();
  } else {
    loop();
    heroEl.addEventListener("mousemove", (e) => {
      const rect = heroEl.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    heroEl.addEventListener("mouseleave", () => { mouse.active = false; });
    window.addEventListener("resize", build);
  }
})();

// ===== badge con metriche di performance reali (Performance API) =====
window.addEventListener("load", () => {
  setTimeout(() => {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      const loadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : null;
      const badge = document.getElementById("perfBadge");
      if (badge && loadMs !== null) {
        badge.textContent = `caricata in ${loadMs}ms · ${resources.length} risorse · 0 framework runtime`;
      }
    } catch (e) { /* silenzioso: il badge è un bonus, non un requisito */ }
  }, 50);
});

// ===== traduzioni IT / EN / ES =====
const translations = {
  it: {
    "nav.percorso": "Percorso", "nav.stack": "Stack", "nav.progetti": "Progetti",
    "nav.passioni": "Passioni", "nav.contatti": "Contatti", "nav.cv": "CV",
    "hero.tag": "frontend developer · 5 anni di esperienza",
    "hero.role": "Scrivo frontend da 5 anni — Vue3, React, Webpack — ma quello che mi fa venire voglia di alzarmi al mattino è il lavoro in team e le sfide nuove: il codice è il mezzo, le persone e i problemi da risolvere insieme sono il motivo.",
    "hero.scroll": "Scorri ↓",
    "divider.percorso": "→ Percorso",
    "project.view": "Vedi il progetto",
    "contact.heading": "Parliamo del tuo prossimo progetto.",
    "contact.email_btn": "Scrivimi via email",
    "contact.whatsapp_btn": "Scrivimi su WhatsApp",
    "contact.playlist": "Ascolta la mia playlist mentre guardi i progetti ↗",
    "footer.credit": "Design & sviluppo: questo sito",
    "cookie.decline": "Rifiuta",
    "cookie.accept": "Ho capito",
  },
  en: {
    "nav.percorso": "Journey", "nav.stack": "Stack", "nav.progetti": "Projects",
    "nav.passioni": "Interests", "nav.contatti": "Contact", "nav.cv": "CV",
    "hero.tag": "frontend developer · 5 years of experience",
    "hero.role": "I've been writing frontend code for 5 years — Vue3, React, Webpack — but what actually gets me up in the morning is working in a team and tackling new challenges: code is the means, people and problems worth solving together are the reason.",
    "hero.scroll": "Scroll ↓",
    "divider.percorso": "→ Journey",
    "project.view": "View project",
    "contact.heading": "Let's talk about your next project.",
    "contact.email_btn": "Email me",
    "contact.whatsapp_btn": "Message me on WhatsApp",
    "contact.playlist": "Listen to my playlist while you browse the projects ↗",
    "footer.credit": "Design & build: this site",
    "cookie.decline": "Decline",
    "cookie.accept": "Got it",
  },
  es: {
    "nav.percorso": "Trayecto", "nav.stack": "Stack", "nav.progetti": "Proyectos",
    "nav.passioni": "Intereses", "nav.contatti": "Contacto", "nav.cv": "CV",
    "hero.tag": "frontend developer · 5 años de experiencia",
    "hero.role": "Llevo 5 años escribiendo frontend — Vue3, React, Webpack — pero lo que de verdad me hace levantarme por la mañana es trabajar en equipo y afrontar retos nuevos: el código es el medio, las personas y los problemas que vale la pena resolver juntos son el motivo.",
    "hero.scroll": "Desliza ↓",
    "divider.percorso": "→ Trayecto",
    "project.view": "Ver proyecto",
    "contact.heading": "Hablemos de tu próximo proyecto.",
    "contact.email_btn": "Escríbeme por email",
    "contact.whatsapp_btn": "Escríbeme por WhatsApp",
    "contact.playlist": "Escucha mi playlist mientras miras los proyectos ↗",
    "footer.credit": "Diseño y desarrollo: este sitio",
    "cookie.decline": "Rechazar",
    "cookie.accept": "Entendido",
  },
};

let currentLang = localStorage.getItem("lang") || "it";

function translate(key) {
  return (translations[currentLang] && translations[currentLang][key])
    || translations.it[key] || key;
}

function applyLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = translate(el.dataset.i18n);
  });
  const activeSectionLabel = document.getElementById("navCenter");
  if (activeSectionLabel && activeSectionLabel.dataset.i18nActive) {
    activeSectionLabel.textContent = translate(activeSectionLabel.dataset.i18nActive);
  }
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

applyLanguage(currentLang);

// ===== easter egg per chi apre la console =====
console.log(
  "%cCiao, sviluppatore 👋",
  "font-size:18px; font-weight:700; color:#1FAF7D;"
);
console.log(
  "%cQuesto sito non usa framework a runtime: solo HTML, CSS e JS scritti a mano.\nSe stai guardando il sorgente, probabilmente ti interessa più questo che il mio CV. Scrivimi.",
  "font-size:13px; color:#56513F;"
);
