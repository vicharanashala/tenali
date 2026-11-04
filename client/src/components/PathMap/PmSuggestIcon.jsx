import { useEffect } from 'react';
import usePmGraphData from '../../hooks/usePmGraphData';
import usePmModuleTracking from '../../hooks/usePmModuleTracking';
import { getPmNavigateFn, installPmAnswerInterceptor, pmNodeById } from '../../utils/pathMapUtils';
import PmTrackDots from './PmTrackDots';

function PmSuggestIcon({ moduleId, onNavigate }) {
    const graphStatus = usePmGraphData();
    const { thresholdMet, nextModules } = usePmModuleTracking(moduleId);
    const pmNavigateFn = getPmNavigateFn();

    useEffect(() => {
        installPmAnswerInterceptor();
    }, []);

    if (!moduleId) return null;
    if (graphStatus === 'loading') return null;
    if (graphStatus === 'ready' && !pmNodeById[moduleId]) return null;

    const active = thresholdMet && nextModules.length > 0;
    const doNav = (modId) => {
        if (modId === 'dashboard') {
        if (onNavigate) onNavigate(null);
        else if (pmNavigateFn) pmNavigateFn(null);
        } else {
        if (onNavigate) onNavigate(modId);
        else if (pmNavigateFn) pmNavigateFn(modId);
        }
    };

    return (
        <div style={{
        position: 'fixed', right: 20, bottom: 80, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end'
        }}>
        {active ? nextModules.map((mod) => (
            <button
            key={mod.id}
            onClick={() => doNav(mod.id)}
            title={`Next up: ${mod.label}`}
            style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px 6px 10px', borderRadius: 999,
                border: '1.5px solid #F08C46', background: '#F08C46',
                color: '#FFF', fontFamily: 'Inter, sans-serif',
                fontWeight: 700, fontSize: '0.75rem',
                boxShadow: '0 4px 12px rgba(240,140,70,0.3)',
                cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e07c36'}
            onMouseLeave={e => e.currentTarget.style.background = '#F08C46'}
            >
            <span style={{ fontSize: '0.8rem' }}>🚀</span>
            {mod.label}
            </button>
        )) : (
            <button disabled style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 10px', borderRadius: 999,
            border: '1.5px solid #5B5048', background: 'rgba(60,56,52,0.6)',
            color: '#8a8078', fontFamily: 'Inter, sans-serif',
            fontWeight: 700, fontSize: '0.75rem',
            cursor: 'not-allowed', opacity: 0.45,
            }}>
            <span style={{ fontSize: '0.8rem' }}>🔒</span>
            {(() => {
                if (!pmNodeById[moduleId]) return 'Next module';
                return (
                <>
                    Unlock next
                    <PmTrackDots moduleId={moduleId} />
                </>
                );
            })()}
            </button>
        )}
        </div>
    );
}

export default PmSuggestIcon;
