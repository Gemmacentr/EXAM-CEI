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

function setMenuOpen(open) {
  secondNav.classList.toggle("isOpen", open);
  navigationTrigger.classList.toggle("isOpen", open);
  navigationTrigger.setAttribute("aria-expanded", String(open));
  navigationTrigger.setAttribute("aria-label", open ? "chiudi menu" : "apri menu");
  secondNav.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
  document.body.style.overflow = open ? "hidden" : "auto";
}

navigationTrigger.addEventListener("click", () => {
  setMenuOpen(!secondNav.classList.contains("isOpen"));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && secondNav.classList.contains("isOpen")) setMenuOpen(false);
});
document.querySelectorAll(".Second-nav .Nav-list a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    secondNav.classList.add("isClosing");
    setTimeout(() => {
      setMenuOpen(false);
      secondNav.classList.remove("isClosing");
      target.scrollIntoView({ behavior: "smooth" });
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
    "hero.role": "Scrivo frontend da 5 anni — Vue 3, TypeScript, SCSS, Git — ma quello che mi fa venire voglia di alzarmi al mattino è il lavoro in team e le sfide nuove: il codice è il mezzo, le persone e i problemi da risolvere insieme sono il motivo.",
    "hero.scroll": "Scorri ↓",
    "divider.percorso": "→ Percorso",
    "project.view": "Vedi il progetto",
    "contact.heading": "Parliamo del tuo prossimo progetto.",
    "contact.email_btn": "Scrivimi via email",
    "contact.whatsapp_btn": "Scrivimi su WhatsApp",
    "contact.linkedin_btn": "Trovami su LinkedIn",
    "theme.toLight": "Passa al tema chiaro",
    "theme.toDark": "Passa al tema scuro",
    "contact.playlist": "Ascolta la mia playlist mentre guardi i progetti ↗",
    "footer.credit": "Design & sviluppo: questo sito",
    "cookie.decline": "Rifiuta",
    "cookie.accept": "Ho capito",
    "projects.intro": "Dal markup scritto a mano ai framework, dai dati alla grafica: front-end, data visualization, UI/UX, 3D e design. Filtra per disciplina.",
    "stat.projects": "progetti da visitare",
    "stat.tech": "tecnologie",
    "stat.disc": "discipline",
    "filter.all": "Tutti",
    "filter.frontend": "Front-end",
    "filter.dataviz": "Data visualization",
    "filter.uiux": "UI/UX",
    "filter.3d": "3D",
    "filter.design": "Design",
    "badge.hiring": "Prova per assunzione",
    "badge.uni": "Università",
    "badge.desktop": "Ottimizzato per desktop",
    "badge.mobile": "Anche mobile",
    "badge.soon": "Galleria in arrivo",
    "group.main": "Lavori e prove tecniche",
    "group.uni": "Progetti universitari",
    "group.vue": "Siti in Vue 3",
    "note.vuesite": "Sito sviluppato con Vue 3, TypeScript e SCSS, versionato con Git.",
    "badge.core": "Stack principale",
    "studies.work": "Esperienza lavorativa",
    "studies.edu": "Formazione",
    "date.mrapps": "Apr 2024 — Oggi",
    "date.alten2": "Gen 2023 — Apr 2024",
    "date.alten1": "Apr 2022 — Dic 2022",
    "date.cyclando": "Gen 2022 — Mar 2022",
    "date.southtours": "Set 2021 — Dic 2021",
    "date.cei": "In corso",
    "mode.remote": "Remoto",
    "mode.hybrid": "Ibrido",
    "mode.onsite": "In sede",
    "type.internship": "Tirocinio",
    "master.meta": "540 h · 9 mesi",
    "modules.label": "Moduli del programma",
    "mod.graphic": "Design grafico (Adobe Tools)",
    "mod.web": "Design web con HTML5, CSS3 e JavaScript",
    "mod.fullstack": "Sviluppo web Full Stack",
    "desc.mrapps": "Sviluppo applicazioni web veloci e responsive con Vue 3 (Composition API, SPA e componenti riutilizzabili), TypeScript, Vite e SCSS. Git con GitHub e GitLab, test delle API REST con Postman.",
    "desc.alten2": "Servizi backend in .NET (C#, Microsoft SQL Server) nel team di sviluppo di Credem: microservizi e API REST su dati bancari, nel rispetto di standard rigorosi di sicurezza e qualità. API con Dapper, strumenti interni per testare gli endpoint con Swagger, code review e deploy.",
    "desc.alten1": "Prima esperienza frontend con React (Hooks come useState, useEffect, useContext) su un progetto già in produzione da oltre 3 anni: codice legacy, stili in CSS, deploy su AWS, gestione dei task con Trello.",
    "desc.cyclando": "Ottimizzazione delle prestazioni di un sito WordPress (plugin, colli di bottiglia individuati con GTmetrix), bucket AWS S3 per gli asset pesanti, integrazione delle API HubSpot per il team Sales. Metodologia Agile: stand-up, Scrum, Jira.",
    "desc.southtours": "Gestione di un sito WordPress (plugin, aggiornamento dei contenuti, ottimizzazione), primi passi in PHP con ambiente locale XAMPP. Primo team in ufficio in un contesto internazionale, con comunicazione tutta in inglese.",
    "link.site": "Apri il sito ↗",
    "link.figma": "Vedi su Figma ↗",
    "link.prototype": "Vedi il prototipo ↗",
    "title.design": "Design grafico",
    "note.americandrink": "Prova per assunzione: sito in HTML e CSS.",
    "note.satnogs": "Prova per assunzione: Index e Home pensate come proposta per il loro sito, con il progetto su Figma.",
    "note.react": "Prova per assunzione sviluppata in React.",
    "note.kikeroo": "Prova per assunzione costruita con EJS e Leaflet.",
    "note.massacre": "Ontologia pubblicata come sito, con visualizzazione WebVOWL.",
    "note.dataviz": "Data visualization con dati gestiti in Python.",
    "note.maderna": "Progettazione di una biblioteca in 3D, realizzata con Blender.",
    "note.mirabilia": "Sito in JavaScript, pensato anche per mobile.",
    "note.biopharm": "Redesign del Register: prototipo interattivo su Figma.",
    "note.design": "Lavori di grafica con Illustrator, InDesign e Photoshop.",
  },
  en: {
    "nav.percorso": "Journey", "nav.stack": "Stack", "nav.progetti": "Projects",
    "nav.passioni": "Interests", "nav.contatti": "Contact", "nav.cv": "CV",
    "hero.tag": "frontend developer · 5 years of experience",
    "hero.role": "I've been writing frontend code for 5 years — Vue 3, TypeScript, SCSS, Git — but what actually gets me up in the morning is working in a team and tackling new challenges: code is the means, people and problems worth solving together are the reason.",
    "hero.scroll": "Scroll ↓",
    "divider.percorso": "→ Journey",
    "project.view": "View project",
    "contact.heading": "Let's talk about your next project.",
    "contact.email_btn": "Email me",
    "contact.whatsapp_btn": "Message me on WhatsApp",
    "contact.linkedin_btn": "Find me on LinkedIn",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "contact.playlist": "Listen to my playlist while you browse the projects ↗",
    "footer.credit": "Design & build: this site",
    "cookie.decline": "Decline",
    "cookie.accept": "Got it",
    "projects.intro": "From hand-written markup to frameworks, from data to graphics: front-end, data visualisation, UI/UX, 3D and design. Filter by discipline.",
    "stat.projects": "projects to visit",
    "stat.tech": "technologies",
    "stat.disc": "disciplines",
    "filter.all": "All",
    "filter.frontend": "Front-end",
    "filter.dataviz": "Data visualisation",
    "filter.uiux": "UI/UX",
    "filter.3d": "3D",
    "filter.design": "Design",
    "badge.hiring": "Hiring test",
    "badge.uni": "University",
    "badge.desktop": "Desktop-optimised",
    "badge.mobile": "Mobile too",
    "badge.soon": "Gallery coming soon",
    "group.main": "Work and technical tests",
    "group.uni": "University projects",
    "group.vue": "Vue 3 sites",
    "note.vuesite": "Site built with Vue 3, TypeScript and SCSS, versioned with Git.",
    "badge.core": "Core stack",
    "studies.work": "Work experience",
    "studies.edu": "Education",
    "date.mrapps": "Apr 2024 — Present",
    "date.alten2": "Jan 2023 — Apr 2024",
    "date.alten1": "Apr 2022 — Dec 2022",
    "date.cyclando": "Jan 2022 — Mar 2022",
    "date.southtours": "Sep 2021 — Dec 2021",
    "date.cei": "In progress",
    "mode.remote": "Remote",
    "mode.hybrid": "Hybrid",
    "mode.onsite": "On-site",
    "type.internship": "Internship",
    "master.meta": "540 h · 9 months",
    "modules.label": "Programme modules",
    "mod.graphic": "Graphic design (Adobe Tools)",
    "mod.web": "Web design with HTML5, CSS3 and JavaScript",
    "mod.fullstack": "Full Stack web development",
    "desc.mrapps": "Building fast, responsive web applications with Vue 3 (Composition API, SPAs and reusable components), TypeScript, Vite and SCSS. Git with GitHub and GitLab, REST API testing with Postman.",
    "desc.alten2": "Backend services in .NET (C#, Microsoft SQL Server) within the Credem development team: microservices and REST APIs on banking data, under strict security and code-quality standards. An API built with Dapper, internal tools to test endpoints with Swagger, code reviews and deployments.",
    "desc.alten1": "First hands-on frontend experience with React (Hooks such as useState, useEffect, useContext) on a project already in production for over 3 years: legacy code, CSS styling, deployment on AWS, tasks managed in Trello.",
    "desc.cyclando": "Performance tuning of a WordPress site (plugins, bottlenecks found with GTmetrix), an AWS S3 bucket for heavy assets, HubSpot API integration for the Sales team. Agile methodology: stand-ups, Scrum, Jira.",
    "desc.southtours": "Managing a WordPress site (plugins, content updates, optimisation), first steps in PHP with a local XAMPP environment. First in-office team experience in an international setting, with everything in English.",
    "link.site": "Open the site ↗",
    "link.figma": "View on Figma ↗",
    "link.prototype": "View the prototype ↗",
    "title.design": "Graphic design",
    "note.americandrink": "Hiring test: a site built in HTML and CSS.",
    "note.satnogs": "Hiring test: Index and Home pages designed as a proposal for their site, with the design on Figma.",
    "note.react": "Hiring test built with React.",
    "note.kikeroo": "Hiring test built with EJS and Leaflet.",
    "note.massacre": "An ontology published as a website, with WebVOWL visualisation.",
    "note.dataviz": "Data visualisation with data handled in Python.",
    "note.maderna": "Design of a 3D library, created in Blender.",
    "note.mirabilia": "A JavaScript site, built to work on mobile too.",
    "note.biopharm": "Register redesign: interactive prototype on Figma.",
    "note.design": "Graphic work with Illustrator, InDesign and Photoshop.",
  },
  es: {
    "nav.percorso": "Trayecto", "nav.stack": "Stack", "nav.progetti": "Proyectos",
    "nav.passioni": "Intereses", "nav.contatti": "Contacto", "nav.cv": "CV",
    "hero.tag": "frontend developer · 5 años de experiencia",
    "hero.role": "Llevo 5 años escribiendo frontend — Vue 3, TypeScript, SCSS, Git — pero lo que de verdad me hace levantarme por la mañana es trabajar en equipo y afrontar retos nuevos: el código es el medio, las personas y los problemas que vale la pena resolver juntos son el motivo.",
    "hero.scroll": "Desliza ↓",
    "divider.percorso": "→ Trayecto",
    "project.view": "Ver proyecto",
    "contact.heading": "Hablemos de tu próximo proyecto.",
    "contact.email_btn": "Escríbeme por email",
    "contact.whatsapp_btn": "Escríbeme por WhatsApp",
    "contact.linkedin_btn": "Encuéntrame en LinkedIn",
    "theme.toLight": "Cambiar al tema claro",
    "theme.toDark": "Cambiar al tema oscuro",
    "contact.playlist": "Escucha mi playlist mientras miras los proyectos ↗",
    "footer.credit": "Diseño y desarrollo: este sitio",
    "cookie.decline": "Rechazar",
    "cookie.accept": "Entendido",
    "projects.intro": "Del maquetado a mano a los frameworks, de los datos a la gráfica: front-end, visualización de datos, UI/UX, 3D y diseño. Filtra por disciplina.",
    "stat.projects": "proyectos para visitar",
    "stat.tech": "tecnologías",
    "stat.disc": "disciplinas",
    "filter.all": "Todos",
    "filter.frontend": "Front-end",
    "filter.dataviz": "Visualización de datos",
    "filter.uiux": "UI/UX",
    "filter.3d": "3D",
    "filter.design": "Diseño",
    "badge.hiring": "Prueba de selección",
    "badge.uni": "Universidad",
    "badge.desktop": "Optimizado para escritorio",
    "badge.mobile": "También móvil",
    "badge.soon": "Galería próximamente",
    "group.main": "Trabajos y pruebas técnicas",
    "group.uni": "Proyectos universitarios",
    "group.vue": "Sitios en Vue 3",
    "note.vuesite": "Sitio desarrollado con Vue 3, TypeScript y SCSS, versionado con Git.",
    "badge.core": "Stack principal",
    "studies.work": "Experiencia laboral",
    "studies.edu": "Formación",
    "date.mrapps": "Abr 2024 — Actualidad",
    "date.alten2": "Ene 2023 — Abr 2024",
    "date.alten1": "Abr 2022 — Dic 2022",
    "date.cyclando": "Ene 2022 — Mar 2022",
    "date.southtours": "Sep 2021 — Dic 2021",
    "date.cei": "En curso",
    "mode.remote": "Remoto",
    "mode.hybrid": "Híbrido",
    "mode.onsite": "Presencial",
    "type.internship": "Prácticas",
    "master.meta": "540 h · 9 meses",
    "modules.label": "Módulos del programa",
    "mod.graphic": "Diseño gráfico (Adobe Tools)",
    "mod.web": "Diseño web con HTML5, CSS3 y JavaScript",
    "mod.fullstack": "Desarrollo web Full Stack",
    "desc.mrapps": "Desarrollo de aplicaciones web rápidas y responsive con Vue 3 (Composition API, SPA y componentes reutilizables), TypeScript, Vite y SCSS. Git con GitHub y GitLab, pruebas de APIs REST con Postman.",
    "desc.alten2": "Servicios backend en .NET (C#, Microsoft SQL Server) en el equipo de desarrollo de Credem: microservicios y APIs REST sobre datos bancarios, con estándares estrictos de seguridad y calidad. Una API con Dapper, herramientas internas para probar endpoints con Swagger, code reviews y despliegues.",
    "desc.alten1": "Primera experiencia frontend con React (Hooks como useState, useEffect, useContext) en un proyecto que ya llevaba más de 3 años en producción: código legacy, estilos con CSS, despliegue en AWS, tareas gestionadas en Trello.",
    "desc.cyclando": "Optimización del rendimiento de un sitio WordPress (plugins, cuellos de botella detectados con GTmetrix), un bucket de AWS S3 para los recursos pesados, integración de las APIs de HubSpot para el equipo de Ventas. Metodología Agile: stand-ups, Scrum, Jira.",
    "desc.southtours": "Gestión de un sitio WordPress (plugins, actualización de contenidos, optimización), primeros pasos en PHP con un entorno local XAMPP. Primera experiencia en equipo presencial en un entorno internacional, con todo en inglés.",
    "link.site": "Abrir el sitio ↗",
    "link.figma": "Ver en Figma ↗",
    "link.prototype": "Ver el prototipo ↗",
    "title.design": "Diseño gráfico",
    "note.americandrink": "Prueba de selección: sitio en HTML y CSS.",
    "note.satnogs": "Prueba de selección: páginas Index y Home pensadas como propuesta para su sitio, con el diseño en Figma.",
    "note.react": "Prueba de selección desarrollada con React.",
    "note.kikeroo": "Prueba de selección creada con EJS y Leaflet.",
    "note.massacre": "Ontología publicada como sitio web, con visualización WebVOWL.",
    "note.dataviz": "Visualización de datos gestionados con Python.",
    "note.maderna": "Diseño de una biblioteca en 3D, creado con Blender.",
    "note.mirabilia": "Sitio en JavaScript, pensado también para móvil.",
    "note.biopharm": "Rediseño del Register: prototipo interactivo en Figma.",
    "note.design": "Trabajos gráficos con Illustrator, InDesign y Photoshop.",
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
  refreshThemeLabel();
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

applyLanguage(currentLang);

// ===== tema giorno / notte: parte sempre chiaro, la scelta resta salvata =====
function refreshThemeLabel() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.setAttribute("aria-label", translate(dark ? "theme.toLight" : "theme.toDark"));
  btn.setAttribute("aria-pressed", String(dark));
}
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("theme", theme); } catch (e) { /* storage non disponibile: vale solo per questa visita */ }
  refreshThemeLabel();
}
(function () {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  refreshThemeLabel();
  btn.addEventListener("click", () => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
})();

// ===== progetti: filtro per disciplina + contatori calcolati dalle card =====
(function () {
  const grid = document.getElementById("projGrid");
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll(".pc"));
  const buttons = Array.from(document.querySelectorAll(".pf-btn"));

  function applyFilter(filter) {
    cards.forEach((card) => {
      const cats = (card.dataset.cats || "").split(" ");
      card.hidden = !(filter === "all" || cats.includes(filter));
    });
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    grid.querySelectorAll("[data-group-label]").forEach((label) => {
      const group = label.dataset.groupLabel;
      label.hidden = !cards.some((card) => card.dataset.group === group && !card.hidden);
    });
  }
  buttons.forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter)));

  // numeri veri, ricavati dal markup: se aggiungi una card si aggiornano da soli
  const techs = new Set();
  grid.querySelectorAll(".pc-tags span").forEach((s) => techs.add(s.textContent.trim()));
  const withLinks = cards.filter((c) => c.querySelector(".pc-links a")).length;
  const disciplines = buttons.filter((b) => b.dataset.filter !== "all").length;
  document.getElementById("statOnline").textContent = withLinks;
  document.getElementById("statTech").textContent = techs.size;
  document.getElementById("statDisc").textContent = disciplines;
})();

// ===== easter egg per chi apre la console =====
console.log(
  "%cCiao, sviluppatore 👋",
  "font-size:18px; font-weight:700; color:#1FAF7D;"
);
console.log(
  "%cQuesto sito è scritto a mano, senza framework a runtime: solo HTML, CSS e JS.\nSe stai guardando il sorgente, probabilmente ti interessa più questo che il mio CV. Scrivimi.",
  "font-size:13px; color:#56513F;"
);
