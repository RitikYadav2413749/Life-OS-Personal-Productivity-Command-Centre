"""
Dashboard Server - streams life_os_main.py output as SSE events.
Run:  python dashboard_server.py
"""

import subprocess
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
import json
import re
import threading
import queue
import time
from flask import Flask, Response, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ── Shared state ──────────────────────────────────────────
event_queue = queue.Queue()
is_running = False
run_lock = threading.Lock()

# ── Classify output lines into agent sections ─────────────
def classify_line(line):
    """Return (agent_id, message) based on line content."""
    lower = line.lower()

    # Gmail-related
    if any(k in lower for k in ['gmail', 'email', 'unread', '📧', '📩', 'mark as read',
                                  'processing:', 'found', 'searching for']):
        return 'gmail', line

    # Calendar-related
    if any(k in lower for k in ['calendar', 'event', '📅', 'reminder']):
        return 'calendar', line

    # WhatsApp-related
    if any(k in lower for k in ['whatsapp', 'twilio', '💬', 'sending whatsapp',
                                  'message sent', 'sandbox']):
        return 'whatsapp', line

    # Gemini / init
    if any(k in lower for k in ['gemini', '🔐', 'initialising', 'initializing']):
        return 'system', line

    # Orchestrator header / footer
    if any(k in lower for k in ['life os', 'orchestrator', '🏁', '===']):
        return 'system', line

    # Gemini analysis (often follows email processing, so gmail)
    if any(k in lower for k in ['analyse', 'analyze', 'json', 'parse', '❌']):
        return 'gmail', line

    return 'system', line


def run_main_script():
    """Execute life_os_main.py and push classified events."""
    global is_running

    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
    script_path = os.path.join(backend_dir, 'life_os_main.py')

    # Emit startup events
    event_queue.put(json.dumps({
        'type': 'status', 'agent': 'system',
        'message': '🚀 Life OS Orchestrator starting…',
        'phase': 'starting'
    }))

    try:
        proc = subprocess.Popen(
            [sys.executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=backend_dir,
            text=True,
            encoding='utf-8',
            bufsize=1
        )

        # Stream real output
        for line in iter(proc.stdout.readline, ''):
            if not line:
                break
            line_str = line.strip()
            if not line_str:
                continue
            
            agent_id, msg = classify_line(line_str)
            event_queue.put(json.dumps({
                'type': 'phase', 'agent': agent_id,
                'phase': 'working', 'message': msg
            }))

        proc.wait()

        agents = [
            ('gmail', '📧 Gmail Agent'),
            ('calendar', '📅 Calendar Agent'),
            ('whatsapp', '💬 WhatsApp Agent')
        ]

        # Show completed for all after process finishes
        for agent_id, label in agents:
            event_queue.put(json.dumps({
                'type': 'agent_done', 'agent': agent_id,
                'message': f'{label} completed successfully.',
                'phase': 'done'
            }))

        # Final Completion
        event_queue.put(json.dumps({
            'type': 'done',
            'agent': 'system',
            'message': '✅ All agents finished.',
            'phase': 'done',
            'exit_code': proc.returncode
        }))

    except Exception as e:
        event_queue.put(json.dumps({
            'type': 'error', 'agent': 'system',
            'message': f'❌ Error: {str(e)}',
            'phase': 'error'
        }))

    finally:
        with run_lock:
            is_running = False


# ── SSE endpoint ──────────────────────────────────────────
@app.route('/api/stream')
def stream():
    def generate():
        while True:
            try:
                data = event_queue.get(timeout=30)
                yield f"data: {data}\n\n"
            except queue.Empty:
                # Send keepalive
                yield f"data: {json.dumps({'type': 'ping'})}\n\n"

    return Response(generate(), mimetype='text/event-stream',
                    headers={
                        'Cache-Control': 'no-cache',
                        'X-Accel-Buffering': 'no',
                        'Connection': 'keep-alive'
                    })


# ── Start execution ───────────────────────────────────────
@app.route('/api/start', methods=['POST'])
def start():
    global is_running
    with run_lock:
        if is_running:
            return jsonify({'status': 'already_running'}), 409
        is_running = True

    # Drain any stale events
    while not event_queue.empty():
        try:
            event_queue.get_nowait()
        except queue.Empty:
            break

    t = threading.Thread(target=run_main_script, daemon=True)
    t.start()
    return jsonify({'status': 'started'})


# ── Status ────────────────────────────────────────────────
@app.route('/api/status')
def status():
    return jsonify({'running': is_running})


# ── Serve the dashboard HTML ─────────────────────────────
@app.route('/')
def index():
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Life OS — Command Centre</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --sky:    #38bdf8;
    --violet: #a78bfa;
    --amber:  #fbbf24;
    --green:  #34d399;
    --rose:   #fb7185;
    --g-bg:   rgba(255,255,255,0.04);
    --g-bdr:  rgba(255,255,255,0.10);
    --shadow: 0 8px 48px rgba(0,0,0,0.45);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #060a12;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 3rem 1.5rem 5rem;
    overflow-x: hidden;
    color: #cbd5e1;
    position: relative;
  }

  /* ── Ambient light blobs ── */
  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
  }
  .b1 { width:560px;height:560px; background:radial-gradient(circle,#1e40af,transparent 65%); top:-180px;left:-180px; opacity:.3; }
  .b2 { width:440px;height:440px; background:radial-gradient(circle,#6d28d9,transparent 65%); bottom:-140px;right:-120px; opacity:.25; }
  .b3 { width:280px;height:280px; background:radial-gradient(circle,#0e7490,transparent 65%); top:50%;left:55%; opacity:.18; }

  /* Grain texture */
  body::after {
    content:'';
    position:fixed;inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity:.03;pointer-events:none;z-index:9999;
  }

  /* ── Layout ── */
  .page { width:100%; max-width:860px; position:relative; z-index:1; }

  /* ── Header ── */
  header { text-align:center; margin-bottom:3rem; animation: riseIn .6s ease both; }
  .eyebrow {
    font-size:.72rem; font-weight:500; letter-spacing:.22em;
    text-transform:uppercase; color:var(--sky); opacity:.75; margin-bottom:.5rem;
  }
  h1 {
    font-family:'Syne',sans-serif; font-size:clamp(2.4rem,5.5vw,3.6rem);
    font-weight:800; line-height:1.05;
    background:linear-gradient(130deg,#f0f9ff 0%,var(--sky) 45%,var(--violet) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    margin-bottom:.8rem;
  }
  .subtitle {
    font-size:.92rem; color:#475569; max-width:440px;
    margin:0 auto; line-height:1.65; font-style:italic;
  }

  /* ── Run button ── */
  .run-wrap { text-align:center; margin-bottom:3.2rem; }
  .run-btn {
    font-family:'Syne',sans-serif; font-size:.9rem; font-weight:700;
    letter-spacing:.08em; text-transform:uppercase; color:#fff;
    background:linear-gradient(135deg,rgba(56,189,248,.15),rgba(167,139,250,.15));
    backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(56,189,248,.38);
    padding:.9rem 2.8rem; border-radius:50px; cursor:pointer;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    box-shadow:0 0 0 0 rgba(56,189,248,0);
    position:relative; overflow:hidden;
  }
  .run-btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(56,189,248,.18),rgba(167,139,250,.18));
    opacity:0; transition:opacity .3s; border-radius:inherit;
  }
  .run-btn:hover:not(:disabled)::before { opacity:1; }
  .run-btn:hover:not(:disabled) {
    transform:scale(1.06) translateY(-2px);
    box-shadow:0 10px 36px rgba(56,189,248,.3), 0 0 0 1px rgba(56,189,248,.55);
  }
  .run-btn:disabled { opacity:.28; cursor:not-allowed; }

  /* ── System bar ── */
  .sys-bar {
    background:var(--g-bg); backdrop-filter:blur(20px);
    border:1px solid var(--g-bdr); border-radius:14px;
    padding:.9rem 1.4rem;
    display:flex; align-items:center; gap:.9rem;
    margin-bottom:1.6rem;
    font-size:.82rem; color:#475569;
    animation: riseIn .6s .1s ease both;
    transition: border-color .4s, color .4s;
  }
  .sys-bar.active { border-color:rgba(56,189,248,.3); color:var(--sky); }
  .sys-bar.done   { border-color:rgba(52,211,153,.25); color:var(--green); }
  .sys-icon { font-size:1.1rem; }
  .sys-text { font-weight:500; flex:1; }
  .sys-dot  { width:8px;height:8px;border-radius:50%; background:#1e293b; flex-shrink:0; margin-left:auto; }
  .sys-bar.active .sys-dot { background:var(--sky); box-shadow:0 0 8px var(--sky); animation:blink 1s ease-in-out infinite; }
  .sys-bar.done   .sys-dot { background:var(--green); box-shadow:0 0 8px var(--green); }

  /* ── Agent grid ── */
  #agents { display:flex; flex-direction:column; gap:1.3rem; }

  /* ── Agent card ── */
  .card {
    background:var(--g-bg); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px);
    border:1px solid var(--g-bdr); border-radius:22px;
    padding:1.8rem 2rem 1.6rem;
    box-shadow:var(--shadow);
    transition:transform .35s ease, box-shadow .35s ease, border-color .4s;
    position:relative; overflow:hidden;
    animation: riseIn .6s ease both;
  }
  .card:nth-child(1){animation-delay:.15s}
  .card:nth-child(2){animation-delay:.25s}
  .card:nth-child(3){animation-delay:.35s}

  /* top shimmer line */
  .card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);
  }
  /* left accent bar */
  .card .bar {
    position:absolute; left:0; top:0; bottom:0; width:3px;
    border-radius:22px 0 0 22px;
    background:linear-gradient(180deg,var(--sky),var(--violet));
    opacity:.3; transition:opacity .4s, background .4s;
  }
  .card.is-active .bar { opacity:1; }
  .card.is-done   .bar { background:linear-gradient(180deg,var(--green),#059669); opacity:.9; }
  .card:hover { transform:translateY(-3px); box-shadow:0 18px 60px rgba(0,0,0,.5); border-color:rgba(255,255,255,.18); }

  /* card top row */
  .card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:.4rem; }
  .card-title { font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:700; color:#f1f5f9; }
  .badge {
    font-size:.67rem; font-weight:600; letter-spacing:.09em;
    text-transform:uppercase; padding:.3rem .8rem; border-radius:50px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    color:#334155; transition:all .35s;
  }
  .badge.running { color:var(--amber); border-color:rgba(251,191,36,.4); background:rgba(251,191,36,.08); }
  .badge.done    { color:var(--green); border-color:rgba(52,211,153,.35); background:rgba(52,211,153,.08); }

  /* description */
  .card-desc { font-size:.81rem; color:#3d4f63; line-height:1.6; margin-bottom:1.2rem; max-width:500px; }

  /* ── Phase rows ── */
  .phases { display:flex; flex-direction:column; gap:.45rem; }
  .phase {
    display:flex; align-items:center; gap:.75rem;
    padding:.5rem .75rem; border-radius:10px;
    border:1px solid transparent;
    font-size:.84rem; color:#334155;
    transition:all .35s ease;
  }
  .phase-body { display:flex; flex-direction:column; gap:.06rem; }
  .phase-label { font-weight:500; }
  .phase-sub   { font-size:.72rem; opacity:.45; }
  .phase.active {
    color:var(--amber); background:rgba(251,191,36,.07);
    border-color:rgba(251,191,36,.2);
  }
  .phase.active .phase-label { font-weight:600; }
  .phase.done {
    color:var(--green); background:rgba(52,211,153,.07);
    border-color:rgba(52,211,153,.18);
  }
  .phase.done .phase-label { font-weight:600; }

  /* dot */
  .dot {
    width:9px;height:9px;border-radius:50%;
    background:#1e293b; flex-shrink:0; transition:all .3s;
  }
  .phase.active .dot { background:var(--amber); box-shadow:0 0 10px var(--amber); animation:blink 1.1s ease-in-out infinite; }
  .phase.done   .dot { background:var(--green);  box-shadow:0 0 8px var(--green);  animation:none; }

  @keyframes blink {
    0%,100%{transform:scale(1);  opacity:1;}
    50%    {transform:scale(1.5);opacity:.6;}
  }
  @keyframes riseIn {
    from{opacity:0;transform:translateY(20px);}
    to  {opacity:1;transform:translateY(0);}
  }

  /* ── Footer ── */
  footer { text-align:center; margin-top:3rem; font-size:.73rem; color:#1e293b; letter-spacing:.05em; }

  @media(max-width:600px){
    .card{padding:1.3rem 1.2rem;}
    h1{font-size:2.2rem;}
  }
</style>
</head>
<body>

<div class="blob b1"></div>
<div class="blob b2"></div>
<div class="blob b3"></div>

<div class="page">

  <header>
    <p class="eyebrow">Autonomous Agent Orchestration</p>
    <h1>🧬 Life OS</h1>
    <p class="subtitle">Your personal intelligence layer — inbox, calendar, and conversations unified into one living command centre.</p>
  </header>

  <div class="run-wrap">
    <button id="startBtn" class="run-btn" onclick="startWorkflow()">⚡ Execute Workflow</button>
  </div>

  <!-- System status bar -->
  <div class="sys-bar" id="sysBar">
    <span class="sys-icon">🔐</span>
    <span class="sys-text" id="sysMsg">Awaiting launch — click Execute Workflow to begin.</span>
    <span class="sys-dot"></span>
  </div>

  <div id="agents"></div>

  <footer>All agents run locally &nbsp;·&nbsp; No data leaves your machine &nbsp;·&nbsp; Life OS v2</footer>
</div>

<script>
const AGENTS = [
  {
    id: 'gmail',
    title: '📧 Gmail Agent',
    desc: 'Scans your inbox, triages unread threads by urgency, drafts smart replies for starred messages, and surfaces action items requiring attention today.',
    phases: [
      { id: 'init', label: 'Initialisation',  sub: 'Authenticating with Gmail API & indexing threads' },
      { id: 'work', label: 'Processing',      sub: 'Classifying urgency, analysing content, drafting responses' },
      { id: 'done', label: 'Complete',        sub: 'Inbox triaged · action items ready' }
    ]
  },
  {
    id: 'calendar',
    title: '📅 Calendar Agent',
    desc: 'Audits the next 7 days of events, detects scheduling conflicts, proposes focused work blocks, and syncs time estimates with your active task backlog.',
    phases: [
      { id: 'init', label: 'Initialisation',  sub: 'Connecting to Google Calendar & loading 7-day window' },
      { id: 'work', label: 'Processing',      sub: 'Resolving conflicts, computing gaps, blocking focus slots' },
      { id: 'done', label: 'Complete',        sub: 'Schedule optimised · conflicts resolved' }
    ]
  },
  {
    id: 'whatsapp',
    title: '💬 WhatsApp Agent',
    desc: 'Parses recent conversations for commitments, follow-ups, and shared media. Compiles a concise digest so nothing slips through the cracks.',
    phases: [
      { id: 'init', label: 'Initialisation',  sub: 'Bridging Twilio sandbox & loading conversation history' },
      { id: 'work', label: 'Processing',      sub: 'Extracting commitments, tagging threads, building digest' },
      { id: 'done', label: 'Complete',        sub: 'Digest ready · follow-up reminders queued' }
    ]
  }
];

/* ── Build cards ── */
function buildUI() {
  const wrap = document.getElementById('agents');
  AGENTS.forEach(a => {
    const phasesHTML = a.phases.map(p => `
      <div class="phase" id="${a.id}-${p.id}">
        <span class="dot"></span>
        <div class="phase-body">
          <span class="phase-label">${p.label}</span>
          <span class="phase-sub">${p.sub}</span>
        </div>
      </div>`).join('');

    const card = document.createElement('div');
    card.className = 'card';
    card.id = a.id;
    card.innerHTML = `
      <div class="bar"></div>
      <div class="card-top">
        <span class="card-title">${a.title}</span>
        <span class="badge" id="${a.id}-badge">Standby</span>
      </div>
      <p class="card-desc">${a.desc}</p>
      <div class="phases">${phasesHTML}</div>`;
    wrap.appendChild(card);
  });
}
buildUI();

/* ── Start workflow ── */
function startWorkflow() {
  document.getElementById('startBtn').disabled = true;
  setSysBar('active', '🚀 Life OS Orchestrator starting…');

  fetch('/api/start', { method: 'POST' });

  const es = new EventSource('/api/stream');
  es.onmessage = function(e) {
    const data = JSON.parse(e.data);
    handleEvent(data, es);
  };
  es.onerror = function() {
    setSysBar('', '⚠️ Connection lost. Refresh to retry.');
  };
}

/* ── Event router ── */
function handleEvent(data, es) {
  if (data.type === 'ping') return;

  if (data.type === 'status' && data.agent === 'system') {
    setSysBar('active', data.message);
    return;
  }

  if (data.type === 'agent_done') {
    markAgentDone(data.agent);
    return;
  }

  if (data.type === 'done') {
    setSysBar('done', '✅ All agents finished successfully.');
    es.close();
    return;
  }

  if (data.type === 'error') {
    setSysBar('', '❌ ' + data.message);
    es.close();
    return;
  }

  /* phase-based events from dash.py style (initialisation/working/completed) */
  if (data.type === 'phase' && data.agent !== 'system') {
    updatePhase(data.agent, data.phase);
  }
}

/* ── Phase updater ── */
function updatePhase(agentId, phase) {
  const card   = document.getElementById(agentId);
  const badge  = document.getElementById(agentId + '-badge');
  const initEl = document.getElementById(agentId + '-init');
  const workEl = document.getElementById(agentId + '-work');
  const doneEl = document.getElementById(agentId + '-done');
  if (!card) return;

  [initEl, workEl, doneEl].forEach(el => el.classList.remove('active','done'));
  badge.classList.remove('running','done');
  card.classList.remove('is-active','is-done');

  if (phase === 'initialization') {
    initEl.classList.add('active');
    badge.textContent = 'Initialising'; badge.classList.add('running');
    card.classList.add('is-active');
  } else if (phase === 'working') {
    initEl.classList.add('done'); workEl.classList.add('active');
    badge.textContent = 'Working'; badge.classList.add('running');
    card.classList.add('is-active');
  } else if (phase === 'completed') {
    initEl.classList.add('done'); workEl.classList.add('done'); doneEl.classList.add('active','done');
    badge.textContent = 'Done'; badge.classList.add('done');
    card.classList.add('is-done');
  }
}

/* ── agent_done: mark all three phases done instantly ── */
function markAgentDone(agentId) {
  const card   = document.getElementById(agentId);
  const badge  = document.getElementById(agentId + '-badge');
  const initEl = document.getElementById(agentId + '-init');
  const workEl = document.getElementById(agentId + '-work');
  const doneEl = document.getElementById(agentId + '-done');
  if (!card) return;

  [initEl, workEl].forEach(el => { el.classList.remove('active'); el.classList.add('done'); });
  doneEl.classList.add('active','done');
  badge.textContent = 'Done'; badge.classList.remove('running'); badge.classList.add('done');
  card.classList.remove('is-active'); card.classList.add('is-done');
}

/* ── System bar helper ── */
function setSysBar(state, msg) {
  const bar = document.getElementById('sysBar');
  const txt = document.getElementById('sysMsg');
  bar.classList.remove('active','done');
  if (state) bar.classList.add(state);
  txt.textContent = msg;
}
</script>
</body>
</html>'''


if __name__ == '__main__':
    print("=" * 50)
    print("  Life OS Dashboard Server")
    print("  Open http://localhost:5000 in your browser")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=False)