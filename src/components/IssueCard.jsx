import { useNavigate } from 'react-router-dom';

function IssueCard({ issue }) {
  const navigate = useNavigate();

  const statusColors = {
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const pointsBadge = issue.points_assigned > 0 ? (
    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-medium ml-2">
      {issue.points_assigned} Pts
    </span>
  ) : null;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
      onClick={() => navigate(`/issue-details/${issue.id}`)}
    >
      <img
        src={issue.picture_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&auto=format&fit=crop'}
        alt={issue.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-[#0e1a13] dark:text-white">{issue.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{issue.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[issue.status] || statusColors['open']}`}>
              {(issue.status || 'open').replace('_', ' ').toUpperCase()}
            </span>
            {pointsBadge}
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span className="material-symbols-outlined text-lg">group</span>
            <span>{issue.volunteer_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueCard;
