/**
 * Multi-language code execution engine (Node.js port of SkillSprint compiler.py)
 *
 * Executes code locally via child_process. Supports C, C++, Python, JavaScript,
 * Java, PHP, Go, Rust, and R. Each language has compile + run commands defined
 * in LANGUAGE_SPECS.
 *
 * Security: timeout enforcement, output size limits, temp dir auto-cleanup.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const TIME_LIMIT = 5000; // ms
const OUTPUT_SIZE_LIMIT = 10000; // chars
const EXECUTABLE_NAME = os.platform() === 'win32' ? 'main_exec.exe' : 'main_exec';

const LANGUAGE_SPECS = {
  c: {
    key: 'c',
    display: 'C (C99)',
    filename: 'main.c',
    compile: ['gcc', '-O2', '-std=c99', '-Wall', 'main.c', '-o', EXECUTABLE_NAME],
    run: [`./${EXECUTABLE_NAME}`],
    needsBinary: true,
  },
  cpp: {
    key: 'cpp',
    display: 'C++ (g++)',
    filename: 'main.cpp',
    compile: ['g++', '-O2', '-std=c++17', 'main.cpp', '-o', EXECUTABLE_NAME],
    run: [`./${EXECUTABLE_NAME}`],
    needsBinary: true,
  },
  python: {
    key: 'python',
    display: 'Python',
    filename: 'main.py',
    run: ['python3', 'main.py'],
  },
  javascript: {
    key: 'javascript',
    display: 'JavaScript (Node.js)',
    filename: 'main.js',
    run: ['node', 'main.js'],
  },
  java: {
    key: 'java',
    display: 'Java',
    filename: 'Main.java',
    compile: ['javac', 'Main.java'],
    run: ['java', '-cp', '.', 'Main'],
  },
  php: {
    key: 'php',
    display: 'PHP',
    filename: 'main.php',
    run: ['php', 'main.php'],
  },
  go: {
    key: 'go',
    display: 'Go',
    filename: 'main.go',
    compile: ['go', 'build', '-o', EXECUTABLE_NAME, 'main.go'],
    run: [`./${EXECUTABLE_NAME}`],
    needsBinary: true,
  },
  rust: {
    key: 'rust',
    display: 'Rust',
    filename: 'main.rs',
    compile: ['rustc', 'main.rs', '-O', '-o', EXECUTABLE_NAME],
    run: [`./${EXECUTABLE_NAME}`],
    needsBinary: true,
  },
  r: {
    key: 'r',
    display: 'R',
    filename: 'main.R',
    run: ['Rscript', 'main.R'],
  },
};

const ALIASES = {
  c99: 'c', 'c++': 'cpp', cpp17: 'cpp',
  js: 'javascript', node: 'javascript',
  py: 'python', golang: 'go', rs: 'rust',
};

function normalizeLanguage(lang) {
  const val = (lang || '').trim().toLowerCase();
  return ALIASES[val] || val;
}

function toolExists(cmd) {
  try {
    const result = require('child_process').spawnSync(
      os.platform() === 'win32' ? 'where' : 'which',
      [cmd],
      { stdio: 'ignore' }
    );
    return result.status === 0;
  } catch {
    return false;
  }
}

function listLanguages() {
  const result = [];
  for (const [key, spec] of Object.entries(LANGUAGE_SPECS)) {
    const compileTool = spec.compile ? spec.compile[0] : null;
    const runTool = spec.needsBinary ? null : spec.run[0];
    const compileOk = compileTool ? toolExists(compileTool) : true;
    const runOk = runTool ? toolExists(runTool) : true;
    const available = compileTool ? compileOk : runOk;
    const missing = [];
    if (compileTool && !compileOk) missing.push(compileTool);
    if (runTool && !runOk) missing.push(runTool);

    result.push({
      key: spec.key,
      name: spec.display,
      type: spec.compile ? 'compiled' : 'interpreted',
      available,
      missing,
    });
  }
  return result;
}

function runProcess(command, args, cwd, stdin, timeoutMs) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
    });

    let stdout = '';
    let stderr = '';
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      try { proc.kill('SIGKILL'); } catch {}
      reject(new ExecutionTimeoutError(`Execution exceeded ${timeoutMs / 1000}s timeout`));
    }, timeoutMs);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > OUTPUT_SIZE_LIMIT) {
        killed = true;
        try { proc.kill('SIGKILL'); } catch {}
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > OUTPUT_SIZE_LIMIT) {
        killed = true;
        try { proc.kill('SIGKILL'); } catch {}
      }
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (killed && stdout.length > OUTPUT_SIZE_LIMIT) {
        reject(new ExecutionError('Output exceeded size limit'));
        return;
      }
      resolve({ stdout, stderr, exitCode: code });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(new ToolUnavailableError(`Failed to start ${command}: ${err.message}`));
    });

    if (stdin) {
      proc.stdin.write(stdin);
    }
    proc.stdin.end();
  });
}

class CompilationError extends Error {
  constructor(message) { super(message); this.name = 'CompilationError'; }
}
class ExecutionError extends Error {
  constructor(message) { super(message); this.name = 'ExecutionError'; }
}
class ExecutionTimeoutError extends Error {
  constructor(message) { super(message); this.name = 'ExecutionTimeoutError'; }
}
class ToolUnavailableError extends Error {
  constructor(message) { super(message); this.name = 'ToolUnavailableError'; }
}

async function executeCode(language, code, stdin = '', timeout = TIME_LIMIT) {
  const lang = normalizeLanguage(language);
  const spec = LANGUAGE_SPECS[lang];

  if (!spec) {
    return {
      status: 'UNSUPPORTED_LANGUAGE',
      language: lang,
      stdout: '',
      stderr: 'Language is not configured.',
      exit_code: 1,
      execution_time_ms: 0,
      message: 'Language is not configured.',
    };
  }

  // Check tool availability
  const compileTool = spec.compile ? spec.compile[0] : null;
  const runTool = spec.needsBinary ? null : spec.run[0];
  if (compileTool && !toolExists(compileTool)) {
    return {
      status: 'TOOL_UNAVAILABLE',
      language: lang,
      stdout: '',
      stderr: `Missing compiler: ${compileTool}`,
      exit_code: 127,
      execution_time_ms: 0,
      message: `Missing compiler: ${compileTool}`,
    };
  }
  if (runTool && !toolExists(runTool)) {
    return {
      status: 'TOOL_UNAVAILABLE',
      language: lang,
      stdout: '',
      stderr: `Missing runtime: ${runTool}`,
      exit_code: 127,
      execution_time_ms: 0,
      message: `Missing runtime: ${runTool}`,
    };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'playground2-'));
  try {
    // Write source file
    const sourcePath = path.join(tmpDir, spec.filename);
    fs.writeFileSync(sourcePath, code, 'utf-8');

    // Compile if needed
    if (spec.compile) {
      const compileResult = await runProcess(
        spec.compile[0], spec.compile.slice(1), tmpDir, '', 10000
      );
      if (compileResult.exitCode !== 0) {
        const stderr = (compileResult.stderr || compileResult.stdout || 'Compilation failed').slice(0, OUTPUT_SIZE_LIMIT);
        return {
          status: 'COMPILATION_ERROR',
          language: lang,
          stdout: '',
          stderr,
          exit_code: compileResult.exitCode,
          execution_time_ms: 0,
          message: 'Compilation failed',
        };
      }
      // Verify binary exists for compiled languages
      if (spec.needsBinary) {
        const binPath = path.join(tmpDir, EXECUTABLE_NAME);
        if (!fs.existsSync(binPath)) {
          return {
            status: 'COMPILATION_ERROR',
            language: lang,
            stdout: '',
            stderr: 'Compilation succeeded but executable not found',
            exit_code: 1,
            execution_time_ms: 0,
            message: 'Compilation succeeded but executable not found',
          };
        }
      }
    }

    // Execute
    const start = Date.now();
    const runResult = await runProcess(
      spec.run[0], spec.run.slice(1), tmpDir, stdin, timeout
    );
    const elapsedMs = Date.now() - start;

    const stdout = (runResult.stdout || '').slice(0, OUTPUT_SIZE_LIMIT);
    const stderr = (runResult.stderr || '').slice(0, OUTPUT_SIZE_LIMIT);
    const status = runResult.exitCode === 0 ? 'SUCCESS' : 'RUNTIME_ERROR';

    return {
      status,
      language: lang,
      stdout,
      stderr,
      exit_code: runResult.exitCode,
      execution_time_ms: elapsedMs,
      message: status === 'SUCCESS' ? 'Executed successfully' : 'Program exited with non-zero status',
    };
  } catch (err) {
    if (err instanceof ExecutionTimeoutError) {
      return {
        status: 'TIMEOUT',
        language: lang,
        stdout: '',
        stderr: err.message,
        exit_code: 124,
        execution_time_ms: timeout,
        message: 'Execution timed out',
      };
    }
    return {
      status: 'RUNTIME_ERROR',
      language: lang,
      stdout: '',
      stderr: err.message || 'Execution failed',
      exit_code: 1,
      execution_time_ms: 0,
      message: err.message || 'Execution failed',
    };
  } finally {
    // Cleanup temp dir
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

module.exports = {
  executeCode,
  listLanguages,
  normalizeLanguage,
  LANGUAGE_SPECS,
  CompilationError,
  ExecutionError,
  ExecutionTimeoutError,
  ToolUnavailableError,
};
