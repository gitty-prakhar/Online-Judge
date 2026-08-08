import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const isMe = me?.username === username;

  useEffect(() => {
    api.get(`/profile/${username}`)
      .then(r => { setProfile(r.data.data); setForm({ bio: r.data.data.bio || '', github: r.data.data.github || '', linkedin: r.data.data.linkedin || '', country: r.data.data.country || '' }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  const save = async () => {
    try {
      await api.patch('/profile/update', form);
      setMsg('✅ Profile updated!');
      setEditing(false);
      setProfile(p => ({ ...p, ...form }));
    } catch { setMsg('❌ Update failed'); }
  };

  if (loading) return <div className="spinner" />;
  if (!profile) return <div className="page"><p>User not found.</p></div>;

  return (
    <div className="page" style={{maxWidth: 800}}>
      <div className="card" style={{marginBottom: 24}}>
        <div style={{display:'flex', alignItems:'center', gap: 20, marginBottom: 20}}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 28, color:'white', fontWeight: 700
          }}>
            {username[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{marginBottom: 4}}>{profile.username}</h1>
            <span style={{color:'var(--muted)', fontSize: 13}}>
              {profile.role} {profile.country && `• ${profile.country}`}
            </span>
          </div>
          {isMe && !editing && (
            <button className="btn-primary btn-sm" style={{marginLeft:'auto'}} onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>

        {!editing ? (
          <>
            {profile.bio && <p style={{marginBottom: 12, color:'var(--text)'}}>{profile.bio}</p>}
            <div style={{display:'flex', gap: 20, fontSize: 13, color:'var(--muted)'}}>
              {profile.github && <a href={profile.github} target="_blank">GitHub ↗</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank">LinkedIn ↗</a>}
            </div>
          </>
        ) : (
          <div>
            <div className="form-group"><label>Bio</label><textarea rows={2} value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} /></div>
            <div className="form-group"><label>GitHub URL</label><input value={form.github} onChange={e => setForm({...form, github:e.target.value})} /></div>
            <div className="form-group"><label>LinkedIn URL</label><input value={form.linkedin} onChange={e => setForm({...form, linkedin:e.target.value})} /></div>
            <div className="form-group"><label>Country</label><input value={form.country} onChange={e => setForm({...form, country:e.target.value})} /></div>
            <div style={{display:'flex', gap: 8}}>
              <button className="btn-primary btn-sm" onClick={save}>Save</button>
              <button className="btn-sm" style={{background:'var(--border)', color:'var(--text)'}} onClick={() => setEditing(false)}>Cancel</button>
            </div>
            {msg && <p style={{marginTop:8, fontSize:13}}>{msg}</p>}
          </div>
        )}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16, marginBottom: 24}}>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize: 36, fontWeight: 700, color:'var(--green)'}}>{profile.solvedProblems?.length || 0}</div>
          <div style={{fontSize: 13, color:'var(--muted)', marginTop: 4}}>Problems Solved</div>
        </div>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize: 36, fontWeight: 700, color:'var(--yellow)'}}>{profile.attemptedProblems?.length || 0}</div>
          <div style={{fontSize: 13, color:'var(--muted)', marginTop: 4}}>Problems Attempted</div>
        </div>
      </div>

      {profile.solvedProblems?.length > 0 && (
        <div className="card">
          <h2>Solved Problems</h2>
          <table>
            <thead><tr><th>Title</th><th>Difficulty</th></tr></thead>
            <tbody>
              {profile.solvedProblems.map(p => (
                <tr key={p._id}>
                  <td><a href={`/problems/${p.slug}`}>{p.title}</a></td>
                  <td><span className={`badge badge-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
