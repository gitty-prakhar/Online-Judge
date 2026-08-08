import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contests').then(r => setContests(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getStatus = (c) => {
    const now = new Date();
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);
    if (now < start) return { label: 'Upcoming', color: 'var(--blue)' };
    if (now > end) return { label: 'Ended', color: 'var(--muted)' };
    return { label: 'Live 🔴', color: 'var(--green)' };
  };

  const fmt = (d) => new Date(d).toLocaleString();

  return (
    <div className="page" style={{maxWidth: 800}}>
      <h1 style={{marginBottom: 24}}>Contests</h1>

      {loading ? <div className="spinner" /> : contests.length === 0 ? (
        <div className="card" style={{textAlign:'center', padding: 60}}>
          <p>No contests available yet.</p>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap: 16}}>
          {contests.map(c => {
            const status = getStatus(c);
            return (
              <div className="card" key={c._id} style={{display:'flex', alignItems:'center', gap: 20}}>
                <div style={{flex: 1}}>
                  <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 8}}>
                    <h2 style={{marginBottom:0}}>{c.title}</h2>
                    <span style={{color: status.color, fontSize: 13, fontWeight: 600}}>{status.label}</span>
                  </div>
                  <p style={{fontSize: 13}}>
                    🕐 {fmt(c.startTime)} → {fmt(c.endTime)}
                  </p>
                  <p style={{fontSize: 13, marginTop: 4}}>
                    👥 {c.participants?.length || 0} participants
                  </p>
                </div>
                <Link to={`/contests/${c._id}`}>
                  <button className="btn-primary btn-sm">View</button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
