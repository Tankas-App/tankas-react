import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAPI, showToast } from '../utils/api';

function Pledge() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [rewardType, setRewardType] = useState('money');
  const [rewardAmount, setRewardAmount] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pledges, setPledges] = useState([]);
  const [pledgesLoading, setPledgesLoading] = useState(true);
  const [pledgesError, setPledgesError] = useState(null);
  const [volunteersList, setVolunteersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    refreshIssue();
    refreshPledges();
    refreshVolunteers();
    refreshCurrentUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refreshIssue = async () => {
    setLoading(true);
    try {
      const issueData = await fetchAPI(`/api/issues/${id}`);
      setIssue(issueData);
      setError(null);
    } catch (err) {
      console.error('Failed to load issue:', err);
      setError(err.message || 'Unable to fetch issue information.');
    } finally {
      setLoading(false);
    }
  };

  const refreshVolunteers = async () => {
    try {
      const data = await fetchAPI(`/api/issues/${id}/volunteers`);
      setVolunteersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load volunteers:', err);
    }
  };

  const refreshCurrentUser = async () => {
    try {
      const user = await fetchAPI('/api/users/me');
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to load current user:', err);
    }
  };

  const refreshPledges = async () => {
    setPledgesLoading(true);
    try {
      const data = await fetchAPI(`/api/issues/${id}/pledges`);
      setPledges(Array.isArray(data) ? data : []);
      setPledgesError(null);
    } catch (err) {
      console.error('Failed to load pledges:', err);
      setPledgesError(err.message || 'Unable to load pledges.');
    } finally {
      setPledgesLoading(false);
    }
  };

  const getUserPledges = (pledges, user) => {
    if (!user) return [];
    return pledges.filter((pledge) => pledge.pledger_id === user.id);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!amount) {
      showToast('Please enter an amount to pledge.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await fetchAPI(`/api/issues/${id}/pledge`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(amount),
          note: details,
          reward_type: rewardType,
          reward_amount: Number(rewardAmount || 0),
          reward_description: rewardDescription,
        }),
      });
      showToast('Thank you for pledging!');
      setAmount('');
      setDetails('');
      setRewardAmount('');
      setRewardDescription('');
      await refreshIssue();
      await refreshPledges();
      navigate(`/issue-details/${id}`);
    } catch (err) {
      console.error('Failed to submit pledge:', err);
      showToast(err.message || 'We could not complete your pledge. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

  const issueVolunteerFallback = issue
    ? issue.volunteer_count ?? (Array.isArray(issue.volunteers) ? issue.volunteers.length : 0)
    : 0;
  const volunteerCount = volunteersList.length || issueVolunteerFallback;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-base text-text-dark dark:text-white">Loading pledge details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-center px-6">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-3 rounded-full bg-primary text-[#0e1a13] font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#0a0f19] dark:text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <button onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold font-display">Pledge</h1>
        <span className="material-symbols-outlined">more_vert</span>
      </header>

      <main className="p-4 space-y-6 lg:max-w-4xl lg:mx-auto">
        <section className="rounded-2xl overflow-hidden bg-card-light dark:bg-card-dark shadow-lg">
          <div
            className="h-52 w-full bg-center bg-cover"
            style={{ backgroundImage: `url(${issue.picture_url || '/assets/placeholder-issue.jpg'})` }}
          >
            <div className="h-full w-full bg-gradient-to-b from-black/30 to-black/80 flex flex-col justify-end p-4">
              <p className="text-xs uppercase tracking-widest text-gray-200">{issue.category || 'Sanitation'}</p>
              <h2 className="text-2xl font-bold text-white">{issue.title}</h2>
              <p className="text-sm text-gray-200 mt-1">{issue.location}</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-[#475569] dark:text-gray-400">Status</span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-600/40 text-yellow-800 dark:text-yellow-200">
                {issue.status?.replace('_', ' ') || 'Open'}
              </span>
            </div>
            <p className="text-sm text-[#475569] dark:text-gray-300">{issue.description}</p>
            <p className="text-xs text-[#475569] dark:text-gray-400">{volunteerCount} volunteers supporting this effort</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light dark:border-border-dark">
              <div>
                <p className="text-xs uppercase text-[#475569] dark:text-gray-400">Volunteers</p>
                <p className="text-2xl font-semibold text-[#0a0f19] dark:text-white">{volunteerCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[#475569] dark:text-gray-400">Pledged</p>
                <p className="text-2xl font-semibold text-[#0a0f19] dark:text-white">{formatCurrency(issue.pledged_amount)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="p-5 rounded-2xl bg-white dark:bg-gray-900 shadow-lg space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0a0f19] dark:text-white">Support this effort</h3>
            <p className="text-sm text-[#475569] dark:text-gray-300">
              All pledges go toward tools, cleanups, and volunteer coordination. Choose an amount that makes sense for you and add a short note if you like.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* <label className="block text-sm font-semibold text-[#0a0f19] dark:text-white">
              Pledge Amount (USD)
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-background-light/60 dark:bg-background-dark/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter amount"
              />
            </label> */}
            {/* <label className="block text-sm font-semibold text-[#0a0f19] dark:text-white">
              Message (optional)
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows="3"
                className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-background-light/60 dark:bg-background-dark/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Share why this issue matters to you"
              ></textarea>
            </label> */}

            <div className="space-y-4 pt-2 border-t border-border-light dark:border-border-dark">
              <label className="block text-sm font-semibold text-[#0a0f19] dark:text-white">
                Reward Type
                <input
                  type="text"
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-background-light/60 dark:bg-background-dark/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe the reward item (e.g., custom gear, volunteer dinner)"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0a0f19] dark:text-white">
                Reward Amount
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-background-light/60 dark:bg-background-dark/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </label>
              <label className="block text-sm font-semibold text-[#0a0f19] dark:text-white">
                Reward Description (optional)
                <textarea
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  rows="2"
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-background-light/60 dark:bg-background-dark/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe what donors receive"
                ></textarea>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary text-[#0e1a13] font-bold py-3 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Pledge'}
            </button>
          </form>
        </section>

        <section className="p-5 rounded-2xl bg-card-light dark:bg-card-dark shadow-lg space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0a0f19] dark:text-white">Recent Pledges</h3>
            <p className="text-sm text-[#475569] dark:text-gray-300">
              {getUserPledges(pledges, currentUser).length ? 'Latest contributions to this issue.' : 'No pledges yet. Be the first to contribute!'}
            </p>
          </div>
          {pledgesLoading ? (
            <p className="text-sm text-[#475569] dark:text-gray-300">Loading pledges...</p>
          ) : pledgesError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{pledgesError}</p>
          ) : (
            <div className="space-y-3">
              {getUserPledges(pledges, currentUser).length === 0 ? (
                <p className="text-sm text-[#475569] dark:text-gray-300">No pledges yet.</p>
              ) : (
                getUserPledges(pledges, currentUser).map((pledge) => (
                  <div key={pledge.id} className="border border-border-light dark:border-border-dark rounded-xl p-3 bg-white dark:bg-gray-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#0a0f19] dark:text-white">{pledge.pledger_username || pledge.pledger_id}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{pledge.status || 'pending'}</span>
                    </div>
                    <p className="text-sm text-[#475569] dark:text-gray-300">{pledge.reward_description || 'No reward description provided.'}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-[#475569] dark:text-gray-300">
                      <span>Amount: {formatCurrency(pledge.reward_amount || pledge.amount)}</span>
                      <span>Reward: {pledge.reward_type || '—'}</span>
                      <span>Created: {formatDate(pledge.created_at)}</span>
                      <span>Distributed: {formatDate(pledge.distributed_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Pledge;