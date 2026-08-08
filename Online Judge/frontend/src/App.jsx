import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Leaderboard from './pages/Leaderboard';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import CreateProblem from './pages/CreateProblem';
import CreateContest from './pages/CreateContest';

function PrivateRoute({ children }) {
  return localStorage.getItem('accessToken') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/problems" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:slug" element={<PrivateRoute><ProblemDetail /></PrivateRoute>} />
        <Route path="/create-problem" element={<PrivateRoute><CreateProblem /></PrivateRoute>} />
        <Route path="/create-contest" element={<PrivateRoute><CreateContest /></PrivateRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<ContestDetail />} />
        <Route path="/profile/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/problems" />} />
      </Routes>
    </BrowserRouter>
  );
}
