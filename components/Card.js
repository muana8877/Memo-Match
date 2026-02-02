// components/Card.js
import React from "react";

export default function Card({ card, flipped, handleClick, disabled }) {
    return (
        <>
                <button
            className={`card ${flipped ? "flipped" : ""} ${card.matched ? "matched" : ""}`}
            onClick={() => !disabled && handleClick(card)}
            aria-pressed={flipped}
            aria-label={flipped ? `card ${card.content}` : "hidden card"}
        >
            <div className="card-inner">
                <div className="card-front">
                    <img src="/heart.png" alt="Card Back" style={{ width: '40%', height: '40%' }} />
                </div>
                <div className="card-back">{card.content}</div>
            </div>
        </button>
        <style jsx>{`
        .card {
          width: 100%;
          max-width: 120px;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          perspective: 1000px;
          background: transparent;
          padding: 0;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 10px;
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }

        .card.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          backface-visibility: hidden;
          border-radius: 10px;
          font-size: 32px;
        }

        .card-front {
          background: #ffddb9ff;
          color: white;
        }

        .card-back {
          background: #DFB2FF;
          transform: rotateY(180deg);
          
        }
          .card.matched {
            animation: matchPop 0.6s ease;
            pointer-events: none; /* matched cards can't be clicked */
            }

            @keyframes matchPop {
            0% {
                transform: scale(1);

            }
            30% {
                transform: scale(1.3) rotate(5deg);
            }
            60% {
                transform: scale(1.1) rotate(-5deg);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0px transparent;
            }
            }

      `}</style>
        </>

    );
}
