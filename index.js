require('dotenv').config();
const express = require('express');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

const activities = new Map();

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// ── GET / ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Classroom Activity Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --accent:    #b5541e;
      --accent-dk: #8f3f12;
      --cream:     #faf7f2;
      --paper:     #fffcf7;
      --ink:       #2a1f14;
      --muted:     #7a6a5a;
      --border:    #e2d9cf;
      --field-bg:  #fff9f3;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--cream);
      background-image:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(181,84,30,0.07) 0%, transparent 70%);
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
    }

    /* ── hero ── */
    .hero {
      text-align: center;
      padding: 3.5rem 1.5rem 2rem;
    }
    .hero-eyebrow {
      display: inline-block;
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(181,84,30,0.08);
      border: 1px solid rgba(181,84,30,0.18);
      border-radius: 999px;
      padding: 0.25rem 0.85rem;
      margin-bottom: 1.1rem;
    }
    .hero h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(1.75rem, 5vw, 2.6rem);
      font-weight: 600;
      line-height: 1.22;
      color: var(--ink);
      margin: 0 auto 0.75rem;
      max-width: 600px;
    }
    .hero h1 em {
      font-style: italic;
      color: var(--accent);
    }
    .hero-tagline {
      font-size: 0.95rem;
      color: var(--muted);
      max-width: 440px;
      margin: 0 auto 0;
      line-height: 1.6;
    }

    /* ── form card ── */
    .card-wrap {
      display: flex;
      justify-content: center;
      padding: 1.5rem 1rem 4rem;
    }
    .card {
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 2.25rem 2.5rem;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 2px 24px rgba(42,31,20,0.06);
    }
    .card-title {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--ink);
      margin: 0 0 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .field { margin-bottom: 1.2rem; }
    label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.4rem;
    }
    label .opt {
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      color: #b0a090;
      font-size: 0.78rem;
    }
    input[type=text], textarea {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: var(--ink);
      background: var(--field-bg);
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
      resize: vertical;
    }
    input[type=text]:focus, textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(181,84,30,0.12);
    }
    input::placeholder, textarea::placeholder { color: #c4b5a5; }
    .divider {
      border: none;
      border-top: 1px dashed var(--border);
      margin: 1.5rem 0;
    }
    button {
      width: 100%;
      padding: 0.8rem 1rem;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    button:hover { background: var(--accent-dk); }
    button:active { transform: scale(0.98); }

    /* ── shared site nav ── */
    .site-nav {
      border-bottom: 1px solid var(--border);
      background: var(--paper);
    }
    .site-nav-inner {
      max-width: 820px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-link {
      display: inline-block;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--muted);
      text-decoration: none;
      padding: 0.75rem 0.85rem;
      border-bottom: 2px solid transparent;
      letter-spacing: 0.01em;
      transition: color 0.15s, border-color 0.15s;
    }
    .nav-link:hover { color: var(--accent); }
    .nav-link--active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    /* ── footer ── */
    .site-footer {
      text-align: center;
      font-size: 0.75rem;
      color: #b0a090;
      padding: 0 1rem 2rem;
    }

    @media (max-width: 480px) {
      .card { padding: 1.75rem 1.25rem; }
      .hero { padding: 2.5rem 1rem 1.5rem; }
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <div class="site-nav-inner">
      <a href="/" class="nav-link nav-link--active">Generate</a>
      <a href="/about" class="nav-link">Why This Exists</a>
    </div>
  </nav>

  <div class="hero">
    <span class="hero-eyebrow">AI-Powered Lesson Design</span>
    <h1>One framework.<br><em>Any classroom. Anywhere on Earth.</em></h1>
    <p class="hero-tagline">Quality teaching activities for every subject, every resource level, wherever you teach.</p>
  </div>

  <div class="card-wrap">
    <div class="card">
      <p class="card-title">Design a new activity</p>
      <form method="POST" action="/generate">
        <div class="field">
          <label for="subject">Subject</label>
          <input type="text" id="subject" name="subject" placeholder="e.g. Mathematics, Science, History" required />
        </div>
        <div class="field">
          <label for="topic">Topic</label>
          <input type="text" id="topic" name="topic" placeholder="e.g. Fractions and decimals" required />
        </div>
        <hr class="divider" />
        <div class="field">
          <label for="cross_curricular">Cross-curricular connection <span class="opt">(optional)</span></label>
          <input type="text" id="cross_curricular" name="cross_curricular" placeholder="e.g. Art, Science, Local history" />
        </div>
        <div class="field">
          <label for="context">Classroom context <span class="opt">(optional)</span></label>
          <textarea id="context" name="context" rows="3" placeholder="e.g. Grade 4, 30 students, limited materials, outdoor setting"></textarea>
        </div>
        <button type="submit">Generate Activity ✦</button>
      </form>
    </div>
  </div>

  <p class="site-footer">Powered by IBM Bob &nbsp;·&nbsp; Built for educators everywhere</p>
</body>
</html>`);
});


// ── GET /about ────────────────────────────────────────────────────────────────
app.get('/about', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Why This Exists — Classroom Activity Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --accent:    #b5541e;
      --accent-dk: #8f3f12;
      --cream:     #faf7f2;
      --paper:     #fffcf7;
      --ink:       #2a1f14;
      --muted:     #7a6a5a;
      --border:    #e2d9cf;
      --stripe:    #faf4ec;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--cream);
      background-image:
        radial-gradient(ellipse 80% 40% at 50% -5%, rgba(181,84,30,0.06) 0%, transparent 65%);
      margin: 0;
      color: var(--ink);
      line-height: 1.75;
    }

    /* ── nav ── */
    .site-nav {
      border-bottom: 1px solid var(--border);
      background: var(--paper);
    }
    .site-nav-inner {
      max-width: 820px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-link {
      display: inline-block;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--muted);
      text-decoration: none;
      padding: 0.75rem 0.85rem;
      border-bottom: 2px solid transparent;
      letter-spacing: 0.01em;
      transition: color 0.15s, border-color 0.15s;
    }
    .nav-link:hover { color: var(--accent); }
    .nav-link--active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    /* ── layout ── */
    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 3.5rem 1.5rem 5rem;
    }

    /* ── hero ── */
    .about-hero {
      margin-bottom: 3.5rem;
    }
    .about-eyebrow {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(181,84,30,0.08);
      border: 1px solid rgba(181,84,30,0.18);
      border-radius: 999px;
      padding: 0.25rem 0.85rem;
      margin-bottom: 1rem;
    }
    .about-hero h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(1.6rem, 4vw, 2.3rem);
      font-weight: 600;
      line-height: 1.25;
      color: var(--ink);
      margin: 0 0 1rem;
      max-width: 640px;
    }
    .about-hero h1 em { font-style: italic; color: var(--accent); }
    .about-hero p {
      font-size: 1rem;
      color: var(--muted);
      max-width: 560px;
      margin: 0;
      line-height: 1.7;
    }

    /* ── sdg block ── */
    .sdg-block {
      background: var(--paper);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: 10px;
      padding: 1.75rem 2rem;
      margin-bottom: 3rem;
    }
    .sdg-block blockquote {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.1rem;
      font-style: italic;
      color: var(--ink);
      margin: 0 0 1.25rem;
      line-height: 1.55;
    }
    .sdg-block blockquote cite {
      display: block;
      font-style: normal;
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent);
      margin-top: 0.6rem;
    }
    .sdg-targets {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .sdg-targets li {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.9rem;
      color: var(--ink);
      line-height: 1.55;
    }
    .sdg-tag {
      flex-shrink: 0;
      background: rgba(181,84,30,0.1);
      color: var(--accent-dk);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      border-radius: 4px;
      padding: 0.18rem 0.45rem;
      margin-top: 0.18rem;
    }

    /* ── section headings ── */
    .section-heading {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--ink);
      margin: 0 0 1.5rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border);
    }

    /* ── example cards ── */
    .example-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3.5rem;
    }
    .example-card {
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem 1.6rem;
      box-shadow: 0 1px 12px rgba(42,31,20,0.05);
    }
    .example-card-flag {
      font-size: 1.4rem;
      margin-bottom: 0.5rem;
      line-height: 1;
    }
    .example-card-country {
      font-family: 'Lora', Georgia, serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--ink);
      margin: 0 0 0.5rem;
    }
    .example-card p {
      font-size: 0.875rem;
      color: var(--muted);
      margin: 0;
      line-height: 1.6;
    }
    .example-card-tag {
      display: inline-block;
      margin-top: 0.85rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(181,84,30,0.08);
      border-radius: 4px;
      padding: 0.18rem 0.5rem;
    }

    /* ── how it works ── */
    .how-section {
      margin-bottom: 3.5rem;
    }
    .how-steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .how-step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .how-step-num {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: rgba(181,84,30,0.1);
      color: var(--accent);
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.1rem;
    }
    .how-step-text {
      font-size: 0.93rem;
      color: var(--ink);
      line-height: 1.65;
    }
    .how-step-text strong { color: var(--ink); }

    /* ── CTA ── */
    .cta-section {
      text-align: center;
      padding: 2.5rem 1rem;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 14px;
    }
    .cta-section h2 {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--ink);
      margin: 0 0 0.5rem;
    }
    .cta-section p {
      font-size: 0.9rem;
      color: var(--muted);
      margin: 0 0 1.5rem;
    }
    .cta-btn {
      display: inline-block;
      padding: 0.8rem 2rem;
      background: var(--accent);
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: background 0.15s, transform 0.1s;
    }
    .cta-btn:hover { background: var(--accent-dk); }
    .cta-btn:active { transform: scale(0.98); }

    /* ── footer ── */
    .site-footer {
      text-align: center;
      font-size: 0.75rem;
      color: #b0a090;
      padding-top: 2rem;
    }

    @media (max-width: 600px) {
      .page { padding: 2rem 1rem 4rem; }
      .site-nav-inner { padding: 0 1rem; }
      .sdg-block { padding: 1.25rem 1.25rem; }
      .example-cards { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <div class="site-nav-inner">
      <a href="/" class="nav-link">Generate</a>
      <a href="/about" class="nav-link nav-link--active">Why This Exists</a>
    </div>
  </nav>

  <div class="page">

    <!-- Hero -->
    <div class="about-hero">
      <span class="about-eyebrow">Mission &amp; Purpose</span>
      <h1>Education belongs to<br><em>every classroom on Earth.</em></h1>
      <p>This tool exists because great teaching should not depend on where you happen to be born, what equipment your school can afford, or whether you have reliable internet. It is built around one belief: structure travels.</p>
    </div>

    <!-- SDG 4 -->
    <div class="sdg-block">
      <blockquote>
        "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all."
        <cite>UN Sustainable Development Goal 4</cite>
      </blockquote>
      <ul class="sdg-targets">
        <li>
          <span class="sdg-tag">4.1</span>
          <span>Universal access — every child, regardless of location or income, should complete free, equitable, quality primary and secondary education.</span>
        </li>
        <li>
          <span class="sdg-tag">4.5</span>
          <span>Eliminating disparities — close gaps in access and outcomes for the vulnerable: girls, children with disabilities, indigenous peoples, and those in conflict-affected areas, without depending on expensive resources.</span>
        </li>
        <li>
          <span class="sdg-tag">4.7</span>
          <span>Global citizenship and cross-cultural learning — education that builds understanding between cultures, promotes sustainable development, and values diverse knowledge traditions everywhere.</span>
        </li>
      </ul>
    </div>

    <!-- Same tool, different worlds -->
    <div style="margin-bottom: 3.5rem;">
      <h2 class="section-heading">Same tool, different worlds</h2>
      <div class="example-cards">
        <div class="example-card">
          <div class="example-card-flag">🇳🇬</div>
          <p class="example-card-country">Northern Nigeria</p>
          <p>A history teacher designs an activity around local mud-brick architecture and traditional pottery — no screens, no lab, no internet required. Students map trade routes using materials found in their own compound.</p>
          <span class="example-card-tag">Zero-tech classroom</span>
        </div>
        <div class="example-card">
          <div class="example-card-flag">🇳🇱</div>
          <p class="example-card-country">Netherlands</p>
          <p>A computer-science class uses GPU-accelerated AI tools to analyse language patterns in ancient Icelandic sagas — cross-curricular literature and machine learning, fully resourced and research-grade.</p>
          <span class="example-card-tag">High-resource lab</span>
        </div>
        <div class="example-card">
          <div class="example-card-flag">🇦🇱</div>
          <p class="example-card-country">Albania</p>
          <p>A maths teacher connects geometry and measurement to Ottoman-era bridge construction in the Balkans — grounding abstract concepts in regional history students already know and feel proud of.</p>
          <span class="example-card-tag">Place-based learning</span>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="how-section">
      <h2 class="section-heading">How it works</h2>
      <div class="how-steps">
        <div class="how-step">
          <div class="how-step-num">1</div>
          <div class="how-step-text"><strong>You describe your lesson.</strong> Enter a subject, a topic, and any cross-curricular links or classroom context — grade level, available materials, setting.</div>
        </div>
        <div class="how-step">
          <div class="how-step-num">2</div>
          <div class="how-step-text"><strong>The tool generates a complete structured template.</strong> You get a narrative hook, a timed phase plan, a materials list, step-by-step instructions, reflection questions, and an assessment rubric — all in one place.</div>
        </div>
        <div class="how-step">
          <div class="how-step-num">3</div>
          <div class="how-step-text"><strong>You adapt it to your classroom.</strong> Every activity includes clearly marked customisation zones — <em>📷 insert your own image, ✏️ add a teacher note, 📝 attach your worksheet</em> — so the template fits your actual context, not a hypothetical one.</div>
        </div>
        <div class="how-step">
          <div class="how-step-num">4</div>
          <div class="how-step-text"><strong>Nothing is locked in.</strong> The output is plain text you can copy, edit, print, or translate. No account required, no proprietary format, no dependency.</div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="cta-section">
      <h2>Ready to build something?</h2>
      <p>Design a classroom activity in under a minute — for any subject, any grade, any context.</p>
      <a href="/" class="cta-btn">Generate an Activity ✦</a>
    </div>

    <p class="site-footer">Powered by IBM Bob &nbsp;·&nbsp; Built for educators everywhere</p>
  </div>
</body>
</html>`);
});


// ── Bob runner ────────────────────────────────────────────────────────────────
function runBob(prompt, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'bob',
      ['run', '--accept-license', '-f', 'json', '--disable-tool-groups', 'subagent,mcp', '--max-turns', '5', prompt],
      { env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(Object.assign(new Error('timeout'), { killed: true }));
    }, timeoutMs);
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(Object.assign(new Error('non-zero exit'), { code, stderr }));
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// ── POST /generate ─────────────────────────────────────────────────────────────
app.post('/generate', async (req, res) => {
  const { subject, topic, cross_curricular, context } = req.body;

  const prompt = buildPrompt({ subject, topic, cross_curricular, context });

  try {
    const { stdout } = await runBob(prompt, 60000);

    // Find the last result-type line; also capture any non-result typed line as a fallback signal
    let parsed = null;
    let lastTypedLine = null;
    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'result') parsed = obj;
        if (obj.type) lastTypedLine = obj;
      } catch { /* skip */ }
    }

    // No JSON at all — genuine parse failure
    if (!parsed && !lastTypedLine) {
      return res.status(502).send(errorPage(
        'Bob returned output that could not be parsed as JSON. ' +
        'Raw output: ' + stdout.slice(0, 300)
      ));
    }

    // Got a typed line but no result — treat as a content/safety refusal
    if (!parsed) {
      return res.status(422).send(refusalPage());
    }

    let raw = parsed.last_message;
    if (typeof raw !== 'string' || !raw.trim()) {
      // last_message absent or empty — check for refusal signals in any text fields
      const responseText = JSON.stringify(lastTypedLine || parsed);
      const refusalSignals = [
        'unable to', 'cannot ', "can't ", 'i apologize', 'inappropriate',
        'harmful', 'not able to', 'refuse', 'sorry',
      ];
      const looksLikeRefusal = refusalSignals.some(s => responseText.toLowerCase().includes(s));
      if (looksLikeRefusal) return res.status(422).send(refusalPage());
      return res.status(502).send(errorPage(
        'Bob response did not contain a "last_message" field. ' +
        'Keys received: ' + Object.keys(parsed).join(', ')
      ));
    }

    // Self-critique pass — revise the activity using a second Bob call
    try {
      const { stdout: critiqueStdout } = await runBob(buildCritiquePrompt(raw), 90000);
      let critiqueResult = null;
      for (const line of critiqueStdout.split('\n')) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.type === 'result') critiqueResult = obj;
        } catch { /* skip */ }
      }
      if (critiqueResult && typeof critiqueResult.last_message === 'string') {
        const markerRe = /===FINAL_ACTIVITY_START===\n([\s\S]*?)\n===FINAL_ACTIVITY_END===/;
        const markerMatch = critiqueResult.last_message.match(markerRe);
        if (markerMatch && markerMatch[1].trim()) {
          raw = markerMatch[1].trim();
        } else {
          console.error('Self-critique step failed, using original activity:', 'markers not found');
        }
      } else {
        console.error('Self-critique step failed, using original activity:', 'no result-type line or last_message missing');
      }
    } catch (critiqueErr) {
      console.error('Self-critique step failed, using original activity:', critiqueErr.message || 'unknown error');
    }

    // Extract the Flowchart section's mermaid block, then remove it from main markdown
    let mermaidCode = '';
    const flowchartSectionRe = /##[^\n]*Flowchart[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i;
    const mermaidBlockRe = /```mermaid\n([\s\S]*?)```/;
    const sectionMatch = raw.match(flowchartSectionRe);
    if (sectionMatch) {
      const blockMatch = sectionMatch[1].match(mermaidBlockRe);
      if (blockMatch) mermaidCode = blockMatch[1].trim();
    }
    // Remove the entire Flowchart section (heading + content) from main markdown
    const mainMarkdown = raw.replace(/\n?##[^\n]*Flowchart[^\n]*\n[\s\S]*?(?=\n##\s|$)/i, '').trim();

    const id = randomUUID();
    activities.set(id, { subject, topic, cross_curricular, context, mainMarkdown, mermaidCode });

    return res.redirect(303, '/activity/' + id);
  } catch (err) {
    const isTimeout = err.killed === true;
    const message = isTimeout
      ? 'Bob CLI timed out after 60 seconds. Try again or simplify your prompt.'
      : (err.stderr ? err.stderr.trim() : err.message);
    return res.status(502).send(errorPage(message));
  }
});

// ── GET /activity/:id ─────────────────────────────────────────────────────────
app.get('/activity/:id', (req, res) => {
  const activity = activities.get(req.params.id);
  if (!activity) return res.status(404).send(errorPage('Activity not found. It may have expired — please generate a new one.'));
  const { subject, topic, cross_curricular, context, mainMarkdown, mermaidCode } = activity;
  const activityHtml = markdownToHtml(mainMarkdown);
  res.send(resultPage({ id: req.params.id, subject, topic, cross_curricular, context, activityHtml, hasMermaid: !!mermaidCode }));
});

// ── GET /activity/:id/flowchart ───────────────────────────────────────────────
app.get('/activity/:id/flowchart', (req, res) => {
  const activity = activities.get(req.params.id);
  if (!activity) return res.status(404).send(errorPage('Activity not found. It may have expired — please generate a new one.'));
  const { subject, topic, mermaidCode } = activity;
  res.send(flowchartPage({ id: req.params.id, subject, topic, mermaidCode }));
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildCritiquePrompt(rawMarkdown) {
  return `You are reviewing a teaching activity you just generated, acting as a strict but fair quality reviewer. Check it against exactly these 6 patterns — nothing else. These patterns were identified from a real QA audit of prior activities.

CRITICAL RULE — READ THIS FIRST:
You must NEVER invent, generate, or fabricate a specific citation — no author names, book titles, publisher names, journal names, or publication years — for any reason, even when a fix below calls for "sourcing" a number or resolving a factual disagreement. You cannot reliably verify from memory whether a specific citation is real. A fabricated citation that looks authoritative is a worse defect than an unsourced or unresolved number, because a teacher is likely to trust and repeat it. Where a fix calls for sourcing or fact-resolution, use the safe remediation patterns described below — never a specific invented reference, and never a fabricated "correct fact" you are not genuinely confident about.

THE 6 CHECKS:

1. DATA SOURCING — Any specific numeric figure, statistic, or data table (percentages, yields, physical constants, contested historical figures presented as precise data) must be handled safely if unsourced. This does NOT mean inventing a citation. The correct fix is one of:
   (a) If the number is a well-established, uncontested physical constant or universally taught figure (e.g., g = 9.8 m/s², freezing point of water), no citation is needed at all — leave it as is.
   (b) If the number is a contested, estimated, or historically debated figure (casualty counts, displacement estimates, economic statistics, etc.), do NOT add a fake citation. Instead, add a brief qualifying phrase acknowledging the estimate's uncertainty (e.g., "estimates vary across sources due to incomplete historical records") AND/OR insert an explicit placeholder flag such as: "⚠️ [TEACHER: verify this figure against a current, reputable source before class]".
   A number that is contested and stated with false precision, with no qualifier and no verify-flag, is the defect to catch — the fix is the qualifier/flag, never an invented source.

2. FALSE BINARY — If the activity involves a social, historical, or ethical topic with a chart, categorization, rubric criterion, or framing that splits people's choices/experiences/positions into exactly two opposing categories (e.g., "Collaborate vs. Resist," "Winners vs. Losers," or a rubric that only rewards fully committing to one of two assigned debate sides), check whether real-world nuance is being flattened anywhere in the document — including inside rubrics and role/team structures, not just narrative framing. Do NOT flag a binary that is factually inherent to the real-world subject matter itself (e.g., a criminal trial's Guilty/Not-Guilty verdict structure is not a false binary — that is how trials actually work). If a genuine false binary is found, the fix must be applied AT THE SPECIFIC LOCATION where the binary is structurally enforced — not a general teacher suggestion elsewhere in the document.

3. SCOPE VS. TIMELINE — If the activity's step count, discipline count and/or content depth is significantly more ambitious than its stated total time allows (e.g., 5+ substantial phases packed into a single 50-60 min period, or 4+ academic disciplines integrated in one sitting), flag it. The fix is either trimming scope or explicitly recommending a multi-day/multi-period structure.

4. RUBRIC WITHOUT EXEMPLARS — If the Assessment Rubric uses subjective/qualitative level descriptors WITHOUT at least one concrete example or observable indicator per level, flag it. The fix is adding one concrete, observable indicator per rubric level. This must describe observable student behavior/output, not invented facts or sources.

5. NO OPT-OUT FOR PUBLIC PERFORMANCE — If the activity requires any student to perform, present, speak, or be evaluated in front of the class/peers, check whether there is an explicit alternative or opt-out option INTEGRATED INTO the actual role/task assignment step (not just mentioned as an optional idea in a Customization Zones appendix). If none exists in the actual assignment step, flag it.

6. INTERNAL CONSISTENCY — Follow this exact two-stage procedure. Do not skip to judgment; the extraction step is mandatory and must be done first, in writing, before you evaluate anything.

   STAGE A — EXTRACT: Read through the entire document one section at a time (Hook, Timeline, Materials, Step-by-Step Instructions, Reflection Questions, Assessment Rubric, Customization Zones). For each section, write a numbered list of every specific factual, procedural, definitional, or rule-based claim it makes. Preserve the exact qualifying words, purpose clauses, and modifiers in each claim (e.g., words like "arguing for," "requires," "must," "in order to") rather than compressing them away — these words often carry the entire meaning that makes a claim comparable to another. Include the section name and a short quote or close paraphrase for each claim.

   STAGE B — COMPARE: Take your extracted list from Stage A and systematically compare every claim against every OTHER claim that touches the same underlying topic, rule, standard, or concept (even if worded differently). Ask for each pair on the same topic: "If claim 1 is true, can claim 2 also be true at the same time, in the real world this activity is teaching about?" If the honest answer is no, that is a contradiction, even if neither claim uses the same words as the other. Pay special attention to comparing procedural/action claims (what someone is instructed to DO) against rule/definition claims (what the actual standard, law, or principle IS).

   The fix depends on your confidence once a contradiction is found:
   (a) If you are highly confident which statement is factually correct because it is foundational, uncontested knowledge widely taught in mainstream curriculum, correct the incorrect statement to align with the correct one, and add a brief inline note explaining what was corrected and why.
   (b) If you are not fully confident which statement is correct, or the contradiction is a narrative/scenario detail rather than a real-world factual claim, do NOT invent a resolution. Instead, flag both locations with a placeholder such as: "⚠️ [TEACHER: this section and [other section] describe X differently — reconcile before use]".
   Never resolve a contradiction by inventing a new fact, statistic, or citation not already grounded in what you are confident is standard, uncontested knowledge.

FIX-COMPLETENESS RULE — APPLIES TO ALL 6 CHECKS:
If your fix adds, removes, or changes something, you must update EVERY section of the document that references that same element, not just the first place it appears. If a fix removes or restructures a timed phase, you must re-verify that the total stated time and all individual phase times still add up correctly — do not let time silently disappear or appear from a restructuring. An incomplete fix that creates a new inconsistency elsewhere in the document is itself a defect.

YOUR TASK:
1. Read the activity draft below.
2. For Check 6 specifically, complete Stage A (the full extracted claims list) and show it in your output before giving your Check 6 verdict. Do not skip this step or summarize it away.
3. For each of the 6 checks, state explicitly: TRIGGERED or CLEAR, with one-line evidence quoting or pointing to the specific location(s) in the text.
4. If ALL 6 checks are CLEAR, say so plainly and return the activity completely unchanged.
5. If ANY check is TRIGGERED, apply the minimal targeted fix at the specific location where the defect actually lives. Then apply the FIX-COMPLETENESS RULE. Remember the CRITICAL RULE — no fabricated citations or invented facts, ever.
6. Return: (a) the Stage A claims list, (b) check results, (c) a brief fix-completeness note, (d) the full activity text (unchanged or with minimal fixes applied), wrapped between the two exact marker lines shown below — ===FINAL_ACTIVITY_START=== on its own line immediately before the activity markdown begins, and ===FINAL_ACTIVITY_END=== on its own line immediately after it ends, with nothing else on those two marker lines and no other text after ===FINAL_ACTIVITY_END===. These two marker strings must appear exactly once each in your entire response.

DRAFT ACTIVITY TO REVIEW:
---
${rawMarkdown}
---`;
}

function buildPrompt({ subject, topic, cross_curricular, context }) {
  const extras = [
    cross_curricular ? `Cross-curricular connection: ${cross_curricular}` : null,
    context ? `Additional context: ${context}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `You are an expert curriculum designer. Generate a structured teaching activity for the following:

Subject: ${subject}
Topic: ${topic}
${extras}

IMPORTANT — before generating the activity, evaluate the premise:
If the requested topic rests on a factually false, pseudoscientific, or historically inaccurate premise (for example, a claim already disproven by evidence), do not create an activity that teaches the false premise as true. Instead, reframe the activity as a critical-thinking or media-literacy exercise that has students examine the claim, gather evidence, and evaluate it — while still following the same structural format below. Legitimate historical or social topics, including difficult or sensitive ones (such as documented atrocities, discrimination, or political history), are not false premises and should be treated as valid subjects for a normal activity.


HANDS-ON & MATERIALS GUIDANCE — When the subject or topic has a physical, spatial, quantitative, or manipulable concept at its core — including but not limited to mathematics, science, chemistry, physics, and engineering — actively prefer a hands-on, tactile approach over a paper-only or purely discussion-based one, provided it can meaningfully teach the same concept. The specific materials chosen must be calibrated to the resource level implied by the teacher's stated context: a well-resourced setting (a fully equipped lab, a computer lab, a maker space, a school with budget for kits) may call for purpose-built materials such as lab equipment, robotics kits, or specialized tools; a low-resource or zero-tech context should instead use freely available, low-cost, or improvised materials that can physically demonstrate the same concept — for example: straws and tape to build a triangular truss for a geometry or physics lesson, cut grid-paper squares to represent fractions, mud or sand and simple containers to explore volume or density, bottle caps or stones for counting and combinatorics, or string and a stick to demonstrate a pendulum or angles. The activity must explicitly state which materials were chosen and briefly justify why they fit the stated resource context — this justification should appear in the Materials section, not be left implicit. This preference for hands-on activity does not override safety, age-group feasibility, or any other guidance already present in this prompt (such as the false-premise handling above) — it is an additional design preference to apply within those existing constraints.


Return ONLY the activity — no preamble. Use this exact structure with these headings:

## 🎣 Narrative Hook
A short, engaging story or scenario to open the lesson (2–3 sentences).

## 🗺 Flowchart
Output ONLY a Mermaid flowchart code block (using \`\`\`mermaid fences). Represent the activity phases as a simple top-to-bottom flow using \`flowchart TD\`. Each node should be a short 3–5 word label. Connect nodes in sequence with arrows. No subgraphs, no styling, no extra text outside the code block.

## ⏱ Timeline
A phase-by-phase breakdown with time allocations (use a simple table or bullet list).

## 🧰 Materials
A concise bullet list of required materials.

## 📋 Step-by-Step Instructions
Numbered steps that a teacher can follow directly in the classroom.

## 💬 Reflection Questions
3–5 questions for students to discuss or journal after the activity.

## 📊 Assessment Rubric
A simple rubric (at least 3 criteria, 3 levels each).

## 🎨 Customization Zones
List 2–4 places where teachers can personalize the activity. Mark each with one of these inline placeholders exactly as written:
- 📷 [INSERT PHOTO OR IMAGE HERE]
- ✏️ [INSERT TEACHER NOTE HERE]
- 📝 [INSERT STUDENT WORKSHEET HERE]`;
}

/** Very small Markdown → HTML converter (headings, bold, tables, lists, paragraphs, mermaid). */
function markdownToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let tableRows = [];
  let inMermaid = false;
  let mermaidLines = [];

  function flushList() {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  }

  function flushTable() {
    if (!inTable) return;
    out.push('<table>');
    tableRows.forEach((row, i) => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      const tag = i === 0 ? 'th' : 'td';
      out.push('<tr>' + cells.map(c => `<${tag}>${inline(c)}</${tag}>`).join('') + '</tr>');
    });
    out.push('</table>');
    inTable = false;
    tableRows = [];
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Mermaid fence open
    if (!inMermaid && line.trim() === '```mermaid') {
      flushList();
      flushTable();
      inMermaid = true;
      mermaidLines = [];
      continue;
    }

    // Mermaid fence close
    if (inMermaid) {
      if (line.trim() === '```') {
        out.push(`<pre class="mermaid">${mermaidLines.join('\n')}</pre>`);
        inMermaid = false;
        mermaidLines = [];
      } else {
        mermaidLines.push(raw);
      }
      continue;
    }

    // Table separator row — skip
    if (/^\|[-| :]+\|?$/.test(line)) continue;

    // Table row
    if (line.startsWith('|') && line.includes('|', 1)) {
      flushList();
      if (!inTable) inTable = true;
      tableRows.push(line.replace(/^\||\|$/g, ''));
      continue;
    }
    flushTable();

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      flushList();
      const level = Math.min(h[1].length + 1, 4); // h2–h4 in output
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      if (!inOl) { flushList(); out.push('<ol>'); inOl = true; }
      out.push(`<li>${inline(line.replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      if (!inUl) { flushList(); out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(line.replace(/^[-*]\s/, ''))}</li>`);
      continue;
    }

    flushList();

    if (line.trim() === '') {
      out.push('');
      continue;
    }

    out.push(`<p>${inline(line)}</p>`);
  }

  flushList();
  flushTable();
  return out.join('\n');
}

/** Inline markdown: bold, italic, code. */
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function flowchartPage({ id, subject, topic, mermaidCode }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flowchart — ${subject}: ${topic}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --accent:    #b5541e;
      --accent-dk: #8f3f12;
      --cream:     #faf7f2;
      --paper:     #fffcf7;
      --ink:       #2a1f14;
      --muted:     #7a6a5a;
      --border:    #e2d9cf;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--cream);
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
    }
    .site-nav { border-bottom: 1px solid var(--border); background: var(--paper); }
    .site-nav-inner {
      max-width: 820px; margin: 0 auto; padding: 0 1.5rem;
      display: flex; align-items: center; gap: 0.25rem;
    }
    .nav-link {
      display: inline-block; font-size: 0.82rem; font-weight: 600;
      color: var(--muted); text-decoration: none; padding: 0.75rem 0.85rem;
      border-bottom: 2px solid transparent; letter-spacing: 0.01em;
      transition: color 0.15s, border-color 0.15s;
    }
    .nav-link:hover { color: var(--accent); }
    .page {
      max-width: 820px; margin: 0 auto;
      padding: 3rem 1.5rem 5rem;
      display: flex; flex-direction: column; align-items: center;
    }
    .fc-header { text-align: center; margin-bottom: 2.5rem; }
    .fc-eyebrow {
      display: inline-block; font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.13em; text-transform: uppercase; color: var(--accent);
      background: rgba(181,84,30,0.08); border: 1px solid rgba(181,84,30,0.18);
      border-radius: 999px; padding: 0.25rem 0.85rem; margin-bottom: 0.85rem;
    }
    .fc-header h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: clamp(1.3rem, 3.5vw, 1.9rem);
      font-weight: 600; line-height: 1.25;
      color: var(--ink); margin: 0 0 0.4rem;
    }
    .fc-header p { font-size: 0.88rem; color: var(--muted); margin: 0; }
    .fc-diagram {
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 640px;
      box-shadow: 0 2px 24px rgba(42,31,20,0.06);
      display: flex;
      justify-content: center;
      overflow-x: auto;
    }
    /* Make Mermaid SVG larger for projection/print */
    .fc-diagram .mermaid { font-size: 1.05rem; }
    .fc-diagram svg { max-width: 100%; height: auto; }
    .back-link {
      margin-top: 2rem;
      font-size: 0.85rem; font-weight: 600;
      color: var(--accent); text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }
    .site-footer {
      text-align: center; font-size: 0.75rem; color: #b0a090; padding-top: 2rem;
    }
    .print-btn {
      background: none; border: 1px solid var(--border);
      color: var(--muted); border-radius: 999px;
      padding: 0.3rem 0.8rem; font-size: 0.78rem; font-weight: 600;
      font-family: 'Inter', sans-serif; cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .print-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    .fc-actions {
      display: flex; align-items: center; gap: 0.75rem; margin-top: 1.5rem;
      flex-wrap: wrap; justify-content: center;
    }
    @media (max-width: 600px) {
      .page { padding: 2rem 1rem 4rem; }
      .site-nav-inner { padding: 0 1rem; }
    }
    @media print {
      @page { margin: 1.5cm; }
      body { background: #fff !important; }
      .site-nav, .back-link, .print-btn, .site-footer { display: none !important; }
      .page { padding: 0; }
      .fc-header { margin-bottom: 1.5rem; }
      .fc-diagram { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .fc-diagram svg { width: 100%; height: auto; }
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <div class="site-nav-inner">
      <a href="/" class="nav-link">Generate</a>
      <a href="/about" class="nav-link">Why This Exists</a>
    </div>
  </nav>

  <div class="page">
    <div class="fc-header">
      <span class="fc-eyebrow">Activity Flowchart</span>
      <h1>${subject}: ${topic}</h1>
      <p>Phase-by-phase overview — designed for projection or printing.</p>
    </div>

    <div class="fc-diagram">
      <pre class="mermaid">${mermaidCode}</pre>
    </div>

    <div class="fc-actions">
      <a class="back-link" href="/activity/${id}">← Back to full activity</a>
      <button class="print-btn" onclick="window.print()">Download as PDF ⬇</button>
    </div>
    <p class="site-footer">Powered by IBM Bob &nbsp;·&nbsp; Built for educators everywhere</p>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'neutral' });</script>
</body>
</html>`;
}

function resultPage({ id, subject, topic, cross_curricular, context, activityHtml, hasMermaid }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject} – ${topic}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --accent:    #b5541e;
      --accent-dk: #8f3f12;
      --cream:     #faf7f2;
      --paper:     #fffcf7;
      --ink:       #2a1f14;
      --muted:     #7a6a5a;
      --border:    #e2d9cf;
      --stripe:    #faf4ec;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--cream);
      background-image:
        radial-gradient(ellipse 80% 40% at 50% -5%, rgba(181,84,30,0.06) 0%, transparent 65%);
      margin: 0;
      color: var(--ink);
      line-height: 1.75;
    }

    /* ── shared site nav ── */
    .site-nav {
      border-bottom: 1px solid var(--border);
      background: var(--paper);
    }
    .site-nav-inner {
      max-width: 820px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-link {
      display: inline-block;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--muted);
      text-decoration: none;
      padding: 0.75rem 0.85rem;
      border-bottom: 2px solid transparent;
      letter-spacing: 0.01em;
      transition: color 0.15s, border-color 0.15s;
    }
    .nav-link:hover { color: var(--accent); }
    .nav-link--active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    /* ── page layout ── */
    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }

    /* ── meta pill strip ── */
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0.3rem 0.8rem;
      font-size: 0.78rem;
      color: var(--ink);
    }
    .meta-pill strong {
      color: var(--accent);
      font-weight: 600;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ── activity booklet ── */
    .activity {
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 2.75rem 3rem;
      box-shadow: 0 2px 28px rgba(42,31,20,0.07);
      /* readable measure ~70ch */
      max-width: 72ch;
    }

    /* section headings with left accent bar */
    .activity h2 {
      font-family: 'Lora', Georgia, serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--ink);
      margin: 2.25rem 0 0.6rem;
      padding-left: 0.9rem;
      border-left: 3px solid var(--accent);
      line-height: 1.3;
    }
    .activity h2:first-child { margin-top: 0; }
    .activity h3 {
      font-family: 'Lora', Georgia, serif;
      font-size: 1rem;
      font-weight: 600;
      font-style: italic;
      color: var(--accent-dk);
      margin: 1.5rem 0 0.4rem;
    }
    .activity h4 {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin: 1.25rem 0 0.3rem;
    }

    /* body text */
    .activity p {
      font-size: 0.94rem;
      margin: 0.5rem 0 0.75rem;
      color: var(--ink);
    }

    /* lists */
    .activity ul, .activity ol {
      padding-left: 1.5rem;
      margin: 0.4rem 0 0.9rem;
      font-size: 0.94rem;
    }
    .activity li { margin-bottom: 0.45rem; }
    .activity ol li::marker { color: var(--accent); font-weight: 600; }

    /* mermaid flowchart */
    .activity .mermaid {
      background: var(--stripe);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin: 0.75rem 0 1.25rem;
      overflow-x: auto;
      text-align: center;
    }

    /* inline code */
    .activity code {
      background: rgba(181,84,30,0.08);
      color: var(--accent-dk);
      padding: 0.1em 0.38em;
      border-radius: 4px;
      font-size: 0.87em;
    }

    /* tables — alternating row shading */
    .activity table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      margin: 0.9rem 0 1.2rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .activity th {
      background: rgba(181,84,30,0.09);
      color: var(--ink);
      font-weight: 600;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.6rem 0.85rem;
      border-bottom: 2px solid var(--border);
      text-align: left;
    }
    .activity td {
      padding: 0.55rem 0.85rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .activity tr:last-child td { border-bottom: none; }
    .activity tr:nth-child(even) td { background: var(--stripe); }

    /* section separator */
    .activity hr {
      border: none;
      border-top: 1px dashed var(--border);
      margin: 2rem 0;
    }

    /* flowchart button in meta strip */
    .flowchart-btn {
      background: var(--accent);
      color: #fff !important;
      border-color: var(--accent);
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s;
    }
    .flowchart-btn:hover { background: var(--accent-dk); border-color: var(--accent-dk); }

    /* print/download button in meta strip */
    .print-btn {
      background: none;
      border: 1px solid var(--border);
      color: var(--muted);
      font-family: 'Inter', sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: 999px;
      padding: 0.3rem 0.8rem;
      transition: background 0.15s, color 0.15s;
      line-height: 1;
    }
    .print-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

    /* ── footer ── */
    .site-footer {
      text-align: center;
      font-size: 0.75rem;
      color: #b0a090;
      padding-top: 2rem;
    }

    @media (max-width: 600px) {
      .activity { padding: 1.75rem 1.25rem; }
      .page { padding: 1.5rem 1rem 4rem; }
      .site-nav-inner { padding: 0 1rem; }
    }

    @media print {
      @page { margin: 1.8cm 1.5cm; }
      body { background: #fff !important; background-image: none !important; }
      .site-nav, .meta .flowchart-btn, .meta .print-btn, .site-footer { display: none !important; }
      .page { padding: 0; max-width: 100%; }
      .meta {
        margin-bottom: 1rem;
        border-bottom: 1px solid #ccc;
        padding-bottom: 0.6rem;
      }
      .meta-pill {
        background: none; border: none;
        font-size: 0.8rem; padding: 0 0.5rem 0 0;
      }
      .activity {
        border: none; box-shadow: none; border-radius: 0;
        padding: 0; background: #fff;
      }
      .activity h2 {
        border-left: 2px solid #b5541e;
        page-break-after: avoid;
      }
      .activity h3, .activity h4 { page-break-after: avoid; }
      .activity p, .activity li { orphans: 3; widows: 3; }
      .activity table { page-break-inside: avoid; }
      .activity tr { page-break-inside: avoid; }
      .activity td, .activity th { page-break-inside: avoid; }
      .activity ul, .activity ol { page-break-inside: avoid; }
      .activity .mermaid { display: none; }
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <div class="site-nav-inner">
      <a href="/" class="nav-link">Generate</a>
      <a href="/about" class="nav-link">Why This Exists</a>
    </div>
  </nav>

  <div class="page">
    <div class="meta">
      <span class="meta-pill"><strong>Subject</strong> ${subject}</span>
      <span class="meta-pill"><strong>Topic</strong> ${topic}</span>
      ${cross_curricular ? `<span class="meta-pill"><strong>Cross-curricular</strong> ${cross_curricular}</span>` : ''}
      ${context ? `<span class="meta-pill"><strong>Context</strong> ${context}</span>` : ''}
      ${hasMermaid ? `<a class="meta-pill flowchart-btn" href="/activity/${id}/flowchart">View Flowchart →</a>` : ''}
      <button class="meta-pill print-btn" onclick="window.print()">Download as PDF ⬇</button>
      <button class="meta-pill print-btn" id="copy-btn" onclick="copyActivity(this)">Copy for Google Docs</button>
    </div>

    <div class="activity" id="activity-content">
      ${activityHtml}
    </div>

    <p class="site-footer">Powered by IBM Bob &nbsp;·&nbsp; Built for educators everywhere</p>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'neutral' });</script>
  <script>
    function copyActivity(btn) {
      const el = document.getElementById('activity-content');
      const original = btn.textContent;
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        const ok = document.execCommand('copy');
        sel.removeAllRanges();
        if (!ok) throw new Error('execCommand returned false');
        btn.textContent = 'Copied! ✓';
        setTimeout(() => { btn.textContent = original; }, 2000);
      } catch (_) {
        btn.textContent = 'Copy failed — select text manually';
        setTimeout(() => { btn.textContent = original; }, 3500);
      }
    }
  </script>
</body>
</html>`;
}

function refusalPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Couldn't Generate Activity</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --accent: #b5541e; --accent-dk: #8f3f12;
      --cream: #faf7f2; --paper: #fffcf7;
      --ink: #2a1f14; --muted: #7a6a5a; --border: #e2d9cf;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--cream); margin: 0; min-height: 100vh; color: var(--ink);
    }
    .site-nav { border-bottom: 1px solid var(--border); background: var(--paper); }
    .site-nav-inner {
      max-width: 820px; margin: 0 auto; padding: 0 1.5rem;
      display: flex; align-items: center; gap: 0.25rem;
    }
    .nav-link {
      display: inline-block; font-size: 0.82rem; font-weight: 600;
      color: var(--muted); text-decoration: none; padding: 0.75rem 0.85rem;
      border-bottom: 2px solid transparent; transition: color 0.15s;
    }
    .nav-link:hover { color: var(--accent); }
    .page {
      max-width: 820px; margin: 0 auto;
      padding: 4rem 1.5rem 5rem;
      display: flex; flex-direction: column; align-items: center;
    }
    .card {
      background: var(--paper); border: 1px solid var(--border);
      border-top: 4px solid var(--accent);
      border-radius: 14px; padding: 2.5rem 2.75rem;
      max-width: 560px; width: 100%;
      box-shadow: 0 2px 24px rgba(42,31,20,0.06);
      text-align: center;
    }
    .icon { font-size: 2rem; margin-bottom: 1rem; }
    h1 {
      font-family: 'Lora', Georgia, serif; font-size: 1.4rem;
      font-weight: 600; color: var(--ink); margin: 0 0 0.75rem;
    }
    p { font-size: 0.93rem; color: var(--muted); line-height: 1.65; margin: 0 0 0.6rem; }
    .suggestions {
      text-align: left; margin: 1.5rem 0;
      background: rgba(181,84,30,0.05); border-radius: 8px; padding: 1rem 1.25rem;
    }
    .suggestions p { font-size: 0.85rem; font-weight: 600; color: var(--ink); margin-bottom: 0.5rem; }
    .suggestions ul { margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: var(--muted); }
    .suggestions li { margin-bottom: 0.35rem; }
    .back-btn {
      display: inline-block; margin-top: 0.5rem;
      padding: 0.75rem 1.75rem; background: var(--accent); color: #fff;
      text-decoration: none; border-radius: 8px;
      font-size: 0.88rem; font-weight: 600; transition: background 0.15s;
    }
    .back-btn:hover { background: var(--accent-dk); }
    @media (max-width: 600px) {
      .page { padding: 2rem 1rem 4rem; }
      .card { padding: 1.75rem 1.25rem; }
      .site-nav-inner { padding: 0 1rem; }
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <div class="site-nav-inner">
      <a href="/" class="nav-link">Generate</a>
      <a href="/about" class="nav-link">Why This Exists</a>
    </div>
  </nav>
  <div class="page">
    <div class="card">
      <div class="icon">🤔</div>
      <h1>We couldn't generate an activity for this request.</h1>
      <p>This can happen with very sensitive, ambiguous, or complex topics.</p>
      <div class="suggestions">
        <p>Try one of these:</p>
        <ul>
          <li>Rephrase the topic more specifically or narrowly</li>
          <li>Break a broad theme into a focused subtopic</li>
          <li>Add classroom context — grade level, learning goal, or setting</li>
          <li>For sensitive historical topics, include the academic framing (e.g. "critical analysis of…" or "primary sources on…")</li>
        </ul>
      </div>
      <a href="/" class="back-btn">← Try a different topic</a>
    </div>
  </div>
</body>
</html>`;
}

function errorPage(message) {
  const safe = String(message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Error</title>
  <style>
    body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; background: #f7f8fa; padding: 3rem 1rem; }
    .card { max-width: 540px; margin: 0 auto; background: #fff; border: 1px solid #fca5a5; border-radius: 10px; padding: 2rem; }
    h2 { color: #dc2626; margin: 0 0 0.75rem; }
    p { color: #1f2328; font-size: 0.9rem; }
    pre { background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.75rem; font-size: 0.8rem; white-space: pre-wrap; word-break: break-word; }
    a { color: #3b82d4; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Generation Error</h2>
    <pre>${safe}</pre>
    <p><a href="/">← Go back</a></p>
  </div>
</body>
</html>`;
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Activity generator running → http://localhost:${PORT}`);
});
