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

  return `${visibleCompetences.join(", ")}${remainingText}`;
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
    data.experiences.forEach(exp => {
      expHTML += `
        <article class="experience panel timeline-item timeline-item--${exp.alignment} fade-${exp.alignment}" data-delay="${exp.delay}">
          <div class="experience__top">
            ${exp.logo ? `<img class="experience__logo" loading="lazy" src="${exp.logo}" alt="${exp.alt}" />` : `<div class="experience__badge">${exp.badge}</div>`}
            <div>
              <p class="timeline__meta">${exp.meta}</p>
              <h3>${exp.title}</h3>
              <p class="experience__company">${exp.company}</p>
            </div>
          </div>
          <div class="result-pill">${exp.pill}</div>
          <ul>
            ${exp.bullets.map(b => `<li>${b}</li>`).join("")}
          </ul>
          <p class="experience__result">${exp.result}</p>
        </article>`;
    });
    expContainer.innerHTML = expHTML;
  }

  // 2. Education
  const eduContainer = document.getElementById("education-container");
  if (eduContainer && data.education) {
    let eduHTML = "";
    data.education.forEach(edu => {
      const metaHTML = (edu.date || edu.location) ? `<p class="education__meta">${edu.date || ''}${edu.date && edu.location ? ' · ' : ''}${edu.location || ''}</p>` : '';
      const competencesHTML = edu.competences ? `<p class="education__competences"><strong>Compétences :</strong> ${formatCompetences(edu.competences)}</p>` : '';
        
      eduHTML += `
        <article class="education fade-${edu.alignment}" data-delay="${edu.delay}">
          <div class="education__top">
            <img class="education__logo" loading="lazy" src="${edu.logo}" alt="${edu.alt}" />
            <div class="education__copy">
              <p class="education__school">${edu.school}</p>
              <h3>${edu.title}</h3>
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
      const logoMarkup = (proj.logo && proj.logo.endsWith(".png")) || (proj.logo && proj.logo.endsWith(".svg"))
        ? `<img class="project__logo-img" loading="lazy" src="${proj.logo}" alt="${proj.institution || proj.title}" />`
        : `<span>${proj.logo || "PR"}</span>`;

      projHTML += `
        <article class="project project--list fade-${proj.alignment}" data-delay="${proj.delay}" data-project-index="${index}" role="button" tabindex="0" aria-label="Ouvrir la galerie du projet ${proj.title}">
          <div class="project__top">
            <div class="project__logo" aria-hidden="true">${logoMarkup}</div>
            <div class="project__heading">
              <h3>${proj.title}</h3>
              <p class="project__meta">${proj.period}${proj.institution ? ` · ${proj.institution}` : ""}</p>
            </div>
          </div>
          <p class="project__summary">${proj.intro || proj.outro || ""}</p>
          <div class="project__chips" aria-label="Compétences">
            ${competencesList.map((item) => `<span class="project-chip">${item}</span>`).join("")}
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
    data.skills.forEach(skill => {
      skillsHTML += `
        <article class="skill-column panel fade-${skill.alignment}" data-delay="${skill.delay}">
          <div class="skill-column__head">
            ${skill.svg}
            <div>
              <p class="skill-column__eyebrow">${skill.eyebrow}</p>
              <h3>${skill.title}</h3>
            </div>
          </div>
          <div class="skill-list">
            ${skill.tags.map(t => `<span class="skill-tag">${t}</span>`).join("")}
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

      const title = software.alt || software.name || "Logiciel";
      const softwareKey = (software.name || title).toLowerCase();
      const isSmaller = smallerLogos.has(softwareKey) || smallerLogos.has(softwareKey.replace(/\s+/g, " "));
      const logoMarkup = `<img class="software-logo__img" loading="lazy" src="${software.logo}" alt="${title}" />`;

      softwareHTML += `
        <article class="software-logo${isSmaller ? " software-logo--small" : ""}" style="--software-accent: ${software.accent || "#1a3a5c"};">
          ${logoMarkup}
        </article>`;
    });

    softwareContainer.innerHTML = softwareHTML;
  }

  // 6. Certifications
  const certContainer = document.getElementById("certifications-container");
  if (certContainer && data.certifications) {
    let certHTML = "";
    data.certifications.forEach(cert => {
      const certTitle = cert.title || "Certification";
      const certAlt = cert.alt || certTitle;
      const certStatus = cert.status || "Certifié";
      const certLink = cert.link || "";
      let progressHTML = cert.inProgress 
        ? `<div class="cert__bar"><span class="cert__bar-fill cert__bar-fill--active"></span></div><p class="cert__progress">Progression ${cert.progressValue}%</p>` 
        : ``;
      const certBody = `
            <img loading="lazy" src="${cert.img || ""}" alt="${certAlt}" />
            <div class="cert__content">
              <div class="cert__head">
                <h3>${certTitle}</h3>
                <span class="cert__status ${cert.inProgress ? 'cert__status--progress' : 'cert__status--done'}">${certStatus}</span>
              </div>
              ${cert.desc ? `<p>${cert.desc}</p>` : ``}
              ${progressHTML}
            </div>`;
        
      certHTML += certLink
        ? `
        <article class="cert panel fade-${cert.alignment}" data-delay="${cert.delay}">
          <a class="cert__link" href="${certLink}" target="_blank" rel="noopener noreferrer">
${certBody}
          </a>
        </article>`
        : `
        <article class="cert panel fade-${cert.alignment}" data-delay="${cert.delay}">
          <div class="cert__link cert__link--static">
${certBody}
          </div>
        </article>`;
    });
    certContainer.innerHTML = certHTML;
  }
}

function getProjectGallery(project) {
  const gallery = Array.isArray(project?.gallery) ? project.gallery.filter(Boolean) : [];

  if (gallery.length > 0) {
    return gallery;
  }

  return project?.logo ? [project.logo] : [];
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
    .map((src, index) => `<button type="button" class="project-modal__thumb${index === activeGalleryIndex ? " is-active" : ""}" data-thumb-index="${index}"><img src="${src}" alt="${project.title} miniature ${index + 1}" loading="lazy" /></button>`)
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
