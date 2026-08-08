import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get(`/contests/${id}`).then(r => setContest(r.data.data)).catch(() => navigate('/contests')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const register = async () => {
    if (!localStorage.getItem('accessToken')) { navigate('/login'); return; }
    setRegistering(true);
    try {
      await api.post(`/contests/${id}/register`);
      setMsg('✅ Registered successfully!');
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally { setRegistering(false); }
  };

  if (loading) return <div className="spinner" />;
  if (!contest) return null;

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isRegistered = user && contest.participants?.includes(user._id);

  return (
    <div className="page" style={{maxWidth: 800}}>
      <h1>{contest.title}</h1>
      <p style={{marginBottom: 24, fontSize: 13}}>
        🕐 {new Date(contest.startTime).toLocaleString()} → {new Date(contest.endTime).toLocaleString()}
      </p>

      <div style={{display:'flex', gap: 16, marginBottom: 24}}>
        <button
          className="btn-primary"
          onClick={register}
          disabled={registering || isRegistered}
        >
          {isRegistered ? '✅ Registered' : registering ? 'Registering...' : 'Register for Contest'}
        </button>
      </div>
      {msg && <p style={{marginBottom: 16, fontSize: 14}}>{msg}</p>}

      <div className="card">
        <h2>Problems</h2>
        {contest.problems?.length === 0 ? (
          <p>No problems added yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Title</th><th>Difficulty</th></tr>
            </thead>
            <tbody>
              {contest.problems?.map((p, i) => (
                <tr key={p._id || i}>
                  <td style={{color:'var(--muted)'}}>{String.fromCharCode(65+i)}</td>
                  <td><Link to={`/problems/${p.slug}`}>{p.title || p._id}</Link></td>
                  <td>{p.difficulty && <span className={`badge badge-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
