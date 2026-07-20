(() => {
  "use strict";

  const EMAIL = "blaisenewman@gmail.com";
  const SUBJECT = "PestoAi website or codebase review";

  const form = document.getElementById("reviewForm");
  const status = document.getElementById("formStatus");
  const fallback = document.getElementById("formFallback");
  const gmailLink = document.getElementById("openGmailFallback");
  const copySubmissionButton = document.getElementById("copySubmission");
  const copyEmailButton = document.getElementById("copyEmail");

  if (!form) return;
  if (fallback) fallback.hidden = false;

  function getFields() {
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

  function buildMailto(fields) {
    return `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(buildBody(fields))}`;
  }

  function buildGmail(fields) {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: EMAIL,
      su: SUBJECT,
      body: buildBody(fields)
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }

  function refreshGmailLink() {
    if (gmailLink) gmailLink.href = buildGmail(getFields());
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

  form.addEventListener("input", refreshGmailLink);
  refreshGmailLink();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!form.reportValidity()) return;

    const fields = getFields();
    refreshGmailLink();

    if (status) {
      status.textContent = "Opening your email app. If nothing opens, use ‘Open in Gmail’ or ‘Copy details instead’.";
    }

    window.location.href = buildMailto(fields);
  }, true);

  if (copySubmissionButton) {
    copySubmissionButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const fields = getFields();
      const text = `To: ${EMAIL}\nSubject: ${SUBJECT}\n\n${buildBody(fields)}`;

      try {
        await copyText(text);
        if (status) status.textContent = "Message details copied. Paste them into any email service.";
      } catch {
        if (status) status.textContent = `Copy failed. Please email ${EMAIL}.`;
      }
    }, true);
  }

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        await copyText(EMAIL);
        if (status) status.textContent = `${EMAIL} copied.`;
      } catch {
        if (status) status.textContent = `Email us at ${EMAIL}.`;
      }
    }, true);
  }
})();
