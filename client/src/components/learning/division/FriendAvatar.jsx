import React from 'react';
import rohanHappy from '../../../assets/friends/rohan-happy.png';
import rohanNeutral from '../../../assets/friends/rohan-neutral.png';
import rohanSad from '../../../assets/friends/rohan-sad.png';

import priyaHappy from '../../../assets/friends/priya-happy.png';
import priyaNeutral from '../../../assets/friends/priya-neutral.png';
import priyaSad from '../../../assets/friends/priya-sad.png';

import samHappy from '../../../assets/friends/sam-happy.png';
import samNeutral from '../../../assets/friends/sam-neutral.png';
import samSad from '../../../assets/friends/sam-sad.png';

import mayaHappy from '../../../assets/friends/maya-happy.png';
import mayaNeutral from '../../../assets/friends/maya-neutral.png';
import mayaSad from '../../../assets/friends/maya-sad.png';

import leoHappy from '../../../assets/friends/leo-happy.png';
import leoNeutral from '../../../assets/friends/leo-neutral.png';
import leoSad from '../../../assets/friends/leo-sad.png';

/**
 * FriendAvatar Component
 * Renders individual high-resolution character sprites with transparent backgrounds
 * supporting three distinct emotional states: 'neutral', 'happy', and 'sad'.
 */
const CHARACTERS = {
  rohan: { happy: rohanHappy, neutral: rohanNeutral, sad: rohanSad },
  priya: { happy: priyaHappy, neutral: priyaNeutral, sad: priyaSad },
  sam: { happy: samHappy, neutral: samNeutral, sad: samSad },
  maya: { happy: mayaHappy, neutral: mayaNeutral, sad: mayaSad },
  leo: { happy: leoHappy, neutral: leoNeutral, sad: leoSad },
  '0': { happy: rohanHappy, neutral: rohanNeutral, sad: rohanSad },
  '1': { happy: priyaHappy, neutral: priyaNeutral, sad: priyaSad },
  '2': { happy: samHappy, neutral: samNeutral, sad: samSad },
  '3': { happy: mayaHappy, neutral: mayaNeutral, sad: mayaSad },
  '4': { happy: leoHappy, neutral: leoNeutral, sad: leoSad },
  boy1: { happy: rohanHappy, neutral: rohanNeutral, sad: rohanSad },
  girl1: { happy: priyaHappy, neutral: priyaNeutral, sad: priyaSad },
  boy2: { happy: samHappy, neutral: samNeutral, sad: samSad },
  girl2: { happy: mayaHappy, neutral: mayaNeutral, sad: mayaSad },
  boy3: { happy: leoHappy, neutral: leoNeutral, sad: leoSad }
};

export default function FriendAvatar({
  characterId = 'maya',
  emotion = 'neutral',
  size = 110,
  className = ''
}) {
  const isHappy = emotion === 'happy';
  const isSad = emotion === 'sad';

  const key = String(characterId).toLowerCase().trim();
  const char = CHARACTERS[key] || CHARACTERS.maya;
  const imgSrc = isHappy ? char.happy : (isSad ? char.sad : char.neutral);

  const frameWidth = size;
  const frameHeight = Math.round(size * 0.88);

  const haloClass = isHappy ? 'halo-happy' : (isSad ? 'halo-sad' : 'halo-neutral');
  const animClass = isHappy ? 'avatar-happy' : (isSad ? 'avatar-sad' : 'avatar-neutral');

  return (
    <div
      className={`division-avatar-container ${animClass} ${className}`}
      style={{
        width: frameWidth,
        height: frameHeight
      }}
      role="img"
      aria-label={`${characterId} feeling ${emotion}`}
    >
      {/* Dynamic Halo Glow Ring */}
      <div
        className={`friend-avatar-halo ${haloClass}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          boxSizing: 'border-box'
        }}
      >
        <img
          src={imgSrc}
          alt={`${characterId} ${emotion}`}
          draggable={false}
          className="friend-sprite-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))'
          }}
        />
      </div>
    </div>
  );
}
