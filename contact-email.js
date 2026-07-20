(() => {
  "use strict";

  const EMAIL = "pestoai.net@gmail.com";
  const SUBJECT = "PestoAi website or codebase review";

  const form = document.getElementById("reviewForm");
  const status = document.getElementById("formStatus");
  const fallback = document.getElementById("formFallback");
  const copySubmissionButton = document.getElementById("copySubmission");
  const copyEmailButton = document.getElementById("copyEmail");
  const toast = document.getElementById("toast");

  if (fallback) fallback.hidden = false;

  function getFields() {
    if (!form) {
      return { name: "", email: "", projectUrl: "", problem: "" };
    }

    const data = new FormData(form);
    return {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      projectUrl: String(data.get("project_url") || "").trim(),
      problem: String(data.get("problem") || "").trim()
    };
  }

  function buildBody(fields) {
    return [
      "Hello PestoAi,",
      "",
      "I would like you to review the following website or codebase:",
      "",
      `Name: ${fields.name || "Not provided"}`,
      `Email: ${fields.email || "Not provided"}`,
      `Link: ${fields.projectUrl || "Not provided"}`,
      "",
      "What I would like improved:",
      fields.problem || "No additional note provided.",
      "",
      "Thanks"
    ].join("\n");
  }

  function buildGmail(fields) {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      tf: "1",
      to: EMAIL,
      su: SUBJECT,
      body: buildBody(fields)
    });

    return `https://mail.google.com/mail/?${params.toString()}`;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();

    const copied = document.execCommand("copy");
    helper.remove();
    if (!copied) throw new Error("Copy failed");
  }

  function showMessage(message) {
    if (status) status.textContent = message;

    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 2200);
    }
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (!form.reportValidity()) return;

      showMessage("Opening Gmail with your details filled in…");

      // Same-tab navigation is more reliable than a scripted pop-up on mobile.
      window.location.assign(buildGmail(getFields()));
    }, true);
  }

  if (copySubmissionButton) {
    copySubmissionButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const text = `To: ${EMAIL}\nSubject: ${SUBJECT}\n\n${buildBody(getFields())}`;

      try {
        await copyText(text);
        showMessage("Message details copied. Paste them into any email service.");
      } catch {
        showMessage(`Copy failed. Please email ${EMAIL}.`);
      }
    }, true);
  }

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        await copyText(EMAIL);
        showMessage(`${EMAIL} copied.`);
      } catch {
        showMessage(`Email us at ${EMAIL}.`);
      }
    }, true);
  }
})();
