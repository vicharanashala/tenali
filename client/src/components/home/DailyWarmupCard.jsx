import React, { useState, useEffect } from 'react';
import WarmupModal from '../modals/WarmupModal';

export default function DailyWarmupCard({ completedTopics = [], onSelectTopic, apiBase = '' }) {
  const [warmupData, setWarmupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchWarmup = async () => {
      try {
        const guestHabit = (() => {
          try { return JSON.parse(localStorage.getItem('tenali-weekly-habit') || 'null'); } catch (e) { void e; return null; }
        })();
        const guestLadder = (() => {
          try { return JSON.parse(localStorage.getItem('tenali-spacing-ladder') || 'null'); } catch (e) { void e; return null; }
        })();

        const token = localStorage.getItem('tenali-token') || '';
        const topicsParam = Array.isArray(completedTopics) && completedTopics.length > 0
          ? `&topics=${encodeURIComponent(completedTopics.join(','))}`
          : '';
        const habitParam = guestHabit ? `&guestHabit=${encodeURIComponent(JSON.stringify(guestHabit))}` : '';
        const ladderParam = guestLadder ? `&guestLadder=${encodeURIComponent(JSON.stringify(guestLadder))}` : '';

        const res = await fetch(`${apiBase}/api/review/daily-warmup?${topicsParam}${habitParam}${ladderParam}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        const data = await res.json();
        if (isMounted && data && data.success) {
          setWarmupData(data);
          if (data.weeklyHabit) {
            try {
              localStorage.setItem('tenali-weekly-habit', JSON.stringify(data.weeklyHabit));
            } catch (e) { void e; }
          }
        }
      } catch (err) {
        console.error('Failed to load daily warmup:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWarmup();
    return () => { isMounted = false; };
  }, [completedTopics, apiBase, refreshTrigger]);

  const habit = warmupData?.weeklyHabit || {
    targetDaysPerWeek: 3,
    activeDaysThisWeek: [],
    weeklyStreak: 0,
    daysCompletedThisWeek: 0,
    targetMet: false
  };

  const isCompletedToday = warmupData?.completedToday || false;
  const daysCompleted = habit.daysCompletedThisWeek || habit.activeDaysThisWeek?.length || 0;
  const targetDays = habit.targetDaysPerWeek || 3;
  const weeklyStreak = habit.weeklyStreak || 0;

  // Days of week (Mon through Sun)
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return (
    <div style={{
      backgroundColor: 'var(--clr-card, #2c2622)',
      borderRadius: 'var(--radius, 12px)',
      border: '1px solid var(--clr-border, #443c35)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>🧠</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-text, #fff)' }}>
              Daily Spaced Review
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-soft, #aaa)' }}>
              2-Minute Decay-Targeted Memory Warmup
            </p>
          </div>
        </div>

        {/* Weekly Streak Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: weeklyStreak > 0 ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${weeklyStreak > 0 ? 'rgba(255, 152, 0, 0.5)' : 'var(--clr-border, #443c35)'}`,
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: weeklyStreak > 0 ? '#ff9800' : 'var(--clr-text-soft, #aaa)'
        }}>
          <span>🔥</span>
          <span>{weeklyStreak} {weeklyStreak === 1 ? 'Week' : 'Weeks'} Streak</span>
        </div>
      </div>

      {/* Middle Row: Weekly Habit 7-Day Rhythm */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        padding: '10px 14px',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text, #fff)' }}>
            Weekly Rhythm: {daysCompleted} of {targetDays} Days Met
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft, #999)' }}>
            {habit.targetMet ? '🎉 Target achieved for this week!' : `Practice on ${Math.max(0, targetDays - daysCompleted)} more days to keep streak`}
          </div>
        </div>

        {/* 7-Dot Rhythm Bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {DAY_LABELS.map((dayLetter, index) => {
            const isActive = index < daysCompleted;
            const isToday = index === todayDayIndex;
            return (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isActive
                    ? 'var(--clr-correct, #4caf50)'
                    : (isToday ? 'rgba(224, 122, 95, 0.3)' : 'rgba(255,255,255,0.08)'),
                  border: isToday
                    ? '2px solid var(--clr-accent, #e07a5f)'
                    : `1px solid ${isActive ? 'var(--clr-correct, #4caf50)' : 'var(--clr-border, #444)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: isActive ? '#fff' : (isToday ? 'var(--clr-accent, #e07a5f)' : 'var(--clr-text-soft, #777)')
                }}>
                  {isActive ? '✓' : dayLetter}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={loading}
          style={{
            backgroundColor: isCompletedToday ? 'rgba(76, 175, 80, 0.2)' : 'var(--clr-accent, #e07a5f)',
            color: isCompletedToday ? 'var(--clr-correct, #4caf50)' : '#fff',
            border: isCompletedToday ? '1px solid var(--clr-correct, #4caf50)' : 'none',
            borderRadius: 'var(--radius, 8px)',
            padding: '0.6rem 1.4rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isCompletedToday ? (
            <>
              <span>✅</span> Warmup Completed Today (Review Again)
            </>
          ) : (
            <>
              <span>⚡</span> Start 2-Min Warmup (3 Qs)
            </>
          )}
        </button>
      </div>

      {/* Modal Runner */}
      <WarmupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warmupData={warmupData}
        onWarmupCompleted={() => {
          setRefreshTrigger(t => t + 1);
        }}
        onSelectTopic={onSelectTopic}
        apiBase={apiBase}
      />
    </div>
  );
}
