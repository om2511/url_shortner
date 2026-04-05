import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import UrlShortener from './Components/UrlShortener';
import Admin from './Components/Admin';
import './App.css';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleNavToggle = () => {
    setIsNavOpen((current) => !current);
  };

  const handleNavClose = () => {
    setIsNavOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <div className="app-background" aria-hidden="true">
          <div className="app-glow app-glow-left" />
          <div className="app-glow app-glow-right" />
          <div className="app-grid" />
        </div>

        <header className="site-header">
          <div className="container site-header-inner">
            <div className="brand-lockup">
              <div className="brand-mark">S</div>
              <div className="brand-copy">
                <p className="brand-eyebrow">Smart links</p>
                <h1>Shortener</h1>
              </div>
            </div>

            <button
              type="button"
              className={`nav-toggle${isNavOpen ? ' nav-toggle-open' : ''}`}
              aria-label="Toggle navigation menu"
              aria-expanded={isNavOpen}
              onClick={handleNavToggle}
            >
              <span />
              <span />
              <span />
            </button>

            <nav className={`site-nav${isNavOpen ? ' site-nav-open' : ''}`} aria-label="Primary">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
                onClick={handleNavClose}
              >
                Workspace
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
                onClick={handleNavClose}
              >
                Admin
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="site-main">
          <Routes>
            <Route path="/" element={<UrlShortener />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div className="container site-footer-inner">
            <p>Short links with a cleaner workflow, safer admin controls, and production-ready deployment.</p>
            <span>Built for fast sharing and lightweight operations.</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
