import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      const s = (1 + Math.random() * 3) + 'px';
      p.style.width = s; p.style.height = s;
      p.style.opacity = (0.15 + Math.random() * 0.5);
      container.appendChild(p);
    }
    return () => { container.innerHTML = ''; };
  }, []);

  return (
    <section className="section hero-section">
      <div className="parallax-grid" />
      <div className="parallax-orb" style={{ top: '15%', left: '10%', background: 'rgba(0,230,118,0.25)', width: 280, height: 280 }} />
      <div className="parallax-orb" style={{ bottom: '10%', right: '8%', background: 'rgba(66,133,244,0.2)', width: 240, height: 240 }} />
      <div className="hero-particles" ref={particlesRef} />

      <div className="hero-badge">System Online v2.4</div>
      <h1 className="hero-title">
        Your AI<br /><span className="highlight">Chief of Staff</span>
      </h1>
      <p className="hero-subtitle">
        Command your digital ecosystem from a single, high-fidelity interface.
        Seamlessly integrate your tools and let autonomous agents execute complex
        workflows while you focus on strategy.
      </p>
      <div className="hero-buttons">
        <Link to="/dashboard" className="btn-nav btn-filled" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
          Initialize Command
        </Link>
        <Link to="/supervisor" className="btn-nav btn-outline" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
          Watch Simulation
        </Link>
      </div>
      <div className="hero-terminal">
        <span className="prompt">➜ ~ </span>
        Reschedule my afternoon meetings and draft a brief for the Alpha project...
        <span className="cursor-blink" />
      </div>
    </section>
  );
}
