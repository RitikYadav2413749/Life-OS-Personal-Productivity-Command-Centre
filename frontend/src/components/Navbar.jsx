import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/agents', label: 'Agents' },
    { to: '/supervisor', label: 'Supervisor' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/solutions', label: 'Solutions' },
    { to: '/resources', label: 'Resources' },
  ];

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <Link to="/" className="nav__logo">
        <span className="nav__pulse-dot" />
        LIFEOS
      </Link>

      <button
        className="nav__hamburger"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <ul className={`nav__links ${mobileOpen ? 'nav__links--open' : ''}`}>
        {navLinks.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`nav__link ${location.pathname === link.to ? 'nav__link--active' : ''}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav__actions">
        <a href="http://localhost:5000" className="btn-nav btn-outline">Dashboard</a>
        <a href="http://localhost:5000" className="btn-nav btn-filled">Get Started</a>
      </div>
    </nav>
  );
}
