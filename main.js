document.documentElement.classList.add('js-enabled');
const topbar = document.querySelector(".topbar");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
let animationTargets = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .hero__title, .counter, .skill-bar, .cert__bar-fill, .timeline-item");
let counterTargets = document.querySelectorAll("[data-count]");
let skillBars = document.querySelectorAll(".skill-bar[data-progress]");
let downloadButtons = document.querySelectorAll("[data-analytics='download-cv']");
let currentProjects = [];
let activeProjectGallery = [];
let activeProjectIndex = 0;
let activeGalleryIndex = 0;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function sanitizeUrl(value) {
  const input = String(value ?? "").trim();

  if (!input) {
    return "";
  }

  if (input.startsWith("/") || input.startsWith("./") || input.startsWith("../")) {
    return input;
  }

  try {
    const parsed = new URL(input, window.location.origin);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return input;
    }
  } catch {
    return "";
  }

  return "";
}

function sanitizeAlignment(value) {
  return ["left", "right", "up"].includes(value) ? value : "left";
}

function sanitizeColor(value, fallback = "#1a3a5c") {
  const input = String(value ?? "").trim();

  if (/^#[0-9a-fA-F]{3,8}$/.test(input) || /^rgba?\([\d\s.,%]+\)$/.test(input) || /^hsla?\([\d\s.,%]+\)$/.test(input)) {
    return input;
  }

  return fallback;
}

function sanitizeSvg(value) {
  const input = String(value ?? "").trim();

  if (!/^<svg[\s>]/i.test(input) || /on\w+=/i.test(input) || /javascript:/i.test(input)) {
    return "";
  }

  return input;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toggleNav(open) {
  if (!nav || !menuButton) {
    return;
  }

  nav.classList.toggle("nav--open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("no-scroll", open);
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.contains("nav--open");
    toggleNav(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => toggleNav(false));
  });
}

function updateTopbar() {
  if (!topbar) {
    return;
  }

  topbar.classList.toggle("is-scrolled", window.scrollY > 50);
}

function animateCounter(element, target, duration) {
  const start = performance.now();
  const suffix = element.dataset.suffix || "";
  const prefix = element.dataset.prefix || "";

  function step(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = `${prefix}${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = `${prefix}${target}${suffix}`;
    }
  }

  requestAnimationFrame(step);
}

function formatCompetences(competences) {
  if (!Array.isArray(competences) || competences.length === 0) {
    return "";
  }

  const visibleCompetences = competences.slice(0, 2);
  const remainingCount = competences.length - visibleCompetences.length;
  const remainingText = remainingCount > 0 ? `, +${remainingCount} compétence${remainingCount > 1 ? "s" : ""}` : "";

  return `${visibleCompetences.map(escapeHTML).join(", ")}${remainingText}`;
}

function observeElements() {
  const targets = Array.from(animationTargets);

  if (!targets.length) {
    return;
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((element) => element.classList.add("is-visible"));
    counterTargets.forEach((element) => {
      animateCounter(element, Number(element.dataset.count || 0), 1);
    });
    skillBars.forEach((bar) => {
      const fill = bar.querySelector("span");
      if (fill) {
        fill.style.setProperty("width", `${bar.dataset.progress || 0}%`);
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;
        const delay = Number(element.dataset.delay || 0);
        const delayMs = Number.isFinite(delay) ? delay : 0;

        window.setTimeout(() => {
          element.classList.add("is-visible");

          if (element.classList.contains("counter") && !element.dataset.animated) {
            element.dataset.animated = "true";
            animateCounter(element, Number(element.dataset.count || 0), 1200);
          }

          if (element.classList.contains("skill-bar") && !element.dataset.animated) {
            element.dataset.animated = "true";
            const fill = element.querySelector("span");
            if (fill) {
              fill.style.setProperty("--progress-value", `${element.dataset.progress || 0}%`);
              fill.style.width = `${element.dataset.progress || 0}%`;
            }
          }

          if (element.classList.contains("hero__title")) {
            element.classList.add("is-visible");
          }
        }, delayMs);

        observer.unobserve(element);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  targets.forEach((element) => observer.observe(element));

  counterTargets.forEach((element) => {
    observer.observe(element);
  });

  skillBars.forEach((element) => {
    observer.observe(element);
  });
}

downloadButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "download_cv", {
        event_category: "engagement",
        event_label: "cv_pdf",
      });
    }
  });
});

window.addEventListener("scroll", updateTopbar, { passive: true });
window.addEventListener("load", updateTopbar);
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    toggleNav(false);
  }
});

function buildHTML(data) {
  currentProjects = Array.isArray(data.projects) ? data.projects : [];

  // 1. Experiences
  const expContainer = document.getElementById("experience-container");
  if (expContainer && data.experiences) {
    let expHTML = "";
    data.experiences.forEach((exp) => {
      const alignment = sanitizeAlignment(exp.alignment);
      const delay = toNumber(exp.delay);
      const logoSrc = sanitizeUrl(exp.logo);
      const title = escapeHTML(exp.title);
      const company = escapeHTML(exp.company);
      const meta = escapeHTML(exp.meta);
      const pill = escapeHTML(exp.pill);
      const result = escapeHTML(exp.result);

      expHTML += `
        <article class="experience panel timeline-item timeline-item--${alignment} fade-${alignment}" data-delay="${delay}">
          <div class="experience__top">
            ${logoSrc ? `<img class="experience__logo" loading="lazy" decoding="async" src="${logoSrc}" alt="${escapeHTML(exp.alt)}" />` : `<div class="experience__badge">${escapeHTML(exp.badge)}</div>`}
            <div>
              <p class="timeline__meta">${meta}</p>
              <h3>${title}</h3>
              <p class="experience__company">${company}</p>
            </div>
          </div>
          <div class="result-pill">${pill}</div>
          <ul>
            ${(Array.isArray(exp.bullets) ? exp.bullets : []).map((bullet) => `<li>${escapeHTML(bullet)}</li>`).join("")}
          </ul>
          <p class="experience__result">${result}</p>
        </article>`;
    });
    expContainer.innerHTML = expHTML;
  }

  // 2. Education
  const eduContainer = document.getElementById("education-container");
  if (eduContainer && data.education) {
    let eduHTML = "";
    data.education.forEach((edu) => {
      const metaHTML = (edu.date || edu.location) ? `<p class="education__meta">${escapeHTML(edu.date || "")}${edu.date && edu.location ? " · " : ""}${escapeHTML(edu.location || "")}</p>` : "";
      const competencesHTML = edu.competences ? `<p class="education__competences"><strong>Compétences :</strong> ${formatCompetences(edu.competences)}</p>` : "";
      const logoSrc = sanitizeUrl(edu.logo);
        
      eduHTML += `
        <article class="education fade-${sanitizeAlignment(edu.alignment)}" data-delay="${toNumber(edu.delay)}">
          <div class="education__top">
            <img class="education__logo" loading="lazy" decoding="async" src="${logoSrc}" alt="${escapeHTML(edu.alt)}" />
            <div class="education__copy">
              <p class="education__school">${escapeHTML(edu.school)}</p>
              <h3>${escapeHTML(edu.title)}</h3>
              ${metaHTML}
              ${competencesHTML}
            </div>
          </div>
        </article>`;
    });
    eduContainer.innerHTML = eduHTML;
  }

  // 3. Projects
  const projContainer = document.getElementById("projects-container");
  if (projContainer && data.projects) {
    let projHTML = "";

    data.projects.forEach((proj, index) => {
      const competencesList = Array.isArray(proj.competences) ? proj.competences.slice(0, 4) : [];
      const logoSrc = sanitizeUrl(proj.logo);
      const alignment = sanitizeAlignment(proj.alignment);
      const title = escapeHTML(proj.title);
      const institution = escapeHTML(proj.institution);
      const period = escapeHTML(proj.period);
      const summary = escapeHTML(proj.intro || proj.outro || "");
      const logoMarkup = logoSrc
        ? `<img class="project__logo-img" loading="lazy" decoding="async" src="${logoSrc}" alt="${escapeHTML(proj.institution || proj.title)}" />`
        : `<span>${escapeHTML(proj.logo || "PR")}</span>`;

      projHTML += `
        <article class="project project--list fade-${alignment}" data-delay="${toNumber(proj.delay)}" data-project-index="${index}" role="button" tabindex="0" aria-label="Ouvrir la galerie du projet ${title}">
          <div class="project__top">
            <div class="project__logo" aria-hidden="true">${logoMarkup}</div>
            <div class="project__heading">
              <h3>${title}</h3>
              <p class="project__meta">${period}${proj.institution ? ` · ${institution}` : ""}</p>
            </div>
          </div>
          <p class="project__summary">${summary}</p>
          <div class="project__chips" aria-label="Compétences">
            ${competencesList.map((item) => `<span class="project-chip">${escapeHTML(item)}</span>`).join("")}
          </div>
          <div class="project__overlay" aria-hidden="true">
            <span class="project__overlay-text">voir galerie</span>
          </div>
        </article>`;
    });

    projContainer.innerHTML = projHTML;
  }

  // 4. Skills
  const skillsContainer = document.getElementById("skills-container");
  if (skillsContainer && data.skills) {
    let skillsHTML = "";
    data.skills.forEach((skill) => {
      const alignment = sanitizeAlignment(skill.alignment);
      skillsHTML += `
        <article class="skill-column panel fade-${alignment}" data-delay="${toNumber(skill.delay)}">
          <div class="skill-column__head">
            ${sanitizeSvg(skill.svg)}
            <div>
              <p class="skill-column__eyebrow">${escapeHTML(skill.eyebrow)}</p>
              <h3>${escapeHTML(skill.title)}</h3>
            </div>
          </div>
          <div class="skill-list">
            ${(Array.isArray(skill.tags) ? skill.tags : []).map((tag) => `<span class="skill-tag">${escapeHTML(tag)}</span>`).join("")}
          </div>
        </article>`;
    });
    skillsContainer.innerHTML = skillsHTML;
  }

  // 5. Software logos
  const softwareContainer = document.getElementById("software-container");
  if (softwareContainer && data.softwareLogos) {
    let softwareHTML = "";
    const smallerLogos = new Set(["excel", "word", "power point", "powerpoint", "python", "powerbi", "power bi"]);
    data.softwareLogos.forEach((software) => {
      if (!software.logo) {
        return;
      }

      const title = escapeHTML(software.alt || software.name || "Logiciel");
      const softwareKey = String(software.name || software.alt || "Logiciel").toLowerCase();
      const isSmaller = smallerLogos.has(softwareKey) || smallerLogos.has(softwareKey.replace(/\s+/g, " "));
      const logoMarkup = `<img class="software-logo__img" loading="lazy" decoding="async" src="${sanitizeUrl(software.logo)}" alt="${title}" />`;

      softwareHTML += `
        <article class="software-logo${isSmaller ? " software-logo--small" : ""}" style="--software-accent: ${sanitizeColor(software.accent)};">
          ${logoMarkup}
        </article>`;
    });

    softwareContainer.innerHTML = softwareHTML;
  }

  // 6. Certifications
  const certContainer = document.getElementById("certifications-container");
  if (certContainer && data.certifications) {
    let certHTML = "";
    data.certifications.forEach((cert) => {
      const certTitle = escapeHTML(cert.title || "Certification");
      const certAlt = escapeHTML(cert.alt || certTitle);
      const certStatus = escapeHTML(cert.status || "Certifié");
      const certLink = sanitizeUrl(cert.link || "");
      let progressHTML = cert.inProgress 
        ? `<div class="cert__bar"><span class="cert__bar-fill cert__bar-fill--active"></span></div><p class="cert__progress">Progression ${toNumber(cert.progressValue)}%</p>` 
        : ``;
      const certBody = `
            <img loading="lazy" decoding="async" src="${sanitizeUrl(cert.img || "")}" alt="${certAlt}" />
            <div class="cert__content">
              <div class="cert__head">
                <h3>${certTitle}</h3>
                <span class="cert__status ${cert.inProgress ? 'cert__status--progress' : 'cert__status--done'}">${certStatus}</span>
              </div>
              ${cert.desc ? `<p>${escapeHTML(cert.desc)}</p>` : ``}
              ${progressHTML}
            </div>`;
        
      certHTML += certLink
        ? `
        <article class="cert panel fade-${sanitizeAlignment(cert.alignment)}" data-delay="${toNumber(cert.delay)}">
          <a class="cert__link" href="${certLink}" target="_blank" rel="noopener noreferrer">
${certBody}
          </a>
        </article>`
        : `
        <article class="cert panel fade-${sanitizeAlignment(cert.alignment)}" data-delay="${toNumber(cert.delay)}">
          <div class="cert__link cert__link--static">
${certBody}
          </div>
        </article>`;
    });
    certContainer.innerHTML = certHTML;
  }
}

function getProjectGallery(project) {
  const gallery = Array.isArray(project?.gallery) ? project.gallery.map((item) => sanitizeUrl(item)).filter(Boolean) : [];

  if (gallery.length > 0) {
    return gallery;
  }

  return project?.logo ? [sanitizeUrl(project.logo)].filter(Boolean) : [];
}

function renderProjectModal() {
  const modal = document.querySelector(".project-modal");
  if (!modal) {
    return;
  }

  const project = currentProjects[activeProjectIndex];
  const gallery = activeProjectGallery;
  const image = modal.querySelector(".project-modal__image");
  const title = modal.querySelector(".project-modal__title");
  const counter = modal.querySelector(".project-modal__counter");
  const thumbnails = modal.querySelector(".project-modal__thumbnails");
  const prevButton = modal.querySelector("[data-modal-prev]");
  const nextButton = modal.querySelector("[data-modal-next]");

  if (!project || !image || !title || !counter || !thumbnails || !prevButton || !nextButton) {
    return;
  }

  const currentImage = gallery[activeGalleryIndex] || gallery[0];

  image.src = currentImage;
  image.alt = project.title;
  title.textContent = project.title;
  counter.textContent = `${activeGalleryIndex + 1} / ${gallery.length}`;
  prevButton.disabled = gallery.length <= 1;
  nextButton.disabled = gallery.length <= 1;

  thumbnails.innerHTML = gallery
    .map((src, index) => `<button type="button" class="project-modal__thumb${index === activeGalleryIndex ? " is-active" : ""}" data-thumb-index="${index}"><img src="${sanitizeUrl(src)}" alt="${escapeHTML(project.title)} miniature ${index + 1}" loading="lazy" decoding="async" /></button>`)
    .join("");
}

function openProjectModal(projectIndex) {
  const modal = document.querySelector(".project-modal");
  if (!modal) {
    return;
  }

  const project = currentProjects[projectIndex];
  if (!project) {
    return;
  }

  const gallery = getProjectGallery(project);
  if (!gallery.length) {
    return;
  }

  activeProjectGallery = gallery;
  activeProjectIndex = projectIndex;
  activeGalleryIndex = 0;
  renderProjectModal();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeProjectModal() {
  const modal = document.querySelector(".project-modal");
  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

document.addEventListener("click", (event) => {
  const backdrop = event.target.closest("[data-modal-backdrop]");
  if (backdrop) {
    closeProjectModal();
    return;
  }

  const openButton = event.target.closest("[data-project-index]");
  if (openButton) {
    openProjectModal(Number(openButton.dataset.projectIndex));
    return;
  }

  const closeButton = event.target.closest("[data-modal-close]");
  if (closeButton) {
    closeProjectModal();
    return;
  }

  const prevButton = event.target.closest("[data-modal-prev]");
  if (prevButton) {
    if (activeProjectGallery.length > 0) {
      activeGalleryIndex = (activeGalleryIndex - 1 + activeProjectGallery.length) % activeProjectGallery.length;
      renderProjectModal();
    }
    return;
  }

  const nextButton = event.target.closest("[data-modal-next]");
  if (nextButton) {
    if (activeProjectGallery.length > 0) {
      activeGalleryIndex = (activeGalleryIndex + 1) % activeProjectGallery.length;
      renderProjectModal();
    }
    return;
  }

  const thumbButton = event.target.closest("[data-thumb-index]");
  if (thumbButton) {
    activeGalleryIndex = Number(thumbButton.dataset.thumbIndex || 0);
    renderProjectModal();
  }
});

document.addEventListener("keydown", (event) => {
  const projectCard = event.target.closest("[data-project-index][role='button']");
  if (!projectCard) {
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openProjectModal(Number(projectCard.dataset.projectIndex));
  }
});

document.addEventListener("keydown", (event) => {
  const modal = document.querySelector(".project-modal");
  if (!modal || !modal.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeProjectModal();
  }

  if (event.key === "ArrowLeft") {
    activeGalleryIndex = (activeGalleryIndex - 1 + activeProjectGallery.length) % activeProjectGallery.length;
    renderProjectModal();
  }

  if (event.key === "ArrowRight") {
    activeGalleryIndex = (activeGalleryIndex + 1) % activeProjectGallery.length;
    renderProjectModal();
  }
});

async function loadDataAndInitialize() {
  try {
    const response = await fetch("data.json");
    if (response.ok) {
      const data = await response.json();
      buildHTML(data);
    } else {
      console.error("Failed to load data.json");
    }
  } catch (error) {
    console.error("Error fetching data.json:", error);
  } finally {
    // Re-select DOM elements since new ones just got injected
    animationTargets = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .hero__title, .counter, .skill-bar, .cert__bar-fill, .timeline-item");
    counterTargets = document.querySelectorAll("[data-count]");
    skillBars = document.querySelectorAll(".skill-bar[data-progress]");
    downloadButtons = document.querySelectorAll("[data-analytics='download-cv']");
    
    observeElements();
    updateTopbar();
  }
}

loadDataAndInitialize();
