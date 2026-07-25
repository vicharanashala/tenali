// client/src/components/DashboardWidget.jsx
import React, { useState, useEffect } from 'react';
import { getStatistics } from '../services/srsService';

const DashboardWidget = () => {
  const [stats, setStats] = useState({
    total: 0, correct: 0, incorrect: 0, accuracy: 0,
    learning: 0, mastered: 0, dueToday: 0, streak: 0
  });

  useEffect(() => {
    const updateStats = () => setStats(getStatistics());
    updateStats();
    const interval = setInterval(updateStats, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-widget" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      padding: '16px',
      background: 'var(--clr-card)',
      borderRadius: '12px',
      margin: '16px 0'
    }}>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.total}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Attempted</div>
      </div>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--clr-success)' }}>{stats.correct}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Correct</div>
      </div>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--clr-danger)' }}>{stats.incorrect}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Incorrect</div>
      </div>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--clr-accent)' }}>{stats.accuracy}%</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Accuracy</div>
      </div>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.dueToday}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>📅 Due Today</div>
      </div>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.streak}🔥</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Streak</div>
      </div>
    </div>
  );
};

export default DashboardWidget;