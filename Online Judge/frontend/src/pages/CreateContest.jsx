import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function CreateContest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allProblems, setAllProblems] = useState([]);
  
  const [form, setForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    problems: []
  });

  useEffect(() => {
    // Fetch all available problems so the admin can select them
    api.get('/problems?limit=100').then(res => {
      setAllProblems(res.data.data.problems || []);
    }).catch(err => console.error(err));
  }, []);

  const handleProblemToggle = (problemId) => {
    setForm(prev => {
      const selected = prev.problems.includes(problemId);
      if (selected) {
        return { ...prev, problems: prev.problems.filter(id => id !== problemId) };
      } else {
        return { ...prev, problems: [...prev.problems, problemId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/contests', {
        title: form.title,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        problems: form.problems
      });

      setSuccess('🎉 Contest created successfully!');
      setTimeout(() => {
        navigate(`/contests/${res.data.data._id}`);
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create contest. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="card">
        <h1 style={{ marginBottom: 4 }}>🏆 Create New Contest</h1>
        <p style={{ marginBottom: 24 }}>Set up a live coding competition.</p>

        {error && <div className="verdict-bar verdict-wrong" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="verdict-bar verdict-accepted" style={{ marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Contest Title *</label>
            <input
              placeholder="e.g. Weekly Code Challenge #5"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Start Time (Local) *</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time (Local) *</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Select Problems for this Contest</label>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, maxHeight: 300, overflowY: 'auto' }}>
              {allProblems.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>No problems available. Create some first!</p>
              ) : (
                allProblems.map(p => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto', margin: 0 }}
                      checked={form.problems.includes(p._id)}
                      onChange={() => handleProblemToggle(p._id)}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{p.title}</span>
                      <span className={`badge badge-${p.difficulty?.toLowerCase()}`} style={{ marginLeft: 8 }}>{p.difficulty}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              Selected {form.problems.length} problem(s).
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 24, padding: 14, fontSize: 16 }}
            disabled={loading || form.problems.length === 0}
          >
            {loading ? 'Creating Contest...' : '🚀 Launch Contest'}
          </button>
        </form>
      </div>
    </div>
  );
}
