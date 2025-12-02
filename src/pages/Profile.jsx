import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI, removeToken } from '../utils/api';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [userData, dashboardData] = await Promise.all([
          fetchAPI('/api/users/me'),
          fetchAPI('/api/users/dashboard'),
        ]);
        setUser(userData);
        setStats(dashboardData);
        setDisplayName(userData.display_name || userData.username);
      } catch (error) {
        console.error('Failed to load profile:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await fetchAPI('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ display_name: displayName }),
      });
      setUser(updatedUser);
      setEditMode(false);
      localStorage.setItem('tankas_user_updated', Date.now().toString());
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const updatedUser = await fetchAPI('/api/users/me/avatar', {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': null, // Let the browser set the content type for FormData
        },
      });
      setUser(updatedUser);
      setAvatarPreview(null);
      localStorage.setItem('tankas_user_updated', Date.now().toString());
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (loading || !user || !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="profile-header">
        <div className="max-w-md mx-auto text-center">
          <button className="back-btn" onClick={() => navigate(-1)} style={{ display: 'block', margin: '0 auto 1rem' }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div className="avatar-container">
            <img
              alt="Profile avatar"
              className="avatar-img"
              src={avatarPreview || user.avatar}
            />
            <button className="avatar-upload-btn" onClick={() => document.getElementById('avatarInput').click()} title="Change avatar">
              <span className="material-symbols-outlined">camera_alt</span>
            </button>
            <input type="file" id="avatarInput" accept="image/*" onChange={handleAvatarUpload} />
          </div>

          <h1 className="text-2xl font-bold">{user.display_name || user.username}</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className={`profile-content ${editMode ? 'edit-mode' : 'view-mode'}`}>
        {/* Edit Display Name Section */}
        {!editMode ? (
          <div className="profile-section">
            <div className="info-row">
              <span className="info-label">Display Name</span>
              <span className="info-value">{user.display_name || user.username}</span>
            </div>
            <button className="btn btn-secondary btn-full" onClick={() => setEditMode(true)}>
              <span className="material-symbols-outlined">edit</span>
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="profile-section">
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label htmlFor="displayNameInput">Display Name</label>
              <input
                type="text"
                id="displayNameInput"
                placeholder="Enter your display name"
                maxLength="50"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="button-group">
              <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* User Stats */}
        <div className="profile-section">
          <h2>Statistics</h2>
          <div className="info-row">
            <span className="info-label">Points</span>
            <span className="info-value">{user.points}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Issues Reported</span>
            <span className="info-value">{stats.tasks_reported}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tasks Completed</span>
            <span className="info-value">{stats.tasks_completed}</span>
          </div>
        </div>

        {/* Account Section */}
        <div className="profile-section">
          <h2>Account</h2>
          <div className="info-row">
            <span className="info-label">Username</span>
            <span className="info-value">{user.username}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          <button className="btn btn-secondary btn-full" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
