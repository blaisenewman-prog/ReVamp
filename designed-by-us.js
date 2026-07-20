(() => {
  "use strict";

  const showcase = document.querySelector("[data-designed-showcase]");
  if (!showcase) return;

  const projects = [
    {
      id: "sybix",
      number: "PROJECT 01 · WEBSITE REDESIGN",
      status: "LIVE PREVIEW",
      name: "Sybix",
      summary: "A personal internet launch console redesigned for faster scanning and everyday use, while preserving the deliberately simple, engineer-focused character of the original site.",
      outcome: "Dense links were reorganised into clear groups, with filtering, live Dublin information and a responsive layout added without turning the site into a conventional corporate homepage.",
      tags: ["Information design", "Responsive layout", "Useful utilities"],
      defaultView: "after",
      views: {
        before: {
          url: "designed-sites/sybix/before/index.html",
          label: "BEFORE",
          address: "sybix / before",
          title: "Original version of the Sybix website",
          description: "The original link-heavy homepage: useful and personal, but difficult to scan on smaller screens."
        },
        after: {
          url: "designed-sites/sybix/after/index.html",
          label: "AFTER",
          address: "sybix / after",
          title: "After version of the Sybix website",
          description: "A cleaner, searchable personal launch console that remains intentionally compact and practical."
        }
      }
    },
    {
      id: "wriddle",
      number: "PROJECT 02 · PRODUCT WEBSITE",
      status: "LIVE PREVIEW",
      name: "Wriddle",
      summary: "A focused daily-riddle website designed to make one small challenge feel clear, memorable and enjoyable on both mobile and desktop.",
      outcome: "The experience was shaped around the daily riddle itself, with a stronger identity, straightforward answer checking, a countdown, result sharing and space for a lightweight leaderboard.",
      tags: ["Product identity", "Game interaction", "Mobile-first UX"],
      defaultView: "after",
      views: {
        before: {
          url: "designed-sites/wriddle/before/index.html",
          label: "BEFORE",
          address: "wriddle / before",
          title: "Early version of the Wriddle website",
          description: "A functional first version with the core riddle mechanic but limited hierarchy and personality."
        },
        after: {
          url: "designed-sites/wriddle/after/index.html",
          label: "AFTER",
          address: "wriddle / after",
          title: "After version of the Wriddle website",
          description: "A polished daily game with a distinctive visual identity and a clearer, responsive play flow."
        }
      }
    },
    {
      id: "oilean",
      number: "PROJECT 03 · WEBSITE REDESIGN",
      status: "LIVE PREVIEW",
      name: "Oileán",
      summary: "A mission-led website concept for an organisation strengthening island participation and influence in global climate, ocean and sustainable-development decision-making.",
      outcome: "The redesign introduces a stronger opening message, clearer programme pathways, more engaging event presentation and a responsive enquiry journey while preserving Oileán’s real mission and work.",
      tags: ["Mission-led design", "Programme clarity", "Responsive website"],
      defaultView: "after",
      views: {
        before: {
          url: "https://www.oilean.ie/",
          label: "BEFORE · LIVE SITE",
          address: "oilean.ie / live website",
          title: "Current live Oileán website",
          description: "The Before view uses the current live oilean.ie website. Some websites block embedded previews; Open current view will always take you to the original site."
        },
        after: {
          url: "designed-sites/oilean/after/index.html",
          label: "AFTER",
          address: "oilean / PestoAi concept",
          title: "PestoAi redesign concept for Oileán",
          description: "A polished, responsive one-page concept with clearer programmes, events, mission and contact pathways."
        }
      }
    }
  ];

  const els = {
    frame: document.getElementById("designedSiteFrame"),
    frameWrap: showcase.querySelector("[data-designed-frame-wrap]"),
    tabs: [...document.querySelectorAll("[data-designed-project]")],
    viewButtons: [...showcase.querySelectorAll("[data-designed-view]")],
    viewControls: document.getElementById("designedViewControls"),
    number: document.getElementById("designedProjectNumber"),
    status: document.getElementById("designedProjectStatus"),
    name: document.getElementById("designedProjectName"),
    summary: document.getElementById("designedProjectSummary"),
    outcome: document.querySelector("#designedProjectOutcome p"),
    tags: document.getElementById("designedProjectTags"),
    address: document.getElementById("designedAddress"),
    openLink: document.getElementById("designedOpenLink"),
    viewLabel: document.getElementById("designedViewLabel"),
    viewDescription: document.getElementById("designedViewDescription"),
    count: document.getElementById("designedProjectCount"),
    previous: document.getElementById("designedPrevious"),
    next: document.getElementById("designedNext")
  };

  let projectIndex = 0;
  let currentView = projects[0].defaultView;

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function projectById(id) {
    return projects.findIndex((project) => project.id === id);
  }

  function renderView(viewName, force = false) {
    const project = projects[projectIndex];
    const view = project.views[viewName] || project.views[project.defaultView];
    if (!view || !els.frame) return;

    currentView = Object.keys(project.views).find((key) => project.views[key] === view) || project.defaultView;

    els.viewButtons.forEach((button) => {
      const active = button.dataset.designedView === currentView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (force || els.frame.getAttribute("src") !== view.url) {
      els.frameWrap?.classList.add("is-loading");
      els.frame.src = view.url;
    }

    els.frame.title = view.title;
    setText(els.address, view.address);
    if (els.openLink) els.openLink.href = view.url;
    setText(els.viewLabel, view.label);
    setText(els.viewDescription, view.description);
  }

  function renderProject(index) {
    projectIndex = (index + projects.length) % projects.length;
    const project = projects[projectIndex];

    els.tabs.forEach((tab) => {
      const active = tab.dataset.designedProject === project.id;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    setText(els.number, project.number);
    setText(els.status, project.status);
    setText(els.name, project.name);
    setText(els.summary, project.summary);
    setText(els.outcome, project.outcome);
    setText(els.count, `${String(projectIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`);

    if (els.tags) {
      els.tags.innerHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");
    }

    const hasBeforeAfter = Boolean(project.views.before && project.views.after);
    if (els.viewControls) els.viewControls.hidden = !hasBeforeAfter;
    currentView = project.defaultView;
    renderView(currentView, true);
  }

  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const index = projectById(tab.dataset.designedProject);
      if (index >= 0) renderProject(index);
    });

    tab.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (projectIndex + direction + projects.length) % projects.length;
      renderProject(nextIndex);
      els.tabs[nextIndex]?.focus();
    });
  });

  els.viewButtons.forEach((button) => {
    button.addEventListener("click", () => renderView(button.dataset.designedView));
  });

  els.previous?.addEventListener("click", () => renderProject(projectIndex - 1));
  els.next?.addEventListener("click", () => renderProject(projectIndex + 1));
  els.frame?.addEventListener("load", () => els.frameWrap?.classList.remove("is-loading"));

  renderProject(0);
})();
