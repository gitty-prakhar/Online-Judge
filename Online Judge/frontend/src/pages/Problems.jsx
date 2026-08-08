import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      const res = await api.get('/problems', { params });
      setProblems(res.data.data.problems);
      setPagination(res.data.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProblems(); }, [page, difficulty]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProblems();
  };

  const diffBadge = (d) => {
    const map = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' };
    return <span className={`badge ${map[d] || ''}`}>{d}</span>;
  };

  return (
    <div className="page">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24}}>
        <h1>Problems</h1>
        <form onSubmit={handleSearch} style={{display:'flex', gap:8}}>
          <input style={{width: 220}} placeholder="Search by title..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <select style={{width: 140}} value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}>
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <button type="submit" className="btn-primary btn-sm">Search</button>
        </form>
      </div>

      <div className="card" style={{padding: 0, overflow:'hidden'}}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th>Time Limit</th>
              </tr>
            </thead>
            <tbody>
              {problems.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center', padding: 40, color:'var(--muted)'}}>No problems found</td></tr>
              ) : problems.map((p, i) => (
                <tr key={p._id}>
                  <td style={{color:'var(--muted)'}}>{(page-1)*10 + i + 1}</td>
                  <td><Link to={`/problems/${p.slug}`}>{p.title}</Link></td>
                  <td>{diffBadge(p.difficulty)}</td>
                  <td>{p.tags?.slice(0,3).map(t => <span className="tag" key={t}>{t}</span>)}</td>
                  <td style={{color:'var(--muted)'}}>{p.timeLimit}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p-1)}>← Prev</button>
          <span style={{color:'var(--muted)', fontSize: 14}}>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p+1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
