import Card from '@/components/Card'
import confetti from 'canvas-confetti';
import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'

const EMOJIS = ["🚀", "🧠", "🎨", "⚡️", "💡", "🔒", "📦", "🌟", "📈", "🔧", "🎯", "🧩", "🔥", "🎵", "🌈", "🐱"];

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeDeck(pairCount) {
  const icons = shuffle(EMOJIS).slice(0, pairCount);
  let deck = [];
  icons.forEach((icon, idx) => {
    const a = { id: `${Date.now()}-${Math.random()}-${idx}-a`, pairId: idx, content: icon, matched: false };
    const b = { id: `${Date.now()}-${Math.random()}-${idx}-b`, pairId: idx, content: icon, matched: false };
    deck.push(a, b);
  });
  return shuffle(deck);
}

const index = () => {

  const [difficulty, setDifficulty] = useState("medium");
  const pairCounts = { easy: 6, medium: 10, hard: 15 };
  const [deck, setDeck] = useState([]);
  const [firstChoice, setFirstChoice] = useState(null);
  const [secondChoice, setSecondChoice] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(null);
  const [showWin, setShowWin] = useState(false);
  const BEST_KEY = "memory-best";
  const moveLimits = {
    easy: 20,    // generous
    medium: 25,  // moderate
    hard: 35     // tighter limit since more cards
  };


  const [remainingMoves, setRemainingMoves] = useState(moveLimits[difficulty]);
  const [showLose, setShowLose] = useState(false);

  // init deck when difficulty changes or on new game
  function startNewGame(d = difficulty) {
    const newDeck = makeDeck(pairCounts[d]);
    setDeck(newDeck);
    setFirstChoice(null);
    setSecondChoice(null);
    setDisabled(false);
    setMoves(0);
    setRunning(false);
    setRemainingMoves(moveLimits[d]);
    try {
      const stored = typeof window !== "undefined" && JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
      setBest(stored?.[d] || null);
    } catch (e) {
      setBest(null);
    }
  }

  useEffect(() => {
    startNewGame(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);


  // handle choices
  useEffect(() => {
    if (firstChoice && secondChoice) {
      setDisabled(true);
      setMoves(m => m + 1);
      setRemainingMoves(prev => prev - 1);
      if (firstChoice.pairId === secondChoice.pairId) {
        // match
        setDeck(prev => prev.map(card => {
          if (card.pairId === firstChoice.pairId) return { ...card, matched: true };
          return card;
        }));
        resetTurn();
      } else {
        // not match
        setTimeout(() => {
          resetTurn();
        }, 800);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondChoice]);

  // check for loose
  useEffect(() => {
    if (remainingMoves === 0 && deck.some(c => !c.matched)) {
      setDisabled(true);
      setShowLose(true);
    }
  }, [remainingMoves, deck]);

  // check for win
  useEffect(() => {
    if (deck.length && deck.every(c => c.matched)) {
      setRunning(false);

      // ✅ Show the win popup
      setShowWin(true);
      launchConfetti();

      // Save best
      try {
        const current = { moves, date: new Date().toISOString() };
        const stored = typeof window !== "undefined" && JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
        const prev = stored?.[difficulty];
        let shouldSave = false;
        if (!prev) shouldSave = true;
        else if (moves < prev.moves) shouldSave = true;
        if (shouldSave) {
          const next = { ...(stored || {}), [difficulty]: current };
          localStorage.setItem(BEST_KEY, JSON.stringify(next));
          setBest(current);
        }
      } catch (e) {
        // localStorage unavailable, skip saving
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck]);

  function launchConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  function resetTurn() {
    setFirstChoice(null);
    setSecondChoice(null);
    setDisabled(false);
  }

  function handleCardClick(clickedCard) {
    if (!running) setRunning(true); // start timer on first click
    if (disabled) return;
    if (firstChoice && clickedCard.id === firstChoice.id) return; // same card
    if (!firstChoice) {
      setFirstChoice(clickedCard);
    } else if (!secondChoice) {
      setSecondChoice(clickedCard);
    }
  }

  function getFlipped(card) {
    return card.matched || card.id === firstChoice?.id || card.id === secondChoice?.id;
  }

  return (
    <>
      <Head>
        <title>Memo-Match</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎀</text></svg>"
        />
      </Head>
      <main className='container'>
        <div className='board-top'>

          <h1>Memo-Match 🎀</h1>

          <section className='controls'>
            <div>
              <label>
                Difficulty:
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option value="easy">Easy (6 pairs)</option>
                  <option value="medium">Medium (10 pairs)</option>
                  <option value="hard">Hard (15 pairs)</option>
                </select>
              </label>
              <button className="new-game-btn" onClick={() => startNewGame()}>New Game</button>
            </div>

            <div className='stats'>
              <div>Moves: <strong>{moves}</strong></div>
              <div>Moves Left: <strong>{remainingMoves}</strong></div>
            </div>
          </section>
        </div>

        <section className={`board grid-${pairCounts[difficulty] * 2}`}>
          {deck.map(card => (
            <Card key={card.id}
              card={card}
              flipped={getFlipped(card)}
              handleClick={handleCardClick}
              disabled={disabled || card.matched}
            />
          ))}
        </section>
        {showWin && (
          <div className="overlay">
            <div className="popup">
              <h2>🎉 You Win!</h2>
              <p>You matched all cards in <strong>{moves}</strong> moves.</p>
              <button onClick={() => { setShowWin(false); startNewGame(); }}>
                Play Again
              </button>
            </div>
          </div>
        )}

        {showLose && (
          <div className="overlay">
            <div className="popup">
               <div className="crow">🐦‍⬛</div>
              <h2>😢 You Lost!</h2>
              <p>The crow stole your win and is mocking you 😈</p>
              <button onClick={() => { setShowLose(false); startNewGame() }}>Try Again</button>
            </div>
          </div>
        )}


      </main>
    </>
  )
}

export default index