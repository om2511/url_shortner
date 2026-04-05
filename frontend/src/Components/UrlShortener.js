import React, { useState } from 'react';
import api from '../api';

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortenedUrl('');
    setCopied(false);

    try {
      const response = await api.post('/api/shorten', {
        originalUrl: originalUrl,
      });

      setShortenedUrl(response.data.shortUrl);
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setOriginalUrl('');
    setShortenedUrl('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="url-shortener">
      <div className="container">
        <h2>Shorten Your URL</h2>
        <p className="description">
          Enter a long URL below and get a shortened version that's easy to share!
        </p>

        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter your long URL here (e.g., https://www.example.com/very/long/path)"
              required
              className="url-input"
            />
            <button 
              type="submit" 
              disabled={loading || !originalUrl.trim()}
              className="shorten-btn"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {shortenedUrl && (
          <div className="result-section">
            <h3>Your Shortened URL:</h3>
            <div className="result-box">
              <div className="url-display">
                <strong>Original:</strong> {originalUrl}
              </div>
              <div className="url-display shortened">
                <strong>Shortened:</strong> 
                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
                  {shortenedUrl}
                </a>
              </div>
              <div className="action-buttons">
                <button onClick={copyToClipboard} className="copy-btn">
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
                <button onClick={resetForm} className="reset-btn">
                  Shorten Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlShortener;
