import React, { useState } from "react";

const puzzles = [
  {
    question: "2, 6, 12, 20, 30, ?",
    hint: "Look at the differences between consecutive numbers.",
    answer: 42,
    explanation:
      "The differences are +4, +6, +8 and +10. The next difference is +12. Therefore, 30 + 12 = 42."
  },
  {
    question: "3, 6, 12, 24, 48, ?",
    hint: "Each number is obtained by multiplying the previous number.",
    answer: 96,
    explanation:
      "Every number is multiplied by 2. Therefore, 48 × 2 = 96."
  },
  {
    question: "1, 4, 9, 16, 25, ?",
    hint: "Think about square numbers.",
    answer: 36,
    explanation:
      "These are square numbers: 1², 2², 3², 4² and 5². The next is 6² = 36."
  },
  {
    question: "5, 9, 15, 23, 33, ?",
    hint: "Observe how the differences increase.",
    answer: 45,
    explanation:
      "The differences are +4, +6, +8 and +10. The next difference is +12. So 33 + 12 = 45."
  },
  {
    question: "2, 5, 10, 17, 26, ?",
    hint: "Compare the numbers with consecutive square numbers.",
    answer: 37,
    explanation:
      "The pattern is 1²+1, 2²+1, 3²+1, 4²+1 and 5²+1. The next is 6²+1 = 37."
  },
  {
    question: "81, 27, 9, 3, ?",
    hint: "What happens when you divide by 3?",
    answer: 1,
    explanation:
      "Each number is divided by 3. Therefore, 3 ÷ 3 = 1."
  },
  {
    question: "1, 1, 2, 3, 5, 8, ?",
    hint: "Add the previous two numbers.",
    answer: 13,
    explanation:
      "Each number is the sum of the two numbers before it. Therefore, 5 + 8 = 13."
  },
  {
    question: "7, 14, 12, 24, 22, 44, ?",
    hint: "There are two alternating operations.",
    answer: 42,
    explanation:
      "The operations alternate: multiply by 2, then subtract 2. After 44, subtract 2 to get 42."
  },
  {
    question: "4, 7, 13, 22, 34, ?",
    hint: "Check the differences between consecutive terms.",
    answer: 49,
    explanation:
      "The differences are +3, +6, +9 and +12. The next difference is +15. So 34 + 15 = 49."
  },
  {
    question: "100, 90, 81, 73, 66, ?",
    hint: "The numbers decrease by changing amounts.",
    answer: 60,
    explanation:
      "Subtract 10, then 9, then 8, then 7. The next step is subtracting 6: 66 − 6 = 60."
  },
  {
    question: "2, 3, 5, 8, 12, 17, ?",
    hint: "Look at the increasing differences.",
    answer: 23,
    explanation:
      "The differences are +1, +2, +3, +4 and +5. The next difference is +6. Therefore, 17 + 6 = 23."
  },
  {
    question: "1, 2, 6, 24, 120, ?",
    hint: "The multiplication number increases each time.",
    answer: 720,
    explanation:
      "Multiply by 2, then 3, then 4, then 5. The next step is ×6: 120 × 6 = 720."
  },
  {
    question: "11, 22, 21, 42, 41, 82, ?",
    hint: "Look for alternating multiplication and subtraction.",
    answer: 81,
    explanation:
      "The operations alternate: multiply by 2, then subtract 1. After 82, subtract 1 to get 81."
  },
  {
    question: "6, 11, 21, 41, 81, ?",
    hint: "Try multiplying by 2 and then subtracting 1.",
    answer: 161,
    explanation:
      "Each term follows the rule ×2 − 1. Therefore, 81 × 2 − 1 = 161."
  },
  {
    question: "1, 8, 27, 64, 125, ?",
    hint: "Think about cube numbers.",
    answer: 216,
    explanation:
      "These are cube numbers: 1³, 2³, 3³, 4³ and 5³. The next is 6³ = 216."
  }
];

const styles = {
  container: {
    maxWidth: "680px",
    margin: "30px auto",
    padding: "24px",
    borderRadius: "18px",
    background: "#ffffff",
    boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    color: "#243047"
  },
  button: {
    padding: "12px 22px",
    margin: "8px",
    border: "none",
    borderRadius: "9px",
    background: "#3157d5",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px"
  },
  input: {
    padding: "13px",
    width: "65%",
    maxWidth: "280px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    fontSize: "17px"
  }
};

export default function NumberPatternDetective() {
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const puzzle = puzzles[current];
  const progress = ((current + 1) / puzzles.length) * 100;

  function checkAnswer() {
    if (answer.trim() === "") {
      setResult("empty");
      return;
    }

    if (Number(answer) === puzzle.answer) {
      setResult("correct");
      setScore((previous) => previous + 1);
    } else {
      // The solution is shown immediately by the wrong-answer screen below.
      setResult("wrong");
    }
  }

  function nextPuzzle() {
    if (current === puzzles.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrent((previous) => previous + 1);
    setAnswer("");
    setHintVisible(false);
    setResult("");
  }

  function restartGame() {
    setCurrent(0);
    setAnswer("");
    setHintVisible(false);
    setResult("");
    setScore(0);
    setCompleted(false);
  }

  if (completed) {
    return (
      <main style={styles.container}>
        <h1>🏆 Detective Mission Completed!</h1>
        <h2>Your Score: {score} / {puzzles.length}</h2>
        <p>
          {score >= 12
            ? "Excellent detective work!"
            : score >= 8
              ? "Great effort! Keep practising."
              : "Good attempt! Keep exploring number patterns."}
        </p>
        <button style={styles.button} onClick={restartGame}>
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1>🔍 Number Pattern Detective</h1>
      <p>Class 8 | CBSE Mathematics</p>

      <p>
        Puzzle {current + 1} of {puzzles.length}
      </p>

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#e5e7eb",
          borderRadius: "10px",
          overflow: "hidden"
        }}
        aria-label={`Progress: ${current + 1} of ${puzzles.length}`}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#3157d5",
            transition: "width 0.2s ease"
          }}
        />
      </div>

      <h2>🕵️ Solve the Mystery!</h2>

      <div
        style={{
          padding: "25px",
          margin: "20px 0",
          borderRadius: "12px",
          background: "#eef3ff",
          fontSize: "25px",
          fontWeight: "bold",
          letterSpacing: "2px"
        }}
      >
        {puzzle.question}
      </div>

      <button
        style={styles.button}
        onClick={() => setHintVisible((visible) => !visible)}
        disabled={Boolean(result)}
      >
        💡 {hintVisible ? "Hide Hint" : "Show Hint"}
      </button>

      {hintVisible && (
        <p
          style={{
            background: "#fff4d6",
            padding: "12px",
            borderRadius: "8px"
          }}
        >
          {puzzle.hint}
        </p>
      )}

      <div style={{ marginTop: "12px" }}>
        <input
          type="number"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            if (result === "empty") setResult("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !result) checkAnswer();
          }}
          placeholder="Enter your answer"
          disabled={Boolean(result)}
          style={styles.input}
          aria-label="Your answer"
        />
      </div>

      {!result && (
        <button style={styles.button} onClick={checkAnswer}>
          Check Answer
        </button>
      )}

      {result === "empty" && (
        <p role="alert" style={{ color: "#b45309" }}>
          Please enter your answer first.
        </p>
      )}

      {result === "correct" && (
        <section
          role="status"
          style={{
            background: "#e5f8e9",
            padding: "16px",
            marginTop: "15px",
            borderRadius: "10px"
          }}
        >
          <h3>🎉 Correct Answer!</h3>
          <p>{puzzle.explanation}</p>
          <button style={styles.button} onClick={nextPuzzle}>
            {current === puzzles.length - 1 ? "Finish Mission" : "Next Puzzle →"}
          </button>
        </section>
      )}

      {result === "wrong" && (
        <section
          role="status"
          style={{
            background: "#fff0ed",
            padding: "20px",
            marginTop: "15px",
            borderRadius: "12px"
          }}
        >
          <h3>❌ Incorrect Answer!</h3>
          <p>Don't worry! Every mistake is a chance to learn.</p>
          <h3>✅ Correct Answer: {puzzle.answer}</h3>
          <h4>📖 Explanation</h4>
          <p>{puzzle.explanation}</p>
          <button style={styles.button} onClick={nextPuzzle}>
            {current === puzzles.length - 1 ? "Finish Mission" : "Next Puzzle →"}
          </button>
        </section>
      )}

      <p style={{ marginTop: "25px" }}>
        ⭐ Score: {score} / {puzzles.length}
      </p>
    </main>
  );
}
