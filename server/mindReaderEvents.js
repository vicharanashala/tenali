/**
 * TENALI MIND READER — DECOUPLED EVENT EMITTER
 * ══════════════════════════════════════════════════════════════════════
 *
 * Defines a shared event emitter to decouple game play logic from rating systems
 * (MRR updating) and analytical logging.
 */

'use strict';

const EventEmitter = require('events');

const mindReaderEvents = new EventEmitter();

module.exports = mindReaderEvents;
