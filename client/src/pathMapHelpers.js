import { useState, useEffect, useCallback, useMemo } from 'react';

// ─── PathMap data & algorithms ───────────────────────────────────────────────
// Graph data (fetched from /graph-data.json, same file index.html/path.html use)
export let pmNodes = [];
export let pmEdges = [];
export let pmCatColor = {};
export let pmNodeById = {};
export let pmPrereqMap = {};
export let pmSuccessorMap = {};

let pmGraphDataPromise = null;

export function pmBuildDerivedMaps() {
  pmNodeById = Object.fromEntries(pmNodes.map((n) => [n.id, n]));
  pmPrereqMap = {};
  pmSuccessorMap = {};
  pmEdges.forEach(([a, b]) => {
    ;(pmPrereqMap[b] = pmPrereqMap[b] || []).push(a);
    ;(pmSuccessorMap[a] = pmSuccessorMap[a] || []).push(b);
  });
}

export function pmFetchGraphData() {
  if (!pmGraphDataPromise) {
    pmGraphDataPromise = fetch('/graph-data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load graph-data.json (${res.status})`);
        return res.json();
      })
      .then(({ categories, nodes, edges }) => {
        pmNodes = nodes;
        pmEdges = edges;
        pmCatColor = Object.fromEntries(Object.entries(categories).map(([id, c]) => [id, c.color]));
        pmBuildDerivedMaps();
      });
  }
  return pmGraphDataPromise;
}

// React hook — loads the graph data once, reports 'loading' | 'ready' | 'error'
export function usePmGraphData() {
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

// ─── Module Progress Tracker (localStorage-based, easy/medium/hard per module) ───
const PM_TRACK_KEY = 'tenali_module_tracking';

export function pmTrackLoad() {
  try { return JSON.parse(localStorage.getItem(PM_TRACK_KEY)) || {}; } catch { return {}; }
}

export function pmTrackSave(data) {
  try { localStorage.setItem(PM_TRACK_KEY, JSON.stringify(data)); } catch { /* ignore quota errors */ }
}

export function pmEmptyModuleStat() {
  return {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
    correctStreak: [],
  };
}

const pmTrackListeners = new Set();
export function pmTrackNotify() {
  pmTrackListeners.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
}

let _pmInterceptorInstalled = false;
export function installPmAnswerInterceptor() {
  if (_pmInterceptorInstalled) return;
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;

  const originalFetch = window.fetch;
  window.fetch = async function pmInterceptedFetch(input, init) {
    const response = await originalFetch.apply(this, arguments);
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const isCheck = /\/([a-z0-9_-]+)-api\/check/i.test(url) || /\/api\/([a-z0-9_-]+)\/check/i.test(url) || /\/api\/check/i.test(url);
      if (isCheck) {
        response.clone().json().then((data) => {
          if (data && typeof data.correct === 'boolean') {
            let topic = null;
            const match = url.match(/\/([a-z0-9_-]+)-api\/check/i);
            if (match && match[1]) {
              topic = match[1];
            }
            const currentMode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : null;
            if ((!topic || !pmNodeById[topic]) && currentMode && pmNodeById[currentMode]) {
              topic = currentMode;
            } else if (!topic && currentMode) {
              topic = currentMode;
            }

            let diff = 'medium';
            if (init && typeof init.body === 'string') {
              try {
                const b = JSON.parse(init.body);
                if (b.difficulty && ['easy', 'medium', 'hard'].includes(b.difficulty)) {
                  diff = b.difficulty;
                }
              } catch { /* ignore invalid JSON */ }
            }

            if (topic) {
              pmTrackAnswer(topic, diff, data.correct);
            }
          }
        }).catch(() => {});
      }
    } catch {
      // safe fallback
    }
    return response;
  };
  _pmInterceptorInstalled = true;
}

if (typeof window !== 'undefined') {
  try { installPmAnswerInterceptor(); } catch { /* ignore */ }
}

export function pmTrackAnswer(moduleId, difficulty, isCorrect) {
  if (!moduleId) return;
  const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
  const data = pmTrackLoad();
  const stat = data[moduleId] || pmEmptyModuleStat();
  if (!Array.isArray(stat.correctStreak)) {
    stat.correctStreak = [];
  }
  stat[diff].total += 1;
  if (isCorrect) {
    stat[diff].correct += 1;
    stat.correctStreak.push(diff);
  } else {
    stat.correctStreak = [];
  }
  data[moduleId] = stat;
  pmTrackSave(data);
  pmTrackNotify();
}

export function pmTrackGetStats(moduleId) {
  const data = pmTrackLoad();
  return data[moduleId] || pmEmptyModuleStat();
}

export function pmTrackCorrectTotal(moduleId) {
  const s = pmTrackGetStats(moduleId);
  return s.easy.correct + s.medium.correct + s.hard.correct;
}

export function pmTrackThresholdMet(moduleId) {
  const stat = pmTrackGetStats(moduleId);
  const streak = stat.correctStreak || [];
  if (streak.length >= 3) {
    const last3 = streak.slice(-3);
    if (last3.every((d) => d === 'medium' || d === 'hard')) {
      return true;
    }
  }
  if (streak.length >= 5) {
    return true;
  }
  return false;
}

export function pmTrackRemaining(moduleId) {
  if (pmTrackThresholdMet(moduleId)) return 0;
  const stat = pmTrackGetStats(moduleId);
  const streak = stat.correctStreak || [];
  
  let N = 0;
  for (let i = streak.length - 1; i >= 0; i--) {
    if (streak[i] === 'medium' || streak[i] === 'hard') {
      N++;
    } else {
      break;
    }
  }
  N = Math.min(N, 3);
  
  const pathA = Math.max(0, 3 - N);
  const pathB = Math.max(0, 5 - streak.length);
  
  return Math.min(pathA, pathB);
}

export function pmGetKnownFromStorage() {
  try {
    const r = localStorage.getItem('tenali_pathmap_known');
    return new Set(r ? JSON.parse(r) : []);
  } catch {
    return new Set();
  }
}

export function pmGetCurrentSuggestedModule() {
  if (!pmNodes.length) return null;
  const known = pmGetKnownFromStorage();
  const isCompleted = (id) => known.has(id) || pmTrackThresholdMet(id);
  
  const allNodeIds = new Set(pmNodes.map(n => n.id));
  const sortedIds = pmTopoSort(allNodeIds);
  
  for (const id of sortedIds) {
    if (isCompleted(id)) continue;
    const prereqs = pmPrereqMap[id] || [];
    if (prereqs.every(p => isCompleted(p))) {
      return pmNodeById[id] || null;
    }
  }
  return null;
}

export function pmTrackNextModule(moduleId) {
  const successors = pmSuccessorMap[moduleId] || [];
  if (successors.length > 0) {
    return successors.map((id) => pmNodeById[id]).filter(Boolean);
  }
  
  const nextGlobalNode = pmGetCurrentSuggestedModule();
  if (nextGlobalNode && nextGlobalNode.id !== moduleId) {
    return [nextGlobalNode];
  }
  
  return [{ id: 'dashboard', label: '🎉 Go to Dashboard' }];
}

let pmNavigateFn = null;
export function setPmNavigateFn(fn) { pmNavigateFn = fn; }
export function getPmNavigateFn() { return pmNavigateFn; }

export function usePmModuleTracking(moduleId) {
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

export function pmGetSubgraphNodes(goalIdList) {
  const visited = new Set();
  const stack = [...goalIdList];
  while (stack.length) {
    const cur = stack.pop();
    if (visited.has(cur)) continue;
    visited.add(cur);
    ;(pmPrereqMap[cur] || []).forEach((p) => { if (!visited.has(p)) stack.push(p); });
  }
  return visited;
}

export function pmTopoSort(nodeSet) {
  const inDeg = {};
  const adj = {};
  nodeSet.forEach((n) => { inDeg[n] = 0; adj[n] = []; });
  pmEdges.forEach(([a, b]) => {
    if (nodeSet.has(a) && nodeSet.has(b)) { adj[a].push(b); inDeg[b]++; }
  });
  const queue = [...nodeSet].filter((n) => inDeg[n] === 0).sort();
  const order = [];
  while (queue.length) {
    queue.sort();
    const n = queue.shift();
    order.push(n);
    ;(adj[n] || []).forEach((m) => { inDeg[m]--; if (inDeg[m] === 0) queue.push(m); });
  }
  return order;
}

export function pmComputePath(goalIds) {
  if (!goalIds || !goalIds.length) return [];
  return pmTopoSort(pmGetSubgraphNodes(goalIds));
}

export function pmStarPoints(cx, cy, r) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`);
  }
  return points.join(' ');
}

let _pmGoalIds = (() => {
  try {
    const r = localStorage.getItem('tenali_pathmap_goal');
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
})();

let _pmKnown = (() => {
  try {
    const r = localStorage.getItem('tenali_pathmap_known');
    return new Set(r ? JSON.parse(r) : []);
  } catch {
    return new Set();
  }
})();

const pmStateListeners = new Set();
export function notifyPmStateChange() {
  pmStateListeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'tenali_pathmap_goal') {
      try { _pmGoalIds = e.newValue ? JSON.parse(e.newValue) : []; } catch { _pmGoalIds = []; }
      notifyPmStateChange();
    } else if (e.key === 'tenali_pathmap_known') {
      try { _pmKnown = new Set(e.newValue ? JSON.parse(e.newValue) : []); } catch { _pmKnown = new Set(); }
      notifyPmStateChange();
    }
  });
}

export function usePathmapState() {
  const pmStatus = usePmGraphData();
  const [, bump] = useState(0);

  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    pmStateListeners.add(fn);
    return () => pmStateListeners.delete(fn);
  }, []);

  const goalIds = _pmGoalIds;
  const known = _pmKnown;

  const setGoal = useCallback((ids) => {
    _pmGoalIds = ids;
    try { localStorage.setItem('tenali_pathmap_goal', JSON.stringify(ids)); } catch { /* ignore */ }
    notifyPmStateChange();
  }, []);

  const clearGoal = useCallback(() => {
    _pmGoalIds = [];
    try { localStorage.setItem('tenali_pathmap_goal', JSON.stringify([])); } catch { /* ignore */ }
    notifyPmStateChange();
  }, []);

  const toggleKnown = useCallback((id) => {
    const next = new Set(_pmKnown);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    _pmKnown = next;
    try { localStorage.setItem('tenali_pathmap_known', JSON.stringify([...next])); } catch { /* ignore */ }
    notifyPmStateChange();
  }, []);

  const resetKnown = useCallback(() => {
    _pmKnown = new Set();
    try { localStorage.setItem('tenali_pathmap_known', JSON.stringify([])); } catch { /* ignore */ }
    notifyPmStateChange();
  }, []);

  const path = useMemo(() => (pmStatus === 'ready' ? pmComputePath(goalIds) : []), [goalIds, pmStatus]);

  return { goalIds, known, path, setGoal, clearGoal, toggleKnown, resetKnown, pmStatus };
}
