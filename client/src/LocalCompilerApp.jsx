import { useState, useRef, useCallback, useEffect } from 'react'

// The app is served from /summership/ in production; fetches with a leading
// '/' resolve against window.location.origin and would hit /api/playground2/*
// at the root (which the production nginx routes to a stale static shell).
// Anchor fetches to the current sub-path so the same build works on root,
// /summership, or any future mount point.
const PG_BASE = (typeof window !== 'undefined'
  ? window.location.pathname.replace(/\/[^/]*$/, '')
  : '') + '/api/playground2'

const LANGUAGES = [
  { key: 'c', name: 'C (C99)', icon: '🔧', color: '#6d9eeb' },
  { key: 'cpp', name: 'C++ (g++)', icon: '⚡', color: '#f7768e' },
  { key: 'python', name: 'Python', icon: '🐍', color: '#9ece6a' },
  { key: 'javascript', name: 'JavaScript (Node)', icon: '🟨', color: '#e0af68' },
  { key: 'java', name: 'Java', icon: '☕', color: '#bb9af7' },
  { key: 'php', name: 'PHP', icon: '🐘', color: '#7dcfff' },
  { key: 'go', name: 'Go', icon: '🐹', color: '#73daca' },
  { key: 'rust', name: 'Rust', icon: '🦀', color: '#f7768e' },
  { key: 'r', name: 'R', icon: '📊', color: '#9ece6a' },
]

const DEFAULT_CODES = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}',
  python: 'print("Hello from Python!")\nprint(2 + 2)',
  javascript: 'console.log("Hello from JavaScript!");\nconsole.log(2 + 2);',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
  php: '<?php\necho "Hello from PHP!\\n";\necho 2 + 2;',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}',
  rust: 'fn main() {\n    println!("Hello from Rust!");\n}',
  r: 'cat("Hello from R!\\n")\ncat(2 + 2)',
}

const TEMPLATES = {
  c: {
    'Hello World': '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    'FizzBuzz': '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 20; i++) {\n        if (i % 15 == 0) printf("FizzBuzz\\n");\n        else if (i % 3 == 0) printf("Fizz\\n");\n        else if (i % 5 == 0) printf("Buzz\\n");\n        else printf("%d\\n", i);\n    }\n    return 0;\n}',
    'Fibonacci': '#include <stdio.h>\n\nint main() {\n    int a = 0, b = 1, n = 10;\n    printf("Fibonacci (%d terms):\\n", n);\n    for (int i = 0; i < n; i++) {\n        printf("%d ", a);\n        int next = a + b;\n        a = b; b = next;\n    }\n    printf("\\n");\n    return 0;\n}',
    'Read Input': '#include <stdio.h>\n\nint main() {\n    char name[50];\n    int age;\n    printf("Enter your name: ");\n    scanf("%s", name);\n    printf("Enter your age: ");\n    scanf("%d", &age);\n    printf("Hello %s, you are %d years old.\\n", name, age);\n    return 0;\n}',
    'Loop Demo': '#include <stdio.h>\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) {\n            printf("*");\n        }\n        printf("\\n");\n    }\n    return 0;\n}',
  },
  cpp: {
    'Hello World': '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    'FizzBuzz': '#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 20; i++) {\n        if (i % 15 == 0) cout << "FizzBuzz" << endl;\n        else if (i % 3 == 0) cout << "Fizz" << endl;\n        else if (i % 5 == 0) cout << "Buzz" << endl;\n        else cout << i << endl;\n    }\n    return 0;\n}',
    'Fibonacci': '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 0, b = 1, n = 10;\n    cout << "Fibonacci (" << n << " terms):" << endl;\n    for (int i = 0; i < n; i++) {\n        cout << a << " ";\n        int next = a + b;\n        a = b; b = next;\n    }\n    cout << endl;\n    return 0;\n}',
    'Read Input': '#include <iostream>\nusing namespace std;\n\nint main() {\n    string name; int age;\n    cout << "Enter your name: "; cin >> name;\n    cout << "Enter your age: "; cin >> age;\n    cout << "Hello " << name << ", you are " << age << " years old." << endl;\n    return 0;\n}',
    'Loop Demo': '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n = 5;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) cout << "*";\n        cout << endl;\n    }\n    return 0;\n}',
  },
  python: {
    'Hello World': 'print("Hello, World!")\nprint(f"2 + 2 = {2 + 2}")',
    'FizzBuzz': 'for i in range(1, 21):\n    if i % 15 == 0: print("FizzBuzz")\n    elif i % 3 == 0: print("Fizz")\n    elif i % 5 == 0: print("Buzz")\n    else: print(i)',
    'Fibonacci': 'a, b = 0, 1\nn = 10\nprint(f"Fibonacci ({n} terms):")\nfor _ in range(n):\n    print(a, end=" ")\n    a, b = b, a + b\nprint()',
    'Read Input': 'name = input("Enter your name: ")\nage = int(input("Enter your age: "))\nprint(f"Hello {name}, you are {age} years old.")',
    'Loop Demo': 'n = 5\nfor i in range(1, n + 1):\n    print("*" * i)',
  },
  javascript: {
    'Hello World': 'console.log("Hello, World!");\nconsole.log(`2 + 2 = ${2 + 2}`);',
    'FizzBuzz': 'for (let i = 1; i <= 20; i++) {\n    if (i % 15 === 0) console.log("FizzBuzz");\n    else if (i % 3 === 0) console.log("Fizz");\n    else if (i % 5 === 0) console.log("Buzz");\n    else console.log(i);\n}',
    'Fibonacci': 'let a = 0, b = 1, n = 10;\nconsole.log(`Fibonacci (${n} terms):`);\nlet out = "";\nfor (let i = 0; i < n; i++) {\n    out += a + " ";\n    [a, b] = [b, a + b];\n}\nconsole.log(out);',
    'Read Input': 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nrl.question("Enter your name: ", name => {\n    rl.question("Enter your age: ", age => {\n        console.log(`Hello ${name}, you are ${age} years old.`);\n        rl.close();\n    });\n});',
    'Loop Demo': 'const n = 5;\nfor (let i = 1; i <= n; i++) {\n    console.log("*".repeat(i));\n}',
  },
  java: {
    'Hello World': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    'FizzBuzz': 'public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 20; i++) {\n            if (i % 15 == 0) System.out.println("FizzBuzz");\n            else if (i % 3 == 0) System.out.println("Fizz");\n            else if (i % 5 == 0) System.out.println("Buzz");\n            else System.out.println(i);\n        }\n    }\n}',
    'Fibonacci': 'public class Main {\n    public static void main(String[] args) {\n        int a = 0, b = 1, n = 10;\n        System.out.println("Fibonacci (" + n + " terms):");\n        for (int i = 0; i < n; i++) {\n            System.out.print(a + " ");\n            int next = a + b; a = b; b = next;\n        }\n        System.out.println();\n    }\n}',
    'Read Input': 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = sc.nextLine();\n        System.out.print("Enter your age: ");\n        int age = sc.nextInt();\n        System.out.println("Hello " + name + ", you are " + age + " years old.");\n    }\n}',
    'Loop Demo': 'public class Main {\n    public static void main(String[] args) {\n        int n = 5;\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) System.out.print("*");\n            System.out.println();\n        }\n    }\n}',
  },
  php: {
    'Hello World': '<?php\necho "Hello, World!\\n";\necho "2 + 2 = " . (2 + 2) . "\\n";',
    'FizzBuzz': '<?php\nfor ($i = 1; $i <= 20; $i++) {\n    if ($i % 15 == 0) echo "FizzBuzz\\n";\n    elseif ($i % 3 == 0) echo "Fizz\\n";\n    elseif ($i % 5 == 0) echo "Buzz\\n";\n    else echo $i . "\\n";\n}',
    'Fibonacci': '<?php\n$a = 0; $b = 1; $n = 10;\necho "Fibonacci ($n terms):\\n";\nfor ($i = 0; $i < $n; $i++) {\n    echo $a . " ";\n    $next = $a + $b; $a = $b; $b = $next;\n}\necho "\\n";',
    'Read Input': '<?php\necho "Enter your name: ";\n$name = trim(fgets(STDIN));\necho "Enter your age: ";\n$age = (int)trim(fgets(STDIN));\necho "Hello $name, you are $age years old.\\n";',
    'Loop Demo': '<?php\n$n = 5;\nfor ($i = 1; $i <= $n; $i++) {\n    for ($j = 1; $j <= $i; $j++) echo "*";\n    echo "\\n";\n}',
  },
  go: {
    'Hello World': 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n    fmt.Printf("2 + 2 = %d\\n", 2 + 2)\n}',
    'FizzBuzz': 'package main\nimport "fmt"\nfunc main() {\n    for i := 1; i <= 20; i++ {\n        if i%15 == 0 { fmt.Println("FizzBuzz") } else if i%3 == 0 { fmt.Println("Fizz") } else if i%5 == 0 { fmt.Println("Buzz") } else { fmt.Println(i) }\n    }\n}',
    'Fibonacci': 'package main\nimport "fmt"\nfunc main() {\n    a, b, n := 0, 1, 10\n    fmt.Printf("Fibonacci (%d terms):\\n", n)\n    for i := 0; i < n; i++ {\n        fmt.Printf("%d ", a)\n        a, b = b, a+b\n    }\n    fmt.Println()\n}',
    'Read Input': 'package main\nimport "fmt"\nfunc main() {\n    var name string\n    var age int\n    fmt.Print("Enter your name: ")\n    fmt.Scan(&name)\n    fmt.Print("Enter your age: ")\n    fmt.Scan(&age)\n    fmt.Printf("Hello %s, you are %d years old.\\n", name, age)\n}',
    'Loop Demo': 'package main\nimport "fmt"\nfunc main() {\n    n := 5\n    for i := 1; i <= n; i++ {\n        for j := 1; j <= i; j++ { fmt.Print("*") }\n        fmt.Println()\n    }\n}',
  },
  rust: {
    'Hello World': 'fn main() {\n    println!("Hello, World!");\n    println!("2 + 2 = {}", 2 + 2);\n}',
    'FizzBuzz': 'fn main() {\n    for i in 1..=20 {\n        if i % 15 == 0 { println!("FizzBuzz"); }\n        else if i % 3 == 0 { println!("Fizz"); }\n        else if i % 5 == 0 { println!("Buzz"); }\n        else { println!("{}", i); }\n    }\n}',
    'Fibonacci': 'fn main() {\n    let (mut a, mut b, n) = (0, 1, 10);\n    println!("Fibonacci ({} terms):", n);\n    for _ in 0..n {\n        print!("{} ", a);\n        let next = a + b; a = b; b = next;\n    }\n    println!();\n}',
    'Read Input': 'use std::io::{self, Write};\nfn main() {\n    let mut name = String::new();\n    let mut age = String::new();\n    print!("Enter your name: "); io::stdout().flush().unwrap();\n    io::stdin().read_line(&mut name).unwrap();\n    print!("Enter your age: "); io::stdout().flush().unwrap();\n    io::stdin().read_line(&mut age).unwrap();\n    println!("Hello {}, you are {} years old.", name.trim(), age.trim());\n}',
    'Loop Demo': 'fn main() {\n    let n = 5;\n    for i in 1..=n {\n        for _ in 0..i { print!("*"); }\n        println!();\n    }\n}',
  },
  r: {
    'Hello World': 'cat("Hello, World!\\n")\ncat("2 + 2 =", 2 + 2, "\\n")',
    'FizzBuzz': 'for (i in 1:20) {\n    if (i %% 15 == 0) cat("FizzBuzz\\n")\n    else if (i %% 3 == 0) cat("Fizz\\n")\n    else if (i %% 5 == 0) cat("Buzz\\n")\n    else cat(i, "\\n")\n}',
    'Fibonacci': 'a <- 0; b <- 1; n <- 10\ncat("Fibonacci (", n, " terms):\\n", sep="")\nfor (i in 1:n) {\n    cat(a, " ", sep="")\n    next_val <- a + b; a <- b; b <- next_val\n}\ncat("\\n")',
    'Read Input': 'name <- readline("Enter your name: ")\nage <- as.integer(readline("Enter your age: "))\ncat("Hello", name, ", you are", age, "years old.\\n", sep="")',
    'Loop Demo': 'n <- 5\nfor (i in 1:n) {\n    cat(paste(rep("*", i), collapse=""), "\\n")\n}',
  },
}

const SAVE_KEY = 'tenali_localcompiler_snippets'

function loadSnippets() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || [] } catch { return [] }
}

export default function LocalCompilerApp({ onBack }) {
  const [langKey, setLangKey] = useState('python')
  const [code, setCode] = useState(DEFAULT_CODES.python)
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const [showStdin, setShowStdin] = useState(false)
  const [activeTab, setActiveTab] = useState('output')
  const [copied, setCopied] = useState(null)
  const [langStatus, setLangStatus] = useState({})
  const [snippets, setSnippets] = useState(loadSnippets)
  const [showSnippets, setShowSnippets] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [lastRunTimeMs, setLastRunTimeMs] = useState(null)
  const [lastExitCode, setLastExitCode] = useState(null)
  const lastRunRef = useRef(0)
  const codeRef = useRef(null)
  const gutterRef = useRef(null)

  useEffect(() => {
    fetch(`${PG_BASE}/languages`)
      .then(r => r.json())
      .then(d => {
        const m = {}
        if (d.languages) d.languages.forEach(l => { m[l.key] = l.available })
        setLangStatus(m)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const ta = codeRef.current
    const gutter = gutterRef.current
    if (!ta || !gutter) return
    gutter.scrollTop = ta.scrollTop
  }, [code, running])

  const syncScroll = useCallback(() => {
    const ta = codeRef.current
    const gutter = gutterRef.current
    if (ta && gutter) gutter.scrollTop = ta.scrollTop
  }, [])

  const lineCount = (code.match(/\n/g) || []).length + 1
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)
  const lang = LANGUAGES.find(l => l.key === langKey)
  const available = langStatus[langKey]

  const handleLangChange = useCallback((newKey) => {
    setLangKey(newKey)
    setCode(DEFAULT_CODES[newKey] || '')
    setOutput(null)
    setError(null)
    setActiveTab('output')
    setLastRunTimeMs(null)
    setLastExitCode(null)
  }, [])

  const applyTemplate = useCallback((templateCode) => {
    setCode(templateCode)
    setOutput(null)
    setError(null)
    setActiveTab('output')
    setLastRunTimeMs(null)
    setLastExitCode(null)
  }, [])

  const handleRun = useCallback(async () => {
    const now = Date.now()
    if (now - lastRunRef.current < 1500) return
    lastRunRef.current = now
    setRunning(true)
    setOutput(null)
    setError(null)
    setActiveTab('output')
    try {
      const res = await fetch(`${PG_BASE}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: langKey, code, stdin: stdin || undefined }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Server error ${res.status}: ${text.slice(0, 200)}`)
      }
      const data = await res.json()
      setOutput(data)
      setLastRunTimeMs(data.execution_time_ms)
      setLastExitCode(data.exit_code)
      if (data.status === 'COMPILATION_ERROR') {
        setActiveTab('stderr')
      } else if (data.status === 'RUNTIME_ERROR' && (data.stderr || '').trim()) {
        setActiveTab('stderr')
      }
    } catch (err) {
      setError(err.message || 'Failed to execute code')
      setLastExitCode(null)
    } finally {
      setRunning(false)
    }
  }, [code, langKey, stdin])

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleRun() }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); setShowSaveDialog(true) }
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart, end = ta.selectionEnd
      const val = ta.value
      ta.value = val.substring(0, start) + '  ' + val.substring(end)
      ta.selectionStart = ta.selectionEnd = start + 2
      setCode(ta.value)
    }
  }, [handleRun])

  const handleCopy = useCallback((text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    })
  }, [])

  const saveSnippet = useCallback(() => {
    const name = saveName.trim() || `Snippet ${snippets.length + 1}`
    const newSnippets = [...snippets, { name, langKey, code, timestamp: Date.now() }].slice(-20)
    setSnippets(newSnippets)
    localStorage.setItem(SAVE_KEY, JSON.stringify(newSnippets))
    setShowSaveDialog(false)
    setSaveName('')
  }, [saveName, snippets, langKey, code])

  const loadSnippet = useCallback((snip) => {
    setLangKey(snip.langKey)
    setCode(snip.code)
    setOutput(null)
    setError(null)
    setActiveTab('output')
    setLastRunTimeMs(null)
    setLastExitCode(null)
    setShowSnippets(false)
  }, [])

  const deleteSnippet = useCallback((idx) => {
    const newSnippets = snippets.filter((_, i) => i !== idx)
    setSnippets(newSnippets)
    localStorage.setItem(SAVE_KEY, JSON.stringify(newSnippets))
  }, [snippets])

  const statusInfo = output?.status
    ? { 'SUCCESS': { label: 'Success', color: '#9ece6a' },
        'COMPILATION_ERROR': { label: 'Compilation Error', color: '#f7768e' },
        'RUNTIME_ERROR': { label: 'Runtime Error', color: '#f7768e' },
        'TIMEOUT': { label: 'Timed Out', color: '#e0af68' },
        'TOOL_UNAVAILABLE': { label: 'Missing Tool', color: '#ff9e64' },
        'UNSUPPORTED_LANGUAGE': { label: 'Unsupported', color: '#bb9af7' },
      }[output.status] : null
  const stdout = (output?.stdout || '').replace(/\r\n/g, '\n')
  const stderr = (output?.stderr || '').replace(/\r\n/g, '\n')
  const hasErrors = stderr.trim()
  const showCompiler = output?.status === 'COMPILATION_ERROR'
  const statusDotColor = statusInfo?.color

  return (
    <div className="app-shell">
      <div className="card is-wide" style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <button className="back-button" onClick={onBack}>&larr; Back</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>&#x1F5A5;</span> Local Compiler
            </h1>
            <p className="subtitle" style={{ marginBottom: 0, fontSize: '0.8rem' }}>
              Run code directly on the server &bull; {LANGUAGES.length} languages
              {available === false && <span style={{ color: '#e0af68', marginLeft: 6 }}>&#x26A0;</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setShowShortcuts(true)} className="back-button" title="Keyboard shortcuts"
              style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}
            >?</button>
            <button onClick={() => setShowSnippets(true)} className="back-button" title="Saved snippets"
              style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: 6 }}
            >&#x1F4CB; {snippets.length > 0 && `(${snippets.length})`}</button>
          </div>
        </div>

        {/* Language selector — grid of pills */}
        <div style={{ marginBottom: 12, overflow: 'auto' }}>
          <div className="radio-group" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: 5 }}>
            {LANGUAGES.map(l => {
              const isAvail = langStatus[l.key]
              return (
                <button
                  key={l.key}
                  className={`radio-pill${langKey === l.key ? ' active' : ''}`}
                  onClick={() => handleLangChange(l.key)}
                  style={{
                    padding: '5px 12px', fontSize: '0.8rem',
                    opacity: isAvail === false ? 0.5 : 1,
                    borderColor: langKey === l.key ? l.color : undefined,
                  }}
                  title={isAvail === false ? 'Not installed on server' : l.name}
                >
                  {l.icon} {l.name}
                  {isAvail === false && ' \u26A0'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Editor + Output grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}
          className="lc-grid"
        >
          {/* Left: Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>

            {/* Template dropdown + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <select
                value=""
                onChange={(e) => { const v = e.target.value; if (v) applyTemplate(v) }}
                style={{
                  padding: '4px 8px', fontSize: '0.76rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--clr-border)', background: 'var(--clr-surface)',
                  color: 'var(--clr-text)', cursor: 'pointer', maxWidth: 160,
                }}
              >
                <option value="">&#x1F3AD; Templates</option>
                {Object.keys(TEMPLATES[langKey] || {}).map(t => (
                  <option key={t} value={TEMPLATES[langKey][t]}>{t}</option>
                ))}
              </select>
              <button onClick={() => { handleCopy(code, 'code') }} className="back-button"
                style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 6 }}
              >{copied === 'code' ? 'Copied!' : '\u2398 Copy'}</button>
              <button onClick={() => setShowSaveDialog(true)} className="back-button"
                style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 6 }}
              >{'\uD83D\uDCBE'} Save</button>
              <div style={{ flex: 1 }} />
            </div>

            {/* Code editor with line numbers */}
            <div style={{
              background: '#1a1b26', border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              flex: 1, minHeight: 280,
            }}>
              <div style={{
                padding: '6px 14px', borderBottom: '1px solid #2f3146',
                fontSize: '0.72rem', color: '#7982a9', fontWeight: 600,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f7768e' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0af68' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ece6a' }} />
                  <span style={{ marginLeft: 4 }}>{lang?.name || langKey}</span>
                </span>
                <span style={{ color: '#565f89', fontSize: '0.68rem' }}>{lineCount} lines</span>
              </div>
              <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* Gutter */}
                <div ref={gutterRef} style={{
                  width: 36, flexShrink: 0, overflow: 'hidden',
                  background: '#16161e', borderRight: '1px solid #2f3146',
                  padding: '14px 0', textAlign: 'right',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', lineHeight: 1.6,
                  color: '#3b3f5c', userSelect: 'none',
                }}>
                  {lineNumbers.map(n => (
                    <div key={n} style={{ paddingRight: 8 }}>{n}</div>
                  ))}
                </div>
                {/* Editor */}
                <textarea
                  ref={codeRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={syncScroll}
                  spellCheck={false}
                  style={{
                    width: '100%', flex: 1, minHeight: 240,
                    background: '#1a1b26', color: '#c0caf5', border: 'none', outline: 'none',
                    resize: 'vertical', padding: '14px 14px', boxSizing: 'border-box',
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontSize: '0.82rem', lineHeight: 1.6, tabSize: 2,
                  }}
                />
              </div>
            </div>

            {/* Stdin toggle + Run */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={handleRun}
                  disabled={running}
                  style={{
                    minWidth: 120, fontSize: '0.92rem', fontWeight: 700, padding: '10px 20px',
                    background: running ? 'var(--clr-text-soft)' : '#9ece6a',
                    color: '#1a1b26', border: 'none', borderRadius: 'var(--radius)',
                    cursor: running ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {running ? (
                    <><span style={{ width: 12, height: 12, border: '2px solid #1a1b26', borderTopColor: 'transparent', borderRadius: '50%', animation: 'lcspin 0.5s linear infinite' }} /> Running...</>
                  ) : (
                    <>{'\u25B6'} Run</>
                  )}
                </button>
                <button
                  onClick={() => setShowStdin(s => !s)}
                  className="back-button"
                  style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 6 }}
                >
                  {showStdin ? '\u25BE' : '\u25B8'} Input
                </button>
                <button
                  onClick={() => { setOutput(null); setError(null); setActiveTab('output'); setLastRunTimeMs(null); setLastExitCode(null) }}
                  className="back-button"
                  style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 6 }}
                >{'\u232B'} Clear</button>
              </div>
              {showStdin && (
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  spellCheck={false}
                  rows={2}
                  style={{
                    width: '100%', background: 'var(--clr-surface)',
                    color: 'var(--clr-text)', border: '1px solid var(--clr-border)',
                    borderRadius: 'var(--radius-sm)', outline: 'none', resize: 'vertical',
                    padding: '8px 12px', minHeight: 34, maxHeight: 100, boxSizing: 'border-box',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', lineHeight: 1.5,
                  }}
                  placeholder="Optional input for your program..."
                />
              )}
            </div>
          </div>

          {/* Right: Output panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 0, borderBottom: '1px solid var(--clr-border)',
            }}>
              {[
                { key: 'output', label: 'stdout', color: '#9ece6a' },
                { key: 'stderr', label: 'stderr', color: '#f7768e' },
                ...(showCompiler ? [{ key: 'compiler', label: 'compiler', color: '#e0af68' }] : []),
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  style={{
                    background: activeTab === t.key ? 'var(--clr-surface)' : 'transparent',
                    color: activeTab === t.key ? 'var(--clr-text)' : 'var(--clr-text-soft)',
                    border: 'none', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                    borderBottom: activeTab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color }} />
                  {t.label}
                  {(t.key === 'stderr' && hasErrors) && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{'\u25CF'}</span>}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              {output && activeTab === 'output' && stdout.trim() && (
                <button onClick={() => handleCopy(stdout, 'output')} className="back-button"
                  style={{ fontSize: '0.7rem', padding: '3px 8px', margin: '3px 6px', borderRadius: 4 }}
                >{copied === 'output' ? 'Copied!' : 'Copy'}</button>
              )}
            </div>

            {/* Output content */}
            <div style={{
              background: '#1a1b26', border: '1px solid #2f3146',
              borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)',
              minHeight: 200, maxHeight: 380, overflow: 'auto',
            }}>
              {error && (
                <div style={{
                  padding: '8px 14px', borderBottom: '1px solid #2f3146',
                  background: 'rgba(247, 118, 142, 0.1)',
                  color: '#f7768e', fontWeight: 500, fontSize: '0.82rem',
                }}>{error}</div>
              )}

              {!output && !error && !running && (
                <div style={{
                  color: '#7982a9', fontSize: '0.82rem', textAlign: 'center',
                  padding: '44px 16px', fontFamily: "'JetBrains Mono', monospace",
                }}>
                  Click <strong style={{ color: '#9ece6a' }}>Run</strong> or press <span style={{ color: '#7aa2f7' }}>Ctrl+Enter</span>
                  <div style={{ marginTop: 6, fontSize: '0.72rem', opacity: 0.5 }}>Pick a template to get started</div>
                </div>
              )}

              {running && (
                <div style={{
                  color: '#7982a9', fontSize: '0.82rem', textAlign: 'center',
                  padding: '44px 16px', fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <span style={{
                    display: 'inline-block', width: 12, height: 12,
                    border: '2px solid #2f3146', borderTopColor: '#7aa2f7',
                    borderRadius: '50%', animation: 'lcspin 0.5s linear infinite',
                    verticalAlign: 'middle', marginRight: 6,
                  }} />
                  Executing...
                </div>
              )}

              {output && activeTab === 'output' && (
                <div style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {stdout.trim() ? (
                    <pre style={{ margin: 0, color: '#c0caf5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{stdout}</pre>
                  ) : !hasErrors ? (
                    <div style={{ color: '#7982a9', textAlign: 'center', padding: '18px 0' }}>No output</div>
                  ) : (
                    <div style={{ color: '#7982a9', textAlign: 'center', padding: '18px 0' }}>No standard output</div>
                  )}
                </div>
              )}

              {output && activeTab === 'stderr' && (
                <div style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {stderr.trim() ? (
                    <pre style={{ margin: 0, color: '#f7768e', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{stderr}</pre>
                  ) : (
                    <div style={{ color: '#7982a9', textAlign: 'center', padding: '18px 0' }}>No errors</div>
                  )}
                </div>
              )}

              {output && activeTab === 'compiler' && (
                <div style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {stderr.trim() ? (
                    <pre style={{ margin: 0, color: '#e0af68', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{stderr}</pre>
                  ) : (
                    <div style={{ color: '#7982a9', textAlign: 'center', padding: '18px 0' }}>No compiler output</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          marginTop: 8, marginBottom: 0, padding: '6px 14px',
          background: '#16161e', border: '1px solid #2f3146', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.72rem',
          color: '#565f89', fontFamily: "'JetBrains Mono', monospace", flexWrap: 'wrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{lang?.icon}</span>
            <span style={{ color: '#7982a9' }}>{lang?.name}</span>
          </span>
          <span style={{ color: '#3b3f5c' }}>|</span>
          <span>
            {available === true && <span style={{ color: '#9ece6a' }}>{'\u25CF'}</span>}
            {available === false && <span style={{ color: '#e0af68' }}>{'\u25CF'}</span>}
            {available === undefined && <span style={{ color: '#565f89' }}>{'\u25CB'}</span>}
            {' '}{available === true ? 'Ready' : available === false ? 'Missing tools' : 'Checking...'}
          </span>
          <span style={{ color: '#3b3f5c' }}>|</span>
          <span>
            {lastRunTimeMs != null ? `${lastRunTimeMs}ms` : '--'}
          </span>
          {lastExitCode != null && <>
            <span style={{ color: '#3b3f5c' }}>|</span>
            <span style={{ color: lastExitCode === 0 ? '#9ece6a' : '#f7768e' }}>
              exit {lastExitCode}
            </span>
          </>}
          {output?.status && <>
            <span style={{ color: '#3b3f5c' }}>|</span>
            <span style={{ color: statusDotColor }}>{output.status}</span>
          </>}
        </div>

        <style>{`
          @keyframes lcspin { to { transform: rotate(360deg); } }
          @media (max-width: 720px) {
            .lc-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      {/* Snippets modal */}
      {showSnippets && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowSnippets(false)}>
          <div style={{
            background: 'var(--clr-surface)', borderRadius: 'var(--radius)',
            padding: '24px', minWidth: 300, maxWidth: 460, maxHeight: '70vh', overflow: 'auto',
            border: '1px solid var(--clr-border)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>{'\uD83D\uDCCB'} Saved Snippets</h3>
            {snippets.length === 0 && (
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem' }}>
                No saved snippets yet. Write code and click Save.
              </p>
            )}
            {snippets.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderBottom: '1px solid var(--clr-border)', fontSize: '0.82rem',
              }}>
                <span style={{ flex: 1, cursor: 'pointer' }} onClick={() => loadSnippet(s)}>
                  <strong>{s.name}</strong>
                  <span style={{ color: 'var(--clr-text-soft)', marginLeft: 6, fontSize: '0.72rem' }}>
                    {LANGUAGES.find(l => l.key === s.langKey)?.icon} {s.langKey}
                  </span>
                </span>
                <button onClick={() => deleteSnippet(i)} style={{
                  background: 'transparent', border: 'none', color: '#f7768e',
                  cursor: 'pointer', fontSize: '0.85rem', padding: '2px 6px',
                }}>{'\u2716'}</button>
              </div>
            ))}
            <button onClick={() => setShowSnippets(false)} className="back-button"
              style={{ marginTop: 12, padding: '6px 16px', fontSize: '0.85rem', width: '100%', textAlign: 'center' }}
            >Close</button>
          </div>
        </div>
      )}

      {/* Save dialog */}
      {showSaveDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowSaveDialog(false)}>
          <div style={{
            background: 'var(--clr-surface)', borderRadius: 'var(--radius)',
            padding: '24px', minWidth: 300, border: '1px solid var(--clr-border)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>{'\uD83D\uDCBE'} Save Snippet</h3>
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Snippet name..."
              autoFocus
              style={{
                width: '100%', padding: '8px 12px', fontSize: '0.9rem', boxSizing: 'border-box',
                background: 'var(--clr-surface)', color: 'var(--clr-text)',
                border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', marginBottom: 12,
              }}
              onKeyDown={e => e.key === 'Enter' && saveSnippet()}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSaveDialog(false)} className="back-button"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={saveSnippet} className="back-button"
                style={{ padding: '6px 14px', fontSize: '0.85rem', background: '#9ece6a', color: '#1a1b26', fontWeight: 600 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1002,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowShortcuts(false)}>
          <div style={{
            background: 'var(--clr-surface)', borderRadius: 'var(--radius)',
            padding: '24px', minWidth: 300, border: '1px solid var(--clr-border)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>{'\u2328'} Keyboard Shortcuts</h3>
            <div style={{ fontSize: '0.85rem', lineHeight: 2 }}>
              {[
                ['Ctrl+Enter', 'Run code'],
                ['Ctrl+S', 'Save snippet'],
                ['Tab', 'Indent (2 spaces)'],
              ].map(([key, desc]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', padding: '4px 0' }}>
                  <kbd style={{
                    background: '#1a1b26', padding: '2px 8px', borderRadius: 4,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
                    border: '1px solid #2f3146', color: '#7aa2f7',
                  }}>{key}</kbd>
                  <span style={{ color: 'var(--clr-text-soft)' }}>{desc}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="back-button"
              style={{ marginTop: 12, padding: '6px 16px', fontSize: '0.85rem', width: '100%', textAlign: 'center' }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
