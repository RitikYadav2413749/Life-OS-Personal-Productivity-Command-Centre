import './ResourcesPage.css';

const resources = [
  {
    category: 'Documentation',
    items: [
      { title: 'Getting Started Guide', desc: 'Set up Life OS in under 5 minutes with our step-by-step guide.', tag: 'Guide' },
      { title: 'API Reference', desc: 'Complete REST and WebSocket API documentation for developers.', tag: 'API' },
      { title: 'Agent Configuration', desc: 'Customize agent behavior, personas, and integration settings.', tag: 'Config' },
    ],
  },
  {
    category: 'Architecture',
    items: [
      { title: 'System Architecture', desc: 'Deep dive into the multi-agent orchestration layer and memory system.', tag: 'Technical' },
      { title: 'Security Model', desc: 'OAuth flows, token management, and data isolation patterns.', tag: 'Security' },
      { title: 'Deployment Guide', desc: 'Deploy to Railway, Docker, or your own infrastructure.', tag: 'DevOps' },
    ],
  },
  {
    category: 'Community',
    items: [
      { title: 'Discord Community', desc: 'Join 2,000+ builders discussing multi-agent AI systems.', tag: 'Social' },
      { title: 'Blog & Updates', desc: 'Latest product updates, tutorials, and AI agent insights.', tag: 'Blog' },
      { title: 'Open Source', desc: 'Contribute to Life OS on GitHub. MIT licensed.', tag: 'GitHub' },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="resources-page">
      <div className="resources-hero">
        <div className="section-label" style={{ color: 'var(--accent-green)', marginBottom: '0.6rem' }}>Knowledge Base</div>
        <h1 className="resources-title">Learn & <span className="highlight">Build</span></h1>
        <p className="resources-subtitle">Everything you need to master Life OS and build on top of it.</p>
      </div>

      {resources.map(group => (
        <div className="resource-group" key={group.category}>
          <h2 className="resource-group-title">{group.category}</h2>
          <div className="resource-grid">
            {group.items.map(item => (
              <div className="resource-card glass-panel" key={item.title}>
                <div className="resource-tag">{item.tag}</div>
                <h3 className="resource-card-title">{item.title}</h3>
                <p className="resource-card-desc">{item.desc}</p>
                <span className="resource-link">Read more →</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
