import React from 'react';
import CandyPiece from './CandyPiece';
import { IconCandy } from './DivisionIcons';
import candyJarLidImg from '../../../assets/candy-jar-lid.png';

/**
 * DivisionJar Component
 * Visual glass container for candies with realistic wooden lid,
 * glass reflections, count badge, drag-and-drop distribution source,
 * and return drop target.
 */
export default function DivisionJar({
  count,
  isSelected,
  onSelect,
  isRemainderPhase = false,
  disabled = false,
  onPointerDownCandy,
  isHoveredDrop = false
}) {
  const hasCandies = count > 0;
  const canInteract = !disabled && hasCandies;

  const handlePointerDown = (e) => {
    if (!canInteract || !onPointerDownCandy) return;
    onPointerDownCandy(e);
  };

  return (
    <div
      className="division-jar-container"
      data-drop-jar="true"
    >
      <div
        className={`division-jar ${canInteract ? 'interactive' : ''} ${isSelected ? 'selected-source' : ''} ${isHoveredDrop ? 'drop-target-active' : ''} ${isRemainderPhase ? 'jar-remainder-glow' : ''}`}
        onClick={canInteract ? onSelect : undefined}
        onPointerDown={canInteract ? handlePointerDown : undefined}
        onDragStart={(e) => e.preventDefault()}
        data-drop-jar="true"
        role="button"
        tabIndex={canInteract ? 0 : -1}
        onKeyDown={(e) => {
          if (canInteract && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect && onSelect();
          }
        }}
        aria-label={`Candy jar with ${count} candies remaining`}
        title={canInteract ? 'Drag a candy to a friend!' : (count === 0 ? 'Jar is empty' : 'Jar')}
      >
        {/* Realistic Wooden Lid with Spherical Knob */}
        <div className="division-jar-lid-wrap" data-drop-jar="true">
          <img
            src={candyJarLidImg}
            alt="Candy jar wooden lid"
            draggable={false}
            className="division-jar-lid-img"
            data-drop-jar="true"
          />
        </div>

        {/* Glass Specular Reflection Highlight */}
        <div className="division-jar-glass-shine" data-drop-jar="true" />

        {/* Jar Count Badge */}
        <div className="division-jar-badge" data-drop-jar="true">
          <IconCandy size={20} />
          <span className="jar-count-num" data-drop-jar="true">{count}</span>
        </div>

        {/* Candies Pool inside the Jar */}
        <div
          className="division-candies-pool"
          data-drop-jar="true"
          onPointerDown={canInteract ? handlePointerDown : undefined}
        >
          {Array.from({ length: Math.min(count, 20) }, (_, i) => (
            <CandyPiece
              key={i}
              size={46}
              isLeftover={isRemainderPhase}
              interactive={canInteract}
              onPointerDown={canInteract ? handlePointerDown : undefined}
              title="Drag me to a friend!"
              className="jar-candy-item"
            />
          ))}
          {count === 0 && (
            <div className="jar-empty-label" data-drop-jar="true">
              Empty
            </div>
          )}
        </div>

        {/* Glass Base Rim Highlight */}
        <div className="division-jar-base-rim" data-drop-jar="true" />

        {/* Drag Hint on Jar when candies available */}
        {canInteract && (
          <div className="jar-drag-prompt" data-drop-jar="true">
            <span>DRAG ↕ TAP</span>
          </div>
        )}
      </div>
    </div>
  );
}
