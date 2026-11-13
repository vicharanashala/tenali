import { useEffect, useState } from 'react';
import { pmFetchGraphData, pmNodes } from '../utils/pathMapUtils.js';

// React hook — loads the graph data once, reports 'loading' | 'ready' | 'error'
export default function usePmGraphData() {
    const [status, setStatus] = useState(() => (pmNodes.length ? 'ready' : 'loading'));

    useEffect(() => {
        if (status === 'ready') return;
        let cancelled = false;
        pmFetchGraphData()
        .then(() => { if (!cancelled) setStatus('ready'); })
        .catch((err) => { if (!cancelled) { console.error(err); setStatus('error'); } });
        return () => { cancelled = true; };
    }, [status]);

    return status;
}