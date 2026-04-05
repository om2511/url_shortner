import React, { useEffect, useState } from 'react';
import api from '../api';

const RECENT_URLS_KEY = 'recentShortenedUrls';

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [recentUrls, setRecentUrls] = useState([]);

  useEffect(() => {
    try {
      const savedUrls = localStorage.getItem(RECENT_URLS_KEY);
      if (savedUrls) {
        setRecentUrls(JSON.parse(savedUrls));
      }
    } catch (storageError) {
      console.error('Failed to load recent URLs:', storageError);
    }
  }, []);

  const persistRecentUrls = (items) => {
    setRecentUrls(items);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(items));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortenedUrl('');
    setCopied(false);

    try {
      const response = await api.post('/api/shorten', {
        originalUrl,
      });

      const nextShortUrl = response.data.shortUrl;
      setShortenedUrl(nextShortUrl);

      const nextItem = {
        originalUrl,
        shortUrl: nextShortUrl,
        shortCode: response.data.shortCode,
        createdAt: new Date().toISOString(),
      };

      const nextRecentUrls = [
        nextItem,
        ...recentUrls.filter((item) => item.shortUrl !== nextShortUrl),
      ].slice(0, 5);

      persistRecentUrls(nextRecentUrls);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (value) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setOriginalUrl('');
    setShortenedUrl('');
    setError('');
    setCopied(false);
  };

  const clearRecentUrls = () => {
    persistRecentUrls([]);
  };

  const truncateUrl = (url, maxLength = 64) => (
    url.length > maxLength ? `${url.slice(0, maxLength)}...` : url
  );

  return (
    <div className="url-shortener page-shell">
      <div className="container">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="section-tag">Link operations</p>
            <h2>Turn messy URLs into polished, trackable short links.</h2>
            <p className="hero-description">
              Share links that look deliberate, stay easy to copy, and remain visible from
              a lightweight admin workspace.
            </p>

            <div className="hero-metrics">
              <div className="metric-card">
                <span className="metric-value">Fast</span>
                <span className="metric-label">One-step shorten flow</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">Recent</span>
                <span className="metric-label">Last 5 links saved locally</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">Admin</span>
                <span className="metric-label">Edit and monitor clicks</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-topline">
              <span className="status-dot" />
              <p>Production-friendly link workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="url-form">
              <label htmlFor="original-url" className="input-label">
                Paste the destination URL
              </label>

              <div className="input-group">
                <input
                  id="original-url"
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://www.example.com/research/report"
                  required
                  className="url-input"
                />
                <button
                  type="submit"
                  disabled={loading || !originalUrl.trim()}
                  className="shorten-btn"
                >
                  {loading ? 'Shortening...' : 'Create short link'}
                </button>
              </div>
            </form>

            <div className="hero-callouts">
              <div className="callout-card">
                <strong>Professional output</strong>
                <span>Short links are generated from your deployed backend domain.</span>
              </div>
              <div className="callout-card">
                <strong>Quick reuse</strong>
                <span>Recent links stay available locally for repeat sharing.</span>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="feedback-banner feedback-error">
            <p>{error}</p>
          </div>
        )}

        {shortenedUrl && (
          <section className="result-section elevated-panel">
            <div className="result-header">
              <div>
                <p className="section-tag">Latest result</p>
                <h3>Your short link is ready.</h3>
              </div>
              <span className="result-badge">Live</span>
            </div>

            <div className="result-grid">
              <div className="result-detail">
                <span className="detail-label">Original URL</span>
                <p>{originalUrl}</p>
              </div>
              <div className="result-detail result-detail-highlight">
                <span className="detail-label">Short URL</span>
                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
                  {shortenedUrl}
                </a>
              </div>
            </div>

            <div className="action-buttons action-buttons-wide">
              <button onClick={() => copyToClipboard(shortenedUrl)} className="copy-btn">
                {copied ? 'Copied' : 'Copy short link'}
              </button>
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ghost-action"
              >
                Open link
              </a>
              <button onClick={resetForm} className="reset-btn">
                Create another
              </button>
            </div>
          </section>
        )}

        <section className="workspace-grid">
          <div className="info-panel elevated-panel">
            <p className="section-tag">How this helps</p>
            <h3>Built for cleaner sharing and safer handoff.</h3>
            <ul className="feature-list">
              <li>Generate a short link without leaving the page.</li>
              <li>Open, copy, and reset from a single result block.</li>
              <li>Keep a lightweight local history for repeated outreach.</li>
            </ul>
          </div>

          <div className="recent-panel elevated-panel">
            <div className="panel-header">
              <div>
                <p className="section-tag">Recent links</p>
                <h3>Last shortened in this browser</h3>
              </div>
              {recentUrls.length > 0 && (
                <button onClick={clearRecentUrls} className="panel-link-button" type="button">
                  Clear history
                </button>
              )}
            </div>

            {recentUrls.length === 0 ? (
              <div className="empty-state compact-empty-state">
                <p>No recent links yet. Your latest five links will show up here.</p>
              </div>
            ) : (
              <div className="recent-list">
                {recentUrls.map((item) => (
                  <article key={`${item.shortUrl}-${item.createdAt}`} className="recent-item">
                    <div className="recent-copy">
                      <span className="detail-label">Destination</span>
                      <p title={item.originalUrl}>{truncateUrl(item.originalUrl)}</p>
                    </div>
                    <div className="recent-actions">
                      <a href={item.shortUrl} target="_blank" rel="noopener noreferrer">
                        {item.shortCode}
                      </a>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => copyToClipboard(item.shortUrl)}
                      >
                        Copy
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UrlShortener;
