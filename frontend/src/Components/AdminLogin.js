import React, { useState } from 'react';
import api from '../api';

const AdminLogin = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/admin/login', credentials);

      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

      onLoginSuccess(response.data.admin);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="admin-login page-shell">
      <div className="container login-layout">
        <section className="login-context elevated-panel">
          <p className="section-tag">Admin workspace</p>
          <h2>Manage links, monitor usage, and keep the catalog clean.</h2>
          <p className="hero-description">
            A focused dashboard for reviewing links, managing redirects, and keeping the
            link catalog organized.
          </p>

          <div className="login-benefits">
            <div className="callout-card">
              <strong>Protected access</strong>
              <span>JWT-based session verification with token persistence.</span>
            </div>
            <div className="callout-card">
              <strong>Operational control</strong>
              <span>Edit destinations, remove dead links, and review click activity.</span>
            </div>
          </div>
        </section>

        <section className="login-panel elevated-panel">
          <div className="login-panel-header">
            <p className="section-tag">Sign in</p>
            <h3>Admin Login</h3>
            <p className="login-description">
              Use the credentials configured in your backend environment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Admin username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Admin password"
                required
              />
            </div>

            {error && (
              <div className="feedback-banner feedback-error">
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading || !credentials.username || !credentials.password}
            >
              {loading ? 'Signing in...' : 'Enter dashboard'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
