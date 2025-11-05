import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../utils/api';
import './ReportIssue.css';

function ReportIssue() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [difficulty, setDifficulty] = useState('medium');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [estimatedPoints, setEstimatedPoints] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const points = {
      low: 10,
      medium: 20,
      high: 30,
      easy: 10,
      hard: 30,
    };
    const priorityPoints = points[priority] || 0;
    const difficultyPoints = points[difficulty] || 0;
    setEstimatedPoints(priorityPoints + difficultyPoints);
  }, [priority, difficulty]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priority', priority);
    formData.append('difficulty', difficulty);
    formData.append('image', photo);

    try {
      await fetchAPI('/api/issues', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': null, // Let the browser set the content type for FormData
        },
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to report issue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-40 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-12 shrink-0 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-gray-800 dark:text-gray-200 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-display">
          Report New Issue
        </h2>
        <div className="flex size-12 shrink-0 items-center"></div>
      </div>

      {/* Form Container */}
      <div className="flex-grow p-4 space-y-6 max-w-2xl mx-auto w-full">
        <form id="reportIssueForm" className="space-y-6" onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="flex flex-col">
            <label className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal pb-2 font-display">Title *</label>
            <input
              type="text"
              required
              className="form-input w-full rounded-lg text-gray-800 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/20 h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-4 text-base font-normal leading-normal font-display"
              placeholder="e.g., Overflowing trash can"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col">
            <label className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal pb-2 font-display">Description *</label>
            <textarea
              required
              rows="5"
              className="form-input w-full rounded-lg text-gray-800 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/20 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-4 text-base font-normal leading-normal font-display resize-none"
              placeholder="Provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Priority Selection */}
          <div className="flex flex-col">
            <label className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal pb-2 font-display">Priority *</label>
            <select
              required
              className="form-select w-full rounded-lg text-gray-800 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/20 h-14 p-4 text-base font-normal leading-normal font-display"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="flex flex-col">
            <label className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal pb-2 font-display">Difficulty *</label>
            <select
              required
              className="form-select w-full rounded-lg text-gray-800 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/20 h-14 p-4 text-base font-normal leading-normal font-display"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Photo Upload Section */}
          <div className="flex flex-col">
            <label className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal pb-2 font-display">Photo * (GPS will be extracted automatically)</label>
            <div className="relative">
              <input type="file" id="photoInput" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} required />
              <button type="button" onClick={() => document.getElementById('photoInput').click()} className="w-full flex items-center justify-center gap-2 rounded-lg h-14 px-5 bg-primary/30 text-gray-800 dark:text-gray-200 hover:bg-primary/40 transition-colors text-base font-bold leading-normal tracking-[0.015em] font-display">
                <span className="material-symbols-outlined">camera_alt</span>
                <span>{preview ? 'Change Picture' : 'Take or Upload a Picture'}</span>
              </button>
            </div>

            {preview && (
              <div id="photoPreview" className="mt-4">
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg shadow-md" />
                  <button type="button" onClick={removePhoto} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div id="gpsStatus" className="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-500">location_searching</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Extracting GPS data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Points Preview */}
          <div id="pointsPreview" className="p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Estimated Points:</span>
              <span id="estimatedPoints" className="text-2xl font-bold text-primary">{estimatedPoints}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on priority and difficulty</p>
          </div>
        </form>
      </div>

      {/* Submit Button (Sticky) */}
      <div className="sticky bottom-0 p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <button type="submit" form="reportIssueForm" className="w-full max-w-2xl mx-auto flex items-center justify-center rounded-lg h-14 px-5 bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] font-display hover:opacity-90 transition-opacity" disabled={loading}>
          <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
        </button>
      </div>
    </div>
  );
}

export default ReportIssue;
