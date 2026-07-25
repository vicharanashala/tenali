// client/src/components/MistakeNotebook.jsx
import React, { useState, useEffect } from 'react';
import { getMistakes, deleteMistake, getAllTopics } from '../services/srsService';

const MistakeNotebook = ({ onBack }) => {
  const [records, setRecords] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    topic: 'all',
    difficulty: 'all',
    sort: 'newest'
  });
  const [expanded, setExpanded] = useState({});

  const loadData = () => {
    const list = getMistakes(filters);
    setRecords(list);
    const allTopics = getAllTopics();
    setTopics(allTopics);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleDelete = (id) => {
    if (window.confirm('Remove this question from your Mistake Notebook?')) {
      deleteMistake(id);
      loadData();
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="quiz-layout">
      <header className="quiz-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="quiz-title">📒 Mistake Notebook</h2>
        <span className="badge">{records.length} saved</span>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search questions..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ flex: 1, minWidth: '150px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}
        />
        <select value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })}>
          <option value="all">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
          <option value="all">All Difficulties</option>
          <option value="0">Easy</option>
          <option value="1">Medium</option>
          <option value="2">Hard</option>
          <option value="3">Expert</option>
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="due">Next Review</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="notebook-table" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ background: 'var(--clr-bg-alt)', borderBottom: '2px solid var(--clr-border)' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Question</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Your Answer</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Correct</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Topic</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Mistakes</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Next Review</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--clr-text-muted)' }}>🎉 No mistakes yet! Keep it up.</td></tr>
            ) : (
              records.map(r => {
                const isPastDue = r.dueDate <= Date.now();
                return (
                  <React.Fragment key={r.id}>
                    <tr style={{ borderBottom: '1px solid var(--clr-border-light)' }}>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => toggleExpand(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-accent)' }}>
                          {expanded[r.id] ? '▼' : '▶'}
                        </button>
                        <span style={{ marginLeft: '6px' }}>{r.prompt}</span>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--clr-danger)' }}>{r.userAnswer}</td>
                      <td style={{ padding: '10px', color: 'var(--clr-success)' }}>{r.correctAnswer}</td>
                      <td style={{ padding: '10px' }}><span className="topic-tag">{r.topic}</span></td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{r.mistakes}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isPastDue ? '🔴 Due now' : new Date(r.dueDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--clr-danger)', cursor: 'pointer' }}>✕</button>
                      </td>
                    </tr>
                    {expanded[r.id] && (
                      <tr>
                        <td colSpan="7" style={{ padding: '10px 20px', background: 'var(--clr-bg-alt)', borderRadius: '8px' }}>
                          <strong>💡 Explanation:</strong>
                          <div style={{ padding: '10px', background: 'var(--clr-card)', borderRadius: '6px', marginTop: '4px' }}>
                            {r.explanation || 'No explanation available for this question.'}
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                            Stage: {r.stage}/5 • Interval: {r.interval} days • Added: {new Date(r.timestamp).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MistakeNotebook;