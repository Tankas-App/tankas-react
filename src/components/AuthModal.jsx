import { useState } from 'react';

function AuthModal({ type, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-[#0e1a13] dark:text-white">
          {type === 'signup' ? 'Join Tankas' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-[#0e1a13] dark:text-white">Display Name (Optional)</label>
              <input
                type="text"
                name="displayName"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-[#0e1a13] dark:text-white">Username</label>
            <input
              type="text"
              name="username"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-[#0e1a13] dark:text-white">Email</label>
              <input
                type="email"
                name="email"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-[#0e1a13] dark:text-white">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength="6"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {type === 'signup' && <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-[#0e1a13] font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center mt-6">
            <span>{loading ? 'Processing...' : (type === 'signup' ? 'Sign Up' : 'Log In')}</span>
            {loading && <div className="ml-2 spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
