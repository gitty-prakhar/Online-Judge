import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const LANGUAGES = ['C++', 'Python', 'JavaScript', 'Java'];

const BOILERPLATE = {
  'C++': `#include <bits/stdc++.h>
using namespace std;
int main() {
    // your code here
    return 0;
}`,
  'Python': `# your code here
`,
  'JavaScript': `// your code here
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(line);
});`,
  'Java': `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // your code here
    }
}`,
};

export default function ProblemDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('C++');
  const [code, setCode] = useState(BOILERPLATE['C++']);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState('');
  const eventSourceRef = useRef(null);

  useEffect(() => {
    api.get(`/problems/${slug}`).then(r => setProblem(r.data.data)).catch(() => navigate('/problems'));

    // Setup Server-Sent Events (SSE) for Real-Time Updates
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    const sse = new EventSource(`${apiUrl}/submissions/stream/updates`);
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.submissionId) {
          setVerdict(prev => {
            if (prev && prev.submissionId === data.submissionId) {
              if (data.verdict !== 'Pending' && data.verdict !== 'Judging') {
                setSubmitting(false); // Stop loading indicator
              }
              return { status: data.verdict, submissionId: data.submissionId };
            }
            return prev;
          });
        }
      } catch (err) {}
    };
    eventSourceRef.current = sse;

    return () => sse.close();
  }, [slug]);

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setCode(BOILERPLATE[lang]);
  };

  const submit = async () => {
    const user = localStorage.getItem('accessToken');
    if (!user) { navigate('/login'); return; }
    setSubmitting(true); setVerdict(null); setError('');

    try {
      const res = await api.post('/submissions', {
        problemId: problem._id,
        language,
        code,
      });
      const submissionId = res.data.data._id;
      // SSE connection will automatically handle updates for this ID
      setVerdict({ status: 'Judging...', submissionId });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const verdictColor = (v) => {
    if (v === 'Accepted') return 'verdict-accepted';
    if (v === 'Judging...') return 'verdict-pending';
    return 'verdict-wrong';
  };

  if (!problem) return <div className="spinner" />;

  return (
    <div className="page" style={{maxWidth: 1200}}>
      <div className="split">
        {/* Left: Problem Statement */}
        <div>
          <div className="card" style={{marginBottom: 16}}>
            <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 16}}>
              <h1 style={{marginBottom:0}}>{problem.title}</h1>
              <span className={`badge badge-${problem.difficulty?.toLowerCase()}`}>{problem.difficulty}</span>
            </div>
            <div style={{display:'flex', gap: 16, marginBottom: 16, fontSize: 13, color:'var(--muted)'}}>
              <span>⏱ {problem.timeLimit}ms</span>
              <span>💾 {problem.memoryLimit}MB</span>
              <span>✍️ {problem.author?.username}</span>
            </div>
            {problem.tags?.length > 0 && (
              <div style={{marginBottom: 16}}>{problem.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
            )}
            <h2>Problem Statement</h2>
            <p style={{whiteSpace:'pre-wrap', color:'var(--text)'}}>{problem.statement}</p>
          </div>

          {problem.constraints && (
            <div className="card" style={{marginBottom: 16}}>
              <h2>Constraints</h2>
              <p style={{whiteSpace:'pre-wrap', fontFamily:'monospace', color:'var(--text)'}}>{problem.constraints}</p>
            </div>
          )}

          {problem.examples?.length > 0 && (
            <div className="card">
              <h2>Examples</h2>
              {problem.examples.map((ex, i) => (
                <div key={i} style={{marginBottom: 16}}>
                  <p style={{marginBottom: 4, fontWeight: 600, color:'var(--text)'}}>Example {i+1}</p>
                  <div style={{background:'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 8}}>
                    <p style={{fontSize: 12, color:'var(--muted)', marginBottom: 4}}>Input</p>
                    <pre style={{color:'var(--text)', fontSize: 13}}>{ex.input}</pre>
                  </div>
                  <div style={{background:'var(--bg)', borderRadius: 8, padding: 12}}>
                    <p style={{fontSize: 12, color:'var(--muted)', marginBottom: 4}}>Output</p>
                    <pre style={{color:'var(--text)', fontSize: 13}}>{ex.output}</pre>
                  </div>
                  {ex.explanation && <p style={{marginTop: 8, fontSize: 13}}>{ex.explanation}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Code Editor */}
        <div>
          <div className="card">
            <div style={{display:'flex', gap: 8, marginBottom: 12, flexWrap:'wrap'}}>
              {LANGUAGES.map(lang => (
                <button key={lang}
                  onClick={() => handleLangChange(lang)}
                  style={{
                    background: language === lang ? 'var(--primary)' : 'var(--bg)',
                    color: language === lang ? 'white' : 'var(--muted)',
                    border: '1px solid var(--border)',
                    padding: '6px 14px', borderRadius: 6, fontSize: 13
                  }}>{lang}</button>
              ))}
            </div>

            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{
                height: 400, fontFamily: 'monospace', fontSize: 13,
                resize: 'vertical', lineHeight: 1.6
              }}
            />

            {verdict && (
              <div className={`verdict-bar ${verdictColor(verdict.status)}`} style={{marginTop: 12}}>
                {verdict.status === 'Judging...' ? '⏳ Judging your code...' : `${verdict.status === 'Accepted' ? '✅' : '❌'} ${verdict.status}`}
              </div>
            )}
            {error && <p className="error-msg" style={{marginTop: 8}}>{error}</p>}

            <button
              className="btn-primary"
              style={{width:'100%', marginTop: 12}}
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? '⏳ Submitting...' : '▶ Submit Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
