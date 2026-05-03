import './SolutionsPage.css';

const solutions = [
  {
    icon: '🏢',
    title: 'For Founders & CEOs',
    desc: 'Automate your executive workflow — from inbox zero to board meeting prep. Life OS handles the operational noise so you can focus on strategy.',
    features: ['Automated email triage', 'Meeting brief generation', 'Task delegation tracking'],
  },
  {
    icon: '🎓',
    title: 'For Students',
    desc: 'Never miss a deadline again. Life OS manages your assignments, study blocks, and group project coordination automatically.',
    features: ['Assignment tracking', 'Smart study scheduling', 'Group project sync'],
  },
  {
    icon: '💼',
    title: 'For Freelancers',
    desc: 'Juggling clients? Life OS keeps your invoices, deadlines, and client communications organized without the overhead.',
    features: ['Client communication tracking', 'Invoice follow-ups', 'Project timeline management'],
  },
  {
    icon: '🏗️',
    title: 'For Teams',
    desc: 'Coordinate across departments with a shared AI backbone. Life OS ensures nothing falls through the cracks.',
    features: ['Cross-team scheduling', 'Shared context memory', 'Escalation workflows'],
  },
];

export default function SolutionsPage() {
  return (
    <div className="solutions-page">
      <div className="solutions-hero">
        <div className="section-label" style={{ color: 'var(--accent-green)', marginBottom: '0.6rem' }}>Use Cases</div>
        <h1 className="solutions-title">Built for <span className="highlight">Everyone</span></h1>
        <p className="solutions-subtitle">From solo founders to large teams — Life OS adapts to your workflow.</p>
      </div>

      <div className="solutions-grid">
        {solutions.map(s => (
          <div className="solution-card glass-panel" key={s.title}>
            <div className="solution-icon">{s.icon}</div>
            <h3 className="solution-title">{s.title}</h3>
            <p className="solution-desc">{s.desc}</p>
            <ul className="solution-features">
              {s.features.map(f => <li key={f}>→ {f}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
