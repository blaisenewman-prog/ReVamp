(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    runButton: $("#runRevamp"),
    resetButton: $("#resetDemo"),
    applyButton: $("#applyRevamp"),
    viewChanges: $("#viewChanges"),
    closeChanges: $("#closeChangeLog"),
    preview: $("#sitePreview"),
    scanOverlay: $("#scanOverlay"),
    scanLabel: $("#scanLabel"),
    scanPercent: $("#scanPercent"),
    projectStatus: $("#projectStatus"),
    scoreChip: $("#scoreChip"),
    analysisEmpty: $("#analysisEmpty"),
    analysisRunning: $("#analysisRunning"),
    analysisResults: $("#analysisResults"),
    analysisComplete: $("#analysisComplete"),
    analysisProgress: $("#analysisProgress"),
    runningTitle: $("#runningTitle"),
    scanLog: $("#scanLog"),
    changeLog: $("#changeLog"),
    toast: $("#toast"),
    beforeSite: $("#beforeSite"),
    afterSite: $("#afterSite")
  };

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  let currentRun = 0;
  let isRunning = false;

  const stages = [
    { progress: 18, title: "Parsing interface structure", label: "Mapping interface…" },
    { progress: 42, title: "Testing responsive behaviour", label: "Testing breakpoints…" },
    { progress: 69, title: "Auditing accessibility signals", label: "Checking accessibility…" },
    { progress: 91, title: "Modelling the conversion path", label: "Ranking improvements…" }
  ];

  function showOnly(target) {
    [elements.analysisEmpty, elements.analysisRunning, elements.analysisResults, elements.analysisComplete]
      .forEach((panel) => {
        panel.hidden = panel !== target;
      });
  }

  function setLogState(index) {
    [...elements.scanLog.children].forEach((item, itemIndex) => {
      item.classList.toggle("active", itemIndex === index);
      item.classList.toggle("done", itemIndex < index);
      const icon = item.querySelector("span");
      icon.textContent = itemIndex < index ? "✓" : itemIndex === index ? "◉" : "○";
    });
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    window.setTimeout(() => elements.toast.classList.remove("show"), 1600);
  }

  async function runAnalysis() {
    if (isRunning) return;
    isRunning = true;
    const runId = ++currentRun;

    elements.runButton.disabled = true;
    elements.runButton.innerHTML = '<span class="button-spark" aria-hidden="true">◌</span> Analysing';
    elements.projectStatus.textContent = "analysis running";
    elements.scanOverlay.classList.add("active");
    elements.scanOverlay.setAttribute("aria-hidden", "false");
    elements.analysisProgress.style.width = "0%";
    showOnly(elements.analysisRunning);

    for (let index = 0; index < stages.length; index += 1) {
      if (runId !== currentRun) return;
      const stage = stages[index];
      setLogState(index);
      elements.runningTitle.textContent = stage.title;
      elements.scanLabel.textContent = stage.label;
      elements.scanPercent.textContent = `${stage.progress}%`;
      elements.analysisProgress.style.width = `${stage.progress}%`;
      await wait(650);
    }

    if (runId !== currentRun) return;
    setLogState(stages.length);
    elements.scanLabel.textContent = "Analysis complete";
    elements.scanPercent.textContent = "100%";
    elements.analysisProgress.style.width = "100%";
    await wait(350);

    elements.scanOverlay.classList.remove("active");
    elements.scanOverlay.setAttribute("aria-hidden", "true");
    elements.projectStatus.textContent = "4 improvements proposed";
    elements.runButton.innerHTML = '<span class="button-spark" aria-hidden="true">✓</span> Analysis ready';
    showOnly(elements.analysisResults);
    isRunning = false;
  }

  async function applyRevamp() {
    if (isRunning) return;
    isRunning = true;
    const runId = ++currentRun;

    elements.applyButton.disabled = true;
    elements.applyButton.textContent = "Applying improvements…";
    elements.scanLabel.textContent = "Rebuilding interface…";
    elements.scanPercent.textContent = "18%";
    elements.scanOverlay.classList.add("active");
    elements.scanOverlay.setAttribute("aria-hidden", "false");

    const applyStages = [
      ["Rebuilding layout system…", "32%"],
      ["Applying accessible styles…", "58%"],
      ["Optimising content hierarchy…", "81%"],
      ["Validating responsive output…", "100%"]
    ];

    for (const [label, percent] of applyStages) {
      if (runId !== currentRun) return;
      elements.scanLabel.textContent = label;
      elements.scanPercent.textContent = percent;
      await wait(520);
    }

    if (runId !== currentRun) return;
    elements.preview.classList.add("is-revamped");
    elements.beforeSite.setAttribute("aria-hidden", "true");
    elements.afterSite.setAttribute("aria-hidden", "false");
    elements.scanOverlay.classList.remove("active");
    elements.scanOverlay.setAttribute("aria-hidden", "true");
    elements.projectStatus.textContent = "revamp applied successfully";
    elements.scoreChip.textContent = "UX score: 92";
    elements.scoreChip.classList.add("complete");
    elements.runButton.hidden = true;
    showOnly(elements.analysisComplete);
    isRunning = false;
    showToast("Revamp applied");
  }

  function resetDemo() {
    currentRun += 1;
    isRunning = false;
    elements.preview.classList.remove("is-revamped");
    elements.beforeSite.setAttribute("aria-hidden", "false");
    elements.afterSite.setAttribute("aria-hidden", "true");
    elements.scanOverlay.classList.remove("active");
    elements.scanOverlay.setAttribute("aria-hidden", "true");
    elements.changeLog.hidden = true;
    elements.projectStatus.textContent = "unscanned frontend";
    elements.scoreChip.textContent = "UX score: 34";
    elements.scoreChip.classList.remove("complete");
    elements.analysisProgress.style.width = "0%";
    elements.runButton.hidden = false;
    elements.runButton.disabled = false;
    elements.runButton.innerHTML = '<span class="button-spark" aria-hidden="true">✦</span> Run ReVamp';
    elements.applyButton.disabled = false;
    elements.applyButton.innerHTML = 'Apply 4 improvements <span aria-hidden="true">→</span>';
    [...elements.scanLog.children].forEach((item) => {
      item.classList.remove("active", "done");
      item.querySelector("span").textContent = "○";
    });
    showOnly(elements.analysisEmpty);
    showToast("Demo reset");
  }

  elements.runButton.addEventListener("click", runAnalysis);
  elements.applyButton.addEventListener("click", applyRevamp);
  elements.resetButton.addEventListener("click", resetDemo);
  elements.viewChanges.addEventListener("click", () => {
    elements.changeLog.hidden = false;
  });
  elements.closeChanges.addEventListener("click", () => {
    elements.changeLog.hidden = true;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.changeLog.hidden) {
      elements.changeLog.hidden = true;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector("#demo").scrollIntoView({ behavior: "smooth" });
      elements.runButton.focus({ preventScroll: true });
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();
