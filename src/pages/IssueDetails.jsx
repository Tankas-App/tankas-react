import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAPI } from '../utils/api';
import './IssueDetails.css';

function IssueDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        const [issueData, volunteersData, commentsData] = await Promise.all([
          fetchAPI(`/api/issues/${id}`),
          fetchAPI(`/api/issues/${id}/volunteers`),
          fetchAPI(`/api/issues/${id}/comments`),
        ]);
        setIssue(issueData);
        setVolunteers(volunteersData);
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to load issue details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!issue) {
    return <div>Issue not found</div>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <button onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold font-display">Issue Details</h1>
        <button>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="p-4 space-y-6 pb-24">
        {/* Issue Header Card */}
        <div className="p-4 space-y-4 rounded-lg bg-card-light dark:bg-card-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display">{issue.title}</h2>
            <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300`}>
              <span className="material-symbols-outlined text-base">hourglass_top</span>
              <span>{issue.status}</span>
            </div>
          </div>
          <p className="text-text-muted-light dark:text-text-muted-dark">{issue.description}</p>
          <div className="flex items-center text-sm text-text-muted-light dark:text-text-muted-dark">
            <span className="material-symbols-outlined mr-2 text-base">location_on</span>
            <span>{issue.location}</span>
          </div>
        </div>

        {/* Pictures Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Pictures</h3>
          <div className="grid grid-cols-2 gap-2">
            <img src={issue.picture_url} alt={`Issue image`} className="w-full h-40 object-cover rounded-lg" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center p-4 space-x-3 rounded-lg bg-card-light dark:bg-card-dark">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
              <span className="text-2xl material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{volunteers.length}</p>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Volunteers</p>
            </div>
          </div>
          <div className="flex items-center p-4 space-x-3 rounded-lg bg-card-light dark:bg-card-dark">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
              <span className="text-2xl material-symbols-outlined">volunteer_activism</span>
            </div>
            <div>
              <p className="text-2xl font-bold">GHS{issue.pledged_amount || 0}</p>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Pledged</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Comments ({comments.length})</h3>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.user.avatar} alt={`${comment.user.display_name} avatar`} className="w-10 h-10 rounded-full" />
                <div className="flex-1 p-3 rounded-lg bg-card-light dark:bg-card-dark">
                  <div className="flex items-baseline justify-between">
                    <p className="font-bold">{comment.user.display_name}</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">{new Date(comment.created_at).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          <div className="mt-6 space-y-3">
            <textarea
              className="w-full p-3 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark resize-none focus:outline-none focus:border-primary"
              placeholder="Add a comment..."
              rows="3"
            ></textarea>
            <button className="w-full px-4 py-3 bg-primary text-text-light font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">send</span>
              Post Comment
            </button>
          </div>
        </div>
      </main>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex gap-4">
          <button onClick={() => navigate(`/volunteer-discussion/${id}`)} className="flex-1 h-14 bg-primary text-white font-display font-bold text-lg rounded-xl shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">pan_tool</span>
            Volunteer
          </button>
          <button onClick={() => navigate(`/resolve-issue/${id}`)} className="flex-1 h-14 bg-green-600 text-white font-display font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">done_all</span>
            Resolve Issue
          </button>
        </div>
      </div>
    </div>
  );
}

export default IssueDetails;
