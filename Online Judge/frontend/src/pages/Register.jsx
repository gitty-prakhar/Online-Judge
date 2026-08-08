import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', email: '', password: '', adminSecret: '', otp: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await api.post('/users/send-registration-otp', { email: form.email, username: form.username });
      setMsg('OTP sent to your email! (Check backend console if using Ethereal)');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { 
      setLoading(false); 
    }
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);
    try {
      await api.post('/users/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="page-sm">
      <div className="card">
        <h1 style={{marginBottom: 4}}>Create account</h1>
        <p style={{marginBottom: 24}}>
          {step === 1 ? 'Start solving or setting problems today' : 'Verify your email to complete registration'}
        </p>
        
        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div className="form-group">
              <label>Username</label>
              <input placeholder="johndoe" value={form.username}
                onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 8 characters" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Admin Registration Code (Optional)</label>
              <input type="password" placeholder="Leave blank for regular user" value={form.adminSecret}
                onChange={e => setForm({...form, adminSecret: e.target.value})} />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" style={{width:'100%', marginTop: 8}} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitRegistration}>
            {msg && <p className="success-msg" style={{marginBottom:12}}>{msg}</p>}
            <div className="form-group">
              <label>OTP</label>
              <input value={form.otp} onChange={e => setForm({...form, otp: e.target.value})} placeholder="6-digit code from email" required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" style={{width:'100%', marginTop: 8}} disabled={loading}>
              {loading ? 'Creating...' : 'Verify & Register'}
            </button>
            <p style={{marginTop: 16, textAlign:'center', fontSize:14}}>
              <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); }}>← Back</a>
            </p>
          </form>
        )}
        
        {step === 1 && (
          <p style={{marginTop: 16, textAlign: 'center', fontSize: 14}}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}
