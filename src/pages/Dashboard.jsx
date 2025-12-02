import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI, loadRecentIssues, removeToken } from '../utils/api';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png?url';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png?url';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png?url';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

const defaultLeafletIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

L.Marker.prototype.options.icon = defaultLeafletIcon;

function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapIssues, setMapIssues] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [userUpdateKey, setUserUpdateKey] = useState(() => localStorage.getItem('tankas_user_updated'));

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [userData, dashboardData] = await Promise.all([
        fetchAPI('/api/users/me'),
        fetchAPI('/api/users/dashboard'),
      ]);
      setUserProfile(userData);
      setStats(dashboardData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const runLoad = async () => {
      if (!isMounted) return;
      await loadDashboard();
    };
    runLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadMap = async () => {
      try {
        const nearby = await loadRecentIssues(6);
        if (!isMounted) return;
        setMapIssues(Array.isArray(nearby) ? nearby : nearby?.results ?? []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load nearby issues:', err);
        setMapError(err.message || 'Unable to load nearby issues.');
      } finally {
        if (!isMounted) return;
        setMapLoading(false);
      }
    };

    loadMap();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const refreshIfNeeded = () => {
      const storedKey = localStorage.getItem('tankas_user_updated');
      if (storedKey && storedKey !== userUpdateKey) {
        setUserUpdateKey(storedKey);
        loadDashboard();
      }
    };
    const handleStorage = (event) => {
      if (event.key === 'tankas_user_updated') {
        refreshIfNeeded();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', refreshIfNeeded);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', refreshIfNeeded);
    };
  }, [userUpdateKey]);

  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat().format(value);
  };

  const userName = loading
    ? 'Loading...'
    : userProfile
    ? userProfile.display_name || userProfile.username
    : 'Your Dashboard';

  const userPoints = `${formatNumber(userProfile?.points ?? 0)} Points`;
  const tasksCompleted = stats?.tasks_completed ?? 0;
  const issuesReported = stats?.tasks_reported ?? 0;
  const communityRank = stats?.community_rank ?? stats?.rank ?? '#-';

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  const activityFeed = (
    stats?.recent_activity ?? stats?.activities ?? mapIssues
  ).filter(Boolean);
  const filteredActivityFeed = activityFeed.filter((activity) => {
    if (!userProfile) return false;
    const actorId = activity?.user_id ?? activity?.performed_by_id ?? activity?.user?.id;
    return actorId === userProfile.id;
  });

  const getIssueCoordinates = (issue) => {
    const latCandidate =
      issue?.latitude ??
      issue?.lat ??
      issue?.location?.latitude ??
      issue?.location?.lat ??
      issue?.location_latitude ??
      issue?.coordinates?.latitude ??
      issue?.coordinates?.lat ??
      issue?.geo?.latitude ??
      issue?.geo?.lat;
    const lngCandidate =
      issue?.longitude ??
      issue?.lng ??
      issue?.location?.longitude ??
      issue?.location?.lng ??
      issue?.location_longitude ??
      issue?.coordinates?.longitude ??
      issue?.coordinates?.lng ??
      issue?.geo?.longitude ??
      issue?.geo?.lng;
    const lat = Number(latCandidate);
    const lng = Number(lngCandidate);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    return [lat, lng];
  };

  const issueMapEntries = mapIssues
    .map((issue) => {
      const coords = getIssueCoordinates(issue);
      if (!coords) return null;
      return { issue, coords };
    })
    .filter(Boolean);

  const fallbackCenter = [6.5244, 3.3792];
  const mapCenter = issueMapEntries.length
    ? issueMapEntries[0].coords
    : fallbackCenter;
  const mapBounds = issueMapEntries.length
    ? L.latLngBounds(issueMapEntries.map(({ coords }) => coords))
    : null;
  const mapKey = mapBounds ? mapBounds.toBBoxString() : 'default-dashboard-map';

  const statusColorMap = {
    open: '#ef4444',
    in_progress: '#facc15',
    resolved: '#22c55e',
  };
  const getStatusColor = (status) => statusColorMap[(status || '').toLowerCase()] || '#6366f1';

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-20">
      {/* Top App Bar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 skeleton">
            {userProfile?.avatar ? (
              <img
                src={userProfile.avatar}
                alt={`${userProfile.display_name || userProfile.username} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-200">
                {userProfile ? (userProfile.display_name || userProfile.username)[0]?.toUpperCase() : ''}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-text-dark dark:text-text-light text-lg font-bold leading-tight tracking-[-0.015em]">
              {userName}
            </h2>
            <p className="text-primary text-sm font-medium">
              {userPoints}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative flex items-center justify-center h-12 w-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-text-dark dark:text-text-light">notifications</span>
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
          </button>
          <button onClick={handleLogout} className="flex items-center justify-center h-12 w-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-text-dark dark:text-text-light">logout</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4">
          <div className="rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 px-4 py-3 mb-4">
            {error}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="flex flex-wrap gap-3 px-4 py-3">
        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-border-light dark:border-border-dark p-4 items-start bg-white dark:bg-background-dark/50 shadow-sm">
          <p className="text-text-dark dark:text-text-light tracking-light text-3xl font-bold leading-tight">{tasksCompleted}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Tasks Completed</p>
        </div>
        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-border-light dark:border-border-dark p-4 items-start bg-white dark:bg-background-dark/50 shadow-sm">
          <p className="text-text-dark dark:text-text-light tracking-light text-3xl font-bold leading-tight">{issuesReported}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Issues Reported</p>
        </div>
        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-border-light dark:border-border-dark p-4 items-start bg-white dark:bg-background-dark/50 shadow-sm">
          <p className="text-text-dark dark:text-text-light tracking-light text-3xl font-bold leading-tight">{communityRank}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Community Rank</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-4 px-4 py-3">
        <button onClick={() => navigate('/report-issue')} className="flex-1 flex items-center justify-center rounded-lg bg-primary text-text-dark py-3 text-base font-bold leading-normal hover:opacity-90 transition-opacity shadow-md">
          <span className="material-symbols-outlined mr-2">add_circle</span> Report Issue
        </button>
        <button onClick={() => navigate('/all-issues')} className="flex-1 flex items-center justify-center rounded-lg bg-secondary text-white py-3 text-base font-bold leading-normal hover:opacity-90 transition-opacity shadow-md">
          <span className="material-symbols-outlined mr-2">search</span> Find a Task
        </button>
      </div>

      {/* Map Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-dark dark:text-text-light text-lg font-bold leading-tight tracking-[-0.015em]">Nearby Issues</h3>
          <button className="text-primary text-sm font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </button>
        </div>
        
        {/* Map Container */}
        <div className="rounded-2xl bg-card-light dark:bg-card-dark shadow-lg p-3">
          {mapLoading ? (
            <div className="map-loading">
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading map...</span>
            </div>
          ) : mapError ? (
            <div className="px-4 py-6 rounded-lg bg-red-50 text-sm text-red-600 border border-red-200">
              {mapError}
            </div>
          ) : (
            <MapContainer
              key={mapKey}
              center={mapCenter}
              zoom={12}
              bounds={mapBounds || undefined}
              boundsOptions={mapBounds ? { padding: [40, 40] } : undefined}
              className="w-full h-80 rounded-lg shadow-md"
              style={{ minHeight: '320px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {issueMapEntries.map(({ issue, coords }) => {
                const statusColor = getStatusColor(issue.status);
                return (
                  <CircleMarker
                    key={issue.id}
                    center={coords}
                    radius={8}
                    pathOptions={{ color: statusColor, fillColor: statusColor, fillOpacity: 0.85, weight: 1.5 }}
                  >
                    <Popup>
                      <p className="font-semibold text-sm">{issue.title}</p>
                      <p className="text-xs text-gray-600">{issue.status?.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{issue.location}</p>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Map Legend */}
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Open</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Resolved</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-black"></div>
            <span className="text-gray-600 dark:text-gray-400">My Location</span>
          </div>
        </div>
      </div>

      {/* My Activity Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-dark dark:text-text-light text-lg font-bold leading-tight tracking-[-0.015em]">My Activity</h3>
          <button className="text-primary text-sm font-medium">View All</button>
        </div>
        
        {/* Activity Feed */}
        <div className="flex flex-col gap-3">
          {filteredActivityFeed.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-state-icon">history</span>
              <p className="text-gray-600 dark:text-gray-400">No activity yet. Start reporting an issue to see your actions here.</p>
            </div>
          ) : (
            filteredActivityFeed.map((activity, index) => (
              <div
                key={activity.id ?? index}
                className="activity-item flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-border-light dark:border-gray-700"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-text-dark dark:text-white">
                    {activity.title ?? activity.activity ?? 'Community Action'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.description ?? activity.notes ?? activity.status ?? ''}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full activity-status-${(activity.status || 'open').replace(' ', '_')}`}
                >
                  {(activity.status || 'open').replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-border-light dark:border-border-dark flex justify-around py-3 shadow-lg z-50">
        <button onClick={() => navigate('/dashboard')} className="nav-item active flex flex-col items-center gap-1">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-xs font-medium">Dashboard</span>
        </button>
        <button onClick={() => navigate('/all-issues')} className="nav-item flex flex-col items-center gap-1">
          <span className="material-symbols-outlined">map</span>
          <span className="text-xs font-medium">Map</span>
        </button>
        <button onClick={() => navigate('/report-issue')} className="nav-item flex flex-col items-center gap-1">
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-xs font-medium">Report</span>
        </button>
        <button onClick={() => navigate('/profile')} className="nav-item flex flex-col items-center gap-1">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default Dashboard;
