import React, { useState, useEffect } from 'react';
import { getStreakData, recordActivity, getTodayString } from '../lib/streakTracker';

export function StreakIndicator() {
  const [streakData, setStreakData] = useState(() => getStreakData());
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    function handleStreakChange(e) {
      if (e && e.detail) {
        setStreakData({
          streak: e.detail.streak,
          lastActiveDate: e.detail.lastActiveDate,
          isStreakActiveToday: e.detail.isStreakActiveToday,
          streakStatus: e.detail.isStreakActiveToday ? 'active' : 'intact',
        });
      } else {
        setStreakData(getStreakData());
      }
    }

    function handleXpFloat(e) {
      if (e && e.detail && e.detail.text) {
        setToastMessage(e.detail.text);
        setTimeout(() => setToastMessage(null), 3000);
      }
    }

    window.addEventListener('tenali-streak-change', handleStreakChange);
    window.addEventListener('tenali-xp-float', handleXpFloat);

    return () => {
      window.removeEventListener('tenali-streak-change', handleStreakChange);
      window.removeEventListener('tenali-xp-float', handleXpFloat);
    };
  }, []);

  const { streak, isStreakActiveToday } = streakData;

  // Calculate past 7 calendar days for streak history visual
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Is active if date matches lastActiveDate or is in past active period
    const isActive = isStreakActiveToday && (dateStr === todayDateString());

    return {
      dateStr,
      dayName,
      isToday: dateStr === todayDateString(),
      isActive,
    };
  });

  function todayDateString() {
    return getTodayString();
  }

  const handleTestTrigger = () => {
    recordActivity();
  };

  return (
    <>
      {/* Top Header Flame Badge */}
      <div 
        className="streak-header-badge" 
        onClick={() => setModalOpen(true)}
        title={isStreakActiveToday ? `${streak} Day Streak Active!` : 'Practice today to keep your streak!'}
        style={{
          position: 'fixed',
          top: '12px',
          right: '90px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: isStreakActiveToday 
            ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.18), rgba(255, 179, 0, 0.28))' 
            : 'rgba(255, 255, 255, 0.08)',
          border: isStreakActiveToday ? '1px solid rgba(255, 140, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
          boxShadow: isStreakActiveToday ? '0 0 12px rgba(255, 107, 0, 0.3)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: isStreakActiveToday ? '#ff8c00' : 'var(--clr-text-soft, #a0aec0)',
        }}
      >
        <span 
          style={{
            display: 'inline-block',
            transform: isStreakActiveToday ? 'scale(1.15)' : 'scale(1)',
            filter: isStreakActiveToday ? 'drop-shadow(0 0 4px #ff6b00)' : 'grayscale(60%)',
            animation: isStreakActiveToday ? 'flamePulse 2s infinite ease-in-out' : 'none',
          }}
        >
          🔥
        </span>
        <span>{streak}</span>
        {!isStreakActiveToday && streak > 0 && (
          <span 
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#e53e3e',
              display: 'inline-block',
            }}
            title="Streak at risk! Practice today."
          />
        )}
      </div>

      {/* Floating XP Toast */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '55px',
            right: '90px',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 800,
            boxShadow: '0 4px 16px rgba(255, 107, 0, 0.4)',
            animation: 'slideDownFade 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Streak Modal */}
      {modalOpen && (
        <div 
          className="streak-modal-backdrop"
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div 
            className="streak-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'var(--clr-surface, #1e293b)',
              color: 'var(--clr-text, #f8fafc)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 140, 0, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              textAlign: 'center',
              position: 'relative',
              animation: 'modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: 'var(--clr-text-soft, #94a3b8)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>

            {/* Flame Icon Huge */}
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>
              🔥
            </div>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 800 }}>
              {streak} Day Streak!
            </h2>

            <p style={{ color: 'var(--clr-text-soft, #94a3b8)', fontSize: '0.92rem', margin: '0 0 20px 0' }}>
              {isStreakActiveToday 
                ? "Awesome job! You've practiced today and kept your streak alive."
                : "Practice any math topic today to extend your streak!"}
            </p>

            {/* Week Status */}
            <div style={{ 
              display: 'flex', 
              justify: 'space-around', 
              background: 'rgba(0, 0, 0, 0.2)', 
              borderRadius: '12px', 
              padding: '12px 8px',
              marginBottom: '20px' 
            }}>
              {last7Days.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft, #94a3b8)', fontWeight: 600 }}>
                    {item.dayName}
                  </span>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: item.isToday && item.isActive
                        ? 'linear-gradient(135deg, #ff6b00, #ff8c00)'
                        : (item.isToday ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'),
                      border: item.isToday ? '2px solid #ff8c00' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    {item.isActive ? '🔥' : (item.isToday ? '⏱️' : '•')}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Practice CTA */}
            <button
              onClick={() => {
                setModalOpen(false);
                handleTestTrigger();
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isStreakActiveToday ? 'Practice More' : 'Record Activity & Extend Streak 🔥'}
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations injected for flame pulse & modal pop */}
      <style>{`
        @keyframes flamePulse {
          0%, 100% { transform: scale(1.1); filter: drop-shadow(0 0 4px #ff6b00); }
          50% { transform: scale(1.25); filter: drop-shadow(0 0 10px #ff8c00); }
        }
        @keyframes modalPop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDownFade {
          0% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
