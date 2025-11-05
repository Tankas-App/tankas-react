import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, setToken, showToast, signup, login, loadRecentIssues } from '../utils/api';
import AuthModal from '../components/AuthModal';
import IssueCard from '../components/IssueCard';

function Home() {
  const navigate = useNavigate();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!getToken();

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const issues = await loadRecentIssues(3);
      setRecentIssues(issues);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (formData) => {
    try {
      const response = await signup(
        formData.username,
        formData.email,
        formData.password,
        formData.displayName
      );
      setToken(response.access_token);
      showToast('🎉 Welcome to Tankas! Your account has been created.', 'success');
      setShowSignupModal(false);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      showToast(error.message || 'Signup failed. Please try again.', 'error');
      throw error;
    }
  };

  const handleLogin = async (formData) => {
    try {
      const response = await login(formData.username, formData.password);
      setToken(response.access_token);
      showToast('👋 Welcome back to Tankas!', 'success');
      setShowLoginModal(false);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      showToast(error.message || 'Login failed. Check your credentials.', 'error');
      throw error;
    }
  };

  const handleMainCta = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      setShowSignupModal(true);
    }
  };

  const handleLoginCta = () => {
    if (isLoggedIn) {
      navigate('/report-issue');
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#0e1a13] dark:text-white">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full overflow-hidden">
        {/* Hero Image */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: 'url("/assets/imgs/volunteers-picking-up-trash-in-a-green-city-park-2025-06-02-20-20-12-utc.jpg")',
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 hero-overlay"></div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
          <h1 className="text-4xl md:text-4xl lg:text-4xl font-bold leading-tight text-white mb-6 max-w-4xl">
            Cleaner Communities, Together.
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">
            Report sanitation issues, volunteer for cleanups, and make a real impact in your community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
            <button
              onClick={handleMainCta}
              className="flex-1 bg-primary text-[#0e1a13] font-bold py-4 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Join the Movement'}
            </button>
            <button
              onClick={handleLoginCta}
              className="flex-1 bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-lg text-lg border-2 border-white/30 hover:bg-white/20 transition-all shadow-lg"
            >
              {isLoggedIn ? 'Report New Issue' : 'Log In'}
            </button>
          </div>

          {/* Testimonial */}
          <div className="mt-12 flex items-center space-x-2 text-white">
            <span className="material-symbols-outlined text-yellow-400 text-2xl">star</span>
            <p className="text-lg italic">"Snap.Share.Clean!"</p>
          </div>
        </div>
      </div>

      {/* Recent Community Reports Section */}
      <div className="px-4 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Recent Community Reports</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">See what your neighbors are working on</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton loaders
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                  <div className="h-48 skeleton"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 skeleton rounded"></div>
                    <div className="h-4 skeleton rounded"></div>
                    <div className="h-4 skeleton rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </>
          ) : recentIssues.length > 0 ? (
            recentIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                ✨ No active reports nearby. Your community is clean!
              </p>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/all-issues')}
            className="bg-primary text-[#0e1a13] font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity inline-block"
          >
            View All Reports
          </button>
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

      {/* Modals */}
      {showSignupModal && (
        <AuthModal
          type="signup"
          onClose={() => setShowSignupModal(false)}
          onSubmit={handleSignup}
        />
      )}
      {showLoginModal && (
        <AuthModal
          type="login"
          onClose={() => setShowLoginModal(false)}
          onSubmit={handleLogin}
        />
      )}
    </div>
  );
}

export default Home;
