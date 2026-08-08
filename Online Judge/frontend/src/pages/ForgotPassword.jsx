import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/users/forgot-password', { email });
      setMsg('OTP sent to your email!');
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const resetPwd = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/users/reset-password', { email, otp, newPassword });
      setMsg('✅ Password reset! You can now login.');
      setStep(3);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-sm">
      <div className="card">
        <h1 style={{marginBottom: 4}}>Forgot Password</h1>
        <p style={{marginBottom: 24}}>
          {step === 1 && "We'll send an OTP to your email"}
          {step === 2 && 'Enter the OTP and your new password'}
          {step === 3 && 'All done!'}
        </p>

        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div className="form-group"><label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn-primary" style={{width:'100%'}} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPwd}>
            {msg && <p className="success-msg" style={{marginBottom:12}}>{msg}</p>}
            <div className="form-group"><label>OTP</label>
              <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" required />
            </div>
            <div className="form-group"><label>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn-primary" style={{width:'100%'}} disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}

        {step === 3 && (
          <div>
            <p className="success-msg" style={{marginBottom: 16}}>{msg}</p>
            <Link to="/login"><button className="btn-primary" style={{width:'100%'}}>Go to Login</button></Link>
          </div>
        )}

        <p style={{marginTop: 16, textAlign:'center', fontSize:14}}>
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
