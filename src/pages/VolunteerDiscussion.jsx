import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAPI } from '../utils/api';
import './VolunteerDiscussion.css';

function VolunteerDiscussion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        const [issueData, messagesData] = await Promise.all([
          fetchAPI(`/api/issues/${id}`),
          fetchAPI(`/api/issues/${id}/comments`),
        ]);
        setIssue(issueData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to load discussion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussion();
  }, [id]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const sentMessage = await fetchAPI(`/api/issues/${id}/comments`,
          {
            method: 'POST',
            body: JSON.stringify({ content: newMessage }),
          });
        setMessages([...messages, sentMessage]);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleVolunteer = async () => {
    try {
      await fetchAPI(`/api/issues/${id}/volunteer`, { method: 'POST' });
      setShowModal(false);
      // Optionally, you can show a success toast here
    } catch (error) {
      console.error('Failed to volunteer:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#f9f9f9] dark:bg-[#122017] group/design-root overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#e8f2ec] dark:border-[#2c3e34]">
        <div className="flex items-center gap-4">
          <button className="text-[#0e1a13] dark:text-white" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img alt="User avatar" className="w-10 h-10 rounded-full" src={issue?.picture_url} />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-[#122017]"></span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#0e1a13] dark:text-white">{issue?.title}</h1>
              <p className="text-sm text-[#51946c] dark:text-[#a3b1a9]">{issue?.volunteer_count} Active Volunteers</p>
            </div>
          </div>
        </div>
        <button className="text-[#0e1a13] dark:text-white" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Main Discussion Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`message-group ${message.is_own ? 'own' : ''}`}>
            <img alt={`${message.user.display_name} avatar`} className="message-avatar" src={message.user.avatar} />
            <div className="message-content">
              <div className="message-bubble">{message.content}</div>
              <div className="message-time">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </main>

      {/* Message Input Footer */}
      <footer className="p-4 border-t border-[#e8f2ec] dark:border-[#2c3e34]">
        <div className="flex items-center gap-2 bg-[#e8f2ec] dark:bg-[#1a2b21] rounded-full p-2">
          <button className="text-[#51946c] dark:text-[#a3b1a9] p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <input
            className="flex-1 bg-transparent text-[#0e1a13] dark:text-white placeholder:text-[#51946c] dark:placeholder:text-[#a3b1a9] focus:outline-none text-sm"
            placeholder="Type a message..."
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="text-[#51946c] dark:text-[#a3b1a9] p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button onClick={handleSendMessage} className="bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </footer>

      {showModal && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Volunteering</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to volunteer for this issue?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleVolunteer}>Yes, Volunteer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerDiscussion;
