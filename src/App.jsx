import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AllIssues from './pages/AllIssues';
import IssueDetails from './pages/IssueDetails';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import ResolveIssue from './pages/ResolveIssue';
import VolunteerDiscussion from './pages/VolunteerDiscussion';
import Pledge from './pages/Pledge';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-issues" element={<AllIssues />} />
        <Route path="/issue-details/:id" element={<IssueDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/resolve-issue/:id" element={<ResolveIssue />} />
        <Route path="/volunteer-discussion/:id" element={<VolunteerDiscussion />} />
        <Route path="/pledge/:id" element={<Pledge />} />
      </Routes>
    </Router>
  );
}

export default App;
