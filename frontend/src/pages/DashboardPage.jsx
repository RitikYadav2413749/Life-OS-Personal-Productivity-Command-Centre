import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useMemoryStore from '../stores/useMemoryStore';
import './DashboardPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AGENTS = [
  { id: 'email_agent', name: 'Email Agent', icon: '📧', color: '#ea4335' },
  { id: 'calendar_agent', name: 'Calendar Agent', icon: '📅', color: '#4285f4' },
  { id: 'task_agent', name: 'Task Agent', icon: '📝', color: '#00e676' },
  { id: 'notifier_agent', name: 'Notification Agent', icon: '🔔', color: '#ff9800' },
];

export default function DashboardPage() {
  const [command, setCommand] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [agents, setAgents] = useState(
    Object.fromEntries(AGENTS.map(a => [a.id, { status: 'idle', steps: [], result: null }]))
  );
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const wsRef = useRef(null);
  const inputRef = useRef(null);
  const { persona: rawPersona, fetchPersona, updatePersona } = useMemoryStore();
  const persona = rawPersona || {};

  // WebSocket connection
  useEffect(() => {
    let ws;
    const connect = () => {
      ws = new WebSocket(`${API.replace('http', 'ws')}/ws/stream`);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => { setWsConnected(false); setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'agent_status') {
            setAgents(prev => ({
              ...prev,
              [msg.data.agent]: { ...prev[msg.data.agent], status: msg.data.status, steps: [...(prev[msg.data.agent]?.steps || []), msg.data.step].filter(Boolean) },
            }));
          } else if (msg.type === 'execution_result') {
            setResults(prev => [{ ...msg.data, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
            setIsExecuting(false);
            setAgents(Object.fromEntries(AGENTS.map(a => [a.id, { status: 'idle', steps: [], result: null }])));
          }
        } catch {}
      };
      wsRef.current = ws;
    };
    connect();
    return () => { ws?.close(); };
  }, []);

  // Fetch suggestions
  useEffect(() => {
    fetch(`${API}/api/suggestions`).then(r => r.ok ? r.json() : null).then(d => d && setSuggestions(d.suggestions || [])).catch(() => {});
    fetchPersona();
  }, [fetchPersona]);

  const submit = useCallback((text) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
    setIsExecuting(true);
    setAgents(Object.fromEntries(AGENTS.map(a => [a.id, { status: 'pending', steps: [], result: null }])));
    wsRef.current.send(JSON.stringify({ type: 'command', text, user_id: 'user_001' }));
    setCommand('');
  }, []);

  const handleKey = (e) => { if (e.key === 'Enter') submit(command); };

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dash-header">
        <Link to="/" className="dash-header__logo">
          <span className="nav__pulse-dot" /> LIFEOS
        </Link>
        <div className="dash-header__status">
          <span className={`status-indicator ${wsConnected ? 'connected' : 'offline'}`} />
          {wsConnected ? 'Connected' : 'Offline'}
        </div>
      </header>

      <div className="dash-layout">
        {/* Left Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar__section">
            <h3 className="dash-sidebar__title">⚙️ Preferences</h3>
            <div className="dash-field">
              <label>Name</label>
              <input value={persona.name || 'Life OS User'} onChange={e => updatePersona({ name: e.target.value })} />
            </div>
            <div className="dash-field">
              <label>Timezone</label>
              <input value={persona.timezone || 'Asia/Kolkata'} onChange={e => updatePersona({ timezone: e.target.value })} />
            </div>
            <div className="dash-field">
              <label>Style</label>
              <select value={persona.communication_style || 'casual'} onChange={e => updatePersona({ communication_style: e.target.value })}>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="terse">Terse</option>
              </select>
            </div>
          </div>

          <div className="dash-sidebar__section">
            <h3 className="dash-sidebar__title">⚡ Quick Actions</h3>
            {suggestions.map(s => (
              <button key={s} className="chip" onClick={() => submit(s)}>{s}</button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="dash-main">
          {/* Command Bar */}
          <div className="dash-command-bar">
            <span className="dash-command-bar__icon">⚡</span>
            <input
              ref={inputRef}
              className="dash-command-bar__input"
              placeholder="What would you like me to do?"
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={handleKey}
              disabled={isExecuting}
            />
            <span className="dash-command-bar__shortcut">⌘K</span>
            <button className="dash-command-bar__submit" onClick={() => submit(command)} disabled={isExecuting || !command.trim()}>
              {isExecuting ? '◌' : '→'}
            </button>
          </div>

          {/* Agent Orchestra */}
          <div className="dash-agents-grid">
            {AGENTS.map(a => (
              <div key={a.id} className={`dash-agent-card ${agents[a.id]?.status || 'idle'}`} style={{ '--agent-color': a.color }}>
                <div className="dash-agent-card__icon">{a.icon}</div>
                <div className="dash-agent-card__info">
                  <span className="dash-agent-card__name">{a.name}</span>
                  <span className="dash-agent-card__status">
                    <span className={`status-dot ${agents[a.id]?.status || 'idle'}`} />
                    {agents[a.id]?.status || 'idle'}
                  </span>
                </div>
                {agents[a.id]?.steps?.length > 0 && (
                  <div className="dash-agent-card__steps">
                    {agents[a.id].steps.slice(-2).map((s, i) => (
                      <div key={i} className="dash-agent-card__step">{s}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="dash-results">
          <h3 className="dash-sidebar__title">📋 Results</h3>
          {results.length === 0 ? (
            <div className="dash-empty">
              <p>Results will appear here after you run a command.</p>
            </div>
          ) : (
            results.map((r, i) => (
              <div key={i} className="dash-result-card glass-panel">
                <div className="dash-result-card__header">
                  <span className={`status-dot ${r.success !== false ? 'success' : 'error'}`} />
                  <span className="dash-result-card__time">{new Date(r.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="dash-result-card__summary">{r.summary || r.error || 'Command executed.'}</p>
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
