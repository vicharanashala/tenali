import React, { useState, useEffect } from "react";
import "./SpaceMathGame.css";

function SpaceMathGame({ onBack }) {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [rocketX, setRocketX] = useState(window.innerWidth / 2);

  const [enemies, setEnemies] = useState([]);
  const [bullet, setBullet] = useState(null);

  const [message, setMessage] = useState("");

  // -------------------------
  // Generate New Question
  // -------------------------

  function generateQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;

    const correct = a + b;

    let answers = [correct];

    while (answers.length < 4) {
      const wrong = correct + Math.floor(Math.random() * 9) - 4;

      if (wrong > 0 && !answers.includes(wrong)) {
        answers.push(wrong);
      }
    }

    answers.sort(() => Math.random() - 0.5);

    setQuestion({
      a,
      b,
      correct,
    });

    setOptions(answers);

    setEnemies(
      answers.map((answer, index) => ({
        id: index,
        value: answer,
        x: 140 + index * 180,
        y: 120,
      }))
    );

    setBullet(null);
    setMessage("");
  }

  // -------------------------
  // Start Game
  // -------------------------

  useEffect(() => {
    generateQuestion();
  }, []);

  // -------------------------
  // Mouse Movement
  // -------------------------

  useEffect(() => {
    const moveRocket = (event) => {
      setRocketX(event.clientX);
    };

    window.addEventListener("mousemove", moveRocket);

    return () => {
      window.removeEventListener("mousemove", moveRocket);
    };
  }, []);

  // -------------------------
  // Space Bar Shoot
  // -------------------------

  useEffect(() => {
    const shoot = (event) => {
      if (event.code === "Space") {
        event.preventDefault();

        if (!bullet) {
          setBullet({
            x: rocketX,
            y: window.innerHeight - 120,
          });
        }
      }
    };

    window.addEventListener("keydown", shoot);

    return () => {
      window.removeEventListener("keydown", shoot);
    };
  }, [rocketX, bullet]);

  // -------------------------
  // Bullet Animation
  // -------------------------

  useEffect(() => {
    if (!bullet) return;

    const timer = setInterval(() => {
      setBullet((prev) => {
        if (!prev) return null;

        if (prev.y < 0) return null;

        return {
          ...prev,
          y: prev.y - 18,
        };
      });
    }, 20);

    return () => clearInterval(timer);
  }, [bullet]);

  // -------------------------
  // Enemy Falling
  // -------------------------

  useEffect(() => {
    const timer = setInterval(() => {
      setEnemies((prev) =>
        prev.map((enemy) => ({
          ...enemy,
          y: enemy.y + 1.2,
        }))
      );
    }, 35);

    return () => clearInterval(timer);
  }, []);

  // -------------------------
  // Collision Detection
  // -------------------------

  useEffect(() => {
    if (!bullet) return;

    enemies.forEach((enemy) => {
      if (
        Math.abs(enemy.x - bullet.x) < 45 &&
        Math.abs(enemy.y - bullet.y) < 45
      ) {
        if (enemy.value === question.correct) {
          setScore((s) => s + 1);
          setMessage("✅ Correct!");

          setBullet(null);

          setTimeout(() => {
            generateQuestion();
          }, 700);
        } else {
          setScore((s) => s - 1);
          setMessage("❌ Wrong Enemy");
          setBullet(null);
        }
      }
    });
  }, [bullet, enemies, question]);

  // -------------------------
  // Enemy reaches bottom
  // -------------------------

  useEffect(() => {
    enemies.forEach((enemy) => {
      if (enemy.y > window.innerHeight - 180) {
        setLives((l) => Math.max(0, l - 1));
        generateQuestion();
      }
    });
  }, [enemies]);

  function handleAnswer(answer) {
    if (answer === question.correct) {
      setScore((s) => s + 1);
      generateQuestion();
    } else {
      setScore((s) => Math.max(0, s - 1));
      setMessage("Wrong!");
    }
  }

  return (
  <div className="space-game">
    <div ClassName="game-frame">

    {/* Back Button */}
    <button
      onClick={onBack}
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        padding: "10px 18px",
        border: "none",
        borderRadius: "8px",
        background: "#ff9800",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      ← Back
    </button>

    {/* HUD */}
    <div
  style={{
    position: "absolute",
    top: 20,
    left: 140,
    color: "white",
    fontSize: "26px",
    fontWeight: "bold",
    zIndex: 1000,
  }}
>
  🏆 Score: {score}
</div>

<div
  style={{
    position: "absolute",
    top: 20,
    right: 30,
    color: "white",
    fontSize: "26px",
    fontWeight: "bold",
    zIndex: 1000,
  }}
>
  ❤️ {lives}
</div>

    {/* Question */}
    {question && (
      <div
        style={{
  position: "absolute",
  top: 40,
  left: "50%",
  transform: "translateX(-50%)",

  width: "90%",

  textAlign: "center",

  color: "white",

  fontSize: "36px",

  fontWeight: "bold",

  textShadow: "0 0 12px cyan",

  zIndex: 100,
}}
      >
        {question.a} + {question.b} = ?
      </div>
    )}

    {/* Enemy Spaceships */}
    {enemies.map((enemy) => (
      <div
        key={enemy.id}
        style={{
          position: "absolute",
          left: enemy.x,
          top: enemy.y,
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "55px",
          }}
        >
          👾
        </div>

        <div
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "22px",
            marginTop: "-8px",
          }}
        >
          {enemy.value}
        </div>
      </div>
    ))}

    {/* Bullet */}
    {bullet && (
      <div
        style={{
          position: "absolute",
          left: bullet.x,
          top: bullet.y,
          transform: "translateX(-50%)",
          fontSize: "28px",
        }}
      >
        🔥
      </div>
    )}

    {/* Rocket */}
    <div
      className="player-rocket"
      style={{
        left: rocketX,
      }}
    >
      🚀
    </div>

    {/* Message */}
    {message && (
      <div
        style={{
          position: "absolute",
          bottom: 110,
          width: "100%",
          textAlign: "center",
          color: "yellow",
          fontWeight: "bold",
          fontSize: "28px",
        }}
      >
        {message}
      </div>
    )}

    {/* Controls */}
    <div
      style={{
        position: "absolute",
        bottom: 20,
        width: "100%",
        textAlign: "center",
        color: "#ddd",
        fontSize: "18px",
      }}
    >
      🖱 Move Mouse to Control Rocket &nbsp;&nbsp; | &nbsp;&nbsp;
      Press <b>SPACE</b> to Shoot
    </div>
    </div>

  </div>
);

}

export default SpaceMathGame;

