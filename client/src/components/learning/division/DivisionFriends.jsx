import React from 'react';
import FriendAvatar from './FriendAvatar';
import CandyPiece from './CandyPiece';
import { IconLock, IconHand } from './DivisionIcons';

/**
 * DivisionFriends Component
 * Renders the row of friends with the new sprite avatars, dynamic emotion feedback,
 * lock status indicators, and interactive ceramic plates that serve as drag-and-drop targets.
 */
export default function DivisionFriends({
  friends,
  counts,
  emotions,
  isLocked,
  onGiveCandy,
  onReturnCandy,
  jarSelected,
  hoveredFriendIdx = null,
  isDraggingFromJar = false,
  onPlateCandyPointerDown,
  disabled = false,
  isFreeMode = false
}) {
  // Enlarged friend avatars for prominent, clear expressions
  const avatarSize = friends.length <= 2 ? 116 : (friends.length === 3 ? 106 : 96);

  return (
    <div className="division-friends-container">
      {friends.map((friend, idx) => {
        const count = counts[idx] || 0;
        const emotion = emotions[idx] || 'happy';
        const locked = !isFreeMode && isLocked ? isLocked(idx) : false;
        const canReceive = !disabled && !locked;
        const isHovered = hoveredFriendIdx === idx;

        let dragTargetClass = '';
        if (isDraggingFromJar && isHovered) {
          dragTargetClass = canReceive ? 'drag-target-valid' : 'drag-target-invalid';
        } else if (jarSelected && canReceive) {
          dragTargetClass = 'highlight-target';
        }

        return (
          <div
            key={idx}
            className={`division-friend-card ${canReceive ? 'ready-to-receive' : 'locked'} ${dragTargetClass}`}
            data-friend-index={idx}
            onClick={() => {
              if (canReceive && onGiveCandy) {
                onGiveCandy(idx);
              }
            }}
            role="button"
            tabIndex={canReceive ? 0 : -1}
            onKeyDown={(e) => {
              if (canReceive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onGiveCandy && onGiveCandy(idx);
              }
            }}
            aria-label={`${friend.name}: ${count} candies, feeling ${emotion}. ${locked ? 'Locked' : 'Ready'}`}
            title={canReceive ? `Drop candy or click to give to ${friend.name}` : `${friend.name} is waiting for other friends`}
          >
            {/* New Sprite Avatar */}
            <div className="division-avatar-wrapper" data-friend-index={idx}>
              <FriendAvatar
                characterId={friend.characterId || friend.name}
                emotion={emotion}
                size={avatarSize}
              />
            </div>

            {/* Turn / Lock Status Indicator (only shown in guided turn-taking exact section) */}
            {!isFreeMode && (
              <div className={`division-lock-indicator ${locked ? 'locked' : 'unlocked'}`} data-friend-index={idx}>
                {locked ? (
                  <>
                    <IconLock size={14} locked={true} />
                    <span>Wait</span>
                  </>
                ) : (
                  <>
                    <IconHand size={14} />
                    <span>Ready</span>
                  </>
                )}
              </div>
            )}

            {/* Ceramic Plate with Candies (Drop zone & Click-to-return) */}
            <div
              className={`division-plate ${canReceive ? 'plate-ready' : 'plate-locked'} ${isDraggingFromJar && canReceive ? 'plate-drop-zone' : ''}`}
              data-friend-index={idx}
              data-plate-index={idx}
              aria-label={`${friend.name}'s plate with ${count} candies`}
            >
              <div className="plate-rim" data-friend-index={idx} />
              <div className="plate-surface" data-friend-index={idx}>
                {Array.from({ length: count }, (_, cIdx) => (
                  <CandyPiece
                    key={cIdx}
                    size={30}
                    interactive={!disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled && onReturnCandy) {
                        onReturnCandy(idx);
                      }
                    }}
                    onPointerDown={
                      !disabled && onPlateCandyPointerDown
                        ? (e) => {
                            e.stopPropagation();
                            onPlateCandyPointerDown(e, idx);
                          }
                        : undefined
                    }
                    title="Click or drag to put back into jar"
                  />
                ))}
                {count === 0 && (
                  <span className="plate-empty-hint" data-friend-index={idx}>
                    Drop here
                  </span>
                )}
              </div>
            </div>

            {/* Plate Count Counter */}
            <div className="division-plate-counter" data-friend-index={idx}>
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
