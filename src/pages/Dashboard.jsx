import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Loading...');
  const [userPoints, setUserPoints] = useState('0 Points');
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [issuesReported, setIssuesReported] = useState(0);
  const [communityRank, setCommunityRank] = useState('#-');

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setUserName('John Doe');
      setUserPoints('1,250 Points');
      setTasksCompleted(12);
      setIssuesReported(5);
      setCommunityRank('#42');
    }, 1500);
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-20">
      {/* Top App Bar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 skeleton"></div>
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
            <span className="hidden absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
          </button>
          <button onClick={() => navigate('/')} className="flex items-center justify-center h-12 w-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-text-dark dark:text-text-light">logout</span>
          </button>
        </div>
      </div>

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
        <div id="map" className="w-full h-80 rounded-lg shadow-md"></div>
        
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
        <div className="flex flex-col gap-2">
          {/* Skeleton loaders */}
          <div className="activity-skeleton">
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-lg skeleton"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-3/4"></div>
                <div className="h-3 skeleton rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="activity-skeleton">
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className.jsx="w-12 h-12 rounded-lg skeleton"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-3/4"></div>
                <div className="h-3 skeleton rounded w-1/2"></div>
              </div>
            </div>
          </div>
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
