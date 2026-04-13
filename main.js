const topbar = document.querySelector(".topbar");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
let animationTargets = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .hero__title, .counter, .skill-bar, .cert__bar-fill, .timeline-item");
let counterTargets = document.querySelectorAll("[data-count]");
let skillBars = document.querySelectorAll(".skill-bar[data-progress]");
let downloadButtons = document.querySelectorAll("[data-analytics='download-cv']");

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

  function step(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(step);
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
      eduHTML += `
        <article class="education panel fade-${edu.alignment}" data-delay="${edu.delay}">
          <div class="education__top">
            <img class="education__logo" loading="lazy" src="${edu.logo}" alt="${edu.alt}" />
            <div>
              <h3>${edu.title}</h3>
              <p class="education__school">${edu.school}</p>
            </div>
          </div>
          <p class="education__detail">${edu.detail}</p>
        </article>`;
    });
    eduContainer.innerHTML = eduHTML;
  }

  // 3. Projects
  const projContainer = document.getElementById("projects-container");
  if (projContainer && data.projects) {
    let projHTML = "";
    data.projects.forEach(proj => {
      projHTML += `
        <article class="project panel ${proj.accent ? 'panel--accent' : ''} fade-${proj.alignment}" data-delay="${proj.delay}">
          <p class="project__tag">${proj.tag}</p>
          <h3>${proj.title}</h3>
          <p>${proj.intro}</p>
          <ul>
            ${proj.bullets.map(b => `<li>${b}</li>`).join("")}
          </ul>
          <p>${proj.outro}</p>
          <div class="project__actions">
            <a class="button button--secondary" href="${proj.link}">Voir le projet</a>
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

  // 5. Certifications
  const certContainer = document.getElementById("certifications-container");
  if (certContainer && data.certifications) {
    let certHTML = "";
    data.certifications.forEach(cert => {
      let progressHTML = cert.inProgress 
        ? `<div class="cert__bar"><span class="cert__bar-fill cert__bar-fill--active"></span></div><p class="cert__progress">Progression ${cert.progressValue}%</p>` 
        : ``;
        
      certHTML += `
        <article class="cert panel fade-${cert.alignment}" data-delay="${cert.delay}">
          <a class="cert__link" href="${cert.link}" target="_blank" rel="noopener noreferrer">
            <img loading="lazy" src="${cert.img}" alt="${cert.alt}" />
            <div class="cert__content">
              <div class="cert__head">
                <h3>${cert.title}</h3>
                <span class="cert__status ${cert.inProgress ? 'cert__status--progress' : 'cert__status--done'}">${cert.status}</span>
              </div>
              <p>${cert.desc}</p>
              ${progressHTML}
            </div>
          </a>
        </article>`;
    });
    certContainer.innerHTML = certHTML;
  }
}

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
