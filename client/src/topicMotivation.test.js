/**
 * Tests for the "Why learn this?" content (data/topicMotivation.json) and
 * the prerequisite graph it links into (lib/prerequisiteGraph.js).
 *
 * 1. Every maths topic in the graph has a complete entry.
 * 2. The copy reads at a child's level.
 * 3. The client graph matches graph/graph-data.json, the copy the /graph
 *    and /path pages and PathMap load, so the panel's "learn these first /
 *    leads to" chips agree with every other view of the graph.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import graphData from '../../graph/graph-data.json';
import { getAllTopicKeys, getPrerequisites, getUnlocks, getTopicIdFromApiPath, getTopicApiPath } from './lib/prerequisiteGraph';

// General knowledge and vocabulary sit in the graph but are not maths
// topics, so they have no "why" panel.
const NON_MATHS_TOPICS = ['gk', 'vocab'];

describe('every maths topic has a Why entry', () => {
  test('no topic in graph-data.json is missing one', async () => {
    const data = (await import('./data/topicMotivation.json')).default;
    const missing = graphData.nodes
      .map((n) => n.id)
      .filter((id) => !NON_MATHS_TOPICS.includes(id) && !data[id]);
    expect(missing).toEqual([]);
  });

  test('no entry is for a topic the graph does not know', async () => {
    const data = (await import('./data/topicMotivation.json')).default;
    const ids = new Set(graphData.nodes.map((n) => n.id));
    expect(Object.keys(data).filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe('topicMotivation data', () => {
  let data;
  let implementedKinds;

  beforeEach(async () => {
    data = (await import('./data/topicMotivation.json')).default;
    // Demo kinds are topic ids, so the registry must cover every topic.
    implementedKinds = Object.keys(data);
  });

  test('every single topic has a visual demo, not just some', () => {
    // The whole point of the visual layer is that a student never lands on
    // a topic that only talks at them.
    Object.entries(data).forEach(([id, entry]) => {
      expect(entry.demo, `${id} has no demo`).toBeTruthy();
      expect(entry.demo.kind, `${id} demo kind should be its own topic id`).toBe(id);
    });
  });

  test('every topic explains the mechanism as 2 to 4 steps', () => {
    Object.entries(data).forEach(([id, entry]) => {
      expect(Array.isArray(entry.steps), `${id} has no steps`).toBe(true);
      expect(entry.steps.length, `${id}.steps`).toBeGreaterThanOrEqual(2);
      expect(entry.steps.length, `${id}.steps`).toBeLessThanOrEqual(4);
      entry.steps.forEach((step) => expect(typeof step).toBe('string'));
    });
  });

  test('every topic has an emoji, a big idea and three everyday uses', () => {
    Object.entries(data).forEach(([id, entry]) => {
      expect(typeof entry.emoji, `${id}.emoji`).toBe('string');
      expect(entry.emoji.length, `${id}.emoji`).toBeGreaterThan(0);
      expect(typeof entry.bigIdea, `${id}.bigIdea`).toBe('string');
      expect(entry.uses, `${id}.uses`).toHaveLength(3);
      entry.uses.forEach((u) => {
        expect(typeof u.icon, `${id} use icon`).toBe('string');
        expect(typeof u.text, `${id} use text`).toBe('string');
      });
    });
  });

  test('no two topics share an emoji', () => {
    const emojis = Object.values(data).map((e) => e.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });

  test('every topic has a non-empty why', () => {
    Object.entries(data).forEach(([id, entry]) => {
      expect(typeof entry.why, `${id}.why`).toBe('string');
      expect(entry.why.length, `${id}.why`).toBeGreaterThan(20);
    });
  });

  test('no em dashes or en dashes anywhere in the copy', () => {
    // House style: they read as machine-written. Full stops and commas do
    // the same job, so this is a hard rule rather than a preference.
    Object.entries(data).forEach(([id, entry]) => {
      const copy = [entry.bigIdea, entry.why, ...entry.steps, ...entry.uses.map((u) => u.text)];
      copy.forEach((text) => {
        expect(text, `${id} contains an em dash`).not.toMatch(/—/);
        expect(text, `${id} contains an en dash`).not.toMatch(/–/);
      });
    });
  });

  test('no copy opens with the same stock phrasing twice running', () => {
    // The previous pass leaned on "This is the math behind..." and
    // "Every time you..." as templates, which is what made it read as
    // generated. Guard the two worst offenders.
    const banned = [/^this is the math/i, /^every time you/i];
    Object.entries(data).forEach(([id, entry]) => {
      banned.forEach((re) => {
        expect(entry.why, `${id}.why falls back on a template opening`).not.toMatch(re);
      });
    });
  });

  test('every demo kind used is actually implemented', () => {
    Object.entries(data).forEach(([id, entry]) => {
      if (!entry.demo) return;
      expect(implementedKinds, `${id} asks for an unimplemented demo`)
        .toContain(entry.demo.kind);
    });
  });

  test('a topic with a demo also explains the mechanism', () => {
    // A slider with no steps is a toy; the steps are what make it a lesson.
    Object.entries(data).forEach(([id, entry]) => {
      if (!entry.demo) return;
      expect(entry.steps?.length, `${id} has a demo but no steps`).toBeGreaterThan(0);
    });
  });

  test('every implemented demo is used by at least one topic', () => {
    const used = new Set(
      Object.values(data).filter((e) => e.demo).map((e) => e.demo.kind)
    );
    implementedKinds.forEach((kind) => {
      expect(used, `demo "${kind}" is implemented but unreachable`).toContain(kind);
    });
  });
});

// ─── 8b. Reading level ──────────────────────────────────────────────
// The panel is written for children. These limits keep it that way when
// someone edits a topic later: short sentences, short lines, nothing that
// needs a second read. Counts are words, numbers and symbols like ₹ or √.
describe('topicMotivation reads at a child\'s level', () => {
  let data;
  beforeEach(async () => {
    data = (await import('./data/topicMotivation.json')).default;
  });
  const words = (s) => (s.match(/[A-Za-z0-9'²³⁴⁰⁶⁷⁸√₹°]+/g) || []).length;
  const sentences = (s) => s.trim().split(/(?<=[.!?])\s+(?=[A-Z0-9"₹√(\-½])/).filter(Boolean);

  test('the big idea fits on one line (12 words at most)', () => {
    Object.entries(data).forEach(([id, e]) => {
      expect(words(e.bigIdea), `${id}.bigIdea: "${e.bigIdea}"`).toBeLessThanOrEqual(12);
    });
  });

  test('the why is short (50 words at most)', () => {
    Object.entries(data).forEach(([id, e]) => {
      expect(words(e.why), `${id}.why`).toBeLessThanOrEqual(50);
    });
  });

  test('no sentence in a why runs past 20 words', () => {
    Object.entries(data).forEach(([id, e]) => {
      sentences(e.why).forEach((s) => {
        expect(words(s), `${id}.why: "${s}"`).toBeLessThanOrEqual(20);
      });
    });
  });

  test('sentences average 12 words or fewer across all topics', () => {
    const all = Object.values(data).flatMap((e) => sentences(e.why));
    const avg = all.reduce((n, s) => n + words(s), 0) / all.length;
    expect(avg).toBeLessThanOrEqual(12);
  });

  test('each step is one short idea (18 words at most)', () => {
    Object.entries(data).forEach(([id, e]) => {
      e.steps.forEach((s) => expect(words(s), `${id} step: "${s}"`).toBeLessThanOrEqual(18));
    });
  });

  test('each everyday use is a short caption (7 words at most)', () => {
    Object.entries(data).forEach(([id, e]) => {
      e.uses.forEach((u) => expect(words(u.text), `${id} use: "${u.text}"`).toBeLessThanOrEqual(7));
    });
  });
});

// ─── 9. The prerequisite ladder ────────────────────────────────────
// Mirrors the merge in components/FocusHome.jsx: for each topic being
// revised, the unmastered ancestors, de-duplicated by first appearance and

describe('client graph matches graph/graph-data.json', () => {
  const edgeKey = ([a, b]) => `${a}>${b}`;

  test('same topics', () => {
    expect([...getAllTopicKeys()].sort()).toEqual(graphData.nodes.map((n) => n.id).sort());
  });

  test('same prerequisite edges', () => {
    const client = getAllTopicKeys().flatMap((id) => getPrerequisites(id).map((p) => edgeKey([p, id])));
    expect(client.sort()).toEqual(graphData.edges.map(edgeKey).sort());
  });

  test('no duplicate edges', () => {
    const keys = graphData.edges.map(edgeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('getUnlocks is the exact reverse of getPrerequisites', () => {
    getAllTopicKeys().forEach((id) => {
      getUnlocks(id).forEach((next) => expect(getPrerequisites(next), `${id} -> ${next}`).toContain(id));
      getPrerequisites(id).forEach((prev) => expect(getUnlocks(prev), `${prev} -> ${id}`).toContain(id));
    });
  });

  test('the graph has no cycles', () => {
    const state = {};
    const visit = (id, trail) => {
      if (state[id] === 'done') return;
      expect(state[id], `cycle: ${[...trail, id].join(' -> ')}`).not.toBe('visiting');
      state[id] = 'visiting';
      getPrerequisites(id).forEach((p) => visit(p, [...trail, id]));
      state[id] = 'done';
    };
    getAllTopicKeys().forEach((id) => visit(id, []));
  });

  test('getTopicIdFromApiPath reverses getTopicApiPath for every topic', () => {
    getAllTopicKeys().forEach((id) => {
      expect(getTopicIdFromApiPath(getTopicApiPath(id))).toBe(id);
    });
  });
});
