import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');

    if (token && adminUser) {
      try {
        // Verify token with backend
        const response = await axios.post('/api/admin/verify', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        await fetchUrls();
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        setLoading(false);
      }
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/urls', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUrls(response.data);
    } catch (error) {
      setError('Failed to fetch URLs');
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (adminUser) => {
    setAdmin(adminUser);
    setIsAuthenticated(true);
    fetchUrls();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setIsAuthenticated(false);
    setUrls([]);
  };

  const handleEdit = (url) => {
    setEditingUrl(url._id);
    setEditValue(url.originalUrl);
  };

  const handleSaveEdit = async (urlId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`/api/urls/${urlId}`, {
        originalUrl: editValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the URL in the list
      setUrls(urls.map(url => 
        url._id === urlId ? response.data : url
      ));

      setEditingUrl(null);
      setEditValue('');
    } catch (error) {
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
      await axios.delete(`/api/urls/${urlId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the URL from the list
      setUrls(urls.filter(url => url._id !== urlId));
      setDeleteConfirm(null);
    } catch (error) {
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

  const truncateUrl = (url, maxLength = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="loading">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div className="admin-title">
            <h2>Admin Dashboard</h2>
            <p>Welcome back, {admin?.username}!</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="stats-summary">
          <div className="stat-card">
            <h3>{urls.length}</h3>
            <p>Total URLs</p>
          </div>
          <div className="stat-card">
            <h3>{urls.reduce((sum, url) => sum + url.clicks, 0)}</h3>
            <p>Total Clicks</p>
          </div>
          <div className="stat-card">
            <h3>{urls.filter(url => url.clicks > 0).length}</h3>
            <p>Active URLs</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        <div className="urls-section">
          <div className="section-header">
            <h3>Manage Shortened URLs</h3>
            <button onClick={fetchUrls} className="refresh-btn">
              Refresh
            </button>
          </div>

          {urls.length === 0 ? (
            <div className="empty-state">
              <p>No URLs have been shortened yet.</p>
            </div>
          ) : (
            <div className="urls-table">
              <div className="table-header">
                <div className="col">Original URL</div>
                <div className="col">Short Code</div>
                <div className="col">Clicks</div>
                <div className="col">Created</div>
                <div className="col">Actions</div>
              </div>
              {urls.map((url) => (
                <div key={url._id} className="table-row">
                  <div className="col original-url">
                    {editingUrl === url._id ? (
                      <input
                        type="url"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="edit-input"
                        placeholder="Enter new URL"
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
                  <div className="col short-url">
                    <a 
                      href={url.shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {url.shortCode}
                    </a>
                  </div>
                  <div className="col clicks">
                    <span className={`click-count ${url.clicks > 0 ? 'has-clicks' : ''}`}>
                      {url.clicks}
                    </span>
                  </div>
                  <div className="col created">
                    {formatDate(url.createdAt)}
                  </div>
                  <div className="col actions">
                    {editingUrl === url._id ? (
                      <div className="edit-actions">
                        <button 
                          onClick={() => handleSaveEdit(url._id)}
                          className="save-btn"
                          disabled={!editValue.trim()}
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(url)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(url._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this URL? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={() => confirmDelete(deleteConfirm)}
                className="confirm-delete-btn"
              >
                Yes, Delete
              </button>
              <button 
                onClick={cancelDelete}
                className="cancel-delete-btn"
              >
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