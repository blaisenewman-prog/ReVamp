(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const scenarios = {
    coffee: {
      name: "Northstar Coffee",
      address: "northstar-coffee.example",
      initialScore: "UX 34",
      finalScore: "UX 92",
      emptyTitle: "Inspect this interface.",
      emptyText: "Aiify will review hierarchy, responsiveness and conversion.",
      stages: [
        ["Parsing interface structure", "Mapping interface…", "Parse DOM structure"],
        ["Testing responsive behaviour", "Testing breakpoints…", "Audit responsive layout"],
        ["Checking accessibility", "Checking contrast and controls…", "Check accessibility signals"],
        ["Ranking conversion fixes", "Ranking improvements…", "Model conversion path"]
      ],
      suggestions: [
        ["Rebuild the hierarchy", "Create one message and one primary action.", "+24"],
        ["Add a responsive grid", "Replace fixed desktop blocks.", "+18"],
        ["Improve accessibility", "Correct contrast, semantics and focus states.", "+13"],
        ["Strengthen trust", "Add local context and social proof.", "+9"]
      ],
      completeTitle: "A clearer, modern storefront.",
      completeText: "The page is now responsive, focused and easier to trust.",
      metrics: [
        ["UX score", "34", "92"],
        ["Accessibility", "51", "96"],
        ["Mobile ready", "No", "Yes"],
        ["Primary actions", "5", "1"]
      ],
      changes: [
        ["file", "@@ frontend/homepage @@"],
        ["remove", "- fixed-width desktop layout"],
        ["add", "+ responsive semantic grid"],
        ["remove", "- competing calls to action"],
        ["add", "+ one focused conversion path"],
        ["remove", "- low-contrast decorative text"],
        ["add", "+ accessible colour and focus system"],
        ["add", "+ social proof and local context"]
      ],
      before: `
        <div class="demo-stage legacy-site">
          <div class="legacy-head">
            <div class="legacy-logo">NORTHSTAR COFFEE!!!</div>
            <div class="legacy-links">
              <button type="button" data-preview-control>HOME</button> |
              <button type="button" data-preview-control>MENU</button> |
              <button type="button" data-preview-control>ABOUT US</button> |
              <button type="button" data-preview-control>CONTACT</button>
            </div>
          </div>
          <div class="legacy-marquee">★★★★★ WELCOME TO THE BEST COFFEE IN TOWN! BREAKFAST ALL DAY! ★★★★★</div>
          <div class="legacy-body">
            <h3>FRESH COFFEE &amp; GOOD TIMES :)</h3>
            <p>We have coffee, cakes and sandwiches. Please come visit us today!!!</p>
            <button class="legacy-menu" type="button" data-preview-control>CLICK HERE FOR MENU</button>
            <div class="legacy-columns">
              <div><strong>OPENING HOURS</strong><br>Mon–Fri 7–6<br>Sat–Sun 8–5</div>
              <div><strong>FIND US</strong><br>14 Market Lane<br>Dublin</div>
              <div><strong>CALL NOW</strong><br>01 555 0198<br>THANK YOU</div>
            </div>
          </div>
          <div class="legacy-footer">Copyright 2013 Northstar Coffee — Best viewed on desktop</div>
        </div>`,
      after: `
        <div class="demo-stage modern-site">
          <header class="modern-nav">
            <div class="modern-logo"><span>✦</span> Northstar</div>
            <nav aria-label="Example navigation"><span>Menu</span><span>Our story</span><span>Visit</span></nav>
            <span class="modern-order">Order ahead</span>
          </header>
          <div class="modern-hero">
            <div class="modern-copy">
              <span class="modern-kicker">Independent coffee · Dublin</span>
              <h3>Your morning, made better.</h3>
              <p>Thoughtful coffee, warm pastries and a quiet corner in the middle of the city.</p>
              <div class="modern-actions"><button type="button" data-preview-control>Explore the menu</button><span>Find our café ↗</span></div>
              <div class="modern-proof"><b>4.9</b><span>★★★★★<br><small>from 600+ neighbours</small></span></div>
            </div>
            <div class="coffee-art" aria-hidden="true"><div class="cup"></div><div class="steam"></div><div class="steam two"></div></div>
          </div>
          <div class="modern-footer"><span>Open daily from 07:00</span><span>14 Market Lane, Dublin 2</span><span>Seasonal menu →</span></div>
        </div>`
    },

    queries: {
      name: "Orders API",
      address: "api.acme.test/orders/482/items",
      initialScore: "Perf 31",
      finalScore: "Perf 94",
      emptyTitle: "Inspect this endpoint.",
      emptyText: "Aiify will trace query count, latency and repeated work.",
      stages: [
        ["Mapping request flow", "Tracing endpoint…", "Map route dependencies"],
        ["Profiling database calls", "Counting queries…", "Profile database calls"],
        ["Finding repeated work", "Comparing query patterns…", "Detect repeated lookups"],
        ["Validating a batch query", "Benchmarking patch…", "Benchmark optimized path"]
      ],
      suggestions: [
        ["Remove the N+1 loop", "Fetch all item records in one batch.", "−39 calls"],
        ["Preload the order relation", "Avoid a second lookup for metadata.", "−1 call"],
        ["Select required fields", "Return only data used by the response.", "−42 KB"],
        ["Add a query regression test", "Fail builds when query count rises.", "guardrail"]
      ],
      completeTitle: "Forty-one calls became two.",
      completeText: "The endpoint now batches item retrieval and returns less unused data.",
      metrics: [
        ["DB calls", "41", "2"],
        ["p95 latency", "842ms", "118ms"],
        ["Payload", "96KB", "54KB"],
        ["Throughput", "72/s", "410/s"]
      ],
      changes: [
        ["file", "@@ api/orders/get_items.py @@"],
        ["remove", "- for item_id in order.item_ids:"],
        ["remove", "-   items.append(Item.get(item_id))"],
        ["add", "+ items = Item.where(id__in=order.item_ids)"],
        ["add", "+ items = items.select('id', 'name', 'price')"],
        ["file", "@@ tests/test_order_queries.py @@"],
        ["add", "+ assert_query_count(request, expected=2)"]
      ],
      before: `
        <div class="demo-stage query-site">
          <div class="query-head"><span>orders/get_items.py</span><span class="query-status">● bottleneck detected</span></div>
          <div class="code-window">
            <div class="code-title">GET /api/orders/:id/items</div>
            <div class="code-lines">
              <div class="code-line"><span class="no">01</span><span><b class="token-blue">def</b> <b class="token-yellow">get_order_items</b>(order_id):</span></div>
              <div class="code-line"><span class="no">02</span><span>&nbsp;&nbsp;order = Order.get(order_id)</span></div>
              <div class="code-line"><span class="no">03</span><span>&nbsp;&nbsp;items = []</span></div>
              <div class="code-line bad-line"><span class="no">04</span><span>&nbsp;&nbsp;<b class="token-blue">for</b> item_id <b class="token-blue">in</b> order.item_ids:</span></div>
              <div class="code-line bad-line"><span class="no">05</span><span>&nbsp;&nbsp;&nbsp;&nbsp;items.append(Item.get(item_id))</span></div>
              <div class="code-line"><span class="no">06</span><span>&nbsp;&nbsp;<b class="token-blue">return</b> serialize(items)</span></div>
            </div>
          </div>
          <div class="query-metrics">
            <div><span>Database calls</span><strong class="bad">41</strong></div>
            <div><span>p95 latency</span><strong class="bad">842 ms</strong></div>
            <div><span>Requests/sec</span><strong>72</strong></div>
          </div>
          <div class="trace-list">
            <div><span>SELECT * FROM orders WHERE id=482</span><b>18ms</b></div>
            <div><span>SELECT * FROM items WHERE id=771</span><b>14ms</b></div>
            <div><span>SELECT * FROM items WHERE id=772</span><b>16ms</b></div>
            <div><span>…38 more item queries</span><b>+676ms</b></div>
          </div>
        </div>`,
      after: `
        <div class="demo-stage query-site">
          <div class="query-head"><span>orders/get_items.py</span><span class="query-status good">● optimized</span></div>
          <div class="code-window">
            <div class="code-title">GET /api/orders/:id/items</div>
            <div class="code-lines">
              <div class="code-line"><span class="no">01</span><span><b class="token-blue">def</b> <b class="token-yellow">get_order_items</b>(order_id):</span></div>
              <div class="code-line"><span class="no">02</span><span>&nbsp;&nbsp;order = Order.get(order_id)</span></div>
              <div class="code-line good-line"><span class="no">03</span><span>&nbsp;&nbsp;items = Item.where(id__in=order.item_ids)</span></div>
              <div class="code-line good-line"><span class="no">04</span><span>&nbsp;&nbsp;items = items.select(<b class="token-green">"id"</b>, <b class="token-green">"name"</b>, <b class="token-green">"price"</b>)</span></div>
              <div class="code-line"><span class="no">05</span><span>&nbsp;&nbsp;<b class="token-blue">return</b> serialize(items)</span></div>
            </div>
          </div>
          <div class="query-metrics">
            <div><span>Database calls</span><strong class="good">2</strong></div>
            <div><span>p95 latency</span><strong class="good">118 ms</strong></div>
            <div><span>Requests/sec</span><strong class="good">410</strong></div>
          </div>
          <div class="trace-list optimized">
            <div><span>SELECT id,item_ids FROM orders WHERE id=482</span><b>17ms</b></div>
            <div><span>SELECT id,name,price FROM items WHERE id IN (...)</span><b>43ms</b></div>
          </div>
        </div>`
    },

    checkout: {
      name: "Field Supply Checkout",
      address: "fieldsupply.example/checkout",
      initialScore: "Flow 46",
      finalScore: "Flow 91",
      emptyTitle: "Inspect this checkout.",
      emptyText: "Aiify will test friction, accessibility and the purchase path.",
      stages: [
        ["Mapping checkout steps", "Tracing purchase path…", "Map form structure"],
        ["Checking form friction", "Counting fields and decisions…", "Audit input friction"],
        ["Testing accessibility", "Checking labels and focus…", "Check accessible controls"],
        ["Modelling completion", "Estimating drop-off…", "Rank conversion changes"]
      ],
      suggestions: [
        ["Remove account pressure", "Allow guest checkout by default.", "+11%"],
        ["Reduce form noise", "Keep only fields needed to fulfil the order.", "−6 fields"],
        ["Clarify the order total", "Show costs beside the payment action.", "+8%"],
        ["Repair form semantics", "Add labels, errors and keyboard focus.", "AA"]
      ],
      completeTitle: "A shorter, calmer checkout.",
      completeText: "The flow now prioritises guest payment, clear totals and accessible fields.",
      metrics: [
        ["Form fields", "14", "8"],
        ["Steps", "4", "2"],
        ["Accessibility", "58", "96"],
        ["Est. completion", "61%", "79%"]
      ],
      changes: [
        ["file", "@@ checkout/index.html @@"],
        ["remove", "- mandatory account creation prompt"],
        ["add", "+ guest checkout selected by default"],
        ["remove", "- duplicated address and marketing fields"],
        ["add", "+ concise labelled form controls"],
        ["add", "+ visible order total near payment action"],
        ["add", "+ inline errors and keyboard focus states"]
      ],
      before: `
        <div class="demo-stage checkout-old">
          <div class="old-store-head"><span>FIELD SUPPLY ONLINE STORE</span><div><button type="button" data-preview-control>LOGIN</button><button type="button" data-preview-control>CREATE ACCOUNT</button></div></div>
          <div class="warning-banner">You may lose your basket! Create an account before continuing.</div>
          <h3>CHECKOUT — STEP 2 OF 4</h3>
          <div class="old-form">
            <label>FIRST NAME*<input aria-label="First name example" value="Alex"></label><label>LAST NAME*<input aria-label="Last name example" value="Morgan"></label>
            <label>ADDRESS LINE 1*<input aria-label="Address example" value="18 River Street"></label><label>ADDRESS LINE 2<input aria-label="Second address example"></label>
            <label>CITY*<input aria-label="City example" value="Dublin"></label><label>COUNTY*<select aria-label="County example"><option>Select county</option></select></label>
            <label>PHONE NUMBER*<input aria-label="Phone example"></label><label>DATE OF BIRTH*<input aria-label="Birth date example"></label>
          </div>
          <div class="old-checks"><label><input type="checkbox"> Make an account for me</label><label><input type="checkbox" checked> Send daily offers</label></div>
          <div class="old-summary"><div><span>Subtotal</span><b>€84.00</b></div><div><span>Delivery calculated later</span><b>?</b></div></div>
          <button class="pay-old" type="button" data-preview-control>CONTINUE TO PAYMENT &gt;&gt;&gt;</button>
          <p class="tiny-note">By continuing you agree to all terms, future marketing and account creation.</p>
        </div>`,
      after: `
        <div class="demo-stage checkout-new">
          <div class="checkout-main">
            <div class="checkout-brand">Field Supply</div>
            <p class="checkout-step">Checkout · Payment</p>
            <h3>Complete your order</h3>
            <div class="clean-form">
              <label>Email<input aria-label="Email example" value="alex@example.com"></label>
              <label>Card number<input aria-label="Card number example" value="4242 4242 4242 4242"></label>
              <div class="form-row"><label>Expiry<input aria-label="Expiry example" value="08 / 29"></label><label>CVC<input aria-label="CVC example" value="123"></label></div>
              <label>Name on card<input aria-label="Name example" value="Alex Morgan"></label>
            </div>
            <button class="pay-new" type="button" data-preview-control>Pay €90.00</button>
            <div class="secure-note">Secure payment · Guest checkout · No account required</div>
          </div>
          <aside class="checkout-summary">
            <div class="product-line"><div class="product-thumb"></div><div><strong>Trail Pack 24L</strong><small>Forest · One size</small></div><b>€84</b></div>
            <div class="summary-lines"><div><span>Subtotal</span><span>€84.00</span></div><div><span>Delivery</span><span>€6.00</span></div><div class="total"><span>Total</span><span>€90.00</span></div></div>
          </aside>
        </div>`
    }
  };

  const elements = {
    tabs: $$(".scenario-tab"),
    runButton: $("#runAiify"),
    resetButton: $("#resetDemo"),
    applyButton: $("#applyAiify"),
    toggleButton: $("#toggleBeforeAfter"),
    viewChanges: $("#viewChanges"),
    closeChanges: $("#closeChangeLog"),
    preview: $("#sitePreview"),
    scanOverlay: $("#scanOverlay"),
    scanLabel: $("#scanLabel"),
    scanPercent: $("#scanPercent"),
    projectName: $("#projectName"),
    projectStatus: $("#projectStatus"),
    addressBar: $("#addressBar"),
    scoreChip: $("#scoreChip"),
    analysisEmpty: $("#analysisEmpty"),
    analysisRunning: $("#analysisRunning"),
    analysisResults: $("#analysisResults"),
    analysisComplete: $("#analysisComplete"),
    analysisProgress: $("#analysisProgress"),
    runningTitle: $("#runningTitle"),
    scanLog: $("#scanLog"),
    emptyTitle: $("#emptyTitle"),
    emptyText: $("#emptyText"),
    reportLabel: $("#reportLabel"),
    suggestionList: $("#suggestionList"),
    completeTitle: $("#completeTitle"),
    completeText: $("#completeText"),
    metricGrid: $("#metricGrid"),
    changeLog: $("#changeLog"),
    changeLogTitle: $("#changeLogTitle"),
    changeLogBody: $("#changeLogBody"),
    toast: $("#toast")
  };

  let activeKey = "coffee";
  let runToken = 0;
  let isRunning = false;
  let isApplied = false;
  let showingBefore = true;
  let toastTimer;

  function activeScenario() {
    return scenarios[activeKey];
  }

  function showOnly(target) {
    [elements.analysisEmpty, elements.analysisRunning, elements.analysisResults, elements.analysisComplete]
      .forEach((panel) => { panel.hidden = panel !== target; });
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 1500);
  }

  function renderPreview(mode) {
    const scenario = activeScenario();
    showingBefore = mode === "before";
    elements.preview.innerHTML = showingBefore ? scenario.before : scenario.after;
  }

  function renderLog(scenario) {
    elements.scanLog.innerHTML = scenario.stages
      .map((stage, index) => `<li data-step="${index}"><span>○</span>${stage[2]}</li>`)
      .join("");
  }

  function renderSuggestions(scenario) {
    elements.suggestionList.innerHTML = scenario.suggestions
      .map((item, index) => `
        <div class="suggestion">
          <span class="mono">${String(index + 1).padStart(2, "0")}</span>
          <div><strong>${item[0]}</strong><p>${item[1]}</p></div>
          <span class="mono">${item[2]}</span>
        </div>`)
      .join("");
    elements.reportLabel.textContent = `AIIFY REPORT / ${scenario.suggestions.length} FINDINGS`;
  }

  function renderMetrics(scenario) {
    elements.metricGrid.innerHTML = scenario.metrics
      .map((item) => `<div><span>${item[0]}</span><strong><del>${item[1]}</del>${item[2]}</strong></div>`)
      .join("");
  }

  function renderChangeLog(scenario) {
    elements.changeLogTitle.textContent = `${activeKey}.aiify.patch`;
    elements.changeLogBody.innerHTML = scenario.changes
      .map(([type, text]) => `<div class="diff-${type}">${text}</div>`)
      .join("");
  }

  function resetPanels() {
    const scenario = activeScenario();
    runToken += 1;
    isRunning = false;
    isApplied = false;
    showingBefore = true;

    elements.scanOverlay.classList.remove("active");
    elements.scanOverlay.setAttribute("aria-hidden", "true");
    elements.scanPercent.textContent = "0%";
    elements.analysisProgress.style.width = "0%";
    elements.changeLog.hidden = true;
    elements.projectStatus.textContent = "ready to scan";
    elements.scoreChip.textContent = scenario.initialScore;
    elements.scoreChip.classList.remove("complete");

    elements.runButton.hidden = false;
    elements.runButton.disabled = false;
    elements.runButton.innerHTML = '<span aria-hidden="true">✦</span> Run Aiify';
    elements.applyButton.disabled = false;
    elements.applyButton.innerHTML = 'Apply improvements <span aria-hidden="true">→</span>';
    elements.toggleButton.textContent = "Show before";

    $$("li", elements.scanLog).forEach((item) => {
      item.classList.remove("active", "done");
      $("span", item).textContent = "○";
    });

    showOnly(elements.analysisEmpty);
  }

  function setScenario(key, announce = false) {
    if (!scenarios[key]) return;
    activeKey = key;
    const scenario = activeScenario();

    elements.tabs.forEach((tab) => {
      const selected = tab.dataset.scenario === key;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
    });

    elements.projectName.textContent = scenario.name;
    elements.addressBar.textContent = scenario.address;
    elements.emptyTitle.textContent = scenario.emptyTitle;
    elements.emptyText.textContent = scenario.emptyText;
    elements.completeTitle.textContent = scenario.completeTitle;
    elements.completeText.textContent = scenario.completeText;

    renderPreview("before");
    renderLog(scenario);
    renderSuggestions(scenario);
    renderMetrics(scenario);
    renderChangeLog(scenario);
    resetPanels();

    if (announce) showToast(`${scenario.name} demo loaded`);
  }

  function setLogState(index) {
    $$("li", elements.scanLog).forEach((item, itemIndex) => {
      item.classList.toggle("active", itemIndex === index);
      item.classList.toggle("done", itemIndex < index);
      $("span", item).textContent = itemIndex < index ? "✓" : itemIndex === index ? "◉" : "○";
    });
  }

  async function runAnalysis() {
    if (isRunning || isApplied) return;
    isRunning = true;
    const token = ++runToken;
    const scenario = activeScenario();
    const progressPoints = [18, 43, 70, 92];

    elements.runButton.disabled = true;
    elements.runButton.innerHTML = '<span aria-hidden="true">◌</span> Analysing';
    elements.projectStatus.textContent = "analysis running";
    elements.scanOverlay.classList.add("active");
    elements.scanOverlay.setAttribute("aria-hidden", "false");
    showOnly(elements.analysisRunning);

    for (let index = 0; index < scenario.stages.length; index += 1) {
      if (token !== runToken) return;
      const [title, label] = scenario.stages[index];
      setLogState(index);
      elements.runningTitle.textContent = title;
      elements.scanLabel.textContent = label;
      elements.scanPercent.textContent = `${progressPoints[index]}%`;
      elements.analysisProgress.style.width = `${progressPoints[index]}%`;
      await wait(600);
    }

    if (token !== runToken) return;
    setLogState(scenario.stages.length);
    elements.scanLabel.textContent = "Analysis complete";
    elements.scanPercent.textContent = "100%";
    elements.analysisProgress.style.width = "100%";
    await wait(300);

    if (token !== runToken) return;
    elements.scanOverlay.classList.remove("active");
    elements.scanOverlay.setAttribute("aria-hidden", "true");
    elements.projectStatus.textContent = `${scenario.suggestions.length} improvements proposed`;
    elements.runButton.innerHTML = '<span aria-hidden="true">✓</span> Analysis ready';
    showOnly(elements.analysisResults);
    isRunning = false;
  }

  async function applyImprovements() {
    if (isRunning || isApplied) return;
    isRunning = true;
    const token = ++runToken;
    const scenario = activeScenario();
    const stages = [
      ["Preparing patch…", "24%"],
      ["Applying improvements…", "51%"],
      ["Running checks…", "79%"],
      ["Validating output…", "100%"]
    ];

    elements.applyButton.disabled = true;
    elements.applyButton.textContent = "Applying…";
    elements.scanOverlay.classList.add("active");
    elements.scanOverlay.setAttribute("aria-hidden", "false");

    for (const [label, percent] of stages) {
      if (token !== runToken) return;
      elements.scanLabel.textContent = label;
      elements.scanPercent.textContent = percent;
      await wait(500);
    }

    if (token !== runToken) return;
    renderPreview("after");
    elements.scanOverlay.classList.remove("active");
    elements.scanOverlay.setAttribute("aria-hidden", "true");
    elements.projectStatus.textContent = "upgrade applied";
    elements.scoreChip.textContent = scenario.finalScore;
    elements.scoreChip.classList.add("complete");
    elements.runButton.hidden = true;
    elements.toggleButton.textContent = "Show before";
    showOnly(elements.analysisComplete);
    isApplied = true;
    isRunning = false;
    showToast("Aiify upgrade applied");
  }

  function toggleBeforeAfter() {
    if (!isApplied || isRunning) return;
    const nextMode = showingBefore ? "after" : "before";
    renderPreview(nextMode);
    elements.toggleButton.textContent = showingBefore ? "Show after" : "Show before";
    elements.projectStatus.textContent = showingBefore ? "showing original" : "upgrade applied";
  }

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setScenario(tab.dataset.scenario, true));
  });
  elements.runButton.addEventListener("click", runAnalysis);
  elements.applyButton.addEventListener("click", applyImprovements);
  elements.resetButton.addEventListener("click", () => {
    setScenario(activeKey);
    showToast("Demo reset");
  });
  elements.toggleButton.addEventListener("click", toggleBeforeAfter);
  elements.viewChanges.addEventListener("click", () => { elements.changeLog.hidden = false; });
  elements.closeChanges.addEventListener("click", () => { elements.changeLog.hidden = true; });

  elements.preview.addEventListener("click", (event) => {
    const control = event.target.closest("a, button, [data-preview-control]");
    if (!control) return;
    event.preventDefault();
    event.stopPropagation();
    showToast("Example preview only");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.changeLog.hidden) elements.changeLog.hidden = true;
  });

  $("#year").textContent = new Date().getFullYear();
  setScenario(activeKey);
})();
