import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = async () => {
    try { await api.post('/users/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⚡ CodeJudge</Link>
      <div className="navbar-links">
        <Link to="/problems">Problems</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/contests">Contests</Link>
        {user?.role === 'admin' && (
          <>
            <Link to="/create-problem" style={{ color: 'var(--green)', fontWeight: 600 }}>➕ Problem</Link>
            <Link to="/create-contest" style={{ color: 'var(--green)', fontWeight: 600 }}>➕ Contest</Link>
          </>
        )}
      </div>
      <div className="navbar-user">
        {user ? (
          <>
            <Link to={`/profile/${user.username}`}>👤 {user.username}</Link>
            <button className="btn-primary btn-sm" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register"><button className="btn-primary btn-sm">Register</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
