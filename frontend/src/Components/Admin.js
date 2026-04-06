import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import AdminLogin from './AdminLogin';

const Admin = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setIsAuthenticated(false);
    setUrls([]);
  }, []);

  const fetchUrls = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/api/urls', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUrls(response.data);
    } catch (requestError) {
      setError('Failed to fetch URLs');
      if (requestError.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');

    if (token && adminUser) {
      try {
        const response = await api.post('/api/admin/verify', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        await fetchUrls();
      } catch (requestError) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        setLoading(false);
      }
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [fetchUrls]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLoginSuccess = (adminUser) => {
    setAdmin(adminUser);
    setIsAuthenticated(true);
    fetchUrls();
  };

  const handleEdit = (url) => {
    setEditingUrl(url._id);
    setEditValue(url.originalUrl);
  };

  const handleSaveEdit = async (urlId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(
        `/api/urls/${urlId}`,
        {
          originalUrl: editValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUrls(urls.map((url) => (url._id === urlId ? response.data : url)));
      setEditingUrl(null);
      setEditValue('');
    } catch (requestError) {
      setError('Failed to update URL');
    }
  };

  const handleCancelEdit = () => {
    setEditingUrl(null);
    setEditValue('');
  };

  const handleDelete = (urlId) => {
    setDeleteConfirm(urlId);
  };

  const confirmDelete = async (urlId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/api/urls/${urlId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUrls(urls.filter((url) => url._id !== urlId));
      setDeleteConfirm(null);
    } catch (requestError) {
      setError('Failed to delete URL');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const truncateUrl = (url, maxLength = 68) => (
    url.length > maxLength ? `${url.substring(0, maxLength)}...` : url
  );

  const filteredUrls = urls.filter((url) => {
    const matchesSearch =
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActivity =
      activityFilter === 'all' ||
      (activityFilter === 'active' && url.clicks > 0) ||
      (activityFilter === 'unused' && url.clicks === 0);

    return matchesSearch && matchesActivity;
  });

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeLinks = urls.filter((url) => url.clicks > 0).length;
  const topLink = urls.reduce((best, current) => {
    if (!best || current.clicks > best.clicks) {
      return current;
    }
    return best;
  }, null);

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="admin-page page-shell">
        <div className="container">
          <div className="loading-card elevated-panel">
            <p className="section-tag">Admin workspace</p>
            <div className="loading">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page page-shell">
      <div className="container">
        <section className="admin-hero elevated-panel">
          <div className="admin-hero-copy">
            <p className="section-tag">Operations view</p>
            <h2>Keep the link catalog clean and on-brand.</h2>
            <p>
              Review performance, clean up outdated links, and keep the short-link catalog
              aligned with the same dark violet and yellow brand language.
            </p>
          </div>
          <div className="admin-hero-actions">
            <div className="admin-chip">
              <span className="status-dot" />
              Signed in as {admin?.username}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </section>

        <section className="stats-summary">
          <div className="stat-card stat-card-accent">
            <p>Total URLs</p>
            <h3>{urls.length}</h3>
            <span>Current managed inventory</span>
          </div>
          <div className="stat-card">
            <p>Total Clicks</p>
            <h3>{totalClicks}</h3>
            <span>Aggregate redirect activity</span>
          </div>
          <div className="stat-card">
            <p>Active Links</p>
            <h3>{activeLinks}</h3>
            <span>Links with at least one click</span>
          </div>
          <div className="stat-card">
            <p>Top Performer</p>
            <h3>{topLink ? topLink.clicks : 0}</h3>
            <span>{topLink ? topLink.shortCode : 'No activity recorded yet'}</span>
          </div>
        </section>

        {error && (
          <div className="feedback-banner feedback-error">
            <p>{error}</p>
            <button onClick={() => setError('')} className="close-error" type="button">
              ×
            </button>
          </div>
        )}

        <section className="dashboard-toolbar elevated-panel">
          <div className="toolbar-copy">
            <p className="section-tag">Catalog controls</p>
            <h3>Search, filter, and refine the link library</h3>
          </div>

          <div className="toolbar-controls">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by original URL or short code"
              className="toolbar-search"
            />

            <div className="toolbar-filter-group" role="group" aria-label="Filter links">
              <button
                type="button"
                className={`filter-pill${activityFilter === 'all' ? ' filter-pill-active' : ''}`}
                onClick={() => setActivityFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-pill${activityFilter === 'active' ? ' filter-pill-active' : ''}`}
                onClick={() => setActivityFilter('active')}
              >
                Active
              </button>
              <button
                type="button"
                className={`filter-pill${activityFilter === 'unused' ? ' filter-pill-active' : ''}`}
                onClick={() => setActivityFilter('unused')}
              >
                Unused
              </button>
            </div>

            <button onClick={fetchUrls} className="refresh-btn" type="button">
              Refresh data
            </button>
          </div>
        </section>

        <section className="urls-section elevated-panel">
          <div className="panel-header">
            <div>
              <p className="section-tag">Managed links</p>
              <h3>Results: {filteredUrls.length}</h3>
            </div>
            <span className="panel-support-copy">
              {searchTerm || activityFilter !== 'all'
                ? 'Filtered view'
                : 'Complete collection'}
            </span>
          </div>

          {filteredUrls.length === 0 ? (
            <div className="empty-state">
              <p>No links match the current filters.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <div className="urls-table">
                <div className="table-header">
                  <div className="col">Original URL</div>
                  <div className="col">Short Link</div>
                  <div className="col">Clicks</div>
                  <div className="col">Created</div>
                  <div className="col">Actions</div>
                </div>

                {filteredUrls.map((url) => (
                  <div key={url._id} className="table-row">
                    <div className="col original-url" data-label="Original URL">
                      {editingUrl === url._id ? (
                        <input
                          type="url"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="edit-input"
                          placeholder="Paste replacement URL"
                        />
                      ) : (
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={url.originalUrl}
                        >
                          {truncateUrl(url.originalUrl)}
                        </a>
                      )}
                    </div>

                    <div className="col short-url" data-label="Short Link">
                      <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                        {url.shortCode}
                      </a>
                    </div>

                    <div className="col clicks" data-label="Clicks">
                      <span className={`click-count ${url.clicks > 0 ? 'has-clicks' : ''}`}>
                        {url.clicks}
                      </span>
                    </div>

                    <div className="col created" data-label="Created">
                      {formatDate(url.createdAt)}
                    </div>

                    <div className="col actions" data-label="Actions">
                      {editingUrl === url._id ? (
                        <div className="edit-actions">
                          <button
                            onClick={() => handleSaveEdit(url._id)}
                            className="save-btn"
                            disabled={!editValue.trim()}
                            type="button"
                          >
                            Save
                          </button>
                          <button onClick={handleCancelEdit} className="cancel-btn" type="button">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons table-actions">
                          <button onClick={() => handleEdit(url)} className="edit-btn" type="button">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(url._id)}
                            className="delete-btn"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal elevated-panel">
            <p className="section-tag">Confirm action</p>
            <h3>Delete this short link?</h3>
            <p>This action removes the link from the dashboard and cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                className="confirm-delete-btn"
                type="button"
              >
                Yes, delete
              </button>
              <button onClick={cancelDelete} className="cancel-delete-btn" type="button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
