import React from 'react';
import FriendAvatar from './FriendAvatar';
import CandyPiece from './CandyPiece';
import candyJarLidImg from '../../../assets/candy-jar-lid.png';
import { IconSparkles, IconArrowRight, IconCandy } from './DivisionIcons';

import handCandy1 from '../../../assets/hand-candy-1.png';
import handCandy2 from '../../../assets/hand-candy-2.png';
import handCandy3 from '../../../assets/hand-candy-3.png';
import handCandy4 from '../../../assets/hand-candy-4.png';
import handCandy5 from '../../../assets/hand-candy-5.png';
import handCandy6 from '../../../assets/hand-candy-6.png';
import handCandy7 from '../../../assets/hand-candy-7.png';
import handCandy8 from '../../../assets/hand-candy-8.png';

const HAND_IMAGES = {
  1: handCandy1,
  2: handCandy2,
  3: handCandy3,
  4: handCandy4,
  5: handCandy5,
  6: handCandy6,
  7: handCandy7,
  8: handCandy8
};

function getHandImage(count) {
  if (count <= 0) return handCandy1;
  if (HAND_IMAGES[count]) return HAND_IMAGES[count];
  return handCandy5;
}

/**
 * DivisionEquationView Component
 * Visually derives the mathematical equation from physical sharing:
 * - TOTAL: Jar with total number of toffies
 * - GROUPS: All participating kids images
 * - EACH: Hand holding each friend's toffies (using upper line example)
 * Completely emoji-free and language-accessible.
 */
export default function DivisionEquationView({
  total,
  friendsCount,
  perFriend,
  leftover = 0,
  characterIds,
  onContinue
}) {
  const defaultCharacters = ['maya', 'rohan', 'priya', 'leo', 'sam'];
  const effectiveCharacterIds = (characterIds && characterIds.length >= friendsCount)
    ? characterIds.slice(0, friendsCount)
    : Array.from({ length: friendsCount }, (_, i) => (characterIds && characterIds[i]) || defaultCharacters[i % defaultCharacters.length]);

  const handImg = getHandImage(perFriend);

  return (
    <div className="division-card fade-in">
      <div className="division-celebration-title" style={{ marginTop: 0 }}>
        <IconSparkles size={28} />
        <span>What We Discovered</span>
      </div>

      <div className="division-equation-box">
        {/* Step 1: Visual Breakdown Numbers */}
        <div className="division-breakdown-top-row">
          <div className="breakdown-stat">
            <span className="stat-num dividend-color">{total}</span>
            <span className="stat-label">Total Candies</span>
          </div>
          <span className="breakdown-op">=</span>
          <div className="breakdown-stat">
            <span className="stat-num divisor-color">{friendsCount}</span>
            <span className="stat-label">Friends</span>
          </div>
          <span className="breakdown-op">×</span>
          <div className="breakdown-stat">
            <span className="stat-num quotient-color">{perFriend}</span>
            <span className="stat-label">Each Friend</span>
          </div>
          {leftover > 0 && (
            <>
              <span className="breakdown-op">+</span>
              <div className="breakdown-stat">
                <span className="stat-num remainder-color">{leftover}</span>
                <span className="stat-label">Left in Jar</span>
              </div>
            </>
          )}
        </div>

        {/* Step 2: Visual Representation Cards (Jar = Kids × Hand) */}
        <div className="division-visual-equation-row">
          {/* Card 1: Candy Jar with Total Toffies */}
          <div className="division-equation-card total-jar-card">
            <div className="eq-mini-jar-container">
              <div className="eq-mini-jar-lid-wrap">
                <img
                  src={candyJarLidImg}
                  alt="Candy jar lid"
                  className="eq-mini-jar-lid-img"
                  draggable={false}
                />
              </div>
              <div className="eq-mini-jar-body">
                <div className="eq-mini-jar-shine" />
                <div className="eq-mini-jar-candies">
                  {Array.from({ length: Math.min(total, 12) }, (_, i) => (
                    <CandyPiece key={i} size={16} interactive={false} />
                  ))}
                </div>
              </div>
            </div>
            <div className="eq-card-badge dividend">
              <span>{total}</span>
            </div>
            <span className="division-badge-sublabel">Total</span>
          </div>

          <div className="division-equation-op">=</div>

          {/* Card 2: All the Kids Images (Groups) */}
          <div className="division-equation-card groups-kids-card">
            <div className="eq-kids-container">
              {effectiveCharacterIds.map((charId, idx) => (
                <div key={idx} className="eq-kid-item">
                  <FriendAvatar
                    characterId={charId}
                    emotion="happy"
                    size={friendsCount > 3 ? 48 : 58}
                  />
                </div>
              ))}
            </div>
            <div className="eq-card-badge divisor">
              <span>{friendsCount}</span>
            </div>
            <span className="division-badge-sublabel">Groups</span>
          </div>

          <div className="division-equation-op">×</div>

          {/* Card 3: Hand Holding Toffies (Each Friend) */}
          <div className="division-equation-card each-hand-card">
            <div className="eq-hand-container">
              <img
                src={handImg}
                alt={`${perFriend} toffies in hand`}
                className="eq-hand-img"
                draggable={false}
              />
              {perFriend > 8 && (
                <span className="eq-hand-extra-badge">+{perFriend - 8}</span>
              )}
            </div>
            <div className="eq-card-badge quotient">
              <span>{perFriend}</span>
            </div>
            <span className="division-badge-sublabel">Each</span>
          </div>

          {leftover > 0 && (
            <>
              <div className="division-equation-op">+</div>
              {/* Card 4: Leftover Remainder Jar */}
              <div className="division-equation-card remainder-jar-card">
                <div className="eq-mini-jar-container">
                  <div className="eq-mini-jar-lid-wrap">
                    <img
                      src={candyJarLidImg}
                      alt="Jar lid"
                      className="eq-mini-jar-lid-img"
                      draggable={false}
                    />
                  </div>
                  <div className="eq-mini-jar-body remainder-glow">
                    <div className="eq-mini-jar-shine" />
                    <div className="eq-mini-jar-candies">
                      {Array.from({ length: leftover }, (_, i) => (
                        <CandyPiece key={i} size={16} isLeftover={true} interactive={false} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="eq-card-badge remainder">
                  <span>{leftover}</span>
                </div>
                <span className="division-badge-sublabel">Leftover</span>
              </div>
            </>
          )}
        </div>

        {/* Step 3: Formal Division Equation Notation */}
        <div className="division-equation-notation">
          {total} ÷ {friendsCount} = {perFriend} {leftover > 0 ? `(remainder ${leftover})` : ''}
        </div>
      </div>

      <div className="division-controls-bar">
        <button className="division-action-btn primary" onClick={onContinue}>
          <span>Continue</span>
          <IconArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
