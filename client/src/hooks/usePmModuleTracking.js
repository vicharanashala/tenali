import { useCallback, useEffect, useState } from 'react';
import { pmTrackAnswer, pmTrackListeners, pmTrackNextModule, pmTrackThresholdMet } from '../utils/pathMapUtils.js';
import usePmGraphData from './usePmGraphData.js';

export default  function usePmModuleTracking(moduleId) {
    const graphStatus = usePmGraphData();
    const [, bump] = useState(0);
    useEffect(() => {
        const fn = () => bump((n) => n + 1);
        pmTrackListeners.add(fn);
        return () => pmTrackListeners.delete(fn);
    }, []);
    const record = useCallback((difficulty, isCorrect) => {
        pmTrackAnswer(moduleId, difficulty, isCorrect);
    }, [moduleId]);
    const thresholdMet = moduleId ? pmTrackThresholdMet(moduleId) : false;
    const nextModules = (graphStatus === 'ready' && moduleId && thresholdMet) ? pmTrackNextModule(moduleId) : [];
    return { record, thresholdMet, nextModules };
}