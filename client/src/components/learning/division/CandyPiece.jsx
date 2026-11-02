import React from 'react';
import candyImg from '../../../assets/candy.png';

/**
 * CandyPiece Component
 * Renders the new transparent high-res blue-wrapper candy asset.
 * TouchAction: none and draggable: false prevent browser native drag interference.
 */
export default function CandyPiece({
  size = 48,
  isLeftover = false,
  isDragging = false,
  onClick,
  onPointerDown,
  title = 'Candy piece',
  interactive = true,
  className = ''
}) {
  // Exact aspect ratio of cropped candy: 1024 x 457 (2.24 : 1)
  const width = size;
  const height = Math.round(size * (457 / 1024));

  return (
    <div
      className={`division-candy-piece-wrap ${isLeftover ? 'leftover-glow' : ''} ${isDragging ? 'dragging-ghost' : ''} ${interactive ? 'interactive' : ''} ${className}`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      title={title}
      style={{
        width,
        height,
        touchAction: 'none',
        userSelect: 'none',
        pointerEvents: isDragging ? 'none' : 'auto',
        cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img
        src={candyImg}
        alt="Candy"
        draggable={false}
        className="division-candy-img"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
          filter: isDragging
            ? 'drop-shadow(0 10px 18px rgba(0,0,0,0.5))'
            : (isLeftover ? 'drop-shadow(0 0 10px #f59e0b)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.22))')
        }}
      />
    </div>
  );
}
