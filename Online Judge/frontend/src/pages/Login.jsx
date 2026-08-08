import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/users/login', form);
      localStorage.setItem('accessToken', res.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/problems');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-sm">
      <div className="card">
        <h1 style={{marginBottom: 4}}>Welcome back</h1>
        <p style={{marginBottom: 24}}>Login to your CodeJudge account</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input type="text" placeholder="you@example.com or johndoe" value={form.identifier}
              onChange={e => setForm({...form, identifier: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" style={{width:'100%', marginTop: 8}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{marginTop: 16, textAlign: 'center', fontSize: 14}}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p style={{marginTop: 8, textAlign: 'center', fontSize: 14}}>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}
