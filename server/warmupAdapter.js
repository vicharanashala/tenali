/**
 * server/warmupAdapter.js
 *
 * Translates user answers between the warmup UI (single text input)
 * and the multi-input /check endpoints for topics like lineq, polymul,
 * polyfactor, primefactor, qformula, simul.
 *
 * Status: scaffolded for v1.1 follow-up. v1.0 ships only with single-input
 * topics (14 in WARMUP_SUPPORTED_TOPICS). When v1.1 adds lineq / polymul /
 * polyfactor / primefactor / qformula / simul, fill in their entries below.
 *
 * Hook API (consumed by client/src/hooks/useWarmupIntervention.jsx):
 *
 *   const adapter = require('./warmupAdapter').forTopic('lineq')
 *   if (adapter) {
 *     const parsed = adapter.parseAnswer(userText)   // -> object for /check body
 *     const prompt = adapter.formatPrompt(question)  // -> string for UI
 *   }
 *
 * For single-input topics, .forTopic(topic) returns null and the hook uses
 * its existing single-input path (no adapter needed).
 */

'use strict';

/**
 * Per-topic adapter definitions. Each entry knows:
 *   - fields: ordered list of input field names the /check endpoint expects
 *   - parseAnswer: split user text into the field values
 *   - formatPrompt: turn the server's question shape into a UI prompt string
 *
 * Topics listed below are deferred to v1.1. Server routes already exist for
 * them in server/index.js (lineq L2633, polymul L1783, polyfactor L2001,
 * primefactor L2170, qformula L2254, simul L2393) but their /check endpoints
 * consume multi-field payloads that don't fit the single-input warmup input.
 */
const TOPIC_ADAPTERS = {
  // v1.1 candidates — formatPrompt + parseAnswer bodies to be filled in.
  // Each stub returns null so .forTopic() falls through to single-input path
  // and /check requests still happen (with adapter-not-implemented warning).
  lineq:       null,
  polymul:     null,
  polyfactor:  null,
  primefactor: null,
  qformula:    null,
  simul:       null,
};

/**
 * Look up an adapter for the given topic key (NO -api suffix).
 * Returns the adapter object, or null for single-input topics.
 *
 * Examples:
 *   .forTopic('basicarith')  -> null   (single-input, no adapter needed)
 *   .forTopic('lineq')       -> null   (multi-input, but stub; v1.1)
 *   .forTopic('fake-topic')  -> null   (unknown)
 */
function forTopic(topic) {
  return TOPIC_ADAPTERS[topic] || null;
}

/**
 * v1.1 hook helper: if we ever populate TOPIC_ADAPTERS, this will format the
 * prompt. Stays as a stub so the hook can call it safely today.
 */
function formatPrompt(topic, question) {
  const adapter = forTopic(topic);
  if (!adapter || !adapter.formatPrompt) {
    // Single-input topics render question.prompt directly. See
    // client/src/hooks/useWarmupIntervention.jsx renderWarmupQuestion().
    return question.prompt || '';
  }
  return adapter.formatPrompt(question);
}

/**
 * v1.1 hook helper: parse the user's single text input into the multi-field
 * payload /check expects. Returns null for single-input topics (the hook
 * then POSTs the raw string as userAnswer).
 *
 * Expected return shape:
 *   { userField1: '1', userField2: '2', ... }
 */
function parseAnswer(topic, userText) {
  const adapter = forTopic(topic);
  if (!adapter || !adapter.parseAnswer) {
    return null;
  }
  return adapter.parseAnswer(userText);
}

module.exports = {
  forTopic,
  formatPrompt,
  parseAnswer,
  TOPIC_ADAPTERS, // exported so future contributors/tests can introspect
};
