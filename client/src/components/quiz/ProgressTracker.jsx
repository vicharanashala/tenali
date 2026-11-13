import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const STORAGE_KEY = 'gymQuizHistory_v1';
const MAX_HISTORY = 500;
const SUPPORTED_GYMS = [
    'Gym Decimals',
    'Functions Gym',
    'DotProducts Gym',
    'Fractions-add-gym',
    'LinearEquations-Gym',
    'Indices-Gym',
    'Polynomials Gym',
];

function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { console.error(e.stack); return []; }
}

function ProgressTracker({ onBack }) {
    const [selectedGym, setSelectedGym] = useState(SUPPORTED_GYMS[0]);
    const [page, setPage] = useState(0);
    const [_, setSelectedPoint] = useState(null);
    const [allHistory] = useState(loadHistory);

    const gymRecords = useMemo(
        () => allHistory.filter(r => r.gymName === selectedGym),
        [allHistory, selectedGym]
    );

    const sortedRecords = useMemo(
        () => [...gymRecords].sort((a, b) => new Date(b.date) - new Date(a.date)),
        [gymRecords]
    );

    const totalSessions = gymRecords.length;
    const avgAccuracy = totalSessions > 0
        ? parseFloat((gymRecords.reduce((s, r) => s + r.accuracy, 0) / totalSessions).toFixed(1))
        : 0;
    const bestAccuracy = totalSessions > 0
        ? parseFloat(Math.max(...gymRecords.map(r => r.accuracy)).toFixed(1))
        : 0;
    const avgSpeed = totalSessions > 0
        ? parseFloat((gymRecords.reduce((s, r) => s + (r.correctAnswers * 60) / r.timeTakenSeconds, 0) / totalSessions).toFixed(1))
        : 0;

    const accelData = gymRecords
        .slice()
        .reverse()
        .map((r, i) => ({ session: i + 1, accuracy: r.accuracy, record: r }));
    const speedData = gymRecords
        .slice()
        .reverse()
        .map((r, i) => {
        const spd = r.timeTakenSeconds > 0 ? parseFloat(((r.correctAnswers * 60) / r.timeTakenSeconds).toFixed(1)) : 0;
        return { session: i + 1, speed: spd, record: r };
        });

    const yPadding = (min, max) => {
        const range = max - min;
        return Math.max(1, range * 0.15);
    };
    const accelDomain = accelData.length > 0
        ? [Math.max(0, Math.min(...accelData.map(d => d.accuracy)) - yPadding(Math.min(...accelData.map(d => d.accuracy)), Math.max(...accelData.map(d => d.accuracy)))),
        Math.min(100, Math.max(...accelData.map(d => d.accuracy)) + yPadding(Math.min(...accelData.map(d => d.accuracy)), Math.max(...accelData.map(d => d.accuracy))))]
        : [0, 100];
    const speedMin = speedData.length > 0 ? Math.min(...speedData.map(d => d.speed)) : 0;
    const speedMax = speedData.length > 0 ? Math.max(...speedData.map(d => d.speed)) : 5;
    const speedDomain = [Math.max(0, speedMin - yPadding(speedMin, speedMax)), speedMax + yPadding(speedMin, speedMax)];

    const makeChartOptions = (yLabel, ySuffix, yMin, yMax) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'var(--clr-surface)',
            titleColor: 'var(--clr-text)',
            bodyColor: 'var(--clr-text)',
            borderColor: 'var(--clr-border)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
            label: context => {
                const value = context.parsed.y;
                return ySuffix ? `${value}${ySuffix}` : `${value}`;
            }
            }
        }
        },
        interaction: {
        mode: 'index',
        intersect: false
        },
        scales: {
        x: {
            title: { display: true, text: 'Session Number', color: 'var(--clr-dim)' },
            ticks: { color: 'var(--clr-dim)', font: { size: 13 } },
            grid: { color: 'rgba(0, 0, 0, 0.08)' }
        },
        y: {
            min: yMin,
            max: yMax,
            title: { display: true, text: yLabel, color: 'var(--clr-dim)' },
            ticks: { color: 'var(--clr-dim)', font: { size: 13 }, callback: v => ySuffix ? `${v}${ySuffix}` : `${v}` },
            grid: { color: 'rgba(0, 0, 0, 0.08)' }
        }
        }
    });

    const accuracyChartData = {
        labels: accelData.map(d => d.session),
        datasets: [{
        label: 'Accuracy (%)',
        data: accelData.map(d => d.accuracy),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false
        }]
    };

    const speedChartData = {
        labels: speedData.map(d => d.session),
        datasets: [{
        label: 'Correct answers/min',
        data: speedData.map(d => d.speed),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false
        }]
    };

    const accuracyChartOptions = makeChartOptions('Accuracy (%)', '%', accelDomain[0], accelDomain[1]);
    const speedChartOptions = makeChartOptions('Correct answers/min', '', speedDomain[0], speedDomain[1]);

    const PAGE_SIZE = 20;
    const paginated = sortedRecords.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const formatDate = (iso) => {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
        const yy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${dd}-${mo}-${yy} ${hh}:${mm}`;
    };

    return (
        <>
        <div className="header-row">
            <button className="back-button" onClick={onBack}>← Home</button>
        </div>
        <h1>Track Progress</h1>

        <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Select Gym to Plot</label>
            <select
            value={selectedGym}
            onChange={e => { setSelectedGym(e.target.value); setPage(0); setSelectedPoint(null); }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--clr-surface)', color: 'var(--clr-text)', border: '1px solid var(--clr-border)', fontSize: '0.95rem' }}
            >
            {SUPPORTED_GYMS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
        </div>

        {totalSessions === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--clr-dim)' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>No progress history available for this Gym yet.</div>
            <div>Complete a quiz to start tracking progress.</div>
            </div>
        ) : (
            <>
            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-dim)', marginBottom: 4 }}>Total Sessions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalSessions}</div>
                </div>
                <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-dim)', marginBottom: 4 }}>Average Accuracy</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{avgAccuracy}%</div>
                </div>
                <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-dim)', marginBottom: 4 }}>Best Accuracy</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{bestAccuracy}%</div>
                </div>
                <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-dim)', marginBottom: 4 }}>Avg Speed</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{avgSpeed}/min</div>
                </div>
            </div>

            {/* Accuracy Graph */}
            <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 12 }}>Accuracy vs Session Number</div>
                <div style={{ width: '100%', height: 220 }}>
                <Line data={accuracyChartData} options={accuracyChartOptions} />
                </div>
            </div>

            {/* Speed Graph */}
            <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 12 }}>Speed vs Session Number</div>
                <div style={{ width: '100%', height: 220 }}>
                <Line data={speedChartData} options={speedChartOptions} />
                </div>
            </div>

            {/* Session Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                    <tr style={{ background: 'var(--clr-card)', borderBottom: '2px solid var(--clr-border)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--clr-dim)' }}>Date</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--clr-dim)' }}>Easy</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--clr-dim)' }}>Medium</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--clr-dim)' }}>Hard</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--clr-dim)' }}>Total</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--clr-dim)' }}>Correct</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--clr-dim)' }}>Accuracy</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--clr-dim)' }}>Correct/min</th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map(r => {
                    const spd = r.timeTakenSeconds > 0 ? parseFloat(((r.correctAnswers * 60) / r.timeTakenSeconds).toFixed(1)) : 0;
                    return (
                        <tr key={r.id}
                        onClick={() => setSelectedPoint({ record: r, session: sortedRecords.indexOf(r) + 1 })}
                        style={{ borderBottom: '1px solid var(--clr-border)', cursor: 'pointer' }}>
                        <td style={{ padding: '8px 10px' }}>{formatDate(r.date)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.questionSummary?.easy || 0}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.questionSummary?.medium || 0}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.questionSummary?.hard || 0}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.totalQuestions}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.correctAnswers}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, color: r.accuracy >= 80 ? '#4caf50' : r.accuracy >= 50 ? '#ff9800' : '#f44336' }}>{r.accuracy}%</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{spd}</td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalSessions > PAGE_SIZE && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 16 }}>
                <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{ padding: '6px 16px', borderRadius: 6, background: 'var(--clr-card)', border: '1px solid var(--clr-border)', color: 'var(--clr-text)', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
                >
                    Previous
                </button>
                <span style={{ color: 'var(--clr-dim)', fontSize: '0.9rem' }}>
                    Page {page + 1} of {Math.ceil(totalSessions / PAGE_SIZE)}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(Math.ceil(totalSessions / PAGE_SIZE) - 1, p + 1))}
                    disabled={page >= Math.ceil(totalSessions / PAGE_SIZE) - 1}
                    style={{ padding: '6px 16px', borderRadius: 6, background: 'var(--clr-card)', border: '1px solid var(--clr-border)', color: 'var(--clr-text)', cursor: page >= Math.ceil(totalSessions / PAGE_SIZE) - 1 ? 'not-allowed' : 'pointer', opacity: page >= Math.ceil(totalSessions / PAGE_SIZE) - 1 ? 0.4 : 1 }}
                >
                    Next
                </button>
                </div>
            )}
            </>
        )}
        </>
    );
}

export default ProgressTracker;
