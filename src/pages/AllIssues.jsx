import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadAllIssues } from '../utils/api';
import IssueCard from '../components/IssueCard';
import './AllIssues.css';

function AllIssues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const allIssues = await loadAllIssues();
        setIssues(allIssues);
      } catch (error) {
        console.error('Failed to load issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#0e1a13] dark:text-white">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-800 dark:text-gray-200 flex size-12 shrink-0 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2
          className="text-gray-800 dark:text-gray-200 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-display"
        >
          All Issues
        </h2>
        <div className="flex size-12 shrink-0 items-center"></div>
      </div>

      {/* Hero Section */}
      <div className="py-20 text-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-5xl font-bold mb-4">All Community Issues</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore every reported sanitation issue and find a cleanup effort near
          you.
        </p>
      </div>

      {/* Main Content */}
      <div className="px-4 py-16 max-w-7xl mx-auto w-full">
        {/* Search and Filter */}
        <div className="mb-10 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or description..."
            className="flex-1 px-4 py-3 border-none rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button className="bg-primary text-[#0e1a13] font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">filter_alt</span>
            Filter
          </button>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                  <div className="h-48 skeleton"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 skeleton rounded"></div>
                    <div className="h-4 skeleton rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          )}
        </div>

        {/* Loading More Indicator */}
        <div className="text-center mt-10 hidden">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Loading more...</p>
          <div className="spinner mx-auto" style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
        </div>

        {/* End of Reports */}
        <div className="text-center mt-10 hidden">
          <p className="text-gray-500 dark:text-gray-400">
            ✓ You've reached the end of the reports.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 Tankas. Making communities cleaner, together.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AllIssues;
