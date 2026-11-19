import React from 'react';

/**
 * Connected room progress dots supporting 3, 5, and 7 rooms cleanly without overflowing at 375px.
 */
export default function RoomProgress({ roomsState = [], currentRoomIndex = 0 }) {
  if (!roomsState.length) return null;

  return (
    <nav className="room-progress" aria-label="Escape room progress">
      <span className="room-progress-label">Rooms</span>
      <div className="room-progress-track">
        {roomsState.map((room, index) => {
          const isSolved = room.solved;
          const isActive = index === currentRoomIndex;
          const isLast = index === roomsState.length - 1;

          const dotClass = [
            'room-progress-dot',
            isSolved ? 'room-progress-dot--solved' : '',
            isActive ? 'room-progress-dot--active' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const statusText = isSolved
            ? 'Solved'
            : isActive
              ? 'Current room'
              : 'Locked';

          return (
            <div
              key={room.roomConfig.id}
              className={`room-progress-step ${!isLast ? 'room-progress-step--connected' : ''}`}
            >
              <span
                className={dotClass}
                title={`Room ${room.roomConfig.roomNumber}: ${room.roomConfig.name} (${statusText})`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Room ${room.roomConfig.roomNumber}: ${statusText}`}
              >
                {isSolved ? '✓' : room.roomConfig.roomNumber}
              </span>
              {!isLast && (
                <span
                  className={`room-progress-line ${isSolved ? 'room-progress-line--solved' : ''}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}