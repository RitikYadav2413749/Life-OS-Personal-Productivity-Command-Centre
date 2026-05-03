import { useEffect, useRef } from 'react';
import './SupervisorPage.css';

const satellites = [
  { cls: 'sat-wa', label: 'WA', orbitX: '120px', orbitY: '-100px', delay: '0s', color: '#25d366' },
  { cls: 'sat-gm', label: 'GM', orbitX: '-130px', orbitY: '-60px', delay: '2s', color: '#ea4335' },
  { cls: 'sat-cal', label: 'CAL', orbitX: '100px', orbitY: '110px', delay: '4s', color: '#4285f4' },
  { cls: 'sat-no', label: 'NO', orbitX: '-110px', orbitY: '90px', delay: '6s', color: '#fff' },
];

export default function SupervisorPage() {
  const orbRef = useRef(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    const handleMouseMove = (e) => {
      const rect = orb.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const ox = e.clientX - cx;
      const oy = e.clientY - cy;
      const dist = Math.sqrt(ox * ox + oy * oy);
      const influence = Math.max(0, 1 - dist / 400);
      orb.style.transform = `translate(${ox * influence * 0.06}px, ${oy * influence * 0.06}px)`;
      const g = 0.3 + influence * 0.7;
      orb.style.boxShadow = `0 0 ${80*g}px rgba(66,133,244,${0.3*g}), 0 0 ${160*g}px rgba(66,133,244,${0.15*g}), inset 0 0 40px rgba(100,180,255,${0.1*g})`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="supervisor-page">
      <section className="section supervisor-section">
        <div className="parallax-grid" />
        <div className="parallax-orb" style={{
          top: '50%', left: '50%', background: 'rgba(100,180,255,0.2)', width: 400, height: 400,
          transform: 'translate(-50%,-50%)'
        }} />

        <div className="supervisor-connections">
          {satellites.map((sat, i) => (
            <div key={sat.cls}>
              <div
                className="connection-line"
                style={{
                  transform: `rotate(${(i / 4) * 360}deg) translateY(-70px)`,
                  height: 140,
                  animationDelay: sat.delay,
                }}
              />
              <div
                className={`satellite-icon ${sat.cls}`}
                style={{
                  '--orbit-x': sat.orbitX,
                  '--orbit-y': sat.orbitY,
                  animationDelay: sat.delay,
                }}
              >
                {sat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="supervisor-orb" ref={orbRef}>
          <div className="supervisor-orb-inner">
            <span style={{ fontSize: '1.5rem', display: 'block' }}>⬡</span>
            SUPERVISOR<br />ACTIVE
          </div>
        </div>

        <div className="supervisor-info">
          <div className="section-label" style={{ color: '#8ab4f8', marginBottom: '0.5rem' }}>Orchestration Layer</div>
          <h1 className="supervisor-title">Supervisor<br />Agent</h1>
          <p className="supervisor-desc">
            The central intelligence that orchestrates all agents. It delegates tasks
            across WhatsApp, Gmail, Google Calendar, and Notion — ensuring seamless
            coordination, conflict resolution, and priority management across your
            entire digital ecosystem.
          </p>
          <div className="supervisor-status">
            <span className="dot" style={{ background: '#8ab4f8', boxShadow: '0 0 8px #8ab4f8' }} />
            Orchestrating 4 Agents
          </div>
        </div>
      </section>

      <section className="supervisor-features">
        <div className="features-grid">
          {[
            { icon: '🧠', title: '5-Layer Context', desc: 'Assembles persona, history, and real-time state into every decision.' },
            { icon: '⚡', title: 'Parallel Execution', desc: 'Runs multiple agents simultaneously for maximum efficiency.' },
            { icon: '🔄', title: 'Conflict Resolution', desc: 'Automatically detects and resolves scheduling and task conflicts.' },
            { icon: '🛡️', title: 'Dry-Run Safety', desc: 'Preview all actions before committing — nothing happens without your approval.' },
            { icon: '📊', title: 'Memory Compaction', desc: 'LLM-driven summarization keeps context fresh without token overflow.' },
            { icon: '🔔', title: 'Smart Escalation', desc: 'Escalates to humans when confidence is low or stakes are high.' },
          ].map(f => (
            <div className="feature-card glass-panel" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
