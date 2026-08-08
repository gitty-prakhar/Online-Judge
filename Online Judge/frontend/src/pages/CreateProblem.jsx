import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function CreateProblem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    statement: '',
    difficulty: 'Easy',
    tags: 'Array, Math',
    constraints: '1 <= N <= 10^5',
    inputFormat: 'The first line contains an integer T...',
    outputFormat: 'For each test case, print...',
    sampleInput: '',
    sampleOutput: '',
    sampleExplanation: '',
    hiddenInput: '',
    hiddenOutput: '',
    timeLimit: 2000,
    memoryLimit: 256,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Create Problem
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const examples = form.sampleInput ? [{
        input: form.sampleInput,
        output: form.sampleOutput,
        explanation: form.sampleExplanation
      }] : [];

      const problemRes = await api.post('/problems', {
        title: form.title,
        statement: form.statement,
        difficulty: form.difficulty,
        tags: tagsArray,
        constraints: form.constraints,
        inputFormat: form.inputFormat,
        outputFormat: form.outputFormat,
        examples,
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit),
        visibility: 'Public'
      });

      const newProblem = problemRes.data.data;
      const problemId = newProblem._id;

      // 2. Create Sample TestCase
      if (form.sampleInput && form.sampleOutput) {
        await api.post('/testcases', {
          problemId,
          input: form.sampleInput,
          expectedOutput: form.sampleOutput,
          isHidden: false
        });
      }

      // 3. Create Hidden TestCase
      if (form.hiddenInput && form.hiddenOutput) {
        await api.post('/testcases', {
          problemId,
          input: form.hiddenInput,
          expectedOutput: form.hiddenOutput,
          isHidden: true
        });
      }

      setSuccess('🎉 Problem & Test Cases created successfully!');
      setTimeout(() => {
        navigate(`/problems/${newProblem.slug}`);
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create problem. Make sure your user has role: "admin".');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 850 }}>
      <div className="card">
        <h1 style={{ marginBottom: 4 }}>➕ Create New Problem</h1>
        <p style={{ marginBottom: 24 }}>Add a problem statement, limits, sample test cases, and hidden judge test cases.</p>

        {error && <div className="verdict-bar verdict-wrong" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="verdict-bar verdict-accepted" style={{ marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Problem Title *</label>
              <input
                placeholder="e.g. Palindrome Number"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Difficulty *</label>
              <select
                value={form.difficulty}
                onChange={e => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              placeholder="Array, DP, String, Math"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Problem Statement (Markdown supported) *</label>
            <textarea
              rows={5}
              placeholder="Describe the task in detail..."
              value={form.statement}
              onChange={e => setForm({ ...form, statement: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Input Format</label>
              <textarea
                rows={2}
                placeholder="Input structure..."
                value={form.inputFormat}
                onChange={e => setForm({ ...form, inputFormat: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Output Format</label>
              <textarea
                rows={2}
                placeholder="Expected output format..."
                value={form.outputFormat}
                onChange={e => setForm({ ...form, outputFormat: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Constraints</label>
            <input
              placeholder="e.g. 1 <= N <= 10^5"
              value={form.constraints}
              onChange={e => setForm({ ...form, constraints: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Time Limit (ms)</label>
              <input
                type="number"
                value={form.timeLimit}
                onChange={e => setForm({ ...form, timeLimit: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Memory Limit (MB)</label>
              <input
                type="number"
                value={form.memoryLimit}
                onChange={e => setForm({ ...form, memoryLimit: e.target.value })}
                required
              />
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '24px 0' }} />
          <h2>🧪 Sample Testcase (Visible to users)</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Sample Input</label>
              <textarea
                rows={3}
                style={{ fontFamily: 'monospace' }}
                placeholder="2 3"
                value={form.sampleInput}
                onChange={e => setForm({ ...form, sampleInput: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Sample Output</label>
              <textarea
                rows={3}
                style={{ fontFamily: 'monospace' }}
                placeholder="5"
                value={form.sampleOutput}
                onChange={e => setForm({ ...form, sampleOutput: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Sample Explanation</label>
            <input
              placeholder="2 + 3 = 5"
              value={form.sampleExplanation}
              onChange={e => setForm({ ...form, sampleExplanation: e.target.value })}
            />
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '24px 0' }} />
          <h2>🔒 Hidden Judge Testcase (Secret judge input)</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Hidden Input</label>
              <textarea
                rows={3}
                style={{ fontFamily: 'monospace' }}
                placeholder="100 200"
                value={form.hiddenInput}
                onChange={e => setForm({ ...form, hiddenInput: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Expected Hidden Output</label>
              <textarea
                rows={3}
                style={{ fontFamily: 'monospace' }}
                placeholder="300"
                value={form.hiddenOutput}
                onChange={e => setForm({ ...form, hiddenOutput: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 24, padding: 14, fontSize: 16 }}
            disabled={loading}
          >
            {loading ? 'Creating Problem & Testcases...' : '🚀 Publish Problem'}
          </button>
        </form>
      </div>
    </div>
  );
}
