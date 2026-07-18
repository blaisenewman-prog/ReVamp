(() => {
  const CONTACT_EMAIL = 'blaisenewman@gmail.com';
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  const scenarios = {
    coffee: {
      name: 'Northstar Coffee',
      address: 'northstar-coffee.example',
      initialScore: 'UX 34',
      finalScore: 'UX 92',
      readyTitle: 'Review this interface.',
      readyText: 'PestoAi will measure hierarchy, mobile usability, accessibility and conversion clarity.',
      scan: [
        ['Mapping the customer journey', '18%'],
        ['Defining useful UX KPIs', '43%'],
        ['Reviewing mobile and accessibility', '71%'],
        ['Preparing the highest-impact changes', '96%']
      ],
      suggestions: [
        ['Clarify the main action', 'Replace competing buttons with one obvious path.', '+24'],
        ['Build a responsive layout', 'Remove the fixed desktop-only structure.', '+18'],
        ['Improve accessibility', 'Correct contrast, hierarchy and focus states.', '+13'],
        ['Strengthen customer trust', 'Make location, hours and purpose immediately clear.', '+9']
      ],
      completeTitle: 'A clearer, modern storefront.',
      completeText: 'The page is now responsive, focused and easier for a customer to understand and use.',
      metrics: [['UX score', '34', '92'], ['Accessibility', '51', '96'], ['Mobile ready', 'No', 'Yes'], ['Primary actions', '5', '1']],
      changes: [
        ['file', '@@ frontend/homepage @@'],
        ['remove', '- fixed-width desktop layout'],
        ['add', '+ responsive semantic grid'],
        ['remove', '- competing calls to action'],
        ['add', '+ one focused conversion path'],
        ['add', '+ accessible colour and focus system'],
        ['add', '+ clear location, hours and local context']
      ],
      before: `
        <div class="demo-stage legacy">
          <div class="legacy-header"><h4>NORTHSTAR COFFEE!!!</h4><div class="legacy-nav">HOME MENU ABOUT-US CONTACT</div></div>
          <div class="legacy-marquee">★★★★★ WELCOME TO THE BEST COFFEE IN TOWN! BREAKFAST ALL DAY! ★★★★★</div>
          <div class="legacy-main"><h3>FRESH COFFEE &amp; GOOD TIMES :)</h3><p>We have coffee, cakes and sandwiches. Please come visit us today!!!</p><span class="fake-legacy-button">CLICK HERE FOR MENU</span><div class="legacy-columns"><div><b>OPENING HOURS</b><br>Mon–Fri 7–6<br>Sat–Sun 8–5</div><div><b>FIND US</b><br>14 Market Lane<br>Dublin</div><div><b>CALL NOW</b><br>01 555 0198<br>THANK YOU</div></div></div>
          <div class="legacy-footer">Copyright 2013 Northstar Coffee — Best viewed on desktop</div>
        </div>`,
      after: `
        <div class="demo-stage coffee-new">
          <div class="coffee-nav"><div class="coffee-logo"><b>✦</b> Northstar</div><div class="coffee-links"><span>Menu</span><span>Our story</span><span>Visit</span></div><span class="coffee-order">Order ahead</span></div>
          <div class="coffee-hero"><div class="coffee-copy"><small>Independent coffee · Dublin</small><h3>Your morning, made better.</h3><p>Thoughtful coffee, warm pastries and a quiet corner in the middle of the city.</p><div class="coffee-actions"><span class="coffee-primary">Explore the menu</span><span class="coffee-secondary">Find our café ↗</span></div></div><div class="coffee-art" aria-hidden="true"><div class="coffee-cup"></div></div></div>
          <div class="coffee-bottom"><span>Open daily from 07:00</span><span>14 Market Lane, Dublin 2</span><span>Seasonal menu →</span></div>
        </div>`
    },
    queries: {
      name: 'Orders API',
      address: 'api.example/orders/482/items',
      initialScore: 'Perf 31',
      finalScore: 'Perf 94',
      readyTitle: 'Review this endpoint.',
      readyText: 'PestoAi will measure query count, latency, payload size and repeated work.',
      scan: [
        ['Mapping the request flow', '18%'],
        ['Counting database calls', '45%'],
        ['Finding repeated lookups', '72%'],
        ['Benchmarking a batch query', '96%']
      ],
      suggestions: [
        ['Remove the N+1 loop', 'Fetch every required item in one batch.', '−39 calls'],
        ['Preload the relationship', 'Avoid a second metadata lookup.', '−1 call'],
        ['Select required fields', 'Return only data used by the response.', '−42 KB'],
        ['Add a regression test', 'Protect the query count in CI.', 'guardrail']
      ],
      completeTitle: 'Forty-one calls became two.',
      completeText: 'The endpoint now batches item retrieval and returns less unused data.',
      metrics: [['DB calls', '41', '2'], ['p95 latency', '842ms', '118ms'], ['Payload', '96KB', '54KB'], ['Throughput', '72/s', '410/s']],
      changes: [
        ['file', '@@ api/orders/get_items.py @@'],
        ['remove', '- for item_id in order.item_ids:'],
        ['remove', '-   items.append(Item.get(item_id))'],
        ['add', "+ items = Item.where(id__in=order.item_ids)"],
        ['add', "+ items = items.select('id', 'name', 'price')"],
        ['file', '@@ tests/test_order_queries.py @@'],
        ['add', '+ assert_query_count(request, expected=2)']
      ],
      before: `
        <div class="demo-stage query-demo">
          <div class="query-title"><span>orders/get_items.py</span><span class="bad">41 queries · 842 ms</span></div>
          <div class="code-card"><div class="code-card-head">GET /orders/:id/items</div><div class="code-lines">
            <div class="code-line"><span class="line-no">01</span><span><span class="kw">def</span> <span class="fn">get_items</span>(order_id):</span></div>
            <div class="code-line"><span class="line-no">02</span><span>&nbsp;&nbsp;order = Order.get(order_id)</span></div>
            <div class="code-line"><span class="line-no">03</span><span>&nbsp;&nbsp;items = []</span></div>
            <div class="code-line problem"><span class="line-no">04</span><span>&nbsp;&nbsp;<span class="kw">for</span> item_id <span class="kw">in</span> order.item_ids:</span></div>
            <div class="code-line problem"><span class="line-no">05</span><span>&nbsp;&nbsp;&nbsp;&nbsp;items.append(Item.get(item_id))</span></div>
            <div class="code-line"><span class="line-no">06</span><span>&nbsp;&nbsp;<span class="kw">return</span> items</span></div>
          </div></div>
          <div class="query-stats"><div class="query-stat"><span>DATABASE CALLS</span><strong class="bad">41</strong></div><div class="query-stat"><span>P95 LATENCY</span><strong class="bad">842ms</strong></div><div class="query-stat"><span>PAYLOAD</span><strong>96KB</strong></div></div>
          <div class="trace"><div class="trace-row"><span>SELECT order</span><b>8ms</b></div><div class="trace-row"><span>SELECT item × 40</span><b>733ms</b></div><div class="trace-row"><span>serialize unused fields</span><b>101ms</b></div></div>
        </div>`,
      after: `
        <div class="demo-stage query-demo">
          <div class="query-title"><span>orders/get_items.py</span><span class="good">2 queries · 118 ms</span></div>
          <div class="code-card"><div class="code-card-head">GET /orders/:id/items</div><div class="code-lines">
            <div class="code-line"><span class="line-no">01</span><span><span class="kw">def</span> <span class="fn">get_items</span>(order_id):</span></div>
            <div class="code-line"><span class="line-no">02</span><span>&nbsp;&nbsp;order = Order.get(order_id)</span></div>
            <div class="code-line fixed"><span class="line-no">03</span><span>&nbsp;&nbsp;items = Item.where(id__in=order.item_ids)</span></div>
            <div class="code-line fixed"><span class="line-no">04</span><span>&nbsp;&nbsp;items = items.select(<span class="str">'id'</span>, <span class="str">'name'</span>, <span class="str">'price'</span>)</span></div>
            <div class="code-line"><span class="line-no">05</span><span>&nbsp;&nbsp;<span class="kw">return</span> items</span></div>
          </div></div>
          <div class="query-stats"><div class="query-stat"><span>DATABASE CALLS</span><strong class="good">2</strong></div><div class="query-stat"><span>P95 LATENCY</span><strong class="good">118ms</strong></div><div class="query-stat"><span>PAYLOAD</span><strong class="good">54KB</strong></div></div>
          <div class="trace"><div class="trace-row optimized"><span>SELECT order</span><b>8ms</b></div><div class="trace-row optimized"><span>SELECT items WHERE id IN (…)</span><b>74ms</b></div><div class="trace-row optimized"><span>serialize selected fields</span><b>36ms</b></div></div>
        </div>`
    },
    checkout: {
      name: 'Field Supply Checkout',
      address: 'fieldsupply.example/checkout',
      initialScore: 'Conv 42',
      finalScore: 'Conv 86',
      readyTitle: 'Review this checkout.',
      readyText: 'PestoAi will measure friction, form complexity, accessibility and customer confidence.',
      scan: [
        ['Mapping checkout steps', '20%'],
        ['Defining completion KPIs', '44%'],
        ['Testing form accessibility', '73%'],
        ['Preparing a cleaner flow', '96%']
      ],
      suggestions: [
        ['Reduce visible fields', 'Keep only the information required to pay.', '−5 fields'],
        ['Group related details', 'Create a clear sequence for delivery and payment.', '+clarity'],
        ['Improve labels and focus', 'Make the form keyboard and screen-reader friendly.', 'AA'],
        ['Make cost and security clear', 'Show the total beside the payment action.', '+trust']
      ],
      completeTitle: 'A shorter, clearer checkout.',
      completeText: 'The new flow removes unnecessary decisions and makes the payment action easier to trust.',
      metrics: [['Visible fields', '11', '6'], ['Completion', '42%', '68%'], ['Accessibility', '58', '95'], ['Average time', '4m 12s', '2m 03s']],
      changes: [
        ['file', '@@ checkout/form @@'],
        ['remove', '- repeated address and account fields'],
        ['add', '+ compact delivery and payment groups'],
        ['add', '+ persistent order summary'],
        ['add', '+ explicit labels and focus states'],
        ['add', '+ clear total and secure-payment note']
      ],
      before: `
        <div class="demo-stage checkout-old">
          <div class="old-store"><span>FIELD SUPPLY ONLINE SHOP</span><span>Cart | Account | Help</span></div>
          <div class="old-warning">IMPORTANT: Complete every field. Errors may reset this page.</div>
          <h3>CHECKOUT / CUSTOMER INFORMATION / PAYMENT</h3>
          <div class="old-form-grid">
            ${['Title','First name','Middle name','Last name','Company','Phone','Email','Address line 1','Address line 2','County','Postcode','Delivery note'].map(label => `<div class="old-field">${label}<div class="old-input"></div></div>`).join('')}
          </div>
          <div class="old-total"><span>TOTAL INCLUDING DELIVERY</span><b>€84.00</b></div><div class="old-pay">CONTINUE TO PAYMENT &gt;&gt;&gt;</div>
        </div>`,
      after: `
        <div class="demo-stage checkout-new">
          <div class="checkout-form"><div class="checkout-brand">Field Supply</div><p class="checkout-step">Checkout · Step 1 of 2</p><h3>Delivery details</h3><div class="clean-fields"><div class="clean-field">Full name<div class="clean-input"></div></div><div class="clean-field">Email address<div class="clean-input"></div></div><div class="clean-field">Street address<div class="clean-input"></div></div><div class="clean-row"><div class="clean-field">Town or city<div class="clean-input"></div></div><div class="clean-field">Postcode<div class="clean-input"></div></div></div></div><div class="clean-pay">Continue securely · €84.00</div><div class="secure-copy">Encrypted payment · You can review before paying</div></div>
          <aside class="order-summary"><div class="product"><span class="product-thumb"></span><span>Trail daypack<small>Forest green · 24L</small></span><b>€76</b></div><div class="summary"><div><span>Subtotal</span><b>€76</b></div><div><span>Delivery</span><b>€8</b></div><div class="total"><span>Total</span><b>€84</b></div></div></aside>
        </div>`
    }
  };

  const elements = {
    tabs: [...document.querySelectorAll('.scenario-tab')],
    projectName: document.querySelector('#projectName'),
    projectStatus: document.querySelector('#projectStatus'),
    scoreChip: document.querySelector('#scoreChip'),
    addressBar: document.querySelector('#addressBar'),
    preview: document.querySelector('#previewWrap'),
    run: document.querySelector('#runPestoAi'),
    reset: document.querySelector('#resetDemo'),
    apply: document.querySelector('#applyPestoAi'),
    empty: document.querySelector('#analysisEmpty'),
    running: document.querySelector('#analysisRunning'),
    results: document.querySelector('#analysisResults'),
    complete: document.querySelector('#analysisComplete'),
    emptyTitle: document.querySelector('#emptyTitle'),
    emptyText: document.querySelector('#emptyText'),
    runningTitle: document.querySelector('#runningTitle'),
    progress: document.querySelector('#analysisProgress'),
    scanLog: document.querySelector('#scanLog'),
    suggestions: document.querySelector('#suggestionList'),
    completeTitle: document.querySelector('#completeTitle'),
    completeText: document.querySelector('#completeText'),
    metrics: document.querySelector('#metricGrid'),
    toggle: document.querySelector('#toggleBeforeAfter'),
    viewChanges: document.querySelector('#viewChanges'),
    changeLog: document.querySelector('#changeLog'),
    changeLogBody: document.querySelector('#changeLogBody'),
    closeChangeLog: document.querySelector('#closeChangeLog'),
    overlay: document.querySelector('#scanOverlay'),
    scanLabel: document.querySelector('#scanLabel'),
    scanPercent: document.querySelector('#scanPercent'),
    toast: document.querySelector('#toast')
  };

  let currentKey = 'coffee';
  let phase = 'idle';
  let showingAfter = false;
  let runToken = 0;

  function showOnly(target) {
    [elements.empty, elements.running, elements.results, elements.complete].forEach(panel => { panel.hidden = panel !== target; });
  }

  function current() { return scenarios[currentKey]; }

  function renderPreview() {
    elements.preview.innerHTML = showingAfter ? current().after : current().before;
  }

  function renderScenario() {
    const scenario = current();
    phase = 'idle';
    showingAfter = false;
    runToken += 1;
    elements.projectName.textContent = scenario.name;
    elements.projectStatus.textContent = 'ready to review';
    elements.scoreChip.textContent = scenario.initialScore;
    elements.scoreChip.classList.remove('complete');
    elements.addressBar.textContent = scenario.address;
    elements.emptyTitle.textContent = scenario.readyTitle;
    elements.emptyText.textContent = scenario.readyText;
    elements.run.disabled = false;
    elements.run.innerHTML = '<span aria-hidden="true">✦</span> Run PestoAi';
    elements.apply.disabled = false;
    elements.apply.innerHTML = 'Apply improvements <span aria-hidden="true">→</span>';
    elements.progress.style.width = '0%';
    elements.overlay.classList.remove('active');
    elements.overlay.setAttribute('aria-hidden', 'true');
    elements.changeLog.hidden = true;
    elements.toggle.textContent = 'Show before';
    renderPreview();
    showOnly(elements.empty);
  }

  function setScenario(key) {
    if (!scenarios[key] || phase === 'running') return;
    currentKey = key;
    elements.tabs.forEach(tab => {
      const selected = tab.dataset.scenario === key;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
    });
    renderScenario();
  }

  function renderScanLog() {
    elements.scanLog.innerHTML = current().scan.map(([label], index) => `<li data-step="${index}"><span>○</span>${label}</li>`).join('');
  }

  async function runAnalysis() {
    if (phase === 'running') return;
    phase = 'running';
    showingAfter = false;
    renderPreview();
    const token = ++runToken;
    const scenario = current();
    elements.run.disabled = true;
    elements.run.innerHTML = '<span aria-hidden="true">◌</span> Analysing…';
    elements.projectStatus.textContent = 'analysis in progress';
    elements.overlay.classList.add('active');
    elements.overlay.setAttribute('aria-hidden', 'false');
    renderScanLog();
    showOnly(elements.running);

    const logItems = [...elements.scanLog.children];
    for (let i = 0; i < scenario.scan.length; i += 1) {
      if (token !== runToken) return;
      const [label, percent] = scenario.scan[i];
      elements.runningTitle.textContent = label;
      elements.scanLabel.textContent = label;
      elements.scanPercent.textContent = percent;
      elements.progress.style.width = percent;
      logItems.forEach((item, index) => {
        item.classList.toggle('active', index === i);
        if (index < i) {
          item.classList.add('done');
          item.querySelector('span').textContent = '✓';
        }
      });
      await wait(520);
    }

    if (token !== runToken) return;
    logItems.forEach(item => { item.classList.remove('active'); item.classList.add('done'); item.querySelector('span').textContent = '✓'; });
    elements.progress.style.width = '100%';
    elements.scanPercent.textContent = '100%';
    await wait(260);
    elements.overlay.classList.remove('active');
    elements.overlay.setAttribute('aria-hidden', 'true');
    elements.suggestions.innerHTML = scenario.suggestions.map(([title, text, impact], index) => `
      <div class="suggestion"><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${title}</strong><p>${text}</p></div><span class="impact-value">${impact}</span></div>`).join('');
    elements.projectStatus.textContent = `${scenario.suggestions.length} improvements proposed`;
    elements.run.innerHTML = '<span aria-hidden="true">✓</span> Analysis ready';
    phase = 'results';
    showOnly(elements.results);
  }

  async function applyImprovements() {
    if (phase !== 'results') return;
    phase = 'running';
    const token = ++runToken;
    elements.apply.disabled = true;
    elements.apply.textContent = 'Applying improvements…';
    elements.overlay.classList.add('active');
    elements.overlay.setAttribute('aria-hidden', 'false');

    const stages = [['Preparing the change…', '28%'], ['Applying improvements…', '61%'], ['Checking the agreed KPIs…', '87%'], ['Ready for review', '100%']];
    for (const [label, percent] of stages) {
      if (token !== runToken) return;
      elements.scanLabel.textContent = label;
      elements.scanPercent.textContent = percent;
      await wait(430);
    }

    if (token !== runToken) return;
    showingAfter = true;
    renderPreview();
    elements.overlay.classList.remove('active');
    elements.overlay.setAttribute('aria-hidden', 'true');
    const scenario = current();
    elements.projectStatus.textContent = 'improvement applied';
    elements.scoreChip.textContent = scenario.finalScore;
    elements.scoreChip.classList.add('complete');
    elements.completeTitle.textContent = scenario.completeTitle;
    elements.completeText.textContent = scenario.completeText;
    elements.metrics.innerHTML = scenario.metrics.map(([label, before, after]) => `<div class="metric"><span>${label}</span><strong><del>${before}</del> → ${after}</strong></div>`).join('');
    elements.toggle.textContent = 'Show before';
    elements.apply.disabled = false;
    phase = 'complete';
    showOnly(elements.complete);
    showToast('PestoAi improvement applied');
  }

  function togglePreview() {
    if (phase !== 'complete') return;
    showingAfter = !showingAfter;
    renderPreview();
    elements.toggle.textContent = showingAfter ? 'Show before' : 'Show improved';
  }

  function renderChanges() {
    elements.changeLogBody.innerHTML = `<div class="diff">${current().changes.map(([type, line]) => `<div class="diff-${type}">${line}</div>`).join('')}</div>`;
    elements.changeLog.hidden = false;
    elements.changeLog.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function resetDemo() {
    renderScenario();
    showToast('Demo reset');
  }

  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2200);
  }

  elements.tabs.forEach(tab => tab.addEventListener('click', () => setScenario(tab.dataset.scenario)));
  elements.run.addEventListener('click', runAnalysis);
  elements.apply.addEventListener('click', applyImprovements);
  elements.reset.addEventListener('click', resetDemo);
  elements.toggle.addEventListener('click', togglePreview);
  elements.viewChanges.addEventListener('click', renderChanges);
  elements.closeChangeLog.addEventListener('click', () => { elements.changeLog.hidden = true; });

  // About and pricing dialog
  const dialog = document.querySelector('#aboutDialog');
  document.querySelectorAll('[data-open-dialog="aboutDialog"]').forEach(button => button.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });

  // Mobile navigation
  const menuButton = document.querySelector('#menuButton');
  const mobileMenu = document.querySelector('#mobileMenu');
  menuButton.addEventListener('click', () => {
    const open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  mobileMenu.addEventListener('click', event => {
    if (event.target.matches('a, button')) {
      mobileMenu.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }
  });

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      return copied;
    }
  }

  function gmailComposeUrl(subject, body) {
    const params = new URLSearchParams({ view: 'cm', fs: '1', to: CONTACT_EMAIL, su: subject, body });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }

  // One-page redesign generator. The OpenAI key stays in the PHP backend.
  const generatorForm = document.querySelector('#siteGeneratorForm');
  const generatorStatus = document.querySelector('#generatorStatus');
  const generatorSubmit = generatorForm.querySelector('button[type="submit"]');
  const generatorEmpty = document.querySelector('#generatorEmpty');
  const generatorPreview = document.querySelector('#generatorPreview');
  const generatedFrame = document.querySelector('#generatedSiteFrame');
  const generatedCode = document.querySelector('#generatedCode');
  const generatedCodeContent = generatedCode.querySelector('code');
  const generatedName = document.querySelector('#generatedFileName');
  const generatorUsage = document.querySelector('#generatorUsage');
  const viewGeneratedHtml = document.querySelector('#viewGeneratedHtml');
  const downloadGeneratedHtml = document.querySelector('#downloadGeneratedHtml');
  let latestGeneratedHtml = '';
  let latestGeneratedHost = 'site';

  generatorForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!generatorForm.reportValidity()) return;
    const data = new FormData(generatorForm);
    if (data.get('company_website')) return;

    generatorSubmit.disabled = true;
    generatorSubmit.textContent = 'Reading and redesigning…';
    generatorStatus.textContent = 'Reading the public page and preparing one standalone index.html.';
    generatorStatus.className = 'generator-status';
    generatorPreview.hidden = true;
    generatorEmpty.hidden = false;

    try {
      const response = await fetch(generatorForm.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.html) {
        throw new Error(result.message || 'Sorry, this feature is coming soon.');
      }

      latestGeneratedHtml = result.html;
      latestGeneratedHost = result.host || 'site';
      generatedName.textContent = `${latestGeneratedHost}/index.html`;
      generatedFrame.srcdoc = latestGeneratedHtml;
      generatedCodeContent.textContent = latestGeneratedHtml;
      generatedCode.hidden = true;
      generatedFrame.hidden = false;
      viewGeneratedHtml.textContent = 'View HTML';
      generatorUsage.textContent = result.usage
        ? `${result.usage.output_tokens || 0} output tokens · ${result.model || 'OpenAI model'} · 6,000 token cap`
        : `Generated with ${result.model || 'OpenAI'} · 6,000 token cap`;
      generatorEmpty.hidden = true;
      generatorPreview.hidden = false;
      generatorStatus.textContent = 'Redesign ready. Review the preview or download index.html.';
      generatorStatus.className = 'generator-status success';
      showToast('Website redesign generated');
    } catch (error) {
      generatorStatus.textContent = error.message;
      generatorStatus.className = 'generator-status error';
    } finally {
      generatorSubmit.disabled = false;
      generatorSubmit.innerHTML = 'Generate redesign <span aria-hidden="true">✦</span>';
    }
  });

  viewGeneratedHtml.addEventListener('click', () => {
    const showingCode = !generatedCode.hidden;
    generatedCode.hidden = showingCode;
    generatedFrame.hidden = !showingCode;
    viewGeneratedHtml.textContent = showingCode ? 'View HTML' : 'View preview';
  });

  downloadGeneratedHtml.addEventListener('click', () => {
    if (!latestGeneratedHtml) return;
    const blob = new Blob([latestGeneratedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  // Review form: send through the PHP backend and provide a reliable Gmail/copy fallback.
  const form = document.querySelector('#reviewForm');
  const formStatus = document.querySelector('#formStatus');
  const submitButton = form.querySelector('button[type="submit"]');
  const formFallback = document.querySelector('#formFallback');
  const openGmailFallback = document.querySelector('#openGmailFallback');
  const copySubmission = document.querySelector('#copySubmission');
  let latestSubmissionText = '';

  function buildSubmission(data) {
    const company = data.get('company') || 'Not provided';
    const subject = `PestoAi review request — ${data.get('company') || data.get('name')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Company: ${company}`,
      `Website / repository: ${data.get('project_url')}`,
      '',
      'Problem to review:',
      data.get('problem')
    ].join('\n');
    return { subject, body };
  }

  document.querySelector('#copyEmail').addEventListener('click', async () => {
    const copied = await copyText(CONTACT_EMAIL);
    showToast(copied ? 'Email address copied' : CONTACT_EMAIL);
  });

  copySubmission.addEventListener('click', async () => {
    const copied = await copyText(latestSubmissionText);
    showToast(copied ? 'Message details copied' : 'Copy was unavailable');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('website')) return;
    const submission = buildSubmission(data);
    latestSubmissionText = `${submission.subject}\n\n${submission.body}`;
    openGmailFallback.href = gmailComposeUrl(submission.subject, submission.body);
    formFallback.hidden = true;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'The form could not be sent.');
      form.reset();
      formStatus.textContent = 'Received. We will review it and get back in touch.';
      formStatus.className = 'form-status success';
      showToast('Review request sent');
    } catch (error) {
      formStatus.textContent = `${error.message} You can still open the prepared message in Gmail or copy it below.`;
      formStatus.className = 'form-status error';
      formFallback.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send for review <span aria-hidden="true">→</span>';
    }
  });

  document.querySelector('#year').textContent = new Date().getFullYear();
  renderScenario();
})();
