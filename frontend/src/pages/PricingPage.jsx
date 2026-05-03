import { Link } from 'react-router-dom';
import './PricingPage.css';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for personal productivity',
    features: ['1 AI Agent (Gmail)', 'Basic email triage', '10 commands/day', 'Community support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    desc: 'For power users who demand more',
    features: ['All 4 AI Agents', 'Unlimited commands', '5-layer context memory', 'Priority support', 'Dry-run previews', 'Custom persona'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For teams and organizations',
    features: ['Everything in Pro', 'Multi-user support', 'Custom integrations', 'On-premise option', 'SSO & RBAC', 'Dedicated support'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <div className="pricing-hero">
        <div className="section-label" style={{ color: 'var(--accent-green)', marginBottom: '0.6rem' }}>Simple Pricing</div>
        <h1 className="pricing-title">Choose Your <span className="highlight">Plan</span></h1>
        <p className="pricing-subtitle">Start free. Scale as your productivity demands grow.</p>
      </div>

      <div className="pricing-grid">
        {plans.map(plan => (
          <div className={`pricing-card glass-panel ${plan.highlight ? 'pricing-card--highlight' : ''}`} key={plan.name}>
            {plan.highlight && <div className="pricing-badge">Most Popular</div>}
            <h3 className="pricing-plan-name">{plan.name}</h3>
            <div className="pricing-price">
              <span className="pricing-amount">{plan.price}</span>
              <span className="pricing-period">{plan.period}</span>
            </div>
            <p className="pricing-desc">{plan.desc}</p>
            <ul className="pricing-features">
              {plan.features.map(f => (
                <li key={f}><span className="check">✓</span> {f}</li>
              ))}
            </ul>
            <Link to="/dashboard" className={`btn-nav ${plan.highlight ? 'btn-filled' : 'btn-outline'}`} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
