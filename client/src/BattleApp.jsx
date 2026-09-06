import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function BattleApp({ topic, onBack }) {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('connecting'); // connecting, waiting, playing, game_over
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [winner, setWinner] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
  const [roomCode, setRoomCode] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    // Connect to backend websocket
    const newSocket = io({ path: '/socket.io' });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setMyId(newSocket.id);
      setStatus('waiting');
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      setRoomCode(code);
      newSocket.emit('join_match', { topic });
    });

    newSocket.on('match_found', (data) => {
      setRoomId(data.roomId);
      setPlayers({
        [data.p1]: { id: data.p1, score: 0 },
        [data.p2]: { id: data.p2, score: 0 }
      });
      setStatus('playing');
    });

    newSocket.on('new_question', (q) => {
      setQuestion(q);
      setAnswerInput('');
      setFeedback(null);
    });

    newSocket.on('score_update', (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setFeedback('correct');
    });

    newSocket.on('answer_incorrect', () => {
      setFeedback('incorrect');
    });

    newSocket.on('game_over', (data) => {
      setPlayers(data.players);
      setWinner(data.winner);
      setStatus('game_over');
    });

    newSocket.on('opponent_disconnected', () => {
      setStatus('opponent_disconnected');
    });

    return () => newSocket.disconnect();
  }, [topic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerInput.trim() || status !== 'playing') return;
    
    socket.emit('submit_answer', { roomId, answer: answerInput });
  };

  if (status === 'connecting') {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2>Connecting to Battle Server...</h2>
        <button className="btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>Cancel</button>
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2>{isPrivate ? 'Waiting for Friend...' : 'Searching for Opponent...'}</h2>
        <div className="spinner" style={{ margin: '1rem' }}>Loading...</div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn-primary" onClick={() => socket.emit('start_bot_match', { topic, roomCode: isPrivate ? roomCode : null })}>
            Play against Bot
          </button>
          <button className="btn-secondary" onClick={onBack}>Cancel</button>
        </div>

        {!isPrivate && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Play with a Friend</h3>
            <button className="btn-secondary" onClick={() => {
              setIsPrivate(true);
              // Send join_match again to override the public queue entry with a private one
              socket.emit('join_match', { topic, roomCode });
            }}>
              Create Private Room
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <input 
                type="text" 
                placeholder="Friend's Code" 
                value={friendCode}
                onChange={e => setFriendCode(e.target.value.toUpperCase())}
                style={{ padding: '0.5rem', width: '120px', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
              <button className="btn-secondary" onClick={() => {
                if (friendCode.trim()) {
                  setIsPrivate(true);
                  socket.emit('join_match', { topic, roomCode: friendCode.trim() });
                }
              }}>
                Join
              </button>
            </div>
          </div>
        )}

        {isPrivate && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ margin: '0' }}>Share this code with your friend:</p>
            <h1 style={{ fontSize: '3rem', margin: '0.5rem 0', letterSpacing: '4px', color: 'var(--primary)' }}>{roomCode}</h1>
          </div>
        )}
      </div>
    );
  }

  if (status === 'opponent_disconnected') {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2>Opponent Disconnected!</h2>
        <p>You win by default!</p>
        <button className="btn-primary" onClick={onBack} style={{ marginTop: '2rem' }}>Back to Home</button>
      </div>
    );
  }

  if (status === 'game_over') {
    const isWinner = winner === myId;
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h1>Game Over!</h1>
        <h2 style={{ color: isWinner ? 'var(--success)' : 'var(--danger)', fontSize: '2rem', margin: '1rem 0' }}>
          {isWinner ? '🎉 You Won! 🎉' : '💀 You Lost! 💀'}
        </h2>
        <div className="score-summary" style={{ display: 'flex', gap: '2rem', margin: '2rem 0', fontSize: '1.5rem' }}>
          {Object.values(players).map(p => (
            <div key={p.id} style={{ fontWeight: p.id === myId ? 'bold' : 'normal' }}>
              {p.id === myId ? 'You' : (p.id === 'BOT' ? 'Bot' : 'Opponent')}: {p.score}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={onBack}>Back to Home</button>
      </div>
    );
  }

  // Find opponent ID
  const opponent = Object.values(players).find(p => p.id !== myId);
  const myScore = players[myId] ? players[myId].score : 0;
  const oppScore = opponent ? opponent.score : 0;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="header-nav" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <button className="btn-secondary" onClick={onBack}>Surrender</button>
        <div style={{ fontWeight: 'bold' }}>Live Battle: {topic}</div>
        <div style={{ width: '80px' }}></div>
      </div>

      {/* Score Trackers */}
      <div style={{ display: 'flex', padding: '1rem', gap: '1rem' }}>
        <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '2px solid var(--primary)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>You</div>
          <div style={{ fontSize: '2rem', color: 'var(--primary)' }}>{myScore} / 10</div>
          <div style={{ width: '100%', height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${(myScore / 10) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '2px solid var(--danger)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{opponent?.id === 'BOT' ? 'Bot' : 'Opponent'}</div>
          <div style={{ fontSize: '2rem', color: 'var(--danger)' }}>{oppScore} / 10</div>
          <div style={{ width: '100%', height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${(oppScore / 10) * 100}%`, height: '100%', background: 'var(--danger)', transition: 'width 0.3s' }}></div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        {question && (
          <div className="card" style={{ padding: '3rem', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            <h2 
              style={{ fontSize: '2.5rem', margin: '0 0 2rem 0' }}
              dangerouslySetInnerHTML={{ __html: question.prompt || question.text || question.display || 'Loading...' }}
            />
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                autoFocus
                value={answerInput}
                onChange={e => { setAnswerInput(e.target.value); setFeedback(null); }}
                style={{
                  fontSize: '2rem',
                  padding: '1rem',
                  width: '100%',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: feedback === 'incorrect' ? '3px solid var(--danger)' : '3px solid var(--border)',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-primary)'
                }}
                placeholder="Enter answer..."
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '1.5rem', padding: '1rem' }}>Submit</button>
            </form>

            {feedback === 'incorrect' && (
              <div style={{ color: 'var(--danger)', marginTop: '1rem', fontWeight: 'bold', animation: 'shake 0.5s' }}>Incorrect, try again!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
