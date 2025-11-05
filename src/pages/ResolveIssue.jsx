import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAPI } from '../utils/api';
import './ResolveIssue.css';

function ResolveIssue() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [afterImage, setAfterImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ icon: '', title: '', message: '' });

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const issueData = await fetchAPI(`/api/issues/${id}`);
        setIssue(issueData);
      } catch (error) {
        console.error('Failed to load issue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAfterImage(null);
    setPreview(null);
  };

  const handleResolve = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('after_image', afterImage);

    try {
      await fetchAPI(`/api/issues/${id}/resolve`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': null, // Let the browser set the content type for FormData
        },
      });
      setModalContent({
        icon: 'task_alt',
        title: 'Issue Resolved!',
        message: 'Thank you for making your community cleaner.',
      });
      setShowModal(true);
    } catch (error) {
      console.error('Failed to resolve issue:', error);
      setModalContent({
        icon: 'error',
        title: 'Error',
        message: error.message || 'Failed to resolve issue. Please try again.',
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalContent.icon === 'task_alt') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root">
      <header className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-text-light dark:text-text-dark hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-bold text-lg text-text-light dark:text-text-dark">Resolve Issue</h1>
        </div>
        <button className="text-text-light dark:text-text-dark hover:opacity-70 transition-opacity">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading && !issue ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <span className="material-symbols-outlined text-4xl text-primary">refresh</span>
              </div>
              <p className="mt-4 text-text-light dark:text-text-dark">Loading issue details...</p>
            </div>
          </div>
        ) : issue && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-xl text-green-600 text-text-light dark:text-text-dark">{issue.title}</h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Reported by {issue.reporter.display_name}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-md text-text-light dark:text-text-dark mb-2">Before</h3>
                <div className="aspect-video bg-card-light dark:bg-card-dark rounded-xl overflow-hidden">
                  <img src={issue.picture_url} alt="Before image of the issue" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-md text-text-light dark:text-text-dark mb-2">After</h3>
                <form encType="multipart/form-data">
                  <div className="aspect-video bg-card-light dark:bg-card-dark border-2 border-dashed border-border-light dark:border-border-dark rounded-xl flex flex-col items-center justify-center text-center p-4">
                    {!preview ? (
                      <div className="flex flex-col items-center justify-center space-y-2 text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                        <p className="font-semibold">Upload 'After' Picture</p>
                        <p className="text-xs">Show the amazing work you've done!</p>
                        <input accept="image/*" className="sr-only" id="afterImageUpload" name="after_image" type="file" onChange={handleImageChange} />
                        <label className="mt-2 cursor-pointer bg-green-600 text-primary dark:bg-primary/30 dark:text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors" htmlFor="afterImageUpload">
                          Choose File
                        </label>
                      </div>
                    ) : (
                      <div className="w-full">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button type="button" onClick={removeImage} className="mt-2 w-full bg-red-500/20 text-red-500 px-4 py-2 rounded-full text-sm font-bold hover:bg-red-500/30 transition-colors">
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 border-t border-border-light dark:border-border-dark">
        <button onClick={handleResolve} className="w-full bg-green-600 text-white py-4 rounded-full font-bold text-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!afterImage || loading}>
          <span className="material-symbols-outlined">task_alt</span>
          {loading ? 'Submitting...' : 'Mark as Resolved'}
        </button>
      </footer>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-card-dark rounded-xl p-6 max-w-sm w-full shadow-lg">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl block mb-4 text-primary">{modalContent.icon}</span>
              <h2 className="font-bold text-xl text-text-light dark:text-text-dark mb-2">{modalContent.title}</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">{modalContent.message}</p>
              <button onClick={closeModal} className="w-full bg-green-600 text-white py-2 rounded-full font-bold hover:bg-primary/90 transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResolveIssue;
