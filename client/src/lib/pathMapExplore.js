/**
 * pathMapExplore.js — graph layout and progress rules for the Learning
 * Path's Explore view (PathMapExplore.jsx), kept out of the component so
 * they can be tested on their own.
 *
 * Reads the same graph as PathMap (pathMapHelpers, from graph-data.json),
 * so it must only be called once that data has loaded.
 */

import {
  pmNodes,
  pmNodeById,
  pmPrereqMap,
  pmSuccessorMap,
  pmTrackThresholdMet,
} from '../pathMapHelpers';

export const COL_W = 214;
export const ROW_H = 84;
export const NODE_W = 182;
export const NODE_H = 58;
export const PAD = 60;

export const labelOf = (id) => pmNodeById[id]?.label || id;
export const catOf = (id) => pmNodeById[id]?.cat || 'other';
export const prereqsOf = (id) => pmPrereqMap[id] || [];
export const unlocksOf = (id) => pmSuccessorMap[id] || [];

/** Every topic a topic needs, directly or not. */
export function allPrerequisites(id) {
  const out = new Set();
  const stack = [id];
  while (stack.length) {
    for (const p of prereqsOf(stack.pop())) if (!out.has(p)) { out.add(p); stack.push(p); }
  }
  return out;
}

/** Every topic a topic leads to, directly or not. */
export function allUnlocks(id) {
  const out = new Set();
  const stack = [id];
  while (stack.length) {
    for (const u of unlocksOf(stack.pop())) if (!out.has(u)) { out.add(u); stack.push(u); }
  }
  return out;
}

/**
 * Where every path begins: the topic with no prerequisites that the most
 * other topics build on (Basic Arithmetic today). Worked out from the graph
 * so a change to graph-data.json cannot leave the map opening on nothing.
 */
export function findRoot(ids) {
  const roots = ids.filter((id) => prereqsOf(id).length === 0)
  let best = null
  let bestSize = -1
  for (const id of roots) {
    const size = allUnlocks(id).size
    if (size > bestSize) { best = id; bestSize = size }
  }
  return best
}

export function buildLayout() {
  const ids = pmNodes.map((n) => n.id).filter((id) => catOf(id) !== 'other');

  // Depth = longest prerequisite chain leading to this node (0 = no prereqs).
  const depthCache = {};
  function depthOf(id) {
    if (depthCache[id] !== undefined) return depthCache[id];
    depthCache[id] = 0; // guard against any accidental cycle
    const prereqs = prereqsOf(id).filter((p) => ids.includes(p));
    const d = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map(depthOf));
    depthCache[id] = d;
    return d;
  }
  ids.forEach(depthOf);

  const columns = {};
  ids.forEach((id) => {
    const d = depthCache[id];
    (columns[d] = columns[d] || []).push(id);
  });
  Object.values(columns).forEach((col) =>
    col.sort((a, b) => catOf(a).localeCompare(catOf(b)) || labelOf(a).localeCompare(labelOf(b)))
  );

  const maxDepth = Math.max(...Object.keys(columns).map(Number));
  const maxRows = Math.max(...Object.values(columns).map((c) => c.length));

  const pos = {};
  for (let d = 0; d <= maxDepth; d++) {
    const col = columns[d] || [];
    const offsetY = (maxRows * ROW_H - col.length * ROW_H) / 2;
    col.forEach((id, i) => {
      pos[id] = { x: PAD + d * COL_W, y: PAD + offsetY + i * ROW_H, depth: d };
    });
  }

  const edges = [];
  ids.forEach((id) => {
    prereqsOf(id).forEach((src) => {
      if (pos[src] && pos[id]) edges.push({ src, tgt: id });
    });
  });

  return {
    ids,
    pos,
    edges,
    width: PAD * 2 + (maxDepth + 1) * COL_W,
    height: PAD * 2 + maxRows * ROW_H,
  };
}

/**
 * Which topics count as done. Server mastery when we have it; otherwise
 * PathMap's own notion of done, the same rule pmGetCurrentSuggestedModule
 * uses (marked known, or its answer-streak threshold met).
 */
export function completedTopics({ serverMastery, known, ids }) {
  if (serverMastery) return serverMastery;
  return new Set(ids.filter((id) => known.has(id) || pmTrackThresholdMet(id)));
}
