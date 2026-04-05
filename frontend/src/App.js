import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import UrlShortener from './Components/UrlShortener';
import Admin from './Components/Admin';
import './App.css';

function App() {
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

            <nav className="site-nav" aria-label="Primary">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
              >
                Workspace
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
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
