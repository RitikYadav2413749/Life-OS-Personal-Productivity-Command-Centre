import { useEffect, useRef } from 'react';
import './AgentsPage.css';

const agents = [
  {
    id: 'whatsapp',
    label: 'Communication Agent',
    name: 'WhatsApp Agent',
    desc: 'Instant messaging orchestration. Auto-reply, message summarization, and intelligent routing — all handled autonomously by your WhatsApp agent.',
    color: '#25d366',
    cardClass: 'card-whatsapp',
    glowClass: 'glow-whatsapp',
    iconClass: 'icon-whatsapp',
    iconSvg: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    mockContent: (
      <div className="mock-whatsapp">
        <div className="msg-bubble">Hey! Can you reschedule today&apos;s standup?</div>
        <div className="msg-bubble">Sure, moved to 4 PM ✓</div>
        <div className="msg-bubble outgoing">Confirmed. I&apos;ll notify the team.</div>
        <div className="msg-bubble" style={{ opacity: 0.6 }}>📎 Project_Alpha_Brief.pdf</div>
      </div>
    ),
    reverse: false,
  },
  {
    id: 'gmail',
    label: 'Email Agent',
    name: 'Gmail Agent',
    desc: 'Intelligent email triage. Priority inbox sorting, automated drafting, and follow-up scheduling — your inbox, mastered by AI.',
    color: '#ea4335',
    cardClass: 'card-gmail',
    glowClass: 'glow-gmail',
    iconClass: 'icon-gmail',
    iconSvg: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="#ea4335">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
      </svg>
    ),
    mockContent: (
      <div className="mock-gmail">
        <div className="email-row"><span className="email-dot" /> <strong>Q4 Review</strong> — Meeting notes attached</div>
        <div className="email-row"><span className="email-dot" /> <strong>Client Update</strong> — Proposal ready for...</div>
        <div className="email-row"><span style={{ color: '#888' }}>✓</span> <strong>Team Sync</strong> — Summary: All tasks on...</div>
        <div className="email-row"><span style={{ color: '#888' }}>✓</span> <strong>Invoice</strong> — Processed automatically</div>
      </div>
    ),
    reverse: true,
  },
  {
    id: 'calendar',
    label: 'Scheduling Agent',
    name: 'Google Calendar Agent',
    desc: 'Dynamic schedule optimization. Conflict resolution, smart rescheduling, and meeting prep — your calendar, always in sync.',
    color: '#4285f4',
    cardClass: 'card-calendar',
    glowClass: 'glow-calendar',
    iconClass: 'icon-calendar',
    iconSvg: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
        <rect x="2" y="4" width="20" height="18" rx="2" fill="white" opacity="0.9"/>
        <rect x="2" y="4" width="20" height="5" rx="2" fill="#4285f4"/>
        <text x="12" y="9" textAnchor="middle" fontSize="5" fontWeight="700" fill="white" fontFamily="sans-serif">MAY 2026</text>
        <circle cx="7" cy="14.5" r="1.5" fill="#4285f4"/>
        <circle cx="12" cy="14.5" r="1.5" fill="#4285f4"/>
        <circle cx="17" cy="14.5" r="1.5" fill="#4285f4"/>
        <circle cx="7" cy="18.5" r="1.5" fill="#4285f4" opacity="0.5"/>
        <circle cx="12" cy="18.5" r="1.5" fill="#e8a838"/>
        <circle cx="17" cy="18.5" r="1.5" fill="#4285f4" opacity="0.5"/>
      </svg>
    ),
    mockContent: (
      <div className="mock-calendar">
        <div className="cal-grid">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          <span className="cal-day">28</span><span className="cal-day">29</span><span className="cal-day">30</span>
          <span className="cal-day highlight">1</span><span className="cal-day">2</span><span className="cal-day">3</span><span className="cal-day">4</span>
          <span className="cal-day">5</span><span className="cal-day">6</span><span className="cal-day">7</span>
          <span className="cal-day">8</span><span className="cal-day">9</span><span className="cal-day">10</span><span className="cal-day">11</span>
        </div>
        <p style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: '#b0c4de' }}>📅 <strong>3 events</strong> rescheduled today</p>
      </div>
    ),
    reverse: false,
  },
  {
    id: 'notion',
    label: 'Knowledge Agent',
    name: 'Notion Agent',
    desc: 'Your second brain, automated. Document generation, knowledge base updates, and cross-referencing — all orchestrated seamlessly.',
    color: '#ffffff',
    cardClass: 'card-notion',
    glowClass: 'glow-notion',
    iconClass: 'icon-notion',
    iconSvg: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="black">
        <rect width="24" height="24" rx="4" fill="white"/>
        <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="900" fill="black" fontFamily="sans-serif">N</text>
      </svg>
    ),
    mockContent: (
      <div className="mock-notion">
        <div className="notion-row"><span className="notion-check done" /> Alpha Project Brief</div>
        <div className="notion-row"><span className="notion-check done" /> Q2 Roadmap Draft</div>
        <div className="notion-row"><span className="notion-check" /> Meeting Notes — Review</div>
        <div className="notion-row"><span className="notion-check" /> Team Onboarding Doc</div>
        <div className="notion-row" style={{ color: '#888' }}>+ New page from voice note...</div>
      </div>
    ),
    reverse: true,
  },
];

function AgentCard3D({ agent }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
      const rotY = nx * 18;
      const rotX = -ny * 18;
      card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(15px)`;
      card.style.boxShadow = `${-nx * 20}px ${ny * 20}px ${40 + Math.abs(nx + ny) * 20}px rgba(0,0,0,0.5)`;
    };
    const handleMouseLeave = () => {
      card.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
      card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="card-3d-wrapper">
      <div className={`card-3d ${agent.cardClass}`} ref={cardRef}>
        <div className={`card-glow ${agent.glowClass}`} />
        <div className="card-3d-inner">
          <div className={`card-app-icon ${agent.iconClass}`}>{agent.iconSvg}</div>
          <div className="card-mock-interface">{agent.mockContent}</div>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <div className="agents-page">
      <div className="agents-hero">
        <div className="section-label" style={{ color: 'var(--accent-green)', marginBottom: '0.6rem' }}>Agent Network</div>
        <h1 className="agents-hero__title">Meet Your <span className="highlight">AI Agents</span></h1>
        <p className="agents-hero__subtitle">
          Four specialized agents working in concert to manage your entire digital workflow.
        </p>
      </div>

      {agents.map(agent => (
        <section
          key={agent.id}
          className={`section agent-section ${agent.reverse ? 'agent-section--reverse' : ''}`}
          id={agent.id}
        >
          <div className="parallax-grid" />
          <div className="parallax-orb" style={{ top: '20%', right: '15%', background: `${agent.color}44`, width: 300, height: 300 }} />
          <div className="parallax-orb" style={{ bottom: '15%', left: '10%', background: `${agent.color}22`, width: 200, height: 200 }} />

          <div className="agent-info">
            <div className="agent-label" style={{ color: agent.color }}>{agent.label}</div>
            <div className="agent-name" style={{ color: agent.color }}>{agent.name}</div>
            <p className="agent-desc">{agent.desc}</p>
            <div className="agent-status status-online">
              <span className="dot" /> Agent Active
            </div>
          </div>

          <AgentCard3D agent={agent} />
        </section>
      ))}
    </div>
  );
}
