import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UrlShortener from '../src/Components/UrlShortener';
import Admin from '../src/Components/Admin';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>URL Shortener</h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<UrlShortener />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;