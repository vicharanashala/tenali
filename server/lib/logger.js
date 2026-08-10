/**
 * Minimal structured logger for the server.
 *
 * Replaces bare `console.error`/`console.warn` calls, which had no
 * timestamp, level, or persistence beyond whatever the process's stdout
 * happened to be captured by. Every call here:
 *   - prefixes a timestamp + level so log lines are self-describing,
 *   - still writes to console (systemd/journalctl or PM2 capture stdout),
 *   - additionally appends error-level lines to server/logs/error.log as
 *     JSON, so recent errors survive a service restart / log rotation of
 *     the process manager's own logs and can be grepped/tailed directly.
 *
 * Not a replacement for a full logging stack (no rotation, no shipping) —
 * scoped to make debugging production incidents possible without SSHing
 * into journalctl history.
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');

let logDirReady = false;
function ensureLogDir() {
  if (logDirReady) return true;
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    logDirReady = true;
  } catch {
    // If we can't create the log dir, fall through to console-only logging.
  }
  return logDirReady;
}

function appendToErrorFile(entry) {
  if (!ensureLogDir()) return;
  fs.appendFile(ERROR_LOG_FILE, JSON.stringify(entry) + '\n', () => {
    // Best-effort: a failure to persist the log must never crash the app
    // or block the request that triggered it.
  });
}

function format(level, context, args) {
  const timestamp = new Date().toISOString();
  const message = args
    .map((a) => (a instanceof Error ? (a.stack || a.message) : a))
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ');
  return { timestamp, level, context, message };
}

function error(context, ...args) {
  const entry = format('error', context, args);
  console.error(`[${entry.timestamp}] [ERROR]${context ? ` [${context}]` : ''}`, ...args);
  appendToErrorFile(entry);
}

function warn(context, ...args) {
  const entry = format('warn', context, args);
  console.warn(`[${entry.timestamp}] [WARN]${context ? ` [${context}]` : ''}`, ...args);
}

function info(context, ...args) {
  const entry = format('info', context, args);
  console.log(`[${entry.timestamp}] [INFO]${context ? ` [${context}]` : ''}`, ...args);
}

module.exports = { error, warn, info };
