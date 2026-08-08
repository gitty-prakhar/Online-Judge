import { useState, useEffect } from 'react';
import api from '../api';

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard').then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page" style={{maxWidth: 700}}>
      <h1 style={{marginBottom: 4}}>Global Leaderboard</h1>
      <p style={{marginBottom: 24}}>Top 100 users by problems solved</p>

      <div className="card" style={{padding: 0, overflow:'hidden'}}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th style={{textAlign:'right'}}>Solved</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={3} style={{textAlign:'center', padding: 40, color:'var(--muted)'}}>No data yet</td></tr>
              ) : data.map((u, i) => (
                <tr key={u.username}>
                  <td style={{width: 60}}>
                    {medals[i] || <span style={{color:'var(--muted)', fontSize:14}}>#{i+1}</span>}
                  </td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap: 10}}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'white', fontWeight:700
                      }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <span style={{fontWeight: 500}}>{u.username}</span>
                    </div>
                  </td>
                  <td style={{textAlign:'right', fontWeight:600, color:'var(--green)'}}>{u.solvedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
